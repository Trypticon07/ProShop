const sendBtn = document.getElementById("send-btn");
const userInput = document.querySelector("#user-message");

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

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

const container = document.getElementById("product-container");

const chatBtn = document.getElementById("open-chat-btn");
const footer = document.getElementById("footer-container");

const alertContainer = document.getElementById("alert-container");

const emailInput = document.querySelector("#main-email-input");
const emailFeedback = document.querySelector("#emailFeedback");
const backendResponse = document.querySelector(".backend-response");

let isProcessing = false;

let isValidEmail = false;

cartHistory();

const cart = JSON.parse(localStorage.getItem("cart")) || [];

let totalProducts = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
if (totalProducts > 0) {
  console.log(totalProducts);
  amountInCart.classList.remove("d-none");
  amountInCart.textContent = totalProducts;
}

(() => {
  const forms = document.querySelectorAll(".needs-validation");

  emailInput.classList.remove("is-invalid");

  emailInput.addEventListener("input", () => {
    const email = emailInput.value.trim();

    isValidEmail =
      email.length >= 6 &&
      email.length <= 64 &&
      email.includes("@") &&
      email.includes(".") &&
      email.indexOf("@") !== 0 &&
      email.lastIndexOf(".") > email.indexOf("@");

    if (!isValidEmail) {
      emailInput.classList.remove("is-valid");
      emailInput.classList.add("is-invalid");
      emailFeedback.textContent = "Please enter a valid email address.";
    } else {
      emailInput.classList.remove("is-invalid");
      emailInput.classList.add("is-valid");
      emailFeedback.textContent = "";
    }
  });
  Array.from(forms).forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!isValidEmail) return;
      Submit();
    });
  });
})();

function Submit() {
  axios
    .post("http://localhost:3000/subscribe", {
      email: document.querySelector("#main-email-input").value,
    })
    .then((response) => {
      backendResponse.textContent = "Successfully added email!";
    })
    .catch((err) => {
      const res = err.response.data;
      const status = err.response?.status;
      if (status === 400) {
        if (res?.isInvalid) {
          if (res.field === "email") {
            emailInput.classList.add("is-invalid");
            emailFeedback.textContent = res.error;
          }
        }
      } else if (err.response?.status === 429) {
        if (res?.isInvalid) {
          if (res.field === "rateLimit") {
            backendResponse.textContent = res.error;
            backendResponse.classList.remove("d-none");
            backendResponse.classList.add("d-block");
          }
        }
      } else {
        console.log("Error while waiting for server response: " + err);
        alert(
          "There was an error while trying to subscribe. If this keeps happening, inform the site owner with this info: " +
            err
        );
      }
    });
}

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
    // e.preventDefault();
    // getProducts();
    window.location.href = "./index.html#product-container";
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

document.querySelector("#signUp").addEventListener("click", () => {
  window.location.href = "signUp.html";
});

document.querySelector("#logIn").addEventListener("click", () => {
  window.location.href = "logIn.html";
});
document.getElementById("close-chat").addEventListener("click", () => {
  document.getElementById("chat-box").style.display = "none";
});

chatBtn.addEventListener("click", () => {
  getChatHistory();
  const chatBox = document.getElementById("chat-box");
  chatBox.style.display = chatBox.style.display === "flex" ? "none" : "flex";
});

document.addEventListener("DOMContentLoaded", function () {
  const btnHolder = document.querySelector(".btn-holder-1");
  if (btnHolder) {
    btnHolder.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  getProducts();
  const savedTheme = localStorage.getItem("theme") || "system";
  applyTheme(savedTheme);
});

userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !isProcessing) {
    event.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener("click", () => {
  sendMessage();
});

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

function loadCartItems() {
  cartHistory();
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

    addToCart(productId, item.quantity);
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
    console.log(totalProducts);
    amountInCart.classList.remove("d-none");
    amountInCart.textContent = totalProducts;
  }
  loadCartItems();
}

window.addEventListener("scroll", () => {
  const footerRect = footer.getBoundingClientRect();
  const overlap = window.innerHeight - footerRect.top;

  if (overlap > 0) {
    chatBtn.style.bottom = `${1 + overlap}px`;
  } else {
    chatBtn.style.bottom = "20px";
  }
});

lightBtn.addEventListener("click", () => applyTheme("light"));
darkBtn.addEventListener("click", () => applyTheme("dark"));
systemBtn.addEventListener("click", () => applyTheme("system"));

function applyTheme(theme) {
  document.body.classList.remove("light-theme", "dark-theme");

  if (theme === "light") {
    document.body.classList.add("light-theme");
  } else if (theme === "dark") {
    document.body.classList.add("dark-theme");
  } else if (theme === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    document.body.classList.add(prefersDark ? "dark-theme" : "light-theme");
  }

  localStorage.setItem("theme", theme);
}
fetch("http://localhost:3000/session", {
  credentials: "include",
})
  .then((res) => {
    if (!res.ok) {
      logInButtons.classList.remove("d-none");
      profileDropdown.classList.add("d-none");
      return null;
    }
    return res.json();
  })
  .then((data) => {
    if (data && data.loggedIn) {
      logInButtons.classList.add("d-none");
      profileDropdown.classList.remove("d-none");
    }
  })
  .catch((err) => {
    console.error("Session error:", err);
    logInButtons.classList.remove("d-none");
    profileDropdown.classList.add("d-none");
  });

function getProducts() {
  fetch("http://localhost:3000/products")
    .then((res) => res.json())
    .then((products) => {
      appendProduct(products);
    })
    .catch((err) => {
      console.error("Error loading products:", err);
    });
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/products/search?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      container.innerHTML = `<p>Error: ${response.statusText}</p>`;
      return;
    }
    const products = await response.json();

    if (products.length === 0) {
      container.innerHTML = `<div
            class="d-flex flex-column align-items-center text-center py-5 w-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="200"
              height="200"
              fill="currentColor"
              class="bi bi-search"
              viewBox="0 0 16 16"
            >
              <path
                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"
              />
            </svg>
            <h2 class="fs-3">
              Oops! nothing was found! Please, rephrase your request and try
              again
            </h2>
          </div>`;
      return;
    }
    appendProduct(products);
  } catch (error) {
    container.innerHTML = `<p>Error: ${error.message}</p>`;
  }
});

function appendProduct(products) {
  container.innerHTML = "";
  products.forEach((product) => {
    let image_src = "";
    if (product.image_urls) {
      const imageArray = product.image_urls.replace(/[{}]/g, "").split(",");
      image_src = "images/png/" + imageArray[0];
    }
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";

    const card = document.createElement("div");
    card.className = "card h-100";

    card.innerHTML = `
        <img src="${
          image_src || "images/png/projectImage.png"
        }" class="card-img-top" alt="images/png/projectImage.png">
        <div class="card-body">
          <a href="product.html?id=${
            product.id
          }" class="text-decoration-none"><h5 class="card-title">${
      product.name
    }</h5></a>
          <p class="card-text">${product.description}</p>
        </div>
        <div class="card-footer d-flex justify-content-between align-items-center">
        <div class="product-price"></div>
          <button class="btn btn-primary btn-sm d-flex align-items-center buy-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cart2 me-1" viewBox="0 0 16 16">
              <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5M3.14 5l1.25 5h8.22l1.25-5zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0m9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0"/>
            </svg>
            Buy
          </button>
        </div>
      `;
    const price = parseFloat(product.price);
    const [dollars, cents] = isNaN(price)
      ? ["0", "00"]
      : price.toFixed(2).split(".");

    card.querySelector(".product-price").innerHTML = `
      <span class="dollar-sign align-self-start">$</span>
      <span class="main-price">${dollars}</span>
      <span class="cents align-self-start">${cents}</span>
      `;

    col.appendChild(card);
    container.appendChild(col);
  });
  updateButtons();
}

function updateButtons() {
  const buyButtons = document.querySelectorAll(".buy-btn");
  buyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Adding message
      const alert = document.createElement("div");
      alert.className = "alert alert-success alert-dismissible fade show mb-2";
      alert.setAttribute("role", "alert");
      alert.innerHTML = `Product added to cart.
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;

      alertContainer.appendChild(alert);

      // If more than 2 messages deliting the old one
      const alerts = alertContainer.querySelectorAll(".alert");
      if (alerts.length > 2) {
        alerts[0].remove();
      }
      setTimeout(() => {
        alert.classList.remove("show");
        alert.classList.add("fade");
        setTimeout(() => alert.remove(), 150);
      }, 2000);

      // Cart logic
      const card = btn.closest(".card");
      const link = card.querySelector("a[href*='product.html?id=']");
      const url = new URL(link.href);
      const productId = url.searchParams.get("id");
      let productName;
      let productPrice;
      let quantity = 1;

      fetch(`http://localhost:3000/product?id=${productId}`)
        .then((res) => res.json())
        .then((data) => {
          productName = data[0].name;
          productPrice = data[0].price;

          let cart = JSON.parse(localStorage.getItem("cart")) || [];

          const existing = cart.find((item) => item.product_id == productId);

          if (existing) {
            existing.quantity++;
            quantity = existing.quantity;
          } else {
            cart.push({
              product_id: productId,
              productName,
              productPrice,
              quantity,
            });
          }
          localStorage.setItem("cart", JSON.stringify(cart));
          amountInCart.textContent = cart.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          );
          amountInCart.classList.remove("d-none");
          addToCart(productId, quantity);
        })
        .catch((err) => console.error("Error loading product:", err));
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
        return res.text().then((text) => {
          throw new Error(text || "Server error");
        });
      }
      return res.json();
    })
    .catch((err) => console.error(err));
}
function clearCart() {
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
    .then((data) => {
      localStorage.removeItem("cart");
      loadCartItems();
      amountInCart.textContent = "0";
      amountInCart.classList.add("d-none");
    })
    .catch((err) => console.error(err));
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

function getChatHistory() {
  fetch("http://localhost:3000/chat/history", {
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) return [];
      return res.json();
    })
    .then((messages) => {
      messages.forEach((msg) => {
        appendMessage(msg.sender === "user" ? "You" : "Bot", msg.message);
      });
    })
    .catch((err) => {
      console.error("Error loading history:", err);
    });
}

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

function sendMessage() {
  const input = document.getElementById("user-message");
  const message = input.value.trim();
  if (!message) return;

  appendMessage("You", message);
  input.value = "";
  sendBtn.disabled = true;
  isProcessing = true;

  const typingElement = appendMessage("Bot", "Typing...");

  fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ message }),
  })
    .then((res) => res.json())
    .then((data) => {
      typingElement.innerHTML = `<strong>Bot:</strong> ${data.reply}`;
      sendBtn.disabled = false;
      isProcessing = false;
      //appendMessage("Bot", data.reply);
    })
    .catch((err) => {
      typingElement.innerHTML = `<strong>Error:</strong> Unable to access the server`;
      //appendMessage("Error", "Unable to access the server");
      console.error(err);
    });
}
function appendMessage(sender, text) {
  const chat = document.getElementById("chat-messages");
  const div = document.createElement("div");
  div.classList.add("chat-message", sender.toLowerCase());
  div.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}
