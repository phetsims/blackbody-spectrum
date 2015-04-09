// Copyright 2002-2014, University of Colorado Boulder

/**
 * Scenery Node of a Star
 *
 * @author Martin Veillette ( Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  function StarShape( options ) {

    options = _.extend( {
      //Distance from the center to the tip of a star limb in scenery coordinates
      outerRadius: 35,
      //Distance from the center to the closest point on the exterior of the star.  Sets the "thickness" of the star limbs
      innerRadius: 20,
      //Number of star points, must be an integer
      numberStarPoints: 9
    }, options );

    Shape.call( this );

    //Create the points for a star.
    var points = [];
    var i;
    var imax = 2 * options.numberStarPoints; // number of segments
    for ( i = 0; i < imax; i++ ) {
      //Start at the top and proceed clockwise
      var angle = (i / imax) * 2 * Math.PI - Math.PI / 2;
      var radius = (i % 2 === 0) ? options.outerRadius : options.innerRadius;
      var x = radius * Math.cos( angle );
      var y = radius * Math.sin( angle );
      points.push( new Vector2( x, y ) );
    }

    this.moveToPoint( points[ 0 ] );
    for ( i = 1; i < points.length; i++ ) {
      this.lineToPoint( points[ i ] );
    }
    this.close(); // is it necessary ?

  }

  inherit( Shape, StarShape );

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

    this.mutate( options );
  }

  return inherit( Path, StarPath );
} )
;