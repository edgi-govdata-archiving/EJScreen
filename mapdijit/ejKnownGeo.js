define(['dojo/_base/declare',
    "dojo/has",
    "dojo/aspect",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-attr",
    'dijit/_Widget',
    'dijit/_Templated',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/Evented',
    'dojox/gfx',
    'dojo/fx',
    'dojo/fx/Toggler',
    'dojo/text!mapdijit/templates/ejKnownGeo.html',
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "esri/layers/GraphicsLayer",
    "esri/layers/FeatureLayer",
    "esri/Graphic",
    "esri/geometry/Polygon",
    "esri/PopupTemplate",
    'https://edgi-ejscreen.azurewebsites.net/mapdijit/EJinfoWindow.js'
], function(
    declare,
    has,
    aspect,
    lang,
    array,
    domConstruct,
    domClass,
    domStyle,
    domAttr,
    _Widget,
    _Templated,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    Evented,
    gfx,
    coreFx,
    Toggler,
    dijittemplate,
    QueryTask,
    Query,
    GraphicsLayer,
    FeatureLayer,
    Graphic,
    Polygon,
    PopupTemplate,
    EJinfoWindow) {
    var polysym = { // symbol used for polygons
        type: "simple-fill", // autocasts as new SimpleMarkerSymbol()
        color: "rgba(0, 255, 0, 0.25)",
        style: "solid",
        outline: {
            color: "red",
            width: 2
        }
    };
    var tempsym = { // symbol used for polygons
        type: "simple-fill", // autocasts as new SimpleMarkerSymbol()
        color: "rgba(0, 255, 255, 0.25)",
        style: "solid",
        outline: {
            color: "rgba(255, 255, 0, 1)",
            width: 1
        }
    };
    var ejKnownGeo = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: dijittemplate,
        widgetsInTemplate: true,

        constructor: function(options, srcRefNode) {

            options = options || {};
            if (!options.view) throw new Error("no map defined in params for EJ site.");

            this.mapview = options.view;
            this.gcounter = 0;
            this.tempLayer_poly = null;

            dojo.safeMixin(this, options);


        },

        startup: function() {},
        postCreate: function() {
            this.statefips = "";

            for (var t in typelookup) {
                var myOpt1 = document.createElement("option");
                myOpt1.value = t;
                myOpt1.text = typelookup[t].description;
                this.selgeoNode.appendChild(myOpt1);
            }
        },

        createLayers: function() {

            if (this.mapview.map.findLayerById("tempLayer_poly")) {
                this.tempLayer_poly = this.mapview.map.findLayerById("tempLayer_poly");
            } else {

                this.tempLayer_poly = new GraphicsLayer({ id: "tempLayer_poly" });

                this.mapview.map.add(this.tempLayer_poly);
            }
        },

        selectgeo: function(e) {
            this.fipsNode.value = "";
            this.hiddenfipsNode.innerHTML = "";
            if (this.tempLayer_poly != null) this.tempLayer_poly.removeAll();
            this.mapview.popup.close();

        },
        openinit: function() {
            this.idconnect = this.mapview.on("click", lang.hitch(this, this._selectFeature));

        },
        closePane: function() {
            this.fipsNode.value = "";
            this.hiddenfipsNode.innerHTML = "";
            if (this.idconnect != null) {
                this.idconnect.remove();
                this.idconnect = null;
            }
            if (this.tempLayer_poly != null) this.tempLayer_poly.removeAll();
            this.mapview.popup.close();
        },

        submitFIPs: function() {
            this.createLayers();
            var fipstr = this.hiddenfipsNode.innerHTML;
            var namestr = this.fipsNode.value;
            fipstr = fipstr.replace(/\n|\s/g, "");
            fipstr = dojo.trim(fipstr);
            var gtype = this.selgeoNode.value;

            var regexstr = typelookup[gtype].regstr;
            if (regexstr.test(fipstr)) {
                this.tempLayer_poly.removeAll();
                this.mapview.popup.close();
                var fipsarr = fipstr.split(/, {0,}/);
                var fipsmodstr = "";
                for (var i = 0; i < fipsarr.length; i++) {
                    if (i > 0) fipsmodstr = fipsmodstr + ",";
                    fipsmodstr = fipsmodstr + "'" + fipsarr[i] + "'";;
                }
                var idfield = typelookup[gtype].idfield;
                var wherestr = idfield + " in (" + fipsmodstr + ")";
                var query = new Query();
                query.returnGeometry = true;
                query.outFields = [idfield];
                query.where = wherestr;
                query.outSpatialReference = this.mapview.spatialReference;
                query.geometryPrecision = 1;
                var furl = typelookup[gtype].url + "/" + typelookup[gtype].layer;

                var idesc = typelookup[gtype].description;
                var queryTask = new QueryTask({ url: furl });
                var wobj = this;
                queryTask.execute(query).then(function(results) {
                    if (results.features.length > 0) {
                        var newgm = new Polygon();
                        newgm.spatialReference = wobj.mapview.spatialReference;
                        for (var j = 0; j < results.features.length; j++) {
                            var feature = results.features[j];
                            var rings = feature.geometry.rings;
                            for (var k = 0; k < rings.length; k++) {
                                newgm.addRing(rings[k]);
                            }
                        }
                        var newgraphic = new Graphic(newgm);



                        var gcounter = 0;

                        var layerid = "Project" + gcounter;

                        do {
                            gcounter = gcounter + 1;
                            layerid = "Project" + gcounter;
                        } while ((wobj.mapview.map.findLayerById(layerid) != null))

                        var att = { "id": gcounter, "gtype": gtype, "fips": fipstr, "names": namestr};
                        newgraphic.attributes = att;

                        var dlayer = new FeatureLayer({
                            id: layerid,
                            source: [newgraphic],
                            title: "Project " + gcounter,
                            objectIdField: "id",
                            outFields: ['*'],
                            fields: [{
                                    name: "id",
                                    type: "oid"
                                },
                                {
                                    name: "gtype",
                                    type: "string"
                                },
                                {
                                    name: "fips",
                                    type: "string"
                                },
                                {
                                    name: "names",
                                    type: "string"
                                }
                            ],
                            popupTemplate: {
                                title: "EJScreen Reports and Charts",
                                content: lang.hitch(wobj, wobj.SetDesc)
                            },
                            renderer: {
                                type: "simple",
                                symbol: polysym
                            }
                        });
                        dlayer.layerType = "digitize";
                        wobj.mapview.map.add(dlayer);


                        wobj._showInfoWin(newgraphic);

                    } else {
                        alert("No record found");
                    }
                    wobj.fipsNode.value = "";
                    wobj.hiddenfipsNode.innerHTML = "";

                }, function(err) {
                    alert("error occurred when querying layer: " + err);

                });
            } else {
                alert("Invalid " + typelookup[gtype].description + " ID!");
            }

        },

        _showInfoWin: function(g) {
            var gtype = g.geometry.type;
            var cpoint;
            if (gtype == "point") {
                cpoint = g.geometry;
            } else if (gtype == "polyline") {
                cpoint = g.geometry.extent.center;
            } else {
                cpoint = g.geometry.centroid;
            }
            this.mapview.popup.open({ features: [g], location: cpoint });
        },
        _selectFeature: function(evt) {
            var wobj = this;
            this.mapview.hitTest(evt).then(function(response) {
                var doID = false;
                if (response.results.length) {
                    if (response.results[0].graphic.layer.type == "vector-tile") doID = true;
                } else if (response.results.length == 0) {
                    doID = true;
                }
                if (doID) {
                    wobj.createLayers();
                    var currenttext = wobj.hiddenfipsNode.innerHTML;
                    if (currenttext.length > 0) {
                        var a = currenttext.split(",");
                        if (a.length > 4) {
                            alert("You can only select a maximum of 5 features!");
                            return false;
                        }
                    }
                    var gtype = wobj.selgeoNode.value;
                    var outfield = typelookup[gtype].displayfield;

                    var query = new Query();
                    query.returnGeometry = true;
                    query.outFields = outfield;
                    query.geometry = evt.mapPoint;
                    query.geometryPrecision = 1;
                    query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
                    wobj.queryBG(query, false);
                }
            });

        },
        queryBG: function(qpara, zoom) {
            var wobj = this;
            var gtype = this.selgeoNode.value;
            var furl = typelookup[gtype].url + "/" + typelookup[gtype].layer;
            var idfield = typelookup[gtype].idfield;
            var namefield = typelookup[gtype].namefield;

            var idesc = typelookup[gtype].description;
            var queryTask = new QueryTask({ url: furl });

            queryTask.execute(qpara).then(function(results) {

                if (results.features.length > 0) {

                    var feature = results.features[0];


                    var featureAttributes = results.features[0].attributes;
                    var bgid = featureAttributes[idfield];

                    var currenttext = wobj.hiddenfipsNode.innerHTML;
                    if (currenttext.indexOf(bgid) > -1) {

                    } else {
                        var fipstr = feature.attributes[idfield];
                        var namestr = feature.attributes[namefield];
                        if (gtype == "city") {
                            wobj.tempLayer_poly.removeAll();
                            wobj.hiddenfipsNode.innerHTML = fipstr;
                            wobj.fipsNode.value = namestr;
                        } else {
                            if (currenttext.length > 0) {
                                if (wobj.statefips != fipstr.substr(0, 2)) {
                                    alert("The study area cannot cross states! Please select features within the same state!");

                                    return false;
                                }
                                wobj.hiddenfipsNode.innerHTML = currenttext + "," + fipstr;
                                wobj.fipsNode.value = wobj.fipsNode.value + "," + namestr;
                            } else {
                                wobj.hiddenfipsNode.innerHTML = fipstr;
                                wobj.fipsNode.value = namestr;
                                wobj.statefips = fipstr.substr(0, 2);
                            }
                        }
                        feature.attributes["gtype"] = gtype;
                        feature.symbol = tempsym;
                        var template = new PopupTemplate();
                        template.title = idesc;
                        template.content = lang.hitch(wobj, wobj.SetSimpleInfo);
                        feature.popupTemplate = template;

                        if (zoom) wobj.mapview.extent = feature.geometry.extent;
                        wobj.tempLayer_poly.add(feature);
                        wobj._showInfoWin(feature);
                    }
                } else {
                    alert("Did not find a feature!");
                }

            }, function(err) {
                alert("error occurred when querying layer: " + err);

            });
        },

        SetSimpleInfo: function(e) {
            var sinfowidget = new simpleInfoWin({
                parentwg: this,
                cgraphic: e.graphic
            }, dojo.create('div'));
            sinfowidget.startup();

            return sinfowidget.domNode;
        },
        SetDesc: function(e) {
            if (dijit.registry.byId("infowg")) {
                dijit.registry.remove("infowg");

            }
            var mview = this.mapview;
            var infowidget = new EJinfoWindow({
                view: mview,
                inGraphic: e.graphic,
                id: 'infowg'
            }, dojo.create('div'));

            infowidget.startup();

            return infowidget.domNode;
        },

        destroy: function() {
            if (this.idconnect != null) {
                this.idconnect.remove();
                this.idconnect = null;
            }
            dojo.empty(this.domNode);
            this.inherited(arguments);
        }

    });

    var simpleInfoWin = dojo.declare([dijit._Widget, dijit._Templated], {
        templateString: '<div><span data-dojo-attach-point="cNode"></span><br /><span style="color: Navy; text-decoration: underline;cursor:pointer;" data-dojo-attach-point="dlNode" data-dojo-attach-event="onclick:_deleteg" >Delete Site</span></div>',
        efinfo: null,
        constructor: function(a) {
            this.parentwg = a.parentwg;
            this.cgraphic = a.cgraphic;
            this.mapview = this.parentwg.mapview;

            dojo.mixin(this, a);
        },
        postCreate: function() {

            var gtype = this.cgraphic.attributes["gtype"];
            var outfield = typelookup[gtype].displayfield;
            var contentstr = "";
            for (var m = 0; m < outfield.length; m++) {
                contentstr = contentstr + outfield[m] + ": " + this.cgraphic.attributes[outfield[m]] + "<br />";
            }
            this.cNode.innerHTML = contentstr;

        },


        _deleteg: function() {
            var gtype = this.cgraphic.attributes["gtype"];
            var idfield = typelookup[gtype].idfield;
            var namefield = typelookup[gtype].namefield;
            var idvalue = this.cgraphic.attributes[idfield];
            var namevalue = this.cgraphic.attributes[namefield];
            var namestr = this.parentwg.fipsNode.value;
            var fipstr = this.parentwg.hiddenfipsNode.innerHTML;
            var namearr = namestr.split(",");
            var fipsarr = fipstr.split(",");
            var pos = 0;
            for (var i = 0; i < fipsarr.length; i++) {
                if (fipsarr[i] == idvalue) pos = i;
            }
            namearr.splice(pos, 1);
            fipsarr.splice(pos, 1);
            var newnamestr = namearr.join(",");
            var newfipstr = fipsarr.join(",");
            this.parentwg.fipsNode.value = newnamestr;
            this.parentwg.hiddenfipsNode.innerHTML = newfipstr;
            var digiLayer = this.cgraphic.layer;
            digiLayer.graphics.map(function(graphic) {
                var currentidvalue = graphic.attributes[idfield];
                if (idvalue == currentidvalue) {
                    digiLayer.remove(graphic);

                }
            });
            // digiLayer.remove(this.cgraphic);

            this.mapview.popup.close();


        },


        destroy: function() {
            dojo.empty(this.domNode);
            this.inherited(arguments);
        }
    });

    return ejKnownGeo;

});