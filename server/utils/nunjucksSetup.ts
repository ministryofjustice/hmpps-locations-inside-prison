/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'

import fs from 'fs'
import { get, isFunction } from 'lodash'

import { ApplicationInfo } from '../applicationInfo'
import config from '../config'
import logger from '../../logger'
import formatConstants from '../formatters/formatConstants'
import approvalTypeDescription from '../formatters/approvalTypeDescription'
import paths from './paths'
import addFilters from './nunjucksFilters'

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

  njkEnv.addGlobal('callAsMacro', callAsMacro)
  njkEnv.addGlobal('formCsrf', formCsrf)
  njkEnv.addGlobal('googleAnalyticsMeasurementId', config.googleAnalytics.measurementId)
  njkEnv.addGlobal('googleTagManagerContainerId', config.googleAnalytics.containerId)
  njkEnv.addGlobal('feedbackFormUrl', config.feedbackFormUrl)
  njkEnv.addGlobal('propEquals', (k: string, v: unknown, o: object) => get(o, k) === v)
  njkEnv.addGlobal('formatConstants', formatConstants)
  njkEnv.addGlobal('approvalTypeDescription', approvalTypeDescription)
  njkEnv.addGlobal('paths', paths)

  addFilters(njkEnv)
  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url)
}
