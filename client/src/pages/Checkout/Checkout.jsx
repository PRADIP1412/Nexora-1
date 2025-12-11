import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddress } from '../../context/AddressContext';
import { useCheckout } from '../../context/CheckoutContext';
import { useCart } from '../../context/CartContext';
import CheckoutStepper from '../../components/Checkout/CheckoutStepper';
import AddressSelector from '../../components/Checkout/AddressSelector';
import PaymentMethodSelector from '../../components/Checkout/PaymentMethodSelector';
import OrderSummary from '../../components/Checkout/OrderSummary';
import AddAddressModal from '../../components/Checkout/AddAddressModal';
import { toastSuccess, toastError } from '../../utils/customToast';
import './Checkout.css';

const Checkout = () => {
  const { currentStep, setCurrentStep, verifiedAddress, setVerifiedAddress, selectedPayment, setSelectedPayment, orderNotes, setOrderNotes, checkoutSummary } = useCheckout();
  const [selectedAddress, setSelectedAddress] = useState(null); // ADD THIS LINE
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const navigate = useNavigate();
  
  const { addresses, getUserAddresses, loading: addressLoading } = useAddress();
  const { paymentMethods, getPaymentMethods, loading: checkoutLoading } = useCheckout();
  const { cart, isCartLoading } = useCart();
  const { setCartItems } = useCheckout();

  useEffect(() => {
    getUserAddresses();
    getPaymentMethods();
  }, [getUserAddresses, getPaymentMethods]);

  // Set verified address as selected when returning from address verification
  useEffect(() => {
    if (verifiedAddress) {
      setSelectedAddress(verifiedAddress);
      // Auto-advance to payment step if address was verified
      if (currentStep === 1) {
        setCurrentStep(2);
      }
    }
  }, [verifiedAddress, currentStep, setCurrentStep]);
  useEffect(() => {
    if (cart?.items) {
      setCartItems(cart);
    }
  }, [cart, setCartItems]);
  // Set first address as selected when addresses load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress && !verifiedAddress) {
      setSelectedAddress(addresses[0]);
    }
  }, [addresses, selectedAddress, verifiedAddress]);

  const cartItems = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const shipping = 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const steps = [
    { number: 1, title: 'Address', description: 'Shipping Information' },
    { number: 2, title: 'Payment', description: 'Payment Method' },
    { number: 3, title: 'Review', description: 'Order Review' }
  ];

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedAddress) {
      toastError('Please select a shipping address');
      return;
    }
    
    if (currentStep === 1 && selectedAddress) {
      // Set the selected address as verified and navigate to verification
      setVerifiedAddress(selectedAddress);
      navigate('/address-verification');
      return;
    }
    
    if (currentStep === 2 && !selectedPayment) {
      toastError('Please select a payment method');
      return;
    }
    
    if (currentStep === 3) {
      // Navigate to payment processing
      console.log('Navigating to payment processing with:', {
        selectedPayment,
        verifiedAddress,
        checkoutSummary
      });
      navigate('/payment-processing');
      return;
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/cart');
    }
  };

  const handleAddNewAddress = () => {
    setShowAddAddressModal(true);
  };

  const handleAddressAdded = (newAddress) => {
    // Refresh addresses list
    getUserAddresses();
    // Select the new address
    setSelectedAddress(newAddress);
    setShowAddAddressModal(false);
  };

  // Handle address selection
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    // If user manually selects an address, don't set it as verified yet
    // It will be verified when they click "Continue"
  };

  const isLoadingAddresses = addressLoading.addresses || addressLoading.states;
  const isPageLoading = isLoadingAddresses || checkoutLoading.paymentMethods || isCartLoading;

  if (isPageLoading) {
    return (
      <div className="loading">
        <i className="fas fa-spinner fa-spin"></i>
        Loading checkout...
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your purchase securely</p>
        </div>

        <CheckoutStepper 
          steps={steps} 
          currentStep={currentStep} 
        />

        <div className="checkout-content">
          <div className="checkout-main">
            {currentStep === 1 && (
              <div className="checkout-step">
                <div className="step-header">
                  <h2>Shipping Address</h2>
                  {verifiedAddress && (
                    <div className="verified-badge">
                      <i className="fas fa-check-circle"></i>
                      Address Verified
                    </div>
                  )}
                </div>
                <AddressSelector
                  addresses={addresses}
                  selectedAddress={selectedAddress}
                  onSelectAddress={handleAddressSelect}
                  onAddNewAddress={handleAddNewAddress}
                  loading={addressLoading.addresses}
                />
                
                <div className="order-notes">
                  <label htmlFor="orderNotes">Order Notes (Optional)</label>
                  <textarea
                    id="orderNotes"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Add any special instructions for delivery..."
                    rows="3"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="checkout-step">
                <h2>Payment Method</h2>
                <PaymentMethodSelector
                  paymentMethods={paymentMethods}
                  selectedPayment={selectedPayment}
                  onSelectPayment={setSelectedPayment}
                  loading={checkoutLoading.paymentMethods}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="checkout-step">
                <h2>Order Review</h2>
                <div className="review-section">
                  <div className="review-address">
                    <h4>Shipping Address</h4>
                    {verifiedAddress && (
                      <div className="selected-address">
                        <div className="verified-indicator">
                          <i className="fas fa-check-circle"></i>
                          Verified
                        </div>
                        <p><strong>{verifiedAddress.line1}</strong></p>
                        <p>{verifiedAddress.line2}</p>
                        <p>{verifiedAddress.area_name}, {verifiedAddress.city_name}, {verifiedAddress.state_name} {verifiedAddress.pincode}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="review-payment">
                    <h4>Payment Method</h4>
                    {selectedPayment && (
                      <div className="selected-payment">
                        <i className={`fab ${selectedPayment.icon || 'fa-credit-card'}`}></i>
                        <span>{selectedPayment.name}</span>
                      </div>
                    )}
                  </div>

                  {orderNotes && (
                    <div className="review-notes">
                      <h4>Order Notes</h4>
                      <p>{orderNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="checkout-navigation">
              <button 
                className="btn-prev"
                onClick={handlePreviousStep}
                disabled={addressLoading.create}
              >
                <i className="fas fa-arrow-left"></i>
                {currentStep === 1 ? 'Back to Cart' : 'Previous'}
              </button>
              
              <button 
                className="btn-next"
                onClick={handleNextStep}
                disabled={
                  (currentStep === 1 && !selectedAddress) ||
                  (currentStep === 2 && !selectedPayment) ||
                  addressLoading.create
                }
              >
                {currentStep === 1 ? 'Verify Address' : 
                 currentStep === 2 ? 'Review Order' : 
                 'Place Order'}
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <div className="checkout-sidebar">
            <OrderSummary 
              items={cartItems}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
            />
            
            <div className="checkout-security">
              <div className="security-item">
                <i className="fas fa-lock"></i>
                <span>Secure SSL Encryption</span>
              </div>
              <div className="security-item">
                <i className="fas fa-shield-alt"></i>
                <span>Privacy Protected</span>
              </div>
              <div className="security-item">
                <i className="fas fa-undo"></i>
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <AddAddressModal
        isOpen={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
        onAddressAdded={handleAddressAdded}
      />
    </div>
  );
};

export default Checkout;