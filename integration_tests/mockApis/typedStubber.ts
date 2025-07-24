export default class TypedStubber<ST extends { [k: string]: (...args: unknown[]) => unknown }> {
  readonly allStubs: ST

  readonly stub: { [k in keyof ST]: (...args: Parameters<ST[k]>) => void }

  constructor(stubs: ST) {
    this.allStubs = stubs
    this.stub = Object.fromEntries(
      Object.entries(this.allStubs).map(([k, _v]) => [
        k,
        (...args: Parameters<typeof _v>) => {
          cy.task(k, ...args)
        },
      ]),
    ) as unknown as typeof this.stub
  }
}
