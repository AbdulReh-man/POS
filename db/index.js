// db/init.js
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
const { app } = require("electron");

// Ensure app is ready (for Electron main process)
if (!app) {
  throw new Error("Electron app instance not found");
}

// Path to a writable location
const dbPath = path.join(app.getPath("userData"), "abdulpos.db");

// Ensure userData folder exists (usually already exists)
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// Open or create the database
const db = new Database(dbPath);

// Apply all .sql schema files
function loadSchemas() {
  // Path to your packaged schemas inside app.asar
  const schemaDir = path.join(__dirname, "schemas");
  const files = fs.readdirSync(schemaDir);

  files.forEach((file) => {
    if (file.endsWith(".sql")) {
      const schema = fs.readFileSync(path.join(schemaDir, file), "utf8");
      try {
        db.exec(schema);
      } catch (err) {
        console.error(`Error executing schema ${file}:`, err);
      }
    }
  });
}

// Create default admin user if no users exist
function createDefaultUser() {
  // Ensure users table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT CHECK(role IN ('admin','cashier','manager')) DEFAULT 'cashier',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Check if any user exists
  const row = db.prepare("SELECT COUNT(*) as count FROM users").get();
  if (row.count === 0) {
    const defaultName = "Abdul POS Admin";
    const defaultEmail = "admin@gmail.com";
    const defaultPassword = "admin123"; // plain text
    const role = "admin";

    db.prepare(
      "INSERT INTO users(name, email, password, role) VALUES (?, ?, ?, ?)"
    ).run(defaultName, defaultEmail, defaultPassword, role);

    console.log(`Default admin user created: ${defaultEmail} / ${defaultPassword}`);
  }
}

// Run schemas once
loadSchemas();
// Run on app startup
createDefaultUser();
module.exports = db;
