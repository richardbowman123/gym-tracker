-- Gym Tracker: Supabase schema
-- Run this in your Supabase SQL Editor (supabase.com → project → SQL Editor)

CREATE TABLE sets (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
  date TEXT NOT NULL,
  exercise TEXT NOT NULL,
  weight REAL NOT NULL,
  reps REAL NOT NULL,
  assisted REAL DEFAULT 0,
  notes TEXT DEFAULT '',
  created TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own sets" ON sets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sets" ON sets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own sets" ON sets FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users update own sets" ON sets FOR UPDATE USING (auth.uid() = user_id);
