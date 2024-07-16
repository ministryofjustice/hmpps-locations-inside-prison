import { Response } from 'express'
import ConfirmCellCapacity from './confirm'

describe('ConfirmCellCapacity', () => {
  const controller = new ConfirmCellCapacity({ route: '/' })
  // @ts-ignore
  const req: FormWizard.Request = {
    session: {
      referrerUrl: '/',
    },
    sessionModel: {
      // @ts-ignore
      get: jest.fn(fieldName => ({ maxCapacity: '3', workingCapacity: '1' })[fieldName]),
    },
  }
  const res: Response = {
    // @ts-ignore
    locals: {
      location: {
        id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        capacity: {
          maxCapacity: 2,
          workingCapacity: 2,
        },
      },
      residentialSummary: {
        prisonSummary: {
          maxCapacity: 30,
          workingCapacity: 20,
        },
      },
    },
  }

  describe('locals', () => {
    it('formats the change summary correctly', () => {
      const result = controller.locals(req, res)
      expect(result).toEqual({
        backLink: '/location/e07effb3-905a-4f6b-acdc-fafbb43a1ee2/change-cell-capacity',
        cancelLink: '/location/e07effb3-905a-4f6b-acdc-fafbb43a1ee2/change-cell-capacity/cancel',
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
