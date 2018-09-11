// Copyright 2014-2018, University of Colorado Boulder

/**
 * The menu that handles showing saved curve temperatures
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var GenericCurveShape = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/GenericCurveShape' );
  var Panel = require( 'SUN/Panel' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );

  /**
   * Makes a SavedGraphInformationPanel given a model that has saved bodies
   * @param {BlackbodySpectrumModel} model
   * @param {Object} [options]
   * @constructor
   */
  function SavedGraphInformationPanel( model, options ) {
    var self = this;

    options = _.extend( {
      panelFill: 'black',
      panelStroke: 'white',
      minWidth: 80,
      spacing: 10,
      curveWidth: 50,
      curveLineWidth: 5,
      labelOptions: {
        font: new PhetFont( 16 ),
        fill: 'white'
      }
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
      spacing: options.spacing
    } );
    Panel.call( this, content, {
      fill: options.panelFill,
      stroke: options.panelStroke,
      minWidth: options.minWidth,
      align: 'center',
      yMargin: 10
    } );

    // A small local function that takes in a temperature and formats it consistently
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
      content.removeAllChildren();
      if ( numberOfSavedBodies > 0 ) {
        content.addChild( primaryTemperatureBox );
        content.addChild( primarySavedTemperatureBox );
        if ( numberOfSavedBodies > 1 ) {
          content.addChild( secondarySavedTemperatureBox );
        }
        primarySavedTemperatureLabel.text = formatTemperature( model.savedBodies.get( numberOfSavedBodies - 1 ).temperatureProperty.value );
        secondarySavedTemperatureLabel.text = formatTemperature( model.savedBodies.get( 0 ).temperatureProperty.value ); // text is set, but this label isn't necessarily visible
      }
      self.centerX = oldCenterX;
    } );

  }

  blackbodySpectrum.register( 'SavedGraphInformationPanel', SavedGraphInformationPanel );

  return inherit( Panel, SavedGraphInformationPanel );

} );