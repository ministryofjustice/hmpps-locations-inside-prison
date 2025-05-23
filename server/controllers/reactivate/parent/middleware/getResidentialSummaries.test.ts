import { DeepPartial } from 'fishery'
import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import getResidentialSummaries from './getResidentialSummaries'
import LocationFactory from '../../../../testutils/factories/location'

describe('getResidentialSummaries', () => {
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: any

  const location = LocationFactory.build({
    id: 'l1',
    parentId: 'p1',
  })

  beforeEach(() => {
    next = jest.fn()
    deepReq = {
      session: {},
      services: {
        locationsService: {
          getResidentialSummary: jest.fn().mockResolvedValue('residentialSummary'),
        },
      },
    }
    deepRes = {
      locals: {
        location,
        user: {
          username: 'username',
        },
      },
    }
  })

  it('sets the summary locals', async () => {
    await getResidentialSummaries(deepReq as FormWizard.Request, deepRes as Response, next)

    expect(deepRes.locals.locationResidentialSummary).toEqual('residentialSummary')
    expect(deepRes.locals.prisonResidentialSummary).toEqual('residentialSummary')
  })
})
