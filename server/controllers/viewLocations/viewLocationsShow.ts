import { Request, Response } from 'express'

export default async (req: Request, res: Response) => {
  const { location } = res.locals.residentialSummary
  const { active, isResidential, leafLevel } = location

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

  const actions: { text: string; href: string }[] = []
  if (req.canAccess('convert_non_residential') && active && isResidential && leafLevel) {
    actions.push({
      text: 'Convert to non-residential room',
      href: `/location/${location.id}/non-residential-conversion`,
    })
  }

  return res.render('pages/viewLocations/show', {
    actions,
    banner,
  })
}
