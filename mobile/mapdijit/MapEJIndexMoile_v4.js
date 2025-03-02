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
	"dojo/text!mapdijit/templates/MapEJIndexMoile.html",
	"esri/layers/FeatureLayer",
	"esri/widgets/Legend",
	"esri/tasks/QueryTask",
	"esri/tasks/support/Query",
	"esri/renderers/support/jsonUtils",
	"dijit/form/HorizontalSlider",
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
	dijittemplate,
	FeatureLayer,
	esriLegend,
	QueryTask,
	esriquery,
	jsonUtils,

	HorizontalSlider
) {
	var glossaryurl = "";
	var layerJson = {};

	var ejlayoutJSON = {
		Primary: {
			status: false,
			description: "Primary EJ Indexes",
			defaultfield: "B_PM25_D2",
			items: {
				P_ENV: {
					description: "Environmental Burden Indicators",
					mouseover: "Environmental Burden Indicators",
					selected: false,
					metalink: glossaryurl + "#category-enviro",
					columns: {},
				},
                P_DEM: {
					description: "Socioeconomic Indicators",
					mouseover: "Socioeconomic Indicators",
					selected: false,
					metalink: glossaryurl + "#category-demographics",
					columns: {},
				},


				P_EJ2: {
					description: "Environmental Justice Indexes",
					mouseover:
						"Combination of a single environmental indicator with the Demographic Index",
					selected: true,
					metalink: glossaryurl + "#category-primary",
					columns: {},
				},
				P_EJ5: {
					description: "Supplemental Indexes",
					mouseover:
						"Combination of a supplemental indicator with the Demographic Index",
					selected: false,
					metalink: glossaryurl + "#category-primary",
					columns: {},
				},
				header : {
					description: "Contextual Information",
					mouseover:
						"Basic background information such as total population",
					selected: false,
					metalink: glossaryurl + "#category-primary", // update
					columns: {},
				}
				
				
			},
			accordionDiv: "primaryaccord",
		},
		Supplementary: {
			status: false,
			description: "Supplemental Indexes",
			defaultfield: "B_PM25_D2",
			items: {
				//P_EJ2SUPP: {
				P_EJ5: {
					description: "Supplemental Indexes",
					tocLabel: "Supplemental Indexes",
					mouseover:
						"Combination of 5 environmental indicators with the Demographic Index",
					selected: false,
					metalink: glossaryurl + "#category-ej-indexes",
					columns: {},
				},
			},
			accordionDiv: "primaryaccord",
		},
		Alternatives: {
			status: false,
			description: "Supplementary EJ Indexes",
			defaultfield: "B_PM25_D6",
			items: {
				A_PEJ6: {
					description: "EJ Index with supplementary demographic index",
					metalink: glossaryurl + "#category-alt",
					columns: {},
				},
				A1_2: {
					description: "Supplementary EJ Index 1 with demographic index",
					metalink: glossaryurl + "#category-alt1",
					columns: {},
				},
				A1_6: {
					description:
						"Supplementary EJ Index 1 with supplementary demographic index",
					metalink: glossaryurl + "#category-alt2",
					columns: {},
				},
				A2_2: {
					description: "Supplementary EJ Index 2 with demographic index",
					metalink: glossaryurl + "#category-alt3",
					columns: {},
				},
				A2_6: {
					description:
						"Supplementary EJ Index 2 with supplementary demographic index",
					metalink: glossaryurl + "#category-alt4",
					columns: {},
				},
			},
			accordionDiv: "altaccord",
		},
	};	

	var clsrenderer = {
		type: "class-breaks",
		defaultSymbol: globalDefaultSymbol4Pctiles,
        defaultLabel: globalDefaultSymbol4PctilesLabel,
		classBreakInfos: globalClassBreaks4Pctiles
	};

	var MapEJIndexMoile_v4 = dojo.declare([dijit._Widget, dijit._Templated], {
		templateString: dijittemplate,
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

			// mixin constructor options
			dojo.safeMixin(this, options);
		},

		startup: function () {},
		postCreate: function () {
			var wobj = this;
			//wobj.catJson = {};
			var lookuptableurl = "https://services.arcgis.com/EXyRv0dqed53BmG2/ArcGIS/rest/services/EJScreen_Lookup_USBG/FeatureServer/4";
			console.log(lookuptableurl);
			//var lookuptableurls = [lookuptableurl, lookuptable_supp_url];
			var lookuptableurls = [lookuptableurl];	
			lookuptableurls.forEach((lupurl) => {
				var queryTask = new QueryTask(lupurl);
				var query = new esriquery();

				query.returnGeometry = false;

				query.outFields = ["*"];
				var dirty = new Date().getTime();
				query.where = dirty + "=" + dirty;
				var operation = queryTask.execute(query);
				operation.then(
					function (featset) {
						console.log("featset", featset)
						if (featset.features.length > 0) {
							ejlayoutJSON["Primary"].status = true;
							var fetcount = featset.features.length;
							//var catJson = {};
							var pa = "Primary";
							for (var m = 0; m < fetcount; m++) {
								var cat = dojo.trim(
								    featset.features[m].attributes["IndexCode"] === null ? "":featset.features[m].attributes["IndexCode"]
								);
								if (cat != "header"){
									var colname = dojo.trim(
										featset.features[m].attributes["BIN_NAME"] === null ? "":featset.features[m].attributes["BIN_NAME"]
									);
									var desc = dojo.trim(
										featset.features[m].attributes["SHORT_DESC"] === null ? "":featset.features[m].attributes["SHORT_DESC"]
									);
									if (desc.indexOf("Air Toxics") != -1){
										continue; // This version of EJScreen doesn't use the Air Toxics data, so skip
									}
									var legendtitle = dojo.trim(
										featset.features[m].attributes["TOC_NAME"] === null ? "":featset.features[m].attributes["TOC_NAME"]
									);
									var txtname = dojo.trim(
										featset.features[m].attributes["TXT_NAME"] === null ? "":featset.features[m].attributes["TXT_NAME"]
									);
									var idfldname = dojo.trim(
										featset.features[m].attributes["ID_NAME"] === null ? "":featset.features[m].attributes["ID_NAME"]
									);
									var hovertext = dojo.trim(
										featset.features[m].attributes["MOUSEOVER"] === null ? "":featset.features[m].attributes["MOUSEOVER"]
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
	
									if(colname === 'B_DEMOGIDX_2'|| colname === 'B_DEMOGIDX_5'){
										layerJson[colname].description = layerJson[colname].description.replace(" USA", "");
									}
									
									if (cat == "P_EJ2SUPP") {
										//console.log("cat became P_EJ2SUPP");
										ejIdentifyJSON[colname].catdesc =
											ejlayoutJSON["Supplementary"].items[cat].description;
									} else {
										console.log(pa,cat)
										ejIdentifyJSON[colname].catdesc =
											ejlayoutJSON[pa].items[cat].description;
									}
									if (typeof catJson[cat] == "undefined") {
										catJson[cat] = {};
									}
									catJson[cat][colname] = layerJson[colname];
								}
								
							}

							var n = 0;
							for (var pej in ejlayoutJSON[pa].items) {
								if (catJson[pej]) {
									var cvalue = pa + "|" + pej;
									var optdesc = ejlayoutJSON[pa].items[pej].description;
									var tiptext = ejlayoutJSON[pa].items[pej].mouseover;
									var sel = ejlayoutJSON[pa].items[pej].selected;

									var option = new Option(optdesc, cvalue);
									if (sel) option.selected = true;
									wobj.ejTypeNode.options[n] = option;

									var catobj = catJson[pej];
									for (var acol in catobj) {
										if(!(pej === 'P_DEM' && (acol === 'B_LIFEEXPPCT'|| acol === 'B_DEMOGIDX_2ST' || acol === 'B_DEMOGIDX_5ST' ))){ //removing this as the main index page does not have it
										 ejlayoutJSON[pa].items[pej].columns[acol] = catobj[acol];
										}
									}
									n = n + 1;
								}
							}
							//wobj.ejTypeNode.options[0].selected = true;
							//var defaultkey = wobj.ejTypeNode.value;
							var defaultkey =wobj.ejTypeNode.options[0].value
							wobj.ejTypeNode.options[0].selected = true;
							wobj.createColList(defaultkey);
						}
					},
					function (error) {
						console.log("error occurred: " + error);
					}
				);
			});
		},
		changeCat: function (e) {
			var cvalue = e.target.value;
			this.createColList(cvalue);
		},
		createColList: function (key) {
			this.ejListNode.options.length = 0;

			var n = 0;
			var p = key.split("|")[0];
			var s = key.split("|")[1];
			var optarray = new Array();
			for (var c in ejlayoutJSON[p].items[s].columns) {
				var optdesc = layerJson[c].description;

				//var option = new Option(optdesc, c);
				var option = new Option('', c);
				if(optdesc.indexOf("Nitrogen Dioxide")>-1){
					var index = optdesc.indexOf("Nitrogen Dioxide");
					optdesc = optdesc.slice(0, index + 16) + " " + optdesc.slice(index + 16);
				}
				option.innerHTML = optdesc;
				//this.ejListNode.options[n] = option;s
				optarray[n] = option;

				n = n + 1;
			}
			optarray.sort(function (a, b) {
				return a.text > b.text ? 1 : a.text < b.text ? -1 : 0;
			}); // or use localeCompare() if you prefer

			for (i = 0; i < optarray.length; i++) {
				this.ejListNode.options[i] = optarray[i];
			}
		},

		_mapEJ: function (e) {
			var dmapid = "demog_map";
			if (this.map.findLayerById(dmapid)) {
				var lyr = this.map.findLayerById(dmapid);
				this.map.remove(lyr);
			}
			var catkey = this.ejTypeNode.value;

			var t = catkey.split("|")[0];
			var s = catkey.split("|")[1];
			//console.log(JSON.stringify(catJson[s]));
			this.indextype = t;
			var fieldname = this.ejListNode.value;

			var pcttype = "";
			for (var k = 0; k < this.ejformNode.pcttype.length; k++) {
				if (this.ejformNode.pcttype[k].checked)
					pcttype = this.ejformNode.pcttype[k].value;
			}
			//console.log("type: " + pcttype + " : " + this.ejformNode.pcttype.length);
			this._mapejindex(fieldname, pcttype, s);
		},
		_mapejindex: function (fieldname, ptype, category) {
			//this.map.infoWindow.hide();
			var renderurl, layerindex;
			var fielddesc = catJson[category][fieldname].description;
			var layeridstr = "ejindex_map";
			if (category && category !== "P_EJ2SUPP") {
				//fielddesc = "Environmental Justice Indexes";
				if (ptype == "state") {
					renderurl = ejscreenservice_state;
					layerindex = ejmapindex_state;
					fielddesc = fielddesc + " (State Percentiles)";
					//layeridstr = layeridstr + "_state";
				} else {
					renderurl = ejscreenservice;
					layerindex = ejmapindex;
					fielddesc = fielddesc + " (National Percentiles)";
					//layeridstr = layeridstr + "_nation";
				}
			} else if (category && category == "P_EJ2SUPP") {
				fielddesc = "Supplemental Indexes";
				//layeridstr = "suppindex_map";
				if (ptype == "state") {
					renderurl = ejscreenserviceSupp_state;
					layerindex = 1;
					fielddesc = fielddesc + " (State Percentiles)";
				} else {
					renderurl = ejscreenserviceSupp;
					layerindex = 0;
					fielddesc = fielddesc + " (National Percentiles)";
				}
			}

			clsrenderer.field = fieldname;

			var ejindexlayer;
			if (this.map.findLayerById(layeridstr)) {
				var lyr = this.map.findLayerById(layeridstr);
				this.map.remove(lyr);
			}

			var opcvalue = 1;
			ejindexlayer = new FeatureLayer({ // FEATURE LAYER
				url: renderurl,
				title: fielddesc,
				id: layeridstr,
				renderer: clsrenderer,
				opacity: opcvalue
				/* sublayers: [
					{
						id: 0,
						title: fielddesc,
						renderer: clsrenderer,
						visible: true,
 
						opacity: opcvalue,
						source: {
							mapLayerId: layerindex,
						},
					},
				], */
			});
			this.map.add(ejindexlayer);

			ejindexlayer.isDynamic = true;
			ejindexlayer.renderField = fieldname;
			ejindexlayer.layerType = "ejscreen";
			ejindexlayer.renderIndex = layerindex;
			ejindexlayer.pctlevel = ptype;
			//ejindexlayer.cat = layerJson[fieldname].cat;
			ejindexlayer.cat = catJson[category][fieldname].cat;

			if (document.getElementById("layerswitch").style.display == "none") {
				document.getElementById("layerswitch").style.display = "block";
			}
			document.getElementById("myonoffswitch").checked = true;
			dojo.removeClass(document.getElementById("panelEJ"), "in");
			dojo.removeClass(document.getElementById("collapseEJ"), "in");
		},

		ArrayContains: function (element, inArray) {
			for (var j = 0; j < inArray.length; j++) {
				if (element == inArray[j]) {
					return true;
				}
			}
			return false;
		},
		destroy: function () {
			dojo.disconnect(this._zoomHandler);
			dojo.empty(this.domNode);
			this.inherited(arguments);
		},
	});

	return MapEJIndexMoile_v4;
});
