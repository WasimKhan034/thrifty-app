import type { EnrichedSpot } from "../types/domain";

interface SavedPageProps {
  spots: EnrichedSpot[];
  onOpenSpot: (spotId: string) => void;
}

function SpotRow({ spot, onOpenSpot }: { spot: EnrichedSpot; onOpenSpot: (id: string) => void }) {
  return (
    <article className="spot-row surface">
      <div className="spot-row-info">
        <div className="spot-row-name">{spot.name}</div>
        <div className="spot-row-meta">{spot.city} · {spot.type} · Score {spot.thriftScore.toFixed(1)}</div>
      </div>
      <button type="button" className="button button-secondary" style={{ fontSize: "0.78rem", padding: "6px 12px", flexShrink: 0 }} onClick={() => onOpenSpot(spot.id)}>
        View on map
      </button>
    </article>
  );
}

export function SavedPage({ spots, onOpenSpot }: SavedPageProps) {
  const favorites = spots.filter((s) => s.isFavorite);
  const visited = spots.filter((s) => s.isVisited);

  return (
    <div className="page-content">
      <div className="saved-layout">
        <section className="saved-section">
          <div className="section-header">
            <span className="section-title">★ Favorites</span>
            <span className="section-count">{favorites.length}</span>
          </div>
          {favorites.length === 0 ? (
            <div className="empty-state surface">
              <div className="empty-state-icon">☆</div>
              <p>No favorites yet — tap ☆ on any spot to save it.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {favorites.map((s) => <SpotRow key={s.id} spot={s} onOpenSpot={onOpenSpot} />)}
            </div>
          )}
        </section>

        <hr className="divider" />

        <section className="saved-section">
          <div className="section-header">
            <span className="section-title">✓ Visited</span>
            <span className="section-count">{visited.length}</span>
          </div>
          {visited.length === 0 ? (
            <div className="empty-state surface">
              <div className="empty-state-icon">🧭</div>
              <p>No visits logged yet — mark spots after you go.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {visited.map((s) => <SpotRow key={s.id} spot={s} onOpenSpot={onOpenSpot} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
