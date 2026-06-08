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
    const apiCall = this.manageUsersApiClient.users.getUsersByCaseload
    return this.getAllUsersByFilter(token, caseload, accessRoles, size, apiCall)
  }

  async getAllUsersByActiveCaseload(
    token: string,
    caseload: string,
    accessRoles: string[],
    size = 50,
  ): Promise<PaginatedUsers> {
    const apiCall = this.manageUsersApiClient.users.getUsersByActiveCaseload
    return this.getAllUsersByFilter(token, caseload, accessRoles, size, apiCall)
  }

  async getAllUsersByFilter(
    token: string,
    caseload: string,
    accessRoles: string[],
    size = 50,
    apiCall = this.manageUsersApiClient.users.getUsersByCaseload,
  ): Promise<PaginatedUsers> {
    const firstPage: PaginatedUsers = await this.getPagedUsersByCaseload(token, caseload, accessRoles, 0, size, apiCall)
    const { totalPages } = firstPage
    const responses: PaginatedUsers[] = [firstPage]

    if (totalPages > 1) {
      const pagePromises = Array.from({ length: totalPages - 1 }, (_, page) =>
        this.getPagedUsersByCaseload(token, caseload, accessRoles, page + 1, size, apiCall),
      )
      const pages = await Promise.all(pagePromises)
      responses.push(...pages)
    }

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
    apiCall: typeof this.manageUsersApiClient.users.getUsersByCaseload,
  ): Promise<PaginatedUsers> {
    return apiCall(token, {
      caseload,
      accessRoles: accessRoles.join(','),
      page: page.toString(),
      size: size.toString(),
    })
  }
}
