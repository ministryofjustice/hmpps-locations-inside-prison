import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import getPrisonResidentialSummary from './getPrisonResidentialSummary'
import LocationFactory from '../testutils/factories/location'

describe('getPrisonResidentialSummary', () => {
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>

  beforeEach(() => {
    deepReq = {
      session: { systemToken: 'token' },
    }
    deepRes = {
      locals: {
        user: { username: 'username' },
        location: LocationFactory.build({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'TST',
          capacity: {
            maxCapacity: 2,
            workingCapacity: 2,
          },
        }),
      },
      redirect: jest.fn(),
    }
  })

  it('calls the correct locations service call', async () => {
    deepReq.services = {
      locationsService: {
        getResidentialSummary: jest.fn(),
      },
    }
    const callback = jest.fn()
    await getPrisonResidentialSummary(deepReq as FormWizard.Request, deepRes as Response, callback)

    expect(deepReq.services.locationsService.getResidentialSummary).toHaveBeenCalledWith(
      'token',
      deepRes.locals.location.prisonId,
    )
  })
})
