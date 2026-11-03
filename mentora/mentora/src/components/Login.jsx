
import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Login.css";
import logo from "../assets/logo.jpeg";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Invalid email or password."
        );
      }

      if (!data.token) {
        throw new Error("No authentication token received.");
      }

      sessionStorage.setItem("mentoraToken", data.token);

      window.location.href = "/dashboard";
    } catch (err) {
      setError(
        err.message || "Unable to connect to Mentora. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* LEFT BRANDING PANEL */}
      <section className="login-brand">
        <div className="login-brand-header">
          <img src={logo} alt="Mentora logo" className="login-logo" />
          <span className="login-brand-name">Mentora</span>
        </div>

        <span className="login-floating-tag login-marketing">
          📈 Marketing
        </span>

        <span className="login-floating-tag login-java">
          ☕ Java
        </span>

        <span className="login-floating-tag login-design">
          🎨 Design
        </span>

        <span className="login-floating-tag login-react">
          ⚛️ React
        </span>

        <div className="login-brand-content">
          <h1>
            Learn a skill.
            <br />
            <span>Teach a skill.</span>
          </h1>

          <p className="login-tagline">
            Share what you know, discover what you love, and grow
            together with Mentora.
          </p>
        </div>

        <div className="login-feature-grid">
          <div className="login-feature-card">
            <h2>Learn</h2>
            <p>Something new</p>
          </div>

          <div className="login-feature-card">
            <h2>Teach</h2>
            <p>What you know</p>
          </div>

          <div className="login-feature-card">
            <h2>Connect</h2>
            <p>With learners</p>
          </div>

          <div className="login-feature-card">
            <h2>Grow</h2>
            <p>Together</p>
          </div>
        </div>
      </section>

      {/* RIGHT LOGIN FORM */}
      <section className="login-form-section">
        <div className="login-form-container">

          <div className="login-heading">
            <h2>Welcome back!</h2>
            <p>
              Don't have an account?{" "}
              <Link to="/register">Create account</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-input-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="login-input-group">
              <label htmlFor="password">Password</label>

              <div className="login-password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="login-eye-button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In  →"}
            </button>
          </form>

          <p className="login-terms">
            By signing in, you agree to our{" "}
            <a href="/terms">Terms of Service</a>.
          </p>

        </div>
      </section>
    </div>
  );
}

export default Login;
