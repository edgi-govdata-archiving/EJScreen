define(

    ['dojo/_base/declare',
        "dojo/_base/lang",
        "dojo/on",
		"dojo/promise/all",
        "dojo/dom-construct",
        'dijit/_Widget',
        'dijit/_Templated',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dojo/Evented',
        "dojo/text!mapdijit/templates/EJreport.html",
        "esri/request",
        "esri/geometry/support/webMercatorUtils",
        "esri/tasks/QueryTask",
        "esri/tasks/support/Query",
        'dojox/grid/DataGrid',
        'dojo/data/ItemFileWriteStore',
        'dojox/charting/Chart',
        'dojox/charting/plot2d/ClusteredColumns',
        'dojox/charting/action2d/Highlight',
        'dojox/charting/action2d/Tooltip',
        'dojox/charting/plot2d/Grid',
        'dojox/charting/plot2d/Markers',
        'dojox/charting/axis2d/Default',
        'dojox/charting/widget/SelectableLegend'
    ],
    function(
        declare,
        lang,
        on,
		all,
        domConstruct,
        _Widget,
        _Templated,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Evented,
        dijittemplate,
        esriRequest,
        webMercatorUtils,
        QueryTask,
        Query
    ) {


        var ejtitleJSON = {
            "P_EJ2": { "description": "Environmental Justice Indexes", "charttitle": "Environmental Justice Indexes", "coltitle": "EJ Index", "visible": true },            
            "P_ENV": { "description": "Environmental Burden Indicators", "charttitle": "Environmental Burden Indicators", "coltitle": "Environmental Burden", "visible": false },
            "P_DEM": { "description": "Socioeconomic Indicators", "charttitle": "Socioeconomic Indicators", "coltitle": "Socioeconomic", "visible": false },
			"P_EJ5": { "description": "Supplemental Indexes", "charttitle": "Supplemental Indexes", "coltitle": "Supplemental Index", "visible": false }
            
        }

        var ejdataobj = {};
		var ejdataobjST = {}; //for ST + USA
        var chart1 = null;
        var levelegObj;
        var chartDataObj;

        var a = dojo.create("link", { type: "text/css", rel: "stylesheet", href: "mapdijit/css/ejreport.css" });
        dojo.doc.getElementsByTagName("head")[0].appendChild(a);
        var e = dojo.create("script", { type: "text/javascript", src: "mapdijit/javascript/ejindex.js" });
        dojo.doc.getElementsByTagName("head")[0].appendChild(e);
		
		//deep clone the dataobj in config and use it since it gets edited and don't want to affect its use in other code
		//this is to combine State and USA columns instead of indiv records like in Community Report.
		var dataobjST = JSON.parse(JSON.stringify(dataobj));
		//remove ST for Explore	
		delete dataobj['DEMOGIDX_2ST'];
		delete dataobj['DEMOGIDX_5ST'];


        var EJreport = dojo.declare("mapdijit.EJreport", [dijit._Widget, dijit._Templated], {
            templateString: dijittemplate,
            widgetsInTemplate: true,
            currentGraphic: null,
            constructor: function(options, srcRefNode) {

                options = options || {};
                if (!options.view) throw new Error("no map defined in params.");

                this.mapview = options.view;

                this.header = "";
                this.headerstr = "";
                this.eidxtype = "";
                this.chartstatus = true;
                this.message = "";
                this.pop = 0;
                //default status of checkbox State,USA
                this.legendstatus = [false, true];
                //this.legendstatus = [false, false, true];
                // mixin constructor options 
                dojo.safeMixin(this, options);
				
				


            },

            startup: function() {

            },
            postCreate: function() {

                var wobj = this;
				//use lookup in main service to get all variables including Low Life Expectancy			
                var lookuptableurl = ejscreenservice + "/" + lookuptableindex;
										
                
                var queryTask = new QueryTask(lookuptableurl);
                var query = new Query();

                query.returnGeometry = false;

                query.outFields = ["*"];
                var dirty = (new Date()).getTime();
                query.where = dirty + "=" + dirty; //"FOR_DATA='Y' AND " + 
                

                queryTask.execute(query).then(function(featset) {

                    if (featset.features.length > 0) {
						console.log(featset)
						//remove ST for Explore	
						//delete dataobj['DEMOGIDX_2ST'];
						//delete dataobj['DEMOGIDX_5ST'];					
			
						
						//RW 4/22/24 update field names from lookup to remove USA label, not needed in Explore Charts and Compare, only Comm Report
						for (var i = 0; i < featset.features.length; i++) {
                                  if (featset.features[i].attributes["DESCRIPTION"] == 'Demographic Index USA') {
										featset.features[i].attributes["SHORT_DESC"] = 'Demographic Index'; 
										//featset.features[i].attributes["CSV_NAME"] = 'Demographic Index'; 										
                                  }
								  if (featset.features[i].attributes["DESCRIPTION"] == 'Supplemental Demographic Index USA') {
										featset.features[i].attributes["SHORT_DESC"] = 'Supplemental Demographic Index';
										//featset.features[i].attributes["CSV_NAME"] = 'Supplemental Demographic Index';										
                                  }
                        }			
						 
                        
                        var sortedFeats = [];
                        //dataobj from config with report field order
                        for (var doboj in dataobj) {
                            for (var i = 0; i < featset.features.length; i++) {
                                  if (doboj == featset.features[i].attributes["FIELD_NAME"]) {
                                    sortedFeats.push(featset.features[i]);
                                    break;
                                  }
                            }
                        }

                        var fetcount = sortedFeats.length;
                        var colJson = {};
                        for (var m = 0; m < fetcount; m++) {
                            var cat = dojo.trim(sortedFeats[m].attributes["IndexCode"]);
                            var colname = dojo.trim(sortedFeats[m].attributes["FIELD_NAME"]);
                            var desc = dojo.trim(sortedFeats[m].attributes["SHORT_DESC"]);                            
                            var rptdesc = dojo.trim(sortedFeats[m].attributes["RPT_NAME"]);
                            var pdfname = dojo.trim(sortedFeats[m].attributes["PDF_NAME"]);
                            var isnata = dojo.trim(sortedFeats[m].attributes["IS_NATA"]);
                            var csvname = dojo.trim(sortedFeats[m].attributes["CSV_NAME"]);

                            colJson[colname] = {};
                            colJson[colname].description = desc;

                            if (typeof ejdataobj[cat] == 'undefined') {
                                ejdataobj[cat] = {};

                            }
                            ejdataobj[cat][colname] = colJson[colname];
                            dataobj[colname].description = desc;
                            dataobj[colname].contenttype = cat;
                            dataobj[colname].rptname = rptdesc;
                            dataobj[colname].csvname = csvname;

                            dataobj[colname].pdfname = pdfname;
                            if (isnata == "Y") dataobj[colname].isnata = true;
                            else dataobj[colname].isnata = false;

                        }        

						//do same for ST data
						//start ST
						
						 var sortedFeatsST = [];
                        //dataobj from config with report field order, with ST kept
                        for (var doboj in dataobjST) {
                            for (var i = 0; i < featset.features.length; i++) {
                                  if (doboj == featset.features[i].attributes["FIELD_NAME"]) {
                                    sortedFeatsST.push(featset.features[i]);
                                    break;
                                  }
                            }
                        }

                        var fetcountST = sortedFeatsST.length;
                        var colJsonST = {};
                        for (var m = 0; m < fetcountST; m++) {
                            var cat = dojo.trim(sortedFeatsST[m].attributes["IndexCode"]);
                            var colname = dojo.trim(sortedFeatsST[m].attributes["FIELD_NAME"]);
                            var desc = dojo.trim(sortedFeatsST[m].attributes["SHORT_DESC"]);                            
                            var rptdesc = dojo.trim(sortedFeatsST[m].attributes["RPT_NAME"]);
                            var pdfname = dojo.trim(sortedFeatsST[m].attributes["PDF_NAME"]);
                            var isnata = dojo.trim(sortedFeatsST[m].attributes["IS_NATA"]);
                            var csvname = dojo.trim(sortedFeatsST[m].attributes["CSV_NAME"]);

                            colJsonST[colname] = {};
                            colJsonST[colname].description = desc;

                            if (typeof ejdataobjST[cat] == 'undefined') {
                                ejdataobjST[cat] = {};

                            }
                            ejdataobjST[cat][colname] = colJsonST[colname];
                            dataobjST[colname].description = desc;
                            dataobjST[colname].contenttype = cat;
                            dataobjST[colname].rptname = rptdesc;
                            dataobjST[colname].csvname = csvname;

                            dataobjST[colname].pdfname = pdfname;
                            if (isnata == "Y") dataobjST[colname].isnata = true;
                            else dataobjST[colname].isnata = false;

                        }
						//end ST


                        wobj.populateData();
                    }
                    

                });//end query
            },
            populateData: function() {
				//builds the tabs and checkboxes for each tab in ejtitleJSON and each item in ejdataobj
                var liststr = "";
                var m = 0;
                for (var t in ejtitleJSON) {
                    var ejtitle = ejtitleJSON[t].description;
                    liststr = liststr + '<a class="tab';
                    if (ejtitleJSON[t].visible) {
                        liststr = liststr + ' activeTab';
                        this.eidxtype = t;

                    }
                    liststr = liststr + '" href="javascript:void(0);" onclick="switchEJTab(this,\'' + t + '\');" alt="' + ejtitle + '">' + ejtitle + '</a>';
                    m = m + 1;
                }
                document.getElementById("indexDiv").innerHTML = liststr;

                var indexstrArray = new Array();
                var ejchkboxstr = "";
                for (var eitem in ejdataobj) {
                    indexstrArray[eitem] = "[<a href='javascript: void(0);' onclick='toggleIndex(this,\"" + eitem + "\");'>";
                    indexstrArray[eitem] = indexstrArray[eitem] + "Unselect All";

                    indexstrArray[eitem] = indexstrArray[eitem] + "</a>]<table width='92%'>";
                    var counter = 0;
                    var catobj = ejdataobj[eitem];
                    for (var c in catobj) {

                        var flddesc = catobj[c].description;

                        if (counter % 3 == 0) {
                            indexstrArray[eitem] = indexstrArray[eitem] + "<tr>";
                        }
                        indexstrArray[eitem] = indexstrArray[eitem] + "<td valign='top'><input type='checkbox' onclick='changejchart(\"" + eitem + "\");' name='" + eitem + "' value='" + c + "'";

                        indexstrArray[eitem] = indexstrArray[eitem] + " checked";
                        ejdataobj[eitem][c].visible = true;
						//do same for ST
						ejdataobjST[eitem][c].visible = true;

                        indexstrArray[eitem] = indexstrArray[eitem] + " />&nbsp;" + flddesc + "</td>";
                        if (counter % 3 == 2) {
                            indexstrArray[eitem] = indexstrArray[eitem] + "</tr>";
                        }
                        counter = counter + 1;
                    }
                    indexstrArray[eitem] = indexstrArray[eitem] + "</table>";

                    ejchkboxstr += "<div id='" + eitem + "_ejdiv' style='display: ";
                    if (ejtitleJSON[eitem].visible) ejchkboxstr += "block;'>";
                    else ejchkboxstr += "none;'>";
                    ejchkboxstr += indexstrArray[eitem];
                    ejchkboxstr += "</div>";

                }
				
				//do same for ST
				//start
				// var indexstrArrayST = new Array();
                // var ejchkboxstrST = "";
                // for (var eitem in ejdataobjST) {
                    // indexstrArrayST[eitem] = "[<a href='javascript: void(0);' onclick='toggleIndex(this,\"" + eitem + "\");'>";
                    // indexstrArrayST[eitem] = indexstrArrayST[eitem] + "Unselect All";

                    // indexstrArrayST[eitem] = indexstrArrayST[eitem] + "</a>]<table width='92%'>";
                    // var counter = 0;
                    // var catobj = ejdataobjST[eitem];
                    // for (var c in catobj) {

                        // var flddesc = catobj[c].description;

                        // if (counter % 3 == 0) {
                            // indexstrArrayST[eitem] = indexstrArrayST[eitem] + "<tr>";
                        // }
                        // indexstrArrayST[eitem] = indexstrArrayST[eitem] + "<td valign='top'><input type='checkbox' onclick='changejchart(\"" + eitem + "\");' name='" + eitem + "' value='" + c + "'";

                        // indexstrArrayST[eitem] = indexstrArrayST[eitem] + " checked";
                        // //ejdataobjST[eitem][c].visible = true;
						// //do same for ST
						// ejdataobjST[eitem][c].visible = true;

                        // indexstrArrayST[eitem] = indexstrArrayST[eitem] + " />&nbsp;" + flddesc + "</td>";
                        // if (counter % 3 == 2) {
                            // indexstrArrayST[eitem] = indexstrArrayST[eitem] + "</tr>";
                        // }
                        // counter = counter + 1;
                    // }
                    // indexstrArrayST[eitem] = indexstrArrayST[eitem] + "</table>";

                    // ejchkboxstrST += "<div id='" + eitem + "_ejdiv' style='display: ";
                    // if (ejtitleJSON[eitem].visible) ejchkboxstrST += "block;'>";
                    // else ejchkboxstrST += "none;'>";
                    // ejchkboxstrST += indexstrArrayST[eitem];
                    // ejchkboxstrST += "</div>";

                // }
				//end
		
                var ctype = this.eidxtype;
                document.getElementById("ejindexContent").innerHTML = ejchkboxstr;

            },
            setEJcontent: function(ejitem) {
                this.eidxtype = ejitem;
                var node = dojo.byId("ejchartNode");
                dojo.empty(node);

                for (var t in ejtitleJSON) {
                    document.getElementById(t + "_ejdiv").style.display = "none";
                    ejtitleJSON[t].visible = false;
                }
                document.getElementById(ejitem + "_ejdiv").style.display = "block";
                ejtitleJSON[ejitem].visible = true;
                this.showCharts(ejitem);
            },
            _isKnownGeo: function(gtype) {
                var isGeo = false;
                for (var g in typelookup) {
                    if (g == gtype) isGeo = true;
                }
                return isGeo;
            },
            _showEJpane: function(graphic) {
                if (dojo.byId('tablefloater').style.visibility === 'visible') {
                    dijit.byId('tablefloater').hide();
                }
                document.getElementById("siteinfo").innerHTML = "";
                this.tabularNode.disabled = true;

                var node = dojo.byId("ejchartNode");
                dojo.empty(node);
                node.innerHTML = "<font style='font-size: 12pt; font-weight: bold; color: red;'>Loading...Please Wait</font>";
                this.currentGraphic = graphic;
                var tl = graphic.attributes["ptitle"];

                var infostr = "Project: " + tl;

                var dist = 0;
                if (graphic.attributes["radius"]) dist = graphic.attributes["radius"];
                var bunit = "miles";
                if (graphic.attributes["unit"]) bunit = graphic.attributes["unit"];
                if (dist > 0) {
                    infostr += "<br />Radius: " + dist + " " + bunit;
                }



                var coordstr = "";
                var header = "";
                var headerstr = "";
                var gtype = graphic.attributes["gtype"];
                if (gtype == "bg") {
                    if (graphic.attributes["fips"]) {

                        coordstr = graphic.attributes["fips"];
                        header = "Block group " + coordstr;
                        headerstr = "Block group " + coordstr;
                        content = {
                            'geometry': '',
                            'distance': '',
                            'unit': '',
                            'areatype': 'blockgroup',
                            'areaid': coordstr,
                            'f': "json"
                        };
                    }
                } else if (gtype == "city") {
                    coordstr = graphic.attributes["fips"];
                    var namestr = graphic.attributes["names"];
                    var fdesc = typelookup[gtype].description;

                    header = fdesc + " " + namestr;
                    headerstr = fdesc + " " + namestr;
					
					content = {
                            'geometry': '',
                            'distance': '',
                            'unit': '',
                            'areatype': 'city',
                            'areaid': coordstr,
                            'f': "json"
                        };

                    //content = {
                    //    'citycode': coordstr,
                     //   'f': "json"
                    //};
                } else if (this._isKnownGeo(gtype)) {
                    coordstr = graphic.attributes["fips"];
                    var namestr = graphic.attributes["names"];
                    var fdesc = typelookup[gtype].description;
                    if (fdesc.toLowerCase() == "county") {
                        fdesc = "";
                    }
                    header = fdesc + " " + namestr;
                    headerstr = fdesc + " " + namestr;

                    content = {
                        'geometry': '',
                        'distance': '',
                        'unit': '',
                        'areatype': gtype,
                        'areaid': coordstr,
                        'f': "json"
                    };
                } else {
                    var mgeometry = graphic.geometry;
                    var geometry = mgeometry;
                    if (mgeometry.spatialReference.wkid == "102100") geometry = webMercatorUtils.webMercatorToGeographic(mgeometry);

                    switch (geometry.type) {
                        case "point":
                            coordstr = geometry.x + "," + geometry.y;
                            var unitstr = bunit;
                            if (dist == 1) unitstr = unitlookup[bunit];

                            header = dist + " " + unitstr + " Ring Centered at " + geometry.y.toFixed(6) + "," + geometry.x.toFixed(6);
                            headerstr = dist + " " + unitstr + " Ring Centered at " + geometry.y.toFixed(6) + "," + geometry.x.toFixed(6);
                            break;
                        case "polyline":
                            var unitstr = bunit;
                            if (dist == 1) unitstr = unitlookup[bunit];
                            coordstr = geometry.paths;
                            headerstr = dist + " " + unitstr + "  Ring around the Corridor";
                            header = dist + " " + unitstr + " Ring around <a href='javascript: void(0);' title='" + coordstr + "'>the Corridor</a>";
                            break;
                        case "polygon":
                            coordstr = geometry.rings;
                            if (dist == "0") {
                                header = "<a href='javascript: void(0);' title='" + coordstr + "'>The User Specified Area</a>";
                                headerstr = "The User Specified Area";
                            } else {
                                var unitstr = bunit;
                                if (dist == 1) unitstr = unitlookup[bunit];
                                header = dist + " " + unitstr + " Ring around <a href='javascript: void(0);' title='" + coordstr + "'>the Area</a>";
                                headerstr = dist + " " + unitstr + " Ring around the Area";
                            }

                            break;

                    }
                    geomjson = JSON.stringify(geometry.toJSON());
                    var bunitcode = bufferunits[bunit].esricode;
                    content = {
                        'geometry': geomjson,
                        'distance': dist,
                        'unit': bunitcode,
                        'areatype': '',
                        'areaid': '',
                        'f': "json"
                    };
                }
                var frm = document.getElementById("chartform");
                frm.coords.value = coordstr;
                frm.feattype.value = gtype;
                frm.radius.value = dist;
                frm.unit.value = bunit;

                this.header = header;
                this.headerstr = headerstr;
                var wgobj = this;
                var soeurl = ejscreenSOEurl;
				
                if (gtype == "city") {
					soeurl = ejcitySOEurl;
					
					}
				
				
				
				//main EJ SOE request
				 var r1 = esriRequest(soeurl, {
                    query: content,
                    responseType: "json",
                    callbackParamName: "callback"
                })		
				
					
				
				all({resultEJ: r1}).then(function(results){
					wgobj._processResult(results.resultEJ);						
				});               				
			},			
				_processResult: function(responseEJ) {							
					
					//var result = responseEJ.data;
					//deep clone result object with orig state info, use this later after modifying original below
					var resultST = JSON.parse(JSON.stringify(responseEJ.data));
					
					//RW temp intercept repsonse to edit
                    var result0 = responseEJ.data;	
					var result = {};
					
					
					
					//RW change ST to non ST on the fly
					for (var k in result0) {
						if (result0.hasOwnProperty(k)) {
							
							var k_new = k;
							if (k == 'S_D_DEMOGIDX2ST'){
								k_new = 'S_D_DEMOGIDX2';								
							}							
							if (k == 'S_D_DEMOGIDX2ST_PER'){
								k_new = 'S_D_DEMOGIDX2_PER';								
							}	
							if (k == 'S_D_DEMOGIDX5ST'){
								k_new = 'S_D_DEMOGIDX5';								
							}							
							if (k == 'S_D_DEMOGIDX5ST_PER'){
								k_new = 'S_D_DEMOGIDX5_PER';								
							}			
												
						   result[k_new] = result0[k];
						}
					}
					
					
					var wgobj = this;	
					
                    if (result["messageType"]) {
                        wgobj.chartstatus = false;

                        wgobj.message = result["message"];
                        wgobj.showCharts(wgobj.eidxtype);
                        return false;
                    }
                    wgobj.pop = Number(result["totalPop"]);
                    //var stname = result["stateName"];
					var stname = result["placename"];
                    if (stname == "N/A") {
                        wgobj.chartstatus = false;
                        wgobj.showCharts(wgobj.eidxtype);


                        return false;
                    }
                    wgobj.chartstatus = true;
                    wgobj.header = wgobj.header + ", " + stname + ", EPA Region " + result["epaRegion"];
                    wgobj.headerstr = wgobj.headerstr + ", " + stname + ", EPA Region " + result["epaRegion"];
                    for (var f in dataobj) {
						if (dataobj[f].contenttype == "P_EJ2") {                        
                            if (dataobj[f].pdfname) {
                                var pdffld = dataobj[f].pdfname;
                                var stpdffld = "S_P2_" + pdffld;
                               
                                var natpdffld = "N_P2_" + pdffld;

                                var stpct = result[stpdffld];
                                var stpctvalue;
                                if ((stpct == null) || (stpct == "N/A")) {
                                    stpctvalue = "N/A";
                                } else {
                                    stpctvalue = stpct.replace("%", "");
                                    stpctvalue = Number(stpctvalue);
                                }
                              
                                var natpct = result[natpdffld];
                                var natpctvalue;
                                if ((natpct == "N/A") || (natpct == null)) natpctvalue = "N/A";
                                else {
                                    natpctvalue = natpct.replace("%", "");
                                    nattpctvalue = Number(natpctvalue);
                                }
                                dataobj[f].value = "";
                                dataobj[f].statepctile = stpctvalue;
                               
                                dataobj[f].nationpctile = natpctvalue;
                                dataobj[f].stateavg = "";
                               
                                dataobj[f].nationavg = "";
                            }
						
						} else if (dataobj[f].contenttype == "P_EJ5") {
							 if (dataobj[f].pdfname) {
                                var pdffld = dataobj[f].pdfname;
                                var stpdffld = "S_P5_" + pdffld;
                               
                                var natpdffld = "N_P5_" + pdffld;

                                var stpct = result[stpdffld];
                                var stpctvalue;
                                if ((stpct == null) || (stpct == "N/A")) {
                                    stpctvalue = "N/A";
                                } else {
                                    stpctvalue = stpct.replace("%", "");
                                    stpctvalue = Number(stpctvalue);
                                }
                              
                                var natpct = result[natpdffld];
                                var natpctvalue;
                                if ((natpct == "N/A") || (natpct == null)) natpctvalue = "N/A";
                                else {
                                    natpctvalue = natpct.replace("%", "");
                                    nattpctvalue = Number(natpctvalue);
                                }
                                dataobj[f].value = "";
                                dataobj[f].statepctile = stpctvalue;
                               
                                dataobj[f].nationpctile = natpctvalue;
                                dataobj[f].stateavg = "";
                               
                                dataobj[f].nationavg = "";
                            }
						
                        } else if (dataobj[f].contenttype == "P_ENV") {
                            if (dataobj[f].pdfname) {
                                var pdffld = dataobj[f].pdfname;

                                var rawpdffld = "RAW_E_" + pdffld;
                                var stpctfld = "S_E_" + pdffld + "_PER";
                               
                                var natpctfld = "N_E_" + pdffld + "_PER";
                                var stavgfld = "S_E_" + pdffld;
                             
                                var natavgfld = "N_E_" + pdffld;

                                var stpct = result[stpctfld];
                                var stpctvalue;
                                if ((stpct == null) || (stpct == "N/A")) {
                                    stpctvalue = "N/A";
                                } else {
                                    stpctvalue = stpct.replace("%", "");
                                    stpctvalue = Number(stpctvalue);
                                }
                              
                                var natpct = result[natpctfld];
                                var natpctvalue;
                                if ((natpct == "N/A") || (natpct == null)) natpctvalue = "N/A";
                                else {
                                    natpctvalue = natpct.replace("%", "");
                                    nattpctvalue = Number(natpctvalue);
                                }

                                //if ((dataobj[f].isnata) && (regpctvalue != " N/A")) {
                                if ((dataobj[f].isnata)) {
                                   
                                    var natmidvalue = wgobj._natamidpoint(natpctvalue);
                                   
                                    dataobj[f].nationpctile = natmidvalue;
                                } else {
                                   
                                    dataobj[f].nationpctile = natpctvalue;
                                }

                                dataobj[f].value = result[rawpdffld];
                                dataobj[f].statepctile = stpctvalue;


                                dataobj[f].stateavg = result[stavgfld];
                               
                                dataobj[f].nationavg = result[natavgfld];
                            }
                        } else if (dataobj[f].contenttype == "P_DEM") {
                            if (dataobj[f].pdfname) {
                                var pdffld = dataobj[f].pdfname;
                                var rawpdffld = "RAW_D_" + pdffld;
                                var stpctfld = "S_D_" + pdffld + "_PER";                                
                                var natpctfld = "N_D_" + pdffld + "_PER";
                                var stavgfld = "S_D_" + pdffld;                               
                                var natavgfld = "N_D_" + pdffld;
                                //var stpct = result[stpctfld];
								var stpct;					
								
								stpct = result[stpctfld];
						
								
                                var stpctvalue;
                                if ((stpct == null) || (stpct == "N/A")) {
                                    stpctvalue = "N/A";
                                } else {
                                    stpctvalue = stpct.replace("%", "");
                                    stpctvalue = Number(stpctvalue);
                                }
                                
                                //var natpct = result[natpctfld];
								var natpct;
								
								natpct = result[natpctfld];
							
								
                                var natpctvalue;
                                if ((natpct == "N/A") || (natpct == null)) natpctvalue = "N/A";
                                else {
                                    natpctvalue = natpct.replace("%", "");
                                    nattpctvalue = Number(natpctvalue);
                                }

                                //dataobj[f].value = result[rawpdffld];								
								dataobj[f].value = result[rawpdffld];
							
								
                                dataobj[f].statepctile = stpctvalue;                                
                                dataobj[f].nationpctile = natpctvalue;
                                //dataobj[f].stateavg = result[stavgfld];   
								
								dataobj[f].stateavg = result[stavgfld]; 
													
                                //dataobj[f].nationavg = result[natavgfld];								
									dataobj[f].nationavg = result[natavgfld];
							
                            }
                        }
                    }
					
					//do same for dataobjST
					//start
					for (var f in dataobjST) {
						if (dataobjST[f].contenttype == "P_EJ2") {                        
                            if (dataobjST[f].pdfname) {
                                var pdffld = dataobjST[f].pdfname;
                                var stpdffld = "S_P2_" + pdffld;
                               
                                var natpdffld = "N_P2_" + pdffld;

                                var stpct = result[stpdffld];
                                var stpctvalue;
                                if ((stpct == null) || (stpct == "N/A")) {
                                    stpctvalue = "N/A";
                                } else {
                                    stpctvalue = stpct.replace("%", "");
                                    stpctvalue = Number(stpctvalue);
                                }
                              
                                var natpct = result[natpdffld];
                                var natpctvalue;
                                if ((natpct == "N/A") || (natpct == null)) natpctvalue = "N/A";
                                else {
                                    natpctvalue = natpct.replace("%", "");
                                    nattpctvalue = Number(natpctvalue);
                                }
                                dataobjST[f].value = "";
                                dataobjST[f].statepctile = stpctvalue;
                               
                                dataobjST[f].nationpctile = natpctvalue;
                                dataobjST[f].stateavg = "";
                               
                                dataobjST[f].nationavg = "";
                            }
						
						} else if (dataobjST[f].contenttype == "P_EJ5") {
							 if (dataobjST[f].pdfname) {
                                var pdffld = dataobjST[f].pdfname;
                                var stpdffld = "S_P5_" + pdffld;
                               
                                var natpdffld = "N_P5_" + pdffld;

                                var stpct = result[stpdffld];
                                var stpctvalue;
                                if ((stpct == null) || (stpct == "N/A")) {
                                    stpctvalue = "N/A";
                                } else {
                                    stpctvalue = stpct.replace("%", "");
                                    stpctvalue = Number(stpctvalue);
                                }
                              
                                var natpct = result[natpdffld];
                                var natpctvalue;
                                if ((natpct == "N/A") || (natpct == null)) natpctvalue = "N/A";
                                else {
                                    natpctvalue = natpct.replace("%", "");
                                    nattpctvalue = Number(natpctvalue);
                                }
                                dataobjST[f].value = "";
                                dataobjST[f].statepctile = stpctvalue;
                               
                                dataobjST[f].nationpctile = natpctvalue;
                                dataobjST[f].stateavg = "";
                               
                                dataobjST[f].nationavg = "";
                            }
						
                        } else if (dataobjST[f].contenttype == "P_ENV") {
                            if (dataobjST[f].pdfname) {
                                var pdffld = dataobjST[f].pdfname;

                                var rawpdffld = "RAW_E_" + pdffld;
                                var stpctfld = "S_E_" + pdffld + "_PER";
                               
                                var natpctfld = "N_E_" + pdffld + "_PER";
                                var stavgfld = "S_E_" + pdffld;
                             
                                var natavgfld = "N_E_" + pdffld;

                                var stpct = result[stpctfld];
                                var stpctvalue;
                                if ((stpct == null) || (stpct == "N/A")) {
                                    stpctvalue = "N/A";
                                } else {
                                    stpctvalue = stpct.replace("%", "");
                                    stpctvalue = Number(stpctvalue);
                                }
                              
                                var natpct = result[natpctfld];
                                var natpctvalue;
                                if ((natpct == "N/A") || (natpct == null)) natpctvalue = "N/A";
                                else {
                                    natpctvalue = natpct.replace("%", "");
                                    nattpctvalue = Number(natpctvalue);
                                }

                                //if ((dataobjST[f].isnata) && (regpctvalue != " N/A")) {
                                if ((dataobjST[f].isnata)) {
                                   
                                    var natmidvalue = wgobj._natamidpoint(natpctvalue);
                                   
                                    dataobjST[f].nationpctile = natmidvalue;
                                } else {
                                   
                                    dataobjST[f].nationpctile = natpctvalue;
                                }

                                dataobjST[f].value = result[rawpdffld];
                                dataobjST[f].statepctile = stpctvalue;


                                dataobjST[f].stateavg = result[stavgfld];
                               
                                dataobjST[f].nationavg = result[natavgfld];
                            }
                        } else if (dataobjST[f].contenttype == "P_DEM") {
                            if (dataobjST[f].pdfname) {
                                var pdffld = dataobjST[f].pdfname;
                                var rawpdffld = "RAW_D_" + pdffld;
                                var stpctfld = "S_D_" + pdffld + "_PER";                                
                                var natpctfld = "N_D_" + pdffld + "_PER";
                                var stavgfld = "S_D_" + pdffld;                               
                                var natavgfld = "N_D_" + pdffld;
                                //var stpct = resultST[stpctfld];
								var stpct;					
								//FOR P_DEM ONLY, USE resultST instead of result to get result with ST stats.
								stpct = resultST[stpctfld];
						
								
                                var stpctvalue;
                                if ((stpct == null) || (stpct == "N/A")) {
                                    stpctvalue = "N/A";
                                } else {
                                    stpctvalue = stpct.replace("%", "");
                                    stpctvalue = Number(stpctvalue);
                                }
                                
                                //var natpct = resultST[natpctfld];
								var natpct;
								
								natpct = resultST[natpctfld];
							
								
                                var natpctvalue;
                                if ((natpct == "N/A") || (natpct == null)) natpctvalue = "N/A";
                                else {
                                    natpctvalue = natpct.replace("%", "");
                                    nattpctvalue = Number(natpctvalue);
                                }

                                //dataobjST[f].value = resultST[rawpdffld];								
								dataobjST[f].value = resultST[rawpdffld];
							
								
                                dataobjST[f].statepctile = stpctvalue;                                
                                dataobjST[f].nationpctile = natpctvalue;
                                //dataobjST[f].stateavg = resultST[stavgfld];  

								if (resultST[stavgfld] == null){
									resultST[stavgfld] = "N/A";
								}								
								dataobjST[f].stateavg = resultST[stavgfld]; 
								
								if (resultST[natavgfld] == null){
									resultST[natavgfld] = "N/A";
								}												
                               							
								dataobjST[f].nationavg = resultST[natavgfld];
							
                            }
                        }
                    }
					//end
					
					
					
					
                    var popnum = wgobj.pop.toFixed(0);
                    var pop_comma = popnum.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                    document.getElementById("siteinfo").innerHTML = wgobj.header + " (Population: " + pop_comma + ")";
                    dojo.byId("ejchartNode").innerHTML = "";
                    wgobj.showCharts(wgobj.eidxtype);
                    wgobj.tabularNode.disabled = false;
				          
            },

            showCharts: function(eitem) {
                if (this.chartstatus) {
                    var gridRegister = dijit.registry.byId('ejlegendNode');
                    if (gridRegister) { gridRegister.destroyRecursive(true); }
                    var list = document.getElementsByName(eitem);
                    var chartStates = [];
                    //var chartRegs = [];
                    var chartUSA = [];
                    var chartLabels = [];
                    var rowcount = 0;
                    var showejchart = false;
					
					
			 
                    for (var j = 0; j < list.length; j++) {
                        if (list[j].checked) {

                            var f = list[j].value;
                            var ldesc = dataobj[f].description;
                            if (dataobj[f].isnata) {
                                ldesc = ldesc + "*";
                            }
                            chartLabels.push(ldesc);
                            chartStates.push(Number(dataobj[f].statepctile));
                            //chartRegs.push(Number(dataobj[f].regionpctile));
                            chartUSA.push(Number(dataobj[f].nationpctile));
                            //alert(ldesc + ": " + dataobj[f].statepctile + ": " + dataobj[f].regionpctile + ": " + dataobj[f].nationpctile)
                            rowcount = rowcount + 1;
                            showejchart = true;
                        }

                    }
				
					
					
					
					
                    if (!(showejchart)) {
                        var node = dojo.byId("ejchartNode");
                        dojo.empty(node);

                        dojo.byId("subnote").style.display = "none";
                        return false;
                    }
                    //dojo.byId("ejlegendNode").style.display = "block";
                    if (eitem == "P_ENV") dojo.byId("subnote").style.display = "block";
                    else dojo.byId("subnote").style.display = "none";
                    chartDataObj = {
                        "stateVals": chartStates,
                        //"regionVals": chartRegs,
                        "nationVals": chartUSA,
                        "labels": chartLabels
                    };

                    //var doState, doRegion, doNation;
                    var doState, doNation;
                    chartDataObj.stateVals == null ? doState = false : doState = true;
                    //chartDataObj.regionVals == null ? doRegion = false : doRegion = true;
                    chartDataObj.nationVals == null ? doNation = false : doNation = true;
             

                    var xLabels = [];
                    for (var i = 0; i < chartDataObj.labels.length; i++) {
                        xLabels.push({ value: i + 1, text: chartDataObj.labels[i] });
                    }

                    levelegObj = {
                        state: { color: "#ff9966", highlight: "#ff5500", label: "State Percentile" },
                        //region: { color: "#99cc66", highlight: "#557733", label: "Regional Percentile" },
                        nation: { color: "#3399ff", highlight: "#2266BB", label: "USA Percentile" }

                    }
                    var chartid = "ejchartNode";
                    var ctitle = ejtitleJSON[eitem].charttitle + " for the Selected Area Compared to All People's Block Groups in the State/US"

                    chart1 = new dojox.charting.Chart(chartid, {
                        title: ctitle,
                        titlePos: "top",
                        titleGap: 0,
                        titleFont: "normal normal normal 9pt Calibri",
                        titleFontColor: "black",
                        htmlLabels: false,
                        margins: { l: 0, t: 0, r: 0, b: 0 }

                    });
                    //main chart
                    chart1.addPlot("default", {
                        type: dojox.charting.plot2d.ClusteredColumns,
                        markers: true,
                        gap: 4
                    });
                    //background lines on chart
                    chart1.addPlot("grid", {
                        type: dojox.charting.plot2d.Grid,
                        hMajorLines: true,
                        hMinorLines: false,
                        vMajorLines: false,
                        vMinorLines: false,
                        majorHLine: { color: "#D3D3D3", width: 1 },
                        renderOnAxis: false
                    });
                    var xTitle = ejtitleJSON[eitem].charttitle;
                    chart1.addAxis("x", { title: xTitle, htmlLabels: false, titleOrientation: "away", titleFont: "normal normal normal 9pt Verdana", labels: xLabels, dropLabels: false, rotation: 30, font: "normal normal normal 7pt Verdana", fontColor: "#000000", majorTick: { length: 0 }, minorTick: { length: 0 }, majorTickStep: 1, minorTickStep: 0, minorLabels: false }); //set major tick to 1, minor to 0 so draws every step of data but doesn't fill in decimals between integers.
                    chart1.addAxis("y", { title: "Population Percentile", vertical: true, titleFont: "normal normal normal 9pt Verdana", fixLower: "major", fixUpper: "minor", htmlLabels: true, titleOrientation: "axis", font: "normal normal normal 7pt Verdana", fontColor: "#000000", min: 0, max: 101, majorTickStep: 25, minorTicks: false, majorTick: { length: 0 }, stroke: { color: "#FFFFFF", width: 1 } }); //gridline fix: set max to 101 and fixUpper to minor ticks. 100 cuts off top grid line. 101 adds bit of padding.
                    if (doState) {
                        chart1.addSeries(levelegObj.state.label, chartDataObj.stateVals, { stroke: 'white', fill: levelegObj.state.color });
                    }
                    // if (doRegion) {
                    //     chart1.addSeries(levelegObj.region.label, chartDataObj.regionVals, { stroke: 'white', fill: levelegObj.region.color });
                    // }
                    if (doNation) {
                        chart1.addSeries(levelegObj.nation.label, chartDataObj.nationVals, { stroke: 'white', fill: levelegObj.nation.color });
                    }
                    //        new dojox.charting.action2d.Highlight(chart1, "default", {
                    //            highlight: function (o) {
                    //                for (var i in levelegObj) {
                    //                    if (levelegObj[i].color.toUpperCase() == o.toHex().toUpperCase()) {
                    //                        return dojo.colorFromHex(levelegObj[i].highlight);
                    //                    }
                    //                }
                    //            }
                    //        });

                    new dojox.charting.action2d.Highlight(chart1, "default");
                    var pattern = "<span style='font-family:Verdana;font-size: 9px !important'><strong>{0}</strong><br>{1}:&nbsp;{2}</span>";
                    var tip = new dojox.charting.action2d.Tooltip(chart1, "default", {
                        text: function(o) {
                            var yvalue = o.y;                            
                            if (o.run.name == levelegObj["nation"].label) {
                                var nataname = xLabels[o.index].text;
                                if (nataname.substr(nataname.length - 1, 1) == "*") {
                                    var ovalue = o.y;
                                    yvalue = reversePtile(ovalue);
                                }
                            }
                            return dojo.replace(pattern, [o.run.name, xLabels[o.index].text, yvalue]);
                        }

                    });
                    chart1.render();
                    //        if (dijit.byId("ejlegendNode")) {
                    //            dijit.byId("ejlegendNode").refresh();
                    //        } else {
						
					//left in style is the distance from left for chart legend
                    var columnsLegend = new dojox.charting.widget.SelectableLegend({ chart: chart1, style: "position: relative; left: 275px;" }, "ejlegendNode");
                    //        }
                    //                var list = dojo.query('#legend1 .dijitCheckBox');
                    //                alert(list[0].visible);
                    //        //list[1].click();
                    //        dijit.findWidgets(columnsLegend.legends[0])[0]._onClick();
                    //dijit.findWidgets(columnsLegend.legends[1])[0]._onClick();
                    //        var legendCheckBox = dojo.query(".dijitCheckBox", columnsLegend);
                    //        dojo.connect(legendCheckBox, "onclick", function (e) {
                    //            alert("here");
                    //            //            this._toggle(shapes, i, legend.vanished, originalDyn, seriesName, plotName);
                    //            //            legend.vanished = !legend.vanished;
                    //            //            e.stopPropagation();
                    //        });
                    //        var wobj = this;
                    //        dojo.connect(dojo.byId(columnsLegend._cbs[0].id), "onclick", function (e) {
                    //            wobj.legendstatus[0] = dojo.byId(columnsLegend._cbs[0].id).checked;
                    //        });
                    //        dojo.connect(dojo.byId(columnsLegend._cbs[1].id), "onclick", function (e) {
                    //            wobj.legendstatus[1] = dojo.byId(columnsLegend._cbs[2].id).checked;
                    //        });
                    //        dojo.connect(dojo.byId(columnsLegend._cbs[2].id), "onclick", function (e) {
                    //            wobj.legendstatus[2] = dojo.byId(columnsLegend._cbs[2].id).checked;
                    //        });
                    //        var list = dojo.query(".dijitCheckBox", columnsLegend);
                    //        alert(list.length);
                    //        this.toggleSeries(columnsLegend, 0);
                    //        this.toggleSeries(columnsLegend, 1);
                    for (var m = 0; m < this.legendstatus.length; m++) {
                        //alert(m + "; " + this.legendstatus[m] + ": " + dojo.byId(columnsLegend._cbs[m].id).checked);
                        if ((this.legendstatus[m] === false) && (dojo.byId(columnsLegend._cbs[m].id).checked)) {
                            dojo.byId(columnsLegend._cbs[m].id).click();

                        }
                    }

                    //        if (dojo.byId(columnsLegend._cbs[0].id).checked) {
                    //            dojo.byId(columnsLegend._cbs[0].id).click();
                    //        }
                    //        if (dojo.byId(columnsLegend._cbs[1].id).checked) {
                    //            dojo.byId(columnsLegend._cbs[1].id).click();
                    //        }
                } else {
                    dojo.byId("subnote").style.display = "none";
                    dojo.byId("ejchartNode").innerHTML = "<font style='font-size: 10pt; font-weight: bold; color: red;'>" + this.message + "</font>";
                    var node = dojo.byId("ejlegendNode");
                    dojo.empty(node);
                    document.getElementById("siteinfo").innerHTML = this.header;

                }
            },
            toggleSeries: function(legend, num) {
                dojo.query("*", legend.legends[num])[0].click();
                dijit.findWidgets(legend.legends[num])[0]._onClick();
            },

            _genTabular: function() {
                dijit.byId('tablefloater').show();
                dojo.byId("gridDiv").style.display = "block";
                var subdata = {
                    identifier: "id",

                    items: []
                };
                var rowcount = 0;
				
		//deep clone the dataobj in config and use it since it gets edited and don't want to affect its use in other code
		//this is to combine State and USA columns instead of indiv records like in Community Report.
		// var dataobjTEMP = JSON.parse(JSON.stringify(dataobj));
		
		// dataobjTEMP['DEMOGIDX_2ST'] = {
		// description: "Demographic Index State",
		// rawdata: "yes",
		// formatter: "%",
		// contenttype: "P_DEM",
		// pdfname: "DEMOGIDX2ST",
		// rptname: "Demographic Index State",
		// csvname: "Demographic Index State",
		// isnata: false
	// }
				
				
				
				
				
                //for (var eitem in ejdataobj) {
				for (var eitem in ejdataobjST) {
										
					
                    var list = document.getElementsByName(eitem);
					
					var dataobjTEMP;
					
					
					//dataobjTEMP = dataobj;
					dataobjTEMP = dataobjST;
						
			
					
					
                    for (var j = 0; j < list.length; j++) {
                        rowcount = rowcount + 1;
                        if (list[j].checked) {
						//if (true) {
                            var f = list[j].value;			
							
                           
                            var natpct = dataobjTEMP[f].nationpctile;
                            var recjson = {};
                            recjson["rowid"] = rowcount;
                            var catid = dataobjTEMP[f].contenttype;	
							
							
								recjson["cat"] = ejtitleJSON[catid].coltitle;
					
									

							
							
								recjson["id"] = f;
				
                           
                            recjson["desc"] = dataobjTEMP[f].csvname;

                            var cvalue = dataobjTEMP[f].value

                            recjson["rawdata"] = cvalue;
                            recjson["stateavg"] = dataobjTEMP[f].stateavg;
                           
                            recjson["nationavg"] = dataobjTEMP[f].nationavg;

                            if (dataobjTEMP[f].isnata) {                               
                                natpct = reversePtile(natpct);
                            }
                            recjson["statepct"] = dataobjTEMP[f].statepctile;                            
                            recjson["nationpct"] = natpct;
                            subdata.items.push(recjson);						


                        }

                    }
                }
				
				//force add ST rows
				//get indexes of DEMOGIDX_2 and 5 if was checked
				
				var fact2indx = -1;			
				for (var k = 0; k < subdata.items.length; k++) {
					var itm = subdata.items[k];
					if (itm["id"] == "DEMOGIDX_2"){
						fact2indx = k;
					}					
				}				
				if (fact2indx >= 0) {
							var g = "DEMOGIDX_2ST";                          
                            var natpct = dataobjTEMP[g].nationpctile;
                            var recjsonST = {};
                            recjsonST["rowid"] = fact2indx + 1;
                            var catid = dataobjTEMP[g].contenttype;							
							recjsonST["cat"] = ejtitleJSON[catid].coltitle;					
							recjsonST["id"] = g;
                            recjsonST["desc"] = dataobjTEMP[g].csvname;
                            var cvalue = dataobjTEMP[g].value
                            recjsonST["rawdata"] = cvalue;
							if (dataobjTEMP[g].stateavg == null){
								dataobjTEMP[g].stateavg = "N/A";
							}
                            recjsonST["stateavg"] = dataobjTEMP[g].stateavg;  
							if (dataobjTEMP[g].nationavg == null){
								dataobjTEMP[g].nationavg = "N/A";
							}							
                            recjsonST["nationavg"] = dataobjTEMP[g].nationavg;
                            if (dataobjTEMP[g].isnata) {                               
                                natpct = reversePtile(natpct);
                            }
                            recjsonST["statepct"] = dataobjTEMP[g].statepctile;                            
                            recjsonST["nationpct"] = natpct;                           
							subdata.items.splice(fact2indx + 1, 0, recjsonST);
				}
				var fact5indx = -1;
				for (var k = 0; k < subdata.items.length; k++) {
					var itm = subdata.items[k];
					if (itm["id"] == "DEMOGIDX_5"){
						fact5indx = k;
					}					
				}				
				if (fact5indx >= 0) {
							var g = "DEMOGIDX_5ST";                          
                            var natpct = dataobjTEMP[g].nationpctile;
                            var recjsonST = {};
                            recjsonST["rowid"] = fact5indx + 1;
                            var catid = dataobjTEMP[g].contenttype;							
							recjsonST["cat"] = ejtitleJSON[catid].coltitle;					
							recjsonST["id"] = g;
                            recjsonST["desc"] = dataobjTEMP[g].csvname;
                            var cvalue = dataobjTEMP[g].value
                            recjsonST["rawdata"] = cvalue;
							
                            recjsonST["stateavg"] = dataobjTEMP[g].stateavg;                           
                            recjsonST["nationavg"] = dataobjTEMP[g].nationavg;
                            if (dataobjTEMP[g].isnata) {                               
                                natpct = reversePtile(natpct);
                            }
                            recjsonST["statepct"] = dataobjTEMP[g].statepctile;                            
                            recjsonST["nationpct"] = natpct;                           
							subdata.items.splice(fact5indx + 1, 0, recjsonST);
				}
				
				//after new adds the row count id is off, reloop and reset in new order
				rowcount = 1
				for (var k = 0; k < subdata.items.length; k++) {
					var itm = subdata.items[k];
					itm["rowid"] = rowcount;
					rowcount += 1;									
				}	
				
				//end force add
				
				
				
                var store = new dojo.data.ItemFileWriteStore({ data: subdata });

                var grid = dijit.byId("grid");
                grid.setStore(store);
                var popnum = this.pop.toFixed(0);
                var pop_comma = popnum.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
                dojo.byId("tabletitle").innerHTML = this.headerstr + " (Population: " + pop_comma + ")";

            },

            _natamidpoint: function(inpct) {
                var curptilemod = 0;
                if (inpct == "N/A") {
                    return "N/A";
                }
                if (inpct >= 95) {
                    curptilemod = 97.5;
                } else if ((inpct >= 90) && (inpct < 95)) {
                    curptilemod = 92.5;
                } else if ((inpct >= 80) && (inpct < 90)) {
                    curptilemod = 85;
                } else if ((inpct >= 70) && (inpct < 80)) {
                    curptilemod = 75;
                } else if ((inpct >= 60) && (inpct < 70)) {
                    curptilemod = 65;
                } else if ((inpct >= 50) && (inpct < 60)) {
                    curptilemod = 55;
                } else if ((inpct >= 40) && (inpct < 50)) {
                    curptilemod = 45;
                } else if ((inpct >= 30) && (inpct < 40)) {
                    curptilemod = 35;
                } else if ((inpct >= 20) && (inpct < 30)) {
                    curptilemod = 25
                } else if ((inpct >= 10) && (inpct < 20)) {
                    curptilemod = 15;
                } else {
                    curptilemod = 5;
                }

                return curptilemod;
            },
            checkField: function(fname, aobj) {
                for (var a in aobj) {
                    if (a == fname) return true;
                }
                return false;
            },


            _genChart: function() {
                var frm = document.getElementById("chartform");

                frm.action = "ejchart.aspx";
                frm.method = "POST";
                frm.submit();
            },

            _ejscreenHTML: function() {
                var frm = document.getElementById("chartform");

                frm.action = "ejscreen_report.aspx";
                frm.method = "POST";
                frm.submit();
                //        var gtype = frm.feattype.value;
                //        var coordstr = frm.coords.value;
                //        var dist = frm.radius.value;
                //        var bunit = frm.unit.value;
                //        var url = "ejscreen.aspx?coords=" + coordstr + "&feattype=" + gtype + "&radius=" + dist + "&unit=" + bunit;
                //        window.open(url);
            },

            destroy: function() {

                dojo.empty(this.domNode);
                this.inherited(arguments);
            }

        });
        return EJreport;
    });