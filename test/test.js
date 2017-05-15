import {describe, it} from 'mocha';
import {rollup} from 'rollup';
import {expect} from 'chai';
import ejs from '..';

process.chdir(__dirname);

describe( 'rollup-plugin-ejs', () => {
    function createBundle() {
        return rollup({
            entry: 'samples/main.js',
            plugins: [ejs()]
        })
    }

    function getTplFnFrom(bundle) {
        const generated = bundle.generate({format: 'cjs'});
        const code = generated.code;
        const module = {exports: {}};
        const fn = new Function('module', code);

        fn(module);

        return module.exports;
    }

    it('should convert ejs to tpl function', async () => {
        const bundle = await createBundle();
        const tplFn = getTplFnFrom(bundle);

        expect(tplFn).to.be.a('function');
    });

    it('should convert ejs to tpl function retuning parsed html string', async () => {
        const bundle = await createBundle();
        const tplFn = getTplFnFrom(bundle);

        expect(tplFn({test: 'test'})).to.be.equal('<div>test</div>');
    });
});


