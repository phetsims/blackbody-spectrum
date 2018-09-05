// Copyright 2014-2018, University of Colorado Boulder

//TODO this looks generally useful, move to scenery-phet?
/**
 * Scenery Node of a Star
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Object} [options] see comments in the constructor for options parameter values
   * @constructor
   */
  function StarPath( options ) {

    options = _.extend( {
      lineWidth: 1.5,
      lineJoin: 'round',
      fill: 'red',
      stroke: 'red'
    }, options );

    var starShape = new StarShape( options );

    Path.call( this, starShape, options );
  }

  blackbodySpectrum.register( 'StarPath', StarPath );

  inherit( Path, StarPath );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function StarShape( options ) {

    options = _.extend( {

      // Distance from the center to the tip of a star limb in scenery coordinates
      outerRadius: 35,

      // Distance from the center to the closest point on the exterior of the star.  Sets the "thickness" of the star limbs
      innerRadius: 20,

      // Number of star points, must be an integer
      numberStarPoints: 9
    }, options );

    Shape.call( this );

    // Create the points for a star.
    var points = [];
    var i;
    var iMax = 2 * options.numberStarPoints; // number of segments
    for ( i = 0; i < iMax; i++ ) {

      // Start at the top and proceed clockwise
      var angle = ( i / iMax ) * 2 * Math.PI - Math.PI / 2;
      var radius = ( i % 2 === 0 ) ? options.outerRadius : options.innerRadius;
      var x = radius * Math.cos( angle );
      var y = radius * Math.sin( angle );
      points.push( new Vector2( x, y ) );
    }

    this.moveToPoint( points[ 0 ] );
    for ( i = 1; i < points.length; i++ ) {
      this.lineToPoint( points[ i ] );
    }
    this.lineToPoint( points[ 0 ] );
  }

  blackbodySpectrum.register( 'StarShape', StarShape );

  inherit( Shape, StarShape );

  return StarPath;
} )
;