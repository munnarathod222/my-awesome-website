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
  const [activeTab, setActiveTab] = useState("pod");
  const [trips, setTrips] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [clientMap, setClientMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("pod_required");
  const [viewingLr, setViewingLr] = useState(null);
  const [lrCopyType, setLrCopyType] = useState("Transporter Copy");
  const [previewScale, setPreviewScale] = useState(0.75);
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
    clientId: "",
    clientName: "",
    freight: "",
    ewayBill: "",
    consignorName: "",
    consigneeName: "",
    goodsDescription: "General Commercial Cargo",
    packagesCount: "1",
    weightKg: "1000"
  });
  const [companySettings, setCompanySettings] = useState({
    company_name: "JAI BHAVANI CARGO",
    tagline: "Goods Transport Operators & Fleet Contractors",
    company_address: "Plot no 3, Patel nagar, Ghatkesar, Medchal-Malkajgiri Dist., Telangana - 501301",
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
    msme_number: "UDYAM-TS-20-0193891",
    signatory_name: "Vinod Kumar Rathod",
    signatory_title: "Managing Director",
    logo_url: "/logo.png",
    lr_prefix: "JBC"
  });
  const clientRequiresPod = (cl) => {
    if (!cl) return false;
    return cl.requires_pod === true || cl.requires_pod === 1 || cl.requires_pod === "true" || cl.requires_pod === "1";
  };
  const getClientForTrip = (trip) => {
    if (!trip) return null;
    if (trip.expand && trip.expand.client_id) return trip.expand.client_id;
    if (trip.client_id && clientMap[trip.client_id]) return clientMap[trip.client_id];
    if (trip.client_name) {
      const norm = trip.client_name.trim().toLowerCase();
      const found = clientList.find(
        (c) => c.client_name && c.client_name.trim().toLowerCase() === norm || c.company_name && c.company_name.trim().toLowerCase() === norm || c.name && c.name.trim().toLowerCase() === norm
      );
      if (found) return found;
    }
    return null;
  };
  const getClientName = (trip) => {
    const cl = getClientForTrip(trip);
    if (cl) {
      if (cl.company_name && cl.company_name.trim() !== "-" && cl.company_name.trim() !== "") return cl.company_name.trim();
      if (cl.client_name && cl.client_name.trim() !== "-" && cl.client_name.trim() !== "") return cl.client_name.trim();
      if (cl.name && cl.name.trim() !== "-" && cl.name.trim() !== "") return cl.name.trim();
    }
    if (trip.client_name && trip.client_name.trim() !== "-" && trip.client_name.trim() !== "") return trip.client_name.trim();
    return "Direct Consignment";
  };
  const isTripPodRequired = (trip) => {
    const cl = getClientForTrip(trip);
    if (cl) {
      return clientRequiresPod(cl);
    }
    return trip.requires_pod === true || trip.requires_pod === 1 || trip.requires_pod === "true";
  };
  const getPodStatus = (trip) => {
    const cl = getClientForTrip(trip);
    if (cl && !clientRequiresPod(cl)) {
      return "Not Required";
    }
    if (!isTripPodRequired(trip)) {
      return "Not Required";
    }
    if (trip.pod_status === "Verified") return "Verified";
    if (trip.pod_file || trip.pod_link || trip.pod_status === "Uploaded") return "Uploaded";
    return "Pending";
  };
  const formatTripDate = (dateStr) => {
    if (!dateStr) return "Today";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, "0");
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return day + " " + months[d.getMonth()] + " " + d.getFullYear();
    } catch (e) {
      return dateStr;
    }
  };
  const formatRoute = (trip) => {
    if (trip.route && trip.route.trim()) {
      return trip.route.replace(/->/g, " \u2794 ").replace(/➔/g, " \u2794 ");
    }
    if (trip.origin || trip.destination) {
      return (trip.origin || "Origin") + " \u2794 " + (trip.destination || "Destination");
    }
    return "Direct Highway Transit";
  };
  const getLrNumber = (trip) => {
    if (trip.lr_number && trip.lr_number.trim()) return trip.lr_number.trim();
    if (trip.client_trip_id && trip.client_trip_id.trim()) return trip.client_trip_id.trim();
    const idSuffix = (trip.trip_id || trip.id || "").replace(/[^0-9]/g, "").slice(-4) || "1001";
    return (companySettings.lr_prefix || "JBC") + "/26-27/" + idSuffix;
  };
  const loadData = async () => {
    setLoading(true);
    try {
      try {
        const compList = await pb.collection("company_settings").getList(1, 1, { $autoCancel: false }).catch(() => null);
        if (compList && compList.items && compList.items[0]) {
          const cs = compList.items[0];
          setCompanySettings((prev) => ({
            ...prev,
            company_name: cs.company_name || prev.company_name,
            company_address: cs.company_address || prev.company_address,
            company_phone: cs.company_phone || prev.company_phone,
            company_email: cs.company_email || prev.company_email,
            company_website: cs.company_website || prev.company_website,
            company_gstin: cs.company_gstin || prev.company_gstin,
            company_pan: cs.pan_number || cs.company_pan || prev.company_pan,
            pan_number: cs.pan_number || prev.pan_number,
            msme_number: cs.msme_number || cs.udyam_number || prev.msme_number,
            bank_name: cs.bank_name || prev.bank_name,
            account_name: cs.account_name || prev.account_name,
            account_number: cs.account_number ? cs.account_number.trim() : prev.account_number,
            ifsc_code: cs.ifsc_code || prev.ifsc_code,
            branch_name: cs.branch_name || prev.branch_name,
            signatory_name: cs.signatory_name || prev.signatory_name,
            signatory_title: cs.signatory_title || prev.signatory_title,
            logo_url: cs.company_logo ? pb.files.getUrl(cs, cs.company_logo) : "/logo.png"
          }));
        }
      } catch (err) {
      }
      const rawClients = await pb.collection("clients").getFullList({ $autoCancel: false }).catch(() => []);
      setClientList(rawClients);
      const cMap = {};
      rawClients.forEach((cl) => {
        cMap[cl.id] = cl;
      });
      setClientMap(cMap);
      const tripList = await pb.collection("trip_logs").getFullList({
        sort: "-date",
        expand: "client_id",
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
      clientId: "",
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
    const cl = getClientForTrip(trip);
    const clName = getClientName(trip);
    setCreateForm((prev) => ({
      ...prev,
      selectedTripId: trip.id,
      truckNumber: trip.truck_number || "",
      driverName: trip.driver_name || "",
      driverPhone: trip.driver_phone || "",
      origin: trip.origin || "Hyderabad",
      destination: trip.destination || "Warangal",
      clientId: trip.client_id || cl?.id || "",
      clientName: clName,
      freight: String(trip.revenue || "12000"),
      ewayBill: trip.eway_bill_number || "",
      consignorName: clName || "Consignor Partner",
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
          driver_phone: createForm.driverPhone.trim() || void 0,
          client_id: createForm.clientId || void 0
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
          client_id: createForm.clientId || void 0,
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
    const route = formatRoute(trip);
    const client = getClientName(trip);
    const msg = encodeURIComponent(
      "*JAI BHAVANI CARGO MOVERS*\n\u{1F4C4} *OFFICIAL LORRY RECEIPT / BILTY*\n\n\u{1F539} *LR Number:* #" + lrNum + "\n\u{1F539} *Client:* " + client + "\n\u{1F539} *Vehicle:* " + truck + "\n\u{1F539} *Driver:* " + driver + "\n\u{1F539} *Route:* " + route + "\n\u{1F539} *POD Status:* " + getPodStatus(trip) + "\n\nTrack & download verified documents at:\nhttps://www.jaibhavanicargo.com/lorry-receipts\n\nHead Office: +91 7794072244"
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
              margin: 6mm 8mm;
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
              font-size: 10px;
              line-height: 1.25;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #334155;
              padding: 4px 6px;
            }
            th {
              background: #0f172a !important;
              color: #ffffff !important;
              font-weight: 700;
              text-transform: uppercase;
              font-size: 9px;
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
      const cl = getClientForTrip(t);
      const clName = getClientName(t).toLowerCase();
      const isPodReq = isTripPodRequired(t);
      const lr = getLrNumber(t).toLowerCase();
      const trId = (t.trip_id || t.id || "").toLowerCase();
      const trk = (t.truck_number || "").toLowerCase();
      const rt = formatRoute(t).toLowerCase();
      const ew = (t.eway_bill_number || "").toLowerCase();
      const drv = (t.driver_name || "").toLowerCase();
      const q = search.toLowerCase();
      const matchesSearch = !q || lr.includes(q) || trId.includes(q) || trk.includes(q) || clName.includes(q) || rt.includes(q) || ew.includes(q) || drv.includes(q);
      if (!matchesSearch) return false;
      if (activeTab === "pod") {
        if (clientFilter === "pod_required") {
          if (!isPodReq) return false;
        } else if (clientFilter !== "all") {
          if (t.client_id !== clientFilter && cl?.id !== clientFilter) return false;
        } else {
          if (!isPodReq) return false;
        }
      } else {
        if (clientFilter === "pod_required") {
          if (!isPodReq) return false;
        } else if (clientFilter !== "all") {
          if (t.client_id !== clientFilter && cl?.id !== clientFilter) return false;
        }
      }
      const podSt = getPodStatus(t);
      if (statusFilter === "pod_pending" && podSt !== "Pending") return false;
      if (statusFilter === "pod_uploaded" && podSt !== "Uploaded") return false;
      if (statusFilter === "pod_verified" && podSt !== "Verified") return false;
      if (statusFilter === "in_transit" && (t.status === "Completed" || t.trip_status === "Completed" || t.status === "Delivered" || t.trip_status === "Delivered")) return false;
      if (statusFilter === "completed" && !(t.status === "Completed" || t.trip_status === "Completed" || t.status === "Delivered" || t.trip_status === "Delivered")) return false;
      return true;
    });
  }, [trips, clientList, clientMap, search, statusFilter, clientFilter, activeTab]);
  const podClientsCount = useMemo(() => {
    return clientList.filter(clientRequiresPod).length;
  }, [clientList]);
  const podTripsList = useMemo(() => {
    return trips.filter(isTripPodRequired);
  }, [trips, clientList, clientMap]);
  const totalCount = activeTab === "pod" ? podTripsList.length : trips.length;
  const verifiedPodCount = podTripsList.filter((t) => getPodStatus(t) === "Verified").length;
  const uploadedPodCount = podTripsList.filter((t) => getPodStatus(t) === "Uploaded").length;
  const pendingPodCount = podTripsList.filter((t) => getPodStatus(t) === "Pending").length;
  const inTransitCount = trips.filter((t) => t.status === "In-Transit" || t.trip_status === "In-Transit" || !t.status).length;
  return /* @__PURE__ */ React.createElement("div", { className: "p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300" }, /* @__PURE__ */ React.createElement(Helmet, null, /* @__PURE__ */ React.createElement("title", null, "Lorry Receipts & POD Hub | Jai Bhavani Cargo")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: companySettings.logo_url || "/logo.png",
      onError: (e) => {
        e.target.src = "/logo.png";
      },
      alt: "Jai Bhavani Cargo",
      className: "w-14 h-14 object-contain rounded-2xl bg-white/5 p-1.5 border border-slate-700/80 shadow-inner hidden sm:block"
    }
  ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider" }, "Fleet Operations & Documentation"), /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold" }, "Live & Synced")), /* @__PURE__ */ React.createElement("h1", { className: "text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3" }, /* @__PURE__ */ React.createElement(FileTextIcon, { className: "w-8 h-8 text-amber-400" }), "Lorry Receipts & POD Hub"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-sm mt-1 max-w-2xl" }, companySettings.company_name, " \u2022 Proof of Delivery ledger (strictly filtered to POD-mandated clients) & official executive Bilties."))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 flex-wrap" }, /* @__PURE__ */ React.createElement(
    Button,
    {
      onClick: loadData,
      variant: "outline",
      className: "rounded-xl border-slate-700 hover:bg-slate-800 text-slate-200 cursor-pointer"
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
      onClick: () => {
        setActiveTab("pod");
        setClientFilter("pod_required");
      },
      className: "flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer " + (activeTab === "pod" ? "bg-blue-600 text-white shadow-md font-extrabold" : "text-slate-400 hover:text-white hover:bg-slate-800/60")
    },
    /* @__PURE__ */ React.createElement(FileCheckIcon, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, "POD Management Hub"),
    /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 rounded-full text-xs font-mono " + (activeTab === "pod" ? "bg-white text-blue-900 font-bold" : "bg-slate-800 text-slate-300") }, podTripsList.length, " Trips")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setActiveTab("lr");
        setClientFilter("all");
      },
      className: "flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer " + (activeTab === "lr" ? "bg-amber-500 text-slate-950 shadow-md font-extrabold" : "text-slate-400 hover:text-white hover:bg-slate-800/60")
    },
    /* @__PURE__ */ React.createElement(FileTextIcon, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, "Lorry Receipts (LR / Bilty)"),
    /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 rounded-full text-xs font-mono " + (activeTab === "lr" ? "bg-slate-950 text-amber-400 font-bold" : "bg-slate-800 text-slate-300") }, trips.length)
  )), activeTab === "pod" ? /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 p-4 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-blue-400 text-xs font-bold uppercase tracking-wider" }, "Required POD Trips"), /* @__PURE__ */ React.createElement("p", { className: "text-2xl sm:text-3xl font-black text-white mt-1 font-mono" }, podTripsList.length), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-400 mt-1" }, "Clients requiring POD (", podClientsCount, " clients)")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 p-4 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-amber-400 text-xs font-bold uppercase tracking-wider" }, "POD Pending Review"), /* @__PURE__ */ React.createElement("p", { className: "text-2xl sm:text-3xl font-black text-amber-400 mt-1 font-mono" }, pendingPodCount), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-400 mt-1" }, "Awaiting receiver signed paper")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 p-4 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-cyan-400 text-xs font-bold uppercase tracking-wider" }, "POD Uploaded"), /* @__PURE__ */ React.createElement("p", { className: "text-2xl sm:text-3xl font-black text-cyan-400 mt-1 font-mono" }, uploadedPodCount), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-400 mt-1" }, "Uploaded & awaiting verify")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 p-4 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-emerald-400 text-xs font-bold uppercase tracking-wider" }, "POD Verified"), /* @__PURE__ */ React.createElement("p", { className: "text-2xl sm:text-3xl font-black text-emerald-400 mt-1 font-mono" }, verifiedPodCount), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-400 mt-1" }, "Officially signed & cleared"))) : /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 p-4 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-xs font-bold uppercase tracking-wider" }, "Total Consignments"), /* @__PURE__ */ React.createElement("p", { className: "text-2xl sm:text-3xl font-black text-white mt-1 font-mono" }, trips.length), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-500 mt-1" }, "Complete fleet dispatch register")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 p-4 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-amber-400 text-xs font-bold uppercase tracking-wider" }, "In-Transit / Live"), /* @__PURE__ */ React.createElement("p", { className: "text-2xl sm:text-3xl font-black text-amber-400 mt-1 font-mono" }, inTransitCount), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-500 mt-1" }, "Dispatched on highway")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 p-4 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-blue-400 text-xs font-bold uppercase tracking-wider" }, "POD Required LRs"), /* @__PURE__ */ React.createElement("p", { className: "text-2xl sm:text-3xl font-black text-blue-400 mt-1 font-mono" }, podTripsList.length), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-500 mt-1" }, "Mandated by consignor/client")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/80 border border-slate-800 p-4 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-emerald-400 text-xs font-bold uppercase tracking-wider" }, "POD Verified"), /* @__PURE__ */ React.createElement("p", { className: "text-2xl sm:text-3xl font-black text-emerald-400 mt-1 font-mono" }, verifiedPodCount), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-500 mt-1" }, "Delivery fully acknowledged"))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-800" }, /* @__PURE__ */ React.createElement("div", { className: "relative flex-1 w-full" }, /* @__PURE__ */ React.createElement(SearchIcon, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" }), /* @__PURE__ */ React.createElement(
    Input,
    {
      placeholder: activeTab === "lr" ? "Search by LR #, Trip ID, Truck #, Client, Route..." : "Search POD by Trip ID, Truck #, Client, Route...",
      value: search,
      onChange: (e) => setSearch(e.target.value),
      className: "pl-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl h-11 text-xs"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-auto" }, /* @__PURE__ */ React.createElement(
    "select",
    {
      value: clientFilter,
      onChange: (e) => setClientFilter(e.target.value),
      className: "bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 font-medium cursor-pointer h-11 w-full outline-none focus:border-amber-500"
    },
    /* @__PURE__ */ React.createElement("option", { value: "pod_required" }, "\u26A1 POD-Required Clients Only (", podClientsCount, ")"),
    /* @__PURE__ */ React.createElement("option", { value: "all" }, "\u{1F3E2} All Clients (Full Ledger)"),
    /* @__PURE__ */ React.createElement("optgroup", { label: "Filter by Specific Client" }, clientList.map((c) => {
      const name = c.company_name && c.company_name.trim() !== "-" ? c.company_name : c.client_name || c.name || "Client";
      const isReq = clientRequiresPod(c);
      return /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, name, " ", isReq ? "\u2605 (POD Required)" : "");
    }))
  )), /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-auto" }, /* @__PURE__ */ React.createElement(
    "select",
    {
      value: statusFilter,
      onChange: (e) => setStatusFilter(e.target.value),
      className: "bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 font-medium cursor-pointer h-11 w-full outline-none focus:border-amber-500"
    },
    /* @__PURE__ */ React.createElement("option", { value: "all" }, "All Statuses"),
    /* @__PURE__ */ React.createElement("option", { value: "pod_pending" }, "\u26A0 POD Pending"),
    /* @__PURE__ */ React.createElement("option", { value: "pod_uploaded" }, "\u231B POD Uploaded"),
    /* @__PURE__ */ React.createElement("option", { value: "pod_verified" }, "\u2713 POD Verified"),
    /* @__PURE__ */ React.createElement("option", { value: "in_transit" }, "In-Transit Only"),
    /* @__PURE__ */ React.createElement("option", { value: "completed" }, "Completed / Delivered")
  ))), /* @__PURE__ */ React.createElement(Card, { className: "border border-slate-800 bg-slate-900/60 rounded-3xl overflow-hidden shadow-2xl" }, /* @__PURE__ */ React.createElement(CardContent, { className: "p-0" }, loading ? /* @__PURE__ */ React.createElement("div", { className: "py-20 text-center text-slate-400" }, /* @__PURE__ */ React.createElement(RefreshIcon, { className: "w-8 h-8 animate-spin mx-auto text-amber-500 mb-3" }), /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-sm" }, "Loading records from server...")) : filteredTrips.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "py-16 text-center text-slate-400" }, /* @__PURE__ */ React.createElement(FileCheckIcon, { className: "w-12 h-12 mx-auto text-slate-600 mb-2 opacity-50" }), /* @__PURE__ */ React.createElement("p", { className: "text-base font-bold text-slate-300" }, "No matching consignments found"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-1" }, activeTab === "pod" ? "Showing trips for clients who require POD. Try changing the client or status filter above." : "Try adjusting your search query or client filter."), activeTab === "pod" && clientFilter === "pod_required" && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setClientFilter("all"),
      className: "mt-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition"
    },
    "View All Clients (Including Non-POD)"
  )) : activeTab === "lr" ? (
    /* TAB 1: LORRY RECEIPTS (LR / BILTY) TABLE */
    /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left text-xs border-collapse" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "bg-slate-950/80 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-800" }, /* @__PURE__ */ React.createElement("th", { className: "p-3.5 pl-5" }, "LR / Bilty #"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Trip & Truck"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Client & Route"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Booking Date"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Freight"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "POD Requirement"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5 pr-5 text-right" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-800/60 text-slate-200" }, filteredTrips.map((trip) => {
      const lrNum = getLrNumber(trip);
      const podSt = getPodStatus(trip);
      const clObj = getClientForTrip(trip);
      const clientName = getClientName(trip);
      const isReq = clientRequiresPod(clObj) || isTripPodRequired(trip);
      const route = formatRoute(trip);
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
      )), trip.eway_bill_number && /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-slate-500 font-mono mt-0.5" }, "E-Way: ", trip.eway_bill_number)), /* @__PURE__ */ React.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-white flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(TruckIcon, { className: "w-3.5 h-3.5 text-slate-400" }), /* @__PURE__ */ React.createElement("span", { className: "font-mono" }, trip.truck_number || "TG12U2637")), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-400 font-mono" }, trip.trip_id || trip.id?.slice(0, 10) || "TRIP"), trip.driver_name && /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-slate-500" }, trip.driver_name)), /* @__PURE__ */ React.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 flex-wrap" }, /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-slate-100" }, clientName), isReq && /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30" }, "POD Req")), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-400 mt-0.5" }, route)), /* @__PURE__ */ React.createElement("td", { className: "p-3.5 text-slate-300 font-mono" }, formatTripDate(trip.date)), /* @__PURE__ */ React.createElement("td", { className: "p-3.5 font-mono font-bold text-emerald-400" }, "\u20B9", Number(trip.revenue || 0).toLocaleString("en-IN")), /* @__PURE__ */ React.createElement("td", { className: "p-3.5" }, podSt === "Not Required" ? /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800/80 text-slate-400 border border-slate-700" }, "Not Required") : /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border " + (podSt === "Verified" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : podSt === "Uploaded" ? "bg-blue-500/15 text-blue-400 border-blue-500/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30") }, podSt === "Verified" ? "\u2713 Verified POD" : podSt === "Uploaded" ? "\u231B POD Uploaded" : "\u26A0 POD Pending")), /* @__PURE__ */ React.createElement("td", { className: "p-3.5 pr-5 text-right" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end gap-1.5" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            setViewingLr(trip);
            setLrCopyType("Transporter Copy");
            setPreviewScale(0.75);
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
      ) : isReq ? /* @__PURE__ */ React.createElement(
        "label",
        {
          htmlFor: "upload-lr-" + trip.id,
          className: "p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg cursor-pointer transition",
          title: "Upload POD File"
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
      ) : null)));
    }))))
  ) : (
    /* TAB 2: PROOF OF DELIVERY (POD) TABLE - STRICTLY FOR REQUIRED POD CLIENTS */
    /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left text-xs border-collapse" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "bg-slate-950/80 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-800" }, /* @__PURE__ */ React.createElement("th", { className: "p-3.5 pl-5" }, "Trip & LR Ref"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Client & Requirement"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Vehicle & Driver"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Delivery Route"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Trip Date"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "POD Document"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5" }, "Status"), /* @__PURE__ */ React.createElement("th", { className: "p-3.5 pr-5 text-right" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-800/60 text-slate-200" }, filteredTrips.map((trip) => {
      const lrNum = getLrNumber(trip);
      const podSt = getPodStatus(trip);
      const clObj = getClientForTrip(trip);
      const clientName = getClientName(trip);
      const hasFile = !!trip.pod_file;
      const hasLink = !!trip.pod_link;
      const isReq = clientRequiresPod(clObj) || isTripPodRequired(trip);
      return /* @__PURE__ */ React.createElement("tr", { key: trip.id, className: "hover:bg-slate-800/40 transition" }, /* @__PURE__ */ React.createElement("td", { className: "p-3.5 pl-5" }, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-white font-mono" }, trip.trip_id || trip.id?.slice(0, 10) || "TRIP"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mt-1 inline-block" }, lrNum)), /* @__PURE__ */ React.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-slate-100" }, clientName), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 mt-0.5" }, isReq ? /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30" }, "Mandated POD") : /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.2 rounded text-[9px] text-slate-500 bg-slate-800 border border-slate-700" }, "Optional"))), /* @__PURE__ */ React.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ React.createElement("p", { className: "font-mono font-bold text-slate-200" }, trip.truck_number || "TG12U2637"), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-400" }, trip.driver_name || "Assigned Driver")), /* @__PURE__ */ React.createElement("td", { className: "p-3.5 text-slate-300" }, formatRoute(trip)), /* @__PURE__ */ React.createElement("td", { className: "p-3.5 text-slate-300 font-mono" }, formatTripDate(trip.date)), /* @__PURE__ */ React.createElement("td", { className: "p-3.5" }, hasFile ? /* @__PURE__ */ React.createElement(
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
      ) : /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 italic text-[11px]" }, "No file uploaded")), /* @__PURE__ */ React.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border " + (podSt === "Verified" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : podSt === "Uploaded" ? "bg-blue-500/15 text-blue-400 border-blue-500/30" : podSt === "Not Required" ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-amber-500/15 text-amber-400 border-amber-500/30") }, podSt === "Verified" ? "\u2713 Verified" : podSt === "Uploaded" ? "\u231B Uploaded (Review)" : podSt === "Not Required" ? "Not Required" : "\u26A0 Pending POD")), /* @__PURE__ */ React.createElement("td", { className: "p-3.5 pr-5 text-right" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end gap-1.5" }, /* @__PURE__ */ React.createElement(
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
            setPreviewScale(0.75);
          },
          className: "p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer transition",
          title: "Print Linked LR / Bilty"
        },
        /* @__PURE__ */ React.createElement(PrinterIcon, { className: "w-3.5 h-3.5" })
      ))));
    }))))
  ))), viewingLr && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-1 sm:p-3 overflow-y-auto animate-in fade-in duration-200" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 flex-wrap" }, /* @__PURE__ */ React.createElement("span", { className: "px-3 py-1 font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs" }, getLrNumber(viewingLr)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]" }, ["Transporter Copy", "Consignor Copy", "Consignee Copy", "Driver Copy"].map((copy) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: copy,
      onClick: () => setLrCopyType(copy),
      className: "px-2.5 py-1 rounded-md font-semibold cursor-pointer transition " + (lrCopyType === copy ? "bg-amber-500 text-slate-950 font-bold shadow" : "text-slate-400 hover:text-white")
    },
    copy.replace(" Copy", "")
  )))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400 text-[11px] font-semibold mr-1" }, "Preview Zoom:"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setPreviewScale((s) => Math.max(0.4, Number((s - 0.1).toFixed(2)))),
      className: "w-6 h-6 rounded flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer transition",
      title: "Zoom Out"
    },
    "-"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setPreviewScale(0.72),
      className: "px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition " + (previewScale === 0.72 ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-800 text-slate-300 hover:text-white"),
      title: "Fit whole document on screen without browser zoom"
    },
    "Fit Screen"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setPreviewScale(1),
      className: "px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition " + (previewScale === 1 ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-800 text-slate-300 hover:text-white"),
      title: "100% Actual Size"
    },
    "100%"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setPreviewScale((s) => Math.min(1.5, Number((s + 0.1).toFixed(2)))),
      className: "w-6 h-6 rounded flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer transition",
      title: "Zoom In"
    },
    "+"
  ), /* @__PURE__ */ React.createElement("span", { className: "text-amber-400 font-mono text-[11px] ml-1 font-bold" }, Math.round(previewScale * 100), "%")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handlePrintLrIframe,
      className: "px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer transition"
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
    /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, "WhatsApp")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setViewingLr(null),
      className: "p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(CloseIcon, { className: "w-4 h-4" })
  ))), /* @__PURE__ */ React.createElement("div", { className: "p-3 sm:p-5 overflow-auto flex-1 flex justify-center items-start bg-slate-950/90 min-h-[450px]" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        transform: `scale(${previewScale})`,
        transformOrigin: "top center",
        transition: "transform 0.15s ease-out",
        marginBottom: previewScale < 1 ? `-${Math.round((1 - previewScale) * 1160)}px` : "20px"
      }
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        id: "lr-printable-area",
        style: {
          width: "790px",
          backgroundColor: "#ffffff",
          color: "#0f172a",
          padding: "24px 28px",
          borderRadius: "4px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          fontSize: "11px",
          lineHeight: 1.3,
          border: "2px solid #0f172a",
          position: "relative",
          overflow: "hidden"
        }
      },
      /* @__PURE__ */ React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            top: "52%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-30deg)",
            pointerEvents: "none",
            opacity: 0.032,
            fontSize: "52px",
            fontWeight: 900,
            color: "#0f172a",
            whiteSpace: "nowrap",
            userSelect: "none",
            zIndex: 0
          }
        },
        "JAI BHAVANI CARGO MOVERS"
      ),
      /* @__PURE__ */ React.createElement("div", { style: { borderBottom: "3px double #0f172a", paddingBottom: "12px", marginBottom: "12px", position: "relative", zIndex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", gap: "14px", flex: 1 } }, /* @__PURE__ */ React.createElement(
        "img",
        {
          src: companySettings.logo_url || "/logo.png",
          onError: (e) => {
            e.target.src = "/logo.png";
          },
          alt: "Logo",
          style: {
            height: "64px",
            width: "auto",
            maxWidth: "80px",
            objectFit: "contain",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            padding: "2px",
            backgroundColor: "#ffffff"
          }
        }
      ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "23px", fontWeight: 900, letterSpacing: "-0.5px", color: "#0f172a", margin: 0, textTransform: "uppercase" } }, companySettings.company_name), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "10.5px", fontWeight: 800, color: "#92400e", textTransform: "uppercase", letterSpacing: "1.5px", margin: "2px 0 4px" } }, companySettings.tagline || "Goods Transport Operators & Fleet Contractors"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "9.5px", color: "#334155", margin: 0, lineHeight: 1.35, maxWidth: "420px" } }, companySettings.company_address), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "9px", color: "#475569", fontWeight: 600, marginTop: "4px" } }, /* @__PURE__ */ React.createElement("span", null, "\u{1F4DE} Ph: ", /* @__PURE__ */ React.createElement("b", null, companySettings.company_phone)), /* @__PURE__ */ React.createElement("span", null, "\u2022"), /* @__PURE__ */ React.createElement("span", null, "\u2709\uFE0F ", companySettings.company_email), /* @__PURE__ */ React.createElement("span", null, "\u2022"), /* @__PURE__ */ React.createElement("span", null, "\u{1F310} ", companySettings.company_website)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" } }, /* @__PURE__ */ React.createElement("span", { style: { backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "3px", padding: "1px 6px", fontSize: "9px", fontWeight: 700, color: "#0f172a" } }, "GSTIN: ", /* @__PURE__ */ React.createElement("b", null, companySettings.company_gstin)), /* @__PURE__ */ React.createElement("span", { style: { backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "3px", padding: "1px 6px", fontSize: "9px", fontWeight: 700, color: "#0f172a" } }, "PAN: ", /* @__PURE__ */ React.createElement("b", null, companySettings.company_pan || companySettings.pan_number || "DPXPR9171A")), /* @__PURE__ */ React.createElement("span", { style: { backgroundColor: "#fef3c7", border: "1px solid #fde68a", borderRadius: "3px", padding: "1px 6px", fontSize: "9px", fontWeight: 700, color: "#92400e" } }, "MSME: ", /* @__PURE__ */ React.createElement("b", null, companySettings.msme_number || companySettings.udyam_number || "UDYAM-TS-20-0193891"))))), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right", minWidth: "210px" } }, /* @__PURE__ */ React.createElement("div", { style: { backgroundColor: "#0f172a", color: "#ffffff", padding: "5px 12px", borderRadius: "4px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase", display: "block" } }, "LORRY RECEIPT"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "8.5px", fontWeight: 700, letterSpacing: "1px", color: "#94a3b8", textTransform: "uppercase" } }, "GOODS CONSIGNMENT NOTE")), /* @__PURE__ */ React.createElement("div", { style: {
        backgroundColor: lrCopyType.includes("Transporter") ? "#fef3c7" : lrCopyType.includes("Consignor") ? "#eff6ff" : lrCopyType.includes("Consignee") ? "#ecfdf5" : "#f5f3ff",
        border: "1px solid " + (lrCopyType.includes("Transporter") ? "#f59e0b" : lrCopyType.includes("Consignor") ? "#3b82f6" : lrCopyType.includes("Consignee") ? "#10b981" : "#8b5cf6"),
        color: lrCopyType.includes("Transporter") ? "#92400e" : lrCopyType.includes("Consignor") ? "#1e40af" : lrCopyType.includes("Consignee") ? "#065f46" : "#5b21b6",
        borderRadius: "4px",
        padding: "3px 8px",
        marginTop: "5px",
        textAlign: "center"
      } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px" } }, lrCopyType.toUpperCase())), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "8.5px", color: "#64748b", margin: "4px 0 0", fontStyle: "italic" } }, "Carriage by Road Act 2007 Registered"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "8px", fontWeight: 700, color: "#0f172a", margin: "2px 0 0" } }, "IBA CODE: HYD/2026/JBC \u2022 ISO 9001")))),
      /* @__PURE__ */ React.createElement("div", { style: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "8px",
        backgroundColor: "#f8fafc",
        border: "1px solid #cbd5e1",
        borderRadius: "4px",
        padding: "8px 10px",
        marginBottom: "10px",
        fontSize: "10px",
        position: "relative",
        zIndex: 1
      } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b", fontWeight: 800, fontSize: "8.5px", textTransform: "uppercase", display: "block" } }, "LR / BILTY NUMBER:"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "monospace", fontWeight: 900, fontSize: "13px", color: "#b45309" } }, getLrNumber(viewingLr)), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "monospace", fontSize: "10px", letterSpacing: "3px", fontWeight: 900, color: "#334155", lineHeight: 1 } }, "||| | |||| || |||")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b", fontWeight: 800, fontSize: "8.5px", textTransform: "uppercase", display: "block" } }, "BOOKING DATE:"), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700, fontSize: "11px", color: "#0f172a" } }, formatTripDate(viewingLr.date)), /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b", fontSize: "8.5px", display: "block" } }, "Scheduled Dispatch")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b", fontWeight: 800, fontSize: "8.5px", textTransform: "uppercase", display: "block" } }, "E-WAY BILL NO:"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "monospace", fontWeight: 800, fontSize: "11px", color: "#0f172a" } }, viewingLr.eway_bill_number || "3412-8901-4521"), /* @__PURE__ */ React.createElement("span", { style: { color: "#059669", fontWeight: 700, fontSize: "8.5px", display: "block" } }, "\u2713 Portal Verified")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b", fontWeight: 800, fontSize: "8.5px", textTransform: "uppercase", display: "block" } }, "DISPATCH MANIFEST ID:"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "monospace", fontWeight: 800, fontSize: "11px", color: "#0f172a" } }, viewingLr.trip_id || viewingLr.id), /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b", fontSize: "8.5px", display: "block" } }, "Fleet Container Cargo"))),
      /* @__PURE__ */ React.createElement("div", { style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "8px",
        marginBottom: "10px",
        fontSize: "9.5px",
        position: "relative",
        zIndex: 1
      } }, /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid #cbd5e1", borderRadius: "4px", padding: "8px", backgroundColor: "#f8fafc" } }, /* @__PURE__ */ React.createElement("p", { style: { fontWeight: 900, textTransform: "uppercase", color: "#475569", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", margin: "0 0 6px", fontSize: "9px" } }, "VEHICLE & CREW DETAILS"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" } }, /* @__PURE__ */ React.createElement("span", { style: { backgroundColor: "#fef08a", border: "1px solid #ca8a04", color: "#713f12", fontWeight: 900, fontFamily: "monospace", fontSize: "11px", padding: "2px 6px", borderRadius: "3px" } }, viewingLr.truck_number || "TG12U2637"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "8.5px", color: "#64748b" } }, "32ft MXL Container")), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "6px", paddingTop: "4px", borderTop: "1px dashed #e2e8f0" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b", fontSize: "8.5px", fontWeight: 700, display: "block" } }, "ASSIGNED DRIVER:"), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 800, color: "#0f172a" } }, viewingLr.driver_name || "Suresh Edlai"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "monospace", color: "#475569", display: "block", fontSize: "9px" } }, viewingLr.driver_phone || "+91 77940 72244"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "8px", color: "#64748b" } }, "DL: TS-07-2008-004312 (Heavy)"))), /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid #cbd5e1", borderRadius: "4px", padding: "8px", backgroundColor: "#ffffff" } }, /* @__PURE__ */ React.createElement("p", { style: { fontWeight: 900, textTransform: "uppercase", color: "#475569", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", margin: "0 0 6px", fontSize: "9px" } }, "CONSIGNOR (SHIPPER / SENDER)"), /* @__PURE__ */ React.createElement("p", { style: { fontWeight: 800, color: "#0f172a", fontSize: "10.5px", margin: "0 0 2px" } }, getClientName(viewingLr)), /* @__PURE__ */ React.createElement("p", { style: { color: "#475569", margin: "0 0 4px", lineHeight: 1.3 } }, "Industrial Cargo Sector, ", viewingLr.origin || "Origin Hub"), /* @__PURE__ */ React.createElement("p", { style: { fontFamily: "monospace", color: "#334155", margin: 0 } }, "GSTIN: ", /* @__PURE__ */ React.createElement("b", null, "36AAACG1234A1Z5")), /* @__PURE__ */ React.createElement("p", { style: { color: "#64748b", fontSize: "8.5px", margin: "2px 0 0" } }, "State Code: 36 (Telangana)")), /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid #cbd5e1", borderRadius: "4px", padding: "8px", backgroundColor: "#ffffff" } }, /* @__PURE__ */ React.createElement("p", { style: { fontWeight: 900, textTransform: "uppercase", color: "#475569", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", margin: "0 0 6px", fontSize: "9px" } }, "CONSIGNEE (DELIVERY RECEIVER)"), /* @__PURE__ */ React.createElement("p", { style: { fontWeight: 800, color: "#0f172a", fontSize: "10.5px", margin: "0 0 2px" } }, viewingLr.consignee_name || "Consignee Logistics Ltd"), /* @__PURE__ */ React.createElement("p", { style: { color: "#475569", margin: "0 0 4px", lineHeight: 1.3 } }, "Logistics Terminal, ", viewingLr.destination || "Destination Dock"), /* @__PURE__ */ React.createElement("p", { style: { fontFamily: "monospace", color: "#334155", margin: 0 } }, "GSTIN: ", /* @__PURE__ */ React.createElement("b", null, "36AABCS5678B1Z2")), /* @__PURE__ */ React.createElement("p", { style: { color: "#64748b", fontSize: "8.5px", margin: "2px 0 0" } }, "Delivery Contact: Dock Manager"))),
      /* @__PURE__ */ React.createElement("div", { style: {
        backgroundColor: "#f8fafc",
        border: "1px solid #cbd5e1",
        borderRadius: "4px",
        padding: "6px 12px",
        marginBottom: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "9.5px",
        position: "relative",
        zIndex: 1
      } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b", fontWeight: 700, fontSize: "8.5px", display: "block" } }, "ORIGIN & LOADING POINT:"), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 800, color: "#0f172a" } }, viewingLr.origin || "Hyderabad Depot")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "0 16px" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#b45309", fontWeight: 900, fontSize: "13px" } }, "\u2794 \u2794 \u{1F69A} \u2794 \u2794"), /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontSize: "8px", color: "#64748b", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase" } }, "EXPRESS HIGHWAY FREIGHT TRANSIT")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b", fontWeight: 700, fontSize: "8.5px", display: "block" } }, "DESTINATION & UNLOADING DOCK:"), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 800, color: "#0f172a" } }, viewingLr.destination || "Warangal Hub"))),
      /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", marginBottom: "10px", fontSize: "9.5px", position: "relative", zIndex: 1 } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { width: "24px", textAlign: "center", backgroundColor: "#0f172a", color: "#ffffff", padding: "5px 6px", border: "1px solid #334155" } }, "#"), /* @__PURE__ */ React.createElement("th", { style: { width: "90px", textAlign: "center", backgroundColor: "#0f172a", color: "#ffffff", padding: "5px 6px", border: "1px solid #334155" } }, "Packages & Type"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "left", backgroundColor: "#0f172a", color: "#ffffff", padding: "5px 8px", border: "1px solid #334155" } }, "Description of Goods (Said to Contain)"), /* @__PURE__ */ React.createElement("th", { style: { width: "100px", textAlign: "center", backgroundColor: "#0f172a", color: "#ffffff", padding: "5px 6px", border: "1px solid #334155" } }, "Invoice / Challan"), /* @__PURE__ */ React.createElement("th", { style: { width: "85px", textAlign: "right", backgroundColor: "#0f172a", color: "#ffffff", padding: "5px 6px", border: "1px solid #334155" } }, "Actual Wt"), /* @__PURE__ */ React.createElement("th", { style: { width: "85px", textAlign: "right", backgroundColor: "#0f172a", color: "#ffffff", padding: "5px 6px", border: "1px solid #334155" } }, "Charged Wt"))), /* @__PURE__ */ React.createElement("tbody", null, /* @__PURE__ */ React.createElement("tr", { style: { backgroundColor: "#ffffff" } }, /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center", border: "1px solid #cbd5e1", padding: "6px" } }, "1"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center", fontWeight: 700, border: "1px solid #cbd5e1", padding: "6px" } }, "10 Standard Pkgs"), /* @__PURE__ */ React.createElement("td", { style: { border: "1px solid #cbd5e1", padding: "6px 8px" } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 800, color: "#0f172a" } }, viewingLr.description || "General Commercial Freight & Machinery Spares"), /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontSize: "8.5px", color: "#64748b" } }, "Loaded in clean sealed container \u2022 Transport Operator Risk")), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center", fontFamily: "monospace", border: "1px solid #cbd5e1", padding: "6px" } }, "INV-2026-9041"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontFamily: "monospace", border: "1px solid #cbd5e1", padding: "6px" } }, "4,500 Kg"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", fontFamily: "monospace", fontWeight: 800, color: "#0f172a", border: "1px solid #cbd5e1", padding: "6px" } }, "5,000 Kg")))),
      /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "10px", marginBottom: "10px", fontSize: "9.5px", position: "relative", zIndex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid #cbd5e1", borderRadius: "4px", padding: "8px 10px", backgroundColor: "#ffffff" } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 900, textTransform: "uppercase", color: "#475569", display: "block", marginBottom: "4px", fontSize: "9px" } }, "PAYMENT, GST & BANKING REMITTANCE:"), /* @__PURE__ */ React.createElement("div", { style: { lineHeight: 1.45, color: "#334155" } }, /* @__PURE__ */ React.createElement("p", { style: { margin: "0 0 2px" } }, "\u2022 Freight Payment: ", /* @__PURE__ */ React.createElement("b", { style: { color: "#0f172a" } }, "BILLED TO CLIENT ACCOUNT (TBB)")), /* @__PURE__ */ React.createElement("p", { style: { margin: "0 0 2px" } }, "\u2022 GST Notification: ", /* @__PURE__ */ React.createElement("b", { style: { color: "#0f172a" } }, "Reverse Charge Mechanism (RCM) under Sec 9(3) CGST Act")), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "4px", paddingTop: "4px", borderTop: "1px dashed #cbd5e1", fontSize: "9px" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b", fontWeight: 700, display: "block" } }, "OFFICIAL BANK ACCOUNT COORDINATES:"), /* @__PURE__ */ React.createElement("span", { style: { color: "#0f172a" } }, "Bank: ", /* @__PURE__ */ React.createElement("b", null, companySettings.bank_name), " \u2022 A/C No: ", /* @__PURE__ */ React.createElement("b", { style: { fontFamily: "monospace" } }, companySettings.account_number)), /* @__PURE__ */ React.createElement("span", { style: { display: "block", color: "#0f172a" } }, "IFSC: ", /* @__PURE__ */ React.createElement("b", { style: { fontFamily: "monospace" } }, companySettings.ifsc_code), " \u2022 Branch: ", /* @__PURE__ */ React.createElement("b", null, companySettings.branch_name))))), /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid #cbd5e1", borderRadius: "4px", padding: "8px 10px", backgroundColor: "#f8fafc" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", padding: "2px 0" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#475569" } }, "Basic Freight:"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "monospace", fontWeight: 700, color: "#0f172a" } }, "\u20B9", Number(viewingLr.revenue || 12e3).toLocaleString("en-IN"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", padding: "2px 0", borderTop: "1px solid #e2e8f0" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#475569" } }, "Hamali / Handling Charges:"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "monospace", fontWeight: 600, color: "#0f172a" } }, "\u20B90.00")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", padding: "2px 0", borderTop: "1px solid #e2e8f0" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#475569" } }, "Green Tax / Statistical Surcharge:"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "monospace", fontWeight: 600, color: "#0f172a" } }, "\u20B90.00")), /* @__PURE__ */ React.createElement("div", { style: {
        display: "flex",
        justifyContent: "space-between",
        padding: "5px 0",
        marginTop: "4px",
        borderTop: "2px solid #0f172a",
        borderBottom: "1px solid #0f172a",
        fontSize: "11px",
        fontWeight: 900
      } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#0f172a" } }, "Total Consignment Freight:"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "monospace", color: "#b45309" } }, "\u20B9", Number(viewingLr.revenue || 12e3).toLocaleString("en-IN"))))),
      /* @__PURE__ */ React.createElement("div", { style: {
        border: "1px solid #cbd5e1",
        borderRadius: "4px",
        padding: "6px 8px",
        marginBottom: "10px",
        backgroundColor: "#f8fafc",
        fontSize: "8px",
        lineHeight: 1.35,
        color: "#475569",
        position: "relative",
        zIndex: 1
      } }, /* @__PURE__ */ React.createElement("p", { style: { fontWeight: 800, color: "#1e293b", margin: "0 0 2px", textTransform: "uppercase" } }, "Carriage Terms & Conditions (Carriage by Road Act 2007):"), /* @__PURE__ */ React.createElement("p", { style: { margin: 0 } }, "1. Consignment is accepted subject to standard carrier terms. Goods carried at Owner's risk unless covered under comprehensive transit insurance. 2. Transporter shall not be responsible for en-route highway delays caused by force majeure, road blockades or statutory RTO/GST inspections. 3. Unloading demurrage charges @ \u20B9500/day applicable after 24 hours of vehicle arrival at receiver's terminal.")),
      /* @__PURE__ */ React.createElement("div", { style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1.2fr",
        gap: "12px",
        paddingTop: "6px",
        borderTop: "1px solid #cbd5e1",
        fontSize: "9px",
        textAlign: "center",
        position: "relative",
        zIndex: 1
      } }, /* @__PURE__ */ React.createElement("div", { style: { paddingTop: "24px", borderTop: "1px solid #94a3b8" } }, /* @__PURE__ */ React.createElement("p", { style: { fontWeight: 800, color: "#0f172a", margin: 0 } }, "CONSIGNOR SIGNATURE"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "7.5px", color: "#64748b", margin: "2px 0 0" } }, "Shipper Verification & Handover")), /* @__PURE__ */ React.createElement("div", { style: { paddingTop: "24px", borderTop: "1px solid #94a3b8" } }, /* @__PURE__ */ React.createElement("p", { style: { fontWeight: 800, color: "#0f172a", margin: 0 } }, "DRIVER SIGNATURE"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "7.5px", color: "#64748b", margin: "2px 0 0" } }, "Vehicle Custody & Goods Receipt")), /* @__PURE__ */ React.createElement("div", { style: {
        paddingTop: "4px",
        border: "1.5px solid #0f172a",
        backgroundColor: "#fef3c7",
        borderRadius: "4px",
        padding: "6px 8px"
      } }, /* @__PURE__ */ React.createElement("p", { style: { fontWeight: 900, color: "#78350f", margin: 0, fontSize: "9px", textTransform: "uppercase" } }, "FOR ", companySettings.company_name), /* @__PURE__ */ React.createElement("div", { style: { margin: "4px 0", fontSize: "11px", fontWeight: 900, color: "#0f172a", fontStyle: "italic", fontFamily: "serif" } }, companySettings.signatory_name || "Vinod Kumar Rathod"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "7.5px", fontWeight: 800, color: "#92400e", margin: 0, textTransform: "uppercase" } }, companySettings.signatory_title || "Managing Director", " \u2022 AUTHORISED SIGNATORY")))
    )
  )))), viewingPodDoc && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-white text-sm flex items-center gap-2" }, /* @__PURE__ */ React.createElement(FileCheckIcon, { className: "w-4 h-4 text-emerald-400" }), /* @__PURE__ */ React.createElement("span", null, "Proof of Delivery Document")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-0.5" }, "Trip: ", viewingPodDoc.tripId, " \u2022 Truck: ", viewingPodDoc.truck, " \u2022 Client: ", viewingPodDoc.client)), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setViewingPodDoc(null),
      className: "p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(CloseIcon, { className: "w-4 h-4" })
  )), /* @__PURE__ */ React.createElement("div", { className: "p-4 overflow-y-auto flex-1 flex items-center justify-center bg-slate-950/80 min-h-[300px]" }, viewingPodDoc.url.toLowerCase().endsWith(".pdf") ? /* @__PURE__ */ React.createElement(
    "iframe",
    {
      src: viewingPodDoc.url,
      className: "w-full h-[550px] rounded-xl border border-slate-800",
      title: "POD PDF Document"
    }
  ) : /* @__PURE__ */ React.createElement(
    "img",
    {
      src: viewingPodDoc.url,
      alt: "Signed POD",
      className: "max-h-[550px] w-auto max-w-full rounded-xl shadow-lg border border-slate-800 object-contain"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2" }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: viewingPodDoc.url,
      target: "_blank",
      rel: "noopener noreferrer",
      download: true,
      className: "px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(DownloadIcon, { className: "w-3.5 h-3.5" }),
    /* @__PURE__ */ React.createElement("span", null, "Download File")
  ), /* @__PURE__ */ React.createElement(
    Button,
    {
      variant: "outline",
      onClick: () => setViewingPodDoc(null),
      className: "rounded-xl border-slate-700 text-slate-300"
    },
    "Close Preview"
  )))), isCreatingLr && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-white text-base flex items-center gap-2" }, /* @__PURE__ */ React.createElement(FileTextIcon, { className: "w-5 h-5 text-amber-400" }), /* @__PURE__ */ React.createElement("span", null, "Issue New Lorry Receipt / Consignment Note")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400 mt-0.5" }, "Generate official transporter consignment note (LR / Bilty) with automated tracking")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setIsCreatingLr(false),
      className: "p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(CloseIcon, { className: "w-4 h-4" })
  )), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmitCreateLr, className: "p-5 space-y-4 overflow-y-auto text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2" }, /* @__PURE__ */ React.createElement("label", { className: "font-bold text-slate-300 block" }, "Link to Existing Trip Log (Optional - auto-fills details):"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: createForm.selectedTripId,
      onChange: (e) => handleSelectTripForLr(e.target.value),
      className: "w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl p-2.5 outline-none font-mono text-xs focus:border-amber-500 cursor-pointer"
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "-- Choose active trip from fleet register (or create standalone) --"),
    trips.slice(0, 30).map((t) => /* @__PURE__ */ React.createElement("option", { key: t.id, value: t.id }, t.trip_id || t.id.slice(0, 8), " \u2022 ", t.truck_number || "Truck", " \u2022 ", getClientName(t), " \u2022 ", formatRoute(t), " (", formatTripDate(t.date), ")"))
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3.5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "font-semibold text-slate-400 block mb-1" }, "LR Number *"), /* @__PURE__ */ React.createElement(
    Input,
    {
      required: true,
      value: createForm.lrNumber,
      onChange: (e) => setCreateForm({ ...createForm, lrNumber: e.target.value }),
      placeholder: "e.g. JBC/26-27/1001",
      className: "bg-slate-950 border-slate-800 text-amber-400 font-mono font-bold"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "font-semibold text-slate-400 block mb-1" }, "E-Way Bill Number"), /* @__PURE__ */ React.createElement(
    Input,
    {
      value: createForm.ewayBill,
      onChange: (e) => setCreateForm({ ...createForm, ewayBill: e.target.value }),
      placeholder: "e.g. 3412-8901-4521",
      className: "bg-slate-950 border-slate-800 text-slate-100 font-mono"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3.5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "font-semibold text-slate-400 block mb-1" }, "Client / Bill-To Party *"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: createForm.clientId,
      onChange: (e) => {
        const selId = e.target.value;
        const cl = clientMap[selId];
        const name = cl ? cl.company_name && cl.company_name !== "-" ? cl.company_name : cl.client_name || cl.name : "";
        setCreateForm({
          ...createForm,
          clientId: selId,
          clientName: name,
          consignorName: name || createForm.consignorName
        });
      },
      className: "w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-2.5 outline-none text-xs focus:border-amber-500 cursor-pointer"
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "-- Select Client from Master --"),
    clientList.map((c) => {
      const name = c.company_name && c.company_name.trim() !== "-" ? c.company_name : c.client_name || c.name || "Client";
      return /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, name, " ", clientRequiresPod(c) ? "\u2605 (POD Required)" : "");
    })
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "font-semibold text-slate-400 block mb-1" }, "Truck Number *"), /* @__PURE__ */ React.createElement(
    Input,
    {
      required: true,
      value: createForm.truckNumber,
      onChange: (e) => setCreateForm({ ...createForm, truckNumber: e.target.value }),
      placeholder: "e.g. TG12U2637",
      className: "bg-slate-950 border-slate-800 text-slate-100 font-mono"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3.5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "font-semibold text-slate-400 block mb-1" }, "Driver Name"), /* @__PURE__ */ React.createElement(
    Input,
    {
      value: createForm.driverName,
      onChange: (e) => setCreateForm({ ...createForm, driverName: e.target.value }),
      placeholder: "e.g. Suresh Edlai",
      className: "bg-slate-950 border-slate-800 text-slate-100"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "font-semibold text-slate-400 block mb-1" }, "Driver Phone"), /* @__PURE__ */ React.createElement(
    Input,
    {
      value: createForm.driverPhone,
      onChange: (e) => setCreateForm({ ...createForm, driverPhone: e.target.value }),
      placeholder: "e.g. +91 98480 12345",
      className: "bg-slate-950 border-slate-800 text-slate-100 font-mono"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3.5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "font-semibold text-slate-400 block mb-1" }, "Origin City / Depot *"), /* @__PURE__ */ React.createElement(
    Input,
    {
      required: true,
      value: createForm.origin,
      onChange: (e) => setCreateForm({ ...createForm, origin: e.target.value }),
      placeholder: "e.g. Hyderabad",
      className: "bg-slate-950 border-slate-800 text-slate-100"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "font-semibold text-slate-400 block mb-1" }, "Destination City / Terminal *"), /* @__PURE__ */ React.createElement(
    Input,
    {
      required: true,
      value: createForm.destination,
      onChange: (e) => setCreateForm({ ...createForm, destination: e.target.value }),
      placeholder: "e.g. Warangal",
      className: "bg-slate-950 border-slate-800 text-slate-100"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3.5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "font-semibold text-slate-400 block mb-1" }, "Consignor (Shipper Name)"), /* @__PURE__ */ React.createElement(
    Input,
    {
      value: createForm.consignorName,
      onChange: (e) => setCreateForm({ ...createForm, consignorName: e.target.value }),
      placeholder: "e.g. ITC Limited",
      className: "bg-slate-950 border-slate-800 text-slate-100"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "font-semibold text-slate-400 block mb-1" }, "Consignee (Receiver Name)"), /* @__PURE__ */ React.createElement(
    Input,
    {
      value: createForm.consigneeName,
      onChange: (e) => setCreateForm({ ...createForm, consigneeName: e.target.value }),
      placeholder: "e.g. Consignee Logistics Ltd",
      className: "bg-slate-950 border-slate-800 text-slate-100"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3.5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "font-semibold text-slate-400 block mb-1" }, "Total Freight (\u20B9) *"), /* @__PURE__ */ React.createElement(
    Input,
    {
      required: true,
      type: "number",
      value: createForm.freight,
      onChange: (e) => setCreateForm({ ...createForm, freight: e.target.value }),
      placeholder: "12500",
      className: "bg-slate-950 border-slate-800 text-emerald-400 font-mono font-bold"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "font-semibold text-slate-400 block mb-1" }, "Total Packages"), /* @__PURE__ */ React.createElement(
    Input,
    {
      value: createForm.packagesCount,
      onChange: (e) => setCreateForm({ ...createForm, packagesCount: e.target.value }),
      placeholder: "10",
      className: "bg-slate-950 border-slate-800 text-slate-100 font-mono"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "font-semibold text-slate-400 block mb-1" }, "Weight (Kg)"), /* @__PURE__ */ React.createElement(
    Input,
    {
      value: createForm.weightKg,
      onChange: (e) => setCreateForm({ ...createForm, weightKg: e.target.value }),
      placeholder: "4500",
      className: "bg-slate-950 border-slate-800 text-slate-100 font-mono"
    }
  ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "font-semibold text-slate-400 block mb-1" }, "Goods Description"), /* @__PURE__ */ React.createElement(
    Input,
    {
      value: createForm.goodsDescription,
      onChange: (e) => setCreateForm({ ...createForm, goodsDescription: e.target.value }),
      placeholder: "e.g. Industrial Materials, Tobacco, FMCG Products",
      className: "bg-slate-950 border-slate-800 text-slate-100"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "pt-3 border-t border-slate-800 flex items-center justify-end gap-2" }, /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "button",
      variant: "outline",
      onClick: () => setIsCreatingLr(false),
      className: "rounded-xl border-slate-700 text-slate-300"
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
    Button,
    {
      type: "submit",
      className: "rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold cursor-pointer"
    },
    "Create & Issue LR"
  ))))), editLrTrip && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-white text-base" }, "Edit Lorry Receipt (LR) #"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "Trip: ", /* @__PURE__ */ React.createElement("span", { className: "font-mono text-slate-200" }, editLrTrip.trip_id || editLrTrip.id), " \u2022 Truck: ", /* @__PURE__ */ React.createElement("span", { className: "font-mono text-slate-200" }, editLrTrip.truck_number)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs text-slate-400 block mb-1.5 font-medium" }, "New LR Number:"), /* @__PURE__ */ React.createElement(
    Input,
    {
      value: newLrNumber,
      onChange: (e) => setNewLrNumber(e.target.value),
      placeholder: "e.g. JBC/26-27/1234",
      className: "bg-slate-950 border-slate-700 font-mono text-amber-400 font-bold"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end gap-2 pt-2" }, /* @__PURE__ */ React.createElement(
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
