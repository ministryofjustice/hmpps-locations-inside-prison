import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'

export default class EditCellsInit extends FormInitialStep {
  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location, subLocations } = res.locals.decoratedResidentialSummary

    if (location.pendingApprovalRequestId) {
      res.redirect(`/view-and-update-locations/${location.prisonId}/${location.id}`)
      return
    }

    req.sessionModel.set('localName', location.localName)
    req.sessionModel.set('locationType', location.locationType)
    req.sessionModel.set('locationId', location.id)

    // Set values for create-cells transaction

    const cellsWithoutSanitation = subLocations
      .filter(l => !l.inCellSanitation)
      .map(l => subLocations.indexOf(l).toString())

    req.sessionModel.set('create-cells_cellsToCreate', subLocations.length.toString())
    req.sessionModel.set('create-cells_accommodationType', location.raw.accommodationTypes[0])
    req.sessionModel.set('create-cells_usedFor', location.raw.usedFor)
    req.sessionModel.set('create-cells_bulkSanitation', !cellsWithoutSanitation.length ? 'YES' : 'NO')
    req.sessionModel.set('create-cells_withoutSanitation', cellsWithoutSanitation)
    subLocations.forEach((subLocation, i) => {
      req.sessionModel.set(`create-cells_cellNumber${i}`, subLocation.code)
      req.sessionModel.set(`create-cells_doorNumber${i}`, subLocation.cellMark)
      req.sessionModel.set(
        `create-cells_baselineCna${i}`,
        subLocation.pendingChanges.certifiedNormalAccommodation.toString(),
      )
      req.sessionModel.set(`create-cells_workingCapacity${i}`, subLocation.pendingChanges.workingCapacity.toString())
      req.sessionModel.set(`create-cells_maximumCapacity${i}`, subLocation.pendingChanges.maxCapacity.toString())
      if (subLocation.raw.specialistCellTypes.length) {
        req.sessionModel.set(`saved-cellTypes${i}`, subLocation.raw.specialistCellTypes)
      }
    })

    // Manually set history so that the edit links work

    const transactionPaths = [
      '',
      '/create-cells/details',
      '/create-cells/cell-numbers',
      '/create-cells/door-numbers',
      '/create-cells/capacities',
      '/create-cells/used-for',
      '/create-cells/bulk-sanitation',
      '/create-cells/without-sanitation',
      '/confirm',
    ]

    req.journeyModel.set(
      'history',
      transactionPaths
        .map((path, index) => {
          if (index === transactionPaths.length - 1) {
            return null
          }

          return {
            path: req.baseUrl + path,
            next: req.baseUrl + transactionPaths[index + 1],
            wizard: 'edit-cells',
            ...(path === '' ? { skip: true } : {}),
          }
        })
        .filter(s => s),
    )

    super.successHandler(req, res, next)
  }
}
