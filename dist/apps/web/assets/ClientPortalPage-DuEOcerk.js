import{bF as Fe,r as c,j as e,bs as Be,aU as Ee,b2 as Re,a1 as le,a3 as Oe,a6 as ne,af as Y,az as oe,aG as ie,at as Ue,ar as O,ao as He,aE as de}from"./vendor-react-Bs5V2qFE.js";import{u as Ve,K as ze,N as qe,m as We,w as p,S as ce,e as me,g as xe,h as ue,i as D,B as j,C as y,O as M,ag as T,n as Ye,o as Ke,q as Qe,r as Ge,I as K,s as Je,v as P,x as A,y as U,z as H,A as b,E as l,F as V,G as r,k as C,p as N,t as w,D as he,a as pe,b as be,c as ge,d as fe,L as Q,j as Xe}from"./index-DLxf9dwO.js";import"./vendor-radix-BQCqNqg0.js";import"./vendor-pdf-DtmgLs_2.js";
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

function at(){const{currentUser:i}=Ve(),{isAdmin:$,isSuperAdmin:I}=ze(),[je]=Fe(),Ne=je.get("clientId"),[G,ve]=c.useState([]),[J,X]=c.useState(""),[x,_e]=c.useState(null),[h,ye]=c.useState([]),[Ce,Z]=c.useState(!0),[z,we]=c.useState(""),[g,ke]=c.useState(null),[De,ee]=c.useState(!1),[Se,F]=c.useState(!1),[v,Le]=c.useState(null),[S,q]=c.useState(""),[Me,Te]=c.useState("18"),[B,te]=c.useState("Monthly (1 Month)"),[se]=c.useState([{id:"LANE-101",route:"Hyderabad → Mumbai",origin:"Hyderabad, TS",destination:"Mumbai, MH",benchmark_rate:48e3,ai_rate:49500,distance_km:710,required_truck:"32 FT Container SXL",contract_duration:"Weekly (7 Days)"},{id:"LANE-102",route:"Bengaluru → Delhi NCR",origin:"Bengaluru, KA",destination:"Delhi NCR",benchmark_rate:85e3,ai_rate:87200,distance_km:1740,required_truck:"40 FT High Cube Trailer",contract_duration:"Monthly (1 Month)"},{id:"LANE-103",route:"Chennai → Kolkata",origin:"Chennai, TN",destination:"Kolkata, WB",benchmark_rate:62e3,ai_rate:61500,distance_km:1660,required_truck:"24 FT Open Body",contract_duration:"3 Months (Quarterly)"},{id:"LANE-104",route:"Ahmedabad → Hyderabad",origin:"Ahmedabad, GJ",destination:"Hyderabad, TS",benchmark_rate:54e3,ai_rate:55800,distance_km:1210,required_truck:"32 FT Multi-Axle",contract_duration:"6 Months (Half-Yearly)"},{id:"LANE-105",route:"Mumbai → Delhi NCR",origin:"Mumbai, MH",destination:"Delhi NCR",benchmark_rate:92e3,ai_rate:94e3,distance_km:1420,required_truck:"32 FT SXL Container",contract_duration:"1 Year (Annual)"}]),Pe=async()=>{if(!(!S||!v))try{await N.collection("trip_logs").create({route:v.route,start_location:v.origin,end_location:v.destination,cargo_type:`${B} Contract Load`,revenue:Number(S),trip_status:"Bidding Open",notes:`Client Contract Bid: ₹${S} (${B}) for ${v.route} by ${x?.client_name||i?.email}`},{$autoCancel:!1}).catch(()=>null),w.success(`Bid of ₹${Number(S).toLocaleString("en-IN")} (${B}) submitted for ${v.route}! Admin will review your bid.`),F(!1),q("")}catch(t){console.error("Bid submission error:",t),w.error("Could not submit bid")}},W=async(t=null)=>{Z(!0);try{let o=[];if($||I)try{o=await N.collection("clients").getFullList({sort:"client_name",$autoCancel:!1})}catch(a){console.warn("[ClientPortalPage] Could not list all clients:",a?.message)}ve(o);let s=null;if($||I){const a=t||J||Ne;a&&o.length>0&&(s=o.find(u=>u.id===a)),!s&&o.length>0&&(s=o[0])}else{if(i?.client_id&&(s=await N.collection("clients").getOne(i.client_id,{$autoCancel:!1}).catch(()=>null)),!s&&i?.id&&(s=await N.collection("clients").getFirstListItem(`portal_user_id = "${i.id}"`,{$autoCancel:!1}).catch(()=>null)),!s&&i?.email){const a=(i.email||"").toLowerCase().trim();s=await N.collection("clients").getFirstListItem(`email = "${a}"`,{$autoCancel:!1}).catch(()=>null)}if(!s&&(i?.name||i?.company)){const a=(i.name||"").toLowerCase().trim(),u=(i.company||"").toLowerCase().trim(),k=u?`company_name ~ "${u}" || client_name ~ "${u}"`:`client_name ~ "${a}" || company_name ~ "${a}"`;s=await N.collection("clients").getFirstListItem(k,{$autoCancel:!1}).catch(()=>null)}s||(s={id:i?.id?`client-${i.id}`:"client-custom",client_name:i?.name||i?.username||"Client Account",company_name:i?.company||i?.name||"Logistics Division",email:i?.email||"client@company.com",phone:i?.phone_number||i?.phone||"+91 7794072244",contact_person:i?.name||"Supply Chain Manager",gst_number:i?.gst_number||"36AAACR9823P1Z5",address:"Corporate Logistics Depot"})}_e(s),s&&X(s.id);let _=[];try{s?.id&&!s.id.startsWith("client-")&&(_=await N.collection("trip_logs").getFullList({filter:`client_id = "${s.id}" || client_name ~ "${s.client_name}"`,sort:"-date",$autoCancel:!1}).catch(()=>[])),_.length===0&&(_=await N.collection("trip_logs").getFullList({sort:"-date",$autoCancel:!1}).catch(()=>[]))}catch(a){console.warn("[ClientPortalPage] Could not fetch trip_logs:",a?.message)}const f=s?.id,d=(s?.client_name||"").trim().toLowerCase(),L=(s?.company_name||"").trim().toLowerCase(),E=(s?.email||"").trim().toLowerCase(),n=_.filter(a=>{if(!s)return!1;const u=a.client_id||a.expand?.client_id?.id;if(u&&f&&u===f)return!0;const k=(a.client_name||a.client||a.expand?.client_id?.client_name||"").trim().toLowerCase(),R=(a.company_name||a.expand?.client_id?.company_name||"").trim().toLowerCase();if(d&&(k===d||R===d)||L&&(k===L||R===L))return!0;const re=(a.client_email||a.email||"").trim().toLowerCase();return!!(E&&re&&re===E)});ye(n)}catch(o){console.error("[ClientPortalPage] Error loading portal data:",o),w.error("Failed to load client shipments")}finally{Z(!1)}};c.useEffect(()=>{W()},[i]);const Ae=t=>{($||I)&&(X(t),W(t))},m=c.useMemo(()=>{const t=h.filter(n=>n.trip_status==="Upcoming"||n.trip_status==="Scheduled"||n.trip_status==="Pending"),o=h.filter(n=>n.trip_status==="Dispatched"||n.trip_status==="In Transit"||n.trip_status==="Active"),s=h.filter(n=>n.trip_status==="Delivered"||n.trip_status==="Completed"),_=h.reduce((n,a)=>n+(Number(a.revenue)||Number(a.freight_amount)||0),0),f=h.reduce((n,a)=>n+(Number(a.advance_received_from_client)||0),0),L=h.filter(n=>{const a=n.trip_status==="Delivered"||n.trip_status==="Completed",u=(n.client_payment_status||"").toLowerCase();return a&&u!=="received"&&u!=="paid"}).reduce((n,a)=>{const u=Number(a.revenue)||Number(a.freight_amount)||0,k=Number(a.advance_received_from_client)||0,R=Number(a.toll_deduction)||0;return n+Math.max(0,u-k-R)},0),E=s.filter(n=>n.pod_url||n.pod_file||n.pod_link||n.pod_status==="Uploaded"||n.pod_uploaded).length;return{upcomingTrips:t,activeShipments:o,completedTrips:s,upcomingCount:t.length,activeCount:o.length,completedCount:s.length,totalFreight:_,totalAdvance:f,payableAmount:L,podsCount:E}},[h,x]),ae=c.useMemo(()=>h.filter(t=>{const o=z.toLowerCase();return o?t.trip_id&&t.trip_id.toLowerCase().includes(o)||t.truck_number&&t.truck_number.toLowerCase().includes(o)||t.route&&t.route.toLowerCase().includes(o)||t.driver_name&&t.driver_name.toLowerCase().includes(o):!0}),[h,z]),$e=t=>{const o=t.pod_url||t.pod_link||(t.pod_file?N.files.getUrl(t,t.pod_file):null);ke({...t,podUrl:o}),ee(!0)},Ie=()=>{if(h.length===0){w.error("No freight logs available to export");return}const t=["Trip ID","Date","Vehicle No","Route","Driver","Trip Status","Total Freight (INR)","Advance Paid (INR)","Payment Status"],o=h.map(d=>[d.trip_id||d.id,d.date?C(new Date(d.date),"yyyy-MM-dd"):d.start_date?C(new Date(d.start_date),"yyyy-MM-dd"):"",d.truck_number||"",`"${d.route||""}"`,`"${d.driver_name||""}"`,d.trip_status||"",d.revenue||d.freight_amount||0,d.advance_received_from_client||0,d.client_payment_status||"Pending"]),s="data:text/csv;charset=utf-8,"+[t.join(","),...o.map(d=>d.join(","))].join(`
`),_=encodeURI(s),f=document.createElement("a");f.setAttribute("href",_),f.setAttribute("download",`Freight_Statement_${x?.client_name||"Client"}_${C(new Date,"yyyyMMdd")}.csv`),document.body.appendChild(f),f.click(),document.body.removeChild(f),w.success("Freight log exported successfully")};return Ce?e.jsx("div",{className:"h-full w-full flex items-center justify-center p-12",children:e.jsx(qe,{text:"Loading client portal statement & shipments..."})}):e.jsxs(We.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{duration:.35},className:"p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8",children:[e.jsx(Be,{children:e.jsx("title",{children:"Client Portal | Jai Bhavani Cargo"})}),e.jsxs("div",{className:"relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 shadow-2xl",children:[e.jsx("div",{className:"absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"}),e.jsx("div",{className:"absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"}),e.jsxs("div",{className:"relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-2xl shadow-xl shrink-0",children:x?.client_name?x.client_name.charAt(0).toUpperCase():"C"}),e.jsxs("div",{className:"space-y-1",children:[e.jsxs("div",{className:"flex items-center gap-2.5 flex-wrap",children:[e.jsx("h1",{className:"text-2xl sm:text-3xl font-heading font-black text-white tracking-tight",children:x?.client_name||"Corporate Client Portal"}),x?.company_name&&e.jsx(p,{variant:"outline",className:"bg-slate-800/80 text-slate-300 border-slate-700 text-xs font-semibold",children:x.company_name}),e.jsxs(p,{className:"bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs px-2.5 py-0.5 flex items-center gap-1",children:[e.jsx(Ee,{className:"w-3.5 h-3.5 text-emerald-400"})," Verified Portal Client"]})]}),e.jsxs("p",{className:"text-xs sm:text-sm text-slate-400 flex items-center gap-4 flex-wrap pt-0.5",children:[x?.gst_number&&e.jsxs("span",{children:["GSTIN: ",e.jsx("strong",{className:"font-mono text-emerald-400",children:x.gst_number})]}),x?.phone&&e.jsxs("span",{children:["Hotline: ",e.jsx("strong",{className:"text-slate-200",children:x.phone})]}),e.jsxs("span",{children:["Account Manager: ",e.jsx("strong",{className:"text-slate-200",children:x?.contact_person||"Jai Bhavani Logistics Desk"})]})]})]})]}),e.jsxs("div",{className:"flex items-center gap-3 w-full lg:w-auto justify-end flex-wrap",children:[($||I)&&G.length>0&&e.jsx("div",{className:"w-56",children:e.jsxs(ce,{value:J,onValueChange:Ae,children:[e.jsx(me,{className:"bg-slate-900/90 border-slate-800 text-xs font-semibold rounded-xl text-slate-200",children:e.jsx(xe,{placeholder:"Select Client Preview"})}),e.jsx(ue,{className:"bg-slate-900 border-slate-800 text-slate-100",children:G.map(t=>e.jsxs(D,{value:t.id,children:[t.client_name," ",t.company_name?`(${t.company_name})`:""]},t.id))})]})}),e.jsxs(j,{onClick:()=>W(),variant:"outline",size:"sm",className:"rounded-xl bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 h-9",children:[e.jsx(Re,{className:"w-4 h-4 mr-1.5"})," Refresh"]}),e.jsxs(j,{onClick:Ie,size:"sm",variant:"secondary",className:"rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 h-9",children:[e.jsx(le,{className:"w-4 h-4 mr-1.5"})," CSV Ledger"]})]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4",children:[e.jsx(y,{className:"bg-gradient-to-br from-rose-950/40 via-card to-card border-rose-500/30 shadow-soft rounded-2xl relative overflow-hidden",children:e.jsxs(M,{className:"p-4 relative z-10",children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-rose-400",children:"Net Payable Dues"}),e.jsx("div",{className:"p-1.5 bg-rose-500/20 rounded-lg text-rose-400",children:e.jsx(Oe,{className:"w-3.5 h-3.5"})})]}),e.jsx("div",{className:"text-2xl font-black text-rose-400 font-heading",children:T(m.payableAmount)}),e.jsx("div",{className:"text-[11px] text-muted-foreground mt-1",children:"Delivered Net Freight Dues"})]})}),e.jsx(y,{className:"bg-gradient-to-br from-blue-950/40 via-card to-card border-blue-500/30 shadow-soft rounded-2xl relative overflow-hidden",children:e.jsxs(M,{className:"p-4 relative z-10",children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-blue-400",children:"Active In-Transit"}),e.jsx("div",{className:"p-1.5 bg-blue-500/20 rounded-lg text-blue-400",children:e.jsx(ne,{className:"w-3.5 h-3.5"})})]}),e.jsx("div",{className:"text-2xl font-black text-blue-400 font-heading",children:m.activeCount}),e.jsx("div",{className:"text-[11px] text-muted-foreground mt-1",children:"Live Moving Cargo Trucks"})]})}),e.jsx(y,{className:"bg-gradient-to-br from-amber-950/40 via-card to-card border-amber-500/30 shadow-soft rounded-2xl relative overflow-hidden",children:e.jsxs(M,{className:"p-4 relative z-10",children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-amber-400",children:"Upcoming Trips"}),e.jsx("div",{className:"p-1.5 bg-amber-500/20 rounded-lg text-amber-400",children:e.jsx(Y,{className:"w-3.5 h-3.5"})})]}),e.jsx("div",{className:"text-2xl font-black text-amber-400 font-heading",children:m.upcomingCount}),e.jsx("div",{className:"text-[11px] text-muted-foreground mt-1",children:"Scheduled Dispatch Loads"})]})}),e.jsx(y,{className:"bg-gradient-to-br from-teal-950/40 via-card to-card border-teal-500/30 shadow-soft rounded-2xl relative overflow-hidden",children:e.jsxs(M,{className:"p-4 relative z-10",children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-teal-400",children:"Delivered Shipments"}),e.jsx("div",{className:"p-1.5 bg-teal-500/20 rounded-lg text-teal-400",children:e.jsx(oe,{className:"w-3.5 h-3.5"})})]}),e.jsx("div",{className:"text-2xl font-black text-teal-400 font-heading",children:m.completedCount}),e.jsx("div",{className:"text-[11px] text-muted-foreground mt-1",children:"Delivered Destinations"})]})}),e.jsx(y,{className:"bg-gradient-to-br from-indigo-950/40 via-card to-card border-indigo-500/30 shadow-soft rounded-2xl relative overflow-hidden",children:e.jsxs(M,{className:"p-4 relative z-10",children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-indigo-400",children:"POD Vault"}),e.jsx("div",{className:"p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400",children:e.jsx(ie,{className:"w-3.5 h-3.5"})})]}),e.jsx("div",{className:"text-2xl font-black text-indigo-400 font-heading",children:m.podsCount}),e.jsx("div",{className:"text-[11px] text-muted-foreground mt-1",children:"Verified Delivery Proofs"})]})})]}),e.jsx(y,{className:"border-border/50 shadow-soft bg-card rounded-2xl overflow-hidden",children:e.jsxs(Ye,{defaultValue:"completed",className:"w-full",children:[e.jsx(Ke,{className:"pb-0 border-b border-border/40 bg-secondary/10",children:e.jsxs("div",{className:"flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4",children:[e.jsxs("div",{children:[e.jsx(Qe,{className:"font-heading text-xl",children:"Shipments & Freight Ledger"}),e.jsx(Ge,{children:"Real-time active tracking, proof of delivery downloads, and freight statements."})]}),e.jsxs("div",{className:"flex items-center gap-3 w-full md:w-auto flex-wrap",children:[e.jsxs("div",{className:"relative w-48",children:[e.jsx(Ue,{className:"absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"}),e.jsx(K,{placeholder:"Search trip, route, vehicle...",value:z,onChange:t=>we(t.target.value),className:"pl-8 h-9 text-xs rounded-xl bg-background"})]}),e.jsxs(Je,{className:"bg-background border border-border/50 p-1 rounded-xl flex-wrap",children:[e.jsxs(P,{value:"upcoming",className:"rounded-lg text-xs font-bold px-3 py-1.5",children:["Upcoming (",m.upcomingCount,")"]}),e.jsxs(P,{value:"active",className:"rounded-lg text-xs font-bold px-3 py-1.5",children:["In-Transit (",m.activeCount,")"]}),e.jsxs(P,{value:"completed",className:"rounded-lg text-xs font-bold px-3 py-1.5",children:["Completed & PODs (",m.completedCount,")"]}),e.jsxs(P,{value:"all",className:"rounded-lg text-xs font-bold px-3 py-1.5",children:["All Freight (",h.length,")"]}),e.jsxs(P,{value:"bidding",className:"rounded-lg text-xs font-bold px-3 py-1.5 border border-amber-500/30 text-amber-400",children:[e.jsx(O,{className:"w-3 h-3 mr-1"}),e.jsxs(P,{value:"support",className:"rounded-lg text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 text-rose-400 data-[state=active]:bg-rose-600 data-[state=active]:text-white",children:[e.jsx(oe,{className:"w-3.5 h-3.5 mr-1"}),"Support & Complaints"]})," Lane Bidding & Rates"]})]})]})]})}),e.jsx(A,{value:"upcoming",className:"p-0 m-0",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(U,{children:[e.jsx(H,{className:"bg-muted/30",children:e.jsxs(b,{children:[e.jsx(l,{className:"pl-6 font-semibold",children:"Trip ID"}),e.jsx(l,{className:"font-semibold",children:"Scheduled Date"}),e.jsx(l,{className:"font-semibold",children:"Vehicle No."}),e.jsx(l,{className:"font-semibold",children:"Route"}),e.jsx(l,{className:"font-semibold",children:"Driver"}),e.jsx(l,{className:"font-semibold text-center",children:"Status"}),e.jsx(l,{className:"pr-6 text-right font-semibold",children:"Estimated Freight (₹)"})]})}),e.jsx(V,{children:m.upcomingTrips.length===0?e.jsx(b,{children:e.jsx(r,{colSpan:7,className:"text-center py-12 text-muted-foreground",children:"No upcoming scheduled trips at the moment."})}):m.upcomingTrips.map(t=>e.jsxs(b,{className:"hover:bg-muted/30 transition-colors",children:[e.jsx(r,{className:"pl-6 font-mono font-bold text-sm text-amber-400",children:t.trip_id||t.id}),e.jsx(r,{className:"whitespace-nowrap text-xs text-muted-foreground",children:t.date?C(new Date(t.date),"dd MMM yyyy"):"—"}),e.jsx(r,{className:"font-mono font-bold text-sm",children:t.truck_number||"—"}),e.jsx(r,{className:"font-medium text-sm",children:t.route||"—"}),e.jsx(r,{className:"text-xs text-muted-foreground",children:t.driver_name||"—"}),e.jsx(r,{className:"text-center",children:e.jsx(p,{variant:"outline",className:"bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold text-xs",children:t.trip_status||"Upcoming"})}),e.jsx(r,{className:"pr-6 text-right font-bold text-sm font-mono",children:T(t.revenue||t.freight_amount||0)})]},t.id))})]})})}),e.jsx(A,{value:"active",className:"p-0 m-0",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(U,{children:[e.jsx(H,{className:"bg-muted/30",children:e.jsxs(b,{children:[e.jsx(l,{className:"pl-6 font-semibold",children:"Trip ID"}),e.jsx(l,{className:"font-semibold",children:"Dispatch Date"}),e.jsx(l,{className:"font-semibold",children:"Vehicle No."}),e.jsx(l,{className:"font-semibold",children:"Route"}),e.jsx(l,{className:"font-semibold",children:"Driver Contact"}),e.jsx(l,{className:"font-semibold text-center",children:"Status"}),e.jsx(l,{className:"pr-6 text-right font-semibold",children:"Freight Amount (₹)"})]})}),e.jsx(V,{children:m.activeShipments.length===0?e.jsx(b,{children:e.jsx(r,{colSpan:7,className:"text-center py-12 text-muted-foreground",children:"No active in-transit shipments currently on route."})}):m.activeShipments.map(t=>e.jsxs(b,{className:"hover:bg-muted/30 transition-colors",children:[e.jsx(r,{className:"pl-6 font-mono font-bold text-sm text-primary",children:t.trip_id||t.id}),e.jsx(r,{className:"whitespace-nowrap text-xs text-muted-foreground",children:t.date?C(new Date(t.date),"dd MMM yyyy"):"—"}),e.jsx(r,{className:"font-mono font-bold text-sm",children:t.truck_number||"—"}),e.jsx(r,{className:"font-medium text-sm",children:t.route||"—"}),e.jsx(r,{className:"text-xs",children:t.driver_phone?e.jsxs(j,{variant:"ghost",size:"sm",onClick:()=>window.open(`tel:${t.driver_phone}`),className:"h-7 px-2 text-emerald-400 hover:text-emerald-300 font-bold",children:[e.jsx(He,{className:"w-3.5 h-3.5 mr-1"})," Call ",t.driver_name?`(${t.driver_name})`:""]}):t.driver_name||"—"}),e.jsx(r,{className:"text-center",children:e.jsx(p,{variant:"outline",className:"bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold text-xs animate-pulse",children:t.trip_status||"In-Transit"})}),e.jsx(r,{className:"pr-6 text-right font-bold text-sm font-mono",children:T(t.revenue||t.freight_amount||0)})]},t.id))})]})})}),e.jsx(A,{value:"completed",className:"p-0 m-0",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(U,{children:[e.jsx(H,{className:"bg-muted/30",children:e.jsxs(b,{children:[e.jsx(l,{className:"pl-6 font-semibold",children:"Trip ID"}),e.jsx(l,{className:"font-semibold",children:"Delivery Date"}),e.jsx(l,{className:"font-semibold",children:"Vehicle No."}),e.jsx(l,{className:"font-semibold",children:"Route"}),e.jsx(l,{className:"font-semibold text-center",children:"POD Status"}),e.jsx(l,{className:"font-semibold text-center",children:"Payment Status"}),e.jsx(l,{className:"pr-6 text-right font-semibold",children:"Action"})]})}),e.jsx(V,{children:m.completedTrips.length===0?e.jsx(b,{children:e.jsx(r,{colSpan:7,className:"text-center py-12 text-muted-foreground",children:"No completed delivered trips yet."})}):m.completedTrips.map(t=>{const o=t.pod_url||t.pod_link||(t.pod_file?N.files.getUrl(t,t.pod_file):null),s=(t.client_payment_status||"").toLowerCase()==="received"||(t.client_payment_status||"").toLowerCase()==="paid";return e.jsxs(b,{className:"hover:bg-muted/30 transition-colors",children:[e.jsx(r,{className:"pl-6 font-mono font-bold text-sm text-primary",children:t.trip_id||t.id}),e.jsx(r,{className:"whitespace-nowrap text-xs text-muted-foreground",children:t.date?C(new Date(t.date),"dd MMM yyyy"):"—"}),e.jsx(r,{className:"font-mono font-bold text-sm",children:t.truck_number||"—"}),e.jsx(r,{className:"font-medium text-sm",children:t.route||"—"}),e.jsx(r,{className:"text-center",children:o?e.jsxs(p,{variant:"outline",className:"bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold text-xs",children:[e.jsx(oe,{className:"w-3 h-3 mr-1"})," Verified POD"]}):e.jsxs(p,{variant:"outline",className:"bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold text-xs",children:[e.jsx(Y,{className:"w-3 h-3 mr-1"})," Pending POD"]})}),e.jsx(r,{className:"text-center",children:e.jsx(p,{variant:"outline",className:`font-bold text-xs ${s?"bg-emerald-500/10 text-emerald-400 border-emerald-500/30":"bg-rose-500/10 text-rose-400 border-rose-500/30"}`,children:s?"Paid":"Unpaid / Pending"})}),e.jsx(r,{className:"pr-6 text-right",children:o?e.jsxs(j,{size:"sm",onClick:()=>$e(t),className:"rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm",children:[e.jsx(de,{className:"w-3.5 h-3.5 mr-1.5"})," View POD"]}):e.jsxs(j,{size:"sm",variant:"outline",onClick:()=>w.success(`POD document request sent to dispatch desk for ${t.trip_id||t.id}`),className:"rounded-xl border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs font-semibold",children:[e.jsx(Y,{className:"w-3.5 h-3.5 mr-1"})," Request POD"]})})]},t.id)})})]})})}),e.jsx(A,{value:"all",className:"p-0 m-0",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(U,{children:[e.jsx(H,{className:"bg-muted/30",children:e.jsxs(b,{children:[e.jsx(l,{className:"pl-6 font-semibold",children:"Trip ID"}),e.jsx(l,{className:"font-semibold",children:"Date"}),e.jsx(l,{className:"font-semibold",children:"Vehicle No."}),e.jsx(l,{className:"font-semibold",children:"Route"}),e.jsx(l,{className:"font-semibold text-center",children:"Status"}),e.jsx(l,{className:"font-semibold text-center",children:"Payment Status"}),e.jsx(l,{className:"font-semibold text-right",children:"Advance Paid (₹)"}),e.jsx(l,{className:"pr-6 text-right font-semibold",children:"Total Freight (₹)"})]})}),e.jsx(V,{children:ae.length===0?e.jsx(b,{children:e.jsx(r,{colSpan:8,className:"text-center py-12 text-muted-foreground",children:"No freight statement logs found."})}):ae.map(t=>{const o=(t.client_payment_status||"").toLowerCase()==="received"||(t.client_payment_status||"").toLowerCase()==="paid";return e.jsxs(b,{className:"hover:bg-muted/30 transition-colors",children:[e.jsx(r,{className:"pl-6 font-mono font-bold text-sm text-primary",children:t.trip_id||t.id}),e.jsx(r,{className:"whitespace-nowrap text-xs text-muted-foreground",children:t.date?C(new Date(t.date),"dd MMM yyyy"):"—"}),e.jsx(r,{className:"font-mono font-bold text-sm",children:t.truck_number||"—"}),e.jsx(r,{className:"font-medium text-sm",children:t.route||"—"}),e.jsx(r,{className:"text-center",children:e.jsx(p,{variant:"outline",className:`font-bold text-xs ${t.trip_status==="Delivered"||t.trip_status==="Completed"?"bg-emerald-500/10 text-emerald-400 border-emerald-500/20":"bg-blue-500/10 text-blue-400 border-blue-500/20"}`,children:t.trip_status||"Scheduled"})}),e.jsx(r,{className:"text-center",children:e.jsx(p,{variant:"outline",className:`font-bold text-xs ${o?"bg-emerald-500/10 text-emerald-400 border-emerald-500/20":"bg-amber-500/10 text-amber-400 border-amber-500/20"}`,children:t.client_payment_status||"Pending"})}),e.jsx(r,{className:"text-right font-mono text-xs text-muted-foreground",children:T(t.advance_received_from_client||0)}),e.jsx(r,{className:"pr-6 text-right font-bold text-sm font-mono",children:T(t.revenue||t.freight_amount||0)})]},t.id)})})]})})}),e.jsxs(A,{value:"bidding",className:"p-5 m-0 space-y-4",children:[e.jsxs("div",{className:"flex justify-between items-center pb-2 border-b border-border/50",children:[e.jsxs("div",{children:[e.jsxs("h3",{className:"text-base font-bold text-foreground flex items-center gap-2",children:[e.jsx(O,{className:"w-4 h-4 text-amber-400"})," Active Route Lanes Bidding Exchange"]}),e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5",children:"Submit custom freight bids directly for dedicated transport lanes."})]}),e.jsxs(p,{className:"bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs font-mono",children:[se.length," Active Bidding Lanes"]})]}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:se.map(t=>e.jsxs(y,{className:"bg-card border-border/60 rounded-2xl p-4 space-y-3 hover:border-amber-400/50 transition-all",children:[e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsx(p,{variant:"outline",className:"text-[10px] text-amber-400 border-amber-400/30 font-mono",children:t.id}),e.jsx(p,{className:"bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px] font-mono",children:t.contract_duration})]}),e.jsx("h4",{className:"text-base font-extrabold text-foreground mt-1",children:t.route})]}),e.jsxs("span",{className:"text-xs text-muted-foreground font-mono",children:[t.distance_km," KM"]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-xl font-mono",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] text-muted-foreground",children:"BENCHMARK RATE:"}),e.jsxs("div",{className:"font-bold text-foreground",children:["₹",t.benchmark_rate.toLocaleString("en-IN")]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] text-amber-400",children:"AI RECOMMENDED:"}),e.jsxs("div",{className:"font-bold text-amber-400",children:["₹",t.ai_rate.toLocaleString("en-IN")]})]})]}),e.jsxs("div",{className:"flex items-center justify-between text-xs pt-1",children:[e.jsxs("span",{className:"text-muted-foreground text-[11px] flex items-center gap-1",children:[e.jsx(ne,{className:"w-3.5 h-3.5 text-primary"})," ",t.required_truck]}),e.jsxs(j,{size:"sm",onClick:()=>{Le(t),q(t.benchmark_rate.toString()),te(t.contract_duration||"Monthly (1 Month)"),F(!0)},className:"h-8 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl",children:[e.jsx(O,{className:"w-3 h-3 mr-1"})," Bid For Contract"]})]})]},t.id))})]})]})}),e.jsx(A,{value:"support",className:"p-4 sm:p-6 space-y-6",children:e.jsx(ClientPortalSupportTab,{client:x,trips:h,currentUser:i})}),e.jsx(he,{open:Se,onOpenChange:F,children:e.jsxs(pe,{className:"sm:max-w-md bg-card border-border shadow-2xl rounded-2xl p-6",children:[e.jsxs(be,{children:[e.jsxs(ge,{className:"text-lg font-bold flex items-center gap-2 text-amber-400",children:[e.jsx(O,{className:"w-5 h-5 text-amber-400"})," Submit Freight Contract Bid for ",v?.route]}),e.jsx(fe,{className:"text-xs text-muted-foreground",children:"Submit your target price and preferred contract tenure for this dedicated transport lane."})]}),e.jsxs("div",{className:"space-y-4 py-2",children:[e.jsxs("div",{className:"bg-muted/40 p-3 rounded-xl border border-border text-xs space-y-1 font-mono",children:[e.jsxs("div",{children:["Target Benchmark: ",e.jsxs("strong",{className:"text-foreground",children:["₹",v?.benchmark_rate?.toLocaleString("en-IN")]})]}),e.jsxs("div",{children:["AI Market Estimate: ",e.jsxs("strong",{className:"text-amber-400",children:["₹",v?.ai_rate?.toLocaleString("en-IN")]})]})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(Q,{className:"text-xs",children:"Contract Tenure / Duration"}),e.jsxs(ce,{value:B,onValueChange:te,children:[e.jsx(me,{className:"bg-background border-border text-xs rounded-xl font-bold",children:e.jsx(xe,{placeholder:"Select Contract Duration"})}),e.jsxs(ue,{className:"bg-slate-900 border-slate-800 text-slate-100",children:[e.jsx(D,{value:"Weekly (7 Days)",children:"Weekly Contract (7 Days)"}),e.jsx(D,{value:"Monthly (1 Month)",children:"Monthly Contract (1 Month)"}),e.jsx(D,{value:"3 Months (Quarterly)",children:"3 Months Contract (Quarterly)"}),e.jsx(D,{value:"6 Months (Half-Yearly)",children:"6 Months Contract (Half-Yearly)"}),e.jsx(D,{value:"1 Year (Annual)",children:"1 Year Contract (Annual Dedicated)"})]})]})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(Q,{className:"text-xs",children:"Your Bid Amount per Trip / Month (₹)"}),e.jsx(K,{type:"number",value:S,onChange:t=>q(t.target.value),className:"bg-background border-border text-sm font-bold font-mono text-emerald-400 rounded-xl"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(Q,{className:"text-xs",children:"Cargo Weight (Tons)"}),e.jsx(K,{type:"number",value:Me,onChange:t=>Te(t.target.value),className:"bg-background border-border text-xs rounded-xl text-foreground"})]})]}),e.jsxs(Xe,{children:[e.jsx(j,{variant:"outline",onClick:()=>F(!1),className:"rounded-xl text-xs",children:"Cancel"}),e.jsx(j,{onClick:Pe,className:"bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl",children:"Submit Bid to Admin"})]})]})}),g&&e.jsx(he,{open:De,onOpenChange:ee,children:e.jsxs(pe,{className:"sm:max-w-[650px] bg-card border-border shadow-2xl rounded-2xl",children:[e.jsxs(be,{children:[e.jsxs(ge,{className:"text-xl font-heading font-bold flex items-center gap-2",children:[e.jsx(ie,{className:"w-5 h-5 text-violet-400"}),"Proof of Delivery (POD) - ",g.trip_id||g.id]}),e.jsxs(fe,{children:["Vehicle: ",e.jsx("strong",{className:"text-foreground",children:g.truck_number})," | Route: ",e.jsx("strong",{className:"text-foreground",children:g.route})]})]}),e.jsxs("div",{className:"space-y-4 py-3",children:[e.jsx("div",{className:"aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-border flex items-center justify-center relative",children:g.podUrl?e.jsx("img",{src:g.podUrl,alt:"Proof of Delivery",className:"w-full h-full object-contain"}):e.jsx("p",{className:"text-xs text-muted-foreground",children:"No image preview available"})}),e.jsxs("div",{className:"flex gap-3 pt-2",children:[e.jsxs(j,{variant:"outline",className:"flex-1 rounded-xl",onClick:()=>window.open(g.podUrl,"_blank"),children:[e.jsx(de,{className:"w-4 h-4 mr-2"})," Open Full Document"]}),e.jsxs(j,{className:"flex-1 rounded-xl bg-violet-600 hover:bg-violet-700 text-white",onClick:()=>{const t=document.createElement("a");t.href=g.podUrl,t.download=`POD_${g.trip_id||g.id}.jpg`,document.body.appendChild(t),t.click(),document.body.removeChild(t),w.success("POD downloaded")},children:[e.jsx(le,{className:"w-4 h-4 mr-2"})," Download POD"]})]})]})]})})]})}export{at as default};
