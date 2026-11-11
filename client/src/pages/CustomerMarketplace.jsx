import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  Star,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  Heart,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Package,
  Calendar,
  MessageSquare,
  ThumbsUp,
  Sparkles,
  Plus,
  Minus,
  Check,
} from 'lucide-react';

export default function CustomerMarketplace() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { addToCart, openCheckout, openCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Quantity selection per product
  const [quantities, setQuantities] = useState({});
  const [addedAnimationId, setAddedAnimationId] = useState(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [wouldBuyAgain, setWouldBuyAgain] = useState(true);
  const [priceReasonable, setPriceReasonable] = useState('reasonable');
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Fetch all active products
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch customer's own order history
  const fetchMyOrders = async () => {
    const token = localStorage.getItem('rvn_token');
    if (!token) return;
    try {
      setLoadingOrders(true);
      const res = await fetch('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMyOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchMyOrders();
  }, []);

  const getQuantity = (id) => quantities[id] || 1;

  const handleQuantityChange = (id, delta) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleAddToCart = (product) => {
    const id = product._id || product.id;
    const qty = getQuantity(id);
    addToCart(product, qty);
    setAddedAnimationId(id);
    setTimeout(() => {
      setAddedAnimationId(null);
    }, 1500);
  };

  const handleBuyNow = (product) => {
    const id = product._id || product.id;
    const qty = getQuantity(id);
    // Open checkout modal with this single product and selected quantity
    openCheckout({ ...product, selectedQuantity: qty });
  };

  // Review submission
  const handleOpenReview = (product) => {
    setReviewProduct(product);
    setRating(5);
    setWouldBuyAgain(true);
    setPriceReasonable('reasonable');
    setComment('');
    setReviewSuccess(false);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewProduct) return;
    const token = localStorage.getItem('rvn_token');

    try {
      setSubmittingReview(true);
      const res = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: reviewProduct._id || reviewProduct.id,
          rating,
          wouldBuyAgain,
          priceReasonable,
          comment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReviewSuccess(true);
        setTimeout(() => {
          setReviewModalOpen(false);
          setReviewSuccess(false);
        }, 1800);
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (err) {
      alert('Error submitting feedback. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' || (p.category || '').toLowerCase() === selectedCategory.toLowerCase();

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.productName.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.ingredients || '').toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All Products / सभी उत्पाद' },
    { id: 'cookies', label: 'Millet Cookies / कुकीज़' },
    { id: 'snacks', label: 'Savory Crisps / स्नैक्स' },
    { id: 'flour', label: 'Nutritious Laddoos & Flour' },
  ];

  return (
    <div className="space-y-10">
      
      {/* Marketplace Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-8 sm:p-12 shadow-xl border border-emerald-700/50">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-black uppercase tracking-wider border border-white/20">
            <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" />
            Empowering Chhattisgarh Women SHGs
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Handcrafted Organic Millets Directly to Your Doorstep
          </h1>
          
          <p className="text-sm sm:text-base text-emerald-100 font-medium leading-relaxed opacity-95">
            Support rural women farmers and producers in Dhamtari district. Every purchase directly empowers local self-help groups, certified with clean, natural millet grains.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-extrabold text-emerald-200">
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> PayPal Sandbox Verified
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg">
              <Package className="w-4 h-4 text-emerald-400" /> Free Community Delivery
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg">
              <Sparkles className="w-4 h-4 text-emerald-400" /> 100% Preservative Free
            </span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Filter and Search Bar */}
      <section className="space-y-4 bg-white p-6 rounded-2xl border border-brand-neutralGray shadow-2xs">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cookies, jowar crisps, laddoos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-brand-neutralGray text-sm font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Results Summary */}
          <div className="text-xs font-bold text-brand-dark opacity-60">
            Showing {filteredProducts.length} organic millet products
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-brand-neutralGray/60">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-brand-light text-brand-dark hover:bg-brand-neutralGray/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="space-y-6">
        {loadingProducts ? (
          <div className="text-center py-16 text-brand-primary font-bold">
            Loading fresh rural millet harvest...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-brand-neutralGray rounded-2xl text-brand-dark opacity-60 space-y-2">
            <ShoppingBag className="w-12 h-12 mx-auto text-stone-300" />
            <p className="text-base font-bold">No products match your search</p>
            <p className="text-xs">Try selecting "All Products" or clearing your search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const id = product._id || product.id;
              const qty = getQuantity(id);
              const isAdded = addedAnimationId === id;
              const approxUSD = (product.price * 0.012).toFixed(2);
              const stock = product.availableQuantity || 100;

              return (
                <div
                  key={id}
                  className="bg-white border border-brand-neutralGray rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="p-6 space-y-4">
                    
                    {/* Top Row: Category Tag & Stock Status */}
                    <div className="flex justify-between items-center">
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border border-emerald-200">
                        {product.category || 'Millet'}
                      </span>
                      <span className="text-[11px] font-extrabold text-stone-500">
                        {stock > 20 ? (
                          <span className="text-emerald-700">In Stock ({stock})</span>
                        ) : (
                          <span className="text-amber-700">Low Stock ({stock})</span>
                        )}
                      </span>
                    </div>

                    {/* Product Title & Producer */}
                    <div>
                      <h3 className="text-xl font-black text-brand-dark group-hover:text-brand-primary transition-colors leading-snug">
                        {product.productName}
                      </h3>
                      <p className="text-xs text-brand-primary font-bold mt-1 uppercase tracking-wide">
                        Producer: {product.shg || 'Mahila Jagriti SHG'}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-brand-dark opacity-75 font-semibold line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Ingredients Highlight */}
                    <div className="p-3 bg-brand-light rounded-xl border border-brand-neutralGray/60 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                        Pure Ingredients:
                      </span>
                      <p className="text-xs font-semibold text-brand-dark opacity-90 line-clamp-1">
                        {product.ingredients}
                      </p>
                    </div>

                    {/* Rating & Repeat Badge */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-amber-500" />
                        <span className="text-xs font-black text-brand-dark">4.8</span>
                        <span className="text-[10px] text-stone-400 font-semibold">(40+ reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <ThumbsUp className="w-3 h-3" /> 92% Repeat Intent
                      </div>
                    </div>

                    {/* Price Block */}
                    <div className="pt-2 border-t border-brand-neutralGray/60 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Price</span>
                        <p className="text-2xl font-black text-brand-primary leading-none mt-0.5">
                          ₹{product.price}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                        ~${approxUSD} USD (PayPal)
                      </span>
                    </div>

                  </div>

                  {/* Actions & Quantity Controller */}
                  <div className="p-6 pt-0 space-y-3">
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between p-1.5 bg-brand-light border border-brand-neutralGray rounded-xl">
                      <span className="text-xs font-bold text-brand-dark pl-2">Quantity:</span>
                      <div className="flex items-center gap-1 bg-white border border-brand-neutralGray rounded-lg">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(id, -1)}
                          className="px-2 py-1 text-brand-dark hover:bg-stone-100 rounded-l transition-all text-xs font-bold"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1 text-xs font-black text-brand-dark min-w-[30px] text-center">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(id, 1)}
                          className="px-2 py-1 text-brand-dark hover:bg-stone-100 rounded-r transition-all text-xs font-bold"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={isAdded ? 'primary' : 'outline'}
                        size="sm"
                        icon={isAdded ? Check : ShoppingCart}
                        onClick={() => handleAddToCart(product)}
                        className="font-bold text-xs w-full py-2.5"
                      >
                        {isAdded ? 'Added!' : 'Add to Cart'}
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        icon={CreditCard}
                        onClick={() => handleBuyNow(product)}
                        className="font-bold text-xs w-full py-2.5 shadow-sm"
                      >
                        Buy Now
                      </Button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Customer Orders & PayPal Receipts Section */}
      <section id="customer-orders-section" className="space-y-6 pt-6 border-t border-brand-neutralGray">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-brand-primary" />
              <h2 className="text-2xl font-black text-brand-dark">My Orders & PayPal Receipts</h2>
            </div>
            <p className="text-xs text-brand-dark opacity-60 font-medium mt-1">
              Track your confirmed purchases, view PayPal transaction IDs, and leave product feedback.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMyOrders}
            className="text-xs font-bold"
          >
            Refresh Orders
          </Button>
        </div>

        {loadingOrders ? (
          <div className="text-center py-8 text-xs font-bold text-brand-dark opacity-60">
            Checking order receipts...
          </div>
        ) : myOrders.length === 0 ? (
          <div className="text-center py-12 bg-white border border-dashed border-brand-neutralGray rounded-2xl space-y-2">
            <Package className="w-12 h-12 mx-auto text-stone-300" />
            <h3 className="text-base font-bold text-brand-dark">No orders yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Your purchased millet products and PayPal payment receipts will appear here after you place an order.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myOrders.map((order) => {
              const isPayPal = order.paymentMethod === 'paypal';
              const pName = order.productId?.productName || 'Millet Product';
              const prod = order.productId;

              return (
                <div
                  key={order._id || order.id}
                  className="p-5 bg-white border border-brand-neutralGray rounded-2xl shadow-2xs space-y-3.5"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h4 className="font-extrabold text-brand-dark text-base">{pName}</h4>
                      <p className="text-xs text-brand-dark opacity-60 font-semibold mt-0.5">
                        Quantity: <strong>{order.quantity} units</strong> • Total: <strong>₹{order.totalAmount}</strong>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                        isPayPal
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      {isPayPal ? '✓ Paid via PayPal Sandbox' : 'Test Order'}
                    </span>
                  </div>

                  {/* PayPal Details Box */}
                  {order.paypalOrderId && (
                    <div className="bg-brand-light p-3 rounded-xl border border-brand-neutralGray/60 space-y-1 font-mono text-[11px] text-brand-dark opacity-85">
                      <div className="flex justify-between">
                        <span>PayPal Order ID:</span>
                        <span className="font-bold">{order.paypalOrderId}</span>
                      </div>
                      {order.paypalCaptureId && (
                        <div className="flex justify-between">
                          <span>Transaction Capture ID:</span>
                          <span className="font-bold text-brand-primary">{order.paypalCaptureId}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-brand-neutralGray/60 text-xs">
                    <span className="text-stone-400 flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>

                    {prod && (
                      <button
                        type="button"
                        onClick={() => handleOpenReview(prod)}
                        className="text-brand-primary font-extrabold hover:underline flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Leave Review / समीक्षा दें
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Post-Purchase Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Review: ${reviewProduct?.productName || 'Millet Product'}`}
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReviewModalOpen(false)}
              disabled={submittingReview}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitReview}
              disabled={submittingReview}
              className="font-bold"
            >
              {submittingReview ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        }
      >
        {reviewSuccess ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-500">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black text-brand-dark">Review Submitted!</h4>
            <p className="text-xs text-stone-500">
              Thank you! Your feedback will directly help the rural women producers improve their product.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4 py-2">
            
            {/* Star Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                Overall Quality & Taste (रेटिंग)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating ? 'fill-amber-400 text-amber-500' : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm font-bold text-brand-dark ml-2">{rating} / 5 Stars</span>
              </div>
            </div>

            {/* Price Reasonability */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                Price Assessment (कीमत कैसी लगी?)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cheap', label: 'Very Affordable' },
                  { id: 'reasonable', label: 'Reasonable (सही)' },
                  { id: 'expensive', label: 'Too Expensive' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPriceReasonable(opt.id)}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all ${
                      priceReasonable === opt.id
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-white border-brand-neutralGray text-brand-dark hover:bg-stone-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Repeat Intent */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                Would you purchase this again? (क्या आप दोबारा खरीदेंगे?)
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setWouldBuyAgain(true)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                    wouldBuyAgain
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white border-brand-neutralGray text-brand-dark'
                  }`}
                >
                  ✓ Yes, Definitely / हाँ जरूर
                </button>
                <button
                  type="button"
                  onClick={() => setWouldBuyAgain(false)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                    !wouldBuyAgain
                      ? 'bg-stone-700 text-white border-stone-700'
                      : 'bg-white border-brand-neutralGray text-brand-dark'
                  }`}
                >
                  ✕ No / नहीं
                </button>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                Your Feedback & Suggestions (सुझाव)
              </label>
              <textarea
                rows={3}
                placeholder="Share your thoughts on crunchiness, sweetness, packaging..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 rounded-xl border border-brand-neutralGray text-xs font-medium text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

          </form>
        )}
      </Modal>

    </div>
  );
}

