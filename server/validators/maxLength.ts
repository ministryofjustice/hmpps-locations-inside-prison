function maxLength(value: string, max: number) {
  // Allow blank values, use 'required' to protect against blank values
  if (!value) {
    return true
  }

  return value.length <= max
}

export default function f(max: number) {
  return { fn: maxLength, arguments: [max] }
}
