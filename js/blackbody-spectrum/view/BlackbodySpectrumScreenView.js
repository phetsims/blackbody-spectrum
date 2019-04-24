// Copyright 2014-2019, University of Colorado Boulder

/**
 * Main view for the BlackbodySpectrum simulation
 * Handles or contains all of the main graphical logic of the sim
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
 * @author Arnab Purkayastha
 */
define( function( require ) {
  'use strict';

  // modules
  var blackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/blackbodyColorProfile' );
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var BlackbodySpectrumControlPanel = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackbodySpectrumControlPanel' );
  var BlackbodySpectrumThermometer = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackbodySpectrumThermometer' );
  var Circle = require( 'SCENERY/nodes/Circle' );
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
  var Util = require( 'DOT/Util' );

  // strings
  var blackbodyTemperatureString = require( 'string!BLACKBODY_SPECTRUM/blackbodyTemperature' );
  var kelvinUnitsString = require( 'string!BLACKBODY_SPECTRUM/kelvinUnits' );
  var bString = require( 'string!BLACKBODY_SPECTRUM/b' );
  var gString = require( 'string!BLACKBODY_SPECTRUM/g' );
  var rString = require( 'string!BLACKBODY_SPECTRUM/r' );

  // constants
  var CIRCLE_LABEL_COLOR = blackbodyColorProfile.titlesTextProperty;
  var CIRCLE_RADIUS = 15;
  var LABEL_FONT = new PhetFont( 22 );
  var TEMPERATURE_FONT = new PhetFont( { size: 22, weight: 'bold' } );
  var TITLE_COLOR = blackbodyColorProfile.titlesTextProperty;
  var TEMPERATURE_COLOR = blackbodyColorProfile.temperatureTextProperty;
  var INSET = 10;
  var TEMPERATURE_LABEL_SPACING = 5;
  var TRIANGLE_SIZE = 25;
  var STAR_INNER_RADIUS = 20;
  var STAR_OUTER_RADIUS = 35;
  var STAR_NUMBER_POINTS = 9;
  var STAR_SPACING = 50;

  /**
   * Constructor for the BlackbodySpectrumView
   * @param {BlackbodySpectrumModel} model - the main model for the simulation
   * @param {Tandem} tandem
   * @constructor
   */
  function BlackbodySpectrumScreenView( model, tandem ) {
    ScreenView.call( this );

    var blackbodySpectrumThermometer = new BlackbodySpectrumThermometer( model.mainBody.temperatureProperty, {
      tandem: tandem.createTandem( 'thermometerNode' )
    } );

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
        stroke: blackbodyColorProfile.starStrokeProperty
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
        blackbodySpectrumThermometer.reset();
      },
      tandem: tandem.createTandem( 'resetAllButton' ),
      phetioDocumentation: 'button that resets the screen to its initial state'
    } );

    var controlPanel = new BlackbodySpectrumControlPanel( model, {
      tandem: tandem.createTandem( 'controlPanel' )
    } );
    var savedInformationPanel = new SavedGraphInformationPanel( model.mainBody, model.savedBodies, {
      minWidth: controlPanel.width,
      tandem: tandem.createTandem( 'savedGraphsPanel' )
    } );

    graphNode.left = INSET;
    graphNode.bottom = this.layoutBounds.maxY - INSET;
    resetAllButton.right = this.layoutBounds.maxX - INSET;
    resetAllButton.bottom = this.layoutBounds.maxY - INSET;
    thermometerLabel.right = this.layoutBounds.maxX - INSET;
    thermometerLabel.top = INSET + TEMPERATURE_LABEL_SPACING;
    temperatureText.centerX = thermometerLabel.centerX;
    temperatureText.top = thermometerLabel.bottom + TEMPERATURE_LABEL_SPACING;
    blackbodySpectrumThermometer.centerX = temperatureText.centerX - TRIANGLE_SIZE;
    blackbodySpectrumThermometer.top = temperatureText.bottom + TEMPERATURE_LABEL_SPACING;
    controlPanel.right = blackbodySpectrumThermometer.left - 20;
    controlPanel.top = thermometerLabel.centerY;
    savedInformationPanel.centerX = controlPanel.centerX;
    savedInformationPanel.top = controlPanel.bottom + 55;
    circleBlue.centerX = 225;
    circleBlue.centerY = STAR_SPACING;
    circleGreen.centerX = circleBlue.centerX + STAR_SPACING;
    circleGreen.centerY = circleBlue.centerY;
    circleRed.centerX = circleGreen.centerX + STAR_SPACING;
    circleRed.centerY = circleBlue.centerY;
    circleBlueLabel.centerX = circleBlue.centerX;
    circleBlueLabel.centerY = circleBlue.top + STAR_SPACING;
    circleGreenLabel.centerX = circleGreen.centerX;
    circleGreenLabel.centerY = circleBlueLabel.centerY;
    circleRedLabel.centerX = circleRed.centerX;
    circleRedLabel.centerY = circleBlueLabel.centerY;
    starPath.left = circleRed.right + STAR_SPACING;
    starPath.centerY = circleBlue.centerY;
    glowingStarHalo.centerX = starPath.centerX;
    glowingStarHalo.centerY = starPath.centerY;

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
  }

  blackbodySpectrum.register( 'BlackbodySpectrumScreenView', BlackbodySpectrumScreenView );

  return inherit( ScreenView, BlackbodySpectrumScreenView );
} );