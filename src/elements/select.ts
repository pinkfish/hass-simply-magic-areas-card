import { MdOutlinedSelect } from '@material/web/select/outlined-select';
import { MdSelectOption } from '@material/web/select/select-option';
import { MdList } from '@material/web/list/list';
import { MdListItem } from '@material/web/list/list-item';
import { MdMenu } from '@material/web/menu/menu';
import { MdRipple } from '@material/web/ripple/ripple';
import { MdElevation } from '@material/web/elevation/elevation';
//import { NotchedOutlineBase } from '@material/mwc-notched-outline/mwc-notched-outline-base.js';


export const selectDefinition = {
  'md-outlined-select': class extends MdOutlinedSelect {
    static get styles() {
      return MdOutlinedSelect.styles;
    }
  },
  'md-select-option': class extends MdSelectOption {
    static get styles() {
      return MdSelectOption.styles;
    }
  },
  'md-list': class extends MdList {
    static get styles() {
      return MdList.styles;
    }
  },
  'md-list-item': class extends MdListItem {
    static get styles() {
      return MdListItem.styles;
    }
  },
  'md-ripple': class extends MdRipple {
    static get styles() {
      return MdRipple.styles;
    }
  },
  'md-elevation': class extends MdElevation {
    static get styles() {
      return MdElevation.styles;
    }
  },
  'md-menu': class extends MdMenu {
    static get styles() {
      return MdMenu.styles;
    }
  },
  // 'mwc-notched-outline': class extends NotchedOutlineBase {
  //   static get styles() {
  //     return notchedOutlineStyles;
  //   }
  // },
};
