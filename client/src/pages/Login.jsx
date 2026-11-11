import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { KeyRound, Phone, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      setError('Please provide your phone number and password / फ़ोन और पासवर्ड भरें');
      return;
    }

    if (phone.length < 10) {
      setError('Phone number must be at least 10 digits / फ़ोन नंबर 10 अंकों का होना चाहिए');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const loggedUser = await login(phone, password);
      
      // Automatically redirect based on actual verified backend role
      if (loggedUser.role === 'customer') {
        navigate('/customer/marketplace', { replace: true });
      } else {
        navigate('/entrepreneur/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials / लॉगिन नहीं हो सका');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <Card
        title={t('login') || 'Sign In to Your Account'}
        subtitle="Access your Marketplace portal or Entrepreneur Studio"
      >
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-xs font-bold border border-red-200">
              {error}
            </div>
          )}

          <div className="p-3 bg-brand-light rounded-xl border border-brand-neutralGray text-xs text-brand-dark opacity-75 font-semibold leading-relaxed">
            💡 Enter your registered phone number. Your account role (Customer or Entrepreneur) is authenticated securely by the system.
          </div>

          <Input
            id="phone"
            label="Phone Number (फ़ोन नंबर)"
            type="tel"
            maxLength={10}
            placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            required
            hint="Enter your 10-digit mobile number"
          />

          <Input
            id="password"
            label="Password / PIN (पासवर्ड)"
            type="password"
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={LogIn}
            disabled={loading}
            className="w-full font-bold shadow-md"
          >
            {loading ? 'Authenticating...' : t('login') || 'Sign In'}
          </Button>

          <div className="pt-4 border-t border-brand-neutralGray text-center space-y-2">
            <p className="text-xs text-brand-dark opacity-70 font-semibold">
              Don't have an account yet? / नया खाता बनाएं
            </p>
            <Link
              to="/register"
              className="text-xs font-black text-brand-primary hover:underline inline-flex items-center gap-1"
            >
              Create Customer or Entrepreneur Account <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
