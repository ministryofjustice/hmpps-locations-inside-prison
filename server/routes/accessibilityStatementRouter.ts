import { Router } from 'express'

const router = Router()

router.get('/accessibility-statement', (_req, res) => {
  res.locals.breadcrumbs = []
  res.render('pages/accessibilityStatement')
})

export default router
