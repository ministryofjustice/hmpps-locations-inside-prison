import { Request, Response } from 'express'
import capFirst from '../formatters/capFirst'

export default async (req: Request, res: Response) => {
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

  const displayName = res.locals.decoratedResidentialSummary?.location?.displayName

  return res.render('pages/inactiveCells/index', {
    banner,
    title: 'Inactive cells',
    titleCaption: displayName ? capFirst(displayName) : undefined,
  })
}
