const db = require("../db"); // your better-sqlite3 db connection
const salesDAL = {
  // ✅ Create a full sale with multiple items in a transaction
  createFullSale(data) {
    const { user_id, customer_id, total, discount, payment_method, items } =
      data;
    console.log("Data Getting: ", data);
    
    try {
      const insertSale = db.prepare(`
        INSERT INTO sales (user_id, customer_id, total, discount, payment_method)
        VALUES (?, ?, ?, ?, ?)
      `);

      const insertItem = db.prepare(`
        INSERT INTO sale_items (sale_id, product_id, quantity, price, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `);

      // Begin Transaction
      const transaction = db.transaction(() => {
        const result = insertSale.run(
          user_id || null,
          customer_id || null,
          total,
          discount,
          payment_method
        );
        const sale_id = result.lastInsertRowid;
        console.log("Created sale with ID:", sale_id);
        for (const item of items) {
          const subtotal = item.price * item.qty;
          insertItem.run(
            sale_id,
            item.product_id,
            item.qty,
            item.price,
            subtotal
          );
        }

        return sale_id;
      });

      const sale_id = transaction(); // Executes transaction
      return { sale_id, total, itemCount: items.length };
    } catch (err) {
      console.error("Error creating sale transaction:", err);
      throw err;
    }
  },

  // ✅ Get all sales
  getAllSales() {
    const rows = db
      .prepare(
        `
      SELECT s.*, u.name AS user_name, c.name AS customer_name
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN customers c ON s.customer_id = c.id
      ORDER BY s.created_at DESC
    `
      )
      .all();

    return rows;
  },

  // ✅ Get a sale with its items
  getSaleWithItems(sale_id) {
    const sale = db.prepare(`SELECT * FROM sales WHERE id = ?`).get(sale_id);
    if (!sale) return null;

    const items = db
      .prepare(
        `
      SELECT si.*, p.name AS product_name
      FROM sale_items si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `
      )
      .all(sale_id);

    return { ...sale, items };
  },
};

module.exports = salesDAL;
