import { Request, Response } from 'express'
import { format } from 'date-fns'
import _ from 'lodash'

import { Location } from '../data/types/locationsApi'
import { Services } from '../services'
import renderMacro from '../utils/renderMacro'
import capFirst from '../formatters/capFirst'

function formatValue(attribute: string, values: string[]) {
  if (values?.length) {
    if (attribute === 'Status') {
      return {
        html: renderMacro('macros/locationStatusTag', 'locationStatusTag', {
          status: values[0].toUpperCase().replace('-', '_'),
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
    const { changeHistory, id: locationId, prisonId }: Location = location

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
      backLink: `/view-and-update-locations/${prisonId}/${locationId}`,
      tableRows,
      title: 'Location history',
      titleCaption: `${capFirst(location.locationType.toLowerCase())} ${location.localName || location.pathHierarchy}`,
      minLayout: 'three-quarters',
    })
  }
