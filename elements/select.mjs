import { MdOutlinedSelect } from '@material/web/select/outlined-select.js';
import { MdSelectOptions } from '@material/web/select/select-option.js';
import { MdList } from '@material/web/list/list.js';
import { MdListItem } from '@material/web/list/menu-item.js';
import { MdMenu } from '@material/web/menu/menu.js';
import { MdMenuSurface } from '@material/web/menu/mwc-menu-surface-base.js';
import { MdRipple } from '@material/web/ripple/ripple.js';
import { NotchedOutlineBase } from '@material/mwc-notched-outline/mwc-notched-outline-base.js';

import { styles as selectStyles } from '@material/select/outlined-select.css';
import { styles as listStyles } from '@material/list/list.css';
import { styles as listItemStyles } from '@material/list/list-item.css';
import { styles as rippleStyles } from '@material/ripple/ripple.css';
import { styles as menuStyles } from '@material/menu/menu.css';
import { styles as menuSurfaceStyles } from '@material/menu/menu.css';
// import { styles as notchedOutlineStyles } from '@material/mwc-notched-outline/mwc-notched-outline.css';

export const selectDefinition = {
  'md-outlined-select': class extends MdOutlinedSelect {
    static get styles() {
      return selectStyles;
    }
  },
  'md-select-option': class extends MdSelectOptions {
    static get styles() {
      return selectStyles;
    }
  },
  'md-list': class extends MdList {
    static get styles() {
      return listStyles;
    }
  },
  'md-list-item': class extends MdListItem {
    static get styles() {
      return listItemStyles;
    }
  },
  'md-ripple': class extends MdRipple {
    static get styles() {
      return rippleStyles;
    }
  },
  'md-menu': class extends MdMenu {
    static get styles() {
      return menuStyles;
    }
  },
  'md-menu-surface': class extends MdMenuSurface {
    static get styles() {
      return menuSurfaceStyles;
    }
  },
  // 'mwc-notched-outline': class extends NotchedOutlineBase {
  //   static get styles() {
  //     return notchedOutlineStyles;
  //   }
  // },
};
