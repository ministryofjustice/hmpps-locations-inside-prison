import request from 'supertest'
import createApp from './app'
import { services } from './services'

describe('GET /accessibility-statement', () => {
  it('renders the public accessibility statement without requiring authentication', async () => {
    const response = await request(createApp(services())).get('/accessibility-statement').expect(200)

    expect(response.text).toContain(
      '<h1 class="govuk-heading-l govuk-!-margin-bottom-1">Accessibility statement for Locations</h1>',
    )
    expect(response.text).toContain('<h2 class="govuk-heading-m">Compliance status</h2>')
    expect(response.text).toContain('AA standard.')
    expect(response.text).toContain('locations@justice.gov.uk')
    expect(response.text).toContain('href="mailto:Moveaprisoner-gg@justice.gov.uk"')
    expect(response.text).toContain('href="https://www.w3.org/TR/WCAG22/"')
  })
})
