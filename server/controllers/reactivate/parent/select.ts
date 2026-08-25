import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormStep from '../../base/formStep'
import getLocationResidentialSummary from './middleware/getLocationResidentialSummary'
import paths from '../../../utils/paths'

export default class ReactivateParentSelect extends FormStep {
  override middlewareSetup() {
    this.use(getLocationResidentialSummary)
    this.use(this.populateItems)
    super.middlewareSetup()
  }

  async populateItems(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { locationResidentialSummary } = res.locals
    const { selectLocations } = req.form.options.fields
    selectLocations.items = locationResidentialSummary.subLocations
      .filter(l => {
        return l.locationType !== 'ROOM' || l.isResidential
      })
      .map(l => ({
        text: l.localName || l.pathHierarchy,
        value: l.id,
      }))
    selectLocations.fieldset.legend.text = selectLocations.fieldset.legend.text.replace(
      'CHILD_TYPE',
      locationResidentialSummary.subLocationName.toLowerCase(),
    )
    selectLocations.errorMessages.required = selectLocations.errorMessages.required.replace(
      'CHILD_TYPE',
      locationResidentialSummary.subLocationName.toLowerCase(),
    )

    next()
  }

  override locals(req: FormWizard.Request, res: Response) {
    const { locationResidentialSummary } = res.locals

    const { form } = req
    const { fields } = form.options
    const { selectLocations } = form.values as { selectLocations: string[] }

    if (selectLocations) {
      fields.selectLocations.items = fields.selectLocations.items.map(item => ({
        ...item,
        checked: selectLocations.includes(item.value),
      }))
    }

    return {
      ...super.locals(req, res),
      title: `Activate individual ${locationResidentialSummary.subLocationName.toLowerCase()}`,
      minLayout: 'one-half',
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedLocation, locationResidentialSummary } = res.locals
    const { selectLocations } = req.form.values as { selectLocations: string[] }
    if (locationResidentialSummary.subLocationName === 'Cells' && selectLocations.length === 1) {
      res.redirect(
        `${paths.location.reactivate.cell(
          res.locals.prisonId,
          selectLocations[0],
        )}?ref=parent&refPrisonId=${decoratedLocation.prisonId}&refLocationId=${decoratedLocation.id}`,
      )

      return
    }

    super.successHandler(req, res, next)
  }
}
