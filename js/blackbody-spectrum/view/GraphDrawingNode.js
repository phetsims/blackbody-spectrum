// Copyright 2014-2018, University of Colorado Boulder

//TODO break this up into smaller building blocks, see #19
/**
 * Graph Node responsible for drawing axes, spectrum, zoom buttons, axe titles and graph
 *
 * @author Martin Veillette ( Berea College)
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
  var Circle = require( 'SCENERY/nodes/Circle' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  // constants
  var ULTRAVIOLET_WAVELENGTH = 380; // in nm, max bounds for the uv part of the electromagnetic spectrum
  var VISIBLE_WAVELENGTH = 700; // in nm, max bounds for the visible part of the electromagnetic spectrum
  var HORIZONTAL_GRAPH_LENGTH = 550; // size of graph in scenery coordinates
  var VERTICAL_GRAPH_LENGTH = 400; // size of graph in scenery coordinates
  var COLOR_TICK_LABEL = 'yellow';
  var COLOR_AXIS_LABEL = 'rgb(0,235,235)'; // greenish blue
  var GRAPH_CURVE_LINE_WIDTH = 5;
  var GRAPH_CURVE_STROKE = 'red';
  var SAVED_GRAPH_COLOR = '#996633';
  var SAVED_TEMPERATURE_FONT = new PhetFont( 22 );

  // strings
  var horizontalLabelWavelengthString = require( 'string!BLACKBODY_SPECTRUM/horizontalLabelWavelength' );
  var subtitleLabelString = require( 'string!BLACKBODY_SPECTRUM/subtitleLabel' );
  var verticalLabelSpectralRadianceString = require( 'string!BLACKBODY_SPECTRUM/verticalLabelSpectralRadiance' );

  /**
   *
   * @param {BlackbodySpectrumModel}  model - model for the entire screen
   * @constructor
   */
  function GraphDrawingNode( model ) {

    Node.call( this );

    var self = this;

    this.axes = new ZoomableAxesView( model );

    var verticalAxisLabelNode = new Text( verticalLabelSpectralRadianceString, {
      font: new PhetFont( 28 ),
      fill: COLOR_AXIS_LABEL,
      rotation: -Math.PI / 2
    } );
    var horizontalAxisTopLabelNode = new Text( horizontalLabelWavelengthString, {
      font: new PhetFont( 32 ),
      fill: COLOR_AXIS_LABEL
    } );
    var horizontalAxisBottomLabelNode = new Text( subtitleLabelString, {
      font: new PhetFont( 24 ),
      fill: COLOR_AXIS_LABEL
    } );

    // graph: blackbody curve
    // TODO annotate:  public/private ?
    this.graph = new Path( null, {
      stroke: GRAPH_CURVE_STROKE,
      lineWidth: GRAPH_CURVE_LINE_WIDTH,
      lineJoin: 'round'
    } );
    
    this.savedGraph = new Path( null, {
      stroke: SAVED_GRAPH_COLOR,
      lineWidth: GRAPH_CURVE_LINE_WIDTH,
      lineJoin: 'round'
    } );

    // new path for intensity, area under the curve
    this.intensity = new Path( null );

    // Whether the area under the curve is filled in is reflected by whether the intensity is set to be visible or not
    model.intensityVisibleProperty.link( function( intensityVisible ) {
      if ( intensityVisible ) {
        self.intensity.fill = 'rgba(100,100,100,0.75)'; //TODO move this color into a constant?
      }
      else {
        self.intensity.fill = null;
      }
    } );

    // General function for updating graphs; returns an object of what was needed to make the new shape as well as the new shape
    function updateGraph( graph, body ) {
      var graphShape = new Shape();
      var radianceArray = body.coordinatesY;
      var numberPoints = radianceArray.length;
      var deltaWavelength = HORIZONTAL_GRAPH_LENGTH / ( numberPoints - 1 );
      var deltaRadiance = VERTICAL_GRAPH_LENGTH / self.axes.verticalZoomProperty.value;
      var radianceScale = 1e33 * deltaRadiance; // from nm to m to the fifth power (1e45) and Mega/micron (1e-12)
      graphShape.moveTo( 0, -radianceScale * radianceArray[ 0 ] );
      for ( var i = 1; i < radianceArray.length; i++ ) {
        graphShape.lineTo( deltaWavelength * i, -radianceScale * radianceArray[ i ] ); /// need to flip y axis
      }
      graph.shape = graphShape;
      return {
        graphShape: graphShape.copy(),
        radianceArray: radianceArray,
        numberPoints: numberPoints,
        deltaWavelength: deltaWavelength,
        deltaRadiance: deltaRadiance,
        radianceScale: radianceScale
      };
    }

    // Function that updates the main graph the user can directly control
    function updateMainGraph() {
      var updatedGraphShape = updateGraph( self.graph, model.mainBody ).graphShape;
      
      // Easiest way to implement intensity shape is to copy graph shape and bring down to x-axis
      self.intensity.shape = updatedGraphShape;
      var newPoint = new Vector2( HORIZONTAL_GRAPH_LENGTH, 0 );
      if ( self.intensity.shape.getLastPoint().minus( newPoint ).magnitude() > 0 ) {
        self.intensity.shape.lineToPoint( newPoint );
      }
    }

    var savedTemperatureTextNode = new Text( '?', {
      fill: SAVED_GRAPH_COLOR,
      font: SAVED_TEMPERATURE_FONT
    } );

    model.savedBodyProperty.link( function( savedBody ) {
      if ( savedBody === null ) {
        self.savedGraph.visible = false;
        savedTemperatureTextNode.visible = false;
      } else {
        self.savedGraph.visible = true;
        savedTemperatureTextNode.visible = true;
        self.updateSavedGraph();
      }
    } );
    
    // Function that updates the saved graph
    this.updateSavedGraph = function() {
      var updatedGraphOptions = updateGraph( self.savedGraph, model.savedBodyProperty.value );
      savedTemperatureTextNode.text = Util.toFixed( model.savedBodyProperty.value.temperatureProperty.value, 0 ) + 'K';
      var wavelengthPeakScale = model.mainBody.peakWavelength / model.wavelengthMax;
      if ( wavelengthPeakScale > 0.85 ) {
        wavelengthPeakScale = 0.85; 
      }
      var wavelengthPeak = updatedGraphOptions.numberPoints * ( wavelengthPeakScale ); 
      var radiancePeak = -updatedGraphOptions.radianceScale * updatedGraphOptions.radianceArray[ Math.floor( wavelengthPeak ) ]; 
      var verticalTextPlacement = radiancePeak / 3;
      if ( verticalTextPlacement > -20 ) {
        verticalTextPlacement = -20;
      } else if ( verticalTextPlacement < -VERTICAL_GRAPH_LENGTH + savedTemperatureTextNode.height ) {
        verticalTextPlacement = -VERTICAL_GRAPH_LENGTH + savedTemperatureTextNode.height;
      }
      savedTemperatureTextNode.bottom = verticalTextPlacement; 
      savedTemperatureTextNode.centerX = HORIZONTAL_GRAPH_LENGTH * ( wavelengthPeakScale ) + 20; 
    };

    // The circle that the user can drag to see graph values
    var graphValuesPointNode = new Circle( 5, {
      cursor: 'pointer',
      fill: 'green'
    } );
    
    // @private variables used in drag handler
    var startPoint;
    var startX;
    var mousePoint;
    var horizontalDragHandler = new SimpleDragHandler( {
      start: function( event ) {
        startPoint = event.pointer.point;
        startX = graphValuesPointNode.centerX; // view units
      },
      drag: function( event ) {
        mousePoint = event.pointer.point;

        // change in x, view units
        var xChange = mousePoint.x - startPoint.x;
        model.mainBody.graphValuesPointProperty.set( new Vector2( self.axes.viewXToWavelength( startX + xChange ), model.mainBody.getIntensityRadiation( self.axes.viewXToWavelength( startX + xChange ) ) ) );
      },

      allowTouchSnag: true
    } );
    graphValuesPointNode.addInputListener( horizontalDragHandler );

    function updateGraphValuesPointNodePosition() {
      graphValuesPointNode.centerX = self.axes.wavelengthToViewX( model.mainBody.graphValuesPointProperty.value.x );
      graphValuesPointNode.centerY = self.axes.spectralRadianceToViewY( model.mainBody.graphValuesPointProperty.value.y );
    }

    model.mainBody.graphValuesPointProperty.link( updateGraphValuesPointNodePosition );

    // label for ticks
    var horizontalTickLabelZero = new Text( '0', { font: new PhetFont( 32 ), fill: COLOR_TICK_LABEL } );
    var horizontalTickLabelMax = new Text( model.wavelengthMax / 1000, {
      font: new PhetFont( 32 ),
      fill: COLOR_TICK_LABEL
    } );
    var verticalTickLabelMax = new Text( self.axes.verticalZoomProperty.value, {
      font: new PhetFont( 32 ),
      direction: 'rtl',
      fill: COLOR_TICK_LABEL
    } );

    // zoom Buttons
    var horizontalZoomInButton = new ZoomButton( { in: true, radius: 10 } );
    var horizontalZoomOutButton = new ZoomButton( { in: false, radius: 10 } );
    var verticalZoomInButton = new ZoomButton( { in: true, radius: 10 } );
    var verticalZoomOutButton = new ZoomButton( { in: false, radius: 10 } );
    var horizontalZoomButtons = new Node( { children: [ horizontalZoomOutButton, horizontalZoomInButton ] } );
    var verticalZoomButtons = new Node( { children: [ verticalZoomOutButton, verticalZoomInButton ] } );

    // expand touch area
    horizontalZoomInButton.touchArea = horizontalZoomInButton.localBounds.dilated( 5, 5 );
    horizontalZoomOutButton.touchArea = horizontalZoomOutButton.localBounds.dilated( 5, 5 );
    verticalZoomInButton.touchArea = verticalZoomInButton.localBounds.dilated( 5, 5 );
    verticalZoomOutButton.touchArea = verticalZoomOutButton.localBounds.dilated( 5, 5 );

    // rainbow spectrum
    // TODO use clipping instead if the spectrum is to the left.
    var infraredPosition = Util.linear( 0, model.wavelengthMax, 0, HORIZONTAL_GRAPH_LENGTH, VISIBLE_WAVELENGTH );
    var ultravioletPosition = Util.linear( 0, model.wavelengthMax, 0, HORIZONTAL_GRAPH_LENGTH, ULTRAVIOLET_WAVELENGTH );
    var widthSpectrum = infraredPosition - ultravioletPosition;
    var wavelengthSpectrumNode = new WavelengthSpectrumNode( {
      size: new Dimension2( widthSpectrum, VERTICAL_GRAPH_LENGTH ),
      minWavelength: ULTRAVIOLET_WAVELENGTH,
      maxWavelength: VISIBLE_WAVELENGTH,
      opacity: 0.9,
      left: ultravioletPosition + self.axes.left
    } );

    /**
     * Updates the positioning of the visible light spectrum image
     */
    function updateSpectrum() {
      var infraredPosition = Util.linear( 0, model.wavelengthMax, 0, HORIZONTAL_GRAPH_LENGTH, VISIBLE_WAVELENGTH );
      var ultravioletPosition = Util.linear( 0, model.wavelengthMax, 0, HORIZONTAL_GRAPH_LENGTH, ULTRAVIOLET_WAVELENGTH );
      var widthSpectrum = infraredPosition - ultravioletPosition;

      wavelengthSpectrumNode.scale( new Vector2( widthSpectrum / wavelengthSpectrumNode.width, 1 ) );
      var spectrumPosition = ultravioletPosition + self.graph.left;
      var isSpectrumOffTheAxis = spectrumPosition > self.graph.right;
      wavelengthSpectrumNode.left = ultravioletPosition + self.graph.left;
      if ( isSpectrumOffTheAxis ) {
        wavelengthSpectrumNode.visible = false;
      }
      else {
        wavelengthSpectrumNode.visible = true;
        wavelengthSpectrumNode.left = ultravioletPosition + self.graph.left;
      }
    }

    // observers
    model.mainBody.temperatureProperty.link( updateMainGraph );

    // Updates horizontal ticks, graph, and spectrum no horizontal zoom change
    this.axes.horizontalZoomProperty.link( function( horizontalZoom ) {
      // spectrum position and width
      updateSpectrum();

      // update tick label
      horizontalTickLabelMax.text = model.wavelengthMax / 1000; // from nm to micron

      // redraw blackbody curves
      updateMainGraph();
      if ( self.savedGraph.visible ) {
        self.updateSavedGraph();
      }

      horizontalZoomInButton.enabled = horizontalZoom > self.axes.minHorizontalZoom;
      horizontalZoomOutButton.enabled = horizontalZoom < self.axes.maxHorizontalZoom;

      updateGraphValuesPointNodePosition();

    } );

    // Updates vertical ticks and graph on vertical zoom change
    this.axes.verticalZoomProperty.link( function( verticalZoom ) {

      verticalTickLabelMax.text = Util.toFixed( verticalZoom, 0 ); // from nm to micron

      updateMainGraph();
      if ( self.savedGraph.visible ) {
        self.updateSavedGraph();
      }

      verticalZoomInButton.enabled = verticalZoom > self.axes.minVerticalZoom;
      verticalZoomOutButton.enabled = verticalZoom < self.axes.maxVerticalZoom;

      updateGraphValuesPointNodePosition();

    } );

    // TODO use trigger and axon/Events instead
    // this.trigger( 'buttonPressed' )

    // handle zoom of graph
    horizontalZoomInButton.addListener( function() { self.axes.zoomInHorizontal(); } );
    horizontalZoomOutButton.addListener( function() { self.axes.zoomOutHorizontal(); } );
    verticalZoomInButton.addListener( function() { self.axes.zoomInVertical(); } );
    verticalZoomOutButton.addListener( function() { self.axes.zoomOutVertical(); } );

    this.addChild( wavelengthSpectrumNode );
    this.addChild( horizontalTickLabelZero );
    this.addChild( horizontalTickLabelMax );
    this.addChild( verticalTickLabelMax );
    this.addChild( verticalAxisLabelNode );
    this.addChild( horizontalAxisTopLabelNode );
    this.addChild( horizontalAxisBottomLabelNode );
    this.addChild( this.axes );
    this.addChild( horizontalZoomButtons );
    this.addChild( verticalZoomButtons );
    this.addChild( this.graph );
    this.addChild( this.intensity );
    this.addChild( this.savedGraph );
    this.addChild( savedTemperatureTextNode );
    this.addChild( graphValuesPointNode );

    // layout
    this.axes.bottom = 0;
    this.axes.left = 0;
    this.graph.bottom = this.axes.bottom;
    this.graph.left = this.axes.left;
    this.intensity.bottom = this.axes.bottom;
    this.intensity.left = this.axes.left;
    horizontalTickLabelZero.top = this.axes.bottom;
    horizontalTickLabelZero.centerX = this.axes.left;
    horizontalTickLabelMax.top = this.axes.bottom;
    horizontalTickLabelMax.centerX = this.axes.right;
    verticalTickLabelMax.right = this.axes.left;
    verticalTickLabelMax.centerY = this.axes.top - 10;
    horizontalZoomButtons.left = this.axes.right - 45;
    horizontalZoomButtons.top = this.axes.bottom + 40;
    horizontalZoomInButton.left = horizontalZoomOutButton.right + 10;
    horizontalZoomInButton.centerY = horizontalZoomOutButton.centerY;
    verticalZoomButtons.right = this.axes.left - 60;
    verticalZoomButtons.bottom = this.axes.top + 35;
    verticalZoomInButton.centerX = verticalZoomOutButton.centerX;
    verticalZoomInButton.bottom = verticalZoomOutButton.top - 10;
    wavelengthSpectrumNode.bottom = this.axes.bottom;
    verticalAxisLabelNode.right = this.axes.left - 20;
    verticalAxisLabelNode.centerY = -VERTICAL_GRAPH_LENGTH / 2;
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
    }

  } );
} );