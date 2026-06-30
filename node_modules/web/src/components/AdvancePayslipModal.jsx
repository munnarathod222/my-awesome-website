import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Download, Printer, Mail, Loader2, History, SplitSquareHorizontal, FileSpreadsheet } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { generateAdvancePayslipPDF } from '@/lib/AdvancePayslipGenerator.js';
import { downloadFile } from '@/lib/downloadUtils.js';

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
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  useEffect(() => {
    if (isOpen && (payrollId || employeeId)) {
      setActiveTab('preview');
      fetchData();
    }
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
      const blob = await generateAdvancePayslipPDF(payroll, employee, advances);
      const empId = employee?.id || payroll?.employee_id || 'Unknown';
      const mStr = payroll?.payroll_month ? payroll.payroll_month.toString().padStart(2, '0') : 'Cur';
      const yStr = payroll?.payroll_year || new Date().getFullYear();
      downloadFile(blob, `Advance_Payslip_${empId}_${mStr}${yStr}.pdf`);
      toast.success('Payslip PDF downloaded');
    } catch (e) {
      toast.error('Failed to download PDF');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    // Triggers standard browser print. For robust printing, the .payslip-container 
    // uses standard print media queries defined in index.css.
    window.print();
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
  }, [isOpen, payroll, employee, advances]);

  const hasAdvance = advances.length > 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden bg-background border-border rounded-2xl no-print">
          <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20 shrink-0">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <DialogTitle className="text-xl flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {hasAdvance ? 'Advance & Payslip Center' : 'Payslip Center'}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowEmailDialog(true)} disabled={loading}>
                  <Mail className="w-4 h-4 mr-2" /> Email
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)} disabled={loading}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} className="hidden sm:flex" disabled={loading}>
                  <Printer className="w-4 h-4 mr-2" /> Print
                </Button>
                <Button size="sm" onClick={handleDownloadPDF} disabled={loading || exporting} className="bg-primary text-primary-foreground">
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
                <div className="px-6 pt-4 shrink-0 bg-background border-b border-border">
                  <TabsList className="w-full sm:w-auto grid grid-cols-3 bg-muted/50 p-1 rounded-xl mb-4">
                    <TabsTrigger value="preview" className="rounded-lg text-xs sm:text-sm"><FileText className="w-3.5 h-3.5 mr-2" /> Preview</TabsTrigger>
                    <TabsTrigger value="compare" className="rounded-lg text-xs sm:text-sm"><SplitSquareHorizontal className="w-3.5 h-3.5 mr-2" /> Compare</TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg text-xs sm:text-sm"><History className="w-3.5 h-3.5 mr-2" /> History</TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                  <TabsContent value="preview" className="m-0 border-none outline-none">
                    <EnhancedPayslipPreview payroll={payroll} employee={employee} advances={advances} />
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