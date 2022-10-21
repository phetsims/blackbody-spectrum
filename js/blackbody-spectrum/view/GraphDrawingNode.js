// Copyright 2014-2022, University of Colorado Boulder

/**
 * Graph Node responsible for positioning all of the graph elements
 * Handles or controls the majority of the over-arching graph logic
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
 * @author Arnab Purkayastha
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import MagnifyingGlassZoomButtonGroup from '../../../../scenery-phet/js/MagnifyingGlassZoomButtonGroup.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import WavelengthSpectrumNode from '../../../../scenery-phet/js/WavelengthSpectrumNode.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import ColorConstants from '../../../../sun/js/ColorConstants.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BlackbodyConstants from '../../BlackbodyConstants.js';
import blackbodySpectrum from '../../blackbodySpectrum.js';
import GraphValuesPointNode from './GraphValuesPointNode.js';
import ZoomableAxesView from './ZoomableAxesView.js';

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
   * @param {Object} [options]
   */
  constructor( model, options ) {

    options = merge( {
      savedGraphPathColor: 'gray',
      intensityPathFillColor: 'rgba(100,100,100,0.75)',
      graphPathOptions: {
        stroke: PhetColorScheme.RED_COLORBLIND,
        lineWidth: DEFAULT_LINE_WIDTH,
        lineJoin: 'round',
        lineCap: 'round'
      },
      tandem: Tandem.REQUIRED
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
    this.primarySavedGraph = new Path( null, merge( options.graphPathOptions, {
      stroke: options.savedGraphPathColor
    } ) );
    this.secondarySavedGraph = new Path( null, merge( options.graphPathOptions, {
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

    // @private {MagnifyingGlassZoomButtonGroup} - horizontal zoom buttons
    const horizontalZoomButtonGroup = new MagnifyingGlassZoomButtonGroup( this.axes.horizontalZoomProperty, {
      applyZoomIn: zoom => zoom / this.axes.horizontalZoomScale,
      applyZoomOut: zoom => zoom * this.axes.horizontalZoomScale,
      spacing: ZOOM_BUTTON_SPACING,
      buttonOptions: {
        baseColor: ColorConstants.LIGHT_BLUE,
        touchAreaXDilation: 5,
        touchAreaYDilation: 5
      },
      magnifyingGlassNodeOptions: {
        glassRadius: ZOOM_BUTTON_ICON_RADIUS
      },
      tandem: options.tandem.createTandem( 'horizontalZoomButtonGroup' )
    } );

    // @private {MagnifyingGlassZoomButtonGroup} - vertical zoom buttons
    const verticalZoomButtonGroup = new MagnifyingGlassZoomButtonGroup( this.axes.verticalZoomProperty, {
      applyZoomIn: zoom => zoom / this.axes.verticalZoomScale,
      applyZoomOut: zoom => zoom * this.axes.verticalZoomScale,
      spacing: ZOOM_BUTTON_SPACING,
      buttonOptions: {
        baseColor: ColorConstants.LIGHT_BLUE,
        touchAreaXDilation: 5,
        touchAreaYDilation: 5
      },
      magnifyingGlassNodeOptions: {
        glassRadius: ZOOM_BUTTON_ICON_RADIUS
      },

      // phet-io
      tandem: options.tandem.createTandem( 'verticalZoomButtonGroup' )
    } );

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
    model.savedBodyOne.temperatureProperty.link( updateSavedGraphAndLayout );
    model.savedBodyTwo.temperatureProperty.link( updateSavedGraphAndLayout );
    this.axes.horizontalZoomProperty.link( updateAllGraphs );
    this.axes.verticalZoomProperty.link( updateAllGraphs );

    // Sets layout of graph node elements to be all ultimately relative to the axes
    const axesPath = this.axes.axesPath;
    horizontalZoomButtonGroup.centerX = axesPath.right + ZOOM_BUTTON_ICON_RADIUS;
    horizontalZoomButtonGroup.top = axesPath.bottom + ZOOM_BUTTON_AXES_MARGIN;
    verticalZoomButtonGroup.centerX = axesPath.left - ZOOM_BUTTON_ICON_RADIUS * 2;
    verticalZoomButtonGroup.bottom = axesPath.top - ZOOM_BUTTON_AXES_MARGIN;
    this.wavelengthSpectrumNode.centerY = axesPath.centerY;
    this.wavelengthSpectrumNode.left = ultravioletPosition;

    // Adds children in rendering order
    this.addChild( this.innerGraphUnderAxes );
    this.addChild( this.axes );
    this.addChild( horizontalZoomButtonGroup );
    this.addChild( verticalZoomButtonGroup );
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
        const yMax = this.axes.spectralPowerDensityToViewY( body.getSpectralPowerDensityAt( peakWavelength ) );
        graphShape.lineTo( this.axes.wavelengthToViewX( peakWavelength ), yMax < -yCutoff ? -yCutoff : yMax );
        findingPeak = false;
      }
      const y = this.axes.spectralPowerDensityToViewY( body.getSpectralPowerDensityAt( deltaWavelength * i ) );
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
    this.primarySavedGraph.shape = null;
    this.secondarySavedGraph.shape = null;
    if ( this.model.savedBodyOne.temperatureProperty.value !== null ) {
      this.primarySavedGraph.shape = this.shapeOfBody( this.model.savedBodyOne );
      if ( this.model.savedBodyTwo.temperatureProperty.value !== null ) {
        this.secondarySavedGraph.shape = this.shapeOfBody( this.model.savedBodyTwo );
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
    this.updateGraphPaths();
    this.draggablePointNode.update();
    this.axes.update();
    this.updateVisibleSpectrumNode();
  }
}

blackbodySpectrum.register( 'GraphDrawingNode', GraphDrawingNode );
export default GraphDrawingNode;