// Copyright 2014-2018, University of Colorado Boulder

/**
 * The class that handles showing a draggable point that follows a graph and shows its x and y values
 *
 * @author Saurabh Totey
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var BlackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackbodyColorProfile' );
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  /**
   * Constructs the GraphValuesPointNode given the body to follow and the axes that will handle coordinate conversions.
   * Alignment isn't handled in constructor, but is rather done in the update method due to the non-static nature of
   * this view.
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
        fill: BlackbodyColorProfile.graphValuesPointProperty
      },
      dashedLineOptions: {
        stroke: BlackbodyColorProfile.graphValuesDashedLineProperty,
        lineDash: [ 4, 4 ]
      },
      valueTextOptions: {
        fill: BlackbodyColorProfile.graphValuesLabelsProperty,
        font: new PhetFont( 22 )
      },
      arrowOptions: {
        fill: '#64dc64',
        headHeight: 15,
        headWidth: 15,
        tailWidth: 7
      },
      labelOffset: 5
    }, options );

    // @private
    this.body = body;
    this.axes = axes;
    this.draggableCircle = new Node( { size: new Dimension2( 80, 20 ) } );
    this.dashedLinesPath = new Path( null, options.dashedLineOptions );
    this.wavelengthValueText = new Text( '', options.valueTextOptions );
    this.spectralRadianceValueText = new Text( '', options.valueTextOptions );
    this.labelOffset = options.labelOffset;
    this.cueingArrows = new Node( {
      children: [ new ArrowNode( 15, 0, 40, 0, options.arrowOptions ), new ArrowNode( -15, 0, -40, 0, options.arrowOptions ) ],
      cursor: 'pointer'
    } );

    // Links cueing arrows and circle to a single draggable node
    var circle = new Circle( options.circleOptions );
    this.draggableCircle.addChild( circle );
    this.draggableCircle.addChild( this.cueingArrows );

    // @public {Property.<number>}
    this.wavelengthProperty = new NumberProperty( this.body.peakWavelength );

    // Links a change in the body's temperature to always set the wavelength to the peak wavelength
    this.body.temperatureProperty.link( function() {

      // Clamp to make sure wavelength property is within graph bounds
      self.wavelengthProperty.value = self.body.peakWavelength;
      self.update();
    } );

    // Sets up the drag handler for the draggable circle
    var mouseStartX;
    var circleStartX;
    this.draggableCircle.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        mouseStartX = event.pointer.point.x;
        circleStartX = self.draggableCircle.centerX;
      },
      drag: function( event ) {
        var horizontalChange = event.pointer.point.x - mouseStartX;


        self.wavelengthProperty.value = self.axes.viewXToWavelength( circleStartX + horizontalChange );
        self.update();
      },
      end: function() {
        self.cueingArrows.visible = false;
      },
      allowTouchSnag: true
    } ) );

    this.draggableCircle.touchArea = this.draggableCircle.localBounds.dilated( 8 );

    // Adds children in rendering order
    this.addChild( this.dashedLinesPath );
    this.addChild( this.draggableCircle );
    this.addChild( this.wavelengthValueText );
    this.addChild( this.spectralRadianceValueText );
  }

  blackbodySpectrum.register( 'GraphValuesPointNode', GraphValuesPointNode );

  return inherit( Node, GraphValuesPointNode, {

    /**
     * Puts this node back at the peak of the graph
     */
    reset: function() {
      this.wavelengthProperty.value = this.body.peakWavelength;
      this.cueingArrows.visible = true;
      this.update();
    },

    /**
     * Updates the location of the circle and the dashed lines of this graphValuesPointNode
     * @public
     */
    update: function() {

      // Clamp to make sure wavelength property is within graph bounds
      this.wavelengthProperty.value = Util.clamp(
        this.wavelengthProperty.value,
        0,
        this.axes.viewXToWavelength( this.axes.horizontalAxisLength )
      );

      // Update spectral radiance for changes in wavelength
      var spectralRadianceOfPoint = this.body.getSpectralRadianceAt( this.wavelengthProperty.value );

      // Updates location of draggable circle in view
      this.draggableCircle.centerX = this.axes.wavelengthToViewX( this.wavelengthProperty.value );
      this.draggableCircle.centerY = this.axes.spectralRadianceToViewY( spectralRadianceOfPoint );
      this.draggableCircle.visible = this.draggableCircle.centerX < this.axes.horizontalAxisLength;
      this.draggableCircle.visible = this.draggableCircle.centerY > -this.axes.verticalAxisLength;

      // Updates value labels' text
      this.wavelengthValueText.text = Util.toFixed( this.wavelengthProperty.value / 1000.0, 3 ); // nm to microns
      this.spectralRadianceValueText.text = Util.toFixed( spectralRadianceOfPoint * 1e33, 3 ); // multiplier is to match y axis

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

      // Updates dashed lines to follow draggable circle
      this.dashedLinesPath.shape = new Shape()
        .moveTo( this.draggableCircle.centerX, 0 )
        .lineTo( this.draggableCircle.centerX,
          this.draggableCircle.centerY < -this.axes.verticalAxisLength ?
          -this.axes.verticalAxisLength : this.draggableCircle.centerY );
      if ( spectralRadianceOfPoint * 1e33 < this.axes.verticalZoomProperty.value ) {
        this.dashedLinesPath.shape.lineTo( 0, this.draggableCircle.centerY );
        this.spectralRadianceValueText.visible = true;
      }
      else {
        this.spectralRadianceValueText.visible = false;
      }
    }

  } );

} );