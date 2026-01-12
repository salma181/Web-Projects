const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const searchInput = document.getElementById("searchInput");
const listEl = document.getElementById("list");
const counterEl = document.getElementById("counter");
const clearDoneBtn = document.getElementById("clearDone");
const clearAllBtn = document.getElementById("clearAll");
const chips = document.querySelectorAll(".chip");

const STORAGE_KEY = "salma_todo_v1";

let tasks = loadTasks();
let currentFilter = "all";
let searchQuery = "";

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addTask(text) {
  const t = text.trim();
  if (!t) return;

  tasks.unshift({
    id: Date.now(),
    text: t,
    done: false,
    createdAt: new Date().toISOString()
  });

  saveTasks();
  render();
}

function toggleDone(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function clearDone() {
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  render();
}

function clearAll() {
  tasks = [];
  saveTasks();
  render();
}

function setFilter(filter) {
  currentFilter = filter;
  chips.forEach(c => c.classList.toggle("active", c.dataset.filter === filter));
  render();
}

function setSearch(q) {
  searchQuery = q.trim().toLowerCase();
  render();
}

function getVisibleTasks() {
  let filtered = [...tasks];

  if (currentFilter === "done") filtered = filtered.filter(t => t.done);
  if (currentFilter === "active") filtered = filtered.filter(t => !t.done);

  if (searchQuery) filtered = filtered.filter(t => t.text.toLowerCase().includes(searchQuery));

  return filtered;
}

function render() {
  listEl.innerHTML = "";

  const visible = getVisibleTasks();
  visible.forEach(t => {
    const item = document.createElement("div");
    item.className = "item" + (t.done ? " done" : "");

    const text = document.createElement("div");
    text.className = "text";
    text.textContent = t.text;

    const actions = document.createElement("div");
    actions.className = "actions";

    // ✅ Button (mark done/undo)
    const okBtn = document.createElement("button");
    okBtn.className = "iconBtn ok";
    okBtn.type = "button";
    okBtn.title = t.done ? "إلغاء الإنجاز" : "تم";
    okBtn.textContent = "✅";
    okBtn.addEventListener("click", () => toggleDone(t.id));

    // ❌ Button (delete)
    const delBtn = document.createElement("button");
    delBtn.className = "iconBtn del";
    delBtn.type = "button";
    delBtn.title = "حذف";
    delBtn.textContent = "❌";
    delBtn.addEventListener("click", () => deleteTask(t.id));

    actions.appendChild(okBtn);
    actions.appendChild(delBtn);

    item.appendChild(text);
    item.appendChild(actions);

    listEl.appendChild(item);
  });

  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  counterEl.textContent = `${total} مهام • ${done} منجز`;
}

/* Events */
addBtn.addEventListener("click", () => addTask(taskInput.value));
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask(taskInput.value);
});

searchInput.addEventListener("input", (e) => setSearch(e.target.value));

chips.forEach(chip => {
  chip.addEventListener("click", () => setFilter(chip.dataset.filter));
});

clearDoneBtn.addEventListener("click", clearDone);
clearAllBtn.addEventListener("click", clearAll);

/* First render */
render();
