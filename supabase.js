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

  // Overwrite localStorage with cloud data
  localStorage.setItem('gym_sets', JSON.stringify(data));
  setSyncStatus('synced');
  return data;
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
  // Check if user already has cloud data
  const { count, error } = await db
    .from('sets')
    .select('id', { count: 'exact', head: true });

  if (error) {
    console.error('Seed check error:', error);
    return;
  }

  if (count > 0) return; // Already has data in the cloud

  // Upload seed data from localStorage
  const localSets = JSON.parse(localStorage.getItem('gym_sets') || '[]');
  if (localSets.length === 0) return;

  setSyncStatus('syncing');
  // Upload in batches of 50 to avoid request size limits
  for (let i = 0; i < localSets.length; i += 50) {
    const batch = localSets.slice(i, i + 50).map(s => ({
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
  console.log(`Seeded ${localSets.length} sets to cloud`);
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
  // Fetch cloud data, then seed if this is a first-time user
  await fetchAllSets();
  await seedIfEmpty();
  // If seeding happened, re-fetch to get server-side defaults
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
