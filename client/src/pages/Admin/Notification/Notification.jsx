import React from 'react';
import { NotificationAdminProvider } from '../../../context/NotificationAdminContext';
import NotificationDashboard from '../../../components/Admin/Notification/NotificationDashboard';

const NotificationPage = () => {
    return (
        <NotificationAdminProvider>
            <NotificationDashboard />
        </NotificationAdminProvider>
    );
};

export default NotificationPage;