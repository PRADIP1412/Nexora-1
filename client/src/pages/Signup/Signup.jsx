import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Signup.css';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username || formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 50) {
      newErrors.username = 'Username must be less than 50 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Terms validation
    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // MODIFIED PAYLOAD - Generate first_name and last_name from username
      const username = formData.username.trim();
      const firstName = username.charAt(0).toUpperCase() + username.slice(1);
      
      const payload = {
        username: username,
        email: formData.email.trim(),
        password: formData.password,
        first_name: firstName,  // Generate from username
        last_name: "User",      // Default value
        phone: null             // Optional field as null
      };

      console.log('🔐 SIGNUP: Sending registration data:', payload);
      
      const result = await register(payload);

      if (result.success) {
        toast.success('Registration successful! Redirecting to login...', {
          position: "top-center",
          autoClose: 3000,
          onClose: () => navigate('/login')
        });
      } else {
        toast.error(result.message || 'Registration failed. Please try again.');
        console.error('🔐 SIGNUP: Registration failed:', result.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
      console.error('🔐 SIGNUP: Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    toast.info(`Sign up with ${provider} is not yet implemented.`);
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2) return { strength: 33, label: 'Weak', color: '#ff6b9d' };
    if (strength <= 4) return { strength: 66, label: 'Medium', color: '#ffd93d' };
    return { strength: 100, label: 'Strong', color: '#00b894' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="auth-container">
      <ToastContainer />
      
      <div className="auth-wrapper">
        {/* Left Hero Section */}
        <div className="auth-hero">
          <div className="hero-overlay">
            <div className="logo-container">
              <i className="fas fa-shopping-bag logo-icon"></i>
              <h1 className="logo-text">Nexora</h1>
            </div>
            <div className="hero-content">
              <h2 className="hero-title">Join Nexora Today!</h2>
              <p className="hero-subtitle">
                Create your account and start exploring thousands of amazing products with exclusive deals and offers.
              </p>
              <div className="hero-features">
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Free Shipping</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Exclusive Deals</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check-circle"></i>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="auth-form-section">
          <div className="form-card">
            <div className="form-header">
              <p className="form-caption">GET STARTED</p>
              <h2 className="form-title">Create Account</h2>
              <p className="form-description">Fill in your details to create a new account</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              
              {/* Username Field */}
              <div className="input-group">
                <label htmlFor="username">Username *</label>
                <div className="input-wrapper">
                  <i className="fas fa-user input-icon"></i>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="johndoe"
                    className={errors.username ? 'error' : ''}
                    disabled={loading}
                    maxLength={50}
                  />
                </div>
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>

              {/* Email Address Field */}
              <div className="input-group">
                <label htmlFor="email">Email Address *</label>
                <div className="input-wrapper">
                  <i className="fas fa-envelope input-icon"></i>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="johndoe@example.com"
                    className={errors.email ? 'error' : ''}
                    disabled={loading}
                  />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              {/* Password Field */}
              <div className="input-group">
                <label htmlFor="password">Password *</label>
                <div className="input-wrapper">
                  <i className="fas fa-lock input-icon"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className={errors.password ? 'error' : ''}
                    disabled={loading}
                  />
                  <span 
                    className="password-toggle" 
                    onClick={togglePasswordVisibility}
                  >
                    <i className={showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'}></i>
                  </span>
                </div>
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className="strength-fill"
                        style={{ 
                          width: `${passwordStrength.strength}%`,
                          backgroundColor: passwordStrength.color
                        }}
                      ></div>
                    </div>
                    <span 
                      className="strength-label"
                      style={{ color: passwordStrength.color }}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
                {errors.password && <span className="error-message">{errors.password}</span>}
                <div className="password-requirements">
                  <small>Password must contain at least 8 characters with uppercase, lowercase, and number</small>
                </div>
              </div>

              <div className="terms-group">
                <label className="checkbox-container">
                  <input 
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (errors.terms) {
                        setErrors(prev => ({ ...prev, terms: '' }));
                      }
                    }}
                    disabled={loading}
                  />
                  <span className="checkmark"></span>
                  I agree to the <a href="/terms" className="terms-link">Terms & Conditions</a> and <a href="/privacy" className="terms-link">Privacy Policy</a>
                </label>
                {errors.terms && <span className="error-message">{errors.terms}</span>}
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
                <i className="fas fa-arrow-right"></i>
              </button>
            </form>

            <div className="divider">
              <span>Or sign up with</span>
            </div>

            <div className="social-login">
              <button 
                className="btn-social google"
                onClick={() => handleSocialSignup('Google')}
                disabled={loading}
              >
                <i className="fab fa-google"></i>
              </button>
              <button 
                className="btn-social facebook"
                onClick={() => handleSocialSignup('Facebook')}
                disabled={loading}
              >
                <i className="fab fa-facebook-f"></i>
              </button>
              <button 
                className="btn-social apple"
                onClick={() => handleSocialSignup('Apple')}
                disabled={loading}
              >
                <i className="fab fa-apple"></i>
              </button>
            </div>

            <p className="auth-switch">
              Already have an account? <Link to="/login" className="auth-link">Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;