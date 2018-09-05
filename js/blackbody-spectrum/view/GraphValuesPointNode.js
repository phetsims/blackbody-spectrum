// Copyright 2014-2018, University of Colorado Boulder

/**
 * The class that handles showing a draggable point that follows a graph and shows its x and y values
 *
 * @author Saurabh Totey
 */
define( function( require ) {
  'use strict';

  // modules
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Util = require( 'DOT/Util' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );

  /**
   * Constructs the GraphValuesPointNode given the body to follow and the axes that will handle coordinate conversions
   * Alignment isn't handled in constructor, but is rather done in the update method due to the non-static nature of this view
   * @param {BlackbodyBodyModel} body
   * @param {ZoomableAxesView} axes
   * @param {Object} options
   * @constructor
   */
  function GraphValuesPointNode( body, axes, options ) {
    var self = this;

    Node.call( this, { cursor: 'pointer' } );

    options = _.extend( {
      circleOptions: {
        radius: 5,
        fill: 'green'
      },
      dashedLineOptions: {
        stroke: 'yellow',
        lineDash: [ 4, 4 ]
      },
      valueTextOptions: {
        fill: 'pink',
        font: new PhetFont( 22 )
      },
      cueingArrowColor: '#64dc64',
      labelOffset: 5
    }, options );

    // @private
    this.body = body;
    this.axes = axes;
    this.draggableCircle = new Circle( options.circleOptions );
    this.dashedLinesPath = new Path( null, options.dashedLineOptions );
    this.wavelengthValueText = new Text( '', options.valueTextOptions );
    this.spectralRadianceValueText = new Text( '', options.valueTextOptions );
    this.labelOffset = options.labelOffset;
    var arrowOptions = { fill: options.cueingArrowColor };
    this.cueingArrows = new Node( {
      children: [ new ArrowNode( 12, 0, 27, 0, arrowOptions ), new ArrowNode( -12, 0, -27, 0, arrowOptions ) ]
    } );

    // @public {Property.<number>}
    this.wavelengthProperty = new NumberProperty( this.body.peakWavelength );

    // Links the wavelength property to update this node whenever changed
    this.wavelengthProperty.link( function() {
      self.update();
    } );

    // Links a change in the body's temperature to always set the wavelength to the peak wavelength
    this.body.temperatureProperty.link( function() {
      // Clamp to make sure wavelength property is within graph bounds
      self.wavelengthProperty.value = Util.clamp( self.body.peakWavelength, 0, self.axes.viewXToWavelength( self.axes.horizontalAxisLength ) );
    } );

    // Sets up the drag handler for the draggable circle TODO: make draggable in y direction as well?
    var mouseStartX;
    var circleStartX;
    this.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        mouseStartX = event.pointer.point.x;
        circleStartX = self.draggableCircle.centerX;
      },
      drag: function( event ) {
        var horizontalChange = event.pointer.point.x - mouseStartX;
        // Clamp to make sure wavelength property is within graph bounds
        self.wavelengthProperty.value = Util.clamp( self.axes.viewXToWavelength( circleStartX + horizontalChange ), 0, self.axes.viewXToWavelength( self.axes.horizontalAxisLength ) );
        self.update();
      },
      end: function() {
        self.cueingArrows.visible = false;
      },
      allowTouchSnag: true
    } ) );
    this.dashedLinesPath.touchArea = this.dashedLinesPath.localBounds.dilatedXY( 5, 5 );

    // Adds children in rendering order
    this.addChild( this.dashedLinesPath );
    this.addChild( this.draggableCircle );
    this.addChild( this.wavelengthValueText );
    this.addChild( this.spectralRadianceValueText );
    this.addChild( this.cueingArrows );
  }

  blackbodySpectrum.register( 'GraphValuesPointNode', GraphValuesPointNode );

  return inherit( Node, GraphValuesPointNode, {

    /**
     * Puts this node back at the peak of the graph
     */
    reset: function() {
      this.wavelengthProperty.value = this.body.peakWavelength;
      this.cueingArrows.visible = true;
    },

    /**
     * Updates the location of the circle and the dashed lines of this graphValuesPointNode
     * @public
     */
    update: function() {
      // Update spectral radiance for changes in wavelength
      var spectralRadianceOfPoint = this.body.getSpectralRadianceAt( this.wavelengthProperty.value );

      // Updates location of draggable circle in view
      this.draggableCircle.centerX = this.axes.wavelengthToViewX( this.wavelengthProperty.value );
      this.draggableCircle.centerY = this.axes.spectralRadianceToViewY( spectralRadianceOfPoint );

      // Updates value labels' text
      this.wavelengthValueText.text = Util.toFixed( this.wavelengthProperty.value / 1000.0, 3 ); // nm to microns
      this.spectralRadianceValueText.text = Util.toFixed( spectralRadianceOfPoint * 1e33, 0 ); // multiplier is to match y axis

      // Updates value labels' positioning
      this.wavelengthValueText.centerX = this.draggableCircle.centerX;
      this.wavelengthValueText.top = this.labelOffset;
      this.spectralRadianceValueText.centerY = this.draggableCircle.centerY;
      this.spectralRadianceValueText.right = -this.labelOffset;

      // Clamps label positions so that they don't go off the graph
      if ( this.wavelengthValueText.right > this.axes.horizontalAxisLength - this.labelOffset ) {
        this.wavelengthValueText.right = this.axes.horizontalAxisLength - this.labelOffset;
      }
      else if ( this.wavelengthValueText.left < this.labelOffset ) {
        this.wavelengthValueText.left = this.labelOffset;
      }
      if ( this.spectralRadianceValueText.top < -this.axes.verticalAxisLength + this.labelOffset ) {
        this.spectralRadianceValueText.top = -this.axes.verticalAxisLength + this.labelOffset;
      }
      else if ( this.spectralRadianceValueText.bottom > this.labelOffset ) {
        this.spectralRadianceValueText.bottom = this.labelOffset;
      }

      // Moves the cueing arrows to surround the draggable circle
      this.cueingArrows.centerX = this.draggableCircle.centerX;
      this.cueingArrows.centerY = this.draggableCircle.centerY;

      // Updates dashed lines to follow draggable circle
      this.dashedLinesPath.shape = new Shape()
        .moveTo( this.draggableCircle.centerX, 0 )
        .lineTo( this.draggableCircle.centerX, this.draggableCircle.centerY )
        .lineTo( 0, this.draggableCircle.centerY );
    }

  } );

} );