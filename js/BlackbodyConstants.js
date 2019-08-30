// Copyright 2019, University of Colorado Boulder

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

  const BlackbodyConstants = {

    // Thermometer Temperature Values
    minTemperature: 200,
    maxTemperature: 11000,
    earthTemperature: 250,
    lightBulbTemperature: 3000,
    sunTemperature: 5800,
    siriusATemperature: 9950,

    // Wavelength Label Values
    xRayWavelength: 10,
    ultravioletWavelength: 380,
    visibleWavelength: 780,
    infraredWavelength: 100000,

    // Axes Values
    minHorizontalZoom: 750,
    maxHorizontalZoom: 48000,
    minVerticalZoom: 0.000014336,
    maxVerticalZoom: 3500,

    LABEL_FONT: new PhetFont( 22 )
  };

  return blackbodySpectrum.register( 'BlackbodyConstants', BlackbodyConstants );
} );