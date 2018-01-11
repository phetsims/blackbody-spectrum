// Copyright 2014-2017, University of Colorado Boulder

/**
 * Scenery Node that displays a thermometer with labels attached to the right hand side of the thermometer
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ThermometerNode = require( 'SCENERY_PHET/ThermometerNode' );

  // string
  var earthString = require( 'string!BLACKBODY_SPECTRUM/earth' );
  var lightbulbString = require( 'string!BLACKBODY_SPECTRUM/lightbulb' );
  var ovenString = require( 'string!BLACKBODY_SPECTRUM/oven' );
  var sunString = require( 'string!BLACKBODY_SPECTRUM/sun' );

  // constants
  var VALUE_FONT = new PhetFont( { size: 24, weight: 'bold' } );
  var COLOR_FONT = 'yellow';

  /**
   * @param {Property.<number>} temperatureProperty
   * @param {Object} [options]
   * @constructor
   */
  function BlackbodySpectrumThermometer( temperatureProperty, options ) {

    var self = this;

    options = _.extend( {
      minTemperature: 0,
      maxTemperature: 6000,
      bulbDiameter: 50,
      tubeWidth: 30,
      tubeHeight: 300,
      glassThickness: 4,
      lineWidth: 4,
      outlineStroke: 'white',
      tickSpacing: 15
    }, options );

    ThermometerNode.call( this, options.minTemperature, options.maxTemperature, temperatureProperty, options );

    // label and their associated values
    var labels = [
      { text: sunString, temperature: 5700 },
      { text: lightbulbString, temperature: 3000 },
      { text: ovenString, temperature: 660 },
      { text: earthString, temperature: 300 }
    ];

    //TODO move this function out of the constructor
    /**
     * map function that relates a temperature to a height
     * this function was reverse engineered from ThermometerNode in Scenery-Phet
     *
     * @returns {LinearFunction}
     */
    var temperatureToHeightLinearFunction = function() {
      var fluidWidth = options.tubeWidth - options.lineWidth - options.glassThickness;
      var clipBulbRadius = ( options.bulbDiameter - options.lineWidth - options.glassThickness ) / 2;
      var clipStartAngle = -Math.acos( ( fluidWidth / 2 ) / clipBulbRadius );
      var clipEndAngle = Math.PI - clipStartAngle;
      var fluidSphereDiameter = options.bulbDiameter - options.lineWidth - options.glassThickness;
      var fluidBottomCutoff = fluidSphereDiameter / 2 * Math.sin( clipEndAngle );
      var height = options.tubeHeight + options.tubeWidth / 2; // need the halfcap on top
      var maxFluidHeight = height - fluidBottomCutoff;
      return new LinearFunction( options.minTemperature, options.maxTemperature, fluidBottomCutoff, -maxFluidHeight, true /* clamp */ );
    };

    //TODO move this function out of the constructor
    /**
     * Create and add text and tick label for thermometer
     * @param {text:{string}, temperature:{number}} label
     */
    function labelMaker( label ) {
      var objectHeight = temperatureToHeightLinearFunction()( label.temperature );
      var tickMarkLength = options.tubeWidth * 0.5;
      var shape = new Shape();
      shape.moveTo( options.tubeWidth / 2, objectHeight ).horizontalLineToRelative( tickMarkLength );
      var tickNode = new Path( shape, { stroke: options.outlineStroke, lineWidth: options.lineWidth } );
      var textNode = new Text( label.text, { font: VALUE_FONT, fill: COLOR_FONT } );

      self.addChild( tickNode );
      self.addChild( textNode );

      tickNode.left = tickMarkLength;
      tickNode.centerY = objectHeight;
      textNode.centerY = objectHeight;
      textNode.left = tickNode.right + 10;
    }

    // runs over all the labels to be added
    for ( var i = 0; i < labels.length; i++ ) {
      var label = labels[ i ];
      labelMaker( label );
    }
  }

  blackbodySpectrum.register( 'BlackbodySpectrumThermometer', BlackbodySpectrumThermometer );

  return inherit( ThermometerNode, BlackbodySpectrumThermometer );
} );