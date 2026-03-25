import { DeepPartial } from 'fishery'
import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import NoCertChangeConfirm from './noCertChangeConfirm'
import LocationFactory from '../../../testutils/factories/location'
import buildDecoratedLocation from '../../../testutils/buildDecoratedLocation'

describe('NoCertChangeConfirm', () => {
  let req: DeepPartial<FormWizard.Request>
  let res: DeepPartial<Response>
  let next: jest.Mock
  let controller: NoCertChangeConfirm

  beforeEach(() => {
    req = {
      session: { systemToken: 'token' },
      services: { locationsService: { reactivateBulk: jest.fn().mockResolvedValue(undefined) } },
      journeyModel: { reset: jest.fn() },
      sessionModel: { reset: jest.fn() },
      flash: jest.fn(),
    }
    res = {
      locals: {
        cells: [
          LocationFactory.build({
            id: 'cell1',
            locationType: 'CELL',
            capacity: { certifiedNormalAccommodation: 1, maxCapacity: 2, workingCapacity: 3 },
            oldWorkingCapacity: 4,
          }),
          LocationFactory.build({
            id: 'cell2',
            locationType: 'CELL',
            capacity: { certifiedNormalAccommodation: 5, maxCapacity: 6, workingCapacity: 7 },
            oldWorkingCapacity: 8,
          }),
        ],
        modifiedLocationMap: {
          cell1: LocationFactory.build({
            id: 'cell1',
            locationType: 'CELL',
            capacity: { certifiedNormalAccommodation: 2, maxCapacity: 3, workingCapacity: 4 },
            oldWorkingCapacity: 5,
          }),
          cell2: LocationFactory.build({
            id: 'cell2',
            locationType: 'CELL',
            capacity: { certifiedNormalAccommodation: 2, maxCapacity: 7, workingCapacity: 8 },
            oldWorkingCapacity: 9,
          }),
        },
        prisonResidentialSummary: {
          prisonSummary: {
            maxCapacity: 100,
            workingCapacity: 90,
            currentCertificate: { totalCertifiedNormalAccommodation: 80 },
          },
        },
        decoratedLocation: buildDecoratedLocation({
          id: 'wing1',
          localName: 'Wing 1',
          locationType: 'WING',
          prisonId: 'P1',
        }),
      },
      redirect: jest.fn(),
    }
    next = jest.fn()
    controller = new NoCertChangeConfirm({ route: '/no-cert-change-confirm' })
  })

  describe('generateChangeSummary', () => {
    it('returns null if values are equal', () => {
      expect(controller.generateChangeSummary('foo', 1, 1)).toBeNull()
    })
    it('returns increase message', () => {
      expect(controller.generateChangeSummary('foo', 1, 2)).toContain('increase from 1 to 2')
    })
    it('returns decrease message', () => {
      expect(controller.generateChangeSummary('foo', 2, 1)).toContain('decrease from 2 to 1')
    })
  })

  describe('locals', () => {
    it('returns correct summary and title', () => {
      const result = controller.locals(req as FormWizard.Request, res as Response)
      expect(result.title).toContain('You are about to reactivate 2 cells')
      expect(result.titleCaption).toBe('Wing 1')
      expect(result.changeSummary).toContain('increase')
      expect(result.changeSummary).toContain('decrease')
      expect(result.buttonText).toBe('Confirm activation')
      expect(result.cancelText).toBe('Cancel')
    })
  })

  describe('saveValues', () => {
    it('calls reactivateBulk with correct arguments and calls next', async () => {
      await controller.saveValues(req as FormWizard.Request, res as Response, next)
      expect(req.services.locationsService.reactivateBulk).toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
    it('does not include unchanged cells in reactivateBulk', async () => {
      // Make cell2 unchanged
      ;[, res.locals.modifiedLocationMap.cell2] = res.locals.cells
      await controller.saveValues(req as FormWizard.Request, res as Response, next)
      const callArgs = (req.services.locationsService.reactivateBulk as jest.Mock).mock.calls[0][1]
      expect(callArgs.cell2).toBeUndefined()
    })
  })

  describe('successHandler', () => {
    it('resets journey and session, flashes success, and redirects', async () => {
      await controller.successHandler(req as FormWizard.Request, res as Response, next)
      expect(req.journeyModel.reset).toHaveBeenCalled()
      expect(req.sessionModel.reset).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith('success', {
        content: 'You have activated Wing 1.',
        title: 'Wing activated',
      })
      expect(res.redirect).toHaveBeenCalledWith('/view-and-update-locations/P1/wing1')
    })
  })
})
