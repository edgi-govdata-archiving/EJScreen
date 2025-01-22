define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/on",
	"dojo/dom-construct",
	"dijit/_Widget",
	"dijit/_Templated",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/Evented",
	"dijit/form/Form",
	"dijit/form/RadioButton",
	"dijit/form/DropDownButton",
	"dijit/form/Button",
	"dijit/form/TextBox",
	"dijit/form/ComboBox",
	"dijit/form/FilteringSelect",
	"dojox/layout/FloatingPane",
	"dojo/text!mapdijit/templates/MapOther.html",
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
	"esri/PopupTemplate",
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
	Form,
	RadioButton,
	DropDownButton,
	Button,
	TextBox,
	ComboBox,
	FilteringSelect,
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
	var sampleURL = {
		arcgis: {
			url: "https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer/0,1",
			note: "(http://&lt;server&gt;/arcgis/rest/services/&lt;service name&gt;/MapServer)",
		},
		wms: {
			url: "https://sampleserver1.arcgisonline.com/arcgis/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer/WMSServer?layers=1,2",
			note: "<font color=red>Note: WMS service will not overlay well if the service does not have Mercator projection available.</font>",
		},
		kml: {
			url: "https://files.airnowtech.org/airnow/today/airnow_today.kml",
			note: "<font color=red>Note: The KML/KMZ url must be publicly accessible.</font>",
		},
		georss: {
			url: "https://arcgis.github.io/arcgis-samples-javascript/sample-data/layers-georss/sample-georss.xml",
			note: "<font color=red>Note: The GeoRSS url must be publicly accessible.</font>",
		},
	};
	var MapOther = declare(
		[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],
		{
			templateString: dijittemplate,

			widgetsInTemplate: true,
			constructor: function (options, srcRefNode) {
				options = options || {};
				if (!options.view) {
					console.log(
						"mapdijit.MapOther: unable to find the 'view' property in parameters"
					);
					return;
				}
				this.mapview = options.view;

				this.servicetype = "arcgis";
				// mixin constructor options
				dojo.safeMixin(this, options);
			},

			startup: function () {
				this.inherited(arguments);
			},
			postCreate: function () {
				this._doService();
			},
			_doService: function () {
				var stype = "arcgis";
				dojo.query("[name=layerType]").filter(function (radio) {
					if (radio.checked) stype = radio.value;
				});
				this.servicetype = stype;
				this.urlNode.value = "http://";
				this.titleNode.value = "";

				document.getElementById("notediv1").innerHTML = sampleURL[stype].note;
				document.getElementById("samplediv").innerHTML =
					"Sample URL: <br/>" + sampleURL[stype].url;
			},
			_addRemoteLyr: function () {
				var svcurl = this.urlNode.value;
				svcurl = dojo.trim(svcurl);
				var svctype = this.servicetype;

				if (svcurl.substr(0, 4).toLowerCase() != "http") {
					alert("invalid URL. Please enter a url starts with 'http'!");
					return false;
				}
				var stitle = this.titleNode.value;
				var rid = this._getUniqueId(svctype);
				if (stitle.length == 0 && svctype != "arcgis") stitle = rid;
				this._addServiceLayer(svctype, svcurl, rid, stitle);
			},
			_addServiceLayer: function (stype, surl, sid, stitle) {
				var map = this.mapview.map;
				var othermapid = "other_map";
				var mapids = ["demog_map", "ejindex_map", "other_map", "more_map", "threshold_map"];
				for (var i = 0; i < mapids.length; i++) {
					if (map.findLayerById(mapids[i])) {
						map.remove(map.findLayerById(mapids[i]));
					}
				}
				var httpreg = /^http:\/\//i;
				if (httpreg.test(surl)) {
					var domainurl = surl;
					var domainpat = /^http:\/\/[A-Za-z0-9_\.]+\//i;
					var match = surl.match(domainpat);
					if (match != null) {
						domainurl = match[0];
					}
					esriConfig.request.proxyRules = {
						urlPrefix: domainurl,
						proxyUrl: "proxy.ashx",
					};
					esriConfig.request.corsEnabledServers.push(domainurl);
				}
				var labid = mapsJson[this.mapview.id].labelid;
				dojo.byId(labid).innerHTML = stitle;
				switch (stype.toLowerCase()) {
					case "arcgis":
						var agspattern = /\/rest\/services/i;
						if (agspattern.test(surl)) {
							if (surl.substr(surl.length - 1) == "/")
								surl = surl.substr(0, surl.length - 1);
							var agsurl = surl;
							var layerids = "";
							var featpattern = /\/featureserver/i;
							var dynpattern = /\/mapserver/i;
							var imagepattern = /\/imageserver/i;
							if (featpattern.test(surl)) {
								var fpattern = /\/featureserver$/i;
								var spattern = /\/featureserver\/\d+$/i;
								if (fpattern.test(surl)) {
									esriRequest(agsurl, {
										query: { f: "json" },
										responseType: "json",
										callbackParamName: "callback",
									})
										.then(function (r) {
											if (r.data.layers) {
												for (var m = 0; m < r.data.layers.length; m++) {
													var layerid = r.data.layers[m].id;
													var featurl = agsurl + "/" + layerid;
													var ftemplate = new PopupTemplate();
													ftemplate.content = "{*}";
													var templayer = new FeatureLayer(featurl, {
														mode: FeatureLayer.MODE_ONDEMAND,
														id: othermapid,
														popupTemplate: ftemplate,
														outFields: ["*"],
													});
													map.add(templayer);
												}
											}
										})
										.catch(function (e) {
											alert(
												"error occurred on getting feature layers:" + e.message
											);
										});
								} else if (spattern.test(surl)) {
									var ftemplate = new PopupTemplate();
									//ftemplate.title = "title";
									ftemplate.content = "{*}";
									var templayer = new FeatureLayer(surl, {
										mode: FeatureLayer.MODE_ONDEMAND,
										id: othermapid,
										popupTemplate: ftemplate,
										outFields: ["*"],
									});
									map.add(templayer);
								}
							}
							if (dynpattern.test(surl)) {
								var endpos = surl.toLowerCase().indexOf("/mapserver");
								var agsurl = surl.substr(0, endpos + 10);
								/*                             var vlayers = [];
                                                            if (surl.length > parseInt(endpos + 11)) {

                                                                    layerids = surl.substr(endpos + 11).split(",");
                                                                    for (var j=0; j< layerids.length; j++) {
                                                                        console.log("onlayer: " + layerids[j]);
                                                                        var slyr = {};
                                                                        slyr.id = layerids[j];
                                                                        slyr.visible = true;
                                                                        vlayers.push(slyr);
                                                                    }

                                                            } */

								var templayer = new MapImageLayer(agsurl, {
									id: othermapid,
									title: stitle,
									opacity: 1,
								});
								//if (vlayers.length > 0) templayer.sublayers = vlayers;
								map.add(templayer);

								templayer.on("layerview-create", function (event) {
									if (surl.length > parseInt(endpos + 11)) {
										var layerids = surl.substr(endpos + 11).split(",");
										templayer.allSublayers.map(function (sublyr) {
											var vstatus = false;
											for (var j = 0; j < layerids.length; j++) {
												if (sublyr.id == layerids[j]) {
													vstatus = true;
												}
											}
											sublyr.visible = vstatus;
										});
									} else {
										templayer.allSublayers.map(function (sublyr) {
											sublyr.visible = true;
										});
									}
								});
							}
							if (imagepattern.test(surl)) {
								var templayer = new ImageryLayer({
									url: surl,
									id: othermapid,
									legendEnabled: true,
									format: "jpgpng", // server exports in either jpg or png format
								});
								map.add(templayer);
							}
						} else {
							alert("Invalid ArcGIS map service URL.");
							return false;
						}
						break;
					case "wms":
						var wmsarray = surl.split("?");
						var wmsbaseurl = wmsarray[0];
						var wmsparas = unescape(wmsarray[1]);
						var paras = wmsparas.split("&");

						var wmsLayer = new WMSLayer({
							url: wmsbaseurl,
							id: othermapid,
							title: stitle,
							legendEnabled: true,
						});
						map.add(wmsLayer);
						//if (wmslayers.length > 0) wmsLayer.sublayers = wmslayers;
						for (var m = 0; m < paras.length; m++) {
							var pairstr = paras[m];
							if (pairstr.split("=")[0].toLowerCase() == "layers") {
								players = pairstr.split("=")[1];
								if (players.length > 0) {
									var parray = players.split(",");
									wmsLayer.on("layerview-create", function (event) {
										wmsLayer.sublayers.map(function (sublyr) {
											var vstatus = false;
											for (var k = 0; k < parray.length; k++) {
												if (sublyr.id == parray[k]) vstatus = true;
											}
											sublyr.visible = vstatus;
										});
									});
								}
							}
						}

						break;
					case "kml":
						var kml = new KMLLayer(surl, { id: othermapid, title: stitle });
						map.add(kml);

						break;
					case "georss":
						var georss = new GeoRSSLayer(surl, {
							id: othermapid,
							title: stitle,
						});
						map.add(georss);

						break;
					case "feature":
						var templayer = new FeatureLayer(surl, {
							mode: FeatureLayer.MODE_ONDEMAND,
							id: othermapid,
							title: stitle,
							outFields: ["*"],
						});
						map.add(templayer);

						break;
				}
				dojo.byId("theme").style.display = "none";
			},
			errorHandler: function (err) {
				alert("error occurred: " + err.message);
			},

			_getUniqueId: function (svctype) {
				var ulayerid = "";
				var scount = 1;
				var condition = true;
				while (condition) {
					if (this.mapview.map.findLayerById(svctype + scount)) {
						scount = scount + 1;
						contition = true;
					} else {
						ulayerid = svctype + scount;
						condition = false;
					}
				}
				return ulayerid;
			},
			destroy: function () {
				//this.Render.destroy();
				dojo.empty(this.domNode);
				this.inherited(arguments);
			},
		}
	);
	return MapOther;
});
