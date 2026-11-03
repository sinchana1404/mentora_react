
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import Sidebar from "../components/Sidebar";
import "../styles/Chat.css";

const API_URL = "http://localhost:8080";

function Chat() {
    const { requestId } = useParams();
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState("");

    const stompClientRef = useRef(null);
    const messagesEndRef = useRef(null);

    const token = sessionStorage.getItem("mentoraToken");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!token) {
            setError("Your session has expired. Please log in again.");
            setLoading(false);
            return;
        }

        let isMounted = true;

        const loadChatHistory = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/chat/${requestId}/messages`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Unable to load chat history (${response.status})`
                    );
                }

                const data = await response.json();

                if (isMounted) {
                    setMessages(data);
                }

                await fetch(
                    `${API_URL}/chat/${requestId}/read`,
                    {
                        method: "PUT",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

            } catch (err) {
                console.error("Chat history error:", err);

                if (isMounted) {
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        const connectWebSocket = () => {
            const client = new Client({
                webSocketFactory: () =>
                    new SockJS(`${API_URL}/ws`),

                connectHeaders: {
                    Authorization: `Bearer ${token}`
                },

                reconnectDelay: 5000,
                heartbeatIncoming: 10000,
                heartbeatOutgoing: 10000,

                onConnect: () => {
                    console.log("WebSocket Connected Successfully");

                    if (!isMounted) return;

                    setConnected(true);
                    setError("");

                    client.subscribe(
                        `/topic/chat/${requestId}`,
                        (message) => {
                            const receivedMessage = JSON.parse(message.body);

                            setMessages((previousMessages) => {
                                if (
                                    receivedMessage.messageId &&
                                    previousMessages.some(
                                        (msg) =>
                                            msg.messageId ===
                                            receivedMessage.messageId
                                    )
                                ) {
                                    return previousMessages;
                                }

                                return [
                                    ...previousMessages,
                                    receivedMessage
                                ];
                            });
                        }
                    );
                },

                onStompError: (frame) => {
                    console.error(
                        "STOMP Error:",
                        frame.headers["message"]
                    );

                    console.error("STOMP Details:", frame.body);

                    if (isMounted) {
                        setError(
                            frame.headers["message"] ||
                            "WebSocket connection failed."
                        );
                    }
                },

                onWebSocketError: (event) => {
                    console.error("WebSocket Error:", event);

                    if (isMounted) {
                        setError("Unable to connect to chat server.");
                    }
                },

                onWebSocketClose: () => {
                    if (isMounted) {
                        setConnected(false);
                    }
                }
            });

            stompClientRef.current = client;
            client.activate();
        };

        loadChatHistory();
        connectWebSocket();

        return () => {
            isMounted = false;

            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
        };
    }, [requestId, token]);

    const sendMessage = () => {
        const trimmedMessage = messageText.trim();

        if (!trimmedMessage) return;

        const client = stompClientRef.current;

        if (!client || !client.connected) {
            setError("Chat is not connected. Please wait.");
            return;
        }

        client.publish({
            destination: `/app/chat/${requestId}/send`,
            body: JSON.stringify({
                messageText: trimmedMessage
            })
        });

        setMessageText("");
        setError("");
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    const currentUserId = sessionStorage.getItem("userId");

    return (
        <div className="chat-layout">

            {/* Sidebar */}
            <Sidebar />

            {/* Chat Section */}
            <main className="chat-main">

                <div className="chat-page">

                    <div className="chat-container">

                        {/* Header */}
                        <div className="chat-header">

                            <button
                                className="back-button"
                                onClick={() => navigate("/requests")}
                            >
                                ←
                            </button>

                            <div className="chat-header-info">
                                <h2>Mentora Chat</h2>

                                <p>
                                    {connected ? (
                                        <span className="online-status">
                                            ● Connected
                                        </span>
                                    ) : (
                                        <span className="offline-status">
                                            ● Connecting...
                                        </span>
                                    )}
                                </p>
                            </div>

                        </div>

                        {/* Messages */}
                        <div className="chat-messages">

                            {loading ? (
                                <p className="chat-placeholder">
                                    Loading messages...
                                </p>
                            ) : messages.length === 0 ? (
                                <p className="chat-placeholder">
                                    No messages yet. Start your conversation!
                                </p>
                            ) : (
                                messages.map((message, index) => {
                                    const isMine =
                                        String(message.senderId) ===
                                        String(currentUserId);

                                    return (
                                        <div
                                            key={
                                                message.messageId ||
                                                `${message.sentAt}-${index}`
                                            }
                                            className={`message-row ${
                                                isMine
                                                    ? "my-message-row"
                                                    : "other-message-row"
                                            }`}
                                        >
                                            <div
                                                className={`message-bubble ${
                                                    isMine
                                                        ? "my-message"
                                                        : "other-message"
                                                }`}
                                            >
                                                {!isMine && (
                                                    <span className="message-sender">
                                                        {message.senderName}
                                                    </span>
                                                )}

                                                <p>{message.messageText}</p>

                                                <span className="message-time">
                                                    {message.sentAt
                                                        ? new Date(
                                                            message.sentAt
                                                        ).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })
                                                        : ""}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            <div ref={messagesEndRef} />

                        </div>

                        {/* Error */}
                        {error && (
                            <div className="chat-error">
                                {error}
                            </div>
                        )}

                        {/* Input */}
                        <div className="chat-input-area">

                            <textarea
                                placeholder="Type your message..."
                                value={messageText}
                                onChange={(event) =>
                                    setMessageText(event.target.value)
                                }
                                onKeyDown={handleKeyDown}
                                rows="1"
                            />

                            <button
                                onClick={sendMessage}
                                disabled={
                                    !connected || !messageText.trim()
                                }
                            >
                                Send
                            </button>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default Chat;
