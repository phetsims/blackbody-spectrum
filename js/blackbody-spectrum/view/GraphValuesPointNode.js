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
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );

  // strings
  var spectralRadianceLabelPatternString = require( 'string!BLACKBODY_SPECTRUM/spectralRadianceLabelPattern' );

  /**
   * Constructs the GraphValuesPointNode given the body to follow and the axes that will handle coordinate conversions
   * Alignment isn't handled in constructor, but is rather done in the update method due to the non-static nature of this view
   * @param {BlackbodyBodyModel} body
   * @param {ZoomableAxesView} axes
   * @param {Object} options
   * @constructor
   */
  function GraphValuesPointNode( body, axes, options ) {
    var self = this;

    Node.call( this, { cursor: 'pointer' } );

    options = _.extend( {
      circleOptions: {
        radius: 5,
        fill: 'green'
      },
      dashedLineOptions: {
        stroke: 'yellow',
        lineDash: [ 4, 4 ]
      },
      valueTextOptions: {
        fill: 'green',
        font: new PhetFont( 16 )
      },
      cueingArrowColor: '#64dc64',
      labelOffset: 5
    }, options );

    // @private
    this.body = body;
    this.axes = axes;
    this.draggableCircle = new Circle( options.circleOptions );
    this.dashedLinesPath = new Path( null, options.dashedLineOptions );
    this.wavelengthValueText = new Text( '', options.valueTextOptions );
    this.spectralRadianceValueText = new RichText( '', options.valueTextOptions );
    this.labelOffset = options.labelOffset;
    var arrowOptions = { fill: options.cueingArrowColor };
    this.cueingArrows = new Node( {
      children: [ new ArrowNode( 12, 0, 27, 0, arrowOptions ), new ArrowNode( -12, 0, -27, 0, arrowOptions ) ]
    } );

    // @public {Property.<number>}
    this.wavelengthProperty = new NumberProperty( this.body.peakWavelength );

    // Links the wavelength property to update this node whenever changed
    this.wavelengthProperty.link( function() {
      self.update();
    } );

    // Links a change in the body's temperature to always set the wavelength to the peak wavelength
    this.body.temperatureProperty.link( function() {
      self.wavelengthProperty.value = self.body.peakWavelength;
    } );

    // Sets up the drag handler for the draggable circle TODO: make draggable in y direction as well?
    var mouseStartX;
    var circleStartX;
    this.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        mouseStartX = event.pointer.point.x;
        circleStartX = self.draggableCircle.centerX;
      },
      drag: function( event ) {
        var horizontalChange = event.pointer.point.x - mouseStartX;
        self.wavelengthProperty.value = self.axes.viewXToWavelength( circleStartX + horizontalChange );
        self.update();
      },
      end: function() {
        self.cueingArrows.visible = false;
      },
      allowTouchSnag: true
    } ) );
    this.dashedLinesPath.touchArea = this.dashedLinesPath.localBounds.dilatedXY( 5, 5 );

    // Adds children in rendering order
    this.addChild( this.dashedLinesPath );
    this.addChild( this.draggableCircle );
    this.addChild( this.wavelengthValueText );
    this.addChild( this.spectralRadianceValueText );
    this.addChild( this.cueingArrows );
  }

  blackbodySpectrum.register( 'GraphValuesPointNode', GraphValuesPointNode );

  return inherit( Node, GraphValuesPointNode, {

    /**
     * Puts this node back at the peak of the graph
     */
    reset: function() {
      this.wavelengthProperty.value = this.body.peakWavelength;
      this.cueingArrows.visible = true;
    },

    /**
     * Updates the location of the circle and the dashed lines of this graphValuesPointNode
     * @public
     */
    update: function() {
      var self = this;

      // Makes sure that the wavelength property is within bounds
      this.wavelengthProperty.value = Util.clamp( this.wavelengthProperty.value, 0, this.axes.viewXToWavelength( this.axes.horizontalAxisLength ) );
      var spectralRadianceOfPoint = this.body.getSpectralRadianceAt( this.wavelengthProperty.value );

      // Updates location of draggable circle in view
      this.draggableCircle.centerX = this.axes.wavelengthToViewX( this.wavelengthProperty.value );
      this.draggableCircle.centerY = this.axes.spectralRadianceToViewY( spectralRadianceOfPoint );

      // Updates value labels' text
      this.wavelengthValueText.text = Util.toFixed( this.wavelengthProperty.value, 0 ) + ' nm';
      var notationObject = ScientificNotationNode.toScientificNotation( spectralRadianceOfPoint, {
        mantissaDecimalPlaces: 2
      } );
      var formattedSpectralRadianceString = notationObject.mantissa;
      if ( notationObject.exponent !== '0' && notationObject.mantissa !== '0.00' ) {
        formattedSpectralRadianceString += ' X 10<sup>' + notationObject.exponent + '</sup>';
      }
      if ( notationObject.exponent <= -100 ) { // Numbers this small are inconsistent and suffer from rounding issues
        formattedSpectralRadianceString = '0.00';
      }
      this.spectralRadianceValueText.text = StringUtils.fillIn( spectralRadianceLabelPatternString, {
        spectralRadiance: formattedSpectralRadianceString
      } );

      // Updates value labels' positioning
      this.wavelengthValueText.centerX = this.draggableCircle.centerX;
      this.spectralRadianceValueText.bottom = this.draggableCircle.centerY;
      this.wavelengthValueText.top = this.labelOffset;
      this.spectralRadianceValueText.centerX = this.draggableCircle.centerX;

      // Clamps the positions of the labels
      function clampLabelPosition( textLabel ) {
        if ( textLabel.left < self.labelOffset ) {
          textLabel.left = self.labelOffset;
        } else if ( textLabel.right > self.axes.horizontalAxisLength - self.labelOffset ) {
          textLabel.right = self.axes.horizontalAxisLength - self.labelOffset;
        }
      }
      clampLabelPosition( this.wavelengthValueText );
      clampLabelPosition( this.spectralRadianceValueText );

      // Moves the cueing arrows to surround the draggable circle
      this.cueingArrows.centerX = this.draggableCircle.centerX;
      this.cueingArrows.bottom = this.draggableCircle.top - 10;

      // Updates dashed lines to follow draggable circle
      this.dashedLinesPath.shape = new Shape()
        .moveTo( this.draggableCircle.centerX, 0 )
        .lineTo( this.draggableCircle.centerX, this.draggableCircle.centerY )
        .lineTo( 0, this.draggableCircle.centerY );
    }

  } );

} );