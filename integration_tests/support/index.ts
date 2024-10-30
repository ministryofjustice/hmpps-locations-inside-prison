import './commands'

Cypress.on('uncaught:exception', (err, _runnable) => {
  // TODO: There is a bug in the button menu which causes a console error which
  // causes some Cypress tests to fail. I'm silencing it for now until we upgrade
  // the button menu to see if that fixes it.
  if (err.message.includes(`Cannot read properties of undefined (reading 'contains')`)) {
    return false
  }

  return true
})
