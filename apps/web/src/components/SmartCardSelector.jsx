import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

export default function SmartCardSelector({ amount, cards, onSelectCard, selectedCardId }) {
  const numAmount = parseFloat(amount) || 0;

  const analyzedCards = useMemo(() => {
    if (!cards || cards.length === 0) return [];

    return cards.map(card => {
      const waiverLimit = card.monthly_waiver_limit || 20000;
      const waiverUsed = card.current_month_waiver_used || 0;
      const waiverRemaining = Math.max(0, waiverLimit - waiverUsed);
      
      // Mock available credit if not provided by parent context for this specific component's isolated logic
      const availableCredit = card.availableCredit !== undefined ? card.availableCredit : 50000; 

      let score = 0;
      let status = 'ACTIVE';
      
      if (waiverRemaining >= numAmount && availableCredit >= numAmount) {
        score += 100; // Can handle full amount with waiver
      } else if (waiverRemaining > 0 && availableCredit >= numAmount) {
        score += 50; // Can handle full amount, partial waiver
        status = 'IN PROGRESS';
      } else if (availableCredit >= numAmount) {
        score += 20; // Can handle amount, no waiver
        status = 'IN PROGRESS';
      } else {
        status = 'STOP - CAP HIT';
      }

      // Tie-breaker: more waiver remaining is better
      score += (waiverRemaining / 1000);

      return {
        ...card,
        waiverRemaining,
        availableCredit,
        score,
        status
      };
    }).sort((a, b) => b.score - a.score);
  }, [cards, numAmount]);

  if (analyzedCards.length === 0 || numAmount <= 0) return null;

  const recommended = analyzedCards[0];
  const alternatives = analyzedCards.slice(1, 4);

  return (
    <div className="space-y-4 animate-in fade-in">
      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" /> Smart Recommendations
      </h4>

      {recommended.score > 0 ? (
        <Card 
          className={`cursor-pointer transition-all border-2 ${selectedCardId === recommended.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
          onClick={() => onSelectCard(recommended.id)}
        >
          <CardContent className="p-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-foreground">{recommended.card_name}</span>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px] py-0 h-5">Best Match</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                ₹{recommended.availableCredit.toLocaleString('en-IN')} capacity • ₹{recommended.waiverRemaining.toLocaleString('en-IN')} waiver left
              </p>
            </div>
            {selectedCardId === recommended.id && <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />}
          </CardContent>
        </Card>
      ) : (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>No single card has enough capacity for this amount. Consider splitting the payment.</p>
        </div>
      )}

      {alternatives.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Alternatives</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {alternatives.map(card => (
              <div 
                key={card.id}
                onClick={() => onSelectCard(card.id)}
                className={`p-3 rounded-lg border text-sm cursor-pointer transition-colors ${selectedCardId === card.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/50'}`}
              >
                <div className="font-medium flex justify-between">
                  {card.card_name}
                  {card.status === 'STOP - CAP HIT' && <span className="text-[10px] text-destructive bg-destructive/10 px-1.5 rounded">FULL</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Waiver: ₹{card.waiverRemaining.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}