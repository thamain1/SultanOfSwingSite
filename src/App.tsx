import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './lib/cart'
import LandingPage from './pages/LandingPage'
import OrderPage from './pages/OrderPage'
import OrderConfirmation from './pages/OrderConfirmation'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/order/confirmation" element={<OrderConfirmation />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}
