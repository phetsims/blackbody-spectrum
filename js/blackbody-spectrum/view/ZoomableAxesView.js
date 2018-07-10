// Copyright 2014-2018, University of Colorado Boulder

/**
 * A view that is responsible for controlling graph axes
 * Handles labels for displaying regions of the electromagnetic spectrum
 * Does NOT handle axis labels
 * Most important functionality is handling conversions between logical values and screen coordinates
 *
 * @author Saurabh Totey
 */
define( function( require ) {
  'use strict';

  // modules
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Util = require( 'DOT/Util' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

  // constants
  // Max wavelengths for each region of the electromagnetic spectrum in nm
  var ELECTROMAGNETIC_SPECTRUM_MAX_WAVELENGTHS = {
    'X-Ray': 10,
    'Ultraviolet': 380,
    'Visible': 700,
    'Infrared': 1000,
    'Radio': Infinity
  };
  // from nm to m to the fifth power (1e45) and Mega/micron (1e-12)
  var SPECTRAL_RADIANCE_CONVERSION_FACTOR = 1e33;

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
        stroke: 'white',
        lineWidth: 3,
        lineCap: 'round',
        lineJoin: 'round'
      },
      ticksPathOptions: {
        stroke: 'white',
        lineWidth: 2,
        lineCap: 'butt',
        lineJoin: 'bevel'
      },
      wavelengthPerTick: 150,
      minorTicksPerMajorTick: 5,
      minorTickLength: 10,
      majorTickLength: 20,
      horizontalZoomFactor: 2,
      verticalZoomFactor: Math.sqrt( 10 ),
      defaultHorizontalZoom: model.wavelengthMax,
      defaultVerticalZoom: 300,
      maxHorizontalZoom: 12000,
      minHorizontalZoom: 750,
      maxVerticalZoom: 1000,
      minVerticalZoom: 10,
      electromagneticSpectrumLabelTextOptions: {
        font: new PhetFont( 14 ),
        fill: 'white'
      }
    }, options );

    // @private
    this.model = model;

    // Axes dimensions
    // @public {number}
    this.horizontalAxisLength = options.axesWidth;
    this.verticalAxisLength = options.axesHeight;
    
    //
    // @private
    //

    // How each axis scales
    this.horizontalZoomScale = options.horizontalZoomFactor;
    this.verticalZoomScale = options.verticalZoomFactor;
    
    // The path for the actual axes themselves 
    this.axesPath = new Path(
      new Shape()
        .moveTo( this.horizontalAxisLength, 0 )
        .lineTo( 0, 0 )
        .lineTo( 0, -this.verticalAxisLength )
        .lineTo( 5, -this.verticalAxisLength ),
      options.axesPathOptions
    );

    // Path for the horizontal axes ticks
    this.horizontalTicksPath = new Path( null, options.ticksPathOptions );
    
    // Components for the electromagnetic spectrum labels
    this.electromagneticSpectrumAxisPath = new Path(
      new Shape().moveTo( 0, -this.verticalAxisLength ).lineTo( this.horizontalAxisLength, -this.verticalAxisLength ),
      options.axesPathOptions
    );
    this.electromagneticSpectrumTicksPath = new Path( null, options.ticksPathOptions );
    this.electromagneticSpectrumLabelTexts = new Node( {
      children: Object.keys( ELECTROMAGNETIC_SPECTRUM_MAX_WAVELENGTHS ).map( function( labelText ) {
        var regionLabel = new Text( labelText, options.electromagneticSpectrumLabelTextOptions );
        regionLabel.bottom = self.electromagneticSpectrumAxisPath.top;
        return regionLabel;
      } )
    } );

    // Horizontal tick settings
    this.wavelengthPerTick = options.wavelengthPerTick;
    this.minorTicksPerMajorTick = options.minorTicksPerMajorTick;
    this.minorTickLength = options.minorTickLength;
    this.majorTickLength = options.majorTickLength;

    //
    // @public
    //

    // {Property.<number>} current zoom values
    this.horizontalZoomProperty = new NumberProperty( options.defaultHorizontalZoom );
    this.verticalZoomProperty = new NumberProperty( options.defaultVerticalZoom );

    // {number} zoom bounds
    this.minHorizontalZoom = options.minHorizontalZoom;
    this.maxHorizontalZoom = options.maxHorizontalZoom;
    this.minVerticalZoom = options.minVerticalZoom;
    this.maxVerticalZoom = options.maxVerticalZoom;

    // Links the horizontal zoom property to update the model for the max wavelength
    this.horizontalZoomProperty.link( function( horizontalZoom ) {
      model.wavelengthMax = horizontalZoom;
    } );

    // Links the horizontal zoom property to update horizontal ticks and the EM spectrum labels on change
    this.horizontalZoomProperty.link( function() {
      self.redrawHorizontalTicks();
      self.redrawElectromagneticSpectrumLabel();
    } );

    // Links the model's labelsVisibleProperty with the electromagnetic spectrum label's visibility
    this.model.labelsVisibleProperty.link( function( labelsVisible ) {
      self.electromagneticSpectrumAxisPath.visible = labelsVisible;
      self.electromagneticSpectrumTicksPath.visible = labelsVisible;
      self.electromagneticSpectrumLabelTexts.visible = labelsVisible;
    } );

    // Call to node superconstructor: no options passed in
    Node.call( this );

    // Adds children in rendering order
    this.addChild( this.axesPath );
    this.addChild( this.horizontalTicksPath );
    this.addChild( this.electromagneticSpectrumAxisPath );
    this.addChild( this.electromagneticSpectrumTicksPath );
    this.addChild( this.electromagneticSpectrumLabelTexts );
  }

  blackbodySpectrum.register( 'ZoomableAxesView', ZoomableAxesView );

  return inherit( Node, ZoomableAxesView, {

    /**
  	 * Resets the axes to their default state
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
      var tickLocations = Object.values( ELECTROMAGNETIC_SPECTRUM_MAX_WAVELENGTHS ).filter( function( wavelength ) {
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
  	 */
    wavelengthToViewX: function( wavelength ) {
      return Util.linear( 0, this.model.wavelengthMax, 0, this.horizontalAxisLength, wavelength );
    },

    /**
     * Converts a given x distance along the view to a wavelength in nm
     * @param {number} viewX
     */
    viewXToWavelength: function( viewX ) {
      return Util.linear( 0, this.horizontalAxisLength, 0, this.model.wavelengthMax, viewX );
    },

    /**
     * Converts a given spectral radiance to a y distance along the view
     * @param {number} spectralRadiance
     */
    spectralRadianceToViewY: function( spectralRadiance ) {
      return -SPECTRAL_RADIANCE_CONVERSION_FACTOR *
        Util.linear( 0, this.verticalZoomProperty.value, 0, this.verticalAxisLength, spectralRadiance );
    },

    /**
     * Converts a given y distance along the view to a spectral radiance
     * @param {number} viewY
     */
    viewYToSpectralRadiance: function( viewY ) {
      return Util.linear( 0, this.verticalAxisLength, 0, this.verticalZoomProperty.value, viewY ) /
        -SPECTRAL_RADIANCE_CONVERSION_FACTOR;
    },

    /**
     * Zooms the horizontal axis in
     */
    zoomInHorizontal: function() {
      this.horizontalZoomProperty.value = Util.clamp( this.horizontalZoomProperty.value / this.horizontalZoomScale,
        this.minHorizontalZoom,
        this.maxHorizontalZoom
      );
    },

    /**
     * Zooms the horizontal axis out
     */
    zoomOutHorizontal: function() {
      this.horizontalZoomProperty.value = Util.clamp( this.horizontalZoomProperty.value * this.horizontalZoomScale,
        this.minHorizontalZoom,
        this.maxHorizontalZoom
      );
    },

    /**
     * Zoooms the vertical axis in
     */
    zoomInVertical: function() {
      this.verticalZoomProperty.value = Util.clamp( this.verticalZoomProperty.value / this.verticalZoomScale,
        this.minVerticalZoom,
        this.maxVerticalZoom
      );
    },

    /**
     * Zooms the vertical axis out
     */
    zoomOutVertical: function() {
      this.verticalZoomProperty.value = Util.clamp( this.verticalZoomProperty.value * this.verticalZoomScale,
        this.minVerticalZoom,
        this.maxVerticalZoom
      );
    }

  } );

} );