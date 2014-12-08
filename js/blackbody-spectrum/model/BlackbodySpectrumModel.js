// Copyright 2002-2014, University of Colorado Boulder

/**
 * Model for the 'BlackbodySpectrum' screen.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );


  //constants
  var GRAPH_NUMBER_POINTS = 300; //number of points blackbody curve is evaluated at
  var FIRST_RADIATION_CONSTANT = 1.191042e-16; // is equal to 2 hc^2  in units of watts*m^2/steradian
  var SECOND_RADIATION_CONSTANT = 1.438770e7; // is equal to  hc/k  in units of nanometer-kelvin

  var POWER_EXPONENT = 0.7;   // an exponent to calculate the renormalized temperature
  // colors used for glowing star and circles
  var RED_WAVELENGTH = 650; //red wavelength in nanometers
  var GRE_WAVELENGTH = 550; //green wavelength in nanometers
  var BLU_WAVELENGTH = 450; //blue wavelength in nanometers
  var GLOWING_STAR_HALO_MINIMUM_RADIUS = 5;  // in pixels
  var GLOWING_STAR_HALO_MAXIMUM_RADIUS = 40; // in pixels


  /**
   * Main constructor for BlackbodySpectrumModel, which contains all of the model logic for the entire sim screen.
   * @constructor
   */
  function BlackbodySpectrumModel() {

    var thisModel = this;

    // @private
    this.intensityArray = new Array( GRAPH_NUMBER_POINTS ); //Blackbody spectrum intensity

    // @public
    this.wavelengthMax = 3000; // max wavelength in nanometers

    // bounds of the graph
    // @public read-only
    this.bounds = new Bounds2( 0, 0, 1, 1 );

    PropertySet.call( thisModel, {
        rulerPosition: new Vector2( 120, 310 ),
        isRulerVisible: false,
        temperature: 6000, //initial temperature in Kelvin
        horizontalZoom: 0,
        verticalZoom: 0
      }
    );

  }

  return inherit( PropertySet, BlackbodySpectrumModel, {
    // @private
    intensityRadiation: function( wavelength, temperature ) {
      var intensityRadiation;
      var prefactor;
      var exponentialTerm;
      if ( wavelength === 0 ) {
        // let's avoid division by zero.
        intensityRadiation = 0;
      }
      else {
        prefactor = (FIRST_RADIATION_CONSTANT / Math.pow( wavelength, 5 ));
        exponentialTerm = 1 / (Math.exp( SECOND_RADIATION_CONSTANT / (wavelength * temperature) ) - 1);
        intensityRadiation = prefactor * exponentialTerm;
      }
      return intensityRadiation;
    },

    // @private
    renormalizedTemperature: function( temperature ) {
      /*
       the function below seems very hacky but it was found in MD flash implementation.
       This renormalized temperature is above 0 but it can exceed one.
       i dont know why you would want to raise it to a power of 0.7
       */
      var temperatureMinimum = 700; //temp(K) at which color of the circles and star turns on
      var temperatureMaximum = 3000; //temp(K) at which color of the circles maxes out

      return Math.pow( Math.max( temperature - temperatureMinimum, 0 ) / (temperatureMaximum - temperatureMinimum), POWER_EXPONENT ); //
    },

    // @private
    renormalizedColorIntensity: function( wavelength, temperature ) {
      var red = this.intensityRadiation( RED_WAVELENGTH, temperature ); // intensity as a function of wavelength in nm
      var gre = this.intensityRadiation( GRE_WAVELENGTH, temperature );
      var blu = this.intensityRadiation( BLU_WAVELENGTH, temperature );
      var largestColorIntensity = Math.max( red, gre, blu );
      var colorIntensity = this.intensityRadiation( wavelength, temperature );
      var boundedRenormalizedTemp = Math.min( this.renormalizedTemperature( temperature ), 1 );
      return Math.floor( 255 * boundedRenormalizedTemp * colorIntensity / largestColorIntensity );
    },

    coordinatesY: function( temperature ) {
      for ( var i = 0; i < GRAPH_NUMBER_POINTS; i++ ) {
        var wavelength = i * this.wavelengthMax / GRAPH_NUMBER_POINTS;
        this.intensityArray[i] = this.intensityRadiation( wavelength, temperature );
      }
      return this.intensityArray;
    },
    // @public
    getRedColor: function( temperature ) {
      var red = this.renormalizedColorIntensity( RED_WAVELENGTH, temperature );
      return new Color( red, 0, 0, 1 );
    },
    // @public
    getBluColor: function( temperature ) {
      var blu = this.renormalizedColorIntensity( BLU_WAVELENGTH, temperature );
      return new Color( 0, 0, blu, 1 );
    },
    // @public
    getGreColor: function( temperature ) {
      var gre = this.renormalizedColorIntensity( GRE_WAVELENGTH, temperature );
      return new Color( 0, gre, 0, 1 );
    },
    // @public
    getGlowingStarHaloRadius: function( temperature ) {
      var renTemp = this.renormalizedTemperature( temperature );
      return Util.linear( 0, 1, GLOWING_STAR_HALO_MINIMUM_RADIUS, GLOWING_STAR_HALO_MAXIMUM_RADIUS, renTemp ); // temperature -> radius
    },
    // @public
    getGlowingStarHaloColor: function( temperature ) {
      var red = this.renormalizedColorIntensity( RED_WAVELENGTH, temperature );
      var gre = this.renormalizedColorIntensity( GRE_WAVELENGTH, temperature );
      var blu = this.renormalizedColorIntensity( BLU_WAVELENGTH, temperature );
      var renTemp = this.renormalizedTemperature( temperature );
      var alpha = Util.linear( 0, 1, 0, 0.1, renTemp ); // temperature -> transparency
      return new Color( red, gre, blu, alpha );
    },

    // @public
    getStarColor: function( temperature ) {
      var red = this.renormalizedColorIntensity( RED_WAVELENGTH, temperature );
      var gre = this.renormalizedColorIntensity( GRE_WAVELENGTH, temperature );
      var blu = this.renormalizedColorIntensity( BLU_WAVELENGTH, temperature );
      return new Color( red, gre, blu, 1 );
    },

    // @public
    reset: function() {
      PropertySet.prototype.reset.call( this );
    }
  } );
} );