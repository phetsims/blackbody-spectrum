// Copyright 2014-2019, University of Colorado Boulder

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
  var BlackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackbodyColorProfile' );
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var BlackBodySpectrumControlPanel = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackBodySpectrumControlPanel' );
  var BlackbodySpectrumThermometer = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackbodySpectrumThermometer' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var GraphDrawingNode = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/GraphDrawingNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var SavedGraphInformationPanel = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/SavedGraphInformationPanel' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var StarShape = require( 'SCENERY_PHET/StarShape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TriangleSliderThumb = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/TriangleSliderThumb' );
  var Util = require( 'DOT/Util' );

  // strings
  var blackbodyTemperatureString = require( 'string!BLACKBODY_SPECTRUM/blackbodyTemperature' );
  var kelvinUnitsString = require( 'string!BLACKBODY_SPECTRUM/kelvinUnits' );
  var bString = require( 'string!BLACKBODY_SPECTRUM/b' );
  var gString = require( 'string!BLACKBODY_SPECTRUM/g' );
  var rString = require( 'string!BLACKBODY_SPECTRUM/r' );

  // constants
  var CIRCLE_LABEL_COLOR = BlackbodyColorProfile.titlesTextProperty;
  var CIRCLE_RADIUS = 15;
  var LABEL_FONT = new PhetFont( 22 );
  // REVIEW: Looks like the rest of these except INSET are only used once and probably don't need to be file constants
  var TEMPERATURE_FONT = new PhetFont( { size: 22, weight: 'bold' } );
  var TITLE_COLOR = BlackbodyColorProfile.titlesTextProperty;
  var TEMPERATURE_COLOR = BlackbodyColorProfile.temperatureTextProperty;
  var INSET = 10;
  var STAR_INNER_RADIUS = 20;
  var STAR_OUTER_RADIUS = 35;
  var STAR_NUMBER_POINTS = 9;

  /**
   * Constructor for the BlackbodySpectrumView
   * @param {BlackbodySpectrumModel} model - the main model for the simulation
   * @param {Tandem} tandem
   * @constructor
   */
  function BlackbodySpectrumScreenView( model, tandem ) {
    // REVIEW: These hardcoded layout bounds are the same as default in ScreenView, so they aren't overriding anything
    // and can be omitted
    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, 1024, 618 ) } );

    var blackbodySpectrumThermometer = new BlackbodySpectrumThermometer( model.mainBody.temperatureProperty );

    // Note: for VSlider nodes, coordinates go where x axis is from bottom to top, and y axis is from left to right
    // The selectable triangle for the temperature slider
    var thumbSize = new Dimension2( 25, 25 );
    var triangleNode = new TriangleSliderThumb( { size: thumbSize } );
    triangleNode.touchArea = triangleNode.localBounds.dilatedXY( 10, 10 );

    var thermometerLabel = new RichText( blackbodyTemperatureString, {
      font: LABEL_FONT,
      fill: TITLE_COLOR,
      align: 'center',
      maxWidth: 130
    } );

    // A text node that reflects the temperature of the slider or main model
    var temperatureText = new Text( '?', {
      font: TEMPERATURE_FONT,
      fill: TEMPERATURE_COLOR
    } );

    // The indicators that show how much red, blue, and green the current temperature would emit
    var circleBlue = new Circle( CIRCLE_RADIUS );
    var circleGreen = new Circle( CIRCLE_RADIUS );
    var circleRed = new Circle( CIRCLE_RADIUS );
    var circleBlueLabel = new Text( bString, { font: LABEL_FONT, fill: CIRCLE_LABEL_COLOR, maxWidth: 20 } );
    var circleGreenLabel = new Text( gString, { font: LABEL_FONT, fill: CIRCLE_LABEL_COLOR, maxWidth: 20 } );
    var circleRedLabel = new Text( rString, { font: LABEL_FONT, fill: CIRCLE_LABEL_COLOR, maxWidth: 20 } );
    var glowingStarHalo = new Circle( 10 );
    var starPath = new Path(
      new StarShape( {
        outerRadius: STAR_OUTER_RADIUS,
        innerRadius: STAR_INNER_RADIUS,
        numberStarPoints: STAR_NUMBER_POINTS
      } ), {
        lineWidth: 1.5,
        lineJoin: 'round',
        stroke: BlackbodyColorProfile.starStrokeProperty
      }
    );

    // Links the current temperature to the RGB indicators and the temperature text along the TriangleSliderThumb
    model.mainBody.temperatureProperty.link( function( temperature ) {
      circleBlue.fill = model.mainBody.blueColor;
      circleGreen.fill = model.mainBody.greenColor;
      circleRed.fill = model.mainBody.redColor;
      glowingStarHalo.fill = model.mainBody.glowingStarHaloColor;
      glowingStarHalo.radius = model.mainBody.glowingStarHaloRadius;
      starPath.fill = model.mainBody.starColor;
      temperatureText.text = Util.toFixed( temperature, 0 ) + ' ' + kelvinUnitsString;
      temperatureText.centerX = blackbodySpectrumThermometer.right - 55; // In case the size of the temperature text changes
    } );

    // create graph with zoom buttons
    var graphNode = new GraphDrawingNode( model, { tandem: tandem.createTandem( 'graphDrawingNode' ) } );

    // create the Reset All Button in the bottom right
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        model.reset();
        graphNode.reset();
        triangleNode.reset();
        blackbodySpectrumThermometer.reset();
      },
      tandem: tandem.createTandem( 'resetAllButton' ),
      phetioDocumentation: 'button that resets the screen to its initial state'
    } );

    var controlPanel = new BlackBodySpectrumControlPanel( model, {
      tandem: tandem.createTandem( 'controlPanel' )
    } );
    var savedInformationPanel = new SavedGraphInformationPanel( model, {
      minWidth: controlPanel.width,
      tandem: tandem.createTandem( 'savedGraphsPanel' )
    } );

    // REVIEW: I think it would make a little more sense for the addChild()s to happen after the node positioning, but
    // perhaps it doesn't matter. If you make the change, follow the same pattern in the other few cases in this sim.
    // rendering order
    this.addChild( graphNode );
    this.addChild( controlPanel );
    this.addChild( savedInformationPanel );
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

    // REVIEW: some of the magic positioning numbers match - if they are related, e.g. circleBlue.centerX + 50 and
    // circleGreen.centerX + 50, then 50 should be a var like circleXSpacing or something
    // layout for things that don't have a location in the model
    graphNode.left = INSET;
    graphNode.bottom = this.layoutBounds.maxY - INSET;
    resetAllButton.right = this.layoutBounds.maxX - INSET;
    resetAllButton.bottom = this.layoutBounds.maxY - INSET;
    blackbodySpectrumThermometer.right = this.layoutBounds.maxX - INSET - 10;
    blackbodySpectrumThermometer.centerY = this.layoutBounds.centerY + 20;
    temperatureText.bottom = blackbodySpectrumThermometer.top - 5;
    temperatureText.centerX = blackbodySpectrumThermometer.right - 55;
    thermometerLabel.centerX = blackbodySpectrumThermometer.right - 55;
    thermometerLabel.bottom = temperatureText.top - 5;
    controlPanel.right = blackbodySpectrumThermometer.left - 20;
    controlPanel.top = thermometerLabel.centerY;
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