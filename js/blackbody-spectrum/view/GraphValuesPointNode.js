// Copyright 2018-2023, University of Colorado Boulder

/**
 * The class that handles showing a draggable point that follows a graph and shows its x and y values
 *
 * @author Saurabh Totey
 * @author Arnab Purkayastha
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ScientificNotationNode from '../../../../scenery-phet/js/ScientificNotationNode.js';
import { Circle, DragListener, Node, Path, RichText, Text } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BlackbodyConstants from '../../BlackbodyConstants.js';
import blackbodySpectrum from '../../blackbodySpectrum.js';
import BlackbodyColors from './BlackbodyColors.js';

class GraphValuesPointNode extends Node {

  /**
   * Constructs the GraphValuesPointNode given the body to follow and the axes that will handle coordinate conversions.
   * Alignment isn't handled in constructor, but is rather done in the update method due to the non-static nature of
   * this view.
   * @param {BlackbodyBodyModel} body
   * @param {ZoomableAxesView} axes
   * @param {Object} [options]
   */
  constructor( body, axes, options ) {

    options = merge( {
      circleOptions: {
        radius: 5,
        fill: BlackbodyColors.graphValuesPointProperty
      },
      dashedLineOptions: {
        stroke: BlackbodyColors.graphValuesDashedLineProperty,
        lineDash: [ 4, 4 ]
      },
      valueTextOptions: {
        fill: BlackbodyColors.graphValuesLabelsProperty,
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
      tandem: Tandem.REQUIRED
    }, options );

    super( options );

    // @private
    this.body = body;
    this.axes = axes;
    this.graphPointCircle = new Circle( options.circleOptions );
    this.dashedVerticalLinePath = new Path( null, options.dashedLineOptions );
    this.dashedHorizontalLinePath = new Path( null, options.dashedLineOptions );
    this.wavelengthValueText = new Text( '', options.valueTextOptions );
    this.spectralPowerDensityValueText = new RichText( '', options.valueTextOptions );
    this.spectralPowerDensityNode = new Panel( this.spectralPowerDensityValueText, {
      fill: BlackbodyColors.backgroundProperty,
      stroke: BlackbodyColors.backgroundProperty,
      cornerRadius: 0,
      xMargin: options.labelOffset,
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
    this.arrowsVisible = true;

    // Extend bounds of point and cuing arrows
    this.graphPointCircle.mouseArea = this.graphPointCircle.localBounds.dilated( 4 );
    this.graphPointCircle.touchArea = this.cueingArrows.localBounds.dilated( 4 );

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
    const graphValueDragHandler = new DragListener( {
      start: event => {
        clickXOffset = this.graphPointCircle.globalToParentPoint( event.pointer.point ).x - this.graphPointCircle.x;
      },
      drag: event => {
        const x = this.graphPointCircle.globalToParentPoint( event.pointer.point ).x - clickXOffset;

        // Clamp to make sure wavelength Property is within graph bounds
        this.wavelengthProperty.value = Utils.clamp(
          this.axes.viewXToWavelength( x ),
          0,
          this.axes.viewXToWavelength( this.axes.horizontalAxisLength )
        );
        this.update();
      },
      end: () => {
        this.cueingArrows.visible = false;
        this.arrowsVisible = false;
      },
      allowTouchSnag: true,
      dragCursor: 'ew-resize',
      tandem: options.tandem.createTandem( 'dragListener' )
    } );

    this.graphPointCircle.addInputListener( graphValueDragHandler );
    this.cueingArrows.addInputListener( graphValueDragHandler );
    this.dashedVerticalLinePath.addInputListener( graphValueDragHandler );

    // Adds children in rendering order
    this.addChild( this.dashedVerticalLinePath );
    this.addChild( this.dashedHorizontalLinePath );
    this.addChild( this.cueingArrows );
    this.addChild( this.wavelengthValueText );
    this.addChild( this.spectralPowerDensityNode );
    this.addChild( this.graphPointCircle );
  }

  /**
   * Puts this node back at the peak of the graph
   * @public
   */
  reset() {
    this.wavelengthProperty.value = this.body.peakWavelength;
    this.arrowsVisible = true;
    this.update();
  }

  /**
   * Updates the position of the circle and the dashed lines of this graphValuesPointNode
   * @public
   */
  update() {

    // Update spectral power density for changes in wavelength
    const spectralPowerDensityOfPoint = this.body.getSpectralPowerDensityAt( this.wavelengthProperty.value );

    // Updates position of graph point circle in view
    this.graphPointCircle.centerX = this.axes.wavelengthToViewX( this.wavelengthProperty.value );
    this.graphPointCircle.centerY = this.axes.spectralPowerDensityToViewY( spectralPowerDensityOfPoint );
    this.graphPointCircle.visible = this.graphPointCircle.centerX <= this.axes.horizontalAxisLength &&
                                    this.graphPointCircle.centerY >= -this.axes.verticalAxisLength;

    // Update cueing arrows to line up with graph point circle
    this.cueingArrows.center = this.graphPointCircle.center;
    this.cueingArrows.visible = this.arrowsVisible && this.graphPointCircle.visible;

    // Updates value labels' text
    this.wavelengthValueText.string = Utils.toFixed( this.wavelengthProperty.value / 1000.0, 3 ); // nm to microns

    // Spectral Power Density is given special case for scientific notation
    const spectralPowerDensityValue = spectralPowerDensityOfPoint * 1e33; // multiplier is to match y axis
    if ( spectralPowerDensityValue < 0.01 && spectralPowerDensityValue !== 0 ) {
      const notationObject = ScientificNotationNode.toScientificNotation( spectralPowerDensityValue, {
        mantissaDecimalPlaces: 0
      } );
      let formattedString = notationObject.mantissa;
      if ( notationObject.exponent !== '0' ) {

        // Using unicode Thin Space and Hair Space to reduce distance between numbers and "X" in notation
        formattedString += `\u2009\u00D7\u200A10<sup>${notationObject.exponent}</sup>`;
      }
      this.spectralPowerDensityValueText.string = formattedString;
    }
    else {
      this.spectralPowerDensityValueText.string = spectralPowerDensityValue.toPrecision( 4 );
    }

    // Updates value labels' positioning
    this.wavelengthValueText.centerX = this.graphPointCircle.centerX;
    this.wavelengthValueText.top = this.labelOffset;
    this.spectralPowerDensityNode.centerY = this.graphPointCircle.centerY;
    this.spectralPowerDensityNode.right = -2;

    // Clamps label positions so that they don't go off the graph
    if ( this.wavelengthValueText.right > this.axes.horizontalAxisLength - this.labelOffset ) {
      this.wavelengthValueText.right = this.axes.horizontalAxisLength - this.labelOffset;
    }
    else if ( this.wavelengthValueText.left < this.labelOffset ) {
      this.wavelengthValueText.left = this.labelOffset;
    }
    if ( this.spectralPowerDensityNode.top < -this.axes.verticalAxisLength + this.labelOffset ) {
      this.spectralPowerDensityNode.top = -this.axes.verticalAxisLength + this.labelOffset;
    }
    else if ( this.spectralPowerDensityNode.bottom > this.labelOffset ) {
      this.spectralPowerDensityNode.bottom = this.labelOffset;
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

    // Don't extend touch/mouse areas when distance is so small, avoids errors when showing pointer areas
    if ( this.graphPointCircle.centerY < -1e-8 ) {
      this.dashedVerticalLinePath.touchArea = this.dashedVerticalLinePath.localBounds.dilated( 4 );
      this.dashedVerticalLinePath.mouseArea = this.dashedVerticalLinePath.localBounds.dilated( 4 );
    }
    else {
      this.dashedVerticalLinePath.touchArea = null;
      this.dashedVerticalLinePath.mouseArea = null;
    }
  }

}

blackbodySpectrum.register( 'GraphValuesPointNode', GraphValuesPointNode );
export default GraphValuesPointNode;
