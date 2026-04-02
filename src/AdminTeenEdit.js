import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const ALL_TAGS = [
  "babysitting",
  "dog walking/pet sitting",
  "tutoring",
  "private_lessons",
  "yardwork_housework",
  "car_cleaning",
  "power_washing",
  "all",
];

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  school: "",
  interests: "",
  notes: "",
  textMessagingStatus: "",
  interest_tags: [],
};

export default function AdminTeenEdit() {
  const { teenId } = useParams();
  const navigate = useNavigate();
  const isNew = teenId === "new";

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isNew) {
      setForm(EMPTY_FORM);
      setLoading(false);
      return;
    }

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
          notes: data.notes || "",
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
  }, [teenId, isNew]);

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

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        school: form.school,
        interests: form.interests,
        notes: form.notes,
        textMessagingStatus: form.textMessagingStatus,
        interest_tags: Array.isArray(form.interest_tags)
          ? form.interest_tags
          : [],
      };

      if (isNew) {
        const docRef = await addDoc(collection(db, "teens"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        navigate(`/admin/teens/${docRef.id}`);
        return;
      }

      const teenRef = doc(db, "teens", teenId);
      await updateDoc(teenRef, payload);
      setSuccess("Saved successfully");
    } catch (err) {
      console.error(err);
      setError(isNew ? "Failed to create teen" : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (isNew) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this teen?",
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await deleteDoc(doc(db, "teens", teenId));
      navigate("/admin/teens");
    } catch (err) {
      console.error(err);
      setError("Failed to delete teen");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <div>Loading teen...</div>;

  return (
    <div style={{ padding: "24px", maxWidth: "700px" }}>
      <Link to="/admin/teens">← Back</Link>

      <h2>{isNew ? "Create Teen" : "Edit Teen"}</h2>

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

        <Field label="Notes">
          <textarea
            name="notes"
            value={form.notes}
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

        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button type="submit" disabled={saving || deleting}>
            {saving
              ? isNew
                ? "Creating..."
                : "Saving..."
              : isNew
                ? "Create"
                : "Save"}
          </button>

          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving || deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
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
