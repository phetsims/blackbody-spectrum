// Copyright 2019, University of Colorado Boulder

/**
 * An object that contains the colors used for various major components of the Blackbody simulation.  This
 * is used to support different color schemes, such as a default that looks good on a laptop or tablet, and a
 * "projector mode" that looks good when projected on a large screen.
 *
 * @author Arnab Purkayastha
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var Color = require( 'SCENERY/util/Color' );
  var ColorProfile = require( 'SCENERY_PHET/ColorProfile' );

  var blackbodyColorProfile = new ColorProfile( [ 'default', 'projector' ], {
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

  return blackbodySpectrum.register( 'blackbodyColorProfile', blackbodyColorProfile );
} );

