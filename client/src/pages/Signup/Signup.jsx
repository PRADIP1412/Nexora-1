import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Signup.css";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signup = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        console.log("🔧 SIGNUP PAGE LOADED");
    }, []);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
        setApiError("");
    };

    const validateForm = () => {
        const newErrors = {};

        // Username validation
        if (!formData.username || formData.username.trim().length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        } else if (formData.username.length > 50) {
            newErrors.username = "Username must be less than 50 characters";
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = "Password must contain uppercase, lowercase, and number";
        }

        // Terms validation
        if (!agreedToTerms) {
            newErrors.terms = "You must agree to the terms and conditions";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("🚀 SIGNUP FORM SUBMITTED");

        if (!validateForm()) {
            console.log("❌ Form validation failed");
            return;
        }

        setApiError("");
        setIsLoading(true);

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

            console.log("🔐 SIGNUP: Sending registration data:", payload);
            
            const result = await register(payload);

            if (result.success) {
                toast.success("Registration successful! Redirecting to login...", {
                    position: "top-center",
                    autoClose: 3000,
                    onClose: () => navigate("/login")
                });
            } else {
                setApiError(result?.message || "Registration failed. Please try again.");
                console.error("🔐 SIGNUP: Registration failed:", result.message);
            }
        } catch (error) {
            setApiError("An unexpected error occurred. Please try again.");
            console.error("🔐 SIGNUP: Registration error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Password strength indicator
    const getPasswordStrength = () => {
        const password = formData.password;
        if (!password) return { strength: 0, label: "", color: "" };
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        if (strength <= 2) return { strength: 33, label: "Weak", color: "#ff6b9d" };
        if (strength <= 4) return { strength: 66, label: "Medium", color: "#ffd93d" };
        return { strength: 100, label: "Strong", color: "#00b894" };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <div className="auth-container">
             <video autoPlay muted loop playsInline>
                        <source src="/bg-video.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                        </video>
            <ToastContainer />
            
            <div className="signup">
                <div className="form-header-signup">
                    {apiError && (
                        <div className="error-message api-error">
                            <i className="fas fa-exclamation-circle"></i> {apiError}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
                    
                    {/* Username */}
                    <div className="input">
                        <div className="input-wrapper">
                            <i className="fas fa-user input-icon"></i>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Username"
                                className={errors.username ? "error" : ""}
                                disabled={isLoading}
                                maxLength={50}
                            />
                        </div>
                        {errors.username && (
                            <span className="error-message">
                                <i className="fas fa-exclamation-triangle"></i> {errors.username}
                            </span>
                        )}
                    </div>

                    {/* Email */}
                    <div className="input">
                        <div className="input-wrapper">
                            <i className="fas fa-envelope input-icon"></i>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email Address"
                                className={errors.email ? "error" : ""}
                                disabled={isLoading}
                            />
                        </div>
                        {errors.email && (
                            <span className="error-message">
                                <i className="fas fa-exclamation-triangle"></i> {errors.email}
                            </span>
                        )}
                    </div>

                    {/* Password */}
                    <div className="input">
                        <div className="input-wrapper">
                            <i className="fas fa-lock input-icon"></i>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                className={errors.password ? "error" : ""}
                                disabled={isLoading}
                            />
                            <span 
                                className="password-toggle" 
                                onClick={togglePasswordVisibility}
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                            </span>
                        </div>
                        {/* Password Strength Indicator */}
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
                        {errors.password && (
                            <span className="error-message">
                                <i className="fas fa-exclamation-triangle"></i> {errors.password}
                            </span>
                        )}
                        <div className="password-requirements">
                            <small>Password must contain at least 8 characters with uppercase, lowercase, and number</small>
                        </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="form-options">
                        <label className="checkbox-container">
                            <input 
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => {
                                    setAgreedToTerms(e.target.checked);
                                    if (errors.terms) {
                                        setErrors(prev => ({ ...prev, terms: "" }));
                                    }
                                }}
                                disabled={isLoading}
                            />
                            <span className="checkmark"></span>
                            I agree to the  <a href="/terms" className="terms-link">Terms & Conditions</a> & <a href="/privacy" className="terms-link">Privacy Policy</a>
                        </label>
                    </div>
                    {errors.terms && (
                        <span className="error-message">
                            <i className="fas fa-exclamation-triangle"></i> {errors.terms}
                        </span>
                    )}

                    {/* Sign Up Button */}
                    <button 
                        type="submit"
                        className="btn-submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span>Creating Account...</span>
                                <i className="fas fa-spinner fa-spin"></i>
                            </>
                        ) : (
                            <>
                                <span>Create Account</span>
                                <i className="fas fa-arrow-right"></i>
                            </>
                        )}
                    </button>
                </form>

                <div className="divider">
                    <span>Or sign up with</span>
                </div>

                <div className="social-login">
                    <button 
                        className="btn-social google"
                        onClick={() => toast.info("Sign up with Google is not yet implemented.")}
                        disabled={isLoading}
                    >
                        <i className="fab fa-google"></i>
                    </button>
                </div>

                <p className="auth-switch">
                    Already have an account?{" "}
                    <Link to="/login" className="auth-link">Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;