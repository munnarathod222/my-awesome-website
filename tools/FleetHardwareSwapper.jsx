import { r as c, j as e, Q, Re, Te, Oe, Le, Qe, as as WrenchIcon } from "./vendor-react-Bs5V2qFE.js";
import { p as j, D as je, a as ye, b as Me, c as Ce, L as b, S as de, e as oe, g as ce, h as xe, i as K, I as R, B as _, j as Se, t as I, ne, W } from "./index-DLxf9dwO.js";

// Helper to get or initialize default equipment state for a truck
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
      last_verified: eq?.jack?.last_verified || ne(new Date(), "yyyy-MM-dd"),
      verified_by: eq?.jack?.verified_by || truck?.driver_name || "Driver / Supervisor",
      notes: eq?.jack?.notes || "Available on truck"
    },
    wheel_spanner: {
      status: eq?.wheel_spanner?.status || "present",
      serial: eq?.wheel_spanner?.serial || "SPAN-3233-01",
      brand: eq?.wheel_spanner?.brand || "32mm x 33mm Heavy Duty Wheel Spanner + Tommy Bar",
      last_verified: eq?.wheel_spanner?.last_verified || ne(new Date(), "yyyy-MM-dd"),
      verified_by: eq?.wheel_spanner?.verified_by || truck?.driver_name || "Driver / Supervisor",
      notes: eq?.wheel_spanner?.notes || "Available on truck"
    },
    tool_box: {
      status: eq?.tool_box?.status || "present",
      serial: eq?.tool_box?.serial || "TB-STEEL-01",
      brand: eq?.tool_box?.brand || "Heavy Steel Lockable Tool Box (12-Piece Tool Set)",
      last_verified: eq?.tool_box?.last_verified || ne(new Date(), "yyyy-MM-dd"),
      verified_by: eq?.tool_box?.verified_by || truck?.driver_name || "Driver / Supervisor",
      notes: eq?.tool_box?.notes || "Available on truck"
    }
  };
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
// NEW: FleetEquipmentTab - Dashboard component for Jack, Wheel Spanner, Tool Box
// -------------------------------------------------------------
export function FleetEquipmentTab({
  truck = null,
  allTrucks = [],
  onOpenSwapModal = null,
  onSuccess = null
}) {
  const [loading, setLoading] = c.useState(false);
  const [equipment, setEquipment] = c.useState(() => getTruckEquipment(truck));
  const [editItemModal, setEditItemModal] = c.useState({ isOpen: false, itemKey: null });
  const [editForm, setEditForm] = c.useState({ serial: "", brand: "", notes: "" });

  c.useEffect(() => {
    setEquipment(getTruckEquipment(truck));
  }, [truck]);

  if (!truck) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Please select a vehicle to view and manage equipment.
      </div>
    );
  }

  const items = [
    {
      key: "jack",
      name: "Hydraulic Jack (10T - 20T)",
      category: "Heavy Lifting",
      desc: "Hydraulic bottle jack & handle rod for wheel replacement",
      icon: WrenchIcon,
      accent: "amber",
      data: equipment.jack
    },
    {
      key: "wheel_spanner",
      name: "Wheel Spanner & Tommy Bar",
      category: "Wheel Servicing",
      desc: "Heavy duty forged lug wrench & tommy rod for truck wheel nuts",
      icon: WrenchIcon,
      accent: "cyan",
      data: equipment.wheel_spanner
    },
    {
      key: "tool_box",
      name: "Tool Box & Emergency Repair Kit",
      category: "Roadside Toolkit",
      desc: "Lockable steel tool chest with open/ring spanner set, pliers, hammer",
      icon: WrenchIcon,
      accent: "indigo",
      data: equipment.tool_box
    }
  ];

  const updateItemStatus = async (itemKey, newStatus) => {
    setLoading(true);
    try {
      const updated = {
        ...equipment,
        [itemKey]: {
          ...equipment[itemKey],
          status: newStatus,
          last_verified: ne(new Date(), "yyyy-MM-dd"),
          notes: newStatus === "stolen" ? "Reported STOLEN / MISSING on inspection" : "Verified present on truck"
        }
      };
      setEquipment(updated);

      await j.collection("trucks").update(truck.id, {
        fastag_notes: JSON.stringify(updated)
      }, { $autoCancel: false });

      I.success(newStatus === "stolen" ? `Reported ${itemKey.replace('_', ' ')} as STOLEN!` : `Marked ${itemKey.replace('_', ' ')} as Present & Verified!`);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Status update error:", err);
      I.error("Failed to update equipment status");
    } finally {
      setLoading(false);
    }
  };

  const saveEditForm = async (eEvent) => {
    eEvent.preventDefault();
    if (!editItemModal.itemKey) return;
    setLoading(true);
    try {
      const k = editItemModal.itemKey;
      const updated = {
        ...equipment,
        [k]: {
          ...equipment[k],
          serial: editForm.serial.trim().toUpperCase(),
          brand: editForm.brand.trim(),
          notes: editForm.notes.trim(),
          last_verified: ne(new Date(), "yyyy-MM-dd")
        }
      };
      setEquipment(updated);

      await j.collection("trucks").update(truck.id, {
        fastag_notes: JSON.stringify(updated)
      }, { $autoCancel: false });

      I.success("Equipment specifications saved successfully!");
      setEditItemModal({ isOpen: false, itemKey: null });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Save edit error:", err);
      I.error("Failed to save equipment specifications");
    } finally {
      setLoading(false);
    }
  };

  const hasMissingOrStolen = items.some(i => i.data?.status === "stolen" || i.data?.status === "missing");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Alert / Summary Banner */}
      <div className={`p-4 rounded-3xl border flex items-center justify-between gap-4 ${
        hasMissingOrStolen
          ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${hasMissingOrStolen ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}>
            <WrenchIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              {hasMissingOrStolen
                ? `ALERT: Missing or Stolen Equipment on ${truck.truck_number}`
                : `All 3 Required Emergency Tools Present on ${truck.truck_number}`}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {hasMissingOrStolen
                ? "Immediate driver inquiry or tool replacement required to prevent roadside breakdown delays."
                : "Hydraulic Jack, Wheel Spanner and Steel Tool Box verified available for line-haul duty."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenSwapModal && onOpenSwapModal("jack")}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm"
        >
          <Q className="w-3.5 h-3.5" />
          ⇄ Swap / Transfer Tools
        </button>
      </div>

      {/* 3 Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map(({ key, name, category, desc, data }) => {
          const isPresent = data?.status === "present";
          return (
            <div
              key={key}
              className={`p-5 rounded-3xl border bg-card shadow-sm flex flex-col justify-between transition-all ${
                isPresent ? "border-border/60" : "border-rose-500/40 bg-rose-500/[0.02]"
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {category}
                    </span>
                    <h3 className="text-base font-bold font-heading text-foreground mt-0.5">
                      {name}
                    </h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shrink-0 ${
                    isPresent
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse"
                  }`}>
                    {isPresent ? "✓ Present" : "🚨 Stolen / Missing"}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {desc}
                </p>

                {/* Specs Box */}
                <div className="p-3 bg-muted/20 border border-border/40 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Serial / Stamp #:</span>
                    <span className="font-mono font-bold text-foreground">{data?.serial || "Unstamped"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Model / Brand:</span>
                    <span className="font-medium text-foreground truncate max-w-[140px]" title={data?.brand}>{data?.brand || "Standard"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Last Verified:</span>
                    <span className="font-medium text-foreground">{data?.last_verified || "Today"}</span>
                  </div>
                  {data?.notes && (
                    <div className="pt-1 border-t border-border/30 text-[11px] text-muted-foreground truncate" title={data.notes}>
                      Note: {data.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-border/40 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {isPresent ? (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => updateItemStatus(key, "stolen")}
                      className="py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      🚨 Report Stolen
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => updateItemStatus(key, "present")}
                      className="py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      ✓ Mark Present
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditForm({
                        serial: data?.serial || "",
                        brand: data?.brand || "",
                        notes: data?.notes || ""
                      });
                      setEditItemModal({ isOpen: true, itemKey: key });
                    }}
                    className="py-1.5 px-2 bg-secondary/50 hover:bg-secondary text-secondary-foreground border border-border/60 rounded-xl text-xs font-bold transition text-center"
                  >
                    Edit Specs
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenSwapModal && onOpenSwapModal(key)}
                  className="w-full py-1.5 px-3 bg-muted/40 hover:bg-muted text-foreground border border-border/60 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <Q className="w-3 h-3 text-indigo-500" />
                  Swap / Transfer to Another Truck
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Specs Modal */}
      {editItemModal.isOpen && (
        <je open={editItemModal.isOpen} onOpenChange={(openState) => !openState && !loading && setEditItemModal({ isOpen: false, itemKey: null })}>
          <ye className="sm:max-w-[420px] rounded-3xl border-border/60 shadow-xl bg-card">
            <Me className="pb-3 border-b border-border/50">
              <Ce className="text-lg font-heading font-bold text-foreground">
                Edit {editItemModal.itemKey ? itemNames[editItemModal.itemKey] : "Equipment"}
              </Ce>
              <xs className="text-xs text-muted-foreground">
                Update tag serial number, brand capacity and condition notes.
              </xs>
            </Me>

            <form onSubmit={saveEditForm} className="space-y-4 py-3">
              <div className="space-y-1.5">
                <b className="text-xs font-semibold">Serial / Stamp / Tag #</b>
                <R
                  value={editForm.serial}
                  onChange={(e) => setEditForm({ ...editForm, serial: e.target.value })}
                  className="text-xs h-9 rounded-xl font-mono uppercase"
                  placeholder="e.g. JACK-20T-01"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <b className="text-xs font-semibold">Brand / Capacity / Specs</b>
                <R
                  value={editForm.brand}
                  onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                  className="text-xs h-9 rounded-xl"
                  placeholder="e.g. Omex 20 Ton Hydraulic"
                />
              </div>

              <div className="space-y-1.5">
                <b className="text-xs font-semibold">Condition Notes</b>
                <R
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="text-xs h-9 rounded-xl"
                  placeholder="Condition / inspection details"
                />
              </div>

              <Se className="pt-2 border-t border-border/50 flex items-center justify-end gap-2">
                <_
                  type="button"
                  variant="ghost"
                  onClick={() => setEditItemModal({ isOpen: false, itemKey: null })}
                  disabled={loading}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </_>
                <_
                  type="submit"
                  disabled={loading}
                  className="rounded-xl shadow-sm text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {loading && <Qe className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  Save Specifications
                </_>
              </Se>
            </form>
          </ye>
        </je>
      )}
    </div>
  );
}
