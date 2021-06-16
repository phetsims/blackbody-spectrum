// Copyright 2014-2021, University of Colorado Boulder

/**
 * Scenery Node that displays a thermometer with labels attached to the left hand side of the thermometer
 *
 * @author Martin Veillette (Berea College)
 * @author Arnab Purkayastha
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import Shape from '../../../../kite/js/Shape.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ThermometerNode from '../../../../scenery-phet/js/ThermometerNode.js';
import SimpleDragHandler from '../../../../scenery/js/input/SimpleDragHandler.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import blackbodySpectrumStrings from '../../blackbodySpectrumStrings.js';
import BlackbodyConstants from '../../BlackbodyConstants.js';
import blackbodySpectrum from '../../blackbodySpectrum.js';
import blackbodyColorProfile from './blackbodyColorProfile.js';
import TriangleSliderThumb from './TriangleSliderThumb.js';

// string
const earthString = blackbodySpectrumStrings.earth;
const lightBulbString = blackbodySpectrumStrings.lightBulb;
const siriusAString = blackbodySpectrumStrings.siriusA;
const sunString = blackbodySpectrumStrings.sun;

// constants
const TICK_MARKS = [
  { text: siriusAString, temperature: BlackbodyConstants.siriusATemperature },
  { text: sunString, temperature: BlackbodyConstants.sunTemperature },
  { text: lightBulbString, temperature: BlackbodyConstants.lightBulbTemperature },
  { text: earthString, temperature: BlackbodyConstants.earthTemperature }
];

class BlackbodySpectrumThermometer extends ThermometerNode {

  /**
   * Constructs a thermometer for the sim given the Property for the temperature to track
   * @param {Property.<number>} temperatureProperty
   * @param {Object} [options]
   */
  constructor( temperatureProperty, options ) {

    options = merge( {
      minTemperature: BlackbodyConstants.minTemperature,
      maxTemperature: BlackbodyConstants.maxTemperature,
      bulbDiameter: 35,
      tubeWidth: 20,
      tubeHeight: 400,
      majorTickLength: 10,
      minorTickLength: 5,
      glassThickness: 5,
      lineWidth: 3,
      outlineStroke: blackbodyColorProfile.thermometerTubeStrokeProperty,
      tickSpacingTemperature: 500,
      tickLabelFont: new PhetFont( { size: 18 } ),
      tickLabelColor: blackbodyColorProfile.thermometerTubeStrokeProperty,
      tickLabelWidth: 100,
      snapInterval: 50,
      zeroLevel: 'bulbTop',
      thumbSize: 25,

      tandem: Tandem.REQUIRED
    }, options );

    super( options.minTemperature, options.maxTemperature, temperatureProperty, options );

    // labeled tick marks
    const tickContainer = new Node( {
      children: _.range( 0, TICK_MARKS.length ).map( i => this.createLabeledTick( i, options ) ),
      tandem: options.tandem.createTandem( 'labelsNode' )
    } );

    const thumbDimension = new Dimension2( options.thumbSize, options.thumbSize );

    // @private thumb node thermometer's slider
    this.triangleNode = new TriangleSliderThumb( {
      size: thumbDimension,
      tandem: options.tandem.createTandem( 'slider' )
    } );
    this.triangleNode.touchArea = this.triangleNode.localBounds.dilatedXY( 10, 10 );

    let clickYOffset;
    this.triangleNode.addInputListener( new SimpleDragHandler( {
      start: event => {
        clickYOffset = this.triangleNode.globalToParentPoint( event.pointer.point ).y - this.triangleNode.y;
      },
      drag: event => {
        const y = this.triangleNode.globalToParentPoint( event.pointer.point ).y - clickYOffset;

        // Clamp to make sure temperature Property is within graph bounds
        temperatureProperty.value = Utils.clamp(
          Utils.roundToInterval( this.yPosToTemperature( -y ), options.snapInterval ),
          options.minTemperature,
          options.maxTemperature
        );
        this.updateThumb( temperatureProperty, options );
      },
      allowTouchSnag: true,
      tandem: options.tandem.createTandem( 'dragListener' )
    } ) );

    this.triangleNode.rotation = -Math.PI / 2;
    this.triangleNode.left = options.tubeWidth / 2;
    this.triangleNode.centerY = -this.temperatureToYPos( TICK_MARKS[ 1 ].temperature );

    this.addChild( tickContainer );
    this.addChild( this.triangleNode );

    // @private position of the center of the thermometer (not the whole node) relative to the right of the node
    this._thermometerCenterXFromRight = -this.triangleNode.width - options.tubeWidth / 2;
  }

  /**
   * Reset Properties associated with this Node
   * @public
   */
  reset() {
    this.triangleNode.centerY = -this.temperatureToYPos( TICK_MARKS[ 1 ].temperature );
    this.triangleNode.reset();
  }

  /**
   * Creates a labeled tick mark.
   * @param {number} tickMarkIndex
   * @param {Object} [options] - options that were provided to BlackbodySpectrumThermometer constructor
   * @returns {Node}
   * @private
   */
  createLabeledTick( tickMarkIndex, options ) {
    const text = TICK_MARKS[ tickMarkIndex ].text;
    const temperature = TICK_MARKS[ tickMarkIndex ].temperature;

    const objectHeight = -this.temperatureToYPos( temperature );
    const tickMarkLength = options.tubeWidth * 0.5;

    const shape = new Shape();
    shape.moveTo( options.tubeWidth / 2, objectHeight ).horizontalLineToRelative( tickMarkLength );

    const tickNode = new Path( shape, { stroke: options.outlineStroke, lineWidth: options.lineWidth } );
    const textNode = new Text( text, {
      font: options.tickLabelFont,
      fill: options.tickLabelColor,
      maxWidth: options.tickLabelWidth
    } );

    const parentNode = new Node( {
      children: [ tickNode, textNode ]
    } );

    tickNode.right = -0.5 * options.tubeWidth;
    tickNode.centerY = objectHeight;
    textNode.centerY = objectHeight;
    textNode.right = tickNode.left - 10;

    return parentNode;
  }

  /**
   * Updates the position of the thumb
   * @param {Property.<number>} [temperatureProperty]
   * @param {Object} [options]
   * @public
   */
  updateThumb( temperatureProperty, options ) {
    assert && assert( temperatureProperty.value >= options.minTemperature &&
    temperatureProperty.value <= options.maxTemperature,
      'temperature has exceeded thermometer bounds' );
    this.triangleNode.left = options.tubeWidth / 2;
    this.triangleNode.centerY = -this.temperatureToYPos( temperatureProperty.value );
  }

  /**
   * Get horizontal position of thermometer center relative to centerX of the node
   * @returns {number}
   * @public
   */
  get thermometerCenterXFromRight() { return this._thermometerCenterXFromRight; }
}

blackbodySpectrum.register( 'BlackbodySpectrumThermometer', BlackbodySpectrumThermometer );
export default BlackbodySpectrumThermometer;
