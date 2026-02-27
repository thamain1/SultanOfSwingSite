import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex flex-col leading-none">
          <span style={{ fontFamily: 'Oswald, sans-serif' }} className="text-white font-bold text-xl tracking-widest uppercase">
            SULTAN
          </span>
          <span style={{ fontFamily: 'Oswald, sans-serif' }} className="text-orange-500 font-semibold text-xs tracking-[0.3em] uppercase -mt-1">
            OF SWING
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'HOW IT WORKS', id: 'how-it-works' },
            { label: 'RESULTS', id: 'results' },
            { label: 'REVIEWS', id: 'reviews' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={{ fontFamily: 'Oswald, sans-serif' }}
              className="text-gray-300 hover:text-orange-500 text-sm tracking-widest transition-colors"
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate('/order')}
          style={{ fontFamily: 'Oswald, sans-serif' }}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 text-sm tracking-widest uppercase transition-colors"
        >
          SHOP NOW
        </button>
      </div>
    </nav>
  )
}
