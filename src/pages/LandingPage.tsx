import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const oswald = { fontFamily: 'Oswald, sans-serif' }

export default function LandingPage() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoOpen, setVideoOpen] = useState(false)

  const openVideo = () => setVideoOpen(true)
  const closeVideo = () => setVideoOpen(false)

  return (
    <div className="bg-black min-h-screen">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/assets/swinging.jpg"
            alt="batter"
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        </div>

        {/* Orange accent line */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          <div className="inline-block bg-orange-500 text-black text-xs font-bold tracking-[0.3em] px-4 py-1 mb-6 uppercase" style={oswald}>
            ★ COACH TESTED · PLAYER APPROVED ★
          </div>

          <h1 style={oswald} className="text-5xl sm:text-7xl md:text-8xl font-bold leading-none uppercase mb-2">
            TRAIN A
          </h1>
          <h1 style={oswald} className="text-5xl sm:text-7xl md:text-8xl font-bold leading-none uppercase text-orange-500 mb-2">
            BETTER SWING
          </h1>
          <h1 style={oswald} className="text-5xl sm:text-7xl md:text-8xl font-bold leading-none uppercase mb-8">
            ANYWHERE
          </h1>

          <p className="text-gray-300 text-lg tracking-widest mb-10">
            Timing &nbsp;•&nbsp; Barrel Control &nbsp;•&nbsp; Repetition
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/order')}
              style={oswald}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 text-lg tracking-widest uppercase transition-all hover:scale-105"
            >
              SHOP NOW — $349
            </button>
            <button
              onClick={openVideo}
              style={oswald}
              className="border-2 border-white/40 hover:border-orange-500 text-white font-bold px-10 py-4 text-lg tracking-widest uppercase transition-all hover:text-orange-500 flex items-center justify-center gap-3"
            >
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 10 10">
                  <path d="M2 1.5l7 3.5-7 3.5V1.5z" />
                </svg>
              </span>
              WATCH DEMO (23s)
            </button>
          </div>

          <div className="mt-12 flex justify-center gap-10 text-center">
            {['Ships Fast', 'Durable', 'Portable'].map(f => (
              <div key={f} className="flex items-center gap-2 text-gray-400 text-sm tracking-widest">
                <span className="text-orange-500">✓</span> {f}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 text-xs tracking-widest">
          <span>SCROLL</span>
          <div className="w-px h-10 bg-gradient-to-b from-gray-500 to-transparent" />
        </div>
      </section>

      {/* ── WHAT IT IMPROVES ── */}
      <section className="py-20 px-4 bg-black border-t border-white/10">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-orange-500 text-xs tracking-[0.4em] uppercase mb-3" style={oswald}>THE EDGE YOU'VE BEEN MISSING</p>
          <h2 style={oswald} className="text-4xl sm:text-5xl font-bold uppercase mb-16">WHAT IT IMPROVES</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: '⏱',
                title: 'TIMING',
                desc: 'Train your hands to fire at the right moment — just like live pitching. No more early swings.',
              },
              {
                icon: '🏏',
                title: 'BARREL PATH',
                desc: 'Learn to keep the barrel in the zone longer. Hit line drives, not ground balls.',
              },
              {
                icon: '💪',
                title: 'CONFIDENCE',
                desc: 'Hundreds of quality reps build the muscle memory that shows up when it matters most.',
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="border border-orange-500/30 bg-orange-500/5 p-8 hover:bg-orange-500/10 hover:border-orange-500 transition-all group"
              >
                <div className="text-4xl mb-4">{icon}</div>
                <h3 style={oswald} className="text-2xl font-bold text-orange-500 mb-3 tracking-widest">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OLD WAY vs NEW WAY ── */}
      <section id="results" className="py-20 px-4 bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-orange-500 text-xs tracking-[0.4em] uppercase mb-3" style={oswald}>STOP TRAINING WRONG</p>
            <h2 style={oswald} className="text-4xl sm:text-5xl font-bold uppercase">THE OLD WAY VS. <span className="text-orange-500">THE SULTAN WAY</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Old Way */}
            <div className="relative overflow-hidden group">
              <img
                src="/assets/old_way_training.jfif"
                alt="Old way — static tee"
                className="w-full h-80 object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-black/60" />
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="inline-block bg-white/10 text-red-400 text-xs tracking-widest px-3 py-1 mb-3 w-fit" style={oswald}>
                  ✗ THE OLD WAY
                </div>
                <h3 style={oswald} className="text-2xl font-bold text-white mb-2">STATIC TEE TRAINING</h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>✗ Ball doesn't move like a real pitch</li>
                  <li>✗ No dynamic feel or feedback</li>
                  <li>✗ Builds bad swing habits</li>
                </ul>
              </div>
            </div>

            {/* Sultan Way */}
            <div className="relative overflow-hidden group cursor-pointer" onClick={openVideo}>
              <img
                src="/assets/Screenshot_20260226_212809_Gallery.jpg"
                alt="Sultan of Swing in use"
                className="w-full h-80 object-cover object-top group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-orange-500/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 ml-1 text-white" fill="currentColor" viewBox="0 0 10 10">
                    <path d="M2 1.5l7 3.5-7 3.5V1.5z" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="inline-block bg-orange-500 text-white text-xs tracking-widest px-3 py-1 mb-3 w-fit" style={oswald}>
                  ✓ THE SULTAN WAY
                </div>
                <h3 style={oswald} className="text-2xl font-bold text-white mb-2">DYNAMIC GAME-LIKE CONTACT</h3>
                <ul className="text-white text-sm space-y-1">
                  <li>✓ Ball behaves like live pitching</li>
                  <li>✓ True game feel and timing</li>
                  <li>✓ Builds winning swing mechanics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 px-4 bg-black">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-orange-500 text-xs tracking-[0.4em] uppercase mb-3" style={oswald}>SIMPLE. EFFECTIVE.</p>
          <h2 style={oswald} className="text-4xl sm:text-5xl font-bold uppercase mb-16">HOW IT WORKS</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                title: 'SET IT',
                sub: 'Place at Plate',
                desc: 'Set up in seconds anywhere — batting cage, backyard, gym. No anchoring required.',
                img: '/assets/Screenshot_20260226_212809_Gallery.jpg',
              },
              {
                num: '02',
                title: 'SWING',
                sub: 'Hit the Target',
                desc: 'The ball reacts on contact giving you immediate feedback on your swing path and timing.',
                img: '/assets/kid_hitting_ball.jpg',
              },
              {
                num: '03',
                title: 'REPEAT',
                sub: 'Build Muscle Memory',
                desc: '500 quality reps a session. The more you swing, the better your mechanics become.',
                img: '/assets/swinging.jpg',
              },
            ].map(({ num, title, sub, desc, img }) => (
              <div key={num} className="flex flex-col">
                <div className="relative overflow-hidden mb-6">
                  <img src={img} alt={title} className="w-full h-48 object-cover object-top" />
                  <div className="absolute inset-0 bg-black/40" />
                  <div
                    style={oswald}
                    className="absolute top-3 left-3 text-5xl font-bold text-orange-500 opacity-80 leading-none"
                  >
                    {num}
                  </div>
                </div>
                <h3 style={oswald} className="text-2xl font-bold text-orange-500 tracking-widest mb-1">{title}</h3>
                <p className="text-gray-500 text-xs tracking-widest uppercase mb-3">{sub}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section id="reviews" className="py-20 px-4 bg-zinc-950 border-t border-white/10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-orange-500 text-2xl mb-2">★★★★★</div>
          <p className="text-gray-500 text-xs tracking-[0.4em] uppercase mb-3" style={oswald}>COACH TESTED · PLAYER APPROVED</p>
          <h2 style={oswald} className="text-4xl sm:text-5xl font-bold uppercase mb-16">WHAT COACHES ARE SAYING</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: '"My guys are getting 3x the quality reps in half the time. Nothing else trains timing like this."',
                name: 'Coach [Placeholder]',
                role: 'High School Varsity Coach',
              },
              {
                quote: '"Finally a tool that replicates actual game contact. My hitters\' confidence went through the roof."',
                name: 'Coach [Placeholder]',
                role: 'Travel Ball Director',
              },
              {
                quote: '"I bought two. One for my son, one for the team. Best investment I\'ve made in training equipment."',
                name: 'Parent [Placeholder]',
                role: 'Baseball Parent',
              },
            ].map(({ quote, name, role }) => (
              <div key={name} className="border border-white/10 bg-white/5 p-6 text-left">
                <div className="text-orange-500 text-sm mb-4">★★★★★</div>
                <p className="text-gray-300 text-sm leading-relaxed italic mb-6">{quote}</p>
                <div>
                  <p style={oswald} className="text-white font-semibold tracking-wide">{name}</p>
                  <p className="text-gray-500 text-xs tracking-widest uppercase mt-1">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-4 bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/kid_hitting_ball.jpg"
            alt=""
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="w-16 h-1 bg-orange-500 mx-auto mb-8" />
          <h2 style={oswald} className="text-5xl sm:text-6xl font-bold uppercase mb-4">
            READY TO ELEVATE
          </h2>
          <h2 style={oswald} className="text-5xl sm:text-6xl font-bold uppercase text-orange-500 mb-8">
            YOUR GAME?
          </h2>
          <p className="text-gray-400 mb-10 leading-relaxed">
            Join thousands of players and coaches who train smarter with Sultan of Swing.
            Game-like contact. Anywhere. Anytime.
          </p>
          <button
            onClick={() => navigate('/order')}
            style={oswald}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-14 py-5 text-xl tracking-widest uppercase transition-all hover:scale-105 shadow-lg shadow-orange-500/20"
          >
            ORDER NOW — $349
          </button>
          <div className="mt-8 flex justify-center gap-10">
            {['Ships Fast', 'Durable Build', 'Portable', '30-Day Guarantee'].map(f => (
              <div key={f} className="text-gray-500 text-xs tracking-widest flex items-center gap-1">
                <span className="text-orange-500">✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 py-8 px-4 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div style={oswald} className="text-white font-bold tracking-widest">
            SULTAN <span className="text-orange-500">OF SWING</span>
          </div>
          <p className="text-gray-600 text-xs">© 2026 Sultan of Swing. All rights reserved.</p>
          <div className="flex gap-6 text-gray-600 text-xs tracking-widest">
            <a href="#" className="hover:text-orange-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* ── VIDEO MODAL ── */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeVideo}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={closeVideo}
              className="absolute -top-10 right-0 text-gray-400 hover:text-white text-sm tracking-widest"
              style={oswald}
            >
              CLOSE ✕
            </button>
            <video
              ref={videoRef}
              src="/assets/demo.mp4"
              controls
              autoPlay
              className="w-full rounded-sm shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
