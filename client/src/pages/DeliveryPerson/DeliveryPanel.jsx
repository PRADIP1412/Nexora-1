import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DeliveryDashboardProvider } from '../../context/DeliveryPersonDashboardContext';

// Import all delivery context providers
import { ActiveDeliveriesProvider } from '../../context/delivery_panel/ActiveDeliveriesContext';
import { PendingPickupsProvider } from '../../context/delivery_panel/PendingPickupsContext';
import { CompletedDeliveriesProvider } from '../../context/delivery_panel/CompletedDeliveriesContext';
import { EarningsProvider } from '../../context/delivery_panel/EarningsContext';
import { PerformanceProvider } from '../../context/delivery_panel/PerformanceContext';
import { ScheduleProvider } from '../../context/delivery_panel/ScheduleContext';
import { VehicleProvider } from '../../context/delivery_panel/VehicleContext';
import { SupportProvider } from '../../context/delivery_panel/SupportContext';
import { DeliveryProfileProvider } from '../../context/delivery_panel/DeliveryProfileContext';

// Import Error Boundary
import DeliveryErrorBoundary from '../../components/DeliveryPerson/Common/ErrorBoundary';
import { DeliveryReportsProvider } from '../../context/delivery_panel/DeliveryReportsContext';
import { AvailableDeliveriesProvider } from '../../context/delivery_panel/AvailableDeliveriesContext';

// IMPORT THE MISSING PROVIDERS
import { DeliveryPersonProvider } from '../../context/DeliveryPersonContext';
import { NotificationProvider } from '../../context/NotificationContext';

// Import pages - using lazy loading for better performance
const DeliveryDashboard = React.lazy(() => import('./Dashboard/Dashboard'));
const ActiveDeliveries = React.lazy(() => import('./ActiveDeliveries/ActiveDeliveries'));
const PendingPickups = React.lazy(() => import('./PendingPickups/PendingPickups'));
const CompletedDeliveries = React.lazy(() => import('./CompletedDeliveries/CompletedDeliveries'));
const Earnings = React.lazy(() => import('./Earnings/Earnings'));
const Performance = React.lazy(() => import('./Performance/Performance'));
const Schedule = React.lazy(() => import('./Schedule/Schedule'));
const Vehicle = React.lazy(() => import('./Vehicle/Vehicle'));
const Support = React.lazy(() => import('./Support/Support'));
const Profile = React.lazy(() => import('./Profile/Profile'));
const Reports = React.lazy(() => import('./Reports/Reports'));
const AvailableDeliveries = React.lazy(() => import('./AvailableDeliveries/AvailableDeliveries'));
const Notification = React.lazy(() => import('./Notification/Notification'));

// Create a Loading component
const LoadingFallback = () => (
  <div className="delivery-loading">
    <div className="loading-spinner"></div>
    <p>Loading delivery panel...</p>
  </div>
);

// Wrapper component for all delivery context providers
const DeliveryProviders = ({ children }) => (
  <DeliveryPersonProvider> {/* ADD THIS FIRST - Header needs it */}
    <NotificationProvider> {/* ADD THIS SECOND - Header needs it */}
      <DeliveryDashboardProvider>
        <ActiveDeliveriesProvider>
          <PendingPickupsProvider>
            <CompletedDeliveriesProvider>
              <EarningsProvider>
                <PerformanceProvider>
                  <ScheduleProvider>
                    <VehicleProvider>
                      <SupportProvider>
                        <DeliveryProfileProvider>
                          <DeliveryReportsProvider>
                            <AvailableDeliveriesProvider>
                              {children}
                            </AvailableDeliveriesProvider>
                          </DeliveryReportsProvider>
                        </DeliveryProfileProvider>
                      </SupportProvider>
                    </VehicleProvider>
                  </ScheduleProvider>
                </PerformanceProvider>
              </EarningsProvider>
            </CompletedDeliveriesProvider>
          </PendingPickupsProvider>
        </ActiveDeliveriesProvider>
      </DeliveryDashboardProvider>
    </NotificationProvider>
  </DeliveryPersonProvider>
);

// Main DeliveryPanel Component
const DeliveryPanel = () => {
  return (
    <DeliveryProviders>
      <DeliveryErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Default route - redirect to dashboard */}
            <Route path="/" element={<Navigate to="/delivery/dashboard" replace />} />
            
            {/* Dashboard */}
            <Route path="dashboard" element={<DeliveryDashboard />} />
            
            {/* Active Deliveries */}
            <Route path="active-deliveries" element={<ActiveDeliveries />} />
            
            {/* Available Deliveries */}
            <Route path="available-deliveries" element={<AvailableDeliveries />} />

            {/* Pending Pickups */}
            <Route path="pending-pickup" element={<PendingPickups />} />
            
            {/* Completed Deliveries */}
            <Route path="completed" element={<CompletedDeliveries />} />
            
            {/* Earnings Page */}
            <Route path="earnings" element={<Earnings />} />
            
            {/* Performance Page */}
            <Route path="performance" element={<Performance />} />
            
            {/* Schedule Page */}
            <Route path="schedule" element={<Schedule />} />
            
            {/* Vehicle Page */}
            <Route path="vehicle" element={<Vehicle />} />
            
            {/* Support Page */}
            <Route path="support" element={<Support />} />
            
            {/* Profile Page */}
            <Route path="profile" element={<Profile />} />
            
            {/* Reports Page */}
            <Route path="reports" element={<Reports />} />
            
            <Route path="notifications" element={<Notification />} />

            {/* Catch-all route - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/delivery/dashboard" replace />} />
          </Routes>
        </Suspense>
      </DeliveryErrorBoundary>
    </DeliveryProviders>
  );
};

// Add CSS for loading spinner
const styles = `
.delivery-loading {
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

.delivery-loading p {
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

export default DeliveryPanel;