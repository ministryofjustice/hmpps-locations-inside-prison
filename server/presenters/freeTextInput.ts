import nunjucks from 'nunjucks'

const template = '{% from "govuk/components/input/macro.njk" import govukInput %}{{ govukInput(params) }}'

export default function freeTextInput(params: object) {
  return nunjucks.renderString(template, { params })
}
