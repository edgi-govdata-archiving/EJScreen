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
	"dojo/fx/Toggler",
	"dijit/form/Slider",

	"esri/layers/MapImageLayer",
	"esri/widgets/Legend",
	"esri/tasks/QueryTask",
	"esri/tasks/support/Query",
	"esri/renderers/support/jsonUtils",
	"dijit/form/HorizontalSlider",

	"esri/PopupTemplate",
	"esri/layers/FeatureLayer",
	"esri/layers/ImageryLayer",
	"esri/layers/TileLayer",
	"https://pedp-ejscreen.azurewebsites.net/mapdijit/IDinfoWindow.js",
	"esri/core/urlUtils",
	"dijit/form/Button",
	"dojo/domReady!",
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
	Toggler,
	Slider,

	MapImageLayer,
	esriLegend,
	QueryTask,
	esriquery,
	jsonUtils,

	HorizontalSlider,

	PopupTemplate,
	FeatureLayer,
	ImageryLayer,
	TileLayer,
	IDinfoWindow,
	urlUtils
	) {
		//currently hardcoded in config obj temp
		//var layerJson = {};
	
		//updated 1/622, ESRI bug causes equal class cutoffs to render incorrectly. Add class breaks as decimals so integers go to correct category
		var clsrenderer = {
			type: "class-breaks",
			defaultSymbol: globalDefaultSymbol4Pctiles,
			defaultLabel: globalDefaultSymbol4PctilesLabel,
			classBreakInfos: globalClassBreaks4Pctiles
		};
	
		var MapEJIndexMod = dojo.declare([dijit._Widget, dijit._Templated], {
			templateString: dojo.cache("mapdijit", "templates/MapEJIndexMod.html"),
			widgetsInTemplate: true,
			constructor: function (options, srcRefNode) {
				// expected properties and values for the options argument:
				//"map": Javascript API Map object in the webmap that will be clicked
				//"selectLayerURL" : Layer URL for the layer that will be selected for feature input
				//"title": Top line of text that appears in the widget,
				//"caption": Second line of text that appears in the widget that appears after tool runs
				// srcRefNode is the DOM node where the gauge will be created
	
				// start with no feature name
	
				options = options || {};
				if (!options.map) throw new Error("no map defined in params for Render.");
	
				this.map = options.map;
	
				this.indextype = "";
				this._serviceWidgets = [];
	
				//start layer add params
				this.view = options.view;
				this.maintocdiv = options.tocdivid;
				//end layer add params
	
				// mixin constructor options
				dojo.safeMixin(this, options);
			},
	
			startup: function () {},
			postCreate: function () {
				var wobj = this;
				//start test
				//on click of arrow > < in the side menu
				$("#closePanel").click(function () {
					if ($("#twotoc1").css("display") == "block") {
						$("#twotoc1").animate({ width: 0 }, 500, function () {
							$("#twotoc1").css("display", "none");
							$("#legendPan1").css("background-color", "");
						});
						$("#closePanel").text(">");
						$("#closePanel").attr("title", "Open Panel");
						//$("#closePanelImg").attr("src",'/images/icons8-more-than-16.png');
					} else {
						$("#twotoc1").animate({ width: 270 }, 500);
						$("#twotoc1").css("display", "block");
						$("#legendPan1").css("background-color", "white");
						// $("#closePanel").attr("src",'/images/icons8-less-than-16.png');
						$("#closePanel").text("<");
						$("#closePanel").attr("title", "Close Panel");
					}
				});
				/****************************Start First Tab****************************/
				$(".divBtn").click(function () {
					//if target itself is clicked, remove highligts
					//toggledByButtons is defined in config.js file
					if (toggledByButtons.indexOf(this.id) == -1) {
						if ($(this).hasClass("highlight")) {
							removeCustomHighlights();
						} else {
							//first remove highligts from previous tabs
							removeCustomHighlights();
							//Now add highlight to selected tab
							$(".divSubBtnMain").css("display", "none");
							if ($(this).hasClass("divBtn")) {
								$(this).addClass("highlight");
							}
							var srcAttr = $(this).find("img").attr("src");
							if (srcAttr) {
								var srcImgInput = srcAttr.substring(
									srcAttr.lastIndexOf("/") + 1,
									srcAttr.length
								);
								if ($(this).hasClass("highlight")) {
									var srcImg =
										srcImgInput.split(/_(.+)/)[0] +
										"_white_" +
										srcImgInput.split(/_(.+)/)[1];
									$(this)
										.find("img")
										.attr("src", "mapdijit/templates/images/" + srcImg);
								}
							}
						}
					}
					//special case of reports tab
					handleReportTabCase(this.id);
				});
				function handleReportTabCase(targetId) {
					var reportTabs = [
						"#dropPin",
						"#addArea",
						"#addPath",
						"#blockgroupDiv",
						"#tractDiv",
						"#cityDiv",
						"#region",
						"#countyDiv",
					];
					if (targetId == "selectMultipleDiv") {
						reportTabs.forEach((e) => {
							if ($(e).hasClass("highlight")) {
								removeHighlight(e);
							}
						});
					} else if (reportTabs.indexOf("#" + targetId) > -1) {
						if ($("#selectMultipleDiv").hasClass("highlight")) {
							$($("#selectMultipleDiv  > span > span >span >span")[0])
								.removeClass("esriSelectMultipleHighlight")
								.addClass("esriSelectMultiple");
							$("#selectMultipleBtn_label").css("color", "black");
							$("#selectMultipleDiv").removeClass("highlight");
							dijit.byId("kgeofloater").hide();
							dijit.byId("kgeowg").hide();
						}
					}
				}
				function removeCustomHighlights() {
					var elems = $(".highlight");
					for (var element of elems) {
						if ($(element).hasClass("highlight")) {
							//when we add toggle buttons to the divBtn and they open popup
							//	removeHighlight(element);
							var srcAttr = $(element).find("img").attr("src");
							if (srcAttr) {
								$(element).removeClass("highlight");
								var srcImgInput = srcAttr
									.substring(srcAttr.lastIndexOf("/") + 1, srcAttr.length)
									.toString();
								var srcImg =
									srcImgInput.split(/_(.+)/)[0] + srcImgInput.split(/_(.+)/)[1];
								srcImg = srcImg.replace("white", "");
								$(element)
									.find("img")
									.attr("src", "mapdijit/templates/images/" + srcImg);
							}
						}
					}
				}
				//remove highlight on the btn click and change the image
				function removeHighlight(thisObj) {
					$(thisObj).removeClass("highlight");
					var srcAttr = $(thisObj).find("img").attr("src");
					if (srcAttr) {
						var srcImgInput = srcAttr.substring(
							srcAttr.lastIndexOf("/") + 1,
							srcAttr.length
						);
						var srcImg =
							srcImgInput.split(/_(.+)/)[0] + srcImgInput.split(/_(.+)/)[1];
						srcImg = srcImg.replace("white", "");
						$(thisObj)
							.find("img")
							.attr("src", "mapdijit/templates/images/" + srcImg);
					}
				}
	
				//sub options should always be selected as long as they are in the legend
				function addHighlightToAlreadySelectedLayers() {
					var layerobj = view.map.layers;
					for (let i = 1; i < layerobj._items.length; ++i) {
						if (layerobj._items[i].renderField) {
							$("#" + layerobj._items[i].renderField).addClass("highlight");
						} else {
							var layerid = layerobj._items[i].id;
							var actualLayerId = layerid.includes("_map")
								? layerid.replace("_map", "")
								: layerid;
							$("#" + actualLayerId).addClass("highlight");
						}
					}
				}
	
				function createSubCats(subCats, prefix) {
					var str = "<ul>";
					$.each(subCats, function (index, value) {
						var domEId = "";
						keyId = index;
						if (prefix) {
							domEId = prefix + index;
						} else {
							domEId = index;
						}
						str +=
							'<li> <div id="' +domEId +'" title="'+value.mouseover+'" class="divSubBtnCategory">' +
							value.description +
							"</div> </li>";
	
						//only need to click add on the first rendering, else click gets wired each time parent is clicked
						$(document).on("click", "#" + domEId, function () {
							var radval = $('input[name="pcttype"]:checked').val();
							//right now there is only one prefix 'supp'
							if($("#informationDiv").is(':visible')){
								$("#informationDiv").hide();
							}
							var activeField = "";
							if (domEId.indexOf("supp") == -1) {
								activeField = domEId;
							} else {
								activeField = domEId.substring(4);
							}
							if (radval == "state") {
								wobj._mapejindex(
									activeField,
									domEId,
									radval,
									value.stateServiceURL,
									value.ejmapindex_state
								);
							} else {
								wobj._mapejindex(
									activeField,
									domEId,
									radval,
									value.nationalServiceURL,
									value.ejmapindex
								);
							}
						});
					});
					str += "</ul>";
					return str;
				}
				// on click on Environmental Justice Indexes
				$("#envJusticeMaps").click(function (evt) {
					//enable state/national radio buttons
					wobj._handleStateNationRaioBtnState(false, null, "labelDisabled");
					// hide other sub categories tabs
					wobj._hideOtherSubCategories("#ejIndexesSubCategories");
					//generate subcategories
					if ($.trim($("#ejIndexesSubCategories").html()).length === 0) {
						var envJusticeMapsColumns = ejJson.Primary.items.P_EJ2.columns;
						var str = createSubCats(envJusticeMapsColumns);
						$("#ejIndexesSubCategories").append(str);
					}
					if ($(this).hasClass("highlight")) {
						if ($("#ejIndexesSubCategories").is(":visible")) {
							$("#ejIndexesSubCategories").css("display", "none");
							//highlights are removed by toggledByButton array
							//removeHighlight(this);
						} else {
							$("#ejIndexesSubCategories").css("display", "block");
							//addHighlightToAlreadySelectedLayers();
						}
					} else {
						$("#ejIndexesSubCategories").css("display", "none");
						//highlights are removed by toggledByButton array
						//removeHighlight(this);
					}
					evt.stopPropagation();
				});
	
				// on click on Environmental Justice Indexes Supp
				$("#envJusticeMapsSupp").click(function (evt) {
					//enable state/national radio buttons
					wobj._handleStateNationRaioBtnState(false, null, "labelDisabled");
	
					// hide other sub categories tabs
					wobj._hideOtherSubCategories("#ejIndexesSubCategoriesSupp");
					if ($.trim($("#ejIndexesSubCategoriesSupp").html()).length === 0) {
						var envJusticeMapsColumns = ejJson.Supplemental.items.P_EJ5.columns;
						// $("#envJusticeMapsCategories").toggle();
						$("#ejIndexesSubCategoriesSupp").empty();
						var prefixVal = "supp";
						var str = createSubCats(envJusticeMapsColumns, prefixVal);
						$("#ejIndexesSubCategoriesSupp").append(str);
					}
					if ($(this).hasClass("highlight")) {
						if ($("#ejIndexesSubCategoriesSupp").is(":visible")) {
							$("#ejIndexesSubCategoriesSupp").css("display", "none");
							//highlights are removed by toggledByButton array
							//removeHighlight(this);
						} else {
							$("#ejIndexesSubCategoriesSupp").css("display", "block");
							//addHighlightToAlreadySelectedLayers();
						}
					} else {
						$("#ejIndexesSubCategoriesSupp").css("display", "none");
						//highlights are removed by toggledByButton array
						//removeHighlight(this);
					}
					evt.stopPropagation();
				});
	
				$("#areasOfConcern").click(function () {
					var areasOfConcernColumns = ejJson.Primary.items.P_MUL.columns;
					$("#areasOfConcernSubCategories").html("");
					var str = "<ul>";
					$.each(areasOfConcernColumns, function (index, value) {
						str +=
							'<li> <div id="' +
							value.txtname +
							'" class="divSubBtnCategory">' +
							value.description +
							"</div></li>";
					});
					str += "</ul>";
					$("#areasOfConcernSubCategories").append(str);
					$("#areasOfConcernSubCategories").toggle();
				});
	
				$("#pollutionData").click(function (evt) {
					//enable state/national radio buttons
					wobj._handleStateNationRaioBtnState(false, null, "labelDisabled");
					wobj._hideOtherSubCategories("#envIndicatorsSubCategories");
	
					if ($.trim($("#envIndicatorsSubCategories").html()).length === 0) {
						var envIndColumns = ejJson.Primary.items.P_ENV.columns;
						$("#envIndicatorsSubCategories").empty();
						var str = createSubCats(envIndColumns);
						$("#envIndicatorsSubCategories").append(str);
					}
					if ($(this).hasClass("highlight")) {
						if ($("#envIndicatorsSubCategories").is(":visible")) {
							$("#envIndicatorsSubCategories").css("display", "none");
							//removeHighlight(this);
						} else {
							$("#envIndicatorsSubCategories").css("display", "block");
							addHighlightToAlreadySelectedLayers();
						}
					} else {
						$("#envIndicatorsSubCategories").css("display", "none");
						//removeHighlight(this);
					}
					evt.stopPropagation();
				});
	
				$("#demographicData").click(function (evt) {
					//enable state/national radio buttons
					wobj._handleStateNationRaioBtnState(false, null, "labelDisabled");
					wobj._hideOtherSubCategories("#demographicIndicatorsSubCategories");
					if (
						$.trim($("#demographicIndicatorsSubCategories").html()).length === 0
					) {
						var demoIndColumns = ejJson.Primary.items.P_DEM.columns;
						$("#demographicIndicatorsSubCategories").html("");
						var str = createSubCats(demoIndColumns);
						$("#demographicIndicatorsSubCategories").append(str);
					}
					// $( "#demographicIndicatorsSubCategories" ).toggle();
					if ($(this).hasClass("highlight")) {
						if ($("#demographicIndicatorsSubCategories").is(":visible")) {
							$("#demographicIndicatorsSubCategories").hide();
							//removeHighlight(this);
						} else {
							$("#demographicIndicatorsSubCategories").show();
							addHighlightToAlreadySelectedLayers();
						}
					} else {
						$("#demographicIndicatorsSubCategories").hide();
						//removeHighlight(this);
					}
					evt.stopPropagation();
				});
				//track whether click events added on child buttons
				var clickwiredClimate = false;
				var clickwiredNOAA = false; //noaa buttons are built with the climate parent button click, init the flag here
				$("#climateChangeData").click(function (evt) {
					//disable state/national radio buttons
					wobj._handleStateNationRaioBtnState(true, "labelDisabled", null);
					wobj._hideOtherSubCategories("#climateChangeDataCategories");
	
					var climateChangeData = suggestservicesCLIMATE;
					if ($.trim($("#climateChangeDataCategories").html()).length === 0) {
						$("#climateChangeDataCategories").html("");
						var str = "<ul>";
						$.each(climateChangeData, function (index, value) {
							str +=
								'<li> <div id="' +
								index +'" title="'+value.mouseover+
								'" class="divSubBtnCategory">' +
								value.title +
								"</div> </li>";
							if (clickwiredClimate == false) {
								//only need to click add on the first rendering, else click gets wired each time parent is clicked
								$(document).on("click", "#" + index, function () {
									//if have url, add to map, if it's a folder then skip
									// if (suggestservicesCLIMATE[this.id].url) {
									// 	$("#" + index).addClass("highlight");
									// 	wobj._addSuggestServices(this.id, suggestservicesCLIMATE);
									// }
									wobj._removeEJLayers();
									wobj._removeNoaaLayers();
									wobj._removeLayers(suggestservicesHEALTH);
									wobj._removeLayers(suggestservicesCRITSVCGAPS);
									$(".divSubBtnCategory").removeClass("highlight");
									$("#" + index).addClass("highlight");
															
									$.each(suggestservicesCLIMATE, function (layerid, value) {
										if(layerid!= index){
										 var layerVal = view.map.findLayerById(layerid+"_map");
										 view.map.remove(layerVal);
										}
								   });
								   wobj._addSuggestServices(this.id, suggestservicesCLIMATE);
								});
							}
						});
						clickwiredClimate = true; //set to true so on next click the child button clicks will not be added again
						str += "</ul>";
						$("#climateChangeDataCategories").append(str);
					}
					if ($(this).hasClass("highlight")) {
						if ($("#climateChangeDataCategories").is(":visible")) {
							$("#climateChangeDataCategories").hide();
							//removeHighlight(this);
						} else {
							$("#climateChangeDataCategories").show();
							addHighlightToAlreadySelectedLayers();
						}
					} else {
						$("#climateChangeDataCategories").hide();
						//removeHighlight(this);
					}
					//console.log(str);
					console.log("here in climateChangeDataCategories");
					evt.stopPropagation();
				});
	
				//start noaa sea level
				$(document).on("click", "#noaa", function (evt) {
					$(this).addClass("highlight");
	
					var noaaServices = suggestservicesCLIMATE.noaa.services;
					var str = "";
					var firstTime = false;
					if (!$("#noaaclimateChangeDataSubCategories").length) {
						str = '<div id="noaaclimateChangeDataSubCategories">';
						firstTime = true;
					} else {
						$("#noaaclimateChangeDataSubCategories").html("");
					}
					str += "<ul>";
	
					$.each(noaaServices, function (index, value) {
						str +=
							'<li> <div id="' +
							index +
							'" class="divSubBtnCategory">' +
							value.title +
							"</div></li>";
						if (clickwiredNOAA == false) {
							//only need to click add on the first rendering, else click gets wired each time parent is clicked
							$(document).on("click", "#" + index, function () {
								wobj._addSuggestServices(
									"noaa|" + this.id,
									suggestservicesCLIMATE
								);
							});
						}
					});
					clickwiredNOAA = true; //set to true so on next click the child button clicks will not be added again
					str += "</ul><div>";
	
					// check if a div exists and only then insert after
					if (firstTime) {
						$(str).insertAfter("#noaa");
					} else {
						$("#noaaclimateChangeDataSubCategories").append(str);
						$("#noaaclimateChangeDataSubCategories").toggle();
					}
					evt.stopPropagation();
				});
	
				//end noaa sea level
	
				//track whether click events added on child buttons
				var clickwiredCriticalData = false;
				$("#criticalData").click(function (evt) {
					//disable state/national radio buttons
					// $('input[name="pcttype"]').prop("disabled", true);
					// $("#nationlabel").addClass("labelDisabled");
					// $("#statelabel").addClass("labelDisabled");
					wobj._handleStateNationRaioBtnState(true, "labelDisabled", null);
	
					wobj._hideOtherSubCategories(
						"#climateChangeDataCategories#criticalDataCategories"
					);
	
					if ($.trim($("#criticalDataCategories").html()).length === 0) {
						var criticalData = suggestservicesCRITSVCGAPS;
						$("#criticalDataCategories").html("");
						var str = "<ul>";
	
						$.each(criticalData, function (index, value) {
							//  var cid= 'climateid'+index;
							str +=
								'<li> <div id="' +
								index +'" title="'+value.mouseover+
								'" class="divSubBtnCategory">' +
								value.title +
								"</div> </li>";
							if (clickwiredCriticalData == false) {
								//only need to click add on the first rendering, else click gets wired each time parent is clicked
								$(document).on("click", "#" + index, function () {
									wobj._removeEJLayers();
									wobj._removeNoaaLayers();
									wobj._removeLayers(suggestservicesCLIMATE);
									wobj._removeLayers(suggestservicesHEALTH);
	
									$(".divSubBtnCategory").removeClass("highlight");
									$("#" + index).addClass("highlight");
									//removing the layers from map as only one layer should be selected at once for health
									
									$.each(suggestservicesCRITSVCGAPS, function (layerid, value) {
										if(layerid!= index){
										 var layerVal = view.map.findLayerById(layerid+"_map");
										 view.map.remove(layerVal);
										}
								   });
									wobj._addSuggestServices(this.id, suggestservicesCRITSVCGAPS);
								});
							}
							// <div id="pollutionDiv" class="divBtn">Pollution and pollution sources</div>
						});
						clickwiredCriticalData = true; //set to true so on next click the child button clicks will not be added again
						str += "</ul>";
						$("#criticalDataCategories").append(str);
					}
					// $( "#criticalDataCategories" ).toggle();
					if ($(this).hasClass("highlight")) {
						//$( "#criticalDataCategories" ).show();
						if ($("#criticalDataCategories").is(":visible")) {
							$("#criticalDataCategories").hide();
							//removeHighlight(this);
						} else {
							$("#criticalDataCategories").show();
							addHighlightToAlreadySelectedLayers();
						}
					} else {
						$("#criticalDataCategories").hide();
						//removeHighlight(this);
					}
					//console.log("here in criticaldatacategories");
					evt.stopPropagation();
				});
	
				//track whether click events added on child buttons
				var clickwiredHealth = false;
				$("#healthDisparitiesData").click(function (evt) {
					//disable state/national radio buttons
					wobj._handleStateNationRaioBtnState(true, "labelDisabled", null);
					wobj._hideOtherSubCategories("#healthDisparitiesDataCategories");
	
					// $('#healthDisparitiesDataCategories').css('display','none');
					if ($.trim($("#healthDisparitiesDataCategories").html()).length === 0) {
						var healthDisparitiesData = suggestservicesHEALTH;
						$("#healthDisparitiesDataCategories").html("");
						var str = "<ul>";
	
						$.each(healthDisparitiesData, function (index, value) {
							//  var cid= 'climateid'+index;
							// str += '<li> <div id=\"'+index+'\" class=\"divSubBtn\">' + value.title + '</div><div id="climateChangeDataSubCategories" style="display:none" > </li>';
							str +=
								'<li> <div id="' +
								index +'" title="'+value.mouseover+
								'" class="divSubBtnCategory">' +value.title +
								"</div> </li>";
							if (clickwiredHealth == false) {
								//only need to click add on the first rendering, else click gets wired each time parent is clicked
								$(document).on("click", "#" + index, function () {
									wobj._removeEJLayers();
									wobj._removeNoaaLayers();
									wobj._removeLayers(suggestservicesCLIMATE);
									wobj._removeLayers(suggestservicesCRITSVCGAPS);
									$(".divSubBtnCategory").removeClass("highlight");
									$("#" + index).addClass("highlight");
									//removing the layers from map as only one layer should be selected at once for health
									$.each(suggestservicesHEALTH, function (layerid, value) {
										if(layerid!= index){
										 var layerVal = view.map.findLayerById(layerid+"_map");
										 view.map.remove(layerVal);
										}
								   });
									wobj._addSuggestServices(this.id, suggestservicesHEALTH);
									/*if (suggestservicesHEALTH[this.id].url) {
										$("#" + index).addClass("highlight");
										wobj._addSuggestServices(this.id, suggestservicesHEALTH);
										$.each(suggestservicesHEALTH, function (layerid, value) {
											if(layerid!= index){
												var layerVal = view.map.findLayerById(layerid+"_map");
												view.map.remove(layerVal);
												$("#" + layerid).removeClass("highlight");
											}
										});
	
									}*/
								});
							}
	
							// <div id="pollutionDiv" class="divBtn">Pollution and pollution sources</div>
						});
						clickwiredHealth = true; //set to true so on next click the child button clicks will not be added again
						str += "</ul>";
						$("#healthDisparitiesDataCategories").append(str);
					}
					// $( "#healthDisparitiesDataCategories" ).toggle();
					if ($(this).hasClass("highlight")) {
						if ($("#healthDisparitiesDataCategories").is(":visible")) {
							$("#healthDisparitiesDataCategories").hide();
							//removeHighlight(this);
						} else {
							$("#healthDisparitiesDataCategories").show();
							addHighlightToAlreadySelectedLayers();
						}
					} else {
						$("#healthDisparitiesDataCategories").hide();
						//removeHighlight(this);
					}
					evt.stopPropagation();
				});
				// end test
	
				return;
	
				if (ejlayoutJSON["Primary"].status) {
					var pa = "Primary";
	
					for (var pej in ejlayoutJSON[pa].items) {
						var cvalue = pa + "|" + pej;
						var optdesc = ejlayoutJSON[pa].items[pej].description;
						var tiptext = ejlayoutJSON[pa].items[pej].mouseover;
						var sel = ejlayoutJSON[pa].items[pej].selected;
						var sbgcolor = "transparent";
						var tcolor = "black";
						if (sel) {
							sbgcolor = "rgb(76,158,217)";
							tcolor = "White";
							wobj.ejformNode.ejcat.value = cvalue;
						}
						var divobj = dojo.create("div", {
							//"title": tiptext,
							tiptext: tiptext,
							style:
								"cursor: pointer; width: 100%; border: 1px solid white; background-color:" +
								sbgcolor +
								"; color: " +
								tcolor,
							innerHTML: optdesc,
							value: cvalue,
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
								var tiptext = ejlayoutJSON[pa].items[pej].mouseover;
								wobj.metaNode.innerHTML = tiptext;
							},
							onmouseout: function () {
								this.style.border = "1px solid white";
								wobj.metaNode.innerHTML = "";
							},
						});
						this.ejTypeNode.appendChild(divobj);
	
						var catobj = ejlayoutJSON[pa].items[pej];
						for (var acol in catobj.columns) {
							layerJson[acol] = catobj.columns[acol];
						}
					}
	
					//this.ejTypeNode.options[0].selected = true;
					var defaultkey = wobj.ejformNode.ejcat.value;
	
					this.createColList(defaultkey);
				} else {
					var lookuptableurl = ejscreenservice + "/" + lookuptableindex;
					var queryTask = new QueryTask(lookuptableurl);
					var query = new esriquery();
	
					query.returnGeometry = false;
	
					query.outFields = ["*"];
					var dirty = new Date().getTime();
					query.where = "FOR_DATA='Y' AND " + dirty + "=" + dirty;
	
					var operation = queryTask.execute(query);
					operation.then(
						function (featset) {
							if (featset.features.length > 0) {
								ejlayoutJSON["Primary"].status = true;
								var fetcount = featset.features.length;
								var catJson = {};
	
								for (var m = 0; m < fetcount; m++) {
									var cat = dojo.trim(
										featset.features[m].attributes["IndexCode"]
									);
									var colname = dojo.trim(
										featset.features[m].attributes["BIN_NAME"]
									);
									var desc = dojo.trim(
										featset.features[m].attributes["SHORT_DESC"]
									);
									var legendtitle = dojo.trim(
										featset.features[m].attributes["TOC_NAME"]
									);
									var txtname = dojo.trim(
										featset.features[m].attributes["TXT_NAME"]
									);
									var idfldname = dojo.trim(
										featset.features[m].attributes["ID_NAME"]
									);
									var hovertext = dojo.trim(
										featset.features[m].attributes["MOUSEOVER"]
									);
									layerJson[colname] = {};
									layerJson[colname].description = desc;
									layerJson[colname].legendtitle = legendtitle;
									layerJson[colname].txtname = txtname;
									layerJson[colname].idfldname = idfldname;
									layerJson[colname].cat = cat;
									layerJson[colname].hovertext = hovertext;
	
									ejIdentifyJSON[colname] = layerJson[colname];
									ejIdentifyJSON[colname].category = cat;
									if (typeof catJson[cat] == "undefined") {
										catJson[cat] = {};
									}
									catJson[cat][colname] = layerJson[colname];
								}
	
								for (var m = 0; m < fetcount; m++) {
									var cat = dojo.trim(
										featset.features[m].attributes["IndexCode"]
									);
									var colname = dojo.trim(
										featset.features[m].attributes["BIN_NAME"]
									);
									var desc = dojo.trim(
										featset.features[m].attributes["SHORT_DESC"]
									);
									var legendtitle = dojo.trim(
										featset.features[m].attributes["TOC_NAME"]
									);
									var txtname = dojo.trim(
										featset.features[m].attributes["TXT_NAME"]
									);
									var idfldname = dojo.trim(
										featset.features[m].attributes["ID_NAME"]
									);
									var hovertext = dojo.trim(
										featset.features[m].attributes["MOUSEOVER"]
									);
									layerJson[colname] = {};
									layerJson[colname].description = desc;
									layerJson[colname].legendtitle = legendtitle;
									layerJson[colname].txtname = txtname;
									layerJson[colname].idfldname = idfldname;
									layerJson[colname].cat = cat;
									layerJson[colname].hovertext = hovertext;
	
									ejIdentifyJSON[colname] = layerJson[colname];
									ejIdentifyJSON[colname].category = cat;
									if (typeof catJson[cat] == "undefined") {
										catJson[cat] = {};
									}
									catJson[cat][colname] = layerJson[colname];
								}
	
								var pa = "Primary";
								for (var pej in ejlayoutJSON[pa].items) {
									//add multi pctile category columns from config now that all the others have been added from lookup table query
									if (pej == "P_MUL") {
										for (c in ejlayoutJSON[pa].items[pej].columns) {
											var cObj = ejlayoutJSON[pa].items[pej].columns[c];
											layerJson[c] = {};
											layerJson[c].description = cObj.description;
											layerJson[c].legendtitle = cObj.legendtitle;
											layerJson[c].txtname = cObj.txtname;
											layerJson[c].idfldname = cObj.idfldname;
											layerJson[c].cat = cObj.cat;
											layerJson[c].hovertext = cObj.hovertext;
	
											ejIdentifyJSON[c] = layerJson[c];
											ejIdentifyJSON[c].category = cObj.cat;
											if (typeof catJson[cObj.cat] == "undefined") {
												catJson[cObj.cat] = {};
											}
											catJson[cObj.cat][c] = layerJson[c];
										}
									}
	
									if (catJson[pej]) {
										var cvalue = pa + "|" + pej;
										var optdesc = ejlayoutJSON[pa].items[pej].description;
										var tiptext = ejlayoutJSON[pa].items[pej].mouseover;
										var sel = ejlayoutJSON[pa].items[pej].selected;
										var sbgcolor = "transparent";
										var tcolor = "black";
										if (sel) {
											sbgcolor = "rgb(76,158,217)";
											tcolor = "White";
											wobj.ejformNode.ejcat.value = cvalue;
										}
										var divobj = dojo.create("div", {
											//"title": tiptext,
											tiptext: tiptext,
											style:
												"cursor: pointer; width: 100%; border: 1px solid white; background-color:" +
												sbgcolor +
												"; color: " +
												tcolor,
											innerHTML: optdesc,
											value: cvalue,
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
												var tiptext = ejlayoutJSON[pa].items[pej].mouseover;
												wobj.metaNode.innerHTML = tiptext;
											},
											onmouseout: function () {
												this.style.border = "1px solid white";
												wobj.metaNode.innerHTML = "";
											},
										});
										wobj.ejTypeNode.appendChild(divobj);
	
										var catobj = catJson[pej];
										for (var acol in catobj) {
											ejlayoutJSON[pa].items[pej].columns[acol] = catobj[acol];
										}
									}
								}
								//uncomment to see ejlayout object after populating from lookup table complete
								// console.log("ejlayoutJSON");
								// console.log(ejlayoutJSON);
								//wobj.ejTypeNode.options[0].selected = true;
								var defaultkey = wobj.ejformNode.ejcat.value;
								wobj.createColList(defaultkey);
							}
						},
						function (error) {
							console.log("error occurred: " + error);
						}
					);
				}
			},
			createColList: function (key) {
				this.ejListNode.innerHTML = "";
				var wobj = this;
				var n = 0;
				var p = key.split("|")[0];
				var s = key.split("|")[1];
				//console.log(ejlayoutJSON[p].items[s])
				for (var c in ejlayoutJSON[p].items[s].columns) {
					var optdesc = layerJson[c].description;
					var tiptext = layerJson[c].hovertext;
					var divobj = dojo.create("div", {
						//"title": tiptext,
						tiptext: tiptext,
						style: "cursor: pointer; width: 100%; border: 1px solid white;",
						innerHTML: optdesc,
						value: c,
						onclick: function () {
							wobj.ejformNode.ejvar.value = this.value;
							wobj.clearVarStyle(this);
							this.style.backgroundColor = "rgb(76,158,217)";
							this.style.color = "White";
						},
						onmouseover: function () {
							this.style.border = "1px solid navy";
							var keyvalue = this.value;
							var tiptext = layerJson[keyvalue].hovertext;
							wobj.metaNode.innerHTML = tiptext;
						},
						onmouseout: function () {
							this.style.border = "1px solid white";
							wobj.metaNode.innerHTML = "";
						},
					});
					this.ejListNode.appendChild(divobj);
	
					n = n + 1;
				}
				this.ejListNode.childNodes[0].click();
			},
	
			clearVarStyle: function (obj) {
				var divlists = obj.parentNode;
				//console.log(divlists.childNodes.length);
				for (var k = 0; k < divlists.childNodes.length; k++) {
					//console.log(divlists.childNodes[k].title);
					divlists.childNodes[k].style.backgroundColor = "White";
					divlists.childNodes[k].style.color = "Black";
				}
			},
			_changeEJtype: function () {
				var currentcat = this.ejTypeNode.value;
	
				this.createColList(currentcat);
			},
			// _mapEJ: function (e) {
			// 	var catkey = this.ejformNode.ejcat.value;
			// 	var t = catkey.split("|")[0];
			// 	var s = catkey.split("|")[1];
			// 	this.indextype = t;
			// 	var fieldname = this.ejformNode.ejvar.value;
			// 	if (fieldname.length == 0) {
			// 		this.ejListNode.childNodes[0].click();
			// 		fieldname = this.ejformNode.ejvar.value;
			// 	}
			// 	var pcttype = "";
			// 	for (var k = 0; k < this.ejformNode.pcttype.length; k++) {
			// 		if (this.ejformNode.pcttype[k].checked)
			// 			pcttype = this.ejformNode.pcttype[k].value;
			// 	}
			// 	//console.log("type: " + pcttype + " : " + this.ejformNode.pcttype.length);
			// 	this._mapejindex(fieldname, pcttype);
			// },
			_removeLayers : function(services){
				$.each(services, function (layerid, value) {
					var layerVal = view.map.findLayerById(layerid + "_map");
					view.map.remove(layerVal);
				});
			},
			_removeEJLayers: function() {
				var listL = ["ejindex_map", "ejindex_map_supp"];
				listL.forEach(function(layerId) {
					var layer = view.map.findLayerById(layerId);
					if (layer) {
						view.map.remove(layer);
					}
				});
			},
			_removeNoaaLayers: function() { //jquery-1.12.4.js:1502 Uncaught Error: Syntax error, unrecognized expression: #noaa|usslr1
				var noaaLayerIds =["noaa|usslr1",
				"noaa|usslr2",
				"noaa|usslr3", 
				"noaa|usslr4", 
				"noaa|usslr5",
				"noaa|usslr6"]
				noaaLayerIds.forEach(function(layerId) {
					var layer = view.map.findLayerById(layerId+"_map");
					if (layer) {
						view.map.remove(layer);
					}
				});
			},
			_mapejindex: function (
				fieldname,
				domElementId,
				ptype,
				requestUrl,
				layerId
			) {
				var renderurl, layerindex;
				var fielddesc = layerJson[fieldname].description;
				//supplemental and ej indexes use the same renderfields so
				//need to modify the logic
				var layeridstr = "ejindex_map";
				if (domElementId && domElementId.indexOf("supp") != -1) {
					layeridstr = "ejindex_map_supp";
				}
				var isMulti = false;
				var multiAry = ["B_80", "B_90", "B_95"];
				var multiAryLayerIndexLookup = {
					B_95: 0,
					B_90: 1,
					B_80: 2,
				};
	
				for (var i = 0; i < multiAry.length; i++) {
					if (multiAry[i] == fieldname) {
						isMulti = true;
					}
				}
	
				if (ptype == "state") {
					if (isMulti) {
						renderurl = ejscreenserviceMulti_state;
						layerindex = multiAryLayerIndexLookup[fieldname];
					} else {
						renderurl = requestUrl;
						layerindex = layerId;
					}
					fielddesc = fielddesc + "\n(State Percentiles)";
				} else {
					if (isMulti) {
						renderurl = ejscreenserviceMulti;
						layerindex = multiAryLayerIndexLookup[fieldname];
					} else {
						renderurl = requestUrl;
						layerindex = layerId;
					}
					fielddesc = fielddesc + "\n(National Percentiles)";
				}
	
				$(".divSubBtnCategory").removeClass("highlight");
				$("#" + domElementId).addClass("highlight");
				//supplemental and ej indexes use the same renderfields so
				//need to modify the the logic
				var listL = ["ejindex_map", "ejindex_map_supp"];
	
				if (isMulti == false) {
					//console.log("not multi")
					this._removeLayers(suggestservicesCLIMATE);
					this._removeLayers(suggestservicesHEALTH);
					this._removeLayers(suggestservicesCRITSVCGAPS);
					this._removeNoaaLayers();
					clsrenderer.field = fieldname;
					var isNewLayer = true;
					var ejindexlayer;
					var previousLayer;
					for (var i = 0; i < listL.length; i++) {
						var lyr = this.map.findLayerById(listL[i]);
						if (this.map.findLayerById(listL[i])) {
							if (lyr.id === listL[i] && fieldname === lyr.renderField) {
								$("#" + lyr.domElemId).removeClass("highlight");
								//user has clicked the same category again so cleanup
								this.map.remove(lyr);
								previousLayer = lyr.id;
								isNewLayer = false;
								//there is only one layer in existing at a given time between
								//ejindex_map and ejindex_map_supp toctitles.
								//FYI: ejindex_map includes three tabs- EJ, Pollution and Socioeconomic
								//and ejindex_map_supp covers only one Supplemental indexes
								//ejindex_map and ejindex_map_supp have common renderfield names therefore
								//logic got modified
								break;
							}
						}
					}
					if (!isNewLayer && previousLayer && previousLayer === layeridstr) {
						//do not draw the map, user has clicked the same category again
						//so return
						return;
					}
					var cat = layerJson[fieldname].cat;
					//6/8/23 supp now uses cat P_EJ5 instead of PEJ2 with adjustements to avoid same field names. Use new setttings for P_EJ5
					//var tocTitle = ejlayoutJSON.Primary.items[cat].tocLabel; //EJ5 is not in Primary, use Supplemental 
					//is separate Supplemental cat even needed in config now that EJ is combined and fields names for 2 and 5 factor are unique?
					var tocTitle = "";
					if (domElementId && domElementId.indexOf("supp") != -1) {
						//tocTitle = " Supplemental Indexes";
						tocTitle = ejlayoutJSON.Supplementary.items[cat].tocLabel;
					}	else {
						tocTitle = ejlayoutJSON.Primary.items[cat].tocLabel;
					}
					//var opcvalue = 0.5;
					//console.log(layeridstr, layerindex)
					var opcvalue = 1;
					ejindexlayer = new FeatureLayer({
						url: renderurl,
						title: tocTitle,
						id: layeridstr,
						layerId: layerindex,//feature not mapserver?
						opacity: opcvalue,
						renderer: clsrenderer, //feature not mapserver?
						visible: true  //feature not mapserver?
						/* sublayers: [
							{
								id: layerindex,
								title: fielddesc,
								renderer: clsrenderer,
								visible: true,
								source: {
									mapLayerId: layerindex,
								},
							},
						], */
					});
					//console.log("EJINDEX", ejindexlayer)
					//if the btn is already clicked then remove highlight and layer , if not add the layer to the legend
					listL.forEach((e) => {
						var lyr = this.map.findLayerById(e);
						if (
							lyr === undefined ||
							(lyr != undefined && lyr.id === e && fieldname != lyr.renderField)
						) {
							if (
								lyr != undefined &&
								lyr.id === e &&
								fieldname != lyr.renderField
							) {
								//previous element
								$("#" + lyr.domElemId).removeClass("highlight");
								//current element
								//$("#" + domElementId).addClass("highlight");
							}
							if (this.map.findLayerById(e)) {
								this.map.remove(lyr);
							}
						}
					});
					//now add new layer and highlght the element
					//console.log(ejindexlayer)
					this.map.add(ejindexlayer);
					$("#" + domElementId).addClass("highlight");
					//add properties
					ejindexlayer.isDynamic = true;
					ejindexlayer.renderField = fieldname;
					ejindexlayer.maptype = "ejscreen";
					if (layeridstr == "ejindex_map") {
						ejindexlayer.layerType = "ejscreen";
					} else {
						ejindexlayer.layerType = "ejscreen_supp";
					}
					ejindexlayer.renderIndex = layerindex;
					ejindexlayer.domElemId = domElementId;
					ejindexlayer.pctlevel = ptype;
					ejindexlayer.cat = layerJson[fieldname].cat;
					
					// TEST POPUP HERE
					var infoTemplate = new PopupTemplate();
					
					infoTemplate.title = ejIdentifyJSON[fieldname].description; // want alias...
					console.log(ejIdentifyJSON[fieldname].description)
					//console.log(ejindexlayer)
					//infoTemplate.content = `Decription: ${${fieldname}}`
					//infoTemplate.content = this._idDesc;
					var description = ejIdentifyJSON[fieldname].description; 
					var ltitle = ejIdentifyJSON[fieldname].legendtitle
					var val = ejIdentifyJSON[fieldname].idfldname.split(",")[1]
					var txt = ejIdentifyJSON[fieldname].txtname
					//infoTemplate.content = "Value: {"+val+"}<br>Percentile: {"+txt+"}";
					if (ejindexlayer.cat == "P_ENV") {
						infoTemplate.content = "Value: {"+val+"}<br>Percentile: {"+txt+"}";
					} else {
						infoTemplate.content = "Percentile: {"+txt+"}";
					}
					//for x i nidfldname
					//console.log(ejIdentifyJSON[fieldname].idfldname)
					//console.log("ejindexlayer", ejindexlayer)
	
					ejindexlayer.popupTemplate = infoTemplate
				}
	
				//  }
				else {
					//handle multi index layers differently
					//skip renderer and use symbols from service, don't define dynamic layer
					var isNewLayer = true;
					var ejindexlayer;
					if (this.map.findLayerById(layeridstr)) {
						var lyr = this.map.findLayerById(layeridstr);
						this.map.remove(lyr);
						isNewLayer = false;
					}
	
					var opcvalue = 0.5;
					ejindexlayer = new FeatureLayer({
						url: renderurl,
						title: "EJScreen Map",
						id: layeridstr,
						opacity: opcvalue,
						sublayers: [
							{
								id: layerindex,
								title: fielddesc,
								visible: true,
							},
						],
					});
					this.map.add(ejindexlayer);
					$("#" + domElementId).addClass("highlight");
	
					ejindexlayer.isDynamic = true;
					ejindexlayer.renderField = fieldname;
					ejindexlayer.maptype = "ejscreen";
					ejindexlayer.layerType = "ejscreen_multi";
					//ejindexlayer.renderIndex = layerindex;
					ejindexlayer.domElemId = domElementId;
					ejindexlayer.renderIndex = layerindex;
					ejindexlayer.pctlevel = ptype;
					ejindexlayer.cat = layerJson[fieldname].cat;
				}
			},
			getEsriMapLayer: function () {},
			ArrayContains: function (element, inArray) {
				for (var j = 0; j < inArray.length; j++) {
					if (element == inArray[j]) {
						return true;
					}
				}
				return false;
			},
			_addSuggestServices: function (skey, svcConfig) {
				//var suggestservices = this.suglayerlist;
				var suggestservices = svcConfig;
	
				//var frmID = this.formnodeID;
				//var frm = document.getElementById(frmID);
				var tocinfos = [];
				//for (var m = 0; m < frm.slayers.length; m++) {
				//if (frm.slayers[m].checked) {
				//var sugid = frm.slayers[m].value;
				var sugid = skey;
				//console.log(skey)
				if (sugid.includes("|")) {
					this._removeEJLayers()
					this._removeLayers(suggestservicesCLIMATE);
					this._removeLayers(suggestservicesHEALTH);
					this._removeLayers(suggestservicesCRITSVCGAPS);
					this._removeNoaaLayers();
					$(".divSubBtnCategory").removeClass("highlight");
					$("#" + sugid.split("|")[1]).addClass("highlight");
				}
				var lid = sugid + "_map";
				var mtitle = "";
				//console.log(suggestservices[sugid])
				if (suggestservices[sugid]) {
					mtitle = suggestservices[sugid].title;
				} else {
					var folderid = sugid.split("|")[0];
					var svcid = sugid.split("|")[1];
					var folderobj = suggestservices[folderid].services;
					mtitle = folderobj[svcid].title;
				}
				//fooddesert fix, check for the second layer that has been force added when the first one is.
				// if (sugid == 'fooddesert'){
				//   if (this.view.map.findLayerById("fooddesert_map2")){
				//      alert("'" + mtitle + "' has already been added to the map!");
				//      return;
	
				//   }
				// }
				if (this.view.map.findLayerById(lid)) {
					//if (this.view.map.findLayerById(lid)) {
					//alert("'" + mtitle + "' has already been added to the map!");
					var layerVal = this.view.map.findLayerById(lid);
					this.view.map.remove(layerVal);
					if (sugid.includes("|")) {
						$("#" + sugid.split("|")[1]).removeClass("highlight");
					} else {
						$("#" + sugid).removeClass("highlight");
					}
				} else {
					var stype, surl, trans;
					var srender; //4/24/24 - add support for renderer from config
					var slayers = [];
					if (suggestservices[sugid]) {
						stype = suggestservices[sugid].type;
						surl = (suggestservices[sugid].url) ? suggestservices[sugid].url : suggestservices[sugid].layerurl; // assuming if we don't have url we have layerurl - will this break climate?
						
						if (suggestservices[sugid].renderer){
							srender = suggestservices[sugid].renderer;	//4/24/24 - add support for renderer from config					
						}
								
						
						if (suggestservices[sugid].opacity)
							trans = suggestservices[sugid].opacity;
						else trans = 0.8;
						if (suggestservices[sugid].layers)
							slayers = suggestservices[sugid].layers;
					} else {
						var folderid = sugid.split("|")[0];
						var svcid = sugid.split("|")[1];
						var folderobj = suggestservices[folderid].services;
						stype = folderobj[svcid].type;
						surl = folderobj[svcid].url;
						if (folderobj[svcid].opacity) trans = folderobj[svcid].opacity;
						else trans = 0.8;
						if (folderobj[svcid].layers) slayers = folderobj[svcid].layers;
					}
					var templayer = null;
				   if(!skey.startsWith("noaa")){
						//console.log(surl)
						var domainurl = surl;
						var domainpat = /^https?:\/\/[A-Za-z0-9_\.]+\//i;
						var match = surl.match(domainpat);
						if (match != null) {
							domainurl = match[0];
						}
						urlUtils.addProxyRule({
							proxyUrl: proxyurl,
							urlPrefix: domainurl,
						});
				   }
					if (stype == "featurelayer") {
						var infoTemplate = new PopupTemplate();
	
						//  var infoTemplate = new PopupTemplate({
						//     fieldInfos: [{fieldName:'PCT_BROADBAND',format:{places:3}}]
						// });
	
						infoTemplate.title = mtitle;
	
						// if (sugid == "fooddesert"){
						//      mtitle = infoTemplate.title + " - Detail"
						// }
						//infoTemplate.content = "{*}";
	
						infoTemplate.content = this._idDesc;
						if (suggestservices[sugid].template)
							infoTemplate.content = suggestservices[sugid].template;
	
						templayer = new FeatureLayer(surl, {
							mode: FeatureLayer.MODE_ONDEMAND,
							id: lid,
							popupTemplate: infoTemplate,
							outFields: ["*"],
							title: mtitle,
							opacity: trans,
						});
						templayer.layerType = "addon";
						//RW 4/24/24 - add support for renderer from config
						if (srender){	
							templayer.renderer = srender;		
						}
						
						
						this.view.map.add(templayer);
	
						tocinfos[sugid] = { title: mtitle, dlayers: slayers };
					} else if (stype == "agsimagery") {
						var templayer = new ImageryLayer({
							url: surl,
							legendEnabled: true,
							format: "jpgpng",
							id: lid,
							title: mtitle,
							opacity: trans,
						});
						templayer.layerType = "addon";					
						this.view.map.add(templayer);
					} else {
						if (stype == "agstile") {
							templayer = new TileLayer(surl, {
								id: lid,
								title: mtitle,
								opacity: trans,
							});
						} else if (stype == "agsdynamic") {
							templayer = new MapImageLayer(surl, {
								id: lid,
								title: mtitle,
								visible: true, //sets the top layer to visible so top level checkbox on by default. If false user has to click checkbox to draw
								opacity: trans,
							});
						}
						templayer.layerType = "addon";
	
						if (slayers.length > 0) {
							templayer.sublayers = slayers;
						}
	
						//var sub0 = templayer.sublayers.getItemAt(0);
						//sub0.title = "mytest1";
	
						if (templayer != null) {
							this.view.map.add(templayer);
						}
						templayer.on("layerview-create-error", function (e) {
							console.log("error loading layer");
							console.log(e);
						});
					}
				}
				//}
				//}
	
				//frm.reset();
			},
			_hideOtherSubCategories: function (activeTab) {
				subCategoryTabs.forEach((e) => {
					if (e !== activeTab) {
						$(e).css("display", "none");
					}
				});
			},
			_handleStateNationRaioBtnState(stateToSet, cAdd, cRemove) {
				//enable state/national radio buttons
				$('input[name="pcttype"]').prop("disabled", stateToSet);
				if (cAdd) {
					$("#nationlabel").addClass(cAdd);
					$("#statelabel").addClass(cAdd);
				}
				if (cRemove) {
					$("#nationlabel").removeClass(cRemove);
					$("#statelabel").removeClass(cRemove);
				}
			},
			_idDesc: function (e) {
				var infowidget = new IDinfoWindow(
					{
						view: view,
						idgraphic: e.graphic
						//removefooter : true
					},
					dojo.create("div")
				);
				infowidget.startup();
	
				return infowidget.domNode;
			},
			destroy: function () {
				dojo.disconnect(this._zoomHandler);
				dojo.empty(this.domNode);
				this.inherited(arguments);
			},
		});
	
		return MapEJIndexMod;
	});