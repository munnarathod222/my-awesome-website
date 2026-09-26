// Fleet Hardware Swapping Components (Cross-Truck Tyre & Battery Swap/Transfer)

function CrossTruckTyreSwapModal({
  isOpen,
  onClose,
  allTrucks = [],
  currentTruck = null,
  currentTyres = [],
  preselectedTyre = null,
  onSuccess
}) {
  const [mode, setMode] = c.useState("swap"); // 'swap' | 'transfer_replace'
  const [loading, setLoading] = c.useState(false);
  const [sourceTyreId, setSourceTyreId] = c.useState("");
  const [targetTruckId, setTargetTruckId] = c.useState("");
  const [targetPosition, setTargetPosition] = c.useState("front_left");
  const [odometerReading, setOdometerReading] = c.useState("");
  const [swapReason, setSwapReason] = c.useState("Fleet Tyre Reallocation & Axle Wear Balancing");
  
  // New tyre fields (for transfer_replace mode)
  const [newBrand, setNewBrand] = c.useState("MRF");
  const [newModel, setNewModel] = c.useState("Steel Muscle");
  const [newSerial, setNewSerial] = c.useState("");
  const [newDepth, setNewDepth] = c.useState("15.0");
  const [newPurchaseDate, setNewPurchaseDate] = c.useState(ne(new Date(), "yyyy-MM-dd"));
  const [newCost, setNewCost] = c.useState("");

  // Quick-register second truck if only 1 exists
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

      // Handle Quick-Add Truck
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
        // Move to Standby Yard / Inventory
        await j.collection("tyres").update(selectedSourceTyre.id, {
          truck_id: "",
          tyre_position: "stepney",
          axle_position: "stepney",
          status: "spare"
        }, { $autoCancel: false });

        if (mode === "transfer_replace") {
          // Fit brand new tyre on current truck at the vacated position
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
        // Fetch target truck existing tyres to see if position is occupied
        const targetTyres = await j.collection("tyres").getFullList({
          filter: `truck_id = "${finalTargetTruckId}" && status != "replaced"`,
          $autoCancel: false
        }).catch(() => []);
        const targetOccupant = targetTyres.find(t => t.tyre_position === targetPosition);

        if (mode === "swap") {
          // Two-way cross-truck swap
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

          // Record rotation log
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
          // Transfer & Replace with New Tyre mode
          await j.collection("tyres").update(selectedSourceTyre.id, {
            truck_id: finalTargetTruckId,
            tyre_position: targetPosition,
            axle_position: targetAxle
          }, { $autoCancel: false });

          // If target had an occupant, move it to stepney/spare so no duplicate positions on target truck
          if (targetOccupant) {
            await j.collection("tyres").update(targetOccupant.id, {
              tyre_position: "stepney",
              axle_position: "stepney"
            }, { $autoCancel: false });
          }

          // Fit brand new tyre on current truck at the vacated position!
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

          // Record rotation log
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
              → Move &amp; Fit New Tyre
            </button>
          </div>

          {/* Section 1: Source Truck & Tyre */}
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

          {/* Section 2: Destination Vehicle & Position */}
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

          {/* Section 3: In Mode 2, Fit Brand-New Tyre on Current Truck */}
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

          {/* Section 4: Snapshot Odometer & Reason */}
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

function CrossTruckBatterySwapModal({
  isOpen,
  onClose,
  allTrucks = [],
  currentTruck = null,
  onSuccess
}) {
  const [mode, setMode] = c.useState("swap"); // 'swap' | 'transfer_replace'
  const [loading, setLoading] = c.useState(false);
  const [targetTruckId, setTargetTruckId] = c.useState("");
  const [swapDate, setSwapDate] = c.useState(ne(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = c.useState("Battery rotated between fleet vehicles");

  // New battery specs (for transfer_replace mode)
  const [newSerial, setNewSerial] = c.useState("");
  const [newBrand, setNewBrand] = c.useState("Amaron");
  const [newWarranty, setNewWarranty] = c.useState("24 Months Replacement");
  const [newPurchaseDate, setNewPurchaseDate] = c.useState(ne(new Date(), "yyyy-MM-dd"));

  // Quick-register second truck
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
        // Two-way battery swap between currentTruck and finalTargetTruck
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

        // Update currentTruck with Truck B's battery
        await j.collection("trucks").update(currentTruck.id, {
          battery_serial_number: truckBBattery.battery_serial_number,
          battery_purchase_date: truckBBattery.battery_purchase_date,
          battery_warranty_details: truckBBattery.battery_warranty_details
        }, { $autoCancel: false });

        // Update targetTruck with Truck A's battery
        await j.collection("trucks").update(finalTargetTruckId, {
          battery_serial_number: truckABattery.battery_serial_number,
          battery_purchase_date: truckABattery.battery_purchase_date,
          battery_warranty_details: truckABattery.battery_warranty_details
        }, { $autoCancel: false });

        I.success(`Swapped batteries between ${currentTruck.truck_number} and ${finalTargetTruck.truck_number}!`);
      } else {
        // Transfer current battery to target truck & install brand new battery on current truck
        const oldBattery = {
          battery_serial_number: currentTruck.battery_serial_number || "",
          battery_purchase_date: currentTruck.battery_purchase_date || "",
          battery_warranty_details: currentTruck.battery_warranty_details || ""
        };

        // Move old battery to target truck
        await j.collection("trucks").update(finalTargetTruckId, {
          battery_serial_number: oldBattery.battery_serial_number,
          battery_purchase_date: oldBattery.battery_purchase_date,
          battery_warranty_details: oldBattery.battery_warranty_details
        }, { $autoCancel: false });

        // Install brand new battery on current truck
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

          {/* Current Truck Battery Card */}
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
                      {t.truck_number} {t.truck_name ? `(${t.truck_name})` : ""} - Battery: {t.battery_serial_number || "None"}
                    </option>
                  ))}
                  <option value="new_truck">+ Quick Register New Truck...</option>
                </select>
              </div>
            )}
          </div>

          {/* In Mode 2: New Battery on Current Truck */}
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
