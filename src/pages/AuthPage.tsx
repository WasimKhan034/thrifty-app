import { useState, type FormEvent } from "react";
import type { UserProfile } from "../types/domain";

interface AuthPageProps {
  currentUser: UserProfile | null;
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
  onSignIn: (email: string, password: string) => Promise<void>;
}

export function AuthPage({ currentUser, onSignUp, onSignIn }: AuthPageProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "signup") {
      await onSignUp(name, email, password);
    } else {
      await onSignIn(email, password);
    }
    setPassword("");
  };

  return (
    <section className="panel surface auth-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Auth</p>
          <h3>{currentUser ? "You are signed in" : "Create an account or sign in"}</h3>
        </div>
      </div>

      <p className="panel-copy">
        Sign in to save favorites, track visits, leave reviews, and submit new spots.
        Admins can approve pending submissions.
      </p>

      <div className="toggle-row">
        <button type="button" className={`toggle-pill ${mode === "signin" ? "active" : ""}`} onClick={() => setMode("signin")}>
          Sign in
        </button>
        <button type="button" className={`toggle-pill ${mode === "signup" ? "active" : ""}`} onClick={() => setMode("signup")}>
          Create account
        </button>
      </div>

      <form className="form-panel-inner" onSubmit={submit}>
        {mode === "signup" ? (
          <label>
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
        ) : null}
        <label>
          <span>Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          <span>Password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button type="submit" className="button button-primary">
          {mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>
    </section>
  );
}
