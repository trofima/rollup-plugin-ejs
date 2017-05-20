import {createFilter} from 'rollup-pluginutils';
import {compile} from 'ejs';
import {JSDOM} from 'jsdom';
import fs from 'fs';
import path from 'path';

function createStyleTagFrom(link, tplFilePath) {
    const cssRelativePath = link.getAttribute('href');
    const style = JSDOM.fragment(`<style></style>`);

    if (cssRelativePath) {
        const cssPath = path.resolve(path.parse(tplFilePath).dir, cssRelativePath);

        style.firstChild.textContent = fs.readFileSync(cssPath, 'utf8');
    }

    return style;
}

function createTemplateFrom(templateContent, tplFilePath) {
    const newTemplateContent = replaceLinksWithStylesIn(templateContent, tplFilePath);
    const newTemplate = JSDOM.fragment('<template></template>').firstChild;

    newTemplate.content.appendChild(newTemplateContent);

    return newTemplate;
}

function replaceLinksWithStylesIn(dom, tplFilePath) {
    const newDom = dom.cloneNode(true);
    const links = newDom.querySelectorAll('link[rel="stylesheet"]');
    const templates = newDom.querySelectorAll('template');

    links.forEach(link =>
        newDom.replaceChild(createStyleTagFrom(link, tplFilePath), link));
    templates.forEach(template =>
        newDom.replaceChild(createTemplateFrom(template.content, tplFilePath), template));

    return newDom;
}

function loadCssStylesTo(code, tplFilePath) {
    const wrapper = JSDOM.fragment('<div></div>').children[0];
    const newDom = replaceLinksWithStylesIn(JSDOM.fragment(code), tplFilePath);

    wrapper.appendChild(newDom);

    return wrapper.innerHTML.trim();
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
