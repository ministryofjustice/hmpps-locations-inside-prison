import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../base/formInitialStep'
import backUrl from '../../../utils/backUrl'
import { Location } from '../../../data/types/locationsApi'
import populateLocation from '../../../middleware/populateLocation'

export default class ReactivateParentChangeCapacity extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(this.populateCell)
    this.use(this.resetErrors)
  }

  populateCell(req: FormWizard.Request, res: Response, next: NextFunction) {
    populateLocation({ decorate: true, id: req.params.cellId, localName: 'cell' })(req, res, next)
  }

  resetErrors(req: FormWizard.Request, res: Response, next: NextFunction) {
    const errors: { [key: string]: FormWizard.Controller.Error } = req.sessionModel.get('errors')
    if (errors) {
      Object.keys(errors)
        .filter(k => !['workingCapacity', 'maxCapacity'].includes(k))
        .forEach(k => {
          delete errors[k]
        })
    }

    next()
  }

  getInitialValues(req: FormWizard.Request, res: Response) {
    const { cell } = res.locals
    const capacityChanges: { [id: string]: Partial<Location['capacity']> } = (req.sessionModel.get('capacityChanges') ||
      {}) as typeof capacityChanges

    return {
      maxCapacity: cell.capacity.maxCapacity,
      workingCapacity: cell.oldWorkingCapacity,
      ...capacityChanges[cell.id],
    }
  }

  validateFields(req: FormWizard.Request, res: Response, callback: (errors: any) => void) {
    super.validateFields(req, res, errors => {
      const { values } = req.form
      const { cell } = res.locals
      const { accommodationTypes, specialistCellTypes }: Location = cell.raw
      const validationErrors: any = {}

      if (!errors.workingCapacity) {
        if (
          values?.workingCapacity === '0' &&
          accommodationTypes.includes('NORMAL_ACCOMMODATION') &&
          !specialistCellTypes.length
        ) {
          validationErrors.workingCapacity = this.formError('workingCapacity', 'nonZeroForNormalCell')
        }
      }

      callback({ ...errors, ...validationErrors })
    })
  }

  locals(req: FormWizard.Request, res: Response) {
    const locals = super.locals(req, res)
    const { location } = res.locals
    const backLink = backUrl(req, { fallbackUrl: `/reactivate/parent/${location.id}/check-capacity` })
    const cancelLink = `/view-and-update-locations/${[location.prisonId, location.id].join('/')}`

    return {
      ...locals,
      backLink,
      cancelLink,
    }
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { cell } = res.locals
    const maxCapacity = Number(req.form.values.maxCapacity)
    const workingCapacity = Number(req.form.values.workingCapacity)

    const capacityChanges: { [id: string]: Partial<Location['capacity']> } = (req.sessionModel.get('capacityChanges') ||
      {}) as typeof capacityChanges
    const cellChanges: Partial<Location['capacity']> = {}
    if (maxCapacity !== cell.capacity?.maxCapacity) {
      cellChanges.maxCapacity = maxCapacity
    }
    if (workingCapacity !== cell.capacity?.workingCapacity) {
      cellChanges.workingCapacity = workingCapacity
    }
    if (Object.keys(cellChanges).length) {
      capacityChanges[cell.id] = cellChanges
    } else {
      delete capacityChanges[cell.id]
    }

    req.sessionModel.set('capacityChanges', capacityChanges)

    next()
  }
}