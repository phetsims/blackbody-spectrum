// Copyright 2014-2015, University of Colorado Boulder

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
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var blackbodySpectrumTitleString = require( 'string!BLACKBODY_SPECTRUM/blackbody-spectrum.title' );

  /**
   * Creates the model and view for the BlackbodySpectrumScreen
   * @constructor
   */
  function BlackbodySpectrumScreen() {
    Screen.call( this, blackbodySpectrumTitleString, null /* no icon, single-screen sim */,
      function() {
        return new BlackbodySpectrumModel();
      },
      function( model ) {
        return new BlackbodySpectrumScreenView( model );
      },
      { backgroundColor: 'black' }
    );
  }
  blackbodySpectrum.register( 'BlackbodySpectrumScreen', BlackbodySpectrumScreen );
  
  return inherit( Screen, BlackbodySpectrumScreen );
} );