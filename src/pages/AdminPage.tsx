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
      <section className="panel surface">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Admin</p>
            <h3>Approval queue</h3>
          </div>
        </div>
        <p className="panel-copy">Admin access is required here. Sign in with an admin account to moderate submissions.</p>
      </section>
    );
  }

  return (
    <section className="panel surface">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Admin</p>
          <h3>Pending submissions</h3>
        </div>
        <div className="panel-mini-meta">{pendingSpots.length} waiting</div>
      </div>

      <div className="saved-list">
        {pendingSpots.length ? (
          pendingSpots.map((spot) => (
            <article key={spot.id} className="review-card surface-subtle">
              <div className="review-topline">
                <strong>{spot.name}</strong>
                <span>{spot.city}</span>
              </div>
              <p>{spot.description}</p>
              <div className="detail-meta">
                <span>{spot.type}</span>
                <span>{spot.address}</span>
              </div>
              <div className="detail-actions">
                <button type="button" className="button button-primary" onClick={() => void onApprove(spot.id)}>
                  Approve
                </button>
                <button type="button" className="button button-ghost" onClick={() => void onReject(spot.id)}>
                  Reject
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className="panel-copy">No pending spot submissions right now.</p>
        )}
      </div>
    </section>
  );
}
