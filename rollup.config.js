import autoExternal from 'rollup-plugin-auto-external';
import { terser } from 'rollup-plugin-terser';

module.exports = [{
  input: './src/index.js',
  output: {
    file: 'dist/jazzy-auth.js',
    format: 'cjs'
  },
  plugins: [autoExternal()]
},
{
  input: './src/index.js',
  output: {
    file: 'dist/jazzy-auth.min.js',
    format: 'cjs'
  },
  plugins: [autoExternal(), terser()]
}];
