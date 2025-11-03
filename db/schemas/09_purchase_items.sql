CREATE TABLE IF NOT EXISTS purchase_items (
id INTEGER PRIMARY KEY AUTOINCREMENT,
purchase_id INTEGER NOT NULL,
product_id INTEGER NOT NULL,
quantity INTEGER NOT NULL,
cost_price REAL NOT NULL,
subtotal REAL NOT NULL,
FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
FOREIGN KEY (product_id) REFERENCES products(id)
);


CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_product ON purchase_items(product_id);