/**
 * Bravo Bundle Entry Point
 * This file imports all Bravo components and makes them available globally
 * as window.bootstrap for compatibility with Bootstrap's documentation
 */

// Import Bootstrap's base components first
// Use the index to get initialization code too
import * as BootstrapComponents from 'bootstrap/js/index.esm';
import packageJson from '../../../../package.json';

// Import Bravo enhanced components
import Alert from '../../../../js/alert.js';
import Button from '../../../../js/button.js';
import Carousel from '../../../../js/carousel.js';
import Collapse from '../../../../js/collapse.js';
import Dropdown from '../../../../js/dropdown.js';
import Modal, { ModalNavigation } from '../../../../js/modal.js';
import Offcanvas from '../../../../js/offcanvas.js';
import Popover from '../../../../js/popover.js';
import Scrollspy from '../../../../js/scrollspy.js';
import Tab from '../../../../js/tab.js';
import Toast from '../../../../js/toast.js';
import Tooltip from '../../../../js/tooltip.js';

// DynamicObserver is used internally by components that need it

// Create the Bravo namespace with all components
const Bravo = {
  // Spread Bootstrap's components as a base
  ...BootstrapComponents,
  
  // Override with Bravo's enhanced components
  Alert,
  Button,
  Carousel,
  Collapse,
  Dropdown,
  Modal,
  ModalNavigation,
  Offcanvas,
  Popover,
  Scrollspy,
  Tab,
  Toast,
  Tooltip,
  
  // Add version info
  VERSION: packageJson.version,
  _bravo: true
};

// Components with DynamicObserver will self-register via their static blocks
if (typeof document !== 'undefined') {
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('Bravo bundle loaded and components initialized');
    });
  } else {
    console.log('Bravo bundle loaded and components initialized');
  }
}

// Export for ES6 modules
export default Bravo;

// Also export individual components
export {
  Alert,
  Button,
  Carousel,
  Collapse,
  Dropdown,
  Modal,
  ModalNavigation,
  Offcanvas,
  Popover,
  Scrollspy,
  Tab,
  Toast,
  Tooltip
};