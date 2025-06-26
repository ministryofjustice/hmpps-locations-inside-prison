import { Factory } from 'fishery'

import { PrisonConfiguration } from '../../data/types/locationsApi'

const PrisonConfigurationFactory = Factory.define<PrisonConfiguration>(() => {
  return {
    prisonId: 'LEI',
    resiLocationServiceActive: 'ACTIVE',
    certificationApprovalRequired: 'INACTIVE',
    includeSegregationInRollCount: 'INACTIVE',
  }
})

export default PrisonConfigurationFactory
