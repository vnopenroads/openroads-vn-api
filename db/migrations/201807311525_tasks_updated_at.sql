--
-- Name: tasks; Type: COLUMN; Schema: public;
-- Add column to store updated_at in tasks
--

ALTER TABLE tasks ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();