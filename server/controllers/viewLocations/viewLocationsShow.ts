import { Request, Response } from 'express'

export default async (req: Request, res: Response) => {
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

  return res.render('pages/viewLocations/show', {
    banner,
  })
}
