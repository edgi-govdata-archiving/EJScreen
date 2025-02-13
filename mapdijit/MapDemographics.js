define(

    [
        'dojo',
        'dojo/_base/declare',
        "dojo/_base/lang",
        "dojo/on",
        "dojo/dom-construct",

        'dijit/_Widget',
        'dijit/_Templated',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dojo/Evented',
        'dojox/gfx',
        'dojo/fx',
        'dojo/fx/Toggler',
        'dijit/form/Slider',
        "esri/core/watchUtils",
        "esri/layers/MapImageLayer",
        "esri/layers/FeatureLayer",
        "esri/widgets/Legend",
        "esri/tasks/QueryTask",
        "esri/tasks/support/Query",
        "esri/renderers/support/jsonUtils",
        "esri/symbols/SimpleFillSymbol",
        "esri/Color",
        "esri/smartMapping/renderers/color",
        "esri/smartMapping/symbology/color",
        'dijit/form/HorizontalSlider'

    ],
    function(dojo,
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
        gfx,
        coreFx,
        Toggler,
        Slider,
        watchUtils,
        MapImageLayer,
        FeatureLayer,
        esriLegend,
        QueryTask,
        esriquery,
        jsonUtils,
        SimpleFillSymbol,
        Color,
        colorRendererCreator,
        colorSchemes,
        HorizontalSlider
    ) {


        var a = dojo.create("link", { type: "text/css", rel: "stylesheet", href: "mapdijit/css/colorPicker.css" });
        dojo.doc.getElementsByTagName("head")[0].appendChild(a);
        var colorThemes = [{ "startcolor": "#D0CFEE", "endcolor": "#322C75" }
            //, { "startcolor": "#ca0020", "endcolor": "#578fd3" }
            , { "startcolor": "#ffccff", "endcolor": "#660066" }, { "startcolor": "#D0CFEE", "endcolor": "#322C75" }, { "startcolor": "#fef0d9", "endcolor": "#b30000" }, { "startcolor": "#FFFFD1", "endcolor": "#B0B080" }, { "startcolor": "#f2f0f7", "endcolor": "#54278f" }, { "startcolor": "#eff3ff", "endcolor": "#08519c" }, { "startcolor": "#f7f7f7", "endcolor": "#252525" }, { "startcolor": "#ccffff", "endcolor": "#006666" }, { "startcolor": "#ffffcc", "endcolor": "#006837" }, { "startcolor": "#ccccff", "endcolor": "#000066" }
        ];

        var MapDemographics = dojo.declare([dijit._Widget, dijit._Templated], {
            templateString: dojo.cache("mapdijit", "templates/RenderProperty.html"),
            widgetsInTemplate: true,
            constructor: function(options, srcRefNode) {
                // expected properties and values for the options argument:
                //"map": Javascript API Map object in the webmap that will be clicked
                //"selectLayerURL" : Layer URL for the layer that will be selected for feature input 
                //"title": Top line of text that appears in the widget,
                //"caption": Second line of text that appears in the widget that appears after tool runs
                // srcRefNode is the DOM node where the gauge will be created

                // start with no feature name

                options = options || {};
                if (!options.view) throw new Error("no map defined in params for Render.");
                this.view = options.view;
                this.map = this.view.map;


                this.catType = "";
                this.dfield = "";
                this._serviceWidgets = [];
                this.currentk = 2;
                this.reverseStatus = false;
                this.rendertype = "polygon";
                // mixin constructor options 

                //new vars to replace removed controls settings
                this.transValue = 0.5; //default transparency   
                //start and end color of default ramp            
                this.scolor = colorThemes[0].startcolor;
                this.ecolor = colorThemes[0].endcolor;
                //graduated point color and size range
                this.pointcolor = "#ffff00";
                this.pointsizemin = 4;
                this.pointsizemax = 16;
                //number of classbreaks
                this.classNum = "5";
                this.classType = "quantile";
               

                dojo.safeMixin(this, options);


            },

            startup: function() {
                //        var legendid = this.tocdivid;
                //        var _map = this.map;
                //        var dmgtoc = new mapdijit.demogTOC({
                //            map: _map,
                //            id: 'dmgtocwg'
                //        }, legendid);
                //        dmgtoc.startup();


            },
            postCreate: function() {
                /* this._zoomHandler = this.view.watch('zoom',function(newz,oldz,vtex,v) {
                    console.log(newz + ": " + oldz);
                }); */
                if (!this._zoomHandler) {
                    var obj = this;
                    this._zoomHandler = watchUtils.whenTrue(this.view, 'stationary', function(evt) {
                        obj._adjustToState();

                    });
                    //dojo.connect(this.map, "onZoomEnd", this, "_adjustToState");
                }
                var wobj = this;
                var m = 0;
                for (var t in demogJSON) {
                    var classname = "tab";
                    if (m == 0) {
                        classname = "tab activeTab";
                        this.dtype = t;
                       
                    }
                    dojo.create("a", {
                        href: "javascript:void(0);",
                        class: classname,
                        value: t,
                        onclick: function(e) {
                            var tvalue = e.target.value;
                            wobj.activateTab(this, tvalue);
                            //console.log(tvalue);
                        },
                        innerHTML: demogJSON[t].title
                    }, 'tabDiv');
                    m = m + 1;
                }
                //document.getElementById("tabDiv").innerHTML = liststr;
                $('#color1').colorPicker();
                $('#colorcircle').colorPicker();
                $('#selector').bind("click", function() {
                    var selectorOwner = $(this);
                    var tp = selectorOwner.offset().top + (selectorOwner.outerHeight());
                    var lt = selectorOwner.offset().left;
                    $("#colorlist").css("top", parseInt(tp) + "px");
                    $("#colorlist").css("left", parseInt(lt) + "px");
                    //alert($("#colorlist").html());
                    //             if ($.browser.msie) {
                    //                 $('#colorlist').css({ "visibility": "visible" });
                    //             }
                    //             alert($('#colorlist').css("display") + "; " + $('#colorlist').css("visibility"));
                    $("#colorlist").slideToggle("slow");
                });
                var currenttype = this.dtype;
                //this.classNumNode.value = "5";
                this.classNum = "5";
                //this.bWidthNode.value = "1";
                this.createCategory(currenttype);
                //this.drawPalette(this.classNumNode.value, this.currentk, this.reverseStatus);

            },
            _adjustToState: function() {
                var obj = this;
                var demoglayers = [];
                this.view.map.layers.map(function(lyr) {
                    if ((lyr.isDynamic) && (lyr.renderobj)) {
                        var robj = lyr.renderobj;
                        robj.layervisible = lyr.visible;
                        var orgactivelayer = robj.actlayer;
                        var fieldname = robj.fid;
                        var mapid = robj.mid;
                        var activelayer = obj.getActiveLayer(mapid, fieldname);
                        if (orgactivelayer != activelayer) {
                            //console.log("level changed: " + orgactivelayer + "; " + activelayer)
                            demoglayers.push(lyr);

                        }
                    }
                });
                for (var m = 0; m < demoglayers.length; m++) {
                    var robj = demoglayers[m].renderobj;
                    this.classbreak(robj);
                }

            },
            createCategory: function(key) {
                //this.catType = "";
                var wobj = this;
                wobj.dtype = key;
                var dgObj = demogJSON[key];
                //document.getElementById("descdiv").innerHTML = dgObj.description;

                if (dgObj.process) {
                    wobj.createCatList(key);
                    wobj.mapNode.disabled = false;
                } else {
                    wobj.mapNode.disabled = true;
                    var lookuptableurl = dgObj.layerurl + dgObj.service + "FeatureServer/" + dgObj.lookupindex;
                    //console.log(lookuptableurl);
                    var queryTask = new QueryTask(lookuptableurl);
                    var query = new esriquery();

                    query.returnGeometry = false;

                    query.outFields = ["*"];
                    var dirty = (new Date()).getTime();
                    query.where = "1=1 AND " + dirty + "=" + dirty;

                    //get features in order by cat and label
                    query.orderByFields = ["CATEGORY", "DESCRIPTION"];

                    var operation = queryTask.execute(query);
                    operation.then(function(featset) {
                        if (featset.features.length > 0) {
                            var fetcount = featset.features.length;
                            var catJson = {};
                            var layerJson = {};
                            var tableJson = {};
                            for (var m = 0; m < fetcount; m++) {
                                if (featset.features[m].attributes["FIELD_NAME"]){ //temporary fix until lookuptable can be updated

                                    var cat = dojo.trim(featset.features[m].attributes["CATEGORY"]);
                                    var colname = dojo.trim(featset.features[m].attributes["FIELD_NAME"]);
                                    var desc = dojo.trim(featset.features[m].attributes["DESCRIPTION"]);

                                    var bgmin = featset.features[m].attributes["BG_MIN"];
                                    var bgmax = featset.features[m].attributes["BG_MAX"];
                                    var bgmean = featset.features[m].attributes["BG_MEAN"];
                                    var bgstd = featset.features[m].attributes["BG_STD"];
                                    var trmin = featset.features[m].attributes["TR_MIN"];
                                    var trmax = featset.features[m].attributes["TR_MAX"];
                                    var trmean = featset.features[m].attributes["TR_MEAN"];
                                    var trstd = featset.features[m].attributes["TR_STD"];
                                    var cntymin = featset.features[m].attributes["CNTY_MIN"];
                                    var cntymax = featset.features[m].attributes["CNTY_MAX"];
                                    var cntymean = featset.features[m].attributes["CNTY_MEAN"];
                                    var cntystd = featset.features[m].attributes["CNTY_STD"];
                                    var stmin = featset.features[m].attributes["ST_MIN"];
                                    var stmax = featset.features[m].attributes["ST_MAX"];
                                    var stmean = featset.features[m].attributes["ST_MEAN"];
                                    var ststd = featset.features[m].attributes["ST_STD"];
                                    layerJson[colname] = {};
                                    layerJson[colname].description = desc;
                                    layerJson[colname].bg_min = bgmin;
                                    layerJson[colname].bg_max = bgmax;
                                    layerJson[colname].bg_mean = bgmean;
                                    layerJson[colname].bg_std = bgstd;
                                    layerJson[colname].tr_min = trmin;
                                    layerJson[colname].tr_max = trmax;
                                    layerJson[colname].tr_mean = trmean;
                                    layerJson[colname].tr_std = trstd;
                                    layerJson[colname].cnty_min = cntymin;
                                    layerJson[colname].cnty_max = cntymax;
                                    layerJson[colname].cnty_mean = cntymean;
                                    layerJson[colname].cnty_std = cntystd;
                                    layerJson[colname].st_min = stmin;
                                    layerJson[colname].st_max = stmax;
                                    layerJson[colname].st_mean = stmean;
                                    layerJson[colname].st_std = ststd;
                                    layerJson[colname].ranges = {};

                                    if (typeof featset.features[m].attributes["BLK_MIN"] != 'undefined') {
                                        var blkmin = featset.features[m].attributes["BLK_MIN"];
                                        var blkmax = featset.features[m].attributes["BLK_MAX"];
                                        var blkmean = featset.features[m].attributes["BLK_MEAN"];
                                        var blkstd = featset.features[m].attributes["BLK_STD"];
                                        layerJson[colname].blk_min = blkmin;
                                        layerJson[colname].blk_max = blkmax;
                                        layerJson[colname].blk_mean = blkmean;
                                        layerJson[colname].blk_std = blkstd;
                                        //alert("Block: " + blkmin + ": " + blkmax);
                                    }

                                    if (typeof catJson[cat] == 'undefined') {
                                        catJson[cat] = [];

                                    }
                                    catJson[cat].push(colname);
                                }
                            }
                            if (wobj.catType == "") wobj.catType = dgObj.defaultCategory;
                            if (wobj.dfield == "") wobj.dfield = dgObj.defaultfield;
                            demogJSON[key].category = catJson;
                            demogJSON[key].dynamiclayers = layerJson;
                            dgObj.process = true;
                            wobj.createCatList(key);
                            wobj.mapNode.disabled = false;

                        }

                    }, function(error) {
                        console.log(error);
                    });
                }
            },

            createCatList: function(key) {
                this.demogTypeNode.options.length = 0;
                var n = 0;

                for (var c in demogJSON[key].category) {
                    //alert(c + ": " + demogJSON[key].category[c]);
                    var option = new Option(c, c);
                    if (c == this.catType) option.selected = true;
                    this.demogTypeNode.options[n] = option;
                    n = n + 1;
                }
                if (this.catType == "") this.catType = this.demogTypeNode.options[0].value;
                this.createColList(key);
            },
            createColList: function(key) {
                this.demogListNode.options.length = 0;
                var cat = this.catType;

                if (!(demogJSON[key].category[cat])) {
                    this.catType = this.demogTypeNode.options[0].value;
                    cat = this.catType;
                }
                var fields = demogJSON[key].category[cat];

                var m = 0;
                //console.log("dfield: " + this.dfield);
                for (var i = 0; i < fields.length; i++) {
                    var fieldname = fields[i];
                    var fielddesc = demogJSON[key].dynamiclayers[fieldname].description;
                    var option = new Option(fielddesc, fieldname);
                    if (fieldname == this.dfield) option.selected = true;
                    this.demogListNode.options[m] = option;
                    m = m + 1;

                }
                var fkey = this.demogListNode.value;
                this.dfield = fkey;
                var robj = demogJSON[key].dynamiclayers[fkey];
                //robj.method = this.classTypeNode.value;
                robj.method = this.classType;
                //robj.classes = this.classNumNode.value;
                robj.classes = this.classNum;
                this.renderobj = robj;
                //this.drawPalette(robj.classes, this.currentk, this.reverseStatus);

            },
            activateTab: function(obj, d) {


                dojo.query("#tabDiv.tabArea > a").forEach(function(node, index, nodelist) {

                    dojo.removeClass(node, "activeTab");
                });
                dojo.addClass(obj, "activeTab");
                //alert(dijit.byId("dgwg").dtype);    
                this.createCategory(d);
                
            },
            _reverseColor: function() {
                if (this.reverseStatus) this.reverseStatus = false;
                else this.reverseStatus = true;
                //this.drawPalette(this.classNumNode.value, this.currentk, this.reverseStatus);
            },
            _changeCat: function() {
                //this.drawPalette(this.classNumNode.value, this.currentk, this.reverseStatus);
            },
            _changeDemog: function() {
                this.currentk = 0;
                var currentcat = this.demogTypeNode.value;
                this.catType = currentcat;
                var dmtype = this.dtype;
                this.createColList(dmtype);
            },
            _changeField: function() {
                this.currentk = 0;
                this.dfield = this.demogListNode.value;
                var robj = demogJSON[this.dtype].dynamiclayers[this.dfield];

                //robj.method = this.classTypeNode.value;
                 robj.method = this.classType;
                //robj.classes = this.classNumNode.value;
                robj.classes = this.classNum;
                this.renderobj = robj;

            },
            _changeRendertype: function(e) {
                var rtype = e.target.value;
                if (rtype == "polygon") {
                    //this.polyNode.style.display = "block";
                    //this.pointNode.style.display = "none";
                    this.rendertype = rtype;
                    //this.colormarkertd.innerHTML = "Colors:";
                    //this.sliderNode.set("value", 0.5);
                    this.transValue = 0.5;
                } else {
                    //this.polyNode.style.display = "none";
                    //this.pointNode.style.display = "block";
                    this.rendertype = rtype;
                    //this.colormarkertd.innerHTML = "Marker:";
                    //this.sliderNode.set("value", 0);
                    this.transValue = 0;
                }
            },
            _mapDemog: function(e) {
                this.addspining(e);
                var frm = this.renderform;
                //var fcolor = frm.startcolor.value;
                //var ecolor = frm.endcolor.value;
                var fcolor = this.scolor;
                var ecolor = this.ecolor;
               
                var mapid = this.dtype;
                var fieldid = this.demogListNode.value;
                //var dmethod = this.classTypeNode.value;
                var dmethod = this.classType;
                //var dclass = this.classNumNode.value;
                var dclass = this.classNum;
                //var opcvalue = 1 - this.sliderNode.value;
               // var opcvalue = 1 - this.transValue;
               var opcvalue = .75;
                //var linewidth = parseInt(this.bWidthNode.value);
                var linewidth = 1;
                //var linecolor = this.bColorNode.value;
                var linecolor = "#000000";

                
                var activelayer = this.getActiveLayer(mapid, fieldid);
                var robj = demogJSON[this.dtype].dynamiclayers[fieldid];

                robj.method = dmethod;
                robj.classes = dclass;
                robj.fromcolor = fcolor;
                robj.tocolor = ecolor;
                robj.opacity = opcvalue;
                robj.linewidth = linewidth;
                robj.linecolor = linecolor;
                robj.rendertype = this.rendertype;
                robj.mid = mapid;
                robj.fid = fieldid;
                robj.actlayer = activelayer;
                if (this.rendertype == "polygon") {
                    //var fcolor = frm.startcolor.value;
                    //var ecolor = frm.endcolor.value;
                    robj.fromcolor = fcolor;
                    robj.tocolor = ecolor;
                } else {
                    //robj.circlecolor = this.colorpnt.value;
                    //robj.circlemins = this.minsizeNode.value;
                    //robj.circlemaxs = this.maxsizeNode.value;
                    robj.circlecolor = this.pointcolor;
                    robj.circlemins = this.pointsizemin;
                    robj.circlemaxs = this.pointsizemax;
                }
                robj.layervisible = true;
                this.classbreak(robj);
            },
            classbreak: function(renderobj) {
                //console.log(renderobj)
                document.getElementById("loadingDiv").style.display = "block";
                var wobj = this;
                var opcvalue = renderobj.opacity;
                var mapid = renderobj.mid;
                var fieldid = renderobj.fid;
                var activelayer = this.getActiveLayer(mapid, fieldid);
                renderobj.actlayer = activelayer;


                var minfield = activelayer + "_min";
                var maxfield = activelayer + "_max";
                var layerminvalue = null;
                var layermaxvalue = null;
                if (demogJSON[mapid].dynamiclayers[fieldid][minfield]) layerminvalue = demogJSON[mapid].dynamiclayers[fieldid][minfield];
                if (demogJSON[mapid].dynamiclayers[fieldid][maxfield]) layermaxvalue = demogJSON[mapid].dynamiclayers[fieldid][maxfield];

                if ((layerminvalue == null) && (layermaxvalue == null)) {
                    if (activelayer == "blk") {
                        activelayer = "bg";
                    } else if (activelayer == "bg") {
                        activelayer = "tr";
                    } else if (activelayer == "tr") {
                        activelayer = "cnty";
                    }

                    var minfield = activelayer + "_min";
                    var maxfield = activelayer + "_max";

                    layerminvalue = demogJSON[mapid].dynamiclayers[fieldid][minfield];
                    layermaxvalue = demogJSON[mapid].dynamiclayers[fieldid][maxfield];
                    renderobj.actlayer = activelayer;
                }

                var alyrindex = demogJSON[mapid].baselayers[activelayer].layeridx;
                var linewidth = renderobj.linewidth;
                var linecolor = renderobj.linecolor;
                demogJSON[mapid].dynamiclayers[fieldid] = renderobj;
                var dataUrl = demogJSON[mapid].layerurl + demogJSON[mapid].service + "FeatureServer";
                var dlayerurl = dataUrl + "/" + alyrindex;
                //var layeridstr = mapid + fieldid + "_map";
                //add render type so can display point and polygon of same variable. Otherwise only draws one of same type
                var layeridstr = mapid + fieldid + "_map_" + this.rendertype;
                var desc = demogJSON[mapid].dynamiclayers[fieldid].description + " -- " + demogJSON[mapid].title;
                var titlestr = demogJSON[mapid].dynamiclayers[fieldid].description;
                var newtitlestr = titlestr;
                if (titlestr.length > 40) {
                    var p = titlestr.lastIndexOf(" ", 40);
                    var part2 = titlestr.substr(p);
                    if (part2.length > 40) {
                        var p2 = part2.lastIndexOf(" ", 40);
                        newtitlestr = titlestr.substr(0, p) + "\n" + part2.substr(0, p2) + "\n" + part2.substr(p2);
                    } else {
                        newtitlestr = titlestr.substr(0, p) + "\n" + titlestr.substr(p);
                    }
                }
                //console.log("length: " + titlestr.length + "; " + newtitlestr);
                var sourcestr = demogJSON[mapid].baselayers[activelayer].level;

                if (wobj.map.findLayerById(layeridstr)) {
                    var lyr = wobj.map.findLayerById(layeridstr);
                    wobj.map.remove(lyr);

                }



                var mycolors = this.generateColors(renderobj.classes, renderobj.fromcolor, renderobj.tocolor);

                // visualization based on field and normalization field

                /* console.log(mycolors);
                var cscheme = {
                    colorsForClassBreaks: {
                        colors: mycolors, 
                        numClasses: renderobj.classes
                    }
                }; */
                var svisible = renderobj.layervisible;

                var fillsym = {
                    type: "simple-fill", // autocasts as new SimpleFillSymbol()
                    color: [128, 128, 128, 0],
                    outline: { // autocasts as new SimpleLineSymbol()
                        color: [128, 128, 128, 0],
                        width: "0.5px"
                    }
                };

                var catbreakid = activelayer + renderobj.method + renderobj.classes;

                if (demogJSON[mapid].dynamiclayers[fieldid][catbreakid]) {
                    var brkinfos = demogJSON[mapid].dynamiclayers[fieldid][catbreakid];
                    if (renderobj.rendertype == "polygon") {


                        var psyms = [];
                        for (var m = 0; m < brkinfos.classBreakInfos.length; m++) {

                            var pfillsym = new SimpleFillSymbol();
                            psyms[m] = pfillsym;
                            psyms[m].color = mycolors[m];
                            psyms[m].outline = {
                                color: linecolor,
                                width: linewidth
                            };
                            brkinfos.classBreakInfos[m].symbol = psyms[m];
                        }

                    } else {

                        brkinfos.backgroundFillSymbol = fillsym;
                        var pntcolor = renderobj.circlecolor;

                        var minsize = Number(renderobj.circlemins);
                        var maxsize = Number(renderobj.circlemaxs);
                        var sinterval = (maxsize - minsize) / (Number(renderobj.classes) - 1);

                        var sym = [];
                        for (var m = 0; m < brkinfos.classBreakInfos.length; m++) {
                            var s = parseInt(minsize + m * sinterval);
                            sym[m] = {
                                type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                                style: "circle",
                                color: pntcolor,
                                size: s + "px", // pixels
                                outline: { // autocasts as new SimpleLineSymbol()
                                    color: linecolor,
                                    width: linewidth // points
                                }
                            };

                            brkinfos.classBreakInfos[m].symbol = sym[m];
                        }
                    }
                    var newrender = brkinfos;
                    var demoglayer = new FeatureLayer({
                        url: dlayerurl,
                        title: newtitlestr,
                        id: alyrindex,
                        "id": layeridstr,
                        layerId: alyrindex, //feature not mapserver?
                        opacity: opcvalue,
                        renderer: newrender, //feature not mapserver?
                        visible: true //feature not mapserver?
                    })
                    

                    demoglayer.isDynamic = true;
                    demoglayer.renderobj = renderobj;
                    demoglayer.renderField = fieldid;
                    demoglayer.maptype = "demog_more";
                    demoglayer.layerType = mapid + "_" + alyrindex;
                    demoglayer.renderIndex = alyrindex;
                    if ((renderobj["ranges"]) && (renderobj["ranges"][activelayer]) && (renderobj["ranges"][activelayer]["whereclause"])) {
                        var whstr = renderobj["ranges"][activelayer]["whereclause"];
                        demoglayer.findSublayerById(alyrindex).definitionExpression = whstr;
                    }
                    wobj.map.add(demoglayer);
                    document.getElementById("loadingDiv").style.display = "none";
                    wobj.removespining();
                } else {
                    var templayer = new FeatureLayer({
                        url: dlayerurl
                            //definitionExpression: fieldid + " > 0"

                    });
                    var colorParams = {
                        layer: templayer,
                        basemap: this.map.basemap, // "gray"
                        field: fieldid,
                        //normalizationField: "TOTPOP_CY",
                        classificationMethod: renderobj.method,
                        //colorScheme: cscheme,
                        //colorsForClassBreaks: {colors: mycolors, numClasses: renderobj.classes},
                        //theme: "high-to-low",
                        //colors: [renderobj.fromcolor, renderobj.tocolor],
                        numClasses: renderobj.classes,
                        defaultSymbolEnabled: false
                    };

                    // when the promise resolves, apply the renderer to the layer
                    colorRendererCreator.createClassBreaksRenderer(colorParams)
                        .then(function(response) {
                            if (renderobj.rendertype == "polygon") {
                                for (var m = 0; m < response.renderer.classBreakInfos.length; m++) {
                                    response.renderer.classBreakInfos[m].symbol.color = mycolors[m];
                                    response.renderer.classBreakInfos[m].symbol.outline = {
                                        color: linecolor,
                                        width: linewidth
                                    };
                                }
                            } else {
                                response.renderer.backgroundFillSymbol = fillsym;
                                var pntcolor = renderobj.circlecolor;

                                var minsize = Number(renderobj.circlemins);
                                var maxsize = Number(renderobj.circlemaxs);
                                var sinterval = (maxsize - minsize) / (Number(renderobj.classes) - 1);
                                var symbol = {
                                    type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                                    style: "circle",
                                    color: pntcolor,
                                    size: "8px", // pixels
                                    outline: { // autocasts as new SimpleLineSymbol()
                                        color: linecolor,
                                        width: linewidth // points
                                    }
                                };
                                var sym = [];
                                for (var m = 0; m < response.renderer.classBreakInfos.length; m++) {
                                    var s = parseInt(minsize + m * sinterval);
                                    sym[m] = symbol;
                                    sym[m].size = s;
                                    response.renderer.classBreakInfos[m].symbol = sym[m];
                                }
                            }
                            var newrenderobj = {};
                            newrenderobj.field = response.renderer.field;
                            newrenderobj.type = response.renderer.type;
                            if (response.renderer.classBreakInfos.length > 0) {
                                newrenderobj.classBreakInfos = [];
                                for (var k = 0; k < response.renderer.classBreakInfos.length; k++) {
                                    newrenderobj.classBreakInfos[k] = {};
                                    newrenderobj.classBreakInfos[k].minValue = response.renderer.classBreakInfos[k].minValue;
                                    newrenderobj.classBreakInfos[k].maxValue = response.renderer.classBreakInfos[k].maxValue;
                                    newrenderobj.classBreakInfos[k].label = response.renderer.classBreakInfos[k].label;
                                }
                            }
                            demogJSON[mapid].dynamiclayers[fieldid][catbreakid] = newrenderobj;
                            var demoglayer = new FeatureLayer({
                                url: dlayerurl,
                                title: newtitlestr,
                                id: alyrindex,
                                "id": layeridstr,
                                layerId: alyrindex, //feature not mapserver?
                                opacity: opcvalue,
                                renderer: response.renderer, //feature not mapserver?
                                visible: true //feature not mapserver?
                            })
                            /* var demoglayer = new MapImageLayer({
                                url: dataUrl,
                                title: sourcestr,
                                "id": layeridstr,
                                opacity: opcvalue,
                                visible: svisible,
                                sublayers: [{
                                    id: alyrindex,
                                    title: newtitlestr,
                                    renderer: response.renderer,
                                    visible: true,
                                    source: {
                                        mapLayerId: alyrindex
                                    }
                                }]

                            }); */

                            demoglayer.isDynamic = true;
                            demoglayer.renderobj = renderobj;
                            demoglayer.renderField = fieldid;
                            demoglayer.maptype = "demog_more";
                            demoglayer.layerType = mapid + "_" + alyrindex;
                            demoglayer.renderIndex = alyrindex;
                            if ((renderobj["ranges"]) && (renderobj["ranges"][activelayer]) && (renderobj["ranges"][activelayer]["whereclause"])) {
                                var whstr = renderobj["ranges"][activelayer]["whereclause"];
                                demoglayer.findSublayerById(alyrindex).definitionExpression = whstr;
                            }
                            wobj.map.add(demoglayer);
                            document.getElementById("loadingDiv").style.display = "none";
                            wobj.removespining();
                        }).catch(function(err) {
                            console.log("error: " + err);
                            document.getElementById("loadingDiv").style.display = "none";
                            wobj.removespining();
                        });
                }

               


            },
            addspining: function(event) {
                var offy = 0;

                var x;
                var y;
                if (event.x != undefined && event.y != undefined) {

                    x = event.clientX;
                    y = event.clientY;

                } else // Firefox method to get the position
                {
                    x = event.clientX + document.body.scrollLeft +
                        document.documentElement.scrollLeft;
                    y = event.clientY + document.body.scrollTop +
                        document.documentElement.scrollTop;

                }


                if (document.getElementById("spindiv")) {
                    var dummy = document.getElementById("spindiv");
                    dummy.style.position = "absolute";
                    dummy.style.left = (x) + "px";
                    dummy.style.top = (y + offy) + "px";
                    dummy.style.display = "block";
                    dummy.innerHTML = "<img src='images/hourglas.gif' alt='loading...' />";
                } else {
                    var dummy = document.createElement("div");
                    dummy.id = "spindiv";
                    dummy.style.position = "absolute";

                    dummy.style.left = (x) + "px";
                    dummy.style.top = (y + offy) + "px";
                    dummy.innerHTML = "<img src='images/hourglas.gif' alt='loading...' />";
                    dummy.style.display = "block";
                    dummy.style.zIndex = "1000";
                    document.body.appendChild(dummy);
                }

            },
            removespining: function() {

                if (document.getElementById("spindiv")) {
                    var dummy = document.getElementById("spindiv");
                    document.body.removeChild(dummy);
                }
            },
            getActiveLayer: function(mid, fldid) {
                var zlevel = this.view.zoom;
                var actlayer = "bg";

                var blayers = demogJSON[mid].baselayers;
                for (var b in blayers) {
                    var minl = blayers[b].minlevel;
                    var maxl = blayers[b].maxlevel;
                    var lindex = blayers[b].layeridx;
                    if ((zlevel < maxl) && (zlevel >= minl)) {
                        actlayer = b;

                    }
                }


                return actlayer;
            },
            generateColors: function(steps, scolor, ecolor) {
                var newcolors = [];
                var c1 = new Color(scolor);
                var c2 = new Color(ecolor);
                var deltaR = Math.floor((c2.r - c1.r) / (steps - 1));
                var deltaG = Math.floor((c2.g - c1.g) / (steps - 1));
                var deltaB = Math.floor((c2.b - c1.b) / (steps - 1));



                //newcolors.push(c1);

                for (i = 0; i < steps; i++) {
                    var r = c1.r + deltaR * i;
                    var g = c1.g + deltaG * i;
                    var b = c1.b + deltaB * i;

                    var curcolor = new Color([r, g, b]);
                    //var curcolor = this.rgb2hex(r,g,b);
                    newcolors.push(curcolor);

                }
                //newcolors.push(c2);

                return newcolors;
            },
            tablePalette: function(steps, scolor, ecolor) {

                var pctvalue = 100 / steps;
                var divwidth = 12 * steps;
                var mycolors = this.generateColors(steps, scolor, ecolor);

                var colorcol = '';
                colorcol += '<table cellpadding="0" cellspacing="0" style="width: ' + divwidth + 'px; height: 12px;">';
                colorcol += '<tr>';

                for (var i = 0; i < steps; i++) {
                    var c = mycolors[i];
                    var r = c.r;
                    var g = c.g;
                    var b = c.b;
                    colorcol += '<td width="' + pctvalue + '%" style="background-color: rgb(' + parseInt(r) + "," + parseInt(g) + "," + parseInt(b) + ');"></td>'

                }

                colorcol += '</tr>';
                colorcol += '</table>';

                return colorcol;
            },
            drawPalette: function(catnum, ck, reverse) {
                var selectorOwner = this.selector;
                var rect = selectorOwner.getBoundingClientRect();

                var tp = rect.bottom;
                var lt = rect.left;
                // var tp = selectorOwner.offset().top + (selectorOwner.outerHeight());
                // var lt = selectorOwner.offset().left;
                if (document.getElementById("colorlist")) {
                    document.getElementById("colorlist").innerHTML = "";
                    document.getElementById("colorlist").style.top = parseInt(tp) + "px";
                    document.getElementById("colorlist").style.left = parseInt(lt) + "px";
                } else {
                    var pandiv = dojo.create("div", {
                        id: "colorlist",
                        style: "position: absolute; z-index: 401; display: none; top: " + parseInt(tp) + "px; left: " + parseInt(lt) + "px; background-color: #cccccc;"
                    });
                    document.body.appendChild(pandiv);
                }
                var colorstep = parseInt(catnum);
                var tbobj = dojo.create("table");

                document.getElementById("colorlist").appendChild(tbobj);


                var trobj;
                for (var k = 0; k < colorThemes.length; k++) {
                    var cobj = colorThemes[k];
                    var scolor = cobj.startcolor;
                    var ecolor = cobj.endcolor;
                    if (reverse) {
                        scolor = cobj.endcolor;
                        ecolor = cobj.startcolor;
                    }

                    if ((k % 2) == 0) {
                        trobj = dojo.create("tr");
                        tbobj.appendChild(trobj);
                    }
                    var str = this.tablePalette(colorstep, scolor, ecolor);
                    //console.log("color str: "+str);
                    var wobj = this;
                    var tdobj = dojo.create("td", {
                        style: "padding: 4px 10px 4px 10px;",
                        value: k,
                        onmouseover: function(e) { this.style.backgroundColor = '#666666'; },
                        onmouseout: function(e) { this.style.backgroundColor = 'transparent'; },
                        onclick: function(e) { wobj.changecontent(this, this.value); },
                        innerHTML: str
                    });
                    trobj.appendChild(tdobj);

                    if (k == ck) {
                        //tdobj.style.borderColor = "cyan";
                        this.selectcolor.innerHTML = str;
                        this.renderform.startcolor.value = scolor;
                        this.renderform.endcolor.value = ecolor;

                    }
                }

                //console.log(document.getElementById("colorlist").innerHTML);
            },
            _changeSelector: function(e) {
                var selectorOwner = this.selectcolor;
                var rect = selectorOwner.getBoundingClientRect();

                var tp = rect.bottom;
                var lt = rect.left;
                $("#colorlist").css("top", parseInt(tp) + "px");
                $("#colorlist").css("left", parseInt(lt) + "px");

                $("#colorlist").slideToggle("slow");
            },
            changecontent: function(dobj, currentindex) {
                //console.log("currentindex: " + currentindex)
                var cobj = colorThemes[currentindex];
                var scolor = cobj.startcolor;
                var ecolor = cobj.endcolor;
                if (this.reverseStatus) {
                    scolor = cobj.endcolor;
                    ecolor = cobj.startcolor;
                }
                var dstr = dobj.innerHTML;
                this.selectcolor.innerHTML = dstr;
                document.getElementById("colorlist").style.display = "none";
                this.currentk = currentindex;
                this.renderform.startcolor.value = scolor;
                this.renderform.endcolor.value = ecolor;

            },
            highlight: function(dobj) {
                dobj.style.backgroundColor = "cyan";
            },
            clearhighlight: function(dobj) {
                dobj.style.backgroundColor = "transparent";
            },
            ArrayContains: function(element, inArray) {
                for (var j = 0; j < inArray.length; j++) {
                    if (element == inArray[j]) {
                        return true;
                    }
                }
                return false;
            },
            destroy: function() {
                dojo.disconnect(this._zoomHandler);
                dojo.empty(this.domNode);
                this.inherited(arguments);
            }

        });


        return MapDemographics;
    });