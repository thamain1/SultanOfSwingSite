import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './lib/cart'
import LandingPage from './pages/LandingPage'
import OrderPage from './pages/OrderPage'
import VideosPage from './pages/VideosPage'
import OrderConfirmation from './pages/OrderConfirmation'
import PrivacyPage from './pages/PrivacyPage'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/order/confirmation" element={<OrderConfirmation />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}
