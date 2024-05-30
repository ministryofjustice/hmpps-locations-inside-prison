import { RequestHandler } from 'express'
import asyncMiddleware from './asyncMiddleware'

export default function populateCards(): RequestHandler {
  return asyncMiddleware((_req, res, next) => {
    res.locals.cards = [
      {
        clickable: true,
        heading: 'View and update locations',
        href: `/view-and-update-locations`,
        description: 'View and update information about existing residential locations.',
        'data-qa': 'view-locations-card',
      },
      {
        clickable: true,
        heading: 'View all inactive cells',
        href: '/all-inactive-cells',
        description: 'View details of all inactive cells in the establishment and reactivate them.',
        'data-qa': 'inactive-cells-card',
      },
      {
        clickable: true,
        heading: 'Archived locations',
        href: '/archived-locations',
        description: 'View locations that have been permanently deactivated as residential locations.',
        'data-qa': 'archived-locations-card',
      },
      {
        clickable: true,
        heading: 'Residential location history',
        href: '/residential-location-history',
        description: 'View the history of residential locations.',
        'data-qa': 'location-history-card',
      },
    ]

    next()
  })
}
