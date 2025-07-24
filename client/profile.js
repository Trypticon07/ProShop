fetch("http://localhost:3000/profile", {
  credentials: "include",
})
  .then((res) => {
    if (!res.ok) {
      window.location.href = "/logIn.html";
      return;
    }
    return res.text();
  })
  .then((text) => {
    if (text) {
      document.getElementById("welcome").textContent = text;
    }
  })
  .catch((err) => {
    console.error("Ошибка при получении профиля:", err);
    window.location.href = "/logIn.html";
  });
