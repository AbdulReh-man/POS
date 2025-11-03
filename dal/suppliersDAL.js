const db = require("../db");

const getAllSuppliers = () =>
  db.prepare("SELECT * FROM suppliers ORDER BY created_at DESC").all();
const createSupplier = (name, contact, email, address) =>
  db
    .prepare(
      "INSERT INTO suppliers (name, contact, email, address) VALUES (?,?,?,?)"
    )
    .run(name, contact, email, address);
const getSupplierById = (id) =>
  db.prepare("SELECT * FROM suppliers WHERE id = ?").get(id);

module.exports = { getAllSuppliers, createSupplier, getSupplierById };
