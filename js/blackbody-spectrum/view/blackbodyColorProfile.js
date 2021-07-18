// Copyright 2018-2021, University of Colorado Boulder

/**
 * An object that contains the colors used for various major components of the Blackbody simulation.  This
 * is used to support different color schemes, such as a default that looks good on a laptop or tablet, and a
 * "projector mode" that looks good when projected on a large screen.
 *
 * @author Arnab Purkayastha
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Color from '../../../../scenery/js/util/Color.js';
import ColorProfileProperty from '../../../../scenery/js/util/ColorProfileProperty.js';
import blackbodySpectrum from '../../blackbodySpectrum.js';

class BlackbodyColorProfile {

  constructor() {

    // @public {ColorProfileProperty}
    this.backgroundProperty = new ColorProfileProperty( 'background', {
      default: 'black',
      projector: 'white'
    } );
    this.panelStrokeProperty = new ColorProfileProperty( 'panelStroke', {
      default: 'white',
      projector: 'black'
    } );
    this.panelTextProperty = new ColorProfileProperty( 'panelText', {
      default: 'white',
      projector: 'black'
    } );
    this.graphAxesStrokeProperty = new ColorProfileProperty( 'graphAxesStroke', {
      default: 'white',
      projector: 'black'
    } );
    this.graphValuesDashedLineProperty = new ColorProfileProperty( 'graphValuesDashedLine', {
      default: 'yellow',
      projector: 'deeppink'
    } );
    this.graphValuesLabelsProperty = new ColorProfileProperty( 'graphValuesLabels', {
      default: 'yellow',
      projector: 'deeppink'
    } );
    this.graphValuesPointProperty = new ColorProfileProperty( 'graphValuesPoint', {
      default: 'white',
      projector: 'black'
    } );
    this.titlesTextProperty = new ColorProfileProperty( 'titlesText', {
      default: 'white',
      projector: 'black'
    } );
    this.thermometerTubeStrokeProperty = new ColorProfileProperty( 'thermometerTubeStroke', {
      default: 'white',
      projector: 'black'
    } );
    this.thermometerTrackProperty = new ColorProfileProperty( 'thermometerTrack', {
      default: 'black',
      projector: 'white'
    } );
    this.temperatureTextProperty = new ColorProfileProperty( 'temperatureText', {
      default: Color.YELLOW,
      projector: Color.BLUE
    } );
    this.triangleStrokeProperty = new ColorProfileProperty( 'triangleStroke', {
      default: 'white',
      projector: 'black'
    } );
    this.starStrokeProperty = new ColorProfileProperty( 'starStroke', {
      default: 'rgba( 0, 0, 0, 0 )',
      projector: 'black'
    } );
  }
}

const blackbodyColorProfile = new BlackbodyColorProfile();

blackbodySpectrum.register( 'blackbodyColorProfile', blackbodyColorProfile );
export default blackbodyColorProfile;