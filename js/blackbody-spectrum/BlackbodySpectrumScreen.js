// Copyright 2014-2018, University of Colorado Boulder

/**
 * The 'Blackbody Spectrum' screen, which shows everything in that screen.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var BlackbodySpectrumModel = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/model/BlackbodySpectrumModel' );
  var BlackbodySpectrumScreenView = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackbodySpectrumScreenView' );
  var BlackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackbodyColorProfile' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  /**
   * @constructor
   */
  function BlackbodySpectrumScreen() {
    Screen.call( this,
      function() {
        return new BlackbodySpectrumModel();
      },
      function( model ) {
        return new BlackbodySpectrumScreenView( model );
      },
      { backgroundColorProperty: BlackbodyColorProfile.backgroundProperty }
    );
  }
  blackbodySpectrum.register( 'BlackbodySpectrumScreen', BlackbodySpectrumScreen );

  return inherit( Screen, BlackbodySpectrumScreen );
} );