// Copyright 2017, University of Colorado Boulder

/**
 * Triangular slider thumb that points left
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

  /**
   * @param {Object} [options]
   * @constructor
   */
  function TriangleSliderThumb( options ) {

    var self = this;

    options = _.extend( {
      size: new Dimension2( 15, 15 ),
      stroke: 'black',
      lineWidth: 1,
      fill: 'rgb( 50, 145, 184 )',
      fillHighlighted: 'rgb( 71, 207, 255 )'
    }, options );

    // Draw the thumb shape starting at the bottom corner, moving up to the top left
    // then moving right and connecting back, all relative to a horizontal track
    var arrowHalfLength = options.size.width / 2;
    var arrowHalfWidth = options.size.width / 2;
    var shape = new Shape().moveTo( 0, -arrowHalfLength ).lineTo( -arrowHalfWidth, arrowHalfLength ).lineTo( arrowHalfWidth, arrowHalfLength ).close();

    Path.call( this, shape, options );

    // highlight thumb on pointer over
    this.addInputListener( new ButtonListener( {
      over: function( event ) {
        self.fill = options.fillHighlighted;
      },
      up: function( event ) {
        self.fill = options.fill;
      }
    } ) );
  }

  blackbodySpectrum.register( 'TriangleSliderThumb', TriangleSliderThumb );

  return inherit( Path, TriangleSliderThumb );
} );
