const tabLogin = document.getElementById("tabLogin");
const tabSignup = document.getElementById("tabSignup");
const indicator = document.querySelector(".tab-indicator");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const alertBox = document.getElementById("alert");
const fillDemo = document.getElementById("fillDemo");

function showAlert(msg, type="success"){
  alertBox.textContent = msg;
  alertBox.classList.remove("hidden","success","error");
  alertBox.classList.add(type);
  setTimeout(()=> alertBox.classList.add("hidden"), 3200);
}

function setTab(which){
  const login = which === "login";

  tabLogin.classList.toggle("active", login);
  tabLogin.setAttribute("aria-selected", String(login));

  tabSignup.classList.toggle("active", !login);
  tabSignup.setAttribute("aria-selected", String(!login));

  loginForm.classList.toggle("hidden", !login);
  signupForm.classList.toggle("hidden", login);

  // move indicator
  indicator.style.left = login ? "6px" : "calc(50% + 5px)";
}

tabLogin.addEventListener("click", ()=> setTab("login"));
tabSignup.addEventListener("click", ()=> setTab("signup"));

document.querySelectorAll("[data-toggle]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const id = btn.getAttribute("data-toggle");
    const input = document.getElementById(id);
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    btn.textContent = isHidden ? "Hide" : "Show";
  });
});

// Storage
function getUsers(){
  try { return JSON.parse(localStorage.getItem("auth_users") || "[]"); }
  catch { return []; }
}
function setUsers(users){
  localStorage.setItem("auth_users", JSON.stringify(users));
}
function saveSession(email, remember){
  const session = { email, time: Date.now() };
  localStorage.setItem("auth_session", JSON.stringify(session));
  if (!remember){
    // still saved for demo, but you can clear on close if you want (not possible reliably without backend)
  }
}

fillDemo.addEventListener("click", ()=>{
  document.getElementById("loginEmail").value = "demo@demo.com";
  document.getElementById("loginPassword").value = "123456";
  showAlert("Demo filled ✅", "success");
});

signupForm.addEventListener("submit", (e)=>{
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("signupEmail").value.trim().toLowerCase();
  const pass = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("confirm").value;

  if (name.length < 2) return showAlert("Name is too short.", "error");
  if (pass.length < 6) return showAlert("Password must be at least 6 characters.", "error");
  if (pass !== confirm) return showAlert("Passwords do not match.", "error");

  const users = getUsers();
  const exists = users.some(u => u.email === email);
  if (exists) return showAlert("This email is already registered.", "error");

  users.push({ name, email, pass });
  setUsers(users);

  showAlert("Account created ✅ الآن سجلي دخول.", "success");
  signupForm.reset();
  setTab("login");
  document.getElementById("loginEmail").value = email;
});

loginForm.addEventListener("submit", (e)=>{
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const pass = document.getElementById("loginPassword").value;
  const remember = document.getElementById("remember").checked;

  const users = getUsers();
  const user = users.find(u => u.email === email && u.pass === pass);

  if (!user) return showAlert("Wrong email or password.", "error");

  saveSession(email, remember);
  showAlert(`Welcome, ${user.name} ✅`, "success");
  loginForm.reset();
});

// Default
setTab("login");
