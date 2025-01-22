define([
	"dojo",
	"dojo/_base/declare",
	"dojo/_base/connect",
	"./javascript/thresholdConfig",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/_Widget",
	"dijit/_Templated",
	"dijit/_WidgetBase",
	"dojo/dom-construct",
	"dojo/dom",
	"dijit/form/CheckBox",
	"dijit/form/RadioButton",
	"dijit/form/NumberSpinner",
	"dijit/form/TextBox",
	"dijit/form/Button",
	"dijit/form/HorizontalSlider",
	"dijit/form/HorizontalRule",
	"dijit/form/HorizontalRuleLabels",
	"dojox/form/HorizontalRangeSlider",
	"esri/layers/MapImageLayer",
	"esri/rest/query",
	"dijit/Dialog",
	"dijit/registry",
	"dojo/parser",
	"dojo/Deferred",
	"dojo/on",
	"dojo/DeferredList",
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/query",
	"dojo/domReady!",
], function (
	dojo,
	declare,
	connect,
	BaseWidget,
	_TemplatedMixin,
	_WidgetsInTemplateMixin,
	_Widget,
	_Templated,
	_WidgetBase,
	domConstruct,
	dom,
	CheckBox,
	RadioButton,
	NumberSpinner,
	TextBox,
	Button,
	HorizontalSlider,
	HorizontalRule,
	HorizontalRuleLabels,
	HorizontalRangeSlider,
	MapImageLayer,
	query,
	Dialog,
	registry,
	parser,
	Deferred,
	on,
	DeferredList,
	domStyle,
	domClass
) {
	var ThWidget = declare([dijit._Widget, dijit._Templated], {
		templateString: dojo.cache("mapdijit", "templates/ThresholdWidget.html"),
		widgetsInTemplate: true,
		name: "EJ Index Threshold Map Widget",
		userAction: "add",
		constructor: function (options, srcRefNode) {
			options = options || {};
			if (!options.view)
				throw new Error("no map defined in params for Rendering.");
			this.view = options.view;
			this.map = this.view.map;
			this.selectedCheckBoxes = [];
			this.widgetCSVUrl = dmapCSVdownloadurl;
			//this.id = dijit.registry.getUniqueId(this.declaredClass);
			//widgetId is needed for mulitple instances and js and html template communication
			if (this.view.id == undefined && options.id) {
				this.widgetId = options.id;
			} else if (this.view.id) {
				this.widgetId = this.view.id;
			} else {
				this.widgetId = dijit.registry.getUniqueId(this.declaredClass);
			}
			if (this.widgetId == undefined) {
				throw new Error("widgetId is required.");
			}

			dojo.safeMixin(this, options);
		},
		postCreate: function () {
			this.inherited(arguments);
			widgetObj = this;
			this.widgetObj = this;
			this.selectedIndex = "environmental";
			this.selectedEjSlider = 1;
			this.threshold = [];
			this.lowerBound = 80;
			this.upperBoundVal = 100;
			this.doOrQuery = false;
			this.mapLengedTitle = nationalLegendTitle;
			this.thresholdRestURL = nationRestURL; //default set to nation
			this.thresholdRestLayerId = nationRestLayerId; //default set to nation layer
			this.queryToCompareAt = "nation";
			this.thresholdTableName = nation_exceedances_tblname;
			this.widgetObj = this;

			this.createBoundInputBoxes();
			this.createEjIndexSlider();
			this.createEJCheckBoxes();
			this._createRaioButtons();
			this._createIndexRaioButtons();
			//Below function explain the state of the EJ index slider.
			this.setExplanation(widgetObj.widgetId, this.selectedEjSlider);
		},
		startup: function () {},
		createBoundInputBoxes: function () {
			var lowerBoundLabel = dom.byId("lowerBoundLabel" + widgetObj.widgetId);
			//var uId = widgetObj.crateUniqueIds("lowerBoundNumId2");
			var inputLabel = dojo.create(
				"label",
				{
					for: "lowerBoundNumId_" + widgetObj.widgetId,
					innerHTML: "Lower bound: ",
					style: "margin-bottom:8px;white-space:nowrap;font-weight:normal;",
					id: "lowerBoundInputLbl",
				},
				lowerBoundLabel,
				"first"
			);
			var lowerBountInputBox = document.createElement("span");
			var lowerBoundNew = new NumberSpinner(
				{
					value: 80,
					smallDelta: 1,
					constraints: { min: 1, max: 100, places: 0 },
					id: "lowerBoundNumId_" + widgetObj.widgetId,
					style: "width:80px;",
					class: "thresholdBound",
					onChange: function (value) {
						widgetObj.lowerBound = value;
					},
				},
				lowerBountInputBox
			);
			lowerBoundNew.placeAt(inputLabel, "last");
			//uId = widgetObj.crateUniqueIds("upperBoundNumId");
			var upperBoundLabel = dom.byId("upperBoundLabel" + widgetObj.widgetId);
			var inputLabelUpper = dojo.create(
				"label",
				{
					for: "upperBoundNumId_" + widgetObj.widgetId,
					innerHTML: "Upper bound: ",
					style: "margin-bottom:8px;font-weight:normal;white-space:nowrap;",
					id: "lowerBoundInputLbl",
				},
				upperBoundLabel,
				"first"
			);
			var upperBountInputBox = document.createElement("span");
			var upperBoundNew = new NumberSpinner(
				{
					value: 100,
					smallDelta: 1,
					constraints: { min: 1, max: 100, places: 0 },
					id: "upperBoundNumId_" + widgetObj.widgetId,
					style: "width:80px",
					class: "thresholdBound",
					onChange: function (value) {
						widgetObj.upperBoundVal = value;
					},
				},
				upperBountInputBox
			);
			upperBoundNew.placeAt(inputLabelUpper, "last");
		},
		 sortArr(ejIndexesLabels) {
			ejIndexesLabels.sort(function(a, b) {
			  return a - b;
		  });
	   },
		createEjIndexSlider: function () {
			var ejObj = dom.byId("ejIndexSliderSide" + widgetObj.widgetId);
			//create ticks
			var rulesNode1 = document.createElement("div");
			ejObj.appendChild(rulesNode1);
			var sliderRules1 = new HorizontalRule(
				{
					container: "topDecoration",
					count: 13,
					ruleStyle: "height:5px;",
					class: "ejiSliderTicLabel",
				},
				rulesNode1
			);
			//add lables
			var labelsNode1 = document.createElement("div");
			ejObj.appendChild(labelsNode1);
			var ejIndexesLabels = [];
			ejaIndexes.forEach(function (e) {
				ejIndexesLabels.push(e.order);
			});
			this.sortArr(ejIndexesLabels);
			var sliderLabels = new HorizontalRuleLabels(
				{
					container: "rightDecoration",
					labelStyle: "font-style: italic; font-size: 0.75em;margin-top:5px;",
					count: 13,
					labels: ejIndexesLabels,
					class: "ejiSliderTicLabel",
				},
				labelsNode1
			);
			var ejIndexSlider = new HorizontalSlider(
				{
					name: "slider",
					value: 1,
					minimum: 1,
					maximum: 13,
					discreteValues: 13,
					intermediateChanges: false,
					showButtons: true,
					style: "min-width:300px;",
					id: "numOfEJIndexSId_" + widgetObj.widgetId,
					onChange: function (value) {
						var newVal = Math.floor(value);
						widgetObj.selectedEjSlider = newVal;
						var idEndsWith = this.id.split("_");
						if (newVal == 1) {
							widgetObj.handleEJCheckBoxesState(idEndsWith[1], false, false);
							widgetObj.setExplanation(idEndsWith[1], newVal);
						} else if (newVal > 1) {
							widgetObj.handleEJCheckBoxesState(idEndsWith[1], false, true);
							widgetObj.setExplanation(idEndsWith[1], newVal);
						}
						widgetObj.doOrQuery = true;
					},
				},
				"ejIndexSliderSide" + widgetObj.widgetId
			);
		},
		setExplanation(targetid, changedSliderVal) {
			var expText;
			if (changedSliderVal == 1) {
				expText = whenOne.replace("${selectedEjSlider}", changedSliderVal);
			} else if (changedSliderVal >= 2 && changedSliderVal < 13) {
				expText = whenGtOne.replace("${selectedEjSlider}", changedSliderVal);
			} else if (changedSliderVal == 13) {
				expText = whenAll.replace("${selectedEjSlider}", changedSliderVal);
			}
			dom.byId("ejIndexSliderExplaination" + targetid).innerHTML = expText;
		},
		handleEJCheckBoxesState(targetid, valueToSet, statusToSet) {
			for (var i = 1; i <= 13; i++) {
				
				registry.byId("chk" + i + "_" + targetid).set("checked", valueToSet);
				registry.byId("chk" + i + "_" + targetid).set("disabled", statusToSet);
				if (statusToSet) {
					dojo.style("chkLabel" + i + "_" + targetid, { color: "#ccc" });
				} else if (!statusToSet) {
					dojo.style("chkLabel" + i + "_" + targetid, { color: "#333" });
				}
			}
			if (statusToSet) {
				dojo.style("selectAllChkLabel_" + targetid, { color: "#ccc" });
				registry
					.byId("chkSelectAll_" + targetid)
					.set("disabled", true)
					.set("checked", false);
			} else if (!statusToSet) {
				dojo.style("selectAllChkLabel_" + targetid, { color: "#333" });
				registry.byId("chkSelectAll_" + targetid).set("disabled", false);
			}
		},
		createEJCheckBoxes: function () {
			var selectAllCheckBox = dom.byId("selectAllChk" + widgetObj.widgetId);
			var cBoxId = "chkSelectAll_" + widgetObj.widgetId;
			var chkLabel = dojo.create(
				"label",
				{
					for: cBoxId,
					innerHTML: "Select All",
					style: "margin-bottom:8px;white-space:nowrap;font-weight:normal;",
					id: "selectAllChkLabel_" + widgetObj.widgetId,
				},
				selectAllCheckBox,
				"last"
			);
			var topCheckbox = document.createElement("span");
			var checkBoxTop = new CheckBox(
				{
					name: "Select All",
					id: cBoxId,
					value: "selectAll",
					checked: false,
					style: "white-space:nowrap;font-weight:normal;",
					onChange: function (b) {
						var idEndsWith = this.id.split("_")[1];
						if (b) {
							for (var i = 1; i <= 13; i++) {
								registry
									.byId("chk" + i + "_" + idEndsWith)
									.set("checked", true);
							}
							dojo.style("ejIndexSliderExplaination" + idEndsWith, {
								color: "#ccc",
							});
						} else if (!b) {
							for (var i = 1; i <= 13; i++) {
								registry
									.byId("chk" + i + "_" + idEndsWith)
									.set("checked", false);
							}
						}
					},
				},
				topCheckbox
			);
			checkBoxTop.placeAt(chkLabel, "first");

			//Now create EJ Indexes checkboxes
			var checkBoxContainerLeft = dom.byId("leftChk" + widgetObj.widgetId);
			var checkBoxContainerRight = dom.byId("rightChk" + widgetObj.widgetId);
			var checkBoxContainer = checkBoxContainerLeft;
			var count = 0;
			var checkBoxArray = [];
			var style2 = "margin-left:100px;white-space:nowrap;";
			//must start with odd num
			ejaIndexes.forEach(function (e) {
				checkBoxArray[e.order] = document.createElement("div");
				//divide checkboxes in two columns
				if (e.order % 2 == 0 || e.order === 13) {
					checkBoxContainer = checkBoxContainerRight;
				} else {
					checkBoxContainer = checkBoxContainerLeft;
				}
				checkBoxContainer.appendChild(checkBoxArray[e.order]);
				var checkBoxId;
				if (e.order > 0) {
					checkBoxId = "chk" + e.order + "_" + widgetObj.widgetId;
					var chkLabel = dojo.create(
						"label",
						{
							for: checkBoxId,
							innerHTML: e.description,
							style: "margin-bottom:8px;white-space:nowrap;font-weight:normal;",
							class: "thresholdLabel",
							id: "chkLabel" + e.order + "_" + widgetObj.widgetId,
						},
						checkBoxContainer,
						"last"
					);

					var checkBox = new CheckBox(
						{
							name: e.description,
							id: checkBoxId,
							value: e.name,
							checked: false,
							style: "white-space:nowrap;",
							onChange: function (b) {
								if (b) {
									var idEndsWith = this.id.split("_")[1];
									registry
										.byId("numOfEJIndexSId_" + idEndsWith)
										.set("disabled", true);
									dojo.style("ejIndexSliderExplaination" + idEndsWith, {
										color: "#ccc",
									});
									dojo
										.query(".ejiSliderTicLabel")
										.query(".dijitRuleLabel")
										.style("color", "#ccc");
									//widgetObj.selectedCheckBoxes.push(this.get("value"));
								} else if (!b) {
									//widgetObj.selectedCheckBoxes.shift(this.get("value"));
								}
							},
						},
						checkBoxArray[e.order]
					);
					checkBox.placeAt(chkLabel, "first");
				}
			});
		},
		_createIndexRaioButtons() {
			var radioContainerTab = dom.byId("ejIndexes" + widgetObj.widgetId);
			var radioSpan2 = document.createElement("span");
			var radioLabel2 = dojo.create(
				"label",
				{
					for: "ejIndexesId_" + widgetObj.widgetId,
					innerHTML: "EJ Indexes",
					class: "thresholdLabel",
				},
				radioContainerTab,
				"last"
			);
			var radioOne2 = new RadioButton(
				{
					checked: true,
					value: "environmental",
					name: "EJInd",
					id: "ejIndexesId_" + widgetObj.widgetId,
					onChange: function (b) {
						if (b) {
							this.id.value = "environmental";
							widgetObj.selectedIndex = "environmental";
						}
					},
				},
				radioSpan2
			);
			radioOne2.placeAt(radioLabel2, "first");
			//state radio button
			var radioContainer3 = dom.byId("ejSuppIndexes" + widgetObj.widgetId);
			var radioSpan3 = document.createElement("span");
			var radioLabel3 = dojo.create(
				"label",
				{
					for: "ejSuppIndexesId_" + widgetObj.widgetId,
					innerHTML: "Supplemental Indexes",
					class: "thresholdLabel",
					style: "float:right;margin-right:5px;",
				},
				radioContainer3,
				"last"
			);
			var radioOne3 = new RadioButton(
				{
					checked: false,
					value: "supplemental",
					name: "EJInd",
					id: "ejSuppIndexesId_" + widgetObj.widgetId,
					onChange: function (b) {
						if (b) {
							this.id.value = "supplemental";
							widgetObj.selectedIndex = "supplemental";
						}
					},
				},
				3
			);
			radioOne3.placeAt(radioLabel3, "first");
		},
		_createRaioButtons() {
			var radioContainer = dom.byId("usRadio" + widgetObj.widgetId);
			var radioSpan = document.createElement("span");
			var radioLabel = dojo.create(
				"label",
				{
					for: "nationId_" + widgetObj.widgetId,
					innerHTML: "Compare to US",
					class: "thresholdLabel",
				},
				radioContainer,
				"last"
			);
			var radioOne = new RadioButton(
				{
					checked: true,
					value: "nation",
					name: "mapCompare",
					id: "nationId_" + widgetObj.widgetId,
					onChange: function (b) {
						if (b) {
							if (b) {
								widgetObj.cleanThresholdLayer(this.id);
								registry.byId(this.id).set("checked", true);
								widgetObj.queryToCompareAt = "nation";
							}
						}
					},
				},
				radioSpan
			);
			radioOne.placeAt(radioLabel, "first");
			//state radio button
			var radioContainer = dom.byId("usStateRadio" + widgetObj.widgetId);
			var radioSpan = document.createElement("span");
			var radioLabel = dojo.create(
				"label",
				{
					for: "stateId_" + widgetObj.widgetId,
					innerHTML: "Compare to State",
					class: "thresholdLabel",
					style: "float:right;margin-right:5px;",
				},
				radioContainer,
				"last"
			);
			var radioOne = new RadioButton(
				{
					checked: false,
					value: "state",
					name: "mapCompare",
					id: "stateId_" + widgetObj.widgetId,
					onChange: function (b) {
						if (b) {
							//widgetObj.map.removeAll();
							widgetObj.cleanThresholdLayer(this.id);
							registry.byId(this.id).set("checked", true);
							widgetObj.queryToCompareAt = "state";
						}
					},
				},
				radioSpan
			);
			radioOne.placeAt(radioLabel, "first");
		},
		_clearAll: function (evt) {
			if (evt.target.id) {
				this._resetInstance(evt.target.id.split("_")[1]);
			}

			// if (target.indexOf("map1") >= 1) {
			// 	this._resetInstance("map1");
			// } else if (target.indexOf("map2") >= 1) {
			// 	this._resetInstance("map2");
			// } else {
			// 	//EJ checkboxes
			// 	for (var i = 1; i <= 12; i++) {
			// 		registry.byId("chk" + widgetObj.widgetId + i).set("checked", false);
			// 	}
			// 	//EJ threshold slider
			// 	registry.byId("numOfEJIndexSId" + widgetObj.widgetId).set("value", 1);
			// 	registry
			// 		.byId("numOfEJIndexSId" + widgetObj.widgetId)
			// 		.set("disabled", false);
			// 	dojo
			// 		.query(".ejiSliderTicLabel")
			// 		.query(".dijitRuleLabel")
			// 		.style("color", "#333");

			// 	//select all checkbox
			// 	registry
			// 		.byId("chkSelectAll" + widgetObj.widgetId)
			// 		.set("checked", false);

			// 	//reset radio buttons
			// 	registry.byId("nationId" + widgetObj.widgetId).set("checked", true);
			// 	registry.byId("stateId" + widgetObj.widgetId).set("checked", false);

			// 	//reset lower bound and upper bound input boxes
			// 	registry.byId("lowerBoundNumId" + widgetObj.widgetId).set("value", 80);
			// 	registry.byId("upperBoundNumId" + widgetObj.widgetId).set("value", 100);

			// 	//reset EJ index radio buttons to default values
			// 	registry.byId("ejIndexesId" + widgetObj.widgetId).set("checked", true);
			// 	registry
			// 		.byId("ejSuppIndexesId" + widgetObj.widgetId)
			// 		.set("checked", false);
			// 	dojo.style("ejIndexSliderExplaination" + widgetObj.widgetId, {
			// 		color: "#333",
			// 	});
			// 	widgetObj._resetWidgetVars();
			//}
		},
		_resetInstance(targetId) {
			//EJ threshold slider
			registry.byId("numOfEJIndexSId_" + targetId).set("value", 1);
			registry.byId("numOfEJIndexSId_" + targetId).set("disabled", false);
			dojo
				.query(".ejiSliderTicLabel")
				.query(".dijitRuleLabel")
				.style("color", "#333");

			//select all checkbox
			registry.byId("chkSelectAll_" + targetId).set("checked", false);
			dojo.style("selectAllChkLabel_" + targetId, { color: "#333" });
			for (var i = 1; i <= 13; i++) {
				//alert(registry.byId("chk" + targetId + i));
				registry.byId("chk" + i + "_" + targetId).set("checked", false);
			}

			//reset radio buttons
			registry.byId("nationId_" + targetId).set("checked", true);
			registry.byId("stateId_" + targetId).set("checked", false);

			//reset lower bound and upper bound input boxes
			registry.byId("lowerBoundNumId_" + targetId).set("value", 80);
			registry.byId("upperBoundNumId_" + targetId).set("value", 100);

			//reset EJ index radio buttons to default values
			registry.byId("ejIndexesId_" + targetId).set("checked", true);
			registry.byId("ejSuppIndexesId_" + targetId).set("checked", false);
			dojo.style("ejIndexSliderExplaination" + targetId, {
				color: "#333",
			});
			document.getElementById("loadData" + targetId).style.display = "none";
			document.getElementById("loadDataError" + targetId).style.display = "none";
			document.getElementById("divCntRecords" + targetId).style.display =
				"none";
			//document.getElementById("myDoc"+targetId).style.display = 'none';
			widgetObj._resetWidgetVars(targetId);
		},
		_resetWidgetVars(targetId) {
			widgetObj.cleanThresholdLayer(targetId);
			widgetObj.selectedIndex = "environmental";
			widgetObj.selectedCheckBoxes = [];
			widgetObj.selectedEjSlider = 1;
			widgetObj.threshold = [];
			widgetObj.thresholdRestURL = nationRestURL;
			widgetObj.thresholdRestLayerId = nationRestLayerId;
			widgetObj.mapLengedTitle = nationalLegendTitle;
			widgetObj.lowerBound = 80;
			widgetObj.upperBoundVal = 100;
			widgetObj.doOrQuery = false;
			//widgetObj.map.removeAll();
		},
		_validateInput: function (evt) {
			var validInput = true;
			//recheck values
			widgetObj.selectedCheckBoxes = [];
			var idEndsWith = evt.target.id.split("_")[1];
			widgetObj.selectedEjSlider = registry.byId(
				"numOfEJIndexSId_" + idEndsWith
			).value;
			for (var i = 1; i <= 13; i++) {
				if (registry.byId("chk" + i + "_" + idEndsWith).checked) {
					widgetObj.selectedCheckBoxes.push(
						registry.byId("chk" + i + "_" + idEndsWith).value
					);
				}
			}
			//the page design has changed due to comparmaps
			this._setIndexVal("ejIndexesId_" + idEndsWith);
			this._setIndexVal("ejSuppIndexesId_" + idEndsWith);
			//alert("now the index is:" + widgetObj.selectedIndex);

			this._setLocationVal("nationId_" + idEndsWith);
			this._setLocationVal("stateId_" + idEndsWith);
			//alert("now the location is:" + widgetObj.queryToCompareAt);

			this._setBoundVals(
				"lowerBoundNumId_" + idEndsWith,
				"upperBoundNumId_" + idEndsWith
			);
			//alert(widgetObj.lowerBound);
			//alert(widgetObj.upperBoundVal);

			if (
				widgetObj.lowerBound < 1 ||
				widgetObj.upperBoundVal > 100 ||
				isNaN(widgetObj.lowerBound) ||
				isNaN(widgetObj.upperBoundVal)
			) {
				this._prepareInvalidInputMsg(thresholdNotSelected);
				validInput = false;
			} else if (widgetObj.lowerBound > widgetObj.upperBoundVal) {
				this._prepareInvalidInputMsg(invalidThresholdVal);
				validInput = false;
			}else if (registry.byId("numOfEJIndexSId_"+idEndsWith).get('disabled') && !this._checkBoxesSelected(idEndsWith)){
				this._prepareInvalidInputMsg(checkBoxesNotSelected);
				validInput = false;
			}
			if (!validInput) {
				return false;
			} else {
				//alert("Good to go further" + widgetObj.widgetId);
				this._addMapLayers(evt.target.id);
			}
		},
		_setIndexVal(targeId) {
			if (registry.byId(targeId).checked) {
				widgetObj.selectedIndex = registry.byId(targeId).value;
			}
		},
		_setLocationVal(targeId) {
			if (registry.byId(targeId).checked) {
				widgetObj.queryToCompareAt = registry.byId(targeId).value;
			}
		},
		_setBoundVals(lowerId, upperId) {
			widgetObj.lowerBound = registry.byId(lowerId).value;
			widgetObj.upperBoundVal = registry.byId(upperId).value;
		},
		_checkBoxesSelected(targetid){
			var checked= false;
            for (var i = 1; i <= 13; i++) {
				if(registry.byId("chk" + i + "_" + targetid).get("checked")){
				 checked= true;
                   break;
				}
			}
			return checked;
		},
		_prepareInvalidInputMsg(msgStr) {
			var invalidInputDialog = new Dialog({
				title: "Invalid Input",
				style: "width: auto;",
			});
			invalidInputDialog.set("content", msgStr);
			invalidInputDialog.show();
		},
		_prepareEjAnyWhereClause(isEqualQuery) {
			var operatorStr = " >= ";
			var operatorStrPlus = " + ";
			var qStr = " ( ";
			var columnSuffix = "P0";
			//P is from the db column names, column names are P00 to P100
			for (var i = widgetObj.lowerBound; i <= widgetObj.upperBoundVal; i++) {
				if (i >= 10) {
					columnSuffix = "P";
				}
				qStr = qStr + columnSuffix + i;

				if (i < widgetObj.upperBoundVal) {
					qStr = qStr + operatorStrPlus;
				}
			}
			qStr = qStr + " ) " + operatorStr + widgetObj.selectedEjSlider;
			return qStr;
		},
		_prepareEjSpecificQuery(isEqualQuery) {
			var operatorStr = " >= ";
			var operatorLE = " <= ";
			var str = "";
			if (isEqualQuery) {
				operatorStr = " = ";
				widgetObj.selectedCheckBoxes.forEach((e) => {
					str = str + " and " + e + operatorStr + widgetObj.lowerBound;
				});
				var whereClauseStr = str.replace(
					str.substr(str.indexOf("and"), str.indexOf("and") + 3),
					""
				);
				return whereClauseStr;
			} else if (!isEqualQuery) {
				var str = "";
				widgetObj.selectedCheckBoxes.forEach((e) => {
					str =
						str +
						" and ( " +
						e +
						operatorStr +
						widgetObj.lowerBound +
						" and " +
						e +
						operatorLE +
						widgetObj.upperBoundVal +
						" ) ";
				});
				var whereClauseStr = str.replace(
					str.substr(str.indexOf("and"), str.indexOf("and") + 3),
					""
				);
				return whereClauseStr;
			}
		},
		_prepareWhereClause() {
			var whereStr = ""; // = "1 = 1";
			var isEqual = false;
			if (widgetObj.lowerBound == widgetObj.upperBoundVal) {
				isEqual = true;
			}
			if (
				widgetObj.selectedEjSlider >= 1 &&
				widgetObj.selectedCheckBoxes.length == 0
			) {
				whereStr =
					whereStr +
					//" and (" +
					widgetObj._prepareEjAnyWhereClause(isEqual);
				//" )";
			} else if (
				widgetObj.selectedEjSlider == 1 &&
				widgetObj.selectedCheckBoxes.length > 0
			) {
				whereStr = whereStr + widgetObj._prepareEjSpecificQuery(isEqual);
			}
			return whereStr;
		},
		_checkResultCount(whereClause, callback) {
			//At this point if whereClause is "1=1"  that means something is worng
			//whereClause == "1 = 1" is kept to reduce code lines the query
			// cannot execute only on this where condition
			if (whereClause == "1 = 1") {
				throw new Error("techenical error, please contact help desk");
			}
			var queryUrl =
				widgetObj.thresholdRestURL + "/" + widgetObj.thresholdRestLayerId;
			query
				.executeForCount(queryUrl, {
					where: whereClause,
				})
				.then(
					function (count) {
						callback(count);
					},
					function (error) {
						console.log(error);
						widgetObj.hideLoadingSpinner();
					}
				);
		},
		_setSuppQueryUrlAndLayerId() {
			if (widgetObj.selectedIndex == "supplemental") {
				if (widgetObj.queryToCompareAt == "state") {
					widgetObj.mapLengedTitle = stateSuppLegendTitle;
					if (
						widgetObj.selectedEjSlider > 0 &&
						widgetObj.selectedCheckBoxes.length == 0
					) {
						widgetObj.thresholdRestLayerId = singleSliderStateLayer;
						widgetObj.thresholdRestURL = singleSliderSuppUrl;
						widgetObj.thresholdTableName =state_supplemental_exceedances_tblname;
					} else {
						widgetObj.thresholdRestLayerId = singleSliderStateLayer;
						widgetObj.thresholdRestURL = singleSliderSuppUrl;
						widgetObj.thresholdTableName =state_supplemental_exceedances_tblname;
					}
					// } else if (
					// 	widgetObj.selectedCheckBoxes.length > 0 &&
					// 	widgetObj.selectedEjSlider == 1
					// ) {
					// 	//Same layer id and url are used for supplemental indexes
					// 	widgetObj.thresholdRestLayerId = singleSliderStateLayer;
					// 	widgetObj.thresholdRestURL = ejscreenserviceSupp;
					// }
				} else if (widgetObj.queryToCompareAt == "nation") {
					widgetObj.mapLengedTitle = nationalSuppLegendTitle;
					if (
						widgetObj.selectedEjSlider > 0 &&
						widgetObj.selectedCheckBoxes.length == 0
					) {
						widgetObj.thresholdRestLayerId = singleSliderNationalLayer;
						widgetObj.thresholdRestURL = singleSliderSuppUrl;
						widgetObj.thresholdTableName =
							widgetObj.thresholdTableName =	national_supplemental_exceedances_tblname;
					} else {
						widgetObj.thresholdRestLayerId = singleSliderNationalLayer;
						widgetObj.thresholdRestURL = singleSliderSuppUrl;
						widgetObj.thresholdTableName =
						widgetObj.thresholdTableName =	national_supplemental_exceedances_tblname;
					}
					// } else if (
					// 	widgetObj.selectedCheckBoxes.length > 0 &&
					// 	widgetObj.selectedEjSlider == 1
					// ) {
					// 	widgetObj.thresholdRestLayerId = singleSliderNationalLayer;
					// 	widgetObj.thresholdRestURL = ejscreenserviceSupp;
					// }
				}
			}
		},
		_setSuppQueryUrlAndLayerIdOld() {
			if (widgetObj.selectedIndex == "supplemental") {
				if (widgetObj.queryToCompareAt == "state") {
					widgetObj.mapLengedTitle = stateSuppLegendTitle;
					if (
						widgetObj.selectedEjSlider > 0 &&
						widgetObj.selectedCheckBoxes.length == 0
					) {
						widgetObj.thresholdRestLayerId = singleSliderStateLayer;
						widgetObj.thresholdRestURL = singleSliderSuppUrl;
					} else if (
						widgetObj.selectedCheckBoxes.length > 0 &&
						widgetObj.selectedEjSlider == 1
					) {
						//Same layer id and url are used for supplemental indexes
						widgetObj.thresholdRestLayerId = singleSliderStateLayer;
						widgetObj.thresholdRestURL = ejscreenserviceSupp;
					}
				} else if (widgetObj.queryToCompareAt == "nation") {
					widgetObj.mapLengedTitle = nationalSuppLegendTitle;
					if (
						widgetObj.selectedEjSlider > 0 &&
						widgetObj.selectedCheckBoxes.length == 0
					) {
						widgetObj.thresholdRestLayerId = singleSliderNationalLayer;
						widgetObj.thresholdRestURL = singleSliderSuppUrl;
					} else if (
						widgetObj.selectedCheckBoxes.length > 0 &&
						widgetObj.selectedEjSlider == 1
					) {
						widgetObj.thresholdRestLayerId = singleSliderNationalLayer;
						widgetObj.thresholdRestURL = ejscreenserviceSupp;
					}
				}
			}
		},

		_setEnvQueryUrlAndLayerId() {
			if (widgetObj.selectedIndex == "environmental") {
				if (widgetObj.queryToCompareAt == "state") {
					widgetObj.mapLengedTitle = stateLegendTitle;
					if (
						widgetObj.selectedEjSlider > 0 &&
						widgetObj.selectedCheckBoxes.length == 0
					) {
						widgetObj.thresholdRestLayerId = singleSliderStateLayer;
						widgetObj.thresholdRestURL = singleSliderUrl;
						widgetObj.thresholdTableName = state_exceedances_tblname;
					} else {
						widgetObj.thresholdRestLayerId = singleSliderStateLayer;
						widgetObj.thresholdRestURL = singleSliderUrl;
							widgetObj.thresholdTableName = state_exceedances_tblname;
					}
					// } else if (
					// 	widgetObj.selectedCheckBoxes.length > 0 &&
					// 	widgetObj.selectedEjSlider == 1
					// ) {
					// 	widgetObj.thresholdRestLayerId = stateRestLayerId;
					// 	widgetObj.thresholdRestURL = stateRestURL;
					// }
				} else if (widgetObj.queryToCompareAt == "nation") {
					widgetObj.mapLengedTitle = nationalLegendTitle;
					if (
						widgetObj.selectedEjSlider > 0 &&
						widgetObj.selectedCheckBoxes.length == 0
					) {
						widgetObj.thresholdRestLayerId = singleSliderNationalLayer;
						widgetObj.thresholdRestURL = singleSliderUrl;
							widgetObj.thresholdTableName = nation_exceedances_tblname;
					} else {
						widgetObj.thresholdRestLayerId = singleSliderNationalLayer;
						widgetObj.thresholdRestURL = singleSliderUrl;
						widgetObj.thresholdTableName = nation_exceedances_tblname;
					}
					// } else if (
					// 	widgetObj.selectedCheckBoxes.length > 0 &&
					// 	widgetObj.selectedEjSlider == 1
					// ) {
					// 	widgetObj.thresholdRestLayerId = nationRestLayerId;
					// 	widgetObj.thresholdRestURL = nationRestURL;
					// }
				}
			}
		},
		_setEnvQueryUrlAndLayerIdold() {
			if (widgetObj.selectedIndex == "environmental") {
				if (widgetObj.queryToCompareAt == "state") {
					widgetObj.mapLengedTitle = stateLegendTitle;
					if (
						widgetObj.selectedEjSlider > 0 &&
						widgetObj.selectedCheckBoxes.length == 0
					) {
						widgetObj.thresholdRestLayerId = singleSliderStateLayer;
						widgetObj.thresholdRestURL = singleSliderUrl;
					} else if (
						widgetObj.selectedCheckBoxes.length > 0 &&
						widgetObj.selectedEjSlider == 1
					) {
						widgetObj.thresholdRestLayerId = stateRestLayerId;
						widgetObj.thresholdRestURL = stateRestURL;
					}
				} else if (widgetObj.queryToCompareAt == "nation") {
					widgetObj.mapLengedTitle = nationalLegendTitle;
					if (
						widgetObj.selectedEjSlider > 0 &&
						widgetObj.selectedCheckBoxes.length == 0
					) {
						widgetObj.thresholdRestLayerId = singleSliderNationalLayer;
						widgetObj.thresholdRestURL = singleSliderUrl;
					} else if (
						widgetObj.selectedCheckBoxes.length > 0 &&
						widgetObj.selectedEjSlider == 1
					) {
						widgetObj.thresholdRestLayerId = nationRestLayerId;
						widgetObj.thresholdRestURL = nationRestURL;
					}
				}
			}
		},
		_addMapLayers(targetId) {
			widgetObj.widgetId = targetId.split("_")[1];
				document.getElementById("loadDataError" + widgetObj.widgetId).style.display =
				"none";
			if(widgetObj.widgetId ==="ctwg"){
			 document.getElementById("loadData" + widgetObj.widgetId).style.display =
				"block";
			}
			document.getElementById(
				"divCntRecords" + widgetObj.widgetId
			).style.display = "none";
			//document.getElementById("cntRecords").textContent="Loading Data..";
			if (document.getElementById("loadingDiv")) {
				document.getElementById("loadingDiv").style.display = "block";
			}

			document.getElementById(
				"divCntRecords" + widgetObj.widgetId
			).style.display = "none";
			//alert(widgetObj.selectedIndex);
			//alert(widgetObj.queryToCompareAt);
			if (widgetObj.selectedIndex == "environmental") {
				widgetObj._setEnvQueryUrlAndLayerId();
			} else if (widgetObj.selectedIndex == "supplemental") {
				widgetObj._setSuppQueryUrlAndLayerId();
			}
			//alert(widgetObj.thresholdRestURL);
			//alert("REST URL: " + widgetObj.thresholdRestURL);
			//alert("Layer Id: " + widgetObj.thresholdRestLayerId);
			//widgetObj._setQueryUrlAndLayerId();
			//Must set the bounds before the where clause is prepared
			//save selected in a vars before doing lowerbound and upperbound changes
			//var selectedLowerBound = widgetObj.threshold[0];
			// selectedUpperBound = widgetObj.threshold[1];
			//widgetObj._setLowerBoundUpperBound();
			var whereClause = this._prepareWhereClause();
			var rawData = "";
			var rawDataCnt = "";
			//The supplimental code are now different so replace the code
			if (widgetObj.selectedIndex == "supplemental") {
				
				/*if(whereClause.includes('P_D2_PM25')) {
					 whereClause= whereClause.replaceAll('P_D2_PM25','P_D5_PM25');
				}
				else{
				whereClause = whereClause.replace(/['2]+/g, "5");
				}*/
				whereClause = whereClause.replaceAll("_D2_","_D5_");
			} //replace double quotes
			//alert("whereClause" + whereClause);
			if (
				widgetObj.selectedEjSlider > 0 &&
				widgetObj.selectedCheckBoxes.length == 0
			) {
				var pString = widgetObj.getStringData(whereClause);
				var slider = whereClause
					.substr(whereClause.length - 2, whereClause.length - 1)
					.trim();
				if (widgetObj.lowerBound == widgetObj.upperBoundVal) {
					pString = pString.replace(/['"]+/g, ""); //replace double quotes
					rawData = {
						query:
							"query ejQuery {  ejscreen__" +
							widgetObj.thresholdTableName +
							"(where: {" +
							pString +
							":{greaterThanEqual: " +
							slider +
							"}}  ) {__all_columns__}}",
					};
					rawDataCnt = {
						query:
							"query ejQuery {  ejscreen__" +
							widgetObj.thresholdTableName +
							"(where: {" +
							pString +
							":{greaterThanEqual: " +
							slider +
							"}}  ) {aggregate{count}}}",
					};
				} else {
					rawData = {
						query:
							"query ejQuery {ejscreen__" +
							widgetObj.thresholdTableName +
							"(where: {fn__add: {parameters: [" +
							pString +
							"], greaterThanEqual: " +
							slider +
							"}}) {__all_columns__}}",
					};
					rawDataCnt = {
						query:
							"query ejQuery {ejscreen__" +
							widgetObj.thresholdTableName +
							"(where: {fn__add: {parameters: [" +
							pString +
							"], greaterThanEqual: " +
							slider +
							"}}) {aggregate{count}}}",
					};
				}
			} else if (
				widgetObj.selectedCheckBoxes.length > 0 &&
				widgetObj.selectedEjSlider == 1
			) {
				// when there are checkbox selections
				if (widgetObj.lowerBound == widgetObj.upperBoundVal) {
					var rawDataArr = widgetObj.getQueryWithChkSelectionsEquals(
						whereClause,
						widgetObj.thresholdTableName
					);
					rawData = rawDataArr[0];
					rawDataCnt = rawDataArr[1];
				} else {
					var rawDataArr = widgetObj.getQueryWithChkSelections(
						whereClause,
						widgetObj.thresholdTableName
					);
					rawData = rawDataArr[0];
					rawDataCnt = rawDataArr[1];
				}
			}

			//var pString =   widgetObj.getStringData(whereClause);
			//var slider = whereClause.substr(whereClause.length-2,whereClause.length-1).trim();
			//alert(whereClause);
			//widgetObj.map.removeAll();
			//var rawData ={"query":"query ejQuery {ejscreen__national_exceedances_2023(where: {fn__add: {parameters: ["+pString+"], greaterThanEqual: "+slider+"}}) {__all_columns__}}"};
			//var rawData ={"query":"query ejQuery {ejscreen__"+widgetObj.thresholdTableName+"(where: {fn__add: {parameters: ["+pString+"], greaterThanEqual: "+slider+"}}) {__all_columns__}}"};
			var downloadLink = dojo.byId("myDoc" + widgetObj.widgetId);

			//widgetObj.getData(rawData, rawDataCnt);
			//console.log("rawData: "+rawData.query);
			//console.log("rawDataCnt: "+rawDataCnt.query);
			if (widgetObj.widgetId ==="ctwg") {
			    widgetObj.getData(rawData, rawDataCnt);
			}
			else{
				widgetObj.checkCompareMapInstances();
			}
			
			widgetObj.cleanThresholdLayer(targetId);
			widgetObj._checkResultCount(whereClause, function (rCount) {
				//alert(rCount);

				if (rCount > 0) {
					try {
						//document.getElementById("cntRecords").textContent=rCount.toLocaleString("en-US");
						//document.getElementById("divCntRecords").style.display= 'block';

						var fillcolor = {
							nation: [232, 190, 255, 255],
							state: [199, 242, 202, 255],
						};

						var outlinecolor = [110, 110, 110, 255];
						var selectedRange;
						if (widgetObj.lowerBound == widgetObj.upperBoundVal) {
							selectedRange = widgetObj.lowerBound + " percentile";
						} else {
							selectedRange =
								widgetObj.lowerBound +
								"-" +
								widgetObj.upperBoundVal +
								" percentile";
						}

						var indexlevel = widgetObj.queryToCompareAt;

						var simprenderer = {
							type: "simple",
							symbol: {
								type: "simple-fill",
								color: fillcolor[indexlevel],
								outline: {
									width: 1,
									color: outlinecolor,
								},
							},
							label: selectedRange,
						};

						var matchFoundTxt;
						if (rCount == 1) {
							matchFoundTxt = " block group where  ";
						} else if (rCount > 1) {
							matchFoundTxt = " block groups where  ";
						}

						var selectedIndexCount;
						if (widgetObj.selectedCheckBoxes.length > 0) {
							selectedIndexCount = widgetObj.selectedCheckBoxes.length;
						} else if (widgetObj.selectedCheckBoxes.length == 0) {
							selectedIndexCount = widgetObj.selectedEjSlider;
						}

						//divisorOfBlockGroup is defined in config.js
						//console.log("divisorOfBlockGroup" + divisorOfBlockGroup);

						//big percent is not used but vincent wanted to keep it
						var bgPercent = ((rCount / divisorOfBlockGroup) * 100).toFixed(3);

						var compoundTitle =
							"There are " +
							rCount.toLocaleString("en-US") +
							matchFoundTxt +
							selectedIndexCount;

						if (selectedIndexCount < 13) {
							compoundTitle = compoundTitle + " or more";
						}
						compoundTitle = compoundTitle + " indexes are within";

						var layer = new MapImageLayer({
							url: widgetObj.thresholdRestURL,
							title: widgetObj.mapLengedTitle,
							opacity: defaultOpacity, //opacity from widget config
							id: "threshold_map",
							sublayers: [
								{
									id: widgetObj.thresholdRestLayerId,
									title: compoundTitle,
									visible: true,
									definitionExpression: whereClause,
									renderer: simprenderer,
								},
							],
						});

						layer.isDynamic = true;
						layer.renderField ="ID,P_D2_PM25,P_D2_OZONE,P_D2_DSLPM,P_D2_NO2,P_D2_RSEI_AIR,P_D2_PTRAF,P_D2_LDPNT,P_D2_PNPL,P_D2_PRMP,P_D2_PTSDF,P_D2_UST,P_D2_PWDIS,P_D2_DWATER";
							//"ID,P_D2_PM25,P_D2_OZONE,P_D2_DSLPM,P_D2_CANCER,P_D2_RESP,P_D2_RSEI_AIR,P_D2_PTRAF,P_D2_LDPNT,P_D2_PNPL,P_D2_PRMP,P_D2_PTSDF,P_D2_UST,P_D2_PWDIS";
						if (widgetObj.selectedIndex == "supplemental") {
							//layer.renderField = layer.renderField.replace(/['2]+/g, "5");
							layer.renderField = layer.renderField.replaceAll("_D2_","_D5_");
						}
						//"ID,P_PM25_D2,P_OZONE_D2,P_DSLPM_D2,P_CANCR_D2,P_RESP_D2,P_PTRAF_D2,P_LDPNT_D2,P_PNPL_D2,P_PRMP_D2,P_PTSDF_D2,P_UST_D2,P_PWDIS_D2";
						//pass in the selected fields?
						//FYI- These fields are disabled in some conditions thus selected values are not found
						//but we need to query all 13 columns

						layer.maptype = "threshold";
						layer.layerType = "threshold";
						layer.renderIndex = widgetObj.thresholdRestLayerId;
						layer.pctlevel = indexlevel;
						if (
							targetId &&
							targetId.indexOf("map1") >= 1 &&
							dijit.byId("threshold_map1").view
						) {
							dijit.byId("threshold_map1").view.map.add(layer);
						} else if (
							targetId &&
							targetId.indexOf("map2") >= 1 &&
							dijit.byId("threshold_map2").view
						) {
							dijit.byId("threshold_map2").view.map.add(layer);
						} else {
							widgetObj.map.add(layer);
							//ap;
						}
						widgetObj.hideLoadingSpinner();
						//for side by side tab under tools tab
						//widgetObj.checkCompareMapInstances();
					} catch (e) {
						console.log("failed to get image layer in _addMapLayers");
						widgetObj.hideLoadingSpinner();
					}
				} else {
					var noResultFound = new Dialog({
						title: "No matching result found",
						style: "width: auto;",
					});
					noResultFound.set("content", noMatchFound);
					noResultFound.show();
					widgetObj.hideLoadingSpinner();
				}
			});
		},
		hideLoadingSpinner() {
			if (document.getElementById("loadingDiv")) {
				document.getElementById("loadingDiv").style.display = "none";
			}
		},
		cleanThresholdLayer(targetId) {
			if (
				targetId &&
				targetId.indexOf("map1") >= 0 &&
				dijit.byId("threshold_map1") &&
				dijit.byId("threshold_map1").view
			) {
				//remove all layers on the mobile version -comparemaps
				dijit.byId("threshold_map1").view.map.removeAll();
			} else if (
				targetId &&
				targetId.indexOf("map2") >= 0 &&
				dijit.byId("threshold_map2") &&
				dijit.byId("threshold_map2").view
			) {
				//remove all layers on the mobile version - comparemaps
				dijit.byId("threshold_map2").view.map.removeAll();
			} else if (widgetObj.map.findLayerById("threshold_map")) {
				//only remove threshold layer on the full version - ejscreen homepage
				widgetObj.map.remove(widgetObj.map.findLayerById("threshold_map"));
			}
		},
		checkCompareMapInstances() {
			//for side by side tab under tools tab
			//This function is related threshold widget instances
			//created by CompareMap.js widget
			if (
				//widgetObj.map.findLayerById("threshold_map") &&
				dom.byId("thresholdDiv")
			) {
				dojo.byId("theme").style.display = "none";
				var sideBySideTitle = widgetObj.mapLengedTitle.replace(
					"Index",
					"Index Threshold"
				);
				if (widgetObj.widgetId == "map1") {
					dom.byId("lab1").innerHTML = sideBySideTitle;
				} else if (widgetObj.widgetId == "map2") {
					dom.byId("lab2").innerHTML = sideBySideTitle;
				}
			}
		},
		getStringData(str) {
			var myArr = str
				.substring(str.indexOf("(") + 1, str.lastIndexOf(")"))
				.replace(/\s/g, "");
			var resultStr = myArr
				.toLowerCase()
				.replaceAll("+", ",")
				.replaceAll("p", '"p')
				.replaceAll(",", '", ')
				.concat('"');
			return resultStr;
		},
		destroy: function () {
			this.inherited(arguments);
		},

		//remove this after prod
		getData: async function (rawData, rawDataCnt) {
			// const res = await fetch(dmapurl + "/csv", {
			// 	method: "POST",
			// 	headers: {
			// 		Accept: "application/json",
			// 		"Content-Type": "application/json",
			// 	},
			// 	body: JSON.stringify(rawData),
			// });
			// document.getElementById("myDoc" + widgetObj.widgetId).href = res.url;
			document.getElementById("query" + widgetObj.widgetId).value = rawData.query;
			if(widgetObj.selectedIndex === "environmental"){
			    document.getElementById("help" + widgetObj.widgetId).href = ejHelpUrl;
			}else if(widgetObj.selectedIndex === "supplemental"){
				document.getElementById("help" + widgetObj.widgetId).href = supplHelpUrl;
			}

			let resp1 = fetch(dmapurl, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(rawDataCnt),
			})
				.then((response) => response.json())
				.then((data) => {
					//console.log('Success:', data);
					var cnt =
						data.data[
							"ejscreen__" + widgetObj.thresholdTableName
						][0].count.toLocaleString("en-US");
					document.getElementById(
						"loadData" + widgetObj.widgetId
					).style.display = "none";
					if (cnt != "0") {
						document.getElementById(
							"cntRecords" + widgetObj.widgetId
						).textContent = cnt;
						document.getElementById(
							"divCntRecords" + widgetObj.widgetId
						).style.display = "block";
					}
					widgetObj.checkCompareMapInstances();
				})
				.catch((error) => {
					console.error("Error:", error);
					document.getElementById("loadData" + widgetObj.widgetId).style.display = "none";
					document.getElementById("loadDataError" + widgetObj.widgetId).style.display = "block";
				});

			//  document.getElementById("cntRecords").textContent= resp1.data[widgetObj.thresholdTableName][0].count;
			//document.getElementById("divCntRecords").style.display= 'block';
		},
		getQueryWithChkSelectionsEquals: function (whereClauseStr, tblName) {
			//var str="( P_PM25_D2 >= 80 and P_PM25_D2 <= 100 ) and ( P_DSLPM_D2 >= 80 and P_DSLPM_D2 <= 100 ) and ( P_RESP_D2 >= 80 and P_RESP_D2 <= 100 )";
			//replacing first and
			var arr = whereClauseStr.replace(/\s/g, "").split("and");

			var queryS = "";
			for (var i = 0; i <= arr.length - 1; i++) {
				//var entry= arr[i].replace(")","").replace("(","")

				//var innerEntryArr= entry.split("and");

				//var lowerBound  = innerEntryArr[0].substr(innerEntryArr[0].indexOf("=")+1,innerEntryArr[0].length-1);
				var upperBound = arr[i].substr(
					arr[i].indexOf("=") + 1,
					arr[i].length - 1
				);

				var attr = arr[i].substr(0, arr[i].indexOf("="));
				var queryEntry = arr[i].substr(0, arr[i].indexOf("="));

				queryS += queryEntry.toLowerCase() + ": {equals: " + upperBound + "}";
			}
			var rawData = {
				query:
					"query ejQuery {ejscreen__" +
					tblName +
					"(where: { " +
					queryS +
					"}) { __all_columns__ }}",
			};
			var rawDataArr = [];
			rawDataArr.push(rawData);

			var rawData1 = {
				query:
					"query ejQuery {ejscreen__" +
					tblName +
					"(where: { " +
					queryS +
					"}) { aggregate{count} }}",
			};
			rawDataArr.push(rawData1);
			return rawDataArr;
		},

		getQueryWithChkSelections: function (whereClauseStr, tblName) {
			//var str="( P_PM25_D2 >= 80 and P_PM25_D2 <= 100 ) and ( P_DSLPM_D2 >= 80 and P_DSLPM_D2 <= 100 ) and ( P_RESP_D2 >= 80 and P_RESP_D2 <= 100 )";
			//replacing first and
			var arr = whereClauseStr.replace(/\s/g, "").split(")and(");
			var attrArr = [];
			var queryS = "";
			for (var i = 0; i <= arr.length - 1; i++) {
				var entry = arr[i].replace(")", "").replace("(", "");

				var innerEntryArr = entry.split("and");

				var lowerBound = innerEntryArr[0].substr(
					innerEntryArr[0].indexOf(">") + 2,
					innerEntryArr[0].length - 1
				);
				var upperBound = innerEntryArr[1].substr(
					innerEntryArr[1].indexOf("<") + 2,
					innerEntryArr[0].length - 1
				);

				var attr = innerEntryArr[0].substr(0, innerEntryArr[0].indexOf(">"));
				var queryEntry = innerEntryArr[0].substr(
					0,
					innerEntryArr[0].indexOf(">")
				);

				queryS +=
					queryEntry.toLowerCase() +
					": {between: {lower: " +
					lowerBound +
					", upper: " +
					upperBound +
					"}}";
			}
			var rawData = {
				query:
					"query ejQuery {ejscreen__" +
					tblName +
					"(where: { " +
					queryS +
					"}) { __all_columns__ }}",
			};
			var rawDataArr = [];
			rawDataArr.push(rawData);

			var rawData1 = {
				query:
					"query ejQuery {ejscreen__" +
					tblName +
					"(where: { " +
					queryS +
					"}) { aggregate{count} }}",
			};
			rawDataArr.push(rawData1);
			return rawDataArr;
		},
	});
	return ThWidget;
});
