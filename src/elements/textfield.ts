import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field';

export const textfieldDefinition = {
  'md-outlined-text-field': class extends MdOutlinedTextField {
    static get styles() {
      return MdOutlinedTextField.styles;
    }
  },
 // 'mwc-notched-outline': class extends NotchedOutlineBase {
 //   static get styles() {
 //     return notchedOutlineStyles;
 //   }
 // },
};