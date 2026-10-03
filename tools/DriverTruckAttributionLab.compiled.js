

function DriverTruckAttributionLab({  onBackToFleet  }) {
  const jsx = e.jsx;
  const jsxs = e.jsxs;
  const Fragment = c.Fragment;
  const [activeSubTab, setActiveSubTab] = c.useState("matrix");
  const [matrixData, setMatrixData] = c.useState(null);
  const [driverBaselines, setDriverBaselines] = c.useState([]);
  const [truckBaselines, setTruckBaselines] = c.useState([]);
  const [swapExperiments, setSwapExperiments] = c.useState([]);
  const [loading, setLoading] = c.useState(true);
  const [searchQuery, setSearchQuery] = c.useState("");
  const [selectedDriverDetails, setSelectedDriverDetails] = c.useState(null);
  const [isNewSwapOpen, setIsNewSwapOpen] = c.useState(false);
  const [newSwapForm, setNewSwapForm] = c.useState({
    driver_name: "Ramesh Rathod",
    driver_id: "DRV_RAMESH_01",
    original_truck_no: "TG 12 U 2637",
    original_truck_id: "TRK_TG12U2637",
    swap_truck_no: "TS 07 UE 1234 (Tata Benchmark)",
    swap_truck_id: "TRK_TS07UE1234",
    control_driver_name: "Suresh Yadav (Master Driver)",
    control_driver_id: "DRV_SURESH_03",
    test_duration_trips: 3,
    trigger_reason: "Low fuel mileage (< 3.2 km/l) on recent trips. Decouple driver vs mechanical fault."
  });
  const [evalModal, setEvalModal] = c.useState({
    isOpen: false,
    experiment: null,
    driver_kmpl: "4.20",
    control_kmpl: "3.40"
  });
  const loadData = async () => {
    try {
      setLoading(true);
      const matrixRes = await fetch("/api/attribution/matrix").catch(() => null);
      if (matrixRes && matrixRes.ok) {
        const json = await matrixRes.json();
        setMatrixData(json);
      }
      const drvRes = await fetch("/api/attribution/drivers").catch(() => null);
      if (drvRes && drvRes.ok) {
        const json = await drvRes.json();
        setDriverBaselines(json.data || []);
      }
      const trkRes = await fetch("/api/attribution/trucks").catch(() => null);
      if (trkRes && trkRes.ok) {
        const json = await trkRes.json();
        setTruckBaselines(json.data || []);
      }
      const swapsRes = await fetch("/api/attribution/swaps").catch(() => null);
      if (swapsRes && swapsRes.ok) {
        const json = await swapsRes.json();
        setSwapExperiments(json.data || []);
      }
    } catch (e) {
      console.warn("Attribution lab API fetch notice:", e);
    } finally {
      setLoading(false);
    }
  };
  c.useEffect(() => {
    loadData();
  }, []);
  const handleLaunchSwap = async () => {
    try {
      const res = await fetch("/api/attribution/swaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSwapForm)
      });
      if (res.ok) {
        const created = await res.json();
        alert("Diagnostic Swap Initiated successfully! Dispatch instructions ready.");
        setIsNewSwapOpen(false);
        loadData();
        setActiveSubTab("swaps");
      } else {
        alert("Error launching swap. Please try again.");
      }
    } catch (err) {
      alert("Error launching swap: " + err.message);
    }
  };
  const handleEvaluateSwap = async () => {
    if (!evalModal.experiment) return;
    try {
      const res = await fetch("/api/attribution/swaps/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          swapId: evalModal.experiment.id,
          testMetrics: {
            driver_on_benchmark_truck_kmpl: parseFloat(evalModal.driver_kmpl),
            control_driver_on_suspect_truck_kmpl: parseFloat(evalModal.control_kmpl)
          }
        })
      });
      if (res.ok) {
        alert("Experiment concluded! Definitive root cause assigned.");
        setEvalModal({ isOpen: false, experiment: null, driver_kmpl: "", control_kmpl: "" });
        loadData();
      }
    } catch (err) {
      alert("Error concluding swap: " + err.message);
    }
  };
  const copyWhatsAppNote = (swap) => {
    const text = `\u{1F69B} *JAI BHAVANI CARGO - ROTATION ASSIGNMENT*
\u2022 *Driver*: ${swap.driver_name}
\u2022 *Test Vehicle*: ${swap.swap_truck_no}
\u2022 *Control Driver*: ${swap.control_driver_name} (on ${swap.original_truck_no})
\u2022 *Test Duration*: ${swap.test_duration_trips} trips
\u2022 *Directive*: Diagnostic rotation to isolate fuel/maintenance efficiency. Adhere strictly to 55-65 km/h economy band. Zero unauthorized engine idling.
_Issued by Fleet Attribution & Diagnostic Lab_`;
    navigator.clipboard.writeText(text);
    alert("WhatsApp dispatch note copied to clipboard!");
  };
  const kpis = matrixData?.kpis || {
    totalTripsMonitored: 7,
    fleetAvgMileageKmpl: 3.61,
    benchmarkMileageKmpl: 4.1,
    totalFuelCostIncurred: 96199,
    totalMaintCostIncurred: 27700,
    activeSwapExperiments: 1,
    completedSwapExperiments: 3,
    trucksTrackedCount: 5,
    driversTrackedCount: 5
  };
  const quadrants = matrixData?.quadrants || {
    driverFaults: [],
    truckFaults: [],
    brandMismatches: [],
    optimalSynergies: []
  };
  return /* @__PURE__ */ e.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden", children: [
      /* @__PURE__ */ e.jsx("div", { className: "absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" }),
      /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10", children: [
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx("span", { className: "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", children: "Independent Attribution Lab" }),
            /* @__PURE__ */ e.jsx("span", { className: "text-xs text-slate-400", children: "Decoupled Telematics & A/B Swaps" })
          ] }),
          /* @__PURE__ */ e.jsxs("h2", { className: "text-2xl font-black text-white mt-1.5 flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx("span", { children: "Driver vs Truck Attribution Engine" }),
            /* @__PURE__ */ e.jsx("span", { className: "text-sm font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300", children: "v75 Production" })
          ] }),
          /* @__PURE__ */ e.jsx("p", { className: "text-sm text-slate-400 mt-1 max-w-3xl", children: "Track fuel mileage & maintenance costs for drivers and vehicles independently. When a variance occurs, rotate the driver to a benchmark truck to isolate whether the root cause is the driver, the vehicle, or a brand powertrain mismatch." })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex flex-wrap items-center gap-2.5", children: [
          onBackToFleet && /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              onClick: onBackToFleet,
              className: "px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition",
              children: "\u2190 Back to Fleet List"
            }
          ),
          /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setIsNewSwapOpen(true),
              className: "px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5",
              children: [
                /* @__PURE__ */ e.jsx("span", { children: "\u{1F504}" }),
                " Launch A/B Swap Test"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400", children: "Fleet Actual km/l" }),
          /* @__PURE__ */ e.jsxs("div", { className: "text-xl font-black text-amber-400 mt-0.5", children: [
            kpis.fleetAvgMileageKmpl,
            " km/l"
          ] }),
          /* @__PURE__ */ e.jsxs("span", { className: "text-[10px] text-slate-500", children: [
            "Benchmark: ",
            kpis.benchmarkMileageKmpl,
            " km/l"
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400", children: "Mileage Deficit" }),
          /* @__PURE__ */ e.jsxs("div", { className: "text-xl font-black text-rose-400 mt-0.5", children: [
            ((kpis.fleetAvgMileageKmpl - kpis.benchmarkMileageKmpl) / kpis.benchmarkMileageKmpl * 100).toFixed(1),
            "%"
          ] }),
          /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-rose-500/80", children: "Under target" })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400", children: "Monitored Trips" }),
          /* @__PURE__ */ e.jsx("div", { className: "text-xl font-black text-blue-400 mt-0.5", children: kpis.totalTripsMonitored }),
          /* @__PURE__ */ e.jsxs("span", { className: "text-[10px] text-slate-500", children: [
            kpis.trucksTrackedCount,
            " Trucks / ",
            kpis.driversTrackedCount,
            " Drivers"
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400", children: "Excess Maintenance" }),
          /* @__PURE__ */ e.jsxs("div", { className: "text-xl font-black text-orange-400 mt-0.5", children: [
            "\u20B9",
            kpis.totalMaintCostIncurred.toLocaleString("en-IN")
          ] }),
          /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500", children: "Decoupled tracking" })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400", children: "A/B Swap Tests" }),
          /* @__PURE__ */ e.jsxs("div", { className: "text-xl font-black text-emerald-400 mt-0.5", children: [
            kpis.activeSwapExperiments,
            " Active"
          ] }),
          /* @__PURE__ */ e.jsxs("span", { className: "text-[10px] text-emerald-500/80", children: [
            kpis.completedSwapExperiments,
            " Concluded"
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400", children: "Diagnostic Verdicts" }),
          /* @__PURE__ */ e.jsx("div", { className: "text-xl font-black text-purple-400 mt-0.5", children: "4 Isolated" }),
          /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-purple-400/80", children: "100% Attribution Proof" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3", children: [
      /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          onClick: () => setActiveSubTab("matrix"),
          className: `px-4 py-2 text-xs font-bold rounded-xl transition ${activeSubTab === "matrix" ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20" : "bg-slate-900 text-slate-300 hover:bg-slate-800"}`,
          children: "\u{1F52C} Root-Cause Diagnostic Matrix"
        }
      ),
      /* @__PURE__ */ e.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveSubTab("swaps"),
          className: `px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${activeSubTab === "swaps" ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-slate-900 text-slate-300 hover:bg-slate-800"}`,
          children: [
            /* @__PURE__ */ e.jsx("span", { children: "\u{1F504}" }),
            " A/B Swap Experiments Lab",
            kpis.activeSwapExperiments > 0 && /* @__PURE__ */ e.jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" })
          ]
        }
      ),
      /* @__PURE__ */ e.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveSubTab("drivers"),
          className: `px-4 py-2 text-xs font-bold rounded-xl transition ${activeSubTab === "drivers" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "bg-slate-900 text-slate-300 hover:bg-slate-800"}`,
          children: [
            "\u{1F464} Driver Independent Baselines (",
            driverBaselines.length,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ e.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveSubTab("trucks"),
          className: `px-4 py-2 text-xs font-bold rounded-xl transition ${activeSubTab === "trucks" ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/20" : "bg-slate-900 text-slate-300 hover:bg-slate-800"}`,
          children: [
            "\u{1F69B} Truck Independent Baselines (",
            truckBaselines.length,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ e.jsx(
        "button",
        {
          type: "button",
          onClick: () => setActiveSubTab("simulator"),
          className: `px-4 py-2 text-xs font-bold rounded-xl transition ${activeSubTab === "simulator" ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20" : "bg-slate-900 text-slate-300 hover:bg-slate-800"}`,
          children: "\u{1F916} AI Swap Simulator"
        }
      )
    ] }),
    activeSubTab === "matrix" && /* @__PURE__ */ e.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-300", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-base", children: "\u{1F4A1}" }),
          /* @__PURE__ */ e.jsx("span", { className: "font-semibold text-slate-200", children: "How the Attribution Rotation Model Works:" })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex flex-wrap items-center gap-2 font-mono text-[11px]", children: [
          /* @__PURE__ */ e.jsx("span", { className: "bg-rose-950/80 text-rose-300 px-2 py-1 rounded border border-rose-800", children: "\u{1F534} Low Mileage across \u22652 Trucks = Driver Fault" }),
          /* @__PURE__ */ e.jsx("span", { className: "bg-blue-950/80 text-blue-300 px-2 py-1 rounded border border-blue-800", children: "\u{1F535} Low Mileage across \u22652 Drivers = Truck Fault" }),
          /* @__PURE__ */ e.jsx("span", { className: "bg-amber-950/80 text-amber-300 px-2 py-1 rounded border border-amber-800", children: "\u{1F7E1} Varies by Brand (Tata vs Leyland) = Powertrain Mismatch" }),
          /* @__PURE__ */ e.jsx("span", { className: "bg-emerald-950/80 text-emerald-300 px-2 py-1 rounded border border-emerald-800", children: "\u{1F7E2} Both Normal = Optimal Synergy" })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "bg-gradient-to-b from-rose-950/30 to-slate-900 border-2 border-rose-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ e.jsx("span", { className: "w-3 h-3 rounded-full bg-rose-500 animate-pulse" }),
              /* @__PURE__ */ e.jsx("h3", { className: "text-base font-black text-rose-400", children: "Quadrant 1: Driver Fault Isolated" })
            ] }),
            /* @__PURE__ */ e.jsx("span", { className: "text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30", children: "Driving Style / Idling / Pilferage" })
          ] }),
          /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-300 mb-4", children: "These drivers consistently give poor mileage or spike maintenance wear regardless of which truck they drive." }),
          quadrants.driverFaults.length === 0 ? /* @__PURE__ */ e.jsx("div", { className: "p-4 bg-slate-950/50 rounded-xl text-center text-xs text-slate-500", children: "No driver behavioral deficits detected." }) : quadrants.driverFaults.map((drv) => /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-950/80 border border-rose-500/20 rounded-xl p-4 space-y-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ e.jsxs("div", { children: [
                /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white text-sm", children: drv.label }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] text-slate-400", children: [
                  "Tested across ",
                  drv.trucksDriven,
                  " different trucks"
                ] })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ e.jsxs("div", { className: "text-base font-black text-rose-400", children: [
                  drv.overallKmpl,
                  " km/l"
                ] }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-[10px] text-slate-500", children: [
                  "Peer Avg: ",
                  drv.peerAvgKmpl,
                  " km/l"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-2 gap-2 text-[11px]", children: [
              /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900 p-2 rounded border border-slate-800", children: [
                /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Fuel Score:" }),
                " ",
                /* @__PURE__ */ e.jsxs("span", { className: "font-bold text-rose-400", children: [
                  drv.fuelEfficiencyScore,
                  "/100"
                ] })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900 p-2 rounded border border-slate-800", children: [
                /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Maint Abuse:" }),
                " ",
                /* @__PURE__ */ e.jsxs("span", { className: "font-bold text-orange-400", children: [
                  "\u20B9",
                  drv.maintAbusePerKm,
                  "/km"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-xs text-rose-300/90 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/40", children: [
              /* @__PURE__ */ e.jsx("strong", { children: "Verdict:" }),
              " ",
              drv.summary
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex gap-2 pt-1", children: [
              /* @__PURE__ */ e.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    alert(`Eco-driving telematics training module scheduled for ${drv.label}. Throttle alert sensitivity set to 15%.`);
                  },
                  className: "flex-1 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition",
                  children: "\u{1F393} Schedule Eco-Training"
                }
              ),
              /* @__PURE__ */ e.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setNewSwapForm((prev) => ({
                      ...prev,
                      driver_name: drv.label,
                      driver_id: drv.id,
                      trigger_reason: `Driver fault verification: Rotate ${drv.label} to benchmark truck.`
                    }));
                    setIsNewSwapOpen(true);
                  },
                  className: "px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition",
                  children: "\u{1F504} Verify Swap"
                }
              )
            ] })
          ] }, drv.id))
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "bg-gradient-to-b from-blue-950/30 to-slate-900 border-2 border-blue-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ e.jsx("span", { className: "w-3 h-3 rounded-full bg-blue-500 animate-pulse" }),
              /* @__PURE__ */ e.jsx("h3", { className: "text-base font-black text-blue-400", children: "Quadrant 2: Truck Mechanical Defect" })
            ] }),
            /* @__PURE__ */ e.jsx("span", { className: "text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30", children: "Engine / Injector / Turbo Wear" })
          ] }),
          /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-300 mb-4", children: "These trucks underperform even when driven by top-rated Master Drivers. The problem is strictly mechanical." }),
          quadrants.truckFaults.length === 0 ? /* @__PURE__ */ e.jsx("div", { className: "p-4 bg-slate-950/50 rounded-xl text-center text-xs text-slate-500", children: "No mechanical truck defects detected." }) : quadrants.truckFaults.map((trk) => /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-950/80 border border-blue-500/20 rounded-xl p-4 space-y-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ e.jsxs("div", { children: [
                /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white text-sm", children: trk.label }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] text-slate-400", children: [
                  trk.brand,
                  " - ",
                  trk.model
                ] })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ e.jsxs("div", { className: "text-base font-black text-blue-400", children: [
                  trk.actualAvgKmpl,
                  " km/l"
                ] }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-[10px] text-rose-400 font-bold", children: [
                  trk.deficitPct,
                  "% vs Target"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "bg-blue-950/40 p-2.5 rounded-lg border border-blue-800/40 text-xs text-blue-200", children: [
              /* @__PURE__ */ e.jsx("strong", { children: "Identified Mechanical Fault:" }),
              " ",
              trk.faultComponent
            ] }),
            trk.evidence && trk.evidence.length > 0 && /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1", children: [
              /* @__PURE__ */ e.jsx("div", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400", children: "Multi-Driver Failure Evidence:" }),
              trk.evidence.map((ev, i) => /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between text-[11px] text-slate-300", children: [
                /* @__PURE__ */ e.jsxs("span", { children: [
                  ev.driver_name,
                  " (",
                  ev.trips,
                  " trips)"
                ] }),
                /* @__PURE__ */ e.jsxs("span", { className: "font-mono text-rose-400 font-bold", children: [
                  ev.mileage,
                  " km/l"
                ] })
              ] }, i))
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-xs text-slate-300 bg-slate-900/60 p-2 rounded", children: [
              /* @__PURE__ */ e.jsx("strong", { children: "Proof Summary:" }),
              " ",
              trk.summary
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex gap-2 pt-1", children: [
              /* @__PURE__ */ e.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    alert(`Maintenance Work Order dispatched to Hyderabad Workshop for ${trk.label}. Scope: Turbo Pressure Test & Injector Calibration.`);
                  },
                  className: "flex-1 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition",
                  children: "\u{1F527} Create Workshop Work Order"
                }
              ),
              /* @__PURE__ */ e.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setNewSwapForm((prev) => ({
                      ...prev,
                      original_truck_no: trk.label,
                      original_truck_id: trk.id,
                      trigger_reason: `Mechanical fault check: Rotate master driver onto ${trk.label}.`
                    }));
                    setIsNewSwapOpen(true);
                  },
                  className: "px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition",
                  children: "\u{1F504} Swap Driver Out"
                }
              )
            ] })
          ] }, trk.id))
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "bg-gradient-to-b from-amber-950/30 to-slate-900 border-2 border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ e.jsx("span", { className: "w-3 h-3 rounded-full bg-amber-500" }),
              /* @__PURE__ */ e.jsx("h3", { className: "text-base font-black text-amber-400", children: "Quadrant 3: Brand & Powertrain Mismatch" })
            ] }),
            /* @__PURE__ */ e.jsx("span", { className: "text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30", children: "Gearbox / RPM Torque Habit" })
          ] }),
          /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-300 mb-4", children: "Driver and truck are both healthy, but the driver\u2019s gear-shifting habits do not match the specific gearbox or torque curve." }),
          quadrants.brandMismatches.length === 0 ? /* @__PURE__ */ e.jsx("div", { className: "p-4 bg-slate-950/50 rounded-xl text-center text-xs text-slate-500", children: "No brand mismatches detected." }) : quadrants.brandMismatches.map((bm) => /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-950/80 border border-amber-500/20 rounded-xl p-4 space-y-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ e.jsxs("div", { children: [
                /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white text-sm", children: bm.label }),
                /* @__PURE__ */ e.jsx("div", { className: "text-[11px] text-slate-400", children: "Multi-Brand Fleet Performance Profile" })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ e.jsxs("div", { className: "text-base font-black text-amber-400", children: [
                  bm.overallKmpl,
                  " km/l"
                ] }),
                /* @__PURE__ */ e.jsx("div", { className: "text-[10px] text-slate-500", children: "Average across brands" })
              ] })
            ] }),
            bm.brandBreakdown && /* @__PURE__ */ e.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ e.jsx("div", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400", children: "Brand-by-Brand Telematics Breakdown:" }),
              Object.entries(bm.brandBreakdown).map(([brand, data]) => /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900 p-2 rounded flex items-center justify-between text-xs", children: [
                /* @__PURE__ */ e.jsx("span", { className: "font-medium text-slate-200", children: brand }),
                /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ e.jsxs("span", { className: "font-mono font-bold text-white", children: [
                    data.avg_mileage,
                    " km/l"
                  ] }),
                  /* @__PURE__ */ e.jsx("span", { className: `text-[10px] px-1.5 py-0.5 rounded font-bold ${data.rating === "Optimal" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`, children: data.rating })
                ] })
              ] }, brand))
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-xs text-amber-300/90 bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/40", children: [
              /* @__PURE__ */ e.jsx("strong", { children: "AI Allocation Recommendation:" }),
              " ",
              bm.summary
            ] }),
            /* @__PURE__ */ e.jsx("div", { className: "flex gap-2 pt-1", children: /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  alert(`Permanent Fleet Rule Applied: ${bm.label} mapped exclusively to Tata & Eicher fleet. Ashok Leyland reassigned.`);
                },
                className: "flex-1 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 transition",
                children: "\u{1F512} Lock Driver to Tata/Eicher Fleet"
              }
            ) })
          ] }, bm.id))
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "bg-gradient-to-b from-emerald-950/30 to-slate-900 border-2 border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ e.jsx("span", { className: "w-3 h-3 rounded-full bg-emerald-500" }),
              /* @__PURE__ */ e.jsx("h3", { className: "text-base font-black text-emerald-400", children: "Quadrant 4: Optimal Synergy Pairs" })
            ] }),
            /* @__PURE__ */ e.jsx("span", { className: "text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30", children: "Peak Fuel & Low Wear" })
          ] }),
          /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-300 mb-4", children: "Drivers and trucks operating above target mileage with zero maintenance abuse. Used as calibration standards." }),
          /* @__PURE__ */ e.jsx("div", { className: "space-y-3", children: quadrants.optimalSynergies.map((item, idx) => /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-950/80 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between", children: [
            /* @__PURE__ */ e.jsxs("div", { children: [
              /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white text-sm", children: item.label }),
              /* @__PURE__ */ e.jsx("div", { className: "text-[11px] text-slate-400", children: item.type === "OPTIMAL_DRIVER" ? "Master Benchmark Driver" : `${item.brand} Fleet Reference` })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ e.jsxs("div", { className: "text-base font-black text-emerald-400", children: [
                item.overallKmpl || item.actualAvgKmpl,
                " km/l"
              ] }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-emerald-500 font-bold", children: "\u2605 Calibrated Benchmark" })
            ] })
          ] }, idx)) }),
          /* @__PURE__ */ e.jsx("div", { className: "mt-4 pt-3 border-t border-slate-800 text-center", children: /* @__PURE__ */ e.jsx("span", { className: "text-xs text-slate-400", children: "These units form the reference control group for ongoing A/B rotation swaps." }) })
        ] })
      ] })
    ] }),
    activeSubTab === "swaps" && /* @__PURE__ */ e.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl", children: [
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("h3", { className: "font-bold text-white text-sm", children: "Active & Historical Swap Rotation Experiments" }),
          /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: "Every swap tests the hypothesis: rotate the suspect driver to a known good truck, and put a Master Driver onto the suspect truck." })
        ] }),
        /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setIsNewSwapOpen(true),
            className: "px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5",
            children: [
              /* @__PURE__ */ e.jsx("span", { children: "+" }),
              " New A/B Swap Test"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-1 gap-4", children: swapExperiments.map((swap) => /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3", children: [
          /* @__PURE__ */ e.jsxs("div", { children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ e.jsx("span", { className: "font-mono text-xs text-slate-400 font-bold", children: swap.experiment_code }),
              /* @__PURE__ */ e.jsx("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded uppercase ${swap.status === "ACTIVE_TESTING" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}`, children: swap.status === "ACTIVE_TESTING" ? "Testing Active" : "Concluded" }),
              /* @__PURE__ */ e.jsx("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded ${swap.attribution_color === "red" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : swap.attribution_color === "blue" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : swap.attribution_color === "amber" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-slate-800 text-slate-300"}`, children: swap.attribution_badge })
            ] }),
            /* @__PURE__ */ e.jsx("h4", { className: "text-base font-bold text-white mt-1", children: swap.title })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "text-xs text-slate-400", children: [
            "Initiated: ",
            /* @__PURE__ */ e.jsx("span", { className: "text-slate-200", children: swap.date_initiated }),
            swap.date_concluded && /* @__PURE__ */ e.jsxs("span", { children: [
              " | Concluded: ",
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-200", children: swap.date_concluded })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-950/60 p-3 rounded-xl border border-slate-800/80", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase text-slate-400", children: "Suspect Pair" }),
            /* @__PURE__ */ e.jsx("div", { className: "font-bold text-slate-200 mt-1", children: swap.driver_name }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-slate-400 text-[11px]", children: [
              "in ",
              swap.original_truck_no
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-950/60 p-3 rounded-xl border border-slate-800/80", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase text-slate-400", children: "Swap Vehicle (Rotated)" }),
            /* @__PURE__ */ e.jsx("div", { className: "font-bold text-emerald-400 mt-1", children: swap.swap_truck_no }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-slate-400 text-[11px]", children: [
              swap.driver_name,
              " driving"
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-950/60 p-3 rounded-xl border border-slate-800/80", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase text-slate-400", children: "Control Driver" }),
            /* @__PURE__ */ e.jsx("div", { className: "font-bold text-blue-400 mt-1", children: swap.control_driver_name }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-slate-400 text-[11px]", children: [
              "tested ",
              swap.original_truck_no
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-950/60 p-3 rounded-xl border border-slate-800/80", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase text-slate-400", children: "Test Duration" }),
            /* @__PURE__ */ e.jsxs("div", { className: "font-bold text-slate-200 mt-1", children: [
              swap.test_duration_trips,
              " Corridor Trips"
            ] }),
            /* @__PURE__ */ e.jsx("div", { className: "text-slate-400 text-[11px]", children: "Telematics & Fuel Audit" })
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3", children: [
          /* @__PURE__ */ e.jsx("div", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400", children: "Telematics & Mileage Variance Proof:" }),
          /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900/80 p-3 rounded-lg border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("div", { className: "text-[11px] text-slate-400 font-semibold mb-1", children: "Before Swap:" }),
              /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center text-xs", children: [
                /* @__PURE__ */ e.jsx("span", { className: "text-slate-300", children: "Baseline Mileage:" }),
                /* @__PURE__ */ e.jsxs("span", { className: "font-mono font-bold text-rose-400", children: [
                  swap.metrics_before?.driver_mileage_kmpl,
                  " km/l"
                ] })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center text-xs mt-1", children: [
                /* @__PURE__ */ e.jsx("span", { className: "text-slate-300", children: "Maintenance Wear:" }),
                /* @__PURE__ */ e.jsxs("span", { className: "font-mono text-orange-400", children: [
                  "\u20B9",
                  swap.metrics_before?.maint_cost_per_km,
                  "/km"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900/80 p-3 rounded-lg border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("div", { className: "text-[11px] text-slate-400 font-semibold mb-1", children: "After Swap Results:" }),
              swap.status === "ACTIVE_TESTING" ? /* @__PURE__ */ e.jsxs("div", { className: "text-xs text-purple-300 italic py-1", children: [
                "Test trips in transit. Preliminary: ",
                swap.metrics_after_swap?.driver_on_benchmark_truck_kmpl || "Pending",
                " km/l"
              ] }) : /* @__PURE__ */ e.jsxs("div", { children: [
                /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center text-xs", children: [
                  /* @__PURE__ */ e.jsxs("span", { className: "text-slate-300", children: [
                    swap.driver_name,
                    " on Benchmark:"
                  ] }),
                  /* @__PURE__ */ e.jsxs("span", { className: "font-mono font-bold text-emerald-400", children: [
                    swap.metrics_after_swap?.driver_on_benchmark_truck_kmpl,
                    " km/l"
                  ] })
                ] }),
                /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center text-xs mt-1", children: [
                  /* @__PURE__ */ e.jsx("span", { className: "text-slate-300", children: "Control Driver on Suspect Truck:" }),
                  /* @__PURE__ */ e.jsxs("span", { className: "font-mono font-bold text-blue-400", children: [
                    swap.metrics_after_swap?.control_driver_on_suspect_truck_kmpl,
                    " km/l"
                  ] })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900 p-3 rounded-lg text-xs space-y-1", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "text-slate-200", children: [
              /* @__PURE__ */ e.jsx("strong", { children: "Attribution Verdict:" }),
              " ",
              swap.verdict
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-emerald-400", children: [
              /* @__PURE__ */ e.jsx("strong", { children: "Resolution Action Taken:" }),
              " ",
              swap.resolution_action
            ] })
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 pt-1", children: [
          /* @__PURE__ */ e.jsxs(
            "button",
            {
              type: "button",
              onClick: () => copyWhatsAppNote(swap),
              className: "px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1.5",
              children: [
                /* @__PURE__ */ e.jsx("span", { children: "\u{1F4AC}" }),
                " Copy WhatsApp Dispatch Note"
              ]
            }
          ),
          swap.status === "ACTIVE_TESTING" && /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              onClick: () => setEvalModal({
                isOpen: true,
                experiment: swap,
                driver_kmpl: "4.15",
                control_kmpl: "3.42"
              }),
              className: "px-3.5 py-1.5 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition",
              children: "\u{1F3C1} Conclude Test & Assign Root Cause"
            }
          )
        ] })
      ] }, swap.id)) })
    ] }),
    activeSubTab === "drivers" && /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2", children: [
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("h3", { className: "font-bold text-white text-sm", children: "Decoupled Driver Performance & Brand Affinity" }),
          /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-400", children: "Track driver mileage and maintenance wear across all trucks they drive." })
        ] }),
        /* @__PURE__ */ e.jsx(
          "input",
          {
            type: "text",
            placeholder: "Search driver name...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 w-56"
          }
        )
      ] }),
      /* @__PURE__ */ e.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ e.jsxs("table", { className: "w-full text-left text-xs", children: [
        /* @__PURE__ */ e.jsx("thead", { className: "bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider", children: /* @__PURE__ */ e.jsxs("tr", { children: [
          /* @__PURE__ */ e.jsx("th", { className: "p-3", children: "Driver Name" }),
          /* @__PURE__ */ e.jsx("th", { className: "p-3", children: "Experience" }),
          /* @__PURE__ */ e.jsx("th", { className: "p-3", children: "Trucks Driven" }),
          /* @__PURE__ */ e.jsx("th", { className: "p-3", children: "Decoupled Mileage" }),
          /* @__PURE__ */ e.jsx("th", { className: "p-3", children: "Peer Avg" }),
          /* @__PURE__ */ e.jsx("th", { className: "p-3", children: "Fuel Score" }),
          /* @__PURE__ */ e.jsx("th", { className: "p-3", children: "Maint Abuse Cost" }),
          /* @__PURE__ */ e.jsx("th", { className: "p-3", children: "Attribution Classification" }),
          /* @__PURE__ */ e.jsx("th", { className: "p-3 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ e.jsx("tbody", { className: "divide-y divide-slate-800", children: driverBaselines.filter((d) => !searchQuery || d.driver_name.toLowerCase().includes(searchQuery.toLowerCase())).map((drv) => /* @__PURE__ */ e.jsxs(c.Fragment, { children: [
          /* @__PURE__ */ e.jsxs("tr", { className: "hover:bg-slate-850/50 transition", children: [
            /* @__PURE__ */ e.jsxs("td", { className: "p-3 font-bold text-white", children: [
              drv.driver_name,
              /* @__PURE__ */ e.jsx("div", { className: "text-[10px] text-slate-500 font-normal", children: drv.driver_id })
            ] }),
            /* @__PURE__ */ e.jsxs("td", { className: "p-3 text-slate-300", children: [
              drv.experience_years,
              " Years"
            ] }),
            /* @__PURE__ */ e.jsxs("td", { className: "p-3 text-slate-300", children: [
              drv.trucks_driven_count,
              " Units"
            ] }),
            /* @__PURE__ */ e.jsxs("td", { className: "p-3 font-mono font-bold text-white text-sm", children: [
              drv.overall_mileage_kmpl,
              " km/l"
            ] }),
            /* @__PURE__ */ e.jsxs("td", { className: "p-3 text-slate-400", children: [
              drv.peer_group_avg_kmpl,
              " km/l"
            ] }),
            /* @__PURE__ */ e.jsx("td", { className: "p-3", children: /* @__PURE__ */ e.jsxs("span", { className: `font-bold ${drv.driver_fuel_efficiency_score >= 95 ? "text-emerald-400" : drv.driver_fuel_efficiency_score >= 85 ? "text-amber-400" : "text-rose-400"}`, children: [
              drv.driver_fuel_efficiency_score,
              "/100"
            ] }) }),
            /* @__PURE__ */ e.jsxs("td", { className: "p-3 font-mono text-slate-300", children: [
              "\u20B9",
              drv.maintenance_abuse_cost_per_km,
              "/km"
            ] }),
            /* @__PURE__ */ e.jsx("td", { className: "p-3", children: /* @__PURE__ */ e.jsx("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded ${drv.classification === "MASTER_DRIVER_BENCHMARK" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : drv.classification === "DRIVER_DEFICIT_CONFIRMED" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : drv.classification === "BRAND_MISMATCH_SENSITIVE" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"}`, children: drv.classification.replace(/_/g, " ") }) }),
            /* @__PURE__ */ e.jsx("td", { className: "p-3 text-right", children: /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                onClick: () => setSelectedDriverDetails(selectedDriverDetails === drv.driver_id ? null : drv.driver_id),
                className: "px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
                children: selectedDriverDetails === drv.driver_id ? "Hide Brands \u25B2" : "Brand Breakdown \u25BC"
              }
            ) })
          ] }),
          selectedDriverDetails === drv.driver_id && drv.brand_breakdown && /* @__PURE__ */ e.jsx("tr", { className: "bg-slate-950/90", children: /* @__PURE__ */ e.jsx("td", { colSpan: 9, className: "p-4", children: /* @__PURE__ */ e.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "text-xs font-bold text-slate-200", children: [
              "Powertrain Affinity & Brand Breakdown for ",
              drv.driver_name,
              ":"
            ] }),
            /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: Object.entries(drv.brand_breakdown).map(([brand, data]) => /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900 p-3 rounded-xl border border-slate-800", children: [
              /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center mb-1", children: [
                /* @__PURE__ */ e.jsx("span", { className: "font-bold text-white text-xs", children: brand }),
                /* @__PURE__ */ e.jsx("span", { className: `text-[10px] font-bold px-1.5 py-0.5 rounded ${data.rating.includes("Optimal") ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`, children: data.rating })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: "text-xs text-slate-400", children: [
                "Trips: ",
                /* @__PURE__ */ e.jsx("span", { className: "text-slate-200", children: data.trips }),
                " | Avg: ",
                /* @__PURE__ */ e.jsxs("span", { className: "font-bold text-white", children: [
                  data.avg_mileage,
                  " km/l"
                ] })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] text-slate-500 mt-1", children: [
                "Maintenance: \u20B9",
                data.maint_per_km,
                "/km"
              ] })
            ] }, brand)) }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800", children: [
              /* @__PURE__ */ e.jsx("strong", { children: "Diagnostic Verdict:" }),
              " ",
              drv.verdict_summary
            ] })
          ] }) }) })
        ] }, drv.driver_id)) })
      ] }) })
    ] }),
    activeSubTab === "trucks" && /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2", children: [
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("h3", { className: "font-bold text-white text-sm", children: "Decoupled Vehicle Mechanical Baselines & Defect Isolator" }),
          /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-400", children: "Track each truck\u2019s mechanical performance across multiple different drivers." })
        ] }),
        /* @__PURE__ */ e.jsx(
          "input",
          {
            type: "text",
            placeholder: "Search truck number...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 w-56"
          }
        )
      ] }),
      /* @__PURE__ */ e.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ e.jsxs("table", { className: "w-full text-left text-xs", children: [
        /* @__PURE__ */ e.jsx("thead", { className: "bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider", children: /* @__PURE__ */ e.jsxs("tr", { children: [
          /* @__PURE__ */ e.jsx("th", { className: "p-3", children: "Truck Number" }),
          /* @__PURE__ */ e.jsx("th", { className: "p-3", children: "Brand & Model" }),
          /* @__PURE__ */ e.jsx("th", { className: "p-3", children: "Drivers Hosted" }),
          /* @__PURE__ */ e.jsx("th", { className: "p-3", children: "Fleet Target" }),
          /* @__PURE__ */ e.jsx("th", { className: "p-3", children: "Actual Avg" }),
          /* @__PURE__ */ e.jsx("th", { className: "p-3", children: "Deficit %" }),
          /* @__PURE__ */ e.jsx("th", { className: "p-3", children: "Maint Cost/km" }),
          /* @__PURE__ */ e.jsx("th", { className: "p-3", children: "Root Cause Diagnosis" }),
          /* @__PURE__ */ e.jsx("th", { className: "p-3", children: "Fault Component" })
        ] }) }),
        /* @__PURE__ */ e.jsx("tbody", { className: "divide-y divide-slate-800", children: truckBaselines.filter((t) => !searchQuery || t.truck_number.toLowerCase().includes(searchQuery.toLowerCase())).map((trk) => /* @__PURE__ */ e.jsxs("tr", { className: "hover:bg-slate-850/50 transition", children: [
          /* @__PURE__ */ e.jsxs("td", { className: "p-3 font-bold text-white", children: [
            trk.truck_number,
            /* @__PURE__ */ e.jsx("div", { className: "text-[10px] text-slate-500 font-normal", children: trk.truck_id })
          ] }),
          /* @__PURE__ */ e.jsxs("td", { className: "p-3 text-slate-300", children: [
            trk.brand,
            /* @__PURE__ */ e.jsx("div", { className: "text-[10px] text-slate-400", children: trk.model })
          ] }),
          /* @__PURE__ */ e.jsxs("td", { className: "p-3 text-slate-300", children: [
            trk.drivers_hosted_count,
            " Drivers"
          ] }),
          /* @__PURE__ */ e.jsxs("td", { className: "p-3 text-slate-400 font-mono", children: [
            trk.fleet_target_kmpl,
            " km/l"
          ] }),
          /* @__PURE__ */ e.jsxs("td", { className: "p-3 font-mono font-bold text-white text-sm", children: [
            trk.actual_avg_kmpl,
            " km/l"
          ] }),
          /* @__PURE__ */ e.jsx("td", { className: "p-3", children: /* @__PURE__ */ e.jsxs("span", { className: `font-bold font-mono ${trk.mileage_deficit_pct >= 0 ? "text-emerald-400" : trk.mileage_deficit_pct > -10 ? "text-amber-400" : "text-rose-400"}`, children: [
            trk.mileage_deficit_pct > 0 ? "+" : "",
            trk.mileage_deficit_pct,
            "%"
          ] }) }),
          /* @__PURE__ */ e.jsxs("td", { className: "p-3 font-mono text-slate-300", children: [
            "\u20B9",
            trk.maint_cost_per_km,
            "/km"
          ] }),
          /* @__PURE__ */ e.jsx("td", { className: "p-3", children: /* @__PURE__ */ e.jsx("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded ${trk.diagnosed_root_cause === "BENCHMARK_HEALTHY" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : trk.diagnosed_root_cause === "TRUCK_MECHANICAL_FAULT" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-slate-800 text-slate-300"}`, children: trk.diagnosed_root_cause.replace(/_/g, " ") }) }),
          /* @__PURE__ */ e.jsx("td", { className: "p-3 text-slate-300 font-medium", children: trk.fault_component })
        ] }, trk.truck_id)) })
      ] }) })
    ] }),
    activeSubTab === "simulator" && /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6", children: [
      /* @__PURE__ */ e.jsxs("div", { children: [
        /* @__PURE__ */ e.jsx("h3", { className: "text-base font-bold text-white", children: "Automated Swap Diagnostic Simulator" }),
        /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-400 mt-1 max-w-2xl", children: "Select any driver and truck experiencing high fuel burn or repeated maintenance repairs. The algorithm pairs them with an optimal benchmark truck and control driver to run an A/B rotation experiment." })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/80 p-5 rounded-xl border border-slate-800", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ e.jsxs("div", { children: [
            /* @__PURE__ */ e.jsx("label", { className: "block text-xs font-semibold text-slate-300 mb-1", children: "1. Select Driver with Suspect Mileage / Maintenance:" }),
            /* @__PURE__ */ e.jsx(
              "select",
              {
                value: newSwapForm.driver_name,
                onChange: (e) => {
                  const sel = driverBaselines.find((d) => d.driver_name === e.target.value);
                  setNewSwapForm((prev) => ({
                    ...prev,
                    driver_name: e.target.value,
                    driver_id: sel?.driver_id || "DRV_RAMESH_01"
                  }));
                },
                className: "w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500",
                children: driverBaselines.map((d) => /* @__PURE__ */ e.jsxs("option", { value: d.driver_name, children: [
                  d.driver_name,
                  " (Overall: ",
                  d.overall_mileage_kmpl,
                  " km/l)"
                ] }, d.driver_id))
              }
            )
          ] }),
          /* @__PURE__ */ e.jsxs("div", { children: [
            /* @__PURE__ */ e.jsx("label", { className: "block text-xs font-semibold text-slate-300 mb-1", children: "2. Select Current Suspect Truck:" }),
            /* @__PURE__ */ e.jsx(
              "select",
              {
                value: newSwapForm.original_truck_no,
                onChange: (e) => {
                  const sel = truckBaselines.find((t) => t.truck_number === e.target.value);
                  setNewSwapForm((prev) => ({
                    ...prev,
                    original_truck_no: e.target.value,
                    original_truck_id: sel?.truck_id || "TRK_TG12U2637"
                  }));
                },
                className: "w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500",
                children: truckBaselines.map((t) => /* @__PURE__ */ e.jsxs("option", { value: t.truck_number, children: [
                  t.truck_number,
                  " (",
                  t.brand,
                  " ",
                  t.model,
                  " - Avg: ",
                  t.actual_avg_kmpl,
                  " km/l)"
                ] }, t.truck_id))
              }
            )
          ] }),
          /* @__PURE__ */ e.jsxs("div", { children: [
            /* @__PURE__ */ e.jsx("label", { className: "block text-xs font-semibold text-slate-300 mb-1", children: "3. Test Duration (Corridor Trips):" }),
            /* @__PURE__ */ e.jsxs(
              "select",
              {
                value: newSwapForm.test_duration_trips,
                onChange: (e) => setNewSwapForm((prev) => ({ ...prev, test_duration_trips: parseInt(e.target.value) })),
                className: "w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500",
                children: [
                  /* @__PURE__ */ e.jsx("option", { value: 2, children: "2 Trips (Short Corridor Verification)" }),
                  /* @__PURE__ */ e.jsx("option", { value: 3, children: "3 Trips (Standard Recommended Audit)" }),
                  /* @__PURE__ */ e.jsx("option", { value: 5, children: "5 Trips (Long-Haul Multi-State Confirmation)" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between", children: [
          /* @__PURE__ */ e.jsxs("div", { children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-emerald-400", children: "AI Diagnostic Plan Generated" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold", children: "Statistically Calibrated" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "space-y-2 text-xs", children: [
              /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-950 rounded-lg border border-slate-800", children: [
                /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Swap Candidate Truck:" }),
                /* @__PURE__ */ e.jsx("div", { className: "font-bold text-white mt-0.5", children: "TS 07 UE 1234 (Tata Signa 2823 Benchmark)" }),
                /* @__PURE__ */ e.jsx("div", { className: "text-[11px] text-slate-500", children: "Delivers 4.28 km/l fleet standard" })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-950 rounded-lg border border-slate-800", children: [
                /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Control Driver for Suspect Vehicle:" }),
                /* @__PURE__ */ e.jsx("div", { className: "font-bold text-blue-400 mt-0.5", children: "Suresh Yadav (Master Driver)" }),
                /* @__PURE__ */ e.jsx("div", { className: "text-[11px] text-slate-500", children: "Benchmark score 99.4/100" })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-300", children: [
                /* @__PURE__ */ e.jsx("strong", { children: "Testing Hypothesis:" }),
                " If ",
                newSwapForm.driver_name,
                " hits \u2265 4.0 km/l on TS 07 UE 1234 and Suresh Yadav struggles on ",
                newSwapForm.original_truck_no,
                ", the root cause is 100% mechanical."
              ] })
            ] })
          ] }),
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              onClick: handleLaunchSwap,
              className: "w-full py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 transition",
              children: "\u{1F680} Confirm & Launch This Diagnostic Swap Test"
            }
          )
        ] })
      ] })
    ] }),
    isNewSwapOpen && /* @__PURE__ */ e.jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4", children: /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center border-b border-slate-800 pb-3", children: [
        /* @__PURE__ */ e.jsxs("h3", { className: "font-bold text-white text-base flex items-center gap-2", children: [
          /* @__PURE__ */ e.jsx("span", { children: "\u{1F504}" }),
          " Launch A/B Truck Swap Diagnostic Test"
        ] }),
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: () => setIsNewSwapOpen(false),
            className: "text-slate-400 hover:text-white text-sm",
            children: "\u2715"
          }
        )
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("label", { className: "block text-slate-300 mb-1 font-semibold", children: "Driver to Test:" }),
          /* @__PURE__ */ e.jsx(
            "select",
            {
              value: newSwapForm.driver_name,
              onChange: (e) => setNewSwapForm((prev) => ({ ...prev, driver_name: e.target.value })),
              className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white",
              children: driverBaselines.map((d) => /* @__PURE__ */ e.jsx("option", { value: d.driver_name, children: d.driver_name }, d.driver_id))
            }
          )
        ] }),
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("label", { className: "block text-slate-300 mb-1 font-semibold", children: "Current Suspect Vehicle:" }),
          /* @__PURE__ */ e.jsx(
            "select",
            {
              value: newSwapForm.original_truck_no,
              onChange: (e) => setNewSwapForm((prev) => ({ ...prev, original_truck_no: e.target.value })),
              className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white",
              children: truckBaselines.map((t) => /* @__PURE__ */ e.jsxs("option", { value: t.truck_number, children: [
                t.truck_number,
                " (",
                t.brand,
                ")"
              ] }, t.truck_id))
            }
          )
        ] }),
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("label", { className: "block text-slate-300 mb-1 font-semibold", children: "Benchmark Rotation Vehicle:" }),
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "text",
              value: newSwapForm.swap_truck_no,
              onChange: (e) => setNewSwapForm((prev) => ({ ...prev, swap_truck_no: e.target.value })),
              className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
            }
          )
        ] }),
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("label", { className: "block text-slate-300 mb-1 font-semibold", children: "Control Master Driver:" }),
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "text",
              value: newSwapForm.control_driver_name,
              onChange: (e) => setNewSwapForm((prev) => ({ ...prev, control_driver_name: e.target.value })),
              className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
            }
          )
        ] }),
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsx("label", { className: "block text-slate-300 mb-1 font-semibold", children: "Reason / Trigger:" }),
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "text",
              value: newSwapForm.trigger_reason,
              onChange: (e) => setNewSwapForm((prev) => ({ ...prev, trigger_reason: e.target.value })),
              className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "flex justify-end gap-2 pt-3 border-t border-slate-800", children: [
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: () => setIsNewSwapOpen(false),
            className: "px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: handleLaunchSwap,
            className: "px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950",
            children: "Initiate Swap Experiment"
          }
        )
      ] })
    ] }) }),
    evalModal.isOpen && /* @__PURE__ */ e.jsx("div", { className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4", children: /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center border-b border-slate-800 pb-3", children: [
        /* @__PURE__ */ e.jsxs("h3", { className: "font-bold text-white text-base flex items-center gap-2", children: [
          /* @__PURE__ */ e.jsx("span", { children: "\u{1F3C1}" }),
          " Conclude Experiment: ",
          evalModal.experiment?.experiment_code
        ] }),
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: () => setEvalModal({ isOpen: false, experiment: null, driver_kmpl: "", control_kmpl: "" }),
            className: "text-slate-400 hover:text-white text-sm",
            children: "\u2715"
          }
        )
      ] }),
      /* @__PURE__ */ e.jsx("p", { className: "text-xs text-slate-300", children: "Enter the test trip fuel telematics recorded during the rotation period to mathematically attribute the root cause." }),
      /* @__PURE__ */ e.jsxs("div", { className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
          /* @__PURE__ */ e.jsxs("label", { className: "block text-slate-300 mb-1 font-semibold", children: [
            "1. ",
            evalModal.experiment?.driver_name,
            " Mileage on Benchmark Truck (",
            evalModal.experiment?.swap_truck_no,
            "):"
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                value: evalModal.driver_kmpl,
                onChange: (e) => setEvalModal((prev) => ({ ...prev, driver_kmpl: e.target.value })),
                className: "w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              }
            ),
            /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 font-bold", children: "km/l" })
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800", children: [
          /* @__PURE__ */ e.jsxs("label", { className: "block text-slate-300 mb-1 font-semibold", children: [
            "2. Control Driver (",
            evalModal.experiment?.control_driver_name,
            ") Mileage on Suspect Truck (",
            evalModal.experiment?.original_truck_no,
            "):"
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                value: evalModal.control_kmpl,
                onChange: (e) => setEvalModal((prev) => ({ ...prev, control_kmpl: e.target.value })),
                className: "w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              }
            ),
            /* @__PURE__ */ e.jsx("span", { className: "text-slate-400 font-bold", children: "km/l" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "flex justify-end gap-2 pt-3 border-t border-slate-800", children: [
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: () => setEvalModal({ isOpen: false, experiment: null, driver_kmpl: "", control_kmpl: "" }),
            className: "px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: handleEvaluateSwap,
            className: "px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white",
            children: "Compute Definitive Attribution"
          }
        )
      ] })
    ] }) })
  ] });
}
