// db/init.js
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

// Create / Open database file
const dbPath = path.join(__dirname, "abdulpos.db");
const db = new Database(dbPath);

// Apply all .sql schema files
function loadSchemas() {
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


// // Insert dummy category if not exists
// db.prepare(
//   `INSERT OR IGNORE INTO categories (id, name) VALUES (1, 'Food')`
// ).run();

// // Insert dummy product linked to category 1
// db.prepare(
//   `INSERT OR IGNORE INTO products (id, name, category_id, barcode, price, stock)
//    VALUES (1, 'Dummy Burger', 1, '123456789', 250.0, 100)`
// ).run();

// console.log("✅ Database ready and dummy data inserted!");