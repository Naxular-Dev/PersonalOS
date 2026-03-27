import type { Sandbox } from '@cloudflare/sandbox';

const BACKUP_DIR = '/home/openclaw';
const HANDLE_KEY = 'backup-handle.json';

// Tracks whether a restore has already happened in this Worker isolate lifetime.
// The FUSE mount is ephemeral — lost when the container sleeps or restarts —
// but within a single isolate we only need to restore once.
let restored = false;

// Debug: track isolate identity
const isolateId = Math.random().toString(36).slice(2, 8);
console.log(`[persistence] Isolate ${isolateId} initialized, restored=${restored}`);

export function clearPersistenceCache(): void {
  console.log(`[persistence][${isolateId}] clearPersistenceCache called, restored was ${restored}`);
  restored = false;
}

async function getStoredHandle(bucket: R2Bucket): Promise<{ id: string; dir: string } | null> {
  const obj = await bucket.get(HANDLE_KEY);
  if (!obj) return null;
  return obj.json();
}

async function storeHandle(bucket: R2Bucket, handle: { id: string; dir: string }): Promise<void> {
  await bucket.put(HANDLE_KEY, JSON.stringify(handle));
}

async function deleteHandle(bucket: R2Bucket): Promise<void> {
  await bucket.delete(HANDLE_KEY);
}

/**
 * Restore the most recent backup if one exists and hasn't been restored yet.
 * Called on every request before proxying to the gateway.
 *
 * The backup handle is read from R2 (persisted across Worker isolate restarts).
 * An in-memory flag prevents redundant restores within the same isolate.
 */
export async function restoreIfNeeded(sandbox: Sandbox, bucket: R2Bucket): Promise<void> {
  if (restored) {
    return;
  }

  console.log(`[persistence][${isolateId}] restoreIfNeeded: restored=${restored}, checking R2...`);

  const handle = await getStoredHandle(bucket);
  if (!handle) {
    console.log(`[persistence][${isolateId}] No backup handle found in R2, skipping restore`);
    restored = true;
    return;
  }

  console.log(`[persistence][${isolateId}] Found handle ${handle.id}, checking mount state...`);

  // Unmount any existing FUSE overlay before restoring. If the Worker isolate
  // recycled, a previous restore's overlay may still be mounted with stale
  // upper-layer state (e.g. deleted files via whiteout entries). A fresh
  // mount from the backup gives us a clean lower layer.
  try {
    const mountCheck = await sandbox.exec(`mount | grep "${BACKUP_DIR}" || echo "NOT_MOUNTED"`);
    console.log(`[persistence][${isolateId}] Mount check: ${mountCheck.stdout?.trim()}`);
    if (mountCheck.stdout && !mountCheck.stdout.includes('NOT_MOUNTED')) {
      console.log(`[persistence][${isolateId}] Unmounting existing overlay...`);
      await sandbox.exec(`umount ${BACKUP_DIR}`);
      console.log(`[persistence][${isolateId}] Unmount successful`);
    }
  } catch (e) {
    console.log(`[persistence][${isolateId}] Mount check/unmount error (non-fatal):`, e);
  }

  console.log(`[persistence][${isolateId}] Restoring backup ${handle.id}...`);
  const t0 = Date.now();
  try {
    await sandbox.restoreBackup(handle);
    const elapsed = Date.now() - t0;
    console.log(`[persistence][${isolateId}] Restore complete in ${elapsed}ms`);

    // Verify the restore actually mounted
    try {
      const verifyMount = await sandbox.exec(
        `mount | grep "${BACKUP_DIR}" && ls ${BACKUP_DIR}/clawd/ 2>&1 || echo "VERIFY_FAILED"`,
      );
      console.log(`[persistence][${isolateId}] Post-restore verify: ${verifyMount.stdout?.trim()}`);
    } catch (ve) {
      console.log(`[persistence][${isolateId}] Post-restore verify failed:`, ve);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[persistence][${isolateId}] Restore failed: ${msg}`);
    if (msg.includes('BACKUP_EXPIRED') || msg.includes('BACKUP_NOT_FOUND')) {
      console.log(`[persistence][${isolateId}] Backup ${handle.id} expired/gone, clearing handle`);
      await deleteHandle(bucket);
    } else {
      throw err;
    }
  }
  restored = true;
}

/**
 * Create a new snapshot of /home/openclaw (config + workspace + skills).
 *
 * Follows the delete-then-write pattern from the Cloudflare docs: the previous
 * backup's R2 objects are removed before creating a new one, and the handle is
 * persisted to R2 for cross-isolate access.
 *
 * The Sandbox SDK only allows backup of directories under /home, /workspace,
 * /tmp, or /var/tmp. The Dockerfile sets HOME=/home/openclaw and symlinks
 * /root/.openclaw and /root/clawd there.
 */
export async function createSnapshot(
  sandbox: Sandbox,
  bucket: R2Bucket,
): Promise<{ id: string; dir: string }> {
  // Log what's in the directory before backup
  try {
    const lsBefore = await sandbox.exec(`ls -la ${BACKUP_DIR}/clawd/ 2>&1`);
    console.log(
      `[persistence][${isolateId}] Pre-backup ls ${BACKUP_DIR}/clawd/: ${lsBefore.stdout?.trim()}`,
    );
    const mountState = await sandbox.exec(`mount | grep "${BACKUP_DIR}" || echo "NO_OVERLAY"`);
    console.log(`[persistence][${isolateId}] Pre-backup mount: ${mountState.stdout?.trim()}`);
  } catch {
    // non-fatal
  }

  // Delete previous backup objects from R2
  const previousHandle = await getStoredHandle(bucket);
  if (previousHandle) {
    console.log(
      `[persistence][${isolateId}] Deleting previous backup objects: ${previousHandle.id}`,
    );
    await bucket.delete(`backups/${previousHandle.id}/data.sqsh`);
    await bucket.delete(`backups/${previousHandle.id}/meta.json`);
  }

  console.log(`[persistence][${isolateId}] Creating backup of ${BACKUP_DIR}...`);
  const t0 = Date.now();
  const handle = await sandbox.createBackup({
    dir: BACKUP_DIR,
    ttl: 604800, // 7 days
  });

  await storeHandle(bucket, handle);
  console.log(`[persistence][${isolateId}] Backup ${handle.id} created in ${Date.now() - t0}ms`);
  return handle;
}

/**
 * Get the last stored backup handle (for status reporting).
 */
export async function getLastBackupId(bucket: R2Bucket): Promise<string | null> {
  const handle = await getStoredHandle(bucket);
  return handle?.id ?? null;
}
