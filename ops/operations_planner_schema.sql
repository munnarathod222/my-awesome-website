-- ============================================================================
-- JAI BHAVANI CARGO & LOGISTICS — OPERATIONS PLANNER ENTERPRISE SCHEMA
-- Comprehensive Supabase / PostgreSQL Tables, Relationships, RLS & Indexes
-- ============================================================================

-- 1. Operations Tasks Table
CREATE TABLE IF NOT EXISTS operations_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_number VARCHAR(30) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'General Operations',
  department VARCHAR(50) NOT NULL DEFAULT 'Operations',
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'URGENT')),
  status VARCHAR(40) NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'WAITING_FOR_RESPONSE', 'PENDING_APPROVAL', 'BLOCKED', 'COMPLETED', 'CANCELLED')),
  eisenhower_quadrant SMALLINT NOT NULL DEFAULT 2 CHECK (eisenhower_quadrant IN (1, 2, 3, 4)),
  created_by_id VARCHAR(100) NOT NULL DEFAULT 'usr_operations',
  created_by_name VARCHAR(150) NOT NULL DEFAULT 'Operations Lead',
  assigned_to_id VARCHAR(100),
  assigned_to_name VARCHAR(150),
  accountable_owner_id VARCHAR(100),
  accountable_owner_name VARCHAR(150),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  due_date TIMESTAMP WITH TIME ZONE,
  scheduled_time TIME DEFAULT '09:00:00',
  completion_date TIMESTAMP WITH TIME ZONE,
  estimated_duration_hours NUMERIC(6, 2) DEFAULT 1.00,
  actual_duration_hours NUMERIC(6, 2) DEFAULT 0.00,
  related_entity_type VARCHAR(50) CHECK (related_entity_type IN ('TRUCK', 'DRIVER', 'TRIP', 'INVOICE', 'VENDOR', 'EXPENSE', 'CLIENT', 'PERMIT', 'GATE_PASS')),
  related_entity_id VARCHAR(100),
  attachments JSONB DEFAULT '[]'::jsonb,
  checklists JSONB DEFAULT '[]'::jsonb,
  parent_task_id UUID REFERENCES operations_tasks(id) ON DELETE CASCADE,
  subtasks JSONB DEFAULT '[]'::jsonb,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule VARCHAR(50),
  escalation_level SMALLINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Operations Reminders Table
CREATE TABLE IF NOT EXISTS operations_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_number VARCHAR(30) UNIQUE NOT NULL,
  linked_task_id UUID REFERENCES operations_tasks(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  notes TEXT,
  trigger_time TIMESTAMP WITH TIME ZONE NOT NULL,
  channel VARCHAR(30) NOT NULL DEFAULT 'IN_APP' CHECK (channel IN ('IN_APP', 'WHATSAPP', 'SMS', 'EMAIL')),
  priority VARCHAR(20) NOT NULL DEFAULT 'HIGH' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'DUE', 'SNOOZED', 'COMPLETED', 'CANCELLED')),
  owner_id VARCHAR(100) NOT NULL DEFAULT 'usr_operations',
  owner_name VARCHAR(150) NOT NULL DEFAULT 'Operations Staff',
  snooze_until TIMESTAMP WITH TIME ZONE,
  snooze_count SMALLINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Operations Notifications Queue & Delivery Log
CREATE TABLE IF NOT EXISTS operations_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID REFERENCES operations_reminders(id) ON DELETE SET NULL,
  task_id UUID REFERENCES operations_tasks(id) ON DELETE SET NULL,
  recipient_id VARCHAR(100) NOT NULL,
  recipient_name VARCHAR(150) NOT NULL,
  channel VARCHAR(30) NOT NULL DEFAULT 'IN_APP',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(30) NOT NULL DEFAULT 'DELIVERED' CHECK (status IN ('QUEUED', 'DELIVERED', 'FAILED', 'READ', 'ACKNOWLEDGED')),
  attempt_count SMALLINT DEFAULT 1,
  max_attempts SMALLINT DEFAULT 5,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  failure_reason TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Operations Approval Workflows Table
CREATE TABLE IF NOT EXISTS operations_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_number VARCHAR(30) UNIQUE NOT NULL,
  workflow_type VARCHAR(50) NOT NULL CHECK (workflow_type IN ('EXPENSE_ADVANCE', 'GATE_PASS', 'DRIVER_LEAVE', 'MAINTENANCE_ESTIMATE', 'CREDIT_LIMIT_OVERRIDE', 'ROUTE_DIVERSION')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount NUMERIC(12, 2) DEFAULT 0.00,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  requested_by_id VARCHAR(100) NOT NULL,
  requested_by_name VARCHAR(150) NOT NULL,
  approver_id VARCHAR(100),
  approver_name VARCHAR(150),
  approver_remarks TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  related_entity_type VARCHAR(50),
  related_entity_id VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Operations Focus Sessions & Time Tracking (Pomodoro)
CREATE TABLE IF NOT EXISTS operations_focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_number VARCHAR(30) UNIQUE NOT NULL,
  task_id UUID REFERENCES operations_tasks(id) ON DELETE SET NULL,
  task_title VARCHAR(255) NOT NULL,
  mode VARCHAR(30) NOT NULL DEFAULT 'POMODORO' CHECK (mode IN ('POMODORO', 'STOPWATCH', 'SHORT_BREAK', 'LONG_BREAK')),
  duration_seconds INTEGER NOT NULL DEFAULT 1500,
  duration_minutes INTEGER NOT NULL DEFAULT 25,
  completed BOOLEAN DEFAULT TRUE,
  notes TEXT,
  user_id VARCHAR(100) NOT NULL,
  user_name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. High-Performance Operational Indexes
CREATE INDEX IF NOT EXISTS idx_ops_tasks_status ON operations_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ops_tasks_quadrant ON operations_tasks(eisenhower_quadrant);
CREATE INDEX IF NOT EXISTS idx_ops_tasks_due ON operations_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_ops_tasks_dept ON operations_tasks(department);
CREATE INDEX IF NOT EXISTS idx_ops_tasks_assigned ON operations_tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_ops_tasks_entity ON operations_tasks(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_ops_reminders_trigger ON operations_reminders(trigger_time, status);
CREATE INDEX IF NOT EXISTS idx_ops_notifs_recipient ON operations_notifications(recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_ops_workflows_status ON operations_workflows(status, workflow_type);
CREATE INDEX IF NOT EXISTS idx_ops_focus_user_date ON operations_focus_sessions(user_id, created_at);

-- 7. Row Level Security Policies (RLS)
ALTER TABLE operations_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations_focus_sessions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated logistics team members full read/write access
CREATE POLICY IF NOT EXISTS "Authenticated operations staff have full access to tasks"
  ON operations_tasks FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Authenticated operations staff have full access to reminders"
  ON operations_reminders FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Authenticated operations staff have full access to notifications"
  ON operations_notifications FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Authenticated operations staff have full access to workflows"
  ON operations_workflows FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Authenticated operations staff have full access to focus sessions"
  ON operations_focus_sessions FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 8. Automated Triggers for Updated Timestamp
CREATE OR REPLACE FUNCTION update_operations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ops_tasks_update ON operations_tasks;
CREATE TRIGGER trg_ops_tasks_update
  BEFORE UPDATE ON operations_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_operations_timestamp();

DROP TRIGGER IF EXISTS trg_ops_reminders_update ON operations_reminders;
CREATE TRIGGER trg_ops_reminders_update
  BEFORE UPDATE ON operations_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_operations_timestamp();

DROP TRIGGER IF EXISTS trg_ops_workflows_update ON operations_workflows;
CREATE TRIGGER trg_ops_workflows_update
  BEFORE UPDATE ON operations_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_operations_timestamp();
