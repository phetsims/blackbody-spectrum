// Copyright 2014-2015, University of Colorado Boulder

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
  var Bounds2 = require( 'DOT/Bounds2' );
  var CheckBox = require( 'SUN/CheckBox' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Color = require( 'SCENERY/util/Color' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var GraphDrawingNode = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/GraphDrawingNode' );
  var HSlider = require( 'SUN/HSlider' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var MovableLabRuler = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/MovableLabRuler' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var RangeWithValue = require( 'DOT/RangeWithValue' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Shape = require( 'KITE/Shape' );
  var StarPath = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/StarPath' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var tempInKString = require( 'string!BLACKBODY_SPECTRUM/tempInK' );
  var showRulerString = require( 'string!BLACKBODY_SPECTRUM/showRuler' );
  var bString = require( 'string!BLACKBODY_SPECTRUM/b' );
  var gString = require( 'string!BLACKBODY_SPECTRUM/g' );
  var rString = require( 'string!BLACKBODY_SPECTRUM/r' );
  var saveString = require( 'string!BLACKBODY_SPECTRUM/save' );
  var clearString = require( 'string!BLACKBODY_SPECTRUM/clear' );
  var unitsCmString = require( 'string!BLACKBODY_SPECTRUM/units.cm' );

  // constants
  var CIRCLE_LABEL_COLOR = '#00EBEB';
  var SAVE_BUTTON_COLOR = 'yellow';
  var CLEAR_BUTTON_COLOR = 'red';
  var BUTTON_FONT = new PhetFont( 15 );
  var CIRCLE_RADIUS = 15;
  var LABEL_FONT = new PhetFont( 22 );
  var CHECK_BOX_TEXT_FILL = 'white';
  var MIN_TEMPERATURE = 100; // in kelvin
  var MAX_TEMPERATURE = 9000;
  var TITLE_FONT = new PhetFont( { size: 30, weight: 'bold' } );
  var SUBTITLE_FONT = new PhetFont( { size: 30, weight: 'bold' } );
  var TITLE_COLOR = Color.BLUE;
  var SUBTITLE_COLOR = '#00EBEB';
  var VALUE_DECIMAL_PLACES = 0;

  /**
   * Constructor for the BlackbodySpectrumView
   * @param {BlackbodySpectrumModel} model - main model for the simulation
   * @constructor
   */
  function BlackbodySpectrumScreenView( model ) {

    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, 1024, 618 ) } );

    var modelViewTransform = new ModelViewTransform2.createRectangleInvertedYMapping( model.bounds, this.layoutBounds );

    var blackbodySpectrumThermometer = new BlackbodySpectrumThermometer( model.temperatureProperty, {
      minTemperature: 0,
      maxTemperature: 6000,
      bulbDiameter: 50,
      tubeWidth: 30,
      tubeHeight: 400,
      lineWidth: 4,
      outlineStroke: 'white',
      tickSpacing: 15
    } );

    // temperature slider
    var temperatureRange = new RangeWithValue( MIN_TEMPERATURE, MAX_TEMPERATURE, model.temperatureProperty.value ); // in kelvin
    var temperatureSlider = new HSlider( model.temperatureProperty, temperatureRange,
      {
        trackSize: new Dimension2( 200, 5 ),
        thumbSize: new Dimension2( 30, 60 )
      } );
    temperatureSlider.rotation = -Math.PI / 2; // set it to vertical

    var titleNode = new Text( '?', { font: TITLE_FONT, fill: TITLE_COLOR } );
    var subtitleNode = new Text( tempInKString, { font: SUBTITLE_FONT, fill: SUBTITLE_COLOR } );
    var cornerRadius = 10;
    var rectangleTitle = new Rectangle( 0, 0, 100, 40, cornerRadius, cornerRadius, {
      fill: '#FFF',
      stroke: '#000',
      lineWidth: 1
    } );

    var circleBlu = new Circle( CIRCLE_RADIUS );
    var circleGre = new Circle( CIRCLE_RADIUS );
    var circleRed = new Circle( CIRCLE_RADIUS );
    var circleBluLabel = new Text( bString, { font: LABEL_FONT, fill: CIRCLE_LABEL_COLOR } );
    var circleGreLabel = new Text( gString, { font: LABEL_FONT, fill: CIRCLE_LABEL_COLOR } );
    var circleRedLabel = new Text( rString, { font: LABEL_FONT, fill: CIRCLE_LABEL_COLOR } );
    var glowingStarHalo = new Circle( 10 );
    var starPath = new StarPath();

    model.temperatureProperty.link( function( temperature ) {
      circleBlu.fill = model.getBluColor( temperature );
      circleGre.fill = model.getGreColor( temperature );
      circleRed.fill = model.getRedColor( temperature );
      glowingStarHalo.fill = model.getGlowingStarHaloColor( temperature );
      glowingStarHalo.radius = model.getGlowingStarHaloRadius( temperature );
      starPath.fill = model.getStarColor( temperature );
      starPath.stroke = model.getStarColor( temperature );
      titleNode.text = Util.toFixed( temperature, VALUE_DECIMAL_PLACES );
    } );

    // create movable lab ruler
    var isRulerVisibleProperty = new Property( false );
    var rulerPositionProperty = new Property( new Vector2( 120, 310 ) );

    var movableLabRuler = new MovableLabRuler( rulerPositionProperty, isRulerVisibleProperty,
      {
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
      }
    );

    // create ruler check box
    var showRulerCheckBox = CheckBox.createTextCheckBox( showRulerString, {
      font: LABEL_FONT,
      fill: CHECK_BOX_TEXT_FILL
    }, isRulerVisibleProperty );
    showRulerCheckBox.touchArea = Shape.rectangle( showRulerCheckBox.left, showRulerCheckBox.top - 15, showRulerCheckBox.width, showRulerCheckBox.height + 30 );


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

    var clearButton = new RectangularPushButton( {
      content: new Text( clearString, { font: BUTTON_FONT } ),
      baseColor: CLEAR_BUTTON_COLOR,
      listener: function() {
        graphNode.clear();
      }
    } );

    // rendering order
    this.addChild( rectangleTitle );
    this.addChild( titleNode );
    this.addChild( subtitleNode );
    this.addChild( graphNode );
    this.addChild( clearButton );
    this.addChild( saveButton );
    this.addChild( showRulerCheckBox );
    this.addChild( temperatureSlider );
    this.addChild( blackbodySpectrumThermometer );
    this.addChild( starPath );
    this.addChild( glowingStarHalo );
    this.addChild( circleBlu );
    this.addChild( circleGre );
    this.addChild( circleRed );
    this.addChild( circleBluLabel );
    this.addChild( circleGreLabel );
    this.addChild( circleRedLabel );
    this.addChild( resetAllButton );
    this.addChild( movableLabRuler );

    // layout for things that don't have a location in the model
    {
      graphNode.left = 20;
      graphNode.bottom = this.layoutBounds.maxY - 10;
      showRulerCheckBox.right = this.layoutBounds.maxX - 60;
      showRulerCheckBox.centerY = this.layoutBounds.maxY - 90;
      blackbodySpectrumThermometer.right = this.layoutBounds.maxX - 10;
      blackbodySpectrumThermometer.top = 100;
      saveButton.right = this.layoutBounds.maxX - 10;
      saveButton.top = 10;
      clearButton.right = saveButton.right;
      clearButton.top = saveButton.bottom + 10;
      temperatureSlider.right = blackbodySpectrumThermometer.left - 50;
      temperatureSlider.centerY = blackbodySpectrumThermometer.centerY;
      circleBlu.centerX = 300;
      circleBlu.centerY = 100;
      circleGre.centerX = circleBlu.centerX + 50;
      circleGre.centerY = circleBlu.centerY;
      circleRed.centerX = circleGre.centerX + 50;
      circleRed.centerY = circleBlu.centerY;
      circleBluLabel.centerX = circleBlu.centerX;
      circleBluLabel.centerY = circleBlu.centerY + 35;
      circleGreLabel.centerX = circleGre.centerX;
      circleGreLabel.centerY = circleBluLabel.centerY;
      circleRedLabel.centerX = circleRed.centerX;
      circleRedLabel.centerY = circleBluLabel.centerY;
      starPath.left = circleRed.right + 60;
      starPath.centerY = circleBlu.centerY;
      glowingStarHalo.centerX = starPath.centerX;
      glowingStarHalo.centerY = starPath.centerY;
      titleNode.centerX = temperatureSlider.centerX;
      titleNode.bottom = temperatureSlider.top - 30;
      rectangleTitle.centerX = temperatureSlider.centerX;
      rectangleTitle.centerY = titleNode.centerY;
      subtitleNode.centerX = temperatureSlider.centerX;
      subtitleNode.top = temperatureSlider.bottom + 30;
    }
  }

  blackbodySpectrum.register( 'BlackbodySpectrumScreenView', BlackbodySpectrumScreenView );

  return inherit( ScreenView, BlackbodySpectrumScreenView );
} );