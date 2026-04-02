// === Supabase Cloud Sync for Gym Tracker ===
//
// SETUP: Replace these with your Supabase project values
// (Settings → API in your Supabase dashboard)
const SUPABASE_URL = 'https://xijrjlrlxbajxojgmrjy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2sjH7jMtH7QNHD6yYuX5WA_L4aJKtec';

let db = null;

// ==========================================
// INITIALISATION
// ==========================================

function initSupabase() {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    console.warn('Supabase not configured — running in local-only mode');
    return false;
  }
  db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return true;
}

// ==========================================
// AUTH
// ==========================================

async function supaSignIn(email, password) {
  if (!db) return { error: { message: 'Supabase not configured' } };
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  return { data, error };
}

async function supaSignOut() {
  if (!db) return;
  await db.auth.signOut();
}

async function supaGetUser() {
  if (!db) return null;
  const { data: { user } } = await db.auth.getUser();
  return user;
}

// ==========================================
// SYNC STATUS INDICATOR
// ==========================================

function setSyncStatus(status) {
  // status: 'synced' | 'syncing' | 'offline' | 'error'
  const dot = document.getElementById('sync-dot');
  const label = document.getElementById('sync-label');
  if (!dot || !label) return;

  dot.className = 'sync-dot ' + status;
  const labels = {
    synced: 'Synced',
    syncing: 'Syncing...',
    offline: 'Local only',
    error: 'Sync error',
  };
  label.textContent = labels[status] || '';
}

// ==========================================
// CLOUD DATA FUNCTIONS
// ==========================================

async function fetchAllSets() {
  if (!db) return null;
  setSyncStatus('syncing');
  const { data, error } = await db
    .from('sets')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Fetch error:', error);
    setSyncStatus('error');
    return null;
  }

  // Merge cloud data with local data (never lose local records)
  const localSets = JSON.parse(localStorage.getItem('gym_sets') || '[]');
  const merged = new Map();
  // Add all local records first
  for (const s of localSets) merged.set(s.id, s);
  // Layer cloud records on top (cloud wins if same ID exists in both)
  for (const s of data) merged.set(s.id, s);
  const mergedArray = [...merged.values()].sort((a, b) => a.date.localeCompare(b.date));

  localStorage.setItem('gym_sets', JSON.stringify(mergedArray));
  setSyncStatus('synced');
  return mergedArray;
}

async function pushSet(setData) {
  if (!db) return;
  setSyncStatus('syncing');
  const { error } = await db.from('sets').insert([setData]);
  if (error) {
    console.error('Push error:', error);
    setSyncStatus('error');
  } else {
    setSyncStatus('synced');
  }
}

async function removeSet(id) {
  if (!db) return;
  setSyncStatus('syncing');
  const { error } = await db.from('sets').delete().eq('id', id);
  if (error) {
    console.error('Remove error:', error);
    setSyncStatus('error');
  } else {
    setSyncStatus('synced');
  }
}

async function seedIfEmpty() {
  if (!db) return;

  // Fetch all cloud record IDs so we know what's already uploaded
  const { data: cloudData, error } = await db
    .from('sets')
    .select('id');

  if (error) {
    console.error('Seed check error:', error);
    return;
  }

  const cloudIds = new Set((cloudData || []).map(r => r.id));
  const localSets = JSON.parse(localStorage.getItem('gym_sets') || '[]');

  // Find local records that aren't in the cloud yet
  const missing = localSets.filter(s => !cloudIds.has(s.id));
  if (missing.length === 0) return; // Everything is already synced

  setSyncStatus('syncing');
  // Upload in batches of 50 to avoid request size limits
  for (let i = 0; i < missing.length; i += 50) {
    const batch = missing.slice(i, i + 50).map(s => ({
      id: s.id,
      date: s.date,
      exercise: s.exercise,
      weight: s.weight,
      reps: s.reps,
      assisted: s.assisted || 0,
      notes: s.notes || '',
      created: s.created || new Date().toISOString(),
    }));
    const { error: insertError } = await db.from('sets').insert(batch);
    if (insertError) {
      console.error('Seed batch error:', insertError);
      setSyncStatus('error');
      return;
    }
  }
  setSyncStatus('synced');
  console.log(`Uploaded ${missing.length} local records to cloud`);
}

// ==========================================
// LOGIN UI
// ==========================================

function showLoginOverlay() {
  document.getElementById('login-overlay').classList.remove('hidden');
}

function hideLoginOverlay() {
  document.getElementById('login-overlay').classList.add('hidden');
}

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');

  if (!email || !password) {
    errorEl.textContent = 'Enter your email and password';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Signing in...';
  errorEl.textContent = '';

  const { data, error } = await supaSignIn(email, password);

  if (error) {
    errorEl.textContent = error.message;
    btn.disabled = false;
    btn.textContent = 'Sign In';
    return;
  }

  hideLoginOverlay();
  await startApp();
}

async function handleLogout() {
  await supaSignOut();
  location.reload();
}

// ==========================================
// APP STARTUP (called on page load)
// ==========================================

async function startApp() {
  // Always ensure seed/historic data is in localStorage first
  // (initSeedData only adds if localStorage is empty)
  initSeedData();

  // Upload any local-only records to the cloud
  await seedIfEmpty();

  // Merge cloud data with local data (never overwrites)
  await fetchAllSets();

  // Now run the main app init from app.js
  init();
}

document.addEventListener('DOMContentLoaded', async () => {
  const configured = initSupabase();

  if (!configured) {
    // No Supabase — just run locally as before
    setSyncStatus('offline');
    init();
    return;
  }

  // Check if already logged in (session persists)
  const user = await supaGetUser();
  if (user) {
    hideLoginOverlay();
    await startApp();
  } else {
    showLoginOverlay();
    // init() will be called after login
  }
});
