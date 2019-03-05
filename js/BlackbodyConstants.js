// Copyright 2014-2019, University of Colorado Boulder

/**
 * This class is a collection of constants that configure global properties. If you change something here, it will
 * change *everywhere* in this simulation.
 *
 * @author Arnab Purkayastha
 */
define( function( require ) {
  'use strict';

  // modules
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );

  var BlackbodyConstants = {

    // Thermometer Temperature Values
    minTemperature: 270,
    maxTemperature: 11000,
    earthTemperature: 300,
    lightBulbTemperature: 3000,
    sunTemperature: 5778,
    siriusATemperature: 9940,

    // Wavelength Label Values
    xRayWavelength: 10,
    ultravioletWavelength: 400,
    visibleWavelength: 700,
    infraredWavelength: 100000

  };

  blackbodySpectrum.register( 'BlackbodyConstants', BlackbodyConstants );

  return BlackbodyConstants;

} );