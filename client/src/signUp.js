const usernameInput = document.querySelector("#username-input");
const emailInput = document.querySelector("#email-input");
const passwordInput = document.querySelector("#password-input");
const agreeCheck = document.getElementById("invalidCheck");

const usernameFeedback = document.querySelector("#usernameFeedback");
const emailFeedback = document.querySelector("#emailFeedback");
const passwordFeedback = document.querySelector("#passwordFeedback");
const captchaError = document.querySelector("#captchaFeedback");
const agreeFeedback = document.getElementById("agreeFeedback");

const backendResponse = document.querySelector("#backend-response");

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

  usernameInput.classList.remove("is-invalid");
  emailInput.classList.remove("is-invalid");
  passwordInput.classList.remove("is-invalid");
  agreeCheck.classList.remove("is-invalid");

  const updateFieldUI = (input, feedback, isValid, msg) => {
    input.classList.toggle("is-valid", isValid);
    input.classList.toggle("is-invalid", !isValid);
    feedback.textContent = isValid ? "" : msg;
    return isValid;
  };

  const checkEmail = () => {
    const email = emailInput.value.trim();

    const isValid =
      email.length >= 6 &&
      email.length <= 64 &&
      email.includes("@") &&
      email.includes(".") &&
      email.indexOf("@") !== 0 &&
      email.lastIndexOf(".") > email.indexOf("@") &&
      email.lastIndexOf(".") < email.length - 1;
    return updateFieldUI(
      emailInput,
      emailFeedback,
      isValid,
      "Please enter a valid email address (6-64 characters, must include @ and .)",
    );
  };

  const checkPassword = () => {
    return updateFieldUI(
      passwordInput,
      passwordFeedback,
      passwordInput.value.trim().length >= 8,
      "Password must be at least 8 characters long.",
    );
  };

  const checkUsername = () => {
    return updateFieldUI(
      usernameInput,
      usernameFeedback,
      usernameInput.value.trim().length >= 3,
      "Username must be at least 3 characters long.",
    );
  };

  const checkAgreeCheck = () => {
    return updateFieldUI(
      agreeCheck,
      agreeFeedback,
      agreeCheck.checked,
      "You must agree before submitting.",
    );
  };

  usernameInput.addEventListener("input", checkUsername);
  emailInput.addEventListener("input", checkEmail);
  passwordInput.addEventListener("input", checkPassword);
  agreeCheck.addEventListener("change", checkAgreeCheck);

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
      const isValidUsername = checkUsername();
      const isValidEmail = checkEmail();
      const isValidPassword = checkPassword();
      const isValidAgreeCheckBox = checkAgreeCheck();
      if (
        !isValidEmail ||
        !isValidPassword ||
        !isValidUsername ||
        !captchaResponse ||
        !isValidAgreeCheckBox
      )
        return;
      Submit(captchaResponse);
    });
  });
})();

function Submit(captchaToken) {
  axios
    .post(
      `${import.meta.env.VITE_API_URL}/register`,
      {
        username: document.querySelector("#username-input").value,
        password: document.querySelector("#password-input").value,
        email: document.querySelector("#email-input").value,
        captcha: captchaToken,
        agreeCheck: agreeCheck.checked,
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
      if (status === 400) {
        if (res?.isInvalid) {
          if (res.field === "email") {
            emailInput.classList.add("is-invalid");
            emailFeedback.textContent = res.error;
          } else if (res?.field === "password") {
            passwordInput.classList.add("is-invalid");
            passwordFeedback.textContent = res.error;
          } else if (res?.field === "username") {
            usernameInput.classList.add("is-invalid");
            usernameFeedback.textContent = res.error;
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
