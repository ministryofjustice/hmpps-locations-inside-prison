module.exports = () => {
  $(() => {
    $('.govuk-table__row:has(> td[data-collapsible-table-group])').hide()

    const handleLinks = $('a[data-collapsible-table-handle]')
    handleLinks.show()
    handleLinks.on('click', function (e) {
      if (e.button === 0) {
        const $this = $(this)
        const groupIndex = $this.data('collapsible-table-handle')
        const expand = !$this.data('expanded')
        $this.data('expanded', expand)
        // setting with .attr is required so that the css works
        $this.attr('data-expanded', expand)

        $(`.govuk-table__row:has(> td[data-collapsible-table-group='${groupIndex}']`).toggle(expand)

        return false
      }

      return true
    })
  })
}
