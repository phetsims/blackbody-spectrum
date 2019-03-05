// Copyright 2014-2018, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var BlackbodySpectrumScreen = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/BlackbodySpectrumScreen' );
  var GlobalOptionsNode = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/GlobalOptionsNode' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var Tandem = require( 'TANDEM/Tandem' );

  // strings
  var blackbodySpectrumTitleString = require( 'string!BLACKBODY_SPECTRUM/blackbody-spectrum.title' );

  var simOptions = {
    credits: {

      //TODO complete the credits, see https://github.com/phetsims/blackbody-spectrum/issues/16
      leadDesign: '',
      softwareDevelopment: '',
      team: '',
      qualityAssurance: '',
      graphicArts: '',
      thanks: ''
    },
    optionsNode: new GlobalOptionsNode()
  };

  SimLauncher.launch( function() {
    var sim = new Sim( blackbodySpectrumTitleString, [
      new BlackbodySpectrumScreen( Tandem.rootTandem.createTandem( 'blackbodySpectrumScreen' ) )
    ], simOptions );
    sim.start();
  } );
} );