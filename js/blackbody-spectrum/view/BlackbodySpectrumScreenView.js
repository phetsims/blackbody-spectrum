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
  var Checkbox = require( 'SUN/Checkbox' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Color = require( 'SCENERY/util/Color' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var GraphDrawingNode = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/GraphDrawingNode' );
  var HSlider = require( 'SUN/HSlider' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var MovableLabRuler = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/MovableLabRuler' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var RangeWithValue = require( 'DOT/RangeWithValue' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Shape = require( 'KITE/Shape' );
  var TriangleSliderThumb = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/TriangleSliderThumb' );
  var StarPath = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/StarPath' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var bString = require( 'string!BLACKBODY_SPECTRUM/b' );
  var clearString = require( 'string!BLACKBODY_SPECTRUM/clear' );
  var gString = require( 'string!BLACKBODY_SPECTRUM/g' );
  var rString = require( 'string!BLACKBODY_SPECTRUM/r' );
  var saveString = require( 'string!BLACKBODY_SPECTRUM/save' );
  var showRulerString = require( 'string!BLACKBODY_SPECTRUM/showRuler' );
  var blackbodyTemperatureString = require( 'string!BLACKBODY_SPECTRUM/blackbodyTemperature' );
  var unitsCmString = require( 'string!BLACKBODY_SPECTRUM/units.cm' );

  // constants
  var CIRCLE_LABEL_COLOR = '#00EBEB';
  var SAVE_BUTTON_COLOR = 'yellow';
  var CLEAR_BUTTON_COLOR = 'red';
  var BUTTON_FONT = new PhetFont( 15 );
  var CIRCLE_RADIUS = 15;
  var LABEL_FONT = new PhetFont( 22 );
  var CHECK_BOX_TEXT_FILL = 'white';
  var MIN_TEMPERATURE = 300; // in kelvin
  var MAX_TEMPERATURE = 11000;
  var TITLE_FONT = new PhetFont( { size: 30, weight: 'bold' } );
  var TEMPERATURE_FONT = new PhetFont( { size: 30, weight: 'bold' } );
  var TITLE_COLOR = Color.WHITE;
  var TEMPERATURE_COLOR = '#00EBEB';
  var VALUE_DECIMAL_PLACES = 0;

  // noinspection JSAnnotator
  /**
   * Constructor for the BlackbodySpectrumView
   * @param {BlackbodySpectrumModel} model - main model for the simulation
   * @constructor
   */
  function BlackbodySpectrumScreenView( model ) {

    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, 1024, 618 ) } );

    var modelViewTransform = new ModelViewTransform2.createRectangleInvertedYMapping( model.bounds, this.layoutBounds );

    var blackbodySpectrumThermometer = new BlackbodySpectrumThermometer( model.temperatureProperty );

    // custom thumb
    var thumbSize = new Dimension2( 20, 20 );
    var triangleNode = new TriangleSliderThumb( { size: thumbSize } );
    triangleNode.touchArea = triangleNode.localBounds.dilatedXY( 10, 10 );

    var temperatureNode = new Text( '?', { font: TEMPERATURE_FONT, fill: TEMPERATURE_COLOR } );
    temperatureNode.rotation = Math.PI / 2;

    var thumbNode = new Node( { size: new Dimension2( 20, 40 ) } );
    thumbNode.addChild( triangleNode );
    thumbNode.addChild( temperatureNode );

    temperatureNode.top = triangleNode.bottom + 5;
    temperatureNode.centerX = triangleNode.centerX;

    // temperature slider, in kelvin
    var temperatureRange = new RangeWithValue( MIN_TEMPERATURE, MAX_TEMPERATURE, model.temperatureProperty.value );
    var temperatureSlider = new HSlider( model.temperatureProperty, temperatureRange, {
      trackSize: new Dimension2( 400, 5 ),
      thumbNode: thumbNode,
      thumbYOffset: 25
    } );
    temperatureSlider.rotation = -Math.PI / 2; // set it to vertical
    var thermometerLabel = new MultiLineText( blackbodyTemperatureString, { font: TITLE_FONT, fill: TITLE_COLOR } );

    var circleBlue = new Circle( CIRCLE_RADIUS );
    var circleGreen = new Circle( CIRCLE_RADIUS );
    var circleRed = new Circle( CIRCLE_RADIUS );
    var circleBlueLabel = new Text( bString, { font: LABEL_FONT, fill: CIRCLE_LABEL_COLOR } );
    var circleGreenLabel = new Text( gString, { font: LABEL_FONT, fill: CIRCLE_LABEL_COLOR } );
    var circleRedLabel = new Text( rString, { font: LABEL_FONT, fill: CIRCLE_LABEL_COLOR } );
    var glowingStarHalo = new Circle( 10 );
    var starPath = new StarPath();

    model.temperatureProperty.link( function( temperature ) {
      circleBlue.fill = model.getBluColor( temperature );
      circleGreen.fill = model.getGreColor( temperature );
      circleRed.fill = model.getRedColor( temperature );
      glowingStarHalo.fill = model.getGlowingStarHaloColor( temperature );
      glowingStarHalo.radius = model.getGlowingStarHaloRadius( temperature );
      starPath.fill = model.getStarColor( temperature );
      starPath.stroke = model.getStarColor( temperature );
      temperatureNode.text = Util.toFixed( temperature, VALUE_DECIMAL_PLACES );
    } );

    // create movable lab ruler
    var isRulerVisibleProperty = new Property( false );
    var rulerPositionProperty = new Property( new Vector2( 120, 310 ) );

    var movableLabRuler = new MovableLabRuler( rulerPositionProperty, isRulerVisibleProperty, {
      rulerLength: 0.25, // in model coordinates, i.e. 0.25 meters
      multiplier: 100, // multiplier of base units
      units: unitsCmString,  //
      unitsFont: new PhetFont( 16 ),
      rulerHeightInModel: 0.05, // in model coordinates
      majorTickSeparation: 0.05, // in model coordinates
      angle: Math.PI / 2,
      modelViewTransform: modelViewTransform,
      dragBounds: this.layoutBounds,
      minorTicksPerMajorTick: 4
    } );

    // create ruler checkbox
    var showRulerCheckbox = Checkbox.createTextCheckbox( showRulerString, {
      font: LABEL_FONT,
      fill: CHECK_BOX_TEXT_FILL
    }, isRulerVisibleProperty );
    showRulerCheckbox.touchArea = Shape.rectangle( showRulerCheckbox.left, showRulerCheckbox.top - 15,
      showRulerCheckbox.width, showRulerCheckbox.height + 30 );

    // create graph with zoom buttons
    var graphNode = new GraphDrawingNode( model, modelViewTransform );

    // create the Reset All Button in the bottom right
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        model.temperatureProperty.reset();
        rulerPositionProperty.reset();
        isRulerVisibleProperty.reset();
        //   model.wavelengthMax = 100;
        graphNode.reset();
        graphNode.clear();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );

    // create the save and clear buttons
    var saveButton = new RectangularPushButton( {
      content: new Text( saveString, { font: BUTTON_FONT } ),
      baseColor: SAVE_BUTTON_COLOR,
      listener: function() {
        graphNode.save( model.temperatureProperty.value );
      }
    } );

    var controlPanel = new BlackBodySpectrumControlPanel( model );

    var clearButton = new RectangularPushButton( {
      content: new Text( clearString, { font: BUTTON_FONT } ),
      baseColor: CLEAR_BUTTON_COLOR,
      listener: function() {
        graphNode.clear();
      }
    } );

    // rendering order
    this.addChild( graphNode );
    this.addChild( clearButton );
    this.addChild( saveButton );
    this.addChild( controlPanel );
    this.addChild( showRulerCheckbox );
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
    this.addChild( resetAllButton );
    this.addChild( movableLabRuler );

    // layout for things that don't have a location in the model
    graphNode.left = 20;
    graphNode.bottom = this.layoutBounds.maxY - 10;
    showRulerCheckbox.right = this.layoutBounds.maxX - 60;
    showRulerCheckbox.centerY = this.layoutBounds.maxY - 90;
    blackbodySpectrumThermometer.left = graphNode.left + 600;
    blackbodySpectrumThermometer.top = 50;
    controlPanel.right = this.layoutBounds.maxX - 10;
    controlPanel.top = 10;
    saveButton.right = controlPanel.right;
    saveButton.top = controlPanel.bottom + 10;
    clearButton.right = saveButton.right;
    clearButton.top = saveButton.bottom + 10;
    temperatureSlider.left = blackbodySpectrumThermometer.right;
    temperatureSlider.centerY = blackbodySpectrumThermometer.centerY - 14;
    thermometerLabel.centerX = blackbodySpectrumThermometer.right - 16;
    thermometerLabel.top = blackbodySpectrumThermometer.bottom;
    circleBlue.centerX = 300;
    circleBlue.centerY = 100;
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