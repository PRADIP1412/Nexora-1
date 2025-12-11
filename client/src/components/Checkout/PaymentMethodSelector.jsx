import React, { useState, useEffect } from 'react';
import './PaymentMethodSelector.css';

const PaymentMethodSelector = ({ paymentMethods, selectedPayment, onSelectPayment, loading }) => {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  // Debug logging
  useEffect(() => {
    console.log('PaymentMethodSelector Debug:', {
      paymentMethods,
      selectedPayment,
      loading
    });
  }, [paymentMethods, selectedPayment, loading]);

  // Reset card details when payment method changes
  useEffect(() => {
    if (selectedPayment?.method !== 'card') {
      setCardDetails({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
      });
    }
  }, [selectedPayment]);

  const handleCardInputChange = (field, value) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  const handlePaymentSelect = (method) => {
    console.log('Payment method selected:', method);
    onSelectPayment(method);
  };

  if (loading) {
    return (
      <div className="payment-method-selector loading">
        <div className="payment-methods-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="payment-method-card loading-skeleton">
              <div className="payment-method-header">
                <div className="payment-icon loading-skeleton-circle"></div>
                <div className="payment-info">
                  <h4 className="loading-skeleton-text"></h4>
                  <p className="loading-skeleton-text short"></p>
                </div>
              </div>
              <div className="payment-selection-indicator">
                <div className="selection-circle loading-skeleton-circle"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="payment-method-selector">
      {paymentMethods && paymentMethods.length > 0 ? (
        <>
          <div className="payment-methods-list">
            {paymentMethods.map(method => (
              <div 
                key={method.id || method.method} 
                className={`payment-method-card ${selectedPayment?.id === method.id || selectedPayment?.method === method.method ? 'selected' : ''}`}
                onClick={() => handlePaymentSelect(method)}
              >
                <div className="payment-method-header">
                  <div className="payment-icon">
                    <i className={`fab ${method.icon || 'fa-credit-card'}`}></i>
                  </div>
                  <div className="payment-info">
                    <h4>{method.name}</h4>
                    <p>{method.description}</p>
                    {method.supported_cards && method.supported_cards.length > 0 && (
                      <div className="supported-cards">
                        {method.supported_cards.map(card => (
                          <i key={card} className={`fab fa-cc-${card}`} title={card.toUpperCase()}></i>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="payment-selection-indicator">
                  <div className="selection-circle">
                    {(selectedPayment?.id === method.id || selectedPayment?.method === method.method) && (
                      <div className="selection-dot"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedPayment?.method === 'card' && (
            <div className="card-details-form">
              <h4>Card Details</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Card Number *</label>
                  <input 
                    type="text" 
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={(e) => handleCardInputChange('cardNumber', formatCardNumber(e.target.value))}
                    maxLength="19"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={(e) => handleCardInputChange('expiryDate', formatExpiryDate(e.target.value))}
                    maxLength="5"
                  />
                </div>
                <div className="form-group">
                  <label>CVV *</label>
                  <input 
                    type="password" 
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => handleCardInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                    maxLength="3"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Cardholder Name *</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  value={cardDetails.cardholderName}
                  onChange={(e) => handleCardInputChange('cardholderName', e.target.value)}
                />
              </div>

              <div className="card-security">
                <i className="fas fa-lock"></i>
                <span>Your card details are secure and encrypted</span>
              </div>

              {cardDetails.cardNumber && cardDetails.expiryDate && cardDetails.cvv && cardDetails.cardholderName && (
                <div className="card-preview">
                  <h5>Card Preview</h5>
                  <div className="card-preview-content">
                    <div className="card-number-preview">
                      {cardDetails.cardNumber}
                    </div>
                    <div className="card-details-preview">
                      <span>{cardDetails.cardholderName}</span>
                      <span>{cardDetails.expiryDate}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedPayment?.method === 'upi' && (
            <div className="upi-details">
              <h4>UPI Payment</h4>
              <p>You will be redirected to your UPI app to complete the payment.</p>
              <div className="upi-apps">
                <div className="upi-app">
                  <i className="fab fa-google-pay"></i>
                  <span>Google Pay</span>
                </div>
                <div className="upi-app">
                  <i className="fas fa-mobile-alt"></i>
                  <span>PhonePe</span>
                </div>
                <div className="upi-app">
                  <i className="fab fa-amazon-pay"></i>
                  <span>Amazon Pay</span>
                </div>
              </div>
            </div>
          )}

          {selectedPayment?.method === 'paypal' && (
            <div className="paypal-details">
              <h4>PayPal Payment</h4>
              <p>You will be redirected to PayPal to complete your payment securely.</p>
              <div className="paypal-security">
                <i className="fab fa-paypal"></i>
                <span>PayPal protects your financial information with encryption</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="no-payment-methods">
          <i className="fas fa-credit-card"></i>
          <h4>No Payment Methods Available</h4>
          <p>Please try refreshing the page or contact support.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;