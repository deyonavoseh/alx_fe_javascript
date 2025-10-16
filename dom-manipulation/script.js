// -------------------- Initial Data Setup --------------------
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Believe in yourself.", category: "Motivation" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
  { text: "Simplicity is the soul of efficiency.", category: "Wisdom" }
];

let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// -------------------- DOM Elements --------------------
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const notification = document.getElementById("notification");

// -------------------- Event Listeners --------------------
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// -------------------- Core Functions --------------------
function showRandomQuote() {
  let filtered = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${random.text}" — ${random.category}`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(random));
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text === "" || category === "") {
    alert("Please enter both quote text and category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  postQuoteToServer(newQuote); // sync new quote to server
  alert("Quote added successfully!");
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// -------------------- Filtering Logic --------------------
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === selectedCategory) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

// -------------------- JSON Import / Export --------------------
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "quotes.json";
  link.click();
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// -------------------- Server Sync Simulation --------------------

// Fetch quotes from mock API
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const serverQuotes = await response.json();

    // Simulate converting server posts to quote format
    const formatted = serverQuotes.map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Conflict resolution: server data takes precedence
    const combined = [...formatted, ...quotes.filter(q => q.category !== "Server")];
    quotes = combined;
    saveQuotes();
    populateCategories();
    notification.textContent = "Quotes synced with server.";
    setTimeout(() => (notification.textContent = ""), 3000);
  } catch (error) {
    console.error("Error fetching quotes:", error);
  }
}

// Post new quote to mock API
async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    console.log("Quote posted to server:", quote);
  } catch (error) {
    console.error("Error posting quote:", error);
  }
}

// -------------------- Initialize --------------------
populateCategories();
showRandomQuote();
fetchQuotesFromServer();
setInterval(fetchQuotesFromServer, 20000); // Sync every 20 seconds
