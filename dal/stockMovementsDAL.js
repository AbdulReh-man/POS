const db = require("../db");

const getStockMovements = (product_id) =>
  db
    .prepare(
      "SELECT * FROM stock_movements WHERE product_id = ? ORDER BY created_at DESC"
    )
    .all(product_id);

const getAllStockMovements = () =>
  db.prepare("SELECT * FROM stock_movements ORDER BY created_at DESC").all();

module.exports = { getStockMovements, getAllStockMovements };
