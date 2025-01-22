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
	"dojox/gfx",
	"dojo/fx",

	"esri/PopupTemplate",
	"esri/layers/Layer",
	"esri/layers/FeatureLayer",
	"esri/layers/MapImageLayer",
	"esri/layers/TileLayer",
	"mapdijit/IDinfoWindow",
	"esri/config",
	"esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "esri/Graphic",
    "mapdijit/EJinfoWindow",
	"esri/geometry/Extent",
	"esri/geometry/SpatialReference"
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
	gfx,
	coreFx,
	PopupTemplate,
	Layer,
	FeatureLayer,
	MapImageLayer,
	TileLayer,
	IDinfoWindow,
	esriConfig,
	QueryTask,
    Query,
    Graphic,
    EJinfoWindow,
	Extent,
	SpatialReference
) {
	var Places = dojo.declare([dijit._Widget, dijit._Templated], {
		templateString: dojo.cache("mapdijit", "templates/Places.html"),
		widgetsInTemplate: true,
		constructor: function (options, srcRefNode) {
			// expected properties and values for the options argument:
			//"map": Javascript API Map object in the webmap that will be clicked
			//"selectLayerURL" : Layer URL for the layer that will be selected for feature input
			//"title": Top line of text that appears in the widget,
			//"caption": Second line of text that appears in the widget that appears after tool runs
			// srcRefNode is the DOM node where the gauge will be created

			options = options || {};
			if (!options.map) throw new Error("no map defined in params for Render.");

			this.map = options.map;
			this.mapview = view;

			// mixin constructor options
			dojo.safeMixin(this, options);
		},

		startup: function () {},
		postCreate: function () {
			var wobj = this;
			var removedFromMap = false;
			var locationsData = serviceJSON;
			var placesTabMapIds = Object.getOwnPropertyNames(serviceJSON);
			placesTabMapIds.push(
				...Object.getOwnPropertyNames(communityLandmarksJSON)
			);
			
			placesTabMapIds.push(
				...Object.getOwnPropertyNames(otherEnvironmentalDataJSON)
			);
			placesTabMapIds.push(...Object.getOwnPropertyNames(tribalJSON));
			placesTabMapIds.push(...Object.getOwnPropertyNames(publicHousingJSON));
			placesTabMapIds.push(...Object.getOwnPropertyNames(coloniasJSON));
			placesTabMapIds.push(...Object.getOwnPropertyNames(justice40iraJSON));
		

			//toggle highlight on div by class name
			$(document).on("click", ".divBtnPlaces", function (e) {
				if (
					$(this).hasClass("highlight") &&
					$(this).attr("id") &&
					placesTabMapIds.indexOf($(this).attr("id")) > -1
				) {
					wobj._removeHighlight($(this));
					for (var i = 0; i < placesTabMapIds.length; i++) {
						/*if (placesTabMapIds[i] === this.id) {
							if (wobj.map.findLayerById(placesTabMapIds[i])) {
								wobj.map.remove(wobj.map.findLayerById(placesTabMapIds[i]));
								removedFromMap = true;
								break;
							}
						}*/

						if (this.id == "eparegionalfacilities") {
							var newLayers = ["epafacs", "trifacs","cdrfacs"];
							for (var t = 0; t < newLayers.length; t++) {
								if (wobj.map.findLayerById(newLayers[t])) {
									wobj.map.remove(wobj.map.findLayerById(newLayers[t]));
									removedFromMap = true;
									break;
								}
							}
						} else if (this.id == "iradisadvantaged") {
							var newLayers = ["epairadisadvantaged","supplgreater90","indianamericanres","justice40ira","emeftribal"];
							for (var t = 0; t < newLayers.length; t++) {
								if (wobj.map.findLayerById(newLayers[t])) {
									wobj.map.remove(wobj.map.findLayerById(newLayers[t]));
									removedFromMap = true;
									break;
								}
							}
						}else if (placesTabMapIds[i] === this.id) {
							if (wobj.map.findLayerById(placesTabMapIds[i])) {
								wobj.map.remove(wobj.map.findLayerById(placesTabMapIds[i]));
								removedFromMap = true;
								break;
							}
						}








						
					}
				} else {
					//alert("added");
					$(this).addClass("highlight");
					var srcAttr = $(this).find("img").attr("src");
					if (srcAttr) {
						var srcImgInput = srcAttr.substring(
							srcAttr.lastIndexOf("/") + 1,
							srcAttr.length
						);
						if ($(this).hasClass("highlight")) {
							var srcImg = srcImgInput.split("_");
							srcImg = srcImg[0] + "_white_" + srcImg[srcImg.length - 1];
							$(this)
								.find("img")
								.attr("src", "mapdijit/templates/images/" + srcImg);
						}
					}
				}
			});
			var str = "<table>";
			//create button for each entry in config
			$.each(locationsData, function (index, value) {
				// if(index!='otherenv'){
				if (index === "otherenv") {
					str +=
						'<tr><td><div id="' +
						index +'" title="'+value.mouseover+
						'" class="divBtn divBtnPlaces"><img class="imgClass" src="mapdijit/templates/images/' +
						this.imageName +
						'">' +
						value.description +
						'</div><div id="otherEnvSubCategories"  style="display:none" class="divBtn divBtnSub"></div></td></tr>';
				} else if (index === "communitylandmarks") {
					str +=
						'<tr><td><div id="' +
						index +'" title="'+value.mouseover+
						'" class="divBtn divBtnPlaces"><img class="imgClass" src="mapdijit/templates/images/' +
						this.imageName +
						'">' +
						value.description +
						'</div><div id="communitylandmarksSubCategories"  style="display:none" class="divBtn divBtnSub"></div></td></tr>';
				}
				
				
				else if (index === "publichousing") {
					str +=
						'<tr><td><div id="' +
						index +'" title="'+value.mouseover+
						'" class="divBtn divBtnPlaces"><img class="imgClass" src="mapdijit/templates/images/' +
						this.imageName +
						'">' +
						value.description +
						'</div><div id="publicHousingSubCategories"  style="display:none" class="divBtn divBtnSub"></div></td></tr>';
				} else if (index === "colonias") {
					str +=
						'<tr><td><div id="' +
						index +'" title="'+value.mouseover+
						'" class="divBtn divBtnPlaces"><img class="imgClass" src="mapdijit/templates/images/' +
						this.imageName +
						'">' +
						value.description +
						'</div><div id="coloniasSubCategories"  style="display:none" class="divBtn divBtnSub"></div></td></tr>';
				} else if (index === "tribalcat") {
					str +=
						'<tr><td><div id="' +
						index +'" title="'+value.mouseover+
						'" class="divBtn divBtnPlaces"><img class="imgClass" src="mapdijit/templates/images/' +
						this.imageName +
						'">' +
						value.description +
						'</div><div id="tribalSubCategories"  style="display:none" class="divBtn divBtnSub"></div></td></tr>';
				}
				else if (index === "justice40iracat") {
					str +=
						'<tr><td><div id="' +
						index +'" title="'+value.mouseover+
						'" class="divBtn divBtnPlaces"><img class="imgClass" src="mapdijit/templates/images/' +
						this.imageName +
						'">' +
						value.description +
						'</div><div id="iraSubCategories"  style="display:none" class="divBtn divBtnSub"></div></td></tr>';
				}
				
				else {
					str +=
						'<tr><td><div id="' +
						index +'" title="'+value.mouseover+
						'" class="divBtn divBtnPlaces"><img class="imgClass" src="mapdijit/templates/images/' +
						this.imageName +
						'">' +
						value.description +
						"</div></td></tr>";
				} //attached click event by id to add to map

				$(document).on("click", "#" + index, function () {
					if (
						index != "otherenv" &&
						index != "publichousing" &&
						index != "colonias" &&
						index != "tribalcat" &&
						index != "justice40iracat" &&
						index != "communitylandmarks"
					) {
						if (!removedFromMap) {
							wobj._addServiceByKey(this.id, serviceJSON);
						} else if (removedFromMap) {
							//Now set it to false, if it was true
							removedFromMap = false;
						}

						// wobj._addHighlightToAlreadySelectedLayers();
						$("#otherEnvSubCategories").hide();
						$("#publicHousingSubCategories").hide();
						$("#coloniasSubCategories").hide();
						$("#tribalSubCategories").hide();
						$("#iraSubCategories").hide();
						$("#communitylandmarksSubCategories").hide();
					}
				});
			});

			str += "</table>";
			$("#locationData").append(str);

			//Other environmental data
			$(document).on("click", "#otherenv", function () {
				if ($("#publicHousingSubCategories").is(":visible")) {
					$("#publicHousingSubCategories").hide();
				}
				if ($("#coloniasSubCategories").is(":visible")) {
					$("#coloniasSubCategories").hide();
				}
				if ($("#tribalSubCategories").is(":visible")) {
					$("#tribalSubCategories").hide();
				}
				if ($("#iraSubCategories").is(":visible")) {
					$("#iraSubCategories").hide();
				}
				if ($.trim($("#otherEnvSubCategories").html()).length === 0) {
					var otherEnvData = otherEnvironmentalDataJSON;
					$("#otherEnvSubCategories").html("");
					var str = "<ul>";

					$.each(otherEnvData, function (index, value) {
						str +=
							'<li> <div id="' +
							index +'" title="'+value.mouseover+
							'" class="divSubBtn">' +
							value.description +
							"</div> </li>";
						//if (clickwiredCriticalData == false){ //only need to click add on the first rendering, else click gets wired each time parent is clicked
						$(document).on("click", "#" + index, function () {
							$("#" + index).addClass("highlight");
							wobj._addServiceByKey(index, otherEnvironmentalDataJSON);
						});
						//}
					});
					//  clickwiredCriticalData = true; //set to true so on next click the child button clicks will not be added again
					str += "</ul>";
					$("#otherEnvSubCategories").append(str);
				}

			
				if ($(this).hasClass("highlight")) {
					//$( "#criticalDataCategories" ).show();
					if ($("#otherEnvSubCategories").is(":visible")) {
						$("#otherEnvSubCategories").hide();
						wobj._removeHighlight(this);
					} else {
						$("#otherEnvSubCategories").show();
						wobj._addHighlightToAlreadySelectedLayers(
							otherEnvironmentalDataJSON
						);
					}
				} else {
					$("#otherEnvSubCategories").hide();
					// removeHighlight(this);
					wobj._removeHighlight(this);
				}

				event.stopPropagation();
			});

            //community landmarks
			$(document).on("click", "#communitylandmarks", function () {
				if ($("#publicHousingSubCategories").is(":visible")) {
					$("#publicHousingSubCategories").hide();
				}
				if ($("#coloniasSubCategories").is(":visible")) {
					$("#coloniasSubCategories").hide();
				}
				if ($("#tribalSubCategories").is(":visible")) {
					$("#tribalSubCategories").hide();
				}
				if ($("#iraSubCategories").is(":visible")) {
					$("#iraSubCategories").hide();
				}
				if ($("#otherEnvSubCategories").is(":visible")) {
					$("#otherEnvSubCategories").hide();
				}
				

				if ($.trim($("#communitylandmarksSubCategories").html()).length === 0) {
					var communitylandmarksSubCategories = communityLandmarksJSON;
					$("#communitylandmarksSubCategories").html("");
					var str = "<ul>";

					$.each(communitylandmarksSubCategories, function (index, value) {
						str +=
							'<li> <div id="' +
							index +'" title="'+value.mouseover+
							'" class="divSubBtn">' +
							value.description +
							"</div> </li>";
						
						$(document).on("click", "#" + index, function () {
							$("#" + index).addClass("highlight");
							wobj._addServiceByKey(index, communityLandmarksJSON);
						});
						//}
					});
					//  clickwiredCriticalData = true; //set to true so on next click the child button clicks will not be added again
					str += "</ul>";
					$("#communitylandmarksSubCategories").append(str);
				}
				if ($(this).hasClass("highlight")) {
					//$( "#criticalDataCategories" ).show();
					if ($("#communitylandmarksSubCategories").is(":visible")) {
						$("#communitylandmarksSubCategories").hide();
						wobj._removeHighlight(this);
					} else {
						$("#communitylandmarksSubCategories").show();
						wobj._addHighlightToAlreadySelectedLayers(
							communityLandmarksJSON
						);
					}
				} else {
					$("#communitylandmarksSubCategories").hide();
					// removeHighlight(this);
					wobj._removeHighlight(this);
				}

				event.stopPropagation();
			});
			//Public Housing
			$(document).on("click", "#publichousing", function () {
				if ($("#otherEnvSubCategories").is(":visible")) {
					$("#otherEnvSubCategories").hide();
				}
				if ($("#coloniasSubCategories").is(":visible")) {
					$("#coloniasSubCategories").hide();
				}
				if ($("#tribalSubCategories").is(":visible")) {
					$("#tribalSubCategories").hide();
				}
				if ($.trim($("#publicHousingSubCategories").html()).length === 0) {
					var publicHousingData = publicHousingJSON;
					$("#publicHousingSubCategories").html("");
					var str = "<ul>";

					$.each(publicHousingData, function (index, value) {
						if (index != "colonias") {
							str +=
								'<li> <div id="' +
								index +'" title="'+value.mouseover+
								'" class="divSubBtn">' +
								value.description +
								"</div> </li>";
							//if (clickwiredCriticalData == false){ //only need to click add on the first rendering, else click gets wired each time parent is clicked
							$(document).on("click", "#" + index, function () {
								$("#" + index).addClass("highlight");
								wobj._addServiceByKey(index, publicHousingData);
							});
						}
						//}
					});
					//  clickwiredCriticalData = true; //set to true so on next click the child button clicks will not be added again
					str += "</ul>";
					$("#publicHousingSubCategories").append(str);
				}
				if ($(this).hasClass("highlight")) {
					//$( "#criticalDataCategories" ).show();
					if ($("#publicHousingSubCategories").is(":visible")) {
						$("#publicHousingSubCategories").hide();
						wobj._removeHighlight(this);
					} else {
						$("#publicHousingSubCategories").show();
						wobj._addHighlightToAlreadySelectedLayers(publicHousingJSON);
					}
				} else {
					$("#publicHousingSubCategories").hide();
					// removeHighlight(this);
					wobj._removeHighlight(this);
				}

				event.stopPropagation();
			});

			//Colonias layers
			$(document).on("click", "#colonias", function () {
				if ($("#otherEnvSubCategories").is(":visible")) {
					$("#otherEnvSubCategories").hide();
				}
				if ($("#publicHousingSubCategories").is(":visible")) {
					$("#publicHousingSubCategories").hide();
				}
				if ($("#tribalSubCategories").is(":visible")) {
					$("#tribalSubCategories").hide();
				}
				if ($.trim($("#coloniasSubCategories").html()).length === 0) {
					var coloniasData = coloniasJSON;
					$("#coloniasSubCategories").html("");
					var str = "<ul>";

					$.each(coloniasData, function (index, value) {
						str +=
							'<li> <div id="' +
							index +'" title="'+value.mouseover+
							'" class="divSubBtn">' +
							value.description +
							"</div> </li>";
						//if (clickwiredCriticalData == false){ //only need to click add on the first rendering, else click gets wired each time parent is clicked
						$(document).on("click", "#" + index, function () {
							$("#" + index).addClass("highlight");
							wobj._addServiceByKey(index, coloniasData);
						});
						//}
					});
					//  clickwiredCriticalData = true; //set to true so on next click the child button clicks will not be added again
					str += "</ul>";
					$("#coloniasSubCategories").append(str);
				}
				if ($(this).hasClass("highlight")) {
					//$( "#criticalDataCategories" ).show();
					if ($("#coloniasSubCategories").is(":visible")) {
						$("#coloniasSubCategories").hide();
						wobj._removeHighlight(this);
					} else {
						$("#coloniasSubCategories").show();
						wobj._addHighlightToAlreadySelectedLayers(coloniasJSON);
					}
				} else {
					$("#coloniasSubCategories").hide();
					// removeHighlight(this);
					wobj._removeHighlight(this);
				}
				event.stopPropagation();
			});

			//Tribal layers
			$(document).on("click", "#justice40iracat", function () {
				if ($("#otherEnvSubCategories").is(":visible")) {
					$("#otherEnvSubCategories").hide();
				}
				if ($("#publicHousingSubCategories").is(":visible")) {
					$("#publicHousingSubCategories").hide();
				}
				if ($("#coloniasSubCategories").is(":visible")) {
					$("#coloniasSubCategories").hide();
				}
				if ($("#tribalSubCategories").is(":visible")) {
					$("#tribalSubCategories").hide();
				}
				if ($.trim($("#iraSubCategories").html()).length === 0) {
					var justice40ira = justice40iraJSON;
					$("#iraSubCategories").html("");
					var str = "<ul>";

					$.each(justice40ira, function (index, value) {
						str +=
							'<li> <div id="' +
							index +'" title="'+value.mouseover+
							'" class="divSubBtn">' +
							value.description +
							"</div> </li>";
						//if (clickwiredCriticalData == false){ //only need to click add on the first rendering, else click gets wired each time parent is clicked
						$(document).on("click", "#" + index, function () {
							$("#" + index).addClass("highlight");
							wobj._addServiceByKey(index, justice40ira);
						});
						//}
					});
					//  clickwiredCriticalData = true; //set to true so on next click the child button clicks will not be added again
					str += "</ul>";
					$("#iraSubCategories").append(str);
				}
				if ($(this).hasClass("highlight")) {
					//$( "#criticalDataCategories" ).show();
					if ($("#iraSubCategories").is(":visible")) {
						$("#iraSubCategories").hide();
						wobj._removeHighlight(this);
					} else {
						$("#iraSubCategories").show();
						wobj._addHighlightToAlreadySelectedLayers(justice40iraJSON);
					}
				} else {
					$("#iraSubCategories").hide();
					// removeHighlight(this);
					wobj._removeHighlight(this);
				}

				event.stopPropagation();
			});

			$(document).on("click", "#tribalcat", function () {
				if ($("#otherEnvSubCategories").is(":visible")) {
					$("#otherEnvSubCategories").hide();
				}
				if ($("#publicHousingSubCategories").is(":visible")) {
					$("#publicHousingSubCategories").hide();
				}
				if ($("#coloniasSubCategories").is(":visible")) {
					$("#coloniasSubCategories").hide();
				}
				if ($("#iraSubCategories").is(":visible")) {
					$("#iraSubCategories").hide();
				}
				if ($.trim($("#tribalSubCategories").html()).length === 0) {
					var tribalData = tribalJSON;
					$("#tribalSubCategories").html("");
					var str = "<ul>";

					$.each(tribalData, function (index, value) {
						str +=
							'<li> <div id="' +
							index +'" title="'+value.mouseover+
							'" class="divSubBtn">' +
							value.description +
							"</div> </li>";
						//if (clickwiredCriticalData == false){ //only need to click add on the first rendering, else click gets wired each time parent is clicked
						$(document).on("click", "#" + index, function () {
							$("#" + index).addClass("highlight");
							wobj._addServiceByKey(index, tribalData);
						});
						//}
					});
					//  clickwiredCriticalData = true; //set to true so on next click the child button clicks will not be added again
					str += "</ul>";
					$("#tribalSubCategories").append(str);
				}
				if ($(this).hasClass("highlight")) {
					//$( "#criticalDataCategories" ).show();
					if ($("#tribalSubCategories").is(":visible")) {
						$("#tribalSubCategories").hide();
						wobj._removeHighlight(this);
					} else {
						$("#tribalSubCategories").show();
						wobj._addHighlightToAlreadySelectedLayers(tribalJSON);
					}
				} else {
					$("#tribalSubCategories").hide();
					// removeHighlight(this);
					wobj._removeHighlight(this);
				}

				event.stopPropagation();
			});
		},

		_addServiceByKey: function (skey, jsonObj) {
			var wobj = this;
			//if has layerurl its single layer, else test for layergroup and add all in layergroup
			if ((jsonObj[skey].layerurl != "") && (!(jsonObj[skey].layergroup))) {
				//if layer already added then exit
				if (wobj.map.findLayerById(skey)) {
					if (
						otherEnvironmentalDataJSON.hasOwnProperty(skey) ||
						publicHousingJSON.hasOwnProperty(skey) ||
						coloniasJSON.hasOwnProperty(skey) ||
						tribalJSON.hasOwnProperty(skey) ||
						justice40iraJSON.iradisadvantaged.layergroup.hasOwnProperty(skey)||
						justice40iraJSON.hasOwnProperty(skey)||
						communityLandmarksJSON.hasOwnProperty(skey)
					) {
						var layerVal = wobj.map.findLayerById(skey);
						wobj.map.remove(layerVal);
						$("#" + skey).removeClass("highlight");
					}
					return false;
				}

				var stype = jsonObj[skey].type;
				var sdesc = jsonObj[skey].description;
				var surl = jsonObj[skey].layerurl;
				var trans = jsonObj[skey].transparency
				var visibility = jsonObj[skey].visible;
				if (stype == "featurelayer") {
					var infoTemplate = new PopupTemplate();

					infoTemplate.title = sdesc;
					
					infoTemplate.content = wobj._idDesc;
					
					//view.popup.defaultPopupTemplateEnabled = true;
					var templayer = new FeatureLayer(surl, {
						mode: FeatureLayer.MODE_ONDEMAND,
						id: skey,
						title: sdesc,
						popupTemplate: infoTemplate,
						outFields: ["*"],
						opacity: trans,
						visible:visibility
					});
					//view.map.add(templayer);
				
					wobj.map.add(templayer);
				
					// view.popup.watch("visible", function(isVisible) {
					// 	if (isVisible) {
					// 		$(".esri-popup__footer").css("display", "none");
					// 	}
					// });
					// var feats= [];
					// // Event listener for map click
					// view.on("click", function(event) {
					// 	// Perform hit test to get features at the clicked location
					// 	view.hitTest(event).then(function(response) {
					// 		console.log("Hit Test Response: ", response); // Debug log
					// 		if (response.results.length > 0) {
								
					// 			response.results.forEach(function(result) {
					// 				var feature = result;
					// 				var infoTemplate = new PopupTemplate({
					// 					content: function() {
									   
					// 						return wobj._idDesc(feature,true);
										   
					// 					}
									 
					// 			   });
					// 			   feature.popupTemplate = infoTemplate;
					// 			   feats.push(feature);
					// 			});
							
								
					// 			//feature.popupTemplate = infoTemplate;
								
					// 			//feats.push(feature);
								
					// 			// Open popup with dynamic content
							
					// 				view.popup.open({
					// 					location: event.mapPoint, // Set popup location to clicked point
					// 					features: feats, // Set dynamic content
									
					// 				})
							
					// 			console.log("Popup opened"); // Debug log
					// 		} else {
					// 			view.popup.close(); // Close the popup if no features found
					// 		}
					// 	});
					
						
					// });
					
					
				/*var ffeats=[];
				view.on("click", function(event) {
					view.hitTest(event).then(function(response) {
						// The hitTest response can be used to check if any features were clicked directly
						// console.log(response.results);
				
						var queryTask = new QueryTask(surl);
				
						// Set the properties of the query
						var query = new Query();
						query.spatialRelationship = "intersects"; // The feature must intersect the point clicked
						query.geometry = event.mapPoint; // The point clicked on the map
						query.outFields = ["*"]; // Retrieve all fields
				
						queryTask.execute(query).then(function(results) {
							console.log(results.features.length);
							var feature = results.features;
							//var feats = []; // Ensure this array is defined
							var infoTemplate = new PopupTemplate();
							infoTemplate.content = wobj._idDesc;
							feature.popupTemplate = infoTemplate;
							ffeats.push(feature);
							// features.forEach(function(feat) {
							// 	var infoTemplate = new PopupTemplate();
							// 	infoTemplate.content = wobj._idDesc;
							// 	feat.popupTemplate = infoTemplate;
							// 	ffeats.push(feat);
							// });
				
							view.popup.open({
								features: ffeats,
								location: event.mapPoint
							});
							$(".esri-popup__footer").css("display", "none");
						});
					});
				});*/
				
					  
				} 
				
		else if (stype == "portallayer") {		


		const measureThisAction = {
          title: "Generate Report",
          id: "change",
          className: "esri-icon-documentation"
        };

          function measureThis() {
              	
          //const geometry = view.popup.selectedFeature.geometry;
          //const atts = view.popup.selectedFeature.attributes;
          //console.log(geometry);
          //FID = ObjectID
          //GEOID10 = Tract ID
          //var fid = atts["FID"];
          ///console.log(fid);

          var feature = view.popup.selectedFeature;

          wobj._convertGraphic(feature); 

          //start query
          //no longer needed since have selectedfeature working

          // var query = new Query();
          //       query.returnGeometry = true;
          //       query.outFields = ["FID,GEOID10"];
          //       query.where = "FID = " + fid;
          //       //query.geometryPrecision = 1;
          //       //query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;

          //       var j40url = "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/usa_november_2022/FeatureServer/0/query";

          //       var queryTask = new QueryTask(j40url);

          //       queryTask.execute(query).then(function (results) {
          //           if (results.features.length > 0) {

          //               var feature = results.features[0];

          //               var geom = feature.geometry;
          //               console.log("geom:");
          //               console.log(geom);
          //               console.log(geom.type);    

          //               wobj._convertGraphic(feature);                 

          //           } else {
          //               console.log("Did not find a feature!");
          //           }
                   
          //       }).catch(function (err) {
          //           console.log("error occurred when querying layer: " + err);                 

          //       });

          //end query


          //var test = view.popup.selectedFeature.geometry;
          //alert(test.type);
          	//console.log(test);
       //   //var test2 = view.popup.selectedFeatureWidget;
          ///var ggg = test2.graphic;
         // var stp = "stop";
          //alert(geometry);
          //let div = document.createElement("div");
          //div.innerHTML = `<p>${geometry}</p><input type='button' onclick=console.log(${geometry}) value='Click Me'></input>`;
          //return div;
          //const geometry = view.popup.selectedFeature;
          //wobj._convertGraphic(geometry);
        }

                view.popup.on("trigger-action", (event) => {
                	    console.log("test");
          console.log(event);
          // Execute the measureThis() function if the measure-this action is clicked
          if (event.action.id === "change") {
            measureThis();
          }
        });
     //view.popup.viewModel.includeDefaultActions = false;
//j40 prod item - may2022
//990e8d269a0348cba9ae28b344d2957d

//my test item points to same url 
//b95ca99a177a48d189e83ce9205c9707

//latest nov 2022
//f95344889cab44bd84207052f44cb940

//superfund test poly
//d6e1591d9a424f1fa6d95a02095a06d7

		//esriConfig.portalUrl = "https://arcgis.edap-cluster.com/portal";
		//RW note 7/13/23 - add check for visible to set J40 in IRA to off by default. Rest are controlled by visiblity in service.
		var isVisible = true;
		if (jsonObj[skey].hasOwnProperty("visiblebydefault")) { 
		 isVisible = jsonObj[skey].visiblebydefault;
		}

         const featureLayer = new FeatureLayer({
          portalItem: {
            // autocasts as new PortalItem()
            //id: "f95344889cab44bd84207052f44cb940",
           id: jsonObj[skey].layerurl        
            
          },
          //add all outfields to get geometry from selectedfeature
          outFields: ["*"],
          title: jsonObj[skey].description,
          id: skey,
		  visible:isVisible //fix for j40 IRA see above		  
          //layerId: 0
        });
		
		if (jsonObj[skey].definitionExpression &&  jsonObj[skey].definitionExpression != "" ){
			featureLayer.definitionExpression =  jsonObj[skey].definitionExpression;
		}
		


featureLayer.when().then(() => {
          const popupTemplate = featureLayer.popupTemplate.clone();
          // const buttonContent = {
          //   type: "custom",
          //   creator: ({ graphic }) => {
          //     const button = document.createElement("button");
          //     button.classList.add("esri-button");
          //     button.innerText = "Generate Report";

          //     button.addEventListener("click", () => {
          //       alert("Hey Jim!");
          //     });

          //     return button;
          //   }
          // };
          //popupTemplate.content.push(buttonContent);
          popupTemplate.actions = [measureThisAction];
          popupTemplate.overwriteActions = true;
          featureLayer.popupTemplate = popupTemplate;
        });



        //view.popup.actions = [measureThisAction];
        //view.popup.actions.push(measureThisAction);

				    //     var featureLayer = new FeatureLayer({
				    //       portalItem: {
				    //         id: "990e8d269a0348cba9ae28b344d2957d"
				    //       }
				    //     });		


				    //     featureLayer.when().then(() => {
        //   const popupTemplate = featureLayer.popupTemplate.clone();
        //   const buttonContent = {
        //     type: "custom",
        //     creator: ({ graphic }) => {
        //       const button = document.createElement("button");
        //       button.classList.add("esri-button");
        //       button.innerText = "Generate EJ Report";

        //       button.addEventListener("click", () => {
        //         //alert("Hey Jim!");
        //         //alert(graphic.geometry.type);
        //       });

        //       return button;
        //     }
        //   };
        //   //popupTemplate.content.push(buttonContent);
        //   //popupTemplate.content.unshift(buttonContent);
        //   //featureLayer.popupTemplate = popupTemplate;
        // });

        wobj.map.add(featureLayer);	

					

					
					// Layer.fromPortalItem({
     //      				portalItem: {
     //     			   // autocasts as new PortalItem()
     //        			id: "990e8d269a0348cba9ae28b344d2957d"
     //    			  }
			  //       })
			  //         .then(addLayer)
			  //         .catch(rejection);

			        // Adds the layer to the map once it loads
			        // function addLayer(layer) {			      
			        //   layer.id = skey;
			        //   layer.title = sdesc;
			        //   layer.opacity = trans;			
			        //   wobj.map.add(layer);			      
			        // }

			        // function rejection(error) {
			        //   console.log("Layer failed to load: ", error);
			        // }

				}
				else {
					var svcname = jsonObj[skey].service;
					var agsurl = surl + svcname + "/MapServer";
					var onlayer = jsonObj[skey].defaultlayer;
					var slayers = jsonObj[skey].layers;
                     var visiblility = jsonObj[skey].visible;
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
						templayer = new TileLayer({
							id: skey,
							title: sdesc,
							url: agsurl,
							opacity: trans,
						});
						wobj.map.add(templayer);
					} else if (stype == "agsdynamic") {
						templayer = new MapImageLayer(agsurl, {
							id: skey,
							title: sdesc,
							url: agsurl,
							//sublayers: onlayer,
							opacity: trans,
							visible:visibility
						});

						if (!isDynamic) {
							if (jsonObj[skey].listlayer) {
								templayer.selectedlayers = jsonObj[skey].listlayer;
							}
						} else {
							if (slayers) {
								if (slayers.length > 0) {
									templayer.sublayers = slayers;
								}
							}
						}

						wobj.map.add(templayer);
						templayer.on("layerview-create", function (event) {
							if (onlayer.length > 0 && onlayer[0] != -1) {
								for (var j = 0; j < onlayer.length; j++) {
									var o = onlayer[j];

									templayer.findSublayerById(o).visible = true;
								}
							}
							if (templayer.selectedlayers!=null && templayer.selectedlayers.length >0) {
								for (var j = 0; j < templayer.selectedlayers.length; j++) {
									//var o = onlayer[j];

									templayer.findSublayerById(j).visible = templayer.visible;
								}
							}
							
						});
						
						/*if(slayers!=undefined ){
							if(slayers.length>0){
								for (var j = 0; j < slayers.length; j++) {
									
									templayer.findSublayerById(j).visible = slayers[j].visible;
								}
							}
						}*/
					}
				}
			}

			if (jsonObj[skey].layergroup) {
				var lyrgroup = jsonObj[skey].layergroup;
				$.each(lyrgroup, function (index, value) {

					var layerVal = wobj.map.findLayerById(index);
					if(layerVal!=undefined){
					  wobj.map.remove(layerVal);
					  $("#" + skey).removeClass("highlight");
					}else{
					wobj._addServiceByKey(index, lyrgroup);
					}
					// });
					//}
					
				});
			}
		},
		_removeHighlight(thisObj) {
			$(thisObj).removeClass("highlight");
			var srcAttr = $(thisObj).find("img").attr("src");
			if (srcAttr) {
				var srcImgInput = srcAttr.substring(
					srcAttr.lastIndexOf("/") + 1,
					srcAttr.length
				);
				//due to removal and insertion of 'white', sometimes
				//white comes two times in the image name so fixing it.
				// var srcImg =
				// 	srcImgInput.split(/_(.+)/)[0] + srcImgInput.split(/_(.+)/)[1];
				var srcImg = srcImgInput.split("_");
				srcImg = srcImg[0] + "_" + srcImg[srcImg.length - 1];
				$(thisObj)
					.find("img")
					.attr("src", "mapdijit/templates/images/" + srcImg);
			}
		},
		_addHighlightToAlreadySelectedLayers(jsonData) {
			var layerobj = view.map.layers;
			for (let i = 1; i < layerobj._items.length; ++i) {
				var layerid = layerobj._items[i].id;
				var actualLayerId = layerid.includes("_map")
					? layerid.replace("_map", "")
					: layerid;
				if (
					$("#" + actualLayerId).hasClass("divSubBtn") &&
					jsonData.hasOwnProperty(actualLayerId)
				) {
					$("#" + actualLayerId).addClass("highlight");
				}
			}
		},

		_idDesc: function (e) {
			var infowidget = new IDinfoWindow(
				{
					view: view,
					idgraphic: e.graphic,
					//removefooter: true
				},
				dojo.create("div")
			);
			infowidget.startup();

			return infowidget.domNode;
		},
		_convertGraphic: function(pFeat) {
			//alert('test');
                this.mapview.popup.close();
                //view.popup.close();
                //var feature = this.idgraphic;
                var feature = pFeat;

                //start copy syms from IDinfoWindow

                var pointsym = { // symbol used for points
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            style: "cross",
            color: "rgba(255, 0, 255, 1.0)",
            size: "12px",
            outline: { // autocasts as new SimpleLineSymbol()
                color: "rgba(255, 0, 255, 1.0)",
                width: 1 // points
            }
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

                //end copy syms
                
                var defaultradius = 1;
                switch (feature.geometry.type) {
                    case "point":
                        symbol = pointsym;
                        break;
                    case "polygon":
                        defaultradius = 0;
                        symbol = polysym;
                        break;
                    case "polyline":
                        symbol = linesym;
                        break;
                }

                var mgeometry = feature.geometry;
                var graphic = new Graphic(mgeometry);
                var gcounter = 0;
                var layerid = "Project" + gcounter;
                do {
                    gcounter = gcounter + 1;
                    layerid = "Project" + gcounter;
                } while ((view.map.findLayerById(layerid) != null))
            //} while ((wobj.map.findLayerById(layerid) != null))

                //graphic.attributes = { "id": gcounter, "gtype": graphic.geometry.type, "radius": defaultradius.toString(), "unit": "miles", "ptitle": "" };
                graphic.attributes = { "id": gcounter, "gtype": "tract", "radius": defaultradius.toString(), "unit": "miles", "ptitle": "","fips":feature.attributes["GEOID10"],"names":feature.attributes["GEOID10"]};
                var dlayer = new FeatureLayer({
                    id: layerid,
                    source: [graphic],
                    title: "Project " + gcounter,
                    objectIdField: "id",
                    outFields: ['*'],
                    fields: [{
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
                            name: "fips",
                            type: "string"
                        },
                        {
                            name: "names",
                            type: "string"
                        }
                    ],
                    popupTemplate: {
                        title: "EJScreen Reports and Charts",
                        content: lang.hitch(this, this.drawDesc)
                        //content: lang.hitch(this, wobj.drawDesc)
                    },
                    renderer: {
                        type: "simple",
                        symbol: symbol
                    }
                });
                dlayer.layerType = "digitize";
                //this.view.map.add(dlayer);
                //wobj.map.add(dlayer);
                view.map.add(dlayer);

                var gtype = graphic.geometry.type;
                var cpoint;
                if (gtype == "point") {
                    cpoint = graphic.geometry;
                } else if (gtype == "polyline") {
                    cpoint = mgeometry.extent.center;
                } else {
                    cpoint = mgeometry.centroid;
                }
                this.mapview.popup.open({ features: [graphic], location: cpoint });
                //view.popup.open({ features: [graphic], location: cpoint });


            },
            drawDesc: function(e) {
                if (dijit.registry.byId("infowg")) {
                    dijit.byId("infowg").destroy();
                    dijit.registry.remove("infowg");

                }
                //alert(igraphic.attributes["descinfo"]);
                var infowidget = new EJinfoWindow({
                    view: this.mapview,
                    //view: view,
                    inGraphic: e.graphic,
                    id: 'infowg'
                }, domConstruct.create('div'));
                infowidget.startup();

                return infowidget.domNode;

            },
		destroy: function () {
			// dojo.disconnect(this._zoomHandler);
			dojo.empty(this.domNode);
			this.inherited(arguments);
		},
	});

	return Places;
});
