import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Percent, IndianRupee, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils.js';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import CardLimitWarnings from './CardLimitWarnings.jsx';
import SmartCardSelector from './SmartCardSelector.jsx';

export default function SurchargeCalculator({ className }) {
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [percentage, setPercentage] = useState('1.2');
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState('default');
  
  const [results, setResults] = useState({
    surcharge: 0,
    total: 0,
    status: 'NONE', // NONE, ELIGIBLE, PARTIAL, NOT_ELIGIBLE, EXCEEDS_CAPACITY
    savings: 0,
    message: ''
  });

  useEffect(() => {
    async function fetchCards() {
      if (!currentUser?.id) return;
      try {
        const records = await pb.collection('credit_cards').getFullList({
          filter: `user_id = "${currentUser.id}" && status = "Active"`,
          $autoCancel: false
        });
        // Mock available credit for demonstration if not present
        const enrichedCards = records.map(c => ({...c, availableCredit: c.credit_limit || 50000}));
        setCards(enrichedCards);
        if (enrichedCards.length > 0) setSelectedCardId(enrichedCards[0].id);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCards();
  }, [currentUser?.id]);

  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    const numPercent = parseFloat(percentage) || 0;
    
    const selectedCard = cards.find(c => c.id === selectedCardId);
    const perTxLimit = selectedCard ? (selectedCard.max_waiver_per_transaction || 5000) : 5000;
    const monthlyLimit = selectedCard ? (selectedCard.monthly_waiver_limit || 20000) : 20000;
    const monthlyUsed = selectedCard ? (selectedCard.current_month_waiver_used || 0) : 0;
    const monthlyRemaining = Math.max(0, monthlyLimit - monthlyUsed);
    const availableCapacity = selectedCard ? selectedCard.availableCredit : 50000;
    
    if (numAmount > 0) {
      const surchargeAmt = (numAmount * numPercent) / 100;
      let status = 'NONE';
      let message = '';
      let savings = 0;

      if (numAmount > availableCapacity) {
        status = 'EXCEEDS_CAPACITY';
        message = 'EXCEEDS CARD MONTHLY CAPACITY';
      } else if (numAmount > perTxLimit) {
        status = 'NOT_ELIGIBLE';
        message = 'NOT ELIGIBLE FOR WAIVER (exceeds per-transaction limit)';
      } else if (numAmount <= monthlyRemaining) {
        status = 'ELIGIBLE';
        message = 'ELIGIBLE FOR WAIVER';
        savings = surchargeAmt;
      } else if (monthlyRemaining > 0) {
        status = 'PARTIAL';
        message = 'PARTIAL WAIVER AVAILABLE';
        // Assuming partial waiver applies to the remaining amount
        savings = (monthlyRemaining * numPercent) / 100;
      } else {
        status = 'NOT_ELIGIBLE';
        message = 'NOT ELIGIBLE (Monthly limit reached)';
      }
      
      setResults({
        surcharge: surchargeAmt,
        total: numAmount + surchargeAmt,
        status,
        message,
        savings
      });
    } else {
      setResults({ surcharge: 0, total: 0, status: 'NONE', savings: 0, message: '' });
    }
  }, [amount, percentage, selectedCardId, cards]);

  const selectedCard = cards.find(c => c.id === selectedCardId);

  return (
    <Card className={cn("relative overflow-hidden border-border bg-card shadow-sm transition-all duration-300", className)}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calculator className="w-5 h-5 text-primary" /> Surcharge & Waiver Estimator
        </CardTitle>
        <CardDescription>
          Check if your transaction qualifies for a surcharge waiver based on real-time card limits.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <Label>Transaction Amount</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-9 h-14 text-xl font-semibold bg-background"
                />
              </div>
            </div>

            <SmartCardSelector 
              amount={amount} 
              cards={cards} 
              selectedCardId={selectedCardId} 
              onSelectCard={setSelectedCardId} 
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Selected Card</Label>
                <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                  <SelectTrigger className="bg-background h-11">
                    <SelectValue placeholder="Select Card" />
                  </SelectTrigger>
                  <SelectContent>
                    {cards.length === 0 && <SelectItem value="default">Standard Limits</SelectItem>}
                    {cards.map(c => {
                      const remaining = Math.max(0, (c.monthly_waiver_limit || 20000) - (c.current_month_waiver_used || 0));
                      return (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex justify-between w-full items-center gap-4">
                            <span>{c.card_name}</span>
                            <span className={`text-xs ${remaining < 5000 ? 'text-warning' : 'text-muted-foreground'}`}>
                              ₹{remaining.toLocaleString()} left
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Surcharge Rate (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.1"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    className="pl-9 h-11 bg-background"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Results & Warnings */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-muted/30 rounded-xl p-6 border border-border/50 flex flex-col justify-center space-y-4">
              
              {amount > 0 && results.status !== 'NONE' && (
                <div className="mb-2">
                  {results.status === 'ELIGIBLE' && (
                    <Alert className="bg-success/10 border-success/20 text-success py-2">
                      <ShieldCheck className="h-4 w-4" color="currentColor" />
                      <AlertDescription className="font-medium text-xs ml-2">{results.message}</AlertDescription>
                    </Alert>
                  )}
                  {results.status === 'PARTIAL' && (
                    <Alert className="bg-warning/10 border-warning/20 text-warning py-2">
                      <AlertTriangle className="h-4 w-4" color="currentColor" />
                      <AlertDescription className="font-medium text-xs ml-2">{results.message}</AlertDescription>
                    </Alert>
                  )}
                  {(results.status === 'NOT_ELIGIBLE' || results.status === 'EXCEEDS_CAPACITY') && (
                    <Alert className="bg-destructive/10 border-destructive/20 text-destructive py-2">
                      <ShieldAlert className="h-4 w-4" color="currentColor" />
                      <AlertDescription className="font-medium text-xs ml-2">{results.message}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Base Amount</span>
                <span className="font-semibold tabular-nums">₹{parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Surcharge ({percentage}%)</span>
                <span className="font-semibold tabular-nums text-destructive">+ ₹{results.surcharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              {results.savings > 0 && (
                <div className="flex justify-between items-center text-sm bg-success/10 p-2 rounded-md -mx-2 px-2">
                  <span className="text-success font-medium flex items-center"><ShieldCheck className="w-4 h-4 mr-1"/> Waiver Savings</span>
                  <span className="font-bold tabular-nums text-success">- ₹{results.savings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-end">
                  <span className="font-medium text-foreground">Final Charge</span>
                  <span className="text-3xl font-bold tabular-nums text-foreground tracking-tight">
                    ₹{(results.total - results.savings).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <CardLimitWarnings card={selectedCard} availableCredit={selectedCard?.availableCredit} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}