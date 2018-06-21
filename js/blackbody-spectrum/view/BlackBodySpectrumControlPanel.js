// Copyright 2014-2017, University of Colorado Boulder

/**
 * Control panel with Check Boxes that control the electrical Properties of the simulation.
 *
 * @author Arnab Purkayastha
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
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );

  // strings
  var saveString = require( 'string!BLACKBODY_SPECTRUM/save' );
  var clearString = require( 'string!BLACKBODY_SPECTRUM/clear' );
  var graphValuesString = require( 'string!BLACKBODY_SPECTRUM/graphValues' );
  var intensityString = require( 'string!BLACKBODY_SPECTRUM/intensity' );
  var labelsString = require( 'string!BLACKBODY_SPECTRUM/labels' );

  // constants
  var DISPLAY_FONT = new PhetFont( 12 );
  var CHECKBOX_TEXT_FILL = 'white';
  var BUTTON_TEXT_FILL = 'black';
  var CONTROL_PANEL_FILL = 'black';
  var CHECKBOX_COLOR = 'white';
  var BUTTON_COLOR = '#8dcad0';
  var DEFAULT_WIDTH = 140;


  /**
   * @constructor
   *
   * @param {BlackBodySpectrumModel} model
   */
  function BlackBodySpectrumControlPanel( model, graphNode, options ) {

    options = _.extend( {
      xMargin: 15,
      yMargin: 15,
      lineWidth: 1,
      fill: CONTROL_PANEL_FILL,
      resize: false,
      stroke: 'white',
      minWidth: DEFAULT_WIDTH,
      maxWidth: DEFAULT_WIDTH
    }, options );

    // create the text nodes
    var checkboxFont = { font: DISPLAY_FONT, fill: CHECKBOX_TEXT_FILL };
    var buttonFont = { font: DISPLAY_FONT, fill: BUTTON_TEXT_FILL };
    var clearText = new Text( clearString, buttonFont );
    var valuesText = new Text( graphValuesString, checkboxFont );
    var intensityText = new Text( intensityString, checkboxFont );
    var labelsText = new Text( labelsString, checkboxFont );

    var saveText = new Text( saveString, buttonFont );
    var saveCurveShape = new Shape().moveTo( 0, 0 ).cubicCurveTo( 20, -75, 40, 0, 60, 0 ).lineTo( 100, 0 );
    var saveCurvePath = new Path( saveCurveShape, {
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
        graphNode.save( model.temperatureProperty.value );
      }
    } );
    var clearButton = new RectangularPushButton( {
      content: clearText,
      baseColor: BUTTON_COLOR,
      minWidth: options.minWidth - 40,
      listener: function() {
        graphNode.clear();
      }
    } );

    // 3 checkboxes: Peak Values, Intensity, Labels
    var checkboxOptions = { checkboxColorBackground: CONTROL_PANEL_FILL, checkboxColor: CHECKBOX_COLOR };
    var valuesCheckbox = new Checkbox( valuesText, model.graphValuesVisibleProperty, checkboxOptions );
    var intensityCheckbox = new Checkbox( intensityText, model.intensityVisibleProperty, checkboxOptions );
    var labelsCheckbox = new Checkbox( labelsText, model.labelsVisibleProperty, checkboxOptions );

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

    var content = new VBox( {
      children: [
        buttons,
        checkboxes
      ],
      align: 'center',
      spacing: spacing,
      resize: true
    } );

    Panel.call( this, content, options );

  }

  blackbodySpectrum.register( 'BlackBodySpectrumControlPanel', BlackBodySpectrumControlPanel );

  return inherit( Panel, BlackBodySpectrumControlPanel );
} );
