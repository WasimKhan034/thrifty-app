import { seedSpots } from "../data/demoData";
import { readStorage, writeStorage } from "../lib/storage";
import { hasSupabaseEnv, supabase } from "../lib/supabase";
import type {
  AuthInput,
  RepositorySnapshot,
  Review,
  Spot,
  SpotSubmissionInput,
  ReviewInput,
  ThriftyRepository,
  UserProfile,
} from "../types/domain";

// ─── Admin config ──────────────────────────────────────────────────────────────
const ADMIN_EMAIL = "wkhantronisgone@gmail.com";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const storageKeys = {
  users: "thrifty-users",
  session: "thrifty-session",
  pending: "thrifty-pending",
  approved: "thrifty-approved",
  favorites: "thrifty-favorites",
  visited: "thrifty-visited",
};

interface PersistedDemoState {
  users: Array<UserProfile & { password: string }>;
  currentUser: UserProfile | null;
  approvedSpots: Spot[];
  pendingSpots: Spot[];
  favoritesByUser: Record<string, string[]>;
  visitedByUser: Record<string, string[]>;
}

function toPublicUser(user: UserProfile & { password: string }): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function buildDemoState(): PersistedDemoState {
  const users = readStorage<Array<UserProfile & { password: string }>>(storageKeys.users, []);
  const currentUser = readStorage<UserProfile | null>(storageKeys.session, null);
  const approvedSpots = readStorage<Spot[]>(storageKeys.approved, seedSpots);
  const pendingSpots = readStorage<Spot[]>(storageKeys.pending, []);
  const favoritesByUser = readStorage<Record<string, string[]>>(storageKeys.favorites, {});
  const visitedByUser = readStorage<Record<string, string[]>>(storageKeys.visited, {});
  return { users, currentUser, approvedSpots, pendingSpots, favoritesByUser, visitedByUser };
}

function persistDemoState(state: PersistedDemoState) {
  writeStorage(storageKeys.users, state.users);
  writeStorage(storageKeys.session, state.currentUser);
  writeStorage(storageKeys.approved, state.approvedSpots);
  writeStorage(storageKeys.pending, state.pendingSpots);
  writeStorage(storageKeys.favorites, state.favoritesByUser);
  writeStorage(storageKeys.visited, state.visitedByUser);
}

function requireAdmin(user: UserProfile | null) {
  if (!user || user.role !== "admin") {
    throw new Error("Admin approval is required for this action.");
  }
}

function createSpotFromInput(input: SpotSubmissionInput, user: UserProfile, status: Spot["status"]): Spot {
  return {
    id: `spot-${Date.now()}`,
    name: input.name.trim(),
    type: input.type,
    city: input.city.trim(),
    region: input.region.trim(),
    address: input.address.trim(),
    lat: input.lat ?? 34.0522,
    lng: input.lng ?? -118.2437,
    website: input.website?.trim(),
    tags: input.tags,
    price: input.price.trim(),
    description: input.description.trim(),
    bestFor: input.bestFor.trim(),
    status,
    source: "user",
    submittedBy: user.id,
    addedAt: new Date().toISOString(),
    reviews: [],
  };
}

// ─── Row → domain mappers ──────────────────────────────────────────────────────
function mapReviewRow(row: Record<string, unknown>, spotId: string): Review {
  const profiles = row.profiles as Record<string, unknown> | null;
  return {
    id: row.id as string,
    placeId: spotId,
    authorId: row.author_id as string,
    authorName: (profiles?.full_name as string) ?? "Thrifter",
    createdAt: row.created_at as string,
    note: (row.note as string) ?? "",
    wouldReturn: (row.would_return as boolean) ?? true,
    vintageDepth: row.vintage_depth as number,
    priceLuck: row.price_luck as number,
    selectionDepth: row.selection_depth as number,
    curation: row.curation as number,
    access: row.access as number,
    vibe: row.vibe as number,
  };
}

function mapSpotRow(row: Record<string, unknown>): Spot {
  const rawReviews = (row.reviews as Record<string, unknown>[] | null) ?? [];
  const reviews = rawReviews.map((r) => mapReviewRow(r, row.id as string));
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as Spot["type"],
    city: row.city as string,
    region: row.region as string,
    address: row.address as string,
    lat: row.lat as number,
    lng: row.lng as number,
    website: row.website as string | undefined,
    tags: (row.tags as string[]) ?? [],
    price: row.price as string,
    description: row.description as string,
    bestFor: row.best_for as string,
    status: row.status as Spot["status"],
    source: "user",
    submittedBy: row.submitted_by as string | undefined,
    addedAt: row.added_at as string,
    reviews,
  };
}

// ─── Local / demo repository ───────────────────────────────────────────────────
const localRepository: ThriftyRepository = {
  async getSnapshot() {
    const state = buildDemoState();
    const user = state.currentUser;
    return {
      currentUser: user,
      approvedSpots: state.approvedSpots,
      pendingSpots: state.pendingSpots,
      favorites: user ? state.favoritesByUser[user.id] ?? [] : [],
      visited: user ? state.visitedByUser[user.id] ?? [] : [],
    };
  },

  async signUp(input) {
    const state = buildDemoState();
    const existing = state.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
    if (existing) throw new Error("That email already has a Thrifty account.");

    const user: UserProfile & { password: string } = {
      id: `user-${Date.now()}`,
      name: input.name?.trim() || "Thrifty Member",
      email: input.email.toLowerCase().trim(),
      password: input.password,
      role: input.email.toLowerCase().trim() === ADMIN_EMAIL ? "admin" : state.users.length === 0 ? "admin" : "member",
      createdAt: new Date().toISOString(),
    };

    state.users.push(user);
    state.currentUser = toPublicUser(user);
    persistDemoState(state);
    return toPublicUser(user);
  },

  async signIn(input) {
    const state = buildDemoState();
    const user = state.users.find(
      (u) => u.email.toLowerCase() === input.email.toLowerCase().trim() && u.password === input.password
    );
    if (!user) throw new Error("Incorrect email or password.");
    state.currentUser = toPublicUser(user);
    persistDemoState(state);
    return toPublicUser(user);
  },

  async signOut() {
    const state = buildDemoState();
    state.currentUser = null;
    persistDemoState(state);
  },

  async submitSpot(input, user) {
    const state = buildDemoState();
    const spot = createSpotFromInput(input, user, "pending");
    state.pendingSpots = [spot, ...state.pendingSpots];
    persistDemoState(state);
  },

  async addReview(input, user) {
    const state = buildDemoState();
    const review: Review = {
      id: `review-${Date.now()}`,
      placeId: input.placeId,
      authorId: user.id,
      authorName: user.name,
      createdAt: new Date().toISOString(),
      note: input.note.trim(),
      wouldReturn: input.wouldReturn,
      vintageDepth: input.vintageDepth,
      priceLuck: input.priceLuck,
      selectionDepth: input.selectionDepth,
      curation: input.curation,
      access: input.access,
      vibe: input.vibe,
    };
    state.approvedSpots = state.approvedSpots.map((spot) =>
      spot.id === input.placeId ? { ...spot, reviews: [...spot.reviews, review] } : spot
    );
    persistDemoState(state);
  },

  async toggleFavorite(spotId, user) {
    const state = buildDemoState();
    const current = state.favoritesByUser[user.id] ?? [];
    const next = current.includes(spotId) ? current.filter((id) => id !== spotId) : [...current, spotId];
    state.favoritesByUser[user.id] = next;
    persistDemoState(state);
    return next;
  },

  async toggleVisited(spotId, user) {
    const state = buildDemoState();
    const current = state.visitedByUser[user.id] ?? [];
    const next = current.includes(spotId) ? current.filter((id) => id !== spotId) : [...current, spotId];
    state.visitedByUser[user.id] = next;
    persistDemoState(state);
    return next;
  },

  async approveSpot(spotId, user) {
    requireAdmin(user);
    const state = buildDemoState();
    const spot = state.pendingSpots.find((s) => s.id === spotId);
    if (!spot) return;
    state.pendingSpots = state.pendingSpots.filter((s) => s.id !== spotId);
    state.approvedSpots = [{ ...spot, status: "approved" }, ...state.approvedSpots];
    persistDemoState(state);
  },

  async rejectSpot(spotId, user) {
    requireAdmin(user);
    const state = buildDemoState();
    state.pendingSpots = state.pendingSpots.filter((s) => s.id !== spotId);
    persistDemoState(state);
  },
};

// ─── Supabase / live repository ────────────────────────────────────────────────
const supabaseRepository: ThriftyRepository = {
  async getSnapshot(): Promise<RepositorySnapshot> {
    if (!supabase) throw new Error("Supabase client is not configured.");

    // Current auth session
    const { data: { session } } = await supabase.auth.getSession();
    let currentUser: UserProfile | null = null;

    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        currentUser = {
          id: profile.id as string,
          name: profile.full_name as string,
          email: profile.email as string,
          role: profile.role as "admin" | "member",
          createdAt: profile.created_at as string,
        };
      }
    }

    // Approved spots with nested reviews + reviewer name
    const { data: approvedRows } = await supabase
      .from("spots")
      .select("*, reviews(*, profiles(full_name))")
      .eq("status", "approved")
      .order("added_at", { ascending: false });

    // Pending spots — only admins see these via RLS; non-admins get []
    const { data: pendingRows } = await supabase
      .from("spots")
      .select("*, reviews(*, profiles(full_name))")
      .eq("status", "pending")
      .order("added_at", { ascending: false });

    // Favorites & visited for current user
    let favorites: string[] = [];
    let visited: string[] = [];
    if (currentUser) {
      const [favRes, visitRes] = await Promise.all([
        supabase.from("favorites").select("spot_id").eq("profile_id", currentUser.id),
        supabase.from("visited_spots").select("spot_id").eq("profile_id", currentUser.id),
      ]);
      favorites = (favRes.data ?? []).map((r: Record<string, unknown>) => r.spot_id as string);
      visited = (visitRes.data ?? []).map((r: Record<string, unknown>) => r.spot_id as string);
    }

    return {
      currentUser,
      approvedSpots: (approvedRows ?? []).map((r) => mapSpotRow(r as Record<string, unknown>)),
      pendingSpots: (pendingRows ?? []).map((r) => mapSpotRow(r as Record<string, unknown>)),
      favorites,
      visited,
    };
  },

  async signUp(input: AuthInput): Promise<UserProfile> {
    if (!supabase) throw new Error("Supabase client is not configured.");

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });
    if (error || !data.user) throw new Error(error?.message ?? "Sign up failed.");

    const role: "admin" | "member" =
      input.email.toLowerCase().trim() === ADMIN_EMAIL ? "admin" : "member";

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: input.name?.trim() || "Thrifty Member",
      email: input.email.toLowerCase().trim(),
      role,
    });
    if (profileError) throw new Error(profileError.message);

    return {
      id: data.user.id,
      name: input.name?.trim() || "Thrifty Member",
      email: data.user.email ?? input.email,
      role,
      createdAt: data.user.created_at,
    };
  },

  async signIn(input: AuthInput): Promise<UserProfile> {
    if (!supabase) throw new Error("Supabase client is not configured.");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      // Provide a friendlier message for the most common Supabase error
      if (error.message.toLowerCase().includes("email not confirmed")) {
        throw new Error("Please check your inbox and confirm your email before signing in.");
      }
      throw new Error(error.message ?? "Incorrect email or password.");
    }
    if (!data.user) throw new Error("Sign in failed. Please try again.");

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    // If profile row is missing (e.g. created before RLS was set up), create it on the fly
    if (!profile) {
      const role: "admin" | "member" =
        data.user.email?.toLowerCase().trim() === ADMIN_EMAIL ? "admin" : "member";
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: data.user.email?.split("@")[0] ?? "Thrifter",
        email: data.user.email ?? input.email,
        role,
      });
      return {
        id: data.user.id,
        name: data.user.email?.split("@")[0] ?? "Thrifter",
        email: data.user.email ?? input.email,
        role,
        createdAt: data.user.created_at,
      };
    }

    return {
      id: profile.id as string,
      name: profile.full_name as string,
      email: profile.email as string,
      role: profile.role as "admin" | "member",
      createdAt: profile.created_at as string,
    };
  },

  async signOut(): Promise<void> {
    if (!supabase) throw new Error("Supabase client is not configured.");
    await supabase.auth.signOut();
  },

  async submitSpot(input: SpotSubmissionInput, user: UserProfile): Promise<void> {
    if (!supabase) throw new Error("Supabase client is not configured.");

    const { error } = await supabase.from("spots").insert({
      name: input.name.trim(),
      type: input.type,
      city: input.city.trim(),
      region: input.region.trim(),
      address: input.address.trim(),
      lat: input.lat ?? 34.0522,
      lng: input.lng ?? -118.2437,
      website: input.website?.trim() || null,
      tags: input.tags,
      price: input.price.trim(),
      description: input.description.trim(),
      best_for: input.bestFor.trim(),
      status: "pending",
      submitted_by: user.id,
    });
    if (error) throw new Error(error.message);
  },

  async addReview(input: ReviewInput, user: UserProfile): Promise<void> {
    if (!supabase) throw new Error("Supabase client is not configured.");

    const { error } = await supabase.from("reviews").insert({
      spot_id: input.placeId,
      author_id: user.id,
      note: input.note.trim(),
      would_return: input.wouldReturn,
      vintage_depth: input.vintageDepth,
      price_luck: input.priceLuck,
      selection_depth: input.selectionDepth,
      curation: input.curation,
      access: input.access,
      vibe: input.vibe,
    });
    if (error) throw new Error(error.message);
  },

  async toggleFavorite(spotId: string, user: UserProfile): Promise<string[]> {
    if (!supabase) throw new Error("Supabase client is not configured.");

    const { data: existing } = await supabase
      .from("favorites")
      .select("spot_id")
      .eq("profile_id", user.id)
      .eq("spot_id", spotId)
      .maybeSingle();

    if (existing) {
      await supabase.from("favorites").delete().eq("profile_id", user.id).eq("spot_id", spotId);
    } else {
      await supabase.from("favorites").insert({ profile_id: user.id, spot_id: spotId });
    }

    const { data } = await supabase.from("favorites").select("spot_id").eq("profile_id", user.id);
    return (data ?? []).map((r: Record<string, unknown>) => r.spot_id as string);
  },

  async toggleVisited(spotId: string, user: UserProfile): Promise<string[]> {
    if (!supabase) throw new Error("Supabase client is not configured.");

    const { data: existing } = await supabase
      .from("visited_spots")
      .select("spot_id")
      .eq("profile_id", user.id)
      .eq("spot_id", spotId)
      .maybeSingle();

    if (existing) {
      await supabase.from("visited_spots").delete().eq("profile_id", user.id).eq("spot_id", spotId);
    } else {
      await supabase.from("visited_spots").insert({ profile_id: user.id, spot_id: spotId });
    }

    const { data } = await supabase.from("visited_spots").select("spot_id").eq("profile_id", user.id);
    return (data ?? []).map((r: Record<string, unknown>) => r.spot_id as string);
  },

  async approveSpot(spotId: string, user: UserProfile): Promise<void> {
    requireAdmin(user);
    if (!supabase) throw new Error("Supabase client is not configured.");

    const { error } = await supabase
      .from("spots")
      .update({ status: "approved", approved_by: user.id })
      .eq("id", spotId);
    if (error) throw new Error(error.message);
  },

  async rejectSpot(spotId: string, user: UserProfile): Promise<void> {
    requireAdmin(user);
    if (!supabase) throw new Error("Supabase client is not configured.");

    const { error } = await supabase
      .from("spots")
      .update({ status: "rejected" })
      .eq("id", spotId);
    if (error) throw new Error(error.message);
  },
};

// ─── Export active repository ──────────────────────────────────────────────────
export const repository: ThriftyRepository = hasSupabaseEnv ? supabaseRepository : localRepository;
