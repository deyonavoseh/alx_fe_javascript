/* script.js
   Dynamic Quote Generator with:
   - Advanced DOM manipulation
   - LocalStorage persistence
   - SessionStorage for last shown quote
   - JSON import/export
   - Category filtering + persistence
   - Mock server sync + basic conflict resolution (server precedence)
*/

// -------------------- Config & Keys --------------------
const LOCAL_STORAGE_KEY = "dqg_quotes_v1";         // versionable
const LOCAL_STORAGE_FILTER_KEY = "dqg_selected_filter";
const SESSION_LAST_INDEX_KEY = "dqg_lastIndex";
const SYNC_METADATA_KEY = "dqg_sync_meta";        // store last server sync meta

// -------------------- Default Data --------------------
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Inspiration" }
];

// -------------------- Helpers --------------------
function isValidQuote(q) {
  return q && typeof q === "object" &&
         typeof q.text === "string" && q.text.trim() !== "" &&
         typeof q.category === "string";
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// -------------------- Storage --------------------
function saveQuotesToLocalStorage() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.error("Failed to save:", err);
  }
}

function loadQuotesFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(isValidQuote)) {
      quotes = parsed;
      return true;
    } else {
      console.warn("Invalid saved quotes, using defaults.");
      return false;
    }
  } catch (err) {
    console.error("Error loading saved quotes:", err);
    return false;
  }
}

function saveSelectedFilter(filterValue) {
  try {
    localStorage.setItem(LOCAL_STORAGE_FILTER_KEY, filterValue);
  } catch (err) {
    console.warn("Could not save filter:", err);
  }
}

function loadSelectedFilter() {
  try {
    return localStorage.getItem(LOCAL_STORAGE_FILTER_KEY) || "all";
  } catch {
    return "all";
  }
}

// -------------------- Display --------------------
function showQuoteByIndex(index) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (!quotes[index]) {
    quoteDisplay.innerHTML = "<p>No quote found.</p>";
    return;
  }
  const q = quotes[index];
  quoteDisplay.innerHTML = `
    <p><strong>"${escapeHtml(q.text)}"</strong></p>
    <p><em>Category: ${escapeHtml(q.category)}</em></p>
  `;
  try {
    sessionStorage.setItem(SESSION_LAST_INDEX_KEY, String(index));
  } catch (err) {
    console.warn("sessionStorage unavailable:", err);
  }
}

function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available. Add one below!</p>";
    sessionStorage.removeItem(SESSION_LAST_INDEX_KEY);
    return;
  }

  let lastIndex = Number(sessionStorage.getItem(SESSION_LAST_INDEX_KEY));
  let index;
  if (quotes.length === 1) index = 0;
  else {
    let attempts = 0;
    do {
      index = Math.floor(Math.random() * quotes.length);
      attempts++;
    } while (index === lastIndex && attempts < 6);
  }
  showQuoteByIndex(index);
}

// -------------------- Add Quote --------------------
function addQuoteFromInputs() {
  const textInput = document.getElementById("newQuoteText");
  const catInput = document.getElementById("newQuoteCategory");
  const newText = textInput.value.trim();
  const newCategory = catInput.value.trim() || "Uncategorized";

  if (!newText) {
    alert("Please provide quote text.");
    return;
  }

  const newQ = { text: newText, category: newCategory };
  quotes.push(newQ);
  saveQuotesToLocalStorage();
  textInput.value = "";
  catInput.value = "";
  populateCategories();
  // show the newly added quote
  showQuoteByIndex(quotes.length - 1);
}

// -------------------- Categories & Filter --------------------
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const prev = select.value || loadSelectedFilter() || "all";

  const categories = new Set(quotes.map(q => q.category));
  // clear current options
  select.innerHTML = '<option value="all">All Categories</option>';
  Array.from(categories).sort((a,b)=>a.localeCompare(b)).forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });

  // restore previous selection if available
  const toSet = Array.from(select.options).some(o => o.value === prev) ? prev : "all";
  select.value = toSet;
  saveSelectedFilter(toSet);
}

function filterQuotes() {
  const select = document.getElementById("categoryFilter");
  const selected = select.value;
  saveSelectedFilter(selected);

  if (selected === "all") {
    // show random from all
    showRandomQuote();
    return;
  }

  const filtered = quotes.map((q, i) => ({ q, i })).filter(item => item.q.category === selected);
  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = `<p>No quotes in category "${escapeHtml(selected)}".</p>`;
    return;
  }
  // show a random one from filtered
  const pick = filtered[Math.floor(Math.random() * filtered.length)];
  showQuoteByIndex(pick.i);
}

// -------------------- Import / Export --------------------
function exportQuotesToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const now = new Date().toISOString().slice(0,19).replace(/[:T]/g, "-");
  a.download = `quotes-export-${now}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file provided"));
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!Array.isArray(parsed)) return reject(new Error("JSON must be an array of quote objects"));
        const valid = parsed.filter(isValidQuote);
        if (valid.length === 0) return reject(new Error("No valid quotes found in the file"));
        // Merge by appending (dedupe optional)
        quotes.push(...valid);
        saveQuotesToLocalStorage();
        populateCategories();
        resolve(valid.length);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

// -------------------- Clear Saved --------------------
function clearSavedQuotes() {
  if (!confirm("This will remove all saved quotes and reset to defaults. Continue?")) return;
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  localStorage.removeItem(LOCAL_STORAGE_FILTER_KEY);
  // reset in-memory to defaults
  quotes = [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Inspiration" }
  ];
  saveQuotesToLocalStorage();
  populateCategories();
  showRandomQuote();
}

// -------------------- Sync with Mock Server --------------------
/*
  Strategy:
  - Periodically GET from a mock endpoint (JSONPlaceholder or your own)
  - Treat server data as authoritative: server overrides local if conflicts occur
  - Simple metadata stored to show last sync time
  Note: JSONPlaceholder doesn't really persist posts from us, but we can simulate
*/
const MOCK_SERVER_URL = "https://jsonplaceholder.typicode.com/posts?_limit=5"; // simulated fetch
// We expect server to return objects; we'll map some into quote shape for demo

async function fetchServerQuotes() {
  try {
    const res = await fetch(MOCK_SERVER_URL);
    if (!res.ok) throw new Error("Network response not ok");
    const data = await res.json();
    // Convert server data into our quote shape (for simulation)
    const serverQuotes = data.map(item => ({
      text: String(item.title || item.body || "Untitled from server"),
      category: "Server"
    })).filter(isValidQuote);
    return serverQuotes;
  } catch (err) {
    console.warn("Server fetch failed:", err);
    return null;
  }
}

async function syncWithServer() {
  const statusEl = document.getElementById("syncStatus");
  statusEl.textContent = "syncing...";
  try {
    const serverQuotes = await fetchServerQuotes();
    if (!serverQuotes) {
      statusEl.textContent = "sync failed";
      statusEl.classList.add("danger");
      setTimeout(()=>{ statusEl.textContent = ""; statusEl.classList.remove("danger"); }, 2500);
      return;
    }

    // Conflict resolution: server takes precedence.
    // Simple merge strategy:
    // - Append server quotes which are not exact duplicates of existing local text
    const localTexts = new Set(quotes.map(q => q.text));
    let added = 0;
    serverQuotes.forEach(sq => {
      if (!localTexts.has(sq.text)) {
        quotes.push(sq);
        added++;
      }
    });

    // Optionally: if server is considered authoritative and you'd want to replace local:
    // quotes = serverQuotes; // uncomment to fully replace local with server

    saveQuotesToLocalStorage();
    populateCategories();

    // Save metadata
    const meta = { lastSync: new Date().toISOString(), addedFromServer: added };
    try { localStorage.setItem(SYNC_METADATA_KEY, JSON.stringify(meta)); } catch {}
    statusEl.textContent = `synced (${added} new)`;
    statusEl.classList.remove("danger");
    setTimeout(()=>{ statusEl.textContent = ""; }, 3000);
  } catch (err) {
    console.error("Sync error:", err);
    statusEl.textContent = "sync error";
    statusEl.classList.add("danger");
    setTimeout(()=>{ statusEl.textContent = ""; statusEl.classList.remove("danger"); }, 2500);
  }
}

// Periodic sync (every 2 minutes) — you can tweak or disable
let syncIntervalId = null;
function startPeriodicSync() {
  if (syncIntervalId) return;
  syncWithServer(); // initial
  syncIntervalId = setInterval(syncWithServer, 2 * 60 * 1000);
}
function stopPeriodicSync() {
  if (!syncIntervalId) return;
  clearInterval(syncIntervalId);
  syncIntervalId = null;
}

// -------------------- Initialization --------------------
function init() {
  // load saved quotes if present
  loadQuotesFromLocalStorage();
  // UI wiring
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuoteFromInputs);
  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
  document.getElementById("exportJsonBtn").addEventListener("click", exportQuotesToJson);
  document.getElementById("importBtn").addEventListener("click", () => document.getElementById("importFile").click());
  document.getElementById("importFile").addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const count = await importFromJsonFile(file);
      alert(`Imported ${count} quotes successfully.`);
      showRandomQuote();
    } catch (err) {
      alert("Import failed: " + (err.message || err));
    } finally {
      e.target.value = ""; // clear to allow reimport
    }
  });
  document.getElementById("clearStorageBtn").addEventListener("click", clearSavedQuotes);

  populateCategories();

  // Restore last selected filter and show a quote accordingly
  const savedFilter = loadSelectedFilter();
  if (savedFilter && savedFilter !== "all") {
    document.getElementById("categoryFilter").value = savedFilter;
    filterQuotes();
  } else {
    // show previous session quote if available
    const lastIndexStr = sessionStorage.getItem(SESSION_LAST_INDEX_KEY);
    if (lastIndexStr !== null) {
      const idx = Number(lastIndexStr);
      if (!Number.isNaN(idx) && idx >= 0 && idx < quotes.length && isValidQuote(quotes[idx])) {
        showQuoteByIndex(idx);
      } else {
        showRandomQuote();
      }
    } else {
      showRandomQuote();
    }
  }

  // start syncing with mock server
  startPeriodicSync();
}

// Run
window.addEventListener("DOMContentLoaded", init);
