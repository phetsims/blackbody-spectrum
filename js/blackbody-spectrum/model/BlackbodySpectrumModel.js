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

  /**
   * Main constructor for BlackbodySpectrumModel, which contains all of the model logic for the entire sim screen.
   * @constructor
   */
  function BlackbodySpectrumModel() {

    var thisModel = this;

    this.numberPoints = 300; //number of points blackbody curve is evaluated at
    this.firstRadiationConstant = 1.191042e-16; // is equal to 2 hc^2  in units of watts*m^2/steradian
    this.secondRadiationConstant = 1.438770e7; // is equal to  hc/k  in units of nanometer-kelvin
    this.lambdaMax = 3000; // max wavelength in nanometers
    this.intensityArray = new Array( this.numberPoints ); //Blackbody spectrum intensity
    this.temperatureMinimum = 700; //temp(K) at which color of the circles and star turns on
    this.temperatureMaximum = 3000; //temp(K) at which color of the circles maxes out
    this.powerLaw = 0.7;   // an exponent to calculate the renormalized temperature
    // colors used for glowing star and circles
    this.redWavelength = 650; //red wavelength in nanometers
    this.greWavelength = 550; //green wavelength in nanometers
    this.bluWavelength = 450; //blue wavelength in nanometers
    this.radiusGlowingStarHaloMinimum = 5;
    this.radiusGlowingStarHaloMaximum = 40;


    // bounds of the graph
    this.bounds = new Bounds2( 0, 0, 1, 1 );


    PropertySet.call( thisModel, {
        rulerPosition: new Vector2( 120, 310 ),
        isRulerVisible: false,
        temperature: 6000, //initial temperature in Kelvin
        horizontalZoom: 0,
        verticalZoom: 0
      }
    );


    this.addDerivedProperty( 'redColor', ['temperature'], function( temperature ) {
      var red = thisModel.renormalizedColorIntensity( thisModel.redWavelength, temperature );
      return new Color( red, 0, 0, 1 ); //a string
    } );

    this.addDerivedProperty( 'greColor', ['temperature'], function( temperature ) {
      var gre = thisModel.renormalizedColorIntensity( thisModel.greWavelength, temperature );
      return new Color( 0, gre, 0, 1 );
    } );

    this.addDerivedProperty( 'bluColor', ['temperature'], function( temperature ) {
      var blu = thisModel.renormalizedColorIntensity( thisModel.bluWavelength, temperature );
      return new Color( 0, 0, blu, 1 );
    } );

    this.addDerivedProperty( 'starColor', ['temperature'], function( temperature ) {
      var red = thisModel.renormalizedColorIntensity( thisModel.redWavelength, temperature );
      var gre = thisModel.renormalizedColorIntensity( thisModel.greWavelength, temperature );
      var blu = thisModel.renormalizedColorIntensity( thisModel.bluWavelength, temperature );
      return new Color( red, gre, blu, 1 );
    } );

    this.addDerivedProperty( 'glowingStarHaloColor', ['temperature'], function( temperature ) {
      var red = thisModel.renormalizedColorIntensity( thisModel.redWavelength, temperature );
      var gre = thisModel.renormalizedColorIntensity( thisModel.greWavelength, temperature );
      var blu = thisModel.renormalizedColorIntensity( thisModel.bluWavelength, temperature );
      var renTemp = thisModel.renormalizedTemperature( temperature );
      var alpha = Util.linear( 0, 1, 0, 0.1, renTemp ); // renormalizedtemperature -> transparency
      return new Color( red, gre, blu, alpha ); //a string
    } );

    this.addDerivedProperty( 'glowingStarHaloRadius', ['temperature'], function( temperature ) {
      var renTemp = thisModel.renormalizedTemperature( temperature );
      var radius = Util.linear( 0, 1, thisModel.radiusGlowingStarHaloMinimum, thisModel.radiusGlowingStarHaloMaximum, renTemp ); // temperature -> radius
      return radius;
    } );

    this.addDerivedProperty( 'glowingStarHaloColorTransparency', ['temperature'], function( temperature ) {
      var renTemp = thisModel.renormalizedTemperature( temperature );
      var alpha = Util.linear( 0, 1, 0, 0.1, renTemp ); // temperature -> transparency
      return alpha;
    } );

  }

  return inherit( PropertySet, BlackbodySpectrumModel, {

    intensityRadiation: function( lambda, temperature ) {
      var intensityRadiation;
      var prefactor;
      var exponentialTerm;
      if ( lambda === 0 ) {
        intensityRadiation = 0;
      }
      else {
        prefactor = (this.firstRadiationConstant / Math.pow( lambda, 5 ));
        exponentialTerm = 1 / (Math.exp( this.secondRadiationConstant / (lambda * temperature) ) - 1);
        intensityRadiation = prefactor * exponentialTerm;
      }
      return intensityRadiation;
    },

    renormalizedTemperature: function( temperature ) {
      /*
       the function below seems very hacky but it was found in MD flash implementation.
       This renormalized temperature is above 0 but it can exceed one.
       i dont know why you would want to raise it to a power of 0.7
       */
      var renTemp = Math.pow( Math.max( temperature - this.temperatureMinimum, 0 ) / (this.temperatureMaximum - this.temperatureMinimum), this.powerLaw );
      return renTemp; //
    },

    // @private
    renormalizedColorIntensity: function( wavelength, temperature ) {
      var red = this.intensityRadiation( this.redWavelength, temperature ); // intensity as a function of wavelength in nm
      var gre = this.intensityRadiation( this.greWavelength, temperature );
      var blu = this.intensityRadiation( this.bluWavelength, temperature );
      var largestColorIntensity = Math.max( red, gre, blu );
      var colorIntensity = this.intensityRadiation( wavelength, temperature );
      var boundedRenormalizedTemp = Math.min( this.renormalizedTemperature( temperature ), 1 );
      return Math.floor( 255 * boundedRenormalizedTemp * colorIntensity / largestColorIntensity );
    },

    coordinatesY: function( temperature ) {
      for ( var i = 0; i < this.numberPoints; i++ ) {
        var lambda = i * this.lambdaMax / this.numberPoints;
        this.intensityArray[i] = this.intensityRadiation( lambda, temperature );
      }
      return this.intensityArray;
    },
    // @public
    getRedColor: function() {
      return this.redColor;
    },
    // @public
    getBluColor: function() {
      return this.bluColor;
    },
    // @public
    getGreColor: function() {
      return this.greColor;
    },
    // @public
    getGlowingStarHaloRadius: function() {
      return this.glowingStarHaloRadius;
    },
    // @public
    getGlowingStarHaloColor: function() {
      return this.glowingStarHaloColor;
    },
    // @public
    reset: function() {
      this.rulerPositionProperty.reset();
      this.isRulerVisibleProperty.reset();
      this.temperatureProperty.reset();
      this.horizontalZoomProperty.reset();
      this.verticalZoomProperty.reset();
    }
  } );
} );