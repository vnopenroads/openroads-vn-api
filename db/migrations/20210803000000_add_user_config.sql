--
-- Name: cba_user_config; Type: TABLE; Schema: public; Owner: -; Tablespace:
--

DROP TABLE cba_user_configs;

CREATE TABLE cba_user_configs (
	id SERIAL PRIMARY KEY,
    name text UNIQUE,
    discount_rate float NOT NULL,
    economic_factor float NOT NULL,
    starting_year int NOT NULL,
    growth_rates jsonb NOT NULL,
    traffic_levels jsonb NOT NULL,
    road_works jsonb NOT NULL,
    recurrent_maintenance jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX cba_user_configs_idx ON cba_user_configs USING btree (id);

INSERT INTO cba_user_configs
  VALUES ('Default', 0.12, 0.91, 2022, '[]','[]','[]','[]'),
         ('DiscountRate 14%', 0.14, 0.91, 2022, '[]','[]','[]','[]'),   
         ('DiscountRate 16%', 0.16, 0.91, 2022, '[]','[]','[]','[]'),
         ('Work Cost -10%', 0.12, 0.91, 2022, '[]','[]','[]','[]'),
         ('Work Cost -20%', 0.12, 0.91, 2022, '[]','[]','[]','[]');

UPDATE cba_user_configs SET traffic_levels = '{"by_level": {"0": {"aadt": 25, "struct_no": 1.5, "motorcycle": 0.75, "small_car": 0.02, "medium_car": 0.05, "delivery": 0.01, "four_wheel_drive": 0.01, "light_truck": 0.12, "medium_truck": 0.03, "heavy_truck": 0.0, "articulated_truck": 0.0, "small_bus": 0.01, "medium_bus": 0.0, "large_bus": 0.0, "proportions": [0.75, 0.02, 0.05, 0.01, 0.01, 0.12, 0.03, 0.0, 0.0, 0.01, 0.0, 0.0]}, "1": {"aadt": 75, "struct_no": 1.5, "motorcycle": 0.75, "small_car": 0.02, "medium_car": 0.05, "delivery": 0.01, "four_wheel_drive": 0.01, "light_truck": 0.12, "medium_truck": 0.03, "heavy_truck": 0.0, "articulated_truck": 0.0, "small_bus": 0.01, "medium_bus": 0.0, "large_bus": 0.0, "proportions": [0.75, 0.02, 0.05, 0.01, 0.01, 0.12, 0.03, 0.0, 0.0, 0.01, 0.0, 0.0]}, "2": {"aadt": 175, "struct_no": 1.5, "motorcycle": 0.65, "small_car": 0.03, "medium_car": 0.07, "delivery": 0.02, "four_wheel_drive": 0.02, "light_truck": 0.13, "medium_truck": 0.04, "heavy_truck": 0.01, "articulated_truck": 0.0, "small_bus": 0.02, "medium_bus": 0.01, "large_bus": 0.0, "proportions": [0.65, 0.03, 0.07, 0.02, 0.02, 0.13, 0.04, 0.01, 0.0, 0.02, 0.01, 0.0]}, "3": {"aadt": 375, "struct_no": 2.0, "motorcycle": 0.65, "small_car": 0.03, "medium_car": 0.07, "delivery": 0.02, "four_wheel_drive": 0.02, "light_truck": 0.13, "medium_truck": 0.04, "heavy_truck": 0.01, "articulated_truck": 0.0, "small_bus": 0.02, "medium_bus": 0.01, "large_bus": 0.0, "proportions": [0.65, 0.03, 0.07, 0.02, 0.02, 0.13, 0.04, 0.01, 0.0, 0.02, 0.01, 0.0]}, "4": {"aadt": 750, "struct_no": 3.0, "motorcycle": 0.5, "small_car": 0.05, "medium_car": 0.09, "delivery": 0.04, "four_wheel_drive": 0.04, "light_truck": 0.15, "medium_truck": 0.06, "heavy_truck": 0.02, "articulated_truck": 0.0, "small_bus": 0.04, "medium_bus": 0.01, "large_bus": 0.0, "proportions": [0.5, 0.05, 0.09, 0.04, 0.04, 0.15, 0.06, 0.02, 0.0, 0.04, 0.01, 0.0]}, "5": {"aadt": 2000, "struct_no": 4.0, "motorcycle": 0.5, "small_car": 0.05, "medium_car": 0.09, "delivery": 0.04, "four_wheel_drive": 0.04, "light_truck": 0.15, "medium_truck": 0.06, "heavy_truck": 0.02, "articulated_truck": 0.0, "small_bus": 0.04, "medium_bus": 0.01, "large_bus": 0.0, "proportions": [0.5, 0.05, 0.09, 0.04, 0.04, 0.15, 0.06, 0.02, 0.0, 0.04, 0.01, 0.0]}, "6": {"aadt": 4000, "struct_no": 5.0, "motorcycle": 0.5, "small_car": 0.05, "medium_car": 0.09, "delivery": 0.04, "four_wheel_drive": 0.04, "light_truck": 0.15, "medium_truck": 0.06, "heavy_truck": 0.02, "articulated_truck": 0.0, "small_bus": 0.04, "medium_bus": 0.01, "large_bus": 0.0, "proportions": [0.5, 0.05, 0.09, 0.04, 0.04, 0.15, 0.06, 0.02, 0.0, 0.04, 0.01, 0.0]}, "7": {"aadt": 6000, "struct_no": 6.0, "motorcycle": 0.5, "small_car": 0.05, "medium_car": 0.09, "delivery": 0.04, "four_wheel_drive": 0.04, "light_truck": 0.15, "medium_truck": 0.06, "heavy_truck": 0.02, "articulated_truck": 0.0, "small_bus": 0.04, "medium_bus": 0.01, "large_bus": 0.0, "proportions": [0.5, 0.05, 0.09, 0.04, 0.04, 0.15, 0.06, 0.02, 0.0, 0.04, 0.01, 0.0]}, "8": {"aadt": 8000, "struct_no": 7.0, "motorcycle": 0.5, "small_car": 0.05, "medium_car": 0.09, "delivery": 0.04, "four_wheel_drive": 0.04, "light_truck": 0.15, "medium_truck": 0.06, "heavy_truck": 0.02, "articulated_truck": 0.0, "small_bus": 0.04, "medium_bus": 0.01, "large_bus": 0.0, "proportions": [0.5, 0.05, 0.09, 0.04, 0.04, 0.15, 0.06, 0.02, 0.0, 0.04, 0.01, 0.0]}, "9": {"aadt": 10500, "struct_no": 8.0, "motorcycle": 0.25, "small_car": 0.08, "medium_car": 0.12, "delivery": 0.07, "four_wheel_drive": 0.07, "light_truck": 0.18, "medium_truck": 0.08, "heavy_truck": 0.05, "articulated_truck": 0.01, "small_bus": 0.06, "medium_bus": 0.02, "large_bus": 0.01, "proportions": [0.25, 0.08, 0.12, 0.07, 0.07, 0.18, 0.08, 0.05, 0.01, 0.06, 0.02, 0.01]}, "10": {"aadt": 13500, "struct_no": 8.0, "motorcycle": 0.25, "small_car": 0.08, "medium_car": 0.12, "delivery": 0.07, "four_wheel_drive": 0.07, "light_truck": 0.18, "medium_truck": 0.08, "heavy_truck": 0.05, "articulated_truck": 0.01, "small_bus": 0.06, "medium_bus": 0.02, "large_bus": 0.01, "proportions": [0.25, 0.08, 0.12, 0.07, 0.07, 0.18, 0.08, 0.05, 0.01, 0.06, 0.02, 0.01]}, "11": {"aadt": 17500, "struct_no": 8.0, "motorcycle": 0.25, "small_car": 0.08, "medium_car": 0.12, "delivery": 0.07, "four_wheel_drive": 0.07, "light_truck": 0.18, "medium_truck": 0.08, "heavy_truck": 0.05, "articulated_truck": 0.01, "small_bus": 0.06, "medium_bus": 0.02, "large_bus": 0.01, "proportions": [0.25, 0.08, 0.12, 0.07, 0.07, 0.18, 0.08, 0.05, 0.01, 0.06, 0.02, 0.01]}, "12": {"aadt": 25000, "struct_no": 8.0, "motorcycle": 0.25, "small_car": 0.08, "medium_car": 0.12, "delivery": 0.07, "four_wheel_drive": 0.07, "light_truck": 0.18, "medium_truck": 0.08, "heavy_truck": 0.05, "articulated_truck": 0.01, "small_bus": 0.06, "medium_bus": 0.02, "large_bus": 0.01, "proportions": [0.25, 0.08, 0.12, 0.07, 0.07, 0.18, 0.08, 0.05, 0.01, 0.06, 0.02, 0.01]}, "13": {"aadt": 35000, "struct_no": 8.0, "motorcycle": 0.25, "small_car": 0.08, "medium_car": 0.12, "delivery": 0.07, "four_wheel_drive": 0.07, "light_truck": 0.18, "medium_truck": 0.08, "heavy_truck": 0.05, "articulated_truck": 0.01, "small_bus": 0.06, "medium_bus": 0.02, "large_bus": 0.01, "proportions": [0.25, 0.08, 0.12, 0.07, 0.07, 0.18, 0.08, 0.05, 0.01, 0.06, 0.02, 0.01]}, "14": {"aadt": 500000, "struct_no": 8.0, "motorcycle": 0.25, "small_car": 0.08, "medium_car": 0.12, "delivery": 0.07, "four_wheel_drive": 0.07, "light_truck": 0.18, "medium_truck": 0.08, "heavy_truck": 0.05, "articulated_truck": 0.01, "small_bus": 0.06, "medium_bus": 0.02, "large_bus": 0.01, "proportions": [0.25, 0.08, 0.12, 0.07, 0.07, 0.18, 0.08, 0.05, 0.01, 0.06, 0.02, 0.01]}}}';

UPDATE cba_user_configs SET traffic_levels = '{"by_level": {
  "0": {"aadt": 25, "struct_no": 1.5, "motorcycle": 0.75, "small_car": 0.02, "medium_car": 0.05, "delivery": 0.01, "four_wheel_drive": 0.01, "light_truck": 0.12, "medium_truck": 0.03, "heavy_truck": 0.0, "articulated_truck": 0.0, "small_bus": 0.01, "medium_bus": 0.0, "large_bus": 0.0         }, 
  "1": {"aadt": 75, "struct_no": 1.5, "motorcycle": 0.75, "small_car": 0.02, "medium_car": 0.05, "delivery": 0.01, "four_wheel_drive": 0.01, "light_truck": 0.12, "medium_truck": 0.03, "heavy_truck": 0.0, "articulated_truck": 0.0, "small_bus": 0.01, "medium_bus": 0.0, "large_bus": 0.0         }, 
  "2": {"aadt": 175, "struct_no": 1.5, "motorcycle": 0.65, "small_car": 0.03, "medium_car": 0.07, "delivery": 0.02, "four_wheel_drive": 0.02, "light_truck": 0.13, "medium_truck": 0.04, "heavy_truck": 0.01, "articulated_truck": 0.0, "small_bus": 0.02, "medium_bus": 0.01, "large_bus": 0.0      }, 
  "3": {"aadt": 375, "struct_no": 2.0, "motorcycle": 0.65, "small_car": 0.03, "medium_car": 0.07, "delivery": 0.02, "four_wheel_drive": 0.02, "light_truck": 0.13, "medium_truck": 0.04, "heavy_truck": 0.01, "articulated_truck": 0.0, "small_bus": 0.02, "medium_bus": 0.01, "large_bus": 0.0      }, 
  "4": {"aadt": 750, "struct_no": 3.0, "motorcycle": 0.5, "small_car": 0.05, "medium_car": 0.09, "delivery": 0.04, "four_wheel_drive": 0.04, "light_truck": 0.15, "medium_truck": 0.06, "heavy_truck": 0.02, "articulated_truck": 0.0, "small_bus": 0.04, "medium_bus": 0.01, "large_bus": 0.0       }, 
  "5": {"aadt": 2000, "struct_no": 4.0, "motorcycle": 0.5, "small_car": 0.05, "medium_car": 0.09, "delivery": 0.04, "four_wheel_drive": 0.04, "light_truck": 0.15, "medium_truck": 0.06, "heavy_truck": 0.02, "articulated_truck": 0.0, "small_bus": 0.04, "medium_bus": 0.01, "large_bus": 0.0      }, 
  "6": {"aadt": 4000, "struct_no": 5.0, "motorcycle": 0.5, "small_car": 0.05, "medium_car": 0.09, "delivery": 0.04, "four_wheel_drive": 0.04, "light_truck": 0.15, "medium_truck": 0.06, "heavy_truck": 0.02, "articulated_truck": 0.0, "small_bus": 0.04, "medium_bus": 0.01, "large_bus": 0.0      }, 
  "7": {"aadt": 6000, "struct_no": 6.0, "motorcycle": 0.5, "small_car": 0.05, "medium_car": 0.09, "delivery": 0.04, "four_wheel_drive": 0.04, "light_truck": 0.15, "medium_truck": 0.06, "heavy_truck": 0.02, "articulated_truck": 0.0, "small_bus": 0.04, "medium_bus": 0.01, "large_bus": 0.0      }, 
  "8": {"aadt": 8000, "struct_no": 7.0, "motorcycle": 0.5, "small_car": 0.05, "medium_car": 0.09, "delivery": 0.04, "four_wheel_drive": 0.04, "light_truck": 0.15, "medium_truck": 0.06, "heavy_truck": 0.02, "articulated_truck": 0.0, "small_bus": 0.04, "medium_bus": 0.01, "large_bus": 0.0      }, 
  "9": {"aadt": 10500, "struct_no": 8.0, "motorcycle": 0.25, "small_car": 0.08, "medium_car": 0.12, "delivery": 0.07, "four_wheel_drive": 0.07, "light_truck": 0.18, "medium_truck": 0.08, "heavy_truck": 0.05, "articulated_truck": 0.01, "small_bus": 0.06, "medium_bus": 0.02, "large_bus": 0.01  }, 
  "10": {"aadt": 13500, "struct_no": 8.0, "motorcycle": 0.25, "small_car": 0.08, "medium_car": 0.12, "delivery": 0.07, "four_wheel_drive": 0.07, "light_truck": 0.18, "medium_truck": 0.08, "heavy_truck": 0.05, "articulated_truck": 0.01, "small_bus": 0.06, "medium_bus": 0.02, "large_bus": 0.01 }, 
  "11": {"aadt": 17500, "struct_no": 8.0, "motorcycle": 0.25, "small_car": 0.08, "medium_car": 0.12, "delivery": 0.07, "four_wheel_drive": 0.07, "light_truck": 0.18, "medium_truck": 0.08, "heavy_truck": 0.05, "articulated_truck": 0.01, "small_bus": 0.06, "medium_bus": 0.02, "large_bus": 0.01 }, 
  "12": {"aadt": 25000, "struct_no": 8.0, "motorcycle": 0.25, "small_car": 0.08, "medium_car": 0.12, "delivery": 0.07, "four_wheel_drive": 0.07, "light_truck": 0.18, "medium_truck": 0.08, "heavy_truck": 0.05, "articulated_truck": 0.01, "small_bus": 0.06, "medium_bus": 0.02, "large_bus": 0.01 }, 
  "13": {"aadt": 35000, "struct_no": 8.0, "motorcycle": 0.25, "small_car": 0.08, "medium_car": 0.12, "delivery": 0.07, "four_wheel_drive": 0.07, "light_truck": 0.18, "medium_truck": 0.08, "heavy_truck": 0.05, "articulated_truck": 0.01, "small_bus": 0.06, "medium_bus": 0.02, "large_bus": 0.01 }, 
  "14": {"aadt": 500000, "struct_no": 8.0, "motorcycle": 0.25, "small_car": 0.08, "medium_car": 0.12, "delivery": 0.07, "four_wheel_drive": 0.07, "light_truck": 0.18, "medium_truck": 0.08, "heavy_truck": 0.05, "articulated_truck": 0.01, "small_bus": 0.06, "medium_bus": 0.02, "large_bus": 0.01}}}
  ';


UPDATE cba_user_configs SET road_works = '{ "alternatives": [
{"name": "Periodic Maintenance (Concrete)", "code": "C-P", "work_class": "Periodic", "cost_flat": 132.0, "cost_hilly": 132.0, "cost_mountainous": 132.0, "iri": 3.0, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 1, "repair_period": 8, "idx": 0},
{"name": "Reconstruction (Concrete)", "code": "C-R", "work_class": "Rehabilitation", "cost_flat": 549.0, "cost_hilly": 549.0, "cost_mountainous": 549.0, "iri": 1.8, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 1, "repair_period": 8, "idx": 1},
{"name": "Reseal", "code": "B-P1", "work_class": "Periodic", "cost_flat": 127.0, "cost_hilly": 127.0, "cost_mountainous": 127.0, "iri": 4.0, "lanes_class": 0, "width": 0, "surface": 0, "thickness": 25, "strength": 0.2, "snc": null, "repair": 4, "repair_period": 8, "idx": 2},
{"name": "Functional Overlay (<=50mm)", "code": "B-P2", "work_class": "Periodic", "cost_flat": 176.25, "cost_hilly": 176.25, "cost_mountainous": 176.25, "iri": 3.5, "lanes_class": 0, "width": 0, "surface": 0, "thickness": 50, "strength": 0.4, "snc": null, "repair": 4, "repair_period": 8, "idx": 3},
{"name": "Structural Overlay (51-100mm)", "code": "B-P3", "work_class": "Periodic", "cost_flat": 282.0, "cost_hilly": 282.0, "cost_mountainous": 282.0, "iri": 3.0, "lanes_class": 0, "width": 0, "surface": 0, "thickness": 80, "strength": 0.4, "snc": null, "repair": 4, "repair_period": 8, "idx": 4},
{"name": "Thick Overlay (>100mm)", "code": "B-R1", "work_class": "Rehabilitation", "cost_flat": 352.5, "cost_hilly": 352.5, "cost_mountainous": 352.5, "iri": 2.5, "lanes_class": 0, "width": 0, "surface": 0, "thickness": 100, "strength": 0.4, "snc": null, "repair": 4, "repair_period": 8, "idx": 5},
{"name": "Reconstruction Type V", "code": "B-R2", "work_class": "Rehabilitation", "cost_flat": 397.0, "cost_hilly": 397.0, "cost_mountainous": 397.0, "iri": 2.0, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": 2.0, "repair": 4, "repair_period": 8, "idx": 6},
{"name": "Reconstruction Type IV", "code": "B-R3", "work_class": "Rehabilitation", "cost_flat": 397.0, "cost_hilly": 397.0, "cost_mountainous": 397.0, "iri": 2.0, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": 3.0, "repair": 4, "repair_period": 8, "idx": 7},
{"name": "Reconstruction Type III", "code": "B-R4", "work_class": "Rehabilitation", "cost_flat": 397.0, "cost_hilly": 397.0, "cost_mountainous": 397.0, "iri": 2.0, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": 4.0, "repair": 4, "repair_period": 8, "idx": 8},
{"name": "Reconstruction Type II", "code": "B-R5", "work_class": "Rehabilitation", "cost_flat": 397.0, "cost_hilly": 397.0, "cost_mountainous": 397.0, "iri": 2.0, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": 5.0, "repair": 4, "repair_period": 8, "idx": 9},
{"name": "Reconstruction Type I", "code": "B-R6", "work_class": "Rehabilitation", "cost_flat": 397.0, "cost_hilly": 397.0, "cost_mountainous": 397.0, "iri": 2.0, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": 6.0, "repair": 4, "repair_period": 8, "idx": 10},
{"name": "Regravelling (Gravel)", "code": "G-P", "work_class": "Periodic", "cost_flat": 37.0, "cost_hilly": 37.0, "cost_mountainous": 37.0, "iri": 12.0, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 12, "repair_period": 4, "idx": 11},
{"name": "Reconstruction (Gravel)", "code": "G-R", "work_class": "Rehabilitation", "cost_flat": 114.0, "cost_hilly": 114.0, "cost_mountainous": 114.0, "iri": 7.0, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 12, "repair_period": 4, "idx": 12},
{"name": "Heavy Grading (Earth)", "code": "E-P", "work_class": "Periodic", "cost_flat": 16.0, "cost_hilly": 16.0, "cost_mountainous": 16.0, "iri": 16.0, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 14, "repair_period": 4, "idx": 13},
{"name": "Reconstruction (Earth)", "code": "E-R", "work_class": "Rehabilitation", "cost_flat": 24.0, "cost_hilly": 24.0, "cost_mountainous": 24.0, "iri": 10.0, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 14, "repair_period": 4, "idx": 14},
{"name": "Periodic Maintenance (Macadam)", "code": "M-P", "work_class": "Periodic", "cost_flat": 37.0, "cost_hilly": 37.0, "cost_mountainous": 37.0, "iri": 8.0, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 16, "repair_period": 8, "idx": 15},
{"name": "Reconstruction (Macadam)", "code": "M-R", "work_class": "Rehabilitation", "cost_flat": 114.0, "cost_hilly": 114.0, "cost_mountainous": 114.0, "iri": 4.0, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 16, "repair_period": 8, "idx": 16},
{"name": "Periodic Maintenance (Cobblestone)", "code": "O-P", "work_class": "Periodic", "cost_flat": 37.0, "cost_hilly": 37.0, "cost_mountainous": 37.0, "iri": 8.0, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 18, "repair_period": 8, "idx": 17},
{"name": "Reconstruction (Cobblestone)", "code": "O-R", "work_class": "Rehabilitation", "cost_flat": 114.0, "cost_hilly": 114.0, "cost_mountainous": 114.0, "iri": 4.0, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 18, "repair_period": 8, "idx": 18},
{"name": "Upgrade to Cobblestone", "code": "U-C", "work_class": "Upgrade", "cost_flat": 500.0, "cost_hilly": 500.0, "cost_mountainous": 500.0, "iri": 4.0, "lanes_class": 3, "width": 7.0, "surface": 7, "thickness": null, "strength": null, "snc": null, "repair": 18, "repair_period": 8, "idx": 19},
{"name": "Upgrade to Macadam", "code": "U-M", "work_class": "Upgrade", "cost_flat": 500.0, "cost_hilly": 500.0, "cost_mountainous": 500.0, "iri": 4.0, "lanes_class": 3, "width": 7.0, "surface": 6, "thickness": null, "strength": null, "snc": null, "repair": 16, "repair_period": 8, "idx": 20},
{"name": "Upgrade to Gravel", "code": "U-G", "work_class": "Upgrade", "cost_flat": 500.0, "cost_hilly": 500.0, "cost_mountainous": 500.0, "iri": 8.0, "lanes_class": 3, "width": 7.0, "surface": 4, "thickness": null, "strength": null, "snc": null, "repair": 12, "repair_period": 4, "idx": 21},
{"name": "Upgrade to Surface Treatment", "code": "U-S", "work_class": "Upgrade", "cost_flat": 500.0, "cost_hilly": 500.0, "cost_mountainous": 500.0, "iri": 2.6, "lanes_class": 3, "width": 7.0, "surface": 3, "thickness": null, "strength": null, "snc": 2.0, "repair": 4, "repair_period": 8, "idx": 22},
{"name": "Upgrade to Asphalt Concrete", "code": "U-A", "work_class": "Upgrade", "cost_flat": 500.0, "cost_hilly": 500.0, "cost_mountainous": 500.0, "iri": 2.2, "lanes_class": 3, "width": 7.0, "surface": 2, "thickness": null, "strength": null, "snc": 4.0, "repair": 4, "repair_period": 8, "idx": 23},
{"name": "Upgrade to Cement Concrete", "code": "U-C2", "work_class": "Upgrade", "cost_flat": 500.0, "cost_hilly": 500.0, "cost_mountainous": 500.0, "iri": 1.8, "lanes_class": 3, "width": 7.0, "surface": 1, "thickness": null, "strength": null, "snc": null, "repair": 1, "repair_period": 8, "idx": 24}
]}';

-- Generated with :
--   pbpaste | jq '.[] | map(. + {cost_flat: (.cost_flat * 0.9), cost_hilly: (.cost_hilly * 0.9), cost_mountainous: (.cost_mountainous * 0.9)})' | pbcopy
UPDATE cba_user_configs SET road_works = '{ "alternatives": [
  { "name": "Periodic Maintenance (Concrete)", "code": "C-P", "work_class": "Periodic", "cost_flat": 118.8, "cost_hilly": 118.8, "cost_mountainous": 118.8, "iri": 3, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 1, "repair_period": 8, "idx": 0 },
  { "name": "Reconstruction (Concrete)", "code": "C-R", "work_class": "Rehabilitation", "cost_flat": 494.1, "cost_hilly": 494.1, "cost_mountainous": 494.1, "iri": 1.8, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 1, "repair_period": 8, "idx": 1 },
  { "name": "Reseal", "code": "B-P1", "work_class": "Periodic", "cost_flat": 114.3, "cost_hilly": 114.3, "cost_mountainous": 114.3, "iri": 4, "lanes_class": 0, "width": 0, "surface": 0, "thickness": 25, "strength": 0.2, "snc": null, "repair": 4, "repair_period": 8, "idx": 2 },
  { "name": "Functional Overlay (<=50mm)", "code": "B-P2", "work_class": "Periodic", "cost_flat": 158.625, "cost_hilly": 158.625, "cost_mountainous": 158.625, "iri": 3.5, "lanes_class": 0, "width": 0, "surface": 0, "thickness": 50, "strength": 0.4, "snc": null, "repair": 4, "repair_period": 8, "idx": 3 },
  { "name": "Structural Overlay (51-100mm)", "code": "B-P3", "work_class": "Periodic", "cost_flat": 253.8, "cost_hilly": 253.8, "cost_mountainous": 253.8, "iri": 3, "lanes_class": 0, "width": 0, "surface": 0, "thickness": 80, "strength": 0.4, "snc": null, "repair": 4, "repair_period": 8, "idx": 4 },
  { "name": "Thick Overlay (>100mm)", "code": "B-R1", "work_class": "Rehabilitation", "cost_flat": 317.25, "cost_hilly": 317.25, "cost_mountainous": 317.25, "iri": 2.5, "lanes_class": 0, "width": 0, "surface": 0, "thickness": 100, "strength": 0.4, "snc": null, "repair": 4, "repair_period": 8, "idx": 5 },
  { "name": "Reconstruction Type V", "code": "B-R2", "work_class": "Rehabilitation", "cost_flat": 357.3, "cost_hilly": 357.3, "cost_mountainous": 357.3, "iri": 2, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": 2, "repair": 4, "repair_period": 8, "idx": 6 },
  { "name": "Reconstruction Type IV", "code": "B-R3", "work_class": "Rehabilitation", "cost_flat": 357.3, "cost_hilly": 357.3, "cost_mountainous": 357.3, "iri": 2, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": 3, "repair": 4, "repair_period": 8, "idx": 7 },
  { "name": "Reconstruction Type III", "code": "B-R4", "work_class": "Rehabilitation", "cost_flat": 357.3, "cost_hilly": 357.3, "cost_mountainous": 357.3, "iri": 2, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": 4, "repair": 4, "repair_period": 8, "idx": 8 },
  { "name": "Reconstruction Type II", "code": "B-R5", "work_class": "Rehabilitation", "cost_flat": 357.3, "cost_hilly": 357.3, "cost_mountainous": 357.3, "iri": 2, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": 5, "repair": 4, "repair_period": 8, "idx": 9 },
  { "name": "Reconstruction Type I", "code": "B-R6", "work_class": "Rehabilitation", "cost_flat": 357.3, "cost_hilly": 357.3, "cost_mountainous": 357.3, "iri": 2, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": 6, "repair": 4, "repair_period": 8, "idx": 10 },
  { "name": "Regravelling (Gravel)", "code": "G-P", "work_class": "Periodic", "cost_flat": 33.300000000000004, "cost_hilly": 33.300000000000004, "cost_mountainous": 33.300000000000004, "iri": 12, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 12, "repair_period": 4, "idx": 11 },
  { "name": "Reconstruction (Gravel)", "code": "G-R", "work_class": "Rehabilitation", "cost_flat": 102.60000000000001, "cost_hilly": 102.60000000000001, "cost_mountainous": 102.60000000000001, "iri": 7, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 12, "repair_period": 4, "idx": 12 },
  { "name": "Heavy Grading (Earth)", "code": "E-P", "work_class": "Periodic", "cost_flat": 14.4, "cost_hilly": 14.4, "cost_mountainous": 14.4, "iri": 16, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 14, "repair_period": 4, "idx": 13 },
  { "name": "Reconstruction (Earth)", "code": "E-R", "work_class": "Rehabilitation", "cost_flat": 21.6, "cost_hilly": 21.6, "cost_mountainous": 21.6, "iri": 10, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 14, "repair_period": 4, "idx": 14 },
  { "name": "Periodic Maintenance (Macadam)", "code": "M-P", "work_class": "Periodic", "cost_flat": 33.300000000000004, "cost_hilly": 33.300000000000004, "cost_mountainous": 33.300000000000004, "iri": 8, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 16, "repair_period": 8, "idx": 15 },
  { "name": "Reconstruction (Macadam)", "code": "M-R", "work_class": "Rehabilitation", "cost_flat": 102.60000000000001, "cost_hilly": 102.60000000000001, "cost_mountainous": 102.60000000000001, "iri": 4, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 16, "repair_period": 8, "idx": 16 },
  { "name": "Periodic Maintenance (Cobblestone)", "code": "O-P", "work_class": "Periodic", "cost_flat": 33.300000000000004, "cost_hilly": 33.300000000000004, "cost_mountainous": 33.300000000000004, "iri": 8, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 18, "repair_period": 8, "idx": 17 },
  { "name": "Reconstruction (Cobblestone)", "code": "O-R", "work_class": "Rehabilitation", "cost_flat": 102.60000000000001, "cost_hilly": 102.60000000000001, "cost_mountainous": 102.60000000000001, "iri": 4, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 18, "repair_period": 8, "idx": 18 },
  { "name": "Upgrade to Cobblestone", "code": "U-C", "work_class": "Upgrade", "cost_flat": 450, "cost_hilly": 450, "cost_mountainous": 450, "iri": 4, "lanes_class": 3, "width": 7, "surface": 7, "thickness": null, "strength": null, "snc": null, "repair": 18, "repair_period": 8, "idx": 19 },
  { "name": "Upgrade to Macadam", "code": "U-M", "work_class": "Upgrade", "cost_flat": 450, "cost_hilly": 450, "cost_mountainous": 450, "iri": 4, "lanes_class": 3, "width": 7, "surface": 6, "thickness": null, "strength": null, "snc": null, "repair": 16, "repair_period": 8, "idx": 20 },
  { "name": "Upgrade to Gravel", "code": "U-G", "work_class": "Upgrade", "cost_flat": 450, "cost_hilly": 450, "cost_mountainous": 450, "iri": 8, "lanes_class": 3, "width": 7, "surface": 4, "thickness": null, "strength": null, "snc": null, "repair": 12, "repair_period": 4, "idx": 21 },
  { "name": "Upgrade to Surface Treatment", "code": "U-S", "work_class": "Upgrade", "cost_flat": 450, "cost_hilly": 450, "cost_mountainous": 450, "iri": 2.6, "lanes_class": 3, "width": 7, "surface": 3, "thickness": null, "strength": null, "snc": 2, "repair": 4, "repair_period": 8, "idx": 22 },
  { "name": "Upgrade to Asphalt Concrete", "code": "U-A", "work_class": "Upgrade", "cost_flat": 450, "cost_hilly": 450, "cost_mountainous": 450, "iri": 2.2, "lanes_class": 3, "width": 7, "surface": 2, "thickness": null, "strength": null, "snc": 4, "repair": 4, "repair_period": 8, "idx": 23 },
  { "name": "Upgrade to Cement Concrete", "code": "U-C2", "work_class": "Upgrade", "cost_flat": 450, "cost_hilly": 450, "cost_mountainous": 450, "iri": 1.8, "lanes_class": 3, "width": 7, "surface": 1, "thickness": null, "strength": null, "snc": null, "repair": 1, "repair_period": 8, "idx": 24 }
]}' WHERE id = 4;


-- Generated with :
--   pbpaste | jq '.[] | map(. + {cost_flat: (.cost_flat * 0.8), cost_hilly: (.cost_hilly * 0.8), cost_mountainous: (.cost_mountainous * 0.8)})' | pbcopy
UPDATE cba_user_configs SET road_works = '{ "alternatives": [
  { "name": "Periodic Maintenance (Concrete)", "code": "C-P", "work_class": "Periodic", "cost_flat": 95.04, "cost_hilly": 95.04, "cost_mountainous": 95.04, "iri": 3, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 1, "repair_period": 8, "idx": 0 },
  { "name": "Reconstruction (Concrete)", "code": "C-R", "work_class": "Rehabilitation", "cost_flat": 395.28000000000003, "cost_hilly": 395.28000000000003, "cost_mountainous": 395.28000000000003, "iri": 1.8, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 1, "repair_period": 8, "idx": 1 },
  { "name": "Reseal", "code": "B-P1", "work_class": "Periodic", "cost_flat": 91.44, "cost_hilly": 91.44, "cost_mountainous": 91.44, "iri": 4, "lanes_class": 0, "width": 0, "surface": 0, "thickness": 25, "strength": 0.2, "snc": null, "repair": 4, "repair_period": 8, "idx": 2 },
  { "name": "Functional Overlay (<=50mm)", "code": "B-P2", "work_class": "Periodic", "cost_flat": 126.9, "cost_hilly": 126.9, "cost_mountainous": 126.9, "iri": 3.5, "lanes_class": 0, "width": 0, "surface": 0, "thickness": 50, "strength": 0.4, "snc": null, "repair": 4, "repair_period": 8, "idx": 3 },
  { "name": "Structural Overlay (51-100mm)", "code": "B-P3", "work_class": "Periodic", "cost_flat": 203.04000000000002, "cost_hilly": 203.04000000000002, "cost_mountainous": 203.04000000000002, "iri": 3, "lanes_class": 0, "width": 0, "surface": 0, "thickness": 80, "strength": 0.4, "snc": null, "repair": 4, "repair_period": 8, "idx": 4 },
  { "name": "Thick Overlay (>100mm)", "code": "B-R1", "work_class": "Rehabilitation", "cost_flat": 253.8, "cost_hilly": 253.8, "cost_mountainous": 253.8, "iri": 2.5, "lanes_class": 0, "width": 0, "surface": 0, "thickness": 100, "strength": 0.4, "snc": null, "repair": 4, "repair_period": 8, "idx": 5 },
  { "name": "Reconstruction Type V", "code": "B-R2", "work_class": "Rehabilitation", "cost_flat": 285.84000000000003, "cost_hilly": 285.84000000000003, "cost_mountainous": 285.84000000000003, "iri": 2, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": 2, "repair": 4, "repair_period": 8, "idx": 6 },
  { "name": "Reconstruction Type IV", "code": "B-R3", "work_class": "Rehabilitation", "cost_flat": 285.84000000000003, "cost_hilly": 285.84000000000003, "cost_mountainous": 285.84000000000003, "iri": 2, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": 3, "repair": 4, "repair_period": 8, "idx": 7 },
  { "name": "Reconstruction Type III", "code": "B-R4", "work_class": "Rehabilitation", "cost_flat": 285.84000000000003, "cost_hilly": 285.84000000000003, "cost_mountainous": 285.84000000000003, "iri": 2, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": 4, "repair": 4, "repair_period": 8, "idx": 8 },
  { "name": "Reconstruction Type II", "code": "B-R5", "work_class": "Rehabilitation", "cost_flat": 285.84000000000003, "cost_hilly": 285.84000000000003, "cost_mountainous": 285.84000000000003, "iri": 2, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": 5, "repair": 4, "repair_period": 8, "idx": 9 },
  { "name": "Reconstruction Type I", "code": "B-R6", "work_class": "Rehabilitation", "cost_flat": 285.84000000000003, "cost_hilly": 285.84000000000003, "cost_mountainous": 285.84000000000003, "iri": 2, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": 6, "repair": 4, "repair_period": 8, "idx": 10 },
  { "name": "Regravelling (Gravel)", "code": "G-P", "work_class": "Periodic", "cost_flat": 26.640000000000004, "cost_hilly": 26.640000000000004, "cost_mountainous": 26.640000000000004, "iri": 12, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 12, "repair_period": 4, "idx": 11 },
  { "name": "Reconstruction (Gravel)", "code": "G-R", "work_class": "Rehabilitation", "cost_flat": 82.08000000000001, "cost_hilly": 82.08000000000001, "cost_mountainous": 82.08000000000001, "iri": 7, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 12, "repair_period": 4, "idx": 12 },
  { "name": "Heavy Grading (Earth)", "code": "E-P", "work_class": "Periodic", "cost_flat": 11.520000000000001, "cost_hilly": 11.520000000000001, "cost_mountainous": 11.520000000000001, "iri": 16, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 14, "repair_period": 4, "idx": 13 },
  { "name": "Reconstruction (Earth)", "code": "E-R", "work_class": "Rehabilitation", "cost_flat": 17.28, "cost_hilly": 17.28, "cost_mountainous": 17.28, "iri": 10, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 14, "repair_period": 4, "idx": 14 },
  { "name": "Periodic Maintenance (Macadam)", "code": "M-P", "work_class": "Periodic", "cost_flat": 26.640000000000004, "cost_hilly": 26.640000000000004, "cost_mountainous": 26.640000000000004, "iri": 8, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 16, "repair_period": 8, "idx": 15 },
  { "name": "Reconstruction (Macadam)", "code": "M-R", "work_class": "Rehabilitation", "cost_flat": 82.08000000000001, "cost_hilly": 82.08000000000001, "cost_mountainous": 82.08000000000001, "iri": 4, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 16, "repair_period": 8, "idx": 16 },
  { "name": "Periodic Maintenance (Cobblestone)", "code": "O-P", "work_class": "Periodic", "cost_flat": 26.640000000000004, "cost_hilly": 26.640000000000004, "cost_mountainous": 26.640000000000004, "iri": 8, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 18, "repair_period": 8, "idx": 17 },
  { "name": "Reconstruction (Cobblestone)", "code": "O-R", "work_class": "Rehabilitation", "cost_flat": 82.08000000000001, "cost_hilly": 82.08000000000001, "cost_mountainous": 82.08000000000001, "iri": 4, "lanes_class": 0, "width": 0, "surface": 0, "thickness": null, "strength": null, "snc": null, "repair": 18, "repair_period": 8, "idx": 18 },
  { "name": "Upgrade to Cobblestone", "code": "U-C", "work_class": "Upgrade", "cost_flat": 360, "cost_hilly": 360, "cost_mountainous": 360, "iri": 4, "lanes_class": 3, "width": 7, "surface": 7, "thickness": null, "strength": null, "snc": null, "repair": 18, "repair_period": 8, "idx": 19 },
  { "name": "Upgrade to Macadam", "code": "U-M", "work_class": "Upgrade", "cost_flat": 360, "cost_hilly": 360, "cost_mountainous": 360, "iri": 4, "lanes_class": 3, "width": 7, "surface": 6, "thickness": null, "strength": null, "snc": null, "repair": 16, "repair_period": 8, "idx": 20 },
  { "name": "Upgrade to Gravel", "code": "U-G", "work_class": "Upgrade", "cost_flat": 360, "cost_hilly": 360, "cost_mountainous": 360, "iri": 8, "lanes_class": 3, "width": 7, "surface": 4, "thickness": null, "strength": null, "snc": null, "repair": 12, "repair_period": 4, "idx": 21 },
  { "name": "Upgrade to Surface Treatment", "code": "U-S", "work_class": "Upgrade", "cost_flat": 360, "cost_hilly": 360, "cost_mountainous": 360, "iri": 2.6, "lanes_class": 3, "width": 7, "surface": 3, "thickness": null, "strength": null, "snc": 2, "repair": 4, "repair_period": 8, "idx": 22 },
  { "name": "Upgrade to Asphalt Concrete", "code": "U-A", "work_class": "Upgrade", "cost_flat": 360, "cost_hilly": 360, "cost_mountainous": 360, "iri": 2.2, "lanes_class": 3, "width": 7, "surface": 2, "thickness": null, "strength": null, "snc": 4, "repair": 4, "repair_period": 8, "idx": 23 },
  { "name": "Upgrade to Cement Concrete", "code": "U-C2", "work_class": "Upgrade", "cost_flat": 360, "cost_hilly": 360, "cost_mountainous": 360, "iri": 1.8, "lanes_class": 3, "width": 7, "surface": 1, "thickness": null, "strength": null, "snc": null, "repair": 1, "repair_period": 8, "idx": 24 }
]}' WHERE id = 5;


UPDATE cba_user_configs SET recurrent_maintenance = '{
  "cement_concrete": {
    "one_lane": 10167.7938484056,
    "two_lanes_narrow": 19115.4524350025,
    "two_lanes": 20282.3695008311,
    "two_lanes_wide": 19928.875942875,
    "four_lanes": 20335.5876968112,
    "six_lanes": 20335.5876968112,
    "eight_lanes": 20335.5876968112
  },
  "asphalt_concrete": {
    "one_lane": 14758.9085060652,
    "two_lanes_narrow": 26861.2134810386,
    "two_lanes": 27746.7479914025,
    "two_lanes_wide": 28632.2825017664,
    "four_lanes": 29517.8170121303,
    "six_lanes": 29517.8170121303,
    "eight_lanes": 29517.8170121303
  },
  "surface_treatment": {
    "one_lane": 12117.2647173132,
    "two_lanes_narrow": 18418.242370316,
    "two_lanes": 20357.0047250861,
    "two_lanes_wide": 22295.7670798562,
    "four_lanes": 24234.5294346263,
    "six_lanes": 24234.5294346263,
    "eight_lanes": 24234.5294346263
  },
  "gravel": {
    "one_lane": 8845.72489898381,
    "two_lanes_narrow": 12737.8438545367,
    "two_lanes": 14330.0743363538,
    "two_lanes_wide": 16099.2193161505,
    "four_lanes": 17691.4497979676,
    "six_lanes": 17691.4497979676,
    "eight_lanes": 17691.4497979676
  },
  "earth": {
    "one_lane": 5662.55318106041,
    "two_lanes_narrow": 7361.31913537853,
    "two_lanes": 8607.08083521182,
    "two_lanes_wide": 9966.09359866632,
    "four_lanes": 11325.1063621208,
    "six_lanes": 11325.1063621208,
    "eight_lanes": 11325.1063621208
  },
  "macadam": {
    "one_lane": 12117.2647173132,
    "two_lanes_narrow": 18418.242370316,
    "two_lanes": 20357.0047250861,
    "two_lanes_wide": 22295.7670798562,
    "four_lanes": 24234.5294346263,
    "six_lanes": 24234.5294346263,
    "eight_lanes": 24234.5294346263
  },
  "cobblestones": {
    "one_lane": 8845.72489898381,
    "two_lanes_narrow": 12737.8438545367,
    "two_lanes": 14330.0743363538,
    "two_lanes_wide": 16099.2193161505,
    "four_lanes": 17691.4497979676,
    "six_lanes": 17691.4497979676,
    "eight_lanes": 17691.4497979676
  }
}';


UPDATE cba_user_configs SET growth_rates = '{"very_low": 0.034, "low": 0.046, "medium": 0.054, "high": 0.057, "very_high": 0.086}';

       
