
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css";
import "../styles/Profile.css";

const API_URL = "http://localhost:8080";

function Profile() {
    const navigate = useNavigate();
    const token = sessionStorage.getItem("mentoraToken");

    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        bio: "",
        location: "",
        profileImage: ""
    });

    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await fetch(`${API_URL}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                });

                if (response.status === 401 || response.status === 403) {
                    sessionStorage.removeItem("mentoraToken");
                    navigate("/login", { replace: true });
                    return;
                }

                if (!response.ok) {
                    throw new Error("Unable to load your profile.");
                }

                const data = await response.json();

                setProfile({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    email: data.email || "",
                    bio: data.bio || "",
                    location: data.location || "",
                    profileImage: data.profileImage || ""
                });
            } catch (err) {
                setError(err.message || "Unable to connect to server.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token, navigate]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setProfile(previous => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setMessage("");
        setError("");
        setSaving(true);

        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    firstName: profile.firstName.trim(),
                    lastName: profile.lastName.trim(),
                    bio: profile.bio,
                    location: profile.location
                })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Unable to update profile.");
            }

            setProfile(previous => ({
                ...previous,
                ...data,
                profileImage: data.profileImage || previous.profileImage
            }));

            setMessage("Profile updated successfully!");
        } catch (err) {
            setError(err.message || "Unable to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async () => {
        if (!imageFile) {
            setError("Please select an image first.");
            return;
        }

        if (imageFile.size > 5 * 1024 * 1024) {
            setError("Image size must not exceed 5 MB.");
            return;
        }

        setUploading(true);
        setMessage("");
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", imageFile);

            const response = await fetch(
                `${API_URL}/auth/me/profile-image`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to upload profile picture."
                );
            }

            setProfile(previous => ({
                ...previous,
                profileImage: data.profileImage
            }));

            setImageFile(null);
            setMessage("Profile picture updated successfully!");
        } catch (err) {
            setError(err.message || "Image upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const fullName =
        `${profile.firstName} ${profile.lastName}`.trim();

    const avatarLetter =
        profile.firstName?.charAt(0)?.toUpperCase() ||
        profile.email?.charAt(0)?.toUpperCase() ||
        "M";

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }

    if (error && !profile.email) {
        return (
            <div className="dashboard-error">
                <h2>Unable to load profile</h2>
                <p>{error}</p>
                <button
                    className="retry-btn"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard-container profile-page">

            {/* Reusable Sidebar */}
            <Sidebar />

            <main className="dashboard-main profile-main">

                {/* Header */}
                <header className="profile-top-header">
                    <div>
                        <h1>My Profile</h1>
                        <p>Manage your identity and personal information.</p>
                    </div>

                    {/* <div className="profile-header-badge">
                        <span>✦</span> Your Learning Space
                    </div> */}
                </header>

                {/* Hero Banner */}
                <section className="profile-hero">
                    <div className="profile-hero-content">
                        <span className="profile-eyebrow">
                            YOUR JOURNEY STARTS HERE
                        </span>

                        <h2>
                            Make your profile
                            <span> stand out.</span>
                        </h2>

                        <p>
                            Share your story, showcase your personality,
                            and connect with learners across Mentora.
                        </p>
                    </div>

                    <div className="profile-hero-art">
                        <div className="hero-circle circle-one"></div>
                        <div className="hero-circle circle-two"></div>
                        <span className="hero-star star-one">✦</span>
                        <span className="hero-star star-two">✧</span>
                        <span className="hero-book">📚</span>
                    </div>
                </section>

                {/* Alerts */}
                {message && (
                    <div className="profile-alert profile-success">
                        <span>✓</span> {message}
                    </div>
                )}

                {error && (
                    <div className="profile-alert profile-error">
                        <span>!</span> {error}
                    </div>
                )}

                {/* Main Profile Layout */}
                <section className="profile-content-grid">

                    {/* Profile Picture Card */}
                    <div className="profile-card photo-card">

                        <div className="profile-section-heading">
                            <div>
                                <span className="profile-mini-label">
                                    YOUR IDENTITY
                                </span>
                                <h2>Profile Picture</h2>
                                <p>Put a face to your name.</p>
                            </div>
                        </div>

                        <div className="profile-photo-area">
                            <div className="profile-photo-ring">
                                {profile.profileImage ? (
                                    <img
                                        src={profile.profileImage}
                                        alt="Your profile"
                                        className="profile-large-photo"
                                    />
                                ) : (
                                    <div className="profile-large-photo profile-initial">
                                        {avatarLetter}
                                    </div>
                                )}

                                <span className="profile-photo-status">
                                    ✓
                                </span>
                            </div>
                        </div>

                        <h3 className="photo-user-name">
                            {fullName || "Your Name"}
                        </h3>

                        <p className="photo-user-email">
                            {profile.email}
                        </p>

                        <div className="photo-divider"></div>

                        <label className="profile-file-label">
                            <span>＋</span> Choose Image
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={event => {
                                    setImageFile(
                                        event.target.files?.[0] || null
                                    );
                                    setMessage("");
                                    setError("");
                                }}
                            />
                        </label>

                        {imageFile && (
                            <p className="selected-file-name">
                                {imageFile.name}
                            </p>
                        )}

                        <button
                            type="button"
                            className="profile-primary-btn upload-photo-btn"
                            onClick={handleImageUpload}
                            disabled={uploading || !imageFile}
                        >
                            {uploading ? "Uploading..." : "Upload Photo"}
                        </button>

                        <p className="profile-hint">
                            JPEG, PNG or WebP · Maximum 5 MB
                        </p>
                    </div>

                    {/* Personal Information */}
                    <div className="profile-card profile-form-card">

                        <div className="profile-section-heading">
                            <div>
                                <span className="profile-mini-label">
                                    PERSONAL DETAILS
                                </span>
                                <h2>About You</h2>
                                <p>Let the Mentora community know you better.</p>
                            </div>

                            <div className="profile-heading-icon">✧</div>
                        </div>

                        <form onSubmit={handleSave}>

                            <div className="profile-fields-grid">

                                <div className="profile-field">
                                    <label htmlFor="firstName">
                                        First Name
                                    </label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        value={profile.firstName}
                                        onChange={handleChange}
                                        maxLength={50}
                                        placeholder="Enter first name"
                                        required
                                    />
                                </div>

                                <div className="profile-field">
                                    <label htmlFor="lastName">
                                        Last Name
                                    </label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        value={profile.lastName}
                                        onChange={handleChange}
                                        maxLength={50}
                                        placeholder="Enter last name"
                                        required
                                    />
                                </div>

                                <div className="profile-field full-width">
                                    <label htmlFor="email">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        value={profile.email}
                                        readOnly
                                    />
                                    <span className="field-hint">
                                        Your registered email cannot be
                                        changed here.
                                    </span>
                                </div>

                                <div className="profile-field full-width">
                                    <label htmlFor="location">
                                        Location
                                    </label>
                                    <input
                                        id="location"
                                        name="location"
                                        value={profile.location}
                                        onChange={handleChange}
                                        maxLength={100}
                                        placeholder="e.g. Bengaluru, India"
                                    />
                                </div>

                                <div className="profile-field full-width">
                                    <label htmlFor="bio">
                                        About Me
                                    </label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={profile.bio}
                                        onChange={handleChange}
                                        rows={5}
                                        maxLength={500}
                                        placeholder="Tell the Mentora community about yourself, your interests and what you love learning..."
                                    />
                                    <span className="field-hint bio-count">
                                        {profile.bio.length}/500 characters
                                    </span>
                                </div>

                            </div>

                            <div className="profile-form-actions">
                                <button
                                    type="button"
                                    className="profile-secondary-btn"
                                    onClick={() => navigate("/dashboard")}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="profile-primary-btn save-profile-btn"
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "Save Changes  →"}
                                </button>
                            </div>

                        </form>
                    </div>

                </section>

                <footer className="dashboard-footer">
                    <p>
                        © {new Date().getFullYear()} Mentora.
                        Learn. Teach. Grow.
                    </p>
                </footer>

            </main>
        </div>
    );
}

export default Profile;
