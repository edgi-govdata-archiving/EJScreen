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
 'dojo/Evented',
 "dojo/text!mapdijit/templates/EJtable.html",
 "dojo/data/ItemFileWriteStore",
 "dojox/grid/DataGrid"
 
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
  dijittemplate,
  ItemFileWriteStore,
  DataGrid
) {



var EJtable = dojo.declare([dijit._Widget, dijit._Templated], {
    templateString: dijittemplate,
    widgetsInTemplate: true,
    constructor: function (options, srcRefNode) {

        options = options || {};
        if (!options.view) throw new Error("no map defined in params.");

        this.mapview = options.view;

        this._serviceWidgets = [];
        // mixin constructor options 
        dojo.safeMixin(this, options);


    },

    startup: function () {



    },
    postCreate: function () {
        var subdata = {
            identifier: "id",
            items: []
        };
        var store = new ItemFileWriteStore({ data: subdata });

        var layout = [[
         { 'name': '#', 'field': 'rowid', 'width': '4%' },
        { 'name': 'Category', 'field': 'cat', 'width': '10%' },
      { 'name': 'Selected Variables', 'field': 'desc', 'width': '20%' },
      { 'name': 'Value', 'field': 'rawdata', 'width': '9%', 'styles': 'text-align:right;' },
      { 'name': 'State Avg.', 'field': 'stateavg', 'width': '9%', 'styles': 'text-align:right;' },
      { 'name': '%ile in State', 'field': 'statepct', 'width': '10%', 'styles': 'text-align:center;' },
     // { 'name': 'EPA Region Avg.', 'field': 'regionavg', 'width': '9%', 'styles': 'text-align:right;' },
      //{ 'name': '%ile in EPA Region', 'field': 'regionpct', 'width': '10%', 'styles': 'text-align:center;' },
      { 'name': 'USA Avg.', 'field': 'nationavg', 'width': '9%', 'styles': 'text-align:right;' },
      { 'name': '%ile in USA', 'field': 'nationpct', 'width': '10%', 'styles': 'text-align:center;' }
    ]];

        /*create a new grid*/
        var grid = new DataGrid({
            id: 'grid',
            store: store,
            structure: layout,
            style: "height:98%",
            escapeHTMLInData: false,
            rowSelector: '20px'
        });

        /*append the new grid to the div*/
        grid.placeAt("gridDiv");

        /*Call startup() to render the grid*/
        grid.startup();
        dojo.connect(grid, '_onFetchComplete', function () {
            //            var list = dojo.query('#grid .dojoxGridContent');
            //            var height = list[0].offsetHeight + 25;  // additional 25 to account for headers
            //            
            //                dojo.byId("gridDiv").style.height = height + 'px';
            //                dojo.byId("grid").style.height = height + 'px';
            grid.resize();
            grid.update();

        });
    },
    _exportdata: function () {
        var grid = dijit.byId("grid");
        var store = grid.store;
        var frm = dojo.byId("csvForm1");
        store.fetch({
            query: grid.query,
            sort: grid.getSortProps(),
            queryOptions: grid.queryOptions,
            onComplete: function (items) {
                var first_row = [];
                dojo.forEach(grid.layout.cells, function (cell) {
                    first_row.push(cell.name);
                });
                frm.hiddenInput.value = first_row.join(',') + "\r\n";
                dojo.forEach(items, function (item, i) {
                    var result = [];
                    dojo.forEach(grid.layout.cells, function (cell) {
                        var itemstr = "\"" + cell.format(i, item) + "\"";
                        //itemstr = itemstr.replace(/,/g,";");
                        result.push(itemstr);
                    });
                    frm.hiddenInput.value += result.join(',') + "\r\n";
                });
                frm.title.value = "\"" + document.getElementById("tabletitle").innerHTML + "\"\r\n";
                frm.submit();
            }
        });
    },
    destroy: function () {

    }

});
return EJtable;
});



