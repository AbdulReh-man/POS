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
      INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, subtotal, cost_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
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
            subtotal,
            item.cost_price,
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

  // ✅ Update full sale (header + items)
  updateFullSale(sale_id, data) {
    const { user_id, customer_id, total, discount, payment_method, items } = data;

    try {
      const updateSale = db.prepare(`
        UPDATE sales
        SET user_id = ?, customer_id = ?, total = ?, discount = ?, payment_method = ?
        WHERE id = ?
      `);

      const getExistingItems = db.prepare(`
        SELECT * FROM sale_items WHERE sale_id = ?
      `);

      const insertItem = db.prepare(`
        INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, subtotal, cost_price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const updateItem = db.prepare(`
        UPDATE sale_items
        SET product_id = ?, product_name = ?, quantity = ?, price = ?, subtotal = ?, cost_price = ?
        WHERE id = ?
      `);

      const deleteItem = db.prepare(`
        DELETE FROM sale_items WHERE id = ?
      `);

      const transaction = db.transaction(() => {
        // 1️⃣ Update sale header
        updateSale.run(
          user_id || null,
          customer_id || null,
          total,
          discount,
          payment_method,
          sale_id
        );

        // 2️⃣ Get existing sale items from DB
        const existing = getExistingItems.all(sale_id);
        const existingMap = new Map(existing.map(i => [i.id, i]));

        // 3️⃣ Loop through incoming items
        for (const item of items) {
          const subtotal = item.qty * item.price;

          if (!item.id) {
            // ➕ New item added
            insertItem.run(
              sale_id,
              item.product_id,
              item.name,
              item.qty,
              item.price,
              subtotal,
              item.cost_price
            );
            continue;
          }

          // Existing item: update it
          updateItem.run(
            item.product_id,
            item.name,
            item.qty,
            item.price,
            subtotal,
            item.cost_price,
            item.id
          );

          existingMap.delete(item.id);
        }

        // 4️⃣ Delete items that were removed in UI
        for (const removed of existingMap.values()) {
          deleteItem.run(removed.id);
        }

        return { success: true };
      });

      return transaction();
    } catch (err) {
      console.error("Error updating sale:", err);
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
      SELECT si.id, si.sale_id, si.subtotal,si.product_id, si.price, si.product_name AS name, si.quantity AS qty
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
