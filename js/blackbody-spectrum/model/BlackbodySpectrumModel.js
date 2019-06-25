// Copyright 2014-2019, University of Colorado Boulder

/**
 * Main model for the BlackbodySpectrum screen
 * Controls or contains all of the main sim logic
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
 * @author Arnab Purkayastha
 */
define( require => {
  'use strict';

  // modules
  const BlackbodyConstants = require( 'BLACKBODY_SPECTRUM/BlackbodyConstants' );
  const BlackbodyBodyModel = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/model/BlackbodyBodyModel' );
  const blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const ObservableArray = require( 'AXON/ObservableArray' );

  class BlackbodySpectrumModel {

    /**
     * Main constructor for BlackbodySpectrumModel, which contains the general model logic for the sim screen.
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

      // @public {BlackbodyBodyModel} the main body for the simulation
      this.mainBody = new BlackbodyBodyModel(
        BlackbodyConstants.sunTemperature,
        tandem.createTandem( 'blackbodyBodyModel' )
      );

      // @private
      this.savedBodiesGroupTandem = tandem.createGroupTandem( 'savedBlackbodyBodyModel' );

      // @public {ObservableArray.<BlackbodyBodyModel>} a property for the user's saved blackbodies
      this.savedBodies = new ObservableArray();

      // @public {number} max wavelength in nanometers
      this.wavelengthMax = 3000;

      // @private {number} maximum number of allowed saved graphs
      this.maxSavedGraphs = 2;
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
     * Saves the main body
     * @public
     */
    saveMainBody() {
      this.savedBodies.add( new BlackbodyBodyModel(
        this.mainBody.temperatureProperty.value,
        this.savedBodiesGroupTandem.createNextTandem()
      ) );
      while ( this.savedBodies.length > this.maxSavedGraphs ) {
        this.savedBodies.shift();
      }
    }

    /**
     * A function that clears saved graphs
     * @public
     */
    clearSavedGraphs() {
      this.savedBodies.clear();
    }
  }

  return blackbodySpectrum.register( 'BlackbodySpectrumModel', BlackbodySpectrumModel );
} );