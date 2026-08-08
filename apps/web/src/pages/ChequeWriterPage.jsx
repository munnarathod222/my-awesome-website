import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Printer, Download, FileText, Sparkles, Building2, Copy, Send, 
  Check, RefreshCw, Layers, ShieldCheck, Mail, Phone, Globe, User,
  FileCheck, Edit3, Sliders, Save, Bookmark, Trash2, Plus, ArrowLeft,
  CreditCard, Layout, HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useCompanyProfile } from '@/lib/companyProfile.js';
import pb from '@/lib/pocketbaseClient.js';

// Number to Words converter helper
const convertNumberToWords = (num) => {
  if (!num || isNaN(num) || num <= 0) return '';
  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const double = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const formatTens = (n) => {
    if (n < 20) return single[n];
    return double[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + single[n % 10] : '');
  };

  const formatHundreds = (n) => {
    let str = '';
    if (Math.floor(n / 100) > 0) {
      str += single[Math.floor(n / 100)] + ' Hundred';
    }
    if (n % 100 > 0) {
      str += (str ? ' ' : '') + formatTens(n % 100);
    }
    return str;
  };

  let rupeeVal = Math.floor(num);
  let words = '';

  if (Math.floor(rupeeVal / 10000000) > 0) {
    words += formatHundreds(Math.floor(rupeeVal / 10000000)) + ' Crore ';
    rupeeVal %= 10000000;
  }
  if (Math.floor(rupeeVal / 100000) > 0) {
    words += formatHundreds(Math.floor(rupeeVal / 100000)) + ' Lakh ';
    rupeeVal %= 100000;
  }
  if (Math.floor(rupeeVal / 1000) > 0) {
    words += formatHundreds(Math.floor(rupeeVal / 1000)) + ' Thousand ';
    rupeeVal %= 1000;
  }
  if (Math.floor(rupeeVal / 100) > 0) {
    words += formatHundreds(Math.floor(rupeeVal / 100)) + ' Hundred ';
    rupeeVal %= 100;
  }
  if (rupeeVal > 0) {
    words += (words ? ' ' : '') + formatTens(rupeeVal);
  }

  return words ? '*** ' + words.trim() + ' Rupees Only ***' : '';
};

// Bank-wise CTS check print presets
const BANK_PRESETS = {
  hdfc: {
    name: 'HDFC Bank',
    theme: {
      color: 'blue',
      bgColor: 'from-slate-100 via-[#e0f2fe] to-slate-50 border-sky-200/50',
      logoChar: 'H',
      logoBg: 'bg-blue-900',
      bankName: 'HDFC BANK LTD',
      subtitle: 'CTS-2010 COMPLIANT BRANCH • INDIA'
    },
    offsets: {
      dateTop: 8,
      dateLeft: 154,
      payeeTop: 24,
      payeeLeft: 20,
      wordsTop: 32,
      wordsLeft: 24,
      amountTop: 42,
      amountLeft: 152,
      stampTop: 54,
      stampLeft: 140
    }
  },
  sbi: {
    name: 'State Bank of India (SBI)',
    theme: {
      color: 'sky',
      bgColor: 'from-slate-50 via-[#ecfeff] to-slate-50 border-cyan-200/50',
      logoChar: 'S',
      logoBg: 'bg-cyan-600',
      bankName: 'STATE BANK OF INDIA',
      subtitle: 'CTS-2010 COMPLIANT • SECUNDERABAD BRANCH'
    },
    offsets: {
      dateTop: 10,
      dateLeft: 152,
      payeeTop: 22,
      payeeLeft: 22,
      wordsTop: 31,
      wordsLeft: 25,
      amountTop: 41,
      amountLeft: 146,
      stampTop: 55,
      stampLeft: 135
    }
  },
  icici: {
    name: 'ICICI Bank',
    theme: {
      color: 'amber',
      bgColor: 'from-slate-100 via-[#fffbeb] to-slate-50 border-amber-200/50',
      logoChar: 'I',
      logoBg: 'bg-amber-800',
      bankName: 'ICICI BANK LTD',
      subtitle: 'CTS-2010 COMPLIANT • CORPORATE OFFICE'
    },
    offsets: {
      dateTop: 9,
      dateLeft: 156,
      payeeTop: 25,
      payeeLeft: 24,
      wordsTop: 34,
      wordsLeft: 28,
      amountTop: 44,
      amountLeft: 150,
      stampTop: 56,
      stampLeft: 142
    }
  },
  axis: {
    name: 'Axis Bank',
    theme: {
      color: 'rose',
      bgColor: 'from-slate-100 via-[#fff1f2] to-slate-50 border-rose-200/50',
      logoChar: 'A',
      logoBg: 'bg-rose-900',
      bankName: 'AXIS BANK LTD',
      subtitle: 'CTS-2010 COMPLIANT • GHATKESAR BRANCH'
    },
    offsets: {
      dateTop: 8,
      dateLeft: 153,
      payeeTop: 23,
      payeeLeft: 18,
      wordsTop: 30,
      wordsLeft: 22,
      amountTop: 42,
      amountLeft: 147,
      stampTop: 53,
      stampLeft: 138
    }
  },
  custom: {
    name: 'Custom Calibration',
    theme: {
      color: 'slate',
      bgColor: 'from-slate-100 via-slate-200/50 to-slate-50 border-slate-300/50',
      logoChar: 'C',
      logoBg: 'bg-slate-800',
      bankName: 'CUSTOM CHEQUE WRITER',
      subtitle: 'MANUAL ALIGNMENT CALIBRATION'
    },
    offsets: null
  }
};

export default function ChequeWriterPage({ embedMode = false }) {
  const companyProfile = useCompanyProfile();
  
  const [selectedBank, setSelectedBank] = useState('hdfc');
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [amountWords, setAmountWords] = useState('');
  const [chequeDate, setChequeDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [signatoryName, setSignatoryName] = useState(companyProfile?.signatory_name || 'Vinod kumar Rathod');
  const [signatoryTitle, setSignatoryTitle] = useState(companyProfile?.signatory_title || 'Proprietor');
  
  // Custom Display & Print configurations
  const [includeBearer, setIncludeBearer] = useState(true);
  const [includeStamp, setIncludeStamp] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [crossedAccountPayee, setCrossedAccountPayee] = useState(true);
  const [showChequeBackground, setShowChequeBackground] = useState(true);
  const [printChequeNumber, setPrintChequeNumber] = useState(false);
  const [chequeNumber, setChequeNumber] = useState('000012');

  // Print Offset Adjustment Configurations (fine-tuning coordinates in millimetres)
  const [dateTop, setDateTop] = useState(8);
  const [dateLeft, setDateLeft] = useState(154);
  const [payeeTop, setPayeeTop] = useState(24);
  const [payeeLeft, setPayeeLeft] = useState(20);
  const [wordsTop, setWordsTop] = useState(32);
  const [wordsLeft, setWordsLeft] = useState(24);
  const [amountTop, setAmountTop] = useState(42);
  const [amountLeft, setAmountLeft] = useState(152);
  const [stampTop, setStampTop] = useState(54);
  const [stampLeft, setStampLeft] = useState(140);

  // Template States
  const [savedCheques, setSavedCheques] = useState([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [chequeTitleInput, setChequeTitleInput] = useState('');

  const handleBankPresetChange = (bankKey) => {
    setSelectedBank(bankKey);
    const preset = BANK_PRESETS[bankKey];
    if (preset && preset.offsets) {
      setDateTop(preset.offsets.dateTop);
      setDateLeft(preset.offsets.dateLeft);
      setPayeeTop(preset.offsets.payeeTop);
      setPayeeLeft(preset.offsets.payeeLeft);
      setWordsTop(preset.offsets.wordsTop);
      setWordsLeft(preset.offsets.wordsLeft);
      setAmountTop(preset.offsets.amountTop);
      setAmountLeft(preset.offsets.amountLeft);
      setStampTop(preset.offsets.stampTop);
      setStampLeft(preset.offsets.stampLeft);
      toast.success(`Loaded offsets for ${preset.name}`);
    }
  };

  const handleOffsetChange = (setter, val) => {
    setter(val);
    setSelectedBank('custom');
  };

  useEffect(() => {
    if (companyProfile) {
      if (companyProfile.signatory_name) setSignatoryName(companyProfile.signatory_name);
      if (companyProfile.signatory_title) setSignatoryTitle(companyProfile.signatory_title);
    }
  }, [companyProfile]);

  // Handle auto-conversion of number to words when amount changes
  useEffect(() => {
    const num = parseFloat(amount);
    if (!isNaN(num) && num > 0) {
      setAmountWords(convertNumberToWords(num));
    } else {
      setAmountWords('');
    }
  }, [amount]);

  // Load saved cheques from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jbc_saved_cheques');
      if (saved) {
        setSavedCheques(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load saved cheques:', e);
    }
  }, []);

  const handleSaveCheque = () => {
    if (!chequeTitleInput.trim()) {
      toast.error('Please enter a template title');
      return;
    }
    const newCheque = {
      id: Date.now().toString(),
      title: chequeTitleInput,
      payee,
      amount,
      amountWords,
      crossedAccountPayee,
      includeBearer,
      includeStamp,
      chequeNumber
    };
    const updated = [newCheque, ...savedCheques];
    setSavedCheques(updated);
    localStorage.setItem('jbc_saved_cheques', JSON.stringify(updated));
    setIsSaveModalOpen(false);
    setChequeTitleInput('');
    toast.success('Cheque template saved successfully!');
  };

  const handleLoadCheque = (tpl) => {
    setPayee(tpl.payee || '');
    setAmount(tpl.amount || '');
    if (tpl.amountWords) setAmountWords(tpl.amountWords);
    setCrossedAccountPayee(tpl.crossedAccountPayee !== undefined ? tpl.crossedAccountPayee : true);
    setIncludeBearer(tpl.includeBearer !== undefined ? tpl.includeBearer : true);
    setIncludeStamp(tpl.includeStamp !== undefined ? tpl.includeStamp : true);
    if (tpl.chequeNumber) setChequeNumber(tpl.chequeNumber);
    toast.success(`Loaded cheque: ${tpl.title}`);
  };

  const handleDeleteCheque = (id, e) => {
    e.stopPropagation();
    const updated = savedCheques.filter(c => c.id !== id);
    setSavedCheques(updated);
    localStorage.setItem('jbc_saved_cheques', JSON.stringify(updated));
    toast.success('Cheque template deleted');
  };

  const handlePrint = () => {
    if (!payee.trim()) {
      toast.error('Please enter Payee Name');
      return;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid Cheque Amount');
      return;
    }
    window.print();
  };

  // Convert Date String to array of individual digits e.g. "2026-08-08" -> ["0", "8", "0", "8", "2", "0", "2", "6"]
  const getChequeDateDigits = () => {
    if (!chequeDate) return Array(8).fill('');
    const parts = chequeDate.split('-'); // [YYYY, MM, DD]
    if (parts.length !== 3) return Array(8).fill('');
    const dd = parts[2];
    const mm = parts[1];
    const yyyy = parts[0];
    const fullStr = dd + mm + yyyy; // "DDMMYYYY"
    return fullStr.split('');
  };

  const dateDigits = getChequeDateDigits();
  const bankTheme = BANK_PRESETS[selectedBank]?.theme || BANK_PRESETS.hdfc.theme;

  return (
    <div className={"min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans " + (embedMode ? "min-h-0 bg-transparent p-0 pb-12" : "")}>
      <Helmet>
        <title>Official Cheque Printing Studio | Jai Bhavani Cargo</title>
        <meta name="description" content="Official CTS-2010 Cheque writing and alignment calibration studio for printing onto physical bank check leaves." />
      </Helmet>

      {/* CSS Styles for exact cheque print alignment */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #cheque-print-canvas, #cheque-print-canvas * {
            visibility: visible;
          }
          #cheque-print-canvas {
            position: absolute;
            left: 0;
            top: 0;
            width: 203mm !important;
            height: 90mm !important;
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide virtual bank backgrounds & borders on actual print */
          .print-hidden-bg {
            background-image: none !important;
            background-color: transparent !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Studio Header */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            Official Cheque Writer & Printer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Write, auto-convert amount to words, and align coordinates for printing onto physical bank cheque leaves.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setIsSaveModalOpen(true)}
            variant="outline"
            className="rounded-xl text-xs font-bold border-slate-700 bg-slate-900 hover:bg-slate-800"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Save Template
          </Button>

          <Button
            onClick={handlePrint}
            className="rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 shadow-lg shadow-amber-500/20"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print Cheque Leaf
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── LEFT COLUMN: CHEQUE BUILDER CONTROLS ──────────────────────── */}
        <div className="no-print lg:col-span-5 space-y-6">
          
          {/* Quick Loading Presets */}
          {savedCheques.length > 0 && (
            <Card className="bg-slate-900/90 border-slate-800 rounded-3xl p-4 shadow-xl">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                Saved Cheque Templates
              </h3>
              <div className="max-h-36 overflow-y-auto space-y-2 scrollbar-thin">
                {savedCheques.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleLoadCheque(c)}
                    className="flex justify-between items-center bg-slate-950 hover:bg-slate-850 p-2.5 rounded-xl border border-slate-800 cursor-pointer transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200">{c.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Rs. {Number(c.amount).toLocaleString('en-IN')}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteCheque(c.id, e)}
                      className="h-7 w-7 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Core Input Settings Form */}
          <Card className="bg-slate-900/90 border-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-800 bg-slate-950 p-4">
              <CardTitle className="text-sm font-extrabold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#d2b48c]" />
                Cheque details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              
              {/* Bank Preset Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300">Select Bank Cheque Format Preset</Label>
                <Select value={selectedBank} onValueChange={handleBankPresetChange}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl font-bold h-10">
                    <SelectValue placeholder="Select bank format" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-850 text-white rounded-xl">
                    <SelectItem value="hdfc">HDFC Bank</SelectItem>
                    <SelectItem value="sbi">State Bank of India (SBI)</SelectItem>
                    <SelectItem value="icici">ICICI Bank</SelectItem>
                    <SelectItem value="axis">Axis Bank</SelectItem>
                    <SelectItem value="custom">Custom Alignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payee Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300">Payee Name (Beneficiary)</Label>
                <Input
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  placeholder="e.g. Vinod Kumar Rathod"
                  className="bg-slate-950 border-slate-800 rounded-xl text-white font-bold h-10 placeholder:text-slate-600 focus-visible:ring-amber-500/40"
                />
              </div>

              {/* Amount (Numbers) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Amount in Numbers (Rs.)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 150000"
                    className="bg-slate-950 border-slate-800 rounded-xl text-white font-black h-10 placeholder:text-slate-600 focus-visible:ring-amber-500/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Cheque Date</Label>
                  <Input
                    type="date"
                    value={chequeDate}
                    onChange={(e) => setChequeDate(e.target.value)}
                    className="bg-slate-950 border-slate-800 rounded-xl text-white font-bold h-10 focus-visible:ring-amber-500/40"
                  />
                </div>
              </div>

              {/* Auto Generated Words */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 flex justify-between items-center">
                  <span>Amount in Words</span>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider font-sans">Rupee Auto-Convert</span>
                </Label>
                <Input
                  value={amountWords}
                  onChange={(e) => setAmountWords(e.target.value)}
                  placeholder="Amount in words will auto-generate..."
                  className="bg-slate-950 border-slate-800 rounded-xl text-slate-300 font-bold text-xs h-10 placeholder:text-slate-650"
                />
              </div>

              {/* Toggles bar */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-slate-300">Account Payee Crossing</Label>
                    <p className="text-[10px] text-slate-400 leading-none">Cross two parallel lines for secure deposit</p>
                  </div>
                  <Switch checked={crossedAccountPayee} onCheckedChange={setCrossedAccountPayee} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-slate-300">Or Bearer option</Label>
                    <p className="text-[10px] text-slate-400 leading-none">Keep 'Or Bearer' printable on cheque</p>
                  </div>
                  <Switch checked={includeBearer} onCheckedChange={setIncludeBearer} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-slate-300">Digital Signature</Label>
                    <p className="text-[10px] text-slate-400 leading-none">Print digital e-signature on check leaf</p>
                  </div>
                  <Switch checked={includeSignature} onCheckedChange={setIncludeSignature} />
                </div>



                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-slate-300">Preview Cheque Background</Label>
                    <p className="text-[10px] text-slate-400 leading-none">Show bank check design (Screen view only)</p>
                  </div>
                  <Switch checked={showChequeBackground} onCheckedChange={setShowChequeBackground} />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* ── ALIGNMENT OFFSET SLIDERS ──────────────────────── */}
          <Card className="bg-slate-900/90 border-slate-800 rounded-3xl shadow-xl">
            <CardHeader className="border-b border-slate-800 bg-slate-950 p-4 flex flex-row justify-between items-center">
              <CardTitle className="text-sm font-extrabold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Printer Offset Calibration (mm)
              </CardTitle>
              <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold uppercase">Fine-Tune</Badge>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <p className="text-[10px] text-slate-400 leading-normal bg-amber-500/5 p-3 border border-amber-550/10 rounded-2xl">
                ⚠️ Feed a dummy blank paper cut to check size (8 x 3.5 inches) first to verify alignment coordinates. Use these offset sliders to match your bank's line spacings exactly.
              </p>

              {/* Payee Alignment */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Payee Name Offset</span>
                  <span className="text-amber-400 font-mono">T: {payeeTop}mm | L: {payeeLeft}mm</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Top Margin</span>
                    <Slider min={0} max={90} step={1} value={[payeeTop]} onValueChange={([val]) => handleOffsetChange(setPayeeTop, val)} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Left Margin</span>
                    <Slider min={0} max={180} step={1} value={[payeeLeft]} onValueChange={([val]) => handleOffsetChange(setPayeeLeft, val)} />
                  </div>
                </div>
              </div>

              {/* Amount Words Alignment */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Rupees in Words Offset</span>
                  <span className="text-amber-400 font-mono">T: {wordsTop}mm | L: {wordsLeft}mm</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Top Margin</span>
                    <Slider min={0} max={90} step={1} value={[wordsTop]} onValueChange={([val]) => handleOffsetChange(setWordsTop, val)} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Left Margin</span>
                    <Slider min={0} max={180} step={1} value={[wordsLeft]} onValueChange={([val]) => handleOffsetChange(setWordsLeft, val)} />
                  </div>
                </div>
              </div>

              {/* Amount Numbers Alignment */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Rupees Box (Numeric) Offset</span>
                  <span className="text-amber-400 font-mono">T: {amountTop}mm | L: {amountLeft}mm</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Top Margin</span>
                    <Slider min={0} max={90} step={1} value={[amountTop]} onValueChange={([val]) => handleOffsetChange(setAmountTop, val)} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Left Margin</span>
                    <Slider min={0} max={180} step={1} value={[amountLeft]} onValueChange={([val]) => handleOffsetChange(setAmountLeft, val)} />
                  </div>
                </div>
              </div>

              {/* Date Alignment */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Date Digit Blocks Offset</span>
                  <span className="text-amber-400 font-mono">T: {dateTop}mm | L: {dateLeft}mm</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Top Margin</span>
                    <Slider min={0} max={90} step={1} value={[dateTop]} onValueChange={([val]) => handleOffsetChange(setDateTop, val)} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Left Margin</span>
                    <Slider min={0} max={180} step={1} value={[dateLeft]} onValueChange={([val]) => handleOffsetChange(setDateLeft, val)} />
                  </div>
                </div>
              </div>

              {/* Signatory Stamp Alignment */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Signature Stamp Offset</span>
                  <span className="text-amber-400 font-mono">T: {stampTop}mm | L: {stampLeft}mm</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Top Margin</span>
                    <Slider min={0} max={90} step={1} value={[stampTop]} onValueChange={([val]) => handleOffsetChange(setStampTop, val)} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Left Margin</span>
                    <Slider min={0} max={180} step={1} value={[stampLeft]} onValueChange={([val]) => handleOffsetChange(setStampLeft, val)} />
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

        {/* ── RIGHT COLUMN: CHEQUE CANVAS PREVIEW (PRINT AREA) ────────────────── */}
        <div className="lg:col-span-7 flex flex-col items-center w-full min-w-0">
          
          <div className="no-print w-full flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="font-extrabold flex items-center gap-1"><Layout className="w-3.5 h-3.5 text-amber-400" /> LIVE CHEQUE WRITER LEAF (PRINT PREVIEW)</span>
            <span className="font-mono text-[10px]">Actual Size: 203mm x 90mm</span>
          </div>

          {/* Overflow wrapper to prevent grid blowout on smaller viewports */}
          <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
            {/* Virtual CTS Cheque Canvas Leaf */}
            <div 
              id="cheque-print-canvas"
              className={`mx-auto w-[203mm] h-[90mm] min-w-[203mm] min-h-[90mm] bg-card rounded-2xl relative shadow-2xl overflow-hidden border border-slate-800 transition-all ${
                showChequeBackground 
                  ? `bg-gradient-to-tr ${bankTheme.bgColor}` 
                  : 'bg-white border-slate-300 print-hidden-bg'
              }`}
            >
            {/* Visual Bank Check design details (Only screen visible) */}
            {showChequeBackground && (
              <div className="no-print absolute inset-0 select-none pointer-events-none">
                {/* Background security patterns */}
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#0369a1 2px, transparent 2px)', backgroundSize: '12px 12px' }} />
                
                {/* Bank Branding Placeholder Header */}
                <div className="absolute top-4 left-[32mm] flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded ${bankTheme.logoBg} flex items-center justify-center text-white font-black text-sm`}>
                    {bankTheme.logoChar}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-blue-950 uppercase tracking-tighter leading-none">
                      {bankTheme.bankName}
                    </h4>
                    <p className="text-[7.5px] text-blue-700/80 tracking-wider font-semibold uppercase mt-0.5">
                      {bankTheme.subtitle}
                    </p>
                  </div>
                </div>

                {/* Account Payee Crossing (Top Left) */}
                {crossedAccountPayee && (
                  <div className="absolute top-2 left-6 border-b border-t border-slate-700/80 py-0.5 px-3 transform -rotate-12 text-[7.5px] font-black text-slate-800 tracking-wider font-mono">
                    A/C PAYEE ONLY
                  </div>
                )}

                {/* Date digit blocks grid (Top Right) */}
                <div className="absolute top-4 right-6 flex flex-col items-end gap-1">
                  <span className="text-[7.5px] text-blue-955 font-bold tracking-wider uppercase font-sans">Date</span>
                  <div className="grid grid-cols-8 gap-0.5">
                    {Array(8).fill('').map((_, i) => (
                      <div key={i} className="w-[4.2mm] h-[5mm] border border-blue-450/40 bg-white/40 flex items-center justify-center text-[7.5px] text-blue-700 font-bold" />
                    ))}
                  </div>
                  <div className="grid grid-cols-8 gap-0.5 w-[37mm] text-center text-[6px] text-blue-800/80 font-bold font-mono">
                    <span>D</span><span>D</span><span>M</span><span>M</span><span>Y</span><span>Y</span><span>Y</span><span>Y</span>
                  </div>
                </div>

                {/* Lines */}
                {/* Payee Line */}
                <div className="absolute top-[28mm] left-6 text-[10px] font-bold text-slate-700/90 w-[140mm] border-b border-dashed border-slate-300 pb-0.5">
                  PAY <span className="opacity-0">NAME HERE</span>
                </div>
                {!includeBearer && (
                  <div className="absolute top-[28mm] left-[150mm] text-[9.5px] font-black text-slate-400 line-through">
                    OR BEARER
                  </div>
                )}
                {includeBearer && (
                  <div className="absolute top-[28mm] left-[150mm] text-[9.5px] font-black text-slate-500">
                    OR BEARER
                  </div>
                )}

                {/* Rupees words line 1 */}
                <div className="absolute top-[37.5mm] left-6 text-[10px] font-bold text-slate-700/90 w-[140mm] border-b border-dashed border-slate-300 pb-0.5">
                  RUPEES
                </div>
                
                {/* Rupees box (Numeric) */}
                <div className="absolute top-[44mm] right-6 w-[42mm] h-[9mm] border-2 border-blue-900/40 bg-blue-50/20 rounded flex items-center px-2">
                  <span className="text-[13px] font-black text-blue-950 font-sans">Rs.</span>
                  <div className="flex-1 border-l border-blue-900/20 ml-2" />
                </div>

                {/* Signature text bottom right */}
                {!includeStamp && (
                  <div className="absolute bottom-5 right-6 text-center w-[50mm]">
                    <p className="text-[8px] font-bold text-slate-500 uppercase leading-none">For JAI BHAVANI CARGO</p>
                    <div className="h-7" />
                    <p className="text-[8.5px] font-black text-slate-800 uppercase tracking-wider">{signatoryTitle}</p>
                  </div>
                )}

                {/* Account Number Box (middle-left) */}
                <div className="absolute top-[49mm] left-6 flex items-center border border-slate-400/50 bg-white/30 rounded px-2 py-0.5 font-mono text-[9px] text-slate-800 font-bold">
                  A/c No: <span className="ml-2 tracking-widest text-[10px] text-black">50200117182677</span>
                </div>

                {/* MICR Cheque code bottom bar */}
                <div className="absolute bottom-1.5 left-0 right-0 text-center font-mono text-[10.5px] text-slate-700 font-medium tracking-widest uppercase">
                  ⑈ {chequeNumber} ⑈  500240012 ⑆  002511 ⑈  10
                </div>
              </div>
            )}

            {/* ── PRINT-STAGED TEXT LAYER (THIS ALIGNS ON PRINTING WITH MM OFFSETS) ── */}
            
            {/* Crossed Lines (Top Left) */}
            {crossedAccountPayee && (
              <div 
                className="absolute border-b-2 border-t-2 border-blue-900/90 py-0.5 px-3 transform -rotate-12 text-[8px] font-black text-blue-900 tracking-wider font-mono bg-white/20 select-none"
                style={{ top: `${dateTop + 1}mm`, left: '8mm' }}
              >
                A/C PAYEE ONLY
              </div>
            )}

            {/* Date digit characters */}
            <div 
              className="absolute flex gap-[1.3mm] font-mono text-[13px] font-extrabold text-blue-950 select-all"
              style={{ top: `${dateTop}mm`, left: `${dateLeft}mm` }}
            >
              {dateDigits.map((digit, idx) => (
                <span key={idx} className="w-[3.4mm] text-center">{digit}</span>
              ))}
            </div>

            {/* Payee Name */}
            <div 
              className="absolute font-sans text-[12px] font-black text-blue-950 uppercase select-all"
              style={{ top: `${payeeTop}mm`, left: `${payeeLeft}mm` }}
            >
              {payee}
            </div>

            {/* Rupees in Words */}
            <div 
              className="absolute font-sans text-[10px] font-black text-blue-950 leading-[5.2mm] uppercase max-w-[130mm] select-all"
              style={{ top: `${wordsTop}mm`, left: `${wordsLeft}mm` }}
            >
              {amountWords}
            </div>

            {/* Rupees in Numbers (Box) */}
            <div 
              className="absolute font-sans text-[13px] font-black text-blue-950 tracking-wider select-all"
              style={{ top: `${amountTop}mm`, left: `${amountLeft}mm` }}
            >
              {amount ? `** ${Number(amount).toLocaleString('en-IN')}/- **` : ''}
            </div>

            {/* E-Signature / Signatory Block */}
            {includeSignature && (
              <div 
                className="absolute select-none pointer-events-none flex flex-col items-end"
                style={{ top: `${stampTop}mm`, left: `${stampLeft}mm` }}
              >
                {companyProfile?.e_signature ? (
                  <img src={companyProfile.e_signature} className="max-h-16 object-contain mix-blend-multiply filter brightness-95" alt="Signature" />
                ) : (
                  <div className="flex flex-col items-center text-center font-sans">
                    <span className="text-[8px] font-bold text-slate-500 uppercase leading-none">For JAI BHAVANI CARGO</span>
                    <span className="font-serif italic text-blue-955/80 text-[11px] tracking-widest leading-none pt-1">
                      {signatoryName}
                    </span>
                    <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{signatoryTitle}</span>
                  </div>
                )}
              </div>
            )}

            {/* Virtual Cheque/MICR number at bottom (Optional Print) */}
            {printChequeNumber && (
              <div 
                className="absolute bottom-1.5 left-0 right-0 text-center font-mono text-[10.5px] text-blue-955 font-bold tracking-widest"
              >
                ⑈ {chequeNumber} ⑈
              </div>
            )}

            </div>
          </div>

          <div className="no-print mt-6 bg-slate-900/40 p-4 border border-slate-800 rounded-3xl w-full max-w-[203mm] text-xs space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5"><HelpCircle className="w-4 h-4 text-blue-400" /> Print Alignment Instructions</h4>
            <ul className="list-disc pl-4 text-slate-400 space-y-1">
              <li>Open your printer tray and feed the blank cheque leaf (usually short-edge first or landscape depending on printer feeding guidelines).</li>
              <li>Toggle <strong className="text-slate-300">Preview Cheque Background</strong> off while printing so that background templates are not printed onto the actual leaf.</li>
              <li>Use the calibration sliders in the left panel to move the text blocks (Payee, Words, Numbers, Date, Stamp) by millimetres to line up exactly on the pre-ruled lines of the cheque.</li>
            </ul>
          </div>

        </div>

      </div>

      {/* ── MODAL: SAVE CHEQUE TEMPLATE ──────────────────────── */}
      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent className="sm:max-w-md bg-slate-950 border-slate-850 text-slate-100 rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="pb-3 border-b border-slate-800">
            <DialogTitle className="text-lg font-black text-amber-400 flex items-center gap-2">
              <Save className="w-5 h-5 text-amber-400" />
              Save Cheque Template
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Save payee, amount, bearer options, and alignment offsets for quick recovery in the future.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 font-bold text-xs">Template Title *</Label>
              <Input
                required
                value={chequeTitleInput}
                onChange={(e) => setChequeTitleInput(e.target.value)}
                placeholder="e.g. Driver Salary - Ram Singh"
                className="bg-slate-900 border-slate-800 text-white rounded-xl font-bold text-xs h-10"
              />
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5 text-xs text-slate-400">
              <p className="font-bold text-slate-300">Template Summary:</p>
              <p>• Payee: <span className="text-white font-semibold">{payee || 'None'}</span></p>
              <p>• Amount: <span className="text-amber-300 font-semibold">Rs. {amount ? Number(amount).toLocaleString('en-IN') : '0'}</span></p>
              <p>• Crossing: <span className="text-blue-300 font-semibold">{crossedAccountPayee ? 'Account Payee' : 'Normal'}</span></p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSaveModalOpen(false)}
              className="rounded-xl border-slate-700 text-slate-300 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveCheque}
              className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4"
            >
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
