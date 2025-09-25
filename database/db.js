// db.js
import * as SQLite from "expo-sqlite";

export async function openDB() {
  const db = await SQLite.openDatabaseAsync("customers.db");
  await db.runAsync("PRAGMA foreign_keys = ON;");

  await db.runAsync(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    created_at TEXT,   -- when record was created
    updated_at TEXT    -- when record was last updated
  )
`);
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS customer_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER NOT NULL,
      imagePath TEXT NOT NULL,
      date TEXT,
      FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
    )
  `);

  return db;
}
