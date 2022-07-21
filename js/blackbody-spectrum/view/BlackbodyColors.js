// Copyright 2018-2022, University of Colorado Boulder

/**
 * An object that contains the colors used for various major components of the Blackbody simulation.  This
 * is used to support different color schemes, such as a default that looks good on a laptop or tablet, and a
 * "projector mode" that looks good when projected on a large screen.
 *
 * @author Arnab Purkayastha
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import { Color, ProfileColorProperty } from '../../../../scenery/js/imports.js';
import blackbodySpectrum from '../../blackbodySpectrum.js';

const BlackbodyColors = {

  // @public {ProfileColorProperty}
  backgroundProperty: new ProfileColorProperty( blackbodySpectrum, 'background', {
    default: 'black',
    projector: 'white'
  } ),
  panelStrokeProperty: new ProfileColorProperty( blackbodySpectrum, 'panelStroke', {
    default: 'white',
    projector: 'black'
  } ),
  panelTextProperty: new ProfileColorProperty( blackbodySpectrum, 'panelText', {
    default: 'white',
    projector: 'black'
  } ),
  graphAxesStrokeProperty: new ProfileColorProperty( blackbodySpectrum, 'graphAxesStroke', {
    default: 'white',
    projector: 'black'
  } ),
  graphValuesDashedLineProperty: new ProfileColorProperty( blackbodySpectrum, 'graphValuesDashedLine', {
    default: 'yellow',
    projector: 'deeppink'
  } ),
  graphValuesLabelsProperty: new ProfileColorProperty( blackbodySpectrum, 'graphValuesLabels', {
    default: 'yellow',
    projector: 'deeppink'
  } ),
  graphValuesPointProperty: new ProfileColorProperty( blackbodySpectrum, 'graphValuesPoint', {
    default: 'white',
    projector: 'black'
  } ),
  titlesTextProperty: new ProfileColorProperty( blackbodySpectrum, 'titlesText', {
    default: 'white',
    projector: 'black'
  } ),
  thermometerTubeStrokeProperty: new ProfileColorProperty( blackbodySpectrum, 'thermometerTubeStroke', {
    default: 'white',
    projector: 'black'
  } ),
  thermometerTrackProperty: new ProfileColorProperty( blackbodySpectrum, 'thermometerTrack', {
    default: 'black',
    projector: 'white'
  } ),
  temperatureTextProperty: new ProfileColorProperty( blackbodySpectrum, 'temperatureText', {
    default: Color.YELLOW,
    projector: Color.BLUE
  } ),
  triangleStrokeProperty: new ProfileColorProperty( blackbodySpectrum, 'triangleStroke', {
    default: 'white',
    projector: 'black'
  } ),
  starStrokeProperty: new ProfileColorProperty( blackbodySpectrum, 'starStroke', {
    default: 'rgba( 0, 0, 0, 0 )',
    projector: 'black'
  } )
};

blackbodySpectrum.register( 'BlackbodyColors', BlackbodyColors );
export default BlackbodyColors;