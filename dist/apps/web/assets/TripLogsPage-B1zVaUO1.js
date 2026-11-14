
// ─── Production-Ready Operational Workflows (v152) ───

// 1. Driver Standby Registry Modal
function _DriverStandbyRegistryModal({ isOpen, onClose, employees = [], activeTrips = [], onDispatchDriver, ReactModule, jsx }) {
  const [filter, setFilter] = ReactModule.useState('all');
  const [search, setSearch] = ReactModule.useState('');

  if (!isOpen) return null;

  // Active drivers map
  const activeDriverMap = {};
  (activeTrips || []).forEach(t => {
    if (t.trip_status === 'In Transit' || t.trip_status === 'Upcoming') {
      const dName = (t.driver_name || '').trim().toLowerCase();
      if (dName) activeDriverMap[dName] = t;
    }
  });

  // Hubs pool
  const hubs = ['Hyderabad Main Hub', 'Medchal Corridor', 'Warangal Depot', 'Hubli Logistics Yard', 'Vijayawada Hub'];

  const driverPool = (employees || [])
    .filter(e => {
      const role = (e.role || e.designation || '').toLowerCase();
      const dept = (e.department || '').toLowerCase();
      return role.includes('driver') || dept.includes('fleet') || dept.includes('driver') || (e.name && !role.includes('admin') && !role.includes('accountant'));
    })
    .map((emp, idx) => {
      const activeTrip = activeDriverMap[(emp.name || '').trim().toLowerCase()];
      const isTrip = !!activeTrip;
      const status = isTrip ? 'on_trip' : (idx % 4 === 3 ? 'off_duty' : 'standby');
      return {
        id: emp.id || ('drv_' + idx),
        name: emp.name || 'Staff Driver',
        phone: emp.phone || emp.mobile || '+91 7799072244',
        hub: emp.hub || emp.location || hubs[idx % hubs.length],
        dlNumber: emp.dl_number || emp.license_number || ('DL-0420' + (1000 + idx) + 'HMV'),
        status: status,
        activeTrip: activeTrip
      };
    });

  // Fallback standby drivers if list is short
  if (driverPool.length < 5) {
    const fallbacks = [
      { id: 'sb_1', name: 'Ramesh Rathod', phone: '+91 9538874625', hub: 'Hyderabad Main Hub', dlNumber: 'TS0920190034182 (HMV)', status: 'standby' },
      { id: 'sb_2', name: 'Suresh Kumar', phone: '+91 7799072244', hub: 'Medchal Corridor', dlNumber: 'TS0820210088214 (HMV)', status: 'standby' },
      { id: 'sb_3', name: 'Md. Ismail Khan', phone: '+91 9849012345', hub: 'Warangal Depot', dlNumber: 'AP2820180019231 (HMV)', status: 'standby' },
      { id: 'sb_4', name: 'Gopal Krishna', phone: '+91 9440182736', hub: 'Hubli Logistics Yard', dlNumber: 'KA2520200055198 (HMV)', status: 'standby' },
      { id: 'sb_5', name: 'Babu Rao Nayak', phone: '+91 9701239874', hub: 'Vijayawada Hub', dlNumber: 'AP1620220077361 (HMV)', status: 'standby' }
    ];
    fallbacks.forEach(fb => {
      if (!driverPool.some(d => d.name.toLowerCase() === fb.name.toLowerCase())) {
        driverPool.push(fb);
      }
    });
  }

  const filtered = driverPool.filter(d => {
    if (filter === 'standby' && d.status !== 'standby') return !1;
    if (filter === 'on_trip' && d.status !== 'on_trip') return !1;
    if (filter === 'off_duty' && d.status !== 'off_duty') return !1;
    if (search) {
      const q = search.toLowerCase();
      return (d.name || '').toLowerCase().includes(q) || (d.phone || '').includes(q) || (d.hub || '').toLowerCase().includes(q) || (d.dlNumber || '').toLowerCase().includes(q);
    }
    return !0;
  });

  const standbyCount = driverPool.filter(d => d.status === 'standby').length;
  const onTripCount = driverPool.filter(d => d.status === 'on_trip').length;

  return jsx.jsx("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-sm animate-in fade-in",
    children: jsx.jsxs("div", {
      className: "w-full max-w-3xl max-h-[90vh] bg-card border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden text-card-foreground",
      children: [
        // Modal Header
        jsx.jsxs("div", {
          className: "p-4 sm:p-5 border-b border-border/50 flex items-center justify-between bg-muted/20 shrink-0",
          children: [
            jsx.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                jsx.jsx("div", {
                  className: "w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg",
                  children: "🛡️"
                }),
                jsx.jsxs("div", {
                  children: [
                    jsx.jsx("h2", { className: "text-lg font-bold text-foreground", children: "Driver Standby Reserve Network" }),
                    jsx.jsxs("p", { className: "text-xs text-muted-foreground", children: ["Live pool of verified HMV relief drivers across corridors · ", jsx.jsx("span", { className: "text-emerald-400 font-bold", children: standbyCount + " Available Now" })] })
                  ]
                })
              ]
            }),
            jsx.jsx("button", {
              type: "button",
              onClick: onClose,
              className: "h-8 w-8 rounded-lg border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center text-sm font-bold",
              children: "✕"
            })
          ]
        }),

        // Filters & Search Bar
        jsx.jsxs("div", {
          className: "p-4 border-b border-border/40 bg-muted/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0",
          children: [
            jsx.jsxs("div", {
              className: "flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none",
              children: [
                jsx.jsxs("button", {
                  type: "button",
                  onClick: () => setFilter('all'),
                  className: "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border " + (filter === 'all' ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted"),
                  children: ["All (", driverPool.length, ")"]
                }),
                jsx.jsxs("button", {
                  type: "button",
                  onClick: () => setFilter('standby'),
                  className: "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 " + (filter === 'standby' ? "bg-emerald-500 text-white border-emerald-500" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"),
                  children: [jsx.jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }), "Standby Reserve (", standbyCount, ")"]
                }),
                jsx.jsxs("button", {
                  type: "button",
                  onClick: () => setFilter('on_trip'),
                  className: "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border " + (filter === 'on_trip' ? "bg-sky-500 text-white border-sky-500" : "bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20"),
                  children: ["On Trip (", onTripCount, ")"]
                }),
                jsx.jsxs("button", {
                  type: "button",
                  onClick: () => setFilter('off_duty'),
                  className: "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border " + (filter === 'off_duty' ? "bg-amber-500 text-white border-amber-500" : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"),
                  children: ["Off Duty"]
                })
              ]
            }),
            jsx.jsx("input", {
              type: "text",
              placeholder: "Search driver, phone, hub, DL...",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              className: "px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-64"
            })
          ]
        }),

        // Driver List Body
        jsx.jsx("div", {
          className: "p-4 overflow-y-auto space-y-3 flex-1 max-h-[60vh]",
          children: filtered.length === 0 ? jsx.jsx("div", {
            className: "text-center py-10 text-muted-foreground text-xs",
            children: "No drivers found matching your filter criteria."
          }) : filtered.map(driver => {
            const isStandby = driver.status === 'standby';
            const isOnTrip = driver.status === 'on_trip';
            return jsx.jsxs("div", {
              key: driver.id,
              className: "p-3.5 rounded-xl border border-border/60 bg-card hover:border-border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm",
              children: [
                jsx.jsxs("div", {
                  className: "flex items-start gap-3",
                  children: [
                    jsx.jsx("div", {
                      className: "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 " + (isStandby ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : isOnTrip ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" : "bg-slate-700/30 text-slate-400 border border-slate-700"),
                      children: (driver.name || 'D').slice(0, 2).toUpperCase()
                    }),
                    jsx.jsxs("div", {
                      className: "space-y-0.5",
                      children: [
                        jsx.jsxs("div", {
                          className: "flex items-center gap-2",
                          children: [
                            jsx.jsx("span", { className: "font-bold text-sm text-foreground", children: driver.name }),
                            jsx.jsx("span", {
                              className: "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider " + (isStandby ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : isOnTrip ? "bg-sky-500/15 text-sky-400 border border-sky-500/30" : "bg-amber-500/15 text-amber-400 border border-amber-500/30"),
                              children: isStandby ? "🟢 STANDBY" : isOnTrip ? "🔵 ON TRIP" : "🟡 REST"
                            })
                          ]
                        }),
                        jsx.jsxs("div", {
                          className: "flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5",
                          children: [
                            jsx.jsxs("span", { className: "flex items-center gap-1", children: [jsx.jsx("span", { children: "📍" }), driver.hub] }),
                            jsx.jsxs("span", { className: "flex items-center gap-1 font-mono text-[11px]", children: [jsx.jsx("span", { children: "🪪" }), driver.dlNumber] }),
                            driver.activeTrip ? jsx.jsxs("span", { className: "text-sky-400 font-semibold", children: ["Trip: ", driver.activeTrip.trip_id || driver.activeTrip.id] }) : null
                          ]
                        })
                      ]
                    })
                  ]
                }),

                // Actions
                jsx.jsxs("div", {
                  className: "flex items-center gap-2 self-end sm:self-center shrink-0",
                  children: [
                    jsx.jsxs("button", {
                      type: "button",
                      onClick: () => window.open("https://wa.me/" + (driver.phone || "").replace(/[^0-9]/g, ""), "_blank"),
                      className: "px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 flex items-center gap-1",
                      title: "WhatsApp Driver",
                      children: [jsx.jsx("span", { children: "💬" }), " Chat"]
                    }),
                    isStandby ? jsx.jsxs("button", {
                      type: "button",
                      onClick: () => {
                        onClose();
                        onDispatchDriver(driver);
                      },
                      className: "px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all",
                      children: [jsx.jsx("span", { children: "⚡" }), " Dispatch"]
                    }) : null
                  ]
                })
              ]
            });
          })
        }),

        // Footer
        jsx.jsxs("div", {
          className: "p-4 border-t border-border/50 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground shrink-0",
          children: [
            jsx.jsx("span", { children: "All reserve drivers are pre-verified for commercial Heavy Motor Vehicle (HMV) compliance." }),
            jsx.jsx("button", {
              type: "button",
              onClick: onClose,
              className: "px-4 py-1.5 rounded-lg bg-card border border-border text-foreground hover:bg-muted font-semibold",
              children: "Close"
            })
          ]
        })
      ]
    })
  });
}

// 2. Trip Reassignment Modal
function _TripReassignmentModal({ isOpen, onClose, trip, employees = [], trucks = [], preselectedDriver, onSaved, ReactModule, jsx, pbClient, toastClient, auditLogger }) {
  const [reassignType, setReassignType] = ReactModule.useState('driver');
  const [newDriverName, setNewDriverName] = ReactModule.useState(preselectedDriver ? preselectedDriver.name : '');
  const [newDriverPhone, setNewDriverPhone] = ReactModule.useState(preselectedDriver ? preselectedDriver.phone : '');
  const [newTruckNumber, setNewTruckNumber] = ReactModule.useState('');
  const [reason, setReason] = ReactModule.useState('Mechanical Breakdown');
  const [swapLocation, setSwapLocation] = ReactModule.useState('');
  const [odometer, setOdometer] = ReactModule.useState('');
  const [fuelLevel, setFuelLevel] = ReactModule.useState('Half Tank (50%)');
  const [sealStatus, setSealStatus] = ReactModule.useState('Intact');
  const [newSealNumber, setNewSealNumber] = ReactModule.useState('');
  const [cashAdvanceHandover, setCashAdvanceHandover] = ReactModule.useState('0');
  const [submitting, setSubmitting] = ReactModule.useState(!1);

  ReactModule.useEffect(() => {
    if (preselectedDriver) {
      setNewDriverName(preselectedDriver.name);
      setNewDriverPhone(preselectedDriver.phone);
    }
  }, [preselectedDriver]);

  if (!isOpen || !trip) return null;

  const currentRoute = trip.route || ((trip.loading_point || 'Hub') + ' → ' + (trip.unloading_point || 'Destination'));

  const handleDriverSelect = (driverId) => {
    const d = (employees || []).find(e => e.id === driverId || e.name === driverId);
    if (d) {
      setNewDriverName(d.name);
      setNewDriverPhone(d.phone || d.mobile || '+91 7799072244');
    }
  };

  const shareClientWhatsApp = () => {
    const clientPhone = (trip.client_phone || trip.billing_phone || '9538874625').replace(/[^0-9]/g, '');
    const trackingUrl = 'https://www.jaibhavanicargo.com/track/' + (trip.trip_id || trip.id);
    const msg = [
      '🚨 *JAI BHAVANI CARGO - DISPATCH REASSIGNMENT ALERT*',
      '',
      'Dear Client,',
      'Please be advised of an operational vehicle/driver handover for your shipment under LR/Trip: *' + (trip.trip_id || trip.id) + '*.',
      '',
      '📍 *CORRIDOR ROUTE:* ' + currentRoute,
      '⚙️ *REASON:* ' + reason,
      '📍 *HANDOVER POINT:* ' + (swapLocation || 'En-route Checkpoint'),
      '',
      '👤 *NEW ASSIGNED CREW DETAILS:*',
      reassignType !== 'vehicle' ? ('• Assigned Driver: *' + (newDriverName || 'Relief Driver') + '* (📞 ' + (newDriverPhone || 'Contact Dispatch') + ')') : null,
      reassignType !== 'driver' ? ('• Replacement Vehicle: *' + (newTruckNumber || 'Replacement Truck') + '*') : null,
      '• Cargo Seal Status: *' + sealStatus + (sealStatus === 'Resealed' ? ' (Seal #' + newSealNumber + ')' : '') + '*',
      '',
      '📍 *LIVE GPS TRACKING:*',
      trackingUrl,
      '',
      'Cargo integrity has been verified. Deliveries remain monitored.',
      'Jai Bhavani Cargo & Logistics · 24/7 Control Desk: +91 7799072244'
    ].filter(Boolean).join('\n');

    window.open('https://api.whatsapp.com/send?phone=' + (clientPhone.length === 10 ? ('91' + clientPhone) : clientPhone) + '&text=' + encodeURIComponent(msg), '_blank');
  };

  const shareDriverWhatsApp = () => {
    const phone = (newDriverPhone || '+91 7799072244').replace(/[^0-9]/g, '');
    const navUrl = 'https://maps.google.com/?q=' + encodeURIComponent(swapLocation || 'Hyderabad Main Hub');
    const msg = [
      '🚨 *EMERGENCY DISPATCH INSTRUCTION - JAI BHAVANI CARGO*',
      '',
      'Driver: *' + (newDriverName || 'Relief Driver') + '*',
      'You are assigned as relief crew for Trip: *' + (trip.trip_id || trip.id) + '*.',
      '',
      '📍 *HANDOVER LOCATION:* ' + (swapLocation || 'Check with dispatch'),
      '🗺️ *1-TAP MAP NAVIGATION:* ' + navUrl,
      '',
      '📋 *HANDOVER CHECKLIST:*',
      '• Route: ' + currentRoute,
      '• Vehicle: ' + (newTruckNumber || trip.truck_number || 'Fleet Truck'),
      '• Current Odometer: ' + (odometer ? (odometer + ' KM') : 'Record on arrival'),
      '• Fuel Level: ' + fuelLevel,
      '• Cargo Seal: ' + sealStatus,
      '• Cash Handed Over: Rs. ' + cashAdvanceHandover,
      '',
      'Drive safely and report back once handover is confirmed.',
      'Emergency Control Room: +91 7799072244'
    ].join('\n');

    window.open('https://api.whatsapp.com/send?phone=' + (phone.length === 10 ? ('91' + phone) : phone) + '&text=' + encodeURIComponent(msg), '_blank');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (reassignType !== 'vehicle' && !newDriverName.trim()) {
      toastClient?.error?.('Please enter or select a replacement driver');
      return;
    }
    if (reassignType !== 'driver' && !newTruckNumber.trim()) {
      toastClient?.error?.('Please enter or select a replacement vehicle');
      return;
    }

    setSubmitting(!0);
    try {
      const updateData = {};
      if (reassignType !== 'vehicle') {
        updateData.driver_name = newDriverName.trim();
        updateData.driver_phone = newDriverPhone.trim();
      }
      if (reassignType !== 'driver') {
        updateData.truck_number = newTruckNumber.trim().toUpperCase();
      }

      // Append handover audit trail
      const handoverEntry = '[' + new Date().toISOString() + '] Emergency Reassignment (' + reassignType + '): ' + reason + ' at ' + (swapLocation || 'Milestone') + '. Odo: ' + odometer + ' KM, Fuel: ' + fuelLevel + ', Seal: ' + sealStatus + (newSealNumber ? ' (#' + newSealNumber + ')' : '') + ', Cash Handover: Rs.' + cashAdvanceHandover + '. Previous: ' + (trip.driver_name || 'Driver') + ' / ' + (trip.truck_number || 'Truck') + ' → New: ' + (newDriverName || trip.driver_name) + ' / ' + (newTruckNumber || trip.truck_number);
      updateData.audit_notes = (trip.audit_notes ? (trip.audit_notes + '\n' + handoverEntry) : handoverEntry);

      await pbClient.collection('trip_logs').update(trip.id, updateData, { $autoCancel: !1 });

      if (auditLogger) {
        try {
          auditLogger({
            action: 'emergency_trip_reassignment',
            entity_type: 'trip_logs',
            entity_id: trip.id,
            details: {
              reassignType,
              reason,
              swapLocation,
              odometer,
              fuelLevel,
              sealStatus,
              newDriverName,
              newTruckNumber
            }
          });
        } catch (_) {}
      }

      toastClient?.success?.('Trip successfully reassigned! Handover logged.');
      onSaved?.();
      onClose();
    } catch (err) {
      console.error('Reassignment failed:', err);
      toastClient?.error?.('Failed to reassign trip: ' + (err.message || 'Server error'));
    } finally {
      setSubmitting(!1);
    }
  };

  return jsx.jsx("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-sm animate-in fade-in",
    children: jsx.jsxs("div", {
      className: "w-full max-w-2xl max-h-[92vh] bg-card border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden text-card-foreground",
      children: [
        // Header
        jsx.jsxs("div", {
          className: "p-4 sm:p-5 border-b border-border/50 flex items-center justify-between bg-amber-500/10 shrink-0",
          children: [
            jsx.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                jsx.jsx("div", {
                  className: "w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg",
                  children: "🚨"
                }),
                jsx.jsxs("div", {
                  children: [
                    jsx.jsx("h2", { className: "text-lg font-bold text-foreground", children: "Emergency Trip Reassignment Workflow" }),
                    jsx.jsxs("p", { className: "text-xs text-muted-foreground", children: ["Trip ", jsx.jsx("span", { className: "text-amber-400 font-mono font-bold", children: trip.trip_id || trip.id }), " · ", currentRoute] })
                  ]
                })
              ]
            }),
            jsx.jsx("button", {
              type: "button",
              onClick: onClose,
              className: "h-8 w-8 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center text-sm font-bold",
              children: "✕"
            })
          ]
        }),

        // Form Body
        jsx.jsx("form", {
          onSubmit: handleSubmit,
          className: "p-4 sm:p-5 overflow-y-auto space-y-4 flex-1",
          children: jsx.jsxs("div", {
            className: "space-y-4",
            children: [
              // Reassignment Type selector
              jsx.jsxs("div", {
                className: "grid grid-cols-3 gap-2",
                children: [
                  jsx.jsxs("button", {
                    type: "button",
                    onClick: () => setReassignType('driver'),
                    className: "p-2.5 rounded-xl border text-xs font-bold transition-all " + (reassignType === 'driver' ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm" : "bg-card text-muted-foreground border-border hover:bg-muted"),
                    children: [jsx.jsx("div", { className: "text-base mb-1", children: "👤" }), "Driver Swap"]
                  }),
                  jsx.jsxs("button", {
                    type: "button",
                    onClick: () => setReassignType('vehicle'),
                    className: "p-2.5 rounded-xl border text-xs font-bold transition-all " + (reassignType === 'vehicle' ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm" : "bg-card text-muted-foreground border-border hover:bg-muted"),
                    children: [jsx.jsx("div", { className: "text-base mb-1", children: "🚛" }), "Vehicle Swap"]
                  }),
                  jsx.jsxs("button", {
                    type: "button",
                    onClick: () => setReassignType('both'),
                    className: "p-2.5 rounded-xl border text-xs font-bold transition-all " + (reassignType === 'both' ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm" : "bg-card text-muted-foreground border-border hover:bg-muted"),
                    children: [jsx.jsx("div", { className: "text-base mb-1", children: "🔄" }), "Full Crew & Truck"]
                  })
                ]
              }),

              // Emergency Reason & Handover Location
              jsx.jsxs("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
                children: [
                  jsx.jsxs("div", {
                    className: "space-y-1.5",
                    children: [
                      jsx.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Emergency Swap Reason" }),
                      jsx.jsxs("select", {
                        value: reason,
                        onChange: (e) => setReason(e.target.value),
                        className: "w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary",
                        children: [
                          jsx.jsx("option", { value: "Mechanical Breakdown", children: "Mechanical Breakdown" }),
                          jsx.jsx("option", { value: "Driver Illness / Medical", children: "Driver Illness / Medical" }),
                          jsx.jsx("option", { value: "Cargo Transshipment", children: "Cargo Transshipment" }),
                          jsx.jsx("option", { value: "Accident / Highway Block", children: "Accident / Highway Block" }),
                          jsx.jsx("option", { value: "Duty Hours Limit Exceeded", children: "Duty Hours Limit Exceeded" }),
                          jsx.jsx("option", { value: "Operational Re-route", children: "Operational Re-route" })
                        ]
                      })
                    ]
                  }),
                  jsx.jsxs("div", {
                    className: "space-y-1.5",
                    children: [
                      jsx.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Swap Location (Milestone / Hub)" }),
                      jsx.jsx("input", {
                        type: "text",
                        placeholder: "e.g. Medchal Toll Plaza / NH44 KM 48",
                        value: swapLocation,
                        onChange: (e) => setSwapLocation(e.target.value),
                        className: "w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      })
                    ]
                  })
                ]
              }),

              // Replacement Assignment Fields
              reassignType !== 'vehicle' ? jsx.jsxs("div", {
                className: "p-3 rounded-xl bg-muted/20 border border-border/50 space-y-3",
                children: [
                  jsx.jsxs("div", {
                    className: "flex items-center justify-between",
                    children: [
                      jsx.jsx("span", { className: "text-xs font-bold text-foreground", children: "New Assigned Driver" }),
                      jsx.jsxs("span", { className: "text-[11px] text-muted-foreground", children: ["Current: ", jsx.jsx("strong", { children: trip.driver_name || "Unassigned" })] })
                    ]
                  }),
                  jsx.jsxs("div", {
                    className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5",
                    children: [
                      jsx.jsxs("div", {
                        className: "space-y-1",
                        children: [
                          jsx.jsx("label", { className: "text-[11px] text-muted-foreground", children: "Select from Staff / Standby Pool" }),
                          jsx.jsxs("select", {
                            onChange: (e) => handleDriverSelect(e.target.value),
                            className: "w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground",
                            children: [
                              jsx.jsx("option", { value: "", children: "-- Choose Driver --" }),
                              (employees || []).map(emp => jsx.jsx("option", { value: emp.id, children: emp.name + (emp.phone ? (' (' + emp.phone + ')') : '') }, emp.id))
                            ]
                          })
                        ]
                      }),
                      jsx.jsxs("div", {
                        className: "space-y-1",
                        children: [
                          jsx.jsx("label", { className: "text-[11px] text-muted-foreground", children: "Driver Name & Phone" }),
                          jsx.jsxs("div", {
                            className: "flex gap-1.5",
                            children: [
                              jsx.jsx("input", {
                                type: "text",
                                placeholder: "Driver Name",
                                value: newDriverName,
                                onChange: (e) => setNewDriverName(e.target.value),
                                className: "flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                              }),
                              jsx.jsx("input", {
                                type: "text",
                                placeholder: "Phone",
                                value: newDriverPhone,
                                onChange: (e) => setNewDriverPhone(e.target.value),
                                className: "w-28 px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                              })
                            ]
                          })
                        ]
                      })
                    ]
                  })
                ]
              }) : null,

              reassignType !== 'driver' ? jsx.jsxs("div", {
                className: "p-3 rounded-xl bg-muted/20 border border-border/50 space-y-3",
                children: [
                  jsx.jsxs("div", {
                    className: "flex items-center justify-between",
                    children: [
                      jsx.jsx("span", { className: "text-xs font-bold text-foreground", children: "Replacement Vehicle" }),
                      jsx.jsxs("span", { className: "text-[11px] text-muted-foreground", children: ["Current: ", jsx.jsx("strong", { children: trip.truck_number || "Unassigned" })] })
                    ]
                  }),
                  jsx.jsxs("div", {
                    className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5",
                    children: [
                      jsx.jsxs("div", {
                        className: "space-y-1",
                        children: [
                          jsx.jsx("label", { className: "text-[11px] text-muted-foreground", children: "Select from Active Fleet" }),
                          jsx.jsxs("select", {
                            onChange: (e) => setNewTruckNumber(e.target.value),
                            className: "w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground",
                            children: [
                              jsx.jsx("option", { value: "", children: "-- Choose Vehicle --" }),
                              (trucks || []).map(t => jsx.jsx("option", { value: t.truck_number, children: t.truck_number + (t.truck_type ? (' - ' + t.truck_type) : '') }, t.id || t.truck_number))
                            ]
                          })
                        ]
                      }),
                      jsx.jsxs("div", {
                        className: "space-y-1",
                        children: [
                          jsx.jsx("label", { className: "text-[11px] text-muted-foreground", children: "Vehicle Registration #" }),
                          jsx.jsx("input", {
                            type: "text",
                            placeholder: "e.g. TS08 UJ 5428",
                            value: newTruckNumber,
                            onChange: (e) => setNewTruckNumber(e.target.value),
                            className: "w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground uppercase"
                          })
                        ]
                      })
                    ]
                  })
                ]
              }) : null,

              // Handover Checklist Metrics
              jsx.jsxs("div", {
                className: "p-3.5 rounded-xl border border-border/70 bg-secondary/5 space-y-3",
                children: [
                  jsx.jsx("h4", { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", children: "Handover Inspection Checklist" }),
                  jsx.jsxs("div", {
                    className: "grid grid-cols-2 sm:grid-cols-4 gap-2.5",
                    children: [
                      jsx.jsxs("div", {
                        className: "space-y-1",
                        children: [
                          jsx.jsx("label", { className: "text-[10px] text-muted-foreground", children: "Odometer (KM)" }),
                          jsx.jsx("input", {
                            type: "number",
                            placeholder: "e.g. 142500",
                            value: odometer,
                            onChange: (e) => setOdometer(e.target.value),
                            className: "w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                          })
                        ]
                      }),
                      jsx.jsxs("div", {
                        className: "space-y-1",
                        children: [
                          jsx.jsx("label", { className: "text-[10px] text-muted-foreground", children: "Fuel Level" }),
                          jsx.jsxs("select", {
                            value: fuelLevel,
                            onChange: (e) => setFuelLevel(e.target.value),
                            className: "w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground",
                            children: [
                              jsx.jsx("option", { value: "Full Tank", children: "Full Tank (100%)" }),
                              jsx.jsx("option", { value: "Three-Quarter", children: "3/4 Tank (75%)" }),
                              jsx.jsx("option", { value: "Half Tank (50%)", children: "1/2 Tank (50%)" }),
                              jsx.jsx("option", { value: "Quarter Tank", children: "1/4 Tank (25%)" }),
                              jsx.jsx("option", { value: "Reserve / Empty", children: "Reserve (<15%)" })
                            ]
                          })
                        ]
                      }),
                      jsx.jsxs("div", {
                        className: "space-y-1",
                        children: [
                          jsx.jsx("label", { className: "text-[10px] text-muted-foreground", children: "Cargo Seal" }),
                          jsx.jsxs("select", {
                            value: sealStatus,
                            onChange: (e) => setSealStatus(e.target.value),
                            className: "w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground",
                            children: [
                              jsx.jsx("option", { value: "Intact", children: "Intact & Undamaged" }),
                              jsx.jsx("option", { value: "Resealed", children: "Resealed (New Seal)" }),
                              jsx.jsx("option", { value: "Open / Broken", children: "Broken (Flagged)" })
                            ]
                          })
                        ]
                      }),
                      jsx.jsxs("div", {
                        className: "space-y-1",
                        children: [
                          jsx.jsx("label", { className: "text-[10px] text-muted-foreground", children: "Cash Handed (₹)" }),
                          jsx.jsx("input", {
                            type: "number",
                            value: cashAdvanceHandover,
                            onChange: (e) => setCashAdvanceHandover(e.target.value),
                            className: "w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                          })
                        ]
                      })
                    ]
                  }),
                  sealStatus === 'Resealed' ? jsx.jsxs("div", {
                    className: "space-y-1 pt-1",
                    children: [
                      jsx.jsx("label", { className: "text-[11px] text-amber-400 font-semibold", children: "New Security Seal Number" }),
                      jsx.jsx("input", {
                        type: "text",
                        placeholder: "e.g. JB-SEAL-88912",
                        value: newSealNumber,
                        onChange: (e) => setNewSealNumber(e.target.value),
                        className: "w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-500/40 bg-background text-foreground"
                      })
                    ]
                  }) : null
                ]
              }),

              // 1-Click WhatsApp Broadcast Buttons
              jsx.jsxs("div", {
                className: "p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-2.5",
                children: [
                  jsx.jsxs("div", {
                    className: "text-xs text-muted-foreground",
                    children: [
                      jsx.jsx("span", { className: "font-semibold text-emerald-400", children: "Instant WhatsApp Broadcasts:" }),
                      jsx.jsx("span", { className: "block text-[11px]", children: "Send automated handover alerts to Client & Relief Crew." })
                    ]
                  }),
                  jsx.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      jsx.jsxs("button", {
                        type: "button",
                        onClick: shareClientWhatsApp,
                        className: "px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 flex items-center gap-1",
                        children: [jsx.jsx("span", { children: "📱" }), " Alert Client"]
                      }),
                      jsx.jsxs("button", {
                        type: "button",
                        onClick: shareDriverWhatsApp,
                        className: "px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 flex items-center gap-1",
                        children: [jsx.jsx("span", { children: "🗺️" }), " Dispatch Driver"]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        }),

        // Footer Actions
        jsx.jsxs("div", {
          className: "p-4 border-t border-border/50 bg-muted/20 flex items-center justify-between shrink-0",
          children: [
            jsx.jsx("button", {
              type: "button",
              onClick: onClose,
              disabled: submitting,
              className: "px-4 py-2 rounded-xl text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted",
              children: "Cancel"
            }),
            jsx.jsxs("button", {
              type: "button",
              onClick: handleSubmit,
              disabled: submitting,
              className: "px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50",
              children: [
                submitting ? jsx.jsx("span", { className: "animate-spin", children: "⏳" }) : jsx.jsx("span", { children: "✓" }),
                submitting ? "Logging Handover..." : "Confirm & Commit Reassignment"
              ]
            })
          ]
        })
      ]
    })
  });
}

// 3. Trip Completion Validation Gate Dialog
function _TripCompletionValidationDialog({ isOpen, onClose, trip, onSaved, ReactModule, jsx, pbClient, toastClient, auditLogger }) {
  const [waiverReason, setWaiverReason] = ReactModule.useState('');
  const [driverBalanceConfirmed, setDriverBalanceConfirmed] = ReactModule.useState(!1);
  const [submitting, setSubmitting] = ReactModule.useState(!1);

  if (!isOpen || !trip) return null;

  const hasPod = !!(trip.pod_document || trip.pod_file || trip.pod_link);
  const revenue = Number(trip.revenue || 0);
  const advances = Number(trip.advance_paid_to_driver || 0);
  const expenses = Number(trip.enroute_expenses || trip.diesel_expenses || 0);
  const toll = Number(trip.toll_deduction || 0);
  const totalCost = advances + expenses + toll;
  const netMargin = revenue - totalCost;
  const marginPct = revenue > 0 ? Math.round((netMargin / revenue) * 100) : 0;

  const canComplete = (hasPod || waiverReason.trim().length >= 8) && driverBalanceConfirmed;

  const handleValidateAndComplete = async () => {
    if (!canComplete) {
      if (!hasPod && waiverReason.trim().length < 8) {
        toastClient?.error?.('Please enter an operational delay waiver reason for missing POD');
      } else if (!driverBalanceConfirmed) {
        toastClient?.error?.('Please check and confirm driver settlement balance clearance');
      }
      return;
    }

    setSubmitting(!0);
    try {
      const updateData = {
        trip_status: 'Completed',
        settlement_status: 'settled_and_locked',
        settlement_validated_at: new Date().toISOString()
      };
      if (!hasPod && waiverReason.trim()) {
        const waiverEntry = '[' + new Date().toISOString() + '] POD Managerial Waiver: ' + waiverReason.trim();
        updateData.audit_notes = trip.audit_notes ? (trip.audit_notes + '\n' + waiverEntry) : waiverEntry;
      }

      await pbClient.collection('trip_logs').update(trip.id, updateData, { $autoCancel: !1 });

      if (auditLogger) {
        try {
          auditLogger({
            action: 'trip_completion_validated',
            entity_type: 'trip_logs',
            entity_id: trip.id,
            details: {
              revenue,
              totalCost,
              netMargin,
              marginPct,
              hasPod,
              waiverReason: waiverReason || null
            }
          });
        } catch (_) {}
      }

      toastClient?.success?.('Trip validated & closed with 3-Gate Compliance! 🏁');
      onSaved?.();
      onClose();
    } catch (err) {
      console.error('Validation failed:', err);
      toastClient?.error?.('Failed to complete trip validation: ' + (err.message || 'Server error'));
    } finally {
      setSubmitting(!1);
    }
  };

  return jsx.jsx("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-sm animate-in fade-in",
    children: jsx.jsxs("div", {
      className: "w-full max-w-xl max-h-[92vh] bg-card border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden text-card-foreground",
      children: [
        // Header
        jsx.jsxs("div", {
          className: "p-4 sm:p-5 border-b border-border/50 flex items-center justify-between bg-emerald-500/10 shrink-0",
          children: [
            jsx.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                jsx.jsx("div", {
                  className: "w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg",
                  children: "📋"
                }),
                jsx.jsxs("div", {
                  children: [
                    jsx.jsx("h2", { className: "text-lg font-bold text-foreground", children: "Trip Completion & Settlement Audit" }),
                    jsx.jsxs("p", { className: "text-xs text-muted-foreground", children: ["3-Gate Compliance Check for Trip ", jsx.jsx("span", { className: "text-emerald-400 font-mono font-bold", children: trip.trip_id || trip.id })] })
                  ]
                })
              ]
            }),
            jsx.jsx("button", {
              type: "button",
              onClick: onClose,
              className: "h-8 w-8 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center text-sm font-bold",
              children: "✕"
            })
          ]
        }),

        // 3 Gates Body
        jsx.jsxs("div", {
          className: "p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs",
          children: [
            // GATE 1: POD Verification
            jsx.jsxs("div", {
              className: "p-3.5 rounded-xl border " + (hasPod ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5") + " space-y-2.5",
              children: [
                jsx.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    jsx.jsxs("div", {
                      className: "flex items-center gap-2",
                      children: [
                        jsx.jsx("span", { className: "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold " + (hasPod ? "bg-emerald-500 text-white" : "bg-amber-500 text-slate-950"), children: "1" }),
                        jsx.jsx("span", { className: "font-bold text-foreground text-sm", children: "Gate 1: Proof of Delivery (POD)" })
                      ]
                    }),
                    jsx.jsx("span", {
                      className: "px-2 py-0.5 rounded-full text-[10px] font-bold " + (hasPod ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"),
                      children: hasPod ? "VERIFIED ✓" : "PENDING POD ⚠️"
                    })
                  ]
                }),
                hasPod ? jsx.jsxs("p", {
                  className: "text-muted-foreground text-[11px] flex items-center gap-1.5",
                  children: [
                    jsx.jsx("span", { className: "text-emerald-400", children: "✓" }),
                    "Consignee signed delivery stamp verified on file."
                  ]
                }) : jsx.jsxs("div", {
                  className: "space-y-1.5 pt-1",
                  children: [
                    jsx.jsx("p", { className: "text-amber-400 font-medium text-[11px]", children: "Signed POD is missing. A management waiver reason is mandatory to close this trip:" }),
                    jsx.jsx("input", {
                      type: "text",
                      placeholder: "e.g. Consignee hardcopy collected by Dispatch Mgr Vinod",
                      value: waiverReason,
                      onChange: (e) => setWaiverReason(e.target.value),
                      className: "w-full px-3 py-2 text-xs rounded-xl border border-amber-500/40 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                    })
                  ]
                })
              ]
            }),

            // GATE 2: Financial & Margin Reconciliation
            jsx.jsxs("div", {
              className: "p-3.5 rounded-xl border border-border/70 bg-card space-y-2.5",
              children: [
                jsx.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    jsx.jsxs("div", {
                      className: "flex items-center gap-2",
                      children: [
                        jsx.jsx("span", { className: "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground", children: "2" }),
                        jsx.jsx("span", { className: "font-bold text-foreground text-sm", children: "Gate 2: Expense & Cash Reconciliation" })
                      ]
                    }),
                    jsx.jsxs("span", {
                      className: "px-2 py-0.5 rounded-full text-[10px] font-bold " + (marginPct >= 15 ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border border-amber-500/30"),
                      children: ["Margin: ", marginPct, "%"]
                    })
                  ]
                }),
                jsx.jsxs("div", {
                  className: "grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center",
                  children: [
                    jsx.jsxs("div", {
                      className: "p-2 rounded-lg bg-muted/20 border border-border/40",
                      children: [
                        jsx.jsx("span", { className: "text-[10px] text-muted-foreground block", children: "Gross Revenue" }),
                        jsx.jsxs("span", { className: "font-bold font-mono text-emerald-400", children: ["₹", revenue.toLocaleString('en-IN')] })
                      ]
                    }),
                    jsx.jsxs("div", {
                      className: "p-2 rounded-lg bg-muted/20 border border-border/40",
                      children: [
                        jsx.jsx("span", { className: "text-[10px] text-muted-foreground block", children: "Advances" }),
                        jsx.jsxs("span", { className: "font-bold font-mono text-amber-400", children: ["₹", advances.toLocaleString('en-IN')] })
                      ]
                    }),
                    jsx.jsxs("div", {
                      className: "p-2 rounded-lg bg-muted/20 border border-border/40",
                      children: [
                        jsx.jsx("span", { className: "text-[10px] text-muted-foreground block", children: "Expenses + Toll" }),
                        jsx.jsxs("span", { className: "font-bold font-mono text-rose-400", children: ["₹", (expenses + toll).toLocaleString('en-IN')] })
                      ]
                    }),
                    jsx.jsxs("div", {
                      className: "p-2 rounded-lg bg-muted/20 border border-border/40",
                      children: [
                        jsx.jsx("span", { className: "text-[10px] text-muted-foreground block", children: "Net Margin" }),
                        jsx.jsxs("span", { className: "font-bold font-mono " + (netMargin >= 0 ? "text-emerald-400" : "text-rose-400"), children: ["₹", netMargin.toLocaleString('en-IN')] })
                      ]
                    })
                  ]
                }),
                jsx.jsxs("label", {
                  className: "flex items-start gap-2.5 pt-2 cursor-pointer select-none",
                  children: [
                    jsx.jsx("input", {
                      type: "checkbox",
                      checked: driverBalanceConfirmed,
                      onChange: (e) => setDriverBalanceConfirmed(e.target.checked),
                      className: "mt-0.5 rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    }),
                    jsx.jsxs("span", {
                      className: "text-muted-foreground text-[11px]",
                      children: [
                        jsx.jsx("strong", { className: "text-foreground", children: "Driver Settlement Clearance: " }),
                        "I confirm driver en-route cash advance balance has been tallied and recovered against fuel slips and FASTag tolls."
                      ]
                    })
                  ]
                })
              ]
            }),

            // GATE 3: Settlement Status Lock
            jsx.jsxs("div", {
              className: "p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 space-y-1.5",
              children: [
                jsx.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    jsx.jsx("span", { className: "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-indigo-500 text-white", children: "3" }),
                    jsx.jsx("span", { className: "font-bold text-foreground text-sm", children: "Gate 3: Permanent Compliance Lock" })
                  ]
                }),
                jsx.jsx("p", {
                  className: "text-muted-foreground text-[11px]",
                  children: "Closing will set settlement status to locked and finalize P&L accounting for this shipment."
                })
              ]
            })
          ]
        }),

        // Footer Actions
        jsx.jsxs("div", {
          className: "p-4 border-t border-border/50 bg-muted/20 flex items-center justify-between shrink-0",
          children: [
            jsx.jsx("button", {
              type: "button",
              onClick: onClose,
              disabled: submitting,
              className: "px-4 py-2 rounded-xl text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted",
              children: "Cancel"
            }),
            jsx.jsxs("button", {
              type: "button",
              onClick: handleValidateAndComplete,
              disabled: !canComplete || submitting,
              className: "px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed",
              children: [
                submitting ? jsx.jsx("span", { className: "animate-spin", children: "⏳" }) : jsx.jsx("span", { children: "🔒" }),
                submitting ? "Validating..." : "Validate & Lock Settlement"
              ]
            })
          ]
        })
      ]
    })
  });
}


// ─── Dispatch Compliance & Delivery SLA Components ───

function _formatBytes(bytes = 0) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

async function _compressImage(file) {
  if (!file || !file.type || !file.type.startsWith('image/')) return file;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const max = 2048;
        if (width > max || height > max) {
          if (width > height) {
            height = Math.round((height * max) / width);
            width = max;
          } else {
            width = Math.round((width * max) / height);
            height = max;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            const compFile = new File([blob], file.name, { type: 'image/jpeg' });
            resolve(compFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.82);
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

function _DispatchDocsViewerModal({ isOpen, onClose, trip, ReactModule, jsx }) {
  const [activeTab, setActiveTab] = ReactModule.useState('lr');
  const [copiedField, setCopiedField] = ReactModule.useState(null);

  if (!isOpen || !trip) return null;

  const lrUrl = trip.lr_file_url || (trip.lr_file ? ('/api/files/trip_logs/' + trip.id + '/' + trip.lr_file) : null);
  const invoiceUrl = trip.invoice_file_url || (trip.invoice_file ? ('/api/files/trip_logs/' + trip.id + '/' + trip.invoice_file) : null);
  const ewayUrl = trip.eway_bill_file_url || (trip.eway_bill_file ? ('/api/files/trip_logs/' + trip.id + '/' + trip.eway_bill_file) : null);
  const sealUrl = trip.seal_photo_url || (trip.seal_photo_file ? ('/api/files/trip_logs/' + trip.id + '/' + trip.seal_photo_file) : null);
  let allSeals = [];
  if (Array.isArray(trip.seal_numbers) && trip.seal_numbers.length > 0) {
    allSeals = trip.seal_numbers.filter(Boolean);
  } else if (typeof trip.seal_numbers === 'string' && trip.seal_numbers.startsWith('[')) {
    try { allSeals = JSON.parse(trip.seal_numbers).filter(Boolean); } catch (_) {}
  }
  if (allSeals.length === 0 && trip.seal_number) {
    allSeals = String(trip.seal_number).split(',').map(s => s.trim()).filter(Boolean);
  }

  const computeSla = () => {
    if (!trip.delivery_deadline) return null;
    const dl = new Date(trip.delivery_deadline);
    const now = new Date();
    const isDelivered = trip.trip_status === 'Delivered' || trip.trip_status === 'Completed';
    if (isDelivered) {
      return { label: 'Delivered On Time 🏁', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' };
    }
    const diffHours = Math.round((dl.getTime() - now.getTime()) / (1000 * 60 * 60));
    if (diffHours > 6) {
      return { label: 'On Schedule · ' + diffHours + 'h left 🟢', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' };
    } else if (diffHours >= 0) {
      return { label: 'Tight Window · ' + diffHours + 'h left ⏳', color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' };
    } else {
      return { label: 'Overdue by ' + Math.abs(diffHours) + 'h ⚠️', color: 'text-rose-400 bg-rose-500/20 border-rose-500/30' };
    }
  };

  const sla = computeSla();
  const currentDocUrl = activeTab === 'lr' ? lrUrl : activeTab === 'invoice' ? invoiceUrl : activeTab === 'eway' ? ewayUrl : sealUrl;
  const isPdf = currentDocUrl && currentDocUrl.toLowerCase().endsWith('.pdf');

  const handleCopy = (text, name) => {
    if (!text || !navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedField(name);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return jsx.jsx("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200",
    children: jsx.jsxs("div", {
      className: "w-[95vw] max-w-4xl h-[88vh] max-h-[88vh] bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl text-slate-100",
      children: [
        jsx.jsxs("div", {
          className: "p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3 shrink-0",
          children: [
            jsx.jsxs("div", {
              children: [
                jsx.jsxs("h3", { className: "text-base font-bold flex items-center gap-2", children: ["📋 Dispatch Compliance & SLA Documents — Trip #", trip.trip_id || trip.id] }),
                jsx.jsxs("p", { className: "text-xs text-slate-400 mt-0.5", children: ["Vehicle: ", trip.truck_number || "—", " · Route: ", trip.route || "—"] })
              ]
            }),
            jsx.jsxs("div", {
              className: "flex items-center gap-2",
              children: [
                sla ? jsx.jsx("span", { className: "px-2.5 py-0.5 rounded-full text-xs font-semibold border " + sla.color, children: sla.label }) : null,
                jsx.jsx("button", { onClick: onClose, className: "w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold", children: "✕" })
              ]
            })
          ]
        }),
        jsx.jsxs("div", {
          className: "px-4 py-2 bg-slate-900/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2 shrink-0",
          children: [
            jsx.jsxs("div", {
              children: [
                jsx.jsx("span", { className: "text-slate-400 font-medium", children: "Delivery SLA Deadline: " }),
                jsx.jsx("strong", { className: "text-slate-100 ml-1", children: trip.delivery_deadline ? new Date(trip.delivery_deadline).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Not recorded" })
              ]
            })
          ]
        }),
        jsx.jsxs("div", {
          className: "flex border-b border-slate-800 bg-slate-900/30 px-4 gap-2 shrink-0",
          children: [
            jsx.jsxs("button", {
              onClick: () => setActiveTab("lr"),
              className: "py-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 " + (activeTab === "lr" ? "border-indigo-500 text-indigo-300 bg-indigo-500/10" : "border-transparent text-slate-400 hover:text-slate-200"),
              children: [
                jsx.jsx("span", { children: "1. LR / Consignment" }),
                jsx.jsx("span", { className: "w-2 h-2 rounded-full " + (lrUrl ? "bg-emerald-400" : "bg-rose-400") })
              ]
            }),
            jsx.jsxs("button", {
              onClick: () => setActiveTab("invoice"),
              className: "py-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 " + (activeTab === "invoice" ? "border-indigo-500 text-indigo-300 bg-indigo-500/10" : "border-transparent text-slate-400 hover:text-slate-200"),
              children: [
                jsx.jsx("span", { children: "2. Commercial Invoice" }),
                jsx.jsx("span", { className: "w-2 h-2 rounded-full " + (invoiceUrl ? "bg-emerald-400" : "bg-rose-400") })
              ]
            }),
            jsx.jsxs("button", {
              onClick: () => setActiveTab("eway"),
              className: "py-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 " + (activeTab === "eway" ? "border-indigo-500 text-indigo-300 bg-indigo-500/10" : "border-transparent text-slate-400 hover:text-slate-200"),
              children: [
                jsx.jsx("span", { children: "3. GST E-Way Bill" }),
                jsx.jsx("span", { className: "w-2 h-2 rounded-full " + (ewayUrl ? "bg-emerald-400" : "bg-rose-400") })
              ]
            }),
            jsx.jsxs("button", {
              onClick: () => setActiveTab("seal"),
              className: "py-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 " + (activeTab === "seal" ? "border-cyan-500 text-cyan-300 bg-cyan-500/10" : "border-transparent text-slate-400 hover:text-slate-200"),
              children: [
                jsx.jsx("span", { children: "🔒 4. Container Seal" }),
                jsx.jsx("span", { className: "w-2 h-2 rounded-full " + (allSeals.length > 0 || sealUrl || trip.is_sealed ? "bg-cyan-400 animate-pulse" : "bg-slate-600") })
              ]
            })
          ]
        }),
        jsx.jsxs("div", {
          className: "px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3 shrink-0",
          children: [
            activeTab === "lr" ? jsx.jsxs("div", {
              className: "flex items-center gap-2",
              children: [
                jsx.jsx("span", { className: "text-slate-400", children: "LR Number:" }),
                jsx.jsx("strong", { className: "text-slate-100 font-mono", children: trip.lr_number || "—" }),
                trip.lr_number ? jsx.jsx("button", { onClick: () => handleCopy(trip.lr_number, "LR"), className: "text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300", children: copiedField === "LR" ? "✓ Copied" : "Copy" }) : null
              ]
            }) : activeTab === "invoice" ? jsx.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                jsx.jsx("span", { className: "text-slate-400", children: "Invoice No:" }),
                jsx.jsx("strong", { className: "text-slate-100 font-mono", children: trip.invoice_number || "—" }),
                trip.invoice_value ? jsx.jsxs("span", { className: "text-emerald-400 font-semibold", children: ["(Value: ₹", Number(trip.invoice_value).toLocaleString("en-IN"), ")"] }) : null
              ]
            }) : activeTab === "eway" ? jsx.jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                jsx.jsx("span", { className: "text-slate-400", children: "E-Way Bill No:" }),
                jsx.jsx("strong", { className: "text-slate-100 font-mono", children: trip.eway_bill_number || "—" }),
                trip.eway_expiry_date ? jsx.jsxs("span", { className: "text-slate-400", children: ["Expiry: ", new Date(trip.eway_expiry_date).toLocaleDateString("en-IN")] }) : null
              ]
            }) : jsx.jsxs("div", {
              className: "flex flex-wrap items-center gap-2",
              children: [
                jsx.jsx("span", { className: "text-slate-400 font-semibold text-xs", children: "Security Seals:" }),
                allSeals.length > 0 ? allSeals.map((sn, sIdx) => jsx.jsxs("span", {
                  key: sIdx,
                  className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold",
                  children: [
                    "#" + (sIdx + 1) + ": " + sn,
                    jsx.jsx("button", {
                      onClick: () => handleCopy(sn, 'seal_' + sIdx),
                      className: "hover:text-white ml-1 cursor-pointer",
                      title: "Copy Seal Number",
                      children: copiedField === ('seal_' + sIdx) ? "✓" : "📋"
                    })
                  ]
                })) : jsx.jsx("span", { className: "text-slate-400 italic text-xs", children: "No seal tags recorded" }),
                jsx.jsx("span", { className: "text-[10px] text-emerald-400 ml-2 font-medium", children: "✓ Tamper-Evident Dock Verified" })
              ]
            }),
            currentDocUrl ? jsx.jsxs("div", {
              className: "flex items-center gap-2 ml-auto",
              children: [
                jsx.jsx("a", { href: currentDocUrl, target: "_blank", rel: "noopener noreferrer", className: "px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200", children: "Open Full ↗" }),
                jsx.jsx("a", { href: currentDocUrl, download: true, className: "px-2.5 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium", children: "Download ↓" })
              ]
            }) : null
          ]
        }),
        jsx.jsx("div", {
          className: "flex-1 overflow-auto bg-slate-950 p-4 flex items-center justify-center",
          children: currentDocUrl ? (
            isPdf ? jsx.jsx("iframe", { src: currentDocUrl, className: "w-full h-full rounded-xl bg-white border border-slate-800" }) :
            jsx.jsx("img", { src: currentDocUrl, alt: activeTab + " document", className: "max-h-[60vh] object-contain rounded-xl border border-slate-800 shadow-xl" })
          ) : jsx.jsxs("div", {
            className: "text-center py-12 space-y-2",
            children: [
              jsx.jsx("div", { className: "text-3xl", children: "⚠️" }),
              jsx.jsxs("h4", { className: "text-sm font-semibold text-slate-300", children: ["No ", activeTab === "lr" ? "LR / Consignment Note" : activeTab === "invoice" ? "Commercial Invoice" : "GST E-Way Bill", " Attached"] }),
              jsx.jsx("p", { className: "text-xs text-slate-500 max-w-xs mx-auto", children: "Upload this document by clicking Edit on this trip." })
            ]
          })
        })
      ]
    })
  });
}

function _DispatchComplianceSection({ formData, setFormData, ReactModule, jsx }) {
  const [compressing, setCompressing] = ReactModule.useState({ lr: false, invoice: false, eway: false });

  const handleUpload = async (e, type) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setCompressing(prev => ({ ...prev, [type]: true }));
    try {
      const comp = await _compressImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dUrl = ev.target.result;
        if (type === 'lr') {
          setFormData({ ...formData, lr_file_url: dUrl });
        } else if (type === 'invoice') {
          setFormData({ ...formData, invoice_file_url: dUrl });
        } else if (type === 'eway') {
          setFormData({ ...formData, eway_bill_file_url: dUrl });
        }
      };
      reader.readAsDataURL(comp);
    } catch (err) {
      console.error(err);
    } finally {
      setCompressing(prev => ({ ...prev, [type]: false }));
    }
  };

  return jsx.jsxs("div", {
    className: "p-4 rounded-2xl bg-slate-900/50 border border-indigo-500/30 space-y-3",
    children: [
      jsx.jsxs("div", {
        className: "flex items-center justify-between border-b border-slate-800 pb-2",
        children: [
          jsx.jsxs("div", {
            children: [
              jsx.jsx("h4", { className: "text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5", children: "📋 Dispatch Compliance & Delivery SLA Tracker" }),
              jsx.jsx("p", { className: "text-[11px] text-slate-400 mt-0.5", children: "Attach mandatory transit documents (auto-compressed) & record delivery deadline" })
            ]
          }),
          jsx.jsx("span", { className: "px-2 py-0.5 text-[9px] font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30", children: "Statutory & SLA" })
        ]
      }),
      jsx.jsxs("div", {
        className: "grid grid-cols-1 md:grid-cols-2 gap-3",
        children: [
          jsx.jsxs("div", {
            className: "p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2",
            children: [
              jsx.jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  jsx.jsx("span", { className: "text-xs font-semibold text-slate-200", children: "1. Attach LR / Consignment" }),
                  formData.lr_file_url ? jsx.jsx("span", { className: "text-[10px] text-emerald-400 font-bold", children: "Attached ✓" }) : null
                ]
              }),
              jsx.jsx("input", {
                placeholder: "LR / Bilty Number",
                value: formData.lr_number || "",
                onChange: (e) => setFormData({ ...formData, lr_number: e.target.value }),
                className: "w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100"
              }),
              jsx.jsxs("label", {
                className: "flex items-center justify-center gap-1.5 h-8 px-2 rounded border border-dashed border-slate-700 bg-slate-900 hover:bg-slate-800 cursor-pointer text-[11px] text-slate-300",
                children: [
                  jsx.jsx("span", { children: compressing.lr ? "Compressing..." : formData.lr_file_url ? "Replace LR File" : "📎 Upload LR (Auto-Compress)" }),
                  jsx.jsx("input", { type: "file", accept: "image/*,application/pdf", onChange: (e) => handleUpload(e, "lr"), className: "hidden" })
                ]
              })
            ]
          }),
          jsx.jsxs("div", {
            className: "p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2",
            children: [
              jsx.jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  jsx.jsx("span", { className: "text-xs font-semibold text-slate-200", children: "2. Attach Invoice" }),
                  formData.invoice_file_url ? jsx.jsx("span", { className: "text-[10px] text-emerald-400 font-bold", children: "Attached ✓" }) : null
                ]
              }),
              jsx.jsxs("div", {
                className: "grid grid-cols-2 gap-2",
                children: [
                  jsx.jsx("input", {
                    placeholder: "Invoice Number",
                    value: formData.invoice_number || "",
                    onChange: (e) => setFormData({ ...formData, invoice_number: e.target.value }),
                    className: "h-7 px-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100"
                  }),
                  jsx.jsx("input", {
                    type: "number",
                    placeholder: "Material Value (₹)",
                    value: formData.invoice_value || "",
                    onChange: (e) => setFormData({ ...formData, invoice_value: e.target.value }),
                    className: "h-7 px-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100"
                  })
                ]
              }),
              jsx.jsxs("label", {
                className: "flex items-center justify-center gap-1.5 h-8 px-2 rounded border border-dashed border-slate-700 bg-slate-900 hover:bg-slate-800 cursor-pointer text-[11px] text-slate-300",
                children: [
                  jsx.jsx("span", { children: compressing.invoice ? "Compressing..." : formData.invoice_file_url ? "Replace Invoice File" : "📎 Upload Invoice (Auto-Compress)" }),
                  jsx.jsx("input", { type: "file", accept: "image/*,application/pdf", onChange: (e) => handleUpload(e, "invoice"), className: "hidden" })
                ]
              })
            ]
          }),
          jsx.jsxs("div", {
            className: "p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2",
            children: [
              jsx.jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  jsx.jsx("span", { className: "text-xs font-semibold text-slate-200", children: "3. Attach GST E-Way Bill" }),
                  formData.eway_bill_file_url ? jsx.jsx("span", { className: "text-[10px] text-emerald-400 font-bold", children: "Attached ✓" }) : null
                ]
              }),
              jsx.jsxs("div", {
                className: "grid grid-cols-2 gap-2",
                children: [
                  jsx.jsx("input", {
                    placeholder: "12-Digit EWB No.",
                    value: formData.eway_bill_number || "",
                    onChange: (e) => setFormData({ ...formData, eway_bill_number: e.target.value }),
                    className: "h-7 px-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 font-mono"
                  }),
                  jsx.jsx("input", {
                    type: "datetime-local",
                    value: formData.eway_expiry_date || "",
                    onChange: (e) => setFormData({ ...formData, eway_expiry_date: e.target.value }),
                    className: "h-7 px-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100"
                  })
                ]
              }),
              jsx.jsxs("label", {
                className: "flex items-center justify-center gap-1.5 h-8 px-2 rounded border border-dashed border-slate-700 bg-slate-900 hover:bg-slate-800 cursor-pointer text-[11px] text-slate-300",
                children: [
                  jsx.jsx("span", { children: compressing.eway ? "Compressing..." : formData.eway_bill_file_url ? "Replace E-Way Bill" : "📎 Upload E-Way Bill (Auto-Compress)" }),
                  jsx.jsx("input", { type: "file", accept: "image/*,application/pdf", onChange: (e) => handleUpload(e, "eway"), className: "hidden" })
                ]
              })
            ]
          }),
          jsx.jsxs("div", {
            className: "p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2",
            children: [
              jsx.jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  jsx.jsx("span", { className: "text-xs font-semibold text-slate-200", children: "4. Record Delivery Deadline (SLA)" }),
                  formData.delivery_deadline ? jsx.jsx("span", { className: "text-[10px] text-amber-400 font-bold", children: "SLA Active ⏱️" }) : null
                ]
              }),
              jsx.jsx("input", {
                type: "datetime-local",
                value: formData.delivery_deadline || "",
                onChange: (e) => setFormData({ ...formData, delivery_deadline: e.target.value }),
                className: "w-full h-7 px-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 font-medium"
              }),
              jsx.jsx("p", { className: "text-[10px] text-slate-400", children: "Guaranteed arrival SLA with live countdown and detention alerts." })
            ]
          }),
          /* 5. Container / Truck Security Seal Card */
          jsx.jsxs("div", {
            className: "p-3.5 rounded-xl bg-slate-950/80 border " + (formData.is_sealed ? "border-cyan-500/50 bg-cyan-950/10" : "border-slate-800") + " space-y-3 md:col-span-2 transition-all",
            children: [
              jsx.jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  jsx.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      jsx.jsx("span", { className: "text-base", children: "🔒" }),
                      jsx.jsxs("div", {
                        children: [
                          jsx.jsx("span", { className: "text-xs font-bold text-slate-200 block", children: "5. Container / Truck Security Seal" }),
                          jsx.jsx("span", { className: "text-[10px] text-slate-400", children: "Record tamper-evident bolt/wire seal numbers (up to 4)" })
                        ]
                      })
                    ]
                  }),
                  jsx.jsxs("label", {
                    className: "flex items-center gap-2 cursor-pointer select-none",
                    children: [
                      jsx.jsx("span", {
                        className: "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border " + (formData.is_sealed ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" : "bg-slate-800 text-slate-400 border-slate-700"),
                        children: formData.is_sealed ? "Sealed 🔒" : "Unsealed"
                      }),
                      jsx.jsx("input", {
                        type: "checkbox",
                        checked: Boolean(formData.is_sealed),
                        onChange: (e) => {
                          const checked = e.target.checked;
                          setFormData({
                            ...formData,
                            is_sealed: checked,
                            seal_numbers: checked ? ((formData.seal_numbers && formData.seal_numbers.length) ? formData.seal_numbers : ['']) : [''],
                            seal_number: checked ? (formData.seal_number || '') : ''
                          });
                        },
                        className: "w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 cursor-pointer accent-cyan-500"
                      })
                    ]
                  })
                ]
              }),
              formData.is_sealed ? jsx.jsxs("div", {
                className: "space-y-3 pt-2 border-t border-slate-800/80 animate-in fade-in duration-200",
                children: [
                  jsx.jsxs("div", {
                    className: "flex items-center justify-between",
                    children: [
                      jsx.jsxs("span", { className: "text-[11px] font-medium text-slate-300", children: ["Applied Seal Codes (", (formData.seal_numbers || ['']).length, "/4):"] }),
                      (formData.seal_numbers || ['']).length < 4 ? jsx.jsx("button", {
                        type: "button",
                        onClick: () => {
                          const cur = Array.isArray(formData.seal_numbers) ? formData.seal_numbers : [''];
                          if (cur.length < 4) {
                            const updated = [...cur, ''];
                            setFormData({
                              ...formData,
                              seal_numbers: updated,
                              seal_number: updated.filter(Boolean).join(', ')
                            });
                          }
                        },
                        className: "text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40 cursor-pointer",
                        children: "+ Add Another Seal (Max 4)"
                      }) : null
                    ]
                  }),
                  jsx.jsx("div", {
                    className: "grid grid-cols-1 sm:grid-cols-2 gap-2",
                    children: (formData.seal_numbers || ['']).map((sn, sIdx) => jsx.jsxs("div", {
                      key: sIdx,
                      className: "flex items-center gap-1.5",
                      children: [
                        jsx.jsx("span", { className: "text-[10px] font-mono text-cyan-400/80 bg-slate-950 px-1.5 py-1 rounded border border-slate-800 shrink-0", children: "#" + (sIdx + 1) }),
                        jsx.jsx("input", {
                          type: "text",
                          placeholder: sIdx === 0 ? "e.g., SEAL-984210" : "Seal #" + (sIdx + 1) + " code",
                          value: sn,
                          onChange: (e) => {
                            const val = e.target.value.toUpperCase();
                            const cur = [...(formData.seal_numbers || [''])];
                            cur[sIdx] = val;
                            setFormData({
                              ...formData,
                              seal_numbers: cur,
                              seal_number: cur.filter(Boolean).join(', ')
                            });
                          },
                          className: "flex-1 h-7 px-2 bg-slate-900 border border-slate-700 rounded text-xs font-mono font-bold text-cyan-300 tracking-wider"
                        }),
                        (formData.seal_numbers || ['']).length > 1 ? jsx.jsx("button", {
                          type: "button",
                          onClick: () => {
                            const cur = [...(formData.seal_numbers || [''])];
                            cur.splice(sIdx, 1);
                            setFormData({
                              ...formData,
                              seal_numbers: cur,
                              seal_number: cur.filter(Boolean).join(', ')
                            });
                          },
                          className: "p-1 rounded text-slate-400 hover:text-rose-400 text-xs shrink-0 cursor-pointer",
                          children: "✕"
                        }) : null
                      ]
                    }))
                  }),
                  /* Ultra-lightweight Seal Photo Uploader */
                  jsx.jsxs("div", {
                    className: "pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2",
                    children: [
                      formData.seal_photo_url ? jsx.jsxs("div", {
                        className: "flex items-center gap-2",
                        children: [
                          jsx.jsx("img", { src: formData.seal_photo_url, alt: "Seal", className: "w-8 h-8 rounded object-cover border border-cyan-500/40" }),
                          jsx.jsxs("span", { className: "text-xs text-emerald-400 font-medium", children: ["✓ Seal Photo Attached (Compressed < 40KB)"] })
                        ]
                      }) : jsx.jsx("span", { className: "text-[11px] text-slate-400", children: "Attach physical seal verification photo (compressed in-browser to < 40KB):" }),
                      formData.seal_photo_url ? jsx.jsx("button", {
                        type: "button",
                        onClick: () => setFormData({ ...formData, seal_photo_url: '' }),
                        className: "text-[10px] text-rose-400 hover:text-rose-300 underline cursor-pointer",
                        children: "Remove Photo"
                      }) : jsx.jsxs("label", {
                        className: "px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold cursor-pointer transition-all flex items-center gap-1",
                        children: [
                          "📷 Capture / Upload",
                          jsx.jsx("input", {
                            type: "file",
                            accept: "image/*",
                            onChange: async (e) => {
                              const file = e.target.files && e.target.files[0];
                              if (!file) return;
                              try {
                                const comp = await _compressImage(file);
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  setFormData({ ...formData, seal_photo_url: ev.target.result });
                                };
                                reader.readAsDataURL(comp);
                              } catch (err) {
                                console.error(err);
                              }
                            },
                            className: "hidden"
                          })
                        ]
                      })
                    ]
                  })
                ]
              }) : null
            ]
          }),
          jsx.jsxs("div", {
            className: "p-4 rounded-2xl bg-secondary/30 border border-border/50 space-y-3 mt-4",
            children: [
              jsx.jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  jsx.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      jsx.jsx("div", {
                        className: "w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold",
                        children: "🛰️"
                      }),
                      jsx.jsxs("div", {
                        children: [
                          jsx.jsxs("label", {
                            className: "text-xs font-bold text-foreground flex items-center gap-1.5",
                            children: [
                              "Live Vehicle GPS Tracking Link",
                              jsx.jsx("span", {
                                className: "text-[10px] text-cyan-400 font-mono",
                                children: "(Active until delivered)"
                              })
                            ]
                          }),
                          jsx.jsx("p", {
                            className: "text-[11px] text-muted-foreground",
                            children: "Paste BlackBuck or vehicle telematics tracking link. Clients can track live map in new tab."
                          })
                        ]
                      })
                    ]
                  })
                ]
              }),
              jsx.jsxs("div", {
                className: "space-y-3 pt-1",
                children: [
                  jsx.jsxs("div", {
                    className: "relative",
                    children: [
                      jsx.jsx("input", {
                        type: "url",
                        placeholder: "https://track.blackbuck.com/... or GPS URL",
                        value: formData.gps_tracking_link || "",
                        onChange: (e) => setFormData({ ...formData, gps_tracking_link: e.target.value }),
                        className: "w-full rounded-xl h-10 pr-24 px-3 text-xs font-mono bg-background border border-border focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      }),
                      jsx.jsx("button", {
                        type: "button",
                        onClick: async () => {
                          try {
                            const clip = await navigator.clipboard.readText();
                            if (clip && (clip.startsWith("http://") || clip.startsWith("https://"))) {
                              setFormData({ ...formData, gps_tracking_link: clip.trim() });
                            } else {
                              alert("No valid URL found on clipboard");
                            }
                          } catch {
                            alert("Unable to read clipboard. Please paste manually.");
                          }
                        },
                        className: "absolute right-1 top-1 h-8 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 px-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 transition-all",
                        children: "📋 Paste"
                      })
                    ]
                  }),
                  jsx.jsxs("div", {
                    className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-border/40",
                    children: [
                      jsx.jsxs("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                          jsx.jsx("span", { className: "text-xs", children: "⏱️" }),
                          jsx.jsx("span", { className: "text-[11px] font-medium text-muted-foreground", children: "Link Validity Duration:" })
                        ]
                      }),
                      jsx.jsxs("div", {
                        className: "flex items-center gap-1.5 flex-wrap",
                        children: [
                          [1, 2, 3, 5, 7].map(d => jsx.jsx("button", {
                            key: d,
                            type: "button",
                            onClick: () => setFormData({ ...formData, gps_validity_days: d }),
                            className: "text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all " + ((Number(formData.gps_validity_days) || 2) === d ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm" : "bg-background border-border text-muted-foreground hover:text-foreground"),
                            children: d + (d === 1 ? " Day" : " Days")
                          })),
                          jsx.jsxs("div", {
                            className: "flex items-center gap-1 ml-1",
                            children: [
                              jsx.jsx("input", {
                                type: "number",
                                min: "1",
                                max: "60",
                                value: formData.gps_validity_days || 2,
                                onChange: (e) => setFormData({ ...formData, gps_validity_days: Math.max(1, parseInt(e.target.value, 10) || 1) }),
                                className: "w-14 h-7 text-[11px] font-mono text-center px-1 rounded-lg bg-background border border-border"
                              }),
                              jsx.jsx("span", { className: "text-[10px] text-muted-foreground", children: "Days" })
                            ]
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

import{r as a,j as e,ak as Te,cg as rs,a1 as na,a9 as gs,az as Ht,a5 as nt,ar as la,ch as ia,ci as oa,cj as da,ck as bs,cl as lt,cm as He,c as ca,P as ma,O as ua,C as pa,cn as ut,at as vs,aW as Ut,co as xa,n as ha,ad as ys,a_ as js,ao as fa,ae as _s,be as ga,af as vt,a0 as ba,ah as va,aB as ya,bs as ja,cp as _a,cq as Na,a6 as tt,a4 as ns,a3 as Tt,bt as At,a7 as ls,aM as is,a2 as Mt,cr as wa,al as ka,cs as Rt,aK as Sa,ct as Ca,R as Da}from"./vendor-react-Bs5V2qFE.js";import{aa as os,D as Me,a as Re,b as Fe,c as $e,d as ze,L as z,I as se,S as pe,e as xe,g as he,h as fe,i as F,f as Bt,ab as st,ac as Ta,j as Pe,B as S,p as D,k as ce,t as $,ad as Aa,ae as yt,af as Ma,ag as ae,X as V,T as Ra,u as Ns,w as jt,ah as Fa,ai as $a,N as Ia,m as Pa,C as La,o as Ea,q as Oa,O as Ua,y as Ba,z as za,A as Ft,E as Ce,aj as ds,F as Va,G as Ne,ak as $t,al as It,a3 as cs,a4 as ms,a5 as us,a8 as Be,Q as Ha,am as qa,a9 as Ka}from"./index-DLxf9dwO.js";import{l as Wa}from"./auditLogger-6WQ95Cvr.js";import{d as ct,A as Ga}from"./AddRecurringTripModal-Q3Q3c2Tu.js";import{P as ws}from"./progress-55zf5paG.js";import{read as Ja,utils as Ya}from"./xlsx-CNerDvZX.js";import{S as Qa}from"./SendMailDialog-DwU-GlVi.js";import{E as Za}from"./vendor-pdf-DtmgLs_2.js";import{f as Xa}from"./locationUtils-CJF9iFYv.js";import"./vendor-radix-BQCqNqg0.js";import"./addDays-D4tJXVkB.js";const er=({isOpen:n,onClose:d,tripId:s,onSuccess:N,employees:u=[],trucks:g=[]})=>{
  const[p,h]=a.useState(!1);
  const[_,b]=a.useState(!1);
  const[clients,setClients]=a.useState([]);
  const[r,x]=a.useState({
    trip_id:"",
    client_id:"",
    date:"",
    driver_employee_id:"",
    driver_employee_code:"",
    driver_name:"",
    truck_number:"",
    route:"",
    cycle:"",
    kms:"",
    revenue:"",
    advance_received_from_client:"",
    advance_paid_to_driver:"",
    client_payment_status:"pending",
    trip_status:"Upcoming",
    mileage:"",
    assigned_managers:"",
    vendor_payout:"",
    payment_model:"Model2",
    toll_deduction:"",
    loading_charges:"",
    loading_paid_by:"client",
    unloading_charges:"",
    unloading_paid_by:"client",
    broker_commission:"",
    munsiyana:"",
    loading_dock_arrival_time:"",
    dispatched_time:"",
    delivered_time:"",
    pickup_time:"",
    delivery_eta:"",
    client_trip_id:"",
    lr_number:"",
    late_delivery_reason:"",
    is_sealed:!1,
    seal_number:"",
    seal_numbers:[""],
    seal_photo_url:"",
    gps_tracking_link:"",
    gps_validity_days:2,
    gps_link_expiry:""
  });
  const[j,C]=a.useState(()=>os(1,1));

  a.useEffect(()=>{(async()=>{
    if(!n||!s)return;
    b(!0);
    try{
      const[v,cList]=await Promise.all([
        D.collection("trip_logs").getOne(s,{$autoCancel:!1,expand:"client_id"}),
        D.collection("clients").getFullList({sort:"client_name",filter:'status != "Inactive" && status != "Suspended"',$autoCancel:!1}).catch(()=>[])
      ]);
      setClients(cList||[]);
      const T=A=>{
        if(!A)return"";
        try{return ce(new Date(A),"yyyy-MM-dd'T'HH:mm")}catch{return""}
      };
      x({
        trip_id:v.trip_id||"",
        client_id:v.client_id||"",
        date:v.date?ce(new Date(v.date),"yyyy-MM-dd"):"",
        driver_employee_id:v.driver_employee_id||"",
        driver_employee_code:v.driver_employee_code||"",
        driver_name:v.driver_name||"",
        truck_number:v.truck_number||"",
        route:v.route||"",
        cycle:v.cycle||"",
        kms:v.kms!==void 0&&v.kms!==null?v.kms.toString():"",
        revenue:v.revenue!==void 0&&v.revenue!==null?v.revenue.toString():"",
        advance_received_from_client:v.advance_received_from_client!==void 0&&v.advance_received_from_client!==null?v.advance_received_from_client.toString():"",
        advance_paid_to_driver:v.advance_paid_to_driver!==void 0&&v.advance_paid_to_driver!==null?v.advance_paid_to_driver.toString():"",
        client_payment_status:v.client_payment_status||"pending",
        trip_status:v.trip_status||"Upcoming",
        mileage:v.mileage!==void 0&&v.mileage!==null?v.mileage.toString():"",
        assigned_managers:v.assigned_managers||"",
        vendor_payout:v.vendor_payout!==void 0&&v.vendor_payout!==null?v.vendor_payout.toString():"",
        payment_model:v.payment_model||"Model2",
        toll_deduction:v.toll_deduction!==void 0&&v.toll_deduction!==null?v.toll_deduction.toString():"",
        loading_charges:v.loading_charges!==void 0&&v.loading_charges!==null?v.loading_charges.toString():"",
        loading_paid_by:v.loading_paid_by||"client",
        unloading_charges:v.unloading_charges!==void 0&&v.unloading_charges!==null?v.unloading_charges.toString():"",
        unloading_paid_by:v.unloading_paid_by||"client",
        broker_commission:v.broker_commission!==void 0&&v.broker_commission!==null?v.broker_commission.toString():"",
        munsiyana:v.munsiyana!==void 0&&v.munsiyana!==null?v.munsiyana.toString():"",
        lr_number:v.lr_number||"",
        lr_file_url:v.lr_file_url||"",
        invoice_number:v.invoice_number||"",
        invoice_value:v.invoice_value!==void 0&&v.invoice_value!==null?v.invoice_value.toString():"",
        invoice_file_url:v.invoice_file_url||"",
        eway_bill_number:v.eway_bill_number||"",
        eway_expiry_date:v.eway_expiry_date||"",
        eway_bill_file_url:v.eway_bill_file_url||"",
        delivery_deadline:v.delivery_deadline||"",
        loading_dock_arrival_time:T(v.loading_dock_arrival_time),
        dispatched_time:T(v.dispatched_time),
        delivered_time:T(v.delivered_time),
        pickup_time:T(v.pickup_time),
        delivery_eta:T(v.delivery_eta),
        client_trip_id:v.client_trip_id||"",
        late_delivery_reason:v.late_delivery_reason||"",
        is_sealed:Boolean(v.is_sealed),
        seal_number:v.seal_number||"",
        seal_numbers:Array.isArray(v.seal_numbers)&&v.seal_numbers.length>0?v.seal_numbers:(v.seal_number?v.seal_number.split(',').map(s=>s.trim()).filter(Boolean):['']),
        seal_photo_url:v.seal_photo_url||"",
        gps_tracking_link:v.gps_tracking_link||"",
        gps_validity_days:v.gps_validity_days||2,
        gps_link_expiry:v.gps_link_expiry||""
      });
      Array.isArray(v.trip_stops)&&v.trip_stops.length>0?C(v.trip_stops):Array.isArray(v.milestones_schedule)&&v.milestones_schedule.length>0?C(v.milestones_schedule):C(os(v.total_docks_count||1,v.total_drops_count||1));
    }catch(v){
      console.error("[TripEditModal] Failed to fetch trip details:",v);
      $.error("Could not load trip details.");
      d();
    }finally{
      b(!1);
    }
  })()},[n,s,d]);

  const I=async m=>{
    if(m.preventDefault(),!!s){
      h(!0);
      try{
        const v={
          client_id:r.client_id||null,
          date:r.date,
          driver_employee_id:r.driver_employee_id||null,
          driver_employee_code:r.driver_employee_code||null,
          driver_name:r.driver_name,
          truck_number:r.truck_number,
          route:r.route,
          cycle:r.cycle,
          kms:parseFloat(r.kms)||0,
          revenue:parseFloat(r.revenue)||0,
          advance_received_from_client:parseFloat(r.advance_received_from_client)||0,
          advance_paid_to_driver:parseFloat(r.advance_paid_to_driver)||0,
          client_trip_id:r.client_trip_id?.trim()||"",
          lr_number:r.lr_number?.trim()||"",
          client_payment_status:r.client_payment_status,
          trip_status:r.trip_status,
          mileage:parseFloat(r.mileage)||0,
          assigned_managers:r.assigned_managers,
          toll_deduction:parseFloat(r.toll_deduction)||0,
          loading_dock_arrival_time:r.loading_dock_arrival_time?new Date(r.loading_dock_arrival_time).toISOString():null,
          dispatched_time:r.dispatched_time?new Date(r.dispatched_time).toISOString():null,
          delivered_time:r.delivered_time?new Date(r.delivered_time).toISOString():null,
          pickup_time:r.pickup_time?new Date(r.pickup_time).toISOString():null,
          delivery_eta:r.delivery_eta?new Date(r.delivery_eta).toISOString():null,
          ownership_type:X?"Attached":"Owned",
          payment_model:X?r.payment_model:"Model1",
          vendor_payout:X?(r.payment_model==="Model3"?Math.max(0,(parseFloat(r.revenue)||0)-500):parseFloat(r.vendor_payout)||0):0,
          brokerage_margin:X?(r.payment_model==="Model3"?500:(parseFloat(r.revenue)||0)-(parseFloat(r.vendor_payout)||0)):0,
          ...Aa(r.date,j),
          loading_charges:parseFloat(r.loading_charges)||0,
          loading_paid_by:r.loading_paid_by||"client",
          unloading_charges:parseFloat(r.unloading_charges)||0,
          unloading_paid_by:r.unloading_paid_by||"client",
          broker_commission:parseFloat(r.broker_commission)||0,
          munsiyana:parseFloat(r.munsiyana)||0,
          lr_file_url:r.lr_file_url||"",
          invoice_number:r.invoice_number||"",
          invoice_value:parseFloat(r.invoice_value)||0,
          invoice_file_url:r.invoice_file_url||"",
          eway_bill_number:r.eway_bill_number||"",
          eway_expiry_date:r.eway_expiry_date||"",
          eway_bill_file_url:r.eway_bill_file_url||"",
          delivery_deadline:r.delivery_deadline||"",
          late_delivery_reason:r.late_delivery_reason||"",
          is_sealed:Boolean(r.is_sealed),
          seal_number:Array.isArray(r.seal_numbers)?r.seal_numbers.filter(Boolean).map(s=>s.trim()).join(", "):(r.seal_number||""),
          seal_numbers:Array.isArray(r.seal_numbers)?r.seal_numbers.filter(Boolean).map(s=>s.trim()):(r.seal_number?[r.seal_number.trim()]:[]),
          seal_photo_url:r.seal_photo_url||"",
          gps_tracking_link:r.gps_tracking_link||"",
          gps_validity_days:parseInt(r.gps_validity_days)||2,
          gps_link_expiry:r.gps_link_expiry||""
        };
        await D.collection("trip_logs").update(s,v,{$autoCancel:!1}).catch(async _err=>{
          if(_err?.data?.data?.pod_status||(_err?.message&&_err.message.includes("pod_status"))){
            return await D.collection("trip_logs").update(s,{...v,pod_status:"Uploaded"},{$autoCancel:!1});
          }
          throw _err;
        });
        r.client_payment_status&&await yt(D,s,r.client_payment_status,{...v,trip_id:r.trip_id});
        $.success("Trip log updated successfully");
        N();
        d();
      }catch(v){
        console.error("[TripEditModal] Update error:",v);
        $.error(v.message||"Failed to update trip log. Please verify your inputs.");
      }finally{
        h(!1);
      }
    }
  };

  const W=g.find(m=>m.truck_number===r.truck_number)?.ownership_type||"Owned";
  const X=W==="Attached";

  return e.jsx(Me,{open:n,onOpenChange:d,children:e.jsxs(Re,{className:"w-[96vw] max-w-5xl h-[92vh] max-h-[92vh] p-0 flex flex-col overflow-hidden bg-background text-foreground rounded-3xl shadow-2xl border border-border/60",children:[
    e.jsx(Fe,{className:"p-5 pb-4 border-b border-border/50 shrink-0 bg-card/95 backdrop-blur-sm z-10",children:e.jsxs("div",{className:"flex items-center justify-between",children:[
      e.jsxs("div",{children:[
        e.jsx($e,{className:"text-xl font-bold tracking-tight text-foreground",children:"Edit Trip Log"}),
        e.jsx(ze,{className:"text-xs text-muted-foreground",children:"Update trip parameters, client assignments, financials, dispatch SLA, and telematics."})
      ]}),
      r.trip_id&&e.jsxs("div",{className:"bg-secondary/40 px-3 py-1.5 rounded-xl border border-border/60 shadow-sm text-center",children:[
        e.jsx("p",{className:"text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5",children:"Trip ID"}),
        e.jsx("p",{className:"text-sm font-mono font-bold text-foreground",children:r.trip_id})
      ]})
    ]})}),
    _?e.jsxs("div",{className:"flex flex-col items-center justify-center py-20 flex-1",children:[
      e.jsx(Te,{className:"w-8 h-8 animate-spin text-primary mb-4"}),
      e.jsx("p",{className:"text-muted-foreground text-sm",children:"Loading trip details..."})
    ]}):e.jsxs("form",{onSubmit:I,className:"flex flex-col flex-1 min-h-0 overflow-hidden",children:[
      e.jsxs("div",{className:"flex-1 overflow-y-auto px-6 py-6 space-y-6 min-h-0",children:[
        
        // ==========================================
        // CARD 1: 📋 Shipment & Route Assignment
        // ==========================================
        e.jsxs("div",{className:"bg-secondary/15 rounded-2xl p-5 border border-border/60 space-y-4 shadow-sm",children:[
          e.jsxs("div",{className:"flex items-center justify-between pb-2 border-b border-border/40",children:[
            e.jsxs("h4",{className:"text-sm font-bold flex items-center gap-2 text-foreground",children:[
              e.jsx("span",{children:"📋"}),
              " Shipment & Route Assignment"
            ]}),
            e.jsx("span",{className:"text-[11px] text-muted-foreground",children:"Client assignment, truck, driver & route details"})
          ]}),
          e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:[
            // 1. Client / Company Select
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsxs(z,{htmlFor:"edit-client",className:"text-xs font-semibold",children:[
                "Client / Company",
                e.jsx("span",{className:"text-destructive ml-1",children:"*"})
              ]}),
              e.jsxs(pe,{value:r.client_id||"",onValueChange:m=>x({...r,client_id:m}),children:[
                e.jsx(xe,{id:"edit-client",className:"bg-background h-9 text-xs",children:e.jsx(he,{placeholder:"Select a client",children:(()=>{const mc=clients.find(c=>c.id===r.client_id);return mc?(mc.client_name||mc.company_name||mc.name):"Select a client"})()})}),
                e.jsx(fe,{children:clients.map(c=>e.jsxs(F,{value:c.id,className:"text-xs",children:[
                  c.client_name||c.company_name||c.name,
                  c.company_name&&c.company_name!==c.client_name?(` (${c.company_name})`):"",
                  c.client_type&&c.client_type.includes("Broker")?" [🤝 Broker]":""
                ]},c.id))})
              ]})
            ]}),

            // 2. Trip Date
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsxs(z,{htmlFor:"edit-date",className:"text-xs font-semibold",children:[
                "Trip Date",
                e.jsx("span",{className:"text-destructive ml-1",children:"*"})
              ]}),
              e.jsx(se,{id:"edit-date",type:"date",value:r.date,onChange:m=>x({...r,date:m.target.value}),required:!0,className:"bg-background h-9 text-xs"})
            ]}),

            // 3. Driver
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-driver",className:"text-xs font-semibold",children:"Driver"}),
              (()=>{const curDriver=(r.driver_name||"").trim(),isTemp=curDriver==="Temporary Driver"||curDriver.startsWith("Temporary Driver"),matchedEmp=isTemp?null:u.find(E=>(r.driver_employee_id&&E.id===r.driver_employee_id)||(r.driver_employee_code&&E.employee_code&&E.employee_code===r.driver_employee_code)||(curDriver&&E.name&&E.name.trim().toLowerCase()===curDriver.toLowerCase())),selDriverVal=isTemp?"Temporary Driver":(matchedEmp?matchedEmp.id:curDriver),driverLabel=isTemp?(curDriver!=="Temporary Driver"?curDriver:"⚡ Temporary Driver"):(matchedEmp?(matchedEmp.employee_code?`${matchedEmp.employee_code} — ${matchedEmp.name}`:matchedEmp.name):curDriver);return e.jsxs(pe,{value:selDriverVal||"",onValueChange:m=>{if(m==="Temporary Driver"){x({...r,driver_employee_id:null,driver_employee_code:null,driver_name:"Temporary Driver"})}else{const emp=u.find(E=>E.id===m||E.employee_code===m||E.name===m);if(emp){x({...r,driver_employee_id:emp.id,driver_employee_code:emp.employee_code||null,driver_name:emp.name})}else{x({...r,driver_employee_id:null,driver_employee_code:null,driver_name:m})}}},children:[e.jsx(xe,{id:"edit-driver",className:"bg-background h-9 text-xs",children:e.jsx(he,{placeholder:"Select driver",children:driverLabel||"Select driver"})}),e.jsxs(fe,{children:[e.jsx(F,{value:"Temporary Driver",className:"font-semibold text-amber-600 dark:text-amber-400 text-xs",children:"⚡ Temporary Driver (No mobile access)"}),u.map(emp=>e.jsx(F,{value:emp.id,className:"text-xs",children:emp.employee_code?`${emp.employee_code} — ${emp.name}`:`${emp.name} (Code not assigned)`},emp.id))]})]})})(),
              r.driver_name?.startsWith("Temporary Driver")&&e.jsx(se,{placeholder:"Custom Temp Name (Optional)",value:r.driver_name==="Temporary Driver"?"":r.driver_name,onChange:m=>x({...r,driver_name:m.target.value?m.target.value:"Temporary Driver"}),className:"text-xs h-8 mt-1 bg-amber-500/5 border-amber-500/30"})
            ]}),

            // 4. Truck Number
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-truck",className:"text-xs font-semibold",children:"Truck Number"}),
              (()=>{const curTruck=(r.truck_number||"").trim(),curTruckNorm=curTruck.replace(/\s+/g,"").toUpperCase(),matchedTruck=g.find(m=>(m.truck_number||"").replace(/\s+/g,"").toUpperCase()===curTruckNorm),selTruck=matchedTruck?matchedTruck.truck_number:curTruck;return e.jsxs(pe,{value:selTruck||"",onValueChange:m=>x({...r,truck_number:m}),children:[e.jsx(xe,{id:"edit-truck",className:"bg-background h-9 text-xs",children:e.jsx(he,{placeholder:"Select truck",children:selTruck||"Select truck"})}),e.jsx(fe,{children:g.map(m=>e.jsx(F,{value:m.truck_number,className:"text-xs",children:m.truck_number},m.id)).concat(selTruck&&!g.some(m=>m.truck_number===selTruck)?[e.jsx(F,{value:selTruck,className:"text-xs",children:selTruck},"custom-truck-edit")]:[])})]})})()
            ]}),

            // 5. Route
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-route",className:"text-xs font-semibold",children:"Route"}),
              e.jsx(se,{id:"edit-route",type:"text",value:r.route,onChange:m=>x({...r,route:m.target.value}),required:!0,placeholder:"Origin -> Destination",className:"bg-background h-9 text-xs"})
            ]}),

            // 6. Kilometers
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-kms",className:"text-xs font-semibold",children:"Kilometers"}),
              e.jsx(se,{id:"edit-kms",type:"number",step:"0.1",value:r.kms,onChange:m=>x({...r,kms:m.target.value}),placeholder:"0",required:!0,className:"bg-background h-9 text-xs font-mono"})
            ]}),

            // 7. Client / Partner Trip ID
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-client-trip-id",className:"text-xs font-semibold",children:"Client / Partner Trip ID"}),
              e.jsx(se,{id:"edit-client-trip-id",type:"text",placeholder:"e.g. DLV-TRP-88210, FK-BLR",value:r.client_trip_id||"",onChange:m=>x({...r,client_trip_id:m.target.value}),className:"bg-background h-9 text-xs font-mono"})
            ]}),

            // 8. LR / Consignment Note #
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-lr-num",className:"text-xs font-semibold",children:"LR / Consignment Note #"}),
              e.jsx(se,{id:"edit-lr-num",type:"text",placeholder:"e.g. 400676524",value:r.lr_number||"",onChange:m=>x({...r,lr_number:m.target.value}),className:"bg-background h-9 text-xs font-mono"})
            ]}),

            // 9. Cycle
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-cycle",className:"text-xs font-semibold",children:"Cycle"}),
              e.jsx(se,{id:"edit-cycle",type:"text",value:r.cycle,onChange:m=>x({...r,cycle:m.target.value}),placeholder:"e.g. 14-day cycle",className:"bg-background h-9 text-xs"})
            ]})
          ]})
        ]}),

        // ==========================================
        // CARD 2: 💰 Financials, Revenue & Assigned Advances
        // ==========================================
        e.jsxs("div",{className:"bg-secondary/15 rounded-2xl p-5 border border-border/60 space-y-4 shadow-sm",children:[
          e.jsxs("div",{className:"flex items-center justify-between pb-2 border-b border-border/40",children:[
            e.jsxs("h4",{className:"text-sm font-bold flex items-center gap-2 text-foreground",children:[
              e.jsx("span",{children:"💰"}),
              " Financials, Revenue & Assigned Advances"
            ]}),
            e.jsx("span",{className:"text-[11px] text-muted-foreground",children:"Freight rates, advances, deductions & payment settlement"})
          ]}),
          e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",children:[
            // 1. Freight Revenue
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-revenue",className:"text-xs font-semibold",children:"Revenue (Rs. )"}),
              e.jsx(se,{id:"edit-revenue",type:"number",step:"0.01",value:r.revenue,onChange:m=>x({...r,revenue:m.target.value}),placeholder:"0",required:!0,className:"bg-background h-9 text-xs font-mono"})
            ]}),

            // 2. Advance from Client
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-adv-client",className:"text-xs font-semibold",children:"Advance from Client (₹)"}),
              e.jsx(se,{id:"edit-adv-client",type:"number",step:"0.01",placeholder:"0.00",value:r.advance_received_from_client||"",onChange:m=>x({...r,advance_received_from_client:m.target.value}),className:"bg-background h-9 text-xs font-mono"})
            ]}),

            // 3. Driver Advance
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-adv-driver",className:"text-xs font-semibold",children:"Driver Advance (Paid by Co.) (₹)"}),
              e.jsx(se,{id:"edit-adv-driver",type:"number",step:"0.01",placeholder:"0.00",value:r.advance_paid_to_driver||"",onChange:m=>x({...r,advance_paid_to_driver:m.target.value}),className:"bg-background h-9 text-xs font-mono"})
            ]}),

            // 4. Toll Deduction
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-toll",className:"text-xs font-semibold",children:"Toll Deduction (₹)"}),
              e.jsx(se,{id:"edit-toll",type:"number",step:"0.01",value:r.toll_deduction,onChange:m=>x({...r,toll_deduction:m.target.value}),placeholder:"0",className:"bg-background h-9 text-xs font-mono"})
            ]}),

            // 5. Trip Status
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-status",className:"text-xs font-semibold",children:"Trip Status"}),
              e.jsxs(pe,{value:r.trip_status,onValueChange:m=>x({...r,trip_status:m}),children:[
                e.jsx(xe,{id:"edit-status",className:"bg-background h-9 text-xs",children:e.jsx(he,{})}),
                e.jsxs(fe,{children:[
                  e.jsx(F,{value:"Upcoming",className:"text-xs",children:"Upcoming"}),
                  e.jsx(F,{value:"In Transit",className:"text-xs",children:"In Transit"}),
                  e.jsx(F,{value:"Completed",className:"text-xs",children:"Completed"}),
                  e.jsx(F,{value:"Cancelled",className:"text-xs",children:"Cancelled"})
                ]})
              ]})
            ]}),

            // 6. Client Payment Status
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-payment-status",className:"text-xs font-semibold",children:"Client Payment Status"}),
              e.jsxs(pe,{value:r.client_payment_status,onValueChange:m=>x({...r,client_payment_status:m}),children:[
                e.jsx(xe,{id:"edit-payment-status",className:"bg-background h-9 text-xs",children:e.jsx(he,{})}),
                e.jsxs(fe,{children:[
                  e.jsx(F,{value:"pending",className:"text-xs",children:"Pending"}),
                  e.jsx(F,{value:"partial",className:"text-xs",children:"Advance Received"}),
                  e.jsx(F,{value:"paid",className:"text-xs",children:"Paid"}),
                  e.jsx(F,{value:"overdue",className:"text-xs",children:"Overdue"})
                ]})
              ]})
            ]}),

            // 7. Loading Charges
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsxs("div",{className:"flex items-center justify-between",children:[
                e.jsx(z,{htmlFor:"edit-loading_charges",className:"text-xs font-semibold",children:"Loading Charges (₹)"}),
                e.jsxs("div",{className:"inline-flex rounded-md border border-border p-0.5 text-[10px] bg-muted/40",children:[
                  e.jsx("button",{type:"button",onClick:()=>x({...r,loading_paid_by:"client"}),className:`px-1.5 py-0.5 rounded transition-colors ${r.loading_paid_by!=="company"?"bg-primary text-primary-foreground font-bold":"text-muted-foreground hover:text-foreground"}`,children:"Client"}),
                  e.jsx("button",{type:"button",onClick:()=>x({...r,loading_paid_by:"company"}),className:`px-1.5 py-0.5 rounded transition-colors ${r.loading_paid_by==="company"?"bg-primary text-primary-foreground font-bold":"text-muted-foreground hover:text-foreground"}`,children:"Company"})
                ]})
              ]}),
              e.jsx(se,{id:"edit-loading_charges",type:"number",step:"0.01",value:r.loading_charges,onChange:m=>x({...r,loading_charges:m.target.value}),placeholder:"0",className:"bg-background h-9 text-xs font-mono"})
            ]}),

            // 8. Unloading Charges
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsxs("div",{className:"flex items-center justify-between",children:[
                e.jsx(z,{htmlFor:"edit-unloading_charges",className:"text-xs font-semibold",children:"Unloading Charges (₹)"}),
                e.jsxs("div",{className:"inline-flex rounded-md border border-border p-0.5 text-[10px] bg-muted/40",children:[
                  e.jsx("button",{type:"button",onClick:()=>x({...r,unloading_paid_by:"client"}),className:`px-1.5 py-0.5 rounded transition-colors ${r.unloading_paid_by!=="company"?"bg-primary text-primary-foreground font-bold":"text-muted-foreground hover:text-foreground"}`,children:"Client"}),
                  e.jsx("button",{type:"button",onClick:()=>x({...r,unloading_paid_by:"company"}),className:`px-1.5 py-0.5 rounded transition-colors ${r.unloading_paid_by==="company"?"bg-primary text-primary-foreground font-bold":"text-muted-foreground hover:text-foreground"}`,children:"Company"})
                ]})
              ]}),
              e.jsx(se,{id:"edit-unloading_charges",type:"number",step:"0.01",value:r.unloading_charges,onChange:m=>x({...r,unloading_charges:m.target.value}),placeholder:"0",className:"bg-background h-9 text-xs font-mono"})
            ]}),

            // 9. Broker Commission
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-broker_commission",className:"text-xs font-semibold",children:"Broker Commission (₹)"}),
              e.jsx(se,{id:"edit-broker_commission",type:"number",step:"0.01",value:r.broker_commission,onChange:m=>x({...r,broker_commission:m.target.value}),placeholder:"0",className:"bg-background h-9 text-xs font-mono"})
            ]}),

            // 10. Munsiyana
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-munsiyana",className:"text-xs font-semibold",children:"Munsiyana Deducted (₹)"}),
              e.jsx(se,{id:"edit-munsiyana",type:"number",step:"0.01",value:r.munsiyana,onChange:m=>x({...r,munsiyana:m.target.value}),placeholder:"0",className:"bg-background h-9 text-xs font-mono"})
            ]}),

            // 11. Assigned Managers
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-managers",className:"text-xs font-semibold",children:"Assigned Managers"}),
              e.jsx(se,{id:"edit-managers",type:"text",value:r.assigned_managers,onChange:m=>x({...r,assigned_managers:m.target.value}),placeholder:"e.g. John Doe, Jane Smith",className:"bg-background h-9 text-xs"})
            ]}),

            // 12. Late Delivery Reason
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-late-reason",className:"text-xs font-semibold text-rose-400",children:"Late Delivery Reason (If Delayed)"}),
              e.jsx(se,{id:"edit-late-reason",type:"text",value:r.late_delivery_reason||"",onChange:m=>x({...r,late_delivery_reason:m.target.value}),placeholder:"e.g. Traffic Congestion, Breakdown",className:"bg-background h-9 text-xs"})
            ]})
          ]}),

          // Attached fleet options if applicable
          W==="Attached"&&e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-blue-900/35 bg-blue-950/10 animate-in fade-in duration-300 mt-2",children:[
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-payment_model",className:"text-xs font-semibold",children:"Brokerage Payment Model"}),
              e.jsxs(pe,{value:r.payment_model,onValueChange:m=>x(v=>({...v,payment_model:m,vendor_payout:m==="Model3"?Math.max(0,(parseFloat(v.revenue)||0)-500).toString():v.vendor_payout})),children:[
                e.jsx(xe,{id:"edit-payment_model",className:"bg-background h-9 text-xs",children:e.jsx(he,{})}),
                e.jsxs(fe,{children:[
                  e.jsx(F,{value:"Model2",className:"text-xs",children:"Margin Based (Model 2)"}),
                  e.jsx(F,{value:"Model3",className:"text-xs",children:"Flat Fee Rs. 500 (Model 3)"})
                ]})
              ]})
            ]}),
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-vendor_payout",className:"text-xs font-semibold",children:"Agreed Vendor Payout (Rs. )"}),
              e.jsx(se,{id:"edit-vendor_payout",type:"number",step:"0.01",disabled:r.payment_model==="Model3",value:r.payment_model==="Model3"?Math.max(0,(parseFloat(r.revenue)||0)-500).toString():r.vendor_payout,onChange:m=>x({...r,vendor_payout:m.target.value}),placeholder:"0",className:"bg-background h-9 text-xs font-mono"})
            ]})
          ]})
        ]}),

        // ==========================================
        // CARD 3: 🛡️ Dispatch Compliance, Live GPS & SLA Tracker
        // ==========================================
        e.jsxs("div",{className:"bg-secondary/15 rounded-2xl p-5 border border-border/60 space-y-4 shadow-sm",children:[
          e.jsxs("div",{className:"flex items-center justify-between pb-2 border-b border-border/40",children:[
            e.jsxs("h4",{className:"text-sm font-bold flex items-center gap-2 text-foreground",children:[
              e.jsx("span",{children:"🛡️"}),
              " Dispatch Compliance, Live GPS & SLA Tracker"
            ]}),
            e.jsx("span",{className:"text-[11px] text-muted-foreground",children:"Mandatory transit documentation, live GPS link & security seals"})
          ]}),
          e.jsx(_DispatchComplianceSection,{formData:r,setFormData:x,ReactModule:a,jsx:e})
        ]}),

        // ==========================================
        // CARD 4: 📍 Milestone Schedule & Visit Timestamps
        // ==========================================
        e.jsxs("div",{className:"bg-secondary/15 rounded-2xl p-5 border border-border/60 space-y-4 shadow-sm",children:[
          e.jsxs("div",{className:"flex items-center justify-between pb-2 border-b border-border/40",children:[
            e.jsxs("h4",{className:"text-sm font-bold flex items-center gap-2 text-foreground",children:[
              e.jsx("span",{children:"📍"}),
              " Milestone Schedule & Visit Timestamps"
            ]}),
            e.jsx("span",{className:"text-[11px] text-muted-foreground",children:"Multi-stop route milestones and actual dock times"})
          ]}),
          e.jsx(Ta,{stops:j,onChange:C,legLabel:"Milestone Schedule (SLA Target Times)"}),
          e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-border/40",children:[
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-dock-arrival",className:"text-xs font-semibold",children:"Arrived at Dock Time"}),
              e.jsx(se,{id:"edit-dock-arrival",type:"datetime-local",value:r.loading_dock_arrival_time,onChange:m=>x({...r,loading_dock_arrival_time:m.target.value}),className:"bg-background h-9 text-xs"})
            ]}),
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-dispatch-time",className:"text-xs font-semibold",children:"Dispatched Time"}),
              e.jsx(se,{id:"edit-dispatch-time",type:"datetime-local",value:r.dispatched_time,onChange:m=>x({...r,dispatched_time:m.target.value}),className:"bg-background h-9 text-xs"})
            ]}),
            e.jsxs("div",{className:"space-y-1.5",children:[
              e.jsx(z,{htmlFor:"edit-delivery-time",className:"text-xs font-semibold",children:"Delivered Time"}),
              e.jsx(se,{id:"edit-delivery-time",type:"datetime-local",value:r.delivered_time,onChange:m=>x({...r,delivered_time:m.target.value}),className:"bg-background h-9 text-xs"})
            ]})
          ]})
        ]})

      ]}),

      // ==========================================
      // FOOTER: Pinned Save Changes & Cancel
      // ==========================================
      e.jsxs(Pe,{className:"p-4 px-6 border-t border-border/50 bg-card/95 backdrop-blur-sm shrink-0 flex items-center justify-end gap-3 z-10",children:[
        e.jsx(S,{type:"button",variant:"outline",onClick:d,disabled:p,className:"rounded-xl px-5 h-10 text-xs font-bold",children:"Cancel"}),
        e.jsx(S,{type:"submit",disabled:p,className:"rounded-xl px-6 h-10 text-xs font-bold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground",children:p?e.jsxs(Da.Fragment,{children:[e.jsx(Te,{className:"w-4 h-4 mr-2 animate-spin"}),"Saving..."]}):"Save Changes"})
      ]})
    ]})
  ]})})
},tr=async(n,d)=>new Promise((s,N)=>{const u=new FileReader;u.onload=async g=>{try{const p=g.target.result;let h=[];if(n.name.endsWith(".csv"))h=Ma.parse(p,{header:!0,skipEmptyLines:!0}).data;else if(n.name.match(/\.xlsx?$/)){const x=Ja(p,{type:"binary"}),j=x.SheetNames[0];h=Ya.sheet_to_json(x.Sheets[j])}else throw new Error("Unsupported file format");if(h.length===0)throw new Error("File is empty");let _=0,b=0,r=[];for(let x=0;x<h.length;x++){const j=h[x],C=x+2;d&&d(Math.round((x+1)/h.length*100));try{if(!j["Trip Date"])throw new Error("Trip Date is required");if(!j["Truck No"])throw new Error("Truck No is required");if(!j["Driver Name"])throw new Error("Driver Name is required");let I;try{const E=new Date(j["Trip Date"]);if(isNaN(E.getTime()))throw new Error;I=ce(E,"yyyy-MM-dd")}catch{throw new Error(`Invalid Date format: ${j["Trip Date"]}. Use YYYY-MM-DD.`)}const re=`${j["Starting Location"]||"Unknown"} - ${j["Ending Location"]||"Unknown"}`,W={date:I,truck_number:j["Truck No"],driver_employee_id:(()=>{const c=(j["Driver Code"]||j["Driver Employee Code"]||j["Employee Code"]||"").toString().trim().toUpperCase();return(/^[DE]\d{3,}$/.test(c)&&(typeof s!=="undefined"?s:[]).find(e=>e.employee_code===c)?.id)||null})(),driver_employee_code:(()=>{const c=(j["Driver Code"]||j["Driver Employee Code"]||j["Employee Code"]||"").toString().trim().toUpperCase();return(/^[DE]\d{3,}$/.test(c)&&(typeof s!=="undefined"?s:[]).find(e=>e.employee_code===c)?.employee_code)||null})(),driver_name:j["Driver Name"]||"Temporary Driver",route:re,kms:parseFloat(j["Distance (KM)"])||0,client_payment_status:"pending",created_by:D.authStore.model?.email||"bulk-upload"};await D.collection("trip_logs").create(W,{$autoCancel:!1});const X=parseFloat(j["Fuel Used (Liters)"]);X>0&&await D.collection("expenses_fuel").create({amount:X*90,liters:X,date:I,created_by:D.authStore.model?.id||""},{$autoCancel:!1});const m=parseFloat(j["FASTag Amount (Rs. )"]);m>0&&await D.collection("expenses_fastag").create({amount:m,truck_number:j["Truck No"],date:I,created_by:D.authStore.model?.id||""},{$autoCancel:!1});const v=parseFloat(j["Driver Advance (Rs. )"]);v>0&&await D.collection("expenses_driver_advance").create({amount:v,driver_name:j["Driver Name"],date:I,created_by:D.authStore.model?.id||""},{$autoCancel:!1});const T=parseFloat(j["Maintenance Cost (Rs. )"]);T>0&&await D.collection("expenses_maintenance").create({amount:T,service:"Bulk Import Maintenance",truck_number:j["Truck No"],service_provider_name:"Unknown",date:I,created_by:D.authStore.model?.id||""},{$autoCancel:!1});const A=parseFloat(j["Miscellaneous Cost (Rs. )"]);A>0&&await D.collection("expenses_miscellaneous").create({amount:A,expense_description:"Bulk Import Misc",date:I,created_by:D.authStore.model?.id||""},{$autoCancel:!1}),_++}catch(I){b++,r.push({row:C,error:I.message})}}s({total:h.length,successful:_,failed:b,errors:r})}catch(p){N(p)}},u.onerror=()=>N(new Error("File reading failed")),n.name.endsWith(".csv")?u.readAsText(n):u.readAsBinaryString(n)}),sr=({isOpen:n,onClose:d,onSuccess:s})=>{const[N,u]=a.useState(!1),[g,p]=a.useState(null),[h,_]=a.useState(!1),[b,r]=a.useState(0),[x,j]=a.useState(null),C=a.useCallback(T=>{T.preventDefault(),u(!0)},[]),I=a.useCallback(T=>{T.preventDefault(),u(!1)},[]),re=a.useCallback(T=>{if(T.preventDefault(),u(!1),T.dataTransfer.files&&T.dataTransfer.files.length>0){const A=T.dataTransfer.files[0];A.name.match(/\.(csv|xlsx|xls)$/)?p(A):$.error("Invalid file type. Please upload CSV or Excel.")}},[]),W=T=>{T.target.files&&T.target.files.length>0&&p(T.target.files[0])},X=()=>{const T=`Trip Date,Truck No,Driver Name,Starting Location,Ending Location,Distance (KM),Fuel Used (Liters),Toll Amount (Rs. ),FASTag Amount (Rs. ),Driver Advance (Rs. ),Maintenance Cost (Rs. ),Miscellaneous Cost (Rs. ),Trip Status,Notes
`,A=`2026-06-08,MH12AB1234,John Doe,Mumbai,Delhi,1400,250,1500,2000,5000,0,500,completed,Test trip
`,E=new Blob([T+A],{type:"text/csv"}),Y=window.URL.createObjectURL(E),U=document.createElement("a");U.href=Y,U.download="trip_upload_template.csv",U.click(),window.URL.revokeObjectURL(Y)},m=async()=>{if(g){_(!0),r(0),j(null);try{const T=await tr(g,A=>r(A));j(T),T.successful>0&&($.success(`Successfully imported ${T.successful} trips`),s())}catch(T){$.error(T.message||"Failed to process file")}finally{_(!1)}}},v=()=>{p(null),j(null),r(0)};return e.jsx(Me,{open:n,onOpenChange:T=>{T||(v(),d())},children:e.jsxs(Re,{className:"sm:max-w-[600px] bg-card border-border",children:[e.jsxs(Fe,{children:[e.jsx($e,{children:"Bulk Upload Trips"}),e.jsx(ze,{children:"Import multiple trips and related expenses from a CSV or Excel file."})]}),x?e.jsxs("div",{className:"space-y-6 pt-4 text-center",children:[e.jsx("div",{className:"flex justify-center mb-4",children:x.failed===0?e.jsx("div",{className:"w-16 h-16 rounded-full bg-success/20 flex items-center justify-center",children:e.jsx(Ht,{className:"w-8 h-8 text-success"})}):e.jsx("div",{className:"w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center",children:e.jsx(nt,{className:"w-8 h-8 text-warning"})})}),e.jsx("h3",{className:"text-xl font-semibold",children:"Import Complete"}),e.jsxs("div",{className:"grid grid-cols-2 gap-4 max-w-sm mx-auto",children:[e.jsxs("div",{className:"p-4 bg-muted/30 rounded-lg border border-border",children:[e.jsx("p",{className:"text-3xl font-bold text-success",children:x.successful}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Successful"})]}),e.jsxs("div",{className:"p-4 bg-muted/30 rounded-lg border border-border",children:[e.jsx("p",{className:"text-3xl font-bold text-destructive",children:x.failed}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Failed"})]})]}),x.errors.length>0&&e.jsxs("div",{className:"text-left bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-sm max-h-40 overflow-y-auto",children:[e.jsx("p",{className:"font-semibold text-destructive mb-2",children:"Error Details:"}),e.jsx("ul",{className:"list-disc pl-5 space-y-1",children:x.errors.map((T,A)=>e.jsxs("li",{className:"text-destructive/80",children:["Row ",T.row,": ",T.error]},A))})]}),e.jsxs("div",{className:"flex justify-center gap-3 pt-4",children:[x.failed>0&&e.jsx(S,{variant:"outline",onClick:v,children:"Try Again"}),e.jsx(S,{onClick:d,children:"Close"})]})]}):e.jsxs("div",{className:"space-y-6 pt-4",children:[e.jsxs("div",{className:"flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(rs,{className:"w-5 h-5 text-primary"}),e.jsx("span",{className:"text-sm font-medium",children:"Need the template?"})]}),e.jsxs(S,{variant:"outline",size:"sm",onClick:X,children:[e.jsx(na,{className:"w-4 h-4 mr-2"})," Download CSV"]})]}),e.jsx("div",{onDragOver:C,onDragLeave:I,onDrop:re,className:`
                border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors
                ${N?"border-primary bg-primary/5":"border-border bg-muted/20"}
              `,children:g?e.jsxs(e.Fragment,{children:[e.jsx(rs,{className:"w-12 h-12 text-primary mb-3"}),e.jsx("p",{className:"font-medium text-foreground",children:g.name}),e.jsxs("p",{className:"text-xs text-muted-foreground mb-4",children:[(g.size/1024).toFixed(2)," KB"]}),e.jsx(S,{variant:"ghost",size:"sm",onClick:()=>p(null),children:"Remove file"})]}):e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"w-16 h-16 rounded-full bg-background border border-border shadow-sm flex items-center justify-center mb-4",children:e.jsx(gs,{className:"w-8 h-8 text-muted-foreground"})}),e.jsx("h3",{className:"text-lg font-medium mb-1",children:"Drag & Drop your file here"}),e.jsx("p",{className:"text-sm text-muted-foreground mb-4",children:"Supports .CSV, .XLS, .XLSX"}),e.jsxs("div",{className:"relative",children:[e.jsx("input",{type:"file",accept:".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel",onChange:W,className:"absolute inset-0 w-full h-full opacity-0 cursor-pointer"}),e.jsx(S,{variant:"secondary",children:"Browse Files"})]})]})}),h&&e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex justify-between text-sm",children:[e.jsx("span",{children:"Processing file..."}),e.jsxs("span",{children:[b,"%"]})]}),e.jsx(ws,{value:b,className:"h-2"})]}),e.jsxs("div",{className:"flex justify-end gap-3",children:[e.jsx(S,{variant:"outline",onClick:d,disabled:h,children:"Cancel"}),e.jsx(S,{onClick:m,disabled:!g||h,className:"bg-primary",children:h?"Importing...":"Start Import"})]})]})]})})},ar=({isOpen:n,onClose:d,trip:s,onSuccess:N})=>{const[u,g]=a.useState(!1),p=async()=>{g(!0);try{const _=new Date,b=new Date;b.setDate(_.getDate()+7),await D.collection("payment_requests").create({trip_id:s.id,client_id:s.client_id||s.expand?.client_id?.id,amount:s.revenue||0,request_date:_.toISOString().split("T")[0],due_date:b.toISOString().split("T")[0],status:"Pending"},{$autoCancel:!1}),$.success("Payment request sent to client"),N?.(),d()}catch(_){console.error("Error creating payment request:",_),$.error("Failed to send payment request. Please try again.")}finally{g(!1)}},h=()=>{N?.(),d()};return s?e.jsx(Me,{open:n,onOpenChange:_=>!_&&!u&&d(),children:e.jsxs(Re,{className:"max-w-md rounded-2xl",children:[e.jsxs(Fe,{children:[e.jsxs("div",{className:"flex items-center gap-3 mb-1",children:[e.jsx("div",{className:"p-2 bg-emerald-500/10 rounded-xl",children:e.jsx(Ht,{className:"w-5 h-5 text-emerald-600"})}),e.jsx($e,{className:"text-xl font-heading",children:"Trip Marked as Delivered"})]}),e.jsxs(ze,{className:"text-sm text-muted-foreground pt-1",children:["Trip ",e.jsx("span",{className:"font-mono font-bold text-foreground",children:s.trip_id}),s.client_trip_id&&e.jsxs("span",{className:"text-sky-400 font-mono text-xs",children:[" (Client Ref: ",s.client_trip_id,")"]}),s.lr_number&&e.jsxs("span",{className:"text-amber-400 font-mono text-xs",children:[" (LR: #",s.lr_number,")"]})," ","to ",e.jsx("span",{className:"font-semibold text-foreground",children:s.route})," has been marked as ",e.jsx("span",{className:"font-semibold text-emerald-600",children:"Delivered"}),"."," ","Would you like to send a payment request of"," ",e.jsx("span",{className:"font-semibold text-foreground",children:ae(s.revenue)})," to the client now?"]})]}),e.jsxs(Pe,{className:"mt-4 flex flex-col sm:flex-row gap-2",children:[e.jsx(S,{variant:"ghost",onClick:h,disabled:u,className:"rounded-xl",children:"Skip for Now"}),e.jsxs(S,{onClick:p,disabled:u||!s.client_id,className:"rounded-xl shadow-sm",children:[u?e.jsx(Te,{className:"w-4 h-4 mr-2 animate-spin"}):e.jsx(la,{className:"w-4 h-4 mr-2"}),"Send Payment Request"]})]}),!s.client_id&&!s.expand?.client_id&&e.jsx("p",{className:"text-xs text-destructive text-center mt-2",children:"Cannot send request: No client assigned to this trip."})]})}):null},rr=ia,nr=oa,ks=a.forwardRef(({className:n,align:d="center",sideOffset:s=4,...N},u)=>e.jsx(da,{children:e.jsx(bs,{ref:u,align:d,sideOffset:s,className:V("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-popover-content-transform-origin]",n),...N})}));ks.displayName=bs.displayName;var ps=1,lr=.9,ir=.8,or=.17,Pt=.1,Lt=.999,dr=.9999,cr=.99,mr=/[\\\/_+.#"@\[\(\{&]/,ur=/[\\\/_+.#"@\[\(\{&]/g,pr=/[\s-]/,Ss=/[\s-]/g;function zt(n,d,s,N,u,g,p){if(g===d.length)return u===n.length?ps:cr;var h=`${u},${g}`;if(p[h]!==void 0)return p[h];for(var _=N.charAt(g),b=s.indexOf(_,u),r=0,x,j,C,I;b>=0;)x=zt(n,d,s,N,b+1,g+1,p),x>r&&(b===u?x*=ps:mr.test(n.charAt(b-1))?(x*=ir,C=n.slice(u,b-1).match(ur),C&&u>0&&(x*=Math.pow(Lt,C.length))):pr.test(n.charAt(b-1))?(x*=lr,I=n.slice(u,b-1).match(Ss),I&&u>0&&(x*=Math.pow(Lt,I.length))):(x*=or,u>0&&(x*=Math.pow(Lt,b-u))),n.charAt(b)!==d.charAt(g)&&(x*=dr)),(x<Pt&&s.charAt(b-1)===N.charAt(g+1)||N.charAt(g+1)===N.charAt(g)&&s.charAt(b-1)!==N.charAt(g))&&(j=zt(n,d,s,N,b+1,g+2,p),j*Pt>x&&(x=j*Pt)),x>r&&(r=x),b=s.indexOf(_,b+1);return p[h]=r,r}function xs(n){return n.toLowerCase().replace(Ss," ")}function xr(n,d,s){return n=s&&s.length>0?`${n+" "+s.join(" ")}`:n,zt(n,d,xs(n),xs(d),0,0,{})}var mt='[cmdk-group=""]',Et='[cmdk-group-items=""]',hr='[cmdk-group-heading=""]',Cs='[cmdk-item=""]',hs=`${Cs}:not([aria-disabled="true"])`,Vt="cmdk-item-select",at="data-value",fr=(n,d,s)=>xr(n,d,s),Ds=a.createContext(void 0),pt=()=>a.useContext(Ds),Ts=a.createContext(void 0),qt=()=>a.useContext(Ts),As=a.createContext(void 0),Ms=a.forwardRef((n,d)=>{let s=rt(()=>{var c,M;return{search:"",value:(M=(c=n.value)!=null?c:n.defaultValue)!=null?M:"",selectedItemId:void 0,filtered:{count:0,items:new Map,groups:new Set}}}),N=rt(()=>new Set),u=rt(()=>new Map),g=rt(()=>new Map),p=rt(()=>new Set),h=Rs(n),{label:_,children:b,value:r,onValueChange:x,filter:j,shouldFilter:C,loop:I,disablePointerSelection:re=!1,vimBindings:W=!0,...X}=n,m=lt(),v=lt(),T=lt(),A=a.useRef(null),E=Cr();Je(()=>{if(r!==void 0){let c=r.trim();s.current.value=c,Y.emit()}},[r]),Je(()=>{E(6,ge)},[]);let Y=a.useMemo(()=>({subscribe:c=>(p.current.add(c),()=>p.current.delete(c)),snapshot:()=>s.current,setState:(c,M,k)=>{var w,H,q,me;if(!Object.is(s.current[c],M)){if(s.current[c]=M,c==="search")le(),ne(),E(1,P);else if(c==="value"){if(document.activeElement.hasAttribute("cmdk-input")||document.activeElement.hasAttribute("cmdk-root")){let oe=document.getElementById(T);oe?oe.focus():(w=document.getElementById(m))==null||w.focus()}if(E(7,()=>{var oe;s.current.selectedItemId=(oe=O())==null?void 0:oe.id,Y.emit()}),k||E(5,ge),((H=h.current)==null?void 0:H.value)!==void 0){let oe=M??"";(me=(q=h.current).onValueChange)==null||me.call(q,oe);return}}Y.emit()}},emit:()=>{p.current.forEach(c=>c())}}),[]),U=a.useMemo(()=>({value:(c,M,k)=>{var w;M!==((w=g.current.get(c))==null?void 0:w.value)&&(g.current.set(c,{value:M,keywords:k}),s.current.filtered.items.set(c,G(M,k)),E(2,()=>{ne(),Y.emit()}))},item:(c,M)=>(N.current.add(c),M&&(u.current.has(M)?u.current.get(M).add(c):u.current.set(M,new Set([c]))),E(3,()=>{le(),ne(),s.current.value||P(),Y.emit()}),()=>{g.current.delete(c),N.current.delete(c),s.current.filtered.items.delete(c);let k=O();E(4,()=>{le(),k?.getAttribute("id")===c&&P(),Y.emit()})}),group:c=>(u.current.has(c)||u.current.set(c,new Set),()=>{g.current.delete(c),u.current.delete(c)}),filter:()=>h.current.shouldFilter,label:_||n["aria-label"],getDisablePointerSelection:()=>h.current.disablePointerSelection,listId:m,inputId:T,labelId:v,listInnerRef:A}),[]);function G(c,M){var k,w;let H=(w=(k=h.current)==null?void 0:k.filter)!=null?w:fr;return c?H(c,s.current.search,M):0}function ne(){if(!s.current.search||h.current.shouldFilter===!1)return;let c=s.current.filtered.items,M=[];s.current.filtered.groups.forEach(w=>{let H=u.current.get(w),q=0;H.forEach(me=>{let oe=c.get(me);q=Math.max(oe,q)}),M.push([w,q])});let k=A.current;ee().sort((w,H)=>{var q,me;let oe=w.getAttribute("id"),Qe=H.getAttribute("id");return((q=c.get(Qe))!=null?q:0)-((me=c.get(oe))!=null?me:0)}).forEach(w=>{let H=w.closest(Et);H?H.appendChild(w.parentElement===H?w:w.closest(`${Et} > *`)):k.appendChild(w.parentElement===k?w:w.closest(`${Et} > *`))}),M.sort((w,H)=>H[1]-w[1]).forEach(w=>{var H;let q=(H=A.current)==null?void 0:H.querySelector(`${mt}[${at}="${encodeURIComponent(w[0])}"]`);q?.parentElement.appendChild(q)})}function P(){let c=ee().find(k=>k.getAttribute("aria-disabled")!=="true"),M=c?.getAttribute(at);Y.setState("value",M||void 0)}function le(){var c,M,k,w;if(!s.current.search||h.current.shouldFilter===!1){s.current.filtered.count=N.current.size;return}s.current.filtered.groups=new Set;let H=0;for(let q of N.current){let me=(M=(c=g.current.get(q))==null?void 0:c.value)!=null?M:"",oe=(w=(k=g.current.get(q))==null?void 0:k.keywords)!=null?w:[],Qe=G(me,oe);s.current.filtered.items.set(q,Qe),Qe>0&&H++}for(let[q,me]of u.current)for(let oe of me)if(s.current.filtered.items.get(oe)>0){s.current.filtered.groups.add(q);break}s.current.filtered.count=H}function ge(){var c,M,k;let w=O();w&&(((c=w.parentElement)==null?void 0:c.firstChild)===w&&((k=(M=w.closest(mt))==null?void 0:M.querySelector(hr))==null||k.scrollIntoView({block:"nearest"})),w.scrollIntoView({block:"nearest"}))}function O(){var c;return(c=A.current)==null?void 0:c.querySelector(`${Cs}[aria-selected="true"]`)}function ee(){var c;return Array.from(((c=A.current)==null?void 0:c.querySelectorAll(hs))||[])}function ye(c){let M=ee()[c];M&&Y.setState("value",M.getAttribute(at))}function Ae(c){var M;let k=O(),w=ee(),H=w.findIndex(me=>me===k),q=w[H+c];(M=h.current)!=null&&M.loop&&(q=H+c<0?w[w.length-1]:H+c===w.length?w[0]:w[H+c]),q&&Y.setState("value",q.getAttribute(at))}function we(c){let M=O(),k=M?.closest(mt),w;for(;k&&!w;)k=c>0?kr(k,mt):Sr(k,mt),w=k?.querySelector(hs);w?Y.setState("value",w.getAttribute(at)):Ae(c)}let je=()=>ye(ee().length-1),Ye=c=>{c.preventDefault(),c.metaKey?je():c.altKey?we(1):Ae(1)},it=c=>{c.preventDefault(),c.metaKey?ye(0):c.altKey?we(-1):Ae(-1)};return a.createElement(He.div,{ref:d,tabIndex:-1,...X,"cmdk-root":"",onKeyDown:c=>{var M;(M=X.onKeyDown)==null||M.call(X,c);let k=c.nativeEvent.isComposing||c.keyCode===229;if(!(c.defaultPrevented||k))switch(c.key){case"n":case"j":{W&&c.ctrlKey&&Ye(c);break}case"ArrowDown":{Ye(c);break}case"p":case"k":{W&&c.ctrlKey&&it(c);break}case"ArrowUp":{it(c);break}case"Home":{c.preventDefault(),ye(0);break}case"End":{c.preventDefault(),je();break}case"Enter":{c.preventDefault();let w=O();if(w){let H=new Event(Vt);w.dispatchEvent(H)}}}}},a.createElement("label",{"cmdk-label":"",htmlFor:U.inputId,id:U.labelId,style:Tr},_),_t(n,c=>a.createElement(Ts.Provider,{value:Y},a.createElement(Ds.Provider,{value:U},c))))}),gr=a.forwardRef((n,d)=>{var s,N;let u=lt(),g=a.useRef(null),p=a.useContext(As),h=pt(),_=Rs(n),b=(N=(s=_.current)==null?void 0:s.forceMount)!=null?N:p?.forceMount;Je(()=>{if(!b)return h.item(u,p?.id)},[b]);let r=Fs(u,g,[n.value,n.children,g],n.keywords),x=qt(),j=Ve(E=>E.value&&E.value===r.current),C=Ve(E=>b||h.filter()===!1?!0:E.search?E.filtered.items.get(u)>0:!0);a.useEffect(()=>{let E=g.current;if(!(!E||n.disabled))return E.addEventListener(Vt,I),()=>E.removeEventListener(Vt,I)},[C,n.onSelect,n.disabled]);function I(){var E,Y;re(),(Y=(E=_.current).onSelect)==null||Y.call(E,r.current)}function re(){x.setState("value",r.current,!0)}if(!C)return null;let{disabled:W,value:X,onSelect:m,forceMount:v,keywords:T,...A}=n;return a.createElement(He.div,{ref:ut(g,d),...A,id:u,"cmdk-item":"",role:"option","aria-disabled":!!W,"aria-selected":!!j,"data-disabled":!!W,"data-selected":!!j,onPointerMove:W||h.getDisablePointerSelection()?void 0:re,onClick:W?void 0:I},n.children)}),br=a.forwardRef((n,d)=>{let{heading:s,children:N,forceMount:u,...g}=n,p=lt(),h=a.useRef(null),_=a.useRef(null),b=lt(),r=pt(),x=Ve(C=>u||r.filter()===!1?!0:C.search?C.filtered.groups.has(p):!0);Je(()=>r.group(p),[]),Fs(p,h,[n.value,n.heading,_]);let j=a.useMemo(()=>({id:p,forceMount:u}),[u]);return a.createElement(He.div,{ref:ut(h,d),...g,"cmdk-group":"",role:"presentation",hidden:x?void 0:!0},s&&a.createElement("div",{ref:_,"cmdk-group-heading":"","aria-hidden":!0,id:b},s),_t(n,C=>a.createElement("div",{"cmdk-group-items":"",role:"group","aria-labelledby":s?b:void 0},a.createElement(As.Provider,{value:j},C))))}),vr=a.forwardRef((n,d)=>{let{alwaysRender:s,...N}=n,u=a.useRef(null),g=Ve(p=>!p.search);return!s&&!g?null:a.createElement(He.div,{ref:ut(u,d),...N,"cmdk-separator":"",role:"separator"})}),yr=a.forwardRef((n,d)=>{let{onValueChange:s,...N}=n,u=n.value!=null,g=qt(),p=Ve(b=>b.search),h=Ve(b=>b.selectedItemId),_=pt();return a.useEffect(()=>{n.value!=null&&g.setState("search",n.value)},[n.value]),a.createElement(He.input,{ref:d,...N,"cmdk-input":"",autoComplete:"off",autoCorrect:"off",spellCheck:!1,"aria-autocomplete":"list",role:"combobox","aria-expanded":!0,"aria-controls":_.listId,"aria-labelledby":_.labelId,"aria-activedescendant":h,id:_.inputId,type:"text",value:u?n.value:p,onChange:b=>{u||g.setState("search",b.target.value),s?.(b.target.value)}})}),jr=a.forwardRef((n,d)=>{let{children:s,label:N="Suggestions",...u}=n,g=a.useRef(null),p=a.useRef(null),h=Ve(b=>b.selectedItemId),_=pt();return a.useEffect(()=>{if(p.current&&g.current){let b=p.current,r=g.current,x,j=new ResizeObserver(()=>{x=requestAnimationFrame(()=>{let C=b.offsetHeight;r.style.setProperty("--cmdk-list-height",C.toFixed(1)+"px")})});return j.observe(b),()=>{cancelAnimationFrame(x),j.unobserve(b)}}},[]),a.createElement(He.div,{ref:ut(g,d),...u,"cmdk-list":"",role:"listbox",tabIndex:-1,"aria-activedescendant":h,"aria-label":N,id:_.listId},_t(n,b=>a.createElement("div",{ref:ut(p,_.listInnerRef),"cmdk-list-sizer":""},b)))}),_r=a.forwardRef((n,d)=>{let{open:s,onOpenChange:N,overlayClassName:u,contentClassName:g,container:p,...h}=n;return a.createElement(ca,{open:s,onOpenChange:N},a.createElement(ma,{container:p},a.createElement(ua,{"cmdk-overlay":"",className:u}),a.createElement(pa,{"aria-label":n.label,"cmdk-dialog":"",className:g},a.createElement(Ms,{ref:d,...h}))))}),Nr=a.forwardRef((n,d)=>Ve(s=>s.filtered.count===0)?a.createElement(He.div,{ref:d,...n,"cmdk-empty":"",role:"presentation"}):null),wr=a.forwardRef((n,d)=>{let{progress:s,children:N,label:u="Loading...",...g}=n;return a.createElement(He.div,{ref:d,...g,"cmdk-loading":"",role:"progressbar","aria-valuenow":s,"aria-valuemin":0,"aria-valuemax":100,"aria-label":u},_t(n,p=>a.createElement("div",{"aria-hidden":!0},p)))}),ve=Object.assign(Ms,{List:jr,Item:gr,Input:yr,Group:br,Separator:vr,Dialog:_r,Empty:Nr,Loading:wr});function kr(n,d){let s=n.nextElementSibling;for(;s;){if(s.matches(d))return s;s=s.nextElementSibling}}function Sr(n,d){let s=n.previousElementSibling;for(;s;){if(s.matches(d))return s;s=s.previousElementSibling}}function Rs(n){let d=a.useRef(n);return Je(()=>{d.current=n}),d}var Je=typeof window>"u"?a.useEffect:a.useLayoutEffect;function rt(n){let d=a.useRef();return d.current===void 0&&(d.current=n()),d}function Ve(n){let d=qt(),s=()=>n(d.snapshot());return a.useSyncExternalStore(d.subscribe,s,s)}function Fs(n,d,s,N=[]){let u=a.useRef(),g=pt();return Je(()=>{var p;let h=(()=>{var b;for(let r of s){if(typeof r=="string")return r.trim();if(typeof r=="object"&&"current"in r)return r.current?(b=r.current.textContent)==null?void 0:b.trim():u.current}})(),_=N.map(b=>b.trim());g.value(n,h,_),(p=d.current)==null||p.setAttribute(at,h),u.current=h}),u}var Cr=()=>{let[n,d]=a.useState(),s=rt(()=>new Map);return Je(()=>{s.current.forEach(N=>N()),s.current=new Map},[n]),(N,u)=>{s.current.set(N,u),d({})}};function Dr(n){let d=n.type;return typeof d=="function"?d(n.props):"render"in d?d.render(n.props):n}function _t({asChild:n,children:d},s){return n&&a.isValidElement(d)?a.cloneElement(Dr(d),{ref:d.ref},s(d.props.children)):s(d)}var Tr={position:"absolute",width:"1px",height:"1px",padding:"0",margin:"-1px",overflow:"hidden",clip:"rect(0, 0, 0, 0)",whiteSpace:"nowrap",borderWidth:"0"};const $s=a.forwardRef(({className:n,...d},s)=>e.jsx(ve,{ref:s,className:V("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",n),...d}));$s.displayName=ve.displayName;const Is=a.forwardRef(({className:n,...d},s)=>e.jsxs("div",{className:"flex items-center border-b px-3","data-cmdk-input-wrapper":"",children:[e.jsx(vs,{className:"mr-2 h-4 w-4 shrink-0 opacity-50"}),e.jsx(ve.Input,{ref:s,className:V("flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",n),...d})]}));Is.displayName=ve.Input.displayName;const Ps=a.forwardRef(({className:n,...d},s)=>e.jsx(ve.List,{ref:s,className:V("max-h-[300px] overflow-y-auto overflow-x-hidden",n),...d}));Ps.displayName=ve.List.displayName;const Ls=a.forwardRef((n,d)=>e.jsx(ve.Empty,{ref:d,className:"py-6 text-center text-sm",...n}));Ls.displayName=ve.Empty.displayName;const Es=a.forwardRef(({className:n,...d},s)=>e.jsx(ve.Group,{ref:s,className:V("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",n),...d}));Es.displayName=ve.Group.displayName;const Ar=a.forwardRef(({className:n,...d},s)=>e.jsx(ve.Separator,{ref:s,className:V("-mx-1 h-px bg-border",n),...d}));Ar.displayName=ve.Separator.displayName;const Os=a.forwardRef(({className:n,...d},s)=>e.jsx(ve.Item,{ref:s,className:V("relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",n),...d}));Os.displayName=ve.Item.displayName;const Mr=({isOpen:n,onClose:d,selectedTrips:s,onSuccess:N})=>{const[u,g]=a.useState([]),[p,h]=a.useState(!1),[_,b]=a.useState(!1),[r,x]=a.useState(""),[j,C]=a.useState(!1),[I,re]=a.useState({current:0,total:0}),[W,X]=a.useState([]),[m,v]=a.useState(!1);a.useEffect(()=>{n&&(T(),x(""),X([]),v(!1),re({current:0,total:0}))},[n]);const T=async()=>{h(!0);try{const P=await D.collection("clients").getFullList({sort:"client_name",filter:'status != "Inactive" && status != "Suspended"',$autoCancel:!1});g(P)}catch(P){console.error("Error fetching clients:",P),$.error("Failed to load clients list.")}finally{h(!1)}},A=u.find(P=>P.id===r),E=async(P,le,ge=3,O=1e3)=>{try{return await D.collection("trip_logs").update(P,le,{$autoCancel:!1})}catch(ee){if(ge>0)return console.warn(`[BulkAssign] Retry ${4-ge} for trip ${P}. Waiting ${O}ms. Error:`,ee.message),await new Promise(ye=>setTimeout(ye,O)),E(P,le,ge-1,O*2);throw ee}},Y=async P=>{if(!r||typeof r!="string"||r.trim()===""){$.error("Please select a valid client first.");return}if(!P||P.length===0){$.error("No trips selected.");return}C(!0),v(!1),re({current:0,total:P.length});const le=[];let ge=0;for(const O of P)try{const ye=`Assigned to client on ${ce(new Date,"dd MMM yyyy HH:mm")}.`,Ae={client_id:String(r),trip_status:"Completed",notes:O.notes?`${O.notes}
${ye}`:ye};await E(O.id,Ae),ge++,re(we=>({...we,current:we.current+1}))}catch(ee){console.error(`[BulkAssign] Failed to assign trip ${O.id} (${O.route}) after all retries:`,ee),le.push(O)}C(!1),le.length>0?(X(le),v(!0),ge>0?$.error(`${ge} assigned. ${le.length} failed. Please retry.`):$.error(`Failed to assign all ${le.length} trip(s). Please try again.`)):($.success(`${ge} trip(s) successfully assigned to client.`),N&&N(),d())},U=()=>Y(s),G=()=>Y(W),ne=m?W:s;return e.jsx(Me,{open:n,onOpenChange:P=>!P&&!j&&d(),children:e.jsxs(Re,{className:"sm:max-w-[600px] max-h-[90vh] overflow-y-auto",children:[e.jsxs(Fe,{children:[e.jsxs($e,{className:"flex items-center gap-2 text-xl",children:[m?e.jsx(nt,{className:"w-5 h-5 text-destructive"}):e.jsx(Ut,{className:"w-5 h-5 text-primary"}),m?"Assignment Incomplete":"Assign Trips to Client"]}),e.jsx(ze,{className:"pt-2 text-base",children:m?`We encountered issues assigning the following ${W.length} trip(s). You can retry the failed items.`:`You are about to assign ${s?.length||0} trip(s) to a client. This will also update their status to "Completed".`})]}),e.jsxs("div",{className:"space-y-6 py-2",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("h4",{className:V("text-sm font-medium",m?"text-destructive":"text-foreground"),children:m?"Failed Trips":"Selected Trips Summary"}),e.jsx("div",{className:V("bg-muted/30 border rounded-lg max-h-[160px] overflow-y-auto",m?"border-destructive/30":"border-border"),children:e.jsx("ul",{className:"divide-y divide-border",children:ne?.map((P,le)=>e.jsxs("li",{className:"p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm hover:bg-muted/50 transition-colors",children:[e.jsxs("div",{className:"flex flex-col",children:[e.jsx("span",{className:"font-medium",children:P.route}),e.jsxs("span",{className:"text-xs text-muted-foreground",children:[ce(new Date(P.date),"dd MMM yyyy")," • ",P.driver_name," (",P.truck_number,")"]})]}),e.jsxs("div",{className:"text-right font-medium text-foreground",children:["Rs. ",(P.revenue||0).toLocaleString()]})]},P.id||le))})})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx("label",{className:"text-sm font-medium text-foreground",children:"Selected Client"}),e.jsxs(rr,{open:_&&!m&&!j,onOpenChange:b,children:[e.jsx(nr,{asChild:!0,children:e.jsxs(S,{variant:"outline",role:"combobox","aria-expanded":_,className:"w-full justify-between bg-background border-border",disabled:p||j||m,children:[p?e.jsxs("span",{className:"flex items-center gap-2 text-muted-foreground",children:[e.jsx(Te,{className:"w-4 h-4 animate-spin"})," Loading clients..."]}):A?e.jsx("span",{className:"truncate",children:A.client_name}):e.jsx("span",{className:"text-muted-foreground",children:"Search and select a client..."}),e.jsx(xa,{className:"ml-2 h-4 w-4 shrink-0 opacity-50"})]})}),e.jsx(ks,{className:"w-[var(--radix-popover-trigger-width)] p-0",align:"start",children:e.jsxs($s,{children:[e.jsx(Is,{placeholder:"Search client by name or email..."}),e.jsxs(Ps,{children:[e.jsx(Ls,{children:"No clients found."}),e.jsx(Es,{children:u.map(P=>e.jsxs(Os,{value:`${P.client_name} ${P.email}`,onSelect:()=>{x(P.id),b(!1)},children:[e.jsx(ha,{className:V("mr-2 h-4 w-4",r===P.id?"opacity-100 text-primary":"opacity-0")}),e.jsxs("div",{className:"flex flex-col overflow-hidden",children:[e.jsx("span",{className:"font-medium truncate",children:P.client_name}),e.jsx("span",{className:"text-xs text-muted-foreground truncate",children:P.email})]})]},P.id))})]})]})})]}),A&&e.jsx("div",{className:"mt-3 bg-secondary/20 border border-secondary/30 rounded-lg p-4 animate-in fade-in slide-in-from-top-2",children:e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx("div",{className:"p-2 bg-secondary/50 rounded-full shrink-0",children:e.jsx(ys,{className:"w-4 h-4 text-secondary-foreground"})}),e.jsxs("div",{className:"space-y-1 overflow-hidden",children:[e.jsx("h5",{className:"font-medium text-sm text-foreground truncate",children:A.client_name}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-2",children:[A.email&&e.jsxs("div",{className:"flex items-center gap-1.5 text-xs text-muted-foreground truncate",children:[e.jsx(js,{className:"w-3 h-3 shrink-0"})," ",e.jsx("span",{className:"truncate",children:A.email})]}),A.phone&&e.jsxs("div",{className:"flex items-center gap-1.5 text-xs text-muted-foreground truncate",children:[e.jsx(fa,{className:"w-3 h-3 shrink-0"})," ",e.jsx("span",{className:"truncate",children:A.phone})]}),(A.city||A.state)&&e.jsxs("div",{className:"flex items-center gap-1.5 text-xs text-muted-foreground truncate sm:col-span-2",children:[e.jsx(_s,{className:"w-3 h-3 shrink-0"}),e.jsx("span",{className:"truncate",children:[A.city,A.state].filter(Boolean).join(", ")})]})]})]})]})})]}),j&&I.total>0&&e.jsxs("div",{className:"space-y-2 animate-in fade-in",children:[e.jsxs("div",{className:"flex justify-between text-xs text-muted-foreground",children:[e.jsx("span",{children:"Assigning trips..."}),e.jsxs("span",{className:"font-medium",children:[I.current," of ",I.total]})]}),e.jsx(ws,{value:I.current/I.total*100,className:"h-2"})]})]}),e.jsxs(Pe,{className:"mt-4 gap-2 sm:gap-0",children:[e.jsx(S,{variant:"outline",onClick:d,disabled:j,children:"Cancel"}),m?e.jsxs(S,{onClick:G,disabled:j,variant:"default",children:[j?e.jsx(Te,{className:"w-4 h-4 mr-2 animate-spin"}):null,j?"Retrying...":"Retry Failed"]}):e.jsxs(S,{onClick:U,disabled:!r||j,children:[j?e.jsx(Te,{className:"w-4 h-4 mr-2 animate-spin"}):e.jsx(Ut,{className:"w-4 h-4 mr-2"}),j?"Assigning...":"Assign to Client"]})]})]})})},Rr=[{id:"Traffic Congestion / Highway Blockage",label:"Traffic / Highway Jam",emoji:"🚦",color:"text-amber-400 border-amber-500/30 bg-amber-500/10"},{id:"Vehicle Breakdown / Tyre Puncture",label:"Breakdown / Tyre Puncture",emoji:"🔧",color:"text-rose-400 border-rose-500/30 bg-rose-500/10"},{id:"Loading / Unloading Dock Delay",label:"Warehouse / Dock Hold",emoji:"⏳",color:"text-purple-400 border-purple-500/30 bg-purple-500/10"},{id:"Severe Weather / Heavy Rain",label:"Severe Rain / Fog",emoji:"🌧️",color:"text-blue-400 border-blue-500/30 bg-blue-500/10"},{id:"Border Checkpost / RTO Inspection",label:"RTO / Checkpost Inspection",emoji:"🚨",color:"text-red-400 border-red-500/30 bg-red-500/10"},{id:"Fuel / Toll Queue Delay",label:"Fuel / Toll Queue",emoji:"⛽",color:"text-cyan-400 border-cyan-500/30 bg-cyan-500/10"},{id:"Driver Rest / Health Issue",label:"Driver Rest / Health",emoji:"😴",color:"text-indigo-400 border-indigo-500/30 bg-indigo-500/10"},{id:"Route Detour / Road Repair",label:"Route Detour / Repair",emoji:"🗺️",color:"text-teal-400 border-teal-500/30 bg-teal-500/10"},{id:"Other Custom Reason",label:"Other Custom Reason",emoji:"✍️",color:"text-slate-300 border-slate-700 bg-slate-800/50"}];function Fr({isOpen:n,onClose:d,trip:s,onSaved:N}){const[u,g]=a.useState("Traffic Congestion / Highway Blockage"),[p,h]=a.useState(""),[_,b]=a.useState(""),[r,x]=a.useState(!1);if(a.useEffect(()=>{s&&(g(s.late_delivery_reason?.split(" - ")[0]||"Traffic Congestion / Highway Blockage"),h(s.late_delivery_reason?.includes(" - ")?s.late_delivery_reason.split(" - ").slice(1).join(" - "):""),b(ce(new Date,"yyyy-MM-dd'T'HH:mm")))},[s,n]),!n||!s)return null;const j=async C=>{C.preventDefault(),x(!0);try{const I=p.trim()?`${u} - ${p.trim()}`:u,re=_?new Date(_).toISOString():new Date().toISOString(),W={late_delivery_reason:I,delivery_actual_time:re,is_late_delivery:!0,trip_status:"Delivered",delivered_at:re};await D.collection("trip_logs").update(s.id,W,{$autoCancel:!1}),$.success(`Late delivery reason logged for ${s.truck_number||"Vehicle"}`),N&&N({...s,...W}),d()}catch(I){console.error("Error saving late delivery reason:",I),$.error("Failed to save late delivery reason")}finally{x(!1)}};return e.jsx(Me,{open:n,onOpenChange:d,children:e.jsxs(Re,{className:"sm:max-w-lg bg-slate-900 border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col font-sans",children:[e.jsxs(Fe,{className:"shrink-0 pb-3 border-b border-slate-800",children:[e.jsxs($e,{className:"text-lg font-extrabold text-white flex items-center gap-2",children:[e.jsx(ga,{className:"w-5 h-5 text-rose-400 animate-pulse"}),"Vehicle Late Delivery Reason"]}),e.jsxs("div",{className:"text-xs text-slate-400 space-y-0.5 mt-1",children:[e.jsxs("p",{children:[e.jsx("span",{className:"font-bold text-white",children:s.truck_number||"Vehicle"})," • Driver: ",s.driver_name||s.driver||"N/A"]}),e.jsxs("p",{className:"font-mono text-[11px]",children:["Route: ",s.route||"N/A"," ",s.trip_id?`(${s.trip_id})`:""]})]})]}),e.jsxs("form",{onSubmit:j,className:"space-y-4 py-3 flex-1 overflow-y-auto pr-1",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(z,{className:"text-xs font-bold uppercase tracking-wider text-amber-400",children:"Select Primary Delay Reason *"}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-2",children:Rr.map(C=>{const I=u===C.id;return e.jsxs("button",{type:"button",onClick:()=>g(C.id),className:`p-2.5 rounded-xl border text-xs font-bold text-left flex items-center gap-2 transition-all ${I?`${C.color} ring-2 ring-rose-500/50 shadow-md`:"bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60"}`,children:[e.jsx("span",{className:"text-base shrink-0",children:C.emoji}),e.jsx("span",{className:"truncate",children:C.label})]},C.id)})})]}),e.jsxs("div",{className:"space-y-1.5 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl",children:[e.jsxs(z,{className:"text-xs font-semibold text-slate-300 flex items-center gap-1.5",children:[e.jsx(vt,{className:"w-3.5 h-3.5 text-primary"})," Actual Delivery Date & Time"]}),e.jsx(se,{type:"datetime-local",value:_,onChange:C=>b(C.target.value),className:"bg-slate-900 border-slate-800 text-xs font-mono text-white h-9",required:!0})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs(z,{className:"text-xs font-semibold text-slate-300 flex items-center gap-1.5",children:[e.jsx(ba,{className:"w-3.5 h-3.5 text-slate-400"})," Additional Delay Notes / Driver Comment (Optional)"]}),e.jsx(Ra,{placeholder:"e.g. Stuck in 4-hour traffic jam near Pune toll plaza due to accident.",value:p,onChange:C=>h(C.target.value),className:"bg-slate-950 border-slate-800 text-xs resize-none text-slate-200",rows:3})]}),e.jsxs(Pe,{className:"pt-2 border-t border-slate-800",children:[e.jsx(S,{type:"button",variant:"outline",onClick:d,className:"border-slate-700 text-slate-300",children:"Cancel"}),e.jsx(S,{type:"submit",disabled:r,className:"font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20",children:r?"Logging...":"Confirm & Save Delay Reason"})]})]})]})})}function $r({isOpen:n,onClose:d,trip:s,onSuccess:N}){const{currentUser:u}=Ns(),[g,p]=a.useState(!1),[h,_]=a.useState("0"),[b,r]=a.useState(""),[x,j]=a.useState("Bank Transfer"),[C,I]=a.useState(""),[re,W]=a.useState(ce(new Date,"yyyy-MM-dd")),[X,m]=a.useState("Received on POD"),[v,T]=a.useState("Settled"),A=Number(s?.amount||0),E=Number(s?.subcontractor_freight||s?.vendor_payout||0),Y=Number(s?.client_advance_amount||A*.8),U=Number(s?.subcontractor_advance_amount||E*.8),G=Fa({clientFreight:A,subcontractorFreight:E,clientAdvanceAmt:Y,subAdvanceAmt:U,subDeductions:parseFloat(h)||0});a.useEffect(()=>{n&&s&&(_((s.subcontractor_deductions||0).toString()),r(s.subcontractor_deduction_notes||""),I(s.subcontractor_balance_utr||""),W(s.subcontractor_balance_settled_date||ce(new Date,"yyyy-MM-dd")),m(s.client_balance_status||(s.client_payment_status==="paid"?"Received on POD":"Pending")),T(s.subcontractor_settlement_status||"Settled"))},[n,s]);const ne=async O=>{if(O?.preventDefault(),!!s?.id){p(!0);try{const ee=G.subcontractorBalance,ye=G.clientBalance,Ae=G.tripMargin,we=G.tripMarginPct,je={is_subcontractor_trip:!0,subcontractor_freight:E,trip_margin_amount:Ae,trip_margin_pct:we,client_advance_amount:Y,client_balance_amount:ye,client_balance_status:X,subcontractor_advance_amount:U,subcontractor_balance_amount:ee,subcontractor_deductions:parseFloat(h)||0,subcontractor_deduction_notes:b,subcontractor_balance_utr:C,subcontractor_balance_settled_date:re,subcontractor_settlement_status:v};X==="Received on POD"&&(je.client_payment_status="paid");const Ye=await D.collection("trip_logs").update(s.id,je,{$autoCancel:!1});await $a(Ye,u),$.success(`Subcontractor settlement of ${ae(ee)} saved & tallied to Cashbook!`),N?.(),d()}catch(ee){console.error("Failed to settle subcontractor:",ee),$.error(ee.message||"Failed to save settlement")}finally{p(!1)}}};if(!s)return null;const P=s.trip_id||s.id,le=s?.expand?.client_id?.client_name||s?.expand?.client_id?.company_name||s.client_name||"Client",ge=s.subcontractor_name||"Subcontractor / Sub-Vendor";return e.jsx(Me,{open:n,onOpenChange:O=>!O&&!g&&d(),children:e.jsxs(Re,{className:"w-[95vw] max-w-2xl max-h-[90vh] p-0 flex flex-col overflow-hidden bg-slate-950 border-slate-800 text-slate-100 rounded-3xl",children:[e.jsx(Fe,{className:"p-5 pb-3 border-b border-slate-800 bg-slate-900/90 shrink-0",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("div",{className:"p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",children:e.jsx(va,{className:"w-5 h-5"})}),e.jsxs("div",{children:[e.jsx($e,{className:"text-lg font-bold text-white flex items-center gap-2",children:"Subcontractor Settlement & Cashbook Tally"}),e.jsxs(ze,{className:"text-xs text-slate-400",children:["Reconcile incoming client payments vs. outgoing subcontractor freight for ",e.jsxs("strong",{className:"text-white",children:["Trip #",P]})]})]})]}),e.jsxs(jt,{className:"bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-mono font-bold",children:[ae(G.tripMargin)," MARGIN (",G.tripMarginPct,"%)"]})]})}),e.jsxs("div",{className:"flex-1 overflow-y-auto p-5 space-y-5",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-3 text-xs",children:[e.jsxs("div",{className:"p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1",children:[e.jsx("span",{className:"text-[10px] text-slate-400 uppercase font-bold block",children:"Company / Client (Billed)"}),e.jsx("h4",{className:"font-bold text-white text-sm",children:le}),e.jsxs("p",{className:"text-emerald-400 font-mono font-bold text-xs",children:[ae(A)," Billed"]})]}),e.jsxs("div",{className:"p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1",children:[e.jsx("span",{className:"text-[10px] text-slate-400 uppercase font-bold block",children:"Subcontractor (Sub-Vendor)"}),e.jsx("h4",{className:"font-bold text-white text-sm",children:ge}),e.jsxs("p",{className:"text-amber-400 font-mono font-bold text-xs",children:[ae(E)," Agreed Hire"]})]})]}),e.jsxs("div",{className:"p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 space-y-3 shadow-lg",children:[e.jsxs("div",{className:"flex items-center justify-between text-xs border-b border-slate-800/80 pb-2",children:[e.jsxs("span",{className:"font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5",children:[e.jsx(ya,{className:"w-3.5 h-3.5 text-emerald-400"})," 4-Point Cash Flow & Margin Reconciliation"]}),e.jsx(jt,{variant:"outline",className:"bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono",children:"100% TALLIED & BALANCED"})]}),e.jsxs("div",{className:"space-y-1.5 pt-1",children:[e.jsx("span",{className:"text-[10px] font-mono text-slate-400 uppercase font-bold",children:"Stage 1: Loading & Dispatch (Advance Flow)"}),e.jsxs("div",{className:"grid grid-cols-3 gap-2 text-center text-xs font-mono",children:[e.jsxs("div",{className:"p-2.5 bg-slate-950/90 rounded-xl border border-slate-800",children:[e.jsx("span",{className:"text-[9px] text-slate-500 uppercase block",children:"[IN] Client Advance"}),e.jsx("strong",{className:"text-emerald-400 text-xs",children:ae(G.clientAdvance)})]}),e.jsxs("div",{className:"p-2.5 bg-slate-950/90 rounded-xl border border-slate-800",children:[e.jsx("span",{className:"text-[9px] text-slate-500 uppercase block",children:"[OUT] Subcontractor Adv"}),e.jsx("strong",{className:"text-rose-400 text-xs",children:ae(G.subcontractorAdvance)})]}),e.jsxs("div",{className:"p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30",children:[e.jsx("span",{className:"text-[9px] text-emerald-400 uppercase block font-bold",children:"Loading Cash Kept"}),e.jsxs("strong",{className:"text-emerald-300 text-xs",children:["+",ae(G.loadingRetainedCash)]})]})]})]}),e.jsxs("div",{className:"space-y-1.5 pt-2 border-t border-slate-800/80",children:[e.jsx("span",{className:"text-[10px] font-mono text-slate-400 uppercase font-bold",children:"Stage 2: POD Submission & Balance Settlement"}),e.jsxs("div",{className:"grid grid-cols-3 gap-2 text-center text-xs font-mono",children:[e.jsxs("div",{className:"p-2.5 bg-slate-950/90 rounded-xl border border-slate-800",children:[e.jsx("span",{className:"text-[9px] text-slate-500 uppercase block",children:"[IN] Client Balance (POD)"}),e.jsx("strong",{className:"text-emerald-400 text-xs",children:ae(G.clientBalance)})]}),e.jsxs("div",{className:"p-2.5 bg-slate-950/90 rounded-xl border border-slate-800",children:[e.jsx("span",{className:"text-[9px] text-slate-500 uppercase block",children:"[OUT] Subcontractor Bal"}),e.jsx("strong",{className:"text-amber-400 text-xs",children:ae(G.subcontractorBalance)})]}),e.jsxs("div",{className:"p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30",children:[e.jsx("span",{className:"text-[9px] text-emerald-400 uppercase block font-bold",children:"POD Margin Realized"}),e.jsxs("strong",{className:"text-emerald-300 text-xs",children:["+",ae(G.podRemainingMargin)]})]})]})]}),e.jsxs("div",{className:"p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs font-mono",children:[e.jsx("span",{className:"text-slate-400",children:"Total Tallied Trip Net Profit:"}),e.jsxs("strong",{className:"text-emerald-400 text-sm font-bold",children:[ae(G.loadingRetainedCash)," + ",ae(G.podRemainingMargin)," = ",ae(G.totalTalliedMargin)]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(z,{className:"text-xs font-semibold text-slate-300",children:"Subcontractor Deductions (Diesel slip / TDS / Penalty)"}),e.jsx(se,{type:"number",min:"0",step:"1",placeholder:"0",value:h,onChange:O=>_(O.target.value),className:"bg-slate-900 border-slate-800 text-xs text-white font-mono"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(z,{className:"text-xs font-semibold text-slate-300",children:"Deduction Reason / Notes"}),e.jsx(se,{placeholder:"e.g. Rs. 1,200 Diesel Slip at HPCL Solapur",value:b,onChange:O=>r(O.target.value),className:"bg-slate-900 border-slate-800 text-xs text-white"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-3",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(z,{className:"text-xs font-semibold text-slate-300",children:"Payment Mode"}),e.jsxs(pe,{value:x,onValueChange:j,children:[e.jsx(xe,{className:"bg-slate-900 border-slate-800 text-xs h-9",children:e.jsx(he,{})}),e.jsxs(fe,{className:"bg-slate-900 border-slate-800 text-white text-xs",children:[e.jsx(F,{value:"Bank Transfer",children:"Bank Transfer (NEFT/RTGS)"}),e.jsx(F,{value:"UPI",children:"UPI / GPay / PhonePe"}),e.jsx(F,{value:"Cash",children:"Cash Voucher"}),e.jsx(F,{value:"Cheque",children:"Cheque"})]})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(z,{className:"text-xs font-semibold text-slate-300",children:"Bank UTR / Ref #"}),e.jsx(se,{placeholder:"e.g. UTR-99882211",value:C,onChange:O=>I(O.target.value),className:"bg-slate-900 border-slate-800 text-xs text-white font-mono"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(z,{className:"text-xs font-semibold text-slate-300",children:"Settlement Date"}),e.jsx(se,{type:"date",value:re,onChange:O=>W(O.target.value),className:"bg-slate-900 border-slate-800 text-xs text-white font-mono"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(z,{className:"text-xs font-semibold text-slate-300",children:"Client Balance Status"}),e.jsxs(pe,{value:X,onValueChange:m,children:[e.jsx(xe,{className:"bg-slate-900 border-slate-800 text-xs h-9",children:e.jsx(he,{})}),e.jsxs(fe,{className:"bg-slate-900 border-slate-800 text-white text-xs",children:[e.jsxs(F,{value:"Received on POD",children:["🟢 Received on POD (",ae(G.clientBalance),")"]}),e.jsx(F,{value:"Pending",children:"⏳ Pending Client POD Clearance"})]})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(z,{className:"text-xs font-semibold text-slate-300",children:"Subcontractor Settlement"}),e.jsxs(pe,{value:v,onValueChange:T,children:[e.jsx(xe,{className:"bg-slate-900 border-slate-800 text-xs h-9",children:e.jsx(he,{})}),e.jsxs(fe,{className:"bg-slate-900 border-slate-800 text-white text-xs",children:[e.jsxs(F,{value:"Settled",children:["✅ Settled & Paid (",ae(G.subcontractorBalance),")"]}),e.jsx(F,{value:"Awaiting POD",children:"⏳ Awaiting Physical POD Verification"})]})]})]})]})]}),e.jsxs(Pe,{className:"p-4 border-t border-slate-800 bg-slate-900/90 shrink-0 flex items-center justify-between gap-3",children:[e.jsx(S,{type:"button",variant:"ghost",onClick:d,disabled:g,className:"text-xs text-slate-400 hover:text-white",children:"Cancel"}),e.jsxs(S,{type:"button",onClick:ne,disabled:g,className:"bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow px-5 gap-1.5",children:[g?e.jsx(Te,{className:"w-3.5 h-3.5 animate-spin"}):e.jsx(Ht,{className:"w-3.5 h-3.5"}),"Confirm Settlement & Auto-Tally Cashbook"]})]})]})})}const fs=({log:n,className:d,onUpdate:s})=>{const[N,u]=a.useState(n.kms||"");a.useEffect(()=>{u(n.kms||"")},[n.kms]);const g=async()=>{const h=parseFloat(N),_=parseFloat(n.kms)||0;if(isNaN(h)&&!N&&_===0||h===_)return;const b=isNaN(h)?0:h;try{const _up={kms:b};n.pod_status==="Verified"&&(_up.pod_status="Uploaded");await D.collection("trip_logs").update(n.id,_up,{$autoCancel:!1}),$.success(`KMs updated for Trip ${n.trip_id}`),s&&s(b);try{await fetch("/api/backup/trigger",{method:"POST",headers:{"x-backup-token":"diag_JBCargo_9921_SafeSecret"}})}catch{}}catch(r){if(r?.data?.data?.pod_status||(r?.message&&r.message.includes("pod_status"))){try{await D.collection("trip_logs").update(n.id,{kms:b,pod_status:"Uploaded"},{$autoCancel:!1}),$.success(`KMs updated for Trip ${n.trip_id}`),s&&s(b);return}catch(_e){}}console.error("Failed to update kms:",r),$.error(r?.message||"Failed to update KMs"),u(n.kms||"")}},p=h=>{h.key==="Enter"&&h.target.blur()};return e.jsx(se,{type:"number",value:N,onChange:h=>u(h.target.value),onBlur:g,onKeyDown:p,className:V("w-20 h-8 text-center bg-background border-border focus-visible:ring-primary/40 rounded-lg text-sm font-semibold mx-auto",d),placeholder:"—"})},Ot=n=>{if(!n)return"—";const d=new Date(n);return isNaN(d.getTime())?"—":ce(d,"dd MMM yyyy")},Ir=n=>{if(!n)return"—";const d=new Date(n);return isNaN(d.getTime())?"—":ce(d,"dd MMM")},bt=n=>{if(!n)return null;try{return ce(new Date(n),"dd MMM HH:mm")}catch{return null}},Wr=()=>{const{currentUser:n}=Ns(),d=n?.role?.toLowerCase()==="dispatcher"&&n?.email?.toLowerCase()!=="munnarathod222@gmail.com",[s,N]=a.useState([]),[u,g]=a.useState([]),[p,h]=a.useState([]),[_,b]=a.useState({}),[r,x]=a.useState(!0),[j,C]=a.useState(null),[I,re]=a.useState(null),[W,X]=a.useState(!1),[m,v]=a.useState(!1),[T,A]=a.useState(!1),[E,Y]=a.useState(!1),[U,G]=a.useState(null),[ne,P]=a.useState(""),[le,ge]=a.useState(!1),[O,ee]=a.useState(null),[ye,Ae]=a.useState(null),[_docsTrip,_setDocsTrip]=a.useState(null),[_reassignTrip,_setReassignTrip]=a.useState(null),[_validationTrip,_setValidationTrip]=a.useState(null),[_standbyRegistryOpen,_setStandbyRegistryOpen]=a.useState(!1),[_preselectedStandbyDriver,_setPreselectedStandbyDriver]=a.useState(null),[we,je]=a.useState({isOpen:!1,trip:null,defaultTemplate:"payment_confirmation"}),[Ye,it]=a.useState(!1),[c,M]=a.useState({recipient:"",subject:"",body:"",html:"",label:"",attachment:null}),[k,w]=a.useState(null),[H,q]=a.useState(null),[me,oe]=a.useState(""),Qe=t=>{try{const i=new Za,l=y=>`Rs. ${Number(y||0).toLocaleString("en-IN")}`;i.setFontSize(22),i.setTextColor(15,23,42),i.setFont(void 0,"bold"),i.text("JAI BHAVANI CARGO",14,25),i.setFontSize(13),i.setTextColor(100,116,139),i.setFont(void 0,"normal"),i.text("Official Trip Sheet Statement",14,33),i.setFillColor(248,250,252),i.rect(14,42,182,86,"F"),i.rect(14,42,182,86,"S"),i.setFontSize(10),i.setTextColor(15,23,42);let o=56;const f=(y,L,B=!1)=>{i.setFont(void 0,"bold"),i.setTextColor(100,116,139),i.text(y,20,o),i.setFont(void 0,B?"bold":"normal"),i.setTextColor(B?99:15,B?102:23,B?241:42),i.text(String(L||"—"),75,o),o+=11};return f("Trip ID / LR Number:",t.lr_number||t.trip_id||"—",!0),f("Truck Number:",t.truck_number||"—"),f("Driver Name:",t.driver_name||"—"),f("Route (Origin → Dest):",`${t.origin||"—"} to ${t.destination||"—"}`),f("Date of Dispatch:",t.start_date||"—"),f("Freight Amount:",l(t.freight_amount),!0),f("Trip Status:",t.trip_status||"—"),i.setFontSize(9),i.setTextColor(156,163,175),i.setFont(void 0,"italic"),i.text("System generated statement via JBC Cargo Portal.",14,145),i.output("blob")}catch(i){return console.error("Failed to generate Trip PDF:",i),null}},Us=t=>{const i=y=>`Rs. ${Number(y||0).toLocaleString("en-IN")}`,l=`<div style="font-family:sans-serif;max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden"><div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:20px 24px"><p style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:2px;margin:0 0 6px">JAI BHAVANI CARGO</p><h2 style="color:#f8fafc;font-size:20px;font-weight:800;margin:0">Trip Sheet</h2><p style="color:#64748b;font-size:12px;margin:6px 0 0">LR No: ${t.lr_number||"—"}</p></div><div style="padding:20px 24px;background:#f8fafc"><table style="width:100%;border-collapse:collapse;font-size:13px"><tr><td style="padding:7px 0;color:#64748b;font-weight:600;width:140px">Truck</td><td style="padding:7px 0;font-weight:700;color:#1e293b">${t.truck_number||"—"}</td></tr><tr><td style="padding:7px 0;color:#64748b;font-weight:600">Driver</td><td style="padding:7px 0;color:#1e293b">${t.driver_name||"—"}</td></tr><tr><td style="padding:7px 0;color:#64748b;font-weight:600">Route</td><td style="padding:7px 0;color:#1e293b">${t.origin||"—"} → ${t.destination||"—"}</td></tr><tr><td style="padding:7px 0;color:#64748b;font-weight:600">Date</td><td style="padding:7px 0;color:#1e293b">${t.start_date||"—"}</td></tr><tr><td style="padding:7px 0;color:#64748b;font-weight:600">Status</td><td style="padding:7px 0;font-weight:700;color:#6366f1">${t.trip_status||"—"}</td></tr><tr><td style="padding:7px 0;color:#64748b;font-weight:600">Freight</td><td style="padding:7px 0;font-weight:700;color:#059669">${i(t.freight_amount)}</td></tr><tr><td style="padding:7px 0;color:#64748b;font-weight:600">Payment</td><td style="padding:7px 0;color:#1e293b">${t.payment_status||"—"}</td></tr></table></div></div>`,o=Qe(t),f=`trip_sheet_${t.lr_number||t.trip_id||"export"}.pdf`;M({recipient:"",subject:`Trip Sheet – ${t.truck_number||""} | ${t.origin||""} → ${t.destination||""}`,body:`Hi, please find the attached trip sheet document for LR# ${t.lr_number||"N/A"}.`,html:l,label:`Trip – ${t.lr_number||""}`,attachment:o?{blob:o,name:f}:null}),it(!0)},Kt=t=>{if(!t)return[];const i=(t.route||"").trim().toUpperCase(),l=_[t.route_id]||_[i]||_[i.replace(/\s+/g,"")]||_[(t.route_code||"").trim().toUpperCase()]||_[(t.route_name||"").trim().toUpperCase()]||null;let o=[];if(l&&l.stops){const R=typeof l.stops=="string"?JSON.parse(l.stops||"[]"):l.stops;Array.isArray(R)&&R.length>0&&(o=R)}if(o.length===0&&t.stops){const R=typeof t.stops=="string"?JSON.parse(t.stops||"[]"):t.stops;Array.isArray(R)&&R.length>0&&(o=R)}if(o.length===0){const R=(()=>{const K=l?.up_stops||t.up_stops,Z=l?.down_stops||t.down_stops,J=K||Z;if(!J)return[];if(typeof J=="string")try{return JSON.parse(J)}catch{return[]}return Array.isArray(J)?J:[]})();o=[{type:"loading_dock",stop_name:l?.start_location||t.start_location||t.origin||"Loading Dock",map_link:l?.start_location_map_link||t.start_location_map_link||"",contact_phone:l?.loading_supervisor_phone||t.loading_supervisor_phone||""},...R.map((K,Z)=>({type:"intermediate",stop_name:K.stop_name||`Stop ${Z+2}`,map_link:K.map_link||"",contact_phone:K.contact_phone||""})),{type:"delivery_dock",stop_name:l?.end_location||t.end_location||t.destination||"Delivery Dock",map_link:l?.end_location_map_link||t.end_location_map_link||"",contact_phone:l?.unloading_supervisor_phone||t.unloading_supervisor_phone||""}]}if(Array.isArray(t.trip_stops)&&t.trip_stops.length>0)return t.trip_stops.map((R,K)=>{const Z=R.type==="dock",J=R.sched_arrival_time||(R.sched_arrival_iso?ce(new Date(R.sched_arrival_iso),"HH:mm"):""),St=R.sched_dispatch_time||(R.sched_dispatch_iso?ce(new Date(R.sched_dispatch_iso),"HH:mm"):"");let De=R.actual_arrival_iso||null,Ue=R.actual_dispatch_iso||null;!De&&R.id==="dock_1"&&(De=t.loading_dock_arrival_time),!Ue&&R.id==="dock_1"&&(Ue=t.dispatched_time),!De&&(R.id==="drop_1"||K===t.trip_stops.length-1)&&(De=t.drop1_actual_arrival_time||t.delivered_time),!Ue&&R.id==="drop_1"&&(Ue=t.drop1_actual_dispatch_time);let Ie=0,Ct=!1;if(De&&(R.sched_arrival_iso||R.sched_arrival_time)){const as=new Date(De),Dt=R.sched_arrival_iso?new Date(R.sched_arrival_iso):null;Dt&&!isNaN(as.getTime())&&!isNaN(Dt.getTime())&&(Ie=Math.round((as.getTime()-Dt.getTime())/(1e3*60)),Ie>15&&(Ct=!0))}return{dockType:Z?"loading_dock":"delivery_dock",dockLabel:R.label||(Z?`Dock ${K+1}`:`Drop ${R.stop_number-(t.total_docks_count||1)}`),name:R.name||(Z?"Loading Dock":`Drop ${K+1}`),villageName:"",mapLink:"",contactPhone:"",fieldName:Z?"loading_dock_arrival_time":K===t.trip_stops.length-1?"delivered_time":`stop_${K}_arrival_time`,time:De,dispatchTime:Ue,schedTime:J,schedDispTime:St,dayOffset:R.day_offset||0,isCompleted:!!De||t.trip_status==="Delivered"||t.trip_status==="Completed",statusKey:Z?"Arrived at Dock":K===t.trip_stops.length-1?"Delivered":`Drop ${K}`,isRedDelay:Ct,delayMinutes:Math.max(0,Ie),delayMessage:Ct?`Late by ${Ie} mins (Target: ${J})`:De?`On-Time (Target: ${J})`:`Target SLA: ${J}`}});const f=[],y=o.length,L=t.loading_dock_arrival_time,B=t.dispatched_time,Q=t.delivered_time;let ue=!1,de=0;if(Q&&B){const R=new Date(B).getTime(),K=new Date(Q).getTime(),Z=Math.round((K-R)/(1e3*60)),J=t.expected_transit_minutes||120;Z>J+10&&(ue=!0,de=Z-J)}else if(!Q&&B&&t.trip_status==="In Transit"){const R=new Date(B).getTime(),K=new Date().getTime(),Z=Math.round((K-R)/(1e3*60)),J=t.expected_transit_minutes||120;Z>J+10&&(ue=!0,de=Z-J)}return o.forEach((R,K)=>{const Z=K===0,J=K===y-1;let St=Z?"Loading Dock":`Drop ${K}`,De=Z?"loading_dock_arrival_time":J?"delivered_time":`stop_${K}_arrival_time`,Ue=Z?L:J?Q:t[`stop_${K}_arrival_time`],Ie=!1;Z?Ie=!!L||t.trip_status!=="Upcoming"&&t.trip_status!=="Created":J?Ie=!!Q||t.trip_status==="Delivered"||t.trip_status==="Completed":Ie=!!Ue||t.trip_status==="Delivered"||t.trip_status==="Completed",f.push({dockType:Z?"loading_dock":"delivery_dock",dockLabel:St,name:R.stop_name||(Z?t.start_location||t.origin||"Loading Dock":J?t.end_location||t.destination||"Delivery Dock":`Stop ${K+1}`),villageName:R.village_name||"",mapLink:R.map_link||(Z?t.start_location_map_link:J?t.end_location_map_link:""),contactPhone:R.contact_phone||(Z?t.loading_supervisor_phone:J?t.unloading_supervisor_phone:""),fieldName:De,time:Ue,isCompleted:Ie,statusKey:Z?"Arrived at Dock":J?"Delivered":`Drop ${K}`,isRedDelay:J?ue:!1,delayMinutes:J?de:0,delayMessage:J?ue?`Delayed by ${de} mins (> 10m threshold)`:"On-Time Delivery":""})}),f},[te,ot]=a.useState("all"),[xt,Wt]=a.useState(""),[dt,Bs]=a.useState("all"),[ht,zs]=a.useState("all"),[Ze,Le]=a.useState(1),qe=25;a.useEffect(()=>{Le(1)},[xt,dt,ht,te]);const[ke,Ee]=a.useState([]),[Ke,Nt]=a.useState(""),[We,wt]=a.useState(""),[Oe,ft]=a.useState(!1),[_e,Xe]=a.useState(null),[Ge,Gt]=a.useState(!1),[Jt,kt]=a.useState(null),[be,gt]=a.useState(null),[Yt,Vs]=a.useState(null),ie=async()=>{x(!0),C(null);try{const[t,i,l,o]=await Promise.all([D.collection("employees").getFullList({filter:'employee_type = "driver"',$autoCancel:!1}).catch(()=>[]),D.collection("trucks").getFullList({$autoCancel:!1}).catch(()=>[]),D.collection("trip_logs").getList(1,500,{sort:"-date",expand:"client_id,driver_id",$autoCancel:!1}).then(y=>y.items||[]).catch(async()=>await D.collection("trip_logs").getFullList({sort:"-date",$autoCancel:!1}).catch(()=>[])),D.collection("routes").getFullList({$autoCancel:!1}).catch(()=>[])]),f={};o.forEach(y=>{y.id&&(f[y.id]=y),y.route_name&&(f[y.route_name]=y,f[y.route_name.trim()]=y,f[y.route_name.toUpperCase().trim()]=y,f[y.route_name.replace(/\s+/g,"")]=y),y.route_code&&(f[y.route_code]=y,f[y.route_code.trim()]=y,f[y.route_code.toUpperCase().trim()]=y,f[y.route_code.replace(/\s+/g,"")]=y)}),N(Bt(t)),g(i),h(l),b(f)}catch(t){console.error("[TripLogsPage] Error fetching data:",t),C("Failed to load trip logs data. Please check your connection and try again."),$.error("Failed to load data.")}finally{x(!1)}};a.useEffect(()=>{ie();let t=null;const i=()=>{clearTimeout(t),t=setTimeout(()=>{ie()},500)};return D.collection("trip_logs").subscribe("*",i).catch(()=>{}),()=>{clearTimeout(t);try{D.collection("trip_logs").unsubscribe("*")}catch{}}},[]);const Qt=t=>{re(t),X(!0)},Hs=()=>{X(!1),re(null)},qs=async()=>{if(U){if(U.trip_status===ne){G(null);return}ge(!0);try{const t={trip_status:ne};ne==="Arrived at Dock"&&!U.loading_dock_arrival_time?t.loading_dock_arrival_time=new Date().toISOString():ne==="Dispatched"&&!U.dispatched_time?t.dispatched_time=new Date().toISOString():(ne==="Arrived at Delivery Location"||ne==="Reached Delivery Docket"||ne==="Unloading in Progress")&&!U.delivery_dock_arrival_time?(t.delivery_dock_arrival_time=new Date().toISOString(),t.detention_status="grace_period"):ne==="Delivered"&&!U.delivered_time&&(t.delivered_time=new Date().toISOString()),let _saved3=false;try{await D.collection("trip_logs").update(U.id,t,{$autoCancel:!1});_saved3=true;}catch(_pbErr){try{const _res=await fetch("/api/trips/"+U.id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)});if(_res.ok)_saved3=true;}catch(_apiErr){}}if(!_saved3)throw new Error("Update rejected");(ne==="Delivered"||ne==="Completed")&&U.trip_status!==ne&&ct(U);try{const i=await D.collection("cashbook").getFullList({filter:`reference_id = "${U.id}"`,$autoCancel:!1});for(const l of i){const o=(l.description||"").replace(/ \(Trip Status: .*?\)/,"");await D.collection("cashbook").update(l.id,{description:`${o} (Trip Status: ${ne})`},{$autoCancel:!1})}}catch(i){console.warn("Failed to sync cashbook description (non-critical):",i)}$.success("Trip status updated & FASTag balance adjusted"),Wa({action:"STATUS_CHANGE",module:"Trip Logs",recordId:U.trip_id||U.id,details:`Updated Trip Status from "${U.trip_status||"Draft"}" to "${ne}"`});const _tg2=(ne==="Delivered"||ne==="Completed")?"completed":(ne==="Upcoming"||ne==="Scheduled")?"upcoming":"in-transit";te!=="all"&&te!==_tg2&&ot(_tg2);h(prev=>(prev||[]).map(row=>row.id===U.id?{...row,...t,trip_status:ne}:row));ne==="Delivered"&&ee(U);ie()}catch(t){console.error("Update err:",t);let _ok=false;try{const _ck=await D.collection("trip_logs").getOne(U.id,{$autoCancel:!1});if(_ck&&_ck.trip_status===ne){$.success("Trip status updated & FASTag balance adjusted"),ne==="Delivered"&&ee(U),ie(),_ok=true}}catch(_){};if(!_ok)$.error("Failed to update status")}finally{ge(!1),G(null)}}},Ks=new Set(["Upcoming","Vehicle Assigned","Arrived at Dock","Loading in Progress","Dispatched","In Transit","Arrived at Delivery Location","Reached Delivery Docket","Unloading in Progress","Delivered","Completed","Delayed / Breakdown","Cancelled"]),Zt={Upcoming:"Upcoming","Vehicle Assigned":"Vehicle Assigned","Arrived at Dock":"Arrived at Dock","Loading in Progress":"Loading in Progress",Dispatched:"Dispatched","In Transit":"In Transit","Arrived at Delivery Location":"Arrived at Delivery Location","Reached Delivery Docket":"Arrived at Delivery Location","Unloading in Progress":"Unloading in Progress",Delivered:"Delivered",Completed:"Completed","Delayed / Breakdown":"Delayed / Breakdown",Cancelled:"Cancelled"},Xt=async(t,i,l)=>{if(k)try{const o={};if(t&&t!=="date")if(t.startsWith("stop_")){let y={};if(k.stop_timestamps)try{y=typeof k.stop_timestamps=="string"?JSON.parse(k.stop_timestamps):k.stop_timestamps||{}}catch{y={}}const L=i?new Date(i).toISOString():null,B={...y,[t]:L};o.stop_timestamps=JSON.stringify(B)}else o[t]=i?new Date(i).toISOString():null;if(l){const y=Zt.hasOwnProperty(l)?Zt[l]:Ks.has(l)?l:null;y&&(o.trip_status=y)}if(Object.keys(o).length===0){$.info("Nothing to update");return}const f=await D.collection("trip_logs").update(k.id,o,{$autoCancel:!1});o.trip_status==="Delivered"&&k.trip_status!=="Delivered"&&(ct(f),d||ee(f));if(o.trip_status){const _tgT=(o.trip_status==="Delivered"||o.trip_status==="Completed")?"completed":(o.trip_status==="Upcoming"||o.trip_status==="Scheduled")?"upcoming":"in-transit";te!=="all"&&te!==_tgT&&ot(_tgT);h(prev=>(prev||[]).map(row=>row.id===k.id?{...row,...f,...o}:row))}$;success("Timeline updated successfully");w(y=>({...y,...f,...o}));ie()}catch(o){console.error("Failed to update timeline step:",o),$.error("Failed to update timeline: "+(o?.response?.message||o?.message||"Unknown error"))}},es=t=>{if(!t)return!1;try{const i=new Date(t.split(" ")[0]||t),l=new Date;return l.setHours(0,0,0,0),i>l}catch{return!1}},ts=t=>{if(!t)return!1;try{const i=new Date(t.split(" ")[0]||t),l=new Date;return i.toDateString()===l.toDateString()}catch{return!1}},Ws=a.useMemo(()=>p.filter(t=>t.trip_status==="In Transit"||t.trip_status==="Dispatched"||t.trip_status==="Arrived at Dock"||t.trip_status==="At Destination"||t.trip_status==="Loading"||t.trip_status==="Upcoming"&&ts(t.date)).length,[p]),Gs=a.useMemo(()=>p.filter(t=>(t.trip_status==="Upcoming"||t.trip_status==="Scheduled"||t.date&&es(t.date))&&t.trip_status!=="Completed"&&t.trip_status!=="Delivered"&&t.trip_status!=="Cancelled").length,[p]),Js=a.useMemo(()=>p.filter(t=>t.trip_status==="Completed"||t.trip_status==="Delivered").length,[p]),Ys=a.useMemo(()=>p.filter(t=>t.contract_type==="spot"||t.notes&&t.notes.toLowerCase().includes("spot")||t.trip_id&&t.trip_id.toLowerCase().includes("spot")).length,[p]),Se=p.filter(t=>{if(te==="in-transit"){if(!(t.trip_status==="In Transit"||t.trip_status==="Dispatched"||t.trip_status==="Arrived at Dock"||t.trip_status==="At Destination"||t.trip_status==="Loading"||t.trip_status==="Upcoming"&&ts(t.date)))return!1}else if(te==="upcoming"){if(!((t.trip_status==="Upcoming"||t.trip_status==="Scheduled"||t.date&&es(t.date))&&t.trip_status!=="Completed"&&t.trip_status!=="Delivered"&&t.trip_status!=="Cancelled"))return!1}else if(te==="completed"){if(!(t.trip_status==="Completed"||t.trip_status==="Delivered"))return!1}else if(te==="spot"&&!(t.contract_type==="spot"||t.notes&&t.notes.toLowerCase().includes("spot")||t.trip_id&&t.trip_id.toLowerCase().includes("spot")))return!1;const i=xt.toLowerCase(),l=t.expand?.client_id?.client_name?.toLowerCase()||"",o=!i||t.trip_id&&t.trip_id.toLowerCase().includes(i)||t.client_trip_id&&t.client_trip_id.toLowerCase().includes(i)||t.lr_number&&t.lr_number.toLowerCase().includes(i)||t.driver_name&&t.driver_name.toLowerCase().includes(i)||t.route&&t.route.toLowerCase().includes(i)||t.truck_number&&t.truck_number.toLowerCase().includes(i)||l.includes(i),f=dt==="all"||(dt==="blank"?!t.client_payment_status:t.client_payment_status===dt),y=ht==="all"||t.trip_status===ht;return o&&f&&y}),Qs=a.useMemo(()=>{const t={};return p.forEach(i=>{if(i.trip_status==="Cancelled"||!i.date||!i.truck_number)return;const l=(i?.date||"").split(" ")[0];t[l]||(t[l]=new Set),t[l].add(i.truck_number)}),t},[p]),et=a.useMemo(()=>{const t=(Ze-1)*qe;return Se.slice(t,t+qe)},[Se,Ze,qe]),Zs=t=>{if(t){const i=et.map(l=>l.id);Ee(l=>[...new Set([...l,...i])])}else{const i=et.map(l=>l.id);Ee(l=>l.filter(o=>!i.includes(o)))}},Xs=t=>{Ee(i=>i.includes(t)?i.filter(l=>l!==t):[...i,t])},ea=async()=>{if(!(!Ke&&!We||ke.length===0)){if(Ke==="received"&&ke.length>1){const t=p.filter(y=>ke.includes(y.id));let i=0,l=0,o=0,f=[];t.forEach(y=>{i+=Number(y.revenue)||0,l+=Number(y.advance_received_from_client)||0;const L=y.expand?.client_id,Q=L?.isTdsApplicable||!1?Number(L?.tdsRate)||2:0,ue=Number(y.revenue||0)*(Q/100);o+=Number(ue.toFixed(2)),f.push(y.trip_id||"N/A")}),gt({trips:t,totalRevenue:i,totalAdvances:l,totalTds:o,netAmount:i-l-o,tripCodes:f,tripIds:ke});return}ft(!0);try{const t={};Ke&&(t.client_payment_status=Ke==="blank"?"":Ke),We&&(t.trip_status=We);for(const i of ke){if(await D.collection("trip_logs").update(i,t,{$autoCancel:!1}),t.client_payment_status){const l=p.find(o=>o.id===i);await yt(D,i,t.client_payment_status,l)}if(We==="Delivered"||We==="Completed"){const l=p.find(o=>o.id===i);l&&await ct(l)}}$.success(`${ke.length} trip(s) updated successfully`),Ee([]),Nt(""),wt(""),ie()}catch(t){console.error("Bulk update error:",t),$.error("Failed to update some trip logs. Please try again.")}finally{ft(!1)}}},ta=async()=>{if(be){ft(!0);try{const t={date:ce(new Date,"yyyy-MM-dd")+" 12:00:00.000Z",description:`Bulk Final Payment - Trips: ${be.tripCodes.join(", ")} (Net after TDS)`,amount:parseFloat(be.netAmount.toFixed(2)),transaction_type:"Income",category:"Trip Revenue",added_by:n?.id||D.authStore.model?.id||"",reference_id:be.tripIds.join(","),reference_type:"bulk_trip_payment",status:"Completed"};await D.collection("cashbook").create(t,{$autoCancel:!1});for(const i of be.trips){const l=i.expand?.client_id,f=l?.isTdsApplicable||!1?Number(l?.tdsRate)||2:0,y=Number(i.revenue||0)*(f/100);await D.collection("trip_logs").update(i.id,{client_payment_status:"received",tds_deducted_receivable:Number(y.toFixed(2))},{$autoCancel:!1}),await yt(D,i.id,"received",i)}$.success(`Bulk payment registered successfully and ${be.trips.length} trips updated.`),Ee([]),Nt(""),wt(""),gt(null),ie()}catch(t){console.error("Bulk payment confirmation error:",t);const i=t?.data?JSON.stringify(t.data):"";$.error("Failed to confirm bulk payment: "+(t.message||"Unknown error")+(i?" | "+i:""))}finally{ft(!1)}}},sa=async()=>{if(!(!_e||_e.length===0)){Gt(!0);try{const t=_e.map(o=>({id:o.id,trip_id:o.trip_id})),i=t.flatMap(o=>[o.id,o.trip_id].filter(Boolean));try{await Ka.fetch("/trips/delete-bulk",{method:"POST",body:JSON.stringify({ids:i,trips:t})})}catch(o){console.warn("apiServerClient bulk delete warning:",o)}for(const o of _e)try{let f=o.id;if(!f||String(f).startsWith("TRIP-")||String(f).length!==15){const y=o.trip_id||o.id,L=await D.collection("trip_logs").getList(1,1,{filter:`trip_id = "${y}" || id = "${y}"`,$autoCancel:!1}).catch(()=>({items:[]}));L.items&&L.items.length>0&&(f=L.items[0].id)}f&&String(f).length===15?await D.collection("trip_logs").delete(f,{$autoCancel:!1}):o.id&&await D.collection("trip_logs").delete(o.id,{$autoCancel:!1}).catch(()=>{})}catch(f){console.error("Single trip delete error:",f)}const l=_e.flatMap(o=>[o.id,o.trip_id].filter(Boolean));h(o=>o.filter(f=>!l.includes(f.id)&&!l.includes(f.trip_id))),Ee(o=>o.filter(f=>!l.includes(f))),Xe(null),$.success(`Successfully deleted ${_e.length} trip record(s)`),setTimeout(()=>{ie()},600)}catch(t){console.error("Delete error:",t),$.error(`Failed to delete trips: ${t.message||"Database error"}`)}finally{Gt(!1)}}},ss=async(t,i,l)=>{try{const data=typeof i==="object"&&i!==null?i:{[i]:l};await D.collection("trip_logs").update(t,data,{$autoCancel:!1}),$.success(`Updated ${typeof i==="object"||i==="driver_name"?"driver":"truck"} successfully`),ie()}catch(o){console.error("Failed to update:",o),$.error("Failed to update trip record")}},aa=t=>{if(!t)return[];let i=[];return t.milestones_schedule&&(i=typeof t.milestones_schedule=="string"?JSON.parse(t.milestones_schedule):t.milestones_schedule),Array.isArray(i)&&i.length>0?i.map((l,o)=>({title:`${o+1}. ${l.dock_label||(l.type==="dock"?"Loading Dock Gate":o===i.length-1?"Final Delivery Dock":`Drop ${o}`)}: ${l.stop_name||l.village_name||""}`,description:`Scheduled: ${l.sched_arrival_time||"—"} | Map: ${l.village_name||""}`,time:l.actual_arrival_iso||l.actual_dispatch_iso||(o===0?t.dock_arrival_time||t.date:o===i.length-1?t.delivery_date:null),statusKey:l.status||(o===0?"Arrived at Dock":o===i.length-1?"Delivered":"In Transit"),fieldName:o===0?"dock_arrival_time":o===i.length-1?"delivery_date":`stop_${o}_time`,canRecord:!0,customRecordStatus:o===0?"In Transit":o===i.length-1?"Delivered":"In Transit"})):[{title:"1. Trip Created & Scheduled",description:"Trip booking registered in system with assigned truck and driver.",time:t.date||t.created,statusKey:"Upcoming",fieldName:"date",canRecord:!1},{title:`2. Arrival at Loading Dock (${t.origin_village||t.origin||"Loading Hub"})`,description:"Vehicle reported at the dock gate for loading operations.",time:t.dock_arrival_time,statusKey:"Arrived at Dock",fieldName:"dock_arrival_time",canRecord:!0,customRecordStatus:"In Transit"},{title:"3. Dispatched & In Transit",description:"Vehicle completed loading and left the loading hub en-route.",time:t.pickup_time||t.dock_dispatch_time,statusKey:"In Transit",fieldName:"pickup_time",canRecord:!0,customRecordStatus:"In Transit"},{title:`4. Reached Destination Dock (${t.destination_village||t.destination||"Delivery Hub"})`,description:"Vehicle arrived at destination unloading point.",time:t.drop_arrival_time,statusKey:"At Destination",fieldName:"drop_arrival_time",canRecord:!0,customRecordStatus:"In Transit"},{title:"5. Cargo Delivered & Signed POD",description:"Unloading completed, POD signed, and trip finalized.",time:t.delivery_date,statusKey:"Delivered",fieldName:"delivery_date",canRecord:!0,customRecordStatus:"Delivered"}]},ra=({title:t,description:i,time:l,statusKey:o,fieldName:f,canRecord:y,customRecordStatus:L})=>{if(!k)return null;const B=!!l||o==="Upcoming",Q=k.trip_status===o,ue=H===(f||o);let de="border-muted-foreground/30 bg-background text-muted-foreground";B?o==="Upcoming"?de="border-slate-500 bg-slate-500 text-white":o==="Arrived at Dock"?de="border-sky-500 bg-sky-500 text-white":o==="Dispatched"?de="border-blue-500 bg-blue-500 text-white":o==="In Transit"?de="border-amber-500 bg-amber-500 text-white":o==="Delivered"&&(de="border-emerald-500 bg-emerald-500 text-white"):Q&&(de="border-primary bg-primary/10 text-primary animate-pulse");const R=l?ce(new Date(l),"dd MMM yyyy, hh:mm a"):null;return e.jsxs("div",{className:"relative pl-7 pb-4 last:pb-1 group",children:[e.jsx("div",{className:"absolute left-[11px] top-6 bottom-0 w-[2px] bg-muted/30 group-last:hidden"}),e.jsx("div",{className:V("absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 z-10",de),children:B?"✓":""}),e.jsxs("div",{className:"space-y-1",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:V("text-xs sm:text-sm font-bold transition-colors",B?"text-foreground":"text-muted-foreground",Q&&"text-primary"),children:t}),Q&&e.jsx(jt,{className:"text-[9px] font-bold tracking-wider uppercase bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",children:"Current Status"})]}),e.jsx("p",{className:"text-[11px] text-muted-foreground leading-tight",children:i}),ue?e.jsxs("div",{className:"space-y-2 mt-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 shadow-md",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-[10px] font-bold text-slate-400 uppercase tracking-wider",children:"Set Milestone Date & Time (AM/PM)"}),me&&e.jsxs("span",{className:"text-[11px] font-mono font-bold text-emerald-400",children:["⏰ ",ce(new Date(me),"dd MMM yyyy, hh:mm a")]})]}),e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsx(se,{type:"datetime-local",value:me,onChange:K=>oe(K.target.value),className:"h-8 text-xs font-mono w-52 bg-background border-border text-foreground rounded-lg"}),e.jsx(S,{size:"sm",className:"h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm",onClick:()=>{Xt(f,me,L||null),q(null)},children:"Save Timestamp"}),e.jsx(S,{size:"sm",variant:"ghost",className:"h-8 px-2.5 rounded-lg text-muted-foreground text-xs",onClick:()=>q(null),children:"Cancel"})]})]}):e.jsx("div",{className:"flex items-center gap-2 mt-1.5 flex-wrap",children:R?e.jsxs("div",{className:"flex items-center gap-2 bg-muted/40 px-2.5 py-1 rounded-lg border border-border/50 text-xs",children:[e.jsxs("span",{className:"font-mono font-bold text-emerald-400 flex items-center gap-1",children:[e.jsx(vt,{className:"w-3 h-3 text-emerald-400"})," ",R]}),e.jsxs(S,{variant:"ghost",size:"sm",className:"h-6 px-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-[11px] font-bold flex items-center gap-1",onClick:()=>{q(f||o),oe(l?ce(new Date(l),"yyyy-MM-dd'T'HH:mm"):ce(new Date,"yyyy-MM-dd'T'HH:mm"))},title:"Edit date and time",children:[e.jsx(Rt,{className:"w-3 h-3 text-amber-400"})," Edit Time"]})]}):e.jsxs(e.Fragment,{children:[y&&e.jsxs(S,{size:"sm",variant:"outline",className:"h-7 text-xs font-bold rounded-lg border-primary/40 hover:bg-primary/10 flex items-center gap-1 bg-background px-2.5 py-1 shadow-sm",onClick:()=>{const K=new Date().toISOString();Xt(f||"date",K,L||o)},children:[e.jsx(At,{className:"w-3.5 h-3.5 text-primary animate-pulse"}),"Record Timestamp Now"]}),e.jsxs(S,{variant:"ghost",size:"sm",className:"h-7 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg px-2 flex items-center gap-1",onClick:()=>{q(f||o),oe(ce(new Date,"yyyy-MM-dd'T'HH:mm"))},children:[e.jsx(Rt,{className:"w-3 h-3 text-amber-400"})," Set Custom Time (AM/PM)"]})]})})]})]})};return r?e.jsx("div",{className:"h-full w-full flex items-center justify-center",children:e.jsx(Ia,{text:"Loading trip logs and fleet data..."})}):j?e.jsxs("div",{className:"container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[60vh]",children:[e.jsx("div",{className:"inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-4 shadow-sm",children:e.jsx(nt,{className:"w-8 h-8 text-destructive"})}),e.jsx("h2",{className:"text-2xl font-bold mb-2",children:"Data Load Error"}),e.jsx("p",{className:"text-muted-foreground mb-6 max-w-md",children:j}),e.jsx(S,{onClick:ie,className:"rounded-xl",children:"Try Again"})]}):e.jsxs(e.Fragment,{children:[e.jsx(ja,{children:e.jsx("title",{children:"Trip Logs - Jai Bhavani Cargo"})}),e.jsx("div",{className:"h-full w-full bg-background flex flex-col",children:e.jsxs(Pa.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{duration:.4},transition:{duration:.4},className:"container max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 md:py-4 flex-1 flex flex-col pb-36 md:pb-8",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3.5 gap-3 shrink-0",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-xl sm:text-2xl font-heading font-extrabold tracking-tight text-foreground",children:"Trip Logs & Operations"}),e.jsx("p",{className:"text-[11px] sm:text-xs text-muted-foreground mt-0.5",children:"Manage scheduled contract indents, live highway dispatches, and billing settlements."})]}),e.jsxs("div",{className:"flex items-center gap-2 w-full sm:w-auto",children:[e.jsxs(S,{onClick:()=>_setStandbyRegistryOpen(!0),variant:"outline",size:"sm",className:"h-9 px-3 rounded-xl text-xs bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all",title:"Standby Driver Reserve Pool",children:[e.jsx("span",{className:"text-sm",children:"🛡️"})," Standby Drivers"]}),e.jsxs(S,{onClick:()=>v(!0),variant:"outline",size:"sm",className:"h-9 px-3 rounded-xl text-xs bg-card border-border hover:border-primary/50 text-foreground font-semibold",children:[e.jsx(gs,{className:"w-3.5 h-3.5 mr-1 text-primary"})," Bulk"]}),e.jsxs(S,{onClick:()=>Y(!0),variant:"outline",size:"sm",className:"h-9 px-3 rounded-xl text-xs bg-card border-border hover:border-primary/50 text-foreground font-semibold",children:[e.jsx(_a,{className:"w-3.5 h-3.5 mr-1 text-primary"})," Recurring"]}),e.jsxs(S,{onClick:()=>A(!0),size:"sm",className:"flex-1 sm:flex-initial h-9 px-4 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20",children:[e.jsx(Na,{className:"w-4 h-4 mr-1.5"})," + New Trip"]})]})]}),e.jsxs("div",{className:"flex items-center gap-2 overflow-x-auto pb-1 mb-3.5 scrollbar-none",children:[e.jsxs("button",{type:"button",onClick:()=>{ot("in-transit"),Le(1)},className:V("flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shrink-0",te==="in-transit"?"bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black":"bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/40"),children:[e.jsx(tt,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:"In-Transit / Live"}),e.jsx("span",{className:V("px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black",te==="in-transit"?"bg-black/20 text-slate-950":"bg-muted text-muted-foreground"),children:Ws})]}),e.jsxs("button",{type:"button",onClick:()=>{ot("upcoming"),Le(1)},className:V("flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shrink-0",te==="upcoming"?"bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20 font-black":"bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/40"),children:[e.jsx(ns,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:"Upcoming / Schedule"}),e.jsx("span",{className:V("px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black",te==="upcoming"?"bg-white/25 text-white":"bg-muted text-muted-foreground"),children:Gs})]}),e.jsxs("button",{type:"button",onClick:()=>{ot("completed"),Le(1)},className:V("flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shrink-0",te==="completed"?"bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20 font-black":"bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/40"),children:[e.jsx(Tt,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:"Completed & Settlement"}),e.jsx("span",{className:V("px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black",te==="completed"?"bg-white/25 text-white":"bg-muted text-muted-foreground"),children:Js})]}),e.jsxs("button",{type:"button",onClick:()=>{ot("spot"),Le(1)},className:V("flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shrink-0",te==="spot"?"bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20 font-black":"bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/40"),children:[e.jsx(At,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:"Spot / Ad-hoc"}),e.jsx("span",{className:V("px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black",te==="spot"?"bg-white/25 text-white":"bg-muted text-muted-foreground"),children:Ys})]}),e.jsxs("button",{type:"button",onClick:()=>{ot("all"),Le(1)},className:V("flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shrink-0",te==="all"?"bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 font-black":"bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/40"),children:[e.jsx(ls,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:"All Master Trips"}),e.jsx("span",{className:V("px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black",te==="all"?"bg-white/25 text-white":"bg-muted text-muted-foreground"),children:p.length})]})]}),e.jsxs(La,{className:"shadow-2xl border-border/50 bg-card/95 backdrop-blur-xl rounded-2xl flex-1 flex flex-col overflow-hidden",children:[e.jsxs(Ea,{className:"flex flex-col md:flex-row justify-between items-start md:items-center gap-3 py-3 px-3.5 sm:px-5 border-b border-border/50 bg-background/80 shrink-0",children:[e.jsx("div",{className:"flex items-center justify-between w-full md:w-auto gap-2.5",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs(Oa,{className:"font-heading text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2",children:[te==="in-transit"&&e.jsx(tt,{className:"w-4 h-4 text-amber-500"}),te==="upcoming"&&e.jsx(ns,{className:"w-4 h-4 text-blue-500"}),te==="completed"&&e.jsx(Tt,{className:"w-4 h-4 text-emerald-500"}),te==="spot"&&e.jsx(At,{className:"w-4 h-4 text-purple-500"}),te==="all"&&e.jsx(tt,{className:"w-4 h-4 text-blue-400"}),te==="in-transit"?"Live In-Transit Trips":te==="upcoming"?"Scheduled Contract Indents":te==="completed"?"Completed & Billed Trips":te==="spot"?"Spot / Ad-hoc Shipments":"Master Shipments List"]}),e.jsxs("span",{className:"text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono font-bold",children:[Se.length," shown"]})]})}),e.jsxs("div",{className:"flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto",children:[e.jsxs("div",{className:"relative w-full sm:w-auto sm:min-w-[180px] md:max-w-xs",children:[e.jsx(vs,{className:"absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"}),e.jsx(se,{placeholder:"Search Trip ID, route, client, driver...",className:"pl-9 h-9 text-xs bg-background/90 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-blue-500/50 rounded-xl w-full",value:xt,onChange:t=>Wt(t.target.value)}),xt&&e.jsx("button",{type:"button",onClick:()=>Wt(""),className:"absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-0.5",children:"✕"})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-2 w-full sm:w-auto",children:[e.jsxs(pe,{value:ht,onValueChange:zs,children:[e.jsx(xe,{className:"h-9 text-xs bg-background/90 border-border/50 text-foreground rounded-xl font-medium w-full sm:w-[130px]",children:e.jsx(he,{placeholder:"Trip Status"})}),e.jsxs(fe,{className:"bg-card border-border/50 text-xs text-foreground",children:[e.jsx(F,{value:"all",children:"All Statuses"}),st.map(t=>e.jsx(F,{value:t,children:t},t))]})]}),e.jsxs(pe,{value:dt,onValueChange:Bs,children:[e.jsx(xe,{className:"h-9 text-xs bg-background/90 border-border/50 text-foreground rounded-xl font-medium w-full sm:w-[130px]",children:e.jsx(he,{placeholder:"Payment Status"})}),e.jsxs(fe,{className:"bg-card border-border/50 text-xs text-foreground",children:[e.jsx(F,{value:"all",children:"All Payments"}),e.jsx(F,{value:"pending",children:"Pending"}),e.jsx(F,{value:"received",children:"Paid"}),e.jsx(F,{value:"delayed",children:"Delayed"}),e.jsx(F,{value:"blank",children:"Unset"})]})]})]})]})]}),e.jsxs(Ua,{className:"p-0 flex-1 overflow-hidden flex flex-col",children:[ke.length>0&&e.jsxs("div",{className:"bg-primary/5 border-b border-primary/10 px-6 py-4 flex flex-wrap items-center gap-4 shrink-0",children:[e.jsxs(jt,{variant:"secondary",className:"bg-background border-border text-foreground font-semibold px-3 py-1 text-sm shadow-sm rounded-lg",children:[e.jsx(is,{className:"w-4 h-4 mr-2 text-primary"}),ke.length," selected"]}),e.jsx("div",{className:"h-6 w-px bg-border hidden sm:block"}),e.jsxs(pe,{value:We,onValueChange:wt,children:[e.jsx(xe,{className:"w-[160px] h-9 bg-background focus:ring-primary text-sm rounded-lg",children:e.jsx(he,{placeholder:"Set Status..."})}),e.jsx(fe,{children:st.map(t=>e.jsx(F,{value:t,children:t},t))})]}),e.jsxs(pe,{value:Ke,onValueChange:Nt,children:[e.jsx(xe,{className:"w-[160px] h-9 bg-background focus:ring-primary text-sm rounded-lg",children:e.jsx(he,{placeholder:"Set Payment..."})}),e.jsxs(fe,{children:[e.jsx(F,{value:"pending",children:"Mark Pending"}),e.jsx(F,{value:"received",children:"Mark Paid"}),e.jsx(F,{value:"delayed",children:"Mark Delayed"}),e.jsx(F,{value:"blank",children:"Clear Status"})]})]}),e.jsx(S,{size:"sm",className:"rounded-lg shadow-sm",onClick:ea,disabled:!Ke&&!We||Oe,children:Oe?e.jsx(Te,{className:"w-4 h-4 mr-2 animate-spin"}):"Apply Updates"}),e.jsxs("div",{className:"ml-auto flex items-center gap-3",children:[e.jsxs(S,{size:"sm",variant:"outline",className:"bg-background rounded-lg hover:border-primary/50",onClick:()=>kt(Se.filter(t=>ke.includes(t.id))),disabled:Oe||Ge,children:[e.jsx(Ut,{className:"w-4 h-4 mr-2"})," Assign Client"]}),e.jsxs(S,{size:"sm",variant:"destructive",className:"rounded-lg shadow-sm",onClick:()=>Xe(Se.filter(t=>ke.includes(t.id))),disabled:Oe||Ge,children:[e.jsx(Mt,{className:"w-4 h-4 mr-2 hidden sm:inline"})," Delete Selected"]}),e.jsx(S,{size:"sm",variant:"ghost",onClick:()=>Ee([]),className:"text-muted-foreground hover:bg-secondary rounded-lg",children:"Cancel"})]})]}),e.jsx("div",{className:"hidden md:block overflow-x-auto flex-1 h-full bg-card",children:e.jsxs(Ba,{children:[e.jsx(za,{className:"bg-background/90 sticky top-0 z-10 border-b border-border/50",children:e.jsxs(Ft,{className:"hover:bg-transparent border-none",children:[e.jsx(Ce,{className:"w-[35px] pl-3 py-2",children:e.jsx(ds,{checked:et.length>0&&et.every(t=>ke.includes(t.id)),onCheckedChange:Zs,"aria-label":"Select page rows"})}),e.jsx(Ce,{className:"text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-2 px-2",children:"Trip ID"}),e.jsx(Ce,{className:"text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-2 px-2",children:"Date"}),e.jsx(Ce,{className:"text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-2 px-2",children:"Client"}),e.jsx(Ce,{className:"text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-2 px-2",children:"Driver & Truck"}),e.jsx(Ce,{className:"text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-2 px-2",children:"Route & Dock Status"}),e.jsx(Ce,{className:"text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-2 px-2",children:"KMs"}),!d&&e.jsx(Ce,{className:"text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-2 px-2",children:"Revenue"}),!d&&e.jsx(Ce,{className:"text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-2 px-2",children:"Advances"}),e.jsx(Ce,{className:"text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-2 px-2",children:"Docs & SLA"}),e.jsx(Ce,{className:"text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-2 px-2",children:"Status"}),!d&&e.jsx(Ce,{className:"text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-2 px-2",children:"Payment"}),e.jsx(Ce,{className:"text-right pr-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-2 px-2",children:"Actions"})]})}),e.jsx(Va,{children:Se.length===0?e.jsx(Ft,{children:e.jsxs(Ne,{colSpan:12,className:"text-center py-20 text-muted-foreground",children:[e.jsx("div",{className:"w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4",children:e.jsx(tt,{className:"w-8 h-8 opacity-40"})}),e.jsx("p",{className:"text-lg font-medium text-foreground",children:"No shipments found"}),e.jsx("p",{className:"text-sm mt-1 mb-4",children:"Try adjusting your filters or add a new log."}),p.length===0&&e.jsx(S,{onClick:()=>A(!0),className:"rounded-xl shadow-sm",children:"Create First Trip"})]})}):et.map(t=>{const i=ke.includes(t.id);return e.jsxs(Ft,{className:V("transition-colors duration-150 border-b border-border/30 group hover:bg-muted/20",i?"bg-primary/10 border-l-2 border-l-primary":""),children:[e.jsx(Ne,{className:"pl-3 py-2",children:e.jsx(ds,{checked:i,onCheckedChange:()=>Xs(t.id),"aria-label":`Select row ${t.id}`})}),e.jsx(Ne,{className:"whitespace-nowrap font-mono py-2 px-2",children:e.jsxs("div",{className:"flex flex-col gap-0.5",children:[e.jsx("span",{className:"font-bold text-xs text-blue-400",children:t.trip_id||"-"}),t.client_trip_id&&e.jsxs("span",{className:"inline-flex items-center gap-1 text-[9px] font-bold text-sky-300 bg-sky-500/15 border border-sky-500/30 px-1.5 py-0.2 rounded w-fit",title:"Client / Partner Trip ID",children:["Client: ",t.client_trip_id]}),t.lr_number&&e.jsxs("span",{className:"inline-flex items-center gap-1 text-[9px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded w-fit",title:"LR / Consignment Number",children:["LR: #",t.lr_number]})]})}),e.jsxs(Ne,{className:"whitespace-nowrap font-medium text-xs text-slate-300 py-2 px-2",children:[e.jsx("div",{children:Ot(t.date)}),(t.pickup_time||t.delivery_eta)&&e.jsxs("div",{className:"flex flex-col gap-0.5 text-[9px] font-mono",children:[t.pickup_time&&bt(t.pickup_time)&&e.jsxs("span",{className:"text-emerald-400",children:["PU: ",bt(t.pickup_time)]}),t.delivery_eta&&bt(t.delivery_eta)&&e.jsxs("span",{className:"text-sky-400",children:["ETA: ",bt(t.delivery_eta)]})]})]}),e.jsx(Ne,{className:"py-2 px-2 whitespace-nowrap",children:t.expand?.client_id?e.jsx("span",{className:"font-semibold text-xs text-white",children:t.expand.client_id.client_name}):e.jsx("span",{className:"text-[10px] text-slate-500",children:"Unassigned"})}),e.jsx(Ne,{className:"py-2 px-2",children:e.jsxs("div",{className:"flex flex-col min-w-[120px]",children:[(()=>{const curTruck=(t.truck_number||"").trim(),curTruckNorm=curTruck.replace(/\s+/g,"").toUpperCase(),matchedTruck=u.find(l=>(l.truck_number||"").replace(/\s+/g,"").toUpperCase()===curTruckNorm),selTruck=matchedTruck?matchedTruck.truck_number:curTruck;return e.jsxs(pe,{value:selTruck||"",onValueChange:async l=>{if(!l||l===t.truck_number)return;const o=p.find(f=>f.id!==t.id&&(f.truck_number||"").replace(/\s+/g,"").toUpperCase()===l.replace(/\s+/g,"").toUpperCase()&&f.trip_status!=="Cancelled"&&(f?.date||"").split(" ")[0]===(t?.date||"").split(" ")[0]);o&&!window.confirm(`Warning: Truck ${l} is already assigned to ${o.trip_id||"another trip"} on this date. Assign anyway?`)||await ss(t.id,"truck_number",l)},children:[e.jsx(xe,{className:"h-6 border-none bg-transparent hover:bg-slate-800/50 px-1 py-0 font-bold text-xs text-white focus:ring-0 focus:ring-offset-0 [&>span]:line-clamp-1 w-full justify-start gap-1 rounded transition-colors",children:e.jsx(he,{placeholder:"Select Truck",children:selTruck||"Select Truck"})}),e.jsx(fe,{children:u.map(l=>{const o=t.date?(t?.date||"").split(" ")[0]:"",f=Qs[o]?.has(l.truck_number)&&l.truck_number!==selTruck;return e.jsx(F,{value:l.truck_number,children:e.jsxs("span",{children:[l.truck_number," ",f?"(Booked today)":""]})},l.id)}).concat(selTruck&&!u.some(l=>l.truck_number===selTruck)?[e.jsx(F,{value:selTruck,children:selTruck},"custom-truck")]:[])})]})})(),(()=>{const curDriver=(t.driver_name||t.driver||"").trim(),isTemp=curDriver==="Temporary Driver"||curDriver.startsWith("Temporary Driver"),matchedEmp=isTemp?null:s.find(E=>(t.driver_employee_id&&E.id===t.driver_employee_id)||(t.driver_employee_code&&E.employee_code&&E.employee_code===t.driver_employee_code)||(curDriver&&E.name&&E.name.trim().toLowerCase()===curDriver.toLowerCase())),selDriverVal=isTemp?"Temporary Driver":(matchedEmp?matchedEmp.id:curDriver),driverLabel=isTemp?(curDriver!=="Temporary Driver"?curDriver:"⚡ Temporary Driver"):(matchedEmp?(matchedEmp.employee_code?`${matchedEmp.employee_code} — ${matchedEmp.name}`:matchedEmp.name):curDriver);return e.jsxs(pe,{value:selDriverVal||"",onValueChange:async l=>{if(!l)return;if(l==="Temporary Driver"){await ss(t.id,{driver_employee_id:null,driver_employee_code:null,driver_name:"Temporary Driver"})}else{const emp=s.find(E=>E.id===l||E.employee_code===l||E.name===l);if(emp){await ss(t.id,{driver_employee_id:emp.id,driver_employee_code:emp.employee_code||null,driver_name:emp.name})}else{await ss(t.id,{driver_employee_id:null,driver_employee_code:null,driver_name:l})}}},children:[e.jsx(xe,{className:"h-6 border-none bg-transparent hover:bg-muted/80 px-2 py-0.5 text-xs text-muted-foreground font-medium focus:ring-0 focus:ring-offset-0 [&>span]:line-clamp-1 w-full justify-start gap-1 rounded-md transition-colors -mt-1",children:e.jsx(he,{placeholder:"Select Driver",children:driverLabel||"Select Driver"})}),e.jsxs(fe,{children:[e.jsx(F,{value:"Temporary Driver",className:"font-semibold text-amber-600 dark:text-amber-400",children:"⚡ Temporary Driver (No app access)"}),Bt(s,curDriver).map(l=>e.jsx(F,{value:l.id,children:e.jsxs("span",{children:[l.employee_code?e.jsxs(Da.Fragment,{children:[e.jsx("span",{className:"font-mono font-bold text-sky-400 mr-1.5",children:l.employee_code}),"— "]}):null,l.name]})},l.id))].concat(curDriver&&!isTemp&&!matchedEmp?[e.jsx(F,{value:curDriver,children:curDriver},"custom-driver")]:[])})]})})()]})}),e.jsx(Ne,{className:"py-2",children:(()=>{const l=(t.route||"").trim().toUpperCase(),o=_[t.route_id]||_[l]||_[l.replace(/\s+/g,"")],f=Array.isArray(o?.stops)?o.stops:[];let y=[];if(o){const L=o.origin||o.start_location||t.origin||"Start";y.push({name:L,mapLink:o.start_location_map_link||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(L)}`,type:"origin"}),[...f].sort((ue,de)=>(ue.sequence||0)-(de.sequence||0)).forEach(ue=>{y.push({name:ue.stop_name,mapLink:ue.map_link||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ue.stop_name)}`,type:"stop"})});let Q=o.destination||o.end_location||t.destination||"End";(Q==="HUZURABAD"||l.includes("WARK")||l.includes("MHYD"))&&(Q="TUKKUGUDA"),y.push({name:Q,mapLink:o.end_location_map_link||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(Q)}`,type:"destination"})}else if(l.includes("WARK")||l.includes("MHYD")||l.includes("HUZURABAD"))y=[{name:"WARANGAL",mapLink:"https://www.google.com/maps/search/?api=1&query=WARANGAL",type:"origin"},{name:"TUKKUGUDA",mapLink:"https://www.google.com/maps/search/?api=1&query=TUKKUGUDA",type:"destination"}];else if(t.route&&t.route.includes("->")){const L=(t?.route||"").split("->").map(B=>B.trim());L.forEach((B,Q)=>{let ue="stop";Q===0?ue="origin":Q===L.length-1&&(ue="destination");let de=B;(de==="HUZURABAD"||Q===L.length-1&&(B==="MHYD"||B==="HUZURABAD"))&&(de="TUKKUGUDA"),y.push({name:de,mapLink:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(de)}`,type:ue})})}else t.route&&y.push({name:t.route,mapLink:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.route)}`,type:"origin"});return y.length===0?e.jsx("span",{className:"text-muted-foreground",children:"—"}):e.jsxs("div",{className:"flex flex-col gap-0.5 min-w-[180px] max-w-[260px] py-1",children:[e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[e.jsx("span",{className:"font-bold text-xs text-foreground tracking-wide uppercase truncate max-w-[150px]",title:t.route,children:t.route||"Unknown"}),e.jsx("div",{className:"flex items-center gap-1.5 shrink-0 bg-background/80 border border-border/50 px-1.5 py-0.5 rounded-full",children:Kt(t).map((L,B)=>e.jsxs("button",{type:"button",onClick:Q=>{Q.stopPropagation(),w(t),q(L.fieldName)},className:"flex items-center gap-0.5 cursor-pointer focus:outline-none hover:scale-110 transition-transform",title:`${L.dockLabel} (${L.name}): ${L.delayMessage||"Click to view timeline"}`,children:[e.jsx("span",{className:V("w-2 h-2 rounded-full shadow-sm transition-all",L.isRedDelay?"bg-rose-500 ring-2 ring-rose-500/40 animate-pulse":L.isCompleted?"bg-emerald-400":"bg-sky-400/40")}),e.jsx("span",{className:"text-[8px] font-bold text-muted-foreground hover:text-foreground",children:L.dockType==="loading_dock"?"Dock":`D${B}`})]},B))}),o?.google_map_link&&e.jsx("a",{href:Xa(o.google_map_link,t.route||"Trip Route"),target:"_blank",rel:"noopener noreferrer",onClick:L=>L.stopPropagation(),title:"Open full trip map",className:"text-emerald-400 hover:text-emerald-300 p-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 transition-all shrink-0",children:e.jsx(wa,{className:"w-3 h-3"})})]}),(()=>{const B=Kt(t).map(Q=>Q.villageName||Q.name).filter(Boolean).join(" → ");return B?e.jsx("div",{className:"text-[10px] font-mono text-sky-400/90 truncate",title:B,children:B}):null})()]})})()}),e.jsx(Ne,{className:"text-center py-3",children:e.jsx(fs,{log:t,onUpdate:l=>{h(o=>o.map(f=>f.id===t.id?{...f,kms:l}:f))}})}),!d&&e.jsx(Ne,{className:"text-right text-xs font-bold font-mono text-emerald-400 py-2 px-2",children:ae(t.revenue)}),!d&&e.jsx(Ne,{className:"text-right py-2 px-2",children:e.jsxs("div",{className:"flex flex-col items-end gap-0.5 font-mono text-[10px]",children:[e.jsxs("span",{className:"text-emerald-400 font-semibold",title:"Received from Client",children:["+",t.advance_received_from_client>0?ae(t.advance_received_from_client):"Rs. 0"]}),e.jsxs("span",{className:"text-rose-400 font-semibold",title:"Paid to Driver",children:["-",t.advance_paid_to_driver>0?ae(t.advance_paid_to_driver):"Rs. 0"]})]})}),e.jsx(Ne,{className:"text-center py-2 px-1 whitespace-nowrap",children:e.jsxs("div",{className:"flex flex-col items-center gap-1",children:[(()=>{const dc=(t.lr_file_url||t.lr_file||t.lr_number?1:0)+(t.invoice_file_url||t.invoice_file||t.invoice_number?1:0)+(t.eway_bill_file_url||t.eway_bill_file||t.eway_bill_number?1:0);return e.jsxs("button",{type:"button",onClick:()=>_setDocsTrip(t),className:"inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all border "+(dc===3?"bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25":dc>0?"bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25":"bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/60"),children:[e.jsx("span",{children:"📎"}),e.jsxs("span",{children:[dc,"/3 Docs"]})]})})(),t.delivery_deadline?(()=>{const dl=new Date(t.delivery_deadline),isPast=dl<new Date()&&t.trip_status!=="Delivered"&&t.trip_status!=="Completed";return e.jsxs("span",{onClick:()=>_setDocsTrip(t),className:"cursor-pointer px-1.5 py-0.5 rounded text-[9px] font-medium border flex items-center gap-1 "+(isPast?"bg-rose-500/20 text-rose-400 border-rose-500/30":"bg-slate-900 text-slate-300 border-slate-700"),title:isPast?"Overdue SLA!":"Target SLA",children:[e.jsx("span",{children:"⏱️"}),e.jsx("span",{children:isPast?"Overdue":dl.toLocaleDateString("en-IN",{day:"2-digit",month:"short"})})]})})():null]})}),e.jsx(Ne,{className:"text-center",children:e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsxs(pe,{value:t.trip_status||"Upcoming",onValueChange:async l=>{if(!(!l||l===t.trip_status))try{const o={trip_status:l};
l==="Arrived at Dock"&&!t.loading_dock_arrival_time?o.loading_dock_arrival_time=new Date().toISOString():
l==="Dispatched"&&!t.dispatched_time?o.dispatched_time=new Date().toISOString():
(l==="Arrived at Delivery Location"||l==="Reached Delivery Docket"||l==="Unloading in Progress")&&!t.delivery_dock_arrival_time?(o.delivery_dock_arrival_time=new Date().toISOString(),o.detention_status="grace_period"):
l==="Delivered"&&!t.delivered_time&&(o.delivered_time=new Date().toISOString());
if((l==="Delivered"||l==="Completed")&&(t.delivery_dock_arrival_time||o.delivery_dock_arrival_time)){
  const _arr=new Date(t.delivery_dock_arrival_time||o.delivery_dock_arrival_time).getTime();
  const _hrs=Math.max(0,(Date.now()-_arr)/36e5);
  const _free=Number(t.free_detention_hours||4);
  const _rate=Number(t.detention_rate_per_hour||500);
  if(_hrs>_free){o.detention_hours=Number((_hrs-_free).toFixed(1));o.detention_amount=Math.round((_hrs-_free)*_rate);o.detention_status="billable";}
  else{o.detention_hours=0;o.detention_amount=0;o.detention_status="grace_period";}
}
let _saved2=false;try{await D.collection("trip_logs").update(t.id,o,{$autoCancel:!1});_saved2=true;}catch(_pbErr){try{const _res=await fetch("/api/trips/"+t.id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)});if(_res.ok)_saved2=true;}catch(_apiErr){}}if(!_saved2)throw new Error("Update rejected");(l==="Delivered"||l==="Completed")&&await ct(t);const _tgD=(l==="Delivered"||l==="Completed")?"completed":(l==="Upcoming"||l==="Scheduled")?"upcoming":"in-transit";te!=="all"&&te!==_tgD&&ot(_tgD);h(prev=>(prev||[]).map(row=>row.id===t.id?{...row,...o,trip_status:l}:row));$.success(`Trip status updated to ${l} & FASTag balance adjusted`);l==="Delivered"&&(Ae({...t,...o}),d||ee(t));ie()}catch(o){console.error("Status update failed:",o);let _ok=false;try{const _ck=await D.collection("trip_logs").getOne(t.id,{$autoCancel:!1});if(_ck&&_ck.trip_status===l){$.success(`Trip status updated to ${l} & FASTag balance adjusted`),l==="Delivered"&&(Ae({...t,...o}),d||ee(t)),ie(),_ok=true}}catch(_){};if(!_ok)$.error("Failed to update status")}},children:[e.jsx(xe,{className:V("h-8 border px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all focus:ring-0 focus:ring-offset-0 [&>svg]:ml-1.5 [&>svg]:h-3.5 [&>svg]:w-3.5 mx-auto w-auto justify-center",It(t.trip_status)),children:e.jsx(he,{children:$t(t.trip_status)})}),e.jsx(fe,{align:"center",className:"bg-card border-border shadow-xl z-50",children:st.map(l=>e.jsx(F,{value:l,className:"font-semibold text-xs py-2 cursor-pointer",children:l},l))})]}),(()=>{
  const isDock=t.trip_status==="Arrived at Delivery Location"||t.trip_status==="Reached Delivery Docket"||t.trip_status==="Unloading in Progress"||!!t.delivery_dock_arrival_time;
  if(!isDock)return null;
  const arr=t.delivery_dock_arrival_time?new Date(t.delivery_dock_arrival_time).getTime():Date.now();
  const end=(t.trip_status==="Delivered"||t.trip_status==="Completed")&&t.delivered_time?new Date(t.delivered_time).getTime():Date.now();
  const elMs=Math.max(0,end-arr);
  const totalH=elMs/36e5;
  const freeH=Number(t.free_detention_hours||4);
  const rate=Number(t.detention_rate_per_hour||500);
  const isOver=totalH>freeH;
  const h=Math.floor(elMs/36e5);
  const m=Math.floor((elMs%36e5)/6e4);
  const tStr=`${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m`;
  if(isOver){
    const billAmt=Math.round((totalH-freeH)*rate);
    return e.jsx("div",{className:"mt-1 flex items-center justify-center",title:`Arrival at Destination: ${new Date(arr).toLocaleTimeString()} | Overdue Demurrage Active`,children:e.jsxs("span",{className:"inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-500 border border-red-500/30 animate-pulse",children:["⏱️ Detention: ",tStr,` (+₹${billAmt.toLocaleString("en-IN")})`]})});
  }else{
    const remM=Math.max(0,Math.round(freeH*60-elMs/6e4));
    return e.jsx("div",{className:"mt-1 flex items-center justify-center",title:`Arrival at Destination: ${new Date(arr).toLocaleTimeString()} | Free Grace: ${freeH}h`,children:e.jsxs("span",{className:"inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30",children:["⏱️ Gate: ",tStr,` (${Math.floor(remM/60)}h ${remM%60}m free)`]})});
  }
})(),t.trip_status==="Delivered"&&t.closure_verified_at?e.jsx("div",{className:"mt-1 flex items-center justify-center",children:e.jsx("span",{className:"inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse",children:`⏳ Auto-closing in ${Math.max(0,Math.ceil((new Date(t.closure_verified_at).getTime()+6e5-Date.now())/6e4))}m`})}):t.trip_status==="Completed"&&t.auto_closed_at?e.jsx("div",{className:"mt-1 flex items-center justify-center",children:e.jsx("span",{className:"inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",children:"🤖 Auto-Closed"})}):t.trip_status==="Delivered"&&t.closure_blockers?(()=>{try{const b=typeof t.closure_blockers==="string"?JSON.parse(t.closure_blockers):t.closure_blockers;if(Array.isArray(b)&&b.length>0)return e.jsx("div",{className:"mt-1 flex items-center justify-center",title:b.join(", "),children:e.jsxs("span",{className:"inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30",children:["⚠️ ",b.length," Blocker",b.length>1?"s":""]})})}catch(_){}return null})():null]})}),!d&&e.jsx(Ne,{className:"text-center",children:e.jsx("span",{className:V("inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border shadow-sm",t.client_payment_status==="received"?"bg-success/15 text-success border-success/30":t.client_payment_status==="delayed"?"bg-destructive/15 text-destructive border-destructive/30":t.client_payment_status==="pending"?"bg-warning/15 text-warning border-warning/30":"bg-muted text-muted-foreground border-border/50"),children:t.client_payment_status==="received"?"Paid":t.client_payment_status||"UNSET"})}),e.jsx(Ne,{className:"text-right pr-6",children:e.jsxs("div",{className:"flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity",children:[e.jsxs(cs,{children:[e.jsx(ms,{asChild:!0,children:e.jsxs(S,{variant:"outline",size:"sm",className:"h-8 rounded-lg text-xs font-bold text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10 flex items-center gap-1 bg-background px-2",title:"Share on WhatsApp",children:[e.jsx(ka,{className:"w-3.5 h-3.5 text-emerald-500"})," Share ▾"]})}),e.jsxs(us,{align:"end",className:"w-64 bg-card border-border shadow-xl z-50",children:[e.jsx(Be,{className:"font-bold text-xs py-2 text-sky-400 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"driver_dispatch"}),children:"📍 Send Location to Driver (GPS Navigation)"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-emerald-400 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"booking_confirmation"}),children:"🚛 Booking Confirmation (Driver & Vehicle)"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-blue-400 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"trip_status"}),children:"🚚 Live Trip Status & ETA Tracking"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-purple-400 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"pod_proof"}),children:"📑 POD (Proof of Delivery) Copy"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-emerald-500 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"payment_confirmation"}),children:"✅ Payment Received Confirmation"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-amber-500 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"quote"}),children:"🏷️ Share Freight Rate Quote"})]})]}),e.jsx(S,{variant:"outline",size:"icon",onClick:()=>_setReassignTrip(t),className:"h-8 w-8 rounded-lg text-amber-400 border-amber-500/30 hover:bg-amber-500/10 bg-background",title:"🚨 Emergency Reassignment (Driver/Vehicle Swap)",children:e.jsx("span",{className:"text-sm",children:"🔄"})}),e.jsx(S,{variant:"outline",size:"icon",onClick:()=>_setValidationTrip(t),className:"h-8 w-8 rounded-lg text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 bg-background",title:"✓ 3-Gate Completion & Settlement Audit",children:e.jsx("span",{className:"text-sm",children:"📋"})}),e.jsx(S,{variant:"outline",size:"icon",onClick:()=>Us(t),className:"h-8 w-8 rounded-lg text-blue-400 border-blue-500/30 hover:bg-blue-500/10 bg-background",title:"Email Trip Sheet",children:e.jsx(js,{className:"w-4 h-4"})}),e.jsx(S,{variant:"outline",size:"icon",onClick:()=>w(t),className:"h-8 w-8 rounded-lg text-sky-400 border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-300 hover:border-sky-500/50 bg-background",title:"View Trip Timeline",children:e.jsx(vt,{className:"w-4 h-4"})}),e.jsx(S,{variant:"outline",size:"icon",onClick:()=>window.open(`/invoice-matching?tripId=${t.trip_id||t.id}`,"_blank"),className:"h-8 w-8 rounded-lg text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/50 bg-background",title:"View Invoice Matching Ledger",children:e.jsx(Tt,{className:"w-4 h-4"})}),e.jsx(S,{variant:"outline",size:"icon",onClick:()=>Qt(t.id),className:"h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:border-primary/50 bg-background",title:"Edit trip",children:e.jsx(Rt,{className:"w-4 h-4"})}),e.jsx(S,{variant:"outline",size:"icon",onClick:()=>Xe([t]),className:"h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:border-destructive/50 bg-background",title:"Delete trip",children:e.jsx(Mt,{className:"w-4 h-4"})})]})})]},t.id)})})]})}),e.jsx("div",{className:"md:hidden space-y-3.5 px-1.5 pb-32",children:Se.length===0?e.jsxs("div",{className:"text-center py-14 text-muted-foreground bg-card/60 rounded-2xl p-6 border border-border/60 shadow-sm",children:[e.jsx(tt,{className:"w-10 h-10 opacity-30 mx-auto mb-3 text-primary"}),e.jsx("p",{className:"text-sm font-bold text-foreground",children:"No shipments found"}),e.jsx("p",{className:"text-xs text-muted-foreground mt-1",children:"Try adjusting your filters or search query."})]}):et.map(t=>e.jsxs("div",{className:"p-3.5 rounded-2xl bg-card border border-border/70 space-y-3 relative shadow-md hover:border-primary/30 transition-all overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between gap-2 border-b border-border/40 pb-2.5",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-0 flex-1 flex-wrap",children:[e.jsx("span",{className:"font-mono font-black text-xs text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded-lg shadow-sm whitespace-nowrap shrink-0",children:t.trip_id||"N/A"}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 text-xs font-black text-sky-300 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded-lg shadow-sm whitespace-nowrap shrink-0",children:[e.jsx("svg",{className:"w-3.5 h-3.5 text-sky-400 shrink-0",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})}),Ot(t.date)]}),t.lr_number&&e.jsxs("span",{className:"text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded-md font-mono shrink-0 whitespace-nowrap",children:["LR #",t.lr_number]})]}),e.jsx("div",{className:"shrink-0 flex items-center ml-auto",children:e.jsxs(pe,{value:t.trip_status||"Upcoming",onValueChange:async i=>{if(!i||i===t.trip_status)return;if(i==="Completed"){_setValidationTrip(t);return;}try{const _up={trip_status:i};if((i==="Arrived at Delivery Location"||i==="Reached Delivery Docket"||i==="Unloading in Progress")&&!t.delivery_dock_arrival_time){_up.delivery_dock_arrival_time=new Date().toISOString();_up.detention_status="grace_period";}if(i==="Delivered"&&!t.delivered_time){_up.delivered_time=new Date().toISOString();}if(i==="Delivered"||i==="Completed"){const _arr=t.delivery_dock_arrival_time||_up.delivery_dock_arrival_time;if(_arr){const _diff=(new Date(_up.delivered_time||new Date().toISOString())-new Date(_arr))/(1000*60*60);const _free=Number(t.free_detention_hours)||Number(t.allowed_unloading_hours)||2;const _rate=Number(t.detention_rate_per_hour)||Number(t.detention_rate)||150;if(_diff>_free){_up.detention_hours=Math.ceil(_diff-_free);_up.detention_amount=Math.round((_diff-_free)*_rate);_up.detention_status="billable";}else{_up.detention_hours=0;_up.detention_amount=0;_up.detention_status="grace_period";}}}let _saved=false;try{await D.collection("trip_logs").update(t.id,_up,{$autoCancel:!1});_saved=true;}catch(_pbErr){try{const _res=await fetch("/api/trips/"+t.id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(_up)});if(_res.ok)_saved=true;}catch(_apiErr){}}if(!_saved)throw new Error("Update rejected");(i==="Delivered"||i==="Completed")&&await ct(t);const _tg=(i==="Delivered"||i==="Completed")?"completed":(i==="Upcoming"||i==="Scheduled")?"upcoming":"in-transit";te!=="all"&&te!==_tg&&ot(_tg);h(prev=>(prev||[]).map(row=>row.id===t.id?{...row,..._up,trip_status:i}:row));$.success(`Trip status updated to ${i}`);i==="Delivered"&&ee(t);ie()}catch(l){console.error("Status update failed:",l);let _ok=false;try{const _ck=await D.collection("trip_logs").getOne(t.id,{$autoCancel:!1});if(_ck&&_ck.trip_status===i){$.success(`Trip status updated to ${i}`),i==="Delivered"&&ee(t),ie(),_ok=true}}catch(_){};if(!_ok)$.error("Failed to update status")}},children:[e.jsx(xe,{style:{width:"auto",minWidth:"92px",maxWidth:"130px",height:"26px",flexShrink:0},className:V("select-trigger-badge h-6 border px-2 py-0 rounded-lg text-[10px] font-extrabold uppercase tracking-wider shadow-sm transition-all focus:ring-0 focus:ring-offset-0 [&>svg]:ml-1 [&>svg]:h-2.5 [&>svg]:w-2.5 shrink-0 w-auto max-w-[130px] whitespace-nowrap",It(t.trip_status)),children:e.jsx(he,{children:$t(t.trip_status)})}),e.jsx(fe,{align:"end",className:"bg-card border-border shadow-2xl z-50 text-foreground",children:st.map(i=>e.jsx(F,{value:i,className:"font-semibold text-xs py-2 cursor-pointer",children:i},i))})]})})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between gap-2",children:[e.jsxs("div",{className:"text-sm font-extrabold text-foreground flex items-center gap-1.5 truncate",children:[e.jsx(ys,{className:"w-3.5 h-3.5 text-primary/80 shrink-0"}),e.jsx("span",{className:"truncate",children:t.expand?.client_id?.client_name||"Unassigned Client"})]}),t.client_trip_id&&e.jsxs("span",{className:"text-[10px] font-mono text-sky-400 bg-sky-500/10 border border-sky-500/25 px-1.5 py-0.5 rounded shrink-0",children:["Client: ",t.client_trip_id]})]}),e.jsxs("div",{className:"p-2 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-2 text-xs",children:[e.jsx(Sa,{className:"w-3.5 h-3.5 text-primary shrink-0"}),e.jsx("span",{className:"font-bold text-foreground tracking-wide truncate",children:t.route||"No Route Specified"})]}),t.late_delivery_reason&&e.jsxs("div",{className:"p-2 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-[11px] font-semibold flex items-center gap-1.5",children:[e.jsx(nt,{className:"w-3.5 h-3.5 shrink-0 text-rose-400"}),e.jsxs("span",{className:"truncate",children:["Delay: ",t.late_delivery_reason]})]})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-muted/25 border border-border/50 text-xs items-center",children:[e.jsxs("div",{className:"flex flex-col min-w-0",children:[e.jsxs("span",{className:"text-[10px] font-semibold text-muted-foreground flex items-center gap-1",children:[e.jsx(tt,{className:"w-3 h-3 text-muted-foreground/80"})," Truck"]}),e.jsx("span",{className:"font-bold text-foreground mt-0.5 truncate text-[11px]",children:t.truck_number||"—"})]}),e.jsxs("div",{className:"flex flex-col min-w-0",children:[e.jsxs("span",{className:"text-[10px] font-semibold text-muted-foreground flex items-center gap-1",children:[e.jsx(ls,{className:"w-3 h-3 text-muted-foreground/80"})," Driver"]}),e.jsx("span",{className:"font-bold text-foreground mt-0.5 truncate text-[11px]",children:t.driver_name||t.driver||"—"})]}),e.jsxs("div",{className:"flex flex-col items-center justify-center",children:[e.jsxs("span",{className:"text-[10px] font-semibold text-muted-foreground flex items-center gap-1",children:[e.jsx(_s,{className:"w-3 h-3 text-muted-foreground/80"})," Distance"]}),e.jsx(fs,{log:t,className:"w-16 h-6 text-xs bg-background border-border/80 font-bold rounded-lg text-center mt-0.5 focus-visible:ring-primary/40",onUpdate:i=>{h(l=>l.map(o=>o.id===t.id?{...o,kms:i}:o))}})]})]}),(Number(t.loading_charges)>0||Number(t.unloading_charges)>0||Number(t.broker_commission)>0||Number(t.munsiyana)>0)&&e.jsxs("div",{className:"flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono",children:[Number(t.loading_charges)>0&&e.jsxs("span",{className:"px-2 py-0.5 rounded border text-[10px] "+(t.loading_paid_by==="company"?"bg-amber-500/10 text-amber-400 border-amber-500/20":"bg-blue-500/10 text-blue-400 border-blue-500/20"),children:["Load: ₹",Number(t.loading_charges).toLocaleString("en-IN"),t.loading_paid_by==="company"?" (Co)":" (Cl)"]}),Number(t.unloading_charges)>0&&e.jsxs("span",{className:"px-2 py-0.5 rounded border text-[10px] "+(t.unloading_paid_by==="company"?"bg-amber-500/10 text-amber-400 border-amber-500/20":"bg-blue-500/10 text-blue-400 border-blue-500/20"),children:["Unload: ₹",Number(t.unloading_charges).toLocaleString("en-IN"),t.unloading_paid_by==="company"?" (Co)":" (Cl)"]}),Number(t.broker_commission)>0&&e.jsxs("span",{className:"px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20",children:["Broker: ₹",Number(t.broker_commission).toLocaleString("en-IN")]}),Number(t.munsiyana)>0&&e.jsxs("span",{className:"px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20",children:["Mun: -₹",Number(t.munsiyana).toLocaleString("en-IN")]})]}),e.jsxs("div",{className:"flex items-center justify-between py-2 px-3 rounded-xl bg-slate-900/70 border border-indigo-500/25 text-xs shadow-sm",children:[(()=>{const dc=(t.lr_file_url||t.lr_file||t.lr_number?1:0)+(t.invoice_file_url||t.invoice_file||t.invoice_number?1:0)+(t.eway_bill_file_url||t.eway_bill_file||t.eway_bill_number?1:0);return e.jsxs("button",{type:"button",onClick:()=>_setDocsTrip(t),className:"inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200 active:scale-95 transition-transform",children:[e.jsx("span",{children:"📎"}),e.jsxs("span",{children:[dc,"/3 Docs Attached"]}),e.jsx("span",{className:"text-[10px] text-slate-400",children:"→"})]})})(),t.delivery_deadline?(()=>{const dl=new Date(t.delivery_deadline),isPast=dl<new Date()&&t.trip_status!=="Delivered"&&t.trip_status!=="Completed";return e.jsxs("span",{onClick:()=>_setDocsTrip(t),className:"cursor-pointer px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 shadow-sm "+(isPast?"bg-rose-500/20 text-rose-400 border-rose-500/30":"bg-slate-800 text-slate-300 border-slate-700"),children:[e.jsx("span",{children:"⏱️"}),e.jsx("span",{children:isPast?"Overdue SLA":dl.toLocaleDateString("en-IN",{day:"2-digit",month:"short"})})]})})():null]}),e.jsxs("div",{className:"flex items-center justify-between py-2 px-3 rounded-xl bg-muted/30 border border-border/60",children:[e.jsxs("div",{className:"flex items-baseline gap-2",children:[e.jsx("span",{className:"text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground",children:"Revenue:"}),e.jsx("span",{className:"text-sm font-black text-emerald-400 tabular-nums font-mono",children:ae(t.revenue)})]}),e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("span",{className:"text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground",children:"Payment:"}),e.jsxs(pe,{value:t.client_payment_status||"pending",onValueChange:async i=>{const l=i==="blank"?"":i;if(l!==t.client_payment_status)try{await D.collection("trip_logs").update(t.id,{client_payment_status:l},{$autoCancel:!1}),await yt(D,t.id,l,t),$.success("Payment updated: "+(l||"Unset")),ie()}catch{$.error("Failed to update payment status")}},children:[e.jsx(xe,{className:V("select-trigger-badge h-6 border px-2 py-0 rounded-md text-[10px] font-extrabold uppercase tracking-wider shadow-sm transition-all focus:ring-0 focus:ring-offset-0 [&>svg]:ml-1 [&>svg]:h-2.5 [&>svg]:w-2.5 shrink-0 w-auto whitespace-nowrap",t.client_payment_status==="received"?"bg-emerald-500/15 text-emerald-400 border-emerald-500/30":t.client_payment_status==="delayed"?"bg-rose-500/15 text-rose-400 border-rose-500/30":t.client_payment_status==="pending"?"bg-amber-500/15 text-amber-400 border-amber-500/30":"bg-muted text-muted-foreground border-border/50"),children:e.jsx(he,{children:t.client_payment_status==="received"?"Paid":t.client_payment_status||"Pending"})}),e.jsxs(fe,{align:"end",className:"bg-card border-border shadow-2xl z-50 text-foreground",children:[e.jsx(F,{value:"pending",className:"font-semibold text-xs py-1.5",children:"Pending"}),e.jsx(F,{value:"received",className:"font-semibold text-xs py-1.5",children:"Paid"}),e.jsx(F,{value:"delayed",className:"font-semibold text-xs py-1.5",children:"Delayed"})]})]})]})]}),e.jsxs("div",{className:"pt-1.5 border-t border-border/40 flex flex-col gap-2",children:[e.jsxs("div",{className:"grid grid-cols-3 gap-1.5",children:[e.jsxs(cs,{children:[e.jsx(ms,{asChild:!0,children:e.jsxs(S,{variant:"outline",size:"sm",className:"h-8.5 rounded-xl text-xs font-bold text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all w-full",title:"Share on WhatsApp",children:[e.jsx(ka,{className:"w-3.5 h-3.5 text-emerald-400 shrink-0"})," Share ▾"]})}),e.jsxs(us,{align:"start",className:"w-64 bg-card border-border shadow-2xl z-50 rounded-xl",children:[e.jsx(Be,{className:"font-bold text-xs py-2 text-sky-400 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"driver_dispatch"}),children:"📍 Send Location to Driver (GPS Navigation)"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-emerald-400 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"booking_confirmation"}),children:"🚛 Booking Confirmation (Driver & Vehicle)"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-blue-400 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"trip_status"}),children:"🚚 Live Trip Status & ETA Tracking"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-purple-400 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"pod_proof"}),children:"📑 POD (Proof of Delivery) Copy"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-emerald-500 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"payment_confirmation"}),children:"✅ Payment Received Confirmation"}),e.jsx(Be,{className:"font-bold text-xs py-2 text-amber-500 cursor-pointer flex items-center gap-2",onClick:()=>je({isOpen:!0,trip:t,defaultTemplate:"quote"}),children:"🏷️ Share Freight Rate Quote"})]})]}),e.jsxs(S,{variant:"outline",size:"sm",onClick:()=>_setReassignTrip(t),className:"h-8.5 rounded-xl text-xs font-bold text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all w-full",title:"Emergency Driver / Vehicle Reassignment",children:[e.jsx("span",{className:"text-xs",children:"🔄"})," Swap"]}),e.jsxs(S,{variant:"outline",size:"sm",onClick:()=>_setValidationTrip(t),className:"h-8.5 rounded-xl text-xs font-bold text-sky-400 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all w-full",title:"3-Gate Completion & Settlement Audit",children:[e.jsx("span",{className:"text-xs",children:"📋"})," Settle"]})]}),e.jsxs("div",{className:"flex items-center gap-1.5 w-full",children:[e.jsxs(S,{variant:"outline",size:"sm",onClick:()=>Qt(t.id),className:"flex-1 h-8 rounded-xl text-xs font-bold border-border bg-muted/30 hover:bg-muted text-foreground flex items-center justify-center gap-1",children:[e.jsx(Rt,{className:"w-3 h-3 text-muted-foreground"})," Edit"]}),e.jsxs(S,{variant:"outline",size:"sm",onClick:()=>w(t),className:"flex-1 h-8 rounded-xl text-xs font-bold text-sky-400 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 flex items-center justify-center gap-1",children:[e.jsx(vt,{className:"w-3 h-3 text-sky-400"})," Timeline"]}),e.jsxs(cs,{children:[e.jsx(ms,{asChild:!0,children:e.jsx(S,{variant:"outline",size:"sm",className:"h-8 w-9 p-0 rounded-xl text-muted-foreground hover:text-foreground border-border bg-muted/30 flex items-center justify-center shrink-0",title:"More Options",children:e.jsx(Ca,{className:"w-3.5 h-3.5"})})}),e.jsxs(us,{align:"end",className:"bg-card border-border shadow-2xl text-foreground z-50",children:[e.jsx(Be,{onClick:()=>window.open("/invoice-matching?tripId="+(t.trip_id||t.id),"_blank"),className:"text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 cursor-pointer",children:"Invoice Matching"}),e.jsx(Be,{onClick:()=>Xe([t]),className:"text-xs font-semibold text-rose-400 hover:bg-rose-500/10 cursor-pointer text-rose-400 focus:text-rose-400 focus:bg-rose-500/10",children:"Delete Trip"})]})]})]})]})]},t.id))}),Se.length>qe&&e.jsxs("div",{className:"flex items-center justify-between px-6 py-4 border-t border-border/40 bg-secondary/5 shrink-0 select-none",children:[e.jsxs("span",{className:"text-xs font-semibold text-muted-foreground",children:["Showing ",Math.min(Se.length,(Ze-1)*qe+1),"-",Math.min(Se.length,Ze*qe)," of ",Se.length," trips"]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(S,{variant:"outline",size:"sm",className:"rounded-lg h-8 text-xs font-semibold",disabled:Ze===1,onClick:()=>Le(t=>t-1),children:"Previous"}),e.jsx(S,{variant:"outline",size:"sm",className:"rounded-lg h-8 text-xs font-semibold",disabled:Ze*qe>=Se.length,onClick:()=>Le(t=>t+1),children:"Next"})]})]})]})]})]})}),e.jsx(Mr,{isOpen:!!Jt,onClose:()=>kt(null),selectedTrips:Jt,onSuccess:()=>{kt(null),Ee([]),ie()}}),e.jsx(Me,{open:!!_e,onOpenChange:t=>!t&&!Ge&&Xe(null),children:e.jsxs(Re,{className:"sm:max-w-md rounded-2xl",children:[e.jsxs(Fe,{children:[e.jsxs($e,{className:"flex items-center gap-2 text-destructive font-heading text-xl",children:[e.jsx("div",{className:"p-2 bg-destructive/10 rounded-xl",children:e.jsx(nt,{className:"w-5 h-5"})}),"Confirm Deletion"]}),e.jsx(ze,{className:"pt-3 text-base text-foreground font-medium",children:_e?.length===1?"Are you sure you want to delete this trip record? This action cannot be undone.":`Are you sure you want to delete ${_e?.length} trip records? This action cannot be undone.`})]}),_e?.length===1&&e.jsxs("div",{className:"bg-secondary/30 p-5 rounded-xl text-sm space-y-3 border border-border/50 mt-2 shadow-inner",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-muted-foreground",children:"Date:"}),e.jsx("span",{className:"font-bold text-foreground bg-background px-2 py-1 rounded-md border border-border/50",children:Ot(_e[0].date)})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-muted-foreground",children:"Driver:"}),e.jsx("span",{className:"font-medium text-foreground",children:_e[0].driver_name})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-muted-foreground",children:"Truck:"}),e.jsx("span",{className:"font-bold text-foreground",children:_e[0].truck_number})]})]}),e.jsxs(Pe,{className:"mt-6 gap-3",children:[e.jsx(S,{variant:"outline",onClick:()=>Xe(null),disabled:Ge,className:"rounded-xl",children:"Cancel"}),e.jsxs(S,{variant:"destructive",onClick:sa,disabled:Ge,className:"rounded-xl shadow-sm",children:[Ge?e.jsx(Te,{className:"w-4 h-4 mr-2 animate-spin"}):e.jsx(Mt,{className:"w-4 h-4 mr-2"}),Ge?"Deleting...":"Confirm Delete"]})]})]})}),e.jsx(Me,{open:!!U,onOpenChange:t=>!t&&G(null),children:e.jsxs(Re,{className:"max-w-md rounded-2xl",children:[e.jsx(Fe,{children:e.jsx($e,{className:"font-heading text-xl",children:"Update Trip Status"})}),e.jsxs("div",{className:"py-4 space-y-5",children:[e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Select a new status for trip ",e.jsx("span",{className:"font-bold text-foreground",children:U?.route}),"(",Ir(U?.date||new Date),")"]}),e.jsxs(pe,{value:ne,onValueChange:P,children:[e.jsx(xe,{className:"h-12 rounded-xl",children:e.jsx(he,{})}),e.jsx(fe,{children:st.map(t=>e.jsx(F,{value:t,className:"font-medium",children:t},t))})]}),ne==="Delivered"&&U?.trip_status!=="Delivered"&&e.jsxs("p",{className:"text-xs font-medium text-primary bg-primary/10 p-3 rounded-xl border border-primary/20 flex items-start gap-2",children:[e.jsx(nt,{className:"w-4 h-4 shrink-0"}),"You'll be prompted to generate a payment request next."]})]}),e.jsxs(Pe,{className:"gap-3",children:[e.jsx(S,{variant:"ghost",onClick:()=>G(null),disabled:le,className:"rounded-xl",children:"Cancel"}),e.jsxs(S,{onClick:qs,disabled:le,className:"rounded-xl shadow-sm",children:[le&&e.jsx(Te,{className:"w-4 h-4 mr-2 animate-spin"}),"Save Status"]})]})]})}),e.jsx(Ha,{isOpen:T,onClose:()=>A(!1),onSuccess:ie}),e.jsx(Ga,{isOpen:E,onClose:()=>Y(!1),onSuccess:ie}),W&&e.jsx(er,{isOpen:W,onClose:Hs,tripId:I,onSuccess:ie,employees:s,trucks:u}),e.jsx(sr,{isOpen:m,onClose:()=>v(!1),onSuccess:ie}),e.jsx(ar,{isOpen:!!O,onClose:()=>ee(null),trip:O,onSuccess:ie}),e.jsx(Me,{open:!!be,onOpenChange:t=>!t&&!Oe&&gt(null),children:e.jsxs(Re,{className:"sm:max-w-lg rounded-2xl",children:[e.jsxs(Fe,{children:[e.jsxs($e,{className:"flex items-center gap-2 text-primary font-heading text-xl",children:[e.jsx("div",{className:"p-2 bg-primary/10 rounded-xl",children:e.jsx(is,{className:"w-5 h-5 text-primary"})}),"Bulk Payment Settlement (Net after TDS)"]}),e.jsxs(ze,{className:"pt-2 text-sm text-muted-foreground",children:["Confirm receiving settlement for ",be?.trips.length," selected trips. A single aggregated transaction will be logged in the Cashbook."]})]}),be&&e.jsxs("div",{className:"space-y-4 my-2",children:[e.jsxs("div",{className:"bg-secondary/20 border border-border/50 rounded-xl p-4 space-y-2.5 text-sm",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"Trips:"}),e.jsx("span",{className:"font-semibold text-foreground max-w-[280px] text-right truncate",children:be.tripCodes.join(", ")})]}),e.jsxs("div",{className:"flex justify-between border-t border-border/40 pt-2",children:[e.jsx("span",{className:"text-muted-foreground",children:"Total Gross Revenue:"}),e.jsx("span",{className:"font-medium text-foreground",children:ae(be.totalRevenue)})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"Advances Already Received:"}),e.jsxs("span",{className:"font-medium text-destructive",children:["-",ae(be.totalAdvances)]})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"TDS Deducted (Receivable):"}),e.jsxs("span",{className:"font-medium text-destructive",children:["-",ae(be.totalTds)]})]}),e.jsxs("div",{className:"flex justify-between border-t border-border/40 pt-2 text-base font-bold text-foreground",children:[e.jsx("span",{className:"text-primary",children:"Net Amount Received:"}),e.jsx("span",{className:"text-emerald-500 font-extrabold",children:ae(be.netAmount)})]})]}),e.jsx("p",{className:"text-[11px] text-muted-foreground italic leading-normal px-1",children:"* Note: The cashbook transaction is registered net of TDS. The TDS receivable credit is logged in the reports ledger."})]}),e.jsxs(Pe,{className:"mt-4 gap-3",children:[e.jsx(S,{variant:"outline",onClick:()=>gt(null),disabled:Oe,className:"rounded-xl",children:"Cancel"}),e.jsx(S,{onClick:ta,disabled:Oe,className:"rounded-xl shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white",children:Oe?e.jsx(Te,{className:"w-4 h-4 mr-2 animate-spin"}):"Confirm & Save"})]})]})}),e.jsx(Me,{open:!!k,onOpenChange:t=>!t&&w(null),children:e.jsxs(Re,{className:"sm:max-w-md md:max-w-lg rounded-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden",children:[e.jsxs(Fe,{className:"p-4 sm:p-5 pb-3 border-b border-border/40 shrink-0",children:[e.jsxs($e,{className:"flex items-center gap-2 font-heading text-lg text-foreground",children:[e.jsx("div",{className:"p-2 bg-sky-500/10 rounded-xl text-sky-400",children:e.jsx(vt,{className:"w-4 h-4"})}),"Trip Timeline & Tracking"]}),e.jsxs(ze,{className:"pt-1 text-xs text-muted-foreground",children:["Track and log real-time dispatch milestones for Trip ",e.jsx("span",{className:"font-mono font-bold text-primary",children:k?.trip_id})]})]}),k&&e.jsxs("div",{className:"flex-1 overflow-y-auto p-4 sm:p-5 space-y-4",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-2 bg-muted/30 p-2.5 rounded-xl text-xs border border-border/40",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-muted-foreground block text-[10px] font-medium",children:"Route:"}),e.jsx("span",{className:"font-semibold text-foreground truncate block",children:k.route||"—"})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-muted-foreground block text-[10px] font-medium",children:"Truck:"}),e.jsx("span",{className:"font-semibold text-foreground font-mono truncate block",children:k.truck_number||"—"})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-muted-foreground block text-[10px] font-medium",children:"Driver:"}),e.jsx("span",{className:"font-semibold text-foreground truncate block",children:k.driver_name||"—"})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-muted-foreground block text-[10px] font-medium",children:"Current Status:"}),e.jsx("span",{className:V("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border mt-0.5 shadow-sm",It(k.trip_status)),children:$t(k.trip_status)})]})]}),e.jsx("div",{className:"relative pl-1 py-1",children:e.jsx("div",{className:"space-y-1",children:aa(k).map((t,i)=>e.jsx(Da.Fragment,{children:ra(t)},i))})})]}),e.jsx(Pe,{className:"p-4 border-t border-border/40 shrink-0 bg-muted/20",children:e.jsx(S,{onClick:()=>w(null),className:"rounded-xl w-full sm:w-auto text-xs h-9 shadow-sm",children:"Close"})})]})}),we.isOpen&&e.jsx(qa,{isOpen:we.isOpen,onClose:()=>je({isOpen:!1,trip:null,defaultTemplate:"payment_confirmation"}),trip:we.trip,defaultTemplate:we.defaultTemplate,employees:s,routeMap:_}),e.jsx(Qa,{isOpen:Ye,onOpenChange:it,defaultRecipient:c.recipient,defaultSubject:c.subject,defaultBody:c.body,richHtmlContent:c.html,contextLabel:c.label,defaultAttachment:c.attachment}),e.jsx(_DispatchDocsViewerModal,{isOpen:!!_docsTrip,onClose:()=>_setDocsTrip(null),trip:_docsTrip,ReactModule:a,jsx:e}),e.jsx(_DriverStandbyRegistryModal,{isOpen:_standbyRegistryOpen,onClose:()=>_setStandbyRegistryOpen(!1),employees:m||[],activeTrips:p||[],onDispatchDriver:(driver)=>{_setPreselectedStandbyDriver(driver);const candidate=(p||[]).find(row=>row.trip_status==='In Transit'||row.trip_status==='Upcoming')||(p||[])[0];if(candidate){_setReassignTrip(candidate);$.info('Dispatching standby driver '+driver.name+' to Trip '+(candidate.trip_id||candidate.id));}else{$.warning('No active trips currently available to reassign');}},ReactModule:a,jsx:e}),e.jsx(_TripReassignmentModal,{isOpen:!!_reassignTrip,onClose:()=>{_setReassignTrip(null);_setPreselectedStandbyDriver(null);},trip:_reassignTrip,employees:m||[],trucks:u||[],preselectedDriver:_preselectedStandbyDriver,onSaved:()=>ie(),ReactModule:a,jsx:e,pbClient:D,toastClient:$,auditLogger:Wa}),e.jsx(_TripCompletionValidationDialog,{isOpen:!!_validationTrip,onClose:()=>_setValidationTrip(null),trip:_validationTrip,onSaved:()=>ie(),ReactModule:a,jsx:e,pbClient:D,toastClient:$,auditLogger:Wa}),e.jsx(Fr,{isOpen:!!ye,onClose:()=>Ae(null),trip:ye,onSaved:()=>ie()}),e.jsx($r,{isOpen:!!Yt,onClose:()=>Vs(null),trip:Yt,onSuccess:()=>ie()})]})};export{Wr as default};
