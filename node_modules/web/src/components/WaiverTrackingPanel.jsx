import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, ShieldCheck, CreditCard } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function WaiverTrackingPanel() {
  const { currentUser } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCards() {
      if (!currentUser?.id) return;
      try {
        const records = await pb.collection('credit_cards').getFullList({
          filter: `user_id = "${currentUser.id}" && status = "Active"`,
          $autoCancel: false
        });
        setCards(records);
      } catch (err) {
        console.error("Failed to fetch cards for waiver tracking", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCards();
  }, [currentUser?.id]);

  if (loading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  if (cards.length === 0) {
    return null;
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-4 border-b border-border/50">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" /> Monthly Waiver Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {cards.map(card => {
          const limit = card.monthly_waiver_limit || 20000;
          const used = card.current_month_waiver_used || 0;
          const available = Math.max(limit - used, 0);
          const percentUsed = Math.min((used / limit) * 100, 100);
          const isWarning = percentUsed >= 80;
          const isDanger = percentUsed >= 100;

          let progressClass = "[&>div]:bg-primary";
          if (isDanger) progressClass = "[&>div]:bg-destructive";
          else if (isWarning) progressClass = "[&>div]:bg-warning";

          return (
            <div key={card.id} className="space-y-3 p-4 rounded-xl border border-border bg-muted/10 transition-colors hover:bg-muted/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 font-medium">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  {card.card_name}
                  {isWarning && !isDanger && (
                    <span className="flex items-center text-xs text-warning ml-2 bg-warning/10 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3 mr-1" /> Approaching Limit
                    </span>
                  )}
                  {isDanger && (
                    <span className="flex items-center text-xs text-destructive ml-2 bg-destructive/10 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3 mr-1" /> Limit Exceeded
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold">
                  {percentUsed.toFixed(0)}% Used
                </div>
              </div>
              
              <Progress value={percentUsed} className={`h-2.5 ${progressClass} bg-muted`} />
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Used: ₹{used.toLocaleString('en-IN')}</span>
                <span className="text-muted-foreground">Available: <span className={isDanger ? 'text-destructive font-semibold' : 'text-success font-semibold'}>₹{available.toLocaleString('en-IN')}</span></span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}