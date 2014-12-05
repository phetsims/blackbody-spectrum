// Copyright 2002-2013, University of Colorado Boulder

/**
 * Ruler Node.
 *
 * @author Martin Veillette (Berea College)
 */

define( function( require ) {
  "use strict";

  // Imports
  var Node = require( 'SCENERY/nodes/Node' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RulerNode = require( 'SCENERY_PHET/RulerNode' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  // Resources
  var units_centimetersString = require( 'string!BLACKBODY_SPECTRUM/units.cm' );


  /**
   * Creates a vertical lab ruler with listener
   * @param {Property.<Vector2>} positionProperty
   * @param {Property.<Vector2>} isVisibleProperty
   * @constructor
   */
  function VerticalLabRuler( positionProperty, isVisibleProperty ) {
    var self = this;
    Node.call( this, {cursor: 'pointer', renderer: 'svg', cssTransform: true} );

    var ruler = new RulerNode( 250, 50, 50, ['0', '5', '10', '15', '20', '25'], units_centimetersString, {
      minorTicksPerMajorTick: 4,
      unitsFont: new PhetFont( 16 ),
      rotation: -1 * Math.PI / 2
    } );
    this.addChild( ruler );

    positionProperty.link( function( position ) {
      ruler.x = position.x;
      ruler.y = position.y;
    } );

    isVisibleProperty.link( function( isVisible ) {
      self.visible = isVisible;
    } );

    var rulerClickOffset = {x: 0, y: 0};
    ruler.addInputListener( new SimpleDragHandler(
      {
        start: function( event ) {
          rulerClickOffset.x = ruler.globalToParentPoint( event.pointer.point ).x - event.currentTarget.x;
          rulerClickOffset.y = ruler.globalToParentPoint( event.pointer.point ).y - event.currentTarget.y;
        },
        drag: function( event ) {
          var x = ruler.globalToParentPoint( event.pointer.point ).x - rulerClickOffset.x;
          var y = ruler.globalToParentPoint( event.pointer.point ).y - rulerClickOffset.y;
          positionProperty.value = {x: x, y: y};
        }
      } ) );
  }

  return inherit( Node, VerticalLabRuler );
} );
