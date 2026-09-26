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
