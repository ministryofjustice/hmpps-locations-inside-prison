import { Request, Router } from 'express'
import ReportListUtils from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/components/report-list/utils'
import config from '../../config'
import { Services } from '../../services'
import { ManagementReportDefinition } from '../../data/types/locationsApi/managementReportDefinition'
import LocationsService from '../../services/locationsService'
import protectRoute from '../../middleware/protectRoute'
import addBreadcrumb from '../../middleware/addBreadcrumb'

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
          protectRoute('reporting_location_information'),
          addBreadcrumb({ title: 'Management reporting', href: '/management-reporting' }),
          addBreadcrumb({ title: variant.name, href: `/management-reporting/${definition.id}-${variant.id}` }),
          ReportListUtils.createReportListRequestHandler({
            title: variant.name,
            definitionName: definition.id,
            variantName: variant.id,
            apiUrl: config.apis.locationsApi.url,
            apiTimeout: config.apis.locationsApi.timeout.deadline,
            layoutTemplate: 'partials/dprLayout.njk',
            tokenProvider: (req: Request) => {
              return req.session.systemToken
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

  router.get(
    '/management-reporting',
    protectRoute('reporting_location_information'),
    addBreadcrumb({ title: 'Management reporting', href: '/management-reporting' }),
    async (req, res) => {
      const definitions = await populateRoutes(services.locationsService, req.session.systemToken, router)
      res.render('pages/managementReporting/index.njk', { definitions })
    },
  )

  return router
}
