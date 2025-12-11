import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/Layout';

// Pages
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import ProductsList from './pages/ProductsList/ProductsList';
import ProductDetail from './pages/ProductDetail/ProductDetail';
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

// Admin Product Catalog Pages
import ProductsPage from './pages/Admin/ProductCatalog/Products';
import CategoriesPage from './pages/Admin/ProductCatalog/Categories';
import BrandsPage from './pages/Admin/ProductCatalog/Brands';
import AttributesPage from './pages/Admin/ProductCatalog/Attributes';
import MediaPage from './pages/Admin/ProductCatalog/Media';

// Protected Routes
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

// Admin
import AdminDashboard from './pages/Admin/Dashboard/Dashboard';
import DebugPage from './pages/Debug/DebugPage';
import { DashboardProvider } from './context/admin/DashboardContext';

// Context Providers
import { ProductProvider } from './context/ProductContext';
import { CategoryProvider } from './context/CategoryContext';
import { BrandProvider } from './context/BrandContext';
import { CatalogProvider } from './context/CatalogContext';
import ReviewsPage from './pages/Admin/ProductCatalog/Review';
import { AttributeProvider } from './context/AttributeContext';

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

        {/* Layout Wrapper */}
        <Route element={<Layout />}>
          <Route
            path="/"
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

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <DashboardProvider>
                <AdminDashboard />
              </DashboardProvider>
            </ProtectedRoute>
          }
        />

        {/* Admin Product Catalog Routes */}
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute adminOnly={true}>
              <ProductProvider>
                <ProductsPage />
              </ProductProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute adminOnly={true}>
              <CategoryProvider>
                <CategoriesPage />
              </CategoryProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/brands"
          element={
            <ProtectedRoute adminOnly={true}>
              <BrandProvider>
                <BrandsPage />
              </BrandProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/attributes"
          element={
            <ProtectedRoute adminOnly={true}>
              <AttributeProvider>
                <AttributesPage />
              </AttributeProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/media"
          element={
            <ProtectedRoute adminOnly={true}>
              <CatalogProvider>
                <MediaPage />
              </CatalogProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reviews"
          element={
            <ProtectedRoute adminOnly={true}>
              <CatalogProvider>
                <ReviewsPage />
              </CatalogProvider>
            </ProtectedRoute>
          }
        />

        <Route path="/debug" element={<DebugPage />} />
      </Routes>
    </>
  );
}

export default App;