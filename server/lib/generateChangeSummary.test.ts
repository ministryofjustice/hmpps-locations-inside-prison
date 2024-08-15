import generateChangeSummary from './generateChangeSummary'

describe('generateChangeSummary', () => {
  it('generates the correct change summary when increasing', () => {
    expect(generateChangeSummary('max cap', 2, 3, 20)).toEqual(
      'This will increase the establishment’s max cap from 20 to 21.',
    )
  })

  it('generates the correct change summary when decreasing', () => {
    expect(generateChangeSummary('max cap', 2, 0, 20)).toEqual(
      'This will decrease the establishment’s max cap from 20 to 18.',
    )
  })

  it('returns null when there is no change', () => {
    expect(generateChangeSummary('max cap', 2, 2, 20)).toEqual(null)
  })
})
