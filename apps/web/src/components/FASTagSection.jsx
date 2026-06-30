import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, ChevronDown, ChevronUp, AlertTriangle, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import FASTagModal from './FASTagModal.jsx';
import FASTagRechargeModal from './FASTagRechargeModal.jsx';

const FASTagSection = ({ truck, onUpdate }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [recharges, setRecharges] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (truck?.id && isHistoryOpen) {
      fetchRecharges();
    }
  }, [truck?.id, isHistoryOpen]);

  const fetchRecharges = async () => {
    setLoadingHistory(true);
    try {
      const data = await pb.collection('fastag_recharges').getFullList({
        filter: `truck_id = "${truck.id}"`,
        sort: '-recharge_date',
        $autoCancel: false
      });
      setRecharges(data);
    } catch (error) {
      console.error('Failed to fetch recharges', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSuccess = () => {
    onUpdate();
    if (isHistoryOpen) {
      fetchRecharges();
    }
  };

  if (!truck) return null;

  const balance = truck.current_fastag_balance || 0;
  const isLowBalance = balance < 500;
  const isExpired = truck.fastag_status === 'Expired';
  const isInactive = truck.fastag_status === 'Inactive';

  const getStatusBadge = () => {
    if (isExpired) return <span className="badge-expired px-2 py-1 rounded-md text-xs font-medium">Expired</span>;
    if (isInactive) return <span className="badge-inactive px-2 py-1 rounded-md text-xs font-medium">Inactive</span>;
    return <span className="badge-active px-2 py-1 rounded-md text-xs font-medium">Active</span>;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            FASTag Details
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
            <Button size="sm" onClick={() => setIsRechargeModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Recharge
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Alerts */}
          {(isLowBalance || isExpired || isInactive) && (
            <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
              isExpired || isInactive ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-warning/10 border-warning/20 text-warning'
            }`}>
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">
                  {isExpired ? 'FASTag Expired' : isInactive ? 'FASTag Inactive' : 'Low Balance Alert'}
                </h4>
                <p className="text-sm opacity-90">
                  {isExpired || isInactive 
                    ? 'Please update the FASTag status or replace the tag to continue operations.' 
                    : `Current balance is ₹${balance.toLocaleString()}, which is below the recommended ₹500 minimum.`}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className={`text-3xl font-bold ${isLowBalance ? 'text-warning' : 'text-foreground'}`}>
                ₹{balance.toLocaleString()}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="pt-1">{getStatusBadge()}</div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">FASTag ID</p>
              <p className="font-medium text-foreground">{truck.fastag_id || 'Not set'}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Provider</p>
              <p className="font-medium text-foreground">{truck.fastag_provider || 'Not set'}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Vehicle Class</p>
              <p className="font-medium text-foreground">{truck.vehicle_class ? `Class ${truck.vehicle_class}` : 'Not set'}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Recharge</p>
              <p className="font-medium text-foreground">
                {truck.last_recharge_date ? format(new Date(truck.last_recharge_date), 'dd MMM yyyy') : 'Never'}
              </p>
              {truck.last_recharge_amount && (
                <p className="text-xs text-muted-foreground">₹{truck.last_recharge_amount.toLocaleString()}</p>
              )}
            </div>
          </div>

          {truck.fastag_notes && (
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground">{truck.fastag_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <Card className="bg-card border-border shadow-sm">
          <CollapsibleTrigger asChild>
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors">
              <CardTitle className="text-lg">Recharge History</CardTitle>
              {isHistoryOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {loadingHistory ? (
                <div className="py-8 text-center text-muted-foreground">Loading history...</div>
              ) : recharges.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No recharge history found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recharges.map((record) => (
                        <TableRow key={record.id} className="border-border">
                          <TableCell className="font-medium">
                            {format(new Date(record.recharge_date), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell className="text-success font-medium">
                            +₹{record.recharge_amount.toLocaleString()}
                          </TableCell>
                          <TableCell>{record.payment_method}</TableCell>
                          <TableCell className="text-muted-foreground">{record.reference_number || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <FASTagModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        truck={truck} 
        onSuccess={handleSuccess} 
      />
      
      <FASTagRechargeModal 
        isOpen={isRechargeModalOpen} 
        onClose={() => setIsRechargeModalOpen(false)} 
        truck={truck} 
        onSuccess={handleSuccess} 
      />
    </div>
  );
};

export default FASTagSection;