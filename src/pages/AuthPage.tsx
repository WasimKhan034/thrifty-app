import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { UserProfile } from "../types/domain";

interface AuthPageProps {
  currentUser: UserProfile | null;
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
  onSignIn: (email: string, password: string) => Promise<void>;
}

export function AuthPage({ currentUser, onSignUp, onSignIn }: AuthPageProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await onSignUp(name, email, password);
      } else {
        await onSignIn(email, password);
      }
      // Navigate home after successful auth
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  if (currentUser) {
    return (
      <div className="page-content">
        <div className="auth-wrap">
          <div className="auth-form surface">
            <div className="auth-header">
              <div style={{ fontSize: "2rem" }}>✓</div>
              <h3>Signed in as {currentUser.name}</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                {currentUser.email}
                {currentUser.role === "admin" && (
                  <span className="role-badge" style={{ marginLeft: 8 }}>admin</span>
                )}
              </p>
              <button
                type="button"
                className="button button-primary"
                style={{ marginTop: 8 }}
                onClick={() => navigate("/")}
              >
                Go to Explore →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="auth-wrap">
        <div className="auth-form surface">
          <div className="auth-header">
            <h3>{mode === "signin" ? "Welcome back" : "Create an account"}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
              {mode === "signin"
                ? "Sign in to save favorites and leave reviews."
                : "Join to save spots, track visits, and contribute."}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className={`button ${mode === "signin" ? "button-primary" : "button-secondary"}`}
              style={{ flex: 1 }}
              onClick={() => { setMode("signin"); setError(""); }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`button ${mode === "signup" ? "button-primary" : "button-secondary"}`}
              style={{ flex: 1 }}
              onClick={() => { setMode("signup"); setError(""); }}
            >
              Create account
            </button>
          </div>

          {error && (
            <div style={{
              background: "color-mix(in srgb, #ef4444 12%, var(--surface))",
              border: "1px solid color-mix(in srgb, #ef4444 30%, var(--border))",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: "0.85rem",
              color: "#dc2626",
            }}>
              {error}
            </div>
          )}

          <form className="auth-fields" onSubmit={submit}>
            {mode === "signup" && (
              <div className="form-field">
                <label>Name</label>
                <input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}
            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="button button-primary"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Please wait…" : mode === "signup" ? "Create account →" : "Sign in →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
