"use strict";

const STORAGE_KEY = "salma_notes_v1";

const newNoteBtn = document.getElementById("newNoteBtn");
const emptyNewBtn = document.getElementById("emptyNewBtn");
const exportBtn = document.getElementById("exportBtn");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

const notesList = document.getElementById("notesList");
const countText = document.getElementById("countText");
const pinnedText = document.getElementById("pinnedText");
const clearAllBtn = document.getElementById("clearAllBtn");

const emptyState = document.getElementById("emptyState");
const editor = document.getElementById("editor");

const pinBtn = document.getElementById("pinBtn");
const duplicateBtn = document.getElementById("duplicateBtn");
const deleteBtn = document.getElementById("deleteBtn");

const titleInput = document.getElementById("titleInput");
const contentInput = document.getElementById("contentInput");
const metaText = document.getElementById("metaText");
const wordCount = document.getElementById("wordCount");
const toastEl = document.getElementById("toast");

const filterButtons = Array.from(document.querySelectorAll(".chip"));

let notes = loadNotes(); // [{id,title,content,pinned,createdAt,updatedAt}]
let selectedId = null;
let currentFilter = "all";
let currentSearch = "";
let currentSort = sortSelect.value;

render();

/* ---------- Events ---------- */
newNoteBtn.addEventListener("click", createNote);
emptyNewBtn.addEventListener("click", createNote);

exportBtn.addEventListener("click", exportJSON);

searchInput.addEventListener("input", () => {
  currentSearch = searchInput.value.trim().toLowerCase();
  render();
});

sortSelect.addEventListener("change", () => {
  currentSort = sortSelect.value;
  render();
});

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

clearAllBtn.addEventListener("click", () => {
  if (!notes.length) return showToast("No notes to clear.");
  const ok = confirm("Are you sure you want to delete all notes?");
  if (!ok) return;
  notes = [];
  selectedId = null;
  saveNotes();
  render();
  showToast("All notes deleted.");
});

pinBtn.addEventListener("click", () => {
  if (!selectedId) return;
  const n = notes.find(x => x.id === selectedId);
  if (!n) return;
  n.pinned = !n.pinned;
  n.updatedAt = Date.now();
  saveNotes();
  render();
  showToast(n.pinned ? "Pinned." : "Unpinned.");
});

duplicateBtn.addEventListener("click", () => {
  if (!selectedId) return;
  const n = notes.find(x => x.id === selectedId);
  if (!n) return;

  const copy = {
    id: makeId(),
    title: n.title ? `${n.title} (copy)` : "Untitled (copy)",
    content: n.content || "",
    pinned: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  notes.unshift(copy);
  selectedId = copy.id;
  saveNotes();
  render();
  showToast("Duplicated.");
});

deleteBtn.addEventListener("click", () => {
  if (!selectedId) return;
  const ok = confirm("Delete this note?");
  if (!ok) return;
  notes = notes.filter(x => x.id !== selectedId);
  selectedId = notes[0]?.id ?? null;
  saveNotes();
  render();
  showToast("Deleted.");
});

titleInput.addEventListener("input", () => updateSelectedFromEditor());
contentInput.addEventListener("input", () => updateSelectedFromEditor());

/* Save shortcut */
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
    e.preventDefault();
    showToast("Saved automatically ✅");
  }
});

/* ---------- Core ---------- */
function createNote() {
  const note = {
    id: makeId(),
    title: "Untitled",
    content: "",
    pinned: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  notes.unshift(note);
  selectedId = note.id;
  saveNotes();
  render();
  showToast("New note created.");
  titleInput.focus();
  titleInput.select();
}

function updateSelectedFromEditor() {
  if (!selectedId) return;
  const n = notes.find(x => x.id === selectedId);
  if (!n) return;

  n.title = titleInput.value.trim() || "Untitled";
  n.content = contentInput.value;
  n.updatedAt = Date.now();

  saveNotes();
  updateMeta(n);
  updateListOnly(); // smoother UX
}

function selectNote(id) {
  selectedId = id;
  render();
}

function getVisibleNotes() {
  let list = [...notes];

  // filter
  if (currentFilter === "pinned") list = list.filter(n => n.pinned);
  if (currentFilter === "recent") {
    const day = 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - day * 3; // last 3 days
    list = list.filter(n => n.updatedAt >= cutoff);
  }

  // search
  if (currentSearch) {
    list = list.filter(n =>
      (n.title || "").toLowerCase().includes(currentSearch) ||
      (n.content || "").toLowerCase().includes(currentSearch)
    );
  }

  // sort
  list.sort((a, b) => {
    if (currentSort === "updated_desc") return b.updatedAt - a.updatedAt;
    if (currentSort === "updated_asc") return a.updatedAt - b.updatedAt;

    if (currentSort === "title_asc") return (a.title || "").localeCompare(b.title || "");
    if (currentSort === "title_desc") return (b.title || "").localeCompare(a.title || "");

    return 0;
  });

  // Pinned always top
  list.sort((a,b) => (b.pinned === a.pinned ? 0 : b.pinned ? 1 : -1));

  return list;
}

function render() {
  const visible = getVisibleNotes();

  // stats
  const total = notes.length;
  const pinned = notes.filter(n => n.pinned).length;
  countText.textContent = `${total} notes`;
  pinnedText.textContent = `${pinned} pinned`;

  // list
  notesList.innerHTML = "";
  if (!visible.length) {
    const li = document.createElement("li");
    li.className = "note-item";
    li.innerHTML = `
      <div class="note-title">No notes</div>
      <div class="note-preview">Create a note to get started.</div>
      <div class="note-time">—</div>
    `;
    li.addEventListener("click", createNote);
    notesList.appendChild(li);
  } else {
    for (const n of visible) {
      const li = document.createElement("li");
      li.className = "note-item" + (n.id === selectedId ? " active" : "");
      li.innerHTML = `
        <div class="note-top">
          <div class="note-title">${escapeHtml(n.title || "Untitled")}</div>
          ${n.pinned ? `<span class="pill">Pinned</span>` : ""}
        </div>
        <div class="note-preview">${escapeHtml(makePreview(n.content))}</div>
        <div class="note-time">${formatTime(n.updatedAt)}</div>
      `;
      li.addEventListener("click", () => selectNote(n.id));
      notesList.appendChild(li);
    }
  }

  // editor
  if (!selectedId || !notes.find(x => x.id === selectedId)) {
    selectedId = visible[0]?.id ?? notes[0]?.id ?? null;
  }

  if (!selectedId) {
    emptyState.classList.remove("hidden");
    editor.classList.add("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  editor.classList.remove("hidden");

  const selected = notes.find(x => x.id === selectedId);
  titleInput.value = selected.title || "Untitled";
  contentInput.value = selected.content || "";
  pinBtn.textContent = selected.pinned ? "Unpin" : "Pin";

  updateMeta(selected);
}

function updateListOnly() {
  // update stats + list but keep editor as-is
  const visible = getVisibleNotes();

  const total = notes.length;
  const pinned = notes.filter(n => n.pinned).length;
  countText.textContent = `${total} notes`;
  pinnedText.textContent = `${pinned} pinned`;

  // rebuild list quickly (simple + reliable)
  notesList.innerHTML = "";
  for (const n of visible) {
    const li = document.createElement("li");
    li.className = "note-item" + (n.id === selectedId ? " active" : "");
    li.innerHTML = `
      <div class="note-top">
        <div class="note-title">${escapeHtml(n.title || "Untitled")}</div>
        ${n.pinned ? `<span class="pill">Pinned</span>` : ""}
      </div>
      <div class="note-preview">${escapeHtml(makePreview(n.content))}</div>
      <div class="note-time">${formatTime(n.updatedAt)}</div>
    `;
    li.addEventListener("click", () => selectNote(n.id));
    notesList.appendChild(li);
  }
}

function updateMeta(note) {
  metaText.textContent = `Last updated: ${formatTime(note.updatedAt)}`;
  wordCount.textContent = `${countWords(note.content)} words`;
}

/* ---------- Export ---------- */
function exportJSON() {
  const data = JSON.stringify(notes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "notes-export.json";
  a.click();

  URL.revokeObjectURL(url);
  showToast("Exported JSON.");
}

/* ---------- Storage ---------- */
function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(n => ({
      id: String(n.id),
      title: String(n.title ?? "Untitled"),
      content: String(n.content ?? ""),
      pinned: Boolean(n.pinned),
      createdAt: Number(n.createdAt ?? Date.now()),
      updatedAt: Number(n.updatedAt ?? Date.now()),
    }));
  } catch {
    return [];
  }
}

/* ---------- Helpers ---------- */
function makeId() {
  return (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
}

function makePreview(content) {
  const t = (content || "").trim().replace(/\s+/g, " ");
  return t.length ? t.slice(0, 70) : "No content…";
}

function countWords(text) {
  const t = (text || "").trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "—";
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove("show"), 1600);
}
