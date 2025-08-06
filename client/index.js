const sendBtn = document.getElementById("send-btn");
const userInput = document.querySelector("#user-message");
let isProcessing = false;

const lightBtn = document.getElementById("light-btn");
const darkBtn = document.getElementById("dark-btn");
const systemBtn = document.getElementById("system-btn");

const logOutButtons = document.querySelectorAll(".logOut");
const profileButtons = document.querySelectorAll(".profileBtn");
const catalogButtons = document.querySelectorAll(".catalogBtn");

const form = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");

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
    window.location.href = "catalog.html";
  });
});

document.querySelector("#signUp").addEventListener("click", () => {
  window.location.href = "signUp.html";
});

document.querySelector("#logIn").addEventListener("click", () => {
  window.location.href = "logIn.html";
});

document.getElementById("open-chat-btn").addEventListener("click", () => {
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
// searchInput.addEventListener("keydown", function (event) {
//   if (event.key === "Enter" && !isProcessing) {
//     event.preventDefault();
//     sendMessage();
//   }
// });

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
      document.getElementById("logInButtons").classList.remove("d-none");
      document.getElementById("profileDropdown").classList.add("d-none");
      return null;
    }
    return res.json();
  })
  .then((data) => {
    if (data && data.loggedIn) {
      document.getElementById("logInButtons").classList.add("d-none");
      document.getElementById("profileDropdown").classList.remove("d-none");
    }
  })
  .catch((err) => {
    console.log("error: " + err);
    console.error("Session error:", err);
    document.getElementById("logInButtons").classList.remove("d-none");
    document.getElementById("profileDropdown").classList.add("d-none");
  });

fetch("http://localhost:3000/products")
  .then((res) => res.json())
  .then((products) => {
    const container = document.getElementById("product-container");
    products.forEach((product) => {
      const col = document.createElement("div");
      col.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";

      const card = document.createElement("div");
      card.className = "card h-100";

      card.innerHTML = `
        <img src="${
          product.image_url || "images/png/projectImage.png"
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
        <div class="product-price text-dark"></div>
          <button class="btn btn-primary btn-sm d-flex align-items-center buyBtn">
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
  })
  .catch((err) => {
    console.error("Error loading products:", err);
  });

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // prevent page reload on form submit
  const query = searchInput.value.trim();
  if (!query) {
    resultsDiv.innerHTML = "<p>Please enter a search query.</p>";
    return;
  }

  try {
    // call backend search API
    const response = await fetch(
      `http://localhost:3000/products/search?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      resultsDiv.innerHTML = `<p>Error: ${response.statusText}</p>`;
      return;
    }
    const products = await response.json();

    if (products.length === 0) {
      resultsDiv.innerHTML = "<p>No products found.</p>";
      return;
    }

    // display results
    resultsDiv.innerHTML = products
      .map(
        (product) => `
          <div style="border:1px solid #ccc; margin-bottom: 10px; padding: 10px;">
            <h3>${product.name}</h3>
            <p>${product.description || "No description"}</p>
            <p>Price: ${product.price}</p>
            <p>Stock: ${product.stock}</p>
          </div>
        `
      )
      .join("");
  } catch (error) {
    resultsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  }
});

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
  //div.textContent = `${sender}: ${text}`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}
