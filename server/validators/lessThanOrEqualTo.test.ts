import lessThanOrEqualTo from './lessThanOrEqualTo'

describe('lessThanOrEqualTo', () => {
  it('allows smaller value', () => {
    expect(lessThanOrEqualTo(98, 99)).toEqual(true)
  })

  it('allows equal value', () => {
    expect(lessThanOrEqualTo(99, 99)).toEqual(true)
  })

  it('forbids greater value', () => {
    expect(lessThanOrEqualTo(100, 99)).toEqual(false)
  })

  it('forbids non-numerical value', () => {
    expect(lessThanOrEqualTo('b', 99)).toEqual(false)
  })
})
