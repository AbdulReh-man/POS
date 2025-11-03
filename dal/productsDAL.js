// dal/productsDAL.js
const db = require("../db"); // path to your better-sqlite3 db instance

// Create product and its subtype record inside a transaction
const createProductWithType = db.transaction((data) => {
  const insertBase = db.prepare(`
    INSERT INTO products
      (name, category_id, price, cost_price, stock, product_type, barcode, sku, description, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = insertBase.run(
    data.name,
    data.category_id || null,
    data.price,
    data.cost_price || null,
    data.stock || 0,
    data.product_type || "general",
    data.barcode || null,
    data.sku || null,
    data.description || null,
    data.image_url || null
  );

  const productId = info.lastInsertRowid;

  // insert subtype data if needed
  if (data.product_type === "clothing") {
    const insertClothing = db.prepare(`
      INSERT INTO product_clothing (product_id, size, color, brand, material)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertClothing.run(
      productId,
      data.size || null,
      data.color || null,
      data.brand || null,
      data.material || null
    );
  } else if (data.product_type === "food") {
    const insertFood = db.prepare(`
      INSERT INTO product_food (product_id, recipe, ingredients, kitchen_required)
      VALUES (?, ?, ?, ?)
    `);
    insertFood.run(
      productId,
      data.recipe || null,
      data.ingredients || null,
      data.kitchen_required == null ? 1 : data.kitchen_required
    );
  }

  return productId;
});

// Get products with subtype columns aliased (so consumer can easily read them)
const getAllProducts = () => {
  return db.prepare(`
    SELECT
      p.*,
      c.name AS category_name,
      pc.size AS clothing_size, pc.color AS clothing_color, pc.brand AS clothing_brand, pc.material AS clothing_material,
      pf.recipe AS food_recipe, pf.ingredients AS food_ingredients, pf.kitchen_required AS food_kitchen_required
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_clothing pc ON p.id = pc.product_id
    LEFT JOIN product_food pf ON p.id = pf.product_id
    ORDER BY p.created_at DESC
  `).all();
};

const getProductById = (id) => {
  return db.prepare(`
    SELECT
      p.*,
      c.name AS category_name,
      pc.size AS clothing_size, pc.color AS clothing_color, pc.brand AS clothing_brand, pc.material AS clothing_material,
      pf.recipe AS food_recipe, pf.ingredients AS food_ingredients, pf.kitchen_required AS food_kitchen_required
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_clothing pc ON p.id = pc.product_id
    LEFT JOIN product_food pf ON p.id = pf.product_id
    WHERE p.id = ?
  `).get(id);
};

// Update product and its subtype (atomic)
const updateProduct = db.transaction((id, data) => {
  const updateBase = db.prepare(`
    UPDATE products
    SET name = ?, category_id = ?, price = ?, cost_price = ?, stock = ?, product_type = ?, barcode = ?, sku = ?, image_url = ?, description = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  updateBase.run(
    data.name,
    data.category_id || null,
    data.price,
    data.cost_price || null,
    data.stock || 0,
    data.product_type || "general",
    data.barcode || null,
    data.sku || null,
    data.image_url || null,
    data.description || null,
    id
  );

  // Remove subtype rows not matching new type
  if (data.product_type !== "clothing") {
    db.prepare("DELETE FROM product_clothing WHERE product_id = ?").run(id);
  }
  if (data.product_type !== "food") {
    db.prepare("DELETE FROM product_food WHERE product_id = ?").run(id);
  }

  // Upsert clothing
  if (data.product_type === "clothing") {
    const exists = db.prepare("SELECT id FROM product_clothing WHERE product_id = ?").get(id);
    if (exists) {
      db.prepare(`
        UPDATE product_clothing
        SET size = ?, color = ?, brand = ?, material = ?, created_at = created_at
        WHERE product_id = ?
      `).run(data.size || null, data.color || null, data.brand || null, data.material || null, id);
    } else {
      db.prepare(`
        INSERT INTO product_clothing (product_id, size, color, brand, material)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, data.size || null, data.color || null, data.brand || null, data.material || null);
    }
  }

  // Upsert food
  if (data.product_type === "food") {
    const exists = db.prepare("SELECT id FROM product_food WHERE product_id = ?").get(id);
    if (exists) {
      db.prepare(`
        UPDATE product_food
        SET recipe = ?, ingredients = ?, kitchen_required = ?
        WHERE product_id = ?
      `).run(data.recipe || null, data.ingredients || null, data.kitchen_required == null ? 1 : data.kitchen_required, id);
    } else {
      db.prepare(`
        INSERT INTO product_food (product_id, recipe, ingredients, kitchen_required)
        VALUES (?, ?, ?, ?)
      `).run(id, data.recipe || null, data.ingredients || null, data.kitchen_required == null ? 1 : data.kitchen_required);
    }
  }

  return true;
});

const deleteProduct = (id) => {
  // product_clothing / product_food have ON DELETE CASCADE in your schema, so deleting products will remove subtype rows
  return db.prepare("DELETE FROM products WHERE id = ?").run(id);
};

module.exports = {
  createProductWithType,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
