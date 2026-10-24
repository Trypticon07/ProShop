const usernameInput = document.querySelector("#username-input");
const emailInput = document.querySelector("#email-input");
const passwordInput = document.querySelector("#password-input");
const agreeCheck = document.getElementById("agreeCheck");
const captchaWidget = document.querySelector("#recaptcha");

const usernameFeedback = document.querySelector("#usernameFeedback");
const emailFeedback = document.querySelector("#emailFeedback");
const passwordFeedback = document.querySelector("#passwordFeedback");
const captchaError = document.querySelector("#captchaFeedback");
const agreeFeedback = document.getElementById("agreeFeedback");

const backendResponse = document.querySelector("#backend-response");

import {
  validateUsername,
  validateEmail,
  validatePassword,
  validateAgreeCheck,
  validateCaptcha,
  setupLiveValidation,
} from "./utils/validation.js";
import { submitFormData } from "./utils/submit.js";
import axios from "axios";
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
    setupLiveValidation(usernameInput, () =>
      validateUsername(usernameInput, usernameFeedback),
    ),
    setupLiveValidation(emailInput, () =>
      validateEmail(emailInput, emailFeedback),
    ),
    setupLiveValidation(passwordInput, () =>
      validatePassword(passwordInput, passwordFeedback),
    ),
    setupLiveValidation(agreeCheck, () =>
      validateAgreeCheck(agreeCheck, agreeFeedback),
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
      username: { input: usernameInput, feedback: usernameFeedback },
      email: { input: emailInput, feedback: emailFeedback },
      password: { input: passwordInput, feedback: passwordFeedback },
      captcha: { input: captchaWidget, feedback: captchaError },
    };
    const result = await submitFormData({
      endpoint: "/register",
      payload: {
        username: usernameInput.value,
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
