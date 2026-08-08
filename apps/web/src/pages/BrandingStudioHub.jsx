import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, UserSquare, CreditCard, Briefcase, FileCheck } from 'lucide-react';
import OfficialLetterheadPage from './OfficialLetterheadPage.jsx';
import IdCardGeneratorPage from './IdCardGeneratorPage.jsx';
import BusinessCardStudioPage from './BusinessCardStudioPage.jsx';
import ChequeWriterPage from './ChequeWriterPage.jsx';

export default function BrandingStudioHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'letterhead';

  const handleTabChange = (val) => {
    setSearchParams({ tab: val });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 md:p-6 font-sans">
      <Helmet>
        <title>Corporate Branding Hub | Jai Bhavani Cargo</title>
        <meta name="description" content="Official Corporate Branding, Letterhead, Employee ID, Business Card, and Cheque Writer Hub for Jai Bhavani Cargo." />
      </Helmet>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Hub Tab Bar with Tan Accents */}
        <div className="no-print bg-slate-900/90 border border-[#d2b48c]/25 p-2.5 px-4 rounded-2xl shadow-xl backdrop-blur-md mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-5 h-5 text-[#d2b48c] shrink-0" />
            <div>
              <h1 className="text-base font-black tracking-tight text-white">
                Corporate Branding Hub
              </h1>
              <p className="text-[10px] text-[#d2b48c]/70 font-semibold tracking-wider uppercase block mt-0.5">
                Jai Bhavani Cargo Ltd
              </p>
            </div>
          </div>
          
          <TabsList className="bg-slate-950 p-1 flex h-auto rounded-xl border border-slate-800/80 gap-1 w-full sm:w-auto overflow-x-auto scrollbar-none">
            <TabsTrigger 
              value="letterhead" 
              className="flex-1 sm:flex-initial gap-1.5 px-4 py-2 rounded-lg text-xs font-black text-slate-400 hover:text-[#d2b48c] hover:bg-[#d2b48c]/10 data-[state=active]:bg-[#d2b48c] data-[state=active]:text-slate-950 transition-all duration-200"
            >
              <FileText className="w-3.5 h-3.5" /> 
              <span>Letterhead</span>
            </TabsTrigger>
            <TabsTrigger 
              value="id-card" 
              className="flex-1 sm:flex-initial gap-1.5 px-4 py-2 rounded-lg text-xs font-black text-slate-400 hover:text-[#d2b48c] hover:bg-[#d2b48c]/10 data-[state=active]:bg-[#d2b48c] data-[state=active]:text-slate-950 transition-all duration-200"
            >
              <UserSquare className="w-3.5 h-3.5" /> 
              <span>ID Card</span>
            </TabsTrigger>
            <TabsTrigger 
              value="business-card" 
              className="flex-1 sm:flex-initial gap-1.5 px-4 py-2 rounded-lg text-xs font-black text-slate-400 hover:text-[#d2b48c] hover:bg-[#d2b48c]/10 data-[state=active]:bg-[#d2b48c] data-[state=active]:text-slate-950 transition-all duration-200"
            >
              <CreditCard className="w-3.5 h-3.5" /> 
              <span>Visiting Card</span>
            </TabsTrigger>
            <TabsTrigger 
              value="cheque-writer" 
              className="flex-1 sm:flex-initial gap-1.5 px-4 py-2 rounded-lg text-xs font-black text-slate-400 hover:text-[#d2b48c] hover:bg-[#d2b48c]/10 data-[state=active]:bg-[#d2b48c] data-[state=active]:text-slate-950 transition-all duration-200"
            >
              <FileCheck className="w-3.5 h-3.5" /> 
              <span>Cheque Writer</span>
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
        <TabsContent value="cheque-writer" className="m-0 focus-visible:outline-none animate-in fade-in duration-300">
          <ChequeWriterPage embedMode={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
