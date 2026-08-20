import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mysql, { Pool } from 'mysql2/promise';
import { Reseller, Order, DailyWork, DashboardStats, ResellerPerformance, DatabaseInfo, Product } from '../src/types';

// Admin Default Credentials
export const DEFAULT_ADMIN = {
  username: 'Admin',
  password: '151002055',
};

// Initial Demo Products
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_01',
    name: 'Wireless Bluetooth Earbuds Pro (Black Edition)',
    price: 1650,
    description: 'High bass, ENC noise reduction, 30h battery life.',
    isDefault: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'prod_02',
    name: 'Premium Smart Watch Ultra (AMOLED + Dual Strap)',
    price: 2400,
    description: 'Bluetooth calling, heart rate & sleep tracker, water resistant.',
    isDefault: false,
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'prod_03',
    name: 'Fast Charging 65W GaN Charger 3-Port',
    price: 1200,
    description: 'Universal fast charging for iPhone, Samsung, MacBooks.',
    isDefault: false,
    createdAt: '2026-01-03T00:00:00.000Z',
  },
  {
    id: 'prod_04',
    name: 'Men Designer Leather Wallet & Belt Gift Combo',
    price: 1950,
    description: '100% genuine leather with custom gift box.',
    isDefault: false,
    createdAt: '2026-01-04T00:00:00.000Z',
  },
  {
    id: 'prod_05',
    name: 'RGB Mechanical Gaming Keyboard with Blue Switches',
    price: 3100,
    description: 'Customizable backlit RGB, anti-ghosting keys.',
    isDefault: false,
    createdAt: '2026-01-05T00:00:00.000Z',
  },
];

// Initial Demo Resellers
const INITIAL_RESELLERS: Reseller[] = [
  {
    id: 'res_01',
    name: 'Tanvir Rahman',
    phone: '01711223344',
    email: 'tanvir.reseller@example.com',
    status: 'active',
    joinedDate: '2026-01-10',
    notes: 'Dhaka region top performer',
  },
  {
    id: 'res_02',
    name: 'Shakil Ahmed',
    phone: '01822334455',
    email: 'shakil.ahmed@example.com',
    status: 'active',
    joinedDate: '2026-01-15',
    notes: 'Chittagong & Sylhet coverage',
  },
  {
    id: 'res_03',
    name: 'Nusrat Jahan',
    phone: '01933445566',
    email: 'nusrat.jahan@example.com',
    status: 'active',
    joinedDate: '2026-02-01',
    notes: 'Facebook & TikTok ads specialist',
  },
  {
    id: 'res_04',
    name: 'Sadia Islam',
    phone: '01644556677',
    email: 'sadia.islam@example.com',
    status: 'active',
    joinedDate: '2026-02-12',
    notes: 'Fashion & apparel specialist',
  },
  {
    id: 'res_05',
    name: 'Arafat Hossain',
    phone: '01555667788',
    email: 'arafat.hossain@example.com',
    status: 'active',
    joinedDate: '2026-02-20',
    notes: 'Gadget & electronics focus',
  },
];

// Initial Demo Orders
const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_1001',
    resellerId: 'res_01',
    resellerName: 'Tanvir Rahman',
    customerName: 'Mohammad Faruk',
    customerPhone: '01710987654',
    customerAddress: 'House 42, Road 7, Dhanmondi',
    district: 'Dhaka',
    thana: 'Dhanmondi',
    productDetails: 'Wireless Bluetooth Earbuds Pro (Black)',
    quantity: 1,
    orderAmount: 1650,
    status: 'Delivered',
    notes: 'Call before delivery',
    orderDate: '2026-08-15T10:30:00.000Z',
    createdAt: '2026-08-15T10:30:00.000Z',
  },
  {
    id: 'ord_1002',
    resellerId: 'res_01',
    resellerName: 'Tanvir Rahman',
    customerName: 'Anika Tabassum',
    customerPhone: '01812345678',
    customerAddress: 'Sector 4, Uttara',
    district: 'Dhaka',
    thana: 'Uttara',
    productDetails: 'Premium Smart Watch Ultra (Orange Strap)',
    quantity: 2,
    orderAmount: 4800,
    status: 'Shipped',
    notes: 'Gift packaging requested',
    orderDate: '2026-08-16T14:15:00.000Z',
    createdAt: '2026-08-16T14:15:00.000Z',
  },
  {
    id: 'ord_1003',
    resellerId: 'res_02',
    resellerName: 'Shakil Ahmed',
    customerName: 'Kamrul Hasan',
    customerPhone: '01919876543',
    customerAddress: 'GEC Circle, Nasirabad',
    district: 'Chittagong',
    thana: 'Khulshi',
    productDetails: 'Fast Charging 65W GaN Charger',
    quantity: 2,
    orderAmount: 2400,
    status: 'Delivered',
    notes: '',
    orderDate: '2026-08-16T16:45:00.000Z',
    createdAt: '2026-08-16T16:45:00.000Z',
  },
  {
    id: 'ord_1004',
    resellerId: 'res_03',
    resellerName: 'Nusrat Jahan',
    customerName: 'Rashedul Karim',
    customerPhone: '01611223388',
    customerAddress: 'Zindabazar, Amberkhana Road',
    district: 'Sylhet',
    thana: 'Kotwali',
    productDetails: 'Men Designer Leather Wallet & Belt Combo',
    quantity: 1,
    orderAmount: 1950,
    status: 'Confirmed',
    notes: 'Urgent delivery needed',
    orderDate: '2026-08-17T11:20:00.000Z',
    createdAt: '2026-08-17T11:20:00.000Z',
  },
  {
    id: 'ord_1005',
    resellerId: 'res_04',
    resellerName: 'Sadia Islam',
    customerName: 'Meherun Nesa',
    customerPhone: '01511224499',
    customerAddress: 'KDA Avenue, Royal Mor',
    district: 'Khulna',
    thana: 'Sonadanga',
    productDetails: 'Silk Kurti & Scarf Set (Size L)',
    quantity: 1,
    orderAmount: 2200,
    status: 'Confirmed',
    notes: '',
    orderDate: '2026-08-18T09:10:00.000Z',
    createdAt: '2026-08-18T09:10:00.000Z',
  },
  {
    id: 'ord_1006',
    resellerId: 'res_01',
    resellerName: 'Tanvir Rahman',
    customerName: 'Zahidul Islam',
    customerPhone: '01712398711',
    customerAddress: 'Block C, Bashundhara R/A',
    district: 'Dhaka',
    thana: 'Bhatara',
    productDetails: 'Mini Wireless Portable Speaker RGB',
    quantity: 3,
    orderAmount: 3600,
    status: 'Pending',
    notes: 'Deliver afternoon',
    orderDate: '2026-08-19T07:45:00.000Z',
    createdAt: '2026-08-19T07:45:00.000Z',
  },
  {
    id: 'ord_1007',
    resellerId: 'res_05',
    resellerName: 'Arafat Hossain',
    customerName: 'Jannatul Ferdous',
    customerPhone: '01811447700',
    customerAddress: 'Upashahar Main Road',
    district: 'Rajshahi',
    thana: 'Boalia',
    productDetails: 'RGB Mechanical Gaming Keyboard',
    quantity: 1,
    orderAmount: 3100,
    status: 'Pending',
    notes: 'Include invoice',
    orderDate: '2026-08-19T08:05:00.000Z',
    createdAt: '2026-08-19T08:05:00.000Z',
  }
];

// Initial Demo Daily Works
const INITIAL_DAILY_WORKS: DailyWork[] = [
  {
    id: 'work_1001',
    resellerId: 'res_01',
    resellerName: 'Tanvir Rahman',
    workDate: '2026-08-16',
    startTime: '10:00',
    endTime: '18:30',
    totalHours: 8.5,
    ordersGenerated: 4,
    adSpend: 650,
    notes: 'Ran Meta Ads targeting Dhaka professionals. Good CTR.',
    createdAt: '2026-08-16T18:35:00.000Z',
  },
  {
    id: 'work_1002',
    resellerId: 'res_02',
    resellerName: 'Shakil Ahmed',
    workDate: '2026-08-16',
    startTime: '11:00',
    endTime: '17:00',
    totalHours: 6.0,
    ordersGenerated: 2,
    adSpend: 400,
    notes: 'Chittagong campaign testing new creative video.',
    createdAt: '2026-08-16T17:10:00.000Z',
  },
  {
    id: 'work_1003',
    resellerId: 'res_03',
    resellerName: 'Nusrat Jahan',
    workDate: '2026-08-17',
    startTime: '09:30',
    endTime: '18:00',
    totalHours: 8.5,
    ordersGenerated: 5,
    adSpend: 800,
    notes: 'TikTok live stream campaign and sponsored post.',
    createdAt: '2026-08-17T18:05:00.000Z',
  },
  {
    id: 'work_1004',
    resellerId: 'res_04',
    resellerName: 'Sadia Islam',
    workDate: '2026-08-18',
    startTime: '10:00',
    endTime: '16:30',
    totalHours: 6.5,
    ordersGenerated: 3,
    adSpend: 450,
    notes: 'Instagram story ads for apparel items.',
    createdAt: '2026-08-18T16:35:00.000Z',
  },
  {
    id: 'work_1005',
    resellerId: 'res_01',
    resellerName: 'Tanvir Rahman',
    workDate: '2026-08-18',
    startTime: '10:00',
    endTime: '19:00',
    totalHours: 9.0,
    ordersGenerated: 6,
    adSpend: 950,
    notes: 'High conversion day on smart watch campaign.',
    createdAt: '2026-08-18T19:05:00.000Z',
  },
  {
    id: 'work_1006',
    resellerId: 'res_05',
    resellerName: 'Arafat Hossain',
    workDate: '2026-08-19',
    startTime: '09:00',
    endTime: '15:00',
    totalHours: 6.0,
    ordersGenerated: 2,
    adSpend: 350,
    notes: 'Morning shift setup tech promotion ads.',
    createdAt: '2026-08-19T15:02:00.000Z',
  },
];

interface SchemaStore {
  admin: {
    username: string;
    passwordHash: string;
  };
  products: Product[];
  resellers: Reseller[];
  orders: Order[];
  dailyWorks: DailyWork[];
}

// Local File Persistence Handler
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

let pool: Pool | null = null;
let isUsingMySQL = false;
let mysqlInitError: string | null = null;

// Helper to calculate hours between HH:mm
export function calculateWorkingHours(start: string, end: string): number {
  if (!start || !end) return 0;
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;
  
  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;
  if (endMinutes < startMinutes) {
    // Passed midnight
    endMinutes += 24 * 60;
  }
  const diff = (endMinutes - startMinutes) / 60;
  return Math.max(0, Math.round(diff * 100) / 100);
}

// Load JSON Database
function loadJsonDB(): SchemaStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialStore: SchemaStore = {
        admin: {
          username: DEFAULT_ADMIN.username,
          passwordHash: bcrypt.hashSync(DEFAULT_ADMIN.password, 10),
        },
        products: INITIAL_PRODUCTS,
        resellers: INITIAL_RESELLERS,
        orders: INITIAL_ORDERS,
        dailyWorks: INITIAL_DAILY_WORKS,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialStore, null, 2), 'utf-8');
      return initialStore;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data) as SchemaStore;
    if (!parsed.products || parsed.products.length === 0) {
      parsed.products = INITIAL_PRODUCTS;
      saveJsonDB(parsed);
    }
    return parsed;
  } catch (err) {
    console.error('Error reading JSON DB, fallback to initial state:', err);
    return {
      admin: {
        username: DEFAULT_ADMIN.username,
        passwordHash: bcrypt.hashSync(DEFAULT_ADMIN.password, 10),
      },
      products: INITIAL_PRODUCTS,
      resellers: INITIAL_RESELLERS,
      orders: INITIAL_ORDERS,
      dailyWorks: INITIAL_DAILY_WORKS,
    };
  }
}

// Save JSON Database
function saveJsonDB(data: SchemaStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing JSON DB:', err);
  }
}

// Initialize Database (tries MySQL if configured, else uses Local File JSON)
export async function initDatabase() {
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;
  const port = Number(process.env.MYSQL_PORT) || 3306;

  if (host && user && database) {
    try {
      console.log(`Connecting to MySQL database at ${host}:${port}/${database}...`);
      pool = mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      // Test connection
      const conn = await pool.getConnection();
      console.log('Connected to MySQL successfully!');
      
      // Run MySQL table migrations
      await conn.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(100) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
          description TEXT,
          is_default BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS resellers (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          phone VARCHAR(50),
          email VARCHAR(150),
          status ENUM('active', 'inactive') DEFAULT 'active',
          joined_date VARCHAR(20),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(50) PRIMARY KEY,
          reseller_id VARCHAR(50) NOT NULL,
          reseller_name VARCHAR(150) NOT NULL,
          customer_name VARCHAR(150) NOT NULL,
          customer_phone VARCHAR(50) NOT NULL,
          customer_address TEXT NOT NULL,
          district VARCHAR(100) NOT NULL,
          thana VARCHAR(100) NOT NULL,
          product_details TEXT NOT NULL,
          quantity INT NOT NULL DEFAULT 1,
          order_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
          status ENUM('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
          notes TEXT,
          order_date VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_reseller (reseller_id),
          INDEX idx_customer_phone (customer_phone),
          INDEX idx_order_date (order_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS daily_works (
          id VARCHAR(50) PRIMARY KEY,
          reseller_id VARCHAR(50) NOT NULL,
          reseller_name VARCHAR(150) NOT NULL,
          work_date VARCHAR(20) NOT NULL,
          start_time VARCHAR(10) NOT NULL,
          end_time VARCHAR(10) NOT NULL,
          total_hours DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
          orders_generated INT NOT NULL DEFAULT 0,
          ad_spend DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_work_reseller (reseller_id),
          INDEX idx_work_date (work_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Check admin seed
      const [adminRows] = await conn.query('SELECT * FROM admins WHERE username = ?', [DEFAULT_ADMIN.username]);
      if ((adminRows as any[]).length === 0) {
        const hash = bcrypt.hashSync(DEFAULT_ADMIN.password, 10);
        await conn.query('INSERT INTO admins (username, password_hash) VALUES (?, ?)', [DEFAULT_ADMIN.username, hash]);
        console.log(`Seeded default admin (${DEFAULT_ADMIN.username}) in MySQL.`);
      }

      // Check products seed
      const [productRows] = await conn.query('SELECT COUNT(*) as count FROM products');
      if ((productRows as any[])[0].count === 0) {
        for (const p of INITIAL_PRODUCTS) {
          await conn.query(
            'INSERT INTO products (id, name, price, description, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [p.id, p.name, p.price, p.description || '', p.isDefault ? 1 : 0, p.createdAt || new Date().toISOString()]
          );
        }
      }

      // Check resellers seed
      const [resellerRows] = await conn.query('SELECT COUNT(*) as count FROM resellers');
      if ((resellerRows as any[])[0].count === 0) {
        for (const r of INITIAL_RESELLERS) {
          await conn.query(
            'INSERT INTO resellers (id, name, phone, email, status, joined_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [r.id, r.name, r.phone || '', r.email || '', r.status, r.joinedDate, r.notes || '']
          );
        }
        for (const o of INITIAL_ORDERS) {
          await conn.query(
            'INSERT INTO orders (id, reseller_id, reseller_name, customer_name, customer_phone, customer_address, district, thana, product_details, quantity, order_amount, status, notes, order_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [o.id, o.resellerId, o.resellerName, o.customerName, o.customerPhone, o.customerAddress, o.district, o.thana, o.productDetails, o.quantity, o.orderAmount, o.status, o.notes || '', o.orderDate]
          );
        }
        for (const w of INITIAL_DAILY_WORKS) {
          await conn.query(
            'INSERT INTO daily_works (id, reseller_id, reseller_name, work_date, start_time, end_time, total_hours, orders_generated, ad_spend, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [w.id, w.resellerId, w.resellerName, w.workDate, w.startTime, w.endTime, w.totalHours, w.ordersGenerated, w.adSpend, w.notes || '']
          );
        }
        console.log('Seeded sample data in MySQL!');
      }

      conn.release();
      isUsingMySQL = true;
      mysqlInitError = null;
    } catch (err: any) {
      console.warn('MySQL connection failed, falling back to local persistent JSON DB:', err.message);
      isUsingMySQL = false;
      mysqlInitError = err.message;
      loadJsonDB();
    }
  } else {
    // No MySQL env variables supplied, use file persistence
    console.log('No MySQL credentials in .env, using local persistent JSON DB (/data/database.json)');
    loadJsonDB();
  }
}

// Database Status for Admin & Setup Assistant
export async function getDatabaseStatus(): Promise<DatabaseInfo> {
  if (isUsingMySQL && pool) {
    try {
      const [rCount] = await pool.query('SELECT COUNT(*) as c FROM resellers');
      const [oCount] = await pool.query('SELECT COUNT(*) as c FROM orders');
      const [wCount] = await pool.query('SELECT COUNT(*) as c FROM daily_works');
      return {
        type: 'mysql',
        connected: true,
        message: 'Connected to MySQL database',
        counts: {
          resellers: (rCount as any[])[0]?.c || 0,
          orders: (oCount as any[])[0]?.c || 0,
          dailyWorks: (wCount as any[])[0]?.c || 0,
        },
        mysqlConfig: {
          host: process.env.MYSQL_HOST,
          port: process.env.MYSQL_PORT || 3306,
          user: process.env.MYSQL_USER,
          database: process.env.MYSQL_DATABASE,
        },
      };
    } catch (err: any) {
      return {
        type: 'mysql',
        connected: false,
        message: `MySQL Error: ${err.message}`,
        counts: { resellers: 0, orders: 0, dailyWorks: 0 },
      };
    }
  }

  const db = loadJsonDB();
  return {
    type: 'json',
    connected: true,
    message: mysqlInitError
      ? `Operating in local JSON storage (MySQL connection attempt failed: ${mysqlInitError})`
      : 'Operating in fast local persistent storage. (To connect MySQL, set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE in .env)',
    counts: {
      resellers: db.resellers.length,
      orders: db.orders.length,
      dailyWorks: db.dailyWorks.length,
    },
  };
}

// Admin Authentication Check
export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (isUsingMySQL && pool) {
    const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [DEFAULT_ADMIN.username]);
    const admin = (rows as any[])[0];
    if (!admin) return false;
    return bcrypt.compareSync(password, admin.password_hash);
  }
  const db = loadJsonDB();
  return bcrypt.compareSync(password, db.admin.passwordHash);
}

// Resellers Operations
export async function getResellers(onlyActive = false): Promise<Reseller[]> {
  if (isUsingMySQL && pool) {
    let query = 'SELECT id, name, phone, email, status, joined_date as joinedDate, notes FROM resellers';
    const params: any[] = [];
    if (onlyActive) {
      query += ' WHERE status = ?';
      params.push('active');
    }
    query += ' ORDER BY name ASC';
    const [rows] = await pool.query(query, params);
    return rows as Reseller[];
  }
  const db = loadJsonDB();
  let list = db.resellers;
  if (onlyActive) {
    list = list.filter((r) => r.status === 'active');
  }
  return list.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createReseller(data: Omit<Reseller, 'id' | 'joinedDate'> & { joinedDate?: string }): Promise<Reseller> {
  const newReseller: Reseller = {
    id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: data.name.trim(),
    phone: data.phone?.trim() || '',
    email: data.email?.trim() || '',
    status: data.status || 'active',
    joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
    notes: data.notes?.trim() || '',
  };

  if (isUsingMySQL && pool) {
    await pool.query(
      'INSERT INTO resellers (id, name, phone, email, status, joined_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [newReseller.id, newReseller.name, newReseller.phone, newReseller.email, newReseller.status, newReseller.joinedDate, newReseller.notes]
    );
    return newReseller;
  }

  const db = loadJsonDB();
  db.resellers.unshift(newReseller);
  saveJsonDB(db);
  return newReseller;
}

export async function updateReseller(id: string, data: Partial<Reseller>): Promise<Reseller | null> {
  if (isUsingMySQL && pool) {
    const [rows] = await pool.query('SELECT * FROM resellers WHERE id = ?', [id]);
    if ((rows as any[]).length === 0) return null;
    
    await pool.query(
      'UPDATE resellers SET name = COALESCE(?, name), phone = COALESCE(?, phone), email = COALESCE(?, email), status = COALESCE(?, status), notes = COALESCE(?, notes) WHERE id = ?',
      [data.name, data.phone, data.email, data.status, data.notes, id]
    );
    const [updated] = await pool.query('SELECT id, name, phone, email, status, joined_date as joinedDate, notes FROM resellers WHERE id = ?', [id]);
    return (updated as any[])[0];
  }

  const db = loadJsonDB();
  const idx = db.resellers.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  db.resellers[idx] = { ...db.resellers[idx], ...data };
  saveJsonDB(db);
  return db.resellers[idx];
}

export async function deleteReseller(id: string): Promise<boolean> {
  if (isUsingMySQL && pool) {
    const [res] = await pool.query('DELETE FROM resellers WHERE id = ?', [id]);
    return (res as any).affectedRows > 0;
  }
  const db = loadJsonDB();
  const initialLen = db.resellers.length;
  db.resellers = db.resellers.filter((r) => r.id !== id);
  if (db.resellers.length !== initialLen) {
    saveJsonDB(db);
    return true;
  }
  return false;
}

// Reseller Login Authentication (Name & Phone as Password)
export async function verifyResellerLogin(name: string, phone: string): Promise<Reseller | null> {
  const cleanName = (name || '').trim().toLowerCase();
  const cleanPhone = (phone || '').replace(/[\s\-\+]/g, '');

  if (!cleanName || !cleanPhone) return null;

  if (isUsingMySQL && pool) {
    const [rows] = await pool.query(
      `SELECT id, name, phone, email, status, joined_date as joinedDate, notes 
       FROM resellers 
       WHERE LOWER(name) = ? AND REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') LIKE ? AND status = 'active'`,
      [cleanName, `%${cleanPhone.slice(-10)}`]
    );
    const matched = (rows as any[])[0];
    return matched || null;
  }

  const db = loadJsonDB();
  const found = db.resellers.find((r) => {
    if (r.status !== 'active') return false;
    const rName = (r.name || '').trim().toLowerCase();
    const rPhone = (r.phone || '').replace(/[\s\-\+]/g, '');
    const nameMatch = rName === cleanName || rName.includes(cleanName) || cleanName.includes(rName);
    const phoneMatch = rPhone.slice(-10) === cleanPhone.slice(-10) || rPhone === cleanPhone;
    return nameMatch && phoneMatch;
  });

  return found || null;
}

// ==========================================
// PRODUCTS OPERATIONS
// ==========================================

export async function getProducts(): Promise<Product[]> {
  if (isUsingMySQL && pool) {
    const [rows] = await pool.query(
      'SELECT id, name, price, description, is_default as isDefault, created_at as createdAt FROM products ORDER BY is_default DESC, name ASC'
    );
    return (rows as any[]).map((r) => ({
      ...r,
      price: Number(r.price),
      isDefault: Boolean(r.isDefault),
    }));
  }

  const db = loadJsonDB();
  return (db.products || INITIAL_PRODUCTS).sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return a.name.localeCompare(b.name);
  });
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const newProduct: Product = {
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: data.name.trim(),
    price: Number(data.price) || 0,
    description: data.description?.trim() || '',
    isDefault: Boolean(data.isDefault),
    createdAt: new Date().toISOString(),
  };

  if (isUsingMySQL && pool) {
    if (newProduct.isDefault) {
      await pool.query('UPDATE products SET is_default = FALSE');
    }
    await pool.query(
      'INSERT INTO products (id, name, price, description, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [newProduct.id, newProduct.name, newProduct.price, newProduct.description, newProduct.isDefault ? 1 : 0, newProduct.createdAt]
    );
    return newProduct;
  }

  const db = loadJsonDB();
  if (!db.products) db.products = INITIAL_PRODUCTS;
  if (newProduct.isDefault) {
    db.products.forEach((p) => (p.isDefault = false));
  }
  db.products.unshift(newProduct);
  saveJsonDB(db);
  return newProduct;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  if (isUsingMySQL && pool) {
    if (data.isDefault) {
      await pool.query('UPDATE products SET is_default = FALSE');
    }
    const fields: string[] = [];
    const values: any[] = [];
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.price !== undefined) { fields.push('price = ?'); values.push(Number(data.price)); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.isDefault !== undefined) { fields.push('is_default = ?'); values.push(data.isDefault ? 1 : 0); }
    if (fields.length === 0) return null;
    values.push(id);
    await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.query('SELECT id, name, price, description, is_default as isDefault, created_at as createdAt FROM products WHERE id = ?', [id]);
    const updated = (rows as any[])[0];
    if (!updated) return null;
    return { ...updated, price: Number(updated.price), isDefault: Boolean(updated.isDefault) };
  }

  const db = loadJsonDB();
  if (!db.products) db.products = INITIAL_PRODUCTS;
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  if (data.isDefault) {
    db.products.forEach((p) => (p.isDefault = false));
  }
  db.products[idx] = {
    ...db.products[idx],
    ...data,
    price: data.price !== undefined ? Number(data.price) : db.products[idx].price,
  };
  saveJsonDB(db);
  return db.products[idx];
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isUsingMySQL && pool) {
    const [res] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return (res as any).affectedRows > 0;
  }
  const db = loadJsonDB();
  if (!db.products) db.products = INITIAL_PRODUCTS;
  const initialLen = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  if (db.products.length !== initialLen) {
    saveJsonDB(db);
    return true;
  }
  return false;
}

export async function setDefaultProduct(id: string): Promise<Product | null> {
  return updateProduct(id, { isDefault: true });
}

// Orders Operations
export async function getOrders(filters?: {
  resellerId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}): Promise<Order[]> {
  if (isUsingMySQL && pool) {
    let query = 'SELECT id, reseller_id as resellerId, reseller_name as resellerName, customer_name as customerName, customer_phone as customerPhone, customer_address as customerAddress, district, thana, product_details as productDetails, quantity, order_amount as orderAmount, status, notes, order_date as orderDate, created_at as createdAt FROM orders WHERE 1=1';
    const params: any[] = [];

    if (filters?.resellerId) {
      query += ' AND reseller_id = ?';
      params.push(filters.resellerId);
    }
    if (filters?.status && filters.status !== 'all') {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters?.startDate) {
      query += ' AND order_date >= ?';
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      query += ' AND order_date <= ?';
      params.push(filters.endDate + 'T23:59:59.999Z');
    }
    if (filters?.search) {
      query += ' AND (customer_name LIKE ? OR customer_phone LIKE ? OR product_details LIKE ? OR district LIKE ?)';
      const s = `%${filters.search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY order_date DESC';
    const [rows] = await pool.query(query, params);
    return (rows as any[]).map((r) => ({
      ...r,
      orderAmount: Number(r.orderAmount),
      quantity: Number(r.quantity),
    }));
  }

  const db = loadJsonDB();
  let orders = db.orders;

  if (filters?.resellerId) {
    orders = orders.filter((o) => o.resellerId === filters.resellerId);
  }
  if (filters?.status && filters.status !== 'all') {
    orders = orders.filter((o) => o.status === filters.status);
  }
  if (filters?.startDate) {
    orders = orders.filter((o) => o.orderDate >= filters.startDate!);
  }
  if (filters?.endDate) {
    const endISO = filters.endDate + 'T23:59:59.999Z';
    orders = orders.filter((o) => o.orderDate <= endISO);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        o.productDetails.toLowerCase().includes(q) ||
        o.district.toLowerCase().includes(q) ||
        o.thana.toLowerCase().includes(q)
    );
  }

  return orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
}

export async function createOrder(data: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const now = new Date().toISOString();
  const newOrder: Order = {
    id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    resellerId: data.resellerId,
    resellerName: data.resellerName,
    customerName: data.customerName.trim(),
    customerPhone: data.customerPhone.trim(),
    customerAddress: data.customerAddress.trim(),
    district: data.district.trim(),
    thana: data.thana.trim(),
    productDetails: data.productDetails.trim(),
    quantity: Number(data.quantity) || 1,
    orderAmount: Number(data.orderAmount) || 0,
    status: data.status || 'Pending',
    notes: data.notes?.trim() || '',
    orderDate: data.orderDate || now,
    createdAt: now,
  };

  if (isUsingMySQL && pool) {
    await pool.query(
      `INSERT INTO orders (id, reseller_id, reseller_name, customer_name, customer_phone, customer_address, district, thana, product_details, quantity, order_amount, status, notes, order_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newOrder.id,
        newOrder.resellerId,
        newOrder.resellerName,
        newOrder.customerName,
        newOrder.customerPhone,
        newOrder.customerAddress,
        newOrder.district,
        newOrder.thana,
        newOrder.productDetails,
        newOrder.quantity,
        newOrder.orderAmount,
        newOrder.status,
        newOrder.notes,
        newOrder.orderDate,
      ]
    );
    return newOrder;
  }

  const db = loadJsonDB();
  db.orders.unshift(newOrder);
  saveJsonDB(db);
  return newOrder;
}

export async function updateOrder(id: string, data: Partial<Order>): Promise<Order | null> {
  if (isUsingMySQL && pool) {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.customerName !== undefined) { fields.push('customer_name = ?'); values.push(data.customerName); }
    if (data.customerPhone !== undefined) { fields.push('customer_phone = ?'); values.push(data.customerPhone); }
    if (data.customerAddress !== undefined) { fields.push('customer_address = ?'); values.push(data.customerAddress); }
    if (data.district !== undefined) { fields.push('district = ?'); values.push(data.district); }
    if (data.thana !== undefined) { fields.push('thana = ?'); values.push(data.thana); }
    if (data.productDetails !== undefined) { fields.push('product_details = ?'); values.push(data.productDetails); }
    if (data.quantity !== undefined) { fields.push('quantity = ?'); values.push(data.quantity); }
    if (data.orderAmount !== undefined) { fields.push('order_amount = ?'); values.push(data.orderAmount); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
    if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }
    if (data.resellerId !== undefined) { fields.push('reseller_id = ?'); values.push(data.resellerId); }
    if (data.resellerName !== undefined) { fields.push('reseller_name = ?'); values.push(data.resellerName); }

    if (fields.length === 0) return null;
    values.push(id);

    await pool.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.query('SELECT id, reseller_id as resellerId, reseller_name as resellerName, customer_name as customerName, customer_phone as customerPhone, customer_address as customerAddress, district, thana, product_details as productDetails, quantity, order_amount as orderAmount, status, notes, order_date as orderDate, created_at as createdAt FROM orders WHERE id = ?', [id]);
    return (rows as any[])[0] || null;
  }

  const db = loadJsonDB();
  const idx = db.orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  db.orders[idx] = { ...db.orders[idx], ...data };
  saveJsonDB(db);
  return db.orders[idx];
}

export async function deleteOrder(id: string): Promise<boolean> {
  if (isUsingMySQL && pool) {
    const [res] = await pool.query('DELETE FROM orders WHERE id = ?', [id]);
    return (res as any).affectedRows > 0;
  }
  const db = loadJsonDB();
  const initialLen = db.orders.length;
  db.orders = db.orders.filter((o) => o.id !== id);
  if (db.orders.length !== initialLen) {
    saveJsonDB(db);
    return true;
  }
  return false;
}

// Daily Work Operations
export async function getDailyWorks(filters?: {
  resellerId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<DailyWork[]> {
  if (isUsingMySQL && pool) {
    let query = 'SELECT id, reseller_id as resellerId, reseller_name as resellerName, work_date as workDate, start_time as startTime, end_time as endTime, total_hours as totalHours, orders_generated as ordersGenerated, ad_spend as adSpend, notes, created_at as createdAt FROM daily_works WHERE 1=1';
    const params: any[] = [];

    if (filters?.resellerId) {
      query += ' AND reseller_id = ?';
      params.push(filters.resellerId);
    }
    if (filters?.startDate) {
      query += ' AND work_date >= ?';
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      query += ' AND work_date <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY work_date DESC, created_at DESC';
    const [rows] = await pool.query(query, params);
    return (rows as any[]).map((r) => ({
      ...r,
      totalHours: Number(r.totalHours),
      ordersGenerated: Number(r.ordersGenerated),
      adSpend: Number(r.adSpend),
    }));
  }

  const db = loadJsonDB();
  let works = db.dailyWorks;

  if (filters?.resellerId) {
    works = works.filter((w) => w.resellerId === filters.resellerId);
  }
  if (filters?.startDate) {
    works = works.filter((w) => w.workDate >= filters.startDate!);
  }
  if (filters?.endDate) {
    works = works.filter((w) => w.workDate <= filters.endDate!);
  }

  return works.sort((a, b) => b.workDate.localeCompare(a.workDate) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createDailyWork(data: Omit<DailyWork, 'id' | 'totalHours' | 'createdAt'> & { totalHours?: number }): Promise<DailyWork> {
  const calculatedHours = data.totalHours !== undefined ? data.totalHours : calculateWorkingHours(data.startTime, data.endTime);
  const now = new Date().toISOString();
  
  const newWork: DailyWork = {
    id: `work_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    resellerId: data.resellerId,
    resellerName: data.resellerName,
    workDate: data.workDate || now.split('T')[0],
    startTime: data.startTime,
    endTime: data.endTime,
    totalHours: Number(calculatedHours) || 0,
    ordersGenerated: Number(data.ordersGenerated) || 0,
    adSpend: Number(data.adSpend) || 0,
    notes: data.notes?.trim() || '',
    createdAt: now,
  };

  if (isUsingMySQL && pool) {
    await pool.query(
      `INSERT INTO daily_works (id, reseller_id, reseller_name, work_date, start_time, end_time, total_hours, orders_generated, ad_spend, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newWork.id,
        newWork.resellerId,
        newWork.resellerName,
        newWork.workDate,
        newWork.startTime,
        newWork.endTime,
        newWork.totalHours,
        newWork.ordersGenerated,
        newWork.adSpend,
        newWork.notes,
      ]
    );
    return newWork;
  }

  const db = loadJsonDB();
  db.dailyWorks.unshift(newWork);
  saveJsonDB(db);
  return newWork;
}

export async function updateDailyWork(id: string, data: Partial<DailyWork>): Promise<DailyWork | null> {
  if (isUsingMySQL && pool) {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.workDate !== undefined) { fields.push('work_date = ?'); values.push(data.workDate); }
    if (data.startTime !== undefined) { fields.push('start_time = ?'); values.push(data.startTime); }
    if (data.endTime !== undefined) { fields.push('end_time = ?'); values.push(data.endTime); }
    if (data.totalHours !== undefined) { fields.push('total_hours = ?'); values.push(data.totalHours); }
    if (data.ordersGenerated !== undefined) { fields.push('orders_generated = ?'); values.push(data.ordersGenerated); }
    if (data.adSpend !== undefined) { fields.push('ad_spend = ?'); values.push(data.adSpend); }
    if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }

    if (fields.length === 0) return null;
    values.push(id);

    await pool.query(`UPDATE daily_works SET ${fields.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.query('SELECT id, reseller_id as resellerId, reseller_name as resellerName, work_date as workDate, start_time as startTime, end_time as endTime, total_hours as totalHours, orders_generated as ordersGenerated, ad_spend as adSpend, notes, created_at as createdAt FROM daily_works WHERE id = ?', [id]);
    return (rows as any[])[0] || null;
  }

  const db = loadJsonDB();
  const idx = db.dailyWorks.findIndex((w) => w.id === id);
  if (idx === -1) return null;

  let totalHours = data.totalHours;
  if (totalHours === undefined && (data.startTime || data.endTime)) {
    const start = data.startTime || db.dailyWorks[idx].startTime;
    const end = data.endTime || db.dailyWorks[idx].endTime;
    totalHours = calculateWorkingHours(start, end);
  }

  db.dailyWorks[idx] = {
    ...db.dailyWorks[idx],
    ...data,
    ...(totalHours !== undefined ? { totalHours } : {}),
  };
  saveJsonDB(db);
  return db.dailyWorks[idx];
}

export async function deleteDailyWork(id: string): Promise<boolean> {
  if (isUsingMySQL && pool) {
    const [res] = await pool.query('DELETE FROM daily_works WHERE id = ?', [id]);
    return (res as any).affectedRows > 0;
  }
  const db = loadJsonDB();
  const initialLen = db.dailyWorks.length;
  db.dailyWorks = db.dailyWorks.filter((w) => w.id !== id);
  if (db.dailyWorks.length !== initialLen) {
    saveJsonDB(db);
    return true;
  }
  return false;
}

// Aggregated Dashboard Stats Calculation
export async function getDashboardStats(filters?: { startDate?: string; endDate?: string; resellerId?: string }): Promise<DashboardStats> {
  const resellers = await getResellers();
  const orders = await getOrders(filters);
  const dailyWorks = await getDailyWorks(filters);

  const totalResellers = resellers.length;
  const activeResellers = resellers.filter((r) => r.status === 'active').length;
  const totalOrders = orders.length;
  const totalSales = orders.reduce((sum, o) => sum + (o.orderAmount || 0), 0);
  const totalAdSpend = dailyWorks.reduce((sum, w) => sum + (w.adSpend || 0), 0);
  const totalWorkingHours = dailyWorks.reduce((sum, w) => sum + (w.totalHours || 0), 0);

  const overallAOV = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  const overallROAS = totalAdSpend > 0 ? Math.round((totalSales / totalAdSpend) * 100) / 100 : 0;

  // Build Reseller-Wise Performance
  const resellerPerformance: ResellerPerformance[] = resellers.map((r) => {
    const rOrders = orders.filter((o) => o.resellerId === r.id);
    const rWorks = dailyWorks.filter((w) => w.resellerId === r.id);

    const rTotalOrders = rOrders.length;
    const rTotalSales = rOrders.reduce((sum, o) => sum + (o.orderAmount || 0), 0);
    const rTotalAdSpend = rWorks.reduce((sum, w) => sum + (w.adSpend || 0), 0);
    const rTotalHours = rWorks.reduce((sum, w) => sum + (w.totalHours || 0), 0);

    const averageOrderValue = rTotalOrders > 0 ? Math.round(rTotalSales / rTotalOrders) : 0;
    const roas = rTotalAdSpend > 0 ? Math.round((rTotalSales / rTotalAdSpend) * 100) / 100 : 0;
    const costPerOrder = rTotalOrders > 0 ? Math.round(rTotalAdSpend / rTotalOrders) : 0;

    return {
      resellerId: r.id,
      resellerName: r.name,
      status: r.status,
      phone: r.phone,
      totalOrders: rTotalOrders,
      totalSales: rTotalSales,
      totalAdSpend: rTotalAdSpend,
      totalHours: Math.round(rTotalHours * 10) / 10,
      averageOrderValue,
      roas,
      costPerOrder,
    };
  });

  // Group by Date for Charts
  const dateMap = new Map<string, { sales: number; adSpend: number; orders: number; hours: number }>();
  
  orders.forEach((o) => {
    const d = o.orderDate.split('T')[0];
    const existing = dateMap.get(d) || { sales: 0, adSpend: 0, orders: 0, hours: 0 };
    existing.sales += o.orderAmount || 0;
    existing.orders += 1;
    dateMap.set(d, existing);
  });

  dailyWorks.forEach((w) => {
    const d = w.workDate;
    const existing = dateMap.get(d) || { sales: 0, adSpend: 0, orders: 0, hours: 0 };
    existing.adSpend += w.adSpend || 0;
    existing.hours += w.totalHours || 0;
    dateMap.set(d, existing);
  });

  const salesByDate = Array.from(dateMap.entries())
    .map(([date, val]) => ({
      date,
      sales: Math.round(val.sales),
      adSpend: Math.round(val.adSpend),
      orders: val.orders,
      hours: Math.round(val.hours * 10) / 10,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalResellers,
    activeResellers,
    totalOrders,
    totalSales,
    totalAdSpend,
    totalWorkingHours: Math.round(totalWorkingHours * 10) / 10,
    overallAOV,
    overallROAS,
    salesByDate,
    resellerPerformance: resellerPerformance.sort((a, b) => b.totalSales - a.totalSales),
    recentOrders: orders.slice(0, 10),
    recentWorkLogs: dailyWorks.slice(0, 10),
  };
}

// MySQL Schema Export Guide
export const MYSQL_SCHEMA_SQL = `
-- ==========================================================
-- E-COMMERCE RESELLER MANAGEMENT SYSTEM: MYSQL DATABASE SCHEMA
-- ==========================================================

CREATE DATABASE IF NOT EXISTS reseller_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE reseller_db;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Resellers Table
CREATE TABLE IF NOT EXISTS resellers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(150),
  status ENUM('active', 'inactive') DEFAULT 'active',
  joined_date VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  reseller_id VARCHAR(50) NOT NULL,
  reseller_name VARCHAR(150) NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_address TEXT NOT NULL,
  district VARCHAR(100) NOT NULL,
  thana VARCHAR(100) NOT NULL,
  product_details TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  order_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status ENUM('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
  notes TEXT,
  order_date VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reseller (reseller_id),
  INDEX idx_customer_phone (customer_phone),
  INDEX idx_order_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Daily Works & Performance Table
CREATE TABLE IF NOT EXISTS daily_works (
  id VARCHAR(50) PRIMARY KEY,
  reseller_id VARCHAR(50) NOT NULL,
  reseller_name VARCHAR(150) NOT NULL,
  work_date VARCHAR(20) NOT NULL,
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL,
  total_hours DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  orders_generated INT NOT NULL DEFAULT 0,
  ad_spend DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_work_reseller (reseller_id),
  INDEX idx_work_date (work_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;
