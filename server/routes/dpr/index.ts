import { Request, Response, Router } from 'express'
import ReportListUtils from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/components/report-list/utils'
import config from '../../config'
import { Services } from '../../services'
import { ManagementReportDefinition } from '../../data/types/locationsApi/managementReportDefinition'
import LocationsService from '../../services/locationsService'
import addBreadcrumb from '../../middleware/addBreadcrumb'
import populateBreadcrumbsForLocation from '../../middleware/populateBreadcrumbsForLocation'

let definitionsRoutesInitialised: boolean = false

async function populateRoutes(
  locationService: LocationsService,
  token: string,
  router: Router,
): Promise<ManagementReportDefinition[]> {
  const allDefinitions = await locationService.getManagementReportDefinitions(token)
  if (definitionsRoutesInitialised === false) {
    for (const definition of allDefinitions) {
      for (const variant of definition.variants) {
        router.get(
          `/management-reporting/${definition.id}-${variant.id}`,
          ReportListUtils.createReportListRequestHandler({
            title: variant.name,
            definitionName: definition.id,
            variantName: variant.id,
            apiUrl: config.apis.locationsApi.url,
            apiTimeout: config.apis.locationsApi.timeout.deadline,
            layoutTemplate: 'partials/dprLayout.njk',
            tokenProvider: (_, res: Response) => {
              return res.locals.systemToken
            },
          }),
        )
      }
    }
    definitionsRoutesInitialised = true
  }
  return allDefinitions
}

// eslint-disable-next-line import/prefer-default-export
export function dprRouter(router: Router, services: Services): Router {
  if (config.loadReportDefinitionsOnStartup === true && definitionsRoutesInitialised === false) {
    services.authService.getSystemClientToken().then(token => populateRoutes(services.locationsService, token, router))
  }

  router.get('/management-reporting', async (req, res) => {
    const definitions = await populateRoutes(services.locationsService, res.locals.systemToken, router)
    res.render('pages/managementReporting/index.njk', { definitions })
  })

  return router
}
