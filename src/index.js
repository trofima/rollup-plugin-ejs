import {createFilter} from '@rollup/pluginutils';
import {compile} from 'ejs';
import fs from 'fs';
import path from 'path';
import * as sass from 'node-sass';

const linkTagRegEx = /<link(?=.*\shref=['|"]([\w$-_.+!*'(),]*)['|"])(?=.*\srel=['|"]stylesheet['|"]).*>/g;
const readStyleFile = (tplFilePath, href) => fs.readFileSync(path.resolve(path.parse(tplFilePath).dir, href), 'utf8');
const defaultCompilerOptions = {client: true, strict: true};

const compilers = {
  css: readStyleFile,
  scss: (tplFilePath, href) => {
    const compiled = sass.renderSync({
      data: readStyleFile(tplFilePath, href),
      importer: (url, prev) => ({file: path.resolve(path.parse(prev === 'stdin' ? tplFilePath : prev).dir, url)}),
    });

    return compiled.css.toString('utf8');
  },
};

function inlineStylesTo(code, tplFilePath) {
  return code.replace(linkTagRegEx, (match, href) => href
    ? `<style>${compilers[path.extname(href).substring(1)](tplFilePath, href)}</style>`
    : '');
}

async function renderCode(templateFn, render) {
  if (render) {
    const {data, minifierOptions} = render;
    const code = minifierOptions ? (await import('html-minifier')).minify(templateFn(data), minifierOptions) : templateFn(data);

    return JSON.stringify(code);
  }

  return templateFn.toString();
}

export default ({
  include, exclude, inlineStyles, render,
  compilerOptions = defaultCompilerOptions,
} = {}) => {
  const filter = createFilter(include || ['**/*.ejs'], exclude);

  return {
    name: 'ejs',

    transform: async function transform(code, tplFilePath) {
      if (filter(tplFilePath)) {
        const codeToCompile = inlineStyles ? inlineStylesTo(code, tplFilePath) : code;
        const templateFn = compile(codeToCompile, Object.assign(defaultCompilerOptions, compilerOptions));

        return {
          code: `export default ${await renderCode(templateFn, render)};`,
          map: {mappings: ''},
        };
      }
    },
  };
}
