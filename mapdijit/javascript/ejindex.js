function toggleIndex(obj, etype) {
    var list = document.getElementsByName(etype);
    if (obj.innerHTML == "Unselect All") {
        obj.innerHTML = "Select All";
        for (var j = 0; j < list.length; j++) {
            list[j].checked = false;
        }
        var node = dojo.byId("ejchartNode");
        dojo.empty(node);
        //var gridRegister = dijit.registry.byId('ejlegendNode'); if (gridRegister) { gridRegister.destroyRecursive(true); }
        //dojo.byId("ejlegendNode").style.display = "none";
        dojo.byId("subnote").style.display = "none";
        if (dojo.byId('tablefloater').style.visibility === 'visible') {
            dijit.byId("ejwg")._genTabular();
        }
    } else {
        obj.innerHTML = "Unselect All";
        for (var j = 0; j < list.length; j++) {
            list[j].checked = true;
        }
        changejchart(etype);
    }
    
}
function changejchart(etype) {
    var node = dojo.byId("ejchartNode");
    dojo.empty(node);
    
    dijit.byId("ejwg").showCharts(etype);
    if (dojo.byId('tablefloater').style.visibility === 'visible') {
        dijit.byId("ejwg")._genTabular();
    }

}

function switchEJTab(obj, theme) {

    dojo.query("#indexDiv.tabArea > a").forEach(function (node, index, nodelist) {

        dojo.removeClass(node, "activeTab");
    });
    dojo.addClass(obj, "activeTab");
    //alert(dijit.byId("dgwg").dtype);
    dijit.byId("ejwg").setEJcontent(theme);

}
/*function reversePtile(pt) {
    var ptext = "<50th";
    if (pt == "N/A") {
        ptext = "N/A";
    } else if (pt == "97.5") {
        ptext = "95-100th";
    } else if (pt == "92.5") {
        ptext = "90-95th";
    } else if (pt == "85") {
        ptext = "80-90th";
    } else if (pt == "75") {
        ptext = "70-80th";
    } else if (pt == "65") {
        ptext = "60-70th";
    } else if (pt == "55") {
        ptext = "50-60th";
    } else {
        ptext = "<50th";
    }
        
    return ptext;
}*/
function reversePtile(pt) {
    return pt === "N/A" ? "N/A":pt;
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
function roundNumber(num, dec) {
    var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
}
