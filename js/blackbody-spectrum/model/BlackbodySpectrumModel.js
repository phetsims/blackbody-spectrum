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
  var BlackbodyConstants = require( 'BLACKBODY_SPECTRUM/BlackbodyConstants' );
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

  blackbodySpectrum.register( 'BlackbodySpectrumModel', BlackbodySpectrumModel );

  return inherit( Object, BlackbodySpectrumModel, {

    /**
     * Resets all of the model's settings and bodies
     * @public
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
     * @public
     */
    saveMainBody: function() {
      this.savedBodies.add( new BlackbodyBodyModel(
        this.mainBody.temperatureProperty.value,
        this.savedBodiesGroupTandem.createNextTandem()
      ) );
      while ( this.savedBodies.length > this.maxSavedGraphs ) {
        this.savedBodies.shift();
      }
    },

    /**
     * A function that clears saved graphs
     * @public
     */
    clearSavedGraphs: function() {
      this.savedBodies.clear();
    }

  } );
} );