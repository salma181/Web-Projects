const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");

const list = document.getElementById("list");
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");
const clearAllBtn = document.getElementById("clearAll");

const STORAGE_KEY = "salma_expenses_v1";

let transactions = load();

function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch{
    return [];
  }
}

function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function money(n){
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

function render(){
  // totals
  const amounts = transactions.map(t => t.amount);
  const total = amounts.reduce((a,b)=>a+b, 0);

  const income = amounts
    .filter(a => a > 0)
    .reduce((a,b)=>a+b, 0);

  const expense = amounts
    .filter(a => a < 0)
    .reduce((a,b)=>a+b, 0);

  balanceEl.textContent = money(total);
  incomeEl.textContent = money(income);
  expenseEl.textContent = money(expense);

  // list with search + filter
  const q = searchInput.value.trim().toLowerCase();
  const f = filterSelect.value;

  const filtered = transactions.filter(t => {
    const matchesSearch = t.text.toLowerCase().includes(q);
    const isIncome = t.amount > 0;
    const isExpense = t.amount < 0;

    const matchesFilter =
      f === "all" ||
      (f === "income" && isIncome) ||
      (f === "expense" && isExpense);

    return matchesSearch && matchesFilter;
  });

  list.innerHTML = "";

  if(filtered.length === 0){
    const empty = document.createElement("li");
    empty.className = "item";
    empty.innerHTML = `<div><div class="title">No transactions yet</div><div class="meta">Add one above 👆</div></div>`;
    list.appendChild(empty);
    return;
  }

  filtered.forEach(t => {
    const li = document.createElement("li");
    li.className = "item";

    const typeClass = t.amount > 0 ? "income" : "expense";
    const typeLabel = t.amount > 0 ? "Income" : "Expense";

    li.innerHTML = `
      <div>
        <div class="title">${escapeHtml(t.text)}</div>
        <div class="meta">${new Date(t.createdAt).toLocaleString()} • <span class="badge ${typeClass}">${typeLabel}</span></div>
      </div>

      <div class="right">
        <div class="badge ${typeClass}">${money(t.amount)}</div>
        <button class="icon-btn" title="Delete" data-action="delete" data-id="${t.id}">✖</button>
      </div>
    `;

    list.appendChild(li);
  });
}

function escapeHtml(str){
  return str.replaceAll("&","&amp;")
            .replaceAll("<","&lt;")
            .replaceAll(">","&gt;")
            .replaceAll('"',"&quot;")
            .replaceAll("'","&#039;");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = text.value.trim();
  const value = Number(amount.value);

  if(!title) return;
  if(Number.isNaN(value) || value === 0) return;

  const tx = {
    id: crypto.randomUUID(),
    text: title,
    amount: value,
    createdAt: Date.now(),
  };

  transactions.unshift(tx);
  save();

  text.value = "";
  amount.value = "";

  render();
});

list.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if(!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;

  if(action === "delete"){
    transactions = transactions.filter(t => t.id !== id);
    save();
    render();
  }
});

searchInput.addEventListener("input", render);
filterSelect.addEventListener("change", render);

clearAllBtn.addEventListener("click", () => {
  if(transactions.length === 0) return;
  const ok = confirm("Are you sure you want to clear all transactions?");
  if(!ok) return;
  transactions = [];
  save();
  render();
});

// initial
render();
 
 
