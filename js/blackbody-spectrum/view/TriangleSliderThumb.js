// Copyright 2018, University of Colorado Boulder

/**
 * Triangular slider thumb that points down on a horizontal slider
 * The horizontal slider is rotated vertically to make this eventually point left when seen
 *
 * @author Arnab Purkayastha
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var BlackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackbodyColorProfile' );
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  // constants
  var ARROW_OPTIONS = {
    fill: '#64dc64',
    headHeight: 15,
    headWidth: 15,
    tailWidth: 7
  };

  /**
   * Creates the triangle thumb slider
   * Triangle points down in just logical coordinates because this node eventually gets rotated for actual display
   * @param {Object} [options]
   * @constructor
   */
  function TriangleSliderThumb( options ) {

    var self = this;

    options = _.extend( {
      size: new Dimension2( 15, 15 ),
      stroke: BlackbodyColorProfile.triangleStrokeProperty,
      lineWidth: 1,
      fill: 'rgb( 50, 145, 184 )',
      fillHighlighted: 'rgb( 71, 207, 255 )',
      dashedLineOptions: {
        stroke: BlackbodyColorProfile.triangleStrokeProperty,
        lineDash: [ 3, 3 ]
      },
      cursor: 'pointer'
    }, options );

    // Draw the thumb shape starting at the bottom corner, moving up to the top left
    // then moving right and connecting back, all relative to a horizontal track
    var arrowHalfLength = options.size.width / 2;
    var arrowHalfWidth = options.size.width / 2;
    var shape = new Shape()
      .moveTo( 0, -arrowHalfLength )
      .lineTo( -arrowHalfWidth, arrowHalfLength )
      .lineTo( arrowHalfWidth, arrowHalfLength )
      .close();

    this.dashedLinesPath = new Path( null, options.dashedLineOptions );
    this.dashedLinesPath.shape = new Shape()
      .moveTo( 0, -arrowHalfLength )
      .lineTo( 0, -2.5 * arrowHalfLength );

    // Arrows that will disappear after first click
    this.cueingArrows = new Node( {
      children: [ new ArrowNode( 15, 0, 40, 0, ARROW_OPTIONS ), new ArrowNode( -15, 0, -40, 0, ARROW_OPTIONS ) ]
    } );

    Path.call( this, shape, options );

    // Highlight thumb on pointer over and remove arrows on first click
    this.addInputListener( new ButtonListener( {
      over: function() {
        self.fill = options.fillHighlighted;
      },
      up: function() {
        self.fill = options.fill;
      },
      down: function() {
        self.cueingArrows.visible = false;
      }
    } ) );

    this.addChild( this.cueingArrows );
    this.addChild( this.dashedLinesPath );

    this.touchArea = this.localBounds.dilatedY( 5 );

  }

  blackbodySpectrum.register( 'TriangleSliderThumb', TriangleSliderThumb );

  return inherit( Path, TriangleSliderThumb, {

    /**
     * Reset Properties associated with this Node
     * @public
     */
    reset: function() {
      this.cueingArrows.visible = true;
    }

  } );
} );
