const db = require("../db");

const getAllPurchases = () =>
  db.prepare("SELECT * FROM purchases ORDER BY purchase_date DESC").all();
const createPurchase = (supplier_id, invoice_number, total, purchase_date) =>
  db
    .prepare(
      "INSERT INTO purchases (supplier_id, invoice_number, total, purchase_date) VALUES (?,?,?,?)"
    )
    .run(supplier_id, invoice_number, total, purchase_date);
const getPurchaseById = (id) =>
  db.prepare("SELECT * FROM purchases WHERE id = ?").get(id);

module.exports = { getAllPurchases, createPurchase, getPurchaseById };
