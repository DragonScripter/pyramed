import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { supabase } from "../supabaseClient";

async function readError(res) {
  const body = await res.json().catch(() => null);
  return body?.message ?? `Request failed (${res.status})`;
}

// email comes from the Supabase session.
async function toUser(profile) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    id: profile.id,
    name: profile.fullName ?? "",
    email: session?.user?.email ?? "",
    role: profile.role ?? "",
    avatarUrl: profile.avatarUrl ?? "",
  };
}

const getMe = async () => {
  const res = await apiFetch("/api/users/me");
  if (res.status === 401) throw new Error("Please sign in to view your profile.");
  if (!res.ok) throw new Error(await readError(res));
  return toUser(await res.json());
};

const updateMe = async ({ name, password }) => {
  const res = await apiFetch("/api/users/me", {
    method: "PUT",
    body: JSON.stringify({ fullName: name }),
  });
  if (res.status === 401) throw new Error("Your session has expired. Please sign in again.");
  if (!res.ok) throw new Error(await readError(res));
  const updated = await res.json();

  // Passwords are managed by Supabase Auth, not the backend.
  if (password) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
  }

  return toUser(updated);
};

// --- Validation ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateProfile({ name, email, password }) {
  const errors = {};
  if (!name.trim()) errors.name = "Name is required";
  if (!email.trim()) errors.email = "Email is required";
  else if (!EMAIL_REGEX.test(email)) errors.email = "Invalid email format";
  if (password && password.length < 8)
    errors.password = "Password must be at least 8 characters";
  return errors;
}

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    getMe()
      .then((data) => {
        setUser(data);
        setForm({ name: data.name, email: data.email, password: "" });
      })
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function handleCancel() {
    setForm({ name: user.name, email: user.email, password: "" });
    setErrors({});
    setEditing(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);

    const validationErrors = validateProfile(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    try {
      const updated = await updateMe(form);
      setUser(updated);
      setForm({ name: updated.name, email: updated.email, password: "" });
      setEditing(false);
      setFeedback({ type: "success", message: "Profile updated successfully." });
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Something went wrong." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading profile...</p>;
  if (loadError) return <p role="alert">Error: {loadError}</p>;

  return (
    <div className="user-profile">
      <h1>My Profile</h1>

      {feedback && (
        <div role="alert" className={`banner banner-${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <div className="avatar">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={`${user.name}'s avatar`} width={96} height={96} />
        ) : (
          <div aria-hidden="true">{user.name.charAt(0).toUpperCase()}</div>
        )}
      </div>

      {!editing ? (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <button onClick={() => { setFeedback(null); setEditing(true); }}>Edit</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} />
          </label>
          {errors.name && <span className="field-error">{errors.name}</span>}

          <label>
            Email (managed by your account)
            <input name="email" type="email" value={form.email} disabled />
          </label>
          {errors.email && <span className="field-error">{errors.email}</span>}

          <label>
            New password (optional)
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </label>
          {errors.password && <span className="field-error">{errors.password}</span>}

          <p><strong>Role:</strong> {user.role} (read-only)</p>

          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          <button type="button" onClick={handleCancel} disabled={saving}>Cancel</button>
        </form>
      )}
    </div>
  );
}