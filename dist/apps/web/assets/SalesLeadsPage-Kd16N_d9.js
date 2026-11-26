import { r as React } from "./vendor-react-Bs5V2qFE.js";
import { p as pb, t as toast } from "./index-F7L3R9.js";
const { useState, useEffect, useMemo } = React;
const PIPELINE_STAGES = [
  { id: "New Prospect", label: "New Prospect", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  { id: "Discussion", label: "Discussion", color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
  { id: "Quote Submitted", label: "Quote Submitted", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  { id: "Vendor Registration", label: "Vendor Empanelment", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  { id: "Contract Negotiation", label: "Negotiation", color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" },
  { id: "Won - Active", label: "Won / Onboarded", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  { id: "Lost", label: "Lost", color: "bg-rose-500/15 text-rose-400 border-rose-500/30" }
];
const VENDOR_STATUSES = [
  "Not Started",
  "Docs Submitted",
  "Under Review",
  "Vendor Code Approved",
  "Rejected"
];
const LEAD_TYPES = [
  "Corporate Freight",
  "Warehouse & Distribution",
  "Spot Load",
  "Contract Dedicated Fleet",
  "Transporter / Fleet Partner",
  "Broker / Truck Owner",
  "Other"
];
const isPartnerLead = (lead) => {
  const lt = String(lead?.lead_type || "").toLowerCase();
  return lt.includes("transporter") || lt.includes("fleet partner") || lt.includes("broker") || lt.includes("truck owner");
};
export default function SalesLeadsPro() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackFilter, setTrackFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [convertingId, setConvertingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_person: "",
    phone: "",
    email: "",
    city_state: "",
    lead_type: "Corporate Freight",
    pipeline_stage: "New Prospect",
    vendor_reg_status: "Not Started",
    vendor_code: "",
    contract_value: "",
    est_monthly_trips: "",
    next_follow_up: "",
    credit_terms_days: "30",
    notes: ""
  });
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const [salesLeads, quotesRecords] = await Promise.all([
        pb.collection("sales_leads").getFullList({ sort: "-created", $autoCancel: false }).catch(() => []),
        pb.collection("quotes").getFullList({ sort: "-created", $autoCancel: false }).catch(() => [])
      ]);
      let localQuotes = [];
      try {
        localQuotes = JSON.parse(localStorage.getItem("jbc_public_quotes") || "[]");
      } catch (_) {
      }
      const leadMap = /* @__PURE__ */ new Map();
      (salesLeads || []).forEach((l) => {
        const k = (l.company_name || l.contact_person || l.id || "").toLowerCase().trim();
        if (k) leadMap.set(k, l);
      });
      [...quotesRecords || [], ...localQuotes || []].forEach((q) => {
        const k = (q.customer_name || q.quote_number || q.id || "").toLowerCase().trim();
        if (k && !leadMap.has(k)) {
          let stg = "Quote Submitted";
          if (q.status === "Accepted") stg = "Won - Active";
          else if (q.status === "Rejected") stg = "Lost";
          leadMap.set(k, {
            id: "quote_" + (q.id || Date.now()),
            isQuoteDerived: true,
            company_name: q.customer_name || "Quote Inquiry",
            contact_person: q.contact_person || q.customer_name || "",
            phone: q.customer_phone || q.phone || "",
            email: q.customer_email || q.email || "",
            city_state: [q.origin, q.destination].filter(Boolean).join(" -> "),
            lead_type: "Spot Load",
            pipeline_stage: stg,
            vendor_reg_status: "Not Started",
            contract_value: Number(q.quoted_amount || q.total_amount || 0),
            notes: q.notes || `Quote #${q.quote_number || q.id || ""}`,
            created: q.created || (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      });
      setLeads(Array.from(leadMap.values()));
    } catch (err) {
      console.error("Failed to fetch leads:", err);
      toast.error("Failed to load Sales & Partner Leads");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLeads();
  }, []);
  const openModal = (lead = null) => {
    setEditingLead(lead && !lead.isQuoteDerived ? lead : null);
    if (lead) {
      setFormData({
        company_name: lead.company_name || "",
        contact_person: lead.contact_person || "",
        phone: lead.phone || "",
        email: lead.email || "",
        city_state: lead.city_state || "",
        lead_type: lead.lead_type || "Corporate Freight",
        pipeline_stage: lead.pipeline_stage || "New Prospect",
        vendor_reg_status: lead.vendor_reg_status || "Not Started",
        vendor_code: lead.vendor_code || "",
        contract_value: lead.contract_value || "",
        est_monthly_trips: lead.est_monthly_trips || "",
        next_follow_up: lead.next_follow_up ? String(lead.next_follow_up).split("T")[0] : "",
        credit_terms_days: lead.credit_terms_days || "30",
        notes: lead.notes || ""
      });
    } else {
      setFormData({
        company_name: "",
        contact_person: "",
        phone: "",
        email: "",
        city_state: "",
        lead_type: trackFilter === "partners" ? "Transporter / Fleet Partner" : "Corporate Freight",
        pipeline_stage: "New Prospect",
        vendor_reg_status: "Not Started",
        vendor_code: "",
        contract_value: "",
        est_monthly_trips: "",
        next_follow_up: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        credit_terms_days: "30",
        notes: ""
      });
    }
    setIsModalOpen(true);
  };
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.company_name.trim()) return toast.error("Company / Partner Name is required");
    setSubmitting(true);
    try {
      const payload = {
        company_name: formData.company_name.trim(),
        contact_person: formData.contact_person.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        city_state: formData.city_state.trim(),
        lead_type: formData.lead_type,
        pipeline_stage: formData.pipeline_stage,
        vendor_reg_status: formData.vendor_reg_status,
        vendor_code: formData.vendor_code.trim(),
        contract_value: Number(formData.contract_value) || 0,
        est_monthly_trips: Number(formData.est_monthly_trips) || 0,
        next_follow_up: formData.next_follow_up || "",
        credit_terms_days: Number(formData.credit_terms_days) || 30,
        notes: formData.notes.trim()
      };
      if (editingLead) {
        await pb.collection("sales_leads").update(editingLead.id, payload, { $autoCancel: false });
        toast.success("Lead updated");
      } else {
        await pb.collection("sales_leads").create(payload, { $autoCancel: false });
        toast.success("New lead added to pipeline");
      }
      setIsModalOpen(false);
      fetchLeads();
    } catch (err) {
      toast.error(err.message || "Failed to save lead");
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (lead) => {
    if (lead.isQuoteDerived) return toast.info("Quote-derived inquiries cannot be deleted here");
    if (!window.confirm(`Delete lead "${lead.company_name}"?`)) return;
    try {
      await pb.collection("sales_leads").delete(lead.id, { $autoCancel: false });
      toast.success("Lead deleted");
      fetchLeads();
    } catch (err) {
      toast.error("Failed to delete lead");
    }
  };
  const handleConvertToClient = async (lead) => {
    setConvertingId(lead.id);
    try {
      await pb.collection("clients").create({
        client_name: lead.company_name,
        company_name: lead.company_name,
        contact_person: lead.contact_person || lead.company_name,
        phone: lead.phone || "-",
        email: lead.email || "",
        address: lead.city_state || "",
        payment_terms: (lead.credit_terms_days || 30) + " Days",
        status: "Active",
        notes: `Converted from Sales Lead. ${lead.vendor_code ? "Vendor Code: " + lead.vendor_code : ""}`
      }, { $autoCancel: false });
      if (!lead.isQuoteDerived) {
        await pb.collection("sales_leads").update(lead.id, { pipeline_stage: "Won - Active" }, { $autoCancel: false }).catch(() => {
        });
      }
      toast.success(`"${lead.company_name}" converted to Active Client in Clients List!`);
      fetchLeads();
    } catch (err) {
      toast.error(err.message || "Failed to convert to client");
    } finally {
      setConvertingId(null);
    }
  };
  const handleOnboardPartner = async (lead) => {
    setConvertingId(lead.id);
    try {
      await pb.collection("contacts").create({
        company_name: lead.company_name,
        contact_person: lead.contact_person || lead.company_name,
        contact_type: "Transporter",
        primary_category: "Transporter",
        phone_number: lead.phone || "",
        email: lead.email || "",
        physical_address: lead.city_state || "",
        notes: `Onboarded from Partner Pipeline. ${lead.notes || ""}`
      }, { $autoCancel: false });
      if (!lead.isQuoteDerived) {
        await pb.collection("sales_leads").update(lead.id, { pipeline_stage: "Won - Active", vendor_reg_status: "Vendor Code Approved" }, { $autoCancel: false }).catch(() => {
        });
      }
      toast.success(`"${lead.company_name}" onboarded to Contacts & AI Marketplace!`);
      fetchLeads();
    } catch (err) {
      toast.error(err.message || "Failed to onboard partner");
    } finally {
      setConvertingId(null);
    }
  };
  const handleWhatsAppPitch = (lead) => {
    const clean = String(lead.phone || "").replace(/\D/g, "");
    const target = clean ? clean.length === 10 ? "91" + clean : clean : "";
    const partner = isPartnerLead(lead);
    const msg = partner ? `\u{1F69A} *JAI BHAVANI CARGO - TRANSPORTER PARTNER ONBOARDING*

Hello *${lead.contact_person || lead.company_name}*,
We have regular Pan-India container & FTL loads (Hyderabad, Bengaluru, Pune, Delhi NCR) with fast freight settlement.

Share your available truck sizes & RC details to receive live load alerts!` : `\u{1F3E2} *JAI BHAVANI CARGO - CORPORATE LOGISTICS PROPOSAL*

Dear *${lead.contact_person || lead.company_name}*,
Following up regarding your freight requirement${lead.city_state ? " (" + lead.city_state + ")" : ""}.

\u2022 GSTIN: 36DPXPR9171A1Z8
\u2022 Dedicated 20FT / 24FT / 32FT SXL-MXL Fleet
\u2022 Live GPS Tracking & Digital POD

Let us know when we can schedule a quick call.`;
    window.open(`https://wa.me/${target}?text=${encodeURIComponent(msg)}`, "_blank");
  };
  const handleExportCsv = () => {
    const rows = [
      ["Company", "Track", "Contact", "Phone", "Route/City", "Stage", "Vendor Status", "Value (INR)", "Follow-Up"],
      ...filteredLeads.map((l) => [
        l.company_name || "",
        isPartnerLead(l) ? "Transporter Partner" : "Corporate Shipper",
        l.contact_person || "",
        l.phone || "",
        l.city_state || "",
        l.pipeline_stage || "",
        l.vendor_reg_status || "",
        l.contract_value || 0,
        l.next_follow_up || ""
      ])
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sales_and_partner_pipeline.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Pipeline CSV exported");
  };
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const kpis = useMemo(() => {
    const shippers = leads.filter((l) => !isPartnerLead(l)).length;
    const partners = leads.filter((l) => isPartnerLead(l)).length;
    const pipelineValue = leads.filter((l) => l.pipeline_stage !== "Lost").reduce((s, l) => s + (Number(l.contract_value) || 0), 0);
    const followUpsDue = leads.filter((l) => l.next_follow_up && l.next_follow_up <= todayStr && !["Won - Active", "Lost"].includes(l.pipeline_stage)).length;
    const won = leads.filter((l) => l.pipeline_stage === "Won - Active").length;
    return { shippers, partners, pipelineValue, followUpsDue, won };
  }, [leads, todayStr]);
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (trackFilter === "shippers" && isPartnerLead(l)) return false;
      if (trackFilter === "partners" && !isPartnerLead(l)) return false;
      if (stageFilter !== "all" && l.pipeline_stage !== stageFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (l.company_name || "").toLowerCase().includes(q) || (l.contact_person || "").toLowerCase().includes(q) || (l.phone || "").toLowerCase().includes(q) || (l.city_state || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [leads, trackFilter, stageFilter, searchQuery]);
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30" }, "Growth & Onboarding Funnel"), /* @__PURE__ */ React.createElement("h1", { className: "text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight" }, "Sales & Transporter Partner Pipeline"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-0.5" }, "Acquire new Corporate Shippers & onboard Market Transporters, track follow-ups, and convert into Clients or Marketplace Partners in 1 click.")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: handleExportCsv, className: "px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer" }, "Export CSV"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => openModal(null), className: "px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg cursor-pointer" }, "+ Add New Lead"))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-5 gap-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-slate-400 uppercase" }, "Pipeline Value"), /* @__PURE__ */ React.createElement("div", { className: "text-xl font-black text-emerald-400 mt-1" }, "\u20B9", kpis.pipelineValue.toLocaleString("en-IN"))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-slate-400 uppercase" }, "Corporate Shippers"), /* @__PURE__ */ React.createElement("div", { className: "text-xl font-black text-white mt-1" }, kpis.shippers)), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-slate-400 uppercase" }, "Transporter Partners"), /* @__PURE__ */ React.createElement("div", { className: "text-xl font-black text-purple-400 mt-1" }, kpis.partners)), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-amber-500/30 rounded-2xl p-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-amber-400 uppercase" }, "Follow-Ups Due"), /* @__PURE__ */ React.createElement("div", { className: "text-xl font-black text-amber-400 mt-1" }, kpis.followUpsDue)), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-emerald-500/30 rounded-2xl p-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-emerald-400 uppercase" }, "Won / Onboarded"), /* @__PURE__ */ React.createElement("div", { className: "text-xl font-black text-emerald-400 mt-1" }, kpis.won))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit text-xs" }, [
    ["all", `All Leads (${leads.length})`],
    ["shippers", `Corporate Shippers (${kpis.shippers})`],
    ["partners", `Transporter Partners (${kpis.partners})`]
  ].map(([id, lbl]) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: id,
      type: "button",
      onClick: () => setTrackFilter(id),
      className: `px-3 py-1.5 rounded-lg font-bold cursor-pointer transition ${trackFilter === id ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`
    },
    lbl
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: searchQuery,
      onChange: (e) => setSearchQuery(e.target.value),
      placeholder: "Search company, phone, city...",
      className: "bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white w-56 focus:outline-none focus:border-blue-500"
    }
  ), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: stageFilter,
      onChange: (e) => setStageFilter(e.target.value),
      className: "bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
    },
    /* @__PURE__ */ React.createElement("option", { value: "all" }, "All Stages"),
    PIPELINE_STAGES.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.id }, s.label))
  ), /* @__PURE__ */ React.createElement("div", { className: "flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setViewMode("table"), className: `px-3 py-1.5 rounded-lg font-bold cursor-pointer ${viewMode === "table" ? "bg-slate-700 text-white" : "text-slate-400"}` }, "List"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setViewMode("kanban"), className: `px-3 py-1.5 rounded-lg font-bold cursor-pointer ${viewMode === "kanban" ? "bg-slate-700 text-white" : "text-slate-400"}` }, "Board")))), loading ? /* @__PURE__ */ React.createElement("div", { className: "py-12 text-center text-slate-400 text-sm" }, "Loading pipeline...") : filteredLeads.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "py-14 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-slate-300 font-bold" }, "No leads match this filter.")) : viewMode === "kanban" ? /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4" }, PIPELINE_STAGES.filter((s) => stageFilter === "all" || s.id === stageFilter).map((stage) => {
    const stageLeads = filteredLeads.filter((l) => l.pipeline_stage === stage.id);
    return /* @__PURE__ */ React.createElement("div", { key: stage.id, className: "bg-slate-900/70 border border-slate-800 rounded-2xl p-3 space-y-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between pb-2 border-b border-slate-800" }, /* @__PURE__ */ React.createElement("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold border ${stage.color}` }, stage.label), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono font-bold text-slate-400" }, stageLeads.length)), /* @__PURE__ */ React.createElement("div", { className: "space-y-2 max-h-[60vh] overflow-y-auto pr-1" }, stageLeads.map((lead) => /* @__PURE__ */ React.createElement("div", { key: lead.id, className: "p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-white leading-snug" }, lead.company_name), /* @__PURE__ */ React.createElement("span", { className: `px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${isPartnerLead(lead) ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"}` }, isPartnerLead(lead) ? "Partner" : "Shipper")), lead.city_state && /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-400" }, lead.city_state), Number(lead.contract_value) > 0 && /* @__PURE__ */ React.createElement("div", { className: "font-mono font-bold text-emerald-400" }, "\u20B9", Number(lead.contract_value).toLocaleString("en-IN")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1 pt-1" }, lead.phone && /* @__PURE__ */ React.createElement("a", { href: `tel:${String(lead.phone).replace(/\D/g, "")}`, className: "px-2 py-1 rounded bg-blue-600 text-white font-bold text-[10px]" }, "Call"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => handleWhatsAppPitch(lead), className: "px-2 py-1 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] cursor-pointer" }, "WA"), lead.pipeline_stage !== "Won - Active" && /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        disabled: convertingId === lead.id,
        onClick: () => isPartnerLead(lead) ? handleOnboardPartner(lead) : handleConvertToClient(lead),
        className: "px-2 py-1 rounded bg-amber-500 text-slate-950 font-black text-[10px] cursor-pointer"
      },
      isPartnerLead(lead) ? "Onboard" : "Convert"
    ), !lead.isQuoteDerived && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => openModal(lead), className: "px-2 py-1 rounded bg-slate-800 text-slate-300 font-bold text-[10px] cursor-pointer" }, "Edit"))))));
  })) : /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-xs text-left" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Lead / Track"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Contact & Route"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Stage & Follow-Up"), /* @__PURE__ */ React.createElement("th", { className: "p-3 text-right" }, "Est. Value"), /* @__PURE__ */ React.createElement("th", { className: "p-3 text-right" }, "Actions & 1-Click Convert"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-800" }, filteredLeads.map((lead) => {
    const partner = isPartnerLead(lead);
    const stgObj = PIPELINE_STAGES.find((s) => s.id === lead.pipeline_stage) || PIPELINE_STAGES[0];
    const isDue = lead.next_follow_up && lead.next_follow_up <= todayStr && !["Won - Active", "Lost"].includes(lead.pipeline_stage);
    return /* @__PURE__ */ React.createElement("tr", { key: lead.id, className: "hover:bg-slate-800/40" }, /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-white text-sm" }, lead.company_name), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 mt-1" }, /* @__PURE__ */ React.createElement("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${partner ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"}` }, partner ? "Transporter Partner" : "Corporate Shipper"), lead.vendor_code && /* @__PURE__ */ React.createElement("span", { className: "font-mono text-[10px] text-amber-400" }, "Code: ", lead.vendor_code))), /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-slate-200 font-semibold" }, lead.contact_person || "\u2014"), /* @__PURE__ */ React.createElement("div", { className: "font-mono text-slate-400" }, lead.phone || "No phone"), lead.city_state && /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-500" }, lead.city_state)), /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold border ${stgObj.color}` }, stgObj.label), lead.next_follow_up && /* @__PURE__ */ React.createElement("div", { className: `text-[10px] mt-1 font-bold ${isDue ? "text-amber-400" : "text-slate-400"}` }, isDue ? "Follow-up Due: " : "Next: ", lead.next_follow_up)), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-right font-mono font-bold text-emerald-400" }, Number(lead.contract_value) > 0 ? `\u20B9${Number(lead.contract_value).toLocaleString("en-IN")}` : "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end gap-1.5 flex-wrap" }, lead.phone && /* @__PURE__ */ React.createElement("a", { href: `tel:${String(lead.phone).replace(/\D/g, "")}`, className: "px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold" }, "Call"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => handleWhatsAppPitch(lead), className: "px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold cursor-pointer" }, "WhatsApp"), lead.pipeline_stage !== "Won - Active" && /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        disabled: convertingId === lead.id,
        onClick: () => partner ? handleOnboardPartner(lead) : handleConvertToClient(lead),
        className: "px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer"
      },
      convertingId === lead.id ? "..." : partner ? "Onboard Partner" : "Convert to Client"
    ), !lead.isQuoteDerived && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => openModal(lead), className: "px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer" }, "Edit"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => handleDelete(lead), className: "px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold cursor-pointer" }, "\u2715")))));
  }))))), isModalOpen && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto my-auto" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-black text-white" }, editingLead ? "Edit Lead" : "Add New Sales / Partner Lead"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setIsModalOpen(false), className: "text-slate-400 hover:text-white" }, "\u2715")), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSave, className: "space-y-3 text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Company / Partner Name *"), /* @__PURE__ */ React.createElement("input", { required: true, value: formData.company_name, onChange: (e) => setFormData({ ...formData, company_name: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Lead Track / Type"), /* @__PURE__ */ React.createElement("select", { value: formData.lead_type, onChange: (e) => setFormData({ ...formData, lead_type: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" }, LEAD_TYPES.map((t) => /* @__PURE__ */ React.createElement("option", { key: t, value: t }, t))))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Contact Person"), /* @__PURE__ */ React.createElement("input", { value: formData.contact_person, onChange: (e) => setFormData({ ...formData, contact_person: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Mobile / Phone"), /* @__PURE__ */ React.createElement("input", { value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Email"), /* @__PURE__ */ React.createElement("input", { value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" }))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "City / Lane"), /* @__PURE__ */ React.createElement("input", { value: formData.city_state, onChange: (e) => setFormData({ ...formData, city_state: e.target.value }), placeholder: "Hyderabad -> Pune", className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Pipeline Stage"), /* @__PURE__ */ React.createElement("select", { value: formData.pipeline_stage, onChange: (e) => setFormData({ ...formData, pipeline_stage: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" }, PIPELINE_STAGES.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.id }, s.label)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Next Follow-Up Date"), /* @__PURE__ */ React.createElement("input", { type: "date", value: formData.next_follow_up, onChange: (e) => setFormData({ ...formData, next_follow_up: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" }))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Est. Monthly Value (\u20B9)"), /* @__PURE__ */ React.createElement("input", { type: "number", value: formData.contract_value, onChange: (e) => setFormData({ ...formData, contract_value: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Vendor Empanelment"), /* @__PURE__ */ React.createElement("select", { value: formData.vendor_reg_status, onChange: (e) => setFormData({ ...formData, vendor_reg_status: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" }, VENDOR_STATUSES.map((v) => /* @__PURE__ */ React.createElement("option", { key: v, value: v }, v)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Vendor Code"), /* @__PURE__ */ React.createElement("input", { value: formData.vendor_code, onChange: (e) => setFormData({ ...formData, vendor_code: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono" }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-slate-300 mb-1" }, "Notes"), /* @__PURE__ */ React.createElement("textarea", { rows: 2, value: formData.notes, onChange: (e) => setFormData({ ...formData, notes: e.target.value }), className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" })), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end gap-2 pt-2" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setIsModalOpen(false), className: "px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold" }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "submit", disabled: submitting, className: "px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold cursor-pointer" }, submitting ? "Saving..." : "Save Lead"))))));
}
