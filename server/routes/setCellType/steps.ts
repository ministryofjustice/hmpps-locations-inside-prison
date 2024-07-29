import SetCellType from '../../controllers/setCellType'
import CancelSetCellType from '../../controllers/setCellType/cancel'

const steps = {
  '/': {
    entryPoint: true,
    fields: ['specialistCellTypes'],
    controller: SetCellType,
  },
  '/cancel': {
    checkJourney: false,
    reset: true,
    resetJourney: true,
    controller: CancelSetCellType,
  },
}

export default steps
