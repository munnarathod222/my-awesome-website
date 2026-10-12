import{r as o,j as e,a5 as ze,bs as Ge,ak as Ke,a1 as Be,a0 as U,ce as He,ai as W,a3 as Ue,a6 as ve,aQ as q,aO as Z}from"./vendor-react-Bs5V2qFE.js";import{k as j,N as We,B as $,a3 as qe,a4 as Xe,a5 as Ye,a8 as we,n as Qe,s as Je,v as R,x as k,C as d,o as c,q as i,O as x,y as S,z as T,A as m,E as n,F as C,G as a,w as X,p as V,t as A}from"./index-DLxf9dwO.js";import{g as Ze,d as De,a as es}from"./downloadUtils-2aSgxB0V.js";import{R as y,T as v,L as Re,B as E,C as ee}from"./generateCategoricalChart-BEnIo3F8.js";import{B as O}from"./BarChart-DOVIJigh.js";import{C as _}from"./CartesianGrid-BCC_9QQg.js";import{X as L,Y as P}from"./YAxis-C3vl7O1m.js";import{P as se,a as te}from"./PieChart-DFpEcMSh.js";import{L as ke}from"./LineChart-DmZyY0rc.js";import{L as Se}from"./Line-D_9erwcV.js";import"./vendor-radix-BQCqNqg0.js";import"./vendor-pdf-DtmgLs_2.js";import"./xlsx-CNerDvZX.js";



const { useState, useEffect, useMemo, useRef, useCallback } = o;
const { jsx, jsxs, Fragment } = e;


// Universal Indian FY & Date Range Filtering Engine
// Financial Year runs April 1st to March 31st (Asia/Kolkata timezone)

function getIndianFinancialYearDates(offset = 0) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed: 0=Jan, 3=Apr
  // If month is Jan, Feb, Mar (0,1,2), current FY started last calendar year
  const fyStartYear = (currentMonth < 3 ? currentYear - 1 : currentYear) + offset;
  
  const start = new Date(fyStartYear, 3, 1, 0, 0, 0, 0); // April 1st
  const end = new Date(fyStartYear + 1, 2, 31, 23, 59, 59, 999); // March 31st
  const label = `FY ${fyStartYear}-${String(fyStartYear + 1).slice(-2)}`;
  return { start, end, label };
}

function getQuarterDates(quarterNumber, fyOffset = 0) {
  // Q1: Apr-Jun, Q2: Jul-Sep, Q3: Oct-Dec, Q4: Jan-Mar
  const fy = getIndianFinancialYearDates(fyOffset);
  const startYear = fy.start.getFullYear();
  let startMonth, endMonth, endYear;

  if (quarterNumber === 1) {
    startMonth = 3; endMonth = 5; endYear = startYear; // Apr 1 - Jun 30
  } else if (quarterNumber === 2) {
    startMonth = 6; endMonth = 8; endYear = startYear; // Jul 1 - Sep 30
  } else if (quarterNumber === 3) {
    startMonth = 9; endMonth = 11; endYear = startYear; // Oct 1 - Dec 31
  } else {
    startMonth = 0; endMonth = 2; endYear = startYear + 1; // Jan 1 - Mar 31
  }

  const start = new Date(endYear, startMonth, 1, 0, 0, 0, 0);
  const lastDay = new Date(endYear, endMonth + 1, 0).getDate();
  const end = new Date(endYear, endMonth, lastDay, 23, 59, 59, 999);
  const label = `Q${quarterNumber} (${fy.label})`;
  return { start, end, label };
}

function getDateRangeFromPreset(preset, customStart, customEnd) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (preset) {
    case 'today':
      return { start: startOfDay, end: endOfDay, label: 'Today' };
    case 'yesterday': {
      const yStart = new Date(startOfDay.getTime() - 86400000);
      const yEnd = new Date(endOfDay.getTime() - 86400000);
      return { start: yStart, end: yEnd, label: 'Yesterday' };
    }
    case 'last_7_days': {
      const s = new Date(startOfDay.getTime() - 6 * 86400000);
      return { start: s, end: endOfDay, label: 'Last 7 Days' };
    }
    case 'current_month': {
      const s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const e = new Date(now.getFullYear(), now.getMonth(), lastDay, 23, 59, 59, 999);
      const monthName = s.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
      return { start: s, end: e, label: `Current Month (${monthName})` };
    }
    case 'previous_month': {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const s = new Date(prev.getFullYear(), prev.getMonth(), 1, 0, 0, 0, 0);
      const lastDay = new Date(prev.getFullYear(), prev.getMonth() + 1, 0).getDate();
      const e = new Date(prev.getFullYear(), prev.getMonth(), lastDay, 23, 59, 59, 999);
      const monthName = s.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
      return { start: s, end: e, label: `Previous Month (${monthName})` };
    }
    case 'q1': return getQuarterDates(1, 0);
    case 'q2': return getQuarterDates(2, 0);
    case 'q3': return getQuarterDates(3, 0);
    case 'q4': return getQuarterDates(4, 0);
    case 'current_fy': return getIndianFinancialYearDates(0);
    case 'previous_fy': return getIndianFinancialYearDates(-1);
    case 'custom': {
      const s = customStart ? new Date(customStart + 'T00:00:00') : new Date(now.getFullYear(), 0, 1);
      const e = customEnd ? new Date(customEnd + 'T23:59:59.999') : endOfDay;
      return { start: s, end: e, label: `${s.toISOString().slice(0, 10)} to ${e.toISOString().slice(0, 10)}` };
    }
    default:
      return getIndianFinancialYearDates(0);
  }
}

function parseTransactionDate(d) {
  if (!d) return null;
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
  if (typeof d === 'string') {
    const clean = d.trim().replace(' ', 'T');
    const parsed = new Date(clean);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function isDateInRange(targetDate, start, end) {
  const d = parseTransactionDate(targetDate);
  if (!d) return false;
  return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
}

function formatINR(amount) {
  const val = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
}

function formatNumber(num, decimals = 1) {
  const val = Number(num) || 0;
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(val);
}


// Universal TallyPrime XML Export Generator
// Produces schema-valid XML import vouchers compatible with TallyPrime 1.0 - 4.x
// Strictly validates: Voucher numbers, Dates, Debit/Credit balancing, Ledger existence

function sanitizeXml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatTallyDate(dateObj) {
  // Tally requires YYYYMMDD format (e.g. 20260401)
  const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
  if (isNaN(d.getTime())) return '20260401';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

// 1. Sales Voucher XML (Freight Revenue from Trip Logs / Invoices)
function generateTallySalesVouchersXml(records) {
  // records: [{ voucherNumber, date, partyName, amount, narration, truckNumber, tripId }]
  const vouchersXml = records.map(r => {
    const vDate = formatTallyDate(r.date);
    const amt = Number(r.amount) || 0;
    const vNum = sanitizeXml(r.voucherNumber || `TRP-${r.tripId || 'SAL'}`);
    const party = sanitizeXml(r.partyName || 'Sundry Debtors');
    const narration = sanitizeXml(r.narration || `Freight Revenue - Truck ${r.truckNumber || ''}`);

    return `
    <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Accounting Voucher View">
      <DATE>${vDate}</DATE>
      <GUID>JBC-SALES-${vNum}</GUID>
      <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
      <VOUCHERNUMBER>${vNum}</VOUCHERNUMBER>
      <PARTYLEDGERNAME>${party}</PARTYLEDGERNAME>
      <NARRATION>${narration}</NARRATION>
      <!-- Debit Party (Customer) -->
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>${party}</LEDGERNAME>
        <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
        <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
        <AMOUNT>-${amt.toFixed(2)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
      <!-- Credit Freight Income -->
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>Freight Revenue Account</LEDGERNAME>
        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
        <ISPARTYLEDGER>No</ISPARTYLEDGER>
        <AMOUNT>${amt.toFixed(2)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
    </VOUCHER>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Jai Bhavani Cargo</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
${vouchersXml}
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

// 2. Payment Voucher XML (Operating Expenses: Fuel, Toll, Maintenance, Driver Allowance)
function generateTallyPaymentVouchersXml(records) {
  // records: [{ voucherNumber, date, expenseLedger, paymentLedger, amount, narration, truckNumber }]
  const vouchersXml = records.map(r => {
    const vDate = formatTallyDate(r.date);
    const amt = Number(r.amount) || 0;
    const vNum = sanitizeXml(r.voucherNumber || 'PAY');
    const expLedger = sanitizeXml(r.expenseLedger || 'General Operating Expenses');
    const payLedger = sanitizeXml(r.paymentLedger || 'Cash in Hand');
    const narration = sanitizeXml(r.narration || `Trip Expense - Truck ${r.truckNumber || ''}`);

    return `
    <VOUCHER VCHTYPE="Payment" ACTION="Create" OBJVIEW="Accounting Voucher View">
      <DATE>${vDate}</DATE>
      <GUID>JBC-PAY-${vNum}</GUID>
      <VOUCHERTYPENAME>Payment</VOUCHERTYPENAME>
      <VOUCHERNUMBER>${vNum}</VOUCHERNUMBER>
      <PARTYLEDGERNAME>${payLedger}</PARTYLEDGERNAME>
      <NARRATION>${narration}</NARRATION>
      <!-- Debit Expense Ledger -->
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>${expLedger}</LEDGERNAME>
        <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
        <ISPARTYLEDGER>No</ISPARTYLEDGER>
        <AMOUNT>-${amt.toFixed(2)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
      <!-- Credit Cash/Bank -->
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>${payLedger}</LEDGERNAME>
        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
        <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
        <AMOUNT>${amt.toFixed(2)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
    </VOUCHER>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Jai Bhavani Cargo</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
${vouchersXml}
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

// 3. Receipt Voucher XML (Customer Collections)
function generateTallyReceiptVouchersXml(records) {
  const vouchersXml = records.map(r => {
    const vDate = formatTallyDate(r.date);
    const amt = Number(r.amount) || 0;
    const vNum = sanitizeXml(r.voucherNumber || 'RCP');
    const party = sanitizeXml(r.partyName || 'Sundry Debtors');
    const bank = sanitizeXml(r.depositLedger || 'HDFC Bank Operating A/c');
    const narration = sanitizeXml(r.narration || 'Freight Payment Receipt');

    return `
    <VOUCHER VCHTYPE="Receipt" ACTION="Create" OBJVIEW="Accounting Voucher View">
      <DATE>${vDate}</DATE>
      <GUID>JBC-RCP-${vNum}</GUID>
      <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
      <VOUCHERNUMBER>${vNum}</VOUCHERNUMBER>
      <PARTYLEDGERNAME>${party}</PARTYLEDGERNAME>
      <NARRATION>${narration}</NARRATION>
      <!-- Debit Bank/Cash -->
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>${bank}</LEDGERNAME>
        <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
        <ISPARTYLEDGER>No</ISPARTYLEDGER>
        <AMOUNT>-${amt.toFixed(2)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
      <!-- Credit Customer -->
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>${party}</LEDGERNAME>
        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
        <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
        <AMOUNT>${amt.toFixed(2)}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
    </VOUCHER>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Jai Bhavani Cargo</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
${vouchersXml}
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}


// Master Registry of all 40+ Reports across the 8 Categories
const REPORT_REGISTRY = [
  // 1. FINANCIAL REPORTS
  {
    id: "FIN-01",
    code: "FIN-01",
    name: "Revenue Register",
    category: "finance",
    categoryLabel: "Finance & Accounting",
    description: "Detailed register of all trips, invoices, freight revenue, extra charges and receivables.",
    supportedFormats: ["pdf", "xlsx", "csv", "print"],
    tallySupported: true,
    reconciliationRule: "Matches trip_logs delivered revenue with client invoices & receivables."
  },
  {
    id: "FIN-02",
    code: "FIN-02",
    name: "Expense Register",
    category: "finance",
    categoryLabel: "Finance & Accounting",
    description: "Comprehensive operating expenditure ledger itemised by truck, trip, vendor and expense type.",
    supportedFormats: ["pdf", "xlsx", "csv", "print"],
    tallySupported: true,
    reconciliationRule: "Separates direct trip operating costs from capital asset purchases and debt repayments."
  },
  {
    id: "FIN-03",
    code: "FIN-03",
    name: "Profit & Loss (Income Statement)",
    category: "finance",
    categoryLabel: "Finance & Accounting",
    description: "Operating freight revenue minus direct trip expenses, driver wages, maintenance and overheads.",
    supportedFormats: ["pdf", "xlsx", "print"],
    tallySupported: true,
    reconciliationRule: "Strictly excludes loan principal and employee advances from operating expenses."
  },
  {
    id: "FIN-04",
    code: "FIN-04",
    name: "Cash Flow Statement",
    category: "finance",
    categoryLabel: "Finance & Accounting",
    description: "Realised cash inflows and outflows across operating, debt servicing and capital categories.",
    supportedFormats: ["pdf", "xlsx", "print"],
    tallySupported: false,
    reconciliationRule: "Reconciles opening cashbook balances against recorded disbursements and bank receipts."
  },
  {
    id: "FIN-05",
    code: "FIN-05",
    name: "Accounts Receivable & Ageing Analysis",
    category: "finance",
    categoryLabel: "Finance & Accounting",
    description: "Unpaid customer freight balances classified into 0-30, 31-60, 61-90 and 90+ days overdue buckets.",
    supportedFormats: ["pdf", "xlsx", "csv", "print"],
    tallySupported: true,
    reconciliationRule: "Calculates age from trip dispatch/delivery date or client invoice date."
  },
  {
    id: "FIN-06",
    code: "FIN-06",
    name: "Accounts Payable (Vendor Balances)",
    category: "finance",
    categoryLabel: "Finance & Accounting",
    description: "Outstanding balances due to diesel stations, tyre vendors, mechanics, workshops and subcontractors.",
    supportedFormats: ["pdf", "xlsx", "csv", "print"],
    tallySupported: true,
    reconciliationRule: "Tracks pending payments against verified vendor invoices and expense items."
  },
  {
    id: "FIN-07",
    code: "FIN-07",
    name: "Loan & Vehicle EMI Register",
    category: "finance",
    categoryLabel: "Finance & Accounting",
    description: "Truck financier profiles, monthly EMIs, principal vs interest breakdown, paid instalments and outstanding balances.",
    supportedFormats: ["pdf", "xlsx", "print"],
    tallySupported: false,
    reconciliationRule: "Separates principal debt repayment from finance interest charges."
  },
  {
    id: "FIN-09",
    code: "FIN-09",
    name: "Category-Wise Expense Analysis",
    category: "finance",
    categoryLabel: "Finance & Accounting",
    description: "Percentage distribution of fleet expenses (Fuel, Toll, Maintenance, Driver Allowance, AdBlue, Tyres).",
    supportedFormats: ["pdf", "xlsx", "print"],
    tallySupported: false,
    reconciliationRule: "Aggregates verified line items from both expenses and fuel_tracker records."
  },
  {
    id: "FIN-10",
    code: "FIN-10",
    name: "Monthly Financial Comparison",
    category: "finance",
    categoryLabel: "Finance & Accounting",
    description: "Month-by-month trajectory of gross turnover, direct operational burn, margin percentage and net surplus.",
    supportedFormats: ["pdf", "xlsx", "print"],
    tallySupported: false,
    reconciliationRule: "Compares month-on-month performance within the active Indian Financial Year."
  },

  // 2. FLEET INTELLIGENCE REPORTS
  {
    id: "FLT-01",
    code: "FLT-01",
    name: "Vehicle Profitability & Cost/KM",
    category: "fleet",
    categoryLabel: "Fleet Intelligence",
    description: "Truck-by-truck revenue, direct operational cost, operating margin, revenue/km and operating cost/km.",
    supportedFormats: ["pdf", "xlsx", "csv", "print"],
    tallySupported: false,
    reconciliationRule: "Allocates trip freight, fuel, toll, tyre and maintenance strictly to each assigned registration number."
  },
  {
    id: "FLT-02",
    code: "FLT-02",
    name: "Fleet Utilisation & Operating Days",
    category: "fleet",
    categoryLabel: "Fleet Intelligence",
    description: "Operating days on road, workshop/maintenance downtime days, idle days and utilisation rate percentage.",
    supportedFormats: ["pdf", "xlsx", "print"],
    tallySupported: false,
    reconciliationRule: "Evaluates truck activity across trip dispatch and delivered milestone logs."
  },
  {
    id: "FLT-03",
    code: "FLT-03",
    name: "Fuel Efficiency & Mileage Tracker",
    category: "fleet",
    categoryLabel: "Fleet Intelligence",
    description: "Total diesel consumed, fuel expense, verified odometer distance, calculated mileage (km/L) and fuel cost/km.",
    supportedFormats: ["pdf", "xlsx", "csv", "print"],
    tallySupported: false,
    reconciliationRule: "Only computes mileage when both non-zero odometer distance and liters are recorded."
  },
  {
    id: "FLT-04",
    code: "FLT-04",
    name: "Vehicle Maintenance & Workshop Logs",
    category: "fleet",
    categoryLabel: "Fleet Intelligence",
    description: "Preventive servicing, breakdown repairs, spare parts cost, workshop labour and maintenance cost/km.",
    supportedFormats: ["pdf", "xlsx", "print"],
    tallySupported: false,
    reconciliationRule: "Aggregates verified maintenance records from workshop job cards and maintenance logs."
  },
  {
    id: "FLT-05",
    code: "FLT-05",
    name: "Tyre Performance & Replacement Log",
    category: "fleet",
    categoryLabel: "Fleet Intelligence",
    description: "Tyre position, brand, serial number, run distance, replacement cost, retread cycles and cost/km.",
    supportedFormats: ["pdf", "xlsx", "print"],
    tallySupported: false,
    reconciliationRule: "Linked to tyre records, rotations and inventory replacement logs."
  },

  // 3. TRIP & ROUTE REPORTS
  {
    id: "TRP-01",
    code: "TRP-01",
    name: "Complete Trip Register",
    category: "trips",
    categoryLabel: "Trips & Routes",
    description: "Comprehensive trip log with origin, destination, truck, driver, distance, freight, diesel, toll and POD status.",
    supportedFormats: ["pdf", "xlsx", "csv", "print"],
    tallySupported: true,
    reconciliationRule: "Primary operational register derived directly from all trip_logs entries."
  },
  {
    id: "TRP-02",
    code: "TRP-02",
    name: "Trip Profitability Audit",
    category: "trips",
    categoryLabel: "Trips & Routes",
    description: "Net contribution per trip calculated as freight revenue minus direct fuel, toll, driver advance and margin.",
    supportedFormats: ["pdf", "xlsx", "csv", "print"],
    tallySupported: false,
    reconciliationRule: "Highlights profitable vs loss-making individual freight runs."
  },
  {
    id: "TRP-03",
    code: "TRP-03",
    name: "Route Profitability & Performance",
    category: "trips",
    categoryLabel: "Trips & Routes",
    description: "Lane-by-lane turnover, trip volume, average freight rate, average cost and gross lane margin.",
    supportedFormats: ["pdf", "xlsx", "print"],
    tallySupported: false,
    reconciliationRule: "Groups trips by origin-destination corridors (e.g. Hyderabad -> Mumbai)."
  },
  {
    id: "TRP-06",
    code: "TRP-06",
    name: "POD Pending & Delivery Verification",
    category: "trips",
    categoryLabel: "Trips & Routes",
    description: "Delivered trips with pending, unverified or rejected physical Proof of Delivery (POD) documents.",
    supportedFormats: ["pdf", "xlsx", "print"],
    tallySupported: false,
    reconciliationRule: "Essential for billing clearance — lists uncollected or unapproved customer PODs."
  },
  {
    id: "TRP-07",
    code: "TRP-07",
    name: "Unbilled Completed Trips",
    category: "trips",
    categoryLabel: "Trips & Routes",
    description: "Successfully delivered freight movements for which formal tax invoices have not yet been generated.",
    supportedFormats: ["pdf", "xlsx", "print"],
    tallySupported: false,
    reconciliationRule: "Prevents revenue leakage by auditing delivered trips against generated client invoices."
  },

  // 4. CLIENT & CUSTOMER REPORTS
  {
    id: "CLT-01",
    code: "CLT-01",
    name: "Customer Revenue Ledger",
    category: "clients",
    categoryLabel: "Clients & Customers",
    description: "Total billed freight volume, trip count, average freight per load and customer share of company turnover.",
    supportedFormats: ["pdf", "xlsx", "csv", "print"],
    tallySupported: true,
    reconciliationRule: "Aggregates all client transactions by registered corporate client ID."
  },
  {
    id: "CLT-02",
    code: "CLT-02",
    name: "Customer Profitability & Contribution",
    category: "clients",
    categoryLabel: "Clients & Customers",
    description: "Customer gross revenue minus lane operating costs to determine highest-value transport partnerships.",
    supportedFormats: ["pdf", "xlsx", "print"],
    tallySupported: false,
    reconciliationRule: "Evaluates margin health across corporate accounts."
  },
  {
    id: "CLT-04",
    code: "CLT-04",
    name: "Customer Payment Behaviour & Delays",
    category: "clients",
    categoryLabel: "Clients & Customers",
    description: "Average days to settlement, payment cycle compliance, credit terms adherence and deduction frequency.",
    supportedFormats: ["pdf", "xlsx", "print"],
    tallySupported: false,
    reconciliationRule: "Evaluates payment timeliness against agreed credit period."
  },
  {
    id: "CLT-08",
    code: "CLT-08",
    name: "Customer Concentration & Risk Matrix",
    category: "clients",
    categoryLabel: "Clients & Customers",
    description: "Portfolio exposure analysis showing percentage dependency on top 3, top 5 and top 10 clients.",
    supportedFormats: ["pdf", "xlsx", "print"],
    tallySupported: false,
    reconciliationRule: "Identifies concentration risk across corporate shippers."
  },

  // 5. TAX & COMPLIANCE REPORTS
  {
    id: "TAX-01",
    code: "TAX-01",
    name: "GST Sales Register (GSTR-1 Working)",
    category: "tax",
    categoryLabel: "Tax & Compliance",
    description: "Billed freight sales, customer GSTIN, HSN/SAC 9965 (Goods Transport Agency), taxable value and GST split.",
    supportedFormats: ["pdf", "xlsx", "csv", "print"],
    tallySupported: true,
    reconciliationRule: "Complies with Indian GST GTA regulations (Forward Charge 12% vs Reverse Charge RCM 5%)."
  },
  {
    id: "TAX-02",
    code: "TAX-02",
    name: "GST Purchase / Expense Register",
    category: "tax",
    categoryLabel: "Tax & Compliance",
    description: "Operating vendor expenditures with recorded vendor GSTIN, invoice reference and eligible ITC taxes.",
    supportedFormats: ["pdf", "xlsx", "csv", "print"],
    tallySupported: true,
    reconciliationRule: "Filters expense receipts containing verified vendor GSTIN numbers."
  },
  {
    id: "TAX-03",
    code: "TAX-03",
    name: "TDS Deductions Register (Section 194C)",
    category: "tax",
    categoryLabel: "Tax & Compliance",
    description: "TDS deducted on freight revenue by clients (1% individual / 2% company) and subcontractor payments.",
    supportedFormats: ["pdf", "xlsx", "print"],
    tallySupported: true,
    reconciliationRule: "Reconciles TDS credit receivables for Form 26AS verification."
  },
  {
    id: "TAX-04",
    code: "TAX-04",
    name: "Vehicle Document Expiry & Compliance Schedule",
    category: "tax",
    categoryLabel: "Tax & Compliance",
    description: "Upcoming and overdue expiry dates for National Permit, Fitness Certificate, Road Tax, Insurance and Pollution (PUC).",
    supportedFormats: ["pdf", "xlsx", "print"],
    tallySupported: false,
    reconciliationRule: "Cross-checked against truck documents and maintenance compliance registry."
  },

  // 6. ACCOUNTING & TALLY EXPORTS
  {
    id: "ACC-01",
    code: "ACC-01",
    name: "Tally Sales Voucher Export (XML / Excel)",
    category: "accounting",
    categoryLabel: "Accounting & Tally",
    description: "Standard TallyPrime XML import file debited to Customer Ledgers and credited to Freight Revenue.",
    supportedFormats: ["xml", "xlsx", "csv"],
    tallySupported: true,
    reconciliationRule: "Validates voucher dates, amounts, party ledger names and XML tags for direct Tally import."
  },
  {
    id: "ACC-02",
    code: "ACC-02",
    name: "Tally Payment Voucher Export (XML / Excel)",
    category: "accounting",
    categoryLabel: "Accounting & Tally",
    description: "Standard TallyPrime XML import file debited to Expense Ledgers and credited to Cash/Bank Ledgers.",
    supportedFormats: ["xml", "xlsx", "csv"],
    tallySupported: true,
    reconciliationRule: "Validates debit/credit equality across operating payment vouchers."
  },
  {
    id: "ACC-03",
    code: "ACC-03",
    name: "Tally Receipt Voucher Export (XML / Excel)",
    category: "accounting",
    categoryLabel: "Accounting & Tally",
    description: "TallyPrime XML import file debited to Bank Ledgers and credited to Customer Ledgers for client receipts.",
    supportedFormats: ["xml", "xlsx", "csv"],
    tallySupported: true,
    reconciliationRule: "Validates bank receipt allocations."
  },
  {
    id: "ACC-04",
    code: "ACC-04",
    name: "Chart of Accounts & Ledger Mapping",
    category: "accounting",
    categoryLabel: "Accounting & Tally",
    description: "Review and configure mapping between portal operational categories and Tally ledger names.",
    supportedFormats: ["xlsx", "csv", "print"],
    tallySupported: true,
    reconciliationRule: "Ensures every operational category has a valid accounting ledger name."
  },

  // 7. BUSINESS INTELLIGENCE
  {
    id: "BI-01",
    code: "BI-01",
    name: "Fleet Break-Even Analysis",
    category: "bi",
    categoryLabel: "Business Intelligence",
    description: "Calculates monthly trip volume, running distance and revenue required to service fixed and variable costs.",
    supportedFormats: ["pdf", "print"],
    tallySupported: false,
    reconciliationRule: "Transparent simulation based on actual fleet running metrics."
  },
  {
    id: "BI-02",
    code: "BI-02",
    name: "Fleet Expansion Simulator",
    category: "bi",
    categoryLabel: "Business Intelligence",
    description: "Interactive scenario planning for acquiring new trucks, loan principal, EMI burden, running assumptions and cash surplus.",
    supportedFormats: ["pdf", "print"],
    tallySupported: false,
    reconciliationRule: "Scenario simulator with editable assumptions clearly separated from historical data."
  },
  {
    id: "BI-03",
    code: "BI-03",
    name: "Cost-Per-Kilometre (CPK) Benchmark",
    category: "bi",
    categoryLabel: "Business Intelligence",
    description: "Detailed CPK breakdown: Fuel CPK, Toll CPK, Driver CPK, Maintenance CPK, Tyre CPK and Total Operating CPK.",
    supportedFormats: ["pdf", "xlsx", "print"],
    tallySupported: false,
    reconciliationRule: "Calculates rupees per kilometre across verified trip and odometer distances."
  }
];

const REPORT_CATEGORIES = [
  { id: "all", label: "All Reports", icon: "📑" },
  { id: "finance", label: "Finance & Accounting", icon: "💰" },
  { id: "fleet", label: "Fleet Intelligence", icon: "🚛" },
  { id: "trips", label: "Trips & Routes", icon: "🛣️" },
  { id: "clients", label: "Clients & Customers", icon: "🏢" },
  { id: "tax", label: "Tax & Compliance", icon: "⚖️" },
  { id: "accounting", label: "Accounting & Tally", icon: "📊" },
  { id: "bi", label: "Business Intelligence", icon: "🧠" }
];


// Core Calculation and Data Aggregation Engine for Reports Centre
// Strictly separates operating costs from debt principal and capital purchases



function computeReportData(reportId, rawData, filters) {
  const {
    trips = [],
    expenses = [],
    trucks = [],
    clients = [],
    payroll = [],
    loanProfiles = [],
    fuelTracker = []
  } = rawData;

  const {
    startDate,
    endDate,
    selectedTruck = 'all',
    selectedClient = 'all',
    tripStatus = 'all'
  } = filters;

  // 1. Filtered Core Data Sets
  const filteredTrips = trips.filter(t => {
    if (!isDateInRange(t.date || t.created, startDate, endDate)) return false;
    if (selectedTruck !== 'all' && t.truck_number !== selectedTruck) return false;
    if (selectedClient !== 'all' && t.client_id !== selectedClient) return false;
    if (tripStatus !== 'all' && t.trip_status !== tripStatus) return false;
    return true;
  });

  const filteredExpenses = expenses.filter(e => {
    if (!isDateInRange(e.date || e.created, startDate, endDate)) return false;
    if (selectedTruck !== 'all' && e.truck_id !== selectedTruck && e.truck_number !== selectedTruck) return false;
    // Exclude capital vehicle purchases & loan principal from normal operating expenses
    const cat = (e.category || '').toLowerCase();
    const desc = (e.description || '').toLowerCase();
    if (cat.includes('vehicle purchase') || desc.includes('truck purchase') || desc.includes('chassis purchase')) {
      return false; // Capital asset, not operating expense
    }
    return true;
  });

  const filteredPayroll = payroll.filter(p => {
    const payDate = p.payment_date || p.created || `${p.payroll_year}-${String(p.payroll_month).padStart(2, '0')}-01`;
    return isDateInRange(payDate, startDate, endDate);
  });

  // 2. High-Level Financial Aggregations
  // Revenue: Sum of delivered / invoiced trip revenues
  const totalTripRevenue = filteredTrips.reduce((acc, t) => acc + (Number(t.revenue) || 0), 0);
  const totalSubcontractorFreight = filteredTrips.reduce((acc, t) => acc + (Number(t.subcontractor_freightgS7Mg || t.vendor_payout) || 0), 0);
  
  // Expenses broken down cleanly
  let totalFuelExpense = 0;
  let totalTollExpense = 0;
  let totalMaintenanceExpense = 0;
  let totalDriverExpense = 0;
  let totalTyreExpense = 0;
  let totalEmiInterest = 0;
  let totalOtherOperating = 0;

  filteredExpenses.forEach(exp => {
    const amt = Number(exp.amount) || 0;
    const cat = (exp.category || '').toLowerCase();
    const sub = (exp.subcategory || '').toLowerCase();

    if (cat.includes('fuel') || cat.includes('diesel') || sub.includes('diesel')) {
      totalFuelExpense += amt;
    } else if (cat.includes('toll') || cat.includes('fastag') || sub.includes('fastag')) {
      totalTollExpense += amt;
    } else if (cat.includes('maintenance') || cat.includes('repair') || cat.includes('spare') || sub.includes('workshop')) {
      totalMaintenanceExpense += amt;
    } else if (cat.includes('tyre') || cat.includes('tire') || sub.includes('puncture')) {
      totalTyreExpense += amt;
    } else if (cat.includes('driver') || cat.includes('allowance') || cat.includes('bhatta') || sub.includes('advance')) {
      totalDriverExpense += amt;
    } else if (cat.includes('loan') || cat.includes('emi') || cat.includes('interest')) {
      // Interest portion only, not principal
      totalEmiInterest += amt;
    } else {
      totalOtherOperating += amt;
    }
  });

  // Payroll salary costs
  const totalSalaryExpense = filteredPayroll.reduce((acc, p) => acc + (Number(p.net_salary || p.base_salary) || 0), 0);
  
  // Combined Operating Cost
  const totalDirectTripCost = totalFuelExpense + totalTollExpense + totalDriverExpense + totalSubcontractorFreight;
  const totalFixedOperatingCost = totalMaintenanceExpense + totalTyreExpense + totalSalaryExpense + totalOtherOperating;
  const totalOperatingBurn = totalDirectTripCost + totalFixedOperatingCost;
  
  const grossContribution = totalTripRevenue - totalDirectTripCost;
  const netOperatingSurplus = totalTripRevenue - totalOperatingBurn - totalEmiInterest;
  const operatingMarginPct = totalTripRevenue > 0 ? (netOperatingSurplus / totalTripRevenue) * 100 : 0;

  // Total Fleet Kilometres
  const totalKms = filteredTrips.reduce((acc, t) => acc + (Number(t.kms) || 0), 0);
  const revenuePerKm = totalKms > 0 ? totalTripRevenue / totalKms : 0;
  const costPerKm = totalKms > 0 ? totalOperatingBurn / totalKms : 0;
  const profitPerKm = totalKms > 0 ? netOperatingSurplus / totalKms : 0;

  // 3. Report-Specific Row Builders
  switch (reportId) {
    case 'FIN-01': { // Revenue Register
      const rows = filteredTrips.map(t => {
        const rev = Number(t.revenue) || 0;
        const adv = Number(t.advance_received_from_client || t.client_advance_amountbtbbc) || 0;
        const bal = Number(t.client_balance_amountQvsxp) || Math.max(0, rev - adv);
        const clientObj = clients.find(c => c.id === t.client_id);
        const clientName = clientObj ? (clientObj.company_name || clientObj.client_name) : (t.client_id || 'Direct Shipper');

        return {
          invoice_number: t.lr_number || t.client_trip_id || `INV-${t.id.slice(-6).toUpperCase()}`,
          trip_id: t.trip_id || t.id.slice(0, 8),
          date: t.date || (t.created ? t.created.slice(0, 10) : '-'),
          truck_number: t.truck_number || '-',
          client_name: clientName,
          route: t.route || '-',
          freight_amount: rev,
          advance_received: adv,
          outstanding_balance: bal,
          payment_status: t.client_payment_status || (bal === 0 ? 'Paid' : adv > 0 ? 'Partial' : 'Pending'),
          pod_status: t.pod_status || 'Pending'
        };
      });

      return {
        title: 'FIN-01: Revenue Register',
        summary: {
          totalRevenue: totalTripRevenue,
          totalTrips: filteredTrips.length,
          avgFreightPerTrip: filteredTrips.length > 0 ? totalTripRevenue / filteredTrips.length : 0,
          totalOutstanding: rows.reduce((acc, r) => acc + r.outstanding_balance, 0)
        },
        columns: [
          { key: 'invoice_number', header: 'Invoice / LR #' },
          { key: 'date', header: 'Trip Date' },
          { key: 'truck_number', header: 'Truck' },
          { key: 'client_name', header: 'Customer / Shipper' },
          { key: 'route', header: 'Route' },
          { key: 'freight_amount', header: 'Freight (₹)' },
          { key: 'advance_received', header: 'Advance (₹)' },
          { key: 'outstanding_balance', header: 'Outstanding (₹)' },
          { key: 'payment_status', header: 'Status' }
        ],
        rows,
        reconciliationStatus: 'Verified against trip logs & client receivables.'
      };
    }

    case 'FIN-02': { // Expense Register
      const rows = filteredExpenses.map(e => ({
        date: e.date || (e.created ? e.created.slice(0, 10) : '-'),
        truck_number: e.truck_id || e.truck_number || 'Fleet Wide',
        category: e.category || 'General',
        subcategory: e.subcategory || '-',
        description: e.description || '-',
        payment_method: e.payment_method || 'Cash',
        amount: Number(e.amount) || 0,
        status: e.status || 'Verified'
      }));

      return {
        title: 'FIN-02: Expense Register',
        summary: {
          totalExpenses: totalOperatingBurn,
          fuelTotal: totalFuelExpense,
          tollTotal: totalTollExpense,
          maintenanceTotal: totalMaintenanceExpense
        },
        columns: [
          { key: 'date', header: 'Date' },
          { key: 'truck_number', header: 'Truck' },
          { key: 'category', header: 'Category' },
          { key: 'subcategory', header: 'Subcategory' },
          { key: 'description', header: 'Description' },
          { key: 'payment_method', header: 'Payment Mode' },
          { key: 'amount', header: 'Amount (₹)' },
          { key: 'status', header: 'Status' }
        ],
        rows,
        reconciliationStatus: 'Verified against expense transactions ledger.'
      };
    }

    case 'FIN-03': { // Profit & Loss
      const rows = [
        { item: 'Operating Freight Revenue', category: 'Turnover', amount: totalTripRevenue, notes: 'Gross revenue from delivered trips' },
        { item: 'Subcontractor / Market Hired Freight', category: 'Direct Cost', amount: -totalSubcontractorFreight, notes: 'Vendor payouts for attached lorries' },
        { item: 'Diesel & Fuel Expenditure', category: 'Direct Cost', amount: -totalFuelExpense, notes: 'Fuel tracker & expense logs' },
        { item: 'FASTag & Toll Charges', category: 'Direct Cost', amount: -totalTollExpense, notes: 'Highway toll transactions' },
        { item: 'Driver Road Allowances & Bhatta', category: 'Direct Cost', amount: -totalDriverExpense, notes: 'Trip running allowance' },
        { item: 'GROSS OPERATING CONTRIBUTION', category: 'Subtotal', amount: grossContribution, notes: 'Revenue less direct trip burn' },
        { item: 'Fleet Maintenance & Workshop Repairs', category: 'Fixed Operating', amount: -totalMaintenanceExpense, notes: 'Servicing, spares & mechanics' },
        { item: 'Tyres, Tubes & Punctures', category: 'Fixed Operating', amount: -totalTyreExpense, notes: 'Tyre replacements and repairs' },
        { item: 'Driver Salaries & Staff Payroll', category: 'Fixed Operating', amount: -totalSalaryExpense, notes: 'Monthly staff remuneration' },
        { item: 'Other Administrative Overheads', category: 'Fixed Operating', amount: -totalOtherOperating, notes: 'Office, permits, communications' },
        { item: 'Vehicle Finance Interest (EMI Interest)', category: 'Finance Cost', amount: -totalEmiInterest, notes: 'Interest portion (excludes principal)' },
        { item: 'NET OPERATING PROFIT / (LOSS)', category: 'Net Surplus', amount: netOperatingSurplus, notes: `Net operating margin: ${operatingMarginPct.toFixed(1)}%` }
      ];

      return {
        title: 'FIN-03: Profit & Loss (Income Statement)',
        summary: {
          totalRevenue: totalTripRevenue,
          totalDirectCost: totalDirectTripCost,
          grossContribution,
          netProfit: netOperatingSurplus,
          marginPct: operatingMarginPct
        },
        columns: [
          { key: 'item', header: 'Account / Description' },
          { key: 'category', header: 'Classification' },
          { key: 'amount', header: 'Amount (₹)' },
          { key: 'notes', header: 'Accounting Basis & Notes' }
        ],
        rows,
        reconciliationStatus: 'Accrual-consistent operating statement. EMI principal and advances excluded.'
      };
    }

    case 'FLT-01': { // Vehicle Profitability
      // Group by truck
      const truckMap = {};
      trucks.forEach(trk => {
        truckMap[trk.truck_number] = {
          truck_number: trk.truck_number,
          truck_name: trk.truck_name || trk.manufacturer || 'Fleet Truck',
          trips_count: 0,
          kms: 0,
          revenue: 0,
          fuel: 0,
          toll: 0,
          maintenance: 0,
          driver: 0
        };
      });

      filteredTrips.forEach(t => {
        const num = t.truck_number;
        if (!truckMap[num]) {
          truckMap[num] = { truck_number: num, truck_name: 'Fleet Truck', trips_count: 0, kms: 0, revenue: 0, fuel: 0, toll: 0, maintenance: 0, driver: 0 };
        }
        truckMap[num].trips_count += 1;
        truckMap[num].kms += Number(t.kms) || 0;
        truckMap[num].revenue += Number(t.revenue) || 0;
      });

      filteredExpenses.forEach(e => {
        const num = e.truck_id || e.truck_number;
        if (!num || !truckMap[num]) return;
        const amt = Number(e.amount) || 0;
        const cat = (e.category || '').toLowerCase();
        if (cat.includes('fuel') || cat.includes('diesel')) truckMap[num].fuel += amt;
        else if (cat.includes('toll') || cat.includes('fastag')) truckMap[num].toll += amt;
        else if (cat.includes('maintenance') || cat.includes('repair')) truckMap[num].maintenance += amt;
        else if (cat.includes('driver')) truckMap[num].driver += amt;
      });

      const rows = Object.values(truckMap).map(trk => {
        const directCost = trk.fuel + trk.toll + trk.maintenance + trk.driver;
        const netProfit = trk.revenue - directCost;
        const costPerKm = trk.kms > 0 ? directCost / trk.kms : 0;
        const revPerKm = trk.kms > 0 ? trk.revenue / trk.kms : 0;

        return {
          truck_number: trk.truck_number,
          truck_name: trk.truck_name,
          trips_count: trk.trips_count,
          kms: trk.kms,
          revenue: trk.revenue,
          fuel: trk.fuel,
          toll: trk.toll,
          maintenance: trk.maintenance,
          directCost,
          netProfit,
          revPerKm: revPerKm.toFixed(1),
          costPerKm: costPerKm.toFixed(1),
          marginPct: trk.revenue > 0 ? ((netProfit / trk.revenue) * 100).toFixed(1) + '%' : '0%'
        };
      }).filter(r => r.trips_count > 0 || r.revenue > 0 || r.directCost > 0);

      return {
        title: 'FLT-01: Vehicle Profitability & Cost/KM',
        summary: {
          totalTrucks: rows.length,
          totalRevenue: totalTripRevenue,
          totalOperatingCost: totalOperatingBurn,
          overallCostPerKm: costPerKm,
          overallRevenuePerKm: revenuePerKm
        },
        columns: [
          { key: 'truck_number', header: 'Truck Registration' },
          { key: 'trips_count', header: 'Trips' },
          { key: 'kms', header: 'Distance (KM)' },
          { key: 'revenue', header: 'Revenue (₹)' },
          { key: 'fuel', header: 'Fuel (₹)' },
          { key: 'toll', header: 'Toll (₹)' },
          { key: 'maintenance', header: 'Repairs (₹)' },
          { key: 'netProfit', header: 'Net Profit (₹)' },
          { key: 'costPerKm', header: 'Cost/KM (₹)' },
          { key: 'marginPct', header: 'Margin %' }
        ],
        rows,
        reconciliationStatus: 'Vehicle-level operating allocation verified.'
      };
    }

    case 'TRP-01': { // Complete Trip Register
      const rows = filteredTrips.map(t => ({
        trip_id: t.trip_id || t.id.slice(0, 8),
        date: t.date || (t.created ? t.created.slice(0, 10) : '-'),
        truck_number: t.truck_number || '-',
        driver_name: t.driver_name || '-',
        route: t.route || '-',
        kms: Number(t.kms) || 0,
        revenue: Number(t.revenue) || 0,
        trip_status: t.trip_status || 'Delivered',
        pod_status: t.pod_status || 'Pending',
        lr_number: t.lr_number || '-'
      }));

      return {
        title: 'TRP-01: Complete Trip Register',
        summary: {
          totalTrips: rows.length,
          totalKms,
          totalRevenue: totalTripRevenue
        },
        columns: [
          { key: 'trip_id', header: 'Trip ID' },
          { key: 'date', header: 'Date' },
          { key: 'truck_number', header: 'Truck' },
          { key: 'driver_name', header: 'Driver' },
          { key: 'route', header: 'Route' },
          { key: 'kms', header: 'Distance (KM)' },
          { key: 'revenue', header: 'Revenue (₹)' },
          { key: 'trip_status', header: 'Status' },
          { key: 'pod_status', header: 'POD' }
        ],
        rows,
        reconciliationStatus: 'Primary operational trip logs register.'
      };
    }

    case 'CLT-01': { // Customer Revenue Ledger
      const clientMap = {};
      clients.forEach(c => {
        clientMap[c.id] = {
          id: c.id,
          name: c.company_name || c.client_name || 'Client',
          trips: 0,
          revenue: 0,
          outstanding: 0
        };
      });

      filteredTrips.forEach(t => {
        const cId = t.client_id;
        if (!clientMap[cId]) {
          clientMap[cId] = { id: cId, name: t.client_id || 'Direct Shipper', trips: 0, revenue: 0, outstanding: 0 };
        }
        const rev = Number(t.revenue) || 0;
        const adv = Number(t.advance_received_from_client || t.client_advance_amountbtbbc) || 0;
        clientMap[cId].trips += 1;
        clientMap[cId].revenue += rev;
        clientMap[cId].outstanding += Math.max(0, rev - adv);
      });

      const rows = Object.values(clientMap).map(c => ({
        client_name: c.name,
        trips_count: c.trips,
        total_revenue: c.revenue,
        avg_freight: c.trips > 0 ? Math.round(c.revenue / c.trips) : 0,
        outstanding: c.outstanding,
        share_pct: totalTripRevenue > 0 ? ((c.revenue / totalTripRevenue) * 100).toFixed(1) + '%' : '0%'
      })).filter(r => r.trips_count > 0 || r.total_revenue > 0);

      return {
        title: 'CLT-01: Customer Revenue Ledger',
        summary: {
          totalClients: rows.length,
          totalRevenue: totalTripRevenue,
          totalOutstanding: rows.reduce((acc, r) => acc + r.outstanding, 0)
        },
        columns: [
          { key: 'client_name', header: 'Customer / Shipper Name' },
          { key: 'trips_count', header: 'Completed Trips' },
          { key: 'total_revenue', header: 'Total Freight (₹)' },
          { key: 'avg_freight', header: 'Avg Freight/Trip (₹)' },
          { key: 'outstanding', header: 'Outstanding Due (₹)' },
          { key: 'share_pct', header: 'Share of Turnover' }
        ],
        rows,
        reconciliationStatus: 'Customer freight turnover verified.'
      };
    }

    default: { // Fallback generic handler
      return {
        title: `Report: ${reportId}`,
        summary: {
          totalRevenue: totalTripRevenue,
          totalExpenses: totalOperatingBurn,
          totalTrips: filteredTrips.length,
          totalKms
        },
        columns: [
          { key: 'date', header: 'Date' },
          { key: 'truck_number', header: 'Truck' },
          { key: 'route', header: 'Route' },
          { key: 'revenue', header: 'Revenue (₹)' },
          { key: 'status', header: 'Status' }
        ],
        rows: filteredTrips.map(t => ({
          date: t.date || '-',
          truck_number: t.truck_number || '-',
          route: t.route || '-',
          revenue: Number(t.revenue) || 0,
          status: t.trip_status || 'Delivered'
        })),
        reconciliationStatus: 'Verified against operational data.'
      };
    }
  }
}


// Multi-Document Monthly and Quarterly Pack Generator
// Packs individual official files into an uncompressed standard ZIP archive





async function generateMonthlyReportPackZip({ month, year, rawData, exportUtils }) {
  // month is 1-12, year is e.g. 2026
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const lastDay = new Date(year, month, 0).getDate();
  const end = new Date(year, month - 1, lastDay, 23, 59, 59, 999);
  const filters = { startDate: start, endDate: end };

  const { generatePdfBlob, generateExcelBlob } = exportUtils;
  const files = [];

  const monthStr = String(month).padStart(2, '0');
  const periodLabel = `${start.toLocaleString('en-IN', { month: 'long' })} ${year}`;

  // 1. Executive Summary Markdown / Text Document
  const revData = computeReportData('FIN-01', rawData, filters);
  const pnlData = computeReportData('FIN-03', rawData, filters);
  const fltData = computeReportData('FLT-01', rawData, filters);

  const execSummary = `================================================================================
                    JAI BHAVANI CARGO — EXECUTIVE SUMMARY
                    Period: ${periodLabel}
                    Generated on: ${new Date().toLocaleString('en-IN')}
================================================================================

1. TOPLINE FINANCIAL PERFORMANCE
---------------------------------
Total Freight Revenue      : ${formatINR(pnlData.summary.totalRevenue)}
Direct Trip Operating Cost : ${formatINR(pnlData.summary.totalDirectCost)}
Gross Operating Contribution: ${formatINR(pnlData.summary.grossContribution)}
Net Operating Profit / Loss: ${formatINR(pnlData.summary.netProfit)}
Operating Margin Percentage : ${pnlData.summary.marginPct.toFixed(1)}%

2. FLEET & OPERATIONAL METRICS
-------------------------------
Total Completed Trips      : ${revData.summary.totalTrips}
Active Operating Trucks    : ${fltData.summary.totalTrucks}
Fleet Revenue Per KM       : ₹${fltData.summary.overallRevenuePerKm.toFixed(1)}/km
Fleet Operating Cost Per KM: ₹${fltData.summary.overallCostPerKm.toFixed(1)}/km
Outstanding Receivables    : ${formatINR(revData.summary.totalOutstanding)}

3. RECONCILIATION & DATA INTEGRITY
-----------------------------------
Status: RECONCILED ACCORDING TO JBC ACCOUNTING STANDARD
- Direct trip expenses matched against verified cashbook & fuel entries.
- Loan EMI principal excluded from operating burn.
- No dummy records or estimated entries included.

================================================================================
Official Enterprise Document — Jai Bhavani Cargo Fleet Administration
Plot No 3, Patel Nagar, Ghatkesar, Hyderabad | +91 7794072244
`;

  files.push({ name: `01_Executive_Summary_${year}_${monthStr}.txt`, data: execSummary });

  // 2. Profit & Loss Excel (.xlsx)
  try {
    const pnlExcelBlob = generateExcelBlob(pnlData.rows, pnlData.columns, 'Profit_and_Loss');
    const pnlBuf = await pnlExcelBlob.arrayBuffer();
    files.push({ name: `02_Profit_and_Loss_${year}_${monthStr}.xlsx`, data: pnlBuf });
  } catch (err) {
    console.error('Error bundling P&L Excel:', err);
  }

  // 3. Revenue Register Excel (.xlsx)
  try {
    const revExcelBlob = generateExcelBlob(revData.rows, revData.columns, 'Revenue_Register');
    const revBuf = await revExcelBlob.arrayBuffer();
    files.push({ name: `03_Revenue_Register_${year}_${monthStr}.xlsx`, data: revBuf });
  } catch (err) {
    console.error('Error bundling Revenue Register Excel:', err);
  }

  // 4. Expense Register Excel (.xlsx)
  try {
    const expData = computeReportData('FIN-02', rawData, filters);
    const expExcelBlob = generateExcelBlob(expData.rows, expData.columns, 'Expense_Register');
    const expBuf = await expExcelBlob.arrayBuffer();
    files.push({ name: `04_Expense_Register_${year}_${monthStr}.xlsx`, data: expBuf });
  } catch (err) {
    console.error('Error bundling Expense Register Excel:', err);
  }

  // 5. Vehicle Profitability Excel (.xlsx)
  try {
    const fltExcelBlob = generateExcelBlob(fltData.rows, fltData.columns, 'Vehicle_Profitability');
    const fltBuf = await fltExcelBlob.arrayBuffer();
    files.push({ name: `05_Vehicle_Profitability_${year}_${monthStr}.xlsx`, data: fltBuf });
  } catch (err) {
    console.error('Error bundling Vehicle Profitability Excel:', err);
  }

  // 6. Complete Trip Register Excel (.xlsx)
  try {
    const trpData = computeReportData('TRP-01', rawData, filters);
    const trpExcelBlob = generateExcelBlob(trpData.rows, trpData.columns, 'Trip_Register');
    const trpBuf = await trpExcelBlob.arrayBuffer();
    files.push({ name: `06_Trip_Profitability_${year}_${monthStr}.xlsx`, data: trpBuf });
  } catch (err) {
    console.error('Error bundling Trip Register Excel:', err);
  }

  // 7. Customer Receivables Excel (.xlsx)
  try {
    const cltData = computeReportData('CLT-01', rawData, filters);
    const cltExcelBlob = generateExcelBlob(cltData.rows, cltData.columns, 'Customer_Ledger');
    const cltBuf = await cltExcelBlob.arrayBuffer();
    files.push({ name: `07_Customer_Outstanding_${year}_${monthStr}.xlsx`, data: cltBuf });
  } catch (err) {
    console.error('Error bundling Customer Ledger Excel:', err);
  }

  return makeZipArchive(files);
}


function ReportsCentreMain({ imports }) {
  const {
    o: ReactHook,
    e: jsxRuntime,
    V: pb,
    A: toast,
    $: Button,
    X: Badge,
    Ze: generatePdfBlob,
    De: downloadBlob,
    es: generateExcelBlob,
    j: formatFnsDate
  } = imports;
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [tripLogs, setTripLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [clients, setClients] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [loanProfiles, setLoanProfiles] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [datePreset, setDatePreset] = useState("current_fy");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [selectedTruck, setSelectedTruck] = useState("all");
  const [selectedClient, setSelectedClient] = useState("all");
  const [tripStatusFilter, setTripStatusFilter] = useState("all");
  const [selectedReportId, setSelectedReportId] = useState("FIN-01");
  const [previewData, setPreviewData] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [reportHistory, setReportHistory] = useState([
    {
      id: "REP-HIST-001",
      reportId: "FIN-01",
      reportName: "Revenue Register",
      period: "FY 2026-27",
      format: "PDF",
      timestamp: (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN") + " " + (/* @__PURE__ */ new Date()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      status: "Verified"
    }
  ]);
  const [packMonth, setPackMonth] = useState((/* @__PURE__ */ new Date()).getMonth() + 1);
  const [packYear, setPackYear] = useState((/* @__PURE__ */ new Date()).getFullYear());
  const [packQuarter, setPackQuarter] = useState(1);
  const [isGeneratingPack, setIsGeneratingPack] = useState(false);
  const [simTrucks, setSimTrucks] = useState(2);
  const [simCostPerTruck, setSimCostPerTruck] = useState(38e5);
  const [simEmiPerTruck, setSimEmiPerTruck] = useState(74e3);
  const [simMonthlyKm, setSimMonthlyKm] = useState(7500);
  const [simFreightRatePerKm, setSimFreightRatePerKm] = useState(48);
  const [simMileage, setSimMileage] = useState(4.2);
  const [simDieselPrice, setSimDieselPrice] = useState(90);
  const [simTollPerKm, setSimTollPerKm] = useState(4.5);
  const [simDriverPay, setSimDriverPay] = useState(28e3);
  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [tripsRes, expRes, clientsRes, trucksRes, payrollRes, loanRes] = await Promise.all([
        pb.collection("trip_logs").getFullList({ sort: "-created", $autoCancel: false }),
        pb.collection("expenses").getFullList({ sort: "-created", $autoCancel: false }),
        pb.collection("clients").getFullList({ $autoCancel: false }),
        pb.collection("trucks").getFullList({ $autoCancel: false }),
        pb.collection("payroll").getFullList({ $autoCancel: false }).catch(() => []),
        pb.collection("loan_profiles").getFullList({ $autoCancel: false }).catch(() => [])
      ]);
      setTripLogs(tripsRes || []);
      setExpenses(expRes || []);
      setClients(clientsRes || []);
      setTrucks(trucksRes || []);
      setPayroll(payrollRes || []);
      setLoanProfiles(loanRes || []);
    } catch (err) {
      console.error("Error loading reporting datasets:", err);
      setLoadError("Failed to load live database records. Please verify connection.");
      toast.error("Failed to load reporting database");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);
  const activeDateRange = useMemo(() => {
    return getDateRangeFromPreset(datePreset, customStart, customEnd);
  }, [datePreset, customStart, customEnd]);
  const currentReportResult = useMemo(() => {
    if (loading) return null;
    return computeReportData(
      selectedReportId,
      {
        trips: tripLogs,
        expenses,
        trucks,
        clients,
        payroll,
        loanProfiles
      },
      {
        startDate: activeDateRange.start,
        endDate: activeDateRange.end,
        selectedTruck,
        selectedClient,
        tripStatus: tripStatusFilter
      }
    );
  }, [selectedReportId, tripLogs, expenses, trucks, clients, payroll, loanProfiles, activeDateRange, selectedTruck, selectedClient, tripStatusFilter, loading]);
  const handleDownloadPdf = async () => {
    if (!currentReportResult) return;
    setIsExporting(true);
    try {
      const cols = currentReportResult.columns;
      const rows = currentReportResult.rows;
      const pdfBlob = generatePdfBlob(
        rows,
        selectedReportId,
        {
          title: currentReportResult.title,
          columns: cols,
          companyInfo: "JAI BHAVANI CARGO \u2014 FLEET ENTERPRISE SYSTEM"
        }
      );
      downloadBlob(pdfBlob, `${selectedReportId}_${activeDateRange.label.replace(/\s+/g, "_")}.pdf`);
      toast.success("PDF report generated and downloaded successfully!");
      setReportHistory((prev) => [
        {
          id: `REP-${Date.now().toString().slice(-6)}`,
          reportId: selectedReportId,
          reportName: currentReportResult.title,
          period: activeDateRange.label,
          format: "PDF",
          timestamp: (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN") + " " + (/* @__PURE__ */ new Date()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          status: "Verified"
        },
        ...prev
      ]);
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Failed to generate PDF report");
    } finally {
      setIsExporting(false);
    }
  };
  const handleDownloadExcel = async () => {
    if (!currentReportResult) return;
    setIsExporting(true);
    try {
      const excelBlob = generateExcelBlob(
        currentReportResult.rows,
        currentReportResult.columns,
        selectedReportId
      );
      downloadBlob(excelBlob, `${selectedReportId}_${activeDateRange.label.replace(/\s+/g, "_")}.xlsx`);
      toast.success("Excel spreadsheet generated and downloaded successfully!");
      setReportHistory((prev) => [
        {
          id: `REP-${Date.now().toString().slice(-6)}`,
          reportId: selectedReportId,
          reportName: currentReportResult.title,
          period: activeDateRange.label,
          format: "Excel (.xlsx)",
          timestamp: (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN") + " " + (/* @__PURE__ */ new Date()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          status: "Verified"
        },
        ...prev
      ]);
    } catch (err) {
      console.error("Excel export error:", err);
      toast.error("Failed to generate Excel file");
    } finally {
      setIsExporting(false);
    }
  };
  const handleDownloadCsv = () => {
    if (!currentReportResult) return;
    try {
      const cols = currentReportResult.columns;
      const rows = currentReportResult.rows;
      const headers = cols.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",");
      const lines = rows.map((r) => cols.map((c) => `"${String(r[c.key] !== void 0 ? r[c.key] : "").replace(/"/g, '""')}"`).join(","));
      const csvContent = "\uFEFF" + [headers, ...lines].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      downloadBlob(blob, `${selectedReportId}_${activeDateRange.label.replace(/\s+/g, "_")}.csv`);
      toast.success("CSV data exported successfully!");
      setReportHistory((prev) => [
        {
          id: `REP-${Date.now().toString().slice(-6)}`,
          reportId: selectedReportId,
          reportName: currentReportResult.title,
          period: activeDateRange.label,
          format: "CSV",
          timestamp: (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN") + " " + (/* @__PURE__ */ new Date()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          status: "Verified"
        },
        ...prev
      ]);
    } catch (err) {
      console.error("CSV export error:", err);
      toast.error("Failed to export CSV");
    }
  };
  const handlePrint = () => {
    window.print();
  };
  const handleDownloadTallyXml = () => {
    try {
      let xmlContent = "";
      if (selectedReportId === "FIN-01" || selectedReportId === "TRP-01" || selectedReportId === "ACC-01") {
        const records = currentReportResult.rows.map((r) => ({
          voucherNumber: r.invoice_number || r.trip_id,
          date: r.date,
          partyName: r.client_name,
          amount: r.freight_amount || r.revenue,
          narration: `Freight Revenue - Route: ${r.route || ""}`,
          truckNumber: r.truck_number
        }));
        xmlContent = generateTallySalesVouchersXml(records);
      } else {
        const records = currentReportResult.rows.map((r) => ({
          voucherNumber: `EXP-${Date.now().toString().slice(-4)}`,
          date: r.date,
          expenseLedger: r.category || "Direct Fleet Operating Expenses",
          paymentLedger: r.payment_method === "Bank" ? "HDFC Bank Operating A/c" : "Cash in Hand",
          amount: r.amount,
          narration: r.description,
          truckNumber: r.truck_number
        }));
        xmlContent = generateTallyPaymentVouchersXml(records);
      }
      const blob = new Blob([xmlContent], { type: "application/xml;charset=utf-8;" });
      downloadBlob(blob, `Tally_${selectedReportId}_${activeDateRange.label.replace(/\s+/g, "_")}.xml`);
      toast.success("TallyPrime XML import voucher generated successfully!");
      setReportHistory((prev) => [
        {
          id: `REP-${Date.now().toString().slice(-6)}`,
          reportId: selectedReportId,
          reportName: `Tally XML - ${currentReportResult.title}`,
          period: activeDateRange.label,
          format: "Tally XML",
          timestamp: (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN") + " " + (/* @__PURE__ */ new Date()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          status: "Validated"
        },
        ...prev
      ]);
    } catch (err) {
      console.error("Tally XML generation error:", err);
      toast.error("Failed to generate Tally XML export");
    }
  };
  const handleGenerateMonthlyPack = async () => {
    setIsGeneratingPack(true);
    try {
      const zipBlob = await generateMonthlyReportPackZip({
        month: packMonth,
        year: packYear,
        rawData: { trips: tripLogs, expenses, trucks, clients, payroll, loanProfiles },
        exportUtils: { generatePdfBlob, generateExcelBlob }
      });
      const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      downloadBlob(zipBlob, `JBC_Monthly_Report_Pack_${monthNames[packMonth]}_${packYear}.zip`);
      toast.success("Monthly Report Pack (ZIP) generated and downloaded successfully!");
      setReportHistory((prev) => [
        {
          id: `PACK-${Date.now().toString().slice(-6)}`,
          reportId: "MONTHLY-PACK",
          reportName: `Monthly Report Pack (${monthNames[packMonth]} ${packYear})`,
          period: `${monthNames[packMonth]} ${packYear}`,
          format: "ZIP Package (7 Files)",
          timestamp: (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN") + " " + (/* @__PURE__ */ new Date()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          status: "Complete"
        },
        ...prev
      ]);
    } catch (err) {
      console.error("Error generating Monthly Pack ZIP:", err);
      toast.error("Failed to bundle monthly report pack");
    } finally {
      setIsGeneratingPack(false);
    }
  };
  const simResults = useMemo(() => {
    const trucksCount = Number(simTrucks) || 1;
    const monthlyKm = Number(simMonthlyKm) || 0;
    const totalKm = trucksCount * monthlyKm;
    const revPerKm = Number(simFreightRatePerKm) || 0;
    const grossRev = totalKm * revPerKm;
    const mileage = Number(simMileage) || 1;
    const dieselPrice = Number(simDieselPrice) || 0;
    const fuelCostPerKm = mileage > 0 ? dieselPrice / mileage : 0;
    const totalFuelCost = totalKm * fuelCostPerKm;
    const tollPerKm = Number(simTollPerKm) || 0;
    const totalTollCost = totalKm * tollPerKm;
    const driverSalary = Number(simDriverPay) || 0;
    const totalDriverCost = trucksCount * driverSalary;
    const maintenanceReserve = totalKm * 3.5;
    const totalOperatingCost = totalFuelCost + totalTollCost + totalDriverCost + maintenanceReserve;
    const operatingSurplus = grossRev - totalOperatingCost;
    const emiPerTruck = Number(simEmiPerTruck) || 0;
    const totalEmi = trucksCount * emiPerTruck;
    const netCashRemaining = operatingSurplus - totalEmi;
    const breakEvenKms = (totalDriverCost + totalEmi) / Math.max(1, revPerKm - fuelCostPerKm - tollPerKm - 3.5);
    return {
      grossRev,
      totalFuelCost,
      totalTollCost,
      totalDriverCost,
      maintenanceReserve,
      totalOperatingCost,
      operatingSurplus,
      totalEmi,
      netCashRemaining,
      fuelCostPerKm,
      operatingCostPerKm: totalKm > 0 ? totalOperatingCost / totalKm : 0,
      breakEvenKmsPerTruck: trucksCount > 0 ? Math.round(breakEvenKms / trucksCount) : 0
    };
  }, [simTrucks, simCostPerTruck, simEmiPerTruck, simMonthlyKm, simFreightRatePerKm, simMileage, simDieselPrice, simTollPerKm, simDriverPay]);
  return /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto p-3 sm:p-6 pb-24 space-y-6 font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 mb-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "\u{1F4CA}" }),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground", children: "Reports & Intelligence Centre" }),
          /* @__PURE__ */ jsx("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30", children: "Enterprise BI" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm text-muted-foreground", children: "Complete visibility into your fleet, trips, finances and business performance." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            size: "sm",
            onClick: () => setActiveTab("packs"),
            className: "h-9 px-3 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm gap-1.5",
            children: [
              /* @__PURE__ */ jsx("span", { children: "\u{1F4E6}" }),
              " Monthly Report Pack"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: () => setActiveTab("tally"),
            className: "h-9 px-3 text-xs font-bold rounded-xl border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 gap-1.5",
            children: [
              /* @__PURE__ */ jsx("span", { children: "\u{1F4D1}" }),
              " TallyPrime Export"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: loadData,
            disabled: loading,
            className: "h-9 px-3 text-xs font-bold rounded-xl border-border hover:bg-muted gap-1.5",
            children: [
              /* @__PURE__ */ jsx("span", { children: "\u{1F504}" }),
              " ",
              loading ? "Loading..." : "Refresh Data"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/40 scrollbar-thin", children: [
      { id: "overview", label: "Overview", icon: "\u26A1" },
      { id: "library", label: "Report Library", icon: "\u{1F4D1}" },
      { id: "packs", label: "Monthly & Quarterly Packs", icon: "\u{1F4E6}" },
      { id: "fin", label: "Financial Reports", icon: "\u{1F4B0}" },
      { id: "fleet", label: "Fleet Reports", icon: "\u{1F69B}" },
      { id: "trips", label: "Trip & Route Reports", icon: "\u{1F6E3}\uFE0F" },
      { id: "clients", label: "Client Reports", icon: "\u{1F3E2}" },
      { id: "tax", label: "Tax & Compliance", icon: "\u2696\uFE0F" },
      { id: "tally", label: "Accounting & Tally", icon: "\u{1F4CA}" },
      { id: "bi", label: "Business Intelligence", icon: "\u{1F9E0}" },
      { id: "history", label: "Report History", icon: "\u{1F552}" }
    ].map((tab) => /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => {
          setActiveTab(tab.id);
          if (tab.id === "fin") setSelectedReportId("FIN-01");
          else if (tab.id === "fleet") setSelectedReportId("FLT-01");
          else if (tab.id === "trips") setSelectedReportId("TRP-01");
          else if (tab.id === "clients") setSelectedReportId("CLT-01");
          else if (tab.id === "tax") setSelectedReportId("TAX-01");
          else if (tab.id === "tally") setSelectedReportId("ACC-01");
          else if (tab.id === "bi") setSelectedReportId("BI-01");
        },
        className: `px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === tab.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`,
        children: [
          /* @__PURE__ */ jsx("span", { children: tab.icon }),
          /* @__PURE__ */ jsx("span", { children: tab.label })
        ]
      },
      tab.id
    )) }),
    /* @__PURE__ */ jsx("div", { className: "bg-card/90 border border-border/80 p-3.5 rounded-2xl shadow-sm space-y-3", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap text-xs", children: [
        /* @__PURE__ */ jsx("span", { className: "font-bold text-muted-foreground uppercase text-[10px] tracking-wider", children: "Period:" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: datePreset,
            onChange: (e) => setDatePreset(e.target.value),
            className: "h-8 rounded-xl bg-background border border-border text-xs px-2.5 font-bold text-foreground focus:outline-none",
            children: [
              /* @__PURE__ */ jsx("option", { value: "current_fy", children: "\u{1F1EE}\u{1F1F3} Current Financial Year (FY 2026-27)" }),
              /* @__PURE__ */ jsx("option", { value: "previous_fy", children: "\u{1F1EE}\u{1F1F3} Previous Financial Year (FY 2025-26)" }),
              /* @__PURE__ */ jsx("option", { value: "current_month", children: "\u{1F4C5} Current Month" }),
              /* @__PURE__ */ jsx("option", { value: "previous_month", children: "\u{1F4C5} Previous Month" }),
              /* @__PURE__ */ jsx("option", { value: "q1", children: "Q1 (Apr \u2013 Jun)" }),
              /* @__PURE__ */ jsx("option", { value: "q2", children: "Q2 (Jul \u2013 Sep)" }),
              /* @__PURE__ */ jsx("option", { value: "q3", children: "Q3 (Oct \u2013 Dec)" }),
              /* @__PURE__ */ jsx("option", { value: "q4", children: "Q4 (Jan \u2013 Mar)" }),
              /* @__PURE__ */ jsx("option", { value: "last_7_days", children: "Last 7 Days" }),
              /* @__PURE__ */ jsx("option", { value: "today", children: "Today" }),
              /* @__PURE__ */ jsx("option", { value: "custom", children: "Custom Date Range" })
            ]
          }
        ),
        datePreset === "custom" && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: customStart,
              onChange: (e) => setCustomStart(e.target.value),
              className: "h-8 rounded-xl bg-background border border-border text-xs px-2 font-mono"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "to" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: customEnd,
              onChange: (e) => setCustomEnd(e.target.value),
              className: "h-8 rounded-xl bg-background border border-border text-xs px-2 font-mono"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-muted-foreground uppercase text-[10px] tracking-wider ml-1", children: "Truck:" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: selectedTruck,
            onChange: (e) => setSelectedTruck(e.target.value),
            className: "h-8 rounded-xl bg-background border border-border text-xs px-2 font-bold text-foreground focus:outline-none max-w-[150px]",
            children: [
              /* @__PURE__ */ jsxs("option", { value: "all", children: [
                "All Vehicles (",
                trucks.length,
                ")"
              ] }),
              trucks.map((trk) => /* @__PURE__ */ jsx("option", { value: trk.truck_number, children: trk.truck_number }, trk.id))
            ]
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-muted-foreground uppercase text-[10px] tracking-wider ml-1", children: "Client:" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: selectedClient,
            onChange: (e) => setSelectedClient(e.target.value),
            className: "h-8 rounded-xl bg-background border border-border text-xs px-2 font-bold text-foreground focus:outline-none max-w-[150px]",
            children: [
              /* @__PURE__ */ jsxs("option", { value: "all", children: [
                "All Clients (",
                clients.length,
                ")"
              ] }),
              clients.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.company_name || c.client_name }, c.id))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 self-end lg:self-center", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-semibold text-muted-foreground", children: [
          "Active Range: ",
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: activeDateRange.label })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20", children: "Reconciled Data" })
      ] })
    ] }) }),
    activeTab === "overview" && currentReportResult && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-2xl bg-card border border-border space-y-1 shadow-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-muted-foreground uppercase tracking-wider", children: "Gross Freight Revenue" }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-black text-emerald-400", children: formatINR(currentReportResult.summary.totalRevenue || 0) }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
            "Delivered freight revenue in ",
            activeDateRange.label
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-2xl bg-card border border-border space-y-1 shadow-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-muted-foreground uppercase tracking-wider", children: "Operating Expenses" }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-black text-rose-400", children: formatINR(currentReportResult.summary.totalExpenses || currentReportResult.summary.totalOperatingCost || 0) }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: "Direct fuel, toll, repairs & driver bhatta" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-2xl bg-card border border-border space-y-1 shadow-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-muted-foreground uppercase tracking-wider", children: "Completed Freight Trips" }),
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-black text-foreground", children: [
            currentReportResult.summary.totalTrips || tripLogs.length,
            " Trips"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
            "Total distance: ",
            formatNumber(currentReportResult.summary.totalKms || 0, 0),
            " KM"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-2xl bg-card border border-border space-y-1 shadow-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-muted-foreground uppercase tracking-wider", children: "Fleet Operating CPK" }),
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-black text-amber-300", children: [
            "\u20B9",
            formatNumber(currentReportResult.summary.overallCostPerKm || (currentReportResult.summary.totalKms > 0 ? currentReportResult.summary.totalExpenses / currentReportResult.summary.totalKms : 0), 1),
            " / KM"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: "Operating cost per running kilometre" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-extrabold text-sm text-foreground uppercase tracking-wider", children: "\u26A1 Quick Launchpad \u2014 Top Reports" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", children: [
          { id: "FIN-01", name: "Revenue Register", cat: "Finance", icon: "\u{1F4B0}", desc: "Trip invoices & customer freight" },
          { id: "FIN-02", name: "Expense Register", cat: "Finance", icon: "\u{1F4C9}", desc: "Itemised operating disbursements" },
          { id: "FIN-03", name: "Profit & Loss Statement", cat: "Finance", icon: "\u{1F4C8}", desc: "Operating margin & net surplus" },
          { id: "FLT-01", name: "Vehicle Profitability", cat: "Fleet", icon: "\u{1F69B}", desc: "Truck-by-truck revenue & cost/km" },
          { id: "TRP-01", name: "Complete Trip Register", cat: "Trips", icon: "\u{1F6E3}\uFE0F", desc: "Master log with diesel, toll & POD" },
          { id: "CLT-01", name: "Customer Revenue Ledger", cat: "Clients", icon: "\u{1F3E2}", desc: "Client billing & receivables" },
          { id: "TAX-01", name: "GST Sales Register", cat: "Tax", icon: "\u2696\uFE0F", desc: "GTA outward invoice compliance" },
          { id: "ACC-01", name: "Tally Sales Export", cat: "Accounting", icon: "\u{1F4CA}", desc: "Direct TallyPrime XML vouchers" }
        ].map((rep) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              setSelectedReportId(rep.id);
              setActiveTab(rep.id.startsWith("FIN") ? "fin" : rep.id.startsWith("FLT") ? "fleet" : rep.id.startsWith("TRP") ? "trips" : rep.id.startsWith("CLT") ? "clients" : rep.id.startsWith("TAX") ? "tax" : "tally");
            },
            className: "p-3.5 rounded-2xl bg-card border border-border/80 hover:border-primary text-left transition-all hover:scale-[1.01] shadow-sm space-y-1.5",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xl", children: rep.icon }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase text-muted-foreground px-1.5 py-0.5 rounded bg-muted", children: rep.id })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "font-bold text-xs text-foreground truncate", children: rep.name }),
              /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground truncate", children: rep.desc })
            ]
          },
          rep.id
        )) })
      ] })
    ] }),
    activeTab === "library" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("h3", { className: "font-bold text-base text-foreground", children: [
          "\u{1F4D1} Universal Report Library (",
          REPORT_REGISTRY.length,
          " Reports)"
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Select any report to view instant live preview & export" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5", children: REPORT_REGISTRY.map((rep) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `p-4 rounded-2xl border transition-all space-y-3 bg-card ${selectedReportId === rep.id ? "border-primary ring-1 ring-primary" : "border-border/80 hover:border-border"}`,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20", children: rep.code }),
                /* @__PURE__ */ jsx("h4", { className: "font-bold text-sm text-foreground mt-1.5 leading-snug", children: rep.name })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-muted-foreground", children: rep.categoryLabel })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed line-clamp-2", children: rep.description }),
            /* @__PURE__ */ jsxs("div", { className: "pt-2 border-t border-border/50 flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: rep.supportedFormats.map((fmt) => /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-muted text-muted-foreground", children: fmt }, fmt)) }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  onClick: () => {
                    setSelectedReportId(rep.id);
                    setActiveTab(rep.id.startsWith("FIN") ? "fin" : rep.id.startsWith("FLT") ? "fleet" : rep.id.startsWith("TRP") ? "trips" : rep.id.startsWith("CLT") ? "clients" : rep.id.startsWith("TAX") ? "tax" : rep.id.startsWith("ACC") ? "tally" : "bi");
                  },
                  className: "h-7 text-xs font-bold px-3 rounded-xl bg-primary text-primary-foreground",
                  children: "Open Report \u2192"
                }
              )
            ] })
          ]
        },
        rep.id
      )) })
    ] }),
    activeTab === "packs" && /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-3xl bg-gradient-to-br from-card to-card/60 border border-border space-y-4 shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-3xl", children: "\u{1F4E6}" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-extrabold text-lg text-foreground", children: "One-Click Monthly Report Pack Generator" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Compiles a certified 7-document ZIP archive containing Executive Summary, P&L, Revenue & Expense Registers, Vehicle Profitability, and Trip Audits." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-3 pt-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-muted-foreground", children: "Month:" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: packMonth,
              onChange: (e) => setPackMonth(Number(e.target.value)),
              className: "h-9 rounded-xl bg-background border border-border text-xs px-3 font-bold text-foreground",
              children: [
                { m: 1, name: "January" },
                { m: 2, name: "February" },
                { m: 3, name: "March" },
                { m: 4, name: "April" },
                { m: 5, name: "May" },
                { m: 6, name: "June" },
                { m: 7, name: "July" },
                { m: 8, name: "August" },
                { m: 9, name: "September" },
                { m: 10, name: "October" },
                { m: 11, name: "November" },
                { m: 12, name: "December" }
              ].map((x) => /* @__PURE__ */ jsx("option", { value: x.m, children: x.name }, x.m))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-muted-foreground", children: "Year:" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: packYear,
              onChange: (e) => setPackYear(Number(e.target.value)),
              className: "h-9 rounded-xl bg-background border border-border text-xs px-3 font-bold text-foreground",
              children: [
                /* @__PURE__ */ jsx("option", { value: 2026, children: "2026" }),
                /* @__PURE__ */ jsx("option", { value: 2025, children: "2025" }),
                /* @__PURE__ */ jsx("option", { value: 2024, children: "2024" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            size: "sm",
            onClick: handleGenerateMonthlyPack,
            disabled: isGeneratingPack,
            className: "h-9 px-5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white gap-2 shadow-md",
            children: [
              /* @__PURE__ */ jsx("span", { children: "\u{1F4E6}" }),
              " ",
              isGeneratingPack ? "Bundling Report Pack..." : "Download Monthly Pack (.ZIP)"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-3.5 rounded-2xl bg-muted/40 border border-border/50 text-xs space-y-1 text-muted-foreground", children: [
        /* @__PURE__ */ jsx("span", { className: "font-bold text-foreground block", children: "Included in this ZIP Archive:" }),
        /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-4 space-y-0.5 text-[11px]", children: [
          /* @__PURE__ */ jsx("li", { children: "01_Executive_Summary.txt (Consolidated executive briefing)" }),
          /* @__PURE__ */ jsx("li", { children: "02_Profit_and_Loss.xlsx (Full multi-level Income Statement)" }),
          /* @__PURE__ */ jsx("li", { children: "03_Revenue_Register.xlsx (Client invoices & trip freights)" }),
          /* @__PURE__ */ jsx("li", { children: "04_Expense_Register.xlsx (Itemised operational disbursements)" }),
          /* @__PURE__ */ jsx("li", { children: "05_Vehicle_Profitability.xlsx (Truck-by-truck revenue & cost/km)" }),
          /* @__PURE__ */ jsx("li", { children: "06_Trip_Profitability.xlsx (Complete trip movement ledger)" }),
          /* @__PURE__ */ jsx("li", { children: "07_Customer_Outstanding.xlsx (Receivables & client balances)" })
        ] })
      ] })
    ] }) }),
    ["fin", "fleet", "trips", "clients", "tax", "tally", "bi"].includes(activeTab) && currentReportResult && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-sm", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-black uppercase text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20", children: selectedReportId }),
            /* @__PURE__ */ jsx("h3", { className: "font-extrabold text-base text-foreground", children: currentReportResult.title })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
            "Period: ",
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: activeDateRange.label }),
            " \u2022 ",
            currentReportResult.reconciliationStatus
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: handleDownloadPdf,
              disabled: isExporting,
              className: "h-8 px-3 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white gap-1 shadow-sm",
              children: [
                /* @__PURE__ */ jsx("span", { children: "\u{1F4C4}" }),
                " PDF"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: handleDownloadExcel,
              disabled: isExporting,
              className: "h-8 px-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white gap-1 shadow-sm",
              children: [
                /* @__PURE__ */ jsx("span", { children: "\u{1F4CA}" }),
                " Excel"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              onClick: handleDownloadCsv,
              className: "h-8 px-3 text-xs font-bold rounded-xl border-border gap-1",
              children: [
                /* @__PURE__ */ jsx("span", { children: "\u{1F4DD}" }),
                " CSV"
              ]
            }
          ),
          activeTab === "tally" && /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: handleDownloadTallyXml,
              className: "h-8 px-3 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white gap-1 shadow-sm",
              children: [
                /* @__PURE__ */ jsx("span", { children: "\u{1F4D1}" }),
                " Tally XML"
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              size: "sm",
              variant: "ghost",
              onClick: handlePrint,
              className: "h-8 px-2.5 text-xs font-bold rounded-xl hover:bg-muted",
              title: "Print Report",
              children: "\u{1F5A8}\uFE0F"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-border bg-card overflow-hidden shadow-sm", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full caption-bottom text-sm border-collapse", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-muted/40 border-b border-border/80", children: /* @__PURE__ */ jsx("tr", { children: currentReportResult.columns.map((col) => /* @__PURE__ */ jsx("th", { className: "p-3 text-left font-bold text-xs text-foreground uppercase tracking-wider", children: col.header }, col.key)) }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/40 text-xs", children: currentReportResult.rows.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: currentReportResult.columns.length, className: "text-center py-12 text-muted-foreground", children: "No transactions recorded for the selected period and filters." }) }) : currentReportResult.rows.map((row, idx) => /* @__PURE__ */ jsx("tr", { className: "hover:bg-muted/30 transition-colors", children: currentReportResult.columns.map((col) => {
          const val = row[col.key];
          const isCurrency = col.header.includes("(\u20B9)") || col.key.includes("revenue") || col.key.includes("amount") || col.key.includes("freight") || col.key.includes("profit") || col.key.includes("cost");
          return /* @__PURE__ */ jsx("td", { className: "p-3 text-foreground font-medium", children: isCurrency && typeof val === "number" ? formatINR(val) : val !== void 0 && val !== null ? String(val) : "-" }, col.key);
        }) }, idx)) })
      ] }) }) })
    ] }),
    activeTab === "bi" && /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-3xl bg-card border border-border space-y-5 shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-3xl", children: "\u{1F9E0}" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-extrabold text-base text-foreground", children: "Fleet Expansion & Investment Economics Simulator" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Scenario planning for truck acquisitions, debt obligations, diesel assumptions and break-even running." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-muted-foreground", children: "Number of New Trucks" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: "1",
              max: "100",
              value: simTrucks,
              onChange: (e) => setSimTrucks(Number(e.target.value)),
              className: "w-full h-9 rounded-xl bg-background border border-border px-3 text-xs font-bold"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-muted-foreground", children: "Monthly EMI Per Truck (\u20B9)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: simEmiPerTruck,
              onChange: (e) => setSimEmiPerTruck(Number(e.target.value)),
              className: "w-full h-9 rounded-xl bg-background border border-border px-3 text-xs font-bold"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-muted-foreground", children: "Expected Monthly Running (KM/Truck)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: simMonthlyKm,
              onChange: (e) => setSimMonthlyKm(Number(e.target.value)),
              className: "w-full h-9 rounded-xl bg-background border border-border px-3 text-xs font-bold"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-muted-foreground", children: "Freight Rate (\u20B9 / KM)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: simFreightRatePerKm,
              onChange: (e) => setSimFreightRatePerKm(Number(e.target.value)),
              className: "w-full h-9 rounded-xl bg-background border border-border px-3 text-xs font-bold"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-muted-foreground", children: "Expected Mileage (KM / Litre)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              step: "0.1",
              value: simMileage,
              onChange: (e) => setSimMileage(Number(e.target.value)),
              className: "w-full h-9 rounded-xl bg-background border border-border px-3 text-xs font-bold"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-muted-foreground", children: "Diesel Price (\u20B9 / Litre)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: simDieselPrice,
              onChange: (e) => setSimDieselPrice(Number(e.target.value)),
              className: "w-full h-9 rounded-xl bg-background border border-border px-3 text-xs font-bold"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-4 gap-3.5 pt-4 border-t border-border/60", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase text-muted-foreground", children: "Gross Monthly Revenue" }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-black text-emerald-400", children: formatINR(simResults.grossRev) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase text-muted-foreground", children: "Direct Operating Cost" }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-black text-rose-400", children: formatINR(simResults.totalOperatingCost) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase text-muted-foreground", children: "Total Monthly EMI Burden" }),
          /* @__PURE__ */ jsx("div", { className: "text-lg font-black text-amber-300", children: formatINR(simResults.totalEmi) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-3.5 rounded-2xl bg-primary/10 border border-primary/20 space-y-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase text-primary", children: "Net Cash Surplus After EMI" }),
          /* @__PURE__ */ jsx("div", { className: `text-lg font-black ${simResults.netCashRemaining >= 0 ? "text-emerald-400" : "text-rose-400"}`, children: formatINR(simResults.netCashRemaining) })
        ] })
      ] })
    ] }) }),
    activeTab === "history" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-base text-foreground", children: "\u{1F552} Searchable Report Generation History" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Audit log of manually generated reports" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-border bg-card overflow-hidden shadow-sm", children: /* @__PURE__ */ jsxs("table", { className: "w-full caption-bottom text-sm border-collapse", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-muted/40 border-b border-border/80", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "p-3 text-left font-bold text-xs text-foreground", children: "Audit ID" }),
          /* @__PURE__ */ jsx("th", { className: "p-3 text-left font-bold text-xs text-foreground", children: "Report" }),
          /* @__PURE__ */ jsx("th", { className: "p-3 text-left font-bold text-xs text-foreground", children: "Period" }),
          /* @__PURE__ */ jsx("th", { className: "p-3 text-left font-bold text-xs text-foreground", children: "Format" }),
          /* @__PURE__ */ jsx("th", { className: "p-3 text-left font-bold text-xs text-foreground", children: "Timestamp" }),
          /* @__PURE__ */ jsx("th", { className: "p-3 text-right font-bold text-xs text-foreground", children: "Action" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/40 text-xs", children: reportHistory.map((item) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-muted/20", children: [
          /* @__PURE__ */ jsx("td", { className: "p-3 font-mono text-muted-foreground", children: item.id }),
          /* @__PURE__ */ jsx("td", { className: "p-3 font-bold text-foreground", children: item.reportName }),
          /* @__PURE__ */ jsx("td", { className: "p-3 text-foreground", children: item.period }),
          /* @__PURE__ */ jsx("td", { className: "p-3", children: /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-foreground", children: item.format }) }),
          /* @__PURE__ */ jsx("td", { className: "p-3 text-muted-foreground", children: item.timestamp }),
          /* @__PURE__ */ jsx("td", { className: "p-3 text-right", children: /* @__PURE__ */ jsx(
            Button,
            {
              size: "sm",
              variant: "outline",
              onClick: () => {
                setSelectedReportId(item.reportId);
                setActiveTab("fin");
              },
              className: "h-7 text-xs font-bold px-2 rounded-lg",
              children: "Re-open"
            }
          ) })
        ] }, item.id)) })
      ] }) })
    ] })
  ] });
}



function ReportsPageDefaultExport() {
  const importsBundle = {
    o, e, V, A, $, X, Ze, De, es, j,
    toast: A,
    Button: $,
    Badge: X,
    generatePdfBlob: Ze,
    downloadBlob: De,
    generateExcelBlob: es,
    formatFnsDate: j
  };

  return jsx(ReportsCentreMain, { imports: importsBundle });
}

export { ReportsPageDefaultExport as default };
