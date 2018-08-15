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

    keys = attrs.keys()
    # Add the road name
    if 'RoadName' in keys and attrs['RoadName']:
        tags.update({'name':attrs['RoadName'].strip(' ').title()})

    if 'NAME' in keys and attrs['NAME']:
        tags.update({'name':attrs['NAME'].strip(' ').title()})

    # Map the road type to the OSM highway classification
    if 'RoadClass' in keys and attrs['RoadClass'] and attrs['RoadClass'].lower() == "provincial":
        tags.update({'or_responsibility':'provincial', 'highway':'motorway'})

    # Add the road width
    if 'RoadWidth' in keys and attrs['RoadWidth'] and attrs['RoadWidth'] > 0:
        tags.update({'or_width': attrs['RoadWidth']})

    # Add bridge tag if possible
    if 'RoadType' in keys and attrs['RoadType'] and attrs['RoadType'].lower() == 'bridge':
        tags.update({'bridge': 'yes'})

    tags.update({'highway':'road'})
    return tags