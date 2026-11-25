import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import OrderPage from './pages/OrderPage'
import VideosPage from './pages/VideosPage'
import OrderConfirmation from './pages/OrderConfirmation'
import PrivacyPage from './pages/PrivacyPage'
import { CartProvider } from './lib/cart'
import ScrollToTop from './components/ScrollToTop'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CartProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/order/confirmation" element={<OrderConfirmation />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}
