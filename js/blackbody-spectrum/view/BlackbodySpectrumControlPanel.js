// Copyright 2018-2022, University of Colorado Boulder

/**
 * Control panel with Checkboxes that control the graphical properties of the simulation
 *
 * @author Arnab Purkayastha
 * @author Saurabh Totey
 */

import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ScientificNotationNode from '../../../../scenery-phet/js/ScientificNotationNode.js';
import { HBox, HSeparator, Node, Path, Rectangle, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import cameraSolidShape from '../../../../sherpa/js/fontawesome-5/cameraSolidShape.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import blackbodySpectrum from '../../blackbodySpectrum.js';
import BlackbodySpectrumStrings from '../../BlackbodySpectrumStrings.js';
import BlackbodyColors from './BlackbodyColors.js';

const graphValuesString = BlackbodySpectrumStrings.graphValues;
const intensityString = BlackbodySpectrumStrings.intensity;
const intensityUnitsLabelString = BlackbodySpectrumStrings.intensityUnitsLabel;
const labelsString = BlackbodySpectrumStrings.labels;

// constants
const DISPLAY_FONT = new PhetFont( 18 );
const CHECKBOX_TEXT_FILL = BlackbodyColors.panelTextProperty;
const CHECKBOX_TEXT_WIDTH = 110;
const CONTROL_PANEL_FILL = 'rgba( 0, 0, 0, 0 )';
const CHECKBOX_COLOR = BlackbodyColors.panelStrokeProperty;
const CHECKBOX_TOUCH_DILATION = 6;
const BUTTON_ICON_WIDTH = 50;
const BUTTON_TOUCH_DILATION = 6;
const CHECKBOX_DEFAULT_WIDTH = 140;
const INTENSITY_TEXT_OPTIONS = {
  font: new PhetFont( 18 ),
  fill: 'white'
};
const INTENSITY_TEXT_BOX_STROKE = 'red';
const INTENSITY_TEXT_BOX_FILL = 'gray';
const INTENSITY_TEXT_BOX_PADDING = 5;
const SEPARATOR_COLOR = 'rgb( 212, 212, 212 )';

class BlackbodySpectrumControlPanel extends Panel {

  /**
   * @param {BlackbodySpectrumModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    options = merge( {
      xMargin: 10,
      yMargin: 15,
      lineWidth: 1,
      fill: CONTROL_PANEL_FILL,
      resize: true,
      stroke: BlackbodyColors.panelStrokeProperty,
      maxWidth: CHECKBOX_DEFAULT_WIDTH,

      // phet-io
      tandem: Tandem.REQUIRED
    }, options );

    // create the text nodes
    const checkboxTextOptions = { font: DISPLAY_FONT, fill: CHECKBOX_TEXT_FILL, maxWidth: CHECKBOX_TEXT_WIDTH };
    const valuesCheckboxText = new Text( graphValuesString, checkboxTextOptions );
    const intensityCheckboxText = new Text( intensityString, checkboxTextOptions );
    const labelsCheckboxText = new Text( labelsString, checkboxTextOptions );

    // Save button
    const saveButton = new RectangularPushButton( {
      content: new Path( cameraSolidShape, { maxWidth: BUTTON_ICON_WIDTH, fill: 'black' } ),
      maxWidth: BUTTON_ICON_WIDTH,
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      touchAreaXDilation: BUTTON_TOUCH_DILATION,
      touchAreaYDilation: BUTTON_TOUCH_DILATION,
      listener: () => {
        model.saveMainBody();
      },
      tandem: options.tandem.createTandem( 'saveButton' )
    } );

    // Erase button
    const eraseButton = new EraserButton( {
      iconWidth: BUTTON_ICON_WIDTH,
      maxWidth: BUTTON_ICON_WIDTH,
      touchAreaXDilation: BUTTON_TOUCH_DILATION,
      touchAreaYDilation: BUTTON_TOUCH_DILATION,
      listener: () => {
        model.clearSavedGraphs();
      },
      tandem: options.tandem.createTandem( 'eraseButton' )
    } );

    // Makes the eraseButton enabled when there is a saved graph to clear, and disabled when there is no graph to clear.
    // This assumes that there cannot be a savedBodyTwo without a savedBodyOne.
    model.savedBodyOne.temperatureProperty.link( temperature => {
      eraseButton.enabled = temperature !== null;
    } );

    // checkboxes
    const checkboxOptions = {
      checkboxColorBackground: CONTROL_PANEL_FILL,
      checkboxColor: CHECKBOX_COLOR
    };
    const valuesCheckbox = new Checkbox( model.graphValuesVisibleProperty, valuesCheckboxText, _.assign( checkboxOptions, { tandem: options.tandem.createTandem( 'graphValuesCheckbox' ) } ) );
    const intensityCheckbox = new Checkbox( model.intensityVisibleProperty, intensityCheckboxText, _.assign( checkboxOptions, { tandem: options.tandem.createTandem( 'intensityCheckbox' ) } ) );
    const labelsCheckbox = new Checkbox( model.labelsVisibleProperty, labelsCheckboxText, _.assign( checkboxOptions, { tandem: options.tandem.createTandem( 'labelsCheckbox' ) } ) );

    valuesCheckbox.touchArea = valuesCheckbox.localBounds.dilated( CHECKBOX_TOUCH_DILATION );
    intensityCheckbox.touchArea = intensityCheckbox.localBounds.dilated( CHECKBOX_TOUCH_DILATION );
    labelsCheckbox.touchArea = labelsCheckbox.localBounds.dilated( CHECKBOX_TOUCH_DILATION );

    const intensityText = new RichText( '?', INTENSITY_TEXT_OPTIONS );
    const intensityTextBox = new Rectangle(
      0, 0,
      intensityText.width + INTENSITY_TEXT_BOX_PADDING,
      intensityText.height + INTENSITY_TEXT_BOX_PADDING,
      0, 0,
      {
        children: [ intensityText ],
        stroke: INTENSITY_TEXT_BOX_STROKE,
        fill: INTENSITY_TEXT_BOX_FILL
      } );

    // Links the intensity text to update whenever the model's temperature changes
    model.mainBody.temperatureProperty.link( () => {

      // Gets the model intensity and formats it to a nice scientific notation string to put as the intensityText
      const notationObject = ScientificNotationNode.toScientificNotation( model.mainBody.totalIntensity, {
        mantissaDecimalPlaces: 2
      } );
      let formattedString = notationObject.mantissa;
      if ( notationObject.exponent !== '0' ) {
        formattedString += ` \u00D7 10<sup>${notationObject.exponent}</sup>`;
      }
      intensityText.string = StringUtils.fillIn( intensityUnitsLabelString, { intensity: formattedString } );

      // Updates positions and sizes
      const textWidth = CHECKBOX_DEFAULT_WIDTH > intensityText.width + 20 ?
                        CHECKBOX_DEFAULT_WIDTH : intensityText.width + 20;
      intensityTextBox.setRect( 0, 0, textWidth, intensityText.height + 10, 0, 0 );
      intensityText.center = intensityTextBox.center;
    } );

    const spacing = 15;
    const buttons = new HBox( {
      children: [
        new Node( { children: [ saveButton ] } ),
        new Node( { children: [ eraseButton ] } )
      ],
      spacing: spacing
    } );
    const checkboxes = new VBox( {
      children: [
        valuesCheckbox,
        labelsCheckbox,
        intensityCheckbox
      ],
      align: 'left',
      spacing: spacing
    } );

    // Create panel to allow left alignment on checkboxes while keeping center alignment for buttons
    const checkboxPanel = new Panel( checkboxes, {
      fill: BlackbodyColors.backgroundProperty,
      stroke: BlackbodyColors.backgroundProperty,
      minWidth: CHECKBOX_DEFAULT_WIDTH
    } );

    const intensityDisplay = new Node( {
      visibleProperty: model.intensityVisibleProperty,
      children: [ intensityTextBox ],
      maxWidth: CHECKBOX_DEFAULT_WIDTH
    } );
    intensityText.center = intensityTextBox.center;

    const content = new VBox( {
      children: [
        checkboxPanel,
        intensityDisplay,
        new HSeparator( { stroke: SEPARATOR_COLOR } ),
        buttons
      ],
      align: 'center',
      spacing: spacing,
      resize: true
    } );

    super( content, options );
  }
}

blackbodySpectrum.register( 'BlackbodySpectrumControlPanel', BlackbodySpectrumControlPanel );
export default BlackbodySpectrumControlPanel;