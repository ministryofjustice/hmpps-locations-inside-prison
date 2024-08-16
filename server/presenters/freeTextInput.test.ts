import nunjucks from 'nunjucks'
import freeTextInput from './freeTextInput'

describe('freeTextInput', () => {
  beforeEach(() => {
    nunjucks.configure(['node_modules/govuk-frontend/dist/'], {
      autoescape: true,
    })
  })

  it('returns a correctly rendered gov.uk text input component', () => {
    const result = freeTextInput({
      id: 'otherConvertedCellType',
      name: 'otherConvertedCellType',
      type: 'text',
      autocomplete: 'off',
      label: {
        text: 'Room description',
      },
    }).replace(/\s+/gm, ' ')

    const expectedResult = `
      <div class="govuk-form-group">
        <label class="govuk-label" for="otherConvertedCellType">
          Room description
        </label>
        <input class="govuk-input" id="otherConvertedCellType" name="otherConvertedCellType" type="text" autocomplete="off">
      </div>
    `.replace(/\s+/gm, ' ')

    expect(result).toEqual(expectedResult)
  })
})
