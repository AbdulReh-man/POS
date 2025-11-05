export {};

declare global {
  // ---------------------------
  // General Version Info
  // ---------------------------
  interface Window {
    versions: {
      node: () => string;
      chrome: () => string;
      electron: () => string;
      ping: () => Promise<unknown>;
      BuiltBy: string;
    };

    // ---------------------------
    // API exposed from preload
    // ---------------------------
    api: {
      // ---------- Users ----------
      users: {
        getAll: () => Promise<User[]>;
        validateCredentials: (email: string, password: string) => Promise<User>;
        create: (data: Partial<User>) => Promise<User>;
        delete: (id: string | number) => Promise<void>;
      };

      // ---------- Store ----------
      store: {
        saveLogin: (data: LoginData) => Promise<void>;
        getLogin: () => Promise<LoginData | null>;
        clearLogin: () => Promise<void>;
        settingsGet: () => Promise<Settings>;
        settingsUpdate: (newSettings: Partial<Settings>) => Promise<void>;
        settingsReset: () => Promise<void>;
      };

      // ---------- File ----------
      file: {
        selectFile: (options?: FileSelectOptions) => Promise<FileSelectResult>;
        getFileStats: (filePath: string) => Promise<{ size: number }>;
        saveIcon: (
          sourcePath: string,
          platformName?: string,
          type?: string
        ) => Promise<string>;
        deleteIcon: (iconPath: string) => Promise<void>;
      };

      // ---------- Storage ----------
      storage: {
        getStoragePaths: () => Promise<StoragePaths>;
        openStorageFolder: () => Promise<void>;
        getAllIcons: () => Promise<string[]>;
        clearAllIcons: () => Promise<void>;
      };

      // ---------- Products ----------
      products: {
        create: (data: Partial<Product>) => Promise<Product>;
        getAll: () => Promise<{ data: Product[] }>;
        getById: (id: string | number) => Promise<Product | undefined>;
        update: (id: string | number, data: Partial<Product>) => Promise<void>;
        delete: (id: string | number) => Promise<void>;
        updateStock: (id: string | number, stock: number) => Promise<void>;
      };

      // ---------- Categories ----------
      categories: {
        getAll: () => Promise<Category[]>;
        create: (data: Partial<Category>) => Promise<void>;
        delete: (id: string | number) => Promise<void>;
        update: (id: string | number, data: Partial<Category>) => Promise<void>;
      };

      // ---------- Suppliers ----------
      suppliers: {
        getAll: () => Promise<Supplier[]>;
        create: (data: Partial<Supplier>) => Promise<void>;
      };

      // ---------- Customers ----------
      customers: {
        getAll: () => Promise<Customer[]>;
        create: (data: Partial<Customer>) => Promise<void>;
      };

      // ---------- Sales ----------
      sales: {
        createFull: (data: Partial<Sale>) => Promise<Sale>;
        addItem: (data: Partial<SaleItem>) => Promise<void>;
        getAll: () => Promise<Sale[]>;
        getById: (id: string | number) => Promise<Sale | undefined>;
        getItems: (sale_id: string | number) => Promise<SaleItem[]>;
        printReceipt: (data: unknown) => Promise<PrinterConfig | null>;
        savePrinter: (data: unknown) => Promise<void>;
        getSavedPrinter: () => Promise<PrinterConfig | null>;
      };

      // ---------- Payments ----------
      payments: {
        record: (data: Partial<Payment>) => Promise<void>;
        getBySale: (sale_id: string | number) => Promise<Payment[]>;
      };

      // ---------- Purchases ----------
      purchases: {
        create: (data: Partial<Purchase>) => Promise<Purchase>;
        addItem: (data: Partial<PurchaseItem>) => Promise<void>;
      };

      // ---------- Expenses ----------
      expenses: {
        getAll: () => Promise<Expense[]>;
        create: (data: Partial<Expense>) => Promise<void>;
      };

      // ---------- Stock ----------
      stock: {
        getMovements: () => Promise<StockMovement[]>;
        addMovement: (data: Partial<StockMovement>) => Promise<void>;
      };

      // ---------- Dashboard ----------
      dashboard: {
        getDashboardStats: () => Promise<DashBoardStats>;
        getSalesTrends: () => Promise<[]>;
        getRecentSales: () => Promise<TodaySale[]>;
      };
    };
  }


  interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
  }

  // ---------------------------
  // ---------------------------
  // Interfaces for common objects
  // ---------------------------
  interface User {
    name?: string;
    email: string;
    role?: string;
    password: string;
  }

  interface ApiResponse {
    error?: string;
    data?: unknown;
  }
  
  interface PrinterConfig {
    success?: boolean;
    error?: object;
    vendorId: number;
    productId: number;
  }

  interface LoginData {
    username: string;
    email: string;
    role: string;
  }

  interface SocialLink {
    name: string;
    link: string;
    iconPath: string;
  }

  interface Settings {
    theme: "dark" | "light";
    logoPath?: string;
    storetype?: "general" | "clothing" | "food";
    storeAddress?: string;
    storeName?: string;
    phone_number?: string;
    website?: string;
    discount?: number;
    footerNote?: string;
    socials?: SocialLink[];
    owner?: string;
    currency?: string;
    taxRate?: number;
    [key: string]: unknown;
  }

  interface FileSelectOptions {
    filters?: { name: string; extensions: string[] }[];
    properties?: Array<"openFile" | "multiSelections" | "openDirectory">;
  }

  interface FileSelectResult {
    canceled: boolean;
    filePaths: string[];
  }

  interface StoragePaths {
    userData: string;
    icons: string;
    logos: string;
  }

  interface Product {
    id: string | number;
    name: string;
    price: number | string;
    qty?: number;
    image_url?: string | null;
    stock: number;
    [key: string]: unknown;
  }

  interface Category {
    id: string | number;
    name: string;
    description?: string;
    [key: string]: unknown;
  }

  interface Supplier {
    id: string | number;
    name: string;
    [key: string]: unknown;
  }

  interface Customer {
    id: string | number;
    name: string;
    [key: string]: unknown;
  }

  interface Sale {
    id: string | number;
    total: number;
    date?: string;
    items?: SaleItem[];
    [key: string]: unknown;
  }

  interface SaleItem {
    id: string | number;
    product_id: string | number;
    name: string;
    price: number;
    qty: number;
    [key: string]: unknown;
  }

  interface Payment {
    id: string | number;
    saleId: string | number;
    amount: number;
    method: string;
    [key: string]: unknown;
  }

  interface Purchase {
    id: string | number;
    total: number;
    [key: string]: unknown;
  }

  interface PurchaseItem {
    id: string | number;
    name: string;
    price: number;
    qty: number;
  }

  interface Expense {
    id: string | number;
    name: string;
    amount: number;
    date?: string;
  }

  interface StockMovement {
    id: string | number;
    productId: string | number;
    qty: number;
    type: "in" | "out";
    date?: string;
  }

  interface DashBoardStats {
    expenses_this_month: number;
    net_profit: number;
    sales_this_month: number;
    sales_today: number;
    total_customers: number;
    total_stock: number;
  }

  interface DashBoardSalesTrend {
    date: Date;
    total_sales: number;
    net_profit: number;
    total_expenses: number;
  }
  
  interface TodaySale {
    created_at: string;
    customer_name: string;
    id: number;
    payment_method: string;
    total: number;
  }
}
