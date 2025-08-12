import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'

import card from './card'
import multiSelect from './multiSelect'
import localNameInputSubmit from './localNameInputSubmit'
import updateStructurePreview from './structurePreview'
import structureAddRemoveLevel from './structureAddRemoveLevel'
import autoFillNumbering from './autoFillNumbering'

govukFrontend.initAll()
mojFrontend.initAll()

card()
multiSelect()
localNameInputSubmit()
updateStructurePreview()
structureAddRemoveLevel()
autoFillNumbering('apply-cell-numbering', 'startCreateCellNumber', 'create-cells_cellNumber', n => n + 1)
autoFillNumbering('apply-autoFillCNA', 'autoFillCNA', 'create-cells_baselineCna', n => n)
autoFillNumbering('apply-autoFillWC', 'autoFillWC', 'create-cells_workingCapacity', n => n)
autoFillNumbering('apply-autoFillMC', 'autoFillMC', 'create-cells_maximumCapacity', n => n)
