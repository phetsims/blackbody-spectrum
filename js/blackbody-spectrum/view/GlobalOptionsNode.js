// Copyright 2018, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu
 *
 * @author Arnab Purkayastha
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var blackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/blackbodyColorProfile' );
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var inherit = require( 'PHET_CORE/inherit' );
  var OptionsDialog = require( 'JOIST/OptionsDialog' );
  var ProjectorModeCheckbox = require( 'JOIST/ProjectorModeCheckbox' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @constructor
   */
  function GlobalOptionsNode() {

    // add support for setting projector mode
    var projectorModeCheckbox = new ProjectorModeCheckbox();
    projectorModeCheckbox.projectorModeEnabledProperty.link( function( projectorMode ) {
      if ( projectorMode ) {
        blackbodyColorProfile.profileNameProperty.set( 'projector' );
      }
      else {
        blackbodyColorProfile.profileNameProperty.set( 'default' );
      }
    } );

    // VBox is used to make it easy to add additional options
    VBox.call( this, _.extend( {
      children: [ projectorModeCheckbox ],
      spacing: OptionsDialog.DEFAULT_SPACING,
      align: 'left'
    } ) );
  }

  blackbodySpectrum.register( 'GlobalOptionsNode', GlobalOptionsNode );

  return inherit( VBox, GlobalOptionsNode );
} );