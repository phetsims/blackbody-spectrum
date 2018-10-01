// Copyright 2014-2018, University of Colorado Boulder

/**
 * Scenery Node that displays a thermometer with labels attached to the left hand side of the thermometer
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ThermometerNode = require( 'SCENERY_PHET/ThermometerNode' );

  // string
  var earthString = require( 'string!BLACKBODY_SPECTRUM/earth' );
  var lightbulbString = require( 'string!BLACKBODY_SPECTRUM/lightbulb' );
  var sunString = require( 'string!BLACKBODY_SPECTRUM/sun' );
  var siriusString = require( 'string!BLACKBODY_SPECTRUM/sirius' );

  // constants
  var TICK_MARKS = [
    { text: siriusString, temperature: 9940 },
    { text: sunString, temperature: 5778 },
    { text: lightbulbString, temperature: 3000 },
    { text: earthString, temperature: 300 }
  ];

  /**
   * Constructs a thermometer for the sim given the property for the temperature to track
   * @param {Property.<number>} temperatureProperty
   * @param {Object} [options]
   * @constructor
   */
  function BlackbodySpectrumThermometer( temperatureProperty, options ) {

    options = _.extend( {
      minTemperature: 300,
      maxTemperature: 11000,
      bulbDiameter: 35,
      tubeWidth: 20,
      tubeHeight: 400,
      majorTickLength: 10,
      minorTickLength: 5,
      glassThickness: 3,
      lineWidth: 3,
      outlineStroke: 'white',
      tickSpacing: 20,
      tickLabelFont: new PhetFont( { size: 18 } ),
      tickLabelColor: 'white',
      zeroLevel: 'bulbTop'
    }, options );

    ThermometerNode.call( this, options.minTemperature, options.maxTemperature, temperatureProperty, options );

    // labeled tick marks
    for ( var i = 0; i < TICK_MARKS.length; i++ ) {
      this.addChild( this.createLabeledTick( TICK_MARKS[ i ].text, TICK_MARKS[ i ].temperature, options ) );
    }
  }

  blackbodySpectrum.register( 'BlackbodySpectrumThermometer', BlackbodySpectrumThermometer );

  inherit( ThermometerNode, BlackbodySpectrumThermometer, {

    /**
     * Creates a labeled tick mark.
     * @param {string} text
     * @param {number} temperature
     * @param {Object} options - options that were provided to BlackbodySpectrumThermometer constructor
     */
    createLabeledTick: function( text, temperature, options ) {
      var objectHeight = -this.temperatureToHeight( temperature );
      var tickMarkLength = options.tubeWidth * 0.5;

      var shape = new Shape();
      shape.moveTo( options.tubeWidth / 2, objectHeight ).horizontalLineToRelative( tickMarkLength );

      var tickNode = new Path( shape, { stroke: options.outlineStroke, lineWidth: options.lineWidth } );
      var textNode = new Text( text, { font: options.tickLabelFont, fill: options.tickLabelColor } );

      var parentNode = new Node( {
        children: [ tickNode, textNode ]
      } );

      tickNode.right = -0.5 * options.tubeWidth;
      tickNode.centerY = objectHeight;
      textNode.centerY = objectHeight;
      textNode.right = tickNode.left - 10;

      return parentNode;
    }
  } );

  return BlackbodySpectrumThermometer;
} );