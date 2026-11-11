import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import {
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  Calendar,
  Phone,
  User,
  Search,
  CheckCircle2,
  TrendingUp,
  PackageCheck,
  Loader2,
} from 'lucide-react';

export default function EntrepreneurOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load incoming orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const totalUnits = orders.reduce((sum, o) => sum + Number(o.quantity || 0), 0);
  const paypalOrdersCount = orders.filter((o) => o.paymentMethod === 'paypal').length;

  const filteredOrders = orders.filter((o) => {
    const custName = o.customerId?.name || '';
    const prodName = o.productId?.productName || '';
    const q = search.toLowerCase();
    const matchesSearch = !q || custName.toLowerCase().includes(q) || prodName.toLowerCase().includes(q);

    if (filterType === 'paypal') {
      return matchesSearch && o.paymentMethod === 'paypal';
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-neutralGray shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-brand-primary" />
            <h1 className="text-2xl font-black text-brand-dark">Incoming Customer Orders</h1>
          </div>
          <p className="text-xs text-brand-dark opacity-65 font-medium mt-1">
            Real-time fulfillment ledger for purchases made through the marketplace and captured via PayPal Sandbox.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchOrders} className="text-xs font-bold">
          Refresh Orders
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-brand-neutralGray shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Total Revenue Collected
          </span>
          <p className="text-3xl font-black text-brand-primary">₹{totalRevenue}</p>
          <span className="text-[11px] text-stone-500 font-semibold">Across all received orders</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-neutralGray shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Units Ordered
          </span>
          <p className="text-3xl font-black text-brand-dark">{totalUnits}</p>
          <span className="text-[11px] text-stone-500 font-semibold">Packets prepared for delivery</span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> PayPal Sandbox Verified
          </span>
          <p className="text-3xl font-black text-emerald-900">{paypalOrdersCount}</p>
          <span className="text-[11px] text-emerald-700 font-semibold">Confirmed capture transactions</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-brand-neutralGray flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-brand-neutralGray text-xs font-semibold focus:outline-none"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-brand-primary text-white'
                : 'bg-brand-light text-brand-dark hover:bg-stone-200'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setFilterType('paypal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'paypal'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            PayPal Paid ({paypalOrdersCount})
          </button>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-brand-neutralGray">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-2" />
          <span className="text-xs font-bold text-brand-dark opacity-60">Loading incoming orders...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-brand-neutralGray space-y-2">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-brand-dark">No orders found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            When customers purchase your products via the marketplace, orders will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-neutralGray shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-light border-b border-brand-neutralGray text-brand-dark font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Order Date</th>
                  <th className="py-3.5 px-4">Customer Name & Contact</th>
                  <th className="py-3.5 px-4">Product Ordered</th>
                  <th className="py-3.5 px-4">Qty</th>
                  <th className="py-3.5 px-4">Total (₹)</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">PayPal Transaction ID</th>
                  <th className="py-3.5 px-4">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-neutralGray/60 font-medium text-brand-dark">
                {filteredOrders.map((order) => {
                  const isPayPal = order.paymentMethod === 'paypal';
                  const custName = order.customerId?.name || 'Customer';
                  const custPhone = order.customerId?.phone || 'N/A';
                  const prodName = order.productId?.productName || 'Millet Product';

                  return (
                    <tr key={order._id || order.id} className="hover:bg-brand-light/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-stone-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 font-bold">
                        <div className="flex flex-col">
                          <span className="text-sm font-extrabold text-brand-dark">{custName}</span>
                          <span className="text-[11px] text-stone-500 font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {custPhone}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-extrabold text-sm text-brand-dark">
                        {prodName}
                      </td>

                      <td className="py-3.5 px-4 font-black">
                        {order.quantity} units
                      </td>

                      <td className="py-3.5 px-4 font-black text-brand-primary text-sm">
                        ₹{order.totalAmount}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase border inline-flex items-center gap-1 ${
                            isPayPal
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-stone-50 text-stone-700 border-stone-200'
                          }`}
                        >
                          {isPayPal ? '✓ PayPal Sandbox' : 'Test Order'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600">
                        {order.paypalCaptureId ? (
                          <span className="bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                            {order.paypalCaptureId}
                          </span>
                        ) : order.paypalOrderId ? (
                          <span>{order.paypalOrderId}</span>
                        ) : (
                          <span className="text-stone-400 italic">None</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="bg-brand-primaryLight text-brand-primary px-2.5 py-0.5 rounded-md font-extrabold uppercase text-[10px]">
                          {order.orderStatus || 'Completed'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

