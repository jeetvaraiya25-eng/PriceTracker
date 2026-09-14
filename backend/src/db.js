import "dotenv/config";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, "dropwatch.db"));
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  whatsapp_phone TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT,
  source_url TEXT NOT NULL,
  source_site TEXT,
  whatsapp_alerts INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  price REAL NOT NULL,
  checked_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER UNIQUE NOT NULL,
  target_price REAL NOT NULL,
  last_triggered_at TEXT,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alert_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  price REAL NOT NULL,
  target_price REAL NOT NULL,
  channel TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS whatsapp_link_codes (
  code TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_history_product ON price_history(product_id, checked_at);
`);

migrateFromTelegram();
db.exec("CREATE INDEX IF NOT EXISTS idx_users_whatsapp ON users(whatsapp_phone)");

function tableColumns(table) {
  return db.prepare(`PRAGMA table_info(${table})`).all().map((col) => col.name);
}

function migrateFromTelegram() {
  const userCols = tableColumns("users");
  if (!userCols.includes("whatsapp_phone")) {
    db.exec("ALTER TABLE users ADD COLUMN whatsapp_phone TEXT");
  }
  if (!userCols.includes("name")) {
    db.exec("ALTER TABLE users ADD COLUMN name TEXT");
  }
  if (!userCols.includes("plan")) {
    db.exec("ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'");
  }
  if (userCols.includes("telegram_chat_id")) {
    db.exec(`
      UPDATE users
      SET whatsapp_phone = telegram_chat_id
      WHERE whatsapp_phone IS NULL AND telegram_chat_id IS NOT NULL
    `);
  }

  const productCols = tableColumns("products");
  if (!productCols.includes("whatsapp_alerts")) {
    db.exec("ALTER TABLE products ADD COLUMN whatsapp_alerts INTEGER NOT NULL DEFAULT 0");
  }
  if (productCols.includes("telegram_alerts")) {
    db.exec(`
      UPDATE products
      SET whatsapp_alerts = telegram_alerts
      WHERE whatsapp_alerts = 0 AND telegram_alerts = 1
    `);
  }
  if (!productCols.includes("currency")) {
    db.exec("ALTER TABLE products ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD'");
  }
  if (!productCols.includes("group_id")) {
    db.exec("ALTER TABLE products ADD COLUMN group_id INTEGER");
    db.exec("UPDATE products SET group_id = id WHERE group_id IS NULL");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS whatsapp_link_codes (
      code TEXT PRIMARY KEY,
      phone TEXT NOT NULL,
      expires_at TEXT NOT NULL
    )
  `);
}

export function nowSql() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}
