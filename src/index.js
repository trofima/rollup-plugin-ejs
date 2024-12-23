import {createFilter} from '@rollup/pluginutils'
import {compile} from 'ejs'
import {readFile} from 'fs/promises'
import path from 'path'

const linkTagRegEx = /<link(?=.*\shref=['|"](?<filePath>[\w$-_.+!*'(),]*)['|"])(?=.*\srel=['|"]stylesheet['|"]).*>/
const defaultCompilerOptions = {client: true, strict: true}

const compilers = {
  css: readStyleFile,
  scss: async (tplFilePath, href) => {
    const {compile} = await import('sass')
    const sassFilePath = path.resolve(path.parse(tplFilePath).dir, href)
    const compiled = await compile(sassFilePath)

    return compiled.css.toString('utf8')
  },
}

function readStyleFile(tplFilePath, href) {
  return readFile(path.resolve(path.parse(tplFilePath).dir, href), 'utf8')
}

async function replaceLinkWithStyle(code, tplFilePath) {
  const match = code.match(linkTagRegEx)

  if (match) {
    const filePath = match.groups?.filePath
    const style = filePath
      ? `<style>${await compilers[path.extname(filePath).substring(1)](tplFilePath, filePath)}</style>`
      : ''
      
    return replaceLinkWithStyle(code.replace(linkTagRegEx, style), tplFilePath)
  }

  return code
}

async function renderCode(templateFn, render) {
  if (render) {
    const {data, minifierOptions} = render
    const code = minifierOptions
      ? (await import('html-minifier')).minify(templateFn(data), minifierOptions)
      : templateFn(data)

    return JSON.stringify(code)
  }

  return templateFn.toString()
}

export default ({
  include, exclude, inlineStyles, render,
  compilerOptions = defaultCompilerOptions,
} = {}) => {
  const filter = createFilter(include || ['**/*.ejs'], exclude)

  return {
    name: 'ejs',

    transform: async function transform(code, tplFilePath) {
      if (filter(tplFilePath)) {
        const codeToCompile = inlineStyles 
          ? await replaceLinkWithStyle(code, tplFilePath)
          : code
        const templateFn = compile(codeToCompile, Object.assign(defaultCompilerOptions, compilerOptions))

        return {
          code: `export default ${await renderCode(templateFn, render)}`,
          map: {mappings: ''},
        }
      }
    },
  }
}
