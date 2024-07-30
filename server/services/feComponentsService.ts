import nunjucks from 'nunjucks'
import FeComponentsClient, { AvailableComponent } from '../data/feComponentsClient'
import kebabCase from '../formatters/kebabCase'

export default class FeComponentsService {
  constructor(private readonly feComponentsClient: FeComponentsClient) {}

  async getComponents<T extends AvailableComponent[]>(components: T, token: string) {
    return this.feComponentsClient.getComponents(components, token)
  }

  /**
   * Return a filename name for a macro
   * @param {string} macroName
   * @returns {string} returns naming convention based macro name
   */
  private macroNameToFilepath(macroName: string): string {
    if (macroName.includes('govuk')) {
      return `govuk/components/${kebabCase(macroName.replace(/^\b(govuk)/, ''))}`
    }

    if (macroName.includes('moj')) {
      return `moj/components/${kebabCase(macroName.replace(/^\b(moj)/, ''))}`
    }

    return kebabCase(macroName.replace(/^\b(app)/, ''))
  }

  getComponent(macroName: string, params = {}) {
    const macroParams = JSON.stringify(params, null, 2)
    const filename = this.macroNameToFilepath(macroName)
    const macroString = `
      {%- from "${filename}/macro.njk" import ${macroName} -%}
      {{- ${macroName}(${macroParams}) -}}
    `

    return nunjucks.renderString(macroString, undefined)
  }
}
