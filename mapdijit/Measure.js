define(

    ['dojo/_base/declare',
        "dojo/_base/lang",
        "dojo/on",
        "dojo/dom",
        "dojo/dom-construct",
        'dojo/dom-class',
        'dijit/_Widget',
        'dijit/_Templated',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dojo/Evented',
        "dojo/text!mapdijit/templates/Measure.html",
        "esri/widgets/DistanceMeasurement2D",
        "esri/widgets/AreaMeasurement2D"
    ],
    function(
        declare,
        lang,
        on,
        dom,
        domConstruct,
        domClass,
        _Widget,
        _Templated,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Evented,
        dijittemplate,
        DistanceMeasurement2D,
        AreaMeasurement2D
    ) {

        var Measure = declare("mapdijit.Measure", [_WidgetBase, _TemplatedMixin], {
            templateString: dijittemplate,
            widgetsInTemplate: false,
            constructor: function(options, srcRefNode) {

                options = options || {};
                if (!options.view) throw new Error("no map defined in params for Measure widget.");

                this.mapView = options.view;
                dojo.safeMixin(this, options);

            },

            startup: function() {


            },
            postCreate: function() {
                this.activeWidget = null;
            },
            activearea: function(e) {
                domClass.remove(this.lineNode, "active");
                domClass.remove(this.pntNode, "active");
                domClass.add(this.areaNode, "active");
                this.setActiveWidget('area');
            },
            activedist: function(e) {
                domClass.remove(this.areaNode, "active");
                domClass.remove(this.pntNode, "active");
                domClass.add(this.lineNode, "active");
                this.setActiveWidget('distance');
            },
            activepoint: function(e) {
                domClass.remove(this.areaNode, "active");
                domClass.remove(this.lineNode, "active");
                domClass.add(this.pntNode, "active");
                this.setActiveWidget('point');
            },
            setActiveWidget: function(type) {
                //this.measureresult.innerHTML = "";
                if (this.activeWidget != null) {
                    this.activeWidget.destroy();
                    this.activeWidget = null;
                }
                //dojo.empty(this.measureresult);
                var pandiv = document.createElement("div");
                pandiv.id = "measurecontentdiv";
                this.measureresult.appendChild(pandiv);
                switch (type) {
                    case "point":
                        this.activeWidget = new locatePoint({
                            view: this.mapView
                        }, 'measurecontentdiv');


                        break;
                    case "distance":
                        this.activeWidget = new DistanceMeasurement2D({
                            view: this.mapView,
                            unit: "miles",
                            container: "measurecontentdiv"
                        });

                        // skip the initial 'new measurement' button
                        this.activeWidget.viewModel.newMeasurement();
                        //this.mapView.ui.add(activeWidget, "bottom-right");
                        //this.measureresult.appendChild(activeWidget.domNode);

                        break;
                    case "area":
                        this.activeWidget = new AreaMeasurement2D({
                            view: this.mapView,
                            unit: "square-miles",
                            container: "measurecontentdiv"
                        });

                        // skip the initial 'new measurement' button
                        this.activeWidget.viewModel.newMeasurement();
                        //this.mapView.ui.add(activeWidget, "bottom-right");
                        //this.measureresult.appendChild(activeWidget.domNode);

                        break;

                }
            },
            closepane: function() {
                if (this.activeWidget != null) {
                    this.activeWidget.destroy();
                    this.activeWidget = null;
                    domClass.remove(this.areaNode, "active");
                    domClass.remove(this.lineNode, "active");
                    domClass.remove(this.pntNode, "active");
                }
            },
            destroy: function() {

                dojo.empty(this.domNode);

            }

        });
        var locatePoint = declare([_Widget, _Templated], {

            templateString: "<div style='margin: 10px;'>Click/move on the map to get latitude, longitude.<br />" +
                "<table style='width:100%; text-align: center;'><tr><td>Latitude</td><td>Longitude</td></tr>" +
                "<tr><td><span data-dojo-attach-point='moveLatitude'></span></td>" +
                "<td><span data-dojo-attach-point='moveLongitude'></span></td></tr>" +
                "<tr><td><span data-dojo-attach-point='clickLatitude'></span></td>" +
                "<td><span data-dojo-attach-point='clickLongitude'></span></td></tr>" +
                "</table></div>",
            widgetsInTemplate: false,
            constructor: function(options) {

                options = options || {};
                if (!options.view) throw new Error("no map defined in params.");
                this.mapView = options.view;
            },

            startup: function() {
                this.inherited(arguments);

            },
            postCreate: function() {

                var _self = this;
                /* this.mapView.watch(["stationary"], function() {
                    _self.showCoordinates(_self.view.center);
                }); */

                //*** Add event to show mouse coordinates on click and move ***//
                var movehandle = this.mapView.on("pointer-move", function(evt) {
                    var pt = _self.mapView.toMap({ x: evt.x, y: evt.y });
                    _self.moveLatitude.innerHTML = pt.latitude.toFixed(6);
                    _self.moveLongitude.innerHTML = pt.longitude.toFixed(6);

                });
                var downhandle = this.mapView.on("pointer-down", function(evt) {
                    var pt = _self.mapView.toMap({ x: evt.x, y: evt.y });
                    _self.clickLatitude.innerHTML = pt.latitude.toFixed(6);
                    _self.clickLongitude.innerHTML = pt.longitude.toFixed(6);
                });
                this.own(movehandle);
                this.own(downhandle);
            },
            showCoordinates: function(pt) {
                var coords = "Lat/Lon " + pt.latitude.toFixed(3) + " " + pt.longitude.toFixed(3);
                this.coordsdiv.innerHTML = coords;
            },
            destroy: function() {
                dojo.empty(this.domNode);
                this.inherited(arguments);
            }
        });
        return Measure;
    });