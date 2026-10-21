const STORAGE_KEY = 'sammy-rishy-memory-list-v1';

const defaultEntries = [];
const journeyStartDate = '2026-05-02';

const memoryForm = document.getElementById('memoryForm');
const memoryDate = document.getElementById('memoryDate');
const memoryTitle = document.getElementById('memoryTitle');
const memoryDetails = document.getElementById('memoryDetails');
const memoryList = document.getElementById('memoryList');
const totalCount = document.getElementById('totalCount');
const latestDate = document.getElementById('latestDate');
const resetBtn = document.getElementById('resetBtn');

function getEntries() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEntries));
    return [...defaultEntries];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [...defaultEntries];
  } catch (error) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEntries));
    return [...defaultEntries];
  }
}

function sortEntries(entries) {
  return [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function formatJourneyStart() {
  const date = new Date(journeyStartDate + 'T00:00:00');
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderList() {
  const entries = sortEntries(getEntries());

  if (!entries.length) {
    memoryList.innerHTML = '<li class="empty-state">No memories yet. Start with your first one.</li>';
    totalCount.textContent = '0';
    latestDate.textContent = formatJourneyStart();
    return;
  }

  memoryList.innerHTML = entries
    .map(
      (item) => `
        <li class="memory-item">
          <span class="memory-date">${formatDate(item.date)}</span>
          <h3 class="memory-title">${escapeHtml(item.title)}</h3>
          ${item.details ? `<p class="memory-detail">${escapeHtml(item.details)}</p>` : ''}
        </li>
      `
    )
    .join('');

  totalCount.textContent = String(entries.length);
  latestDate.textContent = formatJourneyStart();
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

memoryForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const entry = {
    date: memoryDate.value,
    title: memoryTitle.value.trim(),
    details: memoryDetails.value.trim()
  };

  if (!entry.date || !entry.title) {
    return;
  }

  const entries = sortEntries(getEntries());
  entries.unshift(entry);
  saveEntries(entries);
  renderList();

  memoryForm.reset();
  memoryDate.value = new Date().toISOString().split('T')[0];
});

resetBtn.addEventListener('click', () => {
  saveEntries([]);
  renderList();
});

localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
memoryDate.value = new Date().toISOString().split('T')[0];
renderList();
