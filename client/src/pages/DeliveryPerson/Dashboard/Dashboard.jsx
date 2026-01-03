import React from 'react';
import DeliveryLayout from '../../../components/DeliveryPerson/Layout/DeliveryLayout';
import DashboardStats from '../../../components/DeliveryPerson/Dashboard/DashboardStats';
import QuickActions from '../../../components/DeliveryPerson/Dashboard/QuickActions';
import ActiveOrdersGrid from '../../../components/DeliveryPerson/Dashboard/ActiveOrdersGrid';
import EarningsOverview from '../../../components/DeliveryPerson/Dashboard/EarningsOverview';
import TodaySchedule from '../../../components/DeliveryPerson/Dashboard/TodaySchedule';
import './Dashboard.css'; // Make sure this exists

const DeliveryDashboard = () => {
  return (
    <DeliveryLayout>
      <div className="dashboard-page">
        <div className="page-header">
          <h1>Dashboard</h1>
        </div>
        
        <DashboardStats />
        <QuickActions />
        <ActiveOrdersGrid />
        
        <div className="grid-section">
          <EarningsOverview />
          <TodaySchedule />
        </div>
      </div>
    </DeliveryLayout>
  );
};

export default DeliveryDashboard;