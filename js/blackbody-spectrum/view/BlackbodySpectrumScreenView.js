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
  var BGRAndStarDisplay = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BGRAndStarDisplay' );
  var blackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/blackbodyColorProfile' );
  var BlackbodyConstants = require( 'BLACKBODY_SPECTRUM/BlackbodyConstants' );
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var BlackbodySpectrumControlPanel = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackbodySpectrumControlPanel' );
  var BlackbodySpectrumThermometer = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackbodySpectrumThermometer' );
  var GraphDrawingNode = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/GraphDrawingNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var SavedGraphInformationPanel = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/SavedGraphInformationPanel' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  // strings
  var blackbodyTemperatureString = require( 'string!BLACKBODY_SPECTRUM/blackbodyTemperature' );
  var kelvinUnitsString = require( 'string!BLACKBODY_SPECTRUM/kelvinUnits' );

  // constants
  var TEMPERATURE_FONT = new PhetFont( { size: 22, weight: 'bold' } );
  var TITLE_COLOR = blackbodyColorProfile.titlesTextProperty;
  var TEMPERATURE_COLOR = blackbodyColorProfile.temperatureTextProperty;
  var INSET = 10;
  var TEMPERATURE_LABEL_SPACING = 5;
  var TRIANGLE_SIZE = 25;

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
      font: BlackbodyConstants.LABEL_FONT,
      fill: TITLE_COLOR,
      align: 'center',
      maxWidth: 130,
      tandem: tandem.createTandem( 'thermometerLabel' )
    } );

    // A text node that reflects the temperature of the slider or main model
    var temperatureText = new Text( '?', {
      font: TEMPERATURE_FONT,
      fill: TEMPERATURE_COLOR,
      tandem: tandem.createTandem( 'temperatureText' )
    } );

    // create the BGR and star display
    var bgrAndStarDisplay = new BGRAndStarDisplay( model.mainBody, {
      tandem: tandem.createTandem( 'bgrAndStarDisplay' )
    } );

    // Links the current temperature to the temperature text above the thermometer
    model.mainBody.temperatureProperty.link( function( temperature ) {
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
    bgrAndStarDisplay.left = 225;

    this.addChild( graphNode );
    this.addChild( controlPanel );
    this.addChild( savedInformationPanel );
    this.addChild( blackbodySpectrumThermometer );
    this.addChild( thermometerLabel );
    this.addChild( temperatureText );
    this.addChild( bgrAndStarDisplay );
    this.addChild( resetAllButton );
  }

  blackbodySpectrum.register( 'BlackbodySpectrumScreenView', BlackbodySpectrumScreenView );

  return inherit( ScreenView, BlackbodySpectrumScreenView );
} );