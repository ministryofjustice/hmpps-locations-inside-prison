import { DeepPartial } from 'fishery'
import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import ReactivateCellInit from './init'

describe('ReactivateCellInit', () => {
  const controller = new ReactivateCellInit({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: any

  beforeEach(() => {
    next = jest.fn()
    deepReq = {
      form: { options: {} },
      session: {},
      sessionModel: { set: jest.fn() },
      query: {
        ref: 'refId',
        refPrisonId: 'TST',
        refLocationId: 'id',
      },
    }
    deepRes = {
      redirect: jest.fn(),
    }
  })

  describe('render', () => {
    it('sets the referrer values in the sessionModel', async () => {
      await controller.render(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.sessionModel.set).toHaveBeenCalledWith('referrerFlow', deepReq.query.ref)
      expect(deepReq.sessionModel.set).toHaveBeenCalledWith('referrerPrisonId', deepReq.query.refPrisonId)
      expect(deepReq.sessionModel.set).toHaveBeenCalledWith('referrerLocationId', deepReq.query.refLocationId)
    })
  })
})
