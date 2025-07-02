const locationStatusMap: { [status: string]: { label: string; tagColour?: string } } = {
  ACTIVE: {
    label: 'Active',
  },
  INACTIVE: {
    label: 'Inactive',
    tagColour: 'grey',
  },
  ARCHIVED: {
    label: 'Archived',
  },
  DRAFT: {
    label: 'Draft',
    tagColour: 'orange',
  },
  NON_RESIDENTIAL: {
    label: 'Non-residential',
    tagColour: 'yellow',
  },
  LOCKED_ACTIVE: {
    label: 'Active',
  },
  LOCKED_INACTIVE: {
    label: 'Inactive',
    tagColour: 'grey',
  },
  LOCKED_DRAFT: {
    label: 'Draft',
    tagColour: 'orange',
  },
  LOCKED_NON_RESIDENTIAL: {
    label: 'Non-residential',
    tagColour: 'yellow',
  },
}

export default locationStatusMap
