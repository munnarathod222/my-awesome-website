/// <reference path="../pb_data/types.d.ts" />

// ── Cron: 07:00 on the 1st of every month ───────────────────────────────────
cronAdd('monthly_maintenance_reminders', '0 7 1 * *', () => {
  try {
    const MONTHLY_TASKS = [
      { type: 'Air Filter Cleaning', notes: 'Clean and inspect air filter element. Replace if heavily clogged or damaged.' },
      { type: 'Chassis Greasing',    notes: 'Grease all chassis nipple points: leaf springs, kingpins, propeller shaft, and 5th wheel plate.' },
    ];

    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const reminderDate = `${monthStr}-01 07:00:00`; // First day of this month

    console.log(`[monthly-reminders] Generating reminders for ${monthStr}...`);

    let trucks;
    try {
      trucks = $app.findAllRecords('trucks');
    } catch (err) {
      console.error('[monthly-reminders] Failed to fetch trucks:', err);
      return;
    }

    if (!trucks || trucks.length === 0) {
      console.log('[monthly-reminders] No trucks found. Skipping.');
      return;
    }

    console.log(`[monthly-reminders] Found ${trucks.length} trucks. Processing...`);

    let created = 0;
    let skipped = 0;

    trucks.forEach(truck => {
      const truckId     = truck.getId();
      const truckNumber = truck.getString('truck_number') || truckId;

      MONTHLY_TASKS.forEach(task => {
        try {
          // ---- Idempotency check ----
          const existing = $app.findRecordsByFilter(
            'maintenance_reminders',
            `truck_id = {:truckId} && maintenance_type = {:type} && month_label = {:monthStr} && status = 'Pending'`,
            '', 1, 0,
            {
              truckId:    truckId,
              type:       task.type,
              monthStr:   monthStr,
            }
          );

          if (existing && existing.length > 0) {
            console.log(`[monthly-reminders] Skipping ${truckNumber} — ${task.type} already exists for ${monthStr}`);
            skipped++;
            return;
          }

          // ---- Create the reminder ----
          const collection = $app.findCollectionByNameOrId('maintenance_reminders');
          const record = new Record(collection);

          record.set('truck_id',         truckId);
          record.set('maintenance_type', task.type);
          record.set('reminder_date',    reminderDate);
          record.set('status',           'Pending');
          record.set('notes',            task.notes);
          record.set('month_label',      monthStr);

          $app.save(record);
          created++;
          console.log(`[monthly-reminders] ✓ Created: ${truckNumber} — ${task.type}`);

        } catch (err) {
          console.error(`[monthly-reminders] Error processing ${truckNumber} / ${task.type}:`, err);
        }
      });
    });

    console.log(`[monthly-reminders] Done. Created: ${created}, Skipped (already exist): ${skipped}.`);
  } catch (globalErr) {
    console.error('[monthly-reminders] Cron execution error:', globalErr);
  }
});

// ── Manual trigger endpoint (for testing / backfill) ─────────────────────────
routerAdd('POST', '/api/custom/maintenance/generate-monthly-reminders', (e) => {
  try {
    const MONTHLY_TASKS = [
      { type: 'Air Filter Cleaning', notes: 'Clean and inspect air filter element. Replace if heavily clogged or damaged.' },
      { type: 'Chassis Greasing',    notes: 'Grease all chassis nipple points: leaf springs, kingpins, propeller shaft, and 5th wheel plate.' },
    ];

    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const reminderDate = `${monthStr}-01 07:00:00`; // First day of this month

    console.log(`[monthly-reminders-api] Generating reminders for ${monthStr}...`);

    let trucks;
    try {
      trucks = $app.findAllRecords('trucks');
    } catch (err) {
      console.error('[monthly-reminders-api] Failed to fetch trucks:', err);
      return e.json(500, { success: false, error: 'Failed to fetch trucks: ' + String(err) });
    }

    if (!trucks || trucks.length === 0) {
      console.log('[monthly-reminders-api] No trucks found. Skipping.');
      return e.json(200, { success: true, message: 'No trucks found. No reminders generated.' });
    }

    console.log(`[monthly-reminders-api] Found ${trucks.length} trucks. Processing...`);

    let created = 0;
    let skipped = 0;

    trucks.forEach(truck => {
      const truckId     = truck.getId();
      const truckNumber = truck.getString('truck_number') || truckId;

      MONTHLY_TASKS.forEach(task => {
        try {
          // ---- Idempotency check ----
          const existing = $app.findRecordsByFilter(
            'maintenance_reminders',
            `truck_id = {:truckId} && maintenance_type = {:type} && month_label = {:monthStr} && status = 'Pending'`,
            '', 1, 0,
            {
              truckId:    truckId,
              type:       task.type,
              monthStr:   monthStr,
            }
          );

          if (existing && existing.length > 0) {
            console.log(`[monthly-reminders-api] Skipping ${truckNumber} — ${task.type} already exists for ${monthStr}`);
            skipped++;
            return;
          }

          // ---- Create the reminder ----
          const collection = $app.findCollectionByNameOrId('maintenance_reminders');
          const record = new Record(collection);

          record.set('truck_id',         truckId);
          record.set('maintenance_type', task.type);
          record.set('reminder_date',    reminderDate);
          record.set('status',           'Pending');
          record.set('notes',            task.notes);
          record.set('month_label',      monthStr);

          $app.save(record);
          created++;
          console.log(`[monthly-reminders-api] ✓ Created: ${truckNumber} — ${task.type}`);

        } catch (err) {
          console.error(`[monthly-reminders-api] Error processing ${truckNumber} / ${task.type}:`, err);
        }
      });
    });

    console.log(`[monthly-reminders-api] Done. Created: ${created}, Skipped (already exist): ${skipped}.`);
    return e.json(200, {
      success: true,
      message: `Monthly maintenance reminders generated successfully. Created: ${created}, Skipped: ${skipped}.`
    });
  } catch (err) {
    console.error('[monthly-reminders-api] Manual trigger error:', err);
    return e.json(500, { success: false, error: String(err) });
  }
});
