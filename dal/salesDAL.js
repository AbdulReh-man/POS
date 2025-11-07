const db = require("../db"); // your better-sqlite3 db connection
const salesDAL = {

  createFullSale(data) {
    const { user_id, customer_id, total, discount, payment_method, items } =
      data;

    try {
      const insertSale = db.prepare(`
      INSERT INTO sales (invoice_number, user_id, customer_id, total, discount, payment_method)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

      const insertItem = db.prepare(`
      INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, subtotal)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

      const transaction = db.transaction(() => {
        // ✅ Get current year
        const year = new Date().getFullYear();
        const yearPrefix = String(year).slice(-2); // 2025 → 25

        // ✅ Find last invoice for this year
        const lastInvoice = db
          .prepare(
            `
        SELECT invoice_number 
        FROM sales 
        WHERE invoice_number LIKE ? 
        ORDER BY id DESC LIMIT 1
      `
          )
          .get(`${yearPrefix}%`);

        let nextSeq = 1;
        if (lastInvoice && lastInvoice.invoice_number) {
          const lastNum = parseInt(lastInvoice.invoice_number.slice(2));
          if (!isNaN(lastNum)) nextSeq = lastNum + 1;
        }

        const invoice_number = `${yearPrefix}${String(nextSeq).padStart(
          2,
          "0"
        )}`;
        // Example: 2501, 2502, etc.

        // ✅ Insert sale
        const result = insertSale.run(
          invoice_number,
          user_id || null,
          customer_id || null,
          total,
          discount,
          payment_method
        );

        const sale_id = result.lastInsertRowid;

        // ✅ Insert items
        for (const item of items) {
          console.log("product item:", item);
          const subtotal = item.price * item.qty;
          insertItem.run(
            sale_id,
            item.product_id,
            item.name,
            item.qty,
            item.price,
            subtotal
          );
        }

        console.log("Created sale with ID:", sale_id, "and Invoice Number:", invoice_number);
        return {
          sale_id,
          invoice_number,
          total,
          discount,
          payment_method,
          items, // full array of items
          };
      });

      return transaction();
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
