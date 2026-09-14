import React, { useState } from 'react';
import { Database, Copy, CheckCircle } from 'lucide-react';

export const DatabaseSchemaViewerPage: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sqlContent = `-- JAI BHAVANI CARGO & LOGISTICS - PRODUCTION SQL LEDGER SCHEMA MIGRATION
-- Based on authoritative Desktop problem findings

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Manager',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trucks (
  id VARCHAR(36) PRIMARY KEY,
  truck_number VARCHAR(50) UNIQUE NOT NULL,
  model VARCHAR(100),
  manufacturer VARCHAR(100),
  year INTEGER,
  odometer_kms INTEGER DEFAULT 0,
  battery_serial_number VARCHAR(100),
  battery_install_date DATE,
  manager_id VARCHAR(36),
  status VARCHAR(50) DEFAULT 'Active',
  CONSTRAINT fk_truck_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS trip_logs (
  id VARCHAR(36) PRIMARY KEY,
  trip_number VARCHAR(50) UNIQUE NOT NULL,
  truck_id VARCHAR(36) NOT NULL,
  driver_id VARCHAR(36) NOT NULL,
  client_id VARCHAR(36) NOT NULL,
  start_date DATE NOT NULL,
  distance_kms NUMERIC(10,2) NOT NULL,
  revenue NUMERIC(12,2) NOT NULL,
  fuel_cost NUMERIC(12,2) DEFAULT 0,
  toll_cost NUMERIC(12,2) DEFAULT 0,
  driver_allowance NUMERIC(12,2) DEFAULT 0,
  tyre_depreciation_rate_per_km NUMERIC(6,2) DEFAULT 3.00,
  tyre_depreciation_expense NUMERIC(12,2) DEFAULT 0,
  total_expenses NUMERIC(12,2) DEFAULT 0,
  net_profit NUMERIC(12,2) DEFAULT 0,
  pod_status VARCHAR(50) DEFAULT 'Pending',
  client_payment_status VARCHAR(50) DEFAULT 'Pending',
  CONSTRAINT fk_trip_truck FOREIGN KEY (truck_id) REFERENCES trucks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lorry_receipts (
  id VARCHAR(36) PRIMARY KEY,
  lr_number VARCHAR(50) UNIQUE NOT NULL,
  lr_date DATE NOT NULL,
  booking_date DATE NOT NULL,
  eway_bill_number VARCHAR(50),
  invoice_number VARCHAR(50),
  trip_id VARCHAR(36) NOT NULL,
  trip_number VARCHAR(50) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  consignor_name VARCHAR(255) NOT NULL,
  consignor_address TEXT NOT NULL,
  consignee_name VARCHAR(255) NOT NULL,
  consignee_delivery_address TEXT NOT NULL,
  vehicle_number VARCHAR(30) NOT NULL,
  driver_name VARCHAR(255) NOT NULL,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  freight_amount NUMERIC(12,2) NOT NULL,
  taxable_amount NUMERIC(12,2) NOT NULL,
  total_freight NUMERIC(12,2) NOT NULL,
  payment_basis VARCHAR(30) DEFAULT 'To Be Billed',
  status VARCHAR(30) DEFAULT 'Generated',
  secure_token VARCHAR(100) UNIQUE NOT NULL,
  pod_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lr_trip FOREIGN KEY (trip_id) REFERENCES trip_logs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pod_records (
  id VARCHAR(36) PRIMARY KEY,
  pod_number VARCHAR(50) UNIQUE NOT NULL,
  lr_id VARCHAR(36) NOT NULL,
  lr_number VARCHAR(50) NOT NULL,
  trip_id VARCHAR(36) NOT NULL,
  delivery_status VARCHAR(50) DEFAULT 'Delivered in Full',
  receiver_name VARCHAR(255) NOT NULL,
  receiver_phone VARCHAR(30) NOT NULL,
  goods_received_confirmed BOOLEAN DEFAULT TRUE,
  receiver_signature_url TEXT,
  delivery_date DATE NOT NULL,
  delivery_time VARCHAR(20) NOT NULL,
  attachments JSON DEFAULT '[]',
  status VARCHAR(30) DEFAULT 'Captured',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pod_lr FOREIGN KEY (lr_id) REFERENCES lorry_receipts(id) ON DELETE CASCADE
);
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Database className="w-7 h-7 text-orange-400" /> Database Schema &amp; SQL Migrations
          </h1>
          <p className="text-sm text-slate-400">Complete PostgreSQL / Supabase / MySQL schema script with Foreign Keys &amp; Indexes</p>
        </div>
        <button
          onClick={handleCopy}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-orange-900/30"
        >
          {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied SQL!' : 'Copy SQL Schema'}
        </button>
      </div>

      <div className="bg-slate-900/80 border-2 border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="p-4 bg-slate-950/80 border-2 border-slate-800 rounded-xl overflow-x-auto">
          <pre className="text-xs font-mono text-emerald-400 leading-relaxed">{sqlContent}</pre>
        </div>
      </div>
    </div>
  );
};