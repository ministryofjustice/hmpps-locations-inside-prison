import { Router } from 'express'

import functionalMailboxesIndex from '../controllers/functionalMailboxes/index'
import functionalMailboxForm from '../controllers/functionalMailboxes/form'
import functionalMailboxDelete from '../controllers/functionalMailboxes/delete'
import addBreadcrumb from '../middleware/addBreadcrumb'
import addRootBreadcrumb from '../middleware/addRootBreadcrumb'
import asyncMiddleware from '../middleware/asyncMiddleware'
import logPageView from '../middleware/logPageView'
import protectRoute from '../middleware/protectRoute'
import type { Services } from '../services'
import { Page } from '../services/auditService'

export default function functionalMailboxesRouter(services: Services): Router {
  const router = Router()

  router.use(protectRoute('administer_residential'), addRootBreadcrumb)
  router.get(
    '/',
    addBreadcrumb({ title: 'Manage functional mailboxes', href: '/functional-mailboxes' }),
    logPageView(services.auditService, Page.FUNCTIONAL_MAILBOXES),
    asyncMiddleware(functionalMailboxesIndex),
  )
  router.get('/default/add', asyncMiddleware(functionalMailboxForm.addDefault))
  router.post('/default/add', asyncMiddleware(functionalMailboxForm.saveDefault))
  router.get('/default/:notificationGroup/edit', asyncMiddleware(functionalMailboxForm.editDefault))
  router.post('/default/:notificationGroup/edit', asyncMiddleware(functionalMailboxForm.saveDefault))
  router.get('/default/:notificationGroup/delete', asyncMiddleware(functionalMailboxDelete.confirmDefault))
  router.post('/default/:notificationGroup/delete', asyncMiddleware(functionalMailboxDelete.deleteDefault))
  router.get('/prison/add', asyncMiddleware(functionalMailboxForm.addPrison))
  router.post('/prison/add', asyncMiddleware(functionalMailboxForm.savePrison))
  router.get('/prison/:prisonId/:notificationGroup/edit', asyncMiddleware(functionalMailboxForm.editPrison))
  router.post('/prison/:prisonId/:notificationGroup/edit', asyncMiddleware(functionalMailboxForm.savePrison))
  router.get('/prison/:prisonId/:notificationGroup/delete', asyncMiddleware(functionalMailboxDelete.confirmPrison))
  router.post('/prison/:prisonId/:notificationGroup/delete', asyncMiddleware(functionalMailboxDelete.deletePrison))

  return router
}
