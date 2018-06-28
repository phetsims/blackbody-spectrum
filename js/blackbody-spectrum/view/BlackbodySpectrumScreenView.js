// Copyright 2014-2018, University of Colorado Boulder

/**
 * View for the 'BlackbodySpectrum' screen.
 *
 * @author Martin Veillette (Berea College)
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
    fill: 'green'
  };
  var INTENSITY_LABEL_OPTIONS = {
    fill: 'white',
    font: new PhetFont( 16 )
  };
  var INTENSITY_TEXT_OPTIONS = {
    font: new PhetFont( 16 ),
    fill: 'black'
  };
  var INTENSITY_TEXT_BOX_STROKE = 'red';
  var INTENSITY_TEXT_BOX_FILL = 'gray';

  // noinspection JSAnnotator
  /**
   * Constructor for the BlackbodySpectrumView
   * @param {BlackbodySpectrumModel} model - main model for the simulation
   * @constructor
   */
  function BlackbodySpectrumScreenView( model ) {

    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, 1024, 618 ) } );

    var blackbodySpectrumThermometer = new BlackbodySpectrumThermometer( model.temperatureProperty );

    // Note: for HSlider nodes, coordinates go where x axis is from bottom to top, and y axis is from left to right
    // The selectable triangle for the temperature slider
    var thumbSize = new Dimension2( 20, 20 );
    var triangleNode = new TriangleSliderThumb( { size: thumbSize } );
    triangleNode.touchArea = triangleNode.localBounds.dilatedXY( 10, 10 );

    // The text display for current selected temperature of the slider
    var temperatureNode = new Text( '?', { font: TEMPERATURE_FONT, fill: TEMPERATURE_COLOR } );
    temperatureNode.rotation = Math.PI / 2;

    // Arrows that will disappear after first drag
    var topArrow = new ArrowNode( 12, 0, 27, 0, ARROW_OPTIONS );
    var bottomArrow = new ArrowNode( -12, 0, -27, 0, ARROW_OPTIONS );

    // Parent that keeps the TriangleSliderThumb bundled with the temperature text
    var thumbNode = new Node( { size: new Dimension2( 20, 40 ) } );
    thumbNode.addChild( triangleNode );
    thumbNode.addChild( temperatureNode );
    thumbNode.addChild( topArrow );
    thumbNode.addChild( bottomArrow );

    // Aligns the temperature text below and just to the right of the TriangleSliderThumb
    temperatureNode.top = triangleNode.bottom + 5;
    // Aligns the temperature text to be along the same vertical space as the TriangleSliderThumb
    temperatureNode.centerX = triangleNode.centerX;

    // Creates a temperature slider in Kelvin with a range that is clamped between MIN_TEMPERATURE and MAX_TEMPERATURE
    var temperatureRange = new RangeWithValue( MIN_TEMPERATURE, MAX_TEMPERATURE, model.temperatureProperty.value );
    var temperatureSlider = new HSlider( model.temperatureProperty, temperatureRange, {
      trackSize: new Dimension2( 400, 5 ),
      thumbNode: thumbNode,
      thumbYOffset: 25,
      endDrag: function() {
        topArrow.setVisible( false );
        bottomArrow.setVisible( false );
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
    // The actual text that shows the model's intensity
    var intensityText = new RichText( '?', INTENSITY_TEXT_OPTIONS );
    // The box that surrounds the text showing the model's intensity
    var intensityTextBox = new Rectangle( 0, 0, intensityText.width + 5, intensityText.height + 5, 0, 0, {
      children: [ intensityText ],
      stroke: INTENSITY_TEXT_BOX_STROKE,
      fill: INTENSITY_TEXT_BOX_FILL
    } );
    // The label and the box containing the intensity value text have the same visibility as the model's intensityVisibleProperty
    model.intensityVisibleProperty.link( function( intensityVisible ) {
      intensityTextBox.setVisible( intensityVisible );
      intensityLabel.setVisible( intensityVisible );
    } );

    // Links the current temperature to the RGB indicators and the temperature text along the TriangleSliderThumb
    model.temperatureProperty.link( function( temperature ) {
      circleBlue.fill = model.getBluColor( temperature );
      circleGreen.fill = model.getGreColor( temperature );
      circleRed.fill = model.getRedColor( temperature );
      glowingStarHalo.fill = model.getGlowingStarHaloColor( temperature );
      glowingStarHalo.radius = model.getGlowingStarHaloRadius( temperature );
      starPath.fill = model.getStarColor( temperature );
      starPath.stroke = model.getStarColor( temperature );
      temperatureNode.text = Util.toFixed( temperature, VALUE_DECIMAL_PLACES ) + ' K';
      // Gets the model intensity and formats it to a nice scientific notation string to put as the intensityText
      var notationObject = ScientificNotationNode.toScientificNotation( model.totalIntensity, {
        mantissaDecimalPlaces: 2
      } );
      var formattedString = notationObject.mantissa;
      if ( notationObject.exponent !== '0' ) {
        formattedString += ' X 10<sup>' + notationObject.exponent + '</sup>';
      }
      intensityText.text = StringUtils.fillIn( intensityLabelPatternString, { intensity: formattedString } );
      intensityTextBox.setRect( 0, 0, intensityText.width + 5, intensityText.height + 5, 0, 0 );
      intensityText.setCenter( new Vector2( intensityTextBox.width / 2, intensityTextBox.height / 2 ) );
    } );

    // create graph with zoom buttons
    var graphNode = new GraphDrawingNode( model );

    // create the Reset All Button in the bottom right
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        model.reset();
        graphNode.reset();
        graphNode.clear();
        topArrow.setVisible( true );
        bottomArrow.setVisible( true );
      }
    } );

    var controlPanel = new BlackBodySpectrumControlPanel( model, graphNode );

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
    this.addChild( intensityTextBox );
    this.addChild( intensityLabel );
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
    topArrow.centerY = temperatureNode.centerY;
    bottomArrow.centerY = temperatureNode.centerY;
    intensityTextBox.centerX = graphNode.right - 150;
    intensityTextBox.centerY = (circleBlue.centerY + circleBlueLabel.centerY) / 2;
    intensityText.setCenter( new Vector2( intensityTextBox.width / 2, intensityTextBox.height / 2 ) );
    intensityLabel.bottom = intensityTextBox.top;
    intensityLabel.left = intensityTextBox.left;
  }

  blackbodySpectrum.register( 'BlackbodySpectrumScreenView', BlackbodySpectrumScreenView );

  return inherit( ScreenView, BlackbodySpectrumScreenView );
} );