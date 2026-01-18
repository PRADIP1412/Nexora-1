import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/Layout';

// Import Panel Components
import AdminPanel from './pages/Admin/AdminPanel';
import DeliveryPanel from './pages/DeliveryPerson/DeliveryPanel';

// Public Pages
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import ProductsList from './pages/ProductsList/ProductsList';
import ProductDetail from './pages/ProductDetail/ProductDetail';

// Not Authorized Page
import NotAuthorized from './pages/NotAuthorized/NotAuthorized';

// Customer Pages
import Cart from './pages/Cart/Cart';
import Wishlist from './pages/Wishlist/Wishlist';
import Profile from './pages/Profile/Profile';
import Account from './pages/Account/Account';

// Checkout pages
import Checkout from './pages/Checkout/Checkout';
import Shipping from './pages/Shipping/Shipping';
import PaymentProcessing from './pages/PaymentProcessing/PaymentProcessing';
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation';
import GuestCheckout from './pages/GuestCheckout/GuestCheckout';
import AddressVerification from './pages/AddressVerification/AddressVerification';

// Orders
import Orders from './pages/Orders/Orders';
import OrderDetail from './pages/OrderDetail/OrderDetail';
import TrackOrder from './pages/TrackOrder/TrackOrder';
import Invoice from './pages/Invoice/Invoice';

// Extras
import CouponsPage from './pages/Coupon/CouponsPage';
import ApplyCouponPage from './pages/Coupon/ApplyCouponPage';
import OffersPage from './pages/Offer/OffersPage';
import OfferDetailsPage from './pages/Offer/OfferDetailsPage';
import NotificationPage from './pages/Notification/NotificationPage';
import DealsPage from './pages/Deals/DealsPage';
import NewArrivalsPage from './pages/NewArrivals/NewArrivalsPage';

// Protected Routes
import ProtectedRoute from './routes/ProtectedRoute';

// Context Providers
import { ProductProvider } from './context/ProductContext';
import { CategoryProvider } from './context/CategoryContext';
import { BrandProvider } from './context/BrandContext';
import { CatalogProvider } from './context/CatalogContext';
import { AttributeProvider } from './context/AttributeContext';
import { ProductReviewProvider } from './context/ProductReviewContext';
import { MediaProvider } from './context/MediaContext';
import { VariantProvider } from './context/VariantContext';
import { CustomerProvider } from './context/CustomerContext';
import { OrderAdminProvider } from './context/OrderAdminContext';
import { MarketingProvider } from './context/MarketingContext';
import { DeliveryProvider } from './context/DeliveryContext';
import { InventoryProvider } from './context/InventoryContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { NotificationAdminProvider } from './context/NotificationAdminContext';
import { ReportsProvider } from './context/ReportsContext';
import { SystemProvider } from './context/SystemContext';

// Import the Example page and its required providers
import Example from './pages/Example';
import { AvailableDeliveriesProvider } from './context/delivery_panel/AvailableDeliveriesContext';
import { DeliveryReportsProvider } from './context/delivery_panel/DeliveryReportsContext';

import DebugPage from './pages/Debug/DebugPage';
import LandingPage from './pages/LandingPage/LandingPage';

function App() {
  return (
    <>
      <ToastContainer
        autoClose={2000}
        position="top-center"
        theme="colored"
        transition={Slide}
        newestOnTop
        pauseOnHover
        draggable
      />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/guest-checkout" element={<GuestCheckout />} />
        
        {/* Not Authorized Page */}
        <Route path="/not-authorized" element={<NotAuthorized />} />

        {/* ==================== ADMIN PANEL ROUTES ==================== */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* ==================== DELIVERY PERSON PANEL ROUTES ==================== */}
        <Route
          path="/delivery/*"
          element={
            <ProtectedRoute deliveryOnly={true}>
              <DeliveryPanel />
            </ProtectedRoute>
          }
        />
        <Route
            path="/"
            element={
              <ProtectedRoute>
                <LandingPage />
              </ProtectedRoute>
            }
        />  
        {/* ==================== REGULAR USER ROUTES ==================== */}
        {/* Layout Wrapper */}
        <Route element={<Layout />}>
          
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route path="/products" element={<ProductsList />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />

          {/* Checkout */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route path="/shipping" element={<ProtectedRoute><Shipping /></ProtectedRoute>} />
          <Route path="/payment-processing" element={<ProtectedRoute><PaymentProcessing /></ProtectedRoute>} />
          <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
          <Route path="/address-verification" element={<ProtectedRoute><AddressVerification /></ProtectedRoute>} />

          {/* Orders */}
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/orders/:orderId/track" element={<ProtectedRoute><TrackOrder /></ProtectedRoute>} />
          <Route path="/orders/:orderId/invoice" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />

          {/* Extras */}
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/new-arrivals" element={<NewArrivalsPage />} />
          <Route path="/coupons" element={<CouponsPage />} />
          <Route path="/coupons/apply" element={<ApplyCouponPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/offers/:offerId" element={<OfferDetailsPage />} />
        </Route>

        {/* Example page for testing */}
        <Route
          path="/example"
          element={
            <ProtectedRoute deliveryOnly={true}>
              <AvailableDeliveriesProvider>
                <Example />
              </AvailableDeliveriesProvider>
            </ProtectedRoute>
          }
        />
        
        {/* Debug page */}
        <Route path="/debug" element={<DebugPage />} />
      </Routes>
    </>
  );
}

export default App;