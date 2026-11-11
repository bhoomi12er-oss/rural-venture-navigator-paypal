import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useLanguage } from '../context/LanguageContext';
import { Printer, CheckSquare, ListTodo, Download, Sparkles, HelpCircle } from 'lucide-react';

export default function DecisionCard() {
  const { t } = useLanguage();

  // Current mock decision values
  const currentDecision = "PILOT";

  // Action plan states
  const [tasks, setTasks] = useState([
    { id: 1, week: 1, text: "Buy initial raw materials for 50 packets of Millet Almond Cookies", done: true },
    { id: 2, week: 1, text: "Print 50 copies of your Product QR Code label", done: true },
    { id: 3, week: 2, text: "Set up a table at the local weekly Mandi Bazaar and distribute 20 pilot packs", done: false },
    { id: 4, week: 2, text: "Ask every buyer to scan the packaging QR code and leave a review", done: false },
    { id: 5, week: 3, text: "Check your Customer Feedback Dashboard in Rural Venture Navigator", done: false },
    { id: 6, week: 3, text: "If price feedback is 'Reasonable' and rating is >4.5, talk to 2 local grocery stores", done: false },
    { id: 7, week: 4, text: "Calculate true transportation and agent commissions for shop delivery", done: false },
    { id: 8, week: 4, text: "Review the decision model again to scale production from 50 to 200 packets", done: false },
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const getDecisionExplanation = (decision) => {
    switch (decision) {
      case 'PILOT':
        return {
          title: "Launch a Local Pilot Project (लोकल स्तर पर छोटा परीक्षण करें)",
          desc: "Your unit economics are solid (₹17 profit per unit) and initial customer ratings are excellent (4.6/5 stars). However, 14 reviews is a small sample size. Before spending heavy capital, test sell 50-100 packets in a single market location to verify demand.",
          badge: "bg-blue-100 text-blue-800 border-blue-300"
        };
      default:
        return {
          title: "Launch a Pilot Project",
          desc: "Launch pilot.",
          badge: "bg-stone-100 text-stone-800 border-stone-300"
        };
    }
  };

  const explanation = getDecisionExplanation(currentDecision);

  return (
    <div className="space-y-6">
      
      {/* Header with Print/PDF controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark m-0">Venture Decision & Action Plan</h1>
          <p className="text-brand-dark opacity-75 mt-1 font-medium">
            Your single, defensible business decision and structured 30-day timeline.
          </p>
        </div>
        <Button variant="outline" icon={Printer} size="sm" onClick={() => window.print()}>
          Print Report / PDF
        </Button>
      </div>

      {/* Decision Engine Alert Card */}
      <Card title={t('decisionEngine')} subtitle="Rule-Based Decision Engine + GenAI Interpretation">
        <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
          <div className={`px-8 py-6 rounded-2xl border-4 text-center ${explanation.badge}`}>
            <span className="text-xs uppercase tracking-wider font-extrabold">Final Decision</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold mt-1 m-0">{currentDecision}</h2>
          </div>
          <div className="flex-1 space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-brand-dark">{explanation.title}</h3>
            <p className="text-brand-dark opacity-85 leading-relaxed text-sm sm:text-base font-semibold">
              {explanation.desc}
            </p>
          </div>
        </div>
      </Card>

      {/* Rural Venture Decision Card (Fact, Assumption, Calculation Model) */}
      <Card title="Rural Venture Decision Card" subtitle="Evidence Model breaking down verified vs estimated elements.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 text-sm font-sans">
          
          {/* Column 1: FACTS & CALCULATIONS */}
          <div className="space-y-4">
            
            {/* Facts */}
            <div className="bg-emerald-50/50 border border-emerald-250 rounded-xl p-4">
              <span className="px-2.5 py-1 bg-brand-primary text-white text-xs font-bold rounded-md uppercase tracking-wider">
                Fact (सत्य तथ्य)
              </span>
              <ul className="list-disc pl-5 mt-3 space-y-1.5 font-semibold text-brand-dark opacity-90">
                <li>Selling Price: <strong>₹35 per unit</strong></li>
                <li>Product Category: <strong>Millet Cookies</strong></li>
                <li>Total Reviews: <strong>14 reviews</strong></li>
                <li>Average Rating: <strong>4.6 stars</strong></li>
              </ul>
            </div>

            {/* Calculations */}
            <div className="bg-blue-50/50 border border-blue-250 rounded-xl p-4">
              <span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-md uppercase tracking-wider">
                Calculation (गणित)
              </span>
              <ul className="list-disc pl-5 mt-3 space-y-1.5 font-semibold text-brand-dark opacity-90">
                <li>Total Variable Cost: <strong>₹18 per unit</strong></li>
                <li>Profit Margin: <strong>₹17 per unit (48.5%)</strong></li>
                <li>Break-even Target: <strong>30 units / month</strong></li>
                <li>Projected Profit: <strong>₹2,900 / month</strong> (Target: 200)</li>
              </ul>
            </div>

          </div>

          {/* Column 2: ASSUMPTIONS & UNKNOWNS */}
          <div className="space-y-4">
            
            {/* Assumptions */}
            <div className="bg-amber-50/50 border border-amber-250 rounded-xl p-4">
              <span className="px-2.5 py-1 bg-brand-secondary text-brand-dark text-xs font-bold rounded-md uppercase tracking-wider">
                Assumption (अनुमानित मूल्य)
              </span>
              <ul className="list-disc pl-5 mt-3 space-y-1.5 font-semibold text-brand-dark opacity-90">
                <li>Target Sales Volume: <strong>200 units / month</strong></li>
                <li>Overhead Expenses: <strong>₹500 / month</strong></li>
                <li>Spoilage Rate: <strong>3% per batch</strong></li>
                <li>Customer Segmentation: <strong>Health conscious local families</strong></li>
              </ul>
            </div>

            {/* Unknowns */}
            <div className="bg-red-50/50 border border-red-200 rounded-xl p-4">
              <span className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-md uppercase tracking-wider">
                Unknown / Missing Evidence (अज्ञात जानकारी)
              </span>
              <ul className="list-disc pl-5 mt-3 space-y-1.5 font-semibold text-brand-dark opacity-90">
                <li>FSSAI/Food License Fees: <strong className="text-red-650">Unknown / Evidence required</strong></li>
                <li>Wholesale Agent Commissions: <strong className="text-red-650">Unknown / Evidence required</strong></li>
                <li>Shelf Life (Spoilage after 30 days): <strong className="text-red-650">Unknown</strong></li>
              </ul>
            </div>

          </div>

        </div>
      </Card>

      {/* 30-Day Action Plan */}
      <Card title={t('planTitle')} subtitle="Complete your weekly checkpoints. Check items to update your timeline.">
        <div className="space-y-4 mt-4 font-sans">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Week 1 & 2 */}
            <div className="md:col-span-2 space-y-3 border-r border-brand-neutralGray pr-4">
              <h4 className="font-extrabold text-brand-primary text-base border-b border-brand-primary/10 pb-2">
                Weeks 1 & 2: Launch & Test
              </h4>
              {tasks.filter(t => t.week === 1 || t.week === 2).map(task => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                    task.done 
                      ? 'bg-emerald-50/40 border-emerald-200 text-emerald-800 line-through opacity-70' 
                      : 'bg-white border-brand-neutralGray hover:border-brand-primary/40 text-brand-dark'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => {}} // toggled on container click
                    className="mt-1 rounded border-brand-neutralGray text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm font-semibold leading-snug">{task.text}</span>
                </div>
              ))}
            </div>

            {/* Week 3 & 4 */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="font-extrabold text-brand-primary text-base border-b border-brand-primary/10 pb-2">
                Weeks 3 & 4: Review & Scale
              </h4>
              {tasks.filter(t => t.week === 3 || t.week === 4).map(task => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                    task.done 
                      ? 'bg-emerald-50/40 border-emerald-200 text-emerald-800 line-through opacity-70' 
                      : 'bg-white border-brand-neutralGray hover:border-brand-primary/40 text-brand-dark'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => {}}
                    className="mt-1 rounded border-brand-neutralGray text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm font-semibold leading-snug">{task.text}</span>
                </div>
              ))}
            </div>

          </div>

          <div className="bg-brand-primaryLight/50 border border-brand-primary/10 rounded-xl p-4 flex gap-3 mt-6">
            <Sparkles className="w-5 h-5 text-brand-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm font-medium leading-relaxed text-brand-dark opacity-90">
              <strong>GenAI Assistance:</strong> Our model analyzes the checked tasks daily. Once you check the weekly pilot sales tasks, the decision rules automatically re-evaluate your target markets to check if you can progress to a full <strong>PROCEED</strong> state.
            </div>
          </div>

        </div>
      </Card>

    </div>
  );
}
