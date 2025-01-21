import { Request, Response } from 'express'
import { format } from 'date-fns'

import { Location } from '../data/types/locationsApi'
import { Services } from '../services'
import renderMacro from '../utils/renderMacro'

function formatValue(attribute: string, value: string) {
  if (attribute === 'Status') {
    return {
      html: renderMacro('macros/locationStatusTag.njk', 'locationStatusTag', {
        status: value.toUpperCase().replace('-', '_'),
      }),
    }
  }

  if (attribute === 'Certification' && value === 'Certified') {
    return {
      html: renderMacro('govuk/components/tag/macro.njk', 'govukTag', {
        text: 'Certified',
        classes: 'govuk-tag--hollow',
        attributes: {
          'data-qa': 'certified-tag',
        },
      }),
    }
  }

  return { text: value }
}

export default ({ authService, manageUsersService }: Services) =>
  async (req: Request, res: Response) => {
    const { changeHistory, id: locationId, prisonId }: Location = res.locals.location

    const token = await authService.getSystemClientToken(res.locals.user.username)

    const tableRows = await Promise.all(
      changeHistory.map(async ({ amendedBy, amendedDate, attribute, newValue, oldValue }) => {
        const user = await manageUsersService.getUser(token, amendedBy)
        const name = user?.name || 'Unknown'

        return [
          { text: attribute },
          formatValue(attribute, oldValue),
          formatValue(attribute, newValue),
          { text: name },
          { text: format(amendedDate, 'dd/MM/yyyy') },
        ]
      }),
    )

    return res.render('pages/locationHistory/show', {
      backLink: `/view-and-update-locations/${prisonId}/${locationId}`,
      tableRows,
    })
  }
