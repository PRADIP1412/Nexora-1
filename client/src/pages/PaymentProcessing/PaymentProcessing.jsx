import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCheckoutContext } from '../../context/CheckoutContext';
import { useOrderContext } from '../../context/OrderContext';
import { toastSuccess, toastError, toastInfo } from '../../utils/customToast';
import './PaymentProcessing.css';

const PaymentProcessing = () => {
  const [processingStep, setProcessingStep] = useState(1);
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { selectedPayment, checkoutSummary, orderNotes, resetCheckout, verifiedAddress } = useCheckoutContext();
  const { createOrder, loading: orderLoading } = useOrderContext();

  useEffect(() => {
    console.log('PaymentProcessing Debug:', {
      selectedPayment,
      checkoutSummary,
      verifiedAddress,
      locationState: location.state
    });

    const processPayment = async () => {
      try {
        // Validate required data - with better error messages
        if (!selectedPayment) {
          throw new Error('No payment method selected. Please go back and select a payment method.');
        }

        if (!checkoutSummary) {
          throw new Error('Missing checkout information. Please restart the checkout process.');
        }

        if (!verifiedAddress) {
          throw new Error('No shipping address selected. Please go back and verify your address.');
        }

        console.log('Starting payment processing with:', {
          selectedPayment,
          verifiedAddress,
          checkoutSummary,
          orderNotes
        });

        // Simulate payment processing steps
        const steps = [
          { duration: 2000, step: 1, title: 'Validating Payment Details' },
          { duration: 3000, step: 2, title: 'Processing Payment' },
          { duration: 2000, step: 3, title: 'Verifying Transaction' },
          { duration: 1000, step: 4, title: 'Finalizing Order' }
        ];

        // Process each step
        for (let i = 0; i < steps.length; i++) {
          setProcessingStep(steps[i].step);
          await new Promise(resolve => setTimeout(resolve, steps[i].duration));
        }

        // Create order data with proper structure
        const orderData = {
          address_id: verifiedAddress.address_id || verifiedAddress.id || 1,
          items: (checkoutSummary.items || []).map(item => ({
            variant_id: item.variant_id || item.id,
            quantity: item.quantity || 1,
            price: item.price || item.unit_price || 0
          })),
          total_amount: checkoutSummary.total_amount || 0,
          subtotal: checkoutSummary.subtotal || 0,
          tax_amount: checkoutSummary.tax_amount || 0,
          delivery_fee: checkoutSummary.delivery_fee || 0,
          discount_amount: checkoutSummary.discount_amount || 0,
          // Optional:
          coupon_code: checkoutSummary.coupon_code || null
          // REMOVE: payment_method, shipping_method, order_notes
        };
        console.log('Creating order with data:', orderData);

        // Create order in the system
        const result = await createOrder(orderData);

        if (result.success) {
          console.log('Order created successfully:', result.data);
          toastSuccess('Order placed successfully!');
          
          // Navigate to confirmation FIRST
          navigate('/order-confirmation', { 
            state: { 
              order: result.data,
              message: 'Your order has been placed successfully.' 
            } 
          });
          
          // THEN reset checkout state after a small delay
          setTimeout(() => {
            resetCheckout();
          }, 100);
        } else {
          // Handle validation errors from order creation
          if (result.validationErrors && result.validationErrors.length > 0) {
            setValidationErrors(result.validationErrors);
            throw new Error(`Order validation failed: ${result.validationErrors.join(', ')}`);
          } else {
            throw new Error(result.message || 'Failed to create order in the system');
          }
        }

      } catch (error) {
        console.error('Payment processing error:', error);
        setError(error.message);
        
        // Show detailed error message
        if (validationErrors.length > 0) {
          toastError(`Order issues: ${validationErrors.join(', ')}`);
        } else {
          toastError('Payment processing failed: ' + error.message);
        }
        
        // Auto-redirect after delay
        setTimeout(() => {
          navigate('/checkout', { state: { preserveState: true } });
        }, 5000);
      }
    };

    // Only start processing if we have all required data
    if (selectedPayment && checkoutSummary && verifiedAddress) {
      processPayment();
    } else {
      const missingData = [];
      if (!selectedPayment) missingData.push('payment method');
      if (!checkoutSummary) missingData.push('checkout information');
      if (!verifiedAddress) missingData.push('shipping address');
      
      setError(`Missing required data: ${missingData.join(', ')}. Redirecting to checkout...`);
      
      setTimeout(() => {
        navigate('/checkout');
      }, 3000);
    }

    // Countdown timer for auto-redirect
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, selectedPayment, checkoutSummary, orderNotes, createOrder, resetCheckout, verifiedAddress, location.state]);

  const processingSteps = [
    {
      step: 1,
      title: 'Validating Payment Details',
      description: 'Checking payment information and security',
      icon: 'fas fa-credit-card',
      status: 'processing'
    },
    {
      step: 2,
      title: 'Processing Payment',
      description: 'Contacting payment gateway',
      icon: 'fas fa-cog',
      status: 'processing'
    },
    {
      step: 3,
      title: 'Verifying Transaction',
      description: 'Confirming with payment provider',
      icon: 'fas fa-shield-alt',
      status: 'processing'
    },
    {
      step: 4,
      title: 'Finalizing Order',
      description: 'Completing your purchase',
      icon: 'fas fa-check-circle',
      status: 'completed'
    }
  ];

  if (error) {
    return (
      <div className="payment-processing-page">
        <div className="processing-container error">
          <div className="processing-header">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h1>Payment Failed</h1>
            <p>{error}</p>
          </div>
          <div className="processing-content">
            <div className="error-details">
              <p>We encountered an issue while processing your payment.</p>
              
              {validationErrors.length > 0 && (
                <div className="validation-errors">
                  <h4>Please fix the following issues:</h4>
                  <ul>
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <p>Redirecting back to checkout in <strong>{countdown}</strong> seconds...</p>
            </div>
            <div className="error-actions">
              <button 
                className="btn-retry"
                onClick={() => navigate('/checkout')}
              >
                Return to Checkout Now
              </button>
              <button 
                className="btn-support"
                onClick={() => toastInfo('Support contact information would appear here')}
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading if we're waiting for data
  if (!selectedPayment || !checkoutSummary || !verifiedAddress) {
    return (
      <div className="payment-processing-page">
        <div className="processing-container loading">
          <div className="processing-header">
            <h1>Loading Payment Information</h1>
            <p>Please wait while we load your payment details...</p>
          </div>
          <div className="processing-content">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin fa-2x"></i>
              <p>Preparing your payment...</p>
            </div>
            <div className="loading-details">
              <p><strong>Missing data:</strong></p>
              <ul>
                {!selectedPayment && <li>Payment method</li>}
                {!checkoutSummary && <li>Checkout information</li>}
                {!verifiedAddress && <li>Shipping address</li>}
              </ul>
              <p>Redirecting to checkout in {countdown} seconds...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-processing-page">
      <div className="processing-container">
        <div className="processing-header">
          <h1>Processing Your Payment</h1>
          <p>Please wait while we complete your order</p>
          {selectedPayment && (
            <div className="selected-payment-info">
              <i className={`fab ${selectedPayment.icon || 'fa-credit-card'}`}></i>
              <span>Paying with {selectedPayment.name}</span>
            </div>
          )}
        </div>

        <div className="processing-content">
          <div className="processing-animation">
            <div className="spinner-container">
              <div className="spinner"></div>
              <div className="spinner-ring"></div>
              {orderLoading && (
                <div className="loading-overlay">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Creating order...</span>
                </div>
              )}
            </div>
            
            <div className="processing-steps">
              {processingSteps.map(step => (
                <div 
                  key={step.step}
                  className={`processing-step ${processingStep >= step.step ? 'active' : ''} ${processingStep > step.step ? 'completed' : ''}`}
                >
                  <div className="step-icon">
                    {processingStep > step.step ? (
                      <i className="fas fa-check"></i>
                    ) : (
                      <i className={step.icon}></i>
                    )}
                  </div>
                  <div className="step-content">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                  <div className="step-status">
                    {processingStep > step.step ? (
                      <span className="status-completed">Completed</span>
                    ) : processingStep === step.step ? (
                      <span className="status-processing">Processing...</span>
                    ) : (
                      <span className="status-pending">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="processing-info">
            <div className="info-card">
              <h3>Don't Close This Window</h3>
              <p>Your order is being processed. Closing this window may interrupt the payment process.</p>
            </div>

            <div className="security-badges">
              <div className="badge">
                <i className="fas fa-lock"></i>
                <span>256-bit SSL Secure</span>
              </div>
              <div className="badge">
                <i className="fas fa-shield-alt"></i>
                <span>PCI DSS Compliant</span>
              </div>
              <div className="badge">
                <i className="fas fa-user-shield"></i>
                <span>3D Secure</span>
              </div>
            </div>

            <div className="order-preview">
              <h4>Order Summary</h4>
              {checkoutSummary && (
                <div className="preview-details">
                  <p><strong>Items:</strong> {checkoutSummary.items?.length || 0}</p>
                  <p><strong>Total:</strong> ${checkoutSummary.total_amount?.toFixed(2) || '0.00'}</p>
                  {orderNotes && (
                    <p><strong>Notes:</strong> {orderNotes}</p>
                  )}
                </div>
              )}
            </div>

            <div className="countdown-timer">
              <div className="timer-circle">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="#e9ecef"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="#667eea"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="220"
                    strokeDashoffset={220 - (countdown * 44)}
                    transform="rotate(-90 40 40)"
                  />
                </svg>
                <span className="timer-text">{countdown}s</span>
              </div>
              <p>Please wait while we process your order...</p>
            </div>
          </div>
        </div>

        <div className="processing-footer">
          <div className="contact-support">
            <i className="fas fa-headset"></i>
            <div>
              <p>Having trouble with your payment?</p>
              <button 
                className="btn-support"
                onClick={() => toastInfo('Support contact information would appear here')}
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessing;