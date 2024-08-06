import lessThanOrEqualTo from './lessThanOrEqualTo'

describe('lessThanOrEqualTo', () => {
  const context = {
    values: {
      anotherField: 5,
    },
  }

  describe('when comparing to a static value', () => {
    const arg = 99

    it('allows smaller value', () => {
      expect(lessThanOrEqualTo.bind(context)(98, arg)).toEqual(true)
    })

    it('allows equal value', () => {
      expect(lessThanOrEqualTo.bind(context)(99, arg)).toEqual(true)
    })

    it('forbids greater value', () => {
      expect(lessThanOrEqualTo.bind(context)(100, arg)).toEqual(false)
    })

    it('forbids non-numerical value', () => {
      expect(lessThanOrEqualTo.bind(context)('b', arg)).toEqual(false)
    })
  })

  describe('when comparing to another field', () => {
    it('allows smaller value', () => {
      const arg = { field: 'anotherField' }
      expect(lessThanOrEqualTo.bind(context)(4, arg)).toEqual(true)
    })

    it('allows equal value', () => {
      const arg = { field: 'anotherField' }
      expect(lessThanOrEqualTo.bind(context)(5, arg)).toEqual(true)
    })

    it('forbids greater value', () => {
      const arg = { field: 'anotherField' }
      expect(lessThanOrEqualTo.bind(context)(6, arg)).toEqual(false)
    })

    it('forbids non-numerical value', () => {
      const arg = { field: 'anotherField' }
      expect(lessThanOrEqualTo.bind(context)('b', arg)).toEqual(false)
    })

    it('forbids value when field not found', () => {
      const arg = { field: 'missingField' }
      expect(lessThanOrEqualTo.bind(context)(5, arg)).toEqual(false)
    })
  })
})
