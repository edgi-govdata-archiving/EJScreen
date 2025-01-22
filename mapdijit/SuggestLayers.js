define(

    ['dojo/_base/declare',
        "dojo/_base/lang",
        "dojo/on",
        "dojo/dom-construct",
        'dijit/_Widget',
        'dijit/_Templated',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',

        "dojo/text!mapdijit/templates/SuggestLayers.html",
        "esri/config",
        "esri/core/urlUtils",
        "esri/layers/MapImageLayer",
        "esri/layers/TileLayer",
        "esri/layers/FeatureLayer",
        "esri/layers/GraphicsLayer",
        "esri/layers/ImageryLayer",
        "esri/PopupTemplate",
        "mapdijit/IDinfoWindow",
    ],
    function(
        declare,
        lang,
        on,
        domConstruct,
        _Widget,
        _Templated,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,

        dijittemplate,
        esriConfig,
        urlUtils,
        MapImageLayer,
        TileLayer,
        FeatureLayer,
        GraphicsLayer,
        ImageryLayer,
        PopupTemplate,
        IDinfoWindow
    ) {


        

        var SuggestLayers = declare("mapdijit.SuggestLayers", [_WidgetBase, _TemplatedMixin], {
            templateString: dijittemplate,
            constructor: function(options, srcRefNode) {

                options = options || {};
                if (!options.view) throw new Error("no map view defined in params for SuggestLayers widget.");
                //        if (!options.featureset) throw new Error("no featureset defined in the download widget.");
                //        this.featureset = options.featureset;
                this.view = options.view;
                this.maintocdiv = options.tocdivid;
                //pass in sug layer list in constructor, this is update to existing widget in EJ that only had one SuggestLayer widget, now need multiple and layers are set in config
                this.suglayerlist = options.suglayerlist;
                //meta data anchors for each layer in panel by id
                 this.metadataanchors = options.metadataanchors;

                //use srcrefnode for content for form name as well, adding form to name. Used to get unique value for form id
                this.formnodeID = srcRefNode + "form";

                // mixin constructor options 
                //dojo.safeMixin(this, options);


            },

            startup: function() {


            },
            postCreate: function() {

                this.formNode.id = this.formnodeID;

                var suggestservices = this.suglayerlist;

                var suglayerstr = "";
                for (var slayer in suggestservices) {
                    if (suggestservices[slayer].isfolder) {
                        suglayerstr += '<div class="agsTOCNode"><a href="javascript:;" style="margin-left: 4px;" class="toggleOff" title="' + slrMouseOverTxt + '" onMouseDown="toggleDiv(this,\'' + slayer + '\');">';
                        suglayerstr += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + suggestservices[slayer].title + '</a></div>';
                        suglayerstr += '<div id="' + slayer + '" title="' + slrMouseOverTxt + '" style="position: relative;margin-left: 4px; top: 0px; background-color: #FFFFFF;display: block; margin-left: 10px;">';
                        for (var svc in suggestservices[slayer].services) {
                            suglayerstr += this.oneService(slayer + "|" + svc, suggestservices[slayer].services[svc]);
                        }
                        suglayerstr += '</div>';
                    } else {
                        suglayerstr += this.oneService(slayer, suggestservices[slayer]);
                    }
                }


                this.lNode.innerHTML = suglayerstr;

            },
            oneService: function(slayer, obj) {
                //var servicestr = "<table><tr><td align='left'><input type='checkbox' value='" + slayer + "' name='slayers' /></td><td align='left'><a href='" + obj.url + "' target='_blank'>" + obj.title + "</a></td></tr></table>";
               
                if (this.metadataanchors[slayer]){
                    var servicestr = '<div class="agsTOCNode"><input type="checkbox" value="' + slayer + '" name="slayers" /><span>' + obj.title + '<a href="' + this.metadataanchors[slayer].metalink + '"" target="_blank"><img src="images/infoButton2.png" alt="show metadata" title="show metadata" style="margin-left:2px;" /></a></span></div>';
                }
                else {
                    var servicestr = '<div class="agsTOCNode"><input type="checkbox" value="' + slayer + '" name="slayers" /><span>' + obj.title + '<a href="#" onClick="alert(\'No metadata available\')"><img src="images/infoButton2.png" alt="show metadata" title="show metadata" style="margin-left:2px;" /></a></span></div>';
                    

                }
               
                return servicestr;
            },

            // EJ2020 add a mouse over function:
            onmouseover: function() {
                this.style.border = "1px solid navy";
                var keyvalue = this.value;
                var pa = keyvalue.split("|")[0];
                var pej = keyvalue.split("|")[1];
                var tiptext = "test";
                wobj.metaNode.innerHTML = tiptext;
            },
            // END EJ2020

            addSuggestServices: function() {
                var suggestservices = this.suglayerlist;
                var frmID = this.formnodeID;
                var frm = document.getElementById(frmID);
                var tocinfos = [];
                for (var m = 0; m < frm.slayers.length; m++) {
                    if (frm.slayers[m].checked) {
                        var sugid = frm.slayers[m].value;
                        var lid = sugid + "_map";
                        var mtitle = "";
                        if (suggestservices[sugid]) {
                            mtitle = suggestservices[sugid].title;
                        } else {
                            var folderid = sugid.split("|")[0];
                            var svcid = sugid.split("|")[1];
                            var folderobj = suggestservices[folderid].services;
                            mtitle = folderobj[svcid].title;
                        }
                        //fooddesert fix, check for the second layer that has been force added when the first one is. 
                        if (sugid == 'fooddesert'){
	                      	if (this.view.map.findLayerById("fooddesert_map2")){
	                      		 alert("'" + mtitle + "' has already been added to the map!");
	                      		 return;	                      

	                      	}
                        }
                        if (this.view.map.findLayerById(lid)) {
                        //if (this.view.map.findLayerById(lid)) {
                            alert("'" + mtitle + "' has already been added to the map!");

                        } else {
                            var stype, surl, trans;
                            var slayers = [];
                            if (suggestservices[sugid]) {                                
                                stype = suggestservices[sugid].type;
                                surl = suggestservices[sugid].url;
                                if (suggestservices[sugid].opacity) trans = suggestservices[sugid].opacity;
                                else trans = 0.8
                                if (suggestservices[sugid].layers) slayers = suggestservices[sugid].layers;
                            } else {
                                var folderid = sugid.split("|")[0];
                                var svcid = sugid.split("|")[1];
                                var folderobj = suggestservices[folderid].services;
                                stype = folderobj[svcid].type;
                                surl = folderobj[svcid].url;
                                if (folderobj[svcid].opacity) trans = folderobj[svcid].opacity;
                                else trans = 0.8
                                if (folderobj[svcid].layers) slayers = folderobj[svcid].layers;
                            }
                            var templayer = null;

                            var domainurl = surl;
                            var domainpat = /^https?:\/\/[A-Za-z0-9_\.]+\//i;
                            var match = surl.match(domainpat);
                            if (match != null) {
                                domainurl = match[0];
                            }
                            urlUtils.addProxyRule({
                                proxyUrl: proxyurl,
                                urlPrefix: domainurl
                            });
                            if (stype == "featurelayer") {
                                var infoTemplate = new PopupTemplate();
                                infoTemplate.title = mtitle;
                                if (sugid == "fooddesert"){
                                     mtitle = infoTemplate.title + " - Detail"
                                }
                                //infoTemplate.content = "{*}";
                                infoTemplate.content = this.idDesc;
                                if (suggestservices[sugid].template) infoTemplate.content = suggestservices[sugid].template;
                                templayer = new FeatureLayer(surl, {
                                    mode: FeatureLayer.MODE_ONDEMAND,
                                    id: lid,
                                    popupTemplate: infoTemplate,
                                    outFields: ["*"],
                                    title: mtitle
                                });
                                templayer.layerType = "addon";
                                this.view.map.add(templayer);

                                //temp fix for food desert, add the second generailzed layer if food desert is selected (detail by default),delete this entire section when fixed
                                //also remove line above for fix to check if added to map already and fix to add detail to name (line 138 and 182)
                                if (sugid == "fooddesert"){
                                     //var infoTemplate = new PopupTemplate();
                                     //infoTemplate.title = mtitle;
                                    
                                    //infoTemplate.content = this.idDesc;
                                    //if (suggestservices[sugid].template) infoTemplate.content = suggestservices[sugid].template;
                                    var newurl = "https://gis.ers.usda.gov/arcgis/rest/services/foodaccess2019/MapServer/2";
                                    var templayer2;
                                    templayer2 = new FeatureLayer(newurl, {
                                         mode: FeatureLayer.MODE_ONDEMAND,
                                         id: lid + "2",
                                         popupTemplate: infoTemplate,
                                         outFields: ["*"],
                                         title: mtitle.replace("Detail","Generalized")
                                    });
                                     templayer2.layerType = "addon";
                                    this.view.map.add(templayer2);
                                }
                                //end food desert fix

                                tocinfos[sugid] = { "title": mtitle, "dlayers": slayers };
                            } else if (stype == "agsimagery") {
                                var templayer = new ImageryLayer({
                                    url: surl,
                                    legendEnabled: true,
                                    format: "jpgpng",
                                    id: lid,
                                    title: mtitle,
                                    opacity: trans
                                });
                                templayer.layerType = "addon";
                                this.view.map.add(templayer);
                            } else {
                                if (stype == "agstile") {
                                    templayer = new TileLayer(surl, {
                                        id: lid,
                                        title: mtitle,
                                        opacity: trans
                                    });
                                } else if (stype == "agsdynamic") {
                                    templayer = new MapImageLayer(surl, {
                                        id: lid,
                                        title: mtitle,
                                        visible: true, //sets the top layer to visible so top level checkbox on by default. If false user has to click checkbox to draw
                                        opacity: trans                                       
                                    });

                                }
                                templayer.layerType = "addon";

                                if (slayers.length > 0) {
                                    templayer.sublayers = slayers;
                                }

                                if (templayer != null) {
                                    this.view.map.add(templayer);

                                }
                                templayer.on("layerview-create-error", function(e) {
                                    console.log("error loading layer");
                                    console.log(e);
                                });
                            }
                        }
                    }
                }

                //frm.reset();
            },

              idDesc: function(e) {

        var infowidget = new IDinfoWindow({
            view: view,
            idgraphic: e.graphic,
        }, dojo.create('div'));
        infowidget.startup();

        return infowidget.domNode;

    },


            destroy: function() {

                dojo.empty(this.domNode);

            }

        });
        return SuggestLayers;

    });