module.exports = () => {
  $(() => {
    // Loops through dom and finds all elements with card--clickable class
    $('.card--clickable').each(function () {
      const link = this.querySelector('a')
      // Check if card has a link within it
      if (link !== null) {
        // Clicks the link within the heading to navigate to desired page
        $(this).on('click', () => {
          // Use HTMLAnchorElement.click() rather than jQuery's trigger('click') to prevent recursion
          link.click()
        })
      }
    })
  })
}
