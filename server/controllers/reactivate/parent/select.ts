import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../base/formInitialStep'
import getLocationResidentialSummary from './middleware/getLocationResidentialSummary'
import { Location } from '../../../data/types/locationsApi'
import { LocationResidentialSummary } from '../../../data/types/locationsApi/locationResidentialSummary'

export default class ReactivateParentSelect extends FormInitialStep {
  middlewareSetup() {
    this.use(getLocationResidentialSummary)
    this.use(this.populateItems)
    super.middlewareSetup()
  }

  async populateItems(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { locationResidentialSummary }: { locationResidentialSummary: LocationResidentialSummary } =
      res.locals as unknown as { locationResidentialSummary: LocationResidentialSummary }
    const { selectLocations } = req.form.options.fields
    selectLocations.items = locationResidentialSummary.subLocations.map(l => ({
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

  locals(req: FormWizard.Request, res: Response) {
    const { location } = res.locals
    const backLink = `/view-and-update-locations/${[location.prisonId, location.id].join('/')}`

    const { form } = req
    const { fields } = form.options
    const { selectLocations } = form.values

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

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const {
      location,
      locationResidentialSummary,
    }: { location: Location; locationResidentialSummary: LocationResidentialSummary } = res.locals as unknown as {
      location: Location
      locationResidentialSummary: LocationResidentialSummary
    }
    const { selectLocations } = req.form.values
    if (locationResidentialSummary.subLocationName === 'Cells' && selectLocations.length === 1) {
      res.redirect(
        `/reactivate/cell/${selectLocations[0]}?ref=parent&refPrisonId=${location.prisonId}&refLocationId=${location.id}`,
      )

      return
    }

    super.successHandler(req, res, next)
  }
}
