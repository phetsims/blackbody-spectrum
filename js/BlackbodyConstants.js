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
  var Tandem = require( 'TANDEM/Tandem' );

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
    infraredWavelength: 100000,

    // Axes Values
    minHorizontalZoom: 750,
    maxHorizontalZoom: 48000,
    minVerticalZoom: 0.000014336,
    maxVerticalZoom: 700,

    GLOBALS_TANDEM: Tandem.rootTandem.createTandem( 'globals' ) // A static tandem that all globals can be created under.
  };

  blackbodySpectrum.register( 'BlackbodyConstants', BlackbodyConstants );

  return BlackbodyConstants;

} );