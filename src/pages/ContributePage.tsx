import { useEffect, useState, type FormEvent } from "react";
import { metrics, regionOptions } from "../data/demoData";
import type { EnrichedSpot, ReviewInput, SpotSubmissionInput, SpotType } from "../types/domain";

interface ContributePageProps {
  spots: EnrichedSpot[];
  selectedSpotId: string | null;
  onSubmitSpot: (input: SpotSubmissionInput) => Promise<void>;
  onAddReview: (input: ReviewInput) => Promise<void>;
}

export function ContributePage({ spots, selectedSpotId, onSubmitSpot, onAddReview }: ContributePageProps) {
  const [spotForm, setSpotForm] = useState({
    name: "",
    type: "Thrift Store" as SpotType,
    city: "",
    region: "SoCal",
    address: "",
    website: "",
    tags: "",
    price: "",
    description: "",
    bestFor: "",
    lat: "",
    lng: "",
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
      setReviewForm((current) => ({ ...current, placeId: selectedSpotId }));
    }
  }, [selectedSpotId]);

  const submitSpot = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmitSpot({
      name: spotForm.name,
      type: spotForm.type,
      city: spotForm.city,
      region: spotForm.region,
      address: spotForm.address,
      website: spotForm.website,
      tags: spotForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      price: spotForm.price,
      description: spotForm.description,
      bestFor: spotForm.bestFor,
      lat: spotForm.lat ? Number(spotForm.lat) : undefined,
      lng: spotForm.lng ? Number(spotForm.lng) : undefined,
    });
    setSpotForm({
      name: "",
      type: "Thrift Store",
      city: "",
      region: "SoCal",
      address: "",
      website: "",
      tags: "",
      price: "",
      description: "",
      bestFor: "",
      lat: "",
      lng: "",
    });
  };

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onAddReview(reviewForm);
    setReviewForm((current) => ({
      ...current,
      note: "",
      wouldReturn: true,
      vintageDepth: 4,
      priceLuck: 4,
      selectionDepth: 4,
      curation: 4,
      access: 3,
      vibe: 4,
    }));
  };

  return (
    <div className="contribute-grid">
      <form className="form-panel surface" onSubmit={submitSpot}>
        <div className="panel-head">
          <div>
            <p className="eyebrow">Add a spot</p>
            <h3>Submit a thrift store, flea market, or pop-up</h3>
          </div>
        </div>

        <div className="form-grid">
          <label>
            <span>Name</span>
            <input value={spotForm.name} onChange={(event) => setSpotForm((current) => ({ ...current, name: event.target.value }))} required />
          </label>
          <label>
            <span>Type</span>
            <select value={spotForm.type} onChange={(event) => setSpotForm((current) => ({ ...current, type: event.target.value as SpotType }))}>
              <option value="Thrift Store">Thrift Store</option>
              <option value="Flea Market">Flea Market</option>
              <option value="Pop-Up">Pop-Up</option>
            </select>
          </label>
          <label>
            <span>City</span>
            <input value={spotForm.city} onChange={(event) => setSpotForm((current) => ({ ...current, city: event.target.value }))} required />
          </label>
          <label>
            <span>Region</span>
            <select value={spotForm.region} onChange={(event) => setSpotForm((current) => ({ ...current, region: event.target.value }))}>
              {regionOptions.filter((item) => item !== "All California").map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="full-width">
            <span>Address</span>
            <input value={spotForm.address} onChange={(event) => setSpotForm((current) => ({ ...current, address: event.target.value }))} required />
          </label>
          <label>
            <span>Latitude</span>
            <input value={spotForm.lat} onChange={(event) => setSpotForm((current) => ({ ...current, lat: event.target.value }))} />
          </label>
          <label>
            <span>Longitude</span>
            <input value={spotForm.lng} onChange={(event) => setSpotForm((current) => ({ ...current, lng: event.target.value }))} />
          </label>
          <label>
            <span>Website</span>
            <input value={spotForm.website} onChange={(event) => setSpotForm((current) => ({ ...current, website: event.target.value }))} />
          </label>
          <label>
            <span>Price vibe</span>
            <input value={spotForm.price} onChange={(event) => setSpotForm((current) => ({ ...current, price: event.target.value }))} required />
          </label>
          <label className="full-width">
            <span>Tags</span>
            <input value={spotForm.tags} onChange={(event) => setSpotForm((current) => ({ ...current, tags: event.target.value }))} required />
          </label>
          <label className="full-width">
            <span>Best for</span>
            <input value={spotForm.bestFor} onChange={(event) => setSpotForm((current) => ({ ...current, bestFor: event.target.value }))} required />
          </label>
          <label className="full-width">
            <span>Description</span>
            <textarea rows={4} value={spotForm.description} onChange={(event) => setSpotForm((current) => ({ ...current, description: event.target.value }))} required />
          </label>
        </div>

        <button type="submit" className="button button-primary">
          Submit for approval
        </button>
      </form>

      <form className="form-panel surface" onSubmit={submitReview}>
        <div className="panel-head">
          <div>
            <p className="eyebrow">Leave a review</p>
            <h3>Rate a place like a serious thrifter</h3>
          </div>
        </div>

        <label>
          <span>Place</span>
          <select value={reviewForm.placeId} onChange={(event) => setReviewForm((current) => ({ ...current, placeId: event.target.value }))}>
            {spots.map((spot) => (
              <option key={spot.id} value={spot.id}>
                {spot.name} • {spot.city}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Field note</span>
          <textarea rows={4} value={reviewForm.note} onChange={(event) => setReviewForm((current) => ({ ...current, note: event.target.value }))} />
        </label>

        <label>
          <span>Return verdict</span>
          <select
            value={reviewForm.wouldReturn ? "yes" : "no"}
            onChange={(event) => setReviewForm((current) => ({ ...current, wouldReturn: event.target.value === "yes" }))}
          >
            <option value="yes">Would revisit</option>
            <option value="no">Would skip next time</option>
          </select>
        </label>

        <div className="slider-grid">
          {metrics.map((metric) => (
            <label key={metric.key} className="slider-card surface-subtle">
              <div className="slider-topline">
                <strong>{metric.label}</strong>
                <span>{reviewForm[metric.key]} / 5</span>
              </div>
              <p>{metric.hint}</p>
              <input
                type="range"
                min="1"
                max="5"
                value={reviewForm[metric.key]}
                onChange={(event) =>
                  setReviewForm((current) => ({ ...current, [metric.key]: Number(event.target.value) }))
                }
              />
            </label>
          ))}
        </div>

        <button type="submit" className="button button-primary">
          Post review
        </button>
      </form>
    </div>
  );
}
