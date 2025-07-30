const sendBtn = document.getElementById("send-btn");
let isProcessing = false;

const lightBtn = document.getElementById("light-btn");
const darkBtn = document.getElementById("dark-btn");
const systemBtn = document.getElementById("system-btn");

document.querySelector("#signUp").addEventListener("click", () => {
  window.location.href = "signUp.html";
});

document.querySelector("#logIn").addEventListener("click", () => {
  window.location.href = "logIn.html";
});

document.getElementById("open-chat-btn").addEventListener("click", () => {
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

sendBtn.addEventListener("click", () => {
  sendMessage();
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
      document.getElementById("logInButtons").classList.remove("d-none");
      return;
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
    //alrert("Ошибка при получении сессии:", err);
    //window.location.href = "/client/logIn.html";
  });

fetch("http://localhost:3000/chat/history", {
  credentials: "include",
})
  .then((res) => res.json())
  .then((messages) => {
    messages.forEach((msg) => {
      appendMessage(msg.sender === "user" ? "You" : "Bot", msg.message);
    });
  })
  .catch((err) => {
    console.error("Error loading history:", err);
  });

// Send message on Enter key press
const userInput = document.querySelector("#user-message");
userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !isProcessing) {
    event.preventDefault(); // Prevent form submission or newline (if any)
    sendMessage();
  }
});
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
