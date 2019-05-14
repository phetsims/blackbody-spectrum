// Copyright 2014-2019, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Martin Veillette (Berea College)
 */
define( require => {
  'use strict';

  // modules
  const BlackbodyConstants = require( 'BLACKBODY_SPECTRUM/BlackbodyConstants' );
  const BlackbodySpectrumScreen = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/BlackbodySpectrumScreen' );
  const GlobalOptionsNode = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/GlobalOptionsNode' );
  const Sim = require( 'JOIST/Sim' );
  const SimLauncher = require( 'JOIST/SimLauncher' );
  const Tandem = require( 'TANDEM/Tandem' );

  // strings
  const blackbodySpectrumTitleString = require( 'string!BLACKBODY_SPECTRUM/blackbody-spectrum.title' );

  const simOptions = {
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

  SimLauncher.launch( () => {
    const sim = new Sim( blackbodySpectrumTitleString, [
      new BlackbodySpectrumScreen( Tandem.rootTandem.createTandem( 'blackbodySpectrumScreen' ) )
    ], simOptions );
    sim.start();
  } );
} );