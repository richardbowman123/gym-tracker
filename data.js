// === Exercise Definitions ===
const EXERCISES = {
  'fb-free':       { name: 'Flat Bench Press',     equipment: 'Free Bar',       group: 'Chest',     convention: 'total' },
  'fb-smith':      { name: 'Flat Bench Press',     equipment: 'Smith Machine',  group: 'Chest',     convention: 'total' },
  'fb-db':         { name: 'Flat Bench Press',     equipment: 'Dumbbells',      group: 'Chest',     convention: 'per_hand' },
  'ib-free':       { name: 'Incline Bench Press',  equipment: 'Free Bar',       group: 'Chest',     convention: 'total' },
  'ib-smith':      { name: 'Incline Bench Press',  equipment: 'Smith Machine',  group: 'Chest',     convention: 'total' },
  'ib-db':         { name: 'Incline Bench Press',  equipment: 'Dumbbells',      group: 'Chest',     convention: 'per_hand' },
  'cable-fly':     { name: 'Cable Flies',          equipment: 'Cable',          group: 'Chest',     convention: 'per_hand' },
  'db-fly':        { name: 'Dumbbell Flies',       equipment: 'Dumbbells',      group: 'Chest',     convention: 'per_hand' },
  'sp-db':         { name: 'Shoulder Press',       equipment: 'Dumbbells',      group: 'Shoulders', convention: 'per_hand' },
  'sp-smith':      { name: 'Shoulder Press',       equipment: 'Smith Machine',  group: 'Shoulders', convention: 'total' },
  'lat-raise':     { name: 'Lateral Raises',       equipment: 'Dumbbells',      group: 'Shoulders', convention: 'per_hand' },
  'rear-delt':     { name: 'Rear Delt Flies',      equipment: 'Dumbbells',      group: 'Shoulders', convention: 'per_hand' },
  'squat':         { name: 'Back Squat',           equipment: 'Free Bar',       group: 'Legs',      convention: 'total' },
  'front-squat':   { name: 'Front Squat',          equipment: 'Free Bar',       group: 'Legs',      convention: 'total' },
  'rdl-bar':       { name: 'RDL',                  equipment: 'Free Bar',       group: 'Legs',      convention: 'total' },
  'leg-press':     { name: 'Leg Press',            equipment: 'Machine',        group: 'Legs',      convention: 'plate_load' },
  'lunges':        { name: 'Walking Lunges',       equipment: 'Dumbbells',      group: 'Legs',      convention: 'per_hand' },
  'hip-thrust':    { name: 'Hip Thrust',           equipment: 'Machine',        group: 'Legs',      convention: 'total' },
  'lat-pull':      { name: 'Lat Pulldown',         equipment: 'Cable',          group: 'Back',      convention: 'total' },
  'pullups':       { name: 'Pull-ups',             equipment: 'Bodyweight',     group: 'Back',      convention: 'bodyweight' },
  'bicep-bar':     { name: 'Bicep Curl',           equipment: 'Pre-loaded Bar', group: 'Arms',      convention: 'total' },
  'bicep-incline': { name: 'Bicep Curl (Incline)', equipment: 'Dumbbells',      group: 'Arms',      convention: 'per_hand' },
  'forearm-bar':   { name: 'Forearm Curl',         equipment: 'Pre-loaded Bar', group: 'Arms',      convention: 'total' },
  'tri-push':      { name: 'Tricep Pushdown',      equipment: 'Cable',          group: 'Arms',      convention: 'total' },
  'tri-over':      { name: 'Tricep Overhead Ext',   equipment: 'Cable',          group: 'Arms',      convention: 'total' },
  'ab-bosu':       { name: 'Ab Crunch (BOSU)',     equipment: 'Weighted',       group: 'Core',      convention: 'total' },
  'dips':          { name: 'Dips',                 equipment: 'Bodyweight',     group: 'Core',      convention: 'bodyweight' },
  'lsit':          { name: 'L-sit',                equipment: 'Bodyweight',     group: 'Core',      convention: 'time' },
};

const MUSCLE_GROUPS = ['Chest', 'Shoulders', 'Legs', 'Back', 'Arms', 'Core'];

// === Goals ===
const GOALS = [
  { exercise: 'squat',   targetWeight: 140, targetReps: 3,  label: '140kg squat (3RM)',            year: 2026 },
  { exercise: 'fb-free', targetWeight: 100, targetReps: 3,  label: '100kg free bar bench (3RM)',   year: 2026 },
  { exercise: 'sp-db',   targetWeight: 32,  targetReps: 10, label: '32kg shoulder press (10RM)',   year: 2026 },
];

// === Seed Data ===
// Format: [date, exerciseKey, weight, reps, assistedReps, notes]
const SEED_DATA = [
  // ==================== 2024 ====================

  // ~1 Mar 2024 — Smith flat bench pyramid PB
  ['2024-03-01', 'fb-smith', 30, 15, 0, ''],
  ['2024-03-01', 'fb-smith', 40, 15, 0, ''],
  ['2024-03-01', 'fb-smith', 50, 15, 0, ''],
  ['2024-03-01', 'fb-smith', 60, 9, 0, ''],
  ['2024-03-01', 'cable-fly', 5, 10, 0, 'Between bench sets'],

  // ~8 Mar 2024 — Smith "next time"
  ['2024-03-08', 'fb-smith', 70, 3, 0, ''],
  ['2024-03-08', 'fb-smith', 70, 1, 0, ''],

  // 14 Mar 2024 — Triple PB day
  ['2024-03-14', 'ib-db', 30, 6, 0, 'PB'],
  ['2024-03-14', 'bicep-incline', 20, 2.5, 0, 'PB'],
  ['2024-03-14', 'sp-db', 24, 5, 0, 'PB'],

  // 22 Mar 2024
  ['2024-03-22', 'sp-db', 26, 5, 0, ''],
  ['2024-03-22', 'ib-db', 30, 5, 0, ''],
  ['2024-03-22', 'ib-db', 30, 5, 0, ''],
  ['2024-03-22', 'bicep-incline', 18, 5, 0, ''],
  ['2024-03-22', 'tri-push', 35, 5, 0, 'Rope pulldown'],

  // 5 Apr 2024
  ['2024-04-05', 'ib-db', 30, 5, 0, ''],
  ['2024-04-05', 'ib-db', 30, 5, 0, ''],
  ['2024-04-05', 'sp-db', 26, 5, 0, ''],

  // 28 Apr 2024 — Smith progression
  ['2024-04-28', 'fb-smith', 60, 10, 0, ''],
  ['2024-04-28', 'fb-smith', 70, 3, 0, ''],

  // 15 Jun 2024
  ['2024-06-15', 'fb-smith', 60, 10, 0, ''],
  ['2024-06-15', 'fb-smith', 70, 4, 0, ''],
  ['2024-06-15', 'fb-smith', 70, 2, 0, ''],

  // 20 Jul 2024 — Shoulder focus block start
  ['2024-07-20', 'sp-db', 14, 15, 0, ''],
  ['2024-07-20', 'sp-db', 18, 15, 0, ''],
  ['2024-07-20', 'sp-db', 22, 10, 0, ''],
  ['2024-07-20', 'sp-db', 24, 8, 0, ''],
  ['2024-07-20', 'sp-db', 14, 8, 0, 'Drop set'],

  // ~1 Sep 2024
  ['2024-09-01', 'rdl-bar', 80, 10, 0, ''],
  ['2024-09-01', 'fb-db', 32, 9, 0, 'First time at 32kg?'],

  // 5 Nov 2024 — Incline DB pyramid
  ['2024-11-05', 'ib-db', 18, 15, 0, ''],
  ['2024-11-05', 'ib-db', 22, 15, 0, ''],
  ['2024-11-05', 'ib-db', 24, 15, 0, ''],
  ['2024-11-05', 'ib-db', 26, 10, 0, ''],

  // ~15 Nov 2024 — Session A (solo)
  ['2024-11-15', 'ib-db', 32, 5, 0, ''],
  ['2024-11-15', 'ib-db', 32, 4, 0, ''],
  ['2024-11-15', 'fb-db', 32, 8, 0, ''],
  ['2024-11-15', 'squat', 80, 10, 0, ''],
  ['2024-11-15', 'squat', 100, 3, 0, ''],

  // ~20 Nov 2024 — Session B (class with Seth)
  ['2024-11-20', 'fb-free', 80, 4, 2, 'With Seth in class'],
  ['2024-11-20', 'fb-db', 32, 10, 0, ''],
  ['2024-11-20', 'fb-db', 32, 8, 0, ''],

  // ==================== 2025 ====================

  // ~5 Mar 2025 — Return from 2 months off + broken finger
  ['2025-03-05', 'ib-db', 24, 5, 0, 'Return from injury'],
  ['2025-03-05', 'ib-db', 26, 5, 0, ''],
  ['2025-03-05', 'ib-db', 28, 5, 0, ''],
  ['2025-03-05', 'ib-db', 30, 5, 0, ''],
  ['2025-03-05', 'ib-db', 32, 5, 0, ''],
  ['2025-03-05', 'fb-db', 24, 5, 0, ''],
  ['2025-03-05', 'fb-db', 26, 5, 0, ''],
  ['2025-03-05', 'fb-db', 28, 5, 0, ''],
  ['2025-03-05', 'fb-db', 30, 5, 0, ''],
  ['2025-03-05', 'fb-db', 32, 5, 0, ''],
  ['2025-03-05', 'sp-db', 26, 7, 0, ''],

  // 23 Mar 2025 — Sunday 5x5 session
  ['2025-03-23', 'ib-db', 22, 5, 0, ''],
  ['2025-03-23', 'ib-db', 26, 5, 0, ''],
  ['2025-03-23', 'ib-db', 30, 5, 0, ''],
  ['2025-03-23', 'ib-db', 32, 5, 0, ''],
  ['2025-03-23', 'ib-db', 32, 5, 0, ''],
  ['2025-03-23', 'db-fly', 12.5, 5, 0, ''],
  ['2025-03-23', 'sp-db', 18, 5, 0, ''],
  ['2025-03-23', 'sp-db', 20, 5, 0, ''],
  ['2025-03-23', 'sp-db', 24, 5, 0, ''],
  ['2025-03-23', 'sp-db', 26, 5, 0, ''],
  ['2025-03-23', 'sp-db', 28, 5, 0, 'PB'],
  ['2025-03-23', 'lat-raise', 8, 10, 0, ''],
  ['2025-03-23', 'bicep-incline', 14, 10, 0, ''],
  ['2025-03-23', 'bicep-incline', 14, 10, 0, ''],
  ['2025-03-23', 'bicep-incline', 14, 10, 0, ''],

  // 3 Apr 2025
  ['2025-04-03', 'ib-db', 32, 10, 0, 'Set 2'],

  // 14 Apr 2025
  ['2025-04-14', 'squat', 100, 3, 0, ''],
  ['2025-04-14', 'squat', 100, 5, 0, ''],
  ['2025-04-14', 'sp-db', 28, 7, 0, 'PB'],

  // 17 Apr 2025
  ['2025-04-17', 'squat', 100, 5, 0, ''],
  ['2025-04-17', 'squat', 100, 3, 0, ''],
  ['2025-04-17', 'squat', 100, 5, 0, ''],
  ['2025-04-17', 'fb-smith', 95, 1, 0, ''],
  ['2025-04-17', 'leg-press', 220, 14, 0, ''],
  ['2025-04-17', 'leg-press', 260, 8, 0, 'PB'],

  // 21 Apr 2025
  ['2025-04-21', 'squat', 110, 3, 1, 'Help on 3rd rep'],
  ['2025-04-21', 'squat', 110, 3, 1, 'Help on 3rd rep'],

  // 27 Apr 2025
  ['2025-04-27', 'sp-db', 28, 5, 0, ''],
  ['2025-04-27', 'sp-db', 30, 3, 0, 'PB — first at 30kg'],

  // 2 May 2025
  ['2025-05-02', 'fb-smith', 100.5, 1, 0, 'PB'],
  ['2025-05-02', 'sp-db', 30, 5, 0, 'PB'],

  // 6 May 2025
  ['2025-05-06', 'dips', 0, 10, 0, 'Bodyweight'],
  ['2025-05-06', 'dips', 0, 10, 0, ''],
  ['2025-05-06', 'dips', 0, 10, 0, ''],
  ['2025-05-06', 'dips', 0, 10, 0, ''],

  // 12 May 2025
  ['2025-05-12', 'squat', 100, 6, 0, ''],
  ['2025-05-12', 'squat', 100, 6, 0, ''],

  // 16 May 2025
  ['2025-05-16', 'sp-db', 30, 4.5, 0, 'PB'],

  // 18 May 2025
  ['2025-05-18', 'fb-smith', 85, 5, 0, ''],
  ['2025-05-18', 'sp-db', 30, 5, 0, 'No help'],

  // 19 May 2025
  ['2025-05-19', 'squat', 100, 10, 0, 'PB — first 10 reps'],

  // 20 May 2025
  ['2025-05-20', 'ib-free', 70, 6, 0, 'Approx reps'],
  ['2025-05-20', 'fb-free', 80, 6, 0, 'Approx reps'],

  // 22 May 2025
  ['2025-05-22', 'squat', 110, 5, 0, 'PB'],

  // 9 Jun 2025
  ['2025-06-09', 'rdl-bar', 101, 10, 0, 'PB'],

  // 26 Jun 2025
  ['2025-06-26', 'squat', 100, 10, 0, ''],
  ['2025-06-26', 'squat', 110, 4, 0, ''],

  // 27 Jun 2025
  ['2025-06-27', 'ib-smith', 75, 5, 0, ''],
  ['2025-06-27', 'ib-smith', 85, 3, 0, ''],

  // 29 Jun 2025
  ['2025-06-29', 'ib-db', 32, 10, 0, ''],
  ['2025-06-29', 'ib-db', 32, 6, 0, ''],
  ['2025-06-29', 'ib-db', 32, 6, 0, ''],
  ['2025-06-29', 'fb-smith', 95, 3, 0, ''],

  // 1 Jul 2025
  ['2025-07-01', 'fb-free', 60, 10, 0, 'Warmup'],
  ['2025-07-01', 'fb-free', 70, 10, 0, 'Warmup'],
  ['2025-07-01', 'fb-free', 80, 10, 0, 'Warmup'],
  ['2025-07-01', 'fb-free', 90, 3, 3, '3 more with help'],
  ['2025-07-01', 'sp-db', 26, 9.5, 0, ''],

  // 3 Jul 2025
  ['2025-07-03', 'fb-smith', 95, 5, 2, '2 with help'],
  ['2025-07-03', 'fb-smith', 105, 2, 2, 'Both assisted'],
  ['2025-07-03', 'squat', 110, 8, 0, 'PB'],

  // 20 Jul 2025
  ['2025-07-20', 'ib-db', 32, 9, 0, ''],
  ['2025-07-20', 'fb-smith', 93, 3, 0, ''],
  ['2025-07-20', 'fb-smith', 100, 1, 0, ''],
  ['2025-07-20', 'sp-db', 30, 5, 0, 'PB'],

  // 21 Jul 2025
  ['2025-07-21', 'squat', 120, 3, 0, 'PB — first at 120kg'],

  // 22 Jul 2025
  ['2025-07-22', 'fb-free', 80, 6, 0, 'Holding back'],
  ['2025-07-22', 'fb-free', 90, 2.5, 0, ''],

  // 24 Jul 2025
  ['2025-07-24', 'squat', 120, 3, 0, ''],
  ['2025-07-24', 'squat', 120, 4, 0, 'PB'],

  // 27 Jul 2025
  ['2025-07-27', 'fb-smith', 93, 3, 0, ''],
  ['2025-07-27', 'fb-smith', 100.5, 0, 0, 'Failed'],

  // 29 Jul 2025
  ['2025-07-29', 'fb-free', 90, 5, 0, ''],

  // 1 Aug 2025
  ['2025-08-01', 'sp-smith', 63, 5, 0, ''],
  ['2025-08-01', 'sp-smith', 68, 2, 0, 'To failure'],

  // 17 Aug 2025
  ['2025-08-17', 'ib-smith', 75, 10, 0, ''],
  ['2025-08-17', 'ib-smith', 85, 3, 0, ''],
  ['2025-08-17', 'fb-smith', 85, 8, 0, ''],
  ['2025-08-17', 'fb-smith', 85, 3, 0, 'Slow/controlled'],
  ['2025-08-17', 'fb-smith', 95, 2.5, 0, ''],

  // 19 Aug 2025
  ['2025-08-19', 'ib-free', 70, 6, 6, 'All assisted'],
  ['2025-08-19', 'ib-free', 80, 5, 5, 'All assisted'],

  // 21 Aug 2025
  ['2025-08-21', 'ib-db', 32, 10, 0, ''],
  ['2025-08-21', 'ib-db', 32, 10, 0, ''],
  ['2025-08-21', 'ib-db', 32, 10, 0, ''],
  ['2025-08-21', 'fb-smith', 95, 3, 0, ''],
  ['2025-08-21', 'fb-smith', 95, 3, 0, ''],
  ['2025-08-21', 'fb-smith', 95, 4.5, 0, ''],

  // 24 Aug 2025
  ['2025-08-24', 'leg-press', 200, 15, 0, ''],
  ['2025-08-24', 'leg-press', 200, 15, 0, ''],

  // 26 Aug 2025
  ['2025-08-26', 'fb-free', 90, 4, 0, ''],
  ['2025-08-26', 'fb-free', 90, 5, 3, 'Last 3 slightly assisted'],
  ['2025-08-26', 'sp-smith', 65, 3, 0, ''],

  // 28 Aug 2025
  ['2025-08-28', 'fb-smith', 100, 2, 0, 'PB'],
  ['2025-08-28', 'fb-smith', 100, 2.5, 0, ''],
  ['2025-08-28', 'fb-smith', 100, 1, 0, ''],

  // 30 Aug 2025
  ['2025-08-30', 'fb-smith', 100, 3, 0, 'PB'],
  ['2025-08-30', 'fb-smith', 100, 2.5, 0, ''],

  // 2 Sep 2025 — FIRST 100kg on free bar
  ['2025-09-02', 'fb-free', 100, 1, 0, 'PB — first 100kg on free bar!'],

  // 4 Sep 2025 — 2025 shoulder goal achieved!
  ['2025-09-04', 'sp-db', 32, 4, 0, 'PB — 2025 goal achieved!'],
  ['2025-09-04', 'sp-db', 32, 3, 0, ''],

  // 11 Sep 2025
  ['2025-09-11', 'fb-smith', 95, 5, 0, 'Logged as 95 (was unsure if 95 or 100)'],
  ['2025-09-11', 'fb-smith', 95, 3, 0, ''],

  // 28 Sep 2025
  ['2025-09-28', 'fb-smith', 105, 1, 0, 'PB'],

  // 30 Sep 2025
  ['2025-09-30', 'ib-free', 70, 5, 0, ''],
  ['2025-09-30', 'ib-free', 70, 4, 0, ''],

  // 2 Oct 2025
  ['2025-10-02', 'fb-smith', 95, 5, 0, ''],

  // 5 Oct 2025
  ['2025-10-05', 'ib-smith', 95, 2, 0, ''],
  ['2025-10-05', 'fb-smith', 95, 4, 0, ''],
  ['2025-10-05', 'fb-smith', 100, 2, 0, ''],

  // 9 Oct 2025
  ['2025-10-09', 'fb-smith', 95, 4, 0, ''],
  ['2025-10-09', 'fb-smith', 105, 1, 0, ''],

  // 12 Oct 2025
  ['2025-10-12', 'fb-smith', 100, 2, 0, ''],
  ['2025-10-12', 'fb-smith', 100, 1, 0, ''],
  ['2025-10-12', 'fb-smith', 100, 2, 0, ''],
  ['2025-10-12', 'fb-smith', 100, 2, 0, ''],

  // 13 Oct 2025
  ['2025-10-13', 'fb-smith', 95, 3, 0, ''],
  ['2025-10-13', 'fb-smith', 95, 3, 0, ''],
  ['2025-10-13', 'fb-smith', 95, 4, 0, ''],

  // 16 Oct 2025
  ['2025-10-16', 'fb-smith', 100, 2.5, 0, ''],
  ['2025-10-16', 'leg-press', 240, 10, 0, ''],

  // 19 Oct 2025
  ['2025-10-19', 'fb-smith', 100, 3, 0, ''],

  // 27 Oct 2025 — After Vienna
  ['2025-10-27', 'fb-smith', 100, 3, 0, 'After Vienna'],
  ['2025-10-27', 'fb-smith', 100, 3, 0, ''],
  ['2025-10-27', 'fb-smith', 105, 1, 0, ''],
  ['2025-10-27', 'fb-smith', 110, 0.3, 0, 'Barely moved'],

  // 7 Nov 2025 — Filmed!
  ['2025-11-07', 'sp-db', 32, 4, 0, 'PB — filmed!'],

  // 9 Nov 2025 — First time using rack solo
  ['2025-11-09', 'fb-free', 90, 3, 0, 'First time setting up rack solo'],
  ['2025-11-09', 'fb-free', 90, 3, 0, ''],
  ['2025-11-09', 'fb-free', 90, 4, 0, ''],
  ['2025-11-09', 'sp-db', 32, 4, 0, ''],

  // 10 Nov 2025
  ['2025-11-10', 'squat', 110, 3, 0, ''],
  ['2025-11-10', 'squat', 120, 3, 0, ''],

  // 11 Nov 2025 — THE BIG ATTEMPT
  ['2025-11-11', 'fb-free', 100, 1, 0, 'BIG ATTEMPT — only 100kg free bar rep of 2025'],
  ['2025-11-11', 'fb-free', 100, 2, 2, 'With help'],

  // 13 Nov 2025
  ['2025-11-13', 'fb-free', 80, 9, 0, ''],
  ['2025-11-13', 'fb-free', 80, 9, 0, ''],
  ['2025-11-13', 'fb-free', 80, 9, 0, ''],
  ['2025-11-13', 'squat', 110, 5, 0, ''],

  // 16 Nov 2025
  ['2025-11-16', 'fb-smith', 95, 3, 0, ''],
  ['2025-11-16', 'fb-smith', 105, 1, 0, ''],

  // 20 Nov 2025
  ['2025-11-20', 'fb-smith', 100, 3, 0, ''],

  // 8 Dec 2025 — 1-2-1 with Seth
  ['2025-12-08', 'squat', 120, 3, 0, '1-2-1 with Seth'],
  ['2025-12-08', 'front-squat', 70, 3, 0, 'PB'],
  ['2025-12-08', 'rdl-bar', 100, 10, 0, ''],
  ['2025-12-08', 'rdl-bar', 120, 3, 0, 'PB'],

  // 16 Dec 2025
  ['2025-12-16', 'fb-free', 100, 0, 0, 'Failed!'],

  // 22 Dec 2025 — 1-2-1 with Seth — ALL-TIME SQUAT PB
  ['2025-12-22', 'squat', 125, 3, 0, 'PB — all-time best! 1-2-1 with Seth'],
  ['2025-12-22', 'rdl-bar', 100, 3, 0, 'Good form'],
  ['2025-12-22', 'rdl-bar', 100, 2, 0, 'Good form'],

  // ==================== 2026 ====================

  // 12 Jan 2026 — Mega Monday
  ['2026-01-12', 'fb-free', 80, 10, 0, 'Mega Monday'],
  ['2026-01-12', 'fb-free', 90, 5, 0, 'No spotter'],
  ['2026-01-12', 'fb-free', 90, 3, 0, ''],
  ['2026-01-12', 'fb-free', 90, 3, 0, ''],
  ['2026-01-12', 'squat', 100, 10, 0, ''],
  ['2026-01-12', 'squat', 110, 8, 0, 'PB'],
  ['2026-01-12', 'squat', 70, 15, 0, 'Drop set'],

  // 15 Jan 2026 — Right quad tore
  ['2026-01-15', 'squat', 120, 5, 0, 'PB — then right quad tore'],
  ['2026-01-15', 'squat', 120, 3, 0, ''],

  // 16 Jan 2026
  ['2026-01-16', 'ib-db', 32, 10, 0, 'PB'],

  // 18 Jan 2026
  ['2026-01-18', 'fb-free', 90, 4, 0, ''],
  ['2026-01-18', 'fb-free', 90, 3, 0, ''],
  ['2026-01-18', 'fb-free', 90, 4, 0, ''],
  ['2026-01-18', 'fb-free', 90, 3, 0, ''],

  // 20 Jan 2026
  ['2026-01-20', 'fb-free', 90, 5, 1, 'Last rep assisted by Seth'],
  ['2026-01-20', 'fb-free', 90, 5, 1, 'Last rep assisted by Seth'],

  // 22 Jan 2026
  ['2026-01-22', 'fb-smith', 95, 5, 0, ''],
  ['2026-01-22', 'fb-smith', 95, 4, 0, ''],

  // 24 Jan 2026
  ['2026-01-24', 'ib-free', 70, 10, 0, 'No spotter'],

  // 5 Feb 2026 — Back to squats after quad injury
  ['2026-02-05', 'squat', 100, 8, 0, 'First squats back after quad'],
  ['2026-02-05', 'squat', 100, 8, 0, ''],

  // 7 Feb 2026
  ['2026-02-07', 'fb-free', 80, 10, 0, 'No spotter'],
  ['2026-02-07', 'fb-free', 90, 5, 0, 'No spotter'],

  // ~8-9 Feb: Lumbar puncture. No training until March.

  // 2 Mar 2026 — First session back after LP
  ['2026-03-02', 'squat', 100, 5, 0, 'First session back after LP'],
  ['2026-03-02', 'rdl-bar', 80, 10, 0, ''],

  // 5 Mar 2026
  ['2026-03-05', 'fb-smith', 95, 6, 0, ''],
  ['2026-03-05', 'fb-smith', 105, 2, 0, ''],
  ['2026-03-05', 'squat', 100, 10, 0, ''],

  // 19 Mar 2026
  ['2026-03-19', 'fb-free', 90, 2, 0, 'Coming back from LP'],
  ['2026-03-19', 'squat', 100, 10, 0, ''],

  // 22 Mar 2026
  ['2026-03-22', 'fb-smith', 95, 5, 0, ''],

  // 26 Mar 2026
  ['2026-03-26', 'ib-db', 32, 10, 0, ''],
  ['2026-03-26', 'ib-db', 32, 10, 0, ''],
  ['2026-03-26', 'db-fly', 12.5, 10, 0, 'Between press sets'],
  ['2026-03-26', 'sp-db', 28, 7, 0, ''],
  ['2026-03-26', 'squat', 100, 10, 0, ''],
  ['2026-03-26', 'squat', 110, 5, 0, 'First time in a while, quite easy'],

  // 30 Mar 2026
  ['2026-03-30', 'squat', 100, 10, 0, ''],
  ['2026-03-30', 'squat', 110, 5, 0, ''],
  ['2026-03-30', 'squat', 120, 3, 0, ''],
];

// === Injury Timeline ===
const INJURIES = [
  { date: '2024-03-01', description: 'Physio: weak left hamstring, weak right-side-down side plank' },
  { date: '2025-01-01', end: '2025-03-05', description: '2 months off — travelling + broken finger' },
  { date: '2026-01-15', description: 'Right quad tore during 120kg squats' },
  { date: '2026-02-08', end: '2026-03-02', description: 'Lumbar puncture — major headaches, 3 weeks off' },
];
