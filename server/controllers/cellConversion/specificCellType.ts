import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../base/formInitialStep'
import setStepValidity from '../../lib/setStepValidity'
import { TypedLocals } from '../../@types/express'

export default class CellConversionSpecificCellType extends FormInitialStep {
  override locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const { sessionModel } = req

    if (req.isEditing) {
      const specialistCellTypes = sessionModel.get<string[]>('specialistCellTypes')
      if (specialistCellTypes) {
        // Mark the next step as valid if we have already set the specific cell types
        // so that the journey is still valid if we click back
        setStepValidity(req, '/set-cell-type', true)
      } else {
        // Set the answer to no as we probably clicked back after selecting yes...
        req.sessionModel.set('hasSpecificCellType', 'no', { silent: true })
        res.locals.values.hasSpecificCellType = 'no'
        // and restore any saved cell types
        const previousCellTypes = sessionModel.get<string>('previousCellTypes')
        if (previousCellTypes) {
          sessionModel.updateSessionData({ specialistCellTypes: previousCellTypes })
          sessionModel.save()
        }
        // and set the next step so that it skips the specialist cell types so that the
        // journey is still valid if we click back again
        const journeyHistory = req.journeyModel.get('history') as FormWizard.HistoryStep[]
        const thisStep = journeyHistory.find(step => step.path.includes('/specific-cell-type'))
        thisStep.next = journeyHistory.find(step => step.path.includes('/set-cell-capacity'))?.path
        req.journeyModel.set('history', journeyHistory)
      }

      const workingCapacity = sessionModel.get<string>('workingCapacity')
      const maxCapacity = sessionModel.get<string>('maxCapacity')
      // Make the cell capacity step valid again if we already answered it
      if (workingCapacity && maxCapacity) {
        setStepValidity(req, '/set-cell-capacity', true)
      }
    }

    const locals = super.locals(req, res)

    return {
      ...locals,
    }
  }

  override saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { sessionModel } = req

    if (req.isEditing) {
      sessionModel.unset('previousCellTypes')

      if (req.form.values.hasSpecificCellType === 'yes') {
        // Invalidate the next step to make sure it gets shown again
        // if we changed our answer to yes
        setStepValidity(req, '/set-cell-type', false)
      } else {
        // Clear the specific cell types if we changed our answer to no
        const previousCellTypes = sessionModel.get<string>('specialistCellTypes')
        sessionModel.unset('specialistCellTypes')
        // Invalidate the cell capacity step if the working capacity was set to
        // zero and it is NORMAL_ACCOMMODATION, but save the cell types in case
        // we click back from there and need to restore them
        const accommodationType = sessionModel.get<string>('accommodationType')
        const workingCapacity = sessionModel.get<string>('workingCapacity')
        if (workingCapacity === '0' && accommodationType === 'NORMAL_ACCOMMODATION') {
          setStepValidity(req, '/set-cell-capacity', false)
          sessionModel.set('previousCellTypes', previousCellTypes)
        }
      }
    }

    super.saveValues(req, res, next)
  }
}
