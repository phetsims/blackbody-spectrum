//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Thermometer Nodes with label
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Thermometer = require( 'SCENERY_PHET/ThermometerNode' );

  //string

  var sunString = require( 'string!BLACKBODY_SPECTRUM/sun' );
  var lightbulbString = require( 'string!BLACKBODY_SPECTRUM/lightbulb' );
  var ovenString = require( 'string!BLACKBODY_SPECTRUM/oven' );
  var earthString = require( 'string!BLACKBODY_SPECTRUM/earth' );


  // constants
  var VALUE_FONT = new PhetFont( {size: 24, weight: 'bold'} );
  var COLOR_FONT = "yellow";

  /**
   * @param {Property.<number>} temperatureProperty
   * @param options see comments in the constructor for options parameter values
   * @constructor
   */

  function ThermometerNode( temperatureProperty, options ) {

    var thisThermometerNode = this;

    options = _.extend( {
      minTemperature: 0,
      maxTemperature: 6000,
      bulbDiameter: 50,
      tubeWidth: 30,
      tubeHeight: 300,
      lineWidth: 4,
      outlineStroke: 'white',
      tickSpacing: 15
    }, options );

    Node.call( thisThermometerNode );

    var thermometer = new Thermometer( options.minTemperature, options.maxTemperature, temperatureProperty, {
      bulbDiameter: options.bulbDiameter,
      tubeWidth: options.tubeWidth,
      tubeHeight: options.tubeHeight,
      lineWidth: options.lineWidth,
      outlineStroke: options.outlineStroke,
      tickSpacing: options.tickSpacing
    } );

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
     * creates text label for thermometer
     * @param  {Label} label
     * @constructor
     */
    function labelMaker( label ) {
      var fluidOffset = -options.bulbDiameter; // the 0 temperature point of the rectangle
      var maxFluidHeight = options.tubeHeight;
      var temperatureLinearFunction = new LinearFunction( options.minTemperature, options.maxTemperature, fluidOffset, -maxFluidHeight + fluidOffset );
      var objectHeight = temperatureLinearFunction( label.temperature );
      var tickMarkLength = options.tubeWidth * 0.5;
      var shape = new Shape();
      shape.moveTo( options.tubeWidth / 2, objectHeight ).horizontalLineToRelative( tickMarkLength );
      var tickNode = new Path( shape, {stroke: options.outlineStroke, lineWidth: options.lineWidth} );
      var textNode = new Text( label.text, {font: VALUE_FONT, fill: COLOR_FONT} );

      thisThermometerNode.addChild( tickNode );
      thisThermometerNode.addChild( textNode );

      tickNode.left = tickMarkLength;
      tickNode.centerY = objectHeight;
      textNode.centerY = objectHeight;
      textNode.left = tickNode.right + 10;
    }


    for ( var i = 0; i < labels.length; i++ ) {
      var label = labels[i];
      labelMaker( label );
    }


    // rendering order
    thisThermometerNode.addChild( thermometer );
    {
      thermometer.centerX = 0;
      thermometer.bottom = 0;
    }


    this.mutate( options );
  }

  return inherit( Node, ThermometerNode );
} );