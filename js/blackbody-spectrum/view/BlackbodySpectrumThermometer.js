// Copyright 2014-2019, University of Colorado Boulder

/**
 * Scenery Node that displays a thermometer with labels attached to the left hand side of the thermometer
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var BlackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackbodyColorProfile' );
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ThermometerNode = require( 'SCENERY_PHET/ThermometerNode' );
  var TriangleSliderThumb = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/TriangleSliderThumb' );
  var Util = require( 'DOT/Util' );

  // string
  var earthString = require( 'string!BLACKBODY_SPECTRUM/earth' );
  // REVIEW: This var name should be updated once the key name is changed in https://github.com/phetsims/blackbody-spectrum/issues/76
  var lightBulbString = require( 'string!BLACKBODY_SPECTRUM/lightBulb' );
  var siriusAString = require( 'string!BLACKBODY_SPECTRUM/siriusA' );
  var sunString = require( 'string!BLACKBODY_SPECTRUM/sun' );

  // constants
  var TICK_MARKS = [
    { text: siriusAString, temperature: 9940 },
    { text: sunString, temperature: 5778 },
    { text: lightBulbString, temperature: 3000 },
    { text: earthString, temperature: 300 }
  ];

  /**
   * Constructs a thermometer for the sim given the Property for the temperature to track
   * @param {Property.<number>} temperatureProperty
   * @param {Object} [options]
   * @constructor
   */
  function BlackbodySpectrumThermometer( temperatureProperty, options ) {
    var self = this;

    options = _.extend( {
      minTemperature: 270,
      maxTemperature: 11000,
      bulbDiameter: 35,
      tubeWidth: 20,
      tubeHeight: 400,
      majorTickLength: 10,
      minorTickLength: 5,
      glassThickness: 3,
      lineWidth: 3,
      outlineStroke: BlackbodyColorProfile.thermometerTubeStrokeProperty,
      tickSpacing: 20,
      tickLabelFont: new PhetFont( { size: 18 } ),
      tickLabelColor: BlackbodyColorProfile.thermometerTubeStrokeProperty,
      tickLabelWidth: 100,
      zeroLevel: 'bulbTop',
      thumbSize: 25
    }, options );

    ThermometerNode.call( this, options.minTemperature, options.maxTemperature, temperatureProperty, options );

    // labeled tick marks
    for ( var i = 0; i < TICK_MARKS.length; i++ ) {
      this.addChild( this.createLabeledTick( TICK_MARKS[ i ].text, TICK_MARKS[ i ].temperature, options ) );
    }

    var thumbDimension = new Dimension2( options.thumbSize, options.thumbSize );
    // REVIEW: Needs doc
    this.triangleNode = new TriangleSliderThumb( { size: thumbDimension } );

    var clickYOffset;
    this.triangleNode.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        clickYOffset = self.triangleNode.globalToParentPoint( event.pointer.point ).y - self.triangleNode.y;
      },
      drag: function( event ) {
        var y = self.triangleNode.globalToParentPoint( event.pointer.point ).y - clickYOffset;

        // REVIEW: temperature Property?
        // Clamp to make sure wavelength Property is within graph bounds
        temperatureProperty.value = Util.clamp(
          self.yPosToTemperature( -y ),
          options.minTemperature,
          options.maxTemperature
        );
        self.updateThumb( temperatureProperty, options );
      },
      allowTouchSnag: true
    } ) );

    this.addChild( this.triangleNode );

    this.triangleNode.rotation = -Math.PI / 2;
    this.triangleNode.left = options.tubeWidth / 2;
    this.triangleNode.centerY = -this.temperatureToYPos( TICK_MARKS[ 1 ].temperature );
  }

  blackbodySpectrum.register( 'BlackbodySpectrumThermometer', BlackbodySpectrumThermometer );

  inherit( ThermometerNode, BlackbodySpectrumThermometer, {

    /**
     * Reset Properties associated with this Node
     * @public
     */
    reset: function() {
      this.triangleNode.centerY = -this.temperatureToYPos( TICK_MARKS[ 1 ].temperature );
      this.triangleNode.reset();
    },

    /**
     * Creates a labeled tick mark.
     * @param {string} text
     * @param {number} temperature
     * @param {Object} options - options that were provided to BlackbodySpectrumThermometer constructor
     * // REVIEW: Needs @returns and visibility annotation
     */
    createLabeledTick: function( text, temperature, options ) {
      var objectHeight = -this.temperatureToYPos( temperature );
      var tickMarkLength = options.tubeWidth * 0.5;

      var shape = new Shape();
      shape.moveTo( options.tubeWidth / 2, objectHeight ).horizontalLineToRelative( tickMarkLength );

      var tickNode = new Path( shape, { stroke: options.outlineStroke, lineWidth: options.lineWidth } );
      var textNode = new Text( text, {
        font: options.tickLabelFont,
        fill: options.tickLabelColor,
        maxWidth: options.tickLabelWidth
      } );

      var parentNode = new Node( {
        children: [ tickNode, textNode ]
      } );

      tickNode.right = -0.5 * options.tubeWidth;
      tickNode.centerY = objectHeight;
      textNode.centerY = objectHeight;
      textNode.right = tickNode.left - 10;

      return parentNode;
    },

    /**
     * Updates the location of the thumb
     * // REVIEW: Needs @param
     * @public
     */
    updateThumb: function( temperatureProperty, options ) {
      this.triangleNode.left = options.tubeWidth / 2;
      this.triangleNode.centerY = -this.temperatureToYPos( temperatureProperty.value );
    }
  } );

  return BlackbodySpectrumThermometer;
} );