// Copyright 2014-2018, University of Colorado Boulder

/**
 * Main view for the BlackbodySpectrum simulation
 * Handles or contains all of the main graphical logic of the sim
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
 */
define( function( require ) {
  'use strict';

  // modules
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var BlackbodySpectrumThermometer = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackbodySpectrumThermometer' );
  var BlackBodySpectrumControlPanel = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackBodySpectrumControlPanel' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Color = require( 'SCENERY/util/Color' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var GraphDrawingNode = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/GraphDrawingNode' );
  var HSlider = require( 'SUN/HSlider' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RangeWithValue = require( 'DOT/RangeWithValue' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var TriangleSliderThumb = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/TriangleSliderThumb' );
  var StarPath = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/StarPath' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var SavedGraphInformationPanel = require ( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/SavedGraphInformationPanel' );

  // strings
  var bString = require( 'string!BLACKBODY_SPECTRUM/b' );
  var gString = require( 'string!BLACKBODY_SPECTRUM/g' );
  var rString = require( 'string!BLACKBODY_SPECTRUM/r' );
  var blackbodyTemperatureString = require( 'string!BLACKBODY_SPECTRUM/blackbodyTemperature' );

  // constants
  var CIRCLE_LABEL_COLOR = '#00EBEB';
  var CIRCLE_RADIUS = 15;
  var LABEL_FONT = new PhetFont( 22 );
  var MIN_TEMPERATURE = 300; // in kelvin
  var MAX_TEMPERATURE = 11000;
  var TITLE_FONT = new PhetFont( { size: 22, weight: 'bold' } );
  var TEMPERATURE_FONT = new PhetFont( { size: 20, weight: 'bold' } );
  var TITLE_COLOR = '#00EBEB';
  var TEMPERATURE_COLOR = Color.WHITE;
  var INSET = 10;
  var ARROW_OPTIONS = {
    fill: '#64dc64'
  };

  /**
   * Constructor for the BlackbodySpectrumView
   * @param {BlackbodySpectrumModel} model - the main model for the simulation
   * @constructor
   */
  function BlackbodySpectrumScreenView( model ) {

    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, 1024, 618 ) } );

    var blackbodySpectrumThermometer = new BlackbodySpectrumThermometer( model.mainBody.temperatureProperty );

    // Note: for HSlider nodes, coordinates go where x axis is from bottom to top, and y axis is from left to right
    // The selectable triangle for the temperature slider
    var thumbSize = new Dimension2( 20, 20 );
    var triangleNode = new TriangleSliderThumb( { size: thumbSize } );
    triangleNode.touchArea = triangleNode.localBounds.dilatedXY( 10, 10 );

    // Arrows that will disappear after first drag
    var cueingArrows = new Node( {
      children: [ new ArrowNode( 12, 0, 27, 0, ARROW_OPTIONS ), new ArrowNode( -12, 0, -27, 0, ARROW_OPTIONS ) ]
    } );

    // Parent that keeps the TriangleSliderThumb bundled with the temperature text
    var thumbNode = new Node( { size: new Dimension2( 20, 40 ) } );
    thumbNode.addChild( triangleNode );
    thumbNode.addChild( cueingArrows );

    // Creates a temperature slider in Kelvin with a range that is clamped between MIN_TEMPERATURE and MAX_TEMPERATURE
    var temperatureRange = new RangeWithValue( MIN_TEMPERATURE, MAX_TEMPERATURE, model.mainBody.temperatureProperty.value );
    var temperatureSlider = new HSlider( model.mainBody.temperatureProperty, temperatureRange, {
      trackSize: new Dimension2( 400, 5 ),
      thumbNode: thumbNode,
      thumbYOffset: 25,
      endDrag: function() {
        cueingArrows.visible = false;
      }
    } );
    temperatureSlider.rotation = -Math.PI / 2; // Sets the temperatureSlider to be vertical
    var thermometerLabel = new MultiLineText( blackbodyTemperatureString, { font: TITLE_FONT, fill: TITLE_COLOR } );

    // A text node that reflects the temperature of the slider or main model
    var temperatureText = new Text( '?', {
      font: TEMPERATURE_FONT,
      fill: TEMPERATURE_COLOR
    } );

    // The indicators that show how much red, blue, and green the current temperature would emit
    var circleBlue = new Circle( CIRCLE_RADIUS );
    var circleGreen = new Circle( CIRCLE_RADIUS );
    var circleRed = new Circle( CIRCLE_RADIUS );
    var circleBlueLabel = new Text( bString, { font: LABEL_FONT, fill: CIRCLE_LABEL_COLOR } );
    var circleGreenLabel = new Text( gString, { font: LABEL_FONT, fill: CIRCLE_LABEL_COLOR } );
    var circleRedLabel = new Text( rString, { font: LABEL_FONT, fill: CIRCLE_LABEL_COLOR } );
    var glowingStarHalo = new Circle( 10 );
    var starPath = new StarPath();

    // Links the current temperature to the RGB indicators and the temperature text along the TriangleSliderThumb
    model.mainBody.temperatureProperty.link( function( temperature ) {
      circleBlue.fill = model.mainBody.bluColor;
      circleGreen.fill = model.mainBody.greColor;
      circleRed.fill = model.mainBody.redColor;
      glowingStarHalo.fill = model.mainBody.glowingStarHaloColor;
      glowingStarHalo.radius = model.mainBody.glowingStarHaloRadius;
      starPath.fill = model.mainBody.starColor;
      starPath.stroke = model.mainBody.starColor;
      temperatureText.text = Util.toFixed( temperature, 0 ) + ' K';
      temperatureText.centerX = blackbodySpectrumThermometer.right - 16; // In case the size of the temperature text changes
    } );

    // create graph with zoom buttons
    var graphNode = new GraphDrawingNode( model );

    // create the Reset All Button in the bottom right
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        model.reset();
        graphNode.reset();
        cueingArrows.visible = true;
      }
    } );

    var controlPanel = new BlackBodySpectrumControlPanel( model );
    var savedInformationPanel = new SavedGraphInformationPanel( model, { minWidth: controlPanel.width } );

    // rendering order
    this.addChild( graphNode );
    this.addChild( controlPanel );
    this.addChild( savedInformationPanel );
    this.addChild( temperatureSlider );
    this.addChild( blackbodySpectrumThermometer );
    this.addChild( thermometerLabel );
    this.addChild( temperatureText );
    this.addChild( starPath );
    this.addChild( glowingStarHalo );
    this.addChild( circleBlue );
    this.addChild( circleGreen );
    this.addChild( circleRed );
    this.addChild( circleBlueLabel );
    this.addChild( circleGreenLabel );
    this.addChild( circleRedLabel );
    this.addChild( resetAllButton );

    // layout for things that don't have a location in the model
    graphNode.left = INSET;
    graphNode.bottom = this.layoutBounds.maxY - INSET;
    resetAllButton.right = this.layoutBounds.maxX - INSET;
    resetAllButton.bottom = this.layoutBounds.maxY - INSET;
    blackbodySpectrumThermometer.right = this.layoutBounds.maxX - temperatureSlider.width - INSET - 10;
    blackbodySpectrumThermometer.centerY = this.layoutBounds.centerY + 20;
    temperatureSlider.left = blackbodySpectrumThermometer.right;
    temperatureSlider.centerY = blackbodySpectrumThermometer.centerY - 14;
    temperatureText.bottom = blackbodySpectrumThermometer.top - 5;
    temperatureText.centerX = blackbodySpectrumThermometer.right - 16;
    thermometerLabel.centerX = blackbodySpectrumThermometer.right - 16;
    thermometerLabel.bottom = temperatureText.top - 5;
    controlPanel.right = blackbodySpectrumThermometer.left - 10;
    controlPanel.top = blackbodySpectrumThermometer.top;
    savedInformationPanel.centerX = controlPanel.centerX;
    savedInformationPanel.top = controlPanel.bottom + 55;
    circleBlue.centerX = 225;
    circleBlue.centerY = 50;
    circleGreen.centerX = circleBlue.centerX + 50;
    circleGreen.centerY = circleBlue.centerY;
    circleRed.centerX = circleGreen.centerX + 50;
    circleRed.centerY = circleBlue.centerY;
    circleBlueLabel.centerX = circleBlue.centerX;
    circleBlueLabel.centerY = circleBlue.centerY + 35;
    circleGreenLabel.centerX = circleGreen.centerX;
    circleGreenLabel.centerY = circleBlueLabel.centerY;
    circleRedLabel.centerX = circleRed.centerX;
    circleRedLabel.centerY = circleBlueLabel.centerY;
    starPath.left = circleRed.right + 60;
    starPath.centerY = circleBlue.centerY;
    glowingStarHalo.centerX = starPath.centerX;
    glowingStarHalo.centerY = starPath.centerY;
  }

  blackbodySpectrum.register( 'BlackbodySpectrumScreenView', BlackbodySpectrumScreenView );

  return inherit( ScreenView, BlackbodySpectrumScreenView );
} );