export default function Footer() {
  return (
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
  )
}
