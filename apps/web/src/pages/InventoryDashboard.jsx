import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Package, AlertTriangle, DollarSign, History, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils.js';

import InventoryItemModal from '@/components/InventoryItemModal.jsx';
import StockDeductionModal from '@/components/StockDeductionModal.jsx';
import RestockManagementModal from '@/components/RestockManagementModal.jsx';
import RestockHistoryModal from '@/components/RestockHistoryModal.jsx';

const parseImageList = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch(e) {}
    if (raw.trim().startsWith('[')) return [];
    return [raw];
  }
  return [];
};

const InventoryDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isItemModalOpen, setItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [isDeductModalOpen, setDeductModalOpen] = useState(false);
  const [isRestockModalOpen, setRestockModalOpen] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  
  const fetchItems = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('inventory_items').getFullList({ sort: 'item_name', $autoCancel: false });
      setItems(records);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await pb.collection('inventory_items').delete(id, { $autoCancel: false });
      toast.success('Item deleted');
      fetchItems();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = item.item_name.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      const isLowStock = item.current_stock <= item.reorder_level;
      const matchStatus = statusFilter === 'all' || (statusFilter === 'low' ? isLowStock : !isLowStock);
      return matchSearch && matchCat && matchStatus;
    });
  }, [items, search, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalItems = items.length;
    const lowStock = items.filter(i => i.current_stock <= i.reorder_level).length;
    const totalValue = items.reduce((sum, item) => sum + (item.current_stock * (item.unit_cost || 0)), 0);
    return { totalItems, lowStock, totalValue };
  }, [items]);

  return (
    <div className="h-full w-full flex flex-col">
      <Helmet><title>Inventory Dashboard</title></Helmet>
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage truck parts, fluids, and accessories.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild><Link to="/inventory/deductions"><History className="w-4 h-4 mr-2"/> Usage History</Link></Button>
            <Button variant="outline" asChild><Link to="/inventory/reports"><BarChart2 className="w-4 h-4 mr-2"/> Reports</Link></Button>
            <Button onClick={() => { setSelectedItem(null); setItemModalOpen(true); }}><Plus className="w-4 h-4 mr-2"/> Add Item</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-xl"><Package className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-3xl font-bold">{stats.totalItems}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-destructive/10 text-destructive rounded-xl"><AlertTriangle className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Alerts</p>
                <p className="text-3xl font-bold">{stats.lowStock}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-success/10 text-success rounded-xl"><DollarSign className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Inventory Value</p>
                <p className="text-3xl font-bold">₹{stats.totalValue.toLocaleString(undefined, {minimumFractionDigits:2})}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm border-border">
          <div className="p-4 border-b flex flex-wrap gap-4 items-center bg-muted/20">
            <Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Truck Parts">Truck Parts</SelectItem>
                <SelectItem value="Oils & Fluids">Oils & Fluids</SelectItem>
                <SelectItem value="Ad Blue">Ad Blue</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ok">In Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Reorder Lvl</TableHead>
                  <TableHead>Last Restock</TableHead>
                  <TableHead>Receipts</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No items found.</TableCell></TableRow>
                ) : (
                  filteredItems.map(item => {
                    const isLow = item.current_stock <= item.reorder_level;
                    const itemImages = parseImageList(item.image_urls);
                    const primaryItemImg = itemImages.length > 0 ? itemImages[0] : null;

                    return (
                      <TableRow key={item.id} className={isLow ? 'bg-destructive/5' : ''}>
                        <TableCell className="font-medium flex items-center gap-3">
                          {primaryItemImg ? (
                            <div 
                              onClick={() => setActiveLightboxImage(pb.files.getUrl(item, primaryItemImg))}
                              className="w-10 h-10 rounded-lg border border-border/80 overflow-hidden cursor-pointer hover:scale-105 transition-transform bg-muted shrink-0 shadow-sm"
                            >
                              <img src={pb.files.getUrl(item, primaryItemImg)} alt={item.item_name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg border border-border/60 bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold">{item.item_name}</p>
                            {isLow && <Badge variant="destructive" className="mt-1 text-[9px] px-1.5 py-0">Low Stock</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className={`text-right font-bold ${isLow ? 'text-destructive' : ''}`}>{item.current_stock}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{item.reorder_level}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.last_restocked_date && !isNaN(Date.parse(item.last_restocked_date)) ? format(new Date(item.last_restocked_date), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1.5">
                            {itemImages.map((img, idx) => {
                              const url = pb.files.getUrl(item, img);
                              return (
                                <div 
                                  key={idx}
                                  onClick={() => setActiveLightboxImage(url)}
                                  className="w-7 h-7 rounded border border-border/80 overflow-hidden cursor-pointer hover:scale-110 transition-transform bg-muted shrink-0 shadow-sm"
                                  title="View Receipt"
                                >
                                  <img src={url} alt="receipt" className="w-full h-full object-cover" />
                                </div>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedItem(item); setDeductModalOpen(true); }}>Use</Button>
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedItem(item); setRestockModalOpen(true); }}>Add</Button>
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedItem(item); setItemModalOpen(true); }}>Edit</Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>Del</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List View (Hidden on desktop) */}
          <div className="block md:hidden divide-y divide-border/40">
            {filteredItems.length === 0 ? (
              <div className="text-center text-muted-foreground py-12 text-sm">No items found.</div>
            ) : (
              filteredItems.map(item => {
                const isLow = item.current_stock <= item.reorder_level;
                const itemImages = parseImageList(item.image_urls);
                const primaryItemImg = itemImages.length > 0 ? itemImages[0] : null;

                return (
                  <div key={item.id} className={cn("p-4 space-y-3 hover:bg-muted/5 transition-colors", isLow ? 'bg-destructive/[0.02]' : '')}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {primaryItemImg ? (
                          <div 
                            onClick={() => setActiveLightboxImage(pb.files.getUrl(item, primaryItemImg))}
                            className="w-10 h-10 rounded-lg border border-border/80 overflow-hidden cursor-pointer bg-muted shrink-0 shadow-sm"
                          >
                            <img src={pb.files.getUrl(item, primaryItemImg)} alt={item.item_name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg border border-border/60 bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
                            {item.item_name}
                            {isLow && <Badge variant="destructive" className="text-[9px] px-1.5 py-0">Low</Badge>}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        {itemImages.map((img, idx) => {
                          const url = pb.files.getUrl(item, img);
                          return (
                            <div 
                              key={idx}
                              onClick={() => setActiveLightboxImage(url)}
                              className="w-7 h-7 rounded border border-border/80 overflow-hidden cursor-pointer hover:scale-105 transition-transform bg-muted shrink-0 shadow-sm"
                              title="View Receipt"
                            >
                              <img src={url} alt="receipt" className="w-full h-full object-cover" />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/20 text-xs">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-medium">Stock</p>
                        <p className={cn("font-bold mt-0.5", isLow ? 'text-destructive' : 'text-foreground')}>
                          {item.current_stock} <span className="text-[10px] font-normal text-muted-foreground">{item.unit}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-medium">Reorder Lvl</p>
                        <p className="font-semibold text-foreground mt-0.5">{item.reorder_level} {item.unit}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-medium">Last Restocked</p>
                        <p className="font-medium text-foreground mt-0.5 truncate">
                          {item.last_restocked_date && !isNaN(Date.parse(item.last_restocked_date)) ? format(new Date(item.last_restocked_date), 'MMM dd') : '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-border/20">
                      <div className="flex gap-1.5">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => { setSelectedItem(item); setDeductModalOpen(true); }}
                          className="h-7 text-[11px] font-bold rounded-lg border-border hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                        >
                          Use Stock
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => { setSelectedItem(item); setRestockModalOpen(true); }}
                          className="h-7 text-[11px] font-bold rounded-lg border-border hover:bg-success hover:text-success-foreground transition-all duration-200"
                        >
                          Restock
                        </Button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { setSelectedItem(item); setItemModalOpen(true); }}
                          className="h-7 text-xs font-semibold rounded-lg"
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(item.id)}
                          className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive font-semibold rounded-lg"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </main>

      <InventoryItemModal isOpen={isItemModalOpen} onClose={() => setItemModalOpen(false)} onSuccess={() => { setItemModalOpen(false); fetchItems(); }} item={selectedItem} />
      <StockDeductionModal isOpen={isDeductModalOpen} onClose={() => setDeductModalOpen(false)} onSuccess={() => { setDeductModalOpen(false); fetchItems(); }} item={selectedItem} />
      <RestockManagementModal isOpen={isRestockModalOpen} onClose={() => setRestockModalOpen(false)} onSuccess={() => { setRestockModalOpen(false); fetchItems(); }} item={selectedItem} />
      <RestockHistoryModal isOpen={isHistoryModalOpen} onClose={() => setHistoryModalOpen(false)} item={selectedItem} />

      {activeLightboxImage && (
        <Dialog open={!!activeLightboxImage} onOpenChange={() => setActiveLightboxImage(null)}>
          <DialogContent className="max-w-3xl border-none bg-black/90 p-0 overflow-hidden flex items-center justify-center rounded-2xl animate-in fade-in zoom-in duration-200">
            <div className="relative w-full h-[80vh] flex items-center justify-center p-4">
              <img src={activeLightboxImage} alt="high-res" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
              <button 
                onClick={() => setActiveLightboxImage(null)} 
                className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white rounded-full p-2 text-sm w-8 h-8 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default InventoryDashboard;