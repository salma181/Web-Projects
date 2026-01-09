alert("JS connected ✅");
const form = document.getElementById("todoForm");
const input = document.getElementById("todoInput");
const list = document.getElementById("todoList");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  const li = document.createElement("li");
  li.className = "item";

  const span = document.createElement("span");
  span.className = "text";
  span.textContent = text;

  const actions = document.createElement("div");
  actions.className = "actions";

  const doneBtn = document.createElement("button");
  doneBtn.className = "small";
  doneBtn.textContent = "Done";
  doneBtn.addEventListener("click", () => {
    li.classList.toggle("done");
  });

  const delBtn = document.createElement("button");
  delBtn.className = "small";
  delBtn.textContent = "Delete";
  delBtn.addEventListener("click", () => {
    li.remove();
  });

  actions.appendChild(doneBtn);
  actions.appendChild(delBtn);

  li.appendChild(span);
  li.appendChild(actions);

  list.appendChild(li);
  input.value = "";
});
