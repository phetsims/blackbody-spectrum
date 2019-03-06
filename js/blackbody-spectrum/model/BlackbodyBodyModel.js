// Copyright 2014-2018, University of Colorado Boulder

/**
 * Model that holds and calculates all the numerical data for a Blackbody spectrum at a given temperature
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
 * @author Arnab Purkayastha
 */
define( function( require ) {
  'use strict';

  // modules
  var BlackbodyConstants = require( 'BLACKBODY_SPECTRUM/BlackbodyConstants' );
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Range = require( 'DOT/Range' );
  var Util = require( 'DOT/Util' );

  // constants
  // colors used for glowing star and circles
  var RED_WAVELENGTH = 650; // red wavelength in nanometers
  var GREEN_WAVELENGTH = 550; // green wavelength in nanometers
  var BLUE_WAVELENGTH = 450; // blue wavelength in nanometers
  var GLOWING_STAR_HALO_MINIMUM_RADIUS = 5; // in pixels
  var GLOWING_STAR_HALO_MAXIMUM_RADIUS = 100; // in pixels

  /**
   * Constructs a Blackbody body at the given temperature
   * @param {BlackbodySpectrumModel} model
   * @param {number} temperature
   * @param {Tandem} tandem
   * @constructor
   */
  function BlackbodyBodyModel( temperature, tandem ) {

    // @public {Property.<number>}
    this.temperatureProperty = new NumberProperty( temperature, {
      range: new Range( 0, 1e6 ),
      tandem: tandem.createTandem( 'temperatureProperty' ),
      phetioDocumentation: 'blackbody temperature'
    } );
  }

  blackbodySpectrum.register( 'BlackbodyBodyModel', BlackbodyBodyModel );

  return inherit( Object, BlackbodyBodyModel, {

    /**
     * Resets the model's temperature and settings
     * REVIEW: Needs visibility annotation
     */
    reset: function() {
      this.temperatureProperty.reset();
    },

    /**
     * Function that returns the spectral radiance at a given wavelength (in nm)
     * The units of spectral radiance are in megaWatts per meter^2 per micrometer
     * Equation in use is Planck's Law which returns a spectral radiance of a Blackbody given a temperature and wavelength
     * Planck's law is that spectral radiance = 2hc^2 / ( l^5 * ( e^( hc / lkt ) - 1 ) )
     * h is Planck's constant, c is the speed of light, l is wavelength, k is the Boltzmann constant, and t is the temperature
     * @public
     * @param {number} wavelength
     * @returns {number}
     */
    getSpectralRadianceAt: function( wavelength ) {

      // Avoiding division by 0
      if ( wavelength === 0 ) {
        return 0;
      }

      var A = 1.191042e-16; // is 2hc^2 in units of watts*m^2/steradian
      var B = 1.438770e7; // is hc/k in units of nanometer-kelvin
      return A / ( Math.pow( wavelength, 5 ) * ( Math.exp( B / ( wavelength * this.temperatureProperty.value ) ) - 1 ) );
    },

    /**
     * Returns a dimensionless temperature parameter
     * Equation uses a standard normalization function with an additional power exponent to help low temperatures be
     * more visible.
     * @private
     * @returns {number}
     */
    getRenormalizedTemperature: function() {
      var POWER_EXPONENT = 0.7; // used to create a more significant difference in normalized temperature near minimum
      return Math.pow(
        Math.max( this.temperatureProperty.value - BlackbodyConstants.minTemperature, 0 ) /
        ( BlackbodyConstants.maxTemperature - BlackbodyConstants.minTemperature ),
        POWER_EXPONENT
      );
    },
    get renormalizedTemperature() { return this.getRenormalizedTemperature(); },

    /**
     * Function that returns a color intensity (an integer ranging from 0 to 255) for a given wavelength
     * @private
     * @param {number} wavelength - in nanometers
     * @returns {number}
     */
    getRenormalizedColorIntensity: function( wavelength ) {
      var red = this.getSpectralRadianceAt( RED_WAVELENGTH ); // intensity as a function of wavelength in nm
      var green = this.getSpectralRadianceAt( GREEN_WAVELENGTH );
      var blue = this.getSpectralRadianceAt( BLUE_WAVELENGTH );
      var largestColorIntensity = Math.max( red, green, blue );
      var colorIntensity = this.getSpectralRadianceAt( wavelength );

      // Scaled renormalizedTemperature by 1.5 to make colors more visible and opaque
      var boundedRenormalizedTemp = Math.min( this.renormalizedTemperature * 1.5, 1 );

      return Math.floor( 255 * boundedRenormalizedTemp * colorIntensity / largestColorIntensity );
    },

    /**
     * Function that returns the total intensity (area under the curve) of the blackbody
     * Equation in use is the Stefan–Boltzmann Law
     * @public
     * @returns {number}
     */
    getTotalIntensity: function() {
      var STEFAN_BOLTZMANN_CONSTANT = 5.670373e-8; // is equal to sigma in units of watts/(m^2*K^4)
      return STEFAN_BOLTZMANN_CONSTANT * Math.pow( this.temperatureProperty.value, 4 );
    },
    get totalIntensity() { return this.getTotalIntensity(); },

    /**
     * Function that returns the peak wavelength (in nanometers) of the blackbody
     * Equation in use is Wien's displacement Law
     * @public
     * @returns {number}
     */
    getPeakWavelength: function() {
      var WIEN_CONSTANT = 2.897773e-3; // is equal to b in units of meters-kelvin
      return 1e9 * WIEN_CONSTANT / this.temperatureProperty.value;
    },
    get peakWavelength() { return this.getPeakWavelength(); },

    /**
     * Function that returns a red color with an intensity that matches the blackbody temperature
     * @public
     * @returns {Color}
     */
    getRedColor: function() {
      var colorIntensity = this.getRenormalizedColorIntensity( RED_WAVELENGTH );
      return new Color( colorIntensity, 0, 0, 1 );
    },
    get redColor() { return this.getRedColor(); },

    /**
     * Function that returns a blue color with an intensity that matches the blackbody temperature
     * @public
     * @returns {Color}
     */
    getBlueColor: function() {
      var colorIntensity = this.getRenormalizedColorIntensity( BLUE_WAVELENGTH );
      return new Color( 0, 0, colorIntensity, 1 );
    },
    get blueColor() { return this.getBlueColor(); },

    /**
     * Function that returns a green color with an intensity that matches the blackbody temperature
     * @public
     * @returns {Color}
     */
    getGreenColor: function() {
      var colorIntensity = this.getRenormalizedColorIntensity( GREEN_WAVELENGTH );
      return new Color( 0, colorIntensity, 0, 1 );
    },
    get greenColor() { return this.getGreenColor(); },

    /**
     * Function that returns a radius (in scenery coordinates) for a given temperature.
     * The radius increases as the temperature increases
     * @public
     * @returns {number}
     */
    getGlowingStarHaloRadius: function() {
      return Util.linear(
        0,
        1,
        GLOWING_STAR_HALO_MINIMUM_RADIUS,
        GLOWING_STAR_HALO_MAXIMUM_RADIUS,
        this.renormalizedTemperature
      );
    },
    get glowingStarHaloRadius() { return this.getGlowingStarHaloRadius(); },

    /**
     * Function that returns a color corresponding to the temperature of the star.
     * In addition, it sets the transparency (less transparent as the temperature increases)
     * @public
     * @returns {Color}
     */
    getGlowingStarHaloColor: function() {
      var alpha = Util.linear( 0, 1, 0, 0.3, this.renormalizedTemperature ); // temperature -> transparency
      return this.starColor.withAlpha( alpha );
    },
    get glowingStarHaloColor() { return this.getGlowingStarHaloColor(); },

    /**
     * Function that returns a color corresponding the temperature of a star
     * The star is approximated as a blackbody
     * @public
     * @returns {Color}
     */
    getStarColor: function() {
      var red = this.getRenormalizedColorIntensity( RED_WAVELENGTH );
      var green = this.getRenormalizedColorIntensity( GREEN_WAVELENGTH );
      var blue = this.getRenormalizedColorIntensity( BLUE_WAVELENGTH );
      return new Color( red, green, blue, 1 );
    },
    get starColor() { return this.getStarColor(); }

  } );

} );