/**
 * Returns a function that runs async tasks no more than `max` at a time; any extra wait in a queue until a running
 * task finishes. Use one limiter for a whole batch of API calls so the batch cannot flood the API.
 */
export default function limitConcurrency(max: number) {
  let running = 0
  const waiting: (() => void)[] = []

  return async <T>(task: () => Promise<T>): Promise<T> => {
    if (running < max) {
      running += 1
    } else {
      // The finishing task hands its place straight to us, so `running` does not change
      await new Promise<void>(resolve => {
        waiting.push(resolve)
      })
    }

    try {
      return await task()
    } finally {
      const next = waiting.shift()
      if (next) {
        next()
      } else {
        running -= 1
      }
    }
  }
}
