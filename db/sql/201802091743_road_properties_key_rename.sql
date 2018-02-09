--
-- Name: road_properties; Type: COLUMN; Schema: public;
-- Rename Start Longtitude to Start Longitude and End Longtitude to End Longitude
--


UPDATE road_properties_copy SET properties = properties - 'Start Longtitude' || jsonb_build_object('Start Longitude', properties->'Start Longtitude');
UPDATE road_properties_copy SET properties = properties - 'End Longtitude' || jsonb_build_object('End Longitude', properties->'End Longtitude');