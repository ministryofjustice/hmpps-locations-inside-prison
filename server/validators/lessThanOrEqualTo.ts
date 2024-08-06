function lessThanOrEqualTo(value: any, arg: number | { field: string }) {
  const limit = typeof arg === 'number' ? arg : this.values[arg.field]
  return Number(value) <= limit
}

export default lessThanOrEqualTo
