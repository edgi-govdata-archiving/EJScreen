require([
    "dojo/ready",
    "dojo/parser",
    "dojo/_base/array",

    "dojo/on",
    "esri/views/MapView",
    "esri/Map",
    "esri/WebMap",
    "esri/widgets/ScaleBar",
    "esri/config",
    "esri/symbols/support/jsonUtils",
    "esri/geometry/Extent",
    "esri/Graphic",
    "esri/layers/FeatureLayer",
    "esri/layers/GraphicsLayer",
    "esri/layers/MapImageLayer",
    "esri/geometry/Point",
    "esri/geometry/Polygon",
    "esri/geometry/Polyline",
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "esri/tasks/IdentifyTask",
    "esri/tasks/support/IdentifyParameters",
    "esri/portal/Portal",
    "esri/geometry/geometryEngine",

    "dojo/domReady!"
], function(
    ready,
    parser,
    array,

    on,
    MapView,
    Map,
    WebMap,
    ScaleBar,
    esriConfig,
    esriSymbol,
    Extent,
    Graphic,
    FeatureLayer,
    GraphicsLayer,
    MapImageLayer,
    Point,
    Polygon,
    Polyline,
    QueryTask,
    Query,
    IdentifyTask,
    IdentifyParameters,
    Portal,
    geometryEngine
) {

    ready(function() {

        esriConfig.request.proxyUrl = proxyurl;
        esriConfig.portalUrl = "https://epa.maps.arcgis.com";
        var aview;
        var identifyTask, params;
        getbasicmap();

        function getbasicmap() {
            if (drillbasemaptitle.length > 0) {
                let portal = new Portal();
                portal.load().then(function() {
                    portal.fetchBasemaps().then(function(basemaps) {
                        basemaps.map(function(bm) {
                            bm.load().then(function() {
                                if (bm.title == drillbasemaptitle) {
                                    initmap(bm);
                                }
                            });
                        });

                    });
                });
            } else {
                initmap('topo');
            }
        }

        function initmap(bmap) {
            var coordsarray = coordstr.split(",");
            map = new Map({
                basemap: bmap
            });
            var symbol;
            if ((coordsarray.length == 2) && (geomtype == "point")) {
                symbol = pointsymbol;
                var x = parseFloat(coordsarray[0]);
                var y = parseFloat(coordsarray[1]);
                mcenter = new Point({ "x": x, "y": y, " spatialReference": { "wkid": 4326 } });
                geometry = mcenter;
                mlevel = 12;

                aview = new MapView({
                    container: "mapDiv",
                    map: map,
                    center: mcenter,
                    zoom: mlevel

                });

            } else if ((geomtype.toLowerCase() == "polyline") || (geomtype.toLowerCase() == "line")) {
                var ccount = coordsarray.length / 2;
                var points = [];
                for (var m = 0; m < ccount; m++) {
                    var lon1 = parseFloat(coordsarray[2 * m]);
                    var lat1 = parseFloat(coordsarray[2 * m + 1]);

                    var pntobj = new Point({ "x": lon1, "y": lat1 });
                    points.push(pntobj);

                }
                var linegeom = new Polyline({ spatialReference: { wkid: 4326 } });
                linegeom.addPath(points);
                symbol = linesymbol;
                geometry = linegeom;

                mext = linegeom.extent.expand(2);
                mcenter = linegeom.extent.center;
                aview = new MapView({
                    container: "mapDiv",
                    map: map,
                    extent: mext
                });

            } else if (geomtype.toLowerCase() == "polygon") {
                var ccount = coordsarray.length / 2;
                var points = [];
                for (var m = 0; m < ccount; m++) {
                    var lon1 = parseFloat(coordsarray[2 * m]);
                    var lat1 = parseFloat(coordsarray[2 * m + 1]);
                    var pntobj = new Point({ "x": lon1, "y": lat1 });
                    points.push(pntobj);
                }
                var polygeom = new Polygon({
                    //rings: points,
                    spatialReference: { wkid: 4326 }
                });
                polygeom.addRing(points);
                geometry = polygeom;
                symbol = polysymbol;



                mext = polygeom.extent.expand(2);
                mcenter = polygeom.extent.center;
                aview = new MapView({
                    container: "mapDiv",
                    map: map,
                    extent: mext
                });

            }
            if (symbolstr.length > 0) {

                var symboljsonobj = JSON.parse(symbolstr);

                symbol = esriSymbol.fromJSON(symboljsonobj);

            }
            aview.when(function() {
                var tgraphic = new Graphic(geometry, symbol);
                aview.graphics.add(tgraphic);
                if (drawlayer) addLayerByKey(layerName, geometry);
                if ((buff != '') && (parseFloat(buff) > 0)) {
                    doBuffer(geometry);
                }


            });

        }

        function executeIdentifyTask(evt) {

            params.geometry = evt.mapPoint;
            params.mapExtent = aview.extent;
            identifyTask
                .execute(params)
                .then(function(response) {
                    var results = response.results;

                    return results.map(function(result) {
                        var feature = result.feature;
                        var layerName = result.layerName;

                        feature.popupTemplate = {
                            // autocasts as new PopupTemplate()
                            title: layerName,
                            content: "{*}"

                        };

                        return feature;
                    });
                })
                .then(showPopup); // Send the array of features to showPopup()

            // Shows the results of the Identify in a popup once the promise is resolved
            function showPopup(response) {
                if (response.length > 0) {
                    aview.popup.open({
                        features: response,
                        location: evt.mapPoint
                    });
                }

            }

        }

        function addLayerByKey(layerkey, geom) {
            var unitstr = "";
            switch (distUnits.toLowerCase()) {
                case "meter":
                case "meters":
                    unitstr = "meters";
                    break;
                case "foot":
                case "feet":
                    unitstr = "feet";
                    break;
                case "mile":
                case "miles":
                    unitstr = "miles";
                    break;
                case "yard":
                case "yards":
                    buff = buffer * 0.9144;
                    unitstr = "meters";
                    break;
                case "kilometers":
                case "kilometer":
                    unitstr = "kilometers";
                    break;
                default:
                    unitstr = "miles";
                    break;
            }
            if (layerkey == 'Wetlands') {
                var layerurl = recommendservices["nwi"].url;
                var layerindex = recommendservices["nwi"].layers[0];
                var qurl = layerurl + "/" + layerindex;
                var queryTask = new QueryTask(qurl);



                var query = new Query();

                query.returnGeometry = true;
                query.geometry = geom;
                if ((buff != '') && (parseFloat(buff) > 0)) {
                    query.distance = parseFloat(buff);
                    query.units = unitstr;
                }
                query.spatialRelationship = "intersects";

                queryTask.executeForIds(query).then(function(results) {
                    if (results != null) {
                        var qStr = "Wetlands.OBJECTID IN (" + results.join(',') + ")";
                        var drilllayer = new MapImageLayer(layerurl, {
                            sublayers: [{
                                id: layerindex,
                                definitionExpression: qStr,
                                visible: true
                            }],
                            opacity: 0.8
                        });
                        aview.map.add(drilllayer);
                        identifyTask = new IdentifyTask(layerurl);

                        // Set the parameters for the Identify
                        params = new IdentifyParameters();
                        params.tolerance = 3;
                        params.layerIds = [layerindex];
                        params.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
                        params.width = aview.width;
                        params.height = aview.height;
                        aview.on("click", executeIdentifyTask);
                    }
                }).catch(function(error) {
                    console.log("query task error", error);
                });


            } else {
                var layerurl = drillsvcurl;
                var domainpat = /^https?:\/\/([A-Za-z0-9_\.]+\/)+mapserver/i;
                var match = drillsvcurl.match(domainpat);
                if (match != null) {
                    layerurl = match[0];
                }
                //console.log("url: " + layerurl)
                var drilllayer = new MapImageLayer(layerurl, {
                    id: "drilllayer",
                    opacity: 0.8
                });
                aview.map.add(drilllayer);
                drilllayer.on("layerview-create", function(event) {
                    drilllayer.allSublayers.map(function(sublyr) {
                        //console.log(sublyr.title);
                        if (sublyr.title == layerkey) {
                            var qurl = layerurl + "/" + sublyr.id;
                            var queryTask = new QueryTask(qurl);



                            var query = new Query();

                            query.returnGeometry = true;
                            query.geometry = geom;
                            if ((buff != '') && (parseFloat(buff) > 0)) {
                                query.distance = parseFloat(buff);
                                query.units = unitstr;
                            }
                            query.spatialRelationship = "intersects";

                            queryTask.executeForIds(query).then(function(results) {
                                if (results != null) {
                                    var qStr = "OBJECTID IN (" + results.join(',') + ")";
                                    sublyr.definitionExpression = qStr;
                                    sublyr.visible = true;
                                    identifyTask = new IdentifyTask(layerurl);

                                    // Set the parameters for the Identify
                                    params = new IdentifyParameters();
                                    params.tolerance = 3;
                                    params.layerIds = [sublyr.id];
                                    params.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
                                    params.width = aview.width;
                                    params.height = aview.height;
                                    aview.on("click", executeIdentifyTask);
                                }
                            }).catch(function(error) {
                                console.log("query task error", error);
                            });


                        } else {
                            sublyr.visible = false;
                        }

                    });
                });
            }

        }



        function doBuffer(geometry) {
            buff = parseFloat(buff);
            var unitstr = "";
            switch (distUnits.toLowerCase()) {
                case "meter":
                case "meters":
                    unitstr = "meters";
                    break;
                case "foot":
                case "feet":
                    unitstr = "feet";
                    break;
                case "mile":
                case "miles":
                    unitstr = "miles";
                    break;
                case "yard":
                case "yards":
                    buff = buffer * 0.9144;
                    unitstr = "meters";
                    break;
                case "kilometers":
                case "kilometer":
                    unitstr = "kilometers";
                    break;
                default:
                    unitstr = "miles";
                    break;
            }
            var buffer = geometryEngine.geodesicBuffer(geometry, buff, unitstr);



            var bufgraphic = new Graphic({
                geometry: buffer,
                symbol: buffersymbol
            });

            aview.graphics.add(bufgraphic);
            aview.extent = buffer.extent.expand(2);

        }







    });
});

function validateForm(frm) {
    var numreg = /^\d+(\.\d+)?$/;
    var distvalue = dojo.trim(frm.distVal.value);

    if (numreg.test(distvalue)) {
        return true;
    } else {
        alert("Please enter numeric distance value!");
        return false;
    }

}
// add EJ2020
function toggleDiv(divid) {
    if (document.getElementById(divid).style.display == 'none') {
        document.getElementById(divid).style.display = 'block';
    } else {
        document.getElementById(divid).style.display = 'none';
    }
}