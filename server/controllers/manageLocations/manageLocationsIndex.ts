import { Request, Response } from 'express'
import { singularizeString } from '../../utils/utils'

export default async (req: Request, res: Response) => {
  const { decoratedResidentialSummary: location, prisonId } = res.locals

  const banner: {
    success?: {
      title: string
      content: string
    }
  } = {}

  const success = req.flash('success')
  if (success?.length) {
    ;[banner.success] = success
  }
  return res.render('pages/manageLocations/index', {
    createButton: {
      text: `Create new ${singularizeString(String(location.subLocationName)).toLowerCase()}`,
      href: `/manage-locations/${prisonId}/create-new-wing`,
      classes: 'govuk-button govuk-button--secondary govuk-!-margin-bottom-3',
      attributes: {
        'data-qa': 'create-button',
      },
    },
    locationType: location.subLocationName,
    banner,
  })
}
