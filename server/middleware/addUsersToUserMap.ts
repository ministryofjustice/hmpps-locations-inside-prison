import { NextFunction, Request, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import _ from 'lodash'

export default function addUsersToUserMap(usernames: string[]) {
  return async (req: Request | FormWizard.Request, res: Response, next: NextFunction) => {
    const { locals } = res
    const { services } = req
    const { manageUsersService } = services
    if (!locals.userMap) {
      locals.userMap = {}
    }

    await Promise.all(
      _.uniq(usernames)
        .filter(username => !locals.userMap[username])
        .map(async username => {
          locals.userMap[username] =
            (await manageUsersService.getUser(res.locals.user.token, username))?.name || username
        }),
    )

    if (next) {
      next()
    }
  }
}
