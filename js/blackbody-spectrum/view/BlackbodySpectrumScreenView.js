//  Copyright 2002-2014, University of Colorado Boulder

/**
 * View for the 'BlackbodySpectrum' screen.
 *
 * @author Martin Veillette (Berea College)
 */
define(function (require) {
    'use strict';

    // modules
    var Bounds2 = require('DOT/Bounds2');
    var CheckBox = require('SUN/CheckBox');
    var Circle = require('SCENERY/nodes/Circle');
    var Dimension2 = require('DOT/Dimension2');
    var GraphDrawingNode = require('BLACKBODY_SPECTRUM/blackbody-spectrum/view/GraphDrawingNode');
    var inherit = require('PHET_CORE/inherit');
    var ModelViewTransform = require('PHETCOMMON/view/ModelViewTransform2');
    var MovableLabRuler = require('BLACKBODY_SPECTRUM/blackbody-spectrum/view/MovableLabRuler');
    var PhetFont = require('SCENERY_PHET/PhetFont');
    var Property = require('AXON/Property');
    var Range = require('DOT/Range');
    var RectangularPushButton = require('SUN/buttons/RectangularPushButton');
    var ResetAllButton = require('SCENERY_PHET/buttons/ResetAllButton');
    var ScreenView = require('JOIST/ScreenView');
    var Shape = require('KITE/Shape');
    var StarPath = require('BLACKBODY_SPECTRUM/blackbody-spectrum/view/StarPath');
    var Text = require('SCENERY/nodes/Text');
    var ThermometerNode = require('BLACKBODY_SPECTRUM/blackbody-spectrum/view/ThermometerNode');
    var Vector2 = require('DOT/Vector2');
    var VerticalSlider = require('BLACKBODY_SPECTRUM/blackbody-spectrum/view/VerticalSlider');


    // Resources

    // strings

    var tempInKString = require('string!BLACKBODY_SPECTRUM/tempInK');
    var showRulerString = require('string!BLACKBODY_SPECTRUM/showRuler');
    var bString = require('string!BLACKBODY_SPECTRUM/b');
    var gString = require('string!BLACKBODY_SPECTRUM/g');
    var rString = require('string!BLACKBODY_SPECTRUM/r');
    var saveString = require('string!BLACKBODY_SPECTRUM/save');
    var clearString = require('string!BLACKBODY_SPECTRUM/clear');
    var unitsString = require('string!BLACKBODY_SPECTRUM/units.cm');

    // constants

    var CIRCLE_LABEL_COLOR = "#00EBEB";
    var SAVE_BUTTON_COLOR = 'yellow';
    var CLEAR_BUTTON_COLOR = 'red';
    var BUTTON_FONT = new PhetFont(15);
    var CIRCLE_RADIUS = 15;
    var LABEL_FONT = new PhetFont(22);

    /**
     * Constructor for the BlackbodySpectrumView
     * @param {BlackbodySpectrumModel} model - main model for the simulation
     * @constructor
     */
    function BlackbodySpectrumView(model) {

        var thisView = this;

        ScreenView.call(thisView, {renderer: 'svg', layoutBounds: new Bounds2(0, 0, 1100, 700)});

        var modelViewTransform = new ModelViewTransform.createRectangleInvertedYMapping(model.bounds, this.layoutBounds);

        var thermometerNode = new ThermometerNode(model.temperatureProperty, {
            minTemperature: 0,
            maxTemperature: 6000,
            bulbDiameter: 50,
            tubeWidth: 30,
            tubeHeight: 400,
            lineWidth: 4,
            outlineStroke: 'white',
            tickSpacing: 15
        });


        // temperature slider
        var minTemperatureSlider = 0; //in kelvin
        var maxTemperatureSlider = 9000;
        var simpleRange = new Range(minTemperatureSlider, maxTemperatureSlider, model.temperature); //  kelvin
        var temperatureSlider = new VerticalSlider(
            tempInKString,
            new Dimension2(5, 200),
            model.temperatureProperty,
            simpleRange,
            0);


        //
        var circleBlu = new Circle(CIRCLE_RADIUS);
        var circleGre = new Circle(CIRCLE_RADIUS);
        var circleRed = new Circle(CIRCLE_RADIUS);
        var circleBluLabel = new Text(bString, {font: LABEL_FONT, fill: CIRCLE_LABEL_COLOR});
        var circleGreLabel = new Text(gString, {font: LABEL_FONT, fill: CIRCLE_LABEL_COLOR});
        var circleRedLabel = new Text(rString, {font: LABEL_FONT, fill: CIRCLE_LABEL_COLOR});
        var glowingStarHalo = new Circle(10);
        var starPath = new StarPath();


        model.temperatureProperty.link(function (temperature) {
            circleBlu.fill = model.getBluColor(temperature);
            circleGre.fill = model.getGreColor(temperature);
            circleRed.fill = model.getRedColor(temperature);
            glowingStarHalo.fill = model.getGlowingStarHaloColor(temperature);
            glowingStarHalo.radius = model.getGlowingStarHaloRadius(temperature);
            starPath.fill = model.getStarColor(temperature);
            starPath.stroke = model.getStarColor(temperature);
        });

        var isRulerVisibleProperty = new Property(false);
        // Show Ruler check box
        var showRulerCheckBox = CheckBox.createTextCheckBox(showRulerString, {
            font: LABEL_FONT,
            fill: 'white'
        }, isRulerVisibleProperty);
        showRulerCheckBox.touchArea = Shape.rectangle(showRulerCheckBox.left, showRulerCheckBox.top - 15, showRulerCheckBox.width, showRulerCheckBox.height + 30);

        var movableLabRuler = new MovableLabRuler(
            new Property(new Vector2(120, 310)),
            isRulerVisibleProperty,
            {
                rulerLength: 0.25, // in model coordinates, i.e. 0.25 meters
                multiplier: 100, // multiplier of base units
                units: unitsString,  //
                unitsFont: new PhetFont(16),
                rulerHeightInModel: 0.05, // in model coordinates
                majorTickSeparation: 0.05, // in model coordinates
                angle: Math.PI / 2,
                modelViewTransform: modelViewTransform,
                dragBounds: this.layoutBounds,
                minorTicksPerMajorTick: 4
            }
        );

        // Create and add the Reset All Button in the bottom right
        var resetAllButton = new ResetAllButton({
            listener: function () {
                model.reset();
                graphNode.clear();
            },
            right: this.layoutBounds.maxX - 10,
            bottom: this.layoutBounds.maxY - 10
        });


        // create graph with zoom buttons
        var graphNode = new GraphDrawingNode(model, modelViewTransform);


        // create the save and clear buttons
        var saveButton = new RectangularPushButton({
            content: new Text(saveString, {font: BUTTON_FONT}),
            baseColor: SAVE_BUTTON_COLOR,
            listener: function () {
                graphNode.save(model.temperature);
            }
        });

        var clearButton = new RectangularPushButton({
            content: new Text(clearString, {font: BUTTON_FONT}),
            baseColor: CLEAR_BUTTON_COLOR,
            listener: function () {
                graphNode.clear();
            }
        });


        this.addChild(graphNode);
        this.addChild(clearButton);
        this.addChild(saveButton);
        this.addChild(showRulerCheckBox);
        this.addChild(temperatureSlider);
        this.addChild(thermometerNode);
        this.addChild(starPath);
        this.addChild(glowingStarHalo);
        this.addChild(circleBlu);
        this.addChild(circleGre);
        this.addChild(circleRed);
        this.addChild(circleBluLabel);
        this.addChild(circleGreLabel);
        this.addChild(circleRedLabel);
        this.addChild(resetAllButton);
        this.addChild(movableLabRuler);

        // layout for things that don't have a location in the model
        {

            graphNode.left = 20;
            graphNode.bottom = this.layoutBounds.maxY - 10;
            showRulerCheckBox.right = 1000;
            showRulerCheckBox.centerY = 650;
            thermometerNode.right = this.layoutBounds.maxX - 10;
            thermometerNode.top = 100;

            saveButton.right = this.layoutBounds.maxX - 10;
            saveButton.top = 10;
            clearButton.right = saveButton.right;
            clearButton.top = saveButton.bottom + 10;

            temperatureSlider.right = thermometerNode.left - 20;
            temperatureSlider.centerY = thermometerNode.centerY;

            circleBlu.centerX = 500;
            circleBlu.centerY = 100;
            circleGre.centerX = circleBlu.centerX + 50;
            circleGre.centerY = circleBlu.centerY;
            circleRed.centerX = circleGre.centerX + 50;
            circleRed.centerY = circleBlu.centerY;
            circleBluLabel.centerX = circleBlu.centerX;
            circleBluLabel.centerY = circleBlu.centerY + 35;
            circleGreLabel.centerX = circleGre.centerX;
            circleGreLabel.centerY = circleBluLabel.centerY;
            circleRedLabel.centerX = circleRed.centerX;
            circleRedLabel.centerY = circleBluLabel.centerY;
            starPath.left = circleRed.right + 60;
            starPath.centerY = circleBlu.centerY;
            glowingStarHalo.centerX = starPath.centerX;
            glowingStarHalo.centerY = starPath.centerY;

        }
    }

    return inherit(ScreenView, BlackbodySpectrumView);
});