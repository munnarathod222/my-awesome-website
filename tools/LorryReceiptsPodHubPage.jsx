
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
  const [activeTab, setActiveTab] = useState("pod"); // Default to POD Hub as requested by user
  const [trips, setTrips] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [clientMap, setClientMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("pod_required"); // "pod_required", "all", or specific client_id
  
  // Modals
  const [viewingLr, setViewingLr] = useState(null);
  const [lrCopyType, setLrCopyType] = useState("Transporter Copy");
  const [isCreatingLr, setIsCreatingLr] = useState(false);
  const [viewingPodDoc, setViewingPodDoc] = useState(null);
  const [uploadingTripId, setUploadingTripId] = useState(null);
  const [editLrTrip, setEditLrTrip] = useState(null);
  const [newLrNumber, setNewLrNumber] = useState("");

  // Create LR Form state
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

  // Dynamic Company Settings with authentic default values
  const companySettings = useMemo(() => {
    try {
      const saved = localStorage.getItem("jc_company_settings");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
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

  // Helpers to resolve client information & POD requirement
  const clientRequiresPod = (cl) => {
    if (!cl) return false;
    return cl.requires_pod === true || cl.requires_pod === 1 || cl.requires_pod === 'true' || cl.requires_pod === '1';
  };

  const getClientForTrip = (trip) => {
    if (!trip) return null;
    if (trip.expand && trip.expand.client_id) return trip.expand.client_id;
    if (trip.client_id && clientMap[trip.client_id]) return clientMap[trip.client_id];
    if (trip.client_name) {
      const norm = trip.client_name.trim().toLowerCase();
      const found = clientList.find(c => 
        (c.client_name && c.client_name.trim().toLowerCase() === norm) ||
        (c.company_name && c.company_name.trim().toLowerCase() === norm) ||
        (c.name && c.name.trim().toLowerCase() === norm)
      );
      if (found) return found;
    }
    return null;
  };

  const getClientName = (trip) => {
    const cl = getClientForTrip(trip);
    if (cl) {
      if (cl.company_name && cl.company_name.trim() !== '-' && cl.company_name.trim() !== '') return cl.company_name.trim();
      if (cl.client_name && cl.client_name.trim() !== '-' && cl.client_name.trim() !== '') return cl.client_name.trim();
      if (cl.name && cl.name.trim() !== '-' && cl.name.trim() !== '') return cl.name.trim();
    }
    if (trip.client_name && trip.client_name.trim() !== '-' && trip.client_name.trim() !== '') return trip.client_name.trim();
    return "Direct Consignment";
  };

  const isTripPodRequired = (trip) => {
    const cl = getClientForTrip(trip);
    if (clientRequiresPod(cl)) return true;
    if (trip.requires_pod === true || trip.requires_pod === 1 || trip.requires_pod === 'true') return true;
    if (trip.pod_file || trip.pod_link || trip.pod_status === 'Verified' || trip.pod_status === 'Uploaded') return true;
    return false;
  };

  const getPodStatus = (trip) => {
    if (trip.pod_status === "Verified") return "Verified";
    if (trip.pod_file || trip.pod_link || trip.pod_status === "Uploaded") return "Uploaded";
    if (isTripPodRequired(trip)) return "Pending";
    return "Not Required";
  };

  const formatTripDate = (dateStr) => {
    if (!dateStr) return "Today";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return day + " " + months[d.getMonth()] + " " + d.getFullYear();
    } catch (e) {
      return dateStr;
    }
  };

  const formatRoute = (trip) => {
    if (trip.route && trip.route.trim()) {
      return trip.route.replace(/->/g, " ➔ ").replace(/➔/g, " ➔ ");
    }
    if (trip.origin || trip.destination) {
      return (trip.origin || "Origin") + " ➔ " + (trip.destination || "Destination");
    }
    return "Direct Highway Transit";
  };

  // Helper to get formatted LR Number
  const getLrNumber = (trip) => {
    if (trip.lr_number && trip.lr_number.trim()) return trip.lr_number.trim();
    if (trip.client_trip_id && trip.client_trip_id.trim()) return trip.client_trip_id.trim();
    const idSuffix = (trip.trip_id || trip.id || "").replace(/[^0-9]/g, "").slice(-4) || "1001";
    return (companySettings.lr_prefix || "JBC") + "/26-27/" + idSuffix;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const rawClients = await pb.collection("clients").getFullList({ $autoCancel: false }).catch(() => []);
      setClientList(rawClients);
      const cMap = {};
      rawClients.forEach(cl => {
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

  // Upload POD File
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

  // Toggle POD verification status
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

  // Save quick LR Number edit
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

  // Open Create LR modal with auto-numbering
  const handleOpenCreateLr = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
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

  // Auto-fill when existing trip is chosen in create modal
  const handleSelectTripForLr = (tripId) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const cl = getClientForTrip(trip);
    const clName = getClientName(trip);
    setCreateForm(prev => ({
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

  // Submit Create LR
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
          truck_number: createForm.truckNumber.trim() || undefined,
          driver_name: createForm.driverName.trim() || undefined,
          driver_phone: createForm.driverPhone.trim() || undefined,
          client_id: createForm.clientId || undefined
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
          date: new Date().toISOString().split("T")[0],
          revenue: parseFloat(createForm.freight) || 0,
          trip_status: "In-Transit",
          status: "In-Transit",
          eway_bill_number: createForm.ewayBill.trim(),
          client_id: createForm.clientId || undefined,
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

  // WhatsApp Share
  const handleShareWhatsApp = (trip) => {
    const lrNum = getLrNumber(trip);
    const truck = trip.truck_number || "Assigned Vehicle";
    const driver = trip.driver_name || "Assigned Driver";
    const route = formatRoute(trip);
    const client = getClientName(trip);

    const msg = encodeURIComponent(
      "*JAI BHAVANI CARGO MOVERS*\n" +
      "📄 *LORRY RECEIPT / CONSIGNMENT NOTE*\n\n" +
      "🔹 *LR Number:* #" + lrNum + "\n" +
      "🔹 *Client:* " + client + "\n" +
      "🔹 *Vehicle:* " + truck + "\n" +
      "🔹 *Driver:* " + driver + "\n" +
      "🔹 *Route:* " + route + "\n" +
      "🔹 *POD Status:* " + getPodStatus(trip) + "\n\n" +
      "Track & download verified documents at:\n" +
      "https://www.jaibhavanicargo.com/lorry-receipts\n\n" +
      "Control Room: +91 7794072244"
    );
    window.open("https://api.whatsapp.com/send?text=" + msg, "_blank");
  };

  // Clean A4 Iframe Print Engine
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
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  // Filtered lists with precise client POD requirement awareness
  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const cl = getClientForTrip(t);
      const clName = getClientName(t).toLowerCase();
      const isPodReq = isTripPodRequired(t);

      // 1. Text Search
      const lr = getLrNumber(t).toLowerCase();
      const trId = (t.trip_id || t.id || "").toLowerCase();
      const trk = (t.truck_number || "").toLowerCase();
      const rt = formatRoute(t).toLowerCase();
      const ew = (t.eway_bill_number || "").toLowerCase();
      const drv = (t.driver_name || "").toLowerCase();
      const q = search.toLowerCase();

      const matchesSearch = !q || lr.includes(q) || trId.includes(q) || trk.includes(q) || clName.includes(q) || rt.includes(q) || ew.includes(q) || drv.includes(q);
      if (!matchesSearch) return false;

      // 2. Client & POD Requirement Filter
      if (activeTab === "pod") {
        if (clientFilter === "pod_required") {
          // Strictly show trips of clients who require POD (or trips with POD files attached)
          if (!isPodReq) return false;
        } else if (clientFilter !== "all") {
          // Filtered by specific client
          if (t.client_id !== clientFilter && cl?.id !== clientFilter) return false;
        } else {
          // Even if "all" is chosen in POD Hub, POD Hub is for POD records
          if (!isPodReq) return false;
        }
      } else {
        // LR tab
        if (clientFilter === "pod_required") {
          if (!isPodReq) return false;
        } else if (clientFilter !== "all") {
          if (t.client_id !== clientFilter && cl?.id !== clientFilter) return false;
        }
      }

      // 3. Status Filter
      const podSt = getPodStatus(t);
      if (statusFilter === "pod_pending" && podSt !== "Pending") return false;
      if (statusFilter === "pod_uploaded" && podSt !== "Uploaded") return false;
      if (statusFilter === "pod_verified" && podSt !== "Verified") return false;
      if (statusFilter === "in_transit" && (t.status === "Completed" || t.trip_status === "Completed" || t.status === "Delivered" || t.trip_status === "Delivered")) return false;
      if (statusFilter === "completed" && !(t.status === "Completed" || t.trip_status === "Completed" || t.status === "Delivered" || t.trip_status === "Delivered")) return false;

      return true;
    });
  }, [trips, clientList, clientMap, search, statusFilter, clientFilter, activeTab]);

  // Clients that require POD count
  const podClientsCount = useMemo(() => {
    return clientList.filter(clientRequiresPod).length;
  }, [clientList]);

  // Pod-required trips subset
  const podTripsList = useMemo(() => {
    return trips.filter(isTripPodRequired);
  }, [trips, clientList, clientMap]);

  // Metrics
  const totalCount = activeTab === "pod" ? podTripsList.length : trips.length;
  const verifiedPodCount = (activeTab === "pod" ? podTripsList : trips).filter(t => getPodStatus(t) === "Verified").length;
  const uploadedPodCount = (activeTab === "pod" ? podTripsList : trips).filter(t => getPodStatus(t) === "Uploaded").length;
  const pendingPodCount = (activeTab === "pod" ? podTripsList : trips).filter(t => getPodStatus(t) === "Pending").length;
  const inTransitCount = trips.filter(t => t.status === "In-Transit" || t.trip_status === "In-Transit" || !t.status).length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Helmet>
        <title>Lorry Receipts & POD Hub | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              Fleet Operations & Documentation
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
              Live & Synced
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <FileTextIcon className="w-8 h-8 text-amber-400" />
            Lorry Receipts & POD Hub
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            {companySettings.company_name} • Proof of Delivery ledger (strictly filtered to POD-mandated clients) & official A4 Bilties.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={loadData}
            variant="outline"
            className="rounded-xl border-slate-700 hover:bg-slate-800 text-slate-200 cursor-pointer"
          >
            <RefreshIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleOpenCreateLr}
            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Issue New LR / Bilty
          </Button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-fit">
        <button
          onClick={() => {
            setActiveTab("pod");
            setClientFilter("pod_required");
          }}
          className={"flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer " + (
            activeTab === "pod"
              ? "bg-blue-600 text-white shadow-md font-extrabold"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          )}
        >
          <FileCheckIcon className="w-4 h-4" />
          <span>POD Management Hub</span>
          <span className={"px-2 py-0.5 rounded-full text-xs font-mono " + (activeTab === "pod" ? "bg-white text-blue-900 font-bold" : "bg-slate-800 text-slate-300")}>
            {podTripsList.length} Trips
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("lr");
            setClientFilter("all");
          }}
          className={"flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer " + (
            activeTab === "lr"
              ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          )}
        >
          <FileTextIcon className="w-4 h-4" />
          <span>Lorry Receipts (LR / Bilty)</span>
          <span className={"px-2 py-0.5 rounded-full text-xs font-mono " + (activeTab === "lr" ? "bg-slate-950 text-amber-400 font-bold" : "bg-slate-800 text-slate-300")}>
            {trips.length}
          </span>
        </button>
      </div>

      {/* Dynamic Metrics Row */}
      {activeTab === "pod" ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-wider">Required POD Trips</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1 font-mono">{podTripsList.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">Clients requiring POD ({podClientsCount} clients)</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <p className="text-amber-400 text-xs font-bold uppercase tracking-wider">POD Pending Review</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 font-mono">{pendingPodCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting receiver signed paper</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider">POD Uploaded</p>
            <p className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1 font-mono">{uploadedPodCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Uploaded & awaiting verify</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">POD Verified</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 font-mono">{verifiedPodCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Officially signed & cleared</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Consignments</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1 font-mono">{trips.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Complete fleet dispatch register</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <p className="text-amber-400 text-xs font-bold uppercase tracking-wider">In-Transit / Live</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 font-mono">{inTransitCount}</p>
            <p className="text-[11px] text-slate-500 mt-1">Dispatched on highway</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-wider">POD Required LRs</p>
            <p className="text-2xl sm:text-3xl font-black text-blue-400 mt-1 font-mono">{podTripsList.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Mandated by consignor/client</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">POD Verified</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 font-mono">{verifiedPodCount}</p>
            <p className="text-[11px] text-slate-500 mt-1">Delivery fully acknowledged</p>
          </div>
        </div>
      )}

      {/* Search and Filters Bar with Dedicated Client Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder={activeTab === "lr" ? "Search by LR #, Trip ID, Truck #, Client, Route..." : "Search POD by Trip ID, Truck #, Client, Route..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl h-11 text-xs"
          />
        </div>

        {/* Client Filter Selector */}
        <div className="w-full md:w-auto">
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 font-medium cursor-pointer h-11 w-full outline-none focus:border-amber-500"
          >
            <option value="pod_required">⚡ POD-Required Clients Only ({podClientsCount})</option>
            <option value="all">🏢 All Clients (Full Ledger)</option>
            <optgroup label="Filter by Specific Client">
              {clientList.map(c => {
                const name = (c.company_name && c.company_name.trim() !== '-') ? c.company_name : c.client_name || c.name || "Client";
                const isReq = clientRequiresPod(c);
                return (
                  <option key={c.id} value={c.id}>
                    {name} {isReq ? "★ (POD Required)" : ""}
                  </option>
                );
              })}
            </optgroup>
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 font-medium cursor-pointer h-11 w-full outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="pod_pending">⚠ POD Pending</option>
            <option value="pod_uploaded">⌛ POD Uploaded</option>
            <option value="pod_verified">✓ POD Verified</option>
            <option value="in_transit">In-Transit Only</option>
            <option value="completed">Completed / Delivered</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="border border-slate-800 bg-slate-900/60 rounded-3xl overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <RefreshIcon className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-3" />
              <p className="font-semibold text-sm">Loading records from server...</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <FileCheckIcon className="w-12 h-12 mx-auto text-slate-600 mb-2 opacity-50" />
              <p className="text-base font-bold text-slate-300">No matching consignments found</p>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === "pod"
                  ? "Showing trips for clients who require POD. Try changing the client or status filter above."
                  : "Try adjusting your search query or client filter."}
              </p>
              {activeTab === "pod" && clientFilter === "pod_required" && (
                <button
                  onClick={() => setClientFilter("all")}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition"
                >
                  View All Clients (Including Non-POD)
                </button>
              )}
            </div>
          ) : activeTab === "lr" ? (
            /* TAB 1: LORRY RECEIPTS (LR / BILTY) TABLE */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-800">
                    <th className="p-3.5 pl-5">LR / Bilty #</th>
                    <th className="p-3.5">Trip & Truck</th>
                    <th className="p-3.5">Client & Route</th>
                    <th className="p-3.5">Booking Date</th>
                    <th className="p-3.5">Freight</th>
                    <th className="p-3.5">POD Requirement</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredTrips.map((trip) => {
                    const lrNum = getLrNumber(trip);
                    const podSt = getPodStatus(trip);
                    const clObj = getClientForTrip(trip);
                    const clientName = getClientName(trip);
                    const isReq = clientRequiresPod(clObj) || isTripPodRequired(trip);
                    const route = formatRoute(trip);

                    return (
                      <tr key={trip.id} className="hover:bg-slate-800/40 transition">
                        {/* LR # */}
                        <td className="p-3.5 pl-5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                              {lrNum}
                            </span>
                            <button
                              onClick={() => {
                                setEditLrTrip(trip);
                                setNewLrNumber(lrNum);
                              }}
                              className="text-slate-500 hover:text-slate-300 text-[10px] underline cursor-pointer"
                              title="Edit LR Number"
                            >
                              Edit
                            </button>
                          </div>
                          {trip.eway_bill_number && (
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">E-Way: {trip.eway_bill_number}</p>
                          )}
                        </td>

                        {/* Trip & Vehicle */}
                        <td className="p-3.5">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <TruckIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono">{trip.truck_number || "TG12U2637"}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {trip.trip_id || trip.id?.slice(0, 10) || "TRIP"}
                          </p>
                          {trip.driver_name && (
                            <p className="text-[10px] text-slate-500">{trip.driver_name}</p>
                          )}
                        </td>

                        {/* Client & Route */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-semibold text-slate-100">{clientName}</p>
                            {isReq && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                POD Req
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{route}</p>
                        </td>

                        {/* Date */}
                        <td className="p-3.5 text-slate-300 font-mono">
                          {formatTripDate(trip.date)}
                        </td>

                        {/* Freight */}
                        <td className="p-3.5 font-mono font-bold text-emerald-400">
                          ₹{Number(trip.revenue || 0).toLocaleString("en-IN")}
                        </td>

                        {/* POD Status */}
                        <td className="p-3.5">
                          {podSt === "Not Required" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800/80 text-slate-400 border border-slate-700">
                              Not Required
                            </span>
                          ) : (
                            <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border " + (
                              podSt === "Verified"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : podSt === "Uploaded"
                                ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            )}>
                              {podSt === "Verified" ? "✓ Verified POD" : podSt === "Uploaded" ? "⌛ POD Uploaded" : "⚠ POD Pending"}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setViewingLr(trip);
                                setLrCopyType("Transporter Copy");
                              }}
                              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow cursor-pointer transition"
                              title="Print Official A4 Bilty"
                            >
                              <PrinterIcon className="w-3.5 h-3.5" />
                              <span>Print LR</span>
                            </button>

                            <button
                              onClick={() => handleShareWhatsApp(trip)}
                              className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 rounded-lg cursor-pointer transition"
                              title="Share on WhatsApp"
                            >
                              <ShareIcon className="w-3.5 h-3.5" />
                            </button>

                            {trip.pod_file ? (
                              <button
                                onClick={() => setViewingPodDoc({
                                  url: pb.files.getUrl(trip, trip.pod_file),
                                  tripId: trip.trip_id || trip.id,
                                  truck: trip.truck_number,
                                  client: clientName
                                })}
                                className="p-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-lg cursor-pointer transition"
                                title="View Signed POD"
                              >
                                <EyeIcon className="w-3.5 h-3.5" />
                              </button>
                            ) : isReq ? (
                              <label
                                htmlFor={"upload-lr-" + trip.id}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg cursor-pointer transition"
                                title="Upload POD File"
                              >
                                <UploadIcon className="w-3.5 h-3.5" />
                                <input
                                  type="file"
                                  id={"upload-lr-" + trip.id}
                                  className="hidden"
                                  accept="image/*,application/pdf"
                                  onChange={(e) => handleUploadPod(e, trip.id)}
                                />
                              </label>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* TAB 2: PROOF OF DELIVERY (POD) TABLE - STRICTLY FOR REQUIRED POD CLIENTS */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-800">
                    <th className="p-3.5 pl-5">Trip & LR Ref</th>
                    <th className="p-3.5">Client & Requirement</th>
                    <th className="p-3.5">Vehicle & Driver</th>
                    <th className="p-3.5">Delivery Route</th>
                    <th className="p-3.5">Trip Date</th>
                    <th className="p-3.5">POD Document</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredTrips.map((trip) => {
                    const lrNum = getLrNumber(trip);
                    const podSt = getPodStatus(trip);
                    const clObj = getClientForTrip(trip);
                    const clientName = getClientName(trip);
                    const hasFile = !!trip.pod_file;
                    const hasLink = !!trip.pod_link;
                    const isReq = clientRequiresPod(clObj) || isTripPodRequired(trip);

                    return (
                      <tr key={trip.id} className="hover:bg-slate-800/40 transition">
                        {/* Trip & LR */}
                        <td className="p-3.5 pl-5">
                          <p className="font-bold text-white font-mono">{trip.trip_id || trip.id?.slice(0, 10) || "TRIP"}</p>
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mt-1 inline-block">
                            {lrNum}
                          </span>
                        </td>

                        {/* Client */}
                        <td className="p-3.5">
                          <p className="font-semibold text-slate-100">{clientName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {isReq ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Mandated POD
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] text-slate-500 bg-slate-800 border border-slate-700">
                                Optional
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Vehicle & Driver */}
                        <td className="p-3.5">
                          <p className="font-mono font-bold text-slate-200">{trip.truck_number || "TG12U2637"}</p>
                          <p className="text-[11px] text-slate-400">{trip.driver_name || "Assigned Driver"}</p>
                        </td>

                        {/* Route */}
                        <td className="p-3.5 text-slate-300">
                          {formatRoute(trip)}
                        </td>

                        {/* Date */}
                        <td className="p-3.5 text-slate-300 font-mono">
                          {formatTripDate(trip.date)}
                        </td>

                        {/* POD Document Preview */}
                        <td className="p-3.5">
                          {hasFile ? (
                            <button
                              onClick={() => setViewingPodDoc({
                                url: pb.files.getUrl(trip, trip.pod_file),
                                tripId: trip.trip_id || trip.id,
                                truck: trip.truck_number,
                                client: clientName
                              })}
                              className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold cursor-pointer transition"
                            >
                              <EyeIcon className="w-3.5 h-3.5" />
                              <span>View Signed File</span>
                            </button>
                          ) : hasLink ? (
                            <a
                              href={trip.pod_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 underline text-xs font-mono"
                            >
                              External POD Link ↗
                            </a>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">No file uploaded</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border " + (
                            podSt === "Verified"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : podSt === "Uploaded"
                              ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                              : podSt === "Not Required"
                              ? "bg-slate-800 text-slate-400 border-slate-700"
                              : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          )}>
                            {podSt === "Verified" ? "✓ Verified" : podSt === "Uploaded" ? "⌛ Uploaded (Review)" : podSt === "Not Required" ? "Not Required" : "⚠ Pending POD"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Upload Button */}
                            <label
                              htmlFor={"pod-upload-" + trip.id}
                              className={"px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer " + (
                                uploadingTripId === trip.id
                                  ? "bg-slate-700 text-slate-400"
                                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                              )}
                              title="Upload Signed POD Photo"
                            >
                              <UploadIcon className="w-3.5 h-3.5" />
                              <span>{uploadingTripId === trip.id ? "Uploading..." : hasFile ? "Replace" : "Upload"}</span>
                              <input
                                type="file"
                                id={"pod-upload-" + trip.id}
                                className="hidden"
                                accept="image/*,application/pdf"
                                onChange={(e) => handleUploadPod(e, trip.id)}
                              />
                            </label>

                            {/* Verify Toggle */}
                            {(hasFile || hasLink) && (
                              <button
                                onClick={() => handleTogglePodVerify(trip)}
                                className={"px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer " + (
                                  podSt === "Verified"
                                    ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                                )}
                                title={podSt === "Verified" ? "Mark as Pending Review" : "Mark as Officially Verified"}
                              >
                                {podSt === "Verified" ? "✓ Verified" : "Verify POD"}
                              </button>
                            )}

                            {/* Quick Print LR from POD */}
                            <button
                              onClick={() => {
                                setViewingLr(trip);
                                setLrCopyType("Transporter Copy");
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer transition"
                              title="Print Linked LR / Bilty"
                            >
                              <PrinterIcon className="w-3.5 h-3.5" />
                            </button>
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

      {/* MODAL 1: OFFICIAL A4 PRINTABLE LORRY RECEIPT MODAL */}
      {viewingLr && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Action Bar */}
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs">
                  {getLrNumber(viewingLr)}
                </span>
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
                  {["Transporter Copy", "Consignor Copy", "Consignee Copy", "Driver Copy"].map(copy => (
                    <button
                      key={copy}
                      onClick={() => setLrCopyType(copy)}
                      className={"px-2 py-0.5 rounded font-semibold cursor-pointer transition " + (
                        lrCopyType === copy ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                      )}
                    >
                      {copy.replace(" Copy", "")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintLrIframe}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer transition"
                >
                  <PrinterIcon className="w-4 h-4" />
                  <span>Print A4 / PDF</span>
                </button>
                <button
                  onClick={() => handleShareWhatsApp(viewingLr)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition"
                >
                  <ShareIcon className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => setViewingLr(null)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable A4 Container */}
            <div className="p-4 sm:p-6 overflow-y-auto flex justify-center bg-slate-950/60">
              <div
                id="lr-printable-area"
                className="w-full max-w-[780px] bg-white text-slate-950 p-6 sm:p-8 rounded-lg shadow-xl font-sans text-xs border border-slate-300"
              >
                {/* Header with Company Settings */}
                <div className="border-b-2 border-slate-900 pb-3 mb-3 flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-950">
                      {companySettings.company_name}
                    </h1>
                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest mt-0.5">
                      {companySettings.tagline}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1 max-w-md leading-relaxed">
                      {companySettings.company_address}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-700 mt-1">
                      <span>Ph: {companySettings.company_phone}</span>
                      <span>•</span>
                      <span>Email: {companySettings.company_email}</span>
                      <span>•</span>
                      <span>{companySettings.company_website}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="bg-slate-950 text-white font-mono font-black px-3 py-1 rounded text-center text-xs tracking-wider uppercase">
                      LORRY RECEIPT
                    </div>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                      CONSIGNMENT NOTE
                    </p>
                    <p className="text-[11px] font-mono font-extrabold text-amber-800 mt-0.5">
                      {lrCopyType.toUpperCase()}
                    </p>
                    <p className="text-[10px] font-mono font-bold text-slate-800 mt-1">
                      GSTIN: {companySettings.company_gstin}
                    </p>
                    <p className="text-[9px] font-mono text-slate-600">
                      PAN: {companySettings.company_pan}
                    </p>
                  </div>
                </div>

                {/* Identification Strip */}
                <div className="grid grid-cols-4 gap-2 bg-slate-100 border border-slate-300 rounded p-2 mb-3 text-[10px]">
                  <div>
                    <span className="text-slate-500 font-bold block">LR NUMBER:</span>
                    <span className="font-mono font-black text-sm text-amber-800">{getLrNumber(viewingLr)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">BOOKING DATE:</span>
                    <span className="font-semibold text-slate-900">{formatTripDate(viewingLr.date)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">E-WAY BILL NO:</span>
                    <span className="font-mono font-bold text-slate-900">{viewingLr.eway_bill_number || "3412-8901-4521"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">TRIP ID:</span>
                    <span className="font-mono font-bold text-slate-900">{viewingLr.trip_id || viewingLr.id}</span>
                  </div>
                </div>

                {/* Consignor, Consignee & Vehicle Details */}
                <div className="grid grid-cols-3 gap-2 mb-3 text-[10px]">
                  {/* Vehicle & Driver */}
                  <div className="border border-slate-300 rounded p-2 bg-slate-50">
                    <p className="font-black uppercase text-slate-600 border-b border-slate-200 pb-1 mb-1">
                      VEHICLE & CREW
                    </p>
                    <p className="font-mono font-black text-xs text-slate-900">{viewingLr.truck_number || "TG12U2637"}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">Commercial Carrier Fleet</p>
                    <div className="mt-1.5 pt-1 border-t border-slate-200">
                      <span className="text-[9px] text-slate-500 block">DRIVER:</span>
                      <span className="font-bold text-slate-900">{viewingLr.driver_name || "Assigned Driver"}</span>
                      <span className="font-mono text-slate-600 block text-[9px]">{viewingLr.driver_phone || "+91 98480 12345"}</span>
                    </div>
                  </div>

                  {/* Consignor (From) */}
                  <div className="border border-slate-300 rounded p-2">
                    <p className="font-black uppercase text-slate-600 border-b border-slate-200 pb-1 mb-1">
                      CONSIGNOR (SENDER)
                    </p>
                    <p className="font-bold text-slate-900">{getClientName(viewingLr)}</p>
                    <p className="text-[9px] text-slate-600 mt-0.5 leading-tight">
                      Industrial Sector, {viewingLr.origin || "Origin Depot"}
                    </p>
                    <p className="text-[9px] font-mono text-slate-600 mt-1">
                      GSTIN: <b>36AAACG1234A1Z5</b>
                    </p>
                  </div>

                  {/* Consignee (To) */}
                  <div className="border border-slate-300 rounded p-2">
                    <p className="font-black uppercase text-slate-600 border-b border-slate-200 pb-1 mb-1">
                      CONSIGNEE (RECEIVER)
                    </p>
                    <p className="font-bold text-slate-900">{viewingLr.consignee_name || "Consignee Warehouse Ltd"}</p>
                    <p className="text-[9px] text-slate-600 mt-0.5 leading-tight">
                      Terminal Dock, {viewingLr.destination || "Destination Hub"}
                    </p>
                    <p className="text-[9px] font-mono text-slate-600 mt-1">
                      GSTIN: <b>36AABCS5678B1Z2</b>
                    </p>
                  </div>
                </div>

                {/* Route Strip */}
                <div className="bg-slate-100 border border-slate-300 rounded p-2 mb-3 flex items-center justify-between text-[10px]">
                  <div>
                    <span className="text-slate-500 font-bold block">ORIGIN & DISPATCH:</span>
                    <span className="font-bold text-slate-900">{viewingLr.origin || "Origin Depot"}</span>
                  </div>
                  <div className="text-center px-4">
                    <span className="text-amber-800 font-black text-sm">➔ ➔ ➔</span>
                    <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-bold">DIRECT HIGHWAY TRANSIT</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 font-bold block">DESTINATION & UNLOADING:</span>
                    <span className="font-bold text-slate-900">{viewingLr.destination || "Destination Dock"}</span>
                  </div>
                </div>

                {/* Goods Table */}
                <table className="w-full text-left text-[10px] mb-3">
                  <thead>
                    <tr>
                      <th className="w-10 text-center">#</th>
                      <th className="w-20 text-center">Packages</th>
                      <th>Description of Goods</th>
                      <th className="w-24 text-right">Actual Wt (Kg)</th>
                      <th className="w-24 text-right">Charged Wt (Kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-center">1</td>
                      <td className="text-center font-bold">10 Packages</td>
                      <td>
                        <span className="font-bold text-slate-900">{viewingLr.description || "General Commercial Freight & Machinery Parts"}</span>
                        <p className="text-[9px] text-slate-500">Secure containerized highway shipment</p>
                      </td>
                      <td className="text-right font-mono">4,500 Kg</td>
                      <td className="text-right font-mono font-bold">5,000 Kg</td>
                    </tr>
                  </tbody>
                </table>

                {/* Freight & Payment Terms */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="border border-slate-300 rounded p-2 text-[10px]">
                    <span className="font-bold uppercase text-slate-600 block mb-1">PAYMENT & BILLING TERMS:</span>
                    <div className="space-y-0.5">
                      <p className="text-slate-800">Payment Type: <b>BILLED TO CLIENT ACCOUNT (TBB)</b></p>
                      <p className="text-slate-800">GST Terms: <b>Reverse Charge Mechanism (RCM) Applicable</b></p>
                      <p className="text-slate-600 text-[9px] mt-1">Bank: {companySettings.bank_name} • A/C: {companySettings.account_number} • IFSC: {companySettings.ifsc_code}</p>
                    </div>
                  </div>

                  <div className="border border-slate-300 rounded p-2 bg-slate-50 text-[10px]">
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-600">Basic Freight:</span>
                      <span className="font-mono font-bold">₹{Number(viewingLr.revenue || 12000).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-t border-slate-200">
                      <span className="text-slate-600">Hamali / Handling:</span>
                      <span className="font-mono font-bold">₹0.00</span>
                    </div>
                    <div className="flex justify-between py-1 border-t-2 border-slate-800 text-xs font-black text-slate-950">
                      <span>Total Consignment Revenue:</span>
                      <span className="font-mono text-amber-800">₹{Number(viewingLr.revenue || 12000).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* Legal Carriage Declaration */}
                <div className="border border-slate-300 rounded p-2 mb-4 bg-slate-50 text-[8.5px] leading-relaxed text-slate-600">
                  <p className="font-bold text-slate-800 mb-0.5 uppercase">Carriage Terms & Declaration (Carriage by Road Act 2007):</p>
                  <p>
                    1. Consignment accepted subject to standard transport conditions. Goods carried at Owner's risk unless covered under transit insurance.
                    2. Transporter not liable for road delays due to strikes, weather, or highway inspections.
                    3. Demurrage charges applicable @ ₹500/day after 24 hours of vehicle arrival at delivery point.
                  </p>
                </div>

                {/* Signatures & Seal */}
                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-300 text-[10px] text-center">
                  <div className="pt-8 border-t border-slate-400">
                    <p className="font-bold text-slate-800">CONSIGNOR SIGNATURE</p>
                    <p className="text-[8px] text-slate-500">Shipper Acknowledgment</p>
                  </div>
                  <div className="pt-8 border-t border-slate-400">
                    <p className="font-bold text-slate-800">DRIVER SIGNATURE</p>
                    <p className="text-[8px] text-slate-500">Vehicle Custody Handover</p>
                  </div>
                  <div className="pt-8 border-t-2 border-slate-900 bg-amber-50/50 p-2 rounded">
                    <p className="font-black text-amber-900">FOR {companySettings.company_name.toUpperCase()}</p>
                    <p className="text-[8px] font-bold text-slate-600 mt-1">AUTHORISED CARRIER SIGNATORY</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW SIGNED POD PREVIEW */}
      {viewingPodDoc && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <FileCheckIcon className="w-4 h-4 text-emerald-400" />
                  <span>Proof of Delivery Document</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Trip: {viewingPodDoc.tripId} • Truck: {viewingPodDoc.truck} • Client: {viewingPodDoc.client}
                </p>
              </div>
              <button
                onClick={() => setViewingPodDoc(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center bg-slate-950/80 min-h-[300px]">
              {viewingPodDoc.url.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={viewingPodDoc.url}
                  className="w-full h-[550px] rounded-xl border border-slate-800"
                  title="POD PDF Document"
                />
              ) : (
                <img
                  src={viewingPodDoc.url}
                  alt="Signed POD"
                  className="max-h-[550px] w-auto max-w-full rounded-xl shadow-lg border border-slate-800 object-contain"
                />
              )}
            </div>

            <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
              <a
                href={viewingPodDoc.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <DownloadIcon className="w-3.5 h-3.5" />
                <span>Download File</span>
              </a>
              <Button
                variant="outline"
                onClick={() => setViewingPodDoc(null)}
                className="rounded-xl border-slate-700 text-slate-300"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE / ISSUE NEW LR MODAL */}
      {isCreatingLr && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <FileTextIcon className="w-5 h-5 text-amber-400" />
                  <span>Issue New Lorry Receipt / Consignment Note</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generate official transporter consignment note (LR / Bilty) with automated tracking
                </p>
              </div>
              <button
                onClick={() => setIsCreatingLr(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreateLr} className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Trip selector option */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <label className="font-bold text-slate-300 block">
                  Link to Existing Trip Log (Optional - auto-fills details):
                </label>
                <select
                  value={createForm.selectedTripId}
                  onChange={(e) => handleSelectTripForLr(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl p-2.5 outline-none font-mono text-xs focus:border-amber-500 cursor-pointer"
                >
                  <option value="">-- Choose active trip from fleet register (or create standalone) --</option>
                  {trips.slice(0, 30).map(t => (
                    <option key={t.id} value={t.id}>
                      {t.trip_id || t.id.slice(0, 8)} • {t.truck_number || "Truck"} • {getClientName(t)} • {formatRoute(t)} ({formatTripDate(t.date)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">LR Number *</label>
                  <Input
                    required
                    value={createForm.lrNumber}
                    onChange={(e) => setCreateForm({...createForm, lrNumber: e.target.value})}
                    placeholder="e.g. JBC/26-27/1001"
                    className="bg-slate-950 border-slate-800 text-amber-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">E-Way Bill Number</label>
                  <Input
                    value={createForm.ewayBill}
                    onChange={(e) => setCreateForm({...createForm, ewayBill: e.target.value})}
                    placeholder="e.g. 3412-8901-4521"
                    className="bg-slate-950 border-slate-800 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Client / Bill-To Party *</label>
                  <select
                    value={createForm.clientId}
                    onChange={(e) => {
                      const selId = e.target.value;
                      const cl = clientMap[selId];
                      const name = cl ? ((cl.company_name && cl.company_name !== '-') ? cl.company_name : cl.client_name || cl.name) : "";
                      setCreateForm({
                        ...createForm,
                        clientId: selId,
                        clientName: name,
                        consignorName: name || createForm.consignorName
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-2.5 outline-none text-xs focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">-- Select Client from Master --</option>
                    {clientList.map(c => {
                      const name = (c.company_name && c.company_name.trim() !== '-') ? c.company_name : c.client_name || c.name || "Client";
                      return (
                        <option key={c.id} value={c.id}>
                          {name} {clientRequiresPod(c) ? "★ (POD Required)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Truck Number *</label>
                  <Input
                    required
                    value={createForm.truckNumber}
                    onChange={(e) => setCreateForm({...createForm, truckNumber: e.target.value})}
                    placeholder="e.g. TG12U2637"
                    className="bg-slate-950 border-slate-800 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Driver Name</label>
                  <Input
                    value={createForm.driverName}
                    onChange={(e) => setCreateForm({...createForm, driverName: e.target.value})}
                    placeholder="e.g. Suresh Edlai"
                    className="bg-slate-950 border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Driver Phone</label>
                  <Input
                    value={createForm.driverPhone}
                    onChange={(e) => setCreateForm({...createForm, driverPhone: e.target.value})}
                    placeholder="e.g. +91 98480 12345"
                    className="bg-slate-950 border-slate-800 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Origin City / Depot *</label>
                  <Input
                    required
                    value={createForm.origin}
                    onChange={(e) => setCreateForm({...createForm, origin: e.target.value})}
                    placeholder="e.g. Hyderabad"
                    className="bg-slate-950 border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Destination City / Terminal *</label>
                  <Input
                    required
                    value={createForm.destination}
                    onChange={(e) => setCreateForm({...createForm, destination: e.target.value})}
                    placeholder="e.g. Warangal"
                    className="bg-slate-950 border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Consignor (Shipper Name)</label>
                  <Input
                    value={createForm.consignorName}
                    onChange={(e) => setCreateForm({...createForm, consignorName: e.target.value})}
                    placeholder="e.g. ITC Limited"
                    className="bg-slate-950 border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Consignee (Receiver Name)</label>
                  <Input
                    value={createForm.consigneeName}
                    onChange={(e) => setCreateForm({...createForm, consigneeName: e.target.value})}
                    placeholder="e.g. Consignee Logistics Ltd"
                    className="bg-slate-950 border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Total Freight (₹) *</label>
                  <Input
                    required
                    type="number"
                    value={createForm.freight}
                    onChange={(e) => setCreateForm({...createForm, freight: e.target.value})}
                    placeholder="12500"
                    className="bg-slate-950 border-slate-800 text-emerald-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Total Packages</label>
                  <Input
                    value={createForm.packagesCount}
                    onChange={(e) => setCreateForm({...createForm, packagesCount: e.target.value})}
                    placeholder="10"
                    className="bg-slate-950 border-slate-800 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Weight (Kg)</label>
                  <Input
                    value={createForm.weightKg}
                    onChange={(e) => setCreateForm({...createForm, weightKg: e.target.value})}
                    placeholder="4500"
                    className="bg-slate-950 border-slate-800 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-400 block mb-1">Goods Description</label>
                <Input
                  value={createForm.goodsDescription}
                  onChange={(e) => setCreateForm({...createForm, goodsDescription: e.target.value})}
                  placeholder="e.g. Industrial Materials, Tobacco, FMCG Products"
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreatingLr(false)}
                  className="rounded-xl border-slate-700 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold cursor-pointer"
                >
                  Create &amp; Issue LR
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: QUICK EDIT LR NUMBER MODAL */}
      {editLrTrip && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Edit Lorry Receipt (LR) #</h3>
            <p className="text-xs text-slate-400">
              Trip: <span className="font-mono text-slate-200">{editLrTrip.trip_id || editLrTrip.id}</span> • Truck: <span className="font-mono text-slate-200">{editLrTrip.truck_number}</span>
            </p>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">New LR Number:</label>
              <Input
                value={newLrNumber}
                onChange={(e) => setNewLrNumber(e.target.value)}
                placeholder="e.g. JBC/26-27/1234"
                className="bg-slate-950 border-slate-700 font-mono text-amber-400 font-bold"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setEditLrTrip(null)}
                className="rounded-xl border-slate-700 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveLrNumber}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold cursor-pointer"
              >
                Save LR Number
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { LorryReceiptsPodHubPage as default };
