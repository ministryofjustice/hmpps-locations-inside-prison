// A "Copy link" button that copies the page's address, for sharing a report by email. The block stays hidden where the
// clipboard cannot be written, so the button never appears without working.
export default function copyLink() {
  document.querySelectorAll('[data-copy-link]').forEach(block => {
    const button = block.querySelector('[data-copy-link-button]')
    const status = block.querySelector('[data-copy-link-status]')
    if (!button || !navigator.clipboard) return

    block.removeAttribute('hidden')
    button.addEventListener('click', event => {
      event.preventDefault()
      navigator.clipboard.writeText(window.location.href.split('#')[0]).then(
        () => {
          status.textContent = 'Link copied'
        },
        () => {
          status.textContent = 'The link could not be copied. Copy the address from your browser instead.'
        },
      )
    })
  })
}
