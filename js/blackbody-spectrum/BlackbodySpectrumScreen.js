[object Promise]

/**
 * The 'Blackbody Spectrum' screen, which shows everything in that screen.
 *
 * @author Martin Veillette (Berea College)
 */

import Screen from '../../../joist/js/Screen.js';
import blackbodySpectrum from '../blackbodySpectrum.js';
import BlackbodySpectrumModel from './model/BlackbodySpectrumModel.js';
import blackbodyColorProfile from './view/blackbodyColorProfile.js';
import BlackbodySpectrumScreenView from './view/BlackbodySpectrumScreenView.js';

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

blackbodySpectrum.register( 'BlackbodySpectrumScreen', BlackbodySpectrumScreen );
export default BlackbodySpectrumScreen;