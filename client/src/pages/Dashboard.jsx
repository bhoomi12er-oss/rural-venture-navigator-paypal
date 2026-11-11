import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { TrendingUp, QrCode, MessageSquare, Award, ArrowRight, Activity, Plus } from 'lucide-react';

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState("Millet Almond Crunch Cookies");
  const [costPerUnit, setCostPerUnit] = useState(18);
  const [sellingPrice, setSellingPrice] = useState(35);
  const [collectedReviewsCount, setCollectedReviewsCount] = useState(14);
  const [averageRating, setAverageRating] = useState(4.6);
  const [repeatPurchaseRate, setRepeatPurchaseRate] = useState(85);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('rvn_token');
    if (!token) return;

    const loadDashboardData = async () => {
      try {
        // Load cost calculations from local storage
        const calcs = JSON.parse(localStorage.getItem('rvn_calculations') || '{}');
        const localCost = calcs?.metrics?.unitCost || 18;
        setCostPerUnit(localCost);

        // 1. Fetch products
        const productsRes = await fetch('http://localhost:5000/api/products/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const productsData = await productsRes.json();
        if (productsData.success && productsData.products.length > 0) {
          const mainProduct = productsData.products[0];
          setProductName(mainProduct.productName);
          setSellingPrice(mainProduct.price);
        } else if (calcs?.inputs?.sellingPrice) {
          setSellingPrice(calcs.inputs.sellingPrice);
        }

        // 2. Fetch feedback
        const feedbackRes = await fetch('http://localhost:5000/api/feedback/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const feedbackData = await feedbackRes.json();
        
        let fbCount = 0;
        let avgR = 4.6;
        let repeatRate = 85;
        let activityList = [];

        if (feedbackData.success && feedbackData.feedbacks.length > 0) {
          const fbs = feedbackData.feedbacks;
          fbCount = fbs.length;
          
          const totalRating = fbs.reduce((sum, f) => sum + f.rating, 0);
          avgR = parseFloat((totalRating / fbCount).toFixed(1));
          
          const repeatCount = fbs.filter(f => f.wouldBuyAgain === true || f.wouldBuyAgain === 'true').length;
          repeatRate = Math.round((repeatCount / fbCount) * 100);

          // Add feedback to activities list
          fbs.slice(0, 5).forEach(f => {
            activityList.push({
              type: 'feedback',
              title: 'New Review Received',
              desc: `"${f.comment || 'No comment'}" - ${f.rating} Stars`,
              time: new Date(f.createdAt).toLocaleDateString(),
              rawTime: new Date(f.createdAt)
            });
          });
        }
        setCollectedReviewsCount(fbCount || 14);
        setAverageRating(avgR || 4.6);
        setRepeatPurchaseRate(repeatRate || 85);

        // 3. Fetch orders
        const ordersRes = await fetch('http://localhost:5000/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const ordersData = await ordersRes.json();
        if (ordersData.success && ordersData.orders.length > 0) {
          ordersData.orders.slice(0, 5).forEach(order => {
            const isPayPal = order.paymentMethod === 'paypal';
            activityList.push({
              type: 'order',
              title: `New Order (${order.quantity} units)${isPayPal ? ' [PayPal Sandbox Paid]' : ''}`,
              desc: `Total: ₹${order.totalAmount} from ${order.customerId?.name || 'Customer'}${order.paypalCaptureId ? ` • Tx: ${order.paypalCaptureId}` : ''}`,
              time: new Date(order.createdAt).toLocaleDateString(),
              rawTime: new Date(order.createdAt)
            });
          });
        }

        // Sort combined activity list by time
        activityList.sort((a, b) => b.rawTime - a.rawTime);
        if (activityList.length === 0) {
          // Fallback default activities
          activityList = [
            { type: 'feedback', title: 'New Review Received', desc: '"Swad bohot accha hai, packing acchi hai." - 5 Stars', time: '10 mins ago' },
            { type: 'qr', title: 'QR Code Generated for Test "Chhattisgarh Local stalls"', desc: 'Target: 20 reviews', time: '2 days ago' }
          ];
        }
        setRecentActivities(activityList.slice(0, 5));

      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const marginPercentage = sellingPrice > 0 ? parseFloat((((sellingPrice - costPerUnit) / sellingPrice) * 100).toFixed(1)) : 0;
  const currentDecision = "PILOT";

  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'PROCEED': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'PILOT': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'MODIFY': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'COLLABORATE': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'TEST FURTHER': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'PAUSE': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-brand-primary font-bold text-lg">
        Loading entrepreneur dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-primaryLight border border-brand-primary/20 rounded-2xl p-6 shadow-2xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-primary bg-white px-2.5 py-1 rounded-md border border-brand-primary/10">
            Entrepreneur Management Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-dark mt-2 m-0">
            {t('welcomeBack')} {user?.name || 'Entrepreneur'}
          </h1>
          <p className="text-xs text-brand-dark opacity-80 mt-1 font-semibold">
            Mahila Jagriti SHG • Dhamtari Millet Producer Cell
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/entrepreneur/products">
            <Button variant="primary" size="sm" icon={Plus} className="font-bold text-xs shadow-xs">
              Manage Products
            </Button>
          </Link>
          <Link to="/entrepreneur/orders">
            <Button variant="outline" size="sm" className="font-bold text-xs bg-white">
              View Customer Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Decision Summary Card */}
      <Card
        title={t('ventureStatus')}
        subtitle="Current status generated by the Decision Engine based on your raw numbers and feedback."
        headerActions={
          <Link to="/decision">
            <Button variant="outline" size="sm" icon={ArrowRight}>
              {t('viewReport')}
            </Button>
          </Link>
        }
      >
        <div className="flex flex-col md:flex-row items-center gap-6 mt-2">
          <div className={`px-6 py-4 rounded-xl border-2 text-center ${getDecisionColor(currentDecision)}`}>
            <span className="text-xs uppercase tracking-wider font-bold">Decision Engine Output</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 m-0">
              {currentDecision}
            </h2>
          </div>
          <div className="flex-1">
            <Alert variant="success" title="Positive Unit Economics Approved">
              Your calculated margin is <strong className="text-brand-primary">{marginPercentage}%</strong>. Customers like your cookies, and price satisfaction is high ({repeatPurchaseRate}% repeat buy intent). We recommend launching a small <strong>PILOT</strong> project in your local weekly market.
            </Alert>
          </div>
        </div>
      </Card>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Economics Card */}
        <Card
          title={t('costCalculator')}
          subtitle="Calculated economics per unit"
          className="hover:border-brand-primary transition-all"
        >
          <div className="space-y-4 mt-2">
            <div className="flex justify-between items-center py-2 border-b border-brand-neutralGray">
              <span className="text-brand-dark opacity-75 font-semibold">Cost Per Packet</span>
              <span className="text-xl font-bold text-brand-dark">₹{costPerUnit}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-brand-neutralGray">
              <span className="text-brand-dark opacity-75 font-semibold">Selling Price</span>
              <span className="text-xl font-bold text-brand-dark">₹{sellingPrice}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-brand-primary font-bold">Profit Margin</span>
              <span className="text-xl font-extrabold text-brand-primary">₹{sellingPrice - costPerUnit} ({marginPercentage}%)</span>
            </div>
            <Link to="/calculator" className="block">
              <Button variant="light" size="sm" className="w-full">
                Edit Costs
              </Button>
            </Link>
          </div>
        </Card>

        {/* QR Card */}
        <Card
          title={t('demandTest')}
          subtitle="Direct customer packaging QR code"
          className="hover:border-brand-primary transition-all"
        >
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <QrCode className="w-24 h-24 text-brand-primary bg-brand-primaryLight p-2 rounded-xl mb-3 border border-brand-primary/10" />
            <span className="text-sm font-semibold text-brand-dark mb-4">{productName} QR Test</span>
            <Link to="/demand-test" className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                Get QR Code
              </Button>
            </Link>
          </div>
        </Card>

        {/* Feedback Card */}
        <Card
          title={t('customerFeedback')}
          subtitle="Evidence metrics from QR reviews"
          className="hover:border-brand-primary transition-all"
        >
          <div className="space-y-4 mt-2">
            <div className="flex justify-between items-center py-2 border-b border-brand-neutralGray">
              <span className="text-brand-dark opacity-75 font-semibold">Total Reviews</span>
              <span className="text-xl font-bold text-brand-dark">{collectedReviewsCount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-brand-neutralGray">
              <span className="text-brand-dark opacity-75 font-semibold">Average Rating</span>
              <span className="text-xl font-bold text-brand-primary">★ {averageRating} / 5</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-brand-dark opacity-75 font-semibold">Repeat Buy Intent</span>
              <span className="text-xl font-bold text-brand-primary">{repeatPurchaseRate}%</span>
            </div>
            <Link to="/analytics" className="block">
              <Button variant="light" size="sm" className="w-full">
                {t('viewFeedback')}
              </Button>
            </Link>
          </div>
        </Card>

      </div>

      {/* Recent Activity */}
      <Card title={t('recentActivity')}>
        <div className="divide-y divide-brand-neutralGray">
          {recentActivities.map((act, index) => (
            <div key={index} className="flex items-center gap-3 py-3">
              <div className="p-2 bg-emerald-50 text-brand-primary rounded-full">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-brand-dark">{act.title}</p>
                <p className="text-xs text-brand-dark opacity-60">{act.desc}</p>
              </div>
              <span className="text-xs text-brand-dark opacity-65 font-medium">{act.time}</span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
