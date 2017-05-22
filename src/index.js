import {createFilter} from 'rollup-pluginutils';
import {compile} from 'ejs';
import fs from 'fs';
import path from 'path';

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

export default function({
                            include,
                            exclude,
                            loadCss,
                            compilerOptions = {client: true, strict: true}
                        } = {}) {
    const filter = createFilter(include || ['**/*.ejs'], exclude);

    return {
        name: 'ejs',

        transform: function transform(code, tplFilePath) {
            if (filter(tplFilePath)) {
                const codeToCompile = loadCss ? loadCssStylesTo(code, tplFilePath) : code;
                const templateFn = compile(codeToCompile, compilerOptions);

                return {
                    code: `export default ${templateFn.toString()};`,
                    map: {mappings: ''},
                };
            }
        }
    };
}
