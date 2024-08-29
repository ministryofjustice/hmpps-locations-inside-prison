import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import ConfirmCellCapacity from './confirm'

describe('ConfirmCellCapacity', () => {
  const controller = new ConfirmCellCapacity({ route: '/' })
  const req: FormWizard.Request = {
    session: {
      referrerUrl: '/',
    },
    sessionModel: {
      get: jest.fn((fieldName?: string) => ({ maxCapacity: '3', workingCapacity: '1' })[fieldName]),
    },
  } as unknown as typeof req
  const res: Response = {
    locals: {
      location: {
        id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        capacity: {
          maxCapacity: 2,
          workingCapacity: 2,
        },
        prisonId: 'TST',
      },
      residentialSummary: {
        prisonSummary: {
          maxCapacity: 30,
          workingCapacity: 20,
        },
      },
    },
  } as unknown as typeof res

  describe('locals', () => {
    it('formats the change summary correctly', () => {
      const result = controller.locals(req, res)
      expect(result).toEqual({
        backLink: '/location/e07effb3-905a-4f6b-acdc-fafbb43a1ee2/change-cell-capacity/change',
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        changeSummary: `You are decreasing the cell’s working capacity by 1.
<br/><br/>
This will decrease the establishment’s working capacity from 20 to 19.
<br/><br/>
You are increasing the cell’s maximum capacity by 1.
<br/><br/>
This will increase the establishment’s maximum capacity from 30 to 31.`,
      })
    })
  })
})
