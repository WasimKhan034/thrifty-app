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
      <header className="hero-shell">
        <div className="hero-top">
          <div className="brand-lockup">
            <div className="brand-badge">T</div>
            <div>
              <div className="brand-name">Thrifty</div>
              <div className="brand-sub">California vintage finder</div>
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
                <span className="user-name">{currentUser.name}</span>
                {currentUser.role === "admin" && (
                  <span className="user-role">admin</span>
                )}
                <button type="button" className="button button-ghost" style={{ padding: "5px 12px", fontSize: "0.78rem" }} onClick={onSignOut}>
                  Sign out
                </button>
              </div>
            ) : (
              <NavLink className="button button-primary" to="/auth" style={{ padding: "7px 16px", fontSize: "0.82rem" }}>
                Sign in
              </NavLink>
            )}
          </div>
        </div>

        <nav className="tab-row">
          <NavLink to="/" end className={({ isActive }) => `tab-chip ${isActive ? "active" : ""}`}>
            Explore
          </NavLink>
          <NavLink to="/contribute" className={({ isActive }) => `tab-chip ${isActive ? "active" : ""}`}>
            Add / Review
          </NavLink>
          <NavLink to="/saved" className={({ isActive }) => `tab-chip ${isActive ? "active" : ""}`}>
            Saved
          </NavLink>
          {currentUser?.role === "admin" && (
            <NavLink to="/admin" className={({ isActive }) => `tab-chip ${isActive ? "active" : ""}`}>
              Admin
            </NavLink>
          )}
        </nav>
      </header>
    </div>
  );
}
