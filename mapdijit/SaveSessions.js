define(['dojo/_base/declare',
        'dijit/_Widget',
        'dijit/_Templated',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dojo/_base/lang',
        'dojo/_base/array',
        'dojo/_base/html',
        'dojo/dom-attr',
        'dojo/query',
        'dojo/on',
        'dojo/topic',
        'dojo/string',
        'dojo/json',
        'dojo/Deferred',
        'dojo/promise/all',
        'dojo/Evented',
        "esri/request",
        'esri/geometry/Extent',
        'esri/Graphic',
        'esri/layers/GraphicsLayer',
        'esri/renderers/ClassBreaksRenderer',
        'esri/symbols/SimpleFillSymbol',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/symbols/SimpleLineSymbol',
        'esri/Color',
        'esri/renderers/SimpleRenderer',
        "esri/PopupTemplate",
        "esri/Basemap",
        "esri/layers/MapImageLayer",
        "esri/layers/TileLayer",
        "esri/layers/FeatureLayer",
        "esri/layers/GraphicsLayer",
        "esri/layers/GeoRSSLayer",
        "esri/layers/KMLLayer",
        "esri/layers/WMSLayer",
        "esri/layers/ImageryLayer",
        "esri/renderers/support/jsonUtils",
        "esri/geometry/geometryEngine",
        "esri/layers/support/Field",
        'mapdijit/EJinfoWindow',
        "mapdijit/IDinfoWindow",


        "dojo/text!mapdijit/templates/SaveSessions.html",
        'dijit/form/TextBox',
        'dijit/Dialog',
        "dijit/form/Select"
    ],
    function(declare,
        _Widget,
        _Templated,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        lang,
        array,
        html,
        domAttr,
        query,
        on,
        topic,
        string,
        JSON,
        Deferred,
        all,
        Evented,
        esriRequest,
        Extent,
        Graphic,
        GraphicsLayer,
        ClassBreaksRenderer,
        SimpleFillSymbol,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        Color,
        SimpleRenderer,
        PopupTemplate,
        Basemap,
        MapImageLayer,
        TileLayer,
        FeatureLayer,
        GraphicsLayer,
        GeoRSSLayer,
        KMLLayer,
        WMSLayer,
        ImageryLayer,
        rendererJsonUtils,
        geometryEngine,
        Field,
        EJinfoWindow,
        IDinfoWindow,


        dijittemplate,
        TextBox,
        Dialog
    ) {

        var fieldtypelookup = {
            "esriFieldTypeOID": "oid",
            "esriFieldTypeString": "string"
        }
        var a = dojo.create("link", { type: "text/css", rel: "stylesheet", href: "mapdijit/css/simpletable.css" });
        dojo.doc.getElementsByTagName("head")[0].appendChild(a);
        var SaveSessions = declare([_WidgetBase, _TemplatedMixin], {
            templateString: dijittemplate,

            widgetsInTemplate: true,
            // name of sessions string in local storage

            constructor: function(options, srcRefNode) {
                options = options || {};
                if (!options.view) throw new Error("no map view defined in params.");

                this.mapview = options.view;
                this.map = this.mapview.map;
                this.storageKey = "ejscreen_sessions_v4";
                this.useServerToDownloadFile = false;
                this.fileNameForAllSessions = "ejscreenSessions.json";
                this.fileNameTplForSession = "Sessions_";
                // the saved sessions
                this.sessions = [];
                this.sessionLoaded = null;
                // mixin constructor options 

                dojo.safeMixin(this, options);
            },



            postCreate: function() {
                this.inherited(arguments);

                // setup save to file
                this.saveToFileForm.action = "";
                this.saveToFileName.value = "ejscreensession";

                this.loadSavedSessionsFromStorage();

                this.initSavedSessionUI();

                this.initNewSessionUI();

                this.refreshLoadFileUI();

                console.log('SaveSession :: postCreate :: completed');
                /* var slimit = this.localStorageSpace();
                console.log("storage: " + slimit)*/

                /* if (window.localStorage.remainingSpace) console.log("browser remaining space: " + window.localStorage.remainingSpace);
                else console.log("browser remaining space: " + (1024 * 1024 * 5 - unescape(encodeURIComponent(JSON.stringify(localStorage))).length)); */

            },

            startup: function() {
                this.inherited(arguments);
                console.log('SaveSession :: startup');
            },



            /**
             * create the table of saved sessions
             */
            initSavedSessionUI: function() {
                var tableSettings = {
                    autoHeight: true,
                    fields: [{
                            "name": "name",
                            "title": "Session",
                            "type": "text",
                            "class": "session-name",
                            "unique": true,
                            "hidden": false,
                            "editable": true
                        },
                        {
                            "name": "actions",
                            "title": "Actions",
                            "type": "actions",
                            "class": "actions",
                            "actions": ['load', 'download', 'edit', 'up', 'down', 'delete']
                        }
                    ],
                    selectable: false
                };

                this.sessionTable = new SimpleTable(tableSettings);
                this.sessionTable.placeAt(this.savedSessionContainer);
                //this.sessionTable.startup();

                // listend for events on session table
                this.own(on(this.sessionTable, 'row-delete', lang.hitch(this, 'onSessionTableChanged')));
                this.own(on(this.sessionTable, 'row-up', lang.hitch(this, 'onSessionTableChanged')));
                this.own(on(this.sessionTable, 'row-down', lang.hitch(this, 'onSessionTableChanged')));
                this.own(on(this.sessionTable, 'row-edit', lang.hitch(this, 'onSessionTableChanged')));
                this.own(on(this.sessionTable, 'actions-load', lang.hitch(this, 'onLoadSessionClicked')));
                this.own(on(this.sessionTable, 'row-dblclick', lang.hitch(this, 'onLoadSessionClicked')));
                this.own(on(this.sessionTable, 'actions-download', lang.hitch(this, 'onSaveItemToFileClicked')));

                this.sessionTable.addRows(this.sessions);
                //console.log('SaveSession :: initSavedSessionUI :: session table created');
            },
            sizeofAllStorage: function() { // provide the size in bytes of the data currently stored
                var size = 0;
                for (i = 0; i <= window.localStorage.length - 1; i++) {
                    key = window.localStorage.key(i);
                    //console.log("cookie: " + key);
                    size += this.lengthInUtf8Bytes(window.localStorage.getItem(key));
                }
                return size;
            },
            lengthInUtf8Bytes: function(str) {
                // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
                var m = encodeURIComponent(str).match(/%[89ABab]/g);
                return str.length + (m ? m.length : 0);
            },
            /**
             * reload the table with the saved sessions
             */
            refreshSavedSessionUI: function() {
                this.sessionTable.clear();
                this.sessionTable.addRows(this.sessions);
                //console.log('SaveSession :: refreshSavedSessionUI :: session table refreshed');
            },
            localStorageSpace: function() {
                var allStrings = '';
                for (var key in window.localStorage) {
                    console.log("cookie: " + key);
                    if (window.localStorage.hasOwnProperty(key)) {
                        allStrings += window.localStorage[key];
                    }
                }
                return allStrings ? 3 + ((allStrings.length * 16) / (8 * 1024)) + ' KB' : 'Empty (0 KB)';
            },
            /**
             * set up the UI for New Session
             */
            initNewSessionUI: function() {
                this.refreshNewSessionUI();
                this.own(on(this.sessionNameTextBox, 'change', lang.hitch(this, 'refreshNewSessionUI')));
                this.own(on(this.sessionNameTextBox, 'keypress', lang.hitch(this, 'onKeyPressed')));
                //console.log('SaveSession :: initNewSessionUI :: end');
            },

            /**
             * enable the save file link when there are sessions
             */
            refreshLoadFileUI: function() {

                var sessionString = "",
                    hasSessions = false;

                hasSessions = this.sessions && this.sessions.length > 0;
                if (!hasSessions) {
                    domAttr.set(this.saveToFileButton, "disabled", "true");
                    html.addClass(this.saveToFileButton, "jimu-state-disabled");
                    //console.log('SaveSession :: refreshLoadFileUI :: save to file button disabled');
                } else {
                    domAttr.remove(this.saveToFileButton, "disabled");
                    html.removeClass(this.saveToFileButton, "jimu-state-disabled");
                    //console.log('SaveSession :: refreshLoadFileUI :: save to file button enabled');
                }


            },

            /**
             * when a key is pressed, check the session name
             * @param {Object} e event args
             */
            onKeyPressed: function(e) {

                if (e.keyCode === dojo.keys.ENTER) {
                    this.onSaveButtonClicked();
                }

                setTimeout(lang.hitch(this, 'refreshNewSessionUI'), 0);
                //console.log('SaveSession :: onKeyPressed :: end');
            },

            /**
             * enable the save button when a valid entry is in textbox
             */
            refreshNewSessionUI: function() {
                var sessionName = "",
                    isValid = false;
                sessionName = this.sessionNameTextBox.value;

                // must have a valid session name to enable save
                isValid = this.isValidSessionName(sessionName);

                if (!isValid) {
                    domAttr.set(this.saveButton, "disabled", "true");
                    //html.addClass(this.saveButton, "jimu-state-disabled");
                    //console.log('SaveSession :: refreshNewSessionUI :: save button disabled');
                } else {
                    domAttr.remove(this.saveButton, "disabled");
                    //html.removeClass(this.saveButton, "jimu-state-disabled");
                    //console.log('SaveSession :: refreshNewSessionUI :: save button enabled');
                }

                this.inputText.innerHTML = this.getMesageForSessionName(sessionName);
                //console.log('SaveSession :: refreshNewSessionUI :: end');
            },

            /**
             * checks if the given name is valid - has text and is not already taken
             * @param   {String} sessionName name for the session
             * @returns {Boolean}  true if the given session name is not already entered
             */
            isValidSessionName: function(name) {

                if (!name) {
                    return false;
                }

                // check for duplicates
                var hasSameName = array.some(this.sessions, function(session) {
                    return session.name === name;
                }, this);

                return !hasSameName;
            },

            /**
             * checks if the given name is valid - has text and is not already taken
             * @param   {String} sessionName name for the session
             * @returns {String}  true if the given session name is not already entered
             */
            getUniqueSessionName: function(name, idx) {

                idx = idx || 0; // default to 0

                idx += 1;

                var newName = name + " " + String(idx);

                if (!this.isValidSessionName(newName)) {


                    newName = this.getUniqueSessionName(name, idx);
                }

                return newName;
            },

            /**
             * returns input text for session name
             * @param   {String} sessionName name for the session
             * @returns {String}  a help message
             */
            getMesageForSessionName: function(name) {

                var text = "",
                    hasSameName = false;

                if (!name) {
                    text = "Enter the name for the session";
                }

                // check for duplicates
                hasSameName = array.some(this.sessions, function(session) {
                    return session.name === name;
                }, this);

                if (hasSameName) {
                    text = "Enter a unique name for the session";
                }

                return text;
            },

            /**
             * when the save button is clicked, add the session to local storage
             */
            onSaveButtonClicked: function() {
                //console.log('SaveSession :: onSaveButtonClicked :: begin');
                var session,
                    sessionName = "";
                sessionName = this.sessionNameTextBox.value;

                if (!this.isValidSessionName(sessionName)) {
                    console.log('SaveSession :: onSaveButtonClicked :: invalid sesion name = ', sessionName);
                    return;
                }

                session = this._getMapState();
                session.name = sessionName;
                this.sessions.push(session);

                //console.log("SaveSession :: onSaveButtonClicked :: added session = ", session);
                this.storeSessions();

                this.sessionTable.addRow(session);
                this.refreshLoadFileUI();
                this.refreshNewSessionUI();
                //console.log('SaveSession :: onSaveButtonClicked :: end');
            },

            /**
             * get the sessions from the table and store them
             */
            onSessionTableChanged: function(e) {
                //console.log('SaveSession :: onSessionTableChanged :: begin');

                // store changed sessions
                this.sessions = this.sessionTable.getItems();
                this.storeSessions();

                // and update ui
                this.refreshLoadFileUI();
                this.refreshNewSessionUI();

                //console.log('SaveSession :: onSessionTableChanged :: session stored');
            },

            /**
             * Load the session when clicked in Table
             * @param {Object} e the event args - item = session
             */
            onLoadSessionClicked: function(e) {
                var session = e.item;
                sessionLoaded = session;
                //console.log('SaveSession :: onLoadSessionClicked :: session  = ', session);

                this._addNewSession(session);
            },

            /**
             * prompt to upload file
             * @param {Object} e the event args 
             */
            onLoadFromFileButtonClicked: function(e) {
                this.filebtn.click();
                console.log('SaveSession :: onLoadFromFileButtonClicked :: ');
            },
            _submitFile: function(event) {
                var fileName = event.target.files[0];
                //fileName = fileName.replace(/C:\\fakepath\\/i, "");
                //console.log(fileName);
                this.loadSavedSessionsFromFile(fileName);
            },
            /**
             * save sessions to file
             * @param {Object} e the event args 
             */
            onSaveToFileButtonClicked: function(e) {


                var sessionString = JSON.stringify(this.sessions);
                if (window.navigator.msSaveOrOpenBlob) {
                    var fileData = [sessionString];
                    blobObject = new Blob(fileData);
                    window.navigator.msSaveOrOpenBlob(blobObject, this.fileNameForAllSessions);
                } else {
                    // must convert special chars to url encoding
                    sessionString = encodeURIComponent(sessionString);
                    domAttr.set(this.saveSingleSession, "href", "data:application/octet-stream," + sessionString);
                    domAttr.set(this.saveSingleSession, "download", this.fileNameForAllSessions);
                    this.saveSingleSession.click();
                }

                console.log('SaveSession :: onSaveToFileButtonClicked :: end');
            },

            /**
             * save the single item to file
             * @param {Object} e the event args 
             */
            onSaveItemToFileClicked: function(e) {
                var sessionString = "",
                    fileName = "",
                    singlesessions = [];

                fileName = this.fileNameTplForSession + e.item.name + ".json";

                var oneses = JSON.parse(JSON.stringify(e.item));
                singlesessions.push(oneses);

                sessionString = JSON.stringify(singlesessions);

                // update form values
                this.saveToFileName.value = fileName;
                this.saveToFileContent.value = sessionString;

                //Innovate Add - send data to url in hidden element and trigger click event
                if (window.navigator.msSaveOrOpenBlob) {
                    var fileData = [sessionString];
                    blobObject = new Blob(fileData);
                    window.navigator.msSaveOrOpenBlob(blobObject, fileName);
                } else {
                    sessionString = encodeURIComponent(sessionString);
                    domAttr.set(this.saveSingleSession, "href", "data:application/octet-stream," + sessionString);
                    domAttr.set(this.saveSingleSession, "download", fileName);

                    this.saveSingleSession.click();
                }

                // trigger the post to server side
                //this.saveToFileForm.submit();
                //console.log(sessionString);
                console.log('SaveSession :: onSaveItemToFileClicked :: end');
            },

            /**
             * load the session definitions from the given text file
             * @param {Object} file reference to text file to load
             */
            loadSavedSessionsFromFile: function(file) {
                console.log('SaveSession :: loadSavedSessionsFromFile :: begin for file = ', file);

                var sessionsString = "",
                    sessionsToLoad = null,
                    reader,
                    msg,
                    loadedCount = 0,
                    me = this;

                reader = new FileReader();

                // when the file is loaded
                reader.onload = function() {
                    var sessionsString = reader.result;

                    if (!sessionsString) {
                        console.warn("SaveSession :: loadSavedSessionsFromFile : no sessions to load");
                        alert("No sessions found in the file.");
                        return;
                    }

                    sessionsToLoad = JSON.parse(sessionsString);
                    console.log("SaveSession :: loadSavedSessionsFromFile : sessions found ", sessionsToLoad);

                    array.forEach(sessionsToLoad, function(sessionToLoad) {
                        var isValid = me.isValidSessionName(sessionToLoad.name);
                        if (!isValid) {
                            // fix the session name
                            sessionToLoad.name = me.getUniqueSessionName(sessionToLoad.name);
                            console.log("SaveSession :: loadSavedSessionsFromFile :: session name changed to " + sessionToLoad.name);
                        }

                        // refresh tabl
                        this.sessions.push(sessionToLoad);
                        this.sessionTable.addRow(sessionToLoad);
                        loadedCount += 1;
                    }, me);

                    // do not call refresh ui since session table will trigger change event
                    me.storeSessions();
                    me.refreshLoadFileUI();

                    console.log(String(loadedCount) + " sessions loaded from the file.")
                        //console.log('SaveSession :: loadSavedSessionsFromFile :: end for file = ', file);
                };

                // starting reading, and continue when load event fired
                reader.readAsText(file);
            },



            _addNewSession: function(sessionToLoad) {
                //this.mapview.map.removeAll();
                var mapview = this.mapview;
                var layerstoremove = [];
                mapview.map.layers.map(function(clyr) {

                    layerstoremove.push(clyr);
                });
                if (layerstoremove.length > 0) {
                    for (var r = 0; r < layerstoremove.length; r++) {
                        mapview.map.remove(layerstoremove[r]);
                    }
                }
                var smapobj = JSON.parse(JSON.stringify(sessionToLoad));
                /*for (var demogid in demogJSON) {
                    demogJSON[demogid].dynamiclayers = {};
                }*/
               
                for (let i=1;i <smapobj.layers.length ;++i){
                   if(smapobj.layers[i].renderField){
                       $("#"+smapobj.layers[i].renderField).addClass("highlight");
                   }else{
                       var layerid = smapobj.layers[i].id;
                       var actualLayerId = layerid.includes("_map")?layerid.replace("_map",""):layerid;
                       $("#"+actualLayerId).addClass("highlight");       
                      // $("#"+smapobj.layers[2].id).addClass("highlight");
                      var srcAttr =  $("#"+actualLayerId).find("img").attr('src');  
                      if(srcAttr){
                      var srcImgInput = srcAttr.substring(srcAttr.lastIndexOf("/")+1, srcAttr.length);   
                          if( $("#"+actualLayerId).hasClass("highlight")){      
                              var srcImg = srcImgInput.split(/_(.+)/)[0]+"_white_"+srcImgInput.split(/_(.+)/)[1];
                              $("#"+actualLayerId).find("img").attr('src','mapdijit/templates/images/'+srcImg);     
                          }
                      }
                   }
                }

                //console.log(JSON.stringify(smapobj));
                var newextent = smapobj.extent;
                var mercatorExtent = new Extent(newextent);
                mapview.extent = mercatorExtent;
                var basemaptitle = smapobj.basemap;


                // for (var i = 0; i < basemapGallery.source.basemaps.items.length; i++) {

                //     if (basemapGallery.source.basemaps.items[i].title == basemaptitle) {
                //         mapview.map.basemap = basemapGallery.source.basemaps.items[i];
                //     }
                // }

                /* var bingreg = /bing /i;
                var newbasemap = Basemap.fromJSON(smapobj.basemap);
                if (bingreg.test(basemaptitle)) {

                    if (dijit.byId("basemapGallery")) {
                        //console.log(newbasemap);
                        //console.log(newbasemap.toJSON())
                        dijit.byId("basemapGallery").activeBasemap = newbasemap;
                    }
                } else {
                    mapview.map.basemap = newbasemap;
                } */
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
                        var tilelayer = new TileLayer({
                            url: surl,
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
                            var newfields = [];
                            for (var k = 0; k < lyr.fields.length; k++) {
                                var fld = Field.fromJSON(lyr.fields[k]);
                                newfields.push(fld);

                            }
                            var drender = rendererJsonUtils.fromJSON(lyr.renderer);
                            // var ptemp = new PopupTemplate();
                            // ptemp.title = "Chart or Report";
                            // ptemp.content = lang.hitch(this, this.SetDesc);
                            var templayer = new FeatureLayer({
                                id: sid,
                                objectIdField: lyr.objectIdField,
                                source: newsource,
                                outFields: ['*'],
                                title: stitle,
                                geometryType: lyr.geometryType,
                                fields: newfields,
                                popupTemplate: stitle.indexOf("buffer") > -1?null:{
                                    title: "EJScreen Reports and Charts",
                                    content: lang.hitch(this, this.SetDesc)
                                },
                                renderer: drender,
                                layerType: lyr.layerType

                            });
                            // if (stitle.indexOf("buffer") > -1) {
                            //     templayer.popupTemplate = null;
                            // } else {
                            //     templayer.popupTemplate = ptemp;
                            // }
                            this.mapview.map.add(templayer);
                            drawlayerobj[sid] = newsource;
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
                            var newfields = [];
                            for (var k = 0; k < lyr.fields.length; k++) {
                                var fld = Field.fromJSON(lyr.fields[k]);
                                newfields.push(fld);

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
                                fields: newfields,
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

                                } else {
                                    template.title = lyr.title;
                                    template.content = "{*}";
                                }
                                var newsource = [];
                                for (var m = 0; m < lyr.source.length; m++) {
                                    var g = Graphic.fromJSON(lyr.source[m]);
                                    //var g = new Graphic({geometry:lyr.source[m].gemetry,attributes: lyr.source[m].attributes});
                                    //g.geometry.type = lyr.geometryType;
                                    newsource.push(g);

                                }
                                var newfields = [];
                                for (var k = 0; k < lyr.fields.length; k++) {
                                    var fld = Field.fromJSON(lyr.fields[k]);
                                    newfields.push(fld);

                                }
                                var templayer = new FeatureLayer({
                                    id: sid,
                                    objectIdField: lyr.objectIdField,
                                    source: newsource,
                                    popupTemplate: template,
                                    //title: stitle,
                                    geometryType: lyr.geometryType,
                                    fields: newfields

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
            _addBuffer: function(bgraphic) {
                var buffid = "buffer" + bgraphic.attributes["id"];
                var buff = bgraphic.attributes["radius"];

                if (buff.length > 0) {
                    buff = parseFloat(buff);
                } else {
                    buff = 0;
                }
                if (buff > 0) {
                    var distUnits = bgraphic.attributes["unit"];

                    var buffer = geometryEngine.geodesicBuffer(bgraphic.geometry, buff, distUnits);

                    var att = { "bufferid": buffid, "radius": buff, "unit": distUnits };
                    var bufgraphic = new Graphic({
                        geometry: buffer,
                        attributes: att
                    });
                    var glayer;
                    if (this.mapview.map.findLayerById("bufferlayer")) {
                        glayer = this.mapview.map.findLayerById("bufferlayer");

                        glayer.applyEdits({
                            addFeatures: [bufgraphic]
                        });

                    } else {
                        glayer = new FeatureLayer({
                            id: "bufferlayer",
                            title: "Buffer graphics",
                            source: [bufgraphic],
                            objectIdField: "id",
                            fields: [{
                                    name: "id",
                                    type: "oid"
                                },
                                {
                                    name: "bufferid",
                                    type: "string"
                                },
                                {
                                    name: "radius",
                                    type: "double"
                                },
                                {
                                    name: "unit",
                                    type: "string"
                                }
                            ],

                            renderer: {
                                type: "simple",
                                symbol: buffersymbol
                            }
                        });

                        this.mapview.map.add(glayer);
                    }


                }


            },
            idDesc: function(e) {
                var infowidget = new IDinfoWindow({
                    view: this.mapview,
                    idgraphic: e.graphic
                }, dojo.create('div'));
                infowidget.startup();

                return infowidget.domNode;

            },

            wait: function(ms) {
                var start = new Date().getTime();
                var end = start;
                while (end < start + ms) {
                    end = new Date().getTime();
                }
            },

            getKMLvisible: function(vkmllayers, fldid) {
                var fldvis = false;
                for (var m = 0; m < vkmllayers.length; m++) {
                    if (fldid == vkmllayers[m]) fldvis = true;
                }
                return fldvis;
            },


            _getMapState: function() {
                var layerStates = [],
                    graphicsState = [];
                //serialize each layer's state
                var wobj = this;
                this.mapview.map.layers.map(function(lyr) {
                    if (lyr.visible) {
                        if ((lyr.type == "feature") && (lyr.layerType) && (lyr.layerType == "digitize")) {
                            if (lyr.id in drawlayerobj) {
                                var featobj = {
                                    id: lyr.id,
                                    title: lyr.title,
                                    type: lyr.type,

                                    visible: lyr.visible,
                                    opacity: lyr.opacity
                                };

                                featobj.objectIdField = lyr.objectIdField;
                                featobj.geometryType = lyr.geometryType;
                                featobj.fields = lyr.fields;

                                featobj.layerType = lyr.layerType;
                                if (lyr.renderer) featobj.renderer = lyr.renderer;
                                featobj.source = drawlayerobj[lyr.id];
                                layerStates.push(featobj);
                            }
                        } else if (lyr.id == "bufferlayer") {
                            console.log("do not save buffer layer");
                        } else {
                            layerStates.push(wobj._getLayerState(lyr));
                        }
                    }
                });

                //serialize graphics from last to first to retain graphics drawing order
                for (var i = this.mapview.graphics.length - 1; i >= 0; i--) {
                    graphicsState.push(this.mapview.graphics.items[i].toJSON());
                };

                return {
                    extent: this.mapview.extent.toJSON(),
                    basemap: this.mapview.map.basemap.title,
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



            /**
             * save the current sessions to local storage
             */
            storeSessions: function() {
                try {
                    var stringToStore = JSON.stringify(this.sessions);
                    window.localStorage.setItem(this.storageKey, stringToStore);

                    console.log("SaveSession :: storeSessions :: completed");
                } catch (e) {
                    var emsg = e.message;
                    var limreg = /storage/i;
                    console.log("error occurred: " + emsg);
                    if (limreg.test(emsg)) {
                        this.sessions.pop();
                        this.storeSessions();
                    }
                }
            },

            /**
             * read the saved sessions from storage
             */
            loadSavedSessionsFromStorage: function() {
                var storedString = "",
                    storedSessions = null;

                storedString = window.localStorage.getItem(this.storageKey);
                if (!storedString) {
                    console.log("SaveSession :: loadSavedSessionsFromStorage : no stored sessions to load");
                    return;
                }

                storedSessions = JSON.parse(storedString);
                //console.log(storedSessions)

                // replace to current sessions
                this.sessions = storedSessions;

            },


            /**
             * returns the last part of the declaredClass for the given layer object
             * @param   {esri.layers.Layer} layer the map layer object
             * @returns {String} the layer type
             */
            getLayerType: function(layer) {

                var layerTypeArray = [],
                    layerType = "";

                if (!layer) {
                    return "";
                }

                layerTypeArray = layer.declaredClass.split(".");
                layerType = layerTypeArray[layerTypeArray.length - 1];
                return layerType;
            }

        });
        var SimpleTable = declare([_WidgetBase, _TemplatedMixin, Evented], {

            templateString: '<div class="jimu-simple-table">' +
                '<div class="head-section" data-dojo-attach-point="headDiv"></div>' +
                '<div class="body-section" data-dojo-attach-point="bodyDiv">' +
                '<div class="table-div" data-dojo-attach-point="tableDiv">' +
                '<table class="table" cellspacing="0" onselectstart="return false;">' +
                '<colgroup></colgroup>' +
                '<thead class="simple-table-thead simple-table-title"></thead>' +
                '<tbody class="simple-table-tbody"></tbody>' +
                '</table>' +
                '</div>' +
                '</div>' +
                '</div>',
            _name: null,
            _rowIndex: 0,
            _rowHeight: 30,
            _headHeight: 36,
            REPEATING_ERROR: "REPEATING_ERROR",
            _classSimpleTableRow: 'simple-table-row',
            _classFirstSimpleTableRow: 'first-simple-table-row',
            _classLastSimpleTableRow: 'last-simple-table-row',
            _classJimuStateDisabled: 'jimu-state-disabled',
            _classRowUpDiv: 'row-up-div',
            _classRowDownDiv: 'row-down-div',

            //options:
            autoHeight: true, //if true, automatically calculate the height
            selectable: false,
            fields: null,
            /*
              //fieldInfo's attributes:
              //name:field name
              //title:field title
              //type:text radio checkbox actions empty extension
              //class:class name of th and td
              //width:width of the field column, auto is default.
              //hidden:default false.If true,the field column will be hidden.
              //if text
                //editable:the text can be edited if true.
                //unique:field value is unique in the column.
              //if actions
                //actions:['up','down','edit','delete']
              //if extension
                //create //function
                //setValue //function
                //getValue //function
            */

            //public methods:
            //clear
            //clearEmptyRows
            //addEmptyRow
            //addRows
            //addRow
            //deleteRow
            //editRow
            //selectRow
            //getRows
            //getSelectedRow
            //getSelectedRowData
            //getData
            //getRowData
            //getRowDataArrayByFieldValue

            //events:
            //row-click
            //row-dblclick
            //row-select
            //rows-clear
            //row-add
            //row-edit
            //row-delete
            //row-up
            //row-down
            //actions-edit

            //css classes:
            //simple-table-title
            //simple-table-row
            //simple-table-field
            //simple-table-cell

            constructor: function(options, srcRefNode) {

                // mixin constructor options 
                dojo.safeMixin(this, options);
            },
            /* postMixInProperties: function () {
                this.nls = window.jimuNls.simpleTable;
            }, */
            postCreate: function() {
                this.inherited(arguments);
                this._initSelf();
            },

            startup: function() {
                this.inherited(arguments);
                this._updateUI();
            },

            _initSelf: function() {
                this._initAttachPoints();

                this.own(
                    this.bindClickAndDblclickEvents(this.table,
                        lang.hitch(this, function(evt) {
                            var target = evt.target || evt.srcElement;
                            var tr = this.getAncestorDom(target, function(dom) {
                                return html.hasClass(dom, 'simple-table-row') && html.hasClass(dom, 'not-empty');
                            }, this.tbody);
                            if (tr) {
                                this.selectRow(tr);
                                this._onClickRow(tr);
                            }
                        }), lang.hitch(this, function(evt) {
                            var target = evt.target || evt.srcElement;
                            var tr = this.getAncestorDom(target, function(dom) {
                                return html.hasClass(dom, 'simple-table-row') && html.hasClass(dom, 'not-empty');
                            }, this.tbody);
                            if (tr) {
                                this.selectRow(tr);
                                this._onDblClickRow(tr);
                            }
                        }))
                );

                var num = Math.random().toString();
                this._name = 'jimu_table_' + num.slice(2, num.length);
                this.thead = query('thead', this.domNode)[0];
                this.tbody = query('tbody', this.domNode)[0];

                if (this.fields && this.fields.length > 0) {
                    var tr = html.create('tr', {}, this.thead);
                    array.forEach(this.fields, lang.hitch(this, function(item) {
                        var width = 'auto';
                        if (item.type === 'actions') {
                            item.name = 'actions';
                        }

                        if (item.hidden) {
                            width = 1;
                        } else if (item.width !== undefined && item.width !== null) {
                            width = item.width;
                        } else if (item.type === 'actions') {
                            if (!item.name) {
                                item.width = this._calculateActionsWidth(item) + 20;
                                width = item.width;
                            }
                        }

                        html.create('col', {
                            width: width
                        }, this.colgroup);
                        var th = html.create('th', {
                            innerHTML: item.title,
                            title: item.title
                        }, tr);

                        html.addClass(th, 'simple-table-field');

                        if (item.hidden) {
                            html.addClass(th, 'hidden-column');
                        }

                        if (item['class']) {
                            html.addClass(th, item['class']);
                        }
                        html.addClass(th, item.name);
                    }));

                    //clone thead
                    html.empty(this.headDiv);
                    var tableDiv = lang.clone(this.tableDiv);
                    html.place(tableDiv, this.headDiv);

                    //this.addEmptyRow();
                } else {
                    this.fields = null;
                }
            },

            _initAttachPoints: function() {
                this.table = query('table', this.bodyDiv)[0];
                this.colgroup = query('colgroup', this.bodyDiv)[0];
                this.head = query('thead', this.bodyDiv)[0];
                this.tbody = query('tbody', this.bodyDiv)[0];
            },

            clear: function() {
                var trs = this._getNotEmptyRows();
                html.empty(this.tbody);
                array.forEach(trs, lang.hitch(this, function(tr) {
                    this._onDeleteRow(tr);
                }));
                //this.addEmptyRow();
                this._updateUI();
                this._rowIndex = 0;
                this._onClearRows(trs);
            },
            getAncestorDom: function(child, verifyFunc,
                /*HTMLElement|Number optional */
                maxLoopSizeOrDom) {
                if (child && child.nodeType === 1) {
                    if (verifyFunc && typeof verifyFunc === 'function') {
                        var maxLoopSize = 100;
                        var maxLoopDom = document.body;

                        if (maxLoopSizeOrDom) {
                            if (typeof maxLoopSizeOrDom === 'number') {
                                //Number
                                maxLoopSizeOrDom = parseInt(maxLoopSizeOrDom, 10);
                                if (maxLoopSizeOrDom > 0) {
                                    maxLoopSize = maxLoopSizeOrDom;
                                }
                            } else if (maxLoopSizeOrDom.nodeType === 1) {
                                //HTMLElement
                                maxLoopDom = maxLoopSizeOrDom;
                            }
                        }

                        var loop = 0;
                        while (child.parentNode && loop < maxLoopSize &&
                            html.isDescendant(child.parentNode, maxLoopDom)) {
                            if (verifyFunc(child.parentNode)) {
                                return child.parentNode;
                            }
                            child = child.parentNode;
                            loop++;
                        }
                    }
                }
                return null;
            },
            bindClickAndDblclickEvents: function(dom, clickCallback, dblclickCallback,
                /* optional */
                _timeout) {
                var handle = null;
                var isValidDom = dom && dom.nodeType === 1;
                var isValidClick = clickCallback && typeof clickCallback === 'function';
                var isValidDblclick = dblclickCallback && typeof dblclickCallback === 'function';
                var isValid = isValidDom && isValidClick && isValidDblclick;
                if (isValid) {
                    var timeout = 200;
                    if (_timeout && typeof _timeout === 'number') {
                        var t = parseInt(_timeout, 10);
                        if (t > 0) {
                            timeout = t;
                        }
                    }

                    var clickCount = 0;
                    handle = on(dom, 'click', function(evt) {
                        clickCount++;
                        if (clickCount === 1) {
                            setTimeout(function() {
                                if (clickCount === 1) {
                                    clickCount = 0;
                                    clickCallback(evt);
                                }
                            }, timeout);
                        } else if (clickCount === 2) {
                            clickCount = 0;
                            dblclickCallback(evt);
                        }
                    });
                }
                return handle;
            },
            // clearEmptyRows: function() {
            //   var trs = this._getEmptyRows();
            //   array.forEach(trs, lang.hitch(this, function(tr) {
            //     html.destroy(tr);
            //   }));
            //   this._updateUI();
            // },

            // addEmptyRow: function() {
            //   if (!this.fields) {
            //     return;
            //   }

            //   this.clearEmptyRows();
            //   var length = this.fields.length;
            //   var tr = html.create('tr', {
            //     'class': 'simple-table-row empty'
            //   }, this.tbody);
            //   for (var i = 0; i < length; i++) {
            //     html.create('td', {
            //       'class': 'simple-table-cell empty-td'
            //     }, tr);
            //   }
            //   this._updateRowClassName();
            // },

            addRows: function(rowsData) {
                var results = [];
                if (this.fields && rowsData && rowsData.length > 0) {
                    array.forEach(rowsData, lang.hitch(this, function(item) {
                        results.push(this.addRow(item, true));
                    }));
                }
                this._updateUI();
                return results;
            },

            //example:{name1:value1,name2:value2...}
            addRow: function(rowData, /* optional */ dontUpdateUI) {
                this._rowIndex++;
                var result = {
                    success: false,
                    tr: null,
                    errorCode: null,
                    errorMessage: null,
                    repeatFields: null
                };
                if (!this.fields || (typeof rowData !== 'object')) {
                    return result;
                }

                var uniqueFieldMetas = array.filter(this.fields, lang.hitch(this, function(item) {
                    return item.type === 'text' && item.unique === true;
                }));

                var repeatFieldMetas = array.filter(uniqueFieldMetas, lang.hitch(this, function(item) {
                    var sameValueRows = this.getRowDataArrayByFieldValue(item.name, rowData[item.name]);
                    return sameValueRows.length > 0;
                }));

                if (repeatFieldMetas.length > 0) {
                    result.errorCode = this.REPEATING_ERROR;
                    result.errorMessage = "repeating data";
                    result.repeatFields = repeatFieldMetas;
                    return result;
                }

                // this.clearEmptyRows();
                var tr = html.create("tr", {
                    'class': "simple-table-row not-empty"
                }, this.tbody);
                var rowId = 'row' + this._rowIndex;
                html.setAttr(tr, 'rowId', rowId);

                array.forEach(this.fields, lang.hitch(this, function(fieldMeta) {
                    var fieldData = rowData[fieldMeta.name];
                    var type = fieldMeta.type;
                    var td = null;
                    if (type === 'actions') {
                        td = this._createActionsTd(tr, fieldMeta);
                    } else {
                        if (type === "text") {
                            td = this._createTextTd(tr, fieldMeta, fieldData);
                        } else if (type === "radio") {
                            td = this._createRadioTd(tr, fieldMeta, fieldData);
                        } else if (type === 'checkbox') {
                            td = this._createCheckboxTd(tr, fieldMeta, fieldData);
                        } else if (type === "empty") {
                            td = this._createEmptyTd(tr, fieldMeta);
                        } else if (type === "extension") {
                            td = this._createExtensionTd(tr, fieldMeta, fieldData);
                        }
                        if (fieldMeta.hidden) {
                            html.addClass(td, 'hidden-column');
                        }
                    }
                }));

                // attach item as attribute of tr so can retrieve later
                tr.item = rowData;

                if (!dontUpdateUI) {
                    this._updateUI();
                }
                result.success = true;
                result.tr = tr;
                result.errorMessage = null;
                this._onAddRow(tr);
                return result;
            },

            deleteRow: function(tr) {
                if (tr) {
                    html.destroy(tr);
                    this._updateUI();
                    this._onDeleteRow(tr);
                    // var trs = this._getAllRows();
                    // if(trs.length === 0){
                    //   this.addEmptyRow();
                    // }
                }
            },

            selectRow: function(tr) {
                if (this.selectable) {
                    var trs = query('.simple-table-row', this.tbody);
                    trs.removeClass('jimu-state-active');
                    html.addClass(tr, 'jimu-state-active');
                    this._onSelectRow(tr);
                }
            },

            _updateUI: function() {
                this._updateRowClassName();
                this._updateHeight();
            },

            _updateHeight: function() {
                if (this.autoHeight) {
                    var rows = this.getRows();
                    var trCount = rows.length > 0 ? rows.length : 1;
                    // var count = trCount + 1;
                    var height = this._headHeight + this._rowHeight * trCount + 1;
                    html.setStyle(this.domNode, 'height', height + 'px');
                    // this.bodyDiv.style.overflowY = 'hidden';
                }
            },

            _updateRowClassName: function() {
                var originalFirtTr = query('.' + this._classFirstSimpleTableRow, this.tbody)[0];
                if (originalFirtTr) {
                    var originalFirstUpDiv = query('.' + this._classRowUpDiv, originalFirtTr)[0];
                    if (originalFirstUpDiv) {
                        html.removeClass(originalFirstUpDiv, this._classJimuStateDisabled);
                    }
                }

                var originalLastTr = query('.' + this._classLastSimpleTableRow, this.tbody)[0];
                if (originalLastTr) {
                    var originalLastDownDiv = query('.' + this._classRowDownDiv, originalLastTr)[0];
                    if (originalLastDownDiv) {
                        html.removeClass(originalLastDownDiv, this._classJimuStateDisabled);
                    }
                }

                var trs = query('.' + this._classSimpleTableRow, this.tbody);
                trs.removeClass('odd');
                trs.removeClass('even');
                trs.removeClass(this._classFirstSimpleTableRow);
                trs.removeClass(this._classLastSimpleTableRow);

                array.forEach(trs, lang.hitch(this, function(tr, index) {
                    if (index % 2 === 0) {
                        html.addClass(tr, 'odd');
                    } else {
                        html.addClass(tr, 'even');
                    }
                }));

                if (trs.length > 0) {
                    var firstTr = trs[0];
                    html.addClass(firstTr, this._classFirstSimpleTableRow);
                    var firstUpDiv = query('.' + this._classRowUpDiv, firstTr)[0];
                    if (firstUpDiv) {
                        html.addClass(firstUpDiv, this._classJimuStateDisabled);
                    }

                    var lastTr = trs[trs.length - 1];
                    html.addClass(lastTr, this._classLastSimpleTableRow);
                    var lastDownDiv = query('.' + this._classRowDownDiv, lastTr)[0];
                    if (lastDownDiv) {
                        html.addClass(lastDownDiv, this._classJimuStateDisabled);
                    }
                }
            },

            _createTextTd: function(tr, fieldMeta, fieldData) {
                var td = null;
                if (fieldMeta.editable) {
                    td = this._createEditableTextTd(tr, fieldMeta, fieldData);
                } else {
                    td = this._createNormalTextTd(tr, fieldMeta, fieldData);
                }
                return td;
            },

            _createNormalTextTd: function(tr, fieldMeta, fieldData) {
                var strTd = '<td class="simple-table-cell normal-text-td">' +
                    '<div class="normal-text-div"></div></td>';
                var td = html.toDom(strTd);
                html.addClass(td, fieldMeta.name);
                var textDiv = query('div', td)[0];
                textDiv.innerHTML = fieldData || "";
                textDiv.title = fieldData || "";
                if (fieldMeta['class']) {
                    html.addClass(td, fieldMeta['class']);
                }
                html.place(td, tr);
                return td;
            },

            _createEditableTextTd: function(tr, fieldMeta, fieldData) {
                var tdStr = '<td class="editable-text-td ' + fieldMeta.name + '">' +
                    '<div class="editable-div">' +
                    '</div><input class="editable-input" type="text" style="display:none;" /></td>';
                var td = html.toDom(tdStr);
                html.addClass(td, 'simple-table-cell');
                html.place(td, tr);
                if (fieldMeta['class']) {
                    html.addClass(td, fieldMeta['class']);
                }
                var editableDiv = query('div', td)[0];
                var editableInput = query('input', td)[0];
                editableDiv.innerHTML = fieldData || "";
                if (editableDiv.innerHTML !== "") {
                    editableDiv.title = editableDiv.innerHTML;
                }
                editableInput.value = editableDiv.innerHTML;
                /*
                this.own(on(editableDiv, 'dblclick', lang.hitch(this, function (event) {
                    event.stopPropagation();
                    // do not enable edit mode on double click
                    
                    editableInput.value = editableDiv.innerHTML;
                    html.setStyle(editableDiv, 'display', 'none');
                    html.setStyle(editableInput, 'display', 'inline');
                    editableInput.focus();
                })));
                */

                // trigger blur on enter key
                this.own(on(editableInput, 'keypress', lang.hitch(this, function(e) {
                    if (e.keyCode === dojo.keys.ENTER) {
                        editableInput.blur();
                    }

                })));
                this.own(on(editableInput, 'blur', lang.hitch(this, function() {
                    editableInput.value = lang.trim(editableInput.value);
                    var oldValue = editableDiv.innerHTML;
                    var newValue = editableInput.value;
                    if (newValue !== '') {
                        if (fieldMeta.unique) {
                            var sameValueRows = this.getRowDataArrayByFieldValue(fieldMeta.name, newValue, tr);
                            if (sameValueRows.length > 0) {
                                editableInput.value = oldValue;
                            } else {
                                editableDiv.innerHTML = newValue;
                            }
                        } else {
                            editableDiv.innerHTML = newValue;
                        }
                    } else {
                        editableInput.value = oldValue;
                    }
                    // update item
                    tr.item[fieldMeta.name] = editableDiv.innerHTML;

                    html.setStyle(editableInput, 'display', 'none');
                    html.setStyle(editableDiv, 'display', 'block');
                    this._onEditRow(tr);
                })));
                return td;
            },

            _createRadioTd: function(tr, fieldMeta, fieldData) {
                var tdStr = '<td class="radio-td ' + fieldMeta.name + '"><input type="radio" /></td>';
                var td = html.toDom(tdStr);
                html.addClass(td, 'simple-table-cell');
                html.place(td, tr);
                if (fieldMeta['class']) {
                    html.addClass(td, fieldMeta['class']);
                }
                var radio = query('input', td)[0];
                if (fieldMeta.radio && fieldMeta.radio === "row") {
                    radio.name = this._name + this._rowIndex;
                } else {
                    radio.name = this._name + fieldMeta.name;
                }

                radio.checked = fieldData === true;
                return td;
            },

            _createCheckboxTd: function(tr, fieldMeta, fieldData) {
                var tdStr = '<td class="checkbox-td ' + fieldMeta.name + '"><input type="checkbox" /></td>';
                var td = html.toDom(tdStr);
                html.addClass(td, 'simple-table-cell');
                html.place(td, tr);
                if (fieldMeta['class']) {
                    html.addClass(td, fieldMeta['class']);
                }
                var checkbox = query('input', td)[0];
                checkbox.checked = fieldData === true;
                return td;
            },

            _createActionsTd: function(tr, fieldMeta) {
                var tdStr = '<td class="actions-td">' +
                    '<div class="action-item-parent jimu-float-leading"></div></td>';
                var td = html.toDom(tdStr);
                html.addClass(td, 'simple-table-cell');
                var actionItemParent = query(".action-item-parent", td)[0];
                html.place(td, tr);
                if (fieldMeta['class']) {
                    html.addClass(td, fieldMeta['class']);
                }

                array.forEach(fieldMeta.actions, lang.hitch(this, function(item) {
                    if (item === 'up') {
                        var moveupDiv = html.create('div', {
                            'class': 'action-item jimu-float-leading row-up-div jimu-icon jimu-icon-up'
                        }, actionItemParent);
                        moveupDiv.title = "Move up";
                        this.own(on(moveupDiv, 'click', lang.hitch(this, function(event) {
                            event.stopPropagation();

                            if (!this.onBeforeRowUp(tr)) {
                                return;
                            }
                            var trs = query('.simple-table-row', this.tbody);
                            var index = array.indexOf(trs, tr);
                            if (index > 0) {
                                var newIndex = index - 1;
                                var trRef = trs[newIndex];
                                if (trRef) {
                                    html.place(tr, trRef, 'before');
                                    this._updateUI();
                                    this.emit('row-up', tr);
                                }
                            }
                        })));
                    } else if (item === 'down') {
                        var movedownDiv = html.create('div', {
                            'class': 'action-item jimu-float-leading row-down-div jimu-icon jimu-icon-down'
                        }, actionItemParent);
                        movedownDiv.title = "Move down";
                        this.own(on(movedownDiv, 'click', lang.hitch(this, function(event) {
                            event.stopPropagation();

                            if (!this.onBeforeRowDown(tr)) {
                                return;
                            }
                            var trs = query('.simple-table-row', this.tbody);
                            var index = array.indexOf(trs, tr);
                            if (index < trs.length - 1) {
                                var newIndex = index + 1;
                                var trRef = trs[newIndex];
                                if (trRef) {
                                    html.place(tr, trRef, 'after');
                                    this._updateUI();
                                    this.emit('row-down', tr);
                                }
                            }
                        })));
                    } else if (item === 'load') {
                        var loadDiv = html.create('div', {
                            'class': 'action-item jimu-float-leading row-load-div jimu-icon jimu-icon-load'
                        }, actionItemParent);
                        loadDiv.title = "Load Map";
                        this.own(on(loadDiv, 'click', lang.hitch(this, function(event) {
                            event.stopPropagation();

                            this._onActionsLoad(tr);
                        })));
                    } else if (item === 'download') {
                        var loadDiv = html.create('div', {
                            'class': 'action-item jimu-float-leading row-load-div jimu-icon jimu-icon-download'
                        }, actionItemParent);
                        loadDiv.title = "Download Map";
                        this.own(on(loadDiv, 'click', lang.hitch(this, function(event) {
                            event.stopPropagation();

                            this._onActionsDownload(tr);
                        })));
                    } else if (item === 'edit') {
                        var editDiv = html.create('div', {
                            'class': 'action-item jimu-float-leading row-edit-div jimu-icon jimu-icon-edit'
                        }, actionItemParent);
                        editDiv.title = "Edit";
                        this.own(on(editDiv, 'click', lang.hitch(this, function(event) {
                            event.stopPropagation();

                            if (!this.onBeforeRowEdit(tr)) {
                                return;
                            }
                            this._onActionsEdit(tr);
                        })));
                    } else if (item === 'delete') {
                        var deleteDiv = html.create('div', {
                            'class': 'action-item jimu-float-leading row-delete-div jimu-icon jimu-icon-delete'
                        }, actionItemParent);
                        deleteDiv.title = "Delete";
                        this.own(on(deleteDiv, 'click', lang.hitch(this, function(event) {
                            event.stopPropagation();

                            if (!this.onBeforeRowDelete(tr)) {
                                return;
                            }
                            this.deleteRow(tr);
                        })));
                    }
                }));
                var width = this._calculateActionsWidth(fieldMeta) + 'px';
                html.setStyle(actionItemParent, 'width', width);
                return td;
            },

            _calculateActionsWidth: function(fieldMeta) {
                var items = array.map(fieldMeta.actions, function(item) {
                    return item === 'load' || item === 'up' || item === 'down' || item === 'edit' || item === 'delete' || item === 'download';
                });
                return items.length * 30;
            },

            _createEmptyTd: function(tr, fieldMeta) {
                var td = html.create('td', {
                    'class': fieldMeta.name
                }, tr);
                html.addClass(td, 'simple-table-cell');
                html.addClass(td, 'empty-text-td');
                if (fieldMeta['class']) {
                    html.addClass(td, fieldMeta['class']);
                }
                return td;
            },

            _createExtensionTd: function(tr, fieldMeta, fieldData) {
                var td = html.create('td', {
                    'class': fieldMeta.name
                }, tr);
                html.addClass(td, 'simple-table-cell');
                html.addClass(td, 'extension-td');
                if (fieldMeta['class']) {
                    html.addClass(td, fieldMeta['class']);
                }
                if (fieldMeta.create && typeof fieldMeta.create === 'function') {
                    fieldMeta.create(td);
                }
                if (fieldMeta.setValue && typeof fieldMeta.setValue === 'function') {
                    fieldMeta.setValue(td, fieldData);
                }
                return td;
            },

            editRow: function(tr, rowData) {
                var result = {
                    success: false,
                    tr: null,
                    errorCode: null,
                    errorMessage: null,
                    repeatFields: null
                };
                if (!this.fields || (typeof rowData !== 'object')) {
                    return result;
                }
                if (!html.isDescendant(tr, this.tbody)) {
                    return result;
                }
                var allFieldMetas = lang.mixin([], this.fields);
                var uniqueFieldMetas = array.filter(allFieldMetas, lang.hitch(this, function(item) {
                    return item.type === 'text' && item.unique === true;
                }));

                var repeatFieldMetas = array.filter(uniqueFieldMetas, lang.hitch(this, function(item) {
                    var sameValueRows = this.getRowDataArrayByFieldValue(item.name, rowData[item.name], tr);
                    return sameValueRows.length > 0;
                }));

                if (repeatFieldMetas.length > 0) {
                    result.errorCode = this.REPEATING_ERROR;
                    result.errorMessage = "repeating data";
                    result.repeatFields = repeatFieldMetas;
                    return result;
                }
                var tds = query('.simple-table-cell', tr);
                array.forEach(this.fields, lang.hitch(this, function(fieldMeta, idx) {
                    if (!rowData.hasOwnProperty(fieldMeta.name)) {
                        return;
                    }
                    var td = tds[idx];
                    var fieldData = rowData[fieldMeta.name];
                    var type = fieldMeta.type;
                    if (type === 'text') {
                        if (fieldMeta.editable) {
                            this._editEditableText(td, fieldMeta, fieldData);
                        } else {
                            this._editNormalText(td, fieldMeta, fieldData);
                        }
                    } else if (type === 'radio') {
                        this._editRadio(td, fieldMeta, fieldData);
                    } else if (type === 'checkbox') {
                        this._editCheckbox(td, fieldMeta, fieldData);
                    } else if (type === 'extension') {
                        this._editExtension(td, fieldMeta, fieldData);
                    }
                }));
                result.success = true;
                result.tr = tr;
                result.errorMessage = null;
                this._onEditRow(tr);
                return result;
            },

            _editNormalText: function(td, fieldMeta, fieldData) {
                /*jshint unused: false*/
                var normalTextDiv = query('div', td)[0];
                normalTextDiv.innerHTML = fieldData || "";
                normalTextDiv.title = normalTextDiv.innerHTML;
            },

            _editEditableText: function(td, fieldMeta, fieldData) {
                /*jshint unused: false*/
                var editableDiv = query('div', td)[0];
                editableDiv.innerHTML = fieldData || "";
                var editableInput = query('input', td)[0];
                editableInput.value = editableDiv.innerHTML;
            },

            _editRadio: function(td, fieldMeta, fieldData) {
                /*jshint unused: false*/
                var radio = query('input', td)[0];
                radio.checked = fieldData === true;
            },

            _editCheckbox: function(td, fieldMeta, fieldData) {
                /*jshint unused: false*/
                var checkbox = query('input', td)[0];
                checkbox.checked = fieldData === true;
            },

            _editExtension: function(td, fieldMeta, fieldData) {
                if (fieldMeta.setValue && typeof fieldMeta.setValue === 'function') {
                    fieldMeta.setValue(td, fieldData);
                }
            },

            _getAllRows: function() {
                return query('.simple-table-row', this.tbody);
            },

            _getNotEmptyRows: function() {
                var trs = this._getAllRows();
                return array.filter(trs, lang.hitch(this, function(tr) {
                    return !html.hasClass(tr, 'empty');
                }));
            },

            _getEmptyRows: function() {
                var trs = this._getAllRows();
                return array.filter(trs, lang.hitch(this, function(tr) {
                    return html.hasClass(tr, 'empty');
                }));
            },

            getRows: function() {
                return this._getNotEmptyRows();
            },

            getSelectedRow: function() {
                var result = null;
                var trs = query('.simple-table-row', this.tbody);
                var filterTrs = array.filter(trs, lang.hitch(this, function(tr) {
                    return !html.hasClass(tr, 'empty') && html.hasClass(tr, 'jimu-state-active');
                }));
                if (filterTrs.length > 0) {
                    result = filterTrs[0];
                }
                return result;
            },

            getSelectedRowData: function() {
                var result = null;
                var tr = this.getSelectedRow();
                if (tr) {
                    result = this._getRowDataByTr(tr);
                }
                return result;
            },

            getData: function( /*optional*/ ignoredTr) {
                var trs = this._getNotEmptyRows();
                if (ignoredTr) {
                    trs = array.filter(trs, lang.hitch(this, function(tr) {
                        return tr !== ignoredTr;
                    }));
                }
                var result = array.map(trs, lang.hitch(this, function(tr) {
                    return this._getRowDataByTr(tr);
                }));
                return result;
            },

            getRowData: function(tr) {
                return this._getRowDataByTr(tr);
            },

            _getRowDataByTr: function(tr) {
                var rowData = null;
                if (tr) {
                    rowData = {};
                } else {
                    return null;
                }
                array.forEach(this.fields, lang.hitch(this, function(fieldMeta) {
                    var type = fieldMeta.type;
                    if (type === 'actions') {
                        return;
                    }
                    var name = fieldMeta.name;
                    rowData[name] = null;
                    var td = query('.' + name, tr)[0];
                    if (td) {
                        if (type === 'text') {
                            if (fieldMeta.editable) {
                                var editableDiv = query('div', td)[0];
                                rowData[name] = editableDiv.innerHTML;
                            } else {
                                var normalTextDiv = query('div', td)[0];
                                rowData[name] = normalTextDiv.innerHTML;
                            }
                        } else if (type === 'radio') {
                            var radio = query('input', td)[0];
                            rowData[name] = radio.checked;
                        } else if (type === 'checkbox') {
                            var checkbox = query('input', td)[0];
                            rowData[name] = checkbox.checked;
                        } else if (type === 'extension') {
                            if (fieldMeta.getValue && typeof fieldMeta.getValue === 'function') {
                                rowData[name] = fieldMeta.getValue(td, fieldMeta);
                            }
                        }
                    }
                }));
                return rowData;
            },

            getRowDataArrayByFieldValue: function(fieldName, fieldValue, /*optional*/ ignoredTr) {
                var result = [];
                if (!this.fields) {
                    return [];
                }
                var validField = array.some(this.fields, lang.hitch(this, function(item) {
                    return item.name === fieldName;
                }));
                if (!validField) {
                    return [];
                }
                var rows = this.getData(ignoredTr);
                result = array.filter(rows, lang.hitch(this, function(row) {
                    /* jshint eqeqeq: false*/
                    return row[fieldName] == fieldValue;
                }));
                return result;
            },

            /**
             * return all the data items from the table
             */
            getItems: function() {
                var trs = [],
                    result = [];

                trs = this._getNotEmptyRows();

                var result = array.map(trs, lang.hitch(this, function(tr) {
                    return tr.item;
                }));
                return result;
            },

            /**
             * set edit mode on all cells in given row - except for action cell
             * @param {TableRow} tr table row dom node
             */
            _setEditModeOnRow: function(tr) {
                var tds = query('.simple-table-cell', tr);
                array.forEach(tds, lang.hitch(this, function(td, idx) {
                    if (html.hasClass(td, "actions")) {
                        // skip actions
                        return;
                    }
                    this._setEditModeOnCell(td);
                }));
            },

            /**
             * enable Edit Mode on the given cell
             * @param {TableCell} td table cell dom node
             */
            _setEditModeOnCell: function(td) {

                var editableDiv = query('div', td)[0];
                var editableInput = query('input', td)[0];
                editableInput.value = editableDiv.innerHTML;
                html.setStyle(editableDiv, 'display', 'none');
                html.setStyle(editableInput, 'display', 'inline');
                editableInput.focus();
            },

            _onClickRow: function(tr) {
                this.emit('row-click', tr);
            },

            _onDblClickRow: function(tr) {
                var args = {
                    element: tr,
                    item: tr.item
                };
                this.emit('row-dblclick', args);
            },

            _onSelectRow: function(tr) {
                this.emit('row-select', tr);
            },

            _onAddRow: function(tr) {
                this.emit('row-add', tr);
            },

            _onEditRow: function(tr) {
                this.emit('row-edit', tr);
            },

            _onDeleteRow: function(tr) {
                var args = {
                    element: tr,
                    item: tr.item
                };
                this.emit('row-delete', args);
            },

            _onEnterRow: function(tr) {
                this.emit('row-enter', tr);
            },

            _onClearRows: function(trs) {
                this.emit('rows-clear', trs);
            },

            _onActionsEdit: function(tr) {
                this.emit('actions-edit', tr);

                this._setEditModeOnRow(tr);
            },

            _onActionsLoad: function(tr) {
                var args = {
                    element: tr,
                    item: tr.item
                };
                this.emit('actions-load', args);
            },

            _onActionsDownload: function(tr) {
                var args = {
                    element: tr,
                    item: tr.item
                };
                this.emit('actions-download', args);
            },

            onBeforeRowUp: function(tr) {
                /*jshint unused : false*/
                return true;
            },

            onBeforeRowDown: function(tr) {
                /*jshint unused : false*/
                return true;
            },

            onBeforeRowEdit: function(tr) {
                /*jshint unused : false*/
                return true;
            },

            onBeforeRowDelete: function(tr) {
                /*jshint unused : false*/
                return true;
            }
        });
        return SaveSessions;
    });