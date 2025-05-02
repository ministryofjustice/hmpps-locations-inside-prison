function lessThanOrEqualTo(value: number | string, arg: number | { field: string }) {
  const limit = typeof arg === 'number' ? arg : this.values[arg.field]
  return Number(value) <= limit
}

export default function f(arg: number | { field: string }) {
  return { fn: lessThanOrEqualTo, arguments: [arg] }
}
