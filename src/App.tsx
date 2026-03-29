import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AppFrame } from "./components/AppFrame";
import { useThriftyApp } from "./hooks/useThriftyApp";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { ContributePage } from "./pages/ContributePage";
import { ExplorePage } from "./pages/ExplorePage";
import { SavedPage } from "./pages/SavedPage";

function AppRoutes() {
  const navigate = useNavigate();
  const app = useThriftyApp();

  useEffect(() => {
    document.body.setAttribute("data-theme", app.theme);
  }, [app.theme]);

  const stats = {
    total: app.approvedSpots.length,
    avgScore: app.approvedSpots.length
      ? (
          app.approvedSpots.reduce((sum, spot) => sum + spot.thriftScore, 0) / app.approvedSpots.length
        ).toFixed(1)
      : "0.0",
    favorites: app.approvedSpots.filter((spot) => spot.isFavorite).length,
    pending: app.pendingSpots.length,
  };

  async function guardedAction(action: () => Promise<void>) {
    try {
      await action();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      window.alert(message);
    }
  }

  return (
    <>
      <AppFrame theme={app.theme} onThemeChange={app.setTheme} currentUser={app.currentUser} onSignOut={() => void guardedAction(app.signOut)} />
      <section className="status-banner surface-subtle">{app.statusMessage}</section>
      <section className="stats-grid">
        <div className="stat-card surface-subtle">
          <span>{stats.total}</span>
          <p>approved spots</p>
        </div>
        <div className="stat-card surface-subtle">
          <span>{stats.avgScore}</span>
          <p>average thrift score</p>
        </div>
        <div className="stat-card surface-subtle">
          <span>{stats.favorites}</span>
          <p>favorites saved</p>
        </div>
        <div className="stat-card surface-subtle">
          <span>{stats.pending}</span>
          <p>pending approval</p>
        </div>
      </section>

      <Routes>
        <Route
          path="/"
          element={
            <ExplorePage
              spots={app.filteredSpots}
              selectedSpot={app.selectedSpot}
              selectedSpotId={app.selectedSpotId}
              setSelectedSpotId={app.setSelectedSpotId}
              filters={app.filters}
              setFilters={app.setFilters}
              onToggleFavorite={(spotId) => guardedAction(() => app.toggleFavorite(spotId))}
              onToggleVisited={(spotId) => guardedAction(() => app.toggleVisited(spotId))}
              onFindNearMe={app.findNearMe}
              onResetBrowse={app.resetBrowse}
              mapView={app.mapView}
              setMapView={app.setMapView}
              userLocation={app.userLocation}
            />
          }
        />
        <Route
          path="/contribute"
          element={
            <ContributePage
              spots={app.approvedSpots}
              selectedSpotId={app.selectedSpotId}
              onSubmitSpot={(input) => guardedAction(() => app.submitSpot(input))}
              onAddReview={(input) => guardedAction(() => app.addReview(input))}
            />
          }
        />
        <Route
          path="/saved"
          element={
            <SavedPage
              spots={app.approvedSpots}
              onOpenSpot={(spotId) => {
                app.setSelectedSpotId(spotId);
                navigate("/");
              }}
            />
          }
        />
        <Route
          path="/admin"
          element={
            <AdminPage
              currentUser={app.currentUser}
              pendingSpots={app.pendingSpots}
              onApprove={(spotId) => guardedAction(() => app.approveSpot(spotId))}
              onReject={(spotId) => guardedAction(() => app.rejectSpot(spotId))}
            />
          }
        />
        <Route
          path="/auth"
          element={
            <AuthPage
              currentUser={app.currentUser}
              onSignUp={(name, email, password) => guardedAction(() => app.signUp(name, email, password))}
              onSignIn={(email, password) => guardedAction(() => app.signIn(email, password))}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default AppRoutes;
