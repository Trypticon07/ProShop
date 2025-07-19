(() => {
  const forms = document.querySelectorAll('.needs-validation');

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
        event.preventDefault();
        event.stopPropagation();

        const emailInput = document.querySelector("#email-input");
        const passwordInput = document.querySelector("#password-input");

        const emailFeedback = document.querySelector("#emailFeedback");
        const passwordFeedback = document.querySelector("#passwordFeedback");

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        let isValid = true;

        emailInput.classList.remove("is-invalid");
        passwordInput.classList.remove("is-invalid");

        // Password: at least 8 characters long
        if (password.length < 8) {
            passwordInput.classList.remove("is-valid");
            passwordInput.classList.add("is-invalid");
            passwordFeedback.textContent = "Password must be at least 8 characters long";
            isValid = false;
        }

        if (
            email.length < 6 ||
            email.length > 64 ||
            !email.includes("@") ||
            !email.includes(".") ||
            email.indexOf("@") === 0 ||
            email.lastIndexOf(".") < email.indexOf("@")  // There must be "." after "@" sign
        ) {
            emailInput.classList.remove("is-valid");
            emailInput.classList.add("is-invalid");
            emailFeedback.textContent = "Please enter a valid email address.";
            isValid = false;
        }
        const captchaResponse = grecaptcha.getResponse();
        if (!captchaResponse) {
          alert("Please confirm that you are not a robot.");
          isValid = false;
        }

        if (!isValid) {
            form.classList.add("was-validated");
            return;
        }

        form.classList.add("was-validated");
        Submit(captchaResponse);
    });
  });
})();

function Submit(captchaToken) {
  const invalidEmailOrPassword = document.querySelector("#invalid-email-or-password")
  axios
    .post("http://localhost:3000/logIn", {
      password: document.querySelector("#password-input").value,
      email: document.querySelector("#email-input").value,
      captcha: captchaToken,
    })
    .then((response) => {
      console.log(response.data);
      window.location.href = "index.html";
    })
    .catch((err) => {
      if (err.response && err.response.status === 401){
        invalidEmailOrPassword.textContent = "Invalid email or password"
        invalidEmailOrPassword.classList.remove("d-none")
        invalidEmailOrPassword.classList.add("d-block")
      } else {
        console.log("Error while waiting for server responce: " + err);
        alert("There was an error while trying to sing-up, please try again. If the issue presists inform the owner of the site about the issue and provide them with this info: " + err);
      }


    });
}