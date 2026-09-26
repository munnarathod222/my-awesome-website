
// FleetEquipmentFullTab.jsx - Production-Ready Roadside Tool Kit & Jack Management
// Full parity with Tyre and Battery tabs: Images, Bills, Specifications, Verification, Stolen Reporting & Swapping

export function getTruckEquipment(truck) {
  let eq = null;
  if (truck && truck.fastag_notes) {
    try {
      const parsed = JSON.parse(truck.fastag_notes);
      if (parsed && (parsed.jack || parsed.wheel_spanner || parsed.tool_box)) {
        eq = parsed;
      }
    } catch (e) {}
  }
  return {
    jack: {
      status: eq?.jack?.status || "present",
      serial: eq?.jack?.serial || "JACK-20T-01",
      brand: eq?.jack?.brand || "20 Ton Hydraulic Bottle Jack + Rod",
      purchase_date: eq?.jack?.purchase_date || "2026-09-01",
      last_verified: eq?.jack?.last_verified || ne(new Date(), "yyyy-MM-dd"),
      verified_by: eq?.jack?.verified_by || truck?.driver_name || "Driver / Supervisor",
      notes: eq?.jack?.notes || "20-Ton heavy lifting bottle jack with 2-piece operating lever rod. Inspected and working properly.",
      images: Array.isArray(eq?.jack?.images) ? eq.jack.images : (eq?.jack?.images ? [eq.jack.images] : []),
      bill: eq?.jack?.bill || null,
      bill_name: eq?.jack?.bill_name || "Jack_Invoice.pdf"
    },
    wheel_spanner: {
      status: eq?.wheel_spanner?.status || "present",
      serial: eq?.wheel_spanner?.serial || "SPAN-3233-01",
      brand: eq?.wheel_spanner?.brand || "32mm x 33mm Heavy Duty Wheel Spanner + Tommy Bar",
      purchase_date: eq?.wheel_spanner?.purchase_date || "2026-09-01",
      last_verified: eq?.wheel_spanner?.last_verified || ne(new Date(), "yyyy-MM-dd"),
      verified_by: eq?.wheel_spanner?.verified_by || truck?.driver_name || "Driver / Supervisor",
      notes: eq?.wheel_spanner?.notes || "Forged carbon steel lug spanner with 3-foot tommy extension pipe for wheel nut torque.",
      images: Array.isArray(eq?.wheel_spanner?.images) ? eq.wheel_spanner.images : (eq?.wheel_spanner?.images ? [eq.wheel_spanner.images] : []),
      bill: eq?.wheel_spanner?.bill || null,
      bill_name: eq?.wheel_spanner?.bill_name || "Wheel_Spanner_Invoice.pdf"
    },
    tool_box: {
      status: eq?.tool_box?.status || "present",
      serial: eq?.tool_box?.serial || "TB-STEEL-01",
      brand: eq?.tool_box?.brand || "Heavy Steel Lockable Tool Box (12-Piece Emergency Repair Kit)",
      purchase_date: eq?.tool_box?.purchase_date || "2026-09-01",
      last_verified: eq?.tool_box?.last_verified || ne(new Date(), "yyyy-MM-dd"),
      verified_by: eq?.tool_box?.verified_by || truck?.driver_name || "Driver / Supervisor",
      notes: eq?.tool_box?.notes || "Padlock-secured steel box containing ring spanners (10-32mm), heavy pliers, wire cutter, hammer, and emergency air hose.",
      images: Array.isArray(eq?.tool_box?.images) ? eq.tool_box.images : (eq?.tool_box?.images ? [eq.tool_box.images] : []),
      bill: eq?.tool_box?.bill || null,
      bill_name: eq?.tool_box?.bill_name || "Tool_Box_Invoice.pdf"
    }
  };
}

export function FleetEquipmentTab({
  truck = null,
  allTrucks = [],
  onOpenSwapModal = null,
  onViewImage = null,
  onSuccess = null
}) {
  const [activeItemKey, setActiveItemKey] = c.useState("jack");
  const [loading, setLoading] = c.useState(false);
  const [equipment, setEquipment] = c.useState(() => getTruckEquipment(truck));
  const [editModalOpen, setEditModalOpen] = c.useState(false);
  const [editForm, setEditForm] = c.useState({
    serial: "",
    brand: "",
    purchase_date: "",
    verified_by: "",
    notes: ""
  });

  const photoInputRef = c.useRef(null);
  const billInputRef = c.useRef(null);

  c.useEffect(() => {
    setEquipment(getTruckEquipment(truck));
  }, [truck]);

  if (!truck) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-card rounded-3xl border border-border/50 max-w-4xl mx-auto">
        Please select a vehicle above to view its roadside emergency equipment and tool kit.
      </div>
    );
  }

  const itemMeta = {
    jack: {
      name: "Hydraulic Jack (10T - 20T)",
      badgeName: "20T Bottle Jack",
      tagline: "Heavy Lifting & Wheel Change Equipment",
      color: "amber",
      defaultDesc: "Omex 20 Ton Heavy Duty Hydraulic Bottle Jack with lever rod"
    },
    wheel_spanner: {
      name: "Wheel Spanner & Tommy Bar",
      badgeName: "32x33mm Spanner",
      tagline: "Wheel Servicing & Lug Nut Torque Kit",
      color: "cyan",
      defaultDesc: "Forged 32mm x 33mm cross wheel spanner with high-tensile tommy bar"
    },
    tool_box: {
      name: "Tool Box & Emergency Repair Kit",
      badgeName: "Steel Tool Chest",
      tagline: "Lockable Heavy Steel Roadside Repair Kit",
      color: "indigo",
      defaultDesc: "12-piece mechanic spanner set, pliers, sledge hammer, air hose"
    }
  };

  const currentItem = equipment[activeItemKey] || equipment.jack;
  const currentMeta = itemMeta[activeItemKey] || itemMeta.jack;
  const isPresent = currentItem.status === "present";

  // Helper to persist equipment updates to PocketBase
  const saveEquipmentToTruck = async (newEquipmentState, successMsg) => {
    setLoading(true);
    try {
      setEquipment(newEquipmentState);
      await j.collection("trucks").update(truck.id, {
        fastag_notes: JSON.stringify(newEquipmentState)
      }, { $autoCancel: false });
      if (successMsg) I.success(successMsg);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to update equipment:", err);
      I.error(err?.message || "Failed to update equipment on vehicle");
    } finally {
      setLoading(false);
    }
  };

  // Toggle present / stolen status
  const handleToggleStatus = async () => {
    const nextStatus = isPresent ? "stolen" : "present";
    const nextNotes = nextStatus === "stolen" 
      ? `Reported STOLEN / MISSING on inspection by ${truck.driver_name || "driver"}`
      : `Verified present and inspected on vehicle by ${truck.driver_name || "supervisor"}`;

    const updated = {
      ...equipment,
      [activeItemKey]: {
        ...currentItem,
        status: nextStatus,
        last_verified: ne(new Date(), "yyyy-MM-dd"),
        notes: nextNotes
      }
    };

    const msg = nextStatus === "stolen"
      ? `Reported ${currentMeta.name} as STOLEN / MISSING!`
      : `Marked ${currentMeta.name} as PRESENT & VERIFIED!`;

    await saveEquipmentToTruck(updated, msg);
  };

  // Open edit modal
  const handleOpenEdit = () => {
    setEditForm({
      serial: currentItem.serial || "",
      brand: currentItem.brand || "",
      purchase_date: currentItem.purchase_date || ne(new Date(), "yyyy-MM-dd"),
      verified_by: currentItem.verified_by || truck.driver_name || "Supervisor",
      notes: currentItem.notes || ""
    });
    setEditModalOpen(true);
  };

  // Save edit form
  const handleSaveEdit = async (eEvent) => {
    eEvent.preventDefault();
    const updated = {
      ...equipment,
      [activeItemKey]: {
        ...currentItem,
        serial: editForm.serial.trim().toUpperCase(),
        brand: editForm.brand.trim() || currentMeta.defaultDesc,
        purchase_date: editForm.purchase_date,
        verified_by: editForm.verified_by.trim(),
        notes: editForm.notes.trim(),
        last_verified: ne(new Date(), "yyyy-MM-dd")
      }
    };
    await saveEquipmentToTruck(updated, "Equipment specifications saved successfully!");
    setEditModalOpen(false);
  };

  // Handle Photo Upload
  const handlePhotoUpload = async (eEvent) => {
    const files = Array.from(eEvent.target.files || []);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const newImages = [];
      for (const file of files) {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              let w = img.width;
              let h = img.height;
              const maxDim = 1000;
              if (w > maxDim || h > maxDim) {
                if (w > h) {
                  h = Math.round((h * maxDim) / w);
                  w = maxDim;
                } else {
                  w = Math.round((w * maxDim) / h);
                  h = maxDim;
                }
              }
              const canvas = document.createElement("canvas");
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0, w, h);
              resolve(canvas.toDataURL("image/jpeg", 0.72));
            };
            img.onerror = () => resolve(e.target.result);
            img.src = e.target.result;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newImages.push(dataUrl);
      }

      const existing = Array.isArray(currentItem.images) ? currentItem.images : [];
      const updated = {
        ...equipment,
        [activeItemKey]: {
          ...currentItem,
          images: [...existing, ...newImages]
        }
      };

      await saveEquipmentToTruck(updated, `Uploaded ${newImages.length} equipment snapshot(s)!`);
    } catch (err) {
      console.error("Photo upload error:", err);
      I.error("Failed to upload equipment photo");
    } finally {
      if (photoInputRef.current) photoInputRef.current.value = "";
      setLoading(false);
    }
  };

  // Delete photo
  const handleDeletePhoto = async (indexToRemove) => {
    const existing = Array.isArray(currentItem.images) ? currentItem.images : [];
    const updatedImages = existing.filter((_, idx) => idx !== indexToRemove);
    const updated = {
      ...equipment,
      [activeItemKey]: {
        ...currentItem,
        images: updatedImages
      }
    };
    await saveEquipmentToTruck(updated, "Photo deleted");
  };

  // Handle Bill Upload
  const handleBillUpload = async (eEvent) => {
    const file = eEvent.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const updated = {
        ...equipment,
        [activeItemKey]: {
          ...currentItem,
          bill: dataUrl,
          bill_name: file.name
        }
      };

      await saveEquipmentToTruck(updated, "Purchase bill / invoice uploaded successfully!");
    } catch (err) {
      console.error("Bill upload error:", err);
      I.error("Failed to upload invoice bill");
    } finally {
      if (billInputRef.current) billInputRef.current.value = "";
      setLoading(false);
    }
  };

  // Delete bill
  const handleDeleteBill = async () => {
    const updated = {
      ...equipment,
      [activeItemKey]: {
        ...currentItem,
        bill: null,
        bill_name: ""
      }
    };
    await saveEquipmentToTruck(updated, "Bill removed");
  };

  // Check overall missing status
  const anyMissing = Object.values(equipment).some(item => item.status === "stolen" || item.status === "missing");

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* 3 Equipment Sub-tabs Navigation */}
      <div className="flex items-center justify-between gap-3 p-1.5 bg-card rounded-2xl border border-border/60 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {["jack", "wheel_spanner", "tool_box"].map((k) => {
            const meta = itemMeta[k];
            const item = equipment[k];
            const isItemPresent = item?.status === "present";
            const isActive = activeItemKey === k;

            return (
              <button
                key={k}
                type="button"
                onClick={() => setActiveItemKey(k)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <span>{meta.name}</span>
                <span className={`w-2 h-2 rounded-full ${
                  isItemPresent ? "bg-emerald-400" : "bg-rose-500 animate-pulse"
                }`} />
              </button>
            );
          })}
        </div>

        {/* Global Swap / Transfer Button */}
        <button
          type="button"
          onClick={() => onOpenSwapModal && onOpenSwapModal(activeItemKey)}
          className="py-1.5 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
        >
          <Q className="w-3.5 h-3.5" />
          <span>⇄ Swap Across Trucks</span>
        </button>
      </div>

      {/* Main Card (Matching Battery Spec Card Layout 1:1) */}
      <X className="p-6 border-border/60 shadow-sm rounded-3xl bg-card space-y-6">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl border ${
              isPresent
                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-500"
                : "bg-rose-500/10 border-rose-500/20 text-rose-500"
            }`}>
              <as className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-heading text-foreground">
                  {currentMeta.name}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                  isPresent
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse"
                }`}>
                  {isPresent ? "✓ Present on Vehicle" : "🚨 Stolen / Missing"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Vehicle: <span className="font-semibold text-foreground">{truck.truck_number}</span> • {currentMeta.tagline}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {isPresent ? (
              <button
                type="button"
                disabled={loading}
                onClick={handleToggleStatus}
                className="py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                🚨 Report Stolen
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleToggleStatus}
                className="py-1.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                ✓ Mark Present
              </button>
            )}

            <_
              size="sm"
              onClick={handleOpenEdit}
              className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-sm"
            >
              Edit Details
            </_>

            <_
              size="sm"
              onClick={() => onOpenSwapModal && onOpenSwapModal(activeItemKey)}
              className="rounded-xl bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold gap-1.5"
            >
              <Q className="w-3.5 h-3.5 text-indigo-500" />
              Swap / Transfer
            </_>
          </div>
        </div>

        {/* 2-Column Grid (Exactly matching Battery tab) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Specifications & Warranty */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-2xl border border-border/40">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Serial / Stamp #
                </span>
                <span className="font-mono text-sm font-bold text-foreground truncate block">
                  {currentItem.serial || "Unstamped / NA"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Purchase Date
                </span>
                <span className="text-sm font-bold text-foreground block">
                  {currentItem.purchase_date || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Model / Capacity
                </span>
                <span className="text-xs font-semibold text-foreground truncate block" title={currentItem.brand}>
                  {currentItem.brand || currentMeta.defaultDesc}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Last Verified By
                </span>
                <span className="text-xs font-semibold text-foreground truncate block">
                  {currentItem.verified_by || "Driver"} ({currentItem.last_verified || "Today"})
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1.5">
                Condition Notes &amp; Handover Details
              </span>
              <p className="text-xs text-foreground bg-muted/30 p-3.5 rounded-2xl border border-border/50 min-h-[60px] whitespace-pre-line leading-relaxed font-medium">
                {currentItem.notes || "No condition notes recorded."}
              </p>
            </div>
          </div>

          {/* Right Column: Snapshots & Purchase Bill (Identical to Battery) */}
          <div className="space-y-4">
            {/* Snapshots / Physical Photos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Equipment Snapshots ({currentItem.images?.length || 0})
                </span>
                <label className="text-[11px] font-bold text-cyan-500 hover:text-cyan-400 cursor-pointer flex items-center gap-1">
                  <Te className="w-3.5 h-3.5" />
                  <span>+ Upload Photo</span>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {currentItem.images && currentItem.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {currentItem.images.map((imgSrc, idx) => (
                    <div
                      key={idx}
                      className="aspect-video rounded-xl overflow-hidden border border-border bg-muted/10 relative cursor-pointer group"
                    >
                      <img
                        src={imgSrc}
                        alt={`Snapshot ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onClick={() => {
                          if (onViewImage) {
                            onViewImage({
                              id: truck.id,
                              collectionName: "trucks",
                              file: imgSrc,
                              document_type: `${currentMeta.name} Snapshot`,
                              document_number: currentItem.serial || "N/A"
                            });
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            if (onViewImage) {
                              onViewImage({
                                id: truck.id,
                                collectionName: "trucks",
                                file: imgSrc,
                                document_type: `${currentMeta.name} Snapshot`,
                                document_number: currentItem.serial || "N/A"
                              });
                            }
                          }}
                          className="p-1.5 bg-black/60 hover:bg-black/90 text-white rounded-lg"
                          title="View Full Size"
                        >
                          <ke className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePhoto(idx);
                          }}
                          className="p-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg"
                          title="Delete Photo"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="w-full aspect-video rounded-2xl border border-dashed border-border/60 bg-muted/10 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-muted/20 transition"
                >
                  <Te className="w-5 h-5 text-muted-foreground/60" />
                  <span className="text-xs text-muted-foreground">Click to upload equipment photos</span>
                </div>
              )}
            </div>

            {/* Purchase Invoice / Bill */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Purchase Invoice / Bill
                </span>
                <label className="text-[11px] font-bold text-cyan-500 hover:text-cyan-400 cursor-pointer flex items-center gap-1">
                  <Te className="w-3.5 h-3.5" />
                  <span>{currentItem.bill ? "Replace Bill" : "+ Upload Bill"}</span>
                  <input
                    ref={billInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleBillUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {currentItem.bill ? (
                <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border/50 rounded-2xl">
                  <div className="p-2 bg-cyan-500/10 rounded-xl shrink-0 text-cyan-500">
                    {currentItem.bill_name?.toLowerCase().endsWith(".pdf") ? (
                      <_e className="w-5 h-5" />
                    ) : (
                      <Ne className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {currentItem.bill_name || "Equipment_Invoice.pdf"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {currentItem.bill_name?.toLowerCase().endsWith(".pdf") ? "PDF Document" : "Image Invoice"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={currentItem.bill}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl text-muted-foreground hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors"
                      title="View / Download"
                    >
                      <ke className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={handleDeleteBill}
                      className="p-2 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Remove Bill"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => billInputRef.current?.click()}
                  className="flex items-center gap-2 p-3.5 bg-muted/20 border border-dashed border-border/50 rounded-2xl cursor-pointer hover:bg-muted/30 transition"
                >
                  <Ne className="w-4 h-4 text-muted-foreground/50" />
                  <span className="text-xs text-muted-foreground">No bill uploaded yet. Click to attach invoice.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </X>

      {/* Edit Details Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-[480px] bg-card border border-border/60 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border/50 pb-3">
              <div>
                <h4 className="text-lg font-bold font-heading text-foreground">
                  Edit {currentMeta.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Vehicle: {truck.truck_number}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 py-1">
              <div className="space-y-1">
                <b className="text-xs font-semibold">Serial / Stamp Tag # *</b>
                <R
                  value={editForm.serial}
                  onChange={(e) => setEditForm({ ...editForm, serial: e.target.value })}
                  className="text-xs h-9 rounded-xl font-mono uppercase"
                  placeholder="e.g. JACK-20T-01"
                  required
                />
              </div>

              <div className="space-y-1">
                <b className="text-xs font-semibold">Model / Specs / Brand</b>
                <R
                  value={editForm.brand}
                  onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                  className="text-xs h-9 rounded-xl"
                  placeholder="e.g. Omex 20 Ton Hydraulic"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <b className="text-xs font-semibold">Purchase Date</b>
                  <R
                    type="date"
                    value={editForm.purchase_date}
                    onChange={(e) => setEditForm({ ...editForm, purchase_date: e.target.value })}
                    className="text-xs h-9 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <b className="text-xs font-semibold">Verified By</b>
                  <R
                    value={editForm.verified_by}
                    onChange={(e) => setEditForm({ ...editForm, verified_by: e.target.value })}
                    className="text-xs h-9 rounded-xl"
                    placeholder="Inspector / Driver"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <b className="text-xs font-semibold">Condition Notes &amp; Handover Details</b>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-background border border-border font-medium focus:ring-2 focus:ring-primary/20 min-h-[70px]"
                  placeholder="Enter equipment condition, accessories included, or driver handover remarks..."
                />
              </div>

              <div className="pt-3 border-t border-border/50 flex justify-end gap-2">
                <_
                  type="button"
                  variant="ghost"
                  onClick={() => setEditModalOpen(false)}
                  disabled={loading}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </_>
                <_
                  type="submit"
                  disabled={loading}
                  className="rounded-xl shadow-sm text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                  {loading && <Qe className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  Save Details
                </_>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


export function CrossTruckTyreSwapModal({
  isOpen,
  onClose,
  allTrucks = [],
  currentTruck = null,
  currentTyres = [],
  preselectedTyre = null,
  onSuccess
}) {
  const [mode, setMode] = c.useState("swap");
  const [loading, setLoading] = c.useState(false);
  const [sourceTyreId, setSourceTyreId] = c.useState("");
  const [targetTruckId, setTargetTruckId] = c.useState("");
  const [targetPosition, setTargetPosition] = c.useState("front_left");
  const [odometerReading, setOdometerReading] = c.useState("");
  const [swapReason, setSwapReason] = c.useState("Fleet Tyre Reallocation & Axle Wear Balancing");
  
  const [newBrand, setNewBrand] = c.useState("MRF");
  const [newModel, setNewModel] = c.useState("Steel Muscle");
  const [newSerial, setNewSerial] = c.useState("");
  const [newDepth, setNewDepth] = c.useState("15.0");
  const [newPurchaseDate, setNewPurchaseDate] = c.useState(ne(new Date(), "yyyy-MM-dd"));
  const [newCost, setNewCost] = c.useState("");

  const [showQuickAddTruck, setShowQuickAddTruck] = c.useState(false);
  const [quickTruckNumber, setQuickTruckNumber] = c.useState("");
  const [quickTruckName, setQuickTruckName] = c.useState("");

  c.useEffect(() => {
    if (isOpen) {
      const activeTyres = currentTyres.filter(t => t.status !== "replaced" && t.tyre_position);
      setSourceTyreId(preselectedTyre?.id || (activeTyres.length > 0 ? activeTyres[0].id : ""));
      
      const otherTrucks = allTrucks.filter(t => t.id !== currentTruck?.id);
      if (otherTrucks.length > 0) {
        setTargetTruckId(otherTrucks[0].id);
        setShowQuickAddTruck(false);
      } else {
        setTargetTruckId("inventory");
      }
      setOdometerReading("");
      setNewSerial("");
      setQuickTruckNumber("");
      setQuickTruckName("");
    }
  }, [isOpen, preselectedTyre, currentTyres, allTrucks, currentTruck]);

  if (!isOpen) return null;

  const activeTyres = currentTyres.filter(t => t.status !== "replaced" && t.tyre_position);
  const selectedSourceTyre = activeTyres.find(t => t.id === sourceTyreId);
  const otherTrucks = allTrucks.filter(t => t.id !== currentTruck?.id);

  const handleSubmit = async (eEvent) => {
    eEvent.preventDefault();
    if (!selectedSourceTyre) {
      I.error("Please select a tyre from the current truck to swap/move.");
      return;
    }
    if (mode === "transfer_replace" && !newSerial.trim()) {
      I.error("Please provide the serial number for the new tyre being installed.");
      return;
    }

    setLoading(true);
    try {
      let finalTargetTruckId = targetTruckId;
      let finalTargetTruck = otherTrucks.find(t => t.id === finalTargetTruckId);

      if (showQuickAddTruck || finalTargetTruckId === "new_truck") {
        if (!quickTruckNumber.trim()) {
          I.error("Please enter the vehicle registration number for the new truck.");
          setLoading(false);
          return;
        }
        const createdTruck = await j.collection("trucks").create({
          truck_number: quickTruckNumber.trim().toUpperCase(),
          truck_name: quickTruckName.trim() || "Secondary Truck",
          tyre_count: 6,
          ownership_type: "Owned"
        }, { $autoCancel: false });
        finalTargetTruckId = createdTruck.id;
        finalTargetTruck = createdTruck;
      }

      const targetPosObj = W.find(w => w.id === targetPosition);
      const targetAxle = targetPosObj ? targetPosObj.axle : "single_axle";
      const sourcePosObj = W.find(w => w.id === selectedSourceTyre.tyre_position);
      const sourceAxle = sourcePosObj ? sourcePosObj.axle : "single_axle";

      if (finalTargetTruckId === "inventory") {
        await j.collection("tyres").update(selectedSourceTyre.id, {
          truck_id: "",
          tyre_position: "stepney",
          axle_position: "stepney",
          status: "spare"
        }, { $autoCancel: false });

        if (mode === "transfer_replace") {
          await j.collection("tyres").create({
            truck_id: currentTruck.id,
            tyre_position: selectedSourceTyre.tyre_position,
            axle_position: sourceAxle,
            tyre_brand: newBrand,
            model_no: newModel,
            serial_number: newSerial.trim().toUpperCase(),
            tyre_depth_mm: parseFloat(newDepth || "15.0"),
            purchase_date: newPurchaseDate ? `${newPurchaseDate} 00:00:00.000Z` : new Date().toISOString(),
            status: "active",
            current_lifecycle_kms: 0,
            assignment_start_kms: Number(odometerReading || 0)
          }, { $autoCancel: false });
        }
        I.success(`Tyre ${selectedSourceTyre.serial_number} moved to Standby Yard / Spare inventory!`);
      } else {
        const targetTyres = await j.collection("tyres").getFullList({
          filter: `truck_id = "${finalTargetTruckId}" && status != "replaced"`,
          $autoCancel: false
        }).catch(() => []);
        const targetOccupant = targetTyres.find(t => t.tyre_position === targetPosition);

        if (mode === "swap") {
          await j.collection("tyres").update(selectedSourceTyre.id, {
            truck_id: finalTargetTruckId,
            tyre_position: targetPosition,
            axle_position: targetAxle
          }, { $autoCancel: false });

          if (targetOccupant) {
            await j.collection("tyres").update(targetOccupant.id, {
              truck_id: currentTruck.id,
              tyre_position: selectedSourceTyre.tyre_position,
              axle_position: sourceAxle
            }, { $autoCancel: false });
          }

          try {
            await j.collection("tyre_rotations").create({
              truck_id: currentTruck.id,
              tyre1_id: selectedSourceTyre.id,
              tyre2_id: targetOccupant ? targetOccupant.id : null,
              from_position1: selectedSourceTyre.tyre_position,
              to_position1: targetPosition,
              from_position2: targetOccupant ? targetPosition : "",
              to_position2: targetOccupant ? selectedSourceTyre.tyre_position : "",
              swap_odometer_reading: Number(odometerReading || 0),
              swap_date: new Date().toISOString()
            }, { $autoCancel: false });
          } catch (rotErr) {
            console.warn("Rotation logging notice:", rotErr);
          }

          I.success(`Successfully swapped tyre ${selectedSourceTyre.serial_number} with ${finalTargetTruck ? finalTargetTruck.truck_number : 'other truck'}!`);
        } else {
          await j.collection("tyres").update(selectedSourceTyre.id, {
            truck_id: finalTargetTruckId,
            tyre_position: targetPosition,
            axle_position: targetAxle
          }, { $autoCancel: false });

          if (targetOccupant) {
            await j.collection("tyres").update(targetOccupant.id, {
              tyre_position: "stepney",
              axle_position: "stepney"
            }, { $autoCancel: false });
          }

          await j.collection("tyres").create({
            truck_id: currentTruck.id,
            tyre_position: selectedSourceTyre.tyre_position,
            axle_position: sourceAxle,
            tyre_brand: newBrand,
            model_no: newModel,
            serial_number: newSerial.trim().toUpperCase(),
            tyre_depth_mm: parseFloat(newDepth || "15.0"),
            purchase_date: newPurchaseDate ? `${newPurchaseDate} 00:00:00.000Z` : new Date().toISOString(),
            status: "active",
            current_lifecycle_kms: 0,
            assignment_start_kms: Number(odometerReading || 0)
          }, { $autoCancel: false });

          try {
            await j.collection("tyre_rotations").create({
              truck_id: currentTruck.id,
              tyre1_id: selectedSourceTyre.id,
              from_position1: selectedSourceTyre.tyre_position,
              to_position1: targetPosition,
              swap_odometer_reading: Number(odometerReading || 0),
              swap_date: new Date().toISOString()
            }, { $autoCancel: false });
          } catch (rotErr) {
            console.warn("Rotation logging notice:", rotErr);
          }

          I.success(`Moved tyre to ${finalTargetTruck ? finalTargetTruck.truck_number : 'target'} & fitted new tyre ${newSerial.toUpperCase()} on ${currentTruck.truck_number}!`);
        }
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Tyre swap failure:", err);
      I.error(err?.message || "Failed to execute cross-truck tyre swap");
    } finally {
      setLoading(false);
    }
  };

  return (
    <je open={isOpen} onOpenChange={(openState) => !openState && !loading && onClose()}>
      <ye className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto rounded-3xl border-border/60 shadow-xl bg-card">
        <Me className="pb-3 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 rounded-2xl text-indigo-500 border border-indigo-500/20">
              <Q className="w-5 h-5" />
            </div>
            <div>
              <Ce className="text-xl font-heading font-bold text-foreground">
                Fleet Tyre Swapping &amp; Transfer
              </Ce>
              <xs className="text-xs text-muted-foreground">
                Swap tyres between trucks or move a tyre to another vehicle and fit a fresh one.
              </xs>
            </div>
          </div>
        </Me>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/30 rounded-2xl border border-border/50">
            <button
              type="button"
              onClick={() => setMode("swap")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                mode === "swap"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Q className="w-3.5 h-3.5" />
              ⇄ Two-Way Swap
            </button>
            <button
              type="button"
              onClick={() => setMode("transfer_replace")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                mode === "transfer_replace"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Le className="w-3.5 h-3.5" />
              → Move &amp; Fit New Tyre
            </button>
          </div>

          <div className="p-3.5 bg-muted/20 border border-border/50 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                <Oe className="w-3.5 h-3.5" /> Source Vehicle: {currentTruck?.truck_number || "Current"}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">{activeTyres.length} tyres available</span>
            </div>

            <div className="space-y-1.5">
              <b className="text-xs font-semibold">Select Tyre to Swap / Move</b>
              <select
                value={sourceTyreId}
                onChange={(e) => setSourceTyreId(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-background border border-border rounded-xl font-medium focus:ring-2 focus:ring-primary/20"
                required
              >
                {activeTyres.map((t) => {
                  const pos = W.find(w => w.id === t.tyre_position);
                  return (
                    <option key={t.id} value={t.id}>
                      [{pos ? pos.label : t.tyre_position}] {t.tyre_brand} - SN: {t.serial_number} ({t.tyre_depth_mm || 15}mm)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="p-3.5 bg-muted/20 border border-border/50 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1">
                <Oe className="w-3.5 h-3.5" /> Destination Vehicle &amp; Axle
              </span>
              {otherTrucks.length === 0 && !showQuickAddTruck && (
                <button
                  type="button"
                  onClick={() => setShowQuickAddTruck(true)}
                  className="text-[10px] text-primary hover:underline font-bold"
                >
                  + Add 2nd Truck
                </button>
              )}
            </div>

            {showQuickAddTruck ? (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-primary">Register Destination Truck</span>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddTruck(false)}
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <R
                    placeholder="Reg No (e.g. TG12AB1234)"
                    value={quickTruckNumber}
                    onChange={(e) => setQuickTruckNumber(e.target.value)}
                    className="text-xs h-8 rounded-lg uppercase"
                    required
                  />
                  <R
                    placeholder="Truck Name / Model"
                    value={quickTruckName}
                    onChange={(e) => setQuickTruckName(e.target.value)}
                    className="text-xs h-8 rounded-lg"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1.5">
                  <b className="text-xs font-semibold">Target Vehicle</b>
                  <select
                    value={targetTruckId}
                    onChange={(e) => {
                      if (e.target.value === "new_truck") {
                        setShowQuickAddTruck(true);
                      } else {
                        setTargetTruckId(e.target.value);
                      }
                    }}
                    className="w-full h-9 px-3 text-xs bg-background border border-border rounded-xl font-medium focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    {otherTrucks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.truck_number} {t.truck_name ? `(${t.truck_name})` : ""}
                      </option>
                    ))}
                    <option value="inventory">Standby Yard / Spare Inventory</option>
                    <option value="new_truck">+ Quick Register New Truck...</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <b className="text-xs font-semibold">Target Position</b>
                  <select
                    value={targetPosition}
                    onChange={(e) => setTargetPosition(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-background border border-border rounded-xl font-medium focus:ring-2 focus:ring-primary/20"
                    disabled={targetTruckId === "inventory"}
                  >
                    {W.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {mode === "transfer_replace" && (
            <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
              <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                <Te className="w-3.5 h-3.5" /> Fit Brand-New Tyre on {currentTruck?.truck_number} ({selectedSourceTyre?.tyre_position || "Vacated Slot"})
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <b className="text-[11px] font-semibold">Brand</b>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full h-8 px-2 text-xs bg-background border border-border rounded-lg"
                  >
                    <option value="MRF">MRF</option>
                    <option value="Apollo">Apollo</option>
                    <option value="JK Tyre">JK Tyre</option>
                    <option value="CEAT">CEAT</option>
                    <option value="Bridgestone">Bridgestone</option>
                    <option value="Michelin">Michelin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <b className="text-[11px] font-semibold">Model / Pattern</b>
                  <R
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="text-xs h-8 rounded-lg"
                    placeholder="e.g. Steel Muscle 99"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <b className="text-[11px] font-semibold">New Serial # *</b>
                  <R
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    className="text-xs h-8 rounded-lg font-mono uppercase"
                    placeholder="e.g. 58364019201"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <b className="text-[11px] font-semibold">Initial Tread (mm)</b>
                  <R
                    type="number"
                    step="0.1"
                    value={newDepth}
                    onChange={(e) => setNewDepth(e.target.value)}
                    className="text-xs h-8 rounded-lg"
                    placeholder="15.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <b className="text-[11px] font-semibold">Purchase Date</b>
                  <R
                    type="date"
                    value={newPurchaseDate}
                    onChange={(e) => setNewPurchaseDate(e.target.value)}
                    className="text-xs h-8 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <b className="text-[11px] font-semibold">Purchase Cost (₹, optional)</b>
                  <R
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="text-xs h-8 rounded-lg"
                    placeholder="e.g. 24500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <b className="text-xs font-semibold">Current Odometer (KM)</b>
              <R
                type="number"
                value={odometerReading}
                onChange={(e) => setOdometerReading(e.target.value)}
                className="text-xs h-9 rounded-xl font-mono"
                placeholder="e.g. 145830"
              />
            </div>
            <div className="space-y-1.5">
              <b className="text-xs font-semibold">Swap Reason / Notes</b>
              <R
                value={swapReason}
                onChange={(e) => setSwapReason(e.target.value)}
                className="text-xs h-9 rounded-xl"
                placeholder="Reason for swap"
              />
            </div>
          </div>

          <Se className="pt-2 border-t border-border/50 flex items-center justify-end gap-2">
            <_ type="button" variant="ghost" onClick={onClose} disabled={loading} className="rounded-xl text-xs">
              Cancel
            </_>
            <_
              type="submit"
              disabled={loading}
              className="rounded-xl shadow-sm text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
            >
              {loading && <Qe className="w-3.5 h-3.5 animate-spin" />}
              {mode === "swap" ? "Confirm Cross-Truck Swap" : "Confirm Move & Fit New Tyre"}
            </_>
          </Se>
        </form>
      </ye>
    </je>
  );
}

export function CrossTruckBatterySwapModal({
  isOpen,
  onClose,
  allTrucks = [],
  currentTruck = null,
  onSuccess
}) {
  const [mode, setMode] = c.useState("swap");
  const [loading, setLoading] = c.useState(false);
  const [targetTruckId, setTargetTruckId] = c.useState("");
  const [swapDate, setSwapDate] = c.useState(ne(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = c.useState("Battery rotated between fleet vehicles");

  const [newSerial, setNewSerial] = c.useState("");
  const [newBrand, setNewBrand] = c.useState("Amaron");
  const [newWarranty, setNewWarranty] = c.useState("24 Months Replacement");
  const [newPurchaseDate, setNewPurchaseDate] = c.useState(ne(new Date(), "yyyy-MM-dd"));

  const [showQuickAddTruck, setShowQuickAddTruck] = c.useState(false);
  const [quickTruckNumber, setQuickTruckNumber] = c.useState("");
  const [quickTruckName, setQuickTruckName] = c.useState("");

  c.useEffect(() => {
    if (isOpen) {
      const otherTrucks = allTrucks.filter(t => t.id !== currentTruck?.id);
      if (otherTrucks.length > 0) {
        setTargetTruckId(otherTrucks[0].id);
        setShowQuickAddTruck(false);
      } else {
        setTargetTruckId("new_truck");
        setShowQuickAddTruck(true);
      }
      setNewSerial("");
      setQuickTruckNumber("");
      setQuickTruckName("");
    }
  }, [isOpen, allTrucks, currentTruck]);

  if (!isOpen) return null;

  const otherTrucks = allTrucks.filter(t => t.id !== currentTruck?.id);
  const selectedTargetTruck = otherTrucks.find(t => t.id === targetTruckId);

  const handleSubmit = async (eEvent) => {
    eEvent.preventDefault();
    if (!currentTruck) {
      I.error("No active truck selected.");
      return;
    }
    if (mode === "transfer_replace" && !newSerial.trim()) {
      I.error("Please enter the new battery serial number.");
      return;
    }

    setLoading(true);
    try {
      let finalTargetTruckId = targetTruckId;
      let finalTargetTruck = selectedTargetTruck;

      if (showQuickAddTruck || finalTargetTruckId === "new_truck") {
        if (!quickTruckNumber.trim()) {
          I.error("Please enter the vehicle registration number for the second truck.");
          setLoading(false);
          return;
        }
        const createdTruck = await j.collection("trucks").create({
          truck_number: quickTruckNumber.trim().toUpperCase(),
          truck_name: quickTruckName.trim() || "Secondary Truck",
          tyre_count: 6,
          ownership_type: "Owned"
        }, { $autoCancel: false });
        finalTargetTruckId = createdTruck.id;
        finalTargetTruck = createdTruck;
      }

      if (!finalTargetTruck) {
        I.error("Please select a target truck.");
        setLoading(false);
        return;
      }

      if (mode === "swap") {
        const truckABattery = {
          battery_serial_number: currentTruck.battery_serial_number || "",
          battery_purchase_date: currentTruck.battery_purchase_date || "",
          battery_warranty_details: currentTruck.battery_warranty_details || ""
        };
        const truckBBattery = {
          battery_serial_number: finalTargetTruck.battery_serial_number || "",
          battery_purchase_date: finalTargetTruck.battery_purchase_date || "",
          battery_warranty_details: finalTargetTruck.battery_warranty_details || ""
        };

        await j.collection("trucks").update(currentTruck.id, {
          battery_serial_number: truckBBattery.battery_serial_number,
          battery_purchase_date: truckBBattery.battery_purchase_date,
          battery_warranty_details: truckBBattery.battery_warranty_details
        }, { $autoCancel: false });

        await j.collection("trucks").update(finalTargetTruckId, {
          battery_serial_number: truckABattery.battery_serial_number,
          battery_purchase_date: truckABattery.battery_purchase_date,
          battery_warranty_details: truckABattery.battery_warranty_details
        }, { $autoCancel: false });

        I.success(`Swapped batteries between ${currentTruck.truck_number} and ${finalTargetTruck.truck_number}!`);
      } else {
        const oldBattery = {
          battery_serial_number: currentTruck.battery_serial_number || "",
          battery_purchase_date: currentTruck.battery_purchase_date || "",
          battery_warranty_details: currentTruck.battery_warranty_details || ""
        };

        await j.collection("trucks").update(finalTargetTruckId, {
          battery_serial_number: oldBattery.battery_serial_number,
          battery_purchase_date: oldBattery.battery_purchase_date,
          battery_warranty_details: oldBattery.battery_warranty_details
        }, { $autoCancel: false });

        await j.collection("trucks").update(currentTruck.id, {
          battery_serial_number: newSerial.trim().toUpperCase(),
          battery_purchase_date: newPurchaseDate ? `${newPurchaseDate} 00:00:00.000Z` : new Date().toISOString(),
          battery_warranty_details: `${newWarranty}${newBrand ? ` (${newBrand})` : ""}`
        }, { $autoCancel: false });

        I.success(`Moved battery to ${finalTargetTruck.truck_number} & installed new battery (${newSerial.toUpperCase()}) on ${currentTruck.truck_number}!`);
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Battery swap failure:", err);
      I.error(err?.message || "Failed to execute battery swap");
    } finally {
      setLoading(false);
    }
  };

  return (
    <je open={isOpen} onOpenChange={(openState) => !openState && !loading && onClose()}>
      <ye className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto rounded-3xl border-border/60 shadow-xl bg-card">
        <Me className="pb-3 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20">
              <Re className="w-5 h-5" />
            </div>
            <div>
              <Ce className="text-xl font-heading font-bold text-foreground">
                Fleet Battery Swapping &amp; Transfer
              </Ce>
              <xs className="text-xs text-muted-foreground">
                Swap batteries between vehicles or transfer current battery to another truck and install a new unit.
              </xs>
            </div>
          </div>
        </Me>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/30 rounded-2xl border border-border/50">
            <button
              type="button"
              onClick={() => setMode("swap")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                mode === "swap"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Q className="w-3.5 h-3.5" />
              ⇄ Two-Way Battery Swap
            </button>
            <button
              type="button"
              onClick={() => setMode("transfer_replace")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                mode === "transfer_replace"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Le className="w-3.5 h-3.5" />
              → Move &amp; Install New Battery
            </button>
          </div>

          <div className="p-3 bg-muted/20 border border-border/50 rounded-2xl space-y-1.5">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
              <Re className="w-3.5 h-3.5" /> Current Battery on {currentTruck?.truck_number}
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground block">Serial Number:</span>
                <span className="font-mono font-bold text-foreground">
                  {currentTruck?.battery_serial_number || "None / 0"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Warranty Details:</span>
                <span className="font-medium text-foreground">
                  {currentTruck?.battery_warranty_details || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-muted/20 border border-border/50 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1">
                <Oe className="w-3.5 h-3.5" /> Destination Vehicle
              </span>
              {otherTrucks.length === 0 && !showQuickAddTruck && (
                <button
                  type="button"
                  onClick={() => setShowQuickAddTruck(true)}
                  className="text-[10px] text-primary hover:underline font-bold"
                >
                  + Add 2nd Truck
                </button>
              )}
            </div>

            {showQuickAddTruck ? (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-primary">Register Destination Truck</span>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddTruck(false)}
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <R
                    placeholder="Reg No (e.g. TG12AB1234)"
                    value={quickTruckNumber}
                    onChange={(e) => setQuickTruckNumber(e.target.value)}
                    className="text-xs h-8 rounded-lg uppercase"
                    required
                  />
                  <R
                    placeholder="Truck Name / Model"
                    value={quickTruckName}
                    onChange={(e) => setQuickTruckName(e.target.value)}
                    className="text-xs h-8 rounded-lg"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <select
                  value={targetTruckId}
                  onChange={(e) => {
                    if (e.target.value === "new_truck") {
                      setShowQuickAddTruck(true);
                    } else {
                      setTargetTruckId(e.target.value);
                    }
                  }}
                  className="w-full h-9 px-3 text-xs bg-background border border-border rounded-xl font-medium focus:ring-2 focus:ring-primary/20"
                  required
                >
                  {otherTrucks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.truck_number} {t.truck_name ? `(${t.truck_name})` : ""} - Battery: {t.battery_serial_number || "None"}
                    </option>
                  ))}
                  <option value="new_truck">+ Quick Register New Truck...</option>
                </select>
              </div>
            )}
          </div>

          {mode === "transfer_replace" && (
            <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
              <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                <Re className="w-3.5 h-3.5" /> Install Brand-New Battery on {currentTruck?.truck_number}
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <b className="text-[11px] font-semibold">New Battery Serial # *</b>
                  <R
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    className="text-xs h-8 rounded-lg font-mono uppercase"
                    placeholder="e.g. AMARON-150AH-01"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <b className="text-[11px] font-semibold">Battery Brand</b>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full h-8 px-2 text-xs bg-background border border-border rounded-lg"
                  >
                    <option value="Amaron">Amaron</option>
                    <option value="Exide">Exide</option>
                    <option value="Tata Green">Tata Green</option>
                    <option value="SF Sonic">SF Sonic</option>
                    <option value="PowerZone">PowerZone</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <b className="text-[11px] font-semibold">Warranty Details</b>
                  <R
                    value={newWarranty}
                    onChange={(e) => setNewWarranty(e.target.value)}
                    className="text-xs h-8 rounded-lg"
                    placeholder="e.g. 24 Months Replacement"
                  />
                </div>
                <div className="space-y-1">
                  <b className="text-[11px] font-semibold">Purchase Date</b>
                  <R
                    type="date"
                    value={newPurchaseDate}
                    onChange={(e) => setNewPurchaseDate(e.target.value)}
                    className="text-xs h-8 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <b className="text-xs font-semibold">Swap Notes / Reason</b>
            <R
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs h-9 rounded-xl"
              placeholder="e.g. Swapped battery for heavy night runs"
            />
          </div>

          <Se className="pt-2 border-t border-border/50 flex items-center justify-end gap-2">
            <_ type="button" variant="ghost" onClick={onClose} disabled={loading} className="rounded-xl text-xs">
              Cancel
            </_>
            <_
              type="submit"
              disabled={loading}
              className="rounded-xl shadow-sm text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white gap-1.5"
            >
              {loading && <Qe className="w-3.5 h-3.5 animate-spin" />}
              {mode === "swap" ? "Confirm Battery Swap" : "Confirm Move & Fit New Battery"}
            </_>
          </Se>
        </form>
      </ye>
    </je>
  );
}

// -------------------------------------------------------------
// NEW: Cross-Truck Equipment (Jack, Wheel Spanner, Tool Box) Swap Modal
// -------------------------------------------------------------
export function CrossTruckEquipmentSwapModal({
  isOpen,
  onClose,
  allTrucks = [],
  currentTruck = null,
  initialItemKey = "jack", // 'jack' | 'wheel_spanner' | 'tool_box'
  onSuccess
}) {
  const [selectedItemKey, setSelectedItemKey] = c.useState(initialItemKey);
  const [mode, setMode] = c.useState("swap"); // 'swap' | 'transfer_replace'
  const [loading, setLoading] = c.useState(false);
  const [targetTruckId, setTargetTruckId] = c.useState("");
  const [swapNotes, setSwapNotes] = c.useState("Transferred equipment between fleet vehicles");
  
  // New equipment fields (for transfer_replace mode)
  const [newSerial, setNewSerial] = c.useState("");
  const [newBrand, setNewBrand] = c.useState("");

  const [showQuickAddTruck, setShowQuickAddTruck] = c.useState(false);
  const [quickTruckNumber, setQuickTruckNumber] = c.useState("");
  const [quickTruckName, setQuickTruckName] = c.useState("");

  const itemNames = {
    jack: "Hydraulic Jack (10T-20T)",
    wheel_spanner: "Wheel Spanner & Tommy Bar",
    tool_box: "Tool Box & Emergency Kit"
  };

  c.useEffect(() => {
    if (isOpen) {
      setSelectedItemKey(initialItemKey || "jack");
      const otherTrucks = allTrucks.filter(t => t.id !== currentTruck?.id);
      if (otherTrucks.length > 0) {
        setTargetTruckId(otherTrucks[0].id);
        setShowQuickAddTruck(false);
      } else {
        setTargetTruckId("new_truck");
        setShowQuickAddTruck(true);
      }
      setNewSerial("");
      setNewBrand("");
      setQuickTruckNumber("");
      setQuickTruckName("");
    }
  }, [isOpen, initialItemKey, allTrucks, currentTruck]);

  if (!isOpen) return null;

  const otherTrucks = allTrucks.filter(t => t.id !== currentTruck?.id);
  const selectedTargetTruck = otherTrucks.find(t => t.id === targetTruckId);
  const currentEquipment = getTruckEquipment(currentTruck);
  const currentItem = currentEquipment[selectedItemKey];

  const handleSubmit = async (eEvent) => {
    eEvent.preventDefault();
    if (!currentTruck) {
      I.error("No active truck selected.");
      return;
    }
    if (mode === "transfer_replace" && !newSerial.trim()) {
      I.error("Please enter the serial / tag # for the replacement equipment.");
      return;
    }

    setLoading(true);
    try {
      let finalTargetTruckId = targetTruckId;
      let finalTargetTruck = selectedTargetTruck;

      if (showQuickAddTruck || finalTargetTruckId === "new_truck") {
        if (!quickTruckNumber.trim()) {
          I.error("Please enter the registration number for the second truck.");
          setLoading(false);
          return;
        }
        const createdTruck = await j.collection("trucks").create({
          truck_number: quickTruckNumber.trim().toUpperCase(),
          truck_name: quickTruckName.trim() || "Secondary Truck",
          tyre_count: 6,
          ownership_type: "Owned"
        }, { $autoCancel: false });
        finalTargetTruckId = createdTruck.id;
        finalTargetTruck = createdTruck;
      }

      if (!finalTargetTruck) {
        I.error("Please select a target truck.");
        setLoading(false);
        return;
      }

      const targetEquipment = getTruckEquipment(finalTargetTruck);

      if (mode === "swap") {
        // Two-way swap of the selected item
        const itemA = { ...currentEquipment[selectedItemKey] };
        const itemB = { ...targetEquipment[selectedItemKey] };

        currentEquipment[selectedItemKey] = {
          ...itemB,
          last_verified: ne(new Date(), "yyyy-MM-dd"),
          notes: `Swapped from ${finalTargetTruck.truck_number}. ${swapNotes}`
        };
        targetEquipment[selectedItemKey] = {
          ...itemA,
          last_verified: ne(new Date(), "yyyy-MM-dd"),
          notes: `Swapped from ${currentTruck.truck_number}. ${swapNotes}`
        };

        await j.collection("trucks").update(currentTruck.id, {
          fastag_notes: JSON.stringify(currentEquipment)
        }, { $autoCancel: false });

        await j.collection("trucks").update(finalTargetTruckId, {
          fastag_notes: JSON.stringify(targetEquipment)
        }, { $autoCancel: false });

        I.success(`Swapped ${itemNames[selectedItemKey]} between ${currentTruck.truck_number} and ${finalTargetTruck.truck_number}!`);
      } else {
        // Move current equipment to target truck & issue new equipment on current truck
        const itemA = { ...currentEquipment[selectedItemKey] };

        targetEquipment[selectedItemKey] = {
          ...itemA,
          status: "present",
          last_verified: ne(new Date(), "yyyy-MM-dd"),
          notes: `Transferred from ${currentTruck.truck_number}. ${swapNotes}`
        };

        currentEquipment[selectedItemKey] = {
          status: "present",
          serial: newSerial.trim().toUpperCase(),
          brand: newBrand.trim() || currentItem.brand,
          last_verified: ne(new Date(), "yyyy-MM-dd"),
          verified_by: currentTruck.driver_name || "Supervisor",
          notes: `Brand new equipment issued. ${swapNotes}`
        };

        await j.collection("trucks").update(currentTruck.id, {
          fastag_notes: JSON.stringify(currentEquipment)
        }, { $autoCancel: false });

        await j.collection("trucks").update(finalTargetTruckId, {
          fastag_notes: JSON.stringify(targetEquipment)
        }, { $autoCancel: false });

        I.success(`Moved ${itemNames[selectedItemKey]} to ${finalTargetTruck.truck_number} & issued new unit (${newSerial.toUpperCase()}) on ${currentTruck.truck_number}!`);
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Equipment swap failure:", err);
      I.error(err?.message || "Failed to execute equipment swap");
    } finally {
      setLoading(false);
    }
  };

  return (
    <je open={isOpen} onOpenChange={(openState) => !openState && !loading && onClose()}>
      <ye className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto rounded-3xl border-border/60 shadow-xl bg-card">
        <Me className="pb-3 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 rounded-2xl text-cyan-500 border border-cyan-500/20">
              <WrenchIcon className="w-5 h-5" />
            </div>
            <div>
              <Ce className="text-xl font-heading font-bold text-foreground">
                Fleet Tool &amp; Equipment Swapper
              </Ce>
              <xs className="text-xs text-muted-foreground">
                Swap Jack, Wheel Spanner or Tool Box between vehicles or issue new equipment.
              </xs>
            </div>
          </div>
        </Me>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          {/* Item Selector */}
          <div className="space-y-1.5">
            <b className="text-xs font-semibold">Select Equipment Item</b>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/30 rounded-xl border border-border/50">
              {["jack", "wheel_spanner", "tool_box"].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSelectedItemKey(k)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition text-center truncate ${
                    selectedItemKey === k
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {k === "jack" ? "Jack" : k === "wheel_spanner" ? "Spanner" : "Tool Box"}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/30 rounded-2xl border border-border/50">
            <button
              type="button"
              onClick={() => setMode("swap")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                mode === "swap"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Q className="w-3.5 h-3.5" />
              ⇄ Two-Way Swap
            </button>
            <button
              type="button"
              onClick={() => setMode("transfer_replace")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                mode === "transfer_replace"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Le className="w-3.5 h-3.5" />
              → Move &amp; Issue New
            </button>
          </div>

          {/* Current Truck Equipment Details */}
          <div className="p-3 bg-muted/20 border border-border/50 rounded-2xl space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-cyan-500 uppercase tracking-wider flex items-center gap-1">
                <WrenchIcon className="w-3.5 h-3.5" /> Current {itemNames[selectedItemKey]} on {currentTruck?.truck_number}
              </span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                currentItem?.status === "present"
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
              }`}>
                {currentItem?.status === "present" ? "Present" : "Stolen / Missing"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground block">Serial / Tag #:</span>
                <span className="font-mono font-bold text-foreground">
                  {currentItem?.serial || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Specs:</span>
                <span className="font-medium text-foreground truncate block" title={currentItem?.brand}>
                  {currentItem?.brand || "Standard Kit"}
                </span>
              </div>
            </div>
          </div>

          {/* Destination Truck */}
          <div className="p-3 bg-muted/20 border border-border/50 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1">
                <Oe className="w-3.5 h-3.5" /> Destination Vehicle
              </span>
              {otherTrucks.length === 0 && !showQuickAddTruck && (
                <button
                  type="button"
                  onClick={() => setShowQuickAddTruck(true)}
                  className="text-[10px] text-primary hover:underline font-bold"
                >
                  + Add 2nd Truck
                </button>
              )}
            </div>

            {showQuickAddTruck ? (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-primary">Register Destination Truck</span>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddTruck(false)}
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <R
                    placeholder="Reg No (e.g. TG12AB1234)"
                    value={quickTruckNumber}
                    onChange={(e) => setQuickTruckNumber(e.target.value)}
                    className="text-xs h-8 rounded-lg uppercase"
                    required
                  />
                  <R
                    placeholder="Truck Name / Model"
                    value={quickTruckName}
                    onChange={(e) => setQuickTruckName(e.target.value)}
                    className="text-xs h-8 rounded-lg"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <select
                  value={targetTruckId}
                  onChange={(e) => {
                    if (e.target.value === "new_truck") {
                      setShowQuickAddTruck(true);
                    } else {
                      setTargetTruckId(e.target.value);
                    }
                  }}
                  className="w-full h-9 px-3 text-xs bg-background border border-border rounded-xl font-medium focus:ring-2 focus:ring-primary/20"
                  required
                >
                  {otherTrucks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.truck_number} {t.truck_name ? `(${t.truck_name})` : ""}
                    </option>
                  ))}
                  <option value="new_truck">+ Quick Register New Truck...</option>
                </select>
              </div>
            )}
          </div>

          {/* In Mode 2: Issue New Equipment on Current Truck */}
          {mode === "transfer_replace" && (
            <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
              <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                <Le className="w-3.5 h-3.5" /> Issue Brand-New {itemNames[selectedItemKey]} to {currentTruck?.truck_number}
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <b className="text-[11px] font-semibold">New Serial / Stamp # *</b>
                  <R
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    className="text-xs h-8 rounded-lg font-mono uppercase"
                    placeholder="e.g. JACK-20T-NEW"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <b className="text-[11px] font-semibold">Brand / Specification</b>
                  <R
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="text-xs h-8 rounded-lg"
                    placeholder="e.g. Omex 20T Hydraulic"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <b className="text-xs font-semibold">Swap Notes / Reason</b>
            <R
              value={swapNotes}
              onChange={(e) => setSwapNotes(e.target.value)}
              className="text-xs h-9 rounded-xl"
              placeholder="e.g. Reallocated jack for emergency road tyre change"
            />
          </div>

          <Se className="pt-2 border-t border-border/50 flex items-center justify-end gap-2">
            <_ type="button" variant="ghost" onClick={onClose} disabled={loading} className="rounded-xl text-xs">
              Cancel
            </_>
            <_
              type="submit"
              disabled={loading}
              className="rounded-xl shadow-sm text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white gap-1.5"
            >
              {loading && <Qe className="w-3.5 h-3.5 animate-spin" />}
              {mode === "swap" ? "Confirm Equipment Swap" : "Confirm Move & Issue New"}
            </_>
          </Se>
        </form>
      </ye>
    </je>
  );
}

// -------------------------------------------------------------

