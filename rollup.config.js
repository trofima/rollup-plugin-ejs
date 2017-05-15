import nodeResolve from 'rollup-plugin-node-resolve';

const pkg = require('./package.json');
const external = Object.keys( pkg.dependencies );

export default {
    entry: 'src/index.js',
    targets: [
        { dest: pkg.main, format: 'cjs' },
        { dest: pkg.module, format: 'es' }
    ],
    plugins: [nodeResolve()],
    external: external,
};
