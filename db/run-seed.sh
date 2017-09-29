#!/bin/bash
set -e

# cp data from s3 bucket into the data folder
aws s3 cp s3://openroads-vn-fixture/ ./db/data/ --recursive
