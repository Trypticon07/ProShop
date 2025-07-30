const sendBtn = document.getElementById("send-btn");
let isProcessing = false;
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
fetch("http://localhost:3000/session", {
  credentials: "include",
})
  .then((res) => {
    if (!res.ok) {
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

sendBtn.addEventListener("click", () => {
  sendMessage();
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
