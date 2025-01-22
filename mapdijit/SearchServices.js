define(

    ['dojo/_base/declare',
        "dojo/_base/lang",
        "dojo/on",
        "dojo/dom-construct",
        'dijit/_Widget',
        'dijit/_Templated',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dojo/Evented',
        "dijit/form/RadioButton", "dijit/form/DropDownButton", "dijit/form/Button", "dijit/form/TextBox", "dijit/form/ComboBox", "dijit/form/FilteringSelect",
        "dojox/layout/FloatingPane",
        "dojo/text!mapdijit/templates/SearchServices.html",
        "esri/layers/Layer",
		"esri/layers/FeatureLayer",
        "esri/views/MapView",
        "esri/WebMap",
        "esri/portal/Portal",
        "esri/identity/OAuthInfo",
        "esri/identity/IdentityManager",
        "esri/portal/PortalQueryParams",
        "esri/portal/PortalItem",
        "esri/layers/GroupLayer",
        "esri/layers/KMLLayer",
        "esri/layers/WMSLayer",
        "esri/config",
        "esri/request",

        "esri/geometry/Geometry",
        "esri/tasks/support/FeatureSet",
        "esri/renderers/support/jsonUtils",
        "esri/geometry/support/jsonUtils",
        "esri/PopupTemplate",
		"esri/Graphic",
		"mapdijit/EJinfoWindow"
    ],
    function(
        declare,
        lang,
        on,
        domConstruct,
        _Widget,
        _Templated,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Evented,
        RadioButton, DropDownButton, Button, TextBox, ComboBox, FilteringSelect,
        FloatingPane,
        dijittemplate,
        Layer,
		FeatureLayer,
        MapView,
        WebMap,
        Portal,
        OAuthInfo,
        esriId,
        PortalQueryParams,
        PortalItem,
        GroupLayer,
        KMLLayer,
        WMSLayer,
        esriConfig,
        esriRequest,

        Geometry,
        FeatureSet,
        rendererJsonUtils,
        geometryJsonUtils,
        PopupTemplate,
		Graphic,
		EJinfoWindow
    ) {

        var agsAppId = "PXnClOdgC4Ufpqzd"; //app ID on AGSO for oAuth registration
        var tokenLifeMinutes = 120; //time in minutes for token
        var portalRoot = "https://www.arcgis.com"; //root for AGS portal

        var a = dojo.create("link", { type: "text/css", rel: "stylesheet", href: "mapdijit/css/service.css" });
        dojo.doc.getElementsByTagName("head")[0].appendChild(a);

        var SearchServices = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

            templateString: dijittemplate,
            widgetsInTemplate: true,
            constructor: function(options, srcRefNode) {
                // expected properties and values for the options argument:
                //"map": Javascript API Map object in the webmap that will be clicked
                //"selectLayerURL" : Layer URL for the layer that will be selected for feature input 
                //"title": Top line of text that appears in the widget,
                //"caption": Second line of text that appears in the widget that appears after tool runs
                // srcRefNode is the DOM node where the gauge will be created
                this.mapview = options.view;
                this.map = this.mapview.map;

                var purl = portalRoot + "/sharing/";
                this.searchvalue = "";
                this.num = 20;
                this.start = 1;
                this.totalcount = 0;
                this.searchresult = null;
                this.portalbaseurl = purl;
                this.groupvalue = "";
                // mixin constructor options 
                dojo.safeMixin(this, options);

            },

            startup: function() {
                this.inherited(arguments);

            },
            postCreate: function() {
                var info = new OAuthInfo({
                    appId: agsAppId,
                    // Uncomment the next line and update if using your own portal
                    //portalUrl: portalRoot,
                    // Uncomment the next line to prevent the user's signed in state from being shared with other apps on the same domain with the same authNamespace value.
                    // authNamespace: "portal_oauth_inline",
                    expiration: tokenLifeMinutes,
                    popup: true
                });
                esriId.registerOAuthInfos([info]);
                esriId.on("credential-create", function() {
                    document.getElementById("signinBtn").innerHTML = "Sign Out";
                    document.getElementById("inst").style.display = "none";
                    document.getElementById("orSpan").style.display = "none";
                    document.getElementById("gOnlyDiv").style.display = "block";
                });
                esriId.checkSignInStatus(info.portalUrl + "/sharing").then(
                    function() {
                        document.getElementById("signinBtn").innerHTML = "Sign Out";
                        document.getElementById("inst").style.display = "none";
                        document.getElementById("orSpan").style.display = "none";
                        document.getElementById("gOnlyDiv").style.display = "block";
                    }
                ).catch(
                    function() {
                        document.getElementById("signinBtn").innerHTML = "Sign In";
                        document.getElementById("gOnlyDiv").style.display = "none";
                        document.getElementById("inst").style.display = "inline-block";
                        document.getElementById("orSpan").style.display = "inline-block";
                    }
                );
                this.valueNode.focus();

            },
            _tboxpress: function(event) {
                if (event.keyCode == 13) {
                    this._onClick();
                    return false;
                }
            },


            _onClick: function() {
                var svalue = this.get("valueNode").value;
                this.start = 1;
                this.groupvalue = "";
                this._getServices(svalue, this.start, this.num, this);
            },

            _toggleonly: function() {
                var svalue = this.get("valueNode").value;
                this.start = 1;
                this._getServices(svalue, this.start, this.num, this);
            },
            _turnOffAll: function() {
                this.contentNode.innerHTML = "";
                this.countNode.innerHTML = "";

                this.nxNode.style.display = "none";
                this.preNode.style.display = "none";
                this.recNode.innerHTML = "";
                this.groupvalue = "";
                this.start = 1;
            },



            _getServices: function(svalue, startvalue, internum, widgetobj) {
                if ((svalue.length == 0) && (this.groupvalue.length == 0)) {
                    alert("Please enter words to search!");
                    return false;
                }
                var groupstr = "";
                if (this.groupvalue.length > 0) groupstr = " AND (group: \"" + this.groupvalue + "\")";

                this.countNode.innerHTML = "Searching... Please wait.";
                dojo.empty(this.contentNode);
                var querystr = "";
                if (svalue.length > 0) querystr = "(" + svalue + ") AND ";

                querystr = querystr + "(( type:\"Map Service\") OR (type:\"Web Map\") OR (type:\"Vector Tile Service\") OR (type:\"Image Service\") OR (type:\"WMS\") OR (type:\"KML\") OR (type:\"Feature Service\")) -type:\"web mapping application\"" + groupstr;
                this.start = startvalue;
                this.num = internum;

                //var querystr = svalue + " (type:\"Map Service\" -type:\"web map\" -type:\"web mapping application\" -type:\"feature collection\" -type:\"mobile application\")";
                //var querystr = "(" + svalue + ") AND (( type:\"Map Service\") OR (type:\"Web Map\"))"


                var queryParams = new PortalQueryParams({
                    query: querystr,
                    sortField: "title",
                    sortOrder: "asc",
                    start: startvalue,
                    num: internum
                });
                if (this.gboxNode.checked) {
                    queryParams.extent = this.mapview.extent;
                }

                var portal = new Portal();
                // Setting authMode to immediate signs the user in once loaded
                portal.authMode = "auto";
                //portal.bingKey = bingMapsKey;
                // Once loaded, user is signed in
                portal.load().then(function() {
                    if (document.getElementById("signinBtn").innerHTML == "Sign Out") {
                        if (widgetobj.gOnlyNode.checked) {
                            var qstr = queryParams.query;
                            qstr = qstr + " AND (accountid: \"" + portal.user.orgId + "\")";
                            queryParams.query = qstr;
                        }
                    }

                    // Query the items based on the queryParams created from portal above
                    portal.queryItems(queryParams).then(lang.hitch(widgetobj, widgetobj._listServices))
                        .catch(function(error) {
                            widgetobj.contentNode.innerHTML = "Failed when searching ArcGIS online: " + error;
                            widgetobj.nxNode.style.display = "none";
                            widgetobj.preNode.style.display = "none";
                            widgetobj.recNode.innerHTML = "";
                            widgetobj.countNode.innerHTML = "";
                        });
                });

            },
            _listServices: function(items) {

                var startvalue = this.start;

                var widgetobj = this;
                var totalcount = items.total;
                this.totalcount = totalcount;
                var constnum = this.num;
                var nstart = this.start + this.num;
                this.searchresult = null;
                var rstr = "";

                if (items.results.length > 0) {
                    this.searchresult = items.results;
                    rstr = "<b>" + totalcount + " Map Services/Web Maps found:</b>";
                    this.countNode.innerHTML = rstr;
                    items.results.forEach(function(item) {

                        var widget;
                        var wid = item.id;
                        if (dijit.registry.byId(wid)) {
                            dijit.registry.remove(wid);

                        }

                        widget = new serviceItem({ mapview: widgetobj.mapview, map: widgetobj.map, resultobj: item, portalurl: widgetobj.portalbaseurl });

                        //alert(widget.domNode.innerHTML);
                        widget.placeAt(widgetobj.contentNode);
                    });

                    if (startvalue > 1) widgetobj.preNode.style.display = "inline";
                    else widgetobj.preNode.style.display = "none";
                    var endvalue = constnum + startvalue - 1;
                    if (endvalue < totalcount) {
                        widgetobj.recNode.innerHTML = startvalue + " - " + endvalue.toString();
                        widgetobj.nxNode.style.display = "inline";
                        //rstr = rstr + "<a href='javascript: getServices(&apos;" + robj.query + "&apos;," + nstart + "," + constnum + ");'>Next</a>";
                    } else {
                        widgetobj.recNode.innerHTML = startvalue + " - " + totalcount.toString();
                        widgetobj.nxNode.style.display = "none";
                    }
                } else {
                    widgetobj.nxNode.style.display = "none";
                    widgetobj.preNode.style.display = "none";
                    widgetobj.recNode.innerHTML = "";
                    widgetobj.contentNode.innerHTML = "<b>No Map Service found</b>";
                    widgetobj.countNode.innerHTML = "";
                }


            },
            _initPane: function(grpname, groupvalue) {
                var svalue = "";
                this.valueNode.value = "";
                this.start = 1;
                this.groupvalue = groupvalue;
                this._getServices(svalue, this.start, this.num, this);
            },

            _nextClick: function() {
                var svalue = this.get("valueNode").value;
                this._getServices(svalue, this.start + this.num, this.num, this);
            },
            _preClick: function() {
                var svalue = this.get("valueNode").value;
                this._getServices(svalue, this.start - this.num, this.num, this);
            },
            _Signin: function() {
                this._turnOffAll();

                if (document.getElementById("signinBtn").innerHTML == "Sign Out") {

                    esriId.destroyCredentials();

                    document.getElementById("signinBtn").innerHTML = "Sign In";
                    document.getElementById("gOnlyDiv").style.display = "none";
                    document.getElementById("inst").style.display = "inline-block";
                    document.getElementById("orSpan").style.display = "inline-block";
                    this.gOnlyNode.checked = false;

                } else {
                    esriId.getCredential(portalRoot + "/sharing", { oAuthPopupConfirmation: false });


                }

            },

            destroy: function() {

                //this.Render.destroy();
                dojo.empty(this.domNode);
                this.inherited(arguments);
            }
			



        });


        var serviceItem = declare([_Widget, _Templated], {

            templateString: dojo.cache("mapdijit", "templates/serviceItem.html"),
            widgetsInTemplate: false,
            constructor: function(options) {

                options = options || {};
                if (!options.map) throw new Error("no map defined in params.");
                this.map = options.map;
				this.mapview = options.mapview;
                var purl = options.portalurl;

                var itemobj = options.resultobj;
                var tmurl = itemobj.thumbnailUrl;
                this.itemobj = itemobj;
                this.thumburl = tmurl;
                this.resturl = itemobj.url;
                this.webmapid = itemobj.id;
                this.webmaptype = itemobj.type;
                this.webmaptitle = itemobj.title;
                this.webmapsnippet = itemobj.snippet;
                if (itemobj.type == "Web Map") {
                    this.typeimage = "images/webmap.png";
                } else {
                    this.typeimage = "images/mapservice.png";
                }
                var datemod = itemobj.modified;
                var dt = new Date(datemod);
                var datestr = dt.toDateString();
                this.moddate = datestr;
                this.Author = itemobj.owner;
                this.rate = itemobj.numRatings;
                this.comment = itemobj.numComments;
                this.viewnum = itemobj.numViews;
                // mixin constructor options 
                //dojo.safeMixin(this, options);


            },

            startup: function() {
                this.inherited(arguments);

            },
            _addMapService: function() {
                var pitem = this.itemobj;
                var wobj = this;
                //console.log(pitem.name + ": " + pitem.id + "; " + pitem.type + "; " + pitem.isLayer);
                if (pitem.isLayer) {
                    Layer.fromPortalItem({
                        portalItem: pitem
                    }).then(function(lyrtemp) {
						//old, wildcard no longer supported on popup template
                        //if ((lyr.type == "feature") && (lyr.popupTemplate == null)) {
                          //  var template = new PopupTemplate();
                          //  template.content = "{*}";
                          //  template.title = pitem.title;
                          //  lyr.popupTemplate = template;
                        //}
						//instead skip and take default
						if ((lyrtemp.type == "feature") && (lyrtemp.popupTemplate == null)) {
		const measureThisAction = {
          title: "Generate Report",
          id: "change",
          className: "esri-icon-documentation"
        };

          function measureThis() {	
          var feature = view.popup.selectedFeature;
          wobj._convertGraphic(feature); 
		 
        }
                
		 view.popup.on("trigger-action", (event) => {            
          // Execute the measureThis() function if the measure-this action is clicked
          if (event.action.id === "change") {
            measureThis();
          }
        });

         const featureLayer = new FeatureLayer({
          portalItem: {
            // autocasts as new PortalItem()
            //id: "f95344889cab44bd84207052f44cb940",
           id: pitem.id        
            
          },
          //add all outfields to get geometry from selectedfeature
          outFields: ["*"]
          //title: pitem.title
          //id: skey
          //layerId: 0
        });


featureLayer.when().then(() => {
          const popupTemplate = featureLayer.popupTemplate.clone();

          popupTemplate.actions = [measureThisAction];
          popupTemplate.overwriteActions = true;
          featureLayer.popupTemplate = popupTemplate;
        });

        //wobj.map.add(featureLayer);	
		if (pitem.title) featureLayer.title = pitem.title;
        wobj.map.add(featureLayer);
                         
                        }
        //if a Layer but not a feature, just add the item as-is to the map
        
        if ((lyrtemp.type != "feature")) {
            if (pitem.title) lyrtemp.title = pitem.title;
            lyrtemp.layerType = "addon";
            wobj.map.add(lyrtemp);
        }
        //if (pitem.title) featureLayer.title = pitem.title;
        // lyr.layerType = "addon";
        //wobj.map.add(lyr);
        //wobj.map.add(featureLayer);
        
                    }).catch(function(err) {
                        console.log("error: " + err);
                    });
                } else if (pitem.type == "Web Map") {
                    //console.log("web map: " + pitem.id);
                    var witem = new WebMap({
                        portalItem: { // autocasts as new PortalItem()
                            id: pitem.id
                        }
                    });

                    witem.load().then(function(im) {

                        if (im.layers.length > 0) {
                            var grpLayer = new GroupLayer({
                                id: pitem.id,
                                title: im.portalItem.title,
                                visible: true,
                                visibilityMode: "independent",
                                layers: im.layers,
                                opacity: 1.0
                            });

                            wobj.map.add(grpLayer);
                        } else {
                            var jobj = im.basemap.toJSON();
                            var blayers = jobj.baseMapLayers;
                            if (blayers.length > 0) {
                                var arcgisUrl = blayers[0].url;
                                Layer.fromArcGISServerUrl({
                                    url: arcgisUrl
                                }).then(function(layer) {
                                    // add the layer to the map
                                    wobj.map.add(layer);
                                });
                            }

                        }
                        /* im.layers.map(function(lyr) {
                        lyr.layertype = "addon";
                      });
                    wobj.map.addMany(im.layers); */


                    });
                } else if (pitem.type == "KML") {
                    var surl = pitem.url;
                    //console.log(surl);
                    var ptitle = "";
                    if (pitem.title) ptitle = pitem.title;
                    var lyr = new KMLLayer(surl, { id: pitem.id, title: ptitle });
                    wobj.map.add(lyr);

                } else {
                    console.log("item " + pitem.id + " cannot be added to map.")
                }

            },	
_convertGraphic: function(pFeat) {
			//alert('test');
                this.mapview.popup.close();
                //view.popup.close();
                //var feature = this.idgraphic;
                var feature = pFeat;

                //start copy syms from IDinfoWindow

                var pointsym = { // symbol used for points
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            style: "cross",
            color: "rgba(255, 0, 255, 1.0)",
            size: "12px",
            outline: { // autocasts as new SimpleLineSymbol()
                color: "rgba(255, 0, 255, 1.0)",
                width: 1 // points
            }
        };
        var linesym = { // symbol used for polylines
            type: "simple-line", // autocasts as new SimpleMarkerSymbol()
            color: "#ff0000",
            width: "2",
            style: "solid"
        };
        var polysym = { // symbol used for polygons
            type: "simple-fill", // autocasts as new SimpleMarkerSymbol()
            color: "rgba(0, 255, 0, 0.25)",
            style: "solid",
            outline: {
                color: "red",
                width: 2
            }
        };

                //end copy syms
                
                var defaultradius = 1;
                switch (feature.geometry.type) {
                    case "point":
                        symbol = pointsym;
                        break;
                    case "polygon":
                        defaultradius = 0;
                        symbol = polysym;
                        break;
                    case "polyline":
                        symbol = linesym;
                        break;
                }

                var mgeometry = feature.geometry;
                var graphic = new Graphic(mgeometry);
                var gcounter = 0;
                var layerid = "Project" + gcounter;
                do {
                    gcounter = gcounter + 1;
                    layerid = "Project" + gcounter;
                } while ((view.map.findLayerById(layerid) != null))
            //} while ((wobj.map.findLayerById(layerid) != null))

                graphic.attributes = { "id": gcounter, "gtype": graphic.geometry.type, "radius": defaultradius.toString(), "unit": "miles", "ptitle": "" };
                //graphic.attributes = { "id": gcounter, "gtype": "tract", "radius": defaultradius.toString(), "unit": "miles", "ptitle": "","fips":feature.attributes["GEOID10"],"names":feature.attributes["GEOID10"]};
                var dlayer = new FeatureLayer({
                    id: layerid,
                    source: [graphic],
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
                            name: "radius",
                            type: "string"
                        },
                        {
                            name: "unit",
                            type: "string"
                        },
                        {
                            name: "ptitle",
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
                        content: lang.hitch(this, this.drawDesc)
                        //content: lang.hitch(this, wobj.drawDesc)
                    },
                    renderer: {
                        type: "simple",
                        symbol: symbol
                    }
                });
                dlayer.layerType = "digitize";
                //this.view.map.add(dlayer);
                //wobj.map.add(dlayer);
                view.map.add(dlayer);

                var gtype = graphic.geometry.type;
                var cpoint;
                if (gtype == "point") {
                    cpoint = graphic.geometry;
                } else if (gtype == "polyline") {
                    cpoint = mgeometry.extent.center;
                } else {
                    cpoint = mgeometry.centroid;
                }
                this.mapview.popup.open({ features: [graphic], location: cpoint });
                //view.popup.open({ features: [graphic], location: cpoint });


            },		
			drawDesc: function(e) {
                if (dijit.registry.byId("infowg")) {
                    dijit.byId("infowg").destroy();
                    dijit.registry.remove("infowg");

                }
                //alert(igraphic.attributes["descinfo"]);
                var infowidget = new EJinfoWindow({
                    view: this.mapview,
                    //view: view,
                    inGraphic: e.graphic,
                    id: 'infowg'
                }, domConstruct.create('div'));
                infowidget.startup();

                return infowidget.domNode;

            },
            destroy: function() {
                dojo.empty(this.domNode);
                this.inherited(arguments);
            }
        });



        return SearchServices;
    });