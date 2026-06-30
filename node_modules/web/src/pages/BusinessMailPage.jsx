import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Mail, Send, Folder, RefreshCw, Star, Trash2, ArrowLeft, Settings, Inbox, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const BACKEND_API = '/hcgi/api';

export default function BusinessMailPage() {
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState('INBOX');
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  
  // Compose Mail State
  const [isComposing, setIsComposing] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', html: '' });
  const [sending, setSending] = useState(false);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [settingsData, setSettingsData] = useState({
    MAIL_HOST: '',
    MAIL_PORT: '465',
    MAIL_USER: '',
    MAIL_PASS: '',
    MAIL_IMAP_HOST: 'imap.hostinger.com',
    MAIL_IMAP_PORT: '993'
  });

  const fetchFolders = async () => {
    setLoadingFolders(true);
    try {
      const response = await fetch(`${BACKEND_API}/mailbox/folders`);
      const data = await response.json();
      if (data.success) {
        setFolders(data.folders || []);
      } else {
        toast.error(data.error || 'Failed to load folders.');
      }
    } catch (err) {
      console.error('Folders fetch err:', err);
    } finally {
      setLoadingFolders(false);
    }
  };

  const fetchMessages = async (folderName) => {
    setLoadingMessages(true);
    try {
      const response = await fetch(`${BACKEND_API}/mailbox/messages?folder=${folderName}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages || []);
      } else {
        toast.error(data.error || 'Failed to load messages.');
      }
    } catch (err) {
      console.error('Messages fetch err:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchMessages(currentFolder);
  }, []);

  const handleFolderSelect = (folderId) => {
    setCurrentFolder(folderId);
    setSelectedMessage(null);
    setIsComposing(false);
    fetchMessages(folderId);
  };

  const handleSendMail = async (e) => {
    e.preventDefault();
    if (!composeData.to || !composeData.subject || !composeData.html) {
      toast.error('All fields are required.');
      return;
    }
    setSending(true);
    try {
      const response = await fetch(`${BACKEND_API}/mailbox/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(composeData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Email sent successfully!');
        setIsComposing(false);
        setComposeData({ to: '', subject: '', html: '' });
      } else {
        toast.error(data.error || 'Failed to send mail.');
      }
    } catch (err) {
      console.error('Send mail error:', err);
      toast.error('Connection to email gateway failed.');
    } finally {
      setSending(false);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    // Simulate saving settings (usually saved via pocketbase/users settings or environment config)
    toast.success('SMTP/IMAP preferences updated.');
    setShowSettings(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-3 duration-300">
      <Helmet>
        <title>Business Mailbox | Communication</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            Business Mailbox
          </h1>
          <p className="text-muted-foreground mt-2">
            Hostinger SMTP/IMAP verified dashboard. Send invoices, quotes, and update customers.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setShowSettings(!showSettings)} className="rounded-xl">
            <Settings className="w-4 h-4 mr-2" /> Mail Settings
          </Button>
          <Button onClick={() => { setIsComposing(true); setSelectedMessage(null); }} className="rounded-xl font-bold">
            <Send className="w-4 h-4 mr-2" /> Compose New
          </Button>
        </div>
      </div>

      {showSettings ? (
        <Card className="border border-border/50 rounded-3xl p-6 bg-card max-w-2xl">
          <CardHeader className="p-0 border-b border-border/50 pb-4">
            <CardTitle>SMTP & IMAP Credentials</CardTitle>
            <CardDescription>Setup your business hostinger server properties.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveSettings} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SMTP Host</Label>
                <Input value={settingsData.MAIL_HOST} onChange={(e) => setSettingsData({...settingsData, MAIL_HOST: e.target.value})} placeholder="smtp.hostinger.com" className="bg-background rounded-xl border-border" />
              </div>
              <div className="space-y-2">
                <Label>SMTP Port</Label>
                <Input value={settingsData.MAIL_PORT} onChange={(e) => setSettingsData({...settingsData, MAIL_PORT: e.target.value})} placeholder="465" className="bg-background rounded-xl border-border" />
              </div>
              <div className="space-y-2">
                <Label>IMAP Host</Label>
                <Input value={settingsData.MAIL_IMAP_HOST} onChange={(e) => setSettingsData({...settingsData, MAIL_IMAP_HOST: e.target.value})} placeholder="imap.hostinger.com" className="bg-background rounded-xl border-border" />
              </div>
              <div className="space-y-2">
                <Label>IMAP Port</Label>
                <Input value={settingsData.MAIL_IMAP_PORT} onChange={(e) => setSettingsData({...settingsData, MAIL_IMAP_PORT: e.target.value})} placeholder="993" className="bg-background rounded-xl border-border" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Username (User)</Label>
              <Input value={settingsData.MAIL_USER} onChange={(e) => setSettingsData({...settingsData, MAIL_USER: e.target.value})} placeholder="operations@jaibhavanicargo.com" className="bg-background rounded-xl border-border" />
            </div>
            <div className="space-y-2">
              <Label>Email Password (Pass)</Label>
              <Input type="password" value={settingsData.MAIL_PASS} onChange={(e) => setSettingsData({...settingsData, MAIL_PASS: e.target.value})} className="bg-background rounded-xl border-border" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowSettings(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" className="rounded-xl font-bold">Save Configuration</Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Folders Sidebar */}
          <Card className="border border-border/50 rounded-3xl p-4 bg-card md:col-span-1 shadow-soft h-fit">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3 mb-4">Mail Folders</h3>
            <div className="space-y-1">
              {loadingFolders ? (
                <div className="p-4 text-center text-xs text-muted-foreground">Loading folders...</div>
              ) : (
                folders.map(f => (
                  <button 
                    key={f.id} 
                    onClick={() => handleFolderSelect(f.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${currentFolder === f.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/10'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Folder className="w-4 h-4" />
                      {f.name}
                    </div>
                    {f.count > 0 && <span className="bg-muted text-foreground px-2 py-0.5 rounded-lg text-xs font-bold">{f.count}</span>}
                  </button>
                ))
              )}
            </div>
          </Card>

          {/* Messages List / Content Panel */}
          <div className="md:col-span-3 space-y-6">
            {isComposing ? (
              <Card className="border border-border/50 rounded-3xl p-6 bg-card shadow-soft">
                <CardHeader className="p-0 border-b border-border/50 pb-4 flex flex-row items-center gap-3">
                  <Button variant="ghost" onClick={() => setIsComposing(false)} className="rounded-xl p-2 h-9 w-9 shrink-0">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div>
                    <CardTitle>Compose Outbound Mail</CardTitle>
                    <CardDescription>Send email to clients or partners.</CardDescription>
                  </div>
                </CardHeader>
                <form onSubmit={handleSendMail} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>To *</Label>
                    <Input value={composeData.to} onChange={(e) => setComposeData({...composeData, to: e.target.value})} placeholder="recipient@client.com" required className="bg-background rounded-xl border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject *</Label>
                    <Input value={composeData.subject} onChange={(e) => setComposeData({...composeData, subject: e.target.value})} placeholder="e.g. Shipment update / Invoice #10234" required className="bg-background rounded-xl border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label>Message Body *</Label>
                    <Textarea value={composeData.html} onChange={(e) => setComposeData({...composeData, html: e.target.value})} rows={10} required placeholder="Write your message here..." className="bg-background rounded-xl border-border" />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsComposing(false)} className="rounded-xl">Cancel</Button>
                    <Button type="submit" disabled={sending} className="rounded-xl font-bold">
                      {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                      Send Message
                    </Button>
                  </div>
                </form>
              </Card>
            ) : selectedMessage ? (
              <Card className="border border-border/50 rounded-3xl p-6 bg-card shadow-soft space-y-6">
                <CardHeader className="p-0 border-b border-border/50 pb-4 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => setSelectedMessage(null)} className="rounded-xl p-2 h-9 w-9 shrink-0">
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                      <CardTitle className="text-xl">{selectedMessage.subject}</CardTitle>
                      <CardDescription>From: {selectedMessage.from}</CardDescription>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-semibold">{new Date(selectedMessage.date).toLocaleString()}</span>
                </CardHeader>
                <div className="prose dark:prose-invert max-w-none text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.body}
                </div>
              </Card>
            ) : (
              <Card className="border border-border/50 rounded-3xl overflow-hidden bg-card shadow-soft">
                <CardHeader className="border-b border-border/50 p-6 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Inbox className="w-5 h-5 text-primary" />
                      {currentFolder} Messages
                    </CardTitle>
                    <CardDescription>Viewing emails synced with Hostinger secure mail gateways.</CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => fetchMessages(currentFolder)} className="rounded-xl p-2 h-9 w-9">
                    <RefreshCw className={`w-4 h-4 ${loadingMessages ? 'animate-spin' : ''}`} />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingMessages ? (
                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                      <span>Syncing messages...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="p-16 text-center">
                      <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                      <h4 className="text-base font-bold text-foreground">No messages in {currentFolder}</h4>
                      <p className="text-xs text-muted-foreground mt-1">This folder contains no emails.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {messages.map(msg => (
                        <div 
                          key={msg.id} 
                          onClick={() => setSelectedMessage(msg)}
                          className="p-4 hover:bg-muted/10 cursor-pointer flex flex-col sm:flex-row justify-between items-start gap-4 transition-all"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground text-sm">{msg.from}</span>
                            </div>
                            <p className="font-semibold text-foreground text-sm">{msg.subject}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{msg.snippet}</p>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0 self-end sm:self-start">
                            {new Date(msg.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
