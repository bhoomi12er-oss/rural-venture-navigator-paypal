import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Star, Smile, Meh, Frown, CheckCircle, ArrowLeft } from 'lucide-react';
import { LanguageToggle } from '../components/shared/LanguageToggle';
import { useLanguage } from '../context/LanguageContext';

export default function CustomerFeedbackForm() {
  const { testId } = useParams();
  const { t } = useLanguage();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [buyAgain, setBuyAgain] = useState(null); // true or false
  const [priceSentiment, setPriceSentiment] = useState(''); // 'reasonable' | 'expensive' | 'cheap'
  const [comments, setComments] = useState('');
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating! / Kripya rating chunein!");
      return;
    }
    if (buyAgain === null) {
      alert("Please select if you would buy again! / Kripya chunein ki kya aap ise dobara kharidenge!");
      return;
    }
    if (!priceSentiment) {
      alert("Please select price sentiment! / Kripya keemat par feedback chunein!");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('rvn_token');
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId: testId, // mapping parameter testId to database product ID
          rating,
          wouldBuyAgain: buyAgain,
          priceReasonable: priceSentiment,
          comment: comments
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        alert(data.message || "Failed to submit feedback / review fail ho gaya");
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert("Failed to connect to review server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex flex-col justify-between py-6 px-4">
      
      {/* Small Header for Language Switch */}
      <header className="flex justify-between items-center max-w-lg mx-auto w-full mb-6">
        <span className="text-sm font-bold text-brand-primary">Customer Review Portal</span>
        <LanguageToggle />
      </header>

      {/* Main Review Form */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
        {!submitted ? (
          <Card 
            title="Millet Almond Cookies Review" 
            subtitle="Please share your honest feedback to help rural women improve their cookies."
            className="w-full border-brand-primary/25 shadow-md"
          >
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              
              {/* 1. Star Rating */}
              <div className="flex flex-col items-center gap-2">
                <span className="font-bold text-brand-dark text-base sm:text-lg">
                  1. How did you like the taste? (स्वाद कैसा लगा?)
                </span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-amber-500 transition-all active:scale-90"
                      aria-label={`Rate ${star} Stars`}
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (hoverRating || rating) ? 'fill-amber-500 text-amber-500' : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <span className="text-xs font-bold text-brand-primary">
                    Selected: {rating} / 5 Stars
                  </span>
                )}
              </div>

              {/* 2. Buy Again Intent */}
              <div className="flex flex-col gap-2.5">
                <span className="font-bold text-brand-dark text-base sm:text-lg text-center">
                  2. Would you buy this product again? (क्या आप इसे दोबारा खरीदेंगे?)
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setBuyAgain(true)}
                    className={`py-3.5 px-4 rounded-xl border-2 font-bold text-base transition-all flex items-center justify-center gap-2 ${
                      buyAgain === true
                        ? 'border-brand-primary bg-brand-primaryLight text-brand-primary shadow-sm'
                        : 'border-brand-neutralGray hover:border-brand-primary/30 text-brand-dark bg-white'
                    }`}
                  >
                    <Smile className="w-5 h-5" />
                    <span>Yes (हाँ)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuyAgain(false)}
                    className={`py-3.5 px-4 rounded-xl border-2 font-bold text-base transition-all flex items-center justify-center gap-2 ${
                      buyAgain === false
                        ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                        : 'border-brand-neutralGray hover:border-red-500/30 text-brand-dark bg-white'
                    }`}
                  >
                    <Frown className="w-5 h-5" />
                    <span>No (नहीं)</span>
                  </button>
                </div>
              </div>

              {/* 3. Price Suitability */}
              <div className="flex flex-col gap-2.5">
                <span className="font-bold text-brand-dark text-base sm:text-lg text-center">
                  3. Is the price (₹35) reasonable? (क्या इसकी कीमत सही है?)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cheap', label: 'Cheap (सस्ता)', en: 'Cheap' },
                    { id: 'reasonable', label: 'Reasonable (सही है)', en: 'Correct' },
                    { id: 'expensive', label: 'Expensive (महंगा)', en: 'Expensive' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriceSentiment(p.id)}
                      className={`py-3 px-1 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all text-center ${
                        priceSentiment === p.id
                          ? 'border-brand-primary bg-brand-primaryLight text-brand-primary shadow-sm'
                          : 'border-brand-neutralGray hover:border-brand-primary/30 text-brand-dark bg-white'
                      }`}
                    >
                      <div>{p.en}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">{p.label.split(' ')[1] || p.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Comments */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="comments" className="font-bold text-brand-dark text-base sm:text-lg">
                  4. Add any suggestions (कोई सुझाव या टिप्पणी लिखें)
                </label>
                <textarea
                  id="comments"
                  rows={2}
                  placeholder="e.g. Taste accha hai, packing me badlaav karein..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full bg-white border border-brand-neutralGray rounded-lg py-3 px-4 text-base focus:border-brand-primary focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 text-lg font-bold"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Review / समीक्षा भेजें'}
              </Button>

            </form>
          </Card>
        ) : (
          <Card className="w-full border-brand-primary text-center py-8">
            <CheckCircle className="w-16 h-16 text-brand-primary mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-brand-dark">Review Submitted!</h2>
            <h3 className="text-xl font-bold text-brand-primary mt-1">समीक्षा सफलतापूर्वक भेजी गई!</h3>
            <p className="text-sm text-brand-dark opacity-75 mt-4 max-w-xs mx-auto">
              Thank you for supporting women entrepreneurs in Chhattisgarh! Your feedback will help improve millet food quality.
            </p>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs font-semibold text-brand-dark opacity-60">
        Rural Venture Navigator Portal • ग्रामीण बाजरा स्वयं सहायता ग्रुप
      </footer>

    </div>
  );
}
