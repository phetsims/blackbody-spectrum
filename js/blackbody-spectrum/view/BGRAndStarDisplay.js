// Copyright 2019-2022, University of Colorado Boulder

/**
 * Node that displays red, blue, and green color representations of the current blackbody temperature, as well as a star
 * whose color represents the color of a star at the current blackbody temperature
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * This file was created with content from BlackbodySpectrumScreenView during the phet-io instrumentation process. See
 * git history in BlackbodySpectrumScreenView for the original authors.
 */

import merge from '../../../../phet-core/js/merge.js';
import StarShape from '../../../../scenery-phet/js/StarShape.js';
import { Circle, Node, Path, Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BlackbodyConstants from '../../BlackbodyConstants.js';
import blackbodySpectrum from '../../blackbodySpectrum.js';
import BlackbodySpectrumStrings from '../../BlackbodySpectrumStrings.js';
import BlackbodyColors from './BlackbodyColors.js';

const bString = BlackbodySpectrumStrings.b;
const gString = BlackbodySpectrumStrings.g;
const rString = BlackbodySpectrumStrings.r;

// constants
const CIRCLE_LABEL_COLOR = BlackbodyColors.titlesTextProperty;
const CIRCLE_RADIUS = 15;
const STAR_INNER_RADIUS = 20;
const STAR_OUTER_RADIUS = 35;
const STAR_NUMBER_POINTS = 9;
const STAR_SPACING = 50;

class BGRAndStarDisplay extends Node {

  /**
   * @param {BlackbodyBodyModel} mainBody
   * @param {Object} [options]
   */
  constructor( mainBody, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    super( options );

    // the indicators that show how much red, blue, and green the current temperature would emit
    const circleBlue = new Circle( CIRCLE_RADIUS );
    const circleGreen = new Circle( CIRCLE_RADIUS );
    const circleRed = new Circle( CIRCLE_RADIUS );

    const circleLabelOptions = {
      font: BlackbodyConstants.LABEL_FONT, fill: CIRCLE_LABEL_COLOR, maxWidth: 36
    };
    const circleBlueLabel = new Text( bString, circleLabelOptions );
    const circleGreenLabel = new Text( gString, circleLabelOptions );
    const circleRedLabel = new Text( rString, circleLabelOptions );

    const glowingStarHalo = new Circle( 10 );
    const starPath = new Path(
      new StarShape( {
        outerRadius: STAR_OUTER_RADIUS,
        innerRadius: STAR_INNER_RADIUS,
        numberStarPoints: STAR_NUMBER_POINTS
      } ), {
        lineWidth: 1.5,
        lineJoin: 'round',
        stroke: BlackbodyColors.starStrokeProperty
      }
    );

    circleBlue.centerY = STAR_SPACING;
    circleGreen.centerX = circleBlue.centerX + STAR_SPACING;
    circleGreen.centerY = circleBlue.centerY;
    circleRed.centerX = circleGreen.centerX + STAR_SPACING;
    circleRed.centerY = circleBlue.centerY;
    circleBlueLabel.centerX = circleBlue.centerX;
    circleBlueLabel.centerY = circleBlue.top + STAR_SPACING;
    circleGreenLabel.centerX = circleGreen.centerX;
    circleGreenLabel.centerY = circleBlueLabel.centerY;
    circleRedLabel.centerX = circleRed.centerX;
    circleRedLabel.centerY = circleBlueLabel.centerY;
    starPath.left = circleRed.right + STAR_SPACING;
    starPath.centerY = circleBlue.centerY;
    glowingStarHalo.centerX = starPath.centerX;
    glowingStarHalo.centerY = starPath.centerY;

    this.addChild( starPath );
    this.addChild( glowingStarHalo );
    this.addChild( circleBlue );
    this.addChild( circleGreen );
    this.addChild( circleRed );
    this.addChild( circleBlueLabel );
    this.addChild( circleGreenLabel );
    this.addChild( circleRedLabel );

    // link the current temperature to the RGB and star indicators
    mainBody.temperatureProperty.link( temperature => {
      circleBlue.fill = mainBody.blueColor;
      circleGreen.fill = mainBody.greenColor;
      circleRed.fill = mainBody.redColor;
      glowingStarHalo.fill = mainBody.glowingStarHaloColor;
      glowingStarHalo.radius = mainBody.glowingStarHaloRadius;
      starPath.fill = mainBody.starColor;
    } );
  }
}

blackbodySpectrum.register( 'BGRAndStarDisplay', BGRAndStarDisplay );
export default BGRAndStarDisplay;