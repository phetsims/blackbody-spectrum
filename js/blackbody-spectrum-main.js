// Copyright 2014-2019, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Martin Veillette (Berea College)
 * @author Arnab Purkayastha
 */

import Sim from '../../joist/js/Sim.js';
import SimLauncher from '../../joist/js/SimLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import blackbodySpectrumStrings from './blackbody-spectrum-strings.js';
import BlackbodySpectrumScreen from './blackbody-spectrum/BlackbodySpectrumScreen.js';
import GlobalOptionsNode from './blackbody-spectrum/view/GlobalOptionsNode.js';

const blackbodySpectrumTitleString = blackbodySpectrumStrings[ 'blackbody-spectrum' ].title;

const simOptions = {
  credits: {
    leadDesign: 'Michael Dubson, Diana L\u00f3pez Tavares',
    softwareDevelopment: 'Arnab Purkayastha, Saurabh Totey, Martin Veillette',
    team: 'Wendy Adams, John Blanco, Ariel Paul, Kathy Perkins',
    qualityAssurance: 'Steele Dalton, Liam Mulhall, Jacob Romero, Ethan Ward, Kathryn Woessner',
    graphicArts: '',
    thanks: ''
  },

  // Creates content for the Options dialog
  createOptionsDialogContent: tandem => new GlobalOptionsNode( tandem )
};

SimLauncher.launch( () => {
  const sim = new Sim( blackbodySpectrumTitleString, [
    new BlackbodySpectrumScreen( Tandem.ROOT.createTandem( 'blackbodySpectrumScreen' ) )
  ], simOptions );
  sim.start();
} );