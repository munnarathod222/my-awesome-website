import{u as K,r as n,j as e,a5 as U,bs as G,a1 as W,a0 as P,at as X}from"./vendor-react-Bs5V2qFE.js";
import{p as w,t as Y,aA as q,N as Q,B as m,aB as Z,aC as ee,C as c,ag as l,o as h,q as g,O as f,I as te,S as ae,e as se,g as re,h as le,i as b,w as k}from"./index-DLxf9dwO.js";
import{P as ne}from"./progress-55zf5paG.js";
import{R as S,T,L as R,B as A,C as B}from"./generateCategoricalChart-BEnIo3F8.js";
import{B as ie}from"./BarChart-DOVIJigh.js";
import{C as de}from"./CartesianGrid-BCC_9QQg.js";
import{X as oe,Y as ce}from"./YAxis-C3vl7O1m.js";
import{P as xe,a as me}from"./PieChart-DFpEcMSh.js";
import"./vendor-radix-BQCqNqg0.js";
import"./vendor-pdf-DtmgLs_2.js";

const Pe = () => {
  const L = K();
  const [I, j] = n.useState(true);
  const [v, _] = n.useState(null);
  const [N, E] = n.useState([]);
  const [y, F] = n.useState([]);
  const [p, $] = n.useState("");
  const [u, z] = n.useState("all");
  const [x, pe] = n.useState({ key: "totalPending", direction: "desc" });

  n.useEffect(() => {
    C();
  }, []);

  const C = async () => {
    try {
      j(true);
      const [t, s] = await Promise.all([
        w.collection("clients").getFullList({ sort: "client_name", $autoCancel: false }),
        w.collection("trip_logs").getFullList({ $autoCancel: false })
      ]);
      E(t);
      F(s);
    } catch (t) {
      console.error("Error fetching analysis data:", t);
      _("Failed to load client payment data.");
      Y.error("Error loading data");
    } finally {
      j(false);
    }
  };

  const o = n.useMemo(() => {
    let t = q(N, y);
    if (p) {
      const s = p.toLowerCase();
      t = t.filter(d => d.client_name.toLowerCase().includes(s));
    }
    if (u === "pending") {
      t = t.filter(s => s.totalPending > 0);
    } else if (u === "clear") {
      t = t.filter(s => s.totalPending === 0 && s.totalReceived > 0);
    }
    t.sort((s, d) => {
      let r = s[x.key], i = d[x.key];
      if (typeof r === "string") r = r.toLowerCase();
      if (typeof i === "string") i = i.toLowerCase();
      return r < i ? (x.direction === "asc" ? -1 : 1) : r > i ? (x.direction === "asc" ? 1 : -1) : 0;
    });
    return t;
  }, [N, y, p, u, x]);

  const a = n.useMemo(() => {
    const t = [...o].sort((r, i) => i.totalPending - r.totalPending).slice(0, 10);
    let s = 0, d = 0;
    o.forEach(r => {
      s += r.totalReceived;
      d += r.totalPending;
    });
    return { topByPending: t, totalReceived: s, totalPending: d };
  }, [o]);

  const totalInvoiced = a.totalPending + a.totalReceived;
  const realizedPct = totalInvoiced > 0 ? ((a.totalReceived / totalInvoiced) * 100).toFixed(1) : "0.0";
  const uncollectedPct = totalInvoiced > 0 ? ((a.totalPending / totalInvoiced) * 100).toFixed(1) : "0.0";

  if (I) return e.jsx(Q, { text: "Compiling client payment analytics..." });
  if (v) return e.jsxs("div", {
    className: "flex flex-col items-center justify-center min-h-[60vh] p-4 text-center",
    children: [
      e.jsx(U, { className: "w-12 h-12 text-destructive mb-4" }),
      e.jsx("h2", { className: "text-2xl font-bold mb-2 text-white", children: "Error Loading Analysis" }),
      e.jsx("p", { className: "text-muted-foreground mb-4", children: v }),
      e.jsx(m, { onClick: C, children: "Try Again" })
    ]
  });

  return e.jsxs(e.Fragment, {
    children: [
      e.jsx(G, { children: e.jsx("title", { children: "Client Payment Analysis - Jai Bhavani Cargo" }) }),
      e.jsxs("div", {
        className: "p-6 md:p-8 max-w-[1400px] mx-auto w-full space-y-6 animate-in fade-in",
        children: [
          // Header Row
          e.jsxs("div", {
            className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("h1", {
                    className: "text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading",
                    children: "Client Payment Analysis"
                  }),
                  e.jsx("p", {
                    className: "text-slate-400 mt-1 text-xs sm:text-sm",
                    children: "Monitor outstanding balances and payment history across all clients."
                  })
                ]
              }),
              e.jsxs("div", {
                className: "flex items-center gap-3 w-full md:w-auto",
                children: [
                  e.jsxs("button", {
                    onClick: () => Z(o),
                    className: "px-4 py-2 bg-[#131b2e] hover:bg-[#1a243d] border border-slate-700/60 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm",
                    children: [e.jsx(W, { className: "w-4 h-4 text-slate-300" }), " Export CSV"]
                  }),
                  e.jsxs("button", {
                    onClick: () => ee(o),
                    className: "px-4 py-2 bg-[#131b2e] hover:bg-[#1a243d] border border-slate-700/60 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm",
                    children: [e.jsx(P, { className: "w-4 h-4 text-slate-300" }), " Export PDF"]
                  })
                ]
              })
            ]
          }),

          // Top 4 Metrics Cards
          e.jsxs("div", {
            className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
            children: [
              e.jsxs("div", {
                className: "p-5 bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl shadow-sm space-y-1.5",
                children: [
                  e.jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider", children: "TOTAL INVOICED PORTFOLIO" }),
                  e.jsx("p", { className: "text-2xl font-black text-white font-mono tabular-nums", children: l(totalInvoiced) }),
                  e.jsx("p", { className: "text-xs text-slate-500", children: "Total revenue across all clients" })
                ]
              }),
              e.jsxs("div", {
                className: "p-5 bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl shadow-sm space-y-1.5",
                children: [
                  e.jsx("p", { className: "text-[10px] font-bold text-[#10b981] uppercase tracking-wider", children: "TOTAL REALIZED CASH" }),
                  e.jsx("p", { className: "text-2xl font-black text-[#10b981] font-mono tabular-nums", children: l(a.totalReceived) }),
                  e.jsxs("p", { className: "text-xs text-[#10b981]/80", children: [realizedPct, "% Realized Rate"] })
                ]
              }),
              e.jsxs("div", {
                className: "p-5 bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl shadow-sm space-y-1.5",
                children: [
                  e.jsx("p", { className: "text-[10px] font-bold text-[#f43f5e] uppercase tracking-wider", children: "TOTAL OUTSTANDING BALANCE" }),
                  e.jsx("p", { className: "text-2xl font-black text-[#f43f5e] font-mono tabular-nums", children: l(a.totalPending) }),
                  e.jsxs("p", { className: "text-xs text-[#f43f5e]/80", children: [uncollectedPct, "% Uncollected"] })
                ]
              }),
              e.jsxs("div", {
                className: "p-5 bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl shadow-sm space-y-1.5",
                children: [
                  e.jsx("p", { className: "text-[10px] font-bold text-[#38bdf8] uppercase tracking-wider", children: "COLLECTION EFFICIENCY" }),
                  e.jsxs("p", { className: "text-2xl font-black text-[#38bdf8] font-mono tabular-nums", children: [realizedPct, "%"] }),
                  e.jsx("p", { className: "text-xs text-slate-500", children: "Portfolio recovery score" })
                ]
              })
            ]
          }),

          // Middle Charts Section (Pending vs Received + Overall Portfolio Status)
          e.jsxs("div", {
            className: "grid grid-cols-1 lg:grid-cols-3 gap-5",
            children: [
              // Left Chart: Pending vs Received
              e.jsxs("div", {
                className: "lg:col-span-2 bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between",
                children: [
                  e.jsx("h2", {
                    className: "text-sm font-bold text-white mb-4",
                    children: "Pending vs Received (Top Clients)"
                  }),
                  e.jsx("div", {
                    className: "h-[260px] w-full",
                    children: e.jsx(S, {
                      width: "100%",
                      height: "100%",
                      children: e.jsxs(ie, {
                        data: a.topByPending,
                        margin: { top: 15, right: 10, left: 10, bottom: 5 },
                        children: [
                          e.jsx(de, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.06)", vertical: false }),
                          e.jsx(oe, {
                            dataKey: "client_name",
                            tick: { fontSize: 10, fill: "#64748b" },
                            tickFormatter: t => (t.length > 12 ? t.substring(0, 12) + "..." : t),
                            axisLine: false,
                            tickLine: false
                          }),
                          e.jsx(ce, {
                            tickFormatter: t => "₹" + Math.round(t / 1000) + "k",
                            tick: { fontSize: 10, fill: "#64748b" },
                            axisLine: false,
                            tickLine: false
                          }),
                          e.jsx(T, {
                            formatter: t => l(t),
                            contentStyle: { backgroundColor: "rgba(15, 21, 35, 0.95)", borderColor: "#1e293b", borderRadius: "10px", color: "#fff" }
                          }),
                          e.jsx(A, { dataKey: "totalReceived", name: "Received", stackId: "a", fill: "#10b981", radius: [0, 0, 4, 4] }),
                          e.jsx(A, { dataKey: "totalPending", name: "Pending", stackId: "a", fill: "#f43f5e", radius: [4, 4, 0, 0] })
                        ]
                      })
                    })
                  }),
                  e.jsxs("div", {
                    className: "flex items-center justify-center gap-4 mt-3 pt-2 text-xs font-semibold",
                    children: [
                      e.jsxs("span", {
                        className: "flex items-center gap-1.5 text-slate-400 text-[11px]",
                        children: [e.jsx("span", { className: "w-2 h-2 rounded-full bg-[#10b981]" }), " Received"]
                      }),
                      e.jsxs("span", {
                        className: "flex items-center gap-1.5 text-slate-400 text-[11px]",
                        children: [e.jsx("span", { className: "w-2 h-2 rounded-full bg-[#f43f5e]" }), " Pending"]
                      })
                    ]
                  })
                ]
              }),

              // Right Chart: Overall Portfolio Status Donut
              e.jsxs("div", {
                className: "bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between items-center",
                children: [
                  e.jsx("h2", {
                    className: "w-full text-left text-sm font-bold text-white mb-2",
                    children: "Overall Portfolio Status"
                  }),
                  e.jsx("div", {
                    className: "h-[190px] w-full flex items-center justify-center",
                    children: e.jsx(S, {
                      width: "100%",
                      height: "100%",
                      children: e.jsxs(xe, {
                        children: [
                          e.jsxs(me, {
                            data: [
                              { name: "Received", value: a.totalReceived || 1 },
                              { name: "Pending", value: a.totalPending || 0 }
                            ],
                            cx: "50%",
                            cy: "50%",
                            innerRadius: 55,
                            outerRadius: 85,
                            paddingAngle: 4,
                            dataKey: "value",
                            children: [
                              e.jsx(B, { fill: "#10b981" }),
                              e.jsx(B, { fill: "#f43f5e" })
                            ]
                          }),
                          e.jsx(T, {
                            formatter: t => l(t),
                            contentStyle: { backgroundColor: "rgba(15, 21, 35, 0.95)", borderColor: "#1e293b", borderRadius: "10px", color: "#fff" }
                          })
                        ]
                      })
                    })
                  }),
                  e.jsxs("div", {
                    className: "flex items-center justify-center gap-4 text-xs font-semibold my-1",
                    children: [
                      e.jsxs("span", {
                        className: "flex items-center gap-1.5 text-slate-400 text-[11px]",
                        children: [e.jsx("span", { className: "w-2 h-2 rounded-full bg-[#10b981]" }), " Received"]
                      }),
                      e.jsxs("span", {
                        className: "flex items-center gap-1.5 text-slate-400 text-[11px]",
                        children: [e.jsx("span", { className: "w-2 h-2 rounded-full bg-[#f43f5e]" }), " Pending"]
                      })
                    ]
                  }),
                  e.jsxs("div", {
                    className: "text-center mt-3 pt-3 border-t border-slate-800/80 w-full",
                    children: [
                      e.jsx("p", {
                        className: "text-2xl font-black text-white font-mono tracking-tight",
                        children: l(totalInvoiced)
                      }),
                      e.jsx("p", {
                        className: "text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-1",
                        children: "TOTAL NETWORK INVOICED"
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          // Bottom Section: Client Ledger & Credit Rating
          e.jsxs("div", {
            className: "bg-[#0b0f19] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm space-y-6",
            children: [
              // Header with Search and Filter
              e.jsxs("div", {
                className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
                children: [
                  e.jsx("h2", {
                    className: "text-sm font-bold text-white",
                    children: "Client Ledger & Credit Rating"
                  }),
                  e.jsxs("div", {
                    className: "flex items-center gap-3 w-full sm:w-auto",
                    children: [
                      e.jsxs("div", {
                        className: "relative w-full sm:w-60",
                        children: [
                          e.jsx(X, { className: "absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" }),
                          e.jsx("input", {
                            type: "text",
                            placeholder: "Search clients...",
                            className: "w-full pl-9 pr-3 py-1.5 text-xs bg-[#0f1523] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary/50",
                            value: p,
                            onChange: t => $(t.target.value)
                          })
                        ]
                      }),
                      e.jsxs("select", {
                        value: u,
                        onChange: t => z(t.target.value),
                        className: "px-3 py-1.5 text-xs bg-[#0f1523] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-primary/50 cursor-pointer",
                        children: [
                          e.jsx("option", { value: "all", children: "All Clients" }),
                          e.jsx("option", { value: "pending", children: "Has Pending" }),
                          e.jsx("option", { value: "clear", children: "Fully Cleared" })
                        ]
                      })
                    ]
                  })
                ]
              }),

              // Clients Cards Grid (3 columns on desktop!)
              o.length === 0
                ? e.jsx("div", {
                    className: "text-center py-12 text-slate-400 bg-[#0f1523] rounded-2xl border border-dashed border-[#1e293b]",
                    children: "No clients match the current filters."
                  })
                : e.jsx("div", {
                    className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5",
                    children: o.map(t => {
                      const d = r => {
                        const i = r.client_name || "Valued Customer",
                          D = l(r.totalInvoiced || 0),
                          V = l(r.totalReceived || 0),
                          M = l(r.totalPending || 0),
                          O = r.pendingTrips || 0,
                          H = `*JAI BHAVANI CARGO - CLIENT ACCOUNT STATEMENT*

Dear *${i}*,

Here is your current payment summary:

📊 *Total Billed*: ${D}
✅ *Total Paid*: ${V}
⚠️ *Outstanding Balance*: ${M}
🚚 *Pending Trips*: ${O}

Please review and settle the outstanding amount at your earliest convenience.

Thank you for choosing *Jai Bhavani Cargo*!

Best Regards,
*Jai Bhavani Cargo Team*`,
                          J = `https://wa.me/?text=${encodeURIComponent(H)}`;
                        window.open(J, "_blank");
                      };

                      const scoreVal = t.creditScore || 750;
                      const scoreTier = t.creditTier || "AAA";
                      const isHighRisk = t.totalPending > 100000 || scoreVal < 500;
                      const isModerate = t.totalPending > 0 && !isHighRisk;

                      return e.jsxs("div", {
                        className: "bg-[#0f1523] border border-[#1e293b]/80 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition shadow-sm",
                        children: [
                          e.jsxs("div", {
                            className: "space-y-3",
                            children: [
                              // Row 1: Name and Score Badge
                              e.jsxs("div", {
                                className: "flex items-center justify-between gap-2",
                                children: [
                                  e.jsx("h3", {
                                    className: "font-bold text-base text-white truncate",
                                    title: t.client_name,
                                    children: t.client_name
                                  }),
                                  e.jsxs("span", {
                                    className: `px-2 py-0.5 text-[9px] font-black rounded-md shrink-0 ${
                                      scoreVal < 500 ? "bg-[#ef4444] text-white" :
                                      scoreVal < 700 ? "bg-amber-500 text-slate-950" :
                                      "bg-[#10b981] text-slate-950"
                                    }`,
                                    children: ["Score: ", scoreVal, " (", scoreTier, ")"]
                                  })
                                ]
                              }),

                              // Row 2: Risk Tag and Avg Days
                              e.jsxs("div", {
                                className: "flex items-center justify-between gap-2",
                                children: [
                                  e.jsx("span", {
                                    className: `text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                      isHighRisk
                                        ? "border-[#f43f5e]/40 bg-[#f43f5e]/10 text-[#f43f5e]"
                                        : isModerate
                                        ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                                        : "border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981]"
                                    }`,
                                    children: isHighRisk ? "High Risk / Watch" : isModerate ? "Moderate Risk" : "Excellent Credit"
                                  }),
                                  e.jsxs("span", {
                                    className: "text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1",
                                    children: ["🛡️ ", t.avgPaymentDays || 18, " Days Avg"]
                                  })
                                ]
                              }),

                              // Row 3: Financials breakdown
                              e.jsxs("div", {
                                className: "space-y-1.5 pt-2 border-t border-slate-800/60 text-xs",
                                children: [
                                  e.jsxs("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                      e.jsx("span", { className: "text-[10px] text-slate-400 font-bold uppercase tracking-wider", children: "INVOICED" }),
                                      e.jsx("span", { className: "font-mono font-bold text-white text-xs tabular-nums", children: l(t.totalInvoiced) })
                                    ]
                                  }),
                                  e.jsxs("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                      e.jsx("span", { className: "text-[10px] text-slate-400 font-bold uppercase tracking-wider", children: "RECEIVED" }),
                                      e.jsx("span", { className: "font-mono font-bold text-[#10b981] text-xs tabular-nums", children: l(t.totalReceived) })
                                    ]
                                  }),
                                  e.jsxs("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                      e.jsx("span", { className: "text-[10px] text-slate-400 font-bold uppercase tracking-wider", children: "OUTSTANDING" }),
                                      e.jsx("span", { className: "font-mono font-bold text-[#f43f5e] text-xs tabular-nums", children: l(t.totalPending) })
                                    ]
                                  })
                                ]
                              }),

                              // Row 4: Progress Bar
                              t.totalInvoiced > 0
                                ? e.jsxs("div", {
                                    className: "pt-1 space-y-1.5",
                                    children: [
                                      e.jsxs("div", {
                                        className: "w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden flex",
                                        children: [
                                          e.jsx("div", {
                                            className: "h-full bg-[#3b82f6] rounded-full transition-all duration-300",
                                            style: { width: Math.min(100, Math.max(0, 100 - t.pendingPct)) + "%" }
                                          }),
                                          e.jsx("div", {
                                            className: "h-full bg-[#f43f5e]/80 rounded-full transition-all duration-300",
                                            style: { width: Math.min(100, Math.max(0, t.pendingPct)) + "%" }
                                          })
                                        ]
                                      }),
                                      e.jsxs("div", {
                                        className: "flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider",
                                        children: [
                                          e.jsxs("span", { children: [(100 - t.pendingPct).toFixed(1), "% PAID"] }),
                                          e.jsxs("span", { children: [t.pendingPct.toFixed(1), "% UNPAID"] })
                                        ]
                                      })
                                    ]
                                  })
                                : e.jsxs("div", {
                                    className: "pt-1 space-y-1.5",
                                    children: [
                                      e.jsx("div", { className: "w-full h-1.5 bg-[#1e293b] rounded-full" }),
                                      e.jsxs("div", {
                                        className: "flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider",
                                        children: [
                                          e.jsx("span", { children: "0.0% PAID" }),
                                          e.jsx("span", { children: "0.0% UNPAID" })
                                        ]
                                      })
                                    ]
                                  })
                            ]
                          }),

                          // Row 5: Footer with Trips & View Action
                          e.jsxs("div", {
                            className: "border-t border-slate-800/60 pt-3 flex items-center justify-between gap-2",
                            children: [
                              e.jsxs("div", {
                                className: "text-[10px] text-slate-400 truncate",
                                children: [
                                  "Trips: ",
                                  e.jsxs("span", { className: "text-[#f43f5e] font-bold", children: [t.pendingTrips, " pending"] }),
                                  " / ",
                                  e.jsxs("span", { className: "text-slate-300 font-medium", children: [t.receivedTrips, " cleared"] })
                                ]
                              }),
                              e.jsxs("div", {
                                className: "flex items-center gap-1.5 shrink-0",
                                children: [
                                  e.jsx("button", {
                                    type: "button",
                                    onClick: () => d(t),
                                    className: "p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition cursor-pointer",
                                    title: "Share Statement via WhatsApp",
                                    children: e.jsx(P, { className: "w-3.5 h-3.5" })
                                  }),
                                  e.jsxs("button", {
                                    type: "button",
                                    onClick: () => L("/client/" + t.client_id),
                                    className: "px-3 py-1 bg-[#131b2e] hover:bg-[#1a243d] border border-slate-700/60 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer",
                                    children: [
                                      e.jsx("span", { className: "text-[10px]", children: "📄" }),
                                      " View"
                                    ]
                                  })
                                ]
                              })
                            ]
                          })
                        ]
                      }, t.client_id);
                    })
                  })
            ]
          })
        ]
      })
    ]
  });
};

export { Pe as default };
