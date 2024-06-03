import { MdSwitch } from '@material/web/switch/switch.js';
import { MdRipple } from '@material/web/ripple/ripple.js';
import { styles as switchStyles } from '@material/web/switch/switch.css';
import { styles as rippleStyles } from '@material/web/ripple/ripple.css';

export const switchDefinition = {
  'md-switch': class extends MdSwitch {
    static get styles() {
      return switchStyles;
    }
  },
  'md-ripple': class extends MdRipple {
    static get styles() {
      return rippleStyles;
    }
  },
};