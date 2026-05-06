import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ShouldUpdateCert from './shouldUpdateCert'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'
import mockModel from '../../testutils/mockModel'

describe('ShouldUpdateCert', () => {
  const controller = new ShouldUpdateCert({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction

  beforeEach(() => {
    deepReq = {
      form: {
        options: {
          fields: {
            updateCert: {
              items: [],
            },
          },
        },
      },
      sessionModel: mockModel({ workingCapacity: '5' }),
    }

    deepRes = {
      locals: {
        decoratedLocation: buildDecoratedLocation(),
      },
    }

    deepRes.locals.decoratedLocation.currentCellCertificate.workingCapacity = 2

    next = jest.fn()
  })

  describe('setupDynamicFields', () => {
    it('sets updateCert options with new and current certified working capacity values and calls next', async () => {
      controller.setupDynamicFields(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.form.options.fields.updateCert.items).toEqual([
        {
          text: 'Yes, change the certified working capacity to 5',
          value: 'YES',
        },
        {
          text: 'No, keep the certified working capacity as 2',
          value: 'NO',
        },
      ])
      expect(next).toHaveBeenCalled()
    })
  })
})
