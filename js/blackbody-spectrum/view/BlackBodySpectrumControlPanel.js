// Copyright 2018, University of Colorado Boulder

/**
 * Control panel with Check Boxes that control the graphical properties of the simulation
 *
 * @author Arnab Purkayastha
 * @author Saurabh Totey
 */
define( function( require ) {
  'use strict';

  // modules
  var BlackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackbodyColorProfile' );
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var Checkbox = require( 'SUN/Checkbox' );
  var EraserButton = require( 'SCENERY_PHET/buttons/EraserButton' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HSeparator = require( 'SUN/HSeparator' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var ScientificNotationNode = require( 'SCENERY_PHET/ScientificNotationNode' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var graphValuesString = require( 'string!BLACKBODY_SPECTRUM/graphValues' );
  var intensityLabelPatternString = require( 'string!BLACKBODY_SPECTRUM/intensityLabelPattern' );
  var intensityString = require( 'string!BLACKBODY_SPECTRUM/intensity' );
  var labelsString = require( 'string!BLACKBODY_SPECTRUM/labels' );

  // constants
  var DISPLAY_FONT = new PhetFont( 18 );
  var CHECKBOX_TEXT_FILL = BlackbodyColorProfile.panelTextProperty;
  var CONTROL_PANEL_FILL = 'rgba( 0, 0, 0, 0 )';
  var CHECKBOX_COLOR = BlackbodyColorProfile.panelStrokeProperty;
  var CHECKBOX_TOUCH_DILATION = 6;
  var BUTTON_ICON_WIDTH = 35;
  var BUTTON_TOUCH_DILATION = 6;
  var DEFAULT_WIDTH = 140;
  var INTENSITY_TEXT_OPTIONS = {
    font: new PhetFont( 18 ),
    fill: BlackbodyColorProfile.panelTextProperty
  };
  var INTENSITY_TEXT_BOX_STROKE = 'red';
  var INTENSITY_TEXT_BOX_FILL = 'gray';
  var SEPARATOR_COLOR = 'rgb( 212, 212, 212 )';

  /**
   * @param {BlackBodySpectrumModel} model
   * @param {Object} [options]
   * @constructor
   */
  function BlackBodySpectrumControlPanel( model, options ) {

    options = _.extend( {
      xMargin: 15,
      yMargin: 15,
      lineWidth: 1,
      fill: CONTROL_PANEL_FILL,
      resize: true,
      stroke: BlackbodyColorProfile.panelStrokeProperty,
      minWidth: DEFAULT_WIDTH,
      maxWidth: DEFAULT_WIDTH
    }, options );

    // create the text nodes
    var checkboxFont = { font: DISPLAY_FONT, fill: CHECKBOX_TEXT_FILL };
    var valuesCheckboxText = new Text( graphValuesString, checkboxFont );
    var intensityCheckboxText = new Text( intensityString, checkboxFont );
    var labelsCheckboxText = new Text( labelsString, checkboxFont );

    // Save button
    var saveButton = new RectangularPushButton( {
      content: new FontAwesomeNode( 'camera', { maxWidth: BUTTON_ICON_WIDTH } ),
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      touchAreaXDilation: BUTTON_TOUCH_DILATION,
      touchAreaYDilation: BUTTON_TOUCH_DILATION,
      listener: function() {
        model.saveMainBody();
      }
    } );

    // Erase button
    var eraseButton = new EraserButton( {
      iconWidth: BUTTON_ICON_WIDTH,
      touchAreaXDilation: BUTTON_TOUCH_DILATION,
      touchAreaYDilation: BUTTON_TOUCH_DILATION,
      listener: function() {
        model.clearSavedGraphs();
      }
    } );

    // Makes the eraseButton enabled when there is a saved graph to clear, and disabled when there is no graph to clear
    model.savedBodies.lengthProperty.link( function( length ) {
      eraseButton.enabled = length !== 0;
    } );

    // 3 checkboxes: Peak Values, Intensity, Labels
    var checkboxOptions = {
      checkboxColorBackground: CONTROL_PANEL_FILL,
      checkboxColor: CHECKBOX_COLOR
    };
    var valuesCheckbox = new Checkbox( valuesCheckboxText, model.graphValuesVisibleProperty, checkboxOptions );
    var intensityCheckbox = new Checkbox( intensityCheckboxText, model.intensityVisibleProperty, checkboxOptions );
    var labelsCheckbox = new Checkbox( labelsCheckboxText, model.labelsVisibleProperty, checkboxOptions );

    valuesCheckbox.touchArea = valuesCheckbox.localBounds.dilated( CHECKBOX_TOUCH_DILATION );
    intensityCheckbox.touchArea = intensityCheckbox.localBounds.dilated( CHECKBOX_TOUCH_DILATION );
    labelsCheckbox.touchArea = labelsCheckbox.localBounds.dilated( CHECKBOX_TOUCH_DILATION );

    var intensityText = new RichText( '?', INTENSITY_TEXT_OPTIONS );
    var intensityTextBox = new Rectangle( 0, 0, intensityText.width + 5, intensityText.height + 5, 0, 0, {
      children: [ intensityText ],
      stroke: INTENSITY_TEXT_BOX_STROKE,
      fill: INTENSITY_TEXT_BOX_FILL
    } );

    // Links the intensity text to update whenever the model's temperature changes
    model.mainBody.temperatureProperty.link( function() {

      // Gets the model intensity and formats it to a nice scientific notation string to put as the intensityText
      var notationObject = ScientificNotationNode.toScientificNotation( model.mainBody.totalIntensity, {
        mantissaDecimalPlaces: 2
      } );
      var formattedString = notationObject.mantissa;
      if ( notationObject.exponent !== '0' ) {
        formattedString += ' X 10<sup>' + notationObject.exponent + '</sup>';
      }
      intensityText.text = StringUtils.fillIn( intensityLabelPatternString, { intensity: formattedString } );

      // Updates positions and sizes
      intensityTextBox.setRect( 0, 0, intensityText.width + 20, intensityText.height + 10, 0, 0 );
      intensityText.center = intensityTextBox.center;
    } );

    var spacing = 15;
    var buttons = new HBox( {
      children: [
        saveButton,
        eraseButton
      ],
      align: 'center',
      spacing: spacing
    } );
    var checkboxes = new VBox( {
      children: [
        valuesCheckbox,
        labelsCheckbox,
        intensityCheckbox
      ],
      align: 'left',
      spacing: spacing,
      resize: false
    } );

    var intensityDisplay = new Node( {
      children: [ intensityTextBox ],
      minWidth: DEFAULT_WIDTH
    } );
    intensityText.center = intensityTextBox.center;

    var content = new VBox( {
      children: [
        checkboxes,
        intensityDisplay,
        new HSeparator( DEFAULT_WIDTH, { stroke: SEPARATOR_COLOR } ),
        buttons
      ],
      align: 'center',
      spacing: spacing,
      resize: true
    } );

    Panel.call( this, content, options );

    // The label and the box containing the intensity value text have the same visibility as the model's intensityVisibleProperty
    model.intensityVisibleProperty.link( function( intensityVisible ) {
      intensityDisplay.visible = intensityVisible;
      if ( !intensityVisible ) {
        content.setChildren( [
          checkboxes,
          new HSeparator( DEFAULT_WIDTH, { stroke: SEPARATOR_COLOR } ),
          buttons
        ] );
      } else {
        content.setChildren( [
          checkboxes,
          intensityDisplay,
          new HSeparator( DEFAULT_WIDTH, { stroke: SEPARATOR_COLOR } ),
          buttons
        ] );
      }
    } );

  }

  blackbodySpectrum.register( 'BlackBodySpectrumControlPanel', BlackBodySpectrumControlPanel );

  return inherit( Panel, BlackBodySpectrumControlPanel );
} );
