import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

const ALL_TAGS = [
  "babysitting",
  "pets",
  "tutoring",
  "sports",
  "music",
  "arts",
  "yard_work",
  "housework",
  "car_cleaning",
  "power_washing",
];

export default function AdminTeenEdit() {
  const { teenId } = useParams();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    school: "",
    interests: "",
    textMessagingStatus: "",
    interest_tags: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchTeen() {
      try {
        const teenRef = doc(db, "teens", teenId);
        const snapshot = await getDoc(teenRef);

        if (!snapshot.exists()) {
          setError("Teen not found");
          return;
        }

        const data = snapshot.data();

        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          school: data.school || "",
          interests: data.interests || "",
          textMessagingStatus: data.textMessagingStatus || "",
          interest_tags: Array.isArray(data.interest_tags)
            ? data.interest_tags
            : [],
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load teen");
      } finally {
        setLoading(false);
      }
    }

    fetchTeen();
  }, [teenId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function toggleTag(tag) {
    setForm((prev) => {
      const exists = prev.interest_tags.includes(tag);

      return {
        ...prev,
        interest_tags: exists
          ? prev.interest_tags.filter((t) => t !== tag)
          : [...prev.interest_tags, tag],
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const teenRef = doc(db, "teens", teenId);

      await updateDoc(teenRef, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        school: form.school,
        interests: form.interests,
        textMessagingStatus: form.textMessagingStatus,
        interest_tags: form.interest_tags,
      });

      setSuccess("Saved successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Loading teen...</div>;

  return (
    <div style={{ padding: "24px", maxWidth: "700px" }}>
      <Link to="/admin/teens">← Back</Link>

      <h2>Edit Teen</h2>

      <form onSubmit={handleSubmit}>
        <Field label="Name">
          <input
            style={{ width: 300 }}
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </Field>

        <Field label="Email">
          <input
            style={{ width: 300 }}
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </Field>

        <Field label="Phone">
          <input
            style={{ width: 300 }}
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </Field>

        <Field label="School">
          <input
            style={{ width: 300 }}
            name="school"
            value={form.school}
            onChange={handleChange}
          />
        </Field>

        <Field label="Interests (raw text)">
          <textarea
            name="interests"
            value={form.interests}
            onChange={handleChange}
            rows={4}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </Field>
        <Field label="Text Messaging Status">
          <select
            name="textMessagingStatus"
            value={form.textMessagingStatus}
            onChange={handleChange}
          >
            <option value="allowed">allowed</option>
            <option value="rejected">rejected</option>
            <option value="">none</option>
          </select>
        </Field>

        {/* ✅ Checkbox UI */}
        <Field label="Approved Interests">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {ALL_TAGS.map((tag) => (
              <label key={tag} style={checkboxStyle}>
                <input
                  type="checkbox"
                  checked={form.interest_tags.includes(tag)}
                  onChange={() => toggleTag(tag)}
                />
                {tag}
              </label>
            ))}
          </div>
        </Field>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ marginBottom: "6px", fontWeight: "600" }}>{label}</div>
      {children}
    </div>
  );
}

const checkboxStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
};
