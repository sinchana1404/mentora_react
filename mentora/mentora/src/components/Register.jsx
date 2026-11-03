
import { useState } from "react";
import "../styles/Register.css";
import logo from "../assets/logo.jpeg";

function Register() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (
            !formData.firstName.trim() ||
            !formData.lastName.trim() ||
            !formData.email.trim() ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:8080/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );

            const message = await response.text();

            if (!response.ok) {
                throw new Error(
                    message || `Registration failed (${response.status}).`
                );
            }

            setSuccess(message || "Registration successful!");

            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                confirmPassword: ""
            });
        } catch (err) {
            setError(
                err instanceof TypeError
                    ? "Cannot connect to the server. Check that Spring Boot is running and CORS is configured."
                    : err.message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <section className="register-brand">
                <div className="glow glow-one"></div>
                <div className="glow glow-two"></div>

                <div className="brand-header">
                    <div className="brand-logo">
                        <img src={logo} alt="Mentora logo" />
                    </div>
                    <h2>Mentora</h2>
                </div>

                <div className="brand-content">
                    <h1>
                        Learn a skill.
                        <br />
                        <span>Teach a skill.</span>
                    </h1>
                    <p>
                        Share what you know, discover what you love,
                        and grow together with Mentora.
                    </p>
                </div>

                <div className="skill-tag marketing">
                    📈 Marketing
                </div>
                <div className="skill-tag design">
                    🎨 Design
                </div>
                <div className="skill-tag java">
                    ☕ Java
                </div>
                <div className="skill-tag react">
                    ⚛️ React
                </div>
                <div className="skill-tag python">
                    🐍 Python
                </div>
                <div className="skill-tag photography">
                    📸 Photography
                </div>
                <div className="skill-tag guitar">
                    🎸 Guitar
                </div>
                <div className="skill-tag uiux">
                    ✨ UI/UX
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Learn</h3>
                        <p>Something new</p>
                    </div>
                    <div className="stat-card">
                        <h3>Teach</h3>
                        <p>What you know</p>
                    </div>
                    <div className="stat-card">
                        <h3>Connect</h3>
                        <p>With learners</p>
                    </div>
                    <div className="stat-card">
                        <h3>Grow</h3>
                        <p>Together</p>
                    </div>
                </div>
            </section>

            <section className="register-form-section">
                <div className="register-form-container">
                    <div className="form-heading">
                        <h1>Create your account</h1>
                        <p>
                            Already have an account?{" "}
                            <a href="/login">Log in</a>
                        </p>
                    </div>

                    {error && (
                        <p className="register-error" role="alert">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p
                            className="register-success"
                            role="status"
                        >
                            {success}
                        </p>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="name-row">
                            <div className="input-group">
                                <label htmlFor="firstName">
                                    First name
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    placeholder="Enter first name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    autoComplete="given-name"
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="lastName">
                                    Last name
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    placeholder="Enter last name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    autoComplete="family-name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="email">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">
                                Password
                            </label>
                            <div className="password-wrapper">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    minLength={6}
                                    required
                                />
                                <button
                                    type="button"
                                    className="eye-button"
                                    onClick={() =>
                                        setShowPassword((prev) => !prev)
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="confirmPassword">
                                Confirm password
                            </label>
                            <div className="password-wrapper">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Re-enter your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    minLength={6}
                                    required
                                />
                                <button
                                    type="button"
                                    className="eye-button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (prev) => !prev
                                        )
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide confirm password"
                                            : "Show confirm password"
                                    }
                                >
                                    {showConfirmPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="join-button"
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "Create Account"}
                            {!loading && <span>→</span>}
                        </button>

                        <p className="terms">
                            By creating an account, you agree to our{" "}
                            <a href="/terms">Terms of Service</a>.
                        </p>
                    </form>
                </div>
            </section>
        </div>
    );
}

export default Register;
