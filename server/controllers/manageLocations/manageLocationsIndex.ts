import { Request, Response } from 'express'
import { singularizeString } from '../../utils/utils'

export default async (req: Request, res: Response) => {
  const { decoratedResidentialSummary: location, prisonId } = res.locals

  const singularizedLocationType = singularizeString(String(location.subLocationName)).toLowerCase()

  return res.render('pages/manageLocations/index', {
    locationType: singularizedLocationType,
    createButton: {
      text: `Create new ${singularizedLocationType}`,
      href: `/manage-locations/${prisonId}/create-new-${singularizedLocationType}`,
      classes: 'govuk-button govuk-button--secondary govuk-!-margin-bottom-3',
      attributes: {
        'data-qa': 'create-button',
      },
    },
  })
}
