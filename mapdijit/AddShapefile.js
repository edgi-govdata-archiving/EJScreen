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
        "dojo/text!mapdijit/templates/AddShapefile.html",
        "esri/request",
        "esri/PopupTemplate",
        "dojo/sniff",
        "esri/layers/FeatureLayer",
        "esri/geometry/Point",
        "esri/geometry/Polygon",
        "esri/Graphic",
        "esri/layers/support/Field",
        "esri/geometry/Polyline",
        "mapdijit/IDinfoWindow"

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
        esriRequest,
        PopupTemplate,
        sniff,
        FeatureLayer,
        Point,
        Polygon,
        Graphic,
        Field,
        Polyline,
        IDinfoWindow

    ) {

        var portalUrl = "https://www.arcgis.com";
        var AddShapefile = declare([_WidgetBase, _TemplatedMixin], {
            templateString: dijittemplate,
            constructor: function(options, srcRefNode) {

                options = options || {};
                if (!options.view) throw new Error("no map view defined in params for AddShapefile widget.");

                this.view = options.view;

                this.shapefilename = "";

            },

            startup: function() {


            },
            postCreate: function() {

            },
            _submitFile: function(event) {
                var fileName = event.target.value.toLowerCase();
                var go = this.getFilesize(event.target);
                if (go) {
                    if (sniff("ie")) { //filename is full path in IE so extract the file name
                        var arr = fileName.split("\\");
                        fileName = arr[arr.length - 1];
                    }
                    if (fileName.indexOf(".zip") !== -1) { //is file a zip - if not notify user
                        this._addShapefile(fileName);
                    } else {
                        this.statusNode.innerHTML = '<p style="color:red">Add shapefile as .zip file</p>';
                    }
                }
            },
            getFilesize: function(filepath) {
                if (window.ActiveXObject) {
                    var fso = new ActiveXObject("Scripting.FileSystemObject");

                    var thefile = fso.getFile(filepath.value);
                    var sizeinbytes = thefile.size;
                } else {
                    var sizeinbytes = filepath.files[0].size;
                }

                var fSExt = new Array('Bytes', 'KB', 'MB', 'GB');
                fSize = sizeinbytes / 1024 / 1024;
                var sizemb = Math.round(fSize * 100) / 100;
                //alert(sizemb);
                if (sizemb < 10.1) {
                    return true;
                } else {
                    var errormsg = "The input shapefile exceeds the 10MB maximum allowed file size.";
                    this.statusNode.innerHTML = "<p style='color:red'>" + errormsg + "</p>";
                    return false;
                }
            },
            _addShapefile: function(fileName) {
                var self = this;
                var name = fileName.split(".");
                var tmpname = name[0];
                var lastn = tmpname.lastIndexOf("\\");
                var shortname = tmpname.substring(lastn + 1);

                this.shapefilename = shortname;
                this.statusNode.innerHTML = '<b>Loading… </b>' + shortname;



                var params = {
                    'name': shortname,
                    'targetSR': this.view.map.spatialReference,
                    'maxRecordCount': 4000,
                    'enforceInputFileSizeLimit': true,
                    'enforceOutputJsonSizeLimit': true
                };



                //generalize features for display Here we generalize at 1:40,000 which is approx 10 meters
                //This should work well when using web mercator.
                var resolution = this.view.resolution;
                params.generalize = true;
                params.maxAllowableOffset = resolution;
                params.reducePrecision = true;
                params.numberOfDigitsAfterDecimal = 0;
                var myContent = {
                    filetype: "shapefile",
                    publishParameters: JSON.stringify(params),
                    f: "json"
                };

                esriRequest(portalUrl + "/sharing/rest/content/features/generate", {
                        query: myContent,
                        body: self.uploadForm,
                        responseType: "json"
                    })
                    .then(function(response) {
                        var layerName = response.data.featureCollection.layers[0].layerDefinition.name;
                        self.statusNode.innerHTML = '<b>Loaded: </b>' + layerName;
                        self.addShapefileToMap(response.data.featureCollection);
                    })
                    .catch(self.errorHandler);
                /* var input = document.querySelector('input[type="file"]');
                var data = input.files[0];
                var formdata = new FormData();
                formdata.append('filetype', 'shapefile');
                formdata.append('publishParameters', JSON.stringify(params));
                formdata.append('f', 'json');
                formdata.append('file', data);
                
                fetch(portalUrl + '/sharing/rest/content/features/generate', {
                    method: 'post',
                    body: formdata
                }).then(function(response) {
                    return response.json();
                }).then(function(response) {
                    if (!response) {
                        if (response.error) {
                            this.errorHandler(response.error);
                            return;
                        }
                    }
                    var layerName = response.featureCollection.layers[0].layerDefinition.name;
                    self.statusNode.innerHTML = '<b>Loaded: </b>' + layerName;
                    self.addShapefileToMap(response.featureCollection);

                }); */
            },


            errorHandler: function(error) {
                var errormsg = error.message;
                if (error.details) {
                    errormsg += "<br />" + error.details[0];
                }
                this.statusNode.innerHTML = "<p style='color:red'>" + errormsg + "</p>";
            },

            addShapefileToMap: function(featureCollection) {
                var lname = this.shapefilename;
                var ptemp = new PopupTemplate();
                ptemp.title = lname;
                ptemp.content = lang.hitch(this, this.idDesc)
                var sourceGraphics = [];
                var layers = featureCollection.layers.map(function(layer) {
                    var graphics = layer.featureSet.features.map(function(feature) {
                        return Graphic.fromJSON(feature);
                    });
                    sourceGraphics = sourceGraphics.concat(graphics);
                    var featureLayer = new FeatureLayer({
                        popupTemplate: ptemp,
                        objectIdField: "FID",

                        title: lname,
                        layerType: "shapefile",
                        source: graphics,
                        fields: layer.layerDefinition.fields.map(function(field) {
                            return Field.fromJSON(field);
                        })
                    });

                    return featureLayer;
                    // associate the feature with the popup on click to enable highlight and zoom to
                });
                this.view.map.addMany(layers);
                this.view.goTo(sourceGraphics);

                this.statusNode.innerHTML = "";
            },
            idDesc: function(e) {


                var infowidget = new IDinfoWindow({
                    view: this.view,
                    idgraphic: e.graphic
                }, domConstruct.create('div'));
                infowidget.startup();

                return infowidget.domNode;

            },
            destroy: function() {

                dojo.empty(this.domNode);

            }

        });


        return AddShapefile;

    });