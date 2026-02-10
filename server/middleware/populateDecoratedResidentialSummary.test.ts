import { Request } from 'express'
import { DecoratedLocation } from '../decorators/decoratedLocation'
import {
  showChangeCapacityLink,
  showChangeDoorNumberLink,
  showChangeUsedForLink,
  showEditCellTypeLinks,
  showEditLocalNameLink,
  showSanitationChangeLink,
} from './populateDecoratedResidentialSummary'

describe('populateDecoratedResidentialSummary - Link Visibility Functions', () => {
  const createMockRequest = (canAccessValue: boolean = true): Request =>
    ({
      canAccess: jest.fn().mockReturnValue(canAccessValue),
    }) as any

  const createMockLocation = (overrides?: Partial<DecoratedLocation>): DecoratedLocation => {
    const base = {
      id: 'loc-123',
      code: 'A-1-001',
      pathHierarchy: 'A-1-001',
      cellMark: 'A1-01',
      inCellSanitation: false,
      accommodationTypes: ['NORMAL'] as string[],
      usedFor: ['RESIDENTIAL'] as string[],
      specialistCellTypes: [] as string[],
      localName: 'Test Cell',
      status: 'ACTIVE',
      active: true,
      leafLevel: true,
      isResidential: true,
      lastModifiedDate: '2025-01-01T00:00:00Z',
      lastModifiedBy: 'USER1',
      convertedCellType: '',
      deactivatedBy: '',
      deactivatedReason: '',
      displayName: 'Test Cell',
      otherConvertedCellType: '',
      capacity: {
        maxCapacity: 1,
        workingCapacity: 1,
      },
      certification: {
        certified: true,
        capacityOfCertifiedCell: 1,
        certifiedNormalAccommodation: 1,
      },
      numberOfCellLocations: 1,
      pendingChanges: undefined as any,
      raw: {
        locationType: 'CELL',
        id: 'loc-123',
        prisonId: 'MDI',
        code: 'A-1-001',
        pathHierarchy: 'A-1-001',
      },
    }
    return { ...base, ...overrides } as DecoratedLocation
  }

  describe('showChangeDoorNumberLink', () => {
    it('shows link for ACTIVE location when user has access', () => {
      const location = createMockLocation({ status: 'ACTIVE', active: true })
      const request = createMockRequest(true)

      expect(showChangeDoorNumberLink(location, request)).toBe(true)
    })

    it('shows link for DRAFT location', () => {
      const location = createMockLocation({ status: 'DRAFT', active: false })
      const request = createMockRequest(true)

      expect(showChangeDoorNumberLink(location, request)).toBe(true)
    })

    it('hides link for LOCKED_ACTIVE location', () => {
      const location = createMockLocation({ status: 'LOCKED_ACTIVE', active: true })
      const request = createMockRequest(true)

      expect(showChangeDoorNumberLink(location, request)).toBe(false)
    })

    it('hides link for LOCKED_DRAFT location', () => {
      const location = createMockLocation({ status: 'LOCKED_DRAFT', active: false })
      const request = createMockRequest(true)

      expect(showChangeDoorNumberLink(location, request)).toBe(false)
    })

    it('hides link when user lacks permission', () => {
      const location = createMockLocation({ status: 'ACTIVE', active: true })
      const request = createMockRequest(false)

      expect(showChangeDoorNumberLink(location, request)).toBe(false)
    })

    it('hides link for INACTIVE location', () => {
      const location = createMockLocation({ status: 'INACTIVE', active: false })
      const request = createMockRequest(true)

      expect(showChangeDoorNumberLink(location, request)).toBe(false)
    })
  })

  describe('showSanitationChangeLink', () => {
    it('shows link for ACTIVE location when user has access', () => {
      const location = createMockLocation({ status: 'ACTIVE', active: true })
      const request = createMockRequest(true)

      expect(showSanitationChangeLink(location, request)).toBe(true)
    })

    it('shows link for DRAFT location', () => {
      const location = createMockLocation({ status: 'DRAFT', active: false })
      const request = createMockRequest(true)

      expect(showSanitationChangeLink(location, request)).toBe(true)
    })

    it('hides link for LOCKED_ACTIVE location', () => {
      const location = createMockLocation({ status: 'LOCKED_ACTIVE', active: true })
      const request = createMockRequest(true)

      expect(showSanitationChangeLink(location, request)).toBe(false)
    })

    it('hides link for LOCKED_INACTIVE location', () => {
      const location = createMockLocation({ status: 'LOCKED_INACTIVE', active: false })
      const request = createMockRequest(true)

      expect(showSanitationChangeLink(location, request)).toBe(false)
    })
  })

  describe('showEditLocalNameLink', () => {
    it('shows link for ACTIVE non-leaf location when user has access', () => {
      const location = createMockLocation({ status: 'ACTIVE', active: true, leafLevel: false })
      const request = createMockRequest(true)

      expect(showEditLocalNameLink(location, request)).toBe(true)
    })

    it('shows link for DRAFT location', () => {
      const location = createMockLocation({ status: 'DRAFT', active: false, leafLevel: false })
      const request = createMockRequest(true)

      expect(showEditLocalNameLink(location, request)).toBe(true)
    })

    it('hides link for LOCKED_ACTIVE location', () => {
      const location = createMockLocation({ status: 'LOCKED_ACTIVE', active: true, leafLevel: false })
      const request = createMockRequest(true)

      expect(showEditLocalNameLink(location, request)).toBe(false)
    })
  })

  describe('showEditCellTypeLinks', () => {
    it('shows link for ACTIVE location when user has access', () => {
      const location = createMockLocation({ status: 'ACTIVE', active: true })
      const request = createMockRequest(true)

      expect(showEditCellTypeLinks(location, request)).toBe(true)
    })

    it('shows link for DRAFT location', () => {
      const location = createMockLocation({ status: 'DRAFT', active: false })
      const request = createMockRequest(true)

      expect(showEditCellTypeLinks(location, request)).toBe(true)
    })

    it('hides link for LOCKED_DRAFT location', () => {
      const location = createMockLocation({ status: 'LOCKED_DRAFT', active: false })
      const request = createMockRequest(true)

      expect(showEditCellTypeLinks(location, request)).toBe(false)
    })
  })

  describe('showChangeUsedForLink', () => {
    it('shows link for ACTIVE location when user has access', () => {
      const location = createMockLocation({ status: 'ACTIVE', active: true })
      const request = createMockRequest(true)

      expect(showChangeUsedForLink(location, request)).toBe(true)
    })

    it('shows link for DRAFT location', () => {
      const location = createMockLocation({ status: 'DRAFT', active: false })
      const request = createMockRequest(true)

      expect(showChangeUsedForLink(location, request)).toBe(true)
    })

    it('hides link for LOCKED_ACTIVE location', () => {
      const location = createMockLocation({ status: 'LOCKED_ACTIVE', active: true })
      const request = createMockRequest(true)

      expect(showChangeUsedForLink(location, request)).toBe(false)
    })
  })

  describe('showChangeCapacityLink', () => {
    it('shows link for ACTIVE leaf location with capacity when user has access', () => {
      const location = createMockLocation({
        status: 'ACTIVE',
        active: true,
        leafLevel: true,
        capacity: { maxCapacity: 2, workingCapacity: 1 },
      })
      const request = createMockRequest(true)

      expect(showChangeCapacityLink(location, request)).toBe(true)
    })

    it('shows link for DRAFT leaf location', () => {
      const location = createMockLocation({
        status: 'DRAFT',
        active: false,
        leafLevel: true,
        capacity: { maxCapacity: 2, workingCapacity: 1 },
      })
      const request = createMockRequest(true)

      expect(showChangeCapacityLink(location, request)).toBe(true)
    })

    it('hides link for LOCKED_ACTIVE location', () => {
      const location = createMockLocation({
        status: 'LOCKED_ACTIVE',
        active: true,
        leafLevel: true,
        capacity: { maxCapacity: 2, workingCapacity: 1 },
      })
      const request = createMockRequest(true)

      expect(showChangeCapacityLink(location, request)).toBe(false)
    })

    it('hides link for LOCKED_DRAFT location', () => {
      const location = createMockLocation({
        status: 'LOCKED_DRAFT',
        active: false,
        leafLevel: true,
        capacity: { maxCapacity: 2, workingCapacity: 1 },
      })
      const request = createMockRequest(true)

      expect(showChangeCapacityLink(location, request)).toBe(false)
    })

    it('hides link for non-leaf location', () => {
      const location = createMockLocation({
        status: 'ACTIVE',
        active: true,
        leafLevel: false,
        capacity: { maxCapacity: 2, workingCapacity: 1 },
      })
      const request = createMockRequest(true)

      expect(showChangeCapacityLink(location, request)).toBe(false)
    })

    it('hides link when user lacks permission', () => {
      const location = createMockLocation({
        status: 'ACTIVE',
        active: true,
        leafLevel: true,
        capacity: { maxCapacity: 2, workingCapacity: 1 },
      })
      const request = createMockRequest(false)

      expect(showChangeCapacityLink(location, request)).toBe(false)
    })
  })

  describe('All LOCKED statuses', () => {
    const lockedStatuses = ['LOCKED_ACTIVE', 'LOCKED_INACTIVE', 'LOCKED_DRAFT', 'LOCKED_NON_RESIDENTIAL']

    lockedStatuses.forEach(status => {
      it(`hides door number link for ${status}`, () => {
        const location = createMockLocation({ status: status as any, active: status.includes('ACTIVE') })
        const request = createMockRequest(true)

        expect(showChangeDoorNumberLink(location, request)).toBe(false)
      })

      it(`hides sanitation link for ${status}`, () => {
        const location = createMockLocation({ status: status as any, active: status.includes('ACTIVE') })
        const request = createMockRequest(true)

        expect(showSanitationChangeLink(location, request)).toBe(false)
      })

      it(`hides local name link for ${status}`, () => {
        const location = createMockLocation({
          status: status as any,
          active: status.includes('ACTIVE'),
          leafLevel: false,
        })
        const request = createMockRequest(true)

        expect(showEditLocalNameLink(location, request)).toBe(false)
      })

      it(`hides cell type link for ${status}`, () => {
        const location = createMockLocation({ status: status as any, active: status.includes('ACTIVE') })
        const request = createMockRequest(true)

        expect(showEditCellTypeLinks(location, request)).toBe(false)
      })

      it(`hides used for link for ${status}`, () => {
        const location = createMockLocation({ status: status as any, active: status.includes('ACTIVE') })
        const request = createMockRequest(true)

        expect(showChangeUsedForLink(location, request)).toBe(false)
      })

      it(`hides capacity link for ${status}`, () => {
        const location = createMockLocation({
          status: status as any,
          active: status.includes('ACTIVE'),
          leafLevel: true,
        })
        const request = createMockRequest(true)

        expect(showChangeCapacityLink(location, request)).toBe(false)
      })
    })
  })
})
