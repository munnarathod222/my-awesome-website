const fs = require('fs');

// Always read from pristine scratch backup if it exists, so patches apply cleanly
let chunk = fs.existsSync('scratch/orig_TripLogsPage-B9k2Lm7P.js') 
  ? fs.readFileSync('scratch/orig_TripLogsPage-B9k2Lm7P.js', 'utf8')
  : fs.readFileSync('dist/assets/TripLogsPage-B9k2Lm7P.js', 'utf8');

if (!fs.existsSync('scratch/orig_TripLogsPage-B9k2Lm7P.js')) {
  fs.writeFileSync('scratch/orig_TripLogsPage-B9k2Lm7P.js', chunk, 'utf8');
}
console.log('Original chunk length:', chunk.length);

// -------------------------------------------------------------
// 1. ADD tr_det COMPONENT (Quick Detention Modal)
// -------------------------------------------------------------
const tr_det_code = `const tr_det=({isOpen:n,trip:t,onClose:d,onSuccess:N})=>{
  if(!t)return null;
  const[days,setDays]=a.useState(t.detention_days!==void 0&&t.detention_days!==null?String(t.detention_days):"0");
  const[rate,setRate]=a.useState(t.detention_rate_per_day!==void 0&&t.detention_rate_per_day!==null?String(t.detention_rate_per_day):"1500");
  const[amt,setAmt]=a.useState(t.detention_amount!==void 0&&t.detention_amount!==null?String(t.detention_amount):"0");
  const[reason,setReason]=a.useState(t.detention_reason||"Unloading Dock Halting / Delay");
  const[saving,setSaving]=a.useState(!1);

  a.useEffect(()=>{
    if(t){
      setDays(t.detention_days!==void 0&&t.detention_days!==null?String(t.detention_days):"0");
      setRate(t.detention_rate_per_day!==void 0&&t.detention_rate_per_day!==null?String(t.detention_rate_per_day):"1500");
      setAmt(t.detention_amount!==void 0&&t.detention_amount!==null?String(t.detention_amount):"0");
      setReason(t.detention_reason||"Unloading Dock Halting / Delay");
    }
  },[t]);

  const handleDaysChange=(dVal)=>{
    setDays(dVal);
    const pDays=parseFloat(dVal)||0;
    const pRate=parseFloat(rate)||1500;
    setAmt(String(Math.round(pDays*pRate)));
  };

  const handleRateChange=(rVal)=>{
    setRate(rVal);
    const pDays=parseFloat(days)||0;
    const pRate=parseFloat(rVal)||0;
    setAmt(String(Math.round(pDays*pRate)));
  };

  const baseRev=parseFloat(t.revenue||t.freight_amount)||0;
  const adv=parseFloat(t.advance_received_from_client)||0;
  const load=t.loading_paid_by!=="company"?(parseFloat(t.loading_charges)||0):0;
  const unload=t.unloading_paid_by!=="company"?(parseFloat(t.unloading_charges)||0):0;
  const mun=parseFloat(t.munsiyana)||0;
  const toll=parseFloat(t.toll_deduction)||0;
  const curDet=parseFloat(amt)||0;
  const gross=baseRev+curDet+load+unload;
  const netBal=Math.max(0,gross-adv-toll-mun);

  const handleSave=async(ev)=>{
    ev.preventDefault();
    setSaving(!0);
    try{
      const pDays=parseFloat(days)||0;
      const pRate=parseFloat(rate)||1500;
      const pAmt=parseFloat(amt)||0;
      const payload={
        detention_days:pDays,
        detention_rate_per_day:pRate,
        detention_amount:pAmt,
        detention_reason:reason,
        detention_status:pAmt>0?"billable":"none"
      };
      await D.collection("trip_logs").update(t.id,payload,{$autoCancel:!1});
      $.success("Detention of ₹"+pAmt.toLocaleString("en-IN")+" saved! Net balance: ₹"+netBal.toLocaleString("en-IN"));
      if(N)N();
      d();
    }catch(err){
      console.error("Detention update error:",err);
      $.error("Failed to save detention: "+(err.message||"Error"));
    }finally{
      setSaving(!1);
    }
  };

  return e.jsx(Me,{
    open:n,
    onOpenChange:d,
    children:e.jsxs(Re,{
      className:"max-w-lg bg-card border border-border shadow-2xl p-6 rounded-3xl text-foreground",
      children:[
        e.jsx(Fe,{
          className:"border-b border-border/40 pb-3",
          children:e.jsxs("div",{
            className:"flex items-center gap-2",
            children:[
              e.jsx("span",{className:"p-2 rounded-xl bg-amber-500/10 text-amber-400 text-lg border border-amber-500/20",children:"⏳"}),
              e.jsxs("div",{
                children:[
                  e.jsx($e,{className:"text-base font-bold text-foreground",children:"Add Detention Charges (Halting)"}),
                  e.jsxs(ze,{
                    className:"text-xs text-muted-foreground",
                    children:[
                      "Trip ",
                      e.jsx("strong",{className:"text-foreground",children:t.trip_id||"N/A"}),
                      " • Truck: ",
                      e.jsx("strong",{className:"text-foreground",children:t.truck_number||"N/A"}),
                      " • Driver: ",
                      e.jsx("strong",{className:"text-foreground",children:t.driver_name||"N/A"})
                    ]
                  })
                ]
              })
            ]
          })
        }),
        e.jsxs("form",{
          onSubmit:handleSave,
          className:"space-y-4 pt-3",
          children:[
            e.jsxs("div",{
              className:"grid grid-cols-2 gap-3",
              children:[
                e.jsxs("div",{
                  className:"space-y-1.5",
                  children:[
                    e.jsx("label",{className:"text-xs font-semibold block text-foreground",children:"Detention Days (Halting)"}),
                    e.jsx("input",{
                      type:"number",
                      step:"0.5",
                      min:"0",
                      value:days,
                      onChange:ev=>handleDaysChange(ev.target.value),
                      placeholder:"e.g. 2",
                      required:!0,
                      className:"w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono font-bold text-foreground shadow-xs"
                    }),
                    e.jsx("span",{className:"text-[10px] text-muted-foreground block",children:"Number of days detained"})
                  ]
                }),
                e.jsxs("div",{
                  className:"space-y-1.5",
                  children:[
                    e.jsx("label",{className:"text-xs font-semibold block text-foreground",children:"Daily Rate (₹ / Day)"}),
                    e.jsx("input",{
                      type:"number",
                      step:"100",
                      min:"0",
                      value:rate,
                      onChange:ev=>handleRateChange(ev.target.value),
                      placeholder:"1500",
                      required:!0,
                      className:"w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground shadow-xs"
                    }),
                    e.jsx("span",{className:"text-[10px] text-muted-foreground block",children:"Contractual daily halting rate"})
                  ]
                })
              ]
            }),
            e.jsxs("div",{
              className:"space-y-1.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30",
              children:[
                e.jsxs("div",{
                  className:"flex items-center justify-between",
                  children:[
                    e.jsx("label",{className:"text-xs font-bold text-amber-400 block",children:"Total Detention Charges (₹)"}),
                    e.jsx("span",{className:"text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20",children:"+ Adds to Trip Balance"})
                  ]
                }),
                e.jsx("input",{
                  type:"number",
                  step:"0.01",
                  min:"0",
                  value:amt,
                  onChange:ev=>setAmt(ev.target.value),
                  placeholder:"0.00",
                  required:!0,
                  className:"w-full rounded-md border border-amber-500/50 bg-background px-3 py-2 text-sm font-mono font-black text-amber-300 shadow-xs"
                }),
                e.jsx("span",{className:"text-[10px] text-amber-200/70 block",children:"Auto-computed as Days × Rate. You can also override with custom amount."})
              ]
            }),
            e.jsxs("div",{
              className:"space-y-1.5",
              children:[
                e.jsx("label",{className:"text-xs font-semibold block text-foreground",children:"Reason / Delay Location"}),
                e.jsxs("select",{
                  value:reason,
                  onChange:ev=>setReason(ev.target.value),
                  className:"w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground shadow-xs",
                  children:[
                    e.jsx("option",{value:"Unloading Dock Halting / Delay",children:"Unloading Dock Halting / Delay"}),
                    e.jsx("option",{value:"Loading Plant Halting / Delay",children:"Loading Plant Halting / Delay"}),
                    e.jsx("option",{value:"Consignee Warehouse Closed",children:"Consignee Warehouse Closed"}),
                    e.jsx("option",{value:"Material Inspection / Testing Delay",children:"Material Inspection / Testing Delay"}),
                    e.jsx("option",{value:"Labor / Forklift Unavailable",children:"Labor / Forklift Unavailable"}),
                    e.jsx("option",{value:"En-Route Transit / Border Hold",children:"En-Route Transit / Border Hold"}),
                    e.jsx("option",{value:"Other Halting Agreement",children:"Other Halting Agreement"})
                  ]
                })
              ]
            }),
            e.jsxs("div",{
              className:"p-3.5 rounded-xl bg-secondary/30 border border-border/80 space-y-2",
              children:[
                e.jsxs("div",{
                  className:"text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between",
                  children:[
                    e.jsx("span",{children:"Trip Balance Breakdown"}),
                    curDet>0&&e.jsxs("span",{className:"text-emerald-400 font-mono font-bold",children:["+₹",curDet.toLocaleString("en-IN")," detention added"]})
                  ]
                }),
                e.jsxs("div",{
                  className:"grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1",
                  children:[
                    e.jsxs("div",{
                      className:"p-2 rounded-lg bg-background/70 border border-border/40",
                      children:[
                        e.jsx("span",{className:"text-[10px] text-muted-foreground block font-sans",children:"Base Freight"}),
                        e.jsxs("span",{className:"font-bold text-foreground",children:["₹",baseRev.toLocaleString("en-IN")]})
                      ]
                    }),
                    e.jsxs("div",{
                      className:"p-2 rounded-lg bg-background/70 border border-border/40",
                      children:[
                        e.jsx("span",{className:"text-[10px] text-muted-foreground block font-sans",children:"Client Advance"}),
                        e.jsxs("span",{className:"font-bold text-sky-400",children:["-₹",adv.toLocaleString("en-IN")]})
                      ]
                    }),
                    mun>0&&e.jsxs("div",{
                      className:"p-2 rounded-lg bg-background/70 border border-border/40",
                      children:[
                        e.jsx("span",{className:"text-[10px] text-muted-foreground block font-sans",children:"Munsiyana (Ded)"}),
                        e.jsxs("span",{className:"font-bold text-rose-400",children:["-₹",mun.toLocaleString("en-IN")]})
                      ]
                    }),
                    e.jsxs("div",{
                      className:"p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30",
                      children:[
                        e.jsx("span",{className:"text-[10px] text-emerald-400 font-bold block font-sans",children:"Net Balance Due"}),
                        e.jsxs("span",{className:"font-black text-emerald-400 text-sm",children:["₹",netBal.toLocaleString("en-IN")]})
                      ]
                    })
                  ]
                })
              ]
            }),
            e.jsxs("div",{
              className:"flex items-center justify-end gap-2 pt-2 border-t border-border/40",
              children:[
                e.jsx(S,{type:"button",variant:"outline",size:"sm",onClick:d,disabled:saving,className:"h-9 px-4 text-xs font-semibold",children:"Cancel"}),
                e.jsx(S,{type:"submit",size:"sm",disabled:saving,className:"h-9 px-5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-md",children:saving?"Saving...":"💾 Save & Update Balance"})
              ]
            })
          ]
        })
      ]
    })
  });
};
`;

// Prepend tr_det_code right before const er=
const erStartTarget = `const er=({isOpen:n,onClose:d,tripId:s,onSuccess:N,employees:u=[],trucks:g=[]})=>{`;
if (!chunk.includes(erStartTarget)) {
  console.error('erStartTarget not found!');
  process.exit(1);
}
chunk = chunk.replace(erStartTarget, tr_det_code + erStartTarget);
console.log('✓ Injected tr_det (QuickDetentionModal)');

// -------------------------------------------------------------
// 2. PATCH TripEditModal (er):
// a) State
// -------------------------------------------------------------
const editStateTarget = `trip_status:"Upcoming",
    mileage:"",
    assigned_managers:"",
    vendor_payout:"",
    payment_model:"Model2",
    toll_deduction:"",
    loading_charges:"",
    loading_paid_by:"client",
    unloading_charges:"",
    unloading_paid_by:"client",
    broker_commission:"",
    munsiyana:"",`;

const editStateReplacement = `trip_status:"Upcoming",
    mileage:"",
    assigned_managers:"",
    vendor_payout:"",
    payment_model:"Model2",
    toll_deduction:"",
    loading_charges:"",
    loading_paid_by:"client",
    unloading_charges:"",
    unloading_paid_by:"client",
    broker_commission:"",
    munsiyana:"",
    detention_days:"0",
    detention_rate_per_day:"1500",
    detention_amount:"0",
    detention_reason:"",`;

if (!chunk.includes(editStateTarget)) {
  console.error('editStateTarget not found!');
  process.exit(1);
}
chunk = chunk.replace(editStateTarget, editStateReplacement);
console.log('✓ Patched TripEditModal state');

// b) useEffect fetch mapping
const editFetchTarget = `loading_charges:v.loading_charges!==void 0&&v.loading_charges!==null?v.loading_charges.toString():"",
        loading_paid_by:v.loading_paid_by||"client",
        unloading_charges:v.unloading_charges!==void 0&&v.unloading_charges!==null?v.unloading_charges.toString():"",
        unloading_paid_by:v.unloading_paid_by||"client",
        broker_commission:v.broker_commission!==void 0&&v.broker_commission!==null?v.broker_commission.toString():"",
        munsiyana:v.munsiyana!==void 0&&v.munsiyana!==null?v.munsiyana.toString():"",`;

const editFetchReplacement = `loading_charges:v.loading_charges!==void 0&&v.loading_charges!==null?v.loading_charges.toString():"",
        loading_paid_by:v.loading_paid_by||"client",
        unloading_charges:v.unloading_charges!==void 0&&v.unloading_charges!==null?v.unloading_charges.toString():"",
        unloading_paid_by:v.unloading_paid_by||"client",
        broker_commission:v.broker_commission!==void 0&&v.broker_commission!==null?v.broker_commission.toString():"",
        munsiyana:v.munsiyana!==void 0&&v.munsiyana!==null?v.munsiyana.toString():"",
        detention_days:v.detention_days!==void 0&&v.detention_days!==null?v.detention_days.toString():"0",
        detention_rate_per_day:v.detention_rate_per_day!==void 0&&v.detention_rate_per_day!==null?v.detention_rate_per_day.toString():"1500",
        detention_amount:v.detention_amount!==void 0&&v.detention_amount!==null?v.detention_amount.toString():"0",
        detention_reason:v.detention_reason||"",`;

if (!chunk.includes(editFetchTarget)) {
  console.error('editFetchTarget not found!');
  process.exit(1);
}
chunk = chunk.replace(editFetchTarget, editFetchReplacement);
console.log('✓ Patched TripEditModal useEffect fetch');

// c) onSubmit payload in TripEditModal
const editSubmitTarget = `loading_charges:parseFloat(r.loading_charges)||0,
          loading_paid_by:r.loading_paid_by||"client",
          unloading_charges:parseFloat(r.unloading_charges)||0,
          unloading_paid_by:r.unloading_paid_by||"client",
          broker_commission:parseFloat(r.broker_commission)||0,
          munsiyana:parseFloat(r.munsiyana)||0,`;

const editSubmitReplacement = `loading_charges:parseFloat(r.loading_charges)||0,
          loading_paid_by:r.loading_paid_by||"client",
          unloading_charges:parseFloat(r.unloading_charges)||0,
          unloading_paid_by:r.unloading_paid_by||"client",
          broker_commission:parseFloat(r.broker_commission)||0,
          munsiyana:parseFloat(r.munsiyana)||0,
          detention_days:parseFloat(r.detention_days)||0,
          detention_rate_per_day:parseFloat(r.detention_rate_per_day)||1500,
          detention_amount:parseFloat(r.detention_amount)||((parseFloat(r.detention_days)||0)*(parseFloat(r.detention_rate_per_day)||1500)),
          detention_reason:r.detention_reason||"",
          detention_status:(parseFloat(r.detention_amount)||((parseFloat(r.detention_days)||0)*(parseFloat(r.detention_rate_per_day)||1500)))>0?"billable":"none",`;

if (!chunk.includes(editSubmitTarget)) {
  console.error('editSubmitTarget not found!');
  process.exit(1);
}
chunk = chunk.replace(editSubmitTarget, editSubmitReplacement);
console.log('✓ Patched TripEditModal onSubmit payload');

// d) CARD 2 (Financials): Add Detention Days, Rate, Amount inputs and Live Balance Box (with Munsiyana and CompExp)
const editCard2Target = `e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-late-reason",className:"text-xs font-semibold text-rose-400",children:"Late Delivery Reason (If Delayed)"}),
              e.jsx(se,{id:"edit-late-reason",type:"text",value:r.late_delivery_reason||"",onChange:m=>x({...r,late_delivery_reason:m.target.value}),placeholder:"e.g. Traffic Congestion, Breakdown",className:"bg-background h-9 text-xs"})
            ]})
          ]}),`;

const editCard2Replacement = `e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-late-reason",className:"text-xs font-semibold text-rose-400",children:"Late Delivery Reason (If Delayed)"}),
              e.jsx(se,{id:"edit-late-reason",type:"text",value:r.late_delivery_reason||"",onChange:m=>x({...r,late_delivery_reason:m.target.value}),placeholder:"e.g. Traffic Congestion, Breakdown",className:"bg-background h-9 text-xs"})
            ]}),
            // Detention Days
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx("label",{htmlFor:"edit-det-days",className:"text-xs font-semibold text-amber-400 block",children:"Detention Days (Halting)"}),
              e.jsx("input",{
                id:"edit-det-days",
                type:"number",
                step:"0.5",
                min:"0",
                value:r.detention_days!==void 0?r.detention_days:"0",
                onChange:m=>{
                  const dVal=m.target.value;
                  const rVal=parseFloat(r.detention_rate_per_day)||1500;
                  const cAmt=Math.round((parseFloat(dVal)||0)*rVal);
                  x({...r,detention_days:dVal,detention_amount:cAmt>0?String(cAmt):(dVal===""?"":"0")});
                },
                placeholder:"0",
                className:"w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono font-bold text-foreground h-9 shadow-xs"
              })
            ]}),
            // Detention Rate per Day
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx("label",{htmlFor:"edit-det-rate",className:"text-xs font-semibold block text-foreground",children:"Detention Rate (₹ / Day)"}),
              e.jsx("input",{
                id:"edit-det-rate",
                type:"number",
                step:"100",
                min:"0",
                value:r.detention_rate_per_day!==void 0?r.detention_rate_per_day:"1500",
                onChange:m=>{
                  const rVal=m.target.value;
                  const dVal=parseFloat(r.detention_days)||0;
                  const cAmt=Math.round(dVal*(parseFloat(rVal)||0));
                  x({...r,detention_rate_per_day:rVal,detention_amount:cAmt>0?String(cAmt):(rVal===""?"":"0")});
                },
                placeholder:"1500",
                className:"w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground h-9 shadow-xs"
              })
            ]}),
            // Total Detention Charges
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsxs("div",{className:"flex items-center justify-between",children:[
                e.jsx("label",{htmlFor:"edit-det-amount",className:"text-xs font-bold text-amber-400 block",children:"Total Detention (₹)"}),
                e.jsx("span",{className:"text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20",children:"+ Adds to Balance"})
              ]}),
              e.jsx("input",{
                id:"edit-det-amount",
                type:"number",
                step:"0.01",
                min:"0",
                value:r.detention_amount!==void 0?r.detention_amount:"0",
                onChange:m=>x({...r,detention_amount:m.target.value}),
                placeholder:"0.00",
                className:"w-full rounded-md border border-amber-500/50 bg-background px-3 py-2 text-xs font-mono font-bold text-amber-300 h-9 shadow-xs"
              })
            ]})
          ]}),
          // Real-time Balance & Expenses Box in Card 2
          (()=>{
            const bRev=parseFloat(r.revenue)||0;
            const dAmt=parseFloat(r.detention_amount)||0;
            const lAmt=r.loading_paid_by!=="company"?(parseFloat(r.loading_charges)||0):0;
            const uAmt=r.unloading_paid_by!=="company"?(parseFloat(r.unloading_charges)||0):0;
            const advC=parseFloat(r.advance_received_from_client)||0;
            const tll=parseFloat(r.toll_deduction)||0;
            const mun=parseFloat(r.munsiyana)||0;
            const compLoad=r.loading_paid_by==="company"?(parseFloat(r.loading_charges)||0):0;
            const compUnload=r.unloading_paid_by==="company"?(parseFloat(r.unloading_charges)||0):0;
            const broker=parseFloat(r.broker_commission)||0;
            const compExp=compLoad+compUnload+broker;
            const grs=bRev+dAmt+lAmt+uAmt;
            const nBal=Math.max(0,grs-advC-tll-mun);

            return e.jsxs("div",{className:"p-4 rounded-xl bg-card border border-border/80 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-3",children:[
              e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs w-full md:w-auto font-mono",children:[
                e.jsxs("div",{children:[
                  e.jsx("span",{className:"text-[10px] text-muted-foreground uppercase block font-sans",children:"Base Revenue"}),
                  e.jsxs("span",{className:"font-bold text-foreground",children:["₹",bRev.toLocaleString("en-IN")]})
                ]}),
                e.jsxs("div",{children:[
                  e.jsx("span",{className:"text-[10px] text-muted-foreground uppercase block font-sans",children:"Detention"}),
                  e.jsxs("span",{className:dAmt>0?"font-bold text-amber-400":"font-bold text-muted-foreground",children:[dAmt>0?("+₹"+dAmt.toLocaleString("en-IN")):"₹0"]})
                ]}),
                e.jsxs("div",{children:[
                  e.jsx("span",{className:"text-[10px] text-muted-foreground uppercase block font-sans",children:"Client Advance"}),
                  e.jsxs("span",{className:"font-bold text-sky-400",children:["-₹",advC.toLocaleString("en-IN")]})
                ]}),
                mun>0&&e.jsxs("div",{children:[
                  e.jsx("span",{className:"text-[10px] text-muted-foreground uppercase block font-sans",children:"Munsiyana (Ded)"}),
                  e.jsxs("span",{className:"font-bold text-rose-400",children:["-₹",mun.toLocaleString("en-IN")]})
                ]}),
                compExp>0&&e.jsxs("div",{children:[
                  e.jsx("span",{className:"text-[10px] text-purple-400 font-bold uppercase block font-sans",children:"Company Exp"}),
                  e.jsxs("span",{className:"font-bold text-purple-300",children:["₹",compExp.toLocaleString("en-IN")]})
                ]})
              ]}),
              e.jsx("div",{className:"flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-border/40",children:e.jsxs("div",{className:"text-right",children:[
                e.jsx("span",{className:"text-[10px] text-emerald-400/90 uppercase font-bold tracking-wider block",children:"★ Net Trip Balance Due"}),
                e.jsxs("span",{className:"text-xl font-black font-mono text-emerald-400",children:["₹",nBal.toLocaleString("en-IN")]})
              ]})})
            ]});
          })(),`;

if (!chunk.includes(editCard2Target)) {
  console.error('editCard2Target not found!');
  process.exit(1);
}
chunk = chunk.replace(editCard2Target, editCard2Replacement);
console.log('✓ Patched TripEditModal CARD 2 with Detention Inputs & Live Balance Box');

// -------------------------------------------------------------
// 3. PATCH TripLogsPage MAIN COMPONENT:
// a) State: Add qDetTrip state
// -------------------------------------------------------------
const pageStateTarget = `const Qt=t=>{re(t),X(!0)},Hs=()=>{X(!1),re(null)}`;
const pageStateReplacement = `const[qDetTrip,setQDetTrip]=a.useState(null);const Qt=t=>{re(t),X(!0)},Hs=()=>{X(!1),re(null)}`;

if (!chunk.includes(pageStateTarget)) {
  console.error('pageStateTarget not found!');
  process.exit(1);
}
chunk = chunk.replace(pageStateTarget, pageStateReplacement);
console.log('✓ Added qDetTrip state');

// b) Desktop Action Column: Add ⏳ Detention button next to Edit
const deskActionTarget = `e.jsx(S,{variant:"outline",size:"icon",onClick:()=>Qt(t.id),className:"h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:border-primary/50 bg-background",title:"Edit trip",children:e.jsx(Rt,{className:"w-4 h-4"})})`;

const deskActionReplacement = `e.jsxs(S,{variant:"outline",size:"sm",onClick:()=>setQDetTrip(t),className:"h-8 px-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 bg-background shrink-0 "+(Number(t.detention_amount)>0?"text-amber-400 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 shadow-xs":"text-muted-foreground hover:text-amber-400 hover:border-amber-500/40"),title:"Quick Add / Edit Detention Charges",children:[
  e.jsx("span",{className:"text-xs",children:"⏳"}),
  e.jsx("span",{className:"hidden xl:inline",children:"Detention"}),
  Number(t.detention_amount)>0&&e.jsxs("span",{className:"text-[10px] font-mono font-bold text-amber-300",children:["₹",Number(t.detention_amount).toLocaleString("en-IN")]})
]}),e.jsx(S,{variant:"outline",size:"icon",onClick:()=>Qt(t.id),className:"h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:border-primary/50 bg-background",title:"Edit trip",children:e.jsx(Rt,{className:"w-4 h-4"})})`;

if (!chunk.includes(deskActionTarget)) {
  console.error('deskActionTarget not found!');
  process.exit(1);
}
chunk = chunk.replace(deskActionTarget, deskActionReplacement);
console.log('✓ Added desktop ⏳ Detention button');

// c) Mobile Card Actions: Add ⏳ Detention button
const mobActionTarget = `e.jsxs(S,{variant:"outline",size:"sm",onClick:()=>Qt(t.id),className:"flex-1 h-8 rounded-xl text-xs font-bold border-border bg-muted/30 hover:bg-muted text-foreground flex items-center justify-center gap-1",children:[e.jsx(Rt,{className:"w-3 h-3 text-muted-foreground"})," Edit"]})`;

const mobActionReplacement = `e.jsxs(S,{variant:"outline",size:"sm",onClick:()=>setQDetTrip(t),className:"flex-1 h-8 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 "+(Number(t.detention_amount)>0?"border-amber-500/40 bg-amber-500/10 text-amber-400":"border-border bg-muted/30 hover:bg-muted text-foreground"),title:"Add Detention Charges",children:[
  e.jsx("span",{className:"text-xs",children:"⏳"}),
  Number(t.detention_amount)>0?("₹"+Number(t.detention_amount).toLocaleString("en-IN")):"Detention"
]}),e.jsxs(S,{variant:"outline",size:"sm",onClick:()=>Qt(t.id),className:"flex-1 h-8 rounded-xl text-xs font-bold border-border bg-muted/30 hover:bg-muted text-foreground flex items-center justify-center gap-1",children:[e.jsx(Rt,{className:"w-3 h-3 text-muted-foreground"})," Edit"]})`;

if (!chunk.includes(mobActionTarget)) {
  console.error('mobActionTarget not found!');
  process.exit(1);
}
chunk = chunk.replace(mobActionTarget, mobActionReplacement);
console.log('✓ Added mobile ⏳ Detention button');

// d) Desktop Revenue Cell: Show detention breakdown
const deskRevTarget = `!d&&e.jsx(Ne,{className:"text-right text-xs font-bold font-mono text-emerald-400 py-2 px-2",children:ae(t.revenue)})`;

const deskRevReplacement = `!d&&e.jsxs(Ne,{className:"text-right py-2 px-2 font-mono",children:[
  e.jsx("div",{className:"text-xs font-bold text-emerald-400",children:ae(t.revenue)}),
  Number(t.detention_amount)>0&&e.jsxs("div",{
    onClick:()=>setQDetTrip(t),
    className:"text-[9px] font-bold text-amber-400 cursor-pointer hover:underline mt-0.5",
    title:"Detention: "+(t.detention_days||0)+" days @ Rs. "+(t.detention_rate_per_day||1500)+"/day",
    children:["⏳ Det: +₹",Number(t.detention_amount).toLocaleString("en-IN")," (",(t.detention_days||0),"d)"]
  })
]})`;

if (!chunk.includes(deskRevTarget)) {
  console.error('deskRevTarget not found!');
  process.exit(1);
}
chunk = chunk.replace(deskRevTarget, deskRevReplacement);
console.log('✓ Patched desktop Revenue cell');

// e) Desktop Advances & Balance Cell: Show Net Balance Due incorporating detention, Munsiyana, Toll, and Company Expenses
const deskAdvTarget = `!d&&e.jsx(Ne,{className:"text-right py-2 px-2",children:e.jsxs("div",{className:"flex flex-col items-end gap-0.5 font-mono text-[10px]",children:[e.jsxs("span",{className:"text-emerald-400 font-semibold",title:"Received from Client",children:["+",t.advance_received_from_client>0?ae(t.advance_received_from_client):"Rs. 0"]}),e.jsxs("span",{className:"text-rose-400 font-semibold",title:"Paid to Driver",children:["-",t.advance_paid_to_driver>0?ae(t.advance_paid_to_driver):"Rs. 0"]})]})})`;

const deskAdvReplacement = `!d&&e.jsx(Ne,{className:"text-right py-2 px-2",children:(()=>{
  const rRev=parseFloat(t.revenue||t.freight_amount)||0;
  const rDet=parseFloat(t.detention_amount)||0;
  const rLoad=t.loading_paid_by!=="company"?(parseFloat(t.loading_charges)||0):0;
  const rUnload=t.unloading_paid_by!=="company"?(parseFloat(t.unloading_charges)||0):0;
  const rAdv=parseFloat(t.advance_received_from_client)||0;
  const rToll=parseFloat(t.toll_deduction)||0;
  const rMun=parseFloat(t.munsiyana)||0;
  const rCompLoad=t.loading_paid_by==="company"?(parseFloat(t.loading_charges)||0):0;
  const rCompUnload=t.unloading_paid_by==="company"?(parseFloat(t.unloading_charges)||0):0;
  const rBroker=parseFloat(t.broker_commission)||0;
  const rCompExp=rCompLoad+rCompUnload+rBroker;
  const rGross=rRev+rDet+rLoad+rUnload;
  const rNetBal=Math.max(0,rGross-rAdv-rToll-rMun);

  return e.jsxs("div",{className:"flex flex-col items-end gap-0.5 font-mono text-[10px]",children:[
    e.jsxs("span",{className:"text-emerald-400 font-semibold",title:"Received from Client",children:["Adv: +",rAdv>0?ae(rAdv):"Rs. 0"]}),
    e.jsxs("span",{className:"text-amber-300 font-bold",title:"Net Balance Due: ₹"+rNetBal.toLocaleString("en-IN")+" (Gross: ₹"+rGross.toLocaleString("en-IN")+(rMun>0?(" - Mun: ₹"+rMun.toLocaleString("en-IN")):"")+" - Adv: ₹"+rAdv.toLocaleString("en-IN")+")",children:["Bal: ₹",rNetBal.toLocaleString("en-IN")]}),
    rCompExp>0&&e.jsxs("span",{className:"text-[9px] text-purple-400 font-semibold",title:"Company Operational Charges: ₹"+rCompExp.toLocaleString("en-IN")+" (Hamali/Brokerage)",children:["Exp: ₹",rCompExp.toLocaleString("en-IN")]})
  ]});
})()})`;

if (!chunk.includes(deskAdvTarget)) {
  console.error('deskAdvTarget not found!');
  process.exit(1);
}
chunk = chunk.replace(deskAdvTarget, deskAdvReplacement);
console.log('✓ Patched desktop Advances & Balance cell');

// f) Render tr_det in Dialogs Area
const dialogTarget = `W&&e.jsx(er,{isOpen:W,onClose:Hs,tripId:I,onSuccess:ie,employees:s,trucks:u})`;

const dialogReplacement = `W&&e.jsx(er,{isOpen:W,onClose:Hs,tripId:I,onSuccess:ie,employees:s,trucks:u}),qDetTrip&&e.jsx(tr_det,{isOpen:!!qDetTrip,trip:qDetTrip,onClose:()=>setQDetTrip(null),onSuccess:()=>{ie();setQDetTrip(null);}})`;

if (!chunk.includes(dialogTarget)) {
  console.error('dialogTarget not found!');
  process.exit(1);
}
chunk = chunk.replace(dialogTarget, dialogReplacement);
console.log('✓ Rendered tr_det dialog in Dialogs area');

// g) REMOVE AUTO CLOSED BADGE & 10-MINUTE TIMER
const autoCloseTarget = 't.trip_status==="Delivered"&&t.closure_verified_at?e.jsx("div",{className:"mt-1 flex items-center justify-center",children:e.jsx("span",{className:"inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse",children:`⏳ Auto-closing in ${Math.max(0,Math.ceil((new Date(t.closure_verified_at).getTime()+6e5-Date.now())/6e4))}m`})}):t.trip_status==="Completed"&&t.auto_closed_at?e.jsx("div",{className:"mt-1 flex items-center justify-center",children:e.jsx("span",{className:"inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",children:"🤖 Auto-Closed"})}):';

if (!chunk.includes(autoCloseTarget)) {
  console.error('autoCloseTarget not found!');
  process.exit(1);
}
chunk = chunk.replace(autoCloseTarget, '""?null:');
console.log('✓ Successfully removed Auto-Closed badge and 10-minute countdown timer!');

// -------------------------------------------------------------
// Write back to all target distribution paths!
// -------------------------------------------------------------
const distPaths = [
  'dist/assets/TripLogsPage-B9k2Lm7P.js',
  'dist/apps/web/assets/TripLogsPage-B9k2Lm7P.js',
  'apps/api/dist/assets/TripLogsPage-B9k2Lm7P.js'
];

distPaths.forEach(p => {
  if (fs.existsSync(p)) {
    fs.writeFileSync(p, chunk, 'utf8');
    console.log(`✓ Updated ${p} (${chunk.length} bytes)`);
  } else {
    console.warn(`File not found: ${p}`);
  }
});

console.log('🎉 TripLogsPage-B9k2Lm7P.js successfully patched across all dist assets!');
