define(

    ['dojo',
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
    function(
        dojo,
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
        Query,
        jsonUtils,
        SimpleFillSymbol,
        Color,
        colorRendererCreator,
        colorSchemes,
        HorizontalSlider
    ) {


        var a = domConstruct.create("link", { type: "text/css", rel: "stylesheet", href: "mapdijit/css/colorPicker.css" });
        dojo.doc.getElementsByTagName("head")[0].appendChild(a);

        var colorThemes = [{ "startcolor": "#ffffb2", "endcolor": "#ff0000" }
            //, { "startcolor": "#ca0020", "endcolor": "#578fd3" }
            , { "startcolor": "#ffccff", "endcolor": "#660066" }, { "startcolor": "#D0CFEE", "endcolor": "#322C75" }, { "startcolor": "#fef0d9", "endcolor": "#b30000" }, { "startcolor": "#FFFFD1", "endcolor": "#B0B080" }, { "startcolor": "#f2f0f7", "endcolor": "#54278f" }, { "startcolor": "#eff3ff", "endcolor": "#08519c" }, { "startcolor": "#f7f7f7", "endcolor": "#252525" }, { "startcolor": "#ccffff", "endcolor": "#006666" }, { "startcolor": "#ffffcc", "endcolor": "#006837" }, { "startcolor": "#ccccff", "endcolor": "#000066" }
        ];

        var MapDemog = dojo.declare([dijit._Widget, dijit._Templated], {
            templateString: dojo.cache("mapdijit", "templates/MapDemog.html"),
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

                this.mapview = options.view;

                if (options.defaultField) {
                    this.dfield = options.defaultField;
                    this.mapdefault = true;
                } else this.dfield = "";

                this.catType = "";

                this.currentk = 0;
                this.reverseStatus = false;
                this.dtype = "ejdemog";
                // mixin constructor options 
                dojo.safeMixin(this, options);


            },

            startup: function() {

            },
            postCreate: function() {

                var obj = this;
                this._zoomHandler = watchUtils.whenTrue(this.mapview, 'stationary', function(evt) {
                    obj._adjustToState();

                });
                var liststr = "";
                var m = 0;
                $('#color1').colorPicker();
                // $('#dgselector').bind("click", function() {
                //     var selectorOwner = $(this);
                //     var tp = selectorOwner.offset().top + (selectorOwner.outerHeight());
                //     var lt = selectorOwner.offset().left;
                //     $("#dgcolorlist").css("top", parseInt(tp) + "px");
                //     $("#dgcolorlist").css("left", parseInt(lt) + "px");
                //     //alert($("#colorlist").html());
                //     //             if ($.browser.msie) {
                //     //                 $('#colorlist').css({ "visibility": "visible" });
                //     //             }
                //     //             alert($('#colorlist').css("display") + "; " + $('#colorlist').css("visibility"));
                //     $("#dgcolorlist").slideToggle("slow");
                // });
                var currenttype = this.dtype;
                //this.classNumNode.value = "5";
                //this.bWidthNode.value = "1";
                this.createCategory(currenttype);
                //this.createList(currenttype);

            },
            _adjustToState: function() {
                if (this.mapview.map.findLayerById("demog_map")) {
                    var dmlayer = this.mapview.map.findLayerById("demog_map");
                    var robj = dmlayer.renderobj;
                    var mid = robj.mid;
                    var lid = robj.fid;

                    var orgactivelayer = robj.actlayer;
                    var activelayer = this.getActiveLayer(mid, lid);
                    console.log("level: " + activelayer + "; " + mid + ": " + lid);
                    console.log(orgactivelayer + " : " + activelayer)
                    if (orgactivelayer != activelayer) {
                        this.classbreak(robj);
                    }
                }

            },
            createCategory: function(key) {
                this.catType = "";
                var wobj = this;
                wobj.dtype = key;
                var dgObj = demogJSON[key];
                this.demogtitle.innerHTML = dgObj.title;
                console.log("wobj", wobj)
                console.log("dgObj", dgObj)
                if (dgObj.process) {
                    wobj.createCatList(key);
                    wobj.setDefaultListIndex(dgObj.defaultCategoryIndex);
                } else {
                    var lookuptableurl = dgObj.layerurl + dgObj.service + "FeatureServer/" + dgObj.lookupindex;
                    console.log(lookuptableurl)
                    var queryTask = new QueryTask(lookuptableurl);
                    var query = new Query();
                    query.returnGeometry = false;

                    query.outFields = ["*"];
                    var dirty = (new Date()).getTime();
                    query.where = "1=1 AND " + dirty + "=" + dirty;

                    //get features in order by cat and label
                    query.orderByFields = ["CATEGORY", "DESCRIPTION"];
                    queryTask.execute(query).then(function(featset) {
                        console.log(featset)
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
                                    if (wobj.dfield == colname) wobj.catType = cat;
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

                            demogJSON[key].category = catJson;

                            demogJSON[key].dynamiclayers = layerJson;
                            dgObj.process = true;
                            demogJSON[key].defaultCategoryIndex = wobj.catType;
                            wobj.createCatList(key);
                            console.log(wobj.catType + "; " + wobj.dfield)
                            wobj.setDefaultListIndex(wobj.catType);
                            if (wobj.mapdefault) wobj._setDefRender();

                        }

                    }, function(error) {
                        console.log(error);
                    });
                }
            },
            setDefaultListIndex: function(defaultcat) {
                //set default demog category to Population and update sublist, default for each group set in config object
                if (defaultcat.length > 0) this.demogTypeNode.value = defaultcat;
                else this.demogTypeNode.selectedIndex = demogJSON[this.dtype].defaultCategoryIndex;
                this._changeDemog();
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
                var fields = demogJSON[key].category[cat];
                var m = 0;
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
                robj.method = "quantile";
                //robj.classes = this.classNumNode.value;
                robj.classes = 5;
                this.renderobj = robj;
                this._drawPalette(robj.classes, this.currentk, this.reverseStatus);

            },

            _reverseColor: function() {
                if (this.reverseStatus) this.reverseStatus = false;
                else this.reverseStatus = true;
                this._drawPalette(this.classNumNode.value, this.currentk, this.reverseStatus);
            },
            _changeCat: function() {
                this._drawPalette(this.classNumNode.value, this.currentk, this.reverseStatus);
            },
            _changeDemog: function() {
                //this.currentk = 0; //do not set back to 0, overwrites default set at start
                var currentcat = this.demogTypeNode.value;
                this.catType = currentcat;
                var dmtype = this.dtype;
                this.createColList(dmtype);
            },
            _changeField: function() {
                //this.currentk = 0; //do not set back to 0, overwrites default set at start
                this.dfield = this.demogListNode.value;
                var robj = demogJSON[this.dtype].dynamiclayers[this.dfield];

                //robj.method = this.classTypeNode.value;
                robj.method = "quantile";
                //robj.classes = this.classNumNode.value;
                robj.classes = 5;
                this.renderobj = robj;
                //this._drawPalette(robj.classes, this.currentk, this.reverseStatus);
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
            _drawPalette: function(catnum, ck, reverse) {
                var wobj = this;
                //var selectorOwner = $("#dgselector");
                //var tp = selectorOwner.offset().top + (selectorOwner.outerHeight());
                //var lt = selectorOwner.offset().left;
                // if (document.getElementById("dgcolorlist")) {
                //     $("#dgcolorlist").css("top", parseInt(tp) + "px");
                //     $("#dgcolorlist").css("left", parseInt(lt) + "px");
                // } else {
                //     $("body").append('<div id="dgcolorlist" style="position: absolute; z-index: 401; display: none; top: ' + parseInt(tp) + "px; left: " + parseInt(lt) + 'px; background-color: #cccccc;"></div>')
                // }
                // document.getElementById("dgcolorlist").innerHTML = "";
                var colorstep = parseInt(catnum);
                var wobj = this;
                var tblobj = document.createElement("table");
                //document.getElementById("dgcolorlist").appendChild(tblobj);
                var exrow = null;
                for (var k = 0; k < colorThemes.length; k++) {
                    var cobj = colorThemes[k];
                    var scolor = cobj.startcolor;
                    var ecolor = cobj.endcolor;
                    if (this.reverseStatus) {
                        scolor = cobj.endcolor;
                        ecolor = cobj.startcolor;
                    }
                    if ((k % 2) == 0) {
                        var oRow = tblobj.insertRow(-1);
                        exrow = oRow;
                    }
                    var tdobj = exrow.insertCell(-1);
                    tdobj.style = "padding: 4px 10px 4px 10px;";
                    tdobj.value = k;
                    tdobj.scolor = scolor;
                    tdobj.ecolor = ecolor;
                    tdobj.onmouseover = function() {
                        this.style.backgroundColor = '#666666';
                    }
                    tdobj.onmouseout = function() {
                        this.style.backgroundColor = 'transparent';
                    }
                    tdobj.onclick = function() {
                        wobj._changecontent(this);
                    }
                    var str = this.tablePalette(colorstep, scolor, ecolor);
                    //var str = mixPalette(colorstep, scolor, ecolor);
                    tdobj.innerHTML = str;


                    if (k == ck) {
                        //document.getElementById("dgselcolor").innerHTML = str;
                        this.dgformNode.startcolor.value = scolor;
                        this.dgformNode.endcolor.value = ecolor;


                    }
                }
            },

            _changecontent: function(dobj) {
                var scolor = dobj.scolor;
                var ecolor = dobj.ecolor;
                var currentindex = dobj.value;
                var dstr = dobj.innerHTML;
                //this.selcolorNode.innerHTML = dstr;
                document.getElementById("dgcolorlist").style.display = "none";
                this.currentk = currentindex;
                this.dgformNode.startcolor.value = scolor;
                this.dgformNode.endcolor.value = ecolor;
                //console.log(scolor + ": " + ecolor);

            },

            _setDefRender: function() {
                var mapid = this.mapview.id;
                if (mapsJson[mapid]["customrenderer"]) {
                    var robj = mapsJson[mapid]["customrenderer"];
                    this.currentk = robj.colorindex;
                    //this.classNumNode.value = robj.classnum;
                    //this.classTypeNode.value = robj.method;
                    //this.bWidthNode.value = robj.linewidth;             
                    //this.bColorNode.value = robj.linecolor;
                    //this.sliderNode.setValue(1 - robj.opacity);
                    $(".colorPicker-picker").css("background-color", robj.linecolor);
                    this._drawPalette(robj.classnum, this.currentk, false);
                    this.mapbtnNode.click();
                }
            },
            _mapDemog: function(e) {
                var mapids = ["demog_map", "ejindex_map", "other_map", "more_map","threshold_map"];
                for (var i = 0; i < mapids.length; i++) {
                    if (this.mapview.map.findLayerById(mapids[i])) {
                        this.mapview.map.remove(this.mapview.map.findLayerById(mapids[i]));
                    }
                }

                var frm = this.dgformNode;
                var fcolor = frm.startcolor.value;
                var ecolor = frm.endcolor.value;
                var maptype = this.dtype;
                var fieldid = this.demogListNode.value;
                //var dmethod = this.classTypeNode.value;
                var dmethod = "quantile";
                //var dclass = this.classNumNode.value;
                var dclass = 5;
                //var opcvalue = 1 - this.sliderNode.value;
                var opcvalue = .75;
                //var linewidth = parseInt(this.value);
                var linewidth = 1;
                //var linecolor = this.bColorNode.value;
                var linecolor = "#000000";                
                var activelayer = this.getActiveLayer(maptype, fieldid);
                var robj = demogJSON[this.dtype].dynamiclayers[fieldid];
		dojo.byId("theme").style.display = "none";

                robj.method = dmethod;
                robj.classes = dclass;
                robj.fromcolor = fcolor;
                robj.tocolor = ecolor;
                robj.opacity = opcvalue;
                robj.linewidth = linewidth;
                robj.linecolor = linecolor;

                robj.mid = maptype;
                robj.fid = fieldid;
                robj.actlayer = activelayer;
                this.renderobj = robj;
                this.classbreak(robj);
            },
            classbreak: function(renderobj) {
                this.showloading(this.mapview);
                var wobj = this;
                var opcvalue = renderobj.opacity;
                var maptype = renderobj.mid;
                var fieldid = renderobj.fid;
                var activelayer = this.getActiveLayer(maptype, fieldid);
                renderobj.actlayer = activelayer;
                var minfield = activelayer + "_min";
                var maxfield = activelayer + "_max";
                var layerminvalue = null;
                var layermaxvalue = null;
                if (demogJSON[maptype].dynamiclayers[fieldid][minfield]) layerminvalue = demogJSON[maptype].dynamiclayers[fieldid][minfield];
                if (demogJSON[maptype].dynamiclayers[fieldid][maxfield]) layermaxvalue = demogJSON[maptype].dynamiclayers[fieldid][maxfield];

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

                    layerminvalue = demogJSON[maptype].dynamiclayers[fieldid][minfield];
                    layermaxvalue = demogJSON[maptype].dynamiclayers[fieldid][maxfield];
                    renderobj.actlayer = activelayer;
                }
                var linewidth = renderobj.linewidth;
                var linecolor = renderobj.linecolor;
                demogJSON[this.dtype].dynamiclayers[fieldid] = renderobj;
                var dataUrl = demogJSON[maptype].layerurl + demogJSON[maptype].service + "FeatureServer";

                var alyrindex = demogJSON[maptype].baselayers[activelayer].layeridx;
                var dlayerurl = dataUrl + "/" + alyrindex;
                var layeridstr = "demog_map";
                var desc = demogJSON[maptype].dynamiclayers[fieldid].description + " -- " + demogJSON[maptype].title;
                var titlestr = demogJSON[maptype].dynamiclayers[fieldid].description;
				var actlyr = activelayer;
				if(activelayer === "tr"){
					actlyr ="Tract";
				}
				else if(activelayer === "bg"){
					actlyr ="Blockgroup";
				}else if(activelayer === "cnty"){
					actlyr ="County";
				}
                var sourcestr = "Source: " + demogJSON[maptype].title + "(" + actlyr + ")";
                if (wobj.mapview.map.findLayerById(layeridstr)) {
                    var lyr = wobj.mapview.map.findLayerById(layeridstr);
                    wobj.mapview.map.remove(lyr);

                }
                var templayer = new FeatureLayer({
                    url: dlayerurl
                        //definitionExpression: fieldid + " > 0"

                });
                console.log("activelayer",activelayer)

                var mycolors = this.generateColors(renderobj.classes, renderobj.fromcolor, renderobj.tocolor);

                // visualization based on field and normalization field

                /* console.log(mycolors);
                var cscheme = {
                    colorsForClassBreaks: {
                        colors: mycolors, 
                        numClasses: renderobj.classes
                    }
                }; */
                var catbreakid = activelayer + renderobj.method + renderobj.classes;

                if (demogJSON[maptype].dynamiclayers[fieldid][catbreakid]) {
                    var brkinfos = demogJSON[maptype].dynamiclayers[fieldid][catbreakid];

                    for (var m = 0; m < brkinfos.classBreakInfos.length; m++) {
                        brkinfos.classBreakInfos[m].symbol.color = mycolors[m];
                        brkinfos.classBreakInfos[m].symbol.outline = {
                            color: linecolor,
                            width: linewidth
                        };
                    }

                    var demoglayer = new FeatureLayer({
                        url: dlayerurl,
                        title: titlestr,
                        id: alyrindex,
                        "id": layeridstr,
                        layerId: alyrindex, //feature not mapserver?
                        opacity: opcvalue,
                        renderer: brkinfos, //feature not mapserver?
                        visible: true //feature not mapserver?
                    })
                    /* var demoglayer = new MapImageLayer({
                        url: dataUrl,
                        title: titlestr,
                        "id": layeridstr,
                        opacity: opcvalue,
                        sublayers: [{
                            id: alyrindex,
                            title: sourcestr,
                            renderer: brkinfos,
                            visible: true,


                            source: {
                                mapLayerId: alyrindex
                            }
                        }]

                    }); */

                    demoglayer.isDynamic = true;
                    demoglayer.renderobj = renderobj;
                    demoglayer.renderField = fieldid;
                    demoglayer.layerType = maptype + "_" + alyrindex;
                    demoglayer.renderIndex = alyrindex;

                    wobj.mapview.map.add(demoglayer);
                    wobj.hideloading(wobj.mapview);
                } else {
                    var colorParams = {
                        layer: templayer,
                        basemap: this.mapview.map.basemap, // "gray"
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

                            for (var m = 0; m < response.renderer.classBreakInfos.length; m++) {
                                response.renderer.classBreakInfos[m].symbol.color = mycolors[m];
                                response.renderer.classBreakInfos[m].symbol.outline = {
                                    color: linecolor,
                                    width: linewidth
                                };
                            }
                            demogJSON[maptype].dynamiclayers[fieldid][catbreakid] = response.renderer;
                            //console.log()
                            var demoglayer = new FeatureLayer({
                                url: dlayerurl,
                                title: titlestr,
                                id: alyrindex,
                                "id": layeridstr,
                                layerId: alyrindex, //feature not mapserver?
                                opacity: opcvalue,
                                renderer: response.renderer, //feature not mapserver?
                                visible: true //feature not mapserver?
                            })

                            demoglayer.isDynamic = true;
                            demoglayer.renderobj = renderobj;
                            demoglayer.renderField = fieldid;
                            demoglayer.layerType = maptype + "_" + alyrindex;
                            demoglayer.renderIndex = alyrindex;
                            wobj.mapview.map.add(demoglayer);
                            demoglayer.name = demogJSON[wobj.dtype].dynamiclayers[fieldid].description;
                            var desc = demogJSON[wobj.dtype].dynamiclayers[fieldid].description + " -- " + demogJSON[wobj.dtype].title;
                            if (wobj.mapview.id == "map1") {
                                dojo.byId("lab1").innerHTML = desc;
                            } else {
                                dojo.byId("lab2").innerHTML = desc;
                            }
                            dojo.byId("theme").style.display = "none";

                            wobj.hideloading(wobj.mapview);
                        }).catch(function(err) {
                            console.log("error: " + err);
                        });
                }


            },
            getActiveLayer: function(mid, fldid) {
                var zlevel = this.mapview.zoom;
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

            showloading: function(map) {
                var leftx = 0;
                var offx = 100;
                if (map.id == "map2") leftx = map.width;
                var x = map.width / 2;
                var y = map.height / 2;
                var divid = "spindiv_" + map.id;
                if (document.getElementById(divid)) {
                    var dummy = document.getElementById(divid);
                    dummy.style.position = "absolute";
                    dummy.style.left = (x + leftx - offx) + "px";
                    dummy.style.top = (y) + "px";
                    dummy.style.backgroundColor = "#CCCCCC";
                    dummy.style.color = "red";
                    dummy.style.fontSize = "12pt";
                    dummy.innerHTML = "Loading...Please wait";
                } else {
                    var dummy = document.createElement("div");
                    dummy.id = divid;
                    dummy.style.position = "absolute";

                    dummy.style.left = (x + leftx - offx) + "px";
                    dummy.style.top = (y) + "px";
                    dummy.innerHTML = "Loading...Please wait";
                    dummy.style.backgroundColor = "#CCCCCC";
                    dummy.style.color = "red";
                    dummy.style.fontSize = "12pt";
                    dojo.byId(map.id).appendChild(dummy);
                }

            },
            hideloading: function(map) {
                var divid = "spindiv_" + map.id;
                if (document.getElementById(divid)) {
                    var dummy = document.getElementById(divid);
                    dojo.byId(map.id).removeChild(dummy);
                }
            },
            destroy: function() {
                dojo.disconnect(this._zoomHandler);
                dojo.empty(this.domNode);
                this.inherited(arguments);
            }

        });



        return MapDemog;
    });