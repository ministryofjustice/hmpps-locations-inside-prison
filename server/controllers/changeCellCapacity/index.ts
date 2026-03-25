import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../utils/backUrl'
import FormInitialStep from '../base/formInitialStep'
import populatePrisonersInLocation from '../../middleware/populatePrisonersInLocation'
import { TypedLocals } from '../../@types/express'
import capFirst from '../../formatters/capFirst'
import canEditCna from '../../utils/canEditCna'
import getLocationAttributesIncludePending from '../../utils/getLocationAttributesIncludePending'

export default class ChangeCellCapacity extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(populatePrisonersInLocation())
  }

  override getInitialValues(_req: FormWizard.Request, res: Response): FormWizard.Values {
    const { certifiedNormalAccommodation, maxCapacity, workingCapacity } = getLocationAttributesIncludePending(
      res.locals.decoratedLocation,
    )

    return { baselineCna: certifiedNormalAccommodation, maxCapacity, workingCapacity }
  }

  override validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    const { values } = req.form
    const { decoratedLocation, prisonerLocation } = res.locals
    const { accommodationTypes, specialistCellTypes } = decoratedLocation.raw
    const occupants = prisonerLocation?.prisoners || []

    const validationErrors: FormWizard.Errors = {}

    super.validateFields(req, res, errors => {
      if (!errors.baselineCna && canEditCna(res.locals.prisonConfiguration, res.locals.decoratedLocation)) {
        if (
          values?.baselineCna === '0' &&
          accommodationTypes.includes('NORMAL_ACCOMMODATION') &&
          !specialistCellTypes.length
        ) {
          validationErrors.baselineCna = this.formError('baselineCna', 'nonZeroForNormalCell')
        }
      }

      if (!errors.workingCapacity) {
        if (
          values?.workingCapacity === '0' &&
          accommodationTypes.includes('NORMAL_ACCOMMODATION') &&
          !specialistCellTypes.length
        ) {
          validationErrors.workingCapacity = this.formError('workingCapacity', 'nonZeroForNormalCell')
        }
      }

      if (!errors.maxCapacity) {
        if (Number(values?.maxCapacity) < occupants.length) {
          validationErrors.maxCapacity = this.formError('maxCapacity', 'isNoLessThanOccupancy')
        }
      }

      callback({ ...errors, ...validationErrors })
    })
  }

  override validate(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedLocation, prisonConfiguration } = res.locals
    const { id: locationId, prisonId } = decoratedLocation
    const { maxCapacity: newMaxCap, workingCapacity: newWorkingCap, baselineCna: newBaselineCna } = req.form.values
    const { maxCapacity, workingCapacity, baselineCna } = this.getInitialValues(req, res)

    if (
      (!canEditCna(prisonConfiguration, decoratedLocation) || Number(newBaselineCna) === baselineCna) &&
      Number(newMaxCap) === maxCapacity &&
      Number(newWorkingCap) === workingCapacity
    ) {
      return res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
    }

    return next()
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const { decoratedLocation, prisonConfiguration } = res.locals
    const { displayName, id: locationId, prisonId } = decoratedLocation
    const showCna = canEditCna(prisonConfiguration, decoratedLocation)

    const cancelLink = backUrl(req, {
      fallbackUrl: `/view-and-update-locations/${prisonId}/${locationId}`,
      nextStepUrl: `/location/${locationId}/change-cell-capacity/confirm`,
    })

    const locals = {
      ...super.locals(req, res),
      backLink: cancelLink,
      cancelLink,
      title: `Change cell capacity`,
      insetText: `Cells used for someone to stay in temporarily (such as care and separation, healthcare or special accommodation cells) should have a ${showCna ? 'baseline certified normal accommodation and ' : ''}working capacity of 0.`,
      titleCaption: capFirst(displayName),
    }

    if (showCna) {
      locals.buttonText = 'Save cell capacity'
    }

    return locals
  }
}
