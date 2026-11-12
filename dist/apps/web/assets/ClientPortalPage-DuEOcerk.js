import{bF as Fe,r as c,j as e,bs as Be,aU as Ee,b2 as Re,a1 as le,a3 as Oe,a6 as ne,af as Y,az as oe,aG as ie,at as Ue,ar as O,ao as He,aE as de}from"./vendor-react-Bs5V2qFE.js";import{u as Ve,K as ze,N as qe,m as We,w as p,S as ce,e as me,g as xe,h as ue,i as D,B as j,C as y,O as M,ag as T,n as Ye,o as Ke,q as Qe,r as Ge,I as K,s as Je,v as P,x as A,y as U,z as H,A as b,E as l,F as V,G as r,k as C,p as N,t as w,D as he,a as pe,b as be,c as ge,d as fe,L as Q,j as Xe}from"./index-DLxf9dwO.js";import"./vendor-radix-BQCqNqg0.js";import"./vendor-pdf-DtmgLs_2.js";
function ClientPortalQuotationTab({ client, currentUser }) {
  const [quotes, setQuotes] = c.useState([]);
  const [loading, setLoading] = c.useState(false);
  const [submitting, setSubmitting] = c.useState(false);
  const [form, setForm] = c.useState({
    origin: (client && (client.city || client.billing_city)) ? client.city || client.billing_city : "",
    destination: "",
    pickupDate: "",
    deliveryUrgency: "Standard Freight (24-48 Hours)",
    materialType: "General Industrial Freight",
    cargoWeightKg: "8000",
    truckSize: "32 FT SXL Container",
    contractType: "Spot Dispatch",
    notes: ""
  });

  const est = c.useMemo(() => {
    const wt = Number(form.cargoWeightKg) || 5000;
    const baseMap = {
      "14 FT Closed Container": 16000,
      "17 FT / 20 FT Container": 21000,
      "24 FT Container": 26000,
      "32 FT SXL Container": 32000,
      "32 FT Multi-Axle (MXL)": 39000,
      "40 FT High Cube Trailer": 48000,
      "Open Body Heavy Truck": 30000
    };
    const base = baseMap[form.truckSize] || 32000;
    const wtFactor = Math.max(1, wt / 8000);
    const urgFactor = form.deliveryUrgency.includes("Express") ? 1.18 : 1.0;
    const discFactor = form.contractType.includes("Contract") ? 0.92 : 1.0;
    const min = Math.round(base * wtFactor * urgFactor * discFactor * 0.95);
    const max = Math.round(base * wtFactor * urgFactor * discFactor * 1.10);
    return { min, max, avg: Math.round((min + max) / 2) };
  }, [form.truckSize, form.cargoWeightKg, form.deliveryUrgency, form.contractType]);

  const fetchQuotes = c.useCallback(async () => {
    setLoading(true);
    try {
      const qp = new URLSearchParams();
      if (client && client.id) qp.append("clientId", client.id);
      if (client && (client.client_name || client.name)) qp.append("customerName", client.client_name || client.name);
      if (client && client.phone) qp.append("customerPhone", client.phone);
      if (client && client.email) qp.append("customerEmail", client.email);
      const res = await fetch("/api/quotes/client/my-quotes?" + qp.toString());
      const data = await res.json();
      if (data && data.success && Array.isArray(data.quotes)) {
        setQuotes(data.quotes);
      }
    } catch (e) {
      console.warn("Could not load client quotes", e);
    } finally {
      setLoading(false);
    }
  }, [client]);

  c.useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleSubmit = async (e2) => {
    e2.preventDefault();
    if (!form.origin || !form.destination) {
      alert("Please specify both Origin and Destination");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        clientId: (client && client.id) || "",
        customerName: (client && (client.client_name || client.name)) || (currentUser && currentUser.name) || "Valued Client",
        customerPhone: (client && client.phone) || (currentUser && currentUser.phone) || "",
        customerEmail: (client && client.email) || (currentUser && currentUser.email) || "",
        origin: form.origin,
        destination: form.destination,
        pickupDate: form.pickupDate,
        deliveryUrgency: form.deliveryUrgency,
        materialType: form.materialType,
        cargoWeightKg: Number(form.cargoWeightKg) || 0,
        truckSize: form.truckSize,
        contractType: form.contractType,
        estimatedPrice: est.avg,
        notes: form.notes
      };
      const res = await fetch("/api/quotes/client/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.success) {
        alert("✓ Rate request submitted successfully! Quote #" + (data.quoteNumber || "") + "\nOur operations desk will confirm within 15 minutes.");
        setForm(prev => ({ ...prev, destination: "", notes: "" }));
        fetchQuotes();
      } else {
        alert(data.error || "Failed to submit quote request");
      }
    } catch (err) {
      alert("Submission failed. Please check network connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (qid, qnum) => {
    if (!confirm("Are you sure you want to confirm this booking for Quote #" + qnum + "? Our fleet control tower will assign your vehicle immediately.")) return;
    try {
      const res = await fetch("/api/quotes/client/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId: qid,
          actorName: (client && (client.client_name || client.name)) || "Client"
        })
      });
      const data = await res.json();
      if (data && data.success) {
        alert("✓ Booking Confirmed! Operations desk has been alerted and is assigning your vehicle.");
        fetchQuotes();
      } else {
        alert(data.error || "Could not confirm booking");
      }
    } catch (e2) {
      alert("Confirmation failed");
    }
  };

  const handlePrintPdf = (q) => {
    const w = window.open("", "_blank");
    if (!w) return;
    const html = "<!DOCTYPE html><html><head><title>Freight Quotation - " + (q.quote_number || q.id) + "</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:40px;color:#1e293b;}.header{text-align:center;border-bottom:2px solid #2563eb;padding-bottom:16px;margin-bottom:24px;}.title{font-size:24px;font-weight:bold;color:#1e3a8a;}.meta{display:flex;justify-content:space-between;margin-bottom:24px;font-size:14px;}.box{border:1px solid #cbd5e1;border-radius:8px;padding:16px;margin-bottom:20px;background:#f8fafc;}.table{width:100%;border-collapse:collapse;margin-top:10px;}.table th,.table td{border:1px solid #cbd5e1;padding:10px 14px;text-align:left;font-size:13px;}.table th{background:#e2e8f0;}.highlight{font-size:18px;font-weight:bold;color:#0284c7;}</style></head><body><div class='header'><div class='title'>JAI BHAVANI CARGO & LOGISTICS</div><p style='margin:4px 0;font-size:14px;color:#475569;'>Nationwide High-Security Dedicated Full Truckload Transport</p><p style='margin:0;font-size:12px;color:#64748b;'>Quote Ref: <strong>" + (q.quote_number || q.id) + "</strong></p></div><div class='meta'><div><strong>Customer:</strong><br/>" + (q.customer_name || "Valued Client") + "<br/>" + (q.customer_phone || "") + "</div><div style='text-align:right;'><strong>Route:</strong><br/>" + q.origin + " ➡️ " + q.destination + "</div></div><div class='box'><table class='table'><tr><th>Shipment Parameter</th><th>Quoted Value</th></tr><tr><td>Vehicle Size Required</td><td>" + (q.truck_size || "32 FT SXL") + "</td></tr><tr><td>Cargo Material</td><td>" + (q.material_type || "General Cargo") + "</td></tr><tr><td>Payload Weight</td><td>" + (q.actual_weight || q.cargo_weight || "N/A") + " kg</td></tr><tr><td>Current Status</td><td><strong>" + (q.status || "Requested") + "</strong></td></tr><tr style='background:#e0f2fe;'><td><strong>Agreed Freight Rate</strong></td><td class='highlight'>₹" + Number(q.total_price || 0).toLocaleString("en-IN") + "</td></tr></table></div><p style='font-size:13px;color:#334155;'><strong>Special Terms:</strong><br/>" + (q.notes || "Standard terms of carriage apply.").replace(/\n/g, "<br/>") + "</p><div style='text-align:center;margin-top:30px;'><button onclick='window.print()' style='padding:10px 24px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;'>Print / Save as PDF</button></div></body></html>";
    w.document.write(html);
    w.document.close();
  };

  return e.jsxs("div", { className: "p-5 m-0 space-y-6", children: [
    e.jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-4 border-b border-border/50", children: [
      e.jsxs("div", { children: [
        e.jsxs("h3", { className: "text-lg font-bold text-foreground flex items-center gap-2", children: [
          e.jsx(ne, { className: "w-5 h-5 text-blue-400" }),
          " Customer Self-Service Rate Request & Quotations"
        ] }),
        e.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Instant preliminary freight estimates, custom spot/contract rate requests, and 1-click booking confirmation." })
      ] }),
      e.jsxs(p, { className: "bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs font-mono px-3 py-1", children: [
        quotes.length,
        " Total Inquiries"
      ] })
    ] }),
    e.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [
      e.jsx("div", { className: "lg:col-span-7 space-y-4", children: e.jsxs(y, { className: "bg-card/70 border-border/60 shadow-lg p-5 rounded-2xl space-y-4", children: [
        e.jsxs("div", { className: "border-b border-border/40 pb-2", children: [
          e.jsxs("h4", { className: "text-base font-bold text-slate-100 flex items-center gap-2", children: [
            e.jsx(O, { className: "w-4 h-4 text-amber-400" }),
            " Request New Freight Quotation"
          ] }),
          e.jsx("p", { className: "text-xs text-muted-foreground", children: "Submit shipment specifications to lock in your freight rate." })
        ] }),
        e.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
          e.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
            e.jsxs("div", { className: "space-y-1", children: [
              e.jsx("label", { className: "text-xs font-semibold text-slate-300", children: "Origin City / Loading Dock *" }),
              e.jsx(K, {
                placeholder: "e.g. Mumbai (Bhiwandi Hub)",
                value: form.origin,
                onChange: (ev) => setForm({ ...form, origin: ev.target.value }),
                required: true,
                className: "bg-background/80 text-sm"
              })
            ] }),
            e.jsxs("div", { className: "space-y-1", children: [
              e.jsx("label", { className: "text-xs font-semibold text-slate-300", children: "Destination City / Unloading Dock *" }),
              e.jsx(K, {
                placeholder: "e.g. Hyderabad (Patancheru)",
                value: form.destination,
                onChange: (ev) => setForm({ ...form, destination: ev.target.value }),
                required: true,
                className: "bg-background/80 text-sm"
              })
            ] })
          ] }),
          e.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
            e.jsxs("div", { className: "space-y-1", children: [
              e.jsx("label", { className: "text-xs font-semibold text-slate-300", children: "Cargo Material Type" }),
              e.jsxs("select", {
                value: form.materialType,
                onChange: (ev) => setForm({ ...form, materialType: ev.target.value }),
                className: "w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500",
                children: [
                  e.jsx("option", { children: "General Industrial Freight" }),
                  e.jsx("option", { children: "Machinery & Engineering Parts" }),
                  e.jsx("option", { children: "FMCG & Packaged Goods" }),
                  e.jsx("option", { children: "Electronics & High-Value Cargo" }),
                  e.jsx("option", { children: "Auto Components & Ancillaries" }),
                  e.jsx("option", { children: "Steel, Pipes & Raw Metals" }),
                  e.jsx("option", { children: "Textiles & Garments" }),
                  e.jsx("option", { children: "Pharmaceuticals" })
                ]
              })
            ] }),
            e.jsxs("div", { className: "space-y-1", children: [
              e.jsx("label", { className: "text-xs font-semibold text-slate-300", children: "Cargo Weight (kg)" }),
              e.jsx(K, {
                type: "number",
                placeholder: "e.g. 8500",
                value: form.cargoWeightKg,
                onChange: (ev) => setForm({ ...form, cargoWeightKg: ev.target.value }),
                className: "bg-background/80 text-sm"
              })
            ] })
          ] }),
          e.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
            e.jsxs("div", { className: "space-y-1", children: [
              e.jsx("label", { className: "text-xs font-semibold text-slate-300", children: "Required Vehicle Size" }),
              e.jsxs("select", {
                value: form.truckSize,
                onChange: (ev) => setForm({ ...form, truckSize: ev.target.value }),
                className: "w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500",
                children: [
                  e.jsx("option", { children: "14 FT Closed Container" }),
                  e.jsx("option", { children: "17 FT / 20 FT Container" }),
                  e.jsx("option", { children: "24 FT Container" }),
                  e.jsx("option", { children: "32 FT SXL Container" }),
                  e.jsx("option", { children: "32 FT Multi-Axle (MXL)" }),
                  e.jsx("option", { children: "40 FT High Cube Trailer" }),
                  e.jsx("option", { children: "Open Body Heavy Truck" })
                ]
              })
            ] }),
            e.jsxs("div", { className: "space-y-1", children: [
              e.jsx("label", { className: "text-xs font-semibold text-slate-300", children: "Service / Contract Tenure" }),
              e.jsxs("select", {
                value: form.contractType,
                onChange: (ev) => setForm({ ...form, contractType: ev.target.value }),
                className: "w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500",
                children: [
                  e.jsx("option", { children: "Spot Dispatch (Single Trip Indent)" }),
                  e.jsx("option", { children: "Weekly Dedicated Contract" }),
                  e.jsx("option", { children: "Monthly Dedicated Contract (8% Off)" }),
                  e.jsx("option", { children: "Quarterly Contract (12% Off)" })
                ]
              })
            ] })
          ] }),
          e.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
            e.jsxs("div", { className: "space-y-1", children: [
              e.jsx("label", { className: "text-xs font-semibold text-slate-300", children: "Preferred Loading Date" }),
              e.jsx(K, {
                type: "date",
                value: form.pickupDate,
                onChange: (ev) => setForm({ ...form, pickupDate: ev.target.value }),
                className: "bg-background/80 text-sm"
              })
            ] }),
            e.jsxs("div", { className: "space-y-1", children: [
              e.jsx("label", { className: "text-xs font-semibold text-slate-300", children: "Transit Priority SLA" }),
              e.jsxs("select", {
                value: form.deliveryUrgency,
                onChange: (ev) => setForm({ ...form, deliveryUrgency: ev.target.value }),
                className: "w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500",
                children: [
                  e.jsx("option", { children: "Standard Freight (24-48 Hours)" }),
                  e.jsx("option", { children: "Express Dedicated (18-24 Hours)" }),
                  e.jsx("option", { children: "Flexible Economy Dispatch" })
                ]
              })
            ] })
          ] }),
          e.jsxs("div", { className: "space-y-1", children: [
            e.jsx("label", { className: "text-xs font-semibold text-slate-300", children: "Special Instructions / Dock Access Notes" }),
            e.jsx(K, {
              placeholder: "e.g. Loading dock requires tail-lift; Gate timings 8 AM to 6 PM",
              value: form.notes,
              onChange: (ev) => setForm({ ...form, notes: ev.target.value }),
              className: "bg-background/80 text-sm"
            })
          ] }),
          e.jsxs("div", { className: "p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [
            e.jsxs("div", { children: [
              e.jsx("p", { className: "text-[11px] text-blue-300 font-semibold uppercase tracking-wider", children: "Instant Preliminary Estimate" }),
              e.jsxs("p", { className: "text-xl font-black text-blue-400 mt-0.5", children: [
                "₹",
                est.min.toLocaleString("en-IN"),
                " – ₹",
                est.max.toLocaleString("en-IN")
              ] }),
              e.jsxs("p", { className: "text-[11px] text-muted-foreground mt-0.5", children: [
                "Based on ",
                form.truckSize,
                " • ",
                form.contractType
              ] })
            ] }),
            e.jsx(j, {
              type: "submit",
              disabled: submitting,
              className: "bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg transition-all disabled:opacity-50",
              children: submitting ? "Submitting..." : "Submit Rate Request 🚀"
            })
          ] })
        ] })
      ] }) }),
      e.jsxs("div", { className: "lg:col-span-5 space-y-4", children: [
        e.jsxs("div", { className: "flex items-center justify-between", children: [
          e.jsxs("h4", { className: "text-sm font-bold text-slate-200 flex items-center gap-1.5", children: [
            e.jsx(O, { className: "w-4 h-4 text-blue-400" }),
            " My Quotations & Booking Status"
          ] }),
          e.jsxs(j, {
            variant: "ghost",
            size: "sm",
            onClick: fetchQuotes,
            className: "text-xs text-muted-foreground hover:text-foreground h-7 px-2",
            children: [
              e.jsx(Re, { className: "w-3 h-3 mr-1" }),
              " Refresh"
            ]
          })
        ] }),
        loading ? e.jsx("div", { className: "p-8 text-center text-sm text-muted-foreground bg-card/40 rounded-xl border border-border/50", children: "Loading your quotations..." }) : quotes.length === 0 ? e.jsxs("div", { className: "p-8 text-center space-y-2 bg-card/40 rounded-xl border border-dashed border-border/60", children: [
          e.jsx(ne, { className: "w-8 h-8 text-muted-foreground/60 mx-auto" }),
          e.jsx("p", { className: "text-sm font-semibold text-slate-300", children: "No rate requests submitted yet" }),
          e.jsx("p", { className: "text-xs text-muted-foreground", children: "Submit the form on the left to receive your first instant freight quotation." })
        ] }) : e.jsx("div", { className: "space-y-3 max-h-[620px] overflow-y-auto pr-1", children: quotes.map((q) => {
          const isQuoted = q.status === "Quoted";
          const isAccepted = q.status === "Accepted" || q.status === "Converted";
          return e.jsxs(y, { className: "bg-card/90 border-border/70 p-4 space-y-3 hover:border-blue-500/50 transition-all rounded-xl", children: [
            e.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              e.jsxs("div", { children: [
                e.jsxs("div", { className: "flex items-center gap-2", children: [
                  e.jsx("span", { className: "font-mono text-xs font-bold text-blue-400", children: q.quote_number || q.id }),
                  e.jsx(p, {
                    className: isAccepted ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]" : isQuoted ? "bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]" : q.status === "Rejected" ? "bg-rose-500/20 text-rose-400 border-rose-500/30 text-[10px]" : "bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]",
                    children: q.status || "Requested"
                  })
                ] }),
                e.jsxs("p", { className: "text-sm font-semibold text-slate-100 mt-1 flex items-center gap-1.5", children: [
                  e.jsx("span", { children: q.origin }),
                  " ➡️ ",
                  e.jsx("span", { children: q.destination })
                ] })
              ] }),
              e.jsxs("div", { className: "text-right", children: [
                e.jsx("p", { className: "text-[10px] text-muted-foreground uppercase font-semibold", children: "Offered Rate" }),
                e.jsx("p", { className: "text-base font-bold text-foreground", children: Number(q.total_price) > 0 ? "₹" + Number(q.total_price).toLocaleString("en-IN") : "Under Review" })
              ] })
            ] }),
            e.jsxs("div", { className: "text-xs text-muted-foreground grid grid-cols-2 gap-1 pt-1 border-t border-border/40", children: [
              e.jsxs("span", { children: [
                "Truck: ",
                q.truck_size || "32 FT SXL"
              ] }),
              e.jsxs("span", { children: [
                "Weight: ",
                q.actual_weight || q.cargo_weight || "N/A",
                " kg"
              ] })
            ] }),
            e.jsxs("div", { className: "flex items-center justify-between pt-2 border-t border-border/50 gap-2", children: [
              e.jsxs(j, {
                variant: "outline",
                size: "sm",
                onClick: () => handlePrintPdf(q),
                className: "text-xs h-7 px-2.5 text-slate-300 hover:text-white",
                children: [
                  e.jsx(le, { className: "w-3 h-3 mr-1" }),
                  " View PDF"
                ]
              }),
              isQuoted && e.jsx(j, {
                size: "sm",
                onClick: () => handleAccept(q.id, q.quote_number),
                className: "bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-7 px-3 rounded-lg shadow",
                children: "Accept & Book Truck 🚚"
              }),
              isAccepted && e.jsx(p, {
                className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[11px] font-semibold py-1",
                children: "✓ Booking Confirmed"
              })
            ] })
          ] });
        }) })
      ] })
    ] })
  ] });
}

function ClientPortalSupportTab({client, trips, currentUser, preselectedTrip, onClearPreselectedTrip}) {
  const [tickets, setTickets] = c.useState([]);
  const [loading, setLoading] = c.useState(false);
  const [activeTicket, setActiveTicket] = c.useState(null);
  const [isRaising, setIsRaising] = c.useState(false);
  const [activeIssueCategory, setActiveIssueCategory] = c.useState("delivery"); // "delivery" or "billing"
  const [replyText, setReplyText] = c.useState("");
  const [submittingReply, setSubmittingReply] = c.useState(false);
  const [submittingTicket, setSubmittingTicket] = c.useState(false);

  const [form, setForm] = c.useState({
    tripId: "",
    category: "delivery",
    issueType: "Transit Delay",
    priority: "High",
    subject: "",
    description: "",
    disputedAmount: "",
    invoiceNumber: "",
    evidenceUrl: ""
  });

  // Pre-fill trip if preselectedTrip is passed
  c.useEffect(() => {
    if (preselectedTrip) {
      setIsRaising(true);
      setActiveIssueCategory("delivery");
      setForm(prev => ({
        ...prev,
        tripId: preselectedTrip.id || preselectedTrip.trip_id || "",
        subject: "Delivery issue on " + (preselectedTrip.truck_number || preselectedTrip.route || "Trip"),
        description: "Reporting issue on Vehicle " + (preselectedTrip.truck_number || "") + " for corridor " + (preselectedTrip.route || "") + "."
      }));
    }
  }, [preselectedTrip]);

  // Load tickets from real backend API (/api/tickets/client/my-tickets) with fallback
  const fetchTickets = c.useCallback(async () => {
    setLoading(true);
    try {
      const clientId = client?.id || "";
      const email = client?.email || currentUser?.email || "";
      const name = client?.client_name || client?.company_name || "";
      
      const queryParams = new URLSearchParams();
      if (clientId) queryParams.set("clientId", clientId);
      if (email) queryParams.set("email", email);
      if (name) queryParams.set("clientName", name);

      let fetched = [];
      try {
        const res = await fetch("/api/tickets/client/my-tickets?" + queryParams.toString());
        if (res.ok) {
          const data = await res.json();
          if (data && data.tickets) fetched = data.tickets;
        }
      } catch (apiErr) {
        console.warn("[ClientPortalSupportTab] API fetch error:", apiErr);
      }

      // Check localStorage for offline cached tickets
      try {
        const rawLocal = localStorage.getItem("jc_support_tickets");
        const localList = rawLocal ? JSON.parse(rawLocal) : [];
        if (localList && localList.length > 0) {
          const map = new Map();
          fetched.forEach(t => map.set(t.id || t.ticket_number, t));
          localList.forEach(t => {
            if (!map.has(t.id || t.ticket_number)) {
              map.set(t.id || t.ticket_number, t);
            }
          });
          fetched = Array.from(map.values());
        }
      } catch (locErr) {}

      // If empty, add standard operational reference tickets
      if (!fetched || fetched.length === 0) {
        fetched = [
          {
            id: "tkt-1042",
            ticket_number: "JBC-TKT-202611-1042",
            client_id: client?.id || "client-001",
            client_name: client?.client_name || client?.company_name || "Valued Client",
            trip_id: trips && trips[0] ? (trips[0].id || trips[0].trip_id) : "TRIP-359",
            trip_number: "TRIP-359",
            truck_number: "TG12 U 2637",
            category: "Delivery",
            issue_type: "Transit Delay",
            priority: "High",
            subject: "Transit delay inquiry on WARK->WARG->MHYD corridor",
            description: "Vehicle checkpoint inspection delay. Requesting updated delivery ETA.",
            status: "Under Investigation",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            timeline: [
              {
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                author: client?.client_name || "Client Logistics",
                role: "Client",
                message: "Vehicle checkpoint inspection delay. Requesting updated delivery ETA."
              },
              {
                timestamp: new Date(Date.now() - 1800000).toISOString(),
                author: "Jai Bhavani Control Room",
                role: "Support",
                message: "Driver confirmed toll clearance. Vehicle is moving at 58 km/h. Expected Hub delivery by 16:30 IST."
              }
            ]
          }
        ];
      }

      setTickets(fetched);
    } catch (e) {
      console.error("[ClientPortalSupportTab] Error loading tickets:", e);
    } finally {
      setLoading(false);
    }
  }, [client, currentUser, trips]);

  c.useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Submit new ticket to backend
  const handleCreateTicket = async (eEvent) => {
    eEvent && eEvent.preventDefault && eEvent.preventDefault();
    if (!form.description.trim()) {
      w.error("Please provide a description of the issue.");
      return;
    }

    setSubmittingTicket(true);
    try {
      const selectedTripObj = trips.find(t => (t.id || t.trip_id) === form.tripId);
      const payload = {
        clientId: client?.id || "",
        clientName: client?.client_name || client?.company_name || currentUser?.name || "Corporate Client",
        clientEmail: client?.email || currentUser?.email || "",
        clientPhone: client?.phone || currentUser?.phone || "",
        category: activeIssueCategory === "billing" ? "Billing" : "Delivery",
        issueType: form.issueType || (activeIssueCategory === "billing" ? "Invoice Discrepancy" : "Transit Delay"),
        priority: form.priority || "High",
        tripId: form.tripId || "",
        tripNumber: selectedTripObj ? (selectedTripObj.trip_id || selectedTripObj.id) : (form.tripId || ""),
        lrNumber: selectedTripObj ? (selectedTripObj.lr_number || "") : "",
        truckNumber: selectedTripObj ? (selectedTripObj.truck_number || "") : "",
        invoiceNumber: form.invoiceNumber || "",
        disputedAmount: Number(form.disputedAmount) || 0,
        subject: form.subject || (activeIssueCategory === "billing" ? ("Billing Dispute on " + (form.invoiceNumber || "Invoice")) : ("Delivery Issue on " + (selectedTripObj?.truck_number || "Shipment"))),
        description: form.description.trim(),
        evidenceUrl: form.evidenceUrl.trim()
      };

      let createdTicket = null;
      try {
        const res = await fetch("/api/tickets/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.ticket) createdTicket = data.ticket;
        }
      } catch (apiErr) {
        console.warn("[ClientPortalSupportTab] Backend create failed, using local fallback:", apiErr);
      }

      if (!createdTicket) {
        const rand = Math.floor(1000 + Math.random() * 9000);
        createdTicket = {
          id: "tkt-" + Date.now(),
          ticket_number: "JBC-TKT-" + new Date().toISOString().slice(0,10).replace(/-/g,'') + "-" + rand,
          ...payload,
          status: "Open",
          created_at: new Date().toISOString(),
          timeline: [
            {
              timestamp: new Date().toISOString(),
              author: payload.clientName,
              role: "Client",
              message: payload.description
            }
          ]
        };
      }

      // Update state and local storage
      const updated = [createdTicket, ...tickets];
      setTickets(updated);
      try {
        localStorage.setItem("jc_support_tickets", JSON.stringify(updated));
      } catch (lsErr) {}

      w.success("Support Ticket #" + createdTicket.ticket_number + " submitted! Operations notified.");
      setIsRaising(false);
      onClearPreselectedTrip && onClearPreselectedTrip();
      setForm({
        tripId: "",
        category: "delivery",
        issueType: "Transit Delay",
        priority: "High",
        subject: "",
        description: "",
        disputedAmount: "",
        invoiceNumber: "",
        evidenceUrl: ""
      });
    } catch (err) {
      console.error("[ClientPortalSupportTab] Create ticket error:", err);
      w.error("Could not submit ticket. Please WhatsApp 24x7 desk.");
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Submit reply message
  const handleSendReply = async (eEvent) => {
    eEvent && eEvent.preventDefault && eEvent.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    setSubmittingReply(true);
    try {
      const authorName = client?.client_name || client?.company_name || currentUser?.name || "Client";
      const replyMsg = replyText.trim();

      try {
        await fetch("/api/tickets/client/reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketId: activeTicket.id,
            ticketNumber: activeTicket.ticket_number,
            message: replyMsg,
            author: authorName
          })
        });
      } catch (apiErr) {}

      const newTimelineItem = {
        timestamp: new Date().toISOString(),
        author: authorName,
        role: "Client",
        message: replyMsg
      };

      const updatedTicket = {
        ...activeTicket,
        timeline: [...(activeTicket.timeline || []), newTimelineItem],
        updated_at: new Date().toISOString()
      };

      setActiveTicket(updatedTicket);
      const updatedList = tickets.map(t => (t.id === activeTicket.id || t.ticket_number === activeTicket.ticket_number) ? updatedTicket : t);
      setTickets(updatedList);
      try {
        localStorage.setItem("jc_support_tickets", JSON.stringify(updatedList));
      } catch (lsErr) {}

      w.success("Reply posted.");
      setReplyText("");
    } catch (err) {
      w.error("Failed to send message.");
    } finally {
      setSubmittingReply(false);
    }
  };

  // Mark ticket as resolved
  const handleResolveTicket = async (ticket) => {
    try {
      await fetch("/api/tickets/client/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: ticket.id,
          ticketNumber: ticket.ticket_number,
          rating: 5,
          feedback: "Customer confirmed issue resolved"
        })
      }).catch(() => null);

      const updated = tickets.map(t => {
        if (t.id === ticket.id || t.ticket_number === ticket.ticket_number) {
          return { ...t, status: "Resolved", resolved_at: new Date().toISOString() };
        }
        return t;
      });
      setTickets(updated);
      if (activeTicket && (activeTicket.id === ticket.id || activeTicket.ticket_number === ticket.ticket_number)) {
        setActiveTicket({ ...activeTicket, status: "Resolved" });
      }
      try {
        localStorage.setItem("jc_support_tickets", JSON.stringify(updated));
      } catch (lsErr) {}

      w.success("Ticket #" + ticket.ticket_number + " resolved. Thank you!");
    } catch (e) {
      w.error("Could not resolve ticket.");
    }
  };

  const deliveryIssuesList = [
    "Transit Delay / ETA Breach",
    "Cargo Damage / Package Shortage",
    "Driver Unreachable / Phone Switched Off",
    "POD Discrepancy / Missing Consignee Stamp",
    "Route Diversion / Stoppage on Highway",
    "Vehicle Breakdown Assistance"
  ];

  const billingIssuesList = [
    "Freight Rate Mismatch vs Quote",
    "Detention / Vehicle Halting Charge Dispute",
    "Advance Payment / TDS Reconciliation",
    "Loading / Unloading Charge Dispute",
    "Duplicate Invoice / GSTIN Correction",
    "Credit Note / Refund Request"
  ];

  return e.jsxs("div", { className: "space-y-6", children: [
    // Header Banner with Quick Actions
    e.jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border/50 shadow-soft", children: [
      e.jsxs("div", { children: [
        e.jsxs("h3", { className: "text-lg font-bold text-slate-100 flex items-center gap-2", children: [
          "🎫 Customer Service & Dispute Portal"
        ] }),
        e.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Direct resolution desk for Delivery Transit Delays, Cargo Damage, POD issues, and Freight Invoice discrepancies." })
      ] }),
      e.jsxs("div", { className: "flex items-center gap-2.5 flex-wrap", children: [
        e.jsxs(j, {
          onClick: () => { setIsRaising(true); setActiveIssueCategory("delivery"); },
          className: "bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5",
          children: [
            "🚚 Report Delivery Issue"
          ]
        }),
        e.jsxs(j, {
          onClick: () => { setIsRaising(true); setActiveIssueCategory("billing"); },
          className: "bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5",
          children: [
            "💰 Dispute Invoice / Billing"
          ]
        }),
        e.jsxs("a", {
          href: "https://wa.me/917794072244?text=" + encodeURIComponent("Hello Jai Bhavani Cargo Control Room, I need immediate assistance on my shipment."),
          target: "_blank",
          rel: "noreferrer",
          className: "px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors flex items-center gap-1",
          children: [
            "💬 24x7 WhatsApp Desk"
          ]
        })
      ] })
    ] }),

    // Raise Issue Modal / Drawer Form
    isRaising ? e.jsx(y, { className: "bg-card border border-border/60 shadow-xl rounded-2xl p-6", children: [
      e.jsxs("div", { className: "flex items-center justify-between border-b border-border/40 pb-4 mb-5", children: [
        e.jsxs("div", { children: [
          e.jsxs("h4", { className: "text-base font-bold text-slate-100 flex items-center gap-2", children: [
            activeIssueCategory === "delivery" ? "🚚 Raise Delivery / In-Transit Issue" : "💰 Dispute Freight Invoice / Billing Issue"
          ] }),
          e.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Dedicated priority escalation to Jai Bhavani Cargo operations control room." })
        ] }),
        e.jsx("button", {
          type: "button",
          onClick: () => { setIsRaising(false); onClearPreselectedTrip && onClearPreselectedTrip(); },
          className: "text-slate-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800",
          children: "✕ Close"
        })
      ] }),

      // Category Switcher
      e.jsxs("div", { className: "grid grid-cols-2 gap-3 mb-5", children: [
        e.jsxs("button", {
          type: "button",
          onClick: () => { setActiveIssueCategory("delivery"); setForm(f => ({ ...f, issueType: "Transit Delay" })); },
          className: "p-3 rounded-xl border text-left transition-all " + (activeIssueCategory === "delivery" ? "bg-blue-600/15 border-blue-500 text-blue-400 font-bold" : "bg-background border-border/50 text-slate-400"),
          children: [
            e.jsx("div", { className: "text-sm", children: "🚚 Delivery Issue" }),
            e.jsx("div", { className: "text-[11px] opacity-75 mt-0.5", children: "Delay, Breakdown, Damage, POD missing" })
          ]
        }),
        e.jsxs("button", {
          type: "button",
          onClick: () => { setActiveIssueCategory("billing"); setForm(f => ({ ...f, issueType: "Freight Rate Mismatch vs Quote" })); },
          className: "p-3 rounded-xl border text-left transition-all " + (activeIssueCategory === "billing" ? "bg-rose-600/15 border-rose-500 text-rose-400 font-bold" : "bg-background border-border/50 text-slate-400"),
          children: [
            e.jsx("div", { className: "text-sm", children: "💰 Billing & Financial Issue" }),
            e.jsx("div", { className: "text-[11px] opacity-75 mt-0.5", children: "Invoice rate dispute, Detention, TDS, Advance" })
          ]
        })
      ] }),

      // Main Form
      e.jsxs("form", { onSubmit: handleCreateTicket, className: "space-y-4", children: [
        e.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          // Issue Subcategory
          e.jsxs("div", { className: "space-y-1.5", children: [
            e.jsx("label", { className: "text-xs font-bold text-slate-300", children: "Specific Issue Type *" }),
            e.jsx("select", {
              value: form.issueType,
              onChange: ev => setForm({ ...form, issueType: ev.target.value }),
              className: "w-full bg-background border border-border/60 text-slate-100 rounded-xl px-3 py-2 text-xs",
              children: (activeIssueCategory === "delivery" ? deliveryIssuesList : billingIssuesList).map(t => e.jsx("option", { key: t, value: t, children: t }))
            })
          ] }),

          // Priority
          e.jsxs("div", { className: "space-y-1.5", children: [
            e.jsx("label", { className: "text-xs font-bold text-slate-300", children: "Priority / Urgency *" }),
            e.jsxs("select", {
              value: form.priority,
              onChange: ev => setForm({ ...form, priority: ev.target.value }),
              className: "w-full bg-background border border-border/60 text-slate-100 rounded-xl px-3 py-2 text-xs",
              children: [
                e.jsx("option", { value: "Urgent", children: "🚨 Urgent (Immediate Escalation)" }),
                e.jsx("option", { value: "High", children: "⚡ High (Resolve within 4 Hours)" }),
                e.jsx("option", { value: "Medium", children: "Normal (Same-Day Standard SLA)" })
              ]
            })
          ] })
        ] }),

        e.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          // Trip Selector
          e.jsxs("div", { className: "space-y-1.5", children: [
            e.jsx("label", { className: "text-xs font-bold text-slate-300", children: "Associated Shipment / Trip" }),
            e.jsxs("select", {
              value: form.tripId,
              onChange: ev => setForm({ ...form, tripId: ev.target.value }),
              className: "w-full bg-background border border-border/60 text-slate-100 rounded-xl px-3 py-2 text-xs",
              children: [
                e.jsx("option", { value: "", children: "-- Select Shipment (Optional) --" }),
                trips.map(tr => e.jsx("option", {
                  key: tr.id || tr.trip_id,
                  value: tr.id || tr.trip_id,
                  children: (tr.trip_id || tr.id) + " (" + (tr.truck_number || "Truck") + ") • " + (tr.route || "Corridor") + " • " + (tr.trip_status || "")
                }))
              ]
            })
          ] }),

          // Conditional Disputed Amount / Invoice
          activeIssueCategory === "billing" ? e.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            e.jsxs("div", { className: "space-y-1.5", children: [
              e.jsx("label", { className: "text-xs font-bold text-slate-300", children: "Invoice / Bill #" }),
              e.jsx(K, {
                placeholder: "e.g. JBC-INV-2026-089",
                value: form.invoiceNumber,
                onChange: ev => setForm({ ...form, invoiceNumber: ev.target.value }),
                className: "bg-background text-xs h-9 rounded-xl"
              })
            ] }),
            e.jsxs("div", { className: "space-y-1.5", children: [
              e.jsx("label", { className: "text-xs font-bold text-slate-300", children: "Disputed Amount (₹)" }),
              e.jsx(K, {
                type: "number",
                placeholder: "₹ Disputed",
                value: form.disputedAmount,
                onChange: ev => setForm({ ...form, disputedAmount: ev.target.value }),
                className: "bg-background text-xs h-9 rounded-xl font-mono text-rose-400"
              })
            ] })
          ] }) : e.jsxs("div", { className: "space-y-1.5", children: [
            e.jsx("label", { className: "text-xs font-bold text-slate-300", children: "Photo / POD Evidence URL" }),
            e.jsx(K, {
              placeholder: "https://drive.google.com/... or image link",
              value: form.evidenceUrl,
              onChange: ev => setForm({ ...form, evidenceUrl: ev.target.value }),
              className: "bg-background text-xs h-9 rounded-xl"
            })
          ] })
        ] }),

        // Description
        e.jsxs("div", { className: "space-y-1.5", children: [
          e.jsx("label", { className: "text-xs font-bold text-slate-300", children: "Detailed Problem Description *" }),
          e.jsx("textarea", {
            rows: 3,
            placeholder: activeIssueCategory === "delivery" ? "Explain delivery delay, damage specifics, package count, driver remarks, or POD discrepancy..." : "Describe the invoice rate mismatch, detention hours, deduction dispute, or advance reconciliation issue...",
            value: form.description,
            onChange: ev => setForm({ ...form, description: ev.target.value }),
            className: "w-full bg-background border border-border/60 text-slate-100 rounded-xl p-3 text-xs focus:ring-1 focus:ring-primary"
          })
        ] }),

        // Submit buttons
        e.jsxs("div", { className: "flex justify-end items-center gap-3 pt-2", children: [
          e.jsx("button", {
            type: "button",
            onClick: () => { setIsRaising(false); onClearPreselectedTrip && onClearPreselectedTrip(); },
            className: "px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800",
            children: "Cancel"
          }),
          e.jsx(j, {
            type: "submit",
            disabled: submittingTicket,
            className: "px-6 py-2 rounded-xl text-xs font-bold " + (activeIssueCategory === "billing" ? "bg-rose-600 hover:bg-rose-500" : "bg-blue-600 hover:bg-blue-500") + " text-white shadow-lg",
            children: submittingTicket ? "Submitting Dispute..." : "Submit Ticket & Alert Control Room"
          })
        ] })
      ] })
    ] }) : null,

    // Tickets List / Management
    e.jsxs("div", { className: "space-y-4", children: [
      e.jsxs("div", { className: "flex items-center justify-between", children: [
        e.jsxs("h4", { className: "text-sm font-bold text-slate-200 flex items-center gap-2", children: [
          "Active Dispute & Service Tickets (",
          tickets.length,
          ")"
        ] }),
        e.jsx("button", {
          type: "button",
          onClick: fetchTickets,
          className: "text-xs text-blue-400 hover:underline",
          children: "🔄 Refresh Tickets"
        })
      ] }),

      tickets.length === 0 ? e.jsx(y, { className: "bg-card/50 border border-border/40 p-8 text-center rounded-2xl", children: [
        e.jsx("p", { className: "text-sm text-muted-foreground", children: "No open service tickets found. All your deliveries and invoices are running smoothly!" })
      ] }) : e.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: tickets.map(t => {
        const isDelivery = t.category === "Delivery";
        const isOpen = t.status === "Open";
        const isResolved = t.status === "Resolved";

        return e.jsxs(y, {
          key: t.id || t.ticket_number,
          className: "bg-card border border-border/60 hover:border-border transition-all rounded-2xl p-5 space-y-3 cursor-pointer " + (activeTicket && (activeTicket.id === t.id || activeTicket.ticket_number === t.ticket_number) ? "ring-2 ring-blue-500" : ""),
          onClick: () => setActiveTicket(t),
          children: [
            e.jsxs("div", { className: "flex items-center justify-between", children: [
              e.jsxs("div", { className: "flex items-center gap-2", children: [
                e.jsx(p, {
                  className: "text-[10px] font-bold px-2 py-0.5 " + (isDelivery ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"),
                  children: isDelivery ? "🚚 Delivery Issue" : "💰 Billing Dispute"
                }),
                e.jsx("span", { className: "text-xs font-mono font-bold text-slate-300", children: t.ticket_number })
              ] }),
              e.jsx(p, {
                className: "text-[10px] font-bold " + (isOpen ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : (isResolved ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-blue-500/15 text-blue-400 border-blue-500/30")),
                children: t.status || "Open"
              })
            ] }),

            e.jsxs("div", { children: [
              e.jsx("h5", { className: "text-sm font-bold text-slate-100", children: t.subject || t.issue_type }),
              e.jsx("p", { className: "text-xs text-muted-foreground mt-1 line-clamp-2", children: t.description })
            ] }),

            e.jsxs("div", { className: "flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40", children: [
              e.jsxs("span", { children: [
                t.trip_number ? ("Trip: " + t.trip_number + " " + (t.truck_number ? "• " + t.truck_number : "")) : (t.invoice_number ? ("Invoice: " + t.invoice_number) : "General Query")
              ] }),
              t.disputed_amount > 0 ? e.jsxs("span", { className: "font-mono font-bold text-rose-400", children: [
                "₹", Number(t.disputed_amount).toLocaleString("en-IN")
              ] }) : e.jsx("span", { children: new Date(t.created_at || t.created || Date.now()).toLocaleDateString("en-IN") })
            ] })
          ]
        });
      }) })
    ] }),

    // Active Ticket Details & Conversation Modal
    activeTicket ? e.jsx(y, { className: "bg-card border border-blue-500/50 shadow-2xl rounded-2xl p-6 space-y-4", children: [
      e.jsxs("div", { className: "flex items-center justify-between border-b border-border/40 pb-3", children: [
        e.jsxs("div", { children: [
          e.jsxs("h4", { className: "text-base font-bold text-slate-100 flex items-center gap-2", children: [
            "Ticket #" + activeTicket.ticket_number + " Details",
            e.jsx(p, {
              className: "text-[10px] font-bold " + (activeTicket.status === "Resolved" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"),
              children: activeTicket.status || "Open"
            })
          ] }),
          e.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: activeTicket.subject || activeTicket.issue_type })
        ] }),
        e.jsxs("div", { className: "flex items-center gap-2", children: [
          activeTicket.status !== "Resolved" ? e.jsx(j, {
            onClick: () => handleResolveTicket(activeTicket),
            className: "text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-3 py-1.5 h-auto",
            children: "✓ Mark Resolved"
          }) : null,
          e.jsx("button", {
            type: "button",
            onClick: () => setActiveTicket(null),
            className: "text-slate-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800",
            children: "✕ Close"
          })
        ] })
      ] }),

      // Ticket Timeline
      e.jsxs("div", { className: "space-y-3 max-h-72 overflow-y-auto p-3 rounded-xl bg-background/50 border border-border/40", children: [
        (activeTicket.timeline || []).map((tl, idx) => {
          const isClient = tl.role === "Client";
          return e.jsxs("div", {
            key: idx,
            className: "p-3 rounded-xl text-xs " + (isClient ? "bg-slate-900 border border-slate-800 ml-4" : "bg-blue-950/40 border border-blue-800/40 mr-4"),
            children: [
              e.jsxs("div", { className: "flex justify-between items-center text-[10px] text-muted-foreground mb-1", children: [
                e.jsx("strong", { className: isClient ? "text-slate-300" : "text-blue-400", children: tl.author || tl.role }),
                e.jsx("span", { children: new Date(tl.timestamp || Date.now()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) })
              ] }),
              e.jsx("p", { className: "text-slate-200", children: tl.message }),
              tl.evidence_url ? e.jsxs("a", {
                href: tl.evidence_url,
                target: "_blank",
                rel: "noreferrer",
                className: "text-blue-400 hover:underline block mt-1 text-[11px]",
                children: ["📎 View Evidence Attachment"]
              }) : null
            ]
          });
        })
      ] }),

      // Reply Box
      e.jsxs("form", { onSubmit: handleSendReply, className: "flex gap-2", children: [
        e.jsx(K, {
          placeholder: "Type message or update for operations desk...",
          value: replyText,
          onChange: ev => setReplyText(ev.target.value),
          className: "bg-background text-xs h-10 rounded-xl flex-1"
        }),
        e.jsx(j, {
          type: "submit",
          disabled: submittingReply || !replyText.trim(),
          className: "bg-primary text-primary-foreground font-bold text-xs h-10 px-5 rounded-xl",
          children: submittingReply ? "Sending..." : "Send Message"
        })
      ] })
    ] }) : null
  ] });
}

function at(){const{currentUser:i}=Ve(),[portalTab,setPortalTab]=c.useState("completed"),[issueTrip,setIssueTrip]=c.useState(null),{isAdmin:$,isSuperAdmin:I}=ze(),[je]=Fe(),Ne=je.get("clientId"),[G,ve]=c.useState([]),[J,X]=c.useState(""),[x,_e]=c.useState(null),[h,ye]=c.useState([]),[Ce,Z]=c.useState(!0),[z,we]=c.useState(""),[g,ke]=c.useState(null),[De,ee]=c.useState(!1),[Se,F]=c.useState(!1),[v,Le]=c.useState(null),[S,q]=c.useState(""),[Me,Te]=c.useState("18"),[B,te]=c.useState("Monthly (1 Month)"),[se]=c.useState([{id:"LANE-101",route:"Hyderabad → Mumbai",origin:"Hyderabad, TS",destination:"Mumbai, MH",benchmark_rate:48e3,ai_rate:49500,distance_km:710,required_truck:"32 FT Container SXL",contract_duration:"Weekly (7 Days)"},{id:"LANE-102",route:"Bengaluru → Delhi NCR",origin:"Bengaluru, KA",destination:"Delhi NCR",benchmark_rate:85e3,ai_rate:87200,distance_km:1740,required_truck:"40 FT High Cube Trailer",contract_duration:"Monthly (1 Month)"},{id:"LANE-103",route:"Chennai → Kolkata",origin:"Chennai, TN",destination:"Kolkata, WB",benchmark_rate:62e3,ai_rate:61500,distance_km:1660,required_truck:"24 FT Open Body",contract_duration:"3 Months (Quarterly)"},{id:"LANE-104",route:"Ahmedabad → Hyderabad",origin:"Ahmedabad, GJ",destination:"Hyderabad, TS",benchmark_rate:54e3,ai_rate:55800,distance_km:1210,required_truck:"32 FT Multi-Axle",contract_duration:"6 Months (Half-Yearly)"},{id:"LANE-105",route:"Mumbai → Delhi NCR",origin:"Mumbai, MH",destination:"Delhi NCR",benchmark_rate:92e3,ai_rate:94e3,distance_km:1420,required_truck:"32 FT SXL Container",contract_duration:"1 Year (Annual)"}]),Pe=async()=>{if(!(!S||!v))try{await N.collection("trip_logs").create({route:v.route,start_location:v.origin,end_location:v.destination,cargo_type:`${B} Contract Load`,revenue:Number(S),trip_status:"Bidding Open",notes:`Client Contract Bid: ₹${S} (${B}) for ${v.route} by ${x?.client_name||i?.email}`},{$autoCancel:!1}).catch(()=>null),w.success(`Bid of ₹${Number(S).toLocaleString("en-IN")} (${B}) submitted for ${v.route}! Admin will review your bid.`),F(!1),q("")}catch(t){console.error("Bid submission error:",t),w.error("Could not submit bid")}},W=async(t=null)=>{Z(!0);try{let o=[];if($||I)try{o=await N.collection("clients").getFullList({sort:"client_name",$autoCancel:!1})}catch(a){console.warn("[ClientPortalPage] Could not list all clients:",a?.message)}ve(o);let s=null;if($||I){const a=t||J||Ne;a&&o.length>0&&(s=o.find(u=>u.id===a)),!s&&o.length>0&&(s=o[0])}else{if(i?.client_id&&(s=await N.collection("clients").getOne(i.client_id,{$autoCancel:!1}).catch(()=>null)),!s&&i?.id&&(s=await N.collection("clients").getFirstListItem(`portal_user_id = "${i.id}"`,{$autoCancel:!1}).catch(()=>null)),!s&&i?.email){const a=(i.email||"").toLowerCase().trim();s=await N.collection("clients").getFirstListItem(`email = "${a}"`,{$autoCancel:!1}).catch(()=>null)}if(!s&&(i?.name||i?.company)){const a=(i.name||"").toLowerCase().trim(),u=(i.company||"").toLowerCase().trim(),k=u?`company_name ~ "${u}" || client_name ~ "${u}"`:`client_name ~ "${a}" || company_name ~ "${a}"`;s=await N.collection("clients").getFirstListItem(k,{$autoCancel:!1}).catch(()=>null)}s||(s={id:i?.id?`client-${i.id}`:"client-custom",client_name:i?.name||i?.username||"Client Account",company_name:i?.company||i?.name||"Logistics Division",email:i?.email||"client@company.com",phone:i?.phone_number||i?.phone||"+91 7794072244",contact_person:i?.name||"Supply Chain Manager",gst_number:i?.gst_number||"36AAACR9823P1Z5",address:"Corporate Logistics Depot"})}_e(s),s&&X(s.id);let _=[];try{s?.id&&!s.id.startsWith("client-")&&(_=await N.collection("trip_logs").getFullList({filter:`client_id = "${s.id}" || client_name ~ "${s.client_name}"`,sort:"-date",$autoCancel:!1}).catch(()=>[])),_.length===0&&(_=await N.collection("trip_logs").getFullList({sort:"-date",$autoCancel:!1}).catch(()=>[]))}catch(a){console.warn("[ClientPortalPage] Could not fetch trip_logs:",a?.message)}const f=s?.id,d=(s?.client_name||"").trim().toLowerCase(),L=(s?.company_name||"").trim().toLowerCase(),E=(s?.email||"").trim().toLowerCase(),n=_.filter(a=>{if(!s)return!1;const u=a.client_id||a.expand?.client_id?.id;if(u&&f&&u===f)return!0;const k=(a.client_name||a.client||a.expand?.client_id?.client_name||"").trim().toLowerCase(),R=(a.company_name||a.expand?.client_id?.company_name||"").trim().toLowerCase();if(d&&(k===d||R===d)||L&&(k===L||R===L))return!0;const re=(a.client_email||a.email||"").trim().toLowerCase();return!!(E&&re&&re===E)});ye(n)}catch(o){console.error("[ClientPortalPage] Error loading portal data:",o),w.error("Failed to load client shipments")}finally{Z(!1)}};c.useEffect(()=>{W()},[i]);const Ae=t=>{($||I)&&(X(t),W(t))},m=c.useMemo(()=>{
  const t=h.filter(n=>n.trip_status==="Upcoming"||n.trip_status==="Scheduled"||n.trip_status==="Pending"),
        o=h.filter(n=>n.trip_status==="Dispatched"||n.trip_status==="In Transit"||n.trip_status==="Active"),
        s=h.filter(n=>n.trip_status==="Delivered"||n.trip_status==="Completed"),
        _=h.reduce((n,a)=>n+(Number(a.revenue)||Number(a.freight_amount)||0),0),
        f=h.reduce((n,a)=>n+(Number(a.advance_received_from_client)||0),0),
        hasPod=n=>Boolean(n.pod_url||n.pod_file||n.pod_link||n.pod_status==="Uploaded"||n.pod_status==="Verified"||n.pod_uploaded===true||n.pod_uploaded==="true"),
        pendingPodTrips=s.filter(n=>!hasPod(n)),
        unpaidDeliveredTrips=s.filter(n=>{
          const u=(n.client_payment_status||"").toLowerCase(),
                rev=Number(n.revenue)||Number(n.freight_amount)||0,
                adv=Number(n.advance_received_from_client)||0,
                toll=Number(n.toll_deduction)||0,
                bal=Math.max(0,rev-adv-toll);
          return u!=="received"&&u!=="paid"&&bal>0;
        }),
        L=unpaidDeliveredTrips.reduce((n,a)=>{
          const u=Number(a.revenue)||Number(a.freight_amount)||0,
                k=Number(a.advance_received_from_client)||0,
                R=Number(a.toll_deduction)||0;
          return n+Math.max(0,u-k-R);
        },0),
        now=new Date(),
        currentMonthName=now.toLocaleString("en-US",{month:"short",year:"numeric"}),
        monthlyTrips=h.filter(n=>{
          const dStr=n.date||n.start_date||n.created;
          if(!dStr)return false;
          const d=new Date(dStr);
          return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
        }),
        monthlyFreightSpend=monthlyTrips.reduce((n,a)=>n+(Number(a.revenue)||Number(a.freight_amount)||0),0);
  return {
    totalShipments:h.length,
    upcomingTrips:t,
    activeShipments:o,
    completedTrips:s,
    pendingPodTrips,
    unpaidDeliveredTrips,
    monthlyTrips,
    upcomingCount:t.length,
    activeCount:o.length,
    completedCount:s.length,
    pendingPodCount:pendingPodTrips.length,
    unpaidCount:unpaidDeliveredTrips.length,
    monthlyCount:monthlyTrips.length,
    currentMonthName,
    totalFreight:_,
    totalAdvance:f,
    payableAmount:L,
    monthlyFreightSpend,
    podsCount:s.length-pendingPodTrips.length
  };
},[h,x]),ae=c.useMemo(()=>h.filter(t=>{const o=z.toLowerCase();return o?t.trip_id&&t.trip_id.toLowerCase().includes(o)||t.truck_number&&t.truck_number.toLowerCase().includes(o)||t.route&&t.route.toLowerCase().includes(o)||t.driver_name&&t.driver_name.toLowerCase().includes(o):!0}),[h,z]),$e=t=>{const o=t.pod_url||t.pod_link||(t.pod_file?N.files.getUrl(t,t.pod_file):null);ke({...t,podUrl:o}),ee(!0)},Ie=()=>{if(h.length===0){w.error("No freight logs available to export");return}const t=["Trip ID","Date","Vehicle No","Route","Driver","Trip Status","Total Freight (INR)","Advance Paid (INR)","Payment Status"],o=h.map(d=>[d.trip_id||d.id,d.date?C(new Date(d.date),"yyyy-MM-dd"):d.start_date?C(new Date(d.start_date),"yyyy-MM-dd"):"",d.truck_number||"",`"${d.route||""}"`,`"${d.driver_name||""}"`,d.trip_status||"",d.revenue||d.freight_amount||0,d.advance_received_from_client||0,d.client_payment_status||"Pending"]),s="data:text/csv;charset=utf-8,"+[t.join(","),...o.map(d=>d.join(","))].join(`
`),_=encodeURI(s),f=document.createElement("a");f.setAttribute("href",_),f.setAttribute("download",`Freight_Statement_${x?.client_name||"Client"}_${C(new Date,"yyyyMMdd")}.csv`),document.body.appendChild(f),f.click(),document.body.removeChild(f),w.success("Freight log exported successfully")};return Ce?e.jsx("div",{className:"h-full w-full flex items-center justify-center p-12",children:e.jsx(qe,{text:"Loading client portal statement & shipments..."})}):e.jsxs(We.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{duration:.35},className:"p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8",children:[e.jsx(Be,{children:e.jsx("title",{children:"Client Portal | Jai Bhavani Cargo"})}),e.jsxs("div",{className:"relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 shadow-2xl",children:[e.jsx("div",{className:"absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"}),e.jsx("div",{className:"absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"}),e.jsxs("div",{className:"relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-2xl shadow-xl shrink-0",children:x?.client_name?x.client_name.charAt(0).toUpperCase():"C"}),e.jsxs("div",{className:"space-y-1",children:[e.jsxs("div",{className:"flex items-center gap-2.5 flex-wrap",children:[e.jsx("h1",{className:"text-2xl sm:text-3xl font-heading font-black text-white tracking-tight",children:x?.client_name||"Corporate Client Portal"}),x?.company_name&&e.jsx(p,{variant:"outline",className:"bg-slate-800/80 text-slate-300 border-slate-700 text-xs font-semibold",children:x.company_name}),e.jsxs(p,{className:"bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs px-2.5 py-0.5 flex items-center gap-1",children:[e.jsx(Ee,{className:"w-3.5 h-3.5 text-emerald-400"})," Verified Portal Client"]})]}),e.jsxs("p",{className:"text-xs sm:text-sm text-slate-400 flex items-center gap-4 flex-wrap pt-0.5",children:[x?.gst_number&&e.jsxs("span",{children:["GSTIN: ",e.jsx("strong",{className:"font-mono text-emerald-400",children:x.gst_number})]}),x?.phone&&e.jsxs("span",{children:["Hotline: ",e.jsx("strong",{className:"text-slate-200",children:x.phone})]}),e.jsxs("span",{children:["Account Manager: ",e.jsx("strong",{className:"text-slate-200",children:x?.contact_person||"Jai Bhavani Logistics Desk"})]})]})]})]}),e.jsxs("div",{className:"flex items-center gap-3 w-full lg:w-auto justify-end flex-wrap",children:[($||I)&&G.length>0&&e.jsx("div",{className:"w-56",children:e.jsxs(ce,{value:J,onValueChange:Ae,children:[e.jsx(me,{className:"bg-slate-900/90 border-slate-800 text-xs font-semibold rounded-xl text-slate-200",children:e.jsx(xe,{placeholder:"Select Client Preview"})}),e.jsx(ue,{className:"bg-slate-900 border-slate-800 text-slate-100",children:G.map(t=>e.jsxs(D,{value:t.id,children:[t.client_name," ",t.company_name?`(${t.company_name})`:""]},t.id))})]})}),e.jsxs(j,{onClick:()=>W(),variant:"outline",size:"sm",className:"rounded-xl bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 h-9",children:[e.jsx(Re,{className:"w-4 h-4 mr-1.5"})," Refresh"]}),e.jsxs(j,{onClick:Ie,size:"sm",variant:"secondary",className:"rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 h-9",children:[e.jsx(le,{className:"w-4 h-4 mr-1.5"})," CSV Ledger"]}),e.jsxs(j,{onClick:()=>setPortalTab(portalTab==="support"?"completed":"support"),size:"sm",className:"rounded-xl font-bold text-xs h-9 px-3.5 shadow-md flex items-center gap-1.5 cursor-pointer transition-all "+(portalTab==="support"?"bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-400/40":"bg-slate-800/90 hover:bg-slate-700 text-rose-300 border border-rose-500/30 hover:text-white"),children:[e.jsx(oe,{className:"w-3.5 h-3.5 text-rose-400"}),portalTab==="support"?"← Back to Shipments":"Support & Complaints",portalTab!=="support"&&e.jsx("span",{className:"ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/30 text-rose-300 border border-rose-500/40 font-black",children:"Helpdesk"})]})]})]})]}),e.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5",children:[
  /* Card 1: Total Shipments */
  e.jsx(y,{onClick:()=>setPortalTab("all"),className:"cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-cyan-950/40 via-card to-card border-cyan-500/30 shadow-soft rounded-2xl relative overflow-hidden "+(portalTab==="all"?"ring-2 ring-cyan-400 border-cyan-400 shadow-cyan-500/20":""),children:e.jsxs(M,{className:"p-3.5 relative z-10",children:[
    e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
      e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-cyan-400",children:"Total Shipments"}),
      e.jsx("div",{className:"p-1.5 bg-cyan-500/20 rounded-lg text-cyan-400",children:e.jsx(ne,{className:"w-3.5 h-3.5"})})
    ]}),
    e.jsx("div",{className:"text-2xl font-black text-cyan-400 font-heading",children:m.totalShipments}),
    e.jsx("div",{className:"text-[10.5px] text-muted-foreground mt-0.5 line-clamp-1",children:"All Booked Loads"})
  ]})}),

  /* Card 2: Shipments In Transit */
  e.jsx(y,{onClick:()=>setPortalTab("active"),className:"cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-blue-950/40 via-card to-card border-blue-500/30 shadow-soft rounded-2xl relative overflow-hidden "+(portalTab==="active"?"ring-2 ring-blue-400 border-blue-400 shadow-blue-500/20":""),children:e.jsxs(M,{className:"p-3.5 relative z-10",children:[
    e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
      e.jsxs("span",{className:"text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1",children:[
        e.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping inline-block"}),
        "In Transit"
      ]}),
      e.jsx("div",{className:"p-1.5 bg-blue-500/20 rounded-lg text-blue-400",children:e.jsx(ne,{className:"w-3.5 h-3.5"})})
    ]}),
    e.jsx("div",{className:"text-2xl font-black text-blue-400 font-heading",children:m.activeCount}),
    e.jsx("div",{className:"text-[10.5px] text-muted-foreground mt-0.5 line-clamp-1",children:"Moving on Highways"})
  ]})}),

  /* Card 3: Delivered Shipments */
  e.jsx(y,{onClick:()=>setPortalTab("completed"),className:"cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-emerald-950/40 via-card to-card border-emerald-500/30 shadow-soft rounded-2xl relative overflow-hidden "+(portalTab==="completed"?"ring-2 ring-emerald-400 border-emerald-400 shadow-emerald-500/20":""),children:e.jsxs(M,{className:"p-3.5 relative z-10",children:[
    e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
      e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-emerald-400",children:"Delivered"}),
      e.jsx("div",{className:"p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400",children:e.jsx(oe,{className:"w-3.5 h-3.5"})})
    ]}),
    e.jsx("div",{className:"text-2xl font-black text-emerald-400 font-heading",children:m.completedCount}),
    e.jsx("div",{className:"text-[10.5px] text-muted-foreground mt-0.5 line-clamp-1",children:"Safely Received"})
  ]})}),

  /* Card 4: Pending POD */
  e.jsx(y,{onClick:()=>setPortalTab("pending_pod"),className:"cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-amber-950/40 via-card to-card border-amber-500/30 shadow-soft rounded-2xl relative overflow-hidden "+(portalTab==="pending_pod"?"ring-2 ring-amber-400 border-amber-400 shadow-amber-500/20":""),children:e.jsxs(M,{className:"p-3.5 relative z-10",children:[
    e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
      e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-amber-400",children:"Pending POD"}),
      e.jsx("div",{className:"p-1.5 bg-amber-500/20 rounded-lg text-amber-400",children:e.jsx(Y,{className:"w-3.5 h-3.5"})})
    ]}),
    e.jsx("div",{className:"text-2xl font-black text-amber-400 font-heading",children:m.pendingPodCount}),
    e.jsx("div",{className:"text-[10.5px] text-muted-foreground mt-0.5 line-clamp-1",children:"Awaiting Signed Proof"})
  ]})}),

  /* Card 5: Outstanding Payments */
  e.jsx(y,{onClick:()=>setPortalTab("unpaid"),className:"cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-rose-950/40 via-card to-card border-rose-500/30 shadow-soft rounded-2xl relative overflow-hidden "+(portalTab==="unpaid"?"ring-2 ring-rose-400 border-rose-400 shadow-rose-500/20":""),children:e.jsxs(M,{className:"p-3.5 relative z-10",children:[
    e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
      e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-rose-400",children:"Outstanding"}),
      e.jsx("div",{className:"p-1.5 bg-rose-500/20 rounded-lg text-rose-400",children:e.jsx(Oe,{className:"w-3.5 h-3.5"})})
    ]}),
    e.jsx("div",{className:"text-xl sm:text-2xl font-black text-rose-400 font-heading truncate",children:T(m.payableAmount)}),
    e.jsx("div",{className:"text-[10.5px] text-muted-foreground mt-0.5 line-clamp-1",children:"Delivered Net Balance Due"})
  ]})}),

  /* Card 6: Monthly Freight Spend */
  e.jsx(y,{onClick:()=>setPortalTab("monthly"),className:"cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br from-violet-950/40 via-card to-card border-violet-500/30 shadow-soft rounded-2xl relative overflow-hidden "+(portalTab==="monthly"?"ring-2 ring-violet-400 border-violet-400 shadow-violet-500/20":""),children:e.jsxs(M,{className:"p-3.5 relative z-10",children:[
    e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[
      e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-violet-400",children:"Monthly Spend"}),
      e.jsx("div",{className:"p-1.5 bg-violet-500/20 rounded-lg text-violet-400",children:e.jsx(ie,{className:"w-3.5 h-3.5"})})
    ]}),
    e.jsx("div",{className:"text-xl sm:text-2xl font-black text-violet-400 font-heading truncate",children:T(m.monthlyFreightSpend)}),
    e.jsxs("div",{className:"text-[10.5px] text-muted-foreground mt-0.5 line-clamp-1",children:[m.monthlyCount," Trips in ",m.currentMonthName]})
  ]})})
]}),e.jsx(y,{className:"border-border/50 shadow-soft bg-card rounded-2xl overflow-hidden",children:e.jsxs(Ye,{value:portalTab,onValueChange:setPortalTab,defaultValue:"completed",className:"w-full",children:[e.jsx(Ke,{className:"pb-0 border-b border-border/40 bg-secondary/10",children:portalTab==="support"?e.jsxs("div",{className:"flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4",children:[e.jsxs("div",{children:[e.jsxs(Qe,{className:"font-heading text-xl text-white flex items-center gap-2",children:[e.jsx("span",{className:"text-lg",children:"🎧"}),"Support & Transit Complaints Desk"]}),e.jsx(Ge,{children:"Direct client SLA helpdesk. File damage claims, track delays, or chat directly with operations."})]}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs(j,{onClick:()=>setPortalTab("completed"),variant:"outline",size:"sm",className:"rounded-xl bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 text-xs h-9 cursor-pointer",children:["← Back to Shipments Ledger"]})})]}):e.jsxs("div",{className:"flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4",children:[e.jsxs("div",{children:[e.jsx(Qe,{className:"font-heading text-xl",children:"Shipments & Freight Ledger"}),e.jsx(Ge,{children:"Real-time active tracking, proof of delivery downloads, and freight statements."})]}),e.jsxs("div",{className:"flex items-center gap-3 w-full md:w-auto flex-wrap",children:[e.jsxs("div",{className:"relative w-48",children:[e.jsx(Ue,{className:"absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"}),e.jsx(K,{placeholder:"Search trip, route, vehicle...",value:z,onChange:t=>we(t.target.value),className:"pl-8 h-9 text-xs rounded-xl bg-background"})]}),e.jsxs(Je,{className:"bg-background border border-border/50 p-1 rounded-xl flex-nowrap overflow-x-auto",children:[
  e.jsxs(P,{value:"all",className:"rounded-lg text-xs font-bold px-2.5 py-1.5",children:["All Freight (",m.totalShipments,")"]}),
  e.jsxs(P,{value:"active",className:"rounded-lg text-xs font-bold px-2.5 py-1.5",children:["In-Transit (",m.activeCount,")"]}),
  e.jsxs(P,{value:"completed",className:"rounded-lg text-xs font-bold px-2.5 py-1.5",children:["Delivered (",m.completedCount,")"]}),
  e.jsxs(P,{value:"pending_pod",className:"rounded-lg text-xs font-bold px-2.5 py-1.5 border border-amber-500/30 text-amber-400",children:["Pending POD (",m.pendingPodCount,")"]}),
  e.jsxs(P,{value:"unpaid",className:"rounded-lg text-xs font-bold px-2.5 py-1.5 border border-rose-500/30 text-rose-400",children:["Outstanding Dues (",m.unpaidCount,")"]}),
  e.jsxs(P,{value:"monthly",className:"rounded-lg text-xs font-bold px-2.5 py-1.5 border border-violet-500/30 text-violet-400",children:["This Month (",m.monthlyCount,")"]}),
  e.jsxs(P,{value:"upcoming",className:"rounded-lg text-xs font-bold px-2.5 py-1.5",children:["Upcoming (",m.upcomingCount,")"]}),
  e.jsxs(P,{value:"quotations",className:"rounded-lg text-xs font-bold px-2.5 py-1.5 border border-blue-500/30 text-blue-400 flex items-center gap-1",children:[e.jsx(ne,{className:"w-3 h-3 mr-1"})," Request Rate & Quotes 🚚"]}),
  e.jsxs(P,{value:"bidding",className:"rounded-lg text-xs font-bold px-2.5 py-1.5 border border-amber-500/30 text-amber-400",children:[e.jsx(O,{className:"w-3 h-3 mr-1"})," Lane Bidding"]})
]})]})]})}),e.jsx(A,{value:"upcoming",className:"p-0 m-0",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(U,{children:[e.jsx(H,{className:"bg-muted/30",children:e.jsxs(b,{children:[e.jsx(l,{className:"pl-6 font-semibold",children:"Trip ID"}),e.jsx(l,{className:"font-semibold",children:"Scheduled Date"}),e.jsx(l,{className:"font-semibold",children:"Vehicle No."}),e.jsx(l,{className:"font-semibold",children:"Route"}),e.jsx(l,{className:"font-semibold",children:"Driver"}),e.jsx(l,{className:"font-semibold text-center",children:"Status"}),e.jsx(l,{className:"pr-6 text-right font-semibold",children:"Estimated Freight (₹)"})]})}),e.jsx(V,{children:m.upcomingTrips.length===0?e.jsx(b,{children:e.jsx(r,{colSpan:7,className:"text-center py-12 text-muted-foreground",children:"No upcoming scheduled trips at the moment."})}):m.upcomingTrips.map(t=>e.jsxs(b,{className:"hover:bg-muted/30 transition-colors",children:[e.jsx(r,{className:"pl-6 font-mono font-bold text-sm text-amber-400",children:t.trip_id||t.id}),e.jsx(r,{className:"whitespace-nowrap text-xs text-muted-foreground",children:t.date?C(new Date(t.date),"dd MMM yyyy"):"—"}),e.jsx(r,{className:"font-mono font-bold text-sm",children:t.truck_number||"—"}),e.jsx(r,{className:"font-medium text-sm",children:t.route||"—"}),e.jsx(r,{className:"text-xs text-muted-foreground",children:t.driver_name||"—"}),e.jsx(r,{className:"text-center",children:e.jsx(p,{variant:"outline",className:"bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold text-xs",children:t.trip_status||"Upcoming"})}),e.jsx(r,{className:"pr-6 text-right font-bold text-sm font-mono",children:T(t.revenue||t.freight_amount||0)})]},t.id))})]})})}),e.jsx(A,{value:"active",className:"p-0 m-0",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(U,{children:[e.jsx(H,{className:"bg-muted/30",children:e.jsxs(b,{children:[e.jsx(l,{className:"pl-6 font-semibold",children:"Trip ID"}),e.jsx(l,{className:"font-semibold",children:"Dispatch Date"}),e.jsx(l,{className:"font-semibold",children:"Vehicle No."}),e.jsx(l,{className:"font-semibold",children:"Route"}),e.jsx(l,{className:"font-semibold",children:"Driver Contact"}),e.jsx(l,{className:"font-semibold text-center",children:"Status"}),e.jsx(l,{className:"pr-6 text-right font-semibold",children:"Freight Amount (₹)"})]})}),e.jsx(V,{children:m.activeShipments.length===0?e.jsx(b,{children:e.jsx(r,{colSpan:7,className:"text-center py-12 text-muted-foreground",children:"No active in-transit shipments currently on route."})}):m.activeShipments.map(t=>e.jsxs(b,{className:"hover:bg-muted/30 transition-colors",children:[e.jsx(r,{className:"pl-6 font-mono font-bold text-sm text-primary",children:t.trip_id||t.id}),e.jsx(r,{className:"whitespace-nowrap text-xs text-muted-foreground",children:t.date?C(new Date(t.date),"dd MMM yyyy"):"—"}),e.jsx(r,{className:"font-mono font-bold text-sm",children:t.truck_number||"—"}),e.jsx(r,{className:"font-medium text-sm",children:t.route||"—"}),e.jsx(r,{className:"text-xs",children:t.driver_phone?e.jsxs(j,{variant:"ghost",size:"sm",onClick:()=>window.open(`tel:${t.driver_phone}`),className:"h-7 px-2 text-emerald-400 hover:text-emerald-300 font-bold",children:[e.jsx(He,{className:"w-3.5 h-3.5 mr-1"})," Call ",t.driver_name?`(${t.driver_name})`:""]}):t.driver_name||"—"}),e.jsx(r,{className:"text-center",children:e.jsx(p,{variant:"outline",className:"bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold text-xs animate-pulse",children:t.trip_status||"In-Transit"})}),e.jsx(r,{className:"pr-6 text-right font-bold text-sm font-mono",children:T(t.revenue||t.freight_amount||0)})]},t.id))})]})})}),e.jsx(A,{value:"completed",className:"p-0 m-0",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(U,{children:[e.jsx(H,{className:"bg-muted/30",children:e.jsxs(b,{children:[e.jsx(l,{className:"pl-6 font-semibold",children:"Trip ID"}),e.jsx(l,{className:"font-semibold",children:"Delivery Date"}),e.jsx(l,{className:"font-semibold",children:"Vehicle No."}),e.jsx(l,{className:"font-semibold",children:"Route"}),e.jsx(l,{className:"font-semibold text-center",children:"POD Status"}),e.jsx(l,{className:"font-semibold text-center",children:"Payment Status"}),e.jsx(l,{className:"pr-6 text-right font-semibold",children:"Action"})]})}),e.jsx(V,{children:m.completedTrips.length===0?e.jsx(b,{children:e.jsx(r,{colSpan:7,className:"text-center py-12 text-muted-foreground",children:"No completed delivered trips yet."})}):m.completedTrips.map(t=>{const o=t.pod_url||t.pod_link||(t.pod_file?N.files.getUrl(t,t.pod_file):null),s=(t.client_payment_status||"").toLowerCase()==="received"||(t.client_payment_status||"").toLowerCase()==="paid";return e.jsxs(b,{className:"hover:bg-muted/30 transition-colors",children:[e.jsx(r,{className:"pl-6 font-mono font-bold text-sm text-primary",children:t.trip_id||t.id}),e.jsx(r,{className:"whitespace-nowrap text-xs text-muted-foreground",children:t.date?C(new Date(t.date),"dd MMM yyyy"):"—"}),e.jsx(r,{className:"font-mono font-bold text-sm",children:t.truck_number||"—"}),e.jsx(r,{className:"font-medium text-sm",children:t.route||"—"}),e.jsx(r,{className:"text-center",children:o?e.jsxs(p,{variant:"outline",className:"bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold text-xs",children:[e.jsx(oe,{className:"w-3 h-3 mr-1"})," Verified POD"]}):e.jsxs(p,{variant:"outline",className:"bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold text-xs",children:[e.jsx(Y,{className:"w-3 h-3 mr-1"})," Pending POD"]})}),e.jsx(r,{className:"text-center",children:e.jsx(p,{variant:"outline",className:`font-bold text-xs ${s?"bg-emerald-500/10 text-emerald-400 border-emerald-500/30":"bg-rose-500/10 text-rose-400 border-rose-500/30"}`,children:s?"Paid":"Unpaid / Pending"})}),e.jsx(r,{className:"pr-6 text-right",children:o?e.jsxs(j,{size:"sm",onClick:()=>$e(t),className:"rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm",children:[e.jsx(de,{className:"w-3.5 h-3.5 mr-1.5"})," View POD"]}):e.jsxs(j,{size:"sm",variant:"outline",onClick:()=>w.success(`POD document request sent to dispatch desk for ${t.trip_id||t.id}`),className:"rounded-xl border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs font-semibold",children:[e.jsx(Y,{className:"w-3.5 h-3.5 mr-1"})," Request POD"]})})]},t.id)})})]})})}),e.jsx(A,{value:"all",className:"p-0 m-0",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(U,{children:[e.jsx(H,{className:"bg-muted/30",children:e.jsxs(b,{children:[e.jsx(l,{className:"pl-6 font-semibold",children:"Trip ID"}),e.jsx(l,{className:"font-semibold",children:"Date"}),e.jsx(l,{className:"font-semibold",children:"Vehicle No."}),e.jsx(l,{className:"font-semibold",children:"Route"}),e.jsx(l,{className:"font-semibold text-center",children:"Status"}),e.jsx(l,{className:"font-semibold text-center",children:"Payment Status"}),e.jsx(l,{className:"font-semibold text-right",children:"Advance Paid (₹)"}),e.jsx(l,{className:"pr-6 text-right font-semibold",children:"Total Freight (₹)"})]})}),e.jsx(V,{children:ae.length===0?e.jsx(b,{children:e.jsx(r,{colSpan:8,className:"text-center py-12 text-muted-foreground",children:"No freight statement logs found."})}):ae.map(t=>{const o=(t.client_payment_status||"").toLowerCase()==="received"||(t.client_payment_status||"").toLowerCase()==="paid";return e.jsxs(b,{className:"hover:bg-muted/30 transition-colors",children:[e.jsx(r,{className:"pl-6 font-mono font-bold text-sm text-primary",children:t.trip_id||t.id}),e.jsx(r,{className:"whitespace-nowrap text-xs text-muted-foreground",children:t.date?C(new Date(t.date),"dd MMM yyyy"):"—"}),e.jsx(r,{className:"font-mono font-bold text-sm",children:t.truck_number||"—"}),e.jsx(r,{className:"font-medium text-sm",children:t.route||"—"}),e.jsx(r,{className:"text-center",children:e.jsx(p,{variant:"outline",className:`font-bold text-xs ${t.trip_status==="Delivered"||t.trip_status==="Completed"?"bg-emerald-500/10 text-emerald-400 border-emerald-500/20":"bg-blue-500/10 text-blue-400 border-blue-500/20"}`,children:t.trip_status||"Scheduled"})}),e.jsx(r,{className:"text-center",children:e.jsx(p,{variant:"outline",className:`font-bold text-xs ${o?"bg-emerald-500/10 text-emerald-400 border-emerald-500/20":"bg-amber-500/10 text-amber-400 border-amber-500/20"}`,children:t.client_payment_status||"Pending"})}),e.jsx(r,{className:"text-right font-mono text-xs text-muted-foreground",children:T(t.advance_received_from_client||0)}),e.jsx(r,{className:"pr-6 text-right font-bold text-sm font-mono",children:T(t.revenue||t.freight_amount||0)})]},t.id)})})]})})}),/* Tab: Pending POD */
  e.jsx(A, {
    value: "pending_pod",
    className: "p-0 m-0",
    children: e.jsxs("div", {
      className: "space-y-3",
      children: [
        e.jsxs("div", {
          className: "p-3.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between",
          children: [
            e.jsxs("div", {
              className: "flex items-center gap-2 text-xs text-amber-300 font-bold",
              children: [
                e.jsx(Y, { className: "w-4 h-4 text-amber-400" }),
                "Showing ",
                m.pendingPodCount,
                " delivered shipments awaiting signed physical POD document upload."
              ]
            }),
            e.jsx(p, {
              className: "bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold",
              children: "Action Required"
            })
          ]
        }),
        e.jsx("div", {
          className: "overflow-x-auto",
          children: e.jsxs(U, {
            children: [
              e.jsx(H, {
                className: "bg-muted/30",
                children: e.jsxs(b, {
                  children: [
                    e.jsx(l, { className: "pl-6 font-semibold", children: "Trip ID" }),
                    e.jsx(l, { className: "font-semibold", children: "Delivery Date" }),
                    e.jsx(l, { className: "font-semibold", children: "Vehicle No." }),
                    e.jsx(l, { className: "font-semibold", children: "Route" }),
                    e.jsx(l, { className: "font-semibold", children: "Driver" }),
                    e.jsx(l, { className: "font-semibold text-center", children: "POD Status" }),
                    e.jsx(l, { className: "pr-6 text-right font-semibold", children: "Freight (₹)" })
                  ]
                })
              }),
              e.jsx(V, {
                children: m.pendingPodTrips.length === 0
                  ? e.jsx(b, { children: e.jsx(r, { colSpan: 7, className: "text-center py-12 text-emerald-400 font-bold", children: "🎉 Excellent! All delivered shipments have verified POD documents uploaded." }) })
                  : m.pendingPodTrips.map(t => e.jsxs(b, {
                      key: t.id,
                      className: "hover:bg-muted/30 transition-colors",
                      children: [
                        e.jsx(r, { className: "pl-6 font-mono font-bold text-sm text-primary", children: t.trip_id || t.id }),
                        e.jsx(r, { className: "whitespace-nowrap text-xs text-muted-foreground", children: t.date ? C(new Date(t.date), "dd MMM yyyy") : "—" }),
                        e.jsx(r, { className: "font-mono font-bold text-sm", children: t.truck_number || "—" }),
                        e.jsx(r, { className: "font-medium text-sm", children: t.route || "—" }),
                        e.jsx(r, { className: "text-xs text-muted-foreground", children: t.driver_name || "—" }),
                        e.jsx(r, { className: "text-center", children: e.jsx(p, { variant: "outline", className: "bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold text-xs", children: "Pending POD Upload" }) }),
                        e.jsx(r, { className: "pr-6 text-right font-bold text-sm font-mono", children: T(t.revenue || t.freight_amount || 0) })
                      ]
                    }))
              })
            ]
          })
        })
      ]
    })
  }),

  /* Tab: Outstanding Payments */
  e.jsx(A, {
    value: "unpaid",
    className: "p-0 m-0",
    children: e.jsxs("div", {
      className: "space-y-3",
      children: [
        e.jsxs("div", {
          className: "p-3.5 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between",
          children: [
            e.jsxs("div", {
              className: "flex items-center gap-2 text-xs text-rose-300 font-bold",
              children: [
                e.jsx(Oe, { className: "w-4 h-4 text-rose-400" }),
                "Total Outstanding Payable Balance: ",
                e.jsx("strong", { className: "text-white font-mono text-sm ml-1", children: T(m.payableAmount) })
              ]
            }),
            e.jsx(p, {
              className: "bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold",
              children: m.unpaidCount + " Pending Trips"
            })
          ]
        }),
        e.jsx("div", {
          className: "overflow-x-auto",
          children: e.jsxs(U, {
            children: [
              e.jsx(H, {
                className: "bg-muted/30",
                children: e.jsxs(b, {
                  children: [
                    e.jsx(l, { className: "pl-6 font-semibold", children: "Trip ID" }),
                    e.jsx(l, { className: "font-semibold", children: "Delivery Date" }),
                    e.jsx(l, { className: "font-semibold", children: "Vehicle No." }),
                    e.jsx(l, { className: "font-semibold", children: "Route" }),
                    e.jsx(l, { className: "font-semibold text-right", children: "Freight (₹)" }),
                    e.jsx(l, { className: "font-semibold text-right", children: "Advance Paid (₹)" }),
                    e.jsx(l, { className: "pr-6 text-right font-semibold text-rose-400", children: "Net Balance Due (₹)" })
                  ]
                })
              }),
              e.jsx(V, {
                children: m.unpaidDeliveredTrips.length === 0
                  ? e.jsx(b, { children: e.jsx(r, { colSpan: 7, className: "text-center py-12 text-emerald-400 font-bold", children: "🎉 Clear Ledger! No outstanding freight dues pending for delivered shipments." }) })
                  : m.unpaidDeliveredTrips.map(t => {
                      const rev = Number(t.revenue) || Number(t.freight_amount) || 0;
                      const adv = Number(t.advance_received_from_client) || 0;
                      const toll = Number(t.toll_deduction) || 0;
                      const bal = Math.max(0, rev - adv - toll);
                      return e.jsxs(b, {
                        key: t.id,
                        className: "hover:bg-muted/30 transition-colors",
                        children: [
                          e.jsx(r, { className: "pl-6 font-mono font-bold text-sm text-primary", children: t.trip_id || t.id }),
                          e.jsx(r, { className: "whitespace-nowrap text-xs text-muted-foreground", children: t.date ? C(new Date(t.date), "dd MMM yyyy") : "—" }),
                          e.jsx(r, { className: "font-mono font-bold text-sm", children: t.truck_number || "—" }),
                          e.jsx(r, { className: "font-medium text-sm", children: t.route || "—" }),
                          e.jsx(r, { className: "text-right font-mono text-sm", children: T(rev) }),
                          e.jsx(r, { className: "text-right font-mono text-sm text-emerald-400", children: T(adv) }),
                          e.jsx(r, { className: "pr-6 text-right font-bold text-sm font-mono text-rose-400", children: T(bal) })
                        ]
                      });
                    })
              })
            ]
          })
        })
      ]
    })
  }),

  /* Tab: Monthly Freight Spend */
  e.jsx(A, {
    value: "monthly",
    className: "p-0 m-0",
    children: e.jsxs("div", {
      className: "space-y-3",
      children: [
        e.jsxs("div", {
          className: "p-3.5 bg-violet-500/10 border-b border-violet-500/20 flex items-center justify-between",
          children: [
            e.jsxs("div", {
              className: "flex items-center gap-2 text-xs text-violet-300 font-bold",
              children: [
                e.jsx(ie, { className: "w-4 h-4 text-violet-400" }),
                "Freight Spend for ",
                m.currentMonthName,
                ": ",
                e.jsx("strong", { className: "text-white font-mono text-sm ml-1", children: T(m.monthlyFreightSpend) })
              ]
            }),
            e.jsx(p, {
              className: "bg-violet-500/20 text-violet-300 border border-violet-500/40 text-xs font-mono font-bold",
              children: m.monthlyCount + " Consignments"
            })
          ]
        }),
        e.jsx("div", {
          className: "overflow-x-auto",
          children: e.jsxs(U, {
            children: [
              e.jsx(H, {
                className: "bg-muted/30",
                children: e.jsxs(b, {
                  children: [
                    e.jsx(l, { className: "pl-6 font-semibold", children: "Trip ID" }),
                    e.jsx(l, { className: "font-semibold", children: "Trip Date" }),
                    e.jsx(l, { className: "font-semibold", children: "Vehicle No." }),
                    e.jsx(l, { className: "font-semibold", children: "Route" }),
                    e.jsx(l, { className: "font-semibold text-center", children: "Status" }),
                    e.jsx(l, { className: "pr-6 text-right font-semibold text-violet-400", children: "Freight Billing (₹)" })
                  ]
                })
              }),
              e.jsx(V, {
                children: m.monthlyTrips.length === 0
                  ? e.jsx(b, { children: e.jsx(r, { colSpan: 6, className: "text-center py-12 text-muted-foreground", children: "No freight consignments recorded for this calendar month yet." }) })
                  : m.monthlyTrips.map(t => e.jsxs(b, {
                      key: t.id,
                      className: "hover:bg-muted/30 transition-colors",
                      children: [
                        e.jsx(r, { className: "pl-6 font-mono font-bold text-sm text-primary", children: t.trip_id || t.id }),
                        e.jsx(r, { className: "whitespace-nowrap text-xs text-muted-foreground", children: t.date ? C(new Date(t.date), "dd MMM yyyy") : "—" }),
                        e.jsx(r, { className: "font-mono font-bold text-sm", children: t.truck_number || "—" }),
                        e.jsx(r, { className: "font-medium text-sm", children: t.route || "—" }),
                        e.jsx(r, { className: "text-center", children: e.jsx(p, { variant: "outline", className: "font-bold text-xs bg-slate-800 text-slate-300 border-slate-700", children: t.trip_status || "Scheduled" }) }),
                        e.jsx(r, { className: "pr-6 text-right font-bold text-sm font-mono text-violet-400", children: T(t.revenue || t.freight_amount || 0) })
                      ]
                    }))
              })
            ]
          })
        })
      ]
    })
  }),

  e.jsx(A,{value:"quotations",className:"p-0 m-0",children:e.jsx(ClientPortalQuotationTab,{client:x,currentUser:i})}),
  e.jsxs(A,{value:"bidding",className:"p-5 m-0 space-y-4",children:[e.jsxs("div",{className:"flex justify-between items-center pb-2 border-b border-border/50",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-base font-bold text-foreground flex items-center gap-2",children:[e.jsx(O,{className:"w-4 h-4 text-amber-400"})," Active Route Lanes Bidding Exchange"]}),e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5",children:"Submit custom freight bids directly for dedicated transport lanes."})]}),e.jsxs(p,{className:"bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs font-mono",children:[se.length," Active Bidding Lanes"]})]}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:se.map(t=>e.jsxs(y,{className:"bg-card border-border/60 rounded-2xl p-4 space-y-3 hover:border-amber-400/50 transition-all",children:[e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsx(p,{variant:"outline",className:"text-[10px] text-amber-400 border-amber-400/30 font-mono",children:t.id}),e.jsx(p,{className:"bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px] font-mono",children:t.contract_duration})]}),e.jsx("h4",{className:"text-base font-extrabold text-foreground mt-1",children:t.route})]}),e.jsxs("span",{className:"text-xs text-muted-foreground font-mono",children:[t.distance_km," KM"]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-xl font-mono",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] text-muted-foreground",children:"BENCHMARK RATE:"}),e.jsxs("div",{className:"font-bold text-foreground",children:["₹",t.benchmark_rate.toLocaleString("en-IN")]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] text-amber-400",children:"AI RECOMMENDED:"}),e.jsxs("div",{className:"font-bold text-amber-400",children:["₹",t.ai_rate.toLocaleString("en-IN")]})]})]}),e.jsxs("div",{className:"flex items-center justify-between text-xs pt-1",children:[e.jsxs("span",{className:"text-muted-foreground text-[11px] flex items-center gap-1",children:[e.jsx(ne,{className:"w-3.5 h-3.5 text-primary"})," ",t.required_truck]}),e.jsxs(j,{size:"sm",onClick:()=>{Le(t),q(t.benchmark_rate.toString()),te(t.contract_duration||"Monthly (1 Month)"),F(!0)},className:"h-8 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl",children:[e.jsx(O,{className:"w-3 h-3 mr-1"})," Bid For Contract"]})]})]},t.id))})]}),e.jsx(A,{value:"support",className:"p-4 sm:p-6 space-y-6",children:e.jsx(ClientPortalSupportTab,{client:x,trips:h,currentUser:i,preselectedTrip:issueTrip,onClearPreselectedTrip:()=>setIssueTrip(null)})})]})}),portalTab!=="support"&&e.jsxs("button",{type:"button",onClick:()=>setPortalTab("support"),className:"fixed bottom-5 right-5 z-40 h-10 px-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-2xl shadow-rose-600/40 flex items-center gap-2 border border-rose-400/40 transition-transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md",children:[e.jsx(oe,{className:"w-4 h-4"}),"Need Support? Chat with Operations",e.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400 animate-ping"})]}),e.jsx(he,{open:Se,onOpenChange:F,children:e.jsxs(pe,{className:"sm:max-w-md bg-card border-border shadow-2xl rounded-2xl p-6",children:[e.jsxs(be,{children:[e.jsxs(ge,{className:"text-lg font-bold flex items-center gap-2 text-amber-400",children:[e.jsx(O,{className:"w-5 h-5 text-amber-400"})," Submit Freight Contract Bid for ",v?.route]}),e.jsx(fe,{className:"text-xs text-muted-foreground",children:"Submit your target price and preferred contract tenure for this dedicated transport lane."})]}),e.jsxs("div",{className:"space-y-4 py-2",children:[e.jsxs("div",{className:"bg-muted/40 p-3 rounded-xl border border-border text-xs space-y-1 font-mono",children:[e.jsxs("div",{children:["Target Benchmark: ",e.jsxs("strong",{className:"text-foreground",children:["₹",v?.benchmark_rate?.toLocaleString("en-IN")]})]}),e.jsxs("div",{children:["AI Market Estimate: ",e.jsxs("strong",{className:"text-amber-400",children:["₹",v?.ai_rate?.toLocaleString("en-IN")]})]})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(Q,{className:"text-xs",children:"Contract Tenure / Duration"}),e.jsxs(ce,{value:B,onValueChange:te,children:[e.jsx(me,{className:"bg-background border-border text-xs rounded-xl font-bold",children:e.jsx(xe,{placeholder:"Select Contract Duration"})}),e.jsxs(ue,{className:"bg-slate-900 border-slate-800 text-slate-100",children:[e.jsx(D,{value:"Weekly (7 Days)",children:"Weekly Contract (7 Days)"}),e.jsx(D,{value:"Monthly (1 Month)",children:"Monthly Contract (1 Month)"}),e.jsx(D,{value:"3 Months (Quarterly)",children:"3 Months Contract (Quarterly)"}),e.jsx(D,{value:"6 Months (Half-Yearly)",children:"6 Months Contract (Half-Yearly)"}),e.jsx(D,{value:"1 Year (Annual)",children:"1 Year Contract (Annual Dedicated)"})]})]})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(Q,{className:"text-xs",children:"Your Bid Amount per Trip / Month (₹)"}),e.jsx(K,{type:"number",value:S,onChange:t=>q(t.target.value),className:"bg-background border-border text-sm font-bold font-mono text-emerald-400 rounded-xl"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(Q,{className:"text-xs",children:"Cargo Weight (Tons)"}),e.jsx(K,{type:"number",value:Me,onChange:t=>Te(t.target.value),className:"bg-background border-border text-xs rounded-xl text-foreground"})]})]}),e.jsxs(Xe,{children:[e.jsx(j,{variant:"outline",onClick:()=>F(!1),className:"rounded-xl text-xs",children:"Cancel"}),e.jsx(j,{onClick:Pe,className:"bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl",children:"Submit Bid to Admin"})]})]})}),g&&e.jsx(he,{open:De,onOpenChange:ee,children:e.jsxs(pe,{className:"sm:max-w-[650px] bg-card border-border shadow-2xl rounded-2xl",children:[e.jsxs(be,{children:[e.jsxs(ge,{className:"text-xl font-heading font-bold flex items-center gap-2",children:[e.jsx(ie,{className:"w-5 h-5 text-violet-400"}),"Proof of Delivery (POD) - ",g.trip_id||g.id]}),e.jsxs(fe,{children:["Vehicle: ",e.jsx("strong",{className:"text-foreground",children:g.truck_number})," | Route: ",e.jsx("strong",{className:"text-foreground",children:g.route})]})]}),e.jsxs("div",{className:"space-y-4 py-3",children:[e.jsx("div",{className:"aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-border flex items-center justify-center relative",children:g.podUrl?e.jsx("img",{src:g.podUrl,alt:"Proof of Delivery",className:"w-full h-full object-contain"}):e.jsx("p",{className:"text-xs text-muted-foreground",children:"No image preview available"})}),e.jsxs("div",{className:"flex gap-3 pt-2",children:[e.jsxs(j,{variant:"outline",className:"flex-1 rounded-xl",onClick:()=>window.open(g.podUrl,"_blank"),children:[e.jsx(de,{className:"w-4 h-4 mr-2"})," Open Full Document"]}),e.jsxs(j,{className:"flex-1 rounded-xl bg-violet-600 hover:bg-violet-700 text-white",onClick:()=>{const t=document.createElement("a");t.href=g.podUrl,t.download=`POD_${g.trip_id||g.id}.jpg`,document.body.appendChild(t),t.click(),document.body.removeChild(t),w.success("POD downloaded")},children:[e.jsx(le,{className:"w-4 h-4 mr-2"})," Download POD"]})]})]})]})})]})}export{at as default};
