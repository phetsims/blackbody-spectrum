// Copyright 2018-2019, University of Colorado Boulder

/**
 * Triangular slider thumb that points down on a horizontal slider
 * The horizontal slider is rotated vertically to make this eventually point left when seen
 *
 * @author Arnab Purkayastha
 */
define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const blackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/blackbodyColorProfile' );
  const blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  const ButtonListener = require( 'SCENERY/input/ButtonListener' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Shape = require( 'KITE/Shape' );
  const Tandem = require( 'TANDEM/Tandem' );

  class TriangleSliderThumb extends Path {

    /**
     * Creates the triangle thumb slider
     * Triangle points down in just logical coordinates because this node eventually gets rotated for actual display
     * @param {Object} [options]
     */
    constructor( options ) {

      options = _.extend( {
        size: new Dimension2( 15, 15 ),
        stroke: blackbodyColorProfile.triangleStrokeProperty,
        lineWidth: 1,
        fill: 'rgb( 50, 145, 184 )',
        fillHighlighted: 'rgb( 71, 207, 255 )',
        dashedLineOptions: {
          stroke: blackbodyColorProfile.triangleStrokeProperty,
          lineDash: [ 3, 3 ]
        },
        cursor: 'pointer',
        tandem: Tandem.required
      }, options );

      // Draw the thumb shape starting at the bottom corner, moving up to the top left
      // then moving right and connecting back, all relative to a horizontal track
      const arrowHalfLength = options.size.width / 2;
      const arrowHalfWidth = options.size.width / 2;
      const shape = new Shape()
        .moveTo( 0, -arrowHalfLength )
        .lineTo( -arrowHalfWidth, arrowHalfLength )
        .lineTo( arrowHalfWidth, arrowHalfLength )
        .close();

      super( shape, options );

      // @private dashed lines to visibly anchor the triangle slider to the thermometer
      this.dashedLinesPath = new Path( null, options.dashedLineOptions );
      this.dashedLinesPath.shape = new Shape()
        .moveTo( 0, -arrowHalfLength )
        .lineTo( 0, -2.5 * arrowHalfLength );

      // @private Arrows that will disappear after first click
      const ARROW_OPTIONS = {
        fill: '#64dc64',
        headHeight: 15,
        headWidth: 15,
        tailWidth: 7
      };
      this.cueingArrows = new Node( {
        children: [ new ArrowNode( 15, 0, 40, 0, ARROW_OPTIONS ), new ArrowNode( -15, 0, -40, 0, ARROW_OPTIONS ) ],
        tandem: options.tandem.createTandem( 'cueingArrows' )
      } );

      // Highlight thumb on pointer over and remove arrows on first click
      this.addInputListener( new ButtonListener( {
        over: () => {
          this.fill = options.fillHighlighted;
        },
        up: () => {
          this.fill = options.fill;
        },
        down: () => {
          this.cueingArrows.visible = false;
        }
      } ) );

      this.addChild( this.cueingArrows );
      this.addChild( this.dashedLinesPath );
    }

    /**
     * Reset Properties associated with this Node
     * @public
     */
    reset() {
      this.cueingArrows.visible = true;
    }

  }

  return blackbodySpectrum.register( 'TriangleSliderThumb', TriangleSliderThumb );
} );
