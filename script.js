const balance = document.getElementById("balance");
const moneyPlus = document.getElementById("money-plus");
const moneyMinus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const notification = document.getElementById("notification");

const MAX_HISTORY_DAYS = 14; // Maximum number of days to keep history records

let transactions = [];

function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function showNotification(message) {
  notification.innerText = message;
  notification.classList.add("show");
  setTimeout(() => {
    notification.classList.remove("show");
  }, 2000);
}

function generateID() {
  return Math.floor(Math.random() * 100000000);
}

function removeOldTransactions() {
  const today = new Date().toISOString().split('T')[0]; // Current date in 'YYYY-MM-DD' format
  transactions = transactions.filter(transaction => {
    return transaction.date === today; // Keep transactions of the current day
  });
}

function addTransaction(e) {
  e.preventDefault();
  if (text.value.trim() === "" || amount.value.trim() === "") {
    showNotification("Please add a description and amount");
  } else {
    const transaction = {
      id: generateID(),
      text: text.value,
      amount: +amount.value,
      date: new Date().toISOString().split('T')[0] // Store transaction date in 'YYYY-MM-DD' format
    };

    transactions.unshift(transaction); // Add new transaction to the beginning of the array

    if (transactions.length > MAX_HISTORY_DAYS) {
      transactions.splice(MAX_HISTORY_DAYS); // Remove older transactions beyond the 14th position
      list.innerHTML = ""; // Clear the list in the DOM

      // Add the last 14 transactions back to the DOM
      transactions.forEach(addTransactionDOM);
    } else {
      addTransactionDOM(transaction); // Add the new transaction to the DOM
    }

    updateValues();
    updateLocalStorage();
    text.value = "";
    amount.value = "";
  }
}

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");
  item.classList.add(sign === "+" ? "plus" : "minus");
  const transactionDate = new Date(transaction.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  item.innerHTML = `
    ${transaction.text} <span>${sign}${Math.abs(transaction.amount)}</span>
    <p>${transactionDate}</p>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">
      <i class="fa fa-times"></i>
    </button>
  `;
  list.appendChild(item);
}

function updateValues() {
  const amounts = transactions.map((transaction) => transaction.amount);
  const total = amounts.reduce((accumulator, value) => (accumulator += value), 0).toFixed(2);
  const income = amounts.filter((value) => value > 0).reduce((accumulator, value) => (accumulator += value), 0).toFixed(2);
  const expense = (amounts.filter((value) => value < 0).reduce((accumulator, value) => (accumulator += value), 0) * -1).toFixed(2);
  balance.innerText = `₹${total}`;
  moneyPlus.innerText = `₹${income}`;
  moneyMinus.innerText = `₹${expense}`;
}

function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  updateLocalStorage();
  init();
}

// Initialize the app
function init() {
  list.innerHTML = "";
  transactions.forEach(addTransactionDOM);
  updateValues();
}

// Check if there are transactions in localStorage, if yes, load them
const localStorageTransactions = JSON.parse(localStorage.getItem("transactions"));
transactions = localStorageTransactions !== null ? localStorageTransactions : [];

init(); // Initialize the app

form.addEventListener("submit", addTransaction);