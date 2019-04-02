// Copyright 2018-2019, University of Colorado Boulder

/**
 * A view that is responsible for controlling graph axes
 * Handles labels for displaying regions of the electromagnetic spectrum
 * Also handles axes labels and tick labels
 * Most important functionality is handling conversions between logical values and screen coordinates
 *
 * @author Saurabh Totey
 * @author Arnab Purkayastha
 */
define( function( require ) {
  'use strict';

  // modules
  var BlackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackbodyColorProfile' );
  var BlackbodyConstants = require( 'BLACKBODY_SPECTRUM/BlackbodyConstants' );
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Range = require( 'DOT/Range' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var ScientificNotationNode = require( 'SCENERY_PHET/ScientificNotationNode' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  // from nm to m to the fifth power (1e45) and Mega/micron (1e-12)
  var SPECTRAL_RADIANCE_CONVERSION_FACTOR = 1e33;

  // strings
  var wavelengthLabelString = require( 'string!BLACKBODY_SPECTRUM/wavelengthLabel' );
  var subtitleLabelString = require( 'string!BLACKBODY_SPECTRUM/subtitleLabel' );
  var spectralRadianceLabelString = require( 'string!BLACKBODY_SPECTRUM/spectralRadianceLabel' );
  var xRayString = require( 'string!BLACKBODY_SPECTRUM/xRay' );
  var ultravioletString = require( 'string!BLACKBODY_SPECTRUM/ultraviolet' );
  var visibleString = require( 'string!BLACKBODY_SPECTRUM/visible' );
  var infraredString = require( 'string!BLACKBODY_SPECTRUM/infrared' );

  // Max wavelengths for each region of the electromagnetic spectrum in nm, type Object
  var ELECTROMAGNETIC_SPECTRUM_MAX_WAVELENGTHS = {};
  ELECTROMAGNETIC_SPECTRUM_MAX_WAVELENGTHS[ xRayString ] = 10;
  ELECTROMAGNETIC_SPECTRUM_MAX_WAVELENGTHS[ ultravioletString ] = 400;
  ELECTROMAGNETIC_SPECTRUM_MAX_WAVELENGTHS[ visibleString ] = 700;
  ELECTROMAGNETIC_SPECTRUM_MAX_WAVELENGTHS[ infraredString ] = 100000;

  /**
   * Makes a ZoomableAxesView
   * @param {BlackbodySpectrumModel} model
   * @param {Object} [options]
   * @constructor
   */
  function ZoomableAxesView( model, options ) {
    var self = this;

    // Default options
    options = _.extend( {
      axesWidth: 550,
      axesHeight: 400,
      axesPathOptions: {
        stroke: BlackbodyColorProfile.graphAxesStrokeProperty,
        lineWidth: 3,
        lineCap: 'round',
        lineJoin: 'round'
      },
      ticksPathOptions: {
        stroke: BlackbodyColorProfile.graphAxesStrokeProperty,
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
      defaultVerticalZoom: 140.0,
      minorTickMaxHorizontalZoom: 12000,
      axisBoundsLabelColor: BlackbodyColorProfile.titlesTextProperty,
      axisLabelColor: BlackbodyColorProfile.titlesTextProperty,
      electromagneticSpectrumLabelTextOptions: {
        font: new PhetFont( 14 ),
        fill: BlackbodyColorProfile.titlesTextProperty
      }
    }, options );

    // @private
    this.model = model;

    // Axes dimensions
    // @public {number}
    this.horizontalAxisLength = options.axesWidth;
    this.verticalAxisLength = options.axesHeight;

    // @private How each axis scales
    this.horizontalZoomScale = options.horizontalZoomFactor;
    this.verticalZoomScale = options.verticalZoomFactor;

    // @private The path for the actual axes themselves
    this.axesPath = new Path(
      new Shape()
        .moveTo( this.horizontalAxisLength, 0 )
        .lineTo( 0, 0 )
        .lineTo( 0, -this.verticalAxisLength )
        .lineTo( 5, -this.verticalAxisLength ),
      options.axesPathOptions
    );

    // @private Path for the horizontal axes ticks
    this.horizontalTicksPath = new Path( null, options.ticksPathOptions );

    // @private Components for the electromagnetic spectrum labels
    this.electromagneticSpectrumAxisPath = new Path(
      new Shape().moveTo( 0, -this.verticalAxisLength ).lineTo( this.horizontalAxisLength, -this.verticalAxisLength ),
      _.extend( options.axesPathOptions, { lineWidth: 1 } )
    );
    this.electromagneticSpectrumTicksPath = new Path( null, options.ticksPathOptions );
    this.electromagneticSpectrumLabelTexts = new Node( {
      children: Object.keys( ELECTROMAGNETIC_SPECTRUM_MAX_WAVELENGTHS ).map( function( labelText ) {
        var regionLabel = new Text( labelText, options.electromagneticSpectrumLabelTextOptions );
        regionLabel.bottom = self.electromagneticSpectrumAxisPath.top;
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
    var verticalAxisLabelNode = new Text( spectralRadianceLabelString, {
      font: new PhetFont( 26 ),
      fill: options.axisLabelColor,
      rotation: -Math.PI / 2,
      maxWidth: options.axesHeight
    } );

    var axesWidth = options.axesWidth * 0.8;
    var horizontalAxisTopLabelNode = new Text( wavelengthLabelString, {
      font: new PhetFont( 24 ),
      fill: options.axisLabelColor,
      maxWidth: axesWidth
    } );
    var horizontalAxisBottomLabelNode = new Text( subtitleLabelString, {
      font: new PhetFont( 16 ),
      fill: options.axisLabelColor,
      maxWidth: axesWidth
    } );
    var horizontalAxisLabelNode = new Node( {
      children: [ horizontalAxisTopLabelNode, horizontalAxisBottomLabelNode ]
    } );

    // @public {Property.<number>} current zoom values
    this.horizontalZoomProperty = new NumberProperty( options.defaultHorizontalZoom, {
      range: new Range( BlackbodyConstants.minHorizontalZoom, BlackbodyConstants.maxHorizontalZoom )
    } );
    this.verticalZoomProperty = new NumberProperty( options.defaultVerticalZoom, {
      range: new Range( BlackbodyConstants.minVerticalZoom, BlackbodyConstants.maxVerticalZoom )
    } );

    // @public {number} zoom bounds
    this.minHorizontalZoom = BlackbodyConstants.minHorizontalZoom;
    this.maxHorizontalZoom = BlackbodyConstants.maxHorizontalZoom;
    this.minVerticalZoom = BlackbodyConstants.minVerticalZoom;
    this.maxVerticalZoom = BlackbodyConstants.maxVerticalZoom;

    // @public Links the horizontal zoom Property to update the model for the max wavelength
    this.horizontalZoomProperty.link( function( horizontalZoom ) {
      model.wavelengthMax = horizontalZoom;
    } );

    // @public Links the horizontal zoom Property to update horizontal ticks and the EM spectrum labels on change
    this.horizontalZoomProperty.link( function() {
      self.redrawHorizontalTicks();
      self.redrawElectromagneticSpectrumLabel();
    } );

    // @public Links the model's labelsVisibleProperty with the electromagnetic spectrum label's visibility
    this.model.labelsVisibleProperty.link( function( labelsVisible ) {
      self.electromagneticSpectrumAxisPath.visible = labelsVisible;
      self.electromagneticSpectrumTicksPath.visible = labelsVisible;
      self.electromagneticSpectrumLabelTexts.visible = labelsVisible;
    } );

    // @private Labels for axes bounds
    this.horizontalTickLabelZero = new Text( '0', { font: new PhetFont( 32 ), fill: options.axisBoundsLabelColor } );
    this.horizontalTickLabelMax = new Text( model.wavelengthMax / 1000, {
      font: new PhetFont( 32 ),
      fill: options.axisBoundsLabelColor
    } );
    this.verticalTickLabelMax = new RichText( this.truncateNum( this.verticalZoomProperty.value, 3, 5 ), {
      font: new PhetFont( 24 ),
      fill: options.axisBoundsLabelColor,
      maxWidth: 60
    } );

    // Call to node superconstructor: no options passed in
    Node.call( this );

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

    // Set layout of labels relative to axes, all values were determined empirically by looking at the design document
    this.horizontalTickLabelZero.top = this.axesPath.bottom;
    this.horizontalTickLabelZero.centerX = this.axesPath.left - 10;
    this.horizontalTickLabelMax.top = this.axesPath.bottom;
    this.horizontalTickLabelMax.centerX = this.axesPath.right + 5;
    verticalAxisLabelNode.centerX = this.axesPath.left - 90;
    verticalAxisLabelNode.centerY = this.axesPath.centerY;
    horizontalAxisTopLabelNode.centerX = this.axesPath.centerX;
    horizontalAxisBottomLabelNode.top = horizontalAxisTopLabelNode.bottom + 5;
    horizontalAxisBottomLabelNode.centerX = this.axesPath.centerX;
    horizontalAxisLabelNode.centerY = this.axesPath.bottom + 59;
  }

  blackbodySpectrum.register( 'ZoomableAxesView', ZoomableAxesView );

  return inherit( Node, ZoomableAxesView, {

    /**
     * Resets the axes to their default state
     * @public
     */
    reset: function() {
      this.horizontalZoomProperty.reset();
      this.verticalZoomProperty.reset();
    },

    /**
     * Updates the ZoomableAxesView's horizontal ticks to comply with any new changes
     * @private
     */
    redrawHorizontalTicks: function() {
      var horizontalTicksShape = new Shape();
      for ( var i = 0; i < this.model.wavelengthMax / this.wavelengthPerTick; i++ ) {
        var tickHeight = this.minorTickLength;
        if ( this.model.wavelengthMax > this.minorTickMaxHorizontalZoom ) {
          tickHeight = 0;
        }
        if ( i % this.minorTicksPerMajorTick === 0 ) {
          tickHeight = this.majorTickLength;
        }

        var x = this.wavelengthToViewX( i * this.wavelengthPerTick );
        horizontalTicksShape.moveTo( x, 0 ).lineTo( x, -tickHeight );
      }
      this.horizontalTicksPath.shape = horizontalTicksShape;
    },

    /**
     * Updates the ZoomableAxesView's electromagnetic spectrum label to comply with any new changes
     * @private
     */
    redrawElectromagneticSpectrumLabel: function() {
      var self = this;

      // Makes the ticks for demarcating regions of the electromagnetic spectrum
      var labelsTickShape = new Shape();
      var tickLocations = _.values( ELECTROMAGNETIC_SPECTRUM_MAX_WAVELENGTHS ).filter( function( wavelength ) {
        return wavelength <= self.model.wavelengthMax;
      } ).map( function( wavelength ) {
        return self.wavelengthToViewX( wavelength );
      } );
      tickLocations.forEach( function( x ) {
        var bottomY = -self.verticalAxisLength + self.minorTickLength / 2;
        labelsTickShape.moveTo( x, bottomY ).lineTo( x, bottomY - self.minorTickLength );
      } );
      this.electromagneticSpectrumTicksPath.shape = labelsTickShape;

      // Makes all text labels invisible
      this.electromagneticSpectrumLabelTexts.children.forEach( function( regionLabel ) {
        regionLabel.visible = false;
      } );

      // Using the locations for tick placement, updates location of electromagnetic spectrum text labels
      var labelBounds = [ 0 ].concat( tickLocations ).concat( this.horizontalAxisLength );
      for ( var i = 0; i < labelBounds.length - 1; i++ ) {
        var lowerBound = labelBounds[ i ];
        var upperBound = labelBounds[ i + 1 ];
        var regionLabel = this.electromagneticSpectrumLabelTexts.children[ i ];
        if ( upperBound - lowerBound < regionLabel.width ) {
          continue;
        }
        regionLabel.visible = true;
        regionLabel.centerX = ( upperBound + lowerBound ) / 2;
      }
    },

    /**
     * Converts a given wavelength in nm to an x distance along the view
     * @param {number} wavelength
     * @returns {number}
     * @public
     */
    wavelengthToViewX: function( wavelength ) {
      return Util.linear( 0, this.model.wavelengthMax, 0, this.horizontalAxisLength, wavelength );
    },

    /**
     * Converts a given x distance along the view to a wavelength in nm
     * @param {number} viewX
     * @returns {number}
     * @public
     */
    viewXToWavelength: function( viewX ) {
      return Util.linear( 0, this.horizontalAxisLength, 0, this.model.wavelengthMax, viewX );
    },

    /**
     * Converts a given spectral radiance to a y distance along the view
     * @param {number} spectralRadiance
     * @returns {number}
     * @public
     */
    spectralRadianceToViewY: function( spectralRadiance ) {
      return -SPECTRAL_RADIANCE_CONVERSION_FACTOR *
             Util.linear( 0, this.verticalZoomProperty.value, 0, this.verticalAxisLength, spectralRadiance );
    },

    /**
     * Converts a given y distance along the view to a spectral radiance
     * @param {number} viewY
     * @returns {number}
     * @public
     */
    viewYToSpectralRadiance: function( viewY ) {
      return Util.linear( 0, this.verticalAxisLength, 0, this.verticalZoomProperty.value, viewY ) /
             -SPECTRAL_RADIANCE_CONVERSION_FACTOR;
    },

    /**
     * Zooms the horizontal axis in
     * @public
     */
    zoomInHorizontal: function() {
      this.horizontalZoomProperty.value = Util.clamp( this.horizontalZoomProperty.value / this.horizontalZoomScale,
        this.minHorizontalZoom,
        this.maxHorizontalZoom
      );
    },

    /**
     * Zooms the horizontal axis out
     * @public
     */
    zoomOutHorizontal: function() {
      this.horizontalZoomProperty.value = Util.clamp( this.horizontalZoomProperty.value * this.horizontalZoomScale,
        this.minHorizontalZoom,
        this.maxHorizontalZoom
      );
    },

    /**
     * Zooms the vertical axis in
     * @public
     */
    zoomInVertical: function() {
      this.verticalZoomProperty.value = Util.clamp( this.verticalZoomProperty.value / this.verticalZoomScale,
        this.minVerticalZoom,
        this.maxVerticalZoom
      );
    },

    /**
     * Zooms the vertical axis out
     * @public
     */
    zoomOutVertical: function() {
      this.verticalZoomProperty.value = Util.clamp( this.verticalZoomProperty.value * this.verticalZoomScale,
        this.minVerticalZoom,
        this.maxVerticalZoom
      );
    },

    /**
     * Updates everything in the axes view node
     * @public
     */
    update: function() {
      this.horizontalTickLabelMax.text = this.model.wavelengthMax / 1000; // Conversion from nm to microns
      if ( this.verticalZoomProperty.value < 0.01 ) {
        var notationObject = ScientificNotationNode.toScientificNotation( this.verticalZoomProperty.value, {
          mantissaDecimalPlaces: 0
        } );
        var formattedString = notationObject.mantissa;
        if ( notationObject.exponent !== '0' ) {
          formattedString += ' X 10<sup>' + notationObject.exponent + '</sup>';
        }
        this.verticalTickLabelMax.text = formattedString;
      }
      else {
        this.verticalTickLabelMax.text = this.truncateNum( this.verticalZoomProperty.value, 2, 2 );
      }

      this.verticalTickLabelMax.right = this.axesPath.left - 10;
      this.verticalTickLabelMax.bottom = this.axesPath.top + 10;
    },

    /**
     * Sets sigfigs of a number, then truncates to decimal limit
     * Returns number as a string
     * @param {number} value
     * @param {number} significantFigures
     * @param {number} decimals
     * @private
     */
    truncateNum: function( value, significantFigures, decimals ) {
      var sfNumber = parseFloat( value.toPrecision( significantFigures ) );
      return ( Util.numberOfDecimalPlaces( sfNumber ) > decimals ) ? Util.toFixed( sfNumber, decimals ) : sfNumber.toString();
    }

  } );

} );