const db = require("../db");

const addPurchaseItem = (purchase_id, product_id, quantity, cost_price) => {
  const subtotal = quantity * cost_price;
  return db
    .prepare(
      `
    INSERT INTO purchase_items (purchase_id, product_id, quantity, cost_price, subtotal)
    VALUES (?,?,?,?,?)
  `
    )
    .run(purchase_id, product_id, quantity, cost_price, subtotal);
};

const getItemsByPurchase = (purchase_id) =>
  db
    .prepare("SELECT * FROM purchase_items WHERE purchase_id = ?")
    .all(purchase_id);

module.exports = { addPurchaseItem, getItemsByPurchase };
