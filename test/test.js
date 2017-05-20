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

    describe('common', () => {
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

        it('should replace link[rel="stylesheet"] tag to style tag', async() => {
            const bundle = await createBundle('cssLoading/oneLinkTag', {loadCss: true});
            const tplFn = getTplFnFrom(bundle);

            expect(tplFn()).to.be.equal('<style></style>');
        });

        it('should replace multiple link[rel="stylesheet"] tags to style tags', async() => {
            const bundle = await createBundle('cssLoading/multipleLinkTags', {loadCss: true});
            const tplFn = getTplFnFrom(bundle);

            expect(removeSpacesFrom(tplFn()))
                .to.be.equal('<style></style><style></style>');
        });

        it('should load css rules from linked css files to style tags', async() => {
            const bundle = await createBundle('cssLoading/loadCssRules', {loadCss: true});
            const tplFn = getTplFnFrom(bundle);

            expect(removeSpacesFrom(tplFn()))
                .to.be.equal('<style>*{border:0;}a{text-decoration:none;}</style>');
        });

        it('should replace link[rel="stylesheet"] tags to style tags found in template tag', async() => {
            const bundle = await createBundle('cssLoading/oneTemplate', {loadCss: true});
            const tplFn = getTplFnFrom(bundle);

            expect(removeSpacesFrom(tplFn()))
                .to.be.equal(removeSpacesFrom(`
                    <template>
                        <style>*{border:0;}a{text-decoration:none;}</style>
                    </template>
                `));
        });

        it('should replace link[rel="stylesheet"] tags to style tags found in multiple template tags', async() => {
            const bundle = await createBundle('cssLoading/multipleTemplates', {loadCss: true});
            const tplFn = getTplFnFrom(bundle);

            expect(removeSpacesFrom(tplFn()))
                .to.be.equal(removeSpacesFrom(`
                    <template>
                        <style>*{border:0;}a{text-decoration:none;}</style>
                    </template>
                    <template>
                        <style>*{border:0;}a{text-decoration:none;}</style>
                    </template>
                `));
        });
    });
});


