
import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import "../styles/Request.css";

const API_URL = "http://localhost:8080";

function Request() {
  const [activeTab, setActiveTab] = useState("received");
  const navigate = useNavigate();

  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);

  const [unreadCounts, setUnreadCounts] = useState({});

  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = sessionStorage.getItem("mentoraToken");

  // Fetch sent and received requests
  const fetchRequests = useCallback(async () => {
    if (!token) {
      setError("Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [sentResponse, receivedResponse] = await Promise.all([
        fetch(`${API_URL}/exchange-requests/sent`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(`${API_URL}/exchange-requests/received`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!sentResponse.ok || !receivedResponse.ok) {
        if (
          sentResponse.status === 401 ||
          receivedResponse.status === 401
        ) {
          throw new Error("Session expired. Please log in again.");
        }

        throw new Error("Unable to load exchange requests.");
      }

      const sentData = await sentResponse.json();
      const receivedData = await receivedResponse.json();

      const sentList = Array.isArray(sentData) ? sentData : [];
      const receivedList = Array.isArray(receivedData)
        ? receivedData
        : [];

      setSentRequests(sentList);
      setReceivedRequests(receivedList);

      // Fetch unread message counts for accepted requests
      const acceptedRequests = [...sentList, ...receivedList].filter(
        (request) => request.status === "ACCEPTED"
      );

      const unreadResults = await Promise.all(
        acceptedRequests.map(async (request) => {
          try {
            const response = await fetch(
              `${API_URL}/chat/${request.requestId}/unread-count`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!response.ok) {
              console.error(
                "Unread count failed for request:",
                request.requestId
              );
              return [request.requestId, 0];
            }

            const count = await response.json();

            return [request.requestId, Number(count) || 0];

          } catch (err) {
            console.error("Unread count error:", err);
            return [request.requestId, 0];
          }
        })
      );

      setUnreadCounts(Object.fromEntries(unreadResults));

    } catch (err) {
      console.error("Fetch Requests Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Accept, reject or cancel request
  const handleRequestAction = async (requestId, action) => {
    if (!token) {
      setError("Please log in again.");
      return;
    }

    setActionId(requestId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/exchange-requests/${requestId}/${action}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || `Unable to ${action} request.`);
      }

      setSuccess(
        action === "accept"
          ? "Exchange request accepted successfully!"
          : action === "reject"
          ? "Exchange request rejected successfully!"
          : "Exchange request cancelled successfully!"
      );

      await fetchRequests();

    } catch (err) {
      console.error("Request Action Error:", err);
      setError(err.message);
    } finally {
      setActionId(null);
    }
  };

  const getStatusClass = (status) => {
    return (status || "pending").toLowerCase();
  };

  const currentRequests =
    activeTab === "sent" ? sentRequests : receivedRequests;

  const pendingCount = receivedRequests.filter(
    (request) => request.status === "PENDING"
  ).length;

  return (
    <div className="mentora-requests-layout">
      <Sidebar />

      <main className="requests-main">

        {/* TOP BAR */}
        <header className="requests-topbar">
          <div>
            <span className="requests-breadcrumb">
              Workspace / Requests
            </span>
            <h2>Exchange Requests</h2>
          </div>

          <button
            className="requests-refresh-btn"
            onClick={fetchRequests}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </header>

        {/* HERO */}
        <section className="requests-hero">
          <div className="requests-hero-content">
            <span className="requests-hero-tag">
              ✨ YOUR LEARNING CONNECTIONS
            </span>

            <h1>
              Manage your
              <br />
              <span>skill exchanges.</span>
            </h1>

            <p>
              Connect with learners, accept opportunities and start sharing
              knowledge.
            </p>

            <div className="requests-hero-stats">
              <div>
                <strong>{sentRequests.length}</strong>
                <span>Sent requests</span>
              </div>

              <div className="requests-stat-divider"></div>

              <div>
                <strong>{receivedRequests.length}</strong>
                <span>Received requests</span>
              </div>

              <div className="requests-stat-divider"></div>

              <div>
                <strong>{pendingCount}</strong>
                <span>Awaiting response</span>
              </div>
            </div>
          </div>

          <div className="requests-hero-decoration">
            <div className="requests-orbit orbit-one"></div>
            <div className="requests-orbit orbit-two"></div>
            <div className="requests-hero-icon">⇄</div>
            <span className="requests-star star-one">✦</span>
            <span className="requests-star star-two">✧</span>
          </div>
        </section>

        {/* ALERTS */}
        {success && (
          <div className="requests-alert requests-success">
            <span>✓</span>
            <p>{success}</p>
            <button onClick={() => setSuccess("")}>×</button>
          </div>
        )}

        {error && (
          <div className="requests-alert requests-error">
            <span>!</span>
            <p>{error}</p>
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {/* TABS */}
        <section className="requests-content">
          <div className="requests-heading">
            <div>
              <h2>Your Requests</h2>
              <p>Keep track of your skill exchange activity.</p>
            </div>
          </div>

          <div className="requests-tabs">
            <button
              className={activeTab === "received" ? "active" : ""}
              onClick={() => setActiveTab("received")}
            >
              Received Requests
              <span>{receivedRequests.length}</span>
            </button>

            <button
              className={activeTab === "sent" ? "active" : ""}
              onClick={() => setActiveTab("sent")}
            >
              Sent Requests
              <span>{sentRequests.length}</span>
            </button>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="requests-empty">
              <div className="requests-loader"></div>
              <p>Loading your requests...</p>
            </div>
          )}

          {/* REQUEST CARDS */}
          {!loading && currentRequests.length > 0 && (
            <div className="requests-grid">
              {currentRequests.map((request) => {
                const isReceived = activeTab === "received";

                const otherUser = isReceived
                  ? request.senderEmail
                  : request.receiverEmail;

                const displaySkill = isReceived
                  ? request.receiverSkillName
                  : request.senderSkillName;

                const exchangeSkill = isReceived
                  ? request.senderSkillName
                  : request.receiverSkillName;

                return (
                  <article
                    className="request-card"
                    key={request.requestId}
                  >
                    <div className="request-card-header">
                      <div className="request-person">
                        <div className="request-avatar">
                          {(otherUser || "U").charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <h3>{otherUser}</h3>
                          <span>Request #{request.requestId}</span>
                        </div>
                      </div>

                      <span
                        className={`request-status ${getStatusClass(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </div>

                    <div className="request-card-divider"></div>

                    <p className="request-exchange-label">
                      SKILL EXCHANGE
                    </p>

                    <div className="request-skill-row">
                      <div className="request-skill-icon">↗</div>

                      <div className="request-skill-info">
                        <span>
                          {isReceived ? "THEY OFFER" : "YOU OFFER"}
                        </span>
                        <h4>{displaySkill}</h4>
                      </div>
                    </div>

                    <div className="request-exchange-arrow">⇅</div>

                    <div className="request-skill-row">
                      <div className="request-skill-icon learn">↙</div>

                      <div className="request-skill-info">
                        <span>
                          {isReceived
                            ? "THEY WANT TO LEARN"
                            : "YOU WANT TO LEARN"}
                        </span>
                        <h4>{exchangeSkill}</h4>
                      </div>
                    </div>

                    {request.message && (
                      <div className="request-message">
                        <span>Message</span>
                        <p>{request.message}</p>
                      </div>
                    )}

                    <div className="request-card-footer">
                      <span className="request-date">
                        {request.createdAt
                          ? new Date(
                              request.createdAt
                            ).toLocaleDateString()
                          : "Date unavailable"}
                      </span>

                      {/* Accept and Reject buttons */}
                      {isReceived && request.status === "PENDING" && (
                        <div className="request-actions">
                          <button
                            className="reject-btn"
                            disabled={actionId !== null}
                            onClick={() =>
                              handleRequestAction(
                                request.requestId,
                                "reject"
                              )
                            }
                          >
                            {actionId === request.requestId
                              ? "Please wait..."
                              : "Reject"}
                          </button>

                          <button
                            className="accept-btn"
                            disabled={actionId !== null}
                            onClick={() =>
                              handleRequestAction(
                                request.requestId,
                                "accept"
                              )
                            }
                          >
                            Accept
                          </button>
                        </div>
                      )}

                      {/* Cancel button */}
                      {!isReceived && request.status === "PENDING" && (
                        <div className="request-actions">
                          <button
                            className="reject-btn"
                            disabled={actionId !== null}
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to cancel this request?"
                                )
                              ) {
                                handleRequestAction(
                                  request.requestId,
                                  "cancel"
                                );
                              }
                            }}
                          >
                            {actionId === request.requestId
                              ? "Please wait..."
                              : "Cancel Request"}
                          </button>
                        </div>
                      )}

                      {/* Chat button with unread count */}
                      {request.status === "ACCEPTED" && (
                        <button
                          className="chat-btn"
                          onClick={() =>
                            navigate(`/chat/${request.requestId}`)
                          }
                        >
                          💬 Chat

                          {unreadCounts[request.requestId] > 0 && (
                            <span className="unread-badge">
                              {unreadCounts[request.requestId]}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && currentRequests.length === 0 && (
            <div className="requests-empty">
              <div className="requests-empty-icon">
                {activeTab === "received" ? "↓" : "↑"}
              </div>

              <h3>
                {activeTab === "received"
                  ? "No requests received yet"
                  : "No requests sent yet"}
              </h3>

              <p>
                {activeTab === "received"
                  ? "When someone sends you a skill exchange request, it will appear here."
                  : "Explore skills and send an exchange request to start learning."}
              </p>
            </div>
          )}
        </section>

        <footer className="requests-footer">
          Made for curious minds. <span>💜</span> Mentora
        </footer>

      </main>
    </div>
  );
}

export default Request;
