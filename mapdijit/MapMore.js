define(

    ['dojo',
        'dojo/_base/declare',
        "dojo/_base/lang",
        "dojo/on",
        "dojo/dom-construct",
        "dojo/dom-style",
        'dijit/_Widget',
        'dijit/_Templated',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dojo/Evented',
        "dijit/form/Form",
        "dijit/form/RadioButton", "dijit/form/DropDownButton", "dijit/form/Button", "dijit/form/TextBox", "dijit/form/ComboBox", "dijit/form/FilteringSelect",
        "dojox/layout/FloatingPane",
        "dojo/text!mapdijit/templates/MapMore.html",
        "esri/config",
        "esri/request",
        "esri/layers/MapImageLayer",
        "esri/layers/TileLayer",
        "esri/layers/FeatureLayer",
		"esri/layers/ImageryLayer",
        "esri/layers/GraphicsLayer",
        "esri/layers/GeoRSSLayer",
        "esri/layers/KMLLayer",
        "esri/layers/WMSLayer",
        "esri/PopupTemplate"
    ],
    function(
        dojo,
        declare,
        lang,
        on,
        domConstruct,
        domStyle,
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
        esriRequest,
        MapImageLayer,
        TileLayer,
        FeatureLayer,
		ImageryLayer,
        GraphicsLayer,
        GeoRSSLayer,
        KMLLayer,
        WMSLayer,
        PopupTemplate
    ) {



        var MapMore = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

            templateString: dijittemplate,

            widgetsInTemplate: true,
            constructor: function(options, srcRefNode) {
                options = options || {};
                if (!options.view) {
                    console.log("mapdijit.MapMore: unable to find the 'view' property in parameters");
                    return;
                }
                this.mapview = options.view;
                // mixin constructor options 
                dojo.safeMixin(this, options);



            },

            startup: function() {},
            postCreate: function() {
                for (var slayer in serviceJSON_SBS) {
                    var sdesc = serviceJSON_SBS[slayer].description;
                    var stype = serviceJSON_SBS[slayer].type;
                    var myOpt1 = document.createElement("option");
                    myOpt1.value = slayer;
                    myOpt1.text = sdesc;
                    this.svcNode.appendChild(myOpt1);
                } 

                this.sortSelect(this.svcNode);

         
                var svc = this.svcNode.value;
                //this.populateLayers(svc,serviceJSON_SBS);
                this._getLayersParam(svc);
                

                //this.adjustPopupSize();
            },

            _addLyr: function() {
                var map = this.mapview.map;
                var svcid = this.svcNode.value;
                var stype = serviceJSON_SBS[svcid].type;
                var stitle = serviceJSON_SBS[svcid].description;
                var lyropacity = serviceJSON_SBS[svcid].transparency;
                var srender;
                var moremapid = "more_map";
                var labid = mapsJson[this.mapview.id].labelid;
                var mapids = ["demog_map", "ejindex_map", "other_map", "more_map","threshold_map"];

                for (var i = 0; i < mapids.length; i++) {
                    if (map.findLayerById(mapids[i])) {
                        map.remove(map.findLayerById(mapids[i]));
                    }
                }
                if (stype == "featurelayer" || this.lyrNode.value==="dwatersvcareas" || this.lyrNode.value==="ejairtoxics") {
                    this.mapview.popup.defaultPopupTemplateEnabled = true;
                    var surl = serviceJSON_SBS[svcid].layerurl;
					if(svcid==="otherenv"){ //handled separately as its a separate JSON
                      
                        if (this.lyrNode.value==="dwatersvcareas" || this.lyrNode.value==="ejairtoxics" ){ //sub option selected value 
                        stitle = otherEnvironmentalDataJSON[this.lyrNode.value].description;
                        surl = otherEnvironmentalDataJSON[this.lyrNode.value].layerurl;
                        lyropacity = otherEnvironmentalDataJSON[this.lyrNode.value].transparency;
                        }
                   }
                    if(svcid==="publichousing"){ //handled separately as its a separate JSON
                      
                        if (this.lyrNode.value==="phouse" || this.lyrNode.value==="shouse" ){ //sub option selected value 
                        stitle = publicHousingJSON[this.lyrNode.value].description;
                        surl = publicHousingJSON[this.lyrNode.value].layerurl;
                        //lyropacity = publicHousingJSON[this.lyrNode.value].transparency;
                        lyropacity = 1;
                        }
                   }
                   if(svcid==="colonias"){ //handled separately as its a separate JSON
                      
                        if (this.lyrNode.value==="coloniashud" || this.lyrNode.value==="coloniastx" || this.lyrNode.value==="coloniasnm" ){ //sub option selected value 
                        stitle = coloniasJSON[this.lyrNode.value].description;
                        surl = coloniasJSON[this.lyrNode.value].layerurl;
                        //lyropacity = coloniasJSON[this.lyrNode.value].transparency;
                        lyropacity = 1;
                        }
                   }
                   if(svcid==="tribalcat"){ //handled separately as its a separate JSON
                      //if cessesion handle as featurelayer, else handle as dynamic
                        //if (this.lyrNode.value==="tribe" || this.lyrNode.value==="cession" || this.lyrNode.value==="indig" ){ //sub option selected value 
                        if (this.lyrNode.value==="cession"){
                        stitle = tribalJSON[this.lyrNode.value].description;
                        surl = tribalJSON[this.lyrNode.value].layerurl;
                        } else {
                            var lyrid = this.lyrNode.value;
                            var lyrdesc = this.lyrNode.options[this.lyrNode.selectedIndex].text;
                            var trans =  tribalJSON[this.lyrNode.value].transparency;
                    var svcurl = tribalJSON[this.lyrNode.value].layerurl + tribalJSON[this.lyrNode.value].service + "/MapServer";
                    var sublayerid = lyrid; //set sublayer id to layerid by default, overwrite if has sublayers next step
                    
                   
                    
                        var templayer = new MapImageLayer({
                            url: svcurl,
                            id: moremapid,
                            title: stitle,
                           // opacity: trans,    
                           opacity:1,                      
                            //sublayers: [{
                            //   id: sublayerid, 
                            //    visible: true
                            //}]
                        });
                        map.add(templayer);

                        //templayer.on("layerview-create", function(e) {
                        dojo.byId(labid).innerHTML = stitle + " -- " + lyrdesc;
                        //});

                     



                    dojo.byId("theme").style.display = "none";
                        }
                   }
                    var infoTemplate = new PopupTemplate();
                    infoTemplate.title = stitle;
                    infoTemplate.content = "{*}";
                    var templayer = new FeatureLayer(surl, {
                        mode: FeatureLayer.MODE_ONDEMAND,
                        id: moremapid,
                        title: stitle,
                        //opacity: lyropacity,  
                        opacity:1,
                        //popupTemplate: infoTemplate,
                        outFields: ["*"]
                    });
                    map.add(templayer);

                    templayer.on("layerview-create", function(e) {
                        dojo.byId(labid).innerHTML = stitle;
                    });
                    dojo.byId("theme").style.display = "none";

                } else if (stype == "portallayer") {
                    //new 2/9/23 - add portal item support
                    var surl = serviceJSON_SBS[svcid].layerurl;
                    
                    //var infoTemplate = new PopupTemplate();
                    //infoTemplate.title = stitle;
                    //infoTemplate.content = "{*}";
                    // var templayer = new FeatureLayer(surl, {
                    //     mode: FeatureLayer.MODE_ONDEMAND,
                    //     id: moremapid,
                    //     title: stitle,
                    //     popupTemplate: infoTemplate,
                    //     outFields: ["*"]
                    // });
                    var templayer = new FeatureLayer({
          portalItem: {
            // autocasts as new PortalItem()
            //id: "f95344889cab44bd84207052f44cb940",
           id: surl     
            
          },
          //add all outfields to get geometry from selectedfeature
          outFields: ["*"],
          title: stitle,
          id: moremapid
          //layerId: 0
        });

                    map.add(templayer);

                    templayer.on("layerview-create", function(e) {
                        dojo.byId(labid).innerHTML = stitle;
                    });
                    dojo.byId("theme").style.display = "none";

                } else {
                    var lyrid = this.lyrNode.value;
                    var lyrdesc = this.lyrNode.options[this.lyrNode.selectedIndex].text;
                    var trans = serviceJSON_SBS[svcid].transparency;
                    var svcurl = serviceJSON_SBS[svcid].layerurl + serviceJSON_SBS[svcid].service + "/MapServer";
                    var sublayerid = lyrid; //set sublayer id to layerid by default, overwrite if has sublayers next step
                   
                              
				if(lyrid==="ejrsei" || lyrid==="ejnonatt" || lyrid==="ejwater" || lyrid==="waterwells" || lyrid==="pfacilities" || lyrid==="ejwater" || lyrid==="epagrants" || lyrid==="ejgrants")// Other environmental 
                    {
                        
                        trans = otherEnvironmentalDataJSON[lyrid].transparency;
                        svcurl = otherEnvironmentalDataJSON[lyrid].layerurl+otherEnvironmentalDataJSON[lyrid].service+"/MapServer";
                        sublayerid = this.lyrSubNode.value; //if other environmental, use sublayer id
                          
                    }
                    if(lyrid==="pschool" || lyrid==="phospital" || lyrid==="pworship" )//community landmarks
                    {
                        
                        trans = communityLandmarksJSON[lyrid].transparency;
                        var urlVals = this.splitURL(communityLandmarksJSON[lyrid].layerurl)
                        svcurl = urlVals.returnUrl ;
                        sublayerid = urlVals.id; 
                    }

                 
                      if(svcid === "climateservices"){
                            if(lyrid==="floodplain"){
                                svcurl = climateServices_SBS[lyrid].layerurl + climateServices_SBS[lyrid].service + "/ImageServer";
                                trans = climateServices_SBS[lyrid].transperancy;
                            }else if(lyrid==="noaa"){
                                 var sublyrKey = this.lyrSubNode.options[this.lyrSubNode.selectedIndex].id
                                 svcurl =  noaaJSONData.noaa.services[sublyrKey].layerurl;
                             	 stitle = noaaJSONData.noaa.services[sublyrKey].title;		
                                  trans = noaaJSONData.noaa.services[sublyrKey].transperancy;
							 }else if( lyrid === "heatindex"){
									stitle = climateServices_SBS[this.lyrNode.value].description;
									surl = climateServices_SBS[this.lyrNode.value].layerurl;
                                    trans = climateServices_SBS[lyrid].transperancy;
                            }else{
                                svcurl = climateServices_SBS[lyrid].layerurl + climateServices_SBS[lyrid].service + "/MapServer";
                                trans = climateServices_SBS[lyrid].transperancy;
                            }
                            if(lyrid=="firerisk" || lyrid=="floodrisk"){
                                sublayerid = this.lyrSubNode.value
                            }
                            trans = climateServices_SBS[lyrid].transparency;
                            stype= climateServices_SBS[lyrid].type
                            //sublayerid = this.lyrSubNode.value;
                        }
                   
                    
                    if (lyrid==="phouse" || lyrid==="shouse" || lyrid === "prison" || lyrid === "heatindex" || lyrid == "padusowner"){ //sub option selected value 
                       this.mapview.popup.defaultPopupTemplateEnabled = true;
					   if (lyrid === "prison" || lyrid == "padusowner"){
                            stitle = communityLandmarksJSON[this.lyrNode.value].description;
                            surl = communityLandmarksJSON[this.lyrNode.value].layerurl;
                            trans = communityLandmarksJSON[this.lyrNode.value].transperancy;
                        }else if( lyrid === "heatindex"){
									stitle = climateServices_SBS[this.lyrNode.value].description;
									surl = climateServices_SBS[this.lyrNode.value].layerurl;
                                    srender = climateServices_SBS[this.lyrNode.value].renderer;
                                    trans = climateServices_SBS[this.lyrNode.value].transperancy;
                            }else{
                            stitle = publicHousingJSON[this.lyrNode.value].description;
                            surl = publicHousingJSON[this.lyrNode.value].layerurl;
                            trans = publicHousingJSON[this.lyrNode.value].transperancy;
                        }
                    
                        var infoTemplate = new PopupTemplate();
                        infoTemplate.title = stitle;
                        infoTemplate.content = "{*}";
                        var templayer = new FeatureLayer(surl, {
                            mode: FeatureLayer.MODE_ONDEMAND,
                            id: moremapid,
                            title: stitle,
                            //opacity : trans,
                            opacity:1,
                            //popupTemplate: infoTemplate,
                            outFields: ["*"]
                        });
                        if (srender){	
                            templayer.renderer = srender;		
                        }
                        map.add(templayer);

                        templayer.on("layerview-create", function(e) {
                            dojo.byId(labid).innerHTML = stitle;
                        });
                        dojo.byId("theme").style.display = "none";
                    } 
                    if (stype == "agsdynamic" && !(this.lyrNode.value==="phouse" || this.lyrNode.value==="shouse"|| this.lyrNode.value==="prison"  || this.lyrNode.value==='floodplain' ) ) {
                        var templayer = new MapImageLayer({
                            url: svcurl,
                            id: moremapid,
                            title: stitle,
                           // opacity: trans,
                            opacity: 1,
                            sublayers: [{
                                id: sublayerid, 
                                visible: true
                            }]
                        });
                        map.add(templayer);

                        //templayer.on("layerview-create", function(e) {
                        dojo.byId(labid).innerHTML = stitle + " -- " + lyrdesc;
                        //});

                    } else if (stype == "agstile") {
                        var templayer = new TileLayer({
                            url: svcurl,
                            id: moremapid,
                            title: stitle,
                           // opacity: trans
                           opacity: 1
                        });
                        map.add(templayer);

                        dojo.byId(labid).innerHTML = stitle + " -- " + lyrdesc;
                    }else if (stype == "agsimagery") {
                        var templayer = new ImageryLayer({
                            url: svcurl,
                            legendEnabled: true,
                            format: "jpgpng",
                            id: moremapid,
                            title: stitle,
                           // opacity: trans
                           opacity: 1
                        });
                        templayer.layerType = "addon";
                        map.add(templayer);

                        dojo.byId(labid).innerHTML = stitle + " -- " + lyrdesc;
                    }




                    dojo.byId("theme").style.display = "none";
                }
            },

             splitURL: function(url) {
                const lastIndex = url.lastIndexOf('/');
              
                // If '/' is not found or it's at the end, there's no numeric ID
                if (lastIndex === -1 || lastIndex === url.length - 1) {
                  return {
                    returnUrl: url,
                    id: null
                  };
                }
              
                const returnUrl = url.substring(0, lastIndex);
                const id = url.substring(lastIndex + 1);
                //const id = isNaN(parseInt(idPart, 10)) ? null : parseInt(idPart, 10);
              
                return {
                   returnUrl,
                   id
                };
              },
            errorHandler: function(err) {
                alert("error occurred: " + err.message);
            },

            adjustPopupSize: function() {
                var box = dojo.contentBox(this.mapview.container);

                var width = 270,
                    height = 300;
                // defaults
                var newWidth = Math.round(box.w * 0.60);
                var newHeight = Math.round(box.h * 0.45);
                if (newWidth < width) {
                    width = newWidth;
                }

                if (newHeight < height) {
                    height = newHeight;
                }


            },
            _getLayers: function(e) {
                this.lyrNode.options.length = 0;
                var svc = e.target.value;              
                //edit dom element by dojo attache points instead of by ID to get unique control in each widget in the page
                dojo.empty(this.lyrSubNode);
                domStyle.set(this.lyrSubNode, "display", "none");
                domStyle.set(this.lyrSubNodeSpan, "display", "none");



                if ((serviceJSON_SBS[svc].type == "featurelayer" || serviceJSON_SBS[svc].type == "agsimagery" || serviceJSON_SBS[svc].type == "portallayer" ) && svc != "otherenv" && svc != "publichousing" && svc != "colonias" && svc != "tribalcat"  && svc != "communitylandmarks") {
                    var myOpt1 = document.createElement("option");
                    var layername = serviceJSON_SBS[svc].description;
                    myOpt1.value = svc;
                    myOpt1.text = layername;
                    this.lyrNode.appendChild(myOpt1);
                   
                 } else if(svc=== "otherenv"){
                    for(let subsvc in otherEnvironmentalDataJSON) {       
                        var myOpt1 = document.createElement("option");
                        var layername = otherEnvironmentalDataJSON[subsvc].description;
                        myOpt1.value = subsvc;
                        myOpt1.text =  otherEnvironmentalDataJSON[subsvc].description;
                        this.lyrNode.appendChild(myOpt1);                     
                    } 
                   this.populateSubLayers(this.lyrNode.value,otherEnvironmentalDataJSON);
                  
                   domStyle.set(this.lyrSubNode, "display", "block"); 
                   domStyle.set(this.lyrSubNodeSpan, "display", "block");                    

                 } else if (svc === "publichousing"){
                    for(let subsvc in publicHousingJSON) {       
                        var myOpt1 = document.createElement("option");
                        var layername = publicHousingJSON[subsvc].description;
                        myOpt1.value = subsvc;
                        myOpt1.text =  publicHousingJSON[subsvc].description;
                        this.lyrNode.appendChild(myOpt1);
                   }
              
                 } else if (svc === "colonias"){
                    for(let subsvc in coloniasJSON) {       
                        var myOpt1 = document.createElement("option");
                        var layername = coloniasJSON[subsvc].description;
                        myOpt1.value = subsvc;
                        myOpt1.text =  coloniasJSON[subsvc].description;
                        this.lyrNode.appendChild(myOpt1);
                   }
              
                 } 
                 else if (svc === "tribalcat"){
                    for(let subsvc in tribalJSON) {       
                        var myOpt1 = document.createElement("option");
                        var layername = tribalJSON[subsvc].description;
                        myOpt1.value = subsvc;
                        myOpt1.text =  tribalJSON[subsvc].description;
                        this.lyrNode.appendChild(myOpt1);
                   }
              
                 }
                 else if (svc === "communitylandmarks"){
                    for(let subsvc in communityLandmarksJSON) {       
                        var myOpt1 = document.createElement("option");
                        var layername = communityLandmarksJSON[subsvc].description;
                        myOpt1.value = subsvc;
                        myOpt1.text =  communityLandmarksJSON[subsvc].description;
                        this.lyrNode.appendChild(myOpt1);
                   }
              
                 } else if (svc === "climateservices"){
                    for(let subsvc in climateServices_SBS) {       
                        var myOpt1 = document.createElement("option");
                        var layername = climateServices_SBS[subsvc].description;
                        myOpt1.value = subsvc;
                        myOpt1.text =  climateServices_SBS[subsvc].description;
                        this.lyrNode.appendChild(myOpt1);
						// if(this.lyrNode.value === "noaa"){
							 // this.populateSubLayers(subsvc,noaaJSON);                  
                             // domStyle.set(this.lyrSubNode, "display", "block"); 
                            // domStyle.set(this.lyrSubNodeSpan, "display", "block"); 
						// }
                   }
				   if(this.lyrNode.value!="noaa"){
					   this.populateSubLayers(this.lyrNode.value,climateServices_SBS);                 
					   domStyle.set(this.lyrSubNode, "display", "block"); 
					   domStyle.set(this.lyrSubNodeSpan, "display", "block");  
				   }
              
                 }

                 
                else {
                      this.populateLayers(svc,serviceJSON_SBS);
                }
            },
            _getLayersParam: function(svc) {
                //parameterized getLayer to pass in svc vs event
                this.lyrNode.options.length = 0;
                //var svc = e.target.value;              
                //edit dom element by dojo attache points instead of by ID to get unique control in each widget in the page
                dojo.empty(this.lyrSubNode);
                domStyle.set(this.lyrSubNode, "display", "none");
                domStyle.set(this.lyrSubNodeSpan, "display", "none");



                if ((serviceJSON_SBS[svc].type == "featurelayer" || serviceJSON_SBS[svc].type == "agsimagery" || serviceJSON_SBS[svc].type == "portallayer") && svc != "otherenv" && svc != "publichousing" && svc != "colonias" && svc != "tribalcat" && svc != "communitylandmarks") {
                    var myOpt1 = document.createElement("option");
                    var layername = serviceJSON_SBS[svc].description;
                    myOpt1.value = svc;
                    myOpt1.text = layername;
                    this.lyrNode.appendChild(myOpt1);
                   
                 } else if(svc=== "otherenv"){
                    for(let subsvc in otherEnvironmentalDataJSON) {       
                        var myOpt1 = document.createElement("option");
                        var layername = otherEnvironmentalDataJSON[subsvc].description;
                        myOpt1.value = subsvc;
                        myOpt1.text =  otherEnvironmentalDataJSON[subsvc].description;
                        this.lyrNode.appendChild(myOpt1);                     
                    } 
                   this.populateSubLayers(this.lyrNode.value,otherEnvironmentalDataJSON);
                  
                   domStyle.set(this.lyrSubNode, "display", "block"); 
                   domStyle.set(this.lyrSubNodeSpan, "display", "block");                    

                 } else if (svc === "publichousing"){
                    for(let subsvc in publicHousingJSON) {       
                        var myOpt1 = document.createElement("option");
                        var layername = publicHousingJSON[subsvc].description;
                        myOpt1.value = subsvc;
                        myOpt1.text =  publicHousingJSON[subsvc].description;
                        this.lyrNode.appendChild(myOpt1);
                   }
              
                 } else if (svc === "colonias"){
                    for(let subsvc in coloniasJSON) {       
                        var myOpt1 = document.createElement("option");
                        var layername = coloniasJSON[subsvc].description;
                        myOpt1.value = subsvc;
                        myOpt1.text =  coloniasJSON[subsvc].description;
                        this.lyrNode.appendChild(myOpt1);
                   }
              
                 } 
                 else if (svc === "tribalcat"){
                    for(let subsvc in tribalJSON) {       
                        var myOpt1 = document.createElement("option");
                        var layername = tribalJSON[subsvc].description;
                        myOpt1.value = subsvc;
                        myOpt1.text =  tribalJSON[subsvc].description;
                        this.lyrNode.appendChild(myOpt1);
                   }
              
                 }else if (svc === "communitylandmarks"){
                    for(let subsvc in communityLandmarksJSON) {       
                        var myOpt1 = document.createElement("option");
                        var layername = communityLandmarksJSON[subsvc].description;
                        myOpt1.value = subsvc;
                        myOpt1.text =  communityLandmarksJSON[subsvc].description;
                        this.lyrNode.appendChild(myOpt1);
                   }
              
                 }

                 
                else {
                      this.populateLayers(svc,serviceJSON_SBS);
                }
            },


            _getSubLayers: function(e) {
               dojo.empty(this.lyrSubNode);
               //console.log(this.lyrNode.value);
               domStyle.set(this.lyrSubNode, "display", "none");
               domStyle.set(this.lyrSubNodeSpan, "display", "none");
               //only pop sub layers if one of the other env layers - fix added 11-15-2022 RW
               if (otherEnvironmentalDataJSON.hasOwnProperty(this.lyrNode.value)){
                this.populateSubLayers(this.lyrNode.value,otherEnvironmentalDataJSON);
                if(this.lyrNode.value === "privatewells" || this.lyrNode.value ==="pfacilities" || this.lyrNode.value ==="ejwater" ){
                    domStyle.set(this.lyrSubNode, "display", "block"); 
                    domStyle.set(this.lyrSubNodeSpan, "display", "block");    
                }
               }
              /* if(this.lyrNode.value === "padusowner"){
                    if (communityLandmarksJSON.hasOwnProperty(this.lyrNode.value)){
                      this.populateSubLayers(this.lyrNode.value,communityLandmarksJSON);
                      domStyle.set(this.lyrSubNode, "display", "block"); 
                      domStyle.set(this.lyrSubNodeSpan, "display", "block");    
                    }
                }*/
				 if (climateServices_SBS.hasOwnProperty(this.lyrNode.value)){
					 var wobj = this;
                    if(this.lyrNode.value !== "floodplain" && this.lyrNode.value!== "noaa" && this.lyrNode.value !== "heatindex"){				
							this.populateSubLayers(this.lyrNode.value,climateServices_SBS);							
							domStyle.set(this.lyrSubNode, "display", "block"); 
							domStyle.set(this.lyrSubNodeSpan, "display", "block"); 
                    }   else {
						        if(this.lyrNode.value === "noaa"){
                                
									// for (var key in noaaJSON) {
										// if (noaaJSON.hasOwnProperty(key)) {
											// var item = noaaJSON[key];
											// // Here you can perform actions on each item
											 // this.populateSubLayers(key,noaaJSON);					
                                             // domStyle.set(this.lyrSubNode, "display", "block"); 
                                             // domStyle.set(this.lyrSubNodeSpan, "display", "block");
											// // Add more actions as needed
										  // }
                                        // }
										var noaaOptions = noaaJSONData[this.lyrNode.value].services;
										 Object.keys(noaaOptions).forEach(function(key) {
											var myOpt1 = document.createElement("option");
											myOpt1.text = noaaOptions[key].title;
											myOpt1.id = key;
											//dropdown.add(option);
											 wobj.lyrSubNode.appendChild(myOpt1);
											
										});
										 domStyle.set(this.lyrSubNode, "display", "block"); 
											 domStyle.set(this.lyrSubNodeSpan, "display", "block");
										
								}
                             
					}
                  }
				  
				

            },

           
            populateLayers: function(sname,otherJson) {
                var surl = otherJson[sname].layerurl;
                var svcname = otherJson[sname].service;
                var isDynamic = otherJson[sname].dynamic;
                var mapurl = surl + svcname + "/MapServer";

                var wobj = this;
                esriRequest(mapurl, {
                    query: { f: "json" },
                    responseType: "json",
                    callbackParamName: "callback"
                }).then(function(r) {
                    var data = r.data;
                    //alert(r.id + "--" + r.name + "; " + r.minScale + ", " + r.maxScale);
                    var slayers = data.layers;

                    for (var i = 0; i < slayers.length; i++) {
                        var lobj = slayers[i];
                        var layerid = lobj.id;
                        var layername = lobj.name;
                        var pid = lobj.parentLayerId;
                        if (pid == -1) {
                            var showlayer = true;
                            //if (!(isDynamic)) {
                            if (otherJson[sname].listlayer) {
                             //   var onlayers = sname==="otherenv"? otherEnvironmentalDataJSON[sname].listlayer:serviceJSON_SBS[sname].listlayer;
                             var onlayers = otherJson[sname].listlayer; 
                             showlayer = wobj.forDisplay(onlayers, layerid);
                            }
                            if (showlayer) {
                                var myOpt1 = document.createElement("option");
                                myOpt1.value = layerid;
                                //if indigenous, get the title from our config used for dynamic layer
                                if (sname == "indig"){
                                    for (let i = 0; i < indigSubLayers.length; i++) {
                                        if (indigSubLayers[i].id == layerid) {
                                            layername = indigSubLayers[i].title;
                                        }                                     
                                    }
                                }
                                myOpt1.text = layername;
                                wobj.lyrNode.appendChild(myOpt1);
                            }
                        }
                    }
                }).catch(function(e) {
                    alert("error occurred on getting layer info:" + e.message);
                });
            },

            populateSubLayers: function(sname,otherJson) {
                var surl = otherJson[sname].layerurl;
                var svcname = otherJson[sname].service;
                var isDynamic = otherJson[sname].dynamic;
                var mapurl = surl + svcname + "/MapServer";
                if(sname==="dwatersvcareas" || sname=== "ejairtoxics"){
					mapurl = surl;
				}
                var wobj = this;
                esriRequest(mapurl, {
                    query: { f: "json" },
                    responseType: "json",
                    callbackParamName: "callback"
                }).then(function(r) {
                    var data = r.data;
                    //alert(r.id + "--" + r.name + "; " + r.minScale + ", " + r.maxScale);
                    var slayers = data.layers;
					if(sname === "ejwater"){
						slayers = slayers.sort((a, b) => a.name.localeCompare(b.name));
					}
				if(slayers  != undefined ){
                    for (var i = 0; i < slayers.length; i++) {
                        var lobj = slayers[i];
                        var layerid = lobj.id;
                        var layername = lobj.name;
                        var pid = lobj.parentLayerId;
                        if (pid == -1) {
                            var showlayer = true;
                            if (!(isDynamic)) {
                             //   var onlayers = sname==="otherenv"? otherEnvironmentalDataJSON[sname].listlayer:serviceJSON_SBS[sname].listlayer;
                             var onlayers = otherJson[sname].listlayer; 
                             showlayer = wobj.forDisplay(onlayers, layerid);
                            }
                            if (showlayer) {
                                var myOpt1 = document.createElement("option");
                                myOpt1.value = layerid;
								// if(otherJson[sname].service === "usslr2" || otherJson[sname].service === "usslr3" ||otherJson[sname].service === "usslr4" ||otherJson[sname].service === "usslr5" || otherJson[sname].service === "usslr6"){
								    // myOpt1.value = layerid;
								// }else{
                                  // myOpt1.value = otherJson[sname].service +"_"+layerid;
								// }
								 myOpt1.text =  layername;
                                wobj.lyrSubNode.appendChild(myOpt1);
                            }
                        }
                    }
				}
                }).catch(function(e) {
                    alert("error occurred on getting layer info:" + e.message);
                });
            },
            forDisplay: function(dislayers, lid) {
                for (var m = 0; m < dislayers.length; m++) {
                    if (lid == dislayers[m]) return true;
                }
                return false;

            },
            destroy: function() {

                //this.Render.destroy();
                dojo.empty(this.domNode);
                this.inherited(arguments);
            },
            sortSelect(selElem) {
               
                var tmpAry = new Array();
                for (var i=0;i<selElem.options.length;i++) {
                    tmpAry[i] = new Array();
                    tmpAry[i][0] = selElem.options[i].text;
                    tmpAry[i][1] = selElem.options[i].value;
                }
                tmpAry.sort();
                while (selElem.options.length > 0) {
                    selElem.options[0] = null;
                }
                for (var i=0;i<tmpAry.length;i++) {
                    var op = new Option(tmpAry[i][0], tmpAry[i][1]);
                    selElem.options[i] = op;
                }       
                }
        });
        return MapMore;
    });


