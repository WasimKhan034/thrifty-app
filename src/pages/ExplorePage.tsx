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
    <article className={`spot-card surface-subtle ${selectedSpotId === spot.id ? "selected" : ""}`}>
      <div className="spot-topline">
        <span className="spot-type">{spot.type}</span>
        <button type="button" className="icon-button" onClick={() => void onToggleFavorite(spot.id)}>
          {spot.isFavorite ? "★" : "☆"}
        </button>
      </div>

      <button type="button" className="spot-main" onClick={() => setSelectedSpotId(spot.id)}>
        <h4>{spot.name}</h4>
        <p>
          {spot.city}, {spot.region}
        </p>
        <p className="spot-description">{spot.description}</p>
      </button>

      <div className="spot-badges">
        <span className="badge">Score {spot.thriftScore.toFixed(1)}</span>
        <span className="badge">{spot.reviewCount} reviews</span>
        {spot.distance !== null ? <span className="badge">{spot.distance.toFixed(1)} mi</span> : null}
      </div>

      <div className="spot-tags">
        {spot.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="spot-actions">
        <button type="button" className="button button-secondary" onClick={() => setSelectedSpotId(spot.id)}>
          Details
        </button>
        <button type="button" className="button button-ghost" onClick={() => void onToggleVisited(spot.id)}>
          {spot.isVisited ? "Visited" : "Mark visited"}
        </button>
      </div>
    </article>
  );
}

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
      <aside className="panel surface">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Details</p>
            <h3>Select a place</h3>
          </div>
        </div>
        <p className="panel-copy">Choose any card or map marker to inspect the full thrift score breakdown.</p>
      </aside>
    );
  }

  return (
    <aside className="panel surface">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Details</p>
          <h3>{spot.name}</h3>
        </div>
        <span className="score-chip">{spot.thriftScore.toFixed(1)}</span>
      </div>

      <div className="detail-stack">
        <p className="detail-address">{spot.address}</p>
        <p className="detail-description">{spot.description}</p>
        <div className="detail-meta">
          <span>{spot.type}</span>
          <span>{spot.price}</span>
          <span>{spot.reviewCount} reviews</span>
          {spot.distance !== null ? <span>{spot.distance.toFixed(1)} mi away</span> : null}
        </div>
        <div className="detail-meta">
          <span>Best for {spot.bestFor}</span>
        </div>

        <div className="metric-list">
          {Object.entries(spot.metricAverages).map(([key, value]) => (
            <div key={key} className="metric-row">
              <div className="metric-labels">
                <strong>{key}</strong>
                <span>{value.toFixed(1)} / 5</span>
              </div>
              <div className="metric-track">
                <div className="metric-fill" style={{ width: `${(value / 5) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="detail-actions">
          <button type="button" className="button button-secondary" onClick={() => void onToggleFavorite(spot.id)}>
            {spot.isFavorite ? "Saved" : "Save favorite"}
          </button>
          <button type="button" className="button button-ghost" onClick={() => void onToggleVisited(spot.id)}>
            {spot.isVisited ? "Visited" : "Mark visited"}
          </button>
          <a
            className="button button-ghost"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.address)}`}
            target="_blank"
            rel="noreferrer"
          >
            Open in Maps
          </a>
        </div>
      </div>
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
    <>
      <section className="controls-shell surface">
        <div className="search-block">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Search by store, city, address, or vibe"
          />
        </div>

        <div className="control-grid">
          <label>
            <span>Type</span>
            <select
              value={filters.type}
              onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value as AppFilters["type"] }))}
            >
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Region</span>
            <select
              value={filters.region}
              onChange={(event) => setFilters((current) => ({ ...current, region: event.target.value }))}
            >
              {regionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Sort</span>
            <select
              value={filters.sortBy}
              onChange={(event) =>
                setFilters((current) => ({ ...current, sortBy: event.target.value as AppFilters["sortBy"] }))
              }
            >
              <option value="score">Top score</option>
              <option value="distance">Nearest</option>
              <option value="reviews">Most reviewed</option>
              <option value="recent">Newest</option>
              <option value="name">Name</option>
            </select>
          </label>

          <label>
            <span>Radius</span>
            <select
              value={filters.radius}
              onChange={(event) =>
                setFilters((current) => ({ ...current, radius: event.target.value as AppFilters["radius"] }))
              }
            >
              <option value="">All distances</option>
              <option value="5">Within 5 miles</option>
              <option value="15">Within 15 miles</option>
              <option value="30">Within 30 miles</option>
              <option value="60">Within 60 miles</option>
            </select>
          </label>
        </div>

        <div className="toggle-row">
          <button
            type="button"
            className={`toggle-pill ${filters.favoritesOnly ? "active" : ""}`}
            onClick={() => setFilters((current) => ({ ...current, favoritesOnly: !current.favoritesOnly }))}
          >
            Favorites only
          </button>
          <button
            type="button"
            className={`toggle-pill ${filters.visitedOnly ? "active" : ""}`}
            onClick={() => setFilters((current) => ({ ...current, visitedOnly: !current.visitedOnly }))}
          >
            Visited only
          </button>
          <button type="button" className="button button-secondary" onClick={onFindNearMe}>
            {userLocation ? "Refresh near me" : "Find near me"}
          </button>
          <button type="button" className="button button-ghost" onClick={() => setMapView({ lat: 34.03, lng: -118.2, zoom: 8 })}>
            SoCal
          </button>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => setMapView({ lat: 36.7783, lng: -119.4179, zoom: 6 })}
          >
            California
          </button>
          <button type="button" className="button button-ghost" onClick={onResetBrowse}>
            Reset
          </button>
        </div>
      </section>

      <div className="explore-grid">
        <div className="explore-main">
          <MapPanel
            spots={spots}
            selectedSpot={selectedSpot}
            userLocation={userLocation}
            mapView={mapView}
            onSelectSpot={setSelectedSpotId}
          />

          <section className="panel surface">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Results</p>
                <h3>Stores worth checking</h3>
              </div>
              <div className="panel-mini-meta">{spots.length} results</div>
            </div>

            <div className="spot-grid">
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
          </section>
        </div>

        <DetailPanel
          spot={selectedSpot}
          onToggleFavorite={onToggleFavorite}
          onToggleVisited={onToggleVisited}
        />
      </div>
    </>
  );
}
