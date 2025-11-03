const db = require("../db");

const getClothingByProductId = (product_id) =>
  db
    .prepare("SELECT * FROM product_clothing WHERE product_id = ?")
    .get(product_id);
const addClothingDetails = (product_id, size, color, brand, material) =>
  db
    .prepare(
      "INSERT INTO product_clothing (product_id, size, color, brand, material) VALUES (?,?,?,?,?)"
    )
    .run(product_id, size, color, brand, material);

module.exports = { getClothingByProductId, addClothingDetails };
