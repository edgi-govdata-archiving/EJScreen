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
 'dijit/form/Slider',
 'dojo/text!mapdijit/templates/opcslider.html'
 
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
  Slider,
  dijittemplate
) {

var sliderItem = dojo.declare("mapdijit.sliderItem", [dijit._Widget, dijit._Templated], {
    templateString: dijittemplate,
    widgetsInTemplate: true,
    constructor: function (options) {

        this.servicelayer = options.servicelayer;
        this.opcvalue = options.opcvalue;
        
        this.dialog = options.dialog;
        this.tocdiv = options.tocdiv;

        // mixin constructor options 
        //dojo.safeMixin(this, options);


    },

    startup: function () {
        this.inherited(arguments);

    },

    _setOpacity: function () {
        var svalue = 1 - this.sliderNode.value;
        this.servicelayer.opacity = svalue;
		$(this.tocdiv).css('opacity',svalue);
		this.servicelayer.refresh();
        
    },

    _closeDialog: function () {
        dijit.popup.close(this.dialog);
        this.dialog.opened_ = false;
    },

    destroy: function () {
        dojo.empty(this.domNode);
        this.inherited(arguments);
    }
});
return sliderItem;
});


 

