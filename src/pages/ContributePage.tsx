import { useEffect, useState, type FormEvent } from "react";
import { metrics, regionOptions } from "../data/demoData";
import type { EnrichedSpot, ReviewInput, SpotSubmissionInput, SpotType } from "../types/domain";

interface ContributePageProps {
  spots: EnrichedSpot[];
  selectedSpotId: string | null;
  onSubmitSpot: (input: SpotSubmissionInput) => Promise<void>;
  onAddReview: (input: ReviewInput) => Promise<void>;
}

// Only show the 3 most useful review metrics
const coreMetrics = metrics.filter((m) =>
  ["vintageDepth", "priceLuck", "vibe"].includes(m.key)
);

export function ContributePage({ spots, selectedSpotId, onSubmitSpot, onAddReview }: ContributePageProps) {
  const [tab, setTab] = useState<"spot" | "review">("spot");
  const [submitted, setSubmitted] = useState<"spot" | "review" | null>(null);

  const [spotForm, setSpotForm] = useState({
    name: "",
    type: "Thrift Store" as SpotType,
    city: "",
    region: "SoCal",
    address: "",
    website: "",
    price: "",
    description: "",
  });

  const [reviewForm, setReviewForm] = useState({
    placeId: selectedSpotId ?? spots[0]?.id ?? "",
    note: "",
    wouldReturn: true,
    vintageDepth: 4,
    priceLuck: 4,
    selectionDepth: 4,
    curation: 4,
    access: 3,
    vibe: 4,
  });

  useEffect(() => {
    if (selectedSpotId) {
      setReviewForm((c) => ({ ...c, placeId: selectedSpotId }));
      setTab("review");
    }
  }, [selectedSpotId]);

  const submitSpot = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmitSpot({
      name: spotForm.name,
      type: spotForm.type,
      city: spotForm.city,
      region: spotForm.region,
      address: spotForm.address,
      website: spotForm.website,
      tags: [],
      price: spotForm.price,
      description: spotForm.description,
      bestFor: "",
    });
    setSpotForm({ name: "", type: "Thrift Store", city: "", region: "SoCal", address: "", website: "", price: "", description: "" });
    setSubmitted("spot");
    setTimeout(() => setSubmitted(null), 4000);
  };

  const submitReview = async (e: FormEvent) => {
    e.preventDefault();
    await onAddReview(reviewForm);
    setReviewForm((c) => ({ ...c, note: "", wouldReturn: true, vintageDepth: 4, priceLuck: 4, selectionDepth: 4, curation: 4, access: 3, vibe: 4 }));
    setSubmitted("review");
    setTimeout(() => setSubmitted(null), 4000);
  };

  return (
    <div className="page-content">
      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          className={`button ${tab === "spot" ? "button-primary" : "button-secondary"}`}
          onClick={() => setTab("spot")}
        >
          + Add a spot
        </button>
        <button
          type="button"
          className={`button ${tab === "review" ? "button-primary" : "button-secondary"}`}
          onClick={() => setTab("review")}
        >
          ★ Leave a review
        </button>
      </div>

      {tab === "spot" && (
        <form className="form-panel surface" onSubmit={submitSpot} style={{ maxWidth: 560 }}>
          <div className="form-header">
            <h3>Know a great thrift spot?</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>
              Submit it for review — our team approves within 48 hours.
            </p>
          </div>

          {submitted === "spot" && (
            <div style={{ padding: "10px 14px", background: "color-mix(in srgb, #16a34a 10%, transparent)", border: "1.5px solid #bbf7d0", borderRadius: 8, fontSize: "0.85rem", color: "#15803d" }}>
              ✓ Spot submitted! We'll review it shortly.
            </div>
          )}

          <div className="form-stack">
            <div className="form-row">
              <div className="form-field">
                <label>Place name *</label>
                <input
                  placeholder="e.g. Jet Rag"
                  value={spotForm.name}
                  onChange={(e) => setSpotForm((c) => ({ ...c, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-field">
                <label>Type</label>
                <select value={spotForm.type} onChange={(e) => setSpotForm((c) => ({ ...c, type: e.target.value as SpotType }))}>
                  <option value="Thrift Store">Thrift Store</option>
                  <option value="Flea Market">Flea Market</option>
                  <option value="Pop-Up">Pop-Up</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>City *</label>
                <input
                  placeholder="e.g. Los Angeles"
                  value={spotForm.city}
                  onChange={(e) => setSpotForm((c) => ({ ...c, city: e.target.value }))}
                  required
                />
              </div>
              <div className="form-field">
                <label>Region</label>
                <select value={spotForm.region} onChange={(e) => setSpotForm((c) => ({ ...c, region: e.target.value }))}>
                  {regionOptions.filter((r) => r !== "All California").map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row single">
              <div className="form-field">
                <label>Address *</label>
                <input
                  placeholder="Street address"
                  value={spotForm.address}
                  onChange={(e) => setSpotForm((c) => ({ ...c, address: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Price range</label>
                <input
                  placeholder="e.g. $5–$50"
                  value={spotForm.price}
                  onChange={(e) => setSpotForm((c) => ({ ...c, price: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label>Website</label>
                <input
                  placeholder="Optional"
                  value={spotForm.website}
                  onChange={(e) => setSpotForm((c) => ({ ...c, website: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-row single">
              <div className="form-field">
                <label>What makes it worth visiting?</label>
                <textarea
                  rows={3}
                  placeholder="Tell other thrifters what to expect..."
                  value={spotForm.description}
                  onChange={(e) => setSpotForm((c) => ({ ...c, description: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="button button-primary" style={{ alignSelf: "flex-start" }}>
            Submit for review →
          </button>
        </form>
      )}

      {tab === "review" && (
        <form className="form-panel surface" onSubmit={submitReview} style={{ maxWidth: 560 }}>
          <div className="form-header">
            <h3>Rate a thrift spot</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>
              Help the community find the best finds.
            </p>
          </div>

          {submitted === "review" && (
            <div style={{ padding: "10px 14px", background: "color-mix(in srgb, #16a34a 10%, transparent)", border: "1.5px solid #bbf7d0", borderRadius: 8, fontSize: "0.85rem", color: "#15803d" }}>
              ✓ Review posted!
            </div>
          )}

          {spots.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No approved spots to review yet.</p>
          ) : (
            <div className="form-stack">
              <div className="form-field">
                <label>Which spot?</label>
                <select
                  value={reviewForm.placeId}
                  onChange={(e) => setReviewForm((c) => ({ ...c, placeId: e.target.value }))}
                >
                  {spots.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {s.city}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Your take</label>
                <textarea
                  rows={3}
                  placeholder="What's the vibe? Any tips for other thrifters?"
                  value={reviewForm.note}
                  onChange={(e) => setReviewForm((c) => ({ ...c, note: e.target.value }))}
                />
              </div>

              <div className="form-field">
                <label>Would you go back?</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className={`button ${reviewForm.wouldReturn ? "button-primary" : "button-secondary"}`}
                    style={{ flex: 1 }}
                    onClick={() => setReviewForm((c) => ({ ...c, wouldReturn: true }))}
                  >
                    👍 Yes, definitely
                  </button>
                  <button
                    type="button"
                    className={`button ${!reviewForm.wouldReturn ? "button-primary" : "button-secondary"}`}
                    style={{ flex: 1 }}
                    onClick={() => setReviewForm((c) => ({ ...c, wouldReturn: false }))}
                  >
                    👎 Probably not
                  </button>
                </div>
              </div>

              <div>
                <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Quick ratings</p>
                <div className="slider-stack">
                  {coreMetrics.map((m) => (
                    <div key={m.key} className="slider-card surface-subtle">
                      <div className="slider-header">
                        <strong>{m.label}</strong>
                        <span className="slider-val">{reviewForm[m.key as keyof typeof reviewForm] as number}/5</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={reviewForm[m.key as keyof typeof reviewForm] as number}
                        onChange={(e) => setReviewForm((c) => ({ ...c, [m.key]: Number(e.target.value) }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="button button-primary" style={{ alignSelf: "flex-start" }}>
            Post review →
          </button>
        </form>
      )}
    </div>
  );
}
