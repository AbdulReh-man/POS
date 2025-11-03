CREATE TABLE IF NOT EXISTS sales (
id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER,
customer_id INTEGER,
total REAL NOT NULL,
discount REAL DEFAULT 0,
invoice_number TEXT UNIQUE NOT NULL,
payment_method TEXT CHECK(payment_method IN ('cash','card','wallet','other')) DEFAULT 'cash',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);


CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_user ON sales(user_id);