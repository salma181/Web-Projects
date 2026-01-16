const PRODUCTS = [
  { id: "p1", title: "Cozy Mug", category: "Accessories", price: 9.99, emoji: "☕" },
  { id: "p2", title: "Wireless Mouse", category: "Tech", price: 18.50, emoji: "🖱️" },
  { id: "p3", title: "Notebook Set", category: "Stationery", price: 7.25, emoji: "📓" },
  { id: "p4", title: "Desk Lamp", category: "Home", price: 22.00, emoji: "💡" },
  { id: "p5", title: "Canvas Tote", category: "Accessories", price: 11.00, emoji: "👜" },
  { id: "p6", title: "Headphones", category: "Tech", price: 29.99, emoji: "🎧" },
  { id: "p7", title: "Planner", category: "Stationery", price: 12.75, emoji: "🗓️" },
  { id: "p8", title: "Scented Candle", category: "Home", price: 10.50, emoji: "🕯️" }
];

const CART_KEY = "mini_shop_cart_v1";

const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartItemsEl = document.getElementById("cartItems");
const backdrop = document.getElementById("backdrop");

const cartCount = document.getElementById("cartCount");
const subtotalEl = document.getElementById("subtotal");
const shippingEl = document.getElementById("shipping");
const totalEl = document.getElementById("total");
const clearCartBtn = document.getElementById("clearCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");

const toast = document.getElementById("toast");

let cart = loadCart(); // { [id]: qty }

function money(n) {
  return `$${n.toFixed(2)}`;
}

function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 1400);
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
}
function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  backdrop.hidden = true;
}

openCartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
backdrop.addEventListener("click", closeCart);

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch {
    return {};
  }
}

function getCategories() {
  return ["all", ...new Set(PRODUCTS.map(p => p.category))];
}

function renderCategoryFilter() {
  categoryFilter.innerHTML = "";
  getCategories().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat === "all" ? "All categories" : cat;
    categoryFilter.appendChild(opt);
  });
}

function filteredProducts() {
  const q = searchInput.value.trim().toLowerCase();
  const cat = categoryFilter.value;

  return PRODUCTS.filter(p => {
    const matchQ =
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);

    const matchCat = cat === "all" ? true : p.category === cat;
    return matchQ && matchCat;
  });
}

function renderProducts() {
  productsGrid.innerHTML = "";

  const items = filteredProducts();
  if (items.length === 0) {
    productsGrid.innerHTML = `<div class="muted">No products found.</div>`;
    return;
  }

  items.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-img">${p.emoji}</div>
      <div class="card-body">
        <h4 class="card-title">${p.title}</h4>
        <div class="card-meta">${p.category}</div>
        <div class="row-between">
          <div class="price">${money(p.price)}</div>
          <button class="btn" data-add="${p.id}">Add</button>
        </div>
      </div>
    `;
    productsGrid.appendChild(card);
  });

  productsGrid.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-add");
      addToCart(id);
    });
  });
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  showToast("Added to cart ✅");
}

function removeFromCart(id) {
  delete cart[id];
  saveCart();
  renderCart();
}

function changeQty(id, delta) {
  const next = (cart[id] || 0) + delta;
  if (next <= 0) removeFromCart(id);
  else {
    cart[id] = next;
    saveCart();
    renderCart();
  }
}

function cartTotalCount() {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

function calcSubtotal() {
  let sum = 0;
  for (const [id, qty] of Object.entries(cart)) {
    const p = PRODUCTS.find(x => x.id === id);
    if
