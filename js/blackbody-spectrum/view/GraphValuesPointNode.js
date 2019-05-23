// Copyright 2018-2019, University of Colorado Boulder

/**
 * The class that handles showing a draggable point that follows a graph and shows its x and y values
 *
 * @author Saurabh Totey
 */
define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const blackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/blackbodyColorProfile' );
  const BlackbodyConstants = require( 'BLACKBODY_SPECTRUM/BlackbodyConstants' );
  const blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Panel = require( 'SUN/Panel' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Range = require( 'DOT/Range' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const ScientificNotationNode = require( 'SCENERY_PHET/ScientificNotationNode' );
  const Shape = require( 'KITE/Shape' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );

  class GraphValuesPointNode extends Node {

    /**
     * Constructs the GraphValuesPointNode given the body to follow and the axes that will handle coordinate conversions.
     * Alignment isn't handled in constructor, but is rather done in the update method due to the non-static nature of
     * this view.
     * @param {BlackbodyBodyModel} body
     * @param {ZoomableAxesView} axes
     * @param {Object} options
     */
    constructor( body, axes, options ) {

      options = _.extend( {
        circleOptions: {
          radius: 5,
          fill: blackbodyColorProfile.graphValuesPointProperty
        },
        dashedLineOptions: {
          stroke: blackbodyColorProfile.graphValuesDashedLineProperty,
          lineDash: [ 4, 4 ]
        },
        valueTextOptions: {
          fill: blackbodyColorProfile.graphValuesLabelsProperty,
          font: new PhetFont( 18 ),
          maxWidth: 50
        },
        arrowSpacing: 30,
        arrowLength: 20,
        arrowOptions: {
          fill: '#64dc64',
          headHeight: 13,
          headWidth: 12,
          tailWidth: 6
        },
        labelOffset: 5,
        cursor: 'ew-resize',
        tandem: Tandem.required
      }, options );

      super( options );

      // @private
      this.body = body;
      this.axes = axes;
      this.graphPointCircle = new Node( { size: new Dimension2( 80, 20 ) } );
      this.dashedVerticalLinePath = new Path( null, options.dashedLineOptions );
      this.dashedHorizontalLinePath = new Path( null, options.dashedLineOptions );
      this.wavelengthValueText = new Text( '', options.valueTextOptions );
      this.spectralRadianceValueText = new RichText( '', options.valueTextOptions );
      this.spectralRadianceNode = new Panel( this.spectralRadianceValueText, {
        fill: blackbodyColorProfile.backgroundProperty,
        stroke: blackbodyColorProfile.backgroundProperty,
        xMargin: 1,
        yMargin: 0
      } );
      this.labelOffset = options.labelOffset;

      const halfArrowSpacing = options.arrowSpacing / 2;
      const arrowTip = halfArrowSpacing + options.arrowLength;
      this.cueingArrows = new Node( {
        children: [
          new ArrowNode( halfArrowSpacing, 0, arrowTip, 0, options.arrowOptions ),
          new ArrowNode( -halfArrowSpacing, 0, -arrowTip, 0, options.arrowOptions )
        ],
        tandem: options.tandem.createTandem( 'cueingArrows' )
      } );

      // Links cueing arrows and circle to a single draggable node
      const circle = new Circle( options.circleOptions );
      circle.mouseArea = circle.localBounds.dilated( 4 );
      this.graphPointCircle.addChild( circle );
      this.graphPointCircle.addChild( this.cueingArrows );

      // @public {Property.<number>}
      this.wavelengthProperty = new NumberProperty( this.body.peakWavelength, {
        range: new Range( 0, BlackbodyConstants.maxHorizontalZoom )
      } );

      // Links a change in the body's temperature to always set the wavelength to the peak wavelength
      this.body.temperatureProperty.link( () => {

        // Clamp to make sure wavelength Property is within graph bounds
        this.wavelengthProperty.value = this.body.peakWavelength;
        this.update();
      } );

      // Sets up the drag handler for the point circle and vertical dashed line
      let clickXOffset;
      const graphValueDragHandler = new SimpleDragHandler( {
        start: event => {
          clickXOffset = this.graphPointCircle.globalToParentPoint( event.pointer.point ).x - this.graphPointCircle.x;
        },
        drag: event => {
          const x = this.graphPointCircle.globalToParentPoint( event.pointer.point ).x - clickXOffset;

          // Clamp to make sure wavelength Property is within graph bounds
          this.wavelengthProperty.value = Util.clamp(
            this.axes.viewXToWavelength( x ),
            0,
            this.axes.viewXToWavelength( this.axes.horizontalAxisLength )
          );
          this.update();
        },
        end: () => {
          this.cueingArrows.visible = false;
        },
        allowTouchSnag: true,
        dragCursor: 'ew-resize',
        tandem: options.tandem.createTandem( 'dragListener' )
      } );

      this.graphPointCircle.addInputListener( graphValueDragHandler );
      this.dashedVerticalLinePath.addInputListener( graphValueDragHandler );

      // Adds children in rendering order
      this.addChild( this.dashedVerticalLinePath );
      this.addChild( this.dashedHorizontalLinePath );
      this.addChild( this.graphPointCircle );
      this.addChild( this.wavelengthValueText );
      this.addChild( this.spectralRadianceNode );
    }

    /**
     * Puts this node back at the peak of the graph
     * @public
     */
    reset() {
      this.wavelengthProperty.value = this.body.peakWavelength;
      this.cueingArrows.visible = true;
      this.update();
    }

    /**
     * Updates the location of the circle and the dashed lines of this graphValuesPointNode
     * @public
     */
    update() {

      // Update spectral radiance for changes in wavelength
      const spectralRadianceOfPoint = this.body.getSpectralRadianceAt( this.wavelengthProperty.value );

      // Updates location of graph point circle in view
      this.graphPointCircle.centerX = this.axes.wavelengthToViewX( this.wavelengthProperty.value );
      this.graphPointCircle.centerY = this.axes.spectralRadianceToViewY( spectralRadianceOfPoint );
      this.graphPointCircle.visible = this.graphPointCircle.centerX <= this.axes.horizontalAxisLength &&
                                      this.graphPointCircle.centerY >= -this.axes.verticalAxisLength;

      // Updates value labels' text
      this.wavelengthValueText.text = Util.toFixed( this.wavelengthProperty.value / 1000.0, 3 ); // nm to microns

      // Spectral Radiance is given special case for scientific notation
      const spectralRadianceValue = spectralRadianceOfPoint * 1e33; // multiplier is to match y axis
      if ( spectralRadianceValue < 0.01 && spectralRadianceValue !== 0 ) {
        const notationObject = ScientificNotationNode.toScientificNotation( spectralRadianceValue, {
          mantissaDecimalPlaces: 0
        } );
        let formattedString = notationObject.mantissa;
        if ( notationObject.exponent !== '0' ) {

          // Using unicode Thin Space and Hair Space to reduce distance between numbers and "X" in notation
          formattedString += `\u2009\u00D7\u200A10<sup>${notationObject.exponent}</sup>`;
        }
        this.spectralRadianceValueText.text = formattedString;
      }
      else {
        this.spectralRadianceValueText.text = Util.toFixed( spectralRadianceValue, 2 );
      }

      // Updates value labels' positioning
      this.wavelengthValueText.centerX = this.graphPointCircle.centerX;
      this.wavelengthValueText.top = this.labelOffset;
      this.spectralRadianceNode.centerY = this.graphPointCircle.centerY;
      this.spectralRadianceNode.right = -this.labelOffset;

      // Clamps label positions so that they don't go off the graph
      if ( this.wavelengthValueText.right > this.axes.horizontalAxisLength - this.labelOffset ) {
        this.wavelengthValueText.right = this.axes.horizontalAxisLength - this.labelOffset;
      }
      else if ( this.wavelengthValueText.left < this.labelOffset ) {
        this.wavelengthValueText.left = this.labelOffset;
      }
      if ( this.spectralRadianceNode.top < -this.axes.verticalAxisLength + this.labelOffset ) {
        this.spectralRadianceNode.top = -this.axes.verticalAxisLength + this.labelOffset;
      }
      else if ( this.spectralRadianceNode.bottom > this.labelOffset ) {
        this.spectralRadianceNode.bottom = this.labelOffset;
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

      this.dashedVerticalLinePath.visible = this.graphPointCircle.centerX <= this.axes.horizontalAxisLength;

      this.dashedVerticalLinePath.touchArea = this.dashedVerticalLinePath.localBounds.dilated( 4 );
      this.dashedVerticalLinePath.mouseArea = this.dashedVerticalLinePath.localBounds.dilated( 4 );
      this.graphPointCircle.touchArea = this.graphPointCircle.localBounds.dilated( 4 );
    }

  }

  return blackbodySpectrum.register( 'GraphValuesPointNode', GraphValuesPointNode );
} );