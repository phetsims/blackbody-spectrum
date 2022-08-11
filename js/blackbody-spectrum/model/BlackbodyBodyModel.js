// Copyright 2014-2022, University of Colorado Boulder

/**
 * Model that holds and calculates all the numerical data for a Blackbody spectrum at a given temperature
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
 * @author Arnab Purkayastha
 */

import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import { Color } from '../../../../scenery/js/imports.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import BlackbodyConstants from '../../BlackbodyConstants.js';
import blackbodySpectrum from '../../blackbodySpectrum.js';

// constants
// colors used for glowing star and circles
const RED_WAVELENGTH = 650; // red wavelength in nanometers
const GREEN_WAVELENGTH = 550; // green wavelength in nanometers
const BLUE_WAVELENGTH = 450; // blue wavelength in nanometers
const GLOWING_STAR_HALO_MINIMUM_RADIUS = 5; // in pixels
const GLOWING_STAR_HALO_MAXIMUM_RADIUS = 100; // in pixels

class BlackbodyBodyModel {

  /**
   * Constructs a Blackbody body at the given temperature
   * @param {number|null} temperature
   * @param {Tandem} tandem
   */
  constructor( temperature, tandem ) {

    // @public {Property.<number|null>}
    this.temperatureProperty = new Property( temperature, {
      tandem: tandem.createTandem( 'temperatureProperty' ),
      phetioValueType: NullableIO( NumberIO ),
      phetioDocumentation: 'Determines the temperature of the blackbody. Saved bodies have a null temperature when ' +
                           'they don\'t exist in the simulation.'
    } );

    // guard for performance
    if ( assert ) {
      const validTemperatureRange = new Range( BlackbodyConstants.minTemperature, BlackbodyConstants.maxTemperature );

      // validate the temperature since we can't use NumberProperty validation
      this.temperatureProperty.link( temperature => {
        temperature !== null &&
        assert( validTemperatureRange.contains( temperature ), `temperature out of range: ${temperature}` );
      } );
    }
  }

  /**
   * Resets the model's temperature and settings
   * @public
   */
  reset() {
    this.temperatureProperty.reset();
  }

  /**
   * Function that returns the spectral power density at a given wavelength (in nm)
   * The units of spectral power density are in megaWatts per meter^2 per micrometer
   * Equation in use is Planck's Law which returns a spectral radiance of a Blackbody given a temperature and wavelength
   * Planck's law is that spectral radiance = 2hc^2 / ( l^5 * ( e^( hc / lkt ) - 1 ) )
   * This spectral radiance is multiplied by pi to retrieve the spectral power density
   * h is Planck's constant, c is the speed of light, l is wavelength, k is the Boltzmann constant, and t is the temperature
   * @public
   * @param {number} wavelength
   * @returns {number}
   */
  getSpectralPowerDensityAt( wavelength ) {

    // Avoiding division by 0
    if ( wavelength === 0 ) {
      return 0;
    }

    const A = 3.74192e-16; // is 2πhc^2 in units of watts*m^2
    const B = 1.438770e7; // is hc/k in units of nanometer-kelvin
    return A / ( Math.pow( wavelength, 5 ) * ( Math.exp( B / ( wavelength * this.temperatureProperty.value ) ) - 1 ) );
  }

  /**
   * Returns a dimensionless temperature parameter
   * Equation uses a standard normalization function with an additional power exponent to help low temperatures be
   * more visible.
   * @private
   * @returns {number}
   */
  getRenormalizedTemperature() {
    assert && assert( this.temperatureProperty.value >= BlackbodyConstants.minTemperature,
      `Temperature set lower than minimum: ${BlackbodyConstants.minTemperature}` );
    const powerExponent = 0.5; // used to minimize scaling of halo at high temperatures
    const draperPoint = 798; // in Kelvin
    const normalizationScaling = 0.02; // determined empirically

    const relativeTemp = Math.max( this.temperatureProperty.value, draperPoint ) - draperPoint;
    return normalizationScaling * Math.pow( relativeTemp, powerExponent );
  }

  get renormalizedTemperature() { return this.getRenormalizedTemperature(); }

  /**
   * Function that returns a color intensity (an integer ranging from 0 to 255) for a given wavelength
   * @private
   * @param {number} wavelength - in nanometers
   * @returns {number}
   */
  getRenormalizedColorIntensity( wavelength ) {
    const red = this.getSpectralPowerDensityAt( RED_WAVELENGTH ); // intensity as a function of wavelength in nm
    const green = this.getSpectralPowerDensityAt( GREEN_WAVELENGTH );
    const blue = this.getSpectralPowerDensityAt( BLUE_WAVELENGTH );
    const largestColorIntensity = Math.max( red, green, blue );
    const colorIntensity = this.getSpectralPowerDensityAt( wavelength );
    const boundedRenormalizedTemp = Math.min( this.renormalizedTemperature, 1 );
    return Math.floor( 255 * boundedRenormalizedTemp * colorIntensity / largestColorIntensity );
  }

  /**
   * Function that returns the total intensity (area under the curve) of the blackbody
   * Equation in use is the Stefan–Boltzmann Law: Intensity = σT^4
   * σ is the Stefan-Boltzmann constant, T is the temperature
   * @public
   * @returns {number}
   */
  getTotalIntensity() {
    const STEFAN_BOLTZMANN_CONSTANT = 5.670373e-8; // is equal to sigma in units of watts/(m^2*K^4)
    return STEFAN_BOLTZMANN_CONSTANT * Math.pow( this.temperatureProperty.value, 4 );
  }

  get totalIntensity() { return this.getTotalIntensity(); }

  /**
   * Function that returns the peak wavelength (in nanometers) of the blackbody
   * Equation in use is Wien's displacement Law: Peak wavelength = b / T
   * b is Wien's displacement constant, T is the temperature
   * @public
   * @returns {number}
   */
  getPeakWavelength() {
    assert && assert( this.temperatureProperty.value > 0, 'Temperature must be positive' );
    const WIEN_CONSTANT = 2.897773e-3; // is equal to b in units of meters-kelvin
    return 1e9 * WIEN_CONSTANT / this.temperatureProperty.value;
  }

  get peakWavelength() { return this.getPeakWavelength(); }

  /**
   * Function that returns a red color with an intensity that matches the blackbody temperature
   * @public
   * @returns {Color}
   */
  getRedColor() {
    const colorIntensity = this.getRenormalizedColorIntensity( RED_WAVELENGTH );
    return new Color( colorIntensity, 0, 0, 1 );
  }

  get redColor() { return this.getRedColor(); }

  /**
   * Function that returns a blue color with an intensity that matches the blackbody temperature
   * @public
   * @returns {Color}
   */
  getBlueColor() {
    const colorIntensity = this.getRenormalizedColorIntensity( BLUE_WAVELENGTH );
    return new Color( 0, 0, colorIntensity, 1 );
  }

  get blueColor() { return this.getBlueColor(); }

  /**
   * Function that returns a green color with an intensity that matches the blackbody temperature
   * @public
   * @returns {Color}
   */
  getGreenColor() {
    const colorIntensity = this.getRenormalizedColorIntensity( GREEN_WAVELENGTH );
    return new Color( 0, colorIntensity, 0, 1 );
  }

  get greenColor() { return this.getGreenColor(); }

  /**
   * Function that returns a radius (in scenery coordinates) for a given temperature.
   * The radius increases as the temperature increases
   * @public
   * @returns {number}
   */
  getGlowingStarHaloRadius() {
    return Utils.linear(
      0,
      2,
      GLOWING_STAR_HALO_MINIMUM_RADIUS,
      GLOWING_STAR_HALO_MAXIMUM_RADIUS,
      this.renormalizedTemperature
    );
  }

  get glowingStarHaloRadius() { return this.getGlowingStarHaloRadius(); }

  /**
   * Function that returns a color corresponding to the temperature of the star.
   * In addition, it sets the transparency (less transparent as the temperature increases)
   * @public
   * @returns {Color}
   */
  getGlowingStarHaloColor() {
    const alpha = Utils.linear( 0, 1, 0, 0.3, this.renormalizedTemperature ); // temperature -> transparency
    return this.starColor.withAlpha( alpha );
  }

  get glowingStarHaloColor() { return this.getGlowingStarHaloColor(); }

  /**
   * Function that returns a color corresponding the temperature of a star
   * The star is approximated as a blackbody
   * @public
   * @returns {Color}
   */
  getStarColor() {
    const red = this.getRenormalizedColorIntensity( RED_WAVELENGTH );
    const green = this.getRenormalizedColorIntensity( GREEN_WAVELENGTH );
    const blue = this.getRenormalizedColorIntensity( BLUE_WAVELENGTH );
    return new Color( red, green, blue, 1 );
  }

  get starColor() { return this.getStarColor(); }

}

blackbodySpectrum.register( 'BlackbodyBodyModel', BlackbodyBodyModel );
export default BlackbodyBodyModel;