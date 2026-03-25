import FormWizard from 'hmpo-form-wizard'

export default function mockModel(originalValues: Record<string, unknown> = {}) {
  const values = { ...originalValues }

  return {
    get: jest.fn((fieldName?: string) => values[fieldName]),
    set: jest.fn((fieldName?: string, value?: unknown) => {
      values[fieldName] = value
    }),
    unset: jest.fn((fieldName?: string) => {
      delete values[fieldName]
    }),
    toJSON: jest.fn(() => values),
  } as unknown as FormWizard.Request['sessionModel']
}
