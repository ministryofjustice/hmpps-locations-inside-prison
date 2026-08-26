import { Location } from '../data/types/locationsApi'

/**
 * Builds an absolute path from the provided path segments.
 *
 * Any `undefined` values are omitted so callers can safely pass optional
 * segments without needing to pre-filter them.
 *
 * @param pathSegments - Individual path segments to join with `/`.
 * @returns A path string beginning with `/`.
 *
 * @example
 * p('TST', '123', 'delete')
 * // => '/TST/123/delete'
 *
 * @example
 * p('TST', undefined, 'view')
 * // => '/TST/view'
 */
function p(...pathSegments: unknown[]) {
  return `/${pathSegments.filter(s => s !== undefined && s !== '' && s !== null).join('/')}`
}

function optionalLocation(...pathSegments: unknown[]) {
  function path(location: Pick<Location, 'prisonId' | 'id'>): string
  function path(prisonId: string, locationId?: string): string
  function path(prisonIdOrLocation: string | Pick<Location, 'prisonId' | 'id'>, locationId?: string): string {
    if (prisonIdOrLocation && typeof prisonIdOrLocation !== 'string') {
      return path(prisonIdOrLocation.prisonId, prisonIdOrLocation.id)
    }

    return p(prisonIdOrLocation, locationId, ...pathSegments)
  }

  return path
}

const withLocation = optionalLocation as (...pathSegments: unknown[]) => {
  (location: Pick<Location, 'prisonId' | 'id'>): string
  (prisonId: string, locationId: string): string
}

function withPrison(...pathSegments: unknown[]) {
  return (prisonId: string) => p(prisonId, ...pathSegments)
}

const paths = {
  admin: {
    changeCertificationStatus: withPrison('admin/change-certification-status'),
    changeIncludeSegInRollCount: withPrison('admin/change-include-seg-in-roll-count'),
    changeNomisScreenStatus: (prisonId: string, screenId: string) =>
      p(`${prisonId}/admin/change-nomis-screen-status/${screenId}`),
    changeNonResidentialStatus: withPrison('admin/change-non-resi-status'),
    changeResidentialStatus: withPrison('admin/change-resi-status'),
    index: withPrison('admin'),
  },
  auth: {
    signIn: '/sign-in',
    signOut: '/sign-out',
  },
  capacityManagementDashboard: `/capacity-management-dashboard`,
  cellCertificate: {
    changeRequest: {
      view: (prisonId: string, requestId?: string) => p(`${prisonId}/cell-certificate/change-requests`, requestId),
      review: (prisonId: string, requestId: string) =>
        `${paths.cellCertificate.changeRequest.view(prisonId, requestId)}/review`,
      withdraw: (prisonId: string, requestId: string) =>
        `${paths.cellCertificate.changeRequest.view(prisonId, requestId)}/withdraw`,
    },
    history: withPrison('cell-certificate/history'),
    view: (prisonId: string, certificateId = 'current') => `/${prisonId}/cell-certificate/${certificateId}`,
  },
  dev: {
    resetPermissions: '/dev/reset-permissions',
    setPermissions: '/dev/set-permissions',
  },
  location: {
    addLocalName: withLocation('add-local-name'),
    addToCertificate: withLocation('add-to-certificate'),
    archive: withLocation('archive'),
    cellConversion: withLocation('cell-conversion'),
    changeCellCapacity: withLocation('change-cell-capacity'),
    changeCellType: withLocation('change-cell-type'),
    changeDoorNumber: withLocation('change-door-number'),
    changeLocalName: withLocation('change-local-name'),
    changeLocationCode: withLocation('change-location-code'),
    changeNonResidentialType: withLocation('change-non-residential-type'),
    changeSanitation: withLocation('change-sanitation'),
    changeTemporaryDeactivationDetails: withLocation('change-temporary-deactivation-details'),
    changeUsedFor: withLocation('change-used-for'),
    create: optionalLocation('create'),
    createCells: withLocation('create-cells'),
    deactivate: withLocation('deactivate'),
    deactivatePermanent: withLocation('deactivate/permanent'),
    deactivateTemporary: withLocation('deactivate/temporary'),
    delete: withLocation('delete'),
    editCells: withLocation('edit-cells'),
    history: withLocation('history'),
    inactiveCells: optionalLocation('inactive-cells'),
    nonResidentialConversion: withLocation('non-residential-conversion'),
    reactivate: {
      cell: withLocation('reactivate/cell'),
      cells: optionalLocation('reactivate/cells'),
      location: withLocation('reactivate/location'),
      parent: withLocation('reactivate/parent'),
    },
    removeCellType: withLocation('remove-cell-type'),
    removeLocalName: withLocation('remove-local-name'),
    setCellType: withLocation('set-cell-type'),
    view: optionalLocation('view'),
    workingCapacityMismatch: withLocation('working-capacity-mismatch'),
  },
  prison: {
    archivedLocations: withPrison('archived-locations'),
    home: withPrison(),
    cellCertificateUploads: withPrison('cell-certificate-uploads'),
    changeSignedOperationalCapacity: withPrison('change-signed-operational-capacity'),
  },
}

export default paths
