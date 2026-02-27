import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'

import card from './card'
import multiSelect from './multiSelect'
import localNameInputSubmit from './localNameInputSubmit'
import collapsibleTable from './collapsibleTable'
import updateStructurePreview from './structurePreview'
import structureAddRemoveLevel from './structureAddRemoveLevel'
import autoFillNumbering from './autoFillNumbering'

govukFrontend.initAll()
mojFrontend.initAll()

card()
multiSelect()
localNameInputSubmit()
collapsibleTable()
updateStructurePreview()
structureAddRemoveLevel()
autoFillNumbering(
  'apply-cell-numbering',
  'startCreateCellNumber',
  'create-cells_cellNumber',
  n => n + 1,
  n => `${n}`.padStart(3, '0'),
)
autoFillNumbering('apply-autoFillCNA', 'autoFillCNA', 'baselineCna', n => n)
autoFillNumbering('apply-autoFillWC', 'autoFillWC', 'workingCapacity', n => n)
autoFillNumbering('apply-autoFillMC', 'autoFillMC', 'maximumCapacity', n => n)

$(() => {
  $('body').addClass('jquery-loaded')
})
