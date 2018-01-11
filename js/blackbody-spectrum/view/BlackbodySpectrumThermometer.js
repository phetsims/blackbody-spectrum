// Copyright 2014-2018, University of Colorado Boulder

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
  var Node = require( 'SCENERY/nodes/Node' );
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
  var TICK_MARKS = [
    { text: sunString, temperature: 5700 },
    { text: lightbulbString, temperature: 3000 },
    { text: ovenString, temperature: 660 },
    { text: earthString, temperature: 300 }
  ];

  /**
   * @param {Property.<number>} temperatureProperty
   * @param {Object} [options]
   * @constructor
   */
  function BlackbodySpectrumThermometer( temperatureProperty, options ) {

    options = _.extend( {
      minTemperature: 0,
      maxTemperature: 6000,
      bulbDiameter: 50,
      tubeWidth: 30,
      tubeHeight: 300,
      glassThickness: 4,
      lineWidth: 4,
      outlineStroke: 'white',
      tickSpacing: 15,
      tickLabelFont: new PhetFont( { size: 24, weight: 'bold' } ),
      tickLabelColor: 'yellow'
    }, options );

    ThermometerNode.call( this, options.minTemperature, options.maxTemperature, temperatureProperty, options );

    // labeled tick marks
    for ( var i = 0; i < TICK_MARKS.length; i++ ) {
      this.addChild( createLabeledTick( TICK_MARKS[ i ].text, TICK_MARKS[ i ].temperature, options ) );
    }
  }

  blackbodySpectrum.register( 'BlackbodySpectrumThermometer', BlackbodySpectrumThermometer );

  inherit( ThermometerNode, BlackbodySpectrumThermometer );

  /**
   * Creates a labeled tick mark.
   * @param {string} text
   * @param {number} temperature
   * @param {Object} options - options that were provided to BlackbodySpectrumThermometer constructor
   */
  function createLabeledTick( text, temperature, options ) {

    var linearFunction = temperatureToHeightLinearFunction( options );
    var objectHeight = linearFunction( temperature );
    var tickMarkLength = options.tubeWidth * 0.5;

    var shape = new Shape();
    shape.moveTo( options.tubeWidth / 2, objectHeight ).horizontalLineToRelative( tickMarkLength );

    var tickNode = new Path( shape, { stroke: options.outlineStroke, lineWidth: options.lineWidth } );
    var textNode = new Text( text, { font: options.tickLabelFont, fill: options.tickLabelColor } );

    var parentNode = new Node( {
      children: [ tickNode, textNode ]
    } );

    tickNode.left = tickMarkLength;
    tickNode.centerY = objectHeight;
    textNode.centerY = objectHeight;
    textNode.left = tickNode.right + 10;

    return parentNode;
  }

  /**
   * map function that relates a temperature to a height
   * this function was reverse engineered from ThermometerNode in Scenery-Phet
   * @param {Object} options - options that were provided to BlackbodySpectrumThermometer constructor
   * @returns {LinearFunction}
   */
  var temperatureToHeightLinearFunction = function( options ) {
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

  return BlackbodySpectrumThermometer;
} );