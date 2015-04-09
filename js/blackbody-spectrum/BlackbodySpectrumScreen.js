// Copyright 2002-2014, University of Colorado Boulder

/**
 * The 'Blackbody Spectrum' screen, which shows everything in that screen.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var BlackbodySpectrumModel = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/model/BlackbodySpectrumModel' );
  var BlackbodySpectrumScreenView = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackbodySpectrumScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var blackbodySpectrumSimString = require( 'string!BLACKBODY_SPECTRUM/blackbody-spectrum.name' );

  /**
   * Creates the model and view for the BlackbodySpectrumScreen
   * @constructor
   */
  function BlackbodySpectrumScreen() {
    Screen.call( this, blackbodySpectrumSimString, null /* no icon, single-screen sim */,
      function() {
        return new BlackbodySpectrumModel();
      },
      function( model ) {
        return new BlackbodySpectrumScreenView( model );
      },
      { backgroundColor: 'black' }
    );
  }

  return inherit( Screen, BlackbodySpectrumScreen );
} );