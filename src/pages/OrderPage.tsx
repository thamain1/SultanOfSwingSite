import { useState } from 'react'
import { Link } from 'react-router-dom'

const oswald = { fontFamily: 'Oswald, sans-serif' }

export default function OrderPage() {
  const [qty, setQty] = useState(1)
  const unitPrice = 349
  const shipping = 0 // free shipping placeholder
  const total = unitPrice * qty + shipping

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '',
    cardName: '', cardNumber: '', expiry: '', cvv: '',
  })

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Order system coming soon! Payment processor integration in progress.')
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Top bar */}
      <div className="border-b border-white/10 bg-black/95 px-4 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" style={oswald} className="text-white font-bold tracking-widest hover:text-orange-500 transition-colors">
          ← SULTAN <span className="text-orange-500">OF SWING</span>
        </Link>
        <div className="flex items-center gap-2 text-gray-400 text-xs tracking-widest">
          <span className="text-orange-500">🔒</span> SECURE CHECKOUT
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 style={oswald} className="text-4xl font-bold uppercase mb-2">YOUR ORDER</h1>
        <p className="text-gray-500 text-sm mb-12 tracking-widest">Complete your purchase below</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ── FORM (left) ── */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8">

            {/* Contact */}
            <div>
              <h2 style={oswald} className="text-lg font-bold uppercase tracking-widest border-b border-white/10 pb-3 mb-5">
                01 — Contact Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handle}
                  className="bg-zinc-900 border border-white/10 focus:border-orange-500 text-white px-4 py-3 text-sm outline-none transition-colors col-span-1" required />
                <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handle}
                  className="bg-zinc-900 border border-white/10 focus:border-orange-500 text-white px-4 py-3 text-sm outline-none transition-colors col-span-1" required />
                <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handle}
                  className="bg-zinc-900 border border-white/10 focus:border-orange-500 text-white px-4 py-3 text-sm outline-none transition-colors col-span-2" required />
                <input name="phone" type="tel" placeholder="Phone (optional)" value={form.phone} onChange={handle}
                  className="bg-zinc-900 border border-white/10 focus:border-orange-500 text-white px-4 py-3 text-sm outline-none transition-colors col-span-2" />
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h2 style={oswald} className="text-lg font-bold uppercase tracking-widest border-b border-white/10 pb-3 mb-5">
                02 — Shipping Address
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <input name="address" placeholder="Street Address" value={form.address} onChange={handle}
                  className="bg-zinc-900 border border-white/10 focus:border-orange-500 text-white px-4 py-3 text-sm outline-none transition-colors col-span-2" required />
                <input name="city" placeholder="City" value={form.city} onChange={handle}
                  className="bg-zinc-900 border border-white/10 focus:border-orange-500 text-white px-4 py-3 text-sm outline-none transition-colors" required />
                <input name="state" placeholder="State" value={form.state} onChange={handle}
                  className="bg-zinc-900 border border-white/10 focus:border-orange-500 text-white px-4 py-3 text-sm outline-none transition-colors" required />
                <input name="zip" placeholder="ZIP Code" value={form.zip} onChange={handle}
                  className="bg-zinc-900 border border-white/10 focus:border-orange-500 text-white px-4 py-3 text-sm outline-none transition-colors col-span-2" required />
              </div>
            </div>

            {/* Payment */}
            <div>
              <h2 style={oswald} className="text-lg font-bold uppercase tracking-widest border-b border-white/10 pb-3 mb-5">
                03 — Payment
              </h2>
              <div className="border border-dashed border-orange-500/40 bg-orange-500/5 p-4 mb-5 text-center">
                <p className="text-orange-400 text-xs tracking-widest" style={oswald}>
                  PAYMENT PROCESSOR INTEGRATION PENDING
                </p>
                <p className="text-gray-500 text-xs mt-1">Stripe / Square / PayPal will be connected here</p>
              </div>
              <div className="grid grid-cols-2 gap-4 opacity-60 pointer-events-none">
                <input name="cardName" placeholder="Name on Card" value={form.cardName} onChange={handle}
                  className="bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm outline-none col-span-2" />
                <input name="cardNumber" placeholder="Card Number  ···· ···· ···· ····" value={form.cardNumber} onChange={handle}
                  className="bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm outline-none col-span-2" />
                <input name="expiry" placeholder="MM / YY" value={form.expiry} onChange={handle}
                  className="bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm outline-none" />
                <input name="cvv" placeholder="CVV" value={form.cvv} onChange={handle}
                  className="bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm outline-none" />
              </div>
            </div>

            <button
              type="submit"
              style={oswald}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-5 text-xl tracking-widest uppercase transition-all hover:scale-[1.01] shadow-lg shadow-orange-500/20"
            >
              PLACE ORDER — ${total.toLocaleString()}
            </button>

            <p className="text-gray-600 text-xs text-center tracking-wide">
              🔒 Your payment info is encrypted and secure. We never store card details.
            </p>
          </form>

          {/* ── ORDER SUMMARY (right) ── */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-950 border border-white/10 p-6 sticky top-6">
              <h2 style={oswald} className="text-lg font-bold uppercase tracking-widest border-b border-white/10 pb-3 mb-6">
                Order Summary
              </h2>

              {/* Product */}
              <div className="flex gap-4 mb-6">
                <div className="w-24 h-24 overflow-hidden flex-shrink-0 border border-white/10">
                  <img
                    src="/assets/Screenshot_20260226_212809_Gallery.jpg"
                    alt="Sultan of Swing"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="flex-1">
                  <p style={oswald} className="text-white font-bold tracking-wide">SULTAN OF SWING</p>
                  <p className="text-gray-500 text-xs mt-1">Training Device — Standard</p>
                  <p className="text-orange-500 font-bold mt-2">${unitPrice}</p>
                </div>
              </div>

              {/* Qty */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-gray-400 text-sm tracking-widest">QUANTITY</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 border border-white/20 text-white hover:border-orange-500 transition-colors flex items-center justify-center"
                  >
                    −
                  </button>
                  <span style={oswald} className="text-white font-bold w-6 text-center text-lg">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(q => q + 1)}
                    className="w-8 h-8 border border-white/20 text-white hover:border-orange-500 transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-5 space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Subtotal</span>
                  <span>${(unitPrice * qty).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Shipping</span>
                  <span className="text-green-400">FREE</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg pt-3 border-t border-white/10" style={oswald}>
                  <span>TOTAL</span>
                  <span className="text-orange-500">${total.toLocaleString()}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="space-y-2">
                {[
                  { icon: '✓', text: 'Free Shipping' },
                  { icon: '✓', text: '30-Day Guarantee' },
                  { icon: '✓', text: 'Durable & Portable' },
                  { icon: '🔒', text: 'Secure Checkout' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-gray-500 text-xs tracking-widest">
                    <span className="text-orange-500">{icon}</span> {text}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
