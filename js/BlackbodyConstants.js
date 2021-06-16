// Copyright 2019-2021, University of Colorado Boulder

/**
 * This class is a collection of constants that configure global properties. If you change something here, it will
 * change *everywhere* in this simulation.
 *
 * @author Arnab Purkayastha
 */

import PhetFont from '../../scenery-phet/js/PhetFont.js';
import blackbodySpectrum from './blackbodySpectrum.js';

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
  minVerticalZoom: 0.00001024,
  maxVerticalZoom: 2500,

  LABEL_FONT: new PhetFont( 22 )
};

blackbodySpectrum.register( 'BlackbodyConstants', BlackbodyConstants );
export default BlackbodyConstants;