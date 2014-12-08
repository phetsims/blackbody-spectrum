// Copyright 2002-2013, University of Colorado Boulder

/**
 * Graph Node responsible for drawing axes, spectrum, zoom buttons, axe titles and graph
 *
 * @author Martin Veillette ( Berea College)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  //  var ScientificNotation = require('SCENERY_PHET/ScientificNotationNode');
  var Spectrum = require( 'SCENERY_PHET/SpectrumNode' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var ZoomButton = require( 'SCENERY_PHET/buttons/ZoomButton' );

  // constants
  var INFRARED_WAVELENGTH = 700; //in nm
  var ULTRAVIOLET_WAVELENGTH = 380; //in nm
  var HORIZONTAL_GRAPH_LENGTH = 600; //size of graph in pixels
  var VERTICAL_GRAPH_LENGTH = 500; //size of graph in pixels
  var COLOR_TICK_LABEL = 'yellow';
  var COLOR_AXIS_LABEL = '#00EBEB'; //greenish blue
  var GRAPH_CURVE_LINE_WIDTH = 5;
  var GRAPH_AXES_COLOR = 'white';

  var HorizontalZoomScalingFactor = 2;
  var verticalZoomScalingFactor = Math.sqrt( 10 );

  // strings
  var verticalLabelIntensityString = require( 'string!BLACKBODY_SPECTRUM/verticalLabelIntensity' );
  var horizontalLabelWavelengthString = require( 'string!BLACKBODY_SPECTRUM/horizontalLabelWavelength' );
  var subtitleLabelString = require( 'string!BLACKBODY_SPECTRUM/subtitleLabel' );

  /**
   *
   * @param {BlackbodySpectrumModel}  model for the entire screen
   * @param (ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function GraphDrawingNode( model, modelViewTransform ) {

    Node.call( this );

    var thisGraph = this;

    var verticalMax = 100; // initial value for the maximum Y coordinate label in MW per m^2 per micron;

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

    // graph: blackbody curve
    this.graph = new Path( null, {stroke: 'red', lineWidth: GRAPH_CURVE_LINE_WIDTH} );

    var scaleY = 1;
    var updateGraph = function( graph, temperature ) {
      var shape = new Shape();
      var i;
      var y = model.coordinatesY( temperature );
      var lengthArray = y.length;

      var numberPoints = y.length;
      var deltaX = HORIZONTAL_GRAPH_LENGTH / (numberPoints - 1);
      var deltaY = VERTICAL_GRAPH_LENGTH / (verticalMax);
      var newScaleY = scaleY * 1e33 * deltaY; // from nm to m to the fifth power (1e45) and Mega/micron (1e-12)
      shape.moveTo( 0, -newScaleY * y[0] );

      for ( i = 1; i < lengthArray; i++ ) {
        shape.lineTo( deltaX * i, -newScaleY * y[i] ); /// need to flip y axis
      }
      graph.shape = shape;
    };

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

    //ticks

    //constants

    var MINOR_TICKS_PER_MAJOR_TICK = 5;
    var MAJOR_TICK_LENGTH = 30;
    var MINOR_TICK_LENGTH = 15;

    // horizontal tick marks

    var ticks = new Path( null, {stroke: GRAPH_AXES_COLOR, lineWidth: 2, lineCap: 'butt', lineJoin: 'bevel'} );

    var graphBottom = 0;

    var minorTickSpacing = 20; // initial value

    var updateTicks = function( minorTickSpacing ) {

      var numberOfTicks = Math.round( HORIZONTAL_GRAPH_LENGTH / minorTickSpacing );
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
    };

    //label for ticks
    var horizontalTickLabelZero = new Text( '0', {font: new PhetFont( 32 ), fill: COLOR_TICK_LABEL} );
    var horizontalTickLabelMax = new Text( model.wavelengthMax / 1000, {font: new PhetFont( 32 ), fill: COLOR_TICK_LABEL} );
    var verticalTickLabelMax = new Text( verticalMax, {
      font: new PhetFont( 32 ),
      direction: 'rtl',
      fill: COLOR_TICK_LABEL
    } );

//      var verticalTickLabelMax = new ScientificNotation( model.temperatureProperty,{
//            font: new PhetFont(28),
//            direction: 'rtl',
//            fill: COLOR_TICK_LABEL}
//      );

    //zoom Buttons
    var horizontalZoomInButton = new ZoomButton( {in: true} );
    var horizontalZoomOutButton = new ZoomButton( {in: false} );
    var verticalZoomInButton = new ZoomButton( {in: true} );
    var verticalZoomOutButton = new ZoomButton( {in: false} );
    var horizontalZoomButtons = new Node( {children: [horizontalZoomOutButton, horizontalZoomInButton]} );
    var verticalZoomButtons = new Node( {children: [verticalZoomOutButton, verticalZoomInButton]} );

    // expand touch area
    horizontalZoomInButton.touchArea = horizontalZoomInButton.localBounds.dilate( 5, 5 );
    horizontalZoomOutButton.touchArea = horizontalZoomOutButton.localBounds.dilate( 5, 5 );
    verticalZoomInButton.touchArea = verticalZoomInButton.localBounds.dilate( 5, 5 );
    verticalZoomOutButton.touchArea = verticalZoomOutButton.localBounds.dilate( 5, 5 );

    // rainbow spectrum
    // TODO use clipping instead if the spectrum is to the left.
    var infraredPosition = Util.linear( 0, model.wavelengthMax, 0, HORIZONTAL_GRAPH_LENGTH, INFRARED_WAVELENGTH );
    var ultravioletPosition = Util.linear( 0, model.wavelengthMax, 0, HORIZONTAL_GRAPH_LENGTH, ULTRAVIOLET_WAVELENGTH );
    var widthSpectrum = infraredPosition - ultravioletPosition;
    var spectrum = new Spectrum( widthSpectrum, VERTICAL_GRAPH_LENGTH, ULTRAVIOLET_WAVELENGTH, INFRARED_WAVELENGTH, 0.9 );
    spectrum.left = ultravioletPosition + axesPath.left;

    var updateSpectrum = function( scaleX ) {
      ultravioletPosition = ultravioletPosition / scaleX;
      spectrum.scale( {x: 1 / scaleX, y: 1} );
      var spectrumPosition = ultravioletPosition + thisGraph.graph.left;
      var isSpectrumOffTheAxis = spectrumPosition > thisGraph.graph.right;
      spectrum.left = ultravioletPosition + thisGraph.graph.left;
      // spectrum.visible = true;
      //  spectrum.clipArea= Shape.rectangle(thisGraph.left,thisGraph.top,HORIZONTAL_GRAPH_LENGTH,VERTICAL_GRAPH_LENGTH);
      //debugger;
      if ( isSpectrumOffTheAxis ) {
        spectrum.visible = false;
      }
      else {
        spectrum.visible = true;
        spectrum.left = ultravioletPosition + thisGraph.graph.left;
      }
    };

    // observers
    model.temperatureProperty.link( function( temperature ) {
      updateGraph( thisGraph.graph, temperature );
    } );

    model.horizontalZoomProperty.link( function( horizontalZoom ) {

      var scaleX = Math.pow( HorizontalZoomScalingFactor, horizontalZoom );

      model.wavelengthMax = model.wavelengthMax * scaleX;
      minorTickSpacing = minorTickSpacing / scaleX;

      //spectrum position and width
      updateSpectrum( scaleX );

      //update tick label
      horizontalTickLabelMax.text = model.wavelengthMax / 1000; //from nm to micron

      //update ticks
      updateTicks( minorTickSpacing );

      //redraw blackbody curves
      updateGraph( thisGraph.graph, model.temperature );
      if ( thisGraph.savedGraph ) {
        updateGraph( thisGraph.savedGraph, thisGraph.savedTemperature );
      }

      // reset zoom level to zero
      model.horizontalZoom = 0;
    } );

    model.verticalZoomProperty.link( function( verticalZoom ) {

      verticalMax = verticalMax * Math.pow( verticalZoomScalingFactor, verticalZoom );
      verticalTickLabelMax.text = verticalMax.toFixed( 0 ); //from nm to micron


      updateGraph( thisGraph.graph, model.temperature );
      if ( thisGraph.savedGraph ) {
        updateGraph( thisGraph.savedGraph, thisGraph.savedTemperature );
      }
      model.verticalZoom = 0; //reset zoom
    } );

    ////// handle zoom of graph
    horizontalZoomInButton.addListener( function() {
      model.horizontalZoom = -1;
    } );

    horizontalZoomOutButton.addListener( function() {
      model.horizontalZoom = +1;
    } );

    ////// handle zoom of graph
    verticalZoomInButton.addListener( function() {
      model.verticalZoom = -1;
    } );
    verticalZoomOutButton.addListener( function() {
      model.verticalZoom = +1;
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
    {
      axesPath.bottom = 0;
      axesPath.left = 0;
      this.graph.bottom = axesPath.bottom;
      this.graph.left = axesPath.left;
      horizontalTickLabelZero.top = axesPath.bottom;
      horizontalTickLabelZero.centerX = axesPath.left;
      horizontalTickLabelMax.top = axesPath.bottom;
      horizontalTickLabelMax.centerX = axesPath.right;
      verticalTickLabelMax.right = axesPath.left;
      verticalTickLabelMax.centerY = axesPath.top;
      horizontalZoomButtons.left = axesPath.right + 60;
      horizontalZoomButtons.top = axesPath.bottom + 20;
      horizontalZoomInButton.right = horizontalZoomOutButton.left - 80;
      horizontalZoomInButton.centerY = horizontalZoomOutButton.centerY;
      verticalZoomButtons.right = axesPath.left - 40;
      verticalZoomButtons.bottom = axesPath.top - 25;
      verticalZoomInButton.centerX = verticalZoomOutButton.centerX;
      verticalZoomInButton.top = verticalZoomOutButton.bottom + 50;
      spectrum.bottom = axesPath.bottom;
      verticalAxisLabelNode.top = verticalZoomButtons.bottom + 20;
      verticalAxisLabelNode.right = axesPath.left - 20;
      horizontalAxisTopLabelNode.top = axesPath.bottom + 20;
      horizontalAxisTopLabelNode.centerX = axesPath.centerX;
      horizontalAxisBottomLabelNode.top = horizontalAxisTopLabelNode.bottom + 5;
      horizontalAxisBottomLabelNode.centerX = axesPath.centerX;
    }

  }

  return inherit( Node, GraphDrawingNode, {
    save: function( temperature ) {
      this.clear();
      this.savedTemperature = temperature; // temperature associated with the save graph;
      this.savedGraph = new Path( null, {stroke: 'yellow', lineWidth: GRAPH_CURVE_LINE_WIDTH} );
      this.savedGraph.shape = this.graph.shape;
      this.addChild( this.savedGraph );
    },
    clear: function() {
      if ( this.indexOfChild( this.savedGraph ) !== -1 ) {
        this.removeChild( this.savedGraph );
        this.savedGraph = {};
      }
    }
  } );
} );