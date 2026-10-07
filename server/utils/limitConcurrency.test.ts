import limitConcurrency from './limitConcurrency'

describe('limitConcurrency', () => {
  const trackedTask = (tracker: { running: number; maxSeen: number }, result: number) => async () => {
    // eslint-disable-next-line no-param-reassign
    tracker.running += 1
    // eslint-disable-next-line no-param-reassign
    tracker.maxSeen = Math.max(tracker.maxSeen, tracker.running)
    await new Promise(resolve => {
      setTimeout(resolve, 1)
    })
    // eslint-disable-next-line no-param-reassign
    tracker.running -= 1
    return result
  }

  it('never runs more than the limit at once and returns every result in order', async () => {
    const limit = limitConcurrency(3)
    const tracker = { running: 0, maxSeen: 0 }

    const results = await Promise.all(Array.from({ length: 20 }, (_, i) => limit(trackedTask(tracker, i))))

    expect(tracker.maxSeen).toEqual(3)
    expect(results).toEqual(Array.from({ length: 20 }, (_, i) => i))
  })

  it('frees the place of a task that fails, and passes the error on', async () => {
    const limit = limitConcurrency(1)
    const tracker = { running: 0, maxSeen: 0 }

    const failing = limit(() => Promise.reject(new Error('API error')))
    const following = limit(trackedTask(tracker, 42))

    await expect(failing).rejects.toThrow('API error')
    await expect(following).resolves.toEqual(42)
  })
})
