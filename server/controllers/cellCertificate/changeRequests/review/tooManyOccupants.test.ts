import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import LocationsService from '../../../../services/locationsService'
import TooManyOccupants from './tooManyOccupants'
import * as displayName from '../../../../formatters/displayName'

describe('TooManyOccupants', () => {
  const controller = new TooManyOccupants({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  beforeEach(() => {
    deepReq = {
      session: { systemToken: 'token' },
      services: { locationsService },
      form: { options: { fields: {} } },
    }
    deepRes = {
      locals: {
        approvalRequest: {
          id: 'request-uuid',
          locationId: 'location-uuid',
        },
        prisonId: 'MDI',
        errorlist: [],
      },
    }
    next = jest.fn()

    locationsService.getLocation = jest.fn().mockResolvedValue({ locationType: 'CELL', pathHierarchy: 'A-1-001' })
    jest.spyOn(displayName, 'default').mockResolvedValue('cell A-1-001')
  })

  it('sets the title caption from the location display name', async () => {
    await controller._locals(deepReq as FormWizard.Request, deepRes as Response, next)

    expect(deepRes.locals.titleCaption).toBe('Cell A-1-001')
  })

  it('sets the back link to the review page', async () => {
    await controller._locals(deepReq as FormWizard.Request, deepRes as Response, next)

    expect(deepRes.locals.backLink).toBe('/MDI/cell-certificate/change-requests/request-uuid/review')
  })
})
