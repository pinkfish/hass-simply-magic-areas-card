import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import json from '@rollup/plugin-json';
import ignore from 'rollup-plugin-ignore';
import { ignoreSwitchFiles } from './elements/ignore/switch.mjs';
import { ignoreSelectFiles } from './elements/ignore/select.mjs';
import { ignoreTextfieldFiles } from './elements/ignore/textfield.mjs';
import { ignoreFormFieldFiles } from './elements/ignore/formfield.mjs';

const dev = process.env.ROLLUP_WATCH;

const serveopts = {
  contentBase: ['./dist'],
  host: '0.0.0.0',
  port: 5000,
  allowCrossOrigin: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
};

const plugins = [
  nodeResolve({}),
  commonjs(),
  typescript(),
  json(),
  babel({
    exclude: 'node_modules/**',
    babelHelpers: 'bundled',
  }),
  dev && serve(serveopts),
  !dev && terser(),
  ignore([
    '@material/web',
    ...ignoreSelectFiles,
    ...ignoreSwitchFiles,
    ...ignoreTextfieldFiles,
    ...ignoreFormFieldFiles,
  ], { commonjsBugFix: true }),
];

export default [
  {
    input: 'src/boilerplate-card.ts',
    output: {
      dir: 'dist',
      format: 'es',
    },
    plugins: [...plugins],
  },
];
