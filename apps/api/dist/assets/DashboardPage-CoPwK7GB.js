
function _IdleDayLossCalculatorModal({ isOpen, onClose, truck, allTrucks = [], allTrips = [], ReactModule }) {
  const [activeTab, setActiveTab] = ReactModule.useState('calculator');
  const [selectedPlate, setSelectedPlate] = ReactModule.useState('');
  const [daysIdle, setDaysIdle] = ReactModule.useState(3);
  const [monthlyEmi, setMonthlyEmi] = ReactModule.useState(42000);
  const [driverDailyWage, setDriverDailyWage] = ReactModule.useState(700);
  const [insuranceTaxDaily, setInsuranceTaxDaily] = ReactModule.useState(250);
  const [parkingDaily, setParkingDaily] = ReactModule.useState(150);
  const [dailyRevenue, setDailyRevenue] = ReactModule.useState(8000);
  const [profitMarginPct, setProfitMarginPct] = ReactModule.useState(25);

  const [consigneeName, setConsigneeName] = ReactModule.useState('');
  const [locationName, setLocationName] = ReactModule.useState('');
  const [delayedHours, setDelayedHours] = ReactModule.useState(48);
  const [freeHoursAgreed, setFreeHoursAgreed] = ReactModule.useState(24);
  const [detentionRatePerDay, setDetentionRatePerDay] = ReactModule.useState(3000);
  const [copied, setCopied] = ReactModule.useState(false);

  ReactModule.useEffect(() => {
    if (truck && (truck.plate || truck.truck_number || truck.truckNumber)) {
      setSelectedPlate(truck.plate || truck.truck_number || truck.truckNumber);
    } else if (allTrucks.length > 0) {
      setSelectedPlate(allTrucks[0].truck_number || allTrucks[0].plate || '');
    }
  }, [truck, allTrucks, isOpen]);

  const dailyEmi = Math.round(monthlyEmi / 30);
  const totalDailyFixedBleed = dailyEmi + Number(driverDailyWage) + Number(insuranceTaxDaily) + Number(parkingDaily);
  const cumulativeFixedBleed = totalDailyFixedBleed * daysIdle;
  const foregoneGrossRevenue = Number(dailyRevenue) * daysIdle;
  const foregoneNetMargin = Math.round(foregoneGrossRevenue * (Number(profitMarginPct) / 100));
  const totalEconomicLoss = cumulativeFixedBleed + foregoneNetMargin;
  const avgTripProfit = Math.round(Number(dailyRevenue) * 2 * (Number(profitMarginPct) / 100)) || 4000;
  const recoveryTripsNeeded = Math.ceil(totalEconomicLoss / avgTripProfit);

  const billableDetentionHours = Math.max(0, Number(delayedHours) - Number(freeHoursAgreed));
  const billableDetentionDays = (billableDetentionHours / 24).toFixed(1);
  const totalDetentionClaimAmount = Math.round(Math.max(1, Math.ceil(billableDetentionHours / 24)) * Number(detentionRatePerDay));

  const generateWhatsAppClaim = () => {
    return '🚨 *OFFICIAL DETENTION CHARGE INVOICE CLAIM*\n*JAI BHAVANI CARGO & TRANSPORT SOLUTIONS*\n---------------------------------------------\n📋 *Consignment / Vehicle Details:*\n• Vehicle No: *' + (selectedPlate || 'Commercial Truck') + '*\n• Consignee / Plant: *' + (consigneeName || 'Factory Warehouse') + '*\n• Halt Location: *' + (locationName || 'Unloading Yard') + '*\n\n⏱️ *Detention Breakdown:*\n• Total Plant Halt: *' + delayedHours + ' Hours*\n• Free Unloading Time Allowed: *' + freeHoursAgreed + ' Hours*\n• Net Billable Detention: *' + billableDetentionHours + ' Hours (' + billableDetentionDays + ' Days)*\n• Standard Detention Tariff: *₹' + Number(detentionRatePerDay).toLocaleString('en-IN') + ' / 24 hrs*\n\n💰 *TOTAL DETENTION PAYABLE:*\n👉 *₹' + totalDetentionClaimAmount.toLocaleString('en-IN') + '*\n\n⚠️ _Notice: As per All-India Motor Transport Congress (AIMTC) freight contract norms, detention beyond agreed free unloading window is payable immediately prior to final gate clearance._';
  };

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppClaim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return ReactModule.createElement('div', {
    className: 'fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200'
  }, ReactModule.createElement('div', {
    className: 'bg-slate-950 border border-slate-800 text-white rounded-3xl p-4 sm:p-6 shadow-2xl max-w-2xl w-full flex flex-col gap-4 max-h-[92vh] overflow-y-auto'
  },
    /* Header */
    ReactModule.createElement('div', { className: 'flex items-center justify-between pb-3 border-b border-slate-800' },
      ReactModule.createElement('div', { className: 'flex items-center gap-3' },
        ReactModule.createElement('div', { className: 'w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-lg' }, '📉'),
        ReactModule.createElement('div', null,
          ReactModule.createElement('div', { className: 'flex items-center gap-2' },
            ReactModule.createElement('h3', { className: 'font-bold text-base sm:text-lg text-white' }, 'Idle Day Loss Calculator'),
            ReactModule.createElement('span', { className: 'border border-rose-500/30 text-rose-400 bg-rose-500/10 text-[10px] font-mono px-2 py-0.5 rounded-full' }, 'LIVE ENGINE')
          ),
          ReactModule.createElement('p', { className: 'text-xs text-slate-400 mt-0.5' }, 'Quantify silent cash bleed and generate detention recovery claims')
        )
      ),
      ReactModule.createElement('button', {
        onClick: onClose,
        className: 'p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition cursor-pointer'
      }, '✕')
    ),

    /* Tab Switcher */
    ReactModule.createElement('div', { className: 'flex p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-semibold' },
      ReactModule.createElement('button', {
        type: 'button',
        onClick: () => setActiveTab('calculator'),
        className: 'flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ' + (activeTab === 'calculator' ? 'bg-rose-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white')
      }, '📉 Idle Standing Bleed'),
      ReactModule.createElement('button', {
        type: 'button',
        onClick: () => setActiveTab('detention'),
        className: 'flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ' + (activeTab === 'detention' ? 'bg-amber-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white')
      }, '🛡️ Client Detention Claimer')
    ),

    /* TAB 1: CALCULATOR */
    activeTab === 'calculator' && ReactModule.createElement('div', { className: 'space-y-4 pt-1' },
      /* Truck & Slider */
      ReactModule.createElement('div', { className: 'p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3' },
        ReactModule.createElement('div', { className: 'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2' },
          ReactModule.createElement('span', { className: 'text-xs text-slate-400 uppercase font-bold tracking-wider' }, 'Select Vehicle:'),
          allTrucks.length > 0 ? ReactModule.createElement('select', {
            value: selectedPlate,
            onChange: e => setSelectedPlate(e.target.value),
            className: 'h-8 text-xs font-mono font-bold bg-slate-950 border border-slate-700 text-amber-300 rounded-lg px-2.5 focus:outline-none'
          }, allTrucks.map((t, idx) => ReactModule.createElement('option', { key: idx, value: t.truck_number || t.plate || '' }, (t.truck_number || t.plate || 'Vehicle')))) : null
        ),
        ReactModule.createElement('div', { className: 'pt-2' },
          ReactModule.createElement('div', { className: 'flex justify-between items-center text-xs' },
            ReactModule.createElement('span', { className: 'font-semibold text-slate-300' }, 'Days Vehicle Has Been Idle:'),
            ReactModule.createElement('span', { className: 'text-base font-black font-mono text-rose-400 bg-rose-950/40 border border-rose-500/30 px-2.5 py-0.5 rounded-lg' }, daysIdle + (daysIdle === 1 ? ' Day' : ' Days'))
          ),
          ReactModule.createElement('input', {
            type: 'range',
            min: 1,
            max: 30,
            value: daysIdle,
            onChange: e => setDaysIdle(parseInt(e.target.value, 10)),
            className: 'w-full mt-2 accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg'
          }),
          ReactModule.createElement('div', { className: 'flex justify-between text-[10px] text-slate-500 font-mono mt-1' },
            ReactModule.createElement('span', null, '1 day'),
            ReactModule.createElement('span', null, '7 days'),
            ReactModule.createElement('span', null, '15 days'),
            ReactModule.createElement('span', null, '30 days')
          )
        )
      ),

      /* Hero Loss Metrics */
      ReactModule.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-3 gap-3' },
        ReactModule.createElement('div', { className: 'p-3.5 bg-slate-900 border border-slate-800 rounded-2xl' },
          ReactModule.createElement('span', { className: 'text-[10px] font-bold text-slate-400 uppercase tracking-wider block' }, 'Daily Cash Bleed'),
          ReactModule.createElement('span', { className: 'text-xl sm:text-2xl font-black font-mono text-rose-400 mt-1 block' }, '₹' + totalDailyFixedBleed.toLocaleString('en-IN')),
          ReactModule.createElement('span', { className: 'text-[10px] text-slate-500' }, 'Every 24 hrs truck sits')
        ),
        ReactModule.createElement('div', { className: 'p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-2xl' },
          ReactModule.createElement('span', { className: 'text-[10px] font-bold text-rose-400 uppercase tracking-wider block' }, 'Total Cash Lost (' + daysIdle + 'd)'),
          ReactModule.createElement('span', { className: 'text-xl sm:text-2xl font-black font-mono text-rose-300 mt-1 block' }, '₹' + cumulativeFixedBleed.toLocaleString('en-IN')),
          ReactModule.createElement('span', { className: 'text-[10px] text-rose-400/80' }, 'Direct out-of-pocket drain')
        ),
        ReactModule.createElement('div', { className: 'p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-2xl' },
          ReactModule.createElement('span', { className: 'text-[10px] font-bold text-amber-400 uppercase tracking-wider block' }, 'Total Economic Loss'),
          ReactModule.createElement('span', { className: 'text-xl sm:text-2xl font-black font-mono text-amber-300 mt-1 block' }, '₹' + totalEconomicLoss.toLocaleString('en-IN')),
          ReactModule.createElement('span', { className: 'text-[10px] text-amber-400/80' }, 'Bleed + Lost ₹' + foregoneNetMargin.toLocaleString('en-IN') + ' profit')
        )
      ),

      /* Fixed Cost Inputs */
      ReactModule.createElement('div', { className: 'p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2' },
        ReactModule.createElement('span', { className: 'text-xs font-bold text-slate-300 uppercase tracking-wider block border-b border-slate-800 pb-1.5' }, 'Fixed Daily Cost Breakdown (Customizable)'),
        ReactModule.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs' },
          ReactModule.createElement('div', { className: 'p-2 bg-slate-950 border border-slate-800 rounded-xl' },
            ReactModule.createElement('span', { className: 'text-[10px] text-slate-400 block' }, 'Monthly EMI (₹)'),
            ReactModule.createElement('input', {
              type: 'number',
              value: monthlyEmi,
              onChange: e => setMonthlyEmi(Number(e.target.value) || 0),
              className: 'w-full mt-1 bg-transparent font-mono font-bold text-slate-200 border-b border-slate-700 text-xs py-0.5 focus:outline-none'
            }),
            ReactModule.createElement('span', { className: 'text-[10px] text-slate-500 mt-0.5 block font-mono' }, '₹' + dailyEmi + '/day')
          ),
          ReactModule.createElement('div', { className: 'p-2 bg-slate-950 border border-slate-800 rounded-xl' },
            ReactModule.createElement('span', { className: 'text-[10px] text-slate-400 block' }, 'Driver Pay / Day'),
            ReactModule.createElement('input', {
              type: 'number',
              value: driverDailyWage,
              onChange: e => setDriverDailyWage(Number(e.target.value) || 0),
              className: 'w-full mt-1 bg-transparent font-mono font-bold text-slate-200 border-b border-slate-700 text-xs py-0.5 focus:outline-none'
            }),
            ReactModule.createElement('span', { className: 'text-[10px] text-slate-500 mt-0.5 block' }, 'Retainer wage')
          ),
          ReactModule.createElement('div', { className: 'p-2 bg-slate-950 border border-slate-800 rounded-xl' },
            ReactModule.createElement('span', { className: 'text-[10px] text-slate-400 block' }, 'Insurance & Tax'),
            ReactModule.createElement('input', {
              type: 'number',
              value: insuranceTaxDaily,
              onChange: e => setInsuranceTaxDaily(Number(e.target.value) || 0),
              className: 'w-full mt-1 bg-transparent font-mono font-bold text-slate-200 border-b border-slate-700 text-xs py-0.5 focus:outline-none'
            }),
            ReactModule.createElement('span', { className: 'text-[10px] text-slate-500 mt-0.5 block' }, 'Daily amortized')
          ),
          ReactModule.createElement('div', { className: 'p-2 bg-slate-950 border border-slate-800 rounded-xl' },
            ReactModule.createElement('span', { className: 'text-[10px] text-slate-400 block' }, 'Parking / Yard'),
            ReactModule.createElement('input', {
              type: 'number',
              value: parkingDaily,
              onChange: e => setParkingDaily(Number(e.target.value) || 0),
              className: 'w-full mt-1 bg-transparent font-mono font-bold text-slate-200 border-b border-slate-700 text-xs py-0.5 focus:outline-none'
            }),
            ReactModule.createElement('span', { className: 'text-[10px] text-slate-500 mt-0.5 block' }, 'Halt charges')
          )
        )
      ),

      /* Recovery Box */
      ReactModule.createElement('div', { className: 'p-3 bg-blue-950/20 border border-blue-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs' },
        ReactModule.createElement('div', null,
          ReactModule.createElement('span', { className: 'font-bold text-blue-300 block' }, 'Trips Needed to Recover Lost Money:'),
          ReactModule.createElement('p', { className: 'text-[11px] text-slate-400 mt-0.5' },
            'Requires ', ReactModule.createElement('strong', { className: 'text-blue-300' }, recoveryTripsNeeded + ' trips'), ' to break even from this ' + daysIdle + '-day idle period.'
          )
        ),
        ReactModule.createElement('button', {
          onClick: () => { onClose(); window.location.href = '/trip-logs'; },
          className: 'px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shrink-0'
        }, 'Assign Load →')
      )
    ),

    /* TAB 2: DETENTION */
    activeTab === 'detention' && ReactModule.createElement('div', { className: 'space-y-4 pt-1' },
      ReactModule.createElement('div', { className: 'p-3 bg-amber-950/20 border border-amber-500/30 rounded-2xl text-xs text-slate-300' },
        ReactModule.createElement('p', { className: 'text-amber-300 font-bold' }, '🛡️ Claim Plant / Consignee Detention Damages:'),
        ReactModule.createElement('p', { className: 'text-slate-400 text-[11px] mt-0.5' }, 'When client plant delays loading/unloading beyond free hours, legally invoice detention.')
      ),
      ReactModule.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs' },
        ReactModule.createElement('div', null,
          ReactModule.createElement('span', { className: 'text-[10px] text-slate-400 block' }, 'Client / Plant Name:'),
          ReactModule.createElement('input', {
            placeholder: 'e.g. Factory Warehouse / Depot',
            value: consigneeName,
            onChange: e => setConsigneeName(e.target.value),
            className: 'w-full h-8 mt-1 px-2.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs'
          })
        ),
        ReactModule.createElement('div', null,
          ReactModule.createElement('span', { className: 'text-[10px] text-slate-400 block' }, 'Plant Location:'),
          ReactModule.createElement('input', {
            placeholder: 'e.g. Balanagar Depot / Nhava Sheva',
            value: locationName,
            onChange: e => setLocationName(e.target.value),
            className: 'w-full h-8 mt-1 px-2.5 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs'
          })
        ),
        ReactModule.createElement('div', null,
          ReactModule.createElement('span', { className: 'text-[10px] text-slate-400 block' }, 'Total Hours Held at Plant:'),
          ReactModule.createElement('input', {
            type: 'number',
            value: delayedHours,
            onChange: e => setDelayedHours(Number(e.target.value) || 0),
            className: 'w-full h-8 mt-1 px-2.5 bg-slate-900 border border-slate-700 text-white font-mono rounded-lg text-xs'
          })
        ),
        ReactModule.createElement('div', null,
          ReactModule.createElement('span', { className: 'text-[10px] text-slate-400 block' }, 'Free Agreed Unloading Hours:'),
          ReactModule.createElement('input', {
            type: 'number',
            value: freeHoursAgreed,
            onChange: e => setFreeHoursAgreed(Number(e.target.value) || 0),
            className: 'w-full h-8 mt-1 px-2.5 bg-slate-900 border border-slate-700 text-white font-mono rounded-lg text-xs'
          })
        )
      ),
      ReactModule.createElement('div', { className: 'p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between' },
        ReactModule.createElement('div', null,
          ReactModule.createElement('span', { className: 'text-[10px] uppercase font-bold text-slate-400 block' }, 'Billable Detention (' + billableDetentionHours + ' Hours)'),
          ReactModule.createElement('span', { className: 'text-2xl font-black font-mono text-emerald-400 mt-0.5 block' }, '₹' + totalDetentionClaimAmount.toLocaleString('en-IN'))
        ),
        ReactModule.createElement('button', {
          onClick: handleCopyWhatsApp,
          className: 'px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-lg'
        }, copied ? '✓ Copied!' : 'Copy WhatsApp Notice')
      ),
      ReactModule.createElement('div', { className: 'p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto select-all' },
        generateWhatsAppClaim()
      )
    )
  ));
}


// ── JBC ROLE-BASED DASHBOARD INJECTION (Rule #64) ──────────────────────
const JBC_ROLE_META = {
  super_admin: { label: "Super Admin (Owner / MD)", scope: "Everything (Full 360° Access)", icon: "👑", badge: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
  admin: { label: "Admin (General Manager)", scope: "Operations & Finance (with Security Guardrails)", icon: "⭐", badge: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  fleet_manager: { label: "Fleet Manager", scope: "Vehicles + Drivers + Trips", icon: "🚛", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  operations: { label: "Operations Team", scope: "Loads + Dispatch", icon: "📦", badge: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  accounts: { label: "Accounts & Finance", scope: "Invoices + Payments", icon: "💰", badge: "bg-teal-500/20 text-teal-300 border-teal-500/40" },
  supervisor: { label: "Yard Supervisor", scope: "Assigned Vehicles", icon: "🔧", badge: "bg-orange-500/20 text-orange-300 border-orange-500/40" },
  driver: { label: "Driver Portal", scope: "Only His Trips", icon: "📱", badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" },
  client: { label: "Customer Portal", scope: "Only Their Shipments", icon: "🏢", badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" }
};

function JbcRoleSimulator(){return null;}

import{r as a,j as e,ak as us,u as hs,a6 as ve,af as Xe,aT as Ge,ap as ps,bt as Je,at as ns,bb as ys,b_ as _s,aV as Cs,aE as is,b$ as os,g as fe,az as ks,c0 as Ss,aw as Ts,c1 as Ds,c2 as Is,c3 as As,ai as ts,ar as Ls,a5 as ds,b2 as cs,aU as We,al as Rs,X as Fs,a7 as xs,aA as Ms,aL as $s,b1 as Es,aO as Ps,c4 as Ze,by as Os,as as Vs,ag as Us,be as zs}from"./vendor-react-Bs5V2qFE.js";import{u as gs,p as g,f as qs,t as oe,D as bs,a as fs,b as js,c as vs,d as Ns,L as ge,S as Ne,e as we,g as ye,h as _e,i as _,B as v,I as Oe,T as Bs,j as ws,k as se,C as Y,m as k,l as p,n as Hs,o as Se,q as je,r as Te,s as Ws,v as es,w as X,x as ss,y as $e,z as Ee,A as q,E as j,F as Pe,G as d,H as Xs,J as as,K as Gs,M as Js,N as Ks,O as De,P as Ys,Q as Qs,R as Zs,U as et,V as st}from"./index-DLxf9dwO.js";import{a as tt}from"./addDays-D4tJXVkB.js";import"./vendor-radix-BQCqNqg0.js";import"./vendor-pdf-DtmgLs_2.js";function at({isOpen:c,onClose:i,vehicleId:I,vehicleName:w}){const{currentUser:m}=gs(),[t,L]=a.useState(!1),[f,O]=a.useState(!1),[C,Q]=a.useState([]),[Z,Ie]=a.useState([]),[te,Ae]=a.useState([]),[M,de]=a.useState(""),[ee,ce]=a.useState(""),[u,S]=a.useState({route:"",driver_name:"",kms:"",revenue:"",client_id:"",notes:""});a.useEffect(()=>{c&&(S({route:"",driver_name:"",kms:"",revenue:"",client_id:"",notes:""}),de(""),ce(""),ae())},[c]);const ae=async()=>{O(!0);try{const[r,o,R,le]=await Promise.all([g.collection("routes").getFullList({sort:"route_name",$autoCancel:!1}),g.collection("employees").getFullList({filter:'employee_type="driver" && active_status="active"',sort:"name",$autoCancel:!1}),g.collection("clients").getFullList({sort:"client_name",$autoCancel:!1}),g.collection("trip_logs").getList(1,100,{sort:"-created",$autoCancel:!1})]);Q(r),Ie(qs(o)),Ae(R);let G=0;for(const me of le.items)if(me.trip_id){const ne=me.trip_id.match(/TRIP-(\d+)/);if(ne){const ie=parseInt(ne[1],10);ie>G&&(G=ie)}}let xe=G>0?G+1:le.totalItems+1;de(`TRIP-${xe.toString().padStart(3,"0")}`)}catch(r){console.error("Failed to fetch dependencies:",r),oe.error("Failed to load routes and drivers.")}finally{O(!1)}},re=r=>{ce(r);const o=C.find(R=>R.id===r);S(o?R=>({...R,route:o.route_code,kms:o.distance_km?.toString()||R.kms,revenue:o.amount_per_trip?.toString()||R.revenue}):R=>({...R,route:""}))},B=async r=>{if(r.preventDefault(),!u.route||!u.driver_name||!u.revenue){oe.error("Please fill all required fields");return}L(!0);try{const o={trip_id:M,pod_status:"Pending",truck_number:w,driver_name:u.driver_name,route:u.route,date:se(new Date,"yyyy-MM-dd"),kms:parseFloat(u.kms)||0,revenue:parseFloat(u.revenue)||0,client_id:u.client_id||null,trip_status:"Pending",client_payment_status:"pending",notes:u.notes,user_id:m?.id,created_by:m?.id};await g.collection("trip_logs").create(o,{$autoCancel:!1}),oe.success(`Trip successfully assigned to ${w}`),i()}catch(o){console.error("Failed to assign trip:",o),oe.error(o.message||"Failed to assign trip to vehicle.")}finally{L(!1)}};return e.jsx(bs,{open:c,onOpenChange:r=>!r&&i(),children:e.jsxs(fs,{className:"sm:max-w-[550px] bg-card text-card-foreground p-0 overflow-hidden",children:[e.jsx(js,{className:"p-6 pb-4 border-b border-border/50",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx(vs,{children:"Assign Trip to Vehicle"}),e.jsxs(Ns,{children:["Creating a new trip assignment for truck ",e.jsx("span",{className:"font-semibold text-foreground",children:w}),"."]})]}),M&&e.jsxs("div",{className:"bg-background px-3 py-1.5 rounded-lg border border-border/50 shadow-sm text-center shrink-0",children:[e.jsx("p",{className:"text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5",children:"Trip ID"}),e.jsx("p",{className:"text-sm font-mono font-bold text-primary",children:M})]})]})}),e.jsxs("form",{onSubmit:B,className:"p-6 space-y-4",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs(ge,{children:["Route ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsxs(Ne,{value:ee,onValueChange:re,disabled:f,children:[e.jsx(we,{className:"bg-background",children:e.jsx(ye,{placeholder:"Select route"})}),e.jsx(_e,{children:C.map(r=>e.jsxs(_,{value:r.id,children:[r.route_name," ",r.is_round_trip?"(Round-Trip)":`(${r.route_code})`]},r.id))})]}),(()=>{const r=C.find(o=>o.id===ee);return r?.is_round_trip?e.jsxs("div",{className:"space-y-2 mt-2 p-2 bg-secondary/10 rounded-lg border border-border/40 animate-in fade-in duration-300",children:[e.jsx(ge,{className:"text-xs font-semibold text-primary",children:"Select Leg"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(v,{type:"button",size:"sm",variant:u.route===r.route_code?"default":"outline",onClick:()=>{S(o=>({...o,route:r.route_code,kms:r.distance_km?.toString()||o.kms,revenue:r.amount_per_trip?.toString()||o.revenue}))},className:"flex-1 text-[11px] h-8 px-2",children:["Up Leg (",r.route_code,")"]}),e.jsxs(v,{type:"button",size:"sm",variant:u.route===r.down_route_code?"default":"outline",onClick:()=>{S(o=>({...o,route:r.down_route_code,kms:r.distance_km?.toString()||o.kms,revenue:r.amount_per_trip?.toString()||o.revenue}))},className:"flex-1 text-[11px] h-8 px-2",children:["Down Leg (",r.down_route_code,")"]})]})]}):null})()]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(ge,{children:["Driver ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsxs(Ne,{value:u.driver_name,onValueChange:r=>S({...u,driver_name:r}),disabled:f,children:[e.jsx(we,{className:"bg-background",children:e.jsx(ye,{placeholder:"Assign driver"})}),e.jsxs(_e,{children:[e.jsx(_,{value:"Temporary Driver",className:"font-semibold text-amber-600 dark:text-amber-400",children:"⚡ Temporary Driver"}),Z.map(r=>e.jsx(_,{value:r.name,children:r.name},r.id))]})]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(ge,{children:"Estimated KMs"}),e.jsx(Oe,{type:"number",step:"0.1",placeholder:"0.0",value:u.kms,onChange:r=>S({...u,kms:r.target.value}),className:"bg-background text-foreground"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(ge,{children:["Expected Revenue (₹) ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsx(Oe,{type:"number",step:"0.01",placeholder:"0.00",value:u.revenue,onChange:r=>S({...u,revenue:r.target.value}),required:!0,className:"bg-background text-foreground"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(ge,{children:"Client (Optional)"}),e.jsxs(Ne,{value:u.client_id,onValueChange:r=>S({...u,client_id:r}),disabled:f,children:[e.jsx(we,{className:"bg-background",children:e.jsx(ye,{placeholder:"Select associated client"})}),e.jsx(_e,{children:te.map(r=>e.jsx(_,{value:r.id,children:r.client_name},r.id))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(ge,{children:"Trip Notes"}),e.jsx(Bs,{placeholder:"Any specific instructions for this trip...",value:u.notes,onChange:r=>S({...u,notes:r.target.value}),className:"resize-none h-20 bg-background text-foreground"})]})]}),e.jsxs(ws,{className:"p-6 pt-4 border-t border-border/50 bg-muted/20",children:[e.jsx(v,{type:"button",variant:"outline",onClick:i,disabled:t,children:"Cancel"}),e.jsxs(v,{type:"submit",onClick:B,disabled:t||f,children:[t?e.jsx(us,{className:"w-4 h-4 mr-2 animate-spin"}):null,"Assign Trip"]})]})]})})}function ms(){const c=hs(),[i,I]=a.useState(!0),[w,m]=a.useState(null),[t,L]=a.useState([]),[f,O]=a.useState([]),[C,Q]=a.useState([]),[Z,Ie]=a.useState([]),[te,Ae]=a.useState([]),[M,de]=a.useState([]),[ee,ce]=a.useState([]),[u,S]=a.useState(!1),[ae,re]=a.useState(null),[B,r]=a.useState("grid"),[o,R]=a.useState(""),[le,G]=a.useState("all"),[xe,me]=a.useState("all"),[ne,ie]=a.useState("all"),[ue,Ve]=a.useState("all"),[$,Ue]=a.useState({key:"daysIdle",direction:"desc"}),[Ke,Ye]=a.useState("unassigned"),V=async()=>{try{const s=await g.collection("trucks").getFullList({sort:"truck_number",$autoCancel:!1}),x=await g.collection("trip_logs").getFullList({sort:"-date",$autoCancel:!1}),y=se(new Date,"yyyy-MM-dd"),A=x.filter(n=>n.date===y),F=await g.collection("truck_documents").getFullList({filter:'status = "Active"',$autoCancel:!1}),T=n=>(n||"").replace(/[\s-]/g,"").toUpperCase();L(s),O(x),Q(A);const D=new Map;x.forEach(n=>{const z=T(n.truck_number);z&&!D.has(z)&&D.set(z,n)});const P=new Set,U=new Map;s.forEach(n=>{const z=T(n.truck_number),b=D.get(z);b&&["Dispatched","In Transit","Arrived at Dock","Loading","Pending","Upcoming"].includes(b.trip_status)&&b.trip_status!=="Delivered"&&b.trip_status!=="Completed"&&b.trip_status!=="Cancelled"&&(P.add(n.truck_number),U.set(n.truck_number,{id:b.id,truck_number:n.truck_number,driver_name:b.driver_name||n.driver_name,route:b.route,trip_status:b.trip_status,revenue:b.revenue,date:b.date,truck_id:n.id}))});const qe=s.filter(n=>!P.has(n.truck_number)).map(n=>{const z=T(n.truck_number),b=D.get(z);let W=0,he=n.driver_name||"None",ke="Available for Dispatch",Me=null;if(b&&(b.date||b.created)){Me=b.date||b.created,he=b.driver_name||n.driver_name||"Driver",ke=b.route||"Completed Route";try{W=Math.max(0,as(new Date,new Date(Me)))}catch{W=0}}else W=999;return{...n,daysIdle:W,lastDriver:he,lastRoute:ke,lastDate:Me}});Ie(qe),Ae(Array.from(U.values()));const Be=s.filter(n=>n.current_fastag_balance!==void 0&&n.current_fastag_balance!==null&&n.current_fastag_balance<2e3);de(Be);const He=[],Fe=new Date;F.forEach(n=>{if(!n.expiry_date)return;const z=new Date(n.expiry_date),b=as(z,Fe);if(b<=30){const W=s.find(he=>he.id===n.truck_id);He.push({id:n.id,truck_number:W?W.truck_number:"Unknown",truck_id:n.truck_id,document_type:n.document_type,expiry_date:n.expiry_date,daysLeft:b,isExpired:b<=0})}}),ce(He),m(null)}catch(s){console.error("Failed to fetch fleet status data:",s),m("Unable to load fleet status data.")}finally{I(!1)}};a.useEffect(()=>(V(),g.collection("trip_logs").subscribe("*",()=>V()),g.collection("trucks").subscribe("*",()=>V()),g.collection("truck_documents").subscribe("*",()=>V()),()=>{g.collection("trip_logs").unsubscribe("*"),g.collection("trucks").unsubscribe("*"),g.collection("truck_documents").unsubscribe("*")}),[]);const Qe=s=>{const x=[],y=new Date,A=(s||"").replace(/[\s-]/g,"").toUpperCase();for(let F=0;F<5;F++){const T=tt(y,F),D=se(T,"yyyy-MM-dd"),P=f.find(U=>(U.truck_number||"").replace(/[\s-]/g,"").toUpperCase()===A&&U.date&&U.date.split("T")[0].split(" ")[0]===D&&!["Cancelled","Delivered","Completed"].includes(U.trip_status));x.push({name:se(T,"EEE"),dayNum:se(T,"d"),dateStr:D,isAvailable:!P,tripInfo:P?{id:P.id,route:P.route,status:P.trip_status}:null})}return x},E=[...Z.filter(s=>{const x=s.vehicle_class||(s.truck_axle==="SXL"||s.truck_axle==="2XL"?"2":s.truck_axle==="3XL"?"3":s.truck_axle==="4XL"?"4":s.truck_axle==="5XL"?"5":"");return!(le!=="all"&&x!==le||xe!=="all"&&(s.fastag_status||"Unknown").toLowerCase()!==xe.toLowerCase()||ne!=="all"&&s.ownership_type!==ne||ue!=="all"&&(ue==="0-1"&&s.daysIdle>1||ue==="2-4"&&(s.daysIdle<2||s.daysIdle>4)||ue==="5+"&&s.daysIdle<5)||o&&!s.truck_number.toLowerCase().includes(o.toLowerCase()))})].sort((s,x)=>{let y=s[$.key],A=x[$.key];if($.key==="daysIdle"){const F=Number(y)||0,T=Number(A)||0;return $.direction==="asc"?F-T:T-F}return y=y||"",A=A||"",typeof y=="string"&&(y=y.toLowerCase()),typeof A=="string"&&(A=A.toLowerCase()),y<A?$.direction==="asc"?-1:1:y>A?$.direction==="asc"?1:-1:0}),Le=te.filter(s=>!(o&&!s.truck_number.toLowerCase().includes(o.toLowerCase())&&!s.driver_name?.toLowerCase().includes(o.toLowerCase()))),ze=s=>{let x="asc";$.key===s&&$.direction==="asc"&&(x="desc"),Ue({key:s,direction:x})},l=({columnKey:s})=>$.key!==s?e.jsx(Ds,{className:"w-3.5 h-3.5 ml-1 opacity-40 inline"}):$.direction==="asc"?e.jsx(Is,{className:"w-3.5 h-3.5 ml-1 text-primary inline"}):e.jsx(As,{className:"w-3.5 h-3.5 ml-1 text-primary inline"}),h=s=>{const x=(s||"").toLowerCase();return x==="active"?"bg-success/10 text-success border-success/20":x==="inactive"?"bg-warning/10 text-warning border-warning/20":x==="expired"?"bg-destructive/10 text-destructive border-destructive/20":"bg-muted text-muted-foreground border-border"},H=t.length,J=Z.length,Re=te.length,Ce=H>0?Math.round(Re/H*100):0,K=M.length+ee.length;return e.jsxs("div",{className:"space-y-6",children:[
    
  e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-6",children:[e.jsxs(Y,{className:"lg:col-span-1 border-border/40 bg-card shadow-md flex items-center p-6 rounded-2xl relative overflow-hidden group",children:[e.jsx("div",{className:"absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-indigo-500"}),e.jsxs("div",{className:"flex items-center gap-6 z-10 w-full",children:[e.jsxs("div",{className:"relative shrink-0 flex items-center justify-center",children:[e.jsxs("svg",{className:"w-24 h-24 transform -rotate-90",children:[e.jsx("circle",{cx:"48",cy:"48",r:"38",className:"stroke-muted/40",strokeWidth:"8",fill:"transparent"}),e.jsx(k.circle,{cx:"48",cy:"48",r:"38",className:"stroke-primary",strokeWidth:"8",fill:"transparent",initial:{strokeDashoffset:2*Math.PI*38},animate:{strokeDashoffset:2*Math.PI*38-Ce/100*(2*Math.PI*38)},transition:{duration:1.2,ease:"easeOut"},strokeDasharray:2*Math.PI*38,strokeLinecap:"round"})]}),e.jsxs("div",{className:"absolute flex flex-col items-center justify-center",children:[e.jsx("span",{className:"text-xl font-black tracking-tight text-foreground font-mono",children:i?"...":`${Ce}%`}),e.jsx("span",{className:"text-[8px] font-bold text-muted-foreground uppercase tracking-widest",children:"Active Rate"})]})]}),e.jsxs("div",{className:"space-y-1.5 flex-1",children:[e.jsx("h4",{className:"text-sm font-extrabold text-foreground font-heading",children:"Fleet Utilization"}),e.jsx("p",{className:"text-xs text-muted-foreground leading-relaxed",children:"Active vehicles dispatched on live cargo routes compared to total registered fleet size."}),e.jsxs("div",{className:"flex gap-4 pt-1 text-[11px] font-semibold",children:[e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("div",{className:"w-2.5 h-2.5 rounded-full bg-primary"}),e.jsxs("span",{children:[Re," Active"]})]}),e.jsxs("div",{className:"flex items-center gap-1.5 text-muted-foreground",children:[e.jsx("div",{className:"w-2.5 h-2.5 rounded-full bg-muted-foreground/30"}),e.jsxs("span",{children:[J," Idle"]})]})]})]})]})]}),e.jsxs("div",{className:"lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4",children:[e.jsxs(k.div,{whileHover:{y:-2},className:"relative overflow-hidden p-5 rounded-2xl border border-white/5 bg-card/45 backdrop-blur-md shadow-sm transition-all duration-300 flex flex-col justify-between",children:[e.jsx("div",{className:"absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500"}),e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-muted-foreground",children:"Total Fleet"}),e.jsx("h3",{className:"text-2xl font-black tracking-tight mt-1.5 text-foreground font-mono",children:i?e.jsx(p,{className:"h-8 w-16 rounded-md"}):H})]}),e.jsx("div",{className:"p-2 bg-blue-500/10 rounded-xl border border-blue-500/10",children:e.jsx(ve,{className:"w-4.5 h-4.5 text-blue-400"})})]}),e.jsx("p",{className:"text-[10px] text-muted-foreground mt-4 font-semibold",children:"Registered cargo trucks"})]}),e.jsxs(k.div,{whileHover:{y:-2},className:"relative overflow-hidden p-5 rounded-2xl border border-white/5 bg-card/45 backdrop-blur-md shadow-sm transition-all duration-300 flex flex-col justify-between",children:[e.jsx("div",{className:"absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-orange-500"}),e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-muted-foreground",children:"Available Idle"}),e.jsx("h3",{className:"text-2xl font-black tracking-tight mt-1.5 text-amber-400 font-mono",children:i?e.jsx(p,{className:"h-8 w-16 rounded-md"}):J})]}),e.jsx("div",{className:"p-2 bg-amber-500/10 rounded-xl border border-amber-500/10",children:e.jsx(Xe,{className:"w-4.5 h-4.5 text-amber-400"})})]}),e.jsx("p",{className:"text-[10px] text-muted-foreground mt-4 font-semibold",children:"Ready for dispatch"})]}),e.jsxs(k.div,{whileHover:{y:-2},className:"relative overflow-hidden p-5 rounded-2xl border border-white/5 bg-card/45 backdrop-blur-md shadow-sm transition-all duration-300 flex flex-col justify-between",children:[e.jsx("div",{className:"absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-rose-500 to-red-500"}),e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-muted-foreground",children:"Compliance Alerts"}),e.jsx("h3",{className:`text-2xl font-black tracking-tight mt-1.5 font-mono ${K>0?"text-rose-500":"text-emerald-400"}`,children:i?e.jsx(p,{className:"h-8 w-16 rounded-md"}):K})]}),e.jsx("div",{className:`p-2 rounded-xl border ${K>0?"bg-rose-500/10 border-rose-500/15":"bg-emerald-500/10 border-emerald-500/15"}`,children:e.jsx(Ge,{className:`w-4.5 h-4.5 ${K>0?"text-rose-400":"text-emerald-400"}`})})]}),e.jsx("p",{className:"text-[10px] text-muted-foreground mt-4 font-semibold",children:K>0?"Urgent attention required":"All assets compliant"})]})]})]}),e.jsx(Y,{className:"shadow-lg border-border/40 bg-card overflow-hidden rounded-2xl",children:e.jsxs(Hs,{value:Ke,onValueChange:Ye,className:"w-full",children:[e.jsx(Se,{className:"bg-muted/10 border-b border-border/30 pb-3 space-y-4 px-6 pt-5",children:e.jsxs("div",{className:"flex flex-col md:flex-row md:items-center justify-between gap-4",children:[e.jsxs("div",{children:[e.jsxs(je,{className:"text-lg font-heading tracking-tight flex items-center gap-2",children:[e.jsx(ps,{className:"w-5 h-5 text-primary"}),"Fleet Status & Dispatch Hub"]}),e.jsx(Te,{className:"text-xs mt-0.5",children:"Real-time telemetry and resource controller"})]}),e.jsxs(Ws,{className:"bg-secondary/40 p-1 border border-border/20 rounded-xl flex overflow-x-auto scrollbar-none h-10 w-full md:w-auto shrink-0 [&>button]:shrink-0",children:[e.jsxs(es,{value:"unassigned",className:"flex-1 md:flex-none text-xs rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm",children:[e.jsx(Xe,{className:"w-3.5 h-3.5 text-amber-500"}),"Unassigned (",i?"...":J,")"]}),e.jsxs(es,{value:"active",className:"flex-1 md:flex-none text-xs rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm",children:[e.jsx(Je,{className:"w-3.5 h-3.5 text-emerald-500"}),"Active Fleet (",i?"...":Re,")"]}),e.jsxs(es,{value:"alerts",className:"flex-1 md:flex-none text-xs rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm",children:[e.jsx(Ge,{className:"w-3.5 h-3.5 text-rose-500"}),"Alerts ",K>0&&e.jsx(X,{variant:"destructive",className:"h-5 px-1.5 text-[9px] min-w-5 justify-center flex animate-pulse",children:K})]})]})]})}),e.jsxs(ss,{value:"unassigned",className:"m-0 outline-none",children:[e.jsxs("div",{className:"p-4 border-b border-border/20 bg-muted/5 flex flex-wrap items-center gap-3.5 justify-between",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-2 flex-1 min-w-[280px]",children:[e.jsxs("div",{className:"relative w-full sm:w-auto",children:[e.jsx(ns,{className:"absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"}),e.jsx(Oe,{placeholder:"Search truck number...",className:"pl-8 h-9 bg-background/50 min-w-[180px] text-xs rounded-xl",value:o,onChange:s=>R(s.target.value)})]}),e.jsxs(Ne,{value:le,onValueChange:G,children:[e.jsx(we,{className:"w-[120px] h-9 bg-background/50 text-foreground text-xs rounded-xl border border-border/25",children:e.jsx(ye,{placeholder:"Class"})}),e.jsxs(_e,{className:"rounded-xl",children:[e.jsx(_,{value:"all",children:"All Classes"}),e.jsx(_,{value:"2",children:"Class 2 (2XL/SXL)"}),e.jsx(_,{value:"3",children:"Class 3 (3XL)"}),e.jsx(_,{value:"4",children:"Class 4 (4XL)"}),e.jsx(_,{value:"5",children:"Class 5 (5XL)"})]})]}),e.jsxs(Ne,{value:ne,onValueChange:ie,children:[e.jsx(we,{className:"w-[120px] h-9 bg-background/50 text-foreground text-xs rounded-xl border border-border/25",children:e.jsx(ye,{placeholder:"Ownership"})}),e.jsxs(_e,{className:"rounded-xl",children:[e.jsx(_,{value:"all",children:"All Ownership"}),e.jsx(_,{value:"Owned",children:"Owned Fleet"}),e.jsx(_,{value:"Attached",children:"Attached Vendor"})]})]}),e.jsxs(Ne,{value:ue,onValueChange:Ve,children:[e.jsx(we,{className:"w-[130px] h-9 bg-background/50 text-foreground text-xs rounded-xl border border-border/25",children:e.jsx(ye,{placeholder:"Idle Duration"})}),e.jsxs(_e,{className:"rounded-xl",children:[e.jsx(_,{value:"all",children:"All Idle Durations"}),e.jsx(_,{value:"0-1",children:"Fresh (0-1 days)"}),e.jsx(_,{value:"2-4",children:"Medium (2-4 days)"}),e.jsx(_,{value:"5+",children:"Critical (5+ days)"})]})]}),e.jsxs(Ne,{value:xe,onValueChange:me,children:[e.jsx(we,{className:"w-[120px] h-9 bg-background/50 text-foreground text-xs rounded-xl border border-border/25",children:e.jsx(ye,{placeholder:"FASTag"})}),e.jsxs(_e,{className:"rounded-xl",children:[e.jsx(_,{value:"all",children:"All FASTag"}),e.jsx(_,{value:"active",children:"Active"}),e.jsx(_,{value:"inactive",children:"Inactive"}),e.jsx(_,{value:"expired",children:"Expired"})]})]})]}),e.jsxs("div",{className:"flex items-center gap-1.5 bg-secondary/35 p-1 rounded-xl border border-border/20 shadow-inner",children:[e.jsxs(v,{variant:B==="grid"?"default":"ghost",size:"sm",onClick:()=>r("grid"),className:`h-8 text-xs rounded-lg px-3 ${B==="grid"?"shadow-sm":"text-muted-foreground"}`,children:[e.jsx(ys,{className:"w-3.5 h-3.5 mr-1"})," Grid"]}),e.jsxs(v,{variant:B==="table"?"default":"ghost",size:"sm",onClick:()=>r("table"),className:`h-8 text-xs rounded-lg px-3 ${B==="table"?"shadow-sm":"text-muted-foreground"}`,children:[e.jsx(_s,{className:"w-3.5 h-3.5 mr-1"})," Table"]})]})]}),i?B==="grid"?e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6",children:Array.from({length:6}).map((s,x)=>e.jsxs(Y,{className:"p-6 rounded-3xl border-border/30 space-y-4",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx(p,{className:"h-6 w-24"}),e.jsx(p,{className:"h-5 w-16"})]}),e.jsx(p,{className:"h-10 w-full"}),e.jsx(p,{className:"h-14 w-full"}),e.jsxs("div",{className:"flex justify-between pt-2",children:[e.jsx(p,{className:"h-8 w-16"}),e.jsx(p,{className:"h-8 w-24"})]})]},x))}):e.jsx("div",{className:"overflow-x-auto",children:e.jsxs($e,{children:[e.jsx(Ee,{className:"bg-muted/10",children:e.jsxs(q,{children:[e.jsx(j,{className:"pl-6",children:e.jsx(p,{className:"h-4 w-20"})}),e.jsx(j,{children:e.jsx(p,{className:"h-4 w-20"})}),e.jsx(j,{children:e.jsx(p,{className:"h-4 w-36"})}),e.jsx(j,{className:"text-center",children:e.jsx(p,{className:"h-4 w-16 mx-auto"})}),e.jsx(j,{className:"text-right pr-6",children:e.jsx(p,{className:"h-4 w-20 ml-auto"})})]})}),e.jsx(Pe,{children:Array.from({length:3}).map((s,x)=>e.jsxs(q,{children:[e.jsx(d,{className:"pl-6",children:e.jsx(p,{className:"h-5 w-24"})}),e.jsx(d,{children:e.jsx(p,{className:"h-5 w-24"})}),e.jsx(d,{children:e.jsx(p,{className:"h-9 w-36"})}),e.jsx(d,{className:"text-center",children:e.jsx(p,{className:"h-6 w-16 mx-auto rounded-full"})}),e.jsx(d,{className:"text-right pr-6",children:e.jsx(p,{className:"h-8 w-24 ml-auto"})})]},x))})]})}):E.length===0?e.jsxs("div",{className:"py-20 text-center text-muted-foreground flex flex-col items-center justify-center",children:[e.jsx("div",{className:"w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4",children:e.jsx(ve,{className:"w-8 h-8 opacity-45"})}),e.jsx("p",{className:"font-extrabold text-foreground text-sm",children:"No Unassigned Vehicles"}),e.jsx("p",{className:"text-xs mt-1",children:"All registered trucks are active on route, or try clearing filters."})]}):B==="grid"?e.jsx(Xs,{mode:"popLayout",children:e.jsx(k.div,{layout:!0,className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6",children:E.map(s=>{const x=Qe(s.truck_number),y=s.daysIdle>=5&&s.daysIdle!==999,A=s.daysIdle>=2&&s.daysIdle<5;let F="bg-success/15 border-success/30 text-success",T="bg-success";return y?(F="bg-destructive/15 border-destructive/30 text-destructive animate-pulse",T="bg-destructive"):A?(F="bg-warning/15 border-warning/30 text-warning",T="bg-warning"):s.daysIdle===999&&(F="bg-purple-500/15 border-purple-500/30 text-purple-400",T="bg-purple-500"),e.jsxs(k.div,{layout:!0,initial:{opacity:0,scale:.96},animate:{opacity:1,scale:1},exit:{opacity:0,scale:.96},transition:{duration:.25},className:"relative group rounded-3xl border border-border/40 bg-card/60 hover:bg-card/90 p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/20 flex flex-col justify-between min-h-[300px]",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsxs("span",{className:"text-[10px] font-bold text-muted-foreground uppercase tracking-widest block",children:[s.ownership_type||"Owned"," • Class ",s.vehicle_class||"2"]}),e.jsx("h4",{className:"text-base font-extrabold font-mono tracking-tight text-foreground group-hover:text-primary transition-colors",children:s.truck_number})]}),e.jsx(X,{variant:"outline",className:`font-bold text-[9px] uppercase tracking-wider py-0.5 px-2.5 rounded-full border ${F}`,children:s.daysIdle===999?"New Fleet":`${s.daysIdle} Days Idle`})]}),s.daysIdle!==999&&e.jsxs("div",{className:"mt-3.5 space-y-1",children:[e.jsxs("div",{className:"flex justify-between text-[9px] text-muted-foreground font-bold uppercase tracking-wider",children:[e.jsx("span",{children:"Idle Alert Level"}),e.jsx("span",{children:s.daysIdle>=5?"Critical":"Compliant"})]}),e.jsx("div",{className:"w-full h-1.5 bg-secondary rounded-full overflow-hidden",children:e.jsx("div",{className:`h-full ${T}`,style:{width:`${Math.min(100,s.daysIdle/7*100)}%`}})})]}),e.jsxs("div",{className:"mt-4 p-3 rounded-2xl bg-secondary/15 border border-border/15 text-[11px] space-y-1.5",children:[e.jsx("p",{className:"text-[9px] text-muted-foreground font-bold uppercase tracking-wider",children:"Last Completed Dispatch"}),e.jsxs("div",{className:"flex justify-between items-center font-semibold",children:[e.jsx("span",{className:"text-foreground truncate max-w-[110px]",children:s.lastDriver}),e.jsx("span",{className:"text-muted-foreground font-mono text-[10px] truncate max-w-[120px]",title:s.lastRoute,children:s.lastRoute})]})]}),e.jsxs("div",{className:"mt-4 space-y-2",children:[e.jsxs("p",{className:"text-[9px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1",children:[e.jsx(Cs,{className:"w-3.5 h-3.5 text-primary"})," 5-Day Booking Horizon"]}),e.jsx("div",{className:"flex justify-between gap-1 p-2 bg-secondary/10 rounded-2xl border border-border/10",children:x.map((D,P)=>e.jsxs("div",{className:"flex-1 flex flex-col items-center p-1 rounded-xl transition-all duration-200 relative group/day",children:[e.jsx("span",{className:"text-[8px] font-bold text-muted-foreground uppercase",children:D.name[0]}),e.jsx("span",{className:"text-[10px] font-mono font-bold text-foreground mt-0.5",children:D.dayNum}),e.jsx("div",{className:`w-3 h-3 rounded-md mt-1.5 shadow-sm border ${D.isAvailable?"bg-emerald-500/25 border-emerald-500/30":"bg-indigo-500/25 border-indigo-500/30"}`}),e.jsxs("div",{className:"absolute bottom-full mb-1 opacity-0 pointer-events-none group-hover/day:opacity-100 transition-opacity bg-popover border border-border shadow-xl px-2.5 py-1.5 rounded-lg text-[10px] z-20 w-36 text-center font-medium animate-in fade-in duration-150",children:[e.jsx("p",{className:"font-bold text-[9px] border-b pb-0.5 mb-1 text-foreground",children:D.dateStr}),e.jsx("p",{className:D.isAvailable?"text-emerald-500":"text-indigo-400",children:D.isAvailable?"✅ Ready / Free":`🔒 Busy: ${D.tripInfo?.route}`})]})]},P))})]})]}),e.jsxs("div",{className:"mt-5 pt-3.5 border-t border-border/20 flex items-center justify-between",children:[e.jsxs("div",{className:"space-y-0.5",children:[e.jsx("span",{className:"text-[9px] text-muted-foreground font-bold uppercase tracking-wider block",children:"FASTag balance"}),e.jsxs("span",{className:`font-mono text-xs font-bold block ${s.current_fastag_balance<2e3?"text-rose-500 font-extrabold":"text-foreground"}`,children:["₹",(s.current_fastag_balance||0).toLocaleString()]})]}),e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx(v,{variant:"ghost",size:"sm",onClick:()=>c(`/fleet-maintenance?truckId=${s.id}`),className:"text-muted-foreground hover:text-foreground text-xs rounded-xl h-8 px-2",title:"Inspect Documents & Logs",children:e.jsx(is,{className:"w-3.5 h-3.5"})}),e.jsxs(v,{size:"sm",className:"rounded-xl text-[11px] gap-1 shadow-sm h-8 font-extrabold",onClick:()=>{re(s),S(!0)},children:[e.jsx(os,{className:"w-2.5 h-2.5 fill-current"})," Dispatch"]})]})]})]},s.id)})})}):e.jsx("div",{className:"overflow-x-auto",children:e.jsxs($e,{children:[e.jsx(Ee,{className:"bg-muted/10",children:e.jsxs(q,{children:[e.jsxs(j,{onClick:()=>ze("truck_number"),className:"cursor-pointer hover:bg-muted/50 transition-colors pl-6",children:["Vehicle No. ",e.jsx(l,{columnKey:"truck_number"})]}),e.jsxs(j,{onClick:()=>ze("daysIdle"),className:"cursor-pointer hover:bg-muted/50 transition-colors",children:["Idle Duration ",e.jsx(l,{columnKey:"daysIdle"})]}),e.jsx(j,{children:"Last Activity (Driver / Route)"}),e.jsx(j,{className:"text-center",children:"FASTag Status"}),e.jsx(j,{className:"text-right pr-6",children:"Action"})]})}),e.jsx(Pe,{children:E.map(s=>e.jsxs(q,{className:"hover:bg-muted/30 transition-all duration-200",children:[e.jsx(d,{className:"font-semibold text-sm pl-6",children:s.truck_number}),e.jsx(d,{children:s.daysIdle===999?e.jsx(X,{className:"bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold text-[10px] uppercase tracking-wide",children:"New / No Trips"}):s.daysIdle>=5?e.jsxs(X,{className:"bg-destructive/15 text-destructive border border-destructive/20 font-bold text-[10px] uppercase tracking-wide animate-pulse",children:[s.daysIdle," Days Idle"]}):s.daysIdle>=2?e.jsxs(X,{className:"bg-warning/15 text-warning border border-warning/20 font-bold text-[10px] uppercase tracking-wide",children:[s.daysIdle," Days Idle"]}):e.jsx(X,{className:"bg-success/15 text-success border border-success/20 font-bold text-[10px] uppercase tracking-wide",children:s.daysIdle===0?"Just Returned":"1 Day Idle"})}),e.jsxs(d,{className:"text-sm",children:[e.jsx("p",{className:"font-bold text-foreground",children:s.lastDriver}),e.jsx("p",{className:"text-xs text-muted-foreground font-mono mt-0.5",children:s.lastRoute})]}),e.jsx(d,{className:"text-center",children:e.jsx(X,{variant:"outline",className:`font-semibold text-[10px] uppercase tracking-wider ${h(s.fastag_status)}`,children:s.fastag_status||"Unknown"})}),e.jsx(d,{className:"text-right pr-6",children:e.jsxs("div",{className:"flex items-center justify-end gap-1.5",children:[e.jsxs(v,{variant:"ghost",size:"sm",onClick:()=>c(`/fleet-maintenance?truckId=${s.id}`),className:"text-muted-foreground hover:text-foreground text-xs rounded-xl",children:[e.jsx(is,{className:"w-3.5 h-3.5 mr-1"})," View"]}),e.jsxs(v,{size:"sm",className:"rounded-xl text-xs gap-1 shadow-sm font-extrabold",onClick:()=>{re(s),S(!0)},children:[e.jsx(os,{className:"w-3 h-3"})," Assign Trip"]})]})})]},s.id))})]})})]}),e.jsxs(ss,{value:"active",className:"m-0 outline-none",children:[e.jsx("div",{className:"p-4 border-b border-border/20 bg-muted/5 flex justify-end",children:e.jsxs("div",{className:"relative w-full sm:w-auto",children:[e.jsx(ns,{className:"absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"}),e.jsx(Oe,{placeholder:"Search active truck or driver...",className:"pl-8 h-9 bg-background/50 min-w-[250px] text-xs rounded-xl",value:o,onChange:s=>R(s.target.value)})]})}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs($e,{children:[e.jsx(Ee,{className:"bg-muted/10",children:e.jsxs(q,{children:[e.jsx(j,{className:"pl-6",children:"Vehicle No."}),e.jsx(j,{children:"Driver"}),e.jsx(j,{children:"Active Route"}),e.jsx(j,{className:"text-center",children:"Trip Status"}),e.jsx(j,{className:"text-right",children:"Today's Revenue"}),e.jsx(j,{className:"text-right pr-6",children:"Action"})]})}),e.jsx(Pe,{children:i?Array.from({length:3}).map((s,x)=>e.jsxs(q,{children:[e.jsx(d,{className:"pl-6",children:e.jsx(p,{className:"h-5 w-24"})}),e.jsx(d,{children:e.jsx(p,{className:"h-5 w-32"})}),e.jsx(d,{children:e.jsx(p,{className:"h-5 w-40"})}),e.jsx(d,{className:"text-center",children:e.jsx(p,{className:"h-6 w-16 mx-auto rounded-full"})}),e.jsx(d,{children:e.jsx(p,{className:"h-5 w-20 ml-auto"})}),e.jsx(d,{className:"text-right pr-6",children:e.jsx(p,{className:"h-8 w-24 ml-auto"})})]},x)):Le.length===0?e.jsx(q,{children:e.jsx(d,{colSpan:6,className:"h-40 text-center text-muted-foreground",children:e.jsxs("div",{className:"flex flex-col items-center justify-center",children:[e.jsx(Je,{className:"w-9 h-9 mb-2 opacity-25"}),e.jsx("p",{className:"font-semibold text-sm",children:"No active dispatches today."}),te.length>0&&e.jsx("p",{className:"text-xs mt-1 text-muted-foreground",children:"Try clearing your filters."})]})})}):Le.map(s=>{const y={Pending:"bg-amber-500/15 text-amber-400 border-amber-500/30",Dispatched:"bg-blue-500/15 text-blue-400 border-blue-500/30","In Transit":"bg-indigo-500/15 text-indigo-400 border-indigo-500/30","Arrived at Dock":"bg-pink-500/15 text-pink-400 border-pink-500/30",Delivered:"bg-emerald-500/15 text-emerald-400 border-emerald-500/30",Cancelled:"bg-red-500/15 text-red-400 border-red-500/30"}[s.trip_status]||"bg-secondary text-muted-foreground border-border/40";return e.jsxs(q,{className:"hover:bg-muted/30 transition-all duration-200",children:[e.jsx(d,{className:"font-semibold text-sm pl-6",children:s.truck_number}),e.jsx(d,{className:"text-sm font-medium",children:s.driver_name||"N/A"}),e.jsx(d,{className:"text-xs font-semibold text-foreground/80 max-w-[200px] truncate",children:s.route||"—"}),e.jsx(d,{className:"text-center",children:e.jsx(X,{variant:"outline",className:`font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full ${y}`,children:s.trip_status})}),e.jsxs(d,{className:"text-right font-bold text-sm tabular-nums text-foreground",children:["₹",(s.revenue||0).toLocaleString()]}),e.jsx(d,{className:"text-right pr-6",children:e.jsxs(v,{variant:"outline",size:"sm",className:"rounded-xl text-xs gap-1 border-border/50 hover:bg-secondary/40",onClick:()=>c("/trip-logs"),children:["View Logs ",e.jsx(fe,{className:"w-3.5 h-3.5"})]})})]},s.id)})})]})})]}),e.jsx(ss,{value:"alerts",className:"m-0 outline-none",children:e.jsxs("div",{className:"p-6 space-y-6",children:[!i&&K===0&&e.jsxs("div",{className:"py-12 text-center text-muted-foreground max-w-sm mx-auto",children:[e.jsx("div",{className:"w-12 h-12 rounded-full bg-success/15 border border-success/20 flex items-center justify-center mx-auto mb-4 text-success shadow-glow-success",children:e.jsx(ks,{className:"w-6 h-6"})}),e.jsx("p",{className:"font-bold text-foreground text-sm",children:"All Systems Compliant"}),e.jsx("p",{className:"text-xs text-muted-foreground mt-1",children:"There are no expiring documents or low balance FASTags currently flagged for your fleet."})]}),ee.length>0&&e.jsxs("div",{className:"space-y-3",children:[e.jsxs("h4",{className:"text-xs font-bold uppercase tracking-wider text-rose-500/80 flex items-center gap-1.5",children:[e.jsx(Ss,{className:"w-4 h-4"})," expiring or expired documents (",ee.length,")"]}),e.jsx("div",{className:"rounded-xl border border-border/30 overflow-hidden bg-card/20",children:e.jsxs($e,{children:[e.jsx(Ee,{className:"bg-muted/10",children:e.jsxs(q,{children:[e.jsx(j,{className:"pl-4",children:"Vehicle No."}),e.jsx(j,{children:"Document Type"}),e.jsx(j,{children:"Expiry Date"}),e.jsx(j,{className:"text-right pr-4",children:"Days Left"})]})}),e.jsx(Pe,{children:ee.map(s=>e.jsxs(q,{className:"hover:bg-muted/20",children:[e.jsx(d,{className:"font-semibold text-sm pl-4",children:s.truck_number}),e.jsx(d,{className:"text-sm font-medium text-foreground/80",children:s.document_type}),e.jsx(d,{className:"text-xs text-muted-foreground",children:se(new Date(s.expiry_date),"dd MMM yyyy")}),e.jsx(d,{className:"text-right pr-4",children:s.isExpired?e.jsxs(X,{variant:"destructive",className:"font-bold text-[9px] uppercase tracking-wider animate-pulse",children:["Expired ",Math.abs(s.daysLeft),"d ago"]}):e.jsxs(X,{variant:"outline",className:"bg-warning/10 text-warning border-warning/20 font-bold text-[9px] uppercase tracking-wider",children:[s.daysLeft," days left"]})})]},s.id))})]})})]}),M.length>0&&e.jsxs("div",{className:"space-y-3",children:[e.jsxs("h4",{className:"text-xs font-bold uppercase tracking-wider text-amber-500/80 flex items-center gap-1.5",children:[e.jsx(Ts,{className:"w-4 h-4"})," low fastag balance warning (",M.length,")"]}),e.jsx("div",{className:"rounded-xl border border-border/30 overflow-hidden bg-card/20",children:e.jsxs($e,{children:[e.jsx(Ee,{className:"bg-muted/10",children:e.jsxs(q,{children:[e.jsx(j,{className:"pl-4",children:"Vehicle No."}),e.jsx(j,{children:"FASTag Provider"}),e.jsx(j,{children:"FASTag ID"}),e.jsx(j,{className:"text-right pr-4",children:"Current Balance"})]})}),e.jsx(Pe,{children:M.map(s=>e.jsxs(q,{className:"hover:bg-muted/20",children:[e.jsx(d,{className:"font-semibold text-sm pl-4",children:s.truck_number}),e.jsx(d,{className:"text-xs font-semibold uppercase text-muted-foreground",children:s.fastag_provider||"Other"}),e.jsx(d,{className:"text-xs font-mono text-muted-foreground",children:s.fastag_id||"—"}),e.jsxs(d,{className:"text-right pr-4 font-bold text-sm tabular-nums text-rose-500",children:["₹",(s.current_fastag_balance||0).toLocaleString()]})]},s.id))})]})})]})]})})]})}),ae&&e.jsx(at,{isOpen:u,onClose:()=>{S(!1),re(null)},vehicleId:ae.id,vehicleName:ae.truck_number})]})}function rt({isOpen:c,onClose:i,summaryData:I}){const[w,m]=a.useState("+917794072244"),[t,L]=a.useState(!1),f=I||{month:"August 2026",completedTrips:28,grossRevenue:198800,fuelCost:68450,netProfit:130350,outstandingDue:198800},O=async()=>{L(!0);try{const C=`📊 *JAI BHAVANI CARGO - MONTHLY EXECUTIVE REPORT*
Period: ${f.month}

🚛 *Operations:*
• Completed Trips: ${f.completedTrips}
• Gross Revenue: ₹${Number(f.grossRevenue).toLocaleString("en-IN")}

⛽ *Fleet Costs:*
• Diesel Expense: ₹${Number(f.fuelCost).toLocaleString("en-IN")}
• Net Operating Margin: ₹${Number(f.netProfit).toLocaleString("en-IN")}

⚠️ *Receivables:*
• Pending Balance: ₹${Number(f.outstandingDue).toLocaleString("en-IN")}

_Jai Bhavani Cargo Enterprise System_`,Q=w.replace(/[^0-9]/g,""),Z=encodeURIComponent(C);window.open(`https://api.whatsapp.com/send?phone=${Q}&text=${Z}`,"_blank"),oe.success("Executive report dispatched to WhatsApp!"),i()}catch{oe.error("Failed to send report")}finally{L(!1)}};return e.jsx(bs,{open:c,onOpenChange:i,children:e.jsxs(fs,{className:"max-w-lg rounded-2xl p-6 bg-slate-900 text-white border border-slate-800 shadow-2xl",children:[e.jsxs(js,{children:[e.jsxs("div",{className:"flex items-center gap-2 text-emerald-400",children:[e.jsx(ts,{className:"w-5 h-5"}),e.jsx("span",{className:"text-xs uppercase font-semibold tracking-wider",children:"Executive WhatsApp Snapshot"})]}),e.jsxs(vs,{className:"text-xl font-bold font-heading text-slate-100",children:["Monthly P&L Snapshot: ",f.month]}),e.jsx(Ns,{className:"text-slate-400 text-sm",children:"Dispatches a private executive performance and collection report to Management on WhatsApp."})]}),e.jsx("div",{className:"bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3 my-2 text-xs",children:e.jsxs("div",{className:"grid grid-cols-2 gap-2",children:[e.jsxs("div",{className:"bg-slate-900/90 p-2.5 rounded-lg",children:[e.jsx("span",{className:"text-slate-500 block text-[10px] uppercase",children:"Completed Trips"}),e.jsxs("span",{className:"text-slate-200 font-bold text-base",children:[f.completedTrips," Trips"]})]}),e.jsxs("div",{className:"bg-slate-900/90 p-2.5 rounded-lg",children:[e.jsx("span",{className:"text-slate-500 block text-[10px] uppercase",children:"Gross Revenue"}),e.jsxs("span",{className:"text-emerald-400 font-bold text-base",children:["₹",Number(f.grossRevenue).toLocaleString("en-IN")]})]}),e.jsxs("div",{className:"bg-slate-900/90 p-2.5 rounded-lg",children:[e.jsx("span",{className:"text-slate-500 block text-[10px] uppercase",children:"Diesel Fuel Cost"}),e.jsxs("span",{className:"text-rose-400 font-bold text-base",children:["₹",Number(f.fuelCost).toLocaleString("en-IN")]})]}),e.jsxs("div",{className:"bg-slate-900/90 p-2.5 rounded-lg",children:[e.jsx("span",{className:"text-slate-500 block text-[10px] uppercase",children:"Net Profit Margin"}),e.jsxs("span",{className:"text-amber-400 font-bold text-base",children:["₹",Number(f.netProfit).toLocaleString("en-IN")]})]})]})}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx("span",{className:"text-xs font-semibold text-slate-300",children:"Recipient WhatsApp Number"}),e.jsx(Oe,{value:w,onChange:C=>m(C.target.value),placeholder:"+917794072244",className:"bg-slate-950 border-slate-700 text-white text-sm rounded-xl"})]}),e.jsxs(ws,{className:"gap-2 sm:gap-0 mt-3",children:[e.jsx(v,{variant:"ghost",onClick:i,className:"text-slate-400 hover:text-white",children:"Cancel"}),e.jsxs(v,{disabled:t,onClick:O,className:"bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl",children:[t?e.jsx(us,{className:"w-4 h-4 mr-1.5 animate-spin"}):e.jsx(Ls,{className:"w-4 h-4 mr-1.5"}),"Send Report to WhatsApp"]})]})]})})}function lt(c,i=900){const[I,w]=a.useState(0),m=a.useRef(null);return a.useEffect(()=>{const t=performance.now(),L=f=>{const O=f-t,C=Math.min(O/i,1),Q=1-Math.pow(1-C,3);w(Math.round(c*Q)),C<1&&(m.current=requestAnimationFrame(L))};return m.current=requestAnimationFrame(L),()=>cancelAnimationFrame(m.current)},[c,i]),I}const be=({title:c,rawValue:i,displayValue:I,icon:w,description:m,accentColor:t,onClick:L,loading:f})=>{const O=lt(typeof i=="number"?i:0);return e.jsx(k.div,{whileHover:{y:-3,scale:1.01},transition:{type:"spring",stiffness:300},children:e.jsxs(Y,{onClick:L,className:`relative overflow-hidden border border-white/5 bg-card/60 backdrop-blur-sm rounded-2xl shadow-lg transition-shadow duration-300 ${L?"cursor-pointer hover:shadow-xl hover:border-white/15":""}`,children:[e.jsx("div",{className:"absolute inset-x-0 top-0 h-[2px] rounded-t-2xl",style:{background:t||"hsl(var(--primary))"}}),e.jsxs(De,{className:"p-5",children:[e.jsxs("div",{className:"flex items-start justify-between mb-4",children:[e.jsx("p",{className:"text-[10px] font-extrabold tracking-widest uppercase text-muted-foreground",children:c}),e.jsx("div",{className:"p-2 rounded-xl bg-white/5 border border-white/5",children:e.jsx(w,{className:"h-4 w-4 text-primary"})})]}),f?e.jsx(p,{className:"h-9 w-28 rounded-lg"}):e.jsx("div",{className:"text-3xl font-extrabold tracking-tight text-foreground font-heading",children:I!==void 0?I:typeof i=="number"?O.toLocaleString():i}),m&&e.jsx("p",{className:"text-[11px] text-muted-foreground mt-2 leading-relaxed",children:m})]})]})})},nt=({trip:c})=>{const I={Dispatched:"bg-blue-500/15 text-blue-400 border-blue-500/30",Delivered:"bg-emerald-500/15 text-emerald-400 border-emerald-500/30",Upcoming:"bg-amber-500/15 text-amber-400 border-amber-500/30",Cancelled:"bg-red-500/15 text-red-400 border-red-500/30"}[c.trip_status]||"bg-secondary text-muted-foreground border-border/40";return e.jsxs("div",{className:"flex items-center justify-between px-4 py-3 rounded-xl border border-border/30 bg-secondary/10 hover:bg-secondary/25 transition-colors group",children:[e.jsxs("div",{className:"flex items-center gap-3 min-w-0",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 transition-colors",children:e.jsx(ve,{className:"w-3.5 h-3.5"})}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("p",{className:"font-semibold text-sm text-foreground truncate max-w-[170px]",children:c.route||"—"}),e.jsxs("p",{className:"text-[11px] text-muted-foreground mt-0.5 truncate",children:[c.truck_number," · ",c.driver_name]})]})]}),e.jsxs("div",{className:"flex items-center gap-3 shrink-0",children:[e.jsx("span",{className:`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${I} hidden sm:inline-flex`,children:c.trip_status}),e.jsxs("div",{className:"text-right",children:[e.jsxs("p",{className:"font-bold text-sm text-foreground",children:["₹",(c.revenue||0).toLocaleString()]}),e.jsx("p",{className:"text-[10px] text-muted-foreground",children:(()=>{if(!c.date)return"Today";try{const w=new Date(c.date);return isNaN(w.getTime())?"Today":se(w,"dd MMM")}catch{return"Today"}})()})]})]})]})};


const MonthlyTripIntelligenceTracker = () => {
  const [loading, setLoading] = a.useState(true);
  const [trips, setTrips] = a.useState([]);
  const [trucks, setTrucks] = a.useState([]);
  const [drivers, setDrivers] = a.useState([]);
  
  const now = new Date();
  const curYm = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  const [selectedMonth, setSelectedMonth] = a.useState(curYm);
  const [activeTab, setActiveTab] = a.useState("trucks");
  const [detailItem, setDetailItem] = a.useState(null), [selectedIdleLossTruck, setSelectedIdleLossTruck] = a.useState(null), [isIdleLossModalOpen, setIsIdleLossModalOpen] = a.useState(false);

  const loadData = async () => {
    try {
      const [trps, trks, emps] = await Promise.all([
        g.collection("trip_logs").getFullList({ sort: "-date", $autoCancel: false }).catch(() => []),
        g.collection("trucks").getFullList({ sort: "truck_number", $autoCancel: false }).catch(() => []),
        g.collection("employees").getFullList({ $autoCancel: false }).catch(() => [])
      ]);
      setTrips(Array.isArray(trps) ? trps : []);
      setTrucks(Array.isArray(trks) ? trks : []);
      const drvList = (emps || []).filter(e => {
        const t = (e.employee_type || e.role || e.designation || "").toLowerCase();
        return t.includes("driver") || (!t.includes("manager") && !t.includes("admin") && !t.includes("accountant"));
      });
      setDrivers(drvList);
    } catch (err) {
      console.error("Monthly tracker load error:", err);
    } finally {
      setLoading(false);
    }
  };

  a.useEffect(() => {
    loadData();
    try {
      const unsub = g.collection("trip_logs").subscribe("*", () => loadData()).catch(() => {});
      return () => { try { g.collection("trip_logs").unsubscribe("*").catch(() => {}); } catch(_) {} };
    } catch(_) {}
  }, []);

  const availableMonths = a.useMemo(() => {
    const s = new Set();
    const curr = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(curr.getFullYear(), curr.getMonth() - i, 1);
      s.add(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"));
    }
    trips.forEach(t => {
      const raw = t.date || t.start_date || t.created;
      if (raw) {
        const m = String(raw).match(/^(\d{4})-(\d{2})/);
        if (m) s.add(m[1] + "-" + m[2]);
      }
    });
    return Array.from(s).sort().reverse().map(ym => {
      const [y, m] = ym.split("-");
      const d = new Date(Number(y), Number(m) - 1, 1);
      const label = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      return { value: ym, label };
    });
  }, [trips]);

  const monthLabel = a.useMemo(() => {
    const f = availableMonths.find(m => m.value === selectedMonth);
    return f ? f.label : selectedMonth;
  }, [availableMonths, selectedMonth]);

  const normPlate = p => (p || "").replace(/[\s\-_]/g, "").toUpperCase();
  const normName = n => (n || "").trim().toLowerCase().replace(/\s+/g, " ");

  const monthTrips = a.useMemo(() => {
    return trips.filter(t => {
      const raw = t.date || t.start_date || t.created;
      if (!raw) return false;
      const m = String(raw).match(/^(\d{4})-(\d{2})/);
      return m ? (m[1] + "-" + m[2] === selectedMonth) : false;
    });
  }, [trips, selectedMonth]);

  const truckStats = a.useMemo(() => {
    return trucks.map(trk => {
      const cleanPlate = normPlate(trk.truck_number);
      const vTrips = monthTrips.filter(t => {
        if (t.truck_id && t.truck_id === trk.id) return true;
        const tp = normPlate(t.truck_number || t.vehicle_number);
        return tp && cleanPlate && (tp === cleanPlate || tp.includes(cleanPlate) || cleanPlate.includes(tp));
      });

      const count = vTrips.length;
      const km = vTrips.reduce((sum, t) => sum + (Number(t.actual_km) || Number(t.kms) || Number(t.trip_km) || 0), 0);
      const rev = vTrips.reduce((sum, t) => sum + (Number(t.revenue) || Number(t.freight_amount) || Number(t.amount) || 0), 0);
      
      const dCounts = {};
      vTrips.forEach(t => {
        const dn = t.driver_name || t.assigned_driver_name || "";
        if (dn) dCounts[dn] = (dCounts[dn] || 0) + 1;
      });
      const topDrv = Object.keys(dCounts).sort((x, y) => dCounts[y] - dCounts[x])[0];

      let util = "optimal";
      let utilLabel = "Optimal (8+ Trips)";
      if (count >= 8) { util = "optimal"; utilLabel = "Optimal Run"; }
      else if (count >= 4) { util = "moderate"; utilLabel = "Available for Loads"; }
      else { util = "low"; utilLabel = count === 0 ? "Idle · 0 Trips" : "Low Run · Needs Load"; }

      return {
        id: trk.id,
        plate: trk.truck_number || "Vehicle",
        model: trk.model || trk.make || "Commercial Truck",
        type: trk.truck_type || trk.body_type || "32 FT SXL",
        count,
        km,
        rev,
        driver: topDrv || trk.assigned_driver_name || trk.driver_name || "Unassigned",
        util,
        utilLabel,
        trips: vTrips
      };
    }).sort((a, b) => b.count - a.count);
  }, [trucks, monthTrips]);

  const driverStats = a.useMemo(() => {
    return drivers.map(drv => {
      const dName = drv.name || drv.driver_name || "Driver";
      const cleanDName = normName(dName);
      const code = drv.employee_code || drv.driver_code || drv.code || "";

      const dTrips = monthTrips.filter(t => {
        if (t.driver_employee_id && t.driver_employee_id === drv.id) return true;
        if (code && (t.driver_employee_code === code || t.driver_code === code)) return true;
        const td = normName(t.driver_name);
        return td && cleanDName && (td === cleanDName || td.includes(cleanDName) || cleanDName.includes(td));
      });

      const count = dTrips.length;
      const target = 10;
      const targetPct = Math.min(100, Math.round((count / target) * 100));
      const km = dTrips.reduce((sum, t) => sum + (Number(t.actual_km) || Number(t.kms) || Number(t.trip_km) || 0), 0);
      const rev = dTrips.reduce((sum, t) => sum + (Number(t.revenue) || Number(t.freight_amount) || Number(t.amount) || 0), 0);

      const pCounts = {};
      dTrips.forEach(t => {
        const p = t.truck_number || t.vehicle_number || "";
        if (p) pCounts[p] = (pCounts[p] || 0) + 1;
      });
      const topPlate = Object.keys(pCounts).sort((x, y) => pCounts[y] - pCounts[x])[0];

      return {
        id: drv.id,
        name: dName,
        code,
        count,
        target,
        targetPct,
        km,
        rev,
        truck: topPlate || drv.assigned_truck || "Fleet Pool",
        trips: dTrips
      };
    }).sort((a, b) => b.count - a.count);
  }, [drivers, monthTrips]);

  const totalFleetTrips = monthTrips.length;
  const avgTrips = truckStats.length > 0 ? (totalFleetTrips / truckStats.length).toFixed(1) : 0;
  const underutilizedCount = truckStats.filter(t => t.count < 4).length;
  const topTruck = truckStats[0] ? (truckStats[0].plate + " (" + truckStats[0].count + " trips)") : "None";

  return e.jsxs("div", {
    className: "rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-900 shadow-2xl backdrop-blur-xl p-5 md:p-6 mb-6 relative overflow-hidden",
    children: [
      e.jsx("div", { className: "absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" }),
      e.jsx("div", { className: "absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" }),

      e.jsxs("div", {
        className: "flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/60 relative z-10",
        children: [
          e.jsxs("div", {
            className: "flex items-center gap-3",
            children: [
              e.jsx("div", {
                className: "w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner",
                children: e.jsxs("svg", {
                  className: "w-6 h-6",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  children: [
                    e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" })
                  ]
                })
              }),
              e.jsxs("div", {
                children: [
                  e.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      e.jsx("h2", {
                        className: "text-lg md:text-xl font-black text-white tracking-tight font-heading",
                        children: "Monthly Trip Intelligence"
                      }),
                      e.jsx("span", {
                        className: "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold",
                        children: "LIVE FLEET"
                      })
                    ]
                  }),
                  e.jsx("p", {
                    className: "text-xs text-slate-400 font-medium",
                    children: "Zero-search trip frequency & dispatch utilization tracker"
                  })
                ]
              })
            ]
          }),

          e.jsxs("div", {
            className: "flex flex-wrap items-center gap-2.5",
            children: [
              e.jsxs("div", {
                className: "flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-sm",
                children: [
                  e.jsx("span", { className: "text-emerald-400 text-xs", children: "📅" }),
                  e.jsx("select", {
                    value: selectedMonth,
                    onChange: ev => setSelectedMonth(ev.target.value),
                    className: "bg-transparent text-xs font-bold text-slate-200 border-none focus:outline-none cursor-pointer pr-1",
                    children: availableMonths.map(m => e.jsxs("option", {
                      value: m.value,
                      className: "bg-slate-900 text-slate-200",
                      children: [m.label, m.value === curYm ? " (Current)" : ""]
                    }, m.value))
                  })
                ]
              }),

              e.jsxs("div", {
                className: "flex p-1 bg-slate-900/90 border border-slate-800 rounded-xl",
                children: [
                  e.jsxs("button", {
                    type: "button",
                    onClick: () => setActiveTab("trucks"),
                    className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all " + (activeTab === "trucks" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm" : "text-slate-400 hover:text-slate-200"),
                    children: ["🚚 Trucks (", truckStats.length, ")"]
                  }),
                  e.jsxs("button", {
                    type: "button",
                    onClick: () => setActiveTab("drivers"),
                    className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all " + (activeTab === "drivers" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm" : "text-slate-400 hover:text-slate-200"),
                    children: ["👤 Drivers (", driverStats.length, ")"]
                  })
                ]
              })
            ]
          })
        ]
      }),

      e.jsxs("div", {
        className: "grid grid-cols-2 md:grid-cols-4 gap-3 my-4 relative z-10",
        children: [
          e.jsxs("div", {
            className: "bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between",
            children: [
              e.jsx("span", { className: "text-[11px] font-semibold text-slate-400", children: "🚚 Total Fleet Trips" }),
              e.jsxs("div", {
                className: "flex items-baseline gap-2 mt-1",
                children: [
                  e.jsx("span", { className: "text-2xl font-black font-mono text-white", children: totalFleetTrips }),
                  e.jsxs("span", { className: "text-[10px] text-slate-400 font-medium", children: ["in ", monthLabel] })
                ]
              })
            ]
          }),

          e.jsxs("div", {
            className: "bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between",
            children: [
              e.jsx("span", { className: "text-[11px] font-semibold text-slate-400", children: "📈 Avg Trips / Truck" }),
              e.jsxs("div", {
                className: "flex items-baseline gap-2 mt-1",
                children: [
                  e.jsx("span", { className: "text-2xl font-black font-mono text-cyan-300", children: avgTrips }),
                  e.jsx("span", { className: "text-[10px] text-slate-400 font-medium", children: "trips / active unit" })
                ]
              })
            ]
          }),

          e.jsxs("div", {
            className: "bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between",
            children: [
              e.jsx("span", { className: "text-[11px] font-semibold text-slate-400", children: "⭐ Top Active Truck" }),
              e.jsx("div", {
                className: "mt-1 truncate",
                children: e.jsx("span", { className: "text-sm font-bold font-mono text-amber-300 truncate block", children: topTruck })
              })
            ]
          }),

          e.jsxs("div", {
            className: "rounded-2xl p-3 flex flex-col justify-between border " + (underutilizedCount > 0 ? "bg-rose-950/20 border-rose-500/30" : "bg-slate-900/60 border-slate-800/80"),
            children: [
              e.jsxs("span", {
                className: "text-[11px] font-semibold text-slate-400 flex items-center gap-1",
                children: [
                  e.jsx("span", { className: underutilizedCount > 0 ? "text-rose-400 animate-pulse" : "", children: "⚠️" }),
                  " Needs Loads Alert"
                ]
              }),
              e.jsxs("div", {
                className: "flex items-baseline gap-2 mt-1",
                children: [
                  e.jsx("span", { className: "text-2xl font-black font-mono " + (underutilizedCount > 0 ? "text-rose-400" : "text-slate-300"), children: underutilizedCount }),
                  e.jsx("span", { className: "text-[10px] text-slate-400 font-medium", children: underutilizedCount === 1 ? "truck < 4 trips" : "trucks < 4 trips" })
                ]
              }),
              e.jsxs("button", {
                type: "button",
                onClick: () => {
                  setSelectedIdleLossTruck(null);
                  setIsIdleLossModalOpen(true);
                },
                className: "mt-2 text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer hover:underline",
                children: ["📉 ", "Idle Loss Calculator →"]
              })
            ]
          })
        ]
      }),

      activeTab === "trucks" && e.jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10",
        children: truckStats.map(trk => {
          const isHigh = trk.count >= 8;
          const isMod = trk.count >= 4 && trk.count < 8;
          const borderCls = isHigh ? "border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/60" : isMod ? "border-amber-500/30 bg-amber-950/10 hover:border-amber-500/50" : "border-rose-500/30 bg-rose-950/15 hover:border-rose-500/60";
          const badgeCls = isHigh ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300" : isMod ? "border-amber-500/40 bg-amber-500/15 text-amber-300" : "border-rose-500/40 bg-rose-500/15 text-rose-300";

          return e.jsxs("div", {
            className: "group rounded-2xl border transition-all duration-200 p-4 flex flex-col justify-between " + borderCls,
            children: [
              e.jsxs("div", {
                children: [
                  e.jsxs("div", {
                    className: "flex items-start justify-between gap-2",
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsxs("div", {
                            className: "flex items-center gap-2",
                            children: [
                              e.jsx("span", { className: "text-base font-black font-mono text-white tracking-wide", children: trk.plate }),
                              e.jsx("span", { className: "border text-[10px] font-mono px-1.5 py-0 rounded " + badgeCls, children: trk.utilLabel })
                            ]
                          }),
                          e.jsxs("p", { className: "text-[11px] text-slate-400 truncate mt-0.5", children: [trk.model, " · ", trk.type] })
                        ]
                      }),
                      e.jsx("div", {
                        className: "w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300",
                        children: "🚚"
                      })
                    ]
                  }),

                  e.jsxs("div", {
                    className: "my-3 py-2.5 px-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between",
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsx("span", { className: "text-[10px] uppercase tracking-wider text-slate-400 font-bold block", children: "Monthly Trips" }),
                          e.jsxs("div", {
                            className: "flex items-baseline gap-1.5",
                            children: [
                              e.jsx("span", { className: "text-3xl font-black font-mono text-white", children: trk.count }),
                              e.jsxs("span", { className: "text-xs font-semibold text-slate-400", children: ["Trips (", monthLabel, ")"] })
                            ]
                          })
                        ]
                      }),
                      e.jsxs("div", {
                        className: "text-right",
                        children: [
                          e.jsx("span", { className: "text-[10px] text-slate-400 font-semibold block", children: "Driver Assigned" }),
                          e.jsx("span", { className: "text-xs font-bold text-slate-200 truncate max-w-[130px] block", children: trk.driver })
                        ]
                      })
                    ]
                  }),

                  e.jsxs("div", {
                    className: "grid grid-cols-2 gap-2 text-xs font-mono my-2",
                    children: [
                      e.jsxs("div", {
                        className: "p-2 rounded-lg bg-slate-900/50 border border-slate-800/60",
                        children: [
                          e.jsx("span", { className: "text-[10px] text-slate-400 block font-sans", children: "Distance" }),
                          e.jsxs("span", { className: "font-bold text-slate-200", children: [trk.km.toLocaleString("en-IN"), " KM"] })
                        ]
                      }),
                      e.jsxs("div", {
                        className: "p-2 rounded-lg bg-slate-900/50 border border-slate-800/60",
                        children: [
                          e.jsx("span", { className: "text-[10px] text-slate-400 block font-sans", children: "Freight Revenue" }),
                          e.jsxs("span", { className: "font-bold text-emerald-400", children: ["₹", trk.rev.toLocaleString("en-IN")] })
                        ]
                      })
                    ]
                  }),

                  e.jsxs("button", {
                    type: "button",
                    onClick: (ev) => {
                      ev.stopPropagation();
                      setSelectedIdleLossTruck({ plate: trk.plate, truck_number: trk.plate, model: trk.model });
                      setIsIdleLossModalOpen(true);
                    },
                    className: "w-full my-2 py-1.5 px-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 flex items-center justify-between text-xs transition cursor-pointer group/loss",
                    title: "Calculate idle day standing loss and EMI bleed for this truck",
                    children: [
                      e.jsxs("span", { className: "flex items-center gap-1.5 text-rose-300 font-semibold text-[11px]", children: ["📉 ", "Idle Loss Analysis"] }),
                      e.jsx("span", { className: "text-[10px] font-mono font-bold text-rose-400 group-hover/loss:underline", children: "Calculate Bleed →" })
                    ]
                  })
                ]
              }),

              e.jsxs("div", {
                className: "flex items-center gap-2 pt-2 mt-1 border-t border-slate-800/60",
                children: [
                  e.jsxs("button", {
                    type: "button",
                    onClick: () => setDetailItem({ type: "truck", item: trk }),
                    className: "flex-1 h-8 text-xs font-bold border border-slate-700 hover:bg-slate-800 text-slate-200 flex items-center justify-center gap-1.5 rounded-lg transition-colors",
                    children: ["👁️ View ", trk.count, " Trips"]
                  }),
                  e.jsx(Es, {
                    to: "/truck-manager",
                    className: "h-8 px-2.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-800 transition-colors",
                    title: "Manage in Truck Manager",
                    children: "↗"
                  })
                ]
              })
            ]
          }, trk.id);
        })
      }),

      activeTab === "drivers" && e.jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10",
        children: driverStats.map((drv, idx) => {
          const isTop = idx === 0 && drv.count > 0;

          return e.jsxs("div", {
            className: "group rounded-2xl border transition-all duration-200 p-4 flex flex-col justify-between " + (isTop ? "border-amber-500/40 bg-amber-950/15 hover:border-amber-500/60" : "border-slate-800/80 bg-slate-900/60 hover:border-slate-700"),
            children: [
              e.jsxs("div", {
                children: [
                  e.jsxs("div", {
                    className: "flex items-start justify-between gap-2",
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsxs("div", {
                            className: "flex items-center gap-2",
                            children: [
                              e.jsx("span", { className: "text-base font-black text-white", children: drv.name }),
                              drv.code ? e.jsx("span", { className: "border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 text-[10px] font-mono px-1.5 py-0 rounded", children: drv.code }) : null,
                              isTop ? e.jsx("span", { className: "bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0 rounded", children: "⭐ Top Pilot" }) : null
                            ]
                          }),
                          e.jsxs("p", {
                            className: "text-[11px] text-slate-400 mt-0.5",
                            children: ["Assigned: ", e.jsx("strong", { className: "font-mono text-slate-300", children: drv.truck })]
                          })
                        ]
                      }),
                      e.jsx("div", {
                        className: "w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300",
                        children: "👤"
                      })
                    ]
                  }),

                  e.jsxs("div", {
                    className: "my-3 py-2.5 px-3 rounded-xl bg-slate-900/80 border border-slate-800/80",
                    children: [
                      e.jsxs("div", {
                        className: "flex items-center justify-between mb-1.5",
                        children: [
                          e.jsx("span", { className: "text-[10px] uppercase tracking-wider text-slate-400 font-bold", children: "Trips Completed" }),
                          e.jsxs("span", { className: "text-xs font-mono font-bold text-emerald-400", children: [drv.count, " / ", drv.target, " Target"] })
                        ]
                      }),
                      e.jsxs("div", {
                        className: "flex items-baseline gap-2 mb-2",
                        children: [
                          e.jsx("span", { className: "text-3xl font-black font-mono text-white", children: drv.count }),
                          e.jsxs("span", { className: "text-xs text-slate-400 font-semibold", children: ["Completed (", monthLabel, ")"] })
                        ]
                      }),
                      e.jsx("div", {
                        className: "w-full bg-slate-800 rounded-full h-2 overflow-hidden",
                        children: e.jsx("div", {
                          className: "bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500",
                          style: { width: drv.targetPct + "%" }
                        })
                      })
                    ]
                  }),

                  e.jsxs("div", {
                    className: "grid grid-cols-2 gap-2 text-xs font-mono my-2",
                    children: [
                      e.jsxs("div", {
                        className: "p-2 rounded-lg bg-slate-900/50 border border-slate-800/60",
                        children: [
                          e.jsx("span", { className: "text-[10px] text-slate-400 block font-sans", children: "Distance" }),
                          e.jsxs("span", { className: "font-bold text-slate-200", children: [drv.km.toLocaleString("en-IN"), " KM"] })
                        ]
                      }),
                      e.jsxs("div", {
                        className: "p-2 rounded-lg bg-slate-900/50 border border-slate-800/60",
                        children: [
                          e.jsx("span", { className: "text-[10px] text-slate-400 block font-sans", children: "Freight Handled" }),
                          e.jsxs("span", { className: "font-bold text-emerald-400", children: ["₹", drv.rev.toLocaleString("en-IN")] })
                        ]
                      })
                    ]
                  })
                ]
              }),

              e.jsxs("div", {
                className: "flex items-center gap-2 pt-2 mt-1 border-t border-slate-800/60",
                children: [
                  e.jsxs("button", {
                    type: "button",
                    onClick: () => setDetailItem({ type: "driver", item: drv }),
                    className: "flex-1 h-8 text-xs font-bold border border-slate-700 hover:bg-slate-800 text-slate-200 flex items-center justify-center gap-1.5 rounded-lg transition-colors",
                    children: ["👁️ View ", drv.count, " Trips"]
                  }),
                  e.jsxs(Es, {
                    to: "/driver-scorecard",
                    className: "h-8 px-2.5 text-xs text-indigo-400 hover:text-white hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1 border border-slate-800 transition-colors font-bold",
                    children: ["🛡️", e.jsx("span", { children: "Scorecard" })]
                  })
                ]
              })
            ]
          }, drv.id);
        })
      }),

      e.jsx(_IdleDayLossCalculatorModal, {
        isOpen: isIdleLossModalOpen,
        onClose: () => setIsIdleLossModalOpen(false),
        truck: selectedIdleLossTruck,
        allTrucks: truckStats || [],
        ReactModule: a
      }),
      detailItem && e.jsx("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4",
        children: e.jsxs("div", {
          className: "w-full max-w-2xl bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200",
          children: [
            e.jsxs("div", {
              className: "p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 flex items-center justify-between",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsxs("div", {
                      className: "flex items-center gap-2",
                      children: [
                        e.jsx("span", { className: "text-lg font-black text-white font-mono", children: detailItem.type === "truck" ? detailItem.item.plate : detailItem.item.name }),
                        e.jsx("span", { className: "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-mono text-xs px-2 py-0.5 rounded-full", children: monthLabel })
                      ]
                    }),
                    e.jsxs("p", { className: "text-xs text-slate-400 mt-0.5", children: ["Showing ", detailItem.item.trips.length, " trips logged in ", monthLabel] })
                  ]
                }),
                e.jsxs("div", {
                  className: "text-right font-mono",
                  children: [
                    e.jsx("span", { className: "text-xs text-slate-400 block", children: "Total Freight" }),
                    e.jsxs("span", { className: "text-sm font-bold text-emerald-400", children: ["₹", detailItem.item.rev.toLocaleString("en-IN")] })
                  ]
                })
              ]
            }),

            e.jsx("div", {
              className: "p-5 max-h-[60vh] overflow-y-auto space-y-2.5",
              children: detailItem.item.trips.length === 0 ? e.jsxs("div", {
                className: "text-center py-12 text-slate-500",
                children: [
                  e.jsx("div", { className: "text-2xl mb-1", children: "⏳" }),
                  e.jsxs("p", { className: "text-sm", children: ["No trips recorded in ", monthLabel] })
                ]
              }) : detailItem.item.trips.map((t, idx) => {
                const tripDate = (t.date || t.start_date || t.created || "").split("T")[0];
                const routeStr = t.route || ((t.origin || "Origin") + " ➔ " + (t.destination || "Destination"));
                const clientName = t.client_name || t.client || "Direct Client";
                const freight = Number(t.revenue || t.freight_amount || t.amount || 0);
                const km = Number(t.actual_km || t.kms || t.trip_km || 0);

                return e.jsxs("div", {
                  className: "p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsxs("div", {
                          className: "flex items-center gap-2",
                          children: [
                            e.jsx("span", { className: "text-xs font-mono font-bold text-slate-400", children: tripDate }),
                            e.jsx("span", { className: "text-sm font-bold text-white", children: routeStr })
                          ]
                        }),
                        e.jsxs("div", {
                          className: "flex items-center gap-3 text-xs text-slate-400 mt-1",
                          children: [
                            e.jsxs("span", { children: ["🏢 ", clientName] }),
                            detailItem.type === "truck" && t.driver_name ? e.jsxs("span", { children: ["👤 ", t.driver_name] }) : null,
                            detailItem.type === "driver" && t.truck_number ? e.jsxs("span", { className: "font-mono", children: ["🚚 ", t.truck_number] }) : null
                          ]
                        })
                      ]
                    }),

                    e.jsxs("div", {
                      className: "flex items-center justify-between sm:justify-end gap-3 font-mono text-xs pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800",
                      children: [
                        km > 0 ? e.jsxs("span", { className: "text-slate-400", children: [km, " KM"] }) : null,
                        e.jsxs("span", { className: "font-bold text-emerald-400", children: ["₹", freight.toLocaleString("en-IN")] }),
                        e.jsx("span", { className: "border border-slate-700 bg-slate-800/50 text-slate-300 text-[10px] px-1.5 py-0.5 rounded", children: t.trip_status || t.status || "Delivered" })
                      ]
                    })
                  ]
                }, t.id || idx);
              })
            }),

            e.jsxs("div", {
              className: "p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between",
              children: [
                e.jsxs("span", {
                  className: "text-xs text-slate-400",
                  children: ["Total distance: ", e.jsxs("strong", { className: "text-white font-mono", children: [detailItem.item.km.toLocaleString("en-IN"), " KM"] })]
                }),
                e.jsx("button", {
                  type: "button",
                  onClick: () => setDetailItem(null),
                  className: "h-8 px-4 text-xs font-bold border border-slate-700 hover:bg-slate-800 text-slate-200 rounded-lg transition-colors",
                  children: "Close"
                })
              ]
            })
          ]
        })
      })
    ]
  });
};

const ut=()=>{const{currentUser:c}=gs(),{isSuperAdmin:i,isAdmin:I}=Gs(),{t:w}=Js(),m=hs();
  const[jbcSimRole,setJbcSimRole]=a.useState(()=>{try{return localStorage.getItem("jbc_simulated_role")||(i?"super_admin":I?"admin":"operations");}catch{return"super_admin";}});
  const jbcCurrentRole=c?.role||(i?"super_admin":I?"admin":"operations");
  const jbcHandleChangeRole=(newRole)=>{
    if(newRole===jbcCurrentRole){localStorage.removeItem("jbc_simulated_role");setJbcSimRole(jbcCurrentRole);}
    else{localStorage.setItem("jbc_simulated_role",newRole);setJbcSimRole(newRole);}
    window.dispatchEvent(new Event("jbc-role-change"));
  };
  const jbcResetRole=()=>{localStorage.removeItem("jbc_simulated_role");setJbcSimRole(jbcCurrentRole);window.dispatchEvent(new Event("jbc-role-change"));};
  a.useEffect(()=>{(c?.role==="Client"||c?.role==="client")&&m("/client-portal",{replace:!0})},[c,m]);const[t,L]=a.useState({todayBusiness:0,todayExpenses:0,todayProfit:0,todayMargin:"0",todayTripsCount:0,todayExpensesCount:0,todayDeliveredCount:0,todayInTransitCount:0,users:0,trips:0,trucks:0,pods:0,revenue:0,grossRevenue:0,expenses:0,fleetProfit:0,brokerageProfit:0,retainedEarnings:0}),[f,O]=a.useState([]),[C,Q]=a.useState(0),[Z,Ie]=a.useState([]),[te,Ae]=a.useState([]),[M,de]=a.useState(!0),[ee,ce]=a.useState(!0),[u,S]=a.useState(!1),[ae,re]=a.useState(null),[B,r]=a.useState(new Date),[o,R]=a.useState(!1),[le,G]=a.useState(!1),[xe,me]=a.useState(!1),[ne,ie]=a.useState(!1),[ue,Ve]=a.useState(!1),[$,Ue]=a.useState(!1),[Ke,Ye]=a.useState(()=>{try{return sessionStorage.getItem("dismiss_compliance_alert")==="true"}catch{return!1}}),V=async(l=!1)=>{l?S(!0):de(!0),re(null);try{const h='trip_status = "Delivered"',[H,J,Re,Ce,K,s,x,y,A,F,T,D,allTripsList]=await Promise.all([g.collection("users").getList(1,1,{$autoCancel:!1}).catch(()=>({totalItems:0,items:[]})),g.collection("trip_logs").getList(1,500,{filter:h,sort:"-date",fields:"id,revenue,ownership_type,brokerage_margin,tds_deducted_receivable",$autoCancel:!1}).catch(()=>({totalItems:0,items:[]})),g.collection("trip_logs").getList(1,1,{$autoCancel:!1}).catch(()=>({totalItems:0,items:[]})),g.collection("trucks").getFullList({fields:"id,truck_number,current_fastag_balance",$autoCancel:!1}).catch(()=>[]),g.collection("delivery_proofs").getList(1,1,{filter:'status = "Active"',$autoCancel:!1}).catch(()=>({totalItems:0,items:[]})),g.collection("expenses").getList(1,1000,{fields:"id,amount,category,subcategory",$autoCancel:!1}).catch(()=>({totalItems:0,items:[]})),g.collection("trip_logs").getList(1,8,{sort:"-date",fields:"id,route,truck_number,driver_name,revenue,date,trip_status",$autoCancel:!1}).catch(()=>({totalItems:0,items:[]})),g.collection("truck_documents").getFullList({filter:'status = "Active"',fields:"id,expiry_date,truck_id",$autoCancel:!1}).catch(()=>[]),g.collection("trip_logs").getList(1,1,{filter:'trip_status = "Upcoming"',$autoCancel:!1}).catch(()=>({totalItems:0,items:[]})),g.collection("trip_logs").getList(1,1,{filter:'trip_status = "Dispatched"',$autoCancel:!1}).catch(()=>({totalItems:0,items:[]})),g.collection("trip_logs").getList(1,1,{filter:'trip_status = "In Transit"',$autoCancel:!1}).catch(()=>({totalItems:0,items:[]})),g.collection("maintenance_problems").getList(1,5,{filter:'status = "Open"',sort:"-date_reported",$autoCancel:!1}).catch(()=>({totalItems:0,items:[]})),g.collection("trip_logs").getFullList({sort:"-date",$autoCancel:!1}).catch(()=>[])]);let P=0,U=0,qe=0;const Be=J?.items||[],He=s?.items||[],Fe=Array.isArray(Ce)?Ce:Ce?.items||[],n=Array.isArray(y)?y:y?.items||[];Be.forEach(N=>{qe+=Number(N.tds_deducted_receivable)||0,N.ownership_type==="Attached"?U+=Number(N.brokerage_margin)||0:P+=Number(N.revenue)||0});const z=P-qe,b=He.filter(N=>!((N.category||"").toLowerCase().includes("advance")||(N.subcategory||"").toLowerCase().includes("advance"))).reduce((N,pe)=>N+(pe.amount||0),0),W=z-b,he=Fe.filter(N=>N&&N.current_fastag_balance!==void 0&&N.current_fastag_balance!==null&&N.current_fastag_balance<2e3).length;let ke=0;const Me=new Date;n.forEach(N=>{if(!N||!N.expiry_date)return;const pe=new Date(N.expiry_date);as(pe,Me)<=30&&ke++});const ls=[...Fe].filter(N=>N&&N.current_fastag_balance!==void 0&&N.current_fastag_balance!==null).sort((N,pe)=>(N.current_fastag_balance||0)-(pe.current_fastag_balance||0)).slice(0,5);
const _now = new Date();
const _istDateStr = new Date(_now.getTime() + (330 + _now.getTimezoneOffset()) * 60000).toISOString().slice(0, 10);
const _safeAllTrips = Array.isArray(allTripsList) ? allTripsList : [];
const _todayTrips = _safeAllTrips.filter(N => {
  if (!N) return false;
  const td = (N.date || '').slice(0, 10);
  const cd = (N.created || '').slice(0, 10);
  return td === _istDateStr || cd === _istDateStr;
});
const _todayBusiness = _todayTrips.reduce((sum, N) => sum + (Number(N.revenue) || Number(N.freight_amount) || Number(N.rate) || 0), 0);
const _todayDeliveredCount = _todayTrips.filter(N => N.trip_status === 'Delivered').length;
const _todayInTransitCount = _todayTrips.filter(N => N.trip_status === 'In Transit' || N.trip_status === 'Dispatched').length;

const _safeExpenses = Array.isArray(s?.items) ? s.items : [];
const _todayExpensesList = _safeExpenses.filter(N => {
  if (!N) return false;
  const cat = (N.category || '').toLowerCase();
  const sub = (N.subcategory || '').toLowerCase();
  if (cat.includes('advance') || sub.includes('advance')) return false;
  const bd = (N.bill_date || N.date || N.created || '').slice(0, 10);
  return bd === _istDateStr;
});
const _todayExpenses = _todayExpensesList.reduce((sum, N) => sum + (Number(N.amount) || 0), 0);
const _todayProfit = _todayBusiness - _todayExpenses;
const _todayMargin = _todayBusiness > 0 ? ((_todayProfit / _todayBusiness) * 100).toFixed(1) : '0';

L({
  todayBusiness: _todayBusiness,
  todayExpenses: _todayExpenses,
  todayProfit: _todayProfit,
  todayMargin: _todayMargin,
  todayTripsCount: _todayTrips.length,
  todayExpensesCount: _todayExpensesList.length,
  todayDeliveredCount: _todayDeliveredCount,
  todayInTransitCount: _todayInTransitCount,
  users:H?.totalItems||0,
  trips:Re?.totalItems||0,
  deliveredTrips:J?.totalItems||0,
  upcomingTrips:A?.totalItems||0,
  dispatchedTrips:F?.totalItems||0,
  inTransitTrips:T?.totalItems||0,
  trucks:Fe.length,
  pods:K?.totalItems||0,
  revenue:z+U,
  grossRevenue:Be.reduce((N,pe)=>N+(Number(pe.revenue)||0),0),
  expenses:b,
  fleetProfit:W,
  brokerageProfit:U,
  retainedEarnings:W+U,
  lowFastagCount:he,
  expiringDocsCount:ke,
  totalAlertsCount:he+ke
}),O(x?.items||[]),Ie(D?.items||[]),Ae(ls),r(new Date)}catch(h){console.error("[Dashboard] fetch error:",h),re("Failed to load dashboard statistics. Please check your connection."),oe.error("Dashboard load failed")}finally{de(!1),S(!1)}},Qe=async()=>{if(!(!I&&!i)){ce(!0);try{const l=await g.collection("signup_requests").getList(1,1,{filter:'status = "Pending"',$autoCancel:!1});Q(l.totalItems)}catch(l){console.error("[Dashboard] signup_requests error:",l)}finally{ce(!1)}}};if(a.useEffect(()=>{V(),Qe()},[]),M)return e.jsx(Ks,{text:"Compiling fleet data…"});if(ae)return e.jsxs("div",{className:"flex flex-col items-center justify-center min-h-[60vh] text-center px-6",children:[e.jsx("div",{className:"w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5",children:e.jsx(ds,{className:"w-8 h-8 text-destructive"})}),e.jsx("h2",{className:"text-2xl font-bold mb-2",children:"Dashboard Error"}),e.jsx("p",{className:"text-muted-foreground mb-6 max-w-sm text-sm",children:ae}),e.jsxs(v,{onClick:()=>V(),className:"rounded-xl gap-2",children:[e.jsx(cs,{className:"w-4 h-4"})," Retry"]})]});const rs={hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.07}}},E={hidden:{opacity:0,y:16},visible:{opacity:1,y:0,transition:{duration:.4,ease:"easeOut"}}},Le=new Date().getHours(),ze=Le<12?"Good morning":Le<17?"Good afternoon":"Good evening";return e.jsxs(k.div,{className:"px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-10 pt-5 space-y-5",initial:"hidden",animate:"visible",variants:rs,children:[
  e.jsxs(k.div,{variants:E,className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 mb-1",children:[e.jsx(ps,{className:"w-4 h-4 text-primary"}),e.jsx("span",{className:"text-[10px] font-extrabold tracking-widest uppercase text-primary",children:ze})]}),e.jsx("h1",{className:"text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-foreground",children:c?.full_name||c?.name||"Fleet Manager"}),e.jsx("p",{className:"text-sm text-muted-foreground mt-0.5",children:"Here's what's happening across your fleet."})]}),e.jsxs("div",{className:"flex items-center gap-2.5 shrink-0",children:[e.jsxs("div",{className:"inline-flex items-center gap-1.5 rounded-xl border border-border/50 bg-secondary/30 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm",children:[e.jsx(We,{className:"w-3.5 h-3.5 text-primary"}),e.jsx("span",{className:"capitalize",children:c?.role?.replace("_"," ")})]}),e.jsxs(v,{variant:"outline",size:"sm",className:"rounded-xl gap-2 text-xs border-border/50 hover:border-primary/40",onClick:()=>V(!0),disabled:u,children:[e.jsx(cs,{className:`w-3.5 h-3.5 ${u?"animate-spin":""}`}),u?"Syncing…":`${se(B,"HH:mm")}`]}),e.jsxs(v,{size:"sm",className:"rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold gap-1.5 shadow-sm",onClick:()=>Ve(!0),children:[e.jsx(Rs,{className:"w-3.5 h-3.5"})," WhatsApp P&L Snapshot"]})]})]}),(I||i)&&!Ke&&t.totalAlertsCount>0&&e.jsx(k.div,{variants:E,children:e.jsxs("div",{className:"flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/15 transition-colors shadow-sm gap-3",children:[e.jsxs("div",{onClick:()=>{const l=document.getElementById("fleet-status-hub");if(l){l.scrollIntoView({behavior:"smooth"});const h=document.querySelector('[value="alerts"]');h&&h.click()}},className:"flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer",children:[e.jsx("div",{className:"p-2.5 bg-rose-500/20 rounded-xl text-rose-500 shrink-0",children:e.jsx(Ge,{className:"w-5 h-5 animate-pulse"})}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("p",{className:"font-bold text-rose-500 dark:text-rose-400 text-sm flex items-center gap-2",children:"Critical Fleet Compliance Warnings"}),e.jsxs("p",{className:"text-xs text-rose-500/80 dark:text-rose-400/80 mt-0.5",children:["You have ",e.jsx("strong",{children:t.totalAlertsCount})," unresolved alerts:",t.expiringDocsCount>0?` ${t.expiringDocsCount} document expiries`:"",t.lowFastagCount>0?`${t.expiringDocsCount>0?" and":""} ${t.lowFastagCount} low FASTag balances`:"",". Action required to keep operations running smoothly."]})]})]}),e.jsxs("div",{className:"flex items-center gap-2 shrink-0 self-end sm:self-center",children:[e.jsxs(v,{size:"sm",variant:"outline",onClick:()=>{const l=document.getElementById("fleet-status-hub");if(l){l.scrollIntoView({behavior:"smooth"});const h=document.querySelector('[value="alerts"]');h&&h.click()}},className:"rounded-xl gap-1 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-300 text-xs h-8",children:["Resolve Alerts ",e.jsx(fe,{className:"w-3.5 h-3.5"})]}),e.jsxs(v,{size:"sm",variant:"ghost",onClick:l=>{l.stopPropagation(),Ye(!0);try{sessionStorage.setItem("dismiss_compliance_alert","true")}catch{}oe.info("Fleet compliance warning dismissed.")},className:"rounded-xl gap-1 text-xs text-rose-500/80 hover:text-rose-500 hover:bg-rose-500/20 h-8 px-2.5 font-medium",title:"Dismiss warning banner",children:[e.jsx(Fs,{className:"w-3.5 h-3.5 mr-1"})," Dismiss"]})]})]})}),(I||i)&&e.jsx(k.div,{variants:E,children:ee?e.jsx(p,{className:"h-[68px] w-full rounded-2xl"}):C>0?e.jsxs(k.div,{whileHover:{scale:1.005},onClick:()=>m("/dashboard/users?tab=signup-requests"),className:"cursor-pointer flex items-center justify-between p-4 rounded-2xl border border-destructive/25 bg-destructive/5 hover:bg-destructive/10 transition-colors shadow-sm",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"p-2.5 bg-destructive/15 rounded-xl text-destructive",children:e.jsx(xs,{className:"w-5 h-5"})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-bold text-destructive text-sm",children:"Pending Signup Requests"}),e.jsxs("p",{className:"text-xs text-destructive/70 mt-0.5",children:[e.jsx("strong",{children:C})," new account",C>1?"s":""," awaiting approval."]})]})]}),e.jsxs(v,{size:"sm",variant:"destructive",className:"rounded-xl gap-1.5 hidden sm:flex text-xs",children:["Review ",e.jsx(Ms,{className:"w-3.5 h-3.5"})]})]}):null}),i||I?e.jsxs(e.Fragment,{children:[e.jsxs(k.div,{variants:E,className:"grid grid-cols-2 lg:grid-cols-4 gap-4",children:[
  e.jsx(be,{
    loading:M,
    title:"Today's Business",
    rawValue:Math.round(t.todayBusiness||0),
    displayValue:`₹${Math.round(t.todayBusiness||0).toLocaleString("en-IN")}`,
    icon:Je,
    accentColor:"#6366f1",
    description:(t.todayTripsCount||0)>0?`${t.todayTripsCount} shipment(s) booked today`:"No shipments booked yet today",
    onClick:()=>m("/trip-logs")
  }),
  e.jsx(be,{
    loading:M,
    title:"Today's Expenses",
    rawValue:Math.round(t.todayExpenses||0),
    displayValue:`₹${Math.round(t.todayExpenses||0).toLocaleString("en-IN")}`,
    icon:ts,
    accentColor:"#f59e0b",
    description:(t.todayExpensesCount||0)>0?`${t.todayExpensesCount} bill(s) logged today`:"No expenses logged today",
    onClick:()=>m("/expenses")
  }),
  e.jsx(be,{
    loading:M,
    title:"Today's Profit",
    rawValue:Math.round(t.todayProfit||0),
    displayValue:`${(t.todayProfit||0)<0?"-":""}₹${Math.abs(Math.round(t.todayProfit||0)).toLocaleString("en-IN")}`,
    icon:$s,
    accentColor:(t.todayProfit||0)>=0?"#10b981":"#f43f5e",
    description:(t.todayBusiness||0)>0?`${t.todayMargin}% net daily margin`:"Awaiting today's trip revenue",
    onClick:()=>m("/analytics")
  }),
  e.jsx(be,{
    loading:M,
    title:"Today's Trips",
    rawValue:t.todayTripsCount||0,
    icon:ve,
    accentColor:"#0ea5e9",
    description:(t.todayTripsCount||0)>0?`${t.todayInTransitCount||0} in transit · ${t.todayDeliveredCount||0} delivered`:`Fleet: ${t.trucks||0} registered vehicles`,
    onClick:()=>m("/track-shipment")
  })
]}),e.jsx(k.div,{variants:E,children:e.jsxs(Y,{className:"border border-border/40 bg-card/45 backdrop-blur-sm rounded-2xl shadow-md p-5",children:[e.jsx("div",{className:"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/30 pb-3 mb-4",children:e.jsxs("div",{children:[e.jsxs(je,{className:"text-sm font-heading flex items-center gap-2",children:[e.jsx(Je,{className:"w-4 h-4 text-primary"})," Active Shipment Pipeline"]}),e.jsx(Te,{className:"text-xs",children:"Real-time status of active logistical jobs"})]})}),e.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4 relative",children:[e.jsxs("div",{className:"flex items-center gap-3 p-3 bg-muted/20 border border-border/20 rounded-xl",children:[e.jsx("div",{className:"p-2 bg-slate-500/10 rounded-lg text-slate-400",children:e.jsx(Xe,{className:"w-4 h-4"})}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] text-muted-foreground uppercase font-bold tracking-wider",children:"Upcoming"}),e.jsx("p",{className:"text-lg font-extrabold text-foreground mt-0.5",children:t.upcomingTrips||0})]})]}),e.jsxs("div",{className:"flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl",children:[e.jsx("div",{className:"p-2 bg-blue-500/10 rounded-lg text-blue-400",children:e.jsx(ve,{className:"w-4 h-4"})}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] text-blue-400/80 uppercase font-bold tracking-wider",children:"Dispatched"}),e.jsx("p",{className:"text-lg font-extrabold text-blue-400 mt-0.5",children:t.dispatchedTrips||0})]})]}),e.jsxs("div",{className:"flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl",children:[e.jsx("div",{className:"p-2 bg-amber-500/10 rounded-lg text-amber-400",children:e.jsx(ts,{className:"w-4 h-4"})}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] text-amber-400/80 uppercase font-bold tracking-wider",children:"In Transit"}),e.jsx("p",{className:"text-lg font-extrabold text-amber-400 mt-0.5",children:t.inTransitTrips||0})]})]}),e.jsxs("div",{className:"flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl",children:[e.jsx("div",{className:"p-2 bg-emerald-500/10 rounded-lg text-emerald-400",children:e.jsx(We,{className:"w-4 h-4"})}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] text-emerald-400/80 uppercase font-bold tracking-wider",children:"Delivered"}),e.jsx("p",{className:"text-lg font-extrabold text-emerald-400 mt-0.5",children:t.deliveredTrips||0})]})]})]})]})}),e.jsx(k.div,{variants:E,id:"monthly-trip-intelligence",children:e.jsx(MonthlyTripIntelligenceTracker,{})}),e.jsx(k.div,{variants:E,id:"fleet-status-hub",children:e.jsx(ms,{})}),e.jsxs(k.div,{variants:E,className:"grid grid-cols-1 lg:grid-cols-3 gap-4",children:[e.jsxs(Y,{className:"lg:col-span-2 border border-border/40 bg-card/50 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden",children:[e.jsxs(Se,{className:"flex flex-row items-center justify-between pb-3 border-b border-border/30 px-5 pt-5",children:[e.jsxs("div",{children:[e.jsx(je,{className:"text-base font-heading",children:w("recent_shipments")}),e.jsx(Te,{className:"text-xs mt-0.5",children:"Latest 8 trips in the system"})]}),e.jsx(v,{variant:"ghost",size:"sm",asChild:!0,className:"rounded-xl text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10",children:e.jsxs(Es,{to:"/trip-logs",children:["All trips ",e.jsx(fe,{className:"w-3.5 h-3.5"})]})})]}),e.jsx(De,{className:"p-3 space-y-1.5",children:f.length===0?e.jsxs("div",{className:"text-center py-10",children:[e.jsx(ve,{className:"w-10 h-10 mx-auto text-muted-foreground/30 mb-3"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"No shipments yet."}),e.jsx(v,{size:"sm",className:"mt-3 rounded-xl",onClick:()=>G(!0),children:"Dispatch First Trip"})]}):f.map(l=>e.jsx(nt,{trip:l},l.id))})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs(Y,{className:"border border-border/40 bg-card/50 backdrop-blur-sm rounded-2xl shadow-md",children:[e.jsx(Se,{className:"pb-3 border-b border-border/30 px-5 pt-5",children:e.jsx(je,{className:"text-base font-heading",children:w("system_health")})}),e.jsxs(De,{className:"px-5 py-4 space-y-5",children:[[{label:"PODs Pending",value:t.pods,pct:t.trips?Math.min(Math.round(t.pods/t.trips*100),100):0,color:"#f59e0b"},{label:"Registered Users",value:t.users,pct:Math.min(t.users*10,100),color:"#10b981"},{label:"Fleet Utilisation",value:null,pct:78,color:"#6366f1"}].map(({label:l,value:h,pct:H,color:J})=>e.jsxs("div",{children:[e.jsxs("div",{className:"flex justify-between text-xs mb-1.5",children:[e.jsx("span",{className:"font-semibold text-foreground",children:l}),e.jsx("span",{className:"text-muted-foreground font-bold",children:h!==null?h:`${H}%`})]}),e.jsx("div",{className:"w-full bg-secondary/60 rounded-full h-1.5 overflow-hidden",children:e.jsx(k.div,{initial:{width:0},animate:{width:`${H}%`},transition:{duration:.9,ease:"easeOut"},className:"h-1.5 rounded-full",style:{backgroundColor:J}})})]},l)),e.jsxs("div",{className:"pt-3 border-t border-border/30 space-y-2",children:[e.jsxs(v,{className:"w-full rounded-xl text-xs gap-2",variant:"outline",onClick:()=>m("/analytics"),children:[e.jsx(Ps,{className:"w-3.5 h-3.5"})," Full Analytics"]}),e.jsxs(v,{className:"w-full rounded-xl text-xs gap-2",variant:"outline",onClick:()=>m("/reports"),children:[e.jsx(Ze,{className:"w-3.5 h-3.5"})," View Reports"]})]})]})]}),e.jsxs(Y,{className:"border border-border/40 bg-card/50 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden",children:[e.jsx(Se,{className:"flex flex-row items-center justify-between pb-3 border-b border-border/30 px-5 pt-5 bg-muted/5",children:e.jsxs("div",{children:[e.jsxs(je,{className:"text-base font-heading flex items-center gap-2",children:[e.jsx(Os,{className:"w-4 h-4 text-amber-500"})," Compliance Action Center"]}),e.jsx(Te,{className:"text-xs mt-0.5",children:"High-priority operational checklists"})]})}),e.jsxs(De,{className:"p-5 space-y-3.5",children:[t.lowFastagCount>0&&e.jsxs("div",{onClick:()=>{const l=document.getElementById("fleet-status-hub");if(l){l.scrollIntoView({behavior:"smooth"});const h=document.querySelector('[value="alerts"]');h&&h.click()}},className:"flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/15 hover:bg-amber-500/15 transition-all cursor-pointer group",children:[e.jsx("div",{className:"p-1.5 bg-amber-500/20 rounded-lg text-amber-500 mt-0.5",children:e.jsx(ds,{className:"w-4 h-4"})}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors",children:"Recharge FASTags"}),e.jsxs("p",{className:"text-[10px] text-amber-400/80 mt-0.5",children:[e.jsx("strong",{children:t.lowFastagCount})," trucks have balances under ₹2,000"]})]}),e.jsx(fe,{className:"w-4 h-4 text-amber-500/50 self-center group-hover:translate-x-0.5 transition-transform"})]}),t.expiringDocsCount>0&&e.jsxs("div",{onClick:()=>{const l=document.getElementById("fleet-status-hub");if(l){l.scrollIntoView({behavior:"smooth"});const h=document.querySelector('[value="alerts"]');h&&h.click()}},className:"flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/15 hover:bg-rose-500/15 transition-all cursor-pointer group",children:[e.jsx("div",{className:"p-1.5 bg-rose-500/20 rounded-lg text-rose-500 mt-0.5",children:e.jsx(Ge,{className:"w-4 h-4"})}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-xs font-bold text-rose-400 group-hover:text-rose-300 transition-colors",children:"Renew Fleet Permits"}),e.jsxs("p",{className:"text-[10px] text-rose-400/80 mt-0.5",children:[e.jsx("strong",{children:t.expiringDocsCount})," credentials expiring within 30 days"]})]}),e.jsx(fe,{className:"w-4 h-4 text-rose-500/50 self-center group-hover:translate-x-0.5 transition-transform"})]}),C>0&&e.jsxs("div",{onClick:()=>m("/dashboard/users?tab=signup-requests"),className:"flex items-start gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/15 hover:bg-blue-500/15 transition-all cursor-pointer group",children:[e.jsx("div",{className:"p-1.5 bg-blue-500/20 rounded-lg text-blue-500 mt-0.5",children:e.jsx(xs,{className:"w-4 h-4"})}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-xs font-bold text-blue-400 group-hover:text-blue-300 transition-colors",children:"Approve User Access"}),e.jsxs("p",{className:"text-[10px] text-blue-400/80 mt-0.5",children:[e.jsx("strong",{children:C})," signup requests awaiting review"]})]}),e.jsx(fe,{className:"w-4 h-4 text-blue-500/50 self-center group-hover:translate-x-0.5 transition-transform"})]}),t.pods>0&&e.jsxs("div",{onClick:()=>m("/pod-management"),className:"flex items-start gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/15 hover:bg-violet-500/15 transition-all cursor-pointer group",children:[e.jsx("div",{className:"p-1.5 bg-violet-500/20 rounded-lg text-violet-500 mt-0.5",children:e.jsx(Ze,{className:"w-4 h-4"})}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-xs font-bold text-violet-400 group-hover:text-violet-300 transition-colors",children:"Verify Delivery Proofs"}),e.jsxs("p",{className:"text-[10px] text-violet-400/80 mt-0.5",children:[e.jsx("strong",{children:t.pods})," PODs require validation & archival"]})]}),e.jsx(fe,{className:"w-4 h-4 text-violet-500/50 self-center group-hover:translate-x-0.5 transition-transform"})]}),t.lowFastagCount===0&&t.expiringDocsCount===0&&C===0&&t.pods===0&&e.jsxs("div",{className:"py-6 text-center text-muted-foreground flex flex-col items-center justify-center",children:[e.jsx(We,{className:"w-8 h-8 text-emerald-500 mb-2 opacity-75"}),e.jsx("p",{className:"text-xs font-bold text-foreground",children:"Fleet is fully compliant"}),e.jsx("p",{className:"text-[10px] mt-0.5",children:"All certifications, fastags, and signups are resolved."})]})]})]})]})]}),e.jsxs(k.div,{variants:E,className:"grid grid-cols-1 lg:grid-cols-3 gap-4",children:[e.jsxs(Y,{className:"lg:col-span-2 border border-border/40 bg-card/50 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden",children:[e.jsxs(Se,{className:"flex flex-row items-center justify-between pb-3 border-b border-border/30 px-5 pt-5",children:[e.jsxs("div",{children:[e.jsxs(je,{className:"text-base font-heading flex items-center gap-2",children:[e.jsx(Vs,{className:"w-4.5 h-4.5 text-primary"})," Active Breakdowns & Maintenance"]}),e.jsx(Te,{className:"text-xs mt-0.5",children:"Unresolved vehicle maintenance issues filed by drivers"})]}),e.jsxs(v,{variant:"ghost",size:"sm",onClick:()=>ie(!0),className:"rounded-xl text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10",children:[e.jsx(Us,{className:"w-3.5 h-3.5"})," Log Issue"]})]}),e.jsx(De,{className:"p-5",children:Z.length===0?e.jsxs("div",{className:"text-center py-8 text-muted-foreground flex flex-col items-center justify-center",children:[e.jsx(We,{className:"w-8 h-8 text-emerald-500 mb-2 opacity-75"}),e.jsx("p",{className:"text-xs font-bold text-foreground",children:"No active breakdown tickets"}),e.jsx("p",{className:"text-[10px] mt-0.5",children:"All fleet vehicle maintenance requests are resolved."})]}):e.jsx("div",{className:"space-y-3.5",children:Z.map(l=>{const h=l.severity==="High";return e.jsxs("div",{className:"flex justify-between items-start gap-4 p-3 rounded-xl bg-muted/10 border border-border/30 hover:bg-muted/20 transition-all",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs font-bold text-foreground font-mono",children:l.truck_id?l.truck_id:"Unknown Truck"}),e.jsxs("span",{className:"text-[10px] text-muted-foreground font-medium",children:["(",l.category,")"]})]}),e.jsx("p",{className:"text-xs text-muted-foreground leading-normal",children:l.description}),e.jsx("p",{className:"text-[9px] text-muted-foreground/60",children:l.date_reported?new Date(l.date_reported).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}):"-"})]}),e.jsx(X,{variant:h?"destructive":"warning",className:"text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border-0",children:l.severity})]},l.id)})})})]}),e.jsxs(Y,{className:"border border-border/40 bg-card/50 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden",children:[e.jsx(Se,{className:"flex flex-row items-center justify-between pb-3 border-b border-border/30 px-5 pt-5",children:e.jsxs("div",{children:[e.jsxs(je,{className:"text-base font-heading flex items-center gap-2",children:[e.jsx(zs,{className:"w-4.5 h-4.5 text-amber-500"})," FASTag Balance Monitor"]}),e.jsx(Te,{className:"text-xs mt-0.5",children:"Top 5 lowest FASTag account balances"})]})}),e.jsx(De,{className:"p-5 space-y-4",children:te.length===0?e.jsx("div",{className:"text-center py-6 text-muted-foreground text-xs",children:"No FASTag balance data available."}):te.map(l=>{const h=l.current_fastag_balance||0,H=h<2e3,J=Math.min(100,Math.max(0,h/5e3*100));return e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs("div",{className:"flex justify-between items-center text-xs",children:[e.jsx("span",{className:"font-bold text-foreground font-mono",children:l.truck_number}),e.jsxs("span",{className:`font-bold tabular-nums ${H?"text-rose-400":"text-emerald-400"}`,children:["₹",h.toLocaleString()]})]}),e.jsx("div",{className:"w-full bg-secondary/60 rounded-full h-1.5 overflow-hidden",children:e.jsx("div",{className:`h-1.5 rounded-full ${H?"bg-rose-500":"bg-primary"}`,style:{width:`${J}%`}})})]},l.id)})})]})]})]}):e.jsxs(k.div,{variants:E,className:"space-y-4",children:[e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-4",children:[e.jsx(be,{title:w("assigned_shipments"),rawValue:t.trips,icon:ve,accentColor:"#6366f1",onClick:()=>m("/analytics?tab=shipments")}),e.jsx(be,{title:w("pending_pods"),rawValue:t.pods,icon:Ze,accentColor:"#f59e0b"}),e.jsx(be,{title:w("active_tasks"),rawValue:12,icon:Xe,accentColor:"#8b5cf6"})]}),e.jsx(ms,{})]}),e.jsx(Ys,{isOpen:o,onClose:()=>R(!1),onSuccess:()=>{R(!1),V(!0)}}),e.jsx(Qs,{isOpen:le,onClose:()=>G(!1),onSuccess:()=>{G(!1),V(!0)}}),e.jsx(Zs,{isOpen:xe,onClose:()=>me(!1),onSuccess:()=>{me(!1),V(!0)}}),e.jsx(et,{isOpen:ne,onClose:()=>ie(!1),onSuccess:()=>{ie(!1),V(!0)}}),e.jsx(rt,{isOpen:ue,onClose:()=>Ve(!1),summaryData:{month:se(new Date,"MMMM yyyy"),completedTrips:t.trips||28,grossRevenue:t.grossRevenue||t.revenue||198800,fuelCost:t.expenses||68450,netProfit:t.fleetProfit||130350,outstandingDue:198800}}),$&&e.jsx(st,{isOpen:$,onClose:()=>Ue(!1),onApplyScan:l=>{Ue(!1),m("/fuel-tracker",{state:{scannedFuel:l}})}})]})};export{ut as default};
