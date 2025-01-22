define(

    ['dojo/_base/declare',
        "dojo/_base/lang",
        "dojo/on",
        "dojo/dom",
        "dojo/dom-construct",
        'dijit/_Widget',
        'dijit/_Templated',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dojo/Evented',
        "dijit/registry",
        "dijit/form/HorizontalSlider",
        "dojox/form/RangeSlider",
        "dijit/form/HorizontalRule",
        "dijit/form/HorizontalRuleLabels",
        "esri/tasks/QueryTask",
        "esri/tasks/support/Query",
        "esri/tasks/support/StatisticDefinition",
        'dojo/text!mapdijit/templates/demogfilter.html'

    ],
    function(
        declare,
        lang,
        on,
        dom,
        domConstruct,
        _Widget,
        _Templated,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Evented,
        registry,
        HorizontalSlider,
        RangeSlider,
        HorizontalRule,
        HorizontalRuleLabels,
        QueryTask,
        Query,
        StatisticDefinition,
        dijittemplate
    ) {

        var DemogFilter = dojo.declare([dijit._Widget, dijit._Templated], {
            templateString: dijittemplate,
            widgetsInTemplate: true,
            constructor: function(options) {

                // mixin constructor options 
                dojo.safeMixin(this, options);


            },

            startup: function() {
                this.inherited(arguments);

            },

            postCreate: function() {
                var mapid = this.tocrow.rootLayer.renderobj.mid;
                var fieldid = this.tocrow.rootLayer.renderobj.fid;
                var dinfoobj = demogJSON[mapid].dynamiclayers[fieldid];
                var level = this.tocrow.rootLayer.renderobj.actlayer;
                var min = dinfoobj[level + "_min"];
                var max = dinfoobj[level + "_max"];
                var cmin = min;
                //if (dinfoobj[level + "_currentmin"]) cmin = dinfoobj[level + "_currentmin"];
                var cmax = max;
                //if (dinfoobj[level + "_currentmax"]) cmax = dinfoobj[level + "_currentmax"];
                if (dinfoobj["ranges"][level]) {
                    cmin = dinfoobj["ranges"][level]["min"];
                    cmax = dinfoobj["ranges"][level]["max"];
                }
                if (cmax > max) cmax = max;
                if (cmin < min) cmin = min;
                this._setSlider(min, max, cmin, cmax);
            },
            _getStatFull: function() {
                var mapid = this.tocrow.rootLayer.renderobj.mid;
                var fieldid = this.tocrow.rootLayer.renderobj.fid;
                var dinfoobj = demogJSON[mapid].dynamiclayers[fieldid];
                var level = this.tocrow.rootLayer.renderobj.actlayer;
                var min = dinfoobj[level + "_min"];
                var max = dinfoobj[level + "_max"];
                var mean = dinfoobj[level + "_mean"];
                var std = dinfoobj[level + "_std"];
                var statstr = "";
                statstr = statstr + "<table border=0>";
                statstr = statstr + "<tr><td>Min:</td><td>" + Number(min).toFixed(2) + ";</td>";
                statstr = statstr + "<td>Max:</td><td>" + Number(max).toFixed(2) + "</td></tr>";
                statstr = statstr + "<tr><td>Mean:</td><td>" + Number(mean).toFixed(2) + ";</td>";
                statstr = statstr + "<td>Std:</td><td>" + Number(std).toFixed(2) + "</td</tr>";
                statstr = statstr + "</table>";
                this.statdiv.innerHTML = statstr;


            },
            _getStatBox: function() {
                var mapid = this.tocrow.rootLayer.renderobj.mid;
                var fieldid = this.tocrow.rootLayer.renderobj.fid;
                var level = this.tocrow.rootLayer.renderobj.actlayer;
                var lindex = demogJSON[mapid].baselayers[level].layeridx;
                var defarray = [];
                var statDef1 = new StatisticDefinition();
                statDef1.statisticType = "max";
                statDef1.onStatisticField = fieldid;
                statDef1.outStatisticFieldName = "MAX_" + fieldid;
                var statDef2 = new StatisticDefinition();
                statDef2.statisticType = "min";
                statDef2.onStatisticField = fieldid;
                statDef2.outStatisticFieldName = "MIN_" + fieldid;
                var statDef3 = new StatisticDefinition();
                statDef3.statisticType = "stddev";
                statDef3.onStatisticField = fieldid;
                statDef3.outStatisticFieldName = "STD_" + fieldid;
                var statDef4 = new StatisticDefinition();
                statDef4.statisticType = "avg";
                statDef4.onStatisticField = fieldid;
                statDef4.outStatisticFieldName = "AVG_" + fieldid;
                defarray.push(statDef1);
                defarray.push(statDef2);
                defarray.push(statDef3);
                defarray.push(statDef4);
                var demogqueryurl = demogJSON[mapid].layerurl + demogJSON[mapid].service + "/MapServer/" + lindex;
                var queryTask = new QueryTask(demogqueryurl);
                var query = new Query();
                query.outFields = ["*"];

                query.returnGeometry = false;
                query.geometry = this.mapView.extent;

                query.outStatistics = defarray;
                var wobj = this;
                queryTask.execute(query).then(function(result) {
                    var features = result.features;
                    if (features.length == 1) {
                        var atts = features[0].attributes;
                        var min = atts["MIN_" + fieldid];
                        var max = atts["MAX_" + fieldid];
                        var mean = atts["AVG_" + fieldid];
                        var std = atts["STD_" + fieldid];
                        var statstr = "";
                        statstr = statstr + "<table border=0>";
                        statstr = statstr + "<tr><td>Min:</td><td>" + Number(min).toFixed(2) + ";</td>";
                        statstr = statstr + "<td>Max:</td><td>" + Number(max).toFixed(2) + "</td></tr>";
                        statstr = statstr + "<tr><td>Mean:</td><td>" + Number(mean).toFixed(2) + ";</td>";
                        statstr = statstr + "<td>Std:</td><td>" + Number(std).toFixed(2) + "</td</tr>";
                        statstr = statstr + "</table>";
                        wobj.statdiv.innerHTML = statstr;
                    }
                },function(error){
                // Print error if promise is rejected
                    console.error(error);
                });


            },
            _setSlider: function(smin, smax, cmin, cmax) {
                var slider = this.pixelSlider;

                slider.minimum = smin;
                slider.maximum = smax;
                slider.set("value", [cmin, cmax]);

                // hook up slider events
                //slider.on("mouseup", lang.hitch(this, this._FilterByValue));
                //slider.on("change", lang.hitch(this, this._FilterByValue));
                this.mintextbox.value = cmin;
                this.maxtextbox.value = cmax;
                //set up slider labels
                var sliderLabels = new HorizontalRuleLabels({
                    container: "bottomDecoration",
                    labels: [smin.toFixed(0).toString(), smax.toFixed(0).toString()]
                }, domConstruct.create("div", {}, this.pixelLabels));

            },
            _movetick: function(e) {
                var minvalue = this.mintextbox.value;
                var maxvalue = this.maxtextbox.value;
                console.log("box values:" + minvalue + ";" + maxvalue);
                this.pixelSlider.set("value", [minvalue, maxvalue]);
                this._FilterByValue();
            },

            _FilterByValue: function() {

                var mapid = this.tocrow.rootLayer.renderobj.mid;
                var fname = this.tocrow.rootLayer.renderobj.fid;

                var level = this.tocrow.rootLayer.renderobj.actlayer;
                var lindex = demogJSON[mapid].baselayers[level].layeridx;
                var serviceid = this.tocrow.rootLayer.id;

                var val = this.pixelSlider.get("value");
                var minvalue = Math.floor(val[0]);
                var maxvalue = Math.floor(val[1]);
                this.mintextbox.value = minvalue;
                this.maxtextbox.value = maxvalue;

                var dinfoobj = demogJSON[mapid].dynamiclayers[fname];
                if (dinfoobj["ranges"][level]) delete dinfoobj["ranges"][level];

                var min = Math.floor(dinfoobj[level + "_min"]);
                var max = Math.floor(dinfoobj[level + "_max"]);


                var numRegExp = /(^-?[\d|.]+$)/;
                if (numRegExp.test(minvalue) && numRegExp.test(maxvalue)) {
                    //document.getElementById("statdiv").innerHTML = "";
                    if ((min == minvalue) && (max == maxvalue)) {
                        if (this.mapView.map.findLayerById(serviceid)) {
                            this.mapView.map.findLayerById(serviceid).findSublayerById(lindex).definitionExpression = null;

                        }
                        this.tocrow.filterContentNode.innerHTML = "";
                    } else {
                        var wherestr = fname + ">=" + minvalue + " and " + fname + "<=" + maxvalue;


                        dinfoobj["ranges"][level] = {};
                        dinfoobj["ranges"][level].whereclause = wherestr;
                        dinfoobj["ranges"][level].min = minvalue;
                        dinfoobj["ranges"][level].max = maxvalue;

                        this.tocrow.filterContentNode.innerHTML = "(Filter range: " + minvalue + " - " + maxvalue + ")";

                        //console.log(wherestr + "; " + lindex +"; " + serviceid);
                        if (this.mapView.map.findLayerById(serviceid)) {
                            var currentlayer = this.mapView.map.findLayerById(serviceid);
                            currentlayer.findSublayerById(lindex).definitionExpression = wherestr;
                        }
                    }
                    this.tocrow.rootLayer.renderobj.ranges = dinfoobj["ranges"];

                } else {
                    alert("Enter number only!");
                }

            },
            _clearFilter: function() {
                var serviceid = this.tocrow.rootLayer.id;
                var mapid = this.tocrow.rootLayer.renderobj.mid;
                var fieldid = this.tocrow.rootLayer.renderobj.fid;
                var dinfoobj = demogJSON[mapid].dynamiclayers[fieldid];
                var level = this.tocrow.rootLayer.renderobj.actlayer;
                var lindex = demogJSON[mapid].baselayers[level].layeridx;
                var min = dinfoobj[level + "_min"];
                var max = dinfoobj[level + "_max"];
                if (this.mapView.map.findLayerById(serviceid)) {
                    this.mapView.map.findLayerById(serviceid).findSublayerById(lindex).definitionExpression = null;

                }
                if (demogJSON[mapid].dynamiclayers[fieldid]["ranges"][level]) {
                    delete demogJSON[mapid].dynamiclayers[fieldid]["ranges"][level];
                }

                this.mintextbox.value = min;
                this.maxtextbox.value = max;
                this.pixelSlider.set("value", [min, max]);
                this.tocrow.rootLayer.renderobj.ranges = dinfoobj["ranges"];

            },
            _closeDialog: function() {
                dijit.popup.close(this.dialog);
                this.dialog.opened_ = false;
            },

            destroy: function() {
                dojo.empty(this.domNode);
                this.inherited(arguments);
            }
        });
        return DemogFilter;
    });