// Copyright 2014-2019, University of Colorado Boulder

/**
 * Main model for the BlackbodySpectrum screen
 * Controls or contains all of the main sim logic
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
 */
define( function( require ) {
  'use strict';

  // modules
  var blackbodyConstants = require( 'BLACKBODY_SPECTRUM/blackbodyConstants' );
  var BlackbodyBodyModel = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/model/BlackbodyBodyModel' );
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );

  /**
   * Main constructor for BlackbodySpectrumModel, which contains the general model logic for the sim screen.
   * @param {Tandem} tandem
   * @constructor
   */
  function BlackbodySpectrumModel( tandem ) {

    // @public {Property.<boolean>} whether the graph values should be visible
    this.graphValuesVisibleProperty = new BooleanProperty( false );

    // @public {Property.<boolean>} whether the intensity (area under the curve) of the graph should be visible
    this.intensityVisibleProperty = new BooleanProperty( false );

    // @public {Property.<boolean>}
    this.labelsVisibleProperty = new BooleanProperty( false );

    // @public {BlackbodyBodyModel} the main body for the simulation
    this.mainBody = new BlackbodyBodyModel( blackbodyConstants.earthTemperature );

    // @public {ObservableArray.<BlackbodyBodyModel>} a property for the user's saved blackbodies
    this.savedBodies = new ObservableArray();

    // @public {number} max wavelength in nanometers
    this.wavelengthMax = 3000;

    // @private {number} maximum number of allowed saved graphs
    this.maxSavedGraphs = 2;
  }

  blackbodySpectrum.register( 'BlackbodySpectrumModel', BlackbodySpectrumModel );

  return inherit( Object, BlackbodySpectrumModel, {

    /**
     * Resets all of the model's settings and bodies
     * REVIEW: Needs visibility annotation
     */
    reset: function() {
      this.graphValuesVisibleProperty.reset();
      this.intensityVisibleProperty.reset();
      this.labelsVisibleProperty.reset();
      this.mainBody.reset();
      this.clearSavedGraphs();
    },

    /**
     * Saves the main body
     * REVIEW: Needs visibility annotation
     */
    saveMainBody: function() {
      this.savedBodies.add( new BlackbodyBodyModel( this.mainBody.temperatureProperty.value ) );
      while ( this.savedBodies.length > this.maxSavedGraphs ) {
        this.savedBodies.shift();
      }
    },

    /**
     * A function that clears saved graphs
     * REVIEW: Needs visibility annotation
     */
    clearSavedGraphs: function() {
      this.savedBodies.clear();
    }

  } );
} );