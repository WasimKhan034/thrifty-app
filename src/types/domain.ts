export type SpotType = "Thrift Store" | "Vintage Shop" | "Flea Market" | "Pop-Up" | "Cinema" | "Coffee Shop" | "Destination";
export type SpotStatus = "approved" | "pending" | "rejected";
export type ThemeId = "light" | "dark";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  createdAt: string;
}

export interface Review {
  id: string;
  placeId: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  note: string;
  wouldReturn: boolean;
  vintageDepth: number;
  priceLuck: number;
  selectionDepth: number;
  curation: number;
  access: number;
  vibe: number;
}

export interface Spot {
  id: string;
  name: string;
  type: SpotType;
  city: string;
  region: string;
  address: string;
  lat: number;
  lng: number;
  website?: string;
  tags: string[];
  price: string;
  description: string;
  bestFor: string;
  status: SpotStatus;
  source: "user" | "seed";
  submittedBy?: string;
  addedAt: string;
  reviews: Review[];
}

export interface EnrichedSpot extends Spot {
  thriftScore: number;
  reviewCount: number;
  metricAverages: Record<string, number>;
  distance: number | null;
  isFavorite: boolean;
  isVisited: boolean;
}

export interface SpotSubmissionInput {
  name: string;
  type: SpotType;
  city: string;
  region: string;
  address: string;
  lat?: number;
  lng?: number;
  website?: string;
  tags: string[];
  price: string;
  description: string;
  bestFor: string;
}

export interface ReviewInput {
  placeId: string;
  note: string;
  wouldReturn: boolean;
  vintageDepth: number;
  priceLuck: number;
  selectionDepth: number;
  curation: number;
  access: number;
  vibe: number;
}

export interface AuthInput {
  email: string;
  password: string;
  name?: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface AppFilters {
  search: string;
  type: SpotType | "";
  region: string;
  sortBy: "score" | "distance" | "reviews" | "recent" | "name";
  radius: "" | "5" | "15" | "30" | "60";
  favoritesOnly: boolean;
  visitedOnly: boolean;
}

export interface RepositorySnapshot {
  currentUser: UserProfile | null;
  approvedSpots: Spot[];
  pendingSpots: Spot[];
  favorites: string[];
  visited: string[];
}

export interface ThriftyRepository {
  getSnapshot(): Promise<RepositorySnapshot>;
  signUp(input: AuthInput): Promise<UserProfile>;
  signIn(input: AuthInput): Promise<UserProfile>;
  signOut(): Promise<void>;
  submitSpot(input: SpotSubmissionInput, user: UserProfile): Promise<void>;
  addReview(input: ReviewInput, user: UserProfile): Promise<void>;
  toggleFavorite(spotId: string, user: UserProfile): Promise<string[]>;
  toggleVisited(spotId: string, user: UserProfile): Promise<string[]>;
  approveSpot(spotId: string, user: UserProfile): Promise<void>;
  rejectSpot(spotId: string, user: UserProfile): Promise<void>;
}
