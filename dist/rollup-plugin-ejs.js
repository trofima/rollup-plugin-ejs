'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var rollupPluginutils = require('rollup-pluginutils');
var ejs = require('ejs');
var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var htmlMinifier = require('html-minifier');

function getCssFilePath(tplFilePath, href) {
    return path.resolve(path.parse(tplFilePath).dir, href);
}

function loadCssStylesTo(code, tplFilePath) {
    const linkTagRegEx = /<link(?=.*\shref=['|"]([\w$-_.+!*'(),]*)['|"])(?=.*\srel=['|"]stylesheet['|"]).*>/g;

    return code.replace(linkTagRegEx, (match, href) =>
        href
            ? `<style>${fs.readFileSync(getCssFilePath(tplFilePath, href), 'utf8')}</style>`
            : '');
}

var index = function({
                            include,
                            exclude,
                            loadCss,
                            compilerOptions = {client: true, strict: true},
                            data,
                            htmlMinifierOptions
                        } = {}) {
    const filter = rollupPluginutils.createFilter(include || ['**/*.ejs'], exclude);

    return {
        name: 'ejs',

        transform: function transform(code, tplFilePath) {
            if (filter(tplFilePath)) {
                const codeToCompile = loadCss ? loadCssStylesTo(code, tplFilePath) : code;
                const templateFn = ejs.compile(codeToCompile, compilerOptions);
                if(data) {
                    code = JSON.stringify(htmlMinifier.minify(templateFn(data), htmlMinifierOptions));
                } else {
                    code = templateFn.toString();
                }

                return {
                    code: `export default ${code}`,
                    map: {mappings: ''},
                };
            }
        }
    };
};

module.exports = index;
