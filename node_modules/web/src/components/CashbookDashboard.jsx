import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet, ArrowDownRight, ArrowUpRight, Edit2, Check, X } from 'lucide-react';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
};

const CashbookDashboard = ({ metrics, onUpdateOpeningBalance }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleEditClick = () => {
    setEditValue(metrics.opening_balance.toString());
    setIsEditing(true);
  };

  const handleSave = () => {
    const val = parseFloat(editValue);
    if (!isNaN(val)) {
      onUpdateOpeningBalance(val);
    }
    setIsEditing(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      {/* Main Balance Card */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-1 bg-primary text-primary-foreground border-none shadow-lg relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
          <Wallet className="w-32 h-32" />
        </div>
        <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide opacity-80 mb-1">Current Balance</p>
            <h2 className="text-3xl font-bold tabular-nums tracking-tight">
              {formatCurrency(metrics.net_balance)}
            </h2>
          </div>
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-primary-foreground/20">
            <div className="space-y-1 flex-1">
              <p className="text-xs opacity-70">Opening Bal.</p>
              {isEditing ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    type="number" 
                    value={editValue} 
                    onChange={(e) => setEditValue(e.target.value)}
                    className="h-7 text-xs bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground w-24"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-success/20 text-success" onClick={handleSave}>
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-destructive/20 text-destructive" onClick={() => setIsEditing(false)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold tabular-nums">{formatCurrency(metrics.opening_balance)}</p>
                  <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-primary-foreground/10 text-primary-foreground opacity-50 hover:opacity-100" onClick={handleEditClick}>
                    <Edit2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Card */}
      <Card className="shadow-sm border-border">
        <CardContent className="p-6 h-full flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Income</p>
            <div className="p-2 bg-success/10 rounded-lg"><ArrowDownRight className="w-4 h-4 text-success" /></div>
          </div>
          <p className="text-2xl font-bold tabular-nums text-foreground">{formatCurrency(metrics.total_income)}</p>
          <p className="text-xs text-muted-foreground mt-2">All credit transactions</p>
        </CardContent>
      </Card>

      {/* Expenses Breakdown Card */}
      <Card className="shadow-sm border-border col-span-1 md:col-span-2">
        <CardContent className="p-6 h-full flex flex-col justify-center">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Outflow</p>
            <div className="p-2 bg-destructive/10 rounded-lg"><ArrowUpRight className="w-4 h-4 text-destructive" /></div>
          </div>
          <div className="flex items-end gap-4 mb-4">
            <p className="text-2xl font-bold tabular-nums text-foreground">{formatCurrency(metrics.total_outflow)}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Expenses</p>
              <p className="text-sm font-semibold tabular-nums">{formatCurrency(metrics.total_expenses)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Advances</p>
              <p className="text-sm font-semibold tabular-nums">{formatCurrency(metrics.total_advances)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Payroll</p>
              <p className="text-sm font-semibold tabular-nums">{formatCurrency(metrics.total_payroll)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Fuel</p>
              <p className="text-sm font-semibold tabular-nums">{formatCurrency(metrics.total_fuel)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashbookDashboard;