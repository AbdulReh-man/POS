CREATE TABLE IF NOT EXISTS sale_items (
id INTEGER PRIMARY KEY AUTOINCREMENT,
sale_id INTEGER NOT NULL,
product_id INTEGER NOT NULL,
quantity INTEGER NOT NULL,
price REAL NOT NULL,
subtotal REAL NOT NULL,
FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
FOREIGN KEY (product_id) REFERENCES products(id)
);


CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);