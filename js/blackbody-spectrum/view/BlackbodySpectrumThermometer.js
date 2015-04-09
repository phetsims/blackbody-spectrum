// Copyright 2002-2014, University of Colorado Boulder

/**
 * Scenery Node that displays a thermometer with labels attached to the right hand side of the thermometer
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Range = require( 'DOT/Range' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ThermometerNode = require( 'SCENERY_PHET/ThermometerNode' );

  // string
  var sunString = require( 'string!BLACKBODY_SPECTRUM/sun' );
  var lightbulbString = require( 'string!BLACKBODY_SPECTRUM/lightbulb' );
  var ovenString = require( 'string!BLACKBODY_SPECTRUM/oven' );
  var earthString = require( 'string!BLACKBODY_SPECTRUM/earth' );


  // constants
  var VALUE_FONT = new PhetFont( { size: 24, weight: 'bold' } );
  var COLOR_FONT = "yellow";

  /**
   * @param {Property.<number>} temperatureProperty
   * @param {Object} [options]
   * @constructor
   */
  function BlackbodySpectrumThermometer( temperatureProperty, options ) {

    var thisThermometer = this;

    options = _.extend( {
      tempRange: new Range( 0, 6000 )
    }, options );

    options.thermometer = _.extend( {
      minTemperature: 0,
      maxTemperature: 6000,
      bulbDiameter: 50,
      tubeWidth: 30,
      tubeHeight: 300,
      glassThickness: 4,
      lineWidth: 4,
      outlineStroke: 'white',
      tickSpacing: 15
    }, options.thermometer );


    ThermometerNode.call( this, options.tempRange.min, options.tempRange.max, temperatureProperty, options.thermometer );

    // label and ticks

    /**
     *
     * @param {String} object
     * @param {number} temperature
     * @constructor
     */
    function Label( object, temperature ) {
      this.text = object;
      this.temperature = temperature; // in kelvin
    }

    var labels = [
      new Label( sunString, 5700 ),
      new Label( lightbulbString, 3000 ),
      new Label( ovenString, 660 ),
      new Label( earthString, 300 )
    ];

    /**
     * map function that relates a temperature to a height
     * this function was reverse engineered from ThermometerNode in Scenery-Phet
     *
     * @returns {LinearFunction}
     */
    var temperatureToHeightLinearFunction = function() {
      var fluidWidth = options.thermometer.tubeWidth - options.thermometer.lineWidth - options.thermometer.glassThickness;
      var clipBulbRadius = ( options.thermometer.bulbDiameter - options.thermometer.lineWidth - options.thermometer.glassThickness ) / 2;
      var clipStartAngle = -Math.acos( ( fluidWidth / 2 ) / clipBulbRadius );
      var clipEndAngle = Math.PI - clipStartAngle;
      var fluidSphereDiameter = options.thermometer.bulbDiameter - options.thermometer.lineWidth - options.thermometer.glassThickness;
      var fluidBottomCutoff = fluidSphereDiameter / 2 * Math.sin( clipEndAngle );
      var height = options.thermometer.tubeHeight + options.thermometer.tubeWidth / 2; // need the halfcap on top
      var maxFluidHeight = height - fluidBottomCutoff;
      return new LinearFunction( options.tempRange.min, options.tempRange.max, fluidBottomCutoff, -maxFluidHeight, true /* clamp */ );
    };


    /**
     * Create and add text and tick label for thermometer
     * @param  {Label} label
     */
    function labelMaker( label ) {
      var objectHeight = temperatureToHeightLinearFunction()( label.temperature );
      var tickMarkLength = options.thermometer.tubeWidth * 0.5;
      var shape = new Shape();
      shape.moveTo( options.thermometer.tubeWidth / 2, objectHeight ).horizontalLineToRelative( tickMarkLength );
      var tickNode = new Path( shape, { stroke: options.thermometer.outlineStroke, lineWidth: options.thermometer.lineWidth } );
      var textNode = new Text( label.text, { font: VALUE_FONT, fill: COLOR_FONT } );

      thisThermometer.addChild( tickNode );
      thisThermometer.addChild( textNode );

      tickNode.left = tickMarkLength;
      tickNode.centerY = objectHeight;
      textNode.centerY = objectHeight;
      textNode.left = tickNode.right + 10;
    }

    //  runs over all the labels to be added
    for ( var i = 0; i < labels.length; i++ ) {
      var label = labels[ i ];
      labelMaker( label );
    }

    this.mutate( options );
  }

  return inherit( ThermometerNode, BlackbodySpectrumThermometer );
} );