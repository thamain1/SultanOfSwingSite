import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

const oswald = { fontFamily: 'Oswald, sans-serif' }

const scrollLinks = [
  { label: 'HOW IT WORKS', id: 'how-it-works' },
  { label: 'RESULTS', id: 'results' },
  { label: 'REVIEWS', id: 'reviews' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const scrollTo = (id: string) => {
    setOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    } else {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center">
          <img src="/assets/sultan-logo.png" alt="Sultan of Swing" className="h-12" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {scrollLinks.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={oswald}
              className="text-gray-300 hover:text-orange-500 text-sm tracking-widest transition-colors"
            >
              {label}
            </button>
          ))}
          <Link
            to="/videos"
            style={oswald}
            className="text-gray-300 hover:text-orange-500 text-sm tracking-widest transition-colors"
          >
            VIDEOS
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/order')}
            style={oswald}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 text-sm tracking-widest uppercase transition-colors"
          >
            SHOP NOW
          </button>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex flex-col justify-center items-center gap-1.5 w-8 h-8"
            aria-label="Menu"
          >
            <span className={`block w-6 h-0.5 bg-white transition-transform ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-transform ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-black/95 border-t border-white/10 px-4 pb-4 pt-2 flex flex-col gap-3">
          {scrollLinks.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={oswald}
              className="text-gray-300 hover:text-orange-500 text-sm tracking-widest transition-colors text-left py-2"
            >
              {label}
            </button>
          ))}
          <Link
            to="/videos"
            onClick={() => setOpen(false)}
            style={oswald}
            className="text-gray-300 hover:text-orange-500 text-sm tracking-widest transition-colors py-2"
          >
            VIDEOS
          </Link>
        </div>
      )}
    </nav>
  )
}
