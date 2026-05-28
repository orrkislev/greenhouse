ALTER TABLE tasks ADD COLUMN IF NOT EXISTS planned_date date;
CREATE INDEX IF NOT EXISTS idx_tasks_planned_date ON tasks (planned_date, student_id);
