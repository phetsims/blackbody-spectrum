// Copyright 2014-2018, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var BlackbodyConstants = require( 'BLACKBODY_SPECTRUM/BlackbodyConstants' );
  var BlackbodySpectrumScreen = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/BlackbodySpectrumScreen' );
  var GlobalOptionsNode = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/GlobalOptionsNode' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var Tandem = require( 'TANDEM/Tandem' );

  // strings
  var blackbodySpectrumTitleString = require( 'string!BLACKBODY_SPECTRUM/blackbody-spectrum.title' );

  var simOptions = {
    credits: {

      leadDesign: 'Michael Dubson, Diana L\u00f3pez Tavares',
      softwareDevelopment: 'Arnab Purkayastha, Saurabh Totey, Martin Veillette',
      team: 'Wendy Adams, John Blanco, Ariel Paul, Kathy Perkins',
      qualityAssurance: 'Katie Woessner',
      graphicArts: '',
      thanks: ''
    },
    optionsNode: new GlobalOptionsNode( BlackbodyConstants.GLOBALS_TANDEM.createTandem( 'options' ) )
  };

  SimLauncher.launch( function() {
    var sim = new Sim( blackbodySpectrumTitleString, [
      new BlackbodySpectrumScreen( Tandem.rootTandem.createTandem( 'blackbodySpectrumScreen' ) )
    ], simOptions );
    sim.start();
  } );
} );