
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css";

const API_URL = "http://localhost:8080";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);

  const [stats, setStats] = useState({
    skillsOffered: 0,
    learningGoals: 0,
    pendingRequests: 0,
    completedExchanges: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      const token = sessionStorage.getItem("mentoraToken");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // 1. Fetch Profile
        const profileResponse = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (
          profileResponse.status === 401 ||
          profileResponse.status === 403
        ) {
          sessionStorage.removeItem("mentoraToken");
          navigate("/login");
          return;
        }

        if (!profileResponse.ok) {
          throw new Error("Unable to load profile.");
        }

        const profileData = await profileResponse.json();

        if (!cancelled) {
          setUser(profileData);
        }

        // 2. Fetch Dashboard Statistics
        const statsResponse = await fetch(`${API_URL}/dashboard/summary`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (
          statsResponse.status === 401 ||
          statsResponse.status === 403
        ) {
          sessionStorage.removeItem("mentoraToken");
          navigate("/login");
          return;
        }

        if (!statsResponse.ok) {
          throw new Error("Unable to load dashboard statistics.");
        }

        const statsData = await statsResponse.json();

        if (!cancelled) {
          setStats({
            skillsOffered: statsData.skillsOffered ?? 0,
            learningGoals: statsData.learningGoals ?? 0,
            pendingRequests: statsData.pendingRequests ?? 0,
            completedExchanges: statsData.completedExchanges ?? 0,
          });
        }

        // 3. Fetch Recent Activity
        const activityResponse = await fetch(
          `${API_URL}/dashboard/recent-activity`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (
          activityResponse.status === 401 ||
          activityResponse.status === 403
        ) {
          sessionStorage.removeItem("mentoraToken");
          navigate("/login");
          return;
        }

        if (!activityResponse.ok) {
          throw new Error("Unable to load recent activity.");
        }

        const activityData = await activityResponse.json();

        if (!cancelled) {
          setRecentActivity(activityData);
        }

      } catch (err) {
        console.error("Dashboard loading error:", err);

        if (!cancelled) {
          setError(
            "Some dashboard information could not be loaded. Please refresh the page."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const fullName = `${user?.firstName || ""} ${
    user?.lastName || ""
  }`.trim();

  const avatarLetter = (
    user?.firstName?.charAt(0) ||
    user?.email?.charAt(0) ||
    "U"
  ).toUpperCase();

  const ProfileAvatar = ({ className = "" }) => {
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
      setImageError(false);
    }, [user?.profileImage]);

    if (user?.profileImage && !imageError) {
      return (
        <img
          src={user.profileImage}
          alt="Profile"
          className={`${className} dashboard-photo`}
          onError={() => setImageError(true)}
        />
      );
    }

    return (
      <div className={`${className} avatar-fallback`}>
        {avatarLetter}
      </div>
    );
  };

  return (
    <div className="dashboard-container">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main">

        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Here's what's happening with your learning journey.</p>
          </div>

          <div className="header-user">
            <div className="header-user-info">
              <span>{fullName || "Welcome"}</span>
              <small>{user?.email || ""}</small>
            </div>

            <ProfileAvatar className="header-avatar" />
          </div>
        </header>

        {error && (
          <div className="dashboard-error" role="alert">
            {error}
          </div>
        )}

        {/* Welcome Banner */}
        <section className="welcome-banner">
          <div>
            <p className="welcome-label">YOUR LEARNING SPACE</p>

            <h2>
              Welcome back
              {user?.firstName ? `, ${user.firstName}` : "!"}
            </h2>

            <p>
              Keep learning, share your knowledge, and connect with people
              who inspire you.
            </p>

            <button
              type="button"
              className="welcome-button"
              onClick={() => navigate("/explore-skills")}
            >
              Explore Skills <span>→</span>
            </button>
          </div>

          <div className="welcome-decoration" aria-hidden="true">
            ✦
          </div>
        </section>

        {/* Statistics */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Your Overview</h2>
              <p>Keep track of your Mentora activity.</p>
            </div>
          </div>

          <div className="stats-grid">

            <div className="stat-card">
              <div className="stat-icon purple">✧</div>
              <div>
                <p>Skills Offered</p>
                <h3>{loading ? "..." : stats.skillsOffered}</h3>
                <span>Skills you're sharing</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon pink">◎</div>
              <div>
                <p>Learning Goals</p>
                <h3>{loading ? "..." : stats.learningGoals}</h3>
                <span>Skills you want to learn</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">⇄</div>
              <div>
                <p>Pending Requests</p>
                <h3>{loading ? "..." : stats.pendingRequests}</h3>
                <span>Requests awaiting action</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">✓</div>
              <div>
                <p>Completed Exchanges</p>
                <h3>{loading ? "..." : stats.completedExchanges}</h3>
                <span>Your learning achievements</span>
              </div>
            </div>

          </div>
        </section>

        {/* Quick Actions */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>What would you like to do today?</p>
            </div>
          </div>

          <div className="quick-actions-grid">

            <button
              type="button"
              className="quick-action-card"
              onClick={() => navigate("/explore-skills")}
            >
              <div className="quick-action-icon">⌕</div>
              <div>
                <h3>Explore Skills</h3>
                <p>Discover skills from other learners.</p>
              </div>
              <span className="action-arrow">→</span>
            </button>

            <button
              type="button"
              className="quick-action-card"
              onClick={() => navigate("/myskill")}
            >
              <div className="quick-action-icon">✧</div>
              <div>
                <h3>Manage My Skills</h3>
                <p>Share the skills you can teach.</p>
              </div>
              <span className="action-arrow">→</span>
            </button>

            <button
              type="button"
              className="quick-action-card"
              onClick={() => navigate("/requests")}
            >
              <div className="quick-action-icon">⇄</div>
              <div>
                <h3>View Requests</h3>
                <p>Manage your skill exchange requests.</p>
              </div>
              <span className="action-arrow">→</span>
            </button>

          </div>
        </section>

        {/* Recent Activity and Profile */}
        <div className="dashboard-bottom-grid">

          {/* Recent Activity */}
          <section className="activity-section">
            <div className="section-heading">
              <div>
                <h2>Recent Activity</h2>
                <p>Your latest learning updates.</p>
              </div>
            </div>

            <div className="recent-activity-list">

              {loading ? (
                <div className="empty-activity">
                  <p>Loading recent activity...</p>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="empty-activity">
                  <div className="empty-activity-icon">✦</div>
                  <h3>No recent activity yet</h3>
                  <p>
                    Send or receive a skill exchange request to see your
                    recent activity here.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/explore-skills")}
                  >
                    Explore Skills
                  </button>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    className="activity-item"
                    key={activity.requestId}
                  >
                    <div
                      className={`activity-icon ${activity.status?.toLowerCase()}`}
                    >
                      {activity.status === "COMPLETED" ||
                      activity.status === "ACCEPTED"
                        ? "✓"
                        : activity.status === "REJECTED"
                        ? "✕"
                        : "⇄"}
                    </div>

                    <div className="activity-content">
                      <h4>{activity.description}</h4>

                      <p>
                        {activity.activityDate
                          ? new Date(activity.activityDate).toLocaleString()
                          : "Recently"}
                      </p>
                    </div>

                    <span
                      className={`activity-status ${activity.status?.toLowerCase()}`}
                    >
                      {activity.status}
                    </span>
                  </div>
                ))
              )}

            </div>
          </section>

          {/* Profile Summary */}
          <section className="profile-summary">
            <div className="section-heading">
              <div>
                <h2>My Profile</h2>
                <p>Your personal information.</p>
              </div>
            </div>

            <div className="profile-summary-header">
              <ProfileAvatar className="summary-avatar" />

              <div>
                <h3>{fullName || "Mentora User"}</h3>
                <p>{user?.email || ""}</p>
              </div>
            </div>

            <div className="profile-details">
              <div>
                <span>Location</span>
                <p>{user?.location || "Not added yet"}</p>
              </div>

              <div>
                <span>About Me</span>
                <p>{user?.bio || "Tell others about yourself."}</p>
              </div>
            </div>

            <button
              type="button"
              className="edit-profile-button"
              onClick={() => navigate("/profile")}
            >
              Edit Profile <span>→</span>
            </button>
          </section>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
