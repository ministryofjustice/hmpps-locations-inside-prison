import { Request, Response } from 'express'
import { singularizeString } from '../../utils/utils'
import { TypedLocals } from '../../@types/express'
import addAction from '../../middleware/addAction'

export default async (req: Request, res: Response) => {
  const locals: TypedLocals = {
    title: 'Manage locations',
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
    if (!leafLevel && summary.subLocationName !== 'Cells') {
      const singularizedLocationType = singularizeString(summary.subLocationName).toLowerCase()

      locals.createButton = {
        text: `Create new ${singularizedLocationType}`,
        href: `/create-new/${location.id}`,
        classes: 'govuk-button govuk-button--secondary govuk-!-margin-bottom-3',
        attributes: {
          'data-qa': 'create-button',
        },
      }
    } else if (summary.subLocationName === 'Cells') {
      locals.createButton = {
        text: 'Create new cells',
        href: `/create-cells/${location.id}`,
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
      class: 'govuk-button--secondary',
      href: `/location/${location.id}/cell-conversion`,
    })(req, res, null)
  }
  return res.render('pages/viewLocations/show', locals)
}
