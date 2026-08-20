import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  where,
  onSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { Reseller, Order, DailyWork, Product, DashboardStats, GoogleUser } from '../types';
import rawFirebaseConfig from '../../firebase-applet-config.json';

// Support both embedded firebase-applet-config.json and optional Vercel / Vite env variables
export const activeFirebaseConfig = {
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || rawFirebaseConfig.projectId,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || rawFirebaseConfig.appId,
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || rawFirebaseConfig.apiKey,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || rawFirebaseConfig.authDomain,
  firestoreDatabaseId: (import.meta as any).env?.VITE_FIREBASE_FIRESTORE_DATABASE_ID || rawFirebaseConfig.firestoreDatabaseId,
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || rawFirebaseConfig.storageBucket,
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || rawFirebaseConfig.messagingSenderId,
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(activeFirebaseConfig) : getApp();

// Auth Instance
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Firestore Instance (Pass databaseId if specified in config)
export const db = activeFirebaseConfig.firestoreDatabaseId
  ? getFirestore(app, activeFirebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initial Seed Data if Cloud Firestore is empty
const INITIAL_PRODUCTS: Product[] = [
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
    notes: 'Gadgets & accessories affiliate',
  },
];

let isInitialized = false;

/**
 * Ensures Firestore has initial catalog & resellers seeded on cloud setup
 */
export async function ensureFirestoreSeeded() {
  if (isInitialized) return;
  isInitialized = true;
  try {
    const productsRef = collection(db, 'products');
    const prodSnap = await getDocs(productsRef);
    if (prodSnap.empty) {
      console.log('⚡ Seeding initial products to Cloud Firestore...');
      const batch = writeBatch(db);
      for (const p of INITIAL_PRODUCTS) {
        batch.set(doc(db, 'products', p.id), p);
      }
      await batch.commit();
    }

    const resellersRef = collection(db, 'resellers');
    const resSnap = await getDocs(resellersRef);
    if (resSnap.empty) {
      console.log('⚡ Seeding initial resellers to Cloud Firestore...');
      const batch = writeBatch(db);
      for (const r of INITIAL_RESELLERS) {
        batch.set(doc(db, 'resellers', r.id), r);
      }
      await batch.commit();
    }
  } catch (err) {
    console.warn('Firestore seeding notice:', err);
  }
}

// Automatically trigger background seed check
ensureFirestoreSeeded();

// ============================================================================
// AUTHENTICATION (GOOGLE SIGN IN FOR ANY GMAIL)
// ============================================================================

export async function signInWithGoogle(): Promise<GoogleUser> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const googleUser: GoogleUser = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: 'user',
  };

  // Check if admin email
  if (user.email && (user.email.toLowerCase() === 'newlifebegin2026@gmail.com' || user.email.toLowerCase().includes('admin'))) {
    googleUser.role = 'admin';
  }

  // Save / Update user in Firestore users collection
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      ...googleUser,
      lastLogin: new Date().toISOString(),
    }, { merge: true });
  } catch (e) {
    console.warn('Could not save user profile to Firestore:', e);
  }

  return googleUser;
}

export async function signOutGoogle(): Promise<void> {
  await signOut(auth);
}

export function onGoogleAuthStateChanged(callback: (user: GoogleUser | null) => void) {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    const googleUser: GoogleUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      role: 'user',
    };

    if (firebaseUser.email && (firebaseUser.email.toLowerCase() === 'newlifebegin2026@gmail.com' || firebaseUser.email.toLowerCase().includes('admin'))) {
      googleUser.role = 'admin';
    }

    // Try finding linked reseller
    try {
      if (firebaseUser.email) {
        const resellers = await getFirestoreResellers();
        const matched = resellers.find(r => r.email?.toLowerCase() === firebaseUser.email?.toLowerCase());
        if (matched) {
          googleUser.resellerId = matched.id;
          googleUser.role = 'reseller';
        }
      }
    } catch {
      // ignore
    }

    callback(googleUser);
  });
}

// ============================================================================
// FIRESTORE PRODUCTS
// ============================================================================

export async function getFirestoreProducts(): Promise<Product[]> {
  await ensureFirestoreSeeded();
  const snap = await getDocs(collection(db, 'products'));
  const products: Product[] = [];
  snap.forEach((doc) => {
    products.push(doc.data() as Product);
  });

  // Sort by createdAt or name
  return products.sort((a, b) => {
    if (a.isDefault) return -1;
    if (b.isDefault) return 1;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });
}

export async function createFirestoreProduct(productData: Partial<Product>): Promise<Product> {
  const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const product: Product = {
    id: newId,
    name: productData.name?.trim() || 'New Product',
    price: Number(productData.price) || 0,
    description: productData.description?.trim() || '',
    isDefault: !!productData.isDefault,
    createdAt: new Date().toISOString(),
  };

  if (product.isDefault) {
    // Unset default from others
    const current = await getFirestoreProducts();
    const batch = writeBatch(db);
    for (const p of current) {
      if (p.isDefault) {
        batch.update(doc(db, 'products', p.id), { isDefault: false });
      }
    }
    await batch.commit();
  }

  await setDoc(doc(db, 'products', newId), product);
  return product;
}

export async function updateFirestoreProduct(id: string, productData: Partial<Product>): Promise<Product> {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error('Product not found in Firestore');
  }

  if (productData.isDefault) {
    const current = await getFirestoreProducts();
    const batch = writeBatch(db);
    for (const p of current) {
      if (p.id !== id && p.isDefault) {
        batch.update(doc(db, 'products', p.id), { isDefault: false });
      }
    }
    await batch.commit();
  }

  const updated = {
    ...docSnap.data(),
    ...productData,
    ...(productData.price !== undefined ? { price: Number(productData.price) } : {}),
  } as Product;

  await setDoc(docRef, updated, { merge: true });
  return updated;
}

export async function deleteFirestoreProduct(id: string): Promise<boolean> {
  await deleteDoc(doc(db, 'products', id));
  return true;
}

export async function setDefaultFirestoreProduct(id: string): Promise<Product> {
  const current = await getFirestoreProducts();
  const batch = writeBatch(db);
  let targetProduct: Product | null = null;

  for (const p of current) {
    if (p.id === id) {
      targetProduct = { ...p, isDefault: true };
      batch.update(doc(db, 'products', p.id), { isDefault: true });
    } else if (p.isDefault) {
      batch.update(doc(db, 'products', p.id), { isDefault: false });
    }
  }

  await batch.commit();
  if (!targetProduct) throw new Error('Product not found');
  return targetProduct;
}

// ============================================================================
// FIRESTORE RESELLERS
// ============================================================================

export async function getFirestoreResellers(activeOnly: boolean = false): Promise<Reseller[]> {
  await ensureFirestoreSeeded();
  const snap = await getDocs(collection(db, 'resellers'));
  let resellers: Reseller[] = [];
  snap.forEach((doc) => {
    resellers.push(doc.data() as Reseller);
  });

  if (activeOnly) {
    resellers = resellers.filter((r) => r.status === 'active');
  }

  return resellers.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createFirestoreReseller(resellerData: Partial<Reseller>): Promise<Reseller> {
  const newId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const reseller: Reseller = {
    id: newId,
    name: resellerData.name?.trim() || 'New Reseller',
    phone: resellerData.phone?.trim() || '',
    email: resellerData.email?.trim() || '',
    status: resellerData.status || 'active',
    joinedDate: resellerData.joinedDate || new Date().toISOString().slice(0, 10),
    notes: resellerData.notes?.trim() || '',
  };

  await setDoc(doc(db, 'resellers', newId), reseller);
  return reseller;
}

export async function updateFirestoreReseller(id: string, resellerData: Partial<Reseller>): Promise<Reseller> {
  const docRef = doc(db, 'resellers', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    throw new Error('Reseller not found in Firestore');
  }

  const updated = {
    ...snap.data(),
    ...resellerData,
  } as Reseller;

  await setDoc(docRef, updated, { merge: true });
  return updated;
}

export async function deleteFirestoreReseller(id: string): Promise<boolean> {
  await deleteDoc(doc(db, 'resellers', id));
  return true;
}

export async function verifyFirestoreResellerLogin(name: string, phone: string): Promise<Reseller | null> {
  const resellers = await getFirestoreResellers();
  const cleanName = name.trim().toLowerCase();
  const cleanPhone = phone.trim().replace(/[\s\-\+]/g, '');

  const match = resellers.find((r) => {
    const rName = r.name.trim().toLowerCase();
    const rPhone = (r.phone || '').trim().replace(/[\s\-\+]/g, '');
    return rName === cleanName && (rPhone === cleanPhone || rPhone.endsWith(cleanPhone) || cleanPhone.endsWith(rPhone));
  });

  return match || null;
}

// ============================================================================
// FIRESTORE ORDERS
// ============================================================================

export async function getFirestoreOrders(filters?: {
  resellerId?: string;
  search?: string;
  status?: string;
  district?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Order[]> {
  const snap = await getDocs(collection(db, 'orders'));
  let orders: Order[] = [];
  snap.forEach((doc) => {
    orders.push(doc.data() as Order);
  });

  // Apply filters
  if (filters?.resellerId && filters.resellerId !== 'all') {
    orders = orders.filter((o) => o.resellerId === filters.resellerId);
  }
  if (filters?.status && filters.status !== 'all') {
    orders = orders.filter((o) => o.status.toLowerCase() === filters.status?.toLowerCase());
  }
  if (filters?.district && filters.district !== 'all') {
    orders = orders.filter((o) => o.district.toLowerCase() === filters.district?.toLowerCase());
  }
  if (filters?.startDate) {
    orders = orders.filter((o) => o.orderDate.slice(0, 10) >= (filters.startDate || ''));
  }
  if (filters?.endDate) {
    orders = orders.filter((o) => o.orderDate.slice(0, 10) <= (filters.endDate || ''));
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(s) ||
        o.customerName.toLowerCase().includes(s) ||
        o.customerPhone.includes(s) ||
        o.productDetails.toLowerCase().includes(s) ||
        o.resellerName.toLowerCase().includes(s)
    );
  }

  // Sort descending by orderDate or createdAt
  return orders.sort((a, b) => (b.orderDate || b.createdAt).localeCompare(a.orderDate || a.createdAt));
}

export async function createFirestoreOrder(orderData: {
  resellerId: string;
  resellerName?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  district: string;
  thana?: string;
  productDetails: string;
  quantity?: number;
  orderAmount: number;
  notes?: string;
}): Promise<Order> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newId = `ORD-${dateStr}-${randomSuffix}`;

  // Find reseller name if not provided
  let resellerName = orderData.resellerName || 'Reseller';
  if (!orderData.resellerName) {
    const resellers = await getFirestoreResellers();
    const r = resellers.find((x) => x.id === orderData.resellerId);
    if (r) resellerName = r.name;
  }

  const order: Order = {
    id: newId,
    resellerId: orderData.resellerId,
    resellerName: resellerName,
    customerName: orderData.customerName.trim(),
    customerPhone: orderData.customerPhone.trim(),
    customerAddress: orderData.customerAddress.trim(),
    district: orderData.district || 'Dhaka',
    thana: orderData.thana?.trim() || '',
    productDetails: orderData.productDetails.trim(),
    quantity: Math.max(1, orderData.quantity || 1),
    orderAmount: Number(orderData.orderAmount) || 0,
    status: 'Pending',
    notes: orderData.notes?.trim() || '',
    orderDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'orders', newId), order);
  return order;
}

export async function updateFirestoreOrder(id: string, updateData: Partial<Order>): Promise<Order> {
  const docRef = doc(db, 'orders', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    throw new Error('Order not found in Firestore');
  }

  const updated = {
    ...snap.data(),
    ...updateData,
    ...(updateData.orderAmount !== undefined ? { orderAmount: Number(updateData.orderAmount) } : {}),
    ...(updateData.quantity !== undefined ? { quantity: Number(updateData.quantity) } : {}),
  } as Order;

  await setDoc(docRef, updated, { merge: true });
  return updated;
}

export async function deleteFirestoreOrder(id: string): Promise<boolean> {
  await deleteDoc(doc(db, 'orders', id));
  return true;
}

// ============================================================================
// FIRESTORE DAILY WORK LOGS
// ============================================================================

export async function getFirestoreDailyWorks(filters?: {
  resellerId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<DailyWork[]> {
  const snap = await getDocs(collection(db, 'daily_work'));
  let works: DailyWork[] = [];
  snap.forEach((doc) => {
    works.push(doc.data() as DailyWork);
  });

  if (filters?.resellerId && filters.resellerId !== 'all') {
    works = works.filter((w) => w.resellerId === filters.resellerId);
  }
  if (filters?.startDate) {
    works = works.filter((w) => w.workDate >= (filters.startDate || ''));
  }
  if (filters?.endDate) {
    works = works.filter((w) => w.workDate <= (filters.endDate || ''));
  }

  return works.sort((a, b) => (b.workDate || '').localeCompare(a.workDate || ''));
}

export async function createFirestoreDailyWork(workData: {
  resellerId: string;
  resellerName?: string;
  workDate: string;
  startTime: string;
  endTime: string;
  ordersGenerated?: number;
  adSpend?: number;
  notes?: string;
}): Promise<DailyWork> {
  const newId = `work_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Calculate total hours
  let totalHours = 0;
  if (workData.startTime && workData.endTime) {
    const [startH, startM] = workData.startTime.split(':').map(Number);
    const [endH, endM] = workData.endTime.split(':').map(Number);
    let diffMinutes = endH * 60 + endM - (startH * 60 + startM);
    if (diffMinutes < 0) diffMinutes += 24 * 60; // crossed midnight
    totalHours = Number((diffMinutes / 60).toFixed(2));
  }

  let resellerName = workData.resellerName || 'Reseller';
  if (!workData.resellerName) {
    const resellers = await getFirestoreResellers();
    const r = resellers.find((x) => x.id === workData.resellerId);
    if (r) resellerName = r.name;
  }

  const work: DailyWork = {
    id: newId,
    resellerId: workData.resellerId,
    resellerName: resellerName,
    workDate: workData.workDate || new Date().toISOString().slice(0, 10),
    startTime: workData.startTime || '09:00',
    endTime: workData.endTime || '18:00',
    totalHours: totalHours || 8,
    ordersGenerated: Number(workData.ordersGenerated) || 0,
    adSpend: Number(workData.adSpend) || 0,
    notes: workData.notes?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'daily_work', newId), work);
  return work;
}

export async function updateFirestoreDailyWork(id: string, workData: Partial<DailyWork>): Promise<DailyWork> {
  const docRef = doc(db, 'daily_work', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    throw new Error('Daily work log not found in Firestore');
  }

  const updated = {
    ...snap.data(),
    ...workData,
    ...(workData.ordersGenerated !== undefined ? { ordersGenerated: Number(workData.ordersGenerated) } : {}),
    ...(workData.adSpend !== undefined ? { adSpend: Number(workData.adSpend) } : {}),
    ...(workData.totalHours !== undefined ? { totalHours: Number(workData.totalHours) } : {}),
  } as DailyWork;

  await setDoc(docRef, updated, { merge: true });
  return updated;
}

export async function deleteFirestoreDailyWork(id: string): Promise<boolean> {
  await deleteDoc(doc(db, 'daily_work', id));
  return true;
}

// ============================================================================
// FIRESTORE DASHBOARD STATS COMPUTATION
// ============================================================================

export async function getFirestoreDashboardStats(filters?: {
  startDate?: string;
  endDate?: string;
  resellerId?: string;
}): Promise<DashboardStats> {
  const [allResellers, allOrders, allWorks] = await Promise.all([
    getFirestoreResellers(),
    getFirestoreOrders(filters),
    getFirestoreDailyWorks(filters),
  ]);

  const totalResellers = allResellers.length;
  const activeResellers = allResellers.filter((r) => r.status === 'active').length;
  const totalOrders = allOrders.length;
  const totalSales = allOrders.reduce((sum, o) => sum + (o.orderAmount || 0), 0);
  const totalAdSpend = allWorks.reduce((sum, w) => sum + (w.adSpend || 0), 0);
  const totalWorkingHours = allWorks.reduce((sum, w) => sum + (w.totalHours || 0), 0);

  const overallAOV = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  const overallROAS = totalAdSpend > 0 ? Number((totalSales / totalAdSpend).toFixed(2)) : 0;

  // Reseller Performance
  const performanceMap = new Map<string, {
    resellerId: string;
    resellerName: string;
    status: 'active' | 'inactive';
    phone?: string;
    totalOrders: number;
    totalSales: number;
    totalAdSpend: number;
    totalHours: number;
  }>();

  for (const r of allResellers) {
    performanceMap.set(r.id, {
      resellerId: r.id,
      resellerName: r.name,
      status: r.status,
      phone: r.phone,
      totalOrders: 0,
      totalSales: 0,
      totalAdSpend: 0,
      totalHours: 0,
    });
  }

  for (const o of allOrders) {
    const perf = performanceMap.get(o.resellerId);
    if (perf) {
      perf.totalOrders += 1;
      perf.totalSales += o.orderAmount || 0;
    }
  }

  for (const w of allWorks) {
    const perf = performanceMap.get(w.resellerId);
    if (perf) {
      perf.totalAdSpend += w.adSpend || 0;
      perf.totalHours += w.totalHours || 0;
    }
  }

  const resellerPerformance = Array.from(performanceMap.values()).map((p) => {
    const aov = p.totalOrders > 0 ? Math.round(p.totalSales / p.totalOrders) : 0;
    const roas = p.totalAdSpend > 0 ? Number((p.totalSales / p.totalAdSpend).toFixed(2)) : 0;
    const costPerOrder = p.totalOrders > 0 ? Math.round(p.totalAdSpend / p.totalOrders) : 0;
    return {
      ...p,
      averageOrderValue: aov,
      roas,
      costPerOrder,
    };
  });

  // Sales by Date (last 14 days or filtered period)
  const dateMap = new Map<string, { sales: number; adSpend: number; orders: number; hours: number }>();
  for (const o of allOrders) {
    const d = o.orderDate.slice(0, 10);
    const curr = dateMap.get(d) || { sales: 0, adSpend: 0, orders: 0, hours: 0 };
    curr.sales += o.orderAmount || 0;
    curr.orders += 1;
    dateMap.set(d, curr);
  }

  for (const w of allWorks) {
    const d = w.workDate;
    const curr = dateMap.get(d) || { sales: 0, adSpend: 0, orders: 0, hours: 0 };
    curr.adSpend += w.adSpend || 0;
    curr.hours += w.totalHours || 0;
    dateMap.set(d, curr);
  }

  const salesByDate = Array.from(dateMap.entries())
    .map(([date, val]) => ({ date, ...val }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalResellers,
    activeResellers,
    totalOrders,
    totalSales,
    totalAdSpend,
    totalWorkingHours,
    overallAOV,
    overallROAS,
    salesByDate,
    resellerPerformance,
    recentOrders: allOrders.slice(0, 10),
    recentWorkLogs: allWorks.slice(0, 10),
  };
}
