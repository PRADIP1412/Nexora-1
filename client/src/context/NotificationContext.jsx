import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import notificationAPI from '../api/notification';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async (limit = 7) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const response = await notificationAPI.getUserNotifications(0, limit, false);
      if (response.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await notificationAPI.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await notificationAPI.markAsRead(notificationId);
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => 
            n.notification_id === notificationId 
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return response;
    } catch (error) {
      console.error('Failed to mark as read:', error);
      return { success: false, message: 'Failed to mark as read' };
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await notificationAPI.markAllAsRead();
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
      return response;
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      return { success: false, message: 'Failed to mark all as read' };
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await notificationAPI.deleteNotification(notificationId);
      if (response.success) {
        const notification = notifications.find(n => n.notification_id === notificationId);
        if (notification && !notification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setNotifications(prev => prev.filter(n => n.notification_id !== notificationId));
      }
      return response;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return { success: false, message: 'Failed to delete notification' };
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  // Close dropdown
  const closeDropdown = () => {
    setShowDropdown(false);
  };

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  // Add notification (for real-time updates)
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.is_read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    showDropdown,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    toggleDropdown,
    closeDropdown,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};