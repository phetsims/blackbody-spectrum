// Copyright 2002-2013, University of Colorado Boulder

/**
 * Vertical slider
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var FillHighlightListener = require( 'SCENERY_PHET/input/FillHighlightListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  //   var StringUtils = require('PHETCOMMON/util/StringUtils');
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  // constants
  var TITLE_FONT = new PhetFont( { size: 30, weight: 'bold' } );
  var SUBTITLE_FONT = new PhetFont( { size: 30, weight: 'bold' } );
  var TITLE_COLOR = Color.BLUE;
  var SUBTITLE_COLOR = "#00EBEB";
  var VALUE_DECIMAL_PLACES = 0;
  var THUMB_SIZE = new Dimension2( 68, 30 );
  var THUMB_NORMAL_COLOR = new Color( 89, 156, 212 );
  var THUMB_HIGHLIGHT_COLOR = THUMB_NORMAL_COLOR.brighterColor();
  var THUMB_STROKE_COLOR = Color.BLACK;
  var THUMB_CENTER_LINE_COLOR = Color.WHITE;

  /**
   * Track that the thumb moves in, origin at upper left. Clicking in the track changes the value.
   * @param {Dimension2} size
   * @param {Property<Number>} property
   * @param {Range} range
   * @constructor
   */
  function Track( size, property, range ) {

    var thisNode = this;
    Rectangle.call( thisNode, 0, 0, size.width, size.height, { fill: 'black', cursor: 'pointer' } );

    // click in the track to change the value, continue dragging if desired
    var handleEvent = function( event ) {
      var y = thisNode.globalToLocalPoint( event.pointer.point ).y;
      var value = Util.linear( 0, size.height, range.max, range.min, y );
      property.value = Util.clamp( value, range.min, range.max );
    };
    thisNode.addInputListener( new SimpleDragHandler(
      {
        allowTouchSnag: true,
        start: function( event ) {
          handleEvent( event );
        },
        drag: function( event ) {
          handleEvent( event );
        }
      } ) );
  }

  inherit( Rectangle, Track );

  /**
   * The slider thumb, a rounded rectangle with a horizontal line through its center. Origin is at the thumb's geometric center.
   * @param {Dimension2} size
   * @param {Property<Number>} property
   * @param {Range} valueRange
   * @param {Range} positionRange
   * @constructor
   */
  function Thumb( size, property, valueRange, positionRange ) {

    var thisNode = this;
    Node.call( this );

    // nodes
    var bodyNode = new Rectangle( -size.width / 2, -size.height / 2, size.width, size.height, 10, 10,
      { fill: THUMB_NORMAL_COLOR, stroke: THUMB_STROKE_COLOR, lineWidth: 1 } );
    var centerLineNode = new Path( Shape.lineSegment( -( size.width / 2 ) + 3, 0, ( size.width / 2 ) - 3, 0 ),
      { stroke: THUMB_CENTER_LINE_COLOR } );

    // rendering order
    thisNode.addChild( bodyNode );
    thisNode.addChild( centerLineNode );

    // touch area
    var touchXMargin = 0 * bodyNode.width; // thumb seems wide enough, so zero for now
    var touchYMargin = 1 * bodyNode.height; // expand height since thumb is not very tall and drag direction is vertical
    bodyNode.touchArea = Shape.rectangle( bodyNode.left - touchXMargin, bodyNode.top - touchYMargin,
      bodyNode.width + ( 2 * touchXMargin ), bodyNode.height + ( 2 * touchYMargin ) );

    // interactivity
    thisNode.cursor = 'pointer';
    thisNode.addInputListener( new ThumbDragHandler( thisNode, property, valueRange, positionRange ) );
    bodyNode.addInputListener( new FillHighlightListener( THUMB_NORMAL_COLOR, THUMB_HIGHLIGHT_COLOR ) );
  }

  inherit( Node, Thumb );

  /**
   * Drag handler for the slider thumb.
   * @param {Node} dragNode
   * @param {Property<Number>} property
   * @param {Range} valueRange
   * @param {Range} positionRange
   * @constructor
   */
  function ThumbDragHandler( dragNode, property, valueRange, positionRange ) {
    var clickYOffset; // y-offset between initial click and thumb's origin
    SimpleDragHandler.call( this, {

      start: function( event ) {
        clickYOffset = dragNode.globalToParentPoint( event.pointer.point ).y - event.currentTarget.y;
      },

      drag: function( event ) {
        var y = dragNode.globalToParentPoint( event.pointer.point ).y - clickYOffset;
        var value = Util.linear( positionRange.min, positionRange.max, valueRange.max, valueRange.min, y );
        property.value = Util.clamp( value, valueRange.min, valueRange.max );
      }
    } );
  }

  inherit( SimpleDragHandler, ThumbDragHandler );

  /**
   * @param {String} subtitle
   * @param {Dimension2} trackSize
   * @param {Property<Number>} property
   * @param {Range} range
   * @constructor
   */
  function VerticalSlider( subtitle, trackSize, property, range ) {

    Node.call( this );

    // nodes
    var titleNode = new Text( '?', { font: TITLE_FONT, direction: 'rtl', fill: TITLE_COLOR } );
    var subtitleNode = new Text( subtitle, { font: SUBTITLE_FONT, fill: SUBTITLE_COLOR } );
    var xMargin = 7, yMargin = 7, cornerRadius = 10;
    var backgroundNode = new Rectangle( -xMargin, -yMargin, trackSize.width + ( 2 * xMargin ), trackSize.height + ( 2 * yMargin ), cornerRadius, cornerRadius,
      { fill: new Color( 200, 200, 200, 140 ) } );
    var trackNode = new Track( trackSize, property, range );
    var thumbNode = new Thumb( THUMB_SIZE, property, range, new Range( 0, trackSize.height ) );
    var rectangleTitle = new Rectangle( 0, 0, 100, 40, cornerRadius, cornerRadius, {
      fill: '#FFF',
      stroke: '#000',
      lineWidth: 1
    } );


    // rendering order
    this.addChild( rectangleTitle );
    this.addChild( titleNode );
    this.addChild( subtitleNode );
    this.addChild( backgroundNode );
    this.addChild( trackNode );
    this.addChild( thumbNode );

    // layout

    thumbNode.centerX = trackNode.centerX;
    thumbNode.centerY = trackNode.centerY;
    titleNode.centerX = backgroundNode.centerX + 40;
    titleNode.bottom = backgroundNode.top - ( thumbNode.height / 2 ) - 5;
    rectangleTitle.centerX = backgroundNode.centerX;
    rectangleTitle.centerY = titleNode.centerY;
    subtitleNode.centerX = backgroundNode.centerX;
    subtitleNode.top = backgroundNode.bottom + ( thumbNode.height / 2 ) + 15;


    // move the slider thumb to reflect the model value
    property.link( function( value ) {
      // move the thumb
      var y = Util.linear( range.min, range.max, trackSize.height, 0, value );
      thumbNode.y = Util.clamp( y, 0, trackSize.height );
      // update the titleNode
      titleNode.text = value.toFixed( VALUE_DECIMAL_PLACES );
    } );
  }

  return inherit( Node, VerticalSlider );
} );