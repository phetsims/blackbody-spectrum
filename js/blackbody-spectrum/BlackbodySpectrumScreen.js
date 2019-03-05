// Copyright 2014-2019, University of Colorado Boulder

/**
 * The 'Blackbody Spectrum' screen, which shows everything in that screen.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var BlackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackbodyColorProfile' );
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var BlackbodySpectrumModel = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/model/BlackbodySpectrumModel' );
  var BlackbodySpectrumScreenView = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackbodySpectrumScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function BlackbodySpectrumScreen( tandem ) {
    Screen.call( this,
      function() {
        return new BlackbodySpectrumModel( tandem.createTandem( 'model' ) );
      },
      function( model ) {
        return new BlackbodySpectrumScreenView( model, tandem.createTandem( 'view' ) );
      }, {
        backgroundColorProperty: BlackbodyColorProfile.backgroundProperty,
        tandem: tandem
      }
    );
  }

  blackbodySpectrum.register( 'BlackbodySpectrumScreen', BlackbodySpectrumScreen );

  return inherit( Screen, BlackbodySpectrumScreen );
} );