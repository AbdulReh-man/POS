const db = require("../db");

const getAllCustomers = () =>
  db.prepare("SELECT * FROM customers ORDER BY created_at DESC").all();
const createCustomer = (name, phone, email, address) =>
  db
    .prepare(
      "INSERT INTO customers (name, phone, email, address) VALUES (?,?,?,?)"
    )
    .run(name, phone, email, address);
const getCustomerById = (id) =>
  db.prepare("SELECT * FROM customers WHERE id = ?").get(id);

module.exports = { getAllCustomers, createCustomer, getCustomerById };
