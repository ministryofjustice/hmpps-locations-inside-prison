import { Request, Response } from 'express'
import { TypedLocals } from '../../@types/express'
import { singularizeString } from '../../utils/utils'

export default async (req: Request, res: Response) => {
  const locals: TypedLocals = {
    title: 'Manage locations',
    minLayout: 'three-quarters',
  }

  const success = req.flash('success')
  if (success?.length) {
    locals.banner = {
      success: success[0],
    }
  }

  if (req.canAccess('create_location')) {
    const { decoratedResidentialSummary: summary } = res.locals
    const singularizedLocationType = singularizeString(String(summary.subLocationName)).toLowerCase()

    locals.createButton = {
      text: `Create new ${singularizedLocationType}`,
      href: `/create-new/${res.locals.prisonId}`,
      classes: 'govuk-button govuk-button--secondary govuk-!-margin-bottom-3',
      attributes: {
        'data-qa': 'create-button',
      },
    }
  }

  return res.render('pages/viewLocations/index', locals)
}
