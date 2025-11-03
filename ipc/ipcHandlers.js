const { ipcMain } = require("electron");
const usersDAL = require("../dal/usersDAL");
const productsDAL = require("../dal/productsDAL");
const salesDAL = require("../dal/salesDAL");
const salesItemsDAL = require("../dal/saleItemsDAL");
const paymentsDAL = require("../dal/paymentsDAL");
const categoriesDAL = require("../dal/categoriesDAL");
const suppliersDAL = require("../dal/suppliersDAL");
const customersDAL = require("../dal/customersDAL");
const purchasesDAL = require("../dal/purchasesDAL");
const expensesDAL = require("../dal/expensesDAL");
const stockDAL = require("../dal/stockMovementsDAL");
const { getDashboardStats, getMonthlySalesTrend, getRecentSales, getSalesByCategory,getTopSellingProducts, getSalesTrends } = require("../dal/dashboardDAL");
// const { buildReceiptBuffer } = require("../buildReceiptBuffer");

function registerIpcHandlers() {
  // Users
  ipcMain.handle("users:getAll", () => usersDAL.getAllUsers());
  ipcMain.handle("users:getById", (e, id) => usersDAL.getUserById(id));
  ipcMain.handle("users:create", (e, data) =>
    usersDAL.createUser(data.name, data.email, data.password, data.role)
  );
  ipcMain.handle("users:delete", (e, id) => usersDAL.deleteUser(id));

  // Products create
  ipcMain.handle("products:create", (e, data) => {
    try {
      const id = productsDAL.createProductWithType(data);
      return { success: true, id };
    } catch (err) {
      console.error("products:create error:", err);
      return { success: false, error: err.message };
    }
  });

  // Products get all
  ipcMain.handle("products:getAll", () => {
    try {
      return { success: true, data: productsDAL.getAllProducts() };
    } catch (err) {
      console.error("products:getAll error:", err);
      return { success: false, error: err.message };
    }
  });

  // Products get by id
  ipcMain.handle("products:getById", (e, id) => {
    try {
      return { success: true, data: productsDAL.getProductById(id) };
    } catch (err) {
      console.error("products:getById error:", err);
      return { success: false, error: err.message };
    }
  });

  // Products update
  ipcMain.handle("products:update", (e, id, data) => {
    try {
      productsDAL.updateProduct(id, data);
      return { success: true };
    } catch (err) {
      console.error("products:update error:", err);
      return { success: false, error: err.message };
    }
  });

  // Products delete
  ipcMain.handle("products:delete", (e, id) => {
    try {
      productsDAL.deleteProduct(id);
      return { success: true };
    } catch (err) {
      console.error("products:delete error:", err);
      return { success: false, error: err.message };
    }
  });

  // Products update stock
  ipcMain.handle("products:updateStock", (e, data) =>
    productsDAL.updateProductStock(data.id, data.stock)
  );

  // ✅ Create full sale with items
  ipcMain.handle("sales:createFull", (e, data) =>
    salesDAL.createFullSale(data)
  );

  // ✅ Get all sales
  ipcMain.handle("sales:getAll", () => salesDAL.getAllSales());

  // ✅ Get one sale with its items
  ipcMain.handle("sales:getById", (e, id) => salesDAL.getSaleWithItems(id));

  ipcMain.handle("payments:record", (e, data) =>
    paymentsDAL.recordPayment(
      data.sale_id,
      data.amount,
      data.method,
      data.reference
    )
  );
  ipcMain.handle("payments:getBySale", (e, sale_id) =>
    paymentsDAL.getPaymentsBySale(sale_id)
  );

  // Categories
  ipcMain.handle("categories:getAll", () => categoriesDAL.getAllCategories());
  ipcMain.handle("categories:create", (e, data) =>
    categoriesDAL.createCategory(data.name, data.description)
  );
  ipcMain.handle("categories:delete", (e, id) =>
    categoriesDAL.deleteCategory(id)
  );
  ipcMain.handle("categories:update", (e, id, data) =>
    categoriesDAL.updateCategory(id, data.name, data.description)
  );

  // Suppliers
  ipcMain.handle("suppliers:getAll", () => suppliersDAL.getAllSuppliers());
  ipcMain.handle("suppliers:create", (e, data) =>
    suppliersDAL.createSupplier(
      data.name,
      data.contact,
      data.email,
      data.address
    )
  );

  // Customers
  ipcMain.handle("customers:getAll", () => customersDAL.getAllCustomers());
  ipcMain.handle("customers:create", (e, data) =>
    customersDAL.createCustomer(
      data.name,
      data.contact,
      data.email,
      data.address
    )
  );

  // Purchases
  ipcMain.handle("purchases:create", (e, data) =>
    purchasesDAL.createPurchase(data.supplier_id, data.total, data.reference)
  );
  ipcMain.handle("purchases:addItem", (e, data) =>
    purchasesDAL.addPurchaseItem(
      data.purchase_id,
      data.product_id,
      data.quantity,
      data.cost_price
    )
  );

  // Expenses
  ipcMain.handle("expenses:getAll", () => expensesDAL.getAllExpenses());
  ipcMain.handle("expenses:create", (e, data) =>
    expensesDAL.addExpense(data.title, data.amount, data.category)
  );

  // Stock movements
  ipcMain.handle("stock:getMovements", () => stockDAL.getAllStockMovements());
  ipcMain.handle("stock:addMovement", (e, data) =>
    stockDAL.addStockMovement(data.product_id, data.change, data.reason)
  );

  // Dashboard data
  ipcMain.handle("dashboard:getDashboardStats", () => getDashboardStats());
  ipcMain.handle("dashboard:getMonthlySalesTrend", () =>
    getMonthlySalesTrend()
  );
  ipcMain.handle("dashboard:getSalesByCategory", () => getSalesByCategory());
  ipcMain.handle("dashboard:getTopSellingProducts", () =>
    getTopSellingProducts()
  );
  ipcMain.handle("dashboard:getRecentSales", () => getRecentSales());
  ipcMain.handle("dashboard:getSalesTrends", () =>
    getSalesTrends()
  );
}

module.exports = { registerIpcHandlers };
