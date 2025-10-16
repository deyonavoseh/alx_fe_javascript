// Step 1: Array of quote objects
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Inspiration" }
];

// Step 2: Function to display a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");

  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available. Please add one below!</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p><strong>"${randomQuote.text}"</strong></p>
    <p><em>Category: ${randomQuote.category}</em></p>
  `;
}

// Step 3: Function to create a form dynamically for adding new quotes
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;

  document.body.appendChild(formContainer);

  // Add event listener for the "Add Quote" button
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
}

// Step 4: Function to add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText === "" || newCategory === "") {
    alert("Please fill in both the quote and category fields!");
    return;
  }

  // Add the new quote to the array
  quotes.push({ text: newText, category: newCategory });

  // Clear inputs
  textInput.value = "";
  categoryInput.value = "";

  // Show confirmation and update display
  alert("Quote added successfully!");
  showRandomQuote();
}

// Step 5: Set up event listeners and initialize
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
window.addEventListener("DOMContentLoaded", () => {
  showRandomQuote();
  createAddQuoteForm();
});
