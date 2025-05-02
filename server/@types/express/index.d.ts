import { HmppsUser } from '../../interfaces/hmppsUser'
import { Services } from '../../services'

export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    referrerUrl: string
  }
}

export declare global {
  namespace Express {
    interface User {
      activeCaseload?: {
        id: string
        name: string
      }
      authSource: string
      caseloads?: {
        id: string
        name: string
      }[]
      displayName?: string
      name?: string
      staffId?: number
      token: string
      userId?: string
      username: string
      userRoles?: string[]
    }

    interface Flash {
      title: string
      content: string
    }

    interface Request {
      verified?: boolean
      id: string
      logout(done: (err: unknown) => void): void
      services?: Services
      flash(message: string): Flash[]
      flash(type: string, message: Flash): Flash[]
      canAccess: (permission: string) => boolean
      featureFlags?: Record<string, boolean>
    }

    interface Locals {
      user: HmppsUser
    }
  }
}
