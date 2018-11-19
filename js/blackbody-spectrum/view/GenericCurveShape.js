// Copyright 2018, University of Colorado Boulder

/**
 * A shape that appears similarly to a Blackbody Spectrum curve
 * Is supposed to be a generic Blackbody Spectrum curve
 *
 * @author Saurabh Totey
 */
define( function( require ) {
  'use strict';

  // modules
  var blackbodySpectrum = require( 'BLACKBODY_SPECTRUM/blackbodySpectrum' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );

  /**
   * Makes this class inherit from shape and then sets the point of this shape to be like a Blackbody Spectrum
   * @constructor
   */
  function GenericCurveShape() {
    Shape.call( this );
    this.moveTo( 0, 0 )
      .cubicCurveTo( 15, 0, 15, -25, 25, -25 )
      .cubicCurveTo( 35, -25, 45, 0, 80, 0 );
  }

  blackbodySpectrum.register( 'GenericCurveShape', GenericCurveShape );

  return inherit( Shape, GenericCurveShape );
} );