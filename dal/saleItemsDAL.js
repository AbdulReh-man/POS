const db = require("../db");

const salesItemsDAL = {
  addSaleItem(sale_id, product_id, quantity, price) {
    const subtotal = quantity * price;
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO sale_items (sale_id, product_id, quantity, price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [sale_id, product_id, quantity, price, subtotal],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  getItemsBySale(sale_id) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT si.*, p.name AS product_name
         FROM sale_items si
         LEFT JOIN products p ON si.product_id = p.id
         WHERE sale_id = ?`,
        [sale_id],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });
  },
};

module.exports = salesItemsDAL;
