import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import Admin Context Providers
import { DashboardProvider } from '../../context/admin/DashboardContext';
import { ProductProvider } from '../../context/ProductContext';
import { CategoryProvider } from '../../context/CategoryContext';
import { BrandProvider } from '../../context/BrandContext';
import { AttributeProvider } from '../../context/AttributeContext';
import { ProductReviewProvider } from '../../context/ProductReviewContext';
import { MediaProvider } from '../../context/MediaContext';
import { VariantProvider } from '../../context/VariantContext';
import { CustomerProvider } from '../../context/CustomerContext';
import { OrderAdminProvider } from '../../context/OrderAdminContext';
import { MarketingProvider } from '../../context/MarketingContext';
import { DeliveryProvider } from '../../context/DeliveryContext';
import { InventoryProvider } from '../../context/InventoryContext';
import { AnalyticsProvider } from '../../context/AnalyticsContext';
import { NotificationAdminProvider } from '../../context/NotificationAdminContext';
import { ReportsProvider } from '../../context/ReportsContext';
import { SystemProvider } from '../../context/SystemContext';

// Import Error Boundary (you may need to create this)
import AdminErrorBoundary from '../../components/DeliveryPerson/Common/ErrorBoundary';

// Import all admin pages using lazy loading
const AdminDashboard = React.lazy(() => import('./Dashboard/Dashboard'));
const System = React.lazy(() => import('./System/System'));
const Reports = React.lazy(() => import('./Reports/Reports'));
const Analytics = React.lazy(() => import('./Analytics/Analytics'));
const Inventory = React.lazy(() => import('./Inventory/Inventory'));

// Product Catalog
const ProductsPage = React.lazy(() => import('./ProductCatalog/Products'));
const CategoriesPage = React.lazy(() => import('./ProductCatalog/Categories'));
const BrandsPage = React.lazy(() => import('./ProductCatalog/Brands'));
const AttributesPage = React.lazy(() => import('./ProductCatalog/Attributes'));
const VariantsPage = React.lazy(() => import('./ProductCatalog/Variants'));
const ReviewsPage = React.lazy(() => import('./ProductCatalog/Review'));

// Users Management
const CustomersPage = React.lazy(() => import('./Users/Customers/Customers'));
const CustomerDetails = React.lazy(() => import('../../components/Admin/Users/Customers/CustomerDetails'));
const CustomerForm = React.lazy(() => import('../../components/Admin/Users/Customers/CustomerForm'));
const DeliveryPersonsPage = React.lazy(() => import('./Users/DeliveryPersons/DeliveryPersons'));

// Orders Management
const AdminOrders = React.lazy(() => import('./Orders/Orders'));
const AdminOrderDetails = React.lazy(() => import('./Orders/OrderDetails'));
const AdminReturns = React.lazy(() => import('./Orders/Returns'));
const AdminRefunds = React.lazy(() => import('./Orders/Refunds'));
const AdminDeliveryManagement = React.lazy(() => import('./Orders/DeliveryManagement'));
const AdminOrderAnalytics = React.lazy(() => import('./Orders/OrderAnalytics'));

// Other Admin Pages
const Delivery = React.lazy(() => import('./Delivery/Delivery'));
const Marketing = React.lazy(() => import('./Marketing/Marketing'));
const NotificationAdminPage = React.lazy(() => import('./Notification/Notification'));

// Create a Loading component
const LoadingFallback = () => (
  <div className="admin-loading">
    <div className="loading-spinner"></div>
    <p>Loading admin panel...</p>
  </div>
);

// Main AdminPanel Component
const AdminPanel = () => {
  return (
    <AdminErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Default route - redirect to dashboard */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Dashboard */}
          <Route 
            path="dashboard" 
            element={
              <DashboardProvider>
                <AdminDashboard />
              </DashboardProvider>
            } 
          />
          
          {/* System Management */}
          <Route 
            path="system/*" 
            element={
              <SystemProvider>
                <System />
              </SystemProvider>
            } 
          />
          
          {/* Reports */}
          <Route 
            path="reports" 
            element={
              <ReportsProvider>
                <Reports />
              </ReportsProvider>
            } 
          />
          
          {/* Alternative reports route for backward compatibility */}
          <Route 
            path="analytics/reports" 
            element={
              <ReportsProvider>
                <Reports />
              </ReportsProvider>
            } 
          />
          
          {/* Analytics */}
          <Route 
            path="analytics" 
            element={
              <AnalyticsProvider>
                <Analytics />
              </AnalyticsProvider>
            } 
          />
          
          {/* Inventory */}
          <Route 
            path="inventory/*" 
            element={
              <InventoryProvider>
                <Inventory />
              </InventoryProvider>
            } 
          />
          
          {/* Direct Inventory Routes (for backward compatibility) */}
          <Route 
            path="/inventory/*" 
            element={
              <InventoryProvider>
                <Inventory />
              </InventoryProvider>
            } 
          />
          
          {/* Product Catalog */}
          <Route 
            path="products" 
            element={
              <ProductProvider>
                <ProductsPage />
              </ProductProvider>
            } 
          />
          
          <Route 
            path="categories" 
            element={
              <CategoryProvider>
                <CategoriesPage />
              </CategoryProvider>
            } 
          />
          
          <Route 
            path="brands" 
            element={
              <BrandProvider>
                <BrandsPage />
              </BrandProvider>
            } 
          />
          
          <Route 
            path="attributes" 
            element={
              <AttributeProvider>
                <AttributesPage />
              </AttributeProvider>
            } 
          />
          
          <Route 
            path="variants" 
            element={
              <VariantProvider>
                <MediaProvider>
                  <VariantsPage />
                </MediaProvider>
              </VariantProvider>
            } 
          />
          
          <Route 
            path="reviews" 
            element={
              <ProductReviewProvider>
                <ReviewsPage />
              </ProductReviewProvider>
            } 
          />
          
          {/* Customers Management */}
          <Route 
            path="users/customers" 
            element={
              <CustomerProvider>
                <CustomersPage />
              </CustomerProvider>
            } 
          />
          
          {/* Customer Detail Routes */}
          <Route 
            path="users/customers/:customerId" 
            element={
              <CustomerProvider>
                <CustomerDetails />
              </CustomerProvider>
            } 
          />
          
          <Route 
            path="users/customers/edit/:customerId" 
            element={
              <CustomerProvider>
                <CustomerForm mode="edit" />
              </CustomerProvider>
            } 
          />
          
          <Route 
            path="users/customers/create" 
            element={
              <CustomerProvider>
                <CustomerForm mode="create" />
              </CustomerProvider>
            } 
          />
          
          {/* Redirect old /admin/users to customers */}
          <Route 
            path="users" 
            element={
              <CustomerProvider>
                <CustomersPage />
              </CustomerProvider>
            } 
          />
          
          {/* Delivery Persons Management */}
          <Route 
            path="users/delivery-persons/*" 
            element={
              <DeliveryPersonsPage />
            } 
          />
          
          {/* Orders Management */}
          <Route 
            path="orders" 
            element={
              <OrderAdminProvider>
                <AdminOrders />
              </OrderAdminProvider>
            } 
          />
          
          <Route 
            path="orders/:orderId" 
            element={
              <OrderAdminProvider>
                <AdminOrderDetails />
              </OrderAdminProvider>
            } 
          />
          
          <Route 
            path="orders/returns" 
            element={
              <OrderAdminProvider>
                <AdminReturns />
              </OrderAdminProvider>
            } 
          />
          
          <Route 
            path="orders/refunds" 
            element={
              <OrderAdminProvider>
                <AdminRefunds />
              </OrderAdminProvider>
            } 
          />
          
          {/* Admin Delivery Management */}
          <Route 
            path="delivery" 
            element={
              <DeliveryProvider>
                <Delivery />
              </DeliveryProvider>
            } 
          />
          
          {/* Keep the old delivery route for backward compatibility */}
          <Route 
            path="orders/delivery" 
            element={
              <DeliveryProvider>
                <Delivery />
              </DeliveryProvider>
            } 
          />
          
          <Route 
            path="orders/analytics" 
            element={
              <OrderAdminProvider>
                <AdminOrderAnalytics />
              </OrderAdminProvider>
            } 
          />
          
          {/* Keep the old delivery-management route unchanged (in orders) */}
          <Route 
            path="orders/delivery-management" 
            element={
              <OrderAdminProvider>
                <AdminDeliveryManagement />
              </OrderAdminProvider>
            } 
          />
          
          {/* Marketing */}
          <Route 
            path="marketing" 
            element={
              <MarketingProvider>
                <Marketing />
              </MarketingProvider>
            } 
          />
          
          {/* Notification Management */}
          <Route 
            path="notifications" 
            element={
              <NotificationAdminProvider>
                <NotificationAdminPage />
              </NotificationAdminProvider>
            } 
          />
          
          {/* Catch-all route - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Suspense>
    </AdminErrorBoundary>
  );
};

// Add CSS for loading spinner
const styles = `
.admin-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f9fafb;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.admin-loading p {
  color: #6b7280;
  font-size: 16px;
  font-weight: 500;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default AdminPanel;