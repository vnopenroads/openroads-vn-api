'''
A translation function for ogr2osm for the ORMA Vietnam WON created from Vietbando and MONRE conflation.

The following are the translations:
1. RoadName -> name
2. RoadClass -> or_responsibility
3. RoadWidth -> or_width
4. RoadType -> Might help identify bridges. Add bridge=yes tag.
'''

def filterTags(attrs):
    if not attrs: return

    tags = {}

    # Add the road name
    if attrs['RoadName']:
        tags.update({'name':attrs['RoadName'].strip(' ').title()})

    # Map the road type to the OSM highway classification
    if attrs['RoadClass'] and attrs['RoadClass'].lower() == "provincial":
        tags.update({'or_responsibility':'provincial', 'highway':'motorway'})

    # Add the road width
    if attrs['RoadWidth'] and attrs['RoadWidth'] > 0:
        tags.update({'or_width': attrs['RoadWidth']})

    # Add bridge tag if possible
    if attrs['RoadType'] and attrs['RoadType'].lower() == 'bridge':
        tags.update({'bridge': 'yes'})

    tags.update({'highway':'road'})
    return tags