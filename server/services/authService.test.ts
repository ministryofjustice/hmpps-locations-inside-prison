import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import AuthService from './authService'

jest.mock('@ministryofjustice/hmpps-auth-clients')

describe('Auth service', () => {
  let hmppsAuthClient: jest.Mocked<AuthenticationClient>
  let authService: AuthService

  beforeEach(() => {
    hmppsAuthClient = new AuthenticationClient(null, null) as jest.Mocked<AuthenticationClient>
    authService = new AuthService(hmppsAuthClient)
  })

  describe('getSystemClientToken', () => {
    it('calls the correct client function', async () => {
      await authService.getSystemClientToken('Testuser')

      expect(hmppsAuthClient.getToken).toHaveBeenCalledWith('Testuser')
    })
  })
})
