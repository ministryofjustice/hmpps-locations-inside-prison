import { Request, Response } from 'express'
import { format } from 'date-fns'
import _ from 'lodash'

import { Location } from '../data/types/locationsApi'
import { Services } from '../services'
import renderMacro from '../utils/renderMacro'
import paths from '../utils/paths'

function formatValue(attribute: string, values: string[]) {
  if (values?.length) {
    if (attribute === 'Status') {
      let convertedStatus = values[0].toUpperCase().replace('-', '_')
      if (convertedStatus.includes('CHANGE REQUESTED')) {
        convertedStatus = `LOCKED_${convertedStatus.split(' (')[0]}`
      }

      return {
        html: renderMacro('macros/locationStatusTag', 'locationStatusTag', {
          status: convertedStatus,
        }),
      }
    }

    if (attribute === 'Certification' && values[0] === 'Certified') {
      return {
        html: renderMacro('govuk/components/tag/macro', 'govukTag', {
          text: 'Certified',
          classes: 'govuk-tag--hollow',
          attributes: {
            'data-qa': 'certified-tag',
          },
        }),
      }
    }

    if (values.length > 1) {
      return { html: values.map(_.escape).join('<br>') }
    }

    return { text: values[0] }
  }

  return { text: '' }
}

export default ({ manageUsersService }: Services) =>
  async (req: Request, res: Response) => {
    const { systemToken } = req.session
    const { location } = res.locals
    const { changeHistory }: Location = location

    const tableRows = await Promise.all(
      changeHistory.map(async ({ amendedBy, amendedDate, attribute, newValues, oldValues }) => {
        const user = await manageUsersService.getUser(systemToken, amendedBy)
        const name = user?.name || 'Unknown'

        return [
          { text: attribute },
          formatValue(attribute, oldValues),
          formatValue(attribute, newValues),
          { text: name },
          { text: format(amendedDate, 'dd/MM/yyyy') },
        ]
      }),
    )

    return res.render('pages/locationHistory/show', {
      backLink: paths.location.view(location),
      tableRows,
      title: 'Location history',
      minLayout: 'three-quarters',
    })
  }
