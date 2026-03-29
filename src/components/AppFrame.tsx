import { NavLink } from "react-router-dom";
import { themes } from "../data/demoData";
import type { ThemeId, UserProfile } from "../types/domain";

interface AppFrameProps {
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  currentUser: UserProfile | null;
  onSignOut: () => void;
}

export function AppFrame({ theme, onThemeChange, currentUser, onSignOut }: AppFrameProps) {
  return (
    <div className="app-shell">
      <header className="hero-shell surface">
        <div className="hero-top">
          <div className="brand-lockup">
            <div className="brand-badge">T</div>
            <div>
              <p className="eyebrow">Vintage thrift finder</p>
              <h1>Thrifty</h1>
            </div>
          </div>

          <div className="hero-actions">
            <div className="theme-picker">
              {themes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`theme-dot ${theme === item.id ? "active" : ""}`}
                  aria-label={item.name}
                  title={item.name}
                  onClick={() => onThemeChange(item.id)}
                />
              ))}
            </div>

            {currentUser ? (
              <div className="auth-pill">
                <span>{currentUser.name}</span>
                <span>{currentUser.role}</span>
                <button type="button" className="button button-ghost" onClick={onSignOut}>
                  Sign out
                </button>
              </div>
            ) : (
              <NavLink className="button button-primary" to="/auth">
                Sign in
              </NavLink>
            )}
          </div>
        </div>

        <div className="hero-copy">
          <div>
            <p className="eyebrow">Built for serious thrifters</p>
            <h2>Find vintage treasure, then build your own trail.</h2>
          </div>
          <p>
            Thrifty is being structured for Supabase and Vercel, with a cleaner product shape for
            discovery, submissions, reviews, favorites, and admin approval.
          </p>
        </div>

        <nav className="tab-row">
          <NavLink to="/" end className={({ isActive }) => `tab-chip ${isActive ? "active" : ""}`}>
            Explore
          </NavLink>
          <NavLink to="/contribute" className={({ isActive }) => `tab-chip ${isActive ? "active" : ""}`}>
            Contribute
          </NavLink>
          <NavLink to="/saved" className={({ isActive }) => `tab-chip ${isActive ? "active" : ""}`}>
            Saved
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => `tab-chip ${isActive ? "active" : ""}`}>
            Admin
          </NavLink>
        </nav>
      </header>
    </div>
  );
}
