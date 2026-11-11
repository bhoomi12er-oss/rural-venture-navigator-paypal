import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { QrCode, Download, Eye, Play, CheckCircle } from 'lucide-react';

export default function DemandTest() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [location, setLocation] = useState('Mandi Bazar Stall 1');
  const [targetCount, setTargetCount] = useState('20');
  const [testCreated, setTestCreated] = useState(false);

  // Mock test ID for the QR URL
  const mockTestId = 'test-456';
  const feedbackUrl = `${window.location.origin}/feedback/${mockTestId}`;

  const handleCreate = (e) => {
    e.preventDefault();
    setTestCreated(true);
  };

  const handleViewForm = () => {
    navigate(`/feedback/${mockTestId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark m-0">{t('demandTest')}</h1>
        <p className="text-brand-dark opacity-70 mt-1 font-medium">
          Generate packaging QR codes to ask customers about taste, packaging quality, and repeat purchases.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Creation Config Card */}
        <div className="md:col-span-1">
          <Card title="Start QR Campaign" subtitle="Define where you are testing your product.">
            <form onSubmit={handleCreate} className="space-y-6 mt-4">
              <Input
                id="location"
                label="Campaign Location (परीक्षण स्थान)"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                allowVoice={true}
                required
                hint="Mela stall, weekly market, village shop?"
              />

              <Input
                id="targetCount"
                label="Target Feedback (समीक्षाओं का लक्ष्य)"
                type="number"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
                allowVoice={true}
                required
                hint="How many review signals to collect?"
              />

              {!testCreated ? (
                <Button type="submit" variant="primary" icon={Play} className="w-full font-bold">
                  Generate Packaging QR
                </Button>
              ) : (
                <Alert variant="success" title="QR Code Active">
                  QR test generated for <strong>{location}</strong>. Click packaging QR card to check feedback page.
                </Alert>
              )}
            </form>
          </Card>
        </div>

        {/* QR Code Presentation Card */}
        <div className="md:col-span-2">
          <Card
            title="Product Packaging QR Card"
            subtitle="Print and paste this on your cookie packets or snack boxes."
            headerActions={
              testCreated && (
                <Button variant="outline" size="sm" icon={Download} onClick={() => alert("QR code image downloaded (Simulated)")}>
                  Download Card
                </Button>
              )
            }
          >
            {testCreated ? (
              <div className="flex flex-col md:flex-row items-center gap-8 justify-center py-6">
                
                {/* Visual Packaging QR Mockup */}
                <div 
                  onClick={handleViewForm} 
                  className="bg-brand-secondaryLight border-2 border-dashed border-brand-primary p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:scale-105 transition-all duration-200 shadow-md max-w-xs"
                  title="Click to preview the feedback page"
                >
                  <span className="text-xs uppercase tracking-widest font-extrabold text-brand-primary bg-white px-2.5 py-1 rounded-full mb-3 shadow-sm border border-brand-primary/10">
                    Scan & Rate Us
                  </span>
                  
                  {/* Mock QR Drawing with SVGs */}
                  <div className="bg-white p-4 rounded-xl shadow-inner mb-3 border border-brand-neutralGray">
                    <svg className="w-36 h-36 text-brand-primary" viewBox="0 0 100 100">
                      {/* Outer Position Detectors */}
                      <rect x="5" y="5" width="25" height="25" fill="currentColor" />
                      <rect x="9" y="9" width="17" height="17" fill="white" />
                      <rect x="13" y="13" width="9" height="9" fill="currentColor" />

                      <rect x="70" y="5" width="25" height="25" fill="currentColor" />
                      <rect x="74" y="9" width="17" height="17" fill="white" />
                      <rect x="78" y="13" width="9" height="9" fill="currentColor" />

                      <rect x="5" y="70" width="25" height="25" fill="currentColor" />
                      <rect x="9" y="74" width="17" height="17" fill="white" />
                      <rect x="13" y="78" width="9" height="9" fill="currentColor" />

                      {/* Random pixels */}
                      <rect x="40" y="10" width="8" height="8" fill="currentColor" />
                      <rect x="55" y="20" width="6" height="6" fill="currentColor" />
                      <rect x="45" y="35" width="10" height="10" fill="currentColor" />
                      <rect x="15" y="45" width="8" height="8" fill="currentColor" />
                      <rect x="35" y="60" width="12" height="12" fill="currentColor" />
                      <rect x="65" y="45" width="15" height="15" fill="currentColor" />
                      <rect x="80" y="70" width="15" height="15" fill="currentColor" />
                      <rect x="50" y="80" width="10" height="10" fill="currentColor" />
                    </svg>
                  </div>
                  
                  <span className="font-extrabold text-sm text-brand-dark">Millet Almond Cookies</span>
                  <span className="text-xs font-semibold text-brand-dark opacity-65 mt-0.5">ग्रामीण उद्यम मार्गदर्शक</span>
                </div>

                <div className="flex-1 space-y-4 max-w-sm">
                  <h4 className="text-lg font-bold text-brand-dark">How to use this QR:</h4>
                  <ul className="list-disc pl-5 text-sm font-semibold space-y-2 text-brand-dark opacity-80">
                    <li>Print this QR card on sticky labels.</li>
                    <li>Paste it onto the back of your cookie boxes.</li>
                    <li>When clients buy your cookies, ask them to scan the QR code with their mobile cameras.</li>
                    <li>Reviews appear instantly in your Feedback Dashboard!</li>
                  </ul>
                  <div className="pt-2">
                    <Button variant="light" size="sm" icon={Eye} onClick={handleViewForm} className="w-full">
                      Test Feedback Page
                    </Button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-brand-dark opacity-50">
                <QrCode className="w-20 h-20 mb-3" />
                <p className="font-bold text-lg">No campaign created yet</p>
                <p className="text-sm max-w-xs">Fill in your test location and click "Generate" to generate a printable packaging feedback card.</p>
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
