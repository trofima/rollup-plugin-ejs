import {describe, it} from 'mocha';
import {rollup} from 'rollup';
import {expect} from 'chai';
import ejs from '..';

process.chdir(__dirname);

describe( 'rollup-plugin-ejs', () => {
    function createBundle(sampleFileName = 'main', pluginSettings) {
        return rollup({
            entry: `samples/${sampleFileName}.js`,
            plugins: [ejs(pluginSettings)]
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

    function getStringFrom(bundle) {
        const generated = bundle.generate({format: 'cjs'});
        return generated.code;
    }

    describe('common', () => {
        it('should convert ejs to tpl function', async () => {
            const bundle = await createBundle();
            const tplFn = getTplFnFrom(bundle);

            expect(tplFn).to.be.a('function');
        });

        it('should convert ejs to tpl function returning parsed html string', async () => {
            const bundle = await createBundle();
            const tplFn = getTplFnFrom(bundle);

            expect(tplFn({test: 'test'})).to.be.equal('<div>test</div>');
        });

        it('should support any file extension with proper ejs content', async () => {
            const bundle = await createBundle('html', {include: ['**/*.html']});
            const tplFn = getTplFnFrom(bundle);

            expect(tplFn({test: 'test'})).to.be.equal('<div>test</div>');
        });
    });

    describe('styles loading', () => {
        function removeSpacesFrom(str) {
            return str.replace(/\s/g, '');
        }

        it('should replace link[rel="stylesheet"] without href to empty string', async() => {
            const bundle = await createBundle('cssLoading/oneLinkTag', {loadCss: true});
            const tplFn = getTplFnFrom(bundle);

            expect(removeSpacesFrom(tplFn({test: 'test_value'})))
                .to.be.equal('<div>test_value</div>');
        });

        it('should replace multiple link[rel="stylesheet"] without href to empty string', async() => {
            const bundle = await createBundle('cssLoading/multipleLinkTags', {loadCss: true});
            const tplFn = getTplFnFrom(bundle);

            expect(removeSpacesFrom(tplFn({test: 'test_value'})))
                .to.be.equal('<div>test_value</div>');
        });

        it('should load css rules from linked css file to style tag', async() => {
            const bundle = await createBundle('cssLoading/loadCssRules', {loadCss: true});
            const tplFn = getTplFnFrom(bundle);

            expect(removeSpacesFrom(tplFn()))
                .to.be.equal('<style>*{border:0;}a{text-decoration:none;}</style>');
        });

        it('should load css rules from multiple linked css files to style tags', async() => {
            const bundle = await createBundle('cssLoading/loadMultipleCssRules', {loadCss: true});
            const tplFn = getTplFnFrom(bundle);

            expect(removeSpacesFrom(tplFn()))
                .to.be.equal(removeSpacesFrom(`
                    <style>*{border:0;}a{text-decoration:none;}</style>
                    <style>:host{display: block;}</style>
                `));
        });
    });

    describe('compiling', () => {
        const compileSettings = {
            compilerOptions: { client: false },
            data: {locals: {test: 'test'}}
        };

        it('should convert ejs to string', async () => {
            const bundle = await createBundle('main', compileSettings);
            const compiledTpl = getStringFrom(bundle);

            expect(compiledTpl).to.be.a('string');
        });

        it('should convert ejs to tpl function returning parsed html string', async () => {
            const bundle = await createBundle('main', compileSettings);
            const compiledTpl = getTplFnFrom(bundle);

            expect(compiledTpl).to.be.equal('<div>test</div>');
        });

        it('should support any file extension with proper ejs content', async () => {
            const includeSettings = Object.assign({}, compileSettings, {include: ['**/*.html']})
            const bundle = await createBundle('html', includeSettings);
            const compiledTpl = getTplFnFrom(bundle);

            expect(compiledTpl).to.be.equal('<div>test</div>');
        });
    });
});


