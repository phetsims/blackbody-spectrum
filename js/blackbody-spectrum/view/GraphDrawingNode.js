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
  var WavelengthSpectrumNode = require( 'SCENERY_PHET/WavelengthSpectrumNode' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );
  var ZoomButton = require( 'SCENERY_PHET/buttons/ZoomButton' );
  var Property = require( 'AXON/Property' );

  // constants
  var XRAY_WAVELENGTH = 10; // in nm, max bounds for the x-ray part of the electromagnetic spectrum
  var ULTRAVIOLET_WAVELENGTH = 380; // in nm, max bounds for the uv part of the electromagnetic spectrum
  var VISIBLE_WAVELENGTH = 700; // in nm, max bounds for the visible part of the electromagnetic spectrum
  var INFRARED_WAVELENGTH = 1000; // in nm, max bounds for the visible part of the electromagnetic spectrum
  var HORIZONTAL_GRAPH_LENGTH = 550; // size of graph in scenery coordinates
  var VERTICAL_GRAPH_LENGTH = 400; // size of graph in scenery coordinates
  var COLOR_TICK_LABEL = 'yellow';
  var COLOR_AXIS_LABEL = 'rgb(0,235,235)'; // greenish blue
  var GRAPH_CURVE_LINE_WIDTH = 5;
  var GRAPH_AXES_COLOR = 'white';
  var GRAPH_CURVE_STROKE = 'red';
  var SAVED_GRAPH_CURVE_STROKE = '#996633';

  var HORIZONTAL_ZOOM_DEFAULT = 3000; // default wavelength in nanometers
  var VERTICAL_ZOOM_DEFAULT = 100;
  var HORIZONTAL_MIN_ZOOM = 750;
  var HORIZONTAL_MAX_ZOOM = 12000;
  var VERTICAL_MIN_ZOOM = 10;
  var VERTICAL_MAX_ZOOM = 1000;
  var HORIZONTAL_ZOOM_SCALING_FACTOR = 2;
  var VERTICAL_ZOOM_SCALING_FACTOR = Math.sqrt( 10 );

  // constants for ticks and axes
  var AXES_OPTIONS = {
    stroke: GRAPH_AXES_COLOR,
    lineWidth: 3,
    lineCap: 'round',
    lineJoin: 'round'
  };
  var TICK_OPTIONS = { stroke: GRAPH_AXES_COLOR, lineWidth: 2, lineCap: 'butt', lineJoin: 'bevel' };
  var MINOR_TICKS_PER_MAJOR_TICK = 5;
  var MAJOR_TICK_LENGTH = 20;
  var MINOR_TICK_LENGTH = 10;

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
    // effective zoom is HORIZONTAL_ZOOM_SCALING_FACTOR^horizontalZoomProperty.value
    var horizontalZoomProperty = new NumberProperty( HORIZONTAL_ZOOM_DEFAULT );

    // {Property.<number>}  zoom number for the vertical axis of the graph
    var verticalZoomProperty = new NumberProperty( VERTICAL_ZOOM_DEFAULT );

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

    // graph: blackbody curve
    // TODO annotate:  public/private ?
    this.graph = new Path( null, {
      stroke: GRAPH_CURVE_STROKE,
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

    // The axis for labelling different parts of the electromagnetic spectrum
    var spectrumLabelAxis = new Path(
      new Shape().moveTo( 0, -VERTICAL_GRAPH_LENGTH ).lineTo( HORIZONTAL_GRAPH_LENGTH, -VERTICAL_GRAPH_LENGTH ),
      AXES_OPTIONS
    );
    // The ticks and labels for the spectrum label
    var spectrumLabelTicks = new Path( null, TICK_OPTIONS );
    var labelOptions = {
      font: new PhetFont( 14 ),
      fill: GRAPH_AXES_COLOR
    };
    // The parent of all the text labels for the different regions of the electromagnetic spectrum
    var spectrumLabelTexts = new Node( {
      children: [
        new Text( 'X-Ray', labelOptions ),
        new Text( 'Ultraviolet', labelOptions ),
        new Text( 'Visible', labelOptions ),
        new Text( 'Infrared', labelOptions ),
        new Text( 'Radio', labelOptions )
      ]
    } );
    // A function that will update where the ticks and text labels are on the spectrumLabel
    function updateSpectrumLabel() {
      // Converts a given wavelength to a distance along the x-axis
      function wavelengthToDistance( wavelength ) {
        return wavelength * HORIZONTAL_GRAPH_LENGTH / model.wavelengthMax;
      }
      var ticksShape = new Shape();
      // Makes a tick at a given distance along the x-axis
      function makeTickAt( x ) {
        ticksShape.moveTo( x, -MINOR_TICK_LENGTH / 2 ).lineTo( x, MINOR_TICK_LENGTH );
      }
      // Maps all of the wavelengths to their distance along the axis if they are on the axis
      var tickLocations = [ XRAY_WAVELENGTH, ULTRAVIOLET_WAVELENGTH, VISIBLE_WAVELENGTH, INFRARED_WAVELENGTH ]
        .map( function( wavelength ) {
          return wavelengthToDistance( wavelength );
        } ).filter( function( distance ) {
          return distance <= HORIZONTAL_GRAPH_LENGTH;
        } );
      // Makes a tick at each distance that was on the axis
      tickLocations.forEach( function ( distance ) {
        return makeTickAt( distance );
      } );
      spectrumLabelTicks.shape = ticksShape;
      // Makes all text nodes invisible; they get set to be visible later on if they can be displayed
      spectrumLabelTexts.children.forEach( function( textNode ) {
        textNode.setVisible( false );
      } );
      // Sets the location for all of the text labels
      var labelTextBounds = [ 0 ].concat( tickLocations ).concat( HORIZONTAL_GRAPH_LENGTH );
      for ( var i = 0; i < labelTextBounds.length - 1; i++ ) {
        var lowerBoundDistance = labelTextBounds[ i ];
        var upperBoundDistance = labelTextBounds[ i + 1 ];
        var wavelengthLabel = spectrumLabelTexts.children[ i ];
        if ( upperBoundDistance - lowerBoundDistance >= wavelengthLabel.width ) {
          wavelengthLabel.setVisible( true );
          wavelengthLabel.setCenterX ( ( upperBoundDistance + lowerBoundDistance ) / 2 );
        }
      }
    }
    // The spectrumLabel's visibility is derived off of whether the labelsVisible is true or not
    model.labelsVisibleProperty.link( function ( labelsVisible ) {
      spectrumLabelAxis.setVisible( labelsVisible );
      spectrumLabelTicks.setVisible( labelsVisible );
      spectrumLabelTexts.setVisible( labelsVisible );
    } );

    function updateGraph( graph, temperature, intensity ) {
      var graphShape = new Shape();

      var radianceArray = model.coordinatesY( temperature );

      var numberPoints = radianceArray.length;
      var deltaWavelength = HORIZONTAL_GRAPH_LENGTH / ( numberPoints - 1 );
      var deltaRadiance = VERTICAL_GRAPH_LENGTH / verticalMax;
      var radianceScale = 1e33 * deltaRadiance; // from nm to m to the fifth power (1e45) and Mega/micron (1e-12)
      graphShape.moveTo( 0, -radianceScale * radianceArray[ 0 ] );

      for ( var i = 1; i < radianceArray.length; i++ ) {
        graphShape.lineTo( deltaWavelength * i, -radianceScale * radianceArray[ i ] ); /// need to flip y axis
      }

      // Easiest way to implement intensity shape is to copy graph shape and bring down to x-axis
      graph.shape = graphShape;
      if ( intensity ) {
        intensity.shape = graphShape.copy();
        var newPoint = new Vector2( HORIZONTAL_GRAPH_LENGTH, 0 );
        if ( intensity.shape.getLastPoint().minus( newPoint ).magnitude() > 0 ) {
          intensity.shape.lineToPoint( newPoint );
        }
        //TODO: display temperature of saved graph here
      }
    }

    // axes for the graph
    var axesShape = new Shape()
      .moveTo( HORIZONTAL_GRAPH_LENGTH, 0 )
      .lineTo( 0, 0 )
      .lineTo( 0, -VERTICAL_GRAPH_LENGTH )
      .lineTo( 5, -VERTICAL_GRAPH_LENGTH );

    var axesPath = new Path( axesShape, AXES_OPTIONS );

    // horizontal tick marks
    var ticks = new Path( null, TICK_OPTIONS );
    var graphBottom = 0;
    var minorTickSpacing = 20; // initial value

    function updateTicks( minorTickSpacing ) {

      var numberOfTicks = Util.roundSymmetric( HORIZONTAL_GRAPH_LENGTH / minorTickSpacing );
      var deltaX = HORIZONTAL_GRAPH_LENGTH / numberOfTicks;
      var shape = new Shape();

      for ( var i = 1; i <= numberOfTicks; i++ ) {
        var isMajorTick = i % MINOR_TICKS_PER_MAJOR_TICK === 0;
        var tickLength = isMajorTick ? MAJOR_TICK_LENGTH : MINOR_TICK_LENGTH;
        var x = i * deltaX;
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
      left: ultravioletPosition + axesPath.left
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
    model.temperatureProperty.link( function( temperature ) {
      updateGraph( self.graph, temperature, self.intensity );
    } );

    // Updates horizontal ticks, graph, and spectrum no horizontal zoom change
    horizontalZoomProperty.link( function( horizontalZoom ) {

      model.wavelengthMax = horizontalZoom;
      minorTickSpacing = 60000 / model.wavelengthMax;

      // spectrum position and width
      updateSpectrum();

      // update tick label
      horizontalTickLabelMax.text = model.wavelengthMax / 1000; // from nm to micron

      // update ticks
      updateTicks( minorTickSpacing );
      updateSpectrumLabel();

      // redraw blackbody curves
      updateGraph( self.graph, model.temperatureProperty.value, self.intensity );
      if ( self.savedGraph ) {
        updateGraph( self.savedGraph, self.savedTemperature );
      }

      horizontalZoomInButton.setEnabled( horizontalZoom > HORIZONTAL_MIN_ZOOM );
      horizontalZoomOutButton.setEnabled( horizontalZoom < HORIZONTAL_MAX_ZOOM );

    } );

    // Updates vertical ticks and graph on vertical zoom change
    verticalZoomProperty.link( function( verticalZoom ) {

      verticalMax = verticalZoom;
      verticalTickLabelMax.text = Util.toFixed( verticalMax, 0 ); // from nm to micron

      updateGraph( self.graph, model.temperatureProperty.value, self.intensity );
      if ( self.savedGraph ) {
        updateGraph( self.savedGraph, self.savedTemperature );
      }

      verticalZoomInButton.setEnabled( verticalZoom > VERTICAL_MIN_ZOOM );
      verticalZoomOutButton.setEnabled( verticalZoom < VERTICAL_MAX_ZOOM );

    } );

    // TODO use trigger and axon/Events instead
    // this.trigger( 'buttonPressed' )

    // handle zoom of graph
    horizontalZoomInButton.addListener( function() {
      horizontalZoomProperty.value *= 1 / HORIZONTAL_ZOOM_SCALING_FACTOR;
    } );

    horizontalZoomOutButton.addListener( function() {
      horizontalZoomProperty.value *= HORIZONTAL_ZOOM_SCALING_FACTOR;
    } );

    // handle zoom of graph
    verticalZoomInButton.addListener( function() {
      verticalZoomProperty.value *= 1 / VERTICAL_ZOOM_SCALING_FACTOR;
    } );
    verticalZoomOutButton.addListener( function() {
      verticalZoomProperty.value *= VERTICAL_ZOOM_SCALING_FACTOR;
    } );

    this.addChild( wavelengthSpectrumNode );
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
    this.addChild( spectrumLabelAxis );
    this.addChild( spectrumLabelTicks );
    this.addChild( spectrumLabelTexts );
    this.addChild( this.graph );
    this.addChild( this.intensity );

    // layout
    axesPath.bottom = 0;
    axesPath.left = 0;
    spectrumLabelAxis.top = axesPath.top;
    spectrumLabelAxis.left = axesPath.left;
    spectrumLabelTicks.centerY = spectrumLabelAxis.centerY;
    spectrumLabelTicks.left = axesPath.left;
    spectrumLabelTexts.bottom = spectrumLabelAxis.top;
    spectrumLabelTexts.left = axesPath.left;
    this.graph.bottom = axesPath.bottom;
    this.graph.left = axesPath.left;
    this.intensity.bottom = axesPath.bottom;
    this.intensity.left - axesPath.left;
    horizontalTickLabelZero.top = axesPath.bottom;
    horizontalTickLabelZero.centerX = axesPath.left;
    horizontalTickLabelMax.top = axesPath.bottom;
    horizontalTickLabelMax.centerX = axesPath.right;
    verticalTickLabelMax.right = axesPath.left;
    verticalTickLabelMax.centerY = axesPath.top - 10;
    horizontalZoomButtons.left = axesPath.right - 45;
    horizontalZoomButtons.top = axesPath.bottom + 40;
    horizontalZoomInButton.left = horizontalZoomOutButton.right + 10;
    horizontalZoomInButton.centerY = horizontalZoomOutButton.centerY;
    verticalZoomButtons.right = axesPath.left - 60;
    verticalZoomButtons.bottom = axesPath.top + 35;
    verticalZoomInButton.centerX = verticalZoomOutButton.centerX;
    verticalZoomInButton.bottom = verticalZoomOutButton.top - 10;
    wavelengthSpectrumNode.bottom = axesPath.bottom;
    verticalAxisLabelNode.right = axesPath.left - 20;
    verticalAxisLabelNode.centerY = -VERTICAL_GRAPH_LENGTH / 2;
    horizontalAxisTopLabelNode.top = axesPath.bottom + 20;
    horizontalAxisTopLabelNode.centerX = axesPath.centerX;
    horizontalAxisBottomLabelNode.top = horizontalAxisTopLabelNode.bottom + 5;
    horizontalAxisBottomLabelNode.centerX = axesPath.centerX;

    // @public
    this.hasSavedGraphProperty = new Property( false );

    this.resetGraphDrawingNode = function() {
      verticalZoomProperty.reset();
      horizontalZoomProperty.reset();
      self.hasSavedGraphProperty.reset();
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
      this.hasSavedGraphProperty.set( true );
    },

    /**
     * Clear the savedGraph form the scene graph
     * @public
     */
    clear: function() {
      if ( this.indexOfChild( this.savedGraph ) === -1 ) {
        // Saved graph doesn't exist
        return;
      }
      this.removeChild( this.savedGraph );
      this.savedGraph = {};
      this.hasSavedGraphProperty.set( false );
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