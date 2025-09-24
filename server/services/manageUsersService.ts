import ManageUsersApiClient, { PaginatedUsers, UserAccount } from '../data/manageUsersApiClient'
import logger from '../../logger'

export default class ManageUsersService {
  constructor(private readonly manageUsersApiClient: ManageUsersApiClient) {}

  async getUser(token: string, username?: string) {
    if (username) {
      try {
        return await this.manageUsersApiClient.users.get(token, { username })
      } catch (e) {
        logger.error(e)
        return null
      }
    }

    return this.manageUsersApiClient.users.me.get(token)
  }

  async getUserCaseloads(token: string) {
    return this.manageUsersApiClient.users.me.getCaseloads(token)
  }

  async getAllUsersByCaseload(
    token: string,
    caseload: string,
    accessRoles: string,
    size = 50,
  ): Promise<PaginatedUsers> {
    let allUsers: UserAccount[] = []
    let page = 0
    let totalPages = 1

    while (page < totalPages) {
      const response = await this.getPagedUsersByCaseload(token, caseload, accessRoles, page, size)
      allUsers = allUsers.concat(response.content)
      totalPages = response.totalPages
      page += 1
    }

    return {
      content: allUsers,
      totalPages,
    }
  }

  private async getPagedUsersByCaseload(
    token: string,
    caseload: string,
    accessRoles: string,
    page: number,
    size: number,
  ): Promise<PaginatedUsers> {
    return this.manageUsersApiClient.users.getUsersByCaseload(token, {
      caseload,
      accessRoles,
      page: page.toString(),
      size: size.toString(),
    })
  }

}
