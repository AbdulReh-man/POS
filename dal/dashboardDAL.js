const db = require("../db");

// ✅ 1. Summary Stats for Dashboard Cards
const getDashboardStats = () => {
  return db
    .prepare(
      `
      SELECT
        -- 💰 Total Sales Today
        (SELECT IFNULL(SUM(total), 0)
        FROM sales
        WHERE DATE(created_at) = DATE('now')) AS sales_today,

        -- 📅 Sales This Month
        (SELECT IFNULL(SUM(total), 0)
        FROM sales
        WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')) AS sales_this_month,

        -- 👥 Total Customers
        (SELECT COUNT(*) FROM customers) AS total_customers,

        -- 📦 Total Products in Stock
        (SELECT IFNULL(SUM(stock), 0) FROM products) AS total_stock,

        -- 💸 Expenses This Month
        (SELECT IFNULL(SUM(amount), 0)
        FROM expenses
        WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')) AS expenses_this_month,

        -- 💲 Total Cost of Goods Sold (COGS) This Month
        (SELECT IFNULL(SUM(si.quantity * p.cost_price), 0)
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        JOIN products p ON si.product_id = p.id
        WHERE strftime('%Y-%m', s.created_at) = strftime('%Y-%m', 'now')) AS total_cost_this_month,

        -- 🧮 Net Profit = Sales - Cost - Expenses
        (
          (SELECT IFNULL(SUM(total), 0)
          FROM sales
          WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now'))
          -
          (SELECT IFNULL(SUM(si.quantity * p.cost_price), 0)
          FROM sale_items si
          JOIN sales s ON si.sale_id = s.id
          JOIN products p ON si.product_id = p.id
          WHERE strftime('%Y-%m', s.created_at) = strftime('%Y-%m', 'now'))
          -
          (SELECT IFNULL(SUM(amount), 0)
          FROM expenses
          WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now'))
        ) AS net_profit
      `
    )
    .get();
};

// ✅ 2. Monthly Sales Trend (For Line/Bar Chart)
const getMonthlySalesTrend = () => {
  return db
    .prepare(
      `
      SELECT 
        strftime('%Y-%m', created_at) AS month,
        SUM(total) AS total_sales
      FROM sales
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month ASC
    `
    )
    .all();
};

// ✅ 3. Sales by Category (For Pie/Donut Chart)
const getSalesByCategory = () => {
  return db
    .prepare(
      `
      SELECT 
        c.name AS category_name,
        SUM(si.quantity * si.price) AS total_sales
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      GROUP BY c.name
      ORDER BY total_sales DESC
    `
    )
    .all();
};

// ✅ 4. Top 5 Selling Products (For Bar Chart)
const getTopSellingProducts = () => {
  return db
    .prepare(
      `
      SELECT
        p.name AS product_name,
        SUM(si.quantity) AS total_sold
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      GROUP BY si.product_id
      ORDER BY total_sold DESC
      LIMIT 5
    `
    )
    .all();
};

// ✅ 5. Recent Sales (Optional, for table or list)
const getRecentSales = () => {
  return db
    .prepare(
      `
      SELECT 
        s.id,
        s.total,
        s.payment_method,
        s.invoice_number,
        s.created_at,
        c.name AS customer_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      ORDER BY s.created_at DESC
    `
    )
    .all();
};

// ✅ 6. Sales, Expenses, and Net Profit Trends (Last 90 Days)
const getSalesTrends = () => {
  const rows = db
    .prepare(
      `
      WITH all_dates AS (
        SELECT DATE(created_at) AS date
        FROM sales
        WHERE DATE(created_at) >= DATE('now', '-90 day')
        UNION
        SELECT DATE(created_at) AS date
        FROM expenses
        WHERE DATE(created_at) >= DATE('now', '-90 day')
      )
      SELECT 
        ad.date,

        -- 💰 Total Sales
        IFNULL(SUM(s.total), 0) AS total_sales,

        -- 💸 Total Cost from sold products
        IFNULL(SUM(si.quantity * p.cost_price), 0) AS total_cost,

        -- 🧾 Total Expenses
        IFNULL((
          SELECT SUM(e.amount)
          FROM expenses e
          WHERE DATE(e.created_at) = ad.date
        ), 0) AS total_expenses,

        -- 🧮 Net Profit = Sales - Cost - Expenses
        (
          IFNULL(SUM(s.total), 0)
          - IFNULL(SUM(si.quantity * p.cost_price), 0)
          - IFNULL((
              SELECT SUM(e.amount)
              FROM expenses e
              WHERE DATE(e.created_at) = ad.date
            ), 0)
        ) AS net_profit

      FROM all_dates ad
      LEFT JOIN sales s ON DATE(s.created_at) = ad.date
      LEFT JOIN sale_items si ON si.sale_id = s.id
      LEFT JOIN products p ON p.id = si.product_id
      WHERE ad.date < DATE('now')  -- Exclude today's date
      GROUP BY ad.date
      ORDER BY ad.date;
      `
    )
    .all();
  return rows;
};

module.exports = {
  getDashboardStats,
  getMonthlySalesTrend,
  getSalesByCategory,
  getTopSellingProducts,
  getRecentSales,
  getSalesTrends,
};
