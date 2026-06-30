import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Percent, IndianRupee, SplitSquareHorizontal, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';
import PaymentSplitRecommendationCard from './PaymentSplitRecommendationCard.jsx';
import CardLimitWarnings from './CardLimitWarnings.jsx';
import PlannedPaymentModal from './PlannedPaymentModal.jsx';

export default function PaymentSplitterCalculator({ initialAmount = '', onSuccess }) {
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState(initialAmount);
  const [percentage, setPercentage] = useState('1.2');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState('default');
  const [loading, setLoading] = useState(true);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  useEffect(() => {
    async function fetchCards() {
      if (!currentUser?.id) return;
      try {
        const records = await pb.collection('credit_cards').getFullList({
          filter: `user_id = "${currentUser.id}" && status = "Active"`,
          $autoCancel: false
        });
        const enrichedCards = records.map(c => ({...c, availableCredit: c.credit_limit || 50000}));
        setCards(enrichedCards);
        if (enrichedCards.length > 0) {
          setSelectedCardId(enrichedCards[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch cards for splitter", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCards();
  }, [currentUser?.id]);

  const numAmount = parseFloat(amount) || 0;
  const numPercent = parseFloat(percentage) || 1.2;
  
  const selectedCard = cards.find(c => c.id === selectedCardId);
  const maxWaiverPerTx = selectedCard ? (selectedCard.max_waiver_per_transaction || 5000) : 5000;
  const monthlyWaiverLimit = selectedCard ? (selectedCard.monthly_waiver_limit || 20000) : 20000;
  const monthlyWaiverUsed = selectedCard ? (selectedCard.current_month_waiver_used || 0) : 0;
  const monthlyWaiverRemaining = Math.max(0, monthlyWaiverLimit - monthlyWaiverUsed);
  const availableCapacity = selectedCard ? selectedCard.availableCredit : 50000;
  
  let splits = [];
  let surchargeWithout = 0;
  let surchargeWith = 0;
  let savings = 0;
  let isFullyWaived = false;
  let multiCardSuggestion = null;

  if (numAmount > 0) {
    surchargeWithout = (numAmount * numPercent) / 100;
    
    if (numAmount > availableCapacity) {
      multiCardSuggestion = "Amount exceeds selected card's capacity. Consider using multiple cards.";
    } else {
      const splitLimit = Math.min(maxWaiverPerTx, 4000);
      const numSplits = Math.ceil(numAmount / splitLimit);
      let remaining = numAmount;
      let currentWaiverPool = monthlyWaiverRemaining;
      
      for (let i = 0; i < numSplits; i++) {
        let splitAmt = Math.min(remaining, splitLimit);
        let splitSurcharge = (splitAmt * numPercent) / 100;
        let status = 'NOT ELIGIBLE';
        let splitSavings = 0;

        if (splitAmt >= 500 && splitAmt <= 4000) {
          if (currentWaiverPool >= splitAmt) {
            status = 'ELIGIBLE FOR WAIVER';
            splitSavings = splitSurcharge;
            currentWaiverPool -= splitAmt;
          } else if (currentWaiverPool > 0) {
            status = 'PARTIAL WAIVER';
            splitSavings = (currentWaiverPool * numPercent) / 100;
            currentWaiverPool = 0;
          }
        }

        splits.push({
          amount: splitAmt,
          status,
          savings: splitSavings,
          surcharge: splitSurcharge
        });
        
        surchargeWith += (splitSurcharge - splitSavings);
        remaining -= splitAmt;
      }

      savings = surchargeWithout - surchargeWith;
      isFullyWaived = surchargeWith === 0;
    }
  }

  const handlePlanPaymentsClick = () => {
    if (!paymentDate) {
      toast.error('Please select a payment date first.');
      return;
    }
    setIsPlanModalOpen(true);
  };

  if (loading) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <SplitSquareHorizontal className="w-5 h-5 text-primary" /> Smart Payment Splitter
              </CardTitle>
              <CardDescription>
                Maximize your fuel surcharge waivers by splitting large bills into optimal smaller payments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Total Bill Amount (₹)</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 20000"
                      className="pl-9 h-12 text-lg font-medium bg-background"
                    />
                  </div>
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
                      className="pl-9 h-12 bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select Credit Card</Label>
                  <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                    <SelectTrigger className="h-12 bg-background">
                      <SelectValue placeholder="Select a card" />
                    </SelectTrigger>
                    <SelectContent>
                      {cards.length === 0 && <SelectItem value="default">Default Limit (₹5,000)</SelectItem>}
                      {cards.map(c => {
                        const remaining = Math.max(0, (c.monthly_waiver_limit || 20000) - (c.current_month_waiver_used || 0));
                        return (
                          <SelectItem key={c.id} value={c.id}>
                            <div className="flex justify-between w-full items-center gap-4">
                              <span>{c.card_name}</span>
                              <span className={`text-xs ${remaining < 5000 ? 'text-warning' : 'text-muted-foreground'}`}>
                                ₹{remaining.toLocaleString()} waiver left
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Date</Label>
                  <Input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                    className="h-12 bg-background"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {multiCardSuggestion && (
            <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{multiCardSuggestion}</AlertDescription>
            </Alert>
          )}

          {numAmount > 0 && splits.length > 0 && !multiCardSuggestion && (
            <div className="space-y-4">
              <PaymentSplitRecommendationCard
                originalAmount={numAmount}
                splits={splits.map(s => s.amount)}
                detailedSplits={splits}
                surchargeWithout={surchargeWithout}
                surchargeWith={surchargeWith}
                savings={savings}
                isFullyWaived={isFullyWaived}
                onPlanComplete={() => setAmount('')}
              />
              <Button onClick={handlePlanPaymentsClick} className="w-full rounded-xl shadow-sm text-base h-12" size="lg">
                Plan {splits.length} Payments on {format(new Date(paymentDate), 'MMM dd, yyyy')}
              </Button>
            </div>
          )}
          
          {numAmount === 0 && (
            <div className="text-center p-12 border border-dashed border-border rounded-xl text-muted-foreground bg-muted/10">
              <SplitSquareHorizontal className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium text-foreground">Enter a bill amount to see split recommendations.</p>
              <p className="text-sm mt-1">Example: A ₹20,000 bill with a ₹5,000 limit splits into 4 payments, saving ₹240.</p>
            </div>
          )}
        </div>

        <div>
          <Card className="border-border shadow-sm sticky top-4">
            <CardContent className="p-6">
              <CardLimitWarnings card={selectedCard} availableCredit={availableCapacity} />
            </CardContent>
          </Card>
        </div>
      </div>

      <PlannedPaymentModal 
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        splits={splits}
        selectedDate={paymentDate}
        selectedCardId={selectedCardId}
        onSuccess={() => {
          setIsPlanModalOpen(false);
          if (onSuccess) onSuccess();
        }}
      />
    </div>
  );
}