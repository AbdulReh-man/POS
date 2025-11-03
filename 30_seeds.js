const db = require("./db/index");

db.prepare(
  `INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)`
).run("Admin User", "admin@pos.com", "admin123", "admin");

db.prepare(`INSERT INTO categories (name, description) VALUES (?,?)`).run(
  "Beverages",
  "Drinks and refreshments"
);

db.prepare(`INSERT INTO categories (name, description) VALUES (?,?)`).run(
  "Snacks",
  "Chips, biscuits, etc."
);

db.prepare(
  `INSERT INTO products (name, category_id, price, stock, product_type) VALUES (?,?,?,?,?)`
).run("Coca Cola 500ml", 1, 50, 100, "general");

db.prepare(
  `INSERT INTO products (name, category_id, price, stock, product_type) VALUES (?,?,?,?,?)`
).run("Lays Chips", 2, 30, 200, "food");

db.prepare(`INSERT INTO customers (name, phone, email) VALUES (?,?,?)`).run(
  "John Doe",
  "1234567890",
  "john@example.com"
);

db.prepare(`INSERT INTO suppliers (name, contact, email) VALUES (?,?,?)`).run(
  "ABC Distributors",
  "9876543210",
  "abc@distributors.com"
);

console.log("✅ Seed data inserted");


// // Disable constraints
// db.pragma("foreign_keys = OFF");

// // Delete everything
// db.prepare("DELETE FROM users").run();
// db.prepare("DELETE FROM categories").run();
// db.prepare("DELETE FROM suppliers").run();
// db.prepare("DELETE FROM customers").run();
// db.prepare("DELETE FROM products").run();
// db.prepare("DELETE FROM purchases").run();
// db.prepare("DELETE FROM purchase_items").run();
// db.prepare("DELETE FROM sales").run();
// db.prepare("DELETE FROM sale_items").run();
// db.prepare("DELETE FROM expenses").run();
// db.prepare("DELETE FROM stock_movements").run();
// db.prepare("DELETE FROM payments").run();

// // Reset counters
// db.prepare("DELETE FROM sqlite_sequence").run();

// // Re-enable constraints
// db.pragma("foreign_keys = ON");