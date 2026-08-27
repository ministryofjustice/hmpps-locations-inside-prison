import nunjucks from 'nunjucks'
import path from 'path'

// Own Environment with explicit search paths so this doesn't depend on nunjucks.configure()
// having already run elsewhere (some callers render macros at module load time).
const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader([
    path.join(__dirname, '../views'),
    'node_modules/govuk-frontend/dist/',
    'node_modules/@ministryofjustice/frontend/',
    'node_modules/@ministryofjustice/frontend/moj/components/',
  ]),
  { autoescape: true },
)

export default function renderMacro(macroPath: string, macroName: string, params: object) {
  const macroParams = JSON.stringify(params, null, 2)
  const macroString = `
      {%- from "${macroPath}.njk" import ${macroName} -%}
      {{- ${macroName}(${macroParams}) -}}
    `

  return env.renderString(macroString, undefined)
}
