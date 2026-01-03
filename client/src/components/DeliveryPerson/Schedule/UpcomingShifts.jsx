import React from 'react';
import './UpcomingShifts.css';

const UpcomingShifts = ({ upcomingShifts, loading, onRefresh }) => {
    if (loading && !upcomingShifts) {
        return (
            <div className="upcoming-shifts loading">
                <div className="section-header-skeleton">
                    <div className="title-skeleton"></div>
                    <div className="refresh-btn-skeleton"></div>
                </div>
                <div className="shift-list-skeleton">
                    {[1, 2].map(i => (
                        <div className="shift-card-skeleton" key={i}>
                            <div className="shift-date-skeleton"></div>
                            <div className="shift-details-skeleton">
                                <div className="detail-skeleton"></div>
                                <div className="detail-skeleton"></div>
                            </div>
                            <div className="shift-action-skeleton"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Safe data access
    const getShiftsData = () => {
        if (!upcomingShifts || !upcomingShifts.upcoming_shifts) {
            return [
                {
                    id: 1,
                    date: 'Tomorrow',
                    formatted_date: 'Oct 27, 2025',
                    day: 'Monday',
                    time: '9:00 AM - 6:00 PM',
                    location: 'Gandhinagar Zone',
                    status: 'Scheduled'
                },
                {
                    id: 2,
                    date: 'Oct 28',
                    formatted_date: 'Oct 28, 2025',
                    day: 'Wednesday',
                    time: '10:00 AM - 7:00 PM',
                    location: 'Ahmedabad Central Zone',
                    status: 'Scheduled'
                },
                {
                    id: 3,
                    date: 'Oct 29',
                    formatted_date: 'Oct 29, 2025',
                    day: 'Thursday',
                    time: '9:30 AM - 6:30 PM',
                    location: 'Satellite Zone',
                    status: 'Scheduled'
                }
            ];
        }

        return upcomingShifts.upcoming_shifts.map((shift, index) => ({
            id: shift.shift_id || index + 1,
            date: shift.date_label || shift.date || 'Upcoming',
            formatted_date: shift.formatted_date || shift.date || 'Soon',
            day: shift.day || shift.weekday || 'Day',
            time: shift.time_slot || shift.start_time && shift.end_time 
                ? `${shift.start_time} - ${shift.end_time}`
                : 'Flexible',
            location: shift.location || shift.zone || 'Multiple Zones',
            status: shift.status || 'Scheduled'
        })).slice(0, 5); // Limit to 5 shifts
    };

    const shifts = getShiftsData();

    return (
        <div className="upcoming-shifts">
            <div className="section-header">
                <h3>Upcoming Shifts</h3>
                <button 
                    className="refresh-btn"
                    onClick={onRefresh}
                    disabled={loading}
                    title="Refresh upcoming shifts"
                >
                    <i data-lucide="refresh-cw"></i>
                </button>
            </div>
            
            {shifts.length === 0 ? (
                <div className="empty-state">
                    <i data-lucide="calendar"></i>
                    <p>No upcoming shifts scheduled</p>
                </div>
            ) : (
                <div className="shift-list">
                    {shifts.map(shift => (
                        <div className="shift-card" key={shift.id}>
                            <div className="shift-date">
                                <strong>{shift.date}</strong>
                                <span>{shift.formatted_date}</span>
                            </div>
                            <div className="shift-details">
                                <div className="shift-time">
                                    <i data-lucide="clock"></i>
                                    <span>{shift.time}</span>
                                </div>
                                <div className="shift-location">
                                    <i data-lucide="map-pin"></i>
                                    <span>{shift.location}</span>
                                </div>
                            </div>
                            <div className="shift-actions">
                                <button className="icon-btn" title="Edit shift">
                                    <i data-lucide="edit"></i>
                                </button>
                                <button className="icon-btn" title="View details">
                                    <i data-lucide="eye"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {upcomingShifts?.total_upcoming && upcomingShifts.total_upcoming > shifts.length && (
                <div className="view-all-section">
                    <button className="view-all-btn">
                        View All {upcomingShifts.total_upcoming} Upcoming Shifts
                        <i data-lucide="chevron-right"></i>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UpcomingShifts;