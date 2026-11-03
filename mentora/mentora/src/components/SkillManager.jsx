import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/MySkills.css";

const API_URL = "http://localhost:8080";

const emptySkillForm = {
  skillId: "",
  skillLevel: "BEGINNER",
  yearsExperience: 0,
  description: "",
};

const emptyGoalForm = {
  skillId: "",
  preferredLevel: "BEGINNER",
  priority: 1,
};

function SkillManager({ mode = "skills" }) {
  const isLearningGoals = mode === "goals";
  const navigate = useNavigate();
  const endpoint = isLearningGoals ? "/learning-goals" : "/user-skills";

  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [items, setItems] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [form, setForm] = useState(
    isLearningGoals ? { ...emptyGoalForm } : { ...emptySkillForm }
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = sessionStorage.getItem("mentoraToken");

  const authHeaders = useCallback(
    (includeJson = false) => ({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(includeJson ? { "Content-Type": "application/json" } : {}),
    }),
    [token]
  );

  // Safely parse backend responses.
  const readResponse = async (response) => {
    const text = await response.text();

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${text || response.statusText}`
      );
    }

    if (!text.trim()) {
      return null;
    }

    try {
      const cleanText = text.replace(/^\uFEFF/, "").trim();
      return JSON.parse(cleanText);
    } catch (err) {
      console.error("Response could not be parsed as JSON:", text);
      console.error("Parsing error:", err);

      throw new Error(
        "Invalid JSON response from backend. Check the Network tab and backend logs."
      );
    }
  };

  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    return [];
  };

  const loadCategories = useCallback(async () => {
    const response = await fetch(`${API_URL}/categories/getAll`, {
      headers: authHeaders(),
    });

    const data = await readResponse(response);

    setCategories(
      Array.isArray(data) ? data : data?.categoryId ? [data] : []
    );
  }, [authHeaders]);

  const loadSkills = useCallback(
    async (categoryId = "") => {
      const url = categoryId
        ? `${API_URL}/skills?categoryId=${encodeURIComponent(categoryId)}`
        : `${API_URL}/skills`;

      const response = await fetch(url, {
        headers: authHeaders(),
      });

      const data = await readResponse(response);
      setSkills(normalizeList(data));
    },
    [authHeaders]
  );

  const loadItems = useCallback(async () => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: authHeaders(),
    });

    const data = await readResponse(response);
    setItems(normalizeList(data));
  }, [authHeaders, endpoint]);

  // Load categories and current mode data.
  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      setLoading(true);
      setError("");

      try {
        if (!token) {
          throw new Error(
            "Please log in again. Authentication token not found."
          );
        }

        const [categoryResponse, itemsResponse] = await Promise.all([
          fetch(`${API_URL}/categories/getAll`, {
            headers: authHeaders(),
          }),
          fetch(`${API_URL}${endpoint}`, {
            headers: authHeaders(),
          }),
        ]);

        const [categoryData, itemsData] = await Promise.all([
          readResponse(categoryResponse),
          readResponse(itemsResponse),
        ]);

        if (cancelled) return;

        setCategories(
          Array.isArray(categoryData)
            ? categoryData
            : categoryData?.categoryId
              ? [categoryData]
              : []
        );

        setItems(normalizeList(itemsData));
      } catch (err) {
        if (!cancelled) {
          console.error("Initial loading error:", err);
          setError(err.message || "Unable to load data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [token, authHeaders, endpoint]);

  // Load available skills when the category changes.
  useEffect(() => {
    let cancelled = false;

    async function fetchSkills() {
      try {
        const categoryParam = selectedCategory
          ? `?categoryId=${encodeURIComponent(selectedCategory)}`
          : "";

        const response = await fetch(
          `${API_URL}/skills${categoryParam}`,
          {
            headers: authHeaders(),
          }
        );

        const data = await readResponse(response);

        if (!cancelled) {
          setSkills(normalizeList(data));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Loading skills failed:", err);
          setSkills([]);
          setError(err.message || "Unable to load skills.");
        }
      }
    }

    fetchSkills();

    return () => {
      cancelled = true;
    };
  }, [selectedCategory, authHeaders]);

  // Reset form when switching modes.
  useEffect(() => {
    setForm(
      isLearningGoals ? { ...emptyGoalForm } : { ...emptySkillForm }
    );
    setSelectedCategory("");
    setError("");
    setSuccess("");
  }, [isLearningGoals]);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);

    setForm((previous) => ({
      ...previous,
      skillId: "",
    }));

    setError("");
    setSuccess("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.skillId) {
      setError("Please select a skill.");
      return;
    }

    if (
      isLearningGoals &&
      (!form.preferredLevel ||
        Number(form.priority) < 1 ||
        Number(form.priority) > 5)
    ) {
      setError("Select a learning level and priority from 1 to 5.");
      return;
    }

    setSaving(true);

    try {
      const payload = isLearningGoals
        ? {
            skillId: Number(form.skillId),
            preferredLevel: form.preferredLevel,
            priority: Number(form.priority),
          }
        : {
            skillId: Number(form.skillId),
            skillLevel: form.skillLevel,
            yearsExperience: Number(form.yearsExperience),
            description: form.description.trim(),
          };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(payload),
      });

      await readResponse(response);

      setForm(
        isLearningGoals ? { ...emptyGoalForm } : { ...emptySkillForm }
      );

      setSuccess(
        isLearningGoals
          ? "Learning goal added successfully!"
          : "Skill added successfully!"
      );

      await loadItems();
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "Unable to save.");
    } finally {
      setSaving(false);
    }
  };

  const getItemId = (item) =>
    isLearningGoals ? item.goalId : item.userSkillId;

  const handleDelete = async (id) => {
    if (id == null) {
      setError("Could not identify the item to delete.");
      return;
    }

    const confirmed = window.confirm(
      isLearningGoals
        ? "Are you sure you want to delete this learning goal?"
        : "Are you sure you want to remove this skill?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(id);

    try {
      const response = await fetch(`${API_URL}${endpoint}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      await readResponse(response);

      setSuccess(
        isLearningGoals
          ? "Learning goal deleted successfully!"
          : "Skill removed successfully!"
      );

      await loadItems();
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message || "Unable to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  const getSkillName = (item) =>
    item.skillName || item.skill?.skillName || "Unnamed skill";

  const getCategoryName = (item) =>
    item.categoryName ||
    item.skill?.category?.categoryName ||
    "Uncategorized";

  return (
    <div className="my-skills-layout">

      {/* Reusable Sidebar */}
      <Sidebar />

      <main className="my-skills-page">

        {loading ? (
          <div className="my-skills-loading">
            {isLearningGoals
              ? "Loading your learning goals..."
              : "Loading your skills..."}
          </div>
        ) : (
          <>
           

            <section className="my-skills-hero">
              <div>
                <span className="my-skills-eyebrow">
                  {isLearningGoals
                    ? "YOUR LEARNING JOURNEY"
                    : "YOUR LEARNING PROFILE"}
                </span>

                <h1>
                  {isLearningGoals ? "Learning Goals" : "My Skills"}
                </h1>

                <p>
                  {isLearningGoals
                    ? "Choose the skills you want to learn and set your priorities."
                    : "Showcase what you know and connect with people who want to learn from you."}
                </p>
              </div>

              <div className="my-skills-count">
                <span>{items.length}</span>
                <small>
                  {isLearningGoals ? "Goals added" : "Skills added"}
                </small>
              </div>
            </section>

            {error && (
              <div className="my-skills-alert error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="my-skills-alert success" role="status">
                {success}
              </div>
            )}

            {/* Add Skill / Learning Goal Form */}
            <section className="my-skills-panel">
              <div className="my-skills-section-heading">
                <div>
                  <h2>
                    {isLearningGoals
                      ? "Add a learning goal"
                      : "Add a skill"}
                  </h2>
                  <p>Select a category to filter the available skills.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="my-skills-form">
                <div className="my-skills-field">
                  <label htmlFor="skillCategory">Category</label>

                  <select
                    id="skillCategory"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                  >
                    <option value="">All categories</option>

                    {categories.map((category) => (
                      <option
                        key={category.categoryId}
                        value={category.categoryId}
                      >
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="my-skills-field">
                  <label htmlFor="skillId">Skill</label>

                  <select
                    id="skillId"
                    name="skillId"
                    value={form.skillId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select a skill</option>

                    {skills.map((skill) => (
                      <option
                        key={skill.skillId}
                        value={skill.skillId}
                      >
                        {skill.skillName}
                      </option>
                    ))}
                  </select>

                  {skills.length === 0 && (
                    <small>No skills found for this category.</small>
                  )}
                </div>

                {isLearningGoals ? (
                  <>
                    <div className="my-skills-field">
                      <label htmlFor="preferredLevel">
                        Preferred learning level
                      </label>

                      <select
                        id="preferredLevel"
                        name="preferredLevel"
                        value={form.preferredLevel}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                        <option value="EXPERT">Expert</option>
                      </select>
                    </div>

                    <div className="my-skills-field">
                      <label htmlFor="priority">Priority</label>

                      <select
                        id="priority"
                        name="priority"
                        value={form.priority}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="1">1 - Lowest</option>
                        <option value="2">2 - Low</option>
                        <option value="3">3 - Medium</option>
                        <option value="4">4 - High</option>
                        <option value="5">5 - Highest</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="my-skills-field">
                      <label htmlFor="skillLevel">Skill level</label>

                      <select
                        id="skillLevel"
                        name="skillLevel"
                        value={form.skillLevel}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                        <option value="EXPERT">Expert</option>
                      </select>
                    </div>

                    <div className="my-skills-field">
                      <label htmlFor="yearsExperience">
                        Years of experience
                      </label>

                      <input
                        id="yearsExperience"
                        name="yearsExperience"
                        type="number"
                        min="0"
                        value={form.yearsExperience}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="my-skills-field full-width">
                      <label htmlFor="description">
                        Description (optional)
                      </label>

                      <textarea
                        id="description"
                        name="description"
                        rows="3"
                        maxLength="1000"
                        placeholder="Describe your experience or what you can teach..."
                        value={form.description}
                        onChange={handleFormChange}
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="my-skills-submit"
                  disabled={saving || skills.length === 0}
                >
                  {saving
                    ? "Saving..."
                    : isLearningGoals
                      ? "+ Add learning goal"
                      : "+ Add skill"}
                </button>
              </form>
            </section>

            {/* Existing Skills / Learning Goals */}
            <section className="my-skills-panel">
              <div className="my-skills-section-heading">
                <div>
                  <h2>
                    {isLearningGoals
                      ? "Your learning goals"
                      : "Your skills"}
                  </h2>

                  <p>
                    {isLearningGoals
                      ? "Skills you want to learn and their priorities."
                      : "Skills currently listed on your profile."}
                  </p>
                </div>

                <span className="my-skills-total">
                  {items.length} total
                </span>
              </div>

              {items.length === 0 ? (
                <div className="my-skills-empty">
                  <h3>
                    {isLearningGoals
                      ? "No learning goals added yet"
                      : "No skills added yet"}
                  </h3>

                  <p>
                    {isLearningGoals
                      ? "Add your first learning goal above to get started."
                      : "Add your first skill above to get started."}
                  </p>
                </div>
              ) : (
                <div className="my-skills-grid">
                  {items.map((item) => {
                    const id = getItemId(item);

                    return (
                      <article className="my-skill-card" key={id}>
                        <div className="my-skill-card-top">
                          <span className="my-skill-icon">✦</span>

                          <button
                            type="button"
                            className="my-skill-delete"
                            title={
                              isLearningGoals
                                ? "Delete goal"
                                : "Remove skill"
                            }
                            aria-label={`Delete ${getSkillName(item)}`}
                            disabled={deletingId === id}
                            onClick={() => handleDelete(id)}
                          >
                            {deletingId === id ? "…" : "×"}
                          </button>
                        </div>

                        <h3>{getSkillName(item)}</h3>

                        <span className="my-skill-category">
                          {getCategoryName(item)}
                        </span>

                        {isLearningGoals ? (
                          <div className="my-skill-meta">
                            <span>
                              Level: {item.preferredLevel || "BEGINNER"}
                            </span>

                            <span>
                              Priority: {item.priority ?? 1}/5
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="my-skill-meta">
                              <span>
                                {String(
                                  item.skillLevel || "BEGINNER"
                                ).replace("_", " ")}
                              </span>

                              <span>
                                {item.yearsExperience ?? 0}{" "}
                                {(item.yearsExperience ?? 0) === 1
                                  ? "year"
                                  : "years"}
                              </span>
                            </div>

                            {item.description && (
                              <p className="my-skill-description">
                                {item.description}
                              </p>
                            )}
                          </>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default SkillManager;
