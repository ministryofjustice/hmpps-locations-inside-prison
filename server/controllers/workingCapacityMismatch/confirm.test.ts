import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ConfirmController from './confirm'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'
import LocationFactory from '../../testutils/factories/location'
import CertificateLocationFactory from '../../testutils/factories/certificateLocation'
import { Location } from '../../data/types/locationsApi'

describe('workingCapacityMismatch ConfirmController', () => {
  const controller = new ConfirmController({ route: '/' })
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  let cell: Location

  // Swinfen Hall, MAPA-542: the import certified lower values than the cell kept
  const buildCell = (
    capacity: { maxCapacity: number; workingCapacity: number; certifiedNormalAccommodation: number },
    certified: { maxCapacity: number; workingCapacity: number; certifiedNormalAccommodation: number },
  ) =>
    LocationFactory.build({
      id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      prisonId: 'TST',
      pathHierarchy: 'D-1-001',
      capacity,
      currentCellCertificate: CertificateLocationFactory.build(certified),
    })

  const setCell = (location: Location) => {
    cell = location
    deepRes.locals.locationResidentialSummary = { parentLocation: cell }
    deepRes.locals.location = cell
  }

  beforeEach(() => {
    deepReq = {
      flash: jest.fn(),
      journeyModel: { reset: jest.fn() },
      services: { analyticsService, locationsService },
      session: { systemToken: 'token' },
      sessionModel: { reset: jest.fn() },
    }
    deepRes = {
      locals: {
        errorlist: [],
        prisonResidentialSummary: { prisonSummary: { maxCapacity: 30, workingCapacity: 20 } },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()
    setCell(
      buildCell(
        { maxCapacity: 2, workingCapacity: 2, certifiedNormalAccommodation: 1 },
        { maxCapacity: 1, workingCapacity: 1, certifiedNormalAccommodation: 1 },
      ),
    )

    locationsService.updateCapacity = jest.fn().mockResolvedValue(cell)
    analyticsService.sendEvent = jest.fn()
  })

  describe('locals', () => {
    it('describes every change when the maximum capacity also differs from the certificate', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result.otherCertificateDifferences).toEqual([
        { label: 'Maximum capacity', certifiedLabel: 'Certified maximum capacity', current: 2, certified: 1 },
      ])
      expect(result.changeSummary).toEqual(`You are decreasing the cell’s working capacity by 1.
<br/><br/>
This will decrease the establishment’s total working capacity from 20 to 19.
<br/><br/>
You are decreasing the cell’s maximum capacity by 1.
<br/><br/>
This will decrease the establishment’s total maximum capacity from 30 to 29.`)
    })

    it('describes a change to the baseline CNA without an establishment total', () => {
      setCell(
        buildCell(
          { maxCapacity: 2, workingCapacity: 2, certifiedNormalAccommodation: 2 },
          { maxCapacity: 2, workingCapacity: 1, certifiedNormalAccommodation: 1 },
        ),
      )

      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result.changeSummary).toEqual(`You are decreasing the cell’s working capacity by 1.
<br/><br/>
This will decrease the establishment’s total working capacity from 20 to 19.
<br/><br/>
You are decreasing the cell’s baseline CNA by 1.`)
    })

    it('describes only the working capacity when nothing else differs, as before', () => {
      setCell(
        buildCell(
          { maxCapacity: 2, workingCapacity: 2, certifiedNormalAccommodation: 1 },
          { maxCapacity: 2, workingCapacity: 1, certifiedNormalAccommodation: 1 },
        ),
      )

      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result.otherCertificateDifferences).toEqual([])
      expect(result.changeSummary).toEqual(`You are decreasing the cell’s working capacity by 1.
<br/><br/>
This will decrease the establishment’s total working capacity from 20 to 19.`)
      expect(result.buttonText).toEqual('Update cell capacity')
    })
  })

  describe('saveValues', () => {
    it('sends every certified value so the API does not ask to change the certificate', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.updateCapacity).toHaveBeenCalledWith('token', 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2', {
        maxCapacity: 1,
        workingCapacity: 1,
        certifiedNormalAccommodation: 1,
        temporaryWorkingCapacityChange: true,
      })
      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'working_capacity_match_certificate', {
        prison_id: 'TST',
      })
      expect(deepRes.locals.capacityChangeSentForApproval).toBe(false)
      expect(next).toHaveBeenCalledWith()
    })

    it('sends the cell’s own values where they already match the certificate', async () => {
      setCell(
        buildCell(
          { maxCapacity: 3, workingCapacity: 3, certifiedNormalAccommodation: 2 },
          { maxCapacity: 3, workingCapacity: 2, certifiedNormalAccommodation: 2 },
        ),
      )

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.updateCapacity).toHaveBeenCalledWith('token', 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2', {
        maxCapacity: 3,
        workingCapacity: 2,
        certifiedNormalAccommodation: 2,
        temporaryWorkingCapacityChange: true,
      })
    })

    it('records when the API raised an approval request instead of updating the cell', async () => {
      locationsService.updateCapacity = jest.fn().mockResolvedValue({ ...cell, pendingApprovalRequestId: 'abc' })

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.locals.capacityChangeSentForApproval).toBe(true)
    })

    it('passes API errors on', async () => {
      const error = new Error('API error')
      locationsService.updateCapacity = jest.fn().mockRejectedValue(error)

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalledWith(error)
      expect(analyticsService.sendEvent).not.toHaveBeenCalled()
    })
  })

  describe('successHandler', () => {
    it('says the capacity was updated', () => {
      deepRes.locals.capacityChangeSentForApproval = false

      controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Capacity updated',
        content: 'You have updated the capacity for D-1-001.',
      })
      expect(deepRes.redirect).toHaveBeenCalledWith('/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2/view')
    })

    it('does not say the capacity was updated when an approval request was raised instead', () => {
      deepRes.locals.capacityChangeSentForApproval = true

      controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Change request sent',
        content:
          'The capacity for D-1-001 has not changed yet. You have submitted a request to update the cell certificate.',
      })
    })
  })
})
