import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const oswald = { fontFamily: 'Oswald, sans-serif' }

const YOUTUBE_ID = 'H-1OrOi7qyQ'

const chapters = [
  { time: '0:00', seconds: 0, title: 'Introduction to the Sultan of Swing' },
  { time: '1:42', seconds: 102, title: 'Easy Setup' },
  { time: '2:19', seconds: 139, title: 'Safety Tips' },
  { time: '4:45', seconds: 285, title: 'Breakdown & Storage' },
  { time: '5:12', seconds: 312, title: 'Collapsible Base Setup & Use' },
  { time: '7:50', seconds: 470, title: 'Quick Review' },
  { time: '9:20', seconds: 560, title: 'About Us & Contact' },
]

export default function VideosPage() {
  const navigate = useNavigate()
  const [startTime, setStartTime] = useState(0)

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <img src="/assets/sultan-logo.png" alt="Sultan of Swing" className="h-16 sm:h-20" />
        </div>

        <h1
          style={oswald}
          className="text-3xl sm:text-4xl text-center tracking-widest uppercase mb-8"
        >
          Tutorial Video
        </h1>

        {/* 16:9 responsive iframe */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            key={startTime}
            className="absolute inset-0 w-full h-full rounded-lg"
            src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&start=${startTime}`}
            title="Sultan of Swing Tutorial"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Chapter list */}
        <div className="mt-10">
          <h2
            style={oswald}
            className="text-xl tracking-widest uppercase text-orange-500 mb-4"
          >
            Chapters
          </h2>

          <div className="flex flex-col gap-2">
            {chapters.map((ch) => (
              <button
                key={ch.seconds}
                onClick={() => setStartTime(ch.seconds)}
                className="flex items-center gap-4 px-4 py-3 rounded-lg bg-white/5 hover:bg-orange-500/20 transition-colors text-left group"
              >
                <span
                  style={oswald}
                  className="text-orange-500 group-hover:text-orange-400 w-12 shrink-0 text-sm tracking-wider"
                >
                  {ch.time}
                </span>
                <span
                  style={oswald}
                  className="text-gray-200 group-hover:text-white text-sm tracking-wider"
                >
                  {ch.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/order')}
            style={oswald}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-3 text-lg tracking-widest uppercase transition-colors"
          >
            SHOP NOW
          </button>
        </div>
      </div>
    </div>
  )
}
