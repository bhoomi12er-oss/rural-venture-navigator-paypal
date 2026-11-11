import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Shield, Check, Save } from 'lucide-react';

export default function Profile() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || 'Lakshmi Bai');
  const [phone, setPhone] = useState(user?.phone || '9876543210');
  const [shgName, setShgName] = useState('Mahila Jagriti Self Help Group');
  const [location, setLocation] = useState('Dhamtari, Chhattisgarh');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('rvn_token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/entrepreneur/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.profile) {
          setShgName(data.profile.businessName || 'Mahila Jagriti Self Help Group');
          setLocation(data.profile.location || 'Dhamtari, Chhattisgarh');
        }
      } catch (err) {
        console.error('Error fetching profile from backend:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('rvn_token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5000/api/entrepreneur/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          businessName: shgName,
          location: location,
          category: 'cookies',
          description: 'Rural Self Help Group (SHG) entrepreneur.',
          productionCapacity: 200,
          targetCustomers: 'Health conscious families',
          languagePreference: localStorage.getItem('rvn_lang') === 'hi' ? 'hi' : 'en'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert(data.message || "Failed to update profile / update nahi ho paya");
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      alert("Failed to connect to profile server");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark m-0">{t('profile')}</h1>

      <Card title="Entrepreneur Profile Details" subtitle="Edit your personal and self-help group credentials">
        <form onSubmit={handleSave} className="space-y-6 mt-4">
          {success && (
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-sm font-semibold border border-emerald-200 flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Profile details saved successfully! / Profile save ho gayi hai!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              id="name"
              label="Full Name (पूरा नाम)"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              allowVoice={true}
            />
            <Input
              id="phone"
              label="Phone Number (फ़ोन नंबर)"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled
              hint="Cannot change registered number"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              id="shgName"
              label="SHG / Cooperative (स्वयं सहायता समूह)"
              type="text"
              value={shgName}
              onChange={(e) => setShgName(e.target.value)}
              allowVoice={true}
              hint="Enter self-help group name"
            />
            <Input
              id="location"
              label="District / State (ज़िला और राज्य)"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              allowVoice={true}
              hint="Enter village/city"
            />
          </div>

          <div className="bg-amber-50/50 border border-brand-secondary/20 rounded-xl p-4 flex gap-3">
            <Shield className="w-5 h-5 text-brand-secondary mt-0.5 flex-shrink-0" />
            <div className="text-sm font-medium text-brand-dark opacity-90 leading-relaxed">
              <strong>Data Protection Guarantee:</strong> Your venture figures, product recipes, and cost breakdowns are safely stored locally. We never share raw business data with external brokers or wholesale agents.
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" icon={Save} className="w-full sm:w-auto font-bold py-2.5 px-8">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
