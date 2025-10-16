// Initialize quotes array
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not final; failure is not fatal: It is the courage to continue that counts.", category: "Perseverance" }
];

// Track selected category
let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const notification = document.getElementById("notification");

// ========== 1. Display Random Quote ==========
function showRandomQuote() {
  let filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote));
}

// ========== 2. Create Add Quote Form ==========
function createAddQuoteForm() {
  const container = document.getElementById("addQuoteFormContainer");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  container.appendChild(textInput);
  container.appendChild(categoryInput);
  container.appendChild(addButton);
}

// ========== 3. Add New Quote ==========
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  showRandomQuote();
  postQuoteToServer(newQuote);

  textInput.value = "";
  categoryInput.value = "";
  showNotification("New quote added!");
}

// ========== 4. Filter Quotes ==========
function populateCategories() {
  const uniqueCategories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = uniqueCategories
    .map(cat => `<option value="${cat}" ${cat === selectedCategory ? "selected" : ""}>${cat}</option>`)
    .join("");
}

function filterQuotes() {
  selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

// ========== 5. Local Storage ==========
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ========== 6. JSON Export / Import ==========
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      showNotification("Quotes imported successfully!");
    } catch (error) {
      showNotification("Invalid JSON file.", true);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ========== 7. Server Sync Simulation ==========
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    const serverQuotes = data.slice(0, 3).map(post => ({
      text: post.title,
      category: "Server"
    }));

    quotes = [...serverQuotes, ...quotes];
    saveQuotes();
    populateCategories();
    showNotification("Quotes synced with server!");
  } catch (error) {
    showNotification("Error fetching from server.", true);
  }
}

async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
  } catch (error) {
    console.error("Error posting to server:", error);
  }
}

function syncQuotes() {
  fetchQuotesFromServer();
}

// ========== 8. Notifications ==========
function showNotification(message, isError = false) {
  notification.textContent = message;
  notification.style.color = isError ? "red" : "green";
  setTimeout(() => (notification.textContent = ""), 3000);
}

// ========== 9. Event Listeners ==========
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Initialize app
populateCategories();
createAddQuoteForm();
showRandomQuote();
setInterval(syncQuotes, 15000); // sync every 15 seconds
