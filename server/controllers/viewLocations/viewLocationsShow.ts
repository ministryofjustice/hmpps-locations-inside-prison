import { Request, Response } from 'express'

export default async (req: Request, res: Response) => {
  const { location } = res.locals.residentialSummary
  const { active, isResidential, leafLevel } = location
  let actionButton

  const banner: {
    success?: {
      title: string
      content: string
    }
  } = {}

  const success = req.flash('success')
  if (success?.length) {
    banner.success = success[0]
  }

  if (req.canAccess('convert_non_residential') && active && !isResidential && leafLevel) {
    actionButton = {
      text: 'Convert to cell',
      href: `/location/${location.id}/cell-conversion`,
      classes: 'govuk-!-float-right',
    }
  }
  return res.render('pages/viewLocations/show', {
    actionButton,
    banner,
  })
}
