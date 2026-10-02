const RouteCorridorManagerTab = () => {
  const [corridors, setCorridors] = h.useState([]);
  const [loading, setLoading] = h.useState(true);
  const [search, setSearch] = h.useState("");
  const [demandFilter, setDemandFilter] = h.useState("all");
  const [distanceFilter, setDistanceFilter] = h.useState("all");
  const [selectedCorridor, setSelectedCorridor] = h.useState(null);
  const [calcVehicle, setCalcVehicle] = h.useState("24ft_container");
  const [calcDieselRate, setCalcDieselRate] = h.useState(92.5);
  const [calcExtraHalts, setCalcExtraHalts] = h.useState(0);
  const [calcTargetMargin, setCalcTargetMargin] = h.useState(22);
  const [isAddOpen, setIsAddOpen] = h.useState(!1);
  const [editingId, setEditingId] = h.useState(null);

  const [formData, setFormData] = h.useState({
    corridorCode: "",
    corridorName: "",
    originCity: "",
    destinationCity: "",
    typicalDistanceKm: 500,
    typicalDurationHours: 10,
    typicalToll: 1200,
    typicalFuelLitres: 125,
    typicalFuelRate: 92.5,
    driverBata: 1200,
    maintenanceReserve: 800,
    recommendedQuote: 19500,
    customerDemand: "High",
    returnLoadAvailability: "High (85%)",
    returnLoadProbability: 85,
    delayHistory: "Standard highway transit. Minor congestion near toll plazas.",
    notes: "Direct corridor"
  });

  const fetchCorridors = async () => {
    setLoading(!0);
    try {
      const res = await fetch("/api/corridors?t=" + Date.now());
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data) && json.data.length > 0) {
          setCorridors(json.data);
          try { localStorage.setItem("jb_route_corridors", JSON.stringify(json.data)); } catch (e) {}
          setLoading(!1);
          return;
        }
      }
    } catch (err) {
      console.warn("Could not fetch remote corridors, checking local cache", err);
    }
    try {
      const cached = localStorage.getItem("jb_route_corridors");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCorridors(parsed);
          setLoading(!1);
          return;
        }
      }
    } catch (e) {}
    setLoading(!1);
  };

  h.useEffect(() => {
    fetchCorridors();
  }, []);

  const handleSaveCorridor = async (eForm) => {
    if (eForm) eForm.preventDefault();
    if (!formData.corridorCode || !formData.originCity || !formData.destinationCity) {
      F.error("Please fill corridor code, origin and destination.");
      return;
    }
    const payload = {
      ...formData,
      id: editingId || ("corr_" + Date.now()),
      typicalDistanceKm: Number(formData.typicalDistanceKm) || 100,
      typicalDurationHours: Number(formData.typicalDurationHours) || 5,
      typicalToll: Number(formData.typicalToll) || 0,
      typicalFuelLitres: Number(formData.typicalFuelLitres) || 30,
      typicalFuelRate: Number(formData.typicalFuelRate) || 92.5,
      driverBata: Number(formData.driverBata) || 1000,
      maintenanceReserve: Number(formData.maintenanceReserve) || 600,
      recommendedQuote: Number(formData.recommendedQuote) || 0,
      returnLoadProbability: Number(formData.returnLoadProbability) || 80
    };
    try {
      const res = await fetch("/api/corridors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        F.success("Route Corridor saved successfully!");
      }
    } catch (err) {
      console.warn("Remote save failed, saving locally", err);
    }
    setCorridors(prev => {
      const existing = prev.findIndex(c => c.id === payload.id);
      let updated;
      if (existing >= 0) {
        updated = [...prev];
        updated[existing] = payload;
      } else {
        updated = [payload, ...prev];
      }
      try { localStorage.setItem("jb_route_corridors", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    setIsAddOpen(!1);
    setEditingId(null);
  };

  const handleDeleteCorridor = async (id, eBtn) => {
    if (eBtn) eBtn.stopPropagation();
    if (!window.confirm("Delete this route corridor from database?")) return;
    try {
      await fetch("/api/corridors/" + id, { method: "DELETE" });
    } catch (err) {}
    setCorridors(prev => {
      const updated = prev.filter(c => c.id !== id);
      try { localStorage.setItem("jb_route_corridors", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    if (selectedCorridor && selectedCorridor.id === id) {
      setSelectedCorridor(null);
    }
    F.success("Route corridor deleted.");
  };

  const handleEditCorridor = (corr, eBtn) => {
    if (eBtn) eBtn.stopPropagation();
    setEditingId(corr.id);
    setFormData({
      corridorCode: corr.corridorCode || "",
      corridorName: corr.corridorName || "",
      originCity: corr.originCity || "",
      destinationCity: corr.destinationCity || "",
      typicalDistanceKm: corr.typicalDistanceKm || 500,
      typicalDurationHours: corr.typicalDurationHours || 10,
      typicalToll: corr.typicalToll || 1200,
      typicalFuelLitres: corr.typicalFuelLitres || 125,
      typicalFuelRate: corr.typicalFuelRate || 92.5,
      driverBata: corr.driverBata || 1200,
      maintenanceReserve: corr.maintenanceReserve || 800,
      recommendedQuote: corr.recommendedQuote || 19500,
      customerDemand: corr.customerDemand || "High",
      returnLoadAvailability: corr.returnLoadAvailability || "High (85%)",
      returnLoadProbability: corr.returnLoadProbability || 85,
      delayHistory: corr.delayHistory || "",
      notes: corr.notes || ""
    });
    setIsAddOpen(!0);
  };

  const vehicles = [
    { key: "32ft_mxl", label: "32ft Multi-Axle (MXL)", multiplier: 1.30, fuelFactor: 1.25, bataFactor: 1.20, tonCap: "14-18 Ton" },
    { key: "32ft_sxl", label: "32ft Single-Axle (SXL)", multiplier: 1.15, fuelFactor: 1.12, bataFactor: 1.10, tonCap: "7.5-9 Ton" },
    { key: "24ft_container", label: "24ft Container", multiplier: 1.00, fuelFactor: 1.00, bataFactor: 1.00, tonCap: "6-8 Ton" },
    { key: "20ft_truck", label: "20ft Heavy Truck", multiplier: 0.88, fuelFactor: 0.90, bataFactor: 0.90, tonCap: "5-6 Ton" },
    { key: "14ft_eicher", label: "14ft Eicher", multiplier: 0.75, fuelFactor: 0.78, bataFactor: 0.80, tonCap: "3.5-4 Ton" },
    { key: "pickup", label: "Tata Ace / Pickup", multiplier: 0.55, fuelFactor: 0.60, bataFactor: 0.65, tonCap: "1.5-2 Ton" }
  ];

  const currentVeh = vehicles.find(v => v.key === calcVehicle) || vehicles[2];

  const spotCalc = h.useMemo(() => {
    if (!selectedCorridor) return null;
    const dist = Number(selectedCorridor.typicalDistanceKm) || 500;
    const baseFuelLitres = Number(selectedCorridor.typicalFuelLitres) || Math.round(dist / 4);
    const fuelLitres = Math.round(baseFuelLitres * currentVeh.fuelFactor);
    const fuelCost = Math.round(fuelLitres * Number(calcDieselRate));
    const tollCost = Math.round((Number(selectedCorridor.typicalToll) || 0) * (currentVeh.multiplier > 1.1 ? 1.15 : currentVeh.multiplier < 0.8 ? 0.75 : 1));
    const bataCost = Math.round((Number(selectedCorridor.driverBata) || 1200) * currentVeh.bataFactor + (Number(calcExtraHalts) * 800));
    const maintCost = Math.round((Number(selectedCorridor.maintenanceReserve) || 800) * currentVeh.multiplier);

    const costForUs = fuelCost + tollCost + bataCost + maintCost;
    const targetMarginRatio = (Number(calcTargetMargin) || 22) / 100;
    const recQuote = Math.round((costForUs / (1 - targetMarginRatio)) / 100) * 100;
    const floorQuote = Math.round((costForUs * 1.10) / 100) * 100;
    const premiumQuote = Math.round((costForUs * 1.35) / 100) * 100;
    const profit = recQuote - costForUs;
    const actualMarginPct = recQuote > 0 ? Number(((profit / recQuote) * 100).toFixed(1)) : 22.0;

    return {
      dist,
      fuelLitres,
      fuelCost,
      tollCost,
      bataCost,
      maintCost,
      costForUs,
      floorQuote,
      recQuote,
      premiumQuote,
      profit,
      actualMarginPct
    };
  }, [selectedCorridor, currentVeh, calcDieselRate, calcExtraHalts, calcTargetMargin]);

  const handleCopyQuote = (corr, eBtn) => {
    if (eBtn) eBtn.stopPropagation();
    const c = corr || selectedCorridor;
    if (!c) return;
    const calc = (corr && corr.id === selectedCorridor?.id && spotCalc) ? spotCalc : {
      costForUs: c.typicalCost || 16400,
      recQuote: c.recommendedQuote || 20800,
      floorQuote: c.floorQuote || 17800,
      premiumQuote: c.premiumQuote || 23500,
      profit: (c.recommendedQuote || 20800) - (c.typicalCost || 16400),
      actualMarginPct: c.historicalMarginPct || 21.9
    };

    const quoteMsg = "*JAI BHAVANI CARGO - SPOT FREIGHT QUOTATION*\n" +
      "📍 *Route Corridor:* " + c.corridorCode + " (" + (c.corridorName || (c.originCity + " ➔ " + c.destinationCity)) + ")\n" +
      "🚛 *Vehicle:* " + currentVeh.label + " (" + currentVeh.tonCap + ")\n" +
      "📏 *Distance / Transit:* ~" + c.typicalDistanceKm + " km | ~" + c.typicalDurationHours + " hrs\n" +
      "💰 *Recommended Spot Quote:* " + k(calc.recQuote) + "/- (All inclusive)\n" +
      "🛡️ *Floor Minimum Rate:* " + k(calc.floorQuote) + "/-\n" +
      "⚡ *Express / Urgent Rate:* " + k(calc.premiumQuote) + "/-\n" +
      "🔄 *Return Load Probability:* " + (c.returnLoadAvailability || "High") + "\n" +
      "⚠️ *Corridor Traffic Note:* " + (c.delayHistory || "Standard highway transit") + "\n" +
      "📞 *Immediate Dispatch:* Jai Bhavani Cargo Pvt. Ltd. | 24/7 Control Room";

    navigator.clipboard.writeText(quoteMsg).then(() => {
      F.success("Spot quote copied to clipboard! Ready to send on WhatsApp.");
    }).catch(() => {
      F.success("Quote generated: " + k(calc.recQuote));
    });
  };

  const filteredCorridors = h.useMemo(() => {
    return corridors.filter(c => {
      if (search) {
        const s = search.toLowerCase();
        const code = (c.corridorCode || "").toLowerCase();
        const name = (c.corridorName || "").toLowerCase();
        const org = (c.originCity || "").toLowerCase();
        const dst = (c.destinationCity || "").toLowerCase();
        const notes = (c.notes || "").toLowerCase();
        if (!code.includes(s) && !name.includes(s) && !org.includes(s) && !dst.includes(s) && !notes.includes(s)) return false;
      }
      if (demandFilter !== "all" && c.customerDemand !== demandFilter) return false;
      if (distanceFilter === "short" && (Number(c.typicalDistanceKm) || 0) >= 300) return false;
      if (distanceFilter === "medium" && ((Number(c.typicalDistanceKm) || 0) < 300 || (Number(c.typicalDistanceKm) || 0) > 600)) return false;
      if (distanceFilter === "long" && (Number(c.typicalDistanceKm) || 0) <= 600) return false;
      return true;
    });
  }, [corridors, search, demandFilter, distanceFilter]);

  const stats = h.useMemo(() => {
    const total = corridors.length;
    const avgDist = total > 0 ? Math.round(corridors.reduce((a, b) => a + (Number(b.typicalDistanceKm) || 0), 0) / total) : 0;
    const avgMargin = total > 0 ? (corridors.reduce((a, b) => a + (Number(b.historicalMarginPct) || 22), 0) / total).toFixed(1) : "22.5";
    const highReturnCount = corridors.filter(c => (Number(c.returnLoadProbability) || 0) >= 80).length;
    return { total, avgDist, avgMargin, highReturnCount };
  }, [corridors]);

  return e.jsxs("div",{className:"space-y-6 animate-in fade-in duration-300",children:[
    // KPI summary cards
    e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-4",children:[
      e.jsx(m,{className:"border border-border/60 bg-card/60 backdrop-blur-md shadow-sm",children:e.jsxs(A,{className:"p-4 flex items-center gap-3",children:[
        e.jsx("div",{className:"w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold shrink-0 text-lg",children:"📍"}),
        e.jsxs("div",{children:[
          e.jsx("p",{className:"text-xs font-medium text-muted-foreground",children:"Active Corridors"}),
          e.jsx("h4",{className:"text-xl font-bold tracking-tight text-foreground",children:stats.total})
        ]})
      ]})}),
      e.jsx(m,{className:"border border-border/60 bg-card/60 backdrop-blur-md shadow-sm",children:e.jsxs(A,{className:"p-4 flex items-center gap-3",children:[
        e.jsx("div",{className:"w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 text-lg",children:"📏"}),
        e.jsxs("div",{children:[
          e.jsx("p",{className:"text-xs font-medium text-muted-foreground",children:"Avg Distance"}),
          e.jsx("h4",{className:"text-xl font-bold tracking-tight text-foreground",children:stats.avgDist + " km"})
        ]})
      ]})}),
      e.jsx(m,{className:"border border-border/60 bg-card/60 backdrop-blur-md shadow-sm",children:e.jsxs(A,{className:"p-4 flex items-center gap-3",children:[
        e.jsx("div",{className:"w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold shrink-0 text-lg",children:"📈"}),
        e.jsxs("div",{children:[
          e.jsx("p",{className:"text-xs font-medium text-muted-foreground",children:"Avg Corridor Margin"}),
          e.jsx("h4",{className:"text-xl font-bold tracking-tight text-amber-400",children:stats.avgMargin + "%"})
        ]})
      ]})}),
      e.jsx(m,{className:"border border-border/60 bg-card/60 backdrop-blur-md shadow-sm",children:e.jsxs(A,{className:"p-4 flex items-center gap-3",children:[
        e.jsx("div",{className:"w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 font-bold shrink-0 text-lg",children:"🔄"}),
        e.jsxs("div",{children:[
          e.jsx("p",{className:"text-xs font-medium text-muted-foreground",children:"High Return Lanes"}),
          e.jsx("h4",{className:"text-xl font-bold tracking-tight text-teal-400",children:stats.highReturnCount + " Lanes"})
        ]})
      ]})})
    ]}),

    // Interactive Action & Filter Bar
    e.jsxs("div",{className:"bg-card/70 backdrop-blur-md p-4 rounded-2xl border border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm",children:[
      e.jsxs("div",{className:"flex flex-wrap items-center gap-3 flex-1",children:[
        e.jsx("div",{className:"relative w-full sm:w-64",children:[
          e.jsx(Se,{placeholder:"Search corridor code or city (e.g. HYD, BLR)...",value:search,onChange:t=>setSearch(t.target.value),className:"bg-background/80 border-border/70 rounded-xl h-10 text-xs shadow-none"})
        ]}),
        e.jsxs(ie,{value:demandFilter,onValueChange:setDemandFilter,children:[
          e.jsx(ce,{className:"w-[150px] bg-background/80 border-border/70 rounded-xl h-10 text-xs",children:e.jsx(xe,{placeholder:"Demand"})}),
          e.jsxs(me,{className:"rounded-xl",children:[
            e.jsx(P,{value:"all",children:"All Demands"}),
            e.jsx(P,{value:"Very High",children:"🔥 Very High"}),
            e.jsx(P,{value:"High",children:"⭐ High"}),
            e.jsx(P,{value:"Medium",children:"Medium"}),
            e.jsx(P,{value:"Seasonal",children:"Seasonal"})
          ]})
        ]}),
        e.jsxs(ie,{value:distanceFilter,onValueChange:setDistanceFilter,children:[
          e.jsx(ce,{className:"w-[160px] bg-background/80 border-border/70 rounded-xl h-10 text-xs",children:e.jsx(xe,{placeholder:"Distance"})}),
          e.jsxs(me,{className:"rounded-xl",children:[
            e.jsx(P,{value:"all",children:"All Distances"}),
            e.jsx(P,{value:"short",children:"Short (<300 km)"}),
            e.jsx(P,{value:"medium",children:"Medium (300-600 km)"}),
            e.jsx(P,{value:"long",children:"Long (>600 km)"})
          ]})
        ]})
      ]}),
      e.jsxs(L,{onClick:()=>{
        setEditingId(null);
        setFormData({
          corridorCode:"",
          corridorName:"",
          originCity:"",
          destinationCity:"",
          typicalDistanceKm:500,
          typicalDurationHours:10,
          typicalToll:1200,
          typicalFuelLitres:125,
          typicalFuelRate:92.5,
          driverBata:1200,
          maintenanceReserve:800,
          recommendedQuote:19500,
          customerDemand:"High",
          returnLoadAvailability:"High (85%)",
          returnLoadProbability:85,
          delayHistory:"Standard highway transit.",
          notes:""
        });
        setIsAddOpen(!0);
      },className:"rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-4 shadow-sm shrink-0",children:[
        "+ Add Route Corridor"
      ]})
    ]}),

    // Selected Corridor Spot Calculator Drawer / Banner (Active when corridor clicked)
    selectedCorridor && spotCalc && e.jsxs("div",{className:"bg-gradient-to-br from-emerald-950/30 via-card to-background border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5 animate-in slide-in-from-top-4",children:[
      e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4",children:[
        e.jsxs("div",{className:"flex items-center gap-3",children:[
          e.jsx("div",{className:"w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-xl flex items-center justify-center shrink-0 border border-emerald-500/30",children:"⚡"}),
          e.jsxs("div",{children:[
            e.jsxs("h3",{className:"text-lg font-bold text-foreground flex items-center gap-2",children:[
              selectedCorridor.corridorCode,
              e.jsx("span",{className:"text-muted-foreground font-normal text-sm",children:"(" + selectedCorridor.corridorName + ")"}),
              e.jsx(R,{variant:"outline",className:"bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[11px]",children:selectedCorridor.customerDemand + " Demand"})
            ]}),
            e.jsxs("p",{className:"text-xs text-muted-foreground mt-0.5",children:[
              "Distance: ", e.jsx("strong",{className:"text-foreground",children:spotCalc.dist + " km"}),
              " | Typical Duration: ", e.jsx("strong",{className:"text-foreground",children:(selectedCorridor.typicalDurationHours||10) + " hrs"}),
              " | Return-Load: ", e.jsx("span",{className:"text-teal-400 font-semibold",children:selectedCorridor.returnLoadAvailability||"Good"})
            ]})
          ]})
        ]}),
        e.jsxs("div",{className:"flex items-center gap-2 self-end sm:self-auto",children:[
          e.jsxs(L,{size:"sm",onClick:()=>handleCopyQuote(selectedCorridor),className:"rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm",children:[
            "📋 Copy Quote to WhatsApp"
          ]}),
          e.jsx(L,{size:"sm",variant:"ghost",onClick:()=>setSelectedCorridor(null),className:"rounded-xl text-muted-foreground hover:text-foreground",children:"✕ Close Calculator"})
        ]})
      ]}),

      // Calculator Controls Row
      e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50",children:[
        e.jsxs("div",{className:"space-y-1.5",children:[
          e.jsx("label",{className:"text-xs font-semibold text-muted-foreground uppercase tracking-wider",children:"1. Select Vehicle Type"}),
          e.jsxs(ie,{value:calcVehicle,onValueChange:setCalcVehicle,children:[
            e.jsx(ce,{className:"bg-background border-border/80 rounded-xl h-10 text-xs font-medium",children:e.jsx(xe,{})}),
            e.jsx(me,{className:"rounded-xl",children:vehicles.map(v => e.jsx(P,{value:v.key,children:v.label + " (" + v.tonCap + ")"},v.key))})
          ]})
        ]}),
        e.jsxs("div",{className:"space-y-1.5",children:[
          e.jsx("label",{className:"text-xs font-semibold text-muted-foreground uppercase tracking-wider",children:"2. Diesel Rate (₹/Litre)"}),
          e.jsx(Se,{type:"number",step:"0.5",value:calcDieselRate,onChange:t=>setCalcDieselRate(t.target.value),className:"bg-background border-border/80 rounded-xl h-10 text-xs font-medium"})
        ]}),
        e.jsxs("div",{className:"space-y-1.5",children:[
          e.jsxs("div",{className:"flex justify-between items-center",children:[
            e.jsx("label",{className:"text-xs font-semibold text-muted-foreground uppercase tracking-wider",children:"3. Target Margin %"}),
            e.jsx("span",{className:"text-xs font-bold text-emerald-400",children:calcTargetMargin + "%"})
          ]}),
          e.jsx(Se,{type:"number",min:"10",max:"45",value:calcTargetMargin,onChange:t=>setCalcTargetMargin(t.target.value),className:"bg-background border-border/80 rounded-xl h-10 text-xs font-medium"})
        ]})
      ]}),

      // The Dual Output: What It Costs for Us vs What We Can Quote
      e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-5",children:[
        // Box 1: How much it costs for us
        e.jsxs("div",{className:"bg-card/90 border border-border/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm",children:[
          e.jsxs("div",{className:"flex items-center justify-between border-b border-border/60 pb-2.5",children:[
            e.jsxs("h4",{className:"font-bold text-sm text-foreground flex items-center gap-2",children:[
              e.jsx("span",{className:"w-2.5 h-2.5 rounded-full bg-rose-500"}),
              "HOW MUCH IT COSTS FOR US (Our Trip Cost)"
            ]}),
            e.jsx("span",{className:"text-xs text-muted-foreground",children:"Direct Operating Exp"})
          ]}),
          e.jsxs("div",{className:"space-y-2 text-xs",children:[
            e.jsxs("div",{className:"flex justify-between py-1 border-b border-border/40",children:[
              e.jsxs("span",{className:"text-muted-foreground flex items-center gap-1.5",children:[
                "⛽ Fuel (" + spotCalc.fuelLitres + " Litres @ ₹" + calcDieselRate + "):"
              ]}),
              e.jsx("span",{className:"font-semibold text-foreground",children:k(spotCalc.fuelCost)})
            ]}),
            e.jsxs("div",{className:"flex justify-between py-1 border-b border-border/40",children:[
              e.jsx("span",{className:"text-muted-foreground",children:"🛣️ Fastag & Highway Tolls:"}),
              e.jsx("span",{className:"font-semibold text-foreground",children:k(spotCalc.tollCost)})
            ]}),
            e.jsxs("div",{className:"flex justify-between py-1 border-b border-border/40",children:[
              e.jsx("span",{className:"text-muted-foreground",children:"👨‍✈️ Driver Bata & En-route Allowance:"}),
              e.jsx("span",{className:"font-semibold text-foreground",children:k(spotCalc.bataCost)})
            ]}),
            e.jsxs("div",{className:"flex justify-between py-1 border-b border-border/40",children:[
              e.jsx("span",{className:"text-muted-foreground",children:"🔧 Vehicle Maintenance & Tyres Allowance:"}),
              e.jsx("span",{className:"font-semibold text-foreground",children:k(spotCalc.maintCost)})
            ]}),
            e.jsxs("div",{className:"flex justify-between items-center pt-2 font-bold text-sm text-foreground",children:[
              e.jsx("span",{className:"text-rose-400 font-extrabold uppercase",children:"Total Net Base Cost:"}),
              e.jsx("span",{className:"text-base text-rose-400 font-black",children:k(spotCalc.costForUs)})
            ]})
          ]})
        ]}),

        // Box 2: How much we can quote
        e.jsxs("div",{className:"bg-emerald-950/20 border-2 border-emerald-500/50 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md",children:[
          e.jsxs("div",{className:"flex items-center justify-between border-b border-emerald-500/30 pb-2.5",children:[
            e.jsxs("h4",{className:"font-bold text-sm text-emerald-400 flex items-center gap-2",children:[
              e.jsx("span",{className:"w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"}),
              "HOW MUCH WE CAN QUOTE (Spot Quotation)"
            ]}),
            e.jsx(R,{className:"bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-bold",children:spotCalc.actualMarginPct + "% Margin"})
          ]}),
          e.jsxs("div",{className:"grid grid-cols-3 gap-2 py-1",children:[
            // Floor
            e.jsxs("div",{className:"bg-card/70 border border-border/60 rounded-xl p-2.5 text-center space-y-1",children:[
              e.jsx("p",{className:"text-[10px] uppercase font-bold text-muted-foreground",children:"Floor Minimum"}),
              e.jsx("p",{className:"text-sm font-bold text-foreground",children:k(spotCalc.floorQuote)}),
              e.jsx("p",{className:"text-[10px] text-muted-foreground",children:"Breakeven + 10%"})
            ]}),
            // Recommended
            e.jsxs("div",{className:"bg-emerald-500/15 border-2 border-emerald-500/60 rounded-xl p-2.5 text-center space-y-1 shadow-sm",children:[
              e.jsx("p",{className:"text-[10px] uppercase font-black text-emerald-400",children:"⭐ RECOMMENDED"}),
              e.jsx("p",{className:"text-base font-black text-emerald-300",children:k(spotCalc.recQuote)}),
              e.jsx("p",{className:"text-[10px] text-emerald-400/90 font-medium",children:"+" + k(spotCalc.profit) + " Profit"})
            ]}),
            // Premium
            e.jsxs("div",{className:"bg-card/70 border border-border/60 rounded-xl p-2.5 text-center space-y-1",children:[
              e.jsx("p",{className:"text-[10px] uppercase font-bold text-amber-400",children:"⚡ Peak / Express"}),
              e.jsx("p",{className:"text-sm font-bold text-foreground",children:k(spotCalc.premiumQuote)}),
              e.jsx("p",{className:"text-[10px] text-muted-foreground",children:"35% Margin"})
            ]})
          ]}),
          e.jsxs("div",{className:"bg-background/60 rounded-xl p-2.5 text-xs border border-border/50 space-y-1",children:[
            e.jsxs("div",{className:"flex items-center gap-1.5 text-teal-400 font-semibold",children:[
              "🔄 Return-Load Intelligence: ", e.jsx("span",{className:"text-foreground font-normal",children:selectedCorridor.returnLoadAvailability || "Good backhaul available"})
            ]}),
            selectedCorridor.delayHistory && e.jsxs("div",{className:"text-[11px] text-muted-foreground flex items-center gap-1.5",children:[
              "⚠️ Traffic / Toll note: ", e.jsx("span",{className:"text-foreground/90 font-medium",children:selectedCorridor.delayHistory})
            ]})
          ]})
        ]})
      ]})
    ]}),

    // Corridors Grid (Cards)
    e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5",children:
      filteredCorridors.length === 0 ? e.jsx("div",{className:"col-span-full py-16 text-center text-muted-foreground bg-card/30 rounded-2xl border border-dashed border-border/60",children:"No route corridors found matching your filter criteria."}) :
      filteredCorridors.map(corr => {
        const isSelected = selectedCorridor && selectedCorridor.id === corr.id;
        const estCost = corr.typicalCost || 16400;
        const recQuote = corr.recommendedQuote || 20800;
        const profit = recQuote - estCost;
        const margin = corr.historicalMarginPct || 21.9;

        return e.jsxs(m,{key:corr.id,onClick:()=>setSelectedCorridor(corr),className:"border cursor-pointer transition-all duration-300 group hover:shadow-lg relative overflow-hidden " + (isSelected ? "border-emerald-500 bg-emerald-950/15 ring-2 ring-emerald-500/20 shadow-md" : "border-border/60 bg-card/70 hover:border-emerald-500/50 hover:bg-card"),children:[
          e.jsxs(Ke,{className:"p-4 pb-2 border-b border-border/40",children:[
            e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[
              e.jsxs("div",{children:[
                e.jsxs("div",{className:"flex items-center gap-2",children:[
                  e.jsx("span",{className:"font-black text-lg text-foreground tracking-tight group-hover:text-emerald-400 transition-colors",children:corr.corridorCode}),
                  e.jsx(R,{variant:"outline",className:"text-[10px] font-bold px-1.5 py-0 border-emerald-500/40 text-emerald-400 bg-emerald-500/10",children:corr.customerDemand + " Demand"})
                ]}),
                e.jsx("h4",{className:"text-xs font-semibold text-muted-foreground mt-0.5",children:corr.corridorName || (corr.originCity + " ➔ " + corr.destinationCity)})
              ]}),
              e.jsxs("div",{className:"flex items-center gap-1",children:[
                e.jsx(L,{size:"icon",variant:"ghost",onClick:(eBtn)=>handleEditCorridor(corr,eBtn),className:"h-7 w-7 text-muted-foreground hover:text-primary",title:"Edit Corridor",children:"✏️"}),
                e.jsx(L,{size:"icon",variant:"ghost",onClick:(eBtn)=>handleDeleteCorridor(corr.id,eBtn),className:"h-7 w-7 text-muted-foreground hover:text-destructive",title:"Delete Corridor",children:"🗑️"})
              ]})
            ]})
          ]}),

          e.jsxs(A,{className:"p-4 space-y-3",children:[
            // Distance & Duration
            e.jsxs("div",{className:"flex items-center justify-between text-xs text-muted-foreground bg-muted/20 px-3 py-2 rounded-xl",children:[
              e.jsxs("span",{className:"flex items-center gap-1",children:["📏 ", e.jsx("strong",{className:"text-foreground",children:corr.typicalDistanceKm + " km"})]}),
              e.jsxs("span",{className:"flex items-center gap-1",children:["⏱️ ", e.jsx("strong",{className:"text-foreground",children:corr.typicalDurationHours + " hrs"})]}),
              e.jsxs("span",{className:"flex items-center gap-1 text-teal-400 font-semibold",children:["🔄 ", corr.returnLoadAvailability || "Good Backhaul"]})
            ]}),

            // Price Comparison (Cost vs Quote)
            e.jsxs("div",{className:"grid grid-cols-2 gap-2 pt-1",children:[
              // It costs for us
              e.jsxs("div",{className:"bg-rose-500/10 border border-rose-500/25 rounded-xl p-2.5",children:[
                e.jsx("p",{className:"text-[10px] font-bold text-rose-400 uppercase tracking-wider",children:"Costs For Us:"}),
                e.jsx("p",{className:"text-base font-black text-rose-400",children:k(estCost)}),
                e.jsxs("p",{className:"text-[10px] text-muted-foreground truncate",children:["Toll: " + k(corr.typicalToll||0) + " | Fuel: " + (corr.typicalFuelLitres||120) + "L"]})
              ]}),
              // We can quote
              e.jsxs("div",{className:"bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5",children:[
                e.jsx("p",{className:"text-[10px] font-bold text-emerald-400 uppercase tracking-wider",children:"We Can Quote:"}),
                e.jsx("p",{className:"text-base font-black text-emerald-400",children:k(recQuote)}),
                e.jsxs("p",{className:"text-[10px] text-emerald-400/90 font-semibold",children:["+" + k(profit) + " (" + margin + "%)"]})
              ]})
            ]}),

            // Delay History
            corr.delayHistory && e.jsxs("div",{className:"text-[11px] text-muted-foreground bg-background/50 p-2 rounded-lg border border-border/40 line-clamp-2",children:[
              e.jsx("strong",{className:"text-foreground/90",children:"Transit note: "}),
              corr.delayHistory
            ]}),

            // Action Buttons
            e.jsxs("div",{className:"flex items-center justify-between gap-2 pt-1",children:[
              e.jsxs(L,{size:"sm",variant:"outline",onClick:()=>setSelectedCorridor(corr),className:"text-xs font-semibold h-8 rounded-lg flex-1 border-border/80 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/40",children:[
                "⚡ Spot Calculator"
              ]}),
              e.jsxs(L,{size:"sm",onClick:(eBtn)=>handleCopyQuote(corr,eBtn),className:"text-xs font-semibold h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 shadow-sm",children:[
                "📋 Copy Quote"
              ]})
            ]})
          ]})
        ]});
      })
    }),

    // Add / Edit Corridor Modal Dialog
    isAddOpen && e.jsx("div",{className:"fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto",children:
      e.jsxs("div",{className:"bg-card border border-border rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95",children:[
        e.jsxs("div",{className:"flex items-center justify-between border-b border-border/60 pb-3",children:[
          e.jsxs("h3",{className:"text-lg font-bold text-foreground",children:[editingId ? "Edit Route Corridor" : "Add New Route Corridor"]}),
          e.jsx(L,{size:"sm",variant:"ghost",onClick:()=>{setIsAddOpen(!1);setEditingId(null);},className:"rounded-full h-8 w-8 p-0",children:"✕"})
        ]}),
        e.jsxs("form",{onSubmit:handleSaveCorridor,className:"space-y-4",children:[
          e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[
            e.jsxs("div",{className:"space-y-1",children:[
              e.jsx("label",{className:"text-xs font-semibold text-muted-foreground",children:"Corridor Code (e.g. DEL-BOM)*"}),
              e.jsx(Se,{required:!0,value:formData.corridorCode,onChange:t=>setFormData({...formData,corridorCode:t.target.value.toUpperCase()}),placeholder:"HYD-BLR",className:"h-9 text-xs"})
            ]}),
            e.jsxs("div",{className:"space-y-1",children:[
              e.jsx("label",{className:"text-xs font-semibold text-muted-foreground",children:"Corridor Name*"}),
              e.jsx(Se,{required:!0,value:formData.corridorName,onChange:t=>setFormData({...formData,corridorName:t.target.value}),placeholder:"Hyderabad ➔ Bengaluru",className:"h-9 text-xs"})
            ]})
          ]}),
          e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[
            e.jsxs("div",{className:"space-y-1",children:[
              e.jsx("label",{className:"text-xs font-semibold text-muted-foreground",children:"Origin City*"}),
              e.jsx(Se,{required:!0,value:formData.originCity,onChange:t=>setFormData({...formData,originCity:t.target.value}),placeholder:"Hyderabad",className:"h-9 text-xs"})
            ]}),
            e.jsxs("div",{className:"space-y-1",children:[
              e.jsx("label",{className:"text-xs font-semibold text-muted-foreground",children:"Destination City*"}),
              e.jsx(Se,{required:!0,value:formData.destinationCity,onChange:t=>setFormData({...formData,destinationCity:t.target.value}),placeholder:"Bengaluru",className:"h-9 text-xs"})
            ]})
          ]}),
          e.jsxs("div",{className:"grid grid-cols-3 gap-3",children:[
            e.jsxs("div",{className:"space-y-1",children:[
              e.jsx("label",{className:"text-xs font-semibold text-muted-foreground",children:"Distance (km)"}),
              e.jsx(Se,{type:"number",value:formData.typicalDistanceKm,onChange:t=>setFormData({...formData,typicalDistanceKm:t.target.value}),className:"h-9 text-xs"})
            ]}),
            e.jsxs("div",{className:"space-y-1",children:[
              e.jsx("label",{className:"text-xs font-semibold text-muted-foreground",children:"Duration (hrs)"}),
              e.jsx(Se,{type:"number",step:"0.5",value:formData.typicalDurationHours,onChange:t=>setFormData({...formData,typicalDurationHours:t.target.value}),className:"h-9 text-xs"})
            ]}),
            e.jsxs("div",{className:"space-y-1",children:[
              e.jsx("label",{className:"text-xs font-semibold text-muted-foreground",children:"Toll Tax (₹)"}),
              e.jsx(Se,{type:"number",value:formData.typicalToll,onChange:t=>setFormData({...formData,typicalToll:t.target.value}),className:"h-9 text-xs"})
            ]})
          ]}),
          e.jsxs("div",{className:"grid grid-cols-3 gap-3",children:[
            e.jsxs("div",{className:"space-y-1",children:[
              e.jsx("label",{className:"text-xs font-semibold text-muted-foreground",children:"Fuel (Litres)"}),
              e.jsx(Se,{type:"number",value:formData.typicalFuelLitres,onChange:t=>setFormData({...formData,typicalFuelLitres:t.target.value}),className:"h-9 text-xs"})
            ]}),
            e.jsxs("div",{className:"space-y-1",children:[
              e.jsx("label",{className:"text-xs font-semibold text-muted-foreground",children:"Driver Bata (₹)"}),
              e.jsx(Se,{type:"number",value:formData.driverBata,onChange:t=>setFormData({...formData,driverBata:t.target.value}),className:"h-9 text-xs"})
            ]}),
            e.jsxs("div",{className:"space-y-1",children:[
              e.jsx("label",{className:"text-xs font-semibold text-muted-foreground",children:"Target Quote (₹)"}),
              e.jsx(Se,{type:"number",value:formData.recommendedQuote,onChange:t=>setFormData({...formData,recommendedQuote:t.target.value}),className:"h-9 text-xs"})
            ]})
          ]}),
          e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[
            e.jsxs("div",{className:"space-y-1",children:[
              e.jsx("label",{className:"text-xs font-semibold text-muted-foreground",children:"Customer Demand"}),
              e.jsxs(ie,{value:formData.customerDemand,onValueChange:val=>setFormData({...formData,customerDemand:val}),children:[
                e.jsx(ce,{className:"h-9 text-xs",children:e.jsx(xe,{})}),
                e.jsxs(me,{children:[
                  e.jsx(P,{value:"Very High",children:"🔥 Very High"}),
                  e.jsx(P,{value:"High",children:"⭐ High"}),
                  e.jsx(P,{value:"Medium",children:"Medium"}),
                  e.jsx(P,{value:"Seasonal",children:"Seasonal"})
                ]})
              ]})
            ]}),
            e.jsxs("div",{className:"space-y-1",children:[
              e.jsx("label",{className:"text-xs font-semibold text-muted-foreground",children:"Return-Load Availability"}),
              e.jsx(Se,{value:formData.returnLoadAvailability,onChange:t=>setFormData({...formData,returnLoadAvailability:t.target.value}),placeholder:"High (88%)",className:"h-9 text-xs"})
            ]})
          ]}),
          e.jsxs("div",{className:"space-y-1",children:[
            e.jsx("label",{className:"text-xs font-semibold text-muted-foreground",children:"Delay History & Route Notes"}),
            e.jsx(Se,{value:formData.delayHistory,onChange:t=>setFormData({...formData,delayHistory:t.target.value}),placeholder:"e.g. NH44 smooth 4-lane. Evening toll rush near outskirts.",className:"h-9 text-xs"})
          ]}),
          e.jsxs("div",{className:"flex justify-end gap-2 pt-2 border-t border-border/60",children:[
            e.jsx(L,{type:"button",variant:"outline",onClick:()=>{setIsAddOpen(!1);setEditingId(null);},className:"rounded-xl text-xs",children:"Cancel"}),
            e.jsx(L,{type:"submit",className:"rounded-xl bg-primary text-primary-foreground font-semibold text-xs",children:editingId ? "Update Corridor" : "Save Corridor"})
          ]})
        ]})
      ]})
    })
  ]});
};
