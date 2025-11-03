const db = require("../db");

const getAllExpenses = () =>
  db.prepare("SELECT * FROM expenses ORDER BY expense_date DESC").all();
const addExpense = (title, amount, category, expense_date) =>
  db
    .prepare(
      "INSERT INTO expenses (title, amount, category, expense_date) VALUES (?,?,?,?)"
    )
    .run(title, amount, category, expense_date);

module.exports = { getAllExpenses, addExpense };
