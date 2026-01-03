import React from 'react';
import './TodayShift.css';

const TodayShift = ({ todayShift, loading, onRefresh }) => {
    if (loading && !todayShift) {
        return (
            <div className="today-shift-card loading">
                <div className="shift-header-skeleton"></div>
                <div className="shift-details-skeleton">
                    <div className="detail-item-skeleton"></div>
                    <div className="detail-item-skeleton"></div>
                </div>
                <div className="shift-actions-skeleton"></div>
            </div>
        );
    }

    // Safe data access
    const getShiftData = () => {
        if (!todayShift || !todayShift.shift) {
            return {
                date: 'Today',
                day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
                time: '9:00 AM - 6:00 PM',
                location: 'Gandhinagar Zone',
                status: 'Scheduled',
                shift_type: 'Regular'
            };
        }

        const shift = todayShift.shift;
        return {
            date: shift.date || 'Today',
            day: shift.day || new Date().toLocaleDateString('en-US', { weekday: 'long' }),
            time: shift.time_slot || shift.start_time && shift.end_time 
                ? `${shift.start_time} - ${shift.end_time}`
                : '9:00 AM - 6:00 PM',
            location: shift.location || shift.zone || 'Gandhinagar Zone',
            status: shift.status || 'Scheduled',
            shift_type: shift.shift_type || 'Regular'
        };
    };

    const shiftData = getShiftData();

    return (
        <div className="today-shift-card">
            <div className="shift-header">
                <div className="shift-title">
                    <h3>Today's Shift</h3>
                    <span className="shift-date">{shiftData.date} • {shiftData.day}</span>
                </div>
                <button 
                    className="refresh-btn"
                    onClick={onRefresh}
                    disabled={loading}
                    title="Refresh shift data"
                >
                    <i data-lucide="refresh-cw"></i>
                </button>
            </div>
            
            <div className="shift-details">
                <div className="detail-item">
                    <div className="detail-icon">
                        <i data-lucide="clock"></i>
                    </div>
                    <div className="detail-info">
                        <span className="detail-label">Shift Time</span>
                        <span className="detail-value">{shiftData.time}</span>
                    </div>
                </div>
                
                <div className="detail-item">
                    <div className="detail-icon">
                        <i data-lucide="map-pin"></i>
                    </div>
                    <div className="detail-info">
                        <span className="detail-label">Location</span>
                        <span className="detail-value">{shiftData.location}</span>
                    </div>
                </div>
                
                <div className="detail-item">
                    <div className="detail-icon">
                        <i data-lucide="shield"></i>
                    </div>
                    <div className="detail-info">
                        <span className="detail-label">Status</span>
                        <span className={`detail-value status-${shiftData.status.toLowerCase()}`}>
                            {shiftData.status}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="shift-actions">
                <button className="btn-secondary" disabled={loading}>
                    <i data-lucide="edit"></i>
                    Edit Shift
                </button>
                <button className="btn-primary" disabled={loading}>
                    <i data-lucide="clock"></i>
                    Start Shift
                </button>
            </div>
        </div>
    );
};

export default TodayShift;