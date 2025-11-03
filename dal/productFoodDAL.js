const db = require("../db");

const getFoodByProductId = (product_id) =>
  db.prepare("SELECT * FROM product_food WHERE product_id = ?").get(product_id);
const addFoodDetails = (
  product_id,
  recipe,
  ingredients,
  kitchen_required = 1
) =>
  db
    .prepare(
      "INSERT INTO product_food (product_id, recipe, ingredients, kitchen_required) VALUES (?,?,?,?)"
    )
    .run(product_id, recipe, ingredients, kitchen_required);

module.exports = { getFoodByProductId, addFoodDetails };
