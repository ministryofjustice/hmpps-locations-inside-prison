import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

const checkForPrisoners = async (req: FormWizard.Request, res: Response, next: NextFunction) => {
  const { location } = res.locals
  const redirectUrl = `/location/${location.id}/deactivate/temporary/occupied`

  const { user } = res.locals
  const token = await req.services.authService.getSystemClientToken(user.username)
  const locations = await req.services.locationsService.getPrisonersInLocation(token, location.id)
  if (locations.find(({ prisoners }) => prisoners?.length)) {
    return res.redirect(redirectUrl)
  }

  return next()
}

export default checkForPrisoners
