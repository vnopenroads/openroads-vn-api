# Import WON shapefiles to the ORMA database.
# This script converts a road network shapefile to a changeset and imports to the ORMA database. This is an administrative task, and must be performed at before importing new asset data.

# usage: cd utils && ./won-import <shapefile.shp> <api url>
# example: cd utils && ./won-import cam-thuy.shp http://localhost:4000

# Convert Shapefile to OSM Changeset
echo '# Cloning openroads-data tools...'
git clone git@github.com:orma/openroads-data.git

echo '# Creating changeset xml from shapefile...'
python openroads-data/bin/ogr2osm/ogr2osm.py $1 --add-user="openroads" --add-version  --create-changeset --force --add-timestamp -t won-translation.py -o /tmp/won.osm

# Create a changeset
changeset=$(curl -X PUT --data "uid=1&user=openroads" $2/changeset/create)
echo $changeset

# Upload changeset
curl -d @/tmp/won.osm -H 'Content-Type: text/xml' $2/api/0.6/changeset/$changeset/upload

echo '# Import done. Cleaning up...'

# Cleanup
rm -rf openroads-data
rm /tmp/won.osm