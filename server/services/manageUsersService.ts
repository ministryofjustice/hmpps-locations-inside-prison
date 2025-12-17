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
    accessRoles: string[],
    size = 50,
  ): Promise<PaginatedUsers> {
    const firstPage: PaginatedUsers = await this.getPagedUsersByCaseload(token, caseload, accessRoles, 0, size)
    const { totalPages } = firstPage

    const pagedResponses = Array.from({ length: totalPages }, (_, page) =>
      this.getPagedUsersByCaseload(token, caseload, accessRoles, page, size),
    )

    const responses: PaginatedUsers[] = await Promise.all(pagedResponses)
    const allUsers: UserAccount[] = responses.flatMap(response => response.content)

    return {
      content: allUsers,
      totalPages,
    }
  }

  private async getPagedUsersByCaseload(
    token: string,
    caseload: string,
    accessRoles: string[],
    page: number,
    size: number,
  ): Promise<PaginatedUsers> {
    return this.manageUsersApiClient.users.getUsersByCaseload(token, {
      caseload,
      accessRoles: accessRoles.join(','),
      page: page.toString(),
      size: size.toString(),
    })
  }
}
