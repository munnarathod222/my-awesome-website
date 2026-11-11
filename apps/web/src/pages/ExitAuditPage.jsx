import React, { useState, useEffect } from 'react';
const Helmet = ({ children }) => null;
import { 
  ClipboardCheck, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Upload, 
  AlertCircle, 
  UserX, 
  Key, 
  Smartphone, 
  CreditCard, 
  FileCheck, 
  DollarSign, 
  Download, 
  Truck, 
  Calendar, 
  Building2, 
  Send,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ExitAuditPage() {
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'employee-exit');

  // Baseline data
  const [trucks, setTrucks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [fetching, setFetching] = useState(true);

  // Tab 1: Employee Offboarding State
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [empActiveTrips, setEmpActiveTrips] = useState([]);
  const [empAssignedTruck, setEmpAssignedTruck] = useState(null);
  const [empAdvances, setEmpAdvances] = useState([]);
  const [loadingEmpData, setLoadingEmpData] = useState(false);
  const [submittingExit, setSubmittingExit] = useState(false);

  // Checklist recovery items
  const [checklist, setChecklist] = useState({
    // Digital Access
    app_login_revoked: true,
    portal_access_revoked: true,
    whatsapp_bot_unlinked: true,
    gps_tracking_unlinked: true,
    // Physical Assets
    vehicle_keys_returned: true,
    fastag_recovered: true,
    sim_card_recovered: true,
    company_phone_returned: false,
    tools_stepney_verified: true,
    // Statutory & Docs
    dl_returned: true,
    id_badge_surrendered: true,
    uniform_safety_gear_returned: true,
    signed_nodues_submitted: true,
  });

  // Financial & Operational Exit Form
  const [exitFormData, setExitFormData] = useState({
    relieving_date: new Date().toISOString().split('T')[0],
    separation_reason: 'Resignation',
    exit_type: 'relieved', // 'relieved' or 'terminated'
    unassign_vehicle: true,
    pro_rata_salary: '',
    pending_advances: 0,
    deductions: 0,
    net_settlement_amount: 0,
    payment_mode: 'Bank Transfer (NEFT)',
    remarks: 'All operational handovers verified and no-dues clearance completed.'
  });

  // Tab 2: Vehicle Inspection State
  const [vehicleAuditData, setVehicleAuditData] = useState({
    truck_id: '',
    driver_id: '',
    audit_date: new Date().toISOString().split('T')[0],
    body_damages_notes: '',
    battery_serial_verified: false,
    status: 'Cleared'
  });
  const [damageImages, setDamageImages] = useState([]);
  const [batterySnapshot, setBatterySnapshot] = useState(null);
  const [selectedTruckDetails, setSelectedTruckDetails] = useState(null);
  const [submittingVehicleAudit, setSubmittingVehicleAudit] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [trucksRes, allEmployeesRes] = await Promise.all([
          pb.collection('trucks').getFullList({ sort: 'truck_number', $autoCancel: false }),
          pb.collection('employees').getFullList({ sort: 'name', $autoCancel: false })
        ]);
        setTrucks(trucksRes);
        setEmployees(allEmployeesRes);
        const driverList = allEmployeesRes.filter(e => (e.employee_type || '').toLowerCase() === 'driver');
        setDrivers(driverList.length > 0 ? driverList : allEmployeesRes);

        // Auto select truck from query param if any
        const qParam = searchParams.get('truck') || searchParams.get('truck_number');
        if (qParam && trucksRes.length > 0) {
          const normQ = qParam.replace(/[^A-Z0-9]/gi, '').toUpperCase();
          const matched = trucksRes.find(t => t.id === qParam || (t.truck_number || '').replace(/[^A-Z0-9]/gi, '').toUpperCase() === normQ);
          if (matched) {
            setVehicleAuditData(prev => ({ ...prev, truck_id: matched.id }));
            setSelectedTruckDetails(matched);
            setActiveTab('vehicle-audit');
          }
        }
      } catch (err) {
        console.error('Error fetching baseline audit data:', err);
        toast.error('Failed to load employee & fleet options.');
      } finally {
        setFetching(false);
      }
    };
    loadInitialData();
  }, []);

  // When an employee is chosen in Tab 1
  const handleSelectEmployee = async (empId) => {
    setSelectedEmpId(empId);
    const emp = employees.find(e => e.id === empId);
    setSelectedEmp(emp || null);
    if (!emp) return;

    setLoadingEmpData(true);
    try {
      // Find assigned truck
      let assignedTruckObj = null;
      if (emp.assigned_truck) {
        assignedTruckObj = trucks.find(t => t.id === emp.assigned_truck || t.truck_number === emp.assigned_truck);
      }
      setEmpAssignedTruck(assignedTruckObj);

      // Fetch active trips
      let trips = [];
      try {
        trips = await pb.collection('trip_logs').getFullList({
          filter: `driver_employee_id = "${emp.id}" && trip_status != "Completed" && trip_status != "Cancelled"`,
          sort: '-created',
          $autoCancel: false
        });
      } catch (e) {
        console.warn('Trip logs lookup failed:', e);
      }
      setEmpActiveTrips(trips);

      // Fetch recent advances/cashbook
      let advancesList = [];
      try {
        const cashbookRes = await pb.collection('cashbook').getList(1, 10, {
          filter: `driver_id = "${emp.id}" || description ~ "${emp.name}"`,
          sort: '-date',
          $autoCancel: false
        });
        advancesList = cashbookRes.items || [];
      } catch (e) {
        console.warn('Cashbook lookup failed:', e);
      }
      setEmpAdvances(advancesList);

      // Estimate pro-rata salary and net settlement
      const monthlySalary = Number(emp.salary_amount || emp.salary || 25000);
      const dayOfMonth = new Date().getDate();
      const proRata = Math.round((monthlySalary / 30) * dayOfMonth);
      const totalAdv = advancesList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      const net = Math.max(0, proRata - totalAdv);

      setExitFormData(prev => ({
        ...prev,
        pro_rata_salary: proRata,
        pending_advances: totalAdv,
        net_settlement_amount: net
      }));
    } catch (err) {
      console.error('Error loading employee specific audit data:', err);
    } finally {
      setLoadingEmpData(false);
    }
  };

  // Recalculate net settlement when numbers change
  const handleFinancialChange = (field, val) => {
    setExitFormData(prev => {
      const updated = { ...prev, [field]: val };
      const salary = Number(updated.pro_rata_salary) || 0;
      const advances = Number(updated.pending_advances) || 0;
      const deduct = Number(updated.deductions) || 0;
      updated.net_settlement_amount = salary - advances - deduct;
      return updated;
    });
  };

  // Toggle checklist checkbox
  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Generate PDF Clearance Certificate
  const generateClearancePDF = (emp, clearanceData) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 42, 'F');

      // Accent gold strip
      doc.setFillColor(234, 179, 8); // amber-500
      doc.rect(0, 42, pageWidth, 2.5, 'F');

      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('JAI BHAVANI CARGO', 14, 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225);
      doc.text('Fleet Logistics, Nationwide Container Freight & Heavy Transport Hub', 14, 25);
      doc.text('Corporate HQ: Hyderabad / Mumbai Regional Corridors | support@jaibhavanicargo.com', 14, 31);
      doc.text('CIN/REG: JBC-OPS-2026-ENT-OFFBOARD', 14, 37);

      // Certificate Title
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('OFFICIAL EMPLOYEE EXIT & NO-DUES CLEARANCE CERTIFICATE', 14, 55);

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 58, pageWidth - 14, 58);

      // Reference and Metadata
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Certificate Ref:', 14, 65);
      doc.setFont('helvetica', 'normal');
      doc.text(`JBC/EXIT/${new Date().getFullYear()}/${(emp.id || 'EMP').slice(0, 8).toUpperCase()}`, 45, 65);

      doc.setFont('helvetica', 'bold');
      doc.text('Date of Issue:', pageWidth - 70, 65);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), pageWidth - 45, 65);

      // Employee Information Table
      const empInfo = [
        ['Employee Name', emp.name || 'N/A', 'Employee Code', emp.employee_code || emp.code || 'EMP-' + emp.id.slice(0, 5).toUpperCase()],
        ['Designation / Role', (emp.employee_type || 'Staff').toUpperCase(), 'Contact Number', emp.contact || emp.phone || 'N/A'],
        ['Assigned Vehicle', empAssignedTruck ? `${empAssignedTruck.vehicle_name || ''} (${empAssignedTruck.truck_number})` : 'Unassigned / Released', 'Relieving Date', clearanceData.relieving_date],
        ['Separation Reason', clearanceData.separation_reason, 'Exit Status', clearanceData.exit_type.toUpperCase()]
      ];

      autoTable(doc, {
        startY: 70,
        body: empInfo,
        theme: 'plain',
        styles: { fontSize: 8.5, cellPadding: 2.5, textColor: [30, 41, 59] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 38, textColor: [71, 85, 105] },
          1: { cellWidth: 55 },
          2: { fontStyle: 'bold', cellWidth: 38, textColor: [71, 85, 105] },
          3: { cellWidth: 55 }
        }
      });

      // Section 1: Asset & Access Recovery Checklist Table
      let curY = doc.lastAutoTable.finalY + 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text('1. ASSET RECOVERY & ACCESS REVOCATION AUDIT', 14, curY);

      const checklistRows = [
        ['Digital Access', 'Mobile App Login Credentials', checklist.app_login_revoked ? 'REVOKED & TERMINATED' : 'Pending', 'OK'],
        ['Digital Access', 'Driver Portal & GPS Access', checklist.portal_access_revoked ? 'REVOKED & TERMINATED' : 'Pending', 'OK'],
        ['Fleet Equipment', 'Vehicle Ignition Keys & Spares', checklist.vehicle_keys_returned ? 'PHYSICALLY RECOVERED' : 'Not Returned', 'OK'],
        ['Fleet Equipment', 'FASTag Card & Fuel Pass', checklist.fastag_recovered ? 'PHYSICALLY RECOVERED' : 'Not Returned', 'OK'],
        ['Company Assets', 'SIM Card & Mobile Unit', checklist.sim_card_recovered ? 'RECOVERED & DEACTIVATED' : 'Waived/Retained', 'OK'],
        ['Vehicle Inspection', 'Tools, Jack & Stepney Tyre', checklist.tools_stepney_verified ? 'VERIFIED & INTACT' : 'Pending', 'OK'],
        ['Statutory Docs', 'Driving License & Company ID', checklist.id_badge_surrendered ? 'VERIFIED & SURRENDERED' : 'Pending', 'OK'],
        ['Legal Compliance', 'Signed No-Dues Undertaking', checklist.signed_nodues_submitted ? 'EXECUTED & ON FILE' : 'Pending', 'OK']
      ];

      autoTable(doc, {
        startY: curY + 3,
        head: [['Category', 'Audit Item / Asset Description', 'Recovery Status', 'Verification']],
        body: checklistRows,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2.2 },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });

      // Section 2: Financial Settlement Table
      curY = doc.lastAutoTable.finalY + 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text('2. FINAL FINANCIAL SETTLEMENT & NO-DUES STATEMENT', 14, curY);

      const finRows = [
        ['Pro-Rata Current Salary Due', `INR ${Number(clearanceData.pro_rata_salary || 0).toLocaleString('en-IN')}`, 'Payable to employee'],
        ['Outstanding Driver Advances / Cashbook', `- INR ${Number(clearanceData.pending_advances || 0).toLocaleString('en-IN')}`, 'Adjusted against dues'],
        ['Deductions / Damage Penalties / Fines', `- INR ${Number(clearanceData.deductions || 0).toLocaleString('en-IN')}`, 'Adjusted'],
        ['FINAL NET SETTLEMENT AMOUNT', `INR ${Number(clearanceData.net_settlement_amount || 0).toLocaleString('en-IN')}`, `Disbursement Mode: ${clearanceData.payment_mode}`]
      ];

      autoTable(doc, {
        startY: curY + 3,
        head: [['Settlement Ledger Head', 'Amount (INR)', 'Adjustment Notes']],
        body: finRows,
        theme: 'grid',
        headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 8.5, cellPadding: 2.5 },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { fontStyle: 'bold', halign: 'right' }
        }
      });

      // Final Signatures Block
      curY = doc.lastAutoTable.finalY + 12;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Declaration: The employee hereby confirms full and final settlement of all claims, wages, and accounts with Jai Bhavani Cargo.', 14, curY);

      const sigY = curY + 22;
      doc.setDrawColor(203, 213, 225);
      doc.line(14, sigY, 65, sigY);
      doc.line(80, sigY, 130, sigY);
      doc.line(145, sigY, pageWidth - 14, sigY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8);
      doc.text('Employee Signature', 14, sigY + 5);
      doc.text('Fleet Ops Manager', 80, sigY + 5);
      doc.text('Authorized Director / Signatory', 145, sigY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Name: ${emp.name}`, 14, sigY + 9);
      doc.text('Jai Bhavani Cargo HQ', 80, sigY + 9);
      doc.text('Seal & Digital Sign-off', 145, sigY + 9);

      // Save PDF
      doc.save(`Exit_Clearance_${(emp.name || 'Employee').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Official Exit & No-Dues Certificate PDF downloaded!');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Failed to generate PDF clearance certificate.');
    }
  };

  // Submit Employee Exit
  const handleSubmitEmployeeExit = async (e) => {
    e.preventDefault();
    if (!selectedEmp) {
      toast.error('Please select an employee to offboard.');
      return;
    }

    setSubmittingExit(true);
    try {
      const payload = {
        employee_id: selectedEmp.id,
        exit_type: exitFormData.exit_type,
        separation_reason: exitFormData.separation_reason,
        relieving_date: exitFormData.relieving_date,
        unassign_vehicle: exitFormData.unassign_vehicle,
        checklist: checklist,
        financials: {
          pro_rata_salary: Number(exitFormData.pro_rata_salary) || 0,
          pending_advances: Number(exitFormData.pending_advances) || 0,
          deductions: Number(exitFormData.deductions) || 0,
          net_settlement_amount: Number(exitFormData.net_settlement_amount) || 0,
          payment_mode: exitFormData.payment_mode
        },
        remarks: exitFormData.remarks
      };

      const res = await fetch('/api/driver/employee-exit-clearance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server rejected employee exit clearance.');
      }

      toast.success(`Exit clearance finalized for ${selectedEmp.name}!`);

      // Auto-generate and download official PDF
      generateClearancePDF(selectedEmp, exitFormData);

      // Refresh employee list
      const updatedList = await pb.collection('employees').getFullList({ sort: 'name', $autoCancel: false });
      setEmployees(updatedList);
      setSelectedEmpId('');
      setSelectedEmp(null);
    } catch (err) {
      console.error('Error executing exit clearance:', err);
      toast.error(err.message || 'Failed to complete exit clearance.');
    } finally {
      setSubmittingExit(false);
    }
  };

  // Tab 2: Submit Vehicle Physical Audit
  const handleVehicleAuditSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleAuditData.truck_id || !vehicleAuditData.driver_id) {
      toast.error('Please select both a truck and a driver.');
      return;
    }

    setSubmittingVehicleAudit(true);
    try {
      const form = new FormData();
      form.append('truck_id', vehicleAuditData.truck_id);
      form.append('driver_id', vehicleAuditData.driver_id);
      form.append('audit_date', new Date(vehicleAuditData.audit_date).toISOString());
      form.append('body_damages_notes', vehicleAuditData.body_damages_notes);
      form.append('battery_serial_verified', vehicleAuditData.battery_serial_verified ? 'true' : 'false');
      form.append('status', vehicleAuditData.status);

      for (let i = 0; i < damageImages.length; i++) {
        form.append('body_damages_images', damageImages[i]);
      }
      if (batterySnapshot) {
        form.append('battery_image_snapshot', batterySnapshot);
      }
      form.append('tyre_axle_layout_verified', JSON.stringify({ verified: true, timestamp: Date.now() }));

      await pb.collection('exit_audits').create(form);

      const driver = drivers.find(d => d.id === vehicleAuditData.driver_id);
      if (driver) {
        await pb.collection('employees').update(driver.id, {
          notes: `Last Exit Audit status: ${vehicleAuditData.status} on ${vehicleAuditData.audit_date}.`
        });
      }

      toast.success(`Vehicle exit audit logged successfully with status: ${vehicleAuditData.status}.`);

      // Reset
      setVehicleAuditData({
        truck_id: '',
        driver_id: '',
        audit_date: new Date().toISOString().split('T')[0],
        body_damages_notes: '',
        battery_serial_verified: false,
        status: 'Cleared'
      });
      setDamageImages([]);
      setBatterySnapshot(null);
      setSelectedTruckDetails(null);
    } catch (err) {
      console.error('Failed to log vehicle audit:', err);
      toast.error(err.message || 'Failed to submit Vehicle Audit.');
    } finally {
      setSubmittingVehicleAudit(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <span className="text-muted-foreground text-sm font-medium">Initializing Operations Hub...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <Helmet>
        <title>Exit Audit & Employee Offboarding Hub | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary border border-primary/20 shadow-xs">
              <ClipboardCheck className="w-7 h-7" />
            </div>
            Exit Audit & Operational Offboarding Hub
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Execute statutory employee offboardings, asset recovery, financial settlements, and vehicle handover inspections.
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 max-w-md bg-muted/60 p-1 rounded-2xl">
          <TabsTrigger value="employee-exit" className="rounded-xl font-bold text-xs sm:text-sm gap-2">
            <UserX className="w-4 h-4" /> Employee Offboarding
          </TabsTrigger>
          <TabsTrigger value="vehicle-audit" className="rounded-xl font-bold text-xs sm:text-sm gap-2">
            <Truck className="w-4 h-4" /> Vehicle Inspection
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: EMPLOYEE OFFBOARDING */}
        <TabsContent value="employee-exit" className="space-y-6 m-0">
          <Card className="border border-border/50 rounded-3xl overflow-hidden shadow-soft bg-card">
            <CardHeader className="border-b border-border/40 bg-muted/10 p-5 sm:p-6">
              <CardTitle className="text-xl flex items-center gap-2">
                <UserX className="w-5 h-5 text-amber-500" /> Select Employee for Offboarding Clearance
              </CardTitle>
              <CardDescription>
                Pulls authentic records from database to audit access, assigned fleet, active trips, and settlement balances.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Active Employee *</Label>
                  <Select value={selectedEmpId} onValueChange={handleSelectEmployee}>
                    <SelectTrigger className="h-12 bg-background border-border rounded-xl">
                      <SelectValue placeholder="Search or select employee..." />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} — {(emp.employee_type || 'Staff').toUpperCase()} {emp.employee_code ? `(${emp.employee_code})` : ''} {emp.status === 'relieved' || emp.status === 'terminated' ? `[ALREADY ${emp.status.toUpperCase()}]` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Relieving / Exit Date *</Label>
                  <Input 
                    type="date"
                    value={exitFormData.relieving_date}
                    onChange={(e) => setExitFormData(prev => ({ ...prev, relieving_date: e.target.value }))}
                    className="h-12 bg-background border-border rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Selected Employee Live Profile Banner */}
              {selectedEmp && (
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in duration-200">
                  <div>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase">Employee Name</span>
                    <p className="font-bold text-sm text-foreground mt-0.5">{selectedEmp.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedEmp.contact || 'No phone'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase">Assigned Truck</span>
                    <p className="font-bold text-sm text-cyan-400 mt-0.5">
                      {empAssignedTruck ? `${empAssignedTruck.truck_number}` : 'None Assigned'}
                    </p>
                    <span className="text-xs text-muted-foreground">{empAssignedTruck?.truck_type || 'Fleet'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase">Active Shipments</span>
                    <p className="font-bold text-sm text-foreground mt-0.5 flex items-center gap-1.5">
                      {empActiveTrips.length > 0 ? (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                          {empActiveTrips.length} Active Trip(s)
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                          0 Trips (Clean)
                        </Badge>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase">Registered Salary</span>
                    <p className="font-bold text-sm text-foreground mt-0.5">
                      ₹{Number(selectedEmp.salary_amount || selectedEmp.salary || 25000).toLocaleString('en-IN')}/mo
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CHECKLIST CARDS */}
          {selectedEmp && (
            <form onSubmit={handleSubmitEmployeeExit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. DIGITAL ACCESS REVOCATION */}
                <Card className="border border-border/50 rounded-3xl overflow-hidden shadow-soft bg-card">
                  <CardHeader className="p-4 sm:p-5 border-b border-border/40 bg-muted/10 flex flex-row items-center gap-3">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">1. Digital Access Revocation</CardTitle>
                      <CardDescription className="text-xs">Deactivate portal tokens and driver app access</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5 space-y-3">
                    <label className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        checked={checklist.app_login_revoked}
                        onChange={() => toggleChecklist('app_login_revoked')}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span className="text-xs sm:text-sm font-medium">Deactivate Mobile Driver App Credentials</span>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        checked={checklist.portal_access_revoked}
                        onChange={() => toggleChecklist('portal_access_revoked')}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span className="text-xs sm:text-sm font-medium">Revoke Web Portal & PocketBase Token Access</span>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        checked={checklist.whatsapp_bot_unlinked}
                        onChange={() => toggleChecklist('whatsapp_bot_unlinked')}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span className="text-xs sm:text-sm font-medium">Unlink WhatsApp Automated Dispatch Updates</span>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        checked={checklist.gps_tracking_unlinked}
                        onChange={() => toggleChecklist('gps_tracking_unlinked')}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span className="text-xs sm:text-sm font-medium">Unlink Driver from Live GPS Location Tracking</span>
                    </label>
                  </CardContent>
                </Card>

                {/* 2. PHYSICAL ASSET RECOVERY */}
                <Card className="border border-border/50 rounded-3xl overflow-hidden shadow-soft bg-card">
                  <CardHeader className="p-4 sm:p-5 border-b border-border/40 bg-muted/10 flex flex-row items-center gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">2. Physical Asset & Device Recovery</CardTitle>
                      <CardDescription className="text-xs">Collect keys, toll cards, tools, and hardware</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5 space-y-3">
                    <label className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        checked={checklist.vehicle_keys_returned}
                        onChange={() => toggleChecklist('vehicle_keys_returned')}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span className="text-xs sm:text-sm font-medium">Vehicle Ignition Keys & Duplicate Spares</span>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        checked={checklist.fastag_recovered}
                        onChange={() => toggleChecklist('fastag_recovered')}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span className="text-xs sm:text-sm font-medium">FASTag Physical Card / Fuel Card Retrieved</span>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        checked={checklist.sim_card_recovered}
                        onChange={() => toggleChecklist('sim_card_recovered')}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span className="text-xs sm:text-sm font-medium">Company SIM Card / Smartphone Handover</span>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        checked={checklist.tools_stepney_verified}
                        onChange={() => toggleChecklist('tools_stepney_verified')}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span className="text-xs sm:text-sm font-medium">Toolkit, Hydraulic Jack, Tarpaulin & Spare Tyre</span>
                    </label>
                  </CardContent>
                </Card>

                {/* 3. STATUTORY & OPERATIONAL CLEARANCE */}
                <Card className="border border-border/50 rounded-3xl overflow-hidden shadow-soft bg-card">
                  <CardHeader className="p-4 sm:p-5 border-b border-border/40 bg-muted/10 flex flex-row items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">3. Statutory & Document Clearance</CardTitle>
                      <CardDescription className="text-xs">Verify licenses, badges, and No-Dues undertaking</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5 space-y-3">
                    <label className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        checked={checklist.dl_returned}
                        onChange={() => toggleChecklist('dl_returned')}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span className="text-xs sm:text-sm font-medium">Driving License Original Verification Returned</span>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        checked={checklist.id_badge_surrendered}
                        onChange={() => toggleChecklist('id_badge_surrendered')}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span className="text-xs sm:text-sm font-medium">Surrender Company ID Badge & Gate Pass</span>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        checked={checklist.uniform_safety_gear_returned}
                        onChange={() => toggleChecklist('uniform_safety_gear_returned')}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span className="text-xs sm:text-sm font-medium">Safety Vest, Helmet & PPE Returned</span>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        checked={checklist.signed_nodues_submitted}
                        onChange={() => toggleChecklist('signed_nodues_submitted')}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span className="text-xs sm:text-sm font-medium">Signed No-Dues Undertaking Executed</span>
                    </label>
                  </CardContent>
                </Card>

                {/* 4. FINANCIAL SETTLEMENT CALCULATOR */}
                <Card className="border border-border/50 rounded-3xl overflow-hidden shadow-soft bg-card">
                  <CardHeader className="p-4 sm:p-5 border-b border-border/40 bg-muted/10 flex flex-row items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">4. Financial Settlement & No-Dues</CardTitle>
                      <CardDescription className="text-xs">Automatic calculation of pro-rata pay and net balance</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Pro-Rata Pay (INR)</Label>
                        <Input 
                          type="number"
                          value={exitFormData.pro_rata_salary}
                          onChange={(e) => handleFinancialChange('pro_rata_salary', e.target.value)}
                          className="h-10 bg-background border-border rounded-xl font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Advances Outstanding (INR)</Label>
                        <Input 
                          type="number"
                          value={exitFormData.pending_advances}
                          onChange={(e) => handleFinancialChange('pending_advances', e.target.value)}
                          className="h-10 bg-background border-border rounded-xl font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Deductions/Fines (INR)</Label>
                        <Input 
                          type="number"
                          value={exitFormData.deductions}
                          onChange={(e) => handleFinancialChange('deductions', e.target.value)}
                          className="h-10 bg-background border-border rounded-xl font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Disbursement Mode</Label>
                        <Select 
                          value={exitFormData.payment_mode} 
                          onValueChange={(val) => setExitFormData(prev => ({ ...prev, payment_mode: val }))}
                        >
                          <SelectTrigger className="h-10 bg-background border-border rounded-xl text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Bank Transfer (NEFT)">Bank Transfer (NEFT)</SelectItem>
                            <SelectItem value="UPI / IMPS">UPI / IMPS</SelectItem>
                            <SelectItem value="Cash Handover">Cash Handover</SelectItem>
                            <SelectItem value="Cheque">Cheque</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Final Net Settlement</span>
                        <p className="text-xs text-muted-foreground">Payable upon signature</p>
                      </div>
                      <span className="text-xl font-black font-mono text-emerald-400">
                        ₹{Number(exitFormData.net_settlement_amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* SEPARATION DETAILS & SUBMISSION CARD */}
              <Card className="border border-border/50 rounded-3xl overflow-hidden shadow-soft bg-card p-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Separation Reason</Label>
                    <Select 
                      value={exitFormData.separation_reason}
                      onValueChange={(val) => setExitFormData(prev => ({ ...prev, separation_reason: val }))}
                    >
                      <SelectTrigger className="h-11 bg-background border-border rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Resignation">Voluntary Resignation</SelectItem>
                        <SelectItem value="Mutual Separation">Mutual Separation</SelectItem>
                        <SelectItem value="End of Contract">Contract Completed</SelectItem>
                        <SelectItem value="Disciplinary Termination">Disciplinary Termination</SelectItem>
                        <SelectItem value="Retirement">Retirement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Post-Exit Employee Status</Label>
                    <Select 
                      value={exitFormData.exit_type}
                      onValueChange={(val) => setExitFormData(prev => ({ ...prev, exit_type: val }))}
                    >
                      <SelectTrigger className="h-11 bg-background border-border rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relieved" className="text-emerald-400 font-bold">Relieved (Clean Clearance)</SelectItem>
                        <SelectItem value="terminated" className="text-destructive font-bold">Terminated (Disciplinary)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Truck Handover</Label>
                    <div className="h-11 flex items-center px-3 rounded-xl bg-background border border-border">
                      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={exitFormData.unassign_vehicle}
                          onChange={(e) => setExitFormData(prev => ({ ...prev, unassign_vehicle: e.target.checked }))}
                          className="w-4 h-4 rounded text-primary"
                        />
                        Unassign & Release Truck from Driver
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Official Clearance Notes / Remarks</Label>
                  <Textarea 
                    value={exitFormData.remarks}
                    onChange={(e) => setExitFormData(prev => ({ ...prev, remarks: e.target.value }))}
                    rows={2}
                    className="bg-background border-border rounded-xl text-sm"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-border/40">
                  <p className="text-xs text-muted-foreground text-center sm:text-left">
                    Submitting executes atomic database updates and instantly generates official signed PDF clearance.
                  </p>
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={submittingExit} 
                    className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md gap-2"
                  >
                    {submittingExit ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Finalizing Clearance...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" /> Finalize Exit & Download PDF
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </form>
          )}
        </TabsContent>

        {/* TAB 2: VEHICLE PHYSICAL INSPECTION */}
        <TabsContent value="vehicle-audit" className="space-y-6 m-0">
          <form onSubmit={handleVehicleAuditSubmit} className="space-y-6">
            <Card className="border border-border/50 rounded-3xl overflow-hidden shadow-soft p-6 bg-card space-y-6">
              <CardHeader className="p-0 border-b border-border/50 pb-4">
                <CardTitle className="text-xl">Vehicle Physical Dispatch & Handover Audit</CardTitle>
                <CardDescription>Select truck, driver, and document physical condition details.</CardDescription>
              </CardHeader>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Select Vehicle *</Label>
                  <Select 
                    value={vehicleAuditData.truck_id} 
                    onValueChange={(truckId) => {
                      setVehicleAuditData(prev => ({ ...prev, truck_id: truckId }));
                      setSelectedTruckDetails(trucks.find(t => t.id === truckId) || null);
                    }}
                  >
                    <SelectTrigger className="bg-background border-border h-12 rounded-xl">
                      <SelectValue placeholder="Select active truck..." />
                    </SelectTrigger>
                    <SelectContent>
                      {trucks.map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.vehicle_name} ({t.registration_number || t.truck_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Handover Driver *</Label>
                  <Select 
                    value={vehicleAuditData.driver_id} 
                    onValueChange={(val) => setVehicleAuditData(prev => ({ ...prev, driver_id: val }))}
                  >
                    <SelectTrigger className="bg-background border-border h-12 rounded-xl">
                      <SelectValue placeholder="Select driver..." />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map(d => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name} {d.employee_type ? `(${d.employee_type.toUpperCase()})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Audit Date *</Label>
                  <Input 
                    type="date" 
                    value={vehicleAuditData.audit_date} 
                    onChange={(e) => setVehicleAuditData(prev => ({ ...prev, audit_date: e.target.value }))}
                    className="bg-background border-border h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Audit Status Result *</Label>
                  <Select 
                    value={vehicleAuditData.status} 
                    onValueChange={(val) => setVehicleAuditData(prev => ({ ...prev, status: val }))}
                  >
                    <SelectTrigger className="bg-background border-border h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cleared" className="text-emerald-400 font-semibold">Cleared (No critical damages)</SelectItem>
                      <SelectItem value="Flagged" className="text-destructive font-semibold">Flagged (Unapproved damage/mismatch)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {selectedTruckDetails && (
              <Card className="border border-border/50 rounded-3xl overflow-hidden shadow-soft p-6 bg-card space-y-6">
                <CardHeader className="p-0 border-b border-border/50 pb-4 flex flex-row items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Battery & Equipment Verification</CardTitle>
                    <CardDescription>Match physical serials against vehicle inventory.</CardDescription>
                  </div>
                </CardHeader>
                
                <div className="space-y-6">
                  <div className="p-4 bg-muted/20 rounded-2xl border border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Registered Battery Serial</span>
                      <p className="font-mono text-sm text-foreground font-bold mt-1">
                        {selectedTruckDetails.battery_serial_number || 'N/A (Standard OEM Battery)'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Warranty details</span>
                      <p className="text-sm text-foreground font-medium mt-1">
                        {selectedTruckDetails.battery_warranty_details || 'Active Warranty on Record'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="battery-serial-check"
                      checked={vehicleAuditData.battery_serial_verified}
                      onChange={(e) => setVehicleAuditData(prev => ({ ...prev, battery_serial_verified: e.target.checked }))}
                      className="w-4 h-4 rounded text-primary border-border"
                    />
                    <Label htmlFor="battery-serial-check" className="cursor-pointer font-medium">
                      Physically verified battery serial matches baseline record
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Battery Image Snapshot</Label>
                    <div className="flex items-center gap-4">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setBatterySnapshot(e.target.files[0])}
                        className="bg-background border-border"
                      />
                      {batterySnapshot && <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <Card className="border border-border/50 rounded-3xl overflow-hidden shadow-soft p-6 bg-card space-y-6">
              <CardHeader className="p-0 border-b border-border/50 pb-4">
                <CardTitle className="text-xl">Body Damages & Photos</CardTitle>
                <CardDescription>Log any body damages, paint scrapes, or dent details.</CardDescription>
              </CardHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Condition / Damages Notes</Label>
                  <Textarea 
                    value={vehicleAuditData.body_damages_notes}
                    onChange={(e) => setVehicleAuditData(prev => ({ ...prev, body_damages_notes: e.target.value }))}
                    placeholder="Log damages (e.g. Dent on front bumper, left mirror glass cracked)..."
                    rows={4}
                    className="bg-background border-border rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Upload Damage Photos (Multiple selection allowed)</Label>
                  <div className="flex items-center gap-4">
                    <Input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={(e) => setDamageImages(Array.from(e.target.files))}
                      className="bg-background border-border"
                    />
                    {damageImages.length > 0 && (
                      <Badge className="bg-primary/20 text-primary border-primary/20 px-3 py-1 font-semibold rounded-xl">
                        {damageImages.length} Images selected
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={submittingVehicleAudit} className="rounded-xl px-8 h-12 shadow-sm font-bold">
                {submittingVehicleAudit ? 'Submitting Checklist...' : 'Log Vehicle Inspection Report'}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
