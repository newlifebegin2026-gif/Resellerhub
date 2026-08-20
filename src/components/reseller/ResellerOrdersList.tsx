import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Order, ResellerSession } from '../../types';
import {
  Package,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  Truck,
  CheckCircle2,
  XCircle,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  PlusCircle,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';

interface ResellerOrdersListProps {
  session: ResellerSession;
  onNavigateToNewOrder: () => void;
}

export const ResellerOrdersList: React.FC<ResellerOrdersListProps> = ({
  session,
  onNavigateToNewOrder,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getMyResellerOrders({
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load your orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, statusFilter]);

  // Statistics for this reseller
  const totalOrders = orders.length;
  const totalSales = orders.reduce((sum, o) => sum + (o.orderAmount || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const confirmedOrders = orders.filter((o) => o.status === 'Confirmed').length;
  const shippedOrders = orders.filter((o) => o.status === 'Shipped').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
  const cancelledOrders = orders.filter((o) => o.status === 'Cancelled').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Review
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle className="w-3 h-3 text-blue-600" />
            Confirmed
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3 h-3 text-purple-600" />
            Shipped (In Courier)
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3 text-red-600" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">My Orders & Live Status</h1>
              <p className="text-xs text-slate-500">
                Logged in as <strong className="text-indigo-600 font-semibold">{session.name}</strong> ({session.phone})
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={onNavigateToNewOrder}
            className="flex-1 md:flex-none py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Place New Order</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">My Total Orders</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalOrders}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Submitted by you</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Sales Volume</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">
            ৳{totalSales.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Order amount</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-medium text-amber-600 uppercase tracking-wider">Pending / Processing</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{pendingOrders + confirmedOrders}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{pendingOrders} Pending, {confirmedOrders} Confirmed</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-medium text-purple-600 uppercase tracking-wider">In Courier / Shipped</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{shippedOrders}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Out for delivery</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">Successfully Delivered</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{deliveredOrders}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {totalOrders > 0 ? `${Math.round((deliveredOrders / totalOrders) * 100)}% completion` : '0%'}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your orders by customer name, phone, product..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-700"
          >
            <option value="all">All Order Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
            <p className="text-sm font-medium">Loading your submitted orders...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <AlertCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-3 px-4 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchTerm || statusFilter !== 'all'
                ? 'No orders match your search or filter criteria. Try resetting filters.'
                : 'You have not submitted any orders yet. Click below to submit your first order!'}
            </p>
            <button
              onClick={onNavigateToNewOrder}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
            >
              Submit Your First Order
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer Info</th>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4 text-right">Qty & Amount</th>
                  <th className="py-3.5 px-4 text-center">Status (Managed by Admin)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition">
                    {/* Order ID & Date */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-mono font-medium text-indigo-600">{order.id}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(order.orderDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-slate-900">{order.customerName}</div>
                      <div className="text-slate-600 flex items-center gap-1 mt-0.5 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {order.customerPhone}
                      </div>
                    </td>

                    {/* Destination */}
                    <td className="py-3.5 px-4 align-top max-w-[200px]">
                      <div className="font-medium text-slate-800">{order.district} {order.thana ? `(${order.thana})` : ''}</div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5" title={order.customerAddress}>
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{order.customerAddress}</span>
                      </div>
                    </td>

                    {/* Product */}
                    <td className="py-3.5 px-4 align-top max-w-[240px]">
                      <div className="font-medium text-slate-900 leading-snug">{order.productDetails}</div>
                      {order.notes && (
                        <div className="text-[10px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-1 inline-block">
                          Note: {order.notes}
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                      <div className="font-bold text-slate-900">৳{order.orderAmount.toLocaleString('en-IN')}</div>
                      <div className="text-[11px] text-slate-500">Qty: {order.quantity}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 align-top text-center whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info Note */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Notice for Resellers:</p>
          <p className="text-indigo-800 text-[11px] mt-0.5">
            Order statuses (Pending → Confirmed → Shipped → Delivered) are verified and updated by the Admin team upon package dispatch and courier tracking. You only see orders submitted under your account ({session.name}).
          </p>
        </div>
      </div>
    </div>
  );
};
