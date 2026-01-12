import express from 'express'
import 'express-async-errors'

import createError from 'http-errors'
import cookieParser from 'cookie-parser'

import { setupResources } from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/middleware/setUpDprResources'
import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import { appInsightsMiddleware } from './utils/azureAppInsights'

import addBreadcrumb from './middleware/addBreadcrumb'
import getFrontendComponents from './middleware/getFeComponents'
import setUpAuthentication from './middleware/setUpAuthentication'
import setUpCsrf from './middleware/setUpCsrf'
import setUpCurrentUser from './middleware/setUpCurrentUser'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'

import routes from './routes'
import type { Services } from './services'
import setCanAccess from './middleware/setCanAccess'
import config from './config'
import setUpFeatureFlags from './middleware/setUpFeatureFlags'
import refreshSystemToken from './middleware/refreshSystemToken'
import setUpMultipartFormDataParsing from './middleware/setUpMultipartFormDataParsing'

export default function createApp(services: Services): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(appInsightsMiddleware())
  app.use(cookieParser())
  app.use(setUpHealthChecks(services.applicationInfo))
  app.use(setUpMultipartFormDataParsing())
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app, services.applicationInfo)
  app.use(setUpFeatureFlags())
  app.use(setUpAuthentication())
  app.use(setUpCsrf())
  app.get('*', getFrontendComponents(services))
  app.use(setUpCurrentUser(services))
  app.use(refreshSystemToken(services))
  app.use(setCanAccess(services.locationsService))

  if (config.environmentName !== 'Training') {
    app.use(addBreadcrumb({ title: 'Digital Prison Services', href: app.locals.dpsUrl }))
  }
  app.use(setupResources(services, config.dpr))
  app.use(routes(services))

  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
