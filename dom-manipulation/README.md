# 🌟 Dynamic Quote Generator (dom-manipulation)

Repository path: `alx_fe_javascript/dom-manipulation`

A JavaScript-first project demonstrating advanced DOM manipulation, web storage, JSON import/export, category filtering, and simple server-sync simulation.

---

## 📁 Files

- `index.html` — the main page (UI + minimal styles).
- `script.js` — application logic: DOM manipulation, storage, import/export, filter, sync.
- (optional) `quotes-export-YYYY-MM-DD-...json` — example export file created by the app.

---

## 🔧 Features Implemented

### 1. Advanced DOM Manipulation
- Dynamically displays quotes and updates the DOM on interactions.
- `showRandomQuote()` and `showQuoteByIndex(index)` to present quotes.
- `addQuoteFromInputs()` to add new quotes via the form.

### 2. Web Storage
- **Local Storage**: saves quotes persistently under the key `dqg_quotes_v1`.
- **Session Storage**: remembers the last shown quote index per session (`dqg_lastIndex`).
- Saves the last selected category filter under `dqg_selected_filter`.

### 3. JSON Import & Export
- Export: `Export Quotes (JSON)` button creates a `.json` file using `Blob` and `URL.createObjectURL`.
- Import: `Import Quotes (JSON)` file input reads a `.json` file (array of `{ text, category }`) and appends valid quotes.
- Input validation prevents bad objects from being saved.

### 4. Category Filtering System
- Populate categories dynamically from stored quotes.
- Filter quotes by category using the dropdown.
- Persist last selected filter with localStorage so it returns on next visit.

### 5. Syncing with Mock Server & Conflict Resolution
- Periodic fetch from a mock endpoint (`jsonplaceholder.typicode.com`) to simulate server quotes.
- Merge strategy: server quotes are appended unless local already has exact same text (server precedence concept).
- Shows sync status briefly in the UI.
- Sync runs initially and then every 2 minutes (configurable in `script.js`).

---

## ✅ How to Run

1. Clone the repo and navigate to the `dom-manipulation` directory:
   ```bash
   git clone <your-repo-url>
   cd alx_fe_javascript/dom-manipulation
