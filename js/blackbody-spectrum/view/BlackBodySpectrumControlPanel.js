// Copyright 2014-2018, University of Colorado Boulder

/**
 * Control panel with Check Boxes that control the graphical properties of the simulation
 *
 * @author Arnab Purkayastha
 * @author Saurabh Totey
 */
define( function( require ) {
  'use strict';

  // modules
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var Checkbox = require( 'SUN/Checkbox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var GenericCurveShape = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/GenericCurveShape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ScientificNotationNode = require( 'SCENERY_PHET/ScientificNotationNode' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Node = require( 'SCENERY/nodes/Node' );

  // strings
  var saveString = require( 'string!BLACKBODY_SPECTRUM/save' );
  var clearString = require( 'string!BLACKBODY_SPECTRUM/clear' );
  var graphValuesString = require( 'string!BLACKBODY_SPECTRUM/graphValues' );
  var intensityString = require( 'string!BLACKBODY_SPECTRUM/intensity' );
  var labelsString = require( 'string!BLACKBODY_SPECTRUM/labels' );
  var intensityLabelPatternString = require( 'string!BLACKBODY_SPECTRUM/intensityLabelPattern' );

  // constants
  var DISPLAY_FONT = new PhetFont( 12 );
  var CHECKBOX_TEXT_FILL = 'white';
  var BUTTON_TEXT_FILL = 'black';
  var CONTROL_PANEL_FILL = 'black';
  var CHECKBOX_COLOR = 'white';
  var BUTTON_COLOR = '#8dcad0';
  var DEFAULT_WIDTH = 140;
  var INTENSITY_LABEL_OPTIONS = {
    fill: 'white',
    font: new PhetFont( 12 )
  };
  var INTENSITY_TEXT_OPTIONS = {
    font: new PhetFont( 16 ),
    fill: 'black'
  };
  var INTENSITY_TEXT_BOX_STROKE = 'red';
  var INTENSITY_TEXT_BOX_FILL = 'gray';

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
      stroke: 'white',
      minWidth: DEFAULT_WIDTH,
      maxWidth: DEFAULT_WIDTH
    }, options );

    // create the text nodes
    var checkboxFont = { font: DISPLAY_FONT, fill: CHECKBOX_TEXT_FILL };
    var buttonFont = { font: DISPLAY_FONT, fill: BUTTON_TEXT_FILL };
    var clearText = new Text( clearString, buttonFont );
    var valuesCheckboxText = new Text( graphValuesString, checkboxFont );
    var intensityCheckboxText = new Text( intensityString, checkboxFont );
    var labelsCheckboxText = new Text( labelsString, checkboxFont );

    var saveText = new Text( saveString, buttonFont );

    var saveCurvePath = new Path( new GenericCurveShape(), {
      stroke: 'black',
      lineWidth: 3,
      maxWidth: 30
    } );
    var saveButtonContent = new HBox( {
      children: [ saveText, saveCurvePath ],
      spacing: 10
    } );

    // 2 buttons: Save, Clear
    var saveButton = new RectangularPushButton( {
      content: saveButtonContent,
      baseColor: BUTTON_COLOR,
      minWidth: options.minWidth - 40,
      listener: function() {
        model.saveMainBody();
      }
    } );
    var clearButton = new RectangularPushButton( {
      content: clearText,
      baseColor: BUTTON_COLOR,
      minWidth: options.minWidth - 40,
      listener: function() {
        model.clearSavedGraphs();
      }
    } );

    // Makes the clearButton enabled when there is a saved graph to clear, and disabled when there is no graph to clear
    model.savedBodies.lengthProperty.link( function( length ) {
      clearButton.enabled = length !== 0;
    } );

    // 3 checkboxes: Peak Values, Intensity, Labels
    var checkboxOptions = { checkboxColorBackground: CONTROL_PANEL_FILL, checkboxColor: CHECKBOX_COLOR };
    var valuesCheckbox = new Checkbox( valuesCheckboxText, model.graphValuesVisibleProperty, checkboxOptions );
    var intensityCheckbox = new Checkbox( intensityCheckboxText, model.intensityVisibleProperty, checkboxOptions );
    var labelsCheckbox = new Checkbox( labelsCheckboxText, model.labelsVisibleProperty, checkboxOptions );

    // The label above the box that shows the model's current intensity
    var intensityLabel = new Text( intensityString, INTENSITY_LABEL_OPTIONS );
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
      intensityTextBox.setRect( 0, 0, intensityText.width + 5, intensityText.height + 5, 0, 0 );
      intensityText.center = intensityTextBox.center;
    } );

    var spacing = 15;
    var buttons = new VBox( {
      children: [
        saveButton,
        clearButton
      ],
      align: 'center',
      spacing: spacing
    } );
    var checkboxes = new VBox( {
      children: [
        valuesCheckbox,
        intensityCheckbox,
        labelsCheckbox
      ],
      align: 'left',
      spacing: spacing,
      resize: false
    } );

    var intensityDisplay = new Node( {
      children: [
        intensityLabel,
        intensityTextBox
      ],
      maxWidth: buttons.width
    } );
    intensityLabel.bottom = intensityTextBox.top;
    intensityText.center = intensityTextBox.center;

    var content = new VBox( {
      children: [
        buttons,
        checkboxes,
        intensityDisplay
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
        content.removeChild( intensityDisplay );
      } else {
        content.addChild( intensityDisplay );
      }
    } );

  }

  blackbodySpectrum.register( 'BlackBodySpectrumControlPanel', BlackBodySpectrumControlPanel );

  return inherit( Panel, BlackBodySpectrumControlPanel );
} );
