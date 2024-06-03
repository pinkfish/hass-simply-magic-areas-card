import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js';
//import { NotchedOutlineBase } from '@material/mwc-notched-outline/mwc-notched-outline-base.js';

import { styles as textfieldStyles } from '@material/web/textfield/outlined-text-field.css';
//import { styles as notchedOutlineStyles } from '@material/mwc-notched-outline/mwc-notched-outline.css';

export const textfieldDefinition = {
  'md-outlined-text-field': class extends MdOutlinedTextField {
    static get styles() {
      return textfieldStyles;
    }
  },
 // 'mwc-notched-outline': class extends NotchedOutlineBase {
 //   static get styles() {
 //     return notchedOutlineStyles;
 //   }
 // },
};