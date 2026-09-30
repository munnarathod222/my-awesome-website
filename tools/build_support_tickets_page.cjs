const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

console.log('Generating SupportTicketsPage component...');

const componentSource = `
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
  
  // Drawer chat & reply state
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState("");

  // Create Ticket Modal
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
      // 1. Load clients
      const clientList = await pb.collection("clients").getFullList({ $autoCancel: false }).catch(() => []);
      const cMap = {};
      clientList.forEach(cl => {
        cMap[cl.id] = cl.company_name || cl.name || "Client Partner";
      });
      setClients(cMap);

      // 2. Load trips for linking
      const tripList = await pb.collection("trip_logs").getFullList({ sort: "-date", $autoCancel: false }).catch(() => []);
      setTrips(tripList);

      // 3. Load tickets from localStorage or PocketBase
      const saved = localStorage.getItem("jc_support_tickets");
      if (saved) {
        setTickets(JSON.parse(saved));
      } else {
        // Fallback seed tickets
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
            escalation_reason: "High-value electronics claim exceeding ₹50,000 threshold. Escalated to senior management.",
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
            description: "Client finance requires physical copy with receiver round rubber stamp for invoice clearance of ₹45,000.",
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

  // Status transitions
  const handleUpdateStatus = (ticketId, nextStatus) => {
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: nextStatus,
          is_escalated: nextStatus === "escalated" ? true : t.is_escalated,
          escalated_at: nextStatus === "escalated" ? new Date().toISOString() : t.escalated_at,
          resolved_at: nextStatus === "resolved" ? new Date().toISOString() : t.resolved_at,
          updated_at: new Date().toISOString()
        };
      }
      return t;
    });
    saveTickets(updated);
    if (activeTicket && activeTicket.id === ticketId) {
      setActiveTicket(updated.find(t => t.id === ticketId));
    }
    toast.success("Ticket status updated to " + nextStatus.toUpperCase());
  };

  // Add message/reply
  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    const newMsg = {
      id: "msg-" + Date.now(),
      sender_type: "admin",
      sender_name: isInternalNote ? "JBC Internal Staff Note" : "JBC Operations Dispatch",
      is_internal_note: isInternalNote,
      message: replyText.trim(),
      created_at: new Date().toISOString()
    };

    const updated = tickets.map(t => {
      if (t.id === activeTicket.id) {
        return {
          ...t,
          messages: [...(t.messages || []), newMsg],
          updated_at: new Date().toISOString()
        };
      }
      return t;
    });

    saveTickets(updated);
    setActiveTicket(updated.find(t => t.id === activeTicket.id));
    setReplyText("");
    toast.success(isInternalNote ? "Internal note saved." : "Reply sent to client.");
  };

  // Escalate to Senior Management (operations@jaibhavanicargo.com)
  const handleEscalateToSeniorMgmt = (ticket) => {
    const reason = window.prompt(
      "Reason for escalating to Senior Management (operations@jaibhavanicargo.com):",
      "High priority client inquiry requiring director/fleet manager intervention."
    );
    if (reason === null) return;

    const updated = tickets.map(t => {
      if (t.id === ticket.id) {
        return {
          ...t,
          status: "escalated",
          is_escalated: true,
          escalated_at: new Date().toISOString(),
          escalation_reason: reason.trim(),
          updated_at: new Date().toISOString()
        };
      }
      return t;
    });

    saveTickets(updated);
    if (activeTicket && activeTicket.id === ticket.id) {
      setActiveTicket(updated.find(t => t.id === ticket.id));
    }
    toast.success("Ticket escalated to operations@jaibhavanicargo.com!");
  };

  // 1-Click WhatsApp Quick Alert
  const handleWhatsAppManagementAlert = (ticket) => {
    const text = encodeURIComponent(
      "*URGENT ESCALATION ALERT | JAI BHAVANI CARGO*\\n\\n" +
      "🚨 *Ticket Number:* " + ticket.ticket_number + "\\n" +
      "🏢 *Client:* " + ticket.client_name + "\\n" +
      "⚠️ *Issue Type:* " + ticket.category.toUpperCase() + "\\n" +
      "🚚 *Vehicle:* " + (ticket.truck_number || "Unassigned") + "\\n" +
      "👤 *Driver:* " + (ticket.driver_name || "N/A") + " (" + (ticket.driver_phone || "N/A") + ")\\n" +
      "📝 *Subject:* " + ticket.subject + "\\n\\n" +
      "Escalated to Senior Management at operations@jaibhavanicargo.com\\n" +
      "View live ticket: https://www.jaibhavanicargo.com/support-tickets"
    );
    window.open("https://api.whatsapp.com/send?phone=917794072244&text=" + text, "_blank");
  };

  // Submit Create Ticket Form
  const handleSubmitCreateTicket = (e) => {
    e.preventDefault();
    if (!createForm.subject.trim()) {
      toast.error("Subject is required.");
      return;
    }

    const linkedTrip = trips.find(t => t.id === createForm.tripId);
    const clientName = clients[createForm.clientId] || (linkedTrip ? (clients[linkedTrip.client_id] || linkedTrip.client_name) : "Direct Client");

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
      escalated_at: createForm.priority === "urgent" ? new Date().toISOString() : undefined,
      messages: [
        {
          id: "msg-" + Date.now(),
          sender_type: "client",
          sender_name: clientName,
          message: createForm.description.trim() || createForm.subject.trim(),
          created_at: new Date().toISOString()
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    saveTickets([newTicket, ...tickets]);
    setIsCreatingTicket(false);
    toast.success("New Support Ticket #" + newTicket.ticket_number + " created!");
  };

  // Metrics
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === "open" || t.status === "investigating").length;
  const escalatedCount = tickets.filter(t => t.is_escalated || t.status === "escalated").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;
  const ratedTickets = tickets.filter(t => t.rating);
  const avgRating = ratedTickets.length > 0
    ? (ratedTickets.reduce((sum, t) => sum + (t.rating || 0), 0) / ratedTickets.length).toFixed(1)
    : "5.0";

  // Category counts
  const catDelay = tickets.filter(t => t.category === "delay").length;
  const catDamage = tickets.filter(t => t.category === "damage").length;
  const catPod = tickets.filter(t => t.category === "pod").length;
  const catBilling = tickets.filter(t => t.category === "billing").length;
  const catDriver = tickets.filter(t => t.category === "driver").length;
  const catOther = tickets.filter(t => t.category === "other").length;

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
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

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Helmet>
        <title>Support & Complaints Hub | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              Dispute Resolution & Operations SLA
            </span>
            <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-semibold">
              operations@jaibhavanicargo.com
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <FileTextIcon className="w-8 h-8 text-red-500" />
            Support & Complaints Management
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Track client transit tickets, investigate cargo damages, manage senior management escalations & monitor CSAT scores.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={loadData}
            variant="outline"
            className="rounded-xl border-slate-700 hover:bg-slate-800 text-slate-200"
          >
            <RefreshIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => setIsCreatingTicket(true)}
            className="rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/20 cursor-pointer"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Log Support Ticket
          </Button>
        </div>
      </div>

      {/* KPI Cards (Matching User's Thumbnail Mockup!) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Tickets</p>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1 font-mono">{totalCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Logged cases</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-wider">Open / Investigating</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 font-mono">{openCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Requires team action</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <p className="text-red-400 text-xs font-bold uppercase tracking-wider">Escalated Critical</p>
          <p className="text-2xl sm:text-3xl font-black text-red-500 mt-1 font-mono">{escalatedCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Senior mgmt flagged</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Resolved Cases</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 font-mono">{resolvedCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Successfully closed</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <p className="text-amber-300 text-xs font-bold uppercase tracking-wider">CSAT Satisfaction</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-300 mt-1 font-mono">{avgRating} ★</p>
          <p className="text-[11px] text-slate-500 mt-1">{ratedTickets.length} client reviews</p>
        </div>
      </div>

      {/* Category Breakdown Bar (Matching User's Mockup Spec) */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-300">
          <span>TICKET ISSUE CATEGORIES:</span>
          <span className="text-slate-500">Live Breakdown across Fleet</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-amber-400 font-semibold">⏱️ Delay</span>
            <span className="font-mono font-bold text-white">{catDelay}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-red-400 font-semibold">📦 Damage</span>
            <span className="font-mono font-bold text-white">{catDamage}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-blue-400 font-semibold">📄 POD</span>
            <span className="font-mono font-bold text-white">{catPod}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-emerald-400 font-semibold">💵 Billing</span>
            <span className="font-mono font-bold text-white">{catBilling}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-purple-400 font-semibold">🚚 Driver</span>
            <span className="font-mono font-bold text-white">{catDriver}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 font-semibold">❓ Other</span>
            <span className="font-mono font-bold text-white">{catOther}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search tickets by ID, Client, Subject, Truck #, Trip ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl h-11"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 font-medium cursor-pointer h-11 w-full sm:w-auto outline-none focus:border-red-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open / Investigating</option>
            <option value="escalated">🚨 Escalated Critical</option>
            <option value="damage">📦 Cargo Damage Claims</option>
            <option value="resolved">✅ Resolved & Closed</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 font-medium cursor-pointer h-11 w-full sm:w-auto outline-none focus:border-red-500"
          >
            <option value="all">All Categories</option>
            <option value="delay">Transit Delay</option>
            <option value="damage">Cargo Damage</option>
            <option value="pod">POD Issues</option>
            <option value="billing">Billing / Invoice</option>
            <option value="driver">Driver Conduct</option>
            <option value="other">Other Inquiries</option>
          </select>
        </div>
      </div>

      {/* Tickets Master Table */}
      <Card className="border border-slate-800 bg-slate-900/60 rounded-3xl overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <RefreshIcon className="w-8 h-8 animate-spin mx-auto text-red-500 mb-3" />
              <p className="font-semibold text-sm">Loading tickets from server...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <FileCheckIcon className="w-12 h-12 mx-auto text-slate-600 mb-2 opacity-50" />
              <p className="text-base font-bold text-slate-300">No matching tickets found</p>
              <p className="text-xs text-slate-500 mt-1">Adjust search filter or select another category.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-800">
                    <th className="p-3.5 pl-5">Ticket # & Date</th>
                    <th className="p-3.5">Client & Contact</th>
                    <th className="p-3.5">Subject & Details</th>
                    <th className="p-3.5">Linked Consignment</th>
                    <th className="p-3.5">Category & Priority</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredTickets.map((t) => {
                    const isEsc = t.is_escalated || t.status === "escalated";
                    const isResolved = t.status === "resolved" || t.status === "closed";

                    return (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition">
                        {/* Ticket # */}
                        <td className="p-3.5 pl-5">
                          <span className="font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                            {t.ticket_number}
                          </span>
                          <p className="text-[10px] text-slate-500 font-mono mt-1">
                            {t.created_at ? t.created_at.slice(0, 10) : "Today"}
                          </p>
                        </td>

                        {/* Client */}
                        <td className="p-3.5">
                          <p className="font-bold text-white">{t.client_name}</p>
                          <p className="text-[10px] text-slate-400">ID: {t.client_id || "Direct"}</p>
                        </td>

                        {/* Subject */}
                        <td className="p-3.5 max-w-[220px]">
                          <p className="font-semibold text-slate-100 truncate" title={t.subject}>{t.subject}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{t.description}</p>
                          {t.attachments && t.attachments.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 font-semibold mt-1">
                              <CameraIcon className="w-3 h-3" />
                              {t.attachments.length} Evidence Photo(s) Attached
                            </span>
                          )}
                        </td>

                        {/* Linked Shipment */}
                        <td className="p-3.5">
                          {t.truck_number ? (
                            <div>
                              <div className="flex items-center gap-1 font-mono font-bold text-slate-200">
                                <TruckIcon className="w-3.5 h-3.5 text-slate-400" />
                                <span>{t.truck_number}</span>
                              </div>
                              <p className="text-[10px] text-slate-400">{t.trip_number || "Trip"} • {t.driver_name || "Driver"}</p>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">General Inquiry</span>
                          )}
                        </td>

                        {/* Category & Priority */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 uppercase border border-slate-700">
                              {t.category}
                            </span>
                            <span className={"px-2 py-0.5 rounded-full text-[10px] font-bold uppercase " + (
                              t.priority === "urgent" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              t.priority === "high" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                              "bg-slate-800 text-slate-400"
                            )}>
                              {t.priority}
                            </span>
                          </div>
                        </td>

                        {/* Status & Escalation */}
                        <td className="p-3.5">
                          <div className="space-y-1">
                            <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border " + (
                              isResolved ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                              isEsc ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse" :
                              "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            )}>
                              {isEsc ? "🚨 Escalated" : isResolved ? "✓ Resolved" : "⏳ " + t.status.toUpperCase()}
                            </span>
                            {isEsc && (
                              <p className="text-[9px] text-red-400 font-semibold block leading-tight">
                                operations@jaibhavanicargo.com
                              </p>
                            )}
                            {t.rating && (
                              <p className="text-[10px] text-amber-400 font-bold block">
                                {"★".repeat(t.rating)} ({t.rating}.0)
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setActiveTicket(t);
                                setResolutionSummary(t.resolution_summary || "");
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow cursor-pointer transition"
                            >
                              <span>Investigate</span>
                            </button>

                            {isEsc && (
                              <button
                                onClick={() => handleWhatsAppManagementAlert(t)}
                                className="p-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/40 rounded-xl transition cursor-pointer"
                                title="Send WhatsApp alert to Senior Operations"
                              >
                                <ShareIcon className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* OPERATIONS INVESTIGATION DRAWER / MODAL */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-end p-0 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full flex flex-col shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded text-xs border border-red-500/20">
                    {activeTicket.ticket_number}
                  </span>
                  <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {activeTicket.category}
                  </span>
                  {activeTicket.is_escalated && (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                      🚨 Escalated
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white">{activeTicket.subject}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Client: <strong className="text-slate-200">{activeTicket.client_name}</strong>
                </p>
              </div>

              <button
                onClick={() => setActiveTicket(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Shipment Context Card */}
            {activeTicket.truck_number && (
              <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs px-5">
                <div className="flex items-center gap-2">
                  <TruckIcon className="w-4 h-4 text-amber-400" />
                  <span className="font-mono font-bold text-white">{activeTicket.truck_number}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">{activeTicket.trip_number || "Trip"}</span>
                </div>
                {activeTicket.driver_phone && (
                  <a
                    href={"tel:" + activeTicket.driver_phone}
                    className="text-emerald-400 hover:underline font-mono text-xs flex items-center gap-1"
                  >
                    📞 Call Driver: {activeTicket.driver_phone}
                  </a>
                )}
              </div>
            )}

            {/* Evidence Photos Section */}
            {activeTicket.attachments && activeTicket.attachments.length > 0 && (
              <div className="p-4 bg-slate-950 border-b border-slate-800">
                <p className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <CameraIcon className="w-4 h-4 text-blue-400" />
                  Client Uploaded Damage / Evidence Documents:
                </p>
                <div className="flex items-center gap-3 overflow-x-auto">
                  {activeTicket.attachments.map((img, idx) => (
                    <a key={idx} href={img} target="_blank" rel="noreferrer" className="block relative group shrink-0">
                      <img
                        src={img}
                        alt="Evidence"
                        className="w-24 h-24 object-cover rounded-xl border border-slate-700 group-hover:border-blue-500 transition shadow"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] text-white px-1.5 py-0.5 rounded font-mono">
                        View ↗
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Status Control Strip */}
            <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap text-xs px-5">
              <span className="text-slate-400 font-semibold">Change Workflow State:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleUpdateStatus(activeTicket.id, "investigating")}
                  className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg font-bold hover:bg-amber-500/30 transition cursor-pointer"
                >
                  Investigating
                </button>
                <button
                  onClick={() => handleUpdateStatus(activeTicket.id, "resolved")}
                  className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold hover:bg-emerald-500/30 transition cursor-pointer"
                >
                  ✓ Mark Resolved
                </button>
                {!activeTicket.is_escalated && (
                  <button
                    onClick={() => handleEscalateToSeniorMgmt(activeTicket)}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition cursor-pointer"
                  >
                    🚨 Escalate
                  </button>
                )}
              </div>
            </div>

            {/* Conversation History Timeline */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/40">
              <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Original Grievance:</p>
                <p className="text-xs text-slate-200 leading-relaxed">{activeTicket.description}</p>
              </div>

              {activeTicket.messages && activeTicket.messages.map((m) => {
                const isAdmin = m.sender_type === "admin";
                const isInternal = m.is_internal_note;

                return (
                  <div
                    key={m.id}
                    className={"flex flex-col " + (isAdmin ? "items-end" : "items-start")}
                  >
                    <div
                      className={"max-w-[85%] p-3.5 rounded-2xl text-xs space-y-1 " + (
                        isInternal
                          ? "bg-amber-500/10 border border-amber-500/30 text-amber-200"
                          : isAdmin
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700"
                      )}
                    >
                      <div className="flex items-center justify-between gap-4 text-[10px] opacity-80 mb-0.5">
                        <span className="font-bold">{m.sender_name}</span>
                        <span className="font-mono">{m.created_at ? m.created_at.slice(11, 16) : ""}</span>
                      </div>
                      <p className="leading-relaxed">{m.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendReply} className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInternalNote(false)}
                    className={"px-3 py-1 rounded-lg font-bold transition cursor-pointer " + (
                      !isInternalNote ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                    )}
                  >
                    Public Reply to Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInternalNote(true)}
                    className={"px-3 py-1 rounded-lg font-bold transition cursor-pointer " + (
                      isInternalNote ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                    )}
                  >
                    🔒 Private Internal Staff Note
                  </button>
                </div>

                {activeTicket.is_escalated && (
                  <button
                    type="button"
                    onClick={() => handleWhatsAppManagementAlert(activeTicket)}
                    className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 text-xs"
                  >
                    <ShareIcon className="w-3.5 h-3.5" />
                    <span>WhatsApp Senior Mgmt</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={isInternalNote ? "Write an internal team note (client won't see this)..." : "Write response to client..."}
                  className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl h-11"
                />
                <Button
                  type="submit"
                  className={"rounded-xl font-bold h-11 px-5 cursor-pointer " + (
                    isInternalNote ? "bg-amber-500 hover:bg-amber-400 text-slate-950" : "bg-blue-600 hover:bg-blue-500 text-white"
                  )}
                >
                  Send
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TICKET MODAL */}
      {isCreatingTicket && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-black text-white text-lg flex items-center gap-2">
                  <FileTextIcon className="w-5 h-5 text-red-500" />
                  Log Support Ticket (Admin Desk)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Record a client grievance or transit claim directly into the system.
                </p>
              </div>
              <button
                onClick={() => setIsCreatingTicket(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreateTicket} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Select Client *</label>
                <select
                  required
                  value={createForm.clientId}
                  onChange={(e) => setCreateForm({ ...createForm, clientId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-red-500"
                >
                  <option value="">-- Choose Client Company --</option>
                  {Object.entries(clients).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Link to Shipment (Optional):</label>
                <select
                  value={createForm.tripId}
                  onChange={(e) => setCreateForm({ ...createForm, tripId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-red-500"
                >
                  <option value="">-- Non-Trip / General Complaint --</option>
                  {trips.slice(0, 30).map(t => (
                    <option key={t.id} value={t.id}>
                      {t.trip_id || t.id.slice(0, 8)} • {t.truck_number || "Truck"} • {t.origin} ➔ {t.destination} ({clients[t.client_id] || t.client_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Issue Category *</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-red-500"
                  >
                    <option value="delay">⏱️ Transit Delay</option>
                    <option value="damage">📦 Cargo Damage / Shortage</option>
                    <option value="pod">📄 Missing / Illegible POD</option>
                    <option value="billing">💵 Billing & Freight Issue</option>
                    <option value="driver">🚚 Driver Misconduct</option>
                    <option value="other">❓ Other / Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Priority Level *</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-red-500"
                  >
                    <option value="urgent">🚨 Urgent (Immediate)</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Complaint Subject *</label>
                <Input
                  required
                  placeholder="e.g. 4 Hours Delay at Checkpost / Water Leakage Damage"
                  value={createForm.subject}
                  onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Details & Customer Remarks *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the complaint in detail..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Supporting Photo / Evidence Document URL (Optional):</label>
                <Input
                  placeholder="https://... photo link"
                  value={createForm.attachmentUrl}
                  onChange={(e) => setCreateForm({ ...createForm, attachmentUrl: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-slate-100 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  onClick={() => setIsCreatingTicket(false)}
                  variant="outline"
                  className="rounded-xl border-slate-700 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
                >
                  Submit & Open Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export { SupportTicketsPage as default };
`;

// Transform with esbuild
console.log('Transforming SupportTicketsPage with esbuild (React.createElement)...');
const res = esbuild.transformSync(componentSource, {
  loader: 'jsx',
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  target: 'es2020',
  minify: false
});

const compiled = res.code;
console.log('Compiled length:', compiled.length);

// Save source in tools/
fs.writeFileSync(path.join(__dirname, 'SupportTicketsPage.jsx'), componentSource, 'utf8');

// Target chunk file destinations
const chunkDests = [
  path.join(__dirname, '../dist/assets/SupportTicketsPage-C7kP9xL2.js'),
  path.join(__dirname, '../apps/web/dist/assets/SupportTicketsPage-C7kP9xL2.js'),
  path.join(__dirname, '../apps/api/dist/assets/SupportTicketsPage-C7kP9xL2.js'),
  path.join(__dirname, '../dist/apps/web/assets/SupportTicketsPage-C7kP9xL2.js')
];

for (const dest of chunkDests) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, compiled, 'utf8');
  console.log('✓ Successfully written chunk to:', dest);
}

console.log('SupportTicketsPage built successfully!');
