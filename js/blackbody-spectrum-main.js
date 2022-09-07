// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Martin Veillette (Berea College)
 * @author Arnab Purkayastha
 */

import PreferencesModel from '../../joist/js/preferences/PreferencesModel.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import BlackbodySpectrumScreen from './blackbody-spectrum/BlackbodySpectrumScreen.js';
import BlackbodySpectrumStrings from './BlackbodySpectrumStrings.js';

const blackbodySpectrumTitleStringProperty = BlackbodySpectrumStrings[ 'blackbody-spectrum' ].titleStringProperty;

const simOptions = {
  credits: {
    leadDesign: 'Michael Dubson, Diana L\u00f3pez Tavares',
    softwareDevelopment: 'Arnab Purkayastha, Saurabh Totey, Martin Veillette',
    team: 'Wendy Adams, John Blanco, Ariel Paul, Kathy Perkins',
    qualityAssurance: 'Steele Dalton, Liam Mulhall, Jacob Romero, Ethan Ward, Kathryn Woessner',
    graphicArts: '',
    thanks: ''
  },

  preferencesModel: new PreferencesModel( {
    visualOptions: {
      supportsProjectorMode: true
    }
  } )
};

simLauncher.launch( () => {
  const sim = new Sim( blackbodySpectrumTitleStringProperty, [
    new BlackbodySpectrumScreen( Tandem.ROOT.createTandem( 'blackbodySpectrumScreen' ) )
  ], simOptions );
  sim.start();
} );