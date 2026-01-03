import React, { useEffect, useState } from 'react';
import { useScheduleContext } from '../../../context/delivery_panel/ScheduleContext';
import DeliveryLayout from '../../../components/DeliveryPerson/Layout/DeliveryLayout';
import TodayShift from '../../../components/DeliveryPerson/Schedule/TodayShift';
import UpcomingShifts from '../../../components/DeliveryPerson/Schedule/UpcomingShifts';
import './Schedule.css';

const Schedule = () => {
    const {
        todayShift,
        upcomingShifts,
        scheduleCalendar,
        scheduleSummary,
        workPreferences,
        completeSchedule,
        loading,
        error,
        fetchAllScheduleData,
        fetchTodayShift,
        fetchUpcomingShifts,
        fetchWorkPreferences,
        fetchScheduleCalendar,
        clearError
    } = useScheduleContext();

    const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
    const [calendarDate, setCalendarDate] = useState(new Date());

    useEffect(() => {
        const loadData = async () => {
            try {
                await fetchAllScheduleData(true);
            } catch (err) {
                console.error('Error loading schedule data:', err);
            }
        };
        
        loadData();
    }, []);

    const handleCalendarNavigation = (direction) => {
        const newDate = new Date(calendarDate);
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCalendarDate(newDate);
        fetchScheduleCalendar(newDate.getFullYear(), newDate.getMonth() + 1);
    };

    const handleAddSchedule = () => {
        setShowAddScheduleModal(true);
    };

    const handleCloseModal = () => {
        setShowAddScheduleModal(false);
    };

    if (loading && !todayShift) {
        return (
            <DeliveryLayout>
                <div className="page active" id="schedule-page">
                    <div className="page-header">
                        <h2>My Schedule</h2>
                    </div>
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading schedule data...</p>
                    </div>
                </div>
            </DeliveryLayout>
        );
    }

    return (
        <DeliveryLayout>
            <div className="page active" id="schedule-page">
                <div className="page-header">
                    <h2>My Schedule</h2>
                    <button 
                        className="btn-primary" 
                        onClick={handleAddSchedule}
                        disabled={loading}
                    >
                        <i data-lucide="plus"></i>
                        Add Schedule
                    </button>
                </div>

                {error && (
                    <div className="error-alert">
                        <div className="alert-content">
                            <i data-lucide="alert-circle"></i>
                            <span>{error}</span>
                        </div>
                        <button className="alert-close" onClick={clearError}>
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                )}

                {/* Today's Shift Section */}
                <TodayShift 
                    todayShift={todayShift}
                    loading={loading}
                    onRefresh={fetchTodayShift}
                />

                {/* Schedule Calendar */}
                <div className="schedule-calendar">
                    <div className="calendar-header">
                        <button 
                            className="calendar-nav"
                            onClick={() => handleCalendarNavigation('prev')}
                            disabled={loading}
                        >
                            <i data-lucide="chevron-left"></i>
                        </button>
                        <h3>
                            {calendarDate.toLocaleDateString('en-US', { 
                                month: 'long', 
                                year: 'numeric' 
                            })}
                        </h3>
                        <button 
                            className="calendar-nav"
                            onClick={() => handleCalendarNavigation('next')}
                            disabled={loading}
                        >
                            <i data-lucide="chevron-right"></i>
                        </button>
                    </div>
                    
                    {scheduleCalendar ? (
                        <div className="calendar-grid">
                            <div className="calendar-weekdays">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div className="weekday" key={day}>{day}</div>
                                ))}
                            </div>
                            <div className="calendar-days">
                                {scheduleCalendar.calendar_days?.map((day, index) => (
                                    <div 
                                        className={`calendar-day ${day.has_shift ? 'has-shift' : ''} ${day.is_today ? 'today' : ''}`}
                                        key={index}
                                    >
                                        <span className="day-number">{day.day}</span>
                                        {day.has_shift && (
                                            <div className="shift-indicator"></div>
                                        )}
                                    </div>
                                )) || 
                                // Fallback calendar
                                Array.from({ length: 42 }).map((_, index) => {
                                    const day = index + 1;
                                    return (
                                        <div className="calendar-day" key={index}>
                                            <span className="day-number">{day > 31 ? '' : day}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="calendar-placeholder">
                            <p>Calendar view will show your scheduled shifts and deliveries</p>
                            <button 
                                className="btn-secondary"
                                onClick={() => fetchScheduleCalendar()}
                                disabled={loading}
                            >
                                <i data-lucide="calendar"></i>
                                View Full Calendar
                            </button>
                        </div>
                    )}
                </div>

                {/* Upcoming Shifts Section */}
                <UpcomingShifts 
                    upcomingShifts={upcomingShifts}
                    loading={loading}
                    onRefresh={fetchUpcomingShifts}
                />

                {/* Work Preferences */}
                {workPreferences && (
                    <div className="preferences-card">
                        <div className="card-header">
                            <h3>Schedule Preferences</h3>
                            <button className="btn-text">
                                <i data-lucide="edit"></i>
                                Edit
                            </button>
                        </div>
                        <div className="preferences-list">
                            <div className="preference-item">
                                <span className="preference-label">Preferred Working Days</span>
                                <span className="preference-value">
                                    {workPreferences.preferred_days?.join(', ') || 'Monday - Saturday'}
                                </span>
                            </div>
                            <div className="preference-item">
                                <span className="preference-label">Preferred Shift Timing</span>
                                <span className="preference-value">
                                    {workPreferences.preferred_shift_start || '9:00 AM'} - {workPreferences.preferred_shift_end || '6:00 PM'}
                                </span>
                            </div>
                            <div className="preference-item">
                                <span className="preference-label">Preferred Zone</span>
                                <span className="preference-value">
                                    {workPreferences.preferred_zones?.join(', ') || 'Gandhinagar & Ahmedabad Central'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Schedule Summary Stats */}
                {scheduleSummary && (
                    <div className="schedule-stats">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <i data-lucide="calendar"></i>
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">This Month</span>
                                <span className="stat-value">
                                    {scheduleSummary.monthly_shifts || 0} shifts
                                </span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <i data-lucide="clock"></i>
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">Total Hours</span>
                                <span className="stat-value">
                                    {scheduleSummary.total_hours || 0} hours
                                </span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <i data-lucide="dollar-sign"></i>
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">Estimated Earnings</span>
                                <span className="stat-value">
                                    ₹{scheduleSummary.estimated_earnings || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Schedule Modal */}
            {showAddScheduleModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add New Schedule</h3>
                            <button className="close-btn" onClick={handleCloseModal}>
                                <i data-lucide="x"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p className="modal-message">
                                This feature allows you to add new shift schedules. 
                                In a real application, you would see a form here.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={handleCloseModal}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleCloseModal}>
                                Add Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DeliveryLayout>
    );
};

export default Schedule;