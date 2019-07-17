// Copyright 2014-2019, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Martin Veillette (Berea College)
 * @author Arnab Purkayastha
 */
define( require => {
  'use strict';

  // modules
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
      qualityAssurance: 'Steele Dalton, Liam Mulhall, Jacob Romero, Ethan Ward, Kathryn Woessner',
      graphicArts: '',
      thanks: ''
    },
    optionsNode: new GlobalOptionsNode( Tandem.globalTandem.createTandem( 'options' ) )
  };

  SimLauncher.launch( () => {
    const sim = new Sim( blackbodySpectrumTitleString, [
      new BlackbodySpectrumScreen( Tandem.rootTandem.createTandem( 'blackbodySpectrumScreen' ) )
    ], simOptions );
    sim.start();
  } );
} );