import api from './auth';

const NOTIFICATION_BASE_URL = '/notifications';

export const notificationAPI = {
  // Get user notifications with pagination
  getUserNotifications: async (skip = 0, limit = 50, isRead = null) => {
    try {
      const params = { skip, limit };
      if (isRead !== null) params.is_read = isRead;
      console.log('Notification API - getUserNotifications:', params);
      const response = await api.get(NOTIFICATION_BASE_URL + '/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Notification API Error - getUserNotifications:', error);
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Failed to fetch notifications' 
      };
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await api.get(NOTIFICATION_BASE_URL + '/unread-count');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Notification API Error - getUnreadCount:', error);
      return { success: false, message: 'Failed to get unread count' };
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`${NOTIFICATION_BASE_URL}/${notificationId}/read`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Notification API Error - markAsRead:', error);
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Failed to mark as read' 
      };
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      const response = await api.put(NOTIFICATION_BASE_URL + '/mark-all-read');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Notification API Error - markAllAsRead:', error);
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Failed to mark all as read' 
      };
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`${NOTIFICATION_BASE_URL}/${notificationId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Notification API Error - deleteNotification:', error);
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Failed to delete notification' 
      };
    }
  },

  // Delete all notifications
  deleteAllNotifications: async () => {
    try {
      const response = await api.delete(NOTIFICATION_BASE_URL + '/');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Notification API Error - deleteAllNotifications:', error);
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Failed to delete all notifications' 
      };
    }
  }
};

export default notificationAPI;