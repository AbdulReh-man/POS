const db = require("../db");

const getAllUsers = () =>
  db.prepare("SELECT * FROM users ORDER BY created_at DESC").all();
const getUserById = (id) =>
  db.prepare("SELECT * FROM users WHERE id = ?").get(id);
const createUser = (name, email, password, role = "cashier") =>
  db
    .prepare("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)")
    .run(name, email, password, role);
const deleteUser = (id) => db.prepare("DELETE FROM users WHERE id = ?").run(id);

module.exports = { getAllUsers, getUserById, createUser, deleteUser };
