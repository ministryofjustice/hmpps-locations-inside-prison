import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import renderConditionalFields, { FieldEntry } from './renderConditionalFields'
import FeComponentsService from '../../services/feComponentsService'

const feComponentsService = jest.mocked(new FeComponentsService(null))
const deepReq: DeepPartial<FormWizard.Request> = {
  services: {
    feComponentsService,
  },
}

describe('Field helpers', () => {
  describe('#renderConditionalFields()', () => {
    beforeEach(() => {
      feComponentsService.getComponent = jest.fn(
        (n?: string) => n,
      ) as unknown as typeof feComponentsService.getComponent
    })

    describe("when field doesn't contain items", () => {
      it('should return the original field as object', () => {
        const field = ['court', { name: 'court' }] as FieldEntry
        const response = renderConditionalFields(deepReq as FormWizard.Request, field, [field])

        expect(response).toEqual(['court', { name: 'court' }])
      })
    })

    describe('when field contains items', () => {
      describe('when conditional is a string', () => {
        describe('when field exists', () => {
          const field = [
            'field',
            {
              name: 'field',
              items: [
                {
                  value: '31b90233-7043-4633-8055-f24854545ead',
                  text: 'Item one',
                  conditional: 'conditional_field_one',
                },
                {
                  value: '31b90233-7043-4633-8055-f24854545eac',
                  text: 'Item two',
                  conditional: 'conditional_field_two',
                },
              ],
            },
          ] as FieldEntry
          const fields = [
            field,
            [
              'conditional_field_one',
              {
                component: 'govukInput',
                classes: 'input-classes',
              },
            ],
            [
              'conditional_field_two',
              {
                component: 'govukTextarea',
                classes: 'input-classes',
              },
            ],
          ] as FieldEntry[]
          let response: ReturnType<typeof renderConditionalFields>

          beforeEach(() => {
            response = renderConditionalFields(deepReq as FormWizard.Request, field, fields)
          })

          it('should call component service for each item', () => {
            expect(feComponentsService.getComponent).toBeCalledTimes(2)
          })

          it('should call component service with correct args', () => {
            expect(feComponentsService.getComponent).toHaveBeenNthCalledWith(1, 'govukInput', {
              component: 'govukInput',
              classes: 'input-classes',
            })
          })

          it('should call component service with correct args', () => {
            expect(feComponentsService.getComponent).toHaveBeenNthCalledWith(2, 'govukTextarea', {
              component: 'govukTextarea',
              classes: 'input-classes',
            })
          })

          it('should render conditional content', () => {
            expect((response[1] as FormWizard.Field).items).toEqual([
              {
                value: '31b90233-7043-4633-8055-f24854545ead',
                text: 'Item one',
                conditional: {
                  html: 'govukInput',
                },
              },
              {
                value: '31b90233-7043-4633-8055-f24854545eac',
                text: 'Item two',
                conditional: {
                  html: 'govukTextarea',
                },
              },
            ])
          })
        })

        describe('when field doesn’t exist', () => {
          const field = [
            'field',
            {
              name: 'field',
              items: [
                {
                  value: '31b90233-7043-4633-8055-f24854545ead',
                  text: 'Item one',
                  conditional: 'doesnotexist',
                },
              ],
            },
          ] as FieldEntry
          let response: ReturnType<typeof renderConditionalFields>

          beforeEach(() => {
            response = renderConditionalFields(deepReq as FormWizard.Request, field, [field])
          })

          it('should not call component service for each item', () => {
            expect(feComponentsService.getComponent).toBeCalledTimes(0)
          })

          it('should render original item', () => {
            expect((response[1] as FormWizard.Field).items).toEqual([
              {
                value: '31b90233-7043-4633-8055-f24854545ead',
                text: 'Item one',
                conditional: 'doesnotexist',
              },
            ])
          })
        })
      })

      describe('when conditional is not a string ', () => {
        const field = [
          'field',
          {
            id: 'field',
            name: 'field',
            items: [
              {
                value: '31b90233-7043-4633-8055-f24854545ead',
                text: 'Item one',
                conditional: {
                  html: '<strong>HTML</strong> content',
                },
              },
            ],
          },
        ] as FieldEntry
        let response: ReturnType<typeof renderConditionalFields>

        beforeEach(() => {
          response = renderConditionalFields(deepReq as FormWizard.Request, field, [field])
        })

        it('should not call component service for each item', () => {
          expect(feComponentsService.getComponent).toBeCalledTimes(0)
        })

        it('should render conditional content', () => {
          expect((response[1] as FormWizard.Field).items).toEqual([
            {
              value: '31b90233-7043-4633-8055-f24854545ead',
              text: 'Item one',
              conditional: {
                html: '<strong>HTML</strong> content',
              },
            },
          ])
        })
      })

      describe('when conditional is an array', () => {
        const field = [
          'field',
          {
            id: 'field',
            name: 'field',
            items: [
              {
                value: '31b90233-7043-4633-8055-f24854545ead',
                text: 'Item one',
                conditional: ['conditional_field_one', 'conditional_field_two', 'unknown_field'],
              },
              {
                value: '31b90233-7043-4633-8055-f24854545eac',
                text: 'Item two',
              },
            ],
          },
        ] as FieldEntry
        const fields = [
          field,
          [
            'conditional_field_one',
            {
              component: 'govukInput',
              classes: 'input-classes',
            },
          ],
          [
            'conditional_field_two',
            {
              component: 'govukTextarea',
              classes: 'input-classes',
            },
          ],
        ] as FieldEntry[]
        let response: ReturnType<typeof renderConditionalFields>

        beforeEach(() => {
          response = renderConditionalFields(deepReq as FormWizard.Request, field, fields)
        })

        it('should call component service for each item', () => {
          expect(feComponentsService.getComponent).toBeCalledTimes(2)
        })

        it('should call component service with correct args', () => {
          expect(feComponentsService.getComponent).toHaveBeenNthCalledWith(1, 'govukInput', {
            component: 'govukInput',
            classes: 'input-classes',
          })
        })

        it('should call component service with correct args', () => {
          expect(feComponentsService.getComponent).toHaveBeenNthCalledWith(2, 'govukTextarea', {
            component: 'govukTextarea',
            classes: 'input-classes',
          })
        })

        it('should render conditional content', () => {
          expect((response[1] as FormWizard.Field).items).toEqual([
            {
              value: '31b90233-7043-4633-8055-f24854545ead',
              text: 'Item one',
              conditional: {
                html: 'govukInputgovukTextarea',
              },
            },
            {
              value: '31b90233-7043-4633-8055-f24854545eac',
              text: 'Item two',
            },
          ])
        })
      })
    })
  })
})
