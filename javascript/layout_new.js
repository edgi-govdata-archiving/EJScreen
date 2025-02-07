/// <reference path="../mapdijit/suggestlayers.js" />
require([
	"dojo/parser",
	"dojo/ready",
	"dojo/dom-construct",
	"dojo/on",
	"dojo/promise/all",
	"dojo/_base/lang",
	"esri/views/MapView",
	"esri/Map",
	"esri/WebMap",
	"esri/config",
	"esri/request",
	"esri/core/urlUtils",
	"esri/layers/MapImageLayer",
	"esri/layers/TileLayer",
	"esri/widgets/Print",
	"esri/Basemap",
	"esri/widgets/BasemapGallery",
	"esri/widgets/BasemapGallery/support/PortalBasemapsSource",
	"esri/portal/Portal",
	"esri/widgets/LayerList",
	"esri/widgets/BasemapToggle",
	"esri/geometry/Extent",
	"esri/geometry/Point",
	"esri/Graphic",
	"esri/layers/FeatureLayer",
	"esri/layers/GraphicsLayer",
	"esri/PopupTemplate",
	"esri/widgets/Search",
	"esri/tasks/QueryTask",
	"esri/tasks/support/Query",
	"esri/tasks/IdentifyTask",
	"esri/tasks/support/IdentifyParameters",
	"esri/widgets/Expand",
	"esri/widgets/ScaleBar",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/MapEJIndexMod.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/Places.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/MapDemographics.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/ThresholdWidget.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/AddShapefile.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/TOC.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/Measure.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/ejChart.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/ejKnownGeo.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/EJreport.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/EJtable.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/SearchServices.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/SearchGISweb.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/EJinfoWindow.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/IDinfoWindow.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/IDinfoWindowDemog.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/IDinfoWindowEJ.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/IDinfoWindowThreshold.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/EJSessions.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/SaveSessions.js",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/SuggestLayers.js",
	"dijit/layout/ContentPane",
	"dojox/layout/FloatingPane",
	"dijit/Toolbar",
	"dijit/form/ToggleButton",
	"dijit/form/Button",
	"dijit/form/DropDownButton",
	"dijit/PopupMenuItem",
	"dijit/Menu",
	"dijit/MenuItem",
	"esri/layers/WebTileLayer",
	"dojo/_base/declare",
	"dojo/dnd/move",
	"dojo/dom-style",
	"dojo/domReady!",
], function (
	parser,
	ready,
	domConstruct,
	on,
	all,
	lang,
	MapView,
	MapEsri, //rename since native JS 'Map' object is used also
	WebMap,
	esriConfig,
	esriRequest,
	urlUtils,
	MapImageLayer,
	TileLayer,
	Print,
	Basemap,
	BasemapGallery,
	PortalBasemapsSource,
	Portal,
	LayerList,
	BasemapToggle,
	Extent,
	Point,
	Graphic,
	FeatureLayer,
	GraphicsLayer,
	PopupTemplate,
	Search,
	QueryTask,
	Query,
	IdentifyTask,
	IdentifyParameters,
	Expand,
	ScaleBar,
	MapEJIndexMod,
	Places,
	MapDemographics,
	ThresholdWidget,
	AddShapefile,
	TOC,
	Measure,
	ejChart,
	ejKnownGeo,
	EJreport,
	EJtable,
	SearchServices,
	SearchGISweb,
	EJinfoWindow,
	IDinfoWindow,
	IDinfoWindowDemog,
	IDinfoWindowEJ,
	IDinfoWindowThreshold,
	EJSessions,
	SaveSessions,
	SuggestLayers,
	ContentPane,
	FloatingPane,
	dijitToolbar,
	ToggleButton,
	Button,
	DropDownButton,
	PopupMenuItem,
	Menu,
	MenuItem,
	WebTileLayer,
	declare,
	move,
	domStyle
	) {
		var searchstr = getQueryVariable("wherestr");
		if (!searchstr || searchstr == "") searchstr = "";
		else {
			searchstr = unescape(searchstr);
			searchstr = searchstr.replace(/\+/g, " ");
			searchstr = dojo.trim(searchstr);
		}
		var idhandle = null;
		var toolbarsHash = {};
		var clon, clat;
		var zoomstatus = "bywebmap";
		var displayLocation = false;
		var pointsym = {
			// symbol used for points
			type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
			style: "cross",
			color: "rgba(255, 0, 255, 1.0)",
			size: "12px",
			outline: {
				// autocasts as new SimpleLineSymbol()
				color: "rgba(255, 0, 255, 1.0)",
				width: 1, // points
			},
		};
		var linesym = {
			// symbol used for polylines
			type: "simple-line", // autocasts as new SimpleMarkerSymbol()
			color: "#ff0000",
			width: "2",
			style: "solid",
		};
		var polysym = {
			// symbol used for polygons
			type: "simple-fill", // autocasts as new SimpleMarkerSymbol()
			color: "rgba(0, 255, 0, 0.25)",
			style: "solid",
			outline: {
				color: "red",
				width: 2,
			},
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
	
		var titlestr =
			"<table width='100%'><tr><td valign='bottom'>" +
			defaults.title +
			"</td>";
		titlestr =
			titlestr + "<td valign='middle' align='right'><span id='homelinks'>";
		// titlestr = titlestr + "<button type='button'  data-toggle='modal' data-target='#myModal'>Toggle Sidebar</button>";
		/*titlestr =
			titlestr +
			"<a href='" +
			homeappurl +
			"' alt='Go to EJScreen home page' title='Go to EJScreen home page'>EJScreen Website</a>";
		 titlestr =
			titlestr +
			" | <a href='mobile/index.html' alt='Go to EJScreen mobile page' title='Go to EJScreen mobile page'>Mobile</a>"; */
		// Report a bug here?
		titlestr =
			titlestr +
			"<a href='" +
			glossaryurl +
			"' alt='Go to EJScreen glossary page' title='Go to EJScreen glossary page' target='_blank'>Glossary</a>";
		titlestr =
			titlestr +
			" | <a href='" +
			helpfileurl +
			"' alt='Go to help page' title='Go to help page' target='_blank'>Help</a>";
		titlestr = titlestr + "</td></tr></table>";
		
	
		document.getElementById("webmapTitle").innerHTML = titlestr;
	
	var doTerritoryMessage = true;
		//show territory message on start
	if (localStorage.getItem("doTerritoryMessage")){
		doTerritoryMessage = localStorage.getItem("doTerritoryMessage");
	}
	
	//check var for message, only want to show on first load or after cache cleared
	if (doTerritoryMessage == true){
		showTerritoryMessage("webmapSubTitle","viewDiv");
	}
	
	var doSplashScreen = true;
				//show territory message on start
			if (localStorage.getItem("doSplashScreen")){
				doSplashScreen = localStorage.getItem("doSplashScreen");
			}
			//var doSplashScreen = true;
			//check var for message, only want to show on first load or after cache cleared
			if (doSplashScreen === true){
				showSplashScreen();
			}
	
		esriConfig.request.proxyUrl = proxyurl;
		if (searchstr.length > 0) {
			findloc(searchstr);
		} else {
			initMap();
		}
		//esriConfig.request.corsDetection = false;
	
		function initMap() {
			var webitemid = defaults.webmap;
			/* var webmap = new WebMap({
	  portalItem: {
		id: webitemid
	  }
	}); */
	
	//RW 3/22/24
	// create from a third party source
	
	/* esriConfig.request.proxyRules = {
		urlPrefix: "https://api.mapbox.com",
		proxyUrl: proxyurl,
	}; */
	
	// urlUtils.addProxyRule({
						// proxyUrl: proxyurl,
						// urlPrefix: "https://api.mapbox.com"
					// });	
	
	
	// const basemapRW = new Basemap({
	  // baseLayers: [
		// new WebTileLayer({
			  // //urlTemplate: "https://api.mapbox.com/styles/v1/awphall22/cltsnegtn01aa01p5d0jre2nt/tiles/256/{level}/{col}/{row}@2x?access_token=pk.eyJ1IjoiYXdwaGFsbDIyIiwiYSI6ImNsajY3enYzOTA5YXgzam1oZmF5Yms2enAifQ.7ciWpv7qPVD0rludyaOoWQ",
			  // urlTemplate: "https://api.mapbox.com/styles/v1/awphall22/cltsnegtn01aa01p5d0jre2nt/tiles/256/{level}/{col}/{row}@2x",
			  // //subDomains: ["a", "b", "c"] //RW 3/22 is this needed? What does it do? From ESRI sample
			  // copyright: '&copy; <a href="https://www.openstreetmap.org/about/" target="_blank">OpenStreetMap</a> contributors Design &copy <a href="https://www.mapbox.com/about/maps" target="_blank">Mapbox</a>'
					
			 
			// })
	  // ],
	  // thumbnailUrl: "https://js.arcgis.com/4.19/esri/images/basemap/gray.jpg"
	// });
	
	// const basemapRW = new Basemap({
		
	// portalItem: {
		// id: "2321381de944459f958337b3cb4a3fe9"  
	  // },
	  // thumbnailUrl: "https://js.arcgis.com/4.19/esri/images/basemap/gray.jpg"
	// });
	
	
	//end RW test
	
	//rename since native JS 'Map' object is used also
			var webmap = new MapEsri({
				//basemap: basemapRW
				//basemap: "streets-vector",
				basemap: "gray",
			});
			view = new MapView({
				map: webmap,
				//zoom: 12,
				//center: [-122.80569076534753,45.46825733691899],
				container: "viewDiv",
			});
			var scaleBar = new ScaleBar({
				view: view,
				container: "scalediv",
				style: "ruler",
				unit: "non-metric",
			});
			if (zoomstatus == "bycenter") {
				view.center = [clon, clat];
				view.zoom = 12;
			} else if (localStorage.getItem("ejscreenExtent")) {
				var extentstr = localStorage.getItem("ejscreenExtent");
	
				var extentjson = JSON.parse(extentstr);
				var mercatorExtent = new Extent(extentjson);
	
				view.extent = mercatorExtent;
			} else {
				view.center = [-122.80569076534753, 45.46825733691899];
				view.zoom = 12;
			}
	
			tocLegend = new TOC(
				{
					map: view.map, //Your map object *required
					layerInfos: [],
					container: "tocDiv",
					mapView: view,
				} // the <div> you want your TOC widget to be
			);
			tocLegend.startup();
	
			window.addEventListener("unload", saveExtent);
	
			view.when(function () {
				refreshTOC();
				view.map.layers.on("change", function (event) {
					var addcount = event.added.length;
					var removecount = event.removed.length;
					var updatetoc = false;
					for (var k = 0; k < addcount; k++) {
						if (event.added[k].type != "graphics") {
							if (event.added[k].layerType) {
								if (event.added[k].layerType != "digitize") updatetoc = true;
							} else {
								updatetoc = true;
							}
						}
						//if ((event.added[k].type != "graphics") && ((event.added[k].layerType) && (event.added[k].layerType != "digitize"))) updatetoc = true;
					}
					for (var m = 0; m < removecount; m++) {
						if (event.removed[m].type != "graphics") {
							if (event.removed[m].layerType) {
								if (event.removed[m].layerType != "digitize") updatetoc = true;
							} else {
								updatetoc = true;
							}
						}
						//if ((event.removed[m].type != "graphics") && ((event.removed[m].layerType) && (event.removed[m].layerType != "digitize"))) updatetoc = true;
					}
					/*console.log("Layer added: ", event.added.length);
					console.log("Layer removed: ", event.removed.length);
					console.log("update:" + updatetoc);*/
					if (updatetoc) refreshTOC();
				});
				view.popup.dockOptions.buttonEnabled = false;
				view.ui.move("zoom", "bottom-right");
				//disable default Zoom To action button on popups
				view.popup.viewModel.includeDefaultActions = false;
	
				view.popup.watch("selectedFeature", function(e) {
					view.graphics.removeAll();
					if (e && e.geometry) {
						//console.log(e.geometry.type);
						var hsymbol;
						if (e.geometry.type == "point") {
							hsymbol = {
								type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
								style: "cross",
								color: [0, 255, 255, 1.0],
								size: 12,
								outline: { // autocasts as new SimpleLineSymbol()
									color: [0, 255, 255, 1.0],
									width: 2 // points
								}
							};
						} else if (e.geometry.type == "polyline") {
							hsymbol = {
								type: "simple-line", // autocasts as new SimpleMarkerSymbol()
								color: "#00FFFF",
								width: "2",
								style: "solid"
							};
	
						} else if (e.geometry.type == "polygon") {
							hsymbol = {
								type: "simple-fill",
								style: "none",
								outline: {
									color: "#00FFFF",
									width: 2
								}
							};
						}
						view.graphics.add(
							new Graphic({
								geometry: e.geometry,
								symbol: hsymbol
							})
						);
					}
				});
	
				view.popup.watch("visible", function(visible) {
					if (visible == false) {
						view.graphics.removeAll();
					}
					//console.log("popup visible: ", visible);
				});
	
				/* var layerList = new LayerList({
					view: view
				},"twotoc"); */
	
				/* view.watch('scale',function(newz,oldz,vtex,v) {
						console.log(newz + ": " + oldz);
					}); */
	
				createReportMenu();
				createDataOpts();
				addEraseBtn();
				addPrint();
				addMeasure();
				addDemogWidget();
				addThresholdWidget();
				//addBookmarks();
				addSessions();
				//addBasemapGallery(); //use toggle now vs Basemap gallery on button
				addBasemapToggle();
				addSearch();
				//Boundaries aded to tools menu and onclick event
				$(document).on("click", "#ejbnd", function () {
					addServiceByKey(this.id, boundariesJSON);
				});
				$(document).on("click", "#addMapsandData", function () {
					if ($(this).hasClass("highlight")) {
						//$( "#criticalDataCategories" ).show();
						if ($("#addMapsandDataSubCategories").is(":visible")) {
							$("#addMapsandDataSubCategories").hide();
							removeHighlight(this);
						} else {
							$("#addMapsandDataSubCategories").show();
							
						}
					} else {
						$("#addMapsandDataSubCategories").hide();
							 removeHighlight(this);
					}
				});
	
				$(document).on("click", "#selectArea", function () {
					if ($(this).hasClass("highlight")) {
						//$( "#criticalDataCategories" ).show();
						if ($("#addAreasSubCategories").is(":visible")) {
							$("#addAreasSubCategories").hide();
							removeHighlight(this);
						} else {
							$("#addAreasSubCategories").show();
							
						}
					} else {
						$("#addAreasSubCategories").hide();
							 removeHighlight(this);
					}
				});
	
	
				//view.popup.resize(100,100);
				enableIdentify();
				view.watch("widthBreakpoint", function (breakpoint, oldvalue) {
					if (breakpoint == "xsmall" || oldvalue == "xsmall") {
						if (dojo.byId("searchdiv")) {
							var searchnode = dojo.byId("searchdiv");
							var parentnode = searchnode.parentNode;
							parentnode.removeChild(searchnode);
							addSearch();
						}
						updatePane(breakpoint);
					}
					updatetoolbarview(breakpoint);
				});
				updatetoolbarview(view.widthBreakpoint);
				if (displayLocation) {
					var instr = unescape(searchstr);
					instr = instr.replace(/\+/g, " ");
					var locationGeometry = new Point({
						x: clon,
						y: clat,
						" spatialReference": { " wkid": 4326 },
					});
					addLocation(locationGeometry, instr);
				}
			});
		}
	
		function getQueryVariable(variable) {
			var query = window.location.search.substring(1);
			var vars = query.split("&");
			for (var i = 0; i < vars.length; i++) {
				var pair = vars[i].split("=");
				if (pair[0].toLowerCase() == variable.toLowerCase()) {
					return pair[1];
				}
			}
		}
	
		function findlocSearchWidget(whereValue) {
			var llPattern = /^(-?\d{1,3}(\.\d+|),? {0,})+$/g;
			//alert(whereValue + ": " + llPattern.test(whereValue) + ": " + (llPattern.test(whereValue) && (!zipPattern.test(whereValue))));
			var zipPattern = /^\d{5}$/;
	
			if (llPattern.test(whereValue) && !zipPattern.test(whereValue)) {
				zoomtolatlonSearchWidget(whereValue);
			} else {
				getGeocodeSearchWidget(whereValue);
			}
		}
		function zoomtolatlonSearchWidget(searchtext){
			var coordsarray = searchtext.split(",");
			var x = parseFloat(coordsarray[1]);
			var y = parseFloat(coordsarray[0]);
			clat = y;
			clon = x;
			zoomstatus = "bycenter";
			//displayLocation = true;
			 /*var scaleBar = new ScaleBar({
				 view: view,
				 container: "scalediv",
				 style: "ruler",
				 unit: "non-metric",
			 });*/
			if (zoomstatus == "bycenter") {
				view.center = [clon, clat];
				view.zoom = 12;
			} else if (localStorage.getItem("ejscreenExtent")) {
				var extentstr = localStorage.getItem("ejscreenExtent");
	
				var extentjson = JSON.parse(extentstr);
				var mercatorExtent = new Extent(extentjson);
	
				view.extent = mercatorExtent;
			} else {
				view.center = [-122.80569076534753, 45.46825733691899];
				view.zoom = 12;
			}
	
			//if (displayLocation) {
				var instr = unescape(searchstr);
				instr = instr.replace(/\+/g, " ");
				var locationGeometry = new Point({
					x: clon,
					y: clat,
					" spatialReference": { " wkid": 4326 },
				});
				addLocation(locationGeometry, instr);
			//}
			//$('.esri-menu esri-search__warning-menu').hide();
			$('.esri-search__warning-body').hide();
			//$('.esri-search__warning-header').hide()
		}
		function getGeocodeSearchWidget(searchtext) {
			var geourl = geocoderurl;
			geourl =
				geourl +
				"/find?text=" +
				searchtext +
				"&maxLocations=10&outSR=4326&f=json";
			esriRequest(geourl, {
				responseType: "json",
			})
				.then(function (response) {
					var result = response.data;
					if (result.locations.length > 0) {
						clat = result.locations[0].feature.geometry.y;
						clon = result.locations[0].feature.geometry.x;
						displayLocation = true;
	
						zoomstatus = "bycenter";				
						
							view.zoom = 12;
						
						
					} else {
						alert("Did not find matched location for '" + searchtext + "'");
						
					}
	
				var instr = unescape(searchstr);
				instr = instr.replace(/\+/g, " ");
				var locationGeometry = new Point({
					x: clon,
					y: clat,
					" spatialReference": { " wkid": 4326 },
				});
				addLocation(locationGeometry, instr);
				})
				.catch(function (err) {
					console.log("error occurred: " + err);
					initMap();
				});
		}
	
	
		function findloc(whereValue) {
			var llPattern = /^(-?\d{1,3}(\.\d+|),? {0,})+$/g;
			//alert(whereValue + ": " + llPattern.test(whereValue) + ": " + (llPattern.test(whereValue) && (!zipPattern.test(whereValue))));
			var zipPattern = /^\d{5}$/;
	
			if (llPattern.test(whereValue) && !zipPattern.test(whereValue)) {
				zoomtolatlon(whereValue);
			} else {
				getGeocode(whereValue);
			}
		}
	
		function zoomtolatlon(searchtext) {
			var coordsarray = searchtext.split(",");
			var x = parseFloat(coordsarray[1]);
			var y = parseFloat(coordsarray[0]);
			clat = y;
			clon = x;
			zoomstatus = "bycenter";
			displayLocation = true;
			initMap();
		}
	
		function getGeocode(searchtext) {
			var geourl = geocoderurl;
			geourl =
				geourl +
				"/find?text=" +
				searchtext +
				"&maxLocations=10&outSR=4326&f=json";
			esriRequest(geourl, {
				responseType: "json",
			})
				.then(function (response) {
					var result = response.data;
					if (result.locations.length > 0) {
						clat = result.locations[0].feature.geometry.y;
						clon = result.locations[0].feature.geometry.x;
						displayLocation = true;
	
						zoomstatus = "bycenter";
						initMap();
					} else {
						alert("Did not find matched location for '" + searchtext + "'");
						initMap();
					}
				})
				.catch(function (err) {
					console.log("error occurred: " + err);
					initMap();
				});
		}
	
		function addLocation(geom, indesc) {
			var geomtype = geom.type;
			var desc = "";
			var layerlabel = "";
			var symbol;
			switch (geomtype) {
				case "point":
					desc =
						indesc +
						", Coordinates: " +
						geom.y.toFixed(6) +
						", " +
						geom.x.toFixed(6);
					symbol = pointsym;
					layerlabel = "Search Result (point)";
					break;
				case "polyline":
					desc = indesc;
					symbol = linesym;
					layerlabel = "Search Result (line)";
					break;
				case "polygon":
					desc = indesc;
					symbol = polysym;
					layerlabel = "Search Result (polygon)";
					break;
			}
	
			var graphic = new Graphic({
				geometry: geom,
			});
	
			var findlayerid = "findLayer_" + geomtype;
			var tempGraphicsLayer;
			if (view.map.findLayerById(findlayerid)) {
				tempGraphicsLayer = view.map.findLayerById(findlayerid);
				view.map.remove(tempGraphicsLayer);
			}
			var attr = { id: 0, gtype: geomtype, descinfo: desc };
			graphic.attributes = attr;
			drawlayerobj[findlayerid] = [graphic];
			tempGraphicsLayer = new FeatureLayer({
				id: findlayerid,
				source: [graphic],
				title: layerlabel,
				objectIdField: "id",
				outFields: ["*"],
				fields: [
					{
						name: "id",
						type: "oid",
					},
					{
						name: "gtype",
						type: "string",
					},
					{
						name: "descinfo",
						type: "string",
					},
				],
				popupTemplate: {
					title: "EJScreen Reports and Charts",
					content: SetDesc,
				},
				renderer: {
					type: "simple",
					symbol: symbol,
				},
			});
			tempGraphicsLayer.layerType = "digitize";
	
			view.map.add(tempGraphicsLayer);
	
			displayLocation = false;
		}
	
		function updatetoolbarview(breakpoint) {
			console.log("browser: " + breakpoint);
			//setLegendMobile(breakpoint);
			switch (breakpoint) {
				case "xsmall":
				case "small":
				case "medium":
					updateTools(false);
					break;
				case "large":
				case "xlarge":
					updateTools(true);
					break;
				default:
			}
		}
	
		function updateTools(showlabel) {
			for (var bt in toolbarsHash) {
				if (dijit.byId(bt)) {
					if (showlabel) dijit.byId(bt).set("label", toolbarsHash[bt]);
					else dijit.byId(bt).set("label", "");
				}
			}
		}
	
		function updatePane(b) {
			if (b == "xsmall") {
				dojo.byId("searchfloater").style.width = "80%";
				dojo.byId("searchfloater").style.height = "80%";
			} else {
				dojo.byId("searchfloater").style.width = "480px";
				dojo.byId("searchfloater").style.height = "460px";
			}
		}
	
		function setLegendMobile(b) {
			var isMobile = false;
			if (b == "xsmall") isMobile = true;
			if (isMobile) {
				var estatus = layerListExpand.expanded;
				layerListExpand.destroy();
				layerListExpand = new Expand({
					view: view,
					expanded: estatus,
					content: tocLegend,
				});
				view.ui.remove(tocLegend);
				view.ui.add(layerListExpand, "top-right");
			} else {
				view.ui.remove(layerListExpand);
				view.ui.add(tocLegend, "top-right");
			}
			/* var toAdd = isMobile ? layerListExpand : tocLegend;
			var toRemove = isMobile ? tocLegend : layerListExpand;
	
			view.ui.remove(toRemove);
			view.ui.add(toAdd, "top-right"); */
		}
	
		function saveExtent() {
			var extobj = view.extent.toJSON();
			var extentjsonstr = JSON.stringify(extobj);
			//console.log(extentjsonstr)
			localStorage.setItem("ejscreenExtent", extentjsonstr);
		}
	
		function enableIdentify() {
			//console.log("enable identify")
			if (idhandle == null) idhandle = on(view, "click", executeIdentifyTask);
		}
	
		function disableIdentify() {
			if (idhandle != null) {
				idhandle.remove();
				idhandle = null;
			}
		}
		var feats = [];
	
		function executeIdentifyTask(evt) {
			view.hitTest(evt).then(function (response) {
				var doID = false;
				var resultData;
				if (response.results.length) {
					if (response.results[0].graphic.layer) {
						if (response.results[0].graphic.layer.type == "vector-tile")
							doID = true;
						if (response.results[0].graphic.layer.type == "imagery") doID = true;
						// if (response.results[0].graphic.layer.type == "feature"){
							// doID = true;
							// //resultData = response.results[0];
						// }
					}
				} else if (response.results.length == 0) {
					doID = true;
				}
				//doID = true;
				if (doID) {
					var deferlist = [];
					feats = [];
					var cscale = view.scale;
					//var lyrTypeRef = ""; //ref layer type outside of function scope to use in result callback. Used to control whether first or last attribute used for popup title
					layerSaveArray = [];
					var lyrPctLevel = ""; //ref layer type outside of function scope
					//RW 4/24/24 - store renderer as formatter flag for lookup in callback only for EJ Layers outside function scope
					var formatterObj = {};
					
					view.map.layers.map(function (lyr) {
						/*if(lyr.type === "graphics"){
							if (resultData ) {
								var feature = resultData; // Get the first feature from hit test
					
								// Call function to get dynamic content for popup
							
								var infoTemplate = new PopupTemplate();
								//infoTemplate.content = idDesc(feature);
								infoTemplate.content ='<b>Scientific Name:</b>'
								feature.popupTemplate = infoTemplate;
								// Open popup with dynamic content
								view.popup.open({
									location: evt.mapPoint, // Set popup location to clicked point
									features: [feature] // Set dynamic content generated by _idDesc function
								});
							} else {
								view.popup.close(); // Close the popup if no features found
							}
										
						}*/
						if (lyr instanceof MapImageLayer || lyr instanceof TileLayer) {
							console.log("instance")
							if (lyr.visible) {
								var vscalelayers = [];
								lyr.allSublayers.map(function (sublyr) {
									if (sublyr.visible && !sublyr.sublayers) {
										var myminscale = sublyr.minScale;
										var mymaxscale = sublyr.maxScale;
										if (
											(cscale < myminscale && cscale > mymaxscale) ||
											(mymaxscale == 0 && cscale < myminscale) ||
											(myminscale == 0 && cscale > mymaxscale)
										) {
											vscalelayers.push(sublyr.id);
										}
									}
								});
	
								if (vscalelayers.length > 0) {
									if (lyr.isDynamic) {
										var j = lyr.renderIndex;
										var qurl = lyr.url + "/" + j;
										//field used to draw the layer legend, pushed to outfields as top attribute
										var renderfield = lyr.renderField;
										console.log(renderfield)
										var ltype = lyr.layerType;
										//lyrTypeRef = ltype;
										lyrPctLevel = lyr.pctlevel;
	
										var outfields = [];
										console.log(dynamicJSON)
										console.log(ltype)
	
										for (var afld in dynamicJSON[ltype].headerfields) {
											outfields.push(afld);
										}
										//var outfields = dynamicJSON[ltype].headerfields.split(",");
										var queryTask = new QueryTask(qurl);
										var idfieldsave = "";
										//idTaskAry.push(queryTask);
										if (ltype == "ejscreen" || ltype == "ejscreen_supp" || ltype == "ejscreen_multi") {
											
											var idfldfield = ejIdentifyJSON[renderfield].idfldname;
											var idflds = idfldfield.split(",");
											//8/4/21 now want to show main stat at top of popus vs bottom. Currently stored in lookup table in reverse order.
											//if ejscreen, reverse the array for now, if this is fixed in table remove this line.
											//ejscreen_multi is coming from config so that's not affected
											if (ltype == "ejscreen" || ltype == "ejscreen_supp") {
												idflds.reverse();
											}
											//end reverse fix
											//save id field for next step, capture first in list
											idfieldsave = idflds[0];
											for (var m = 0; m < idflds.length; m++) {
												var textfield = idflds[m];
												if (!checkArray(textfield, outfields)) {
													outfields.push(textfield);
												}
											}
										} else {
											if (!checkArray(renderfield, outfields)) {
												outfields.push(renderfield);
											}
										}
										//don't add footer fields to socio layers since they come from lookup table and cause duplicates
										//RW 2/6/24 added T_DEMOGIDX_5 to list to remove duplicates. 4/24/24, moved to config and added new disability
										var footerSkipAry = footerSkipAryConfig;
										for (var afld in dynamicJSON[ltype].footerfields) {
											if (!(footerSkipAry.includes(idfieldsave))){
												outfields.push(afld);
											}
										}
	
										//push fields that will be used in title header
										for (var afld in dynamicJSON[ltype].titlefields) {
											outfields.push(afld);
										}
										//if an EJ index layer that is using _D2, push the non-d2 field and append at end to also show the indicator value
										if (ltype == "ejscreen") {
											if (idfieldsave.includes("_D2")){
												var pctileField = idfieldsave.replace("_D2","");
												outfields.push(pctileField);
											}
											
										}else if (ltype == "ejscreen_supp"){
											if (idfieldsave.includes("_D5")){
												var pctileField = idfieldsave.replace("_D5","");
												outfields.push(pctileField);
											}
										}
										//if EJ type pass config obj for current render to handler
										if (ltype == "ejscreen" || ltype == "ejscreen_supp") {
											formatterObj = ejIdentifyJSON[renderfield];
										}
	
										var query = new Query();
	
										query.returnGeometry = true;
										query.geometry = evt.mapPoint;
	
										query.outFields = outfields;
										//var dirty = (new Date()).getTime();
										//query.where = "1=1 AND " + dirty + "=" + dirty;
										/* if (ltype == "ejscreen") {
											var pctlevel = lyr.pctlevel;
											queryTask.execute(query).then(function(results) {
	
												handleEJQuery(results,pctlevel);
											}).otherwise(
											function (error) {
												console.log("error occurred when querying dynamic layer: " + error);
											});
										} else {
											queryTask.execute(query).then(handleOneQuery)
											.otherwise(function (error) {
												console.log("error occurred when querying dynamic layer: " + error);
											});
										} */
										var queryreq = queryTask.execute(query);
										deferlist.push(queryreq);
										layerSaveArray.push(ltype);
									} else if (lyr.id === 'lifeexpentancy_map' || lyr.id === 'heartdisease_map' ||
										lyr.id === 'asthma_map' || lyr.id === 'cancer_map' || lyr.id === 'personswithdisabilities_map' ||
										lyr.id === 'broadband_map' || lyr.id === 'nohealthinsurance_map') {
										var lyrId = lyr.id;
										renderfield = ejIdentifyJSON[lyrId].cat;
										ltype = "health"; //need it for identify								
										var query = new Query();
										var queryTask = new QueryTask(lyr.url + "/" + vscalelayers[0]);
										//formatterObj = ejIdentifyJSON[renderfield];
										formatterObj = ejIdentifyJSON[lyrId];
										query.returnGeometry = true;
										query.geometry = evt.mapPoint;
										var idfldfield = ejIdentifyJSON[lyrId].idfldname;
										//var idfldfield = ejIdentifyJSON[renderfield].idfldname;
										var idflds = idfldfield.split(",");
										query.outFields = idflds;
										var queryreq = queryTask.execute(query);
										deferlist.push(queryreq);
										layerSaveArray.push(ltype);
									}
									else {
										identifyTask = new IdentifyTask(lyr.url);
										//idTaskAry.push(identifyTask);
	
										identifyParams = new IdentifyParameters();
										identifyParams.tolerance = 10;
										//identifyParams.maxAllowableOffset = 100;
										identifyParams.returnGeometry = true;
	
										identifyParams.layerIds = vscalelayers;
										identifyParams.layerOption = "all";
										identifyParams.width = view.width;
										identifyParams.height = view.height;
										identifyParams.geometry = evt.mapPoint;
										identifyParams.mapExtent = view.extent;
										//idParamAry.push(identifyParams);
										/* identifyTask.execute(identifyParams).then(handleOneQuery)
										.otherwise(function (error) {
											console.log("error occurred when querying layer: " + error);
										}); */
										var idrequest = identifyTask.execute(identifyParams);
										deferlist.push(idrequest);
										layerSaveArray.push(ltype);
									}
								}
							}
						}
					});
					all(deferlist).then(function (results) {
						var wobj = this;
						//Note 7/10/23 RW - for demog layers, can show more than once. Use a hashmap to store the aliases of each layer so can be accessed in the info window.
						//this allow the aliases to be retreived in the info window template which by default only gets passed the graphic attributes with no aliases.
						//The other layers that use a template created before the window is created (eg EJ layer and Threshold layer, could also be switched to using this 
						//instead of a global widget template for each type
						wobj.atthash = new Map();
						if (!$("#menuId").parent().hasClass("active")) {
							for (var m = 0; m < results.length; m++) {
								handleOneQuery(results[m], layerSaveArray[m], lyrPctLevel, formatterObj);
							}
	
							if (feats.length > 0) {
								/* view.popup.viewModel.features = feats;
							view.popup.location = evt.mapPoint;
	
							view.popup.set("visible", true); */
	
								view.popup.open({ features: feats, location: evt.mapPoint });
								//view.popup.features.push(feats[0]);
								
								//view.popup.viewModel.features.push(feats);
								//view.popup.open({location: evt.mapPoint});
								//var stp = "";
							}
						}
					});
				}
			});
		}
	
		function checkArray(el, ar) {
			var ret = false;
			for (var k = 0; k < ar.length; k++) {
				if (ar[k] == el) {
					ret = true;
				}
			}
			return ret;
		}
	
		function handleOneQuery(response, lyType, pctlevel, formatObj) {
	
			var wobj = this;
		
			var feat;
			var template;
			var pctpattern = /^pct_/i;
			if (response.features) {
				var results = response;
				console.log(results)
				var fetcount = results.features.length;
				for (var m = 0; m < fetcount; m++) {
					feat = results.features[m];
	
					var topstr = "";
					var templatestr = "<table border='0'>";
					for (var k = 0; k < results.fields.length; k++) {
						var fldobj = results.fields[k];
						var prop = fldobj.name;
						var falias = fldobj.alias;
	
						//if footerfields are set in config, use those alias values for the alias instead of from service
						//only apply if the usefooteralias is true, otherwise skip and use alias from service
						if (dynamicJSON[lyType].footerfields[prop] && dynamicJSON[lyType].usefooteralias == true) {
							falias = dynamicJSON[lyType].footerfields[prop];
						}
		  
						var fldvalue = feat.attributes[prop];
						if (fldvalue == null) fldvalue = "N/A";
						if (
							(pctpattern.test(prop) || prop == "POP_DEN") &&
							typeof fldvalue == "number"
						) {
							fldvalue = fldvalue.toFixed(2);
						}
						
						if (lyType == "ejscreen" || lyType == "ejscreen_supp" || lyType == "ejscreen_multi" || lyType === "health") {
							
							//override default alias if set in formatter
							if (formatObj && formatObj.formatter && formatObj.formatter.aliasnew && formatObj.formatter.aliasnew[prop] ){							
								falias = formatObj.formatter.aliasnew[prop];							
							}
							//append optional values to alias
							//prefix text
							if (formatObj && formatObj.formatter && formatObj.formatter.prefixtext && formatObj.formatter.prefixtext[prop]  ){
								falias = formatObj.formatter.prefixtext[prop] + " " + falias;						
							}
							//suffix text
							if (formatObj && formatObj.formatter && formatObj.formatter.suffixtext && formatObj.formatter.suffixtext[prop]  ){
								falias += " " + formatObj.formatter.suffixtext[prop];							
							}	
							//adjust pct values by multiple if needed
							if (formatObj && formatObj.formatter && formatObj.formatter.multiplier && formatObj.formatter.multiplier[prop] ){
								if (typeof fldvalue === 'number') {//skip if N/A or non-numeric					
									fldvalue = fldvalue * formatObj.formatter.multiplier[prop];	
								}							
							}						
							//format p_env using significant digit rounding to match SOE
							if (formatObj && formatObj.formatter && formatObj.formatter.signifdigits){
								if (typeof fldvalue === 'number') {//skip if N/A or non-numeric									
										fldvalue = getEnvText(fldvalue,formatObj.formatter.signifdigits[prop])						
								}							
							}
							//format values to round to match return from SOE
							if (formatObj && formatObj.formatter && formatObj.formatter.roundplaces){
								if (typeof fldvalue === 'number') {//skip if N/A or non-numeric									
										fldvalue = fldvalue.toFixed(formatObj.formatter.roundplaces[prop]);						
								}							
							}
							//format decimal places or round p_env using significant digit rounding to match SOE
							if (formatObj && formatObj.formatter && formatObj.formatter.ispercent){	
								if (typeof fldvalue === 'number') {//skip if N/A or non-numeric		
										fldvalue = Math.round(fldvalue);
								}
							}		
							//NOTE: do any string operations to fldvalue after above, all above assumes number, after this all are string operations.
							
							//for all number values, format to show comma if > 1000
							if (typeof fldvalue === 'number') {
								fldvalue = fldvalue.toLocaleString("en-US");
							}
	
							
							//append optional units to value
							if (formatObj && formatObj.formatter && formatObj.formatter.units && formatObj.formatter.units[prop] ){						
								fldvalue += " " + formatObj.formatter.units[prop];							
							}
							
							//append optional % to value
							if (formatObj && formatObj.formatter && formatObj.formatter.pctsign && formatObj.formatter.pctsign[prop] ){						
								fldvalue += " " + formatObj.formatter.pctsign[prop];							
							}
							
							
							
							
							
							
							
	
							//skip title fields
						if (!(dynamicJSON[lyType].titlefields[prop])){						
							if (k==0){
									templatestr +=
									"<tr><td style='font-weight: bold;' valign='top'>" +
									falias +
									":</td><td style='font-weight: bold;white-space: nowrap;' valign='top' >" +
									fldvalue +
									"</td></tr>";
							} else {
									templatestr +=
									"<tr><td style='font-weight: normal;' valign='top'>" +
									falias +
									":</td><td style='font-weight: normal;white-space: nowrap;' valign='top'>" +
									fldvalue +
									"</td></tr>";
	
							}
						}
							
						} else if (lyType == "threshold" || lyType == "health") {
	
							//skip title fields
							if (!(dynamicJSON[lyType].titlefields[prop])){						
								
										templatestr +=
										"<tr><td style='font-weight: normal;' valign='top'>" +
										falias +
										":</td><td style='font-weight: normal;' valign='top'>" +
										fldvalue +
										"</td></tr>";
						
							}
							
						}
						else {
							templatestr +=
							"<tr><td style='font-weight: normal;' valign='top'>" +
							falias +
							":</td><td valign='top'>" +
							fldvalue +
							"</td></tr>";
						}
	
	
						
	
						//if ej layer,do custom header for ej
						if (lyType == "ejscreen" || lyType == "ejscreen_supp" || lyType == "ejscreen_multi") {
							if (topstr == "") {										
	
	
								topstr = "<div class='grid-container-popup-header'>" ;	
								if (feat.attributes["CNTY_NAME"]){
									topstr += "<div class='grid-child noWrap'>" + feat.attributes["CNTY_NAME"] + ", " + feat.attributes["ST_ABBREV"] + "</div>";
								} else {								
									topstr += "<div class='grid-child noWrap'>" + feat.attributes["STATE_NAME"] + "</div>";
								}	
	
								if (pctlevel == "nation"){								
									topstr += "<div class='grid-child noWrap'>US Percentile</div>";
								} else {								
									topstr += "<div class='grid-child noWrap'>State Percentile</div>";
								}	
	
								if (feat.attributes["ACSTOTPOP"] ){
									if (typeof feat.attributes["ACSTOTPOP"] === 'number') {
										topstr += "<div class='grid-child noWrap'>" + "Population: " + feat.attributes["ACSTOTPOP"].toLocaleString("en-US")+"</div>"; 
									} else{	
									topstr += "<div class='grid-child noWrap'>" + "Population: " + feat.attributes["ACSTOTPOP"] + "</div>";   
									}
								}	  							  							
								  topstr += "</div>";
							}
						}
						if (lyType == "health") {
							if (topstr == "") {
								topstr = "<div class='grid-container-popup-header'>";
								if (formatObj && formatObj.legendtitle) {
									topstr += "<div class='grid-child noWrap'>" + formatObj.legendtitle + "</div>";
								}
								topstr += "</div>";
							}
						}
						//if threshold layer, do custom header for threshold
						if (lyType == "threshold") {
							if (topstr == "") {
								topstr = "<div class='grid-container-popup-header'>" ;	
								if (feat.attributes["ST_ABBREV"]){
									topstr += "<div class='grid-child noWrap'>State: " + feat.attributes["ST_ABBREV"] + "</div>";
								} 
	
								if (pctlevel == "nation"){								
									topstr += "<div class='grid-child noWrap'>US Percentile</div>";
								} else {								
									topstr += "<div class='grid-child noWrap'>State Percentile</div>";
								}								  							  							
								  topstr += "</div>";
							}
						}
	
	
						//if not ej layer or threshold, capture last attribute for title and save
						if (!(lyType == "ejscreen" || lyType == "ejscreen_supp" || lyType == "ejscreen_multi" || lyType == "threshold" || lyType === "health")) {
							topstr = falias;
						}
					}
					templatestr += "</table>";
					template = new PopupTemplate();
					template.title = topstr;
					//template.content = templatestr;
					//pass in template vs creating in the widget
					//if (lyType == "ejscreen" || lyType == "ejscreen_supp" || lyType == "ejscreen_multi" || lyType == "threshold") {
					if (lyType == "ejscreen" || lyType == "ejscreen_supp" || lyType == "ejscreen_multi" || lyType == "health") {
						wobj.templateEJcurrent = templatestr;
						template.content = idDescEJ;
					} else if (lyType == "threshold") {
						wobj.templateThresholdCurrent = templatestr;
						template.content = idDescThreshold;
					} else if (lyType.includes("demog")){
						//wobj.templateDemogcurrent = templatestr;
						//setting att obj as key doesn't work, create a unique val for key by combining all keys
						var keycombo = "";
						for (var key of Object.keys(feat.attributes)) {
							keycombo += key;
						}
						//map the fields obj with aliases to the unique field combo to retreive later in the info window widget
						if (!(wobj.atthash.has(keycombo))) {
							wobj.atthash.set(keycombo, results.fields);
						}
						template.content = idDescDemog;
						
					}
					else {
						template.content = idDesc;
					}
					feat.popupTemplate = template;
	
					feats.push(feat);
				}
				//view.popup.features = feats;
			} else {
				var results = response.results;
				console.log(results)
				if (results.length > 0) {
					for (var j = 0; j < results.length; j++) {
						feat = results[j].feature;
						//var lyrName = results[j].layerName;
						var lyrName = results[j].layerName;
						if (results[j].layerName.includes('_')) {
							lyrName = lyrName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
						} 
						
						template = new PopupTemplate();
						template.title = lyrName;
						if (template.title === "RSEI Scores"){
							template.title = "RSEI Score";
						}
						if (results[j].layerName === "EJ_GRANTS_By_Program"){
							var grantsFeature = response.results[j].feature.attributes;						
							template.content = formatPopupContent(grantsFeature);
							feat.popupTemplate = template;
							
						}else{
						template.content = idDesc;
						feat.popupTemplate = template;
						}
						feats.push(feat);
					}
	
					//view.popup.features = feats;
				}
			}
			//console.log("identify result: " + feats.length);
			//view.popup.open({features: feats, location: evtsave.mapPoint});
		}
		function formatPopupContent(attributes) {
			var formattedContent = '<div style="background-color: rgb(225, 235, 244); padding: 4px; border: 1px solid rgb(153, 153, 153); height: 100%; overflow-y: auto; display: block;">' +
			"<span style='padding-bottom: 10px;'> <b>Project Title:</b> " + attributes['Project Title'] + "</span><br>" +
			"<span style='padding-bottom: 10px;'><b>Project Description:</b> " + attributes["Project Description"] + "</span><br>" +
			"<span style='padding-bottom: 10px;'><b>EPA Region:</b> " + attributes["Award Region"] + "</span><br>" +
			"<span style='padding-bottom: 10px;'><b>Available Amount:</b> " + formatAmount(attributes["Available Amount"]) + "</span><br>" +
			"<span style='padding-bottom: 10px;'><b>Award Date:</b> " + formatDate(attributes["Award Date"]) + "</span><br>" +
			'</div>';
		
			return formattedContent;
		}
		
		
		function formatAmount(amountVal) {
			if (isNaN(amountVal) || amountVal === "" || amountVal === undefined) {
				return ""; 
			}
			return "$" + parseFloat(amountVal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
		}
		function formatDate(dateString) {
			const longEnUSFormatter = new Intl.DateTimeFormat('en-US', {
				year:  'numeric',
				month: 'long',
				day:   'numeric',
			});
			
			var date = new Date(dateString);
			return longEnUSFormatter.format(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
			
		}
		function handleEJQuery(results, ptype) {
			console.log(results)
			var feat;
			var template;
			var fetcount = results.features.length;
			for (var m = 0; m < fetcount; m++) {
				feat = results.features[m];
	
				var topstr = "";
				var templatestr = "<table border='0'>";
				for (var k = 0; k < results.fields.length; k++) {
					var fldobj = results.fields[k];
					var prop = fldobj.name;
					var falias = fldobj.alias;
					var fldvalue = feat.attributes[prop];
	
					if (fldvalue == null) fldvalue = "N/A";
					templatestr +=
						"<tr><td style='font-weight: bold;' valign='top'>" +
						falias +
						":</td><td valign='top'>" +
						fldvalue +
						"</td></tr>";
					topstr = falias;
				}
				templatestr += "</table>";
	
				if (ptype == "state") {
					topstr = topstr + " (State)";
				} else {
					topstr = topstr + " (National)";
				}
				template = new PopupTemplate();
				template.title = topstr;
				template.content = templatestr;
				feat.popupTemplate = template;
	
				feats.push(feat);
			}
			//view.popup.features = feats;
	
			if (feats.length > 0)
				view.popup.open({ features: feats, location: evtsave.mapPoint });
		}
	
		function idDesc(e) {
			var infowidget = new IDinfoWindow(
				{
					view: view,
					idgraphic: e.graphic,
				},
				dojo.create("div")
			);
			infowidget.startup();
	
			return infowidget.domNode;
		}
	
		function idDescDemog(e) {
			//info window popup for demog widget layer click
			//pass in template vs creating in the widget
			var wobj = this;		
			var infowidget = new IDinfoWindowDemog(
				{
					view: view,
					idgraphic: e.graphic,
					//templateEJcurrent: wobj.templateDemogcurrent
					atthash: wobj.atthash
				},
				dojo.create("div")
			);
			infowidget.startup();
	
			return infowidget.domNode;
		}
	
		function idDescEJ(e) {
			//info window popup for EJ layer click
			//pass in template vs creating in the widget
			var wobj = this;		
			var infowidget = new IDinfoWindowEJ(
				{
					view: view,
					idgraphic: e.graphic,
					templateEJcurrent: wobj.templateEJcurrent
				},
				dojo.create("div")
			);
			infowidget.startup();
	
			return infowidget.domNode;
		}
	
		function idDescThreshold(e) {
			//info window popup for EJ layer click
			//pass in template vs creating in the widget
			var wobj = this;		
			var infowidget = new IDinfoWindowThreshold(
				{
					view: view,
					idgraphic: e.graphic,
					templateEJcurrent: wobj.templateThresholdCurrent
				},
				dojo.create("div")
			);
			infowidget.startup();
	
			return infowidget.domNode;
		}
	
		function idDesc2(e, p1) {
			console.log(e.graphic);
			console.log(p1);
	
			var infowidget = new IDinfoWindow(
				{
					view: view,
					idgraphic: e.graphic,
				},
				dojo.create("div")
			);
			infowidget.startup();
	
			return infowidget.domNode;
		}
	
		function SetDesc(e) {
			var infowidget = new EJinfoWindow(
				{
					view: view,
					inGraphic: e.graphic,
				},
				domConstruct.create("div")
			);
			infowidget.startup();
	
			return infowidget.domNode;
		}
	
		function addSearch() {
			if (dojo.byId("legendPan").style.display === "block") {
				var pandiv = dojo.create("div", {
					id: "searchdiv",
					// style: "position: absolute;  top: 18px;  right: 268px;"
					style: "position: absolute;  top: 18px;  right: 268px;",
				});
				dojo.byId("viewDiv").appendChild(pandiv);
			} else {
				// view.ui.add(expandDiv, "top-right");
				var pandiv = dojo.create("div", {
					id: "searchdiv",
					style: "position: absolute;  top: 18px;  right: 3px;",
				});
				dojo.byId("viewDiv").appendChild(pandiv);
			}
	
			var searchWidgetNav = new Search({
				id: "locwg",
				container: "searchdiv",
				view: view,
				popupEnabled: false,
				resultGraphicEnabled: false,
			});
			searchWidgetNav.on("search-complete", function (event) {
				// The results are stored in the event Object[]
				if (event.results.length > 0 && event.results[0].results.length > 0) {
					var g = event.results[0].results[0].feature;
					var gname = event.results[0].results[0].name;
					addLocation(g.geometry, gname);
				}else{
				
					if(event.results.length === 0){
					findlocSearchWidget(event.searchTerm);
					 
				}
			   }
			});
			/* if (view.widthBreakpoint == "xsmall") {
				 var pandiv = dojo.create("div", {
					 id: "searchdiv",
					 style: "position: absolute; top: 20px; left: 56px"
				 });
				 dojo.byId("viewDiv").appendChild(pandiv);
			 } else {
				 var pandiv = dojo.create("div", {
					 id: "searchdiv",
					 style: "margin-top: 3px;"
				 });
				 dojo.byId('webmap-toolbar-right').appendChild(pandiv);
			 }*/
		}
	
		function refreshTOC() {
			//document.getElementById("twotoc").innerHTML = "";
			tocLegend.layerInfos = [];
			var lcount = 0;
			for (let i = 0; i < view.map.layers.length; i++) {
				if (view.map.layers.items[i].type != "graphics") {
					if (view.map.layers.items[i].layerType) {
						if (view.map.layers.items[i].layerType != "digitize")
							lcount = lcount + 1;
					} else {
						lcount = lcount + 1;
					}
				}
				tocLegend.layerInfos.push({
					layer: view.map.layers.items[i],
					title: view.map.layers.items[i].title,
					slider: false,
					autoToggle: true,
				});
			}
			tocLegend.refresh();
			if (lcount > 0) {
				dojo.byId("legendPan").style.display = "block";
				// addSearch();
				$("#searchdiv").attr(
					"style",
					"position: absolute;  top: 18px;  right: 268px;"
				);
			} else {
				dojo.byId("legendPan").style.display = "none";
				//  addSearch();
				if ($("#searchdiv").length) {
					$("#searchdiv").attr(
						"style",
						"position: absolute;  top: 18px;  right: 3px;"
					);
				}
			}
		}
	
		function addEraseBtn() {
			var eraseButton = new Button({
				label: "Clear",
				title: "Clear Selected Locations",
				id: "eraseButton", //,
				//iconClass: "esriEraseIcon"
			});
			var spanEl = document.createElement("span");
			spanEl.textContent = "Select a location to access reports";
			spanEl.id="reportInstruction";
			var parentElement = dojo.byId("clearLocations");
			parentElement.appendChild(spanEl);
			parentElement.appendChild(eraseButton.domNode);
			//dojo.byId("clearLocations").appendChild(eraseButton.domNode);
			// toolbarsHash[eraseButton.id] = eraseButton.label;
			eraseButton.on("click", eraseAll);
		}
	
		function eraseAll() {
			var removelayers = [];
			for (let i = 0; i < view.map.layers.length; i++) {
				var layer = view.map.layers.items[i];
				var layerid = layer.id;
				if (layer.type == "graphics") {
					layer.removeAll();
				} else if (
					layer.type == "feature" &&
					layer.layerType &&
					layer.layerType == "digitize"
				) {
					removelayers.push(layer);
				}
			}
			for (var m = 0; m < removelayers.length; m++) {
				view.map.remove(removelayers[m]);
			}
			view.popup.close();
			dijit.byId("eraseButton").set("checked", false);
	
			dijit.byId("eraseButton").set("checked", false);
			if (dijit.byId("kgeowg")) {
				dijit.byId("kgeowg").fipsNode.value = "";
				dijit.byId("kgeowg").hiddenfipsNode.innerHTML = "";
			}
			drawlayerobj = {};
		}
	
		function addSessions() {
			var toggleButton3 = new Button({
				label:
					"Save Session&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
				title: "Save a location and map for later viewing",
				id: "sesButton",
				iconClass: "esriBookmarkIconNew",
			});
	
			toggleButton3.on("click", toggleSaveSession);
	
			//dojo.byId('webmap-toolbar-center').appendChild(toggleButton3.domNode);
			dojo.byId("saveSessions").appendChild(toggleButton3.domNode);
			// toolbarsHash[toggleButton3.id] = toggleButton3.label;
	
			var pandiv = domConstruct.create("div", {
				id: "sessionfloater",
				innerHTML: "<div id='sessionDiv'></div>",
			});
	
			document.body.appendChild(pandiv);
	
			var fp = new ParentConstrainedFloatingPane(
				{
					title: "Save Session",
					resizable: true,
					dockable: false,
					closable: true,
					style:
						"position:absolute;top:90px;left:50px;width:380px;height:440px;z-index:100;visibility:hidden;",
					id: "sessionfloater",
				},
				dojo.byId("sessionfloater")
			);
			fp.startup();
	
			fp.close = toggleSaveSession;
	
			var ses = new SaveSessions(
				{
					view: view,
				},
				"sessionDiv"
			);
		}
	
		function addBookmarks() {
			var cp = new ContentPane({
				id: "sessionView",
			});
	
			var ses = new EJSessions(
				{
					view: view,
				},
				domConstruct.create("div", {}, cp.domNode)
			);
	
			var button = new DropDownButton({
				label: "Bookmarks",
				id: "sesButton",
				iconClass: "esriBookmarkIcon",
				title: "Create or go to a bookmarked location",
				dropDown: cp,
			});
			//toolbarsHash[button.id] = button.label;
			// dojo.byId('webmap-toolbar-center').appendChild(button.domNode);
		}
	
		function addPrint() {
			var printButton = new Button({
				label:
					"Print&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp",
				title: "Print or save maps",
				id: "printButton",
				iconClass: "esriPrintIconNew",
			});
			//toolbarsHash[printButton.id] = printButton.label;
			//dojo.byId('webmap-toolbar-center').appendChild(printButton.domNode);
			// view.ui.add(printButton, "bottom-right");
			dojo.byId("printButtonDiv").appendChild(printButton.domNode);
			printButton.on("click", togglePrint);
	
			var pandiv = dojo.create("div", {
				id: "printfloater",
				innerHTML: "<div id='printerDiv'></div>",
			});
	
			document.body.appendChild(pandiv);
	
			var fp = new ParentConstrainedFloatingPane(
				{
					title: "Print",
					resizable: true,
					dockable: false,
					closable: true,
					style:
						"position:absolute;top:40px;left:50px;width:280px;height:465px;z-index:100;visibility:hidden;",
					id: "printfloater",
				},
				dojo.byId("printfloater")
			);
			fp.startup();
			fp.close = togglePrint;
	
			var print = new Print(
				{
					view: view,
					// specify your own print service
					printServiceUrl: localPrintService,
				},
				"printerDiv"
			);
		}
	
		function toggleSaveSession() {
			if (dojo.byId("sessionfloater").style.visibility === "hidden") {
				//closeAllPanels();
				dijit.byId("sessionfloater").set("checked", true);
				dijit.byId("sessionfloater").show();
				$("#saveSessions").addClass("highlight");
				addHighlightIcon(
					"saveSessions",
					"esriBookmarkIconNew",
					"esriBookmarkIconNewHighlight"
				);
				//different label id
				$("#sesButton_label").css("color", "white");
			} else {
				dijit.byId("sessionfloater").hide();
				dijit.byId("sesButton").set("checked", false);
				removeHighlightIcon(
					"saveSessions",
					"esriBookmarkIconNew",
					"esriBookmarkIconNewHighlight"
				);
				//different label id
				$("#sesButton_label").css("color", "black");
			}
		}
	
		function togglePrint() {
			if (dojo.byId("printfloater").style.visibility === "hidden") {
				closeAllPanels();
				dijit.byId("printButton").set("checked", true);
				dijit.byId("printfloater").show();
				addHighlightIcon(
					"printButtonDiv",
					"esriPrintIconNew",
					"esriPrintIconNewHighlight"
				);
				$("#printButton_label").css("color", "white");
			} else {
				dijit.byId("printfloater").hide();
				dijit.byId("printButton").set("checked", false);
				removeHighlightIcon(
					"printButtonDiv",
					"esriPrintIconNew",
					"esriPrintIconNewHighlight"
				);
				$("#printButton_label").css("color", "black");
			}
		}
	
		function addBasemapToggle() {
			var toggle = new BasemapToggle({
				view: view, // view that provides access to the map's  basemap
				nextBasemap: "hybrid", // allows for toggling to the 'hybrid' basemap
			});
	
			// Add widget to the top right corner of the view
			view.ui.add(toggle, "bottom-left");
		}
	
		function addBasemapGallery() {
			var cp = new ContentPane({
				id: "basemapGallery",
				style: "margin-top: 0;",
			});
	
			var source = new PortalBasemapsSource({
				query: {
					title: defaults.basemapgroup.title,
					owner: defaults.basemapgroup.owner,
				},
			});
			basemapGallery = new BasemapGallery(
				{
					view: view,
					source: source,
					//activeBasemap: Basemap.fromId("topo")
				},
				dojo.create("div")
			);
	
			cp.set("content", basemapGallery.domNode);
	
			var button = new DropDownButton({
				label: "Basemap",
				id: "basemapBtn",
				iconClass: "esriBasemapIcon",
				title: "Basemap",
				dropDown: cp,
			});
			toolbarsHash[button.id] = button.label;
			// dojo.byId('webmap-toolbar-center').appendChild(button.domNode);
			basemapGallery.watch("activeBasemap", function (newv, oldv) {
				//close the basemap window when an item is selected
	
				dijit.byId("basemapBtn").closeDropDown();
			});
	
			//});
		}
	
		function addMeasure() {
			var pandiv = domConstruct.create("div", {
				id: "floater",
				innerHTML: "<div id='measureDiv'></div>",
			});
	
			document.body.appendChild(pandiv);
			var fp = new ParentConstrainedFloatingPane(
				{
					title: "Measure",
					resizable: true,
					dockable: false,
					closable: true,
					style:
						"position:absolute;top:40px;left:50px;width:280px;height:375px;z-index:100;visibility:hidden;",
					id: "floater",
				},
				dojo.byId("floater")
			);
			fp.startup();
			fp.close = toggleMeasure;
	
			var measure = new Measure(
				{
					view: view,
					id: "measureTool",
				},
				"measureDiv"
			);
	
			measure.startup();
	
			var toggleButton = new Button({
				label:
					"Measure&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
				title: "Measure distances or areas",
				id: "toggleButton",
				iconClass: "esriMeasureIconNew",
				onClick: function (e) {
					toggleMeasure();
				},
			});
	
			//toolbarsHash[toggleButton.id] = toggleButton.label;
			//on(toggleButton, "click", toggleMeasure);
			// dojo.byId('webmap-toolbar-center').appendChild(toggleButton.domNode);
			dojo.byId("measure").appendChild(toggleButton.domNode);
		}
	
		function toggleMeasure() {
			if (dojo.byId("floater").style.visibility === "hidden") {
				closeAllPanels();
				dijit.byId("floater").show();
				dijit.byId("toggleButton").set("checked", true);
				addHighlightIcon(
					"measure",
					"esriMeasureIconNew",
					"esriMeasureIconNewHighlight"
				);
				$("#toggleButton_label").css("color", "white");
				disableIdentify();
			} else {
				dijit.byId("floater").hide();
				removeHighlightIcon(
					"measure",
					"esriMeasureIconNew",
					"esriMeasureIconNewHighlight"
				);
				$("#toggleButton_label").css("color", "black");
				var measure = dijit.byId("measureTool");
				measure.closepane();
				enableIdentify();
				dijit.byId("toggleButton").set("checked", false); //uncheck the measure toggle button
			}
		}
	
		function createDataOpts() {
			//create a dropdown button to display the menu
			//build a menu with a list of sharing options
			var menu = new Menu({
				id: "dataMenu",
				style: "display:none;",
			});
	
			//remove old EJScreen Maps panel
			//TODO: delete this panel entirely instead of commenting out once new widget updated
			// menu.addChild(new MenuItem({
			//     label: "EJScreen Maps",
			//     onClick: function(evt) {
			//         toggleSearchPan("ejmapfloater");
			//     },
			//     disabled: false
			// }));
	
			addEjindexWidget();
			addPlacesWidget();
	
			menu.addChild(
				new MenuItem({
					label: "Side-by-Side Maps",
					onClick: function (evt) {
						window.open("comparemapper.html");
					},
					disabled: false,
				})
			);
	
			menu.addChild(
				new MenuItem({
					label: "Additional Demographics",
					onClick: function (evt) {
						toggleSearchPan("demogfloater");
					},
					disabled: false,
				})
			);
	
			// menu.addChild(
			// 	new MenuItem({
			// 		label: "Threshold Map",
			// 		onClick: function (evt) {
			// 			toggleSearchPan("thresholdfloater");
			// 		},
			// 		disabled: false,
			// 	})
			// );
	
			//addDemogWidget();
			//addThresholdWidget();
			addEnviJusticeIndex();
			addEnviJusticeIndexSupp();
			addPollutionSources();
			addSocioeconomicInd();
			addHealthDisparities();
			addClimateChange();
			addCriticalData();
			// add shapefile
			menu.addChild(
				new MenuItem({
					label: "Add Shapefile",
					onClick: function (evt) {
						toggleSearchPan("shapefilefloater");
					},
					disabled: false,
				})
			);
	
			addShapeFile();
			/*  var pandiv = domConstruct.create("div", {
				id: "shapefilefloater",
				innerHTML: "<div id='shapefileDiv' style='margin: 4px 4px 4px 4px; overflow: auto;'></div>"
			});
	
			document.body.appendChild(pandiv);
			var fp5 = new ParentConstrainedFloatingPane({
				title: "Add Shapefile",
				resizable: true,
				dockable: false,
				closable: true,
				style: "position:absolute;top:90px;left:50px;width:360px;height:360px;z-index:100;visibility:hidden;overflow:hidden;",
				id: 'shapefilefloater'
			}, dojo.byId('shapefilefloater'));
			fp5.startup();
			fp5.close = closepane;
			// panelArray.push("shapefilefloater");
	
			var sfwg = new AddShapefile({ view: view }, "shapefileDiv");
			sfwg.startup();*/
			//end of add shapefile
	
			var pSubMenu = new Menu();
	
			for (var slayer in serviceJSON) {
				var sdesc = serviceJSON[slayer].description;
				var stype = serviceJSON[slayer].type;
				var lyr = serviceJSON[slayer].layerurl;
				if (
					stype.toLowerCase() == "agsdynamic" ||
					stype.toLowerCase() == "agstile" ||
					stype.toLowerCase() == "featurelayer"
				) {
					pSubMenu.addChild(
						new MenuItem({
							label: sdesc,
							id: slayer,
							onClick: function (evt) {
								var tid = evt.target.id;
								var ilayer = tid.replace("_text", "");
								addServiceByKey(ilayer, serviceJSON);
							},
							disabled: false,
						})
					);
				} else if (stype.toLowerCase() == "grouppanel") {
					//create a panel with a group of layers that can be added to the map instead of adding them directly as above.
	
					//use slayer as the string since that will not contain spaces, use desc for any labels
					var layernamesave = slayer.toUpperCase();
					//var layernamesave = (' ' + slayer.toUpperCase()).slice(1);
					//TO DO: wiring toggleSearchPan with the base name and then variable does not work, always uses last in lest. Hardcoding for now, is there a way to use variable?
					//If new panel is added to config, need to add a new if statement for it
					if (slayer == "climatepanel") {
						pSubMenu.addChild(
							new MenuItem({
								label: sdesc,
								iconClass: "iconLink",
								onClick: function () {
									toggleSearchPan("suglayerfloaterCLIMATEPANEL");
								},
							})
						);
					}
					if (slayer == "critsvcgapspanel") {
						pSubMenu.addChild(
							new MenuItem({
								label: sdesc,
								iconClass: "iconLink",
								onClick: function () {
									toggleSearchPan("suglayerfloaterCRITSVCGAPSPANEL");
								},
							})
						);
					}
					if (slayer == "healthpanel") {
						pSubMenu.addChild(
							new MenuItem({
								label: sdesc,
								iconClass: "iconLink",
								onClick: function () {
									toggleSearchPan("suglayerfloaterHEALTHPANEL");
								},
							})
						);
					}
					//using variable keeps refrence to last value in list, doesn't work, fix above. Find way to clone this value?
					// pSubMenu.addChild(new MenuItem({
					//     label: sdesc,
					//     iconClass: "iconLink",
					//     onClick: function() {
					//        // toggleSearchPan("suglayerfloater" + sdesc);
					//         toggleSearchPan("suglayerfloater" + layernamesave);
					//     },
					// }));
	
					var pandivGroup = domConstruct.create("div", {
						id: "suglayerfloater" + layernamesave,
						innerHTML: "<div id='suglayerDiv" + layernamesave + "'></div>",
					});
	
					var divobjGROUP = dojo.create("div", {
						//"title": tiptext,
						innerHTML: "<div id='suglayerDiv" + layernamesave + "'></div>",
	
						onclick: function () {
							wobj.ejformNode.ejcat.value = this.value;
							wobj.createColList(this.value);
							wobj.clearVarStyle(this);
							this.style.backgroundColor = "rgb(76,158,217)";
							this.style.color = "White";
						},
						onmouseover: function () {
							this.style.border = "1px solid navy";
							var keyvalue = this.value;
							var pa = keyvalue.split("|")[0];
							var pej = keyvalue.split("|")[1];
							var tiptext = "test";
							agsTOCNode.innerHTML = tiptext;
						},
						onmouseout: function () {
							this.style.border = "1px solid white";
							wobj.metaNode.innerHTML = "";
						},
					});
	
					// EJ2020 suglayerfloater stuff:
					var panelArray = [];
					document.body.appendChild(pandivGroup);
					var fpGroup = new ParentConstrainedFloatingPane(
						{
							title: sdesc,
							resizable: true,
							dockable: false,
							closable: true,
							//style: "position:absolute;top:90px;left:50px;width:360px;height:320px;z-index:100;visibility:hidden;overflow:hidden;",
							style:
								"position:absolute;top:90px;left:50px;width:360px;height:320px;z-index:100;visibility:hidden;overflow:hidden;",
							id: "suglayerfloater" + layernamesave,
						},
						dojo.byId("suglayerfloater" + layernamesave)
					);
					fpGroup.startup();
	
					fpGroup.close = closepane;
					panelArray.push("suglayerfloater" + layernamesave);
	
					//8/9/21, add in metanchor object to lookup anchor links
					var sgwg = new SuggestLayers(
						{
							view: view,
							tocdivid: "twotoc",
							suglayerlist: lyr,
							metadataanchors: metanchors,
						},
						"suglayerDiv" + layernamesave
					);
				} else {
					//handle any other types
				}
			}
			//    pSubMenu.addChild(new MenuItem({
			//        label: "Submenu item"
			//    }));
			menu.addChild(
				new PopupMenuItem({
					label: "Additional Layers",
					disabled: false,
					popup: pSubMenu,
				})
			);
	
			var pSubSearchMenu = new Menu();
	
			pSubSearchMenu.addChild(
				new MenuItem({
					label: "Search Geoplatform",
					onClick: function (evt) {
						toggleSearchPan("searchfloater");
					},
					disabled: false,
				})
			);
	
			addGeoplatformWidget();
	
			pSubSearchMenu.addChild(
				new MenuItem({
					label: "Add Map Services",
					onClick: function (evt) {
						toggleSearchPan("layerfloater");
					},
					disabled: false,
				})
			);
	
			addWebLayerWidget();
	
			menu.addChild(
				new dijit.PopupMenuItem({
					label: "Search For Maps",
					disabled: false,
					popup: pSubSearchMenu,
				})
			);
	
			//create dropdown button to display menu
			var menuButton = new DropDownButton({
				label: "Add Maps",
				id: "dataButton",
				title: "See EJScreen and other supplementary map data",
				dropDown: menu,
				iconClass: "esriAddContentIcon",
			});
			menuButton.startup();
			toolbarsHash[menuButton.id] = menuButton.label;
			//dojo.byId('webmap-toolbar-center').appendChild(menuButton.domNode);
		}
	
		function toggleSearchPan(skey) {
			// add function to expand the check box when loaded
			//toggleDiv(this, "noaa")
			//class='toggle' onmousedown = 'toggleDiv(this,""" & ejFolderName & """);'
			if (dojo.byId(skey).style.visibility === "hidden") {
				closeAllPanels();
				dijit.byId(skey).show();
				//dojo.byId('stext').focus();
				if (skey == "searchfloater") {
					dijit
						.byId("searchwg")
						._initPane("EJSCREEN", "400aa71edd1b4bc2a9df4b08bb9afa7b");
					addHighlightIcon(
						"searchGeoPlatform",
						"esriGeoplatform",
						"esriGeoplatformHighlight"
					);
				}
				if (skey == "demogfloater") {
					addHighlightIcon(
						"moreDemographicMaps",
						"esriMoreDemographics",
						"esriMoreDemographicsHighlight"
					);
					//hide all other tabs sub categories
					subCategoryTabs.forEach((e) => {
						$(e).css("display", "none");
					});
				}
				if (skey == "shapefilefloater") {
					addHighlightIcon(
						"addShapeFile",
						"esriShapefile",
						"esriShapefileHighlight"
					);
				}
				if (skey == "layerfloater") {
					addHighlightIcon(
						"addRemoteMaps",
						"esriRemoteMaps",
						"esriRemoteMapsHighlight"
					);
				}
				if (skey == "thresholdfloater") {
					addHighlightIcon(
						"thresholdMaps",
						"esriThreshold",
						"esriThresholdHighlight"
					);
				}
			} else {
				dijit.byId(skey).hide();
				if (skey == "searchfloater") {
					removeHighlightIcon(
						"searchGeoPlatform",
						"esriGeoplatform",
						"esriGeoplatformHighlight"
					);
				}
				if (skey == "demogfloater") {
					removeHighlightIcon(
						"moreDemographicMaps",
						"esriMoreDemographics",
						"esriMoreDemographicsHighlight"
					);
				}
				if (skey == "shapefilefloater") {
					removeHighlightIcon(
						"addShapeFile",
						"esriShapefile",
						"esriShapefileHighlight"
					);
				}
				if (skey == "layerfloater") {
					removeHighlightIcon(
						"addRemoteMaps",
						"esriRemoteMaps",
						"esriRemoteMapsHighlight"
					);
				}
				if (skey == "thresholdfloater") {
					removeHighlightIcon(
						"thresholdMaps",
						"esriThreshold",
						"esriThresholdHighlight"
					);
				}
			}
		}
	
		function addEjindexWidget() {
			var ejwidget = new MapEJIndexMod(
				{
					map: view.map,
					//indextype: ejtype,
					id: "ejmapwg",
					//params for layer add
					view: view,
					tocdivid: "twotoc",
				},
				"ejmapDiv"
			);
			ejwidget.startup();
		}
	
		function addPlacesWidget() {
			var plwidget = new Places(
				{
					map: view.map,
					//indextype: ejtype,
					id: "placeswg",
				},
				"placesDiv"
			);
			plwidget.startup();
		}
	
		function removePreviousHighlights(id) {
			//corner case for the maps tab
			//panel is not hiding when other tabs are clicked
			if (
				id != "moreDemographicMaps" &&
				$("#moreDemographicMaps").hasClass("highlight")
			) {
				dijit.byId("demogfloater").hide();
			}
	
			if (id != "thresholdMaps" && $("#thresholdMaps").hasClass("highlight")) {
				dijit.byId("thresholdfloater").hide();
			}
	
			for (var i = 0; i < toggledByButtons.length; i++) {
				if (toggledByButtons[i] != id) {
					var tempObj = getFourthSpanChildObj(toggledByButtons[i]);
					var classList = $(tempObj).attr("class");
					if (classList.indexOf("Highlight") > -1) {
						var classListTemp = classList.split(" ");
						var baseC = classListTemp[3].substring(
							0,
							classListTemp[3].length - 9
						);
						removeHighlightIcon(toggledByButtons[i], baseC, classListTemp[3]);
					}
				}
			}
		}
	
		function toggleClassesAndImgs(id, baseClassName, highlightedClassName) {
			removePreviousHighlights(id);
			var targetObj = getFourthSpanChildObj(id);
			var targetObjLb = getLabelObj(id);
			if (targetObj && $(targetObj).hasClass(baseClassName)) {
				$(targetObj).removeClass(baseClassName).addClass(highlightedClassName);
				$(targetObjLb).css("color", "white");
				$("#" + id).addClass("highlight");
			} else {
				$(targetObj).removeClass(highlightedClassName).addClass(baseClassName);
				$(targetObjLb).css("color", "black");
				$("#" + id).removeClass("highlight");
			}
		}
	
		function getFourthSpanChildObj(id) {
			var temp = "#" + id + " > span > span >span >span";
			return $($(temp)[0]);
		}
		function getLabelObj(id) {
			return "#" + id + "_label";
		}
	
		function addHighlightIcon(id, baseClassName, highlightedClassName) {
			removePreviousHighlights(id);
			var targetObj = getFourthSpanChildObj(id);
			var targetObjLb = getLabelObj(id);
			if (targetObj) {
				targetObj.removeClass(baseClassName).addClass(highlightedClassName);
				$(targetObjLb).css("color", "white");
				$("#" + id).addClass("highlight");
			}
		}
	
		function removeHighlightIcon(id, baseClassName, highlightedClassName) {
			var targetObj = getFourthSpanChildObj(id);
			var targetObjLb = getLabelObj(id);
			if (targetObj) {
				targetObj.removeClass(highlightedClassName).addClass(baseClassName);
				$(targetObjLb).css("color", "black");
				$("#" + id).removeClass("highlight");
			}
		}
	
		function addEnviJusticeIndex() {
			var increaseBy = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			var buttonEnvJuIn = new Button({
				label: "Environmental Justice Indexes" + increaseBy,
				title: "Maps combining a single environmental indicator with the demographic index",
				id: "envJusticeMaps",
				iconClass: "esriEnvJustice",
				onClick: function (e) {
					toggleClassesAndImgs(
						"envJusticeMaps",
						"esriEnvJustice",
						"esriEnvJusticeHighlight"
					);
				},
			});
			dojo.byId("envJusticeMaps").appendChild(buttonEnvJuIn.domNode);
		}
	
		function addEnviJusticeIndexSupp() {
			var increaseBy = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			var buttonEnvJuInSupp = new Button({
				label: "Supplemental Indexes" + increaseBy,
				title: "Maps combining a single environmental indicator with the supplemental demographic index",
				id: "envJusticeMapsSupp",
				iconClass: "esriEnvJusticeSupp",
				onClick: function (e) {
					toggleClassesAndImgs(
						"envJusticeMapsSupp",
						"esriEnvJusticeSupp",
						"esriEnvJusticeSuppHighlight"
					);
				},
			});
			dojo.byId("envJusticeMapsSupp").appendChild(buttonEnvJuInSupp.domNode);
		}
	
		function addSocioeconomicInd() {
			var increaseBy =
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	
			var buttonSocioEcoInd = new Button({
				label: "Socioeconomic Indicators" + increaseBy,
				title: "Maps of socioeconomic data",
				id: "demographicData",
				iconClass: "esriSocioIndi",
				onClick: function (e) {
					toggleClassesAndImgs(
						"demographicData",
						"esriSocioIndi",
						"esriSocioIndiHighlight"
					);
				},
			});
			dojo.byId("demographicData").appendChild(buttonSocioEcoInd.domNode);
		}
	
		function addHealthDisparities() {
			var increaseBy =
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			var buttonHealthDis = new Button({
				label: "Health Disparities" + increaseBy,
				title: "Tract level health data",
				id: "healthDisparitiesData",
				iconClass: "esriHealthDisparities",
				onClick: function (e) {
					toggleClassesAndImgs(
						"healthDisparitiesData",
						"esriHealthDisparities",
						"esriHealthDisparitiesHighlight"
					);
				},
			});
			//domStyle.set("healthDisparitiesData_label", "padding", "50px");
			dojo.byId("healthDisparitiesData").appendChild(buttonHealthDis.domNode);
		}
	
		function addClimateChange() {
			var increaseBy =
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	
			var buttonClimateChange = new Button({
				label: "Climate Change" + increaseBy,
				title: "Climate change related maps",
				id: "climateChangeData",
				iconClass: "esriClimateChange",
				onClick: function (e) {
					toggleClassesAndImgs(
						"climateChangeData",
						"esriClimateChange",
						"esriClimateChangeHighlight"
					);
				},
			});
			dojo.byId("climateChangeData").appendChild(buttonClimateChange.domNode);
		}
	
		function addCriticalData() {
			var increaseBy =
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	
			var buttonCriticalD = new Button({
				label: "Critical Service Gaps" + increaseBy,
				title: "Maps of community services",
				id: "criticalData",
				iconClass: "esriCriticalData",
				onClick: function (e) {
					toggleClassesAndImgs(
						"criticalData",
						"esriCriticalData",
						"esriCriticalDataHighlight"
					);
				},
			});
			dojo.byId("criticalData").appendChild(buttonCriticalD.domNode);
		}
	
		function addPollutionSources() {
				var buttonPolluSources = new Button({
				label: "Environmental Burden Indicators" ,
				title: "Environmental and pollution related maps",
				id: "pollutionData",
				iconClass: "esriPollutionSrc",
				onClick: function (e) {
					toggleClassesAndImgs(
						"pollutionData",
						"esriPollutionSrc",
						"esriPollutionSrcHighlight"
					);
				},
			});
			dojo.byId("pollutionData").appendChild(buttonPolluSources.domNode);
		}
	
		function addDemogWidget() {
			var toggleButton4 = new Button({
				label: "Additional Demographics",
				title: "More demographic maps",
				id: "moreDemographicMaps",
				iconClass: "esriMoreDemographics",
				onClick: function (e) {
					toggleSearchPan("demogfloater");
				},
			});
			dojo.byId("moreDemographicMaps").appendChild(toggleButton4.domNode);
			//toggleButton4.on("click", toggleSearchPan);
	
			$("#moreDemographicMaps_label").append(
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
			);
	
			var pandiv = domConstruct.create("div");
			pandiv.id = "demogfloater";
			pandiv.innerHTML =
				"<div id='demogDiv' style='margin: 4px 4px 4px 4px;'></div>";
			document.body.appendChild(pandiv);
	
			var fp = new ParentConstrainedFloatingPane(
				{
					title: "Additional Demographics",
					resizable: false,
					dockable: false,
					closable: true,
					style:
						"position:absolute;top:80px;left:80px;width: 420px;height:195px;z-index:100;visibility:hidden;overflow:hidden;",
					id: "demogfloater",
				},
				dojo.byId("demogfloater")
			);
			fp.startup();
	
			fp.close = function (e) {
				var panid = e.target.offsetParent.id;
				//alert(panid);
				toggleSearchPan(panid);
			};
	
			/* var dmwidget = new MapDemographics(
				{
					view: view,
					//indextype: ejtype,
					id: "dgwg",
				},
				"demogDiv"
			);
			dmwidget.startup(); */
	
			//dojo.byId('ejmapwg').style.height = "96%";
			//dojo.byId('ejmapwg').style.overflow = "auto";
			// var toggled = true;
			// dojo.connect(toggleButton4,"onClick", function toggle(){
			//     // this.set("iconClass", toggled ? "dijitEditorIcon dijitEditorIconCut" : "dijitEditorIcon dijitEditorIconPaste");
			//     this.set("iconClass", toggled ? "esriMoreDemographicsHighlight" : "esriMoreDemographics");
			//     toggled = !toggled;
			//  });
		}
	
		function addThresholdWidget() {
			var toggleThreshold = new Button({
				label: "Threshold Map",
				title: "User defined index maps",
				id: "thresholdMaps",
				iconClass: "esriThreshold",
				onClick: function (e) {
					toggleSearchPan("thresholdfloater");
				},
			});
			dojo.byId("thresholdMaps").appendChild(toggleThreshold.domNode);
			//toggleButton4.on("click", toggleSearchPan);
	
			$("#thresholdMaps_label").append(
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
			);
	
			var pandiv = domConstruct.create("div");
			pandiv.id = "thresholdfloater";
			pandiv.innerHTML =
				"<div id='thresholdDiv' style='margin: 4px 4px 4px 4px;'></div>";
			document.body.appendChild(pandiv);
	
			var fpt = new ParentConstrainedFloatingPane(
				{
					title: "Indexes Threshold Map Widget",
					resizable: false,
					dockable: false,
					closable: true,
					style:
						"position:absolute;top:80px;left:80px;width:400px;height:640px;z-index:100;visibility:hidden;overflow:hidden;y-scroll:hidden",
					id: "thresholdfloater",
				},
				"thresholdfloater"
			);
			fpt.startup();
	
			fpt.close = function (e) {
				var panid = e.target.offsetParent.id;
				//alert(panid);
				toggleSearchPan(panid);
			};
			var ctwidget = new ThresholdWidget(
				{
					view: view,
					//indextype: ejtype,
					id: "ctwg",
				},
				"thresholdDiv"
			);
			ctwidget.startup();
		}
	
		/* function addDemogWidget() {
			var pandiv = document.createElement("div");
			pandiv.id = "demogfloater";
			pandiv.innerHTML = "<div id='demogDiv' style='margin: 4px 4px 4px 4px;'></div>";
			document.body.appendChild(pandiv);
		  // dojo.byId('moreDemographicMaps').appendChild(pandiv);
		   var fp = new ParentConstrainedFloatingPane({
				title: "Map Demographics",
				resizable: true,
				dockable: false,
				closable: true,
				style: "position:absolute;top:80px;left:80px;width: 420px;height:420px;z-index:100;visibility:hidden;overflow:hidden;",
				id: 'demogfloater'
			}, 'demogfloater');
			fp.startup();
	
			fp.close = function(e) {
				var panid = e.target.offsetParent.id;
				toggleSearchPan(panid);
			};
	
	
			var dmwidget = new MapDemographics({
				view: view,
				//indextype: ejtype,
				id: 'dgwg'
			}, 'demogDiv');
			dmwidget.startup();
	
			//dojo.byId('ejmapwg').style.height = "96%";
			//dojo.byId('ejmapwg').style.overflow = "auto";
		}*/
	
		// function addGeoplatformWidget() {
		//     var b = view.widthBreakpoint;
		//     var w = "780px";
		//     var h = "460px";
		//     if (b == "xsmall") {
		//         w = "80%";
		//         h = "80%";
		//     }
		//     var pandiv = document.createElement("div");
		//     pandiv.id = "searchfloater";
		//     pandiv.innerHTML = "<div id='serviceDiv'></div>";
		//     document.body.appendChild(pandiv);
		//     var fp1 = new ParentConstrainedFloatingPane({
		//         title: "Search Geoplatform",
		//         resizable: true,
		//         dockable: false,
		//         closable: true,
		//         style: "position:absolute;top:60px;left:50px;width: " + w + ";height:" + h + ";z-index:100;visibility:hidden;",
		//         id: 'searchfloater'
		//     }, dojo.byId('searchfloater'));
		//     fp1.startup();
		//     fp1.close = function(e) {
		//         var panid = e.target.offsetParent.id;
		//         toggleSearchPan(panid);
		//     };
	
		//     var searchwg = new SearchServices({ view: view, id: "searchwg" }, "serviceDiv");
		//     searchwg.startup();
	
		// }
		function addShapeFile() {
			var toggleButton8 = new Button({
				label: "Add Shapefile",
				title: "Import locations",
				id: "addShapeFile",
				iconClass: "esriShapefile",
				onClick: function (e) {
					toggleSearchPan("shapefilefloater");
				},
			});
			dojo.byId("addShapeFile").appendChild(toggleButton8.domNode);
	
			$("#addShapeFile_label").append(
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
			);
			var pandiv = domConstruct.create("div", {
				id: "shapefilefloater",
				innerHTML:
					"<div id='shapefileDiv' style='margin: 4px 4px 4px 4px; overflow: auto;'></div>",
			});
	
			document.body.appendChild(pandiv);
			var fp5 = new ParentConstrainedFloatingPane(
				{
					title: "Add Shapefile",
					resizable: true,
					dockable: false,
					closable: true,
					style:
						"position:absolute;top:90px;left:50px;width:360px;height:360px;z-index:100;visibility:hidden;overflow:hidden;",
					id: "shapefilefloater",
				},
				dojo.byId("shapefilefloater")
			);
			fp5.startup();
			fp5.close = closepane;
			// panelArray.push("shapefilefloater");
	
			var sfwg = new AddShapefile({ view: view }, "shapefileDiv");
			sfwg.startup();
		}
	
		function addGeoplatformWidget() {
			var b = view.widthBreakpoint;
			var w = "780px";
			var h = "460px";
			if (b == "xsmall") {
				w = "80%";
				h = "80%";
			}
	
			var toggleButton5 = new Button({
				label: "Search Geoplatform",
				title: "Search available maps on the GeoPlatform",
				id: "searchGeoPlatform",
				iconClass: "esriGeoplatform",
				onClick: function (e) {
					toggleSearchPan("searchfloater");
				},
			});
			dojo.byId("searchGeoPlatform").appendChild(toggleButton5.domNode);
			$("#searchGeoPlatform_label").append(
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
			);
	
			var pandiv = document.createElement("div");
			pandiv.id = "searchfloater";
			pandiv.innerHTML = "<div id='serviceDiv'></div>";
			document.body.appendChild(pandiv);
			var fp1 = new ParentConstrainedFloatingPane(
				{
					title: "Search Geoplatform",
					resizable: true,
					dockable: false,
					closable: true,
					style:
						"position:absolute;top:60px;left:50px;width: " +
						w +
						";height:" +
						h +
						";z-index:100;visibility:hidden;",
					id: "searchfloater",
				},
				dojo.byId("searchfloater")
			);
			fp1.startup();
			fp1.close = function (e) {
				removeHighlightIcon(
					"searchGeoPlatform",
					"esriGeoplatform",
					"esriGeoplatformHighlight"
				);
				var panid = e.target.offsetParent.id;
				toggleSearchPan(panid);
			};
	
			var searchwg = new SearchServices(
				{ view: view, id: "searchwg" },
				"serviceDiv"
			);
			searchwg.startup();
		}
	
		function addWebLayerWidget() {
			var toggleButton6 = new Button({
				label: "Add Map Services",
				title: "Import a published map",
				id: "addRemoteMaps",
				iconClass: "esriRemoteMaps",
				onClick: function (e) {
					toggleSearchPan("layerfloater");
				},
			});
			dojo.byId("addRemoteMaps").appendChild(toggleButton6.domNode);
			$("#addRemoteMaps_label").append(
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
			);
	
			var pandiv = document.createElement("div");
			pandiv.id = "layerfloater";
			pandiv.innerHTML =
				"<div id='layerDiv' style='margin: 4px 4px 4px 4px;'></div>";
			document.body.appendChild(pandiv);
			var fp3 = new ParentConstrainedFloatingPane(
				{
					title: "Add Map Services",
					resizable: true,
					dockable: false,
					closable: true,
					style:
						"position:absolute;top:60px;left:50px;width:400px;height:360px;z-index:100;visibility:hidden;",
					id: "layerfloater",
				},
				dojo.byId("layerfloater")
			);
			fp3.startup();
			fp3.close = function (e) {
				var panid = e.target.offsetParent.id;
				removeHighlightIcon(
					"addRemoteMaps",
					"esriRemoteMaps",
					"esriRemoteMapsHighlight"
				);
				toggleSearchPan(panid);
			};
			var giswebwg = new SearchGISweb({ view: view }, "layerDiv");
			giswebwg.startup();
		}
	
		//Create menu of add reports
		function createReportMenu() {
			//create a dropdown button to display the menu
			//build a menu with a list of sharing options
			var menu = new Menu({
				id: "reportMenu",
				style: "display:none;",
			});
	
			menu.addChild(
				new MenuItem({
					label: "Select Location",
					onClick: function (evt) {
						toggleChart();
					},
					disabled: false,
				})
			);
	
			addChartWidget();
	
			menu.addChild(
				new MenuItem({
					label: "Select Multiple",
					onClick: function (evt) {
						toggleKnownGeo();
					},
					disabled: false,
				})
			);
	
			addKnownGeo();
	
			//create dropdown button to display menu
			var menuButton = new DropDownButton({
				label: "Select Location",
				id: "reportButton",
				title: "Select Location",
				dropDown: menu,
				iconClass: "esriViewIcon",
			});
			menuButton.startup();
			toolbarsHash[menuButton.id] = menuButton.label;
			// dojo.byId('webmap-toolbar-center').appendChild(menuButton.domNode);
		}
	
		function addChartWidget() {
			var pandiv = document.createElement("div");
			pandiv.id = "chartfloater";
			pandiv.innerHTML =
				"<div id='chartDiv' style='margin: 4px 4px 4px 4px;'></div>";
			// document.body.appendChild(pandiv);
			$("#menu").append(pandiv);
			/*  var fp = new ParentConstrainedFloatingPane({
				title: "Select Location",
				resizable: true,
				dockable: false,
				closable: true,
				style: "position:absolute;width: 300px;height: 280px;top: 81px; left: 60px; z-index:100;visibility:hidden;",
				id: 'chartfloater'
			}, 'chartfloater');
			fp.startup();
			fp.close = toggleChart;*/
			
			var chartwidget = new ejChart(
				{
					view: view,
					id: "chartwg",
				},
				"chartDiv"
			);
			chartwidget.startup();
			addSidePop();
		}
	
		function toggleChart() {
			if (dojo.byId("chartfloater").style.visibility === "hidden") {
				closeAllPanels();
				dijit.byId("chartfloater").show();
				disableIdentify();
				dijit.byId("chartwg").openinit();
			} else {
				dijit.byId("chartfloater").hide();
				dijit.byId("chartwg").closePane();
				enableIdentify();
			}
		}
	
		function addKnownGeo() {
			var toggleButton7 = new Button({
				label: "Select Multiple",
				title: "Select multiple areas",
				id: "selectMultipleDiv",
				iconClass: "esriSelectMultiple",
				onClick: function (e) {
					toggleKnownGeo();
				},
			});
	
			// toggleButton5.on("click", toggleKnownGeo);
	
			dojo.byId("selectMultipleDiv").appendChild(toggleButton7.domNode);
			// $("#selectMultipleDiv_label").append(
			// 	"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
			// );
			// $("#selectMultipleDiv_label").append(
				// "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
			// );
			var pandiv = document.createElement("div");
			pandiv.id = "kgeofloater";
			pandiv.innerHTML =
				"<div id='kgeoDiv' style='margin: 4px 4px 4px 4px;'></div>";
			document.body.appendChild(pandiv);
			// $('#menu').append(pandiv);
			var fp = new ParentConstrainedFloatingPane(
				{
					title: "Select Multiple",
					resizable: true,
					dockable: false,
					closable: true,
					style:
						"position:absolute;width: 300px;height: 300px;top: 81px; left: 60px; z-index:100;visibility:hidden;",
					id: "kgeofloater",
				},
				"kgeofloater"
			);
			fp.startup();
			fp.close = toggleKnownGeo;
	
			var kgeowidget = new ejKnownGeo(
				{
					view: view,
					id: "kgeowg",
				},
				"kgeoDiv"
			);
			kgeowidget.startup();
		}
	
		function toggleKnownGeo() {
			if (dojo.byId("kgeofloater").style.visibility === "hidden") {
				closeAllPanels();
				dijit.byId("kgeofloater").show();
				disableIdentify();
				dijit.byId("kgeowg").openinit();
				addHighlightIcon(
					"selectMultipleDiv",
					"esriSelectMultiple",
					"esriSelectMultipleHighlight"
				);
			} else {
				dijit.byId("kgeofloater").hide();
				dijit.byId("kgeowg").closePane();
				enableIdentify();
				removeHighlightIcon(
					"selectMultipleDiv",
					"esriSelectMultiple",
					"esriSelectMultipleHighlight"
				);
			}
		}
	
		function addSidePop() {
			var pheight = view.height - 30;
			if (pheight > 650) {
				pheight = 650;
			}
			var pandiv = document.createElement("div");
			pandiv.id = "sidefloater";
			pandiv.innerHTML =
				"<div id='sideDiv' style='margin: 4px 4px 4px 4px; height: " +
				pheight +
				"px; overflow: auto;'></div>";
			document.body.appendChild(pandiv);
	
			var fp = new ParentConstrainedFloatingPane(
				{
					title: "Explore Charts",
					resizable: true,
					dockable: false,
					closable: true,
					style:
						"position:absolute;top:0px;left:0px;width: 900px; height:" +
						pheight +
						"px;z-index:100;visibility:hidden;",
					id: "sidefloater",
				},
				"sidefloater"
			);
			fp.startup();
			fp.close = closepane;
	
			var ejwidget = new EJreport(
				{
					view: view,
					id: "ejwg",
				},
				"sideDiv"
			);
			ejwidget.startup();
			dojo.byId("ejwg").style.height = "94%";
			addTabularView();
		}
	
		function addTabularView() {
			var pandiv = document.createElement("div");
			pandiv.id = "tablefloater";
			pandiv.innerHTML =
				"<div id='tabularDiv' style='margin: 4px 4px 4px 4px;'></div>";
			document.body.appendChild(pandiv);
			var pW = view.width - 660;
			var fp = new ParentConstrainedFloatingPane(
				{
					title: "Tabular View",
					resizable: true,
					dockable: false,
					closable: true,
					style:
						"position:absolute;bottom:30px;left:610px;width: " +
						pW +
						"px; height:240px;z-index:100;visibility:hidden;",
					id: "tablefloater",
				},
				"tablefloater"
			);
			fp.startup();
			fp.close = closepane;
			//dojo.connect(fp._resizeHandle, "onresize", resizeGrid);
			dojo.connect(fp._resizeHandle, "onResize", function (e) {
				// Your event handler
				var mygrid = dijit.byId("grid");
				mygrid.style.height = "80%";
				mygrid.resize();
				mygrid.update();
			});
	
			var ejtablewidget = new EJtable(
				{
					view: view,
					id: "ejtablewg",
				},
				"tabularDiv"
			);
			ejtablewidget.startup();
		}
	
		function closepane(e) {
			var pane = e.target.offsetParent;
			var floaterid = pane.id;
			if (floaterid == "shapefilefloater") {
				removeHighlightIcon(
					"addShapeFile",
					"esriShapefile",
					"esriShapefileHighlight"
				);
			}
			dijit.byId(floaterid).hide();
		}
	
		function addServiceByKey(skey, jsonObj) {
			console.log(jsonObj)
			if (view.map.findLayerById(skey) && skey === "ejbnd") {
				if (boundariesJSON.hasOwnProperty(skey)) {
					var layerVal = view.map.findLayerById(skey);
					view.map.remove(layerVal);
					$("#" + skey).removeClass("highlight");
					var srcAttr = $("#" + skey)
						.find("img")
						.attr("src");
					if (srcAttr) {
						var srcImgInput = srcAttr.substring(
							srcAttr.lastIndexOf("/") + 1,
							srcAttr.length
						);
						// var srcImg  = srcImgInput.split(/_(.+)/)[0]+"_"+srcImgInput.split(/_(.+)/)[1];
						var srcImg = srcImgInput.replace("_white", "");
						$("#" + skey)
							.find("img")
							.attr("src", "mapdijit/templates/images/" + srcImg);
					}
				}
				return false;
			}
			
			var stype = jsonObj[skey].type;
			console.log(jsonObj)
			var sdesc = jsonObj[skey].description;
			var surl = jsonObj[skey].layerurl;
			var trans = jsonObj[skey].transparency;
			if (stype == "featurelayer") {
				var infoTemplate = new PopupTemplate();
	
				infoTemplate.title = sdesc;
				infoTemplate.content = idDesc;
				//infoTemplate.content = "{*}";
				console.log("surl", surl)
				var templayer = new FeatureLayer(surl, {
					mode: FeatureLayer.MODE_ONDEMAND,
					id: skey,
					title: sdesc,
					popupTemplate: infoTemplate,
					outFields: ["*"],
					opacity: trans,
				});
				view.map.add(templayer);
			} else {
				console.log(jsonObj)
				var svcname = jsonObj[skey].service;
				var agsurl = surl + svcname + "/MapServer";
				var onlayer = jsonObj[skey].defaultlayer;
	
				var isDynamic = jsonObj[skey].dynamic;
				var httpreg = /^http:\/\//i;
				if (httpreg.test(agsurl)) {
					var domainurl = agsurl;
					var domainpat = /^http:\/\/[A-Za-z0-9_\.]+\//i;
					var match = agsurl.match(domainpat);
					if (match != null) {
						domainurl = match[0];
					}
					require(["esri/config"], function (esriConfig) {
						esriConfig.request.proxyRules = {
							urlPrefix: domainurl,
							proxyUrl: proxyurl,
						};
					});
				}
				var templayer = null;
				if (stype == "agstile") {
					if (view.map.findLayerById(skey)) {
						return false;
					} else {
						templayer = new TileLayer({
							id: skey,
							title: sdesc,
							url: agsurl,
							opacity: trans,
						});
						view.map.add(templayer);
					}
				} else if (stype == "agsdynamic") {
					if (view.map.findLayerById(skey)) {
						return false;
					} else {
						templayer = new MapImageLayer(agsurl, {
							id: skey,
							title: sdesc,
							url: agsurl,
							//sublayers: onlayer,
							opacity: trans,
						});
	
						if (!isDynamic) {
							if (jsonObj[skey].listlayer) {
								templayer.selectedlayers = jsonObj[skey].listlayer;
							}
						}
					}
					console.log(templayer)
					view.map.add(templayer);
					templayer.on("layerview-create", function (event) {
						if (onlayer.length > 0 && onlayer[0] != -1) {
							for (var j = 0; j < onlayer.length; j++) {
								var o = onlayer[j];
								console.log("templayer")
								templayer.findSublayerById(o).visible = true;
							}
						}
					});
				}
			}
		}
	
		function closeAllPanels() {
			if (
				dojo.byId("chartfloater") &&
				dojo.byId("chartfloater").style.visibility === "visible"
			) {
				toggleChart();
			}
			if (
				dojo.byId("kgeofloater") &&
				dojo.byId("kgeofloater").style.visibility === "visible"
			) {
				toggleKnownGeo();
			}
			if (
				dojo.byId("floater") &&
				dojo.byId("floater").style.visibility === "visible"
			) {
				toggleMeasure();
			}
			if (
				dojo.byId("ejmapfloater") &&
				dojo.byId("ejmapfloater").style.visibility === "visible"
			)
				dijit.byId("ejmapfloater").hide();
			if (
				dojo.byId("searchfloater") &&
				dojo.byId("searchfloater").style.visibility === "visible"
			)
				dijit.byId("searchfloater").hide();
			if (
				dojo.byId("layerfloater") &&
				dojo.byId("layerfloater").style.visibility === "visible"
			)
				dijit.byId("layerfloater").hide();
			if (
				dojo.byId("sidefloater") &&
				dojo.byId("sidefloater").style.visibility === "visible"
			)
				dijit.byId("sidefloater").hide();
			if (
				dojo.byId("demogfloater") &&
				dojo.byId("demogfloater").style.visibility === "visible"
			)
				dijit.byId("demogfloater").hide();
			if (
				dojo.byId("thresholdfloater") &&
				dojo.byId("thresholdfloater").style.visibility === "visible"
			) {
				dijit.byId("thresholdfloater").hide();
				//toggleSearchPan("thresholdfloater");
			}
			if (
				dojo.byId("shapefilefloater") &&
				dojo.byId("shapefilefloater").style.visibility === "visible"
			)
				dijit.byId("shapefilefloater").hide();
			//toggles for the panel layers in config
			//TO DO: can these be created when the panel is created from config instead of hardcoding them here?
			if (
				dojo.byId("suglayerfloaterCLIMATEPANEL") &&
				dojo.byId("suglayerfloaterCLIMATEPANEL").style.visibility === "visible"
			)
				dijit.byId("suglayerfloaterCLIMATEPANEL").hide();
			if (
				dojo.byId("suglayerfloaterHEALTHPANEL") &&
				dojo.byId("suglayerfloaterHEALTHPANEL").style.visibility === "visible"
			)
				dijit.byId("suglayerfloaterHEALTHPANEL").hide();
			if (
				dojo.byId("suglayerfloaterCRITSVCGAPSPANEL") &&
				dojo.byId("suglayerfloaterCRITSVCGAPSPANEL").style.visibility ===
					"visible"
			)
				dijit.byId("suglayerfloaterCRITSVCGAPSPANEL").hide();
			if (
				dojo.byId("printfloater") &&
				dojo.byId("printfloater").style.visibility === "visible"
			)
				togglePrint();
			if (
				dojo.byId("sessionfloater") &&
				dojo.byId("sessionfloater").style.visibility === "visible"
			)
				toggleSaveSession();
		}
	});
	
	function toggleContent(imgobj, divid) {
		if (document.getElementById(divid).style.display == "none") {
			document.getElementById(divid).style.display = "block";
			imgobj.src = "images/collapse_glyph.gif";
			imgobj.title = "Hide map contents";
		} else {
			document.getElementById(divid).style.display = "none";
			imgobj.src = "images/expand_glyph.gif";
			imgobj.title = "Show map contents";
		}
	}
	
	//toggle territor message and adjust map frame height as needed.
	function showTerritoryMessage(divId,mapDivId){
		document.getElementById(divId).style.display = "block";
		document.getElementById(mapDivId).style.top = "51px";	
	
	}
	
	function hideTerritoryMessage(divId,mapDivId){
		document.getElementById(divId).style.display = "none";
		document.getElementById(mapDivId).style.top = "38px";
		localStorage.setItem("doTerritoryMessage",false);
	
	}
	function showSplashScreen(){
		document.getElementById('splash-screen').style.display = "block";	
	}
	
	function hideSplashScreen(notCached) {
		var splashScreen = document.getElementById('splash-screen');
			if (splashScreen) {
				//splashScreen.classList.add('hidden');
				splashScreen.style.display="none";
				if(!notCached){
				 localStorage.setItem("doSplashScreen",notCached);
				}
			}
		}
	
		function removeHighlight(thisObj) {
			$(thisObj).removeClass("highlight");
			var srcAttr = $(thisObj).find("img").attr("src");
			if (srcAttr) {
				var srcImgInput = srcAttr.substring(
					srcAttr.lastIndexOf("/") + 1,
					srcAttr.length
				);
				
				var srcImg = srcImgInput.split("_");
				srcImg = srcImg[0] + "_" + srcImg[srcImg.length - 1];
				$(thisObj)
					.find("img")
					.attr("src", "mapdijit/templates/images/" + srcImg);
			}
		}
		
		
		function getEnvText(invalue,digsig) {
		invalue = parseFloat(invalue);
		digsig = parseInt(digsig);
		var invaluestr = roundNumber(invalue,0) + "";
		var dint = invaluestr.length;
	
		var v = 0;
		if (invalue > 0) {
			if (dint <= 2) {
				var dig = digsig - 1 - Math.floor(Math.log(Math.abs(invalue)) / Math.log(10));
				//v = invalue.toFixed(dig);
				v = roundNumber(invalue,dig);
				//alert(invalue + ": " + dig);
				//v = Math.round(invalue,digsig - 1 - (parseInt(Math.log(Math.abs(invalue))) / Math.log(10)));
			} else {
			   var m = dint - 2;
				v = Math.round(invalue / Math.pow(10, m)) * Math.pow(10, m);
			}
		}
		return v;
		}
	
		function roundNumber(num, dec) {
					   var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
					   return result;
				   }
	