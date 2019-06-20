// Copyright 2014-2019, University of Colorado Boulder

/**
 * This class is a collection of constants that configure global properties. If you change something here, it will
 * change *everywhere* in this simulation.
 *
 * @author Arnab Purkayastha
 */
define( require => {
  'use strict';

  // modules
  const blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Tandem = require( 'TANDEM/Tandem' );

  const BlackbodyConstants = {

    // Thermometer Temperature Values
    minTemperature: 270,
    maxTemperature: 11000,
    earthTemperature: 300,
    lightBulbTemperature: 3000,
    sunTemperature: 5778,
    siriusATemperature: 9940,

    // Wavelength Label Values
    xRayWavelength: 10,
    ultravioletWavelength: 380,
    visibleWavelength: 780,
    infraredWavelength: 100000,

    // Axes Values
    minHorizontalZoom: 750,
    maxHorizontalZoom: 48000,
    minVerticalZoom: 0.000014336,
    maxVerticalZoom: 700,

    LABEL_FONT: new PhetFont( 22 ),

    GLOBALS_TANDEM: Tandem.rootTandem.createTandem( 'globals' ) // A static tandem that all globals can be created under.
  };

  return blackbodySpectrum.register( 'BlackbodyConstants', BlackbodyConstants );
} );