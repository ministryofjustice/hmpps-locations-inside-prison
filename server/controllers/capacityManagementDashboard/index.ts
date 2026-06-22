import { Request, Response } from 'express'

export default async (req: Request, res: Response) => {
  const { locationsService } = req.services
  const { systemToken } = req.session

  const caseloadIds = (res.locals.user.caseloads || []).map(caseload => caseload.id)
  const allPrisons = await locationsService.getCellCertificateDashboard(systemToken)
  const dashboard = allPrisons.filter(entry => caseloadIds.includes(entry.prisonId))

  return res.render('pages/capacityManagementDashboard/index', {
    title: 'Capacity management dashboard',
    dashboard,
  })
}
