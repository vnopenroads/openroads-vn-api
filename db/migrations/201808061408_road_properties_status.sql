--
-- Name: road_properties; Type: COLUMN; Schema: public;
-- Add status column
--

ALTER TABLE road_properties ADD COLUMN status text;
ALTER TABLE road_properties ALTER COLUMN status SET DEFAULT 'pending';