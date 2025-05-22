// plugins/stickyNative.js

export default defineNuxtPlugin(() => {
  if (process.client) {
    const sticky_awot = () => {
      const stickyEl = document.getElementById('sticky1')
      const stickyAnchor = document.getElementById('sticky-anchor')
      const stickyTitle = document.getElementById('stickyTitle')
      const removeSticky = document.getElementById('removeSticky') || document.querySelector('[data-elementor-type="footer"]') || document.querySelector('.removeSticky')

      if (!stickyEl || !stickyAnchor || !stickyTitle || !removeSticky) return

      const windowTop = window.scrollY
      const footerTop = removeSticky.getBoundingClientRect().top + window.scrollY
      const divTop = stickyAnchor.getBoundingClientRect().top + window.scrollY
      const divHeight = stickyEl.offsetHeight
      const isTablet = document.querySelector('[data-elementor-device-mode="tablet"]')
      const padding = isTablet ? 50 : 10

      if (windowTop + divHeight > footerTop - padding) {
        stickyEl.style.top = `${(windowTop + divHeight - footerTop + padding) * -1}px`
        stickyEl.classList.remove('stick')
        stickyTitle.classList.remove('titleStick')
      } else if (windowTop > divTop) {
        stickyEl.classList.add('stick')
        stickyEl.style.top = '0px'
        stickyTitle.classList.add('titleStick')
      } else {
        stickyEl.classList.remove('stick')
        stickyEl.style.top = ''
        stickyTitle.classList.remove('titleStick')
      }
    }

    const img_scroll = () => {
      const el = document.querySelector('.elementor-element-27c5e308')
      if (!el) return
      const img = el.querySelector('img')
      const height = el.offsetHeight

      if (height > 218 && img) {
        const windowTop = window.scrollY
        img.style.height = `${height - windowTop / 4}px`
      }
    }

    const onScroll = () => {
      sticky_awot()
      img_scroll()
    }

    window.addEventListener('scroll', onScroll)
    window.addEventListener('load', onScroll)
  }
})
