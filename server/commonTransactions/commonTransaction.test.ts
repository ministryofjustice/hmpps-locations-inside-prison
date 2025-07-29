import FormWizard from 'hmpo-form-wizard'
import CommonTransaction from './commonTransaction'
import FormInitialStep from '../controllers/base/formInitialStep'

const steps: FormWizard.Steps = {
  '/': {
    pageTitle: 'Step 1',
    fields: ['field1'],
    next: 'step2',
  },
  '/step2': {
    pageTitle: 'Step 2',
    fields: ['field2'],
    template: 'customTemplate',
  },
}
const fields: FormWizard.Fields = {
  field1: {
    id: 'field1',
    name: 'field1',
    label: {
      text: 'Field 1',
      for: 'field1',
    },
  },
  field2: {
    id: 'field2',
    name: 'field2',
    label: {
      text: 'Field 2',
      for: 'field2',
    },
  },
}
const transaction = new CommonTransaction({ pathPrefix: '/test-prefix', fields, steps })

describe('CommonTransaction', () => {
  describe('getSteps', () => {
    it('returns a modified steps object', () => {
      expect(transaction.getSteps({ next: 'next-step' })).toEqual({
        '/test-prefix/': {
          controller: FormInitialStep,
          fields: ['test-prefix_field1'],
          next: 'test-prefix/step2',
          pageTitle: 'Step 1',
          template: '../../partials/formStep',
        },
        '/test-prefix/step2': {
          controller: FormInitialStep,
          fields: ['test-prefix_field2'],
          next: 'next-step',
          pageTitle: 'Step 2',
          template: 'customTemplate',
        },
      })
    })
  })

  describe('getFields', () => {
    it('returns a modified fields object', () => {
      expect(transaction.getFields()).toEqual({
        'test-prefix_field1': {
          id: 'test-prefix_field1',
          name: 'test-prefix_field1',
          label: {
            text: 'Field 1',
            for: 'test-prefix_field1',
          },
        },
        'test-prefix_field2': {
          id: 'test-prefix_field2',
          name: 'test-prefix_field2',
          label: {
            text: 'Field 2',
            for: 'test-prefix_field2',
          },
        },
      })
    })
  })
})
