// Copyright 2014-2023, University of Colorado Boulder

/**
 * Main view for the BlackbodySpectrum simulation
 * Handles or contains all the main graphical logic of the sim
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
 * @author Arnab Purkayastha
 */

import Utils from '../../../../dot/js/Utils.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import BlackbodyConstants from '../../BlackbodyConstants.js';
import blackbodySpectrum from '../../blackbodySpectrum.js';
import BlackbodySpectrumStrings from '../../BlackbodySpectrumStrings.js';
import BGRAndStarDisplay from './BGRAndStarDisplay.js';
import BlackbodyColors from './BlackbodyColors.js';
import BlackbodySpectrumControlPanel from './BlackbodySpectrumControlPanel.js';
import BlackbodySpectrumThermometer from './BlackbodySpectrumThermometer.js';
import GraphDrawingNode from './GraphDrawingNode.js';
import SavedGraphInformationPanel from './SavedGraphInformationPanel.js';

const blackbodyTemperatureString = BlackbodySpectrumStrings.blackbodyTemperature;
const kelvinUnitsString = BlackbodySpectrumStrings.kelvinUnits;

// constants
const TEMPERATURE_FONT = new PhetFont( { size: 22, weight: 'bold' } );
const TITLE_COLOR = BlackbodyColors.titlesTextProperty;
const TEMPERATURE_COLOR = BlackbodyColors.temperatureTextProperty;
const INSET = 10;
const TEMPERATURE_LABEL_SPACING = 5;

class BlackbodySpectrumScreenView extends ScreenView {

  /**
   * Constructor for the BlackbodySpectrumView
   * @param {BlackbodySpectrumModel} model - the main model for the simulation
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {
    super( {
      tandem: tandem
    } );

    const thermometerNode = new BlackbodySpectrumThermometer( model.mainBody.temperatureProperty, {
      tandem: tandem.createTandem( 'thermometerNode' )
    } );

    const thermometerText = new RichText( blackbodyTemperatureString, {
      font: BlackbodyConstants.LABEL_FONT,
      fill: TITLE_COLOR,
      align: 'center',
      maxWidth: 130,
      tandem: tandem.createTandem( 'thermometerText' )
    } );

    // A text node that reflects the temperature of the slider or main model
    const temperatureText = new Text( '?', {
      font: TEMPERATURE_FONT,
      fill: TEMPERATURE_COLOR,
      maxWidth: 130,
      tandem: tandem.createTandem( 'temperatureText' )
    } );

    // create the BGR and star display
    const bgrAndStarDisplay = new BGRAndStarDisplay( model.mainBody, {
      tandem: tandem.createTandem( 'bgrAndStarDisplay' )
    } );

    // Links the current temperature to the temperature text above the thermometer
    model.mainBody.temperatureProperty.link( temperature => {
      temperatureText.string = `${Utils.toFixed( temperature, 0 )} ${kelvinUnitsString}`;
      temperatureText.centerX = thermometerText.centerX; // In case the size of the temperature text changes
    } );

    // create graph with zoom buttons
    const graphDrawingNode = new GraphDrawingNode( model, { tandem: tandem.createTandem( 'graphDrawingNode' ) } );

    // create the Reset All Button in the bottom right
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        graphDrawingNode.reset();
        thermometerNode.reset();
      },
      tandem: tandem.createTandem( 'resetAllButton' ),
      phetioDocumentation: 'button that resets the screen to its initial state'
    } );

    const controlPanel = new BlackbodySpectrumControlPanel( model, {
      tandem: tandem.createTandem( 'controlPanel' )
    } );
    const savedGraphsPanel = new SavedGraphInformationPanel( model, {
      minWidth: controlPanel.width,
      tandem: tandem.createTandem( 'savedGraphsPanel' )
    } );

    graphDrawingNode.left = INSET;
    graphDrawingNode.bottom = this.layoutBounds.maxY - INSET;
    resetAllButton.right = this.layoutBounds.maxX - INSET;
    resetAllButton.bottom = this.layoutBounds.maxY - INSET;
    thermometerNode.right = this.layoutBounds.maxX - INSET;
    thermometerText.centerX = thermometerNode.right + thermometerNode.thermometerCenterXFromRight;
    temperatureText.centerX = thermometerText.centerX;
    thermometerText.top = INSET + TEMPERATURE_LABEL_SPACING;
    temperatureText.top = thermometerText.bottom + TEMPERATURE_LABEL_SPACING;
    thermometerNode.top = temperatureText.bottom + TEMPERATURE_LABEL_SPACING;
    controlPanel.right = thermometerNode.left - 20;
    controlPanel.top = thermometerText.centerY;
    savedGraphsPanel.centerX = controlPanel.centerX;
    savedGraphsPanel.top = controlPanel.bottom + 55;
    bgrAndStarDisplay.left = 225; // Layout empirically determined

    this.addChild( graphDrawingNode );
    this.addChild( controlPanel );
    this.addChild( savedGraphsPanel );
    this.addChild( thermometerNode );
    this.addChild( thermometerText );
    this.addChild( temperatureText );
    this.addChild( bgrAndStarDisplay );
    this.addChild( resetAllButton );
  }
}

blackbodySpectrum.register( 'BlackbodySpectrumScreenView', BlackbodySpectrumScreenView );
export default BlackbodySpectrumScreenView;