-- PostgreSQL initialization script
-- Enables needed extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable Row Level Security will be done per-table in migrations
