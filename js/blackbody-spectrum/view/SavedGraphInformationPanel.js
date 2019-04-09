// Copyright 2018, University of Colorado Boulder

/**
 * The menu that handles showing saved curve temperatures
 * @author Saurabh Totey
 * @author Arnab Purkayastha
 */
define( function( require ) {
  'use strict';

  // modules
  var blackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/blackbodyColorProfile' );
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var GenericCurveShape = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/GenericCurveShape' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * Makes a SavedGraphInformationPanel given a model that has saved bodies
   * @param {BlackbodySpectrumModel} model
   * @param {Object} [options]
   * @constructor
   */
  function SavedGraphInformationPanel( mainBody, savedBodies, options ) {
    var self = this;

    options = _.extend( {
      panelFill: 'rgba( 0, 0, 0, 0 )',
      panelStroke: blackbodyColorProfile.panelStrokeProperty,
      minWidth: 140,
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
    var primaryTemperatureLabel = new Text( '?', options.labelOptions );
    var primarySavedTemperatureLabel = new Text( '?', options.labelOptions );
    var secondarySavedTemperatureLabel = new Text( '?', options.labelOptions );

    // The generic curves that represent their respective actual curves
    var primaryGenericCurve = new Path( new GenericCurveShape(), {
      stroke: PhetColorScheme.RED_COLORBLIND,
      lineWidth: options.curveLineWidth,
      maxWidth: options.curveWidth
    } );
    var primarySavedGenericCurve = new Path( new GenericCurveShape(), {
      stroke: options.savedCurveStroke,
      lineWidth: options.curveLineWidth,
      maxWidth: options.curveWidth
    } );
    var secondarySavedGenericCurve = new Path( new GenericCurveShape(), {
      stroke: options.savedCurveStroke,
      lineDash: [ 5, 5 ],
      lineWidth: options.curveLineWidth,
      maxWidth: options.curveWidth
    } );

    // The HBoxes that groups each generic curve to its temperature label
    var primaryTemperatureBox = new HBox( {
      children: [ primaryGenericCurve, primaryTemperatureLabel ],
      spacing: options.spacing
    } );
    var primarySavedTemperatureBox = new HBox( {
      children: [ primarySavedGenericCurve, primarySavedTemperatureLabel ],
      spacing: options.spacing
    } );
    var secondarySavedTemperatureBox = new HBox( {
      children: [ secondarySavedGenericCurve, secondarySavedTemperatureLabel ],
      spacing: options.spacing
    } );

    var content = new VBox( {
      children: [ primaryTemperatureBox, primarySavedTemperatureBox, secondarySavedTemperatureBox ],
      spacing: options.spacing,
      align: 'left'
    } );
    Panel.call( this, content, {
      fill: 'rgba( 0, 0, 0, 0 )',
      stroke: options.panelStroke,
      minWidth: options.minWidth,
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
    function formatTemperature( temperature ) {
      return Util.toFixed( temperature, 0 ) + ' K';
    }

    // Link's the main body's temperature to the primaryTemperatureLabel
    mainBody.temperatureProperty.link( function( temperature ) {
      primaryTemperatureLabel.text = formatTemperature( temperature );
    } );

    // Links the saved bodies to the saved temperature boxes' visibility and text
    savedBodies.lengthProperty.link( function( numberOfSavedBodies ) {
      var oldCenterX = self.centerX;
      self.visible = numberOfSavedBodies > 0;
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
      self.centerX = oldCenterX;
    } );

  }

  blackbodySpectrum.register( 'SavedGraphInformationPanel', SavedGraphInformationPanel );

  return inherit( Panel, SavedGraphInformationPanel );

} );