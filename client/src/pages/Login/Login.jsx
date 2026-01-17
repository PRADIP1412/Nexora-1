    // src/pages/Login/Login.jsx
    import React, { useState, useEffect } from "react";
    import { Link } from "react-router-dom";
    import { useAuth } from "../../context/AuthContext";
    import "./Login.css";

    const Login = () => {
        const { login, isLoading } = useAuth();

        const [showPassword, setShowPassword] = useState(false);
        const [formData, setFormData] = useState({
            email: "",
            password: "",
        });

        const [errors, setErrors] = useState({});
        const [apiError, setApiError] = useState("");

        useEffect(() => {
            console.log("🔧 LOGIN PAGE LOADED");
        }, []);

        const togglePasswordVisibility = () => {
            setShowPassword(!showPassword);
        };

        const handleChange = (e) => {
            setFormData({ ...formData, [e.target.name]: e.target.value });
            setErrors({ ...errors, [e.target.name]: "" });
            setApiError("");
        };

        const validateForm = () => {
            const newErrors = {};

            if (!formData.email.trim()) newErrors.email = "Email is required";
            if (!formData.password) newErrors.password = "Password is required";

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (formData.email && !emailRegex.test(formData.email)) {
                newErrors.email = "Please enter a valid email address";
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log("🚀 FORM SUBMITTED");

            if (!validateForm()) {
                console.log("❌ Form validation failed");
                return;
            }

            setApiError("");

            console.log("📤 Attempting login...");
            const result = await login(formData.email, formData.password);

            if (!result?.success) {
                console.log("❌ Login failed:", result?.message);
                setApiError(result?.message || "Invalid email or password.");
            } else {
                console.log("✅ Login success");
            }
        };

        return (
            <div className="auth-container">
                         <video autoPlay muted loop playsInline>
                        <source src="/bg-video.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                        </video>

                        <div className="login">
                            <div className="form-header-login">
                                <h2 className="display-text">Log In</h2>
                                {apiError && (
                                    <div className="error-message api-error">
                                        <i className="fas fa-exclamation-circle"></i> {apiError}
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
                                
                                {/* Email */}
                                <div className="inputs">
                                    <label htmlFor="email">Email Address</label>
                                    <div className="inputs-wrapper">
                                        <i className="fas fa-envelope input-icon"></i>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="johndoe@example.com"
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
                                <div className="inputs">
                                    <label htmlFor="password">Password</label>
                                    <div className="inputs-wrapper">
                                        <i className="fas fa-lock input-icon"></i>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter your password"
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
                                    {errors.password && (
                                        <span className="error-message">
                                            <i className="fas fa-exclamation-triangle"></i> {errors.password}
                                        </span>
                                    )}
                                </div>

                                {/* Login Button */}
                                <button 
                                    type="submit"
                                    className="btn-submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span>Logging In...</span>
                                            <i className="fas fa-spinner fa-spin"></i>
                                        </>
                                    ) : (
                                        <>
                                            <span>Log In</span>
                                            <i className="fas fa-arrow-right"></i>
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="auth-switch">
                                Don't have an account?{" "}
                                <Link to="/signup" className="auth-link">Create Account</Link>
                            </p>

                        </div>
                    

            
            </div>
        );
    };

    export default Login;
