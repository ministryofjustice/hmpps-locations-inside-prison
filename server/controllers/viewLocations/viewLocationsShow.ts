import { Request, Response } from 'express'
import { singularizeString } from '../../utils/utils'
import { TypedLocals } from '../../@types/express'
import addAction from '../../middleware/addAction'

export default async (req: Request, res: Response) => {
  const locals: TypedLocals = {
    title: 'View and update locations',
  }

  const { decoratedResidentialSummary: summary } = res.locals
  const { location } = summary
  const { active, isResidential, leafLevel } = location

  const success = req.flash('success')
  if (success?.length) {
    locals.banner = {
      success: success[0],
    }
  }

  if (req.featureFlags.createAndCertify && req.canAccess('create_location')) {
    locals.title = 'Manage locations'

    if (!leafLevel) {
      const singularizedLocationType = singularizeString(String(summary.subLocationName)).toLowerCase()

      locals.createButton = {
        text: `Create new ${singularizedLocationType}`,
        href: `/create-new/${location.id}`,
        classes: 'govuk-button govuk-button--secondary govuk-!-margin-bottom-3',
        attributes: {
          'data-qa': 'create-button',
        },
      }
    }
  }

  if (req.canAccess('convert_non_residential') && active && !isResidential && leafLevel) {
    addAction({
      text: 'Convert to cell',
      href: `/location/${location.id}/cell-conversion`,
    })(req, res, null)
  }
  return res.render('pages/viewLocations/show', locals)
}
