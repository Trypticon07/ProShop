const emailInput = document.querySelector("#email-input");
const passwordInput = document.querySelector("#password-input");
const rememberCheck = document.getElementById("rememberCheck");

const emailFeedback = document.querySelector("#emailFeedback");
const passwordFeedback = document.querySelector("#passwordFeedback");

const captchaError = document.querySelector("#captchaFeedback");
const checkForm = document.querySelector("#check-form");
const backendResponse = document.querySelector("#backend-response");

let isValidEmail = false;
let isValidPassword = false;

document
  .getElementById("togglePassword")
  .addEventListener("click", function () {
    const passwordInput = document.getElementById("password-input");
    const icon = document.getElementById("toggleIcon");
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    icon.className = isHidden ? "bi bi-eye-slash-fill" : "bi bi-eye-fill";
  });

(() => {
  const forms = document.querySelectorAll(".needs-validation");

  emailInput.classList.remove("is-invalid");
  passwordInput.classList.remove("is-invalid");

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
  passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;

    if (password.length < 8) {
      passwordInput.classList.remove("is-valid");
      passwordInput.classList.add("is-invalid");
      passwordFeedback.textContent =
        "Password must be at least 8 characters long.";
    } else {
      passwordInput.classList.remove("is-invalid");
      passwordInput.classList.add("is-valid");
      passwordFeedback.textContent = "";
      isValidPassword = true;
    }
  });
  Array.from(forms).forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const captchaResponse = grecaptcha.getResponse();
      if (captchaResponse) {
        grecaptcha.reset();
      }
      if (!captchaResponse) {
        captchaError.textContent = "Please confirm that you are not a robot.";
        captchaError.classList.remove("d-none");
        captchaError.classList.add("d-block");
      }

      if (!isValidEmail || !isValidPassword || !captchaResponse) return;

      checkForm.classList.remove("form-invalid");
      checkForm.classList.add("form-valid");
      Submit(captchaResponse);
    });
  });
})();

function Submit(captchaToken) {
  axios
    .post(
      "http://localhost:3000/logIn",
      {
        password: document.querySelector("#password-input").value,
        email: document.querySelector("#email-input").value,
        captcha: captchaToken,
        rememberMe: rememberCheck.checked,
      },
      {
        withCredentials: true,
      }
    )
    .then((response) => {
      console.log(response.data);
      window.location.href = "index.html";
    })
    .catch((err) => {
      const res = err.response.data;
      const status = err.response?.status;
      if (status === 401) {
        backendResponse.textContent = "Invalid email or password";
        backendResponse.classList.remove("d-none");
        backendResponse.classList.add("d-block");
        checkForm.classList.remove("form-valid");
        checkForm.classList.add("form-invalid");
      } else if (status === 400) {
        if (res?.isInvalid) {
          if (res.field === "email") {
            emailInput.classList.add("is-invalid");
            emailFeedback.textContent = res.error;
          } else if (res?.field === "password") {
            passwordInput.classList.add("is-invalid");
            passwordFeedback.textContent = res.error;
          } else if (res?.field === "captcha") {
            captchaError.textContent = res.error;
            captchaError.classList.remove("d-none");
            captchaError.classList.add("d-block");
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
          "There was an error while trying to log in. If this keeps happening, inform the site owner with this info: " +
            err
        );
      }
    });
}
