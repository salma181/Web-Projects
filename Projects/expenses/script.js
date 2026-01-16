"use strict";

const STORAGE_KEY = "salma_expenses_v2";

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

const form = document.getElementById("form");
const titleInput = document.getElementById("titleInput");
const amountInput = document.getElementById("amountInput");
const categoryInput = document.getElementById("categoryInput");
const dateInput = document.getElementById("dateInput");

const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");

const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const categoryFilter = document.getElementById("categoryFilter");
const exportBtn = document.getElementById("exportBtn");

const countText = document.getElementById("countText");
const monthText = document.getElementById("monthText");

const toastEl = document.getElementById("toast");

let items = loadItems(); // [{id,title,amount,category,date,createdAt}]
let searchTerm = "";
let filterType = "all";
let filterCategory = "all";

init();

function init(){
  // default date = today
  dateInput.value = new Date().toISOString().slice(0,10);

  // fill category filter from known categories
  rebuildCategoryFilter();

  // events
  form.addEventListener("submit", onAdd);

  searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value.trim().toLowerCase();
    render();
  });

  typeFilter.addEventListener("change", () => {
    filterType = typeFilter.value;
    render();
  });

  categoryFilter.addEventListener("change", () => {
    filterCategory = categoryFilter.value;
    render();
  });

  exportBtn.addEventListener("click", exportCSV);

  render();
}

function onAdd(e){
  e.preventDefault();

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value || new Date().toISOString().slice(0,10);

  if(!title || !Number.isFinite(amount) || amount === 0){
    showToast("Enter a valid title and amount (not 0).");
    return;
  }

  const tx = {
    id: makeId(),
    title,
    amount: Math.round(amount * 100) / 100,
    category,
    date,
    createdAt: Date.now()
  };

  items.unshift(tx);
  saveItems();
  rebuildCategoryFilter();
  render();

  form.reset();
  dateInput.value = new Date().toISOString().slice(0,10);
  showToast("Added ✅");
}

function getVisible(){
  let list = [...items];

  // search
  if(searchTerm){
    list = list.filter(x =>
      x.title.toLowerCase().includes(searchTerm) ||
      x.category.toLowerCase().includes(searchTerm)
    );
  }

  // type filter
  if(filterType === "income") list = list.filter(x => x.amount > 0);
  if(filterType === "expense") list = list.filter(x => x.amount < 0);

  // category filter
  if(filterCategory !== "all"){
    list = list.filter(x => x.category === filterCategory);
  }

  return list;
}

function render(){
  const visible = getVisible();

  // stats
  const amounts = items.map(i => i.amount);
  const total = amounts.reduce((a,b)=>a+b,0);

  const income = amounts.filter(a=>a>0).reduce((a,b)=>a+b,0);
  const expense = amounts.filter(a=>a<0).reduce((a,b)=>a+b,0);

  balanceEl.textContent = formatMoney(total);
  incomeEl.textContent = formatMoney(income);
  expenseEl.textContent = formatMoney(Math.abs(expense));

  // month summary (current month)
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const monthSum = items
    .filter(i => (i.date || "").startsWith(ym))
    .reduce((sum,i)=>sum + i.amount, 0);

  countText.textContent = `${items.length} items`;
  monthText.textContent = `This month: ${formatMoney(monthSum)}`;

  // list
  listEl.innerHTML = "";

  if(visible.length === 0){
    emptyEl.style.display = "block";
  } else {
    emptyEl.style.display = "none";
    for(const tx of visible){
      listEl.appendChild(renderItem(tx));
    }
  }
}

function renderItem(tx){
  const li = document.createElement("li");
  li.className = "item";

  const amountClass = tx.amount >= 0 ? "green" : "red";
  const amountText = tx.amount >= 0 ? `+${formatMoney(tx.amount)}` : `-${formatMoney(Math.abs(tx.amount))}`;

  li.innerHTML = `
    <div class="left">
      <div class="title">${escapeHtml(tx.title)}</div>
      <div class="meta">
        <span>${escapeHtml(tx.category)}</span> •
        <span>${escapeHtml(tx.date)}</span>
      </div>
      <div class="actions">
        <button class="smallbtn" data-action="duplicate">Duplicate</button>
        <button class="smallbtn danger" data-action="delete">Delete</button>
      </div>
    </div>

    <div class="amount ${amountClass}">${amountText}</div>
  `;

  li.querySelector('[data-action="delete"]').addEventListener("click", () => {
    const ok = confirm("Delete this transaction?");
    if(!ok) return;
    items = items.filter(x => x.id !== tx.id);
    saveItems();
    rebuildCategoryFilter();
    render();
    showToast("Deleted.");
  });

  li.querySelector('[data-action="duplicate"]').addEventListener("click", () => {
    const copy = {
      ...tx,
      id: makeId(),
      title: `${tx.title} (copy)`,
      createdAt: Date.now()
    };
    items.unshift(copy);
    saveItems();
    rebuildCategoryFilter();
    render();
    showToast("Duplicated.");
  });

  return li;
}

function rebuildCategoryFilter(){
  const categories = Array.from(new Set(items.map(i => i.category))).sort();
  const current = categoryFilter.value || "all";

  categoryFilter.innerHTML = `<option value="all">All categories</option>` +
    categories.map(c => `<option value="${escapeAttr(c)}">${escapeHtml(c)}</option>`).join("");

  // keep selection if possible
  if(categories.includes(current) || current === "all"){
    categoryFilter.value = current;
  } else {
    categoryFilter.value = "all";
    filterCategory = "all";
  }
}

function exportCSV(){
  if(!items.length){
    showToast("No data to export.");
    return;
  }

  const header = ["Title","Amount","Category","Date"];
  const rows = items.map(i => [
    i.title,
    i.amount,
    i.category,
    i.date
  ]);

  const csv = [header, ...rows]
    .map(r => r.map(cell => `"${String(cell).replaceAll('"','""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();

  URL.revokeObjectURL(url);
  showToast("Exported CSV ✅");
}

function formatMoney(n){
  const num = Number(n) || 0;
  // Keep it simple: $
  return `$${num.toFixed(2)}`;
}

function saveItems(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadItems(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return [];
    const parsed = JSON.parse(raw);
    if(!Array.isArray(parsed)) return [];
    return parsed.map(x => ({
      id: String(x.id),
      title: String(x.title ?? ""),
      amount: Number(x.amount ?? 0),
      category: String(x.category ?? "Other"),
      date: String(x.date ?? new Date().toISOString().slice(0,10)),
      createdAt: Number(x.createdAt ?? Date.now())
    }));
  } catch {
    return [];
  }
}

function makeId(){
  return (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
}

function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>toastEl.classList.remove("show"), 1600);
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function escapeAttr(str){
  return String(str).replaceAll('"',"&quot;");
}
