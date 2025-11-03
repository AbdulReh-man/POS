const db = require("../db");

const recordPayment = (sale_id, amount, method = "cash", reference = null) =>
  db
    .prepare(
      "INSERT INTO payments (sale_id, amount, method, reference) VALUES (?,?,?,?)"
    )
    .run(sale_id, amount, method, reference);

const getPaymentsBySale = (sale_id) =>
  db.prepare("SELECT * FROM payments WHERE sale_id = ?").all(sale_id);

module.exports = { recordPayment, getPaymentsBySale };