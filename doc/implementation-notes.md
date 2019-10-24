# Blackbody Spectrum - implementation notes

This document contains notes related to the implementation of Blackbody Spectrum. This is not an exhaustive description
of the implementation.  The intention is to provide a high-level overview, and to supplement the internal documentation
(source code comments) and external documentation (design document).

The audience for this document is software developers who are familiar with JavaScript and PhET simulation development,
as described in [PhET Development Overview](https://github.com/phetsims/phet-info/blob/master/doc/phet-development-overview.md).  The reader should also be
familiar with general design patterns used in PhET simulations.

Before reading this document, see [model.md](https://github.com/phetsims/blackbody-spectrum/tree/master/doc/model.md),
which provides a high-level description of the simulation model.

You may also wish to review the [Blackbody Spectrum design document](https://docs.google.com/document/d/12s243GhPT8Z17XoYPJmXVNNEWDIhRQkqhsAP8Oi7Twk/edit).

## Terminology

This section defines terminology that you'll see used throughout the internal and external documentation:

* intensity - the amount of light emitted in a projected area (for all wavelengths), measured in Watts per meter<sup>2</sup>
* Plank's law - see [model.md](https://github.com/phetsims/blackbody-spectrum/tree/master/doc/model.md)
* spectral power density - the amount of light emitted in a projected area for a given wavelength, measured in megaWatts per meter<sup>2</sup> per micrometer
* Stefan–Boltzmann law - see [model.md](https://github.com/phetsims/blackbody-spectrum/tree/master/doc/model.md)
* Wien's displacement Law - see [model.md](https://github.com/phetsims/blackbody-spectrum/tree/master/doc/model.md)

## Model

This section provides an overview of the most important model components.

[BlackbodyBodyModel](https://github.com/phetsims/blackbody-spectrum/blob/master/js/blackbody-spectrum/model/BlackbodyBodyModel.js) is the primary model component. It instantiates the main temperature property and provides all methods for retrieving power density, intensity, and peak wavelength.

## View

This section provides an overview of the most important view components.

[BlackbodySpectrumScreenView](https://github.com/phetsims/blackbody-spectrum/blob/master/js/blackbody-spectrum/view/BlackbodySpectrumScreenView.js) is the primary view component. It sets up all major components in the screen, including the graph, thermometer, control panel, and BGR/Star display.

[GraphDrawingNode](https://github.com/phetsims/blackbody-spectrum/blob/master/js/blackbody-spectrum/view/GraphDrawingNode.js) is responsible for constructing all graph paths, creating the zoom buttons, and controlling how the zoom affects the graph paths.

[ZoomableAxesView](https://github.com/phetsims/blackbody-spectrum/blob/master/js/blackbody-spectrum/view/ZoomableAxesView.js) is responsible for creating the graph axes, including the tick marks and labels for the axes.

[BlackbodySpectrumThermometer](https://github.com/phetsims/blackbody-spectrum/blob/master/js/blackbody-spectrum/view/BlackbodySpectrumThermometer.js) is the primary thermometer of the sim. It is based off of [ThermometerNode](https://github.com/phetsims/scenery-phet/blob/master/js/ThermometerNode.js).

[BlackbodySpectrumControlPanel](https://github.com/phetsims/blackbody-spectrum/blob/master/js/blackbody-spectrum/view/BlackbodySpectrumControlPanel.js) is responsible for the control panel that controls all check boxes and the save/erase buttons for saved graph curves.

[BGRAndStarDisplay](https://github.com/phetsims/blackbody-spectrum/blob/master/js/blackbody-spectrum/view/BGRAndStarDisplay.js) is responsible for the Blue, Green, and Red color indicators, and the star intensity indicator.
