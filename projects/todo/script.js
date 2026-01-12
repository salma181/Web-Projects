const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

function createTask(text) {
  const li = document.createElement("li");

  const span = document.createElement("span");
  span.className = "task-text";
  span.textContent = text;

  const actions = document.createElement("div");
  actions.className = "actions";

  const doneBtn = document.createElement("button");
  doneBtn.className = "icon-btn done-btn";
  doneBtn.textContent = "✅";
  doneBtn.title = "Done";

  const delBtn = document.createElement("button");
  delBtn.className = "icon-btn del-btn";
  delBtn.textContent = "❌";
  delBtn.title = "Delete";

  doneBtn.addEventListener("click", () => {
    li.classList.toggle("done");
  });

  delBtn.addEventListener("click", () => {
    li.remove();
  });

  actions.appendChild(doneBtn);
  actions.appendChild(delBtn);

  li.appendChild(span);
  li.appendChild(actions);

  taskList.appendChild(li);
}

addBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return;
  createTask(text);
  input.value = "";
});

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addBtn.click();
});
