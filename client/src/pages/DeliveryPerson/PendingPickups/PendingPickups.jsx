import React, { useEffect, useState } from 'react';
import { usePendingPickupsContext } from '../../../context/delivery_panel/PendingPickupsContext';
import DeliveryLayout from '../../../components/DeliveryPerson/Layout/DeliveryLayout';
import PickupList from '../../../components/DeliveryPerson/PendingPickups/PickupList';
import PickupActions from '../../../components/DeliveryPerson/PendingPickups/PickupActions';
import './PendingPickups.css';

const PendingPickups = () => {
  const {
    groupedPickups = [],
    pickupStats,
    loading,
    error,
    fetchAllPickupData,
    fetchPendingPickups
  } = usePendingPickupsContext();

  const [filters, setFilters] = useState({
    vendor_type: 'all',
    sort_by: 'nearest'
  });
  const [selectedPickup, setSelectedPickup] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchAllPickupData();
      } catch (err) {
        console.error('Error loading pickup data:', err);
      }
    };
    
    loadData();
  }, []);

  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: value
    };
    setFilters(newFilters);
    
    // Apply filters by fetching new data
    fetchPendingPickups(newFilters);
  };

  const handlePickupSelect = (pickup) => {
    // Validate pickup before selection
    if (!pickup || !pickup.delivery_id) {
      console.error('Invalid pickup selected');
      return;
    }
    setSelectedPickup(pickup);
  };

  const handleActionComplete = async () => {
    try {
      // Refresh data after action
      await fetchPendingPickups(filters);
      setSelectedPickup(null);
    } catch (err) {
      console.error('Error refreshing after action:', err);
    }
  };

  // Get total packages count from stats
  const getTotalPackages = () => {
    if (!pickupStats || !pickupStats.total_packages) {
      return groupedPickups.reduce((total, location) => {
        return total + (location.pickups?.length || 0);
      }, 0);
    }
    return pickupStats.total_packages;
  };

  // Get total locations count
  const getTotalLocations = () => {
    return groupedPickups.length;
  };

  return (
    <DeliveryLayout>
      <div className="pending-pickups-page">
        <div className="page-header">
          <h2>Pending Pickup</h2>
          <div className="filters">
            <select 
              className="filter-select"
              value={filters.vendor_type}
              onChange={(e) => handleFilterChange('vendor_type', e.target.value)}
            >
              <option value="all">All Pickup Locations</option>
              <option value="store">Stores</option>
              <option value="warehouse">Warehouses</option>
              <option value="vendor">Vendors</option>
              <option value="supplier">Suppliers</option>
            </select>
            <select 
              className="filter-select"
              value={filters.sort_by}
              onChange={(e) => handleFilterChange('sort_by', e.target.value)}
            >
              <option value="nearest">Sort: Nearest First</option>
              <option value="time_slot">Sort: Time Slot</option>
              <option value="package_size">Sort: Package Size</option>
              <option value="priority">Sort: Priority</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="error-alert">
            <i data-lucide="alert-circle"></i>
            <span>{error}</span>
            <button onClick={() => fetchAllPickupData()}>
              <i data-lucide="refresh-cw"></i> Retry
            </button>
          </div>
        )}

        {loading && groupedPickups.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading pending pickups...</p>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="pickup-summary">
              <div className="summary-card">
                <div className="summary-icon">
                  <i data-lucide="package"></i>
                </div>
                <div className="summary-info">
                  <strong>{getTotalPackages()}</strong>
                  <span>Packages to Pickup</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">
                  <i data-lucide="map-pin"></i>
                </div>
                <div className="summary-info">
                  <strong>{getTotalLocations()}</strong>
                  <span>Pickup Locations</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">
                  <i data-lucide="clock"></i>
                </div>
                <div className="summary-info">
                  <strong>{pickupStats?.average_pickup_time || 'N/A'}</strong>
                  <span>Avg Pickup Time</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">
                  <i data-lucide="calendar-clock"></i>
                </div>
                <div className="summary-info">
                  <strong>{pickupStats?.urgent_pickups || 0}</strong>
                  <span>Urgent Pickups</span>
                </div>
              </div>
            </div>

            <PickupList 
              groupedPickups={groupedPickups}
              selectedPickup={selectedPickup}
              onPickupSelect={handlePickupSelect}
              loading={loading}
            />

            {selectedPickup && (
              <PickupActions 
                pickup={selectedPickup}
                onActionComplete={handleActionComplete}
              />
            )}
          </>
        )}
      </div>
    </DeliveryLayout>
  );
};

export default PendingPickups;