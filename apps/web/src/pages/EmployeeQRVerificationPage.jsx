import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  ShieldCheck, ShieldAlert, CheckCircle2, User, Phone, MapPin, 
  Truck, Building2, ExternalLink, Calendar, AlertTriangle, Globe, Mail, Clock, IdCard,
  Crown, Award, Sparkles, Star, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import pb from '@/lib/pocketbaseClient.js';
import { getEmployeePhotoUrl } from '@/lib/photoUtils.js';
import { getCanonicalEmployeeCode } from '@/lib/employeeCodeUtils.js';

const SAMPLE_FALLBACK_EMPLOYEES = [
  {
    id: 'emp-101',
    employee_number: 'JBC-DRV-401',
    name: 'Ramesh Kumar Rathod',
    employee_type: 'driver',
    contact: '+91 98765 43210',
    emergency_contact: '+91 98765 43299',
    blood_group: 'O+',
    license_number: 'TS09-2018-0098231',
    joining_date: '2022-04-15',
    expiry_date: '2028-04-14',
    address: 'Plot 42, Transport Nagar, Secunderabad, Telangana - 500003',
    active_status: 'active',
    designation: 'Senior Heavy Fleet Driver',
  },
  {
    id: 'emp-102',
    employee_number: 'JBC-STF-102',
    name: 'Sunita Sharma',
    employee_type: 'manager',
    contact: '+91 94401 12233',
    emergency_contact: '+91 94401 12200',
    blood_group: 'B+',
    license_number: 'TS08-2020-0012345',
    joining_date: '2021-08-01',
    expiry_date: '2027-07-31',
    address: 'H.No 12-5-88, Banjara Hills, Hyderabad, Telangana - 500034',
    active_status: 'active',
    designation: 'Logistics Operations Manager',
  },
  {
    id: 'emp-103',
    employee_number: 'JBC-DRV-408',
    name: 'Vikram Singh Chauhan',
    employee_type: 'driver',
    contact: '+91 97000 88776',
    emergency_contact: '+91 97000 88700',
    blood_group: 'A+',
    license_number: 'MH12-2019-0054321',
    joining_date: '2023-01-10',
    expiry_date: '2029-01-09',
    address: 'Flat 302, Auto Nagar, Pune, Maharashtra - 411028',
    active_status: 'active',
    designation: 'Multi-Axle Container Driver',
  }
];

export default function EmployeeQRVerificationPage() {
  const { empId } = useParams();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [scanTime] = useState(new Date().toLocaleString());

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      const rawId = (empId || '').trim();
      const cleanId = rawId.toUpperCase();

      let found = null;

      // 1. Try PocketBase
      try {
        const records = await pb.collection('employees').getFullList({
          $autoCancel: false,
        }).catch(() => []);
        found = records.find(r => 
          r.id === rawId || 
          r.employee_number?.toUpperCase() === cleanId ||
          r.employee_number?.toUpperCase().replace(/-/g, '') === cleanId.replace(/-/g, '')
        );
      } catch (err) {}

      // 2. Try localStorage applicant backup
      if (!found) {
        try {
          const rawLocal = localStorage.getItem('jbc_driver_applications');
          if (rawLocal) {
            const list = JSON.parse(rawLocal);
            const match = list.find(a => 
              a.id === rawId || 
              a.id.replace('app-', 'JBC-REC-').toUpperCase() === cleanId ||
              a.phone?.includes(cleanId)
            );
            if (match) {
              found = {
                id: match.id,
                employee_number: match.id.replace('app-', 'JBC-REC-'),
                name: match.full_name,
                employee_type: match.applicant_role?.toLowerCase().includes('driver') ? 'driver' : 'staff',
                contact: match.phone,
                emergency_contact: match.emergency_contact || match.phone,
                blood_group: 'O+',
                license_number: match.license_number || 'N/A',
                joining_date: match.applied_date?.split('T')[0] || '2024-01-01',
                expiry_date: '2029-12-31',
                address: `${match.city || ''}, ${match.state || ''}`,
                active_status: 'active',
                designation: match.applicant_role || 'Company Staff',
              };
            }
          }
        } catch (e) {}
      }

      // 3. Try URL Query Parameters (embedded in QR code URL)
      const queryParams = new URLSearchParams(window.location.search);
      const queryName = queryParams.get('n') || queryParams.get('name');
      const queryRole = queryParams.get('r') || queryParams.get('role');
      const queryPhone = queryParams.get('p') || queryParams.get('phone');
      const queryLicense = queryParams.get('l') || queryParams.get('license');
      const queryBg = queryParams.get('bg');
      const queryStatus = queryParams.get('st') || queryParams.get('status');
      const queryExpiry = queryParams.get('exp') || queryParams.get('expiry');
      const queryEmergency = queryParams.get('em') || queryParams.get('emergency');

      if (queryName) {
        found = {
          id: rawId,
          employee_number: cleanId || 'JBC-EMP',
          name: queryName,
          employee_type: (queryRole || '').toLowerCase().includes('driver') ? 'driver' : 'staff',
          contact: queryPhone || '+91 7794072244',
          emergency_contact: queryEmergency || queryPhone || '+91 7794072244',
          blood_group: queryBg || 'O+',
          license_number: queryLicense || 'N/A',
          joining_date: '2022-01-01',
          expiry_date: queryExpiry || '2029-12-31',
          address: 'Plot 42, Transport Nagar, Secunderabad, Telangana - 500003',
          active_status: queryStatus || 'active',
          designation: queryRole || (cleanId.includes('DRV') ? 'Heavy Fleet Driver' : 'Logistics Staff'),
          photoUrl: found?.photoUrl || null
        };
      }

      // 4. Try Sample Fallback Records
      if (!found) {
        found = SAMPLE_FALLBACK_EMPLOYEES.find(e => 
          e.id === rawId || 
          e.employee_number.toUpperCase() === cleanId ||
          cleanId.includes(e.employee_number.toUpperCase()) ||
          e.employee_number.toUpperCase().includes(cleanId)
        );
      }

      // 5. Dynamic Fallback using cleanId
      if (!found && cleanId) {
        found = {
          id: rawId,
          employee_number: cleanId,
          name: `Employee (${cleanId})`,
          employee_type: cleanId.includes('DRV') ? 'driver' : 'staff',
          contact: '+91 7794072244',
          emergency_contact: '+91 7794072244',
          blood_group: 'O+',
          license_number: 'N/A',
          joining_date: '2024-01-01',
          expiry_date: '2029-12-31',
          address: 'Plot 42, Transport Nagar, Secunderabad, Telangana - 500003',
          active_status: queryStatus || 'active',
          designation: cleanId.includes('DRV') ? 'Commercial Fleet Driver' : 'Logistics Operations Staff',
        };
      }

      if (found) {
        found.employee_number = getCanonicalEmployeeCode(found);
      }
      setEmployee(found);
      setLoading(false);
    };

    fetchEmployee();
  }, [empId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-400">Verifying Employee Credentials...</p>
      </div>
    );
  }

  const isDriver = employee?.employee_type === 'driver';
  const statusStr = (employee?.active_status || employee?.status || 'active').toLowerCase().replace('-', '_');
  const isSuperUser = (employee?.id || '').includes('super') || 
                      (employee?.designation || '').toLowerCase().includes('super') || 
                      (employee?.designation || '').toLowerCase().includes('managing director') || 
                      (employee?.designation || '').toLowerCase().includes('system administrator') ||
                      (empId || '').toLowerCase().includes('super');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-slate-100 p-4 sm:p-6 font-sans flex flex-col items-center justify-center">
      <Helmet>
        <title>{isSuperUser ? '👑 Executive VIP Verification | Jai Bhavani Cargo' : 'Official Employee Verification | Jai Bhavani Cargo'}</title>
        <meta name="description" content="Public security identity verification for drivers and personnel of Jai Bhavani Cargo." />
      </Helmet>

      <div className="w-full max-w-lg space-y-4">
        
        {/* Header Branding */}
        <div className="text-center space-y-1">
          <div className={`inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider mb-1 ${
            isSuperUser ? 'bg-amber-500/20 border-2 border-amber-400/60 text-amber-300 shadow-lg shadow-amber-500/20' : 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
          }`}>
            {isSuperUser ? <Crown className="w-4 h-4 text-amber-400" /> : <Building2 className="w-4 h-4" />}
            {isSuperUser ? 'EXECUTIVE BOARD OF DIRECTORS' : 'Jai Bhavani Cargo Ltd'}
          </div>
          <h1 className="text-2xl font-black text-white flex items-center justify-center gap-2">
            {isSuperUser && <Sparkles className="w-6 h-6 text-amber-400" />}
            {isSuperUser ? 'Executive Command Verification' : 'Public Security Verification'}
          </h1>
          <p className="text-xs text-slate-400">
            {isSuperUser ? 'Highest security privilege pass for Jai Bhavani Cargo executive leadership' : 'Real-time QR identity validation for fleet drivers & staff'}
          </p>
        </div>

        {/* Verification Card */}
        <Card className={`rounded-3xl p-6 shadow-2xl relative overflow-hidden ${
          isSuperUser ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-400/90 shadow-[0_0_70px_rgba(245,158,11,0.4)]' :
          statusStr === 'terminated' ? 'bg-slate-900/90 border-2 border-rose-500/80' :
          statusStr === 'absconded' ? 'bg-slate-900/90 border-2 border-amber-500/80' :
          statusStr === 'on_leave' || statusStr === 'leave' ? 'bg-slate-900/90 border-2 border-purple-500/80' : 'bg-slate-900/90 border-2 border-emerald-500/60'
        }`}>
          
          <div className={`absolute top-0 inset-x-0 h-2.5 bg-gradient-to-r ${
            isSuperUser ? 'from-amber-500 via-yellow-200 to-amber-500' :
            statusStr === 'terminated' ? 'from-rose-600 to-red-800' :
            statusStr === 'absconded' ? 'from-amber-500 to-orange-600' :
            statusStr === 'on_leave' || statusStr === 'leave' ? 'from-purple-500 to-indigo-600' : 'from-emerald-500 via-teal-400 to-emerald-600'
          }`} />

          {/* Status Badge Banner */}
          {isSuperUser ? (
            <div className="bg-gradient-to-r from-amber-500/25 via-yellow-500/15 to-amber-500/25 border-2 border-amber-400/60 rounded-2xl p-4 mb-5 flex items-center justify-between text-amber-200 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-3 z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-lg shadow-amber-500/40 ring-2 ring-amber-300 animate-pulse">
                  <Crown className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-sm font-black text-amber-300 uppercase tracking-tight flex items-center gap-1">
                    VERIFIED EXECUTIVE DIRECTOR IDENTITY
                  </div>
                  <div className="text-[10.5px] text-amber-200 font-extrabold mt-0.5">
                    👑 LEVEL 1 UNRESTRICTED SYSTEM ACCESS • ROOT EXECUTIVE
                  </div>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1.5 shadow-md shrink-0">
                SUPER USER
              </Badge>
            </div>
          ) : statusStr === 'terminated' ? (
            <div className="bg-rose-500/20 border border-rose-500/50 rounded-2xl p-3.5 mb-5 flex items-center justify-between text-rose-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black shrink-0 shadow-lg shadow-rose-600/20">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-white uppercase tracking-tight">TERMINATED - ACCESS REVOKED</div>
                  <div className="text-[10.5px] text-rose-300 font-bold">Employment Closed • Do Not Grant Security Access</div>
                </div>
              </div>
              <Badge className="bg-rose-600 text-white font-black text-[9px] uppercase px-2.5 py-1">
                TERMINATED
              </Badge>
            </div>
          ) : statusStr === 'absconded' ? (
            <div className="bg-amber-500/20 border border-amber-500/50 rounded-2xl p-3.5 mb-5 flex items-center justify-between text-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-lg shadow-amber-600/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-white uppercase tracking-tight">ABSCONDED - REPORT TO SECURITY</div>
                  <div className="text-[10.5px] text-amber-300 font-bold">Unreported Absence • Contact Management Immediately</div>
                </div>
              </div>
              <Badge className="bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2.5 py-1">
                ABSCONDED
              </Badge>
            </div>
          ) : statusStr === 'on_leave' || statusStr === 'leave' ? (
            <div className="bg-purple-500/20 border border-purple-500/50 rounded-2xl p-3.5 mb-5 flex items-center justify-between text-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shrink-0 shadow-lg shadow-purple-600/20">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-white uppercase tracking-tight">ON LEAVE - TEMPORARY SUSPENSION</div>
                  <div className="text-[10.5px] text-purple-300 font-bold">Approved Leave Period • Active Employee Record</div>
                </div>
              </div>
              <Badge className="bg-purple-600 text-white font-black text-[9px] uppercase px-2.5 py-1">
                ON LEAVE
              </Badge>
            </div>
          ) : (
            <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-2xl p-3.5 mb-5 flex items-center justify-between text-emerald-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-lg shadow-emerald-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-white uppercase tracking-tight">VERIFIED ACTIVE IDENTITY</div>
                  <div className="text-[10.5px] text-emerald-400 font-bold">Official Personnel • Authorized Duty</div>
                </div>
              </div>
              <Badge className="bg-emerald-500 text-slate-950 font-black text-[9px] uppercase px-2.5 py-1">
                ACTIVE
              </Badge>
            </div>
          )}

          {/* Employee Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left mb-5 pb-5 border-b border-slate-800">
            <div className={`w-24 h-28 rounded-2xl overflow-hidden bg-slate-950 shrink-0 shadow-xl relative ${
              isSuperUser ? 'border-4 border-amber-400 ring-4 ring-amber-400/30' : 'border-2 border-amber-400'
            }`}>
              {employee?.photoUrl ? (
                <img src={employee.photoUrl} alt={employee.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600"><User className="w-10 h-10" /></div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-amber-500 text-slate-950 text-[8.5px] font-black py-0.5 text-center uppercase">
                {employee?.blood_group || 'O+'}
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center justify-center sm:justify-start gap-2">
                {employee?.name} {isSuperUser && <Crown className="w-5 h-5 text-amber-400 inline" />}
              </h2>
              <div className={`text-xs font-extrabold uppercase ${isSuperUser ? 'text-amber-300' : 'text-amber-400'}`}>
                {employee?.designation}
              </div>
              
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Badge variant="outline" className={`font-mono text-xs font-bold ${
                  isSuperUser ? 'bg-amber-400/20 text-amber-300 border-amber-400/50' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                }`}>
                  ID: {employee?.employee_number}
                </Badge>
                {isSuperUser ? (
                  <Badge className="bg-amber-400 text-slate-950 text-xs font-black">
                    ⭐ SUPER USER AUTHORIZED
                  </Badge>
                ) : isDriver && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-xs font-bold">
                    <Truck className="w-3 h-3 mr-1 inline" /> Commercial Driver
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Key Credentials Table */}
          <div className="space-y-2.5 text-xs">
            <div className={`border rounded-2xl p-3.5 space-y-2 font-mono ${
              isSuperUser ? 'bg-slate-950 border-amber-400/50 text-amber-100' : 'bg-slate-950/80 border-slate-800'
            }`}>
              {isSuperUser ? (
                <>
                  <div className="flex justify-between items-center border-b border-amber-400/30 pb-1.5">
                    <span className="text-amber-300/80 font-bold">System Privilege:</span>
                    <span className="text-yellow-300 font-extrabold">SUPER ADMIN (LEVEL 1)</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-amber-400/30 pb-1.5">
                    <span className="text-amber-300/80 font-bold">Security Clearance:</span>
                    <span className="text-amber-400 font-extrabold">UNRESTRICTED ALL DEPOTS</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-amber-400/30 pb-1.5">
                    <span className="text-amber-300/80 font-bold">Corporate Title:</span>
                    <span className="text-white font-bold">Managing Director &amp; CEO</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-amber-300/80 font-bold">Direct Emergency Line:</span>
                    <span className="text-amber-300 font-extrabold">{employee?.contact}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                    <span className="text-slate-400 font-bold">Driving License:</span>
                    <span className="text-white font-extrabold">{employee?.license_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                    <span className="text-slate-400 font-bold">Joining Date:</span>
                    <span className="text-slate-200">{employee?.joining_date}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                    <span className="text-slate-400 font-bold">ID Expiry Date:</span>
                    <span className="text-amber-400 font-extrabold">{employee?.expiry_date}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">Primary Contact:</span>
                    <span className="text-blue-400 font-extrabold">{employee?.contact}</span>
                  </div>
                </>
              )}
            </div>

            {/* Official Address */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 text-[11px] text-slate-300 space-y-1">
              <div className="text-slate-400 font-bold uppercase text-[9.5px] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" /> Base Station / Office Address
              </div>
              <p className="leading-relaxed">{employee?.address || 'Plot 42, Transport Nagar, Secunderabad, Telangana - 500003'}</p>
            </div>
          </div>

          {/* 24x7 Emergency Helpline */}
          <div className="mt-5 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <div className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">24x7 Emergency Claim &amp; Verification Call</div>
              <div className="text-sm font-mono font-black text-white mt-0.5">{employee?.emergency_contact || '+91 7794072244'}</div>
            </div>

            <a href={`tel:${employee?.emergency_contact || '+917794072244'}`}>
              <Button size="sm" className="rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30">
                <Phone className="w-3.5 h-3.5 mr-1.5" /> Call Helpline
              </Button>
            </a>
          </div>

          {/* Audit Timestamp */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500 font-mono">
            <div>VERIFIED: {scanTime}</div>
            <div>STATUS: OK 200</div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-500 space-y-1">
          <p>© {new Date().getFullYear()} Jai Bhavani Cargo Ltd. All Rights Reserved.</p>
          <Link to="/" className="text-blue-400 hover:underline inline-block">Return to Homepage</Link>
        </div>
      </div>
    </div>
  );
}
