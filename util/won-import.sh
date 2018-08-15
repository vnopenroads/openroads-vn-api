# Import WON shapefiles to the ORMA database.
# This script converts a road network shapefile to a changeset and imports to the ORMA database. This is an administrative task, and must be performed at before importing new asset data.

# usage: cd utils && ./won-import <shapefile.shp> <userid> <username> <api url>
# example: cd utils && ./won-import cam-thuy.shp 1 openroads http://localhost:4000

# Convert Shapefile to OSM Changeset
echo '# Cloning openroads-data tools...'
git clone git@github.com:orma/openroads-data.git

echo '# Creating changeset xml from shapefile...'
echo $1
python openroads-data/bin/ogr2osm/ogr2osm.py "$1" --add-user="$3" --add-version  --create-changeset --force --add-timestamp -t won-translation.py -o /tmp/won.osm

# Create a changeset
changeset=$(curl -X PUT --data "uid=$2&user=$3" $4/changeset/create)
echo $changeset

# Upload changeset
curl -d @/tmp/won.osm -H 'Content-Type: text/xml' $4/api/0.6/changeset/$changeset/upload

echo '# Import done. Cleaning up...'

# Cleanup
rm -rf openroads-data
rm /tmp/won.osm