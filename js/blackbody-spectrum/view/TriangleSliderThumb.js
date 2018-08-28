// Copyright 2014-2018, University of Colorado Boulder

/**
 * Triangular slider thumb that points down on a horizontal slider
 * The horizontal slider is rotated vertically to make this eventually point left when seen
 *
 * @author Arnab Purkayastha
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );

  // constants
  var ARROW_OPTIONS = {
    fill: '#64dc64'
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
      stroke: 'white',
      lineWidth: 1,
      fill: 'rgb( 50, 145, 184 )',
      fillHighlighted: 'rgb( 71, 207, 255 )'
    }, options );

    // Draw the thumb shape starting at the bottom corner, moving up to the top left
    // then moving right and connecting back, all relative to a horizontal track
    var arrowHalfLength = options.size.width / 2;
    var arrowHalfWidth = options.size.width / 2;
    var shape = new Shape().moveTo( 0, -arrowHalfLength ).lineTo( -arrowHalfWidth, arrowHalfLength ).lineTo( arrowHalfWidth, arrowHalfLength ).close();

    // Arrows that will disappear after first click
    this.cueingArrows = new Node( {
      children: [ new ArrowNode( 12, 0, 27, 0, ARROW_OPTIONS ), new ArrowNode( -12, 0, -27, 0, ARROW_OPTIONS ) ]
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
