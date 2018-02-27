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

  // strings
  var peakValuesString = require( 'string!BLACKBODY_SPECTRUM/peakValues' );
  var intensityString = require( 'string!BLACKBODY_SPECTRUM/intensity' );
  var labelsString = require( 'string!BLACKBODY_SPECTRUM/labels' );

  // constants
  var DISPLAY_FONT = new PhetFont( 12 );
  var CONTROL_PANEL_TEXT_FILL = 'white';
  var CONTROL_PANEL_FILL = 'black';
  var CHECKBOX_COLOR = 'white';


  /**
   * @constructor
   *
   * @param {BlackBodySpectrumModel} model
   */
  function BlackBodySpectrumControlPanel( model, options ) {

    options = _.extend( {
      xMargin: 15,
      yMargin: 15,
      lineWidth: 1,
      fill: CONTROL_PANEL_FILL,
      resize: false
    }, options );

    // create the text nodes
    var fontInfo = { font: DISPLAY_FONT, fill: CONTROL_PANEL_TEXT_FILL };
    var valuesText = new Text( peakValuesString, fontInfo );
    var intensityText = new Text( intensityString, fontInfo );
    var labelsText = new Text( labelsString, fontInfo );

    // 3 checkboxes: Peak Values, Intensity, Labels
    var checkboxOptions = { checkboxColorBackground: CONTROL_PANEL_FILL, checkboxColor: CHECKBOX_COLOR };
    var valuesCheckbox = new Checkbox( valuesText, model.peakValuesVisibleProperty, checkboxOptions );
    var intensityCheckbox = new Checkbox( intensityText, model.intensityVisibleProperty, checkboxOptions );
    var labelsCheckbox = new Checkbox( labelsText, model.labelsVisibleProperty, checkboxOptions );

    // Adjust touch areas
    var spacing = 15;
    var content = new VBox( {
      children: [
        valuesCheckbox,
        intensityCheckbox,
        labelsCheckbox
      ],
      align: 'left',
      spacing: spacing,
      resize: false,
      border: 'white'
    } );

    Panel.call( this, content, options );

  }

  blackbodySpectrum.register( 'BlackBodySpectrumControlPanel', BlackBodySpectrumControlPanel );

  return inherit( Panel, BlackBodySpectrumControlPanel );
} );
