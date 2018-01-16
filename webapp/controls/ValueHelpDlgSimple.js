sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/comp/valuehelpdialog/ValueHelpDialog",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Control, ValueHelpDialog, JSONModel, Filter, FilterOperator) {
	"use strict";

	var ValueHelpDlgSimple = Control.extend("tammenit.sap.ui5.controls.ValueHelpDlgSimple", {
		// the control API:
		metadata: {
			properties: {
				/* Business Object properties */
				/** Title of the ValueHelpDialog */
				title: {
					type: "string",
					defaultValue: "ValueHelp Dialog"
				},
				/** if set to true a basicSearch searchfield will be displayed in the ValueHelpDialog */
				basicSearch: {
					type: "boolean"
				},
				/** bindingPath of the ValueHelpDialog */
				collectionBindingPath: {
					type: "string"
				},
				/** Fields that are used to create the dialog */
				fields: {
					type: "object[]"
				}

				/* other (configuration) properties */

			},

			aggregations: {
				/** hidden aggregation for the ValueHelpDialog */
				_valueHelpDialog: {
					type: "sap.ui.comp.valuehelpdialog.ValueHelpDialog",
					multiple: false,
					visibility: "hidden"
				}
			},

			associations: {
				/** The targetControl (sap.m.Input) this control is used with */
				targetControl: {
					type: "sap.m.Input",
					multiple: false
				}
			},

			events: {
				/** fired when an entry of the ValueHelpDialog is selected */
				selected: {},
				/** fired when the ValueHelpDialog is canceled */
				canceled: {}
			}
		},

		init: function() {
			var oControl = this;

			this.aTokens = [];
			this.oColModel = new JSONModel();
		},

		onBeforeRendering: function() {},

		onAfterRendering: function() {
			//called after instance has been rendered (it's in the DOM)
		}

	});

	/**
	 * Returns the sap.ui.comp.valuehelpdialog.ValueHelpDialog instance. If it does not exist
	 * it will be created
	 */
	ValueHelpDlgSimple.prototype._getValueHelpDialog = function() {
		if (!this.getAggregation("_valueHelpDialog")) {
			var oValueHelpDialog = new ValueHelpDialog({
				title: this.getTitle(),
				modal: true,
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				ok: this._dialogOk.bind(this),
				cancel: this._dialogCancel.bind(this),
				afterClose: this._afterDialogClose
			});
			this.setAggregation("_valueHelpDialog", oValueHelpDialog);
		}
		return this.getAggregation("_valueHelpDialog");
	};

	/**
	 * OK-Handler of the sap.ui.comp.valuehelpdialog.ValueHelpDialog. This function sets
	 * the selected value into the targetControls value and fires the event <code>selected</code>
	 */
	ValueHelpDlgSimple.prototype._dialogOk = function(oControlEvent) {
		var _targetControl = sap.ui.getCore().byId(this.getTargetControl());
		if (_targetControl.getMetadata().getName === "sap.m.MulitInput") {
			this.aTokens = oControlEvent.getParameter("tokens");
			_targetControl.setTokens(this.aTokens);
		} else {
			_targetControl.setValue(oControlEvent.getParameter("tokens")[0].getKey());
		}
		oControlEvent.getSource().close();
		this.fireSelected(oControlEvent.getParameter("tokens"));
	};

	ValueHelpDlgSimple.prototype._dialogCancel = function(oControlEvent) {
		oControlEvent.getSource().close(); //		oValueHelpDialog.close();
		this.fireCanceled(this);
	};

	ValueHelpDlgSimple.prototype._afterDialogClose = function(oEvent) {
		oEvent.getSource().destroy(); //oValueHelpDialog.destroy();
	};

	ValueHelpDlgSimple.prototype.open = function() {
		var oValueHelpDialog = this._getValueHelpDialog(),
			aKeys = [],
			cols = [],
			privateFields = [],
			filterGroupItems = [];

		var fields = this.getFields();
		fields.forEach(function(obj, idx, arr) {
			// if (obj.search) {
			// 	me.search = value.key;
			// }
			if (obj.iskey && obj.iskey === true) {
				aKeys.push(obj.key);
			}
			var col = {};
			col.label = obj.label;
			col.template = obj.key; //new sap.m.Text();
			if (obj.format === "Date") {
				col.oType = new sap.ui.model.type.Date(); //{source: {pattern: "yyyyMMdd"},pattern: "dd-MM-YYYY"}
			}
			if (obj.width) {
				col.width = obj.width;
			}
			cols.push(col);
			privateFields.push({
				label: obj.label,
				key: obj.key
			});
			if (obj.searchable) {
				filterGroupItems.push(new sap.ui.comp.filterbar.FilterGroupItem({
					groupTitle: "Group",
					groupName: "gn1",
					name: obj.key,
					label: obj.label,
					control: new sap.m.Input(obj.key)
				}));
			}
		});
		oValueHelpDialog.setKey(aKeys[1]);
		oValueHelpDialog.setDescriptionKey(aKeys[0]);

		oValueHelpDialog.getTable().setModel(this.getModel());
		oValueHelpDialog.getTable().bindRows({
			path: this.getCollectionBindingPath()
		});
		this.oColModel.setData({
			cols: cols
		});
		oValueHelpDialog.getTable().setModel(this.oColModel, "columns");

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

		// oValueHelpDialog.setRangeKeyFields(privateFields);
		// if(sap.ui.getCore().byId(this.getTargetControl())) {
		// 	oValueHelpDialog.setTokens(me.aTokens);
		// }

		oValueHelpDialog.setFilterBar(this._createFilterBar(filterGroupItems));

		this.getAggregation("_valueHelpDialog").open();
		//this.getAggregation("_valueHelpDialog").update();
	};

	ValueHelpDlgSimple.prototype._createFilterBar = function(filterGroupItems) {
		//	basicSearch: searchField,
		return new sap.ui.comp.filterbar.FilterBar({
			advancedMode: true,
			filterGroupItems: [filterGroupItems],
			search: this._searchFilterbar.bind(this)
		});
	};

	ValueHelpDlgSimple.prototype._searchFilterbar = function(search) {

		var filters = [];
		// if(me.defaultFilters) {
		// 	me.defaultFilters.forEach(function(obj) {
		// 		filters.push(obj);
		// 	});
		// }

		if (arguments && arguments[0]) {
			arguments[0].getParameter("selectionSet").forEach(function(obj, idx, arr) {
				if (obj.getValue()) {
					var splitTab = obj.getId().split("_");
					if (splitTab.length === 2) {
						filters.push(new Filter(splitTab[0], FilterOperator.Contains, obj.getValue()));
					} else {
						filters.push(new Filter(obj.getId(), FilterOperator.Contains, obj.getValue()));
					}
				}
			}.bind(this));
		}

		// $.each(arguments[0].getParameter("selectionSet"), function(key, value) {
		// 	if (value.getValue()) {
		// 		var splitTab = value.getId().split("_");
		// 		if (splitTab.length === 2) {
		// 			filters.push(new Filter(splitTab[0], FilterOperator.Contains, value.getValue()));
		// 		} else {
		// 			filters.push(new Filter(value.getId(), FilterOperator.Contains, value.getValue()));
		// 		}
		// 	}
		// }.bind(this));

		if (filters.length === 0 && this.getBasicSearchValue() && this.getBasicSearchValue().trim() !== "") {
			var actFilters = [];
			arguments[0].getParameter("selectionSet").forEach( function(obj) {
				actFilters.push(new Filter({
					path: obj.getId(),
					operator: FilterOperator.Contains,
					value1: this.getBasicSearchValue(),
					and: false,
					bAnd: false
				}));
			}.bind(this));
			filters.push(new Filter({
				bAnd: false,
				filters: actFilters
			}));
		}

		this.getAggregation("_valueHelpDialog").getTable().bindRows({
			path: this.getCollectionBindingPath(),
			filters: filters
		});

	};

	return ValueHelpDlgSimple;

});