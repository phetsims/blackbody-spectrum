// Copyright 2014-2015, University of Colorado Boulder

/**
 * Ruler Node with a drag handler that is constrained to some (optional) bounds.
 *
 * @author Martin Veillette (Berea College)
 */

define( function( require ) {
  'use strict';

  // modules
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RulerNode = require( 'SCENERY_PHET/RulerNode' );
  var Util = require( 'DOT/Util' );

  /**
   * Returns an array of strings starting with 'startingNumber' to 'endingNumber' in steps of 'increment'
   *
   * @param {number} startingNumber - e.g. 0
   * @param {number} endingNumber - e.g. 27
   * @param {number} increment - e.g. 5
   * @param {number} decimalPlaces -  the precision of the string eg. 1.
   * @returns {Array.<strings>} - e.g. ['0.0', '5.0', '10.0', '15.0', '20.0', '25.0']
   */
  function majorTickLabelsGenerator( startingNumber, endingNumber, increment, decimalPlaces ) {
    var majorTickLabels = [];
    var numberOfTicks = Math.floor( endingNumber / increment ) - Math.ceil( startingNumber / increment );
    var currentTick;
    for ( currentTick = 0; currentTick <= numberOfTicks; currentTick++ ) {
      var currentMajorTickLabel = Util.toFixed( currentTick * increment + startingNumber, decimalPlaces );
      majorTickLabels.push( currentMajorTickLabel );
    }
    return majorTickLabels;
  }

  /**
   * Creates a lab ruler with listener
   * @param {Property.<Vector2>} positionProperty - position of the center of the ruler in the view
   * @param {Property.<boolean>} isVisibleProperty
   * @param {Object} [options]
   * @constructor
   */
  function MovableLabRuler( positionProperty, isVisibleProperty, options ) {
    Node.call( this, { cursor: 'pointer' } );

    options = _.extend( {
      rulerLength: 1.00, // in model coordinates
      rulerHeightInModel: 0.1, // in model coordinates,
      majorTickSeparation: 0.1, // in model coordinates
      modelViewTransform: ModelViewTransform2.createIdentity(),
      dragBounds: Bounds2.EVERYTHING,  // bounds for the measuring tape (in the parent Node Coordinates reference frame), default value is no (effective) bounds
      angle: 0, // rotation angle in radians of the ruler Node. (a positive angle corresponds to a clockwise rotation),
      units: 'm', // string of the base units
      majorTickLabels: null // array of major tick Labels, eg. ['0', '5', '10', '15', '20', '25'], automatically generated if set to null
    }, options );

    // create majorTicksLabel automatically if they dont exist
    var majorTickLabels;
    if ( options.majorTickLabels ) {
      majorTickLabels = options.majorTickLabels;
    }
    else {

      options = _.extend( {
        decimalPlaces: 0, // the number of decimal places, i.e. precision in the strings of majorTickLabels (if they are generated automatically)
        multiplier: 1  // multiplier of base units. e.g.  100, if the model uses meter but the ruler is expressed centimeter
      }, options );

      majorTickLabels = majorTickLabelsGenerator(
        0,
        options.rulerLength * options.multiplier,
        options.majorTickSeparation * options.multiplier,
        options.decimalPlaces
      );
    }

    // create and add ruler (assumes the ruler is in the horizontal position and rotate it afterwards if necessary)
    var rulerWidth = options.modelViewTransform.modelToViewDeltaX( options.rulerLength ); // length of the ruler
    var rulerHeight = options.modelViewTransform.modelToViewDeltaX( options.rulerHeightInModel ); // height
    var majorTickWidth = options.modelViewTransform.modelToViewDeltaX( options.majorTickSeparation ); // i.e. separation between the ticks
    var units = options.units; // a string

    var ruler = new RulerNode( rulerWidth, rulerHeight, majorTickWidth, majorTickLabels, units, options );
    ruler.rotation = options.angle;
    this.addChild( ruler );


    var positionPropertyObserver = function( position ) {
      ruler.center = position;
    };
    positionProperty.link( positionPropertyObserver ); // must be unlinked in dispose


    var isVisiblePropertyObserver = function( isVisible ) {
      ruler.visible = isVisible;
    };
    isVisibleProperty.link( isVisiblePropertyObserver ); // must be unlinked in dispose

    // add listener for drag events
    // the position and the dragBounds are both in the view so we should pass the
    // identity transformation for the modelViewTransform
    ruler.addInputListener( new MovableDragHandler( positionProperty, {
      dragBounds: options.dragBounds
    } ) );

    this.mutate( options );

    this.disposeMovableLabRuler = function() {
      positionProperty.unlink( positionPropertyObserver );
      isVisibleProperty.unlink( isVisiblePropertyObserver );
    };
  }

  blackbodySpectrum.register( 'MovableLabRuler', MovableLabRuler );

  return inherit( Node, MovableLabRuler, {
    // Ensures that this node is eligible for GC.
    dispose: function() {
      this.disposeMovableLabRuler();
    }
  } );
} );
