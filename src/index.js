import {createFilter} from 'rollup-pluginutils';
import {compile} from 'ejs';

export default function({include, exclude, compilerOptions} = {}) {
    if (include)
        throw Error('include option should be specified');

    const filter = createFilter(include || [ '**/*.ejs'], exclude);

    const compilerOpts = Object.assign({}, {
        client: true,
        strict: true
    }, compilerOptions || {});

    return {
        name: 'ejs',

        transform: function transform(code, id) {
            if (filter(id)) {
                const templateFn = compile(code, compilerOpts);

                return {
                    code: `export default ${templateFn.toString()};`,
                    map: {mappings: ''},
                };
            }
        }
    };
}
