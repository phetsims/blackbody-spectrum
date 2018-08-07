// Copyright 2014-2018, University of Colorado Boulder

/**
 * Model that holds all the numerical data for a blackbody spectrum at a given temperature
 *
 * @author Martin Veillette (Berea College)
 * @author Saurabh Totey
 */
define( function( require ) {
	'use strict';

  // modules
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Color = require( 'SCENERY/util/Color' );
  var Util = require( 'DOT/Util' );

  // constants
  var GRAPH_NUMBER_POINTS = 300; // number of points blackbody curve is evaluated at
  var FIRST_RADIATION_CONSTANT = 1.191042e-16; // is equal to 2 hc^2  in units of watts*m^2/steradian
  var SECOND_RADIATION_CONSTANT = 1.438770e7; // is equal to  hc/k  in units of nanometer-kelvin
  var WIEN_CONSTANT = 2.897773e-3; // is equal to b in units of meters-kelvin
  var STEFAN_BOLTZMANN_CONSTANT = 5.670373e-8; // is equal to sigma in units of watts/(m^2*K^4)
  var POWER_EXPONENT = 0.7;   // an exponent to calculate the renormalized temperature

  // colors used for glowing star and circles
  var RED_WAVELENGTH = 650; // red wavelength in nanometers
  var GRE_WAVELENGTH = 550; // green wavelength in nanometers
  var BLU_WAVELENGTH = 450; // blue wavelength in nanometers
  var GLOWING_STAR_HALO_MINIMUM_RADIUS = 5;  // in pixels
  var GLOWING_STAR_HALO_MAXIMUM_RADIUS = 40; // in pixels

  /**
   * Constructs a Blackbody body at the given temperature
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
     */
    reset: function() {
      this.temperatureProperty.reset();
    },

    /**
     * Function that returns the spectral radiance at a given wavelength (in nm)
     * The units of spectral radiance are in megaWatts per meter^2 per micrometer
     * @public
     * @param {number} wavelength
     * @returns {number}
     */
    getSpectralRadianceAt: function( wavelength ) {
      var intensityRadiation;
      var prefactor;
      var exponentialTerm;
      if ( wavelength === 0 ) {
        // let's avoid division by zero.
        return 0;
      }
      prefactor = ( FIRST_RADIATION_CONSTANT / Math.pow( wavelength, 5 ) );
      exponentialTerm = 1 / ( Math.exp( SECOND_RADIATION_CONSTANT / ( wavelength * this.temperatureProperty.value ) ) - 1 );
      intensityRadiation = prefactor * exponentialTerm;
      return intensityRadiation;
    },

    /**
     * Returns a dimensionless temperature parameter
     * @private
     * @returns {number}
     */
    getRenormalizedTemperature: function() {
      /*
       the function below seems very hacky but it was found in MD flash implementation.
       This renormalized temperature is above 0 but it can exceed one.
       I dont know why you would want to raise it to a power of 0.7
       */
      var temperatureMinimum = 700; // temp(K) at which color of the circles and star turns on
      var temperatureMaximum = 3000; // temp(K) at which color of the circles maxes out
      return Math.pow( Math.max( this.temperatureProperty.value - temperatureMinimum, 0 ) / ( temperatureMaximum - temperatureMinimum ), POWER_EXPONENT );
    },
    get renormalizedTemperature() { return this.getRenormalizedTemperature(); },

    /**
     * Function that returns a color intensity (an integer ranging from 0 to 255) for a given wavelength
     * @private
     * @param {number} wavelength - in nanometer
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
     * Function that returns an array of radiation intensity (the y axis).
     * The x axis is determined based on the current value of wavelengthMax. The y axis
     * is given in model coordinates , i.e. with units of MW/m^2/micrometer
     * @public
     * @returns {Array.<number>}
     */
    getCoordinatesY: function() {
      var intensityArray = new Array( GRAPH_NUMBER_POINTS );
      for ( var i = 0; i < GRAPH_NUMBER_POINTS; i++ ) {
        var wavelength = i * this.model.wavelengthMax / GRAPH_NUMBER_POINTS;
        intensityArray[ i ] = this.getSpectralRadianceAt( wavelength );
      }
      return intensityArray;
    },
    get coordinatesY() { return this.getCoordinatesY(); },

    /**
     * Function that returns the total intensity (area under the curve) of the blackbody
     * @public
     * @returns {number}
     */
    getTotalIntensity: function() {
      return STEFAN_BOLTZMANN_CONSTANT * Math.pow( this.temperatureProperty.value, 4 );
    },
    get totalIntensity() { return this.getTotalIntensity(); },

    /**
     * Function that returns the peak wavelength (in nanometers) of the blackbody.
     * @public
     * @returns {number}
     */
    getPeakWavelength: function() {
      return 1e9 * WIEN_CONSTANT / this.temperatureProperty.value;
    },
    get peakWavelength() { return this.getPeakWavelength(); },

    /**
     * Function that returns a red color with an intensity that matches the blackbody temperature
     * @public
     * @returns {Color}
     */
    getRedColor: function() {
      return new Color( this.getRenormalizedColorIntensity( RED_WAVELENGTH ), 0, 0, 1 );
    },
    get redColor() { return this.getRedColor(); },

    /**
     * Function that returns a blue color with an intensity that matches the blackbody temperature
     * @public
     * @returns {Color}
     */
    getBluColor: function() {
      return new Color( 0, 0, this.getRenormalizedColorIntensity( BLU_WAVELENGTH ), 1 );
    },
    get bluColor() { return this.getBluColor(); },

    /**
     * Function that returns a green color with an intensity that matches the blackbody temperature
     * @public
     * @returns {Color}
     */
    getGreColor: function() {
      return new Color( 0, this.getRenormalizedColorIntensity( GRE_WAVELENGTH ), 0, 1 );
    },
    get greColor() { return this.getGreColor(); },

    /**
     * Function that returns a radius (in scenery coordinates) for a given temperature.
     * The radius increases as the temperature increases
     * @public
     * @returns {number}
     */
    getGlowingStarHaloRadius: function() {
      var renTemp = this.renormalizedTemperature;
      return Util.linear( 0, 1, GLOWING_STAR_HALO_MINIMUM_RADIUS, GLOWING_STAR_HALO_MAXIMUM_RADIUS, renTemp ); // temperature -> radius
    },
    get glowingStarHaloRadius() { return this.getGlowingStarHaloRadius(); },

    /**
     * Function that returns a color corresponding to the temperature of the star.
     * In addition, it sets the transparency (less transparent as the temperature increases)
     * @public
     * @returns {Color}
     */
    getGlowingStarHaloColor: function() {
      var color = this.starColor;
      var renTemp = this.renormalizedTemperature;
      var alpha = Util.linear( 0, 1, 0, 0.1, renTemp ); // temperature -> transparency
      return color.withAlpha( alpha );
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