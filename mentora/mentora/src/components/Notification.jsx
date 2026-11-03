
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/Notification.css";

const API_URL = "http://localhost:8080";

function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const token = sessionStorage.getItem("mentoraToken");

    // Fetch all notifications
    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${API_URL}/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch notifications");
            }

            const data = await response.json();
            setNotifications(data);

        } catch (error) {
            console.error("Notification fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch unread notification count
    const fetchUnreadCount = async () => {
        try {
            const response = await fetch(
                `${API_URL}/notifications/unread-count`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch unread count");
            }

            const count = await response.json();
            setUnreadCount(count);

        } catch (error) {
            console.error("Notification count error:", error);
        }
    };

    // Mark individual notification as read
    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(
                `${API_URL}/notifications/${notificationId}/read`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to mark notification as read");
            }

            await fetchNotifications();
            await fetchUnreadCount();

            // Update sidebar notification badge
            window.dispatchEvent(new Event("notificationsUpdated"));

        } catch (error) {
            console.error("Mark as read error:", error);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            const response = await fetch(
                `${API_URL}/notifications/read-all`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to mark all as read");
            }

            await fetchNotifications();
            await fetchUnreadCount();

            // Update sidebar notification badge
            window.dispatchEvent(new Event("notificationsUpdated"));

        } catch (error) {
            console.error("Mark all as read error:", error);
        }
    };

    // Load notifications when page opens
    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        fetchNotifications();
        fetchUnreadCount();

        // Listen for notification updates
        const handleNotificationUpdate = () => {
            fetchUnreadCount();
        };

        window.addEventListener(
            "notificationsUpdated",
            handleNotificationUpdate
        );

        // Refresh unread count every 15 seconds
        const interval = setInterval(fetchUnreadCount, 15000);

        return () => {
            window.removeEventListener(
                "notificationsUpdated",
                handleNotificationUpdate
            );

            clearInterval(interval);
        };
    }, []);

    // Notification icons based on type
    const getIcon = (type) => {
        switch (type) {
            case "REQUEST_RECEIVED":
                return "📩";
            case "REQUEST_ACCEPTED":
                return "✅";
            case "REQUEST_REJECTED":
                return "❌";
            case "NEW_MESSAGE":
                return "💬";
            case "SESSION_REMINDER":
                return "⏰";
            case "SESSION_COMPLETED":
                return "🎯";
            case "NEW_REVIEW":
                return "⭐";
            case "REQUEST_CANCELLED":
                return "🚫";
            default:
                return "🔔";
        }
    };

    // Format notification date
    const formatDate = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="notification-layout">

            {/* Sidebar */}
            <Sidebar />

            {/* Main Notification Content */}
            <main className="notification-main">

                {/* Page Header */}
                <div className="notification-header">
                    <div>
                        <span className="notification-subtitle">
                            STAY UPDATED
                        </span>

                        <h1>Notifications</h1>

                        <p>
                            Keep track of your Mentora activities and updates.
                        </p>
                    </div>

                    <div className="notification-summary">
                        <div className="summary-icon">🔔</div>

                        <div>
                            <h2>{unreadCount}</h2>
                            <span>Unread notifications</span>
                        </div>
                    </div>
                </div>

                {/* Notification Toolbar */}
                <div className="notification-toolbar">
                    <div>
                        <h3>All Notifications</h3>
                        <span>
                            {notifications.length} total updates
                        </span>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            className="mark-all-btn"
                            onClick={markAllAsRead}
                        >
                            ✓ Mark all as read
                        </button>
                    )}
                </div>

                {/* Notification List */}
                <div className="notification-list">

                    {loading ? (

                        <div className="notification-empty">
                            Loading notifications...
                        </div>

                    ) : notifications.length === 0 ? (

                        <div className="notification-empty">
                            <div className="empty-icon">🔔</div>

                            <h3>You're all caught up!</h3>

                            <p>
                                You don't have any notifications right now.
                                We'll let you know when something happens.
                            </p>
                        </div>

                    ) : (

                        notifications.map((notification) => (

                            <div
                                key={notification.notificationId}
                                className={`notification-card ${
                                    notification.read ? "read" : "unread"
                                }`}
                            >

                                {/* Notification Icon */}
                                <div className="notification-card-icon">
                                    {getIcon(notification.type)}
                                </div>

                                {/* Notification Details */}
                                <div className="notification-content">

                                    <div className="notification-title-row">
                                        <h3>{notification.title}</h3>

                                        {!notification.read && (
                                            <span className="unread-dot"></span>
                                        )}
                                    </div>

                                    <p>{notification.message}</p>

                                    <div className="notification-meta">

                                        <span className="notification-type">
                                            {notification.type?.replaceAll(
                                                "_",
                                                " "
                                            )}
                                        </span>

                                        <span>
                                            {formatDate(notification.createdAt)}
                                        </span>

                                    </div>
                                </div>

                                {/* Mark Individual Notification as Read */}
                                {!notification.read && (
                                    <button
                                        className="mark-read-btn"
                                        onClick={() =>
                                            markAsRead(
                                                notification.notificationId
                                            )
                                        }
                                    >
                                        Mark as read
                                    </button>
                                )}

                            </div>

                        ))
                    )}

                </div>
            </main>
        </div>
    );
}

export default Notification;
