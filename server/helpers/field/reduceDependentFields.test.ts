import FormWizard from 'hmpo-form-wizard'
import reduceDependentFields from './reduceDependentFields'
import { FieldEntry } from './renderConditionalFields'

describe('Field helpers', () => {
  describe('#reduceDependentFields', () => {
    const mockAccumulator: { [key: string]: FormWizard.Field } = {
      foo: {
        name: 'foo',
      },
    } as { [key: string]: FormWizard.Field }
    const mockAllFields: { [key: string]: FormWizard.Field } = {
      conditionalField1: {
        name: 'conditionalField1',
      },
      conditionalField2: {
        name: 'conditionalField2',
      },
    } as { [key: string]: FormWizard.Field }

    describe('when field does not have items', () => {
      it('should not add to accumulator', () => {
        const field = ['court', { name: 'court' }] as FieldEntry
        const response = reduceDependentFields()(mockAccumulator, field)

        expect(response).toEqual(mockAccumulator)
      })
    })

    describe('when field has items', () => {
      describe('with no conditional values', () => {
        it('should not add to accumulator', () => {
          const field = [
            'court',
            {
              name: 'options-field',
              items: [
                {
                  label: 'Item one',
                  value: 'item-one',
                },
              ],
            },
          ] as FieldEntry
          const response = reduceDependentFields()(mockAccumulator, field)

          expect(response).toEqual(mockAccumulator)
        })
      })

      describe('when conditional is a string', () => {
        const field = [
          'court',
          {
            name: 'options-field',
            items: [
              {
                label: 'Item one',
                value: 'item-one',
                conditional: 'conditionalField1',
              },
            ],
          },
        ] as FieldEntry

        describe('when conditional field does not exist', () => {
          it('should not add to accumulator', () => {
            const response = reduceDependentFields()(mockAccumulator, field)

            expect(response).toEqual(mockAccumulator)
          })
        })

        describe('when conditional field exists', () => {
          it('should add to accumulator', () => {
            const response = reduceDependentFields(mockAllFields)(mockAccumulator, field)

            expect(response).toEqual({
              ...mockAccumulator,
              conditionalField1: {
                id: 'conditionalField1',
                name: 'conditionalField1',
                skip: true,
                attributes: {
                  'data-id': 'conditionalField1',
                  'data-name': 'conditionalField1',
                },
                dependent: {
                  field: 'court',
                  value: 'item-one',
                },
              },
            })
          })
        })
      })

      describe('when conditional is an array', () => {
        const field = [
          'court',
          {
            name: 'options-field',
            items: [
              {
                label: 'Item one',
                value: 'item-one',
                conditional: ['conditionalField1', 'conditionalField2'],
              },
            ],
          },
        ] as FieldEntry

        describe('when conditional fields do not exist', () => {
          it('should not add to accumulator', () => {
            const response = reduceDependentFields()(mockAccumulator, field)

            expect(response).toEqual(mockAccumulator)
          })
        })

        describe('when conditional field exists', () => {
          it('should add to accumulator', () => {
            const response = reduceDependentFields(mockAllFields)(mockAccumulator, field)

            expect(response).toEqual({
              ...mockAccumulator,
              conditionalField1: {
                id: 'conditionalField1',
                name: 'conditionalField1',
                skip: true,
                attributes: {
                  'data-id': 'conditionalField1',
                  'data-name': 'conditionalField1',
                },
                dependent: {
                  field: 'court',
                  value: 'item-one',
                },
              },
              conditionalField2: {
                id: 'conditionalField2',
                name: 'conditionalField2',
                skip: true,
                attributes: {
                  'data-id': 'conditionalField2',
                  'data-name': 'conditionalField2',
                },
                dependent: {
                  field: 'court',
                  value: 'item-one',
                },
              },
            })
          })
        })
      })
    })
  })
})
