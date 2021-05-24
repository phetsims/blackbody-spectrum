// Copyright 2019, University of Colorado Boulder

/**
 * Node that displays red, blue, and green color representations of the current blackbody temperature, as well as a star
 * whose color represents the color of a star at the current blackbody temperature
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * This file was created with content from BlackbodySpectrumScreenView during the phet-io instrumentation process. See
 * git history in BlackbodySpectrumScreenView for the original authors.
 */
define( require => {
  'use strict';

  // modules
  const Circle = require( 'SCENERY/nodes/Circle' );
  const blackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/blackbodyColorProfile' );
  const BlackbodyConstants = require( 'BLACKBODY_SPECTRUM/BlackbodyConstants' );
  const blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const StarShape = require( 'SCENERY_PHET/StarShape' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Text = require( 'SCENERY/nodes/Text' );

  // strings
  const bString = require( 'string!BLACKBODY_SPECTRUM/b' );
  const gString = require( 'string!BLACKBODY_SPECTRUM/g' );
  const rString = require( 'string!BLACKBODY_SPECTRUM/r' );

  // constants
  const CIRCLE_LABEL_COLOR = blackbodyColorProfile.titlesTextProperty;
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

      options = _.extend( {
        tandem: Tandem.required
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
          stroke: blackbodyColorProfile.starStrokeProperty
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

  return blackbodySpectrum.register( 'BGRAndStarDisplay', BGRAndStarDisplay );
} );