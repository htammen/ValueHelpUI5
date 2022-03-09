sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	"sap/ui/core/Popup",
	"de/tammenit/ValueHelpUI5/helper/StripToaster",
    "de/tammenit/ValueHelpUI5/helper/ValueHelpHelper",
    "tammenit/sap/ui5/controls/ValueHelpDlgSimple"
], function(Controller, JSONModel, Filter, MessageToast, Popup, StripToaster, ValueHelpHelper, ValueHelpDlgSimple) {
	"use strict";

	return Controller.extend("de.tammenit.ValueHelpUI5.controller.Main", {
		onInit: function() {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(
        "https://cors-anywhere.herokuapp.com/https://ui5.sap.com/test-resources/sap/ui/documentation/sdk/products.json");
			this.getView().setModel(oModel);
				// "https://cors-anywhere.herokuapp.com/https://sapui5.hana.ondemand.com/test-resources/sap/ui/demokit/explored/products.json");
			
			var viewModel = new JSONModel({
				"DSCVisible": true
			});
			this.getView().setModel(viewModel, "viewModel");
			
			var oComboBoxModel = new JSONModel({
				selectedKey: "PF-1000"
			});
			this.getView().setModel(oComboBoxModel, "comboBoxModel");
			
//				"text": "&lt;div&gt;&lt;h2&gt;Selection&lt;/h2&gt;&lt;p&gt;Select enables selection of single values&lt;/p&gt;&lt;/div&gt;"
			// var commentModel = new JSONModel({
			// 	"text": "<div><h2>Select</h2><p>Select enables selection of single values</p></div>"
			// });
			var commentModel = new JSONModel();
			commentModel.loadData('./model/select.json');
			this.getView().setModel(commentModel, "commentModel");
			

			// attach handlers for validation errors
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);

			this.byId("inputSuggestionCustomFilter").setFilterFunction(function(sTerm, oItem) {
				// A case-insensitive 'string contains' style filter
				return oItem.getText().match(new RegExp(sTerm, "i"));
			});
			
			this._createValueHelp();
		},
		
		toggleSideContentVisibility: function (oEvent) {
			this.getView().getModel("viewModel").setProperty("/DSCVisible", !this.getView().getModel("viewModel").getProperty("/DSCVisible"));
		},
		handleSideContentShow: function (oEvent) {
			var oDSC = this.byId("DynamicSideContent");
			oDSC.setShowSideContent(true);
		},

		handleValueHelp: function(oController) {
			this.inputId = oController.oSource.sId;
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = this.getView().byId("selectDialog");
				this.getView().addDependent(this._valueHelpDialog);
			}

			// open value help dialog
			this._valueHelpDialog.open();
		},

		_handleValueHelpSearch: function(evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new sap.ui.model.Filter(
				"Name",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},

		_handleValueHelpClose: function(evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput = this.getView().byId(this.inputId);
				productInput.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
		},

		handleLoadItems: function(oControlEvent) {
			oControlEvent.getSource().getBinding("items").resume();
		},

		handleSuggest: function(oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new Filter("Name", sap.ui.model.FilterOperator.StartsWith, sTerm));
			}
			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
		},
		
		_createValueHelp: function() {
			this.fields = [
			{
				label: "Name",
				key: "Name",
				searchable: false,
				iskey: true,
				search: true
			}, {
				label: "Product ID",
				key: "ProductId",
				searchable: true,
				iskey: true
			}, {
				label: "Category",
				key: "Category",
				searchable: true,
				iskey: false
			}, {
				label: "Main Category",
				key: "MainCategory",
				searchable: true,
				iskey: false
			}, {
				label: "Supplier Name",
				key: "SupplierName",
				searchable: true,
				width: "10rem"
			}, {
				label: "Weight Measure",
				key: "WeightMeasure",
				searchable: false,
				width: "10rem"
			}, {
				label: "Weight Unit",
				key: "WeightUnit",
				searchable: false,
				width: "10rem"
			}, {
				label: "Price",
				key: "Price",
				searchable: false,
				width: "10rem"
			}, {
				label: "Currency",
				key: "CurrencyCode",
				searchable: false,
				width: "10rem"
			}];
			this.valuehelp = new ValueHelpHelper(this.getView().getModel(), this.getView().byId("valuehelp1"), this.fields, "Product Search");
		},

		_onValueHelpRequest: function() {
			var me = this;
			this.valuehelp.openValueHelp("/ProductCollection",
				function(selection,ctx){
					var oView = this.getView();
					jQuery.sap.log.info("Selection text: " + selection.getText());
					jQuery.sap.log.info("Selection key: " + selection.getKey());
					MessageToast.show("Selection text: " + selection.getText() + "; Selection key: " + selection.getKey());
					StripToaster.notify({
						text: "Selection text: " + selection.getText() + "; Selection key: " + selection.getKey(),
						timeOut: 8000,
						position: Popup.Dock.CenterTop
					});
					StripToaster.notify({
						text: "Selection text: " + selection.getText() + "; Selection key: " + selection.getKey(),
						type: sap.ui.core.MessageType.Warning,
						timeOut: 12000,
						position: Popup.Dock.CenterTop
					});
					StripToaster.notify({
						text: "Selection text: " + selection.getText() + "; Selection key: " + selection.getKey(),
						type: sap.ui.core.MessageType.Error,
						timeOut: 0,
						position: Popup.Dock.CenterTop
					});
				},
				function(ctx){
					jQuery.sap.log.info("cancel");
				},this);
		},
		
		onValueHelpRequest: function(oEvent) {
			var oValueHelpDlgSimple = new ValueHelpDlgSimple({collectionBindingPath: "/ProductCollection"});
			oValueHelpDlgSimple.setTargetControl(oEvent.getSource());
			oValueHelpDlgSimple.setModel(this.getView().getModel());
			oValueHelpDlgSimple.setFields(this.fields);
			oValueHelpDlgSimple.attachSelected(function(oEvent) {
				MessageToast.show("Yeah. Selected Value: " + oEvent.getParameters()[0].getProperty("key"));
			});
			oValueHelpDlgSimple.attachCanceled(function(oEvent) {
				MessageToast.show("Canceled");
			});

			oValueHelpDlgSimple.open();
		},
		
		
		
		onTwoColumnComboBoxChange: function(oEvent) {
			var selectedKey = this.getView().getModel("comboBoxModel").getProperty("/selectedKey");
			
			if(!selectedKey || selectedKey === "") {
				oEvent.getSource().setSelectedKey(null);
				this.getView().getModel("comboBoxModel").setProperty("/selectedKey", null);
			}
			
			// if(!oEvent.getParameter("itemPressed") && oEvent.getParameter("value")) {
			// 	var binding = oEvent.getSource().getBinding("items");
			// 	var filter = new Filter("Name", sap.ui.model.FilterOperator.StartsWith, oEvent.getParameter("value"));
			// 	binding = binding.filter(filter);
			// 	if(binding.getLength() === 0) {
			// 		oEvent.getSource().setSelectedKey(null);					
			// 		StripToaster.notify({
			// 			text: "There is no value found in ListBinding of ComboBox Control",
			// 			type: sap.ui.core.MessageType.Warning,
			// 			timeOut: 12000,
			// 			position: Popup.Dock.CenterTop
			// 		});
			// 	} else {
			// 		var curContexts = binding.getCurrentContexts();
			// 		var id = curContexts[0].getProperty("ProductId");
			// 		oEvent.getSource().setSelectedKey(id);					
			// 	}
			// 	binding.filter(null);
			// }
		}
		

	});
});
