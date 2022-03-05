// Copyright 2018-2022, University of Colorado Boulder

/**
 * A shape that appears similarly to a Blackbody Spectrum curve
 * Is supposed to be a generic Blackbody Spectrum curve
 *
 * @author Saurabh Totey
 */

import { Shape } from '../../../../kite/js/imports.js';
import blackbodySpectrum from '../../blackbodySpectrum.js';

class GenericCurveShape extends Shape {

  /**
   * Makes this class inherit from shape and then sets the point of this shape to be like a Blackbody Spectrum
   */
  constructor() {
    super();

    this.moveTo( 0, 0 )
      .cubicCurveTo( 15, 0, 15, -25, 25, -25 )
      .cubicCurveTo( 35, -25, 45, 0, 80, 0 );
  }
}

blackbodySpectrum.register( 'GenericCurveShape', GenericCurveShape );
export default GenericCurveShape;