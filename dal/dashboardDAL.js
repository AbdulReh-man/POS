const db = require("../db");
const { bizDate, bizMonth } = require("./businessDay");

const getDashboardStats = () => {
  const thisMonth = bizMonth("'now'");
  return db
    .prepare(
      `
      SELECT
        -- 💰 Total Sales Today (business day)
        (SELECT IFNULL(SUM(total), 0)
        FROM sales
        WHERE ${bizDate("created_at")} = ${bizDate("'now'")}) AS sales_today,

        -- 📅 Sales This Month
        (SELECT IFNULL(SUM(total), 0)
        FROM sales
        WHERE ${bizMonth("created_at")} = ${thisMonth}) AS sales_this_month,

        -- 👥 Total Customers
        (SELECT COUNT(*) FROM customers) AS total_customers,

        -- 📦 Total Products in Stock
        (SELECT IFNULL(SUM(stock), 0) FROM products) AS total_stock,

        -- 💸 Expenses This Month
        (SELECT IFNULL(SUM(amount), 0)
        FROM expenses
        WHERE ${bizMonth("created_at")} = ${thisMonth}) AS expenses_this_month,

        -- 💲 Total Cost of Goods Sold (COGS) This Month — now uses sale_items.cost_price
        (SELECT IFNULL(SUM(si.quantity * si.cost_price), 0)
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        WHERE ${bizMonth("s.created_at")} = ${thisMonth}) AS total_cost_this_month,

        -- 🧮 Net Profit = Sales - Cost - Expenses
        (
          (SELECT IFNULL(SUM(total), 0)
          FROM sales
          WHERE ${bizMonth("created_at")} = ${thisMonth})
          -
          (SELECT IFNULL(SUM(si.quantity * si.cost_price), 0)
          FROM sale_items si
          JOIN sales s ON si.sale_id = s.id
          WHERE ${bizMonth("s.created_at")} = ${thisMonth})
          -
          (SELECT IFNULL(SUM(amount), 0)
          FROM expenses
          WHERE ${bizMonth("created_at")} = ${thisMonth})
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
        ${bizMonth("created_at")} AS month,
        SUM(total) AS total_sales
      FROM sales
      GROUP BY month
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

// ✅ 3b. Sales by Category within a business-day range (inclusive, 'YYYY-MM-DD')
// The POS discount is a % of the whole order, so each line's share of what the
// customer actually paid is subtotal * (sale total / order subtotal). Summing
// that per category reconciles exactly with the sales totals on the dashboard.
const getCategorySalesByRange = ({ from, to }) => {
  return db
    .prepare(
      `
      WITH order_totals AS (
        SELECT sale_id, SUM(subtotal) AS items_total
        FROM sale_items
        GROUP BY sale_id
      ),
      lines AS (
        SELECT
          p.category_id,
          IFNULL(c.name, 'Uncategorized') AS category_name,
          si.sale_id,
          si.quantity,
          si.subtotal AS gross,
          CASE WHEN ot.items_total > 0
            THEN si.subtotal * s.total / ot.items_total
            ELSE 0 END AS net,
          si.quantity * si.cost_price AS cost
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        JOIN order_totals ot ON ot.sale_id = si.sale_id
        LEFT JOIN products p ON si.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE ${bizDate("s.created_at")} BETWEEN ? AND ?
      )
      SELECT
        category_name,
        ROUND(SUM(net), 2) AS total_sales,
        ROUND(SUM(gross), 2) AS gross_sales,
        ROUND(SUM(gross) - SUM(net), 2) AS total_discount,
        ROUND(SUM(net) - SUM(cost), 2) AS total_profit,
        SUM(quantity) AS total_quantity,
        COUNT(DISTINCT sale_id) AS total_orders
      FROM lines
      GROUP BY category_id
      ORDER BY total_sales DESC
    `
    )
    .all(from, to);
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

// ✅ 6. Sales, Expenses, and Net Profit Trends (Last 90 business days)
// Each measure is aggregated in its own subquery: joining sales to sale_items
// first would repeat a sale's total once per item.
const getSalesTrends = () => {
  const rows = db
    .prepare(
      `
      WITH
      daily_sales AS (
        SELECT ${bizDate("created_at")} AS date, SUM(total) AS total_sales
        FROM sales
        GROUP BY date
      ),
      daily_cost AS (
        SELECT ${bizDate("s.created_at")} AS date,
          SUM(si.quantity * si.cost_price) AS total_cost
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        GROUP BY date
      ),
      daily_expenses AS (
        SELECT ${bizDate("created_at")} AS date, SUM(amount) AS total_expenses
        FROM expenses
        GROUP BY date
      ),
      all_dates AS (
        SELECT date FROM daily_sales
        UNION
        SELECT date FROM daily_expenses
      )
      SELECT
        ad.date,
        IFNULL(ds.total_sales, 0) AS total_sales,
        IFNULL(dc.total_cost, 0) AS total_cost,
        IFNULL(de.total_expenses, 0) AS total_expenses,
        -- 🧮 Net Profit = Sales - Cost - Expenses
        IFNULL(ds.total_sales, 0)
          - IFNULL(dc.total_cost, 0)
          - IFNULL(de.total_expenses, 0) AS net_profit
      FROM all_dates ad
      LEFT JOIN daily_sales ds ON ds.date = ad.date
      LEFT JOIN daily_cost dc ON dc.date = ad.date
      LEFT JOIN daily_expenses de ON de.date = ad.date
      WHERE ad.date >= DATE(${bizDate("'now'")}, '-90 days')
        AND ad.date < ${bizDate("'now'")}  -- Exclude today's (unfinished) business day
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
  getCategorySalesByRange,
  getTopSellingProducts,
  getRecentSales,
  getSalesTrends,
};
