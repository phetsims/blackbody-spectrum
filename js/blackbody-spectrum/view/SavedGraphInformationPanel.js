// Copyright 2018-2020, University of Colorado Boulder

/**
 * The menu that handles showing saved curve temperatures
 * @author Saurabh Totey
 * @author Arnab Purkayastha
 */

import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import blackbodySpectrum from '../../blackbodySpectrum.js';
import blackbodySpectrumStrings from '../../blackbodySpectrumStrings.js';
import blackbodyColorProfile from './blackbodyColorProfile.js';
import GenericCurveShape from './GenericCurveShape.js';

const kelvinUnitsString = blackbodySpectrumStrings.kelvinUnits;

class SavedGraphInformationPanel extends Panel {

  /**
   * Makes a SavedGraphInformationPanel given a model that has saved bodies
   * @param {BlackbodyModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    options = merge( {
      panelFill: 'rgba( 0, 0, 0, 0 )',
      panelStroke: blackbodyColorProfile.panelStrokeProperty,
      minWidth: 140,
      maxWidth: 140,
      spacing: 10,
      curveWidth: 50,
      curveLineWidth: 5,
      savedCurveStroke: 'gray',
      labelOptions: {
        font: new PhetFont( 16 ),
        fill: blackbodyColorProfile.titlesTextProperty
      },

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioDocumentation: 'panel that contains saved blackbody temperatures'
    }, options );

    // The labels for all of the graphs' information
    const primaryTemperatureLabel = new Text( '?', options.labelOptions );
    const primarySavedTemperatureLabel = new Text( '?', options.labelOptions );
    const secondarySavedTemperatureLabel = new Text( '?', options.labelOptions );

    // The generic curves that represent their respective actual curves
    const primaryGenericCurve = new Path( new GenericCurveShape(), {
      stroke: PhetColorScheme.RED_COLORBLIND,
      lineWidth: options.curveLineWidth,
      maxWidth: options.curveWidth
    } );
    const primarySavedGenericCurve = new Path( new GenericCurveShape(), {
      stroke: options.savedCurveStroke,
      lineWidth: options.curveLineWidth,
      maxWidth: options.curveWidth
    } );
    const secondarySavedGenericCurve = new Path( new GenericCurveShape(), {
      stroke: options.savedCurveStroke,
      lineDash: [ 5, 5 ],
      lineWidth: options.curveLineWidth,
      maxWidth: options.curveWidth
    } );

    // The HBoxes that groups each generic curve to its temperature label
    const primaryTemperatureBox = new HBox( {
      children: [ primaryGenericCurve, primaryTemperatureLabel ],
      spacing: options.spacing
    } );
    const primarySavedTemperatureBox = new HBox( {
      children: [ primarySavedGenericCurve, primarySavedTemperatureLabel ],
      spacing: options.spacing
    } );
    const secondarySavedTemperatureBox = new HBox( {
      children: [ secondarySavedGenericCurve, secondarySavedTemperatureLabel ],
      spacing: options.spacing
    } );

    const content = new VBox( {
      children: [ primaryTemperatureBox, primarySavedTemperatureBox, secondarySavedTemperatureBox ],
      spacing: options.spacing,
      align: 'left',
      excludeInvisibleChildrenFromBounds: true
    } );

    super( content, {
      fill: 'rgba( 0, 0, 0, 0 )',
      stroke: options.panelStroke,
      minWidth: options.minWidth,
      maxWidth: options.maxWidth,
      align: 'left',
      yMargin: 10,
      xMargin: 10,
      tandem: options.tandem,
      phetioDocumentation: options.phetioDocumentation
    } );

    /**
     * Local function for temperature formatting
     * @param {number|null} temperature
     * @returns {string}
     * @private
     */
    const formatTemperature = temperature => {
      return temperature !== null ? `${Utils.toFixed( temperature, 0 )} ` + kelvinUnitsString : '';
    };

    // link temperatures to their labels
    model.mainBody.temperatureProperty.link( temperature => {
      primaryTemperatureLabel.text = formatTemperature( temperature );
    } );
    model.savedBodyOne.temperatureProperty.link( temperature => {
      this.visible = temperature !== null;
      primarySavedTemperatureLabel.text = formatTemperature( temperature );
    } );
    model.savedBodyTwo.temperatureProperty.link( temperature => {
      secondarySavedTemperatureBox.visible = temperature !== null;
      secondarySavedTemperatureLabel.text = formatTemperature( temperature );
    } );
  }
}

blackbodySpectrum.register( 'SavedGraphInformationPanel', SavedGraphInformationPanel );
export default SavedGraphInformationPanel;