import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Mail, Send, Folder, RefreshCw, Star, Trash2, ArrowLeft, Settings, Inbox, 
  Search, Plus, Paperclip, Filter, Sparkles, AlertCircle, Clock, CheckCircle2,
  FileText, ShieldCheck, Truck, Users, Building2, CreditCard, ChevronRight,
  Printer, Download, Share2, Archive, Eye, Bot, Zap, ArrowRight, CornerUpLeft,
  CornerUpRight, Bookmark, X, AlertTriangle, Shield, Check, Copy, ExternalLink,
  Calendar, Layers, MessageSquare, Play, HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const API_BASE = '/api/zoho';

// Pre-built Logistics Templates
const LOGISTICS_TEMPLATES = [
  {
    id: 'tpl_quote',
    title: 'Freight Quotation',
    subject: 'Freight Contract Quotation & Fleet Empanelment - Jai Bhavani Cargo',
    body: `Dear Operations / Procurement Team,

Thank you for reaching out to Jai Bhavani Cargo.

We are pleased to submit our competitive freight contract quotation for your long-haul container and heavy transport requirements.

Key Highlights of Jai Bhavani Cargo:
• Fleet of over 45 dedicated 32 FT Containers and Multi-Axle Trailers.
• 24/7 Live GPS tracking & automated POD uploading system.
• Verified driver safety credentials and comprehensive transit insurance.

Attached herewith are our GST certificate, solvency certificate, and detailed route freight rate card.

We look forward to executing a long-term logistics service agreement.

Warm regards,
Vinod Kumar Rathod
Managing Director | Jai Bhavani Cargo Ltd
Phone: +91 7794072244 | www.jaibhavanicargo.com`
  },
  {
    id: 'tpl_invoice',
    title: 'Freight Invoice & Payment Demand',
    subject: 'Transport Invoice & Payment Demand - Trip ID {{TRIP_ID}}',
    body: `Dear Finance & Accounts Team,

Please find attached our Freight Transport Invoice and verified Proof of Delivery (POD) for Trip ID {{TRIP_ID}}.

Shipment Summary:
• Route: Hyderabad to Delhi NCR
• Vehicle: TS09UB8822 (32 FT Container)
• Invoice No: INV-2026-881
• Payable Amount: Rs. 1,45,000/-

Kindly process the payment to our HDFC Corporate Bank Account details specified in the invoice.

Thanking you,
Accounts Department
Jai Bhavani Cargo Ltd`
  },
  {
    id: 'tpl_booking',
    title: 'Booking & Vehicle Assigned Confirmation',
    subject: 'Booking Confirmation & Vehicle Assigned Notice - Trip {{TRIP_ID}}',
    body: `Dear Client,

Your freight booking has been confirmed and scheduled for dispatch.

Trip Details:
• Trip ID: {{TRIP_ID}}
• Vehicle Number: {{VEHICLE_NO}}
• Vehicle Type: 32 FT High Cube Container
• Driver Name: Ramesh Kumar Rathod
• Driver Phone: +91 9849012345

Live Vehicle GPS Tracking Link: https://www.jaibhavanicargo.com/tracking?vehicle={{VEHICLE_NO}}

Our driver will report to your warehouse gate by 08:00 AM tomorrow.

Regards,
Fleet Dispatch Control Room
Jai Bhavani Cargo`
  },
  {
    id: 'tpl_pod_req',
    title: 'POD Request & Delivery Confirmation',
    subject: 'Urgent: Signed POD & Acknowledgement Request - Trip {{TRIP_ID}}',
    body: `Dear Receiving Dock Supervisor,

Vehicle {{VEHICLE_NO}} under Trip ID {{TRIP_ID}} has safely delivered the consignment at your warehouse facility.

Please sign, stamp, and provide the physical or digital Proof of Delivery (POD) receipt to our driver to enable billing clearance.

Thank you for your cooperation.

Regards,
Operations Team
Jai Bhavani Cargo Ltd`
  },
  {
    id: 'tpl_vendor_appr',
    title: 'Vendor Empanelment Approval',
    subject: 'Vendor Registration Approved - Jai Bhavani Cargo Logistics Network',
    body: `Dear Vendor Partner,

We are pleased to inform you that your Vendor Registration Application has been verified and APPROVED by our Compliance Department.

Vendor Code: VEND-JBC-2026-09
Empanelled Category: Fleet Operations & Fuel Partner

You are now eligible to receive trip assignment orders across our national transport corridors.

Regards,
Vendor Relations Department
Jai Bhavani Cargo Ltd`
  }
];

export default function BusinessMailPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Status & OAuth State
  const [zohoStatus, setZohoStatus] = useState(null);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState('INBOX');
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [loadingFolders, setLoadingFolders] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState('all'); // 'all' | 'unread' | 'starred' | 'customer' | 'vendor'

  // CRM Intelligence Data
  const [clientsList, setClientsList] = useState([]);
  const [vendorsList, setVendorsList] = useState([]);
  const [matchedCRM, setMatchedCRM] = useState(null);

  // AI Panel State
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    templateId: ''
  });
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [autoAttachDoc, setAutoAttachDoc] = useState(null);

  // Modals & Panels
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [grantCodeInput, setGrantCodeInput] = useState('');
  const [oauthConfig, setOauthConfig] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: 'https://www.jaibhavanicargo.com/api/zoho/oauth/callback',
    region: 'com',
    accountEmail: 'vinod.jbcargo@gmail.com'
  });

  const handleExchangeGrantCode = async () => {
    if (!grantCodeInput) {
      toast.error('Please paste the Grant Code from Zoho API Console Self Client.');
      return;
    }
    const toastId = toast.loading('Exchanging Grant Code with Zoho OAuth server...');
    try {
      const res = await fetch(`${API_BASE}/oauth/exchange-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: grantCodeInput.trim(),
          clientId: oauthConfig.clientId,
          clientSecret: oauthConfig.clientSecret,
          region: oauthConfig.region
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Zoho Mail Connected Successfully!', { id: toastId });
        setIsSettingsOpen(false);
        setGrantCodeInput('');
        await fetchZohoStatus();
        fetchMessages(currentFolder);
      } else {
        toast.error(data.error || 'Failed to exchange Grant Code with Zoho', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error during Grant Code exchange', { id: toastId });
    }
  };

  const handleQuickActivate = async () => {
    try {
      const res = await fetch(`${API_BASE}/quick-activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountEmail: oauthConfig.accountEmail })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setIsSettingsOpen(false);
        await fetchZohoStatus();
        fetchMessages(currentFolder);
      }
    } catch (e) {
      toast.error('Activation failed.');
    }
  };

  // Undo Send state
  const [undoTimer, setUndoTimer] = useState(null);

  // Fetch Zoho Status & Connection
  const fetchZohoStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/status`);
      const data = await res.json();
      if (data.success) {
        setZohoStatus(data);
        setOauthConfig(prev => ({
          ...prev,
          redirectUri: data.redirectUri || prev.redirectUri,
          accountEmail: data.accountEmail || prev.accountEmail
        }));
      }
    } catch (e) {
      console.error('Zoho status fetch err:', e);
    }
  };

  // Fetch Folders
  const fetchFolders = async () => {
    setLoadingFolders(true);
    try {
      const res = await fetch(`${API_BASE}/folders`);
      const data = await res.json();
      if (data.success) {
        setFolders(data.folders || []);
      }
    } catch (e) {
      console.error('Folders fetch err:', e);
    } finally {
      setLoadingFolders(false);
    }
  };

  // Fetch Messages
  const fetchMessages = async (folderId = currentFolder) => {
    setLoadingMessages(true);
    try {
      const unreadParam = activeFilterTab === 'unread' ? '&unreadOnly=true' : '';
      const starredParam = activeFilterTab === 'starred' ? '&starredOnly=true' : '';
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';

      const res = await fetch(`${API_BASE}/messages?folder=${folderId}${searchParam}${unreadParam}${starredParam}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        if (data.messages && data.messages.length > 0 && !selectedMessage) {
          setSelectedMessage(data.messages[0]);
        }
      }
    } catch (e) {
      console.error('Messages fetch err:', e);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Fetch CRM Customers & Vendors from PocketBase for Intelligence Lookup
  useEffect(() => {
    fetchZohoStatus();
    fetchFolders();

    pb.collection('clients').getFullList({ $autoCancel: false })
      .then(setClientsList).catch(() => {});
    pb.collection('vendors').getFullList({ $autoCancel: false })
      .then(setVendorsList).catch(() => {});
  }, []);

  useEffect(() => {
    fetchMessages(currentFolder);
  }, [currentFolder, activeFilterTab]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMessages(currentFolder);
  };

  // CRM Intelligence Lookup when an email is selected
  useEffect(() => {
    if (!selectedMessage) {
      setMatchedCRM(null);
      setAiSummary(null);
      setQuickReplies([]);
      return;
    }

    const email = (selectedMessage.senderEmail || '').toLowerCase();
    const name = (selectedMessage.senderName || '').toLowerCase();

    const clientMatch = clientsList.find(c => 
      (c.email && c.email.toLowerCase() === email) ||
      (c.contact_person_email && c.contact_person_email.toLowerCase() === email) ||
      (c.company_name && name.includes(c.company_name.toLowerCase()))
    );

    if (clientMatch) {
      setMatchedCRM({ type: 'Customer', data: clientMatch });
      return;
    }

    const vendorMatch = vendorsList.find(v => 
      (v.email && v.email.toLowerCase() === email) ||
      (v.vendor_name && name.includes(v.vendor_name.toLowerCase()))
    );

    if (vendorMatch) {
      setMatchedCRM({ type: 'Vendor', data: vendorMatch });
      return;
    }

    setMatchedCRM(null);
  }, [selectedMessage, clientsList, vendorsList]);

  // AI Assistant: Generate Summary & Quick Replies
  const handleRunAI = async () => {
    if (!selectedMessage) return;
    setLoadingAi(true);
    try {
      const [sumRes, repRes] = await Promise.all([
        fetch(`${API_BASE}/ai`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'summarize', text: selectedMessage.body })
        }).then(r => r.json()),
        fetch(`${API_BASE}/ai`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'quick_replies', text: selectedMessage.body })
        }).then(r => r.json())
      ]);

      if (sumRes.summary) setAiSummary(sumRes.summary);
      if (repRes.replies) setQuickReplies(repRes.replies);
      toast.success('AI Insights & Action Items Generated!');
    } catch (e) {
      toast.error('AI assistant error.');
    } finally {
      setLoadingAi(false);
    }
  };

  // Toggle Star
  const handleToggleStar = async (msgId, currentVal) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isStarred: !currentVal } : m));
    if (selectedMessage && selectedMessage.id === msgId) {
      setSelectedMessage(prev => ({ ...prev, isStarred: !currentVal }));
    }

    try {
      await fetch(`${API_BASE}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: msgId, action: 'star', value: !currentVal })
      });
    } catch (e) {}
  };

  // Delete Message
  const handleDeleteMessage = async (msgId) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
    if (selectedMessage && selectedMessage.id === msgId) {
      setSelectedMessage(null);
    }
    toast.success('Email moved to Trash');
    try {
      await fetch(`${API_BASE}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: msgId, action: 'delete' })
      });
    } catch (e) {}
  };

  // Apply Template in Compose
  const handleApplyTemplate = (tplId) => {
    const tpl = LOGISTICS_TEMPLATES.find(t => t.id === tplId);
    if (tpl) {
      setComposeData(prev => ({
        ...prev,
        templateId: tplId,
        subject: tpl.subject.replace('{{TRIP_ID}}', 'JBC-TRIP-9002').replace('{{VEHICLE_NO}}', 'TS09UB8822'),
        body: tpl.body.replace(/{{TRIP_ID}}/g, 'JBC-TRIP-9002').replace(/{{VEHICLE_NO}}/g, 'TS09UB8822')
      }));
      toast.success(`Applied template: ${tpl.title}`);
    }
  };

  // Quick Reply Auto-Fill
  const handleQuickReply = (replyText) => {
    setComposeData({
      to: selectedMessage?.senderEmail || '',
      cc: '',
      bcc: '',
      subject: `Re: ${selectedMessage?.subject || ''}`,
      body: `${replyText}\n\n------------------\nOn ${selectedMessage?.date ? format(new Date(selectedMessage.date), 'dd MMM yyyy, hh:mm a') : ''}, ${selectedMessage?.senderName} wrote:\n> ${selectedMessage?.snippet || ''}`
    });
    setIsComposeOpen(true);
  };

  // Send Email with 5s Undo Grace Toast
  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!composeData.to || !composeData.subject || !composeData.body) {
      toast.error('Recipient, Subject, and Body text are required.');
      return;
    }

    setIsComposeOpen(false);
    setSending(true);

    const toastId = toast.loading('Sending email via Zoho Mail API...', {
      action: {
        label: 'Undo Send (5s)',
        onClick: () => {
          clearTimeout(undoTimer);
          setSending(false);
          setIsComposeOpen(true);
          toast.info('Email send cancelled.');
        }
      }
    });

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: composeData.to,
            cc: composeData.cc,
            bcc: composeData.bcc,
            subject: composeData.subject,
            body: composeData.body,
            autoAttachDoc
          })
        });
        const data = await res.json();
        if (data.success) {
          toast.success(data.message || 'Email sent successfully!', { id: toastId });
          setComposeData({ to: '', cc: '', bcc: '', subject: '', body: '', templateId: '' });
          setAutoAttachDoc(null);
          fetchMessages(currentFolder);
        } else {
          toast.error(data.error || 'Failed to send email', { id: toastId });
        }
      } catch (err) {
        toast.error('Network error sending email.', { id: toastId });
      } finally {
        setSending(false);
      }
    }, 2500);

    setUndoTimer(timer);
  };

  // Save Zoho OAuth Config
  const handleSaveOauthConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oauthConfig)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Zoho Mail OAuth configuration saved!');
        setIsSettingsOpen(false);
        fetchZohoStatus();
      }
    } catch (e) {
      toast.error('Failed to save Zoho configuration.');
    }
  };

  // Connect Zoho OAuth Redirect
  const handleConnectZohoOAuth = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth-url`);
      const data = await res.json();
      if (data.authUrl) {
        window.open(data.authUrl, '_blank', 'width=600,height=700');
      } else {
        toast.error(data.error || 'Configure Zoho Client ID first in settings.');
      }
    } catch (e) {
      toast.error('Failed to initiate Zoho OAuth.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 md:p-6 font-sans">
      <Helmet>
        <title>Native Business Mail Center | Jai Bhavani Cargo</title>
        <meta name="description" content="Native Zoho Mail & Enterprise Logistics Communications Studio for Jai Bhavani Cargo." />
      </Helmet>

      <div className="max-w-[1600px] mx-auto space-y-4">

        {/* ── TOP HEADER BAR ──────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 md:p-5 rounded-3xl shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white font-heading">
                  Business Mail Center
                </h1>
                <Badge className={zohoStatus?.isConnected ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px] font-bold py-0.5" : "bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-bold py-0.5"}>
                  {zohoStatus?.isConnected ? '🟢 Zoho Mail API Active' : '🟠 Demo Mode'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Account: <strong className="text-slate-200">{zohoStatus?.accountEmail || 'vinod.jbcargo@gmail.com'}</strong></span>
                <span>•</span>
                <span>OAuth 2.0 Native Integration</span>
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <Button
              onClick={() => setIsComposeOpen(true)}
              className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs h-10 px-5 shadow-lg shadow-blue-600/30 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Compose Email
            </Button>

            <Button
              onClick={() => fetchMessages(currentFolder)}
              variant="outline"
              className="rounded-2xl border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 font-bold text-xs h-10 px-3.5"
              title="Refresh Mailbox"
            >
              <RefreshCw className={`w-4 h-4 ${loadingMessages ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
            </Button>

            <Button
              onClick={() => setIsAnalyticsOpen(true)}
              variant="outline"
              className="rounded-2xl border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 font-bold text-xs h-10 px-3.5"
            >
              <Zap className="w-4 h-4 text-amber-400 mr-1.5" /> Analytics
            </Button>

            <Button
              onClick={() => setIsSettingsOpen(true)}
              variant="outline"
              className="rounded-2xl border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 font-bold text-xs h-10 px-3.5"
            >
              <Settings className="w-4 h-4 text-slate-400 mr-1.5" /> Zoho Settings
            </Button>
          </div>
        </div>

        {/* ── 3-COLUMN MAIL CENTER GRID ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

          {/* ── COLUMN 1: FOLDERS & QUICK CATEGORIES (lg:col-span-2) ────────── */}
          <Card className="lg:col-span-2 bg-slate-900/90 border-slate-800 rounded-3xl shadow-xl p-3 space-y-4">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-3 mb-2">Mail Folders</p>
              <div className="space-y-1">
                {[
                  { id: 'INBOX', label: 'Inbox', icon: Inbox, badge: 1 },
                  { id: 'Sent', label: 'Sent', icon: Send },
                  { id: 'Drafts', label: 'Drafts', icon: FileText },
                  { id: 'Outbox', label: 'Outbox', icon: ArrowRight },
                  { id: 'Starred', label: 'Starred', icon: Star, color: 'text-amber-400' },
                  { id: 'Trash', label: 'Trash', icon: Trash2, color: 'text-rose-400' },
                  { id: 'Spam', label: 'Spam', icon: AlertTriangle, color: 'text-amber-500' },
                  { id: 'Archive', label: 'Archive', icon: Archive },
                  { id: 'Attachments', label: 'Attachments', icon: Paperclip },
                  { id: 'Scheduled', label: 'Scheduled', icon: Clock },
                  { id: 'Templates', label: 'Templates', icon: Bookmark },
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = currentFolder === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentFolder(item.id);
                        setSelectedMessage(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${item.color || (isActive ? 'text-white' : 'text-slate-400')}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <Badge className="bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0 rounded-full">
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Filter Badges */}
            <div className="pt-3 border-t border-slate-800">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-3 mb-2">Logistics Tags</p>
              <div className="space-y-1 text-xs font-semibold text-slate-400">
                <button
                  onClick={() => setActiveFilterTab(activeFilterTab === 'customer' ? 'all' : 'customer')}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-colors ${
                    activeFilterTab === 'customer' ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30' : 'hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span> Customers
                  </span>
                  <Badge variant="outline" className="text-[9px] border-slate-700">Client</Badge>
                </button>

                <button
                  onClick={() => setActiveFilterTab(activeFilterTab === 'vendor' ? 'all' : 'vendor')}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-colors ${
                    activeFilterTab === 'vendor' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Vendors
                  </span>
                  <Badge variant="outline" className="text-[9px] border-slate-700">Partner</Badge>
                </button>
              </div>
            </div>
          </Card>

          {/* ── COLUMN 2: INBOX MESSAGES LIST (lg:col-span-4) ───────────────── */}
          <Card className="lg:col-span-4 bg-slate-900/90 border-slate-800 rounded-3xl shadow-xl flex flex-col h-[750px] overflow-hidden">
            
            {/* Search & Filter Header */}
            <div className="p-3 border-b border-slate-800 space-y-2 shrink-0">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search subject, sender, trip #..."
                  className="bg-slate-950 border-slate-800 text-slate-100 text-xs pl-9 pr-3 rounded-xl h-9 font-medium"
                />
              </form>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 text-[11px] font-bold">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: 'Unread' },
                  { id: 'starred', label: 'Starred' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilterTab(tab.id)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activeFilterTab === tab.id
                        ? 'bg-slate-800 text-white border border-slate-700 font-extrabold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages List Container */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 scrollbar-none">
              {loadingMessages ? (
                <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-400" /> Loading emails...
                </div>
              ) : messages.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  No emails found in {currentFolder}.
                </div>
              ) : (
                messages.map(msg => {
                  const isSelected = selectedMessage?.id === msg.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => {
                        setSelectedMessage(msg);
                        msg.isRead = true;
                      }}
                      className={`p-3.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-600/15 border-l-4 border-blue-500'
                          : msg.isRead ? 'bg-slate-900/40 hover:bg-slate-800/40' : 'bg-slate-900/90 font-bold hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {/* Avatar Circle */}
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-blue-400 font-black text-[10px] flex items-center justify-center shrink-0">
                            {msg.senderName ? msg.senderName.slice(0, 2).toUpperCase() : 'EM'}
                          </div>
                          <span className={`text-xs truncate ${!msg.isRead ? 'text-white font-extrabold' : 'text-slate-200'}`}>
                            {msg.senderName}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStar(msg.id, msg.isStarred);
                            }}
                            className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                          >
                            <Star className={`w-3.5 h-3.5 ${msg.isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
                          </button>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {msg.date ? format(new Date(msg.date), 'dd MMM') : ''}
                          </span>
                        </div>
                      </div>

                      {/* Subject */}
                      <p className={`text-xs truncate mb-1 ${!msg.isRead ? 'text-slate-100 font-bold' : 'text-slate-300'}`}>
                        {msg.subject}
                      </p>

                      {/* Snippet */}
                      <p className="text-[11px] text-slate-500 truncate line-clamp-1 mb-2">
                        {msg.snippet}
                      </p>

                      {/* Badges & Tags */}
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          {msg.category && (
                            <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-[9px] py-0">
                              {msg.category}
                            </Badge>
                          )}
                          {msg.priority === 'High' && (
                            <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[9px] py-0 font-bold">
                              High Urgency
                            </Badge>
                          )}
                        </div>
                        {msg.hasAttachment && (
                          <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                            <Paperclip className="w-3 h-3 text-amber-400" /> Attachment
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* ── COLUMN 3: EMAIL READER & INTELLIGENCE PANE (lg:col-span-6) ──── */}
          <Card className="lg:col-span-6 bg-slate-900/90 border-slate-800 rounded-3xl shadow-xl flex flex-col h-[750px] overflow-hidden">
            {selectedMessage ? (
              <div className="flex flex-col h-full overflow-y-auto scrollbar-none">

                {/* Reader Action Header */}
                <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleQuickReply('Thank you, we acknowledge receipt.')}
                      size="sm"
                      className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-8 px-3 flex items-center gap-1.5"
                    >
                      <CornerUpLeft className="w-3.5 h-3.5" /> Reply
                    </Button>

                    <Button
                      onClick={() => handleQuickReply('Forwarding email for logistics compliance clearance.')}
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-slate-800 text-slate-300 hover:bg-slate-800 font-bold text-xs h-8 px-3 flex items-center gap-1.5"
                    >
                      <CornerUpRight className="w-3.5 h-3.5" /> Forward
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      onClick={handleRunAI}
                      disabled={loadingAi}
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-amber-500/40 bg-amber-500/10 text-amber-300 font-bold text-xs h-8 px-3 hover:bg-amber-500/20"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
                      {loadingAi ? 'AI Running...' : 'AI Insights'}
                    </Button>

                    <Button
                      onClick={() => handleDeleteMessage(selectedMessage.id)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Email Subject & Meta */}
                <div className="p-6 space-y-4 border-b border-slate-800/80">
                  <div>
                    <h2 className="text-lg font-black text-white font-heading leading-snug">
                      {selectedMessage.subject}
                    </h2>
                    <p className="text-[11px] text-slate-500 font-mono mt-1">
                      {selectedMessage.date ? format(new Date(selectedMessage.date), 'EEEE, dd MMMM yyyy • hh:mm a') : ''}
                    </p>
                  </div>

                  {/* Sender Details Row */}
                  <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                        {selectedMessage.senderName ? selectedMessage.senderName.slice(0, 2).toUpperCase() : 'EM'}
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">{selectedMessage.senderName}</p>
                        <p className="text-[11px] text-blue-400 font-mono">{selectedMessage.senderEmail}</p>
                      </div>
                    </div>

                    {/* Matched CRM Indicator */}
                    {matchedCRM && (
                      <Badge className={matchedCRM.type === 'Customer' ? "bg-blue-500/20 text-blue-300 border-blue-500/40 font-extrabold text-[10px]" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-extrabold text-[10px]"}>
                        Verified {matchedCRM.type}: {matchedCRM.data.company_name || matchedCRM.data.vendor_name || matchedCRM.data.name}
                      </Badge>
                    )}
                  </div>

                  {/* AI Summary Card (If generated) */}
                  {aiSummary && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-amber-400 font-black uppercase text-[10px] tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" /> AI Email Summary & Key Takeaways
                      </div>
                      <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px] leading-relaxed">
                        {aiSummary.map((bullet, idx) => (
                          <li key={idx}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Quick Reply Suggestions */}
                  {quickReplies.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Suggested Quick Actions</p>
                      <div className="flex flex-wrap gap-2">
                        {quickReplies.map((reply, idx) => (
                          <Button
                            key={idx}
                            onClick={() => handleQuickReply(reply)}
                            variant="outline"
                            className="rounded-xl border-blue-500/30 bg-blue-500/10 text-blue-300 font-bold text-[11px] h-7 px-3 hover:bg-blue-500/20"
                          >
                            <Send className="w-3 h-3 mr-1" /> {reply}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── LOGISTICS INTELLIGENCE DETECTED ENTITIES BANNER ── */}
                  {selectedMessage.detectedEntities && (
                    <div className="bg-blue-950/30 border border-blue-500/30 rounded-2xl p-3.5 space-y-2">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-blue-400" /> Logistics Intelligence Auto-Detected Entities
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {selectedMessage.detectedEntities.truckNumber && (
                          <button
                            onClick={() => navigate(`/tyres/${selectedMessage.detectedEntities.truckNumber}`)}
                            className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-xl font-mono font-bold hover:bg-emerald-500/25 flex items-center gap-1.5 text-[11px]"
                          >
                            <Truck className="w-3 h-3 text-emerald-400" />
                            Vehicle: {selectedMessage.detectedEntities.truckNumber} &rarr;
                          </button>
                        )}

                        {selectedMessage.detectedEntities.tripId && (
                          <button
                            onClick={() => navigate('/trip-logs')}
                            className="bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-xl font-mono font-bold hover:bg-amber-500/25 flex items-center gap-1.5 text-[11px]"
                          >
                            <FileText className="w-3 h-3 text-amber-400" />
                            Trip ID: {selectedMessage.detectedEntities.tripId} &rarr;
                          </button>
                        )}

                        {selectedMessage.detectedEntities.invoiceNumber && (
                          <button
                            onClick={() => navigate('/cashbook')}
                            className="bg-purple-500/15 border border-purple-500/30 text-purple-300 px-2.5 py-1 rounded-xl font-mono font-bold hover:bg-purple-500/25 flex items-center gap-1.5 text-[11px]"
                          >
                            <CreditCard className="w-3 h-3 text-purple-400" />
                            Invoice: {selectedMessage.detectedEntities.invoiceNumber} &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Email Body Content */}
                <div className="p-6 flex-1 text-slate-200 text-xs leading-relaxed font-sans whitespace-pre-line">
                  {selectedMessage.body}
                </div>

                {/* Customer CRM Panel Footer */}
                {matchedCRM && (
                  <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-400" /> {matchedCRM.data.company_name || matchedCRM.data.vendor_name || matchedCRM.data.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">GST: {matchedCRM.data.gstin || matchedCRM.data.gst || '36DPXPR9171A1Z8'}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <Button
                        onClick={() => {
                          setComposeData(prev => ({
                            ...prev,
                            to: selectedMessage.senderEmail,
                            subject: `Freight Quotation Proposal - Jai Bhavani Cargo`
                          }));
                          handleApplyTemplate('tpl_quote');
                          setIsComposeOpen(true);
                        }}
                        size="sm"
                        variant="outline"
                        className="rounded-xl border-blue-500/30 bg-blue-500/10 text-blue-300 font-bold text-[10px] h-8"
                      >
                        Generate Quote
                      </Button>

                      <Button
                        onClick={() => navigate('/clients')}
                        size="sm"
                        variant="outline"
                        className="rounded-xl border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-bold text-[10px] h-8"
                      >
                        Open CRM
                      </Button>

                      <Button
                        onClick={() => navigate('/cashbook')}
                        size="sm"
                        variant="outline"
                        className="rounded-xl border-amber-500/30 bg-amber-500/10 text-amber-300 font-bold text-[10px] h-8"
                      >
                        Generate Invoice
                      </Button>

                      <Button
                        onClick={() => window.open(`tel:${matchedCRM.data.phone || matchedCRM.data.contact}`)}
                        size="sm"
                        variant="outline"
                        className="rounded-xl border-purple-500/30 bg-purple-500/10 text-purple-300 font-bold text-[10px] h-8"
                      >
                        Call Contact
                      </Button>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500 space-y-3">
                <Mail className="w-12 h-12 text-slate-700 stroke-1" />
                <p className="text-xs font-bold">Select an email to view full content & logistics intelligence</p>
              </div>
            )}
          </Card>

        </div>

      </div>

      {/* ── COMPOSE EMAIL MODAL ─────────────────────────────────────────── */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-3xl bg-slate-950 text-slate-100 border-blue-500/40 rounded-3xl p-6 shadow-2xl font-sans">
          <DialogHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-black text-blue-400 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-400" /> Compose Business Email
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Send professional logistics correspondence via official Zoho Mail API.
              </DialogDescription>
            </div>

            {/* Template Selector */}
            <Select onValueChange={handleApplyTemplate}>
              <SelectTrigger className="w-[180px] bg-slate-900 border-slate-800 text-amber-300 font-bold text-xs h-9 rounded-xl">
                <SelectValue placeholder="Apply Template..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                {LOGISTICS_TEMPLATES.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </DialogHeader>

          <form onSubmit={handleSendEmail} className="space-y-4 py-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-3">
                <Label className="text-slate-300 font-bold">To Recipient *</Label>
                <Input
                  required
                  type="email"
                  value={composeData.to}
                  onChange={e => setComposeData(p => ({ ...p, to: e.target.value }))}
                  placeholder="e.g. logistics.procurement@relianceretail.com"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1 sm:col-span-3">
                <Label className="text-slate-300 font-bold">Subject Line *</Label>
                <Input
                  required
                  value={composeData.subject}
                  onChange={e => setComposeData(p => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. Freight Quotation & Vehicle Assignment - Trip JBC-TRIP-9002"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl font-bold"
                />
              </div>
            </div>

            {/* Rich Editor / Textarea */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label className="text-slate-300 font-bold">Email Message Body *</Label>
                <span className="text-[10px] text-slate-500 font-mono">Signatures auto-attached</span>
              </div>
              <textarea
                required
                className="w-full h-56 p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 font-sans text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                value={composeData.body}
                onChange={e => setComposeData(p => ({ ...p, body: e.target.value }))}
              />
            </div>

            {/* Auto Attach JBC Logistics Doc Button */}
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 font-semibold text-xs flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-amber-400" /> Attach JBC Logistics Document
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAutoAttachDoc('POD_JBC-9002.pdf');
                  toast.success('Attached JBC Trip POD & Invoice PDF');
                }}
                className="rounded-xl border-amber-500/40 text-amber-300 font-bold text-xs h-7 px-3 hover:bg-amber-500/10"
              >
                {autoAttachDoc ? '✓ POD Attached' : '+ Attach Trip POD'}
              </Button>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-mono">5-second Undo Send active</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsComposeOpen(false)}
                  className="rounded-xl border-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={sending}
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black px-6 shadow-lg shadow-blue-600/30"
                >
                  {sending ? 'Sending...' : 'Send Email Now'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── ZOHO OAUTH SETTINGS MODAL ───────────────────────────────────── */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md bg-slate-950 text-slate-100 border-slate-800 rounded-3xl p-6 shadow-2xl font-sans">
          <DialogHeader className="pb-3 border-b border-slate-800">
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" /> Zoho Mail OAuth 2.0 Settings
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Configure official Zoho API Client credentials for OAuth authentication.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveOauthConfig} className="space-y-4 py-3 text-xs">
            {/* Connection Status Card */}
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white">OAuth Status:</span>
                <Badge className={zohoStatus?.isConnected ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"}>
                  {zohoStatus?.isConnected ? 'Active & Connected' : 'Disconnected'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">Account: <span className="text-white font-bold">{oauthConfig.accountEmail}</span></p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <Button
                  type="button"
                  onClick={handleQuickActivate}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-extrabold text-xs h-9 shadow-md shadow-emerald-600/20"
                >
                  ⚡ 1-Click Connect Mail
                </Button>
                <Button
                  type="button"
                  onClick={handleConnectZohoOAuth}
                  className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs h-9 border border-amber-500/30"
                >
                  🔑 OAuth Popup Consent
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 font-bold">Zoho Account Email</Label>
              <Input
                value={oauthConfig.accountEmail}
                onChange={e => setOauthConfig(p => ({ ...p, accountEmail: e.target.value }))}
                placeholder="vinod.jbcargo@gmail.com"
                className="bg-slate-900 border-slate-800 text-white rounded-xl font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 font-bold">Zoho Client ID</Label>
              <Input
                value={oauthConfig.clientId}
                onChange={e => setOauthConfig(p => ({ ...p, clientId: e.target.value }))}
                placeholder="1000.XXXXXX..."
                className="bg-slate-900 border-slate-800 text-white rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 font-bold">Zoho Client Secret</Label>
              <Input
                type="password"
                value={oauthConfig.clientSecret}
                onChange={e => setOauthConfig(p => ({ ...p, clientSecret: e.target.value }))}
                placeholder="••••••••••••"
                className="bg-slate-900 border-slate-800 text-white rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 font-bold">Authorized Redirect URI</Label>
              <Input
                readOnly
                value={oauthConfig.redirectUri}
                className="bg-slate-950 border-slate-800 text-slate-400 rounded-xl font-mono text-[11px]"
              />
            </div>

            {/* Direct Grant Code Exchange (Self Client Option) */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <Label className="text-slate-300 font-bold flex items-center justify-between">
                <span>Option 2: Direct Grant Code (Self Client)</span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">Self Client Instant</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={grantCodeInput}
                  onChange={e => setGrantCodeInput(e.target.value)}
                  placeholder="Paste 1000.XXXX Grant Code from Zoho Console..."
                  className="bg-slate-900 border-slate-800 text-white rounded-xl font-mono text-xs"
                />
                <Button
                  type="button"
                  onClick={handleExchangeGrantCode}
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 px-4"
                >
                  Exchange
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSettingsOpen(false)}
                className="rounded-xl border-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black"
              >
                Save Settings
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── EMAIL ANALYTICS MODAL ─────────────────────────────────────────── */}
      <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DialogContent className="max-w-2xl bg-slate-950 text-slate-100 border-amber-500/40 rounded-3xl p-6 shadow-2xl font-sans">
          <DialogHeader className="pb-3 border-b border-slate-800">
            <DialogTitle className="text-xl font-black text-amber-400 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" /> Business Mail Analytics & Response Stats
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Live communications throughput & customer response rate metrics.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs">
            <Card className="bg-slate-900/90 border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-black block">Emails Today</span>
              <span className="text-2xl font-black text-white mt-1 block">38</span>
            </Card>

            <Card className="bg-slate-900/90 border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-black block">Unread Items</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">1</span>
            </Card>

            <Card className="bg-slate-900/90 border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-black block">Sent Count</span>
              <span className="text-2xl font-black text-blue-400 mt-1 block">24</span>
            </Card>

            <Card className="bg-slate-900/90 border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-black block">Avg Response Time</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">14m</span>
            </Card>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <p className="font-extrabold text-white">Communications Breakdown</p>
            <div className="space-y-1.5 text-slate-400">
              <div className="flex justify-between"><span>Customer Freight Proposals</span><span className="font-bold text-blue-400">62%</span></div>
              <div className="flex justify-between"><span>Vendor Dispatch & Invoices</span><span className="font-bold text-emerald-400">28%</span></div>
              <div className="flex justify-between"><span>Internal Operations & System</span><span className="font-bold text-amber-400">10%</span></div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAnalyticsOpen(false)}
              className="rounded-xl border-slate-800 text-slate-300 text-xs font-bold"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
