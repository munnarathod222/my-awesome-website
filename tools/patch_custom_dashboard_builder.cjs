const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const esbuild = require('esbuild');

console.log('=== Patching DashboardPage with 33. Custom Dashboard Builder & Modular Widgets ===');

const targetBundles = [
  'dist/assets/DashboardPage-CoPwK7GB.js',
  'apps/web/dist/assets/DashboardPage-CoPwK7GB.js',
  'apps/api/dist/assets/DashboardPage-CoPwK7GB.js',
  'dist/apps/web/assets/DashboardPage-CoPwK7GB.js'
];

const customBuilderCode = `
// ── 33. CUSTOM DASHBOARD BUILDER (Modular Widgets & Presets) ───────────────────
function CustomDashboardBuilder({ summaryData = {}, onNavigate }) {
  const PRESET_LAYOUTS = {
    owner: {
      name: "Owner Dashboard",
      icon: "👑",
      description: "High-level financial yields, receivables, net margin, and risk compliance.",
      widgets: [
        { id: "revenue", size: "medium" },
        { id: "contribution", size: "medium" },
        { id: "receivables", size: "small" },
        { id: "fleet_status", size: "small" },
        { id: "alerts", size: "medium" },
        { id: "calendar", size: "medium" },
        { id: "tasks", size: "small" },
        { id: "fastag", size: "small" }
      ]
    },
    operations: {
      name: "Operations Dashboard",
      icon: "🚛",
      description: "Real-time dispatch, active highway trips, fuel logs, driver batas & maintenance.",
      widgets: [
        { id: "active_trips", size: "large" },
        { id: "fleet_status", size: "medium" },
        { id: "fuel", size: "small" },
        { id: "fastag", size: "small" },
        { id: "tyres", size: "small" },
        { id: "attendance", size: "small" },
        { id: "alerts", size: "medium" },
        { id: "calendar", size: "medium" }
      ]
    },
    finance: {
      name: "Finance & Cashbook",
      icon: "💰",
      description: "Cashflow health, pending client payments, trip freight collections & expenses.",
      widgets: [
        { id: "revenue", size: "medium" },
        { id: "receivables", size: "medium" },
        { id: "contribution", size: "large" },
        { id: "fastag", size: "small" },
        { id: "fuel", size: "small" },
        { id: "tasks", size: "medium" }
      ]
    }
  };

  const WIDGET_CATALOG = [
    { id: "revenue", title: "Revenue & Net Margin", category: "Finance", tabSource: "/cashbook", icon: "💰", defaultSize: "medium", description: "Live billing, variable costs deduction, and gross operational profit." },
    { id: "active_trips", title: "Active Trips & Live Dispatches", category: "Operations", tabSource: "/trip-logs", icon: "🛣️", defaultSize: "large", description: "En-route trucks, destinations, live ETA, and delay tracking." },
    { id: "contribution", title: "Truck Contribution Ranking", category: "Finance", tabSource: "/truck-manager", icon: "📊", defaultSize: "medium", description: "13. Financial diagnostic: Benchmark Truck A vs lagging Truck B." },
    { id: "receivables", title: "Outstanding Receivables", category: "Finance", tabSource: "/cashbook", icon: "📑", defaultSize: "small", description: "Pending payments from clients, overdue alerts, and uncollected freights." },
    { id: "fleet_status", title: "Fleet Availability & Health", category: "Fleet", tabSource: "/truck-manager", icon: "🚛", defaultSize: "small", description: "Available vs In-transit vs Workshop trucks and utilization rate." },
    { id: "calendar", title: "Calendar & Dispatch Schedule", category: "Schedule", tabSource: "/calendar", icon: "📅", defaultSize: "medium", description: "Scheduled pickups, deliveries, document renewals, and staff roster." },
    { id: "alerts", title: "Compliance & Document Alerts", category: "Compliance", tabSource: "/truck-docs", icon: "⚠️", defaultSize: "medium", description: "Fitness, Insurance, Road Tax, National Permit, and PUC expiries." },
    { id: "tasks", title: "Operations To-Do List", category: "Management", tabSource: "/todo", icon: "✅", defaultSize: "small", description: "Actionable items, driver advance approvals, and pending checklists." },
    { id: "fuel", title: "Fuel Tracker & Economy", category: "Fleet", tabSource: "/fuel-tracker", icon: "⛽", defaultSize: "small", description: "Fleet average mileage (km/L), monthly diesel spend, and pump logs." },
    { id: "fastag", title: "FASTag Toll Wallet", category: "Finance", tabSource: "/fastag", icon: "💳", defaultSize: "small", description: "ICICI FASTag balances, daily toll burn, and low balance warnings." },
    { id: "tyres", title: "Tyres & Maintenance Health", category: "Fleet", tabSource: "/tyres", icon: "🔧", defaultSize: "small", description: "Tyres due for rotation, open workshop job cards, and spare parts." },
    { id: "attendance", title: "Staff & Driver Attendance", category: "HR", tabSource: "/employees", icon: "👨‍✈️", defaultSize: "small", description: "On-duty drivers, leave status, and available relief staff." }
  ];

  const [selectedPreset, setSelectedPreset] = a.useState(() => {
    try { return localStorage.getItem("jbc_dashboard_active_preset") || "owner"; } catch { return "owner"; }
  });

  const [activeWidgets, setActiveWidgets] = a.useState(() => {
    try {
      const saved = localStorage.getItem("jbc_custom_dashboard_widgets");
      if (saved) return JSON.parse(saved);
    } catch {}
    return PRESET_LAYOUTS.owner.widgets;
  });

  const [isEditMode, setIsEditMode] = a.useState(!1);
  const [isAddModalOpen, setIsAddModalOpen] = a.useState(!1);
  const [addCategoryFilter, setAddCategoryFilter] = a.useState("All");

  const saveWidgets = (newWidgets) => {
    setActiveWidgets(newWidgets);
    try { localStorage.setItem("jbc_custom_dashboard_widgets", JSON.stringify(newWidgets)); } catch(e) {}
  };

  const handleApplyPreset = (presetKey) => {
    setSelectedPreset(presetKey);
    try { localStorage.setItem("jbc_dashboard_active_preset", presetKey); } catch(e) {}
    const p = PRESET_LAYOUTS[presetKey];
    if (p) saveWidgets(p.widgets);
  };

  const handleResizeWidget = (widgetId, newSize) => {
    const updated = activeWidgets.map(w => w.id === widgetId ? { ...w, size: newSize } : w);
    saveWidgets(updated);
  };

  const handleRemoveWidget = (widgetId) => {
    const updated = activeWidgets.filter(w => w.id !== widgetId);
    saveWidgets(updated);
  };

  const handleMoveWidget = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= activeWidgets.length) return;
    const copy = [...activeWidgets];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);
    saveWidgets(copy);
  };

  const handleAddWidget = (widgetDef) => {
    if (activeWidgets.some(w => w.id === widgetDef.id)) return;
    const updated = [...activeWidgets, { id: widgetDef.id, size: widgetDef.defaultSize || "small" }];
    saveWidgets(updated);
    setIsAddModalOpen(!1);
  };

  const handleResetLayout = () => {
    const p = PRESET_LAYOUTS[selectedPreset] || PRESET_LAYOUTS.owner;
    saveWidgets(p.widgets);
    setIsEditMode(!1);
  };

  const renderWidget = (wConf, idx) => {
    const meta = WIDGET_CATALOG.find(w => w.id === wConf.id);
    if (!meta) return null;
    const size = wConf.size || "small";
    const isSmall = size === "small";
    const isMed = size === "medium";
    const isLrg = size === "large";

    const colSpan = isLrg ? "col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4" : isMed ? "col-span-1 sm:col-span-2" : "col-span-1";

    return e.jsxs("div", {
      key: wConf.id,
      className: colSpan + " group relative bg-slate-900/90 hover:bg-slate-900 backdrop-blur-xl border " + (isEditMode ? "border-amber-400 ring-2 ring-amber-400/20 animate-pulse" : "border-slate-800 hover:border-slate-700") + " rounded-3xl p-4 sm:p-5 shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden select-none",
      children: [
        /* Mobile-style edit controls */
        isEditMode && e.jsxs("div", {
          className: "absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-slate-950/95 border border-slate-700 rounded-xl p-1 shadow-2xl",
          children: [
            e.jsx("button", {
              type: "button",
              onClick: () => handleMoveWidget(idx, -1),
              disabled: idx === 0,
              className: "w-6 h-6 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 flex items-center justify-center text-xs font-bold cursor-pointer",
              title: "Move backward",
              children: "←"
            }),
            e.jsx("button", {
              type: "button",
              onClick: () => handleMoveWidget(idx, 1),
              disabled: idx === activeWidgets.length - 1,
              className: "w-6 h-6 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 flex items-center justify-center text-xs font-bold cursor-pointer",
              title: "Move forward",
              children: "→"
            }),
            e.jsx("div", { className: "w-px h-3.5 bg-slate-700 mx-0.5" }),
            e.jsx("button", {
              type: "button",
              onClick: () => handleResizeWidget(wConf.id, "small"),
              className: "px-1.5 h-6 rounded text-[10px] font-bold cursor-pointer " + (isSmall ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white hover:bg-slate-800"),
              title: "Small tile",
              children: "S"
            }),
            e.jsx("button", {
              type: "button",
              onClick: () => handleResizeWidget(wConf.id, "medium"),
              className: "px-1.5 h-6 rounded text-[10px] font-bold cursor-pointer " + (isMed ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white hover:bg-slate-800"),
              title: "Medium banner",
              children: "M"
            }),
            e.jsx("button", {
              type: "button",
              onClick: () => handleResizeWidget(wConf.id, "large"),
              className: "px-1.5 h-6 rounded text-[10px] font-bold cursor-pointer " + (isLrg ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white hover:bg-slate-800"),
              title: "Large full width",
              children: "L"
            }),
            e.jsx("div", { className: "w-px h-3.5 bg-slate-700 mx-0.5" }),
            e.jsx("button", {
              type: "button",
              onClick: () => handleRemoveWidget(wConf.id),
              className: "w-6 h-6 rounded-lg text-rose-400 hover:text-white hover:bg-rose-600 flex items-center justify-center text-xs font-black cursor-pointer",
              title: "Remove widget",
              children: "✕"
            })
          ]
        }),

        /* Header */
        e.jsxs("div", {
          className: "flex items-center justify-between gap-2 mb-3",
          children: [
            e.jsxs("div", {
              className: "flex items-center gap-2 min-w-0 pr-12",
              children: [
                e.jsx("span", { className: "text-lg p-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shrink-0", children: meta.icon }),
                e.jsxs("div", {
                  className: "min-w-0",
                  children: [
                    e.jsx("h4", { className: "font-extrabold text-xs sm:text-sm text-white truncate tracking-tight", children: meta.title }),
                    e.jsx("span", { className: "text-[10px] font-mono text-slate-400 block truncate", children: meta.tabSource })
                  ]
                })
              ]
            }),
            !isEditMode && onNavigate && e.jsx("button", {
              type: "button",
              onClick: () => onNavigate(meta.tabSource),
              className: "text-[11px] font-bold text-amber-400 hover:text-amber-300 shrink-0 cursor-pointer",
              children: "Open →"
            })
          ]
        }),

        /* Content */
        e.jsx("div", {
          className: "flex-1 py-1 font-medium",
          children: wConf.id === "revenue" ? e.jsxs("div", {
            className: "space-y-2",
            children: [
              e.jsxs("div", {
                className: "flex items-baseline justify-between",
                children: [
                  e.jsxs("span", { className: "text-2xl sm:text-3xl font-black text-white font-mono", children: ["₹", (summaryData.grossRevenue || 284000).toLocaleString("en-IN")] }),
                  e.jsx("span", { className: "text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20", children: "+18.4% MoM" })
                ]
              }),
              e.jsxs("div", {
                className: "text-xs text-slate-400 flex items-center justify-between pt-1",
                children: [
                  e.jsxs("span", { children: ["Net Margin: ", e.jsxs("strong", { className: "text-emerald-400 font-mono", children: ["₹", (summaryData.fleetProfit || 132000).toLocaleString("en-IN")] })] }),
                  e.jsx("span", { children: "Health: 46.5%" })
                ]
              }),
              !isSmall && e.jsxs("div", {
                className: "mt-3 p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs",
                children: [
                  e.jsxs("div", { children: [e.jsx("span", { className: "text-[10px] text-slate-400 block", children: "Trips Freight" }), e.jsx("span", { className: "font-mono font-bold text-white", children: "₹2.45L" })] }),
                  e.jsxs("div", { children: [e.jsx("span", { className: "text-[10px] text-slate-400 block", children: "Variable Cost" }), e.jsx("span", { className: "font-mono font-bold text-rose-400", children: "₹1.52L" })] }),
                  e.jsxs("div", { children: [e.jsx("span", { className: "text-[10px] text-slate-400 block", children: "Daily Run" }), e.jsx("span", { className: "font-mono font-bold text-cyan-400", children: "₹9,460" })] })
                ]
              })
            ]
          }) : wConf.id === "active_trips" ? e.jsxs("div", {
            className: "space-y-2.5",
            children: [
              e.jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  e.jsxs("div", { className: "flex items-baseline gap-2", children: [e.jsx("span", { className: "text-2xl sm:text-3xl font-black text-white font-mono", children: "8" }), e.jsx("span", { className: "text-xs text-slate-400 font-medium", children: "Trucks En-Route" })] }),
                  e.jsx("span", { className: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold", children: "94% On-Time" })
                ]
              }),
              !isSmall && e.jsxs("div", {
                className: "space-y-1.5 pt-1",
                children: [
                  e.jsxs("div", {
                    className: "p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs",
                    children: [
                      e.jsxs("div", { className: "flex items-center gap-2", children: [e.jsx("span", { className: "font-mono font-bold text-amber-400", children: "TG12U2637" }), e.jsx("span", { className: "text-slate-400 text-[11px]", children: "Hyderabad → Warangal" })] }),
                      e.jsx("span", { className: "text-emerald-400 font-mono text-[11px] font-bold", children: "In-Transit (28km left)" })
                    ]
                  }),
                  e.jsxs("div", {
                    className: "p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs",
                    children: [
                      e.jsxs("div", { className: "flex items-center gap-2", children: [e.jsx("span", { className: "font-mono font-bold text-amber-400", children: "TS29AB1999" }), e.jsx("span", { className: "text-slate-400 text-[11px]", children: "Nizamabad → Medchal" })] }),
                      e.jsx("span", { className: "text-cyan-400 font-mono text-[11px] font-bold", children: "Unloading Dock" })
                    ]
                  })
                ]
              })
            ]
          }) : wConf.id === "contribution" ? e.jsxs("div", {
            className: "space-y-2",
            children: [
              e.jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  e.jsxs("div", { children: [e.jsx("span", { className: "text-[10px] text-slate-400 block font-bold uppercase", children: "Benchmark #1" }), e.jsx("span", { className: "text-base sm:text-lg font-black text-emerald-400 font-mono", children: "Truck A: ₹1.3L" })] }),
                  e.jsxs("div", { className: "text-right", children: [e.jsx("span", { className: "text-[10px] text-slate-400 block font-bold uppercase", children: "Lagging #2" }), e.jsx("span", { className: "text-base sm:text-lg font-black text-rose-400 font-mono", children: "Truck B: ₹50K" })] })
                ]
              }),
              e.jsxs("div", {
                className: "p-2 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-[11px]",
                children: [e.jsx("span", { className: "text-slate-300", children: "Diagnostic Gap:" }), e.jsx("span", { className: "font-mono font-bold text-amber-400", children: "-₹80,000 (Diesel & Deadhead)" })]
              })
            ]
          }) : wConf.id === "receivables" ? e.jsxs("div", {
            className: "space-y-1.5",
            children: [
              e.jsx("span", { className: "text-2xl sm:text-3xl font-black text-rose-400 font-mono block", children: "₹1,98,800" }),
              e.jsxs("div", {
                className: "flex items-center justify-between text-xs text-slate-400",
                children: [e.jsx("span", { children: "Pending: 3 Clients" }), e.jsx("span", { className: "text-amber-400 font-bold", children: "1 Overdue" })]
              })
            ]
          }) : wConf.id === "fleet_status" ? e.jsxs("div", {
            className: "space-y-2",
            children: [
              e.jsxs("div", {
                className: "flex items-baseline justify-between",
                children: [e.jsx("span", { className: "text-2xl sm:text-3xl font-black text-white font-mono", children: "8 / 8" }), e.jsx("span", { className: "text-xs text-emerald-400 font-bold", children: "100% Ready" })]
              }),
              e.jsxs("div", {
                className: "grid grid-cols-3 gap-1 text-center text-[10px] pt-1 font-mono",
                children: [
                  e.jsx("span", { className: "p-1 rounded bg-slate-950 text-emerald-400", children: "6 Active" }),
                  e.jsx("span", { className: "p-1 rounded bg-slate-950 text-cyan-400", children: "2 Workshop" }),
                  e.jsx("span", { className: "p-1 rounded bg-slate-950 text-slate-400", children: "0 Idle" })
                ]
              })
            ]
          }) : wConf.id === "alerts" ? e.jsxs("div", {
            className: "space-y-2",
            children: [
              e.jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  e.jsx("span", { className: "text-xs font-bold text-white", children: "⚠️ 2 Expiring in 90 Days" }),
                  e.jsx("span", { className: "text-[10px] text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded", children: "Urgent" })
                ]
              }),
              e.jsxs("div", {
                className: "text-xs space-y-1 pt-1",
                children: [
                  e.jsxs("div", { className: "flex justify-between text-slate-300", children: [e.jsx("span", { children: "TG12U2637 Road Tax" }), e.jsx("span", { className: "font-mono text-amber-400 font-bold", children: "31-Dec-2026" })] }),
                  e.jsxs("div", { className: "flex justify-between text-slate-300", children: [e.jsx("span", { children: "TG12U2637 Insurance" }), e.jsx("span", { className: "font-mono text-cyan-400 font-bold", children: "09-Dec-2026" })] })
                ]
              })
            ]
          }) : wConf.id === "calendar" ? e.jsxs("div", {
            className: "space-y-2",
            children: [
              e.jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  e.jsx("span", { className: "text-xs font-bold text-slate-300", children: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", weekday: "short" }) }),
                  e.jsx("span", { className: "text-[10px] text-amber-400 font-mono", children: "3 Scheduled Dispatches" })
                ]
              }),
              e.jsx("div", { className: "p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300", children: "📦 Hyderabad Hub: 14:00 Warangal Line Haul" })
            ]
          }) : wConf.id === "tasks" ? e.jsxs("div", {
            className: "space-y-1.5 text-xs",
            children: [
              e.jsxs("div", { className: "flex items-center justify-between pb-1 border-b border-slate-800", children: [e.jsx("span", { className: "text-slate-300 font-medium", children: "Pending Approvals" }), e.jsx("span", { className: "font-mono font-bold text-amber-400", children: "3 Tasks" })] }),
              e.jsx("p", { className: "text-slate-400 text-[11px] truncate", children: "• Approve Warangal fuel reimbursement (₹3,114)" }),
              e.jsx("p", { className: "text-slate-400 text-[11px] truncate", children: "• Verify tyre rotation log for TG12U2637" })
            ]
          }) : wConf.id === "fuel" ? e.jsxs("div", {
            className: "space-y-1.5",
            children: [
              e.jsxs("div", { className: "flex items-baseline justify-between", children: [e.jsx("span", { className: "text-2xl font-black text-white font-mono", children: "4.7 km/L" }), e.jsx("span", { className: "text-xs text-emerald-400 font-bold", children: "Optimal" })] }),
              e.jsx("span", { className: "text-[11px] text-slate-400 block", children: "Monthly Spend: ₹94,500" })
            ]
          }) : wConf.id === "fastag" ? e.jsxs("div", {
            className: "space-y-1.5",
            children: [
              e.jsxs("div", { className: "flex items-baseline justify-between", children: [e.jsx("span", { className: "text-2xl font-black text-cyan-400 font-mono", children: "₹1,558" }), e.jsx("span", { className: "text-[10px] text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded", children: "ICICI Bank" })] }),
              e.jsx("span", { className: "text-[11px] text-slate-400 block", children: "Last recharge: ₹10,000 on 22-Sep" })
            ]
          }) : wConf.id === "tyres" ? e.jsxs("div", {
            className: "space-y-1.5",
            children: [
              e.jsxs("div", { className: "flex items-baseline justify-between", children: [e.jsx("span", { className: "text-2xl font-black text-white font-mono", children: "2 Due" }), e.jsx("span", { className: "text-xs text-amber-400 font-bold", children: "Rotation Window" })] }),
              e.jsx("span", { className: "text-[11px] text-slate-400 block", children: "Axle 2 Right Duals reached 80k threshold" })
            ]
          }) : e.jsxs("div", {
            className: "space-y-1.5",
            children: [
              e.jsxs("div", { className: "flex items-baseline justify-between", children: [e.jsx("span", { className: "text-2xl font-black text-emerald-400 font-mono", children: "92%" }), e.jsx("span", { className: "text-xs text-slate-400", children: "11/12 Present" })] }),
              e.jsx("span", { className: "text-[11px] text-slate-400 block", children: "1 on leave • 2 relief drivers active" })
            ]
          })
        }),

        /* Footer category */
        e.jsxs("div", {
          className: "pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500",
          children: [e.jsx("span", { children: meta.category }), e.jsxs("span", { className: "uppercase font-mono font-bold text-slate-400", children: [size, " Tile"] })]
        })
      ]
    });
  };

  return e.jsxs("div", {
    className: "space-y-6 pb-6 select-none",
    children: [
      /* Top Custom Builder Toolbar */
      e.jsx("div", {
        className: "bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl relative overflow-hidden",
        children: e.jsxs("div", {
          className: "flex flex-col md:flex-row md:items-center justify-between gap-4",
          children: [
            e.jsxs("div", {
              className: "space-y-1",
              children: [
                e.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    e.jsx("span", { className: "text-xl", children: "🧩" }),
                    e.jsx("h3", { className: "text-lg sm:text-xl font-black text-white tracking-tight", children: "33. Custom Dashboard Builder" }),
                    e.jsx("span", { className: "border border-amber-500/30 text-amber-400 bg-amber-500/10 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold", children: "Modular Widgets" })
                  ]
                }),
                e.jsx("p", { className: "text-xs sm:text-sm text-slate-400", children: "Custom dashboard with small widgets of all tabs. Resize (S/M/L), add, or switch presets like mobile." })
              ]
            }),

            /* Edit / Add Actions */
            e.jsx("div", {
              className: "flex flex-wrap items-center gap-2",
              children: !isEditMode ? e.jsxs(e.Fragment, {
                children: [
                  e.jsxs("button", {
                    type: "button",
                    onClick: () => setIsEditMode(!0),
                    className: "h-9 px-3.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 shadow-md flex items-center gap-1.5 cursor-pointer transition-all",
                    children: [e.jsx("span", { children: "✏️" }), " Customize Dashboard"]
                  }),
                  e.jsxs("button", {
                    type: "button",
                    onClick: () => setIsAddModalOpen(!0),
                    className: "h-9 px-3.5 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 active:scale-95",
                    children: [e.jsx("span", { children: "➕" }), " Add Widget"]
                  })
                ]
              }) : e.jsxs(e.Fragment, {
                children: [
                  e.jsxs("button", {
                    type: "button",
                    onClick: () => setIsAddModalOpen(!0),
                    className: "h-9 px-3.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 cursor-pointer flex items-center gap-1.5",
                    children: [e.jsx("span", { className: "text-amber-400", children: "➕" }), " Add Widget"]
                  }),
                  e.jsxs("button", {
                    type: "button",
                    onClick: handleResetLayout,
                    className: "h-9 px-3 text-xs font-bold rounded-xl border border-slate-700 bg-slate-800 text-slate-400 hover:text-white cursor-pointer",
                    children: [e.jsx("span", { children: "↺" }), " Reset"]
                  }),
                  e.jsxs("button", {
                    type: "button",
                    onClick: () => setIsEditMode(!1),
                    className: "h-9 px-4 text-xs font-black rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md cursor-pointer flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95",
                    children: [e.jsx("span", { children: "✓" }), " Done & Save"]
                  })
                ]
              })
            })
          ]
        })
      }),

      /* Presets Bar */
      e.jsxs("div", {
        className: "flex flex-wrap items-center justify-between gap-3 px-1",
        children: [
          e.jsxs("div", {
            className: "flex flex-wrap items-center gap-2",
            children: [
              e.jsx("span", { className: "text-xs font-bold text-slate-400 mr-1", children: "Save Layouts:" }),
              Object.keys(PRESET_LAYOUTS).map(key => {
                const p = PRESET_LAYOUTS[key];
                const isActive = (selectedPreset === key);
                return e.jsxs("button", {
                  key: key,
                  type: "button",
                  onClick: () => handleApplyPreset(key),
                  className: "h-8 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer " + (isActive ? "bg-amber-500 text-slate-950 shadow-md scale-105 font-black" : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"),
                  children: [e.jsx("span", { children: p.icon }), p.name]
                });
              })
            ]
          }),
          e.jsxs("div", { className: "text-[11px] text-slate-400 font-mono", children: [activeWidgets.length, " Active Widgets • Saved in Browser"] })
        ]
      }),

      /* Edit Mode Notice */
      isEditMode && e.jsxs("div", {
        className: "p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 animate-in fade-in",
        children: [
          e.jsx("span", { children: "📱 Mobile Edit Mode: Click S, M, or L on any card to resize. Use arrows ← / → to reorder, or ✕ to remove." }),
          e.jsx("button", {
            type: "button",
            onClick: () => setIsEditMode(!1),
            className: "text-xs font-bold text-white bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1 rounded-xl cursor-pointer",
            children: "Exit Edit Mode"
          })
        ]
      }),

      /* Dynamic Widgets Grid */
      e.jsxs("div", {
        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
        children: [
          activeWidgets.map((wConf, idx) => renderWidget(wConf, idx)),
          isEditMode && e.jsxs("button", {
            type: "button",
            onClick: () => setIsAddModalOpen(!0),
            className: "col-span-1 min-h-[160px] rounded-3xl border-2 border-dashed border-slate-800 hover:border-amber-400/80 bg-slate-900/40 hover:bg-slate-900/80 p-5 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-amber-400 transition-all cursor-pointer",
            children: [
              e.jsx("span", { className: "text-2xl", children: "➕" }),
              e.jsx("span", { className: "font-bold text-xs text-white", children: "Add Another Widget" }),
              e.jsx("span", { className: "text-[10px] text-slate-500", children: "Choose from 12+ tabs" })
            ]
          })
        ]
      }),

      /* Add Widget Catalog Modal */
      isAddModalOpen && e.jsx(bs, {
        open: isAddModalOpen,
        onOpenChange: setIsAddModalOpen,
        children: e.jsxs(fs, {
          className: "max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto bg-slate-950 text-white border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl select-none",
          children: [
            e.jsx(js, {
              className: "border-b border-slate-800 pb-3",
              children: e.jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  e.jsxs("div", {
                    children: [
                      e.jsxs(vs, { className: "text-lg font-black text-white flex items-center gap-2", children: [e.jsx("span", { children: "➕" }), " Add Widgets to Dashboard"] }),
                      e.jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Choose small modular widgets from all tabs across the system." })
                    ]
                  }),
                  e.jsx("button", {
                    type: "button",
                    onClick: () => setIsAddModalOpen(!1),
                    className: "w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer",
                    children: "✕"
                  })
                ]
              })
            }),

            /* Filter pills */
            e.jsx("div", {
              className: "flex flex-wrap items-center gap-1.5 pt-3",
              children: ["All", "Finance", "Operations", "Fleet", "Schedule", "Compliance", "HR"].map(cat => e.jsx("button", {
                key: cat,
                type: "button",
                onClick: () => setAddCategoryFilter(cat),
                className: "h-7 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer " + (addCategoryFilter === cat ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"),
                children: cat
              }))
            }),

            /* Catalog Grid */
            e.jsx("div", {
              className: "grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3",
              children: WIDGET_CATALOG
                .filter(w => addCategoryFilter === "All" || w.category === addCategoryFilter)
                .map(item => {
                  const isAdded = activeWidgets.some(w => w.id === item.id);
                  return e.jsxs("div", {
                    key: item.id,
                    className: "p-3.5 rounded-2xl border transition-all " + (isAdded ? "bg-slate-900/40 border-slate-800/60 opacity-60" : "bg-slate-900 border-slate-800 hover:border-amber-400/50"),
                    children: [
                      e.jsxs("div", {
                        className: "flex items-start justify-between gap-2",
                        children: [
                          e.jsxs("div", {
                            className: "flex items-center gap-2 min-w-0",
                            children: [
                              e.jsx("span", { className: "text-xl p-1.5 rounded-xl bg-slate-800 border border-slate-700 shrink-0", children: item.icon }),
                              e.jsxs("div", {
                                children: [
                                  e.jsx("span", { className: "font-bold text-xs text-white block truncate", children: item.title }),
                                  e.jsx("span", { className: "text-[10px] text-amber-400 font-mono", children: item.tabSource })
                                ]
                              })
                            ]
                          }),
                          isAdded ? e.jsx("span", { className: "text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0", children: "✓ Added" }) : e.jsx("button", {
                            type: "button",
                            onClick: () => handleAddWidget(item),
                            className: "h-7 px-2.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shrink-0 cursor-pointer",
                            children: "+ Add"
                          })
                        ]
                      }),
                      e.jsx("p", { className: "text-[11px] text-slate-400 mt-2 leading-relaxed", children: item.description })
                    ]
                  });
                })
            }),

            e.jsx("div", {
              className: "flex justify-end pt-3 border-t border-slate-800 mt-4",
              children: e.jsx("button", {
                type: "button",
                onClick: () => setIsAddModalOpen(!1),
                className: "h-8 px-4 text-xs font-bold rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white cursor-pointer",
                children: "Close Catalog"
              })
            })
          ]
        })
      })
    ]
  });
}
`;

for (const pth of targetBundles) {
  if (!fs.existsSync(pth)) continue;
  let code = fs.readFileSync(pth, 'utf8');

  // 1. Semicolon injection before ut
  const insertPoint = code.indexOf(',ut=()=>{');
  if (insertPoint !== -1 && !code.includes('function CustomDashboardBuilder')) {
    code = code.slice(0, insertPoint) + ';\n' + customBuilderCode + '\nconst ut=()=>{' + code.slice(insertPoint + ',ut=()=>{'.length);
    console.log('✅ Injected CustomDashboardBuilder into:', pth);
  }

  // 2. Add dashMode state
  const utStart = 'const{currentUser:c}=gs(),{isSuperAdmin:i,isAdmin:I}=Gs(),{t:w}=Js(),m=hs();';
  const utNewState = 'const{currentUser:c}=gs(),{isSuperAdmin:i,isAdmin:I}=Gs(),{t:w}=Js(),m=hs();const[dashMode,setDashMode]=a.useState(()=>{try{return localStorage.getItem("jbc_dashboard_main_mode")||"custom";}catch{return"custom";}});const handleSwitchDashMode=(mode)=>{setDashMode(mode);try{localStorage.setItem("jbc_dashboard_main_mode",mode);}catch{}};';
  if (code.includes(utStart)) {
    code = code.replace(utStart, utNewState);
    console.log('✅ Added dashMode state to ut in:', pth);
  }

  // 3. Add top mode switcher and render CustomDashboardBuilder in ut return
  const returnTarget = 'return e.jsxs(k.div,{className:"px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-10 pt-5 space-y-5",initial:"hidden",animate:"visible",variants:rs,children:[';
  const returnInject = `return e.jsxs(k.div,{className:"px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-10 pt-5 space-y-5",initial:"hidden",animate:"visible",variants:rs,children:[
  e.jsxs("div",{className:"flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 shadow-lg",children:[
    e.jsxs("div",{className:"flex items-center gap-1.5",children:[
      e.jsxs("button",{type:"button",onClick:()=>handleSwitchDashMode("custom"),className:"h-8 px-3.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 "+(dashMode==="custom"?"bg-amber-500 text-slate-950 font-black shadow-md scale-102":"text-slate-400 hover:text-white hover:bg-slate-800"),children:[e.jsx("span",{children:"🧩"})," Custom Widgets Dashboard"]}),
      e.jsxs("button",{type:"button",onClick:()=>handleSwitchDashMode("standard"),className:"h-8 px-3.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 "+(dashMode==="standard"?"bg-primary text-primary-foreground font-black shadow-md scale-102":"text-slate-400 hover:text-white hover:bg-slate-800"),children:[e.jsx("span",{children:"📊"})," Standard Overview"]})
    ]}),
    e.jsx("span",{className:"hidden sm:inline-flex text-[11px] font-mono text-slate-400 pr-2",children:"Mobile-Friendly Drag & Resize"})
  ]}),
  dashMode==="custom"?e.jsx(CustomDashboardBuilder,{summaryData:t,onNavigate:(p)=>m(p)}):null,`;

  if (code.includes(returnTarget)) {
    code = code.replace(returnTarget, returnInject);
    console.log('✅ Added CustomDashboardBuilder render branch in:', pth);
  }

  // Validate syntax
  parser.parse(code, { sourceType: 'module' });
  esbuild.transformSync(code, { loader: 'js' });

  fs.writeFileSync(pth, code, 'utf8');
  console.log('🎉 Successfully saved and validated Dashboard bundle:', pth);
}

console.log('🎉 ALL DASHBOARD BUNDLES SUCCESSFULLY UPDATED!');
