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
function LorryReceiptsPodHubPage() {
  const [activeTab, setActiveTab] = useState("lr");
  const [trips, setTrips] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingLr, setViewingLr] = useState(null);
  const [lrCopyType, setLrCopyType] = useState("Transporter Copy");
  const [isCreatingLr, setIsCreatingLr] = useState(false);
  const [viewingPodDoc, setViewingPodDoc] = useState(null);
  const [uploadingTripId, setUploadingTripId] = useState(null);
  const [editLrTrip, setEditLrTrip] = useState(null);
  const [newLrNumber, setNewLrNumber] = useState("");
  const [createForm, setCreateForm] = useState({
    selectedTripId: "",
    lrNumber: "",
    truckNumber: "",
    driverName: "",
    driverPhone: "",
    origin: "",
    destination: "",
    clientName: "",
    freight: "",
    ewayBill: "",
    consignorName: "",
    consigneeName: "",
    goodsDescription: "General Commercial Cargo",
    packagesCount: "1",
    weightKg: "1000"
  });
  const companySettings = useMemo(() => {
    try {
      const saved = localStorage.getItem("jc_company_settings");
      if (saved) return JSON.parse(saved);
    } catch (e) {
    }
    return {
      company_name: "JAI BHAVANI CARGO",
      tagline: "Goods Transport Operators & Fleet Contractors",
      company_address: "Plot No. 3, Patel Nagar, Ghatkesar, Medchal-Malkajgiri Dist., Telangana - 501301",
      company_gstin: "36DPXPR9171A1Z8",
      company_pan: "DPXPR9171A",
      company_phone: "+91 7794072244",
      company_email: "vinod@jaibhavanicargo.com",
      company_website: "www.jaibhavanicargo.com",
      bank_name: "HDFC BANK",
      account_name: "JAI BHAVANI CARGO",
      account_number: "50200117182677",
      ifsc_code: "HDFC0004480",
      branch_name: "GHATKESAR BRANCH",
      lr_prefix: "JBC"
    };
  }, []);
  const loadData = async () => {
    setLoading(true);
    try {
      const clientList = await pb.collection("clients").getFullList({ $autoCancel: false }).catch(() => []);
      const cMap = {};
      clientList.forEach((cl) => {
        cMap[cl.id] = cl.company_name || cl.name || "Client Partner";
      });
      setClients(cMap);
      const tripList = await pb.collection("trip_logs").getFullList({
        sort: "-date",
        $autoCancel: false
      }).catch(() => []);
      setTrips(tripList);
    } catch (err) {
      console.error("Error loading trips:", err);
      toast.error("Failed to load Lorry Receipts & POD data.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);
  const getLrNumber = (trip) => {
    if (trip.lr_number && trip.lr_number.trim()) return trip.lr_number.trim();
    if (trip.client_trip_id && trip.client_trip_id.trim()) return trip.client_trip_id.trim();
    const idSuffix = (trip.trip_id || trip.id || "").replace(/[^0-9]/g, "").slice(-4) || "1001";
    return (companySettings.lr_prefix || "JBC") + "/26-27/" + idSuffix;
  };
  const getPodStatus = (trip) => {
    if (trip.pod_status === "Verified") return "Verified";
    if (trip.pod_file || trip.pod_link || trip.pod_status === "Uploaded") return "Uploaded";
    return "Pending";
  };
  const handleUploadPod = async (e, tripId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingTripId(tripId);
    try {
      const formData = new FormData();
      formData.append("pod_file", file);
      formData.append("pod_status", "Uploaded");
      await pb.collection("trip_logs").update(tripId, formData);
      toast.success("POD document uploaded successfully!");
      loadData();
    } catch (err) {
      console.error("POD upload failed:", err);
      toast.error("Failed to upload POD document.");
    } finally {
      setUploadingTripId(null);
    }
  };
  const handleTogglePodVerify = async (trip) => {
    const nextStatus = trip.pod_status === "Verified" ? "Uploaded" : "Verified";
    try {
      await pb.collection("trip_logs").update(trip.id, { pod_status: nextStatus });
      toast.success("POD status marked as " + nextStatus);
      loadData();
    } catch (err) {
      console.error("Verify toggle failed:", err);
      toast.error("Failed to update status.");
    }
  };
  const handleSaveLrNumber = async () => {
    if (!editLrTrip) return;
    try {
      await pb.collection("trip_logs").update(editLrTrip.id, {
        lr_number: newLrNumber.trim(),
        client_trip_id: newLrNumber.trim()
      });
      toast.success("Lorry Receipt # updated to " + newLrNumber.trim());
      setEditLrTrip(null);
      loadData();
    } catch (err) {
      console.error("Error updating LR #:", err);
      toast.error("Failed to update LR number.");
    }
  };
  const handleOpenCreateLr = () => {
    const randomSuffix = Math.floor(1e3 + Math.random() * 9e3);
    const autoLr = (companySettings.lr_prefix || "JBC") + "/26-27/" + randomSuffix;
    setCreateForm({
      selectedTripId: "",
      lrNumber: autoLr,
      truckNumber: "",
      driverName: "",
      driverPhone: "",
      origin: "Hyderabad",
      destination: "Warangal",
      clientName: "",
      freight: "12500",
      ewayBill: "",
      consignorName: "Consignor Pvt Ltd",
      consigneeName: "Consignee Logistics",
      goodsDescription: "Industrial Materials & Machinery Spares",
      packagesCount: "10",
      weightKg: "4500"
    });
    setIsCreatingLr(true);
  };
  const handleSelectTripForLr = (tripId) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;
    setCreateForm((prev) => ({
      ...prev,
      selectedTripId: trip.id,
      truckNumber: trip.truck_number || "",
      driverName: trip.driver_name || "",
      driverPhone: trip.driver_phone || "",
      origin: trip.origin || "Hyderabad",
      destination: trip.destination || "Warangal",
      clientName: clients[trip.client_id] || trip.client_name || "",
      freight: String(trip.revenue || "12000"),
      ewayBill: trip.eway_bill_number || "",
      consignorName: clients[trip.client_id] || "Consignor Partner",
      consigneeName: "Consignee Warehouse"
    }));
  };
  const handleSubmitCreateLr = async (e) => {
    e.preventDefault();
    if (!createForm.lrNumber.trim()) {
      toast.error("LR Number is required.");
      return;
    }
    try {
      if (createForm.selectedTripId) {
        await pb.collection("trip_logs").update(createForm.selectedTripId, {
          lr_number: createForm.lrNumber.trim(),
          client_trip_id: createForm.lrNumber.trim(),
          eway_bill_number: createForm.ewayBill.trim(),
          truck_number: createForm.truckNumber.trim() || void 0,
          driver_name: createForm.driverName.trim() || void 0,
          driver_phone: createForm.driverPhone.trim() || void 0
        });
        toast.success("LR #" + createForm.lrNumber.trim() + " generated for trip!");
      } else {
        await pb.collection("trip_logs").create({
          lr_number: createForm.lrNumber.trim(),
          client_trip_id: createForm.lrNumber.trim(),
          truck_number: createForm.truckNumber.trim() || "TG12U2637",
          driver_name: createForm.driverName.trim() || "Carrier Driver",
          driver_phone: createForm.driverPhone.trim() || "+91 98480 12345",
          origin: createForm.origin.trim() || "Hyderabad",
          destination: createForm.destination.trim() || "Warangal",
          route: (createForm.origin.trim() || "Hyderabad") + " -> " + (createForm.destination.trim() || "Warangal"),
          date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          revenue: parseFloat(createForm.freight) || 0,
          trip_status: "In-Transit",
          status: "In-Transit",
          eway_bill_number: createForm.ewayBill.trim(),
          client_name: createForm.clientName.trim() || "Direct Client",
          consignor_name: createForm.consignorName.trim(),
          consignee_name: createForm.consigneeName.trim(),
          description: createForm.goodsDescription.trim()
        });
        toast.success("New Consignment & LR #" + createForm.lrNumber.trim() + " created!");
      }
      setIsCreatingLr(false);
      loadData();
    } catch (err) {
      console.error("Error creating LR:", err);
      toast.error("Failed to create LR.");
    }
  };
  const handleShareWhatsApp = (trip) => {
    const lrNum = getLrNumber(trip);
    const truck = trip.truck_number || "Assigned Vehicle";
    const driver = trip.driver_name || "Assigned Driver";
    const route = (trip.origin || "Origin") + " to " + (trip.destination || "Destination");
    const client = clients[trip.client_id] || trip.client_name || "Client Partner";
    const msg = encodeURIComponent(
      "*JAI BHAVANI CARGO MOVERS*\n\u{1F4C4} *LORRY RECEIPT / CONSIGNMENT NOTE*\n\n\u{1F539} *LR Number:* #" + lrNum + "\n\u{1F539} *Client:* " + client + "\n\u{1F539} *Vehicle:* " + truck + "\n\u{1F539} *Driver:* " + driver + "\n\u{1F539} *Route:* " + route + "\n\u{1F539} *POD Status:* " + getPodStatus(trip) + "\n\nTrack & download verified documents at:\nhttps://www.jaibhavanicargo.com/truck-docs\n\nControl Room: +91 7794072244"
    );
    window.open("https://api.whatsapp.com/send?text=" + msg, "_blank");
  };
  const handlePrintLrIframe = () => {
    const content = document.getElementById("lr-printable-area");
    if (!content) return;
    let frame = document.getElementById("jbc-lr-print-frame");
    if (frame) frame.remove();
    frame = document.createElement("iframe");
    frame.id = "jbc-lr-print-frame";
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    document.body.appendChild(frame);
    const doc = frame.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>LR_${viewingLr ? getLrNumber(viewingLr) : "Receipt"}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              color: #0f172a;
              background: #fff;
              margin: 0;
              padding: 0;
              font-size: 11px;
              line-height: 1.3;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #475569;
              padding: 5px 8px;
            }
            th {
              background: #f1f5f9;
              font-weight: 700;
              text-transform: uppercase;
              font-size: 10px;
            }
            .no-print {
              display: none !important;
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 250);
            };
          <\/script>
        </body>
      </html>
    `);
    doc.close();
  };
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const lr = getLrNumber(t).toLowerCase();
      const trId = (t.trip_id || t.id || "").toLowerCase();
      const trk = (t.truck_number || "").toLowerCase();
      const cl = (clients[t.client_id] || t.client_name || "").toLowerCase();
      const rt = (t.route || t.origin + " " + t.destination || "").toLowerCase();
      const ew = (t.eway_bill_number || "").toLowerCase();
      const q = search.toLowerCase();
      const matchesSearch = !q || lr.includes(q) || trId.includes(q) || trk.includes(q) || cl.includes(q) || rt.includes(q) || ew.includes(q);
      if (!matchesSearch) return false;
      const podSt = getPodStatus(t);
      if (statusFilter === "pod_pending" && podSt !== "Pending") return false;
      if (statusFilter === "pod_uploaded" && podSt !== "Uploaded") return false;
      if (statusFilter === "pod_verified" && podSt !== "Verified") return false;
      if (statusFilter === "in_transit" && (t.status === "Completed" || t.trip_status === "Completed")) return false;
      if (statusFilter === "completed" && !(t.status === "Completed" || t.trip_status === "Completed")) return false;
      return true;
    });
  }, [trips, clients, search, statusFilter]);
  const totalCount = trips.length;
  const verifiedPodCount = trips.filter((t) => getPodStatus(t) === "Verified").length;
  const uploadedPodCount = trips.filter((t) => getPodStatus(t) === "Uploaded").length;
  const inTransitCount = trips.filter((t) => t.status === "In-Transit" || t.trip_status === "In-Transit" || !t.status).length;
  return /* @__PURE__ */ React.createElement("div", { className: "p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300" }, /* @__PURE__ */ React.createElement(Helmet, null, /* @__PURE__ */ React.createElement("title", null, "Lorry Receipts & POD Hub | Jai Bhavani Cargo")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider" }, "Fleet Operations & Documentation"), /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold" }, "Live & Synced")), /* @__PURE__ */ React.createElement("h1", { className: "text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3" }, /* @__PURE__ */ React.createElement(FileTextIcon, { className: "w-8 h-8 text-amber-400" }), "Lorry Receipts & POD Hub"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-sm mt-1 max-w-2xl" }, companySettings.company_name, " \u2022 Issue official A4 Bilties, Consignment Notes & verify Proof of Delivery records.")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 flex-wrap" }, /* @__PURE__ */ React.createElement(
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
      onClick: handleOpenCreateLr,
      className: "rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20 cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(PlusIcon, { className: "w-4 h-4 mr-2" }),
    "Issue New LR / Bilty"
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-fit" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("lr"),
      className: "flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer " + (activeTab === "lr" ? "bg-amber-500 text-slate-950 shadow-md font-extrabold" : "text-slate-400 hover:text-white hover:bg-slate-800/60")
    },
    /* @__PURE__ */ React.createElement(FileTextIcon, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, "Lorry Receipts (LR / Bilty)"),
    /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 rounded-full text-xs font-mono " + (activeTab === "lr" ? "bg-slate-950 text-amber-400" : "bg-slate-800 text-slate-300") }, trips.length)
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("pod"),
      className: "flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer " + (activeTab === "pod" ? "bg-blue-600 text-white shadow-md font-extrabold" : "text-slate-400 hover:text-white hover:bg-slate-800/60")
    },
    /* @__PURE__ */ React.createElement(FileCheckIcon, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, "POD Management (Proof of Delivery)"),
    /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 rounded-full text-xs font-mono " + (activeTab === "pod" ? "bg-white text-blue-900 font-bold" : "bg-slate-800 text-slate-300") }, verifiedPodCount + uploadedPodCount, "/", trips.length)
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 p-4 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-xs font-bold uppercase tracking-wider" }, "Total Consignments"), /* @__PURE__ */ React.createElement("p", { className: "text-2xl sm:text-3xl font-black text-white mt-1 font-mono" }, totalCount), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-500 mt-1" }, "Active database records")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 p-4 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-amber-400 text-xs font-bold uppercase tracking-wider" }, "In-Transit / Live"), /* @__PURE__ */ React.createElement("p", { className: "text-2xl sm:text-3xl font-black text-amber-400 mt-1 font-mono" }, inTransitCount), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-500 mt-1" }, "Dispatched on highway")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 p-4 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-blue-400 text-xs font-bold uppercase tracking-wider" }, "POD Uploaded"), /* @__PURE__ */ React.createElement("p", { className: "text-2xl sm:text-3xl font-black text-blue-400 mt-1 font-mono" }, uploadedPodCount), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-500 mt-1" }, "Awaiting final audit")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 p-4 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-emerald-400 text-xs font-bold uppercase tracking-wider" }, "POD Verified"), /* @__PURE__ */ React.createElement("p", { className: "text-2xl sm:text-3xl font-black text-emerald-400 mt-1 font-mono" }, verifiedPodCount), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-500 mt-1" }, "Delivery fully signed"))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row items-center gap-3 bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-800" }, /* @__PURE__ */ React.createElement("div", { className: "relative flex-1 w-full" }, /* @__PURE__ */ React.createElement(SearchIcon, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" }), /* @__PURE__ */ React.createElement(
    Input,
    {
      placeholder: activeTab === "lr" ? "Search by LR #, Trip ID, Truck #, Client, Route..." : "Search POD by Trip ID, Truck, Client, Route...",
      value: search,
      onChange: (e) => setSearch(e.target.value),
      className: "pl-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl h-11"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 w-full sm:w-auto" }, /* @__PURE__ */ React.createElement(
    "select",
    {
      value: statusFilter,
      onChange: (e) => setStatusFilter(e.target.value),
      className: "bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 font-medium cursor-pointer h-11 w-full sm:w-auto outline-none focus:border-amber-500"
    },
    /* @__PURE__ */ React.createElement("option", { value: "all" }, "All Records"),
    /* @__PURE__ */ React.createElement("option", { value: "in_transit" }, "In-Transit Only"),
    /* @__PURE__ */ React.createElement("option", { value: "completed" }, "Completed Trips"),
    /* @__PURE__ */ React.createElement("option", { value: "pod_verified" }, "POD Verified"),
    /* @__PURE__ */ React.createElement("option", { value: "pod_uploaded" }, "POD Uploaded"),
    /* @__PURE__ */ React.createElement("option", { value: "pod_pending" }, "POD Pending")
  ))), /* @__PURE__ */ React.createElement(Card, { className: "border border-slate-800 bg-slate-900/60 rounded-3xl overflow-hidden shadow-2xl" }, /* @__PURE__ */ React.createElement(CardContent, { className: "p-0" }, loading ? /* @__PURE__ */ React.createElement("div", { className: "py-20 text-center text-slate-400" }, /* @__PURE__ */ React.createElement(RefreshIcon, { className: "w-8 h-8 animate-spin mx-auto text-amber-500 mb-3" }), /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-sm" }, "Loading records from server...")) : filteredTrips.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "py-16 text-center text-slate-400" }, /* @__PURE__ */ React.createElement(FileTextIcon, { className: "w-12 h-12 mx-auto text-slate-600 mb-2 opacity-50" }), /* @__PURE__ */ React.createElement("p", { className: "text-base font-bold text-slate-300" }, "No matching consignments found"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-1" }, "Try adjusting your search query or status filter.")) : activeTab === "lr" ? (
    /* TAB 1: LORRY RECEIPTS (LR / BILTY) TABLE */
    /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left text-xs border-collapse" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "bg-slate-950/80 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-800" }, /* @__PURE__ */ React.createElement("th", { className: "p-3.5 pl-5" }, "LR / Bilty #"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Trip & Truck"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Client & Route"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Booking Date"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Freight"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "POD Status"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5 pr-5 text-right" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-800/60 text-slate-200" }, filteredTrips.map((trip) => {
      const lrNum = getLrNumber(trip);
      const podSt = getPodStatus(trip);
      const clientName = clients[trip.client_id] || trip.client_name || "Direct Client";
      const route = trip.route || (trip.origin || "Origin") + " \u2794 " + (trip.destination || "Destination");
      return /* @__PURE__ */ React.createElement("tr", { key: trip.id, className: "hover:bg-slate-800/40 transition" }, /* @__PURE__ */ React.createElement("td", { className: "p-3.5 pl-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg" }, lrNum), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            setEditLrTrip(trip);
            setNewLrNumber(lrNum);
          },
          className: "text-slate-500 hover:text-slate-300 text-[10px] underline cursor-pointer",
          title: "Edit LR Number"
        },
        "Edit"
      )), trip.eway_bill_number && /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-slate-500 font-mono mt-0.5" }, "E-Way: ", trip.eway_bill_number)), /* @__PURE__ */ React.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-white flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(TruckIcon, { className: "w-3.5 h-3.5 text-slate-400" }), /* @__PURE__ */ React.createElement("span", null, trip.truck_number || "Unassigned")), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-400 font-mono" }, trip.trip_id || trip.id?.slice(0, 10) || "TRIP"), trip.driver_name && /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-slate-500" }, trip.driver_name)), /* @__PURE__ */ React.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-slate-100" }, clientName), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-400 mt-0.5" }, route)), /* @__PURE__ */ React.createElement("td", { className: "p-3.5 text-slate-300 font-mono" }, trip.date || "Today"), /* @__PURE__ */ React.createElement("td", { className: "p-3.5 font-mono font-bold text-emerald-400" }, "\u20B9", Number(trip.revenue || 0).toLocaleString("en-IN")), /* @__PURE__ */ React.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border " + (podSt === "Verified" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : podSt === "Uploaded" ? "bg-blue-500/15 text-blue-400 border-blue-500/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30") }, podSt === "Verified" ? "Verified POD" : podSt === "Uploaded" ? "POD Uploaded" : "POD Pending")), /* @__PURE__ */ React.createElement("td", { className: "p-3.5 pr-5 text-right" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end gap-1.5" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            setViewingLr(trip);
            setLrCopyType("Transporter Copy");
          },
          className: "px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow cursor-pointer transition",
          title: "Print Official A4 Bilty"
        },
        /* @__PURE__ */ React.createElement(PrinterIcon, { className: "w-3.5 h-3.5" }),
        /* @__PURE__ */ React.createElement("span", null, "Print LR")
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => handleShareWhatsApp(trip),
          className: "p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 rounded-lg cursor-pointer transition",
          title: "Share on WhatsApp"
        },
        /* @__PURE__ */ React.createElement(ShareIcon, { className: "w-3.5 h-3.5" })
      ), trip.pod_file ? /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => setViewingPodDoc({
            url: pb.files.getUrl(trip, trip.pod_file),
            tripId: trip.trip_id || trip.id,
            truck: trip.truck_number,
            client: clientName
          }),
          className: "p-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-lg cursor-pointer transition",
          title: "View Signed POD"
        },
        /* @__PURE__ */ React.createElement(EyeIcon, { className: "w-3.5 h-3.5" })
      ) : /* @__PURE__ */ React.createElement(
        "label",
        {
          htmlFor: "upload-lr-" + trip.id,
          className: "p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer transition flex items-center",
          title: "Attach POD Document"
        },
        /* @__PURE__ */ React.createElement(UploadIcon, { className: "w-3.5 h-3.5" }),
        /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "file",
            id: "upload-lr-" + trip.id,
            className: "hidden",
            accept: "image/*,application/pdf",
            onChange: (e) => handleUploadPod(e, trip.id)
          }
        )
      ))));
    }))))
  ) : (
    /* TAB 2: PROOF OF DELIVERY (POD) TABLE */
    /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left text-xs border-collapse" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "bg-slate-950/80 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-800" }, /* @__PURE__ */ React.createElement("th", { className: "p-3.5 pl-5" }, "Trip & LR Ref"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Client & Consignee"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Vehicle & Driver"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Delivery Route"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "POD Document"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Status"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5 pr-5 text-right" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-800/60 text-slate-200" }, filteredTrips.map((trip) => {
      const lrNum = getLrNumber(trip);
      const podSt = getPodStatus(trip);
      const clientName = clients[trip.client_id] || trip.client_name || "Direct Client";
      const hasFile = !!trip.pod_file;
      const hasLink = !!trip.pod_link;
      return /* @__PURE__ */ React.createElement("tr", { key: trip.id, className: "hover:bg-slate-800/40 transition" }, /* @__PURE__ */ React.createElement("td", { className: "p-3.5 pl-5" }, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-white" }, trip.trip_id || "TRIP"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mt-1 inline-block" }, lrNum)), /* @__PURE__ */ React.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-slate-100" }, clientName), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-slate-500" }, trip.date || "Recent")), /* @__PURE__ */ React.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ React.createElement("p", { className: "font-mono font-bold text-slate-200" }, trip.truck_number || "Unassigned"), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-400" }, trip.driver_name || "Driver")), /* @__PURE__ */ React.createElement("td", { className: "p-3.5 text-slate-300" }, trip.route || (trip.origin || "Origin") + " \u2794 " + (trip.destination || "Destination")), /* @__PURE__ */ React.createElement("td", { className: "p-3.5" }, hasFile ? /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => setViewingPodDoc({
            url: pb.files.getUrl(trip, trip.pod_file),
            tripId: trip.trip_id || trip.id,
            truck: trip.truck_number,
            client: clientName
          }),
          className: "flex items-center gap-1.5 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold cursor-pointer transition"
        },
        /* @__PURE__ */ React.createElement(EyeIcon, { className: "w-3.5 h-3.5" }),
        /* @__PURE__ */ React.createElement("span", null, "View Signed File")
      ) : hasLink ? /* @__PURE__ */ React.createElement(
        "a",
        {
          href: trip.pod_link,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-blue-400 underline text-xs font-mono"
        },
        "External POD Link \u2197"
      ) : /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 italic text-[11px]" }, "No file uploaded")), /* @__PURE__ */ React.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border " + (podSt === "Verified" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : podSt === "Uploaded" ? "bg-blue-500/15 text-blue-400 border-blue-500/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30") }, podSt === "Verified" ? "Verified" : podSt === "Uploaded" ? "Uploaded (Review)" : "Pending")), /* @__PURE__ */ React.createElement("td", { className: "p-3.5 pr-5 text-right" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end gap-1.5" }, /* @__PURE__ */ React.createElement(
        "label",
        {
          htmlFor: "pod-upload-" + trip.id,
          className: "px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer " + (uploadingTripId === trip.id ? "bg-slate-700 text-slate-400" : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"),
          title: "Upload Signed POD Photo"
        },
        /* @__PURE__ */ React.createElement(UploadIcon, { className: "w-3.5 h-3.5" }),
        /* @__PURE__ */ React.createElement("span", null, uploadingTripId === trip.id ? "Uploading..." : hasFile ? "Replace" : "Upload"),
        /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "file",
            id: "pod-upload-" + trip.id,
            className: "hidden",
            accept: "image/*,application/pdf",
            onChange: (e) => handleUploadPod(e, trip.id)
          }
        )
      ), (hasFile || hasLink) && /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => handleTogglePodVerify(trip),
          className: "px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer " + (podSt === "Verified" ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30" : "bg-emerald-600 hover:bg-emerald-500 text-white"),
          title: podSt === "Verified" ? "Mark as Pending Review" : "Mark as Officially Verified"
        },
        podSt === "Verified" ? "\u2713 Verified" : "Verify POD"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            setViewingLr(trip);
            setLrCopyType("Transporter Copy");
          },
          className: "p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer transition",
          title: "Print Linked LR / Bilty"
        },
        /* @__PURE__ */ React.createElement(PrinterIcon, { className: "w-3.5 h-3.5" })
      ))));
    }))))
  ))), viewingLr && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "p-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "px-3 py-1 font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs" }, getLrNumber(viewingLr)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]" }, ["Transporter Copy", "Consignor Copy", "Consignee Copy", "Driver Copy"].map((copy) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: copy,
      onClick: () => setLrCopyType(copy),
      className: "px-2 py-0.5 rounded font-semibold cursor-pointer transition " + (lrCopyType === copy ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white")
    },
    copy.replace(" Copy", "")
  )))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handlePrintLrIframe,
      className: "px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer transition"
    },
    /* @__PURE__ */ React.createElement(PrinterIcon, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, "Print A4 / PDF")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleShareWhatsApp(viewingLr),
      className: "px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition"
    },
    /* @__PURE__ */ React.createElement(ShareIcon, { className: "w-3.5 h-3.5" }),
    /* @__PURE__ */ React.createElement("span", null, "WhatsApp")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setViewingLr(null),
      className: "p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(CloseIcon, { className: "w-4 h-4" })
  ))), /* @__PURE__ */ React.createElement("div", { className: "p-4 sm:p-6 overflow-y-auto flex justify-center bg-slate-950/60" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      id: "lr-printable-area",
      className: "w-full max-w-[780px] bg-white text-slate-950 p-6 sm:p-8 rounded-lg shadow-xl font-sans text-xs border border-slate-300"
    },
    /* @__PURE__ */ React.createElement("div", { className: "border-b-2 border-slate-900 pb-3 mb-3 flex justify-between items-start" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-black uppercase tracking-tight text-slate-950" }, companySettings.company_name), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] font-bold text-amber-700 uppercase tracking-widest mt-0.5" }, companySettings.tagline), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-slate-600 mt-1 max-w-md leading-relaxed" }, companySettings.company_address), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 text-[10px] font-semibold text-slate-700 mt-1" }, /* @__PURE__ */ React.createElement("span", null, "Ph: ", companySettings.company_phone), /* @__PURE__ */ React.createElement("span", null, "\u2022"), /* @__PURE__ */ React.createElement("span", null, "Email: ", companySettings.company_email), /* @__PURE__ */ React.createElement("span", null, "\u2022"), /* @__PURE__ */ React.createElement("span", null, companySettings.company_website))), /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-950 text-white font-mono font-black px-3 py-1 rounded text-center text-xs tracking-wider uppercase" }, "LORRY RECEIPT"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1" }, "CONSIGNMENT NOTE"), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] font-mono font-extrabold text-amber-800 mt-0.5" }, lrCopyType.toUpperCase()), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-mono font-bold text-slate-800 mt-1" }, "GSTIN: ", companySettings.company_gstin), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] font-mono text-slate-600" }, "PAN: ", companySettings.company_pan))),
    /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-4 gap-2 bg-slate-100 border border-slate-300 rounded p-2 mb-3 text-[10px]" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 font-bold block" }, "LR NUMBER:"), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-black text-sm text-amber-800" }, getLrNumber(viewingLr))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 font-bold block" }, "BOOKING DATE:"), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-900" }, viewingLr.date || "Today")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 font-bold block" }, "E-WAY BILL NO:"), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold text-slate-900" }, viewingLr.eway_bill_number || "3412-8901-4521")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 font-bold block" }, "TRIP ID:"), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold text-slate-900" }, viewingLr.trip_id || viewingLr.id))),
    /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 gap-2 mb-3 text-[10px]" }, /* @__PURE__ */ React.createElement("div", { className: "border border-slate-300 rounded p-2 bg-slate-50" }, /* @__PURE__ */ React.createElement("p", { className: "font-black uppercase text-slate-600 border-b border-slate-200 pb-1 mb-1" }, "VEHICLE & CREW"), /* @__PURE__ */ React.createElement("p", { className: "font-mono font-black text-xs text-slate-900" }, viewingLr.truck_number || "TG12U2637"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-slate-600 mt-0.5" }, "Fleet Container / 32ft MXL"), /* @__PURE__ */ React.createElement("div", { className: "mt-1.5 pt-1 border-t border-slate-200" }, /* @__PURE__ */ React.createElement("span", { className: "text-[9px] text-slate-500 block" }, "DRIVER:"), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-900" }, viewingLr.driver_name || "Assigned Driver"), /* @__PURE__ */ React.createElement("span", { className: "font-mono text-slate-600 block text-[9px]" }, viewingLr.driver_phone || "+91 98480 12345"))), /* @__PURE__ */ React.createElement("div", { className: "border border-slate-300 rounded p-2" }, /* @__PURE__ */ React.createElement("p", { className: "font-black uppercase text-slate-600 border-b border-slate-200 pb-1 mb-1" }, "CONSIGNOR (SENDER)"), /* @__PURE__ */ React.createElement("p", { className: "font-bold text-slate-900" }, clients[viewingLr.client_id] || viewingLr.client_name || "Consignor Partner"), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-slate-600 mt-0.5 leading-tight" }, "Industrial Estate, ", viewingLr.origin || "Origin Depot"), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] font-mono text-slate-600 mt-1" }, "GSTIN: ", /* @__PURE__ */ React.createElement("b", null, "36AAACG1234A1Z5"))), /* @__PURE__ */ React.createElement("div", { className: "border border-slate-300 rounded p-2" }, /* @__PURE__ */ React.createElement("p", { className: "font-black uppercase text-slate-600 border-b border-slate-200 pb-1 mb-1" }, "CONSIGNEE (RECEIVER)"), /* @__PURE__ */ React.createElement("p", { className: "font-bold text-slate-900" }, "Consignee Warehouse Ltd"), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-slate-600 mt-0.5 leading-tight" }, "Logistics Hub, ", viewingLr.destination || "Destination Terminal"), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] font-mono text-slate-600 mt-1" }, "GSTIN: ", /* @__PURE__ */ React.createElement("b", null, "36AABCS5678B1Z2")))),
    /* @__PURE__ */ React.createElement("div", { className: "bg-slate-100 border border-slate-300 rounded p-2 mb-3 flex items-center justify-between text-[10px]" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 font-bold block" }, "ORIGIN & DISPATCH:"), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-900" }, viewingLr.origin || "Origin Depot")), /* @__PURE__ */ React.createElement("div", { className: "text-center px-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-amber-800 font-black text-sm" }, "\u2794 \u2794 \u2794"), /* @__PURE__ */ React.createElement("span", { className: "block text-[8px] text-slate-500 uppercase tracking-widest font-bold" }, "DIRECT HIGHWAY TRANSIT")), /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 font-bold block" }, "DESTINATION & UNLOADING:"), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-900" }, viewingLr.destination || "Destination Dock"))),
    /* @__PURE__ */ React.createElement("table", { className: "w-full text-left text-[10px] mb-3" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "w-10 text-center" }, "#"), /* @__PURE__ */ React.createElement("th", { className: "w-20 text-center" }, "Packages"), /* @__PURE__ */ React.createElement("th", null, "Description of Goods"), /* @__PURE__ */ React.createElement("th", { className: "w-24 text-right" }, "Actual Wt (Kg)"), /* @__PURE__ */ React.createElement("th", { className: "w-24 text-right" }, "Charged Wt (Kg)"))), /* @__PURE__ */ React.createElement("tbody", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { className: "text-center" }, "1"), /* @__PURE__ */ React.createElement("td", { className: "text-center font-bold" }, "12 Packages"), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-900" }, viewingLr.description || "General Commercial Freight & Machinery Parts"), /* @__PURE__ */ React.createElement("p", { className: "text-[9px] text-slate-500" }, "Secure containerized highway shipment")), /* @__PURE__ */ React.createElement("td", { className: "text-right font-mono" }, "4,850 Kg"), /* @__PURE__ */ React.createElement("td", { className: "text-right font-mono font-bold" }, "5,000 Kg")))),
    /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3 mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "border border-slate-300 rounded p-2 text-[10px]" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold uppercase text-slate-600 block mb-1" }, "PAYMENT & BILLING TERMS:"), /* @__PURE__ */ React.createElement("div", { className: "space-y-0.5" }, /* @__PURE__ */ React.createElement("p", { className: "text-slate-800" }, "Payment Type: ", /* @__PURE__ */ React.createElement("b", null, "BILLED TO CLIENT ACCOUNT (TBB)")), /* @__PURE__ */ React.createElement("p", { className: "text-slate-800" }, "GST Terms: ", /* @__PURE__ */ React.createElement("b", null, "Reverse Charge Mechanism (RCM) Applicable")), /* @__PURE__ */ React.createElement("p", { className: "text-slate-600 text-[9px] mt-1" }, "Bank: ", companySettings.bank_name, " \u2022 A/C: ", companySettings.account_number, " \u2022 IFSC: ", companySettings.ifsc_code))), /* @__PURE__ */ React.createElement("div", { className: "border border-slate-300 rounded p-2 bg-slate-50 text-[10px]" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between py-0.5" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-600" }, "Basic Freight:"), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold" }, "\u20B9", Number(viewingLr.revenue || 12e3).toLocaleString("en-IN"))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between py-0.5 border-t border-slate-200" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-600" }, "Hamali / Handling:"), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold" }, "\u20B90.00")), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between py-1 border-t-2 border-slate-800 text-xs font-black text-slate-950" }, /* @__PURE__ */ React.createElement("span", null, "Total Consignment Revenue:"), /* @__PURE__ */ React.createElement("span", { className: "font-mono text-amber-800" }, "\u20B9", Number(viewingLr.revenue || 12e3).toLocaleString("en-IN"))))),
    /* @__PURE__ */ React.createElement("div", { className: "border border-slate-300 rounded p-2 mb-4 bg-slate-50 text-[8.5px] leading-relaxed text-slate-600" }, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-slate-800 mb-0.5 uppercase" }, "Carriage Terms & Declaration (Carriage by Road Act 2007):"), /* @__PURE__ */ React.createElement("p", null, "1. Consignment accepted subject to standard transport conditions. Goods carried at Owner's risk unless covered under transit insurance. 2. Transporter not liable for road delays due to strikes, weather, or highway inspections. 3. Demurrage charges applicable @ \u20B9500/day after 24 hours of vehicle arrival at delivery point.")),
    /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 gap-3 text-center text-[10px] pt-2" }, /* @__PURE__ */ React.createElement("div", { className: "border-t border-slate-400 pt-1" }, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-slate-800" }, "Consignor / Sender"), /* @__PURE__ */ React.createElement("p", { className: "text-[8px] text-slate-500" }, "Signature / Thumb Impression")), /* @__PURE__ */ React.createElement("div", { className: "border-t border-slate-400 pt-1" }, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-slate-800" }, "Vehicle Driver"), /* @__PURE__ */ React.createElement("p", { className: "text-[8px] text-slate-500" }, "Signature & Key Handover")), /* @__PURE__ */ React.createElement("div", { className: "border-t border-slate-400 pt-1" }, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-slate-900" }, "For ", companySettings.company_name), /* @__PURE__ */ React.createElement("p", { className: "text-[8px] text-amber-800 font-bold" }, "Authorized Dispatch Officer")))
  )))), viewingPodDoc && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden flex flex-col shadow-2xl" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-white text-base flex items-center gap-2" }, /* @__PURE__ */ React.createElement(FileCheckIcon, { className: "w-5 h-5 text-emerald-400" }), "Proof of Delivery (POD) Document"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-0.5" }, "Trip: ", viewingPodDoc.tripId, " \u2022 Truck: ", viewingPodDoc.truck, " \u2022 ", viewingPodDoc.client)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: viewingPodDoc.url,
      download: true,
      target: "_blank",
      rel: "noreferrer",
      className: "px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
    },
    /* @__PURE__ */ React.createElement(DownloadIcon, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, "Download")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setViewingPodDoc(null),
      className: "p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(CloseIcon, { className: "w-4 h-4" })
  ))), /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-slate-950/80 flex items-center justify-center min-h-[400px] max-h-[70vh] overflow-auto" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: viewingPodDoc.url,
      alt: "Proof of Delivery Document",
      className: "max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg border border-slate-800"
    }
  )))), isCreatingLr && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl" }, /* @__PURE__ */ React.createElement("div", { className: "p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-black text-white text-lg flex items-center gap-2" }, /* @__PURE__ */ React.createElement(FileTextIcon, { className: "w-5 h-5 text-amber-400" }), "Issue New Lorry Receipt (LR / Bilty)"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-0.5" }, "Generate an official consignment note and link to fleet operations.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setIsCreatingLr(false),
      className: "p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(CloseIcon, { className: "w-4 h-4" })
  )), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmitCreateLr, className: "p-5 space-y-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "Link to Existing Active Trip (Optional - Pre-fills details):"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: createForm.selectedTripId,
      onChange: (e) => handleSelectTripForLr(e.target.value),
      className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "-- Or Create as Standalone Consignment --"),
    trips.slice(0, 30).map((t) => /* @__PURE__ */ React.createElement("option", { key: t.id, value: t.id }, t.trip_id || t.id.slice(0, 8), " \u2022 ", t.truck_number || "Truck", " \u2022 ", t.origin || "Origin", " \u2794 ", t.destination || "Dest", " (", clients[t.client_id] || t.client_name || "Client", ")"))
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "LR Number *"), /* @__PURE__ */ React.createElement(
    Input,
    {
      required: true,
      value: createForm.lrNumber,
      onChange: (e) => setCreateForm({ ...createForm, lrNumber: e.target.value }),
      className: "bg-slate-950 border-slate-800 text-slate-100 font-mono font-bold"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "GST E-Way Bill Number"), /* @__PURE__ */ React.createElement(
    Input,
    {
      placeholder: "e.g. 3412 8901 4521",
      value: createForm.ewayBill,
      onChange: (e) => setCreateForm({ ...createForm, ewayBill: e.target.value }),
      className: "bg-slate-950 border-slate-800 text-slate-100 font-mono"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "Truck Number"), /* @__PURE__ */ React.createElement(
    Input,
    {
      placeholder: "e.g. TG12U2637",
      value: createForm.truckNumber,
      onChange: (e) => setCreateForm({ ...createForm, truckNumber: e.target.value }),
      className: "bg-slate-950 border-slate-800 text-slate-100 uppercase font-mono"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "Driver Name"), /* @__PURE__ */ React.createElement(
    Input,
    {
      placeholder: "Driver Name",
      value: createForm.driverName,
      onChange: (e) => setCreateForm({ ...createForm, driverName: e.target.value }),
      className: "bg-slate-950 border-slate-800 text-slate-100"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "Driver Phone"), /* @__PURE__ */ React.createElement(
    Input,
    {
      placeholder: "+91 Mobile",
      value: createForm.driverPhone,
      onChange: (e) => setCreateForm({ ...createForm, driverPhone: e.target.value }),
      className: "bg-slate-950 border-slate-800 text-slate-100 font-mono"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "Origin City"), /* @__PURE__ */ React.createElement(
    Input,
    {
      placeholder: "Hyderabad",
      value: createForm.origin,
      onChange: (e) => setCreateForm({ ...createForm, origin: e.target.value }),
      className: "bg-slate-950 border-slate-800 text-slate-100"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "Destination City"), /* @__PURE__ */ React.createElement(
    Input,
    {
      placeholder: "Warangal",
      value: createForm.destination,
      onChange: (e) => setCreateForm({ ...createForm, destination: e.target.value }),
      className: "bg-slate-950 border-slate-800 text-slate-100"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "Freight (\u20B9)"), /* @__PURE__ */ React.createElement(
    Input,
    {
      type: "number",
      placeholder: "12000",
      value: createForm.freight,
      onChange: (e) => setCreateForm({ ...createForm, freight: e.target.value }),
      className: "bg-slate-950 border-slate-800 text-slate-100 font-mono font-bold"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "Consignor (Sender)"), /* @__PURE__ */ React.createElement(
    Input,
    {
      placeholder: "Consignor Company / Name",
      value: createForm.consignorName,
      onChange: (e) => setCreateForm({ ...createForm, consignorName: e.target.value }),
      className: "bg-slate-950 border-slate-800 text-slate-100"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "Consignee (Receiver)"), /* @__PURE__ */ React.createElement(
    Input,
    {
      placeholder: "Consignee Company / Name",
      value: createForm.consigneeName,
      onChange: (e) => setCreateForm({ ...createForm, consigneeName: e.target.value }),
      className: "bg-slate-950 border-slate-800 text-slate-100"
    }
  ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "Goods Description"), /* @__PURE__ */ React.createElement(
    Input,
    {
      placeholder: "e.g. Industrial Goods / Machinery Spares",
      value: createForm.goodsDescription,
      onChange: (e) => setCreateForm({ ...createForm, goodsDescription: e.target.value }),
      className: "bg-slate-950 border-slate-800 text-slate-100"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end gap-3 pt-3 border-t border-slate-800" }, /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "button",
      onClick: () => setIsCreatingLr(false),
      variant: "outline",
      className: "rounded-xl border-slate-700 text-slate-300"
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "submit",
      className: "rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black cursor-pointer"
    },
    "Confirm & Issue LR"
  ))))), editLrTrip && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-white text-base flex items-center gap-2" }, /* @__PURE__ */ React.createElement(FileTextIcon, { className: "w-5 h-5 text-amber-400" }), "Update LR / Consignment Number"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "Trip: ", editLrTrip.trip_id || editLrTrip.id, " \u2022 Truck: ", editLrTrip.truck_number), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-slate-300 block mb-1" }, "New LR Number:"), /* @__PURE__ */ React.createElement(
    Input,
    {
      value: newLrNumber,
      onChange: (e) => setNewLrNumber(e.target.value),
      className: "bg-slate-950 border-slate-800 text-slate-100 font-mono font-bold",
      placeholder: "e.g. JBC/26-27/000280"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end gap-2 pt-2" }, /* @__PURE__ */ React.createElement(
    Button,
    {
      variant: "outline",
      onClick: () => setEditLrTrip(null),
      className: "rounded-xl border-slate-700 text-slate-300"
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
    Button,
    {
      onClick: handleSaveLrNumber,
      className: "rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold cursor-pointer"
    },
    "Save LR Number"
  )))));
}
export { LorryReceiptsPodHubPage as default };
