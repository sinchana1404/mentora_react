
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";
import logo from "../assets/logo.jpeg";

const API_URL = "http://localhost:8080";

function Sidebar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = sessionStorage.getItem("mentoraToken");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          sessionStorage.removeItem("mentoraToken");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load profile");
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Sidebar profile error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // Fetch unread notification count
 
// Fetch unread notification count
useEffect(() => {
    const fetchUnreadCount = async () => {
        const token = sessionStorage.getItem("mentoraToken");

        if (!token) return;

        try {
            const response = await fetch(
                `${API_URL}/notifications/unread-count`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Unable to fetch notification count");
            }

            const count = await response.json();
            setUnreadCount(count);

        } catch (error) {
            console.error("Notification count error:", error);
        }
    };

    // Fetch count when Sidebar loads
    fetchUnreadCount();

    // Listen for notification updates
    window.addEventListener(
        "notificationsUpdated",
        fetchUnreadCount
    );

    // Fallback refresh every 15 seconds
    const interval = setInterval(fetchUnreadCount, 15000);

    return () => {
        window.removeEventListener(
            "notificationsUpdated",
            fetchUnreadCount
        );

        clearInterval(interval);
    };
}, []);
 

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  const avatarLetter = (
    user?.firstName?.charAt(0) ||
    user?.email?.charAt(0) ||
    "U"
  ).toUpperCase();

  const handleLogout = () => {
    sessionStorage.removeItem("mentoraToken");
    navigate("/login");
  };

  return (
    <aside className="mentora-sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <img src={logo} alt="Mentora Logo" />
        <h2>Mentora</h2>
      </div>

      {/* User Profile */}
      <div className="sidebar-profile">
        {user?.profileImage && !imageError ? (
          <img
            src={user.profileImage}
            alt="Profile"
            className="profile-avatar dashboard-photo"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="profile-avatar avatar-fallback">
            {avatarLetter}
          </div>
        )}

        <div className="sidebar-user-info">
          <h3>{loading ? "Loading..." : fullName || "Mentora User"}</h3>
          <p>{user?.email || ""}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">

        <NavLink to="/dashboard" className="nav-item">
          <span>▦</span>
          Dashboard
        </NavLink>

        <NavLink to="/explore-skills" className="nav-item">
          <span>⌕</span>
          Explore Skills
        </NavLink>

        <NavLink to="/myskill" className="nav-item">
          <span>✧</span>
          My Skills
        </NavLink>

        <NavLink to="/learning-goals" className="nav-item">
          <span>✧</span>
          Learning Goals
        </NavLink>

        <NavLink to="/requests" className="nav-item">
          <span>⇄</span>
          Requests
        </NavLink>

        <NavLink to="/messages" className="nav-item">
          <span>✉</span>
          Messages
        </NavLink>

        {/* Notifications */}
        <NavLink to="/notifications" className="nav-item notification-nav">
          <span className="notification-icon">♧</span>
          Notifications

          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </NavLink>

        <NavLink to="/profile" className="nav-item">
          <span>♙</span>
          My Profile
        </NavLink>

      </nav>

      {/* Logout */}
      <button
        type="button"
        className="sidebar-logout"
        onClick={handleLogout}
      >
        <span>↪</span>
        Logout
      </button>

    </aside>
  );
}

export default Sidebar;
