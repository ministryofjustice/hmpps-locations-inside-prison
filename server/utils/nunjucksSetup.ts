/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import { setUpNunjucksFilters } from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/setUpNunjucksFilters'

import fs from 'fs'
import { get, isFunction } from 'lodash'

import { initialiseName } from './utils'
import { ApplicationInfo } from '../applicationInfo'
import config from '../config'
import formatDateWithTime from '../formatters/formatDateWithTime'
import formatDate from '../formatters/formatDate'
import formatTime from '../formatters/formatTime'
import capFirst from '../formatters/capFirst'
import nonOxfordJoin from '../formatters/nonOxfordJoin'
import logger from '../../logger'
import locationStatusTagClass from '../formatters/locationStatusTagClass'
import locationStatusTagLabel from '../formatters/locationStatusTagLabel'
import formatConstants from '../formatters/formatConstants'
import formatDateWithTimeAndDay from '../formatters/formatDateWithTimeAndDay'
import approvalTypeDescription from '../formatters/approvalTypeDescription'
import getLocationAttributesIncludePending from './getLocationAttributesIncludePending'
import dashIfUndefined from '../formatters/dashIfUndefined'
import yesNo from '../formatters/yesNo'

const production = process.env.NODE_ENV === 'production'

const ENV_TAG_COLOURS: Record<string, string> = {
  'PRE-PRODUCTION': 'govuk-tag--green',
  Training: 'govuk-tag--purple',
}

export default function nunjucksSetup(app: express.Express, applicationInfo: ApplicationInfo): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Residential locations'
  app.locals.environmentName = config.environmentName
  app.locals.environmentNameColour = ENV_TAG_COLOURS[config.environmentName] || ''
  app.locals.sandbox = config.sandbox
  app.locals.dpsUrl = config.services.dps
  app.locals.productionUrl = config.productionUrl

  // Cachebusting version string
  if (production) {
    // Version only changes with new commits
    app.locals.version = applicationInfo.gitShortHash
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }

  let assetManifest: Record<string, string> = {}

  try {
    const assetMetadataPath = path.resolve(__dirname, '../../assets/manifest.json')
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'))
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      logger.error(e, 'Could not read asset manifest file')
    }
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/dist/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
      // Digital Prison Reporting
      'node_modules/@ministryofjustice/hmpps-digital-prison-reporting-frontend/',
      'node_modules/@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/components/',
    ],
    {
      autoescape: true,
      express: app,
    },
  )

  function callAsMacro(name: string) {
    const macro = this.ctx[name]

    if (!isFunction(macro)) {
      // eslint-disable-next-line no-console
      console.log(`'${name}' macro does not exist`)
      return () => ''
    }

    return macro
  }

  function formCsrf() {
    return this.ctx['csrf-token']
  }

  // Digital Prison Reporting configuration
  setUpNunjucksFilters(njkEnv)

  njkEnv.addGlobal('callAsMacro', callAsMacro)
  njkEnv.addGlobal('formCsrf', formCsrf)
  njkEnv.addGlobal('googleAnalyticsMeasurementId', config.googleAnalytics.measurementId)
  njkEnv.addGlobal('googleTagManagerContainerId', config.googleAnalytics.containerId)
  njkEnv.addGlobal('feedbackFormUrl', config.feedbackFormUrl)
  njkEnv.addGlobal('propEquals', (k: string, v: unknown, o: object) => get(o, k) === v)
  njkEnv.addGlobal('formatConstants', formatConstants)
  njkEnv.addGlobal('approvalTypeDescription', approvalTypeDescription)

  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url)

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
  njkEnv.addFilter('includePending', getLocationAttributesIncludePending)
  njkEnv.addFilter('dashIfUndefined', dashIfUndefined)
  njkEnv.addFilter('yesNo', yesNo)
}
