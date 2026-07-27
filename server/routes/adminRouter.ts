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
import changeNonResiStatusRouter from './admin/nonResi'
import changeIncludeSegInRollCountStatusRouter from './admin/segInRollCount'
import changeCertApprovalStatusRouter from './admin/certApproval'
import changeNomisScreenStatusRouter from './admin/nomisScreen'
import ingestRouter from './admin/ingest'

const router = express.Router({ mergeParams: true })

const controller = (services: Services) => {
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
  router.use('/change-non-resi-status', changeNonResiStatusRouter)
  router.use('/change-include-seg-in-roll-count', changeIncludeSegInRollCountStatusRouter)
  router.use('/change-certification-status', changeCertApprovalStatusRouter)
  router.use('/change-nomis-screen-status/:moduleName', changeNomisScreenStatusRouter)
  router.use('/ingest-cert', ingestRouter)

  return router
}

export default controller
