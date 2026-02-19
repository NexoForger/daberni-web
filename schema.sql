-- Daberni D1 Database Schema
-- Run this against your D1 database to create the required tables:
--   npx wrangler d1 execute daberni-db --file=./schema.sql

CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  timestamp TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'website'
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  vehicle_year TEXT NOT NULL,
  license_number TEXT NOT NULL,
  years_experience TEXT NOT NULL,
  platforms TEXT NOT NULL DEFAULT '[]',
  availability TEXT NOT NULL,
  additional_info TEXT NOT NULL DEFAULT '',
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
);
