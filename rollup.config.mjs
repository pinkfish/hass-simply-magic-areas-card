import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';

const dev = process.env.ROLLUP_WATCH;

const plugins = [
  nodeResolve({}),
  commonjs(),
  typescript(),
  json(),
  babel({
    exclude: 'node_modules/**',
    babelHelpers: 'bundled',
  }),
  terser(),
];

export default [
  {
    input: 'src/simply-magic-area-card.ts',
    output: {
      inlineDynamicImports: true,
      esModule: true,
      file: 'dist/simply-magic-area-card.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [...plugins],
  },
];
