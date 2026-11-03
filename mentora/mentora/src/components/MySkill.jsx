
import { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/MySkills.css";

const API_URL = "http://localhost:8080";

const emptyForm = {
  skillId: "",
  skillLevel: "BEGINNER",
  yearsExperience: 0,
  description: "",
};

function MySkill() {
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = sessionStorage.getItem("mentoraToken");

  const authHeaders = useCallback(
    (includeJson = false) => ({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(includeJson
        ? { "Content-Type": "application/json" }
        : {}),
    }),
    [token]
  );

  // Read backend responses safely.
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
      return JSON.parse(text);
    } catch {
      throw new Error(
        `Backend returned non-JSON data: ${text.substring(0, 200)}`
      );
    }
  };

  // Load categories.
  const loadCategories = useCallback(async () => {
    const response = await fetch(`${API_URL}/categories/getAll`, {
      headers: authHeaders(),
    });

    const data = await readResponse(response);

    const categoryList = Array.isArray(data)
      ? data
      : data && data.categoryId
      ? [data]
      : [];

    setCategories(categoryList);
  }, [authHeaders]);

  // Load available skills.
  const loadSkills = useCallback(
    async (categoryId = "") => {
      const url = categoryId
        ? `${API_URL}/skills?categoryId=${encodeURIComponent(categoryId)}`
        : `${API_URL}/skills`;

      const response = await fetch(url, {
        headers: authHeaders(),
      });

      const data = await readResponse(response);

      const skillList = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
        ? data.content
        : [];

      setSkills(skillList);
    },
    [authHeaders]
  );

  // Load logged-in user's skills.
  const loadMySkills = useCallback(async () => {
    const response = await fetch(`${API_URL}/user-skills`, {
      headers: authHeaders(),
    });

    const data = await readResponse(response);

    setMySkills(Array.isArray(data) ? data : []);
  }, [authHeaders]);

  // Initial data loading.
  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      setLoading(true);
      setError("");

      try {
        if (!token) {
          throw new Error(
            "Please log in again. Authentication token not found."
          );
        }

        const [categoryResponse, userSkillsResponse] = await Promise.all([
          fetch(`${API_URL}/categories/getAll`, {
            headers: authHeaders(),
          }),
          fetch(`${API_URL}/user-skills`, {
            headers: authHeaders(),
          }),
        ]);

        const [categoryData, userSkillsData] = await Promise.all([
          readResponse(categoryResponse),
          readResponse(userSkillsResponse),
        ]);

        if (cancelled) return;

        const categoryList = Array.isArray(categoryData)
          ? categoryData
          : categoryData?.categoryId
          ? [categoryData]
          : [];

        setCategories(categoryList);
        setMySkills(
          Array.isArray(userSkillsData) ? userSkillsData : []
        );
      } catch (err) {
        if (!cancelled) {
          console.error("My Skills loading error:", err);
          setError(err.message || "Unable to load your skills.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [token, authHeaders]);

  // Reload skills when category changes.
  useEffect(() => {
    let cancelled = false;

    const fetchSkills = async () => {
      try {
        setError("");
        await loadSkills(selectedCategory);
      } catch (err) {
        if (!cancelled) {
          console.error("Loading skills failed:", err);
          setSkills([]);
          setError(err.message || "Unable to load skills.");
        }
      }
    };

    fetchSkills();

    return () => {
      cancelled = true;
    };
  }, [selectedCategory, loadSkills]);

  // Category selection.
  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;

    setSelectedCategory(categoryId);

    setForm((previous) => ({
      ...previous,
      skillId: "",
    }));

    setError("");
    setSuccess("");
  };

  // Form changes.
  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Add skill.
  const handleAddSkill = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.skillId) {
      setError("Please select a skill.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/user-skills`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({
          skillId: Number(form.skillId),
          skillLevel: form.skillLevel,
          yearsExperience: Number(form.yearsExperience),
          description: form.description.trim(),
        }),
      });

      await readResponse(response);

      setForm({ ...emptyForm });

      setSuccess("Skill added successfully!");

      await loadMySkills();
    } catch (err) {
      console.error("Add skill error:", err);
      setError(err.message || "Unable to add skill.");
    } finally {
      setSaving(false);
    }
  };

  // Delete skill.
  const handleDeleteSkill = async (userSkillId) => {
    if (!userSkillId) {
      setError("Could not identify the skill to delete.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove this skill?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(userSkillId);

    try {
      const response = await fetch(
        `${API_URL}/user-skills/${userSkillId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      await readResponse(response);

      setSuccess("Skill removed successfully!");

      await loadMySkills();
    } catch (err) {
      console.error("Delete skill error:", err);
      setError(err.message || "Unable to remove skill.");
    } finally {
      setDeletingId(null);
    }
  };

  // Support different backend response structures.
  const getSkillName = (item) =>
    item.skillName || item.skill?.skillName || "Unnamed skill";

  const getCategoryName = (item) =>
    item.categoryName ||
    item.skill?.category?.categoryName ||
    "Uncategorized";

  return (
    <div className="my-skills-layout">

      {/* REUSABLE SIDEBAR */}
      <Sidebar/>

      {/* MAIN CONTENT */}
      <main className="my-skills-page">

        {loading ? (
          <div className="my-skills-loading">
            Loading your skills...
          </div>
        ) : (
          <>
            {/* HERO SECTION */}
            <section className="my-skills-hero">
              <div>
                <span className="my-skills-eyebrow">
                  YOUR LEARNING PROFILE
                </span>

                <h1>My Skills</h1>

                <p>
                  Showcase what you know and connect with people
                  who want to learn from you.
                </p>
              </div>

              <div className="my-skills-count">
                <span>{mySkills.length}</span>
                <small>Skills added</small>
              </div>
            </section>

            {/* ALERTS */}
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

            {/* ADD SKILL */}
            <section className="my-skills-panel">
              <div className="my-skills-section-heading">
                <div>
                  <h2>Add a skill</h2>
                  <p>
                    Select a category to filter the available skills.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleAddSkill}
                className="my-skills-form"
              >
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
                    <small>
                      No skills found for this category.
                    </small>
                  )}
                </div>

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

                <button
                  type="submit"
                  className="my-skills-submit"
                  disabled={saving || skills.length === 0}
                >
                  {saving ? "Adding skill..." : "+ Add skill"}
                </button>
              </form>
            </section>

            {/* MY SKILLS */}
            <section className="my-skills-panel">
              <div className="my-skills-section-heading">
                <div>
                  <h2>Your skills</h2>
                  <p>Skills currently listed on your profile.</p>
                </div>

                <span className="my-skills-total">
                  {mySkills.length} total
                </span>
              </div>

              {mySkills.length === 0 ? (
                <div className="my-skills-empty">
                  <h3>No skills added yet</h3>
                  <p>Add your first skill above to get started.</p>
                </div>
              ) : (
                <div className="my-skills-grid">
                  {mySkills.map((item) => (
                    <article
                      className="my-skill-card"
                      key={item.userSkillId}
                    >
                      <div className="my-skill-card-top">
                        <span className="my-skill-icon">✦</span>

                        <button
                          type="button"
                          className="my-skill-delete"
                          title="Remove skill"
                          aria-label={`Remove ${getSkillName(item)}`}
                          disabled={deletingId === item.userSkillId}
                          onClick={() =>
                            handleDeleteSkill(item.userSkillId)
                          }
                        >
                          {deletingId === item.userSkillId ? "…" : "×"}
                        </button>
                      </div>

                      <h3>{getSkillName(item)}</h3>

                      <span className="my-skill-category">
                        {getCategoryName(item)}
                      </span>

                      <div className="my-skill-meta">
                        <span>
                          {String(item.skillLevel || "BEGINNER").replace(
                            "_",
                            " "
                          )}
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
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default MySkill;
