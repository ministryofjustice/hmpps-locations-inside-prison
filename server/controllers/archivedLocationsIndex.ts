import { Request, Response } from 'express'

export default async (req: Request, res: Response) => {
  return res.render('pages/archivedLocations/index')
}
