fetch("http://localhost:3000/profile", {
  credentials: "include",
})
  .then((res) => {
    if (!res.ok) {
      window.location.href = "/client/logIn.html";
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
    console.error("Error while getting profile info:", err);
    window.location.href = "/client/logIn.html";
  });
