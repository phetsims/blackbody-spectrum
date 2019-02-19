// Copyright 2014-2018, University of Colorado Boulder

/**
 * Model that holds and calculates all the numerical data for a Blackbody spectrum at a given temperature
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
 */
define( function( require ) {
	'use strict';

  // modules
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Util = require( 'DOT/Util' );

  // constants
  // colors used for glowing star and circles
  var RED_WAVELENGTH = 650; // red wavelength in nanometers
  // REVIEW: "gre" and "blu" should be changed to "green" and "blue", respectively. All uses in this file, including
  // constants, vars, and function names should be updated. I'm seeing uses in BlackbodySpectrumScreenView as well.
  var GRE_WAVELENGTH = 550; // green wavelength in nanometers
  var BLU_WAVELENGTH = 450; // blue wavelength in nanometers
  var GLOWING_STAR_HALO_MINIMUM_RADIUS = 5; // in pixels
  var GLOWING_STAR_HALO_MAXIMUM_RADIUS = 40; // in pixels

  /**
   * Constructs a Blackbody body at the given temperature
   * REVIEW: Maybe I'm missing something, but it seems like model isn't needed in this type at all. I commented out the
   * param, and the corresponding args in the two uses of new BlackbodyBodyModel(), and the sim still worked fine.
   * @param {BlackbodySpectrumModel} model
   * @param {number} temperature
   * @constructor
   */
  function BlackbodyBodyModel( model, temperature ) {

    // @private
    this.model = model;

    // @public {Property.<number>} initial temperature in kelvin
    this.temperatureProperty = new NumberProperty( temperature );
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
      // REVIEW: The form of the equation below should match what is written in the comment so that it's easier to read
      // and directly compare to the comment.
      return A / Math.pow( wavelength, 5 ) / ( Math.exp( B / ( wavelength * this.temperatureProperty.value ) ) - 1 );
    },

    /**
     * Returns a dimensionless temperature parameter
     * @private
     * @returns {number}
     */
    getRenormalizedTemperature: function() {
      // REVIEW: The comment below should be addressed. If a non-hacky solution is still needed, then that should be
      // investigated and implemented. Otherwise, the comment should be deleted and another added that explains what's
      // happening.
      /*
       the function below seems very hacky but it was found in MD flash implementation.
       This renormalized temperature is above 0 but it can exceed one.
       I dont know why you would want to raise it to a power of 0.7
       */
      var POWER_EXPONENT = 0.7; // an exponent to calculate the renormalized temperature
      var temperatureMinimum = 700; // temp(K) at which color of the circles and star turns on
      var temperatureMaximum = 3000; // temp(K) at which color of the circles maxes out
      // REVIEW: expand to multiple lines to stay within 120 characters
      return Math.pow( Math.max( this.temperatureProperty.value - temperatureMinimum, 0 ) / ( temperatureMaximum - temperatureMinimum ), POWER_EXPONENT );
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
      var gre = this.getSpectralRadianceAt( GRE_WAVELENGTH );
      var blu = this.getSpectralRadianceAt( BLU_WAVELENGTH );
      var largestColorIntensity = Math.max( red, gre, blu );
      var colorIntensity = this.getSpectralRadianceAt( wavelength );
      var boundedRenormalizedTemp = Math.min( this.renormalizedTemperature, 1 );
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
    getBluColor: function() {
      var colorIntensity = this.getRenormalizedColorIntensity( BLU_WAVELENGTH );
      return new Color( 0, 0, colorIntensity, 1 );
    },
    get bluColor() { return this.getBluColor(); },

    /**
     * Function that returns a green color with an intensity that matches the blackbody temperature
     * @public
     * @returns {Color}
     */
    getGreColor: function() {
      var colorIntensity = this.getRenormalizedColorIntensity( GRE_WAVELENGTH );
      return new Color( 0, colorIntensity, 0, 1 );
    },
    get greColor() { return this.getGreColor(); },

    /**
     * Function that returns a radius (in scenery coordinates) for a given temperature.
     * The radius increases as the temperature increases
     * @public
     * @returns {number}
     */
    getGlowingStarHaloRadius: function() {
      // REVIEW: expand to multiple lines to stay within 120 characters
      return Util.linear( 0, 1, GLOWING_STAR_HALO_MINIMUM_RADIUS, GLOWING_STAR_HALO_MAXIMUM_RADIUS, this.renormalizedTemperature ); // temperature -> radius
    },
    get glowingStarHaloRadius() { return this.getGlowingStarHaloRadius(); },

    /**
     * Function that returns a color corresponding to the temperature of the star.
     * In addition, it sets the transparency (less transparent as the temperature increases)
     * @public
     * @returns {Color}
     */
    getGlowingStarHaloColor: function() {
      var alpha = Util.linear( 0, 1, 0, 0.1, this.renormalizedTemperature ); // temperature -> transparency
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
      var gre = this.getRenormalizedColorIntensity( GRE_WAVELENGTH );
      var blu = this.getRenormalizedColorIntensity( BLU_WAVELENGTH );
      return new Color( red, gre, blu, 1 );
    },
    get starColor() { return this.getStarColor(); }

  } );

} );