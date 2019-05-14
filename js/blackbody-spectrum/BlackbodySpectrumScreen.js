// Copyright 2014-2019, University of Colorado Boulder

/**
 * The 'Blackbody Spectrum' screen, which shows everything in that screen.
 *
 * @author Martin Veillette (Berea College)
 */
define( require => {
  'use strict';

  // modules
  const blackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/blackbodyColorProfile' );
  const blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  const BlackbodySpectrumModel = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/model/BlackbodySpectrumModel' );
  const BlackbodySpectrumScreenView = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/BlackbodySpectrumScreenView' );
  const Screen = require( 'JOIST/Screen' );

  class BlackbodySpectrumScreen extends Screen {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {
      super( () => new BlackbodySpectrumModel( tandem.createTandem( 'model' ) ),
        model => new BlackbodySpectrumScreenView( model, tandem.createTandem( 'view' ) ), {
          backgroundColorProperty: blackbodyColorProfile.backgroundProperty,
          tandem: tandem
        }
      );
    }
  }

  return blackbodySpectrum.register( 'BlackbodySpectrumScreen', BlackbodySpectrumScreen );
} );