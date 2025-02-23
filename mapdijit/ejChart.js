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
    'dojo/text!mapdijit/templates/ejChart.html',
    "dojox/layout/FloatingPane",
    './mapdijit/EJinfoWindow.js',
    "./mapdijit/IDinfoWindowFips.js",
    'esri/widgets/Sketch/SketchViewModel',
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "esri/geometry/SpatialReference",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/layers/FeatureLayer",
    "esri/geometry/Point",
    "esri/PopupTemplate",
    "esri/widgets/Search",
    "dojo/dnd/move",
	"dojo/domReady!",
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
    FloatingPane,
    EJinfoWindow,
    IDinfoWindowFips,
    SketchViewModel,
    QueryTask,
    Query,
    SpatialReference,
    Graphic,
    GraphicsLayer,
    FeatureLayer,
    Point,
    PopupTemplate,
    Search,
    move) {
    var path_location = location.pathname.replace(/\/[^/]*$/, '')
    var a = dojo.create("link", { 
        type: "text/css", 
        rel: "stylesheet", 
        href: path_location + '/mapdijit/css/draw.css'
    });
        // href: "http://localhost:8000/mapdijit/css/draw.css" 

    dojo.doc.getElementsByTagName("head")[0].appendChild(a);
   
    // var pointsym = { // symbol used for points
    //     type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
    //     style: "cross",
    //     color: "rgba(255, 0, 255, 1.0)",
    //     size: "12px",
    //     outline: { // autocasts as new SimpleLineSymbol()
    //         color: "rgba(255, 0, 255, 1.0)",
    //         width: 1 // points
    //     }
    // };
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
    ParentConstrainedFloatingPane = declare(FloatingPane, {
        postCreate: function () {
            this.inherited(arguments);
            this.moveable = new move.parentConstrainedMoveable(this.domNode, {
                handle: this.focusNode,
                area: "content",
                within: true,
            });
        },
    });
    var ejChart = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: dijittemplate,
        widgetsInTemplate: true,

        constructor: function(options, srcRefNode) {

            options = options || {};
            if (!options.view) throw new Error("no map defined in params for EJ site.");

            this.mapview = options.view;

            this.ctype = "draw";
            this.activeDrawTool = "";

            this.idconnect = null;

            this.gcounter = 0;
            // mixin constructor options 
            dojo.safeMixin(this, options);


        },

        startup: function() {



        },
        postCreate: function() {



            var myobj = this;
            if (myobj.mapview.map.findLayerById("digitizelayer")) {
                myobj.tempGraphicsLayer = myobj.mapview.map.findLayerById("digitizelayer");
            } else {
                myobj.tempGraphicsLayer = new GraphicsLayer({ id: "digitizelayer", title: "digitize graphics" });
                myobj.mapview.map.add(myobj.tempGraphicsLayer);
            }
            this.sketchViewModel = new SketchViewModel({
                view: myobj.mapview,
                layer: myobj.tempGraphicsLayer,
                pointSymbol: pointsym,
                polylineSymbol: linesym,
                polygonSymbol: polysym,
                updateOnGraphicClick: false
            });

            this.sketchViewModel.on("create", function(event) {

                if (event.state === "complete") {
                    var g = event.graphic;

                    var gtype = g.geometry.type;
                    myobj.tempGraphicsLayer.removeAll();
                    myobj._addtomap(g, gtype);
                }
            });




            this.locator = new Search({
                suggestionsEnabled: false,
                popupEnabled: false,
                resultGraphicEnabled: false,
                view: myobj.mapview
            }, "");

            //this.locator.startup();
            this.locator.on("search-complete", lang.hitch(this, this.showResults));
        },
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
                case "point":
                    //this.eraseAll();
                    symbol = pointsym;
                    defaultradius = 1;
                    break;
                case "polyline":
                   // this.eraseAll();
                    symbol = linesym;
                    defaultradius = 1;
                    break;
                case "polygon":
                   // this.eraseAll();
                    symbol = polysym;
                    defaultradius = 0;
                    break;
                case "rectangle":

                    symbol = polysym;
                    defaultradius = 0;
                    break;
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
                case "county":
                     symbol = polysym;
                    defaultradius = 0;
                    flddefine.push({ name: "fips", type: "string" });
                    break;
                case "city":
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
            if ((gtype == "blockgroup") || (gtype == "tract") || (gtype == "county")||(gtype == "city")) {
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
        openinit: function() {
            this.ctype = "draw";
            this.setaction(true);
            this.startpoint();

        },
        closePane: function() {
            if (this.idconnect != null) {
                this.idconnect.remove();
                this.idconnect = null;
            }

            this.clearResult();
        },
        openpopup: function(){
 
            var existingWidget = dijit.byId("floater1");
            if(existingWidget){
                existingWidget.show();;
            }else{
                var pandiv = domConstruct.create("div", {
                    id: "floater1",
                    innerHTML: "<div id='bgtractDiv'></div>",
                });
        
                document.body.appendChild(pandiv);
                var fp = new ParentConstrainedFloatingPane(
                    {
                        title: "Search by Blockgroup or Tract",
                        resizable: true,
                        dockable: false,
                        closable: true,
                        style:
                        // "position:absolute;top:140px;left:150px;width:300px;height:200px;z-index:100;",
                        "position:absolute;top:90px;left:50px;width:300px;height:150px;z-index:100;",
                        id: "floater1",
                    },
                    dojo.byId("floater1")
                );
                fp.startup();
                fp.show();
           
            //fp.close = toggleMeasure;
    
                var infowidget = new IDinfoWindowFips(
                    {
                        view: view,
                        id: "popup",
                    },
                    "bgtractDiv"
                );
        
                infowidget.startup();
                //this.attachSubmitListener();
            // fp.set("visibility", "visible"); 
                return infowidget.domNode;
            }
        },
      
      
  
        switchtype: function(e) {
            var typevalue = e.target.value;
            //this.ctype= e.target.id;
           // this.eraseAll();
            switch(e.target.id){
                case "blockgroupDiv":
                      this.ctype= "blockgroup";                
                      break;
                case "tractDiv":
                       this.ctype="tract" ;
                       break;
                /* case "cityDiv":
                        this.ctype="city" ;
                        break; */
                 case "countyDiv":
                        this.ctype="county" ;
                        break;
                 case "fipsDiv":
                        this.ctype="fips" ;
                        this.openpopup();
                        break;

                 default:
                       this.ctype= typevalue;

            }
            // $(".divSubBtn").removeClass("highlight");
            // $(e.target).addClass("highlight")
			
			 // $(".divSubBtn").removeClass("highlight");
            // $(e.target).addClass("highlight")
			       
            if(e.currentTarget.id === "selectMultipleDiv"){
                //if(!$(e.currentTarget).hasClass("highlight")){
                 if( !$(e.currentTarget).hasClass("highlight")){
                    $("#selectMultipleDiv").removeClass("highlight");
                    $("#selectMultipleDiv .dijitButtonText").css("color", "black");
                  }else{
                    $(e.currentTarget).addClass("highlight");
                    $(".divSubBtn").not("#selectMultipleDiv").removeClass("highlight");
                    $("#selectMultipleDiv .dijitButtonText").css("color", "white");
                  }
                 // $("#kgeofloater").show();
                  $("#floater1").hide();
                 
            }else if (e.currentTarget.id === "fipsDiv"){
                if( $(e.currentTarget).hasClass("highlight")){
                    $("#fipsDiv").removeClass("highlight");
                    $("#floater1").hide();
                  }else{
                    $(e.currentTarget).addClass("highlight");
                    $("#floater1").show();
                    $(".divSubBtn").not("#fipsDiv","#selectMultipleDiv").removeClass("highlight");
                    $("#selectMultipleDiv").removeClass("highlight");
                    $("#selectMultipleDiv .dijitButtonText").css("color", "black");
                    $("#kgeofloater").hide();
                  }
            }else{
                 //$(".divSubBtn").removeClass("highlight");
                 $(".divSubBtn").not("#selectMultipleDiv").removeClass("highlight");
                 $("#selectMultipleDiv").removeClass("highlight");
                 $("#selectMultipleDiv .dijitButtonText").css("color", "black");
                 $(e.target).addClass("highlight");
                 $("#kgeofloater").hide();
                 if(e.currentTarget.id!= "fipsDiv" ){
                    $("#floater1").hide();
                 }

            }
            //this.ctype= (e.target.id ==="bgDiv"?"bg":typevalue);
            this.setaction(false);
            //erase all other selections when a new type is clicked
            this.eraseAll();
            

        },
        setaction: function(s) {
            if (s) {
                var radioObj = document.getElementsByName("charttype");
                var rl = radioObj.length;
                for (var k = 0; k < rl; k++) {
                    if (radioObj[k].value == this.ctype) {
                        radioObj[k].checked = true;

                    }
                }
            }
            if (this.idconnect != null) {
                this.idconnect.remove();
                this.idconnect = null;
            }
            if (this.ctype.toLowerCase() != "draw") this.clearResult();
            if ((this.ctype.toLowerCase() == "blockgroup") || (this.ctype.toLowerCase() == "tract") || (this.ctype.toLowerCase() == "county")||(this.ctype.toLowerCase() == "city")) {
                this.idconnect = this.mapview.on("click", lang.hitch(this, this._selectBG));
            }else if((this.ctype.toLowerCase() == "fips")){
               // this.ctype = "blockgroup";
                //this.idconnect = this.mapview.on("click", lang.hitch(this, this._selectBGTract('410670317033')));
                
               // this._selectBGTract('410670317033');
            }

        },
         idDesc :function(e) {
            // var infowidget = new IDinfoWindowFips({
            //     view: view,
            //     idgraphic: e.graphic,
            // }, dojo.create('div'));
            // infowidget.startup();
    
            // return infowidget.domNode;
           
    
        },
        changeRadio: function(e) {
            var fieldname = e.target.name;
            if (fieldname == "bgidtext") {
                this.ctype = "enterbg";
            } else if (fieldname == "loctext") {
                this.ctype = "find";
            }
            this.setaction(true);

        },
        _pressbox: function(e) {
            if (e.keyCode == 13) {
                var fieldname = e.target.name;
                if (fieldname == "bgidtext") {
                    this.searchbgbyid();
                } else if (fieldname == "loctext") {
                    this.searchbgbyloc();
                }
            }
        },
        searchbgbyid: function() {
            this.ctype = "enterbg";
            this.setaction(true);
           // var bgid = document.getElementById("siteform").bgidtext.value;
            var bgid = document.getElementById('fipsValue').value
            bgid = dojo.trim(bgid);
            var bgpattern = /^\d{12}$/;

            if (bgpattern.test(bgid)) {
                /* if (this.checkBGexist(bgid)) {
                    return false;
                } else { */
                var dirty = (new Date()).getTime();
                var wherestr = bgIDfieldname + " = '" + bgid + "' AND " + dirty + "=" + dirty;
                var query = new Query();
                query.returnGeometry = true;
                query.outFields = [bgIDfieldname];
                query.where = wherestr;
                query.outSpatialReference = this.mapview.spatialReference;
                query.geometryPrecision = 1;
                this.queryBG(query, true);
                //}
            } else {
                alert("Invalid block group ID. Block group ID must be a 12-digit number.");
            }
        },
        searchbgbyloc: function() {
            this.ctype = "find";
            this.setaction(true);
            var locvalue = document.getElementById("siteform").loctext.value;
            locvalue = dojo.trim(locvalue);
            if (locvalue.length == 0) {
                alert("Please enter search value.");
            } else {

                var llPattern = /^-?\d{1,2}(\.\d+|), {0,}-?\d{1,3}(\.\d+|)$/;

                if (llPattern.test(locvalue)) {


                    var lat = locvalue.split(",")[0];
                    var lon = locvalue.split(",")[1];

                    var pntgeom = new Point({ longitude: parseFloat(lon), latitude: parseFloat(lat) });
                    var g = new Graphic(pntgeom);
                    this._addtomap(g, pntgeom.type);
                    this.mapview.goTo(pntgeom);

                } else {
                    this.agsSearch(locvalue);
                }
            }
        },
        agsSearch: function(searchtext) {
            if (searchtext.length > 0) {
                var zipPattern = /^\d{5}$/;
                if (zipPattern.test(searchtext)) searchtext = searchtext + ", USA";

                this.locator.search(searchtext);


            } else {
                alert("Please enter search string!");
                return false;
            }
        },
        showResults: function(candidates) {
            try {

                var eachresult = candidates.results;
                if (eachresult.length > 0) {
                    var candidate = eachresult[0].results[0];

                    var mgeom = candidate.feature.geometry;

                    var graphic = new Graphic(mgeom);
                    this._addtomap(graphic, mgeom.type);
                } else {
                    alert("Did not find matched location.");
                }

            } catch (e) {
                alert(e.message);

            }
        },

        _selectBGTract: function(bgtractid){
            var myobj = this;
          
               // if (doID) {
                    var query = new Query();
                    query.returnGeometry = true;
                    query.outFields = [bgIDfieldname];
                    //query.geometry = evt.mapPoint;
                    query.geometryPrecision = 1;
                    query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
                    
                    var lvlObj = typelookup["blockgroup"];
                    
                    query.where = lvlObj.idfield + "='" + bgtractid + "'";
                    myobj.queryBG(query, false);
              //  }
          
        },

        _selectBG: function(evt) {
            //evt.stopPropagation();

            var myobj = this;
            this.mapview.hitTest(evt).then(function(response) {
                var doID = false;
                if (response.results.length) {
                    if (response.results[0].graphic.layer.type == "vector-tile") doID = true;
                } else if (response.results.length == 0) {
                    doID = true;
                }
                if (doID) {
                    var query = new Query();
                    query.returnGeometry = true;
                    query.outFields = [bgIDfieldname];
                    query.geometry = evt.mapPoint;
                    query.geometryPrecision = 1;
                    query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
                    myobj.queryBG(query, false);
                }
            });
        },

        queryBGTract: function(qpara, zoom) {
            var wobj = this;
             
            var bgurl; 
            var lvl = wobj.ctype.toLowerCase()
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
                    //   var graphic = new Graphic(feature.geometry, polysym);
                    // myobj.tempGraphicsLayer.add(graphic);
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
        queryBG: function(qpara, zoom) {
            var wobj = this;
             
            var bgurl; 
            var lvl = wobj.ctype.toLowerCase()
            //append layer id and set correct fields             
            //get url, index, and fields settings from config object
            var lvlObj = typelookup[lvl];
            if(lvlObj!= undefined){
            bgurl = lvlObj.url + "/" + lvlObj.layer;
            qpara.outFields = [lvlObj.idfield + "," + lvlObj.namefield];


            // switch (wobj.ctype.toLowerCase()) {
            //     case 'blockgroup':
            //          bgurl  = bgurlroot + "/0"; 
            //          qpara.outFields = ["STCNTRBG"];       
            //         break;
            //     case 'tr':  
            //          bgurl  = bgurlroot + "/1";
            //          qpara.outFields = ["STCNTR"]; 
            //          break;
            //     case 'cn':  
            //          bgurl  = bgurlroot + "/2";
            //          qpara.outFields = ["STCN"]; 
            //          break;
            //     case 'city':  
            //          bgurl  = "ejscreenservice";
            //          qpara.outFields = ["PLFIPS"]; 
            //          break;
            // }       



            var queryTask = new QueryTask({ url: bgurl });

            queryTask.execute(qpara).then(function(results) {
                
                if (results.features.length > 0) {

                    var feature = results.features[0];
                    if($("#menuId").parent().hasClass("active") && !$("#selectMultipleDiv").hasClass("highlight")){ 
                     wobj._addtomap(feature, lvl);
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


        startpoint: function() {
            this.setDrawTool("point");
            this.changeClass(this.pointNode);
        },
        startline: function() {
            this.setDrawTool("polyline");
            this.changeClass(this.lineNode);

        },
        startpoly: function() {
            this.setDrawTool("polygon");
            this.changeClass(this.polyNode);
        },
        startrect: function() {
            this.setDrawTool("rectangle");
            this.changeClass(this.rectNode);
        },
        changeClass: function(node) {
            this.clearButtons();
            node.className = node.id + "_click";
        },
        clearButtons: function() {
            this.pointNode.className = "pointTool";
            this.lineNode.className = "lineTool";
            this.polyNode.className = "polyTool";
           // this.rectNode.className = "boxTool";
        },
        clearResult: function() {
            this.clearButtons();
            this.sketchViewModel.cancel();


        },
        setDrawTool: function(d) {
            this.ctype = "draw";
            this.activeDrawTool = d;
            this.setaction(true);

            this.mapview.focus();
            this.sketchViewModel.create(d);

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
        destroy: function() {
            if (this.idconnect != null) {
                this.idconnect.remove();
                this.idconnect = null;
            }
            dojo.empty(this.domNode);

        },
        eraseAll: function()  {
        var removelayers = [];
        for (let i = 0; i < view.map.layers.length; i++) {
            var layer = view.map.layers.items[i];
            var layerid = layer.id;
            if (layer.type == "graphics") {
                layer.removeAll();
            } else if ((layer.type == "feature") && ((layer.layerType) && (layer.layerType == "digitize"))) {
                removelayers.push(layer);
            }
        }
        for (var m = 0; m < removelayers.length; m++) {
            view.map.remove(removelayers[m]);
        }
        view.popup.close();
        //dijit.byId('eraseButton').set('checked', false);

        ///dijit.byId('eraseButton').set('checked', false);
        //if (dijit.byId("kgeowg")) {
        //    dijit.byId("kgeowg").fipsNode.value = "";
        //    dijit.byId("kgeowg").hiddenfipsNode.innerHTML = "";
        //}
        drawlayerobj = {};

    }

    });
    return ejChart;

});