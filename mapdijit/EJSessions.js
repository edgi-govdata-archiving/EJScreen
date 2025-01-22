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
        "dojox/layout/FloatingPane",
        "dojo/text!mapdijit/templates/Sessions.html",
        "esri/geometry/Extent",
        "esri/Graphic",
        "esri/layers/MapImageLayer",
        "esri/layers/TileLayer",
        "esri/layers/FeatureLayer",
        "esri/layers/ImageryLayer",
        "esri/layers/GraphicsLayer",
        "esri/layers/GeoRSSLayer",
        "esri/layers/KMLLayer",
        "esri/layers/WMSLayer",
        "esri/PopupTemplate",
        "esri/Basemap",
        "esri/renderers/support/jsonUtils",
        'mapdijit/EJinfoWindow'
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
        FloatingPane,
        dijittemplate,
        Extent,
        Graphic,
        MapImageLayer,
        TileLayer,
        FeatureLayer,
        ImageryLayer,
        GraphicsLayer,
        GeoRSSLayer,
        KMLLayer,
        WMSLayer,
        PopupTemplate,
        Basemap,
        rendererJsonUtils,
        EJinfoWindow
    ) {


        var a = dojo.create("link", { type: "text/css", rel: "stylesheet", href: "mapdijit/css/savesession.css" });
        dojo.doc.getElementsByTagName("head")[0].appendChild(a);


        var EJSessions = declare([_WidgetBase, _TemplatedMixin], {
            templateString: dijittemplate,

            widgetsInTemplate: true,

            constructor: function(options, srcRefNode) {

                options = options || {};
                if (!options.view) throw new Error("no map defined in params.");

                this.mapview = options.view;
                // mixin constructor options 
                dojo.safeMixin(this, options);


            },

            startup: function() {



            },
            postCreate: function() {
                if (localStorage.getItem('ejscreenSessions')) {
                    var retrievedSessions = localStorage.getItem('ejscreenSessions');
                    //console.log(retrievedSessions);
                    var jobj = JSON.parse(retrievedSessions);

                    for (var s in jobj) {
                        var sname = jobj[s].name;
                        var sNode = new sessionRow({ sesid: s, sesobj: jobj[s], parentobj: this });
                        sNode.placeAt(this.sesNode);
                    }
                }

            },
            _sespress: function(event) {
                if (event.keyCode == 13) {
                    this._addSession();

                }
            },
            _textblur: function(e) {

                /*console.log("blur: " + dojo.byId("sessionView").parentNode.style.visibility);
                if (dojo.byId("sessionView").parentNode.style.visibility == "visible") {
                dijit.byId('sesButton').openDropDown();
                } else {
                dijit.byId('sesButton').closeDropDown();
                //dojo.byId("sessionView").parentNode.style.visibility = "hidden";
                }*/
            },
            _addfile: function(event) {
                var wobj = this;
                var input = event.target;

                var reader = new FileReader();
                reader.onload = function() {
                    if (document.getElementById("addtocwg")) dojo.empty(document.getElementById("addtocwg"));
                    dijit.byId('sesButton').closeDropDown();
                    wobj.mapview.map.removeAll();
                    var text = reader.result;
                    var sesjsonobj = JSON.parse(text);
                    wobj._addNewSession(sesjsonobj);

                };
                reader.readAsText(input.files[0]);
            },
            _addSession: function() {

                var nsname = this.sestext.value;
                if (nsname.length == 0) {
                    alert("Please enter a session name!");
                    this.sestext.focus();
                    return false;
                }
                var sesid, sesobj;
                if (localStorage.getItem('ejscreenSessions')) {
                    var retrievedSessions = localStorage.getItem('ejscreenSessions');
                    var jobj = JSON.parse(retrievedSessions);
                    var ulayerid = "";
                    var scount = 1;
                    var condition = true;
                    while (condition) {
                        if (jobj["session" + scount]) {
                            scount = scount + 1;
                            contition = true;
                        } else {
                            ulayerid = "session" + scount;
                            condition = false;
                        }
                    }

                    jobj[ulayerid] = {};
                    jobj[ulayerid].name = nsname;
                    var curmapobj = this._getMapState();

                    jobj[ulayerid].mapobj = curmapobj;
                    sesid = ulayerid;
                    sesobj = jobj[ulayerid];

                    localStorage.setItem('ejscreenSessions', JSON.stringify(jobj));
                    console.log("save session success 1")
                } else {
                    sesid = "session1";
                    var testObject = {};
                    testObject[sesid] = {};
                    testObject[sesid].name = nsname;
                    var curmapobj = this._getMapState();

                    testObject[sesid].mapobj = curmapobj;

                    sesobj = testObject[sesid];
                    localStorage.setItem('ejscreenSessions', JSON.stringify(testObject));
                    console.log("save session success 2: ")
                }
                var sNode = new sessionRow({ sesid: sesid, sesobj: sesobj, parentobj: this });
                sNode.placeAt(this.sesNode);
                dijit.byId('sesButton').openDropDown();
                this.sestext.value = "";
            },
            _getMapState: function() {
                var layerStates = [],
                    graphicsState = [];
                //serialize each layer's state
                var wobj = this;
                this.mapview.map.layers.map(function(lyr) {
                    if (lyr.visible) layerStates.push(wobj._getLayerState(lyr));
                });

                //serialize graphics from last to first to retain graphics drawing order
                for (var i = this.mapview.graphics.length - 1; i >= 0; i--) {
                    graphicsState.push(this.mapview.graphics.items[i].toJSON());
                };
                //console.log(this.mapview.map.basemap.id)
                return {
                    extent: this.mapview.extent.toJSON(),
                    basemap: this.mapview.map.basemap.toJSON(),
                    layers: layerStates,
                    graphics: graphicsState
                };
            },
            _getLayerState: function(layer) {

                if (layer.isDynamic) {

                    return {
                        id: layer.id,
                        title: layer.title,
                        isDynamic: true,
                        layerType: layer.layerType,
                        pctlevel: layer.pctlevel,
                        renderField: layer.renderField,
                        renderIndex: layer.renderIndex,
                        renderobj: layer.renderobj,
                        type: layer.type,
                        url: layer.url,
                        visible: layer.visible,
                        opacity: layer.opacity
                    };
                } else if (layer.type == "graphics") {
                    var glayerGraphics = [];
                    for (var k = layer.graphics.length - 1; k >= 0; k--) {
                        glayerGraphics.push(layer.graphics.items[k].toJSON());

                    }
                    return {
                        id: layer.id,
                        type: layer.type,
                        title: layer.title,
                        visible: layer.visible,
                        graphics: glayerGraphics
                    };

                } else if (layer.type == "map-image") {
                    var sLayers = [];
                    for (var k = 0; k < layer.allSublayers.length; k++) {
                        sLayers.push(this._getSubLayer(layer.allSublayers.items[k]));

                    }

                    var listlayer = null;
                    if (layer.listlayer) listlayer = layer.listlayer;
                    return {
                        id: layer.id,
                        title: layer.title,
                        type: layer.type,
                        url: layer.url,
                        visible: layer.visible,
                        opacity: layer.opacity,
                        listlayer: listlayer,
                        layers: sLayers
                    };
                } else if (layer.type == "wms") {
                    var sLayers = [];
                    for (var k = 0; k < layer.sublayers.length; k++) {
                        sLayers.push(this._getWMSSubLayer(layer.sublayers.items[k]));

                    }

                    var listlayer = null;
                    if (layer.listlayer) listlayer = layer.listlayer;
                    return {
                        id: layer.id,
                        title: layer.title,
                        type: layer.type,
                        url: layer.url,
                        visible: layer.visible,
                        opacity: layer.opacity,
                        listlayer: listlayer,
                        layers: sLayers
                    };
                } else if (layer.type == "feature") {
                    var featobj = {
                        id: layer.id,
                        title: layer.title,
                        type: layer.type,

                        visible: layer.visible,
                        opacity: layer.opacity
                    };

                    if ((layer.layerType) && ((layer.layerType == "shapefile") || (layer.layerType == "digitize"))) {
                        featobj.objectIdField = layer.objectIdField;
                        featobj.geometryType = layer.geometryType;
                        featobj.fields = layer.fields;
                        featobj.layerType = layer.layerType;
                        featobj.source = layer.source;

                        if (layer.renderer) featobj.renderer = layer.renderer;
                    } else {
                        if (layer.layerType) featobj.layerType = layer.layerType;
                        if (layer.url) featobj.url = layer.url;
                        else if (layer.portalItem) featobj.portalItem = layer.portalItem.id;
                        else if (layer.source) {
                            featobj.objectIdField = layer.objectIdField;
                            featobj.geometryType = layer.geometryType;
                            featobj.fields = layer.fields;
                            featobj.source = layer.source;
                            if (layer.renderer) featobj.renderer = layer.renderer;
                            if (layer.popupTemplate) featobj.popupTemplate = layer.popupTemplate;
                        }
                    }
                    return featobj;
                } else {
                    return {
                        id: layer.id,
                        title: layer.title,
                        type: layer.type,
                        url: layer.url,
                        visible: layer.visible,
                        opacity: layer.opacity
                    };
                }
            },
            _getSubLayer: function(slayer) {

                return {
                    id: slayer.id,
                    title: slayer.title,
                    opacity: slayer.opacity,
                    definitionExpression: slayer.definitionExpression,
                    visible: slayer.visible

                }
            },
            _getWMSSubLayer: function(slayer) {
                var wmssublyrs = {
                    id: slayer.id,
                    name: slayer.name,
                    title: slayer.title,
                    opacity: slayer.opacity,
                    legendEnabled: slayer.legendEnabled,
                    visible: slayer.visible

                };
                if (slayer.legendUrl) wmssublyrs.legendUrl = slayer.legendUrl;
                return wmssublyrs;
            },
            _addNewSession: function(smapobj) {
                for (var demogid in demogJSON) {
                    demogJSON[demogid].dynamiclayers = {};
                }
                var mapview = this.mapview;
                //console.log(JSON.stringify(smapobj));
                var newextent = smapobj.extent;
                var mercatorExtent = new Extent(newextent);
                mapview.extent = mercatorExtent;
                if (smapobj.basemap.title) {
                    var basemaptitle = smapobj.basemap.title;
                    for (var i = 0; i < basemapGallery.source.basemaps.items.length; i++) {

                        if (basemapGallery.source.basemaps.items[i].title == basemaptitle) {
                            mapview.map.basemap = basemapGallery.source.basemaps.items[i];
                        }
                    }
                } else {
                    var newbasemap = Basemap.fromJSON(smapobj.basemap);
                    mapview.map.basemap = newbasemap;
                }


                var newgraphics = smapobj.graphics;
                var newlayers = smapobj.layers;
                for (var i = 0; i < newlayers.length; i++) {
                    var layer = newlayers[i];
                    this.addServiceLayer(layer);

                }


                dojo.forEach(newgraphics, function(graphic) {

                    var newgraphic = Graphic.fromJSON(graphic);

                    mapview.graphics.add(newgraphic);

                });



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
            idDesc: function(e) {
                var infowidget = new IDinfoWindow({
                    view: this.mapview,
                    idgraphic: e.graphic
                }, dojo.create('div'));
                infowidget.startup();

                return infowidget.domNode;

            },
            addServiceLayer: function(lyr) {
                var stype = lyr.type;
                var sid = lyr.id;
                var stitle = "";
                if (lyr.title) stitle = lyr.title;
                switch (stype) {
                    case 'map-image':
                        var surl = lyr.url;
                        var opc = lyr.opacity;
                        if (lyr.isDynamic) {
                            var fieldname = lyr.renderField;
                            var renderidx = lyr.renderIndex;

                            if (lyr.layerType == "ejscreen") {
                                var pcttype = lyr.pctlevel;
                                dijit.byId("ejmapwg")._mapejindex(fieldname, pcttype);
                            } else if (lyr.layerType != null) {
                                var ltype = lyr.layerType;
                                var mapid = ltype.split("_")[0];
                                var fieldid = lyr.renderField;
                                if (lyr.renderobj) {
                                    var robj = JSON.parse(JSON.stringify(lyr.renderobj))
                                        //var robj = lyr.renderobj;
                                    demogJSON[mapid].dynamiclayers[fieldid] = robj;
                                    dijit.byId("dgwg").classbreak(robj);
                                }
                            }
                        } else {

                            var templayer = new MapImageLayer(surl, {
                                id: sid,
                                title: stitle,
                                sublayers: lyr.layers,
                                opacity: opc
                            });


                            this.mapview.map.add(templayer);


                        }
                        break;
                    case "imagery":
                        var surl = lyr.url;
                        var opc = lyr.opacity;
                        var templayer = new ImageryLayer({
                            url: surl,
                            id: sid,
                            title: stitle,
                            opacity: opc,
                            legendEnabled: true,
                            format: "jpgpng" // server exports in either jpg or png format
                        });


                        this.mapview.map.add(templayer);
                        break;
                    case "graphics":
                        var grplayer;
                        if (this.mapview.map.findLayerById(sid)) {
                            grplayer = this.mapview.map.findLayerById(sid);
                        } else {

                            grplayer = new GraphicsLayer({ id: sid, title: stitle });
                            this.mapview.map.add(grplayer);
                        }
                        if (lyr.graphics) {
                            var buffreg = /^buffer/i;
                            for (var k = 0; k < lyr.graphics.length; k++) {
                                var grpjson = lyr.graphics[k];
                                var grpobj = Graphic.fromJSON(grpjson);

                                if ((sid == "digitizelayer") || (sid == "knowngeoLayer_poly")) {
                                    var gid = grpobj.attributes["id"];

                                    if (buffreg.test(gid)) {

                                    } else {
                                        var ptemplate = new PopupTemplate();
                                        ptemplate.title = "EJScreen Reports and Charts";
                                        ptemplate.content = lang.hitch(this, this.SetDesc);
                                        grpobj.popupTemplate = ptemplate;
                                    }
                                }
                                grplayer.add(grpobj);
                            }
                        }
                        break;
                    case 'tile':
                        var tilelayer = new TileLayer(surl, {
                            id: sid,
                            title: stitle,
                            url: lyr.url,
                            opacity: lyr.opacity
                        });
                        this.mapview.map.add(tilelayer);
                        break;

                    case 'wms':
                        var wmsbaseurl = lyr.url;

                        var sublyrs = lyr.layers;
                        var wmsLayer = new WMSLayer(wmsbaseurl, {
                            id: sid,
                            title: stitle,
                            sublayers: sublyrs,
                            legendEnabled: true

                        });

                        this.mapview.map.add(wmsLayer);
                        /*wmsLayer.on("layerview-create", function(event){
                                    wmsLayer.sublayers.map(function(sublyr) {
                                        console.log("wms legend url: " + sublyr.legendUrl);
                                    });
                                });
                                 if (lyr.layers) {
                                
                                    wmsLayer.on("layerview-create", function(event){
        
                                        wmsLayer.sublayers.map(function(sublyr) {
                                            var vstatus = false;
                                            for (var k = 0; k < lyr.layers.length; k++) {
                                                if (sublyr.id == lyr.layers[k].id) vstatus = lyr.layers[k].visible;
                                            }
                                            console.log(sublyr.id + ": " + vstatus);
                                            console.log("wms legend url: " + sublyr.legendUrl);
                                            sublyr.visible = vstatus;
                                        });
                                        
                                        
                                    });
                                } */

                        break;
                    case 'kml':
                        var kml = new KMLLayer(lyr.url, { id: sid, title: lyr.title });
                        this.mapview.map.add(kml);

                        break;
                    case 'geo-rss':
                        var georss = new GeoRSSLayer(lyr.url, { id: sid, title: stitle });
                        this.mapview.map.add(georss);

                        break;
                    case 'feature':
                        if ((lyr.layerType) && (lyr.layerType == "digitize")) {
                            var stitle = "";
                            if (lyr.title) stitle = lyr.title;
                            var newsource = [];
                            for (var m = 0; m < lyr.source.length; m++) {
                                var g = Graphic.fromJSON(lyr.source[m]);
                                newsource.push(g);

                            }
                            var drender = rendererJsonUtils.fromJSON(lyr.renderer);
                            var ptemp = new PopupTemplate();
                            ptemp.title = "EJScreen Reports and Charts";
                            ptemp.content = lang.hitch(this, this.SetDesc);
                            var templayer = new FeatureLayer({
                                id: sid,
                                objectIdField: lyr.objectIdField,
                                source: newsource,

                                title: stitle,
                                geometryType: lyr.geometryType,
                                fields: lyr.fields,
                                renderer: drender,
                                layerType: lyr.layerType

                            });
                            if (stitle.indexOf("buffer") > -1) {
                                templayer.popupTemplate = null;
                            } else {
                                templayer.popupTemplate = ptemp;
                            }
                            this.mapview.map.add(templayer);
                        } else if ((lyr.layerType) && (lyr.layerType == "shapefile")) {
                            var stitle = "";
                            if (lyr.title) stitle = lyr.title;
                            var newsource = [];
                            for (var m = 0; m < lyr.source.length; m++) {
                                var g = Graphic.fromJSON(lyr.source[m]);
                                //var g = new Graphic({geometry:lyr.source[m].gemetry,attributes: lyr.source[m].attributes});
                                //g.geometry.type = lyr.geometryType;
                                newsource.push(g);

                            }
                            var ptemp = new PopupTemplate();
                            ptemp.title = stitle;
                            ptemp.content = lang.hitch(this, this.idDesc)
                            var templayer = new FeatureLayer({
                                id: sid,
                                objectIdField: lyr.objectIdField,
                                source: newsource,
                                popupTemplate: ptemp,
                                title: stitle,
                                geometryType: lyr.geometryType,
                                fields: lyr.fields,
                                layerType: "shapefile"

                            });

                            this.mapview.map.add(templayer);
                        } else if (sid == "bufferlayer") {
                            //console.log("skip buffer layer");
                        } else {
                            if (lyr.url) {
                                var infoTemplate = new PopupTemplate();
                                infoTemplate.title = stitle;
                                infoTemplate.content = "{*}";
                                var templayer = new FeatureLayer(lyr.url, {
                                    mode: FeatureLayer.MODE_ONDEMAND,
                                    id: sid,
                                    title: stitle,
                                    popupTemplate: infoTemplate,
                                    outFields: ["*"]
                                });
                                this.mapview.map.add(templayer);
                            } else if (lyr.portalItem) {
                                var templayer = new FeatureLayer({
                                    portalItem: { // autocasts as new PortalItem()
                                        id: lyr.portalItem
                                    } // the first layer in the service is returned
                                });
                                this.mapview.map.add(templayer);
                            } else if (lyr.source) {
                                var template = new PopupTemplate();
                                if (lyr.popupTemplate) {
                                    template = PopupTemplate.fromJSON(lyr.popupTemplate);
                                    /* template.title = flayer.popupInfo.title;
                                    template.content = [{
                                        type: "fields",
                                        fieldInfos:flayer.popupInfo.fieldInfos
                                    }]; */

                                }
                                var newsource = [];
                                for (var m = 0; m < lyr.source.length; m++) {
                                    var g = Graphic.fromJSON(lyr.source[m]);
                                    //var g = new Graphic({geometry:lyr.source[m].gemetry,attributes: lyr.source[m].attributes});
                                    //g.geometry.type = lyr.geometryType;
                                    newsource.push(g);

                                }

                                var templayer = new FeatureLayer({
                                    id: sid,
                                    objectIdField: lyr.objectIdField,
                                    source: newsource,
                                    popupTemplate: template,
                                    //title: stitle,
                                    geometryType: lyr.geometryType,
                                    fields: lyr.fields

                                });
                                if (lyr.renderer) {
                                    var flRenderer = rendererJsonUtils.fromJSON(lyr.renderer);
                                    templayer.renderer = flRenderer;
                                }
                                this.mapview.map.add(templayer);
                            }
                        }
                        break;

                }
            },
            destroy: function() {

                dojo.empty(this.domNode);
                this.inherited(arguments);
            }

        });

        var sessionRow = declare([_Widget, _Templated], {
            templateString: '<div class="esriBookmarkItem"><div class="sessionLabel" data-dojo-attach-point="sesnameNode" data-dojo-attach-event="onmousedown:_gotosession"></div><a target="_blank" class="sessionSaveImage" title="Save to a file" data-dojo-attach-event="onmousedown:_savefile"><br /></a><div class="sessionRemoveImage" title="Remove" data-dojo-attach-event="onmousedown:_removesession"><br /></div>',

            constructor: function(a) {
                this.sesid = a.sesid;
                this.sesobj = a.sesobj
                this.parentobj = a.parentobj;
                this.mapview = this.parentobj.mapview;
                dojo.mixin(this, a)
            },
            postCreate: function() {
                //console.log(this.sesobj);
                this.sesnameNode.innerHTML = this.sesobj.name;

            },



            _gotosession: function() {
                var map = this.mapview.map;


                if (document.getElementById("addtocwg")) dojo.empty(document.getElementById("addtocwg"));
                dijit.byId('sesButton').closeDropDown();
                this.mapview.map.removeAll();

                if (dijit.byId("chartwg")) {
                    dijit.byId("chartwg").postCreate();
                }
                var smapobj = this.sesobj.mapobj;
                //console.log(smapobj.extent.xmin);
                this.parentobj._addNewSession(smapobj);

            },


            _savefile: function(evt) {
                var smapobj = this.sesobj.mapobj;
                var csv = JSON.stringify(smapobj);
                var csvData = 'data:application/csv;charset=utf-8,' +
                    encodeURIComponent(csv);
                evt.target.href = csvData;

                evt.target.download = 'filename.txt';
            },
            _removesession: function() {
                if (localStorage.getItem('ejscreenSessions')) {
                    var retrievedSessions = localStorage.getItem('ejscreenSessions');
                    var jobj = JSON.parse(retrievedSessions);
                    var sesid = this.sesid;
                    if (jobj[sesid]) {
                        delete(jobj[sesid]);
                        localStorage.setItem('ejscreenSessions', JSON.stringify(jobj));
                    }
                }
                this.destroy();
            },
            destroy: function() {
                dojo.empty(this.domNode);
                this.inherited(arguments);
            }
        });


        return EJSessions;

    });