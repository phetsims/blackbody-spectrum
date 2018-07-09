// Copyright 2014-2018, University of Colorado Boulder

//TODO break this up into smaller building blocks, see #19
/**
 * Graph Node responsible for positioning all of the graph elements
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
 */
define( function( require ) {
  'use strict';

  // modules
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ZoomableAxesView = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/ZoomableAxesView' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var WavelengthSpectrumNode = require( 'SCENERY_PHET/WavelengthSpectrumNode' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );
  var ZoomButton = require( 'SCENERY_PHET/buttons/ZoomButton' );
  var GraphValuesPointNode = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/GraphValuesPointNode' );

  // constants
  var ULTRAVIOLET_WAVELENGTH = 380; // in nm, max bounds for the uv part of the electromagnetic spectrum
  var VISIBLE_WAVELENGTH = 700; // in nm, max bounds for the visible part of the electromagnetic spectrum

  // strings
  var horizontalLabelWavelengthString = require( 'string!BLACKBODY_SPECTRUM/horizontalLabelWavelength' );
  var subtitleLabelString = require( 'string!BLACKBODY_SPECTRUM/subtitleLabel' );
  var verticalLabelSpectralRadianceString = require( 'string!BLACKBODY_SPECTRUM/verticalLabelSpectralRadiance' );

  /**
   * The node that handles keeping all of the graph elements together and working
   * @param {BlackbodySpectrumModel}  model - model for the entire screen
   * @param {Object} options
   * @constructor
   */
  function GraphDrawingNode( model, options ) {
    var self = this;

    options = _.extend( {
      axisBoundsLabelColor: 'yellow',
      axisLabelColor: 'rgb(0,235,235)',
      graphPathLineWidth: 5,
      mainGraphPathColor: 'red',
      savedGraphPathColor: '#996633',
      intensityPathFillColor: 'rgba(100,100,100,0.75)',
      zoomButtonIconRadius: 10
    }, options );

    Node.call( this );
    this.model = model;

    // @private The axes with the ticks and EM spectrum labels
    this.axes = new ZoomableAxesView( model );

    // Labels for the axes
    var verticalAxisLabelNode = new Text( verticalLabelSpectralRadianceString, {
      font: new PhetFont( 28 ),
      fill: options.axisLabelColor,
      rotation: -Math.PI / 2
    } );
    var horizontalAxisTopLabelNode = new Text( horizontalLabelWavelengthString, {
      font: new PhetFont( 32 ),
      fill: options.axisLabelColor
    } );
    var horizontalAxisBottomLabelNode = new Text( subtitleLabelString, {
      font: new PhetFont( 24 ),
      fill: options.axisLabelColor
    } );

    // @private Paths for the main graph and the saved curve
    this.mainGraph = new Path( null, {
      stroke: options.mainGraphPathColor,
      lineWidth: options.graphPathLineWidth,
      lineJoin: 'round'
    } );
    this.savedGraph = new Path( null, {
      stroke: options.savedGraphPathColor,
      lineWidth: options.graphPathLineWidth,
      lineJoin: 'round'
    } );

    // @private Path for intensity, area under the curve
    this.intensityPath = new Path( null, { fill: options.intensityPathFillColor } );
    model.intensityVisibleProperty.link( function( intensityVisible ) {
      self.intensityPath.visible = intensityVisible;
    } );

    // @private The text node that displays the saved temperature
    this.savedTemperatureTextNode = new Text( '?', {
      fill: options.savedGraphPathColor,
      font: new PhetFont( 22 )
    } );

    // Links saved graph visibility to whether there is a graph that is saved
    model.savedBodyProperty.link( function( savedBody ) {
      var hasSavedBody = savedBody !== null;
      self.savedGraph.visible = hasSavedBody;
      self.savedTemperatureTextNode.visible = hasSavedBody;
      self.updateGraphPaths();
    } );

    // @private The point node that can be dragged to find out graph values
    this.draggablePointNode = new GraphValuesPointNode( model.mainBody, this.axes );
    model.graphValuesVisibleProperty.link( function( graphValuesVisible ) {
      self.draggablePointNode.visible = graphValuesVisible;
    } );

    // @private Labels for axes bounds
    this.horizontalTickLabelZero = new Text( '0', { font: new PhetFont( 32 ), fill: options.axisBoundsLabelColor } );
    this.horizontalTickLabelMax = new Text( model.wavelengthMax / 1000, {
      font: new PhetFont( 32 ),
      fill: options.axisBoundsLabelColor
    } );
    this.verticalTickLabelMax = new Text( this.axes.verticalZoomProperty.value, {
      font: new PhetFont( 32 ),
      direction: 'rtl',
      fill: options.axisBoundsLabelColor
    } );

    // Zoom Buttons
    this.horizontalZoomInButton = new ZoomButton( { in: true, radius: options.zoomButtonIconRadius } );
    this.horizontalZoomOutButton = new ZoomButton( { in: false, radius: options.zoomButtonIconRadius } );
    this.verticalZoomInButton = new ZoomButton( { in: true, radius: options.zoomButtonIconRadius } );
    this.verticalZoomOutButton = new ZoomButton( { in: false, radius: options.zoomButtonIconRadius } );
    var horizontalZoomButtons = new Node( { children: [ self.horizontalZoomOutButton, self.horizontalZoomInButton ] } );
    var verticalZoomButtons = new Node( { children: [ self.verticalZoomOutButton, self.verticalZoomInButton ] } );

    // Expands the touch area for zoom buttons
    this.horizontalZoomInButton.touchArea = this.horizontalZoomInButton.localBounds.dilated( 5, 5 );
    this.horizontalZoomOutButton.touchArea = this.horizontalZoomOutButton.localBounds.dilated( 5, 5 );
    this.verticalZoomInButton.touchArea = this.verticalZoomInButton.localBounds.dilated( 5, 5 );
    this.verticalZoomOutButton.touchArea = this.verticalZoomOutButton.localBounds.dilated( 5, 5 );

    // Makes the zoom buttons change the axes to zoom in/out when pressed
    this.horizontalZoomInButton.addListener( function() { self.axes.zoomInHorizontal(); } );
    this.horizontalZoomOutButton.addListener( function() { self.axes.zoomOutHorizontal(); } );
    this.verticalZoomInButton.addListener( function() { self.axes.zoomInVertical(); } );
    this.verticalZoomOutButton.addListener( function() { self.axes.zoomOutVertical(); } );

    // Node for that displays the rainbow for the visible portion of the electromagnetic spectrum
    var infraredPosition = this.axes.wavelengthToViewX( VISIBLE_WAVELENGTH );
    var ultravioletPosition = this.axes.wavelengthToViewX( ULTRAVIOLET_WAVELENGTH );
    var spectrumWidth = infraredPosition - ultravioletPosition;
    this.wavelengthSpectrumNode = new WavelengthSpectrumNode( {
      size: new Dimension2( spectrumWidth, this.axes.verticalAxisLength ),
      minWavelength: ULTRAVIOLET_WAVELENGTH,
      maxWavelength: VISIBLE_WAVELENGTH,
      opacity: 0.9,
      left: ultravioletPosition + this.axes.left
    } );

    // Links the GraphDrawingNode to update whenever any tracked property changes
    function updateAllProcedure() { self.update(); }
    model.mainBody.temperatureProperty.link( updateAllProcedure );
    this.axes.horizontalZoomProperty.link( updateAllProcedure );
    this.axes.verticalZoomProperty.link( updateAllProcedure );

    // Adds children in rendering order
    this.addChild( this.wavelengthSpectrumNode );
    this.addChild( this.horizontalTickLabelZero );
    this.addChild( this.horizontalTickLabelMax );
    this.addChild( this.verticalTickLabelMax );
    this.addChild( verticalAxisLabelNode );
    this.addChild( horizontalAxisTopLabelNode );
    this.addChild( horizontalAxisBottomLabelNode );
    this.addChild( this.axes );
    this.addChild( horizontalZoomButtons );
    this.addChild( verticalZoomButtons );
    this.addChild( this.mainGraph );
    this.addChild( this.intensityPath );
    this.addChild( this.savedGraph );
    this.addChild( this.savedTemperatureTextNode );
    this.addChild( this.draggablePointNode );

    // Sets layout of graph node elements to be all ultimately relative to the axes
    this.horizontalTickLabelZero.top = this.axes.bottom;
    this.horizontalTickLabelZero.centerX = this.axes.left;
    this.horizontalTickLabelMax.top = this.axes.bottom;
    this.horizontalTickLabelMax.centerX = this.axes.right;
    this.verticalTickLabelMax.right = this.axes.left;
    this.verticalTickLabelMax.centerY = this.axes.top - 10;
    horizontalZoomButtons.left = this.axes.right - 45;
    horizontalZoomButtons.top = this.axes.bottom + 40;
    this.horizontalZoomInButton.left = this.horizontalZoomOutButton.right + 10;
    this.horizontalZoomInButton.centerY = this.horizontalZoomOutButton.centerY;
    verticalZoomButtons.right = this.axes.left - 60;
    verticalZoomButtons.bottom = this.axes.top + 35;
    this.verticalZoomInButton.centerX = this.verticalZoomOutButton.centerX;
    this.verticalZoomInButton.bottom = this.verticalZoomOutButton.top - 10;
    this.wavelengthSpectrumNode.bottom = this.axes.bottom;
    verticalAxisLabelNode.right = this.axes.left - 20;
    verticalAxisLabelNode.centerY = -this.axes.verticalAxisLength / 2;
    horizontalAxisTopLabelNode.top = this.axes.bottom + 20;
    horizontalAxisTopLabelNode.centerX = this.axes.centerX;
    horizontalAxisBottomLabelNode.top = horizontalAxisTopLabelNode.bottom + 5;
    horizontalAxisBottomLabelNode.centerX = this.axes.centerX;
  }

  blackbodySpectrum.register( 'GraphDrawingNode', GraphDrawingNode );

  return inherit( Node, GraphDrawingNode, {

    /**
     * Reset Properties associated with this Node
     * @public
     */
    reset: function() {
      this.axes.reset();
      this.draggablePointNode.reset();
    },

    /**
     * Gets the shape of a given BlackbodyBodyModel
     * @param {BlackbodyBodyModel} body
     * @private
     */
    shapeOfBody: function( body ) {
      var graphShape = new Shape();
      var radianceArray = body.coordinatesY;
      var numberPoints = radianceArray.length;
      var deltaWavelength = this.axes.horizontalAxisLength / ( numberPoints - 1 );
      graphShape.moveTo( 0, this.axes.spectralRadianceToViewY( radianceArray[ 0 ] ) );
      for ( var i = 1; i < radianceArray.length; i++ ) {
        graphShape.lineTo( deltaWavelength * i, this.axes.spectralRadianceToViewY( radianceArray[ i ] ) );
      }
      return graphShape;
    },

    /**
     * Updates the saved and main graph paths as well as their corresponding text boxes or intensity paths
     */
    updateGraphPaths: function() {
      // Updates the main graph
      var updatedGraphShape = this.shapeOfBody( this.model.mainBody );
      this.mainGraph.shape = updatedGraphShape;

      // Easiest way to implement intensity shape is to copy graph shape and bring down to x-axis
      this.intensityPath.shape = updatedGraphShape.copy();
      var newPoint = new Vector2( this.axes.horizontalAxisLength, 0 );
      if ( this.intensityPath.shape.getLastPoint().minus( newPoint ).magnitude() > 0 ) {
        this.intensityPath.shape.lineToPoint( newPoint );
      }

      // Updates the saved graph
      if ( this.model.savedBodyProperty.value === null ) {
        return;
      }
      this.savedGraph.shape = this.shapeOfBody( this.model.savedBodyProperty.value );

      // Updates the saved graph text box
      this.savedTemperatureTextNode.text = Util.toFixed( this.model.savedBodyProperty.value.temperatureProperty.value, 0 ) + 'K';
      var peakWavelength = this.model.savedBodyProperty.value.peakWavelength;
      var radiancePeak = this.axes.spectralRadianceToViewY( this.model.savedBodyProperty.value.getIntensityRadiation( peakWavelength ) );
      var verticalTextPlacement = radiancePeak / 3;
      if ( verticalTextPlacement > -20 ) {
        verticalTextPlacement = -20;
      } else if ( verticalTextPlacement < -this.axes.verticalAxisLength + this.savedTemperatureTextNode.height ) {
        verticalTextPlacement = -this.axes.verticalAxisLength + this.savedTemperatureTextNode.height;
      }
      var horizontalTextPlacement = this.axes.wavelengthToViewX( peakWavelength ) + 20;
      if ( horizontalTextPlacement + this.savedTemperatureTextNode.width / 2 > this.axes.horizontalAxisLength ) {
        horizontalTextPlacement = this.axes.horizontalAxisLength - this.savedTemperatureTextNode.width / 2;
      }
      this.savedTemperatureTextNode.bottom = verticalTextPlacement;
      this.savedTemperatureTextNode.centerX = horizontalTextPlacement;
    },

    /**
     * A method that updates the visible spectrum rainbow node to be in the correct position relative to the axes
     * @private
     */
    updateVisibleSpectrumNode: function() {
      var infraredPosition = this.axes.wavelengthToViewX( VISIBLE_WAVELENGTH );
      var ultravioletPosition = this.axes.wavelengthToViewX( ULTRAVIOLET_WAVELENGTH );
      var spectrumWidth = infraredPosition - ultravioletPosition;
      this.wavelengthSpectrumNode.left = ultravioletPosition;
      this.wavelengthSpectrumNode.scale( new Vector2( spectrumWidth / this.wavelengthSpectrumNode.width, 1 ) );
    },

    /**
     * Updates everything in the graph drawing node
     */
    update: function() {
      var verticalZoom = this.axes.verticalZoomProperty.value;
      var horizontalZoom = this.axes.horizontalZoomProperty.value;
      this.updateGraphPaths();
      this.updateVisibleSpectrumNode();
      this.draggablePointNode.update();
      this.horizontalTickLabelMax.text = this.model.wavelengthMax / 1000; // Conversion from nm to microns
      this.verticalTickLabelMax.text = Util.toFixed( verticalZoom, 0 );
      this.horizontalZoomInButton.enabled = horizontalZoom > this.axes.minHorizontalZoom;
      this.horizontalZoomOutButton.enabled = horizontalZoom < this.axes.maxHorizontalZoom;
      this.verticalZoomInButton.enabled = verticalZoom > this.axes.minVerticalZoom;
      this.verticalZoomOutButton.enabled = verticalZoom < this.axes.maxVerticalZoom;
    }

  } );
} );