import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import RequestsPending from '.'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('RequestsPending', () => {
  const controller = new RequestsPending({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  const decoratedLocation = buildDecoratedLocation({
    id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
    prisonId: 'TST',
  })

  beforeEach(() => {
    deepReq = { session: {} }
    deepRes = {
      locals: {
        prisonId: 'TST',
        decoratedLocation,
      },
    }
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      expect(controller.locals(deepReq as FormWizard.Request, deepRes as Response)).toEqual({
        changeRequestsLink: '/TST/cell-certificate/change-requests',
      })
    })
  })
})
