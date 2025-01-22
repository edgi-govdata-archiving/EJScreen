var minorityPercentageUSVal; //=0.389349;
var lowIncomePercentageUSVal; //= 0.319054;

//var supplemental = true;
var ejIndicatorMap = {
	PM25: "Particulate Matter 2.5",
	OZONE: "Ozone",
	DSLPM: "Diesel Particulate Matter",
	CANCER: "Air Toxics Cancer Risk",
	RESP: "AIr Toxics Respiratory Hazard Index",
    RSEI_AIR:"Toxics Releases to Air",
	PTRAF: "Traffic Proximity and Volume",
	PRE1960PCT: "Lead Paint Indicator",
	PNPL: "Superfund Proximity",
	PRMP: "RMP Facility Proximity",
	PTSDF: "Hazardous Waste Proximity",
	UST: "Underground Storage Tanks",
	PWDIS: "Wastewater Discharge Indicator",
};

var indicatorMap = {
	PRE1960PCT: "D2_LDPNT",
	DSLPM: "D2_DSLPM",
	CANCER: "D2_CANCER",
	RESP: "D2_RESP",
	PTRAF: "D2_PTRAF",
	PWDIS: "D2_PWDIS",
	PNPL: "D2_PNPL",
	PRMP: "D2_PRMP",
	PTSDF: "D2_PTSDF",
	OZONE: "D2_OZONE",
	PM25: "D2_PM25",
	UST: "D2_UST",
	RSEI_AIR:"D2_RSEI_AIR"
};

var supplIndicatorMap = {
	PRE1960PCT: "D5_LDPNT",
	DSLPM: "D5_DSLPM",
	CANCER: "D5_CANCER",
	RESP: "D5_RESP",
	PTRAF: "D5_PTRAF",
	PWDIS: "D5_PWDIS",
	PNPL: "D5_PNPL",
	PRMP: "D5_PRMP",
	PTSDF: "D5_PTSDF",
	OZONE: "D5_OZONE",
	PM25: "D5_PM25",
	UST: "D5_UST",
	RSEI_AIR:"D5_RSEI_AIR"
};
var stateMap = {
	"01": "AL",
	"02": "AK",
	"04": "AZ",
	"05": "AR",
	"06": "CA",
	"08": "CO",
	"09": "CT",
	10: "DE",
	11: "DC",
	12: "FL",
	13: "GA",
	15: "HI",
	16: "ID",
	17: "IL",
	18: "IN",
	19: "IA",
	20: "KS",
	21: "KY",
	22: "LA",
	23: "ME",
	24: "MD",
	25: "MA",
	26: "MI",
	27: "MN",
	28: "MS",
	29: "MO",
	30: "MT",
	31: "NE",
	32: "NV",
	33: "NH",
	34: "NJ",
	35: "NM",
	36: "NY",
	37: "NC",
	38: "ND",
	39: "OH",
	40: "OK",
	41: "OR",
	42: "PA",
	44: "RI",
	45: "SC",
	46: "SD",
	47: "TN",
	48: "TX",
	49: "UT",
	50: "VT",
	51: "VA",
	53: "WA",
	54: "WV",
	55: "WI",
	56: "WY",
	60: "AS",
	64: "FM",
	66: "GU",
	68: "MH",
	69: "MP",
	70: "PW",
	72: "PR",
	74: "UM",
	78: "VI",
};

var statesJson = {
	stateList: {
		state: [
			{
				state: "Alabama",
				abbr: "AL",
				code: "01",
				region: "4",
			},
			{
				state: "Alaska",
				abbr: "AK",
				code: "02",
				region: "10",
			},
			{
				state: "Arizona",
				abbr: "AZ",
				code: "04",
				region: "9",
			},
			{
				state: "Arkansas",
				abbr: "AR",
				code: "05",
				region: "6",
			},
			{
				state: "California",
				abbr: "CA",
				code: "06",
				region: "9",
			},
			{
				state: "Colorado",
				abbr: "CO",
				code: "08",
				region: "8",
			},
			{
				state: "Connecticut",
				abbr: "CT",
				code: "09",
				region: "1",
			},
			{
				state: "Delaware",
				abbr: "DE",
				code: "10",
				region: "3",
			},
			{
				state: "District of Columbia",
				abbr: "DC",
				code: "11",
				region: "3",
			},
			{
				state: "Florida",
				abbr: "FL",
				code: "12",
				region: "4",
			},
			{
				state: "Georgia",
				abbr: "GA",
				code: "13",
				region: "4",
			},
			{
				state: "Hawaii",
				abbr: "HI",
				code: "15",
				region: "9",
			},
			{
				state: "Idaho",
				abbr: "ID",
				code: "16",
				region: "10",
			},
			{
				state: "Illinois",
				abbr: "IL",
				code: "17",
				region: "5",
			},
			{
				state: "Indiana",
				abbr: "IN",
				code: "18",
				region: "5",
			},
			{
				state: "Iowa",
				abbr: "IA",
				code: "19",
				region: "7",
			},
			{
				state: "Kansas",
				abbr: "KS",
				code: "20",
				region: "7",
			},
			{
				state: "Kentucky",
				abbr: "KY",
				code: "21",
				region: "4",
			},
			{
				state: "Louisiana",
				abbr: "LA",
				code: "22",
				region: "6",
			},
			{
				state: "Maine",
				abbr: "ME",
				code: "23",
				region: "1",
			},
			{
				state: "Maryland",
				abbr: "MD",
				code: "24",
				region: "3",
			},
			{
				state: "Massachusetts",
				abbr: "MA",
				code: "25",
				region: "1",
			},
			{
				state: "Michigan",
				abbr: "MI",
				code: "26",
				region: "5",
			},
			{
				state: "Minnesota",
				abbr: "MN",
				code: "27",
				region: "5",
			},
			{
				state: "Mississippi",
				abbr: "MS",
				code: "28",
				region: "4",
			},
			{
				state: "Missouri",
				abbr: "MO",
				code: "29",
				region: "7",
			},
			{
				state: "Montana",
				abbr: "MT",
				code: "30",
				region: "8",
			},
			{
				state: "Nebraska",
				abbr: "NE",
				code: "31",
				region: "27",
			},
			{
				state: "Nevada",
				abbr: "NV",
				code: "32",
				region: "9",
			},
			{
				state: "New Hampshire",
				abbr: "NH",
				code: "33",
				region: "1",
			},
			{
				state: "New Jersey",
				abbr: "NJ",
				code: "34",
				region: "2",
			},
			{
				state: "New Mexico",
				abbr: "NM",
				code: "35",
				region: "6",
			},
			{
				state: "New York",
				abbr: "NY",
				code: "36",
				region: "2",
			},
			{
				state: "North Carolina",
				abbr: "NC",
				code: "37",
				region: "4",
			},
			{
				state: "North Dakota",
				abbr: "ND",
				code: "38",
				region: "8",
			},
			{
				state: "Ohio",
				abbr: "OH",
				code: "39",
				region: "5",
			},
			{
				state: "Oklahoma",
				abbr: "OK",
				code: "40",
				region: "6",
			},
			{
				state: "Oregon",
				abbr: "OR",
				code: "41",
				region: "10",
			},
			{
				state: "Pennsylvania",
				abbr: "PA",
				code: "42",
				region: "3",
			},
			{
				state: "Rhode Island",
				abbr: "RI",
				code: "44",
				region: "1",
			},
			{
				state: "South Carolina",
				abbr: "SC",
				code: "45",
				region: "4",
			},
			{
				state: "South Dakota",
				abbr: "SD",
				code: "46",
				region: "8",
			},
			{
				state: "Tennessee",
				abbr: "TN",
				code: "47",
				region: "4",
			},
			{
				state: "Texas",
				abbr: "TX",
				code: "48",
				region: "6",
			},
			{
				state: "Utah",
				abbr: "UT",
				code: "49",
				region: "8",
			},
			{
				state: "Vermont",
				abbr: "VT",
				code: "50",
				region: "1",
			},
			{
				state: "Virginia",
				abbr: "VA",
				code: "51",
				region: "3",
			},
			{
				state: "Washington",
				abbr: "WA",
				code: "53",
				region: "10",
			},
			{
				state: "West Virginia",
				abbr: "WV",
				code: "54",
				region: "3",
			},
			{
				state: "Wisconsin",
				abbr: "WI",
				code: "55",
				region: "5",
			},
			{
				state: "Wyoming",
				abbr: "WY",
				code: "56",
				region: "8",
			},
			{
				state: "American Samao",
				abbr: "AS",
				code: "60",
				region: "9",
			},
			{
				state: "Federated states of Micronesia",
				abbr: "FM",
				code: "64",
				region: "9",
			},
			{
				state: "Guam",
				abbr: "GU",
				code: "66",
				region: "9",
			},
			{
				state: "Marshall Islands",
				abbr: "MH",
				code: "68",
				region: "9",
			},
			{
				state: "Northern Mariana Islands",
				abbr: "MP",
				code: "69",
				region: "9",
			},
			{
				state: "Palau",
				abbr: "PW",
				code: "70",
				region: "9",
			},
			{
				state: "Puerto Rico",
				abbr: "PR",
				code: "72",
				region: "2",
			},
			{
				state: "U.S. Minor Outlying Islands",
				abbr: "UM",
				code: "74",
				region: "",
			},
			{
				state: "Virgin Islands",
				abbr: "VI",
				code: "78",
				region: "2",
			},
		],
	},
};
/*function getStateAbbr(blockId){
    return stateMap[blockId.substring(0,2)]
}*/

function isEmpty(el) {
	return !$.trim(el.html());
}

function getRegion(blockId) {
	var stateCode = blockId.substring(0, 2);
	var region = 0;
	$.each(statesJson.stateList.state, function (i, v) {
		if (v.code === stateCode) {
			region = v.region;
			return false;
		}
	});
	return region;
}

function getStateAbbr(blockId) {
	var stateCode = blockId.substring(0, 2);
	var abbr = "";
	$.each(statesJson.stateList.state, function (i, v) {
		if (v.code === stateCode) {
			abbr = v.abbr;
			return false;
		}
	});
	return abbr;
}

require([
	"dojo",
	"esri/views/MapView",
	"esri/Map",
	"esri/widgets/Sketch/SketchViewModel",
	"esri/tasks/QueryTask",
	"esri/tasks/support/Query",
	"esri/geometry/SpatialReference",
	"esri/Graphic",
	"esri/layers/GraphicsLayer",
	"esri/geometry/Point",
	"esri/geometry/Polyline",
	"esri/geometry/Polygon",
	"esri/PopupTemplate",
	"esri/widgets/Search",
	"esri/geometry/support/webMercatorUtils",
	"esri/geometry/geometryEngine",
	"esri/config",
	"esri/request",
	"dojo/on",
	"dojo/parser",
	"dijit/registry",
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane",
	"dijit/form/Button",
	"dijit/WidgetSet",
	"dojo/domReady!",
], function (
	dojo,
	MapView,
	Map,
	SketchViewModel,
	QueryTask,
	Query,
	SpatialReference,
	Graphic,
	GraphicsLayer,
	Point,
	Polyline,
	Polygon,
	PopupTemplate,
	Search,
	webMercatorUtils,
	geometryEngine,
	esriConfig,
	esriRequest,
	on
) {
	var pname = location.pathname;
	var pos = pname.lastIndexOf("/");
	pname = pname.substr(0, pos);
	var rooturl = location.protocol + "//" + location.host + pname + "/";

	var ejscreenSOEbrokerurl = rooturl + "ejscreenRESTbroker.aspx";
	var ejscreenReportfile = "EJSCREEN_report.aspx";
	var ejscreenform = dojo.byId("ejform");
	var nationalPercentile;
	var statePercentile;
	var calculatedDemoBg;
	var supplemental;
	on(dojo.byId("submitEJ"), "click", function () {
		var ejIndexIndicator = $("#ejIndexSelect").val();
		var blockGroupId = $("#blockgroupId").val();
		supplemental = $("input[name='ejIndRadio']:checked").val() === "suppl";
		if(supplemental){
	 	 $('.indexClass').text("Supplemental Index");
		}else{
			 $('.indexClass').text("EJ Index");
		}
		$("#bgInput").text(blockGroupId);

		
		doCalculation(
			ejIndexIndicator,
			blockGroupId,
			supplemental
		);
	});

	function doCalculation(
		ejIndexIndicator,
		blockGroupId,
		isSupplemental
	) {
		//ejscreenindexurl="https://ejscreen.epa.gov/arcgis/rest/services/ejscreen/ejscreen_v2024_with_as_cnmi_gu_vi/MapServer/33/query"
		var queryTask = new QueryTask(ejscreenindexurl);
		var query = new Query();
		query.returnGeometry = false;
		query.outFields = ["*"];
		//query.outFields = [ejIndexIndicator, "ACSTOTPOP", "PEOPCOLORPCT", "LOWINCPCT"];
		//query.outFields = [ejIndexIndicator, "ACSTOTPOP", "PEOPCOLORPCT", "LOWINCPCT","UNEMPPCT","LINGISOPCT","LESSHSPCT","LIFEEXPPCT"];
		query.outFields = [ejIndexIndicator, "ACSTOTPOP", "PEOPCOLORPCT", "LOWINCPCT","DISABILITYPCT","LINGISOPCT","LESSHSPCT","LIFEEXPPCT"];
		var bgVal = "'" + blockGroupId + "'";
		query.where = "ID= " + bgVal;
		var operation = queryTask.execute(query);
		operation.then(
			function (featset) {
				if (featset.features.length > 0) {
					$("#minorpct").text(featset.features[0].attributes["PEOPCOLORPCT"]);
					
					$("#lowincpct").text(featset.features[0].attributes["LOWINCPCT"]);

					$("#disabilitypct").text(featset.features[0].attributes["DISABILITYPCT"]);
					$("#lingpct").text(featset.features[0].attributes["LINGISOPCT"]);
					$("#lesshspct").text(featset.features[0].attributes["LESSHSPCT"]);
					$("#lifexppct").text(featset.features[0].attributes["LIFEEXPPCT"]);
				
					$("#acstotpop").text(featset.features[0].attributes["ACSTOTPOP"]);

				
					
					// $('#demoIndex1').text("(("+featset.features[0].attributes['MINORPCT']+"-"+minorityPercentageUS+") + ("+featset.features[0].attributes['LOWINCPCT']+" – "+lowIncomePercentageUS+")) / 2 * "+featset.features[0].attributes['ACSTOTPOP']);
					//calculate the demogIndex for z state index and z usa index
				

					$(".ejIndexInd").text(ejIndicatorMap[ejIndexIndicator]);
					
					var envIndicatorVal =
						featset.features[0].attributes[ejIndexIndicator];
					
					$("#ejIndexInd2").text(ejIndicatorMap[ejIndexIndicator]);
					// var ejIndexValueUS =
					// 	featset.features[0].attributes[ejIndexIndicator] * demoEJIndexVal;
				
					var indexIndicator = supplemental === true ? supplIndicatorMap[ejIndexIndicator]:indicatorMap[ejIndexIndicator];
					//var ejIndexValue = 0;
					getStatePercentile(
						ejIndexIndicator,
						envIndicatorVal,					
						indexIndicator,						
						getStateAbbr(blockGroupId),
						featset.features[0].attributes[ejIndexIndicator],
						featset.features[0].attributes["ACSTOTPOP"],
						featset.features[0].attributes["PEOPCOLORPCT"],
						featset.features[0].attributes["LOWINCPCT"] ,						
						featset.features[0].attributes["DISABILITYPCT"] ,
						featset.features[0].attributes["LINGISOPCT"] ,
						featset.features[0].attributes["LESSHSPCT"] ,
						featset.features[0].attributes["LIFEEXPPCT"] ,
						supplemental
					); // eg OZONE , ozoneValue,D_OZONE_2,dozoneValue,state

					getUSAPercentile(
						ejIndexIndicator,
						envIndicatorVal,
						//indicatorMap[ejIndexIndicator],
						indexIndicator,
						//ejIndexValueUS,
						"USA",
						featset.features[0].attributes["PEOPCOLORPCT"],
						featset.features[0].attributes["LOWINCPCT"] ,						
						featset.features[0].attributes["DISABILITYPCT"] ,
						featset.features[0].attributes["LINGISOPCT"] ,
						featset.features[0].attributes["LESSHSPCT"] ,
						featset.features[0].attributes["LIFEEXPPCT"] ,
						supplemental
					); // eg OZONE , ozoneValue,D_OZONE_2,dozoneValue,region
					
				}
			},
			function (error) {
				console.log("error occurred: " + error);
			}
		);
	}

	function calculateZScore(meanAttributes,stdAttributes,indexPercentile,key){
         const zscore = (indexPercentile - meanAttributes[key])/stdAttributes[key];
		 return zscore;
	}

	function getStatePercentile(
		ejIndicatorKey,
		ejIndicatorValue,
		ejIndexKey,
		stateVal,
		environmentalIndicator,
		bgPopulation,
		peopleOfColorPercentile,
		lowIncomePercentile,
		disabilityPercentile,
		lingIsoPercentile,
		lessHsPercentile,
		lifeExpPercentile,
		isSupplemental
	) {

		var demoIndexText;
	   var ejIndicatorPercentile;
	   var ejIndexPercentile;
	
	   var meanAttributes;
	   var stdAttributes;
       var demogIndex = isSupplemental == true? "DEMOGIDX_5":"DEMOGIDX_2";
	   var indexText = isSupplemental== true? " Supplemental Index" :" EJ Index";
		var queryTask = new QueryTask(ejscreenstateurl);
		//var queryTask = new QueryTask("https://geopub.epa.gov/arcgis/rest/services/ejscreen/ejscreen_v2022_with_AS_CNMI_GU_VI/MapServer/6/query");
		var query = new Query();

		query.returnGeometry = false;

		query.outFields = [
			ejIndicatorKey,
			ejIndexKey,
			"PCTILE",
			demogIndex,  // for supplemental its different value
			"PEOPCOLORPCT",
			"LOWINCPCT",
			"DISABILITYPCT",
			"LINGISOPCT",
			"LESSHSPCT",
			"LIFEEXPPCT",
		];
		$("#stateAbbr").text(stateVal);
		var regionValue = "'" + stateVal + "'";
		query.where = "REGION= " + regionValue;
		//query.format="json";

		var operation = queryTask.execute(query);
		operation.then(
			function (data) {
				if (data.features.length > 0) {
					//var jsonData =  JSON.stringify(data.features);
					var attrArray = [];
					for (let i = 0; i <= data.features.length - 1; i++) {
						if(data.features[i].attributes["PCTILE"] === "mean"){
							meanAttributes = data.features[i].attributes;
						}else if(data.features[i].attributes["PCTILE"] === "std"){
							stdAttributes = data.features[i].attributes
						}else{
							attrArray.push(data.features[i].attributes);
						}
					}
                    //calculate zscore of people of color
					var calculatedDemoIndexbg;
					if(!isSupplemental){
						//state
						var lowIncomeZscore = calculateZScore(meanAttributes,stdAttributes,lowIncomePercentile,"LOWINCPCT");
						var peopleOfColorZscore = calculateZScore(meanAttributes,stdAttributes,peopleOfColorPercentile,"PEOPCOLORPCT");
						calculatedDemoIndexbg = (lowIncomeZscore + peopleOfColorZscore)/2;
						demoIndexForBgStr =
						   "Demographic Index for BG for State = " +
						   "( " +
						   peopleOfColorZscore +
						   " + " +
						   lowIncomeZscore +
						   " ) " +
						   " / 2";
						   $("#demoIndex1").text(
							   "(" +
							       peopleOfColorZscore +
								   " + " +
								   lowIncomeZscore +
								   ") / 2 "
						   );
						  
   
						   demoIndexText="( Minority z-score +  Low income z-score) / 2";
						  
						}else{
						   var denom = (lifeExpPercentile===0?4:5);
					      demoIndexText =   "(Low income z-score + "+
									   " Disability z-score  + "+
									   " Limited english speaking z-score + "+
									   " Less than high school education z-score+ "+
									   " Life expectancy z-score )/"+denom;
							var lowIncomeZscore = calculateZScore(meanAttributes,stdAttributes,lowIncomePercentile,"LOWINCPCT");
							var disabilityZscore = calculateZScore(meanAttributes,stdAttributes,disabilityPercentile,"DISABILITYPCT");
							var limEngZscore = calculateZScore(meanAttributes,stdAttributes,lingIsoPercentile,"LINGISOPCT");
							var lessHSZscore = calculateZScore(meanAttributes,stdAttributes,lessHsPercentile,"LESSHSPCT");
							var lifeExpZscore = calculateZScore(meanAttributes,stdAttributes,lifeExpPercentile,"LIFEEXPPCT");
							//disabilityZscore =0;
						  demoIndexForBgStr =
						   "Demographic Index for BG for State= " +
						   "( " +
						   
						   lowIncomeZscore +
						   " + " +
						   disabilityZscore +
						   " + " +
						   limEngZscore +
						   " + " +
						   lessHSZscore +
						   " + " +
						   lifeExpZscore +
						   " ) " +
						   " / "+denom;
   
						   $("#demoIndex1").text(
							   "(" +
								   //featset.features[0].attributes["PEOPCOLORPCT"] +
								   //" + " +
								   lowIncomeZscore +
						   " + " +
						   disabilityZscore +
						   " + " +
						   limEngZscore +
						   " + " +
						   lessHSZscore +
						   " + " +
						    +
											   
								   ") / "+denom
						   );
					     //    console.log("tyoeof********+"+featset.features[0].attributes["LINGISOPCT"]===0);
						   var denom = (lifeExpPercentile===0?4:5);
						   calculatedDemoIndexbg =
						   (
							lowIncomeZscore+
							disabilityZscore +
							limEngZscore +
							lessHSZscore +
							lifeExpZscore ) /
							denom;
							   
					   }
					   $("#demoIndexText").text(demoIndexText);
					   $("#demoFormulaValues").text(demoIndexForBgStr);
					   $("#demoIndex2").text(calculatedDemoIndexbg);
					//Get Env percentile for state
                      switch(ejIndicatorKey){
					   case "CANCER":
								ejIndicatorKey= "CANCER";
								break;
						case "PRE1960PCT":
								ejIndicatorKey= "LDPNT";
								break;
                         default:
							    break;
				   }
				   var queryTask = new QueryTask(ejscreenenvindexstateurl);
			
					//var queryTask = new QueryTask("https://geopub.epa.gov/arcgis/rest/services/ejscreen/ejscreen_v2022_with_AS_CNMI_GU_VI/MapServer/5");
					var query = new Query();
					query.returnGeometry = false;
			
					query.outFields = ["P_"+ejIndicatorKey];
					// var bgVal="\'"+blockGroupId+"\'"
					// query.where = "ID= "+bgVal;
					query.where = "ID= " +"'"+$("#blockgroupId").val()+"'";
					//query.where = "REGION='USA'";
					var operation = queryTask.execute(query);
					operation.then(
						function (featset) {
							if (featset.features.length > 0) {
								
								ejIndicatorPercentile = featset.features[0].attributes["P_"+ejIndicatorKey];
								ejIndicatorPercentile = (ejIndicatorPercentile===null ? "N/A":ejIndicatorPercentile);
								$("#envIndStatePercentage").text(ejIndicatorPercentile);

								var statePercentileStr =
									"State Percentile for Environmental Indicator for " +
									$("#ejIndexSelect option:selected").text() +
									" = " +
									ejIndicatorPercentile;
								$("#statePercentileId").text(statePercentileStr);
			
								$("#stateFormulaWithVal").text(
									//"EJ Index for " +
										$("#ejIndexSelect option:selected").text() + indexText +
										" = " +
										ejIndicatorPercentile +
										" * " +
										calculatedDemoIndexbg
								);
								var tempCalVal = (
									ejIndicatorPercentile * calculatedDemoIndexbg
								).toFixed(3);
								$("#stateFinalCalVal").text(
									//"EJ Index for " +
										$("#ejIndexSelect option:selected").text() + indexText +
										" = " +
										tempCalVal
								);
								//calculatedDemoIndexbg
								//console.log("getStatePercentile" +ejIndexKey+" *******BEFORE"+JSON.stringify(attrArray));
			
								//attrArray.sort((a, b) => (a[ejIndexKey] > b[ejIndexKey] ? 1 : -1));
								//attrArray.sort((a, b) => (a[ejIndexKey] > b[ejIndexKey] ? 1 : -1));
								//console.log(attrArray);
								// console.log("getStatePercentile" +ejIndexKey+" *******AFTER"+JSON.stringify(attrArray));
			
								ejIndexPercentile = getPercentile(
									//$("#ejIndex2").text(),
									tempCalVal,
									attrArray,
									ejIndexKey
								);
								// console.log("ejIndexPercentile: " + ejIndexPercentile);
								$("#ejIndexStatePercentage").text(ejIndexPercentile);
					
							}
						},
						function (error) {
							console.log("error occurred: " + error);
						}
					);


					
					
				}
			},
			function (error) {
				console.log("error occurred: " + error);
			}
		);
	}

	function getUSAPercentile(
		ejIndicatorKey,
		ejIndicatorValue,
		ejIndexKey,
	    usaVal,
		peopleOfColorPercentile,
		lowIncomePercentile,
		disabilityPercentile,
		lingIsoPercentile,
		lessHsPercentile,
		lifeExpPercentile,
		isSupplemental
	) {
		var ejIndicatorPercentile;
		var ejIndexPercentile;
		var indexText = isSupplemental === true ? " Supplemental Index" :" EJ Index";
		var meanUSAAttributes;
		var stdUSAAttributes;
		var queryTask = new QueryTask(ejscreenusaurl);
		//var queryTask = new QueryTask("https://geopub.epa.gov/arcgis/rest/services/ejscreen/ejscreen_v2022_with_AS_CNMI_GU_VI/MapServer/7/query");
		var query = new Query();
      var demoIndexTextUSA;
	  var demoIndexForBgStrUSA;
		query.returnGeometry = false;

		query.outFields = [ejIndicatorKey,
			 ejIndexKey,
			  "PCTILE",
			  "PEOPCOLORPCT",
			  "LOWINCPCT",
			  "DISABILITYPCT",
			  "LINGISOPCT",
			  "LESSHSPCT",
			  "LIFEEXPPCT"];
		// var dirty = (new Date()).getTime();
		// query.where = "FOR_DATA='Y' AND " + dirty + "=" + dirty;
		//var bgVal="\'391650316002\'";
		var regionValue = "'" + usaVal + "'";
		query.where = "REGION= " + regionValue;
		//query.where = "REGION is null";
		//query.format="json";

		var operation = queryTask.execute(query);
		operation.then(
			function (data) {
				if (data.features.length > 0) {
					//var jsonData =  JSON.stringify(data.features);
					var attrArray = [];
					for (let i = 0; i <= data.features.length - 1; i++) {
						if(data.features[i].attributes["PCTILE"] === "mean"){
							meanUSAAttributes = data.features[i].attributes;
						}else if(data.features[i].attributes["PCTILE"] === "std"){
							stdUSAAttributes = data.features[i].attributes
						}else{
							attrArray.push(data.features[i].attributes);
						}
					}
					var calculatedDemoIndexbgUSA;
					if(!isSupplemental){
						//state
						var lowIncomeZscore = calculateZScore(meanUSAAttributes,stdUSAAttributes,lowIncomePercentile,"LOWINCPCT");
						var peopleOfColorZscore = calculateZScore(meanUSAAttributes,stdUSAAttributes,peopleOfColorPercentile,"PEOPCOLORPCT");
						calculatedDemoIndexbgUSA = (lowIncomeZscore + peopleOfColorZscore)/2;
						demoIndexForBgStrUSA =
						   "Demographic Index for BG for USA = " +
						   "( " +
						   peopleOfColorZscore +
						   " + " +
						   lowIncomeZscore +
						   " ) " +
						   " / 2";
						   $("#demoIndex1").text(
							   "(" +
							       peopleOfColorZscore +
								   " + " +
								   lowIncomeZscore +
								   ") / 2 "
						   );
						  
   
						   demoIndexTextUSA="( Minority z-score +  Low income z-score ) / 2";
						  
						}else{
						   var denom = (lifeExpPercentile===0?4:5);
						   demoIndexTextUSA =   "(Low income z-score  + "+
									   " Disability z-score + "+
									   " Limited english speaking z-score  + "+
									   " Less than high school education z-score + "+
									   " Life expectancy z-score  )/"+denom;
							var lowIncomeZscore = calculateZScore(meanUSAAttributes,stdUSAAttributes,lowIncomePercentile,"LOWINCPCT");
							var disabilityZscore = calculateZScore(meanUSAAttributes,stdUSAAttributes,disabilityPercentile,"DISABILITYPCT");
							var limEngZscore = calculateZScore(meanUSAAttributes,stdUSAAttributes,lingIsoPercentile,"LINGISOPCT");
							var lessHSZscore = calculateZScore(meanUSAAttributes,stdUSAAttributes,lessHsPercentile,"LESSHSPCT");
							var lifeExpZscore = calculateZScore(meanUSAAttributes,stdUSAAttributes,lifeExpPercentile,"LIFEEXPPCT");
							//disabilityZscore =0;
							demoIndexForBgStrUSA =
						   "Demographic Index for BG for State= " +
						   "( " +
						   
						   lowIncomeZscore +
						   " + " +
						   disabilityZscore +
						   " + " +
						   limEngZscore +
						   " + " +
						   lessHSZscore +
						   " + " +
						   lifeExpZscore +
						   " ) " +
						   " / "+denom;
   
						   $("#demoIndex1").text(
							   "(" +
								   //featset.features[0].attributes["PEOPCOLORPCT"] +
								   //" + " +
								   lowIncomeZscore +
						   " + " +
						   disabilityZscore +
						   " + " +
						   limEngZscore +
						   " + " +
						   lessHSZscore +
						   " + " +
						    +
											   
								   ") / "+denom
						   );
					     //    console.log("tyoeof********+"+featset.features[0].attributes["LINGISOPCT"]===0);
						   var denom = (lifeExpPercentile===0?4:5);
						   calculatedDemoIndexbgUSA =
						   (
							lowIncomeZscore+
							disabilityZscore +
							limEngZscore +
							lessHSZscore +
							lifeExpZscore ) /
							denom;
							   
					   }
					   $("#demoIndexTextUSA").text(demoIndexTextUSA);
					   $("#demoFormulaValuesUSA").text(demoIndexForBgStrUSA);
					   $("#demoIndex2USA").text(calculatedDemoIndexbgUSA);
					 //get the env National percentile from the service
					 switch(ejIndicatorKey){
						case "CANCER":
								 ejIndicatorKey= "CANCER";
								 break;
						 case "PRE1960PCT":
								 ejIndicatorKey= "LDPNT";
								 break;
						  default:
								 break;
					}
					var queryTask = new QueryTask(ejscreenenvindexnationalurl);
					//var queryTask = new QueryTask("https://geopub.epa.gov/arcgis/rest/services/ejscreen/ejscreen_v2022_with_AS_CNMI_GU_VI/MapServer/4");
					var query = new Query();
					query.returnGeometry = false;
			
					query.outFields = ["P_"+ejIndicatorKey];
					// var bgVal="\'"+blockGroupId+"\'"
					// query.where = "ID= "+bgVal;
					query.where = "ID= " +"'"+$("#blockgroupId").val()+"'";
					//query.where = "REGION='USA'";
					var operation = queryTask.execute(query);
					
					operation.then(
						function (featset) {
							if (featset.features.length > 0) {
								
								ejIndicatorPercentile = featset.features[0].attributes["P_"+ejIndicatorKey];
								ejIndicatorPercentile = (ejIndicatorPercentile==null)?"N/A":ejIndicatorPercentile;
								nationalPercentile = nationalPercentileStr;
					var nationalPercentileStr =
						"National Percentile for Environmental Indicator for " +
						$("#ejIndexSelect option:selected").text() +
						" = " +
						ejIndicatorPercentile;
					$("#nationalPercentileId").text(nationalPercentileStr);

					$("#envIndUSAPercentage").text(ejIndicatorPercentile===null?"N/A":ejIndicatorPercentile);
					$("#demoCalsId").text(
				
							$("#ejIndexSelect option:selected").text() + indexText +
							" = " +
							ejIndicatorPercentile +
							" * " +
							calculatedDemoIndexbgUSA
					);
					var domoIndexCalVal = (
						ejIndicatorPercentile * calculatedDemoIndexbgUSA
					).toFixed(3);
					$("#demoIndexFinalVal").text(
						
							$("#ejIndexSelect option:selected").text() + indexText +
							" = " +
							domoIndexCalVal
					);

					//demoIndexForBgVal
					//demoCalsId

					//attrArray.sort((a, b) => (a[ejIndexKey] > b[ejIndexKey] ? 1 : -1));
					//console.log(attrArr);
					// console.log(ejIndexKey+" *******"+JSON.stringify(attrArray));
					ejIndexPercentile = getPercentile(
						//ejIndexValue,
						domoIndexCalVal,
						attrArray,
						ejIndexKey
					);
					// console.log("ejIndexPercentile: " + ejIndexPercentile);
					$("#ejIndexUSAPercentage").text(ejIndexPercentile);
							}
						},
						function (error) {
							console.log("error occurred: " + error);
						}
					);
					

					
					
				}
			},
			function (error) {
				console.log("error occurred: " + error);
			}
		);
	}

	function getPercentile(n, attrArr, ejKey) {
		if(n === "NaN" || n === null ){
			return "N/A";
		}
		//actualval, array with the indicator vals, envindicator or ejindexkey
		var breakElem = false;
		var lastKey = "not match";
		var lastIndex =-1;
		//var prevValue =-1;
		for (let i = 0; i < attrArr.length - 1; i++) {
			if (attrArr[i][ejKey] > n) {
				breakElem = true;
				break;
			}else if(lastIndex>-1  && attrArr[lastIndex][ejKey] === attrArr[i][ejKey] ) {	
					if(attrArr[i][ejKey] <= Number(n)){
						continue;
					}else{
						breakElem = true;
				    	lastKey = attrArr[lastIndex]['PCTILE']
				        break;
					}		
			}
			else {
				lastIndex = i;
				lastKey = attrArr[i]["PCTILE"];
			}
		}
		return breakElem == true ? lastKey : "out of range";
	}

	function getEnvPercentile(numberVal, attrArr, ejKey) {
		//actualval, array with the indicator vals, envindicator or ejindexkey
		if(numberVal === null){
			return 'N/A';
		}
		var breakElem = false;
		var lastKey = "not match";
		
		var roundedVal = numberVal.toFixed(6);
		var lastKeyVal = "";
		for (let i = 0; i < attrArr.length - 1; i++) {
			if (attrArr[i][ejKey] > roundedVal) {
				if (i === 0) {
					lastKeyVal = attrArr[i]["PCTILE"];
				}
				breakElem = true;
				break;
			} else {
				lastKey = attrArr[i]["PCTILE"];
			}
		}
		// return  breakElem == true && lastKeyVal!="" ? lastKey :"out of range";
		if (lastKeyVal != "") return lastKeyVal;
		else {
			return breakElem == true ? lastKey : "out of range";
		}
		//  if (breakElem == true) return lastKey;
	}
	//check if Nata is true then the percentile logic should be implemented
	//percentil calculation for ISNATA true indicators
});
