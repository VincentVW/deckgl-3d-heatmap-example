var geojson = {
  "type": "FeatureCollection",
  "features": []
}



json.forEach(o => {

    const loc = o.recipient_country.location.coordinates
    const box = [
        [loc[0]-0.1, loc[1]-0.1],
        [loc[0]-0.1, loc[1]+0.1],
        [loc[0]+0.1, loc[1]+0.1],
        [loc[0]+0.1, loc[1]-0.1]
    ]

    geojson.features.push(
    {
        "type":"Feature",
        "geometry": {
                "type":"Polygon",
                "coordinates": box
        },
        "properties": {
            "activity_count": o.count,
            "code": o.recipient_country.code,
            "name": o.recipient_country.name
        }
    }
)})