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

    // @public {Property.<boolean>}
    this.graphValuesVisibleProperty = new BooleanProperty( false );

    // @public {Property.<boolean>}
    this.intensityVisibleProperty = new BooleanProperty( false );

    // @public {Property.<boolean>}
    this.labelsVisibleProperty = new BooleanProperty( false );

    // @public {BlackbodyBodyModel}
    this.mainBody = new BlackbodyBodyModel();

    // @public {Property.<BlackbodyBodyModel>}
    this.savedBodyProperty = new Property( null );
  }

  blackbodySpectrum.register( 'BlackbodySpectrumModel', BlackbodySpectrumModel );

  return inherit( Object, BlackbodySpectrumModel, {

    /**
     * Resets the model's temperature and settings
     */
    reset: function() {
      this.graphValuesVisibleProperty.reset();
      this.intensityVisibleProperty.reset();
      this.labelsVisibleProperty.reset();
      this.savedBodyProperty.reset();
    },

    /**
     * Saves the mainGraph
     */
    saveMainBody: function() {
      this.savedBodyProperty.value = new BlackbodyBodyModel();
      this.savedBodyProperty.value.temperatureProperty.value = this.mainBody.temperatureProperty.value;
    }

  } );
} );