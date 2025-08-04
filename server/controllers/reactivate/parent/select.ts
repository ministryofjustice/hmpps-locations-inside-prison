import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../base/formInitialStep'
import getLocationResidentialSummary from './middleware/getLocationResidentialSummary'

export default class ReactivateParentSelect extends FormInitialStep {
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
    const { decoratedLocation } = res.locals
    const backLink = `/view-and-update-locations/${[decoratedLocation.prisonId, decoratedLocation.id].join('/')}`

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
      backLink,
      cancelLink: backLink,
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedLocation, locationResidentialSummary } = res.locals
    const { selectLocations } = req.form.values as { selectLocations: string[] }
    if (locationResidentialSummary.subLocationName === 'Cells' && selectLocations.length === 1) {
      res.redirect(
        `/reactivate/cell/${selectLocations[0]}?ref=parent&refPrisonId=${decoratedLocation.prisonId}&refLocationId=${decoratedLocation.id}`,
      )

      return
    }

    super.successHandler(req, res, next)
  }
}
