// === Gym Tracker App ===

const STORAGE_KEY = 'gym_sets';
const PREFS_KEY = 'gym_prefs';
let currentChart = null;
let currentChartData = [];

// ==========================================
// DATA LAYER
// ==========================================

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

function getAllSets() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveSets(sets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
}

function addSet(setData) {
  const sets = getAllSets();
  const newSet = { id: generateId(), created: new Date().toISOString(), ...setData };
  sets.push(newSet);
  saveSets(sets);
  return newSet;
}

function deleteSet(id) {
  const sets = getAllSets().filter(s => s.id !== id);
  saveSets(sets);
}

function getPrefs() {
  const raw = localStorage.getItem(PREFS_KEY);
  return raw ? JSON.parse(raw) : { recentExercises: [], lastWeights: {} };
}

function savePrefs(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

function initSeedData() {
  if (getAllSets().length > 0) return; // Already has data
  const sets = SEED_DATA.map(row => ({
    id: generateId() + Math.random().toString(36).substr(2, 3),
    date: row[0],
    exercise: row[1],
    weight: row[2],
    reps: row[3],
    assisted: row[4] || 0,
    notes: row[5] || '',
    created: row[0] + 'T12:00:00Z',
  }));
  saveSets(sets);
}

// ==========================================
// NAVIGATION
// ==========================================

function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tabName).classList.add('active');
  document.querySelector(`.nav-btn[data-tab="${tabName}"]`).classList.add('active');

  if (tabName === 'home') renderHomeTab();
  else if (tabName === 'log') renderLogTab();
  else if (tabName === 'history') renderHistoryTab();
  else if (tabName === 'charts') renderChartsTab();
  else if (tabName === 'goals') renderGoalsTab();
}

// ==========================================
// HOME TAB
// ==========================================

function renderHomeTab() {
  const allSets = getAllSets();

  // --- Status: days since last session ---
  const dates = [...new Set(allSets.map(s => s.date))].sort();
  const lastDate = dates.length > 0 ? dates[dates.length - 1] : null;
  let daysSince = '—';
  let statusColor = 'var(--text)';
  let statusLabel = 'No sessions logged yet';
  let lastSessionStr = '';

  if (lastDate) {
    daysSince = Math.floor((new Date() - new Date(lastDate)) / (1000 * 60 * 60 * 24));
    if (daysSince === 0) { statusLabel = "You trained today"; statusColor = 'var(--green)'; }
    else if (daysSince === 1) { statusLabel = "day since last session"; statusColor = 'var(--green)'; }
    else if (daysSince <= 3) { statusLabel = "days since last session"; statusColor = 'var(--accent)'; }
    else if (daysSince <= 7) { statusLabel = "days since last session"; statusColor = 'var(--orange)'; }
    else { statusLabel = "days since last session"; statusColor = 'var(--red)'; }

    // Last session summary
    const lastSets = allSets.filter(s => s.date === lastDate);
    const exercises = [...new Set(lastSets.map(s => {
      const ex = EXERCISES[s.exercise];
      return ex ? ex.name : s.exercise;
    }))];
    lastSessionStr = `${formatDate(lastDate)} — ${exercises.slice(0, 3).join(', ')}`;
  }

  document.getElementById('home-status').innerHTML = `
    <div class="home-status">
      ${daysSince === '—' || daysSince === 0 ? '' : `<div class="home-status-days" style="color:${statusColor}">${daysSince}</div>`}
      <div class="home-status-label">${statusLabel}</div>
      ${lastSessionStr ? `<div class="home-status-last">${lastSessionStr}</div>` : ''}
    </div>
  `;

  // --- 4 action cards ---
  const sessionCount = dates.length;
  document.getElementById('home-grid').innerHTML = `
    <div class="home-card log-card" onclick="showTab('log')">
      <div class="home-card-icon">+</div>
      <div class="home-card-title">Log</div>
    </div>
    <div class="home-card hist-card" onclick="showTab('history')">
      <div class="home-card-icon">&#9776;</div>
      <div class="home-card-title">History</div>
    </div>
    <div class="home-card chart-card" onclick="showTab('charts')">
      <div class="home-card-icon">&#9650;</div>
      <div class="home-card-title">Charts</div>
    </div>
    <div class="home-card goals-card" onclick="showTab('goals')">
      <div class="home-card-icon">&#9733;</div>
      <div class="home-card-title">Goals</div>
    </div>
  `;

  // --- Mini goal progress ---
  const goalsHtml = GOALS.map(goal => {
    const exerciseSets = allSets.filter(s => s.exercise === goal.exercise);
    const cleanSets = exerciseSets.filter(s => {
      const cr = s.reps - (s.assisted || 0);
      return cr > 0 && s.weight > 0;
    });

    let progress = 0;
    if (cleanSets.length > 0) {
      let bestE1RM = 0;
      cleanSets.forEach(s => {
        const cr = s.reps - (s.assisted || 0);
        const e = epleyE1RM(s.weight, cr);
        if (e > bestE1RM) bestE1RM = e;
      });
      const estNRM = epleyWeightAtReps(bestE1RM, goal.targetReps);
      progress = Math.min(100, (estNRM / goal.targetWeight) * 100);
    }

    let barColor = 'var(--accent)';
    if (progress >= 100) barColor = 'var(--green)';
    else if (progress >= 85) barColor = 'var(--accent)';
    else if (progress >= 65) barColor = 'var(--orange)';
    else barColor = 'var(--red)';

    return `
      <div class="home-goal-row">
        <span class="home-goal-label">${goal.label}</span>
        <div class="home-goal-bar"><div class="home-goal-fill" style="width:${progress}%;background:${barColor}"></div></div>
        <span class="home-goal-pct" style="color:${barColor}">${Math.round(progress)}%</span>
      </div>
    `;
  }).join('');

  document.getElementById('home-goals').innerHTML = `
    <div class="home-goals-title">2026 Goals</div>
    ${goalsHtml}
  `;
}

// ==========================================
// LOG TAB
// ==========================================

function renderLogTab() {
  // Set date to today
  const dateInput = document.getElementById('log-date');
  if (!dateInput.value) {
    dateInput.value = todayStr();
  }

  // Populate exercise dropdown
  populateExerciseSelect('exercise-select');

  // Show recent exercises
  renderRecentExercises();

  // Show today's sets
  renderTodaySets();
}

function populateExerciseSelect(selectId) {
  const sel = document.getElementById(selectId);
  if (sel.options.length > 1) return; // Already populated

  MUSCLE_GROUPS.forEach(group => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = group;
    Object.entries(EXERCISES).forEach(([key, ex]) => {
      if (ex.group === group) {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = `${ex.name} (${ex.equipment})`;
        optgroup.appendChild(opt);
      }
    });
    sel.appendChild(optgroup);
  });

  sel.addEventListener('change', () => {
    if (sel.value) onExerciseSelected(sel.value);
  });
}

function renderRecentExercises() {
  const container = document.getElementById('recent-exercises');
  const prefs = getPrefs();
  const recent = prefs.recentExercises || [];

  if (recent.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = recent.slice(0, 4).map(key => {
    const ex = EXERCISES[key];
    if (!ex) return '';
    const short = ex.equipment === 'Dumbbells' ? 'DB' :
                  ex.equipment === 'Free Bar' ? 'Bar' :
                  ex.equipment === 'Smith Machine' ? 'Smith' :
                  ex.equipment === 'Bodyweight' ? 'BW' : ex.equipment;
    return `<button class="recent-btn" onclick="selectExercise('${key}')">${ex.name} (${short})</button>`;
  }).join('');
}

function selectExercise(key) {
  document.getElementById('exercise-select').value = key;
  onExerciseSelected(key);
}

function onExerciseSelected(key) {
  const panel = document.getElementById('entry-panel');
  panel.classList.remove('hidden');

  const ex = EXERCISES[key];
  const prefs = getPrefs();
  const lastWeight = prefs.lastWeights?.[key] || 0;

  document.getElementById('weight-input').value = lastWeight;
  document.getElementById('reps-input').value = 0;
  document.getElementById('assisted-input').value = 0;
  document.getElementById('notes-input').value = '';
  document.getElementById('notes-input').classList.add('hidden');

  // Weight hint
  const hint = document.getElementById('weight-hint');
  if (ex.convention === 'per_hand') {
    hint.textContent = 'Per hand (dumbbell weight)';
  } else if (ex.convention === 'total') {
    hint.textContent = 'Total weight (including bar)';
  } else if (ex.convention === 'plate_load') {
    hint.textContent = 'Plate load only (excludes sled)';
  } else if (ex.convention === 'bodyweight') {
    hint.textContent = 'Bodyweight — set to 0 for BW only';
    document.getElementById('weight-input').value = 0;
  } else {
    hint.textContent = '';
  }
}

function adjustWeight(delta) {
  const input = document.getElementById('weight-input');
  let val = parseFloat(input.value) || 0;
  val = Math.max(0, val + delta);
  // Round to nearest 0.5
  val = Math.round(val * 2) / 2;
  input.value = val;
}

function adjustReps(delta) {
  const input = document.getElementById('reps-input');
  let val = parseFloat(input.value) || 0;
  val = Math.max(0, val + delta);
  input.value = val;
}

function adjustAssisted(delta) {
  const input = document.getElementById('assisted-input');
  let val = parseInt(input.value) || 0;
  val = Math.max(0, val + delta);
  input.value = val;
}

function toggleNotes() {
  const input = document.getElementById('notes-input');
  input.classList.toggle('hidden');
  if (!input.classList.contains('hidden')) input.focus();
}

function handleLogSet() {
  const exercise = document.getElementById('exercise-select').value;
  const date = document.getElementById('log-date').value;
  const weight = parseFloat(document.getElementById('weight-input').value) || 0;
  const reps = parseFloat(document.getElementById('reps-input').value) || 0;
  const assisted = parseInt(document.getElementById('assisted-input').value) || 0;
  const notes = document.getElementById('notes-input').value.trim();

  if (!exercise) { showToast('Pick an exercise first'); return; }
  if (reps <= 0) { showToast('Enter reps'); return; }

  addSet({ date, exercise, weight, reps, assisted, notes });

  // Update prefs
  const prefs = getPrefs();
  prefs.lastWeights = prefs.lastWeights || {};
  prefs.lastWeights[exercise] = weight;
  // Update recent exercises (most recent first, no duplicates)
  prefs.recentExercises = prefs.recentExercises || [];
  prefs.recentExercises = [exercise, ...prefs.recentExercises.filter(e => e !== exercise)].slice(0, 6);
  savePrefs(prefs);

  showToast('Set logged!');
  renderTodaySets();
  renderRecentExercises();

  // Reset reps for next set (keep exercise and weight)
  document.getElementById('reps-input').value = 0;
  document.getElementById('assisted-input').value = 0;
  document.getElementById('notes-input').value = '';
}

function renderTodaySets() {
  const date = document.getElementById('log-date').value || todayStr();
  const sets = getAllSets().filter(s => s.date === date);
  const container = document.getElementById('today-sets');

  document.getElementById('today-title').textContent =
    date === todayStr() ? "Today's Sets" : `Sets on ${formatDate(date)}`;

  if (sets.length === 0) {
    container.innerHTML = '<div class="empty-state">No sets logged yet</div>';
    return;
  }

  container.innerHTML = sets.map(s => {
    const ex = EXERCISES[s.exercise] || { name: s.exercise, equipment: '', group: 'Other' };
    const groupClass = ex.group.toLowerCase();
    const assistedStr = s.assisted > 0 ? ` <span style="color:var(--orange)">(+${s.assisted} assisted)</span>` : '';
    return `
      <div class="set-card">
        <div class="set-card-info">
          <div class="set-card-exercise">
            <span class="group-badge ${groupClass}">${ex.group}</span>
            ${ex.name} (${ex.equipment})
          </div>
          <div class="set-card-detail">${s.weight}kg × ${s.reps} reps${assistedStr}</div>
          ${s.notes ? `<div class="set-card-notes">${escHtml(s.notes)}</div>` : ''}
        </div>
        <button class="set-card-delete" onclick="handleDeleteSet('${s.id}')" title="Delete">&times;</button>
      </div>
    `;
  }).join('');
}

function handleDeleteSet(id) {
  deleteSet(id);
  renderTodaySets();
  showToast('Set deleted');
}

// ==========================================
// HISTORY TAB
// ==========================================

let historyFilter = 'All';

function renderHistoryTab() {
  // Render filter pills
  const filterContainer = document.getElementById('history-filters');
  const groups = ['All', ...MUSCLE_GROUPS];
  filterContainer.innerHTML = groups.map(g =>
    `<button class="filter-pill ${g === historyFilter ? 'active' : ''}" onclick="setHistoryFilter('${g}')">${g}</button>`
  ).join('');

  // Group sets by date
  const allSets = getAllSets();
  const dateMap = {};
  allSets.forEach(s => {
    if (!dateMap[s.date]) dateMap[s.date] = [];
    dateMap[s.date].push(s);
  });

  // Sort dates descending
  const dates = Object.keys(dateMap).sort((a, b) => b.localeCompare(a));

  const container = document.getElementById('history-list');

  if (dates.length === 0) {
    container.innerHTML = '<div class="empty-state">No sessions recorded yet</div>';
    return;
  }

  let html = '';
  dates.forEach(date => {
    let sets = dateMap[date];

    // Apply filter
    if (historyFilter !== 'All') {
      sets = sets.filter(s => {
        const ex = EXERCISES[s.exercise];
        return ex && ex.group === historyFilter;
      });
      if (sets.length === 0) return;
    }

    // Session summary: unique exercises and top lifts
    const exerciseNames = [...new Set(sets.map(s => {
      const ex = EXERCISES[s.exercise];
      return ex ? ex.name : s.exercise;
    }))];
    const summary = exerciseNames.slice(0, 3).join(', ') + (exerciseNames.length > 3 ? '...' : '');
    const setCount = sets.length;

    html += `
      <div class="session-card" onclick="toggleSession(this)">
        <div class="session-header">
          <div>
            <div class="session-date">${formatDate(date)}</div>
            <div class="session-summary">${setCount} set${setCount !== 1 ? 's' : ''} — ${summary}</div>
          </div>
          <span class="session-expand">&#9662;</span>
        </div>
        <div class="session-detail">
          ${sets.map(s => {
            const ex = EXERCISES[s.exercise] || { name: s.exercise, equipment: '', group: 'Other' };
            const groupClass = ex.group.toLowerCase();
            const assistedStr = s.assisted > 0 ? `<span class="session-set-assisted"> (+${s.assisted})</span>` : '';
            const notesStr = s.notes ? `<div class="session-set-notes">${escHtml(s.notes)}</div>` : '';
            return `
              <div class="session-set-row">
                <span class="session-set-exercise">
                  <span class="group-badge ${groupClass}">${ex.group.substr(0,3)}</span>
                  ${ex.name} (${ex.equipment})
                </span>
                <span>
                  <span class="session-set-weight">${s.weight}kg</span>
                  <span class="session-set-reps">× ${s.reps}${assistedStr}</span>
                </span>
              </div>
              ${notesStr}
            `;
          }).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html || '<div class="empty-state">No sessions match this filter</div>';
}

function setHistoryFilter(group) {
  historyFilter = group;
  renderHistoryTab();
}

function toggleSession(card) {
  card.classList.toggle('open');
}

// ==========================================
// CHARTS TAB
// ==========================================

function renderChartsTab() {
  populateExerciseSelect2('chart-exercise');
}

function populateExerciseSelect2(selectId) {
  const sel = document.getElementById(selectId);
  if (sel.options.length > 1) return;

  // Count sets per exercise
  const allSets = getAllSets();
  const counts = {};
  allSets.forEach(s => { counts[s.exercise] = (counts[s.exercise] || 0) + 1; });

  // Split: 10+ sets = main, <10 = other
  const mainExercises = [];
  const otherExercises = [];
  Object.entries(EXERCISES).forEach(([key, ex]) => {
    if (!counts[key]) return; // No data at all
    if (counts[key] >= 10) mainExercises.push([key, ex]);
    else otherExercises.push([key, ex]);
  });

  // Main exercises grouped by muscle group
  MUSCLE_GROUPS.forEach(group => {
    const exercises = mainExercises.filter(([, ex]) => ex.group === group);
    if (exercises.length === 0) return;
    const optgroup = document.createElement('optgroup');
    optgroup.label = group;
    exercises.forEach(([key, ex]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = `${ex.name} (${ex.equipment})`;
      optgroup.appendChild(opt);
    });
    sel.appendChild(optgroup);
  });

  // Other exercises in a single group at the bottom
  if (otherExercises.length > 0) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = 'Other';
    otherExercises.forEach(([key, ex]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = `${ex.name} (${ex.equipment})`;
      optgroup.appendChild(opt);
    });
    sel.appendChild(optgroup);
  }
}

// Chart.js plugin: draw rep count inside each dot
const repsLabelPlugin = {
  id: 'repsLabels',
  afterDatasetsDraw(chart) {
    const ctx = chart.ctx;
    const meta = chart.getDatasetMeta(0);
    if (!meta || !currentChartData.length) return;
    meta.data.forEach((point, index) => {
      const d = currentChartData[index];
      if (!d || d.reps <= 0) return;
      const label = d.reps % 1 === 0 ? String(d.reps) : d.reps.toFixed(1);
      const radius = mapRepsToRadius(d.reps);
      const fontSize = Math.max(8, Math.round(radius * 0.65));
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, point.x, point.y);
      ctx.restore();
    });
  }
};

function mapRepsToRadius(reps) {
  // 1 rep → radius 10, 5 reps → 14, 10 reps → 18, 15 reps → 20
  return Math.max(10, Math.min(22, 8 + Math.min(reps, 15) * 0.9));
}

function linearRegression(data) {
  const n = data.length;
  if (n < 2) return null;
  const points = data.map(d => ({ x: new Date(d.x).getTime(), y: d.y }));
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  points.forEach(p => { sumX += p.x; sumY += p.y; sumXY += p.x * p.y; sumX2 += p.x * p.x; });
  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-10) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return {
    slope, intercept,
    predict(dateStr) { return slope * new Date(dateStr).getTime() + intercept; },
  };
}

function updateChart() {
  const exerciseKey = document.getElementById('chart-exercise').value;
  if (!exerciseKey) {
    document.getElementById('chart-stats').innerHTML = '<div class="empty-state">Select an exercise to see progress</div>';
    if (currentChart) { currentChart.destroy(); currentChart = null; }
    return;
  }

  const allSets = getAllSets().filter(s => s.exercise === exerciseKey);
  const ex = EXERCISES[exerciseKey];

  // Group by date, find best set per date (highest weight with at least 1 clean rep)
  const dateMap = {};
  allSets.forEach(s => {
    if (!dateMap[s.date]) dateMap[s.date] = [];
    dateMap[s.date].push(s);
  });

  const dates = Object.keys(dateMap).sort();
  const chartData = dates.map(date => {
    const sets = dateMap[date];
    const cleanSets = sets.filter(s => (s.reps - (s.assisted || 0)) > 0);
    if (cleanSets.length === 0) return null;
    const best = cleanSets.reduce((a, b) => a.weight > b.weight ? a : b);
    return { x: date, y: best.weight, reps: best.reps, assisted: best.assisted || 0 };
  }).filter(Boolean);

  // Store globally so the plugin can access it
  currentChartData = chartData;

  if (chartData.length === 0) {
    document.getElementById('chart-stats').innerHTML = '<div class="empty-state">No data for this exercise</div>';
    if (currentChart) { currentChart.destroy(); currentChart = null; }
    return;
  }

  // Calculate dot radii based on reps
  const pointRadii = chartData.map(d => mapRepsToRadius(d.reps));
  const pointHoverRadii = pointRadii.map(r => r + 3);

  // Find goal for this exercise
  const goal = GOALS.find(g => g.exercise === exerciseKey);

  // Linear regression
  const reg = linearRegression(chartData);

  // Build chart
  const ctx = document.getElementById('progress-chart').getContext('2d');
  if (currentChart) currentChart.destroy();

  const datasets = [];

  // Dataset 0: data points (dots only, no connecting line)
  datasets.push({
    label: 'Best Weight',
    data: chartData.map(d => ({ x: d.x, y: d.y })),
    showLine: false,
    pointRadius: pointRadii,
    pointHoverRadius: pointHoverRadii,
    pointBackgroundColor: '#58a6ff',
    pointBorderColor: '#0d1117',
    pointBorderWidth: 2,
    fill: false,
  });

  // Dataset 1: trend line (line of best fit, extended 3 months into future)
  if (reg) {
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    // Extend 90 days into the future
    const futureDate = new Date(new Date(lastDate).getTime() + 90 * 24 * 60 * 60 * 1000);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    const y1 = reg.predict(firstDate);
    const y2 = reg.predict(futureDateStr);

    datasets.push({
      label: 'Trend',
      data: [
        { x: firstDate, y: Math.max(0, y1) },
        { x: futureDateStr, y: Math.max(0, y2) },
      ],
      borderColor: '#58a6ff55',
      borderWidth: 2,
      borderDash: [4, 3],
      pointRadius: 0,
      fill: false,
    });
  }

  // Dataset 2: goal line
  if (goal && dates.length > 0) {
    const extendDate = reg ?
      new Date(new Date(dates[dates.length - 1]).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] :
      dates[dates.length - 1];
    datasets.push({
      label: `Goal: ${goal.targetWeight}kg × ${goal.targetReps}`,
      data: [
        { x: dates[0], y: goal.targetWeight },
        { x: extendDate, y: goal.targetWeight },
      ],
      borderColor: '#3fb950',
      borderDash: [6, 4],
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
    });
  }

  currentChart = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'nearest' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#161b22ee',
          borderColor: '#30363d',
          borderWidth: 1,
          titleColor: '#e6edf3',
          bodyColor: '#8b949e',
          padding: 10,
          callbacks: {
            title(items) {
              if (items[0].datasetIndex === 0) return formatDate(items[0].raw.x);
              return '';
            },
            label(context) {
              if (context.datasetIndex > 0) return context.dataset.label;
              const d = currentChartData[context.dataIndex];
              if (!d) return '';
              const asst = d.assisted > 0 ? ` (+${d.assisted} assisted)` : '';
              return `${d.y}kg × ${d.reps} reps${asst}`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: { unit: 'month', displayFormats: { month: 'MMM yy' } },
          grid: { color: '#30363d22' },
          ticks: { color: '#8b949e', maxRotation: 0, font: { size: 11 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: '#30363d22' },
          ticks: { color: '#8b949e', font: { size: 11 } },
        }
      }
    },
    plugins: [repsLabelPlugin],
  });

  // Stats
  renderChartStats(exerciseKey, chartData, allSets);
}

function renderChartStats(exerciseKey, chartData, allSets) {
  const container = document.getElementById('chart-stats');
  const ex = EXERCISES[exerciseKey];

  if (chartData.length === 0) {
    container.innerHTML = '<div class="empty-state">No data for this exercise</div>';
    return;
  }

  // PB (heaviest clean set ever)
  const cleanSets = allSets.filter(s => (s.reps - (s.assisted || 0)) > 0);
  const pb = cleanSets.length > 0 ?
    cleanSets.reduce((a, b) => a.weight > b.weight ? a : b) : null;

  // Most recent session
  const lastDate = chartData[chartData.length - 1].x;
  const daysSince = Math.floor((new Date() - new Date(lastDate)) / (1000 * 60 * 60 * 24));

  // Total sessions
  const sessionCount = chartData.length;

  // Trend: use linear regression slope (kg per month)
  let trendStr = '—';
  let trendClass = '';
  const reg = linearRegression(chartData);
  if (reg && chartData.length >= 3) {
    // slope is kg per millisecond, convert to kg per 30 days
    const kgPerMonth = reg.slope * (30 * 24 * 60 * 60 * 1000);
    if (kgPerMonth > 0.1) { trendStr = `+${kgPerMonth.toFixed(1)}kg/mo`; trendClass = 'green'; }
    else if (kgPerMonth < -0.1) { trendStr = `${kgPerMonth.toFixed(1)}kg/mo`; trendClass = 'red'; }
    else { trendStr = 'Steady'; trendClass = 'orange'; }
  }

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Personal Best</div>
      <div class="stat-value">${pb ? pb.weight + 'kg' : '—'}</div>
      <div class="stat-detail">${pb ? `× ${pb.reps} reps (${formatDate(pb.date)})` : ''}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Last Session</div>
      <div class="stat-value ${daysSince > 14 ? 'orange' : ''}">${daysSince}d ago</div>
      <div class="stat-detail">${formatDate(lastDate)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Sessions</div>
      <div class="stat-value">${sessionCount}</div>
      <div class="stat-detail">total recorded</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Trend</div>
      <div class="stat-value ${trendClass}">${trendStr}</div>
      <div class="stat-detail">rate of progress</div>
    </div>
  `;
}

// ==========================================
// GOALS TAB
// ==========================================

// === Epley Formula ===
// e1RM = weight × (1 + reps / 30)
// Estimated weight at N reps = e1RM / (1 + N / 30)
// Estimated reps at weight W = 30 × (e1RM / W - 1)

function epleyE1RM(weight, reps) {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

function epleyWeightAtReps(e1rm, reps) {
  if (e1rm <= 0) return 0;
  return e1rm / (1 + reps / 30);
}

function epleyRepsAtWeight(e1rm, weight) {
  if (weight <= 0 || e1rm <= weight) return 0;
  return 30 * (e1rm / weight - 1);
}

function renderGoalsTab() {
  const allSets = getAllSets();

  // Render goal cards
  const goalsContainer = document.getElementById('goals-list');
  goalsContainer.innerHTML = GOALS.map(goal => {
    const ex = EXERCISES[goal.exercise];
    const exerciseSets = allSets.filter(s => s.exercise === goal.exercise);
    const cleanSets = exerciseSets.filter(s => {
      const cleanReps = s.reps - (s.assisted || 0);
      return cleanReps > 0 && s.weight > 0;
    });

    if (cleanSets.length === 0) {
      return renderGoalCard(goal, ex, 0, 'No data', null);
    }

    // Find the best estimated 1RM across all clean sets (Epley formula)
    let bestE1RM = 0;
    let bestSet = null;
    cleanSets.forEach(s => {
      const cleanReps = s.reps - (s.assisted || 0);
      const e1rm = epleyE1RM(s.weight, cleanReps);
      if (e1rm > bestE1RM) {
        bestE1RM = e1rm;
        bestSet = { ...s, cleanReps };
      }
    });

    // Calculate estimated performance at goal conditions
    const estimatedNRM = epleyWeightAtReps(bestE1RM, goal.targetReps);
    const estimatedRepsAtGoalWeight = epleyRepsAtWeight(bestE1RM, goal.targetWeight);

    // Progress: estimated weight at goal reps vs target weight
    const progress = Math.min(100, (estimatedNRM / goal.targetWeight) * 100);

    // Build a useful "current" string
    let currentStr = '';
    const estNRM = Math.round(estimatedNRM * 10) / 10;
    const estReps = Math.round(estimatedRepsAtGoalWeight * 10) / 10;

    if (estimatedRepsAtGoalWeight >= goal.targetReps) {
      // Goal is achievable based on Epley!
      currentStr = `Est. ${goal.targetWeight}kg × ${Math.floor(estReps)} reps — ready to attempt!`;
    } else if (estimatedRepsAtGoalWeight > 0) {
      // Can do the weight, just not enough reps yet
      currentStr = `Est. ${goal.targetWeight}kg × ${estReps.toFixed(1)} reps (need ${goal.targetReps})`;
    } else {
      // Can't yet do the weight — show estimated nRM
      currentStr = `Est. ${goal.targetReps}RM: ${estNRM.toFixed(1)}kg (target: ${goal.targetWeight}kg)`;
    }

    // Show what set drives this estimate
    const basisStr = `Based on ${bestSet.weight}kg × ${bestSet.cleanReps} reps (e1RM: ${Math.round(bestE1RM)}kg)`;

    return renderGoalCard(goal, ex, progress, currentStr, basisStr);
  }).join('');

  // Render PB list
  renderPBList(allSets);
}

function renderGoalCard(goal, ex, progress, currentStr, basisStr) {
  let barColor = 'var(--accent)';
  if (progress >= 100) barColor = 'var(--green)';
  else if (progress >= 85) barColor = 'var(--accent)';
  else if (progress >= 65) barColor = 'var(--orange)';
  else barColor = 'var(--red)';

  return `
    <div class="goal-card">
      <div class="goal-title">${goal.label}</div>
      <div class="goal-subtitle">${ex.name} (${ex.equipment})</div>
      <div class="goal-progress-bar">
        <div class="goal-progress-fill" style="width:${progress}%; background:${barColor}"></div>
      </div>
      <div class="goal-stats">
        <span class="goal-current">${currentStr}</span>
        <span class="goal-percent" style="color:${barColor}">${Math.round(progress)}%</span>
      </div>
      ${basisStr ? `<div class="goal-basis">${basisStr}</div>` : ''}
    </div>
  `;
}

function renderPBList(allSets) {
  const container = document.getElementById('pb-list');

  // Get PBs for exercises that have data
  const exerciseKeys = [...new Set(allSets.map(s => s.exercise))];
  const pbs = [];

  exerciseKeys.forEach(key => {
    const ex = EXERCISES[key];
    if (!ex) return;
    const sets = allSets.filter(s => s.exercise === key);
    const cleanSets = sets.filter(s => (s.reps - (s.assisted || 0)) > 0);
    if (cleanSets.length === 0) return;

    const best = cleanSets.reduce((a, b) => a.weight > b.weight ? a : b);
    pbs.push({ key, ex, weight: best.weight, reps: best.reps, date: best.date });
  });

  // Sort by muscle group, then exercise name
  pbs.sort((a, b) => {
    const groupOrder = MUSCLE_GROUPS.indexOf(a.ex.group) - MUSCLE_GROUPS.indexOf(b.ex.group);
    if (groupOrder !== 0) return groupOrder;
    return a.ex.name.localeCompare(b.ex.name);
  });

  container.innerHTML = pbs.map(pb => {
    const groupClass = pb.ex.group.toLowerCase();
    return `
      <div class="pb-card">
        <div>
          <div class="pb-exercise">
            <span class="group-badge ${groupClass}">${pb.ex.group.substr(0,3)}</span>
            ${pb.ex.name} (${pb.ex.equipment})
          </div>
        </div>
        <div>
          <div class="pb-value">${pb.weight}kg × ${pb.reps}</div>
          <div class="pb-date">${formatDate(pb.date)}</div>
        </div>
      </div>
    `;
  }).join('');

  // Data management buttons
  container.innerHTML += `
    <div class="data-actions">
      <button class="data-btn" onclick="exportData()">Export JSON</button>
      <button class="data-btn danger" onclick="resetData()">Reset All Data</button>
    </div>
  `;
}

// ==========================================
// UTILITIES
// ==========================================

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const suffix = (day === 1 || day === 21 || day === 31) ? 'st' :
                 (day === 2 || day === 22) ? 'nd' :
                 (day === 3 || day === 23) ? 'rd' : 'th';
  return `${day}${suffix} ${month} ${year}`;
}

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1500);
}

function exportData() {
  const data = {
    sets: getAllSets(),
    prefs: getPrefs(),
    exported: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gym-tracker-export-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data exported!');
}

function resetData() {
  if (!confirm('This will delete ALL your gym data and reload the seed data. Are you sure?')) return;
  if (!confirm('Really sure? This cannot be undone.')) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PREFS_KEY);
  initSeedData();
  showTab('log');
  showToast('Data reset to seed data');
}

// ==========================================
// INIT
// ==========================================

function init() {
  initSeedData();
  renderHomeTab();

  // Listen for date changes to refresh today's sets
  document.getElementById('log-date').addEventListener('change', renderTodaySets);
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
