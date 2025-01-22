<%@ Page Language="VB" AutoEventWireup="false" CodeFile="EJscreen_mobile.aspx.vb" Inherits="EJscreen_mobile"  ValidateRequest="false" %>
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>EJScreen Community Report</title>
    <!-- JS libraries -->
    <script src="javascript/apexcharts.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>

    <!-- W3.CSS (light-weight, responsive CSS) -->
    <link rel="stylesheet" href="stylesheets/w3.css" />
    <link rel="stylesheet" href="stylesheets/responsive-styling.css" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Heebo:wght@500;600"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;700&display=swap"
      rel="stylesheet"
    />
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans&display=swap" rel="stylesheet">

    <style>
      root {
        --epa-blue-base: #005ea2;
        --epa-blue-light-1: #aacdec;
        --epa-blue-light: #4f97d1;
        --epa-green-base: #5e9f69;
        --epa-green-light: #86b69e;
        --epa-secondary-light: #f2938c;
        --epa-accent-warm-base: #fa9441;

        --design-blue-base: #0E6CB6;
        --design-green-base: #3A7E11;
        --design-gauge-background: #6c6d70;
        --design-language-table-header: #3A7E11;
        --design-language-table-alt-row: #dfeed4;
        --design-lingiso-background: #d8eeff;
        --design-age-section-header: #253f8e;
        --design-data-yellow: #fff101;
        --design-data-orange: #faba59;
      }

      /* Navbar styling begin */
      #navbar-container { 
        display: block; 
        height: 50px; 
        width: 100%; 
        padding: 11px; 
        background-color: #444444ee; 
        position: fixed; 
        top: 0; 
        font-size: 16px; 
        font-weight: bold; 
        font-family: Arial, sans-serif; 
        color: white; 
        z-index: 1000;
      }

      #navbar-dropdown-button { 
        float: right; 
        width: 32px; 
        height: 30px;
      }

      .dropdown--shown { 
        border-top: 1px solid grey;
        background-color: #444444ee;
        width: 100%;
        position: fixed;
        top: 50px;
        left: 0;
        padding: 0 12px;
        max-height: 80vh;
        overflow: auto;
      }

      .dropdown--hidden {
        display: none;
      }

      #navbar ol ol { 
        font-weight: normal;
      }

      #navbar-container a { 
        text-decoration: none;
      }

      .anchor {
        display: block;
        position: relative;
        top: -50px;
        visibility: hidden;
      }
      /* Navbar styling end */

      #header-section { 
        background-image: url('images/ejreport/header_background.png');
        background-size: 100% 100%;
      }

      #epa-logo { 
        display: block; 
        width:25%; 
        max-width: 135px; 
        float: right; 
        margin-right: 9%; 
        margin-top: 10px;
      }

      h1 { 
        font-family: Arial, sans-serif;
        font-style: normal;
        font-variant: normal;
        font-weight: 900;
        text-align: center;
        word-wrap: break-word;
        margin: 0 7% 0 5%;
        color: white;
      }

      h2 { 
        font-family: Arial, sans-serif;
        font-style: normal;
        font-variant: normal;
        font-weight: 700;
        text-align: center;
        word-wrap: break-word;
        margin: 0 7% 0 5%;
        color: white;
      }

      h3 { 
        font-weight: bold;
        padding-top: 10px;
        font-family: Arial, sans-serif;
        text-transform: uppercase;
      }

      #header-caption {
        color: white;
        font-family: heebo, Arial, sans-serif;
        text-align: center;
        margin: 8px 8% 0 5%;
        padding-bottom: 30px;
		font-size: 25px;
      }

      #geo-info-bar { 
        background-color: #0E6CB6;
        margin-top: 30px;
        color: white;
        font-weight: bold;
      }

      .county-state-display { 
        font-family: Arial, sans-serif;
        text-align: center;
        font-weight: bold;
        margin: auto;
        padding: 20px;
        width: 85%
      }

      #area-details { 
        font-family: heebo, Arial, sans-serif;
        margin: auto;
        padding: 15px;
        text-align: center;
        width: 50%
      }

      #page-1-left { 
        width: 55%;
        padding: 0;
      }

      #map { 
        aspect-ratio: 1 / 0.8;
        width: 100%;
      }

      #page-1-right { 
        width: 45%;
        padding: 0;
      }

      .page-1-header { 
        font-family: Arial, sans-serif;
        text-align: center;
        color: white;
        font-weight: bold;
      }

      #language-table-header {
        color: black; 
        padding-top: 15px;
        font-family: Arial, sans-serif;
        margin: 0;
        font-weight: bold;
      }

      #community-info-header { 
        background-color: #3A7E11;
        padding: 10px;
      }

      #community-info-table { 
        font-family: Oswald, Arial, sans-serif;
        font-weight: bold;
        text-align: center;
        background-image: url('images/ejreport/topdown_streets_backdrop.png'); 
        background-position-x: -290px; 
        background-size: 100% 125%; 
        background-color: #eee; 
        table-layout: fixed;
        overflow: visible;
      }

      #community-info-table td { 
        width: 25%;
      }

      .gauge-value-label { 
        font-family: Oswald, Arial, sans-serif;
        font-weight: bold;
      }

      #race-header { 
        background-color: #0E6CB6;
        padding: 10px;
      }

      #race-table { 
        font-family: Oswald, Arial, sans-serif;
        font-weight: bold;
        text-align: center;
        margin-top: 10px;
        /* line-height: 16px; */
        table-layout: fixed;
        overflow: visible;
        word-wrap: break-word;
      }

      #age-header { 
        background-color: #0E6CB6;
        padding: 10px;
      }

      .page-2-header-container {
        background-color: #0E6CB6;
        color: white;
        text-align: center;
        padding: 20px 32px 5px 32px;
      }

      .page-2-header-caption,
      .page-2-subheader-caption { 
        font-family: Oswald, Arial, sans-serif; 
      }

      .page-2-subheader-container {
        background-color: #3A7E11;
        color: white;
        text-align: center;
        padding: 0 32px 7px 32px;
      }

      .page-2-subheader-caption { 
        font-weight: 300; 
        padding-bottom: -2px;
      }

      .page-3-header { 
        clear: both;
        background-color: #0E6CB6;
        color: white;
      }

      /* ----------------- alt color table styling begin -------------------- */
      /* whole table */
      .color-alt-table { 
        border-collapse: collapse;
        font-family: Oswald, Arial, sans-serif;
      }

      .color-alt-table-title { 
        font-family: Oswald, Arial, sans-serif;
        text-align: center;
        text-transform: uppercase;
        background-color: #3A7E11;
		color: white;
      }

      /* all cells */
      .color-alt-table th,
      .color-alt-table td {
          border: 2px solid black;
      }

      /* header cells */
      .color-alt-table-header th {
          font-family: Oswald, Arial, sans-serif;
          background-color: #3A7E11;
          border: 2px solid black;
          text-transform: uppercase;
		  color:white;
      }
      .color-alt-table-header th:first-of-type {
          text-align: left;
      }

      /* subheader cells */
      .color-alt-table-subheader th {
          font-family: Oswald, Arial, sans-serif;
          background-color: #91cd6eaa;
          border: 2px solid black;
          text-transform: uppercase;
      }
      .color-alt-table-subheader th:first-of-type {
          text-align: left;
      }
      
      /* even data rows */
      .color-alt-table tr:nth-child(2n) {
          background-color: #dfeed4;
      }

      /* odd data rows */
      .color-alt-table td:nth-child(2n + 1) {
          text-align: left;
      }

      /* first column only */
      .color-alt-table tr td:first-of-type { 
          text-align: left;
      }

      /* all columns but the first */
      .color-alt-table tr td:not(:first-of-type) { 
          text-align: center;
      }

      .color-alt-table-row-header { 
        font-weight: normal;
        text-align: left;
        padding-left: 0.5%;
      }
      /* ---------- alt color table styling end ------------ */
      .table-superscript { 
        font-size: 0.65em;
      }

      #page-3-left { 
        padding: 0 5%;
      }

      #page-3-right { 
        padding: 0 5%;
      }

      .h3-accent { 
        height: 4px; 
        background-color: #b1db98; 
        margin-top: -8px;
      }

      .leader-lines-table-header { 
        padding-left: 5px;
        font-family: Oswald, Arial, sans-serif;
        font-style: normal;
        font-variant: normal;
        text-transform: none;
      }

      .leader-lines-table { 
        margin-left: 5px;
        width: 92%;
        line-height: 18px;
      }

      .leader-lines-table-divider { 
        background-color: black; 
        height: 0.75px; 
        width: 85%; 
        margin: 20px 0;
      }

      #disadvantaged-info-section { 
        margin-top: 23px;
        margin-bottom: 40px;
        background-color: #dfeed4; 
        border: 1.5px solid #3A7E11; 
        padding: 10px;
      }

      .indicators-section-table { 
        width: 90%;
        margin: 50px auto;
      }

      #lingiso-header { 
        background-color: #0E6CB6;
        padding: 10px;
      }

      #lingiso-table { 
        width: 100%; 
        margin: 10px 0;
      }

      /* first column of ling iso table */
      #lingiso-table td:first-of-type { 
        box-sizing: border-box;
        padding-top: 5px;
      }

      /* second column of ling iso table */
      #lingiso-table td:nth-of-type(2) { 
        font-family: Oswald, Arial, sans-serif;
        text-align: left !important;
        margin: -20px 0 0 5px;
        width: 52%;
        font-weight: normal;
      }

      /* third column of ling iso table */
      #lingiso-table td:nth-of-type(3) { 
        font-family: Oswald, Arial, sans-serif;
        margin-left: 5px;
        width: 10%;
        font-weight: bold;
        text-align: right;
        padding-right: 8px;
      }

      .linear-gauge-container { 
        display: flex;
        flex-wrap: wrap;
        align-content: center;
        width: 95%;
        height: 17px;
        margin: 0 auto 4px auto;
        background-color: #888888;
      }

      .linear-gauge {
        display: inline-block;
        width: 0%;
        height: 17px;
        margin-left: 0;
      }

      .fine-print {
        font-family: 'Noto Sans', Arial, sans-serif;
        text-align: left;
        font-size: 0.70em;
        line-height: 0.9em;
      }

      .linear-bar-chart { 
        padding: 3%;
      }

      .linear-bar-chart .apexcharts-legend {
        background-color: #cfcfcf;
      }

      /* table with leader lines (.....)  CSS */
      .entry {
        font-family: Oswald, Arial, sans-serif;
        display: grid;
        grid-template-columns: auto max-content;
        grid-template-areas: "chapter page";
        align-items: end;
        gap: 0 0.25rem;
      }
      .chapter {
        font-family: Oswald, Arial, sans-serif;
        grid-area: chapter;
        position: relative;
        overflow: hidden;
        text-overflow:clip;
        white-space: nowrap;
      }

      .page-4-footnotes { 
        margin: 0 5%;
      }

      .footer-text-segment { 
        font-family: Arial, sans-serif;
        background-color: #0E6CB6;
        width: 30%;
        margin: -14px -3px 0 0;
        border-radius: 0 10px 0 0;
        text-align: center;
        font-weight: bold;
        position: relative;
      }

      .footer-accent { 
        background-color: #0E6CB6;
        box-sizing: border-box;
        margin-left: 30%;
        width: 70%;
      }

      #cannot-report-msg { 
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 1%;
      }

      canvas, .esri-view-surface, .esri-view-surface--inset-outline,
      .esri-overlay-surface, .esri-view-root, .esri-ui, .esri-view-user-storage
      { 
        touch-action: pan-x pan-y pinch-zoom !important;
        scroll-behavior: inherit !important;
      }

      /* print styling */
      @media not print { 
        #page-4-header {
          display: none;
        }
      }

      @page {
          size: 8.5in 11in;
          margin: 0;   
      }

      * { 
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      @media print {
        /* .body {
          width: 900px;
        } */

        .footer { 
          position: fixed;
          bottom: 0;
          width: 100%;
          page-break-after: always;
        }

        .header { 
          page-break-before: always;
        }

        #page-4-header {
          display: block;
          background-color: #0E6CB6;
          color: white;
        }
      }

    </style>

    <!-- start report logic -->
    <script src="https://js.arcgis.com/4.11/"></script>
    <link rel="stylesheet" href="https://js.arcgis.com/4.11/esri/css/main.css">
    <script src="../javascript/reportdata.js"></script>
    <script type="text/javascript" src="../javascript/config.js"></script>
    <script type="text/javascript" src="../javascript/tagmanager.js"></script>
    <script>
      var statHash = new Object();
      var ejmainHash = new Object();
      var ejextraHash = new Object();

      var tabIndexCounter = 0
      var navbar_is_visible = false;

      function isKnownGeo(gtype) {
        var isGeo = false;
        for (var g in typelookup) {
          if (g == gtype) isGeo = true;
        }
        return isGeo;
      }

      require([
          "esri/config",
          "esri/request",
          "esri/views/MapView",
          "esri/Map",
          "esri/widgets/ScaleBar",
          "esri/geometry/geometryEngine",
          "esri/geometry/support/webMercatorUtils",
          "esri/Graphic",
          "esri/geometry/Point",
          "esri/geometry/Polyline",
          "esri/geometry/Polygon",		
          "dojo/domReady!"
      ],

      function (esriConfig, esriRequest, MapView, Map, ScaleBar, geometryEngine, webMercatorUtils, Graphic, Point, Polyline, Polygon) {
			//symbols
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
		  
		//end symbols

        var useStaticData = false;
				var soeurldemog = ejscreendemogservice + "/exts/EJScreen_DemogReports/Get2022DemogACS";

        //begin geom input

        var headerstr = "";
        var locationstr = "";
        var intype = "";
        var radius = "";
        var bunit = "";
		    var coordsJSON = "";
		    var coordsObj = "";
        var coords = "";
		    var basemap = "";

        if (useStaticData) {
          intype = "point";
          radius = "1";
          bunit = "miles";
          bunitcode = "9035";
          coords = "-73.984342,40.754438";
		  basemap = "streets";
        } else {
          intype = "<%=feattype %>";
          if (!(intype)) intype = "point";
          else intype = intype.toLowerCase();
		  
		  basemap = "<%=basemap%>";

          radius = "<%=dist %>";
          if (!(radius) || (radius == "")) radius = 0;

          bunit = "<%=bunit %>";
          //if (!(bunit) || (bunit == "")) bunit = "mile";
         // bunitcode = bufferunits[bunit].esricode;
		//Note RW 6/19/23 - mobile report only supports miles, mobile sends in code as name, hardcode name and code to miles
		 bunit = "miles";
		 bunitcode = "9035";

          coordsJSON = '<%=coordstr %>';		  
		  coordsObj = Point.fromJSON(JSON.parse(coordsJSON));
		  coords = coordsObj.x + "," + coordsObj.y;

        }
		
		var hasBuffer = true;
 
    if (radius == 0) {
        hasBuffer = false;
    }
		
		//start map, don't import image
		
		 var map = new Map({
            basemap: basemap			
        });
		
    var mview = new MapView({
        map: map,
        container: "map",
        center: [-122.45, 37.75], // longitude, latitude
        zoom: 13
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

    mview.when(disableZooming);

    function disableZooming(view) {
          $("canvas, .esri-view-surface, .esri-view-surface--inset-outline, .esri-overlay-surface, .esri-view-root, .esri-ui, .esri-view-user-storage").attr("title", "map showing the user-selected area");
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
                var uExtent = mgeom.extent.center;
                mview.extent = uExtent;
            }



        } else if (geom.paths) {

            var linegeom = Polyline.fromJSON(geom);
            var mgeom = webMercatorUtils.geographicToWebMercator(linegeom);
            geometry = mgeom;
            var tgraphic = new Graphic(mgeom, linesym);
            mview.graphics.add(tgraphic);
            if (zoomstatus) {
                var uExtent = mgeom.extent.center;
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
	
		
		//end map

        var namestr = "";
        if (isKnownGeo(intype)) {
         // namestr = "<%=namestr %>";
          namestr = namestr.replace(/\scounty/gi, "");
        }

        var inGeom = null;
        var centerpnt = null;
        var content;
        if (intype == "bg") {
          headerstr = "Blockgroup: " + coords;
          locationstr = "Blockgroup: " + coords;
          content = {
            'geometry': '',
            'distance': '',
            'unit': '',
            'areatype': 'blockgroup',
            'areaid': coords,
            'f': 'json'
          };
        } else if (intype == "city") {
          namestr = namestr.replace(/\scity/gi, "");
          headerstr = typelookup[intype].description + ": " + namestr;
          locationstr = typelookup[intype].description + ": " + namestr;
          content = {
            'geometry': '',
            'distance': '',
            'unit': '',
            'areatype': 'city',
            'areaid': coords,
            'f': 'json'
          };
        } else if (isKnownGeo(intype)) {

          headerstr = typelookup[intype].description + ": " + namestr;
          locationstr = typelookup[intype].description + ": " + namestr;
          content = {
            'geometry': '',
            'distance': '',
            'unit': '',
            'areatype': intype,
            'areaid': coords,
            'f': 'json'
          };
        } else {
          if (coords.length > 0) {
            coords = unescape(coords);
            var geomjson = "";
            var coordsarray = coords.split(",");
            if ((coordsarray.length == 2) && (intype == "point")) {
              var x = parseFloat(coordsarray[0]);
              var y = parseFloat(coordsarray[1]);
              geomjson = '{"x":' + x + ',"y":' + y + ',"spatialReference":{"wkid":4326}}';
              var unitstr = bunit;
              if (radius == 1) unitstr = unitlookup[bunit];
                  headerstr = headerstr + radius + " " + unitstr + " Ring Centered at " + y.toFixed(6) + "," + x.toFixed(6);
                  locationstr = radius + " " + unitstr + " Ring Centered at " + y.toFixed(6) + "," + x.toFixed(6);
              } else if ((intype == "polygon") || (intype == "poly")) {
              geomjson = '{"rings":[[';
              var ccount = coordsarray.length / 2;
              var points = [];
              for (var m = 0; m < ccount; m++) {
                var lon1 = parseFloat(coordsarray[2 * m]);
                var lat1 = parseFloat(coordsarray[2 * m + 1]);
                var pointstr = "[" + lon1 + "," + lat1 + "]";
                points.push(pointstr);
              }

              headerstr = "";
              if (radius == 0) {
                //headerstr = headerstr + "<a href='javascript: void(0);' title='" + coords + "'>the User Specified Area</a>";
                headerstr = headerstr + "the User Specified Area";
                locationstr = "the User Specified Area";
              } else {
                //headerstr = headerstr + radius + " " + bunit + " Ring around <a href='javascript: void(0);' title='" + coords + "'>the Area</a>";
                var unitstr = bunit;
                if (radius == 1) unitstr = unitlookup[bunit];
                  headerstr = headerstr + radius + " " + unitstr + " Ring around the Area";
                  locationstr = radius + " " + unitstr + " Ring around the Area";
              }

              geomjson = geomjson + points.join(",");
              geomjson = geomjson + ']],"spatialReference":{"wkid":4326}}';
            } else if ((intype == "polyline") || (intype == "line")) {
              geomjson = '{"paths":[[';
              var ccount = coordsarray.length / 2;
              var points = [];
              for (var m = 0; m < ccount; m++) {
                var lon1 = parseFloat(coordsarray[2 * m]);
                var lat1 = parseFloat(coordsarray[2 * m + 1]);
                var pointstr = "[" + lon1 + "," + lat1 + "]";
                points.push(pointstr);

              }
              geomjson = geomjson + points.join(",");
              geomjson = geomjson + ']],"spatialReference":{"wkid":4326}}';
              if (radius == 0) {
                alert("You have to enter a radius greater than 0 for linear feature.");
                return false;
              }

              var unitstr = bunit;
              if (radius == 1) unitstr = unitlookup[bunit];
              headerstr = "";
              headerstr = headerstr + radius + " " + unitstr + " Ring around ";
              headerstr = headerstr + "the Corridor";
              //headerstr = headerstr + "<a href='javascript: void(0);' title='" + coords + "'>the Corridor</a>";
              locationstr = radius + " " + unitstr + " Ring around the Corridor";

            } else {
              alert("Invalid coordinates string or input geometry type.");
              return false;
            }
          }

          content = {
            'geometry': geomjson,
            'distance': radius,
            'unit': bunitcode,
            'areatype': '',
            'areaid': '',
            'f': "json"
          };
        }
		
		
	mview.when(function () {
    if (geomjson.length > 1) drawFeature(geomjson);
      //else if (areaid.length > 4) drawID(areaid, intype); //RW Note 6/21/23 - areaid supported on mobile still? Don't add drawID until need
    });

        //end geom input

        if (useStaticData) {
          processResultDemog(demogResultStatic);

        } else {
          esriRequest(soeurldemog, {
            query: content,
            responseType: "json",
            callbackParamName: "callback"
          }).then(processResultDemog);
        }


        //do ej main query
				var soeurlejmain = ejscreenservice + "/exts/EJCensusReports/GetEJScreen";

        if (useStaticData) {
          processResultEJMain(ejResultStatic);

        } else {
          esriRequest(soeurlejmain, {
            query: content,
            responseType: "json",
            callbackParamName: "callback"
          }).then(processResultEJMain);
        }

                //do ej extra query
                var soeurlejextra = ejscreenextraservice + "/exts/EJCensusReports/GetEJExtra";

                if (useStaticData) {
                    processResultEJExtra(ejExtraResultStatic);

                } else {
                    esriRequest(soeurlejextra, {
                        query: content,
                        responseType: "json",
                        callbackParamName: "callback"
                    }).then(processResultEJExtra);
                }


        function processResultDemog(response) {
          resultDEMOG = response.data;

          let no_report_msg = "The area is too small or sparsely populated, or these data are not available in the national dataset. " + 
                              "Cannot generate an EJScreen chart or report."

                    //alert if error
                    if (resultDEMOG.errInfo) {
                        if (resultDEMOG.errInfo.message) {
                            //document.getElementById("errorDiv").innerHTML = resultDEMOG.errInfo.message;
                            document.getElementById('geo-info-bar').innerHTML = "<p id='cannot-report-msg'>" + no_report_msg + "</p>"
                            //alert(resultDEMOG.errInfo.message);
                            return false;
                        }
                    }
                    //end alert
					
                  //alert 2 - no pop from demog
                  //Note 6/27/23 RW:
                  //the above will catch error when no centroids are found. Also want to show no pop message when report works but population still 0
                  //alert if no pop, same message as 'too sparse' from SOE when no centroids.
                  if (resultDEMOG.statGroupList[0].statList[0] && resultDEMOG.statGroupList[0].statList[0].value == "0") {                                                  
                    document.getElementById('geo-info-bar').innerHTML = "<p id='cannot-report-msg'>" + no_report_msg + "</p>"
                    //alert(no_report_msg);
                    //show the 0 pop on report
                    //document.getElementById("TOTALPOP").innerHTML = resultDEMOG.statGroupList[0].statList[0].value;
					//alert("zero");
                    return false;
                  }
                  //end alert
					
					

          var statlist = resultDEMOG.statGroupList[0].statList;

          for (let i = 0; i < statlist.length; i++) {
            var currobj = statlist[i];
            var currName = currobj.name;
            var currValue = currobj.value;
            //store value in hash for lookup for gauges
            statHash[currName] = currValue;

            if (document.getElementById(currName)) {
              document.getElementById(currName).innerHTML = currValue;
            }
          }
          //update coords and area anfd name info
          document.getElementById("inputAreaMiles").innerHTML = Number(resultDEMOG.inputAreaMiles);

          //document.getElementById("LOCATIONSTR").innerHTML = locationstr;
         // document.getElementById("LOCATIONSTR4").innerHTML = locationstr;

		 // alert(document.getElementById("LOCATIONSTR4").innerHTML);
		  const longEnUSFormatter = new Intl.DateTimeFormat('en-US', {
						year:  'numeric',
						month: 'long',
						day:   'numeric',
					});
					
					var tStamp = longEnUSFormatter.format(new Date());
				
					//document.getElementById("REPORTDATE").innerHTML = tStamp;
					//document.getElementById("REPORTVERSION").innerHTML = versionText; //from config
					 // Update location elements
           updateElementsWithContent('.LOCATIONSTR', locationstr);

          // Update report date elements
          updateElementsWithContent('.REPORTDATE', tStamp);

          // Update report version elements
          updateElementsWithContent('.REPORTVERSION', versionText);

          //display life expectancy value only if the value is a positive number (otherwise show N/A)
          if (!isNaN(document.getElementById("LIFEEXP").innerHTML) && 
              Number(document.getElementById("LIFEEXP").innerHTML) > 0) {
              document.getElementById("LIFEEXP").innerHTML += " years";
          }
          else
              document.getElementById("LIFEEXP").innerHTML = "N/A";
          //display per capita income value only if the value is a positive number (otherwise show N/A)
          if (!isNaN(document.getElementById("PER_CAP_INC").innerHTML) && 
              Number(document.getElementById("PER_CAP_INC").innerHTML) > 0) {
              document.getElementById("PER_CAP_INC").innerHTML = "$" + Number(document.getElementById("PER_CAP_INC").innerHTML).toLocaleString("en-US");
          }
          else
              document.getElementById("PER_CAP_INC").innerHTML = "N/A";

          //format per capita income, number of household values
          document.getElementById("TOTALPOP").innerHTML = Number(document.getElementById("TOTALPOP").innerHTML).toLocaleString("en-US");
          document.getElementById("HSHOLDS").innerHTML = Number(document.getElementById("HSHOLDS").innerHTML).toLocaleString("en-US");

          //move the langauge table to the bottom of page 1 when the format moves to 1 column
          function rearrangeElements() { 
            //positions for the langauge table
            var langTable = document.getElementById("language-table-section");
            var langTablePos = document.getElementById("end-of-left");
            var lingIsoSection = document.getElementById("lingiso-section");
            var lingIsoSectionPos = document.getElementById("end-of-right");

            //rearrange data indicators table headers appropriately
            var dataIndicatorsTableHeader = document.getElementById("data-indicators-table-header");

            //for smaller screen sizes
            if (window.innerWidth <= 600) { 
              lingIsoSectionPos.parentNode.insertBefore(langTable, lingIsoSectionPos);
              dataIndicatorsTableHeader.innerHTML = "<tr>" + 
                                                        "<th id='data-indicators-table-selected-variables' scope='col' rowspan=2>SELECTED VARIABLES</th>" +
                                                        "<th id='data-indicators-table-value' scope='col' rowspan=2>VALUE</th>" +
                                                        "<th scope='col' colspan=2>STATE</th>" +
                                                        "<th scope='col' colspan=2>USA</th>" +
                                                    "</tr>" +
                                                    "<tr style='background-color: #3A7E11;'>" + 
                                                        "<th id='data-indicators-table-state-average' scope='col'>Avg.</th>" +
                                                        "<th id='data-indicators-table-percentile-in-state' scope='col'>%tile</th>" +
                                                        "<th id='data-indicators-table-usa-average' scope='col'>Avg.</th>" +
                                                        "<th id='data-indicators-table-percentile-in-usa' scope='col'>%tile</th>" +
                                                    "</tr>";
            }
            //for larger screen sizes
            else {
              langTablePos.parentNode.insertBefore(langTable, langTablePos);
              dataIndicatorsTableHeader.innerHTML = "<tr>" + 
                                                        "<th id='data-indicators-table-selected-variables' scope='col'>SELECTED VARIABLES</th>" +
                                                        "<th id='data-indicators-table-value' scope='col'>VALUE</th>" +
                                                        "<th id='data-indicators-table-state-average' scope='col'>STATE<BR> AVERAGE</th>" +
                                                        "<th id='data-indicators-table-percentile-in-state' scope='col'>PERCENTILE<BR> IN STATE</th>" +
                                                        "<th id='data-indicators-table-usa-average' scope='col'>USA AVERAGE</th>" +
                                                        "<th id='data-indicators-table-percentile-in-usa' scope='col'>PERCENTILE<BR> IN USA</th>" +
                                                    "</tr>";
            }
          }
          addEventListener("resize", rearrangeElements);
          addEventListener("load", rearrangeElements);
          
          // Add event listener for keydown event
          function addSpaceBarNavigation(event) {
            focused_element = document.activeElement
            if (event.key === ' ' || event.key === 'Spacebar') {
              focused_element.click();
              event.preventDefault();
            } 
          }
          

          function addSpaceBarNavigationAndLastNavLink(event) {
            focused_element = document.activeElement
            if (event.key === ' ' || event.key === 'Spacebar') {
              focused_element.click();
            } 
            else if (event.key === 'Tab' || event.keyCode === 9) {
              toggleNavBar();
            }
            event.preventDefault();

          }
          
          document.getElementById('full-report-button').addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById('navbar-dropdown-button').addEventListener('keydown', addSpaceBarNavigation);
          
          document.getElementById("navbar-link-mapimg").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-community-info-header").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-race-header").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-age-header").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-lingiso-header").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-sites-reporting").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-health-indicators").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-climate-indicators").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-language-table-header").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-page-2-header").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-ej-indexes-header").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-supp-indexes-header").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-page-3-header").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-data-indicators-table").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-sites-details-section").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-other-community-features").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-other-environmental-data").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-page-4-header").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-critical-service-gaps").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-socioeconomic-indicators-header").addEventListener('keydown', addSpaceBarNavigation);
          document.getElementById("navbar-link-tribal-and-disadvantaged-status").addEventListener('keydown', addSpaceBarNavigationAndLastNavLink);
          
          document.getElementById("close-report-icon-anchor").addEventListener('keydown', addSpaceBarNavigation);
		  
		  addEventListener('load', function() {
			  document.getElementsByClassName("esri-view-surface--inset-outline").forEach(function(element) {
				  element.tabIndex = 3.01
			  });
		  });

          //addEventListener('load', function() {
          //  document.getElementsByClassName("esri-view-surface--inset-outline").forEach(function(element) {
          //    element.tabIndex = 3.01
          //})
          
          //make it to where pressing tab on the last nav link will close the nav menu

            doLangSpokenTable();
          doGauges();
          doLingIsoChart();

          if (opener) {
            if (opener.document.getElementById("mapimageurl")) {
              var mimgurl = opener.document.getElementById("mapimageurl").innerHTML;
              //document.getElementById("printmapimage").innerHTML = "<center><img  class='img-responsive' src='" + mimgurl + "' alt='Map' /></center>";
              document.getElementById("mapimg").src = mimgurl;
              // document.forms['Form1']['mapimage'].value = mimgurl;
            }
          }

          

          // let mapElement = document.getElementById("map");
          // mapElement.ariaLabel = "dynamic map showing the area searched";
        }
        function processResultEJMain(response) {

          ejmainHash = response.data;
          doEJMainChart();
          doEJSuppChart();

          //update each element whos id is in the ej return with its value. Updates indicator tables.
          Object.entries(ejmainHash).forEach(entry => {
            //return;
            const [key, value] = entry;
            if (document.getElementById(key)) {
              document.getElementById(key).innerHTML = value;
            }
          });

          //format the toxic releases to air and traffic proximity values
            document.getElementById("RAW_E_TRAFFIC").innerHTML = Number(document.getElementById("RAW_E_TRAFFIC").innerHTML).toLocaleString("en-US");
            document.getElementById("S_E_TRAFFIC").innerHTML = Number(document.getElementById("S_E_TRAFFIC").innerHTML).toLocaleString("en-US");
            document.getElementById("S_E_TRAFFIC_PER").innerHTML = Number(document.getElementById("S_E_TRAFFIC_PER").innerHTML).toLocaleString("en-US");
            document.getElementById("N_E_TRAFFIC").innerHTML = Number(document.getElementById("N_E_TRAFFIC").innerHTML).toLocaleString("en-US");
            document.getElementById("N_E_TRAFFIC_PER").innerHTML = Number(document.getElementById("N_E_TRAFFIC_PER").innerHTML).toLocaleString("en-US");

            document.getElementById("RAW_E_RSEI_AIR").innerHTML = Number(document.getElementById("RAW_E_RSEI_AIR").innerHTML).toLocaleString("en-US");
            document.getElementById("S_E_RSEI_AIR").innerHTML = Number(document.getElementById("S_E_RSEI_AIR").innerHTML).toLocaleString("en-US");
            document.getElementById("S_E_RSEI_AIR_PER").innerHTML = Number(document.getElementById("S_E_RSEI_AIR_PER").innerHTML).toLocaleString("en-US");
            document.getElementById("N_E_RSEI_AIR").innerHTML = Number(document.getElementById("N_E_RSEI_AIR").innerHTML).toLocaleString("en-US");
            document.getElementById("N_E_RSEI_AIR_PER").innerHTML = Number(document.getElementById("N_E_RSEI_AIR_PER").innerHTML).toLocaleString("en-US");
          }

          

        function processResultEJExtra(response) {

          ejextraHash = response.data;
          //doEJExtraChart();

          //update each element whos id is in the ej return with its value. Updates indicator tables.
          Object.entries(ejextraHash).forEach(entry => {
            //return;
            const [key, value] = entry;
            if (document.getElementById(key)) {
              document.getElementById(key).innerHTML = value;
            }
          });
		  
		  let stateAverageIds =  ["S_HI_LIFEEXPPCT_AVG",
                                        "S_HI_HEARTDISEASE_AVG",
                                        "S_HI_ASTHMA_AVG",
                                        "S_HI_CANCER_AVG",
                                        "S_HI_DISABILITYPCT_AVG",
                                        "S_CI_FLOOD_AVG",
                                        "S_CI_FIRE_AVG",
                                        "S_CG_LIMITEDBBPCT_AVG",
                                        "S_CG_NOHINCPCT_AVG"];
          stateAverageIds.forEach((id) => {
              if (document.getElementById(id).innerHTML[0] == '-')
                  document.getElementById(id).innerHTML = "N/A";
          });
		  
		  
        }
      });

      function updateElementsWithContent(selector, content) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                elements.forEach(element => {
                    element.textContent = content;
                });
            }
         }
      function doLangSpokenTable() {
        //remove zero-valued rows from the table titled "LANGUAGES SPOKEN AT HOME"
        var row_ids = [
          "english-row", "spanish-row", "french-row", "german-row",
          "russian-row", "other-ie-row", "korean-row", "chinese-row",
          "vietnamese-row", "tagalog-row", "other-asian-row", "arabic-row",
          "other-row", "total-non-english-row"
        ]

        var value_ids = [
          "P_ENGLISH", "P_SPANISH", "P_FRENCH", "P_GERMAN",
          "P_RUS_POL_SLAV", "P_OTHER_IE", "P_KOREAN", "P_CHINESE",
          "P_VIETNAMESE", "P_TAGALOG", "P_OTHER_ASIAN", "P_ARABIC",
          "P_OTHER", "P_NON_ENGLISH"
        ]

        var dataPresent = false;
        for (var i = 0; i < row_ids.length; i++) {
          if (!Number(document.getElementById(value_ids[i]).innerHTML))
            document.getElementById(row_ids[i]).remove()
          else
            dataPresent = true;
        }

        if (!dataPresent) { 
          document.getElementById("language-table").innerHTML += "<tr><td style='text-align: center; padding: 50px 0;' colspan=2><b>No language data available.</b></td><tr>";
        }
      }

      function doLingIsoChart() {
        //do AGEBREAKDOWN linear graphs
        document.getElementById("ages_1_to_4_linear_gauge").style.width = statHash["P_AGE_LT5"] + "%";
        document.getElementById("ages_1_to_18_linear_gauge").style.width = statHash["P_AGE_LT18"] + "%";
        document.getElementById("ages_18_and_up_linear_gauge").style.width = statHash["P_AGE_GT17"] + "%";
        document.getElementById("ages_65_and_up_linear_gauge").style.width = statHash["P_AGE_GT64"] + "%";

        //do LINGISO linear graphs by adjusting div width based on value
        document.getElementById("speak_spanish_linear_gauge").style.width = statHash["P_HLI_SPANISH_LI"] + "%";
        document.getElementById("speak_other_indio_european_linear_gauge").style.width = statHash["P_HLI_IE_LI"] + "%";
        document.getElementById("speak_asian_pacific_islander_linear_gauge").style.width = statHash["P_HLI_API_LI"] + "%";
        document.getElementById("speak_other_languages_linear_gauge").style.width = statHash["P_HLI_OTHER_LI"] + "%";
      }

      function toggleNavBar() { 
        var navbar = document.getElementById("navbar")
        navbar.classList.toggle("dropdown--shown");
        navbar.classList.toggle("dropdown--hidden");
      }

      function goToFullReport() { 
        var navbar = document.getElementById("navbar")
        if (navbar.classList.contains("dropdown--shown")) {
          navbar.classList.toggle("dropdown--shown");
          navbar.classList.toggle("dropdown--hidden");
        }
      }

      
    </script>

    <!--end report logic-->
  </head>
  <body>
    <!-- Title/Header Area -->
    <div id="navbar-container" role="navigation" tabindex="0" >
      <a onclick="goToFullReport()" id="full-report-button" href="#" tabindex="1">Full Report</a>
      <img alt="open navigation dropdown button" id="navbar-dropdown-button" tabindex="2" src="./images/ejreport/Navbar_menu.png" onclick="toggleNavBar()"></img>
      <div id="navbar" class="dropdown--hidden">
        <div style="position: absolute; top: 10px; right: 13px; z-index: 1000;" >
          <a href="https://ejscreen.epa.gov/mapper/" id="close-report-icon-anchor" tabindex="3" onClick="window.open('','_self').close()" style="font-family: Arial, sans-serif; color: white; z-index: 1000; text-decoration: none; font-weight: bold;">
              <img alt="collapse navigation dropdown button" id="close-report-icon" src="images/ejreport/close_icon.png" 
                  style="display: inline-block;"/>
              <div style="position: relative; top: 2px; display: inline-block;">Close Report</div>
          </a>
      </div>
        <ol>
          <li><a onclick="toggleNavBar()" tabindex="3.01" id="navbar-link-mapimg" href="#mapimg-anchor">Map</a></li>
          <li><a onclick="toggleNavBar()" tabindex="3.02" id="navbar-link-community-info-header" href="#community-info-header-anchor">Community Information</a></li>
          <ol type="a"> 
            <li><a onclick="toggleNavBar()" tabindex="3.03" id="navbar-link-race-header" href="#race-header-anchor">Breakdown by Race</a></li>
            <li><a onclick="toggleNavBar()" tabindex="3.04" id="navbar-link-age-header" href="#age-header-anchor">Breakdown by Age</a></li>
            <li><a onclick="toggleNavBar()" tabindex="3.05" id="navbar-link-lingiso-header" href="#lingiso-header-anchor">Limited English Speaking Breakdown</a></li>
            <li><a onclick="toggleNavBar()" tabindex="3.06" id="navbar-link-sites-reporting" href="#language-table-header-anchor">Languages Spoken at Home</a></li>
          </ol>
          <li><a onclick="toggleNavBar()" tabindex="3.07" id="navbar-link-health-indicators" href="#page-2-header-anchor">Environmental Justice & Supplemental Indexes</a></li>
          <ol type="a"> 
            <li><a onclick="toggleNavBar()" tabindex="3.08" id="navbar-link-climate-indicators" href="#ej-indexes-header-anchor">EJ Indexes</a></li>
            <li><a onclick="toggleNavBar()" tabindex="3.09" id="navbar-link-language-table-header" href="#supp-indexes-header-anchor">Supplemental Indexes</a></li>
          </ol>
          <li><a onclick="toggleNavBar()" tabindex="3.10" id="navbar-link-page-2-header" href="#page-3-header-anchor">EJScreen Environmental and Socioeconomic Indicators Data</a></li>
          <ol type="a"> 
            <li><a onclick="toggleNavBar()" tabindex="3.11" id="navbar-link-ej-indexes-header" href="#data-indicators-table-anchor">Environmental Burden Indicators</a></li>
            <li><a onclick="toggleNavBar()" tabindex="3.12" id="navbar-link-supp-indexes-header" href="#socioeconomic-indicators-header-anchor">Socioeconomic Indicators</a></li>
            <li><a onclick="toggleNavBar()" tabindex="3.13" id="navbar-link-page-3-header" href="#sites-details-section-anchor">Additional Area Information</a></li>
            <ul> 
              <li><a onclick="toggleNavBar()" tabindex="3.14" id="navbar-link-data-indicators-table" href="#sites-reporting-anchor">Sites reporting to EPA</a></li>
              <li><a onclick="toggleNavBar()" tabindex="3.15" id="navbar-link-sites-details-section" href="#other-community-features-anchor">Other community features</a></li>
              <li><a onclick="toggleNavBar()" tabindex="3.16" id="navbar-link-other-community-features" href="#other-environmental-data-anchor">Other environmental data</a></li>
              <li><a onclick="toggleNavBar()" tabindex="3.17" id="navbar-link-other-environmental-data" href="#tribal-and-disadvantaged-status-anchor">Tribal and disadvantaged status</a></li>
            </ul>
            <li><a onclick="toggleNavBar()" tabindex="3.18" id="navbar-link-page-4-header" href="#page-4-header-anchor">Additional Climate And Socioeconomic Indicators</a>
            <ul> 
              <li><a onclick="toggleNavBar()" tabindex="3.19" id="navbar-link-critical-service-gaps" href="#health-indicators-anchor">Health Indicators</a></li>
              <li><a onclick="toggleNavBar()" tabindex="3.20" id="navbar-link-socioeconomic-indicators-header" href="#climate-indicators-anchor">Climate Indicators</a></li>
              <li><a onclick="toggleNavBar()" tabindex="3.21" id="navbar-link-tribal-and-disadvantaged-status" href="#critical-service-gaps-anchor">Critical Service Gaps</a></li>
            </ul>
            </li>
          </ol>
        </ol>
      </div>
    </div>

    <div style="height: 50px;" ></div>
    <header id="header-section" tabindex="4">
      <img
        id="epa-logo"
        class="w3-image"
        src="images/ejreport/epa_logo_white.png"
        alt="EPA logo"
      />
      <h1 style="clear: both;font-size: 60px;"><span class="word-break">EJScreen</span> Community Report</h1>
      <p id="header-caption">
        This report provides environmental and socioeconomic information for
        user-defined areas, and combines that data into environmental justice 
        and supplemental indexes.
      </p>
    </header>

    <!-- Geographic Information -->
    <div class="w3-cell-row" id="geo-info-bar" role="location" tabindex="4.5">
        <div class="w3-container w3-cell w3-mobile">
          <h2 id="placename" class="county-state-display">
            County, ST
          </h2>
        </div>
        <div id="area-details" class="w3-container w3-cell w3-mobile">
          <span class="LOCATIONSTR">1 Mile Centered At 23.523423, -68.23403</span><br />
          Population: <span id="TOTALPOP">XX</span><br />
          Area in square miles: <span id="inputAreaMiles">XX</span>
        </div>
      </div>
    </div>

    <div class="w3-cell-row" >
        <div id="page-1-left" class="w3-container w3-cell w3-mobile w3-center">
          <div class="anchor" id="mapimg-anchor" tabindex="-1"></div>
          <!-- <img id="mapimg" src="images/ejreport/Location_map_2.png" class="w3-image"/ tabindex="-1"> -->
          <div id="map" class="w3-image" tabindex="4.75"></div>
          <div id="language-table-section">
        <div class="anchor" id="language-table-header-anchor"></div>
        <h2 class="page-1-header" id="language-table-header" tabindex="10">LANGUAGES SPOKEN AT HOME</h2>
            <div id="language-table-area">
                <table class="color-alt-table" id="language-table" summary="Languages spoken at home" role="grid">
                    <tr class="color-alt-table-header">
                        <th scope="col" width="65%">Language</th>
                        <th scope="col" width="35%">Percent</th>
                    </tr>
                    <tr id="english-row">
                        <td>English</td>
                        <td><span id="P_ENGLISH">XX</span>%</td>
                    </tr>
                    <tr id="spanish-row">
                        <td>Spanish</td>
                        <td><span id="P_SPANISH">XX</span>%</td>
                    </tr>
                    <tr id="french-row">
                        <td>French, Haitian, or Cajun</td>
                        <td><span id="P_FRENCH">XX</span>%</td>
                    </tr>
                    <tr id="german-row">
                        <td>German or other West Germanic</td>
                        <td><span id="P_GERMAN">XX</span>%</td>
                    </tr>
                    <tr id="russian-row">
                        <td>Russian, Polish, or Other Slavic</td>
                        <td><span id="P_RUS_POL_SLAV">XX</span>%</td>
                    </tr>
                    <tr id="other-ie-row">
                        <td>Other Indo-European</td>
                        <td><span id="P_OTHER_IE">XX</span>%</td>
                    </tr>
                    <tr id="korean-row">
                        <td>Korean</td>
                        <td><span id="P_KOREAN">XX</span>%</td>
                    </tr>
                    <tr id="chinese-row">
                        <td>Chinese (including Mandarin, Cantonese)</td>
                        <td><span id="P_CHINESE">XX</span>%</td>
                    </tr>
                    <tr id="vietnamese-row">
                        <td>Vietnamese</td>
                        <td><span id="P_VIETNAMESE">XX</span>%</td>
                    </tr>
                    <tr id="tagalog-row">
                        <td>Tagalog (including Filipino)</td>
                        <td><span id="P_TAGALOG">XX</span>%</td>
                    </tr>
                    <tr id="other-asian-row">
                        <td>Other Asian and Pacific Island</td>
                        <td><span id="P_OTHER_ASIAN">XX</span>%</td>
                    </tr>
                    <tr id="arabic-row">
                        <td>Arabic</td>
                        <td><span id="P_ARABIC">XX</span>%</td>
                    </tr>
                    <tr id="other-row">
                        <td>Other and Unspecified</td>
                        <td><span id="P_OTHER">XX</span>%</td>
                    </tr>
                    <tr id="total-non-english-row">
                        <td>Total Non-English</td>
                        <td><span id="P_NON_ENGLISH">XX</span>%</td>
                    </tr>
                </table>
            </div>
          </div>
          <div id="end-of-left"></div>
        </div>
        <div class="w3-container w3-cell w3-mobile w3-center" id="page-1-right">
          <div class="anchor" id="community-info-header-anchor"></div>
          <div id="community-info-header" class="w3-container">
            <span class="page-1-header" tabindex="6">COMMUNITY INFORMATION</span>
        </div>
        <table class="w3-table w3-centered" id="community-info-table" summary="Community information overview" role="comunity" summary="Community information overview">
          <tr>
            <td class="gauge-value-label">
              <div id="low_income_radial_gauge"></div>
              Low income:<br><span id="P_LOWINC">XX</span> percent
            </td>
            <td class="gauge-value-label">
              <div id="people_of_color_radial_gauge"></div>
              People of color:<br><span id="PCT_MINORITY">XX</span> percent
            </td>
            <td class="gauge-value-label">
              <div id="less_than_hs_radial_gauge"></div>
              Less than high school education:<br><span id="P_EDU_LTHS">XX</span> percent
            </td>
            <td class="gauge-value-label">
              <div id="limited_english_households_radial_gauge"></div>
              Limited English households:<br><span id="P_LIMITED_ENG_HH">XX</span> percent
            </td>
          </tr>
          <tr>
            <td class="gauge-value-label">
              <div id="unemployment_radial_gauge"></div>
              Unemployment:<br><span id="P_EMP_STAT_UNEMPLOYED">XX</span> percent
            </td>
            <td class="gauge-value-label">
              <div id="persons_with_disabilities_radial_gauge"></div>
              Persons with disabilities:<br><span id="P_DISABILITY">XX</span> percent
            </td>
            <td class="gauge-value-label">
              <div id="male_radial_gauge"></div>
              Male:<br><span id="P_MALES">XX</span> percent
            </td>
            <td class="gauge-value-label">
              <div id="female_radial_gauge"></div>
              Female:<br><span id="P_FEMALES">XX</span> percent
            </td>
          </tr>
          <tr class="w3-table-exception">
            <td class="gauge-value-label" style="vertical-align: bottom;">
              <div class="enlarged-figure">
                <span id="LIFEEXP">XX</span>
              </div>
            </td>
            <td class="gauge-value-label" style="vertical-align: bottom;">
              <div class="enlarged-figure">
                <span id="PER_CAP_INC">XX</span>
              </div>
            </td>
            <td class="gauge-value-label" style="vertical-align: bottom;">
              <img id="household-icon" src="images/ejreport/house icon.png" alt="House icon"
                width="60"
                />
            </td>
            <td class="gauge-value-label" style="vertical-align: bottom;">
              <div id="owner_occupied_radial_gauge"></div>
            </td>
          </tr>
          <tr class="w3-table-exception">
            <td class="gauge-value-label">
              Average life<br> expectancy
            </td>
            <td class="gauge-value-label">
              Per capita income
            </td>
            <td class="gauge-value-label" style="padding-bottom: 10px">
              Number of households:<br> <span id="HSHOLDS">XX</span>
            </td>
            <td class="gauge-value-label">
              Owner occupied:<br> <span id="P_OWN_OCCUPIED">XX</span> percent
            </td>
          </tr>
        </table>
        <div class="anchor" id="race-header-anchor"></div>
        <div id="race-header" class="w3-container">
          <span class="page-1-header" tabindex="7">BREAKDOWN BY RACE</span>
        </div>
        <div>
          <table class="w3-table w3-centered" id="race-table" role="Breakdown by race" summary="Breakdown by race" >
                <tr>
                    <td class="gauge-value-label">
                        <div id="white_percent_radial_gauge"></div>
                        White: <span id="P_NHWHITE">XX</span>%
                    </td>
                    <td class="gauge-value-label">
                        <div id="black_percent_radial_gauge"></div>
                        Black: <span id="P_NHBLACK">XX</span>%
                    </td>
                    <td class="gauge-value-label">
                        <div id="american_indian_percent_radial_gauge"></div>
                        American Indian: <span id="P_NHAMERIND">XX</span>%
                    </td>
                    <td class="gauge-value-label">
                        <div id="asian_percent_radial_gauge"></div>
                        Asian: <span id="P_NHASIAN">XX</span>%
                    </td>
                </tr>
                <tr>
                    <td class="gauge-value-label">
                        <div id="hawaiian_percent_radial_gauge"></div>
                        Hawaiian/<span class="word-break"></span>Pacific <br />Islander: <span id="P_NHHAWPAC">XX</span>%
                    </td>
                    <td class="gauge-value-label">
                        <div id="other_race_percent_radial_gauge"></div>
                        Other race: <span id="P_NHOTHER_RACE">XX</span>%
                    </td>
                    <td class="gauge-value-label">
                        <div id="multiple_races_percent_radial_gauge"></div>
                        Two or more <br />races: <span id="P_NHTWOMORE">XX</span>%
                    </td>
                    <td class="gauge-value-label">
                        <div id="hispanic_percent_radial_gauge"></div>
                        Hispanic: <span id="P_HISP">XX</span>%
                    </td>
                </tr>
            </table>
      </div>
        <div class="anchor" id="age-header-anchor"></div>
        <div id="age-header"  class="w3-container">
          <span class="page-1-header" tabindex="8">BREAKDOWN BY AGE</span>
      </div>
        <table id="lingiso-table" role="Breakdown by age" summary="Breakdown by age">
          <tr>
            <td>
              <div class="linear-gauge-container">
                <div id="ages_1_to_4_linear_gauge" class="linear-gauge"
                    style="background-color: #0E6CB6;">
                </div>
              </div>
              <div class="linear-gauge-container">
                <div id="ages_1_to_18_linear_gauge" class="linear-gauge"
                    style="background-color: #fff101;">
                </div>
              </div>
              <div class="linear-gauge-container">
                <div id="ages_18_and_up_linear_gauge" class="linear-gauge"
                    style="background-color: #3A7E11;">
                </div>
              </div>
              <div class="linear-gauge-container">
                <div id="ages_65_and_up_linear_gauge" class="linear-gauge"
                    style="background-color: #faba59;">
                </div>
              </div>
            </td>
            <td>
              From Ages 1 to 4<br />
              From Ages 1 to 18<br />
              From Ages 18 and up<br />
              From Ages 65 and up
            </td>
            <td>
              <span id="P_AGE_LT5">XX</span>%<br />
              <span id="P_AGE_LT18">XX</span>%<br />
              <span id="P_AGE_GT17">XX</span>%<br />
              <span id="P_AGE_GT64">XX</span>%
            </td>
          </tr>
        </table>
      <div id="lingiso-section">
        <div class="anchor" id="lingiso-header-anchor"></div>
        <div id="lingiso-header" class="w3-container">
            <span class="page-1-header" tabindex="9">LIMITED ENGLISH SPEAKING BREAKDOWN</span>
        </div>
        <table id="lingiso-table" summary="Limited English speaking breakdown" role="Limited English speaking breakdown">
          <tr>
            <td>
              <div class="linear-gauge-container">
                <div id="speak_spanish_linear_gauge" class="linear-gauge"
                    style="background-color: #0E6CB6;">
                </div>
              </div>
              <div class="linear-gauge-container">
                <div id="speak_other_indio_european_linear_gauge" class="linear-gauge"
                    style="background-color: #fff101;">
                </div>
              </div>
              <div class="linear-gauge-container">
                <div id="speak_asian_pacific_islander_linear_gauge" class="linear-gauge"
                    style="background-color: #3A7E11;">
                </div>
              </div>
              <div class="linear-gauge-container">
                <div id="speak_other_languages_linear_gauge" class="linear-gauge"
                    style="background-color: #faba59;">
                </div>
              </div>
            </td>
            <td>
                Speak Spanish<br />
                Speak Other Indo-European Languages<br />
                Speak Asian-Pacific Island Languages<br />
                Speak Other Languages
            </td>
            <td>
              <span id="P_HLI_SPANISH_LI">XX</span>%<br />
              <span id="P_HLI_IE_LI">XX</span>%<br />
              <span id="P_HLI_API_LI">XX</span>%<br />
              <span id="P_HLI_OTHER_LI">XX</span>%
            </td>
          </tr>
        </table>
        <p style="padding: 0 5px;" class="fine-print">
            Notes: Numbers may not sum to totals due to rounding. Hispanic
            population can be of any race. Source: U.S. Census Bureau, American
            Community Survey (ACS) 2018-2022. Life expectancy data comes from
            the Centers for Disease Control.
        </p>
      </div>
      <div id="end-of-right"></div>
    </div>
  </div>
  <br/>
  <div class="page-4-footnotes">
    <!-- <div class="fine-print">Footnotes</div> -->
    <div id="report-summary-location" style="font-size: 16px;"><span style="font-size: 14px; font-style: italic;font-family: Arial, sans-serif;font-weight: 400;line-height: 23px;">Report for <span class="LOCATIONSTR">XX</span></span></div>
    <div id="report-footer" style="font-size: 16px;"><span style="font-size: 14px; font-style: italic;font-family: Arial, sans-serif;font-weight: 400;line-height: 23px;">Report produced <span class="REPORTDATE"></span> using EJScreen <span class="REPORTVERSION"></span></span></div>
  </div>
    <!-- PAGE 2 CONTENTS BEGINS HERE-->
  
        <div class="anchor" id="page-2-header-anchor"></div>
        <div id="page-2-header" class="page-2-header-container w3-container header">
        <h2 tabindex="10">
            Environmental Justice & Supplemental Indexes
        </h2>
        <p class="page-2-header-caption">
          The environmental justice and supplemental indexes are a combination of environmental and 
          socioeconomic information. There are thirteen EJ indexes and supplemental indexes in EJScreen 
          reflecting the 13 environmental indicators. The indexes for a selected area are compared to those 
          for all other locations in the state or nation. For more information and calculation 
          details on the EJ and supplemental indexes, please visit the
            <a href="https://www.epa.gov/ejscreen" style="color: white" tabindex="11">EJScreen website</a>.
        </p>
    </div>
        <div class="anchor" id="ej-indexes-header-anchor"></div>
        <div id="ej-indexes-header" class="page-2-subheader-container w3-container"  tabindex="12">
      <h3>
          EJ INDEXES
      </h3>
      <p class="page-2-subheader-caption">
          The EJ indexes help users screen for potential EJ concerns. To do this,
          the EJ index combines data on low income and people of color populations
          with a single environmental indicator.
      </p>
    </div>
    <div id="ej-index-bar-chart" class="linear-bar-chart">
    </div>

        <div class="anchor" id="supp-indexes-header-anchor"></div>
        <div id="supp-indexes-header" class="page-2-subheader-container w3-container" tabindex="13">
      <h3>
          SUPPLEMENTAL INDEXES
      </h3>
      <p class="page-2-subheader-caption">
        The supplemental indexes offer a different perspective 
        on community-level vulnerability. They combine data on percent low income, 
        percent persons with disabilities, percent less than high school 
        education, percent limited English speaking, and percent low life expectancy 
        with a single environmental indicator.
      </p>
  </div>
  <div id="supp-index-bar-chart" class="linear-bar-chart">
  </div>

  <div style="float: right; padding: 0 20px;">
    <p class="fine-print">
        These percentiles provide perspective on how the selected block group or
        buffer area compares to the entire state or nation.<br><br>
    </p>
</div>
<br/>
<div class="page-4-footnotes">
  <!-- <div class="fine-print">Footnotes</div> -->
  <div id="report-summary-location" style="font-size: 16px;"><span style="font-size: 14px; font-style: italic;font-family: Arial, sans-serif;font-weight: 400;line-height: 23px;">Report for <span class="LOCATIONSTR">XX</span></span></div>
  <div id="report-footer" style="font-size: 16px;"><span style="font-size: 14px; font-style: italic;font-family: Arial, sans-serif;font-weight: 400;line-height: 23px;">Report produced <span class="REPORTDATE"></span> using EJScreen <span class="REPORTVERSION"></span></span></div>
</div> 
  <!----------------------------- PAGE 3 CONTENT ------------------------------->
  <div id="page-3-header-anchor" 
    style="
      display: block;
      height: 0;
      visibility: hidden;"></div>
  <div
    class="header page-3-header">
    <h2 style="padding: 0.75em 0;" tabindex="14">
        EJScreen Environmental and Socioeconomic Indicators Data
    </h2>
  </div>
  <div class="anchor" id="data-indicators-table-anchor"></div>
  <table id="data-indicators-table" role="EJScreen environmental and socioeconomic indicators data" class="color-alt-table" summary="EJScreen environmental and socioeconomic indicators data">
    <thead id="data-indicators-table-header" class="color-alt-table-header">
      <tr>
          <th id="data-indicators-table-selected-variables" scope="col">SELECTED VARIABLES</th>
          <th id="data-indicators-table-value" scope="col">VALUE</th>
          <th id="data-indicators-table-state-average" scope="col">STATE<BR> AVERAGE</th>
          <th id="data-indicators-table-percentile-in-state" scope="col">PERCENTILE<BR> IN STATE</th>
          <th id="data-indicators-table-usa-average" scope="col">USA AVERAGE</th>
          <th id="data-indicators-table-percentile-in-usa" scope="col">PERCENTILE<BR> IN USA</th>
      </tr>
    </thead>
    <tr class="color-alt-table-subheader">
        <th colspan="7">
            Environmental Burden Indicators
        </th>
    </tr>
    <tr>
        <td headers="data-indicators-table-selected-variables">Particulate Matter&nbsp;&nbsp;(&mu;g/m<span class="table-superscript"><sup>3</sup></span>)</td>
        <td headers="data-indicators-table-value"><span id="RAW_E_PM25">XX</span></td>
        <td headers="data-indicators-table-state-average"><span id="S_E_PM25">XX</span></td>
        <td headers="data-indicators-table-percentile-in-state"><span id="S_E_PM25_PER">XX</span></td>
        <td headers="data-indicators-table-usa-average"><span id="N_E_PM25">XX</span></td>
        <td headers="data-indicators-table-percentile-in-usa"><span id="N_E_PM25_PER">XX</span></td>
    </tr>
    <tr>
        <td headers="data-indicators-table-selected-variables">Ozone&nbsp;&nbsp;(ppb)</td>
        <td headers="data-indicators-table-value"><span id="RAW_E_O3">XX</span></td>
        <td headers="data-indicators-table-state-average"><span id="S_E_O3">XX</span></td>
        <td headers="data-indicators-table-percentile-in-state"><span id="S_E_O3_PER">XX</span></td>
        <td headers="data-indicators-table-usa-average"><span id="N_E_O3">XX</span></td>
        <td headers="data-indicators-table-percentile-in-usa"><span id="N_E_O3_PER">XX</span></td>
    </tr>
	  <tr>
      <td headers="data-indicators-table-selected-variables">Nitrogen Dioxide(NO<sub>2</sub>)&nbsp;&nbsp;(ppbv)</td>
      <td headers="data-indicators-table-value"><span id="RAW_E_NO2">XX</span></td>
      <td headers="data-indicators-table-state-average"><span id="S_E_NO2">XX</span></td>
      <td headers="data-indicators-table-percentile-in-state"><span id="S_E_NO2_PER">XX</span></td>
      <td headers="data-indicators-table-usa-average"><span id="N_E_NO2">XX</span></td>
      <td headers="data-indicators-table-percentile-in-usa"><span id="N_E_NO2_PER">XX</span></td>
     </tr>
   
	    <tr>
        <td headers="data-indicators-table-selected-variables">Diesel Particulate Matter&nbsp;&nbsp;(&mu;g/m<span class="table-superscript"><sup>3</sup></span>)</td>
        <td headers="data-indicators-table-value"><span id="RAW_E_DIESEL">XX</span></td>
        <td headers="data-indicators-table-state-average"><span id="S_E_DIESEL">XX</span></td>
        <td headers="data-indicators-table-percentile-in-state"><span id="S_E_DIESEL_PER">XX</span></td>
        <td headers="data-indicators-table-usa-average"><span id="N_E_DIESEL">XX</span></td>
        <td headers="data-indicators-table-percentile-in-usa"><span id="N_E_DIESEL_PER">XX</span></td>
    </tr>
	
   
    <tr>
        <td headers="data-indicators-table-selected-variables">Toxic Releases to Air&nbsp;&nbsp;(toxicity-weighted concentration)</td>
        <td headers="data-indicators-table-value"><span id="RAW_E_RSEI_AIR">XX</span></td>
        <td headers="data-indicators-table-state-average"><span id="S_E_RSEI_AIR">XX</span></td>
        <td headers="data-indicators-table-percentile-in-state"><span id="S_E_RSEI_AIR_PER">XX</span></td>
        <td headers="data-indicators-table-usa-average"><span id="N_E_RSEI_AIR">XX</span></td>
        <td headers="data-indicators-table-percentile-in-usa"><span id="N_E_RSEI_AIR_PER">XX</span></td>
    </tr>
    <tr>
        <td headers="data-indicators-table-selected-variables">Traffic Proximity&nbsp;&nbsp;(daily traffic count/distance to road)</td>
        <td headers="data-indicators-table-value"><span id="RAW_E_TRAFFIC">XX</span></td>
        <td headers="data-indicators-table-state-average"><span id="S_E_TRAFFIC">XX</span></td>
        <td headers="data-indicators-table-percentile-in-state"><span id="S_E_TRAFFIC_PER">XX</span></td>
        <td headers="data-indicators-table-usa-average"><span id="N_E_TRAFFIC">XX</span></td>
        <td headers="data-indicators-table-percentile-in-usa"><span id="N_E_TRAFFIC_PER">XX</span></td>
    </tr>
    <tr>
        <td headers="data-indicators-table-selected-variables">Lead Paint&nbsp;&nbsp;(% Pre-1960 Housing)</td>
        <td headers="data-indicators-table-value"><span id="RAW_E_LEAD">XX</span></td>
        <td headers="data-indicators-table-state-average"><span id="S_E_LEAD">XX</span></td>
        <td headers="data-indicators-table-percentile-in-state"><span id="S_E_LEAD_PER">XX</span></td>
        <td headers="data-indicators-table-usa-average"><span id="N_E_LEAD">XX</span></td>
        <td headers="data-indicators-table-percentile-in-usa"><span id="N_E_LEAD_PER">XX</span></td>
    </tr>
    <tr>
        <td headers="data-indicators-table-selected-variables">Superfund Proximity&nbsp;&nbsp;(site count/km distance)</td>
        <td headers="data-indicators-table-value"><span id="RAW_E_NPL">XX</span></td>
        <td headers="data-indicators-table-state-average"><span id="S_E_NPL">XX</span></td>
        <td headers="data-indicators-table-percentile-in-state"><span id="S_E_NPL_PER">XX</span></td>
        <td headers="data-indicators-table-usa-average"><span id="N_E_NPL">XX</span></td>
        <td headers="data-indicators-table-percentile-in-usa"><span id="N_E_NPL_PER">XX</span></td>
    </tr>
    <tr>
        <td headers="data-indicators-table-selected-variables">RMP Facility Proximity&nbsp;&nbsp;(facility count/km distance)</td>
        <td headers="data-indicators-table-value"><span id="RAW_E_RMP">XX</span></td>
        <td headers="data-indicators-table-state-average"><span id="S_E_RMP">XX</span></td>
        <td headers="data-indicators-table-percentile-in-state"><span id="S_E_RMP_PER">XX</span></td>
        <td headers="data-indicators-table-usa-average"><span id="N_E_RMP">XX</span></td>
        <td headers="data-indicators-table-percentile-in-usa"><span id="N_E_RMP_PER">XX</span></td>
    </tr>
    <tr>
        <td headers="data-indicators-table-selected-variables">Hazardous Waste Proximity&nbsp;&nbsp;(facility count/km distance)</td>
        <td headers="data-indicators-table-value"><span id="RAW_E_TSDF">XX</span></td>
        <td headers="data-indicators-table-state-average"><span id="S_E_TSDF">XX</span></td>
        <td headers="data-indicators-table-percentile-in-state"><span id="S_E_TSDF_PER">XX</span></td>
        <td headers="data-indicators-table-usa-average"><span id="N_E_TSDF">XX</span></td>
        <td headers="data-indicators-table-percentile-in-usa"><span id="N_E_TSDF_PER">XX</span></td>
    </tr>
    <tr id="socioeconomic-indicators-header-anchor">
        <td headers="data-indicators-table-selected-variables">Underground Storage Tanks&nbsp;&nbsp;(count/km<span class="table-superscript"><sup>2</sup></span>)</td>
        <td headers="data-indicators-table-value"><span id="RAW_E_UST">XX</span></td>
        <td headers="data-indicators-table-state-average"><span id="S_E_UST">XX</span></td>
        <td headers="data-indicators-table-percentile-in-state"><span id="S_E_UST_PER">XX</span></td>
        <td headers="data-indicators-table-usa-average"><span id="N_E_UST">XX</span></td>
        <td headers="data-indicators-table-percentile-in-usa"><span id="N_E_UST_PER">XX</span></td>
    </tr>
    <tr>
        <td headers="data-indicators-table-selected-variables">Wastewater Discharge&nbsp;&nbsp;(toxicity-weighted concentration/m distance)</td>
        <td headers="data-indicators-table-value"><span id="RAW_E_NPDES">XX</span></td>
        <td headers="data-indicators-table-state-average"><span id="S_E_NPDES">XX</span></td>
        <td headers="data-indicators-table-percentile-in-state"><span id="S_E_NPDES_PER">XX</span></td>
        <td headers="data-indicators-table-usa-average"><span id="N_E_NPDES">XX</span></td>
        <td headers="data-indicators-table-percentile-in-usa"><span id="N_E_NPDES_PER">XX</span></td>
    </tr>
	<tr>
    <td headers="data-indicators-table-selected-variables">Drinking Water Non-Compliance&nbsp;&nbsp;(points)</td>
    <td headers="data-indicators-table-value"><span id="RAW_E_DWATER">XX</span></td>
    <td headers="data-indicators-table-state-average"><span id="S_E_DWATER">XX</span></td>
    <td headers="data-indicators-table-percentile-in-state"><span id="S_E_DWATER_PER">XX</span></td>
    <td headers="data-indicators-table-usa average"><span id="N_E_DWATER">XX</span></td>
    <td headers="data-indicators-table-percentile-in-usa"><span id="N_E_DWATER_PER">XX</span></td>
  </tr>
  <tr id="socioeconomic-indicators-header" class="color-alt-table-subheader">
        <th colspan="7">
            Socioeconomic Indicators
        </th>
    </tr>
    <tr>
      <td headers="data-indicators-table-selected-variables">Demographic Index USA</td>
      <td headers="data-indicators-table-value"><span id="RAW_D_DEMOGIDX2">XX%</span></td>
      <td headers="data-indicators-table-state-average"><span id="S_D_DEMOGIDX2">N/A</span></td>
      <td headers="data-indicators-table-percentile-in-state"><span id="S_D_DEMOGIDX2_PER">N/A</span></td>
      <td headers="data-indicators-table-usa average"><span id="N_D_DEMOGIDX2">XX%</span></td>
      <td headers="data-indicators-table-percentile-in-usa"><span id="N_D_DEMOGIDX2_PER">XX</span></td>
  </tr>
  <tr>
      <td headers="data-indicators-table-selected-variables">Supplemental Demographic Index USA</td>
      <td headers="data-indicators-table-value"><span id="RAW_D_DEMOGIDX5">XX%</span></td>
      <td headers="data-indicators-table-state-average"><span id="S_D_DEMOGIDX5">N/A</span></td>
      <td headers="data-indicators-table-percentile-in-state"><span id="S_D_DEMOGIDX5_PER">N/A</span></td>
      <td headers="data-indicators-table-usa average"><span id="N_D_DEMOGIDX5">XX%</span></td>
      <td headers="data-indicators-table-percentile-in-usa"><span id="N_D_DEMOGIDX5_PER">XX</span></td>
  </tr>
<tr>
      <td headers="data-indicators-table-selected-variables">Demographic Index State</td>
      <td headers="data-indicators-table-value"><span id="RAW_D_DEMOGIDX2ST">XX%</span></td>
      <td headers="data-indicators-table-state-average"><span id="S_D_DEMOGIDX2ST">XX%</span></td>
      <td headers="data-indicators-table-percentile-in-state"><span id="S_D_DEMOGIDX2ST_PER">XX</span></td>
      <td headers="data-indicators-table-usa average"><span id="N_D_DEMOGIDX2ST">N/A</span></td>
      <td headers="data-indicators-table-percentile-in-usa"><span id="N_D_DEMOGIDX2ST_PER">N/A</span></td>
  </tr>
  <tr>
      <td headers="data-indicators-table-selected-variables">Supplemental Demographic Index State</td>
      <td headers="data-indicators-table-value"><span id="RAW_D_DEMOGIDX5ST">XX%</span></td>
      <td headers="data-indicators-table-state-average"><span id="S_D_DEMOGIDX5ST">XX%</span></td>
      <td headers="data-indicators-table-percentile-in-state"><span id="S_D_DEMOGIDX5ST_PER">XX</span></td>
      <td headers="data-indicators-table-usa average"><span id="N_D_DEMOGIDX5ST">N/A</span></td>
      <td headers="data-indicators-table-percentile-in-usa"><span id="N_D_DEMOGIDX5ST_PER">N/A</span></td>
  </tr>
    <tr>
        <td headers="data-indicators-table-selected-variables">People of Color</td>
        <td headers="data-indicators-table-value"><span id="RAW_D_PEOPCOLOR">XX%</span></td>
        <td headers="data-indicators-table-state-average"><span id="S_D_PEOPCOLOR">XX%</span></td>
        <td headers="data-indicators-table-percentile-in-state"><span id="S_D_PEOPCOLOR_PER">XX</span></td>
        <td headers="data-indicators-table-usa-average"><span id="N_D_PEOPCOLOR">XX%</span></td>
        <td headers="data-indicators-table-percentile-in-usa"><span id="N_D_PEOPCOLOR_PER">XX</span></td>
    </tr>
    <tr>
        <td headers="data-indicators-table-selected-variables">Low Income</td>
        <td headers="data-indicators-table-value"><span id="RAW_D_INCOME">XX%</span></td>
        <td headers="data-indicators-table-state-average"><span id="S_D_INCOME">XX%</span></td>
        <td headers="data-indicators-table-percentile-in-state"><span id="S_D_INCOME_PER">XX</span></td>
        <td headers="data-indicators-table-usa-average"><span id="N_D_INCOME">XX%</span></td>
        <td headers="data-indicators-table-percentile-in-usa"><span id="N_D_INCOME_PER">XX</span></td>
    </tr>
    <tr>
        <td headers="data-indicators-table-selected-variables">Unemployment Rate</td>
        <td headers="data-indicators-table-value"><span id="RAW_D_UNEMPLOYED">XX%</span></td>
        <td headers="data-indicators-table-state-average"><span id="S_D_UNEMPLOYED">XX%</span></td>
        <td headers="data-indicators-table-percentile-in-state"><span id="S_D_UNEMPLOYED_PER">XX</span></td>
        <td headers="data-indicators-table-usa-average"><span id="N_D_UNEMPLOYED">XX%</span></td>
        <td headers="data-indicators-table-percentile-in-usa"><span id="N_D_UNEMPLOYED_PER">XX</span></td>
    </tr>
    <tr>
        <td headers="data-indicators-table-selected-variables">Limited English Speaking Households</td>
        <td headers="data-indicators-table-value"><span id="RAW_D_LING">XX%</span></td>
        <td headers="data-indicators-table-state-average"><span id="S_D_LING">XX%</span></td>
        <td headers="data-indicators-table-percentile-in-state"><span id="S_D_LING_PER">XX</span></td>
        <td headers="data-indicators-table-usa-average"><span id="N_D_LING">XX%</span></td>
        <td headers="data-indicators-table-percentile-in-usa"><span id="N_D_LING_PER">XX</span></td>
    </tr>
    <tr>
        <td headers="data-indicators-table-selected-variables">Less Than High School Education</td>
        <td headers="data-indicators-table-value"><span id="RAW_D_LESSHS">XX%</span></td>
        <td headers="data-indicators-table-state-average"><span id="S_D_LESSHS">XX%</span></td>
        <td headers="data-indicators-table-percentile-in-state"><span id="S_D_LESSHS_PER">XX</span></td>
        <td headers="data-indicators-table-usa-average"><span id="N_D_LESSHS">XX%</span></td>
        <td headers="data-indicators-table-percentile-in-usa"><span id="N_D_LESSHS_PER">XX</span></td>
    </tr>
    <tr>
        <td headers="data-indicators-table-selected-variables">Under Age 5</td>
        <td headers="data-indicators-table-value"><span id="RAW_D_UNDER5">XX%</span></td>
        <td headers="data-indicators-table-state-average"><span id="S_D_UNDER5">XX%</span></td>
        <td headers="data-indicators-table-percentile-in-state"><span id="S_D_UNDER5_PER">XX</span></td>
        <td headers="data-indicators-table-usa-average"><span id="N_D_UNDER5">XX%</span></td>
        <td headers="data-indicators-table-percentile-in-usa"><span id="N_D_UNDER5_PER">XX</span></td>
    </tr>
    <tr>
        <td headers="data-indicators-table-selected-variables">Over Age 64</td>
        <td headers="data-indicators-table-value"><span id="RAW_D_OVER64">XX%</span></td>
        <td headers="data-indicators-table-state-average"><span id="S_D_OVER64">XX%</span></td>
        <td headers="data-indicators-table-percentile-in-state"><span id="S_D_OVER64_PER">XX</span></td>
        <td headers="data-indicators-table-usa-average"><span id="N_D_OVER64">XX%</span></td>
        <td headers="data-indicators-table-percentile-in-usa"><span id="N_D_OVER64_PER">XX</span></td>
    </tr>
    <tr>
        <td headers="data-indicators-table-selected-variables">Low Life Expectancy</td>
        <td headers="data-indicators-table-value"><span id="RAW_D_LIFEEXP">XX%</span></td>
        <td headers="data-indicators-table-state-average"><span id="S_D_LIFEEXP">XX%</span></td>
        <td headers="data-indicators-table-percentile-in-state"><span id="S_D_LIFEEXP_PER">XX</span></td>
        <td headers="data-indicators-table-usa-average"><span id="N_D_LIFEEXP">XX%</span></td>
        <td headers="data-indicators-table-percentile-in-usa"><span id="N_D_LIFEEXP_PER">XX</span></td>
    </tr>
  </table>
  <p class="fine-print" style="margin: -24px 5% 5px 5%;">*Diesel particulate matter index is from the EPA's Air Toxics Data Update, which is the Agency's ongoing, comprehensive evaluation of air 
    toxics in the United States. This effort aims to prioritize air toxics, emission sources, and locations of 
    interest for further study. It is important to remember that the air toxics data presented here provide broad 
    estimates of health risks over geographic areas of the country, not definitive risks to specific individuals or 
    locations.  More information on the Air Toxics 
    Data Update can be found at: <a tabindex="15" href="https://www.epa.gov/haps/air-toxics-data-update">https://www.epa.gov/haps/air-toxics-data-update</a>.</p>

  <div class="anchor" id="sites-details-section-anchor"></div>
  <div id="sites-details-section" class="w3-cell-row">
    <div id="page-3-left" class="w3-container w3-cell w3-mobile">
      <div class="anchor" id="sites-reporting-anchor"></div>
      <h3 class="leader-lines-table-header" tabindex="16">Sites reporting to EPA within defined area:</h3>
      <div class="h3-accent"></div>
      <table class="leader-lines-table" summary="Sites reporting to EPA within defined area" role="Sites reporting to EPA within defined area">
          <tr class="entry">
              <td class="chapter">Superfund<span role="presentation"> . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</span></td>
              <td class="page" style="text-align: right"><span id="NUM_NPL">XX</span></td>
          </tr>
          <tr class="entry">
              <td class="chapter">Hazardous Waste, Treatment, Storage, and Disposal Facilities<span role="presentation"> . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</span></td>
              <td class="page" style="text-align: right"><span id="NUM_TSDF">XX</span></td>
          </tr>
          <tr class="entry">
              <td class="chapter">Water Dischargers<span role="presentation"> . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</span></td>
              <td class="page" style="text-align: right"><span id="NUM_WATERDIS">XX</span></td>
          </tr>
          <tr class="entry">
              <td class="chapter">Air Pollution<span role="presentation"> . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</span></td>
              <td class="page" style="text-align: right"><span id="NUM_AIRPOLL">XX</span></td>
          </tr>
          <tr class="entry">
              <td class="chapter">Brownfields<span role="presentation"> . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</span></td>
              <td class="page" style="text-align: right"><span id="NUM_BROWNFIELD">XX</span></td>
          </tr>
          <tr class="entry">
              <td class="chapter">Toxic Release Inventory<span role="presentation"> . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</span></td>
              <td class="page" style="text-align: right"><span id="NUM_TRI">XX</span></td>
          </tr>
      </table>
      <div id="leader-lines-table-divider-1" class="leader-lines-table-divider"></div>
    </div>

    <div class="anchor" id="other-community-features-anchor"></div>
    <div id="page-3-right" class="w3-container w3-cell w3-mobile">
      <h3 class="leader-lines-table-header" tabindex="17">Other community features within defined area:</h3>
      <div class="h3-accent"></div>
      <table class="leader-lines-table" summary="Other community features within defined area" role="Other community features within defined area">
          <tr class="entry">
              <td class="chapter">Schools<span role="presentation"> . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</span></td>
              <td class="page" style="text-align: right"><span id="NUM_SCHOOL">XX</span></td>
          </tr>
          <tr class="entry">
              <td class="chapter">Hospitals<span role="presentation"> . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</span></td>
              <td class="page" style="text-align: right"><span id="NUM_HOSPITAL">XX</span></td>
          </tr>
          <tr class="entry">
              <td class="chapter">Places of Worship<span role="presentation"> . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</span></td>
              <td class="page" style="text-align: right"><span id="NUM_CHURCH">XX</span></td>
          </tr>
      </table>
    <div class="anchor" id="other-environmental-data-anchor"></div>
    <div class="leader-lines-table-divider"></div>
      <h3 class="leader-lines-table-header" tabindex="18">Other environmental data:</h3>
      <div class="h3-accent"></div>
      <table class="leader-lines-table" summary="Other environmental data" role="Other environmental data">
          <tr class="entry">
              <td class="chapter">Air Non-attainment<span role="presentation"> . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</span></td>
              <td class="page" style="text-align: right"><span id="YESNO_AIRNONATT">XX</span></td>
          </tr>
          <tr class="entry">
              <td class="chapter">Impaired Waters<span role="presentation"> . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</span></td>
              <td class="page" style="text-align: right"><span id="YESNO_IMPWATERS">XX</span></td>
          </tr>
      </table>
    </div>
  </div>

    <div class="anchor" id="tribal-and-disadvantaged-status-anchor"></div>
    <section id="disadvantaged-info-section" tabindex="19">
    <div class="entry">
        <span class="chapter">Selected location contains American Indian Reservation Lands*<span role="presentation"> . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</span></span>
        <span id="YESNO_TRIBAL" class="page">XX</span>
    </div>
    <div class="entry">
        <span class="chapter">Selected location contains "Justice40 defined" disadvantaged community<span role="presentation"> . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</span></span>
        <span id="YESNO_CEJSTDIS" class="page">XX</span>
    </div>
    <div class="entry">
        <span class="chapter">Selected location contains an EPA IRA disadvantaged community<span role="presentation"> . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</span></span>
          <!--Note 6/22/23 temp disable IRA question, always NA until further notice. Remove ID so doesn't update span-->
		  <!--Note 7/11/23 added back-->
                <span id="YESNO_IRADIS" class="page">XX</span>
				<!--<span id="" class="page">N/A</span>-->
    </div>
  </section>
  <div class="page-4-footnotes">
    <!-- <div class="fine-print">Footnotes</div> -->
    <div id="report-summary-location" style="font-size: 16px;"><span style="font-size: 14px; font-style: italic;font-family: Arial, sans-serif;font-weight: 400;line-height: 23px;">Report for <span class="LOCATIONSTR">XX</span></span></div>
    <div id="report-footer" style="font-size: 16px;"><span style="font-size: 14px; font-style: italic;font-family: Arial, sans-serif;font-weight: 400;line-height: 23px;">Report produced <span class="REPORTDATE"></span> using EJScreen <span class="REPORTVERSION"></span></span></div>
  </div> 
    <!-- ----------------------------- Page 4 Content ------------------------------------- -->

  <div class="anchor" id="page-4-header-anchor"></div>
  <div class="header" id="page-4-header">
    <h2 style="padding: 0.75em 0;" tabindex="20">
        EJScreen Environmental and Socioeconomic Indicators Data
    </h2>
  </div>
  
    <div class="anchor" id="health-indicators-anchor"></div>
    <table class="color-alt-table indicators-section-table" tabindex="21" summary="Health indicators data" role="Health indicators data">
    <tr class="color-alt-table-title">
        <th colspan="6">
            Health Indicators
        </th>
    </tr>
    <tr class="color-alt-table-subheader">
        <th scope="col">Indicator</th>
        <th scope="col">Value</th>
        <th scope="col">State Average</th>
        <th scope="col">State Percentile</th>
        <th scope="col">US Average</th>
        <th scope="col">US Percentile</th>
    </tr>
    <tr>
        <th class="color-alt-table-row-header" scope="row">Low Life Expectancy</th>
        <td id="RAW_HI_LIFEEXPPCT">XX</td>
        <td id="S_HI_LIFEEXPPCT_AVG">XX</td>
        <td id="S_HI_LIFEEXPPCT_PCTILE">XX</td>
        <td id="N_HI_LIFEEXPPCT_AVG">XX</td>
        <td id="N_HI_LIFEEXPPCT_PCTILE">XX</td>
    </tr>
    <tr>
        <th class="color-alt-table-row-header" scope="row">Heart Disease</th>
        <td id="RAW_HI_HEARTDISEASE">XX</td>
        <td id="S_HI_HEARTDISEASE_AVG">XX</td>
        <td id="S_HI_HEARTDISEASE_PCTILE">XX</td>
        <td id="N_HI_HEARTDISEASE_AVG">XX</td>
        <td id="N_HI_HEARTDISEASE_PCTILE">XX</td>
    </tr>
    <tr>
        <th class="color-alt-table-row-header" scope="row">Asthma</th>
        <td id="RAW_HI_ASTHMA">XX</td>
        <td id="S_HI_ASTHMA_AVG">XX</td>
        <td id="S_HI_ASTHMA_PCTILE">XX</td>
        <td id="N_HI_ASTHMA_AVG">XX</td>
        <td id="N_HI_ASTHMA_PCTILE">XX</td>
    </tr>
    <tr>
        <th class="color-alt-table-row-header" scope="row">Cancer</th>
        <td id="RAW_HI_CANCER">XX</td>
        <td id="S_HI_CANCER_AVG">XX</td>
        <td id="S_HI_CANCER_PCTILE">XX</td>
        <td id="N_HI_CANCER_AVG">XX</td>
        <td id="N_HI_CANCER_PCTILE">XX</td>
    </tr>
    <tr>
        <th class="color-alt-table-row-header" scope="row">
            Persons with Disabilities
        </th>
        <td id="RAW_HI_DISABILITYPCT">XX</td>
        <td id="S_HI_DISABILITYPCT_AVG">XX</td>
        <td id="S_HI_DISABILITYPCT_PCTILE">XX</td>
        <td id="N_HI_DISABILITYPCT_AVG">XX</td>
        <td id="N_HI_DISABILITYPCT_PCTILE">XX</td>
    </tr>
  </table>

    <div class="anchor" id="climate-indicators-anchor"></div>
    <table class="color-alt-table indicators-section-table" tabindex="22" summary="Climate indicators data" role="Climate indicators data">
      <tr class="color-alt-table-title">
          <th colspan="6">
              Climate Indicators
          </th>
      </tr>
      <tr class="color-alt-table-subheader">
          <th scope="col">Indicator</th>
          <th scope="col">Value</th>
          <th scope="col">State Average</th>
          <th scope="col">State Percentile</th>
          <th scope="col">US Average</th>
          <th scope="col">US Percentile</th>
      </tr>
      <tr>
          <th class="color-alt-table-row-header" scope="row">Flood Risk</th>
          <td id="RAW_CI_FLOOD">XX</td>
          <td id="S_CI_FLOOD_AVG">XX</td>
          <td id="S_CI_FLOOD_PCTILE">XX</td>
          <td id="N_CI_FLOOD_AVG">XX</td>
          <td id="N_CI_FLOOD_PCTILE">XX</td>
      </tr>
      <tr>
          <th class="color-alt-table-row-header" scope="row">Wildfire Risk </th>
          <td id="RAW_CI_FIRE">XX</td>
          <td id="S_CI_FIRE_AVG">XX</td>
          <td id="S_CI_FIRE_PCTILE">XX</td>
          <td id="N_CI_FIRE_AVG">XX</td>
          <td id="N_CI_FIRE_PCTILE">XX</td>
      </tr>
      <!-- <tr>
          <th class="color-alt-table-row-header" scope="row">Extreme Heat</th>
          <td id="RAW_CI_HEAT">XX</td>
          <td id="S_CI_HEAT_AVG">XX</td>
          <td id="S_CI_HEAT_PCTILE">XX</td>
          <td id="N_CI_HEAT_AVG">XX</td>
          <td id="N_CI_HEAT_PCTILE">XX</td>
      </tr> -->
  </table>

    <div class="anchor" id="critical-service-gaps-anchor"></div>
    <table class="color-alt-table indicators-section-table" tabindex="23" summary="Critical service gaps data" role="Critical service gaps data">
      <tr class="color-alt-table-title">
          <th colspan="6">
            Critical Service Gaps
          </th>
      </tr>
      <tr class="color-alt-table-subheader">
          <th scope="col">Indicator</th>
          <th scope="col">Value</th>
          <th scope="col">State Average</th>
          <th scope="col">State Percentile</th>
          <th scope="col">US Average</th>
          <th scope="col">US Percentile</th>
      </tr>
      <tr>
          <th class="color-alt-table-row-header" scope="row">Broadband Internet</th>
          <td id="RAW_CG_LIMITEDBBPCT">XX</td>
          <td id="S_CG_LIMITEDBBPCT_AVG">XX</td>
          <td id="S_CG_LIMITEDBBPCT_PCTILE">XX</td>
          <td id="N_CG_LIMITEDBBPCT_AVG">XX</td>
          <td id="N_CG_LIMITEDBBPCT_PCTILE">XX</td>
      </tr>
      <tr>
          <th class="color-alt-table-row-header" scope="row">Lack of Health Insurance</th>
          <td id="RAW_CG_NOHINCPCT">XX</td>
          <td id="S_CG_NOHINCPCT_AVG">XX</td>
          <td id="S_CG_NOHINCPCT_PCTILE">XX</td>
          <td id="N_CG_NOHINCPCT_AVG">XX</td>
          <td id="N_CG_NOHINCPCT_PCTILE">XX</td>
      </tr>
      <tr>
          <th class="color-alt-table-row-header" scope="row">Housing Burden</th>
          <td id="YESNO_HOUSEBURDEN">XX</td>
          <td>N/A</td>
          <td>N/A</td>
          <td>N/A</td>
          <td>N/A</td>
      </tr>
      <tr>
          <th class="color-alt-table-row-header" scope="row">Transportation Access Burden</th>
          <td id="YESNO_TRANSDIS">XX</td>
          <td>N/A</td>
          <td>N/A</td>
          <td>N/A</td>
          <td>N/A</td>
      </tr>
      <tr>
          <th class="color-alt-table-row-header" scope="row">
              Food Desert
          </th>
          <td id="YESNO_FOODDESERT">XX</td>
          <td>N/A</td>
          <td>N/A</td>
          <td>N/A</td>
          <td>N/A</td>
      </tr>
  </table>
  <!-- <div id="page-4-footnotes" style=" height: 100px;
                padding: 0 10px;
                margin: 10px 0 10px 50px;">
               
                <span style="font-size: 14px; font-style: italic;">Report for <span id="LOCATIONSTR4">XX</span></span>
				<br/>
				<span style="font-size: 14px; font-style: italic;">Report produced <span id="REPORTDATE"></span> using EJScreen <span id="REPORTVERSION"></span></span>
            </div> -->
     <div class="page-4-footnotes">
      <!-- <div class="fine-print">Footnotes</div> -->
      <div id="report-summary-location" style="font-size: 16px;"><span style="font-size: 14px; font-style: italic;font-family: Arial, sans-serif;font-weight: 400;line-height: 23px;">Report for <span class="LOCATIONSTR">XX</span></span></div>
    	<div id="report-footer" style="font-size: 16px;"><span style="font-size: 14px; font-style: italic;font-family: Arial, sans-serif;font-weight: 400;line-height: 23px;">Report produced <span class="REPORTDATE"></span> using EJScreen <span class="REPORTVERSION"></span></span></div>
    </div> 

    <div class="footer">
      <div class="footer-text-segment">
          <a tabindex="24" href="https://www.epa.gov/ejscreen"
             style="text-decoration: none; color: white">www.epa.gov/ejscreen</a>
      </div>
	  
      <div class="footer-accent">
          &nbsp;
      </div>
  </div>
  </body>

  <!-- community information radial gauges -->
  <script>
    const responsiveArray = [
      {  
        breakpoint: 1300,
        options: {
          chart: { 
            height: 135
          }
        }
      },  
      {   
        breakpoint: 1250,
        options: {
          chart: { 
            height: 130
          }
        }
      },
      {  
        breakpoint: 1200,
        options: {
          chart: { 
            height: 125
          }
        }
      },
      {  
        breakpoint: 1150,
        options: {
          chart: { 
            height: 120
          }
        }
      },
      {  
        breakpoint: 1100,
        options: {
          chart: { 
            height: 115
          }
        }
      },
      {  
        breakpoint: 1050,
        options: {
          chart: { 
            height: 110
          }
        }
      },
      {  
        breakpoint: 1000,
        options: {
          chart: { 
            height: 105
          }
        }
      },
      {  
        breakpoint: 950,
        options: {
          chart: { 
            height: 100
          }
        }
      },
      {  
        breakpoint: 900,
        options: {
          chart: { 
            height: 95
          }
        }
      },
      {  
        breakpoint: 850,
        options: {
          chart: { 
            height: 90
          }
        }
      },
      {  
        breakpoint: 800,
        options: {
          chart: { 
            height: 85
          }
        }
      },
      {  
        breakpoint: 750,
        options: {
          chart: { 
            height: 80
          }
        }
      },
      {  
        breakpoint: 700,
        options: {
          chart: { 
            height: 75
          }
        }
      },
      {  
        breakpoint: 650,
        options: {
          chart: { 
            height: 68
          }
        }
      },
      {  
        breakpoint: 601,
        options: {
          chart: { 
            height: 150
          }
        }
      },
      {  
        breakpoint: 571,
        options: {
          chart: { 
            height: 142
          }
        }
      },
      {  
        breakpoint: 541,
        options: {
          chart: { 
            height: 134
          }
        }
      },
      {  
        breakpoint: 511,
        options: {
          chart: { 
            height: 125
          }
        }
      },
      {  
        breakpoint: 481,
        options: {
          chart: { 
            height: 117
          }
        }
      },
      {  
        breakpoint: 451,
        options: {
          chart: { 
            height: 109
          }
        }
      },
      {  
        breakpoint: 421,
        options: {
          chart: { 
            height: 100
          }
        }
      },
      {  
        breakpoint: 391,
        options: {
          chart: { 
            height: 92
          }
        }
      },
      {  
        breakpoint: 361,
        options: {
          chart: { 
            height: 84
          }
        }
      },
      {  
        breakpoint: 331,
        options: {
          chart: { 
            height: 75
          }
        }
      },
    ]

    function doGauges() {
      //low income
      var options = {
        series: [statHash["P_LOWINC"]],
        chart: {
          type: "radialBar",
          height: 140,
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              margin: 0,
              background: "#6c6d70",
              strokeWidth: "115%",
            },
            dataLabels: {
              show: false,
            },
          },
        },
        fill: {
          colors: ["#3A7E11"],
          type: "solid",
        },
        responsive: responsiveArray
      };

      var chart = new ApexCharts(
        document.querySelector("#low_income_radial_gauge"),
        options
      );
      chart.render();

      //people of color
      var options = {
        series: [statHash["PCT_MINORITY"]],
        chart: {
          type: "radialBar",
          height: 140,
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              margin: 0,
              background: "#6c6d70",
              strokeWidth: "115%",
            },
            dataLabels: {
              show: false,
            },
          },
        },
        fill: {
          colors: ["#3A7E11"],
          type: "solid",
        },
        responsive: responsiveArray
      };

      var chart = new ApexCharts(
        document.querySelector("#people_of_color_radial_gauge"),
        options
      );
      chart.render();

      //less than high school
      var options = {
        series: [statHash["P_EDU_LTHS"]],
        chart: {
          type: "radialBar",
          height: 140,
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              margin: 0,
              background: "#6c6d70",
              strokeWidth: "115%",
            },
            dataLabels: {
              show: false,
            },
          },
        },
        fill: {
          colors: ["#3A7E11"],
          type: "solid",
        },
        responsive: responsiveArray
      };

      var chart = new ApexCharts(
        document.querySelector("#less_than_hs_radial_gauge"),
        options
      );
      chart.render();

      //limited english households
      var options = {
        series: [statHash["P_LIMITED_ENG_HH"]],
        chart: {
          type: "radialBar",
          height: 140,
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              margin: 0,
              background: "#6c6d70",
              strokeWidth: "115%",
            },
            dataLabels: {
              show: false,
            },
          },
        },
        fill: {
          colors: ["#3A7E11"],
          type: "solid",
        },
        responsive: responsiveArray
      };

      var chart = new ApexCharts(
        document.querySelector("#limited_english_households_radial_gauge"),
        options
      );
      chart.render();

      //unemployment
      var options = {
        series: [statHash["P_EMP_STAT_UNEMPLOYED"]],
        chart: {
          type: "radialBar",
          height: 140,
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              margin: 0,
              background: "#6c6d70",
              strokeWidth: "115%",
            },
            dataLabels: {
              show: false,
            },
          },
        },
        fill: {
          colors: ["#3A7E11"],
          type: "solid",
        },
        responsive: responsiveArray
      };

      var chart = new ApexCharts(
        document.querySelector("#unemployment_radial_gauge"),
        options
      );
      chart.render();

      //persons with disabilities
      var options = {
        series: [statHash["P_DISABILITY"]],
        chart: {
          type: "radialBar",
          height: 140,
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              margin: 0,
              background: "#6c6d70",
              strokeWidth: "115%",
            },
            dataLabels: {
              show: false,
            },
          },
        },
        fill: {
          colors: ["#3A7E11"],
          type: "solid",
        },
        responsive: responsiveArray
      };

      var chart = new ApexCharts(
        document.querySelector("#persons_with_disabilities_radial_gauge"),
        options
      );
      chart.render();

      //male
      var options = {
        series: [statHash["P_MALES"]],
        chart: {
          type: "radialBar",
          height: 140,
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              margin: 0,
              background: "#6c6d70",
              strokeWidth: "115%",
            },
            dataLabels: {
              show: false,
            },
          },
        },
        fill: {
          colors: ["#3A7E11"],
          type: "solid",
        },
        responsive: responsiveArray
      };

      var chart = new ApexCharts(
        document.querySelector("#male_radial_gauge"),
        options
      );
      chart.render();

      //female
      var options = {
        series: [statHash["P_FEMALES"]],
        chart: {
          type: "radialBar",
          height: 140,
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              margin: 0,
              background: "#6c6d70",
              strokeWidth: "115%",
            },
            dataLabels: {
              show: false,
            },
          },
        },
        fill: {
          colors: ["#3A7E11"],
          type: "solid",
        },
        responsive: responsiveArray
      };

      var chart = new ApexCharts(
        document.querySelector("#female_radial_gauge"),
        options
      );
      chart.render();

      //owner occupied
      var options = {
        series: [statHash["P_OWN_OCCUPIED"]],
        chart: {
          type: "radialBar",
          height: 140,
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              margin: 0,
              background: "#6c6d70",
              strokeWidth: "115%",
            },
            dataLabels: {
              show: false,
            },
          },
        },
        fill: {
          colors: ["#3A7E11"],
          type: "solid",
        },
        responsive: responsiveArray
      };

      var chart = new ApexCharts(
        document.querySelector("#owner_occupied_radial_gauge"),
        options
      );
      chart.render();

      var options = {
        series: [statHash["P_LOWINC"]],
        chart: {
          type: "radialBar",
          height: 140,
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              margin: 0,
              background: "#6c6d70",
              strokeWidth: "115%",
            },
            dataLabels: {
              show: false,
            },
          },
        },
        fill: {
          colors: ["#3A7E11"],
          type: "solid",
        },
        responsive: responsiveArray
      };

      //white percent
      var options = {
        series: [statHash["P_NHWHITE"]],
        chart: {
          type: "radialBar",
          height: 140,
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              margin: 0,
              background: "#888888",
              strokeWidth: "115%",
            },
            dataLabels: {
              show: false
            },
          },
        },
        fill: {
          colors: ["#0E6CB6"],
          type: "solid",
          pattern: {
            width: "100%",
          },
        },
        responsive: responsiveArray
      };

      var chart = new ApexCharts(
        document.querySelector("#white_percent_radial_gauge"),
        options
      );
      chart.render();

      //black percent
      var options = {
        series: [statHash["P_NHBLACK"]],
        chart: {
          type: "radialBar",
          height: 140,
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              margin: 0,
              background: "#888888",
              strokeWidth: "115%",
            },
            dataLabels: {
              show: false
            },
          },
        },
        fill: {
          colors: ["#0E6CB6"],
          type: "solid",
          pattern: {
            width: "100%",
          },
        },
        responsive: responsiveArray
      };

      var chart = new ApexCharts(
        document.querySelector("#black_percent_radial_gauge"),
        options
      );
      chart.render();

      //american indian percent
      var options = {
        series: [statHash["P_NHAMERIND"]],
        chart: {
          type: "radialBar",
          height: 140,
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              margin: 0,
              background: "#888888",
              strokeWidth: "115%",
            },
            dataLabels: {
              show: false
            },
          },
        },
        fill: {
          colors: ["#0E6CB6"],
          type: "solid",
          pattern: {
            width: "100%",
          },
        },
        responsive: responsiveArray
      };

      var chart = new ApexCharts(
        document.querySelector("#american_indian_percent_radial_gauge"),
        options
      );
      chart.render();

      //asian percent
      var options = {
        series: [statHash["P_NHASIAN"]],
        chart: {
          type: "radialBar",
          height: 140,
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              margin: 0,
              background: "#888888",
              strokeWidth: "115%",
            },
            dataLabels: {
              show: false
            },
          },
        },
        fill: {
          colors: ["#0E6CB6"],
          type: "solid",
          pattern: {
            width: "100%",
          },
        },
        responsive: responsiveArray
      };

      var chart = new ApexCharts(
        document.querySelector("#asian_percent_radial_gauge"),
        options
      );
      chart.render();

      //hawaiian / pacific islander percent
      var options = {
        series: [statHash["P_NHHAWPAC"]],
        chart: {
          type: "radialBar",
          height: 140,
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              margin: 0,
              background: "#888888",
              strokeWidth: "115%",
            },
            dataLabels: {
              show: false
            },
          },
        },
        fill: {
          colors: ["#0E6CB6"],
          type: "solid",
          pattern: {
            width: "100%",
          },
        },
        responsive: responsiveArray
      };

      var chart = new ApexCharts(
        document.querySelector("#hawaiian_percent_radial_gauge"),
        options
      );
      chart.render();

      //other race percent
      var options = {
        series: [statHash["P_NHOTHER_RACE"]],
        chart: {
          type: "radialBar",
          height: 140,
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              margin: 0,
              background: "#888888",
              strokeWidth: "115%",
            },
            dataLabels: {
              show: false
            },
          },
        },
        fill: {
          colors: ["#0E6CB6"],
          type: "solid",
          pattern: {
            width: "100%",
          },
        },
        responsive: responsiveArray
      };

      var chart = new ApexCharts(
        document.querySelector("#other_race_percent_radial_gauge"),
        options
      );
      chart.render();

      //multiple races percent
      var options = {
        series: [statHash["P_NHTWOMORE"]],
        chart: {
          type: "radialBar",
          height: 140,
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              margin: 0,
              background: "#888888",
              strokeWidth: "115%",
            },
            dataLabels: {
              show: false
            },
          },
        },
        fill: {
          colors: ["#0E6CB6"],
          type: "solid",
          pattern: {
            width: "100%",
          },
        },
        responsive: responsiveArray
      };

      var chart = new ApexCharts(
        document.querySelector("#multiple_races_percent_radial_gauge"),
        options
      );
      chart.render();

      //hispanic percent
      var options = {
        series: [statHash["P_HISP"]],
        chart: {
          type: "radialBar",
          height: 140,
          sparkline: {
            enabled: true,
          },
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              margin: 0,
              background: "#888888",
              strokeWidth: "115%",
            },
            dataLabels: {
              show: false
            },
          },
        },
        fill: {
          colors: ["#0E6CB6"],
          type: "solid",
          pattern: {
            width: "100%",
          },
        },
        responsive: responsiveArray
      };

      var chart = new ApexCharts(
        document.querySelector("#hispanic_percent_radial_gauge"),
        options
      );
      chart.render();
    }
  </script>

  <script>
    const barChartResponsiveArray = [
      {
        breakpoint: 1390,
        //reduce bar border radius
        options: {
          xaxis: {
            categories: [
              ["Particulate", "Matter"],
              ["Ozone"],
              ["Diesel", "Particulate", "Matter"],
              ["Air", "Toxics", "Cancer", "Risk*"],
              ["Air", "Toxics", "Respiratory", "HI*"],
              ["Toxic", "Releases", "To Air"],
              ["Traffic", "Proximity"],
              ["Lead", "Paint"],
              ["Superfund", "Proximity"],
              ["RMP", "Facility", "Proximity"],
              ["Hazardous", "Waste", "Proximity"],
              ["Underground", "Storage", "Tanks"],
              ["Wastewater", "Discharge"],
            ],
            labels: {
              rotate: 0,
              maxHeight: 120,
              minHeight: undefined,
              style: {
                fontSize: 12,
              },
            },
          },
          plotOptions: {
            bar: {
              borderRadius: 13,
            },
          },
          legend: {
            position: "right",
            horizontalAlign: 'center',
            offsetY: 322,
            fontWeight: 700,
            width: 160,
            height: 62,
            markers: {
                width: 18,
                height: 18,
                radius: 0,
                offsetY: 4,
                offsetX: -5
            },
            itemMargin: {
                horizontal: 5,
                vertical: 3
            }
          },
          dataLabels: {
            enabled: true,
            offsetX: 0,
            offsetY: -18,
            style: {
              fontSize: "12px",
              fontFamily: '"Source Sans Pro", sans-serif',
              colors: ["#000"],
              fontWeight: 700
            },
          },
          title: {
            align: "center",
            style: {
              fontSize: 17,
              fontFamily: "Arial",
              fontWeight: 800,
            },
          },
          yaxis: {
            max: 100,
            min: 0,
            title: {
              text: "PERCENTILE",
              style: {
                fontFamily: "Oswald, Arial, sans-serif",
                fontWeight: 500,
                fontSize: 16,
              },
            },
          },
        },
      },

      {
        breakpoint: 1250,
        //rotate x-axis labels, reduce bar border radius
        options: {
          xaxis: {
            categories: [
            ["Particulate", "Matter 2.5"],
                    ["Ozone"],
					["Nitrogen", "Dioxide", "(NO\u2082)"],
                    ["Diesel", "Particulate", "Matter"],                    
                    ["Toxic", "Releases", "To Air"],
                    ["Traffic", "Proximity"],
                    ["Lead", "Paint"],
                    ["Superfund", "Proximity"],
                    ["RMP", "Facility", "Proximity"],
                    ["Hazardous", "Waste", "Proximity"],
                    ["Underground", "Storage", "Tanks"],
                    ["Wastewater", "Discharge"],
					["Drinking", "Water", "Non-Compliance"],
            ],
            labels: {
              rotate: -45,
              rotateAlways: true,
              maxHeight: 130,
              minHeight: 130,
              style: {
                fontSize: 12,
              },
            },
          },
          plotOptions: {
            bar: {
              borderRadius: 11,
            },
          },
          legend: {
            position: "right",
            horizontalAlign: 'center',
            offsetY: 322,
            fontWeight: 700,
            width: 160,
            height: 62,
            markers: {
                width: 18,
                height: 18,
                radius: 0,
                offsetY: 4,
                offsetX: -5
            },
            itemMargin: {
                horizontal: 5,
                vertical: 3
            }
          },
          dataLabels: {
            enabled: true,
            offsetX: 0,
            offsetY: -18,
            style: {
              fontSize: "12px",
              fontFamily: '"Source Sans Pro", sans-serif',
              colors: ["#000"],
              fontWeight: 700
            },
          },
          title: {
            align: "center",
            style: {
              fontSize: 17,
              fontFamily: "Arial",
              fontWeight: 800,
            },
          },
          yaxis: {
            max: 100,
            min: 0,
            title: {
              text: "PERCENTILE",
              style: {
                fontFamily: "Oswald, Arial, sans-serif",
                fontWeight: 500,
                fontSize: 16,
              },
            },
          },
        }
      },

      {
        breakpoint: 1100, 
        //reduce bar border radius, reduce x-axis label font size
        options: {
          xaxis: {
            categories: [
            ["Particulate", "Matter 2.5"],
                    ["Ozone"],
					["Nitrogen", "Dioxide", "(NO\u2082)"],
                    ["Diesel", "Particulate", "Matter"],                    
                    ["Toxic", "Releases", "To Air"],
                    ["Traffic", "Proximity"],
                    ["Lead", "Paint"],
                    ["Superfund", "Proximity"],
                    ["RMP", "Facility", "Proximity"],
                    ["Hazardous", "Waste", "Proximity"],
                    ["Underground", "Storage", "Tanks"],
                    ["Wastewater", "Discharge"],
					["Drinking", "Water", "Non-Compliance"],
            ],
            labels: {
              rotate: -45,
              rotateAlways: true,
              maxHeight: 130,
              minHeight: 130,
              style: {
                fontSize: 11,
              },
            },
          },
          plotOptions: {
            bar: {
              borderRadius: 9,
            },
          },
          legend: {
            position: "right",
            horizontalAlign: 'center',
            offsetX: 0,
            offsetY: 322,
            fontWeight: 700,
            width: 160,
            height: 62,
            markers: {
                width: 18,
                height: 18,
                radius: 0,
                offsetY: 4,
                offsetX: -5
            },
            itemMargin: {
                horizontal: 5,
                vertical: 3
            }
          },
          dataLabels: {
            enabled: true,
            offsetX: 0,
            offsetY: -18,
            style: {
              fontSize: "12px",
              fontFamily: '"Source Sans Pro", sans-serif',
              colors: ["#000"],
              fontWeight: 700
            },
          },
          title: {
            align: "center",
            style: {
              fontSize: 17,
              fontFamily: "Arial",
              fontWeight: 800,
            },
          },
          yaxis: {
            max: 100,
            min: 0,
            title: {
              text: "PERCENTILE",
              style: {
                fontFamily: "Oswald, Arial, sans-serif",
                fontWeight: 500,
                fontSize: 16,
              },
            },
          },
        }
      },

      {
        breakpoint: 900, 
        //reduce bar border radius, move the legend beneath the chart area
        options: {
          xaxis: {
            categories: [
                    ["Particulate", "Matter 2.5"],
                    ["Ozone"],
					          ["Nitrogen", "Dioxide", "(NO\u2082)"],
                    ["Diesel", "Particulate", "Matter"],                    
                    ["Toxic", "Releases", "To Air"],
                    ["Traffic", "Proximity"],
                    ["Lead", "Paint"],
                    ["Superfund", "Proximity"],
                    ["RMP", "Facility", "Proximity"],
                    ["Hazardous", "Waste", "Proximity"],
                    ["Underground", "Storage", "Tanks"],
                    ["Wastewater", "Discharge"],
				          	["Drinking", "Water", "Non-Compliance"],
            ],
            labels: {
              rotate: -45,
              rotateAlways: true,
              maxHeight: 130,
              minHeight: 130,
              style: {
                fontSize: 12,
              },
            },
          },
          plotOptions: {
            bar: {
              borderRadius: 6,
            },
          },
          legend: {
            position: "bottom",
            offsetX: '100%',    //causes legend to align to the right side
            offsetY: -1,        //causes legend to appear beneath the x-axis labels
            width: 160,
            height: 62,
            horizontalAlign: 'left',
            fontWeight: 700,
            markers: {
                width: 18,
                height: 18,
                radius: 0,
                offsetY: 4,
                offsetX: -5
            },
            itemMargin: {
                horizontal: 5,
                vertical: 3
            }
          },
          dataLabels: {
            enabled: true,
            offsetX: 0,
            offsetY: -18,
            style: {
              fontSize: "12px",
              fontFamily: '"Source Sans Pro", sans-serif',
              colors: ["#000"],
              fontWeight: 700
            },
          },
          title: {
            align: "center",
            style: {
              fontSize: 17,
              fontFamily: "Arial",
              fontWeight: 800,
            },
          },
          yaxis: {
            max: 100,
            min: 0,
            title: {
              text: "PERCENTILE",
              style: {
                fontFamily: "Oswald, Arial, sans-serif",
                fontWeight: 500,
                fontSize: 16,
              },
            },
          },
        }
      },

      {
        breakpoint: 700, 
        //reduce bar border radius, remove the data labels above bars, reduce title font size
        options: {
          xaxis: {
            categories: [
            [       "Particulate", "Matter 2.5"],
                    ["Ozone"],
					          ["Nitrogen", "Dioxide", "(NO\u2082)"],
                    ["Diesel", "Particulate", "Matter"],                    
                    ["Toxic", "Releases", "To Air"],
                    ["Traffic", "Proximity"],
                    ["Lead", "Paint"],
                    ["Superfund", "Proximity"],
                    ["RMP", "Facility", "Proximity"],
                    ["Hazardous", "Waste", "Proximity"],
                    ["Underground", "Storage", "Tanks"],
                    ["Wastewater", "Discharge"],
				          	["Drinking", "Water", "Non-Compliance"],
            ],
            labels: {
              rotate: -45,
              rotateAlways: true,
              maxHeight: 130,
              minHeight: 130,
              style: {
                fontSize: 12,
              },
            },
          },
          plotOptions: {
            bar: {
              borderRadius: 5,
            },
          },
          legend: {
            position: "bottom",
            offsetX: '100%',    //causes legend to align to the right side
            offsetY: -1,        //causes legend to appear beneath the x-axis labels
            width: 160,
            height: 62,
            horizontalAlign: 'left',
            fontWeight: 700,
            markers: {
                width: 18,
                height: 18,
                radius: 0,
                offsetY: 4,
                offsetX: -5
            },
            itemMargin: {
                horizontal: 5,
                vertical: 3
            }
          },
          dataLabels: {
            enabled: false,
            offsetX: 0,
            offsetY: -18,
            style: {
              fontSize: 11,
              fontFamily: '"Source Sans Pro", sans-serif',
              colors: ["#000"],
              fontWeight: 500
            },
          },
          title: {
            align: "center",
            style: {
              fontSize: 17,
              fontFamily: "Arial",
              fontWeight: 800,
            },
          },
          yaxis: {
            max: 100,
            min: 0,
            title: {
              text: "PERCENTILE",
              style: {
                fontFamily: "Oswald, Arial, sans-serif",
                fontWeight: 500,
                fontSize: 16,
              },
            },
          },
        },
      },

      {
        breakpoint: 625, 
        //reduce bar border radius, reduce title font size
        options: {
          xaxis: {
            categories: [
            ["Particulate", "Matter 2.5"],
                    ["Ozone"],
					          ["Nitrogen", "Dioxide", "(NO\u2082)"],
                    ["Diesel", "Particulate", "Matter"],                    
                    ["Toxic", "Releases", "To Air"],
                    ["Traffic", "Proximity"],
                    ["Lead", "Paint"],
                    ["Superfund", "Proximity"],
                    ["RMP", "Facility", "Proximity"],
                    ["Hazardous", "Waste", "Proximity"],
                    ["Underground", "Storage", "Tanks"],
                    ["Wastewater", "Discharge"],
				          	["Drinking", "Water", "Non-Compliance"],
            ],
            labels: {
              rotate: -45,
              rotateAlways: true,
              maxHeight: 130,
              minHeight: 130,
              style: {
                fontSize: 12,
                fontWeight: 500
              },
            },
          },
          plotOptions: {
            bar: {
              borderRadius: 5,
            },
          },
          legend: {
            position: "bottom",
            offsetX: '100%',    //causes legend to align to the right side
            offsetY: -1,        //causes legend to appear beneath the x-axis labels
            width: 160,
            height: 62,
            horizontalAlign: 'left',
            fontWeight: 700,
            markers: {
                width: 18,
                height: 18,
                radius: 0,
                offsetY: 4,
                offsetX: -5
            },
            itemMargin: {
                horizontal: 5,
                vertical: 3
            }
          },
          dataLabels: {
            enabled: false,
            offsetX: 0,
            offsetY: -18,
            style: {
              fontSize: 11,
              fontFamily: '"Source Sans Pro", sans-serif',
              colors: ["#000"],
              fontWeight: 500
            },
          },
          title: {
            align: "center",
            style: {
              fontSize: 15,
              fontFamily: "Arial",
              fontWeight: 800,
            },
          },
          yaxis: {
            max: 100,
            min: 0,
            title: {
              text: "PERCENTILE",
              style: {
                fontFamily: "Oswald, Arial, sans-serif",
                fontWeight: 500,
                fontSize: 16,
              },
            },
          },
        },
      },

      {
        breakpoint: 550, 
        //reduce bar border radius, reduce title font size, reduce y-axis title font size, reduce legend size
        options: {
          xaxis: {
            categories: [
            ["Particulate", "Matter 2.5"],
                    ["Ozone"],
					          ["Nitrogen", "Dioxide", "(NO\u2082)"],
                    ["Diesel", "Particulate", "Matter"],                    
                    ["Toxic", "Releases", "To Air"],
                    ["Traffic", "Proximity"],
                    ["Lead", "Paint"],
                    ["Superfund", "Proximity"],
                    ["RMP", "Facility", "Proximity"],
                    ["Hazardous", "Waste", "Proximity"],
                    ["Underground", "Storage", "Tanks"],
                    ["Wastewater", "Discharge"],
				          	["Drinking", "Water", "Non-Compliance"],
            ],
            labels: {
              rotate: -90,
              rotateAlways: true,
              maxHeight: 190,
              minHeight: 190,
              style: {
                fontSize: 12,
                fontWeight: 700
              },
            },
          },
          plotOptions: {
            bar: {
              borderRadius: 4,
            },
          },
          legend: {
            position: "bottom",
            offsetX: '100%',    //causes legend to align to the right side
            offsetY: -1,        //causes legend to appear beneath the x-axis labels
            width: 146,
            height: 55,
            horizontalAlign: 'left',
            fontSize: 11,
            fontWeight: 700,
            markers: {
                width: 15,
                height: 15,
                radius: 0,
                offsetY: 4,
                offsetX: -5
            },
            itemMargin: {
                horizontal: 4,
                vertical: 2
            }
          },
          dataLabels: {
            enabled: false,
            offsetX: 0,
            offsetY: -18,
            style: {
              fontSize: 11,
              fontFamily: '"Source Sans Pro", sans-serif',
              colors: ["#000"],
              fontWeight: 500
            },
          },
          title: {
            text: ["EJ INDEXES FOR THE", "SELECTED LOCATION"],
            align: "center",
            style: {
              fontSize: 14,
              fontFamily: "Arial",
              fontWeight: 800,
            },
          },
          yaxis: {
            max: 100,
            min: 0,
            title: {
              text: "PERCENTILE",
              style: {
                fontFamily: "Oswald, Arial, sans-serif",
                fontWeight: 500,
                fontSize: 14,
              },
            },
          },
        },
      },

      {
        breakpoint: 475, 
        //reduce bar border radius, reduce title font size, reduce y-axis title font size, angle x-axis labels straight downward
        options: {
          xaxis: {
            categories: [
              // ["Particulate Matter"],
              // ["Ozone"],
              // ["Diesel Particulate Matter"],
              // ["Air Toxics Cancer Risk*"],
              // ["Air Toxics Respiratory HI*"],
              // ["Toxic Releases To Air"],
              // ["Traffic Proximity"],
              // ["Lead Paint"],
              // ["Superfund Proximity"],
              // ["RMP Facility Proximity"],
              // ["Hazardous Waste Proximity"],
              // ["Underground Storage Tanks"],
              // ["Wastewater Discharge"],
              ["Particulate", "Matter 2.5"],
                    ["Ozone"],
				          	["Nitrogen", "Dioxide", "(NO\u2082)"],
                    ["Diesel", "Particulate", "Matter"],                    
                    ["Toxic", "Releases", "To Air"],
                    ["Traffic", "Proximity"],
                    ["Lead", "Paint"],
                    ["Superfund", "Proximity"],
                    ["RMP", "Facility", "Proximity"],
                    ["Hazardous", "Waste", "Proximity"],
                    ["Underground", "Storage", "Tanks"],
                    ["Wastewater", "Discharge"],
					          ["Drinking", "Water", "Non-Compliance"],
            ],
            labels: {
              rotate: -90,
              rotateAlways: true,
              maxHeight: 190,
              minHeight: 190,
              style: {
                fontSize: 12,
                fontWeight: 700
              },
            },
          },
          plotOptions: {
            bar: {
              borderRadius: 2,
            },
          },
          legend: {
            position: "bottom",
            offsetX: '100%',    //causes legend to align to the right side
            offsetY: -1,        //causes legend to appear beneath the x-axis labels
            width: 146,
            height: 55,
            horizontalAlign: 'left',
            fontSize: 11,
            fontWeight: 700,
            markers: {
                width: 15,
                height: 15,
                radius: 0,
                offsetY: 4,
                offsetX: -5
            },
            itemMargin: {
                horizontal: 4,
                vertical: 2
            }
          },
          dataLabels: {
            enabled: false,
            offsetX: 0,
            offsetY: -18,
            style: {
              fontSize: 11,
              fontFamily: '"Source Sans Pro", sans-serif',
              colors: ["#000"],
              fontWeight: 500
            },
          },
          title: {
            text: ["EJ INDEXES FOR THE", "SELECTED LOCATION"],
            align: "center",
            style: {
              fontSize: 13,
              fontFamily: "Arial",
              fontWeight: 800,
            },
          },
          yaxis: {
            max: 100,
            min: 0,
            title: {
              text: "PERCENTILE",
              style: {
                fontFamily: "Oswald, Arial, sans-serif",
                fontWeight: 500,
                fontSize: 13,
              },
            },
          },
        },
      }
      ];

    function doEJMainChart() {
      //Generate the EJ Index bar chart
      var options = {
        series: [
          {
            name: "State Percentile",
            data: [
              // //'State Percentiles:'
              // //'Particulate Matter','Ozone', 'Diesel Particulate Matter',
              // Number(ejmainHash["S_P2_PM25"]), Number(ejmainHash["S_P2_O3"]), Number(ejmainHash["S_P2_DIESEL"]),
              // //'Air Toxics Cancer Risk*', 'Air Toxics Respiratory HI*',        'Toxic Releases to Air*'    'Traffic Proximity',
              // Number(ejmainHash["S_P2_CANCER"]), Number(ejmainHash["S_P2_RESP"]), Number(ejmainHash["S_P2_RSEI_AIR"]), Number(ejmainHash["S_P2_TRAFFIC"]),
              // //'Lead Paint', 'Superfund Proximity', 'RMP Facility Proximity',
              // Number(ejmainHash["S_P2_LEAD"]), Number(ejmainHash["S_P2_NPL"]), Number(ejmainHash["S_P2_RMP"]),
              // //'Hazardous Waste Proximity', 'Underground Storage Tanks', 'Wastewater Discharge'
              // Number(ejmainHash["S_P2_TSDF"]), Number(ejmainHash["S_P2_UST"]), Number(ejmainHash["S_P2_NPDES"]),
              Number(ejmainHash["S_P2_PM25"]), 
						Number(ejmainHash["S_P2_O3"]), 
						Number(ejmainHash["S_P2_NO2"]), 
						Number(ejmainHash["S_P2_DIESEL"]),						
						Number(ejmainHash["S_P2_RSEI_AIR"]), 
						Number(ejmainHash["S_P2_TRAFFIC"]),                       
            Number(ejmainHash["S_P2_LEAD"]), 
						Number(ejmainHash["S_P2_NPL"]), 
						Number(ejmainHash["S_P2_RMP"]),                      
            Number(ejmainHash["S_P2_TSDF"]), 
						Number(ejmainHash["S_P2_UST"]), 
						Number(ejmainHash["S_P2_NPDES"]),
						Number(ejmainHash["S_P2_DWATER"]), 
            ],
          },
          {
            name: "National Percentile",
            data: [
            Number(ejmainHash["N_P2_PM25"]), 
						Number(ejmainHash["N_P2_O3"]), 
						Number(ejmainHash["N_P2_NO2"]), 
						Number(ejmainHash["N_P2_DIESEL"]),						
						Number(ejmainHash["N_P2_RSEI_AIR"]),  
						Number(ejmainHash["N_P2_TRAFFIC"]),                    
            Number(ejmainHash["N_P2_LEAD"]), 
						Number(ejmainHash["N_P2_NPL"]),
						Number(ejmainHash["N_P2_RMP"]),                      
            Number(ejmainHash["N_P2_TSDF"]), 
						Number(ejmainHash["N_P2_UST"]), 
						Number(ejmainHash["N_P2_NPDES"]),
						Number(ejmainHash["N_P2_DWATER"]), 
              // //'Particulate Matter','Ozone', 'Diesel Particulate Matter',
              // Number(ejmainHash["N_P2_PM25"]), Number(ejmainHash["N_P2_O3"]), Number(ejmainHash["N_P2_DIESEL"]),
              // //'Air Toxics Cancer Risk*', 'Air Toxics Respiratory HI*',        'Toxic Releases to Air*'     'Traffic Proximity',
              // Number(ejmainHash["N_P2_CANCER"]), Number(ejmainHash["N_P2_RESP"]), Number(ejmainHash["N_P2_RSEI_AIR"]),  Number(ejmainHash["N_P2_TRAFFIC"]),
              // //'Lead Paint', 'Superfund Proximity', 'RMP Facility Proximity',
              // Number(ejmainHash["N_P2_LEAD"]), Number(ejmainHash["N_P2_NPL"]), Number(ejmainHash["N_P2_RMP"]),
              // //'Hazardous Waste Proximity', 'Underground Storage Tanks', 'Wastewater Discharge'
              // Number(ejmainHash["N_P2_TSDF"]), Number(ejmainHash["N_P2_UST"]), Number(ejmainHash["N_P2_NPDES"]),
            ],
          },
        ],
        chart: {
          type: "bar",
          height: 460,
          width: "100%",
        },
        title: {
          text: "EJ INDEXES FOR THE SELECTED LOCATION",
          align: "center",
          style: {
            fontSize: 19,
            fontFamily: "Arial",
            fontWeight: 800,
          },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            dataLabels: {
              position: "top",
            },
            columnWidth: "65%",
            borderRadius: 15,
            borderRadiusApplication: "end",
          },
        },
        colors: ["#0E6CB6", "#3A7E11"],
        legend: {
          position: "right",
          offsetY: 322,
          fontWeight: 700,
          height: 62,
          markers: {
              width: 18,
              height: 18,
              radius: 0,
              offsetY: 4,
              offsetX: -5
          },
          itemMargin: {
              horizontal: 5,
              vertical: 3
          }
        },
        tooltip: {
          enabled: false,
        },
        dataLabels: {
          enabled: true,
          offsetX: 0,
          offsetY: -18,
          formatter: function (val, opts) {
            return val == 100 ? '' : val;
          },
          style: {
            fontSize: "12px",
            fontFamily: '"Source Sans Pro", sans-serif',
            colors: ["#000"],
            fontWeight: 700
          },
        },
        stroke: {
          show: true,
          width: 1,
          colors: ["#fff"],
        },
        tooltip: {
          shared: true,
          intersect: false,
        },
        xaxis: {
          categories: [
                    ["Particulate", "Matter 2.5"],
                    ["Ozone"],
					          ["Nitrogen", "Dioxide", "(NO\u2082)"],
                    ["Diesel", "Particulate", "Matter"],                    
                    ["Toxic", "Releases", "To Air"],
                    ["Traffic", "Proximity"],
                    ["Lead", "Paint"],
                    ["Superfund", "Proximity"],
                    ["RMP", "Facility", "Proximity"],
                    ["Hazardous", "Waste", "Proximity"],
                    ["Underground", "Storage", "Tanks"],
                    ["Wastewater", "Discharge"],
					          ["Drinking", "Water", "Non-Compliance"],
          ],
          labels: {
            rotate: 0,
            maxHeight: 120,
            minHeight: undefined,
            hideOverlappingLabels: false,
            style: {
              fontSize: 12,
            }
          },
        },
        yaxis: {
          max: 100,
          min: 0,
          title: {
            text: "PERCENTILE",
            style: {
              fontFamily: "Oswald, Arial, sans-serif",
              fontWeight: 500,
              fontSize: 16,
            },
          },
        },
        responsive: barChartResponsiveArray
      };

      var chart = new ApexCharts(
        document.querySelector("#ej-index-bar-chart"),
        options
      );
      chart.render();
    }
  </script>

  <script>
    barChartResponsiveArray2 = JSON.parse(JSON.stringify(barChartResponsiveArray));
    barChartResponsiveArray2[6] = {
      breakpoint: 550, 
      //reduce bar border radius, reduce title font size, reduce y-axis title font size, reduce legend size
      options: {
        xaxis: {
          categories: [
                    ["Particulate", "Matter 2.5"],
                    ["Ozone"],
				           	["Nitrogen", "Dioxide", "(NO\u2082)"],
                    ["Diesel", "Particulate", "Matter"],                    
                    ["Toxic", "Releases", "To Air"],
                    ["Traffic", "Proximity"],
                    ["Lead", "Paint"],
                    ["Superfund", "Proximity"],
                    ["RMP", "Facility", "Proximity"],
                    ["Hazardous", "Waste", "Proximity"],
                    ["Underground", "Storage", "Tanks"],
                    ["Wastewater", "Discharge"],
					          ["Drinking", "Water", "Non-Compliance"],
          ],
          labels: {
            rotate: -90,
            rotateAlways: true,
            maxHeight: 190,
            minHeight: 190,
            style: {
              fontSize: 12,
              fontWeight: 700
            },
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
          },
        },
        legend: {
          position: "bottom",
          offsetX: '100%',    //causes legend to align to the right side
          offsetY: -1,        //causes legend to appear beneath the x-axis labels
          width: 146,
          height: 55,
          horizontalAlign: 'left',
          fontSize: 11,
          fontWeight: 700,
          markers: {
              width: 15,
              height: 15,
              radius: 0,
              offsetY: 4,
              offsetX: -5
          },
          itemMargin: {
              horizontal: 4,
              vertical: 2
          }
        },
        dataLabels: {
          enabled: false,
          offsetX: 0,
          offsetY: -18,
          style: {
            fontSize: 11,
            fontFamily: '"Source Sans Pro", sans-serif',
            colors: ["#000"],
            fontWeight: 500
          },
        },
        title: {
          text: ["SUPPLEMENTAL INDEXES", "FOR THE SELECTED LOCATION"],
          align: "center",
          style: {
            fontSize: 14,
            fontFamily: "Arial",
            fontWeight: 800,
          },
        },
        yaxis: {
          max: 100,
          min: 0,
          title: {
            text: "PERCENTILE",
            style: {
              fontFamily: "Oswald, Arial, sans-serif",
              fontWeight: 500,
              fontSize: 14,
            },
          },
        },
      },
    },

    barChartResponsiveArray2[7] = {
      breakpoint: 475, 
      //reduce bar border radius, reduce title font size, reduce y-axis title font size, angle x-axis labels straight downward
      options: {
        xaxis: {
          categories: [
            ["Particulate Matter"],
            ["Ozone"],
            ["Diesel Particulate Matter"],
            ["Air Toxics Cancer Risk*"],
            ["Air Toxics Respiratory HI*"],
            ["Toxic Releases To Air"],
            ["Traffic Proximity"],
            ["Lead Paint"],
            ["Superfund Proximity"],
            ["RMP Facility Proximity"],
            ["Hazardous Waste Proximity"],
            ["Underground Storage Tanks"],
            ["Wastewater Discharge"],
          ],
          labels: {
            rotate: -90,
            rotateAlways: true,
            maxHeight: 190,
            minHeight: 190,
            style: {
              fontSize: 12,
              fontWeight: 700
            },
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 2,
          },
        },
        legend: {
          position: "bottom",
          offsetX: '100%',    //causes legend to align to the right side
          offsetY: -1,        //causes legend to appear beneath the x-axis labels
          width: 146,
          height: 55,
          horizontalAlign: 'left',
          fontSize: 11,
          fontWeight: 700,
          markers: {
              width: 15,
              height: 15,
              radius: 0,
              offsetY: 4,
              offsetX: -5
          },
          itemMargin: {
              horizontal: 4,
              vertical: 2
          }
        },
        dataLabels: {
          enabled: false,
          offsetX: 0,
          offsetY: -18,
          style: {
            fontSize: 11,
            fontFamily: '"Source Sans Pro", sans-serif',
            colors: ["#000"],
            fontWeight: 500
          },
        },
        title: {
          text: ["SUPPLEMENTAL INDEXES", "FOR THE SELECTED LOCATION"],
          align: "center",
          style: {
            fontSize: 13,
            fontFamily: "Arial",
            fontWeight: 800,
          },
        },
        yaxis: {
          max: 100,
          min: 0,
          title: {
            text: "PERCENTILE",
            style: {
              fontFamily: "Oswald, Arial, sans-serif",
              fontWeight: 500,
              fontSize: 13,
            },
          },
        },
      },
    }

    function doEJSuppChart() {
      //Generate the Supplemental Index bar chart
      var options = {
        series: [
          {
            name: "State Percentile",
            data: [
            Number(ejmainHash["S_P5_PM25"]), 
						Number(ejmainHash["S_P5_O3"]), 
						Number(ejmainHash["S_P5_NO2"]),
						Number(ejmainHash["S_P5_DIESEL"]),						
						Number(ejmainHash["S_P5_RSEI_AIR"]), 
						Number(ejmainHash["S_P5_TRAFFIC"]),                 
                        Number(ejmainHash["S_P5_LEAD"]), 
						Number(ejmainHash["S_P5_NPL"]), 
						Number(ejmainHash["S_P5_RMP"]),                    
                        Number(ejmainHash["S_P5_TSDF"]), 
						Number(ejmainHash["S_P5_UST"]), 
						Number(ejmainHash["S_P5_NPDES"]),
						Number(ejmainHash["S_P5_DWATER"]),
              // //'State Percentiles:'
              // //'Particulate Matter','Ozone', 'Diesel Particulate Matter',
              // Number(ejmainHash["S_P5_PM25"]), Number(ejmainHash["S_P5_O3"]), Number(ejmainHash["S_P5_DIESEL"]),
              // //'Air Toxics Cancer Risk*', 'Air Toxics Respiratory HI*',        'Toxic Releases to Air*'      'Traffic Proximity',
              // Number(ejmainHash["S_P5_CANCER"]), Number(ejmainHash["S_P5_RESP"]), Number(ejmainHash["S_P5_RSEI_AIR"]), Number(ejmainHash["S_P5_TRAFFIC"]),
              // //'Lead Paint', 'Superfund Proximity', 'RMP Facility Proximity',
              // Number(ejmainHash["S_P5_LEAD"]), Number(ejmainHash["S_P5_NPL"]), Number(ejmainHash["S_P5_RMP"]),
              // //'Hazardous Waste Proximity', 'Underground Storage Tanks', 'Wastewater Discharge'
              // Number(ejmainHash["S_P5_TSDF"]), Number(ejmainHash["S_P5_UST"]), Number(ejmainHash["S_P5_NPDES"]),
            ],
          },
          {
            name: "National Percentile",
            data: [
            Number(ejmainHash["N_P5_PM25"]), 
						Number(ejmainHash["N_P5_O3"]), 
						Number(ejmainHash["N_P5_NO2"]),
						Number(ejmainHash["N_P5_DIESEL"]),						
						Number(ejmainHash["N_P5_RSEI_AIR"]),
						Number(ejmainHash["N_P5_TRAFFIC"]),                      
                        Number(ejmainHash["N_P5_LEAD"]), 
						Number(ejmainHash["N_P5_NPL"]), 
						Number(ejmainHash["N_P5_RMP"]),                      
                        Number(ejmainHash["N_P5_TSDF"]), 
						Number(ejmainHash["N_P5_UST"]), 
						Number(ejmainHash["N_P5_NPDES"]),
						Number(ejmainHash["N_P5_DWATER"]), 
              // //'Particulate Matter','Ozone', 'Diesel Particulate Matter',
              // Number(ejmainHash["N_P5_PM25"]), Number(ejmainHash["N_P5_O3"]), Number(ejmainHash["N_P5_DIESEL"]),
              // //'Air Toxics Cancer Risk*', 'Air Toxics Respiratory HI*',        'Toxic Releases to Air*'      'Traffic Proximity',
              // Number(ejmainHash["N_P5_CANCER"]), Number(ejmainHash["N_P5_RESP"]), Number(ejmainHash["N_P5_RSEI_AIR"]), Number(ejmainHash["N_P5_TRAFFIC"]),
              // //'Lead Paint', 'Superfund Proximity', 'RMP Facility Proximity',
              // Number(ejmainHash["N_P5_LEAD"]), Number(ejmainHash["N_P5_NPL"]), Number(ejmainHash["N_P5_RMP"]),
              // //'Hazardous Waste Proximity', 'Underground Storage Tanks', 'Wastewater Discharge'
              // Number(ejmainHash["N_P5_TSDF"]), Number(ejmainHash["N_P5_UST"]), Number(ejmainHash["N_P5_NPDES"]),
            ],
          },
        ],
        chart: {
          type: "bar",
          height: 460,
          width: "100%",
        },
        title: {
          text: "SUPPLEMENTAL INDEXES FOR THE SELECTED LOCATION",
          align: "center",
          style: {
            fontSize: 19,
            fontFamily: "Arial",
            fontWeight: 800,
          },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            dataLabels: {
              position: "top",
            },
            columnWidth: "65%",
            borderRadius: 15,
            borderRadiusApplication: "end",
          },
        },
        colors: ["#0E6CB6", "#3A7E11"],
        legend: {
          position: "right",
          offsetY: 322,
          fontWeight: 700,
          height: 62,
          markers: {
              width: 18,
              height: 18,
              radius: 0,
              offsetY: 4,
              offsetX: -5
          },
          itemMargin: {
              horizontal: 5,
              vertical: 3
          }
        },
        tooltip: {
          enabled: false,
        },
        dataLabels: {
          enabled: true,
          offsetX: 0,
          offsetY: -18,
          formatter: function (val, opts) {
            return val == 100 ? '' : val;
          },
          style: {
            fontSize: "12px",
            fontFamily: '"Source Sans Pro", sans-serif',
            colors: ["#000"],
            fontWeight: 700
          },
        },
        stroke: {
          show: true,
          width: 1,
          colors: ["#fff"],
        },
        tooltip: {
          shared: true,
          intersect: false,
        },
        xaxis: {
          categories: [
          ["Particulate", "Matter 2.5"],
                    ["Ozone"],
					["Nitrogen", "Dioxide", "(NO\u2082)"],
                    ["Diesel", "Particulate", "Matter"],                    
                    ["Toxic", "Releases", "To Air"],
                    ["Traffic", "Proximity"],
                    ["Lead", "Paint"],
                    ["Superfund", "Proximity"],
                    ["RMP", "Facility", "Proximity"],
                    ["Hazardous", "Waste", "Proximity"],
                    ["Underground", "Storage", "Tanks"],
                    ["Wastewater", "Discharge"],
					["Drinking", "Water", "Non-Compliance"],
          ],
          labels: {
            rotate: 0,
            maxHeight: 120,
            minHeight: undefined,
            hideOverlappingLabels: false,
            style: {
              fontSize: 12,
            }
          },
        },
        yaxis: {
          max: 100,
          min: 0,
          title: {
            text: "PERCENTILE",
            style: {
              fontFamily: "Oswald, Arial, sans-serif",
              fontWeight: 500,
              fontSize: 16,
            },
          },
        },
        responsive: barChartResponsiveArray2
      };

      var chart = new ApexCharts(
        document.querySelector("#supp-index-bar-chart"),
        options
      );
      chart.render();
    }
  </script>
</html>

