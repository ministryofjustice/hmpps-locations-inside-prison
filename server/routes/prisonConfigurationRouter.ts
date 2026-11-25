import { Router } from 'express'

import prisonConfiguration from '../controllers/prisonConfiguration'
import addBreadcrumb from '../middleware/addBreadcrumb'
import addRootBreadcrumb from '../middleware/addRootBreadcrumb'
import asyncMiddleware from '../middleware/asyncMiddleware'
import protectRoute from '../middleware/protectRoute'
import type { Services } from '../services'

// National rather than caseload-scoped: an administrator can switch any prison on or off, whatever their caseload.
export default function prisonConfigurationRouter(_services: Services): Router {
  const router = Router()

  router.use(protectRoute('administer_residential'), addRootBreadcrumb)
  router.get(
    '/',
    addBreadcrumb({ title: 'Manage prisons', href: '/prison-configuration' }),
    asyncMiddleware(prisonConfiguration.list),
  )
  router.post('/:prisonId/:setting', asyncMiddleware(prisonConfiguration.update))

  return router
}
