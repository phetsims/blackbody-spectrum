// Copyright 2014-2017, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var BlackbodySpectrumScreen = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/BlackbodySpectrumScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var blackbodySpectrumTitleString = require( 'string!BLACKBODY_SPECTRUM/blackbody-spectrum.title' );

  var simOptions = {
    credits: {

      // all credits fields are optional
      leadDesign: 'Groucho',
      softwareDevelopment: 'Kirk',
      team: 'Curly, Larry, Moe',
      interviews: 'Wile E. Coyote',
      thanks: 'Thanks to the ACME Dynamite Company for funding this sim!'
    }
  };

  SimLauncher.launch( function() {
    var sim = new Sim( blackbodySpectrumTitleString, [ new BlackbodySpectrumScreen() ], simOptions );
    sim.start();
  } );
} );