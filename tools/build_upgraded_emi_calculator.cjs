const fs = require('fs');
const path = require('path');
const ts = require('typescript');

console.log('=== Building Upgraded EMI, Multi-Loan Compare, Discount & Days Calculator Hub ===');

// Helper component generators using e.jsx and e.jsxs with r (React)

const helperCode = `
// ==========================================
// UPGRADED EMI CALCULATOR EXPANSION MODULES
// ==========================================

// Inline SVG Icon Helpers
const SvgIcons = {
  Calculator: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.8, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 3h.008v.008H8.25v-.008zm0 3h.008v.008H8.25v-.008zm3-6h.008v.008H11.25v-.008zm0 3h.008v.008H11.25v-.008zm0 3h.008v.008H11.25v-.008zm3-6h.008v.008H14.25v-.008zm0 3h.008v.008H14.25v-.008zM4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5zm6-12.75h3" }) }),
  Compare: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.8, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" }) }),
  Discount: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.8, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z" }) }),
  Calendar: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.8, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5m-9-3.75h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" }) }),
  Plus: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4.5v15m7.5-7.5h-15" }) }),
  Trash: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.8, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" }) }),
  Copy: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.8, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" }) }),
  Share: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.8, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" }) }),
  Check: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.5 12.75l6 6 9-13.5" }) }),
  Sparkles: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.8, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" }) }),
  ArrowRight: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" }) }),
  Info: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.8, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" }) })
};

// Currency Formatter
const formatCurrency = (amount) => {
  const num = Math.round(Number(amount) || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

// Format Number with Indian Comma System
const formatNum = (amount) => {
  const num = Math.round(Number(amount) || 0);
  return new Intl.NumberFormat('en-IN').format(num);
};

// ==========================================
// 1. COMPARE LOANS VIEW (2 to 4 LOANS)
// ==========================================
function CompareLoansView() {
  const [loans, setLoans] = r.useState([
    {
      id: 1,
      name: "Offer A (HDFC Commercial)",
      principal: 3000000,
      rate: 10.5,
      tenureMonths: 60,
      processingFeePct: 1.0
    },
    {
      id: 2,
      name: "Offer B (Tata Motors Finance)",
      principal: 3000000,
      rate: 11.2,
      tenureMonths: 60,
      processingFeePct: 0.5
    }
  ]);

  const [copiedId, setCopiedId] = r.useState(null);

  // Compute calculated values for each loan
  const evaluatedLoans = r.useMemo(() => {
    return loans.map(l => {
      const p = Math.max(10000, Number(l.principal) || 0);
      const annualRate = Math.max(0.1, Number(l.rate) || 0);
      const n = Math.max(1, Number(l.tenureMonths) || 1);
      const feePct = Math.max(0, Number(l.processingFeePct) || 0);

      const rMonthly = (annualRate / 12) / 100;
      const compoundFactor = Math.pow(1 + rMonthly, n);
      const emi = (p * rMonthly * compoundFactor) / (compoundFactor - 1);
      const totalRepay = emi * n;
      const totalInterest = Math.max(0, totalRepay - p);
      const procFee = p * (feePct / 100);
      const totalCost = totalRepay + procFee;

      const principalPct = totalRepay > 0 ? (p / totalRepay) * 100 : 100;
      const interestPct = totalRepay > 0 ? (totalInterest / totalRepay) * 100 : 0;

      return {
        ...l,
        principal: p,
        rate: annualRate,
        tenureMonths: n,
        processingFeePct: feePct,
        monthlyEmi: emi,
        totalInterest,
        totalRepayment: totalRepay,
        processingFee: procFee,
        totalCost,
        principalPct,
        interestPct
      };
    });
  }, [loans]);

  // Identify best offers
  const comparisonSummary = r.useMemo(() => {
    if (evaluatedLoans.length === 0) return null;
    let minEmiLoan = evaluatedLoans[0];
    let minInterestLoan = evaluatedLoans[0];
    let minTotalCostLoan = evaluatedLoans[0];
    let maxTotalCostLoan = evaluatedLoans[0];

    evaluatedLoans.forEach(l => {
      if (l.monthlyEmi < minEmiLoan.monthlyEmi) minEmiLoan = l;
      if (l.totalInterest < minInterestLoan.totalInterest) minInterestLoan = l;
      if (l.totalCost < minTotalCostLoan.totalCost) minTotalCostLoan = l;
      if (l.totalCost > maxTotalCostLoan.totalCost) maxTotalCostLoan = l;
    });

    const maxCostDiff = maxTotalCostLoan.totalCost - minTotalCostLoan.totalCost;
    const monthlySavings = (maxTotalCostLoan.monthlyEmi - minTotalCostLoan.monthlyEmi);

    return {
      minEmiId: minEmiLoan.id,
      minInterestId: minInterestLoan.id,
      bestValueId: minTotalCostLoan.id,
      maxCostDiff,
      monthlySavings: Math.max(0, monthlySavings),
      bestLoanName: minTotalCostLoan.name,
      highestLoanName: maxTotalCostLoan.name
    };
  }, [evaluatedLoans]);

  const updateLoan = (id, key, val) => {
    setLoans(prev => prev.map(item => item.id === id ? { ...item, [key]: val } : item));
  };

  const addLoan = () => {
    if (loans.length >= 4) return;
    const newId = Date.now();
    const alphabet = ["A", "B", "C", "D"][loans.length] || "X";
    setLoans(prev => [
      ...prev,
      {
        id: newId,
        name: "Offer " + alphabet + " (NBFC / Fleet)",
        principal: prev[0]?.principal || 3000000,
        rate: 11.5,
        tenureMonths: prev[0]?.tenureMonths || 60,
        processingFeePct: 1.0
      }
    ]);
  };

  const removeLoan = (id) => {
    if (loans.length <= 2) return;
    setLoans(prev => prev.filter(item => item.id !== id));
  };

  const applyPreset = (type) => {
    if (type === 'new_truck') {
      setLoans([
        { id: 1, name: "Offer A: Nationalized Bank (PSU)", principal: 3500000, rate: 9.8, tenureMonths: 60, processingFeePct: 0.5 },
        { id: 2, name: "Offer B: Private Fleet Financier", principal: 3500000, rate: 10.75, tenureMonths: 60, processingFeePct: 1.2 }
      ]);
    } else if (type === 'used_trailer') {
      setLoans([
        { id: 1, name: "Offer A: 3-Year Fixed Fleet Loan", principal: 1800000, rate: 12.0, tenureMonths: 36, processingFeePct: 1.0 },
        { id: 2, name: "Offer B: 4-Year Extended Repayment", principal: 1800000, rate: 13.25, tenureMonths: 48, processingFeePct: 1.5 }
      ]);
    } else if (type === 'multi_quote') {
      setLoans([
        { id: 1, name: "HDFC Commercial Vehicle", principal: 4000000, rate: 10.25, tenureMonths: 60, processingFeePct: 0.75 },
        { id: 2, name: "Tata Motors Finance", principal: 4000000, rate: 10.85, tenureMonths: 60, processingFeePct: 0.5 },
        { id: 3, name: "Chola / Shriram NBFC", principal: 4000000, rate: 12.0, tenureMonths: 60, processingFeePct: 1.5 }
      ]);
    }
  };

  const copyComparison = (loan) => {
    const text = "🚚 Loan Offer: " + loan.name + "\\n" +
      "• Principal: " + formatCurrency(loan.principal) + "\\n" +
      "• Interest Rate: " + loan.rate + "% (" + (loan.tenureMonths / 12).toFixed(1) + " yrs)\\n" +
      "• Monthly EMI: " + formatCurrency(loan.monthlyEmi) + "/mo\\n" +
      "• Total Interest: " + formatCurrency(loan.totalInterest) + "\\n" +
      "• Total Outflow: " + formatCurrency(loan.totalCost);
    navigator.clipboard.writeText(text);
    setCopiedId(loan.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return e.jsxs("div", {
    className: "space-y-6 animate-in fade-in duration-300",
    children: [
      // Header & Controls
      e.jsxs("div", {
        className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0f1523] border border-[#1e293b]/70 p-5 rounded-2xl shadow-sm",
        children: [
          e.jsxs("div", {
            children: [
              e.jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  e.jsx("span", { className: "text-lg", children: "⚖️" }),
                  e.jsx("h2", { className: "text-lg sm:text-xl font-bold text-white tracking-tight", children: "Multi-Loan Comparator" }),
                  e.jsxs("span", { className: "text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", children: [evaluatedLoans.length, " Loans Active"] })
                ]
              }),
              e.jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Compare commercial truck & fleet financing proposals side-by-side with live cost savings analysis." })
            ]
          }),
          e.jsxs("div", {
            className: "flex items-center gap-2 flex-wrap",
            children: [
              e.jsxs("button", {
                type: "button",
                onClick: addLoan,
                disabled: loans.length >= 4,
                className: "px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-semibold flex items-center gap-1.5 transition",
                children: [e.jsx(SvgIcons.Plus, { className: "w-3.5 h-3.5" }), " Add Loan (Max 4)"]
              })
            ]
          })
        ]
      }),

      // Presets bar
      e.jsxs("div", {
        className: "flex items-center gap-2 flex-wrap text-xs text-slate-400 bg-[#0b0f19] p-3 rounded-xl border border-slate-800/80",
        children: [
          e.jsx("span", { className: "font-semibold text-slate-300 flex items-center gap-1", children: [e.jsx(SvgIcons.Sparkles, { className: "w-3.5 h-3.5 text-amber-400" }), " Quick Fleet Presets:"] }),
          e.jsx("button", { type: "button", onClick: () => applyPreset('new_truck'), className: "px-2.5 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-200 border border-slate-700/60 rounded-lg transition", children: "🚚 New 16-Wheeler (₹35L PSU vs Pvt)" }),
          e.jsx("button", { type: "button", onClick: () => applyPreset('used_trailer'), className: "px-2.5 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-200 border border-slate-700/60 rounded-lg transition", children: "🚛 Used Trailer (3Y vs 4Y Tenure)" }),
          e.jsx("button", { type: "button", onClick: () => applyPreset('multi_quote'), className: "px-2.5 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-200 border border-slate-700/60 rounded-lg transition", children: "🏢 3-Way Bank Quote Comparison" })
        ]
      }),

      // Best Value Savings Banner
      comparisonSummary && comparisonSummary.maxCostDiff > 0 && e.jsxs("div", {
        className: "p-4 bg-gradient-to-r from-emerald-950/40 via-[#0f1d2b] to-[#0f1523] border border-emerald-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm",
        children: [
          e.jsxs("div", {
            className: "flex items-center gap-3",
            children: [
              e.jsx("div", { className: "w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl shrink-0", children: "🏆" }),
              e.jsxs("div", {
                children: [
                  e.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      e.jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-emerald-400", children: "FINANCIAL RECOMMENDATION" }),
                      e.jsxs("span", { className: "text-[11px] font-semibold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700", children: ["Winner: ", comparisonSummary.bestLoanName] })
                    ]
                  }),
                  e.jsxs("p", {
                    className: "text-sm text-slate-200 mt-0.5 font-medium",
                    children: [
                      "Choosing this offer saves ",
                      e.jsx("span", { className: "text-emerald-400 font-bold font-mono", children: formatCurrency(comparisonSummary.maxCostDiff) }),
                      " in total loan outflow compared to ",
                      comparisonSummary.highestLoanName,
                      "!"
                    ]
                  })
                ]
              })
            ]
          }),
          comparisonSummary.monthlySavings > 0 && e.jsxs("div", {
            className: "px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-right shrink-0",
            children: [
              e.jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-emerald-400 block", children: "MONTHLY CASHFLOW RELIEF" }),
              e.jsxs("span", { className: "text-base font-black text-emerald-300 font-mono", children: ["Save ", formatCurrency(comparisonSummary.monthlySavings), "/mo"] })
            ]
          })
        ]
      }),

      // Loans Side-by-Side Grid
      e.jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-" + Math.min(4, Math.max(2, loans.length)) + " gap-5",
        children: evaluatedLoans.map((loan, idx) => {
          const isBestValue = comparisonSummary && comparisonSummary.bestValueId === loan.id;
          const isLowestEmi = comparisonSummary && comparisonSummary.minEmiId === loan.id;
          const isLowestInterest = comparisonSummary && comparisonSummary.minInterestId === loan.id;

          return e.jsxs("div", {
            className: \`relative bg-[#0f1523] border \${isBestValue ? 'border-emerald-500/50 shadow-emerald-500/5' : 'border-[#1e293b]/80'} rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm transition\`,
            children: [
              // Top Bar: Name & Badges
              e.jsxs("div", {
                className: "space-y-2",
                children: [
                  e.jsxs("div", {
                    className: "flex items-center justify-between gap-2",
                    children: [
                      e.jsx("input", {
                        type: "text",
                        value: loan.name,
                        onChange: (e2) => updateLoan(loan.id, 'name', e2.target.value),
                        className: "font-bold text-sm text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-primary focus:outline-none px-0.5 py-0.5 w-full truncate"
                      }),
                      loans.length > 2 && e.jsx("button", {
                        type: "button",
                        onClick: () => removeLoan(loan.id),
                        className: "p-1 text-slate-500 hover:text-rose-400 transition shrink-0",
                        title: "Remove loan",
                        children: e.jsx(SvgIcons.Trash, { className: "w-3.5 h-3.5" })
                      })
                    ]
                  }),

                  // Badges
                  e.jsxs("div", {
                    className: "flex items-center gap-1.5 flex-wrap min-h-[22px]",
                    children: [
                      isBestValue && e.jsx("span", { className: "text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1", children: "🏆 Best Overall" }),
                      isLowestEmi && e.jsx("span", { className: "text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full", children: "Lowest EMI" }),
                      isLowestInterest && e.jsx("span", { className: "text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full", children: "Lowest Interest" })
                    ]
                  })
                ]
              }),

              // Big Result Card: Monthly EMI
              e.jsxs("div", {
                className: "p-4 bg-[#0a0d14] rounded-xl border border-slate-800/80 text-center space-y-1",
                children: [
                  e.jsx("span", { className: "text-[10px] font-extrabold uppercase tracking-widest text-slate-400", children: "MONTHLY EMI" }),
                  e.jsx("p", { className: "text-2xl sm:text-3xl font-black text-white font-mono tracking-tight", children: formatCurrency(loan.monthlyEmi) }),
                  e.jsxs("span", { className: "text-[11px] text-slate-400 font-medium block", children: ["for ", loan.tenureMonths, " months (", (loan.tenureMonths / 12).toFixed(1), " yrs)"] })
                ]
              }),

              // Sliders & Direct Inputs
              e.jsxs("div", {
                className: "space-y-3.5 text-xs",
                children: [
                  // Principal
                  e.jsxs("div", {
                    className: "space-y-1",
                    children: [
                      e.jsxs("div", {
                        className: "flex justify-between items-center text-slate-400 font-medium",
                        children: [
                          e.jsx("span", { children: "Loan Principal" }),
                          e.jsx("span", { className: "text-white font-mono font-bold", children: formatCurrency(loan.principal) })
                        ]
                      }),
                      e.jsx("input", {
                        type: "range",
                        min: 50000,
                        max: 10000000,
                        step: 25000,
                        value: loan.principal,
                        onChange: (e2) => updateLoan(loan.id, 'principal', Number(e2.target.value)),
                        className: "w-full accent-primary h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      })
                    ]
                  }),

                  // Interest Rate
                  e.jsxs("div", {
                    className: "space-y-1",
                    children: [
                      e.jsxs("div", {
                        className: "flex justify-between items-center text-slate-400 font-medium",
                        children: [
                          e.jsx("span", { children: "Interest Rate (p.a.)" }),
                          e.jsxs("span", { className: "text-white font-mono font-bold", children: [loan.rate, "%"] })
                        ]
                      }),
                      e.jsx("input", {
                        type: "range",
                        min: 6.0,
                        max: 24.0,
                        step: 0.1,
                        value: loan.rate,
                        onChange: (e2) => updateLoan(loan.id, 'rate', Number(e2.target.value)),
                        className: "w-full accent-primary h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      })
                    ]
                  }),

                  // Tenure
                  e.jsxs("div", {
                    className: "space-y-1",
                    children: [
                      e.jsxs("div", {
                        className: "flex justify-between items-center text-slate-400 font-medium",
                        children: [
                          e.jsx("span", { children: "Loan Tenure" }),
                          e.jsxs("span", { className: "text-white font-mono font-bold", children: [loan.tenureMonths, " mo (", (loan.tenureMonths / 12).toFixed(1), " yr)"] })
                        ]
                      }),
                      e.jsx("input", {
                        type: "range",
                        min: 12,
                        max: 84,
                        step: 6,
                        value: loan.tenureMonths,
                        onChange: (e2) => updateLoan(loan.id, 'tenureMonths', Number(e2.target.value)),
                        className: "w-full accent-primary h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      })
                    ]
                  }),

                  // Processing Fee
                  e.jsxs("div", {
                    className: "flex items-center justify-between pt-1 border-t border-slate-800/60 text-slate-400",
                    children: [
                      e.jsx("span", { children: "Proc. Fee %" }),
                      e.jsxs("div", {
                        className: "flex items-center gap-1",
                        children: [
                          e.jsx("input", {
                            type: "number",
                            min: 0,
                            max: 5,
                            step: 0.25,
                            value: loan.processingFeePct,
                            onChange: (e2) => updateLoan(loan.id, 'processingFeePct', Number(e2.target.value)),
                            className: "w-14 px-1.5 py-0.5 bg-[#0a0d14] border border-slate-800 rounded text-right font-mono text-white text-xs"
                          }),
                          e.jsx("span", { children: "%" })
                        ]
                      })
                    ]
                  })
                ]
              }),

              // Financial Breakdown Summary
              e.jsxs("div", {
                className: "pt-2 border-t border-slate-800/70 space-y-2 text-xs",
                children: [
                  e.jsxs("div", {
                    className: "flex justify-between text-slate-400",
                    children: [
                      e.jsx("span", { children: "Principal Borrowed:" }),
                      e.jsx("span", { className: "font-mono font-semibold text-white", children: formatCurrency(loan.principal) })
                    ]
                  }),
                  e.jsxs("div", {
                    className: "flex justify-between text-slate-400",
                    children: [
                      e.jsx("span", { children: "Total Interest Cost:" }),
                      e.jsx("span", { className: "font-mono font-semibold text-amber-400", children: formatCurrency(loan.totalInterest) })
                    ]
                  }),
                  e.jsxs("div", {
                    className: "flex justify-between text-slate-400",
                    children: [
                      e.jsx("span", { children: "Processing Fee:" }),
                      e.jsx("span", { className: "font-mono font-semibold text-slate-300", children: formatCurrency(loan.processingFee) })
                    ]
                  }),
                  e.jsxs("div", {
                    className: "flex justify-between pt-1 border-t border-slate-800/80 font-bold",
                    children: [
                      e.jsx("span", { className: "text-slate-300", children: "Total Loan Outflow:" }),
                      e.jsx("span", { className: "font-mono text-emerald-400 text-sm", children: formatCurrency(loan.totalCost) })
                    ]
                  }),

                  // Visual Progress Bar
                  e.jsxs("div", {
                    className: "space-y-1 pt-1",
                    children: [
                      e.jsxs("div", {
                        className: "w-full h-2 bg-slate-800 rounded-full overflow-hidden flex",
                        children: [
                          e.jsx("div", { className: "h-full bg-emerald-500", style: { width: loan.principalPct + "%" }, title: "Principal: " + loan.principalPct.toFixed(1) + "%" }),
                          e.jsx("div", { className: "h-full bg-amber-500", style: { width: loan.interestPct + "%" }, title: "Interest: " + loan.interestPct.toFixed(1) + "%" })
                        ]
                      }),
                      e.jsxs("div", {
                        className: "flex justify-between text-[10px] text-slate-500 font-bold uppercase",
                        children: [
                          e.jsxs("span", { children: ["Principal ", loan.principalPct.toFixed(0), "%"] }),
                          e.jsxs("span", { children: ["Interest ", loan.interestPct.toFixed(0), "%"] })
                        ]
                      })
                    ]
                  })
                ]
              }),

              // Copy Quote Action
              e.jsx("div", {
                className: "pt-2",
                children: e.jsxs("button", {
                  type: "button",
                  onClick: () => copyComparison(loan),
                  className: "w-full py-1.5 bg-[#131b2e] hover:bg-[#1c2742] border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition",
                  children: [
                    copiedId === loan.id ? e.jsx(SvgIcons.Check, { className: "w-3.5 h-3.5 text-emerald-400" }) : e.jsx(SvgIcons.Copy, { className: "w-3.5 h-3.5" }),
                    copiedId === loan.id ? "Copied to Clipboard!" : "Copy Offer Breakdown"
                  ]
                })
              })
            ]
          }, loan.id);
        })
      }),

      // Detailed Side-by-Side Metric Matrix Table
      e.jsxs("div", {
        className: "bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl p-5 shadow-sm space-y-4 overflow-hidden",
        children: [
          e.jsx("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Direct Metrics Comparison Table" }),
          e.jsx("div", {
            className: "overflow-x-auto",
            children: e.jsxs("table", {
              className: "w-full text-xs text-left border-collapse",
              children: [
                e.jsx("thead", {
                  children: e.jsxs("tr", {
                    className: "border-b border-slate-800 text-slate-400",
                    children: [
                      e.jsx("th", { className: "py-2.5 px-3 font-semibold", children: "Financial Metric" }),
                      evaluatedLoans.map(l => e.jsx("th", { key: l.id, className: "py-2.5 px-3 font-semibold text-white", children: l.name }))
                    ]
                  })
                }),
                e.jsxs("tbody", {
                  className: "divide-y divide-slate-800/60 text-slate-300",
                  children: [
                    e.jsxs("tr", {
                      children: [
                        e.jsx("td", { className: "py-2.5 px-3 text-slate-400 font-medium", children: "Monthly EMI" }),
                        evaluatedLoans.map(l => e.jsx("td", { key: l.id, className: "py-2.5 px-3 font-mono font-bold " + (comparisonSummary?.minEmiId === l.id ? "text-emerald-400 bg-emerald-500/5" : "text-white"), children: formatCurrency(l.monthlyEmi) }))
                      ]
                    }),
                    e.jsxs("tr", {
                      children: [
                        e.jsx("td", { className: "py-2.5 px-3 text-slate-400 font-medium", children: "Annual Interest Rate" }),
                        evaluatedLoans.map(l => e.jsx("td", { key: l.id, className: "py-2.5 px-3 font-mono font-semibold", children: l.rate + "%" }))
                      ]
                    }),
                    e.jsxs("tr", {
                      children: [
                        e.jsx("td", { className: "py-2.5 px-3 text-slate-400 font-medium", children: "Loan Tenure" }),
                        evaluatedLoans.map(l => e.jsx("td", { key: l.id, className: "py-2.5 px-3 font-mono", children: l.tenureMonths + " Months (" + (l.tenureMonths / 12).toFixed(1) + " Years)" }))
                      ]
                    }),
                    e.jsxs("tr", {
                      children: [
                        e.jsx("td", { className: "py-2.5 px-3 text-slate-400 font-medium", children: "Total Interest Cost" }),
                        evaluatedLoans.map(l => e.jsx("td", { key: l.id, className: "py-2.5 px-3 font-mono font-semibold " + (comparisonSummary?.minInterestId === l.id ? "text-amber-400 bg-amber-500/5" : "text-slate-300"), children: formatCurrency(l.totalInterest) }))
                      ]
                    }),
                    e.jsxs("tr", {
                      children: [
                        e.jsx("td", { className: "py-2.5 px-3 text-slate-400 font-medium", children: "Processing Fee" }),
                        evaluatedLoans.map(l => e.jsx("td", { key: l.id, className: "py-2.5 px-3 font-mono", children: formatCurrency(l.processingFee) + " (" + l.processingFeePct + "%)" }))
                      ]
                    }),
                    e.jsxs("tr", {
                      className: "bg-slate-900/60 font-bold",
                      children: [
                        e.jsx("td", { className: "py-3 px-3 text-slate-200", children: "Total Loan Outflow" }),
                        evaluatedLoans.map(l => e.jsx("td", { key: l.id, className: "py-3 px-3 font-mono text-sm " + (comparisonSummary?.bestValueId === l.id ? "text-emerald-400 font-black bg-emerald-500/10" : "text-white"), children: formatCurrency(l.totalCost) }))
                      ]
                    })
                  ]
                })
              ]
            })
          })
        ]
      })
    ]
  });
}

// ==========================================
// 2. COMMERCIAL DISCOUNT & TAX CALCULATOR
// ==========================================
function DiscountCalculatorView() {
  const [invoiceAmount, setInvoiceAmount] = r.useState(50000);
  const [discountType, setDiscountType] = r.useState('percent'); // 'percent' or 'flat'
  const [discountVal, setDiscountVal] = r.useState(10); // 10%
  const [cashDiscountType, setCashDiscountType] = r.useState('percent');
  const [cashDiscountVal, setCashDiscountVal] = r.useState(2); // 2%
  const [gstRate, setGstRate] = r.useState(18); // 0, 5, 12, 18, 28
  const [copied, setCopied] = r.useState(false);
  const [mode, setMode] = r.useState('direct'); // 'direct' or 'reverse'
  const [targetBudget, setTargetBudget] = r.useState(50000);

  // Direct Calculations
  const results = r.useMemo(() => {
    const gross = Math.max(0, Number(invoiceAmount) || 0);

    // Primary discount
    let primaryDisc = 0;
    if (discountType === 'percent') {
      primaryDisc = gross * (Math.min(100, Math.max(0, Number(discountVal) || 0)) / 100);
    } else {
      primaryDisc = Math.min(gross, Math.max(0, Number(discountVal) || 0));
    }
    const afterPrimary = Math.max(0, gross - primaryDisc);

    // Cash discount
    let cashDisc = 0;
    if (cashDiscountType === 'percent') {
      cashDisc = afterPrimary * (Math.min(100, Math.max(0, Number(cashDiscountVal) || 0)) / 100);
    } else {
      cashDisc = Math.min(afterPrimary, Math.max(0, Number(cashDiscountVal) || 0));
    }
    const taxableBase = Math.max(0, afterPrimary - cashDisc);

    // GST
    const rate = Math.max(0, Number(gstRate) || 0);
    const gstAmount = taxableBase * (rate / 100);
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    const finalPayable = taxableBase + gstAmount;

    const totalDiscountAmt = primaryDisc + cashDisc;
    const effectiveDiscountPct = gross > 0 ? (totalDiscountAmt / gross) * 100 : 0;

    return {
      gross,
      primaryDisc,
      afterPrimary,
      cashDisc,
      taxableBase,
      gstRate: rate,
      gstAmount,
      cgst,
      sgst,
      finalPayable,
      totalDiscountAmt,
      effectiveDiscountPct
    };
  }, [invoiceAmount, discountType, discountVal, cashDiscountType, cashDiscountVal, gstRate]);

  // Reverse mode calculation
  const reverseResults = r.useMemo(() => {
    const target = Math.max(0, Number(targetBudget) || 0);
    const rate = Math.max(0, Number(gstRate) || 0);
    // target = taxableBase * (1 + rate / 100)
    const derivedTaxable = target / (1 + (rate / 100));
    const derivedGst = target - derivedTaxable;

    // assume standard discount %
    const discPct = Math.min(99, Math.max(0, Number(discountVal) || 0));
    const derivedGross = discPct < 100 ? (derivedTaxable / (1 - (discPct / 100))) : derivedTaxable;
    const derivedDiscount = derivedGross - derivedTaxable;

    return {
      target,
      derivedTaxable,
      derivedGst,
      derivedGross,
      derivedDiscount
    };
  }, [targetBudget, gstRate, discountVal]);

  const setPreset = (preset) => {
    if (preset === 'gta') {
      setInvoiceAmount(85000);
      setDiscountType('percent');
      setDiscountVal(5);
      setCashDiscountVal(0);
      setGstRate(5);
    } else if (preset === 'tyres') {
      setInvoiceAmount(140000);
      setDiscountType('percent');
      setDiscountVal(12);
      setCashDiscountType('percent');
      setCashDiscountVal(2.5);
      setGstRate(18);
    } else if (preset === 'spare_parts') {
      setInvoiceAmount(25000);
      setDiscountType('flat');
      setDiscountVal(2500);
      setCashDiscountVal(0);
      setGstRate(28);
    } else if (preset === 'exempt') {
      setInvoiceAmount(60000);
      setDiscountType('percent');
      setDiscountVal(5);
      setCashDiscountVal(0);
      setGstRate(0);
    }
  };

  const copySummary = () => {
    const summary = "🧾 JAI BHAVANI CARGO - COMMERCIAL BILLING SUMMARY\\n" +
      "• Gross Amount: " + formatCurrency(results.gross) + "\\n" +
      "• Trade Discount: -" + formatCurrency(results.primaryDisc) + " (" + results.effectiveDiscountPct.toFixed(1) + "% eff.)\\n" +
      (results.cashDisc > 0 ? ("• Cash Discount: -" + formatCurrency(results.cashDisc) + "\\n") : "") +
      "• Net Taxable Value: " + formatCurrency(results.taxableBase) + "\\n" +
      "• GST (" + results.gstRate + "%): +" + formatCurrency(results.gstAmount) + "\\n" +
      "----------------------------------\\n" +
      "• FINAL NET PAYABLE: " + formatCurrency(results.finalPayable);

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const summary = "*JAI BHAVANI CARGO - BILLING & DISCOUNT SUMMARY*\\n\\n" +
      "📋 *Gross Invoice*: " + formatCurrency(results.gross) + "\\n" +
      "🏷️ *Discount Applied*: -" + formatCurrency(results.totalDiscountAmt) + "\\n" +
      "📦 *Taxable Subtotal*: " + formatCurrency(results.taxableBase) + "\\n" +
      "🏛️ *GST (" + results.gstRate + "%)*: +" + formatCurrency(results.gstAmount) + "\\n" +
      "💰 *TOTAL NET PAYABLE*: *" + formatCurrency(results.finalPayable) + "*\\n\\n" +
      "Total Savings: " + formatCurrency(results.totalDiscountAmt) + " (" + results.effectiveDiscountPct.toFixed(1) + "%)";
    window.open("https://wa.me/?text=" + encodeURIComponent(summary), "_blank");
  };

  return e.jsxs("div", {
    className: "space-y-6 animate-in fade-in duration-300",
    children: [
      // Header
      e.jsxs("div", {
        className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0f1523] border border-[#1e293b]/70 p-5 rounded-2xl shadow-sm",
        children: [
          e.jsxs("div", {
            children: [
              e.jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  e.jsx("span", { className: "text-lg", children: "🏷️" }),
                  e.jsx("h2", { className: "text-lg sm:text-xl font-bold text-white tracking-tight", children: "Commercial Discount & Tax Calculator" })
                ]
              }),
              e.jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Accurately compute freight rate discounts, dealer margins, cash discounts, and GST tax waterfall." })
            ]
          }),
          e.jsxs("div", {
            className: "flex items-center gap-1 bg-[#0b0f19] p-1 rounded-xl border border-slate-800",
            children: [
              e.jsx("button", {
                type: "button",
                onClick: () => setMode('direct'),
                className: \`px-3 py-1.5 rounded-lg text-xs font-semibold transition \${mode === 'direct' ? 'bg-primary text-primary-foreground shadow' : 'text-slate-400 hover:text-white'}\`,
                children: "Direct Calculation"
              }),
              e.jsx("button", {
                type: "button",
                onClick: () => setMode('reverse'),
                className: \`px-3 py-1.5 rounded-lg text-xs font-semibold transition \${mode === 'reverse' ? 'bg-primary text-primary-foreground shadow' : 'text-slate-400 hover:text-white'}\`,
                children: "Reverse Budget"
              })
            ]
          })
        ]
      }),

      // Presets
      e.jsxs("div", {
        className: "flex items-center gap-2 flex-wrap text-xs text-slate-400 bg-[#0b0f19] p-3 rounded-xl border border-slate-800/80",
        children: [
          e.jsx("span", { className: "font-semibold text-slate-300 flex items-center gap-1", children: [e.jsx(SvgIcons.Sparkles, { className: "w-3.5 h-3.5 text-amber-400" }), " Logistics Presets:"] }),
          e.jsx("button", { type: "button", onClick: () => setPreset('gta'), className: "px-2.5 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-200 border border-slate-700/60 rounded-lg transition", children: "🚚 GTA Freight (5% GST)" }),
          e.jsx("button", { type: "button", onClick: () => setPreset('tyres'), className: "px-2.5 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-200 border border-slate-700/60 rounded-lg transition", children: "🔘 Tyres / Spares (18% + Cash Disc)" }),
          e.jsx("button", { type: "button", onClick: () => setPreset('spare_parts'), className: "px-2.5 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-200 border border-slate-700/60 rounded-lg transition", children: "⚙️ Auto Parts / Chassis (28% GST)" }),
          e.jsx("button", { type: "button", onClick: () => setPreset('exempt'), className: "px-2.5 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-200 border border-slate-700/60 rounded-lg transition", children: "🌾 Agri Freight (0% Exempt)" })
        ]
      }),

      mode === 'direct' ? (
        // Direct Mode
        e.jsxs("div", {
          className: "grid grid-cols-1 lg:grid-cols-12 gap-6",
          children: [
            // Left Input Controls (7 cols)
            e.jsxs("div", {
              className: "lg:col-span-7 bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm space-y-5",
              children: [
                e.jsx("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Input Parameters" }),

                // Base Invoice Value
                e.jsxs("div", {
                  className: "space-y-2",
                  children: [
                    e.jsxs("div", {
                      className: "flex justify-between items-center text-xs",
                      children: [
                        e.jsx("label", { className: "text-slate-300 font-semibold", children: "Gross Invoice / Freight Value (₹)" }),
                        e.jsx("span", { className: "font-mono font-bold text-white", children: formatCurrency(invoiceAmount) })
                      ]
                    }),
                    e.jsx("input", {
                      type: "number",
                      min: 0,
                      value: invoiceAmount,
                      onChange: (e2) => setInvoiceAmount(Number(e2.target.value)),
                      className: "w-full px-3 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-primary"
                    }),
                    e.jsx("input", {
                      type: "range",
                      min: 1000,
                      max: 1000000,
                      step: 5000,
                      value: invoiceAmount,
                      onChange: (e2) => setInvoiceAmount(Number(e2.target.value)),
                      className: "w-full accent-primary h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    })
                  ]
                }),

                // Primary Trade Discount
                e.jsxs("div", {
                  className: "space-y-2 pt-2 border-t border-slate-800/60",
                  children: [
                    e.jsxs("div", {
                      className: "flex justify-between items-center text-xs",
                      children: [
                        e.jsx("label", { className: "text-slate-300 font-semibold", children: "Primary Trade / Volume Discount" }),
                        e.jsxs("div", {
                          className: "flex items-center gap-1 bg-[#0a0d14] p-0.5 rounded-lg border border-slate-800",
                          children: [
                            e.jsx("button", {
                              type: "button",
                              onClick: () => setDiscountType('percent'),
                              className: \`px-2 py-0.5 rounded text-[11px] font-bold \${discountType === 'percent' ? 'bg-primary text-primary-foreground' : 'text-slate-400'}\`,
                              children: "%"
                            }),
                            e.jsx("button", {
                              type: "button",
                              onClick: () => setDiscountType('flat'),
                              className: \`px-2 py-0.5 rounded text-[11px] font-bold \${discountType === 'flat' ? 'bg-primary text-primary-foreground' : 'text-slate-400'}\`,
                              children: "₹ Flat"
                            })
                          ]
                        })
                      ]
                    }),
                    e.jsxs("div", {
                      className: "flex items-center gap-2",
                      children: [
                        e.jsx("input", {
                          type: "number",
                          min: 0,
                          value: discountVal,
                          onChange: (e2) => setDiscountVal(Number(e2.target.value)),
                          className: "w-full px-3 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-primary"
                        }),
                        e.jsx("span", { className: "text-slate-400 text-xs font-semibold w-12", children: discountType === 'percent' ? '%' : '₹' })
                      ]
                    })
                  ]
                }),

                // Secondary / Cash Discount
                e.jsxs("div", {
                  className: "space-y-2 pt-2 border-t border-slate-800/60",
                  children: [
                    e.jsxs("div", {
                      className: "flex justify-between items-center text-xs",
                      children: [
                        e.jsx("label", { className: "text-slate-300 font-semibold", children: "Prompt Payment / Cash Discount" }),
                        e.jsxs("div", {
                          className: "flex items-center gap-1 bg-[#0a0d14] p-0.5 rounded-lg border border-slate-800",
                          children: [
                            e.jsx("button", {
                              type: "button",
                              onClick: () => setCashDiscountType('percent'),
                              className: \`px-2 py-0.5 rounded text-[11px] font-bold \${cashDiscountType === 'percent' ? 'bg-primary text-primary-foreground' : 'text-slate-400'}\`,
                              children: "%"
                            }),
                            e.jsx("button", {
                              type: "button",
                              onClick: () => setCashDiscountType('flat'),
                              className: \`px-2 py-0.5 rounded text-[11px] font-bold \${cashDiscountType === 'flat' ? 'bg-primary text-primary-foreground' : 'text-slate-400'}\`,
                              children: "₹ Flat"
                            })
                          ]
                        })
                      ]
                    }),
                    e.jsxs("div", {
                      className: "flex items-center gap-2",
                      children: [
                        e.jsx("input", {
                          type: "number",
                          min: 0,
                          value: cashDiscountVal,
                          onChange: (e2) => setCashDiscountVal(Number(e2.target.value)),
                          className: "w-full px-3 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-primary"
                        }),
                        e.jsx("span", { className: "text-slate-400 text-xs font-semibold w-12", children: cashDiscountType === 'percent' ? '%' : '₹' })
                      ]
                    })
                  ]
                }),

                // GST Rate Selector
                e.jsxs("div", {
                  className: "space-y-2 pt-2 border-t border-slate-800/60",
                  children: [
                    e.jsx("label", { className: "text-slate-300 font-semibold text-xs block", children: "Applicable GST Tax Slab" }),
                    e.jsx("div", {
                      className: "grid grid-cols-5 gap-2",
                      children: [0, 5, 12, 18, 28].map(slab => e.jsxs("button", {
                        key: slab,
                        type: "button",
                        onClick: () => setGstRate(slab),
                        className: \`py-2 rounded-xl text-xs font-bold transition border \${gstRate === slab ? 'bg-primary/20 border-primary text-primary font-black' : 'bg-[#0a0d14] border-slate-800 text-slate-300 hover:border-slate-700'}\`,
                        children: [slab, "%"]
                      }))
                    })
                  ]
                })
              ]
            }),

            // Right Result Waterfall (5 cols)
            e.jsxs("div", {
              className: "lg:col-span-5 bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6",
              children: [
                e.jsxs("div", {
                  className: "space-y-4",
                  children: [
                    e.jsx("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Price Waterfall Breakdown" }),

                    // Big Final Card
                    e.jsxs("div", {
                      className: "p-4 bg-gradient-to-b from-[#131b2e] to-[#0a0d14] rounded-2xl border border-slate-700/60 text-center space-y-1 shadow-sm",
                      children: [
                        e.jsx("span", { className: "text-[10px] font-extrabold uppercase tracking-widest text-emerald-400", children: "FINAL PAYABLE AMOUNT" }),
                        e.jsx("p", { className: "text-3xl font-black text-white font-mono tracking-tight", children: formatCurrency(results.finalPayable) }),
                        e.jsxs("div", {
                          className: "inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs text-emerald-400 font-semibold mt-1",
                          children: [
                            "Total Savings: ",
                            e.jsx("span", { className: "font-mono font-bold", children: formatCurrency(results.totalDiscountAmt) }),
                            " (", results.effectiveDiscountPct.toFixed(1), "%)"
                          ]
                        })
                      ]
                    }),

                    // Step-by-step Waterfall Rows
                    e.jsxs("div", {
                      className: "space-y-2 text-xs divide-y divide-slate-800/80 pt-1",
                      children: [
                        e.jsxs("div", {
                          className: "flex justify-between items-center pt-2 text-slate-300",
                          children: [
                            e.jsx("span", { children: "1. Gross Invoice Amount:" }),
                            e.jsx("span", { className: "font-mono font-semibold text-white", children: formatCurrency(results.gross) })
                          ]
                        }),
                        e.jsxs("div", {
                          className: "flex justify-between items-center pt-2 text-rose-400",
                          children: [
                            e.jsx("span", { children: "2. Trade Discount (-):" }),
                            e.jsxs("span", { className: "font-mono font-semibold", children: ["-", formatCurrency(results.primaryDisc)] })
                          ]
                        }),
                        results.cashDisc > 0 && e.jsxs("div", {
                          className: "flex justify-between items-center pt-2 text-rose-400",
                          children: [
                            e.jsx("span", { children: "3. Cash Discount (-):" }),
                            e.jsxs("span", { className: "font-mono font-semibold", children: ["-", formatCurrency(results.cashDisc)] })
                          ]
                        }),
                        e.jsxs("div", {
                          className: "flex justify-between items-center pt-2 text-sky-400 font-semibold",
                          children: [
                            e.jsx("span", { children: "4. Net Taxable Value:" }),
                            e.jsx("span", { className: "font-mono", children: formatCurrency(results.taxableBase) })
                          ]
                        }),
                        e.jsxs("div", {
                          className: "flex justify-between items-center pt-2 text-amber-400",
                          children: [
                            e.jsxs("span", { children: ["5. GST (", results.gstRate, "%):"] }),
                            e.jsxs("span", { className: "font-mono font-semibold", children: ["+", formatCurrency(results.gstAmount)] })
                          ]
                        }),
                        results.gstRate > 0 && e.jsxs("div", {
                          className: "flex justify-between items-center pt-2 text-[11px] text-slate-500 pl-4",
                          children: [
                            e.jsxs("span", { children: ["CGST (", results.gstRate / 2, "%) + SGST (", results.gstRate / 2, "%):"] }),
                            e.jsxs("span", { className: "font-mono", children: [formatCurrency(results.cgst), " each"] })
                          ]
                        })
                      ]
                    })
                  ]
                }),

                // Action Buttons
                e.jsxs("div", {
                  className: "grid grid-cols-2 gap-3 pt-2",
                  children: [
                    e.jsxs("button", {
                      type: "button",
                      onClick: copySummary,
                      className: "py-2 bg-[#131b2e] hover:bg-[#1a243d] border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition",
                      children: [
                        copied ? e.jsx(SvgIcons.Check, { className: "w-3.5 h-3.5 text-emerald-400" }) : e.jsx(SvgIcons.Copy, { className: "w-3.5 h-3.5" }),
                        copied ? "Copied!" : "Copy Summary"
                      ]
                    }),
                    e.jsxs("button", {
                      type: "button",
                      onClick: shareWhatsApp,
                      className: "py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition",
                      children: [e.jsx(SvgIcons.Share, { className: "w-3.5 h-3.5" }), " WhatsApp Quote"]
                    })
                  ]
                })
              ]
            })
          ]
        })
      ) : (
        // Reverse Mode (Target Budget -> Gross Quote)
        e.jsxs("div", {
          className: "bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm space-y-6 max-w-2xl mx-auto",
          children: [
            e.jsxs("div", {
              children: [
                e.jsx("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Reverse Budget Margin Calculator" }),
                e.jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Customer gave an all-inclusive target budget? Compute backward to determine what base rate and discount to invoice." })
              ]
            }),

            e.jsxs("div", {
              className: "space-y-4",
              children: [
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsx("label", { className: "text-xs text-slate-300 font-semibold", children: "Customer All-Inclusive Target Budget (₹)" }),
                    e.jsx("input", {
                      type: "number",
                      value: targetBudget,
                      onChange: (e2) => setTargetBudget(Number(e2.target.value)),
                      className: "w-full px-3.5 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white font-mono text-base focus:outline-none focus:border-primary"
                    })
                  ]
                }),

                e.jsxs("div", {
                  className: "grid grid-cols-2 gap-4",
                  children: [
                    e.jsxs("div", {
                      className: "space-y-1.5",
                      children: [
                        e.jsx("label", { className: "text-xs text-slate-300 font-semibold", children: "Applicable GST Slab (%)" }),
                        e.jsx("select", {
                          value: gstRate,
                          onChange: (e2) => setGstRate(Number(e2.target.value)),
                          className: "w-full px-3 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white text-xs",
                          children: [0, 5, 12, 18, 28].map(s => e.jsxs("option", { value: s, children: [s, "% GST"] }, s))
                        })
                      ]
                    }),
                    e.jsxs("div", {
                      className: "space-y-1.5",
                      children: [
                        e.jsx("label", { className: "text-xs text-slate-300 font-semibold", children: "Target Discount To Show (%)" }),
                        e.jsx("input", {
                          type: "number",
                          value: discountVal,
                          onChange: (e2) => setDiscountVal(Number(e2.target.value)),
                          className: "w-full px-3 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white text-xs font-mono"
                        })
                      ]
                    })
                  ]
                })
              ]
            }),

            // Reverse Results Table
            e.jsxs("div", {
              className: "p-4 bg-[#0a0d14] rounded-xl border border-slate-800/80 space-y-3 text-xs",
              children: [
                e.jsxs("div", {
                  className: "flex justify-between items-center text-slate-300",
                  children: [
                    e.jsx("span", { children: "Recommended Base Quote (Before Discount):" }),
                    e.jsx("span", { className: "font-mono font-bold text-amber-400 text-sm", children: formatCurrency(reverseResults.derivedGross) })
                  ]
                }),
                e.jsxs("div", {
                  className: "flex justify-between items-center text-slate-300",
                  children: [
                    e.jsxs("span", { children: ["Discount to Show (", discountVal, "%):"] }),
                    e.jsxs("span", { className: "font-mono font-bold text-rose-400", children: ["-", formatCurrency(reverseResults.derivedDiscount)] })
                  ]
                }),
                e.jsxs("div", {
                  className: "flex justify-between items-center text-slate-300",
                  children: [
                    e.jsx("span", { children: "Net Taxable Base (Excl. Tax):" }),
                    e.jsx("span", { className: "font-mono font-bold text-white", children: formatCurrency(reverseResults.derivedTaxable) })
                  ]
                }),
                e.jsxs("div", {
                  className: "flex justify-between items-center text-slate-300",
                  children: [
                    e.jsxs("span", { children: ["GST Amount (", gstRate, "%):"] }),
                    e.jsxs("span", { className: "font-mono font-bold text-sky-400", children: ["+", formatCurrency(reverseResults.derivedGst)] })
                  ]
                }),
                e.jsxs("div", {
                  className: "flex justify-between items-center pt-2 border-t border-slate-800 text-sm font-bold",
                  children: [
                    e.jsx("span", { className: "text-slate-200", children: "Total Budget (Target Match):" }),
                    e.jsx("span", { className: "font-mono text-emerald-400 font-black", children: formatCurrency(reverseResults.target) })
                  ]
                })
              ]
            })
          ]
        })
      )
    ]
  });
}

// ==========================================
// 3. LOGISTICS DAYS & DURATION CALCULATOR
// ==========================================
function DaysCalculatorView() {
  const [subTab, setSubTab] = r.useState('diff'); // 'diff' or 'add'

  // Mode 1: Difference
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeekStr = nextWeekDate.toISOString().split('T')[0];

  const [startDate, setStartDate] = r.useState(todayStr);
  const [endDate, setEndDate] = r.useState(nextWeekStr);
  const [excludeSundays, setExcludeSundays] = r.useState(true);

  // Mode 2: Add/Subtract
  const [baseDate, setBaseDate] = r.useState(todayStr);
  const [dayOffset, setDayOffset] = r.useState(30);
  const [autoShiftSunday, setAutoShiftSunday] = r.useState(true);

  // Calculation for Mode 1
  const diffResults = r.useMemo(() => {
    if (!startDate || !endDate) return null;
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);

    const diffMs = d2.getTime() - d1.getTime();
    const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const isNegative = totalDays < 0;
    const absDays = Math.abs(totalDays);

    const weeks = Math.floor(absDays / 7);
    const remainderDays = absDays % 7;

    // Count business working days
    let workingDays = 0;
    let sundaysCount = 0;
    const cur = new Date(Math.min(d1.getTime(), d2.getTime()));
    const end = new Date(Math.max(d1.getTime(), d2.getTime()));

    while (cur < end) {
      cur.setDate(cur.getDate() + 1);
      const dayOfWeek = cur.getDay(); // 0 is Sunday
      if (dayOfWeek === 0) {
        sundaysCount++;
      } else {
        workingDays++;
      }
    }

    return {
      totalDays,
      absDays,
      weeks,
      remainderDays,
      workingDays: isNegative ? -workingDays : workingDays,
      sundaysCount,
      transitHours: absDays * 24
    };
  }, [startDate, endDate]);

  // Calculation for Mode 2
  const addResults = r.useMemo(() => {
    if (!baseDate) return null;
    const start = new Date(baseDate);
    const target = new Date(start);
    target.setDate(target.getDate() + (Number(dayOffset) || 0));

    const dayOfWeek = target.getDay(); // 0 is Sunday
    const isSunday = dayOfWeek === 0;

    const adjusted = new Date(target);
    if (isSunday && autoShiftSunday) {
      adjusted.setDate(adjusted.getDate() + 1); // Shift to Monday
    }

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const formatFull = (d) => {
      return dayNames[d.getDay()] + ", " + d.getDate() + " " + monthNames[d.getMonth()] + " " + d.getFullYear();
    };

    return {
      targetDateStr: target.toISOString().split('T')[0],
      targetFormatted: formatFull(target),
      targetDayName: dayNames[dayOfWeek],
      isSunday,
      adjustedFormatted: formatFull(adjusted),
      adjustedDateStr: adjusted.toISOString().split('T')[0]
    };
  }, [baseDate, dayOffset, autoShiftSunday]);

  const setOffsetPreset = (days) => {
    setDayOffset(days);
  };

  return e.jsxs("div", {
    className: "space-y-6 animate-in fade-in duration-300",
    children: [
      // Top Header
      e.jsxs("div", {
        className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0f1523] border border-[#1e293b]/70 p-5 rounded-2xl shadow-sm",
        children: [
          e.jsxs("div", {
            children: [
              e.jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  e.jsx("span", { className: "text-lg", children: "📅" }),
                  e.jsx("h2", { className: "text-lg sm:text-xl font-bold text-white tracking-tight", children: "Logistics Days & Duration Calculator" })
                ]
              }),
              e.jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Calculate exact transit duration, freight credit due dates, POD SLAs, and business working days." })
            ]
          }),
          e.jsxs("div", {
            className: "flex items-center gap-1 bg-[#0b0f19] p-1 rounded-xl border border-slate-800",
            children: [
              e.jsx("button", {
                type: "button",
                onClick: () => setSubTab('diff'),
                className: \`px-3 py-1.5 rounded-lg text-xs font-semibold transition \${subTab === 'diff' ? 'bg-primary text-primary-foreground shadow' : 'text-slate-400 hover:text-white'}\`,
                children: "Date Difference"
              }),
              e.jsx("button", {
                type: "button",
                onClick: () => setSubTab('add'),
                className: \`px-3 py-1.5 rounded-lg text-xs font-semibold transition \${subTab === 'add' ? 'bg-primary text-primary-foreground shadow' : 'text-slate-400 hover:text-white'}\`,
                children: "Add / Subtract Days"
              })
            ]
          })
        ]
      }),

      subTab === 'diff' ? (
        // Mode 1: Date Difference
        e.jsxs("div", {
          className: "grid grid-cols-1 lg:grid-cols-12 gap-6",
          children: [
            // Left Inputs (5 cols)
            e.jsxs("div", {
              className: "lg:col-span-5 bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm space-y-4",
              children: [
                e.jsx("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Select Transit Dates" }),

                // Start Date
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsx("label", { className: "text-xs text-slate-300 font-semibold", children: "Loading / Start Date" }),
                    e.jsx("input", {
                      type: "date",
                      value: startDate,
                      onChange: (e2) => setStartDate(e2.target.value),
                      className: "w-full px-3 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-primary"
                    })
                  ]
                }),

                // End Date
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsx("label", { className: "text-xs text-slate-300 font-semibold", children: "Delivery / Unloading Date" }),
                    e.jsx("input", {
                      type: "date",
                      value: endDate,
                      onChange: (e2) => setEndDate(e2.target.value),
                      className: "w-full px-3 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-primary"
                    })
                  ]
                }),

                // Working day toggle
                e.jsxs("div", {
                  className: "pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-300",
                  children: [
                    e.jsx("span", { children: "Exclude Sundays from Working Days" }),
                    e.jsx("input", {
                      type: "checkbox",
                      checked: excludeSundays,
                      onChange: (e2) => setExcludeSundays(e2.target.checked),
                      className: "w-4 h-4 accent-primary rounded cursor-pointer"
                    })
                  ]
                }),

                // Quick buttons
                e.jsxs("div", {
                  className: "flex items-center gap-2 pt-2",
                  children: [
                    e.jsx("button", {
                      type: "button",
                      onClick: () => { setStartDate(todayStr); },
                      className: "px-3 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-300 text-xs rounded-lg border border-slate-800 transition",
                      children: "Start Today"
                    }),
                    e.jsx("button", {
                      type: "button",
                      onClick: () => {
                        const d = new Date();
                        d.setDate(d.getDate() + 3);
                        setEndDate(d.toISOString().split('T')[0]);
                      },
                      className: "px-3 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-300 text-xs rounded-lg border border-slate-800 transition",
                      children: "+3d Express"
                    }),
                    e.jsx("button", {
                      type: "button",
                      onClick: () => {
                        const d = new Date();
                        d.setDate(d.getDate() + 7);
                        setEndDate(d.toISOString().split('T')[0]);
                      },
                      className: "px-3 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-300 text-xs rounded-lg border border-slate-800 transition",
                      children: "+7d Interstate"
                    })
                  ]
                })
              ]
            }),

            // Right Results Display (7 cols)
            diffResults && e.jsxs("div", {
              className: "lg:col-span-7 bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm space-y-5",
              children: [
                e.jsx("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Duration Results" }),

                // Big Day Count Cards
                e.jsxs("div", {
                  className: "grid grid-cols-2 sm:grid-cols-3 gap-3",
                  children: [
                    e.jsxs("div", {
                      className: "p-4 bg-[#0a0d14] rounded-2xl border border-slate-800/80 text-center space-y-1",
                      children: [
                        e.jsx("span", { className: "text-[10px] font-extrabold uppercase tracking-widest text-slate-400", children: "CALENDAR DAYS" }),
                        e.jsx("p", { className: "text-3xl font-black text-white font-mono", children: diffResults.absDays }),
                        e.jsxs("span", { className: "text-[10px] text-slate-500 font-medium block", children: [diffResults.weeks, "w ", diffResults.remainderDays, "d"] })
                      ]
                    }),
                    e.jsxs("div", {
                      className: "p-4 bg-[#0a0d14] rounded-2xl border border-slate-800/80 text-center space-y-1",
                      children: [
                        e.jsx("span", { className: "text-[10px] font-extrabold uppercase tracking-widest text-emerald-400", children: "WORKING DAYS" }),
                        e.jsx("p", { className: "text-3xl font-black text-emerald-400 font-mono", children: diffResults.workingDays }),
                        e.jsxs("span", { className: "text-[10px] text-slate-500 font-medium block", children: ["Excl. ", diffResults.sundaysCount, " Sundays"] })
                      ]
                    }),
                    e.jsxs("div", {
                      className: "p-4 bg-[#0a0d14] rounded-2xl border border-slate-800/80 text-center space-y-1 col-span-2 sm:col-span-1",
                      children: [
                        e.jsx("span", { className: "text-[10px] font-extrabold uppercase tracking-widest text-sky-400", children: "TRANSIT HOURS" }),
                        e.jsx("p", { className: "text-3xl font-black text-sky-400 font-mono", children: diffResults.transitHours }),
                        e.jsx("span", { className: "text-[10px] text-slate-500 font-medium block", children: "Hours continuous" })
                      ]
                    })
                  ]
                }),

                // Logistics SLA Assessment Badge
                e.jsxs("div", {
                  className: "p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5",
                  children: [
                    e.jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400 block", children: "LOGISTICS CLASSIFICATION" }),
                    e.jsxs("p", {
                      className: "text-sm font-semibold text-slate-200",
                      children: [
                        diffResults.absDays <= 3 ? "⚡ Express Regional Haul (≤ 3 Days)" :
                        diffResults.absDays <= 7 ? "🚚 Interstate Standard Transit (4 - 7 Days)" :
                        diffResults.absDays <= 14 ? "🌐 Long-Haul Cross-Country (8 - 14 Days)" :
                        "🚢 Extended Transit / Project Cargo (> 14 Days)",
                        " — Total duration covers ",
                        diffResults.workingDays,
                        " business handling days."
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        })
      ) : (
        // Mode 2: Add / Subtract Days (Credit Terms & SLA)
        e.jsxs("div", {
          className: "grid grid-cols-1 lg:grid-cols-12 gap-6",
          children: [
            // Left (5 cols)
            e.jsxs("div", {
              className: "lg:col-span-5 bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm space-y-5",
              children: [
                e.jsx("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Credit & SLA Parameters" }),

                // Base Date
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsx("label", { className: "text-xs text-slate-300 font-semibold", children: "Invoice / Dispatch Date" }),
                    e.jsx("input", {
                      type: "date",
                      value: baseDate,
                      onChange: (e2) => setBaseDate(e2.target.value),
                      className: "w-full px-3 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-primary"
                    })
                  ]
                }),

                // Offset Days Slider / Input
                e.jsxs("div", {
                  className: "space-y-2",
                  children: [
                    e.jsxs("div", {
                      className: "flex justify-between items-center text-xs",
                      children: [
                        e.jsx("label", { className: "text-slate-300 font-semibold", children: "Credit Period / SLA Offset" }),
                        e.jsxs("span", { className: "font-mono font-bold text-white", children: [dayOffset > 0 ? "+" : "", dayOffset, " Days"] })
                      ]
                    }),
                    e.jsx("input", {
                      type: "number",
                      value: dayOffset,
                      onChange: (e2) => setDayOffset(Number(e2.target.value)),
                      className: "w-full px-3 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-primary"
                    }),
                    e.jsx("input", {
                      type: "range",
                      min: -60,
                      max: 120,
                      step: 1,
                      value: dayOffset,
                      onChange: (e2) => setDayOffset(Number(e2.target.value)),
                      className: "w-full accent-primary h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    })
                  ]
                }),

                // Shift Sunday Toggle
                e.jsxs("div", {
                  className: "pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-300",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsx("span", { className: "font-medium block", children: "Auto-shift Sunday to Monday" }),
                        e.jsx("span", { className: "text-[10px] text-slate-500", children: "Banking and credit terms rollover" })
                      ]
                    }),
                    e.jsx("input", {
                      type: "checkbox",
                      checked: autoShiftSunday,
                      onChange: (e2) => setAutoShiftSunday(e2.target.checked),
                      className: "w-4 h-4 accent-primary rounded cursor-pointer"
                    })
                  ]
                }),

                // Quick Logistics Offset Presets
                e.jsxs("div", {
                  className: "space-y-2 pt-2 border-t border-slate-800/60",
                  children: [
                    e.jsx("span", { className: "text-xs font-semibold text-slate-400 block", children: "Standard Fleet Credit Presets:" }),
                    e.jsxs("div", {
                      className: "grid grid-cols-2 gap-2 text-xs",
                      children: [
                        e.jsx("button", { type: "button", onClick: () => setOffsetPreset(7), className: "p-2 bg-[#0a0d14] hover:bg-[#162035] border border-slate-800 rounded-xl text-left font-medium text-slate-200 transition", children: "+7d (Trip SLA)" }),
                        e.jsx("button", { type: "button", onClick: () => setOffsetPreset(15), className: "p-2 bg-[#0a0d14] hover:bg-[#162035] border border-slate-800 rounded-xl text-left font-medium text-slate-200 transition", children: "+15d (POD SLA)" }),
                        e.jsx("button", { type: "button", onClick: () => setOffsetPreset(30), className: "p-2 bg-[#0a0d14] hover:bg-[#162035] border border-slate-800 rounded-xl text-left font-medium text-slate-200 transition", children: "+30d (Standard Net)" }),
                        e.jsx("button", { type: "button", onClick: () => setOffsetPreset(45), className: "p-2 bg-[#0a0d14] hover:bg-[#162035] border border-slate-800 rounded-xl text-left font-medium text-slate-200 transition", children: "+45d (Corporate)" }),
                        e.jsx("button", { type: "button", onClick: () => setOffsetPreset(60), className: "p-2 bg-[#0a0d14] hover:bg-[#162035] border border-slate-800 rounded-xl text-left font-medium text-slate-200 transition", children: "+60d (Enterprise)" }),
                        e.jsx("button", { type: "button", onClick: () => setOffsetPreset(90), className: "p-2 bg-[#0a0d14] hover:bg-[#162035] border border-slate-800 rounded-xl text-left font-medium text-slate-200 transition", children: "+90d (Quarterly)" })
                      ]
                    })
                  ]
                })
              ]
            }),

            // Right Target Date Display (7 cols)
            addResults && e.jsxs("div", {
              className: "lg:col-span-7 bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6",
              children: [
                e.jsxs("div", {
                  className: "space-y-5",
                  children: [
                    e.jsx("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Computed Due Date" }),

                    // Target Date Card
                    e.jsxs("div", {
                      className: "p-5 bg-gradient-to-b from-[#131b2e] to-[#0a0d14] rounded-2xl border border-slate-700/60 text-center space-y-1.5 shadow-sm",
                      children: [
                        e.jsx("span", { className: "text-[10px] font-extrabold uppercase tracking-widest text-emerald-400", children: "FINAL PAYMENT DUE DATE" }),
                        e.jsx("p", { className: "text-2xl sm:text-3xl font-black text-white tracking-tight", children: autoShiftSunday && addResults.isSunday ? addResults.adjustedFormatted : addResults.targetFormatted }),
                        e.jsxs("span", {
                          className: "text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block mt-1 " + (dayOffset >= 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"),
                          children: [dayOffset >= 0 ? ("Due in " + dayOffset + " days") : (Math.abs(dayOffset) + " days in the past")]
                        })
                      ]
                    }),

                    // Sunday Warning / Adjustment Notice
                    addResults.isSunday && e.jsxs("div", {
                      className: "p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-2.5",
                      children: [
                        e.jsx(SvgIcons.Info, { className: "w-4 h-4 text-amber-400 shrink-0 mt-0.5" }),
                        e.jsxs("div", {
                          children: [
                            e.jsx("p", { className: "font-bold", children: "Target date lands on a Sunday (Non-Banking Day)." }),
                            autoShiftSunday
                              ? e.jsxs("p", { className: "text-amber-200/80 mt-0.5", children: ["Automatically rolled forward to next banking day: ", e.jsx("strong", { children: addResults.adjustedFormatted })] })
                              : e.jsx("p", { className: "text-amber-200/80 mt-0.5", children: "You have disabled auto-shift; settlement may require prior Friday clearing." })
                          ]
                        })
                      ]
                    }),

                    // Timeline Flow
                    e.jsxs("div", {
                      className: "p-4 bg-[#0a0d14] rounded-xl border border-slate-800/80 space-y-2 text-xs",
                      children: [
                        e.jsxs("div", {
                          className: "flex justify-between items-center text-slate-300",
                          children: [
                            e.jsx("span", { children: "Base / Start Date:" }),
                            e.jsx("span", { className: "font-mono font-bold text-white", children: baseDate })
                          ]
                        }),
                        e.jsxs("div", {
                          className: "flex justify-between items-center text-slate-300",
                          children: [
                            e.jsx("span", { children: "Credit Term Added:" }),
                            e.jsxs("span", { className: "font-mono font-bold text-sky-400", children: [dayOffset > 0 ? "+" : "", dayOffset, " Days"] })
                          ]
                        }),
                        e.jsxs("div", {
                          className: "flex justify-between items-center text-slate-300",
                          children: [
                            e.jsx("span", { children: "Exact Calculated Day:" }),
                            e.jsx("span", { className: "font-semibold text-slate-200", children: addResults.targetDayName })
                          ]
                        })
                      ]
                    })
                  ]
                }),

                // Copy Action
                e.jsx("button", {
                  type: "button",
                  onClick: () => {
                    const text = "📅 Payment Terms Due Date: " + (autoShiftSunday && addResults.isSunday ? addResults.adjustedFormatted : addResults.targetFormatted) + " (" + dayOffset + " days credit from " + baseDate + ")";
                    navigator.clipboard.writeText(text);
                  },
                  className: "w-full py-2 bg-[#131b2e] hover:bg-[#1a243d] border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition",
                  children: [e.jsx(SvgIcons.Copy, { className: "w-3.5 h-3.5" }), " Copy Due Date Notice"]
                })
              ]
            })
          ]
        })
      )
    ]
  });
}

// ==========================================
// 4. MASTER UPGRADED EMI CALCULATOR HUB
// ==========================================
function UpgradedEMICalculatorHub(props) {
  // Sync tab with URL search parameter if present
  const getInitialTab = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('tab');
      if (['emi', 'compare', 'discount', 'days'].includes(t)) return t;
    } catch (e) {}
    return 'emi';
  };

  const [activeTab, setActiveTab] = r.useState(getInitialTab);

  const setTab = (newTab) => {
    setActiveTab(newTab);
    try {
      const url = new URL(window.location);
      url.searchParams.set('tab', newTab);
      window.history.replaceState({}, '', url);
    } catch (e) {}
  };

  return e.jsxs("div", {
    className: "min-h-screen bg-[#070b13] text-slate-100 p-4 sm:p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto",
    children: [
      // Top Navigation Hub Header & Tabs Switcher
      e.jsxs("div", {
        className: "bg-[#0b0f19] border border-[#1e293b]/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4",
        children: [
          e.jsxs("div", {
            className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsxs("div", {
                    className: "flex items-center gap-2.5",
                    children: [
                      e.jsx("span", { className: "text-2xl", children: "🧮" }),
                      e.jsx("h1", { className: "text-xl sm:text-2xl font-black text-white tracking-tight font-heading", children: "Fleet Financial & Loan Calculator Hub" }),
                      e.jsx("span", { className: "text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest", children: "PRO UPGRADED" })
                    ]
                  }),
                  e.jsx("p", { className: "text-xs sm:text-sm text-slate-400 mt-1", children: "Comprehensive financial calculation suite for commercial fleet loans, multi-offer comparisons, freight discounts, and credit duration." })
                ]
              }),
              e.jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  e.jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }),
                  e.jsx("span", { className: "text-xs font-semibold text-slate-300", children: "Real-time Live Engine" })
                ]
              })
            ]
          }),

          // Tabs Navigation Switcher
          e.jsxs("div", {
            className: "flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none",
            children: [
              e.jsxs("button", {
                type: "button",
                onClick: () => setTab('emi'),
                className: \`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shrink-0 \${
                  activeTab === 'emi'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-[#0f1523] text-slate-300 hover:text-white hover:bg-[#162035] border border-slate-800'
                }\`,
                children: [
                  e.jsx(SvgIcons.Calculator, { className: "w-4 h-4" }),
                  "EMI & Loan Calculator"
                ]
              }),
              e.jsxs("button", {
                type: "button",
                onClick: () => setTab('compare'),
                className: \`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shrink-0 \${
                  activeTab === 'compare'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-[#0f1523] text-slate-300 hover:text-white hover:bg-[#162035] border border-slate-800'
                }\`,
                children: [
                  e.jsx(SvgIcons.Compare, { className: "w-4 h-4" }),
                  "Compare 2+ Loans",
                  e.jsx("span", { className: "text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950 font-black", children: "NEW" })
                ]
              }),
              e.jsxs("button", {
                type: "button",
                onClick: () => setTab('discount'),
                className: \`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shrink-0 \${
                  activeTab === 'discount'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-[#0f1523] text-slate-300 hover:text-white hover:bg-[#162035] border border-slate-800'
                }\`,
                children: [
                  e.jsx(SvgIcons.Discount, { className: "w-4 h-4" }),
                  "Discount & Tax Calculator",
                  e.jsx("span", { className: "text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500 text-slate-950 font-black", children: "NEW" })
                ]
              }),
              e.jsxs("button", {
                type: "button",
                onClick: () => setTab('days'),
                className: \`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shrink-0 \${
                  activeTab === 'days'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-[#0f1523] text-slate-300 hover:text-white hover:bg-[#162035] border border-slate-800'
                }\`,
                children: [
                  e.jsx(SvgIcons.Calendar, { className: "w-4 h-4" }),
                  "Days & SLA Calculator",
                  e.jsx("span", { className: "text-[10px] px-1.5 py-0.2 rounded-md bg-sky-500 text-slate-950 font-black", children: "NEW" })
                ]
              })
            ]
          })
        ]
      }),

      // Tab Content Views
      activeTab === 'emi' && e.jsx(na, { ...props }),
      activeTab === 'compare' && e.jsx(CompareLoansView, {}),
      activeTab === 'discount' && e.jsx(DiscountCalculatorView, {}),
      activeTab === 'days' && e.jsx(DaysCalculatorView, {})
    ]
  });
}

export { UpgradedEMICalculatorHub as default };
`;

// Now let's assemble the whole bundle:
// 1. Read existing dist/assets/EMICalculatorPage-giOkJhP8.js
const originalBundlePath = path.resolve(process.cwd(), 'dist/assets/EMICalculatorPage-giOkJhP8.js');
let originalBundle = fs.readFileSync(originalBundlePath, 'utf8');

// Replace export{na as default}; with helperCode
const targetExport = 'export{na as default};';
if (!originalBundle.includes(targetExport)) {
  console.error('Target export not found in bundle:', targetExport);
  process.exit(1);
}

const bundledContent = originalBundle.replace(targetExport, helperCode);

// Verify with TypeScript AST Parser
console.log('Verifying compiled bundle syntax with TypeScript AST parser...');
const sf = ts.createSourceFile('EMICalculatorPage-giOkJhP8.js', bundledContent, ts.ScriptTarget.ESNext, true, ts.ScriptKind.JS);
if (sf.parseDiagnostics && sf.parseDiagnostics.length > 0) {
  console.error('Syntax error during AST validation:', sf.parseDiagnostics[0]);
  process.exit(1);
}
console.log('✓ TypeScript AST validation PASSED with 0 syntax errors!');

// Write to all 4 bundle paths
const targetPaths = [
  'dist/assets/EMICalculatorPage-giOkJhP8.js',
  'apps/web/dist/assets/EMICalculatorPage-giOkJhP8.js',
  'apps/api/dist/assets/EMICalculatorPage-giOkJhP8.js',
  'dist/apps/web/assets/EMICalculatorPage-giOkJhP8.js'
];

targetPaths.forEach(tp => {
  const full = path.resolve(process.cwd(), tp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, bundledContent, 'utf8');
  console.log('✓ Written upgraded bundle to:', tp, `(${fs.statSync(full).size} bytes)`);
});

console.log('\n🎉 Successfully compiled and updated Upgraded EMI Calculator Hub across all 4 bundle paths!');
