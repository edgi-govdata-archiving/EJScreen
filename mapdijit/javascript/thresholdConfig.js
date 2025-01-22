var ejaIndexes = [
	// {
	// 	order: 0,
	// 	description: "None",
	// 	name: "None",
	// },
	{
		order: 1,
		description: "Particulate Matter 2.5",
		name: "P_D2_PM25",
	},
	{
		order: 3,
		description: "Ozone",
		name: "P_D2_OZONE",
	},
	{
		order: 5,
		description: "Nitrogen Dioxide (NO\u2082)",
		name: "P_D2_NO2",
	},
	{
		order: 7,
		description: "Diesel Particulate Matter",
		name: "P_D2_DSLPM",
	},
	
	{
		order: 9,
		description: "Toxic Releases to Air",
		name: "P_D2_RSEI_AIR ",
	},
	
	{
		order: 11,
		description: "Traffic Proximity",
		name: "P_D2_PTRAF",
	},
	
	{
		order: 2,
		description: "Lead Paint",
		name: "P_D2_LDPNT",
	},
	{
		order: 4,
		description: "Superfund Proximity",
		name: "P_D2_PNPL",
	},
	{
		order: 6,
		description: "RMP Facility Proximity",
		name: "P_D2_PRMP",
	},
	{
		order: 8,
		description: "Hazardous Waste Proximity",
		name: "P_D2_PTSDF",
	},
	{
		order: 10,
		description: "Underground Storage Tanks",
		name: "P_D2_UST",
	},
	{
		order: 12,
		description: "Wastewater Discharge",
		name: "P_D2_PWDIS",
	},
	{
		order: 13,
		description: "Drinking Water Non-Compliance",
		name: "P_D2_DWATER",
	},
];
//alert("got from config" + localRESTurl);
//localRESTurl constant is defined in config.js file

var singleSliderUrl =
	localRESTurl + "ejscreen/ejscreen_exceedances_2024/MapServer";

var singleSliderNationalLayer = 0;
var singleSliderStateLayer = 1;

var singleSliderSuppUrl =
	localRESTurl + "ejscreen/ejscreen_supplemental_exceedances_2024/MapServer";


//var nationRestURL = localRESTurl + "ejscreen/ejscreen_v2022/MapServer";
var nationRestURL = ejscreenservice;

//var stateRestURL = localRESTurl + "ejscreen/ejscreen_v2022_statepct/MapServer";
var stateRestURL = ejscreenservice_state;
var nationRestLayerId = 4;
var stateRestLayerId = 5;

var nationalLegendTitle = "EJ Index (US)";
var stateLegendTitle = "EJ Index (State)";

var nationalSuppLegendTitle = "Supplemental Index (US)";
var stateSuppLegendTitle = "Supplemental Index (State)";

//nation is default and could be changed by radio button to state
var queryToCompareAt = "nation";

//vaidation msgs
var invalidThresholdVal =
	"Lower bound value cannot be greater than or equal to upper bound value.";
var thresholdNotSelected = "Please select an Index percentile range.";
var ejIndexesNotSelected =
	"Please select number of EJ Indexes within percentile range.";
var ejSliderIsGreaterThanCheckboxes =
	" more EJIndexes checkbox(es) as indicated on the '# of EJIndexes slider'";
var noMatchFound = "No matching result is found for the selected criteria.";
var checkBoxesNotSelected="Please select at least one checkbox.";
//Slider explanation

var whenOne =
	"At least ${selectedEjSlider} of the indexes is within the percentile range";
var whenGtOne =
	"${selectedEjSlider} or more indexes are within the percentile range";
var whenAll =
	"All ${selectedEjSlider} indexes are within the percentile range";

//default opacity of all threshold layres
//var defaultOpacity = 0.5;
var defaultOpacity = 0.5;

//prod url
var dmapurl="https://data.epa.gov/dmapservice/query";

//staging url
//var dmapurl="https://staging.dmap-prod.aws.epa.gov/dmapservice/query";

//dev url
//var dmapurl="https://api.edap-cluster.com/dmapservice/query";

var dmapCSVdownloadurl = dmapurl+"/CSV?is_attachment=true";

var ejHelpUrl ="help/ExceedanceFieldDesc-EJIndex.html";
var supplHelpUrl="help/ExceedanceFieldDesc-SupplIndex.html";
var nation_exceedances_tblname = 'national_exceedances_2024';
var state_exceedances_tblname = 'state_exceedances_2024';

var national_supplemental_exceedances_tblname =  'national_supplemental_exceedances_2024';
var state_supplemental_exceedances_tblname =  'state_supplemental_exceedances_2024';															 