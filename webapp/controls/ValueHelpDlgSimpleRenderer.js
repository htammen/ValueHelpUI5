/*!
 * ${copyright}
 */

// Provides default renderer for control tammenit.sap.ui5.controls.ValueHelpDlgSimple
sap.ui.define(['sap/ui/core/Renderer'],
	function(Renderer) {
	"use strict";

	/**
	 * ValueHelpDLgSimple renderer.
	 *
	 * @author Helmut Tammen (h.tammen@tammen-it-solutions.de)
	 * @namespace
	 */
	var ValueHelpDlgSimpleRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {tammenit.sap.ui5.controls.ValueHelpDlgSimple} oValueHelpDlgSimple An object representation of the control that should be rendered.
	 */
	ValueHelpDlgSimpleRenderer.render = function(oRm, oValueHelpDlgSimple) {
		oRm.renderControl(oValueHelpDlgSimple.getAggregation("_valueHelpDialog"));
	};

	return ValueHelpDlgSimpleRenderer;

}, /* bExport= */ true);
