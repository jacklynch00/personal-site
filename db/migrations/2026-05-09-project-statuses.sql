ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

UPDATE projects
SET status = CASE
  WHEN status IN ('shipping', 'tinkering') THEN 'building'
  WHEN status = 'launched' THEN 'live'
  WHEN status = 'shelved' THEN 'paused'
  WHEN status = 'scrapped' THEN 'retired'
  ELSE status
END;

ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'building';

ALTER TABLE projects
  ADD CONSTRAINT projects_status_check
  CHECK (status IN ('building', 'live', 'paused', 'retired'));
