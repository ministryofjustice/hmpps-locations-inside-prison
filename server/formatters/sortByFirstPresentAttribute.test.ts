import sortByFirstPresentAttribute from './sortByFirstPresentAttribute'

const objects = [
  { index: 3, localName: 'Cell wing', pathHierarchy: '1' },
  { index: 1, pathHierarchy: 'A' },
  { index: 2, pathHierarchy: 'B' },
  { index: 4, localName: 'Detention', pathHierarchy: 'C' },
  { index: 0, localName: '123 ABC', pathHierarchy: 'D' },
]

describe('sortByFirstPresentAttribute', () => {
  it('correctly sorts the passed array of objects', () => {
    expect(
      sortByFirstPresentAttribute(objects, 'localName', 'pathHierarchy')
        .map(o => o.index)
        .toString(),
    ).toEqual('0,1,2,3,4')
  })
})
