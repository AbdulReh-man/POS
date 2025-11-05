const db = require("../db");

const getAllUsers = () =>
  db.prepare("SELECT * FROM users ORDER BY created_at DESC").all();

const getUserById = (id) =>
  db.prepare("SELECT * FROM users WHERE id = ?").get(id);

const getUserByEmail = (email) =>
  db.prepare("SELECT * FROM users WHERE email = ?").get(email);

const validateUserCredentials = (email, password) => {
  const user = getUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }
  if (user.password !== password) {
    throw new Error("Password is incorrect");
  }
  return { success: true, message: "Credentials valid", user };
};

const createUser = (name, email, password, role = "cashier") => {
  const result = db
    .prepare("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)")
    .run(name, email, password, role);

  return getUserById(result.lastInsertRowid);
}
const deleteUser = (id) => db.prepare("DELETE FROM users WHERE id = ?").run(id);

module.exports = { getAllUsers, getUserById, createUser, deleteUser, validateUserCredentials };
