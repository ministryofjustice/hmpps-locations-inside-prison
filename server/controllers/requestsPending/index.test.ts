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
        decoratedLocation,
      },
    }
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      expect(controller.locals(deepReq as FormWizard.Request, deepRes as Response)).toEqual({
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        changeRequestsLink: '/TST/cell-certificate/change-requests',
        decoratedLocation,
        title: 'You can’t request a change to the certificate for this location currently',
        titleCaption: 'Cell A-1-001',
      })
    })
  })
})
