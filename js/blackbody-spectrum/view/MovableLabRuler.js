// Copyright 2002-2013, University of Colorado Boulder

/**
 * Ruler Node with a drag handler that is constrained to some (optional) bounds.
 *
 * @author Martin Veillette (Berea College)
 */

define( function( require ) {
  "use strict";

  // Imports
  var Bounds2 = require( 'DOT/Bounds2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RulerNode = require( 'SCENERY_PHET/RulerNode' );
  var Util = require( 'DOT/Util' );

  /**
   * Returns an array of strings starting with startingNumber to endingNumber in steps of 'increment'
   *
   * @param {number} startingNumber - e.g. 0
   * @param {number} endingNumber - e.g. 25
   * @param {number} increment - e.g. 5
   * @returns {Array.<Strings>} - e.g. ['0', '5', '10', '15', '20', '25']
   */
  function majorTickLabelsGenerator( startingNumber, endingNumber, increment ) {
    var majorTickLabels = [];
    var numberOfTicks = Math.floor( endingNumber / increment ) - Math.ceil( startingNumber / increment );
    var currentTick;
    for ( currentTick = 0; currentTick <= numberOfTicks; currentTick++ ) {
      var currentMajorTickLabel = Util.toFixed( currentTick * increment + startingNumber, 0 );
      majorTickLabels.push( currentMajorTickLabel );
    }
    return majorTickLabels;
  }

  /**
   * Creates a vertical lab ruler with listener
   * @param {Property.<Vector2>} positionProperty - position of the center of the ruler in the view
   * @param {Property.<Object>} unitsProperty - it has two fields, (1) name <string> and (2) multiplier <number>, eg. {name: 'cm', multiplier: 100},
   * @param {Property.<Vector2>} isVisibleProperty
   * @param {Object} [options]
   * @constructor
   */
  function MovableLabRuler( positionProperty, unitsProperty, isVisibleProperty, options ) {
    Node.call( this, {cursor: 'pointer', renderer: 'svg', cssTransform: true} );

    options = _.extend( {
      rulerLength: 1.00, // in model coordinates
      rulerHeightInModel: 0.1, // in model coordinates
      majorTickSeparation: 0.1, // in model coordinates
      modelViewTransform: ModelViewTransform2.createIdentity(),
      dragBounds: Bounds2.EVERYTHING,  // bounds for the measuring tape (in the parent Node Coordinates reference frame), default value is no (effective) bounds
      angle: 0, // rotation angle in radians of the ruler Node. (a positive angle corresponds to a clockwise rotation),
      majorTickLabels: null // array of major tick Labels, eg. ['0', '5', '10', '15', '20', '25'], automatically generated if set to null
    }, options );

    var rulerWidth = options.modelViewTransform.modelToViewDeltaX( options.rulerLength );
    var rulerHeight = options.modelViewTransform.modelToViewDeltaX( options.rulerHeightInModel );
    var majorTickWidth = options.modelViewTransform.modelToViewDeltaX( options.majorTickSeparation );
    var units = unitsProperty.value.name;

    var majorTickLabels;
    if ( options.majorTickLabels ) {
      majorTickLabels = options.majorTickLabels;
    }
    else {
      majorTickLabels = majorTickLabelsGenerator( 0, options.rulerLength * unitsProperty.value.multiplier, options.majorTickSeparation * unitsProperty.value.multiplier );
    }


    /**
     * @param {number} rulerWidth - distance between left-most and right-most tick in view coordinates, insets will be added to this
     * @param {number} rulerHeight - height of ruler in view coordinates
     * @param {number} majorTickWidth - distance (in view coordinates) between the major ticks
     * @param {string[]} majorTickLabels - array of major tick Labels, eg. ['0', '5', '10', '15', '20', '25']
     * @param {string} units - text label that will show the model units
     * @param {Object} [options]
     */
    var ruler = new RulerNode( rulerWidth, rulerHeight, majorTickWidth, majorTickLabels, units, options );
    ruler.rotation = options.angle;
    this.addChild( ruler );

    // @private
    this.positionPropertyObserver = function( position ) {
      ruler.center = position;
    };
    this.positionProperty = positionProperty;
    this.positionProperty.link( this.positionPropertyObserver ); // must be unlinked in dispose

    // @private
    this.isVisiblePropertyObserver = function( isVisible ) {
      ruler.visible = isVisible;
    };
    this.isVisibleProperty = isVisibleProperty;
    this.isVisibleProperty.link( this.isVisiblePropertyObserver ); // must be unlinked in dispose


    // add listener for drag events
    // the position and the dragBounds are both in the view so we should pass the
    // identity transformation for the modelViewTransform
    ruler.addInputListener( new MovableDragHandler( {
      locationProperty: positionProperty,
      dragBounds: options.dragBounds
    }, ModelViewTransform2.createIdentity() ) );


    this.mutate( options );
  }

  return inherit( Node, MovableLabRuler, {
    // Ensures that this node is eligible for GC.
    dispose: function() {
      this.isVisibleProperty.unlink( this.isVisiblePropertyObserver );
      this.positionProperty.unlink( this.positionPropertyObserver );
    }
  } );
} )
;
