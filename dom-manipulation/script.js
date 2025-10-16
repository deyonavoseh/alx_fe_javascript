// =========================
// Dynamic Quote Generator
// =========================

// Global variables
let quotes = [];
let selectedCategory = "all";

// Load existing quotes and selected category
window.onload = function () {
  loadQuotes();
  loadSelectedCategory();
  populateCategories();
  showRandomQuote();
  document.getElementById("categoryFilter").value = selectedCategory;
  filterQuotes();

  // Simulate periodic server syncing every 30 seconds
  fetchQuotesFromServer();
  setInterval(fetchQuotesFromServer, 30000);
};

// =========================
// Core Quote Logic
// =========================

// Show a random quote (filtered)
function showRandomQuote() {
  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(
          (q) => q.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  const quoteDisplay = document.getElementById("quoteDisplay");
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerText = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerText = `"${quote.text}" - (${quote.category})`;
}

// Add a new quote dynamically
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text === "" || category === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
  filterQuotes();
}

// =========================
// Local & Session Storage
// =========================

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const savedQuotes = localStorage.getItem("quotes");
  if (savedQuotes) {
    quotes = JSON.parse(savedQuotes);
  } else {
    quotes = [
      {
        text: "The only limit to our realization of tomorrow is our doubts of today.",
        category: "Motivation",
      },
      {
        text: "In the middle of every difficulty lies opportunity.",
        category: "Inspiration",
      },
      {
        text: "The best way to predict the future is to invent it.",
        category: "Innovation",
      },
    ];
    saveQuotes();
  }
}

function loadSelectedCategory() {
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) selectedCategory = savedCategory;
}

// =========================
// Category Filtering Logic
// =========================

function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map((q) => q.category))];

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  categoryFilter.value = selectedCategory;
}

function filterQuotes() {
  selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

// =========================
// JSON Import / Export
// =========================

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "quotes.json";
  link.click();
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
    filterQuotes();
  };
  fileReader.readAsText(event.target.files[0]);
}

// =========================
// Server Sync Simulation
// =========================

async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverData = await response.json();

    // Convert sample API data to quote-like structure
    const serverQuotes = serverData.slice(0, 5).map((item) => ({
      text: item.title,
      category: "Server",
    }));

    // Conflict Resolution Strategy:
    // If a quote from the server doesn't exist locally, add it.
    const newQuotes = serverQuotes.filter(
      (srvQuote) =>
        !quotes.some((localQuote) => localQuote.text === srvQuote.text)
    );

    if (newQuotes.length > 0) {
      quotes.push(...newQuotes);
      saveQuotes();
      populateCategories();
      alert(`${newQuotes.length} new quotes synced from server.`);
    }
  } catch (error) {
    console.error("Error fetching quotes from server:", error);
  }
}

// =========================
// Event Listeners
// =========================
document
  .getElementById("newQuote")
  .addEventListener("click", showRandomQuote);
