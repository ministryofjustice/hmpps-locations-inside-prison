import { RequestHandler } from 'express'
import asyncMiddleware from './asyncMiddleware'

export default function populateCards(): RequestHandler {
  return asyncMiddleware((_req, res, next) => {
    res.locals.cards = [
      {
        title: 'View and update locations',
        href: '#',
        description: 'View and update information about existing residential locations.',
      },
      {
        title: 'View all inactive cells',
        href: '#',
        description: 'View details of all inactive cells in the establishment and reactivate them.',
      },
      {
        title: 'Archived locations',
        href: '#',
        description: 'View locations that have been permanently deactivated as residential locations.',
      },
      {
        title: 'Residential location history',
        href: '#',
        description: 'View the history of residential locations.',
      },
    ]

    next()
  })
}
