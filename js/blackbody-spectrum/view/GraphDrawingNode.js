// Copyright 2014-2018, University of Colorado Boulder

/**
 * Graph Node responsible for positioning all of the graph elements
 * Handles or controls the majority of the over-arching graph logic
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
 */
define( function( require ) {
  'use strict';

  // modules
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var ColorConstants = require( 'SUN/ColorConstants' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ZoomableAxesView = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/ZoomableAxesView' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var WavelengthSpectrumNode = require( 'SCENERY_PHET/WavelengthSpectrumNode' );
  var Vector2 = require( 'DOT/Vector2' );
  var ZoomButton = require( 'SCENERY_PHET/buttons/ZoomButton' );
  var GraphValuesPointNode = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/GraphValuesPointNode' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );

  // constants
  var ULTRAVIOLET_WAVELENGTH = 380; // in nm, max bounds for the uv part of the electromagnetic spectrum
  var VISIBLE_WAVELENGTH = 700; // in nm, max bounds for the visible part of the electromagnetic spectrum
  var GRAPH_NUMBER_POINTS = 300; // number of points blackbody curve is evaluated at
  var ZOOM_BUTTON_ICON_RADIUS = 8; // size of zoom buttons

  /**
   * The node that handles keeping all of the graph elements together and working
   * @param {BlackbodySpectrumModel}  model - model for the entire screen
   * @param {Object} options
   * @constructor
   */
  function GraphDrawingNode( model, options ) {
    var self = this;

    options = _.extend( {
      savedGraphPathColor: 'gray',
      intensityPathFillColor: 'rgba(100,100,100,0.75)',
      graphPathOptions: {
        stroke: PhetColorScheme.RED_COLORBLIND,
        lineWidth: 5,
        lineJoin: 'round',
        lineCap: 'round'
      }
    }, options );

    Node.call( this );
    this.model = model;

    // @private The axes with the ticks and EM spectrum labels
    this.axes = new ZoomableAxesView( model );

    // @private paths for the main and saved graphs
    this.mainGraph = new Path( null, options.graphPathOptions );
    this.primarySavedGraph = new Path( null, _.extend( options.graphPathOptions, {
      stroke: options.savedGraphPathColor
    } ) );
    this.secondarySavedGraph = new Path( null, _.extend( options.graphPathOptions, {
      stroke: options.savedGraphPathColor,
      lineDash: [ 5, 5 ],
      lineCap: 'butt'
    } ) );

    // @private Path for intensity, area under the curve
    this.intensityPath = new Path( null, { fill: options.intensityPathFillColor } );
    model.intensityVisibleProperty.link( function( intensityVisible ) {
      self.intensityPath.visible = intensityVisible;
    } );

    // @private The point node that can be dragged to find out graph values
    this.draggablePointNode = new GraphValuesPointNode( model.mainBody, this.axes );
    model.graphValuesVisibleProperty.link( function( graphValuesVisible ) {

      // Node will move back to top of graph on visibility change
      self.draggablePointNode.wavelengthProperty.value = self.model.mainBody.peakWavelength;
      self.draggablePointNode.visible = graphValuesVisible;
    } );

    // Zoom Buttons
    this.horizontalZoomInButton = createZoomButton( true, function() { self.axes.zoomInHorizontal(); } );
    this.horizontalZoomOutButton = createZoomButton( false, function() { self.axes.zoomOutHorizontal(); } );
    this.verticalZoomInButton = createZoomButton( true, function() { self.axes.zoomInVertical(); } );
    this.verticalZoomOutButton = createZoomButton( false, function() { self.axes.zoomOutVertical(); } );
    var horizontalZoomButtons = new Node( { children: [ self.horizontalZoomOutButton, self.horizontalZoomInButton ] } );
    var verticalZoomButtons = new Node( { children: [ self.verticalZoomOutButton, self.verticalZoomInButton ] } );

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
    this.model.savedBodies.lengthProperty.link( updateAllProcedure );

    // Adds children in rendering order
    this.addChild( this.wavelengthSpectrumNode );
    this.addChild( this.axes );
    this.addChild( horizontalZoomButtons );
    this.addChild( verticalZoomButtons );
    this.addChild( this.mainGraph );
    this.addChild( this.primarySavedGraph );
    this.addChild( this.secondarySavedGraph );
    this.addChild( this.intensityPath );
    this.addChild( this.draggablePointNode );

    // Sets layout of graph node elements to be all ultimately relative to the axes
    horizontalZoomButtons.left = this.axes.right - 52;
    horizontalZoomButtons.bottom = this.axes.bottom - 10;
    this.horizontalZoomInButton.left = this.horizontalZoomOutButton.right + 10;
    this.horizontalZoomInButton.centerY = this.horizontalZoomOutButton.centerY;
    verticalZoomButtons.left = this.axes.left - 5;
    verticalZoomButtons.bottom = this.axes.top + 58;
    this.verticalZoomInButton.centerX = this.verticalZoomOutButton.centerX;
    this.verticalZoomInButton.bottom = this.verticalZoomOutButton.top - 10;
    this.wavelengthSpectrumNode.top = this.axes.top + 45;
  }

  // Helper function for creating zoom buttons with repeated options
  function createZoomButton( type, listener ) {
    return new ZoomButton( {
      in: type,
      radius: ZOOM_BUTTON_ICON_RADIUS,
      touchAreaXDilation: 5,
      touchAreaYDilation: 5,
      baseColor: ColorConstants.LIGHT_BLUE,
      listener: listener
    } );
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
      var deltaWavelength = this.model.wavelengthMax / ( GRAPH_NUMBER_POINTS - 1 );
      var pointsXOffset = this.axes.horizontalAxisLength / ( GRAPH_NUMBER_POINTS - 1 );
      graphShape.moveTo( 0, 0 );
      for ( var i = 1; i < GRAPH_NUMBER_POINTS; i++ ) {
        graphShape.lineTo(
          pointsXOffset * i,
          this.axes.spectralRadianceToViewY( body.getSpectralRadianceAt( deltaWavelength * i ) )
        );
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

      // Updates the saved graph(s)
      var numberOfSavedBodies = this.model.savedBodies.length;
      this.primarySavedGraph.shape = null;
      this.secondarySavedGraph.shape = null;
      if ( numberOfSavedBodies > 0 ) {
        this.primarySavedGraph.shape = this.shapeOfBody( this.model.savedBodies.get( numberOfSavedBodies - 1 ) );
      }
      if ( numberOfSavedBodies === 2 ) {
        this.secondarySavedGraph.shape = this.shapeOfBody( this.model.savedBodies.get( 0 ) );
      }
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
      this.axes.update();
      this.horizontalZoomInButton.enabled = horizontalZoom > this.axes.minHorizontalZoom;
      this.horizontalZoomOutButton.enabled = horizontalZoom < this.axes.maxHorizontalZoom;
      this.verticalZoomInButton.enabled = verticalZoom > this.axes.minVerticalZoom;
      this.verticalZoomOutButton.enabled = verticalZoom < this.axes.maxVerticalZoom;
    }

  } );
} );