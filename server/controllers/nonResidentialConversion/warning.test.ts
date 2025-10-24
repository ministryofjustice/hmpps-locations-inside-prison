import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import NonResidentialConversionWarning from './warning'
import LocationFactory from '../../testutils/factories/location'

describe('NonResidentialConversionWarning', () => {
  const controller = new NonResidentialConversionWarning({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>

  beforeEach(() => {
    deepReq = {}
    deepRes = {
      locals: {
        decoratedLocation: LocationFactory.build({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'TST',
        }),
      },
    }
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      expect(controller.locals(deepReq as FormWizard.Request, deepRes as Response)).toEqual({
        buttonText: 'Continue conversion to non-residential room',
        cancelClasses: 'govuk-link--inverse',
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        minLayout: 'three-quarters',
        title: 'You are about to convert this cell to a non-residential room',
      })
    })
  })
})
