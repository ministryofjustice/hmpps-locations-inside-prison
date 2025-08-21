import { SpecialistCellTypesObject } from '../data/types/locationsApi/specialistCellTypesObject'

export default function formatCellTypes(
  specialistCellTypesObject: SpecialistCellTypesObject[],
  cellTypes: string[] | string | undefined,
): string {
  if (!cellTypes) {
    return '-'
  }

  if (Array.isArray(cellTypes)) {
    return cellTypes.map(cellType => formatCellTypes(specialistCellTypesObject, cellType)).join(', ')
  }

  return specialistCellTypesObject.find(o => o.key === cellTypes).description
}
