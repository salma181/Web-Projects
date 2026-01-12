const STORAGE_KEY = "salma_todo_tasks_v1";

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const countText = document.getElementById("countText");
const clearDoneBtn = document.getElementById("clearDoneBtn");

let filter = "all"; // all | active | done
let tasks = loadTasks();

// ---------- Storage ----------
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ---------- Helpers ----------
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function normalizeText(text) {
  return text.trim().replace(/\s+/g, " ");
}

function setFilter(newFilter) {
  filter = newFilter;
  document.querySelectorAll(".chip").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  render();
}

// ---------- Actions ----------
function addTask() {
  const text = normalizeText(taskInput.value);
  if (!text) return;

  tasks.unshift({
    id: uid(),
    text,
    done: false,
    createdAt: Date.now(),
  });

  taskInput.value = "";
  saveTasks();
  render();
  taskInput.focus();
}

function toggleDone(id) {
  tasks = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function clearDone() {
  tasks = tasks.filter((t) => !t.done);
  saveTasks();
  render();
}

// ---------- Render ----------
function filteredTasks() {
  if (filter === "active") return tasks.filter((t) => !t.done);
  if (filter === "done") return tasks.filter((t) => t.done);
  return tasks;
}

function render() {
  const list = filteredTasks();

  taskList.innerHTML = "";

  list.forEach((t) => {
    const li = document.createElement("li");
    li.className = "item" + (t.done ? " done" : "");
    li.dataset.id = t.id;

    const text = document.createElement("div");
    text.className = "taskText";
    text.textContent = t.text;

    const actions = document.createElement("div");
    actions.className = "actions";

    // ✅ toggle done
    const okBtn = document.createElement("button");
    okBtn.className = "iconBtn ok";
    okBtn.title = "Done";
    okBtn.type = "button";
    okBtn.textContent = "✓";
    okBtn.addEventListener("click", () => toggleDone(t.id));

    // ❌ delete
    const delBtn = document.createElement("button");
    delBtn.className = "iconBtn del";
    delBtn.title = "Delete";
    delBtn.type = "button";
    delBtn.textContent = "✕";
    delBtn.addEventListener("click", () => deleteTask(t.id));

    actions.appendChild(okBtn);
    actions.appendChild(delBtn);

    li.appendChild(text);
    li.appendChild(actions);

    // Double click on task text to toggle (ميزة لطيفة)
    text.addEventListener("dblclick", () => toggleDone(t.id));

    taskList.appendChild(li);
  });

  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.done).length;
  const activeCount = total - doneCount;

  countText.textContent =
    total === 0
      ? "No tasks yet"
      : `${total} tasks • ${activeCount} active • ${doneCount} done`;

  clearDoneBtn.disabled = doneCount === 0;
  clearDoneBtn.style.opacity = doneCount === 0 ? "0.5" : "1";
}

// ---------- Events ----------
addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

clearDoneBtn.addEventListener("click", clearDone);

document.querySelectorAll(".chip").forEach((btn) => {
  btn.addEventListener("click", () => setFilter(btn.dataset.filter));
});

// First render
render();
