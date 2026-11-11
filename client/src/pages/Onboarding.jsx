import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Onboarding() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('cookies');
  const [description, setDescription] = useState('');
  const [targetCustomer, setTargetCustomer] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Cache onboarding data in localStorage for mock calculations
    const ventureData = {
      productName: productName || 'Millet Cookies',
      category,
      description,
      targetCustomer,
    };
    localStorage.setItem('rvn_temp_venture', JSON.stringify(ventureData));
    navigate('/calculator');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-widest font-extrabold text-brand-primary bg-brand-primaryLight px-3 py-1.5 rounded-full border border-brand-primary/20">
          Step 1 of 3: Venture Setup
        </span>
        <h1 className="text-3xl font-extrabold text-brand-dark mt-4 mb-2">
          Tell Us About Your Millet Product
        </h1>
        <p className="text-brand-dark opacity-75 max-w-md mx-auto">
          Apne millet product ke baare mein batayein. Hum isse aapke pure business decision ke liye istemal karenge.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <Input
            id="productName"
            label="Product Name (उत्पाद का नाम)"
            type="text"
            placeholder="e.g. Ragi Chocolate Almond Cookies"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            allowVoice={true}
            hint="Millet cookies, snacks, or flour name"
          />

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-brand-dark text-base sm:text-lg">
              Product Category (उत्पाद की श्रेणी)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'cookies', label: 'Cookies (बिस्कुट)', en: 'Cookies' },
                { id: 'snacks', label: 'Snacks (नमकीन)', en: 'Snacks' },
                { id: 'flour', label: 'Flour (आटा)', en: 'Flour/Mixes' },
                { id: 'other', label: 'Other (अन्य)', en: 'Other Packaged' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`py-3.5 px-2 text-center rounded-xl border-2 font-bold text-sm transition-all ${
                    category === cat.id
                      ? 'border-brand-primary bg-brand-primaryLight text-brand-primary shadow-sm'
                      : 'border-brand-neutralGray hover:border-brand-primary/30 text-brand-dark bg-white'
                  }`}
                >
                  <div className="font-bold">{cat.en}</div>
                  <div className="text-xs opacity-75 mt-0.5">{cat.label.split(' ')[1] || cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-end">
              <label htmlFor="description" className="font-semibold text-brand-dark text-base sm:text-lg">
                Describe Your Product (उत्पाद के बारे में बताएं)
              </label>
              <span className="text-xs sm:text-sm text-brand-secondary font-medium italic">
                Voice enabled / Bolkar likhein
              </span>
            </div>
            <textarea
              id="description"
              rows={3}
              placeholder="e.g. Hum ragi aur jowar ko milakar healthy cookies banate hain. Isme hum shakkar ki jagah gud ka istemal karte hain."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-brand-neutralGray rounded-lg py-3 px-4 text-base focus:border-brand-primary focus:outline-none"
            />
          </div>

          <Input
            id="targetCustomer"
            label="Who will buy this? (इसे कौन खरीदेगा?)"
            type="text"
            placeholder="e.g. School children, gym goers, health conscious elders"
            value={targetCustomer}
            onChange={(e) => setTargetCustomer(e.target.value)}
            allowVoice={true}
            hint="Target market segments suggestion"
          />

          <div className="bg-brand-primaryLight/50 border border-brand-primary/10 rounded-xl p-4 flex gap-3 items-start">
            <Sparkles className="w-5 h-5 text-brand-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm font-medium leading-relaxed text-brand-dark opacity-90">
              <strong>GenAI Insights Indicator:</strong> In the next steps, our AI will automatically suggest the most profitable sales channels and customer segments based on the details you entered above.
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" icon={ArrowRight} className="w-full sm:w-auto font-bold py-3 px-8">
              Proceed to Cost Calculator
            </Button>
          </div>

        </form>
      </Card>
    </div>
  );
}
