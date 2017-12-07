--
-- Name: tasks_way_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tasks
    ADD CONSTRAINT tasks_way_id_fkey FOREIGN KEY (way_id) REFERENCES current_ways(id);
