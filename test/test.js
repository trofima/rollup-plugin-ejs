import {describe, it} from 'mocha';
import {rollup} from 'rollup';
import {expect} from 'chai';
import ejs from '..';

process.chdir(__dirname);

describe('rollup-plugin-ejs', () => {
  function createBundle(sampleFileName = 'main', pluginSettings) {
    return rollup({
      input: `samples/${sampleFileName}.js`,
      plugins: [ejs(pluginSettings)],
    })
  }

  async function getTplFnFrom(bundle) {
    const {output: [{code}]} = await bundle.generate({format: 'cjs'});
    const module = {exports: {}};
    const fn = new Function('module', code);

    fn(module);

    return module.exports;
  }

  function removeSpacesFrom(str) {
    return str.replace(/\s/g, '');
  }

  describe('common', () => {
    it('should convert ejs to tpl function', async () => {
      const bundle = await createBundle();
      const tplFn = await getTplFnFrom(bundle);

      expect(tplFn).to.be.a('function');
    });

    it('should convert ejs to tpl function retuning parsed html string', async () => {
      const bundle = await createBundle();
      const tplFn = await await getTplFnFrom(bundle);

      expect(tplFn({test: 'test'})).to.be.equal('<div>test</div>');
    });

    it('should support any file extension with proper ejs content', async () => {
      const bundle = await createBundle('html', {include: ['**/*.html']});
      const tplFn = await getTplFnFrom(bundle);

      expect(tplFn({test: 'test'})).to.be.equal('<div>test</div>');
    });

    it('should replace link[rel="stylesheet"] without href to empty string', async () => {
      const bundle = await createBundle('cssLoading/oneLinkTag', {loadStyles: true});
      const tplFn = await getTplFnFrom(bundle);

      expect(removeSpacesFrom(tplFn({test: 'test_value'})))
        .to.be.equal('<div>test_value</div>');
    });

    it('should replace multiple link[rel="stylesheet"] without href to empty string', async () => {
      const bundle = await createBundle('cssLoading/multipleLinkTags', {loadStyles: true});
      const tplFn = await getTplFnFrom(bundle);

      expect(removeSpacesFrom(tplFn({test: 'test_value'})))
        .to.be.equal('<div>test_value</div>');
    });
  });

  describe('css styles loading', () => {
    it('should load css rules from linked css file to style tag', async () => {
      const bundle = await createBundle('cssLoading/loadCssRules', {loadStyles: true});
      const tplFn = await getTplFnFrom(bundle);

      expect(removeSpacesFrom(tplFn()))
        .to.be.equal('<style>*{border:0;}a{text-decoration:none;}</style>');
    });

    it('should load css rules from multiple linked css files to style tags', async () => {
      const bundle = await createBundle('cssLoading/loadMultipleCssRules', {loadStyles: true});
      const tplFn = await getTplFnFrom(bundle);

      expect(removeSpacesFrom(tplFn()))
        .to.be.equal(removeSpacesFrom(`
            <style>*{border:0;}a{text-decoration:none;}</style>
            <style>:host{display: block;}</style>
        `));
    });
  });

  describe('sass styles loading', () => {
    it('should load and compile css rules from linked scss file to style tag', async () => {
      const bundle = await createBundle('sassLoading/loadSassRules', {loadStyles: true});
      const tplFn = await getTplFnFrom(bundle);

      expect(removeSpacesFrom(tplFn()))
        .to.be.equal('<style>*{border:0;}a{text-decoration:none;}</style>');
    });

    it('should load and compile css rules from multiple linked scss files to style tags', async () => {
      const bundle = await createBundle('sassLoading/loadMultipleSassRules', {loadStyles: true});
      const tplFn = await getTplFnFrom(bundle);

      expect(removeSpacesFrom(tplFn()))
        .to.be.equal(removeSpacesFrom(`
            <style>*{border:0;}a{text-decoration:none;}</style>
            <style>:host{display: block;}</style>
        `));
    });

    it('should correctly resolve and load sass imports for multiple nesting levels', async () => {
      const bundle = await createBundle('sassLoading/nested/nested1/loadSassRules', {loadStyles: true});
      const tplFn = await getTplFnFrom(bundle);

      expect(removeSpacesFrom(tplFn()))
        .to.be.equal('<style>*{border:0;}a{text-decoration:none;}</style>');
    });

    it('should load and compile mixed css rules from multiple linked css and scss files to style tags', async () => {
      const bundle = await createBundle('sassLoading/loadMultipleMixedRules', {loadStyles: true});
      const tplFn = await getTplFnFrom(bundle);

      expect(removeSpacesFrom(tplFn()))
        .to.be.equal(removeSpacesFrom(`
            <style>*{border:0;}a{text-decoration:none;}</style>
            <style>:host{display: block;}</style>
        `));
    });
  });
});


