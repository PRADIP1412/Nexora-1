import React, { useEffect } from 'react';
import './TodaySchedule.css';
import { 
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useDeliveryDashboardContext } from '../../../context/DeliveryPersonDashboardContext';

const TodaySchedule = () => {
  const { todaySchedule, loading, fetchTodaySchedule, addLog } = useDeliveryDashboardContext();

  useEffect(() => {
    if (!todaySchedule) {
      fetchTodaySchedule();
    }
  }, [todaySchedule, fetchTodaySchedule]);

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'ongoing':
        return <Clock size={16} className="status-icon ongoing" />;
      case 'completed':
        return <CheckCircle size={16} className="status-icon completed" />;
      case 'upcoming':
        return <AlertCircle size={16} className="status-icon upcoming" />;
      default:
        return <AlertCircle size={16} className="status-icon upcoming" />;
    }
  };

  const getStatusText = (status) => {
    switch(status?.toLowerCase()) {
      case 'ongoing': return 'Ongoing';
      case 'completed': return 'Completed';
      case 'upcoming': return 'Upcoming';
      default: return 'Scheduled';
    }
  };

  if (loading && !todaySchedule) {
    return (
      <div className="today-schedule">
        <div className="schedule-header loading">
          <div className="header-left">
            <div className="loading-icon"></div>
            <div className="loading-line medium"></div>
          </div>
          <div className="current-date loading-line small"></div>
        </div>
        
        <div className="next-delivery loading">
          <div className="next-delivery-header">
            <div className="loading-line medium"></div>
            <div className="delivery-time loading-line small"></div>
          </div>
          
          <div className="delivery-details">
            <div className="delivery-id">
              <div className="loading-line"></div>
              <div className="loading-line small"></div>
            </div>
            <div className="delivery-info">
              <div className="loading-icon small"></div>
              <div className="loading-line"></div>
            </div>
          </div>
        </div>

        <div className="shifts-list loading">
          <div className="loading-line medium"></div>
          <div className="timeline">
            {[1, 2, 3].map((i) => (
              <div key={i} className="timeline-item loading">
                <div className="timeline-marker">
                  <div className="loading-icon"></div>
                </div>
                <div className="timeline-content">
                  <div className="loading-line"></div>
                  <div className="loading-line small"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!todaySchedule) {
    return (
      <div className="today-schedule">
        <div className="schedule-header">
          <div className="header-left">
            <Calendar size={20} />
            <h3>Today's Schedule</h3>
          </div>
          <span className="current-date">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
        <div className="no-data">
          <p>No schedule data available.</p>
          <button onClick={fetchTodaySchedule} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="today-schedule">
      <div className="schedule-header">
        <div className="header-left">
          <Calendar size={20} />
          <h3>Today's Schedule</h3>
        </div>
        <span className="current-date">{todaySchedule.date}</span>
      </div>

      <div className="next-delivery">
        <div className="next-delivery-header">
          <h4>Next Delivery</h4>
          {todaySchedule.next_delivery?.time && todaySchedule.next_delivery.time !== 'N/A' && (
            <span className="delivery-time">
              <Clock size={14} />
              {todaySchedule.next_delivery.time}
            </span>
          )}
        </div>
        
        {todaySchedule.next_delivery && todaySchedule.next_delivery.id !== 'No deliveries' ? (
          <div className="delivery-details">
            <div className="delivery-id">
              <strong>#{todaySchedule.next_delivery.id}</strong>
              <span>{todaySchedule.next_delivery.customer}</span>
            </div>
            
            <div className="delivery-info">
              <MapPin size={14} />
              <span>{todaySchedule.next_delivery.address}</span>
            </div>
            
            <div className="delivery-distance">
              <span>{todaySchedule.next_delivery.distance} away</span>
            </div>
          </div>
        ) : (
          <div className="no-next-delivery">
            <p>No upcoming deliveries scheduled</p>
          </div>
        )}
      </div>

      <div className="shifts-list">
        <h4>Today's Shifts</h4>
        
        {todaySchedule.upcoming_shifts?.length > 0 ? (
          <div className="timeline">
            {todaySchedule.upcoming_shifts.map((shift, index) => (
              <div 
                key={shift.id} 
                className={`timeline-item ${shift.type} ${shift.status}`}
              >
                <div className="timeline-marker">
                  {getStatusIcon(shift.status)}
                </div>
                
                <div className="timeline-content">
                  <div className="shift-header">
                    <div className="shift-title">
                      <strong>{shift.title}</strong>
                      <span className="shift-time">{shift.time}</span>
                    </div>
                    <span className={`shift-status ${shift.status}`}>
                      {getStatusText(shift.status)}
                    </span>
                  </div>
                  
                  {shift.location && (
                    <div className="shift-location">
                      <MapPin size={14} />
                      <span>{shift.location}</span>
                    </div>
                  )}
                  
                  {shift.completedTasks !== undefined && shift.totalTasks !== undefined && (
                    <div className="shift-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${(shift.completedTasks / shift.totalTasks) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {shift.completedTasks}/{shift.totalTasks} tasks completed
                      </span>
                    </div>
                  )}
                  
                  {shift.scheduledDeliveries && (
                    <div className="shift-deliveries">
                      <span>{shift.scheduledDeliveries} deliveries scheduled</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-shifts">
            <p>No shifts scheduled for today</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaySchedule;