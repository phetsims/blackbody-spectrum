// Copyright 2014-2019, University of Colorado Boulder

/**
 * Graph Node responsible for positioning all of the graph elements
 * Handles or controls the majority of the over-arching graph logic
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
 */
define( require => {
  'use strict';

  // modules
  const BlackbodyConstants = require( 'BLACKBODY_SPECTRUM/BlackbodyConstants' );
  const blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  const ColorConstants = require( 'SUN/ColorConstants' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const GraphValuesPointNode = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/GraphValuesPointNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  const Shape = require( 'KITE/Shape' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Vector2 = require( 'DOT/Vector2' );
  const WavelengthSpectrumNode = require( 'SCENERY_PHET/WavelengthSpectrumNode' );
  const ZoomableAxesView = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/ZoomableAxesView' );
  const ZoomButton = require( 'SCENERY_PHET/buttons/ZoomButton' );

  // constants
  const GRAPH_NUMBER_POINTS = 300; // number of points blackbody curve is evaluated at
  const ZOOM_BUTTON_ICON_RADIUS = 8; // size of zoom buttons
  const ZOOM_BUTTON_SPACING = 10; // spacing between + and - zoom buttons
  const ZOOM_BUTTON_AXES_MARGIN = 35; // spacing between zoom buttons and axes
  const DEFAULT_LINE_WIDTH = 5; // regular line width for graph paths
  const OVERLAID_LINE_WIDTH = 3; // line width when saved graphs are initially created

  class GraphDrawingNode extends Node {

    /**
     * The node that handles keeping all of the graph elements together and working
     * @param {BlackbodySpectrumModel} model - model for the entire screen
     * @param {Object} options
     */
    constructor( model, options ) {

      options = _.extend( {
        savedGraphPathColor: 'gray',
        intensityPathFillColor: 'rgba(100,100,100,0.75)',
        graphPathOptions: {
          stroke: PhetColorScheme.RED_COLORBLIND,
          lineWidth: DEFAULT_LINE_WIDTH,
          lineJoin: 'round',
          lineCap: 'round'
        },
        tandem: Tandem.required
      }, options );

      super();

      // @private
      this.model = model;

      // @private The axes with the ticks and EM spectrum labels
      this.axes = new ZoomableAxesView( model, { tandem: options.tandem.createTandem( 'axesView' ) } );

      // @private Intermediary nodes containing elements within axes to allow for easier clipping
      this.innerGraphUnderAxes = new Node();
      this.innerGraphOverAxes = new Node();
      this.innerGraphUnderAxes.clipArea = this.axes.clipShape;
      this.innerGraphOverAxes.clipArea = this.axes.clipShape;

      // @private Paths for the main and saved graphs
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
      model.intensityVisibleProperty.link( intensityVisible => {
        this.intensityPath.visible = intensityVisible;
      } );

      // @private The point node that can be dragged to find out graph values
      this.draggablePointNode = new GraphValuesPointNode( model.mainBody, this.axes, {
        tandem: options.tandem.createTandem( 'graphValuesPointNode' )
      } );
      model.graphValuesVisibleProperty.link( graphValuesVisible => {

        // Node will move back to top of graph on visibility change
        this.draggablePointNode.wavelengthProperty.value = this.model.mainBody.peakWavelength;
        this.draggablePointNode.visible = graphValuesVisible;
      } );

      // Node for that displays the rainbow for the visible portion of the electromagnetic spectrum
      const infraredPosition = this.axes.wavelengthToViewX( BlackbodyConstants.visibleWavelength );
      const ultravioletPosition = this.axes.wavelengthToViewX( BlackbodyConstants.ultravioletWavelength );
      const spectrumWidth = infraredPosition - ultravioletPosition;

      // @private Color spectrum for visible light
      this.wavelengthSpectrumNode = new WavelengthSpectrumNode( {
        size: new Dimension2( spectrumWidth, this.axes.verticalAxisLength ),
        opacity: 0.9,
        tandem: options.tandem.createTandem( 'wavelengthSpectrumNode' )
      } );

      this.innerGraphUnderAxes.addChild( this.wavelengthSpectrumNode );
      this.innerGraphUnderAxes.addChild( this.intensityPath );
      this.innerGraphOverAxes.addChild( this.mainGraph );
      this.innerGraphOverAxes.addChild( this.primarySavedGraph );
      this.innerGraphOverAxes.addChild( this.secondarySavedGraph );

      // @private Zoom Buttons
      this.horizontalZoomInButton = createZoomButton(
        true,
        () => { this.axes.zoomInHorizontal(); },
        options.tandem.createTandem( 'horizontalZoomInButton' )
      );
      this.horizontalZoomOutButton = createZoomButton(
        false,
        () => { this.axes.zoomOutHorizontal(); },
        options.tandem.createTandem( 'horizontalZoomOutButton' )
      );
      this.verticalZoomInButton = createZoomButton(
        true,
        () => { this.axes.zoomInVertical(); },
        options.tandem.createTandem( 'verticalZoomInButton' )
      );
      this.verticalZoomOutButton = createZoomButton(
        false,
        () => { this.axes.zoomOutVertical(); },
        options.tandem.createTandem( 'verticalZoomOutButton' )
      );
      const horizontalZoomButtons = new Node( { children: [ this.horizontalZoomOutButton, this.horizontalZoomInButton ] } );
      const verticalZoomButtons = new Node( { children: [ this.verticalZoomOutButton, this.verticalZoomInButton ] } );

      // Links different parts of GraphDrawingNode to update whenever specified tracked Properties change
      const updateMainGraphAndLayout = () => {
        this.update();
        this.moveMainGraphToFront();
      };
      const updateSavedGraphAndLayout = () => {
        this.updateSavedGraphPaths();
        this.moveSavedGraphToFront();
      };
      const updateAllGraphs = () => {
        this.update();
        this.updateSavedGraphPaths();
      };
      model.mainBody.temperatureProperty.link( updateMainGraphAndLayout );
      model.savedBodies.lengthProperty.link( updateSavedGraphAndLayout );
      this.axes.horizontalZoomProperty.link( updateAllGraphs );
      this.axes.verticalZoomProperty.link( updateAllGraphs );

      // Sets layout of graph node elements to be all ultimately relative to the axes
      const axesPath = this.axes.axesPath;
      this.horizontalZoomInButton.left = this.horizontalZoomOutButton.right + ZOOM_BUTTON_SPACING;
      this.horizontalZoomInButton.centerY = this.horizontalZoomOutButton.centerY;
      horizontalZoomButtons.centerX = axesPath.right + ZOOM_BUTTON_ICON_RADIUS;
      horizontalZoomButtons.top = axesPath.bottom + ZOOM_BUTTON_AXES_MARGIN;
      this.verticalZoomInButton.centerY = this.verticalZoomOutButton.centerY;
      this.verticalZoomInButton.left = this.verticalZoomOutButton.right + ZOOM_BUTTON_SPACING;
      verticalZoomButtons.centerX = axesPath.left - ZOOM_BUTTON_ICON_RADIUS * 2;
      verticalZoomButtons.bottom = axesPath.top - ZOOM_BUTTON_AXES_MARGIN;
      this.wavelengthSpectrumNode.centerY = axesPath.centerY;
      this.wavelengthSpectrumNode.left = ultravioletPosition;

      // Adds children in rendering order
      this.addChild( this.innerGraphUnderAxes );
      this.addChild( this.axes );
      this.addChild( horizontalZoomButtons );
      this.addChild( verticalZoomButtons );
      this.addChild( this.innerGraphOverAxes );
      this.addChild( this.draggablePointNode );
    }

    /**
     * Reset Properties associated with this Node
     * @public
     */
    reset() {
      this.axes.reset();
      this.draggablePointNode.reset();
    }

    /**
     * Gets the shape of a given BlackbodyBodyModel
     * @param {BlackbodyBodyModel} body
     * @returns {Shape}
     * @private
     */
    shapeOfBody( body ) {
      const graphShape = new Shape();
      const deltaWavelength = this.model.wavelengthMax / ( GRAPH_NUMBER_POINTS - 1 );
      const pointsXOffset = this.axes.horizontalAxisLength / ( GRAPH_NUMBER_POINTS - 1 );
      const yCutoff = this.axes.verticalAxisLength + this.mainGraph.lineWidth;
      const peakWavelength = body.peakWavelength;
      let findingPeak = true;
      graphShape.moveTo( 0, 0 );
      for ( let i = 1; i < GRAPH_NUMBER_POINTS; i++ ) {
        if ( deltaWavelength * i > peakWavelength && findingPeak ) {

          // Force peak wavelength point to be added
          const yMax = this.axes.spectralRadianceToViewY( body.getSpectralRadianceAt( peakWavelength ) );
          graphShape.lineTo( this.axes.wavelengthToViewX( peakWavelength ), yMax < -yCutoff ? -yCutoff : yMax );
          findingPeak = false;
        }
        const y = this.axes.spectralRadianceToViewY( body.getSpectralRadianceAt( deltaWavelength * i ) );
        graphShape.lineTo( pointsXOffset * i, y < -yCutoff ? -yCutoff : y );
      }
      return graphShape;
    }

    /**
     * Updates the saved and main graph paths as well as their corresponding text boxes or intensity paths
     * @private
     */
    updateGraphPaths() {
      // Updates the main graph
      const updatedGraphShape = this.shapeOfBody( this.model.mainBody );
      this.mainGraph.shape = updatedGraphShape;

      // Easiest way to implement intensity shape is to copy graph shape and bring down to x-axis
      this.intensityPath.shape = updatedGraphShape.copy();
      const newPoint = new Vector2( this.axes.horizontalAxisLength, 0 );
      if ( this.intensityPath.shape.getLastPoint().minus( newPoint ).magnitude > 0 ) {
        this.intensityPath.shape.lineToPoint( newPoint );
      }
    }

    /**
     * Move the main graph to the front of the scene
     * @private
     */
    moveMainGraphToFront() {
      this.mainGraph.moveToFront();
      this.draggablePointNode.moveToFront();

      // Reset saved graphs back to default width
      this.primarySavedGraph.lineWidth = DEFAULT_LINE_WIDTH;
      this.secondarySavedGraph.lineWidth = DEFAULT_LINE_WIDTH;
    }

    /**
     * Updates the saved graph paths
     * @private
     */
    updateSavedGraphPaths() {
      // Updates the saved graph(s)
      const numberOfSavedBodies = this.model.savedBodies.length;
      this.primarySavedGraph.shape = null;
      this.secondarySavedGraph.shape = null;
      if ( numberOfSavedBodies > 0 ) {
        this.primarySavedGraph.shape = this.shapeOfBody( this.model.savedBodies.get( numberOfSavedBodies - 1 ) );
        if ( numberOfSavedBodies === 2 ) {
          this.secondarySavedGraph.shape = this.shapeOfBody( this.model.savedBodies.get( 0 ) );
        }
      }
    }

    /**
     * Move the latest saved graph to the front of the scene
     * @private
     */
    moveSavedGraphToFront() {
      this.primarySavedGraph.moveToFront();

      // Also set newly created graph to smaller size to be visible in front of main graph
      this.primarySavedGraph.lineWidth = OVERLAID_LINE_WIDTH;
    }

    /**
     * A method that updates the visible spectrum rainbow node to be in the correct position relative to the axes
     * @private
     */
    updateVisibleSpectrumNode() {
      const infraredPosition = this.axes.wavelengthToViewX( BlackbodyConstants.visibleWavelength );
      const ultravioletPosition = this.axes.wavelengthToViewX( BlackbodyConstants.ultravioletWavelength );
      const spectrumWidth = infraredPosition - ultravioletPosition;
      this.wavelengthSpectrumNode.left = ultravioletPosition;
      this.wavelengthSpectrumNode.scale( new Vector2( spectrumWidth / this.wavelengthSpectrumNode.width, 1 ) );
    }

    /**
     * Updates everything in the graph drawing node
     * @private
     */
    update() {
      const verticalZoom = this.axes.verticalZoomProperty.value;
      const horizontalZoom = this.axes.horizontalZoomProperty.value;
      this.updateGraphPaths();
      this.draggablePointNode.update();
      this.axes.update();
      this.updateVisibleSpectrumNode();
      this.horizontalZoomInButton.enabled = horizontalZoom > BlackbodyConstants.minHorizontalZoom;
      this.horizontalZoomOutButton.enabled = horizontalZoom < BlackbodyConstants.maxHorizontalZoom;
      this.verticalZoomInButton.enabled = verticalZoom > BlackbodyConstants.minVerticalZoom;
      this.verticalZoomOutButton.enabled = verticalZoom < BlackbodyConstants.maxVerticalZoom;
    }

  }

  /**
   * Helper function for creating zoom buttons with repeated options
   * Template for new ZoomButton objects
   * @param {boolean} type - indicates whether button is for zoom in
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

  return blackbodySpectrum.register( 'GraphDrawingNode', GraphDrawingNode );
} );