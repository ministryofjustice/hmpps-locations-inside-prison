import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'
import CellCertChange from './cell-cert-change'

describe('CellCertChange', () => {
  const controller = new CellCertChange({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>

  beforeEach(() => {
    deepReq = { session: {} }
    deepRes = {
      locals: {
        decoratedLocation: buildDecoratedLocation({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'TST',
        }),
      },
    }
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      expect(controller.locals(deepReq as FormWizard.Request, deepRes as Response)).toEqual({
        title: 'Does the cell’s certified working capacity need to be decreased to 0 on the cell certificate?',
        titleCaption: 'Cell A-1-001',
      })
    })
  })
})
