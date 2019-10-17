// Copyright 2018-2019, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu
 *
 * @author Arnab Purkayastha
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const blackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/blackbodyColorProfile' );
  const blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  const OptionsDialog = require( 'JOIST/OptionsDialog' );
  const ProjectorModeCheckbox = require( 'JOIST/ProjectorModeCheckbox' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  class GlobalOptionsNode extends VBox {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      // add support for setting projector mode
      const projectorModeCheckbox = new ProjectorModeCheckbox( blackbodyColorProfile, {
        tandem: tandem.createTandem( 'projectorModeCheckbox' )
      } );

      // VBox is used to make it easy to add additional options
      super( {
        children: [ projectorModeCheckbox ],
        spacing: OptionsDialog.DEFAULT_SPACING,
        align: 'left'
      } );
    }
  }

  return blackbodySpectrum.register( 'GlobalOptionsNode', GlobalOptionsNode );
} );