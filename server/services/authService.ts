import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'

export default class AuthService {
  constructor(private readonly hmppsAuthClient: AuthenticationClient) {}

  async getSystemClientToken(username?: string) {
    return this.hmppsAuthClient.getToken(username)
  }
}
