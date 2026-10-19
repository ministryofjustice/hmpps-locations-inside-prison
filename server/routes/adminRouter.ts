import express from 'express'
import logPageView from '../middleware/logPageView'
import { Page } from '../services/auditService'
import type { Services } from '../services'
import addBreadcrumb from '../middleware/addBreadcrumb'
import adminIndex from '../controllers/adminIndex'
import getServicePrisonsNonHousingDisplay, {
  getSplashScreenStatus,
} from '../middleware/getServicePrisonsNonHousingDisplay'
import protectRoute from '../middleware/protectRoute'
import changeResiStatusRouter from './admin/resi'
import changeIncludeSegInRollCountStatusRouter from './admin/segInRollCount'
import changeCertApprovalStatusRouter from './admin/certApproval'

const controller = (services: Services) => {
  const router = express.Router({ mergeParams: true })

  router.get(
    '/',
    protectRoute('administer_residential'),
    addBreadcrumb({ title: '', href: '/' }),
    getServicePrisonsNonHousingDisplay(),
    getSplashScreenStatus(),
    logPageView(services.auditService, Page.LOCATION_ADMIN),
    adminIndex,
  )
  router.use('/change-resi-status', changeResiStatusRouter)
  router.use('/change-include-seg-in-roll-count', changeIncludeSegInRollCountStatusRouter)
  router.use('/change-certification-status', changeCertApprovalStatusRouter)

  return router
}

export default controller
