// Copyright 2014-2018, University of Colorado Boulder

/**
 * Model for the 'BlackbodySpectrum' screen.
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
 */
define( function( require ) {
  'use strict';

  // modules
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var inherit = require( 'PHET_CORE/inherit' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Property = require( 'AXON/Property' );
  var BlackbodyBodyModel = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/model/BlackbodyBodyModel' );

  /**
   * Main constructor for BlackbodySpectrumModel, which contains the general model logic for the sim screen.
   * @constructor
   */
  function BlackbodySpectrumModel() {

    // @public {Property.<boolean>} whether the graph values should be visible
    this.graphValuesVisibleProperty = new BooleanProperty( false );

    // @public {Property.<boolean>} whether the intensity (area under the curve) of the graph should be visible
    this.intensityVisibleProperty = new BooleanProperty( false );

    // @public {Property.<boolean>}
    this.labelsVisibleProperty = new BooleanProperty( false );

    // @public {BlackbodyBodyModel} the main body for the simulation
    this.mainBody = new BlackbodyBodyModel( this, 6000 );

    // @public {Property.<BlackbodyBodyModel>} a property for the user's saved blackbody
    this.savedBodyProperty = new Property( null );

    // @public {number} max wavelength in nanometers
    this.wavelengthMax = 3000;
  }

  blackbodySpectrum.register( 'BlackbodySpectrumModel', BlackbodySpectrumModel );

  return inherit( Object, BlackbodySpectrumModel, {

    /**
     * Resets all of the model's settings and bodies
     */
    reset: function() {
      this.graphValuesVisibleProperty.reset();
      this.intensityVisibleProperty.reset();
      this.labelsVisibleProperty.reset();
      this.mainBody.reset();
      this.savedBodyProperty.reset();
    },

    /**
     * Saves the main body
     */
    saveMainBody: function() {
      this.savedBodyProperty.value = new BlackbodyBodyModel( this, this.mainBody.temperatureProperty.value );
    }

  } );
} );