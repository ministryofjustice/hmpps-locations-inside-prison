import middleware from '../../middleware/middleware'

const populateExistingCells = middleware((req, res, next) => {
  const { decoratedResidentialSummary } = res.locals

  // The parent location can't have any cells, likely because the user is creating a new parent location with cells
  if (decoratedResidentialSummary.subLocationName !== 'Cells') {
    res.locals.cells = []
  } else {
    // DRAFT status locations are excluded, because they get included and modified in the edit-cells transaction
    res.locals.cells = decoratedResidentialSummary.subLocations.map(l => l.raw).filter(l => l.status !== 'DRAFT')
  }

  next()
})

export default populateExistingCells
