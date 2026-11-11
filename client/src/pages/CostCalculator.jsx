import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Landmark, Calculator, Info, HelpCircle } from 'lucide-react';

export default function CostCalculator() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Load temp onboarding data if exists
  const tempVenture = JSON.parse(localStorage.getItem('rvn_temp_venture') || '{}');

  // Input states (per-unit variable costs in INR)
  const [rawMaterials, setRawMaterials] = useState('10');
  const [labor, setLabor] = useState('3');
  const [packaging, setPackaging] = useState('2');
  const [transport, setTransport] = useState('1');
  const [spoilage, setSpoilage] = useState('1');
  const [commission, setCommission] = useState('2');
  
  // Monthly Fixed Costs
  const [fixedCosts, setFixedCosts] = useState('500'); // Rent, gas, electricity, etc.
  
  // Pricing states
  const [sellingPrice, setSellingPrice] = useState('35');
  const [monthlyTarget, setMonthlyTarget] = useState('200');

  // Calculations states
  const [metrics, setMetrics] = useState({
    unitCost: 0,
    contributionMargin: 0,
    marginPercentage: 0,
    monthlyRevenue: 0,
    monthlyProfit: 0,
    breakEvenUnits: 0,
    breakEvenRevenue: 0,
    isViable: false
  });

  // Calculate whenever inputs change
  useEffect(() => {
    const rawVal = parseFloat(rawMaterials) || 0;
    const laborVal = parseFloat(labor) || 0;
    const packVal = parseFloat(packaging) || 0;
    const transVal = parseFloat(transport) || 0;
    const spoilVal = parseFloat(spoilage) || 0;
    const commVal = parseFloat(commission) || 0;
    const fixedVal = parseFloat(fixedCosts) || 0;
    const priceVal = parseFloat(sellingPrice) || 0;
    const targetVal = parseFloat(monthlyTarget) || 0;

    // Unit Variable Cost
    const unitCost = rawVal + laborVal + packVal + transVal + spoilVal + commVal;
    
    // Profit per unit (Contribution)
    const contributionMargin = priceVal - unitCost;
    
    // Margin Percentage
    const marginPercentage = priceVal > 0 ? (contributionMargin / priceVal) * 100 : 0;
    
    // Projected monthly economics
    const monthlyRevenue = priceVal * targetVal;
    const monthlyProfit = (contributionMargin * targetVal) - fixedVal;
    
    // Break-even Units = Monthly Fixed Costs / Contribution Margin
    const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixedVal / contributionMargin) : 0;
    const breakEvenRevenue = breakEvenUnits * priceVal;

    const isViable = contributionMargin > 0 && monthlyProfit > 0;

    setMetrics({
      unitCost: parseFloat(unitCost.toFixed(2)),
      contributionMargin: parseFloat(contributionMargin.toFixed(2)),
      marginPercentage: parseFloat(marginPercentage.toFixed(1)),
      monthlyRevenue: Math.round(monthlyRevenue),
      monthlyProfit: Math.round(monthlyProfit),
      breakEvenUnits,
      breakEvenRevenue: Math.round(breakEvenRevenue),
      isViable
    });
  }, [rawMaterials, labor, packaging, transport, spoilage, commission, fixedCosts, sellingPrice, monthlyTarget]);

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Cache calculation outputs in local storage for decision engine in next phases
    const finalCalculationData = {
      inputs: {
        rawMaterials: parseFloat(rawMaterials),
        labor: parseFloat(labor),
        packaging: parseFloat(packaging),
        transport: parseFloat(transport),
        spoilage: parseFloat(spoilage),
        commission: parseFloat(commission),
        fixedCosts: parseFloat(fixedCosts),
        sellingPrice: parseFloat(sellingPrice),
        monthlyTarget: parseFloat(monthlyTarget)
      },
      metrics
    };
    
    localStorage.setItem('rvn_calculations', JSON.stringify(finalCalculationData));

    // Save to real backend DB
    const token = localStorage.getItem('rvn_token');
    if (token) {
      try {
        // Save entrepreneur profile
        await fetch('http://localhost:5000/api/entrepreneur/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            businessName: `${tempVenture.productName || 'Millet'} Venture`,
            category: tempVenture.category || 'cookies',
            description: tempVenture.description || 'Rural millet product entrepreneur',
            productionCapacity: Number(monthlyTarget) || 200,
            targetCustomers: tempVenture.targetCustomer || 'Local consumers',
            location: 'Chhattisgarh',
            languagePreference: localStorage.getItem('rvn_lang') === 'hi' ? 'hi' : 'en'
          })
        });

        // Save initial product
        await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            productName: tempVenture.productName || 'Millet Cookies',
            description: tempVenture.description || 'Healthy organic handmade millet treats.',
            category: tempVenture.category || 'cookies',
            price: Number(sellingPrice) || 35,
            ingredients: 'Millet flour, organic jaggery, pure cow ghee',
            availableQuantity: Number(monthlyTarget) || 100
          })
        });
      } catch (err) {
        console.error('Error syncing profile and product details to backend:', err);
      }
    }
    
    navigate('/demand-test');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark m-0">{t('calculatorTitle')}</h1>
        <p className="text-brand-dark opacity-70 mt-1 font-medium">{t('calculatorSubtitle')}</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="1. Product Costs (उत्पाद बनाने की लागत)" subtitle="Enter how much you spend to make ONE single packet of cookies/food.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              
              <Input
                id="rawMaterials"
                label={t('rawMaterials')}
                type="number"
                value={rawMaterials}
                onChange={(e) => setRawMaterials(e.target.value)}
                allowVoice={true}
                required
                hint={t('rawMaterialsHint')}
              />

              <Input
                id="labor"
                label={t('labor')}
                type="number"
                value={labor}
                onChange={(e) => setLabor(e.target.value)}
                allowVoice={true}
                required
                hint={t('laborHint')}
              />

              <Input
                id="packaging"
                label={t('packaging')}
                type="number"
                value={packaging}
                onChange={(e) => setPackaging(e.target.value)}
                allowVoice={true}
                required
                hint={t('packagingHint')}
              />

              <Input
                id="transport"
                label={t('transport')}
                type="number"
                value={transport}
                onChange={(e) => setTransport(e.target.value)}
                allowVoice={true}
                required
                hint={t('transportHint')}
              />

              <Input
                id="spoilage"
                label={t('spoilage')}
                type="number"
                value={spoilage}
                onChange={(e) => setSpoilage(e.target.value)}
                allowVoice={true}
                required
                hint={t('spoilageHint')}
              />

              <Input
                id="commission"
                label={t('commission')}
                type="number"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                allowVoice={true}
                required
                hint={t('commissionHint')}
              />

            </div>
          </Card>

          <Card title="2. Monthly Setup & Sales Targets (मासिक निश्चित लागत और लक्ष्य)" subtitle="Expenses that happen every month once, and packets you plan to sell.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              
              <Input
                id="fixedCosts"
                label="Monthly Overhead (महीने का कुल किराया/गैस)"
                type="number"
                value={fixedCosts}
                onChange={(e) => setFixedCosts(e.target.value)}
                allowVoice={true}
                required
                hint="Dukaan ka rent, gas cylinder, ya light bill?"
              />

              <Input
                id="sellingPrice"
                label={t('sellingPrice')}
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                allowVoice={true}
                required
                hint={t('sellingPriceHint')}
              />

              <Input
                id="monthlyTarget"
                label={t('monthlyTarget')}
                type="number"
                value={monthlyTarget}
                onChange={(e) => setMonthlyTarget(e.target.value)}
                allowVoice={true}
                required
                hint={t('monthlyTargetHint')}
              />

            </div>
          </Card>
        </div>

        {/* Right Column: Dynamic Output summary */}
        <div className="space-y-6">
          <Card className="sticky top-20 border-brand-primary/30 shadow-md bg-brand-primaryLight/20">
            <h3 className="text-xl font-bold text-brand-primary border-b border-brand-neutralGray pb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              {t('resultsTitle')}
            </h3>

            <div className="space-y-4 py-4">
              
              <div>
                <span className="text-xs uppercase tracking-wider font-extrabold text-brand-dark opacity-60">
                  {t('costPerUnit')}
                </span>
                <p className="text-3xl font-extrabold text-brand-dark mt-0.5">
                  ₹{metrics.unitCost}
                </p>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider font-extrabold text-brand-dark opacity-60">
                  {t('marginPerUnit')} (Profit)
                </span>
                <p className={`text-3xl font-extrabold mt-0.5 ${metrics.contributionMargin > 0 ? 'text-brand-primary' : 'text-red-600'}`}>
                  ₹{metrics.contributionMargin}
                  <span className="text-sm font-semibold ml-2">({metrics.marginPercentage}%)</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-brand-neutralGray">
                <div>
                  <span className="text-xs font-semibold text-brand-dark opacity-75">
                    {t('monthlyRevenue')}
                  </span>
                  <p className="text-lg font-bold text-brand-dark mt-0.5">
                    ₹{metrics.monthlyRevenue}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-brand-dark opacity-75">
                    {t('monthlyProfit')}
                  </span>
                  <p className={`text-lg font-bold mt-0.5 ${metrics.monthlyProfit > 0 ? 'text-brand-primary' : 'text-red-650'}`}>
                    ₹{metrics.monthlyProfit}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-brand-neutralGray">
                <span className="text-xs uppercase tracking-wider font-extrabold text-brand-secondary">
                  {t('breakEven')}
                </span>
                <p className="text-lg font-extrabold text-brand-dark mt-0.5">
                  {metrics.breakEvenUnits} Packets
                </p>
                <p className="text-xs text-brand-dark opacity-75 italic mt-1">
                  {t('breakEvenDesc', { units: metrics.breakEvenUnits })}
                </p>
              </div>

            </div>

            <div className="space-y-4">
              {metrics.contributionMargin <= 0 ? (
                <Alert variant="error" title={t('statusUnhealthy')}>
                  Selling price ₹{sellingPrice} is lower than production cost ₹{metrics.unitCost}. You lose money on every unit!
                </Alert>
              ) : metrics.monthlyProfit <= 0 ? (
                <Alert variant="warning" title="Target Too Low">
                  Margin is positive, but sales target does not cover the fixed overhead of ₹{fixedCosts}. Sell more packets.
                </Alert>
              ) : (
                <Alert variant="success" title={t('statusHealthy')}>
                  Venture generates positive monthly margins! Proceed to start a buyer feedback QR campaign.
                </Alert>
              )}

              <Button
                type="submit"
                variant="primary"
                icon={ArrowRight}
                className="w-full font-bold py-3 mt-2"
                disabled={metrics.contributionMargin <= 0}
              >
                Proceed to Demand Test
              </Button>
            </div>

          </Card>
        </div>

      </form>
    </div>
  );
}
