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

const BlackbodyColors = {

  // @public {ProfileColorProperty}
  backgroundProperty: new ProfileColorProperty( 'background', {
    default: 'black',
    projector: 'white'
  } ),
  panelStrokeProperty: new ProfileColorProperty( 'panelStroke', {
    default: 'white',
    projector: 'black'
  } ),
  panelTextProperty: new ProfileColorProperty( 'panelText', {
    default: 'white',
    projector: 'black'
  } ),
  graphAxesStrokeProperty: new ProfileColorProperty( 'graphAxesStroke', {
    default: 'white',
    projector: 'black'
  } ),
  graphValuesDashedLineProperty: new ProfileColorProperty( 'graphValuesDashedLine', {
    default: 'yellow',
    projector: 'deeppink'
  } ),
  graphValuesLabelsProperty: new ProfileColorProperty( 'graphValuesLabels', {
    default: 'yellow',
    projector: 'deeppink'
  } ),
  graphValuesPointProperty: new ProfileColorProperty( 'graphValuesPoint', {
    default: 'white',
    projector: 'black'
  } ),
  titlesTextProperty: new ProfileColorProperty( 'titlesText', {
    default: 'white',
    projector: 'black'
  } ),
  thermometerTubeStrokeProperty: new ProfileColorProperty( 'thermometerTubeStroke', {
    default: 'white',
    projector: 'black'
  } ),
  thermometerTrackProperty: new ProfileColorProperty( 'thermometerTrack', {
    default: 'black',
    projector: 'white'
  } ),
  temperatureTextProperty: new ProfileColorProperty( 'temperatureText', {
    default: Color.YELLOW,
    projector: Color.BLUE
  } ),
  triangleStrokeProperty: new ProfileColorProperty( 'triangleStroke', {
    default: 'white',
    projector: 'black'
  } ),
  starStrokeProperty: new ProfileColorProperty( 'starStroke', {
    default: 'rgba( 0, 0, 0, 0 )',
    projector: 'black'
  } )
};

blackbodySpectrum.register( 'BlackbodyColors', BlackbodyColors );
export default BlackbodyColors;