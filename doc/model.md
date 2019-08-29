# Blackbody Spectrum - model description

The model uses four equations for calculating components of the graph:

+ [Planck's Law](https://en.wikipedia.org/wiki/Planck%27s_law), which returns a spectral radiance of a Blackbody given a temperature and wavelength, to map the main blackbody radiation graph. This is converted to [Spectral flux density](https://en.wikipedia.org/wiki/Spectral_flux_density), or the spectral radiance when generalized to not be dependent on steradians.
+ [Stefan–Boltzmann Law](https://en.wikipedia.org/wiki/Stefan%E2%80%93Boltzmann_law), which returns the total intensity of the blackbody, to calculate the area under the blackbody curve.
+ [Wien's Displacement Law](https://en.wikipedia.org/wiki/Wien%27s_displacement_law), which returns the peak wavelength of the blackbody, to place the "Graph Values" point on the peak of the curve.

The intensity of each of the blue, green, and red indicator circles are calculated based on the relative intensity of the spectrum at the colors' respective wavelengths.
