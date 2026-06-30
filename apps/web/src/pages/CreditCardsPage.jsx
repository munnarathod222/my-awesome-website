import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Camera, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreditCardBillPaymentTracker from '@/components/CreditCardBillPaymentTracker.jsx';
import CardModal from '@/components/CardModal.jsx';
import BusinessCardUploadModalCards from '@/components/BusinessCardUploadModalCards.jsx';
import { motion } from 'framer-motion';

const CreditCardsPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8"
    >
      <Helmet>
        <title>Credit Cards & Bills | Dashboard</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <CreditCard className="w-7 h-7 text-primary" />
            </div>
            Corporate Cards
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-balance">
            Manage company credit cards, track fuel balances, monitor statement cycles, and record payments securely.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <Button variant="secondary" onClick={() => setIsAiModalOpen(true)} className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl shadow-sm">
            <Camera className="w-4 h-4 mr-2" /> AI Scan
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="shadow-sm rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add New Card
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border/50 shadow-soft overflow-hidden">
        <CreditCardBillPaymentTracker 
          refreshTrigger={refreshTrigger} 
          onRefresh={handleRefresh} 
        />
      </div>

      <CardModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        card={null}
        onSuccess={handleRefresh}
      />

      <BusinessCardUploadModalCards
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSuccess={handleRefresh}
      />
    </motion.div>
  );
};

export default CreditCardsPage;