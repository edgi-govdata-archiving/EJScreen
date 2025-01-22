//calculate area functions start from here

var metersPerKm = 1000.0;
var meters2PerHectare = 10000.0;
var feetPerMeter = 3.2808399;
var feetPerMile = 5280.0;
var acresPerMile2 = 640;


function GPoint(lat, lon) {
    this.Latitude = lat;
    this.Longitude = lon;
    return (this);
}
function getDistance(p1, p2) {
    p1Lat = latLonToRadians(p1.Latitude);
    p1Lon = latLonToRadians(p1.Longitude);

    p2Lat = latLonToRadians(p2.Latitude);
    p2Lon = latLonToRadians(p2.Longitude);

    var R = 6371; // earth's mean radius in km
    var dLat = p2Lat - p1Lat;
    var dLong = p2Lon - p1Lon;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(p1Lat) * Math.cos(p2Lat) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var disKm = R * c;
    var disMiles = disKm * 0.6214;
    return (disMiles);
} //convert lat/long in degrees to radians

function getPointsDist(pointsObj) {
    var mydist = 0;
    for (var m = 0; m < pointsObj.length - 1; m++) {
        mydist = mydist + parseFloat(getDistance(pointsObj[m], pointsObj[m + 1]));
    }
    return mydist.toFixed(2);
}
function latLonToRadians(point) {
    return point * Math.PI / 180;
}
function AllSameHemisphere(ps) {
    for (var i = 1; i < ps.length; ++i) {
        if (ps[i].Longitude - ps[i - 1].Longitude > 180.0)
            ps[i].Longitude -= 360.0;
        else if (ps[i].Longitude - ps[i - 1].Longitude < -180.0)
            ps[i].Longitude += 360.0;
    }
    return ps;
}



function Areas(areaMeters2) {
    //var areaHectares = areaMeters2 / meters2PerHectare;
    //var areaKm2 = areaMeters2 / metersPerKm / metersPerKm;
    var areaFeet2 = areaMeters2 * feetPerMeter * feetPerMeter;
    var areaMiles2 = areaFeet2 / feetPerMile / feetPerMile;
    //var areaAcres = areaMiles2 * acresPerMile2;
    //areaMeters2.toPrecision(4) + ' m&sup2; / ' + areaHectares.toPrecision(4) + ' hectares / ' + areaKm2.toPrecision(4) + ' km&sup2; / ' +
    //unit is sq. miles
    return areaMiles2.toFixed(2);
}


var pi = 3.1415926535897932384626433;
var degreesPerRadian = 180.0 / pi;
var radiansPerDegree = pi / 180.0;
var earthRadiusMeters = 6367460.0; // average of polar and equatorial radii
var metersPerDegree = 2.0 * pi * earthRadiusMeters / 360.0; // of latitude




function PlanarPolygonAreaMeters2(points) {
    // Formula from http://mathworld.wolfram.com/PolygonArea.html

    var a = 0.0;
    for (var i = 0; i < points.length; ++i) {
        var j = (i + 1) % points.length;
        var xi = points[i].Longitude * metersPerDegree * Math.cos(points[i].Latitude * radiansPerDegree);
        var yi = points[i].Latitude * metersPerDegree;
        var xj = points[j].Longitude * metersPerDegree * Math.cos(points[j].Latitude * radiansPerDegree);
        var yj = points[j].Latitude * metersPerDegree;
        a += xi * yj - xj * yi;
    }
    return Math.abs(a / 2.0);
}


function SphericalPolygonAreaMeters2(points) {
    // Formula from http://mathworld.wolfram.com/SphericalPolygon.html
    // !!! Doesn't work for self-intersecting polygons.

    // Sum up all the angles.
    var totalAngle = 0.0;
    for (i = 0; i < points.length; ++i) {
        var j = (i + 1) % points.length;
        var k = (i + 2) % points.length;
        totalAngle += Angle(points[i], points[j], points[k]);
    }

    // In planar geometry, the sum of the angles inside an n-vertex polygon
    // is ( n - 2 ) * 180.  We subtract that from the actual sum to get
    // what's called the spherical excess - the extra angle we have due
    // to being on a sphere.
    var planarTotalAngle = (points.length - 2) * 180.0;
    var sphericalExcess = totalAngle - planarTotalAngle;
    //Log( 'totalAngle = ' + totalAngle.toPrecision(4) + '  sphericalExcess = ' + sphericalExcess.toPrecision(4) );

    if (sphericalExcess > 420.0) {
        // The spherical excess should be a small positive number for small
        // polygons.  For polygons that cover most of a hemisphere, the
        // excess might be as high as 360 degrees.  If the value we got is
        // higher than that, then what happened is the points of the polygon
        // were entered in counter-clockwise order instead of clockwise.
        // This is simple to deal with, just convert all the angles
        // to the other side (which we can do all at once, to the sum),
        // and recalculate the spherical excess.
        totalAngle = points.length * 360.0 - totalAngle;
        sphericalExcess = totalAngle - planarTotalAngle;
        //Log( 'corrected:  totalAngle = ' + totalAngle.toPrecision(4) + '  sphericalExcess = ' + sphericalExcess.toPrecision(4) );
    }
    else if (sphericalExcess > 300.0 && sphericalExcess < 420.0) {
        // This case tries to detect and correct for self-intersecting
        // polygons.  Very large self-intersecting polygons may still
        // be handled incorrectly.
        sphericalExcess = Math.abs(360.0 - sphericalExcess);
        //Log( 'self-intersecting polygon - corrected:  sphericalExcess = ' + sphericalExcess.toPrecision(4) );
    }

    return sphericalExcess * radiansPerDegree * earthRadiusMeters * earthRadiusMeters;
}

// Returns the angle of the vertex p1-p2-p3, on the right side.  For the angle
// on the left side, subtract from 360.
function Angle(p1, p2, p3) {
    var bearing21 = Bearing(p2, p1);
    var bearing23 = Bearing(p2, p3);
    var angle = bearing21 - bearing23;
    if (angle < 0.0)
        angle += 360.0;
    //Log( 'bearing21 = ' + bearing21.toPrecision(4) + '  bearing22 = ' + bearing23.toPrecision(4) + '  angle = ' + angle.toPrecision(4) );
    return angle;
}

// Returns the bearing in degrees between two points.
// North = 0, East = 90, South = 180, West = 270.
function Bearing(from, to) {
    // Formula from the 1982 ARRL antenna book.
    var a = from.Latitude;
    var b = to.Latitude;
    var l = to.Longitude - from.Longitude;

    // Handle some degenerate cases.
    var episilon = 0.0000000001;
    if (Math.abs(l) <= episilon)
        if (a > b)
            return 180.0;
        else
            return 0.0;
    else if (Math.abs(Math.abs(l) - 180.0) <= episilon)
        if (a >= 0.0 && b >= 0.0)
            return 0.0;
        else if (a < 0.0 && b < 0.0)
            return 180.0;
        else if (a >= 0.0)
            if (a > -b)
                return 0.0;
            else
                return 180.0;
        else
            if (a > -b)
                return 180.0;
            else
                return 0.0;

    // Convert to radians.
    a *= radiansPerDegree;
    b *= radiansPerDegree;
    l *= radiansPerDegree;

    var d = Math.acos(Math.sin(a) * Math.sin(b) + Math.cos(a) * Math.cos(b) * Math.cos(l));
    var angle = Math.acos((Math.sin(b) - Math.sin(a) * Math.cos(d)) / (Math.cos(a) * Math.sin(d)));
    angle = angle * degreesPerRadian;
    if (Math.sin(l) < 0)
        angle = 360.0 - angle;
    return angle;
}