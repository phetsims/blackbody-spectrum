// Copyright 2018-2026, University of Colorado Boulder

/**
 * A shape that appears similarly to a Blackbody Spectrum curve
 * Is supposed to be a generic Blackbody Spectrum curve
 *
 * @author Saurabh Totey
 */

import Shape from '../../../../kite/js/Shape.js';

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

export default GenericCurveShape;
