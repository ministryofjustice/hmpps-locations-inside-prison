import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'

import card from './card'
import multiSelect from './multiSelect'
import localNameInputSubmit from './localNameInputSubmit'

govukFrontend.initAll()
mojFrontend.initAll()

card()
multiSelect()
localNameInputSubmit()
