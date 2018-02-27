// Copyright 2014-2017, University of Colorado Boulder

/**
 * Control panel with Check Boxes that control the electrical Properties of the simulation
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

  // strings
  var saveString = require( 'string!BLACKBODY_SPECTRUM/save' );
  var clearString = require( 'string!BLACKBODY_SPECTRUM/clear' );
  var peakValuesString = require( 'string!BLACKBODY_SPECTRUM/peakValues' );
  var intensityString = require( 'string!BLACKBODY_SPECTRUM/intensity' );
  var labelsString = require( 'string!BLACKBODY_SPECTRUM/labels' );

  // constants
  var DISPLAY_FONT = new PhetFont( 12 );
  var CONTROL_PANEL_TEXT_FILL = 'white';
  var CONTROL_PANEL_FILL = 'black';
  var CHECKBOX_COLOR = 'white';
  var BUTTON_COLOR = '#8dcad0';


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
      stroke: 'white'
    }, options );

    // create the text nodes
    var fontInfo = { font: DISPLAY_FONT, fill: CONTROL_PANEL_TEXT_FILL };
    var saveText = new Text( saveString, fontInfo );
    var clearText = new Text( clearString, fontInfo );
    var valuesText = new Text( peakValuesString, fontInfo );
    var intensityText = new Text( intensityString, fontInfo );
    var labelsText = new Text( labelsString, fontInfo );

    // 2 buttons: Save, Clear
    var saveButton = new RectangularPushButton( { content: saveText, baseColor: BUTTON_COLOR, listener: function() {
        graphNode.save( model.temperatureProperty.value );
      } } );
    var clearButton = new RectangularPushButton( { content: clearText, baseColor: BUTTON_COLOR, listener: function() {
        graphNode.clear();
      } } );

    // 3 checkboxes: Peak Values, Intensity, Labels
    var checkboxOptions = { checkboxColorBackground: CONTROL_PANEL_FILL, checkboxColor: CHECKBOX_COLOR };
    var valuesCheckbox = new Checkbox( valuesText, model.peakValuesVisibleProperty, checkboxOptions );
    var intensityCheckbox = new Checkbox( intensityText, model.intensityVisibleProperty, checkboxOptions );
    var labelsCheckbox = new Checkbox( labelsText, model.labelsVisibleProperty, checkboxOptions );

    // Adjust touch areas
    var spacing = 15;
    var content = new VBox( {
      children: [
        saveButton,
        clearButton,
        valuesCheckbox,
        intensityCheckbox,
        labelsCheckbox
      ],
      align: 'left',
      spacing: spacing,
      resize: false
    } );

    Panel.call( this, content, options );

  }

  blackbodySpectrum.register( 'BlackBodySpectrumControlPanel', BlackBodySpectrumControlPanel );

  return inherit( Panel, BlackBodySpectrumControlPanel );
} );
