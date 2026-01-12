// عناصر الصفحة
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");

// مفتاح التخزين
const STORAGE_KEY = "salma_todo_tasks";

// قراءة المهام من التخزين
function getTasks() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// حفظ المهام في التخزين
function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// رسم المهام في الصفحة
function renderTasks() {
  todoList.innerHTML = "";
  const tasks = getTasks();

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "todo-item";

    // نص المهمة
    const span = document.createElement("span");
    span.textContent = task.text;
    span.className = task.done ? "done" : "";

    // زر Done
    const doneBtn = document.createElement("button");
    doneBtn.textContent = "Done";
    doneBtn.className = "btn done-btn";
    doneBtn.addEventListener("click", () => {
      const updated = getTasks();
      updated[index].done = !updated[index].done;
      saveTasks(updated);
      renderTasks();
    });

    // زر Delete
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "btn del-btn";
    delBtn.addEventListener("click", () => {
      const updated = getTasks();
      updated.splice(index, 1);
      saveTasks(updated);
      renderTasks();
    });

    // تجميع داخل li
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.appendChild(doneBtn);
    actions.appendChild(delBtn);

    li.appendChild(span);
    li.appendChild(actions);
    todoList.appendChild(li);
  });
}

// إضافة مهمة جديدة
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = todoInput.value.trim();
  if (!text) return;

  const tasks = getTasks();
  tasks.push({ text, done: false });
  saveTasks(tasks);

  todoInput.value = "";
  renderTasks();
});

// أول ما تفتح الصفحة ارسم المهام المخزنة
renderTasks();
