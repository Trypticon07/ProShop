const emailInput = document.querySelector("#email-input");
const passwordInput = document.querySelector("#password-input");
const rememberCheck = document.getElementById("rememberCheck");
const captchaWidget = document.querySelector("#recaptcha");

const emailFeedback = document.querySelector("#emailFeedback");
const passwordFeedback = document.querySelector("#passwordFeedback");

const captchaError = document.querySelector("#captchaFeedback");
const checkForm = document.querySelector("#check-form");
const backendResponse = document.querySelector("#backend-response");

import {
  validateEmail,
  validatePassword,
  validateCaptcha,
  setupLiveValidation,
} from "./validation.js";

window.addEventListener("load", () => {
  const interval = setInterval(() => {
    if (window.grecaptcha?.render) {
      clearInterval(interval);
      grecaptcha.render("recaptcha", {
        sitekey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
      });
    }
  }, 100);
});

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

  const fieldsToValidate = [
    setupLiveValidation(emailInput, () =>
      validateEmail(emailInput, emailFeedback),
    ),
    setupLiveValidation(passwordInput, () =>
      validatePassword(passwordInput, passwordFeedback),
    ),
  ];

  Array.from(forms).forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopPropagation();

      let isFormValid = true;
      let firstInvalidInput = null;

      fieldsToValidate.forEach((field) => {
        const isValid = field.forceValidate();

        if (!isValid) {
          isFormValid = false;
          if (!firstInvalidInput) {
            firstInvalidInput = field.element;
          }
        }
      });

      if (!isFormValid) {
        if (firstInvalidInput) {
          firstInvalidInput.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        return;
      }
      const captchaResponse = grecaptcha.getResponse();
      const isCaptchaValid = validateCaptcha(
        captchaResponse,
        captchaError,
        captchaWidget,
      );
      if (!isCaptchaValid) {
        captchaWidget.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      Submit(captchaResponse);
    });
  });
})();

function Submit(captchaToken) {
  axios
    .post(
      `${import.meta.env.VITE_API_URL}/logIn`,
      {
        password: document.querySelector("#password-input").value,
        email: document.querySelector("#email-input").value,
        captcha: captchaToken,
        rememberMe: rememberCheck.checked,
      },
      {
        withCredentials: true,
      },
    )
    .then((response) => {
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
            err,
        );
      }
    });
}
