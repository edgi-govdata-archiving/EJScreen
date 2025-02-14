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
        "dojo/text!mapdijit/templates/IDinfoWindowFips.html",
        "esri/geometry/support/webMercatorUtils",
        "esri/geometry/geometryEngine",
        "esri/layers/GraphicsLayer",
        "esri/layers/FeatureLayer",
        "esri/Graphic",
        "esri/PopupTemplate",
        "esri/tasks/QueryTask",
       "esri/tasks/support/Query",
       "esri/geometry/SpatialReference",
        "esri/Graphic",
        "esri/layers/GraphicsLayer",
        "esri/layers/FeatureLayer",
        "esri/geometry/Point",
        "esri/PopupTemplate",
        './mapdijit/EJinfoWindow.js',

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
        QueryTask,
        Query,
        SpatialReference,
        Graphic,
        GraphicsLayer,
        FeatureLayer,
        Point,
        PopupTemplate,
        EJinfoWindow,
       
    ) {       

        var pointsym = { // symbol used for points
            type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
            //url: "images/redpin.png",
            url:"data:image/png;base64,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",
            width: "32px",
            height: "32px",
            yoffset: "15px"
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
        var IDinfoWindowFips = declare([_WidgetBase, _TemplatedMixin], {
            templateString: dijittemplate,

            constructor: function(options) {
                this.mapview = options.view;
                //this.idgraphic = options.idgraphic;
                

            },
           
            startup: function() {
                this.inherited(arguments);

            },
            postCreate: function() {
                this.inherited(arguments);
                //initialize
                var bgradio = dojo.byId('#bgradio');
                if (bgradio) {
                    bgradio.checked = true;
                }
                var textbox = dojo.byId('#fipsValue');
                if (textbox) {
                    textbox.value = ""; // Set the value to an empty string
                }
                dojo.byId('fipsId').textContent  ="Blockgroup ID:";

                var submitButton = dojo.byId("popupSubmitBtn");
                var myobj = this;
           // on(submitButton, "click", lang.hitch(this, function() {
               on(submitButton, "click", function(){
                // Perform the submission logic here
                console.log("Submit button clicked");
                
                // Example: validate FIPS input and show error if invalid
                // var fipsInput = dojo.byId("fipsValue");
                // var errSpan = dojo.byId("errSpan");
                // if(fipsInput.value === "") {
                //    // domStyle.set(errSpan, "display", "block");
                //     errSpan.innerHTML = "FIPS value cannot be empty";
                // } else {
                //   //  domStyle.set(errSpan, "display", "none");
                //     // Proceed with valid input
                // }


                var errSpan = dojo.byId("errSpan");
                errSpan.innerHTML = "";
                var options = document.getElementsByName("optiontype");
                var selectedOptionValue = "";
                for(var i = 0; i < options.length; i++) {
                    if(options[i].checked) {
                        selectedOptionValue = options[i].value;
                        break; // Stop the loop once the checked button is found
                    }
                }
                                //var selectedOption = this.domNode.querySelector('input[name="option"]:checked').value;
                var textBoxValue = dojo.byId("fipsValue").value;
				// Check if textBoxValue is null or undefined
				if (!textBoxValue || textBoxValue.trim() === "") {
                 errSpan.innerHTML = "Please enter a value";
                    return false;
                }
				textBoxValue = textBoxValue.trim();
				var noOfDigits = selectedOptionValue === "blockgroup" ? "12" : "11";
                var regex = selectedOptionValue === "blockgroup" ? (/^\d{12}$/) : (/^\d{11}$/);
    
                /*if (!textBoxValue) {
                    errSpan.innerHTML = "Please enter a value";
                    return false;
                }*/
                if (regex.test(textBoxValue)) {
                    view.popup.close();
                   // console.log("Selected Option:", selectedOption, "Text Box Value:", textBoxValue);
                   myobj.searchbgbyid(textBoxValue,selectedOptionValue);
                    return true;
                } else {
                    errSpan.innerHTML = "Please enter " + noOfDigits + " digits";
                    return false;
                }

            });
              
            },

            onfipschange: function(e) {
                var typevalue = e.target.value;
                
              
                 if(typevalue === "tract"){
                      dojo.byId('fipsId').textContent  ="Tract ID:";
                 }
                 else if(typevalue === "blockgroup"){
                    dojo.byId('fipsId').textContent  ="Blockgroup ID:";
                  }
             
            },

            searchbgbyid: function(textBoxValue,selectedOptionValue) {
                var myobj= this;
                //this.ctype = "enterbg";
               // myobj.setaction(true);
               // var bgid = document.getElementById("siteform").bgidtext.value;
                var bgid = textBoxValue;
                bgid = dojo.trim(bgid);
                //var bgpattern = /^\d{12}$/;
    
               // if (bgpattern.test(bgid)) {
                    /* if (this.checkBGexist(bgid)) {
                        return false;
                    } else { */
                    var dirty = (new Date()).getTime();
                    var wherestr="";
                     if(selectedOptionValue === "blockgroup"){
                      wherestr =  "STCNTRBG = '" + bgid + "' AND " + dirty + "=" + dirty;
                     }else{
                      wherestr =  "STCNTR = '" + bgid + "' AND " + dirty + "=" + dirty;
                     }
                     var query = new Query();
                    query.returnGeometry = true;
                    query.outFields = [bgIDfieldname];
                    query.where = wherestr;
                    query.outSpatialReference = this.mapview.spatialReference;
                    query.geometryPrecision = 1;
                    this.queryBG(query, true,selectedOptionValue);
                    //}
               // } else {
                //    alert("Invalid block group ID. Block group ID must be a 12-digit number.");
                //}
            },
            queryBG: function(qpara, zoom,selectedOptionValue) {
                var wobj = this;
                 
                var bgurl; 
                //var lvl = wobj.ctype.toLowerCase()
                var lvl =selectedOptionValue;
                //append layer id and set correct fields             
                //get url, index, and fields settings from config object
                var lvlObj = typelookup[lvl];
                if(lvlObj!= undefined){
                bgurl = lvlObj.url + "/" + lvlObj.layer;
                qpara.outFields = [lvlObj.idfield + "," + lvlObj.namefield];
    
    
    
                var queryTask = new QueryTask({ url: bgurl });
    
                queryTask.execute(qpara).then(function(results) {
                    
                    if (results.features.length > 0) {
    
                        var feature = results.features[0];
                        if($("#menuId").parent().hasClass("active") && !$("#selectMultipleDiv").hasClass("highlight")){ 
                         wobj._addtomap(feature, lvl);
                       
                         //close the popup
                        var pwidget = dijit.byId("popup");
                        if(pwidget){
                      
                          pwidget.closepane();
                           dijit.byId("floater1").hide();
                        }
                      
                        }
                       
                        if (zoom) wobj.mapview.extent = feature.geometry.extent;
    
                    } else {
                        alert("Invalid entry!");
                    }
    
                }).catch(
                    function(err) {
                        alert("error occurred when querying block group: " + err);
    
                    });
                
                  //  wobj.ctype="draw";
                }
            },
    
            // show: function() {
            //     // Example of how to show the widget programmatically
            //     domStyle.set(this.domNode, "display", "block");
            // },
    
            // hide: function() {
            //     // Example of how to hide the widget programmatically
            //     domStyle.set(this.domNode, "display", "none");
            // },

            _addtomap: function(grp, gtype) {

                var symbol, defaultradius;
                var flddefine = [{
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
                         name:"names",
                         type:"string"
    
                    }
                ];
               // this.eraseAll();
                switch (gtype) {
                   
                    case "blockgroup":
                        symbol = polysym;
                        defaultradius = 0;
                        flddefine.push({ name: "fips", type: "string" });
                        break;
                    case "tract":
                        symbol = polysym;
                        defaultradius = 0;
                        flddefine.push({ name: "fips", type: "string" });
                        break;
                    
                }
                var gcounter = 0;
    
                var layerid = "Project" + gcounter;
    
                do {
                    gcounter = gcounter + 1;
                    layerid = "Project" + gcounter;
                } while ((this.mapview.map.findLayerById(layerid) != null))
                if ((gtype == "blockgroup") || (gtype == "tract")) {
                    //var bgid = grp.attributes[bgIDfieldname];
                    var lvlObj = typelookup[gtype];                 
                    var bgid = grp.attributes[lvlObj.idfield];     
                    var namestr = grp.attributes[lvlObj.namefield];               
                    grp.attributes = { "id": gcounter, "gtype": gtype, "fips": bgid, "radius": defaultradius.toString(), "unit": "miles", "ptitle": "", "names": namestr };
                } else {
                    grp.attributes = { "id": gcounter, "gtype": gtype, "radius": defaultradius.toString(), "unit": "miles", "ptitle": "" };
                }
                drawlayerobj[layerid] = [grp];
                var dlayer = new FeatureLayer({
                    id: layerid,
                    source: [grp],
                    title: "Project " + gcounter,
                    objectIdField: "id",
                    outFields: ['*'],
                    fields: flddefine,
                    popupTemplate: {
                        title: "EJScreen Reports and Charts",
                        content: lang.hitch(this, this.SetDesc)
                    },
                    renderer: {
                        type: "simple",
                        symbol: symbol
                    }
                });
                dlayer.layerType = "digitize";
                this.mapview.map.add(dlayer);
    
                this._showInfoWin(grp);
                this.clearResult();
            },
            SetDesc: function(e) {
                if (dijit.registry.byId("infowg")) {
                    dijit.registry.remove("infowg");
    
                }
    
                var infowidget = new EJinfoWindow({
                    view: this.mapview,
                    inGraphic: e.graphic,
                    id: 'infowg'
                }, dojo.create('div'));
                infowidget.startup();
    
                return infowidget.domNode;
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
            clearResult: function() {
                this.clearButtons();
                //this.sketchViewModel.cancel();
             },
               clearButtons: function() {
           // this.pointNode.className = "pointTool";
           // this.lineNode.className = "lineTool";
           // this.polyNode.className = "polyTool";
           // this.rectNode.className = "boxTool";
        },
            // submitForm: function() {
            //     var errSpan = this.domNode.querySelector("#errSpan");
            //     errSpan.innerHTML = "";
            //     var selectedOption = this.domNode.querySelector('input[name="option"]:checked').value;
            //     var textBoxValue = this.domNode.querySelector('#fipsValue').value;
            //     var noOfDigits = selectedOption === "1" ? "12" : "11";
            //     var regex = selectedOption === "1" ? (/^\d{12}$/) : (/^\d{11}$/);
    
            //     if (!textBoxValue) {
            //         errSpan.innerHTML = "Please enter a value";
            //         return false;
            //     }
            //     if (regex.test(textBoxValue)) {
            //         view.popup.close();
            //         console.log("Selected Option:", selectedOption, "Text Box Value:", textBoxValue);
            //         return true;
            //     } else {
            //         errSpan.innerHTML = "Please enter exactly " + noOfDigits + " digits";
            //         return false;
            //     }
            // },
            destroy: function() {
                dojo.empty(this.domNode);
                this.inherited(arguments);
            },
            closepane: function() {
                if (this.activeWidget != null) {
                    this.activeWidget.destroy();
                    this.activeWidget = null;
                   
                }
            },
            
        });

        return IDinfoWindowFips;

    });