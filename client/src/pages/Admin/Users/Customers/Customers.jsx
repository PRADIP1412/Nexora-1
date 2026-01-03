import React from 'react';
import { CustomerProvider } from '../../../../context/CustomerContext';
import CustomerList from '../../../../components/Admin/Users/Customers/CustomerList';
import './Customers.css';

const Customers = () => {
    return (
        <CustomerProvider>
            <div className="customers-page">
                <CustomerList />
            </div>
        </CustomerProvider>
    );
};

export default Customers;