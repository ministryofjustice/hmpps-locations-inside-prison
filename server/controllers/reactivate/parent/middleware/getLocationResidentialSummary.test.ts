import { DeepPartial } from 'fishery'
import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import getLocationResidentialSummary from './getLocationResidentialSummary'
import LocationFactory from '../../../../testutils/factories/location'

describe('getLocationResidentialSummary', () => {
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

  it('sets the locationResidentialSummary local', async () => {
    await getLocationResidentialSummary(deepReq as FormWizard.Request, deepRes as Response, next)

    expect(deepRes.locals.locationResidentialSummary).toEqual('residentialSummary')
  })
})
