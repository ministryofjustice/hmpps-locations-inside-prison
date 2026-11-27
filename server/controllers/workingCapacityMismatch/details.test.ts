import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import DetailsController from './details'
import LocationFactory from '../../testutils/factories/location'
import CertificateLocationFactory from '../../testutils/factories/certificateLocation'

describe('workingCapacityMismatch DetailsController', () => {
  const controller = new DetailsController({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction

  const setCell = (
    capacity: { maxCapacity: number; workingCapacity: number; certifiedNormalAccommodation: number },
    certified: { maxCapacity: number; workingCapacity: number; certifiedNormalAccommodation: number },
  ) => {
    const cell = LocationFactory.build({
      capacity,
      currentCellCertificate: CertificateLocationFactory.build(certified),
    })
    deepRes.locals.location = cell
    deepRes.locals.locationResidentialSummary = { parentLocation: cell }
  }

  const items = () => (deepReq.form.options.fields.certifiedChange as FormWizard.Field).items

  beforeEach(() => {
    deepReq = { form: { options: { fields: { certifiedChange: {} } } } }
    deepRes = { locals: { errorlist: [] } }
    next = jest.fn()
  })

  describe('populateItems', () => {
    it('offers the same choices as before when only the working capacity differs', async () => {
      setCell(
        { maxCapacity: 2, workingCapacity: 2, certifiedNormalAccommodation: 1 },
        { maxCapacity: 2, workingCapacity: 1, certifiedNormalAccommodation: 1 },
      )

      await controller.populateItems(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(items()).toEqual([
        { text: 'Change the working capacity to match the certified working capacity', value: 'NO' },
        { text: 'Request to change the certified working capacity to 2', value: 'YES' },
      ])
      expect(next).toHaveBeenCalled()
    })

    it('says what else will change when the maximum capacity and baseline CNA also differ', async () => {
      setCell(
        { maxCapacity: 2, workingCapacity: 2, certifiedNormalAccommodation: 2 },
        { maxCapacity: 1, workingCapacity: 1, certifiedNormalAccommodation: 1 },
      )

      await controller.populateItems(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(items()[0]).toEqual({
        text: 'Change the working capacity to match the certified working capacity',
        value: 'NO',
        hint: {
          text: 'This will also change the maximum capacity from 2 to 1. This will also change the baseline CNA from 2 to 1.',
        },
      })
    })
  })

  describe('locals', () => {
    it('lists the other values that differ from the certificate', () => {
      setCell(
        { maxCapacity: 2, workingCapacity: 2, certifiedNormalAccommodation: 1 },
        { maxCapacity: 1, workingCapacity: 1, certifiedNormalAccommodation: 1 },
      )

      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result.otherCertificateDifferences).toEqual([
        { label: 'Maximum capacity', certifiedLabel: 'Certified maximum capacity', current: 2, certified: 1 },
      ])
    })
  })
})
