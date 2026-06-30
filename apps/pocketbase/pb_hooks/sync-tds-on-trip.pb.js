/// <reference path="../pb_data/types.d.ts" />

// Compute TDS Deduction on trip create/update
onRecordCreate((e) => {
  try {
    const clientId = e.record.get("client_id");
    if (clientId) {
      const client = $app.findRecordById("clients", clientId);
      if (client && client.get("isTdsApplicable")) {
        const tdsRate = Number(client.get("tdsRate")) || 2.0;
        const revenue = Number(e.record.get("revenue")) || 0.0;
        const tdsAmount = revenue * (tdsRate / 100);
        e.record.set("tds_deducted_receivable", Number(tdsAmount.toFixed(2)));
      } else {
        e.record.set("tds_deducted_receivable", 0.0);
      }
    } else {
      e.record.set("tds_deducted_receivable", 0.0);
    }
  } catch (err) {
    console.error("Error calculating TDS in onRecordCreate:", err);
  }
  e.next();
}, "trip_logs");

onRecordUpdate((e) => {
  try {
    const clientId = e.record.get("client_id");
    if (clientId) {
      const client = $app.findRecordById("clients", clientId);
      if (client && client.get("isTdsApplicable")) {
        const tdsRate = Number(client.get("tdsRate")) || 2.0;
        const revenue = Number(e.record.get("revenue")) || 0.0;
        const tdsAmount = revenue * (tdsRate / 100);
        e.record.set("tds_deducted_receivable", Number(tdsAmount.toFixed(2)));
      } else {
        e.record.set("tds_deducted_receivable", 0.0);
      }
    } else {
      e.record.set("tds_deducted_receivable", 0.0);
    }
  } catch (err) {
    console.error("Error calculating TDS in onRecordUpdate:", err);
  }
  e.next();
}, "trip_logs");
