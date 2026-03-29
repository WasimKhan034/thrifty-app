import { useCallback, useEffect, useMemo, useState } from "react";
import { metrics } from "../data/demoData";
import { repository } from "../services/repository";
import type {
  AppFilters,
  EnrichedSpot,
  ReviewInput,
  Spot,
  SpotSubmissionInput,
  ThemeId,
  UserLocation,
  UserProfile,
} from "../types/domain";

// Haversine distance in miles
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function enrichSpot(
  spot: Spot,
  favoriteIds: string[],
  visitedIds: string[],
  userLocation: UserLocation | null
): EnrichedSpot {
  const reviews = spot.reviews;
  const reviewCount = reviews.length;

  const metricAverages: Record<string, number> = {};
  for (const m of metrics) {
    const key = m.key as keyof typeof reviews[0];
    const avg =
      reviewCount > 0
        ? reviews.reduce((sum, r) => sum + (r[key] as number), 0) / reviewCount
        : 0;
    metricAverages[m.label] = avg;
  }

  const vals = Object.values(metricAverages);
  const thriftScore =
    vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;

  const distance = userLocation
    ? haversine(userLocation.lat, userLocation.lng, spot.lat, spot.lng)
    : null;

  return {
    ...spot,
    reviewCount,
    metricAverages,
    thriftScore: parseFloat(thriftScore.toFixed(2)),
    distance,
    isFavorite: favoriteIds.includes(spot.id),
    isVisited: visitedIds.includes(spot.id),
  };
}

const DEFAULT_FILTERS: AppFilters = {
  search: "",
  type: "",
  region: "All California",
  sortBy: "score",
  radius: "",
  favoritesOnly: false,
  visitedOnly: false,
};

const DEFAULT_MAP_VIEW = { lat: 34.03, lng: -118.2, zoom: 8 };

export function useThriftyApp() {
  const [theme, setTheme] = useState<ThemeId>("light");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [approvedSpots, setApprovedSpots] = useState<Spot[]>([]);
  const [pendingSpots, setPendingSpots] = useState<Spot[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [visited, setVisited] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [filters, setFilters] = useState<AppFilters>(DEFAULT_FILTERS);
  const [mapView, setMapView] = useState(DEFAULT_MAP_VIEW);
  const [statusMessage, setStatusMessage] = useState("Loading…");

  // Load snapshot on mount
  useEffect(() => {
    repository
      .getSnapshot()
      .then((snapshot) => {
        setCurrentUser(snapshot.currentUser);
        setApprovedSpots(snapshot.approvedSpots);
        setPendingSpots(snapshot.pendingSpots);
        setFavorites(snapshot.favorites);
        setVisited(snapshot.visited);
        setStatusMessage(
          snapshot.currentUser
            ? `Signed in as ${snapshot.currentUser.name}`
            : `${snapshot.approvedSpots.length} spots loaded — sign in to save favorites`
        );
      })
      .catch(() => {
        setStatusMessage("Failed to load. Please refresh.");
      });
  }, []);

  // Enrich spots with computed fields
  const enrichedApproved = useMemo(
    () => approvedSpots.map((s) => enrichSpot(s, favorites, visited, userLocation)),
    [approvedSpots, favorites, visited, userLocation]
  );

  const enrichedPending = useMemo(
    () => pendingSpots.map((s) => enrichSpot(s, favorites, visited, userLocation)),
    [pendingSpots, favorites, visited, userLocation]
  );

  // Apply filters
  const filteredSpots = useMemo(() => {
    let result = [...enrichedApproved];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filters.type) result = result.filter((s) => s.type === filters.type);

    if (filters.region && filters.region !== "All California")
      result = result.filter((s) => s.region === filters.region);

    if (filters.favoritesOnly) result = result.filter((s) => s.isFavorite);
    if (filters.visitedOnly) result = result.filter((s) => s.isVisited);

    if (filters.radius && userLocation) {
      const max = Number(filters.radius);
      result = result.filter((s) => s.distance !== null && s.distance <= max);
    }

    switch (filters.sortBy) {
      case "score":
        result.sort((a, b) => b.thriftScore - a.thriftScore);
        break;
      case "distance":
        result.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        break;
      case "reviews":
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "recent":
        result.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [enrichedApproved, filters, userLocation]);

  const selectedSpot = useMemo(
    () => enrichedApproved.find((s) => s.id === selectedSpotId) ?? null,
    [enrichedApproved, selectedSpotId]
  );

  const refreshSnapshot = useCallback(async () => {
    const snap = await repository.getSnapshot();
    setApprovedSpots(snap.approvedSpots);
    setPendingSpots(snap.pendingSpots);
    setFavorites(snap.favorites);
    setVisited(snap.visited);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const user = await repository.signUp({ name, email, password });
    setCurrentUser(user);
    await refreshSnapshot();
    setStatusMessage(`Welcome, ${user.name}!`);
  }, [refreshSnapshot]);

  const signIn = useCallback(async (email: string, password: string) => {
    const user = await repository.signIn({ email, password });
    setCurrentUser(user);
    await refreshSnapshot();
    setStatusMessage(`Welcome back, ${user.name}!`);
  }, [refreshSnapshot]);

  const signOut = useCallback(async () => {
    await repository.signOut();
    setCurrentUser(null);
    setFavorites([]);
    setVisited([]);
    setStatusMessage("Signed out.");
  }, []);

  const submitSpot = useCallback(
    async (input: SpotSubmissionInput) => {
      if (!currentUser) throw new Error("Sign in to submit spots.");
      await repository.submitSpot(input, currentUser);
      setStatusMessage("Spot submitted for review!");
    },
    [currentUser]
  );

  const addReview = useCallback(
    async (input: ReviewInput) => {
      if (!currentUser) throw new Error("Sign in to leave reviews.");
      await repository.addReview(input, currentUser);
      await refreshSnapshot();
      setStatusMessage("Review posted!");
    },
    [currentUser, refreshSnapshot]
  );

  const toggleFavorite = useCallback(
    async (spotId: string) => {
      if (!currentUser) throw new Error("Sign in to save favorites.");
      const updated = await repository.toggleFavorite(spotId, currentUser);
      setFavorites(updated);
    },
    [currentUser]
  );

  const toggleVisited = useCallback(
    async (spotId: string) => {
      if (!currentUser) throw new Error("Sign in to track visits.");
      const updated = await repository.toggleVisited(spotId, currentUser);
      setVisited(updated);
    },
    [currentUser]
  );

  const approveSpot = useCallback(
    async (spotId: string) => {
      if (!currentUser) throw new Error("Not authorized.");
      await repository.approveSpot(spotId, currentUser);
      await refreshSnapshot();
      setStatusMessage("Spot approved!");
    },
    [currentUser, refreshSnapshot]
  );

  const rejectSpot = useCallback(
    async (spotId: string) => {
      if (!currentUser) throw new Error("Not authorized.");
      await repository.rejectSpot(spotId, currentUser);
      await refreshSnapshot();
      setStatusMessage("Spot rejected.");
    },
    [currentUser, refreshSnapshot]
  );

  const findNearMe = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setMapView({ ...loc, zoom: 12 });
        setFilters((f) => ({ ...f, sortBy: "distance" }));
        setStatusMessage("Showing spots near you.");
      },
      () => {
        setStatusMessage("Location access denied.");
      }
    );
  }, []);

  const resetBrowse = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSelectedSpotId(null);
    setMapView(DEFAULT_MAP_VIEW);
    setUserLocation(null);
    setStatusMessage(`${approvedSpots.length} spots available.`);
  }, [approvedSpots.length]);

  return {
    theme,
    setTheme,
    currentUser,
    approvedSpots: enrichedApproved,
    pendingSpots: enrichedPending,
    filteredSpots,
    selectedSpot,
    selectedSpotId,
    setSelectedSpotId,
    filters,
    setFilters,
    mapView,
    setMapView,
    userLocation,
    findNearMe,
    resetBrowse,
    statusMessage,
    signUp,
    signIn,
    signOut,
    submitSpot,
    addReview,
    toggleFavorite,
    toggleVisited,
    approveSpot,
    rejectSpot,
  };
}
