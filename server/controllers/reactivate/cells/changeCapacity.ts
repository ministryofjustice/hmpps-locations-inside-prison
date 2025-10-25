import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../base/formInitialStep'
import populateLocation from '../../../middleware/populateLocation'
import { Location } from '../../../data/types/locationsApi'
import capFirst from '../../../formatters/capFirst'

export default class ReactivateCellsChangeCapacity extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(populateLocation())
    this.use(this.resetErrors)
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

  override getInitialValues(req: FormWizard.Request, res: Response): FormWizard.Values {
    const { location } = res.locals
    const capacityChanges: { [id: string]: Partial<Location['capacity']> } = (req.sessionModel.get('capacityChanges') ||
      {}) as typeof capacityChanges

    return {
      maxCapacity: location.capacity.maxCapacity,
      workingCapacity: location.oldWorkingCapacity,
      ...capacityChanges[location.id],
    }
  }

  override validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, errors => {
      const { values } = req.form
      const { location } = res.locals
      const { accommodationTypes, specialistCellTypes }: Location = location
      const validationErrors: FormWizard.Errors = {}

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

  override locals(req: FormWizard.Request, res: Response) {
    const locals = super.locals(req, res)
    const { location } = res.locals
    const referrerPrisonId = req.sessionModel.get('referrerPrisonId')
    const referrerLocationId = req.sessionModel.get('referrerLocationId')
    const cancelLink = `/inactive-cells/${[referrerPrisonId, referrerLocationId].filter(i => i).join('/')}`

    return {
      ...locals,
      cancelLink,
      cancelText: 'cancel',
      title: 'Change cell capacity',
      titleCaption: `${capFirst(location.locationType.toLowerCase())} ${location.localName || location.pathHierarchy}`,
      insetText:
        'Cells used for someone to stay in temporarily (such as care and separation, healthcare or special accommodation cells) should have a working capacity of 0.',
    }
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location } = res.locals
    const maxCapacity = Number(req.form.values.maxCapacity)
    const workingCapacity = Number(req.form.values.workingCapacity)

    const capacityChanges: { [id: string]: Partial<Location['capacity']> } = (req.sessionModel.get('capacityChanges') ||
      {}) as typeof capacityChanges
    const cellChanges: Partial<Location['capacity']> = {}
    if (maxCapacity !== location.capacity?.maxCapacity) {
      cellChanges.maxCapacity = maxCapacity
    }
    if (workingCapacity !== location.capacity?.workingCapacity) {
      cellChanges.workingCapacity = workingCapacity
    }
    if (Object.keys(cellChanges).length) {
      capacityChanges[location.id] = cellChanges
    } else {
      delete capacityChanges[location.id]
    }

    req.sessionModel.set('capacityChanges', capacityChanges)

    next()
  }
}
