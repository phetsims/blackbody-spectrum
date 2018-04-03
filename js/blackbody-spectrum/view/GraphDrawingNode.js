// Copyright 2014-2018, University of Colorado Boulder

//TODO break this up into smaller building blocks, see #19
/**
 * Graph Node responsible for drawing axes, spectrum, zoom buttons, axe titles and graph
 *
 * @author Martin Veillette ( Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var SpectrumNode = require( 'SCENERY_PHET/SpectrumNode' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );
  var ZoomButton = require( 'SCENERY_PHET/buttons/ZoomButton' );

  // constants
  var INFRARED_WAVELENGTH = 700; // in nm, max bounds for the rainbow spectrum
  var ULTRAVIOLET_WAVELENGTH = 380; // in nm, min bound for the rainbow spectrum
  var HORIZONTAL_GRAPH_LENGTH = 550; // size of graph in scenery coordinates
  var VERTICAL_GRAPH_LENGTH = 400; // size of graph in scenery coordinates
  var COLOR_TICK_LABEL = 'yellow';
  var COLOR_AXIS_LABEL = 'rgb(0,235,235)'; // greenish blue
  var GRAPH_CURVE_LINE_WIDTH = 5;
  var GRAPH_AXES_COLOR = 'white';
  var GRAPH_CURVE_STROKE = 'red';
  var SAVED_GRAPH_CURVE_STROKE = 'yellow';
  var INTENSITY_COLOR = 'white';

  var HORIZONTAL_ZOOM_SCALING_FACTOR = 2;
  var VERTICAL_ZOOM_SCALING_FACTOR = Math.sqrt( 10 );

  // constants for ticks
  var MINOR_TICKS_PER_MAJOR_TICK = 5;
  var MAJOR_TICK_LENGTH = 30;
  var MINOR_TICK_LENGTH = 15;

  // strings
  var horizontalLabelWavelengthString = require( 'string!BLACKBODY_SPECTRUM/horizontalLabelWavelength' );
  var subtitleLabelString = require( 'string!BLACKBODY_SPECTRUM/subtitleLabel' );
  var verticalLabelIntensityString = require( 'string!BLACKBODY_SPECTRUM/verticalLabelIntensity' );

  /**
   *
   * @param {BlackbodySpectrumModel}  model - model for the entire screen
   * @constructor
   */
  function GraphDrawingNode( model ) {

    Node.call( this );

    var self = this;

    // {Property.<number>}  zoom number for the horizontal axis of the graph, positive means zooming in
    var horizontalZoomProperty = new NumberProperty( 0 ); // effective zoom is HORIZONTAL_ZOOM_SCALING_FACTOR^horizontalZoomProperty.value

    // {Property.<number>}  zoom number for the vertical axis of the graph
    var verticalZoomProperty = new NumberProperty( 0 );

    var verticalMax = 100; // initial value for the maximum Y coordinate label in MW per m^2 per micron

    var verticalAxisLabelNode = new Text( verticalLabelIntensityString, {
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

    var intensityTextNode = new Text( '?', {
      font: new PhetFont( 15 ),
      fill: INTENSITY_COLOR
    } );

    // graph: blackbody curve
    // TODO annotate:  public/private ?
    this.graph = new Path( null, {
      stroke: GRAPH_CURVE_STROKE,
      lineWidth: GRAPH_CURVE_LINE_WIDTH,
      lineJoin: 'round'
    } );

    // new path for intensity, area under the curve
    this.intensity = new Path( null );
    this.intensity.addChild( intensityTextNode );
    intensityTextNode.bottom = this.intensity.bottom - 10;
    intensityTextNode.centerX = this.intensity.centerX;

    model.intensityVisibleProperty.link( function( intensityVisible ) {
      if ( intensityVisible ) {
        self.intensity.fill = 'rgba(100,100,100,0.75)';
      }
      else {
        self.intensity.fill = null;
      }
    } );

    var scaleY = 1;

    function updateGraph( graph, temperature, intensity ) {
      var graphShape = new Shape();

      var i;
      var y = model.coordinatesY( temperature );
      var lengthArray = y.length;

      var numberPoints = y.length;
      var deltaX = HORIZONTAL_GRAPH_LENGTH / ( numberPoints - 1 );
      var deltaY = VERTICAL_GRAPH_LENGTH / ( verticalMax );
      var newScaleY = scaleY * 1e33 * deltaY; // from nm to m to the fifth power (1e45) and Mega/micron (1e-12)
      graphShape.moveTo( 0, -newScaleY * y[ 0 ] );

      for ( i = 1; i < lengthArray; i++ ) {
        graphShape.lineTo( deltaX * i, -newScaleY * y[ i ] ); /// need to flip y axis
      }

      // Easiest way to implement intensity shape is to copy graph shape and bring down to x-axis
      graph.shape = graphShape;
      if ( intensity ) {
        intensity.shape = graphShape.copy();
        var newPoint = new Vector2( HORIZONTAL_GRAPH_LENGTH, 0 );
        if ( intensity.shape.getLastPoint().minus( newPoint ).magnitude() > 0 ) {
          intensity.shape.lineToPoint( newPoint );
        }
      }

      intensityTextNode.bottom = self.intensity.bottom - 10;
      intensityTextNode.centerX = HORIZONTAL_GRAPH_LENGTH * ( model.peakWavelength( temperature ) / model.wavelengthMax );
      intensityTextNode.text = model.totalIntensity( temperature );
    }

    // axes for the graph
    var axesShape = new Shape()
      .moveTo( HORIZONTAL_GRAPH_LENGTH, 0 )
      .lineTo( 0, 0 )
      .lineTo( 0, -1 * VERTICAL_GRAPH_LENGTH )
      .lineTo( 5, -1 * VERTICAL_GRAPH_LENGTH );

    var axesPath = new Path( axesShape,
      {
        stroke: GRAPH_AXES_COLOR,
        lineWidth: 3,
        lineCap: 'round',
        lineJoin: 'round'
      } );

    // horizontal tick marks
    var ticks = new Path( null, { stroke: GRAPH_AXES_COLOR, lineWidth: 2, lineCap: 'butt', lineJoin: 'bevel' } );
    var graphBottom = 0;
    var minorTickSpacing = 20; // initial value

    function updateTicks( minorTickSpacing ) {

      var numberOfTicks = Util.roundSymmetric( HORIZONTAL_GRAPH_LENGTH / minorTickSpacing );
      var deltaX = HORIZONTAL_GRAPH_LENGTH / numberOfTicks;
      var shape = new Shape();

      for ( var i = 1; i <= numberOfTicks; i++ ) {
        var isMajorTick = ( i % MINOR_TICKS_PER_MAJOR_TICK === 0 );
        var tickLength = ( isMajorTick ? MAJOR_TICK_LENGTH : MINOR_TICK_LENGTH );
        var x = ( i * deltaX );
        // horizontal tick
        shape.moveTo( x, graphBottom ).lineTo( x, graphBottom - tickLength );
      }
      ticks.shape = shape;
    }

    // label for ticks
    var horizontalTickLabelZero = new Text( '0', { font: new PhetFont( 32 ), fill: COLOR_TICK_LABEL } );
    var horizontalTickLabelMax = new Text( model.wavelengthMax / 1000, {
      font: new PhetFont( 32 ),
      fill: COLOR_TICK_LABEL
    } );
    var verticalTickLabelMax = new Text( verticalMax, {
      font: new PhetFont( 32 ),
      direction: 'rtl',
      fill: COLOR_TICK_LABEL
    } );

    //TODO dead code, fix it or delete it
//      var verticalTickLabelMax = new ScientificNotation( model.temperatureProperty,{
//            font: new PhetFont(28),
//            direction: 'rtl',
//            fill: COLOR_TICK_LABEL}
//      );

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
    var infraredPosition = Util.linear( 0, model.wavelengthMax, 0, HORIZONTAL_GRAPH_LENGTH, INFRARED_WAVELENGTH );
    var ultravioletPosition = Util.linear( 0, model.wavelengthMax, 0, HORIZONTAL_GRAPH_LENGTH, ULTRAVIOLET_WAVELENGTH );
    var widthSpectrum = infraredPosition - ultravioletPosition;
    var spectrum = new SpectrumNode( {
      size: new Dimension2( widthSpectrum, VERTICAL_GRAPH_LENGTH ),
      minWavelength: ULTRAVIOLET_WAVELENGTH,
      maxWavelength: INFRARED_WAVELENGTH,
      opacity: 0.9,
      left: ultravioletPosition + axesPath.left
    } );

    function updateSpectrum( scaleX ) {
      ultravioletPosition = ultravioletPosition / scaleX;
      spectrum.scale( new Vector2( 1 / scaleX, 1 ) );
      var spectrumPosition = ultravioletPosition + self.graph.left;
      var isSpectrumOffTheAxis = spectrumPosition > self.graph.right;
      spectrum.left = ultravioletPosition + self.graph.left;
      // spectrum.visible = true;
      //  spectrum.clipArea= Shape.rectangle(self.left,self.top,HORIZONTAL_GRAPH_LENGTH,VERTICAL_GRAPH_LENGTH);
      if ( isSpectrumOffTheAxis ) {
        spectrum.visible = false;
      }
      else {
        spectrum.visible = true;
        spectrum.left = ultravioletPosition + self.graph.left;
      }
    }

    // observers
    model.temperatureProperty.link( function( temperature ) {
      updateGraph( self.graph, temperature, self.intensity );
    } );

    horizontalZoomProperty.link( function( horizontalZoom ) {

      var scaleX = Math.pow( HORIZONTAL_ZOOM_SCALING_FACTOR, horizontalZoom );

      model.wavelengthMax = model.wavelengthMax * scaleX;
      minorTickSpacing = minorTickSpacing / scaleX;

      // spectrum position and width
      updateSpectrum( scaleX );

      // update tick label
      horizontalTickLabelMax.text = model.wavelengthMax / 1000; // from nm to micron

      // update ticks
      updateTicks( minorTickSpacing );

      // redraw blackbody curves
      updateGraph( self.graph, model.temperatureProperty.value, self.intensity );
      if ( self.savedGraph ) {
        updateGraph( self.savedGraph, self.savedTemperature );
      }

      // reset zoom level to zero
      // TODO: this is not best practice: it generates two calls.
      horizontalZoomProperty.reset();
    } );

    verticalZoomProperty.link( function( verticalZoom ) {

      verticalMax = verticalMax * Math.pow( VERTICAL_ZOOM_SCALING_FACTOR, verticalZoom );
      verticalTickLabelMax.text = Util.toFixed( verticalMax, 0 ); // from nm to micron

      updateGraph( self.graph, model.temperatureProperty.value, self.intensity );
      if ( self.savedGraph ) {
        updateGraph( self.savedGraph, self.savedTemperature );
      }
      verticalZoomProperty.reset(); // reset zoom
    } );

    //TODO use trigger and axon/Events instead
    // this.trigger( 'buttonPressed' )

    // handle zoom of graph
    horizontalZoomInButton.addListener( function() {
      horizontalZoomOutButton.setEnabled( true );
      if ( model.wavelengthMax > 100 ) {
        horizontalZoomProperty.set( -1 );
        horizontalZoomInButton.setEnabled( true );
      }
      else {
        horizontalZoomInButton.setEnabled( false );
      }
    } );

    horizontalZoomOutButton.addListener( function() {
      horizontalZoomInButton.setEnabled( true );
      if ( model.wavelengthMax < 10000 ) {
        horizontalZoomProperty.set( +1 );
        horizontalZoomOutButton.setEnabled( true );
      }
      else {
        horizontalZoomOutButton.setEnabled( false );
      }
    } );

    // handle zoom of graph
    verticalZoomInButton.addListener( function() {
      verticalZoomProperty.set( -1 );
    } );
    verticalZoomOutButton.addListener( function() {
      verticalZoomProperty.set( +1 );
    } );

    this.addChild( spectrum );
    this.addChild( horizontalTickLabelZero );
    this.addChild( horizontalTickLabelMax );
    this.addChild( verticalTickLabelMax );
    this.addChild( verticalAxisLabelNode );
    this.addChild( horizontalAxisTopLabelNode );
    this.addChild( horizontalAxisBottomLabelNode );
    this.addChild( axesPath );
    this.addChild( horizontalZoomButtons );
    this.addChild( verticalZoomButtons );
    this.addChild( ticks );
    this.addChild( this.graph );
    this.addChild( this.intensity );

    // layout
    axesPath.bottom = 0;
    axesPath.left = 0;
    this.graph.bottom = axesPath.bottom;
    this.graph.left = axesPath.left;
    this.intensity.bottom = axesPath.bottom;
    this.intensity.left - axesPath.left;
    horizontalTickLabelZero.top = axesPath.bottom;
    horizontalTickLabelZero.centerX = axesPath.left;
    horizontalTickLabelMax.top = axesPath.bottom;
    horizontalTickLabelMax.centerX = axesPath.right;
    verticalTickLabelMax.right = axesPath.left;
    verticalTickLabelMax.centerY = axesPath.top;
    horizontalZoomButtons.left = axesPath.right - 45;
    horizontalZoomButtons.top = axesPath.bottom + 40;
    horizontalZoomInButton.left = horizontalZoomOutButton.right + 10;
    horizontalZoomInButton.centerY = horizontalZoomOutButton.centerY;
    verticalZoomButtons.right = axesPath.left - 60;
    verticalZoomButtons.bottom = axesPath.top + 35;
    verticalZoomInButton.centerX = verticalZoomOutButton.centerX;
    verticalZoomInButton.bottom = verticalZoomOutButton.top - 10;
    spectrum.bottom = axesPath.bottom;
    verticalAxisLabelNode.top = verticalZoomButtons.bottom + 20;
    verticalAxisLabelNode.right = axesPath.left - 20;
    horizontalAxisTopLabelNode.top = axesPath.bottom + 20;
    horizontalAxisTopLabelNode.centerX = axesPath.centerX;
    horizontalAxisBottomLabelNode.top = horizontalAxisTopLabelNode.bottom + 5;
    horizontalAxisBottomLabelNode.centerX = axesPath.centerX;

    // TODO this approach to rest the ZOOM is flawed
    // Zooming should use an absolute scale rather than relative zoom increment
    this.resetGraphDrawingNode = function() {
      verticalZoomProperty.reset();
      horizontalZoomProperty.reset();
      //verticalMax = 100;
    };
  }

  blackbodySpectrum.register( 'GraphDrawingNode', GraphDrawingNode );

  return inherit( Node, GraphDrawingNode, {

    /**
     * Save the state of a graph at temperature 'temperature' and add it to the scene graph
     * @public
     * @param {number} temperature - in kelvin
     */
    save: function( temperature ) {
      this.clear();
      this.savedTemperature = temperature; // temperature associated with the save graph;
      this.savedGraph = new Path( null, { stroke: SAVED_GRAPH_CURVE_STROKE, lineWidth: GRAPH_CURVE_LINE_WIDTH } );
      this.savedGraph.shape = this.graph.shape;
      this.addChild( this.savedGraph );
    },

    /**
     * Clear the savedGraph form the scene graph
     * @public
     */
    clear: function() {
      if ( this.indexOfChild( this.savedGraph ) !== -1 ) {
        this.removeChild( this.savedGraph );
        this.savedGraph = {};
      }
    },

    /**
     * Reset Properties associated with this Node
     * @public
     */
    reset: function() {
      this.resetGraphDrawingNode();
    }
  } );
} );