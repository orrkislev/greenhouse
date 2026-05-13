ALTER TABLE terms ADD COLUMN IF NOT EXISTS name_en text;

UPDATE terms SET name_en = 'winter' WHERE name = 'חורף';
UPDATE terms SET name_en = 'spring' WHERE name = 'אביב';
UPDATE terms SET name_en = 'summer' WHERE name = 'קיץ';
