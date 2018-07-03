// Copyright 2014-2018, University of Colorado Boulder

/**
 * A view that is responsible for controlling graph axes
 * Does NOT handle axis labels
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

  /**
   * Makes a ZoomableAxesView
   * @param {BlackbodySpectrumModel} model
   * @param {Object} options
   * @constructor
   */
  function ZoomableAxesView( model, options ) {
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
      wavelengthPerTick: 50,
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
      minVerticalZoom: 10
    }, options );

    // @private
    this.model = model;
    this.horizontalAxisLength = options.axesWidth;
    this.verticalAxisLength = options.axesHeight;
    this.horizontalZoomScale = options.horizontalZoomFactor;
    this.verticalZoomScale = options.verticalZoomFactor;
    this.axesPath = new Path(
      new Shape()
        .moveTo( this.horizontalAxisLength, 0 )
        .lineTo( 0, 0 )
        .lineTo( 0, -this.verticalAxisLength )
        .lineTo( 5, -this.verticalAxisLength ),
      options.axesPathOptions
    );
    this.wavelengthPerTick = options.wavelengthPerTick;
    this.minorTicksPerMajorTick = options.minorTicksPerMajorTick;
    this.minorTickLength = options.minorTickLength;
    this.majorTickLength = options.majorTickLength;
    this.horizontalTicksPath = new Path( null, options.ticksPathOptions );

    // @public
    this.horizontalZoomProperty = new NumberProperty( options.defaultHorizontalZoom );
    this.verticalZoomProperty = new NumberProperty( options.defaultVerticalZoom );
    this.minHorizontalZoom = options.minHorizontalZoom;
    this.maxHorizontalZoom = options.maxHorizontalZoom;
    this.minVerticalZoom = options.minVerticalZoom;
    this.maxVerticalZoom = options.maxVerticalZoom;

    // Links the horizontal zoom property to update horizontal ticks on change
    this.horizontalZoomProperty.link( this.redrawHorizontalTicks );

    // Links the horizontal zoom property to update the model for the max wavelength
    this.horizontalZoomProperty.link( function( horizontalZoom ) {
      model.wavelengthMax = horizontalZoom;
    } );

    // Call to node superconstructor: no options passed in
    Node.call( this );

    // Adds children in rendering order
    this.addChild( this.axesPath );
    this.addChild( this.horizontalTicksPath );

    // Draws the ZoomableAxesView's horizontal ticks
    this.redraw();
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
        var tickHeight = -this.minorTickLength;
        if ( i % this.minorTicksPerMajorTick === 0 ) {
          tickHeight = -this.majorTickLength;
        }
        var x = this.wavelengthToViewX( i * this.wavelengthPerTick );
        horizontalTicksShape.moveTo( x, 0 ).lineTo( x, -tickHeight );
      }
      this.horizontalTicksPath.shape = horizontalTicksShape;
    },

    /**
  	 * Converts a given wavelength to an x distance along the view
  	 * @param {number} wavelength
  	 */
    wavelengthToViewX: function( wavelength ) {
      return Util.linear( 0, this.model.wavelengthMax, 0, this.horizontalAxisLength, wavelength );
    },

    /**
     * Converts a given x distance along the view to a wavelength
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
      return Util.linear( 0, this.verticalZoomProperty.value, 0, this.verticalAxisLength, spectralRadiance );
    },

    /**
     * Converts a given y distance along the view to a spectral radiance
     * @param {number} viewY
     */
    viewYToSpectralRadiance: function( viewY ) {
      return Util.linear( 0, this.verticalAxisLength, 0, this.verticalZoomProperty.value, viewY );
    },

    /**
     * Zooms the horizontal axis in
     */
    zoomInHorizontal: function() {
      this.horizontalZoomProperty.value = Util.clamp( this.horizontalZoomProperty.value * this.horizontalZoomScale,
        this.minHorizontalZoom,
        this.maxHorizontalZoom
      );
    },

    /**
     * Zooms the horizontal axis out
     */
    zoomOutHorizontal: function() {
      this.horizontalZoomProperty.value = Util.clamp( this.horizontalZoomProperty.value / this.horizontalZoomScale,
        this.minHorizontalZoom,
        this.maxHorizontalZoom
      );
    },

    /**
     * Zoooms the vertical axis in
     */
    zoomInVertical: function() {
      this.verticalZoomProperty.value = Util.clamp( this.verticalZoomProperty.value * this.verticalZoomScale,
        this.minVerticalZoom,
        this.maxVerticalZoom
      );
    },

    /**
     * Zooms the vertical axis out
     */
    zoomOutVertical: function() {
      this.verticalZoomProperty.value = Util.clamp( this.verticalZoomProperty.value / this.verticalZoomScale,
        this.minVerticalZoom,
        this.maxVerticalZoom
      );
    }

  } );

} );