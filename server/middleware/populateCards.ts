import asyncMiddleware from './asyncMiddleware'
import setCanAccess from './setCanAccess'
import LocationsService from '../services/locationsService'

export default function populateCards(locationsService: LocationsService) {
  return asyncMiddleware((req, res, next) => {
    setCanAccess(locationsService)
    res.locals.cards = [
      req.featureFlags.createAndCertify
        ? {
            clickable: true,
            visible: true,
            heading: 'Manage locations',
            href: `/view-and-update-locations`,
            description: 'View and update information about existing locations or create new residential locations',
            'data-qa': 'manage-locations-card',
          }
        : {
            clickable: true,
            visible: true,
            heading: `View and update locations`,
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
        visible: req.canAccess('view_cell_certificate'),
        heading: 'Cell certificate',
        href: '/cell-certificate/current',
        description: 'View the current certificate and requested changes.',
        'data-qa': 'cell-certificate-card',
      },
      {
        clickable: true,
        visible: req.canAccess('reporting_location_information'),
        heading: 'Management reporting',
        href: '/management-reporting',
        description: 'Run management reports for printing or exporting.',
        'data-qa': 'management-reporting-card',
      },
      {
        clickable: true,
        visible: req.canAccess('administer_residential'),
        heading: 'Admin',
        href: '/admin',
        description: 'Administer residential locations.',
        'data-qa': 'admin-card',
      },
    ]

    next()
  })
}
