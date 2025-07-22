const usernameInput = document.querySelector("#username-input");
const emailInput = document.querySelector("#email-input");
const passwordInput = document.querySelector("#password-input");

const usernameFeedback = document.querySelector("#usernameFeedback");
const emailFeedback = document.querySelector("#emailFeedback");
const passwordFeedback = document.querySelector("#passwordFeedback");
const captchaError = document.querySelector("#captchaFeedback");

const backendResponse = document.querySelector("#backend-response");

let isValidEmail = false;
let isValidPassword = false;
let isValidUsername = false;
(() => {
  const forms = document.querySelectorAll(".needs-validation");

  usernameInput.classList.remove("is-invalid");
  emailInput.classList.remove("is-invalid");
  passwordInput.classList.remove("is-invalid");

  usernameInput.addEventListener("input", () => {
    const username = usernameInput.value.trim();

    if (username.length < 3) {
      usernameInput.classList.remove("is-valid");
      usernameInput.classList.add("is-invalid");
      usernameFeedback.textContent =
        "Username must be at least 3 characters long.";
    } else {
      usernameInput.classList.remove("is-invalid");
      usernameInput.classList.add("is-valid");
      usernameFeedback.textContent = "";
      isValidUsername = true;
    }
  });

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
      if (
        !isValidEmail ||
        !isValidPassword ||
        !isValidUsername ||
        !captchaResponse
      )
        return;
      Submit(captchaResponse);
    });
  });
})();

function Submit(captchaToken) {
  axios
    .post("http://localhost:3000/register", {
      username: document.querySelector("#username-input").value,
      password: document.querySelector("#password-input").value,
      email: document.querySelector("#email-input").value,
      captcha: captchaToken,
    })
    .then((response) => {
      console.log(response.data);
      window.location.href = "index.html";
    })
    .catch((err) => {
      const res = err.response.data;
      const status = err.response?.status;
      console.log(res);
      console.log(status);
      console.log(res.field);
      console.log(res.error);
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
            err
        );
      }
    });
}
