/* eslint-disable no-param-reassign */
import nunjucks from 'nunjucks'

import { initialiseName } from './utils'
import formatDateWithTime from '../formatters/formatDateWithTime'
import formatDate from '../formatters/formatDate'
import formatTime from '../formatters/formatTime'
import capFirst from '../formatters/capFirst'
import nonOxfordJoin from '../formatters/nonOxfordJoin'
import locationStatusTagClass from '../formatters/locationStatusTagClass'
import locationStatusTagLabel from '../formatters/locationStatusTagLabel'
import formatDateWithTimeAndDay from '../formatters/formatDateWithTimeAndDay'
import getLocationAttributesIncludePending from './getLocationAttributesIncludePending'
import dashIfUndefined from '../formatters/dashIfUndefined'
import yesNo from '../formatters/yesNo'
import sortByFirstPresentAttribute from '../formatters/sortByFirstPresentAttribute'

// Shared by the app's environment and renderMacro's own one, so a macro rendered either way has the same filters
export default function addFilters(njkEnv: nunjucks.Environment) {
  njkEnv.addFilter('initialiseName', initialiseName)

  njkEnv.addFilter('capFirst', capFirst)
  njkEnv.addFilter('formatDate', formatDate)
  njkEnv.addFilter('formatTime', formatTime)
  njkEnv.addFilter('formatDateWithTime', formatDateWithTime)
  njkEnv.addFilter('formatDateWithTimeAndDay', formatDateWithTimeAndDay)
  njkEnv.addFilter('locationStatusTagClass', locationStatusTagClass)
  njkEnv.addFilter('locationStatusTagLabel', locationStatusTagLabel)
  njkEnv.addFilter('nonOxfordJoin', nonOxfordJoin)
  njkEnv.addFilter('isArray', function isArrayFilter(value) {
    return Array.isArray(value)
  })
  njkEnv.addFilter('setAttribute', function setAttribute(dictionary, key, value) {
    dictionary[key] = value
    return dictionary
  })
  njkEnv.addFilter('keys', Object.keys)
  njkEnv.addFilter('stripEmpty', function stripEmptyFilter(array: unknown[]) {
    return array.filter(v => v)
  })
  njkEnv.addFilter('sortByFirstPresentAttribute', sortByFirstPresentAttribute)
  njkEnv.addFilter('includePending', getLocationAttributesIncludePending)
  njkEnv.addFilter('dashIfUndefined', dashIfUndefined)
  njkEnv.addFilter('yesNo', yesNo)
}
