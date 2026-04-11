-- Add upvote count to trips table for community feature
ALTER TABLE trips ADD COLUMN upvote_count integer NOT NULL DEFAULT 0;

-- Index for community query (public trips sorted by upvotes)
CREATE INDEX idx_trips_community ON trips (is_public, upvote_count DESC) WHERE is_public = true;
