import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, UserSquare, CreditCard, ShieldCheck } from 'lucide-react';
import OfficialLetterheadPage from './OfficialLetterheadPage.jsx';
import IdCardGeneratorPage from './IdCardGeneratorPage.jsx';
import BusinessCardStudioPage from './BusinessCardStudioPage.jsx';

export default function BrandingStudioHub() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab based on pathname
  const getTabFromPathname = (path) => {
    if (path.startsWith('/visiting-card') || path.startsWith('/business-card-studio')) {
      return 'business-card';
    }
    if (path.startsWith('/id-card-generator') || path.startsWith('/id-cards')) {
      return 'id-card';
    }
    return 'letterhead'; // default fallback
  };

  const [activeTab, setActiveTab] = useState(getTabFromPathname(location.pathname));

  // Sync tab state if URL pathname changes externally
  useEffect(() => {
    setActiveTab(getTabFromPathname(location.pathname));
  }, [location.pathname]);

  // Sync URL pathname when tabs change
  const handleTabChange = (val) => {
    setActiveTab(val);
    if (val === 'business-card') {
      navigate('/visiting-card');
    } else if (val === 'id-card') {
      navigate('/id-cards');
    } else {
      navigate('/letterhead');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 md:p-6 font-sans">
      <Helmet>
        <title>Branding &amp; Identity Studio | Jai Bhavani Cargo</title>
        <meta name="description" content="Official Corporate Branding, Letterhead, Employee ID, and Business Card Designer Hub for Jai Bhavani Cargo." />
      </Helmet>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Hub Tab Bar */}
        <div className="no-print bg-slate-900/90 border border-slate-800 p-2.5 px-4 rounded-2xl shadow-xl backdrop-blur-md mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <h1 className="text-base font-black tracking-tight text-white">
              Corporate Branding Hub
            </h1>
          </div>
          
          <TabsList className="bg-slate-950 p-1 flex h-auto rounded-xl border border-slate-800/80 gap-1 w-full sm:w-auto overflow-x-auto scrollbar-none">
            <TabsTrigger value="letterhead" className="flex-1 sm:flex-initial gap-1.5 px-4 py-2 rounded-lg text-xs font-black data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 transition-all">
              <FileText className="w-3.5 h-3.5" /> 
              <span>Letterhead</span>
            </TabsTrigger>
            <TabsTrigger value="id-card" className="flex-1 sm:flex-initial gap-1.5 px-4 py-2 rounded-lg text-xs font-black data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <UserSquare className="w-3.5 h-3.5" /> 
              <span>ID Cards</span>
            </TabsTrigger>
            <TabsTrigger value="business-card" className="flex-1 sm:flex-initial gap-1.5 px-4 py-2 rounded-lg text-xs font-black data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
              <CreditCard className="w-3.5 h-3.5" /> 
              <span>Visiting Card</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="letterhead" className="m-0 focus-visible:outline-none animate-in fade-in duration-300">
          <OfficialLetterheadPage embedMode={true} />
        </TabsContent>
        <TabsContent value="id-card" className="m-0 focus-visible:outline-none animate-in fade-in duration-300">
          <IdCardGeneratorPage embedMode={true} />
        </TabsContent>
        <TabsContent value="business-card" className="m-0 focus-visible:outline-none animate-in fade-in duration-300">
          <BusinessCardStudioPage embedMode={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
