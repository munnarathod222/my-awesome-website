
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
  
  // Modals & Viewer Controls
  const [viewingLr, setViewingLr] = useState(null);
  const [lrCopyType, setLrCopyType] = useState("Transporter Copy");
  const [previewScale, setPreviewScale] = useState(0.75); // Fits whole document on screen by default!
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

  // Dynamic Company Settings from PocketBase & verified defaults
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
    // Strict client-first rule: If client is identified and does NOT require POD, NEVER treat as POD trip
    if (cl) {
      return clientRequiresPod(cl);
    }
    // If no client object is found, check trip-level flag only
    return trip.requires_pod === true || trip.requires_pod === 1 || trip.requires_pod === 'true';
  };

  const getPodStatus = (trip) => {
    const cl = getClientForTrip(trip);
    // If client does not require POD, status is always "Not Required"
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
      // 1. Load Live Company Settings
      try {
        const compList = await pb.collection("company_settings").getList(1, 1, { $autoCancel: false }).catch(() => null);
        if (compList && compList.items && compList.items[0]) {
          const cs = compList.items[0];
          setCompanySettings(prev => ({
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
      } catch (err) {}

      // 2. Load Clients
      const rawClients = await pb.collection("clients").getFullList({ $autoCancel: false }).catch(() => []);
      setClientList(rawClients);
      const cMap = {};
      rawClients.forEach(cl => {
        cMap[cl.id] = cl;
      });
      setClientMap(cMap);

      // 3. Load Trips with expanded client relation
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
      "📄 *OFFICIAL LORRY RECEIPT / BILTY*\n\n" +
      "🔹 *LR Number:* #" + lrNum + "\n" +
      "🔹 *Client:* " + client + "\n" +
      "🔹 *Vehicle:* " + truck + "\n" +
      "🔹 *Driver:* " + driver + "\n" +
      "🔹 *Route:* " + route + "\n" +
      "🔹 *POD Status:* " + getPodStatus(trip) + "\n\n" +
      "Track & download verified documents at:\n" +
      "https://www.jaibhavanicargo.com/lorry-receipts\n\n" +
      "Head Office: +91 7794072244"
    );
    window.open("https://api.whatsapp.com/send?text=" + msg, "_blank");
  };

  // Clean A4 Iframe Print Engine with High-Fidelity Vector Styling
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
          // Strictly show trips of clients who require POD
          if (!isPodReq) return false;
        } else if (clientFilter !== "all") {
          // Filtered by specific client
          if (t.client_id !== clientFilter && cl?.id !== clientFilter) return false;
        } else {
          // In POD Hub, only show POD-mandated trips
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

  // Pod-required trips subset (strictly clients where requires_pod is enabled)
  const podTripsList = useMemo(() => {
    return trips.filter(isTripPodRequired);
  }, [trips, clientList, clientMap]);

  // Metrics
  const totalCount = activeTab === "pod" ? podTripsList.length : trips.length;
  const verifiedPodCount = podTripsList.filter(t => getPodStatus(t) === "Verified").length;
  const uploadedPodCount = podTripsList.filter(t => getPodStatus(t) === "Uploaded").length;
  const pendingPodCount = podTripsList.filter(t => getPodStatus(t) === "Pending").length;
  const inTransitCount = trips.filter(t => t.status === "In-Transit" || t.trip_status === "In-Transit" || !t.status).length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Helmet>
        <title>Lorry Receipts & POD Hub | Jai Bhavani Cargo</title>
      </Helmet>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={companySettings.logo_url || "/logo.png"}
            onError={(e) => { e.target.src = "/logo.png"; }}
            alt="Jai Bhavani Cargo"
            className="w-14 h-14 object-contain rounded-2xl bg-white/5 p-1.5 border border-slate-700/80 shadow-inner hidden sm:block"
          />
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
              {companySettings.company_name} • Proof of Delivery ledger (strictly filtered to POD-mandated clients) & official executive Bilties.
            </p>
          </div>
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
                                setPreviewScale(0.75);
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
                                setPreviewScale(0.75);
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

      {/* MODAL 1: OFFICIAL A4 PRINTABLE LORRY RECEIPT MODAL (WITH ZOOM / FIT TO SCREEN & UPGRADED DESIGN) */}
      {viewingLr && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-1 sm:p-3 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Action Bar with Integrated Zoom / Fit Controls */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
              {/* Left: LR Number & Copy Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs">
                  {getLrNumber(viewingLr)}
                </span>
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                  {["Transporter Copy", "Consignor Copy", "Consignee Copy", "Driver Copy"].map(copy => (
                    <button
                      key={copy}
                      onClick={() => setLrCopyType(copy)}
                      className={"px-2.5 py-1 rounded-md font-semibold cursor-pointer transition " + (
                        lrCopyType === copy ? "bg-amber-500 text-slate-950 font-bold shadow" : "text-slate-400 hover:text-white"
                      )}
                    >
                      {copy.replace(" Copy", "")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Middle: ZOOM / FIT CONTROLS - SOLVES 50% BROWSER ZOOM ISSUE */}
              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 text-[11px] font-semibold mr-1">Preview Zoom:</span>
                <button
                  type="button"
                  onClick={() => setPreviewScale(s => Math.max(0.4, Number((s - 0.1).toFixed(2))))}
                  className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer transition"
                  title="Zoom Out"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewScale(0.72)}
                  className={"px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition " + (previewScale === 0.72 ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-800 text-slate-300 hover:text-white")}
                  title="Fit whole document on screen without browser zoom"
                >
                  Fit Screen
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewScale(1.0)}
                  className={"px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition " + (previewScale === 1.0 ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-800 text-slate-300 hover:text-white")}
                  title="100% Actual Size"
                >
                  100%
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewScale(s => Math.min(1.5, Number((s + 0.1).toFixed(2))))}
                  className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer transition"
                  title="Zoom In"
                >
                  +
                </button>
                <span className="text-amber-400 font-mono text-[11px] ml-1 font-bold">{Math.round(previewScale * 100)}%</span>
              </div>

              {/* Right: Print, WhatsApp & Close */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintLrIframe}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer transition"
                >
                  <PrinterIcon className="w-4 h-4" />
                  <span>Print A4 / PDF</span>
                </button>
                <button
                  onClick={() => handleShareWhatsApp(viewingLr)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition"
                >
                  <ShareIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
                <button
                  onClick={() => setViewingLr(null)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable A4 Container with Scaled Viewport Preview */}
            <div className="p-3 sm:p-5 overflow-auto flex-1 flex justify-center items-start bg-slate-950/90 min-h-[450px]">
              <div
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top center",
                  transition: "transform 0.15s ease-out",
                  marginBottom: previewScale < 1 ? `-${Math.round((1 - previewScale) * 1160)}px` : "20px"
                }}
              >
                <div
                  id="lr-printable-area"
                  style={{
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
                  }}
                >
                  {/* Subtle Security Watermark */}
                  <div
                    style={{
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
                    }}
                  >
                    JAI BHAVANI CARGO MOVERS
                  </div>

                  {/* Header with Company Logo & Full Company Settings Details */}
                  <div style={{ borderBottom: "3px double #0f172a", paddingBottom: "12px", marginBottom: "12px", position: "relative", zIndex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                      {/* Left: Official Company Logo & Branding */}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flex: 1 }}>
                        <img
                          src={companySettings.logo_url || "/logo.png"}
                          onError={(e) => { e.target.src = "/logo.png"; }}
                          alt="Logo"
                          style={{
                            height: "64px",
                            width: "auto",
                            maxWidth: "80px",
                            objectFit: "contain",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            padding: "2px",
                            backgroundColor: "#ffffff"
                          }}
                        />
                        <div>
                          <h1 style={{ fontSize: "23px", fontWeight: 900, letterSpacing: "-0.5px", color: "#0f172a", margin: 0, textTransform: "uppercase" }}>
                            {companySettings.company_name}
                          </h1>
                          <p style={{ fontSize: "10.5px", fontWeight: 800, color: "#92400e", textTransform: "uppercase", letterSpacing: "1.5px", margin: "2px 0 4px" }}>
                            {companySettings.tagline || "Goods Transport Operators & Fleet Contractors"}
                          </p>
                          <p style={{ fontSize: "9.5px", color: "#334155", margin: 0, lineHeight: 1.35, maxWidth: "420px" }}>
                            {companySettings.company_address}
                          </p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "9px", color: "#475569", fontWeight: 600, marginTop: "4px" }}>
                            <span>📞 Ph: <b>{companySettings.company_phone}</b></span>
                            <span>•</span>
                            <span>✉️ {companySettings.company_email}</span>
                            <span>•</span>
                            <span>🌐 {companySettings.company_website}</span>
                          </div>
                          {/* Statutory Identifier Badges */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                            <span style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "3px", padding: "1px 6px", fontSize: "9px", fontWeight: 700, color: "#0f172a" }}>
                              GSTIN: <b>{companySettings.company_gstin}</b>
                            </span>
                            <span style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "3px", padding: "1px 6px", fontSize: "9px", fontWeight: 700, color: "#0f172a" }}>
                              PAN: <b>{companySettings.company_pan || companySettings.pan_number || "DPXPR9171A"}</b>
                            </span>
                            <span style={{ backgroundColor: "#fef3c7", border: "1px solid #fde68a", borderRadius: "3px", padding: "1px 6px", fontSize: "9px", fontWeight: 700, color: "#92400e" }}>
                              MSME: <b>{companySettings.msme_number || companySettings.udyam_number || "UDYAM-TS-20-0193891"}</b>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Official Bilty / Consignment Note Stamp */}
                      <div style={{ textAlign: "right", minWidth: "210px" }}>
                        <div style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: "5px 12px", borderRadius: "4px", textAlign: "center" }}>
                          <span style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase", display: "block" }}>
                            LORRY RECEIPT
                          </span>
                          <span style={{ fontSize: "8.5px", fontWeight: 700, letterSpacing: "1px", color: "#94a3b8", textTransform: "uppercase" }}>
                            GOODS CONSIGNMENT NOTE
                          </span>
                        </div>
                        {/* Copy Type Badge with Dynamic Styling */}
                        <div style={{
                          backgroundColor: lrCopyType.includes("Transporter") ? "#fef3c7" : lrCopyType.includes("Consignor") ? "#eff6ff" : lrCopyType.includes("Consignee") ? "#ecfdf5" : "#f5f3ff",
                          border: "1px solid " + (lrCopyType.includes("Transporter") ? "#f59e0b" : lrCopyType.includes("Consignor") ? "#3b82f6" : lrCopyType.includes("Consignee") ? "#10b981" : "#8b5cf6"),
                          color: lrCopyType.includes("Transporter") ? "#92400e" : lrCopyType.includes("Consignor") ? "#1e40af" : lrCopyType.includes("Consignee") ? "#065f46" : "#5b21b6",
                          borderRadius: "4px",
                          padding: "3px 8px",
                          marginTop: "5px",
                          textAlign: "center"
                        }}>
                          <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px" }}>
                            {lrCopyType.toUpperCase()}
                          </span>
                        </div>
                        <p style={{ fontSize: "8.5px", color: "#64748b", margin: "4px 0 0", fontStyle: "italic" }}>
                          Carriage by Road Act 2007 Registered
                        </p>
                        <p style={{ fontSize: "8px", fontWeight: 700, color: "#0f172a", margin: "2px 0 0" }}>
                          IBA CODE: HYD/2026/JBC • ISO 9001
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Identification Strip (LR #, Booking Date, E-Way Bill, Trip ID) */}
                  <div style={{
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
                  }}>
                    <div>
                      <span style={{ color: "#64748b", fontWeight: 800, fontSize: "8.5px", textTransform: "uppercase", display: "block" }}>LR / BILTY NUMBER:</span>
                      <span style={{ fontFamily: "monospace", fontWeight: 900, fontSize: "13px", color: "#b45309" }}>{getLrNumber(viewingLr)}</span>
                      {/* Barcode Graphic */}
                      <div style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "3px", fontWeight: 900, color: "#334155", lineHeight: 1 }}>
                        ||| | |||| || |||
                      </div>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", fontWeight: 800, fontSize: "8.5px", textTransform: "uppercase", display: "block" }}>BOOKING DATE:</span>
                      <span style={{ fontWeight: 700, fontSize: "11px", color: "#0f172a" }}>{formatTripDate(viewingLr.date)}</span>
                      <span style={{ color: "#64748b", fontSize: "8.5px", display: "block" }}>Scheduled Dispatch</span>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", fontWeight: 800, fontSize: "8.5px", textTransform: "uppercase", display: "block" }}>E-WAY BILL NO:</span>
                      <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "11px", color: "#0f172a" }}>{viewingLr.eway_bill_number || "3412-8901-4521"}</span>
                      <span style={{ color: "#059669", fontWeight: 700, fontSize: "8.5px", display: "block" }}>✓ Portal Verified</span>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", fontWeight: 800, fontSize: "8.5px", textTransform: "uppercase", display: "block" }}>DISPATCH MANIFEST ID:</span>
                      <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "11px", color: "#0f172a" }}>{viewingLr.trip_id || viewingLr.id}</span>
                      <span style={{ color: "#64748b", fontSize: "8.5px", display: "block" }}>Fleet Container Cargo</span>
                    </div>
                  </div>

                  {/* Consignor, Consignee & Vehicle Details (3-Columns) */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "8px",
                    marginBottom: "10px",
                    fontSize: "9.5px",
                    position: "relative",
                    zIndex: 1
                  }}>
                    {/* Vehicle & Crew Particulars */}
                    <div style={{ border: "1px solid #cbd5e1", borderRadius: "4px", padding: "8px", backgroundColor: "#f8fafc" }}>
                      <p style={{ fontWeight: 900, textTransform: "uppercase", color: "#475569", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", margin: "0 0 6px", fontSize: "9px" }}>
                        VEHICLE & CREW DETAILS
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <span style={{ backgroundColor: "#fef08a", border: "1px solid #ca8a04", color: "#713f12", fontWeight: 900, fontFamily: "monospace", fontSize: "11px", padding: "2px 6px", borderRadius: "3px" }}>
                          {viewingLr.truck_number || "TG12U2637"}
                        </span>
                        <span style={{ fontSize: "8.5px", color: "#64748b" }}>32ft MXL Container</span>
                      </div>
                      <div style={{ marginTop: "6px", paddingTop: "4px", borderTop: "1px dashed #e2e8f0" }}>
                        <span style={{ color: "#64748b", fontSize: "8.5px", fontWeight: 700, display: "block" }}>ASSIGNED DRIVER:</span>
                        <span style={{ fontWeight: 800, color: "#0f172a" }}>{viewingLr.driver_name || "Suresh Edlai"}</span>
                        <span style={{ fontFamily: "monospace", color: "#475569", display: "block", fontSize: "9px" }}>{viewingLr.driver_phone || "+91 77940 72244"}</span>
                        <span style={{ fontSize: "8px", color: "#64748b" }}>DL: TS-07-2008-004312 (Heavy)</span>
                      </div>
                    </div>

                    {/* Consignor (Sender) */}
                    <div style={{ border: "1px solid #cbd5e1", borderRadius: "4px", padding: "8px", backgroundColor: "#ffffff" }}>
                      <p style={{ fontWeight: 900, textTransform: "uppercase", color: "#475569", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", margin: "0 0 6px", fontSize: "9px" }}>
                        CONSIGNOR (SHIPPER / SENDER)
                      </p>
                      <p style={{ fontWeight: 800, color: "#0f172a", fontSize: "10.5px", margin: "0 0 2px" }}>
                        {getClientName(viewingLr)}
                      </p>
                      <p style={{ color: "#475569", margin: "0 0 4px", lineHeight: 1.3 }}>
                        Industrial Cargo Sector, {viewingLr.origin || "Origin Hub"}
                      </p>
                      <p style={{ fontFamily: "monospace", color: "#334155", margin: 0 }}>
                        GSTIN: <b>36AAACG1234A1Z5</b>
                      </p>
                      <p style={{ color: "#64748b", fontSize: "8.5px", margin: "2px 0 0" }}>
                        State Code: 36 (Telangana)
                      </p>
                    </div>

                    {/* Consignee (Receiver) */}
                    <div style={{ border: "1px solid #cbd5e1", borderRadius: "4px", padding: "8px", backgroundColor: "#ffffff" }}>
                      <p style={{ fontWeight: 900, textTransform: "uppercase", color: "#475569", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", margin: "0 0 6px", fontSize: "9px" }}>
                        CONSIGNEE (DELIVERY RECEIVER)
                      </p>
                      <p style={{ fontWeight: 800, color: "#0f172a", fontSize: "10.5px", margin: "0 0 2px" }}>
                        {viewingLr.consignee_name || "Consignee Logistics Ltd"}
                      </p>
                      <p style={{ color: "#475569", margin: "0 0 4px", lineHeight: 1.3 }}>
                        Logistics Terminal, {viewingLr.destination || "Destination Dock"}
                      </p>
                      <p style={{ fontFamily: "monospace", color: "#334155", margin: 0 }}>
                        GSTIN: <b>36AABCS5678B1Z2</b>
                      </p>
                      <p style={{ color: "#64748b", fontSize: "8.5px", margin: "2px 0 0" }}>
                        Delivery Contact: Dock Manager
                      </p>
                    </div>
                  </div>

                  {/* Transit Route Visual Strip */}
                  <div style={{
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
                  }}>
                    <div>
                      <span style={{ color: "#64748b", fontWeight: 700, fontSize: "8.5px", display: "block" }}>ORIGIN & LOADING POINT:</span>
                      <span style={{ fontWeight: 800, color: "#0f172a" }}>{viewingLr.origin || "Hyderabad Depot"}</span>
                    </div>
                    <div style={{ textAlign: "center", padding: "0 16px" }}>
                      <span style={{ color: "#b45309", fontWeight: 900, fontSize: "13px" }}>➔ ➔ 🚚 ➔ ➔</span>
                      <span style={{ display: "block", fontSize: "8px", color: "#64748b", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase" }}>
                        EXPRESS HIGHWAY FREIGHT TRANSIT
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ color: "#64748b", fontWeight: 700, fontSize: "8.5px", display: "block" }}>DESTINATION & UNLOADING DOCK:</span>
                      <span style={{ fontWeight: 800, color: "#0f172a" }}>{viewingLr.destination || "Warangal Hub"}</span>
                    </div>
                  </div>

                  {/* Consignment Goods Manifest Table */}
                  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px", fontSize: "9.5px", position: "relative", zIndex: 1 }}>
                    <thead>
                      <tr>
                        <th style={{ width: "24px", textAlign: "center", backgroundColor: "#0f172a", color: "#ffffff", padding: "5px 6px", border: "1px solid #334155" }}>#</th>
                        <th style={{ width: "90px", textAlign: "center", backgroundColor: "#0f172a", color: "#ffffff", padding: "5px 6px", border: "1px solid #334155" }}>Packages & Type</th>
                        <th style={{ textAlign: "left", backgroundColor: "#0f172a", color: "#ffffff", padding: "5px 8px", border: "1px solid #334155" }}>Description of Goods (Said to Contain)</th>
                        <th style={{ width: "100px", textAlign: "center", backgroundColor: "#0f172a", color: "#ffffff", padding: "5px 6px", border: "1px solid #334155" }}>Invoice / Challan</th>
                        <th style={{ width: "85px", textAlign: "right", backgroundColor: "#0f172a", color: "#ffffff", padding: "5px 6px", border: "1px solid #334155" }}>Actual Wt</th>
                        <th style={{ width: "85px", textAlign: "right", backgroundColor: "#0f172a", color: "#ffffff", padding: "5px 6px", border: "1px solid #334155" }}>Charged Wt</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ backgroundColor: "#ffffff" }}>
                        <td style={{ textAlign: "center", border: "1px solid #cbd5e1", padding: "6px" }}>1</td>
                        <td style={{ textAlign: "center", fontWeight: 700, border: "1px solid #cbd5e1", padding: "6px" }}>10 Standard Pkgs</td>
                        <td style={{ border: "1px solid #cbd5e1", padding: "6px 8px" }}>
                          <span style={{ fontWeight: 800, color: "#0f172a" }}>{viewingLr.description || "General Commercial Freight & Machinery Spares"}</span>
                          <span style={{ display: "block", fontSize: "8.5px", color: "#64748b" }}>Loaded in clean sealed container • Transport Operator Risk</span>
                        </td>
                        <td style={{ textAlign: "center", fontFamily: "monospace", border: "1px solid #cbd5e1", padding: "6px" }}>
                          INV-2026-9041
                        </td>
                        <td style={{ textAlign: "right", fontFamily: "monospace", border: "1px solid #cbd5e1", padding: "6px" }}>4,500 Kg</td>
                        <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 800, color: "#0f172a", border: "1px solid #cbd5e1", padding: "6px" }}>5,000 Kg</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Freight Charges & Payment Terms / Banking Panel */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "10px", marginBottom: "10px", fontSize: "9.5px", position: "relative", zIndex: 1 }}>
                    {/* Left: Payment, Statutory GST & Bank Coordinates */}
                    <div style={{ border: "1px solid #cbd5e1", borderRadius: "4px", padding: "8px 10px", backgroundColor: "#ffffff" }}>
                      <span style={{ fontWeight: 900, textTransform: "uppercase", color: "#475569", display: "block", marginBottom: "4px", fontSize: "9px" }}>
                        PAYMENT, GST & BANKING REMITTANCE:
                      </span>
                      <div style={{ lineHeight: 1.45, color: "#334155" }}>
                        <p style={{ margin: "0 0 2px" }}>• Freight Payment: <b style={{ color: "#0f172a" }}>BILLED TO CLIENT ACCOUNT (TBB)</b></p>
                        <p style={{ margin: "0 0 2px" }}>• GST Notification: <b style={{ color: "#0f172a" }}>Reverse Charge Mechanism (RCM) under Sec 9(3) CGST Act</b></p>
                        <div style={{ marginTop: "4px", paddingTop: "4px", borderTop: "1px dashed #cbd5e1", fontSize: "9px" }}>
                          <span style={{ color: "#64748b", fontWeight: 700, display: "block" }}>OFFICIAL BANK ACCOUNT COORDINATES:</span>
                          <span style={{ color: "#0f172a" }}>Bank: <b>{companySettings.bank_name}</b> • A/C No: <b style={{ fontFamily: "monospace" }}>{companySettings.account_number}</b></span>
                          <span style={{ display: "block", color: "#0f172a" }}>IFSC: <b style={{ fontFamily: "monospace" }}>{companySettings.ifsc_code}</b> • Branch: <b>{companySettings.branch_name}</b></span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Freight Charges Breakdown */}
                    <div style={{ border: "1px solid #cbd5e1", borderRadius: "4px", padding: "8px 10px", backgroundColor: "#f8fafc" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                        <span style={{ color: "#475569" }}>Basic Freight:</span>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>₹{Number(viewingLr.revenue || 12000).toLocaleString("en-IN")}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", borderTop: "1px solid #e2e8f0" }}>
                        <span style={{ color: "#475569" }}>Hamali / Handling Charges:</span>
                        <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#0f172a" }}>₹0.00</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", borderTop: "1px solid #e2e8f0" }}>
                        <span style={{ color: "#475569" }}>Green Tax / Statistical Surcharge:</span>
                        <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#0f172a" }}>₹0.00</span>
                      </div>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "5px 0",
                        marginTop: "4px",
                        borderTop: "2px solid #0f172a",
                        borderBottom: "1px solid #0f172a",
                        fontSize: "11px",
                        fontWeight: 900
                      }}>
                        <span style={{ color: "#0f172a" }}>Total Consignment Freight:</span>
                        <span style={{ fontFamily: "monospace", color: "#b45309" }}>₹{Number(viewingLr.revenue || 12000).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Statutory Terms of Carriage Declaration */}
                  <div style={{
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
                  }}>
                    <p style={{ fontWeight: 800, color: "#1e293b", margin: "0 0 2px", textTransform: "uppercase" }}>
                      Carriage Terms & Conditions (Carriage by Road Act 2007):
                    </p>
                    <p style={{ margin: 0 }}>
                      1. Consignment is accepted subject to standard carrier terms. Goods carried at Owner's risk unless covered under comprehensive transit insurance.
                      2. Transporter shall not be responsible for en-route highway delays caused by force majeure, road blockades or statutory RTO/GST inspections.
                      3. Unloading demurrage charges @ ₹500/day applicable after 24 hours of vehicle arrival at receiver's terminal.
                    </p>
                  </div>

                  {/* Signatures & Seal Block */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1.2fr",
                    gap: "12px",
                    paddingTop: "6px",
                    borderTop: "1px solid #cbd5e1",
                    fontSize: "9px",
                    textAlign: "center",
                    position: "relative",
                    zIndex: 1
                  }}>
                    <div style={{ paddingTop: "24px", borderTop: "1px solid #94a3b8" }}>
                      <p style={{ fontWeight: 800, color: "#0f172a", margin: 0 }}>CONSIGNOR SIGNATURE</p>
                      <p style={{ fontSize: "7.5px", color: "#64748b", margin: "2px 0 0" }}>Shipper Verification & Handover</p>
                    </div>
                    <div style={{ paddingTop: "24px", borderTop: "1px solid #94a3b8" }}>
                      <p style={{ fontWeight: 800, color: "#0f172a", margin: 0 }}>DRIVER SIGNATURE</p>
                      <p style={{ fontSize: "7.5px", color: "#64748b", margin: "2px 0 0" }}>Vehicle Custody & Goods Receipt</p>
                    </div>
                    <div style={{
                      paddingTop: "4px",
                      border: "1.5px solid #0f172a",
                      backgroundColor: "#fef3c7",
                      borderRadius: "4px",
                      padding: "6px 8px"
                    }}>
                      <p style={{ fontWeight: 900, color: "#78350f", margin: 0, fontSize: "9px", textTransform: "uppercase" }}>
                        FOR {companySettings.company_name}
                      </p>
                      <div style={{ margin: "4px 0", fontSize: "11px", fontWeight: 900, color: "#0f172a", fontStyle: "italic", fontFamily: "serif" }}>
                        {companySettings.signatory_name || "Vinod Kumar Rathod"}
                      </div>
                      <p style={{ fontSize: "7.5px", fontWeight: 800, color: "#92400e", margin: 0, textTransform: "uppercase" }}>
                        {companySettings.signatory_title || "Managing Director"} • AUTHORISED SIGNATORY
                      </p>
                    </div>
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
