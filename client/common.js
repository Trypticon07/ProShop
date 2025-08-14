const lightBtn = document.getElementById("light-btn");
const darkBtn = document.getElementById("dark-btn");
const systemBtn = document.getElementById("system-btn");

const logOutButtons = document.querySelectorAll(".logOut");
const profileButtons = document.querySelectorAll(".profileBtn");
const catalogButtons = document.querySelectorAll(".catalogBtn");
const newAccountButtons = document.querySelectorAll(".new-account-btn");

const logInButtons = document.getElementById("logInButtons");
const profileDropdown = document.getElementById("profileDropdown");

const openCartBtn = document.getElementById("open-cart");

const amountInCart = document.getElementById("amount-in-cart");

const cartModal = document.getElementById("cart-modal");
const closeCartBtn = document.getElementById("close-cart");
const cartItemsTable = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutButtons = document.querySelectorAll("#checkout-btn");

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

const footer = document.getElementById("footer-container");

const alertContainer = document.getElementById("alert-container");

let session = false;

// Popover
const popoverTriggerList = document.querySelectorAll(
  '[data-bs-toggle="popover"]'
);
const popoverList = [...popoverTriggerList].map((popoverTriggerEl) => {
  const popover = new bootstrap.Popover(popoverTriggerEl, {
    container: "body",
    html: true,
    placement: "left",
    content:
      "<a class='text-decoration-none' id='clear-cart' target='_blank'>Clear cart</a>",
  });

  popoverTriggerEl.addEventListener("shown.bs.popover", () => {
    const clearCartElement = document.getElementById("clear-cart");
    clearCartElement.addEventListener("click", (e) => {
      e.preventDefault();
      clearCart();
    });
  });

  return popover;
});

// event listeners
logOutButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
});

profileButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "profile.html";
  });
});

catalogButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "./index.html";
  });
});

newAccountButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    fetch(
      "http://localhost:3000/logout",
      {
        method: "POST",
        credentials: "include",
      },
      {
        withCredentials: true,
      }
    )
      .then((res) => {
        if (res.ok) {
          window.location.href = "signUp.html";
        }
      })
      .catch((err) => {
        console.error("logout error:", err);
      });
  });
});

searchForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const query = document.getElementById("searchInput").value.trim();
  if (query) {
    window.location.href = `index.html?search=${encodeURIComponent(query)}`;
  }
});

document.querySelector("#signUp").addEventListener("click", () => {
  window.location.href = "signUp.html";
});

document.querySelector("#logIn").addEventListener("click", () => {
  window.location.href = "logIn.html";
});

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "system";
  applyTheme(savedTheme);
});

document.addEventListener("DOMContentLoaded", function () {
  const btnHolder = document.querySelector(".btn-holder-1");
  if (btnHolder) {
    btnHolder.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }
});

// cart event listeners
openCartBtn.addEventListener("click", (e) => {
  e.preventDefault();
  loadCartItems();
  cartModal.classList.remove("hidden");
});

closeCartBtn.addEventListener("click", () => {
  cartModal.classList.add("hidden");
});

cartModal.addEventListener("click", (e) => {
  if (e.target === cartModal) {
    cartModal.classList.add("hidden");
  }
});

// session
fetch("http://localhost:3000/session", {
  credentials: "include",
})
  .then((res) => {
    if (!res.ok) {
      logInButtons.classList.remove("d-none");
      profileDropdown.classList.add("d-none");
      session = false;
      return null;
    }
    return res.json();
  })
  .then((data) => {
    if (data && data.loggedIn) {
      logInButtons.classList.add("d-none");
      profileDropdown.classList.remove("d-none");
      session = true;
      cartHistory();
    }
  })
  .catch((err) => {
    console.error("Session error:", err);
    logInButtons.classList.remove("d-none");
    profileDropdown.classList.add("d-none");
    session = false;
  });

function logout() {
  fetch("http://localhost:3000/logout", {
    method: "POST",
    credentials: "include",
  })
    .then((res) => {
      if (res.ok) {
        window.location.href = "index.html";
      }
    })
    .catch((err) => {
      console.error("logout error:", err);
    });
}

//
// theme logic
//
lightBtn.addEventListener("click", () => applyTheme("light"));
darkBtn.addEventListener("click", () => applyTheme("dark"));
systemBtn.addEventListener("click", () => applyTheme("system"));

function applyTheme(theme) {
  document.body.classList.remove("light-theme", "dark-theme");
  if (theme === "light") {
    document.body.classList.add("light-theme");
    document.body.setAttribute("data-bs-theme", "light");
  } else if (theme === "dark") {
    document.body.classList.add("dark-theme");
    document.body.setAttribute("data-bs-theme", "dark");
  } else if (theme === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    document.body.classList.add(prefersDark ? "dark-theme" : "light-theme");
  }

  localStorage.setItem("theme", theme);
}

//
// cart logic
//
const cart = JSON.parse(localStorage.getItem("cart")) || [];

let totalProducts = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
if (totalProducts > 0) {
  amountInCart.classList.remove("d-none");
  amountInCart.textContent = totalProducts;
}

function loadCartItems() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartItemsTable.innerHTML = "";
  let totalPrice = 0;

  if (cart.length === 0) {
    cartItemsTable.innerHTML = `<tr><td colspan="5" class="text-center">Cart is empty</td></tr>`;
    cartTotal.textContent = "Total: $0.00";
    return;
  }

  cart.forEach((item, index) => {
    const productId = item.product_id;
    const productName = item.productName;
    const price = Number(item.productPrice);
    const itemTotal = price * item.quantity;
    totalPrice += itemTotal;

    const row = `
      <tr>
        <td>${productId}</td>
        <td>${productName}</td>
        <td class="text-center">
          <div class="d-flex align-items-center justify-content-center gap-2">
            <button class="btn btn-outline-secondary btn-sm square-btn quantity-decrease" data-id="${productId}">-</button>
            <span class="fw-bold">${item.quantity}</span>
            <button class="btn btn-outline-secondary btn-sm square-btn quantity-increase" data-id="${productId}">+</button>
          </div>
        </td>
        <td>$${price.toFixed(2)}</td>
        <td>$${itemTotal.toFixed(2)}</td>
      </tr>
    `;
    cartItemsTable.insertAdjacentHTML("beforeend", row);
    if (session) {
      addToCart(productId, item.quantity);
    }
  });

  cartTotal.textContent = `Total: $${totalPrice.toFixed(2)}`;

  document.querySelectorAll(".quantity-increase").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateQuantity(btn.dataset.id, 1);
    });
  });

  document.querySelectorAll(".quantity-decrease").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateQuantity(btn.dataset.id, -1);
    });
  });
}

function addToCart(productId, quantity) {
  fetch("http://localhost:3000/cart/add", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id: productId,
      quantity,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.text();
      }
      return res.json();
    })
    .catch((err) => {
      if (err.response?.status === 401) {
        console.log("err" + err);
      }
    });
}

function updateQuantity(productId, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = cart.find((p) => p.product_id === productId);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter((p) => p.product_id !== productId);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  totalProducts = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  if (totalProducts > 0) {
    amountInCart.classList.remove("d-none");
    amountInCart.textContent = totalProducts;
  }
  loadCartItems();
}

function clearCart() {
  localStorage.removeItem("cart");
  loadCartItems();
  amountInCart.textContent = "0";
  amountInCart.classList.add("d-none");
  if (session) {
    fetch("http://localhost:3000/cart/clear", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to clear cart");
        }
        return res.json();
      })
      .then((data) => {})
      .catch((err) => console.log(err));
  }
}

async function cartHistory() {
  fetch("http://localhost:3000/cart/history", {
    method: "GET",
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load cart history");
      return res.json();
    })
    .then((data) => {
      if (!data.cart_items || !Array.isArray(data.cart_items)) return;

      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      const fetchPromises = data.cart_items.map((cartItem) => {
        return fetch(`http://localhost:3000/product?id=${cartItem.product_id}`)
          .then((res) => res.json())
          .then((productData) => {
            if (!productData || !productData[0]) return;

            const product = productData[0];
            const existing = cart.find(
              (item) => item.product_id == cartItem.product_id
            );

            if (existing) {
              existing.quantity = cartItem.quantity;
            } else {
              cart.push({
                product_id: cartItem.product_id,
                productName: product.name,
                productPrice: product.price,
                quantity: cartItem.quantity,
              });
            }
          })
          .catch((err) => console.error("Error loading product:", err));
      });

      Promise.all(fetchPromises).then(() => {
        localStorage.setItem("cart", JSON.stringify(cart));

        amountInCart.textContent = cart.reduce(
          (sum, item) => sum + (item.quantity || 0),
          0
        );
        amountInCart.classList.toggle("d-none", cart.length === 0);
      });
    })
    .catch((err) => console.error(err));
}
