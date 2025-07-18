(() => {
  const forms = document.querySelectorAll('.needs-validation');

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
        event.preventDefault();
        event.stopPropagation();

        // Get elements and values
        const usernameInput = document.querySelector("#username-input");
        const emailInput = document.querySelector("#email-input");
        const passwordInput = document.querySelector("#password-input");

        const usernameFeedback = document.querySelector("#usernameFeedback");
        const emailFeedback = document.querySelector("#emailFeedback");
        const passwordFeedback = document.querySelector("#passwordFeedback");

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        let isValid = true;

        // Reset previous errors
        usernameInput.classList.remove("is-invalid");
        emailInput.classList.remove("is-invalid");
        passwordInput.classList.remove("is-invalid");

        // Username: 4-31 characters
        if (username.length < 3 || username.length > 32) {
            usernameInput.classList.remove("is-valid");
            usernameInput.classList.add("is-invalid");
            usernameFeedback.textContent = "Username must be between 4 and 31 characters including both.";
            isValid = false;
        }

        // Password: 9-31 characters
        if (password.length < 8 || password.length > 32) {
            passwordInput.classList.remove("is-valid");
            passwordInput.classList.add("is-invalid");
            passwordFeedback.textContent = "Password must be between 7 and 31 characters including both.";
            isValid = false;
        }

        // Email: simple check
        if (
            email.length < 6 ||
            email.length > 64 ||
            !email.includes("@") ||
            !email.includes(".") ||
            email.indexOf("@") === 0 ||
            email.lastIndexOf(".") < email.indexOf("@")  // There must be "." after "@" sign
        ) {
            // Invalid email
            emailInput.classList.remove("is-valid");
            emailInput.classList.add("is-invalid");
            emailFeedback.textContent = "Please enter a valid email address.";
            isValid = false;
        }

        if (!isValid) {
            form.classList.add("was-validated");
            return; // stop submit
        }

        form.classList.add("was-validated");
        Submit();
    });
  });
})();

function Submit() {
  axios
    .post("http://localhost:3000/register", {
      username: document.querySelector("#username-input").value,
      password: document.querySelector("#password-input").value,
      email: document.querySelector("#email-input").value,
    })
    .then((response) => {
      console.log(response.data);
      window.location.href = "index.html";
    })
    .catch((err) => {
      console.log("Error while waiting for server responce: " + err);
      alert("There was an error while trying to sing-up, please try again. If the issue presists inform the owner of the site about the issue and provide them with this info: " + err);
    });
}
