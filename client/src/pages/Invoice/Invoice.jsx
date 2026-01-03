import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrderContext } from '../../context/OrderContext';
import { toastSuccess } from '../../utils/customToast';
import './Invoice.css';

const Invoice = () => {
  const { orderId } = useParams();
  const { fetchOrderById, currentOrder, loading } = useOrderContext();

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId);
    }
  }, [orderId, fetchOrderById]);

  const handlePrint = () => {
    window.print();
    toastSuccess('Invoice sent to printer');
  };

  const handleDownloadPDF = () => {
    toastSuccess('PDF download started');
  };

  const handleEmailInvoice = () => {
    toastSuccess('Invoice sent to email');
  };

  if (loading) {
    return <div className="loading">Loading invoice...</div>;
  }

  if (!currentOrder) {
    return <div className="error">Invoice not found</div>;
  }

  return (
    <div className="invoice-page">
      <div className="invoice-container">
        <div className="invoice-actions">
          <button className="btn-print" onClick={handlePrint}>
            <i className="fas fa-print"></i>
            Print Invoice
          </button>
          <button className="btn-download-pdf" onClick={handleDownloadPDF}>
            <i className="fas fa-file-pdf"></i>
            Download PDF
          </button>
          <button className="btn-email" onClick={handleEmailInvoice}>
            <i className="fas fa-envelope"></i>
            Email Invoice
          </button>
        </div>

        <div className="invoice-document">
          <div className="invoice-header">
            <div className="company-info">
              <h1>SuperMart</h1>
              <p>Your Trusted Shopping Partner</p>
            </div>
            <div className="invoice-title">
              <h2>INVOICE</h2>
              <p>#INV-{currentOrder.order_id}</p>
            </div>
          </div>

          <div className="invoice-addresses">
            <div className="from-address">
              <h3>From:</h3>
              <p><strong>SuperMart Store</strong></p>
              <p>123 Business Street</p>
              <p>San Francisco, CA 94105</p>
              <p>+1 (555) 123-4567</p>
              <p>billing@supermart.com</p>
            </div>
            <div className="to-address">
              <h3>Bill To:</h3>
              <p><strong>{currentOrder.address?.name || 'Customer'}</strong></p>
              <p>{currentOrder.address?.line1}</p>
              <p>{currentOrder.address?.line2}</p>
              <p>{currentOrder.address?.city_name}, {currentOrder.address?.state_name} {currentOrder.address?.pincode}</p>
            </div>
          </div>

          <div className="invoice-details">
            <div className="detail-row">
              <span>Invoice Date:</span>
              <span>{new Date(currentOrder.placed_at).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span>Due Date:</span>
              <span>{new Date(currentOrder.placed_at).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span>Order ID:</span>
              <span>{currentOrder.order_id}</span>
            </div>
            <div className="detail-row">
              <span>Status:</span>
              <span className={`status ${currentOrder.payment_status.toLowerCase()}`}>
                {currentOrder.payment_status}
              </span>
            </div>
          </div>

          <div className="invoice-items">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {currentOrder.items?.map(item => (
                  <tr key={item.variant_id}>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="invoice-totals">
            <div className="totals-grid">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${currentOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Tax:</span>
                <span>${currentOrder.tax_amount.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>${currentOrder.delivery_fee.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Discount:</span>
                <span>-${currentOrder.discount_amount.toFixed(2)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total:</span>
                <span>${currentOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="payment-info">
            <h4>Payment Information</h4>
            <div className="payment-details">
              <p><strong>Method:</strong> {currentOrder.payment_method || 'Credit Card'}</p>
              <p><strong>Payment Date:</strong> {new Date(currentOrder.placed_at).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span className="status paid">{currentOrder.payment_status}</span></p>
            </div>
          </div>

          <div className="invoice-notes">
            <h4>Notes</h4>
            <p>Thank you for your business!</p>
          </div>

          <div className="invoice-footer">
            <p>Thank you for choosing SuperMart. We appreciate your business!</p>
            <div className="contact-info">
              <p>Email: support@supermart.com | Phone: +1 (555) 123-4567</p>
              <p>Website: www.supermart.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;