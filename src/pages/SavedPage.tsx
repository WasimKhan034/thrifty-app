import type { EnrichedSpot } from "../types/domain";

interface SavedPageProps {
  spots: EnrichedSpot[];
  onOpenSpot: (spotId: string) => void;
}

function SpotRow({ spot, onOpenSpot }: { spot: EnrichedSpot; onOpenSpot: (id: string) => void }) {
  return (
    <article className="review-card surface-subtle">
      <div className="review-topline">
        <strong>{spot.name}</strong>
        <span>
          {spot.city} · {spot.type}
        </span>
      </div>
      <p className="spot-description">{spot.description}</p>
      <div className="spot-badges">
        <span className="badge">Score {spot.thriftScore.toFixed(1)}</span>
        <span className="badge">{spot.reviewCount} reviews</span>
        {spot.distance !== null ? <span className="badge">{spot.distance.toFixed(1)} mi</span> : null}
      </div>
      <button type="button" className="button button-secondary" onClick={() => onOpenSpot(spot.id)}>
        Open on map
      </button>
    </article>
  );
}

export function SavedPage({ spots, onOpenSpot }: SavedPageProps) {
  const favorites = spots.filter((s) => s.isFavorite);
  const visitedList = spots.filter((s) => s.isVisited);

  return (
    <div className="saved-outer">
      <section className="panel surface">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Saved</p>
            <h3>Favorite spots</h3>
          </div>
          <div className="panel-mini-meta">{favorites.length} saved</div>
        </div>
        <div className="saved-list">
          {favorites.length ? (
            favorites.map((spot) => (
              <SpotRow key={spot.id} spot={spot} onOpenSpot={onOpenSpot} />
            ))
          ) : (
            <p className="panel-copy">
              No favorites yet. Hit ☆ on any spot to save it here.
            </p>
          )}
        </div>
      </section>

      <section className="panel surface">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Visited</p>
            <h3>Places you have been</h3>
          </div>
          <div className="panel-mini-meta">{visitedList.length} visited</div>
        </div>
        <div className="saved-list">
          {visitedList.length ? (
            visitedList.map((spot) => (
              <SpotRow key={spot.id} spot={spot} onOpenSpot={onOpenSpot} />
            ))
          ) : (
            <p className="panel-copy">
              No visits logged. Mark spots as visited after you go.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
