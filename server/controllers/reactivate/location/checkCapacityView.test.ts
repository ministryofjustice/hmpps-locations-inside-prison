import express from 'express'
import nunjucksSetup from '../../../utils/nunjucksSetup'

type Tree = {
  decoratedLocation: {
    id: string
    displayName: string
    pathHierarchy: string
    leafLevel: boolean
    raw: { locationType: string }
  }
  decoratedSubLocations: Tree[]
}

const branch = (id: string, name: string, children: Tree[]): Tree => ({
  decoratedLocation: {
    id,
    displayName: name,
    pathHierarchy: id,
    leafLevel: false,
    raw: { locationType: 'LANDING' },
  },
  decoratedSubLocations: children,
})

const cell = (id: string): Tree => ({
  decoratedLocation: {
    id,
    displayName: id,
    pathHierarchy: id,
    leafLevel: true,
    raw: { locationType: 'CELL' },
  },
  decoratedSubLocations: [],
})

describe('reactivation check capacity view', () => {
  const app = express()
  nunjucksSetup(app, {
    applicationName: 'Residential locations',
    buildNumber: '',
    gitRef: '',
    gitShortHash: '',
    productId: '',
    branchName: '',
  })

  function render(tree: Tree, cells: Tree[]): Promise<string> {
    const specialistCellTypes: string[] = []
    return new Promise((resolve, reject) => {
      app.render(
        'pages/reactivate/location/check-capacity',
        {
          title: 'Check capacity of cells',
          options: {},
          cancelLink: '/',
          decoratedLocation: tree.decoratedLocation,
          decoratedLocationTree: [tree],
          modifiedLocationMap: Object.fromEntries(
            cells.map(({ decoratedLocation }) => [
              decoratedLocation.id,
              {
                capacity: { certifiedNormalAccommodation: 1, maxCapacity: 3 },
                oldWorkingCapacity: 2,
                specialistCellTypes,
              },
            ]),
          ),
          constants: { specialistCellTypes: [] },
          paths: { location: { reactivate: { location: () => '/reactivate' } } },
        },
        (error, html) => (error ? reject(error) : resolve(html)),
      )
    })
  }

  function sections(html: string): string[] {
    return Array.from(
      html.matchAll(
        /<h([2-6])[^>]*>([\s\S]*?)<\/h\1>|<a[^>]*href="([^"]*\/edit-capacity\/[^"]+)"[^>]*>[\s\S]*?<\/a>|<table[^>]*data-qa="check-capacity-table"[^>]*>[\s\S]*?<\/table>/g,
      ),
      match => {
        if (match[1]) return `h${match[1]}: ${match[2].trim()}`
        if (match[3]) return `edit: ${match[3]}`
        return match[0]
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      },
    )
  }

  const table = (id: string) => `Location Baseline CNA Working capacity Maximum capacity Cell type ${id} 1 2 3 -`

  it('groups cells under their spurs and landings with the correct edit links', async () => {
    const cells = ['east-lower', 'east-upper', 'west-lower', 'west-upper'].map(cell)
    const tree = branch('wing', 'Wing', [
      branch('east', 'East', [branch('east-low', 'Lower', [cells[0]]), branch('east-up', 'Upper', [cells[1]])]),
      branch('west', 'West', [branch('west-low', 'Lower', [cells[2]]), branch('west-up', 'Upper', [cells[3]])]),
    ])

    expect(sections(await render(tree, cells))).toEqual([
      'h2: East',
      'h3: Lower',
      'edit: /reactivate/edit-capacity/east-low',
      table('east-lower'),
      'h3: Upper',
      'edit: /reactivate/edit-capacity/east-up',
      table('east-upper'),
      'h2: West',
      'h3: Lower',
      'edit: /reactivate/edit-capacity/west-low',
      table('west-lower'),
      'h3: Upper',
      'edit: /reactivate/edit-capacity/west-up',
      table('west-upper'),
    ])
  })

  it('preserves three-level and single-cell layouts', async () => {
    const cells = [cell('A-1-001'), cell('A-2-001')]
    const tree = branch('wing', 'Wing', [
      branch('landing-1', 'Landing 1', [cells[0]]),
      branch('landing-2', 'Landing 2', [cells[1]]),
    ])

    expect(sections(await render(tree, cells))).toEqual([
      'h2: Landing 1',
      'edit: /reactivate/edit-capacity/landing-1',
      table('A-1-001'),
      'h2: Landing 2',
      'edit: /reactivate/edit-capacity/landing-2',
      table('A-2-001'),
    ])
    expect(sections(await render(cells[0], [cells[0]]))).toEqual([
      'edit: /reactivate/edit-capacity/A-1-001',
      table('A-1-001'),
    ])
  })

  it('shows direct cells and deeper branches even when they are mixed', async () => {
    const cells = [cell('direct'), cell('nested')]
    const tree = branch('wing', 'Wing', [branch('spur', 'Spur', [branch('landing', 'Landing', [cells[1]]), cells[0]])])

    expect(sections(await render(tree, cells))).toEqual([
      'h2: Spur',
      'edit: /reactivate/edit-capacity/spur',
      table('direct'),
      'h3: Landing',
      'edit: /reactivate/edit-capacity/landing',
      table('nested'),
    ])
  })
})
