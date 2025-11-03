const db = require("../db");

// Get all categories
const getAllCategories = () =>
  db.prepare("SELECT * FROM categories ORDER BY created_at DESC").all();
// Optional description field
const createCategory = (name, description = null) =>
  db
    .prepare("INSERT INTO categories (name, description) VALUES (?,?)")
    .run(name, description);
// Delete category by ID
const deleteCategory = (id) =>
  db.prepare("DELETE FROM categories WHERE id = ?").run(id);

// Update category by ID
const updateCategory = (id, name, description) =>
  db
    .prepare("UPDATE categories SET name = ?, description = ? WHERE id = ?")
    .run(name, description, id);

module.exports = {
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
};
