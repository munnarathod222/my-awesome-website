import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, Search, Filter, Download, Trash2, ExternalLink, 
  CheckCircle, XCircle, Clock, AlertTriangle, ArrowRight, 
  Building2, MapPin, Truck, ChevronRight, Layers, FileSpreadsheet,
  Paperclip, Image as ImageIcon, Eye, X, Upload, Maximize2, ChevronLeft
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils.js';
import { parseImageList } from '@/lib/biddingIntelligenceStorage.js';

const VEHICLE_OPTIONS = [
  '32FTSXL',
  '32FT MXL',
  '24FTSXL',
  '20FTSXL',
  '14FT',
  '17FT',
  '40FT High Cube',
  '42FT SXL'
];

const STATUS_OPTIONS = [
  { value: 'Not bidded', label: 'Not bidded', color: 'bg-slate-700/30 text-slate-300 border-slate-600/40' },
  { value: 'Bidded', label: 'Bidded', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { value: 'Won', label: 'Won', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold' },
  { value: 'Lost', label: 'Lost', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold' },
  { value: 'Under Review', label: 'Under Review', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { value: 'Cancelled', label: 'Cancelled', color: 'bg-muted text-muted-foreground border-border' }
];

const resolveImageUrl = (img, bidRecord) => {
  if (!img) return '';
  if (img.startsWith('data:') || img.startsWith('http://') || img.startsWith('https://') || img.startsWith('blob:')) {
    return img;
  }
  if (bidRecord?.collectionId && bidRecord?.id) {
    return `/hcgi/platform/api/files/${bidRecord.collectionId}/${bidRecord.id}/${img}`;
  }
  return img;
};

export default function BiddingSpreadsheetGrid({
  bids = [],
  clients = [],
  activeClientTab = 'Delhivery',
  activeTypeTab = 'Contract', // 'Contract' | 'Spot'
  onSelectClientTab,
  onSelectTypeTab,
  onUpdateBid,
  onAddBid,
  onDeleteBid,
  onBulkDelete,
  onBulkUpdateStatus
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingCell, setEditingCell] = useState(null); // { id, field }
  const [activeImageModal, setActiveImageModal] = useState(null); // { bid, index }

  const handleAttachImages = (bidId, files) => {
    if (!files || files.length === 0) return;
    const targetBid = bids.find(b => b.id === bidId);
    if (!targetBid) return;

    const existingImages = parseImageList(targetBid.attachments);
    const newImages = [];
    let processed = 0;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push(e.target.result);
        }
        processed++;
        if (processed === files.length) {
          const updated = {
            ...targetBid,
            attachments: [...existingImages, ...newImages]
          };
          onUpdateBid?.(updated);
          toast.success(`Attached ${newImages.length} image(s) to bid log!`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (bidId, imgIndex) => {
    const targetBid = bids.find(b => b.id === bidId);
    if (!targetBid) return;

    const existingImages = parseImageList(targetBid.attachments);
    const updatedImages = existingImages.filter((_, idx) => idx !== imgIndex);

    const updated = {
      ...targetBid,
      attachments: updatedImages
    };
    onUpdateBid?.(updated);
    toast.info('Image removed from bid log');
    if (activeImageModal && activeImageModal.bid.id === bidId) {
      if (updatedImages.length === 0) setActiveImageModal(null);
      else setActiveImageModal({ bid: updated, index: Math.min(imgIndex, updatedImages.length - 1) });
    }
  };

  // Extract unique client sheet tabs
  const clientTabs = useMemo(() => {
    const names = new Set();
    // Default standard clients
    ['Delhivery', 'Amazon', 'Flipkart', 'DHL', 'Reliance'].forEach(n => names.add(n));
    clients.forEach(c => {
      const name = c.client_name || c.company_name;
      if (name) names.add(name);
    });
    bids.forEach(b => {
      const name = b.client_name || b.counterparty;
      if (name) names.add(name);
    });
    return Array.from(names);
  }, [clients, bids]);

  // Filter bids for the active client & contract/spot type
  const filteredBids = useMemo(() => {
    return bids.filter(b => {
      const bClient = (b.client_name || b.counterparty || 'Delhivery').trim().toLowerCase();
      const matchClient = !activeClientTab || activeClientTab === 'all' || bClient === activeClientTab.trim().toLowerCase();
      
      const bType = (b.bidding_type || 'Contract').trim().toLowerCase();
      const matchType = !activeTypeTab || bType === activeTypeTab.trim().toLowerCase();

      const bStatus = (b.status || 'Not bidded').trim();
      const matchStatus = statusFilter === 'all' || bStatus === statusFilter;

      const term = search.toLowerCase();
      const matchSearch = !term || (
        (b.starting_point || '').toLowerCase().includes(term) ||
        (b.ending_point || '').toLowerCase().includes(term) ||
        (b.vehicle_type || '').toLowerCase().includes(term) ||
        (b.notes || '').toLowerCase().includes(term)
      );

      return matchClient && matchType && matchStatus && matchSearch;
    });
  }, [bids, activeClientTab, activeTypeTab, statusFilter, search]);

  const handleCellChange = (id, field, value) => {
    const targetBid = bids.find(b => b.id === id);
    if (!targetBid) return;

    const updated = {
      ...targetBid,
      [field]: field === 'bidding_amount' || field === 'bidding_lost_at' || field === 'no_of_stops' 
        ? (value === '' ? '' : Number(value)) 
        : value
    };

    // Auto-sync status if winning competitor rate is entered
    if (field === 'bidding_lost_at' && Number(value) > 0 && targetBid.status !== 'Lost') {
      updated.status = 'Lost';
    }

    onUpdateBid?.(updated);
  };

  const handleAddNewRow = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const newBid = {
      id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      date: todayStr,
      client_name: activeClientTab === 'all' ? 'Delhivery' : activeClientTab,
      bidding_type: activeTypeTab,
      vehicle_type: '32FTSXL',
      bidding_amount: '',
      bidding_lost_at: '',
      trip_detail: '2 Way',
      starting_point: 'HYD_Medchal GW',
      ending_point: '',
      no_of_stops: 1,
      route_map: '',
      status: 'Not bidded',
      notes: ''
    };
    onAddBid?.(newBid);
    toast.success(`Added new bid row under ${newBid.client_name} (${newBid.bidding_type})`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 border border-slate-700/50 rounded-xl">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold text-slate-200">{activeClientTab}</span>
            <span className="text-xs text-slate-500">|</span>
            <Badge variant="outline" className={cn(
              "text-xs font-semibold uppercase tracking-wider",
              activeTypeTab === 'Contract' ? "bg-purple-500/20 text-purple-300 border-purple-500/40" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
            )}>
              {activeTypeTab} Bids
            </Badge>
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text"
              placeholder="Search origin, destination, truck..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs bg-slate-900 border-slate-700/60 text-slate-200 rounded-xl"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-36 text-xs bg-slate-900 border-slate-700/60 text-slate-300 rounded-xl">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
              <SelectItem value="all">All Status</SelectItem>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onBulkUpdateStatus?.(selectedIds, 'Won')}
                className="h-8 text-xs font-semibold bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-xl"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Mark Won ({selectedIds.length})
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onBulkUpdateStatus?.(selectedIds, 'Lost')}
                className="h-8 text-xs font-semibold bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 rounded-xl"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" /> Mark Lost ({selectedIds.length})
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => onBulkDelete?.(selectedIds)}
                className="h-8 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
              </Button>
            </>
          )}

          <Button 
            size="sm" 
            onClick={handleAddNewRow}
            className="h-8 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-600/20"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Bid Row
          </Button>
        </div>
      </div>

      {/* Spreadsheet Table Grid */}
      <div className="flex-1 overflow-auto">
        <Table className="w-full border-collapse">
          <TableHeader className="bg-slate-900/95 sticky top-0 z-20 border-b border-slate-800 text-slate-400 font-semibold text-xs select-none">
            <TableRow className="hover:bg-transparent border-slate-800">
              <TableHead className="w-[40px] pl-4">
                <input 
                  type="checkbox"
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 w-3.5 h-3.5 cursor-pointer"
                  checked={filteredBids.length > 0 && selectedIds.length === filteredBids.length}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds(filteredBids.map(b => b.id));
                    else setSelectedIds([]);
                  }}
                />
              </TableHead>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead className="w-[140px]">Vehicle Type</TableHead>
              <TableHead className="w-[130px]">Bidding amount (₹)</TableHead>
              <TableHead className="w-[130px]">Bidding lost at (₹)</TableHead>
              <TableHead className="w-[110px]">Trip detail</TableHead>
              <TableHead className="min-w-[170px]">Starting Point</TableHead>
              <TableHead className="min-w-[170px]">Ending Point</TableHead>
              <TableHead className="w-[90px] text-center">No of Stops</TableHead>
              <TableHead className="w-[140px]">Route map</TableHead>
              <TableHead className="w-[170px]">Images / Docs</TableHead>
              <TableHead className="w-[130px]">Status</TableHead>
              <TableHead className="w-[60px] text-right pr-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs divide-y divide-slate-800/60 font-mono">
            {filteredBids.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-16 text-slate-500 font-sans">
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  No bids found for <span className="font-bold text-slate-400">{activeClientTab}</span> ({activeTypeTab}).
                  <div className="mt-3">
                    <Button size="sm" variant="outline" onClick={handleAddNewRow} className="text-xs rounded-xl border-slate-700 text-cyan-400">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add first bid row
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredBids.map((b, idx) => {
                const statusMeta = STATUS_OPTIONS.find(s => s.value === b.status) || STATUS_OPTIONS[0];
                const isLostWithGap = b.status === 'Lost' && Number(b.bidding_amount) > 0 && Number(b.bidding_lost_at) > 0;
                const priceGap = isLostWithGap ? Number(b.bidding_amount) - Number(b.bidding_lost_at) : 0;
                const imgList = parseImageList(b.attachments);

                return (
                  <TableRow key={b.id} className="hover:bg-slate-900/60 transition-colors group">
                    {/* Checkbox */}
                    <TableCell className="pl-4">
                      <input 
                        type="checkbox"
                        className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 w-3.5 h-3.5 cursor-pointer"
                        checked={selectedIds.includes(b.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(prev => [...prev, b.id]);
                          else setSelectedIds(prev => prev.filter(id => id !== b.id));
                        }}
                      />
                    </TableCell>

                    {/* Date */}
                    <TableCell className="p-1">
                      <input 
                        type="date"
                        value={b.date ? b.date.split('T')[0] : ''}
                        onChange={(e) => handleCellChange(b.id, 'date', e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 text-slate-200 border border-transparent hover:border-slate-700 focus:border-cyan-500 focus:bg-slate-900 rounded outline-none text-xs"
                      />
                    </TableCell>

                    {/* Vehicle Type */}
                    <TableCell className="p-1">
                      <select 
                        value={b.vehicle_type || '32FTSXL'}
                        onChange={(e) => handleCellChange(b.id, 'vehicle_type', e.target.value)}
                        className="w-full bg-slate-900/80 px-2 py-1.5 text-cyan-300 font-semibold border border-slate-800 hover:border-slate-700 focus:border-cyan-500 rounded outline-none text-xs cursor-pointer"
                      >
                        {VEHICLE_OPTIONS.map(v => (
                          <option key={v} value={v} className="bg-slate-900 text-slate-200">{v}</option>
                        ))}
                      </select>
                    </TableCell>

                    {/* Bidding amount */}
                    <TableCell className="p-1">
                      <input 
                        type="number"
                        placeholder="-"
                        value={b.bidding_amount !== undefined && b.bidding_amount !== null ? b.bidding_amount : ''}
                        onChange={(e) => handleCellChange(b.id, 'bidding_amount', e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 text-cyan-400 font-bold border border-transparent hover:border-slate-700 focus:border-cyan-500 focus:bg-slate-900 rounded outline-none text-xs text-right tabular-nums"
                      />
                    </TableCell>

                    {/* Bidding lost at */}
                    <TableCell className="p-1">
                      <div className="relative">
                        <input 
                          type="number"
                          placeholder="-"
                          value={b.bidding_lost_at !== undefined && b.bidding_lost_at !== null ? b.bidding_lost_at : ''}
                          onChange={(e) => handleCellChange(b.id, 'bidding_lost_at', e.target.value)}
                          className={cn(
                            "w-full bg-transparent px-2 py-1.5 font-bold border border-transparent hover:border-slate-700 focus:border-rose-500 focus:bg-slate-900 rounded outline-none text-xs text-right tabular-nums",
                            b.status === 'Lost' ? "text-rose-400" : "text-slate-400"
                          )}
                        />
                        {priceGap > 0 && (
                          <span className="text-[9px] text-rose-400 font-sans block text-right pr-2">
                            (+₹{priceGap.toLocaleString('en-IN')})
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Trip detail (1 Way / 2 Way) */}
                    <TableCell className="p-1">
                      <select 
                        value={b.trip_detail || '1 Way'}
                        onChange={(e) => handleCellChange(b.id, 'trip_detail', e.target.value)}
                        className={cn(
                          "w-full px-2 py-1.5 text-center font-bold border rounded outline-none text-xs cursor-pointer",
                          b.trip_detail === '2 Way' 
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/30" 
                            : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        )}
                      >
                        <option value="1 Way" className="bg-slate-900 text-slate-200">1 Way</option>
                        <option value="2 Way" className="bg-slate-900 text-slate-200">2 Way</option>
                      </select>
                    </TableCell>

                    {/* Starting Point */}
                    <TableCell className="p-1">
                      <input 
                        type="text"
                        placeholder="Origin Hub..."
                        value={b.starting_point || ''}
                        onChange={(e) => handleCellChange(b.id, 'starting_point', e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 text-slate-200 border border-transparent hover:border-slate-700 focus:border-cyan-500 focus:bg-slate-900 rounded outline-none text-xs"
                      />
                    </TableCell>

                    {/* Ending Point */}
                    <TableCell className="p-1">
                      <input 
                        type="text"
                        placeholder="Destination Hub..."
                        value={b.ending_point || ''}
                        onChange={(e) => handleCellChange(b.id, 'ending_point', e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 text-slate-200 border border-transparent hover:border-slate-700 focus:border-cyan-500 focus:bg-slate-900 rounded outline-none text-xs"
                      />
                    </TableCell>

                    {/* No of Stops */}
                    <TableCell className="p-1">
                      <input 
                        type="number"
                        min="0"
                        value={b.no_of_stops !== undefined && b.no_of_stops !== null ? b.no_of_stops : 1}
                        onChange={(e) => handleCellChange(b.id, 'no_of_stops', e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 text-slate-300 text-center font-bold border border-transparent hover:border-slate-700 focus:border-cyan-500 focus:bg-slate-900 rounded outline-none text-xs"
                      />
                    </TableCell>

                    {/* Route Map */}
                    <TableCell className="p-1">
                      <div className="flex items-center gap-1">
                        <input 
                          type="text"
                          placeholder="maps.google.com/..."
                          value={b.route_map || ''}
                          onChange={(e) => handleCellChange(b.id, 'route_map', e.target.value)}
                          className="w-full bg-transparent px-2 py-1.5 text-slate-400 font-sans border border-transparent hover:border-slate-700 focus:border-cyan-500 focus:bg-slate-900 rounded outline-none text-[11px] truncate"
                        />
                        {b.route_map && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 text-cyan-400 hover:bg-cyan-500/20 shrink-0"
                            onClick={() => window.open(b.route_map, '_blank')}
                            title="Open Google Maps Route"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>

                    {/* Images / Attachments */}
                    <TableCell className="p-1">
                      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                        {imgList.map((img, iIdx) => {
                          const srcUrl = resolveImageUrl(img, b);
                          return (
                            <div key={iIdx} className="relative group/img shrink-0">
                              <img 
                                src={srcUrl} 
                                alt={`Bid attachment ${iIdx+1}`}
                                className="w-7 h-7 rounded border border-slate-700 object-cover hover:border-cyan-400 cursor-pointer shadow-sm transition-transform hover:scale-110"
                                onClick={() => setActiveImageModal({ bid: b, index: iIdx })}
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage(b.id, iIdx);
                                }}
                                className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity z-10"
                                title="Delete Image"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          );
                        })}

                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-cyan-100 text-[11px] font-sans font-bold rounded-lg shrink-0 transition-all shadow-sm">
                          <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{imgList.length > 0 ? `+ Add (${imgList.length})` : '+ Attach Image'}</span>
                          <input 
                            type="file" 
                            accept="image/*,.pdf" 
                            multiple 
                            onChange={(e) => handleAttachImages(b.id, e.target.files)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="p-1">
                      <select 
                        value={b.status || 'Not bidded'}
                        onChange={(e) => handleCellChange(b.id, 'status', e.target.value)}
                        className={cn(
                          "w-full px-2 py-1.5 font-bold border rounded outline-none text-xs cursor-pointer",
                          statusMeta.color
                        )}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                        onClick={() => onDeleteBid?.(b.id)}
                        title="Delete Bid"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom Sheet Tabs Bar (Exact Google Sheets / Excel Style matching user reference) */}
      <div className="bg-slate-900 border-t border-slate-800 flex items-center overflow-x-auto px-2 py-1.5 scrollbar-thin select-none">
        <div className="flex items-center gap-1 mr-3 border-r border-slate-800 pr-3">
          <Button 
            size="sm" 
            onClick={handleAddNewRow}
            className="h-7 px-3 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold shadow-md shadow-cyan-600/20 flex items-center gap-1"
            title="Add New Bid Row"
          >
            <Plus className="w-3.5 h-3.5" /> <span>Add Row</span>
          </Button>
        </div>

        {/* Client Tabs */}
        <div className="flex items-center gap-1">
          {clientTabs.map(clientName => {
            const isContractActive = activeClientTab === clientName && activeTypeTab === 'Contract';
            const isSpotActive = activeClientTab === clientName && activeTypeTab === 'Spot';

            return (
              <React.Fragment key={clientName}>
                {/* Contract Tab */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectClientTab?.(clientName);
                    onSelectTypeTab?.('Contract');
                  }}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap",
                    isContractActive 
                      ? "bg-slate-950 text-cyan-400 border-cyan-500 shadow-sm" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent"
                  )}
                >
                  <Building2 className="w-3 h-3 text-cyan-400" />
                  <span>{clientName} Contracts</span>
                </button>

                {/* Spot Tab */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectClientTab?.(clientName);
                    onSelectTypeTab?.('Spot');
                  }}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap",
                    isSpotActive 
                      ? "bg-slate-950 text-emerald-400 border-emerald-500 shadow-sm" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent"
                  )}
                >
                  <Truck className="w-3 h-3 text-emerald-400" />
                  <span>{clientName} Load</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* High-Resolution Image Lightbox Modal */}
      {activeImageModal && (
        <Dialog open={!!activeImageModal} onOpenChange={() => setActiveImageModal(null)}>
          <DialogContent className="sm:max-w-[750px] bg-slate-950 border-slate-800 text-slate-100 shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-cyan-400" />
                <div>
                  <DialogTitle className="text-sm font-bold text-slate-200">
                    Bid Document Attachment ({activeImageModal.index + 1} of {parseImageList(activeImageModal.bid.attachments).length})
                  </DialogTitle>
                  <p className="text-xs text-slate-400">
                    {activeImageModal.bid.client_name} - {activeImageModal.bid.starting_point} → {activeImageModal.bid.ending_point}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-slate-700 text-rose-400 hover:bg-rose-500/10"
                  onClick={() => handleRemoveImage(activeImageModal.bid.id, activeImageModal.index)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </div>
            </DialogHeader>

            <div className="relative bg-black flex items-center justify-center min-h-[400px] max-h-[600px] p-4">
              {(() => {
                const imgs = parseImageList(activeImageModal.bid.attachments);
                const currentImg = imgs[activeImageModal.index];
                const srcUrl = resolveImageUrl(currentImg, activeImageModal.bid);

                return (
                  <>
                    <img 
                      src={srcUrl} 
                      alt="Bid Image Attachment" 
                      className="max-h-[550px] max-w-full object-contain rounded-lg shadow-2xl"
                    />

                    {imgs.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveImageModal(p => ({ ...p, index: (p.index - 1 + imgs.length) % imgs.length }))}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-800 text-white p-2 rounded-full border border-slate-700 shadow-lg"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveImageModal(p => ({ ...p, index: (p.index + 1) % imgs.length }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-800 text-white p-2 rounded-full border border-slate-700 shadow-lg"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
