export interface Reseller {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  notes?: string;
}

export interface ResellerSession {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status?: 'active' | 'inactive';
  joinedDate?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface Order {
  id: string;
  resellerId: string;
  resellerName: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  district: string;
  thana: string;
  productDetails: string;
  quantity: number;
  orderAmount: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  notes?: string;
  orderDate: string; // ISO string
  createdAt: string;
}

export interface DailyWork {
  id: string;
  resellerId: string;
  resellerName: string;
  workDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  totalHours: number;
  ordersGenerated: number;
  adSpend: number;
  notes?: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'admin';
}

export interface ResellerPerformance {
  resellerId: string;
  resellerName: string;
  status: 'active' | 'inactive';
  phone?: string;
  totalOrders: number;
  totalSales: number;
  totalAdSpend: number;
  totalHours: number;
  averageOrderValue: number;
  roas: number; // Sales / Ad Spend
  costPerOrder: number; // Ad spend / Orders
}

export interface DashboardStats {
  totalResellers: number;
  activeResellers: number;
  totalOrders: number;
  totalSales: number;
  totalAdSpend: number;
  totalWorkingHours: number;
  overallAOV: number;
  overallROAS: number;
  salesByDate: {
    date: string;
    sales: number;
    adSpend: number;
    orders: number;
    hours: number;
  }[];
  resellerPerformance: ResellerPerformance[];
  recentOrders: Order[];
  recentWorkLogs: DailyWork[];
}

export interface GoogleUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: 'admin' | 'reseller' | 'user';
  resellerId?: string;
}

export interface FraudCheckResult {
  phone: string;
  totalParcels: number;
  totalDelivered: number;
  totalCancelled: number;
  totalFraudReports: any[];
  deliveryRatio: number;
  cancelRatio: number;
  riskLevel: 'safe' | 'moderate' | 'high_risk' | 'fraud_alert' | 'new_customer';
  riskMessage: string;
  source: 'steadfast';
  checkedAt: string;
}

export interface DatabaseInfo {
  type: 'firebase' | 'mysql' | 'json';
  connected: boolean;
  message: string;
  counts: {
    resellers: number;
    orders: number;
    dailyWorks: number;
    products?: number;
  };
  firebaseConfig?: {
    projectId?: string;
    databaseId?: string;
    authDomain?: string;
  };
  mysqlConfig?: {
    host?: string;
    port?: string | number;
    user?: string;
    database?: string;
  };
}

