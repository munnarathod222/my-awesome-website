const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

console.log('=== Patching ClientPortalPage with Support & Complaints ===');

const portalDirs = [
  'dist/assets',
  'apps/web/dist/assets',
  'apps/api/dist/assets',
  'dist/apps/web/assets'
];

// Helper to inspect
for (const dir of portalDirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.startsWith('ClientPortalPage-') && f.endsWith('.js'));
  for (const f of files) {
    const full = path.join(dir, f);
    let code = fs.readFileSync(full, 'utf8');

    // Check if already patched
    if (code.includes('Support & Complaints') && code.includes('operations@jaibhavanicargo.com')) {
      console.log('Already patched:', full);
      continue;
    }

    // 1. Add Support Tab Trigger in TabsList (Je)
    // Find where value:"bidding" trigger is in Je
    const biddingTrig = 'value:"bidding"';
    const trigIdx = code.indexOf(biddingTrig);
    if (trigIdx !== -1) {
      // Find the end of this P element
      const pEnd = code.indexOf('})', trigIdx);
      if (pEnd !== -1) {
        const supportTrig = ',e.jsxs(P,{value:"support",className:"rounded-lg text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 text-rose-400 data-[state=active]:bg-rose-600 data-[state=active]:text-white",children:[e.jsx(oe,{className:"w-3.5 h-3.5 mr-1"}),"Support & Complaints"]})';
        code = code.slice(0, pEnd + 2) + supportTrig + code.slice(pEnd + 2);
        console.log('✓ Added Support Tab Trigger to:', full);
      }
    }

    // 2. Add Support Tab Content inside the Tabs container
    // We can inject it right after <A value="bidding"...>...</A>
    const biddingContent = 'value:"bidding"';
    const lastBiddingIdx = code.lastIndexOf(biddingContent);
    if (lastBiddingIdx !== -1) {
      // Find where this <A> closes
      const aClose = code.indexOf('})})', lastBiddingIdx);
      if (aClose !== -1) {
        // Build the Support Tab content in JSX runtime (e.jsx / e.jsxs)
        // We will build a client-side Support Hub component
        const supportContentSnippet = ',e.jsx(A,{value:"support",className:"p-4 sm:p-6 space-y-6",children:e.jsx(ClientPortalSupportTab,{client:x,trips:h,currentUser:i})})';
        code = code.slice(0, aClose + 4) + supportContentSnippet + code.slice(aClose + 4);
        console.log('✓ Added Support Tab Content container to:', full);
      }
    }

    // 3. Define ClientPortalSupportTab component before function at()
    const supportTabComponent = `
function ClientPortalSupportTab({client, trips, currentUser}) {
  const [tickets, setTickets] = c.useState([]);
  const [activeTicket, setActiveTicket] = c.useState(null);
  const [isRaising, setIsRaising] = c.useState(false);
  const [replyText, setReplyText] = c.useState("");
  const [form, setForm] = c.useState({
    tripId: "",
    category: "delay",
    priority: "high",
    subject: "",
    description: "",
    photoUrl: ""
  });
  const [starRating, setStarRating] = c.useState(5);
  const [feedbackNote, setFeedbackNote] = c.useState("");

  const loadTickets = () => {
    try {
      const raw = localStorage.getItem("jc_support_tickets");
      const all = raw ? JSON.parse(raw) : [];
      // Filter for this client if client is set
      const cName = client?.client_name || client?.company_name || currentUser?.name || currentUser?.company || "";
      const cId = client?.id || currentUser?.client_id || "";
      const filtered = all.filter(t => {
        if (!cId && !cName) return true;
        return (cId && t.client_id === cId) || (cName && (t.client_name || "").toLowerCase().includes(cName.toLowerCase()));
      });
      setTickets(filtered.length > 0 ? filtered : all.slice(0, 3));
    } catch(e) {
      console.error(e);
    }
  };

  c.useEffect(() => {
    loadTickets();
    window.addEventListener("jc-store-update", loadTickets);
    return () => window.removeEventListener("jc-store-update", loadTickets);
  }, [client, currentUser]);

  const saveTicketList = (newList) => {
    try {
      const raw = localStorage.getItem("jc_support_tickets");
      const all = raw ? JSON.parse(raw) : [];
      const updatedAll = all.map(t => {
        const found = newList.find(n => n.id === t.id);
        return found || t;
      });
      // also include brand new tickets
      newList.forEach(n => {
        if (!updatedAll.some(u => u.id === n.id)) updatedAll.unshift(n);
      });
      localStorage.setItem("jc_support_tickets", JSON.stringify(updatedAll));
      window.dispatchEvent(new Event("jc-store-update"));
      loadTickets();
    } catch(e) {}
  };

  const handleEscalate = (t) => {
    const reason = window.prompt("Reason for escalation to Senior Management (operations@jaibhavanicargo.com):", "Dispute unresolved. Urgent intervention requested.");
    if (reason === null) return;
    const updated = tickets.map(item => {
      if (item.id === t.id) {
        return {
          ...item,
          status: "escalated",
          is_escalated: true,
          escalated_at: new Date().toISOString(),
          escalation_reason: reason.trim(),
          updated_at: new Date().toISOString()
        };
      }
      return item;
    });
    saveTicketList(updated);
    if (activeTicket && activeTicket.id === t.id) {
      setActiveTicket(updated.find(x => x.id === t.id));
    }
    w.success("Grievance escalated to Senior Management at operations@jaibhavanicargo.com!");
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;
    const newMsg = {
      id: "msg-" + Date.now(),
      sender_type: "client",
      sender_name: client?.client_name || client?.company_name || currentUser?.name || "Client User",
      message: replyText.trim(),
      created_at: new Date().toISOString()
    };
    const updated = tickets.map(item => {
      if (item.id === activeTicket.id) {
        return {
          ...item,
          messages: [...(item.messages || []), newMsg],
          updated_at: new Date().toISOString()
        };
      }
      return item;
    });
    saveTicketList(updated);
    setActiveTicket(updated.find(x => x.id === activeTicket.id));
    setReplyText("");
    w.success("Reply sent to JBC Operations.");
  };

  const handleRateTicket = (t) => {
    const updated = tickets.map(item => {
      if (item.id === t.id) {
        return {
          ...item,
          rating: starRating,
          rating_feedback: feedbackNote.trim() || "Service resolved satisfactory.",
          rated_at: new Date().toISOString(),
          status: "closed"
        };
      }
      return item;
    });
    saveTicketList(updated);
    if (activeTicket && activeTicket.id === t.id) {
      setActiveTicket(updated.find(x => x.id === t.id));
    }
    w.success("Thank you for your rating! Feedback submitted to JBC Management.");
  };

  const handleCreateTicketSubmit = (e) => {
    e.preventDefault();
    if (!form.subject.trim()) {
      w.error("Subject is required");
      return;
    }
    const chosenTrip = trips.find(tp => tp.id === form.tripId);
    const newTkt = {
      id: "tkt-" + Date.now(),
      ticket_number: "JBC/TKT/" + Math.floor(1000 + Math.random() * 9000),
      client_id: client?.id || currentUser?.client_id || "client-001",
      client_name: client?.client_name || client?.company_name || currentUser?.name || "Corporate Consignor",
      trip_id: chosenTrip?.id || "",
      trip_number: chosenTrip?.trip_id || chosenTrip?.id || "",
      lr_number: chosenTrip?.lr_number || chosenTrip?.client_trip_id || "",
      truck_number: chosenTrip?.truck_number || "",
      driver_name: chosenTrip?.driver_name || "",
      driver_phone: chosenTrip?.driver_phone || "",
      category: form.category,
      priority: form.priority,
      subject: form.subject.trim(),
      description: form.description.trim(),
      attachments: form.photoUrl ? [form.photoUrl.trim()] : [],
      status: "open",
      is_escalated: form.priority === "urgent",
      escalated_at: form.priority === "urgent" ? new Date().toISOString() : undefined,
      messages: [
        {
          id: "msg-" + Date.now(),
          sender_type: "client",
          sender_name: client?.client_name || currentUser?.name || "Client User",
          message: form.description.trim() || form.subject.trim(),
          created_at: new Date().toISOString()
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    saveTicketList([newTkt, ...tickets]);
    setIsRaising(false);
    setForm({ tripId: "", category: "delay", priority: "high", subject: "", description: "", photoUrl: "" });
    w.success("Support Ticket #" + newTkt.ticket_number + " submitted successfully!");
  };

  const openCount = tickets.filter(t => t.status === "open" || t.status === "investigating").length;
  const escCount = tickets.filter(t => t.is_escalated || t.status === "escalated").length;
  const resCount = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;

  return e.jsxs("div", {
    className: "space-y-6",
    children: [
      /* Header & Overview */
      e.jsxs("div", {
        className: "bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl",
        children: [
          e.jsxs("div", {
            children: [
              e.jsxs("div", {
                className: "flex items-center gap-2 mb-1",
                children: [
                  e.jsx("span", { className: "px-2.5 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider", children: "Dedicated Client SLA Support" }),
                  e.jsx("span", { className: "px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-mono", children: "operations@jaibhavanicargo.com" })
                ]
              }),
              e.jsx("h2", { className: "text-2xl font-heading font-black text-white tracking-tight", children: "Support & Transit Complaints Desk" }),
              e.jsx("p", { className: "text-xs text-slate-400 mt-0.5 max-w-xl", children: "Raise grievances against active highway loads, report cargo damage with photo evidence, request POD re-verification, or escalate disputes to senior management." })
            ]
          }),
          e.jsxs(j, {
            onClick: () => setIsRaising(true),
            className: "rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/20 cursor-pointer text-xs h-10 px-4 flex items-center gap-1.5",
            children: [e.jsx(oe, { className: "w-4 h-4" }), " Raise New Ticket"]
          })
        ]
      }),

      /* KPI Stat Chips */
      e.jsxs("div", {
        className: "grid grid-cols-2 sm:grid-cols-4 gap-3",
        children: [
          e.jsxs("div", { className: "bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl", children: [
            e.jsx("p", { className: "text-[10px] text-slate-400 font-bold uppercase", children: "Total Logged" }),
            e.jsx("p", { className: "text-xl font-bold font-mono text-white mt-1", children: tickets.length })
          ]}),
          e.jsxs("div", { className: "bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl", children: [
            e.jsx("p", { className: "text-[10px] text-amber-400 font-bold uppercase", children: "Under Investigation" }),
            e.jsx("p", { className: "text-xl font-bold font-mono text-amber-400 mt-1", children: openCount })
          ]}),
          e.jsxs("div", { className: "bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl", children: [
            e.jsx("p", { className: "text-[10px] text-rose-400 font-bold uppercase", children: "Escalated to Mgmt" }),
            e.jsx("p", { className: "text-xl font-bold font-mono text-rose-500 mt-1", children: escCount })
          ]}),
          e.jsxs("div", { className: "bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl", children: [
            e.jsx("p", { className: "text-[10px] text-emerald-400 font-bold uppercase", children: "Resolved & Closed" }),
            e.jsx("p", { className: "text-xl font-bold font-mono text-emerald-400 mt-1", children: resCount })
          ]})
        ]
      }),

      /* Tickets List */
      e.jsx("div", {
        className: "bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl",
        children: tickets.length === 0 ? e.jsxs("div", {
          className: "py-16 text-center text-slate-400 space-y-2",
          children: [
            e.jsx(oe, { className: "w-10 h-10 mx-auto text-slate-600 opacity-60" }),
            e.jsx("p", { className: "font-bold text-slate-300 text-sm", children: "No Complaints or Tickets on Record" }),
            e.jsx("p", { className: "text-xs text-slate-500", children: "All your active highway loads are moving according to standard SLA." })
          ]
        }) : e.jsx("div", {
          className: "divide-y divide-slate-800/60",
          children: tickets.map(t => {
            const isEsc = t.is_escalated || t.status === "escalated";
            const isResolved = t.status === "resolved" || t.status === "closed";
            return e.jsxs("div", {
              key: t.id,
              className: "p-4 sm:p-5 hover:bg-slate-800/40 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4",
              children: [
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsxs("div", {
                      className: "flex items-center gap-2 flex-wrap",
                      children: [
                        e.jsx("span", { className: "font-mono font-bold text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20", children: t.ticket_number }),
                        e.jsx("span", { className: "text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300", children: t.category }),
                        e.jsx("span", {
                          className: "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full " + (
                            isResolved ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                            isEsc ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse" :
                            "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          ),
                          children: isEsc ? "🚨 Escalated" : isResolved ? "✓ Resolved" : "⏳ " + t.status.toUpperCase()
                        }),
                        isEsc ? e.jsx("span", { className: "text-[9px] text-rose-400 font-semibold", children: "• Escalated to operations@jaibhavanicargo.com" }) : null
                      ]
                    }),
                    e.jsx("h4", { className: "font-bold text-sm text-white", children: t.subject }),
                    e.jsx("p", { className: "text-xs text-slate-300 line-clamp-1", children: t.description }),
                    t.truck_number ? e.jsxs("p", {
                      className: "text-[11px] text-slate-400 font-mono flex items-center gap-2",
                      children: [
                        e.jsxs("span", { children: ["Truck: ", e.jsx("strong", { className: "text-slate-200", children: t.truck_number })] }),
                        t.trip_number ? e.jsxs("span", { children: ["• Trip: ", t.trip_number] }) : null,
                        t.lr_number ? e.jsxs("span", { children: ["• LR: ", t.lr_number] }) : null
                      ]
                    }) : null,
                    t.rating ? e.jsxs("p", { className: "text-xs text-amber-400 font-bold", children: ["Client Rating: ", "★".repeat(t.rating), " (", t.rating, ".0)"] }) : null
                  ]
                }),

                /* Action buttons */
                e.jsxs("div", {
                  className: "flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end",
                  children: [
                    e.jsx(j, {
                      onClick: () => setActiveTicket(t),
                      className: "rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-9 px-3.5 cursor-pointer",
                      children: "View Timeline & Chat"
                    }),
                    !isResolved && !isEsc ? e.jsx(j, {
                      onClick: () => handleEscalate(t),
                      variant: "outline",
                      className: "rounded-xl border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs h-9 px-3 cursor-pointer",
                      children: "🚨 Escalate"
                    }) : null,
                    isResolved && !t.rating ? e.jsx(j, {
                      onClick: () => {
                        setActiveTicket(t);
                      },
                      className: "rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs h-9 px-3 cursor-pointer",
                      children: "⭐ Rate Service"
                    }) : null
                  ]
                })
              ]
            });
          })
        })
      }),

      /* Modal: Raise New Ticket */
      isRaising ? e.jsx("div", {
        className: "fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200",
        children: e.jsxs("div", {
          className: "bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl",
          children: [
            e.jsxs("div", {
              className: "p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("h3", { className: "font-black text-white text-lg", children: "Report Shipment Issue / Grievance" }),
                    e.jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: "Direct line to Jai Bhavani Cargo operations & fleet management." })
                  ]
                }),
                e.jsx("button", {
                  onClick: () => setIsRaising(false),
                  className: "p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer",
                  children: e.jsx(de, { className: "w-4 h-4" })
                })
              ]
            }),

            e.jsxs("form", {
              onSubmit: handleCreateTicketSubmit,
              className: "p-5 space-y-4",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "text-xs font-bold text-slate-300 block mb-1", children: "Linked Shipment / Consignment (Optional):" }),
                    e.jsxs("select", {
                      value: form.tripId,
                      onChange: (ev) => setForm({ ...form, tripId: ev.target.value }),
                      className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-rose-500",
                      children: [
                        e.jsx("option", { value: "", children: "-- General / Non-Shipment Grievance --" }),
                        trips.map(tp => e.jsx("option", {
                          key: tp.id,
                          value: tp.id,
                          children: (tp.trip_id || tp.id.slice(0, 8)) + " • " + (tp.truck_number || "Truck") + " • " + (tp.route || (tp.origin + " → " + tp.destination))
                        }))
                      ]
                    })
                  ]
                }),

                e.jsxs("div", {
                  className: "grid grid-cols-2 gap-3",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsx("label", { className: "text-xs font-bold text-slate-300 block mb-1", children: "Issue Type *" }),
                        e.jsxs("select", {
                          value: form.category,
                          onChange: (ev) => setForm({ ...form, category: ev.target.value }),
                          className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-rose-500",
                          children: [
                            e.jsx("option", { value: "delay", children: "⏱️ Delivery Delay / Stoppage" }),
                            e.jsx("option", { value: "damage", children: "📦 Cargo Damage / Shortage" }),
                            e.jsx("option", { value: "pod", children: "📄 Missing / Illegible POD" }),
                            e.jsx("option", { value: "billing", children: "💵 Billing & Invoice Discrepancy" }),
                            e.jsx("option", { value: "driver", children: "🚚 Driver Conduct / Unreachable" }),
                            e.jsx("option", { value: "other", children: "❓ Other / General" })
                          ]
                        })
                      ]
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx("label", { className: "text-xs font-bold text-slate-300 block mb-1", children: "Priority Severity *" }),
                        e.jsxs("select", {
                          value: form.priority,
                          onChange: (ev) => setForm({ ...form, priority: ev.target.value }),
                          className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-rose-500",
                          children: [
                            e.jsx("option", { value: "urgent", children: "🚨 Urgent / Critical Delay" }),
                            e.jsx("option", { value: "high", children: "High Priority" }),
                            e.jsx("option", { value: "medium", children: "Medium" }),
                            e.jsx("option", { value: "low", children: "Low" })
                          ]
                        })
                      ]
                    })
                  ]
                }),

                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "text-xs font-bold text-slate-300 block mb-1", children: "Complaint Summary / Subject *" }),
                    e.jsx(K, {
                      required: !0,
                      placeholder: "e.g. 3 Hour In-Transit Stoppage / Water Damage on 2 Boxes",
                      value: form.subject,
                      onChange: (ev) => setForm({ ...form, subject: ev.target.value }),
                      className: "bg-slate-950 border-slate-800 text-slate-100"
                    })
                  ]
                }),

                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "text-xs font-bold text-slate-300 block mb-1", children: "Detailed Remarks *" }),
                    e.jsx("textarea", {
                      required: !0,
                      rows: 3,
                      placeholder: "Provide complete details of the issue, warehouse dock location, or expected assistance...",
                      value: form.description,
                      onChange: (ev) => setForm({ ...form, description: ev.target.value }),
                      className: "w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-rose-500"
                    })
                  ]
                }),

                e.jsxs("div", {
                  children: [
                    e.jsx("label", { className: "text-xs font-bold text-slate-300 block mb-1", children: "Photo / Supporting Document Link (Optional):" }),
                    e.jsx(K, {
                      placeholder: "https://... damage photo or challan image link",
                      value: form.photoUrl,
                      onChange: (ev) => setForm({ ...form, photoUrl: ev.target.value }),
                      className: "bg-slate-950 border-slate-800 text-slate-100 font-mono text-xs"
                    })
                  ]
                }),

                e.jsxs("div", {
                  className: "flex justify-end gap-3 pt-3 border-t border-slate-800",
                  children: [
                    e.jsx(j, {
                      type: "button",
                      onClick: () => setIsRaising(false),
                      variant: "outline",
                      className: "rounded-xl border-slate-700 text-slate-300 text-xs",
                      children: "Cancel"
                    }),
                    e.jsx(j, {
                      type: "submit",
                      className: "rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer",
                      children: "Submit Complaint"
                    })
                  ]
                })
              ]
            })
          ]
        })
      }) : null,

      /* Drawer: Ticket Timeline & Chat */
      activeTicket ? e.jsx("div", {
        className: "fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-end p-0 animate-in fade-in duration-200",
        children: e.jsxs("div", {
          className: "bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full flex flex-col shadow-2xl overflow-hidden",
          children: [
            /* Header */
            e.jsxs("div", {
              className: "p-5 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-4",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsxs("div", {
                      className: "flex items-center gap-2 mb-1",
                      children: [
                        e.jsx("span", { className: "font-mono font-bold text-xs text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/20", children: activeTicket.ticket_number }),
                        e.jsx("span", { className: "text-xs uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300", children: activeTicket.category }),
                        activeTicket.is_escalated ? e.jsx("span", { className: "text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse", children: "🚨 Escalated" }) : null
                      ]
                    }),
                    e.jsx("h3", { className: "text-base font-bold text-white", children: activeTicket.subject }),
                    activeTicket.is_escalated ? e.jsx("p", { className: "text-[11px] text-rose-400 font-semibold mt-1", children: "• Escalated to Senior Management at operations@jaibhavanicargo.com" }) : null
                  ]
                }),
                e.jsx("button", {
                  onClick: () => setActiveTicket(null),
                  className: "p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer",
                  children: e.jsx(de, { className: "w-5 h-5" })
                })
              ]
            }),

            /* Evidence image if available */
            activeTicket.attachments && activeTicket.attachments.length > 0 ? e.jsxs("div", {
              className: "p-4 bg-slate-950/80 border-b border-slate-800",
              children: [
                e.jsx("p", { className: "text-[11px] font-bold text-slate-400 uppercase mb-2", children: "Uploaded Evidence Photos:" }),
                e.jsx("div", {
                  className: "flex items-center gap-2 overflow-x-auto",
                  children: activeTicket.attachments.map((img, idx) => e.jsx("a", {
                    key: idx,
                    href: img,
                    target: "_blank",
                    rel: "noreferrer",
                    children: e.jsx("img", {
                      src: img,
                      alt: "Evidence",
                      className: "w-20 h-20 object-cover rounded-xl border border-slate-700 shadow"
                    })
                  }))
                })
              ]
            }) : null,

            /* Rating box if resolved */
            (activeTicket.status === "resolved" || activeTicket.status === "closed") && !activeTicket.rating ? e.jsxs("div", {
              className: "p-4 bg-amber-500/10 border-b border-amber-500/20 space-y-2",
              children: [
                e.jsx("p", { className: "text-xs font-bold text-amber-300", children: "This ticket has been marked Resolved. How would you rate our resolution?" }),
                e.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    [1, 2, 3, 4, 5].map(st => e.jsx("button", {
                      key: st,
                      type: "button",
                      onClick: () => setStarRating(st),
                      className: "text-xl transition cursor-pointer " + (starRating >= st ? "text-amber-400 scale-110" : "text-slate-600"),
                      children: "★"
                    })),
                    e.jsx("span", { className: "text-xs font-bold text-amber-400 ml-2", children: starRating + ".0 Stars" })
                  ]
                }),
                e.jsxs("div", {
                  className: "flex gap-2",
                  children: [
                    e.jsx(K, {
                      placeholder: "Optional feedback note...",
                      value: feedbackNote,
                      onChange: (ev) => setFeedbackNote(ev.target.value),
                      className: "bg-slate-950 border-slate-800 text-xs h-9"
                    }),
                    e.jsx(j, {
                      onClick: () => handleRateTicket(activeTicket),
                      className: "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs h-9 px-3 cursor-pointer",
                      children: "Submit Rating"
                    })
                  ]
                })
              ]
            }) : null,

            /* Messages Timeline */
            e.jsxs("div", {
              className: "flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/40",
              children: [
                e.jsxs("div", {
                  className: "bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl",
                  children: [
                    e.jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1", children: "Grievance Description:" }),
                    e.jsx("p", { className: "text-xs text-slate-200 leading-relaxed", children: activeTicket.description })
                  ]
                }),

                activeTicket.messages && activeTicket.messages.filter(m => !m.is_internal_note).map(m => {
                  const isClient = m.sender_type === "client";
                  return e.jsx("div", {
                    key: m.id,
                    className: "flex flex-col " + (isClient ? "items-end" : "items-start"),
                    children: e.jsxs("div", {
                      className: "max-w-[85%] p-3.5 rounded-2xl text-xs space-y-1 " + (
                        isClient ? "bg-rose-600 text-white rounded-br-none" : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700"
                      ),
                      children: [
                        e.jsxs("div", {
                          className: "flex items-center justify-between gap-4 text-[10px] opacity-80 mb-0.5",
                          children: [
                            e.jsx("span", { className: "font-bold", children: m.sender_name }),
                            e.jsx("span", { className: "font-mono", children: m.created_at ? m.created_at.slice(11, 16) : "" })
                          ]
                        }),
                        e.jsx("p", { className: "leading-relaxed", children: m.message })
                      ]
                    })
                  });
                })
              ]
            }),

            /* Reply Form */
            e.jsxs("form", {
              onSubmit: handleSendReply,
              className: "p-4 bg-slate-950 border-t border-slate-800 space-y-2.5",
              children: [
                !activeTicket.is_escalated && activeTicket.status !== "resolved" && activeTicket.status !== "closed" ? e.jsxs("div", {
                  className: "flex justify-end",
                  children: [
                    e.jsx("button", {
                      type: "button",
                      onClick: () => handleEscalate(activeTicket),
                      className: "text-[11px] text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer",
                      children: "🚨 Issue not progressing? Escalate to operations@jaibhavanicargo.com"
                    })
                  ]
                }) : null,

                e.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    e.jsx(K, {
                      value: replyText,
                      onChange: (ev) => setReplyText(ev.target.value),
                      placeholder: "Write message to JBC Operations...",
                      className: "bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl h-11"
                    }),
                    e.jsx(j, {
                      type: "submit",
                      className: "rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold h-11 px-5 cursor-pointer",
                      children: "Send"
                    })
                  ]
                })
              ]
            })
          ]
        })
      }) : null
    ]
  });
}
`;

    // Inject supportTabComponent right before `function at(){`
    const atIdx = code.indexOf('function at(){');
    if (atIdx !== -1) {
      code = code.slice(0, atIdx) + supportTabComponent + '\n' + code.slice(atIdx);
      console.log('✓ Injected ClientPortalSupportTab component into:', full);
    }

    // Validate with esbuild
    try {
      esbuild.transformSync(code, { loader: 'js' });
      fs.writeFileSync(full, code, 'utf8');
      console.log('✓ Successfully validated and saved:', full);
    } catch(err) {
      console.error('❌ Validation failed for', full, err.message);
      process.exit(1);
    }
  }
}

console.log('=== ClientPortalPage patching finished successfully! ===');
