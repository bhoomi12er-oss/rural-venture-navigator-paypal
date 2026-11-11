import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingBag, Briefcase, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Register() {
  const { t } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // default to customer for marketplace onboarding
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !password) {
      setError('Please fill in your full name, phone number, and password');
      return;
    }

    if (phone.length < 10) {
      setError('Phone number must be at least 10 digits / फ़ोन नंबर 10 अंकों का होना चाहिए');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const loggedUser = await register(name, phone, password, role);

      // Route directly to respective portal based on created role
      if (loggedUser.role === 'customer') {
        navigate('/customer/marketplace', { replace: true });
      } else {
        navigate('/entrepreneur/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Registration failed / पंजीकरण असफल रहा');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <Card
        title={t('register') || 'Create Your Account'}
        subtitle="Choose your account type to access the right portal"
      >
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-xs font-bold border border-red-200">
              {error}
            </div>
          )}

          {/* Account Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black text-brand-dark uppercase tracking-wider block">
              Select Your Role / अपनी भूमिका चुनें
            </label>
            <div className="grid grid-cols-2 gap-3">
              
              {/* Customer Option */}
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  role === 'customer'
                    ? 'border-brand-primary bg-brand-primaryLight/50 shadow-sm ring-2 ring-brand-primary/20'
                    : 'border-brand-neutralGray bg-white hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${role === 'customer' ? 'bg-brand-primary text-white' : 'bg-stone-100 text-stone-600'}`}>
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  {role === 'customer' && (
                    <span className="text-[10px] bg-brand-primary text-white font-bold px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <p className="font-extrabold text-sm text-brand-dark">Customer / Buyer</p>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5 leading-snug">
                    Browse millets, buy via PayPal, and leave buyer reviews.
                  </p>
                </div>
              </button>

              {/* Entrepreneur Option */}
              <button
                type="button"
                onClick={() => setRole('entrepreneur')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  role === 'entrepreneur'
                    ? 'border-brand-primary bg-brand-primaryLight/50 shadow-sm ring-2 ring-brand-primary/20'
                    : 'border-brand-neutralGray bg-white hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${role === 'entrepreneur' ? 'bg-brand-primary text-white' : 'bg-stone-100 text-stone-600'}`}>
                    <Briefcase className="w-5 h-5" />
                  </div>
                  {role === 'entrepreneur' && (
                    <span className="text-[10px] bg-brand-primary text-white font-bold px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <p className="font-extrabold text-sm text-brand-dark">Rural Entrepreneur</p>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5 leading-snug">
                    Manage catalog, track PayPal orders, and calculate economics.
                  </p>
                </div>
              </button>

            </div>
          </div>

          <Input
            id="name"
            label="Full Name (पूरा नाम)"
            placeholder="e.g. Anita Devi or Lakshmi Bai"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            id="phone"
            label="Mobile Phone Number (मोबाइल नंबर)"
            type="tel"
            maxLength={10}
            placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            required
            hint="Used to log in to your account"
          />

          <Input
            id="password"
            label="Choose Password / PIN (पासवर्ड)"
            type="password"
            placeholder="Minimum 4 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={UserPlus}
            disabled={loading}
            className="w-full font-bold shadow-md"
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'customer' ? 'Customer' : 'Entrepreneur'}`}
          </Button>

          <div className="pt-4 border-t border-brand-neutralGray text-center">
            <p className="text-xs text-brand-dark opacity-70 font-semibold">
              Already have an account? / पहले से खाता है?
            </p>
            <Link
              to="/login"
              className="text-xs font-black text-brand-primary hover:underline inline-flex items-center gap-1 mt-1"
            >
              Sign In to Your Existing Account <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
