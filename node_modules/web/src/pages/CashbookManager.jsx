import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { Plus, Wallet, Pencil, Trash2, ArrowRight } from 'lucide-react';
import CashbookForm from '@/components/CashbookForm.jsx';

const CashbookManager = () => {
  const navigate = useNavigate();
  const [cashbooks, setCashbooks] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [cashbookToEdit, setCashbookToEdit] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch cashbooks
      const cbList = await pb.collection('cashbooks').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setCashbooks(cbList);

      // 2. Fetch all transactions to compute current balances
      // In a very large app, this should be done via a custom API endpoint.
      const txns = await pb.collection('cashbook_transactions').getFullList({
        $autoCancel: false,
        fields: 'cashbook_id,transaction_type,amount'
      });

      const balanceMap = {};
      cbList.forEach(cb => {
        balanceMap[cb.id] = cb.opening_balance;
      });

      txns.forEach(t => {
        if (balanceMap[t.cashbook_id] !== undefined) {
          if (t.transaction_type === 'Cash In') {
            balanceMap[t.cashbook_id] += t.amount;
          } else {
            balanceMap[t.cashbook_id] -= t.amount;
          }
        }
      });

      setBalances(balanceMap);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load cashbooks');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cb, e) => {
    e.stopPropagation();
    setCashbookToEdit(cb);
    setIsFormOpen(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this cashbook? ALL associated transactions will be lost.')) {
      try {
        await pb.collection('cashbooks').delete(id, { $autoCancel: false });
        toast.success('Cashbook deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete cashbook');
      }
    }
  };

  const openNewForm = () => {
    setCashbookToEdit(null);
    setIsFormOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Cashbooks - Jai Bhavani Cargo</title>
        <meta name="description" content="Manage company cashbooks and petty cash" />
      </Helmet>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">Cashbooks</h1>
              <p className="text-muted-foreground">Manage petty cash, driver accounts, and branch funds.</p>
            </div>
            <Button onClick={openNewForm} className="gap-2 shadow-sm transition-all duration-200 active:scale-[0.98]">
              <Plus className="w-4 h-4" />
              Create New Cashbook
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-[200px] rounded-2xl" />
              ))}
            </div>
          ) : cashbooks.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded-3xl shadow-sm">
              <Wallet className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Cashbooks Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven't created any cashbooks yet. Create one to start tracking income and expenses.
              </p>
              <Button onClick={openNewForm}>Create First Cashbook</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cashbooks.map((cb) => {
                const currentBal = balances[cb.id] ?? cb.opening_balance;
                return (
                  <Card 
                    key={cb.id} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-border bg-card group flex flex-col h-full ${cb.status === 'inactive' ? 'opacity-70 grayscale-[0.5]' : ''}`}
                    onClick={() => navigate(`/cashbook/${cb.id}`)}
                  >
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl">
                          <Wallet className="w-6 h-6" />
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleEdit(cb, e)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleDelete(cb.id, e)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mb-4 flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold truncate" title={cb.name}>{cb.name}</h3>
                          {cb.status === 'inactive' && (
                            <span className="text-[10px] uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {cb.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-border mt-auto">
                        <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Current Balance</p>
                        <div className="flex justify-between items-center">
                          <p className={`text-2xl font-extrabold tracking-tight ${currentBal < 0 ? 'text-destructive' : 'text-foreground'}`}>
                            ₹{currentBal.toLocaleString()}
                          </p>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CashbookForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        cashbookToEdit={cashbookToEdit} 
        onSuccess={fetchData} 
      />
    </>
  );
};

export default CashbookManager;