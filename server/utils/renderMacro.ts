import nunjucks from 'nunjucks'

export default function renderMacro(macroPath: string, macroName: string, params: object) {
  const macroParams = JSON.stringify(params, null, 2)
  const macroString = `
      {%- from "${macroPath}.njk" import ${macroName} -%}
      {{- ${macroName}(${macroParams}) -}}
    `

  return nunjucks.renderString(macroString, undefined)
}
