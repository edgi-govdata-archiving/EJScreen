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
        "dijit/form/Form",
        "dijit/form/RadioButton", "dijit/form/DropDownButton", "dijit/form/Button", "dijit/form/TextBox", "dijit/form/ComboBox", "dijit/form/FilteringSelect",
        "dojox/layout/FloatingPane",
        "dojo/text!mapdijit/templates/SearchGISweb.html",
        "esri/config",
		"esri/core/urlUtils",
        "esri/request",
        "esri/layers/MapImageLayer",
        "esri/layers/TileLayer",
        "esri/layers/FeatureLayer",
        "esri/layers/GraphicsLayer",
        "esri/layers/ImageryLayer",
        "esri/layers/ImageryTileLayer",
        "esri/layers/GeoRSSLayer",
        "esri/layers/KMLLayer",
        "esri/layers/WMSLayer",
        "esri/PopupTemplate"
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
        Form,
        RadioButton, DropDownButton, Button, TextBox, ComboBox, FilteringSelect,
        FloatingPane,
        dijittemplate,
        esriConfig,
		urlUtils,
        esriRequest,
        MapImageLayer,
        TileLayer,
        FeatureLayer,
        GraphicsLayer,
        ImageryLayer,
        ImageryTileLayer,
        GeoRSSLayer,
        KMLLayer,
        WMSLayer,
        PopupTemplate
    ) {


        var sampleURL = {
            "arcgis": {
                "url": "https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer/0,1",
                "note": "(https://&lt;server&gt;/arcgis/rest/services/&lt;service name&gt;/MapServer)"
            },
            "wms": {
                "url": "https://www.mrlc.gov/geoserver/mrlc_display/NLCD_2016_Land_Cover_L48/wms",
                "note": "<font color=red>Note: WMS service will not overlay well if the service does not have Mercator projection available.</font>"
            },
            "kml": {
                "url": "https://files.airnowtech.org/airnow/today/airnow_today.kml",
                "note": "<font color=red>Note: The KML/KMZ url must be publicly accessible.</font>"
            },
            "georss": {
                "url": "https://arcgis.github.io/arcgis-samples-javascript/sample-data/layers-georss/sample-georss.xml",
                "note": "<font color=red>Note: The GeoRSS url must be publicly accessible.</font>"
            }
        };
        var SearchGISweb = declare("mapdijit.SearchGISweb", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

            templateString: dijittemplate,

            widgetsInTemplate: true,
            constructor: function(options, srcRefNode) {
                options = options || {};
                if (!options.view) {
                    console.log("mapdijit.SearchGISweb: unable to find the 'view' property in parameters");
                    return;
                }
                this.mapview = options.view;
                this._map = this.mapview.map;

                this.servicetype = "arcgis";
                // mixin constructor options 
                dojo.safeMixin(this, options);


            },

            startup: function() {
                this.inherited(arguments);

            },
            postCreate: function() {
                this._doService();
            },
            _doService: function() {
                var stype = "arcgis";
                dojo.query('[name=layerType]').filter(function(radio) {
                    if (radio.checked) stype = radio.value;
                });
                this.servicetype = stype;
                this.urlNode.value = "https://";
                this.titleNode.value = "";

                document.getElementById("notediv1").innerHTML = sampleURL[stype].note;
                document.getElementById("samplediv").innerHTML = "Sample URL: <br/>" + sampleURL[stype].url;

            },
            _addRemoteLyr: function() {
                var svcurl = this.urlNode.value;
                svcurl = dojo.trim(svcurl);
                var svctype = this.servicetype;


                if (svcurl.substr(0, 4).toLowerCase() != "http") {
                    alert("invalid URL. Please enter a url starts with 'http'!");
                    return false;
                }
                var stitle = this.titleNode.value;
                var rid = this._getUniqueId(svctype);
                if ((stitle.length == 0) && (svctype != "arcgis")) stitle = rid;
                this._addServiceLayer(svctype, svcurl, rid, stitle);
            },
            _addServiceLayer: function(stype, surl, sid, stitle) {
                this.mapview.popup.viewModel.defaultPopupTemplateEnabled = true;
                var map = this._map;
                var httpreg = /^http:\/\//i;
               /* if (httpreg.test(surl)) {
                    var domainurl = surl;
                    var domainpat = /^http:\/\/[A-Za-z0-9_\.]+\//i;
                    var match = surl.match(domainpat);
                    if (match != null) {
                        domainurl = match[0];
                    }
                    esriConfig.request.proxyRules = {
                        urlPrefix: domainurl,
                        proxyUrl: proxyurl
                    };
                    esriConfig.request.corsEnabledServers.push(domainurl);
                }   */        
                var domainurl = surl;
                var domainpat = /^https?:\/\/[A-Za-z0-9_\.]+\//i;
                var match = surl.match(domainpat);
                if (match != null) {
                    domainurl = match[0];
                }
                urlUtils.addProxyRule({
                    proxyUrl: proxyurl,
                    urlPrefix: domainurl
                });				
                switch (stype.toLowerCase()) {
                    case 'arcgis':
                        var agspattern = /\/rest\/services/i;
                        if (agspattern.test(surl)) {
                            if (surl.substr(surl.length - 1) == "/") surl = surl.substr(0, surl.length - 1);
                            var agsurl = surl;
                            var featpattern = /\/featureserver/i;
                            var dynpattern = /\/mapserver/i;
                            var imagepattern = /\/imageserver/i;
                            if (featpattern.test(surl)) {
                                var fpattern = /\/featureserver$/i;
                                var spattern = /\/featureserver\/\d+$/i;
                                if (fpattern.test(surl)) {

                                    esriRequest(agsurl, {
                                        query: { f: "json" },
                                        responseType: "json"
                                    }).then(function(r) {
                                        if (r.data.layers) {
                                            for (var m = 0; m < r.data.layers.length; m++) {
                                                var layername = r.data.layers[m].name;
                                                var layerid = r.data.layers[m].id;
                                                var featurl = agsurl + "/" + layerid;

                                                /* var template = { // autocasts as new PopupTemplate()
                                                    title: layername,
                                                    content: "{*}"
                                                }; */
                                                var templayer = new FeatureLayer(featurl, {
                                                    mode: FeatureLayer.MODE_ONDEMAND,
                                                    id: sid + "_" + layerid,
                                                    layertype: "addon",
                                                    title: layername,
                                                    outFields: ["*"]
                                                        //popupTemplate: template
                                                });
                                                map.add(templayer);

                                            }
                                        }
                                    }).catch(function(e) {
                                        alert("error occurred on getting feature layers:" + e.message);
                                    });

                                } else if (spattern.test(surl)) {
                                    /* var ftemplate = new PopupTemplate();
                                    //ftemplate.title = "title";
                                    ftemplate.content = "{*}"; */
                                    var templayer = new FeatureLayer(surl, {
                                        mode: FeatureLayer.MODE_ONDEMAND,
                                        id: sid,
                                        layertype: "addon",
                                        title: stitle,
                                        //popupTemplate: ftemplate,
                                        outFields: ["*"]
                                    });
                                    map.add(templayer);

                                }


                            }
                            if (dynpattern.test(surl)) {
                                var endpos = surl.toLowerCase().indexOf("/mapserver");
                                if (surl.length > parseInt(endpos + 11)) {
                                    agsurl = surl.substr(0, endpos + 10);
                                    layerids = surl.substr(endpos + 11).split(",");
                                }
                                var templayer = new MapImageLayer(agsurl, {
                                    id: sid,
                                    layertype: "addon",
                                    title: stitle,
                                    opacity: 0.8
                                });

                                map.add(templayer);
                                if (surl.length > parseInt(endpos + 11)) {
                                    templayer.on("layerview-create", function(event) {
                                        var layerids = surl.substr(endpos + 11).split(",");
                                        templayer.allSublayers.map(function(sublyr) {
                                            var vstatus = false;
                                            for (var j = 0; j < layerids.length; j++) {
                                                if (sublyr.id == layerids[j]) {
                                                    vstatus = true;

                                                }
                                            }
                                            sublyr.visible = vstatus;
                                        });
                                    });
                                }
                            }

                            if (imagepattern.test(surl)) {
                                var templayer = new ImageryLayer({
                                    url: surl,
                                    legendEnabled: true,
                                    format: "jpgpng" // server exports in either jpg or png format
                                });
                                map.add(templayer);
                            }
                        }
                        break;
                    case 'wms':
                        var wmsarray = surl.split("?");
                        var wmsbaseurl = wmsarray[0];
                        var wmsparas = unescape(wmsarray[1]);
                        var paras = wmsparas.split("&");

                        //console.log(wmsbaseurl)
                        var wmsLayer = new WMSLayer(wmsbaseurl, {
                            id: sid,
                            layertype: "addon",
                            title: stitle,
                            legendEnabled: true

                        });

                        map.add(wmsLayer);
                        for (var m = 0; m < paras.length; m++) {
                            var pairstr = paras[m];
                            if (pairstr.split("=")[0].toLowerCase() == "layers") {
                                players = pairstr.split("=")[1];
                                if (players.length > 0) {
                                    var parray = players.split(",");
                                    wmsLayer.on("layerview-create", function(event) {
                                        wmsLayer.sublayers.map(function(sublyr) {
                                            var vstatus = false;
                                            for (var k = 0; k < parray.length; k++) {
                                                if (sublyr.id == parray[k]) vstatus = true;
                                            }
                                            sublyr.visible = vstatus;

                                        });


                                    });
                                }
                            }
                        }

                        break;
                    case 'kml':
                        var kml = new KMLLayer(surl, { id: sid, layertype: "addon", title: stitle });
                        map.add(kml);

                        break;
                    case 'georss':
                        var georss = new GeoRSSLayer(surl, { id: sid, layertype: "addon", title: stitle });
                        map.add(georss);

                        break;
                    case 'feature':
                        var templayer = new FeatureLayer(surl, {
                            mode: FeatureLayer.MODE_ONDEMAND,
                            id: sid,
                            layertype: "addon",
                            title: stitle,
                            outFields: ["*"]
                        });
                        map.add(templayer);

                        break;
                }
            },
            errorHandler: function(err) {
                alert("error occurred: " + err.message);
            },

            _getUniqueId: function(svctype) {
                var ulayerid = "";
                var scount = 1;
                var condition = true;
                while (condition) {
                    if (this._map.findLayerById(svctype + scount)) {
                        scount = scount + 1;
                        contition = true;
                    } else {
                        ulayerid = svctype + scount;
                        condition = false;
                    }
                }
                return ulayerid;
            },
            destroy: function() {

                //this.Render.destroy();
                dojo.empty(this.domNode);
                this.inherited(arguments);
            }



        });
        return SearchGISweb;
    });