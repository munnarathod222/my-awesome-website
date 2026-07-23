import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Download, Printer, Mail, Loader2, History, SplitSquareHorizontal, FileSpreadsheet, Share2, MessageSquare, Globe } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { generateAdvancePayslipPDF } from '@/lib/AdvancePayslipGenerator.js';
import { downloadFile } from '@/lib/downloadUtils.js';
import { LANGUAGES, getTranslation } from '@/lib/payslipTranslations.js';

import EnhancedPayslipPreview from './EnhancedPayslipPreview.jsx';
import PayslipHistory from './PayslipHistory.jsx';
import PayslipComparison from './PayslipComparison.jsx';
import EmailPayslipDialog from './EmailPayslipDialog.jsx';
import PayslipExportDialog from './PayslipExportDialog.jsx';

export default function AdvancePayslipModal({ isOpen, onClose, payrollId, employeeId }) {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [payroll, setPayroll] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [advances, setAdvances] = useState([]);
  
  const [activeTab, setActiveTab] = useState('preview');
  const [language, setLanguage] = useState('en');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('printing-payslip');
      if (payrollId || employeeId) {
        setActiveTab('preview');
        fetchData();
      }
    } else {
      document.body.classList.remove('printing-payslip');
    }
    return () => {
      document.body.classList.remove('printing-payslip');
    };
  }, [isOpen, payrollId, employeeId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let currentPayroll = null;
      let emp = null;
      let targetEmpId = employeeId;

      if (payrollId) {
        currentPayroll = await pb.collection('payroll').getOne(payrollId, { expand: 'employee_id_relation', $autoCancel: false });
        targetEmpId = currentPayroll.employee_id;
        emp = currentPayroll.expand?.employee_id_relation;
      } else if (targetEmpId) {
        emp = await pb.collection('employees').getOne(targetEmpId, { $autoCancel: false });
        try {
          currentPayroll = await pb.collection('payroll').getFirstListItem(`employee_id='${targetEmpId}'`, { sort: '-created', $autoCancel: false });
        } catch(e) {
          console.log("No payroll found for employee");
        }
      }

      setEmployee(emp);
      setPayroll(currentPayroll);

      let filterStr = `employee_id='${targetEmpId}'`;
      if (currentPayroll) {
        const start = new Date(currentPayroll.payroll_year, currentPayroll.payroll_month - 1, 1).toISOString().split('T')[0];
        const end = new Date(currentPayroll.payroll_year, currentPayroll.payroll_month, 0).toISOString().split('T')[0];
        filterStr += ` && date >= '${start}' && date <= '${end} 23:59:59'`;
      } else {
        filterStr += ` && status='Pending'`;
      }

      const advs = await pb.collection('advances').getFullList({ filter: filterStr, sort: '-date', $autoCancel: false });
      setAdvances(advs);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load payslip details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setExporting(true);
    try {
      const blob = await generateAdvancePayslipPDF(payroll, employee, advances, language);
      const empId = employee?.id || payroll?.employee_id || 'Unknown';
      const mStr = payroll?.payroll_month ? payroll.payroll_month.toString().padStart(2, '0') : 'Cur';
      const yStr = payroll?.payroll_year || new Date().getFullYear();
      downloadFile(blob, `Advance_Payslip_${empId}_${mStr}${yStr}_${language}.pdf`);
      toast.success('Payslip PDF downloaded');
    } catch (e) {
      toast.error('Failed to download PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleWhatsAppShare = async () => {
    if (!employee && !payroll) {
      toast.error('Payslip data not ready');
      return;
    }

    const t = (key) => getTranslation(language, key);
    const empName = employee?.name || payroll?.expand?.employee_id_relation?.name || 'Employee';
    const empPhone = employee?.phone_number || employee?.phone || payroll?.expand?.employee_id_relation?.phone_number || '';
    const empId = employee?.id || payroll?.employee_id || 'N/A';
    const month = payroll?.payroll_month ? `${payroll.payroll_month}/${payroll.payroll_year}` : 'Current Month';
    const gross = payroll?.gross_salary || payroll?.base_salary || 0;
    const net = payroll?.net_salary || 0;
    const totalAdv = advances ? advances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0) : 0;
    const status = payroll?.status || 'Pending';

    let shareText = `📄 *JAI BHAVANI CARGO - ${t('titleAdvancePayslip')}*\n\n`;
    shareText += `👤 *${t('empName')}* ${empName}\n`;
    shareText += `🆔 *${t('empId')}* ${empId}\n`;
    shareText += `📅 *${t('forPeriod')}* ${month}\n`;
    shareText += `💳 *${t('paymentStatus')}* ${status}\n\n`;

    shareText += `--- *${t('earningsHeader')}* ---\n`;
    if (gross > 0) shareText += `• *${t('grossSalary')}:* ₹${gross.toLocaleString('en-IN')}\n`;
    if (totalAdv > 0) shareText += `• *${t('totalAdvances')}:* ₹${totalAdv.toLocaleString('en-IN')}\n`;
    if (net > 0) shareText += `• *${t('netPayable')}:* ₹${net.toLocaleString('en-IN')}\n\n`;

    if (advances && advances.length > 0) {
      shareText += `--- *${t('advanceRecordsHeader')} (${advances.length})* ---\n`;
      advances.forEach((a, i) => {
        const dateStr = a.date ? a.date.split('T')[0] : '';
        shareText += `${i + 1}. ${dateStr} - ${a.reason || 'Advance'}: ₹${Number(a.amount).toLocaleString('en-IN')}\n`;
      });
      shareText += `\n`;
    }

    shareText += `Thank you for your service!\n`;
    shareText += `Shared via Jai Bhavani Cargo Portal`;

    // Try Web Share API with PDF file first if supported on mobile device
    try {
      if (navigator.share) {
        setExporting(true);
        const blob = await generateAdvancePayslipPDF(payroll, employee, advances, language);
        const fileName = `Payslip_${empName.replace(/\s+/g, '_')}_${month.replace('/', '-')}_${language}.pdf`;
        const file = new File([blob], fileName, { type: 'application/pdf' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Payslip Statement - ${empName}`,
            text: shareText
          });
          setExporting(false);
          return;
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.log('File Web Share fallback to text WhatsApp:', e);
      } else {
        setExporting(false);
        return;
      }
    } finally {
      setExporting(false);
    }

    // Direct WhatsApp share fallback
    const cleanPhone = empPhone ? empPhone.replace(/\D/g, '') : '';
    let waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    if (cleanPhone && (cleanPhone.length === 10 || cleanPhone.length === 12)) {
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(shareText)}`;
    }

    window.open(waUrl, '_blank');
    toast.success(`Opening WhatsApp share for ${empName}...`);
  };

  const handlePrint = () => {
    const elem = document.getElementById('payslip-preview-content');
    if (!elem) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Jai Bhavani Cargo - Payslip Print</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 12mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
              margin: 0;
              padding: 15px;
              background: #ffffff !important;
              color: #000000 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .payslip-container {
              width: 100% !important;
              max-width: 100% !important;
              background: #ffffff !important;
              color: #000000 !important;
              padding: 0 !important;
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin-bottom: 16px !important;
            }
            td, th {
              border: 1px solid #cbd5e1 !important;
              padding: 8px 10px !important;
              color: #000000 !important;
              font-size: 12px !important;
            }
            th {
              background-color: #f1f5f9 !important;
              font-weight: 700 !important;
            }
            h1 {
              font-size: 22px !important;
              font-weight: 800 !important;
              margin: 0 0 4px 0 !important;
              color: #000000 !important;
              text-align: center;
            }
            h2 {
              font-size: 15px !important;
              font-weight: 700 !important;
              margin: 12px 0 6px 0 !important;
              color: #000000 !important;
              text-align: center;
            }
            p {
              margin: 2px 0 !important;
              color: #334155 !important;
            }
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }
            .font-bold { font-weight: 700 !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-mono { font-family: monospace !important; }
            .bg-slate-100, .bg-slate-50 { background-color: #f8fafc !important; }
            .bg-amber-100, .bg-amber-50 { background-color: #fef3c7 !important; }
            .text-emerald-700 { color: #047857 !important; }
            .text-rose-700 { color: #be123c !important; }
            .border-dashed { border-style: dashed !important; }
          </style>
        </head>
        <body>
          ${elem.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 300);
  };

  // Listen to keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'p') {
          e.preventDefault();
          handlePrint();
        }
        if (e.key === 's') {
          e.preventDefault();
          handleDownloadPDF();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, payroll, employee, advances, language]);

  const hasAdvance = advances.length > 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden bg-background border-border rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20 shrink-0 no-print">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <DialogTitle className="text-xl flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {hasAdvance ? 'Advance & Payslip Center' : 'Payslip Center'}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-9 w-[140px] text-xs font-bold border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg shrink-0">
                    <Globe className="w-3.5 h-3.5 mr-1 text-emerald-400 shrink-0" />
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.code} value={l.code} className="text-xs font-medium cursor-pointer">
                        <span className="mr-1.5">{l.flag}</span>{l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={handleWhatsAppShare} disabled={loading || exporting} className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 font-semibold shadow-sm">
                  <MessageSquare className="w-4 h-4 mr-2 text-emerald-500 fill-emerald-500/20" /> WhatsApp
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowEmailDialog(true)} disabled={loading}>
                  <Mail className="w-4 h-4 mr-2" /> Email
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)} disabled={loading}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} className="hidden sm:flex" disabled={loading}>
                  <Printer className="w-4 h-4 mr-2" /> Print
                </Button>
                <Button size="sm" onClick={handleDownloadPDF} disabled={loading || exporting} className="bg-primary text-primary-foreground font-semibold">
                  {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  Download PDF
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto bg-muted/5 flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground opacity-50" />
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                <div className="px-6 pt-4 shrink-0 bg-background border-b border-border no-print">
                  <TabsList className="w-full sm:w-auto grid grid-cols-3 bg-muted/50 p-1 rounded-xl mb-4">
                    <TabsTrigger value="preview" className="rounded-lg text-xs sm:text-sm"><FileText className="w-3.5 h-3.5 mr-2" /> Preview</TabsTrigger>
                    <TabsTrigger value="compare" className="rounded-lg text-xs sm:text-sm"><SplitSquareHorizontal className="w-3.5 h-3.5 mr-2" /> Compare</TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg text-xs sm:text-sm"><History className="w-3.5 h-3.5 mr-2" /> History</TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                  <TabsContent value="preview" className="m-0 border-none outline-none">
                    <EnhancedPayslipPreview payroll={payroll} employee={employee} advances={advances} language={language} />
                  </TabsContent>
                  
                  <TabsContent value="compare" className="m-0 border-none outline-none">
                    <PayslipComparison currentPayroll={payroll} employeeId={employee?.id || payroll?.employee_id} />
                  </TabsContent>
                  
                  <TabsContent value="history" className="m-0 border-none outline-none">
                    <PayslipHistory employeeId={employee?.id || payroll?.employee_id} />
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <EmailPayslipDialog 
        isOpen={showEmailDialog} 
        onClose={() => setShowEmailDialog(false)} 
        payroll={payroll} 
        employee={employee} 
        advances={advances} 
      />
      
      <PayslipExportDialog 
        isOpen={showExportDialog} 
        onClose={() => setShowExportDialog(false)} 
        payroll={payroll} 
        employee={employee} 
        advances={advances} 
      />

      {/* Hidden print container for raw printing if needed, though media queries usually suffice */}
      <div className="hidden print-only print:block print:w-full">
        {activeTab === 'preview' && !loading && (
          <EnhancedPayslipPreview payroll={payroll} employee={employee} advances={advances} />
        )}
      </div>
    </>
  );
}