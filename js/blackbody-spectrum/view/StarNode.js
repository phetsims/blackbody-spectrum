//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Star Node
 *
 * @author Martin Veillette ( Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  function StarShape( options ) {

    options = _.extend( {
      //Distance from the center to the tip of a star limb
      outerRadius: 15,
      //Distance from the center to the closest point on the exterior of the star.  Sets the "thickness" of the star limbs
      innerRadius: 7.5
    }, options );

    Shape.call( this );

    //Create the points for a filled-in star, which will be used to compute the geometry of a partial star.
    var points = [];
    var i = 0;
    var imax = 18; // number of segments
    for ( i = 0; i < imax; i++ ) {
      //Start at the top and proceed clockwise
      var angle = (i / imax) * 2 * Math.PI - Math.PI / 2;
      var radius = (i % 2 === 0) ? options.outerRadius : options.innerRadius;
      var x = radius * Math.cos( angle );
      var y = radius * Math.sin( angle );
      points.push( new Vector2( x, y ) );
    }

    this.moveToPoint( points[0] );
    for ( i = 1; i < points.length; i++ ) {
      this.lineToPoint( points[i] );
    }
    this.close(); // is it necessary


  }

  inherit( Shape, StarShape );

  /**
   * @param {property} starColorProperty
   * @param options see comments in the constructor for options parameter values
   * @constructor
   */
  function StarNode( starColorProperty, options ) {

    options = _.extend( {
      filledLineWidth: 1.5,
      filledLineJoin: 'round'
    }, options );

    Node.call( this );

    var starShape = new StarShape( options );
    var starPath = new Path( starShape, {
      lineWidth: options.filledLineWidth,
      lineJoin: options.filledLineJoin
    } );
    this.addChild( starPath );

    // observers
    starColorProperty.link( function( color ) {
      starPath.fill = color;
      starPath.stroke = color;
    } );

    this.mutate( options );
  }


  return inherit( Node, StarNode );
} )
;