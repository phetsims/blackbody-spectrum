// Copyright 2018-2021, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu
 *
 * @author Arnab Purkayastha
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import OptionsDialog from '../../../../joist/js/OptionsDialog.js';
import ProjectorModeCheckbox from '../../../../joist/js/ProjectorModeCheckbox.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import blackbodySpectrum from '../../blackbodySpectrum.js';
import blackbodyColorProfile from './blackbodyColorProfile.js';

class GlobalOptionsNode extends VBox {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // add support for setting projector mode
    const projectorModeCheckbox = new ProjectorModeCheckbox( blackbodyColorProfile, {
      tandem: tandem.createTandem( 'projectorModeCheckbox' )
    } );

    // VBox is used to make it easy to add additional options
    super( {
      children: [ projectorModeCheckbox ],
      spacing: OptionsDialog.DEFAULT_SPACING,
      align: 'left'
    } );

    // @private
    this.disposeGlobalOptionsNode = () => {
      projectorModeCheckbox.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeGlobalOptionsNode();
    super.dispose();
  }
}

blackbodySpectrum.register( 'GlobalOptionsNode', GlobalOptionsNode );
export default GlobalOptionsNode;