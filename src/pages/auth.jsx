import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Shield,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3001/api/v1/auth";

// ✅ JWT decode helper
const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
};

const Auth = ({ setIsAuthenticated }) => {
  const [formType, setFormType] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    otp: "",
    newPassword: "",
    userType: "Civilian",
  });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [clientId, setClientId] = useState(null);

  const slides = [
    {
      title: "Mahakaleshwar Jyotirlinga",
      subtitle: "Sacred Abode of Lord Shiva",
      description:
        "Experience the divine presence at one of the twelve Jyotirlingas, where time stands still in devotion.",
      gradient: "linear-gradient(135deg, #fcae55ff, #ff8f1fff, #d83a21ff)",
      image:
        "https://tse1.mm.bing.net/th/id/OIP.Bw-3Z-3hOTRsZwLlHBtitQHaNK?w=900&h=1600&rs=1&pid=ImgDetMain&o=7&rm=3",
    },
    {
      title: "Ujjain Simhastha",
      subtitle: "Kumbh Mela Experience",
      description:
        "Join millions of devotees in the grand spiritual gathering that happens once every 12 years.",
      gradient: "linear-gradient(135deg, #bd7dfaff, #7375faff, #478cfaff)",
      image:
        "https://img.freepik.com/premium-vector/holy-man-sadhu-meditating-jungle_1076263-591.jpg?w=740",
    },
    {
      title: "Spiritual Journey",
      subtitle: "Plan Your Sacred Yatra",
      description:
        "Discover temples, plan your route, and immerse yourself in the spiritual essence of Ujjain.",
      gradient: "linear-gradient(135deg, #c7fce8ff, #6dfcbcff, #3cfe86ff)",
      image:
        "https://tse3.mm.bing.net/th/id/OIP.GuZnKQM0tx7ajnUAPZMjRwHaFB?w=560&h=380&rs=1&pid=ImgDetMain&o=7&rm=3",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("Processing...");

    try {
      if (formType === "register") {
        const response = await fetch(`${API_BASE}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            phone: formData.phone,
            userType: formData.userType,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setMessage(data.message);
          setClientId(data.client_id);
          setFormType("verify");
          localStorage.setItem("token", data.token);
          console.log("REGISTER → JWT Token:", data.token);
          console.log("REGISTER → Decoded Token:", decodeJWT(data.token));
          console.log("REGISTER → Full Response:", data);
        } else {
          setMessage(data.message || "Registration failed");
        }
      } else if (formType === "verify") {
        const response = await fetch(`${API_BASE}/verify-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            otp: formData.otp,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setMessage(data.message);
          localStorage.setItem("token", data.token);
          setIsAuthenticated(true);
        } else {
          setMessage(data.message || "Verification failed");
        }
      } else if (formType === "login") {
        const response = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setMessage("Welcome to Ujjain Yatra! Login successful.");
          localStorage.setItem("token", data.token);
          console.log("VERIFY → JWT Token:", data.token);
          console.log("VERIFY → Decoded Token:", decodeJWT(data.token));
          console.log("VERIFY → Full Response:", data);
          setIsAuthenticated(true);
        } else {
          setMessage(data.message || "Login failed");
        }
      } else if (formType === "reset") {
        const response = await fetch(`${API_BASE}/request-reset`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setMessage(data.message);
          setClientId(data.client_id);
          setFormType("verifyReset");
        } else {
          setMessage(data.message || "Failed to send reset OTP");
        }
      } else if (formType === "verifyReset") {
        const response = await fetch(`${API_BASE}/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            otp: formData.otp,
            newPassword: formData.newPassword,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setMessage(data.message);
          setFormType("login");
          localStorage.setItem("token", data.token);
          console.log("LOGIN → JWT Token:", data.token);
          console.log("LOGIN → Decoded Token:", decodeJWT(data.token));
          console.log("LOGIN → Full Response:", data);
        } else {
          setMessage(data.message || "Password reset failed");
        }
      }
    } catch (err) {
      setMessage("An error occurred. Please try again.");
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-content">
          {/* Left Side - Slider */}
          <div className="slider-container">
            <div
              className="slider-background"
              style={{ background: slides[currentSlide].gradient }}
            >
              <div className="slider-overlay"></div>

              {/* Navigation Arrows */}
              <button onClick={prevSlide} className="nav-arrow nav-arrow-left">
                <ChevronLeft size={24} />
              </button>
              <button onClick={nextSlide} className="nav-arrow nav-arrow-right">
                <ChevronRight size={24} />
              </button>

              {/* Content */}
              <div className="slider-content">
                <div className="slider-image-container">
                  <img
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].title}
                    className="slider-image"
                  />
                </div>
                <h1 className="slider-title">{slides[currentSlide].title}</h1>
                <h2 className="slider-subtitle">
                  {slides[currentSlide].subtitle}
                </h2>
                <p className="slider-description">
                  {slides[currentSlide].description}
                </p>
              </div>

              {/* Slide Indicators */}
              <div className="slide-indicators">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`indicator ${
                      index === currentSlide ? "active" : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="form-container">
            <div className="form-wrapper">
              {/* Header */}
              <div className="form-header">
                <div className="logo">
                  <span>🕉</span>
                </div>
                <h2 className="form-title">
                  {formType === "login"
                    ? "Welcome Back"
                    : formType === "register"
                    ? "Join Ujjain Yatra"
                    : formType === "verify"
                    ? "Verify Email"
                    : formType === "reset"
                    ? "Reset Password"
                    : "Verify & Reset"}
                </h2>
                <p className="form-subtitle">
                  {formType === "login"
                    ? "Enter your credentials to access your account"
                    : formType === "register"
                    ? "Create your account for spiritual journey"
                    : "Complete the verification process"}
                </p>
              </div>

              {/* Form */}
              <div className="auth-form">
                {formType === "register" && (
                  <>
                    <div className="input-group">
                      <User className="input-icon" size={20} />
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        onChange={handleChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="input-group">
                      <Phone className="input-icon" size={20} />
                      <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        onChange={handleChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="input-group">
                      <Mail className="input-icon" size={20} />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="input-group">
                      <Lock className="input-icon" size={20} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        required
                        className="form-input password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    <div className="input-group">
                      <Shield className="input-icon" size={20} />
                      <select
                        name="userType"
                        onChange={handleChange}
                        defaultValue="Civilian"
                        className="form-input form-select"
                      >
                        <option value="Civilian">Civilian</option>
                        <option value="VIP">VIP</option>
                        <option value="Sadhu">Sadhu</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </>
                )}

                {(formType === "login" ||
                  formType === "reset" ||
                  formType === "verifyReset" ||
                  formType === "verify") && (
                  <div className="input-group">
                    <Mail className="input-icon" size={20} />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                )}

                {formType === "login" && (
                  <div className="input-group">
                    <Lock className="input-icon" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      onChange={handleChange}
                      required
                      className="form-input password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                )}

                {(formType === "verify" || formType === "verifyReset") && (
                  <div className="input-group">
                    <Shield className="input-icon" size={20} />
                    <input
                      type="text"
                      name="otp"
                      placeholder="Enter OTP"
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                )}

                {formType === "verifyReset" && (
                  <div className="input-group">
                    <Lock className="input-icon" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      placeholder="New Password"
                      onChange={handleChange}
                      required
                      className="form-input password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                )}

                {formType === "login" && (
                  <div className="form-options">
                    <label className="remember-me">
                      <input type="checkbox" className="checkbox" />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormType("reset")}
                      className="forgot-password"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="submit-button"
                  onClick={handleSubmit}
                >
                  {isLoading ? (
                    <div className="loading-content">
                      <div className="spinner"></div>
                      Processing...
                    </div>
                  ) : formType === "register" ? (
                    "Create Account"
                  ) : formType === "verify" ? (
                    "Verify Email"
                  ) : formType === "login" ? (
                    "Sign In"
                  ) : formType === "reset" ? (
                    "Send Reset OTP"
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`message ${
                    message.includes("successful") ||
                    message.includes("Welcome")
                      ? "success"
                      : message.includes("Error") || message.includes("failed")
                      ? "error"
                      : "info"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Navigation Links */}
              <div className="nav-links">
                {formType !== "login" && (
                  <button
                    onClick={() => setFormType("login")}
                    className="nav-link"
                  >
                    Already have an account? Sign In
                  </button>
                )}
                {formType === "login" && (
                  <button
                    onClick={() => setFormType("register")}
                    className="nav-link"
                  >
                    Don't have an account? Sign Up
                  </button>
                )}
              </div>

              {/* Token Display - Removed from UI as requested */}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .auth-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #fff7ed, #fef2f2);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .auth-card {
          max-width: 1200px;
          width: 100%;
          background: white;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          animation: slideUp 0.8s ease-out;
        }

        .auth-content {
          display: flex;
          min-height: 600px;
        }

        /* Slider Styles */
        .slider-container {
          display: none;
          position: relative;
          flex: 1;
        }

        @media (min-width: 1024px) {
          .slider-container {
            display: flex;
          }
        }

        .slider-background {
          position: absolute;
          inset: 0;
          transition: all 1s ease-in-out;
        }

        .slider-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
        }

        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .nav-arrow:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-50%) scale(1.1);
        }

        .nav-arrow-left {
          left: 16px;
        }

        .nav-arrow-right {
          right: 16px;
        }

        .slider-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: white;
          padding: 2rem;
          text-align: center;
        }

        .slider-image-container {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 2rem;
          border: 4px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          animation: pulse 2s infinite;
        }

        .slider-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .slider-image-container:hover .slider-image {
          transform: scale(1.1);
        }

        .slider-title {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
          animation: fadeInUp 0.8s ease-out;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .slider-subtitle {
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          opacity: 0.9;
          animation: fadeInUp 0.8s ease-out 0.2s both;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }

        .slider-description {
          font-size: 1.125rem;
          line-height: 1.6;
          max-width: 400px;
          opacity: 0.9;
          animation: fadeInUp 0.8s ease-out 0.4s both;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }

        .slide-indicators {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 10;
        }

        .indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator.active {
          background: white;
          transform: scale(1.2);
        }

        /* Form Styles */
        .form-container {
          width: 100%;
          padding: 2rem;
          flex: 1;
        }

        @media (min-width: 1024px) {
          .form-container {
            padding: 3rem;
          }
        }

        .form-wrapper {
          max-width: 448px;
          margin: 0 auto;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #f97316, #ef4444);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 1.5rem;
          animation: bounceIn 0.6s ease-out;
        }

        .form-title {
          font-size: 1.875rem;
          font-weight: bold;
          background: linear-gradient(135deg, #ea580c, #dc2626);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }

        .form-subtitle {
          color: #6b7280;
          animation: fadeInUp 0.6s ease-out 0.4s both;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-group {
          position: relative;
          animation: fadeInUp 0.6s ease-out both;
        }

        .input-group:nth-child(1) {
          animation-delay: 0.1s;
        }
        .input-group:nth-child(2) {
          animation-delay: 0.2s;
        }
        .input-group:nth-child(3) {
          animation-delay: 0.3s;
        }
        .input-group:nth-child(4) {
          animation-delay: 0.4s;
        }
        .input-group:nth-child(5) {
          animation-delay: 0.5s;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          z-index: 2;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px 12px 48px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          background: white;
          transition: all 0.3s ease;
          outline: none;
        }

        .form-input:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
          transform: translateY(-2px);
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .password-input {
          padding-right: 48px;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .password-toggle:hover {
          color: #6b7280;
        }

        .form-select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 12px center;
          background-repeat: no-repeat;
          background-size: 16px;
          appearance: none;
          cursor: pointer;
        }

        .form-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          animation: fadeInUp 0.6s ease-out 0.6s both;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: #6b7280;
          cursor: pointer;
        }

        .checkbox {
          border-radius: 4px;
          cursor: pointer;
        }

        .forgot-password {
          background: none;
          border: none;
          color: #ea580c;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .forgot-password:hover {
          color: #c2410c;
        }

        .submit-button {
          width: 100%;
          background: linear-gradient(135deg, #f97316, #ef4444);
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          animation: fadeInUp 0.6s ease-out 0.7s both;
        }

        .submit-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #ea580c, #dc2626);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(249, 115, 22, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .message {
          margin-top: 1rem;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          font-weight: 500;
          animation: slideInDown 0.4s ease-out;
        }

        .message.success {
          background: #dcfce7;
          color: #166534;
        }

        .message.error {
          background: #fef2f2;
          color: #991b1b;
        }

        .message.info {
          background: #dbeafe;
          color: #1e40af;
        }

        .nav-links {
          margin-top: 1.5rem;
          text-align: center;
          animation: fadeInUp 0.6s ease-out 0.8s both;
        }

        .nav-link {
          display: block;
          width: 100%;
          background: none;
          border: none;
          color: #6b7280;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.3s ease;
          padding: 8px 0;
        }

        .nav-link:hover {
          color: #ea580c;
        }

        /* Animations */
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .auth-container {
            padding: 0.5rem;
          }

          .form-container {
            padding: 1.5rem;
          }

          .slider-title {
            font-size: 2rem;
          }

          .slider-subtitle {
            font-size: 1.125rem;
          }

          .slider-description {
            font-size: 1rem;
          }

          .slider-image-container {
            width: 100px;
            height: 100px;
          }
        }
      `}</style>
    </div>
  );
};

export default Auth;
