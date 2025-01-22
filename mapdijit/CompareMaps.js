define([
	"dojo/_base/declare",
	"dojo/_base/connect",
	"dojo/on",
	"dojo/DeferredList",
	"dojo/has",
	"dojo/aspect",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom-construct",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dijit/_Widget",
	"dijit/_Templated",
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/Evented",
	"dojox/gfx",
	"dojo/fx",
	"dojo/fx/Toggler",
	"dojo/text!mapdijit/templates/compareMaps.html",
	"dojo/text!mapdijit/templates/transparency.html",
	"esri/views/MapView",
	"esri/Map",
	"esri/WebMap",
	"esri/core/watchUtils",
	"esri/layers/MapImageLayer",
	"esri/layers/TileLayer",
	"esri/layers/FeatureLayer",
	"esri/tasks/support/FeatureSet",
	"esri/layers/GraphicsLayer",
	"esri/Graphic",
	"esri/widgets/Legend",
	"esri/tasks/IdentifyTask",
	"esri/tasks/support/IdentifyParameters",
	"esri/tasks/QueryTask",
	"esri/tasks/support/Query",
	"esri/geometry/Extent",
	"esri/geometry/Point",
	"esri/geometry/SpatialReference",
	"esri/config",
	"esri/request",
	"esri/PopupTemplate",
	"mapdijit/MapDemog",
	"mapdijit/MapOther",
	"mapdijit/ThresholdWidget",
	"mapdijit/MapMore",
	"dojo/dom",
	"dojo/domReady!",
], function (
	declare,
	connect,
	on,
	DeferredList,
	has,
	aspect,
	lang,
	array,
	domConstruct,
	domClass,
	domStyle,
	domAttr,
	_Widget,
	_Templated,
	_WidgetBase,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	Evented,
	gfx,
	coreFx,
	Toggler,
	dijittemplate,
	opctemplate,
	MapView,
	Map,
	WebMap,
	watchUtils,
	MapImageLayer,
	TileLayer,
	FeatureLayer,
	FeatureSet,
	GraphicsLayer,
	Graphic,
	Legend,
	IdentifyTask,
	IdentifyParameters,
	QueryTask,
	Query,
	Extent,
	Point,
	SpatialReference,
	esriConfig,
	esriRequest,
	PopupTemplate,
	MapDemog,
	MapOther,
	ThresholdWidget,
	MapMore,
	dom
) {
	var layerJson = {};
	var layerCatJson = {};

	var clsrenderer = {
		type: "class-breaks",
		defaultSymbol: globalDefaultSymbol4Pctiles,
        defaultLabel: globalDefaultSymbol4PctilesLabel,
		classBreakInfos: globalClassBreaks4Pctiles
	};

	var CompareMaps = declare(
		[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],
		{
			templateString: dijittemplate,
			widgetsInTemplate: true,
			constructor: function (options, srcRefNode) {
				options = options || {};
				this.mapArray = []; //map array util
				this.mapEventTracker = {}; //event tracker util for connect/disconnecting events
				dojo.safeMixin(this, options);
			},

			startup: function () {},
		    postCreate: function () {
				var wobj = this;
				var lookuptableurl = ejscreenservice + "/" + lookuptableindex;						
				var queryTask = new QueryTask(lookuptableurl);
				var query = new Query();
				query.returnGeometry = false;
				query.outFields = ["*"];
				var dirty = new Date().getTime();
				query.where = "FOR_DATA='Y' AND " + dirty + "=" + dirty;

				queryTask
					.execute(query)
					.then(function (featset) {
						if (featset.features.length > 0) {
							
							 var sortedFeats = [];
                        //dataobj from config with report field order
						//clone global and remove ST records so don't show in drop down list
						var dataobjNoST = JSON.parse(JSON.stringify(dataobj));
						//remove ST for Explore	
						delete dataobjNoST['DEMOGIDX_2ST'];
						delete dataobjNoST['DEMOGIDX_5ST'];
                        for (var doboj in dataobjNoST) {
                            for (var i = 0; i < featset.features.length; i++) {
                                  if (doboj == featset.features[i].attributes["FIELD_NAME"]) {
                                    sortedFeats.push(featset.features[i]);
                                    break;
                                  }
                            }
                        }
						//RW 4/22/24 update field names from lookup to remove USA label, not needed in Explore Charts and Compare, only Comm Report
						for (var i = 0; i < featset.features.length; i++) {
                                  if (featset.features[i].attributes["DESCRIPTION"] == 'Demographic Index USA') {
										featset.features[i].attributes["SHORT_DESC"] = 'Demographic Index'; 
										featset.features[i].attributes["RPT_NAME"] = 'Demographic Index'; 										
                                  }
								  if (featset.features[i].attributes["DESCRIPTION"] == 'Supplemental Demographic Index USA') {
										featset.features[i].attributes["SHORT_DESC"] = 'Supplemental Demographic Index';
										featset.features[i].attributes["RPT_NAME"] = 'Supplemental Demographic Index';										
                                  }
                        }
							
							
							
							
							
							ejlayoutJSON["Primary"].status = true;
							var fetcount = sortedFeats.length;
							var catJson = {};

							for (var m = 0; m < fetcount; m++) {								
								// var cat = dojo.trim(
									// sortedFeats[m].attributes["IndexCode"]
								// );
								
								var cat = dojo.trim(sortedFeats[m].attributes["IndexCode"] || '');
								// var colname = dojo.trim(
									// sortedFeats[m].attributes["BIN_NAME"]
								// );
								var colname = dojo.trim(sortedFeats[m].attributes["BIN_NAME"] || '');
								// var desc = dojo.trim(
									// sortedFeats[m].attributes["SHORT_DESC"]
								// );
								var desc = dojo.trim(sortedFeats[m].attributes["SHORT_DESC"] || '');
								// var fulldesc = dojo.trim(
									// sortedFeats[m].attributes["RPT_NAME"]
								// );		
                                var fulldesc = dojo.trim(sortedFeats[m].attributes["RPT_NAME"] || '');								
								// var legendtitle = dojo.trim(
									// sortedFeats[m].attributes["TOC_NAME"]
								// );	
                                 var legendtitle = dojo.trim(sortedFeats[m].attributes["TOC_NAME"] || '');										
								// var txtname = dojo.trim(
									// sortedFeats[m].attributes["TXT_NAME"]
								// );
								var txtname = dojo.trim(sortedFeats[m].attributes["TXT_NAME"] || '');
								// var idfldname = dojo.trim(
									// sortedFeats[m].attributes["ID_NAME"]
								// );
								var idfldname = dojo.trim(sortedFeats[m].attributes["ID_NAME"] || '');
								// var hovertext = dojo.trim(
									// sortedFeats[m].attributes["MOUSEOVER"]
								// );	
                                var hovertext = dojo.trim(sortedFeats[m].attributes["MOUSEOVER"] || '');
								
						     	if(sortedFeats[m].attributes["FIELD_NAME"] === 'DEMOGIDX_5ST'){
									colname = 'B_DEMOGIDX_5ST';
								}else if(sortedFeats[m].attributes["FIELD_NAME"] === 'DEMOGIDX_2ST'){
									colname = 'B_DEMOGIDX_2ST';
								}

								layerJson[colname] = {};
								layerJson[colname].description = desc;
								layerJson[colname].fulldesc = fulldesc;
								layerJson[colname].legendtitle = legendtitle;
								layerJson[colname].txtname = txtname;
								layerJson[colname].idfldname = idfldname;
								layerJson[colname].cat = cat;
								layerJson[colname].hovertext = hovertext;


								//need values by cat and colname combo
								if (!(layerCatJson[cat])){
									layerCatJson[cat] = {};
								}								
								layerCatJson[cat][colname] = {};
								layerCatJson[cat][colname].description = desc;
								layerCatJson[cat][colname].fulldesc = fulldesc;
								layerCatJson[cat][colname].legendtitle = legendtitle;
								layerCatJson[cat][colname].txtname = txtname;
								layerCatJson[cat][colname].idfldname = idfldname;
								layerCatJson[cat][colname].cat = cat;
								layerCatJson[cat][colname].hovertext = hovertext;								

								ejIdentifyJSON[colname] = layerJson[colname];
								ejIdentifyJSON[colname].category = cat;
								if (typeof catJson[cat] == "undefined") {
									catJson[cat] = {};
								}
								catJson[cat][colname] = layerJson[colname];
								
							}

							

							//var pa = "Primary";
						ejList = ["Primary","Supplementary"];
						
						for (var i = 0; i < ejList.length; i++) {
							var pa = ejList[i];
							for (var pej in ejlayoutJSON[pa].items) {
								if (catJson[pej]) {
									var cvalue = pa + "|" + pej;
									var optdesc = ejlayoutJSON[pa].items[pej].description;
									var tiptext = ejlayoutJSON[pa].items[pej].mouseover;

									var sbgcolor = "transparent";
									var tcolor = "black";

									var divobj = dojo.create("div", {
										//"title": tiptext,
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
										layerJson[acol].catopt = pa + "|" + pej;
										ejlayoutJSON[pa].items[pej].columns[acol] = catobj[acol];
										ejlayoutJSON[pa].items[pej].columns[acol] = catobj[acol];
									}
								}
							}
						   }						   
						}
						for (var amapid in mapsJson) {
							wobj.initMap(amapid);
						}
					})
					.catch(function (error) {
						console.log("error occurred: " + error);
					});
			},
			 /* postCreate: function () {
				var wobj = this;
				//added try catch to see legend error but no error thrown
				try {
				
						
			//calling json direct vs service works for layer but legend doesn't draw. Legend draws if get features by Query
                  //var featset = compareMapperObj; // Using config object now instead of lookuptablefull - 6/8/23
				 
//thought casting features as FeatureSet like query return would fix, but still doesn't draw Legend. Also kills map2 legend and other categories like Demog				 
				  //var featset = new FeatureSet({features:compareMapperObj.features});
				var featset = FeatureSet.fromJSON(compareMapperObj);
			
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
								var fulldesc = dojo.trim(
									featset.features[m].attributes["RPT_NAME"]
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
								layerJson[colname].fulldesc = fulldesc;
								layerJson[colname].legendtitle = legendtitle;
								layerJson[colname].txtname = txtname;
								layerJson[colname].idfldname = idfldname;
								layerJson[colname].cat = cat;
								layerJson[colname].hovertext = hovertext;


								//need values by cat and colname combo
								if (!(layerCatJson[cat])){
									layerCatJson[cat] = {};
								}								
								layerCatJson[cat][colname] = {};
								layerCatJson[cat][colname].description = desc;
								layerCatJson[cat][colname].fulldesc = fulldesc;
								layerCatJson[cat][colname].legendtitle = legendtitle;
								layerCatJson[cat][colname].txtname = txtname;
								layerCatJson[cat][colname].idfldname = idfldname;
								layerCatJson[cat][colname].cat = cat;
								layerCatJson[cat][colname].hovertext = hovertext;								

								ejIdentifyJSON[colname] = layerJson[colname];
								ejIdentifyJSON[colname].category = cat;
								if (typeof catJson[cat] == "undefined") {
									catJson[cat] = {};
								}
								catJson[cat][colname] = layerJson[colname];
								
							}

							

							//var pa = "Primary";
						ejList = ["Primary","Supplementary"];
						
						for (var i = 0; i < ejList.length; i++) {
							var pa = ejList[i];
							for (var pej in ejlayoutJSON[pa].items) {
								if (catJson[pej]) {
									var cvalue = pa + "|" + pej;
									var optdesc = ejlayoutJSON[pa].items[pej].description;
									var tiptext = ejlayoutJSON[pa].items[pej].mouseover;

									var sbgcolor = "transparent";
									var tcolor = "black";

									var divobj = dojo.create("div", {
										//"title": tiptext,
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
										layerJson[acol].catopt = pa + "|" + pej;
										ejlayoutJSON[pa].items[pej].columns[acol] = catobj[acol];
										ejlayoutJSON[pa].items[pej].columns[acol] = catobj[acol];
									}
								}
							}
						   }						   
						}
						for (var amapid in mapsJson) {
							wobj.initMap(amapid);
						}
						
						
						
				}
				catch (error) {
					console.error(error);
				} 
				
					
				
			},*/
			createColList: function (key, fld) {
				this.ejListNode.innerHTML = "";
				var wobj = this;
				var n = 0;
				var seln = 0;
				var p = key.split("|")[0]; //e.g. Primary or Supplemental
				var s = key.split("|")[1]; //e.g. P_EJ2 or P_EJ5
				if (ejlayoutJSON[p]) {
					for (var c in ejlayoutJSON[p].items[s].columns) {
						//c = column name e.g. B_PTRAF

						//var optdesc = layerJson[c].description;
						//var tiptext = layerJson[c].hovertext;

						var optdesc = ejlayoutJSON[p].items[s].columns[c].description;
						//var tiptext = ejlayoutJSON[p].items[s].columns[c].hovertext;
			
						if (fld == c) seln = n;
						var divobj = dojo.create("div", {
							//"title": tiptext,
							style: "cursor: pointer; width: 100%; border: 1px solid white;",
							innerHTML: optdesc,
							value: c,
							onclick: function () {
								//concat field, cat, and group
								wobj.ejformNode.ejvar.value = this.value + "|" + s + "|" + p;
								//wobj.ejformNode.ejvar.value = this.value;
								wobj.clearVarStyle(this);
								this.style.backgroundColor = "rgb(76,158,217)";
								this.style.color = "White";
							},
							onmouseover: function () {
								this.style.border = "1px solid navy";
								var keyvalue = this.value;
								//var tiptext = layerJson[keyvalue].hovertext;
								var tiptext = ejlayoutJSON[p].items[s].columns[keyvalue].hovertext;
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
					this.ejListNode.childNodes[seln].click();
				}
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
			highlightStyle: function (obj, v) {
				console.log(v);
				for (var k = 0; k < obj.childNodes.length; k++) {
					var currentv = obj.childNodes[k].value;
					if (v == currentv) {
						obj.childNodes[k].style.backgroundColor = "rgb(76,158,217)";
						obj.childNodes[k].style.color = "White";
					} else {
						obj.childNodes[k].style.backgroundColor = "White";
						obj.childNodes[k].style.color = "Black";
					}
				}
			},
			initMap: function (mapdivStr) {
				dojo.create(
					"div",
					{
						id: "demogwidget_" + mapdivStr,
						style: "display: none;",
					},
					"demogdiv"
				);

				dojo.create(
					"div",
					{
						id: "threshold_" + mapdivStr,
						style: "display: none;",
					},
					"thresholdDiv"
				);

				dojo.create(
					"div",
					{
						id: "morewidget_" + mapdivStr,
						style: "display: none;",
					},
					"morediv"
				);

				var wobj = this;
				var mapObj;
				var bmap = new Map({
					basemap: "gray",
				});
				if (!opener || !opener.view || !opener.view.center) {
					mapObj = new MapView({
						id: mapdivStr,
						map: bmap,
						center: [-119.11, 36.65],
						zoom: 9,
						container: mapdivStr,
					});
				} else {
					var bcenter = opener.view.center;
					var blevel = opener.view.zoom;
					var cx = bcenter.x;
					var cy = bcenter.y;
					var csp = bcenter.spatialReference.wkid;
					var cpoint = new Point({
						x: cx,
						y: cy,
						spatialReference: new SpatialReference({ wkid: csp }),
					});
					mapObj = new MapView({
						id: mapdivStr,
						map: bmap,
						center: cpoint,
						zoom: blevel,
						container: mapdivStr,
					});
				}

				var field = mapsJson[mapdivStr].field;
				var theme = mapsJson[mapdivStr].theme;
				var category = mapsJson[mapdivStr].category;
				var group = mapsJson[mapdivStr].group;

				mapObj.when(function () {
					if (theme == "ejindex") {
						var pcttype = "nation";
						if (mapsJson[mapdivStr].pcttype)
							pcttype = mapsJson[mapdivStr].pcttype;
						wobj.mapejindex(field, category, group, pcttype, mapObj);
						var etype;
						if (layerJson[field]) {
							etype = layerJson[field].catopt;
						} else {
							etype = "not known";
						}
						wobj.ejformNode.ejcat.value = etype;
						wobj.highlightStyle(wobj.ejTypeNode, etype);
						wobj.createColList(etype, field);
					}

					if (theme == "demog") {
						if (dijit.byId("demogwidget_" + mapObj.id)) {
							dijit.byId("demogwidget_" + mapObj.id).view = mapObj;
						} else {
							var dgwidget = new MapDemog(
								{
									view: mapObj,
									defaultField: field,
								},
								"demogwidget_" + mapObj.id
							);
							dgwidget.startup();
						}
						dojo.byId("demogwidget_" + mapObj.id).style.display = "block";
					}
					if (theme == "other") {
						if (dijit.byId("otherwidget")) {
							dijit.byId("otherwidget").view = mapObj;
						} else {
							var owidget = new MapOther(
								{
									view: mapObj,

									id: "otherwidget",
								},
								"otherwg"
							);
							//owidget.startup();
							owidget.titleNode.value = mapsJson[mapdivStr].description;
							owidget.urlNode.value = mapsJson[mapdivStr].remoteURL;
							owidget._addRemoteLyr();
						}
					}
				});
				wobj.createlegend(mapObj);
				/* mapObj.map.layers.on("change", function(event) {
                   // change event fires after an item has been added, moved or removed from the collection.
                   // event.moved - an array of moved layers
                   // event.removed - an array of removed layers
                   // event.added returns an array of added layers
                   if (event.added.length > 0) {
                       wobj.createlegend(mapObj);
                   }
                 }); */

				mapObj.on("click", function (evt) {
					wobj.doIdentify(evt, mapObj);
				});
				var h = watchUtils.whenTrue(mapObj, "stationary", function () {
					wobj.syncExtents(mapObj);
				});
				this.mapEventTracker[mapObj.id] = h;

				this.mapArray.push(mapObj);
			},

			mapejindex: function (fieldname, cat, group, ptype, mview) {
				
				var map = mview.map;
				var mapids = [
					"demog_map",
					"ejindex_map",
					"other_map",
					"more_map",
					"threshold_map",
				];
				for (var i = 0; i < mapids.length; i++) {
					if (map.findLayerById(mapids[i])) {
						map.remove(map.findLayerById(mapids[i]));
					}
				}

				var layeridstr = "ejindex_map";
				var renderurl, layerindex, titlesuffix;
				var desc;
				if (layerJson[fieldname] && layerJson[fieldname].fulldesc) {
					//desc = layerJson[fieldname].fulldesc;
					desc = layerCatJson[cat][fieldname].fulldesc;					
				} else {
					desc = "not found";
				}

				renderurl = ejlayoutJSON[group].services[ptype].url;
				layerindex = ejlayoutJSON[group].services[ptype].index;
				titlesuffix = ejlayoutJSON[group].services[ptype].titlesuffix;

				// if (ptype == "state") {
				// 	renderurl = ejscreenservice_state;
				// 	layerindex = ejmapindex_state;
				// 	desc = desc + " State Percentiles";
				// } else {
				// 	renderurl = ejscreenservice;
				// 	layerindex = ejmapindex;
				// 	desc = desc + " National Percentiles";
				// }
				clsrenderer.field = fieldname;
				var opcvalue = 1;
				var ejindexlayer = new MapImageLayer({
					url: renderurl,
					title: "EJScreen Map",
					id: layeridstr,
					opacity: opcvalue,
					sublayers: [
						{
							id: layerindex,
							title: "EJSCREEN",
							renderer: clsrenderer,
							visible: true,
							source: {
								mapLayerId: layerindex,
							},
						},
					],
				});

				map.add(ejindexlayer);
				ejindexlayer.isDynamic = true;
				ejindexlayer.renderField = fieldname;
				ejindexlayer.layerType = "ejscreen";
				ejindexlayer.pctlevel = ptype;
				ejindexlayer.renderIndex = layerindex;
				var cat;
				if (layerJson[fieldname] && layerJson[fieldname].cat) {
					ejindexlayer.cat = layerJson[fieldname].cat;
				} else {
					cat = "not found";
				}
				if (layerJson[fieldname] && layerJson[fieldname].description) {
					ejindexlayer.name = layerJson[fieldname].description;
				} else {
					ejindexlayer.name = "Not found yet";
				}
				var mapid = mview.id;
				var labid = mapsJson[mapid].labelid;
				dojo.byId(labid).innerHTML = desc;
				mapsJson[mapid].field = fieldname;
			},
			createlegend: function (mview) {
				var mapid = mview.id;
				var legendwgid = mapsJson[mapid].legendid + "_wg";
				var lcontentid = mapid + "_legendcontent";

				var layerinfos = [];
				var mapids = [
					"demog_map",
					"ejindex_map",
					"other_map",
					"more_map",
					"threshold_map",
				];
				for (var i = 0; i < mapids.length; i++) {
					if (mview.map.findLayerById(mapids[i])) {
						var clayer = mview.map.findLayerById(mapids[i]);
						if (clayer.visible) {
							var layerinfo = { layer: clayer, title: clayer.name };
							layerinfos.push(layerinfo);
						}
					}
				}

				var imglgnDijit = new Legend({
					//id: legendwgid,
					view: mview,
					layerInfos: layerinfos,
					container: lcontentid,
					autoUpdate: true,
				});
				//imglgnDijit.startup();
			},

			syncExtents: function (mview) {
				//make all map extents match the new extent of map that fired extent change
				var newext = mview.extent;

				var sourcemapid = mview.id;
				//console.log("source map id: " + sourcemapid);
				/*  for (var hdl in this.mapEventTracker) {
                    console.log("remove connector: " + hdl);
                    var onconnector = this.mapEventTracker[hdl];
                    onconnector.remove();
                };
                this.mapEventTracker = {}; */

				//disconnect all on's to avoid event propagation and clear the tracker
				/* array.forEach(this.mapEventTracker, function (onconnector) {
                console.log("remove connector")
                onconnector.remove();
            });
            this.mapEventTracker = []; */

				//set all extents and add to deferred to fire when all done
				for (var i = 0; i < this.mapArray.length; i++) {
					if (this.mapArray[i].id != sourcemapid) {
						if (
							this.mapArray[i].extent &&
							(this.mapArray[i].extent.xmin !== newext.xmin ||
								this.mapArray[i].extent.xmax !== newext.xmax)
						) {
							// console.log("change exent for map: " + this.mapArray[i].id);
							this.mapArray[i].extent = newext;
						}
					}
				}
			},
			_closePane: function (e) {
				dojo.byId("theme").style.display = "none";
			},
			showloading: function (map) {
				var leftx = 0;
				var offx = 100;
				if (map.id == "map2") leftx = map.width;
				var x = map.width / 2;
				var y = map.height / 2;
				var divid = "spindiv_" + map.id;
				if (document.getElementById(divid)) {
					var dummy = document.getElementById(divid);
					dummy.style.position = "absolute";
					dummy.style.left = x + leftx - offx + "px";
					dummy.style.top = y + "px";
					dummy.style.backgroundColor = "#CCCCCC";
					dummy.style.color = "red";
					dummy.style.fontSize = "12pt";
					dummy.innerHTML = "Loading...Please wait";
				} else {
					var dummy = document.createElement("div");
					dummy.id = divid;
					dummy.style.position = "absolute";

					dummy.style.left = x + leftx - offx + "px";
					dummy.style.top = y + "px";
					dummy.innerHTML = "Loading...Please wait";
					dummy.style.backgroundColor = "#CCCCCC";
					dummy.style.color = "red";
					dummy.style.fontSize = "12pt";
					dojo.byId(map.id).appendChild(dummy);
				}
			},
			hideloading: function (map) {
				var divid = "spindiv_" + map.id;
				if (document.getElementById(divid)) {
					var dummy = document.getElementById(divid);
					dojo.byId(map.id).removeChild(dummy);
				}
			},

			switchtype: function (e) {
				var v = e.target.value;
				var currentmap = null;
				var mid = dojo.byId("ejform").panid.value;
				//alert("my mid: " + mid);

				for (i = 0; i < this.mapArray.length; i++) {
					if (this.mapArray[i].id == mid) {
						currentmap = this.mapArray[i];
						if (v == "demog")
							dojo.byId("demogwidget_" + mid).style.display = "block";
						if (v == "threshold")
							dojo.byId("threshold_" + mid).style.display = "block";
						if (v == "more") {
							dojo.byId("morewidget_" + mid).style.display = "block";
						}
						// if (v == "more" && dijit.byId("morewidget")) {
						// 	dojo.byId("morewidget").style.display = "block";
						// }
						if (v == "other" && dijit.byId("otherwidget")) {
							dojo.byId("otherwidget").style.display = "block";
						}
					} else {
						dojo.byId("demogwidget_" + this.mapArray[i].id).style.display =
							"none";
						dojo.byId("threshold_" + this.mapArray[i].id).style.display =
							"none";
						dojo.byId("morewidget_" + this.mapArray[i].id).style.display =
							"none";						
						// if (dojo.byId("morewidget")) {
						// 	dojo.byId("morewidget").style.display = "none";
						// }
						if (dijit.byId("otherwidget")) {
							dojo.byId("otherwidget").style.display = "block";
						}
					}
				}

				switch (v) {
					case "ejindex":
						this._hideOtherWidgets("ejdiv");
						break;
					case "demog":
						this._hideOtherWidgets("demogdiv");
						if (currentmap && dijit.byId("demogwidget_" + currentmap.id)) {
							dijit.byId("demogwidget_" + currentmap.id).view = currentmap;
						} else {
							var dgwidget = new MapDemog(
								{
									view: currentmap,
								},
								"demogwidget_" + currentmap.id
							);
							dgwidget.startup();
						}
						break;
					case "threshold":
						this._hideOtherWidgets("thresholdDiv");
						if (
							currentmap &&
							dijit.byId("threshold_" + currentmap.id) &&
							dijit.byId("threshold_" + currentmap.id).view
						) {
							dijit.byId("threshold_" + currentmap.id).view = currentmap;
						} else {
							var tWidget2 = new ThresholdWidget(
								{
									view: currentmap,
								},
								"threshold_" + currentmap.id
							);
							tWidget2.startup();
						}
						break;
					case "more":
						this._hideOtherWidgets("morediv");

						if (
							currentmap &&
							dijit.byId("morewidget_" + currentmap.id) &&
							dijit.byId("morewidget_" + currentmap.id).view
						) {
							dijit.byId("morewidget_" + currentmap.id).view = currentmap;
						} else {
							var owidget = new MapMore(
								{
									view: currentmap									
								},
								"morewidget_" + currentmap.id								
							);
							owidget.startup();
					
						}
						break;




						/*if (dijit.byId("morewidget")) {
							dijit.byId("morewidget").mapview = currentmap;
						} else {
							var owidget = new MapMore(
								{
									view: currentmap,
									id: "morewidget",
								},
								"morewg"
							);
							//owidget.startup();
						}
						break;*/
					case "other":
						this._hideOtherWidgets("otherdiv");
						if (dijit.byId("otherwidget")) {
							dijit.byId("otherwidget").mapview = currentmap;
						} else {
							var owidget = new MapOther(
								{
									view: currentmap,
									id: "otherwidget",
								},
								"otherwg"
							);
							//owidget.startup();
						}
						break;
				}

				mapsJson[mid].theme = v;
			},
			_hideOtherWidgets(activeWidget) {
				//all the ids
				var allWidgetIds = [
					"otherdiv",
					"ejdiv",
					"demogdiv",
					"thresholdDiv",
					"morediv",
				];
				allWidgetIds.forEach((e) => {
					if (e != activeWidget) {
						dojo.byId(e).style.display = "none";
					} else if (e == activeWidget) {
						dojo.byId(activeWidget).style.display = "block";
					}
				});
			},
			_updateMap: function (e) {
				var frm = dojo.byId("ejform");
				var pid = frm.panid.value;
				var ejvarval = this.ejformNode.ejvar.value
				//var fldname = this.ejformNode.ejvar.value;
				
				var fldname = ejvarval.split("|")[0];
				var catname = ejvarval.split("|")[1];
				var groupname = ejvarval.split("|")[2];

				var pcttype = "";
				for (var k = 0; k < frm.pcttype.length; k++) {
					if (frm.pcttype[k].checked) pcttype = frm.pcttype[k].value;
				}
				for (i = 0; i < this.mapArray.length; i++) {
					if (this.mapArray[i].id == pid) {
						//this.mapejindex(fldname, pcttype, this.mapArray[i]);
						this.mapejindex(fldname, catname, groupname, pcttype, this.mapArray[i]);
					}
				}
				dojo.byId("theme").style.display = "none";
				if (dijit.byId("transDialog")) {
					var tooltipDialog = dijit.byId("transDialog");
					if (tooltipDialog.opened_ && tooltipDialog.sliderid == pid) {
						dijit.popup.close(tooltipDialog);
						tooltipDialog.opened_ = false;
					}
				}
			},
			doIdentify: function (evt, aview) {
				var wobj = this;
				aview.map.layers.map(function (lyr) {
					var lid = lyr.id;
					if (
						lid == "ejindex_map" ||
						lid == "demog_map" ||
						lid == "threshold_map"
					) {
						var qurl = lyr.url + "/" + lyr.renderIndex;

						var idx = lyr.renderIndex;
						var renderfield = lyr.renderField;

						var outfields = [];
						var ltype = lyr.layerType;

						for (var afld in dynamicJSON[ltype].headerfields) {
							outfields.push(afld);
						}
						var queryTask = new QueryTask(qurl);
						var levelstr = "";
						if (lid == "ejindex_map") {
							var idfldfield = ejIdentifyJSON[renderfield].idfldname;
							var idflds = idfldfield.split(",");
							for (var m = 0; m < idflds.length; m++) {
								var textfield = idflds[m];
								outfields.push(textfield);
							}
							var pctlevel = lyr.pctlevel;
							if (pctlevel == "state") levelstr = " (State)";
							else levelstr = " (National)";
						} else {
							outfields.push(renderfield);
						}

						var query = new Query();

						query.returnGeometry = true;
						query.geometry = evt.mapPoint;
						query.outFields = outfields;
						//query.where = "1=1 AND " + dirty + "=" + dirty;
						queryTask
							.execute(query)
							.then(function (results) {
								var feats = [];
								var fetcount = results.features.length;

								var pctpattern = /^pct_/i;
								for (var m = 0; m < fetcount; m++) {
									feat = results.features[m];

									var topstr = "";
									var templatestr = "<table border='0'>";
									for (var k = 0; k < results.fields.length; k++) {
										var fldobj = results.fields[k];
										var prop = fldobj.name;
										var falias = fldobj.alias;

										var fldvalue = feat.attributes[prop];
										if (
											(pctpattern.test(prop) || prop == "POP_DEN") &&
											typeof fldvalue == "number"
										) {
											fldvalue = fldvalue.toFixed(2);
										}
										//new requirement to hide the block group id
										//if needed, remove this if clause
										if (falias != "Block Group ID" && falias != "ID") {
										templatestr +=
											"<tr><td style='font-weight: bold;' valign='top'>" +
											falias +
											":</td><td valign='top'>" +
											fldvalue +
											"</td></tr>";
										}
										topstr = falias;
									}
									topstr = topstr + levelstr;
									templatestr += "</table>";
									template = new PopupTemplate();				

									if (lid == "threshold_map") {
										template.title =
											"<span style='font-weight: bold;font-size: 15px;'>Index Values:</span>";
									} else {
										template.title = topstr;
									}





									template.content = templatestr;
									feat.popupTemplate = template;
									feats.push(feat);
								}
								aview.popup.open({ features: feats, location: evt.mapPoint });
							})
							.catch(function (error) {
								console.log("error occurred when querying layer: " + error);
							});
					} else if (lid == "other_map" || lid == "more_map") {
						if (lyr instanceof MapImageLayer || lyr instanceof TileLayer) {
							var cscale = aview.scale;
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
							identifyTask = new IdentifyTask(lyr.url);
							//idTaskAry.push(identifyTask);

							identifyParams = new IdentifyParameters();
							identifyParams.tolerance = 8;
							//identifyParams.maxAllowableOffset = 100;
							identifyParams.returnGeometry = true;
							identifyParams.layerIds = vscalelayers;
							//identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE; //old 3.x syntax
							identifyParams.layerOption = "all";
							identifyParams.width = aview.width;
							identifyParams.height = aview.height;
							identifyParams.geometry = evt.mapPoint;
							identifyParams.mapExtent = aview.extent;
							//idParamAry.push(identifyParams);
							identifyTask
								.execute(identifyParams)
								.then(function (response) {
									var results = response.results;
									if (results.length > 0) {
										var templatestr = "";
										var feats = [];
										for (var j = 0; j < results.length; j++) {
											var feat = results[j].feature;

											var lyrName = results[j].layerName;
											//RW 7/7/24 hardcode RSEI fix
											if (lyrName === "RSEI Scores"){
												lyrName = "RSEI Score";
											}
											
											if (lyrName.includes('_')) {
												lyrName = lyrName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
											} 
											templatestr = "<b>" + lyrName + "</b></br>";

											for (var prop in feat.attributes) {
												//alert(prop + ": " + prop.toLowerCase().indexOf("objectid"));
												var fldvalue = feat.attributes[prop];
												if (fldvalue.toLowerCase().indexOf("http") > -1) {
													templatestr +=
														prop +
														": <a href='" +
														fldvalue +
														"' target=_blank>More info</a></br>";
												} else if (
													prop.toLowerCase().indexOf("shape") != 0 &&
													prop.toLowerCase().indexOf("objectid") != 0
												) {
													templatestr += prop + ": " + fldvalue + "</br>";
												}
											}
											template = new PopupTemplate();
											template.title = lyrName;
											template.content = templatestr;
											feat.popupTemplate = template;

											feats.push(feat);
										}

										aview.popup.open({
											features: feats,
											location: evt.mapPoint,
										});
									}
								})
								.catch(function (error) {
									console.log("error occurred when querying layer: " + error);
								});
						}
					}
				});
			},
			destroy: function () {
				this.inherited(arguments);
			},
		}
	);

	return CompareMaps;
});
