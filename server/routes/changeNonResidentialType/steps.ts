import ChangeNonResidentialTypeDetails from '../../controllers/changeNonResidentialType/details'

const steps = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'details',
  },
  '/details': {
    fields: ['convertedCellType', 'otherConvertedCellType'],
    controller: ChangeNonResidentialTypeDetails,
  },
}

export default steps
