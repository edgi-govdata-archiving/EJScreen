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
        "dojo/text!mapdijit/templates/IDinfoWindowEJ.html",
        "esri/geometry/support/webMercatorUtils",
        "esri/geometry/geometryEngine",
        "esri/layers/GraphicsLayer",
        "esri/layers/FeatureLayer",
        "esri/Graphic",
        "esri/PopupTemplate",
        "https://pedp-ejscreen.azurewebsites.net/mapdijit/EJinfoWindow.js"
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
        webMercatorUtils,
        geometryEngine,
        GraphicsLayer,
        FeatureLayer,
        Graphic,
        PopupTemplate,
        EJinfoWindow
    ) {       

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
        var IDinfoWindowEJ = declare([_WidgetBase, _TemplatedMixin], {
            templateString: dijittemplate,

            constructor: function(options) {
                this.mapview = options.view;
                this.idgraphic = options.idgraphic;
                this.templateEJcurrent = options.templateEJcurrent; //pass in template vs creating in the widget

                

            },

            startup: function() {
                this.inherited(arguments);

            },
            postCreate: function() {
                var feat = this.idgraphic;
                var templatestr = "";



                   
                
                // for (var prop in feat.attributes) {
                   
                //     var fldvalue = feat.attributes[prop];
                //     var proplabel = prop;
                //     //if feature has layer info try to get alias for the field instead of default field name

                //      //built in fieldInfos template setting doesn't work since the id function overrides the popup content so 'content' is not used
                //      //ideally would have id popup somehow still use content string and use the fieldinfos from the API, manually setting decimals instead
                //      //this won't work since not using 'content':
                //     //if (suggestservices[sugid].fieldInfos) infoTemplate.fieldInfos = suggestservices[sugid].fieldInfos;
                //     //infoTemplate.fieldInfos = [{fieldName:'PCT_BROADBAND',format:{places:3}}];
                //     if (feat.layer){

                //     	//get fieldInfos from config if set
                //     	var lyrcfgnm = feat.layer.id.replace("_map","");
                //     	if (suggestservicesFieldDecimalPlacesNAMES[lyrcfgnm]){
                //     		var fldInf = suggestservicesFieldDecimalPlacesNAMES[lyrcfgnm];
                //     		if (prop in fldInf){
                //     			var decs = fldInf[prop];
                //     			if (fldvalue != 0){
                //     				fldvalue = fldvalue.toFixed(decs);
                //     			}
                //     		} 

                //     	}

                //         var fldObj = feat.layer.fieldsIndex.get(prop);

                //         if (fldObj) {                                            
                    	 
                //             var al = fldObj.alias;                    
                //         	if (al) {
                //             	proplabel = al;
                //         	}
                //         }
                // 	} else {
                //     //not a feature layer, look up by alias. Map layer passes in aliases only
                //     //currently cannot get layer name, look for any alias in alias object list
                //             if (prop in suggestservicesFieldDecimalPlacesALIASES){
                //                 var decs = suggestservicesFieldDecimalPlacesALIASES[prop];
                //                 if (fldvalue != 0){
                //                     //when not feature layer number are string, convert back to number before set decimals
                //                     fldvalue = parseFloat(fldvalue).toFixed(decs);

                //                 }
                //             } 
                //     }


           
                   

                //     var httpreg = /^https?:/i;
                //     if (httpreg.test(fldvalue)) {
                //         templatestr += proplabel + ": <a href='" + fldvalue + "' target=_blank>More info</a></br>";
                //     } else if ((prop.toLowerCase().indexOf("shape") != 0) && (prop.toLowerCase().indexOf("objectid") != 0)) {
                //         templatestr += proplabel + ": " + fldvalue + "</br>";
                //     }
                // }

                //use pregenerated string from query for the template
                templatestr = this.templateEJcurrent;

              
                if (templatestr == "") {
                    this.idinfoNode.style.display = "none";
                } else {
                    this.idinfoNode.style.display = "block";
                    this.idinfoNode.innerHTML = templatestr;
                     
                    //console.log("templatestr");
                    //console.log(templatestr);
                }

                var showConvertBtn = true; //disabling generate report button for now
                //if territory, do not show report button and show message
                //Guam, Virgin Islands, American Samoa, Mariana Islands - no report
                var terrAry = ["GU","VI","AS","MP"];
                if (terrAry.includes(feat.attributes["ST_ABBREV"])){
                	showConvertBtn = false;
                }            

                


                // if (feat.geometry.type == "polygon") {
                //     if (feat.geometry.rings.length > 1) {
                //         showConvertBtn = false;
                //     } else {
                //         var geom = feat.geometry;
                //         if (geom.spatialReference.wkid == "102100") geom = webMercatorUtils.webMercatorToGeographic(feat.geometry);
                //         var polyarea = geometryEngine.geodesicArea(geom, "square-miles");

                //         if (polyarea > arealimit) {
                //             //alert("The defined area is too large for analysis. Please change the project area or buffer distance.");
                //             showConvertBtn = false;
                //         } else {
                //             showConvertBtn = true;
                //         }
                //     }
                // }
                if (showConvertBtn) {
                    this.idbtnNode.disabled = false;
                    this.idnoteNode.style.display = "none";
                    this.idbtnNode.style.color = "#000";
                } else {
                    this.idbtnNode.disabled = true;
                    this.idnoteNode.style.display = "block";
                    //make the button text appear disabled as well
                    this.idbtnNode.style.color = "#999";
                }

                // //start test for graphic first draw
                // //draw poly on create vs button click
                // //this.mapview.popup.close();
                // var feature = this.idgraphic;
                // var defaultradius = 1;
                // switch (feature.geometry.type) {
                //     case "point":
                //         symbol = pointsym;
                //         break;
                //     case "polygon":
                //         defaultradius = 0;
                //         symbol = polysym;
                //         break;
                //     case "polyline":
                //         symbol = linesym;
                //         break;
                // }

                // var mgeometry = feature.geometry;
                // var graphic = new Graphic(mgeometry);
                // var gcounter = 0;
                // var layerid = "Project" + gcounter;
                // do {
                //     gcounter = gcounter + 1;
                //     layerid = "Project" + gcounter;
                // } while ((this.mapview.map.findLayerById(layerid) != null))

                // //graphic.attributes = { "id": gcounter, "gtype": graphic.geometry.type, "radius": defaultradius.toString(), "unit": "miles", "ptitle": "" };
                // //graphic.attributes = { "id": gcounter, "gtype": "blockgroup", "radius": defaultradius.toString(), "unit": "miles", "ptitle": "" };
                // var dlayer = new FeatureLayer({
                //     id: layerid,
                //     source: [graphic],
                //     title: "Project " + gcounter,
                //     objectIdField: "id",
                //     outFields: ['*'],
                //     fields: [{
                //             name: "id",
                //             type: "oid"
                //         },
                //         {
                //             name: "gtype",
                //             type: "string"
                //         },

                //         {
                //             name: "radius",
                //             type: "string"
                //         },
                //         {
                //             name: "unit",
                //             type: "string"
                //         },
                //         {
                //             name: "ptitle",
                //             type: "string"
                //         }
                //     ],
                //     popupTemplate: {
                //         title: "Chart or Report",
                //         content: lang.hitch(this, this.drawDesc)
                //     },
                //     renderer: {
                //         type: "simple",
                //         symbol: symbol
                //     }
                // });
                // dlayer.layerType = "digitize";
                // this.view.map.add(dlayer);
                // //start test for graphic first draw

            },

            _convertGraphic: function() {
                this.mapview.popup.close();
                var feature = this.idgraphic;
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
                } while ((this.mapview.map.findLayerById(layerid) != null))
                //graphic.attributes = { "id": gcounter, "gtype": graphic.geometry.type, "radius": defaultradius.toString(), "unit": "miles", "ptitle": "" };
                graphic.attributes = { "id": gcounter, "gtype": "blockgroup", "radius": defaultradius.toString(), "unit": "miles", "ptitle": "","fips":feature.attributes["ID"],"names":feature.attributes["ID"]};
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
                    },
                    renderer: {
                        type: "simple",
                        symbol: symbol
                    }
                });
                dlayer.layerType = "digitize";
                this.view.map.add(dlayer);

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


            },
            drawDesc: function(e) {
                if (dijit.registry.byId("infowg")) {
                    dijit.byId("infowg").destroy();
                    dijit.registry.remove("infowg");

                }
                //alert(igraphic.attributes["descinfo"]);
                var infowidget = new EJinfoWindow({
                    view: this.mapview,
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

        return IDinfoWindowEJ;

    });