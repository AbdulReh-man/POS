CREATE TABLE IF NOT EXISTS purchases (
id INTEGER PRIMARY KEY AUTOINCREMENT,
supplier_id INTEGER,
invoice_number TEXT,
total REAL NOT NULL,
purchase_date DATE DEFAULT CURRENT_DATE,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);


CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date);