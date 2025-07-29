import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import setStepValidity from '../../lib/setStepValidity'
import { TypedLocals } from '../../@types/express'

export default class CellConversionAccommodationType extends FormInitialStep {
  async configure(req: FormWizard.Request, res: Response, next: NextFunction) {
    const accommodationTypes = (
      await req.services.locationsService.getAccommodationTypes(req.session.systemToken)
    ).filter(type => type.key !== 'OTHER_NON_RESIDENTIAL')

    req.form.options.fields.accommodationType.items = Object.values(accommodationTypes).map(({ key, description }) => ({
      text: description,
      value: key,
    }))

    next()
  }

  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const { sessionModel } = req

    if (req.isEditing) {
      const usedForTypes = sessionModel.get<string[]>('usedForTypes')
      if (usedForTypes) {
        // Mark the next step as valid if we have already set the used for types
        // so that the journey is still valid if we click back
        setStepValidity(req, '/used-for', true)
      } else {
        // and set the next step so that it skips the used for types so that the
        // journey is still valid if we click back again
        const journeyHistory = req.journeyModel.get('history') as FormWizard.HistoryStep[]
        const thisStep = journeyHistory.find(step => step.path.includes('/accommodation-type'))
        thisStep.next = journeyHistory.find(step => step.path.includes('/specific-cell-type'))?.path
        req.journeyModel.set('history', journeyHistory)
      }

      const workingCapacity = sessionModel.get<string>('workingCapacity')
      const maxCapacity = sessionModel.get<string>('maxCapacity')
      // Make the cell capacity step valid again if we already answered it
      if (workingCapacity && maxCapacity) {
        setStepValidity(req, '/set-cell-capacity', true)
      }

      const accommodationType = sessionModel.get<string>('accommodationType')
      const specialistCellTypes = sessionModel.get<string[]>('specialistCellTypes')
      if (accommodationType === 'NORMAL_ACCOMMODATION') {
        if (!usedForTypes || (!specialistCellTypes?.length && workingCapacity === '0')) {
          // Restore the saved accomodation type as we probably clicked back...
          const previousAccommodationType = sessionModel.get<string>('previousAccommodationType')
          if (previousAccommodationType) {
            sessionModel.updateSessionData({ accommodationType: previousAccommodationType, usedForTypes: undefined })
            sessionModel.save()
            res.locals.values.accommodationType = previousAccommodationType
          }
        }
      }
    }

    return super.locals(req, res)
  }

  saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { accommodationType } = req.form.values
    const { sessionModel } = req

    if (req.isEditing) {
      if (accommodationType === 'NORMAL_ACCOMMODATION') {
        // If we changed our answer to NORMAL_ACCOMMODATION, invalidate
        // the next step to make sure it gets shown again, but store
        // the old value so that we can restore it if they click back
        const previousAccommodationType = sessionModel.get<string>('accommodationType')
        sessionModel.set('previousAccommodationType', previousAccommodationType)
        setStepValidity(req, '/used-for', false)
        // Invalidate the cell capacity step if working cap is zero and
        // has no specific cell types
        const workingCapacity = sessionModel.get<string>('workingCapacity')
        const specialistCellTypes = sessionModel.get<string[]>('specialistCellTypes')
        if (workingCapacity === '0' && !specialistCellTypes?.length) {
          setStepValidity(req, '/set-cell-capacity', false)
        }
      } else {
        // Clear the used for types and saved accommodation type if we changed
        // our answer to something other than NORMAL_ACCOMMODATION
        sessionModel.unset('usedForTypes')
        sessionModel.unset('previousAccommodationType')
      }
    }

    super.saveValues(req, res, next)
  }
}
