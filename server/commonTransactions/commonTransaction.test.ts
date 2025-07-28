import CreateCells from './createCells'

describe('CommonTransaction', () => {
  it('does stuff', () => {
    expect(CreateCells.getSteps({ next: 'next-test' })).toEqual({})
  })
})
