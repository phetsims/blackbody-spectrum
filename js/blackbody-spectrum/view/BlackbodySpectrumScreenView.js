//  Copyright 2002-2014, University of Colorado Boulder

/**
 * View for the 'BlackbodySpectrum' screen.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var CheckBox = require( 'SUN/CheckBox' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var GraphDrawingNode = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/GraphDrawingNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Range = require( 'DOT/Range' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Shape = require( 'KITE/Shape' );
  var StarNode = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/StarNode' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ThermometerNode = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/ThermometerNode' );
  var VerticalSlider = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/VerticalSlider' );
  var VerticalLabRuler = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/VerticalLabRuler' );

  // strings

  //  var pattern_parentheses_0text = require( 'string!MOLARITY/pattern.parentheses.0text' );

  // Resources

  var tempInKString = require( 'string!BLACKBODY_SPECTRUM/tempInK' );
  var showRulerString = require( 'string!BLACKBODY_SPECTRUM/showRuler' );
  var bString = require( 'string!BLACKBODY_SPECTRUM/b' );
  var gString = require( 'string!BLACKBODY_SPECTRUM/g' );
  var rString = require( 'string!BLACKBODY_SPECTRUM/r' );
  var saveString = require( 'string!BLACKBODY_SPECTRUM/save' );
  var clearString = require( 'string!BLACKBODY_SPECTRUM/clear' );

  // constants

  var circleLabelColor = "#00EBEB";

  /**
   * Constructor for the BlackbodySpectrumView
   * @param {BlackbodySpectrumModel} blackbodySpectrumModel the model for the entire screen
   * @constructor
   */
  function BlackbodySpectrumView( blackbodySpectrumModel ) {

    var thisView = this;

    ScreenView.call( thisView, {renderer: 'svg'} );

    this.layoutBounds = new Bounds2( 0, 0, 1100, 700 );

    var modelViewTransform = new ModelViewTransform.createRectangleInvertedYMapping( blackbodySpectrumModel.bounds, this.layoutBounds );


    var thermometerNode = new ThermometerNode( blackbodySpectrumModel.temperatureProperty, {
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
    var minTemperatureSlider = 0; //in kelvin
    var maxTemperatureSlider = 9000;
    var simpleRange = new Range( minTemperatureSlider, maxTemperatureSlider, blackbodySpectrumModel.temperature ); //  kelvin
    var temperatureSlider = new VerticalSlider(
      tempInKString,
      new Dimension2( 5, 200 ),
      blackbodySpectrumModel.temperatureProperty,
      simpleRange,
      0 );

    // Show Ruler check box
    var showRulerCheckBox = CheckBox.createTextCheckBox( showRulerString, {
      font: new PhetFont( 22 ),
      fill: "#FFF"
    }, blackbodySpectrumModel.isRulerVisibleProperty );
    showRulerCheckBox.touchArea = Shape.rectangle( showRulerCheckBox.left, showRulerCheckBox.top - 15, showRulerCheckBox.width, showRulerCheckBox.height + 30 );

    //
    var circleBlu = new Circle( 15 );
    var circleGre = new Circle( 15 );
    var circleRed = new Circle( 15 );
    var circleBluLabel = new Text( bString, {font: new PhetFont( 28 ), fill: circleLabelColor} );
    var circleGreLabel = new Text( gString, {font: new PhetFont( 28 ), fill: circleLabelColor} );
    var circleRedLabel = new Text( rString, {font: new PhetFont( 28 ), fill: circleLabelColor} );

    var glowingHaloStar = new Circle( 10 );
    var starNode = new StarNode( blackbodySpectrumModel.starColorProperty, {innerRadius: 20, outerRadius: 35} );


    blackbodySpectrumModel.temperatureProperty.link( function() {
      circleBlu.fill = blackbodySpectrumModel.getBluColor();
      circleGre.fill = blackbodySpectrumModel.getGreColor();
      circleRed.fill = blackbodySpectrumModel.getRedColor();
      glowingHaloStar.fill = blackbodySpectrumModel.getGlowingStarHaloColor();
      glowingHaloStar.radius = blackbodySpectrumModel.getGlowingStarHaloRadius();
    } );


    var verticalLabRuler = new VerticalLabRuler( blackbodySpectrumModel.rulerPositionProperty, blackbodySpectrumModel.isRulerVisibleProperty );


    // Create and add the Reset All Button in the bottom right
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        blackbodySpectrumModel.reset();
        graphNode.clear();
      },
      right:  this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );


    // create graph with zoom buttons
    var graphNode = new GraphDrawingNode( blackbodySpectrumModel, modelViewTransform );


    // create the save and clear buttons
    var saveButton = new RectangularPushButton( {
      content: new Text( saveString, {font: new PhetFont( 15 )} ),
      baseColor: 'yellow',
      listener: function() {graphNode.save( blackbodySpectrumModel.temperature ); }
    } );

    var clearButton = new RectangularPushButton( {
      content: new Text( clearString, {font: new PhetFont( 15 )} ),
      baseColor: 'red',
      listener: function() {graphNode.clear(); }
    } );


    this.addChild( graphNode );
    this.addChild( clearButton );
    this.addChild( saveButton );
    this.addChild( showRulerCheckBox );
    this.addChild( temperatureSlider );
    this.addChild( thermometerNode );
    this.addChild( starNode );
    this.addChild( glowingHaloStar );
    this.addChild( circleBlu );
    this.addChild( circleGre );
    this.addChild( circleRed );
    this.addChild( circleBluLabel );
    this.addChild( circleGreLabel );
    this.addChild( circleRedLabel );
    this.addChild( resetAllButton );
    this.addChild( verticalLabRuler );

//        graphNode.spectrum.moveToBack();
    //   graphNode.graph.moveToFront();
    graphNode.moveChildToBack( graphNode.spectrum );
    graphNode.moveChildToFront( graphNode.graph );
    // layout for things that don't have a location in the model
    {

      graphNode.left = 20;
      graphNode.bottom = this.layoutBounds.maxY - 10;
      showRulerCheckBox.right = 1000;
      showRulerCheckBox.centerY = 650;
      thermometerNode.right = this.layoutBounds.maxX - 10;
      thermometerNode.top = 100;

      saveButton.right = this.layoutBounds.maxX - 10;
      saveButton.top = 10;
      clearButton.right = saveButton.right;
      clearButton.top = saveButton.bottom + 10;

      temperatureSlider.right = thermometerNode.left - 20;
      temperatureSlider.centerY = thermometerNode.centerY;

      circleBlu.centerX = 500;
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
      starNode.left = circleRed.right + 60;
      starNode.centerY = circleBlu.centerY;
      glowingHaloStar.centerX = starNode.centerX;
      glowingHaloStar.centerY = starNode.centerY;

    }
  }

  return inherit( ScreenView, BlackbodySpectrumView );
} );