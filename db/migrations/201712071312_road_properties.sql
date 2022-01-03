--
-- Name: field_data_geometries_road_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY field_data_geometries
    DROP CONSTRAINT field_data_geometries_road_id_fkey,
    ADD CONSTRAINT field_data_geometries_road_id_fkey FOREIGN KEY (road_id) REFERENCES road_properties(id) ON UPDATE CASCADE;

--
-- Name: point_properties_road_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY point_properties
    DROP CONSTRAINT point_properties_road_id_fkey,
    ADD CONSTRAINT point_properties_road_id_fkey FOREIGN KEY (road_id) REFERENCES road_properties(id) ON UPDATE CASCADE;
