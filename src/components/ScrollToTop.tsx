import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Single-page apps keep the old scroll position when the route changes, so a
// shopper who clicks SHOP NOW at the bottom of the home page landed halfway
// down /order. On every new page (PUSH/REPLACE) jump to the top. Leave
// browser Back/Forward (POP) and in-page #anchors alone.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const navType = useNavigationType()

  useLayoutEffect(() => {
    if (navType === 'POP' || hash) return
    // 'instant': a plain scrollTo(0, 0) broke Navbar section links from other
    // pages in testing (WO 0003 gate 3); the explicit instant jump does not.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash, navType])

  return null
}
