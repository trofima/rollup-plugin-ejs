import nodeResolve from '@rollup/plugin-node-resolve';

const pkg = require('./package.json');
const external = Object.keys(pkg.dependencies);

export default {
  input: 'src/index.js',
  output: [
    {file: pkg.exports.require, format: 'cjs', exports: 'auto'},
    {file: pkg.exports.import, format: 'es'},
  ],
  plugins: [nodeResolve()],
  external: external,
};
