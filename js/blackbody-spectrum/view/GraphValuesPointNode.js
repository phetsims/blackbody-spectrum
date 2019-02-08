// Copyright 2018, University of Colorado Boulder

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
  var RichText = require( 'SCENERY/nodes/RichText' );
  var ScientificNotationNode = require( 'SCENERY_PHET/ScientificNotationNode' );
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

    Node.call( this, { cursor: 'ew-resize' } );

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
        font: new PhetFont( 18 )
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
    this.graphPointCircle = new Node( { size: new Dimension2( 80, 20 ) } );
    this.dashedVerticalLinePath = new Path( null, options.dashedLineOptions );
    this.dashedHorizontalLinePath = new Path( null, options.dashedLineOptions );
    this.wavelengthValueText = new Text( '', options.valueTextOptions );
    this.spectralRadianceValueText = new RichText( '', options.valueTextOptions );
    this.labelOffset = options.labelOffset;
    this.cueingArrows = new Node( {
      children: [ new ArrowNode( 15, 0, 40, 0, options.arrowOptions ), new ArrowNode( -15, 0, -40, 0, options.arrowOptions ) ]
    } );

    // Links cueing arrows and circle to a single draggable node
    var circle = new Circle( options.circleOptions );
    circle.mouseArea = circle.localBounds.dilated( 4 );
    this.graphPointCircle.addChild( circle );
    this.graphPointCircle.addChild( this.cueingArrows );

    // @public {Property.<number>}
    this.wavelengthProperty = new NumberProperty( this.body.peakWavelength );

    // Links a change in the body's temperature to always set the wavelength to the peak wavelength
    this.body.temperatureProperty.link( function() {

      // Clamp to make sure wavelength property is within graph bounds
      self.wavelengthProperty.value = self.body.peakWavelength;
      self.update();
    } );

    // Sets up the drag handler for the point circle and vertical dashed line
    var mouseStartX;
    var circleStartX;
    var graphValueDragHandler = new SimpleDragHandler( {
      start: function( event ) {
        mouseStartX = event.pointer.point.x;
        circleStartX = self.graphPointCircle.centerX;
      },
      drag: function( event ) {
        var horizontalChange = event.pointer.point.x - mouseStartX;

        self.wavelengthProperty.value = self.axes.viewXToWavelength( circleStartX + ( 0.818 * horizontalChange ) );

        // Clamp to make sure wavelength property is within graph bounds
        self.wavelengthProperty.value = Util.clamp(
          self.wavelengthProperty.value,
          0,
          self.axes.viewXToWavelength( self.axes.horizontalAxisLength )
        );
        self.update();
      },
      end: function() {
        self.cueingArrows.visible = false;
      },
      allowTouchSnag: true,
      dragCursor: 'ew-resize'
    } );

    this.graphPointCircle.addInputListener( graphValueDragHandler );
    this.dashedVerticalLinePath.addInputListener( graphValueDragHandler );

    // Adds children in rendering order
    this.addChild( this.dashedVerticalLinePath );
    this.addChild( this.dashedHorizontalLinePath );
    this.addChild( this.graphPointCircle );
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

      // Update spectral radiance for changes in wavelength
      var spectralRadianceOfPoint = this.body.getSpectralRadianceAt( this.wavelengthProperty.value );

      // Updates location of graph point circle in view
      this.graphPointCircle.centerX = this.axes.wavelengthToViewX( this.wavelengthProperty.value );
      this.graphPointCircle.centerY = this.axes.spectralRadianceToViewY( spectralRadianceOfPoint );
      this.graphPointCircle.visible = this.graphPointCircle.centerX <= this.axes.horizontalAxisLength &&
                                      this.graphPointCircle.centerY >= -this.axes.verticalAxisLength;

      // Updates value labels' text
      this.wavelengthValueText.text = Util.toFixed( this.wavelengthProperty.value / 1000.0, 3 ); // nm to microns

      // Spectral Radiance is given special case for scientific notation
      var spectralRadianceValue = spectralRadianceOfPoint * 1e33; // multiplier is to match y axis
      if ( spectralRadianceValue < 0.01 && spectralRadianceValue !== 0 ) {
        var notationObject = ScientificNotationNode.toScientificNotation( spectralRadianceValue, {
          mantissaDecimalPlaces: 0
        } );
        var formattedString = notationObject.mantissa;
        if ( notationObject.exponent !== '0' ) {
          formattedString += ' X 10<sup>' + notationObject.exponent + '</sup>';
        }
        this.spectralRadianceValueText.text = formattedString;
      }
      else {
        this.spectralRadianceValueText.text = Util.toFixed( spectralRadianceValue, 2 );
      }

      // Updates value labels' positioning
      this.wavelengthValueText.centerX = this.graphPointCircle.centerX;
      this.wavelengthValueText.top = this.labelOffset;
      this.spectralRadianceValueText.centerY = this.graphPointCircle.centerY;
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

      // Updates dashed lines to follow graph point circle
      this.dashedVerticalLinePath.shape = new Shape();
      this.dashedHorizontalLinePath.shape = new Shape();

      this.dashedVerticalLinePath.shape.moveTo( this.graphPointCircle.centerX, 0 );
      this.dashedHorizontalLinePath.shape.moveTo( 0, this.graphPointCircle.centerY );

      if ( this.graphPointCircle.centerX > this.axes.horizontalAxisLength ) {
        this.dashedHorizontalLinePath.shape.lineTo( this.axes.horizontalAxisLength, this.graphPointCircle.centerY );
        this.dashedVerticalLinePath.visible = false;
      }
      else {
        this.dashedHorizontalLinePath.shape.lineTo( this.graphPointCircle.centerX, this.graphPointCircle.centerY );
        this.dashedVerticalLinePath.visible = true;
      }

      if ( this.graphPointCircle.centerY > -this.axes.verticalAxisLength ) {
        this.dashedVerticalLinePath.shape.lineTo( this.graphPointCircle.centerX, this.graphPointCircle.centerY );
        this.dashedHorizontalLinePath.visible = true;
      }
      else {
        this.dashedVerticalLinePath.shape.lineTo( this.graphPointCircle.centerX, -this.axes.verticalAxisLength );
        this.dashedHorizontalLinePath.visible = false;
      }

      this.spectralRadianceValueText.visible = spectralRadianceOfPoint * 1e33 < this.axes.verticalZoomProperty.value;

      this.dashedVerticalLinePath.touchArea = this.dashedVerticalLinePath.localBounds.dilated( 4 );
      this.dashedVerticalLinePath.mouseArea = this.dashedVerticalLinePath.localBounds.dilated( 4 );
      this.graphPointCircle.touchArea = this.graphPointCircle.localBounds.dilated( 4 );
    }

  } );

} );