const fs = require('fs');
const path = require('path');
const ts = require('typescript');

console.log('=== Patching Aging Workspace in PaymentRequestsPage-Ce0o4dzk.js ===');

const targetPaths = [
  'dist/assets/PaymentRequestsPage-Ce0o4dzk.js',
  'apps/web/dist/assets/PaymentRequestsPage-Ce0o4dzk.js',
  'apps/api/dist/assets/PaymentRequestsPage-Ce0o4dzk.js',
  'dist/apps/web/assets/PaymentRequestsPage-Ce0o4dzk.js'
];

// Read the primary bundle
const mainBundlePath = path.resolve(process.cwd(), targetPaths[0]);
let code = fs.readFileSync(mainBundlePath, 'utf8');

// 1. Add agingFilter state variable
const stateTarget = '[xt,kt]=m.useState(!1),';
const stateReplacement = '[xt,kt]=m.useState(!1),[agingFilter,setAgingFilter]=m.useState("all"),';

if (!code.includes(stateTarget)) {
  console.error('Failed to find stateTarget in bundle!');
  process.exit(1);
}
code = code.replace(stateTarget, stateReplacement);
console.log('✓ Added agingFilter state hook');

// 2. Replace agingData (fe) calculation
const oldFeTarget = `fe=m.useMemo(()=>{let t={count:0,amount:0,items:[]},s={count:0,amount:0,items:[]},a={count:0,amount:0,items:[]},n={count:0,amount:0,items:[]};p.forEach(o=>{if(o.calculatedStatus==="Paid"||o.calculatedStatus==="Cancelled")return;const c=o.daysOverdue||0;c<=0||c<=15?(t.count++,t.amount+=o.amount||0,t.items.push(o)):c<=30?(s.count++,s.amount+=o.amount||0,s.items.push(o)):c<=60?(a.count++,a.amount+=o.amount||0,a.items.push(o)):(n.count++,n.amount+=o.amount||0,n.items.push(o))});const r=t.amount+s.amount+a.amount+n.amount;return{bucket0_15:t,bucket16_30:s,bucket31_60:a,bucket60_plus:n,totalUnpaid:r}},[p])`;

const newFeReplacement = `fe=m.useMemo(()=>{let cur={count:0,amount:0,items:[]},b1_15={count:0,amount:0,items:[]},b16_30={count:0,amount:0,items:[]},b31p={count:0,amount:0,items:[]};p.forEach(o=>{if(o.calculatedStatus==="Paid"||o.calculatedStatus==="Cancelled")return;const c=o.daysOverdue||0,amt=Number(o.amount||0);if(c<=0){cur.count++;cur.amount+=amt;cur.items.push(o)}else if(c<=15){b1_15.count++;b1_15.amount+=amt;b1_15.items.push(o)}else if(c<=30){b16_30.count++;b16_30.amount+=amt;b16_30.items.push(o)}else{b31p.count++;b31p.amount+=amt;b31p.items.push(o)}});const r=cur.amount+b1_15.amount+b16_30.amount+b31p.amount,totOverdueCount=b1_15.count+b16_30.count+b31p.count,totOverdueAmt=b1_15.amount+b16_30.amount+b31p.amount;return{bucketCurrent:cur,bucket0_15:cur,bucket1_15:b1_15,bucket16_30:b16_30,bucket31_60:b31p,bucket60_plus:b31p,totalUnpaid:r,totalOverdueCount:totOverdueCount,totalOverdueAmt:totOverdueAmt}},[p])`;

if (!code.includes(oldFeTarget)) {
  console.error('Failed to find oldFeTarget in bundle!');
  process.exit(1);
}
code = code.replace(oldFeTarget, newFeReplacement);
console.log('✓ Replaced fe calculation with accurate non-overlapping buckets');

// 3. Replace the entire Aging Workspace tab content (cards + table)
// Let's locate the start of value:"aging"
const agingTabStart = 'value:"aging",className:"space-y-6 m-0",children:[';
const agingIdx = code.indexOf(agingTabStart);
if (agingIdx === -1) {
  console.error('Failed to find agingTabStart in bundle!');
  process.exit(1);
}

// Find the end of this tab content, which is before the next tab e.jsx(Ge,{value:"ledger" or similar
const nextTabStart = 'e.jsx(Ge,{value:"ledger"';
const nextTabIdx = code.indexOf(nextTabStart, agingIdx);
if (nextTabIdx === -1) {
  console.error('Failed to find nextTabStart after agingTabStart!');
  process.exit(1);
}

// Let's check what is between agingIdx and nextTabIdx
const oldAgingSection = code.slice(agingIdx, nextTabIdx);

// Construct upgraded aging section with:
// - 4 interactive clickable cards with crystal-clear titles and accurate numbers
// - Filter pills for All, Overdue Only, On Schedule, 1-15d Late, 16-30d Late
// - Accurate row labels and colors
// - Descending sort by days overdue
const newAgingSection = `value:"aging",className:"space-y-6 m-0",children:[
  // Top 4 Interactive Aging Cards
  e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",children:[
    // Card 1: Current / Not Due
    e.jsxs($,{onClick:()=>setAgingFilter(agingFilter==="current"?"all":"current"),className:Q("border-t-4 border-t-emerald-500 bg-card shadow-sm cursor-pointer transition hover:border-emerald-400",agingFilter==="current"&&"ring-2 ring-emerald-500 bg-emerald-500/5"),children:[
      e.jsx(ce,{className:"pb-2",children:e.jsx(me,{className:"text-xs font-bold uppercase tracking-wider text-emerald-500",children:"Current (On Schedule)"})}),
      e.jsxs(F,{children:[
        e.jsxs("h3",{className:"text-2xl font-extrabold text-foreground",children:["Rs. ",fe.bucketCurrent.amount.toLocaleString("en-IN")]}),
        e.jsxs("p",{className:"text-xs text-muted-foreground mt-1 font-medium",children:[fe.bucketCurrent.count," Invoices (Not Due)"]})
      ]})
    ]}),

    // Card 2: 1 - 15 Days Late
    e.jsxs($,{onClick:()=>setAgingFilter(agingFilter==="1_15"?"all":"1_15"),className:Q("border-t-4 border-t-amber-500 bg-card shadow-sm cursor-pointer transition hover:border-amber-400",agingFilter==="1_15"&&"ring-2 ring-amber-500 bg-amber-500/5"),children:[
      e.jsx(ce,{className:"pb-2",children:e.jsx(me,{className:"text-xs font-bold uppercase tracking-wider text-amber-500",children:"1 - 15 Days Overdue"})}),
      e.jsxs(F,{children:[
        e.jsxs("h3",{className:"text-2xl font-extrabold text-foreground",children:["Rs. ",fe.bucket1_15.amount.toLocaleString("en-IN")]}),
        e.jsxs("p",{className:"text-xs text-muted-foreground mt-1 font-medium",children:[fe.bucket1_15.count," Invoices (Grace Period)"]})
      ]})
    ]}),

    // Card 3: 16 - 30 Days Late
    e.jsxs($,{onClick:()=>setAgingFilter(agingFilter==="16_30"?"all":"16_30"),className:Q("border-t-4 border-t-orange-500 bg-card shadow-sm cursor-pointer transition hover:border-orange-400",agingFilter==="16_30"&&"ring-2 ring-orange-500 bg-orange-500/5"),children:[
      e.jsx(ce,{className:"pb-2",children:e.jsx(me,{className:"text-xs font-bold uppercase tracking-wider text-orange-500",children:"16 - 30 Days Overdue"})}),
      e.jsxs(F,{children:[
        e.jsxs("h3",{className:"text-2xl font-extrabold text-foreground",children:["Rs. ",fe.bucket16_30.amount.toLocaleString("en-IN")]}),
        e.jsxs("p",{className:"text-xs text-muted-foreground mt-1 font-medium",children:[fe.bucket16_30.count," Invoices (Follow-up)"]})
      ]})
    ]}),

    // Card 4: 31+ Days Late (Critical)
    e.jsxs($,{onClick:()=>setAgingFilter(agingFilter==="31_plus"?"all":"31_plus"),className:Q("border-t-4 border-t-rose-500 bg-card shadow-sm cursor-pointer transition hover:border-rose-400",agingFilter==="31_plus"&&"ring-2 ring-rose-500 bg-rose-500/5"),children:[
      e.jsx(ce,{className:"pb-2",children:e.jsx(me,{className:"text-xs font-bold uppercase tracking-wider text-rose-500",children:"31+ Days (High Risk)"})}),
      e.jsxs(F,{children:[
        e.jsxs("h3",{className:"text-2xl font-extrabold text-foreground",children:["Rs. ",fe.bucket31_60.amount.toLocaleString("en-IN")]}),
        e.jsxs("p",{className:"text-xs text-muted-foreground mt-1 font-medium",children:[fe.bucket31_60.count," Invoices (Escalation)"]})
      ]})
    ]})
  ]}),

  // Aging Invoice Breakdown Card & Table
  e.jsxs($,{className:"shadow-sm",children:[
    e.jsxs(ce,{className:"flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 pb-4",children:[
      e.jsxs("div",{children:[
        e.jsx(me,{className:"text-base sm:text-lg font-bold",children:"Aging Invoice Breakdown"}),
        e.jsxs(Vt,{className:"text-xs text-muted-foreground mt-0.5",children:[
          "Full receivables schedule • ",
          e.jsxs("span",{className:"text-rose-500 font-bold",children:[fe.totalOverdueCount," Overdue (Rs. ",fe.totalOverdueAmt.toLocaleString("en-IN"),")"]}),
          " • ",
          e.jsxs("span",{className:"text-emerald-500 font-bold",children:[fe.bucketCurrent.count," On Schedule (Rs. ",fe.bucketCurrent.amount.toLocaleString("en-IN"),")"]})
        ]})
      ]}),
      e.jsxs("div",{className:"flex items-center gap-1.5 flex-wrap",children:[
        e.jsxs("button",{type:"button",onClick:()=>setAgingFilter("all"),className:Q("px-2.5 py-1 rounded-xl text-xs font-bold transition",agingFilter==="all"?"bg-primary text-primary-foreground shadow-sm":"bg-muted/50 text-muted-foreground hover:text-foreground"),children:["All Unpaid (",p.filter(t=>t.calculatedStatus==="Pending"||t.calculatedStatus==="Overdue").length,")"]}),
        e.jsxs("button",{type:"button",onClick:()=>setAgingFilter("overdue"),className:Q("px-2.5 py-1 rounded-xl text-xs font-bold transition",agingFilter==="overdue"?"bg-rose-600 text-white shadow-sm":"bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"),children:["Overdue Only (",fe.totalOverdueCount,")"]}),
        e.jsxs("button",{type:"button",onClick:()=>setAgingFilter("current"),className:Q("px-2.5 py-1 rounded-xl text-xs font-bold transition",agingFilter==="current"?"bg-emerald-600 text-white shadow-sm":"bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"),children:["On Schedule (",fe.bucketCurrent.count,")"]}),
        e.jsxs("button",{type:"button",onClick:()=>setAgingFilter("1_15"),className:Q("px-2.5 py-1 rounded-xl text-xs font-bold transition",agingFilter==="1_15"?"bg-amber-600 text-white shadow-sm":"bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"),children:["1-15d Late (",fe.bucket1_15.count,")"]}),
        e.jsxs("button",{type:"button",onClick:()=>setAgingFilter("16_30"),className:Q("px-2.5 py-1 rounded-xl text-xs font-bold transition",agingFilter==="16_30"?"bg-orange-600 text-white shadow-sm":"bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"),children:["16-30d Late (",fe.bucket16_30.count,")"]})
      ]})
    ]}),
    e.jsx(F,{className:"p-0",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(Je,{children:[
      e.jsx(Ke,{className:"bg-muted/30",children:e.jsxs(Z,{children:[
        e.jsx(y,{children:"Client"}),
        e.jsx(y,{children:"Trip ID"}),
        e.jsx(y,{children:"Amount"}),
        e.jsx(y,{children:"Due Date & Aging Status"}),
        e.jsx(y,{children:"Aging Bucket"}),
        e.jsx(y,{className:"text-right",children:"Actions"})
      ]})}),
      e.jsx(Xe,{children:(()=>{
        const items = p.filter(t => {
          if (t.calculatedStatus !== "Pending" && t.calculatedStatus !== "Overdue") return false;
          const days = t.daysOverdue || 0;
          if (agingFilter === "overdue") return days > 0;
          if (agingFilter === "current") return days <= 0;
          if (agingFilter === "1_15") return days > 0 && days <= 15;
          if (agingFilter === "16_30") return days > 15 && days <= 30;
          if (agingFilter === "31_plus") return days > 30;
          return true;
        }).sort((t1, t2) => (t2.daysOverdue || 0) - (t1.daysOverdue || 0));

        if (items.length === 0) {
          return e.jsx(Z,{children:e.jsx(b,{colSpan:6,className:"text-center py-8 text-muted-foreground",children:"No invoices matching this aging filter."})});
        }

        return items.map(t => {
          const s = t.daysOverdue || 0;
          let a = "Current (Not Due)", n = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", daysLabel = "✓ On Schedule", daysColor = "text-emerald-400";
          if (s > 60) {
            a = "60+ Days (High Risk)";
            n = "bg-rose-500/10 text-rose-400 border-rose-500/30";
            daysLabel = s + " Days Late";
            daysColor = "text-rose-400";
          } else if (s > 30) {
            a = "31-60 Days Late";
            n = "bg-orange-500/10 text-orange-400 border-orange-500/30";
            daysLabel = s + " Days Late";
            daysColor = "text-orange-400";
          } else if (s > 15) {
            a = "16-30 Days Late";
            n = "bg-amber-500/10 text-amber-400 border-amber-500/30";
            daysLabel = s + " Days Late";
            daysColor = "text-amber-400";
          } else if (s > 0) {
            a = "1-15 Days Late";
            n = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
            daysLabel = s + " Days Late";
            daysColor = "text-yellow-400";
          }

          const dueDateStr = t.due_date ? new Date(t.due_date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "-";

          return e.jsxs(Z,{className:"hover:bg-muted/30 transition",children:[
            e.jsx(b,{className:"font-bold text-white",children:t.expand?.client_id?.client_name||"Unknown Client"}),
            e.jsx(b,{className:"font-mono text-xs text-muted-foreground",children:t.expand?.trip_id?.trip_id||t.trip_id||"-"}),
            e.jsxs(b,{className:"font-bold text-sm font-mono text-white",children:["Rs. ",Number(t.amount||0).toLocaleString("en-IN")]}),
            e.jsxs(b,{children:[
              e.jsx("div",{className:Q("font-bold text-xs", daysColor),children:daysLabel}),
              e.jsxs("div",{className:"text-[10px] text-muted-foreground mt-0.5",children:["Due: ", dueDateStr]})
            ]}),
            e.jsx(b,{children:e.jsx(ne,{variant:"outline",className:Q("font-bold text-[10px] px-2 py-0.5 rounded-full",n),children:a})}),
            e.jsxs(b,{className:"text-right space-x-2",children:[
              e.jsxs(u,{variant:"ghost",size:"sm",className:"h-8 text-emerald-600 dark:text-emerald-400",onClick:()=>tt(t),children:[e.jsx(wt,{className:"w-3.5 h-3.5 mr-1"})," WhatsApp"]}),
              e.jsxs(u,{variant:"outline",size:"sm",className:"h-8",onClick:()=>re(t),children:[e.jsx(Ne,{className:"w-3.5 h-3.5 mr-1 text-success"})," Mark Paid"]})
            ]})
          ]}, t.id);
        });
      })()})
    ]})})})
  ]})
]}),`;

code = code.replace(oldAgingSection, newAgingSection);
console.log('✓ Upgraded Aging Workspace JSX with interactive filtering, accurate counts, and crystal-clear badges');

// Verify with TypeScript AST Parser
console.log('Validating modified code syntax with TypeScript AST parser...');
const sf = ts.createSourceFile('PaymentRequestsPage-Ce0o4dzk.js', code, ts.ScriptTarget.ESNext, true, ts.ScriptKind.JS);
if (sf.parseDiagnostics && sf.parseDiagnostics.length > 0) {
  console.error('AST parsing error:', sf.parseDiagnostics[0]);
  process.exit(1);
}
console.log('✓ TypeScript AST validation PASSED with 0 syntax errors!');

// Write to all 4 target files
targetPaths.forEach(tp => {
  const full = path.resolve(process.cwd(), tp);
  fs.writeFileSync(full, code, 'utf8');
  console.log('✓ Written to:', tp, `(${fs.statSync(full).size} bytes)`);
});

console.log('\n🎉 Successfully patched Aging Workspace across all bundle files!');
