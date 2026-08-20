import React, { useState, useEffect, useMemo } from 'react';
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
  Trash2,
  AlertCircle,
  Sparkles,
  Tag,
  Star,
  Layers,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Building,
  Check,
  Repeat,
  History,
  Clock,
  ChevronDown,
  ChevronUp,
  Receipt,
  Truck,
  Zap,
  Globe,
  DollarSign,
  Info,
} from 'lucide-react';
import { Reseller, Order, Product, ResellerSession, FraudCheckResult, RepeatOrderInfo, OrderItem, OrganizedCustomerData, OrderType, DeliveryLocationType } from '../../types';
import { api } from '../../services/api';
import { BANGLADESH_DISTRICTS } from '../../constants/locations';
import { parseCustomerDetails } from '../../utils/customerParser';

interface OrderEntryFormProps {
  onOrderCreated?: (order: Order) => void;
  currentResellerSession?: ResellerSession | null;
  onViewMyOrders?: () => void;
}

interface ProductRowState {
  tempId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  isCustom: boolean;
  profitBeforeAdCostPerUnit?: number;
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
  const [customerFullDetails, setCustomerFullDetails] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [thana, setThana] = useState('');
  const [notes, setNotes] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('Direct Order');
  
  // Delivery Location & Charges
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocationType>('Other District');
  const [deliveryCharge, setDeliveryCharge] = useState<number>(120);
  const [isCustomDeliveryCharge, setIsCustomDeliveryCharge] = useState(false);

  // Multiple Product Rows
  const [productRows, setProductRows] = useState<ProductRowState[]>([
    {
      tempId: 'row_1',
      productId: '',
      productName: '',
      unitPrice: 0,
      quantity: 1,
      isCustom: false,
    },
  ]);

  // Parsed customer information helper
  const [organizedData, setOrganizedData] = useState<OrganizedCustomerData | null>(null);
  const [showOrganizedPreview, setShowOrganizedPreview] = useState(false);

  // Steadfast Courier Fraud Checker State
  const [fraudResult, setFraudResult] = useState<FraudCheckResult | null>(null);
  const [checkingFraud, setCheckingFraud] = useState(false);
  const [fraudError, setFraudError] = useState<string | null>(null);

  // Instant Repeat Order Detection State
  const [repeatOrderResult, setRepeatOrderResult] = useState<RepeatOrderInfo | null>(null);
  const [checkingRepeat, setCheckingRepeat] = useState(false);
  const [showRepeatDetails, setShowRepeatDetails] = useState(false);

  // Load initial data (Resellers & Products)
  useEffect(() => {
    loadData();
  }, []);

  // Update resellerId if session changes
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

      // Default reseller if none logged in
      if (!currentResellerSession && resellersData.length > 0) {
        setResellerId(resellersData[0].id);
      }

      // Default product selection for row 1
      if (productsData.length > 0) {
        const defaultProd = productsData.find((p) => p.isDefault) || productsData[0];
        setProductRows([
          {
            tempId: 'row_1',
            productId: defaultProd.id,
            productName: defaultProd.name,
            unitPrice: defaultProd.price,
            quantity: 1,
            isCustom: false,
            profitBeforeAdCostPerUnit: defaultProd.profitBeforeAdCost,
          },
        ]);
      }
    } catch (err: any) {
      console.error('Error fetching initial data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Multiple Product Management
  const handleAddProductRow = () => {
    const defaultProd = products.find((p) => p.isDefault) || products[0];
    const newRow: ProductRowState = {
      tempId: `row_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId: defaultProd ? defaultProd.id : 'CUSTOM',
      productName: defaultProd ? defaultProd.name : '',
      unitPrice: defaultProd ? defaultProd.price : 0,
      quantity: 1,
      isCustom: !defaultProd,
      profitBeforeAdCostPerUnit: defaultProd?.profitBeforeAdCost,
    };
    setProductRows((prev) => [...prev, newRow]);
  };

  const handleRemoveProductRow = (tempId: string) => {
    if (productRows.length <= 1) return;
    setProductRows((prev) => prev.filter((r) => r.tempId !== tempId));
  };

  const handleRowProductChange = (tempId: string, prodId: string) => {
    setProductRows((prev) =>
      prev.map((row) => {
        if (row.tempId !== tempId) return row;
        if (prodId === 'CUSTOM') {
          return {
            ...row,
            productId: 'CUSTOM',
            productName: '',
            unitPrice: 0,
            isCustom: true,
            profitBeforeAdCostPerUnit: undefined,
          };
        }
        const matched = products.find((p) => p.id === prodId);
        return {
          ...row,
          productId: prodId,
          productName: matched?.name || '',
          unitPrice: matched?.price || 0,
          isCustom: false,
          profitBeforeAdCostPerUnit: matched?.profitBeforeAdCost,
        };
      })
    );
  };

  const handleRowPriceChange = (tempId: string, price: number) => {
    setProductRows((prev) =>
      prev.map((row) => (row.tempId === tempId ? { ...row, unitPrice: Math.max(0, price) } : row))
    );
  };

  const handleRowCustomNameChange = (tempId: string, name: string) => {
    setProductRows((prev) =>
      prev.map((row) => (row.tempId === tempId ? { ...row, productName: name } : row))
    );
  };

  const handleRowQuantityChange = (tempId: string, delta: number) => {
    setProductRows((prev) =>
      prev.map((row) => {
        if (row.tempId !== tempId) return row;
        const newQty = Math.max(1, (row.quantity || 1) + delta);
        return { ...row, quantity: newQty };
      })
    );
  };

  const handleRowQuantityDirect = (tempId: string, val: number) => {
    setProductRows((prev) =>
      prev.map((row) => (row.tempId === tempId ? { ...row, quantity: Math.max(1, val) } : row))
    );
  };

  // Calculations
  const productsTotal = useMemo(() => {
    return productRows.reduce((sum, row) => sum + (Number(row.unitPrice) || 0) * (Number(row.quantity) || 1), 0);
  }, [productRows]);

  const totalQuantity = useMemo(() => {
    return productRows.reduce((sum, row) => sum + (Number(row.quantity) || 1), 0);
  }, [productRows]);

  // Delivery charge auto calculation based on location & product count
  const handleLocationChange = (loc: DeliveryLocationType) => {
    setDeliveryLocation(loc);
    if (!isCustomDeliveryCharge) {
      if (loc === 'Dhaka') {
        setDeliveryCharge(60);
      } else if (loc === 'Free Delivery') {
        setDeliveryCharge(0);
      } else {
        setDeliveryCharge(120);
      }
    }
  };

  const finalCODTotal = useMemo(() => {
    return Math.max(0, productsTotal + (Number(deliveryCharge) || 0));
  }, [productsTotal, deliveryCharge]);

  // Parse Raw Customer Text automatically
  const handleCustomerDetailsChange = (val: string) => {
    setCustomerFullDetails(val);
    if (val.trim()) {
      const parsed = parseCustomerDetails(val);
      setOrganizedData(parsed);
      setShowOrganizedPreview(true);

      // Auto populate phone if empty
      if (parsed.cleanPhone && (!customerPhone || customerPhone.length < 11)) {
        setCustomerPhone(parsed.cleanPhone);
      }

      // Auto update delivery location if detected
      if (parsed.location) {
        setDeliveryLocation(parsed.location);
        if (!isCustomDeliveryCharge) {
          setDeliveryCharge(parsed.location === 'Dhaka' ? 60 : 120);
        }
      }

      // Auto update district
      if (parsed.district) {
        setDistrict(parsed.district);
      }
    } else {
      setOrganizedData(null);
      setShowOrganizedPreview(false);
    }
  };

  // Apply parsed data directly to specific fields
  const applyOrganizedData = () => {
    if (!organizedData) return;
    if (organizedData.customerName) setCustomerName(organizedData.customerName);
    if (organizedData.customerPhone) setCustomerPhone(organizedData.customerPhone);
    if (organizedData.district) setDistrict(organizedData.district);
    if (organizedData.location) handleLocationChange(organizedData.location);
    if (organizedData.area) setThana(organizedData.area);
  };

  // Phone operator check
  const getOperatorInfo = (phone: string) => {
    const cleaned = phone.replace(/[\s\-\+]/g, '');
    if (cleaned.startsWith('017') || cleaned.startsWith('013') || cleaned.startsWith('88017') || cleaned.startsWith('88013'))
      return { name: 'Grameenphone', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (cleaned.startsWith('018') || cleaned.startsWith('88018'))
      return { name: 'Robi', color: 'bg-red-50 text-red-700 border-red-200' };
    if (cleaned.startsWith('019') || cleaned.startsWith('014') || cleaned.startsWith('88019') || cleaned.startsWith('88014'))
      return { name: 'Banglalink', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (cleaned.startsWith('016') || cleaned.startsWith('88016'))
      return { name: 'Airtel', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    if (cleaned.startsWith('015') || cleaned.startsWith('88015'))
      return { name: 'Teletalk', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (phone.startsWith('+') || phone.startsWith('00'))
      return { name: 'International / Foreign Number', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    return null;
  };

  const operator = getOperatorInfo(customerPhone);

  // Instant Repeat Order Detection Execution
  const checkRepeatForPhone = async (phoneToCheck: string) => {
    let cleaned = phoneToCheck.replace(/[\s\-\(\)\+]/g, '');
    if (cleaned.startsWith('880')) cleaned = '0' + cleaned.substring(3);
    else if (cleaned.startsWith('88')) cleaned = '0' + cleaned.substring(2);

    if (!cleaned || cleaned.length < 9) {
      setRepeatOrderResult(null);
      return;
    }

    setCheckingRepeat(true);
    try {
      const result = await api.checkRepeatOrders(cleaned);
      setRepeatOrderResult(result);
    } catch (err) {
      console.warn('Repeat order check warning:', err);
    } finally {
      setCheckingRepeat(false);
    }
  };

  // Steadfast Fraud Checker execution
  const checkFraudForPhone = async (phoneToCheck: string) => {
    let cleaned = phoneToCheck.replace(/[\s\-\(\)\+]/g, '');
    if (cleaned.startsWith('880')) cleaned = '0' + cleaned.substring(3);
    else if (cleaned.startsWith('88')) cleaned = '0' + cleaned.substring(2);

    if (!cleaned || cleaned.length < 11 || !/^01[3-9]\d{8}$/.test(cleaned)) {
      return;
    }

    setCheckingFraud(true);
    setFraudError(null);
    try {
      const result = await api.checkCourierFraud(cleaned);
      setFraudResult(result);
    } catch (err: any) {
      console.warn('Fraud checker notice:', err);
      setFraudError(err.message || 'Courier database currently busy. Click to retry.');
    } finally {
      setCheckingFraud(false);
    }
  };

  // Debounced phone verification triggers
  useEffect(() => {
    let cleaned = customerPhone.replace(/[\s\-\(\)\+]/g, '');
    if (cleaned.startsWith('880')) cleaned = '0' + cleaned.substring(3);
    else if (cleaned.startsWith('88')) cleaned = '0' + cleaned.substring(2);

    if (cleaned.length >= 9) {
      const timer = setTimeout(() => {
        checkRepeatForPhone(cleaned);
        if (cleaned.length === 11 && /^01[3-9]\d{8}$/.test(cleaned)) {
          checkFraudForPhone(cleaned);
        }
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setRepeatOrderResult(null);
      setFraudResult(null);
      setFraudError(null);
    }
  }, [customerPhone]);

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!resellerId) {
      setErrorMessage('Please select or log in with your Reseller account.');
      return;
    }

    if (!customerFullDetails.trim()) {
      setErrorMessage('Please enter customer delivery details.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.length < 9) {
      setErrorMessage('Please enter a valid customer phone number.');
      return;
    }

    // Verify at least one product with name & price
    const validItems: OrderItem[] = [];
    for (const row of productRows) {
      const name = row.isCustom ? row.productName.trim() : (products.find((p) => p.id === row.productId)?.name || row.productName);
      if (!name) {
        setErrorMessage('Please enter the product name for all added items.');
        return;
      }
      if (row.unitPrice < 0) {
        setErrorMessage('Unit price cannot be negative.');
        return;
      }
      const qty = Math.max(1, Number(row.quantity) || 1);
      const price = Number(row.unitPrice) || 0;
      validItems.push({
        productId: row.isCustom ? undefined : row.productId,
        productName: name,
        unitPrice: price,
        quantity: qty,
        totalPrice: price * qty,
        profitBeforeAdCostPerUnit: row.profitBeforeAdCostPerUnit,
      });
    }

    if (validItems.length === 0) {
      setErrorMessage('Please add at least one product to the order.');
      return;
    }

    // Derived customer name
    let derivedName = customerName.trim();
    if (!derivedName) {
      const parsed = organizedData || parseCustomerDetails(customerFullDetails);
      derivedName = parsed.customerName || 'Customer';
    }

    // Product summary string
    const productSummary = validItems
      .map((it) => `${it.productName} (x${it.quantity})`)
      .join(' + ');

    // Calculate total profit before ad cost
    const profitBeforeAdCost = validItems.reduce((sum, it) => {
      const unitProfit = it.profitBeforeAdCostPerUnit !== undefined
        ? it.profitBeforeAdCostPerUnit
        : Math.round(it.unitPrice * 0.35);
      return sum + unitProfit * it.quantity;
    }, 0);

    const selectedReseller = resellers.find((r) => r.id === resellerId) || (currentResellerSession ? {
      name: currentResellerSession.name,
    } : undefined);

    try {
      setSubmitting(true);
      const res = await api.submitOrder({
        resellerId,
        resellerName: selectedReseller?.name || 'Reseller',
        customerName: derivedName,
        customerPhone: customerPhone.trim(),
        customerAddress: customerFullDetails.trim(),
        district: district || 'Dhaka',
        thana: thana.trim(),
        productDetails: productSummary,
        quantity: totalQuantity,
        productsTotal,
        deliveryLocation,
        deliveryCharge: Number(deliveryCharge) || 0,
        orderAmount: finalCODTotal,
        orderType,
        items: validItems,
        organizedCustomerData: organizedData || parseCustomerDetails(customerFullDetails),
        profitBeforeAdCost,
        notes: notes.trim(),
      });

      setSubmittedOrder(res.order);
      if (onOrderCreated) {
        onOrderCreated(res.order);
      }

      confetti({
        particleCount: 80,
        spread: 65,
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
    setOrganizedData(null);
    setShowOrganizedPreview(false);
    setFraudResult(null);
    setRepeatOrderResult(null);
    setSubmittedOrder(null);
    setOrderType('Direct Order');
    
    // Reset product rows to 1 default product
    const defaultProd = products.find((p) => p.isDefault) || products[0];
    setProductRows([
      {
        tempId: 'row_1',
        productId: defaultProd ? defaultProd.id : '',
        productName: defaultProd ? defaultProd.name : '',
        unitPrice: defaultProd ? defaultProd.price : 0,
        quantity: 1,
        isCustom: false,
        profitBeforeAdCostPerUnit: defaultProd?.profitBeforeAdCost,
      },
    ]);
  };

  const copyOrderDetails = () => {
    if (!submittedOrder) return;
    const text = `📦 ORDER CONFIRMATION
Order ID: ${submittedOrder.id}
Customer: ${submittedOrder.customerName}
Phone: ${submittedOrder.customerPhone}
Address: ${submittedOrder.customerAddress}
District: ${submittedOrder.district}
Products: ${submittedOrder.productDetails}
Items Count: ${submittedOrder.quantity}
Products Total: ৳${submittedOrder.productsTotal?.toLocaleString() || submittedOrder.orderAmount.toLocaleString()}
Delivery (${submittedOrder.deliveryLocation}): ৳${submittedOrder.deliveryCharge || 0}
Total COD Amount: ৳${submittedOrder.orderAmount.toLocaleString()}
Order Type: ${submittedOrder.orderType || 'Direct Order'}
Reseller: ${submittedOrder.resellerName}
Date: ${new Date(submittedOrder.orderDate).toLocaleString('en-US')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // SUCCESS VIEW
  if (submittedOrder) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div id="order_success_card" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              Order Placed Successfully
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              ৳{submittedOrder.orderAmount.toLocaleString()} COD Confirmed
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Order ID: <span className="font-mono font-bold text-slate-800">{submittedOrder.id}</span>
            </p>
          </div>

          {/* Breakdown Receipt */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-3 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 font-semibold text-slate-700">
              <span>Customer Details</span>
              <span className="text-xs text-slate-500 font-mono">{submittedOrder.orderType}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
              <div>
                <span className="text-slate-500">Name:</span> <span className="font-medium text-slate-900">{submittedOrder.customerName}</span>
              </div>
              <div>
                <span className="text-slate-500">Phone:</span> <span className="font-mono font-medium text-slate-900">{submittedOrder.customerPhone}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500">Address:</span> <span className="text-slate-800">{submittedOrder.customerAddress}</span>
              </div>
              <div>
                <span className="text-slate-500">Location:</span> <span className="font-medium text-slate-800">{submittedOrder.deliveryLocation} ({submittedOrder.district})</span>
              </div>
              <div>
                <span className="text-slate-500">Reseller:</span> <span className="font-medium text-slate-800">{submittedOrder.resellerName}</span>
              </div>
            </div>

            {/* Products Breakdown */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">Selected Products</span>
              {submittedOrder.items && submittedOrder.items.length > 0 ? (
                <div className="space-y-1.5">
                  {submittedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs sm:text-sm">
                      <span className="text-slate-700 font-medium">
                        {it.productName} <span className="text-slate-400 font-normal">× {it.quantity}</span>
                      </span>
                      <span className="font-mono text-slate-900">৳{((it.unitPrice || 0) * (it.quantity || 1)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-700 font-medium">{submittedOrder.productDetails} (×{submittedOrder.quantity})</span>
                  <span className="font-mono text-slate-900">৳{submittedOrder.productsTotal || submittedOrder.orderAmount}</span>
                </div>
              )}
            </div>

            {/* Total Math */}
            <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Products Total:</span>
                <span className="font-mono">৳{(submittedOrder.productsTotal || submittedOrder.orderAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge ({submittedOrder.deliveryLocation}):</span>
                <span className="font-mono">৳{(submittedOrder.deliveryCharge || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total COD Amount:</span>
                <span className="font-mono text-emerald-700">৳{submittedOrder.orderAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              id="copy_order_summary_button"
              type="button"
              onClick={copyOrderDetails}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Order Invoice'}
            </button>
            <button
              id="place_another_order_button"
              type="button"
              onClick={resetForm}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow transition flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Place Another Order
            </button>
          </div>

          {onViewMyOrders && (
            <button
              id="view_my_orders_link"
              type="button"
              onClick={onViewMyOrders}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline transition"
            >
              Go to My Order History →
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-3 sm:p-6 space-y-5">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-5 sm:p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-white/10 rounded-lg backdrop-blur">
                <ShoppingBag className="w-5 h-5 text-emerald-200" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Place Reseller Order</h1>
            </div>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              Add multiple products, auto-calculate delivery charges & detect repeat customers instantly.
            </p>
          </div>

          {/* Reseller Badge */}
          {currentResellerSession ? (
            <div className="bg-white/15 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 border border-white/20">
              <User className="w-4 h-4 text-emerald-200" />
              <span>Logged in as: <strong>{currentResellerSession.name}</strong></span>
            </div>
          ) : (
            <div className="w-full sm:w-auto">
              <label className="text-xs text-emerald-100 block mb-1">Reseller Account:</label>
              <select
                id="reseller_select_input"
                value={resellerId}
                onChange={(e) => setResellerId(e.target.value)}
                className="bg-white/10 border border-white/20 text-white text-xs rounded-lg px-2.5 py-1.5 w-full focus:bg-slate-900"
              >
                {resellers.map((r) => (
                  <option key={r.id} value={r.id} className="text-slate-900">
                    {r.name} ({r.phone})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-2 text-sm shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Validation Notice</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ========================================================================= */}
        {/* SECTION 1: UNSTRUCTURED CUSTOMER DETAILS & INSTANT AUTO-ORGANIZATION */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h2 className="font-bold text-slate-900 text-base">Customer Details (Paste WhatsApp / FB text)</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Auto-Parser Active</span>
          </div>

          <div>
            <textarea
              id="customer_full_details_textarea"
              rows={3}
              required
              value={customerFullDetails}
              onChange={(e) => handleCustomerDetailsChange(e.target.value)}
              placeholder="Paste customer message here... E.g:&#10;Rahim, Mirpur 10, Dhaka, Washroom Rack : 1 pieces, 01712345678, COD ৳560"
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-3 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-y font-mono"
            />
          </div>

          {/* Organized Customer Information Card */}
          {organizedData && showOrganizedPreview && (
            <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/50 border border-emerald-200 rounded-xl p-3.5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Organized Customer Data
                </span>
                <button
                  type="button"
                  onClick={applyOrganizedData}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Apply Extracted Info
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white/90 p-2.5 rounded-lg border border-emerald-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Name</span>
                  <span className="font-semibold text-slate-800 truncate block">{organizedData.customerName || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Phone</span>
                  <span className="font-mono font-bold text-slate-900 truncate block">{organizedData.customerPhone || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Location</span>
                  <span className="font-semibold text-emerald-800 block">{organizedData.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">District</span>
                  <span className="font-semibold text-slate-800 block">{organizedData.district}</span>
                </div>
              </div>
            </div>
          )}

          {/* Individual Customer Phone & District Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Customer Phone Number *</span>
                {operator && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${operator.color}`}>
                    {operator.name}
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  id="customer_phone_input"
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full text-sm rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer District *</label>
              <div className="relative">
                <select
                  id="customer_district_select"
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    if (e.target.value === 'Dhaka') {
                      handleLocationChange('Dhaka');
                    } else if (deliveryLocation === 'Dhaka') {
                      handleLocationChange('Other District');
                    }
                  }}
                  className="w-full text-sm rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* COURIER FRAUD CHECK & INSTANT REPEAT ORDER DETECTION DISPLAY */}
          {/* ========================================================================= */}
          {(checkingFraud || fraudResult || checkingRepeat || repeatOrderResult) && (
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              {/* Courier Delivery Performance Banner */}
              {checkingFraud ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs text-slate-600">
                  <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span>Checking courier delivery score for {customerPhone}...</span>
                </div>
              ) : fraudResult ? (
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  fraudResult.deliveryRatio >= 75
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : fraudResult.deliveryRatio >= 50
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : 'bg-rose-50/80 border-rose-200 text-rose-900'
                }`}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="font-bold">Courier Delivery Success: {fraudResult.deliveryRatio}%</span>
                      <span className="block text-[11px] opacity-80">
                        {fraudResult.totalDelivered} Delivered • {fraudResult.totalCancelled} Cancelled
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/70">
                    {fraudResult.riskLevel.replace('_', ' ')}
                  </span>
                </div>
              ) : null}

              {/* INSTANT REPEAT ORDER DETECTION AREA */}
              {checkingRepeat ? (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2 text-xs text-indigo-700">
                  <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                  <span>Checking customer order history in your database...</span>
                </div>
              ) : repeatOrderResult ? (
                <div
                  id="repeat_order_detection_box"
                  className={`p-3.5 rounded-xl border transition ${
                    repeatOrderResult.isRepeat
                      ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Repeat className={`w-4 h-4 ${repeatOrderResult.isRepeat ? 'text-indigo-600' : 'text-emerald-600'}`} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs">
                            {repeatOrderResult.isRepeat ? 'Repeat Customer Detected' : 'New Customer (1st Order)'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              repeatOrderResult.isRepeat ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {repeatOrderResult.totalOrders} Previous Order{repeatOrderResult.totalOrders === 1 ? '' : 's'}
                          </span>
                        </div>
                        {repeatOrderResult.isRepeat && (
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            Total Spent: <strong>৳{repeatOrderResult.totalSpent.toLocaleString()}</strong> • Delivered:{' '}
                            <strong className="text-emerald-700">{repeatOrderResult.deliveredOrders}</strong> • Cancelled:{' '}
                            <strong className="text-rose-700">{repeatOrderResult.cancelledOrders}</strong>
                          </p>
                        )}
                      </div>
                    </div>

                    {repeatOrderResult.isRepeat && repeatOrderResult.recentOrders.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowRepeatDetails(!showRepeatDetails)}
                        className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-indigo-200 shadow-2xs"
                      >
                        <History className="w-3.5 h-3.5" />
                        {showRepeatDetails ? 'Hide' : 'History'}
                      </button>
                    )}
                  </div>

                  {/* Duplicate Order Warning (Within 48h) */}
                  {repeatOrderResult.duplicateWarning && (
                    <div className="mt-2.5 p-2 bg-amber-100/90 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{repeatOrderResult.duplicateWarning.message}</span>
                    </div>
                  )}

                  {/* Detailed History Expandable Table */}
                  {showRepeatDetails && repeatOrderResult.recentOrders.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-indigo-200 space-y-1.5 text-xs">
                      <span className="font-bold text-slate-700 block text-[11px]">Past Orders for this number:</span>
                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                        {repeatOrderResult.recentOrders.map((ord, i) => (
                          <div key={i} className="flex justify-between items-center p-1.5 bg-white rounded border border-indigo-100 text-[11px]">
                            <div>
                              <span className="font-mono font-bold text-slate-800">{ord.id}</span>
                              <span className="text-slate-500 ml-1">({new Date(ord.orderDate).toLocaleDateString()})</span>
                              <div className="text-slate-600 truncate max-w-[200px]">{ord.productDetails}</div>
                            </div>
                            <div className="text-right">
                              <span className="font-bold font-mono">৳{ord.orderAmount}</span>
                              <span className={`block text-[10px] font-semibold ${
                                ord.status === 'Delivered' ? 'text-emerald-600' : ord.status === 'Cancelled' ? 'text-rose-600' : 'text-amber-600'
                              }`}>{ord.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: MULTIPLE PRODUCTS IN ONE ORDER */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h2 className="font-bold text-slate-900 text-base">Select Products</h2>
            </div>

            <button
              id="add_another_product_btn"
              type="button"
              onClick={handleAddProductRow}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              + Add Another Product
            </button>
          </div>

          {/* Product Rows List */}
          <div className="space-y-3">
            {productRows.map((row, index) => (
              <div
                key={row.tempId}
                className="p-3.5 bg-slate-50/90 border border-slate-200 rounded-xl space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    Product #{index + 1}
                  </span>

                  {productRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProductRow(row.tempId)}
                      className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded-md transition flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  {/* Product Dropdown / Custom Name */}
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Product Selection</label>
                    <select
                      id={`product_select_${index}`}
                      value={row.isCustom ? 'CUSTOM' : row.productId}
                      onChange={(e) => handleRowProductChange(row.tempId, e.target.value)}
                      className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 py-2 px-2.5 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (৳{p.price.toLocaleString()}) {p.isDefault ? '★ Default' : ''}
                        </option>
                      ))}
                      <option value="CUSTOM">+ Custom / Other Product</option>
                    </select>

                    {row.isCustom && (
                      <input
                        type="text"
                        placeholder="Enter custom product name"
                        value={row.productName}
                        onChange={(e) => handleRowCustomNameChange(row.tempId, e.target.value)}
                        className="w-full mt-2 text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 text-slate-800 focus:ring-2 focus:ring-emerald-500"
                      />
                    )}
                  </div>

                  {/* Unit Price */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Unit Price (৳)</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">৳</span>
                      <input
                        type="number"
                        min="0"
                        value={row.unitPrice || ''}
                        onChange={(e) => handleRowPriceChange(row.tempId, parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 py-2 pl-6 pr-2 font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Quantity Counter */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Quantity</label>
                    <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleRowQuantityChange(row.tempId, -1)}
                        className="w-8 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) => handleRowQuantityDirect(row.tempId, parseInt(e.target.value) || 1)}
                        className="w-full text-center text-xs sm:text-sm font-bold text-slate-900 border-none focus:ring-0 p-0"
                      />
                      <button
                        type="button"
                        onClick={() => handleRowQuantityChange(row.tempId, 1)}
                        className="w-8 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1 text-slate-500 font-medium">
                  <span>Line Total:</span>
                  <span className="font-mono font-bold text-slate-800">
                    ৳{((row.unitPrice || 0) * (row.quantity || 1)).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Another Product Button Bottom */}
          <button
            type="button"
            onClick={handleAddProductRow}
            className="w-full py-2.5 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            + Add Another Product to this Order
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: DELIVERY LOCATION & DELIVERY CHARGES */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h2 className="font-bold text-slate-900 text-base">Delivery Location & Charge</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Dhaka */}
            <button
              type="button"
              onClick={() => handleLocationChange('Dhaka')}
              className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                deliveryLocation === 'Dhaka'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div>
                <span className="font-bold text-xs sm:text-sm block">🏙️ Dhaka City</span>
                <span className="text-[11px] text-slate-500">Inside Dhaka Area</span>
              </div>
              <span className="font-mono font-bold text-xs sm:text-sm text-emerald-700">৳60</span>
            </button>

            {/* Other District */}
            <button
              type="button"
              onClick={() => handleLocationChange('Other District')}
              className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                deliveryLocation === 'Other District'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div>
                <span className="font-bold text-xs sm:text-sm block">🚚 Other District</span>
                <span className="text-[11px] text-slate-500">Outside Dhaka</span>
              </div>
              <span className="font-mono font-bold text-xs sm:text-sm text-emerald-700">৳120</span>
            </button>

            {/* Free Delivery */}
            <button
              type="button"
              onClick={() => handleLocationChange('Free Delivery')}
              className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                deliveryLocation === 'Free Delivery'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div>
                <span className="font-bold text-xs sm:text-sm block">🎁 Free Delivery</span>
                <span className="text-[11px] text-slate-500">Promotional ৳0 Charge</span>
              </div>
              <span className="font-mono font-bold text-xs sm:text-sm text-emerald-700">৳0</span>
            </button>
          </div>

          {/* Optional Custom Delivery Charge Override */}
          <div className="pt-1 flex items-center justify-between text-xs text-slate-600">
            <span>Delivery Charge Applied:</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Custom override:</span>
              <div className="relative w-24">
                <span className="absolute left-2 top-1.5 text-xs text-slate-400 font-bold">৳</span>
                <input
                  type="number"
                  min="0"
                  value={deliveryCharge}
                  onChange={(e) => {
                    setDeliveryCharge(parseFloat(e.target.value) || 0);
                    setIsCustomDeliveryCharge(true);
                  }}
                  className="w-full text-xs font-mono font-bold text-right rounded-lg border border-slate-300 py-1 pl-5 pr-2 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: ORDER TYPE & EXTRA NOTES */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <h2 className="font-bold text-slate-900 text-base">Order Classification & Notes</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Order Type *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('Direct Order')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    orderType === 'Direct Order'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" /> Direct Order
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('Follow-up Order')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    orderType === 'Follow-up Order'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" /> Follow-up Order
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Special Packaging / Courier Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes e.g. Deliver afternoon, call before coming"
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 5: LIVE ORDER SUMMARY & SUBMIT BUTTON */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Order Invoice Summary</span>
            <span className="text-xs text-slate-400 font-mono">
              {productRows.length} Product Type{productRows.length > 1 ? 's' : ''} ({totalQuantity} items)
            </span>
          </div>

          {/* Product Items Breakdown */}
          <div className="space-y-1.5 text-xs text-slate-300">
            {productRows.map((row, idx) => (
              <div key={row.tempId} className="flex justify-between items-center">
                <span className="truncate max-w-[220px] sm:max-w-md">
                  Product {idx + 1}: {row.productName || 'Custom Item'} <span className="text-slate-400">Qty: {row.quantity}</span>
                </span>
                <span className="font-mono text-slate-200">
                  ৳{((row.unitPrice || 0) * (row.quantity || 1)).toLocaleString()}
                </span>
              </div>
            ))}

            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-slate-300">
              <span>Products Total:</span>
              <span className="font-mono font-semibold">৳{productsTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Delivery ({deliveryLocation}):</span>
              <span className="font-mono font-semibold">৳{deliveryCharge.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-base sm:text-lg font-bold text-white pt-2 border-t border-slate-700">
              <span>Total COD Amount:</span>
              <span className="font-mono text-emerald-400 text-xl font-extrabold">৳{finalCODTotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            id="place_order_submit_btn"
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                <span>Place Order • ৳{finalCODTotal.toLocaleString()}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
