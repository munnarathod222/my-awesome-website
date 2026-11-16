import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Trash2,
  Users, CheckSquare, Square, Search, ArrowRight, Loader2, Sparkles,
  RefreshCw, Phone, MapPin, Building2, Wrench, X, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { parseVCardContent, getPhoneLookupKey } from '@/lib/vcardParser.js';

export const ALL_CONTACT_CATEGORIES = [
  'Transporter',
  'Truck Owner',
  'Mechanic',
  'Electrician',
  'Puncture Shop',
  'Showroom',
  'Spare Parts',
  'Bodywork / Welding',
  'Crane / Tow Truck',
  'Hydraulics',
  'Washing Centre',
  'RTO Agent',
  'Warehouse',
  'Client',
  'Corporate',
  'Driver',
  'Employee',
  'Banking',
  'Loan Agent',
  'Vendor',
  'Other'
];

export default function VCardImportModal({ isOpen, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState('upload'); // 'upload' | 'preview' | 'importing'
  const [fileName, setFileName] = useState('');
  const [parsedContacts, setParsedContacts] = useState([]);
  const [existingPhoneMap, setExistingPhoneMap] = useState(new Map());
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [batchCategory, setBatchCategory] = useState('auto');
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [isPasteMode, setIsPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState('');

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep('upload');
      setFileName('');
      setParsedContacts([]);
      setSearchTerm('');
      setBatchCategory('auto');
      setSkipDuplicates(true);
      setImportProgress({ current: 0, total: 0 });
      setIsPasteMode(false);
      setPasteText('');

      // Fetch existing contacts from DB to perform deduplication
      setLoadingExisting(true);
      pb.collection('contacts').getFullList({
        fields: 'id,phone_number,company_name',
        $autoCancel: false
      }).then(records => {
        const phoneMap = new Map();
        records.forEach(r => {
          if (r.phone_number) {
            const key = getPhoneLookupKey(r.phone_number);
            if (key) {
              phoneMap.set(key, r.company_name || 'Existing Contact');
            }
          }
        });
        setExistingPhoneMap(phoneMap);
      }).catch(err => {
        console.warn('Could not fetch existing contacts for deduplication:', err);
      }).finally(() => {
        setLoadingExisting(false);
      });
    }
  }, [isOpen]);

  // Process raw vCard string
  const handleProcessVCardString = (text, name = 'vcard_contacts.vcf') => {
    if (!text || !text.trim()) {
      toast.error('The selected file or text is empty.');
      return;
    }

    try {
      const parsed = parseVCardContent(text);
      if (parsed.length === 0) {
        toast.error('No contacts could be found in this vCard file. Please check file format.');
        return;
      }

      // Check duplicates against existing DB
      const marked = parsed.map(c => {
        const isDup = c.phoneLookupKey && existingPhoneMap.has(c.phoneLookupKey);
        const dupName = isDup ? existingPhoneMap.get(c.phoneLookupKey) : '';
        return {
          ...c,
          isDuplicate: isDup,
          duplicateOf: dupName,
          selected: isDup ? !skipDuplicates : true
        };
      });

      setFileName(name);
      setParsedContacts(marked);
      setStep('preview');
      toast.success(`Parsed ${parsed.length} contacts from ${name}`);
    } catch (err) {
      console.error('Error parsing vCard:', err);
      toast.error('Failed to parse vCard: ' + (err.message || 'Invalid format'));
    }
  };

  // Handle file select / drop
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      handleProcessVCardString(content, file.name);
    };
    reader.onerror = () => {
      toast.error('Error reading file');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      handleProcessVCardString(event.target?.result, file.name);
    };
    reader.readAsText(file);
  };

  // Bulk category assignment
  const handleBatchCategoryChange = (val) => {
    setBatchCategory(val);
    if (val === 'auto') {
      // Recompute auto-detected categories
      setParsedContacts(prev => prev.map(c => ({
        ...c,
        contact_type: c.detectedType || c.contact_type
      })));
    } else {
      setParsedContacts(prev => prev.map(c => ({
        ...c,
        contact_type: val
      })));
    }
  };

  // Toggle selection for all visible contacts
  const handleToggleSelectAll = (select) => {
    setParsedContacts(prev => prev.map(c => {
      if (c.isDuplicate && skipDuplicates && select) {
        return { ...c, selected: false };
      }
      return { ...c, selected: select };
    }));
  };

  // Toggle skip duplicates checkbox
  const handleToggleSkipDuplicates = (checked) => {
    setSkipDuplicates(checked);
    if (checked) {
      setParsedContacts(prev => prev.map(c => c.isDuplicate ? { ...c, selected: false } : c));
    } else {
      setParsedContacts(prev => prev.map(c => ({ ...c, selected: true })));
    }
  };

  // Filtered contacts for preview table
  const visibleContacts = useMemo(() => {
    if (!searchTerm.trim()) return parsedContacts;
    const q = searchTerm.toLowerCase();
    return parsedContacts.filter(c =>
      c.company_name?.toLowerCase().includes(q) ||
      c.phone_number?.toLowerCase().includes(q) ||
      c.contact_type?.toLowerCase().includes(q) ||
      c.physical_address?.toLowerCase().includes(q) ||
      c.notes?.toLowerCase().includes(q)
    );
  }, [parsedContacts, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = parsedContacts.length;
    const duplicates = parsedContacts.filter(c => c.isDuplicate).length;
    const selected = parsedContacts.filter(c => c.selected).length;
    return { total, duplicates, selected };
  }, [parsedContacts]);

  // Bulk Save Execution
  const handleExecuteImport = async () => {
    const targets = parsedContacts.filter(c => c.selected);
    if (targets.length === 0) {
      toast.error('No contacts selected for import.');
      return;
    }

    setStep('importing');
    setImportProgress({ current: 0, total: targets.length });

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    // Chunk in small batches of 5 to avoid overloading
    const CHUNK_SIZE = 5;
    for (let i = 0; i < targets.length; i += CHUNK_SIZE) {
      const chunk = targets.slice(i, i + CHUNK_SIZE);

      await Promise.all(chunk.map(async (contact) => {
        try {
          const payload = {
            contact_type: contact.contact_type || 'Other',
            company_name: contact.company_name ? contact.company_name.trim() : 'Unnamed Contact',
            phone_number: contact.phone_number ? contact.phone_number.trim() : '',
            physical_address: contact.physical_address ? contact.physical_address.trim() : '-',
            email: contact.email ? contact.email.trim() : '',
            notes: contact.notes ? contact.notes.trim() : '',
            google_maps_url: contact.google_maps_url ? contact.google_maps_url.trim() : '',
            designation: contact.designation ? contact.designation.trim() : '',
            created_by: currentUser?.id || 'admin'
          };

          await pb.collection('contacts').create(payload, { $autoCancel: false });
          successCount++;
        } catch (err) {
          console.error(`Failed to save contact ${contact.company_name}:`, err);
          failCount++;
          errors.push(`${contact.company_name}: ${err.message || 'Save failed'}`);
        }
      }));

      setImportProgress({ current: Math.min(i + CHUNK_SIZE, targets.length), total: targets.length });
    }

    if (successCount > 0) {
      toast.success(`🎉 Successfully imported ${successCount} contacts into directory!`);
      if (onSuccess) onSuccess();
      onClose();
    } else {
      toast.error('Failed to import contacts: ' + (errors[0] || 'Unknown error'));
      setStep('preview');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && step !== 'importing') onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-card border-border shadow-2xl rounded-2xl">
        
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-heading font-extrabold flex items-center gap-2">
                  Import Contacts from vCard (.vcf)
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px] uppercase font-bold tracking-wider">
                    Bulk
                  </Badge>
                </DialogTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Import single or multiple contacts directly from your phone, WhatsApp, Google Contacts, or iPhone.
                </p>
              </div>
            </div>
            {step !== 'importing' && (
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5">
          
          {/* STEP 1: UPLOAD / PASTE */}
          {step === 'upload' && (
            <div className="space-y-4">
              {!isPasteMode ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-3 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".vcf,.vcard,text/vcard,text/x-vcard"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="p-4 bg-primary/15 text-primary rounded-2xl group-hover:scale-110 transition-transform duration-200">
                    <UploadCloud className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground">
                      Click to choose or drag &amp; drop your .vcf file
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md">
                      Supports vCard 2.1, 3.0, and 4.0. Multiple contacts in one file will all be imported at once.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="outline" className="text-[11px] bg-background/80 font-mono text-muted-foreground">
                      Android Contacts (.vcf)
                    </Badge>
                    <Badge variant="outline" className="text-[11px] bg-background/80 font-mono text-muted-foreground">
                      iPhone / iCloud
                    </Badge>
                    <Badge variant="outline" className="text-[11px] bg-background/80 font-mono text-muted-foreground">
                      WhatsApp Cards
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">Paste raw vCard (.vcf) text below:</Label>
                    <Button variant="ghost" size="sm" onClick={() => setIsPasteMode(false)} className="text-xs text-primary">
                      Switch to File Upload
                    </Button>
                  </div>
                  <textarea
                    rows={8}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="BEGIN:VCARD&#10;VERSION:3.0&#10;FN:Ramesh Kumar&#10;TEL;CELL:+91 98490 12345&#10;ORG:Ramesh Motors&#10;END:VCARD"
                    className="w-full bg-background border border-border/80 rounded-xl p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <Button
                    onClick={() => handleProcessVCardString(pasteText, 'pasted_contacts.vcf')}
                    disabled={!pasteText.trim()}
                    className="w-full font-bold text-xs rounded-xl"
                  >
                    Parse Pasted Text
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                <span>Tip: Export all contacts from your phone app as a single .vcf file</span>
                {!isPasteMode && (
                  <button
                    type="button"
                    onClick={() => setIsPasteMode(true)}
                    className="text-primary hover:underline font-medium"
                  >
                    Or paste raw vCard text
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW & SELECTION */}
          {step === 'preview' && (
            <div className="space-y-4">
              
              {/* Stats Summary Bar */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-muted/40 rounded-xl border border-border/60">
                <div className="text-center">
                  <span className="text-[11px] text-muted-foreground font-medium block">Total in File</span>
                  <span className="text-lg font-extrabold text-foreground">{stats.total}</span>
                </div>
                <div className="text-center border-x border-border/60">
                  <span className="text-[11px] text-muted-foreground font-medium block">Ready to Import</span>
                  <span className="text-lg font-extrabold text-emerald-500">{stats.selected}</span>
                </div>
                <div className="text-center">
                  <span className="text-[11px] text-muted-foreground font-medium block">Duplicates in DB</span>
                  <span className="text-lg font-extrabold text-amber-500">{stats.duplicates}</span>
                </div>
              </div>

              {/* Controls Toolbar */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Category Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Default Category:</span>
                    <Select value={batchCategory} onValueChange={handleBatchCategoryChange}>
                      <SelectTrigger className="h-8 text-xs w-44 rounded-lg bg-background">
                        <SelectValue placeholder="Auto-Detect" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="auto">✨ Keep Auto-Detected</SelectItem>
                        {ALL_CONTACT_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Skip Duplicates Toggle */}
                  <label className="flex items-center gap-2 text-xs cursor-pointer select-none ml-2">
                    <Checkbox
                      checked={skipDuplicates}
                      onCheckedChange={handleToggleSkipDuplicates}
                    />
                    <span className="text-muted-foreground">Skip existing duplicates ({stats.duplicates})</span>
                  </label>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filter preview list..."
                    className="h-8 pl-8 text-xs rounded-lg bg-background"
                  />
                </div>
              </div>

              {/* Batch Select Controls */}
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleSelectAll(true)}
                    className="h-7 text-xs px-2 text-primary hover:text-primary"
                  >
                    Select All
                  </Button>
                  <span>•</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleSelectAll(false)}
                    className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                  >
                    Deselect All
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setStep('upload'); setParsedContacts([]); }}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Change File
                </Button>
              </div>

              {/* Contacts Table List */}
              <div className="border border-border/80 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-bold sticky top-0 z-10 border-b border-border/80 backdrop-blur">
                    <tr>
                      <th className="p-2.5 w-10 text-center">#</th>
                      <th className="p-2.5">Contact Name &amp; Info</th>
                      <th className="p-2.5">Phone Number</th>
                      <th className="p-2.5 w-40">Category</th>
                      <th className="p-2.5 w-24 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {visibleContacts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-muted-foreground">
                          No contacts matching your filter.
                        </td>
                      </tr>
                    ) : (
                      visibleContacts.map((c, idx) => (
                        <tr
                          key={c.id || idx}
                          className={`hover:bg-muted/30 transition-colors ${c.selected ? 'bg-primary/[0.03]' : 'opacity-60'}`}
                        >
                          <td className="p-2.5 text-center">
                            <Checkbox
                              checked={c.selected}
                              onCheckedChange={(checked) => {
                                setParsedContacts(prev => prev.map(item => item.id === c.id ? { ...item, selected: checked } : item));
                              }}
                            />
                          </td>
                          <td className="p-2.5">
                            <div className="font-bold text-foreground">{c.company_name}</div>
                            {c.designation && (
                              <div className="text-[11px] text-muted-foreground">{c.designation}</div>
                            )}
                            {c.physical_address && c.physical_address !== '-' && (
                              <div className="text-[10px] text-muted-foreground truncate max-w-xs flex items-center gap-1 mt-0.5">
                                <MapPin className="w-2.5 h-2.5 shrink-0" /> {c.physical_address}
                              </div>
                            )}
                          </td>
                          <td className="p-2.5">
                            <div className="font-mono text-foreground font-medium">{c.phone_number || <span className="text-muted-foreground italic">No phone</span>}</div>
                            {c.alternate_phone && (
                              <div className="text-[10px] text-muted-foreground font-mono">Alt: {c.alternate_phone}</div>
                            )}
                          </td>
                          <td className="p-2.5">
                            <Select
                              value={c.contact_type}
                              onValueChange={(val) => {
                                setParsedContacts(prev => prev.map(item => item.id === c.id ? { ...item, contact_type: val } : item));
                              }}
                            >
                              <SelectTrigger className="h-7 text-[11px] rounded bg-background w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-56">
                                {ALL_CONTACT_CATEGORIES.map(cat => (
                                  <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2.5 text-right">
                            {c.isDuplicate ? (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] font-bold">
                                Duplicate
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] font-bold">
                                New
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* STEP 3: IMPORTING PROGRESS */}
          {step === 'importing' && (
            <div className="py-12 px-6 text-center space-y-5">
              <div className="p-4 bg-primary/10 text-primary rounded-full w-16 h-16 mx-auto flex items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Importing Contacts into Directory...
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Saving {importProgress.current} of {importProgress.total} contacts. Please do not close this window.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto bg-muted rounded-full h-3 overflow-hidden border border-border">
                <div
                  className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%` }}
                />
              </div>

              <div className="text-xs font-mono text-muted-foreground">
                {Math.round(importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0)}% completed
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <DialogFooter className="p-4 sm:p-5 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {step === 'preview' && (
              <span>Selected <strong>{stats.selected}</strong> of {stats.total} contacts to import</span>
            )}
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {step !== 'importing' && (
              <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-bold">
                Cancel
              </Button>
            )}
            {step === 'preview' && (
              <Button
                onClick={handleExecuteImport}
                disabled={stats.selected === 0}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-md px-5 flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Import {stats.selected} Contacts
              </Button>
            )}
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
