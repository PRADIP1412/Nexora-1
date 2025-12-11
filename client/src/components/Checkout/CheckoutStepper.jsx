import React from 'react';
import './CheckoutStepper.css';

const CheckoutStepper = ({ steps, currentStep }) => {
  return (
    <div className="checkout-stepper">
      <div className="stepper-container">
        {steps.map((step, index) => (
          <div key={step.number} className={`stepper-step ${currentStep >= step.number ? 'completed' : ''} ${currentStep === step.number ? 'active' : ''}`}>
            <div className="step-number">
              {currentStep > step.number ? (
                <i className="fas fa-check"></i>
              ) : (
                step.number
              )}
            </div>
            <div className="step-info">
              <div className="step-title">{step.title}</div>
              <div className="step-description">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <div className="step-connector"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckoutStepper;