import asyncMiddleware from './asyncMiddleware'

export default function populateCards() {
  return asyncMiddleware((_req, res, next) => {
    res.locals.cards = [
      {
        clickable: true,
        visible: true,
        heading: 'View and update locations',
        href: `/view-and-update-locations`,
        description: 'View and update information about existing residential locations.',
        'data-qa': 'view-locations-card',
      },
      {
        clickable: true,
        visible: true,
        heading: 'View all inactive cells',
        href: '/inactive-cells',
        description: 'View details of all inactive cells in the establishment and reactivate them.',
        'data-qa': 'inactive-cells-card',
      },
      {
        clickable: true,
        visible: true,
        heading: 'Archived locations',
        href: '/archived-locations',
        description: 'View locations that have been permanently deactivated as residential locations.',
        'data-qa': 'archived-locations-card',
      },
      {
        clickable: true,
        visible: _req.canAccess('reporting_location_information'),
        heading: 'Management reporting',
        href: '/management-reporting',
        description: 'Run management reports for printing or exporting.',
        'data-qa': 'management-reporting-card',
      },
    ]

    next()
  })
}
