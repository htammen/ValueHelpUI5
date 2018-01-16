sap.ui.define([
	 "sap/ui/base/Object",
	"sap/ui/comp/valuehelpdialog/ValueHelpDialog",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel"
], function(Object,ValueHelpDialog,Filter,FilterOperator, JSONModel) {
	"use strict";

	return Object.extend("de.tammenit.ValueHelpUI5.helper.ValueHelpHelper", {
		aKeys: [],
		theTokenInput: null,
		aTokens : [],
		cols : [],
		config : null,
		fields:[],
		oColModel : new sap.ui.model.json.JSONModel(),
		model : null,
		filter : [],
		binding : null,
		title : "",
		search : "",
		constructor: function(model,inputField,config,title) {
			this.theTokenInput= inputField;
			this.theTokenInput.setTokens(this.aTokens);
			this.config = config;
			this.title = title;
			this.model = model;//$.extend({}, model);
		},
		clearValueHelp:function(){
			this.theTokenInput.setTokens([]);
		},
		openValueHelp:function(binding,onOk,onCancel,scope){
			var me= this;
			
			this.binding = binding;
			
			me.aKeys = [];
			me.cols = [];
			me.fields = [];
			me.filter = [];
			
			me.aTokens = [];
			me.theTokenInput.setTokens(me.aTokens);
			
			$.each(this.config,function(key,value){
				if(value.search){
					me.search = value.key;
				}
				if(value.iskey && value.iskey === true){
					me.aKeys.push(value.key);
				}
				var col = {};
				col.label=value.label;
				col.template = value.key;//new sap.m.Text();
				if(value.format === "Date"){
					col.oType = new sap.ui.model.type.Date();//{source: {pattern: "yyyyMMdd"},pattern: "dd-MM-YYYY"}
				}
				if(value.width){
					col.width = value.width;
				}
				me.cols.push(col);
				me.fields.push({label:value.label,key:value.key});
				if(value.searchable){
						me.filter.push(new sap.ui.comp.filterbar.FilterGroupItem({ 
							groupTitle: "Group", 
							groupName: "gn1", 
							name: value.key, 
							label: value.label, 
							control: new sap.m.Input(value.key)
						}));
				}
			});
			this.oColModel.setData({cols:this.cols});
			
			var oValueHelpDialog = new ValueHelpDialog({
				basicSearchText: me.theTokenInput.getValue(), 
				title: me.title,
    			modal: true,
				supportMultiselect: false,
				supportRanges: true,
				supportRangesOnly: false,
				key: me.aKeys[1],				
				descriptionKey: me.aKeys[0],
				ok: function(oControlEvent) {
					me.aTokens = oControlEvent.getParameter("tokens");
					me.theTokenInput.setTokens(me.aTokens);
					oValueHelpDialog.close();
					onOk.call(scope||this,me.aTokens[0], scope);
				},
				cancel: function(oControlEvent) {
					oValueHelpDialog.close();
					onCancel.call(scope||this, scope);
				},
				afterClose: function() {
					oValueHelpDialog.destroy();
				}
			});
			oValueHelpDialog.getTable().setModel(me.oColModel, "columns");
			oValueHelpDialog.getTable().setModel(me.model);
			oValueHelpDialog.getTable().bindRows({
				path:me.binding
			});
			
			oValueHelpDialog.getTable().getModel().attachRequestSent(function(){
             	if(oValueHelpDialog && oValueHelpDialog.getTable()){
					oValueHelpDialog.getTable().setBusy(true); 
             	}
             });
             oValueHelpDialog.getTable().getModel().attachRequestCompleted(function(){
             	if(oValueHelpDialog && oValueHelpDialog.getTable()){
                	oValueHelpDialog.getTable().setBusy(false); 
             	}
             });
             
			oValueHelpDialog.setRangeKeyFields(me.fields); 
			oValueHelpDialog.setTokens(me.aTokens);
			
//				filterItems: [new sap.ui.comp.filterbar.FilterItem({ name: "s1", control: new sap.m.Input(me.search+"_full")})],
//				sap.m.Input(me.search+"_full"),
			var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
				advancedMode:  true,
				basicSearch: new sap.m.SearchField({
					id: me.search+"_full",
					showSearchButton: false
				}),
				filterGroupItems: [me.filter],
				search: function(search) {
					
					var filters = [];
					$.each(arguments[0].getParameter("selectionSet"),function(key,value){
						if(value.getValue()){
						    var splitTab = value.getId().split("_");
						    if(splitTab.length === 2){
						      filters.push(new Filter(splitTab[0], FilterOperator.Contains, value.getValue()));
						    }else{
								  filters.push(new Filter(value.getId(), FilterOperator.Contains, value.getValue()));
						    }
						}
					}.bind(this));

					if(filters.length === 0 && this.getBasicSearchValue() && this.getBasicSearchValue().trim() !== "") {
						var actFilters = [];
						$.each(arguments[0].getParameter("selectionSet"),function(key,value){
							actFilters.push(new Filter({path: value.getId(), operator: FilterOperator.Contains, value1: this.getBasicSearchValue(), and: false, bAnd: false}));
						}.bind(this));
						filters.push(new Filter({bAnd: false, filters: actFilters}));
					} else {
						
					}
					
					oValueHelpDialog.getTable().bindRows({
						path:me.binding,
						filters: filters
					});
					
				}
			});			
			/*		
			if (oFilterBar.setBasicSearch) {
				oFilterBar.setBasicSearch(new sap.m.SearchField({id:"s1",showSearchButton:true, placeholder:"Search test",search:function(param1){
					var filters = [];
					if(param1.getParameter("query") && param1.getParameter("query").length > 0){
						filters.push(new Filter(me.searchField, FilterOperator.Contains, param1.getParameter("query")));
					}
					oValueHelpDialog.getTable().getBinding().filter(filters);
				}}));  
			}
			*/
			oValueHelpDialog.setFilterBar(oFilterBar);
			
			if (this.theTokenInput.$().closest(".sapUiSizeCompact").length > 0) { // check if the Token field runs in Compact mode
				oValueHelpDialog.addStyleClass("sapUiSizeCompact");		
			}
			oValueHelpDialog.open();
			oValueHelpDialog.update();
		}
	});

});