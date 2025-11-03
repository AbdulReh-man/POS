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
        console.log(`✅ Loaded schema: ${file}`);
      } catch (err) {
        console.error(`❌ Error loading schema ${file}:`, err);
      }
    }
  });
}

// Run schemas once
loadSchemas();

module.exports = db;
