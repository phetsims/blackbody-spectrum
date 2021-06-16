[object Promise]

/**
 * An object that contains the colors used for various major components of the Blackbody simulation.  This
 * is used to support different color schemes, such as a default that looks good on a laptop or tablet, and a
 * "projector mode" that looks good when projected on a large screen.
 *
 * @author Arnab Purkayastha
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import ColorProfile from '../../../../scenery-phet/js/ColorProfile.js';
import Color from '../../../../scenery/js/util/Color.js';
import blackbodySpectrum from '../../blackbodySpectrum.js';

const blackbodyColorProfile = new ColorProfile( [ 'default', 'projector' ], {
  background: {
    default: 'black',
    projector: 'white'
  },
  panelStroke: {
    default: 'white',
    projector: 'black'
  },
  panelText: {
    default: 'white',
    projector: 'black'
  },
  graphAxesStroke: {
    default: 'white',
    projector: 'black'
  },
  graphValuesDashedLine: {
    default: 'yellow',
    projector: 'deeppink'
  },
  graphValuesLabels: {
    default: 'yellow',
    projector: 'deeppink'
  },
  graphValuesPoint: {
    default: 'white',
    projector: 'black'
  },
  titlesText: {
    default: 'white',
    projector: 'black'
  },
  thermometerTubeStroke: {
    default: 'white',
    projector: 'black'
  },
  thermometerTrack: {
    default: 'black',
    projector: 'white'
  },
  temperatureText: {
    default: Color.YELLOW,
    projector: Color.BLUE
  },
  triangleStroke: {
    default: 'white',
    projector: 'black'
  },
  starStroke: {
    default: 'rgba( 0, 0, 0, 0 )',
    projector: 'black'
  }
} );

blackbodySpectrum.register( 'blackbodyColorProfile', blackbodyColorProfile );
export default blackbodyColorProfile;