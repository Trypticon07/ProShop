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
} from "./utils/validation.js";
import axios from "axios";
import { submitFormData } from "./utils/submit.js";
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
  const form = document.querySelector(".needs-validation");

  const fieldsToValidate = [
    setupLiveValidation(emailInput, () =>
      validateEmail(emailInput, emailFeedback),
    ),
    setupLiveValidation(passwordInput, () =>
      validatePassword(passwordInput, passwordFeedback),
    ),
  ];

  form.addEventListener("submit", async (event) => {
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
    if (captchaResponse) {
      grecaptcha.reset();
    }
    const isCaptchaValid = validateCaptcha(
      captchaResponse,
      captchaError,
      captchaWidget,
    );
    if (!isCaptchaValid) {
      captchaWidget.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const fieldMap = {
      email: { input: emailInput, feedback: emailFeedback },
      password: { input: passwordInput, feedback: passwordFeedback },
      captcha: { input: captchaWidget, feedback: captchaError },
    };
    const result = await submitFormData({
      endpoint: "/logIn",
      payload: {
        email: emailInput.value,
        password: passwordInput.value,
        captcha: captchaResponse,
      },
      fieldMap: fieldMap,
      backendResponseEl: backendResponse,
    });
    if (result.success) {
      window.location.href = "index.html";
    }
  });
})();
