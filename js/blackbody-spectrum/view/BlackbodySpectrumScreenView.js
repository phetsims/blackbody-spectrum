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
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Vector2 = require( 'DOT/Vector2' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var ScientificNotationNode = require( 'SCENERY_PHET/ScientificNotationNode' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var GenericCurveShape = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/GenericCurveShape' );
  var Path = require( 'SCENERY/nodes/Path' );

  // strings
  var bString = require( 'string!BLACKBODY_SPECTRUM/b' );
  var gString = require( 'string!BLACKBODY_SPECTRUM/g' );
  var rString = require( 'string!BLACKBODY_SPECTRUM/r' );
  var blackbodyTemperatureString = require( 'string!BLACKBODY_SPECTRUM/blackbodyTemperature' );
  var intensityString = require( 'string!BLACKBODY_SPECTRUM/intensity' );
  var intensityLabelPatternString = require( 'string!BLACKBODY_SPECTRUM/intensityLabelPattern' );

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
  var VALUE_DECIMAL_PLACES = 0;
  var INSET = 10;
  var ARROW_OPTIONS = {
    fill: '#64dc64'
  };
  var INTENSITY_LABEL_OPTIONS = {
    fill: 'white',
    font: new PhetFont( 12 )
  };
  var INTENSITY_TEXT_OPTIONS = {
    font: new PhetFont( 16 ),
    fill: 'black'
  };
  var INTENSITY_TEXT_BOX_STROKE = 'red';
  var INTENSITY_TEXT_BOX_FILL = 'gray';
  var SAVED_TEMPERATURE_LABEL_OPTIONS = {
    font: new PhetFont( 16 ),
    fill: 'white'
  };
  var LAYOUT_BOX_SPACING = 10;
  var GENERIC_CURVE_WIDTH = 50;
  var GENERIC_CURVE_LINE_WIDTH = 5;

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

    // The text display for current selected temperature of the slider
    var temperatureNode = new Text( '?', { font: TEMPERATURE_FONT, fill: TEMPERATURE_COLOR } );
    temperatureNode.rotation = Math.PI / 2;

    // Arrows that will disappear after first drag
    var cueingArrows = new Node( {
      children: [ new ArrowNode( 12, 0, 27, 0, ARROW_OPTIONS ), new ArrowNode( -12, 0, -27, 0, ARROW_OPTIONS ) ]
    } );

    // Parent that keeps the TriangleSliderThumb bundled with the temperature text
    var thumbNode = new Node( { size: new Dimension2( 20, 40 ) } );
    thumbNode.addChild( triangleNode );
    thumbNode.addChild( temperatureNode );
    thumbNode.addChild( cueingArrows );

    // Aligns the temperature text below and just to the right of the TriangleSliderThumb
    temperatureNode.top = triangleNode.bottom + 5;
    // Aligns the temperature text to be along the same vertical space as the TriangleSliderThumb
    temperatureNode.centerX = triangleNode.centerX;

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

    // The indicators that show how much red, blue, and green the current temperature would emit
    var circleBlue = new Circle( CIRCLE_RADIUS );
    var circleGreen = new Circle( CIRCLE_RADIUS );
    var circleRed = new Circle( CIRCLE_RADIUS );
    var circleBlueLabel = new Text( bString, { font: LABEL_FONT, fill: CIRCLE_LABEL_COLOR } );
    var circleGreenLabel = new Text( gString, { font: LABEL_FONT, fill: CIRCLE_LABEL_COLOR } );
    var circleRedLabel = new Text( rString, { font: LABEL_FONT, fill: CIRCLE_LABEL_COLOR } );
    var glowingStarHalo = new Circle( 10 );
    var starPath = new StarPath();

    // The label above the box that shows the model's current intensity
    var intensityLabel = new Text( intensityString, INTENSITY_LABEL_OPTIONS );
    var intensityText = new RichText( '?', INTENSITY_TEXT_OPTIONS );
    var intensityTextBox = new Rectangle( 0, 0, intensityText.width + 5, intensityText.height + 5, 0, 0, {
      children: [ intensityText ],
      stroke: INTENSITY_TEXT_BOX_STROKE,
      fill: INTENSITY_TEXT_BOX_FILL
    } );

    // The label and the box containing the intensity value text have the same visibility as the model's intensityVisibleProperty
    model.intensityVisibleProperty.link( function( intensityVisible ) {
      intensityTextBox.visible = intensityVisible;
      intensityLabel.visible = intensityVisible;
    } );

    // The labels and icons that represent the saved temperatures
    var primarySavedTemperatureLabel = new Text( '', SAVED_TEMPERATURE_LABEL_OPTIONS );
    var secondarySavedTemperatureLabel = new Text( '', SAVED_TEMPERATURE_LABEL_OPTIONS );
    var primaryGenericCurve = new Path( new GenericCurveShape(), {
      stroke: 'gray',
      lineWidth: GENERIC_CURVE_LINE_WIDTH,
      maxWidth: GENERIC_CURVE_WIDTH
    } );
    var secondaryGenericCurve = new Path( new GenericCurveShape(), {
      stroke: 'gray',
      lineDash: [ 5, 5 ],
      lineWidth: GENERIC_CURVE_LINE_WIDTH,
      maxWidth: GENERIC_CURVE_WIDTH
    } );
    var primarySavedTemperatureBox = new HBox( {
      children: [ primaryGenericCurve, primarySavedTemperatureLabel ],
      spacing: LAYOUT_BOX_SPACING
    } );
    var secondarySavedTemperatureBox = new HBox( {
      children: [ secondaryGenericCurve, secondarySavedTemperatureLabel ],
      spacing: LAYOUT_BOX_SPACING
    } );

    // Links the saved bodies to the saved temperature boxes' visibility and text
    model.savedBodies.lengthProperty.link( function( numberOfSavedBodies ) {
      primarySavedTemperatureBox.visible = numberOfSavedBodies > 0;
      secondarySavedTemperatureBox.visible = numberOfSavedBodies > 1;
      if ( numberOfSavedBodies > 0 ) {
        primarySavedTemperatureLabel.text = Util.toFixed( model.savedBodies.get( numberOfSavedBodies - 1 ).temperatureProperty.value, 0 ) + ' K';
        secondarySavedTemperatureLabel.text = Util.toFixed( model.savedBodies.get( 0 ).temperatureProperty.value, 0 ) + ' K'; // text is set, but this label isn't necessarily visible
      }
    } );

    // The menu that contains the intensity and saved temperature information
    var informationMenu = new VBox( {
      children: [
        primarySavedTemperatureBox,
        secondarySavedTemperatureBox,
        new Node( { // new node used to package intensity information together
          children: [ intensityLabel, intensityTextBox ]
        } )
      ],
      spacing: LAYOUT_BOX_SPACING
    } );

    // Links the current temperature to the RGB indicators and the temperature text along the TriangleSliderThumb
    model.mainBody.temperatureProperty.link( function( temperature ) {
      circleBlue.fill = model.mainBody.bluColor;
      circleGreen.fill = model.mainBody.greColor;
      circleRed.fill = model.mainBody.redColor;
      glowingStarHalo.fill = model.mainBody.glowingStarHaloColor;
      glowingStarHalo.radius = model.mainBody.glowingStarHaloRadius;
      starPath.fill = model.mainBody.starColor;
      starPath.stroke = model.mainBody.starColor;
      temperatureNode.text = Util.toFixed( temperature, VALUE_DECIMAL_PLACES ) + ' K';
      // Gets the model intensity and formats it to a nice scientific notation string to put as the intensityText
      var notationObject = ScientificNotationNode.toScientificNotation( model.mainBody.totalIntensity, {
        mantissaDecimalPlaces: 2
      } );
      var formattedString = notationObject.mantissa;
      if ( notationObject.exponent !== '0' ) {
        formattedString += ' X 10<sup>' + notationObject.exponent + '</sup>';
      }
      intensityText.text = StringUtils.fillIn( intensityLabelPatternString, { intensity: formattedString } );
      intensityTextBox.setRect( 0, 0, intensityText.width + 5, intensityText.height + 5, 0, 0 );
      intensityText.center = new Vector2( intensityTextBox.width / 2, intensityTextBox.height / 2 );
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

    // rendering order
    this.addChild( graphNode );
    this.addChild( controlPanel );
    this.addChild( temperatureSlider );
    this.addChild( blackbodySpectrumThermometer );
    this.addChild( thermometerLabel );
    this.addChild( starPath );
    this.addChild( glowingStarHalo );
    this.addChild( circleBlue );
    this.addChild( circleGreen );
    this.addChild( circleRed );
    this.addChild( circleBlueLabel );
    this.addChild( circleGreenLabel );
    this.addChild( circleRedLabel );
    this.addChild( informationMenu );
    this.addChild( resetAllButton );

    // layout for things that don't have a location in the model
    graphNode.left = 20;
    graphNode.bottom = this.layoutBounds.maxY - INSET;
    resetAllButton.right = this.layoutBounds.maxX - INSET;
    resetAllButton.bottom = this.layoutBounds.maxY - INSET;
    blackbodySpectrumThermometer.left = graphNode.left + 620;
    blackbodySpectrumThermometer.top = 30;
    controlPanel.right = this.layoutBounds.maxX - INSET;
    controlPanel.top = INSET;
    temperatureSlider.left = blackbodySpectrumThermometer.right;
    temperatureSlider.centerY = blackbodySpectrumThermometer.centerY - 14;
    thermometerLabel.centerX = blackbodySpectrumThermometer.right - 16;
    thermometerLabel.top = blackbodySpectrumThermometer.bottom;
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
    cueingArrows.centerY = temperatureNode.centerY;
    informationMenu.centerX = graphNode.right - 150;
    informationMenu.centerY = circleBlue.centerY;
    intensityText.center = new Vector2( intensityTextBox.width / 2, intensityTextBox.height / 2 );
    intensityLabel.bottom = intensityTextBox.top;
  }

  blackbodySpectrum.register( 'BlackbodySpectrumScreenView', BlackbodySpectrumScreenView );

  return inherit( ScreenView, BlackbodySpectrumScreenView );
} );