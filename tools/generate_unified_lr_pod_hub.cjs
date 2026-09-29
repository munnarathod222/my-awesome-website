const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

console.log('Generating Unified Lorry Receipts & POD Hub (React.createElement mode)...');

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

function LorryReceiptsPodHubPage() {
  const [activeTab, setActiveTab] = useState("lr"); // "lr" or "pod"
  const [trips, setTrips] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
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

  const loadData = async () => {
    setLoading(true);
    try {
      const clientList = await pb.collection("clients").getFullList({ $autoCancel: false }).catch(() => []);
      const cMap = {};
      clientList.forEach(cl => {
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

  // Helper to get formatted LR Number
  const getLrNumber = (trip) => {
    if (trip.lr_number && trip.lr_number.trim()) return trip.lr_number.trim();
    if (trip.client_trip_id && trip.client_trip_id.trim()) return trip.client_trip_id.trim();
    const idSuffix = (trip.trip_id || trip.id || "").replace(/[^0-9]/g, "").slice(-4) || "1001";
    return (companySettings.lr_prefix || "JBC") + "/26-27/" + idSuffix;
  };

  // Helper for POD status
  const getPodStatus = (trip) => {
    if (trip.pod_status === "Verified") return "Verified";
    if (trip.pod_file || trip.pod_link || trip.pod_status === "Uploaded") return "Uploaded";
    return "Pending";
  };

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
    setCreateForm(prev => ({
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
          driver_phone: createForm.driverPhone.trim() || undefined
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
    const route = (trip.origin || "Origin") + " to " + (trip.destination || "Destination");
    const client = clients[trip.client_id] || trip.client_name || "Client Partner";

    const msg = encodeURIComponent(
      "*JAI BHAVANI CARGO MOVERS*\\n" +
      "📄 *LORRY RECEIPT / CONSIGNMENT NOTE*\\n\\n" +
      "🔹 *LR Number:* #" + lrNum + "\\n" +
      "🔹 *Client:* " + client + "\\n" +
      "🔹 *Vehicle:* " + truck + "\\n" +
      "🔹 *Driver:* " + driver + "\\n" +
      "🔹 *Route:* " + route + "\\n" +
      "🔹 *POD Status:* " + getPodStatus(trip) + "\\n\\n" +
      "Track & download verified documents at:\\n" +
      "https://www.jaibhavanicargo.com/truck-docs\\n\\n" +
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
    doc.write(\`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>LR_\${viewingLr ? getLrNumber(viewingLr) : "Receipt"}</title>
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
          \${content.innerHTML}
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
    \`);
    doc.close();
  };

  // Filtered lists
  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const lr = getLrNumber(t).toLowerCase();
      const trId = (t.trip_id || t.id || "").toLowerCase();
      const trk = (t.truck_number || "").toLowerCase();
      const cl = (clients[t.client_id] || t.client_name || "").toLowerCase();
      const rt = (t.route || (t.origin + " " + t.destination) || "").toLowerCase();
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

  // Metrics
  const totalCount = trips.length;
  const verifiedPodCount = trips.filter(t => getPodStatus(t) === "Verified").length;
  const uploadedPodCount = trips.filter(t => getPodStatus(t) === "Uploaded").length;
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
            {companySettings.company_name} • Issue official A4 Bilties, Consignment Notes & verify Proof of Delivery records.
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
          onClick={() => setActiveTab("lr")}
          className={"flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer " + (
            activeTab === "lr"
              ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          )}
        >
          <FileTextIcon className="w-4 h-4" />
          <span>Lorry Receipts (LR / Bilty)</span>
          <span className={"px-2 py-0.5 rounded-full text-xs font-mono " + (activeTab === "lr" ? "bg-slate-950 text-amber-400" : "bg-slate-800 text-slate-300")}>
            {trips.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("pod")}
          className={"flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer " + (
            activeTab === "pod"
              ? "bg-blue-600 text-white shadow-md font-extrabold"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          )}
        >
          <FileCheckIcon className="w-4 h-4" />
          <span>POD Management (Proof of Delivery)</span>
          <span className={"px-2 py-0.5 rounded-full text-xs font-mono " + (activeTab === "pod" ? "bg-white text-blue-900 font-bold" : "bg-slate-800 text-slate-300")}>
            {verifiedPodCount + uploadedPodCount}/{trips.length}
          </span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Consignments</p>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1 font-mono">{totalCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Active database records</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-wider">In-Transit / Live</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 font-mono">{inTransitCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Dispatched on highway</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-wider">POD Uploaded</p>
          <p className="text-2xl sm:text-3xl font-black text-blue-400 mt-1 font-mono">{uploadedPodCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting final audit</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">POD Verified</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 font-mono">{verifiedPodCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Delivery fully signed</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder={activeTab === "lr" ? "Search by LR #, Trip ID, Truck #, Client, Route..." : "Search POD by Trip ID, Truck, Client, Route..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl h-11"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 font-medium cursor-pointer h-11 w-full sm:w-auto outline-none focus:border-amber-500"
          >
            <option value="all">All Records</option>
            <option value="in_transit">In-Transit Only</option>
            <option value="completed">Completed Trips</option>
            <option value="pod_verified">POD Verified</option>
            <option value="pod_uploaded">POD Uploaded</option>
            <option value="pod_pending">POD Pending</option>
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
              <FileTextIcon className="w-12 h-12 mx-auto text-slate-600 mb-2 opacity-50" />
              <p className="text-base font-bold text-slate-300">No matching consignments found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or status filter.</p>
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
                    <th className="p-3.5">POD Status</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredTrips.map((trip) => {
                    const lrNum = getLrNumber(trip);
                    const podSt = getPodStatus(trip);
                    const clientName = clients[trip.client_id] || trip.client_name || "Direct Client";
                    const route = trip.route || ((trip.origin || "Origin") + " ➔ " + (trip.destination || "Destination"));

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
                            <span>{trip.truck_number || "Unassigned"}</span>
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
                          <p className="font-semibold text-slate-100">{clientName}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{route}</p>
                        </td>

                        {/* Date */}
                        <td className="p-3.5 text-slate-300 font-mono">
                          {trip.date || "Today"}
                        </td>

                        {/* Freight */}
                        <td className="p-3.5 font-mono font-bold text-emerald-400">
                          ₹{Number(trip.revenue || 0).toLocaleString("en-IN")}
                        </td>

                        {/* POD Status */}
                        <td className="p-3.5">
                          <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border " + (
                            podSt === "Verified"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : podSt === "Uploaded"
                              ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                              : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          )}>
                            {podSt === "Verified" ? "Verified POD" : podSt === "Uploaded" ? "POD Uploaded" : "POD Pending"}
                          </span>
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
                            ) : (
                              <label
                                htmlFor={"upload-lr-" + trip.id}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer transition flex items-center"
                                title="Attach POD Document"
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
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* TAB 2: PROOF OF DELIVERY (POD) TABLE */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-800">
                    <th className="p-3.5 pl-5">Trip & LR Ref</th>
                    <th className="p-3.5">Client & Consignee</th>
                    <th className="p-3.5">Vehicle & Driver</th>
                    <th className="p-3.5">Delivery Route</th>
                    <th className="p-3.5">POD Document</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredTrips.map((trip) => {
                    const lrNum = getLrNumber(trip);
                    const podSt = getPodStatus(trip);
                    const clientName = clients[trip.client_id] || trip.client_name || "Direct Client";
                    const hasFile = !!trip.pod_file;
                    const hasLink = !!trip.pod_link;

                    return (
                      <tr key={trip.id} className="hover:bg-slate-800/40 transition">
                        {/* Trip & LR */}
                        <td className="p-3.5 pl-5">
                          <p className="font-bold text-white">{trip.trip_id || "TRIP"}</p>
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mt-1 inline-block">
                            {lrNum}
                          </span>
                        </td>

                        {/* Client */}
                        <td className="p-3.5">
                          <p className="font-semibold text-slate-100">{clientName}</p>
                          <p className="text-[10px] text-slate-500">{trip.date || "Recent"}</p>
                        </td>

                        {/* Vehicle & Driver */}
                        <td className="p-3.5">
                          <p className="font-mono font-bold text-slate-200">{trip.truck_number || "Unassigned"}</p>
                          <p className="text-[11px] text-slate-400">{trip.driver_name || "Driver"}</p>
                        </td>

                        {/* Route */}
                        <td className="p-3.5 text-slate-300">
                          {trip.route || ((trip.origin || "Origin") + " ➔ " + (trip.destination || "Destination"))}
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
                              : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          )}>
                            {podSt === "Verified" ? "Verified" : podSt === "Uploaded" ? "Uploaded (Review)" : "Pending"}
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
                    <span className="font-semibold text-slate-900">{viewingLr.date || "Today"}</span>
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
                    <p className="text-[10px] text-slate-600 mt-0.5">Fleet Container / 32ft MXL</p>
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
                    <p className="font-bold text-slate-900">{clients[viewingLr.client_id] || viewingLr.client_name || "Consignor Partner"}</p>
                    <p className="text-[9px] text-slate-600 mt-0.5 leading-tight">
                      Industrial Estate, {viewingLr.origin || "Origin Depot"}
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
                    <p className="font-bold text-slate-900">Consignee Warehouse Ltd</p>
                    <p className="text-[9px] text-slate-600 mt-0.5 leading-tight">
                      Logistics Hub, {viewingLr.destination || "Destination Terminal"}
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
                      <td className="text-center font-bold">12 Packages</td>
                      <td>
                        <span className="font-bold text-slate-900">{viewingLr.description || "General Commercial Freight & Machinery Parts"}</span>
                        <p className="text-[9px] text-slate-500">Secure containerized highway shipment</p>
                      </td>
                      <td className="text-right font-mono">4,850 Kg</td>
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
                <div className="grid grid-cols-3 gap-3 text-center text-[10px] pt-2">
                  <div className="border-t border-slate-400 pt-1">
                    <p className="font-bold text-slate-800">Consignor / Sender</p>
                    <p className="text-[8px] text-slate-500">Signature / Thumb Impression</p>
                  </div>
                  <div className="border-t border-slate-400 pt-1">
                    <p className="font-bold text-slate-800">Vehicle Driver</p>
                    <p className="text-[8px] text-slate-500">Signature & Key Handover</p>
                  </div>
                  <div className="border-t border-slate-400 pt-1">
                    <p className="font-bold text-slate-900">For {companySettings.company_name}</p>
                    <p className="text-[8px] text-amber-800 font-bold">Authorized Dispatch Officer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: POD PHOTO / DOCUMENT PREVIEW MODAL */}
      {viewingPodDoc && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <FileCheckIcon className="w-5 h-5 text-emerald-400" />
                  Proof of Delivery (POD) Document
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Trip: {viewingPodDoc.tripId} • Truck: {viewingPodDoc.truck} • {viewingPodDoc.client}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={viewingPodDoc.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <DownloadIcon className="w-4 h-4" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setViewingPodDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 flex items-center justify-center min-h-[400px] max-h-[70vh] overflow-auto">
              <img
                src={viewingPodDoc.url}
                alt="Proof of Delivery Document"
                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg border border-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ISSUE / GENERATE NEW LR MODAL */}
      {isCreatingLr && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-black text-white text-lg flex items-center gap-2">
                  <FileTextIcon className="w-5 h-5 text-amber-400" />
                  Issue New Lorry Receipt (LR / Bilty)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generate an official consignment note and link to fleet operations.
                </p>
              </div>
              <button
                onClick={() => setIsCreatingLr(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreateLr} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Link to Existing Active Trip (Optional - Pre-fills details):
                </label>
                <select
                  value={createForm.selectedTripId}
                  onChange={(e) => handleSelectTripForLr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
                >
                  <option value="">-- Or Create as Standalone Consignment --</option>
                  {trips.slice(0, 30).map(t => (
                    <option key={t.id} value={t.id}>
                      {t.trip_id || t.id.slice(0, 8)} • {t.truck_number || "Truck"} • {t.origin || "Origin"} ➔ {t.destination || "Dest"} ({clients[t.client_id] || t.client_name || "Client"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">LR Number *</label>
                  <Input
                    required
                    value={createForm.lrNumber}
                    onChange={(e) => setCreateForm({ ...createForm, lrNumber: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-slate-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">GST E-Way Bill Number</label>
                  <Input
                    placeholder="e.g. 3412 8901 4521"
                    value={createForm.ewayBill}
                    onChange={(e) => setCreateForm({ ...createForm, ewayBill: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Truck Number</label>
                  <Input
                    placeholder="e.g. TG12U2637"
                    value={createForm.truckNumber}
                    onChange={(e) => setCreateForm({ ...createForm, truckNumber: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-slate-100 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Driver Name</label>
                  <Input
                    placeholder="Driver Name"
                    value={createForm.driverName}
                    onChange={(e) => setCreateForm({ ...createForm, driverName: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Driver Phone</label>
                  <Input
                    placeholder="+91 Mobile"
                    value={createForm.driverPhone}
                    onChange={(e) => setCreateForm({ ...createForm, driverPhone: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Origin City</label>
                  <Input
                    placeholder="Hyderabad"
                    value={createForm.origin}
                    onChange={(e) => setCreateForm({ ...createForm, origin: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Destination City</label>
                  <Input
                    placeholder="Warangal"
                    value={createForm.destination}
                    onChange={(e) => setCreateForm({ ...createForm, destination: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Freight (₹)</label>
                  <Input
                    type="number"
                    placeholder="12000"
                    value={createForm.freight}
                    onChange={(e) => setCreateForm({ ...createForm, freight: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-slate-100 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Consignor (Sender)</label>
                  <Input
                    placeholder="Consignor Company / Name"
                    value={createForm.consignorName}
                    onChange={(e) => setCreateForm({ ...createForm, consignorName: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Consignee (Receiver)</label>
                  <Input
                    placeholder="Consignee Company / Name"
                    value={createForm.consigneeName}
                    onChange={(e) => setCreateForm({ ...createForm, consigneeName: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Goods Description</label>
                <Input
                  placeholder="e.g. Industrial Goods / Machinery Spares"
                  value={createForm.goodsDescription}
                  onChange={(e) => setCreateForm({ ...createForm, goodsDescription: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  onClick={() => setIsCreatingLr(false)}
                  variant="outline"
                  className="rounded-xl border-slate-700 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black cursor-pointer"
                >
                  Confirm & Issue LR
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT LR NUMBER MODAL */}
      {editLrTrip && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FileTextIcon className="w-5 h-5 text-amber-400" />
              Update LR / Consignment Number
            </h3>
            <p className="text-xs text-slate-400">
              Trip: {editLrTrip.trip_id || editLrTrip.id} • Truck: {editLrTrip.truck_number}
            </p>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">New LR Number:</label>
              <Input
                value={newLrNumber}
                onChange={(e) => setNewLrNumber(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-100 font-mono font-bold"
                placeholder="e.g. JBC/26-27/000280"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
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
`;

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
fs.writeFileSync(path.join(__dirname, 'LorryReceiptsPodHubPage.jsx'), componentSource, 'utf8');

// Target destinations
const chunkDests = [
  path.join(__dirname, '../dist/assets/PODManagementPage-RbmOVLGd.js'),
  path.join(__dirname, '../apps/web/dist/assets/PODManagementPage-RbmOVLGd.js'),
  path.join(__dirname, '../apps/api/dist/assets/PODManagementPage-RbmOVLGd.js'),
  path.join(__dirname, '../dist/apps/web/assets/PODManagementPage-RbmOVLGd.js'),
  path.join(__dirname, '../dist/assets/LorryReceiptsPage-DLxf9dwO.js'),
  path.join(__dirname, '../apps/web/dist/assets/LorryReceiptsPage-DLxf9dwO.js'),
  path.join(__dirname, '../apps/api/dist/assets/LorryReceiptsPage-DLxf9dwO.js'),
  path.join(__dirname, '../dist/apps/web/assets/LorryReceiptsPage-DLxf9dwO.js')
];

for (const dest of chunkDests) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, compiled, 'utf8');
  console.log('✓ Successfully written chunk to:', dest);
}

console.log('All chunk destinations updated successfully!');
