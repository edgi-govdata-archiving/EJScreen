<%@ Page Language="VB" AutoEventWireup="false" CodeFile="EJscreen_report.aspx.vb" Inherits="EJscreen_report"  ValidateRequest="false" %>

<!DOCTYPE html>
  <html lang="en">
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

    <link rel="stylesheet" href="https://js.arcgis.com/4.11/esri/css/main.css">
        <link rel="SHORTCUT ICON" href="images/ej.ico" />
    <link rel="stylesheet" href="css/bootstrap.css" />
    <link rel="stylesheet" href="css/claro/claro.css" />    
		<title>EJScreen Report</title>     
        
        <link rel="SHORTCUT ICON" href="images/ej.ico" />
       <style type="text/css">
           #EJindexDiv 
           {

               text-align: center;
           }
        #EJindexDiv table,#envdemogDiv table { font-family: Helvetica,Arial; border-style: solid; border-left-width: 1px; border-bottom-width: 2px; border-right-width: 0px; border-top-width: 2px; border-right-width: 2px; border-color: #4F81BC;}
        
        #facilityDiv table { font-family: Helvetica,Arial; border-style: solid; border-left-width: 2px; border-bottom-width: 1px; border-right-width: 0px; border-top-width: 2px; border-right-width: 0px; border-color: #4F81BC;}
        
        #EJindexDiv th,#envdemogDiv th {font-weight:bold; border-style: solid; border-left-width: 2px; border-top-width: 1px; border-bottom-width: 1px; border-right-width: 0px;border-color: #4F81BC; font-size: 11pt;}

        #facilityDiv th { font-weight:bold; border-style: solid; border-bottom-width: 2px;border-right-width: 2px;border-top-width: 0px;border-left-width: 0px; border-color: #4F81BC; font-size: 11pt;}

        #EJindexDiv td,#envdemogDiv td {font-weight: normal; text-indent: 10px; border-style: solid; border-top-width: 0px;border-left-width: 1px;border-bottom-width: 1px; border-right-width: 0px; border-color: #4F81BC; font-size: 10pt;}

        #facilityDiv td {font-weight: normal; text-indent: 10px; border-style: solid; border-top-width: 0px;border-left-width: 0px;border-bottom-width: 1px; border-right-width: 2px; border-color: #4F81BC; font-size: 10pt;}

        #EJindexDiv tr:nth-of-type(even), #envdemogDiv tr:nth-of-type(even), #facilityDiv tr:nth-of-type(even) {
            background-color:#DCE6F0;
        }
        #loadingDiv 
{
    background-color: #FFFFFF;
    border: 1px solid #CCCCCC;
    display: none;
    z-index: 500;
    position: absolute;
    left: 10%;
    top: 10%;
}
.legendtext 
{
    font-family: Verdana;
    font-size: 8pt;
    margin-right: 8px;
}
       </style>
       
		<script type="text/javascript">
		    dojoConfig = {
		        dojoxGfxSvgProxyFrameUrl: "gfxSvgProxyFrame.html",
		        parseOnLoad: true //enables declarative chart creation
		        //gfxRenderer: "svg,vml" // svg is first priority, adding silverlight with Column chart gives err.                
		    };
        </script>
      
      <script src="https://js.arcgis.com/4.11/"></script>
       <script type="text/javascript" src="javascript/config.js"></script>
       <script type="text/javascript" src="javascript/tagmanager.js"></script>
   <!-- <script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-32633028-1', 'auto');
  ga('send', 'pageview');

</script> -->

	   <script type="text/javascript">
	       require([
           "esri/config",
"esri/request",
           "esri/views/MapView",
      "esri/Map",
      "esri/tasks/QueryTask",
 "esri/tasks/support/Query",
 "esri/geometry/geometryEngine",
 "esri/geometry/support/webMercatorUtils",
 "esri/Graphic",
 "esri/geometry/Point",
 "esri/geometry/Polyline",
 "esri/geometry/Polygon",
 "esri/geometry/SpatialReference",
 "esri/widgets/ScaleBar",
"dojo/on",
'dojox/gfx/utils',
'dojox/charting/Chart',
'dojox/charting/plot2d/ClusteredColumns',
'dojox/charting/action2d/Highlight',
'dojox/charting/action2d/Tooltip',
'dojox/charting/plot2d/Grid',
'dojox/charting/plot2d/Markers',
'dojox/charting/axis2d/Default',

"dojo/domReady!"
],

function (esriConfig,esriRequest, MapView,Map, QueryTask, Query, geometryEngine,webMercatorUtils, Graphic,Point,Polyline, Polygon,SpatialReference,ScaleBar, on) {
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
    var linesym ={ // symbol used for polylines
        type: "simple-line", // autocasts as new SimpleMarkerSymbol()
        color: "#ff0000",
        width: "2",
        style: "solid"
        };
    var polysym = { // symbol used for polygons
            type: "simple-fill", // autocasts as new SimpleMarkerSymbol()
            color: "rgba(0, 255, 0, 0.0)",
            style: "solid",
            outline: {
              color: "red",
              width: 1
            }
          };
    var content;
    var headerstr = "";

    var chart;
    //var surfaceLeg;
    var chartData;

    var ejdataobj = {};
    var populationstr = "";

    esriConfig.request.proxyUrl = "proxy.ashx";
   // getDataobj();
   try {
        if (opener) {
            if (opener.document.getElementById("mapimageurl")) {
                var mimgurl = opener.document.getElementById("mapimageurl").innerHTML;
                document.getElementById("printmapimage").innerHTML = "<center><img  class='img-responsive' src='" + mimgurl + "' alt='Map' /></center>";
                document.forms['Form1']['mapimage'].value = mimgurl;
            }

            if (opener.dataobj) {
            //force dataobj to come from config, Use if point to dev, remove on prod
                ejdataobj = dataobj;
                //ejdataobj = opener.dataobj;
            } else {
                ejdataobj = dataobj;
            }

        } else {
            ejdataobj = dataobj;
        }
    } catch (e) {
        ejdataobj = dataobj;
    }

    var intype = "<%=feattype %>";
    var areaid = "<%=areaid %>";
    var radius = "<%=dist %>";
    if (!(radius) || (radius == "")) radius = 0;
    else radius = parseFloat(radius);

    var bunitcode = "<%=bunit %>";
    var bunit = "mile";
    for (var u in bufferunits) {
        if (bufferunits[u].esricode == bunitcode) bunit = u;
    }

    var namestr = '<%=namestr %>';

    document.getElementById("loadingDiv").style.display = "block";

    var geomjson = '<%=coordstr %>';



    var inGeom = null;
    var centerpnt = null;
    var content;
    var hasBuffer = true;
    var inspatialref = new SpatialReference({ wkid: 4326 });
    if (radius == 0) {
        hasBuffer = false;
    }

    var map = new Map({
        basemap: "gray"
    });
    var mview = new MapView({
        map: map,
        container: "map",
        center: [-122.45, 37.75], // longitude, latitude
        zoom: 13
    });
    mview.when(disableZooming);

function disableZooming(view) {
      view.popup.dockEnabled = true;

      // Removes the zoom action on the popup
      view.popup.actions = [];

      // stops propagation of default behavior when an event fires
      function stopEvtPropagation(event) {
        event.stopPropagation();
      }

      // exlude the zoom widget from the default UI
      view.ui.components = ["attribution"];

      // disable mouse wheel scroll zooming on the view
      view.on("mouse-wheel", stopEvtPropagation);

      // disable zooming via double-click on the view
      view.on("double-click", stopEvtPropagation);

      // disable zooming out via double-click + Control on the view
      view.on("double-click", ["Control"], stopEvtPropagation);

      // disables pinch-zoom and panning on the view
      view.on("drag", stopEvtPropagation);

      // disable the view's zoom box to prevent the Shift + drag
      // and Shift + Control + drag zoom gestures.
      view.on("drag", ["Shift"], stopEvtPropagation);
      view.on("drag", ["Shift", "Control"], stopEvtPropagation);

      // prevents zooming with the + and - keys
      view.on("key-down", (event) => {
        const prohibitedKeys = [
          "+",
          "-",
          "Shift",
          "_",
          "=",
          "ArrowUp",
          "ArrowDown",
          "ArrowRight",
          "ArrowLeft"
        ];
        const keyPressed = event.key;
        if (prohibitedKeys.indexOf(keyPressed) !== -1) {
          event.stopPropagation();
        }
      });

      return view;
    }

    if (geomjson.length > 0) {
        var geom = JSON.parse(geomjson);

        if (geom.x) {
            if (radius == 0) {
                alert("You have to enter a radius greater than 0 for point feature.");
                return false;
            }
            var x = geom.x;
            var y = geom.y;

            headerstr = headerstr + radius + " " + bunit + " Ring Centered at " + y.toFixed(6) + "," + x.toFixed(6);
        } else if (geom.rings) {

            headerstr = "";
            if (radius == 0) {
                //headerstr = headerstr + "<a href='javascript: void(0);' title='" + coords + "'>the User Specified Area</a>";
                headerstr = headerstr + "the User Specified Area";
                locationstr = "the User Specified Area";
            } else {
                //headerstr = headerstr + radius + " " + bunit + " Ring around <a href='javascript: void(0);' title='" + coords + "'>the Area</a>";
                headerstr = headerstr + radius + " " + bunit + " Ring around the Area";
            }


        } else if (geom.paths) {

            if (radius == 0) {
                alert("You have to enter a radius greater than 0 for linear feature.");
                return false;
            }

            headerstr = "";
            headerstr = headerstr + radius + " " + bunit + " Ring around ";
            headerstr = headerstr + "the Corridor";

        } else {
            alert("Invalid coordinates string or input geometry type.");
            return false;
        }
        content = {
            'geometry': geomjson,
            'distance': radius,
            'unit': bunitcode,
            'areatype': '',
            'areaid': '',
            'f': "json"
        };

    } else if (areaid.length > 4) {
        headerstr = typelookup[intype].description + ": " + namestr;
        if (intype == "city") {
        namestr = namestr.replace(/\scity/gi, "");
        
        content = {
            'geometry': '',
            'distance': '',
            'unit': '',
            'areaid': areaid,
            'areatype':'city',
            'f': "json"
        };
        } else {
            content = {
                'geometry': '',
                'distance': '',
                'unit': '',
                'areatype': intype,
                'areaid': areaid,
                'f': "json"
            };
        }
    }


    mview.when(function () {
        if (geomjson.length > 1) drawFeature(geomjson);
        else if (areaid.length > 4) drawID(areaid, intype);
    });
    var scaleBar = new ScaleBar({
        view: mview,
        style: "ruler",
        unit: "dual" // The scale bar displays both metric and non-metric units.
    });

    // Add the widget to the bottom left corner of the view
    mview.ui.add(scaleBar, {
        position: "bottom-right"
    });

    window.onresize = function (event) {

        chart.destroy();
        //surfaceLeg.destroy();
        drawChartSvg(chartData);
    };

    callSoe();
    function callSoe() {
        // Do the SOE query.
        var soeurl = ejscreenSOEurl;
        if (intype == "city") soeurl = ejcitySOEurl;
        esriRequest(soeurl,{
            query: content,
            responseType: "json",
            callbackParamName: "callback"
        }, { "usePost": true }).then(processResult).otherwise(error);
    }


    function getDataobj() {
        var lookuptableurl = ejscreenservice + "/" + lookuptableindex;
        var queryTask = new QueryTask(lookuptableurl);
        var query = new Query();

        query.returnGeometry = false;

        query.outFields = ["*"];
        var dirty = (new Date()).getTime();
        query.where = "FOR_DATA='Y' AND " + dirty + "=" + dirty;

        queryTask.execute(query).then(function (featset) {
            if (featset.features.length > 0) {
                var fetcount = featset.features.length;
                var colJson = {};
                for (var m = 0; m < fetcount; m++) {
                    var cat = dojo.trim(featset.features[m].attributes["IndexCode"]);
                    var colname = dojo.trim(featset.features[m].attributes["FIELD_NAME"]);
                    var desc = dojo.trim(featset.features[m].attributes["SHORT_DESC"]);
                    var rptdesc = dojo.trim(featset.features[m].attributes["RPT_NAME"]);
                    var pdfname = dojo.trim(featset.features[m].attributes["PDF_NAME"]);
                    var isnata = dojo.trim(featset.features[m].attributes["IS_NATA"]);
                    var csvname = dojo.trim(featset.features[m].attributes["CSV_NAME"]);

                    ejdataobj[colname] = {};
                    ejdataobj[colname].description = desc;
                    ejdataobj[colname].contenttype = cat;
                    ejdataobj[colname].rptname = rptdesc;
                    ejdataobj[colname].csvname = csvname;

                    ejdataobj[colname].pdfname = pdfname;
                    if (isnata == "Y") ejdataobj[colname].isnata = true;
                    else ejdataobj[colname].isnata = false;
                    //console.log(colname);
                    
                }
                callSoe();
            }

        }).otherwise(function (error) {
            console.log("error occurred: " + error);
        });
    }


    function processResult(response) {
        var result = response.data;
        if (result["messageType"]) {
            document.getElementById("EJindexDiv").innerHTML = result["message"];
            document.getElementById("loadingDiv").style.display = "none";
            return false;
        }

        var reportxmlstr = "<?xml version='1.0'?><Elements>";
        var tableejindex = "<table width='100%' cellspacing='0' cellpadding='0' border='0'><tr><th style='text-align: center;'>Selected Variables</th><th style='text-align: center;'>Percentile in State</th><th style='text-align: center;'>Percentile in USA</th></tr>";
        tableejindex = tableejindex + "<tr><th align='left' colspan='4'>Environmental Justice Indexes</th></tr>";
       
        var tablerawstr = "<table width='100%' cellspacing='0' cellpadding='0' border='0'><tr style='text-align: center;'><th rowspan='2'>Selected Variables</th><th style='text-align: center;' rowspan='2'>Value</th><th style='text-align: center;' colspan='2'>State</th><th style='text-align: center;' colspan='2'>USA</th></tr>";
        if (getWinWidth() > 700) {
            tablerawstr += "<tr style='text-align: center;'><th style='text-align: center;'>Average</th><th style='text-align: center;'>Percentile</th><th style='text-align: center;'>Average</th><th style='text-align: center;'>Percentile</th></tr>";
        } else{
            tablerawstr += "<tr style='text-align: center;'><th style='text-align: center;'>Avg.</th><th style='text-align: center;'>%tile</th><th style='text-align: center;'>Avg.</th><th style='text-align: center;'>%tile</th></tr>";
        }
        var tableenv = "<tr><th align='left' colspan='8'>Pollution and Sources</th></tr>";
        var tabledemog = "";
        var tablefacility = "<table width='100%' cellspacing='0' cellpadding='0' border='0'><tr align='left'><th colspan='2'>Sites reporting to EPA</th></tr>";
        tablefacility = tablefacility + "<tr><td align='left' width='75%'>Superfund NPL</td><td align='center'>" + result["NUM_NPL"] + "</td></tr>";
        tablefacility = tablefacility + "<tr><td align='left'>Hazardous Waste Treatment, Storage, and Disposal Facilities (TSDF)</td><td align='center'>" + result["NUM_TSDF"] + "</td></tr>";
        //tablefacility = tablefacility + "<tr><td align='left'>National Pollutant Discharge Elimination System (NPDES)</td><td align='center'>" + result["NUM_NPDES"] + "</td></tr>";
        tablefacility = tablefacility + "</table>";
        document.getElementById("version").innerHTML = versionText;
        
        var chartStates = [];
        //var chartRegs = [];
        var chartUSA = [];
        var chartLabels = [];

        for (var f in ejdataobj) {
            var fielddesc = ejdataobj[f].description;
            if (ejdataobj[f].rptname) fielddesc = ejdataobj[f].rptname;
            if (ejdataobj[f].contenttype == "P_EJ2") {
                if (ejdataobj[f].pdfname) {
                    //var stpctvalue, regpctvalue, natpctvalue;
                    var stpctvalue, natpctvalue;
                    var pdffld = ejdataobj[f].pdfname;
                    var stpdffld = "S_P2_" + pdffld;
                    //var regpdffld = "R_P_" + pdffld;
                    var natpdffld = "N_P2_" + pdffld;
                    var stpct = result[stpdffld];                  
                    stpctvalue= (stpct === null || stpct === undefined? "N/A" :stpct.replace("%", ""));
                   
                    //var regpct = result[regpdffld];
                    //regpctvalue = (regpct === null ? "N/A" :regpct.replace("%", ""));
                  
                    var natpct = result[natpdffld];
                    natpctvalue =(natpct === null || natpct === undefined? "N/A" :natpct.replace("%", ""));
                  
                    chartLabels.push(ejdataobj[f].description);
                    chartStates.push(Number(stpctvalue));
                    //chartRegs.push(Number(regpctvalue));
                    chartUSA.push(Number(natpctvalue));
                    //alert(stpctvalue + ", " + regpctvalue + ", " + natpctvalue);
                    //if (f == "D_PTSDF_2") fielddesc = fielddesc + "<sup>+</sup>";
                    var stpcttext = "";
                    //var regpcttext = "";
                    var natpcttext = "";

                    stpcttext = (stpct === null ? "N/A" :stpct);

                    //regpcttext = (regpct=== null ? "N/A" :regpct);

                    natpcttext = (natpct=== null ? "N/A" :natpct);

                    tableejindex = tableejindex + "<tr><td align='left'>" + fielddesc + "</td><td align='center'>";
                    tableejindex = tableejindex + stpcttext + "</td><td align='center'>";
                    //tableejindex = tableejindex + regpcttext + "</td><td align='center'>";
                    tableejindex = tableejindex + natpcttext + "</td></tr>";

                    reportxmlstr = reportxmlstr + "<" + stpdffld + ">" + stpcttext + "</" + stpdffld + ">";
                    //reportxmlstr = reportxmlstr + "<" + regpdffld + ">" + regpcttext + "</" + regpdffld + ">";
                    reportxmlstr = reportxmlstr + "<" + natpdffld + ">" + natpcttext + "</" + natpdffld + ">";
                }
            } else if (ejdataobj[f].contenttype == "P_ENV") {

                if (ejdataobj[f].pdfname) {
                    var pdffld = ejdataobj[f].pdfname;
                    var rawpdffld = "RAW_E_" + pdffld;
                    var stpctfld = "S_E_" + pdffld + "_PER";
                    //var regpctfld = "R_E_" + pdffld + "_PER";
                    var natpctfld = "N_E_" + pdffld + "_PER";
                    var stavgfld = "S_E_" + pdffld;
                    //var regavgfld = "R_E_" + pdffld;
                    var natavgfld = "N_E_" + pdffld;
                    var stpct = result[stpctfld];

                    var stpctvalue;
                    if ((stpct == null) || (stpct == "N/A")) {
                        stpctvalue = "N/A";
                    } else {
                        stpctvalue = stpct.replace("%", "");
                        stpctvalue = Number(stpctvalue);
                    }
                    //var regpct = result[regpctfld];
                    //var regpctvalue;
                    //if ((regpct == "N/A") || (regpct == null)) {
                        //regpctvalue = "N/A";
                   // } else {
                       // regpctvalue = regpct.replace("%", "");
                       // regpctvalue = Number(regpctvalue);
                   // }
                    var natpct = result[natpctfld];
                    var natpctvalue;
                    if ((natpct == "N/A") || (natpct == null)) natpctvalue = "N/A";
                    else {
                        natpctvalue = natpct.replace("%", "");
                        nattpctvalue = Number(natpctvalue);
                    }

                    var stpcttext = stpctvalue;
                    //var regpcttext = regpctvalue;
                    var natpcttext = natpctvalue;
                    /*if ((stpctvalue != "N/A") && (parseInt(stpctvalue) >= 95)) {
                    stpcttext = "<font color='red'>" + stpctvalue + "</font>";
                    } else {
                    stpcttext = stpctvalue;
                    }
                   // if ((regpctvalue != "N/A") && (parseInt(regpctvalue) >= 95)) {
                    //regpcttext = "<font color='red'>" + regpctvalue + "</font>";
                   // } else {
                   // regpcttext = regpctvalue;
                   // }
                    if ((natpctvalue != "N/A") && (parseInt(natpctvalue) >= 95)) {
                    natpcttext = "<font color='red'>" + natpctvalue + "</font>";
                    } else {
                    natpcttext = natpctvalue;
                    }*/
                    if (ejdataobj[f].isnata) {
                        //fielddesc = "*" + fielddesc;
                        //if (regpctvalue != "N/A") {
                           // regpcttext = getNATApctText(regpctvalue);

                       // }
                        if (natpctvalue != "N/A") {
                            natpcttext = getNATApctText(natpctvalue);

                        }
                    }
                    //if (f == "PTSDF") fielddesc = fielddesc + "<sup>+</sup>";
                    tableenv = tableenv + "<tr><td align='left'>" + fielddesc + "</td><td align='right'>" + result[rawpdffld] + "</td>";
                    tableenv = tableenv + "<td align='right'>" + result[stavgfld] + "</td><td align='center'>" + stpcttext + "</td>";
                    //tableenv = tableenv + "<td align='right'>" + result[regavgfld] + "</td><td align='center'>" + regpcttext + "</td>";
                    tableenv = tableenv + "<td align='right'>" + result[natavgfld] + "</td><td align='center'>" + natpcttext + "</td></tr>";
                    reportxmlstr = reportxmlstr + "<" + stpctfld + ">" + stpcttext + "</" + stpctfld + ">";
                    //reportxmlstr = reportxmlstr + "<" + regpctfld + ">" + regpcttext + "</" + regpctfld + ">";
                    reportxmlstr = reportxmlstr + "<" + natpctfld + ">" + natpcttext + "</" + natpctfld + ">";
                    reportxmlstr = reportxmlstr + "<" + rawpdffld + ">" + result[rawpdffld] + "</" + rawpdffld + ">";
                    reportxmlstr = reportxmlstr + "<" + stavgfld + ">" + result[stavgfld] + "</" + stavgfld + ">";
                    //reportxmlstr = reportxmlstr + "<" + regavgfld + ">" + result[regavgfld] + "</" + regavgfld + ">";
                    reportxmlstr = reportxmlstr + "<" + natavgfld + ">" + result[natavgfld] + "</" + natavgfld + ">";
                }

            } else if (ejdataobj[f].contenttype == "P_DEM") {


                if (ejdataobj[f].pdfname) {
                    var pdffld = ejdataobj[f].pdfname;
                    var rawpdffld = "RAW_D_" + pdffld;
                    var stpctfld = "S_D_" + pdffld + "_PER";
                    //var regpctfld = "R_D_" + pdffld + "_PER";
                    var natpctfld = "N_D_" + pdffld + "_PER";
                    var stavgfld = "S_D_" + pdffld;
                    //var regavgfld = "R_D_" + pdffld;
                    var natavgfld = "N_D_" + pdffld;
                    var stpct = result[stpctfld];
                    var stpctvalue;
                    if ((stpct == null) || (stpct == "undefined") || (stpct == "N/A")) {
                        stpctvalue = "N/A";
                    } else {
                        stpctvalue = stpct.replace("%", "");
                        stpctvalue = Number(stpctvalue);
                    }
                    //var regpct = result[regpctfld];
                    //var regpctvalue;
                    //if ((regpct == "N/A") || (regpct == null)) regpctvalue = "N/A";
                    //else {
                       // regpctvalue = regpct.replace("%", "");
                       // regpctvalue = Number(regpctvalue);
                    //}
                    var natpct = result[natpctfld];
                    var natpctvalue;
                    if ((natpct == "N/A") || (natpct == undefined) || (natpct == null)){
                        natpctvalue = "N/A";
                    } 
                    else {
                        natpctvalue = natpct.replace("%", "");
                        nattpctvalue = Number(natpctvalue);
                    }

                    var stpcttext = stpct;
                    //var regpcttext = regpct;
                    var natpcttext = natpct;
                    if ((stpct == null) || (stpct == undefined) || (stpct == "N/A")) {
                        stpcttext = "N/A";
                    } 
                    if ((natpct == "N/A") || (natpct == undefined) || (natpct == null)){
                        natpcttext = "N/A";
                    } 
                    /*if ((stpctvalue != "N/A") && (parseInt(stpctvalue) >= 95)) {
                    stpcttext = "<font color='red'>" + stpct + "</font>";
                    } else {
                    stpcttext = stpct;
                    }
                    //if ((regpctvalue != "N/A") && (parseInt(regpctvalue) >= 95)) {
                    //regpcttext = "<font color='red'>" + regpct + "</font>";
                    //} else {
                    //regpcttext = regpct;
                   // }
                    if ((natpctvalue != "N/A") && (parseInt(natpctvalue) >= 95)) {
                    natpcttext = "<font color='red'>" + natpct + "</font>";
                    } else {
                    natpcttext = natpct;
                    }*/

                    if ((result[stavgfld] == null) || (result[stavgfld] == undefined) || (result[stavgfld] == "N/A")) {
                        result[stavgfld] = "N/A";
                    } 
                    if (( result[natavgfld] == "N/A") || ( result[natavgfld] == undefined) || ( result[natavgfld] == null)){
                        result[natavgfld] = "N/A";
                    } 
                    tabledemog = tabledemog + "<tr><td align='left'>";
                    tabledemog = tabledemog + fielddesc + "</td><td align='right'>" + result[rawpdffld] + "</td>";
                    tabledemog = tabledemog + "<td align='right'>" + result[stavgfld] + "</td><td align='center'>" + stpcttext + "</td>";
                    //tabledemog = tabledemog + "<td align='right'>" + result[regavgfld] + "</td><td align='center'>" + regpcttext + "</td>";
                    tabledemog = tabledemog + "<td align='right'>" + result[natavgfld] + "</td><td align='center'>" + natpcttext + "</td></tr>";

                   
                    reportxmlstr = reportxmlstr + "<" + stpctfld + ">" + stpcttext + "</" + stpctfld + ">";
                    //reportxmlstr = reportxmlstr + "<" + regpctfld + ">" + regpcttext + "</" + regpctfld + ">";
                    reportxmlstr = reportxmlstr + "<" + natpctfld + ">" + natpcttext + "</" + natpctfld + ">";
                    reportxmlstr = reportxmlstr + "<" + rawpdffld + ">" + result[rawpdffld] + "</" + rawpdffld + ">";
                    reportxmlstr = reportxmlstr + "<" + stavgfld + ">" + result[stavgfld] + "</" + stavgfld + ">";
                    //reportxmlstr = reportxmlstr + "<" + regavgfld + ">" + result[regavgfld] + "</" + regavgfld + ">";
                    reportxmlstr = reportxmlstr + "<" + natavgfld + ">" + result[natavgfld] + "</" + natavgfld + ">";
                }
            }


        }
        reportxmlstr = reportxmlstr + "<NUM_NPL>" + result["NUM_NPL"] + "</NUM_NPL>";
        reportxmlstr = reportxmlstr + "<NUM_TSDF>" + result["NUM_TSDF"] + "</NUM_TSDF>";
        reportxmlstr = reportxmlstr + "<NUM_NPDES>" + result["NUM_NPDES"] + "</NUM_NPDES>";
        reportxmlstr = reportxmlstr + "</Elements>";
        tableejindex = tableejindex + "</table>";
        tablerawstr = tablerawstr + tableenv;
        //tablerawstr = tablerawstr + "<tr><td colspan='8' height='2px'>&nbsp;</td></tr>";
        tablerawstr = tablerawstr + "<tr><th align='left' colspan='8'>Socioeconomic Indicators</th></tr>";
        tablerawstr = tablerawstr + tabledemog + "</table>";

        headerstr = headerstr + "<br />" + result["placename"] + ", EPA Region " + result["epaRegion"] + "<br />";

        var totpop = Number(result["totalPop"]).toFixed(0);
        var totpop_comma = totpop.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
        populationstr = "Approximate Population: " + totpop_comma;
        var inputarea = Number(result["inputAreaMiles"]);
        var inputareastr = "Input Area (sq. miles): " + inputarea.toFixed(2);
        var zeropopbg = result["statLayerZeroPopCount"];
        var subnotestr = "";
        var subnotetext = "";
        if (zeropopbg != "0") {
            subnotestr = "<br/><span style='font-size: 10pt; font-weight: normal;'>(The study area contains " + zeropopbg + " blockgroup(s) with zero population.)</span>";
            subnotetext = " (The study area contains " + zeropopbg + " blockgroup(s) with zero population.)";
        }

        dojo.byId('headerDiv').innerHTML = headerstr + populationstr + "<br /> " + inputareastr + subnotestr;
        dojo.byId('EJindexDiv').innerHTML = tableejindex;
        dojo.byId('facilityDiv').innerHTML = tablefacility;
        dojo.byId('envdemogDiv').innerHTML = tablerawstr;
        document.getElementById("loadingDiv").style.display = "none";


        chartData = {
            "stateVals": chartStates,
            //"regionVals": chartRegs,
            "nationVals": chartUSA,
            "labels": chartLabels
        };
        drawChartSvg(chartData);
    }

    function drawChartSvg(chartDataObj) {
        var doState, doRegion, doNation;
        chartDataObj.stateVals == null ? doState = false : doState = true;
        //chartDataObj.regionVals == null ? doRegion = false : doRegion = true;
        chartDataObj.nationVals == null ? doNation = false : doNation = true;

        var xLabels = [];
        for (var i = 0; i < chartDataObj.labels.length; i++) {
            //alert(chartDataObj.labels[i] + ": " + chartDataObj.stateVals[i] + ", " + chartDataObj.regionVals[i] + ", " + chartDataObj.nationVals[i])
            xLabels.push({ value: i + 1, text: chartDataObj.labels[i] });
        }

        levelegObj = {
            state: { color: "#ff9966", highlight: "#ff5500", label: "State Percentile" },
            //region: { color: "#99cc66", highlight: "#557733", label: "Regional Percentile" },
            nation: { color: "#3399ff", highlight: "#2266BB", label: "USA Percentile" }

        }

        chart = new dojox.charting.Chart("chartNode", {
            title: "EJ Index for the Selected Area Compared to All People's Blockgroups in the State/US",
            titlePos: "top",
            titleGap: 0,
            titleFont: "normal normal normal 12pt Tahoma",
            titleFontColor: "black",
            htmlLabels: false,
            margins: { l: 0, t: 0, r: 0, b: 0 }

        });
        var r = 90;
        var gappixel = 4;
        var browserWidth = getWinWidth();
        
        if (browserWidth > 700) {
            r = 30;
            gappixel = 12;
        }
        //main chart
        chart.addPlot("default", {
            type: dojox.charting.plot2d.ClusteredColumns,
            markers: true,
            gap: gappixel
        });
        //background lines on chart
        chart.addPlot("grid", { type: dojox.charting.plot2d.Grid,
            hMajorLines: true,
            hMinorLines: false,
            vMajorLines: false,
            vMinorLines: false,
            majorHLine: { color: "#D3D3D3", width: 1 },
            renderOnAxis: false
        });

        chart.addAxis("x", { title: "EJ Indexes", htmlLabels: false, titleOrientation: "away", titleFont: "normal normal normal 9pt Verdana", labels: xLabels, dropLabels: false, rotation: r, font: "normal normal normal 7pt Verdana", fontColor: "#000000", majorTick: { length: 0 }, minorTick: { length: 0 }, majorTickStep: 1, minorTickStep: 0, minorLabels: false }); //set major tick to 1, minor to 0 so draws every step of data but doesn't fill in decimals between integers.
        chart.addAxis("y", { title: "Percentile", titleFont: "normal normal normal 9pt Verdana", vertical: true, fixLower: "major", fixUpper: "minor", htmlLabels: false, titleOrientation: "axis", font: "normal normal normal 7pt Verdana", fontColor: "#000000", min: 0, max: 101, majorTickStep: 25, minorTicks: false, majorTick: { length: 0 }, stroke: { color: "#FFFFFF", width: 1} }); //gridline fix: set max to 101 and fixUpper to minor ticks. 100 cuts off top grid line. 101 adds bit of padding.
        
        //if (doRegion) {
            //chart.addSeries(levelegObj.region.label, chartDataObj.regionVals, { stroke: 'white', fill: levelegObj.region.color });
       // }
        if (doNation) {
            chart.addSeries(levelegObj.nation.label, chartDataObj.nationVals, { stroke: 'white', fill: levelegObj.nation.color });
        }
        if (doState) {
            chart.addSeries(levelegObj.state.label, chartDataObj.stateVals, { stroke: 'white', fill: levelegObj.state.color });
        }

        new dojox.charting.action2d.Highlight(chart, "default");
        //	           new dojox.charting.action2d.Highlight(chart, "default", {
        //	               highlight: function (o) {
        //	                   for (var i in levelegObj) {
        //	                       if (levelegObj[i].color.toUpperCase() == o.toHex().toUpperCase()) {
        //	                           return dojo.colorFromHex(levelegObj[i].highlight);
        //	                       }
        //	                   }
        //	               }
        //	           });
        var pattern = "<span style='font-family:Verdana;font-size: 9px !important'><strong>{0}</strong><br>{1}:&nbsp;{2}</span>";
        var tip = new dojox.charting.action2d.Tooltip(chart, "default", { text:
                function (o) {

                    return dojo.replace(pattern, [o.run.name, xLabels[o.index].text, o.y]);
                }

        }
                );
        chart.render();
        //dojo chart Legend object doesn't create single graphic, make custom legend for export
        // Create a GFX surface
        // Arguments:  node, width, height                

        /*surfaceLeg = dojox.gfx.createSurface("legendSurfaceDiv", 800, 20);
        //params for boxes and text on the legend
        var legObj = {
            box: {
                height: 10,
                width: 10,
                offsetY: 5
            },
            text: {
                family: "Verdana",
                size: "8pt",
                color: "#000000",
                weight: "normal",
                offsetY: 15
            }
        }

        // Create a square
        surfaceLeg.createRect({ x: 105, y: legObj.box.offsetY, width: legObj.box.width, height: legObj.box.height }).setFill(levelegObj.state.color).setStroke(levelegObj.state.color);
        surfaceLeg.createText({ x: 120, y: legObj.text.offsetY, text: levelegObj.state.label, align: "start" }).
				setFont({ family: legObj.text.family, size: legObj.text.size, weight: legObj.text.weight }).
				setFill(legObj.text.color);

        // Create a square
        surfaceLeg.createRect({ x: 215, y: legObj.box.offsetY, width: legObj.box.width, height: legObj.box.height }).setFill(levelegObj.region.color).setStroke(levelegObj.region.color);
        surfaceLeg.createText({ x: 230, y: legObj.text.offsetY, text: levelegObj.region.label, align: "start" }).
				setFont({ family: legObj.text.family, size: legObj.text.size, weight: legObj.text.weight }).
				setFill(legObj.text.color);

        // Create a square
        surfaceLeg.createRect({ x: 345, y: legObj.box.offsetY, width: legObj.box.width, height: legObj.box.height }).setFill(levelegObj.nation.color).setStroke(levelegObj.nation.color);
        surfaceLeg.createText({ x: 360, y: legObj.text.offsetY, text: levelegObj.nation.label, align: "start" }).
				setFont({ family: legObj.text.family, size: legObj.text.size, weight: legObj.text.weight }).
				setFill(legObj.text.color);

    */
    }

    function getNATApctText(inpct) {
        var outpcttext = "";


        if (inpct >= 95) {
            outpcttext = "95-100th";
        } else if ((inpct >= 90) && (inpct < 95)) {
            outpcttext = "90-95th";
        } else if ((inpct >= 80) && (inpct < 90)) {

            outpcttext = "80-90th";

        } else if ((inpct >= 70) && (inpct < 80)) {

            outpcttext = "70-80th";

        } else if ((inpct >= 60) && (inpct < 70)) {

            outpcttext = "60-70th";

        } else if ((inpct >= 50) && (inpct < 60)) {

            outpcttext = "50-60th";

        } else if ((inpct >= 0) && (inpct < 50)) {

            outpcttext = "&lt;50th";

        }
        return outpcttext
    }

    function getEnvText(invalue, digsig) {
        invalue = parseFloat(invalue);
        digsig = parseInt(digsig);
        var invaluestr = roundNumber(invalue, 0) + "";
        var dint = invaluestr.length;

        var v = 0;
        if (invalue > 0) {
            if (dint <= 2) {
                var dig = digsig - 1 - Math.floor(Math.log(Math.abs(invalue)) / Math.log(10));
                //v = invalue.toFixed(dig);
                v = roundNumber(invalue, dig);
                //alert(invalue + ": " + dig);
                //v = Math.round(invalue,digsig - 1 - (parseInt(Math.log(Math.abs(invalue))) / Math.log(10)));
            } else {
                var m = dint - 2;
                v = Math.round(invalue / Math.pow(10, m)) * Math.pow(10, m);
            }
        }
        return v;
    }
    function error(err) {
        document.getElementById("loadingDiv").style.display = "none";
        alert("error occurred: " + err);
    }
    function roundNumber(num, dec) {
        var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
        return result;
    }
    function drawFeature(gjson) {
        if (hasBuffer) zoomstatus = false;
        else zoomstatus = true;
        var geometry;
        var geom = JSON.parse(gjson);
        if (geom.x) {

            var pntgeom = Point.fromJSON(geom);
            var mgeom = webMercatorUtils.geographicToWebMercator(pntgeom);
            var tgraphic = new Graphic(mgeom, pointsym);
            mview.graphics.add(tgraphic);
            geometry = pntgeom;
            if (zoomstatus) {
                mview.center = mgeom;
                mview.zoom = 10;
            }
        } else if (geom.rings) {

            var polygeom = Polygon.fromJSON(geom);

            var mgeom = webMercatorUtils.geographicToWebMercator(polygeom);
            var tgraphic = new Graphic(mgeom, polysym);
            mview.graphics.add(tgraphic);
            geometry = mgeom;
            if (zoomstatus) {
                var uExtent = mgeom.extent.expand(2);
                mview.extent = uExtent;
            }



        } else if (geom.paths) {

            var linegeom = Polyline.fromJSON(geom);
            var mgeom = webMercatorUtils.geographicToWebMercator(linegeom);
            geometry = mgeom;
            var tgraphic = new Graphic(mgeom, linesym);
            mview.graphics.add(tgraphic);
            if (zoomstatus) {
                var uExtent = mgeom.extent.expand(2);
                mview.extent = uExtent;
            }

        }

        if (hasBuffer) {
            doBuffer(geometry);
        }
    }



    function doBuffer(geometry) {
            if (radius > 0) {
                var buffer = geometryEngine.geodesicBuffer([geometry], [radius], bunitcode,true);
                
                var bufgraphic = new Graphic({
                    geometry: buffer[0],
                    symbol: polysym
                });
                mview.graphics.add(bufgraphic);
                mview.extent = buffer[0].extent.expand(2);
            }

    }


    function drawID(aid, alevel) {
        var lindex = typelookup[alevel].layer;
        var bgurl = typelookup[alevel].url + "/" + lindex;
        var idfield = typelookup[alevel].idfield;
        var queryTask = new QueryTask(bgurl);
        var query = new Query();

        query.returnGeometry = true;
        query.outSpatialReference = new SpatialReference({ wkid: 102100 }); ;
        query.outFields = [idfield];
        query.where = idfield + "='" + aid + "'";
        queryTask.execute(query).then(function (featset) {
            if (featset.features.length > 0) {
                var polysym = { // symbol used for polygons
            type: "simple-fill", // autocasts as new SimpleMarkerSymbol()
            color: "rgba(0, 255, 0, 0.25)",
            style: "solid",
            outline: {
              color: "red",
              width: 2
            }
          };
                var graphic = new Graphic(featset.features[0].geometry, polysym);
                mview.graphics.add(graphic);
                var countyextent = featset.features[0].geometry.extent.expand(2);
                mview.extent = countyextent;
            }

        }).otherwise(function(error) {
            alert("error occurred: " + error);

        });
    }
    function getWinWidth() {
        var myWidth = 0;
        if (typeof (window.innerWidth) == 'number') {
            //Non-IE
            myWidth = window.innerWidth;
        } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
            //IE 6+ in 'standards compliant mode'
            myWidth = document.documentElement.clientWidth;
        } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
            //IE 4 compatible
            myWidth = document.body.clientWidth;
        }
        return myWidth;
    }    
});




        
    </script>
  </head>

  <body>	
  
  <div id="loadingDiv"><img src="images/loading_black.gif" alt="loading..." />Please wait...</div>
 <div class="container-fluid" style="background-color: White;">
 <div class="panel-body">
  <div class="row">
    <div class="col-sm-4">
    <img src="images/epalogo_ej.png" alt="EPA" title="EPA" />
    </div>
    <div class="col-sm-4"  style="font-weight: bold; font-size: 14pt; font-family: Tahoma;text-align: center;">
    EJScreen Report (<span id="version"></span>)
    <div  id="headerDiv" style="font-size: 11pt;"></div>
    </div>
    <div class="col-sm-4" style="text-align: right;">
     <img src="images/ejlogo.png" alt="EPA EJScreen" title="EPA EJScreen" />
     </div>
   </div>

    <div class="row padding" id="EJindexDiv">
    </div>

 <div class="row padding">
        <div id="chartNode" style="width: 100%; height: 400px;"></div>
</div>
<div class="row padding" style="text-align: center;">
        <div id="legendSurfaceDiv" style="border: 0px solid #ccc;width: 100%;">
        <svg width="12" height="12">
        <rect width="10" height="10" style="fill:rgb(255, 153, 102);stroke-width:1;stroke:rgb(255, 153, 102)">
        </rect>
        </svg>
        <span class="legendtext">State Percentile</span>
        
        <svg width="12" height="12">
        <rect width="10" height="10" style="fill:rgb(51, 153, 255);stroke-width:1;stroke:rgb(51, 153, 255)">
        </rect>
        </svg>
        <span class="legendtext">National Percentile</span>
        </div> 
</div>
       <div class="row padding">
        
        <div style="font-size: 8pt; color: navy; font-family: sans-serif;">
        This report shows the values for environmental and demographic indicators and EJScreen indexes. It shows environmental and demographic raw data (e.g., the estimated concentration of ozone in the air), and also shows what percentile each raw data value represents. These percentiles provide perspective on how the selected block group or buffer area compares to the entire state or nation. For example, if a given location is at the 95th percentile nationwide, this means that only 5 percent of the US population has a higher block group value than the average person in the location being analyzed. The years for which the data are available, and the methods used, vary across these indicators. Important caveats and uncertainties apply to this screening-level information, so it is essential to understand the limitations on appropriate interpretations and applications of these indicators. Please see EJScreen documentation for discussion of these issues before using reports.
        </div>
        <hr />
        <br />
		
        <div id='map' style="position:relative;width:100%;height:450px; border: 1px solid black;"></div>
       
        </div>
        <div class="row padding">
        <div id="facilityDiv" style="text-align:center;"></div>
        <br />
        <div id="envdemogDiv" style="text-align:center;"></div>

        <div style="font-size: 8pt; color: navy; font-family: sans-serif;">
            *Diesel particulate matter index is from the EPA's Air Toxics Data Update, which is the Agency's ongoing, comprehensive evaluation of air 
            toxics in the United States. This effort aims to prioritize air toxics, emission sources, and locations of 
            interest for further study. It is important to remember that the air toxics data presented here provide broad 
            estimates of health risks over geographic areas of the country, not definitive risks to specific individuals or 
            locations.  More information on the Air Toxics 
            Data Update can be found at: <a href="https://www.epa.gov/haps/air-toxics-data-update" target="_blank">https://www.epa.gov/haps/air-toxics-data-update.</a>
        </div>
		<br />
        For additional information, see: 
        <a href="http://www.epa.gov/environmentaljustice" target="_blank">
        www.epa.gov/environmentaljustice
        </a>
        <hr />
		<div style="font-size: 8pt; color: navy; font-family: sans-serif;">
        EJScreen is a screening tool for pre-decisional use only. It can help identify areas that may warrant additional consideration, analysis, or outreach. It does not provide a basis for decision-making, but it may help identify potential areas of EJ concern. Users should keep in mind that screening tools are subject to substantial uncertainty in their demographic and environmental data, particularly when looking at small geographic areas. Important caveats and uncertainties apply to this screening-level  information,  so  it  is  essential  to  understand  the  limitations  on  appropriate  interpretations  and  applications  of  these  indicators.  Please  see EJScreen documentation for discussion of these issues before using reports.  This screening tool does not provide data on every environmental impact and demographic factor that may be relevant to a particular location. EJScreen outputs should be supplemented with additional information and local knowledge before taking any action to address potential EJ concerns.
        </div> 
        </div>
</div>
</div>      
	</body>
</html>
