import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import serve from 'rollup-plugin-serve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import ignore from 'rollup-plugin-ignore';
import sizes from 'rollup-plugin-sizes';
import { ignoreSwitchFiles } from './elements/ignore/switch.mjs';
import { ignoreSelectFiles } from './elements/ignore/select.mjs';
import { ignoreTextfieldFiles } from './elements/ignore/textfield.mjs';
import { ignoreFormFieldFiles } from './elements/ignore/formfield.mjs';

export default {
  input: ['src/boilerplate-card.ts'],
  output: {
    dir: './dist',
    format: 'es',
  },
  logLevel: 'debug',
  plugins: [
    resolve(),
    typescript(),
    json(),
    babel({
      exclude: 'node_modules/**',
      format: 'es',
      include: 'src/**',
      exclude: 'homeassistant-frontend/**',
      babelHelpers: 'bundled',
    }),
    terser(),
    serve({
      contentBase: './dist',
      host: '0.0.0.0',
      port: 5000,
      allowCrossOrigin: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }),
    ignore([
      '@material/web', 
      ...ignoreSelectFiles,
      ...ignoreSwitchFiles,
      ...ignoreTextfieldFiles,
      ...ignoreFormFieldFiles,
    ], { commonjsBugFix: true }),
    sizes({ details: true }),
  ],
};
