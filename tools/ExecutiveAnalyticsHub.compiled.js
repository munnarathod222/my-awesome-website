

function ExecutiveAnalyticsHub() {
  const jsx = e.jsx;
  const jsxs = e.jsxs;
  const Fragment = c.Fragment;
  const [selectedRange, setSelectedRange] = c.useState("30D");
  const [startDate, setStartDate] = c.useState("2024-03-01");
  const [endDate, setEndDate] = c.useState("2024-03-31");
  const [viewType, setViewType] = c.useState("Monthly View");
  const [selectedClient, setSelectedClient] = c.useState("all");
  const [searchQuery, setSearchQuery] = c.useState("");
  const [activeTooltipDay, setActiveTooltipDay] = c.useState(18);
  const clientsList = [
    { id: "all", name: "All Clients (Fleet Wide)" },
    { id: "cli_ultratech", name: "UltraTech Cement Ltd" },
    { id: "cli_amazon", name: "Amazon India Fulfillment" },
    { id: "cli_reliance", name: "Reliance Logistics & Retail" },
    { id: "cli_tata", name: "Tata Steel Tubes Division" },
    { id: "cli_spot", name: "Ad-hoc Spot Market Loads" }
  ];
  const tripVolumeData = [
    12,
    18,
    14,
    22,
    28,
    19,
    15,
    24,
    31,
    26,
    18,
    29,
    35,
    27,
    21,
    33,
    38,
    42,
    34,
    28,
    22,
    19,
    27,
    31,
    25,
    18,
    23,
    29,
    32,
    20,
    16
  ];
  return /* @__PURE__ */ e.jsxs("div", { className: "space-y-6 select-none animate-in fade-in duration-300 pb-12 font-sans text-slate-100", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col xl:flex-row xl:items-center justify-between gap-4", children: [
      /* @__PURE__ */ e.jsxs("div", { children: [
        /* @__PURE__ */ e.jsxs("h1", { className: "text-3xl font-black tracking-tight text-white flex items-center gap-3", children: [
          /* @__PURE__ */ e.jsx("span", { children: "Analytics Hub" }),
          /* @__PURE__ */ e.jsx("span", { className: "text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", children: "Live Fleet Command" })
        ] }),
        /* @__PURE__ */ e.jsx("p", { className: "text-sm text-slate-400 mt-1", children: "Financial and operational performance overview for your logistics business." })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "relative min-w-[260px] sm:min-w-[300px]", children: [
          /* @__PURE__ */ e.jsx("span", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm", children: "\u{1F50D}" }),
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "text",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              placeholder: "Search trips, drivers, vehicles...",
              className: "w-full pl-9 pr-14 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition shadow-inner"
            }
          ),
          /* @__PURE__ */ e.jsx("span", { className: "absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none", children: /* @__PURE__ */ e.jsx("kbd", { className: "px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded", children: "\u2318K" }) })
        ] }),
        /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            onClick: () => alert("3 Active Fleet Alerts: 1 vehicle maintenance due, 1 license renewal, 1 fuel telematics anomaly."),
            className: "relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition cursor-pointer",
            children: [
              /* @__PURE__ */ e.jsx("span", { children: "\u{1F514}" }),
              /* @__PURE__ */ e.jsx("span", { className: "absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center shadow-xs", children: "3" })
            ]
          }
        ),
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5 pl-1 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-xl", children: [
          /* @__PURE__ */ e.jsx("div", { className: "w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs", children: "JB" }),
          /* @__PURE__ */ e.jsxs("div", { className: "text-left hidden sm:block", children: [
            /* @__PURE__ */ e.jsx("div", { className: "text-xs font-bold text-white leading-tight", children: "John B." }),
            /* @__PURE__ */ e.jsx("div", { className: "text-[10px] text-slate-400 leading-tight", children: "Fleet Manager" })
          ] })
        ] }),
        /* @__PURE__ */ e.jsx("div", { className: "relative", children: /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              const text = "Logistics Executive Report generated for March 2024. Revenue: Rs. 2,229,400 | Net Profit: Rs. 166,870.44 | Trips: 314";
              navigator.clipboard.writeText(text);
              alert("Executive Analytics Summary copied to clipboard & downloaded!");
            },
            className: "px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer",
            children: [
              /* @__PURE__ */ e.jsx("span", { children: "\u{1F4E5}" }),
              /* @__PURE__ */ e.jsx("span", { children: "Export Report" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] opacity-70", children: "\u25BC" })
            ]
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 px-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase text-slate-500", children: "START" }),
          /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "\u{1F4C5}" }),
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "date",
              value: startDate,
              onChange: (e) => setStartDate(e.target.value),
              className: "bg-transparent text-white font-medium text-xs focus:outline-hidden cursor-pointer"
            }
          )
        ] }),
        /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 font-bold", children: "\u2794" }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase text-slate-500", children: "END" }),
          /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "\u{1F4C5}" }),
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "date",
              value: endDate,
              onChange: (e) => setEndDate(e.target.value),
              className: "bg-transparent text-white font-medium text-xs focus:outline-hidden cursor-pointer"
            }
          )
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase text-slate-500", children: "VIEW" }),
          /* @__PURE__ */ e.jsxs(
            "select",
            {
              value: viewType,
              onChange: (e) => setViewType(e.target.value),
              className: "bg-transparent text-white font-semibold text-xs focus:outline-hidden cursor-pointer",
              children: [
                /* @__PURE__ */ e.jsx("option", { value: "Daily View", className: "bg-slate-900", children: "Daily View" }),
                /* @__PURE__ */ e.jsx("option", { value: "Weekly View", className: "bg-slate-900", children: "Weekly View" }),
                /* @__PURE__ */ e.jsx("option", { value: "Monthly View", className: "bg-slate-900", children: "Monthly View" }),
                /* @__PURE__ */ e.jsx("option", { value: "Quarterly View", className: "bg-slate-900", children: "Quarterly View" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-[10px] font-bold uppercase text-emerald-400", children: "CLIENT" }),
          /* @__PURE__ */ e.jsx(
            "select",
            {
              value: selectedClient,
              onChange: (e) => setSelectedClient(e.target.value),
              className: "bg-transparent text-white font-semibold text-xs focus:outline-hidden cursor-pointer max-w-[180px] truncate",
              children: clientsList.map((c) => /* @__PURE__ */ e.jsx("option", { value: c.id, className: "bg-slate-900", children: c.name }, c.id))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ e.jsx("div", { className: "bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1", children: ["7D", "30D", "3M", "6M", "1Y", "Custom"].map((pill) => /* @__PURE__ */ e.jsx(
          "button",
          {
            type: "button",
            onClick: () => setSelectedRange(pill),
            className: `px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${selectedRange === pill ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white hover:bg-slate-800/60"}`,
            children: pill
          },
          pill
        )) }),
        /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              setSelectedRange("30D");
              setStartDate("2024-03-01");
              setEndDate("2024-03-31");
              setSelectedClient("all");
            },
            className: "px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer",
            children: [
              /* @__PURE__ */ e.jsx("span", { children: "\u{1F504}" }),
              " Reset"
            ]
          }
        ),
        /* @__PURE__ */ e.jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              alert(`Filters Applied: Range ${selectedRange} (${startDate} to ${endDate}) for Client: ${clientsList.find((c) => c.id === selectedClient)?.name}`);
            },
            className: "px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer",
            children: [
              /* @__PURE__ */ e.jsx("span", { children: "\u26A1" }),
              " Apply Filters"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-emerald-500/30 transition relative overflow-hidden group", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ e.jsx("div", { className: "w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-sm font-black", children: "\u20B9" }),
            /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-slate-400", children: "Total Revenue" })
          ] }),
          /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 hover:text-slate-400 cursor-pointer text-xs", children: "\xB7\xB7\xB7" })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
          /* @__PURE__ */ e.jsxs("div", { children: [
            /* @__PURE__ */ e.jsx("div", { className: "text-2xl font-black text-white tracking-tight", children: "\u20B92,229,400" }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1", children: [
              /* @__PURE__ */ e.jsx("span", { children: "\u2197 +18.4%" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
            ] })
          ] }),
          /* @__PURE__ */ e.jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
            /* @__PURE__ */ e.jsx(
              "path",
              {
                d: "M0,28 Q15,35 30,22 T60,18 T85,8 T100,5",
                fill: "none",
                stroke: "#10b981",
                strokeWidth: "2.5",
                strokeLinecap: "round"
              }
            ),
            /* @__PURE__ */ e.jsx("circle", { cx: "100", cy: "5", r: "3", fill: "#10b981" })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-rose-500/30 transition relative overflow-hidden group", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ e.jsx("div", { className: "w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center text-sm font-black", children: "\u{1F4B3}" }),
            /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-slate-400", children: "Total Expenses" })
          ] }),
          /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 hover:text-slate-400 cursor-pointer text-xs", children: "\xB7\xB7\xB7" })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
          /* @__PURE__ */ e.jsxs("div", { children: [
            /* @__PURE__ */ e.jsx("div", { className: "text-2xl font-black text-white tracking-tight", children: "\u20B92,062,529.56" }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1", children: [
              /* @__PURE__ */ e.jsx("span", { children: "\u2198 -6.2%" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
            ] })
          ] }),
          /* @__PURE__ */ e.jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
            /* @__PURE__ */ e.jsx(
              "path",
              {
                d: "M0,15 Q20,10 40,25 T70,18 T90,30 T100,28",
                fill: "none",
                stroke: "#f43f5e",
                strokeWidth: "2.5",
                strokeLinecap: "round"
              }
            ),
            /* @__PURE__ */ e.jsx("circle", { cx: "100", cy: "28", r: "3", fill: "#f43f5e" })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-cyan-500/30 transition relative overflow-hidden group", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ e.jsx("div", { className: "w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-sm font-black", children: "\u{1F4CA}" }),
            /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-slate-400", children: "Net Profit" })
          ] }),
          /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 hover:text-slate-400 cursor-pointer text-xs", children: "\xB7\xB7\xB7" })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
          /* @__PURE__ */ e.jsxs("div", { children: [
            /* @__PURE__ */ e.jsx("div", { className: "text-2xl font-black text-white tracking-tight", children: "\u20B9166,870.44" }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] font-bold text-cyan-400 flex items-center gap-1 mt-1", children: [
              /* @__PURE__ */ e.jsx("span", { children: "\u2197 +42.7%" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
            ] })
          ] }),
          /* @__PURE__ */ e.jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
            /* @__PURE__ */ e.jsx(
              "path",
              {
                d: "M0,32 Q25,30 45,22 T75,15 T90,8 T100,4",
                fill: "none",
                stroke: "#06b6d4",
                strokeWidth: "2.5",
                strokeLinecap: "round"
              }
            ),
            /* @__PURE__ */ e.jsx("circle", { cx: "100", cy: "4", r: "3", fill: "#06b6d4" })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-purple-500/30 transition relative overflow-hidden group", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ e.jsx("div", { className: "w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center text-sm font-black", children: "%" }),
            /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-slate-400", children: "Profit Margin" })
          ] }),
          /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 hover:text-slate-400 cursor-pointer text-xs", children: "\xB7\xB7\xB7" })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
          /* @__PURE__ */ e.jsxs("div", { children: [
            /* @__PURE__ */ e.jsx("div", { className: "text-2xl font-black text-white tracking-tight", children: "7.5%" }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] font-bold text-purple-400 flex items-center gap-1 mt-1", children: [
              /* @__PURE__ */ e.jsx("span", { children: "\u2197 +2.1%" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
            ] })
          ] }),
          /* @__PURE__ */ e.jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
            /* @__PURE__ */ e.jsx(
              "path",
              {
                d: "M0,28 Q30,22 55,20 T80,12 T100,8",
                fill: "none",
                stroke: "#a855f7",
                strokeWidth: "2.5",
                strokeLinecap: "round"
              }
            ),
            /* @__PURE__ */ e.jsx("circle", { cx: "100", cy: "8", r: "3", fill: "#a855f7" })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-blue-500/30 transition relative overflow-hidden group", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ e.jsx("div", { className: "w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center text-sm font-black", children: "\u{1F69B}" }),
            /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-slate-400", children: "Total Trips" })
          ] }),
          /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 hover:text-slate-400 cursor-pointer text-xs", children: "\xB7\xB7\xB7" })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
          /* @__PURE__ */ e.jsxs("div", { children: [
            /* @__PURE__ */ e.jsx("div", { className: "text-2xl font-black text-white tracking-tight", children: "314" }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1", children: [
              /* @__PURE__ */ e.jsx("span", { children: "\u2197 +12.5%" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
            ] })
          ] }),
          /* @__PURE__ */ e.jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
            /* @__PURE__ */ e.jsx(
              "path",
              {
                d: "M0,30 Q20,32 40,20 T70,16 T90,10 T100,6",
                fill: "none",
                stroke: "#3b82f6",
                strokeWidth: "2.5",
                strokeLinecap: "round"
              }
            ),
            /* @__PURE__ */ e.jsx("circle", { cx: "100", cy: "6", r: "3", fill: "#3b82f6" })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-amber-500/30 transition relative overflow-hidden group", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ e.jsx("div", { className: "w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-sm font-black", children: "\u{1F6E3}\uFE0F" }),
            /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-slate-400", children: "Total KMs Driven" })
          ] }),
          /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 hover:text-slate-400 cursor-pointer text-xs", children: "\xB7\xB7\xB7" })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
          /* @__PURE__ */ e.jsxs("div", { children: [
            /* @__PURE__ */ e.jsx("div", { className: "text-2xl font-black text-white tracking-tight", children: "64,775.355" }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1", children: [
              /* @__PURE__ */ e.jsx("span", { children: "\u2197 +9.8%" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
            ] })
          ] }),
          /* @__PURE__ */ e.jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
            /* @__PURE__ */ e.jsx(
              "path",
              {
                d: "M0,25 Q25,28 50,18 T80,14 T100,9",
                fill: "none",
                stroke: "#f59e0b",
                strokeWidth: "2.5",
                strokeLinecap: "round"
              }
            ),
            /* @__PURE__ */ e.jsx("circle", { cx: "100", cy: "9", r: "3", fill: "#f59e0b" })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-teal-500/30 transition relative overflow-hidden group", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ e.jsx("div", { className: "w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center text-sm font-black", children: "\u23F1\uFE0F" }),
            /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-slate-400", children: "Fleet Utilization" })
          ] }),
          /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 hover:text-slate-400 cursor-pointer text-xs", children: "\xB7\xB7\xB7" })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
          /* @__PURE__ */ e.jsxs("div", { children: [
            /* @__PURE__ */ e.jsx("div", { className: "text-2xl font-black text-white tracking-tight", children: "78%" }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] font-bold text-teal-400 flex items-center gap-1 mt-1", children: [
              /* @__PURE__ */ e.jsx("span", { children: "\u2197 +6.3%" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
            ] })
          ] }),
          /* @__PURE__ */ e.jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
            /* @__PURE__ */ e.jsx(
              "path",
              {
                d: "M0,28 Q30,30 55,20 T80,15 T100,10",
                fill: "none",
                stroke: "#14b8a6",
                strokeWidth: "2.5",
                strokeLinecap: "round"
              }
            ),
            /* @__PURE__ */ e.jsx("circle", { cx: "100", cy: "10", r: "3", fill: "#14b8a6" })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-indigo-500/30 transition relative overflow-hidden group", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ e.jsx("div", { className: "w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-sm font-black", children: "\u{1F465}" }),
            /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-slate-400", children: "Active Drivers" })
          ] }),
          /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 hover:text-slate-400 cursor-pointer text-xs", children: "\xB7\xB7\xB7" })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-baseline justify-between mt-3", children: [
          /* @__PURE__ */ e.jsxs("div", { children: [
            /* @__PURE__ */ e.jsx("div", { className: "text-2xl font-black text-white tracking-tight", children: "5" }),
            /* @__PURE__ */ e.jsxs("div", { className: "text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-1", children: [
              /* @__PURE__ */ e.jsx("span", { children: "\u2192 0%" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-500 font-normal", children: "vs last month" })
            ] })
          ] }),
          /* @__PURE__ */ e.jsx("div", { className: "w-24 h-10", children: /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 100 40", children: [
            /* @__PURE__ */ e.jsx(
              "path",
              {
                d: "M0,20 Q30,18 60,20 T100,20",
                fill: "none",
                stroke: "#6366f1",
                strokeWidth: "2.5",
                strokeLinecap: "round"
              }
            ),
            /* @__PURE__ */ e.jsx("circle", { cx: "100", cy: "20", r: "3", fill: "#6366f1" })
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-5", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "lg:col-span-4 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-cyan-400 text-sm", children: "\u{1F4C8}" }),
              /* @__PURE__ */ e.jsx("h3", { className: "font-bold text-white text-sm", children: "Revenue vs Expenses" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800", children: "Monthly \u2304" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 hover:text-slate-400 cursor-pointer text-xs", children: "\xB7\xB7\xB7" })
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-4 mt-3 text-xs", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ e.jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Revenue" }),
              /* @__PURE__ */ e.jsx("span", { className: "font-bold text-white font-mono", children: "\u20B92,229,400" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ e.jsx("span", { className: "w-2.5 h-2.5 rounded-xs bg-purple-500 shadow-xs shadow-purple-500" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Expenses" }),
              /* @__PURE__ */ e.jsx("span", { className: "font-bold text-white font-mono", children: "\u20B92,062,529.56" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "w-full h-56 mt-4 relative", children: [
          /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 400 200", preserveAspectRatio: "none", children: [
            /* @__PURE__ */ e.jsxs("defs", { children: [
              /* @__PURE__ */ e.jsxs("linearGradient", { id: "cyanRevGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                /* @__PURE__ */ e.jsx("stop", { offset: "0%", stopColor: "#06b6d4", stopOpacity: "0.4" }),
                /* @__PURE__ */ e.jsx("stop", { offset: "100%", stopColor: "#06b6d4", stopOpacity: "0.0" })
              ] }),
              /* @__PURE__ */ e.jsxs("linearGradient", { id: "purpleExpGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                /* @__PURE__ */ e.jsx("stop", { offset: "0%", stopColor: "#a855f7", stopOpacity: "0.3" }),
                /* @__PURE__ */ e.jsx("stop", { offset: "100%", stopColor: "#a855f7", stopOpacity: "0.0" })
              ] })
            ] }),
            /* @__PURE__ */ e.jsx("line", { x1: "0", y1: "40", x2: "400", y2: "40", stroke: "#1e293b", strokeDasharray: "3 3" }),
            /* @__PURE__ */ e.jsx("line", { x1: "0", y1: "80", x2: "400", y2: "80", stroke: "#1e293b", strokeDasharray: "3 3" }),
            /* @__PURE__ */ e.jsx("line", { x1: "0", y1: "120", x2: "400", y2: "120", stroke: "#1e293b", strokeDasharray: "3 3" }),
            /* @__PURE__ */ e.jsx("line", { x1: "0", y1: "160", x2: "400", y2: "160", stroke: "#1e293b", strokeDasharray: "3 3" }),
            /* @__PURE__ */ e.jsx(
              "path",
              {
                d: "M0,130 C60,150 100,90 150,85 C200,80 230,120 280,70 C330,20 370,50 400,30 L400,200 L0,200 Z",
                fill: "url(#cyanRevGrad)"
              }
            ),
            /* @__PURE__ */ e.jsx(
              "path",
              {
                d: "M0,130 C60,150 100,90 150,85 C200,80 230,120 280,70 C330,20 370,50 400,30",
                fill: "none",
                stroke: "#06b6d4",
                strokeWidth: "3"
              }
            ),
            /* @__PURE__ */ e.jsx(
              "path",
              {
                d: "M0,145 C60,160 100,115 150,105 C200,98 230,135 280,95 C330,55 370,75 400,60 L400,200 L0,200 Z",
                fill: "url(#purpleExpGrad)"
              }
            ),
            /* @__PURE__ */ e.jsx(
              "path",
              {
                d: "M0,145 C60,160 100,115 150,105 C200,98 230,135 280,95 C330,55 370,75 400,60",
                fill: "none",
                stroke: "#a855f7",
                strokeWidth: "2.5"
              }
            ),
            /* @__PURE__ */ e.jsx("circle", { cx: "150", cy: "85", r: "4", fill: "#06b6d4" }),
            /* @__PURE__ */ e.jsx("circle", { cx: "280", cy: "70", r: "4", fill: "#06b6d4" }),
            /* @__PURE__ */ e.jsx("circle", { cx: "400", cy: "30", r: "4", fill: "#06b6d4" })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between text-[10px] text-slate-500 font-mono mt-2", children: [
            /* @__PURE__ */ e.jsx("span", { children: "Mar 1" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 5" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 10" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 15" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 20" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 25" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 31" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "lg:col-span-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ e.jsx("div", { children: /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-blue-400 text-sm", children: "\u{1F4CA}" }),
            /* @__PURE__ */ e.jsx("h3", { className: "font-bold text-white text-sm", children: "Trip Volume" })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800", children: "Daily \u2304" }),
            /* @__PURE__ */ e.jsx("span", { className: "text-slate-600 hover:text-slate-400 cursor-pointer text-xs", children: "\xB7\xB7\xB7" })
          ] })
        ] }) }),
        /* @__PURE__ */ e.jsxs("div", { className: "w-full h-56 mt-3 relative flex flex-col justify-end", children: [
          /* @__PURE__ */ e.jsxs(
            "div",
            {
              className: "absolute z-20 bg-slate-950/95 border border-blue-500/50 rounded-lg px-2.5 py-1 text-center shadow-xl pointer-events-none transition-all duration-200",
              style: {
                left: `${activeTooltipDay / 31 * 85}%`,
                top: "15%"
              },
              children: [
                /* @__PURE__ */ e.jsxs("div", { className: "text-[10px] text-slate-400 font-mono", children: [
                  "Mar ",
                  activeTooltipDay,
                  ", 2024"
                ] }),
                /* @__PURE__ */ e.jsxs("div", { className: "text-xs font-black text-cyan-400 font-mono", children: [
                  tripVolumeData[activeTooltipDay - 1],
                  " trips"
                ] })
              ]
            }
          ),
          /* @__PURE__ */ e.jsx("div", { className: "flex items-end justify-between h-44 gap-1 px-1", children: tripVolumeData.map((val, idx) => {
            const day = idx + 1;
            const isSelected = day === activeTooltipDay;
            const heightPct = Math.round(val / 45 * 100);
            return /* @__PURE__ */ e.jsx(
              "div",
              {
                onMouseEnter: () => setActiveTooltipDay(day),
                className: "flex-1 flex flex-col items-center group cursor-pointer h-full justify-end",
                children: /* @__PURE__ */ e.jsx(
                  "div",
                  {
                    className: `w-full rounded-t-sm transition-all duration-150 ${isSelected ? "bg-cyan-400 shadow-md shadow-cyan-500/50 scale-y-105" : "bg-blue-600 hover:bg-blue-400 opacity-80"}`,
                    style: { height: `${heightPct}%` }
                  }
                )
              },
              day
            );
          }) }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-800", children: [
            /* @__PURE__ */ e.jsx("span", { children: "Mar 1" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 5" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 10" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 15" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 20" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 25" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 31" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "lg:col-span-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ e.jsx("div", { children: /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-purple-400 text-sm", children: "\u{1F369}" }),
            /* @__PURE__ */ e.jsx("h3", { className: "font-bold text-white text-sm", children: "Expense Breakdown" })
          ] }),
          /* @__PURE__ */ e.jsx("span", { className: "text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800", children: "This Month \u2304" })
        ] }) }),
        /* @__PURE__ */ e.jsx("div", { className: "flex flex-col items-center justify-center my-3 relative", children: /* @__PURE__ */ e.jsxs("div", { className: "w-32 h-32 relative flex items-center justify-center", children: [
          /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full transform -rotate-90", viewBox: "0 0 100 100", children: [
            /* @__PURE__ */ e.jsx("circle", { cx: "50", cy: "50", r: "38", fill: "none", stroke: "#06b6d4", strokeWidth: "16", strokeDasharray: "101 138", strokeDashoffset: "0" }),
            /* @__PURE__ */ e.jsx("circle", { cx: "50", cy: "50", r: "38", fill: "none", stroke: "#a855f7", strokeWidth: "16", strokeDasharray: "44 195", strokeDashoffset: "-101" }),
            /* @__PURE__ */ e.jsx("circle", { cx: "50", cy: "50", r: "38", fill: "none", stroke: "#f59e0b", strokeWidth: "16", strokeDasharray: "29 210", strokeDashoffset: "-145" }),
            /* @__PURE__ */ e.jsx("circle", { cx: "50", cy: "50", r: "38", fill: "none", stroke: "#3b82f6", strokeWidth: "16", strokeDasharray: "27 212", strokeDashoffset: "-174" }),
            /* @__PURE__ */ e.jsx("circle", { cx: "50", cy: "50", r: "38", fill: "none", stroke: "#ec4899", strokeWidth: "16", strokeDasharray: "20 219", strokeDashoffset: "-201" }),
            /* @__PURE__ */ e.jsx("circle", { cx: "50", cy: "50", r: "38", fill: "none", stroke: "#64748b", strokeWidth: "16", strokeDasharray: "17 222", strokeDashoffset: "-221" })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-center", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-xs font-black text-white font-mono", children: "\u20B92.06M" }),
            /* @__PURE__ */ e.jsx("span", { className: "text-[9px] text-slate-400 uppercase tracking-tighter", children: "Total Exp" })
          ] })
        ] }) }),
        /* @__PURE__ */ e.jsxs("div", { className: "space-y-1.5 text-[11px] pt-1 border-t border-slate-800", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5 text-slate-300", children: [
              /* @__PURE__ */ e.jsx("span", { className: "w-2 h-2 rounded-full bg-cyan-400" }),
              " Fuel (42.3%)"
            ] }),
            /* @__PURE__ */ e.jsx("span", { className: "font-mono text-white font-bold", children: "\u20B9872,410" })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5 text-slate-300", children: [
              /* @__PURE__ */ e.jsx("span", { className: "w-2 h-2 rounded-full bg-purple-500" }),
              " Tolls (18.6%)"
            ] }),
            /* @__PURE__ */ e.jsx("span", { className: "font-mono text-white font-bold", children: "\u20B9383,120" })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5 text-slate-300", children: [
              /* @__PURE__ */ e.jsx("span", { className: "w-2 h-2 rounded-full bg-amber-500" }),
              " Maintenance (12.1%)"
            ] }),
            /* @__PURE__ */ e.jsx("span", { className: "font-mono text-white font-bold", children: "\u20B9249,350" })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5 text-slate-300", children: [
              /* @__PURE__ */ e.jsx("span", { className: "w-2 h-2 rounded-full bg-blue-500" }),
              " Driver Salary (11.5%)"
            ] }),
            /* @__PURE__ */ e.jsx("span", { className: "font-mono text-white font-bold", children: "\u20B9236,620" })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ e.jsxs("span", { className: "flex items-center gap-1.5 text-slate-300", children: [
              /* @__PURE__ */ e.jsx("span", { className: "w-2 h-2 rounded-full bg-pink-500" }),
              " Insurance (8.4%)"
            ] }),
            /* @__PURE__ */ e.jsx("span", { className: "font-mono text-slate-400", children: "\u20B9173,860" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ e.jsx("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ e.jsx("span", { className: "text-teal-400 text-sm", children: "\u2699\uFE0F" }),
          /* @__PURE__ */ e.jsx("h3", { className: "font-bold text-white text-sm", children: "Operations" })
        ] }) }),
        /* @__PURE__ */ e.jsxs("div", { className: "space-y-3.5 my-2 text-xs", children: [
          /* @__PURE__ */ e.jsxs("div", { children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center mb-1", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "On-Time Delivery" }),
              /* @__PURE__ */ e.jsx("span", { className: "font-bold text-emerald-400 font-mono", children: "92%" })
            ] }),
            /* @__PURE__ */ e.jsx("div", { className: "w-full bg-slate-950 h-2 rounded-full overflow-hidden", children: /* @__PURE__ */ e.jsx("div", { className: "bg-emerald-500 h-full rounded-full", style: { width: "92%" } }) })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center mb-1", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Active Routes" }),
              /* @__PURE__ */ e.jsx("span", { className: "font-bold text-blue-400 font-mono", children: "12" })
            ] }),
            /* @__PURE__ */ e.jsx("div", { className: "w-full bg-slate-950 h-2 rounded-full overflow-hidden", children: /* @__PURE__ */ e.jsx("div", { className: "bg-blue-500 h-full rounded-full", style: { width: "75%" } }) })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between", children: [
            /* @__PURE__ */ e.jsxs("div", { children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500 block uppercase", children: "Top Driver" }),
              /* @__PURE__ */ e.jsx("span", { className: "font-bold text-white text-xs", children: "Ravi Kumar" })
            ] }),
            /* @__PURE__ */ e.jsx("span", { className: "text-amber-400 text-sm", children: "\u2B50" })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between", children: [
            /* @__PURE__ */ e.jsxs("div", { children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500 block uppercase", children: "Avg Trip Distance" }),
              /* @__PURE__ */ e.jsx("span", { className: "font-bold text-cyan-400 font-mono text-xs", children: "206 km" })
            ] }),
            /* @__PURE__ */ e.jsx("span", { className: "text-xs text-slate-500", children: "Per Trip" })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "pt-1 flex flex-col gap-1.5 text-[11px]", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Top Route:" }),
              /* @__PURE__ */ e.jsx("span", { className: "font-bold text-white", children: "Delhi \u2794 Mumbai \u{1F3C6}" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Delayed Trips:" }),
              /* @__PURE__ */ e.jsx("span", { className: "px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold", children: "7 Trips" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Healthy Trucks:" }),
              /* @__PURE__ */ e.jsx("span", { className: "px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold", children: "4 / 12" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-5", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "lg:col-span-5 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3 mb-3", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-blue-400 text-sm", children: "\u{1F4CD}" }),
            /* @__PURE__ */ e.jsx("h3", { className: "font-bold text-white text-sm", children: "Route Performance" })
          ] }),
          /* @__PURE__ */ e.jsx(
            "button",
            {
              type: "button",
              onClick: () => alert("Opening full route profitability master list..."),
              className: "text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer",
              children: "View All >"
            }
          )
        ] }),
        /* @__PURE__ */ e.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ e.jsxs("table", { className: "w-full text-left text-xs", children: [
          /* @__PURE__ */ e.jsx("thead", { className: "text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2", children: /* @__PURE__ */ e.jsxs("tr", { children: [
            /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "#" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2", children: "Route" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Trips" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Dist (km)" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Revenue" }),
            /* @__PURE__ */ e.jsx("th", { className: "py-2 text-right", children: "Profit Margin" })
          ] }) }),
          /* @__PURE__ */ e.jsxs("tbody", { className: "divide-y divide-slate-800/60 font-sans", children: [
            /* @__PURE__ */ e.jsxs("tr", { children: [
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-slate-500 font-mono", children: "1" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 font-bold text-white", children: "Delhi \u2794 Mumbai" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-slate-300", children: "48" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-slate-400", children: "7,112" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono font-bold text-white", children: "\u20B9612,400" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right", children: /* @__PURE__ */ e.jsx("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20", children: "12.4%" }) })
            ] }),
            /* @__PURE__ */ e.jsxs("tr", { children: [
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-slate-500 font-mono", children: "2" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 font-bold text-white", children: "Bengaluru \u2794 Chennai" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-slate-300", children: "36" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-slate-400", children: "4,062" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono font-bold text-white", children: "\u20B9398,600" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right", children: /* @__PURE__ */ e.jsx("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20", children: "10.8%" }) })
            ] }),
            /* @__PURE__ */ e.jsxs("tr", { children: [
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-slate-500 font-mono", children: "3" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 font-bold text-white", children: "Mumbai \u2794 Ahmedabad" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-slate-300", children: "28" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-slate-400", children: "3,927" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono font-bold text-white", children: "\u20B9331,200" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right", children: /* @__PURE__ */ e.jsx("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20", children: "8.6%" }) })
            ] }),
            /* @__PURE__ */ e.jsxs("tr", { children: [
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-slate-500 font-mono", children: "4" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 font-bold text-white", children: "Chennai \u2794 Hyderabad" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-slate-300", children: "24" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-slate-400", children: "2,816" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono font-bold text-white", children: "\u20B9274,800" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right", children: /* @__PURE__ */ e.jsx("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20", children: "6.9%" }) })
            ] }),
            /* @__PURE__ */ e.jsxs("tr", { children: [
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-slate-500 font-mono", children: "5" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 font-bold text-white", children: "Kolkata \u2794 Delhi" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-slate-300", children: "18" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono text-slate-400", children: "2,403" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right font-mono font-bold text-white", children: "\u20B9218,400" }),
              /* @__PURE__ */ e.jsx("td", { className: "py-2.5 text-right", children: /* @__PURE__ */ e.jsx("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20", children: "5.4%" }) })
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "lg:col-span-4 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-cyan-400 text-sm", children: "\u26FD" }),
              /* @__PURE__ */ e.jsx("h3", { className: "font-bold text-white text-sm", children: "Fuel vs Toll Expenses" })
            ] }),
            /* @__PURE__ */ e.jsx("span", { className: "text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800", children: "Monthly \u2304" })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-4 mt-3 text-xs", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ e.jsx("span", { className: "w-2.5 h-2.5 rounded-xs bg-cyan-400 shadow-xs shadow-cyan-400" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Fuel" }),
              /* @__PURE__ */ e.jsx("span", { className: "font-bold text-white font-mono", children: "\u20B9872,410" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ e.jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs shadow-purple-500" }),
              /* @__PURE__ */ e.jsx("span", { className: "text-slate-400", children: "Tolls" }),
              /* @__PURE__ */ e.jsx("span", { className: "font-bold text-white font-mono", children: "\u20B9383,120" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { className: "w-full h-44 mt-3 relative", children: [
          /* @__PURE__ */ e.jsxs("svg", { className: "w-full h-full overflow-visible", viewBox: "0 0 350 150", preserveAspectRatio: "none", children: [
            /* @__PURE__ */ e.jsx("defs", { children: /* @__PURE__ */ e.jsxs("linearGradient", { id: "fuelLineGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ e.jsx("stop", { offset: "0%", stopColor: "#06b6d4", stopOpacity: "0.3" }),
              /* @__PURE__ */ e.jsx("stop", { offset: "100%", stopColor: "#06b6d4", stopOpacity: "0.0" })
            ] }) }),
            /* @__PURE__ */ e.jsx("line", { x1: "0", y1: "35", x2: "350", y2: "35", stroke: "#1e293b", strokeDasharray: "3 3" }),
            /* @__PURE__ */ e.jsx("line", { x1: "0", y1: "75", x2: "350", y2: "75", stroke: "#1e293b", strokeDasharray: "3 3" }),
            /* @__PURE__ */ e.jsx("line", { x1: "0", y1: "115", x2: "350", y2: "115", stroke: "#1e293b", strokeDasharray: "3 3" }),
            /* @__PURE__ */ e.jsx(
              "path",
              {
                d: "M0,110 C50,130 90,85 140,80 C190,75 220,105 260,65 C300,30 330,45 350,25 L350,150 L0,150 Z",
                fill: "url(#fuelLineGrad)"
              }
            ),
            /* @__PURE__ */ e.jsx(
              "path",
              {
                d: "M0,110 C50,130 90,85 140,80 C190,75 220,105 260,65 C300,30 330,45 350,25",
                fill: "none",
                stroke: "#06b6d4",
                strokeWidth: "2.5"
              }
            ),
            /* @__PURE__ */ e.jsx(
              "path",
              {
                d: "M0,135 C50,140 90,115 140,110 C190,105 220,125 260,95 C300,75 330,85 350,65",
                fill: "none",
                stroke: "#a855f7",
                strokeWidth: "2"
              }
            ),
            /* @__PURE__ */ e.jsx("circle", { cx: "140", cy: "80", r: "3", fill: "#06b6d4" }),
            /* @__PURE__ */ e.jsx("circle", { cx: "260", cy: "65", r: "3", fill: "#06b6d4" })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "flex justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-800", children: [
            /* @__PURE__ */ e.jsx("span", { children: "Mar 1" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 5" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 10" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 15" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 20" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 25" }),
            /* @__PURE__ */ e.jsx("span", { children: "Mar 31" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { className: "lg:col-span-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between", children: [
        /* @__PURE__ */ e.jsxs("div", { children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3 mb-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-rose-400 text-sm", children: "\u{1F514}" }),
              /* @__PURE__ */ e.jsx("h3", { className: "font-bold text-white text-sm", children: "Alerts & Reminders" })
            ] }),
            /* @__PURE__ */ e.jsx(
              "button",
              {
                type: "button",
                onClick: () => alert("Navigating to full audit alerts center..."),
                className: "text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer",
                children: "View All >"
              }
            )
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: "space-y-2.5 text-xs", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-950/80 rounded-xl border border-rose-500/20 flex items-start gap-2.5", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-rose-400 text-sm mt-0.5", children: "\u26A0\uFE0F" }),
              /* @__PURE__ */ e.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ e.jsx("div", { className: "font-bold text-slate-200 leading-tight", children: "Truck MH12AB1234 maintenance due in 2 days" }),
                /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500", children: "2h ago \u2022 Fleet Maintenance" })
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-950/80 rounded-xl border border-amber-500/20 flex items-start gap-2.5", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-amber-400 text-sm mt-0.5", children: "\u26A0\uFE0F" }),
              /* @__PURE__ */ e.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ e.jsx("div", { className: "font-bold text-slate-200 leading-tight", children: "Driver license renewal for Suresh Kumar" }),
                /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500", children: "5h ago \u2022 Driver Compliance" })
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-950/80 rounded-xl border border-blue-500/20 flex items-start gap-2.5", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-blue-400 text-sm mt-0.5", children: "\u2139\uFE0F" }),
              /* @__PURE__ */ e.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ e.jsx("div", { className: "font-bold text-slate-200 leading-tight", children: "Unusual fuel consumption detected (TRK-007)" }),
                /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500", children: "1d ago \u2022 Telematics Audit" })
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { className: "p-2.5 bg-slate-950/80 rounded-xl border border-amber-500/20 flex items-start gap-2.5", children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-amber-400 text-sm mt-0.5", children: "\u26A0\uFE0F" }),
              /* @__PURE__ */ e.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ e.jsx("div", { className: "font-bold text-slate-200 leading-tight", children: "3 trips delayed due to weather conditions" }),
                /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-slate-500", children: "1d ago \u2022 Transit Operations" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ e.jsx("div", { className: "pt-3 border-t border-slate-800 text-center", children: /* @__PURE__ */ e.jsx("span", { className: "text-[11px] text-slate-500", children: "Automated reminders connected to Enterprise Audit Engine" }) })
      ] })
    ] })
  ] });
}
