import type { Spot, UserProfile } from "../types/domain";

interface AdminPageProps {
  currentUser: UserProfile | null;
  pendingSpots: Spot[];
  onApprove: (spotId: string) => Promise<void>;
  onReject: (spotId: string) => Promise<void>;
}

export function AdminPage({ currentUser, pendingSpots, onApprove, onReject }: AdminPageProps) {
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="page-content">
        <div className="empty-state surface" style={{ maxWidth: 400, margin: "32px auto" }}>
          <div className="empty-state-icon">🔒</div>
          <p>Admin access required. Sign in with an admin account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3>Pending submissions</h3>
        <span className="section-count">{pendingSpots.length} waiting</span>
      </div>

      {pendingSpots.length === 0 ? (
        <div className="empty-state surface">
          <div className="empty-state-icon">✓</div>
          <p>All clear — no pending submissions.</p>
        </div>
      ) : (
        <div className="admin-list">
          {pendingSpots.map((spot) => (
            <article key={spot.id} className="admin-card surface">
              <div className="admin-card-head">
                <div>
                  <div style={{ fontWeight: 600 }}>{spot.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
                    {spot.city} · {spot.type} · {spot.address}
                  </div>
                </div>
                <div className="admin-card-actions">
                  <button type="button" className="button button-primary" style={{ fontSize: "0.8rem", padding: "6px 14px" }} onClick={() => void onApprove(spot.id)}>
                    Approve
                  </button>
                  <button type="button" className="button button-danger" style={{ fontSize: "0.8rem", padding: "6px 14px" }} onClick={() => void onReject(spot.id)}>
                    Reject
                  </button>
                </div>
              </div>
              {spot.description && (
                <div className="admin-card-body">{spot.description}</div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
