"use strict";

const USERS_KEY = "salma_auth_users_v1";
const SESSION_KEY = "salma_auth_session_v1";

const tabs = document.querySelectorAll(".tab");
const panes = document.querySelectorAll(".form");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const toggleLoginPass = document.getElementById("toggleLoginPass");

const regName = document.getElementById("regName");
const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");
const regConfirm = document.getElementById("regConfirm");
const toggleRegPass = document.getElementById("toggleRegPass");

const welcomeBox = document.getElementById("welcome");
const welcomeText = document.getElementById("welcomeText");
const logoutBtn = document.getElementById("logoutBtn");

const toastEl = document.getElementById("toast");

function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>toastEl.classList.remove("show"), 1600);
}

function loadUsers(){
  try{
    const raw = localStorage.getItem(USERS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function saveUsers(users){
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function setSession(email){
  localStorage.setItem(SESSION_KEY, email);
}
function getSession(){
  return localStorage.getItem(SESSION_KEY);
}
function clearSession(){
  localStorage.removeItem(SESSION_KEY);
}

function isEmailValid(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function switchTab(name){
  tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  panes.forEach(p => p.classList.toggle("show", p.dataset.pane === name));
  welcomeBox.classList.add("hidden");
}

tabs.forEach(t => t.addEventListener("click", () => switchTab(t.dataset.tab)));

toggleLoginPass.addEventListener("click", () => {
  loginPassword.type = loginPassword.type === "password" ? "text" : "password";
  toggleLoginPass.textContent = loginPassword.type === "password" ? "Show" : "Hide";
});

toggleRegPass.addEventListener("click", () => {
  regPassword.type = regPassword.type === "password" ? "text" : "password";
  toggleRegPass.textContent = regPassword.type === "password" ? "Show" : "Hide";
});

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = regName.value.trim();
  const email = regEmail.value.trim().toLowerCase();
  const pass = regPassword.value;
  const confirm = regConfirm.value;

  if(name.length < 3) return showToast("Name is too short.");
  if(!isEmailValid(email)) return showToast("Enter a valid email.");
  if(pass.length < 6) return showToast("Password must be 6+ characters.");
  if(pass !== confirm) return showToast("Passwords do not match.");

  const users = loadUsers();
  const exists = users.some(u => u.email === email);
  if(exists) return showToast("Email already registered.");

  // Simple demo user (front-end only)
  users.push({ name, email, pass });
  saveUsers(users);

  showToast("Account created ✅ Now login.");
  registerForm.reset();
  switchTab("login");
  loginEmail.value = email;
  loginPassword.focus();
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = loginEmail.value.trim().toLowerCase();
  const pass = loginPassword.value;

  if(!isEmailValid(email)) return showToast("Enter a valid email.");
  if(pass.length < 6) return showToast("Password must be 6+ characters.");

  const users = loadUsers();
  const user = users.find(u => u.email === email && u.pass === pass);
  if(!user) return showToast("Wrong email or password.");

  setSession(email);
  showWelcome(user);
});

function showWelcome(user){
  panes.forEach(p => p.classList.remove("show"));
  tabs.forEach(t => t.classList.remove("active"));

  welcomeText.textContent = `Logged in as ${user.name} (${user.email}).`;
  welcomeBox.classList.remove("hidden");
  showToast("Logged in ✅");
}

logoutBtn.addEventListener("click", () => {
  clearSession();
  showToast("Logged out.");
  switchTab("login");
});

// Auto-login if session exists
(function init(){
  const email = getSession();
  if(!email) return switchTab("login");

  const users = loadUsers();
  const user = users.find(u => u.email === email);
  if(user){
    showWelcome(user);
  } else {
    clearSession();
    switchTab("login");
  }
})();
