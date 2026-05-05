import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../base/formInitialStep'
import populatePrisonersInLocation from '../../middleware/populatePrisonersInLocation'
import { TypedLocals } from '../../@types/express'
import canEditCna from '../../utils/canEditCna'
import getLocationAttributesIncludePending from '../../utils/getLocationAttributesIncludePending'
import addConstantToLocals from '../../middleware/addConstantToLocals'

export default class ChangeCellCapacity extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(populatePrisonersInLocation())
    this.use(addConstantToLocals('specialistCellTypes'))
  }

  override getInitialValues(_req: FormWizard.Request, res: Response): FormWizard.Values {
    const { certifiedNormalAccommodation, maxCapacity, workingCapacity } = getLocationAttributesIncludePending(
      res.locals.decoratedLocation,
    )

    return { baselineCna: certifiedNormalAccommodation, maxCapacity, workingCapacity }
  }

  override validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    const { values } = req.form
    const { decoratedLocation, prisonerLocation, prisonConfiguration } = res.locals
    const { accommodationTypes, specialistCellTypes } = decoratedLocation.raw
    const occupants = prisonerLocation?.prisoners || []

    const validationErrors: FormWizard.Errors = {}

    super.validateFields(req, res, errors => {
      if (!errors.baselineCna && canEditCna(prisonConfiguration)) {
        if (
          values?.baselineCna === '0' &&
          accommodationTypes.includes('NORMAL_ACCOMMODATION') &&
          !specialistCellTypes.length
        ) {
          validationErrors.baselineCna = this.formError('baselineCna', 'nonZeroForNormalCell')
        }
      }

      if (!errors.workingCapacity) {
        const isNotSpecialType =
          !specialistCellTypes.length ||
          !specialistCellTypes.find(type =>
            res.locals.constants.specialistCellTypes.find(
              constType => constType.key === type && constType.attributes.affectsCapacity,
            ),
          )

        if (
          values?.workingCapacity === '0' &&
          accommodationTypes.includes('NORMAL_ACCOMMODATION') &&
          isNotSpecialType
        ) {
          validationErrors.workingCapacity = this.formError('workingCapacity', 'nonZeroForNormalCell')
        } else if (
          Number(values?.workingCapacity) < occupants.length &&
          accommodationTypes.includes('NORMAL_ACCOMMODATION') &&
          !specialistCellTypes.length
        ) {
          validationErrors.workingCapacity = this.formError('workingCapacity', 'isNoLessThanOccupancy')
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

    const cnaShown = canEditCna(prisonConfiguration)
    const cnaChanged = cnaShown && Number(newBaselineCna) !== baselineCna
    const maxCapChanged = Number(newMaxCap) !== maxCapacity
    const workingCapChanged = Number(newWorkingCap) !== workingCapacity
    const onlyWorkingCapChanged = !cnaChanged && !maxCapChanged && workingCapChanged

    if (!cnaChanged && !maxCapChanged && !workingCapChanged) {
      return res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
    }

    req.sessionModel.set('onlyWorkingCapChanged', onlyWorkingCapChanged)
    if (onlyWorkingCapChanged) {
      req.sessionModel.unset('baselineCna')
      req.sessionModel.unset('maxCapacity')
    }

    return next()
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const { decoratedLocation, prisonConfiguration } = res.locals
    const cnaShown = canEditCna(prisonConfiguration)

    const locals = {
      ...super.locals(req, res),
      insetText: `Cells used for someone to stay in temporarily (such as care and separation, healthcare or special accommodation cells) should have a ${cnaShown ? 'baseline certified normal accommodation and ' : ''}working capacity of 0.`,
    }

    if (decoratedLocation.status === 'DRAFT') {
      locals.buttonText = 'Save cell capacity'
    }

    return locals
  }
}
