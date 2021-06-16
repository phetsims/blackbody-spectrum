// Copyright 2014-2021, University of Colorado Boulder

/**
 * Main model for the BlackbodySpectrum screen
 * Controls or contains all of the main sim logic
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
 * @author Arnab Purkayastha
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import BlackbodyConstants from '../../BlackbodyConstants.js';
import blackbodySpectrum from '../../blackbodySpectrum.js';
import BlackbodyBodyModel from './BlackbodyBodyModel.js';

class BlackbodySpectrumModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // @public {Property.<boolean>}
    this.graphValuesVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'graphValuesVisibleProperty' ),
      phetioDocumentation: 'whether the graph values should be visible'
    } );

    // @public {Property.<boolean>}
    this.intensityVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'intensityVisibleProperty' ),
      phetioDocumentation: 'whether the intensity (area under the curve) of the graph should be visible'
    } );

    // @public {Property.<boolean>}
    this.labelsVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'labelsVisibleProperty' ),
      phetioDocumentation: 'whether the graph labels should be visible'
    } );

    // @public {BlackbodyBodyModel} - the main body for the simulation
    this.mainBody = new BlackbodyBodyModel( BlackbodyConstants.sunTemperature, tandem.createTandem( 'mainBody' ) );

    // @public {BlackbodyBodyModel} - the primary saved body. There are two separate saved bodies instead of an array
    // for simplicity with phet-io, see https://github.com/phetsims/blackbody-spectrum/issues/117
    this.savedBodyOne = new BlackbodyBodyModel( null, tandem.createTandem( 'savedBodyOne' ) );

    // @public {BlackbodyBodyModel} - the secondary saved body
    this.savedBodyTwo = new BlackbodyBodyModel( null, tandem.createTandem( 'savedBodyTwo' ) );

    // @public {number} max wavelength in nanometers
    this.wavelengthMax = 3000;
  }

  /**
   * Resets all of the model's settings and bodies
   * @public
   */
  reset() {
    this.graphValuesVisibleProperty.reset();
    this.intensityVisibleProperty.reset();
    this.labelsVisibleProperty.reset();
    this.mainBody.reset();
    this.clearSavedGraphs();
  }

  /**
   * Shifts savedBodyOne to savedBodyTwo and saves the main body to savedBodyOne
   * @public
   */
  saveMainBody() {
    this.savedBodyTwo.temperatureProperty.value = this.savedBodyOne.temperatureProperty.value;
    this.savedBodyOne.temperatureProperty.value = this.mainBody.temperatureProperty.value;
  }

  /**
   * A function that clears saved graphs
   * @public
   */
  clearSavedGraphs() {
    this.savedBodyOne.reset();
    this.savedBodyTwo.reset();
  }
}

blackbodySpectrum.register( 'BlackbodySpectrumModel', BlackbodySpectrumModel );
export default BlackbodySpectrumModel;