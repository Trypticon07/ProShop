const sendBtn = document.getElementById("send-btn");
const userInput = document.querySelector("#user-message");

const container = document.getElementById("product-container");

const chatBtn = document.getElementById("open-chat-btn");

const emailInput = document.querySelector("#main-email-input");

const subscribeBtn = document.getElementById("subscribe-btn");

const emailFeedback = document.querySelector("#emailFeedback");
const validEmailFeedback = document.getElementById("validEmailFeedback");
const backendResponse = document.querySelector(".backend-response");
import {
  footer,
  alertContainer,
  amountInCart,
  cartTotal,
  openPopoverBtn,
  checkoutBtn,
  session,
} from "./common.js";

let isProcessing = false;

let isValidEmail = false;

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
    .post(`${import.meta.env.VITE_API_URL}/subscribe`, {
      email: document.querySelector("#main-email-input").value,
    })
    .then((response) => {
      emailInput.disabled = true;
      subscribeBtn.classList.add("disabled");
      validEmailFeedback.classList.remove("d-none");
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
            err,
        );
      }
    });
}

document.getElementById("close-chat").addEventListener("click", () => {
  document.getElementById("chat-box").style.display = "none";
});

chatBtn.addEventListener("click", () => {
  getChatHistory();
  const chatBox = document.getElementById("chat-box");
  chatBox.style.display = chatBox.style.display === "flex" ? "none" : "flex";
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

window.addEventListener("scroll", () => {
  const footerRect = footer.getBoundingClientRect();
  const overlap = window.innerHeight - footerRect.top;

  if (overlap > 0) {
    chatBtn.style.bottom = `${1 + overlap}px`;
  } else {
    chatBtn.style.bottom = "20px";
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get("search");
  const catalog = params.get("catalog");

  if (searchQuery) {
    searchInput.value = searchQuery.trim();
    await search(searchQuery);
    const productContainer = document.getElementById("product-container");
    if (productContainer) {
      productContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }

  if (catalog) {
    await getProducts();
    const productContainer = document.getElementById("product-container");
    if (productContainer) {
      productContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }

  getProducts();
});

async function getProducts() {
  await fetch(`${import.meta.env.VITE_API_URL}/products`)
    .then((res) => res.json())
    .then(async (products) => {
      await appendProduct(products);
    })
    .catch((err) => {
      console.error("Error loading products:", err);
    });
}

async function search(query) {
  if (!query) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/products/search?q=${encodeURIComponent(query)}`,
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
    await appendProduct(products);
  } catch (error) {
    container.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

async function appendProduct(products) {
  container.innerHTML = "";
  products.forEach((product) => {
    let image_src = "";
    if (product.image_urls) {
      const imageArray = product.image_urls.replace(/[{}]/g, "").split(",");
      image_src = "images/" + imageArray[0];
    }
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";

    const card = document.createElement("div");
    card.className = "card h-100";

    card.innerHTML = `
        <img src="${
          image_src || "images/projectImage.png"
        }" class="card-img-top" alt="images/projectImage.png">
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
    // TODO: add price validation maximum of 10 digits in total of which 2 are after the decimal point.
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
      Buy(btn);
    });
  });
}

function Buy(btn) {
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
        0,
      );
      amountInCart.classList.remove("d-none");
      cartTotal.classList.remove("d-none");
      openPopoverBtn.classList.remove("d-none");
      checkoutBtn.classList.remove("d-none");
      if (session) {
        addToCart(productId, quantity);
      }
    })
    .catch((err) => console.error("Error loading product:", err));
}

function getChatHistory() {
  fetch(`${import.meta.env.VITE_API_URL}/chat/history`, {
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

function sendMessage() {
  const input = document.getElementById("user-message");
  const message = input.value.trim();
  if (!message) return;

  appendMessage("You", message);
  input.value = "";
  sendBtn.disabled = true;
  isProcessing = true;

  const typingElement = appendMessage("Bot", "Typing...");

  fetch(`${import.meta.env.VITE_API_URL}/chat`, {
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
