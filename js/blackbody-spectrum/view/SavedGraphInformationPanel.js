// Copyright 2018, University of Colorado Boulder

/**
 * The menu that handles showing saved curve temperatures
 * // REVIEW: Needs @author annotations
 */
define( function( require ) {
  'use strict';

  // modules
  var BlackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackbodyColorProfile' );
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
   * REVIEW: It might be better to just pass in mainBody and savedBodies instead of the whole model, but up to you
   * Makes a SavedGraphInformationPanel given a model that has saved bodies
   * @param {BlackbodySpectrumModel} model
   * @param {Object} [options]
   * @constructor
   */
  function SavedGraphInformationPanel( model, options ) {
    var self = this;

    options = _.extend( {
      panelFill: 'rgba( 0, 0, 0, 0 )',
      panelStroke: BlackbodyColorProfile.panelStrokeProperty,
      minWidth: 140,
      spacing: 10,
      curveWidth: 50,
      curveLineWidth: 5,
      labelOptions: {
        font: new PhetFont( 16 ),
        fill: BlackbodyColorProfile.titlesTextProperty
      },

      // phet-io
      tandem: Tandem.required,
      phetioDocumentation: 'panel that contains saved blackbody temperatures',
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
    // REVIEW: 'gray' can be pulled out into an option or constant for something like savedCurveStroke
    var primarySavedGenericCurve = new Path( new GenericCurveShape(), {
      stroke: 'gray',
      lineWidth: options.curveLineWidth,
      maxWidth: options.curveWidth
    } );
    var secondarySavedGenericCurve = new Path( new GenericCurveShape(), {
      stroke: 'gray',
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

    // A small local function that takes in a temperature and formats it consistently
    // REVIEW: Needs JSDoc or line comment for @param and @returns
    function formatTemperature( temperature ) {
      return Util.toFixed( temperature, 0 ) + ' K';
    }

    // Link's the main body's temperature to the primaryTemperatureLabel
    model.mainBody.temperatureProperty.link( function( temperature ) {
      primaryTemperatureLabel.text = formatTemperature( temperature );
    } );

    // Links the saved bodies to the saved temperature boxes' visibility and text
    model.savedBodies.lengthProperty.link( function( numberOfSavedBodies ) {
      var oldCenterX = self.centerX;
      self.visible = numberOfSavedBodies > 0;
      secondarySavedTemperatureBox.visible = numberOfSavedBodies > 1;
      if ( numberOfSavedBodies > 0 ) {
        // REVIEW: the following two lines need to be broken into multiple lines so they're shorter
        primarySavedTemperatureLabel.text = formatTemperature( model.savedBodies.get( numberOfSavedBodies - 1 ).temperatureProperty.value );
        secondarySavedTemperatureLabel.text = formatTemperature( model.savedBodies.get( 0 ).temperatureProperty.value ); // text is set, but this label isn't necessarily visible
      }
      self.centerX = oldCenterX;
    } );

  }

  blackbodySpectrum.register( 'SavedGraphInformationPanel', SavedGraphInformationPanel );

  return inherit( Panel, SavedGraphInformationPanel );

} );