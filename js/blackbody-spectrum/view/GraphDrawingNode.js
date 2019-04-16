// Copyright 2014-2019, University of Colorado Boulder

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
  var BlackbodyConstants = require( 'BLACKBODY_SPECTRUM/BlackbodyConstants' );
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var ColorConstants = require( 'SUN/ColorConstants' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var GraphValuesPointNode = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/GraphValuesPointNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  var Shape = require( 'KITE/Shape' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Vector2 = require( 'DOT/Vector2' );
  var WavelengthSpectrumNode = require( 'SCENERY_PHET/WavelengthSpectrumNode' );
  var ZoomableAxesView = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/ZoomableAxesView' );
  var ZoomButton = require( 'SCENERY_PHET/buttons/ZoomButton' );

  // constants
  var GRAPH_NUMBER_POINTS = 300; // number of points blackbody curve is evaluated at
  var ZOOM_BUTTON_ICON_RADIUS = 8; // size of zoom buttons
  var ZOOM_BUTTON_SPACING = 10; // spacing between + and - zoom buttons
  var ZOOM_BUTTON_AXES_MARGIN = 10; // spacing between zoom buttons and axes

  /**
   * The node that handles keeping all of the graph elements together and working
   * @param {BlackbodySpectrumModel} model - model for the entire screen
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
      },
      tandem: Tandem.required
    }, options );

    Node.call( this );
    // REVIEW: Needs visibility annotation
    this.model = model;

    // @private The axes with the ticks and EM spectrum labels
    this.axes = new ZoomableAxesView( model );

    // @private paths for the main and saved graphs
    this.mainGraph = new Path( null, options.graphPathOptions );
    this.primarySavedGraph = new Path( null, _.extend( options.graphPathOptions, {
      stroke: options.savedGraphPathColor,
      lineWidth: 4
    } ) );
    this.secondarySavedGraph = new Path( null, _.extend( options.graphPathOptions, {
      stroke: options.savedGraphPathColor,
      lineWidth: 4,
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
    // REVIEW: Needs visibility annotation
    this.horizontalZoomInButton = createZoomButton(
      true,
      function() { self.axes.zoomInHorizontal(); },
      options.tandem.createTandem( 'horizontalZoomInButton' )
    );
    this.horizontalZoomOutButton = createZoomButton(
      false,
      function() { self.axes.zoomOutHorizontal(); },
      options.tandem.createTandem( 'horizontalZoomOutButton' )
    );
    this.verticalZoomInButton = createZoomButton(
      true,
      function() { self.axes.zoomInVertical(); },
      options.tandem.createTandem( 'verticalZoomInButton' )
    );
    this.verticalZoomOutButton = createZoomButton(
      false,
      function() { self.axes.zoomOutVertical(); },
      options.tandem.createTandem( 'verticalZoomOutButton' )
    );
    var horizontalZoomButtons = new Node( { children: [ self.horizontalZoomOutButton, self.horizontalZoomInButton ] } );
    var verticalZoomButtons = new Node( { children: [ self.verticalZoomOutButton, self.verticalZoomInButton ] } );

    // Node for that displays the rainbow for the visible portion of the electromagnetic spectrum
    var infraredPosition = this.axes.wavelengthToViewX( BlackbodyConstants.visibleWavelength );
    var ultravioletPosition = this.axes.wavelengthToViewX( BlackbodyConstants.ultravioletWavelength );
    var spectrumWidth = infraredPosition - ultravioletPosition;
    // REVIEW: Needs visibility annotation
    this.wavelengthSpectrumNode = new WavelengthSpectrumNode( {
      size: new Dimension2( spectrumWidth, this.axes.verticalAxisLength ),
      minWavelength: BlackbodyConstants.ultravioletWavelength,
      maxWavelength: BlackbodyConstants.visibleWavelength,
      opacity: 0.9
    } );

    // Links the GraphDrawingNode to update whenever any tracked Property changes
    function updateAllProcedure() { self.update(); }

    model.mainBody.temperatureProperty.link( updateAllProcedure );
    this.axes.horizontalZoomProperty.link( updateAllProcedure );
    this.axes.verticalZoomProperty.link( updateAllProcedure );
    this.model.savedBodies.lengthProperty.link( updateAllProcedure );

    // Sets layout of graph node elements to be all ultimately relative to the axes
    horizontalZoomButtons.left = this.axes.right - 52;
    horizontalZoomButtons.bottom = this.axes.bottom - ZOOM_BUTTON_AXES_MARGIN;
    this.horizontalZoomInButton.left = this.horizontalZoomOutButton.right + ZOOM_BUTTON_SPACING;
    this.horizontalZoomInButton.centerY = this.horizontalZoomOutButton.centerY;
    verticalZoomButtons.left = this.axes.left + 30;
    verticalZoomButtons.bottom = this.axes.top - ZOOM_BUTTON_AXES_MARGIN;
    this.verticalZoomInButton.centerY = this.verticalZoomOutButton.centerY;
    this.verticalZoomInButton.left = this.verticalZoomOutButton.right + ZOOM_BUTTON_SPACING;
    this.wavelengthSpectrumNode.top = this.axes.top + ZOOM_BUTTON_AXES_MARGIN + ZOOM_BUTTON_ICON_RADIUS;
    this.wavelengthSpectrumNode.left = ultravioletPosition;

    // Adds children in rendering order
    this.addChild( this.wavelengthSpectrumNode );
    this.addChild( this.intensityPath );
    this.addChild( this.axes );
    this.addChild( horizontalZoomButtons );
    this.addChild( verticalZoomButtons );
    this.addChild( this.mainGraph );
    this.addChild( this.primarySavedGraph );
    this.addChild( this.secondarySavedGraph );
    this.addChild( this.draggablePointNode );
  }

  // Helper function for creating zoom buttons with repeated options
  /**
   * Template for new ZoomButton objects
   * @param {bool} type - indicates whether button is for zoom in
   * @param {function} listener
   * @returns {ZoomButton}
   * @private
   */
  function createZoomButton( type, listener, tandem ) {
    return new ZoomButton( {
      in: type,
      radius: ZOOM_BUTTON_ICON_RADIUS,
      touchAreaXDilation: 5,
      touchAreaYDilation: 5,
      baseColor: ColorConstants.LIGHT_BLUE,
      listener: listener,
      tandem: tandem
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
     * @returns {Shape}
     * @private
     */
    shapeOfBody: function( body ) {
      var graphShape = new Shape();
      var deltaWavelength = this.model.wavelengthMax / ( GRAPH_NUMBER_POINTS - 1 );
      var pointsXOffset = this.axes.horizontalAxisLength / ( GRAPH_NUMBER_POINTS - 1 );
      var yCutoff = this.axes.verticalAxisLength + 1;
      var peakWavelength = body.peakWavelength;
      var findingPeak = true;
      graphShape.moveTo( 0, 0 );
      for ( var i = 1; i < GRAPH_NUMBER_POINTS; i++ ) {
        if ( deltaWavelength * i > peakWavelength && findingPeak ) {

          // Force peak wavelength point to be added
          var yMax = this.axes.spectralRadianceToViewY( body.getSpectralRadianceAt( peakWavelength ) );
          graphShape.lineTo( this.axes.wavelengthToViewX( peakWavelength ), yMax < -yCutoff ? -yCutoff : yMax );
          findingPeak = false;
        }
        var y = this.axes.spectralRadianceToViewY( body.getSpectralRadianceAt( deltaWavelength * i ) );
        graphShape.lineTo( pointsXOffset * i, y < -yCutoff ? -yCutoff : y );
      }
      return graphShape;
    },

    /**
     * Updates the saved and main graph paths as well as their corresponding text boxes or intensity paths
     * @private
     */
    updateGraphPaths: function() {
      // Updates the main graph
      var updatedGraphShape = this.shapeOfBody( this.model.mainBody );
      this.mainGraph.shape = updatedGraphShape;

      // Easiest way to implement intensity shape is to copy graph shape and bring down to x-axis
      this.intensityPath.shape = updatedGraphShape.copy();
      var newPoint = new Vector2( this.axes.horizontalAxisLength, 0 );
      if ( this.intensityPath.shape.getLastPoint().minus( newPoint ).magnitude > 0 ) {
        this.intensityPath.shape.lineToPoint( newPoint );
      }

      // Clips the paths to the axes bounds, pushed shape down 1 pixel to prevent performance degradation when clipping
      // at low temperatures
      var clipShape = Shape.rectangle( 0, 1, this.axes.horizontalAxisLength, -this.axes.verticalAxisLength );
      this.mainGraph.shape = this.mainGraph.shape.shapeClip( clipShape );

      // Updates the saved graph(s)
      var numberOfSavedBodies = this.model.savedBodies.length;
      this.primarySavedGraph.shape = null;
      this.secondarySavedGraph.shape = null;
      if ( numberOfSavedBodies > 0 ) {
        this.primarySavedGraph.shape =
          this.shapeOfBody( this.model.savedBodies.get( numberOfSavedBodies - 1 ) ).shapeClip( clipShape );
      }
      if ( numberOfSavedBodies === 2 ) {
        this.secondarySavedGraph.shape = this.shapeOfBody( this.model.savedBodies.get( 0 ) ).shapeClip( clipShape );
      }
    },

    /**
     * A method that updates the visible spectrum rainbow node to be in the correct position relative to the axes
     * @private
     */
    updateVisibleSpectrumNode: function() {
      var infraredPosition = this.axes.wavelengthToViewX( BlackbodyConstants.visibleWavelength );
      var ultravioletPosition = this.axes.wavelengthToViewX( BlackbodyConstants.ultravioletWavelength );
      var spectrumWidth = infraredPosition - ultravioletPosition;
      this.wavelengthSpectrumNode.left = ultravioletPosition;
      this.wavelengthSpectrumNode.scale( new Vector2( spectrumWidth / this.wavelengthSpectrumNode.width, 1 ) );
    },

    /**
     * Updates everything in the graph drawing node
     * REVIEW: Needs visibility annotation
     */
    update: function() {
      var verticalZoom = this.axes.verticalZoomProperty.value;
      var horizontalZoom = this.axes.horizontalZoomProperty.value;
      this.updateGraphPaths();
      this.updateVisibleSpectrumNode();
      this.draggablePointNode.update();
      this.axes.update();
      this.horizontalZoomInButton.enabled = horizontalZoom > BlackbodyConstants.minHorizontalZoom;
      this.horizontalZoomOutButton.enabled = horizontalZoom < BlackbodyConstants.maxHorizontalZoom;
      this.verticalZoomInButton.enabled = verticalZoom > BlackbodyConstants.minVerticalZoom;
      this.verticalZoomOutButton.enabled = verticalZoom < BlackbodyConstants.maxVerticalZoom;
    }

  } );
} );