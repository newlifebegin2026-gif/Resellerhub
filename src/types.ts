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
  price: number; // Selling Price / Revenue
  productCost?: number; // Cost of product (buying cost)
  packagingCost?: number; // Packaging cost
  deliveryCost?: number; // Incurred delivery expense
  profitBeforeAdCost?: number; // Profit per unit before ad expenditure
  description?: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface OrderItem {
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  profitBeforeAdCostPerUnit?: number;
}

export interface OrganizedCustomerData {
  customerName?: string;
  customerPhone?: string;
  name?: string;
  phone?: string;
  cleanPhone?: string;
  foreignPhone?: string;
  location?: DeliveryLocationType | string;
  locationArea?: string;
  areaThana?: string;
  area?: string;
  district?: string;
  thana?: string;
  address?: string;
  productName?: string;
  product?: string;
  quantity?: number;
  productAmount?: number;
  codAmount?: number;
  cod?: number;
  foreignNumber?: string;
  isComplete?: boolean;
  warning?: string;
  rawInput?: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
export type OrderType = 'Direct Order' | 'Follow-up Order';
export type DeliveryLocationType = 'Dhaka' | 'Other District' | 'Free Delivery' | 'Custom';

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
  orderAmount: number; // Total COD (Products Total + Delivery Charge)
  productsTotal?: number;
  deliveryLocation?: DeliveryLocationType | string;
  deliveryCharge?: number;
  orderType?: OrderType;
  items?: OrderItem[];
  organizedCustomerData?: OrganizedCustomerData;
  profitBeforeAdCost?: number; // Total profit for this order before ad spend
  status: OrderStatus;
  notes?: string;
  orderDate: string; // ISO string
  createdAt: string;
}

export interface AdSpendEntry {
  id: string;
  resellerId: string;
  resellerName: string;
  date: string; // YYYY-MM-DD
  platform: 'Facebook / Meta Ads' | 'Google Ads' | 'TikTok Ads' | 'YouTube Ads' | 'Other';
  amount: number; // BDT
  notes?: string;
  createdAt?: string;
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

export interface ResellerProfitSummary {
  resellerId: string;
  resellerName: string;
  status: 'active' | 'inactive';
  phone?: string;
  totalOrders: number;
  totalProductsSold: number;
  directOrders: number;
  followUpOrders: number;
  totalRevenue: number;
  profitBeforeAdCost: number;
  totalAdSpend: number;
  estimatedProfit: number;
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
  profitBeforeAdCost?: number;
  estimatedProfit?: number;
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
  // Estimated Profit & Revenue Metrics
  totalProfitBeforeAdCost: number;
  estimatedProfit: number;
  totalProductsSold: number;
  directOrdersCount: number;
  followUpOrdersCount: number;
  resellerProfits: ResellerProfitSummary[];
  adSpendEntries?: AdSpendEntry[];
  salesByDate: {
    date: string;
    sales: number;
    adSpend: number;
    orders: number;
    hours: number;
    profit?: number;
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
  source: string;
  checkedAt: string;
}

export interface RepeatOrderItem {
  id: string;
  orderDate: string;
  productDetails: string;
  quantity: number;
  orderAmount: number;
  status: OrderStatus;
  resellerName?: string;
  customerAddress?: string;
  deliveryStatus?: string;
  notes?: string;
}

export interface RepeatOrderInfo {
  phone: string;
  isRepeat: boolean;
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  inTransitOrders: number;
  pendingOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  lastOrderStatus?: OrderStatus;
  lastOrderProduct?: string;
  lastOrderReseller?: string;
  lastCustomerAddress?: string;
  recentOrders: RepeatOrderItem[];
  duplicateWarning?: {
    isRecentDuplicate: boolean;
    hoursAgo?: number;
    minutesAgo?: number;
    message: string;
    recentOrderId?: string;
    recentOrderStatus?: OrderStatus;
    recentOrderProduct?: string;
  };
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

