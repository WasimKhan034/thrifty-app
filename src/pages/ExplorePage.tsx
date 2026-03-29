import type { Dispatch, SetStateAction } from "react";
import { regionOptions, typeOptions } from "../data/demoData";
import { MapPanel } from "../components/MapPanel";
import type { AppFilters, EnrichedSpot, UserLocation } from "../types/domain";

interface ExplorePageProps {
  spots: EnrichedSpot[];
  selectedSpot: EnrichedSpot | null;
  selectedSpotId: string | null;
  setSelectedSpotId: (spotId: string) => void;
  filters: AppFilters;
  setFilters: Dispatch<SetStateAction<AppFilters>>;
  onToggleFavorite: (spotId: string) => Promise<void>;
  onToggleVisited: (spotId: string) => Promise<void>;
  onFindNearMe: () => void;
  onResetBrowse: () => void;
  mapView: UserLocation & { zoom: number };
  setMapView: Dispatch<SetStateAction<UserLocation & { zoom: number }>>;
  userLocation: UserLocation | null;
}

function SpotCard({
  spot,
  selectedSpotId,
  setSelectedSpotId,
  onToggleFavorite,
  onToggleVisited,
}: {
  spot: EnrichedSpot;
  selectedSpotId: string | null;
  setSelectedSpotId: (spotId: string) => void;
  onToggleFavorite: (spotId: string) => Promise<void>;
  onToggleVisited: (spotId: string) => Promise<void>;
}) {
  return (
    <article
      className={`spot-card surface ${selectedSpotId === spot.id ? "selected" : ""}`}
      onClick={() => setSelectedSpotId(spot.id)}
      style={{ cursor: "pointer" }}
    >
      <div className="spot-topline">
        <span className="spot-type">{spot.type}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span className="score-chip">{spot.thriftScore.toFixed(1)}</span>
          <button
            type="button"
            className={`icon-button ${spot.isFavorite ? "active" : ""}`}
            onClick={(e) => { e.stopPropagation(); void onToggleFavorite(spot.id); }}
            title={spot.isFavorite ? "Remove from favorites" : "Save to favorites"}
          >
            {spot.isFavorite ? "★" : "☆"}
          </button>
        </div>
      </div>

      <div>
        <div className="spot-title">{spot.name}</div>
        <div className="spot-meta">
          {spot.city}{spot.distance !== null ? ` · ${spot.distance.toFixed(1)} mi` : ""} · {spot.reviewCount} review{spot.reviewCount !== 1 ? "s" : ""}
        </div>
      </div>

      {spot.price && (
        <div className="spot-badges">
          <span className="badge">{spot.price}</span>
          {spot.isVisited && <span className="badge badge-accent">Visited</span>}
        </div>
      )}
    </article>
  );
}

const METRIC_LABELS: Record<string, string> = {
  vintageDepth: "Vintage depth",
  priceLuck: "Price luck",
  selectionDepth: "Selection",
  curation: "Curation",
  access: "Access",
  vibe: "Vibe",
};

function DetailPanel({
  spot,
  onToggleFavorite,
  onToggleVisited,
}: {
  spot: EnrichedSpot | null;
  onToggleFavorite: (spotId: string) => Promise<void>;
  onToggleVisited: (spotId: string) => Promise<void>;
}) {
  if (!spot) {
    return (
      <aside className="panel surface detail-panel" style={{ color: "var(--text-muted)", textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: "2rem", opacity: 0.3, marginBottom: 8 }}>🗺</div>
        <p style={{ fontSize: "0.85rem" }}>Tap a spot to see the full breakdown</p>
      </aside>
    );
  }

  return (
    <aside className="panel surface detail-panel">
      <div className="panel-head">
        <div>
          <span className="spot-type">{spot.type}</span>
          <h3 style={{ marginTop: 2 }}>{spot.name}</h3>
        </div>
        <span className="score-chip" style={{ fontSize: "1.1rem" }}>{spot.thriftScore.toFixed(1)}</span>
      </div>

      <p className="panel-copy">{spot.description}</p>

      <div className="panel-meta">
        <span className="badge">{spot.address}</span>
        {spot.price && <span className="badge">{spot.price}</span>}
        {spot.distance !== null && <span className="badge">{spot.distance.toFixed(1)} mi</span>}
        <span className="badge">{spot.reviewCount} review{spot.reviewCount !== 1 ? "s" : ""}</span>
      </div>

      <div className="panel-actions">
        <button
          type="button"
          className={`button ${spot.isFavorite ? "button-primary" : "button-secondary"}`}
          onClick={() => void onToggleFavorite(spot.id)}
        >
          {spot.isFavorite ? "★ Saved" : "☆ Save"}
        </button>
        <button
          type="button"
          className={`button ${spot.isVisited ? "button-primary" : "button-secondary"}`}
          onClick={() => void onToggleVisited(spot.id)}
        >
          {spot.isVisited ? "✓ Visited" : "Mark visited"}
        </button>
        <a
          className="button button-ghost"
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.address)}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          Maps ↗
        </a>
      </div>

      {Object.keys(spot.metricAverages).length > 0 && (
        <div className="panel-section">
          <p className="panel-label">Score breakdown</p>
          <div className="metric-list">
            {Object.entries(spot.metricAverages).map(([key, value]) => (
              <div key={key} className="metric-row">
                <div className="metric-labels">
                  <strong>{METRIC_LABELS[key] ?? key}</strong>
                  <span>{value.toFixed(1)}</span>
                </div>
                <div className="metric-track">
                  <div className="metric-fill" style={{ width: `${(value / 5) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {spot.tags && spot.tags.length > 0 && (
        <div className="spot-badges">
          {spot.tags.map((tag) => (
            <span key={tag} className="badge">{tag}</span>
          ))}
        </div>
      )}
    </aside>
  );
}

export function ExplorePage(props: ExplorePageProps) {
  const {
    spots,
    selectedSpot,
    selectedSpotId,
    setSelectedSpotId,
    filters,
    setFilters,
    onToggleFavorite,
    onToggleVisited,
    onFindNearMe,
    onResetBrowse,
    mapView,
    setMapView,
    userLocation,
  } = props;

  return (
    <div className="page-content">
      {/* Filters */}
      <div className="controls-shell">
        <div className="search-row">
          <input
            value={filters.search}
            onChange={(e) => setFilters((c) => ({ ...c, search: e.target.value }))}
            placeholder="Search by name, city, or vibe..."
            style={{ fontSize: "0.88rem" }}
          />
          <button type="button" className="button button-secondary" onClick={onFindNearMe}>
            {userLocation ? "↻ Near me" : "📍 Near me"}
          </button>
        </div>

        <div className="filter-row">
          <select
            className="filter-select"
            value={filters.type}
            onChange={(e) => setFilters((c) => ({ ...c, type: e.target.value as AppFilters["type"] }))}
          >
            {typeOptions.map((o) => <option key={o} value={o === "All Types" ? "" : o}>{o}</option>)}
          </select>

          <select
            className="filter-select"
            value={filters.region}
            onChange={(e) => setFilters((c) => ({ ...c, region: e.target.value }))}
          >
            {regionOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>

          <select
            className="filter-select"
            value={filters.sortBy}
            onChange={(e) => setFilters((c) => ({ ...c, sortBy: e.target.value as AppFilters["sortBy"] }))}
          >
            <option value="score">Top score</option>
            <option value="distance">Nearest</option>
            <option value="reviews">Most reviewed</option>
            <option value="recent">Newest</option>
            <option value="name">A–Z</option>
          </select>

          <button
            type="button"
            className={`toggle-pill ${filters.favoritesOnly ? "active" : ""}`}
            onClick={() => setFilters((c) => ({ ...c, favoritesOnly: !c.favoritesOnly }))}
          >
            ★ Saved
          </button>

          <button
            type="button"
            className={`toggle-pill ${filters.visitedOnly ? "active" : ""}`}
            onClick={() => setFilters((c) => ({ ...c, visitedOnly: !c.visitedOnly }))}
          >
            ✓ Visited
          </button>

          {(filters.search || filters.type || filters.region !== "All California" || filters.favoritesOnly || filters.visitedOnly) && (
            <button type="button" className="toggle-pill" onClick={onResetBrowse}>
              × Clear
            </button>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="explore-layout">
        <div className="explore-main">
          <div className="map-shell">
            <MapPanel
              spots={spots}
              selectedSpot={selectedSpot}
              userLocation={userLocation}
              mapView={mapView}
              onSelectSpot={setSelectedSpotId}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              {spots.length} spot{spots.length !== 1 ? "s" : ""} found
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" className="toggle-pill" onClick={() => setMapView({ lat: 34.03, lng: -118.2, zoom: 9 })}>SoCal</button>
              <button type="button" className="toggle-pill" onClick={() => setMapView({ lat: 37.77, lng: -122.41, zoom: 11 })}>SF</button>
              <button type="button" className="toggle-pill" onClick={() => setMapView({ lat: 36.78, lng: -119.42, zoom: 6 })}>All CA</button>
            </div>
          </div>

          {spots.length === 0 ? (
            <div className="empty-state surface">
              <div className="empty-state-icon">🧺</div>
              <p>No spots match your filters.</p>
              <button type="button" className="button button-secondary" style={{ marginTop: 10 }} onClick={onResetBrowse}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="spot-list">
              {spots.map((spot) => (
                <SpotCard
                  key={spot.id}
                  spot={spot}
                  selectedSpotId={selectedSpotId}
                  setSelectedSpotId={setSelectedSpotId}
                  onToggleFavorite={onToggleFavorite}
                  onToggleVisited={onToggleVisited}
                />
              ))}
            </div>
          )}
        </div>

        <DetailPanel
          spot={selectedSpot}
          onToggleFavorite={onToggleFavorite}
          onToggleVisited={onToggleVisited}
        />
      </div>
    </div>
  );
}
