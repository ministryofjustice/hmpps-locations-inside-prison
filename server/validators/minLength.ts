function minLength(value: string, min: number) {
  // Allow blank values, use 'required' to protect against blank values
  if (!value) {
    return true
  }

  return value.length >= min
}

export default function f(min: number) {
  return { fn: minLength, arguments: [min] }
}
