// Copyright 2018-2023, University of Colorado Boulder

/**
 * A view that is responsible for controlling graph axes
 * Handles labels for displaying regions of the electromagnetic spectrum
 * Also handles axes labels and tick labels
 * Most important functionality is handling conversions between logical values and screen coordinates
 *
 * @author Saurabh Totey
 * @author Arnab Purkayastha
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ScientificNotationNode from '../../../../scenery-phet/js/ScientificNotationNode.js';
import { Node, Path, RichText, Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BlackbodyConstants from '../../BlackbodyConstants.js';
import blackbodySpectrum from '../../blackbodySpectrum.js';
import BlackbodySpectrumStrings from '../../BlackbodySpectrumStrings.js';
import BlackbodyColors from './BlackbodyColors.js';

// from nm to m to the fifth power (1e45) and Mega/micron (1e-12)
const SPECTRAL_POWER_DENSITY_CONVERSION_FACTOR = 1e33;
const ELECTROMAGNETIC_SPECTRUM_LABEL_CUTOFF = 20;

const infraredString = BlackbodySpectrumStrings.infrared;
const spectralPowerDensityLabelString = BlackbodySpectrumStrings.spectralPowerDensityLabel;
const subtitleLabelString = BlackbodySpectrumStrings.subtitleLabel;
const ultravioletString = BlackbodySpectrumStrings.ultraviolet;
const visibleString = BlackbodySpectrumStrings.visible;
const wavelengthLabelString = BlackbodySpectrumStrings.wavelengthLabel;
const xRayString = BlackbodySpectrumStrings.xRay;

// Max wavelengths for each region of the electromagnetic spectrum in nm, type Object
const ELECTROMAGNETIC_SPECTRUM_LABEL_VALUES = {
  xray: {
    label: xRayString,
    maxWavelength: BlackbodyConstants.xRayWavelength
  },
  ultraviolet: {
    label: ultravioletString,
    maxWavelength: BlackbodyConstants.ultravioletWavelength
  },
  visible: {
    label: visibleString,
    maxWavelength: BlackbodyConstants.visibleWavelength
  },
  infrared: {
    label: infraredString,
    maxWavelength: BlackbodyConstants.infraredWavelength
  }
};

class ZoomableAxesView extends Node {

  /**
   * Makes a ZoomableAxesView
   * @param {BlackbodySpectrumModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    // Default options
    options = merge( {
      axesWidth: 550,
      axesHeight: 400,
      axesPathOptions: {
        stroke: BlackbodyColors.graphAxesStrokeProperty,
        lineWidth: 3,
        lineCap: 'round',
        lineJoin: 'round'
      },
      ticksPathOptions: {
        stroke: BlackbodyColors.graphAxesStrokeProperty,
        lineWidth: 1,
        lineCap: 'butt',
        lineJoin: 'bevel'
      },
      wavelengthPerTick: 100,
      minorTicksPerMajorTick: 5,
      minorTickLength: 10,
      majorTickLength: 20,
      horizontalZoomFactor: 2,
      verticalZoomFactor: 5,
      defaultHorizontalZoom: model.wavelengthMax,
      defaultVerticalZoom: 100.0,
      minorTickMaxHorizontalZoom: 12000,
      axisBoundsLabelColor: BlackbodyColors.titlesTextProperty,
      axisLabelColor: BlackbodyColors.titlesTextProperty,
      electromagneticSpectrumLabelTextOptions: {
        font: new PhetFont( 14 ),
        fill: BlackbodyColors.titlesTextProperty
      },
      tandem: Tandem.REQUIRED
    }, options );

    // Call to node superconstructor: no options passed in
    super();

    // @private
    this.model = model;

    // Axes dimensions
    // @public {number}
    this.horizontalAxisLength = options.axesWidth;
    this.verticalAxisLength = options.axesHeight;

    // @public (read-only) - How each axis scales
    this.horizontalZoomScale = options.horizontalZoomFactor;
    this.verticalZoomScale = options.verticalZoomFactor;

    // @private The path for the actual axes themselves
    this.axesPath = new Path(
      new Shape()
        .moveTo( this.horizontalAxisLength, -5 )
        .lineTo( this.horizontalAxisLength, 0 )
        .lineTo( 0, 0 )
        .lineTo( 0, -this.verticalAxisLength )
        .lineTo( 5, -this.verticalAxisLength ),
      options.axesPathOptions
    );

    // @public Clipping shape for keeping elements inside graph axes - clips the paths to the axes bounds, pushed
    // shape down 1 pixel to prevent performance degradation when clipping at low temperatures
    this.clipShape = Shape.rectangle( 0, 1, this.horizontalAxisLength, -this.verticalAxisLength - 1 );

    // @private Path for the horizontal axes ticks
    this.horizontalTicksPath = new Path( null, options.ticksPathOptions );

    // @private Components for the electromagnetic spectrum labels
    this.electromagneticSpectrumAxisPath = new Path(
      new Shape().moveTo( 0, -this.verticalAxisLength ).lineTo( this.horizontalAxisLength, -this.verticalAxisLength ),
      merge( options.axesPathOptions, { lineWidth: 1 } )
    );
    this.electromagneticSpectrumTicksPath = new Path( null, options.ticksPathOptions );
    this.electromagneticSpectrumLabelTexts = new Node( {
      children: _.values( ELECTROMAGNETIC_SPECTRUM_LABEL_VALUES ).map( config => {
        const regionLabel = new Text( config.label, options.electromagneticSpectrumLabelTextOptions );
        regionLabel.bottom = this.electromagneticSpectrumAxisPath.top;
        return regionLabel;
      } )
    } );

    // @private Horizontal tick settings
    this.wavelengthPerTick = options.wavelengthPerTick;
    this.minorTicksPerMajorTick = options.minorTicksPerMajorTick;
    this.minorTickLength = options.minorTickLength;
    this.majorTickLength = options.majorTickLength;
    this.minorTickMaxHorizontalZoom = options.minorTickMaxHorizontalZoom;

    // Labels for the axes
    const verticalAxisLabelNode = new Text( spectralPowerDensityLabelString, {
      font: BlackbodyConstants.LABEL_FONT,
      fill: options.axisLabelColor,
      rotation: -Math.PI / 2,
      maxWidth: options.axesHeight
    } );

    const axesWidth = options.axesWidth * 0.8;
    const horizontalAxisTopLabelNode = new Text( wavelengthLabelString, {
      font: BlackbodyConstants.LABEL_FONT,
      fill: options.axisLabelColor,
      maxWidth: axesWidth
    } );
    const horizontalAxisBottomLabelText = new Text( subtitleLabelString, {
      font: new PhetFont( 16 ),
      fill: options.axisLabelColor,
      maxWidth: axesWidth,
      tandem: options.tandem.createTandem( 'horizontalAxisSubtitleLabelText' )
    } );
    const horizontalAxisLabelNode = new Node( {
      children: [ horizontalAxisTopLabelNode, horizontalAxisBottomLabelText ]
    } );

    // @public {Property.<number>} current zoom values
    this.horizontalZoomProperty = new NumberProperty( options.defaultHorizontalZoom, {
      range: new Range( BlackbodyConstants.minHorizontalZoom, BlackbodyConstants.maxHorizontalZoom ),
      tandem: options.tandem.createTandem( 'horizontalZoomProperty' )
    } );
    this.verticalZoomProperty = new NumberProperty( options.defaultVerticalZoom, {
      range: new Range( BlackbodyConstants.minVerticalZoom, BlackbodyConstants.maxVerticalZoom ),
      tandem: options.tandem.createTandem( 'verticalZoomProperty' )
    } );

    // @public {number} zoom bounds
    this.minHorizontalZoom = BlackbodyConstants.minHorizontalZoom;
    this.maxHorizontalZoom = BlackbodyConstants.maxHorizontalZoom;
    this.minVerticalZoom = BlackbodyConstants.minVerticalZoom;
    this.maxVerticalZoom = BlackbodyConstants.maxVerticalZoom;

    // @public Links the horizontal zoom Property to update the model for the max wavelength
    this.horizontalZoomProperty.link( horizontalZoom => {
      model.wavelengthMax = horizontalZoom;
    } );

    // @public Links the horizontal zoom Property to update horizontal ticks and the EM spectrum labels on change
    this.horizontalZoomProperty.link( () => {
      this.redrawHorizontalTicks();
      this.redrawElectromagneticSpectrumLabel();
    } );

    // @public Links the model's labelsVisibleProperty with the electromagnetic spectrum label's visibility
    this.model.labelsVisibleProperty.link( labelsVisible => {
      this.electromagneticSpectrumAxisPath.visible = labelsVisible;
      this.electromagneticSpectrumTicksPath.visible = labelsVisible;
      this.electromagneticSpectrumLabelTexts.visible = labelsVisible;
    } );

    // @private Labels for axes bounds
    this.horizontalTickLabelZero = new Text( '0', {
      font: BlackbodyConstants.LABEL_FONT,
      fill: options.axisBoundsLabelColor
    } );
    this.horizontalTickLabelMax = new Text( model.wavelengthMax / 1000, {
      font: BlackbodyConstants.LABEL_FONT,
      fill: options.axisBoundsLabelColor
    } );
    this.verticalTickLabelMax = new RichText( this.truncateNum( this.verticalZoomProperty.value, 3, 5 ), {
      font: BlackbodyConstants.LABEL_FONT,
      fill: options.axisBoundsLabelColor,
      maxWidth: 60
    } );

    // Set layout of labels relative to axes, these objects are static
    // Remaining object layouts are set in update() below
    this.horizontalTickLabelZero.top = this.axesPath.bottom;
    this.horizontalTickLabelZero.right = this.axesPath.left;
    this.horizontalTickLabelMax.top = this.axesPath.bottom;
    this.horizontalTickLabelMax.left = this.axesPath.right;
    verticalAxisLabelNode.centerX = this.axesPath.left - 90;
    verticalAxisLabelNode.centerY = this.axesPath.centerY;
    horizontalAxisTopLabelNode.centerX = this.axesPath.centerX;
    horizontalAxisBottomLabelText.top = horizontalAxisTopLabelNode.bottom + 5;
    horizontalAxisBottomLabelText.centerX = this.axesPath.centerX;
    horizontalAxisLabelNode.centerY = this.axesPath.bottom + 59;

    // Adds children in rendering order
    this.addChild( verticalAxisLabelNode );
    this.addChild( horizontalAxisLabelNode );
    this.addChild( this.horizontalTickLabelZero );
    this.addChild( this.horizontalTickLabelMax );
    this.addChild( this.verticalTickLabelMax );
    this.addChild( this.axesPath );
    this.addChild( this.horizontalTicksPath );
    this.addChild( this.electromagneticSpectrumAxisPath );
    this.addChild( this.electromagneticSpectrumTicksPath );
    this.addChild( this.electromagneticSpectrumLabelTexts );
  }

  /**
   * Resets the axes to their default state
   * @public
   */
  reset() {
    this.horizontalZoomProperty.reset();
    this.verticalZoomProperty.reset();
  }

  /**
   * Updates the ZoomableAxesView's horizontal ticks to comply with any new changes
   * @private
   */
  redrawHorizontalTicks() {
    const horizontalTicksShape = new Shape();
    for ( let i = 0; i < this.model.wavelengthMax / this.wavelengthPerTick; i++ ) {
      let tickHeight = this.minorTickLength;
      if ( this.model.wavelengthMax > this.minorTickMaxHorizontalZoom ) {
        tickHeight = 0;
      }
      if ( i % this.minorTicksPerMajorTick === 0 ) {
        tickHeight = this.majorTickLength;
      }

      const x = this.wavelengthToViewX( i * this.wavelengthPerTick );
      horizontalTicksShape.moveTo( x, 0 ).lineTo( x, -tickHeight );
    }
    this.horizontalTicksPath.shape = horizontalTicksShape;
  }

  /**
   * Updates the ZoomableAxesView's electromagnetic spectrum label to comply with any new changes
   * @private
   */
  redrawElectromagneticSpectrumLabel() {

    // Makes the ticks for demarcating regions of the electromagnetic spectrum
    const labelsTickShape = new Shape();
    const tickPositions = _.values( ELECTROMAGNETIC_SPECTRUM_LABEL_VALUES ).filter( config => {
      return config.maxWavelength <= this.model.wavelengthMax;
    } ).map( config => {
      return this.wavelengthToViewX( config.maxWavelength );
    } );
    tickPositions.forEach( x => {
      const bottomY = -this.verticalAxisLength + this.minorTickLength / 2;
      labelsTickShape.moveTo( x, bottomY ).lineTo( x, bottomY - this.minorTickLength );
    } );
    this.electromagneticSpectrumTicksPath.shape = labelsTickShape;

    // Makes all text labels invisible
    this.electromagneticSpectrumLabelTexts.children.forEach( regionLabel => {
      regionLabel.visible = false;
    } );

    // Using the positions for tick placement, updates positions of electromagnetic spectrum text labels
    const labelBounds = [ 0 ].concat( tickPositions ).concat( this.horizontalAxisLength );
    for ( let i = 0; i < labelBounds.length - 1; i++ ) {
      const lowerBound = labelBounds[ i ];
      const upperBound = labelBounds[ i + 1 ];
      assert && assert( upperBound > lowerBound, 'Label tick positions are not in order' );
      const regionLabel = this.electromagneticSpectrumLabelTexts.children[ i ];
      if ( upperBound - lowerBound < ELECTROMAGNETIC_SPECTRUM_LABEL_CUTOFF ) {
        continue;
      }
      regionLabel.visible = true;
      regionLabel.maxWidth = upperBound - lowerBound;
      regionLabel.centerX = ( upperBound + lowerBound ) / 2;
    }
  }

  /**
   * Converts a given wavelength in nm to an x distance along the view
   * @param {number} wavelength
   * @returns {number}
   * @public
   */
  wavelengthToViewX( wavelength ) {
    return Utils.linear( 0, this.model.wavelengthMax, 0, this.horizontalAxisLength, wavelength );
  }

  /**
   * Converts a given x distance along the view to a wavelength in nm
   * @param {number} viewX
   * @returns {number}
   * @public
   */
  viewXToWavelength( viewX ) {
    return Utils.linear( 0, this.horizontalAxisLength, 0, this.model.wavelengthMax, viewX );
  }

  /**
   * Converts a given spectral power density to a y distance along the view
   * @param {number} spectralPowerDensity
   * @returns {number}
   * @public
   */
  spectralPowerDensityToViewY( spectralPowerDensity ) {
    return -SPECTRAL_POWER_DENSITY_CONVERSION_FACTOR *
           Utils.linear( 0, this.verticalZoomProperty.value, 0, this.verticalAxisLength, spectralPowerDensity );
  }

  /**
   * Converts a given y distance along the view to a spectral power density
   * @param {number} viewY
   * @returns {number}
   * @public
   */
  viewYToSpectralPowerDensity( viewY ) {
    return Utils.linear( 0, this.verticalAxisLength, 0, this.verticalZoomProperty.value, viewY ) /
           -SPECTRAL_POWER_DENSITY_CONVERSION_FACTOR;
  }

  /**
   * Zooms the horizontal axis in
   * @public
   */
  zoomInHorizontal() {
    this.horizontalZoomProperty.value = Utils.clamp( this.horizontalZoomProperty.value / this.horizontalZoomScale,
      this.minHorizontalZoom,
      this.maxHorizontalZoom
    );
  }

  /**
   * Zooms the horizontal axis out
   * @public
   */
  zoomOutHorizontal() {
    this.horizontalZoomProperty.value = Utils.clamp( this.horizontalZoomProperty.value * this.horizontalZoomScale,
      this.minHorizontalZoom,
      this.maxHorizontalZoom
    );
  }

  /**
   * Zooms the vertical axis in
   * @public
   */
  zoomInVertical() {
    this.verticalZoomProperty.value = Utils.clamp( this.verticalZoomProperty.value / this.verticalZoomScale,
      this.minVerticalZoom,
      this.maxVerticalZoom
    );
  }

  /**
   * Zooms the vertical axis out
   * @public
   */
  zoomOutVertical() {
    this.verticalZoomProperty.value = Utils.clamp( this.verticalZoomProperty.value * this.verticalZoomScale,
      this.minVerticalZoom,
      this.maxVerticalZoom
    );
  }

  /**
   * Updates everything in the axes view node
   * @public
   */
  update() {
    this.horizontalTickLabelMax.string = this.model.wavelengthMax / 1000; // Conversion from nm to microns
    if ( this.verticalZoomProperty.value < 0.01 ) {
      const notationObject = ScientificNotationNode.toScientificNotation( this.verticalZoomProperty.value, {
        mantissaDecimalPlaces: 0
      } );
      let formattedString = notationObject.mantissa;
      if ( notationObject.exponent !== '0' ) {
        formattedString += `\u2009\u00D7\u200A10<sup>${notationObject.exponent}</sup>`;
      }
      this.verticalTickLabelMax.string = formattedString;
    }
    else {
      this.verticalTickLabelMax.string = this.truncateNum( this.verticalZoomProperty.value, 2, 2 );
    }

    this.verticalTickLabelMax.right = this.axesPath.left;
    this.verticalTickLabelMax.bottom = this.axesPath.top;
  }

  /**
   * Sets sigfigs of a number, then truncates to decimal limit
   * Returns number as a string
   * @param {number} value
   * @param {number} significantFigures
   * @param {number} decimals
   * @private
   */
  truncateNum( value, significantFigures, decimals ) {
    const sfNumber = parseFloat( value.toPrecision( significantFigures ) );
    return ( Utils.numberOfDecimalPlaces( sfNumber ) > decimals ) ? Utils.toFixed( sfNumber, decimals ) : sfNumber.toString();
  }

}

blackbodySpectrum.register( 'ZoomableAxesView', ZoomableAxesView );
export default ZoomableAxesView;
