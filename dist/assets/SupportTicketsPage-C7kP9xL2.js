import {
  r as React,
  bs as Helmet,
  a0 as FileTextIcon,
  c4 as FileCheckIcon,
  b2 as RefreshIcon,
  at as SearchIcon,
  az as FilterIcon,
  a5 as CheckCircleIcon,
  an as PlusIcon,
  aE as EyeIcon,
  a1 as DownloadIcon,
  ay as UploadIcon,
  d3 as PrinterIcon,
  bU as ShareIcon,
  X as CloseIcon,
  ax as CameraIcon,
  a6 as TruckIcon
} from "./vendor-react-Bs5V2qFE.js";
import {
  B as Button,
  I as Input,
  C as Card,
  O as CardContent,
  p as pb,
  t as toast
} from "./index-DLxf9dwO.js";
import "./vendor-radix-BQCqNqg0.js";
import "./vendor-pdf-DtmgLs_2.js";
const { useState, useEffect, useMemo, useRef } = React;
function SupportTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [clients, setClients] = useState({});
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [createForm, setCreateForm] = useState({
    clientId: "",
    tripId: "",
    category: "delay",
    priority: "high",
    subject: "",
    description: "",
    attachmentUrl: ""
  });
  const loadData = async () => {
    setLoading(true);
    try {
      const clientList = await pb.collection("clients").getFullList({ $autoCancel: false }).catch(() => []);
      const cMap = {};
      clientList.forEach((cl) => {
        cMap[cl.id] = cl.company_name || cl.name || "Client Partner";
      });
      setClients(cMap);
      const tripList = await pb.collection("trip_logs").getFullList({ sort: "-date", $autoCancel: false }).catch(() => []);
      setTrips(tripList);
      const saved = localStorage.getItem("jc_support_tickets");
      if (saved) {
        setTickets(JSON.parse(saved));
      } else {
        const seedTickets = [
          {
            id: "tkt-001",
            ticket_number: "JBC/TKT/0001",
            client_id: "client-001",
            client_name: "Amazon India Transportation",
            trip_id: "trip-280",
            trip_number: "TRIP-280",
            lr_number: "JBC/26-27/000280",
            truck_number: "TG12U2637",
            driver_name: "Ramesh Kumar",
            driver_phone: "+91 98480 12345",
            category: "delay",
            priority: "urgent",
            subject: "Transit Delay on Hyderabad to Warangal Highway",
            description: "Shipment #TRIP-280 has been stationary near Aler bypass for over 3 hours. Urgent dock delivery scheduled for 15:30 today.",
            attachments: [],
            status: "investigating",
            is_escalated: false,
            messages: [
              {
                id: "msg-1",
                sender_type: "client",
                sender_name: "Amazon Logistics Team",
                message: "Dock slot D1 at Warangal FC requires this container by 15:30. Driver is not responding to our IVR.",
                created_at: "2026-09-30T10:15:00Z"
              },
              {
                id: "msg-2",
                sender_type: "admin",
                sender_name: "JBC Operations (Suresh)",
                is_internal_note: false,
                message: "Spoke directly with Driver Ramesh. Minor tyre puncture near highway dhaba. Tyre technician has reached and truck will resume transit within 25 mins. Revised ETA 15:15.",
                created_at: "2026-09-30T10:35:00Z"
              }
            ],
            created_at: "2026-09-30T10:10:00Z",
            updated_at: "2026-09-30T10:35:00Z"
          },
          {
            id: "tkt-002",
            ticket_number: "JBC/TKT/0002",
            client_id: "client-002",
            client_name: "Flipkart India Pvt Ltd",
            trip_id: "trip-279",
            trip_number: "TRIP-279",
            lr_number: "JBC/26-27/000279",
            truck_number: "TS09UB8844",
            driver_name: "Mahesh Rathod",
            driver_phone: "+91 98765 43210",
            category: "damage",
            priority: "high",
            subject: "Outer Carton Water Damage on Electronics Consignment",
            description: "Upon unloading at Bengaluru Hub, 2 corrugated master cartons were found damp due to rain seepage near rear container seal.",
            attachments: [
              "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80"
            ],
            status: "escalated",
            is_escalated: true,
            escalated_at: "2026-09-30T11:00:00Z",
            escalation_reason: "High-value electronics claim exceeding \u20B950,000 threshold. Escalated to senior management.",
            messages: [
              {
                id: "msg-3",
                sender_type: "client",
                sender_name: "Flipkart QC Inward",
                message: "Attached photograph of water ingress on carton barcode #FK-99210. Claim surveyor needs to be assigned.",
                attachments: [
                  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80"
                ],
                created_at: "2026-09-29T16:20:00Z"
              },
              {
                id: "msg-4",
                sender_type: "admin",
                sender_name: "Vinod Rathod (Director)",
                is_internal_note: false,
                message: "Escalated to operations@jaibhavanicargo.com. Transit insurance surveyor notified. Our Bengaluru field supervisor is visiting your warehouse at 11:30 AM to inspect inner sealed contents.",
                created_at: "2026-09-30T09:00:00Z"
              }
            ],
            created_at: "2026-09-29T16:15:00Z",
            updated_at: "2026-09-30T09:00:00Z"
          },
          {
            id: "tkt-003",
            ticket_number: "JBC/TKT/0003",
            client_id: "client-003",
            client_name: "Reliance Retail Supply Chain",
            trip_id: "trip-275",
            trip_number: "TRIP-275",
            lr_number: "JBC/26-27/000275",
            truck_number: "TG12U2637",
            driver_name: "Ramesh Kumar",
            driver_phone: "+91 98480 12345",
            category: "pod",
            priority: "medium",
            subject: "Request for Clean Stamped Physical POD Copy",
            description: "Client finance requires physical copy with receiver round rubber stamp for invoice clearance of \u20B945,000.",
            attachments: [],
            status: "resolved",
            is_escalated: false,
            resolution_summary: "Clean stamped POD re-scanned in high resolution and uploaded to client POD vault. Physical original couriered via DTDC #DT12345.",
            resolved_at: "2026-09-29T14:00:00Z",
            resolved_by: "JBC Dispatch Officer",
            rating: 5,
            rating_feedback: "Fast resolution and very cooperative dispatch team. Thanks!",
            rated_at: "2026-09-29T15:30:00Z",
            messages: [
              {
                id: "msg-5",
                sender_type: "client",
                sender_name: "Reliance Accounts",
                message: "The uploaded POD copy has a faint stamp. Can you provide a re-scan?",
                created_at: "2026-09-29T11:00:00Z"
              },
              {
                id: "msg-6",
                sender_type: "admin",
                sender_name: "JBC Admin",
                message: "Re-uploaded HD scan to your POD vault. Physical bill couriered.",
                created_at: "2026-09-29T14:00:00Z"
              }
            ],
            created_at: "2026-09-29T10:45:00Z",
            updated_at: "2026-09-29T15:30:00Z"
          }
        ];
        localStorage.setItem("jc_support_tickets", JSON.stringify(seedTickets));
        setTickets(seedTickets);
      }
    } catch (err) {
      console.error("Error loading tickets data:", err);
      toast.error("Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("jc-store-update", handleUpdate);
    return () => window.removeEventListener("jc-store-update", handleUpdate);
  }, []);
  const saveTickets = (updated) => {
    setTickets(updated);
    localStorage.setItem("jc_support_tickets", JSON.stringify(updated));
    window.dispatchEvent(new Event("jc-store-update"));
  };
  const handleUpdateStatus = (ticketId, nextStatus) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: nextStatus,
          is_escalated: nextStatus === "escalated" ? true : t.is_escalated,
          escalated_at: nextStatus === "escalated" ? (/* @__PURE__ */ new Date()).toISOString() : t.escalated_at,
          resolved_at: nextStatus === "resolved" ? (/* @__PURE__ */ new Date()).toISOString() : t.resolved_at,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      return t;
    });
    saveTickets(updated);
    if (activeTicket && activeTicket.id === ticketId) {
      setActiveTicket(updated.find((t) => t.id === ticketId));
    }
    toast.success("Ticket status updated to " + nextStatus.toUpperCase());
  };
  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;
    const newMsg = {
      id: "msg-" + Date.now(),
      sender_type: "admin",
      sender_name: isInternalNote ? "JBC Internal Staff Note" : "JBC Operations Dispatch",
      is_internal_note: isInternalNote,
      message: replyText.trim(),
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const updated = tickets.map((t) => {
      if (t.id === activeTicket.id) {
        return {
          ...t,
          messages: [...t.messages || [], newMsg],
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      return t;
    });
    saveTickets(updated);
    setActiveTicket(updated.find((t) => t.id === activeTicket.id));
    setReplyText("");
    toast.success(isInternalNote ? "Internal note saved." : "Reply sent to client.");
  };
  const handleEscalateToSeniorMgmt = (ticket) => {
    const reason = window.prompt(
      "Reason for escalating to Senior Management (operations@jaibhavanicargo.com):",
      "High priority client inquiry requiring director/fleet manager intervention."
    );
    if (reason === null) return;
    const updated = tickets.map((t) => {
      if (t.id === ticket.id) {
        return {
          ...t,
          status: "escalated",
          is_escalated: true,
          escalated_at: (/* @__PURE__ */ new Date()).toISOString(),
          escalation_reason: reason.trim(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      return t;
    });
    saveTickets(updated);
    if (activeTicket && activeTicket.id === ticket.id) {
      setActiveTicket(updated.find((t) => t.id === ticket.id));
    }
    toast.success("Ticket escalated to operations@jaibhavanicargo.com!");
  };
  const handleWhatsAppManagementAlert = (ticket) => {
    const text = encodeURIComponent(
      "*URGENT ESCALATION ALERT | JAI BHAVANI CARGO*\n\n\u{1F6A8} *Ticket Number:* " + ticket.ticket_number + "\n\u{1F3E2} *Client:* " + ticket.client_name + "\n\u26A0\uFE0F *Issue Type:* " + ticket.category.toUpperCase() + "\n\u{1F69A} *Vehicle:* " + (ticket.truck_number || "Unassigned") + "\n\u{1F464} *Driver:* " + (ticket.driver_name || "N/A") + " (" + (ticket.driver_phone || "N/A") + ")\n\u{1F4DD} *Subject:* " + ticket.subject + "\n\nEscalated to Senior Management at operations@jaibhavanicargo.com\nView live ticket: https://www.jaibhavanicargo.com/support-tickets"
    );
    window.open("https://api.whatsapp.com/send?phone=917794072244&text=" + text, "_blank");
  };
  const handleSubmitCreateTicket = (e) => {
    e.preventDefault();
    if (!createForm.subject.trim()) {
      toast.error("Subject is required.");
      return;
    }
    const linkedTrip = trips.find((t) => t.id === createForm.tripId);
    const clientName = clients[createForm.clientId] || (linkedTrip ? clients[linkedTrip.client_id] || linkedTrip.client_name : "Direct Client");
    const newTicket = {
      id: "tkt-" + Date.now(),
      ticket_number: "JBC/TKT/" + String(tickets.length + 1).padStart(4, "0"),
      client_id: createForm.clientId || (linkedTrip?.client_id || ""),
      client_name: clientName,
      trip_id: linkedTrip?.id || "",
      trip_number: linkedTrip?.trip_id || linkedTrip?.id || "",
      lr_number: linkedTrip?.lr_number || linkedTrip?.client_trip_id || "",
      truck_number: linkedTrip?.truck_number || "",
      driver_name: linkedTrip?.driver_name || "",
      driver_phone: linkedTrip?.driver_phone || "",
      category: createForm.category,
      priority: createForm.priority,
      subject: createForm.subject.trim(),
      description: createForm.description.trim(),
      attachments: createForm.attachmentUrl ? [createForm.attachmentUrl.trim()] : [],
      status: "open",
      is_escalated: createForm.priority === "urgent",
      escalated_at: createForm.priority === "urgent" ? (/* @__PURE__ */ new Date()).toISOString() : void 0,
      messages: [
        {
          id: "msg-" + Date.now(),
          sender_type: "client",
          sender_name: clientName,
          message: createForm.description.trim() || createForm.subject.trim(),
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    saveTickets([newTicket, ...tickets]);
    setIsCreatingTicket(false);
    toast.success("New Support Ticket #" + newTicket.ticket_number + " created!");
  };
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === "open" || t.status === "investigating").length;
  const escalatedCount = tickets.filter((t) => t.is_escalated || t.status === "escalated").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;
  const ratedTickets = tickets.filter((t) => t.rating);
  const avgRating = ratedTickets.length > 0 ? (ratedTickets.reduce((sum, t) => sum + (t.rating || 0), 0) / ratedTickets.length).toFixed(1) : "5.0";
  const catDelay = tickets.filter((t) => t.category === "delay").length;
  const catDamage = tickets.filter((t) => t.category === "damage").length;
  const catPod = tickets.filter((t) => t.category === "pod").length;
  const catBilling = tickets.filter((t) => t.category === "billing").length;
  const catDriver = tickets.filter((t) => t.category === "driver").length;
  const catOther = tickets.filter((t) => t.category === "other").length;
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = search.toLowerCase();
      const num = (t.ticket_number || "").toLowerCase();
      const cl = (t.client_name || "").toLowerCase();
      const sb = (t.subject || "").toLowerCase();
      const tr = (t.truck_number || "").toLowerCase();
      const tp = (t.trip_number || "").toLowerCase();
      const matchesSearch = !q || num.includes(q) || cl.includes(q) || sb.includes(q) || tr.includes(q) || tp.includes(q);
      if (!matchesSearch) return false;
      if (statusFilter === "open" && !(t.status === "open" || t.status === "investigating")) return false;
      if (statusFilter === "escalated" && !t.is_escalated && t.status !== "escalated") return false;
      if (statusFilter === "resolved" && !(t.status === "resolved" || t.status === "closed")) return false;
      if (statusFilter === "damage" && t.category !== "damage") return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      return true;
    });
  }, [tickets, search, statusFilter, categoryFilter]);
  return /* @__PURE__ */ React.createElement("div", { className: "p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300" }, /* @__PURE__ */ React.createElement(Helmet, null, /* @__PURE__ */ React.createElement("title", null, "Support & Complaints Hub | Jai Bhavani Cargo")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold uppercase tracking-wider" }, "Dispute Resolution & Operations SLA"), /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-semibold" }, "operations@jaibhavanicargo.com")), /* @__PURE__ */ React.createElement("h1", { className: "text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3" }, /* @__PURE__ */ React.createElement(FileTextIcon, { className: "w-8 h-8 text-red-500" }), "Support & Complaints Management"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-sm mt-1 max-w-2xl" }, "Track client transit tickets, investigate cargo damages, manage senior management escalations & monitor CSAT scores.")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 flex-wrap" }, /* @__PURE__ */ React.createElement(
    Button,
    {
      onClick: loadData,
      variant: "outline",
      className: "rounded-xl border-slate-700 hover:bg-slate-800 text-slate-200"
    },
    /* @__PURE__ */ React.createElement(RefreshIcon, { className: "w-4 h-4 mr-2" }),
    "Refresh"
  ), /* @__PURE__ */ React.createElement(
    Button,
    {
      onClick: () => setIsCreatingTicket(true),
      className: "rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/20 cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(PlusIcon, { className: "w-4 h-4 mr-2" }),
    "Log Support Ticket"
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 p-4 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-xs font-bold uppercase tracking-wider" }, "Total Tickets"), /* @__PURE__ */ React.createElement("p", { className: "text-2xl sm:text-3xl font-black text-white mt-1 font-mono" }, totalCount), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-500 mt-1" }, "Logged cases")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 p-4 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-amber-400 text-xs font-bold uppercase tracking-wider" }, "Open / Investigating"), /* @__PURE__ */ React.createElement("p", { className: "text-2xl sm:text-3xl font-black text-amber-400 mt-1 font-mono" }, openCount), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-500 mt-1" }, "Requires team action")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 p-4 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-red-400 text-xs font-bold uppercase tracking-wider" }, "Escalated Critical"), /* @__PURE__ */ React.createElement("p", { className: "text-2xl sm:text-3xl font-black text-red-500 mt-1 font-mono" }, escalatedCount), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-500 mt-1" }, "Senior mgmt flagged")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 p-4 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-emerald-400 text-xs font-bold uppercase tracking-wider" }, "Resolved Cases"), /* @__PURE__ */ React.createElement("p", { className: "text-2xl sm:text-3xl font-black text-emerald-400 mt-1 font-mono" }, resolvedCount), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-500 mt-1" }, "Successfully closed")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 p-4 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-amber-300 text-xs font-bold uppercase tracking-wider" }, "CSAT Satisfaction"), /* @__PURE__ */ React.createElement("p", { className: "text-2xl sm:text-3xl font-black text-amber-300 mt-1 font-mono" }, avgRating, " \u2605"), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-500 mt-1" }, ratedTickets.length, " client reviews"))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center text-xs font-bold text-slate-300" }, /* @__PURE__ */ React.createElement("span", null, "TICKET ISSUE CATEGORIES:"), /* @__PURE__ */ React.createElement("span", { className: "text-slate-500" }, "Live Breakdown across Fleet")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-amber-400 font-semibold" }, "\u23F1\uFE0F Delay"), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold text-white" }, catDelay)), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-red-400 font-semibold" }, "\u{1F4E6} Damage"), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold text-white" }, catDamage)), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-blue-400 font-semibold" }, "\u{1F4C4} POD"), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold text-white" }, catPod)), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-emerald-400 font-semibold" }, "\u{1F4B5} Billing"), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold text-white" }, catBilling)), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-purple-400 font-semibold" }, "\u{1F69A} Driver"), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold text-white" }, catDriver)), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400 font-semibold" }, "\u2753 Other"), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold text-white" }, catOther)))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row items-center gap-3 bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-800" }, /* @__PURE__ */ React.createElement("div", { className: "relative flex-1 w-full" }, /* @__PURE__ */ React.createElement(SearchIcon, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" }), /* @__PURE__ */ React.createElement(
    Input,
    {
      placeholder: "Search tickets by ID, Client, Subject, Truck #, Trip ID...",
      value: search,
      onChange: (e) => setSearch(e.target.value),
      className: "pl-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl h-11"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 w-full sm:w-auto" }, /* @__PURE__ */ React.createElement(
    "select",
    {
      value: statusFilter,
      onChange: (e) => setStatusFilter(e.target.value),
      className: "bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 font-medium cursor-pointer h-11 w-full sm:w-auto outline-none focus:border-red-500"
    },
    /* @__PURE__ */ React.createElement("option", { value: "all" }, "All Statuses"),
    /* @__PURE__ */ React.createElement("option", { value: "open" }, "Open / Investigating"),
    /* @__PURE__ */ React.createElement("option", { value: "escalated" }, "\u{1F6A8} Escalated Critical"),
    /* @__PURE__ */ React.createElement("option", { value: "damage" }, "\u{1F4E6} Cargo Damage Claims"),
    /* @__PURE__ */ React.createElement("option", { value: "resolved" }, "\u2705 Resolved & Closed")
  ), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: categoryFilter,
      onChange: (e) => setCategoryFilter(e.target.value),
      className: "bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 font-medium cursor-pointer h-11 w-full sm:w-auto outline-none focus:border-red-500"
    },
    /* @__PURE__ */ React.createElement("option", { value: "all" }, "All Categories"),
    /* @__PURE__ */ React.createElement("option", { value: "delay" }, "Transit Delay"),
    /* @__PURE__ */ React.createElement("option", { value: "damage" }, "Cargo Damage"),
    /* @__PURE__ */ React.createElement("option", { value: "pod" }, "POD Issues"),
    /* @__PURE__ */ React.createElement("option", { value: "billing" }, "Billing / Invoice"),
    /* @__PURE__ */ React.createElement("option", { value: "driver" }, "Driver Conduct"),
    /* @__PURE__ */ React.createElement("option", { value: "other" }, "Other Inquiries")
  ))), /* @__PURE__ */ React.createElement(Card, { className: "border border-slate-800 bg-slate-900/60 rounded-3xl overflow-hidden shadow-2xl" }, /* @__PURE__ */ React.createElement(CardContent, { className: "p-0" }, loading ? /* @__PURE__ */ React.createElement("div", { className: "py-20 text-center text-slate-400" }, /* @__PURE__ */ React.createElement(RefreshIcon, { className: "w-8 h-8 animate-spin mx-auto text-red-500 mb-3" }), /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-sm" }, "Loading tickets from server...")) : filteredTickets.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "py-16 text-center text-slate-400" }, /* @__PURE__ */ React.createElement(FileCheckIcon, { className: "w-12 h-12 mx-auto text-slate-600 mb-2 opacity-50" }), /* @__PURE__ */ React.createElement("p", { className: "text-base font-bold text-slate-300" }, "No matching tickets found"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-1" }, "Adjust search filter or select another category.")) : /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left text-xs border-collapse" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "bg-slate-950/80 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-800" }, /* @__PURE__ */ React.createElement("th", { className: "p-3.5 pl-5" }, "Ticket # & Date"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Client & Contact"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Subject & Details"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Linked Consignment"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Category & Priority"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Status"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5 pr-5 text-right" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-800/60 text-slate-200" }, filteredTickets.map((t) => {
    const isEsc = t.is_escalated || t.status === "escalated";
    const isResolved = t.status === "resolved" || t.status === "closed";
    return /* @__PURE__ */ React.createElement("tr", { key: t.id, className: "hover:bg-slate-800/40 transition" }, /* @__PURE__ */ React.createElement("td", { className: "p-3.5 pl-5" }, /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded" }, t.ticket_number), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-slate-500 font-mono mt-1" }, t.created_at ? t.created_at.slice(0, 10) : "Today")), /* @__PURE__ */ React.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-white" }, t.client_name), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-slate-400" }, "ID: ", t.client_id || "Direct")), /* @__PURE__ */ React.createElement("td", { className: "p-3.5 max-w-[220px]" }, /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-slate-100 truncate", title: t.subject }, t.subject), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-400 line-clamp-1 mt-0.5" }, t.description), t.attachments && t.attachments.length > 0 && /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 text-[10px] text-blue-400 font-semibold mt-1" }, /* @__PURE__ */ React.createElement(CameraIcon, { className: "w-3 h-3" }), t.attachments.length, " Evidence Photo(s) Attached")), /* @__PURE__ */ React.createElement("td", { className: "p-3.5" }, t.truck_number ? /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 font-mono font-bold text-slate-200" }, /* @__PURE__ */ React.createElement(TruckIcon, { className: "w-3.5 h-3.5 text-slate-400" }), /* @__PURE__ */ React.createElement("span", null, t.truck_number)), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-slate-400" }, t.trip_number || "Trip", " \u2022 ", t.driver_name || "Driver")) : /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 italic text-[11px]" }, "General Inquiry")), /* @__PURE__ */ React.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 flex-wrap" }, /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 uppercase border border-slate-700" }, t.category), /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase " + (t.priority === "urgent" ? "bg-red-500/20 text-red-400 border border-red-500/30" : t.priority === "high" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-slate-800 text-slate-400") }, t.priority))), /* @__PURE__ */ React.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border " + (isResolved ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : isEsc ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse" : "bg-amber-500/15 text-amber-400 border-amber-500/30") }, isEsc ? "\u{1F6A8} Escalated" : isResolved ? "\u2713 Resolved" : "\u23F3 " + t.status.toUpperCase()), isEsc && /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-red-400 font-semibold block leading-tight" }, "operations@jaibhavanicargo.com"), t.rating && /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-amber-400 font-bold block" }, "\u2605".repeat(t.rating), " (", t.rating, ".0)"))), /* @__PURE__ */ React.createElement("td", { className: "p-3.5 pr-5 text-right" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end gap-1.5" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setActiveTicket(t);
          setResolutionSummary(t.resolution_summary || "");
        },
        className: "px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow cursor-pointer transition"
      },
      /* @__PURE__ */ React.createElement("span", null, "Investigate")
    ), isEsc && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleWhatsAppManagementAlert(t),
        className: "p-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/40 rounded-xl transition cursor-pointer",
        title: "Send WhatsApp alert to Senior Operations"
      },
      /* @__PURE__ */ React.createElement(ShareIcon, { className: "w-3.5 h-3.5" })
    ))));
  })))))), activeTicket && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-end p-0 animate-in fade-in duration-200" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full flex flex-col shadow-2xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-1" }, /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded text-xs border border-red-500/20" }, activeTicket.ticket_number), /* @__PURE__ */ React.createElement("span", { className: "text-xs uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300" }, activeTicket.category), activeTicket.is_escalated && /* @__PURE__ */ React.createElement("span", { className: "text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse" }, "\u{1F6A8} Escalated")), /* @__PURE__ */ React.createElement("h2", { className: "text-lg font-bold text-white" }, activeTicket.subject), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-0.5" }, "Client: ", /* @__PURE__ */ React.createElement("strong", { className: "text-slate-200" }, activeTicket.client_name))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTicket(null),
      className: "p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(CloseIcon, { className: "w-5 h-5" })
  )), activeTicket.truck_number && /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs px-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(TruckIcon, { className: "w-4 h-4 text-amber-400" }), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold text-white" }, activeTicket.truck_number), /* @__PURE__ */ React.createElement("span", { className: "text-slate-500" }, "\u2022"), /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, activeTicket.trip_number || "Trip")), activeTicket.driver_phone && /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "tel:" + activeTicket.driver_phone,
      className: "text-emerald-400 hover:underline font-mono text-xs flex items-center gap-1"
    },
    "\u{1F4DE} Call Driver: ",
    activeTicket.driver_phone
  )), activeTicket.attachments && activeTicket.attachments.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-slate-950 border-b border-slate-800" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(CameraIcon, { className: "w-4 h-4 text-blue-400" }), "Client Uploaded Damage / Evidence Documents:"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 overflow-x-auto" }, activeTicket.attachments.map((img, idx) => /* @__PURE__ */ React.createElement("a", { key: idx, href: img, target: "_blank", rel: "noreferrer", className: "block relative group shrink-0" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: img,
      alt: "Evidence",
      className: "w-24 h-24 object-cover rounded-xl border border-slate-700 group-hover:border-blue-500 transition shadow"
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "absolute bottom-1 right-1 bg-black/80 text-[9px] text-white px-1.5 py-0.5 rounded font-mono" }, "View \u2197"))))), /* @__PURE__ */ React.createElement("div", { className: "p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap text-xs px-5" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400 font-semibold" }, "Change Workflow State:"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleUpdateStatus(activeTicket.id, "investigating"),
      className: "px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg font-bold hover:bg-amber-500/30 transition cursor-pointer"
    },
    "Investigating"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleUpdateStatus(activeTicket.id, "resolved"),
      className: "px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold hover:bg-emerald-500/30 transition cursor-pointer"
    },
    "\u2713 Mark Resolved"
  ), !activeTicket.is_escalated && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleEscalateToSeniorMgmt(activeTicket),
      className: "px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition cursor-pointer"
    },
    "\u{1F6A8} Escalate"
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/40" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1" }, "Original Grievance:"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-200 leading-relaxed" }, activeTicket.description)), activeTicket.messages && activeTicket.messages.map((m) => {
    const isAdmin = m.sender_type === "admin";
    const isInternal = m.is_internal_note;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: m.id,
        className: "flex flex-col " + (isAdmin ? "items-end" : "items-start")
      },
      /* @__PURE__ */ React.createElement(
        "div",
        {
          className: "max-w-[85%] p-3.5 rounded-2xl text-xs space-y-1 " + (isInternal ? "bg-amber-500/10 border border-amber-500/30 text-amber-200" : isAdmin ? "bg-blue-600 text-white rounded-br-none" : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700")
        },
        /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-4 text-[10px] opacity-80 mb-0.5" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold" }, m.sender_name), /* @__PURE__ */ React.createElement("span", { className: "font-mono" }, m.created_at ? m.created_at.slice(11, 16) : "")),
        /* @__PURE__ */ React.createElement("p", { className: "leading-relaxed" }, m.message)
      )
    );
  })), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSendReply, className: "p-4 bg-slate-950 border-t border-slate-800 space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setIsInternalNote(false),
      className: "px-3 py-1 rounded-lg font-bold transition cursor-pointer " + (!isInternalNote ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white")
    },
    "Public Reply to Client"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setIsInternalNote(true),
      className: "px-3 py-1 rounded-lg font-bold transition cursor-pointer " + (isInternalNote ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white")
    },
    "\u{1F512} Private Internal Staff Note"
  )), activeTicket.is_escalated && /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleWhatsAppManagementAlert(activeTicket),
      className: "text-red-400 hover:text-red-300 font-bold flex items-center gap-1 text-xs"
    },
    /* @__PURE__ */ React.createElement(ShareIcon, { className: "w-3.5 h-3.5" }),
    /* @__PURE__ */ React.createElement("span", null, "WhatsApp Senior Mgmt")
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    Input,
    {
      value: replyText,
      onChange: (e) => setReplyText(e.target.value),
      placeholder: isInternalNote ? "Write an internal team note (client won't see this)..." : "Write response to client...",
      className: "bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl h-11"
    }
  ), /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "submit",
      className: "rounded-xl font-bold h-11 px-5 cursor-pointer " + (isInternalNote ? "bg-amber-500 hover:bg-amber-400 text-slate-950" : "bg-blue-600 hover:bg-blue-500 text-white")
    },
    "Send"
  ))))), isCreatingTicket && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl" }, /* @__PURE__ */ React.createElement("div", { className: "p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-black text-white text-lg flex items-center gap-2" }, /* @__PURE__ */ React.createElement(FileTextIcon, { className: "w-5 h-5 text-red-500" }), "Log Support Ticket (Admin Desk)"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-0.5" }, "Record a client grievance or transit claim directly into the system.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setIsCreatingTicket(false),
      className: "p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(CloseIcon, { className: "w-4 h-4" })
  )), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmitCreateTicket, className: "p-5 space-y-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "Select Client *"), /* @__PURE__ */ React.createElement(
    "select",
    {
      required: true,
      value: createForm.clientId,
      onChange: (e) => setCreateForm({ ...createForm, clientId: e.target.value }),
      className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-red-500"
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "-- Choose Client Company --"),
    Object.entries(clients).map(([id, name]) => /* @__PURE__ */ React.createElement("option", { key: id, value: id }, name))
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "Link to Shipment (Optional):"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: createForm.tripId,
      onChange: (e) => setCreateForm({ ...createForm, tripId: e.target.value }),
      className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-red-500"
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "-- Non-Trip / General Complaint --"),
    trips.slice(0, 30).map((t) => /* @__PURE__ */ React.createElement("option", { key: t.id, value: t.id }, t.trip_id || t.id.slice(0, 8), " \u2022 ", t.truck_number || "Truck", " \u2022 ", t.origin, " \u2794 ", t.destination, " (", clients[t.client_id] || t.client_name, ")"))
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "Issue Category *"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: createForm.category,
      onChange: (e) => setCreateForm({ ...createForm, category: e.target.value }),
      className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-red-500"
    },
    /* @__PURE__ */ React.createElement("option", { value: "delay" }, "\u23F1\uFE0F Transit Delay"),
    /* @__PURE__ */ React.createElement("option", { value: "damage" }, "\u{1F4E6} Cargo Damage / Shortage"),
    /* @__PURE__ */ React.createElement("option", { value: "pod" }, "\u{1F4C4} Missing / Illegible POD"),
    /* @__PURE__ */ React.createElement("option", { value: "billing" }, "\u{1F4B5} Billing & Freight Issue"),
    /* @__PURE__ */ React.createElement("option", { value: "driver" }, "\u{1F69A} Driver Misconduct"),
    /* @__PURE__ */ React.createElement("option", { value: "other" }, "\u2753 Other / Inquiry")
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "Priority Level *"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: createForm.priority,
      onChange: (e) => setCreateForm({ ...createForm, priority: e.target.value }),
      className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-red-500"
    },
    /* @__PURE__ */ React.createElement("option", { value: "urgent" }, "\u{1F6A8} Urgent (Immediate)"),
    /* @__PURE__ */ React.createElement("option", { value: "high" }, "High Priority"),
    /* @__PURE__ */ React.createElement("option", { value: "medium" }, "Medium"),
    /* @__PURE__ */ React.createElement("option", { value: "low" }, "Low")
  ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "Complaint Subject *"), /* @__PURE__ */ React.createElement(
    Input,
    {
      required: true,
      placeholder: "e.g. 4 Hours Delay at Checkpost / Water Leakage Damage",
      value: createForm.subject,
      onChange: (e) => setCreateForm({ ...createForm, subject: e.target.value }),
      className: "bg-slate-950 border-slate-800 text-slate-100"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "Details & Customer Remarks *"), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      required: true,
      rows: 3,
      placeholder: "Describe the complaint in detail...",
      value: createForm.description,
      onChange: (e) => setCreateForm({ ...createForm, description: e.target.value }),
      className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-red-500"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "Supporting Photo / Evidence Document URL (Optional):"), /* @__PURE__ */ React.createElement(
    Input,
    {
      placeholder: "https://... photo link",
      value: createForm.attachmentUrl,
      onChange: (e) => setCreateForm({ ...createForm, attachmentUrl: e.target.value }),
      className: "bg-slate-950 border-slate-800 text-slate-100 font-mono text-xs"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end gap-3 pt-3 border-t border-slate-800" }, /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "button",
      onClick: () => setIsCreatingTicket(false),
      variant: "outline",
      className: "rounded-xl border-slate-700 text-slate-300"
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "submit",
      className: "rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
    },
    "Submit & Open Ticket"
  ))))));
}
export { SupportTicketsPage as default };
