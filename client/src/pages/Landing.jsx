import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShoppingBag,
  Briefcase,
  Calculator,
  QrCode,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  Heart,
  Sparkles,
} from 'lucide-react';

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();

  // If already authenticated, redirect directly to their respective portal
  if (isAuthenticated) {
    if (user?.role === 'customer') {
      return <Navigate to="/customer/marketplace" replace />;
    }
    return <Navigate to="/entrepreneur/dashboard" replace />;
  }

  return (
    <div className="space-y-16 py-8">
      
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 space-y-6">
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-primaryLight text-brand-primary font-bold text-xs uppercase tracking-widest rounded-full border border-brand-primary/20">
          <Heart className="w-3.5 h-3.5 fill-brand-primary" /> Supported for SHG Millet Groups & Direct Customers
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-brand-dark tracking-tight leading-[1.1]">
          Rural Venture Navigator
        </h1>
        <p className="text-lg sm:text-xl text-brand-dark opacity-85 leading-relaxed max-w-2xl mx-auto font-medium">
          A dedicated dual-portal platform connecting women-led Self-Help Groups in Chhattisgarh with global buyers via PayPal Sandbox payments and actionable unit economics.
        </p>
      </section>

      {/* Dual Portal Selection Cards */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Portal 1: Customer Marketplace */}
          <div className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col justify-between relative overflow-hidden group border border-emerald-700">
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-emerald-200">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-800/60 px-3 py-1 rounded-full border border-emerald-600">
                Customer Marketplace
              </span>
              <h2 className="text-2xl sm:text-3xl font-black leading-snug">
                Buy Organic Millet Products
              </h2>
              <p className="text-sm text-emerald-100 font-medium leading-relaxed opacity-90">
                Explore ragi cookies, jowar crisps, and traditional millet laddoos. Pay with the official PayPal Sandbox gateway and provide direct feedback to women producers.
              </p>
            </div>

            <div className="pt-8 relative z-10 flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="flex-1">
                <Button variant="secondary" size="md" icon={ArrowRight} className="w-full font-bold shadow-md">
                  Shop as Customer
                </Button>
              </Link>
              <Link to="/login" className="flex-1">
                <button className="w-full py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/20">
                  Customer Login
                </button>
              </Link>
            </div>
            
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Portal 2: Entrepreneur Studio */}
          <div className="bg-white border-2 border-brand-neutralGray rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col justify-between hover:border-brand-primary transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-primaryLight flex items-center justify-center text-brand-primary">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-brand-primary bg-brand-primaryLight px-3 py-1 rounded-full border border-brand-primary/20">
                Entrepreneur Studio
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-dark leading-snug">
                Manage Your Millet Business
              </h2>
              <p className="text-sm text-brand-dark opacity-75 font-medium leading-relaxed">
                Add and manage product inventory, track incoming customer PayPal orders, calculate cost margins, generate packaging QR feedback tests, and view AI recommendations.
              </p>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="flex-1">
                <Button variant="primary" size="md" icon={ArrowRight} className="w-full font-bold shadow-md">
                  Seller Registration
                </Button>
              </Link>
              <Link to="/login" className="flex-1">
                <Button variant="outline" size="md" className="w-full font-bold">
                  Entrepreneur Login
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="space-y-8 max-w-5xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-brand-dark">Integrated Rural Commerce Ecosystem</h2>
          <p className="text-brand-dark opacity-75 mt-2 font-medium">
            Bridging rural grassroots production with modern e-commerce and rigorous unit economics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="PayPal Sandbox Payments" subtitle="Global standards, zero risk">
            <div className="space-y-3 mt-4">
              <div className="p-3 bg-brand-primaryLight/70 text-brand-primary rounded-xl w-fit">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <p className="text-brand-dark opacity-85 leading-relaxed font-semibold text-xs">
                Real-time price calculations on the server, instant capture verification, and complete audit receipts for rural sellers.
              </p>
            </div>
          </Card>

          <Card title="Packaging QR Tests" subtitle="Real buyer evidence">
            <div className="space-y-3 mt-4">
              <div className="p-3 bg-brand-primaryLight/70 text-brand-primary rounded-xl w-fit">
                <QrCode className="w-7 h-7" />
              </div>
              <p className="text-brand-dark opacity-85 leading-relaxed font-semibold text-xs">
                Collect buyer ratings on flavor, price reasonability, and repeat-buy intent directly onto the entrepreneur dashboard.
              </p>
            </div>
          </Card>

          <Card title="Unit Economics Calculator" subtitle="Mathematical profitability">
            <div className="space-y-3 mt-4">
              <div className="p-3 bg-brand-primaryLight/70 text-brand-primary rounded-xl w-fit">
                <Calculator className="w-7 h-7" />
              </div>
              <p className="text-brand-dark opacity-85 leading-relaxed font-semibold text-xs">
                Break-even analysis, profit margins per packet, and voice-assisted cost forms designed for rural language accessibility.
              </p>
            </div>
          </Card>
        </div>
      </section>

    </div>
  );
}
