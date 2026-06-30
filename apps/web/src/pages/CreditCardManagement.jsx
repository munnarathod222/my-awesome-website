import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, CreditCard } from 'lucide-react';
import CardModal from '@/components/CardModal.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

const CreditCardManagement = () => {
  const { currentUser } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('credit_cards').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        sort: 'bank_name',
        $autoCancel: false
      });
      setCards(records);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load credit cards');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this card? This will NOT delete associated transactions.')) {
      try {
        await pb.collection('credit_cards').delete(id, { $autoCancel: false });
        toast.success('Card deleted');
        fetchCards();
      } catch (error) {
        toast.error('Failed to delete card');
      }
    }
  };

  const totalLimit = cards.reduce((sum, c) => sum + (c.credit_limit || 0), 0);
  const activeCardsCount = cards.filter(c => c.status === 'Active').length;

  return (
    <>
      <Helmet>
        <title>Card Management - Jai Bhavani Fuel</title>
      </Helmet>
      <Header />
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Credit Cards</h1>
              <p className="text-muted-foreground mt-1">Manage your active fleet cards and view credit limits.</p>
            </div>
            <Button onClick={() => { setEditingCard(null); setIsModalOpen(true); }} className="rounded-xl gap-2">
              <Plus className="w-4 h-4" /> Add Card
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card shadow-sm border-border">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">Total Cards</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold">{cards.length}</h3>
                  <span className="text-sm text-muted-foreground">({activeCardsCount} active)</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm border-border">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">Total Credit Limit</p>
                <h3 className="text-3xl font-bold">₹{totalLimit.toLocaleString('en-IN')}</h3>
              </CardContent>
            </Card>
            <Card className="bg-primary text-primary-foreground shadow-sm border-transparent">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-primary-foreground/80 mb-2">System Status</p>
                <h3 className="text-xl font-bold mb-1">Ready for Billing</h3>
                <p className="text-sm text-primary-foreground/90">All card cycles configured</p>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-48 bg-muted rounded-2xl"></div>)}
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No cards added yet</h3>
              <p className="text-muted-foreground mb-6">Add your first credit or debit card to start tracking.</p>
              <Button onClick={() => { setEditingCard(null); setIsModalOpen(true); }}>Add Card</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map(card => (
                <Card key={card.id} className="relative overflow-hidden group shadow-sm border-border hover:shadow-md transition-shadow">
                  <div className={`absolute top-0 w-full h-1 ${card.status === 'Active' ? 'bg-success' : 'bg-muted-foreground'}`}></div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{card.card_name}</h3>
                        <p className="text-sm text-muted-foreground">{card.bank_name}</p>
                      </div>
                      <Badge variant="outline" className={card.status === 'Active' ? 'bg-status-paid/10 text-status-paid border-status-paid/20' : 'bg-muted text-muted-foreground'}>
                        {card.status}
                      </Badge>
                    </div>

                    <div className="font-mono text-xl tracking-widest mb-6 opacity-80">
                      •••• •••• •••• {card.card_number_last4}
                    </div>

                    <div className="space-y-2 text-sm mb-6">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium">{card.card_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Billing Cycle</span>
                        <span className="font-medium">{card.billing_cycle_start} to {card.billing_cycle_end}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Credit Limit</span>
                        <span className="font-medium">{card.credit_limit ? `₹${card.credit_limit.toLocaleString('en-IN')}` : 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-border">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingCard(card); setIsModalOpen(true); }} className="hover:bg-primary/10 hover:text-primary">
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(card.id)} className="hover:bg-destructive/10 hover:text-destructive text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <CardModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        card={editingCard}
        onSuccess={fetchCards}
      />
    </>
  );
};

export default CreditCardManagement;