import { MdOutlinedField } from '@material/web/field/outlined-field.js';
import { styles as formfieldStyles } from '@material/web/field/outlined-field.css';

export const formfieldDefinition = {
  'md-outlined-field': class extends MdOutlinedField {
    static get styles() {
      return formfieldStyles;
    }
  },
};