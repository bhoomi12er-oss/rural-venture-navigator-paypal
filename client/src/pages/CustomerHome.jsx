import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Star,
  ShieldCheck,
  Heart,
  ShoppingBag,
  ShoppingCart,
  MessageSquare,
  CheckCircle,
  ThumbsUp,
  CreditCard,
  Package,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export default function CustomerHome() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addToCart, openCheckout, openCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [addedProductId, setAddedProductId] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

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
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchMyOrders();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedProductId(product._id || product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
  };

  const handleBuyNow = (product) => {
    openCheckout(product);
  };

  const getProductBg = (category) => {
    switch (category) {
      case 'cookies':
        return 'from-emerald-500/10 to-teal-500/5';
      case 'snacks':
        return 'from-amber-500/10 to-orange-500/5';
      case 'flour':
        return 'from-purple-500/10 to-indigo-500/5';
      default:
        return 'from-blue-500/10 to-cyan-500/5';
    }
  };

  const getProductBadge = (category, lang) => {
    const isHindi = lang === 'Hindi (हिंदी)';
    if (category === 'cookies') return isHindi ? 'सबसे लोकप्रिय' : 'Best Seller';
    if (category === 'snacks') return isHindi ? 'फाइबर से भरपूर' : 'High Fiber';
    if (category === 'flour') return isHindi ? 'पौष्टिक' : 'Nutritious';
    return isHindi ? 'ताज़ा उत्पाद' : 'Fresh Choice';
  };

  const renderStars = (rating) => {
    const finalRating = rating || 4.7;
    return (
      <div className="flex gap-0.5 text-amber-500 items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4.5 h-4.5 ${
              i < Math.round(finalRating) ? 'fill-amber-500' : 'text-stone-300'
            }`}
          />
        ))}
        <span className="text-xs font-bold text-brand-dark opacity-75 ml-1">{finalRating}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-brand-primary font-bold text-lg">
        Loading local millet ventures showcase...
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4">
      {/* Header Greeting Banner */}
      <section className="bg-brand-primaryLight border border-brand-primary/20 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 justify-between shadow-sm">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-brand-primary font-bold text-xs uppercase tracking-wider rounded-full border border-brand-primary/10">
            <Heart className="w-3.5 h-3.5 fill-brand-primary text-brand-primary" /> Support Local SHGs
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-dark tracking-tight">
            {t('customerHomeTitle')}
          </h1>
          <p className="text-sm sm:text-base text-brand-dark opacity-80 leading-relaxed max-w-2xl font-medium">
            {t('customerHomeSubtitle')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="bg-white border border-brand-neutralGray px-5 py-4 rounded-xl shadow-sm text-center flex-shrink-0 min-w-[160px]">
            <span className="text-xs text-brand-dark opacity-60 font-semibold uppercase tracking-wider">
              Logged In As
            </span>
            <p className="text-lg font-bold text-brand-primary mt-0.5">{user?.name || 'Customer'}</p>
            <span className="text-[10px] bg-brand-primaryLight text-brand-primary font-bold px-2 py-0.5 rounded-md mt-1 inline-block uppercase">
              {user?.role === 'entrepreneur'
                ? t('roleSeller') || 'Seller'
                : t('roleCustomer') || 'Customer'}
            </span>
          </div>

          <Button
            variant="outline"
            size="md"
            icon={ShoppingCart}
            onClick={openCart}
            className="w-full sm:w-auto font-bold bg-white"
          >
            Open Cart
          </Button>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-center border-b border-brand-neutralGray pb-3">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-dark">{t('featuredProducts')}</h2>
            <p className="text-xs text-brand-dark opacity-60 font-medium mt-0.5">
              Secure PayPal Sandbox Checkout enabled with real-time price validation.
            </p>
          </div>
          <span className="text-xs text-brand-dark opacity-60 font-semibold">
            {products.length} Products Available
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-brand-neutralGray rounded-xl bg-white text-brand-dark opacity-60">
            No products uploaded by rural entrepreneurs yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => {
              const id = product._id || product.id;
              const isJustAdded = addedProductId === id;

              return (
                <Card
                  key={id}
                  className={`hover:scale-[1.01] hover:shadow-md transition-all duration-300 border-brand-neutralGray relative flex flex-col justify-between overflow-hidden bg-gradient-to-br ${getProductBg(
                    product.category
                  )}`}
                >
                  {/* Product Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-brand-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                      {getProductBadge(product.category, t('language'))}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Product Name & SHG */}
                    <div>
                      <h3 className="text-xl font-extrabold text-brand-dark leading-snug pr-20">
                        {product.productName}
                      </h3>
                      <p className="text-xs text-brand-primary font-bold mt-1 uppercase tracking-wide">
                        {t('shgLabel')}: {product.shg || 'Mahila Jagriti SHG'}
                      </p>
                    </div>

                    {/* Rating and Price */}
                    <div className="flex items-center justify-between border-t border-b border-brand-neutralGray/40 py-2.5">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-brand-dark opacity-60 font-bold uppercase tracking-wider">
                          {t('rating')}
                        </span>
                        {renderStars(product.rating)}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-brand-dark opacity-60 font-bold uppercase tracking-wider">
                          Price
                        </span>
                        <p className="text-2xl font-black text-brand-primary mt-0.5">₹{product.price}</p>
                        <span className="text-[10px] text-amber-700 font-semibold">
                          ~${(product.price * 0.012).toFixed(2)} USD
                        </span>
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-brand-dark opacity-60 uppercase tracking-wider">
                        {t('ingredients')}:
                      </span>
                      <p className="text-sm font-semibold text-brand-dark opacity-85 leading-relaxed line-clamp-2">
                        {product.ingredients}
                      </p>
                    </div>

                    {/* Repeat intent helper */}
                    <div className="bg-white/60 border border-brand-neutralGray p-2.5 rounded-lg flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-brand-primary fill-brand-primaryLight" />
                      <span className="text-xs font-semibold text-brand-dark opacity-80">
                        <strong>{product.repeatIntent || 90}%</strong> of buyers will purchase this product again.
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 mt-6 pt-3 border-t border-brand-neutralGray/40">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={isJustAdded ? 'primary' : 'outline'}
                        size="sm"
                        icon={isJustAdded ? CheckCircle : ShoppingCart}
                        onClick={() => handleAddToCart(product)}
                        className="font-bold w-full text-xs"
                      >
                        {isJustAdded ? 'Added!' : 'Add to Cart'}
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        icon={CreditCard}
                        onClick={() => handleBuyNow(product)}
                        className="font-bold w-full text-xs shadow-xs"
                      >
                        Buy Now (PayPal)
                      </Button>
                    </div>

                    {user?.role === 'entrepreneur' ? (
                      <Link to="/analytics" className="w-full block">
                        <Button
                          variant="light"
                          size="sm"
                          icon={MessageSquare}
                          className="font-bold w-full text-xs"
                        >
                          {t('viewFeedback')}
                        </Button>
                      </Link>
                    ) : (
                      <Link to={`/feedback/${id}`} className="w-full block">
                        <Button
                          variant="light"
                          size="sm"
                          icon={MessageSquare}
                          className="font-bold w-full text-xs"
                        >
                          {t('giveFeedback')}
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Trust & Verification Info section */}
      <section className="bg-white border border-brand-neutralGray rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="p-4 bg-brand-primaryLight rounded-2xl text-brand-primary border border-brand-primary/10">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-brand-dark">
            Supported by Chhattisgarh Women Empowerment Cells & PayPal Sandbox
          </h3>
          <p className="text-sm text-brand-dark opacity-80 leading-relaxed font-semibold">
            Every product purchased supports local millet farming and self-reliant women entrepreneurs in Dhamtari district. Payments are securely processed via PayPal Sandbox with verified backend order capture and seller settlement.
          </p>
        </div>
      </section>

      {/* Customer Orders & PayPal Payment History */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b border-brand-neutralGray pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-primary" />
            <h2 className="text-xl font-extrabold text-brand-dark">Your Orders & PayPal Receipts</h2>
          </div>
          <button
            onClick={fetchMyOrders}
            className="text-xs font-semibold text-brand-primary hover:underline"
          >
            Refresh Orders
          </button>
        </div>

        {myOrders.length === 0 ? (
          <div className="text-center py-8 border border-brand-neutralGray rounded-xl bg-white text-brand-dark opacity-60 text-sm">
            You haven't placed any orders yet. Use the PayPal checkout above to test the purchasing flow!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myOrders.map((order) => {
              const isPayPal = order.paymentMethod === 'paypal';
              const pName = order.productId?.productName || 'Millet Product';
              const prodId = order.productId?._id || order.productId;

              return (
                <div
                  key={order._id || order.id}
                  className="p-5 bg-white border border-brand-neutralGray rounded-xl shadow-2xs space-y-3"
                >
                  <div className="flex justify-between items-start gap-2">
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
                      {isPayPal ? '✓ Paid via PayPal' : 'Test Order'}
                    </span>
                  </div>

                  {/* PayPal Transaction Info */}
                  {order.paypalOrderId && (
                    <div className="bg-brand-light p-2.5 rounded-lg border border-brand-neutralGray/60 space-y-1 font-mono text-[11px] text-brand-dark opacity-80">
                      <div className="flex justify-between">
                        <span>PayPal Order:</span>
                        <span className="font-bold">{order.paypalOrderId}</span>
                      </div>
                      {order.paypalCaptureId && (
                        <div className="flex justify-between">
                          <span>Capture ID:</span>
                          <span className="font-bold text-brand-primary">{order.paypalCaptureId}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-brand-neutralGray/40 text-xs">
                    <span className="text-brand-dark opacity-50 flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>

                    {prodId && (
                      <Link
                        to={`/feedback/${prodId}`}
                        className="text-brand-primary font-bold hover:underline flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Leave Review
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
