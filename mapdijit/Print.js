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
 "dojo/text!mapdijit/templates/Print.html",
 "esri/tasks/PrintTask",
 "esri/tasks/PrintParameters",
 "esri/tasks/PrintTemplate"
], function (
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
  dijittemplate,
  PrintTask,
  PrintParameters,
  PrintTemplate
) {


    var printWidget = declare("mapdijit.Print", [_WidgetBase, _TemplatedMixin], {
        templateString: dijittemplate,
        widgetsInTemplate: false,
        constructor: function (options, srcRefNode) {
            options = options || {};
            if (!options.map) {
                console.log("mapdijit.Print: unable to find the 'map' property in parameters");
                return;
            }
            this._map = options.map;
            this.printmapurl = options.printtask;
            // mixin constructor options 
            dojo.safeMixin(this, options);


        },

        startup: function () {
            this.inherited(arguments);

            esri.config.defaults.io.proxyUrl = "proxy.ashx";
        },
        postCreate: function () {

            this._switchFormat();
        },
        destroy: function () {

        },
        _switchFormat: function () {
            var p = this.pformatNode.value;
            if (p == "HTML") {
                document.getElementById("printlayoutdiv").style.display = "none";
                document.getElementById("printtitlediv").style.display = "block";
                document.getElementById("printsizediv").style.display = "block";
            } else {
                document.getElementById("printlayoutdiv").style.display = "block";
                document.getElementById("printsizediv").style.display = "block";
                var layout = this.playoutNode.value;
                this._switchLayout();
            }
        },
        _switchLayout: function () {
            var p = this.playoutNode.value;
            
            if (p == "MAP_ONLY") {
                document.getElementById("printsizediv").style.display = "block";
                document.getElementById("printtitlediv").style.display = "none";
            } else {
                document.getElementById("printsizediv").style.display = "none";
                document.getElementById("printtitlediv").style.display = "block";
            }
        },
        _switchSize: function () {
            var sf = this.mapsizeNode.value;
            if (sf == "current") {
                document.getElementById("sizeDiv").style.display = "none";
            } else {
                document.getElementById("sizeDiv").style.display = "block";
            }
        },
        _printMap: function (e) {
            var psizetype = this.mapsizeNode.value;
            var pmapwidth = this._map.width;
            var pmapheight = this._map.height;
            if (psizetype == "customize") {
                pmapwidth = this.mwidthNode.value;
                pmapheight = this.mheightNode.value;
            }
            var printtitle = this.titleNode.value;
            var printformat = this.pformatNode.value;
            if (printformat == "HTML") {

                var purl = "layout.aspx?print_title=" + printtitle + "&psize=" + psizetype + "&printwidth=" + pmapwidth + "&printheight=" + pmapheight;
                newWin = window.open(purl, "printmap");

                if (newWin && newWin.open && !newWin.closed) {
                }
                else {
                    alert("Can not open a new window.");
                }


            } else {
                var printlegendlayers = [];
                var pmap = this._map;
                /*dojo.forEach(pmap.layerIds, function (layerId) {
                if ((layerId.toLowerCase().indexOf("layer") != 0) && (map.getLayer(layerId).visible)) {
                var pl = new esri.tasks.LegendLayer();
                pl.layerId = layerId;
                //pl.subLayerIds = pmap.getLayer(layerId).visibleLayers;
                printlegendlayers.push(pl);
                }
                });
                dojo.forEach(pmap.graphicsLayerIds, function (glayerId) {
                if ((glayerId.toLowerCase().indexOf("_layer") > 0) && (pmap.getLayer(glayerId).visible)) {
                var pl = new esri.tasks.LegendLayer();
                pl.layerId = glayerId;
                printlegendlayers.push(pl);
                }
                });*/
                var layoutOptions = {
                    //'authorText': 'EPA',
                    'copyrightText': versionText,
                    'titleText': printtitle
                    //'legendLayers': printlegendlayers,
                    //'scalebarUnit': (i18n.viewer.main.scaleBarUnits === 'english') ? 'Miles' : 'Kilometers'
                };

                var printTask = new PrintTask(this.printmapurl);
                var template = new PrintTemplate();
                template.exportOptions = {
                    width: pmapwidth,
                    height: pmapheight,
                    dpi: 96
                };
                var playout = this.playoutNode.value;
                template.format = printformat;
                //template.layout = "MAP_ONLY";
                template.layout = playout;
                template.layoutOptions = layoutOptions;
                template.preserveScale = true;
                template.showAttribution = false;

                var params = new PrintParameters();
                params.map = this._map;
                params.template = template;
                this.addspining(e);
                var wobj = this;
                //alert(params.toJson().Web_Map_as_JSON);
                printTask.execute(params, function (result) {
                    wobj.removespining();
                    if (result.url) {
                        window.open(result.url);
                    }
                },
            function (error) {
                wobj.removespining();
                console.log(error);
            });
            }
        },
        addspining: function (event) {
            var offy = 0;

            var x;
            var y;
            if (event.x != undefined && event.y != undefined) {

                x = event.clientX;
                y = event.clientY;

            }
            else // Firefox method to get the position
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
                document.body.appendChild(dummy); ;
            }

        },
        removespining: function () {

            if (document.getElementById("spindiv")) {
                var dummy = document.getElementById("spindiv");
                document.body.removeChild(dummy);
            }
        }

    });

    return printWidget;
});




