import { DeepPartial } from 'fishery'
import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from './formInitialStep'

const controller = new FormInitialStep({
  route: '/',
})

describe('FormInitialStep', () => {
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let sessionModelData: { [key: string]: any }
  let journeyModelData: { [key: string]: any }

  beforeEach(() => {
    sessionModelData = {}
    journeyModelData = {}

    deepReq = {
      flash: jest.fn(),
      session: {
        referrerUrl: '',
        systemToken: 'token',
      },
      form: {
        options: {},
        values: {},
      },
      sessionModel: {
        set: (key: string, value: any) => {
          sessionModelData[key] = value
        },
        get: (key: string) => sessionModelData[key],
        reset: () => {
          sessionModelData = {}
        },
        unset: (key: string) => delete sessionModelData[key],
      },
      journeyModel: {
        set: (key: string, value: any) => {
          journeyModelData[key] = value
        },
        get: (key: string) => journeyModelData[key],
        reset: () => {
          journeyModelData = {}
        },
        unset: (key: string) => delete journeyModelData[key],
      },
      body: {},
    }

    deepRes = {
      locals: {
        errorlist: [],
        prisonId: 'TST',
        options: deepReq.form.options,
        user: {
          username: 'JTIMPSON',
        },
        values: {
          locationType: 'WING',
          structureLevels: ['LANDING', 'CELL'],
        },
      },
      redirect: jest.fn(),
    }
  })

  describe('getBackLink', () => {
    describe('when there is no backLink', () => {
      it('returns the cancelLink', () => {
        deepRes.locals.cancelLink = '/test-cancel-link'

        expect(controller.getBackLink(deepReq as FormWizard.Request, deepRes as Response)).toEqual('/test-cancel-link')
      })
    })

    describe('when there is a backLink', () => {
      it('returns the backLink', () => {
        deepReq.form.options.backLink = '/test-back-link'

        expect(controller.getBackLink(deepReq as FormWizard.Request, deepRes as Response)).toEqual('/test-back-link')
      })
    })
  })

  describe('setPageTitle', () => {
    describe('when there is a pageTitle', () => {
      it('sets title', () => {
        deepReq.form.options.pageTitle = 'Test Page Title'

        controller.setPageTitle(deepReq as FormWizard.Request, deepRes as Response, jest.fn())
        expect(deepRes.locals.title).toEqual('Test Page Title')
      })
    })

    describe('when there is no pageTitle', () => {
      it('does not set title', () => {
        controller.setPageTitle(deepReq as FormWizard.Request, deepRes as Response, jest.fn())
        expect(deepRes.locals.title).toEqual(undefined)
      })
    })
  })

  describe('setCancelLink', () => {
    describe('when there are steps', () => {
      beforeEach(() => {
        deepReq.form.options.steps = {
          '/': {},
        }
      })

      describe('when there is a step with entryPoint', () => {
        beforeEach(() => {
          deepReq.form.options.steps['/'].entryPoint = true
        })

        describe('when the step has backLink: function', () => {
          beforeEach(() => {
            deepReq.form.options.steps['/'].backLink = (_req, _res) => '/test-cancel-link'
          })

          it('sets cancelLink', () => {
            controller.setCancelLink(deepReq as FormWizard.Request, deepRes as Response, jest.fn())
            expect(deepRes.locals.cancelLink).toEqual('/test-cancel-link')
          })
        })

        describe('when the step has backLink: string', () => {
          beforeEach(() => {
            deepReq.form.options.steps['/'].backLink = '/test-cancel-link'
          })

          it('sets cancelLink', () => {
            controller.setCancelLink(deepReq as FormWizard.Request, deepRes as Response, jest.fn())
            expect(deepRes.locals.cancelLink).toEqual('/test-cancel-link')
          })
        })

        describe('when the step has backLink: undefined', () => {
          it('does not set cancelLink', () => {
            controller.setCancelLink(deepReq as FormWizard.Request, deepRes as Response, jest.fn())
            expect(deepRes.locals.cancelLink).toEqual(undefined)
          })
        })
      })

      describe('when there is not a step with entryPoint', () => {
        it('does not set cancelLink', () => {
          controller.setCancelLink(deepReq as FormWizard.Request, deepRes as Response, jest.fn())
          expect(deepRes.locals.cancelLink).toEqual(undefined)
        })
      })
    })

    describe('when there are no steps', () => {
      it('does not set cancelLink', () => {
        controller.setCancelLink(deepReq as FormWizard.Request, deepRes as Response, jest.fn())
        expect(deepRes.locals.cancelLink).toEqual(undefined)
      })
    })
  })
})
