import { Reseller, Order, DailyWork, DashboardStats, DatabaseInfo, Product, ResellerSession, GoogleUser } from '../types';
import {
  getFirestoreProducts,
  createFirestoreProduct,
  updateFirestoreProduct,
  deleteFirestoreProduct,
  setDefaultFirestoreProduct,
  getFirestoreResellers,
  createFirestoreReseller,
  updateFirestoreReseller,
  deleteFirestoreReseller,
  verifyFirestoreResellerLogin,
  getFirestoreOrders,
  createFirestoreOrder,
  updateFirestoreOrder,
  deleteFirestoreOrder,
  getFirestoreDailyWorks,
  createFirestoreDailyWork,
  deleteFirestoreDailyWork,
  getFirestoreDashboardStats,
  signInWithGoogle,
  signOutGoogle,
  onGoogleAuthStateChanged,
} from './firebase';
import firebaseConfig from '../../firebase-applet-config.json';

const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('reseller_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // ==========================================
  // GOOGLE AUTH (SIGN IN WITH ANY GMAIL)
  // ==========================================
  async signInWithGoogle(): Promise<GoogleUser> {
    const user = await signInWithGoogle();
    if (user.role === 'admin') {
      localStorage.setItem('reseller_admin_token', `firebase_admin_${user.uid}`);
    }
    return user;
  },

  async signOutGoogle(): Promise<void> {
    await signOutGoogle();
    localStorage.removeItem('reseller_admin_token');
    localStorage.removeItem('reseller_portal_token');
    localStorage.removeItem('reseller_user_session');
  },

  onGoogleAuthStateChanged(callback: (user: GoogleUser | null) => void) {
    return onGoogleAuthStateChanged(callback);
  },

  // ==========================================
  // PRODUCTS (Cloud Firestore Powered)
  // ==========================================
  async getProducts(): Promise<Product[]> {
    try {
      return await getFirestoreProducts();
    } catch {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      return data.products || [];
    }
  },

  // ==========================================
  // RESELLER AUTHENTICATION & PORTAL
  // ==========================================
  async resellerLogin(name: string, phone: string): Promise<{ token: string; reseller: Reseller }> {
    try {
      const reseller = await verifyFirestoreResellerLogin(name, phone);
      if (!reseller) {
        throw new Error('Reseller account not found with this name and phone. Please contact Admin.');
      }

      const token = `reseller_token_${reseller.id}_${Date.now()}`;
      localStorage.setItem('reseller_portal_token', token);
      const session: ResellerSession = {
        id: reseller.id,
        name: reseller.name,
        phone: reseller.phone || phone,
        email: reseller.email,
        joinedDate: reseller.joinedDate,
      };
      localStorage.setItem('reseller_user_session', JSON.stringify(session));

      return { token, reseller };
    } catch (err: any) {
      // Fallback to server endpoint
      const res = await fetch(`${API_BASE}/reseller/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || err.message || 'Reseller login failed');

      localStorage.setItem('reseller_portal_token', data.token);
      const session: ResellerSession = {
        id: data.reseller.id,
        name: data.reseller.name,
        phone: data.reseller.phone,
        email: data.reseller.email,
        joinedDate: data.reseller.joinedDate,
      };
      localStorage.setItem('reseller_user_session', JSON.stringify(session));
      return data;
    }
  },

  getStoredResellerSession(): ResellerSession | null {
    try {
      const stored = localStorage.getItem('reseller_user_session');
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  logoutReseller() {
    localStorage.removeItem('reseller_portal_token');
    localStorage.removeItem('reseller_user_session');
  },

  resellerLogout() {
    localStorage.removeItem('reseller_portal_token');
    localStorage.removeItem('reseller_user_session');
  },

  async getMyResellerProfile(): Promise<{ reseller: Reseller }> {
    const session = this.getStoredResellerSession();
    if (!session) throw new Error('Not logged in as reseller');

    try {
      const resellers = await getFirestoreResellers();
      const current = resellers.find((r) => r.id === session.id);
      if (current) return { reseller: current };
    } catch {
      // ignore
    }

    return {
      reseller: {
        id: session.id,
        name: session.name,
        phone: session.phone,
        email: session.email,
        status: 'active',
        joinedDate: session.joinedDate || new Date().toISOString().slice(0, 10),
      },
    };
  },

  async getMyResellerOrders(params?: { search?: string; status?: string }): Promise<Order[]> {
    const session = this.getStoredResellerSession();
    if (!session) return [];

    try {
      return await getFirestoreOrders({
        resellerId: session.id,
        search: params?.search,
        status: params?.status,
      });
    } catch {
      const res = await fetch(`${API_BASE}/reseller/my-orders?${new URLSearchParams(params as any).toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('reseller_portal_token')}`,
        },
      });
      const data = await res.json();
      return data.orders || [];
    }
  },

  async getMyResellerWorkLogs(): Promise<DailyWork[]> {
    const session = this.getStoredResellerSession();
    if (!session) return [];

    try {
      return await getFirestoreDailyWorks({
        resellerId: session.id,
      });
    } catch {
      const res = await fetch(`${API_BASE}/reseller/my-work-logs`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('reseller_portal_token')}`,
        },
      });
      const data = await res.json();
      return data.dailyWorks || [];
    }
  },

  // ==========================================
  // PUBLIC ACTIONS (Order Entry & Shift Log)
  // ==========================================
  async getPublicResellers(): Promise<Reseller[]> {
    try {
      return await getFirestoreResellers(true);
    } catch {
      const res = await fetch(`${API_BASE}/public/resellers`);
      const data = await res.json();
      return data.resellers || [];
    }
  },

  async submitOrder(orderData: {
    resellerId: string;
    resellerName?: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    district: string;
    thana: string;
    productDetails: string;
    quantity: number;
    orderAmount: number;
    notes?: string;
  }): Promise<{ message: string; order: Order }> {
    try {
      const order = await createFirestoreOrder(orderData);
      return { message: 'Order submitted successfully to Cloud Firestore', order };
    } catch (err: any) {
      // Fallback
      const res = await fetch(`${API_BASE}/public/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || err.message || 'Failed to submit order');
      return data;
    }
  },

  async submitDailyWork(workData: {
    resellerId: string;
    resellerName?: string;
    workDate: string;
    startTime: string;
    endTime: string;
    ordersGenerated: number;
    adSpend: number;
    notes?: string;
  }): Promise<{ message: string; dailyWork: DailyWork }> {
    try {
      const dailyWork = await createFirestoreDailyWork(workData);
      return { message: 'Daily work logged successfully in Cloud Firestore', dailyWork };
    } catch (err: any) {
      const res = await fetch(`${API_BASE}/public/daily-work`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || err.message || 'Failed to log daily work');
      return data;
    }
  },

  // ==========================================
  // ADMIN AUTHENTICATION
  // ==========================================
  async adminLogin(username: string, password: string): Promise<{ token: string; admin: { username: string; role: string } }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid credentials');
    localStorage.setItem('reseller_admin_token', data.token);
    return data;
  },

  async getAdminProfile(): Promise<{ username: string; role: string }> {
    const token = localStorage.getItem('reseller_admin_token');
    if (!token) throw new Error('Not authenticated');

    if (token.startsWith('firebase_admin_')) {
      return { username: 'Admin (Google Account)', role: 'admin' };
    }

    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Not authenticated');
    return data.user;
  },

  // ==========================================
  // ADMIN PRODUCTS MANAGEMENT
  // ==========================================
  async getAdminProducts(): Promise<Product[]> {
    try {
      return await getFirestoreProducts();
    } catch {
      const res = await fetch(`${API_BASE}/admin/products`, { headers: getAuthHeaders() });
      const data = await res.json();
      return data.products || [];
    }
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    try {
      return await createFirestoreProduct(product);
    } catch {
      const res = await fetch(`${API_BASE}/admin/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');
      return data.product;
    }
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    try {
      return await updateFirestoreProduct(id, product);
    } catch {
      const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update product');
      return data.product;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      return await deleteFirestoreProduct(id);
    } catch {
      const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');
      return true;
    }
  },

  async setDefaultProduct(id: string): Promise<Product> {
    try {
      return await setDefaultFirestoreProduct(id);
    } catch {
      const res = await fetch(`${API_BASE}/admin/products/${id}/set-default`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to set default product');
      return data.product;
    }
  },

  // ==========================================
  // ADMIN DASHBOARD STATS
  // ==========================================
  async getDashboardStats(params?: { startDate?: string; endDate?: string; resellerId?: string }): Promise<DashboardStats> {
    try {
      return await getFirestoreDashboardStats(params);
    } catch {
      const query = new URLSearchParams();
      if (params?.startDate) query.append('startDate', params.startDate);
      if (params?.endDate) query.append('endDate', params.endDate);
      if (params?.resellerId && params.resellerId !== 'all') query.append('resellerId', params.resellerId);

      const res = await fetch(`${API_BASE}/admin/stats?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch dashboard stats');
      return data.stats;
    }
  },

  // ==========================================
  // ADMIN RESELLERS
  // ==========================================
  async getAdminResellers(): Promise<Reseller[]> {
    try {
      return await getFirestoreResellers(false);
    } catch {
      const res = await fetch(`${API_BASE}/admin/resellers`, { headers: getAuthHeaders() });
      const data = await res.json();
      return data.resellers || [];
    }
  },

  async createReseller(reseller: Partial<Reseller>): Promise<Reseller> {
    try {
      return await createFirestoreReseller(reseller);
    } catch {
      const res = await fetch(`${API_BASE}/admin/resellers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(reseller),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create reseller');
      return data.reseller;
    }
  },

  async updateReseller(id: string, reseller: Partial<Reseller>): Promise<Reseller> {
    try {
      return await updateFirestoreReseller(id, reseller);
    } catch {
      const res = await fetch(`${API_BASE}/admin/resellers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(reseller),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update reseller');
      return data.reseller;
    }
  },

  async deleteReseller(id: string): Promise<boolean> {
    try {
      return await deleteFirestoreReseller(id);
    } catch {
      const res = await fetch(`${API_BASE}/admin/resellers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete reseller');
      return true;
    }
  },

  // ==========================================
  // ADMIN ORDERS
  // ==========================================
  async getAdminOrders(params?: {
    resellerId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    district?: string;
  }): Promise<Order[]> {
    try {
      return await getFirestoreOrders(params);
    } catch {
      const query = new URLSearchParams();
      if (params?.resellerId && params.resellerId !== 'all') query.append('resellerId', params.resellerId);
      if (params?.search) query.append('search', params.search);
      if (params?.startDate) query.append('startDate', params.startDate);
      if (params?.endDate) query.append('endDate', params.endDate);
      if (params?.status && params.status !== 'all') query.append('status', params.status);

      const res = await fetch(`${API_BASE}/admin/orders?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
      return data.orders || [];
    }
  },

  async updateOrder(id: string, orderData: Partial<Order>): Promise<Order> {
    try {
      return await updateFirestoreOrder(id, orderData);
    } catch {
      const res = await fetch(`${API_BASE}/admin/orders/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order');
      return data.order;
    }
  },

  async deleteOrder(id: string): Promise<boolean> {
    try {
      return await deleteFirestoreOrder(id);
    } catch {
      const res = await fetch(`${API_BASE}/admin/orders/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete order');
      return true;
    }
  },

  // ==========================================
  // ADMIN DAILY WORKS
  // ==========================================
  async getAdminDailyWorks(params?: {
    resellerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<DailyWork[]> {
    try {
      return await getFirestoreDailyWorks(params);
    } catch {
      const query = new URLSearchParams();
      if (params?.resellerId && params.resellerId !== 'all') query.append('resellerId', params.resellerId);
      if (params?.startDate) query.append('startDate', params.startDate);
      if (params?.endDate) query.append('endDate', params.endDate);

      const res = await fetch(`${API_BASE}/admin/daily-work?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch daily work');
      return data.dailyWorks || [];
    }
  },

  async updateDailyWork(id: string, workData: Partial<DailyWork>): Promise<DailyWork> {
    const res = await fetch(`${API_BASE}/admin/daily-work/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(workData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update daily work');
    return data.dailyWork;
  },

  async deleteDailyWork(id: string): Promise<boolean> {
    try {
      return await deleteFirestoreDailyWork(id);
    } catch {
      const res = await fetch(`${API_BASE}/admin/daily-work/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete daily work');
      return true;
    }
  },

  // ==========================================
  // DATABASE STATUS & METRICS
  // ==========================================
  async getDatabaseInfo(): Promise<{ dbInfo: DatabaseInfo; mysqlSchemaSql: string }> {
    try {
      const [resellers, products, orders, works] = await Promise.all([
        getFirestoreResellers(),
        getFirestoreProducts(),
        getFirestoreOrders(),
        getFirestoreDailyWorks(),
      ]);

      const dbInfo: DatabaseInfo = {
        type: 'firebase',
        connected: true,
        message: `Connected to Google Cloud Firestore (${firebaseConfig.projectId})`,
        counts: {
          resellers: resellers.length,
          products: products.length,
          orders: orders.length,
          dailyWorks: works.length,
        },
        firebaseConfig: {
          projectId: firebaseConfig.projectId,
          databaseId: firebaseConfig.firestoreDatabaseId,
          authDomain: firebaseConfig.authDomain,
        },
      };

      return {
        dbInfo,
        mysqlSchemaSql: '-- Firebase Firestore Cloud Database Active\n-- All collections automatically synced and indexed.',
      };
    } catch {
      const res = await fetch(`${API_BASE}/admin/database-info`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      return data;
    }
  },
};
