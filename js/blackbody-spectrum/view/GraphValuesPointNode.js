// Copyright 2014-2018, University of Colorado Boulder

/**
 * The class that handles showing a draggable point that follows a body and shows its values
 *
 * @author Saurabh Totey
 */
define( function( require ) {
  'use strict';

  // modules
  var blackbodySpectrum = require('BLACKBODY_SPECTRUM/blackbodySpectrum');
  var inherit = require( 'PHET_CORE/inherit' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Util = require( 'DOT/Util' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ScientificNotationNode = require( 'SCENERY_PHET/ScientificNotationNode' );

  // strings
  var spectralRadianceLabelPatternString = require( 'string!BLACKBODY_SPECTRUM/spectralRadianceLabelPattern' );

  /**
   * Constructs the GraphValuesPointNode given the body to follow and the axes that will handle coordinate conversions
   * @param {BlackbodyBodyModel} body
   * @param {ZoomableAxesView} axes
   * @param {Object} options
   * @constructor
   */
  function GraphValuesPointNode( body, axes, options ) {
    var self = this;

    Node.call( this );

    options = _.extend( {
      circleOptions: {
        radius: 5,
        fill: 'green',
        cursor: 'pointer'
      },
      dashedLineOptions: {
        stroke: 'yellow',
        lineDash: [ 4, 4 ]
      },
      valueTextOptions: {
        fill: 'green',
        font: new PhetFont( 16 )
      },
      labelOffset: 5
    }, options );

    // @private
    this.body = body;
    this.axes = axes;
    this.draggableCircle = new Circle( options.circleOptions );
    this.dashedLinesPath = new Path( null, options.dashedLineOptions );
    this.wavelengthValueText = new Text( '', options.valueTextOptions );
    this.spectralRadianceValueText = new RichText( '', options.valueTextOptions );

    // @public {Property.<number>}
    this.wavelengthProperty = new NumberProperty( this.body.peakWavelength );

    // Links the wavelength property to update this node whenever changed
    this.wavelengthProperty.link( function( wavelength ) {
      self.update();
    } );

    // Links a change in the body's temperature to always set the wavelength to the peak wavelength
    this.body.temperatureProperty.link( function( temperature ) {
      self.wavelengthProperty.value = self.body.peakWavelength;
    } );

    // Sets up the drag handler for the draggable circle
    var mouseStartX;
    var circleStartX;
    this.draggableCircle.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        mouseStartX = event.pointer.point.x;
        circleStartX = self.draggableCircle.centerX;
      },
      drag: function( event ) {
        var horizontalChange = event.pointer.point.x - mouseStartX;
        self.wavelengthProperty.value = self.axes.viewXToWavelength( circleStartX + horizontalChange );
        self.update();
      },
      allowTouchSnag: true
    } ) );

    // Adds children in rendering order
    this.addChild( this.dashedLinesPath );
    this.addChild( this.draggableCircle );
    this.addChild( this.wavelengthValueText );
    this.addChild( this.spectralRadianceValueText );

    // Positions the value labels
    this.wavelengthValueText.top = options.labelOffset;
    this.spectralRadianceValueText.right = options.labelOffset;
  }

  blackbodySpectrum.register( 'GraphValuesPointNode', GraphValuesPointNode );

  return inherit( Node, GraphValuesPointNode, {

    /**
     * Puts this node back at the peak of the graph
     */
    reset: function() {
      this.wavelengthProperty.value = this.body.peakWavelength;
    },

    /**
     * Updates the location of the circle and the dashed lines of this graphValuesPointNode
     * @public
     */
    update: function() {
      // Makes sure that the wavelength property is within bounds
      this.wavelengthProperty.value = Util.clamp( this.wavelengthProperty.value, 0, this.axes.viewXToWavelength( this.axes.horizontalAxisLength ) );
      var spectralRadianceOfPoint = this.body.getIntensityRadiation( this.wavelengthProperty.value );

      // Updates location of draggable circle in view
      this.draggableCircle.centerX = this.axes.wavelengthToViewX( this.wavelengthProperty.value );
      this.draggableCircle.centerY = this.axes.spectralRadianceToViewY( spectralRadianceOfPoint );

      // Updates value labels' text TODO: at 0 wavelength, spectral radiance shows as 0.00 X 10<sup>1</sup>
      this.wavelengthValueText.text = Util.toFixed( this.wavelengthProperty.value, 0 ) + "nm";
      var notationObject = ScientificNotationNode.toScientificNotation( spectralRadianceOfPoint, {
        mantissaDecimalPlaces: 2
      } );
      var formattedSpectralRadianceString = notationObject.mantissa;
      if ( notationObject.exponent !== '0' ) {
        formattedSpectralRadianceString += ' X 10<sup>' + notationObject.exponent + '</sup>';
      }
      this.spectralRadianceValueText.text = StringUtils.fillIn( spectralRadianceLabelPatternString, {
        spectralRadiance: formattedSpectralRadianceString
      } );

      // Updates value labels' positioning
      this.wavelengthValueText.centerX = this.draggableCircle.centerX;
      this.spectralRadianceValueText.centerY = this.draggableCircle.centerY;

      // Updates dashed lines to follow draggable circle
      this.dashedLinesPath.shape = new Shape()
        .moveTo( this.draggableCircle.centerX, 0 )
        .lineTo( this.draggableCircle.centerX, this.draggableCircle.centerY )
        .lineTo( 0, this.draggableCircle.centerY );
    }

  } );

} );