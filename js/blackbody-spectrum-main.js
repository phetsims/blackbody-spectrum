// Copyright 2014-2015, University of Colorado Boulder

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
      designTeam: 'Curly, Larry, Moe',
      interviews: 'Wile E. Coyote',
      thanks: 'Thanks to the ACME Dynamite Company for funding this sim!'
    }
  };

  // Appending '?dev' to the URL will enable developer-only features.
  if ( phet.chipper.getQueryParameter( 'dev' ) ) {
    simOptions = _.extend( {
      // add dev-specific options here
    }, simOptions );
  }

  SimLauncher.launch( function() {
    var sim = new Sim( blackbodySpectrumTitleString, [ new BlackbodySpectrumScreen() ], simOptions );
    sim.start();
  } );
} );