import path from 'path'
import compression from 'compression'
import express, { Router } from 'express'
import noCache from 'nocache'

import config from '../config'

export default function setUpStaticResources(): Router {
  const router = express.Router()

  router.use(compression())

  /** Add a static asset route */
  function staticRoute(assetUrl: string, assetPath: string): void {
    router.use(
      assetUrl,
      express.static(path.join(process.cwd(), assetPath), {
        maxAge: config.staticResourceCacheDuration,
        redirect: false,
      }),
    )
  }

  //  Static Resources Configuration
  const cacheControl = { maxAge: config.staticResourceCacheDuration }

  Array.of(
    '/dist/assets',
    '/dist/assets/stylesheets',
    '/dist/assets/js',
    '/node_modules/govuk-frontend/dist/govuk/assets',
    '/node_modules/govuk-frontend/dist',
    '/node_modules/@ministryofjustice/frontend/moj/assets',
    '/node_modules/@ministryofjustice/frontend',
    '/node_modules/@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/assets',
    '/node_modules/jquery/dist',
  ).forEach(dir => {
    router.use('/assets', express.static(path.join(process.cwd(), dir), cacheControl))
  })

  Array.of('/node_modules/govuk_frontend_toolkit/images').forEach(dir => {
    router.use('/assets/images/icons', express.static(path.join(process.cwd(), dir), cacheControl))
  })

  Array.of('/node_modules/jquery/dist/jquery.min.js').forEach(dir => {
    router.use('/assets/js/jquery.min.js', express.static(path.join(process.cwd(), dir), cacheControl))
  })

  // Digital Prison Reporting & related third-party plugins
  staticRoute('/assets/govuk', '/node_modules/govuk-frontend/dist/govuk/assets') // DPR forces GOVUK assets to load from /assets/govuk
  staticRoute('/moj/assets', '/node_modules/@ministryofjustice/frontend/moj/assets') // DPR forces MoJ assets to load from /moj/assets
  staticRoute('/assets/dpr', '/node_modules/@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/assets')
  staticRoute('/assets/ext/chart.js', '/node_modules/chart.js/dist/chart.umd.js')
  staticRoute(
    '/assets/ext/chartjs-datalabels.js',
    '/node_modules/chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.min.js',
  )
  staticRoute('/assets/ext/day.js', '/node_modules/dayjs/dayjs.min.js')
  staticRoute('/assets/ext/dayjs/plugin/customParseFormat.js', '/node_modules/dayjs/plugin/customParseFormat.js')

  // Don't cache dynamic resources
  router.use(noCache())

  return router
}
