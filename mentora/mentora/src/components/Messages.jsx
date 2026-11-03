import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/Messages.css";

const API_URL = "http://localhost:8080";

function Messages() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = sessionStorage.getItem("mentoraToken");

  const fetchConversations = useCallback(async () => {
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
        throw new Error("Unable to load conversations.");
      }

      const sentData = await sentResponse.json();
      const receivedData = await receivedResponse.json();

      const sentList = Array.isArray(sentData) ? sentData : [];
      const receivedList = Array.isArray(receivedData)
        ? receivedData
        : [];

      // Get only accepted requests
      const acceptedRequests = [
        ...sentList,
        ...receivedList,
      ].filter((request) => request.status === "ACCEPTED");

      // Remove duplicate requests
      const uniqueRequests = Array.from(
        new Map(
          acceptedRequests.map((request) => [
            request.requestId,
            request,
          ])
        ).values()
      );

      // Fetch unread message counts
      const requestsWithUnread = await Promise.all(
        uniqueRequests.map(async (request) => {
          try {
            const response = await fetch(
              `${API_URL}/chat/${request.requestId}/unread-count`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const count = response.ok
              ? Number(await response.json()) || 0
              : 0;

            return {
              ...request,
              unreadCount: count,
            };
          } catch (err) {
            console.error("Unread count error:", err);

            return {
              ...request,
              unreadCount: 0,
            };
          }
        })
      );

      setConversations(requestsWithUnread);

    } catch (err) {
      console.error("Messages Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const openChat = (requestId) => {
    navigate(`/chat/${requestId}`);
  };

  return (
    <div className="messages-layout">
      <Sidebar />

      <main className="messages-main">

        <header className="messages-topbar">
          <div>
            <span className="messages-breadcrumb">
              Workspace / Messages
            </span>

            <h2>Messages</h2>
          </div>

          <button
            className="messages-refresh-btn"
            onClick={fetchConversations}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </header>

        <section className="messages-hero">
          <div>
            <span className="messages-hero-tag">
              ✨ YOUR LEARNING CONNECTIONS
            </span>

            <h1>
              Keep the
              <br />
              <span>conversation going.</span>
            </h1>

            <p>
              Connect with your skill exchange partners and
              continue learning together.
            </p>

            <div className="messages-hero-count">
              <strong>{conversations.length}</strong>
              <span>Active conversations</span>
            </div>
          </div>

          <div className="messages-hero-icon">
            💬
          </div>
        </section>

        <section className="messages-content">

          <div className="messages-heading">
            <div>
              <h2>Your Conversations</h2>
              <p>
                Chat with people whose exchange requests you have accepted.
              </p>
            </div>
          </div>

          {error && (
            <div className="messages-error">
              {error}
            </div>
          )}

          {loading && (
            <div className="messages-empty">
              <div className="messages-loader"></div>
              <p>Loading conversations...</p>
            </div>
          )}

          {!loading && !error && conversations.length > 0 && (
            <div className="messages-list">

              {conversations.map((request) => {

                // Check whether this request was sent or received
                const isSent = request.receiverEmail != null;

                const otherUser = isSent
                  ? request.receiverEmail
                  : request.senderEmail;

                const firstSkill = isSent
                  ? request.senderSkillName
                  : request.receiverSkillName;

                const secondSkill = isSent
                  ? request.receiverSkillName
                  : request.senderSkillName;

                return (
                  <article
                    className="conversation-card"
                    key={request.requestId}
                    onClick={() => openChat(request.requestId)}
                  >

                    <div className="conversation-avatar">
                      {(otherUser || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="conversation-details">

                      <div className="conversation-top">
                        <h3>{otherUser || "Mentora User"}</h3>

                        <span className="conversation-status">
                          Accepted
                        </span>
                      </div>

                      <p className="conversation-skills">
                        {firstSkill || "Skill"} ↔ {secondSkill || "Skill"}
                      </p>

                      <span className="conversation-subtitle">
                        Exchange Request #{request.requestId}
                      </span>

                    </div>

                    <div className="conversation-right">

                      {request.unreadCount > 0 && (
                        <span className="conversation-unread">
                          {request.unreadCount}
                        </span>
                      )}

                      <button
                        className="open-chat-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          openChat(request.requestId);
                        }}
                      >
                        Open Chat →
                      </button>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

          {!loading && !error && conversations.length === 0 && (
            <div className="messages-empty">
              <div className="messages-empty-icon">
                💬
              </div>

              <h3>No conversations yet</h3>

              <p>
                Once an exchange request is accepted, your conversation
                will appear here.
              </p>

              <button
                onClick={() => navigate("/requests")}
                className="messages-request-btn"
              >
                View Requests
              </button>
            </div>
          )}

        </section>

        <footer className="messages-footer">
          Made for curious minds. 💜 Mentora
        </footer>

      </main>
    </div>
  );
}

export default Messages;