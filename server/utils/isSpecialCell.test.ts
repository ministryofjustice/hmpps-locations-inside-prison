import FormWizard from 'hmpo-form-wizard'
import { Response } from 'express'
import isSpecialCell from './isSpecialCell'
import buildDecoratedLocation from '../testutils/buildDecoratedLocation'

describe('isSpecialCell', () => {
  it.each([
    [[], false],
    [['ACCESSIBLE_CELL', 'CAT_A'], false],
    [['BIOHAZARD_DIRTY_PROTEST'], true],
  ])('with type %s returns %s', (specialistCellTypes, result) => {
    const req = {} as FormWizard.Request
    const res = {
      locals: {
        constants: {
          specialistCellTypes: [
            {
              key: 'ACCESSIBLE_CELL',
              description: 'Accessible cell',
              attributes: {
                affectsCapacity: false,
              },
              additionalInformation:
                'Also known as wheelchair accessible or Disability and Discrimination Act (DDA) compliant',
            },
            {
              key: 'BIOHAZARD_DIRTY_PROTEST',
              description: 'Biohazard cell',
              attributes: {
                affectsCapacity: true,
              },
              additionalInformation: 'Previously known as a dirty protest cell',
            },
            {
              key: 'CSU',
              description: 'Care and separation cell',
              attributes: {
                affectsCapacity: true,
              },
            },
            {
              key: 'CAT_A',
              description: 'Cat A cell',
              attributes: {
                affectsCapacity: false,
              },
            },
          ],
        },
        decoratedLocation: buildDecoratedLocation({ specialistCellTypes }),
      },
    } as Response

    expect(isSpecialCell(req, res)).toBe(result)
  })
})
