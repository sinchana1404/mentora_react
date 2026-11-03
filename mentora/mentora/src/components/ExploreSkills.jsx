
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/ExploreSkills.css";

const API_URL = "http://localhost:8080";

function ExploreSkills() {
    const [people, setPeople] = useState([]);
    const [filteredPeople, setFilteredPeople] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(true);
    const [sendingId, setSendingId] = useState(null);

    const [successMessage, setSuccessMessage] = useState("");
    const [requestError, setRequestError] = useState("");

    useEffect(() => {
        fetchRecommendations();
    }, []);

    // Fetch recommendations
    const fetchRecommendations = async () => {
        const token = sessionStorage.getItem("mentoraToken");

        if (!token) {
            setRequestError("Please log in again.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/explore-skills/recommendations`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Unable to load recommendations.");
            }

            const data = await response.json();

            setPeople(data);
            setFilteredPeople(data);

        } catch (error) {
            console.error(error);
            setRequestError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Search functionality
    const handleSearch = (value) => {
        setSearchTerm(value);

        const filtered = people.filter((person) =>
            (person.email || "").toLowerCase().includes(value.toLowerCase()) ||
            (person.yourSkillName || "").toLowerCase().includes(value.toLowerCase()) ||
            (person.theirSkillName || "").toLowerCase().includes(value.toLowerCase())
        );

        setFilteredPeople(filtered);
    };

    // Send exchange request
    const handleSendRequest = async (person) => {
        const token = sessionStorage.getItem("mentoraToken");

        if (!token) {
            setRequestError("Please log in again.");
            return;
        }

        setSendingId(person.userId);
        setSuccessMessage("");
        setRequestError("");

        try {
            const requestData = {
                receiverId: person.userId,
                senderSkillId: person.yourSkillId,
                receiverSkillId: person.theirSkillId,
                message: "Let's exchange skills!"
            };

            const response = await fetch(
                `${API_URL}/exchange-requests/send`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(requestData)
                }
            );

            const responseText = await response.text();

            let responseData = {};

            try {
                responseData = responseText
                    ? JSON.parse(responseText)
                    : {};
            } catch {
                responseData = { message: responseText };
            }

            if (!response.ok) {
                const messages = {
                    400: "You cannot send a request to yourself.",
                    401: "Your session has expired. Please log in again.",
                    403: "You are not authorized to perform this action.",
                    404: "User or skill not found.",
                    409: "You have already sent a pending request for this exchange."
                };

                throw new Error(
                    responseData.message ||
                    messages[response.status] ||
                    "Unable to send exchange request."
                );
            }

            setSuccessMessage(
                `Request successfully sent to ${person.email}!`
            );

        } catch (error) {
            console.error("Send Request Error:", error);
            setRequestError(error.message);
        } finally {
            setSendingId(null);
        }
    };

    return (
        <div className="mentora-layout">

            {/* REUSABLE SIDEBAR */}
            <Sidebar />

            {/* MAIN CONTENT */}
            <main className="explore-main">

                {/* TOP BAR */}
                <header className="explore-topbar">
                    <div>
                        {/* <p className="breadcrumb">Workspace / Explore Skills</p> */}
                        <h2>Explore Skills</h2>
                    </div>
                </header>

                {/* HERO SECTION */}
                <section className="explore-hero">
                    <div className="hero-content">
                        <span className="hero-tag">
                            ✨ YOUR LEARNING COMMUNITY
                        </span>

                        <h1>
                            Find your next
                            <br />
                            <span>learning partner.</span>
                        </h1>

                        <p>
                            Connect with people who have the skills you want
                            and want the skills you have. Learn together,
                            exchange knowledge and grow.
                        </p>

                        <div className="hero-stats">
                            <div>
                                <strong>{people.length}</strong>
                                <span>Skill matches</span>
                            </div>

                            <div className="hero-stat-divider"></div>

                            <div>
                                <strong>∞</strong>
                                <span>Learning possibilities</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-decoration">
                        <div className="hero-circle circle-one"></div>
                        <div className="hero-circle circle-two"></div>
                        <div className="hero-center-icon">⇄</div>
                        <span className="floating-star star-one">✦</span>
                        <span className="floating-star star-two">✧</span>
                    </div>
                </section>

                {/* SEARCH SECTION */}
                <section className="explore-search-section">
                    <div>
                        <h2>Discover your match</h2>
                        <p>Find someone to exchange knowledge with.</p>
                    </div>

                    <div className="explore-search-box">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search people or skills..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />

                        {searchTerm && (
                            <button onClick={() => handleSearch("")}>
                                ✕
                            </button>
                        )}
                    </div>
                </section>

                {/* NOTIFICATIONS */}
                {successMessage && (
                    <div className="explore-alert success-alert">
                        <span>✓</span>
                        <p>{successMessage}</p>
                        <button onClick={() => setSuccessMessage("")}>
                            ×
                        </button>
                    </div>
                )}

                {requestError && (
                    <div className="explore-alert error-alert">
                        <span>!</span>
                        <p>{requestError}</p>
                        <button onClick={() => setRequestError("")}>
                            ×
                        </button>
                    </div>
                )}

                {/* MATCH HEADING */}
                <section className="matches-section">

                    <div className="matches-heading">
                        <div>
                            <h2>People you can learn with</h2>
                            <p>
                                These learners have skills that complement yours.
                            </p>
                        </div>

                        <span className="match-count">
                            {filteredPeople.length} MATCHES
                        </span>
                    </div>

                    {/* LOADING */}
                    {loading && (
                        <div className="explore-empty">
                            <div className="loader"></div>
                            <p>Finding your learning partners...</p>
                        </div>
                    )}

                    {/* MATCH CARDS */}
                    {!loading && filteredPeople.length > 0 && (
                        <div className="match-grid">

                            {filteredPeople.map((person) => (
                                <div
                                    className="match-card"
                                    key={`${person.userId}-${person.yourSkillId}-${person.theirSkillId}`}
                                >

                                    <div className="match-card-top">
                                        <div className="match-user">
                                            <div className="match-avatar">
                                                {(person.email || "U")
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div className="match-user-info">
                                                <h3>{person.email}</h3>

                                                <span>
                                                    <i></i> Mutual skill match
                                                </span>
                                            </div>
                                        </div>

                                        <div className="match-symbol">
                                            ✦
                                        </div>
                                    </div>

                                    <div className="match-divider"></div>

                                    <p className="exchange-label">
                                        YOUR SKILL EXCHANGE
                                    </p>

                                    <div className="match-skill">
                                        <div className="skill-icon offer-icon">
                                            ↗
                                        </div>

                                        <div className="match-skill-info">
                                            <span>YOU CAN TEACH</span>
                                            <h4>{person.yourSkillName}</h4>
                                        </div>

                                        <span className="skill-badge offer-badge">
                                            Offer
                                        </span>
                                    </div>

                                    <div className="exchange-connector">
                                        <span>⇅</span>
                                    </div>

                                    <div className="match-skill">
                                        <div className="skill-icon learn-icon">
                                            ↙
                                        </div>

                                        <div className="match-skill-info">
                                            <span>YOU CAN LEARN</span>
                                            <h4>{person.theirSkillName}</h4>
                                        </div>

                                        <span className="skill-badge learn-badge">
                                            Learn
                                        </span>
                                    </div>

                                    <button
                                        className="match-request-btn"
                                        onClick={() => handleSendRequest(person)}
                                        disabled={sendingId !== null}
                                    >
                                        {sendingId === person.userId
                                            ? "Sending request..."
                                            : "Send Exchange Request"}

                                        <span>→</span>
                                    </button>

                                </div>
                            ))}

                        </div>
                    )}

                    {/* EMPTY STATE */}
                    {!loading && filteredPeople.length === 0 && (
                        <div className="explore-empty">
                            <div className="empty-icon">⌕</div>

                            <h3>
                                {searchTerm
                                    ? "No matching results"
                                    : "No skill matches yet"}
                            </h3>

                            <p>
                                {searchTerm
                                    ? "Try searching with another name or skill."
                                    : "Add more skills and learning goals to discover new exchange partners."}
                            </p>
                        </div>
                    )}

                </section>

                <footer className="explore-footer">
                    Made for curious minds. <span>💜</span> Mentora
                </footer>

            </main>
        </div>
    );
}

export default ExploreSkills;
