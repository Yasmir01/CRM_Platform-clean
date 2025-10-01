import { getDb } from "./db";

function runSql(sql: string, params: any[] = []): Promise<any> {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        (_: any, result: any) => resolve(result),
        (_: any, error: any) => {
          reject(error);
          return false;
        }
      );
    });
  });
}

export async function upsert(table: string, id: string, data: any) {
  const str = JSON.stringify(data);
  await runSql(`INSERT OR REPLACE INTO ${table} (id, data) VALUES (?, ?)`, [
    id,
    str,
  ]);
}

export async function all(table: string): Promise<any[]> {
  const result: any = await runSql(`SELECT * FROM ${table}`);
  return result.rows._array.map((r: any) => JSON.parse(r.data));
}

export async function queueForSync(type: string, payload: any) {
  await runSql("INSERT INTO pending_sync (type, payload) VALUES (?, ?)", [
    type,
    JSON.stringify(payload),
  ]);
}

export async function getPendingSync(): Promise<any[]> {
  const result: any = await runSql("SELECT * FROM pending_sync ORDER BY id ASC");
  return result.rows._array;
}

export async function getFailedSync(): Promise<any[]> {
  const result: any = await runSql("SELECT * FROM pending_sync WHERE status='failed' ORDER BY id ASC");
  return result.rows._array;
}

export async function markSyncStatus(id: number, status: string, error?: string) {
  await runSql("UPDATE pending_sync SET status=?, error=? WHERE id=?", [status, error || null, id]);
}

export async function clearPendingSync(id: number) {
  await runSql("DELETE FROM pending_sync WHERE id = ?", [id]);
}
