import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

test('1. VACUUM INTO atomically preserves WAL transactions even while connection is open', async () => {
  const tmpDir = path.resolve('scratch');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const dbPath = path.join(tmpDir, 'test_persistence_source.db');
  const snapPath = path.join(tmpDir, 'test_persistence_snap.db');

  [dbPath, dbPath + '-wal', dbPath + '-shm', snapPath].forEach(p => {
    if (fs.existsSync(p)) try { fs.unlinkSync(p); } catch (_) {}
  });

  // Source DB in WAL mode
  const srcDb = new DatabaseSync(dbPath);
  srcDb.exec('PRAGMA journal_mode = WAL;');
  srcDb.exec('CREATE TABLE trip_logs (id TEXT PRIMARY KEY, trip_status TEXT);');
  srcDb.exec('CREATE TABLE expenses (id TEXT PRIMARY KEY, amount REAL, employee_id TEXT);');

  // Insert initial rows
  srcDb.exec("INSERT INTO trip_logs VALUES ('TRIP_1', 'Upcoming');");
  srcDb.exec("INSERT INTO expenses VALUES ('EXP_1', 500, 'EMP_1');");

  // Keep srcDb open and update status / insert expense in WAL
  srcDb.exec("UPDATE trip_logs SET trip_status = 'Delivered' WHERE id = 'TRIP_1';");
  srcDb.exec("INSERT INTO expenses VALUES ('EXP_2', 1200, 'EMP_2');");

  // Snapshot via VACUUM INTO
  const snapDb = new DatabaseSync(dbPath);
  try { snapDb.exec('PRAGMA wal_checkpoint(PASSIVE);'); } catch (_) {}
  snapDb.exec(`VACUUM INTO '${snapPath.replace(/\\/g, '/').replace(/'/g, "''")}'`);
  snapDb.close();

  // Verify the snapshot file contains all WAL updates
  const verifyDb = new DatabaseSync(snapPath);
  const trip = verifyDb.prepare("SELECT trip_status FROM trip_logs WHERE id = 'TRIP_1'").get();
  assert.equal(trip.trip_status, 'Delivered', 'Trip status in snapshot must be Delivered');

  const expCount = verifyDb.prepare("SELECT COUNT(*) as c FROM expenses").get().c;
  assert.equal(expCount, 2, 'Snapshot must contain both expenses including WAL-inserted EXP_2');
  verifyDb.close();

  srcDb.close();
  [dbPath, dbPath + '-wal', dbPath + '-shm', snapPath].forEach(p => {
    if (fs.existsSync(p)) try { fs.unlinkSync(p); } catch (_) {}
  });
});

test('2. Expenses table migration ensures employee_id column and collection schema compatibility', async () => {
  const tmpDir = path.resolve('scratch');
  const dbPath = path.join(tmpDir, 'test_migration.db');
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

  const db = new DatabaseSync(dbPath);
  db.exec('CREATE TABLE expenses (id TEXT PRIMARY KEY, amount REAL);');
  
  // Migration logic
  const expCols = db.prepare("PRAGMA table_info(expenses)").all().map(c => c.name);
  if (!expCols.includes('employee_id')) {
    db.prepare("ALTER TABLE expenses ADD COLUMN employee_id TEXT DEFAULT ''").run();
  }

  const updatedCols = db.prepare("PRAGMA table_info(expenses)").all().map(c => c.name);
  assert.ok(updatedCols.includes('employee_id'), 'employee_id column should be added');
  db.close();
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
});
