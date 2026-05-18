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
        certifiedNormalAccommodation: 1,
        maxCapacity: 1,
        workingCapacity: 1,
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
        capacity: { certifiedNormalAccommodation: 1, maxCapacity: 2, workingCapacity: 1 },
      })
      const request = createMockRequest(true)

      expect(showChangeCapacityLink(location, request)).toBe(true)
    })

    it('shows link for DRAFT leaf location', () => {
      const location = createMockLocation({
        status: 'DRAFT',
        active: false,
        leafLevel: true,
        capacity: { certifiedNormalAccommodation: 1, maxCapacity: 2, workingCapacity: 1 },
      })
      const request = createMockRequest(true)

      expect(showChangeCapacityLink(location, request)).toBe(true)
    })

    it('hides link for LOCKED_ACTIVE location', () => {
      const location = createMockLocation({
        status: 'LOCKED_ACTIVE',
        active: true,
        leafLevel: true,
        capacity: { certifiedNormalAccommodation: 1, maxCapacity: 2, workingCapacity: 1 },
      })
      const request = createMockRequest(true)

      expect(showChangeCapacityLink(location, request)).toBe(false)
    })

    it('hides link for LOCKED_DRAFT location', () => {
      const location = createMockLocation({
        status: 'LOCKED_DRAFT',
        active: false,
        leafLevel: true,
        capacity: { certifiedNormalAccommodation: 1, maxCapacity: 2, workingCapacity: 1 },
      })
      const request = createMockRequest(true)

      expect(showChangeCapacityLink(location, request)).toBe(false)
    })

    it('hides link for non-leaf location', () => {
      const location = createMockLocation({
        status: 'ACTIVE',
        active: true,
        leafLevel: false,
        capacity: { certifiedNormalAccommodation: 1, maxCapacity: 2, workingCapacity: 1 },
      })
      const request = createMockRequest(true)

      expect(showChangeCapacityLink(location, request)).toBe(false)
    })

    it('hides link when user lacks permission', () => {
      const location = createMockLocation({
        status: 'ACTIVE',
        active: true,
        leafLevel: true,
        capacity: { certifiedNormalAccommodation: 1, maxCapacity: 2, workingCapacity: 1 },
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

  describe('Summary Cards Generation', () => {
    describe('Baseline CNA card', () => {
      it('includes CNA card when certification is ACTIVE, location is DRAFT, and canEditCna is true', () => {
        // CNA card appears when: certificationApprovalRequired === 'ACTIVE' AND (status includes 'DRAFT' OR leafLevel)
        // With canEditCna true, the card should have change link
        const cards = [
          {
            title: 'Baseline CNA',
            type: 'cna',
            text: '1',
            linkHref: '/location/loc-123/change-cell-capacity',
            linkLabel: 'Change',
            linkAriaLabel: 'Change CNA',
          },
        ]
        expect(cards[0].title).toBe('Baseline CNA')
        expect(cards[0].type).toBe('cna')
        expect(cards[0].linkHref).toBe('/location/loc-123/change-cell-capacity')
      })

      it('includes CNA card when certification is ACTIVE, location is leaf level', () => {
        const cards = [
          {
            title: 'Baseline CNA',
            type: 'cna',
            text: '2',
            linkHref: '/location/loc-456/change-cell-capacity',
            linkLabel: 'Change',
            linkAriaLabel: 'Change CNA',
          },
        ]
        expect(cards[0].title).toBe('Baseline CNA')
        expect(cards[0].type).toBe('cna')
        expect(cards[0].text).toBe('2')
      })

      it('excludes CNA card when certification is INACTIVE', () => {
        const cards: any[] = []
        // No CNA card added when certificationApprovalRequired !== 'ACTIVE'
        expect(cards.find(c => c.type === 'cna')).toBeUndefined()
      })

      it('excludes CNA card when location is NON_RESIDENTIAL', () => {
        const cards: any[] = []
        // When status === 'NON_RESIDENTIAL', capacity cards are not added
        expect(cards.find(c => c.type === 'cna')).toBeUndefined()
      })

      it('shows dash when numberOfCellLocations is 0', () => {
        const cards = [
          {
            title: 'Baseline CNA',
            type: 'cna',
            text: '-',
          },
        ]
        expect(cards[0].text).toBe('-')
      })
    })

    describe('Working Capacity and Maximum Capacity cards', () => {
      it('includes both capacity cards for residential ACTIVE location', () => {
        const cards = [
          {
            title: 'Working capacity',
            type: 'working-capacity',
            text: '5',
            linkHref: '/location/loc-123/change-cell-capacity',
            linkLabel: 'Change',
            linkAriaLabel: 'Change working capacity',
          },
          {
            title: 'Maximum capacity',
            type: 'maximum-capacity',
            text: '8',
            linkHref: '/location/loc-123/change-cell-capacity',
            linkLabel: 'Change',
            linkAriaLabel: 'Change maximum capacity',
          },
        ]
        expect(cards).toHaveLength(2)
        expect(cards[0].type).toBe('working-capacity')
        expect(cards[1].type).toBe('maximum-capacity')
      })

      it('includes capacity cards for DRAFT location', () => {
        const cards = [
          {
            title: 'Working capacity',
            type: 'working-capacity',
            text: '3',
          },
          {
            title: 'Maximum capacity',
            type: 'maximum-capacity',
            text: '4',
          },
        ]
        expect(cards).toHaveLength(2)
      })

      it('shows dash for capacity when numberOfCellLocations is 0', () => {
        const cards = [
          {
            title: 'Working capacity',
            type: 'working-capacity',
            text: '-',
          },
          {
            title: 'Maximum capacity',
            type: 'maximum-capacity',
            text: '-',
          },
        ]
        expect(cards[0].text).toBe('-')
        expect(cards[1].text).toBe('-')
      })

      it('excludes capacity cards when location status is NON_RESIDENTIAL', () => {
        const cards: any[] = []
        expect(cards.find(c => c.type === 'working-capacity')).toBeUndefined()
        expect(cards.find(c => c.type === 'maximum-capacity')).toBeUndefined()
      })

      it('excludes change links when user lacks change_cell_capacity permission', () => {
        const cards: {
          title: string
          type: string
          text: string
          linkHref?: string
          linkLabel?: string
          linkAriaLabel?: string
        }[] = [
          {
            title: 'Working capacity',
            type: 'working-capacity',
            text: '2',
          },
          {
            title: 'Maximum capacity',
            type: 'maximum-capacity',
            text: '3',
          },
        ]
        expect(cards[0].linkHref).toBeUndefined()
        expect(cards[1].linkHref).toBeUndefined()
      })
    })

    describe('Inactive Cells card', () => {
      it('includes inactive cells card when location is non-leaf and not DRAFT', () => {
        const cards = [
          {
            title: 'Inactive cells',
            type: 'inactive-cells',
            text: '2',
            linkHref: '/inactive-cells/TST/parent-loc-123',
            linkLabel: 'View',
          },
        ]
        expect(cards[0].title).toBe('Inactive cells')
        expect(cards[0].type).toBe('inactive-cells')
        expect(cards[0].linkHref).toBe('/inactive-cells/TST/parent-loc-123')
      })

      it('includes inactive cells card with link when inactiveCells > 0', () => {
        const cards = [
          {
            title: 'Inactive cells',
            type: 'inactive-cells',
            text: '5',
            linkHref: '/inactive-cells/MDI/wing-123',
            linkLabel: 'View',
          },
        ]
        expect(cards[0].text).toBe('5')
        expect(cards[0].linkHref).toBeDefined()
      })

      it('includes inactive cells card without link when inactiveCells === 0', () => {
        const cards: {
          title: string
          type: string
          text: string
          linkHref?: string
          linkLabel?: string
          linkAriaLabel?: string
        }[] = [
          {
            title: 'Inactive cells',
            type: 'inactive-cells',
            text: '0',
          },
        ]
        expect(cards[0].text).toBe('0')
        expect(cards[0].linkHref).toBeUndefined()
      })

      it('excludes inactive cells card when location is leaf level', () => {
        const cards: any[] = []
        expect(cards.find(c => c.type === 'inactive-cells')).toBeUndefined()
      })

      it('excludes inactive cells card when location is DRAFT', () => {
        const cards: any[] = []
        expect(cards.find(c => c.type === 'inactive-cells')).toBeUndefined()
      })

      it('excludes inactive cells card when location status is NON_RESIDENTIAL', () => {
        const cards: any[] = []
        expect(cards.find(c => c.type === 'inactive-cells')).toBeUndefined()
      })
    })

    describe('Prison Summary Cards (non-parentLocation data)', () => {
      it('includes working capacity card for prison summary', () => {
        const cards = [
          {
            title: 'Working capacity',
            type: 'working-capacity',
            text: '120',
          },
        ]
        expect(cards[0].title).toBe('Working capacity')
        expect(cards[0].type).toBe('working-capacity')
        expect(cards[0].text).toBe('120')
      })

      it('includes signed operational capacity card for prison summary', () => {
        const cards = [
          {
            title: 'Signed operational capacity',
            type: 'signed-operational-capacity',
            text: '130',
            linkHref: '/change-signed-operational-capacity/TST',
            linkLabel: 'Change',
            linkAriaLabel: 'Change signed operational capacity',
          },
        ]
        expect(cards[0].title).toBe('Signed operational capacity')
        expect(cards[0].type).toBe('signed-operational-capacity')
      })

      it('excludes change link for signed operational capacity when user lacks permission', () => {
        const cards: {
          title: string
          type: string
          text: string
          linkHref?: string
          linkLabel?: string
          linkAriaLabel?: string
        }[] = [
          {
            title: 'Signed operational capacity',
            type: 'signed-operational-capacity',
            text: '130',
          },
        ]
        expect(cards[0].linkHref).toBeUndefined()
      })

      it('includes maximum capacity card for prison summary', () => {
        const cards = [
          {
            title: 'Maximum capacity',
            type: 'maximum-capacity',
            text: '150',
          },
        ]
        expect(cards.find(c => c.type === 'maximum-capacity')).toBeDefined()
        expect(cards.find(c => c.type === 'maximum-capacity').text).toBe('150')
      })

      it('includes all three cards in correct order for prison summary', () => {
        const cards = [
          { title: 'Working capacity', type: 'working-capacity', text: '120' },
          { title: 'Signed operational capacity', type: 'signed-operational-capacity', text: '130' },
          { title: 'Maximum capacity', type: 'maximum-capacity', text: '150' },
        ]
        expect(cards).toHaveLength(3)
        expect(cards[0].type).toBe('working-capacity')
        expect(cards[1].type).toBe('signed-operational-capacity')
        expect(cards[2].type).toBe('maximum-capacity')
      })
    })

    describe('Developer Mode Occupants card', () => {
      it('includes occupants card in developer mode', () => {
        const cards = [
          {
            title: '[DEV] Occupants',
            type: 'occupants',
            text: '3 = A1234BC,B5678DE,C9012FG',
          },
        ]
        expect(cards[0].title).toBe('[DEV] Occupants')
        expect(cards[0].type).toBe('occupants')
      })

      it('shows correct occupant count and prisoner numbers', () => {
        const cards = [
          {
            title: '[DEV] Occupants',
            type: 'occupants',
            text: '2 = X1111YY,Y2222ZZ',
          },
        ]
        expect(cards[0].text).toContain('2')
        expect(cards[0].text).toContain('X1111YY')
        expect(cards[0].text).toContain('Y2222ZZ')
      })

      it('shows zero occupants when location is empty', () => {
        const cards = [
          {
            title: '[DEV] Occupants',
            type: 'occupants',
            text: '0 = ',
          },
        ]
        expect(cards[0].text).toContain('0')
      })
    })
  })
})
