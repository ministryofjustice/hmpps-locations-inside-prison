import express from 'express'
import type { Services } from '../services'

import cellConversionRouter from './cellConversion'
import changeCellCapacityRouter from './changeCellCapacity'
import deactivateRouter from './deactivate'
import nonResidentialConversionRouter from './nonResidentialConversion'
import removeCellTypeRouter from './removeCellType'
import changeTemporaryDeactivationDetailsRouter from './changeTemporaryDeactivationDetails'
import setCellTypeRouter from './setCellType'
import changeCellTypeRouter from './changeCellType'
import changeNonResidentialTypeRouter from './changeNonResidentialType'
import changeUsedForRouter from './changeUsedFor'
import changeDoorNumberRouter from './changeDoorNumber'
import changeSanitationRouter from './changeSanitation'
import changeLocationCodeRouter from './changeLocationCode'
import locationHistoryRouter from './locationHistoryRouter'
import setLocalNameRouter from './setLocalName'
import changeLocalNameRouter from './changeLocalName'
import removeLocalNameRouter from './removeLocalName'
import workingCapacityMismatch from './workingCapacityMismatch'
import archiveLocationRouter from './archiveLocation'
import createCellsRouter from './createCells'
import deleteDraftLocationRouter from './deleteDraftLocation'
import editCellsRouter from './editCells'
import addToCertificateRouter from './addToCertificate'
import populatePrisonAndLocationId from '../middleware/populatePrisonAndLocationId'
import reactivateCellRouter from './reactivate/cell'
import reactivateLocationRouter from './reactivate/location'
import reactivateParentRouter from './reactivate/parent'

const locationRouter = (services: Services) => {
  const router = express.Router({ mergeParams: true })

  router.use(populatePrisonAndLocationId)

  router.use('/add-local-name', setLocalNameRouter)
  router.use('/add-to-certificate', addToCertificateRouter)
  router.use('/archive', archiveLocationRouter)
  router.use('/cell-conversion', cellConversionRouter)
  router.use('/change-cell-capacity', changeCellCapacityRouter)
  router.use('/change-cell-type', changeCellTypeRouter)
  router.use('/change-door-number', changeDoorNumberRouter)
  router.use('/change-local-name', changeLocalNameRouter)
  router.use('/change-location-code', changeLocationCodeRouter)
  router.use('/change-non-residential-type', changeNonResidentialTypeRouter)
  router.use('/change-sanitation', changeSanitationRouter)
  router.use('/change-temporary-deactivation-details', changeTemporaryDeactivationDetailsRouter)
  router.use('/change-used-for', changeUsedForRouter)
  router.use('/create-cells', createCellsRouter)
  router.use('/deactivate', deactivateRouter)
  router.use('/delete', deleteDraftLocationRouter)
  router.use('/edit-cells', editCellsRouter)
  router.use('/history', locationHistoryRouter(services))
  router.use('/non-residential-conversion', nonResidentialConversionRouter)
  router.use('/reactivate/cell', reactivateCellRouter)
  router.use('/reactivate/location', reactivateLocationRouter)
  router.use('/reactivate/parent', reactivateParentRouter)
  router.use('/remove-cell-type', removeCellTypeRouter)
  router.use('/remove-local-name', removeLocalNameRouter)
  router.use('/set-cell-type', setCellTypeRouter)
  router.use('/working-capacity-mismatch', workingCapacityMismatch)

  return router
}

export default locationRouter
