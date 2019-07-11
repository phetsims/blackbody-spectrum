// Copyright 2019, University of Colorado Boulder

/**
 * The menu that handles showing saved curve temperatures
 * @author Saurabh Totey
 * @author Arnab Purkayastha
 */
define( require => {
  'use strict';

  // modules
  const blackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/blackbodyColorProfile' );
  const blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  const GenericCurveShape = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/GenericCurveShape' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const Panel = require( 'SUN/Panel' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const kelvinUnitsString = require( 'string!BLACKBODY_SPECTRUM/kelvinUnits' );

  class SavedGraphInformationPanel extends Panel {

    /**
     * Makes a SavedGraphInformationPanel given a model that has saved bodies
     * @param {BlackbodySpectrumModel} model
     * @param {Object} [options]
     */
    constructor( mainBody, savedBodies, options ) {

      options = _.extend( {
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
        tandem: Tandem.required,
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
        align: 'left'
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
       * @param {number} temperature
       * @returns {string}
       * @private
       */
      const formatTemperature = temperature => `${Util.toFixed( temperature, 0 )} ` + kelvinUnitsString;

      // Link's the main body's temperature to the primaryTemperatureLabel
      mainBody.temperatureProperty.link( temperature => {
        primaryTemperatureLabel.text = formatTemperature( temperature );
      } );

      // Links the saved bodies to the saved temperature boxes' visibility and text
      savedBodies.lengthProperty.link( numberOfSavedBodies => {
        const oldCenterX = this.centerX;
        this.visible = numberOfSavedBodies > 0;
        secondarySavedTemperatureBox.visible = numberOfSavedBodies > 1;
        if ( numberOfSavedBodies > 0 ) {
          primarySavedTemperatureLabel.text = formatTemperature(
            savedBodies.get( numberOfSavedBodies - 1 ).temperatureProperty.value
          );

          // text is set, but this label isn't necessarily visible
          secondarySavedTemperatureLabel.text = formatTemperature(
            savedBodies.get( 0 ).temperatureProperty.value
          );
        }
        this.centerX = oldCenterX;
      } );

    }
  }

  return blackbodySpectrum.register( 'SavedGraphInformationPanel', SavedGraphInformationPanel );
} );