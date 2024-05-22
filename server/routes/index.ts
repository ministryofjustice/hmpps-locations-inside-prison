import { Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import { Page } from '../services/auditService'
import populateCards from '../middleware/populateCards'

export default function routes({ auditService }: Services): Router {
  const router = Router()

  router.get(
    '/',
    populateCards(),
    asyncMiddleware(async (req, res) => {
      await auditService.logPageView(Page.EXAMPLE_PAGE, { who: res.locals.user.username, correlationId: req.id })

      res.render('pages/index')
    }),
  )

  return router
}
