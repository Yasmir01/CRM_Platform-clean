import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export function getDb() {
  if (!db) {
    db = SQLite.openDatabase("crm.db");
  }
  return db;
}

export function initDb() {
  const database = getDb();
  database.transaction((tx) => {
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS leases (id TEXT PRIMARY KEY, data TEXT)"
    );
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, data TEXT)"
    );
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS work_orders (id TEXT PRIMARY KEY, data TEXT)"
    );
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS pending_sync (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, payload TEXT, status TEXT DEFAULT 'pending', error TEXT)"
    );
  });
}
