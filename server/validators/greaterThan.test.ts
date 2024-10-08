import greaterThan from './greaterThan'

const greaterThanFn = greaterThan(1).fn

describe('greaterThan', () => {
  const context = {
    values: {
      anotherField: 5,
    },
  }

  describe('when comparing to a static value', () => {
    const arg = 99

    it('allows greater value', () => {
      expect(greaterThanFn.bind(context)(100, arg)).toEqual(true)
    })

    it('forbids equal value', () => {
      expect(greaterThanFn.bind(context)(99, arg)).toEqual(false)
    })

    it('forbids smaller value', () => {
      expect(greaterThanFn.bind(context)(98, arg)).toEqual(false)
    })

    it('forbids non-numerical value', () => {
      expect(greaterThanFn.bind(context)('b', arg)).toEqual(false)
    })
  })

  describe('when comparing to another field', () => {
    it('allows greater value', () => {
      const arg = { field: 'anotherField' }
      expect(greaterThanFn.bind(context)(6, arg)).toEqual(true)
    })

    it('forbids equal value', () => {
      const arg = { field: 'anotherField' }
      expect(greaterThanFn.bind(context)(5, arg)).toEqual(false)
    })

    it('forbids smaller value', () => {
      const arg = { field: 'anotherField' }
      expect(greaterThanFn.bind(context)(4, arg)).toEqual(false)
    })

    it('forbids non-numerical value', () => {
      const arg = { field: 'anotherField' }
      expect(greaterThanFn.bind(context)('b', arg)).toEqual(false)
    })

    it('forbids value when field not found', () => {
      const arg = { field: 'missingField' }
      expect(greaterThanFn.bind(context)(5, arg)).toEqual(false)
    })
  })
})
