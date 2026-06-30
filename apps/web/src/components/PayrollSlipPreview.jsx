import React from 'react';
import { format } from 'date-fns';
import { Building2, Mail, Phone, MapPin, Calendar, User, Briefcase, IndianRupee } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function PayrollSlipPreview({ payrollData, employeeData }) {
  if (!payrollData || !employeeData) return null;

  const { breakdown, month, year } = payrollData;
  const metrics = breakdown?.attendanceMetrics || {};
  const deductions = breakdown?.deductions || {};
  
  const advanceDetails = employeeData.pendingAdvances || [];

  return (
    <div className="bg-white text-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 max-w-3xl mx-auto font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Jai Bhavani Cargo</h1>
          </div>
          <div className="space-y-1 text-sm text-slate-500">
            <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> 123 Logistics Park, Mumbai, MH 400001</p>
            <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> +91 98765 43210</p>
            <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> payroll@jaibhavanicargo.com</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-slate-200 uppercase tracking-widest mb-2">Payslip</h2>
          <p className="text-sm font-medium text-slate-600 bg-slate-100 inline-flex items-center gap-1.5 px-3 py-1 rounded-full">
            <Calendar className="w-4 h-4" />
            {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <Separator className="my-6 bg-slate-200" />

      {/* Employee Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Employee Information</h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <span className="text-slate-500 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Name:</span>
            <span className="col-span-2 font-medium text-slate-900">{employeeData.name}</span>
            
            <span className="text-slate-500 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Role:</span>
            <span className="col-span-2 font-medium text-slate-900 capitalize">{employeeData.position || employeeData.employee_type}</span>
            
            <span className="text-slate-500">Emp ID:</span>
            <span className="col-span-2 font-medium text-slate-900 font-mono">{employeeData.id.substring(0, 8).toUpperCase()}</span>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Attendance Summary</h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <span className="text-slate-500">Total Days:</span>
            <span className="col-span-2 font-medium text-slate-900">{metrics.totalDays || 0}</span>
            
            <span className="text-slate-500">Present:</span>
            <span className="col-span-2 font-medium text-emerald-600">{metrics.presentDays || 0}</span>
            
            <span className="text-slate-500">Absent/Leave:</span>
            <span className="col-span-2 font-medium text-rose-600">{(metrics.absentDays || 0) + (metrics.leaveDays || 0)}</span>
          </div>
        </div>
      </div>

      {/* Salary Details */}
      <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Earnings</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-700">Amount</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700 border-l border-slate-200">Deductions</th>
              <th className="text-right py-3 px-4 font-semibold text-slate-700">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-3 px-4 text-slate-600">Basic Salary</td>
              <td className="py-3 px-4 text-right font-medium text-slate-900 tabular-nums">₹{payrollData.baseSalary?.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              <td className="py-3 px-4 text-slate-600 border-l border-slate-200">Attendance Deduction</td>
              <td className="py-3 px-4 text-right font-medium text-rose-600 tabular-nums">₹{deductions.attendance?.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-slate-600"></td>
              <td className="py-3 px-4 text-right font-medium text-slate-900 tabular-nums"></td>
              <td className="py-3 px-4 text-slate-600 border-l border-slate-200">Taxes (10%)</td>
              <td className="py-3 px-4 text-right font-medium text-rose-600 tabular-nums">₹{deductions.taxes?.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            </tr>
            
            {/* Advance Deductions Breakdown */}
            {advanceDetails.length > 0 ? (
              advanceDetails.map((adv, idx) => (
                <tr key={adv.id}>
                  <td className="py-3 px-4 text-slate-600"></td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900 tabular-nums"></td>
                  <td className="py-3 px-4 text-slate-600 border-l border-slate-200">
                    Advance Recovery <span className="text-xs text-slate-400">({format(new Date(adv.date), 'dd/MM')})</span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-rose-600 tabular-nums">
                    ₹{(adv.remaining_balance ?? adv.amount)?.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-3 px-4 text-slate-600"></td>
                <td className="py-3 px-4 text-right font-medium text-slate-900 tabular-nums"></td>
                <td className="py-3 px-4 text-slate-600 border-l border-slate-200">Advance Deductions</td>
                <td className="py-3 px-4 text-right font-medium text-rose-600 tabular-nums">₹{deductions.advances?.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
            )}
            
            <tr className="bg-slate-50 font-semibold">
              <td className="py-4 px-4 text-slate-900">Gross Earnings</td>
              <td className="py-4 px-4 text-right text-slate-900 tabular-nums">₹{payrollData.baseSalary?.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              <td className="py-4 px-4 text-slate-900 border-l border-slate-200">Total Deductions</td>
              <td className="py-4 px-4 text-right text-rose-600 tabular-nums">
                ₹{((deductions.attendance || 0) + (deductions.taxes || 0) + (deductions.advances || 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Net Pay */}
      <div className="bg-slate-900 text-white rounded-xl p-6 flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">Net Payable Amount</p>
          <p className="text-xs text-slate-500">Amount transferred to employee account</p>
        </div>
        <div className="flex items-center gap-2">
          <IndianRupee className="w-6 h-6 text-emerald-400" />
          <span className="text-3xl font-bold tabular-nums tracking-tight">
            {payrollData.netSalary?.toLocaleString(undefined, {minimumFractionDigits: 2})}
          </span>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-slate-400">
        <p>This is a computer generated document and does not require a signature.</p>
      </div>
    </div>
  );
}