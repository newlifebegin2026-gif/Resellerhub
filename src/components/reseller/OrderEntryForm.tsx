import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  User,
  Phone,
  MapPin,
  Package,
  CheckCircle2,
  Copy,
  Plus,
  AlertCircle,
  Sparkles,
  Tag,
  Star,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { Reseller, Order, Product, ResellerSession } from '../../types';
import { api } from '../../services/api';
import { BANGLADESH_DISTRICTS, COMMON_THANAS } from '../../constants/locations';

interface OrderEntryFormProps {
  onOrderCreated?: (order: Order) => void;
  currentResellerSession?: ResellerSession | null;
  onViewMyOrders?: () => void;
}

export const OrderEntryForm: React.FC<OrderEntryFormProps> = ({
  onOrderCreated,
  currentResellerSession,
  onViewMyOrders,
}) => {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  // Form Fields
  const [resellerId, setResellerId] = useState(currentResellerSession?.id || '');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [customProductTitle, setCustomProductTitle] = useState('');
  const [isCustomProduct, setIsCustomProduct] = useState(false);
  const [customerFullDetails, setCustomerFullDetails] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [thana, setThana] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [orderAmount, setOrderAmount] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [orderDate, setOrderDate] = useState(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  });

  // Load initial data (Resellers & Products)
  useEffect(() => {
    loadData();
  }, []);

  // Update resellerId if currentResellerSession changes
  useEffect(() => {
    if (currentResellerSession) {
      setResellerId(currentResellerSession.id);
    }
  }, [currentResellerSession]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [resellersData, productsData] = await Promise.all([
        api.getPublicResellers(),
        api.getProducts(),
      ]);

      setResellers(resellersData);
      setProducts(productsData);

      // Set default reseller if not logged in
      if (!currentResellerSession && resellersData.length > 0) {
        setResellerId(resellersData[0].id);
      }

      // Find default product set by Admin
      if (productsData.length > 0) {
        const defaultProd = productsData.find((p) => p.isDefault) || productsData[0];
        setSelectedProductId(defaultProd.id);
        setUnitPrice(defaultProd.price);
        setOrderAmount((defaultProd.price * 1).toString());
      }
    } catch (err: any) {
      console.error('Error fetching initial data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Handle product selection change
  const handleProductChange = (prodId: string) => {
    if (prodId === 'CUSTOM') {
      setIsCustomProduct(true);
      setSelectedProductId('CUSTOM');
      setUnitPrice(0);
      setOrderAmount('');
      return;
    }

    setIsCustomProduct(false);
    setSelectedProductId(prodId);
    const chosen = products.find((p) => p.id === prodId);
    if (chosen) {
      setUnitPrice(chosen.price);
      setOrderAmount((chosen.price * quantity).toString());
    }
  };

  // Handle quantity change
  const handleQuantityChange = (newQty: number) => {
    const validQty = Math.max(1, newQty);
    setQuantity(validQty);
    if (!isCustomProduct && unitPrice > 0) {
      setOrderAmount((unitPrice * validQty).toString());
    }
  };

  // Auto-parse details when customer pastes into full details field
  const handleFullDetailsChange = (val: string) => {
    setCustomerFullDetails(val);

    // Try extracting phone if phone is empty or previously parsed
    const phoneMatch = val.match(/(?:(?:\+|00)880|0)?1[3-9]\d{8}/);
    if (phoneMatch && (!customerPhone || customerPhone.length < 11)) {
      let cleanedPhone = phoneMatch[0].replace(/^(\+88|88)/, '');
      if (!cleanedPhone.startsWith('0')) cleanedPhone = '0' + cleanedPhone;
      setCustomerPhone(cleanedPhone);
    }

    // Try extracting COD or Price if orderAmount is empty
    const codMatch = val.match(/(?:cod|cash|amount|price|total|টাকা|৳)\s*[:=\-]?\s*(\d{2,6})/i) ||
      val.match(/(\d{3,6})\s*(?:tk|taka|bdt|৳|টাকা)/i);
    if (codMatch && codMatch[1] && (!orderAmount || orderAmount === '0')) {
      setOrderAmount(codMatch[1]);
    }
  };

  const selectedReseller = resellers.find((r) => r.id === resellerId) || (currentResellerSession ? {
    id: currentResellerSession.id,
    name: currentResellerSession.name,
    phone: currentResellerSession.phone,
    email: currentResellerSession.email,
    status: 'active' as const,
    joinedDate: currentResellerSession.joinedDate,
  } : null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const isDefaultActive = selectedProduct?.isDefault;

  // Phone operator check
  const getOperatorInfo = (phone: string) => {
    const cleaned = phone.replace(/[\s\-\+]/g, '');
    if (cleaned.startsWith('017') || cleaned.startsWith('013') || cleaned.startsWith('88017') || cleaned.startsWith('88013')) return { name: 'Grameenphone', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (cleaned.startsWith('018') || cleaned.startsWith('88018')) return { name: 'Robi', color: 'bg-red-50 text-red-700 border-red-200' };
    if (cleaned.startsWith('019') || cleaned.startsWith('014') || cleaned.startsWith('88019') || cleaned.startsWith('88014')) return { name: 'Banglalink', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (cleaned.startsWith('016') || cleaned.startsWith('88016')) return { name: 'Airtel', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    if (cleaned.startsWith('015') || cleaned.startsWith('88015')) return { name: 'Teletalk', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    return null;
  };

  const operator = getOperatorInfo(customerPhone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!resellerId) {
      setErrorMessage('Please select or log in with your Reseller account.');
      return;
    }
    if (!customerFullDetails.trim()) {
      setErrorMessage('Please enter or paste the customer full details.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 9) {
      setErrorMessage('Please enter a valid customer phone number.');
      return;
    }

    // Extract / derive name from full details
    let derivedName = '';
    const lines = customerFullDetails.split('\n').map(l => l.trim()).filter(Boolean);
    const nameLineMatch = customerFullDetails.match(/(?:name|customer|নাম)\s*[:=\-]\s*([^\n\r,]+)/i);
    if (nameLineMatch && nameLineMatch[1]) {
      derivedName = nameLineMatch[1].trim();
    } else if (lines.length > 0) {
      derivedName = lines[0].replace(/^(name|customer|নাম)[:\-\s]+/i, '').trim();
    }
    if (!derivedName || derivedName.length > 60 || /^\d+$/.test(derivedName)) {
      derivedName = 'Customer';
    }

    // Product details
    const finalProductDetails = isCustomProduct
      ? customProductTitle.trim() || 'E-commerce Order'
      : selectedProduct
      ? `${selectedProduct.name}${selectedProduct.description ? ` (${selectedProduct.description})` : ''}`
      : 'E-commerce Item';

    const parsedAmount = parseFloat(orderAmount) || (selectedProduct ? selectedProduct.price * quantity : 0);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please verify the COD order amount.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.submitOrder({
        resellerId,
        resellerName: selectedReseller ? selectedReseller.name : currentResellerSession?.name || 'Unknown Reseller',
        customerName: derivedName,
        customerPhone: customerPhone.trim(),
        customerAddress: customerFullDetails.trim(),
        district: district || 'Dhaka',
        thana: thana.trim(),
        productDetails: finalProductDetails,
        quantity: Math.max(1, quantity),
        orderAmount: parsedAmount,
        notes: notes.trim(),
      });

      setSubmittedOrder(res.order);
      if (onOrderCreated) {
        onOrderCreated(res.order);
      }

      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCustomerFullDetails('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setThana('');
    setNotes('');
    setQuantity(1);
    setSubmittedOrder(null);
    setCopied(false);
    setErrorMessage(null);

    // Reset back to admin default product
    const defaultProd = products.find((p) => p.isDefault) || products[0];
    if (defaultProd) {
      setSelectedProductId(defaultProd.id);
      setIsCustomProduct(false);
      setUnitPrice(defaultProd.price);
      setOrderAmount((defaultProd.price * 1).toString());
    }
  };

  const handleCopySummary = () => {
    if (!submittedOrder) return;
    const summary = `📦 *NEW ORDER CONFIRMATION*
━━━━━━━━━━━━━━━━━━━━
👤 *Reseller:* ${submittedOrder.resellerName}
🔖 *Order ID:* #${submittedOrder.id}
🛍️ *Product:* ${submittedOrder.productDetails}
🔢 *Qty:* ${submittedOrder.quantity}
💰 *Total Amount:* ৳${submittedOrder.orderAmount.toLocaleString()}

📍 *CUSTOMER DETAILS:*
• Name: ${submittedOrder.customerName}
• Phone: ${submittedOrder.customerPhone}
• Address: ${submittedOrder.customerAddress}, ${submittedOrder.thana ? submittedOrder.thana + ', ' : ''}${submittedOrder.district}
${submittedOrder.notes ? `• Note: ${submittedOrder.notes}` : ''}
━━━━━━━━━━━━━━━━━━━━`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (submittedOrder) {
    return (
      <div className="w-full max-w-xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 p-6 sm:p-8 text-center animate-fade-in">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-inner">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Order Submitted Successfully!</h2>
        <p className="text-xs text-slate-500 mt-1">
          Assigned to Reseller: <strong className="text-indigo-600 font-semibold">{submittedOrder.resellerName}</strong>
        </p>

        {/* Receipt Box */}
        <div className="mt-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left text-xs space-y-3 font-sans">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Tracking Order ID</span>
            <span className="font-mono font-bold text-indigo-600">{submittedOrder.id}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Customer Name:</span>
            <span className="font-semibold text-slate-800">{submittedOrder.customerName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Contact Phone:</span>
            <span className="font-mono font-medium text-slate-800">{submittedOrder.customerPhone}</span>
          </div>

          <div className="flex justify-between items-start">
            <span className="text-slate-500 shrink-0">Details / Address:</span>
            <span className="font-medium text-slate-800 text-right max-w-[280px] whitespace-pre-wrap">
              {submittedOrder.customerAddress}
            </span>
          </div>

          <div className="flex justify-between items-start pt-2 border-t border-slate-200">
            <span className="text-slate-500 shrink-0">Product:</span>
            <span className="font-semibold text-slate-900 text-right max-w-[240px]">
              {submittedOrder.productDetails}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Quantity:</span>
            <span className="font-bold text-slate-900">{submittedOrder.quantity} pcs</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm">
            <span className="font-bold text-slate-900">Total COD Amount:</span>
            <span className="font-extrabold text-indigo-600 text-base">
              ৳{submittedOrder.orderAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-between items-center text-[11px] pt-1">
            <span className="text-slate-500">Initial Status:</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
              {submittedOrder.status}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCopySummary}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? 'Copied Details!' : 'Copy Order Text'}</span>
          </button>

          {onViewMyOrders && (
            <button
              onClick={onViewMyOrders}
              className="flex-1 py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Track in My Orders</span>
            </button>
          )}

          <button
            onClick={resetForm}
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">Reseller Order Entry</h1>
                <p className="text-indigo-200 text-xs mt-0.5">
                  Submit customer order details with live default product catalog
                </p>
              </div>
            </div>

            {currentResellerSession && (
              <div className="hidden sm:flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Reseller: <strong>{currentResellerSession.name}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-700 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Reseller Identification */}
          <div className="space-y-3 pb-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                1. Reseller Identification <span className="text-red-500">*</span>
              </label>
              {currentResellerSession ? (
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Authenticated Reseller
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">Select or enter your registered account</span>
              )}
            </div>

            {currentResellerSession ? (
              <div className="p-4 bg-indigo-50/75 border border-indigo-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                    {currentResellerSession.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{currentResellerSession.name}</div>
                    <div className="text-xs text-indigo-700 font-mono font-medium">
                      Phone: {currentResellerSession.phone}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block text-[11px] font-semibold text-indigo-800 bg-white px-3 py-1.5 rounded-xl shadow-xs border border-indigo-100">
                    Locked to Your Login Info
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={resellerId}
                  onChange={(e) => setResellerId(e.target.value)}
                  disabled={loadingData}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-800 transition"
                >
                  {resellers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} {r.phone ? `(${r.phone})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Tip: Sign in via <strong className="text-slate-600">Reseller Login</strong> at the top bar to automatically lock and manage your submissions.
                </p>
              </div>
            )}
          </div>

          {/* Section 2: Product Selection (Default Product Highlighted) */}
          <div className="space-y-3 pb-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-indigo-600" />
                2. Product Selection (Admin Managed Catalog) <span className="text-red-500">*</span>
              </label>
              {isDefaultActive && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  Auto-Selected Default
                </span>
              )}
            </div>

            {/* Product Dropdown */}
            <div className="space-y-2">
              <select
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-800 transition"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.isDefault ? '⭐ [DEFAULT] ' : ''}{p.name} — ৳{p.price.toLocaleString('en-IN')}
                  </option>
                ))}
                <option value="CUSTOM">➕ Custom / Manual Product Entry</option>
              </select>

              {/* Product Info Banner */}
              {selectedProduct && !isCustomProduct && (
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{selectedProduct.name}</span>
                      {selectedProduct.isDefault && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                          Default
                        </span>
                      )}
                    </div>
                    {selectedProduct.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{selectedProduct.description}</p>
                    )}
                  </div>
                  <div className="text-right whitespace-nowrap shrink-0">
                    <span className="text-xs text-slate-400">Unit Price: </span>
                    <span className="text-sm font-bold text-indigo-600">৳{selectedProduct.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {/* Custom Product Text Field */}
              {isCustomProduct && (
                <div className="animate-fade-in pt-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enter Custom Product Name / Details <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customProductTitle}
                    onChange={(e) => setCustomProductTitle(e.target.value)}
                    placeholder="e.g. Leather Jacket (Size XL, Brown)"
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>
              )}
            </div>

            {/* Quantity and Order Amount Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Order Quantity <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base flex items-center justify-center transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="flex-1 text-center py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total COD Order Amount (৳ BDT) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    placeholder="e.g. 1650"
                    required
                    min="1"
                    className="w-full pl-8 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono font-bold text-indigo-700 transition"
                  />
                </div>
                {!isCustomProduct && selectedProduct && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Auto calculated ({quantity} × ৳{unitPrice}) — you may adjust if custom discount or shipping applies.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Customer Information & Delivery Destination */}
          <div className="space-y-4 pt-1">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              3. Customer & Delivery Address <span className="text-red-500">*</span>
            </label>

            {/* 1. Customer Full Details (Single Entry Field) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <span>1. Customer Full Details</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Name, phone, address, product type, quantity & COD
                </span>
              </div>
              <textarea
                value={customerFullDetails}
                onChange={(e) => handleFullDetailsChange(e.target.value)}
                placeholder={`Paste or write customer full details in one field here...\n\nExample:\nName: Mohammad Rahim\nPhone: 01712345678\nAddress: House #12, Road #4, Sector #10, Uttara, Dhaka\nProduct: Smart Watch\nQty: 1\nCOD: 1650`}
                required
                rows={6}
                className="w-full px-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition font-sans placeholder:text-slate-400 leading-relaxed"
              />
            </div>

            {/* 2. Customer Phone Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>2. Customer Phone Number</span>
                  <span className="text-red-500">*</span>
                </label>
                {operator && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${operator.color}`}>
                    {operator.name}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 01712345678"
                  required
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition font-mono font-medium text-slate-800"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Auto-extracted if phone number is pasted above, or enter manually.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <span className="inline-block animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Submit Order to Processing</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
