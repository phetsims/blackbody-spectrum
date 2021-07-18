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
import ProfileColorProperty from '../../../../scenery/js/util/ProfileColorProperty.js';
import blackbodySpectrum from '../../blackbodySpectrum.js';

class BlackbodyColorProfile {

  constructor() {

    // @public {ProfileColorProperty}
    this.backgroundProperty = new ProfileColorProperty( 'background', {
      default: 'black',
      projector: 'white'
    } );
    this.panelStrokeProperty = new ProfileColorProperty( 'panelStroke', {
      default: 'white',
      projector: 'black'
    } );
    this.panelTextProperty = new ProfileColorProperty( 'panelText', {
      default: 'white',
      projector: 'black'
    } );
    this.graphAxesStrokeProperty = new ProfileColorProperty( 'graphAxesStroke', {
      default: 'white',
      projector: 'black'
    } );
    this.graphValuesDashedLineProperty = new ProfileColorProperty( 'graphValuesDashedLine', {
      default: 'yellow',
      projector: 'deeppink'
    } );
    this.graphValuesLabelsProperty = new ProfileColorProperty( 'graphValuesLabels', {
      default: 'yellow',
      projector: 'deeppink'
    } );
    this.graphValuesPointProperty = new ProfileColorProperty( 'graphValuesPoint', {
      default: 'white',
      projector: 'black'
    } );
    this.titlesTextProperty = new ProfileColorProperty( 'titlesText', {
      default: 'white',
      projector: 'black'
    } );
    this.thermometerTubeStrokeProperty = new ProfileColorProperty( 'thermometerTubeStroke', {
      default: 'white',
      projector: 'black'
    } );
    this.thermometerTrackProperty = new ProfileColorProperty( 'thermometerTrack', {
      default: 'black',
      projector: 'white'
    } );
    this.temperatureTextProperty = new ProfileColorProperty( 'temperatureText', {
      default: Color.YELLOW,
      projector: Color.BLUE
    } );
    this.triangleStrokeProperty = new ProfileColorProperty( 'triangleStroke', {
      default: 'white',
      projector: 'black'
    } );
    this.starStrokeProperty = new ProfileColorProperty( 'starStroke', {
      default: 'rgba( 0, 0, 0, 0 )',
      projector: 'black'
    } );
  }
}

const blackbodyColorProfile = new BlackbodyColorProfile();

blackbodySpectrum.register( 'blackbodyColorProfile', blackbodyColorProfile );
export default blackbodyColorProfile;