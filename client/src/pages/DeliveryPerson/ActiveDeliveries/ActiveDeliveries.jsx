import React, { useEffect, useState } from 'react';
import { useActiveDeliveriesContext } from '../../../context/delivery_panel/ActiveDeliveriesContext';
import DeliveryLayout from '../../../components/DeliveryPerson/Layout/DeliveryLayout';
import './ActiveDeliveries.css';

// Import components
import ActiveDeliveryFilters from '../../../components/DeliveryPerson/ActiveDeliveries/ActiveDeliveryFilters';
import ActiveDeliveryList from '../../../components/DeliveryPerson/ActiveDeliveries/ActiveDeliveryList';
import DeliveryActions from '../../../components/DeliveryPerson/ActiveDeliveries/DeliveryActions';

const ActiveDeliveries = () => {
  const {
    activeDeliveries = [],
    deliveryStatistics,
    loading,
    error,
    fetchActiveDeliveries,
    fetchDeliveryStatistics,
    fetchAllActiveDeliveryData
  } = useActiveDeliveriesContext();

  const [filters, setFilters] = useState({
    status: 'all',
    sort: 'nearest'
  });
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchAllActiveDeliveryData();
      } catch (err) {
        setLocalError('Failed to load delivery data');
        console.error('Error loading data:', err);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    try {
      if (Array.isArray(activeDeliveries)) {
        let filtered = [...activeDeliveries];

        // Apply status filter
        if (filters.status !== 'all') {
          filtered = filtered.filter(delivery => {
            if (!delivery?.status) return false;
            
            const deliveryStatus = delivery.status.toLowerCase();
            const filterStatus = filters.status.toLowerCase();
            
            // Map filter status to actual status values
            switch(filterStatus) {
              case 'pending_pickup':
                // Handle 'assigned' or 'pending_pickup' status
                return deliveryStatus === 'assigned' || 
                       deliveryStatus === 'pending' ||
                       deliveryStatus === 'pending_pickup';
              
              case 'picked_up':
                // Handle 'picked_up' status
                return deliveryStatus === 'picked_up' || 
                       deliveryStatus === 'picked';
              
              case 'in_transit':
                // Handle 'in_transit' or 'out_for_delivery' status
                return deliveryStatus === 'in_transit' || 
                       deliveryStatus === 'out_for_delivery' ||
                       deliveryStatus === 'transit';
              
              default:
                return deliveryStatus === filterStatus;
            }
          });
        }

        // Apply sorting
        filtered = sortDeliveries(filtered, filters.sort);
        setFilteredDeliveries(filtered);
      } else {
        setFilteredDeliveries([]);
      }
    } catch (err) {
      console.error('Error filtering deliveries:', err);
      setFilteredDeliveries([]);
    }
  }, [activeDeliveries, filters]);

  const sortDeliveries = (deliveries, sortBy) => {
    if (!Array.isArray(deliveries)) return [];
    
    const sorted = [...deliveries];
    
    switch(sortBy) {
      case 'nearest':
        return sorted.sort((a, b) => {
          // Try to get distance from different possible fields
          const aDist = parseFloat(a.distance_km) || parseFloat(a.distance) || 999;
          const bDist = parseFloat(b.distance_km) || parseFloat(b.distance) || 999;
          return aDist - bDist;
        });
      
      case 'urgent':
        return sorted.sort((a, b) => {
          // Check for priority flags
          const aPriority = a.priority === 'URGENT' || a.is_urgent ? 0 : 1;
          const bPriority = b.priority === 'URGENT' || b.is_urgent ? 0 : 1;
          
          // Sort by priority first
          if (aPriority !== bPriority) return aPriority - bPriority;
          
          // Then by time
          try {
            const aTime = new Date(a.expected_delivery_time || 0);
            const bTime = new Date(b.expected_delivery_time || 0);
            return aTime - bTime;
          } catch {
            return 0;
          }
        });
      
      case 'time':
        return sorted.sort((a, b) => {
          try {
            const aTime = new Date(a.expected_delivery_time || 0);
            const bTime = new Date(b.expected_delivery_time || 0);
            return aTime - bTime;
          } catch {
            return 0;
          }
        });
      
      default:
        return sorted;
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleDeliverySelect = (delivery) => {
    // Make sure delivery is valid
    if (!delivery || !delivery.delivery_id) {
      console.error('Invalid delivery selected:', delivery);
      return;
    }
    setSelectedDelivery(delivery);
  };

  const handleActionComplete = async () => {
    try {
      // Refresh data after action
      await fetchActiveDeliveries();
      setSelectedDelivery(null);
    } catch (err) {
      console.error('Error refreshing after action:', err);
    }
  };

  const getStatusStats = () => {
    if (!Array.isArray(activeDeliveries) || activeDeliveries.length === 0) {
      return {
        pending: 0,
        picked: 0,
        transit: 0
      };
    }

    return {
      pending: activeDeliveries.filter(d => {
        if (!d?.status) return false;
        const status = d.status.toLowerCase();
        return status === 'assigned' || 
               status === 'pending' ||
               status === 'pending_pickup';
      }).length,
      
      picked: activeDeliveries.filter(d => {
        if (!d?.status) return false;
        const status = d.status.toLowerCase();
        return status === 'picked_up' || 
               status === 'picked';
      }).length,
      
      transit: activeDeliveries.filter(d => {
        if (!d?.status) return false;
        const status = d.status.toLowerCase();
        return status === 'in_transit' || 
               status === 'out_for_delivery' ||
               status === 'transit';
      }).length
    };
  };

  // Debug log to see what's happening
  useEffect(() => {
    if (activeDeliveries.length > 0) {
      console.log('Active Deliveries Debug:', {
        total: activeDeliveries.length,
        statuses: activeDeliveries.map(d => d.status),
        filters: filters,
        filteredCount: filteredDeliveries.length,
        statusStats: getStatusStats()
      });
    }
  }, [activeDeliveries, filters, filteredDeliveries]);

  const statusStats = getStatusStats();
  const displayError = error || localError;

  return (
    <DeliveryLayout>
      <div className="active-deliveries-page">
        <div className="page-header">
          <h2>Active Deliveries</h2>
          <ActiveDeliveryFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {displayError && (
          <div className="error-alert">
            <i data-lucide="alert-circle"></i>
            <span>{displayError}</span>
            <button onClick={() => {
              setLocalError(null);
              fetchAllActiveDeliveryData();
            }}>
              <i data-lucide="refresh-cw"></i> Retry
            </button>
          </div>
        )}

        {loading && activeDeliveries.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading active deliveries...</p>
          </div>
        ) : (
          <>
            <div className="deliveries-stats">
              <div className="stat-chip pending">
                <span className="chip-count">{statusStats.pending}</span>
                <span className="chip-label">Pending Pickup</span>
              </div>
              <div className="stat-chip picked">
                <span className="chip-count">{statusStats.picked}</span>
                <span className="chip-label">Picked Up</span>
              </div>
              <div className="stat-chip transit">
                <span className="chip-count">{statusStats.transit}</span>
                <span className="chip-label">In Transit</span>
              </div>
            </div>

            <ActiveDeliveryList 
              deliveries={filteredDeliveries}
              selectedDelivery={selectedDelivery}
              onDeliverySelect={handleDeliverySelect}
              loading={loading}
            />

            {selectedDelivery && (
              <DeliveryActions 
                delivery={selectedDelivery}
                onActionComplete={handleActionComplete}
              />
            )}
          </>
        )}
      </div>
    </DeliveryLayout>
  );
};

export default ActiveDeliveries;