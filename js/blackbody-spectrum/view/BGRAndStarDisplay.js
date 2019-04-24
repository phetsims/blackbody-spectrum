// Copyright 2019, University of Colorado Boulder

/**
 * Node that displays red, blue, and green color representations of the current blackbody temperature, as well as a star
 * whose color represents the color of a star at the current blackbody temperature
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * This file was created with content from BlackbodySpectrumScreenView during the phet-io instrumentation process. See
 * git history in BlackbodySpectrumScreenView for the original authors.
 */
define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var blackbodyColorProfile = require( 'BLACKBODY_SPECTRUM/blackbody-spectrum/view/blackbodyColorProfile' );
  var BlackbodyConstants = require( 'BLACKBODY_SPECTRUM/BlackbodyConstants' );
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var StarShape = require( 'SCENERY_PHET/StarShape' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var bString = require( 'string!BLACKBODY_SPECTRUM/b' );
  var gString = require( 'string!BLACKBODY_SPECTRUM/g' );
  var rString = require( 'string!BLACKBODY_SPECTRUM/r' );

  // constants
  var CIRCLE_LABEL_COLOR = blackbodyColorProfile.titlesTextProperty;
  var CIRCLE_RADIUS = 15;
  var STAR_INNER_RADIUS = 20;
  var STAR_OUTER_RADIUS = 35;
  var STAR_NUMBER_POINTS = 9;
  var STAR_SPACING = 50;

  /**
   * @param {BlackbodyBodyModel} mainBody
   * @param {Object} [options]
   * @constructor
   */
  function BGRAndStarDisplay( mainBody, options ) {

    options = _.extend( {

      tandem: Tandem.required
    }, options );

    Node.call( this, options );

    // the indicators that show how much red, blue, and green the current temperature would emit
    var circleBlue = new Circle( CIRCLE_RADIUS );
    var circleGreen = new Circle( CIRCLE_RADIUS );
    var circleRed = new Circle( CIRCLE_RADIUS );

    var circleLabelOptions = {
      font: BlackbodyConstants.LABEL_FONT, fill: CIRCLE_LABEL_COLOR, maxWidth: 20
    };
    var circleBlueLabel = new Text( bString, circleLabelOptions );
    var circleGreenLabel = new Text( gString, circleLabelOptions );
    var circleRedLabel = new Text( rString, circleLabelOptions );

    var glowingStarHalo = new Circle( 10 );
    var starPath = new Path(
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

    circleBlue.centerX = 225;
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
    mainBody.temperatureProperty.link( function( temperature ) {
      circleBlue.fill = mainBody.blueColor;
      circleGreen.fill = mainBody.greenColor;
      circleRed.fill = mainBody.redColor;
      glowingStarHalo.fill = mainBody.glowingStarHaloColor;
      glowingStarHalo.radius = mainBody.glowingStarHaloRadius;
      starPath.fill = mainBody.starColor;
    } );
  }

  blackbodySpectrum.register( 'BGRAndStarDisplay', BGRAndStarDisplay );

  return inherit( Node, BGRAndStarDisplay );
} );