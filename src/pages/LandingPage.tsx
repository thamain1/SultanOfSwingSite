import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const oswald = { fontFamily: 'Oswald, sans-serif' }

export default function LandingPage() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoOpen, setVideoOpen] = useState(false)

  const openVideo = () => setVideoOpen(true)
  const closeVideo = useCallback(() => {
    setVideoOpen(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [])

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeVideo() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeVideo])

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
          <div className="flex justify-center mb-8">
            <img
              src="/assets/sultan-logo.png"
              alt="Sultan of Swing"
              className="h-32 sm:h-40 md:h-48 w-auto"
            />
          </div>

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
              SHOP NOW
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
              WATCH DEMO
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
                desc: 'The bungee snaps the ball back instantly — no chasing, no re-placing. Swing 3x more often and build timing through pure volume.',
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
                  <li>✗ Re-place the ball after every swing</li>
                  <li>✗ Adjust your swing to avoid hitting the tee</li>
                  <li>✗ Slow reps, fewer quality swings per session</li>
                </ul>
              </div>
            </div>

            {/* Sultan Way */}
            <div className="relative overflow-hidden group cursor-pointer" onClick={openVideo}>
              <img
                src="/assets/new_swing.jpg"
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
                <h3 style={oswald} className="text-2xl font-bold text-white mb-2">GAME-LIKE CONTACT, NO TEE</h3>
                <ul className="text-white text-sm space-y-1">
                  <li>✓ Ball snaps back on bungee — just keep swinging</li>
                  <li>✓ Full swing-through, nothing to dodge</li>
                  <li>✓ 3x more reps per session vs traditional training</li>
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
                img: '/assets/set_it.jpg',
              },
              {
                num: '02',
                title: 'SWING',
                sub: 'Hit the Target',
                desc: 'Swing through freely — the bungee cord snaps the ball right back into position. No re-placing, no tee to avoid.',
                img: '/assets/second_swing.jpg',
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
                name: 'B. Johnson',
                role: 'High School Varsity Coach',
              },
              {
                quote: '"The Sultan of Swing is a sturdy hitting tool that is easy & quick to assemble! It\'s great for extra swings on the side of actual batting practice where you don\'t have to pick up all of the baseballs. Its portability, easy set up and close down, allows us to take it anywhere. No more nets, buckets, and retrievers. The Sultan of Swing is a big saver of time!"',
                name: 'Alec Adame',
                role: 'East Los Angeles College — Professor & Head Baseball Coach, Kinesiology | Athletics',
              },
              {
                quote: '"I bought two. One for my son, one for the team. Best investment I\'ve made in training equipment."',
                name: 'J. Hill',
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
            ORDER NOW
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
          <img src="/assets/sultan-logo.png" alt="Sultan of Swing" className="h-10" />
          <p className="text-gray-600 text-xs">© 2026 Sultan of Swing. All rights reserved.</p>
          <div className="flex items-center gap-6 text-gray-600 text-xs tracking-widest">
            <div className="flex items-center gap-5">
              <a
                href="https://www.facebook.com/profile.php?id=61589085730405"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sultan of Swing on Facebook"
                className="hover:opacity-80 transition-opacity"
              >
                <svg viewBox="0 0 24 24" fill="#1877F2" className="h-8 w-8" aria-hidden="true">
                  <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07Z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/sultan.of.swing.ai/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sultan of Swing on Instagram"
                className="hover:opacity-80 transition-opacity"
              >
                <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
                  <defs>
                    <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#feda75" />
                      <stop offset="25%" stopColor="#fa7e1e" />
                      <stop offset="50%" stopColor="#d62976" />
                      <stop offset="75%" stopColor="#962fbf" />
                      <stop offset="100%" stopColor="#4f5bd5" />
                    </linearGradient>
                  </defs>
                  <path fill="url(#ig-gradient)" d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07Zm0 1.62c-3.15 0-3.52.01-4.76.07-.97.04-1.5.21-1.85.34-.46.18-.8.39-1.15.74-.35.35-.56.69-.74 1.15-.13.35-.3.88-.34 1.85-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.04.97.21 1.5.34 1.85.18.46.39.8.74 1.15.35.35.69.56 1.15.74.35.13.88.3 1.85.34 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c.97-.04 1.5-.21 1.85-.34.46-.18.8-.39 1.15-.74.35-.35.56-.69.74-1.15.13-.35.3-.88.34-1.85.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.04-.97-.21-1.5-.34-1.85a3.1 3.1 0 0 0-.74-1.15 3.1 3.1 0 0 0-1.15-.74c-.35-.13-.88-.3-1.85-.34-1.24-.06-1.61-.07-4.76-.07Zm0 2.76a5.46 5.46 0 1 1 0 10.92 5.46 5.46 0 0 1 0-10.92Zm0 9a3.54 3.54 0 1 0 0-7.08 3.54 3.54 0 0 0 0 7.08Zm6.95-9.22a1.28 1.28 0 1 1-2.55 0 1.28 1.28 0 0 1 2.55 0Z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@SultanofSwingAI"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sultan of Swing on YouTube"
                className="hover:opacity-80 transition-opacity"
              >
                <svg viewBox="0 0 24 24" fill="#FF0000" className="h-8 w-8" aria-hidden="true">
                  <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
                </svg>
              </a>
            </div>
            <a href="/privacy" className="hover:text-orange-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Terms</a>
            <a href="mailto:sultan.of.swing.sales@gmail.com" className="hover:text-orange-500 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* ── VIDEO MODAL ── */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeVideo}
        >
          {/* Close button — fixed to top-right of screen, always on top of everything */}
          <button
            onClick={closeVideo}
            style={oswald}
            className="fixed top-5 right-5 z-[60] bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm tracking-widest px-5 py-3 transition-colors shadow-xl"
          >
            ✕ CLOSE
          </button>

          <div
            className="relative w-full max-w-3xl"
            onClick={e => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              src="/assets/30_second_ad_compressed.mp4?v=2"
              controls
              autoPlay
              className="w-full shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
