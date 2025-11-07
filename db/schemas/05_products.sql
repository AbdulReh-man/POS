CREATE TABLE IF NOT EXISTS products (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
category_id INTEGER,
price REAL NOT NULL DEFAULT 0,
cost_price REAL DEFAULT 0,
stock INTEGER DEFAULT 0,
product_type TEXT CHECK(product_type IN ('general','clothing','food')) NOT NULL DEFAULT 'general',
barcode TEXT UNIQUE,
product_status TEXT CHECK(product_status IN ('active','archived', 'draft')) DEFAULT 'active',
is_deleted INTEGER DEFAULT 0,
image_url TEXT,
sku TEXT DEFAULT 'N/A',
description TEXT DEFAULT 'No description',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);


CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);