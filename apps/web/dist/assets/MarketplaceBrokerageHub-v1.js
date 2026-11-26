import { r as React } from "./vendor-react-Bs5V2qFE.js";
import { p as pb, t as toast } from "./index-F7L3R9.js";
const { useState, useEffect, useMemo } = React;
const VEHICLE_TYPES = [
  "32FT SXL (7.5 MT)",
  "32FT MXL (15 MT)",
  "24FT Closed Container",
  "20FT Standard Container",
  "17FT / 19FT Open/Closed",
  "14FT Eicher / Canter",
  "40FT Trailer"
];
export default function MarketplaceBrokerageHub() {
  const [viewRole, setViewRole] = useState("admin");
  const [activeSubTab, setActiveSubTab] = useState("board");
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clients, setClients] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [transporters, setTransporters] = useState([]);
  const [corridors, setCorridors] = useState([]);
  const [postOpen, setPostOpen] = useState(false);
  const [ownFleetLoad, setOwnFleetLoad] = useState(null);
  const [directTransLoad, setDirectTransLoad] = useState(null);
  const [warRoomLoad, setWarRoomLoad] = useState(null);
  const [bidLoad, setBidLoad] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [postForm, setPostForm] = useState({
    client_id: "",
    client_name: "",
    origin: "",
    destination: "",
    pickup_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    vehicle_type: "32FT SXL (7.5 MT)",
    weight_mt: "7.5",
    distance_km: "600",
    material: "Containerized Commercial Freight",
    client_rate: "38000",
    commission_type: "percent",
    commission_value: "12",
    fulfilment_mode: "open_bidding",
    notes: ""
  });
  const [ownForm, setOwnForm] = useState({ truck_id: "", truck_number: "", driver_id: "", driver_name: "", driver_phone: "" });
  const [directForm, setDirectForm] = useState({ transporter_id: "", transporter_name: "", transporter_phone: "", transporter_rate: "", truck_number: "", driver_name: "", driver_phone: "" });
  const [bidForm, setBidForm] = useState({ transporter_name: "", transporter_phone: "", bid_amount: "", truck_number: "", driver_name: "", driver_phone: "", eta_hours: "4", notes: "" });
  const [counterDrafts, setCounterDrafts] = useState({});
  const loadAll = async (roleOverride) => {
    const r = roleOverride || viewRole;
    setLoading(true);
    try {
      const [loadsRes, cl, trk, emp, cnt, corr] = await Promise.all([
        fetch("/api/marketplace/loads?role=" + encodeURIComponent(r) + "&t=" + Date.now()).then((x) => x.json()).catch(() => ({ loads: [] })),
        pb.collection("clients").getFullList({ $autoCancel: false }).catch(() => []),
        pb.collection("trucks").getFullList({ $autoCancel: false }).catch(() => []),
        pb.collection("employees").getFullList({ $autoCancel: false }).catch(() => []),
        pb.collection("contacts").getFullList({ $autoCancel: false }).catch(() => []),
        fetch("/api/corridors?t=" + Date.now()).then((x) => x.json()).catch(() => ({ data: [] }))
      ]);
      setLoads(loadsRes.loads || []);
      setClients(cl || []);
      setTrucks(trk || []);
      setDrivers((emp || []).filter((e) => !["terminated", "inactive", "resigned"].includes(String(e.status || "Active").toLowerCase())));
      setTransporters((cnt || []).filter((c) => ["Transporter", "Truck Owner"].includes(c.contact_type) || ["Transporter", "Truck Owner"].includes(c.primary_category)));
      setCorridors(corr.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load marketplace data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAll(viewRole);
  }, [viewRole]);
  const calcMaxBudget = (rate, cType, cVal) => {
    const r = Number(rate) || 0;
    const v = Number(cVal) || 0;
    if (r <= 0) return 0;
    return cType === "flat" ? Math.max(0, Math.round(r - v)) : Math.max(0, Math.round(r * (1 - v / 100)));
  };
  const kpis = useMemo(() => {
    const openLoads = loads.filter((l) => ["Posted", "Bidding Open"].includes(l.status)).length;
    const assigned = loads.filter((l) => ["Assigned", "In-Transit", "POD Uploaded", "Settled"].includes(l.status));
    const totalBids = loads.reduce((s, l) => s + (Number(l.bid_count) || 0), 0);
    const totalGmv = assigned.reduce((s, l) => s + (Number(l.client_rate) || 0), 0);
    const totalMargin = assigned.reduce((s, l) => s + (Number(l.jbc_margin) || 0), 0);
    const ownCount = assigned.filter((l) => l.fulfilment_mode === "own_fleet").length;
    const outsourcedCount = assigned.filter((l) => l.fulfilment_mode !== "own_fleet").length;
    const avgMarginPct = totalGmv > 0 ? (totalMargin / totalGmv * 100).toFixed(1) : "0.0";
    return { openLoads, totalBids, totalGmv, totalMargin, ownCount, outsourcedCount, avgMarginPct };
  }, [loads]);
  const filteredLoads = useMemo(() => {
    return loads.filter((l) => {
      if (viewRole === "transporter" && !["Bidding Open", "Posted", "Assigned"].includes(l.status)) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (l.load_code || "").toLowerCase().includes(q) || (l.origin || "").toLowerCase().includes(q) || (l.destination || "").toLowerCase().includes(q) || (l.client_name || "").toLowerCase().includes(q) || (l.material || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [loads, statusFilter, search, viewRole]);
  const findBenchmark = (origin, dest) => {
    if (!origin || !dest) return null;
    const o = origin.toLowerCase();
    const d = dest.toLowerCase();
    return corridors.find(
      (c) => ((c.originCity || "").toLowerCase().includes(o) || o.includes((c.originCity || "").toLowerCase())) && ((c.destinationCity || "").toLowerCase().includes(d) || d.includes((c.destinationCity || "").toLowerCase()))
    ) || null;
  };
  const handlePostLoad = async (e) => {
    e.preventDefault();
    if (!postForm.origin.trim() || !postForm.destination.trim()) return toast.error("Origin and Destination are required");
    setSubmitting(true);
    try {
      const res = await fetch("/api/marketplace/loads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...postForm,
          max_transporter_budget: calcMaxBudget(postForm.client_rate, postForm.commission_type, postForm.commission_value)
        })
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to post load");
      toast.success(`Load ${json.load.load_code} published to Marketplace!`);
      setPostOpen(false);
      loadAll();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const handleAssignOwn = async (e) => {
    e.preventDefault();
    if (!ownForm.truck_number) return toast.error("Select a truck");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/marketplace/loads/${ownFleetLoad.id}/assign-own`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ownForm)
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Assignment failed");
      toast.success(`Assigned own truck ${ownForm.truck_number} & created Trip Log!`);
      setOwnFleetLoad(null);
      loadAll();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const handleAssignDirectTransporter = async (e) => {
    e.preventDefault();
    if (!directForm.transporter_name.trim()) return toast.error("Select or enter transporter name");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/marketplace/loads/${directTransLoad.id}/assign-transporter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(directForm)
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Assignment failed");
      toast.success(`Assigned to ${directForm.transporter_name} | Margin: \u20B9${(json.load.jbc_margin || 0).toLocaleString("en-IN")}`);
      setDirectTransLoad(null);
      loadAll();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const handleSubmitBid = async (e) => {
    e.preventDefault();
    if (!bidForm.transporter_name.trim() || !bidForm.bid_amount) return toast.error("Transporter name and quote are required");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/marketplace/loads/${bidLoad.id}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bidForm)
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to place bid");
      toast.success(`Bid of \u20B9${Number(bidForm.bid_amount).toLocaleString("en-IN")} submitted!`);
      setBidLoad(null);
      loadAll();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const handleAwardBid = async (bid) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/marketplace/bids/${bid.id}/award`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ final_rate: bid.bid_amount })
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to award bid");
      toast.success(`Awarded to ${bid.transporter_name} | Margin locked: \u20B9${(json.load.jbc_margin || 0).toLocaleString("en-IN")}`);
      setWarRoomLoad(null);
      loadAll();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const handleCounterBid = async (bid) => {
    const amt = Number(counterDrafts[bid.id] || 0);
    if (!amt) return toast.error("Enter counter-offer amount");
    try {
      const res = await fetch(`/api/marketplace/bids/${bid.id}/counter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ counter_offer_amount: amt })
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error("Counter failed");
      toast.success(`Counter-offer \u20B9${amt.toLocaleString("en-IN")} sent!`);
      loadAll();
      if (warRoomLoad) {
        setWarRoomLoad((prev) => ({
          ...prev,
          bids: (prev.bids || []).map((b) => b.id === bid.id ? { ...b, counter_offer_amount: amt, status: "Countered" } : b)
        }));
      }
    } catch (err) {
      toast.error(err.message);
    }
  };
  const handleWhatsAppBroadcast = (load) => {
    const txt = `\u{1F69A} *JAI BHAVANI CARGO - LOAD REQUIREMENT (${load.load_code})*

\u{1F4CD} *Route:* ${load.origin} \u2794 ${load.destination}
\u{1F4C5} *Pickup:* ${load.pickup_date}
\u{1F69B} *Truck Required:* ${load.vehicle_type} (${load.weight_mt} MT)
\u{1F4E6} *Material:* ${load.material}
\u{1F4B0} *Target Payout:* \u20B9${Number(load.max_transporter_budget || 0).toLocaleString("en-IN")}

Reply with your best freight quote & truck number to confirm dispatch.`;
    window.open("https://wa.me/?text=" + encodeURIComponent(txt), "_blank");
  };
  const handleDeleteLoad = async (id) => {
    if (!window.confirm("Remove this load from marketplace?")) return;
    await fetch(`/api/marketplace/loads/${id}`, { method: "DELETE" });
    toast.success("Load removed");
    loadAll();
  };
  const activeWarLoad = loads.find((l) => l.id === warRoomLoad?.id) || warRoomLoad;
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 flex-wrap" }, /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30" }, "2026 Freight Exchange"), /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" }, "Blind Pricing Protected")), /* @__PURE__ */ React.createElement("h1", { className: "text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight" }, "AI Freight Marketplace & Brokerage Desk"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-0.5" }, "Connect clients & transporters, assign your own trucks or outsource via reverse-auction bidding, and lock your commission margin.")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs" }, [
    ["admin", "Admin Control Tower"],
    ["client", "Client View"],
    ["transporter", "Transporter Board"]
  ].map(([id, lbl]) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: id,
      type: "button",
      onClick: () => setViewRole(id),
      className: `px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${viewRole === id ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"}`
    },
    lbl
  ))), viewRole !== "transporter" && /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setPostOpen(true),
      className: "px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg cursor-pointer transition"
    },
    "+ Post Load Requirement"
  ))), viewRole === "admin" && /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 rounded-2xl p-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Open Market Loads"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-white mt-1" }, kpis.openLoads), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-amber-400 font-semibold" }, kpis.totalBids, " total transporter bids")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 rounded-2xl p-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Assigned Client GMV"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-white mt-1" }, "\u20B9", kpis.totalGmv.toLocaleString("en-IN")), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-slate-400" }, "Across ", kpis.ownCount + kpis.outsourcedCount, " dispatched loads")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold text-emerald-400 uppercase" }, "Net Brokerage Margin"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-emerald-400 mt-1" }, "\u20B9", kpis.totalMargin.toLocaleString("en-IN")), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-emerald-300 font-semibold" }, "Avg ", kpis.avgMarginPct, "% spread")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 rounded-2xl p-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Fulfilment Split"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-white mt-1" }, kpis.ownCount, " Own / ", kpis.outsourcedCount, " Market"), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-blue-400 font-semibold" }, trucks.length, " trucks \u2022 ", transporters.length, " partners"))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3" }, viewRole === "admin" ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit text-xs" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setActiveSubTab("board"),
      className: `px-3.5 py-1.5 rounded-lg font-bold cursor-pointer ${activeSubTab === "board" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`
    },
    "Live Load Board & Bidding (",
    loads.length,
    ")"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setActiveSubTab("ledger"),
      className: `px-3.5 py-1.5 rounded-lg font-bold cursor-pointer ${activeSubTab === "ledger" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`
    },
    "Margin & Settlement Ledger"
  )) : /* @__PURE__ */ React.createElement("div", { className: "text-sm font-bold text-slate-300" }, viewRole === "client" ? "Your Posted Load Requirements & Live Dispatch Status" : "Live Loads Open for Reverse-Auction Bidding"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: search,
      onChange: (e) => setSearch(e.target.value),
      placeholder: "Search route, load #, client, material...",
      className: "bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white w-60 focus:outline-none focus:border-amber-500"
    }
  ), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: statusFilter,
      onChange: (e) => setStatusFilter(e.target.value),
      className: "bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
    },
    /* @__PURE__ */ React.createElement("option", { value: "all" }, "All Status"),
    /* @__PURE__ */ React.createElement("option", { value: "Bidding Open" }, "Bidding Open"),
    /* @__PURE__ */ React.createElement("option", { value: "Posted" }, "Posted"),
    /* @__PURE__ */ React.createElement("option", { value: "Assigned" }, "Assigned")
  ))), activeSubTab === "ledger" && viewRole === "admin" ? /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-xs text-left" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Load #"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Client & Route"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Fulfilment"), /* @__PURE__ */ React.createElement("th", { className: "p-3 text-right" }, "Client Rate"), /* @__PURE__ */ React.createElement("th", { className: "p-3 text-right" }, "Transporter Payout"), /* @__PURE__ */ React.createElement("th", { className: "p-3 text-right" }, "JBC Net Margin"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Status"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-800" }, loads.filter((l) => l.status === "Assigned").map((l) => {
    const cr = Number(l.client_rate) || 0;
    const mg = Number(l.jbc_margin) || 0;
    const pct = cr > 0 ? (mg / cr * 100).toFixed(1) : "0.0";
    return /* @__PURE__ */ React.createElement("tr", { key: l.id, className: "hover:bg-slate-800/40" }, /* @__PURE__ */ React.createElement("td", { className: "p-3 font-mono font-bold text-amber-400" }, l.load_code), /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-white" }, l.client_name), /* @__PURE__ */ React.createElement("div", { className: "text-slate-400" }, l.origin, " \u2794 ", l.destination)), /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${l.fulfilment_mode === "own_fleet" ? "bg-blue-500/20 text-blue-300" : "bg-purple-500/20 text-purple-300"}` }, l.fulfilment_mode === "own_fleet" ? `Own Truck: ${l.assigned_truck_number}` : `Partner: ${l.assigned_transporter_name}`)), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-right font-mono font-bold text-white" }, "\u20B9", cr.toLocaleString("en-IN")), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-right font-mono text-slate-300" }, "\u20B9", (Number(l.assigned_rate) || 0).toLocaleString("en-IN")), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-right font-mono font-black text-emerald-400" }, "\u20B9", mg.toLocaleString("en-IN"), " (", pct, "%)"), /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]" }, l.status)));
  })))) : /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, loading ? /* @__PURE__ */ React.createElement("div", { className: "col-span-full py-12 text-center text-slate-400 text-sm" }, "Loading Marketplace Exchange...") : filteredLoads.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "col-span-full py-14 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl space-y-3" }, /* @__PURE__ */ React.createElement("p", { className: "text-slate-300 font-bold" }, "No loads posted yet."), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, 'Click "+ Post Load Requirement" to create a client load and start bidding or dispatching.')) : filteredLoads.map((load) => {
    const bench = findBenchmark(load.origin, load.destination);
    const potentialMargin = load.lowest_bid != null && load.client_rate ? Math.max(0, Number(load.client_rate) - Number(load.lowest_bid)) : null;
    return /* @__PURE__ */ React.createElement("div", { key: load.id, className: "bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-lg" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 flex-wrap" }, /* @__PURE__ */ React.createElement("span", { className: "font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30" }, load.load_code), /* @__PURE__ */ React.createElement("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${load.status === "Assigned" ? "bg-emerald-500/20 text-emerald-300" : "bg-blue-500/20 text-blue-300"}` }, load.status), load.bid_count > 0 && /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300" }, load.bid_count, " Bids")), /* @__PURE__ */ React.createElement("h3", { className: "text-base sm:text-lg font-black text-white mt-1.5" }, load.origin, " ", /* @__PURE__ */ React.createElement("span", { className: "text-amber-400" }, "\u2794"), " ", load.destination), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, viewRole !== "transporter" ? `${load.client_name} \u2022 ` : "", load.vehicle_type, " \u2022 ", load.weight_mt, " MT \u2022 Pickup: ", load.pickup_date)), viewRole === "admin" && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => handleDeleteLoad(load.id), className: "text-xs text-slate-500 hover:text-rose-400 cursor-pointer" }, "\u2715")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs" }, viewRole !== "transporter" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-500 uppercase block font-bold" }, "Client Rate"), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-black text-white text-sm" }, "\u20B9", (Number(load.client_rate) || 0).toLocaleString("en-IN"))), viewRole !== "client" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-500 uppercase block font-bold" }, viewRole === "transporter" ? "Target Payout" : "Max Transporter Budget"), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-black text-amber-400 text-sm" }, "\u20B9", (Number(load.max_transporter_budget) || 0).toLocaleString("en-IN"))), viewRole === "admin" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-500 uppercase block font-bold" }, load.status === "Assigned" ? "Locked Margin" : "Best Bid Margin"), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-black text-emerald-400 text-sm" }, load.status === "Assigned" ? `\u20B9${(Number(load.jbc_margin) || 0).toLocaleString("en-IN")}` : potentialMargin !== null ? `\u20B9${potentialMargin.toLocaleString("en-IN")}` : `~${load.commission_value}${load.commission_type === "percent" ? "%" : "\u20B9"}`)), viewRole === "client" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-500 uppercase block font-bold" }, "Assigned Truck"), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold text-emerald-400" }, load.assigned_truck_number || "Matching Fleet..."))), bench && viewRole === "admin" && /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg" }, "AI Corridor Benchmark: Typical cost \u20B9", (Number(bench.typicalCost) || 0).toLocaleString("en-IN"), " \u2022 Suggested Quote \u20B9", (Number(bench.recommendedQuote) || 0).toLocaleString("en-IN")), load.status === "Assigned" ? /* @__PURE__ */ React.createElement("div", { className: "p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-center justify-between flex-wrap gap-2" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-emerald-300" }, load.fulfilment_mode === "own_fleet" ? `Own Fleet Dispatched: ${load.assigned_truck_number}` : `Awarded to ${load.assigned_transporter_name}`), load.assigned_driver_name && /* @__PURE__ */ React.createElement("span", { className: "text-slate-300 block text-[11px]" }, "Driver: ", load.assigned_driver_name, " (", load.assigned_driver_phone, ")")), load.trip_log_id && /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded" }, "Trip Created \u2713")) : viewRole === "admin" ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2 pt-1" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          setOwnFleetLoad(load);
          setOwnForm({ truck_id: "", truck_number: "", driver_id: "", driver_name: "", driver_phone: "" });
        },
        className: "px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
      },
      "Assign Own Truck"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          setDirectTransLoad(load);
          setDirectForm({ transporter_id: "", transporter_name: "", transporter_phone: "", transporter_rate: String(load.max_transporter_budget || ""), truck_number: "", driver_name: "", driver_phone: "" });
        },
        className: "px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
      },
      "Direct Assign Transporter"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setWarRoomLoad(load),
        className: "px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs cursor-pointer"
      },
      "Bidding War Room (",
      load.bid_count || 0,
      ")"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => handleWhatsAppBroadcast(load),
        className: "px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs cursor-pointer"
      },
      "WhatsApp Broadcast"
    )) : viewRole === "transporter" ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 pt-1" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          setBidLoad(load);
          setBidForm({ transporter_name: "", transporter_phone: "", bid_amount: String(load.max_transporter_budget || ""), truck_number: "", driver_name: "", driver_phone: "", eta_hours: "4", notes: "" });
        },
        className: "flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
      },
      "Place Bid / Quote Rate"
    )) : null);
  }))), postOpen && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto my-auto" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-black text-white" }, "Post Client Load Requirement"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setPostOpen(false), className: "text-slate-400 hover:text-white" }, "\u2715")), /* @__PURE__ */ React.createElement("form", { onSubmit: handlePostLoad, className: "space-y-3 text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Select Client"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: postForm.client_id,
      onChange: (e) => {
        const cl = clients.find((c) => c.id === e.target.value);
        setPostForm({ ...postForm, client_id: e.target.value, client_name: cl ? cl.company_name || cl.client_name : "" });
      },
      className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "-- Direct / New Client --"),
    clients.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.company_name || c.client_name))
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Client Name *"), /* @__PURE__ */ React.createElement("input", { required: true, value: postForm.client_name, onChange: (e) => setPostForm({ ...postForm, client_name: e.target.value }), placeholder: "e.g. Delhivery / FR8", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" }))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Origin City *"), /* @__PURE__ */ React.createElement("input", { required: true, value: postForm.origin, onChange: (e) => setPostForm({ ...postForm, origin: e.target.value }), placeholder: "Hyderabad", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Destination City *"), /* @__PURE__ */ React.createElement("input", { required: true, value: postForm.destination, onChange: (e) => setPostForm({ ...postForm, destination: e.target.value }), placeholder: "Bengaluru", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Pickup Date"), /* @__PURE__ */ React.createElement("input", { type: "date", value: postForm.pickup_date, onChange: (e) => setPostForm({ ...postForm, pickup_date: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" }))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Vehicle Required"), /* @__PURE__ */ React.createElement("select", { value: postForm.vehicle_type, onChange: (e) => setPostForm({ ...postForm, vehicle_type: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" }, VEHICLE_TYPES.map((v) => /* @__PURE__ */ React.createElement("option", { key: v, value: v }, v)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Weight (MT)"), /* @__PURE__ */ React.createElement("input", { type: "number", step: "0.5", value: postForm.weight_mt, onChange: (e) => setPostForm({ ...postForm, weight_mt: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Material"), /* @__PURE__ */ React.createElement("input", { value: postForm.material, onChange: (e) => setPostForm({ ...postForm, material: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" }))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-emerald-400 mb-1" }, "Client Freight Rate (\u20B9)"), /* @__PURE__ */ React.createElement("input", { type: "number", value: postForm.client_rate, onChange: (e) => setPostForm({ ...postForm, client_rate: e.target.value }), className: "w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-amber-400 mb-1" }, "JBC Commission (", postForm.commission_type === "percent" ? "%" : "\u20B9", ")"), /* @__PURE__ */ React.createElement("div", { className: "flex gap-1" }, /* @__PURE__ */ React.createElement("select", { value: postForm.commission_type, onChange: (e) => setPostForm({ ...postForm, commission_type: e.target.value }), className: "bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-white" }, /* @__PURE__ */ React.createElement("option", { value: "percent" }, "%"), /* @__PURE__ */ React.createElement("option", { value: "flat" }, "\u20B9")), /* @__PURE__ */ React.createElement("input", { type: "number", value: postForm.commission_value, onChange: (e) => setPostForm({ ...postForm, commission_value: e.target.value }), className: "w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold" }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-400 mb-1" }, "Max Transporter Budget"), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono font-black text-amber-400" }, "\u20B9", calcMaxBudget(postForm.client_rate, postForm.commission_type, postForm.commission_value).toLocaleString("en-IN")))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end gap-2 pt-2" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setPostOpen(false), className: "px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold" }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "submit", disabled: submitting, className: "px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold cursor-pointer" }, submitting ? "Publishing..." : "Publish Load"))))), ownFleetLoad && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 my-auto" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-black text-white" }, "Assign Own Truck (", ownFleetLoad.load_code, ")"), /* @__PURE__ */ React.createElement("form", { onSubmit: handleAssignOwn, className: "space-y-3 text-xs" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Select Fleet Truck *"), /* @__PURE__ */ React.createElement(
    "select",
    {
      required: true,
      value: ownForm.truck_id,
      onChange: (e) => {
        const tr = trucks.find((t) => t.id === e.target.value);
        setOwnForm({ ...ownForm, truck_id: e.target.value, truck_number: tr?.truck_number || "" });
      },
      className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "-- Choose Truck --"),
    trucks.map((t) => /* @__PURE__ */ React.createElement("option", { key: t.id, value: t.id }, t.truck_number, " (", t.truck_size || t.vehicle_type || "Fleet", ")"))
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Select Active Driver"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: ownForm.driver_id,
      onChange: (e) => {
        const dr = drivers.find((d) => d.id === e.target.value);
        setOwnForm({ ...ownForm, driver_id: e.target.value, driver_name: dr?.name || "", driver_phone: dr?.contact || dr?.phone || "" });
      },
      className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "-- Choose Driver --"),
    drivers.map((d) => /* @__PURE__ */ React.createElement("option", { key: d.id, value: d.id }, d.name, " (", d.role || "Driver", ")"))
  )), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end gap-2 pt-2" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setOwnFleetLoad(null), className: "px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold" }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "submit", disabled: submitting, className: "px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold cursor-pointer" }, submitting ? "Assigning..." : "Assign & Create Trip"))))), directTransLoad && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 my-auto" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-black text-white" }, "Direct Assign to Transporter (", directTransLoad.load_code, ")"), /* @__PURE__ */ React.createElement("form", { onSubmit: handleAssignDirectTransporter, className: "space-y-3 text-xs" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Pick from Contacts (Transporters / Owners)"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: directForm.transporter_id,
      onChange: (e) => {
        const tr = transporters.find((x) => x.id === e.target.value);
        setDirectForm({ ...directForm, transporter_id: e.target.value, transporter_name: tr?.company_name || "", transporter_phone: tr?.phone_number || "" });
      },
      className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "-- Select Partner or Enter Below --"),
    transporters.map((t) => /* @__PURE__ */ React.createElement("option", { key: t.id, value: t.id }, t.company_name, " (", t.phone_number, ")"))
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Transporter Name *"), /* @__PURE__ */ React.createElement("input", { required: true, value: directForm.transporter_name, onChange: (e) => setDirectForm({ ...directForm, transporter_name: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Transporter Phone"), /* @__PURE__ */ React.createElement("input", { value: directForm.transporter_phone, onChange: (e) => setDirectForm({ ...directForm, transporter_phone: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" }))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-amber-400 mb-1" }, "Agreed Transporter Rate (\u20B9) *"), /* @__PURE__ */ React.createElement("input", { type: "number", required: true, value: directForm.transporter_rate, onChange: (e) => setDirectForm({ ...directForm, transporter_rate: e.target.value }), className: "w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "block font-bold text-emerald-400 mb-1" }, "Your JBC Margin"), /* @__PURE__ */ React.createElement("div", { className: "font-mono font-black text-emerald-400 text-base pt-1" }, "\u20B9", Math.max(0, (Number(directTransLoad.client_rate) || 0) - (Number(directForm.transporter_rate) || 0)).toLocaleString("en-IN")))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Truck Number (Optional)"), /* @__PURE__ */ React.createElement("input", { value: directForm.truck_number, onChange: (e) => setDirectForm({ ...directForm, truck_number: e.target.value }), placeholder: "TS08...", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Driver Name (Optional)"), /* @__PURE__ */ React.createElement("input", { value: directForm.driver_name, onChange: (e) => setDirectForm({ ...directForm, driver_name: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" }))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end gap-2 pt-2" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setDirectTransLoad(null), className: "px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold" }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "submit", disabled: submitting, className: "px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold cursor-pointer" }, submitting ? "Assigning..." : "Assign & Lock Margin"))))), activeWarLoad && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto my-auto" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-black text-white" }, "Bidding War Room \u2014 ", activeWarLoad.load_code), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, activeWarLoad.origin, " \u2794 ", activeWarLoad.destination, " \u2022 Client Rate: \u20B9", (Number(activeWarLoad.client_rate) || 0).toLocaleString("en-IN"), " \u2022 Max Budget: \u20B9", (Number(activeWarLoad.max_transporter_budget) || 0).toLocaleString("en-IN"))), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setWarRoomLoad(null), className: "text-slate-400 hover:text-white" }, "\u2715")), (activeWarLoad.bids || []).length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "p-8 text-center text-slate-400 text-xs bg-slate-950 rounded-2xl border border-slate-800" }, 'No transporter bids yet. Switch to "Transporter Board" or share via WhatsApp Broadcast to receive quotes.') : /* @__PURE__ */ React.createElement("div", { className: "space-y-2.5" }, (activeWarLoad.bids || []).map((bid) => {
    const spread = (Number(activeWarLoad.client_rate) || 0) - (Number(bid.bid_amount) || 0);
    return /* @__PURE__ */ React.createElement("div", { key: bid.id, className: "p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-white text-sm" }, bid.transporter_name), /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold" }, bid.status)), /* @__PURE__ */ React.createElement("div", { className: "text-slate-400 font-mono mt-0.5" }, "Quote: ", /* @__PURE__ */ React.createElement("b", { className: "text-amber-400" }, "\u20B9", (Number(bid.bid_amount) || 0).toLocaleString("en-IN")), " \u2022 JBC Margin: ", /* @__PURE__ */ React.createElement("b", { className: "text-emerald-400" }, "\u20B9", spread.toLocaleString("en-IN"))), bid.truck_number && /* @__PURE__ */ React.createElement("div", { className: "text-slate-500 text-[11px]" }, "Truck: ", bid.truck_number, " \u2022 ETA: ", bid.eta_hours, "h")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        placeholder: "Counter \u20B9",
        value: counterDrafts[bid.id] || "",
        onChange: (e) => setCounterDrafts({ ...counterDrafts, [bid.id]: e.target.value }),
        className: "w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono text-xs"
      }
    ), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => handleCounterBid(bid), className: "px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer" }, "Counter"), /* @__PURE__ */ React.createElement("button", { type: "button", disabled: submitting, onClick: () => handleAwardBid(bid), className: "px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold cursor-pointer" }, "Award & Create Trip")));
  })))), bidLoad && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 my-auto" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-black text-white" }, "Submit Bid \u2014 ", bidLoad.load_code), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, bidLoad.origin, " \u2794 ", bidLoad.destination, " \u2022 Target Payout: \u20B9", (Number(bidLoad.max_transporter_budget) || 0).toLocaleString("en-IN")), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmitBid, className: "space-y-3 text-xs" }, /* @__PURE__ */ React.createElement("input", { required: true, value: bidForm.transporter_name, onChange: (e) => setBidForm({ ...bidForm, transporter_name: e.target.value }), placeholder: "Transporter / Company Name *", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" }), /* @__PURE__ */ React.createElement("input", { required: true, value: bidForm.transporter_phone, onChange: (e) => setBidForm({ ...bidForm, transporter_phone: e.target.value }), placeholder: "Mobile Number *", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" }), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("input", { type: "number", required: true, value: bidForm.bid_amount, onChange: (e) => setBidForm({ ...bidForm, bid_amount: e.target.value }), placeholder: "Your Quote (\u20B9) *", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold" }), /* @__PURE__ */ React.createElement("input", { value: bidForm.truck_number, onChange: (e) => setBidForm({ ...bidForm, truck_number: e.target.value }), placeholder: "Truck Number", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" })), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end gap-2 pt-2" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setBidLoad(null), className: "px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold" }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "submit", disabled: submitting, className: "px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer" }, submitting ? "Submitting..." : "Submit Bid"))))));
}
